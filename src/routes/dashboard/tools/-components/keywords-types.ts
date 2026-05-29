// =============================================================================
// KEYWORDS OPTIMIZER - TYPES
// =============================================================================

export interface KeywordMatch {
	keyword: string;
	found: boolean;
	count: number;
	category: "technical" | "soft" | "certification" | "industry";
	importance: "high" | "medium" | "low";
}

export interface KeywordDensity {
	keyword: string;
	count: number;
	density: number;
	status: "optimal" | "low" | "high";
}

export interface ScoreBreakdown {
	technicalSkills: number;
	softSkills: number;
	certifications: number;
	industryTerms: number;
	overall: number;
}

export interface AnalysisResult {
	matchPercentage: number;
	scoreBreakdown: ScoreBreakdown;
	matchedKeywords: KeywordMatch[];
	missingKeywords: KeywordMatch[];
	keywordDensity: KeywordDensity[];
	suggestions: string[];
	industryKeywords: string[];
}

export interface BeforeAfterComparison {
	before: {
		text: string;
		score: number;
		matchedCount: number;
	};
	after: {
		text: string;
		score: number;
		matchedCount: number;
	};
}

export type Industry =
	| "technology"
	| "healthcare"
	| "finance"
	| "marketing"
	| "engineering"
	| "education"
	| "industrial"
	| "general";
