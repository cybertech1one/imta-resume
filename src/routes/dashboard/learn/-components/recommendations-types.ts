import type { Icon } from "@phosphor-icons/react";

export type ResourceType =
	| "course"
	| "tutorial"
	| "certification"
	| "video"
	| "article"
	| "workshop"
	| "book"
	| "webinar"
	| "practice"
	| "mentorship";
export type DifficultyLevel = "beginner" | "intermediate" | "advanced" | "expert";
export type CompletionStatus = "not_started" | "in_progress" | "completed" | "paused" | "dropped";

export interface LearningResource {
	id: string;
	title: string;
	titleFr: string | null;
	description: string;
	descriptionFr: string | null;
	resourceType: ResourceType;
	difficulty: DifficultyLevel;
	provider: string | null;
	url: string | null;
	durationMinutes: number | null;
	durationWeeks: number | null;
	skills: string[] | null;
	tags: string[] | null;
	rating: number | null;
	totalRatings: number | null;
	isFeatured: boolean | null;
	isActive: boolean | null;
	createdAt: Date;
}

export interface ResourceCompletion {
	id: string;
	userId: string;
	resourceId: string;
	resource: LearningResource;
	status: CompletionStatus;
	progress: number;
	startedAt: Date | null;
	completedAt: Date | null;
	timeSpent: number;
}

export interface ResourceTypeConfig {
	label: string;
	labelFr: string;
	icon: Icon;
	color: string;
}

export interface DifficultyConfig {
	label: string;
	labelFr: string;
	color: string;
}

export interface StatusConfig {
	label: string;
	labelFr: string;
	color: string;
	icon: Icon;
}
