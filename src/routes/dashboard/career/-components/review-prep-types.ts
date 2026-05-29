import type { Icon } from "@phosphor-icons/react";

export interface AccomplishmentEntry {
	id: string;
	date: string;
	title: string;
	description: string;
	category: "project" | "achievement" | "skill" | "recognition" | "improvement";
	impact: "high" | "medium" | "low";
	metrics?: string | null;
}

export interface SelfAssessmentQuestion {
	id: string;
	category: string;
	question: string;
	placeholder: string;
}

export interface TalkingPoint {
	id: string;
	category: string;
	title: string;
	description: string;
	tips: string[];
	icon: Icon;
}

export interface ManagerQuestion {
	id: string;
	category: "career" | "feedback" | "development" | "expectations" | "support";
	question: string;
	purpose: string;
}

export interface CareerGrowthTopic {
	id: string;
	title: string;
	description: string;
	questions: string[];
	icon: Icon;
}

export interface TimelinePhase {
	id: string;
	title: string;
	description: string;
	dueDate: string;
	tasks: { title: string; completed: boolean }[];
	icon: Icon;
}
