import type { Icon } from "@phosphor-icons/react";

export type SkillCategory =
	| "communication"
	| "time_management"
	| "tech_proficiency"
	| "self_discipline"
	| "home_office";

export interface QuizQuestion {
	id: string;
	question: string;
	category: SkillCategory;
	options: QuizOption[];
}

export interface QuizOption {
	id: string;
	text: string;
	score: number;
}

export interface QuizAnswer {
	questionId: string;
	selectedOptionId: string;
	score: number;
}

export interface ReadinessResult {
	id: string;
	date: string;
	totalScore: number;
	maxScore: number;
	percentage: number;
	categoryScores: Record<SkillCategory, { score: number; maxScore: number; percentage: number }>;
	level: ReadinessLevel;
}

export type ReadinessLevel = "beginner" | "developing" | "competent" | "proficient" | "expert";

export interface ChecklistItem {
	id: string;
	category: SkillCategory;
	text: string;
}

export interface HomeOfficeItem {
	id: string;
	category: "essential" | "recommended" | "nice_to_have";
	name: string;
	description: string;
	icon: Icon;
}

export interface ProductivityTip {
	id: string;
	title: string;
	description: string;
	icon: Icon;
	category: string;
}

export interface RemoteTool {
	id: string;
	name: string;
	description: string;
	category: "communication" | "project_management" | "time_tracking" | "file_sharing" | "focus";
	icon: Icon;
	url?: string;
}

export interface ImprovementTask {
	id: string;
	category: SkillCategory;
	title: string;
	description: string;
	completed: boolean;
	priority: "high" | "medium" | "low";
}
