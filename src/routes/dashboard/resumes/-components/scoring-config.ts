import { generateId } from "@/utils/string";

import type {
	ATSCheckItem,
	ContentCompletenessData,
	ImprovementSuggestion,
	IndustryBenchmark,
	RadarDataPoint,
	ReadabilityScoreData,
	SectionScore,
	VisualAppealScoreData,
} from "./scoring-types";

// =============================================================================
// DEFAULT DATA (used when creating new scoring results)
// =============================================================================

export const defaultSectionScores: SectionScore[] = [
	{
		name: "Personal Information",
		score: 95,
		maxScore: 100,
		feedback: "Excellent contact information, all essential fields are filled in.",
		status: "excellent",
	},
	{
		name: "Professional Summary",
		score: 82,
		maxScore: 100,
		feedback: "Good summary but could include more industry-specific keywords.",
		status: "good",
	},
	{
		name: "Work Experience",
		score: 88,
		maxScore: 100,
		feedback: "Detailed descriptions with quantifiable achievements.",
		status: "excellent",
	},
	{
		name: "Education",
		score: 75,
		maxScore: 100,
		feedback: "Add certifications or complementary training.",
		status: "good",
	},
	{
		name: "Skills",
		score: 70,
		maxScore: 100,
		feedback: "Add more technical skills specific to your field.",
		status: "needs-improvement",
	},
	{
		name: "Projects",
		score: 65,
		maxScore: 100,
		feedback: "Include links to your projects or portfolio.",
		status: "needs-improvement",
	},
	{
		name: "Languages",
		score: 90,
		maxScore: 100,
		feedback: "Excellent languages section with clearly indicated levels.",
		status: "excellent",
	},
	{
		name: "Certifications",
		score: 45,
		maxScore: 100,
		feedback: "Certifications section incomplete or missing.",
		status: "missing",
	},
];

export const defaultATSChecklist: ATSCheckItem[] = [
	{ id: generateId(), label: "Compatible file format (PDF)", passed: true, impact: "high" },
	{ id: generateId(), label: "Standard fonts used", passed: true, impact: "high" },
	{ id: generateId(), label: "No complex tables", passed: true, impact: "high" },
	{
		id: generateId(),
		label: "No images or graphics in content",
		passed: false,
		impact: "medium",
		suggestion: "Remove decorative icons from the main content.",
	},
	{ id: generateId(), label: "Clear section headers", passed: true, impact: "high" },
	{ id: generateId(), label: "Contact information at the top", passed: true, impact: "medium" },
	{ id: generateId(), label: "Industry keywords present", passed: true, impact: "high" },
	{ id: generateId(), label: "Dates in standard format", passed: true, impact: "medium" },
	{
		id: generateId(),
		label: "No excessive special characters",
		passed: false,
		impact: "low",
		suggestion: "Avoid symbols and use standard bullet points.",
	},
	{ id: generateId(), label: "Appropriate length (1-2 pages)", passed: true, impact: "medium" },
	{ id: generateId(), label: "Adequate margins", passed: true, impact: "low" },
	{ id: generateId(), label: "Selectable text", passed: true, impact: "high" },
];

export const defaultReadabilityScore: ReadabilityScoreData = {
	score: 72,
	gradeLevel: "Associate Degree Level",
	avgSentenceLength: 18,
	complexWords: 12,
	passiveVoice: 8,
	feedback: "Your resume is fairly readable but could benefit from shorter and more direct sentences.",
};

export const defaultVisualAppealScore: VisualAppealScoreData = {
	score: 85,
	balance: 88,
	whitespace: 82,
	consistency: 90,
	hierarchy: 80,
	feedback: "Good use of space and clear visual hierarchy.",
};

export const defaultContentCompleteness: ContentCompletenessData = {
	score: 76,
	filledSections: 7,
	totalSections: 10,
	missingCritical: ["Certifications", "References"],
	recommendations: ["Add at least 2 relevant certifications", "Include 2-3 professional references"],
};

export const defaultImprovementSuggestions: ImprovementSuggestion[] = [
	{
		id: generateId(),
		category: "Content",
		title: "Add quantifiable metrics",
		description: "Include specific numbers to illustrate your achievements (e.g., +25% sales).",
		impact: "high",
		effort: "easy",
	},
	{
		id: generateId(),
		category: "ATS",
		title: "Optimize keywords",
		description: "Add more technical keywords matching target job postings.",
		impact: "high",
		effort: "medium",
	},
	{
		id: generateId(),
		category: "Format",
		title: "Improve bullet point structure",
		description: "Use action verbs at the beginning of each bullet point for more impact.",
		impact: "medium",
		effort: "easy",
	},
	{
		id: generateId(),
		category: "Completeness",
		title: "Add a certifications section",
		description: "Certifications strengthen your credibility and technical expertise.",
		impact: "high",
		effort: "medium",
	},
	{
		id: generateId(),
		category: "Readability",
		title: "Simplify your vocabulary",
		description: "Replace complex technical terms with more accessible equivalents.",
		impact: "medium",
		effort: "medium",
	},
	{
		id: generateId(),
		category: "Visual",
		title: "Add more white space",
		description: "Increase margins to improve readability and professional appearance.",
		impact: "low",
		effort: "easy",
	},
];

export const defaultIndustryBenchmarks: IndustryBenchmark[] = [
	{ industry: "Technology / IT", avgScore: 72, topScore: 95, yourScore: 78, percentile: 65 },
	{ industry: "Finance / Banking", avgScore: 75, topScore: 94, yourScore: 78, percentile: 58 },
	{ industry: "Marketing / Communication", avgScore: 70, topScore: 92, yourScore: 78, percentile: 72 },
	{ industry: "Healthcare / Medical", avgScore: 74, topScore: 96, yourScore: 78, percentile: 60 },
	{ industry: "Engineering", avgScore: 73, topScore: 95, yourScore: 78, percentile: 62 },
];

export const defaultRadarData: RadarDataPoint[] = [
	{ dimension: "ATS", score: 85, fullMark: 100 },
	{ dimension: "Content", score: 78, fullMark: 100 },
	{ dimension: "Readability", score: 72, fullMark: 100 },
	{ dimension: "Visual", score: 85, fullMark: 100 },
	{ dimension: "Completeness", score: 76, fullMark: 100 },
	{ dimension: "Impact", score: 80, fullMark: 100 },
];
