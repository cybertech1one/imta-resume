export type SkillCategory = "technical" | "soft" | "leadership" | "communication" | "analytical";
export type ActionCategory = "skill" | "network" | "certification" | "experience" | "branding";
export type Priority = "high" | "medium" | "low";

export type SkillCategoryConfig = {
	name: string;
	nameFr: string;
	icon: React.ComponentType<any>;
	color: string;
	bgColor: string;
};

export type ActionCategoryConfig = {
	name: string;
	nameFr: string;
	icon: React.ComponentType<any>;
	color: string;
};

export type PriorityConfig = {
	name: string;
	nameFr: string;
	color: string;
};

export type SkillFormState = {
	name: string;
	nameFr: string;
	category: SkillCategory;
	currentLevel: number;
	relevanceToTarget: number;
	description: string;
};

export type PhaseFormState = {
	name: string;
	nameFr: string;
	duration: string;
	durationWeeks: number;
	description: string;
	tasks: string[];
	newTask: string;
};

export type ActionFormState = {
	task: string;
	taskFr: string;
	category: ActionCategory;
	priority: Priority;
	deadline: string;
	estimatedHours: number;
};

import type React from "react";
