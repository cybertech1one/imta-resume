import { FirstAidKitIcon, GearIcon, HardHatIcon } from "@phosphor-icons/react";

import type { Field, FieldConfig, IndustryOutlook } from "./trends-types";

// ============================================================================
// UI CONFIGURATION (not data — these define how fields are displayed)
// ============================================================================

export const fieldConfig: Record<Field, FieldConfig> = {
	healthcare: {
		label: "Santé",
		icon: FirstAidKitIcon,
		color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
		gradient: "from-red-500/20 via-rose-500/10 to-transparent",
	},
	industrial: {
		label: "Industrie",
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
			"Expansion du secteur hospitalier privé",
			"Vieillissement de la population",
			"Nouveaux centres de soins régionaux",
			"Programmes publics de santé",
		],
		challenges: ["Concurrence internationale sur les profils qualifiés", "Besoin de formation continue"],
		opportunities: ["Spécialisation en soins critiques", "Télésanté et outils numériques", "Rôles de coordination"],
	},
	{
		field: "industrial",
		outlook: "positive",
		growthRate: 15,
		keyDrivers: [
			"Zone industrielle Tanger Med",
			"Investissements automobiles",
			"Développement de l'aéronautique",
			"Grands projets d'infrastructure",
		],
		challenges: ["Automatisation en hausse", "Compétences numériques nécessaires"],
		opportunities: ["Maintenance 4.0", "Énergies renouvelables", "Automobile électrique"],
	},
	{
		field: "hse",
		outlook: "positive",
		growthRate: 18,
		keyDrivers: [
			"Réglementation plus stricte",
			"Certifications ISO demandées",
			"Sensibilité environnementale en hausse",
			"Expansion industrielle",
		],
		challenges: ["Normes en évolution constante", "Besoin de certifications multiples"],
		opportunities: ["Conseil indépendant", "Postes de management HSE", "Audit et certification"],
	},
];

export const EMERGING_JOBS_EDITORIAL = [
	{
		title: "Spécialiste télésanté",
		field: "healthcare" as Field,
		growth: 45,
		description: "Soins à distance et consultation digitale",
	},
	{
		title: "Technicien maintenance 4.0",
		field: "industrial" as Field,
		growth: 38,
		description: "Maintenance prédictive avec IoT et IA",
	},
	{
		title: "Responsable RSE/HSE",
		field: "hse" as Field,
		growth: 35,
		description: "Intégration durabilité et sécurité",
	},
	{
		title: "Coordinateur qualité des soins",
		field: "healthcare" as Field,
		growth: 28,
		description: "Assurance qualité dans les établissements de santé",
	},
	{
		title: "Expert énergie verte",
		field: "industrial" as Field,
		growth: 42,
		description: "Transition énergétique industrielle",
	},
];

export const formatCurrency = (amount: number) => `${amount.toLocaleString("fr-FR")} DH`;
