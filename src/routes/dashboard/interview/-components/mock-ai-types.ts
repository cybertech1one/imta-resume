import type { FirstAidKitIcon } from "@phosphor-icons/react";

// Core domain types
export type Field = "healthcare" | "industrial" | "hse";
export type Difficulty = "debutant" | "intermediaire" | "avance";
export type Program = string;

export type MessageFeedback = {
	score: number;
	strengths: string[];
	improvements: string[];
	tip?: string;
};

export type Message = {
	id: string;
	role: "user" | "assistant";
	content: string;
	timestamp: Date;
	feedback?: MessageFeedback;
};

export type InterviewSession = {
	id: string;
	field: Field;
	program: Program;
	difficulty: Difficulty;
	messages: Message[];
	currentQuestionIndex: number;
	totalQuestions: number;
	scores: number[];
	startedAt: Date;
	completedAt?: Date;
	overallScore?: number;
};

export type SessionHistory = {
	id: string;
	field: Field;
	program: Program;
	difficulty: Difficulty;
	overallScore: number;
	totalQuestions: number;
	completedAt: Date;
};

export type InterviewTip = {
	id: string;
	title: string;
	content: string;
};

// Config map types
export type FieldConfig = {
	label: string;
	icon: typeof FirstAidKitIcon;
	color: string;
	bgColor: string;
};

export type DifficultyConfig = {
	label: string;
	color: string;
	questionsCount: number;
};

// API session shape (as returned from the backend)
export type ApiSession = {
	id: string;
	field: Field;
	program: string;
	difficulty: Difficulty;
	messages: Array<{
		id: string;
		role: "user" | "assistant";
		content: string;
		timestamp: string;
		feedback?: MessageFeedback;
	}>;
	currentQuestionIndex: number;
	totalQuestions: number;
	scores: number[];
	startedAt: Date;
	completedAt: Date | null;
	overallScore: number | null;
};
