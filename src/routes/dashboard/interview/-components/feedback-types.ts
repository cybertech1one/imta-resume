export type FeedbackCategory =
	| "technical"
	| "behavioral"
	| "communication"
	| "problem_solving"
	| "leadership"
	| "cultural_fit";

export type FeedbackItem = {
	id: string;
	sessionId?: string | null;
	sessionTitle?: string | null;
	date: string;
	category: FeedbackCategory;
	type: "strength" | "improvement";
	content: string;
	source: string;
	actionItems: string[];
	isResolved: boolean;
	priority: "high" | "medium" | "low";
	tags: string[];
	notes?: string | null;
};

export type Goal = {
	id: string;
	title: string;
	description: string;
	category: FeedbackCategory;
	targetDate: string;
	progress: number;
	status: "not_started" | "in_progress" | "completed";
	relatedFeedbackIds: string[];
	milestones: { title: string; completed: boolean }[];
	createdAt: Date;
};

export type TrendData = {
	date: string;
	technical: number;
	behavioral: number;
	communication: number;
	problemSolving: number;
	leadership: number;
	culturalFit: number;
	overall: number;
};

export type Pattern = {
	id: string;
	type: "recurring_strength" | "recurring_weakness" | "improvement_trend" | "decline_trend";
	category: FeedbackCategory;
	description: string;
	frequency: number;
	confidence: number;
	recommendations: string[];
	relatedFeedbackIds: string[];
};
