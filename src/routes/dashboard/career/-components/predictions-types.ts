// Types for the Career Predictions feature

export interface PredictedCareerPath {
	id: string;
	title: string;
	titleFr?: string;
	description: string;
	descriptionFr?: string;
	field: string;
	matchPercentage: number;
	confidence: "high" | "medium" | "low";
	estimatedTimeToAchieve: number;
	salaryProjection: {
		current: number;
		year1: number;
		year3: number;
		year5: number;
		currency: string;
	};
	requiredSkills?: Array<{
		name: string;
		currentLevel: number;
		requiredLevel: number;
	}>;
	milestones?: string[];
	successFactors?: string[];
	challenges?: string[];
	growthPotential: "high" | "medium" | "low";
}

export interface TrajectoryData {
	id: string;
	pathName: string;
	targetRole: string;
	targetField?: string | null;
	estimatedYearsToTarget?: number | null;
	successProbability?: number | null;
	marketDemand?: string | null;
	projectedSalaryYear5?: number | null;
	trajectoryPoints?: Array<{
		year: number;
		role: string;
		salary: number;
		probability: number;
	}>;
}

export interface JobMatchData {
	id: string;
	jobTitle: string;
	company?: string | null;
	location?: string | null;
	overallScore: number;
	skillMatchScore?: number | null;
	matchedSkills?: string[];
	missingSkills?: string[];
	isBookmarked?: boolean;
	isDismissed?: boolean;
}

export interface StatisticsData {
	totalPredictions: number;
	completedPredictions: number;
	totalJobMatches: number;
	averageMatchScore: number;
	bookmarkedJobs: number;
	appliedJobs: number;
	totalTrajectories: number;
}

export interface SimulateInput {
	pathName: string;
	targetRole: string;
	targetField?: string;
	currentSkills?: string[];
	yearsExperience?: number;
}
