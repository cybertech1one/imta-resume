export type Industry =
	| "technology"
	| "finance"
	| "healthcare"
	| "marketing"
	| "engineering"
	| "education"
	| "consulting"
	| "general";

export interface ProfileScore {
	overall: number;
	photo: number;
	headline: number;
	summary: number;
	experience: number;
	skills: number;
	connections: number;
	engagement: number;
}

export interface HeadlineSuggestion {
	id: string;
	headline: string;
	tone: "professional" | "creative" | "executive";
	keywords: string[];
}

export interface SummarySuggestion {
	id: string;
	summary: string;
	wordCount: number;
	keywords: string[];
}

export interface PhotoTip {
	id: string;
	title: string;
	description: string;
	iconName: string;
	checked: boolean;
}

export interface ChecklistItem {
	id: string;
	item: string;
	category: string;
	priority: "high" | "medium" | "low";
	completed: boolean;
}

export interface ConnectionStrategy {
	id: string;
	title: string;
	description: string;
	priority: "high" | "medium" | "low";
	tips: string[];
}

export interface EngagementTip {
	id: string;
	title: string;
	description: string;
	iconName: string;
	category: "posting" | "commenting" | "sharing" | "networking";
	frequency: string;
}

export interface KeywordOptimization {
	keyword: string;
	searchVolume: string;
	competition: string;
	recommended: boolean;
}

export interface RecommendedSkill {
	skill: string;
	category: string;
	relevance: string;
	inDemand?: boolean;
}

export interface IndustryOption {
	value: string;
	label: string;
}
