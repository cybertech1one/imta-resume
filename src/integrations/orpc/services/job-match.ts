import { ORPCError } from "@orpc/client";
import { and, desc, eq } from "drizzle-orm";
import { schema } from "@/integrations/drizzle";
import { db } from "@/integrations/drizzle/client";
import type { JobMatchResult, JobMatchSuggestion } from "@/integrations/drizzle/schema";
import { generateId } from "@/utils/string";

// Common job-related keywords by category
const commonKeywords: Record<string, string[]> = {
	technical: [
		"JavaScript",
		"TypeScript",
		"Python",
		"Java",
		"React",
		"Node.js",
		"SQL",
		"AWS",
		"Docker",
		"Kubernetes",
		"Git",
		"CI/CD",
		"REST API",
		"GraphQL",
		"MongoDB",
		"PostgreSQL",
		"Redis",
		"Machine Learning",
		"Data Analysis",
		"Cloud Computing",
		"DevOps",
		"Agile",
		"Scrum",
	],
	soft: [
		"Communication",
		"Leadership",
		"Team Player",
		"Problem Solving",
		"Critical Thinking",
		"Time Management",
		"Adaptability",
		"Creativity",
		"Collaboration",
		"Initiative",
		"Attention to Detail",
		"Organization",
		"Flexibility",
		"Self-motivation",
	],
	healthcare: [
		"Patient Care",
		"Clinical Skills",
		"Medical Records",
		"HIPAA",
		"Nursing",
		"First Aid",
		"Emergency Response",
		"Healthcare Management",
		"Patient Safety",
		"Infection Control",
		// French vocational medical keywords so French job descriptions match (IMTA nurse/aide-soignant programs)
		"soins aux patients",
		"soins infirmiers",
		"hygiène",
		"asepsie",
		"constantes vitales",
		"pansements",
		"perfusion",
		"dossier de soins",
	],
	industrial: [
		"Maintenance",
		"Quality Control",
		"Safety Protocols",
		"Equipment Operation",
		"Troubleshooting",
		"Preventive Maintenance",
		"Technical Drawings",
		"Welding",
		"CNC",
		"PLC",
		// French vocational industrial keywords (IMTA welder/cariste/maintenance programs)
		"soudure",
		"CACES",
		"sécurité",
		"maintenance",
		"cariste",
		"conduite d'engins",
	],
	management: [
		"Project Management",
		"Budget Management",
		"Team Leadership",
		"Strategic Planning",
		"Performance Management",
		"Stakeholder Management",
		"Resource Allocation",
		"KPIs",
	],
};

