import type {
	VideoAnalysisCategoryScore,
	VideoAnalysisHighlight,
	VideoAnalysisVoiceMetrics,
} from "@/integrations/drizzle/schema";

export type AnalysisResult = {
	id: string;
	overallScore: number;
	duration: number;
	timestamp: string;
	categories: VideoAnalysisCategoryScore[];
	voiceMetrics: VideoAnalysisVoiceMetrics;
	highlights: VideoAnalysisHighlight[];
	recommendations: string[];
};
