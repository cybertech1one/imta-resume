import type { Icon } from "@phosphor-icons/react";

export type QuestionType = "multiple_choice" | "scale";

export interface QuestionOption {
	id: string;
	text: string;
	icon: Icon;
	scores: Record<string, number>;
}

export interface QuizQuestion {
	id: string;
	question: string;
	description?: string;
	category: "personality" | "interests" | "skills" | "work_preferences" | "values" | "moroccan_market";
	type: QuestionType;
	options?: QuestionOption[];
	scaleLabels?: { min: string; max: string };
	trait: string;
}

export interface QuizAnswer {
	questionId: string;
	optionId?: string;
	scaleValue?: number;
}

export interface PersonalityProfile {
	patient_care: number;
	technical_aptitude: number;
	safety_focus: number;
	leadership: number;
	teamwork: number;
	analytical: number;
	communication: number;
	stress_tolerance: number;
	physical_endurance: number;
	attention_to_detail: number;
}

export interface CareerMatch {
	programId: string;
	name: string;
	nameFr: string;
	matchPercentage: number;
	field: string;
	reasons: string[];
	icon: Icon;
	duration: string;
	salary: string;
	employmentRate?: number;
}

export interface TrainingRecommendation {
	programId: string;
	name: string;
	nameFr: string;
	description: string;
	duration: string;
	requirements: string;
	skills: string[];
	matchScore: number;
}

export interface NextStep {
	id: string;
	title: string;
	description: string;
	icon: Icon;
	link?: string;
	priority: "high" | "medium" | "low";
}

export interface ProgramData {
	id: string;
	name: string;
	nameFr: string;
	field: string;
	durationFr?: string;
	duration?: string;
	avgSalary?: string | number | null;
	employmentRate?: number | null;
	descriptionFr?: string;
	description?: string;
	requirementsFr?: string;
	requirements?: string;
	skills?: string[] | null;
	certifications?: string[] | null;
}
