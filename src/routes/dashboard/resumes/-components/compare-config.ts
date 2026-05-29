import { BriefcaseIcon, CodeIcon, GraduationCapIcon, StarIcon } from "@phosphor-icons/react";
import type { ResumeData, SectionType } from "@/schema/resume/data";
import type { ComparisonMetrics, JobTypeRecommendation, Resume, SectionDifference } from "./compare-types";

// Helper functions

function calculateWordCount(text: string): number {
	return text.trim().split(/\s+/).filter(Boolean).length;
}

function extractTextFromHtml(html: string): string {
	// Use DOMParser for safe HTML parsing - it doesn't execute scripts
	if (typeof window === "undefined") return html.replace(/<[^>]*>/g, "");
	const parser = new DOMParser();
	const doc = parser.parseFromString(html, "text/html");
	return doc.body.textContent || "";
}

function calculateATSScore(data: ResumeData): number {
	let score = 0;
	const maxScore = 100;

	// Basic info completeness (25 points)
	if (data.basics.name) score += 5;
	if (data.basics.email) score += 5;
	if (data.basics.phone) score += 5;
	if (data.basics.location) score += 5;
	if (data.basics.headline) score += 5;

	// Summary section (10 points)
	if (data.summary.content && extractTextFromHtml(data.summary.content).length > 50) {
		score += 10;
	}

	// Experience section (25 points)
	const expItems = data.sections.experience.items;
	if (expItems.length > 0) score += 10;
	if (expItems.length >= 2) score += 5;
	if (expItems.some((e) => extractTextFromHtml(e.description).length > 100)) score += 10;

	// Education section (15 points)
	const eduItems = data.sections.education.items;
	if (eduItems.length > 0) score += 10;
	if (eduItems.some((e) => e.degree)) score += 5;

	// Skills section (15 points)
	const skillItems = data.sections.skills.items;
	if (skillItems.length > 0) score += 5;
	if (skillItems.length >= 5) score += 5;
	if (skillItems.length >= 10) score += 5;

	// Additional sections (10 points)
	if (data.sections.certifications.items.length > 0) score += 3;
	if (data.sections.projects.items.length > 0) score += 3;
	if (data.sections.languages.items.length > 0) score += 2;
	if (data.sections.profiles.items.length > 0) score += 2;

	return Math.min(score, maxScore);
}

function calculateCompletenessScore(data: ResumeData): number {
	let filledFields = 0;
	let totalFields = 0;

	// Basic fields
	const basicFields = ["name", "email", "phone", "location", "headline"];
	for (const field of basicFields) {
		totalFields++;
		if (data.basics[field as keyof typeof data.basics]) filledFields++;
	}

	// Summary
	totalFields++;
	if (data.summary.content) filledFields++;

	// Sections
	const sectionNames: SectionType[] = ["experience", "education", "skills", "projects", "certifications", "languages"];

	for (const section of sectionNames) {
		totalFields++;
		if (data.sections[section].items.length > 0) filledFields++;
	}

	return Math.round((filledFields / totalFields) * 100);
}

function extractSkills(data: ResumeData): string[] {
	const skills: string[] = [];

	// From skills section
	for (const skill of data.sections.skills.items) {
		skills.push(skill.name);
		skills.push(...skill.keywords);
	}

	// From experience descriptions (common skill keywords)
	const skillKeywords = [
		"javascript",
		"typescript",
		"python",
		"java",
		"react",
		"node",
		"sql",
		"aws",
		"docker",
		"kubernetes",
		"agile",
		"scrum",
		"leadership",
		"communication",
		"problem-solving",
		"teamwork",
		"project management",
		"data analysis",
		"machine learning",
		"ai",
		"cloud",
		"devops",
		"ci/cd",
		"git",
		"linux",
		"windows",
		"excel",
		"powerpoint",
		"word",
	];

	for (const exp of data.sections.experience.items) {
		const descLower = extractTextFromHtml(exp.description).toLowerCase();
		for (const keyword of skillKeywords) {
			if (descLower.includes(keyword) && !skills.includes(keyword)) {
				skills.push(keyword);
			}
		}
	}

	return [...new Set(skills.filter(Boolean))];
}

export function calculateMetrics(data: ResumeData): ComparisonMetrics {
	let totalWords = 0;
	const sectionCounts: Record<string, number> = {};

	// Count words in basics
	totalWords += calculateWordCount(data.basics.name);
	totalWords += calculateWordCount(data.basics.headline);

	// Count words in summary
	totalWords += calculateWordCount(extractTextFromHtml(data.summary.content));

	// Count section items and words
	const sections = Object.keys(data.sections) as SectionType[];
	for (const section of sections) {
		const items = data.sections[section].items;
		sectionCounts[section] = items.length;

		for (const item of items) {
			// Count words in item descriptions
			if ("description" in item) {
				totalWords += calculateWordCount(extractTextFromHtml(item.description as string));
			}
			// Count other text fields
			for (const [key, value] of Object.entries(item)) {
				if (typeof value === "string" && key !== "description" && key !== "id") {
					totalWords += calculateWordCount(value);
				}
			}
		}
	}

	return {
		wordCount: totalWords,
		sectionCounts,
		skills: extractSkills(data),
		experienceCount: data.sections.experience.items.length,
		educationCount: data.sections.education.items.length,
		projectCount: data.sections.projects.items.length,
		certificationCount: data.sections.certifications.items.length,
		languageCount: data.sections.languages.items.length,
		atsScore: calculateATSScore(data),
		completenessScore: calculateCompletenessScore(data),
	};
}

