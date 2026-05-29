import type { Variants } from "motion/react";

// Props shared across tab components
export interface AIMatrixTabProps {
	isAdmin: boolean;
	itemVariants: Variants;
}

// Data types inferred from ORPC query results
export type ModelPerformanceData = {
	provider: string;
	model: string;
	totalRequests: number;
	successRate: number;
	latency: { avg: number; p95: number };
	tokens: { total: number };
	estimatedCost: { total: number };
};

export type FeatureUsageData = {
	features: {
		feature: string;
		totalRequests: number;
		successRate: number;
		totalTokens: number;
		avgLatency: number;
		uniqueUsers: number;
	}[];
};

export type CostAnalysisData = {
	summary: {
		totalRequests: number;
		totalTokens: number;
		totalInputTokens: number;
		totalOutputTokens: number;
		totalEstimatedCost: number;
	};
	byTime: {
		period: string;
		requestCount: number;
		totalTokens: number;
		estimatedCost: number;
	}[];
	byFeature: {
		feature: string;
		model: string;
		requestCount: number;
		inputTokens: number;
		outputTokens: number;
		estimatedCost: number;
	}[];
	byUser: {
		userId: string;
		userName: string;
		requestCount: number;
		totalTokens: number;
		estimatedCost: number;
	}[];
};

export type QualityScoresData = {
	overall: { successRate: number };
	interviews: { completionRate: number; avgScore: number };
};

export type StudentProgressData = {
	learning: { completedPaths: number; totalPaths: number; avgProgress: number };
	interviews: { completedSessions: number; totalSessions: number };
	skills: { totalHoursInvested: number };
};

export type PredictiveInsightsData = {
	engagement: {
		activeUsersLast30: number;
		activeUsersLast7: number;
		retentionRate: number;
		atRiskCount: number;
		atRiskUsers: { userId: string; userName: string; email: string; lastActivity: Date | null }[];
		highEngagementUsers: { userId: string; userName: string; requestCount: number; tokenCount: number }[];
	};
	forecast: {
		trend: string;
		growthRate: number;
		predictedUsage: { date: string; predictedRequests: number }[];
	};
	usageTrend: { date: string; requestCount: number }[];
};
