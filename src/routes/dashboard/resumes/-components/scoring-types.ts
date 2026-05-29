// =============================================================================
// SCORING TYPES
// =============================================================================

export interface SectionScore {
	name: string;
	score: number;
	maxScore: number;
	feedback: string;
	status: "excellent" | "good" | "needs-improvement" | "missing";
}

export interface ATSCheckItem {
	id: string;
	label: string;
	passed: boolean;
	impact: "high" | "medium" | "low";
	suggestion?: string;
}

export interface ImprovementSuggestion {
	id: string;
	category: string;
	title: string;
	description: string;
	impact: "high" | "medium" | "low";
	effort: "easy" | "medium" | "hard";
}

export interface IndustryBenchmark {
	industry: string;
	avgScore: number;
	topScore: number;
	yourScore: number;
	percentile: number;
}

export interface RadarDataPoint {
	dimension: string;
	score: number;
	fullMark: number;
}

export interface BeforeAfterComparison {
	metric: string;
	before: number;
	after: number;
	improvement: number;
}

export interface ReadabilityScoreData {
	score: number;
	gradeLevel: string;
	avgSentenceLength: number;
	complexWords: number;
	passiveVoice: number;
	feedback: string;
}

export interface VisualAppealScoreData {
	score: number;
	balance: number;
	whitespace: number;
	consistency: number;
	hierarchy: number;
	feedback: string;
}

export interface ContentCompletenessData {
	score: number;
	filledSections: number;
	totalSections: number;
	missingCritical: string[];
	recommendations: string[];
}

export interface ScoringResultForExport {
	overallScore: number;
	sectionScores: SectionScore[];
	atsChecklist: ATSCheckItem[];
	atsScore: number;
	readabilityScore: ReadabilityScoreData | null;
	visualAppealScore: VisualAppealScoreData | null;
	contentCompleteness: ContentCompletenessData | null;
	improvementSuggestions: ImprovementSuggestion[];
	radarData: RadarDataPoint[];
}
