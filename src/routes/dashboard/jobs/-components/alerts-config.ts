import type { Icon } from "@phosphor-icons/react";
import {
	BuildingsIcon,
	CalendarIcon,
	ClockIcon,
	GlobeIcon,
	HouseIcon,
	LightningIcon,
	MapPinIcon,
} from "@phosphor-icons/react";

import type { MatchQuality, NotificationFrequency, WorkPreference } from "./alerts-types";

export const INDUSTRIES = [
	{ value: "healthcare", label: "Santé" },
	{ value: "industrial", label: "Industrie" },
	{ value: "hse", label: "HSE / Sécurité" },
	{ value: "tech", label: "Technologie" },
	{ value: "finance", label: "Finance" },
	{ value: "education", label: "Éducation" },
	{ value: "retail", label: "Commerce" },
	{ value: "hospitality", label: "Hôtellerie" },
	{ value: "construction", label: "Construction" },
	{ value: "logistics", label: "Logistique" },
];

export const COMPANY_SIZES = [
	{ value: "startup", label: "Startup (1-50)" },
	{ value: "small", label: "PME (51-200)" },
	{ value: "medium", label: "Entreprise moyenne (201-1000)" },
	{ value: "large", label: "Grande entreprise (1000+)" },
	{ value: "multinational", label: "Multinational" },
];

export const LOCATIONS = [
	"Casablanca",
	"Rabat",
	"Tanger",
	"Marrakech",
	"Fès",
	"Agadir",
	"Meknès",
	"Oujda",
	"Kénitra",
	"National",
];

export const WORK_PREFERENCE_CONFIG: Record<WorkPreference, { label: string; icon: Icon; color: string }> = {
	remote: { label: "À distance", icon: GlobeIcon, color: "text-green-600" },
	hybrid: { label: "Hybride", icon: HouseIcon, color: "text-blue-600" },
	onsite: { label: "Sur site", icon: BuildingsIcon, color: "text-amber-600" },
	any: { label: "Tous", icon: MapPinIcon, color: "text-gray-600" },
};

export const FREQUENCY_CONFIG: Record<NotificationFrequency, { label: string; description: string; icon: Icon }> = {
	instant: { label: "Instantané", description: "Notification immédiate", icon: LightningIcon },
	daily: { label: "Quotidien", description: "Résumé quotidien", icon: CalendarIcon },
	weekly: { label: "Hebdomadaire", description: "Résumé hebdomadaire", icon: ClockIcon },
};

export const MATCH_QUALITY_CONFIG: Record<
	MatchQuality,
	{ label: string; color: string; bgColor: string; minScore: number }
> = {
	excellent: {
		label: "Excellent",
		color: "text-green-600",
		bgColor: "bg-green-100 dark:bg-green-900/30",
		minScore: 85,
	},
	good: { label: "Bon", color: "text-blue-600", bgColor: "bg-blue-100 dark:bg-blue-900/30", minScore: 70 },
	fair: { label: "Correct", color: "text-amber-600", bgColor: "bg-amber-100 dark:bg-amber-900/30", minScore: 0 },
};
