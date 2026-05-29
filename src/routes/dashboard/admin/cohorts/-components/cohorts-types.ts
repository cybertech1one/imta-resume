export type CohortCriteria = {
	program?: string;
	year?: number;
	specialization?: string;
	field?: string;
};

export type CohortData = {
	id: string;
	name: string;
	description: string | null;
	criteria: CohortCriteria;
	isActive: boolean;
	createdAt: Date;
	updatedAt: Date;
};

export type StudentPerformance = {
	userId: string;
	userName: string;
	userEmail: string;
	resumeCount: number;
	avgSkillsScore: number;
	interviewsCompleted: number;
	avgInterviewScore: number;
	trainingProgress: number;
	isPlaced: boolean;
	riskLevel: "low" | "medium" | "high";
	lastActivity: Date | null;
};

export type CohortPrediction = {
	predictedPlacementRate: number;
	predictedCompletionRate: number;
	riskFactors: string[];
	recommendations: string[];
	confidenceLevel: number;
};
