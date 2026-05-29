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

// Calculate match score between job description and resume
function calculateMatchScore(
	jobDescription: string,
	resumeSkills: string[],
	resumeExperience: Array<{ position: string; company: string; description: string; period: string }>,
	resumeSummary: string,
): JobMatchResult {
	const jobKeywords = extractKeywords(jobDescription);
	const resumeText = [
		resumeSummary,
		...resumeSkills,
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
			const hasPartial = resumeSkills.some(
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

	// Skills alignment
	const matchedSkills = resumeSkills
		.filter((skill) => jobDescription.toLowerCase().includes(skill.toLowerCase()))
		.map((skill) => ({
			skill,
			resumeLevel: Math.floor(Math.random() * 2) + 3, // Simulated level (3-5)
			requiredLevel: "intermediate" as const,
			match: "exact" as const,
		}));

	const missingSkills = jobKeywords
		.filter((k) => !resumeSkills.some((s) => s.toLowerCase().includes(k.toLowerCase())))
		.slice(0, 5);

	const additionalSkills = resumeSkills
		.filter((s) => !jobDescription.toLowerCase().includes(s.toLowerCase()))
		.slice(0, 5);

	const skillsScore =
		matchedSkills.length > 0
			? Math.min(100, Math.round((matchedSkills.length / Math.max(jobKeywords.length, 5)) * 100))
			: 30;

	// Experience comparison
	const experienceMatch = jobDescription.match(/(\d+)\+?\s*(?:years?|ans?)/i);
	const requiredYears = experienceMatch ? Number.parseInt(experienceMatch[1], 10) : 3;
	const candidateYears = resumeExperience.length * 2; // Rough estimate

	const relevantExperience = resumeExperience
		.filter((e) => {
			const expText = `${e.position} ${e.description}`.toLowerCase();
			return jobKeywords.some((k) => expText.includes(k.toLowerCase()));
		})
		.map((e) => e.position);

	const experienceGaps: string[] = [];
	if (candidateYears < requiredYears) {
		experienceGaps.push(`${requiredYears - candidateYears} additional years of experience required`);
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
		const resumeSkills = resumeData.sections.skills.items.map((s) => s.name).filter(Boolean);
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
