import { FirstAidKitIcon, GearIcon, HardHatIcon } from "@phosphor-icons/react";

import type { AlumniStats, CategoryIconRecord, CategoryRecord, ProgramOption } from "./success-stories-types";

// Category configurations
export const categoryIcons: CategoryIconRecord = {
	healthcare: FirstAidKitIcon,
	industrial: GearIcon,
	hse: HardHatIcon,
};

export const categoryLabels: CategoryRecord = {
	healthcare: "Healthcare",
	industrial: "Industrial",
	hse: "HSE",
};

export const categoryColors: CategoryRecord = {
	healthcare: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
	industrial: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
	hse: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
};

export const categoryGradients: CategoryRecord = {
	healthcare: "from-red-500 to-rose-600",
	industrial: "from-blue-500 to-indigo-600",
	hse: "from-amber-500 to-orange-600",
};

// Programs data for filtering
export const programs: ProgramOption[] = [
	{ id: "sage-femme", name: "Midwife", category: "healthcare" },
	{ id: "infirmier-polyvalent", name: "General Nurse", category: "healthcare" },
	{ id: "aide-soignant", name: "Nursing Assistant", category: "healthcare" },
	{ id: "infirmier-auxiliaire", name: "Auxiliary Nurse", category: "healthcare" },
	{ id: "hse-specialist", name: "HSE Specialist", category: "hse" },
	{ id: "conducteur-engins", name: "Heavy Equipment Operator", category: "industrial" },
	{ id: "mecanique-engins", name: "Heavy Equipment Mechanic", category: "industrial" },
	{ id: "tourneur-industriel", name: "Industrial Lathe Operator", category: "industrial" },
	{ id: "cariste-professionnel", name: "Professional Forklift Operator", category: "industrial" },
];

// Alumni statistics
export const alumniStats: AlumniStats = {
	totalEmployed: 12847,
	employmentRate: 94,
	averageTimeToJob: 2.3,
	salaryGrowth5Years: 85,
	topEmployers: [
		{ name: "OCP Group", count: 2150 },
		{ name: "Public Hospitals", count: 1890 },
		{ name: "Renault-Nissan", count: 1420 },
		{ name: "Private Clinics", count: 1180 },
		{ name: "LafargeHolcim", count: 890 },
	],
};
