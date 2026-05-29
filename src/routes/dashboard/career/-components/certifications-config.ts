import { t } from "@lingui/core/macro";
import {
	BookOpenIcon,
	BriefcaseIcon,
	CalendarIcon,
	CheckCircleIcon,
	ClockIcon,
	GearIcon,
	HardHatIcon,
	HeartIcon,
	WarningCircleIcon,
} from "@phosphor-icons/react";
import { z } from "zod";

import type {
	CategoryConfig,
	CertificationCategory,
	CertificationStatus,
	DbCertificationLibrary,
	RecommendedCertification,
	StatusConfig,
} from "./certifications-types";

// Category configuration - use function + Proxy to avoid Lingui race condition at module level
function getCategoryConfig(): Record<CertificationCategory, CategoryConfig> {
	return {
		healthcare: {
			label: t`Healthcare`,
			labelFr: t`Healthcare`,
			icon: HeartIcon,
			color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
		},
		industrial: {
			label: t`Industrial`,
			labelFr: t`Industrial`,
			icon: GearIcon,
			color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
		},
		hse: {
			label: t`HSE`,
			labelFr: t`HSE`,
			icon: HardHatIcon,
			color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
		},
		management: {
			label: t`Management`,
			labelFr: t`Management`,
			icon: BriefcaseIcon,
			color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
		},
		technical: {
			label: t`Technical`,
			labelFr: t`Technical`,
			icon: GearIcon,
			color: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400",
		},
		language: {
			label: t`Language`,
			labelFr: t`Language`,
			icon: BookOpenIcon,
			color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
		},
	};
}

export const CATEGORY_CONFIG: Record<CertificationCategory, CategoryConfig> = new Proxy(
	{} as Record<CertificationCategory, CategoryConfig>,
	{
		get(_target, prop: string) {
			return getCategoryConfig()[prop as CertificationCategory];
		},
		ownKeys() {
			return Object.keys(getCategoryConfig());
		},
		getOwnPropertyDescriptor(_target, prop) {
			const data = getCategoryConfig();
			if (prop in data) {
				return { configurable: true, enumerable: true, value: data[prop as CertificationCategory] };
			}
			return undefined;
		},
	},
);

// Status configuration - use function + Proxy to avoid Lingui race condition at module level
function getStatusConfig(): Record<CertificationStatus, StatusConfig> {
	return {
		completed: {
			label: t`Active`,
			labelFr: t`Active`,
			color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-500/30",
			icon: CheckCircleIcon,
		},
		expired: {
			label: t`Expired`,
			labelFr: t`Expired`,
			color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-500/30",
			icon: WarningCircleIcon,
		},
		in_progress: {
			label: t`In Progress`,
			labelFr: t`In Progress`,
			color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-500/30",
			icon: ClockIcon,
		},
		planned: {
			label: t`Planned`,
			labelFr: t`Planned`,
			color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-500/30",
			icon: CalendarIcon,
		},
	};
}

export const STATUS_CONFIG: Record<CertificationStatus, StatusConfig> = new Proxy(
	{} as Record<CertificationStatus, StatusConfig>,
	{
		get(_target, prop: string) {
			return getStatusConfig()[prop as CertificationStatus];
		},
		ownKeys() {
			return Object.keys(getStatusConfig());
		},
		getOwnPropertyDescriptor(_target, prop) {
			const data = getStatusConfig();
			if (prop in data) {
				return { configurable: true, enumerable: true, value: data[prop as CertificationStatus] };
			}
			return undefined;
		},
	},
);

// Validation schema for certification form
export function createCertificationFormSchema() {
	return z
		.object({
			name: z
				.string()
				.trim()
				.min(2, { message: t`Certification name must be at least 2 characters` })
				.max(200, { message: t`Certification name cannot exceed 200 characters` }),
			issuer: z
				.string()
				.trim()
				.min(2, { message: t`Issuer name must be at least 2 characters` })
				.max(100, { message: t`Issuer name cannot exceed 100 characters` }),
			category: z.enum(["healthcare", "industrial", "hse", "management", "technical", "language"]),
			status: z.enum(["completed", "expired", "in_progress", "planned"]),
			credentialId: z
				.string()
				.max(100, { message: t`Credential ID cannot exceed 100 characters` })
				.optional()
				.or(z.literal("")),
			credentialUrl: z.string().url({ message: t`Please enter a valid URL` }).optional().or(z.literal("")),
			issueDate: z.string().optional().or(z.literal("")),
			expiryDate: z.string().optional().or(z.literal("")),
			cost: z
				.number()
				.min(0, { message: t`Cost cannot be negative` })
				.max(1000000, { message: t`Cost cannot exceed 1,000,000` })
				.optional()
				.or(z.literal(0)),
			currency: z.string().min(1, { message: t`Currency is required` }),
			notes: z.string().max(1000, { message: t`Notes cannot exceed 1000 characters` }).optional().or(z.literal("")),
			reminderDays: z
				.number()
				.min(0, { message: t`Reminder cannot be negative` })
				.max(365, { message: t`Reminder cannot exceed 365 days` })
				.optional()
				.or(z.literal(30)),
		})
		.refine(
			(data) => {
				if (data.issueDate && data.expiryDate && data.issueDate !== "" && data.expiryDate !== "") {
					return new Date(data.expiryDate) > new Date(data.issueDate);
				}
				return true;
			},
			{
				message: t`Expiry date must be after the issue date`,
				path: ["expiryDate"],
			},
		);
}

export const certificationFormSchema = createCertificationFormSchema();

export type CertificationFormValues = z.infer<typeof certificationFormSchema>;

// Helper to convert database certification to RecommendedCertification format
export function mapDbToRecommended(cert: DbCertificationLibrary): RecommendedCertification {
	// Parse cost string to extract number and currency (e.g., "200 USD" -> 200, "USD")
	const costMatch = cert.cost?.match(/(\d+)\s*(\w+)/);
	const averageCost = costMatch ? Number.parseInt(costMatch[1], 10) : 0;
	const currency = costMatch?.[2] ?? "EUR";

	return {
		id: cert.id,
		name: cert.name,
		nameFr: cert.nameFr ?? cert.name,
		issuer: cert.provider,
		category: (cert.field as CertificationCategory) || "technical",
		description: cert.descriptionFr ?? cert.description ?? "",
		averageCost,
		currency,
		validityPeriod: cert.duration ?? "Variable",
		difficulty: (cert.level as "beginner" | "intermediate" | "advanced") || "intermediate",
		estimatedSalaryIncrease: 15, // Default value since not in DB
		demandLevel: cert.isRecommended ? "high" : "medium",
		industries: cert.skills?.slice(0, 3) ?? [], // Use skills as industries proxy
	};
}

// Fallback returns empty when database certification library has no data
// Seed data through /dashboard/admin/reference-data to populate the certification library
