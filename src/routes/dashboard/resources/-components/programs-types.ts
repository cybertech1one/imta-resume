import type { Icon } from "@phosphor-icons/react";

// Field type for training programs
export type ProgramField = "healthcare" | "industrial" | "hse" | "business";

export interface TrainingProgram {
	id: string;
	name: string;
	field: ProgramField;
	duration: string;
	durationMonths: number;
	description: string;
	prerequisites: string[];
	careerOutcomes: string[];
	certification: string;
	salaryMin: number;
	salaryMax: number;
	salaryCurrency: string;
	icon: string;
	employmentRate: number;
	demandLevel: "very_high" | "high" | "medium" | "low";
}

export interface TrainingInterest {
	id: string;
	programId: string;
	programName: string;
	field: ProgramField;
	addedAt: string;
	notes: string;
	isCustom: boolean;
	customDetails?: {
		duration?: string;
		institution?: string;
		description?: string;
	};
}

// Database training interest type (from API)
export interface DbTrainingInterest {
	id: string;
	userId: string;
	programId: string;
	programName: string;
	programType: "imta_program" | "external_course" | "certification" | "bootcamp" | "self_learning";
	category: "healthcare" | "industrial" | "hse" | "technology" | "business" | "other";
	status: "interested" | "in_progress" | "completed";
	startDate: Date | null;
	completionDate: Date | null;
	notes: string | null;
	createdAt: Date;
	updatedAt: Date;
}

// Field configuration shape
export interface FieldConfigEntry {
	label: string;
	icon: Icon;
	color: string;
	gradient: string;
	bgColor: string;
}

// Program Card Component Props
export interface ProgramCardProps {
	program: TrainingProgram;
	index: number;
	isSelected: boolean;
	isInInterests: boolean;
	onToggleCompare: () => void;
	onAddToInterests: () => void;
	compareDisabled: boolean;
}
