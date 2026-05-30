import type { Icon } from "@phosphor-icons/react";

export interface Job {
	id: string;
	title: string;
	company: string;
	companyLogo?: string;
	location: string;
	region: string;
	field: "healthcare" | "industrial" | "hse" | "technology" | "management" | "general";
	experienceLevel: "entry" | "junior" | "mid" | "senior";
	salaryMin?: number;
	salaryMax?: number;
	currency: string;
	postedDate: string;
	description: string;
	requirements: string[];
	skills: string[];
	howToApply: string;
	featured?: boolean;
	urgent?: boolean;
}

export interface Employer {
	id: string;
	name: string;
	industry: string;
	logo?: string;
	location: string;
	openPositions: number;
	description: string;
	featured?: boolean;
}

export interface Application {
	id: string;
	jobId: string;
	jobTitle: string;
	company: string;
	appliedDate: string;
	status: "pending" | "interview" | "accepted" | "rejected";
	notes: string;
}

export interface MarketInsight {
	id: string;
	title: string;
	value: string;
	change?: string;
	trend: "up" | "down" | "stable";
	description: string;
	icon: Icon;
}
