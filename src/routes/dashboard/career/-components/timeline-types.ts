export type EventType = "job" | "promotion" | "education" | "certification" | "achievement" | "skill" | "goal";
export type SkillCategory = "technical" | "soft" | "language" | "tool";
export type GoalCategory = "position" | "salary" | "skill" | "certification" | "other";

export interface TimelineEvent {
	id: string;
	userId: string;
	type: EventType;
	title: string;
	organization: string;
	description: string;
	startDate: string;
	endDate: string | null;
	salary: number | null;
	skills: string[] | null;
	achievements: string[] | null;
	isGoal: boolean;
	targetDate: string | null;
	completed: boolean;
	createdAt: Date;
	updatedAt: Date;
}

export interface SkillAcquisition {
	id: string;
	userId: string;
	name: string;
	level: number;
	acquiredDate: string;
	source: string;
	category: SkillCategory;
	createdAt: Date;
}

export interface CareerGoal {
	id: string;
	userId: string;
	title: string;
	description: string;
	targetDate: string;
	category: GoalCategory;
	targetValue: number | null;
	currentValue: number | null;
	completed: boolean;
	createdAt: Date;
	updatedAt: Date;
}

export interface IndustryBenchmark {
	role: string;
	experienceYears: number;
	salaryMin: number;
	salaryMax: number;
	salaryMedian: number;
	currency: string;
}
