import type { Icon } from "@phosphor-icons/react";

// Types
export type CertificationStatus = "completed" | "expired" | "in_progress" | "planned";
export type CertificationCategory = "healthcare" | "industrial" | "hse" | "management" | "technical" | "language";

// Database certification type (matches the schema)
export interface DbCertification {
	id: string;
	userId: string;
	name: string;
	issuer: string;
	category: string | null;
	status: CertificationStatus;
	credentialId: string | null;
	credentialUrl: string | null;
	issueDate: Date | null;
	expiryDate: Date | null;
	cost: number | null;
	currency: string | null;
	notes: string | null;
	reminderDays: number | null;
	createdAt: Date;
	updatedAt: Date;
}

export interface RecommendedCertification {
	id: string;
	name: string;
	nameFr: string;
	issuer: string;
	category: CertificationCategory;
	description: string;
	averageCost: number;
	currency: string;
	validityPeriod: string;
	difficulty: "beginner" | "intermediate" | "advanced";
	estimatedSalaryIncrease: number;
	demandLevel: "high" | "medium" | "low";
	industries: string[];
}

// Database certification library type (maps to certificationLibrary table)
export interface DbCertificationLibrary {
	id: string;
	name: string;
	nameFr: string | null;
	provider: string;
	field: string;
	level: string | null;
	duration: string | null;
	cost: string | null;
	description: string | null;
	descriptionFr: string | null;
	skills: string[] | null;
	prerequisites: string[] | null;
	url: string | null;
	isRecommended: boolean | null;
	isActive: boolean;
	sortOrder: number | null;
	createdAt: Date;
	updatedAt: Date;
}

// Form data type
export interface CertificationFormData {
	name: string;
	issuer: string;
	category: CertificationCategory;
	status: CertificationStatus;
	credentialId: string;
	credentialUrl: string;
	issueDate: string;
	expiryDate: string;
	cost: number;
	currency: string;
	notes: string;
	reminderDays: number;
}

export interface CategoryConfig {
	label: string;
	labelFr: string;
	icon: Icon;
	color: string;
}

export interface StatusConfig {
	label: string;
	labelFr: string;
	color: string;
	icon: Icon;
}
