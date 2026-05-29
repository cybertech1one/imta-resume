import { FirstAidKitIcon, GearIcon, HardHatIcon } from "@phosphor-icons/react";

import type { Field, FieldConfig, IndustryOutlook } from "./trends-types";

// ============================================================================
// UI CONFIGURATION (not data — these define how fields are displayed)
// ============================================================================

export const fieldConfig: Record<Field, FieldConfig> = {
	healthcare: {
		label: "Healthcare",
		icon: FirstAidKitIcon,
		color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
		gradient: "from-red-500/20 via-rose-500/10 to-transparent",
	},
	industrial: {
		label: "Industrial",
		icon: GearIcon,
		color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
		gradient: "from-blue-500/20 via-indigo-500/10 to-transparent",
	},
	hse: {
		label: "HSE",
		icon: HardHatIcon,
		color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
		gradient: "from-amber-500/20 via-orange-500/10 to-transparent",
	},
};

// ============================================================================
// EDITORIAL CONTENT (qualitative analysis — not numeric market data)
// These are expert-written sector assessments with text descriptions,
// key drivers, challenges, and opportunities. This is editorial/configuration
// content, not database-driven statistics.
// ============================================================================

export const INDUSTRY_OUTLOOK_EDITORIAL: IndustryOutlook[] = [
	{
		field: "healthcare",
		outlook: "positive",
		growthRate: 12,
		keyDrivers: [
			"Private hospital sector expansion",
			"Aging population",
			"New regional care centers",
			"Government health programs",
		],
		challenges: ["International competition for talent", "Need for continuous training"],
		opportunities: ["Critical care specialization", "Telehealth and digital", "Coordination roles"],
	},
	{
		field: "industrial",
		outlook: "positive",
		growthRate: 15,
		keyDrivers: [
			"Tanger Med industrial zone",
			"Automotive investments",
			"Growing aerospace industry",
			"Major infrastructure projects",
		],
		challenges: ["Increasing automation", "Need for digital skills"],
		opportunities: ["Maintenance 4.0", "Renewable energy", "Electric automotive industry"],
	},
	{
		field: "hse",
		outlook: "positive",
		growthRate: 18,
		keyDrivers: [
			"Stricter regulations",
			"Mandatory ISO certifications",
			"Growing environmental awareness",
			"Industrial expansion",
		],
		challenges: ["Constantly evolving standards", "Need for multiple certifications"],
		opportunities: ["Independent consulting", "HSE management positions", "Audit and certification"],
	},
];

export const EMERGING_JOBS_EDITORIAL = [
	{
		title: "Telehealth Specialist",
		field: "healthcare" as Field,
		growth: 45,
		description: "Remote care and digital consultation",
	},
	{
		title: "Maintenance 4.0 Technician",
		field: "industrial" as Field,
		growth: 38,
		description: "Predictive maintenance with IoT and AI",
	},
	{
		title: "CSR/HSE Manager",
		field: "hse" as Field,
		growth: 35,
		description: "Sustainability and safety integration",
	},
	{
		title: "Care Quality Coordinator",
		field: "healthcare" as Field,
		growth: 28,
		description: "Quality assurance in healthcare facilities",
	},
	{
		title: "Green Energy Expert",
		field: "industrial" as Field,
		growth: 42,
		description: "Industrial energy transition",
	},
];

export const formatCurrency = (amount: number) => `${amount.toLocaleString()} DH`;
