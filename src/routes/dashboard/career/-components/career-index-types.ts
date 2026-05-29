import type { Icon } from "@phosphor-icons/react";

export interface QuizQuestion {
	id: string;
	question: string;
	category: "environment" | "interests" | "stress" | "work_style" | "goals";
	trait: "teamwork" | "technical_aptitude" | "patient_care" | "safety_focus" | "leadership";
	options: {
		id: string;
		text: string;
		icon: Icon;
		scores: Record<string, number>;
	}[];
}

export interface QuizAnswer {
	questionId: string;
	optionId?: string;
	scaleValue?: number;
}

export interface CareerMatch {
	programId: string;
	name: string;
	nameFr: string;
	matchPercentage: number;
	field: string;
	reasons: string[];
	icon: Icon;
	duration?: string;
	salary?: string;
	employmentRate?: number;
}

export interface PersonalityProfile {
	teamwork: number;
	technical_aptitude: number;
	patient_care: number;
	safety_focus: number;
	leadership: number;
}

export interface MarketInsight {
	id: string;
	title: string;
	value: string;
	trend: "up" | "down" | "stable";
	description: string;
	icon: Icon;
}

export interface Employer {
	id: string;
	name: string;
	sector: string;
	location: string;
	openPositions: number;
}

export interface CareerStage {
	id: string;
	title: string;
	titleFr: string;
	years: string;
	salary: string;
	description: string;
	skills: string[];
}

// Extended personality profile that maps to the database schema
export interface ExtendedPersonalityProfile extends PersonalityProfile {
	analytical: number;
	communication: number;
	stress_tolerance: number;
	physical_endurance: number;
	attention_to_detail: number;
}

// Program type for database-driven programs
export interface ProgramData {
	id: string;
	name: string;
	nameFr: string;
	field: string;
	durationFr?: string;
	avgSalary?: string | number | null;
	employmentRate?: number | null;
	descriptionFr?: string;
	description?: string;
}

// Type for storage matches (required by the API schema)
export interface StorageMatch {
	programId: string;
	name: string;
	nameFr: string;
	matchPercentage: number;
	field: string;
	reasons: string[];
	duration: string;
	salary: string;
	employmentRate?: number;
}
