export type ConnectionCategory =
	| "colleague"
	| "mentor"
	| "recruiter"
	| "hiring_manager"
	| "industry_peer"
	| "alumni"
	| "other";
export type RelationshipStrength = "strong" | "moderate" | "weak" | "dormant";
export type InteractionType = "email" | "call" | "meeting" | "linkedin" | "event" | "coffee" | "referral" | "other";

export interface NetworkNode {
	id: string;
	name: string;
	email: string;
	company: string;
	jobTitle: string;
	category: ConnectionCategory;
	relationshipStrength: RelationshipStrength;
	avatar?: string;
	linkedinUrl?: string;
	location?: string;
	tags: string[];
	notes: string;
	createdAt: string;
	lastInteractionAt?: string;
	isFavorite: boolean;
	mutualConnections: string[];
	introducedBy?: string;
}

export interface NetworkEdge {
	source: string;
	target: string;
	strength: RelationshipStrength;
	introducedThrough?: string;
}

export interface Interaction {
	id: string;
	nodeId: string;
	type: InteractionType;
	date: string;
	notes: string;
	outcome?: string;
	followUpDate?: string;
}

export interface ConnectionReminder {
	id: string;
	nodeId: string;
	nodeName: string;
	title: string;
	description: string;
	dueDate: string;
	frequency: "weekly" | "biweekly" | "monthly" | "quarterly" | "yearly";
	isRecurring: boolean;
	completed: boolean;
}

export interface NetworkGrowthData {
	month: string;
	colleagues: number;
	mentors: number;
	recruiters: number;
	others: number;
	total: number;
}

export interface SuggestedConnection {
	id: string;
	name: string;
	company: string;
	jobTitle: string;
	reason: string;
	mutualConnections: string[];
	relevanceScore: number;
}

export interface NetworkAnalytics {
	totalConnections: number;
	strongConnections: number;
	moderateConnections: number;
	weakConnections: number;
	dormantConnections: number;
	categoryDistribution: Record<ConnectionCategory, number>;
	averageInteractionsPerMonth: number;
	networkDiversity: number; // 0-100 score
	engagementScore: number; // 0-100 score
	growthRate: number; // percentage
}
