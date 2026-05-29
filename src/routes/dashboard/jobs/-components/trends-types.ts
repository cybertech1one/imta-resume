import type { Icon } from "@phosphor-icons/react";

export type Field = "healthcare" | "industrial" | "hse";

export interface TrendData {
	label: string;
	value: number;
	change: number;
	trend: "up" | "down" | "stable";
}

export interface SkillDemand {
	skill: string;
	demand: number;
	growth: number;
	field: Field;
}

export interface SalaryTrend {
	position: string;
	field: Field;
	salaryMin: number;
	salaryMax: number;
	salaryMedian: number;
	changeFromLastYear: number;
}

export interface RegionalData {
	region: string;
	jobs: number;
	growth: number;
	avgSalary: number;
	topField: Field;
}

export interface IndustryOutlook {
	field: Field;
	outlook: "positive" | "stable" | "challenging";
	growthRate: number;
	keyDrivers: string[];
	challenges: string[];
	opportunities: string[];
}

export interface FieldConfig {
	label: string;
	icon: Icon;
	color: string;
	gradient: string;
}
