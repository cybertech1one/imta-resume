// =============================================================================
// Experience Optimizer - Types
// =============================================================================

export type VerbCategory = "leadership" | "technical" | "communication";
export type Industry = "technology" | "healthcare" | "finance" | "marketing" | "engineering" | "education" | "general";

export interface BeforeAfterExample {
	id: string;
	before: string;
	after: string;
	improvement: string;
	category: string;
}

export interface ActionVerb {
	verb: string;
	description: string;
	example: string;
}

export interface QuantificationSuggestion {
	metric: string;
	example: string;
	tip: string;
}

export interface BulletRefinement {
	original: string;
	refined: string;
	changes: string[];
}

export interface AchievementTip {
	id: string;
	title: string;
	description: string;
	example: string;
}

export interface IndustryOptimization {
	industry: string;
	keywords: string[];
	phrases: string[];
	tips: string[];
}