// Extract keywords from text
function extractKeywords(text: string): string[] {
	const normalizedText = text.toLowerCase();
	const allKeywords = Object.values(commonKeywords).flat();
	const found: string[] = [];

	for (const keyword of allKeywords) {
		if (normalizedText.includes(keyword.toLowerCase())) {
			found.push(keyword);
		}
	}

	// Extract additional patterns (years of experience, education, etc.)
	const experiencePattern = /(\d+)\+?\s*(?:years?|ans?)\s*(?:of\s*)?(?:experience|d'exp[ée]rience)?/gi;
	const degreePattern = /(?:bachelor|master|phd|licence|bac\+\d|ing[ée]nieur|dipl[ôo]me)/gi;

	const experienceMatches = text.match(experiencePattern);
	const degreeMatches = text.match(degreePattern);

	if (experienceMatches) {
		found.push(...experienceMatches.map((m) => m.trim()));
	}
	if (degreeMatches) {
		found.push(...degreeMatches.map((m) => m.trim()));
	}

	return [...new Set(found)];
}

// Deterministically estimate years of experience from a resume's experience items.
// Parses each item's `period` string (e.g. "2019 - 2023", "March 2022 - Present", "2021 - 2023")
// into a real month span and sums them. Unparseable items fall back to a conservative
// 1 year/entry (not 2) so we never overstate a candidate's experience.
function estimateExperienceYears(
	resumeExperience: Array<{ position: string; company: string; description: string; period: string }>,
): number {
	const MONTH_NAMES =
		/jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|janv|févr|fevr|mars|avr|mai|juin|juil|août|aout|sept|déc|dec/i;

	// Extract a year (and optional month) from a date fragment like "March 2022" or "2019".
	function parseFragment(fragment: string): { year: number; month: number } | null {
		const yearMatch = fragment.match(/\b(19|20)\d{2}\b/);
		if (!yearMatch) return null;
		const year = Number.parseInt(yearMatch[0], 10);
		// Default to mid-year (month index 6) when no month is present so spans average out fairly.
		let month = 6;
		const monthMatch = fragment.match(MONTH_NAMES);
		if (monthMatch) {
			const monthMap: Record<string, number> = {
				jan: 0,
				janv: 0,
				feb: 1,
				févr: 1,
				fevr: 1,
				mar: 2,
				mars: 2,
				apr: 3,
				avr: 3,
				may: 4,
				mai: 4,
				jun: 5,
				juin: 5,
				jul: 6,
				juil: 6,
				aug: 7,
				août: 7,
				aout: 7,
				sep: 8,
				sept: 8,
				oct: 9,
				nov: 10,
				dec: 11,
				déc: 11,
			};
			const key = monthMatch[0].toLowerCase();
			if (monthMap[key] !== undefined) month = monthMap[key];
		}
		return { year, month };
	}

	let totalMonths = 0;
	for (const exp of resumeExperience) {
		const period = (exp.period || "").trim();
		// Split on common range separators (hyphen, en/em dash, "to", "à").
		const parts = period.split(/\s*(?:[-–—]|to|à|jusqu'à)\s*/i).filter(Boolean);
		const start = parts[0] ? parseFragment(parts[0]) : null;
		let end: { year: number; month: number } | null = null;
		if (parts[1]) {
			// "Present"/"Actuel"/"En cours" → use current date as the end.
			if (/present|actuel|en cours|aujourd|current|now/i.test(parts[1])) {
				const now = new Date();
				end = { year: now.getFullYear(), month: now.getMonth() };
			} else {
				end = parseFragment(parts[1]);
			}
		}

		if (start && end) {
			const months = (end.year - start.year) * 12 + (end.month - start.month);
			// Guard against malformed/reversed ranges → conservative 1 year for the entry.
			totalMonths += months > 0 ? months : 12;
		} else if (start && !end) {
			// Single date present (e.g. just a start) → assume 1 year for that role.
			totalMonths += 12;
		} else {
			// Unparseable period → conservative 1 year/entry fallback.
			totalMonths += 12;
		}
	}

	// Round to one decimal so the value is stable and defensible.
	return Math.round((totalMonths / 12) * 10) / 10;
}

// Calculate match score between job description and resume
function calculateMatchScore(
	jobDescription: string,
	resumeSkills: Array<{ name: string; level: number }>,
	resumeExperience: Array<{ position: string; company: string; description: string; period: string }>,
	resumeSummary: string,
): JobMatchResult {
	const resumeSkillNames = resumeSkills.map((s) => s.name);
	const jobKeywords = extractKeywords(jobDescription);
	// Combined lowercased resume text used for keyword/skill-context matching.
	const resumeText = [
		resumeSummary,
		...resumeSkillNames,
		...resumeExperience.map((e) => `${e.position} ${e.company} ${e.description}`),
	]
		.join(" ")
		.toLowerCase();

	// Keyword matching
	const matchedKeywords: string[] = [];
	const missingKeywords: string[] = [];
	const partialKeywords: string[] = [];

	for (const keyword of jobKeywords) {
		const keywordLower = keyword.toLowerCase();
		if (resumeText.includes(keywordLower)) {
			matchedKeywords.push(keyword);
		} else {
			// Check for partial matches (similar words)
			const hasPartial = resumeSkillNames.some(
				(skill) =>
					skill.toLowerCase().includes(keywordLower.substring(0, 4)) ||
					keywordLower.includes(skill.toLowerCase().substring(0, 4)),
			);
			if (hasPartial) {
				partialKeywords.push(keyword);
			} else {
				missingKeywords.push(keyword);
			}
		}
	}

	const keywordScore =
		jobKeywords.length > 0
			? Math.round(((matchedKeywords.length + partialKeywords.length * 0.5) / jobKeywords.length) * 100)
			: 50;

	// Skills alignment.
	// Deterministic resume skill level derived from real resume data (no Math.random):
	// use the skill's own `level` (1-5) when set (>0); otherwise default to 3 and add +1
	// (capped at 5) when the skill is mentioned in an experience or summary description.
	const jobDescriptionLower = jobDescription.toLowerCase();
	const matchedSkills = resumeSkills
		.filter((skill) => jobDescriptionLower.includes(skill.name.toLowerCase()))
		.map((skill) => {
			let resumeLevel: number;
			if (skill.level > 0) {
				resumeLevel = skill.level;
			} else {
				// Infer when no explicit level: base 3, +1 if the skill appears in experience/summary text.
				const mentioned = resumeText.includes(skill.name.toLowerCase());
				resumeLevel = Math.min(5, mentioned ? 4 : 3);
			}
			return {
				skill: skill.name,
				resumeLevel,
				requiredLevel: "intermediate" as const,
				match: "exact" as const,
			};
		});

	const missingSkills = jobKeywords
		.filter((k) => !resumeSkillNames.some((s) => s.toLowerCase().includes(k.toLowerCase())))
		.slice(0, 5);

	const additionalSkills = resumeSkillNames.filter((s) => !jobDescriptionLower.includes(s.toLowerCase())).slice(0, 5);

	const skillsScore =
		matchedSkills.length > 0
			? Math.min(100, Math.round((matchedSkills.length / Math.max(jobKeywords.length, 5)) * 100))
			: 30;

	// Experience comparison
	const experienceMatch = jobDescription.match(/(\d+)\+?\s*(?:years?|ans?)/i);
	const requiredYears = experienceMatch ? Number.parseInt(experienceMatch[1], 10) : 3;
	// Deterministic, real-duration estimate from parsed experience periods
	// (conservative 1 year/entry fallback when a period cannot be parsed).
	const candidateYears = estimateExperienceYears(resumeExperience);

	const relevantExperience = resumeExperience
		.filter((e) => {
			const expText = `${e.position} ${e.description}`.toLowerCase();
			return jobKeywords.some((k) => expText.includes(k.toLowerCase()));
		})
		.map((e) => e.position);

	const experienceGaps: string[] = [];
	if (candidateYears < requiredYears) {
		// Round the shortfall up for a clean, defensible message.
		experienceGaps.push(`${Math.ceil(requiredYears - candidateYears)} additional years of experience required`);
	}
	if (relevantExperience.length === 0) {
		experienceGaps.push("No directly relevant experience found");
	}

	const experienceScore = Math.min(100, Math.round((candidateYears / Math.max(requiredYears, 1)) * 100));

	// Generate suggestions
	const suggestions: JobMatchSuggestion[] = [];

	if (missingKeywords.length > 0) {
		suggestions.push({
			id: generateId(),
			category: "keyword",
			priority: "high",
			title: "Add missing keywords",
			description: `Include these terms in your resume: ${missingKeywords.slice(0, 3).join(", ")}`,
			actionable: true,
		});
	}

	if (missingSkills.length > 0) {
		suggestions.push({
			id: generateId(),
			category: "skill",
			priority: "high",
			title: "Skills to develop",
			description: `Consider acquiring: ${missingSkills.slice(0, 3).join(", ")}`,
			actionable: true,
		});
	}

	if (candidateYears < requiredYears) {
		suggestions.push({
			id: generateId(),
			category: "experience",
			priority: "medium",
			title: "Highlight your experience",
			description: "Provide more detail on your projects and achievements to compensate for fewer years of experience",
			actionable: true,
		});
	}

	if (matchedKeywords.length < 5) {
		suggestions.push({
			id: generateId(),
			category: "content",
			priority: "medium",
			title: "Optimize your summary",
			description: "Rephrase your professional summary to include more terms from the job posting",
			actionable: true,
		});
	}

	suggestions.push({
		id: generateId(),
		category: "content",
		priority: "low",
		title: "Customize your cover letter",
		description: "Specifically mention why you are interested in this company",
		actionable: true,
	});

	// Calculate overall score
	const overallScore = Math.round(keywordScore * 0.35 + skillsScore * 0.35 + experienceScore * 0.3);

	// Missing requirements
	const missingRequirements = [
		...missingKeywords.slice(0, 3),
		...missingSkills.slice(0, 2),
		...(candidateYears < requiredYears ? [`${requiredYears}+ years of experience`] : []),
	];

	return {
		overallScore,
		keywordMatch: {
			score: keywordScore,
			matched: matchedKeywords,
			missing: missingKeywords,
			partial: partialKeywords,
		},
		skillsAlignment: {
			score: skillsScore,
			matched: matchedSkills,
			missing: missingSkills,
			additional: additionalSkills,
		},
		experienceComparison: {
			score: experienceScore,
			requiredYears,
			candidateYears,
			relevantExperience,
			gaps: experienceGaps,
		},
		missingRequirements,
		suggestions,
		analyzedAt: new Date().toISOString(),
	};
}

// Types for service inputs
export type CreateSavedJobInput = {
	userId: string;
	title: string;
	company: string;
	description: string;
};

export type UpdateSavedJobInput = {
	id: string;
	userId: string;
	title?: string;
	company?: string;
	description?: string;
	lastScore?: number;
	lastAnalyzedAt?: Date;
};

export type AnalyzeJobMatchInput = {
	userId: string;
	resumeId: string;
	jobTitle: string;
	company: string;
	jobDescription: string;
	savedJobId?: string;
};

export const jobMatchService = {
	// Create a saved job description
	createSavedJob: async (input: CreateSavedJobInput): Promise<string> => {
		const id = generateId();

		await db.insert(schema.savedJobDescription).values({
			id,
			userId: input.userId,
			title: input.title,
			company: input.company,
			description: input.description,
		});

		return id;
	},

	// Get saved job by ID
	getSavedJobById: async (input: { id: string; userId: string }) => {
		const [job] = await db
			.select()
			.from(schema.savedJobDescription)
			.where(and(eq(schema.savedJobDescription.id, input.id), eq(schema.savedJobDescription.userId, input.userId)));

		if (!job) {
			throw new ORPCError("NOT_FOUND", { message: "Saved job not found" });
		}

		return job;
	},

	// List saved jobs
	listSavedJobs: async (input: { userId: string; limit?: number; offset?: number }) => {
		return await db
			.select()
			.from(schema.savedJobDescription)
			.where(eq(schema.savedJobDescription.userId, input.userId))
			.orderBy(desc(schema.savedJobDescription.createdAt))
			.limit(input.limit ?? 20)
			.offset(input.offset ?? 0);
	},

	// Update saved job
	updateSavedJob: async (input: UpdateSavedJobInput): Promise<void> => {
		const [existing] = await db
			.select({ id: schema.savedJobDescription.id })
			.from(schema.savedJobDescription)
			.where(and(eq(schema.savedJobDescription.id, input.id), eq(schema.savedJobDescription.userId, input.userId)));

		if (!existing) {
			throw new ORPCError("NOT_FOUND", { message: "Saved job not found" });
		}

		await db
			.update(schema.savedJobDescription)
			.set({
				title: input.title,
				company: input.company,
				description: input.description,
				lastScore: input.lastScore,
				lastAnalyzedAt: input.lastAnalyzedAt,
			})
			.where(and(eq(schema.savedJobDescription.id, input.id), eq(schema.savedJobDescription.userId, input.userId)));
	},

	// Delete saved job
	deleteSavedJob: async (input: { id: string; userId: string }): Promise<void> => {
		await db
			.delete(schema.savedJobDescription)
			.where(and(eq(schema.savedJobDescription.id, input.id), eq(schema.savedJobDescription.userId, input.userId)));
	},

	// Analyze job match
	analyzeJobMatch: async (input: AnalyzeJobMatchInput) => {
		// Get the resume data
		const [resume] = await db
			.select()
			.from(schema.resume)
			.where(and(eq(schema.resume.id, input.resumeId), eq(schema.resume.userId, input.userId)));

		if (!resume) {
			throw new ORPCError("NOT_FOUND", { message: "Resume not found" });
		}

		// Extract resume data
		const resumeData = resume.data;
		// Pass skill name + level so scoring can derive a deterministic resume level (no Math.random).
		const resumeSkills = resumeData.sections.skills.items
			.filter((s) => s.name)
			.map((s) => ({ name: s.name, level: s.level ?? 0 }));
		const resumeExperience = resumeData.sections.experience.items.map((e) => ({
			position: e.position || "",
			company: e.company || "",
			description: e.description || "",
			period: e.period || "",
		}));
		const resumeSummary = resumeData.summary.content || "";

		// Calculate match
		const result = calculateMatchScore(input.jobDescription, resumeSkills, resumeExperience, resumeSummary);

		// Save to analysis history
		const analysisId = generateId();
		await db.insert(schema.jobMatchAnalysis).values({
			id: analysisId,
			userId: input.userId,
			savedJobId: input.savedJobId || null,
			resumeId: input.resumeId,
			resumeName: resume.name,
			jobTitle: input.jobTitle,
			company: input.company,
			jobDescription: input.jobDescription,
			score: result.overallScore,
			result,
		});

		// Update saved job if provided
		if (input.savedJobId) {
			await db
				.update(schema.savedJobDescription)
				.set({
					lastScore: result.overallScore,
					lastAnalyzedAt: new Date(),
				})
				.where(
					and(eq(schema.savedJobDescription.id, input.savedJobId), eq(schema.savedJobDescription.userId, input.userId)),
				);
		}

		return {
			analysisId,
			result,
		};
	},

	// Get analysis by ID
	getAnalysisById: async (input: { id: string; userId: string }) => {
		const [analysis] = await db
			.select()
			.from(schema.jobMatchAnalysis)
			.where(and(eq(schema.jobMatchAnalysis.id, input.id), eq(schema.jobMatchAnalysis.userId, input.userId)));

		if (!analysis) {
			throw new ORPCError("NOT_FOUND", { message: "Analysis not found" });
		}

		return analysis;
	},

	// List analysis history
	listAnalysisHistory: async (input: { userId: string; limit?: number; offset?: number }) => {
		return await db
			.select({
				id: schema.jobMatchAnalysis.id,
				jobTitle: schema.jobMatchAnalysis.jobTitle,
				company: schema.jobMatchAnalysis.company,
				resumeName: schema.jobMatchAnalysis.resumeName,
				score: schema.jobMatchAnalysis.score,
				createdAt: schema.jobMatchAnalysis.createdAt,
			})
			.from(schema.jobMatchAnalysis)
			.where(eq(schema.jobMatchAnalysis.userId, input.userId))
			.orderBy(desc(schema.jobMatchAnalysis.createdAt))
			.limit(input.limit ?? 20)
			.offset(input.offset ?? 0);
	},

	// Delete analysis
	deleteAnalysis: async (input: { id: string; userId: string }): Promise<void> => {
		await db
			.delete(schema.jobMatchAnalysis)
			.where(and(eq(schema.jobMatchAnalysis.id, input.id), eq(schema.jobMatchAnalysis.userId, input.userId)));
	},

	// Clear all analysis history
	clearAnalysisHistory: async (input: { userId: string }): Promise<void> => {
		await db.delete(schema.jobMatchAnalysis).where(eq(schema.jobMatchAnalysis.userId, input.userId));
	},
};
