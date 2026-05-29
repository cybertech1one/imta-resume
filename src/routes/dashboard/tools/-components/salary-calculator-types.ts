import type { Icon } from "@phosphor-icons/react";

export interface SalaryRange {
	min: number;
	max: number;
	median: number;
}

export interface SalaryBreakdown {
	baseSalary: SalaryRange;
	bonuses: SalaryRange;
	benefitsValue: SalaryRange;
	total: SalaryRange;
}

export interface CareerProjection {
	year: number;
	salary: number;
	position: string;
	growthRate: number;
}

export interface RegionalComparison {
	region: string;
	salary: number;
	costOfLiving: number;
	jobAvailability: "low" | "medium" | "high";
}

export type ExperienceLevel = "0-1" | "1-3" | "3-5" | "5-10" | "10+";
export type Field = "healthcare" | "industrial" | "hse";

export interface FieldConfig {
	label: string;
	icon: Icon;
	color: string;
	gradient: string;
}

export interface JobTitle {
	id: string;
	label: string;
	baseSalary: number;
}

export interface Region {
	id: string;
	label: string;
	multiplier: number;
	costOfLiving: number;
	jobs: "low" | "medium" | "high";
}
