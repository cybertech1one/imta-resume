import type { GlobeIcon } from "@phosphor-icons/react";
import { BriefcaseIcon, LinkedinLogoIcon, SparkleIcon } from "@phosphor-icons/react";
import z from "zod";

import type { DayOfWeek, FreelanceAvailability, PackageTier, PlatformType, SkillProficiency } from "./freelance-types";

export const PLATFORM_CONFIG: Record<
	PlatformType,
	{ label: string; icon: typeof GlobeIcon; color: string; bgColor: string }
> = {
	upwork: {
		label: "Upwork",
		icon: BriefcaseIcon,
		color: "text-green-600 dark:text-green-400",
		bgColor: "bg-green-100 dark:bg-green-900/30",
	},
	fiverr: {
		label: "Fiverr",
		icon: SparkleIcon,
		color: "text-emerald-600 dark:text-emerald-400",
		bgColor: "bg-emerald-100 dark:bg-emerald-900/30",
	},
	linkedin: {
		label: "LinkedIn",
		icon: LinkedinLogoIcon,
		color: "text-blue-600 dark:text-blue-400",
		bgColor: "bg-blue-100 dark:bg-blue-900/30",
	},
};

export const TIER_CONFIG: Record<PackageTier, { label: string; color: string; bgColor: string }> = {
	basic: {
		label: "Basic",
		color: "text-gray-600 dark:text-gray-400",
		bgColor: "bg-gray-100 dark:bg-gray-900/30",
	},
	standard: {
		label: "Standard",
		color: "text-blue-600 dark:text-blue-400",
		bgColor: "bg-blue-100 dark:bg-blue-900/30",
	},
	premium: {
		label: "Premium",
		color: "text-amber-600 dark:text-amber-400",
		bgColor: "bg-amber-100 dark:bg-amber-900/30",
	},
};

export const PROFICIENCY_CONFIG: Record<SkillProficiency, { label: string; value: number; color: string }> = {
	beginner: { label: "Beginner", value: 25, color: "bg-gray-400" },
	intermediate: { label: "Intermediate", value: 50, color: "bg-blue-400" },
	advanced: { label: "Advanced", value: 75, color: "bg-purple-400" },
	expert: { label: "Expert", value: 100, color: "bg-amber-400" },
};

export const DAYS_OF_WEEK: { key: DayOfWeek; label: string }[] = [
	{ key: "lun", label: "Mon" },
	{ key: "mar", label: "Tue" },
	{ key: "mer", label: "Wed" },
	{ key: "jeu", label: "Thu" },
	{ key: "ven", label: "Fri" },
	{ key: "sam", label: "Sat" },
	{ key: "dim", label: "Sun" },
];

export const DEFAULT_AVAILABILITY: FreelanceAvailability = {
	lun: true,
	mar: true,
	mer: true,
	jeu: true,
	ven: true,
	sam: false,
	dim: false,
};

// Validation schemas - using plain strings to avoid Lingui race condition at module scope
export const skillFormSchema = z.object({
	name: z.string().min(1, "Name is required").max(50, "Name cannot exceed 50 characters"),
	proficiency: z.enum(["beginner", "intermediate", "advanced", "expert"]),
	yearsExperience: z.number().min(0, "Experience must be positive").max(50, "Experience cannot exceed 50 years"),
});

export const packageFormSchema = z.object({
	tier: z.enum(["basic", "standard", "premium"]),
	name: z.string().min(1, "Name is required").max(100, "Name cannot exceed 100 characters"),
	description: z.string().max(500, "Description cannot exceed 500 characters").optional().or(z.literal("")),
	price: z.number().min(0, "Price must be positive").max(100000, "Price cannot exceed 100,000"),
	deliveryDays: z
		.number()
		.min(1, "Delivery time must be at least 1 day")
		.max(365, "Delivery time cannot exceed 365 days"),
	revisions: z
		.number()
		.min(-1, "Revisions must be positive or -1 for unlimited")
		.max(100, "Revisions cannot exceed 100"),
	features: z.array(z.string()).optional(),
});

export type SkillFormValues = z.infer<typeof skillFormSchema>;
export type PackageFormValues = z.infer<typeof packageFormSchema>;
