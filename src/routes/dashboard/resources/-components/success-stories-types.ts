import type { Icon } from "@phosphor-icons/react";

// Career timeline event type
export interface CareerEvent {
	year: string;
	title: string;
	description: string;
	type: "education" | "job" | "promotion" | "achievement";
}

// Success story type
export interface SuccessStory {
	id: string;
	name: string;
	currentPosition: string;
	company: string;
	programId: string;
	programName: string;
	category: string;
	graduationYear: number;
	shortQuote: string;
	fullStory: string;
	advice: string[];
	keyLessons: string[];
	helpfulSkills: string[];
	careerTimeline: CareerEvent[];
	avatarInitials: string;
	location: string;
	featured?: boolean;
}

// Program filter option
export interface ProgramOption {
	id: string;
	name: string;
	category: string;
}

// Alumni statistics
export interface AlumniStats {
	totalEmployed: number;
	employmentRate: number;
	averageTimeToJob: number;
	salaryGrowth5Years: number;
	topEmployers: { name: string; count: number }[];
}

// Category config maps
export type CategoryRecord = Record<string, string>;
export type CategoryIconRecord = Record<string, Icon>;
