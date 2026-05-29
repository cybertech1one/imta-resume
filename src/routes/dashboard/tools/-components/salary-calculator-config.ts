import { FirstAidKitIcon, GearIcon, HardHatIcon } from "@phosphor-icons/react";

import type { ExperienceLevel, Field, FieldConfig, JobTitle, Region } from "./salary-calculator-types";

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

export const jobTitles: Record<Field, JobTitle[]> = {
	healthcare: [
		{ id: "sage_femme", label: "Midwife", baseSalary: 6000 },
		{ id: "infirmier_polyvalent", label: "General Nurse", baseSalary: 5500 },
		{ id: "infirmier_bloc", label: "Operating Room Nurse", baseSalary: 7000 },
		{ id: "infirmier_auxiliaire", label: "Auxiliary Nurse", baseSalary: 4500 },
		{ id: "aide_soignant", label: "Nursing Assistant", baseSalary: 3500 },
		{ id: "coordinateur_soins", label: "Care Coordinator", baseSalary: 9000 },
		{ id: "directeur_soins", label: "Director of Nursing", baseSalary: 15000 },
	],
	industrial: [
		{ id: "technicien_maintenance", label: "Maintenance Technician", baseSalary: 5500 },
		{ id: "mecanicien_industriel", label: "Industrial Mechanic", baseSalary: 5000 },
		{ id: "electromecanique", label: "Electromechanical Technician", baseSalary: 6000 },
		{ id: "conducteur_engins", label: "Heavy Equipment Operator", baseSalary: 5500 },
		{ id: "mecanicien_engins", label: "Heavy Equipment Mechanic", baseSalary: 6500 },
		{ id: "soudeur", label: "Industrial Welder", baseSalary: 5000 },
		{ id: "tourneur_industriel", label: "Industrial Lathe Operator", baseSalary: 4800 },
		{ id: "chef_equipe", label: "Maintenance Team Leader", baseSalary: 8500 },
		{ id: "responsable_maintenance", label: "Maintenance Manager", baseSalary: 12000 },
	],
	hse: [
		{ id: "agent_hse", label: "HSE Agent", baseSalary: 5500 },
		{ id: "technicien_hse", label: "HSE Technician", baseSalary: 6500 },
		{ id: "coordinateur_hse", label: "HSE Coordinator", baseSalary: 8500 },
		{ id: "specialiste_hse", label: "HSE Specialist", baseSalary: 9500 },
		{ id: "responsable_hse", label: "Site HSE Manager", baseSalary: 12000 },
		{ id: "directeur_hse", label: "HSE Director", baseSalary: 18000 },
		{ id: "consultant_hse", label: "Senior HSE Consultant", baseSalary: 20000 },
	],
};

export const experienceMultipliers: Record<ExperienceLevel, number> = {
	"0-1": 1.0,
	"1-3": 1.2,
	"3-5": 1.45,
	"5-10": 1.8,
	"10+": 2.2,
};

export const experienceLabels: Record<ExperienceLevel, string> = {
	"0-1": "Entry Level (0-1 yr)",
	"1-3": "Junior (1-3 yrs)",
	"3-5": "Intermediate (3-5 yrs)",
	"5-10": "Senior (5-10 yrs)",
	"10+": "Expert (10+ yrs)",
};

export const regions: Region[] = [
	{ id: "casablanca", label: "Casablanca", multiplier: 1.15, costOfLiving: 110, jobs: "high" },
	{ id: "rabat", label: "Rabat", multiplier: 1.1, costOfLiving: 105, jobs: "high" },
	{ id: "tanger", label: "Tanger", multiplier: 1.05, costOfLiving: 95, jobs: "high" },
	{ id: "marrakech", label: "Marrakech", multiplier: 1.0, costOfLiving: 90, jobs: "medium" },
	{ id: "fes", label: "Fes", multiplier: 0.95, costOfLiving: 85, jobs: "medium" },
	{ id: "agadir", label: "Agadir", multiplier: 1.0, costOfLiving: 90, jobs: "medium" },
	{ id: "meknes", label: "Meknes", multiplier: 0.9, costOfLiving: 80, jobs: "low" },
	{ id: "oujda", label: "Oujda", multiplier: 0.9, costOfLiving: 75, jobs: "low" },
	{ id: "kenitra", label: "Kenitra", multiplier: 0.95, costOfLiving: 85, jobs: "medium" },
	{ id: "laayoune", label: "Laayoune", multiplier: 1.2, costOfLiving: 100, jobs: "low" },
];

export const BENEFITS_PERCENTAGE = 0.15;
export const BONUS_PERCENTAGE = 0.1;
