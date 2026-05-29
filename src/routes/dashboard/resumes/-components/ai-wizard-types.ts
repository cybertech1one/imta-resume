// =============================================================================
// AI Resume Wizard — Type Definitions
// =============================================================================

export type WizardMode = "generate" | "gap-analysis" | "adapt-to-job" | "ai-chat";

export type WizardStep = "select-mode" | "select-resume" | "execute";

export type GapSeverity = "critical" | "major" | "minor";

export type GapItem = {
	section: string;
	description: string;
	severity: GapSeverity;
	suggestion: string;
};

export type GapAnalysisResult = {
	overallScore: number;
	gaps: GapItem[];
	strengths: string[];
	recommendations: string[];
};

export type AdaptResult = {
	matchScore: number;
	keywordsMatched: string[];
	keywordsMissing: string[];
	adaptedSections: {
		section: string;
		original: string;
		adapted: string;
	}[];
	// Raw adapted data from backend for merging
	rawAdaptedSections?: {
		summary?: string;
		headline?: string;
		skills?: { name: string; keywords: string[] }[];
		experienceHighlights?: string[];
	};
};

export type ChatMessage = {
	id: string;
	role: "user" | "assistant";
	content: string;
	timestamp: Date;
	suggestion?: {
		section: string;
		original: string;
		improved: string;
	};
};

export type ModeConfig = {
	id: WizardMode;
	icon: "target" | "briefcase" | "chat" | "sparkle";
	titleKey: string;
	descriptionKey: string;
};

export type GenerateFormData = {
	fullName: string;
	email: string;
	phone: string;
	targetJob: string;
	yearsExperience: string;
	skills: string;
	education: string;
	experience: string;
	language: "fr" | "en";
};
