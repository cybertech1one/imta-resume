import type { Icon } from "@phosphor-icons/react";

export type InterviewField = "healthcare" | "industrial" | "hse" | "technology" | "management" | "general";

export type InterviewDifficulty = "beginner" | "intermediate" | "advanced";

export interface MappedInterviewTip {
	id: string;
	category: string;
	field: string | null;
	titleFr: string;
	contentFr: string;
	title: string;
	content: string;
	categoryFr: string;
	icon: Icon;
	sortOrder: number | null;
	isActive: boolean;
}

export interface BestPerformingArea {
	field: string;
	score: number;
}
