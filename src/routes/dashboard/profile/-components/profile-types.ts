import type { Icon } from "@phosphor-icons/react";

export type Achievement = {
	id: string;
	title: string;
	description: string;
	icon: Icon;
	color: string;
	bgColor: string;
	borderColor: string;
	requiredValue: number;
	category: "resume" | "interview" | "training" | "career" | "engagement";
};

export type GoalTemplate = {
	id: string;
	title: string;
	description: string;
	icon: Icon;
	targetValue: number;
	unit: string;
	category: "resume" | "interview" | "training" | "career";
};

export type ActivityItem = {
	id: string;
	type: string;
	title: string;
	details: string;
	timestamp: Date;
};

export type ProfileStats = {
	resumeCount: number;
	completedInterviews: number;
	totalInterviews: number;
	totalTrainings: number;
	completedTrainings: number;
	inProgressTrainings: number;
	averageScore: number;
	highestScore: number;
	resumeCompletion: number;
	interviewCompletion: number;
	trainingCompletion: number;
	careerAssessmentCompletion: number;
	overallProgress: number;
};

export type AchievementWithStatus = Achievement & {
	progress: number;
	isUnlocked: boolean;
};