function getItemDisplayText(item: Record<string, unknown>): string {
	// Try to get the most meaningful display text
	if ("company" in item && "position" in item) {
		return `${item.position} at ${item.company}`;
	}
	if ("school" in item && "degree" in item) {
		return `${item.degree} at ${item.school}`;
	}
	if ("title" in item) {
		return item.title as string;
	}
	if ("name" in item) {
		return item.name as string;
	}
	if ("network" in item) {
		return item.network as string;
	}
	if ("language" in item) {
		return item.language as string;
	}
	return "Item";
}

export function findDifferences(data1: ResumeData, data2: ResumeData): SectionDifference[] {
	const differences: SectionDifference[] = [];
	const sections = Object.keys(data1.sections) as SectionType[];

	for (const section of sections) {
		const items1 = data1.sections[section].items;
		const items2 = data2.sections[section].items;

		const sectionDiff: SectionDifference = {
			section,
			type: "unchanged",
			items: [],
		};

		// Create maps for comparison
		const map1 = new Map(items1.map((item) => [item.id, item]));
		const map2 = new Map(items2.map((item) => [item.id, item]));

		// Find added and unchanged items
		for (const [id, item] of map2) {
			const item1 = map1.get(id);
			const content = JSON.stringify(item);

			if (!item1) {
				sectionDiff.items.push({ content: getItemDisplayText(item), type: "added" });
				sectionDiff.type = "modified";
			} else if (JSON.stringify(item1) !== content) {
				sectionDiff.items.push({ content: getItemDisplayText(item), type: "modified" });
				sectionDiff.type = "modified";
			} else {
				sectionDiff.items.push({ content: getItemDisplayText(item), type: "unchanged" });
			}
		}

		// Find removed items
		for (const [id, item] of map1) {
			if (!map2.has(id)) {
				sectionDiff.items.push({ content: getItemDisplayText(item), type: "removed" });
				sectionDiff.type = "modified";
			}
		}

		if (sectionDiff.items.some((i) => i.type !== "unchanged")) {
			differences.push(sectionDiff);
		}
	}

	return differences;
}

export function generateRecommendations(metrics: ComparisonMetrics[], resumes: Resume[]): JobTypeRecommendation[] {
	const recommendations: JobTypeRecommendation[] = [];

	if (metrics.length < 2) return recommendations;

	// Technical roles - prefer resume with more skills and projects
	const technicalScores = metrics.map((m, i) => ({
		index: i,
		score: m.skills.length * 2 + m.projectCount * 3 + m.certificationCount * 2,
	}));
	const bestTechnical = technicalScores.sort((a, b) => b.score - a.score)[0];
	recommendations.push({
		jobType: "Technical Roles (Developer, Engineer)",
		recommendedVersion: resumes[bestTechnical.index]?.name || `Version ${bestTechnical.index + 1}`,
		reason: "This version has more technical skills, projects, and certifications highlighted.",
		matchScore: Math.min(100, bestTechnical.score * 5),
		icon: CodeIcon,
	});

	// Management roles - prefer resume with more experience and word count
	const managementScores = metrics.map((m, i) => ({
		index: i,
		score: m.experienceCount * 4 + m.wordCount / 50 + m.completenessScore / 10,
	}));
	const bestManagement = managementScores.sort((a, b) => b.score - a.score)[0];
	recommendations.push({
		jobType: "Management & Leadership Roles",
		recommendedVersion: resumes[bestManagement.index]?.name || `Version ${bestManagement.index + 1}`,
		reason: "This version showcases more comprehensive experience and detailed descriptions.",
		matchScore: Math.min(100, bestManagement.score * 3),
		icon: BriefcaseIcon,
	});

	// Entry level - prefer concise resume with good ATS score
	const entryScores = metrics.map((m, i) => ({
		index: i,
		score: m.atsScore + m.educationCount * 5 + (m.wordCount < 500 ? 20 : 0),
	}));
	const bestEntry = entryScores.sort((a, b) => b.score - a.score)[0];
	recommendations.push({
		jobType: "Entry Level & Internships",
		recommendedVersion: resumes[bestEntry.index]?.name || `Version ${bestEntry.index + 1}`,
		reason: "This version is more ATS-friendly and highlights education effectively.",
		matchScore: Math.min(100, bestEntry.score),
		icon: GraduationCapIcon,
	});

	// Research/Academic - prefer resume with publications and education
	const academicScores = metrics.map((m, i) => ({
		index: i,
		score: m.educationCount * 5 + (m.sectionCounts.publications || 0) * 10 + m.certificationCount * 3,
	}));
	const bestAcademic = academicScores.sort((a, b) => b.score - a.score)[0];
	recommendations.push({
		jobType: "Research & Academic Positions",
		recommendedVersion: resumes[bestAcademic.index]?.name || `Version ${bestAcademic.index + 1}`,
		reason: "This version emphasizes academic credentials and research-related content.",
		matchScore: Math.min(100, bestAcademic.score * 4),
		icon: StarIcon,
	});

	return recommendations;
}
