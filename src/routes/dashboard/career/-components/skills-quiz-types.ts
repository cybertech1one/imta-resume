import type { Icon } from "@phosphor-icons/react";

export type SkillCategory = "technical" | "soft_skills" | "leadership";
export type SkillLevel = "beginner" | "intermediate" | "advanced" | "expert";

export interface QuizQuestion {
	id: string;
	question: string;
	category: SkillCategory;
	skill: string;
	difficulty: 1 | 2 | 3 | 4 | 5;
	options: QuizOption[];
	explanation: string;
	timeLimit: number; // in seconds
}

export interface QuizOption {
	id: string;
	text: string;
	isCorrect: boolean;
}

export interface QuizAnswer {
	questionId: string;
	selectedOptionId: string;
	isCorrect: boolean;
	timeSpent: number; // in seconds
}

export interface QuizResult {
	id: string;
	category: SkillCategory;
	date: string;
	totalQuestions: number;
	correctAnswers: number;
	score: number;
	level: SkillLevel;
	timeSpent: number;
	skillBreakdown: Record<string, { correct: number; total: number }>;
	badges: string[];
}

export interface QuizBadge {
	id: string;
	name: string;
	nameFr: string;
	description: string;
	icon: Icon;
	condition: (result: QuizResult) => boolean;
	rarity: "common" | "uncommon" | "rare" | "epic" | "legendary";
}

export interface ImprovementPlan {
	skill: string;
	currentLevel: SkillLevel;
	targetLevel: SkillLevel;
	recommendations: string[];
	resources: { title: string; type: string; url?: string }[];
}
