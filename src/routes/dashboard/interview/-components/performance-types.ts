export type ScoreBreakdown = {
	confidence: number;
	clarity: number;
	relevance: number;
	technical: number;
	communication: number;
};

export type PerformanceTrend = {
	date: string;
	overallScore: number;
	confidenceScore: number;
	clarityScore: number;
	relevanceScore: number;
	technicalScore: number;
	communicationScore: number;
};
