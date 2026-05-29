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
	{ value: "healthcare", label: "Healthcare" },
	{ value: "industrial", label: "Industrial" },
	{ value: "hse", label: "HSE / Safety" },
	{ value: "tech", label: "Technology" },
	{ value: "finance", label: "Finance" },
	{ value: "education", label: "Education" },
	{ value: "retail", label: "Retail" },
	{ value: "hospitality", label: "Hospitality" },
	{ value: "construction", label: "Construction" },
	{ value: "logistics", label: "Logistics" },
];

export const COMPANY_SIZES = [
	{ value: "startup", label: "Startup (1-50)" },
	{ value: "small", label: "SMB (51-200)" },
	{ value: "medium", label: "Mid-size (201-1000)" },
	{ value: "large", label: "Enterprise (1000+)" },
	{ value: "multinational", label: "Multinational" },
];

export const LOCATIONS = [
	"Casablanca",
	"Rabat",
	"Tanger",
	"Marrakech",
	"Fes",
	"Agadir",
	"Meknes",
	"Oujda",
	"Kenitra",
	"National",
];

export const WORK_PREFERENCE_CONFIG: Record<WorkPreference, { label: string; icon: Icon; color: string }> = {
	remote: { label: "Remote", icon: GlobeIcon, color: "text-green-600" },
	hybrid: { label: "Hybrid", icon: HouseIcon, color: "text-blue-600" },
	onsite: { label: "On-site", icon: BuildingsIcon, color: "text-amber-600" },
	any: { label: "Any", icon: MapPinIcon, color: "text-gray-600" },
};

export const FREQUENCY_CONFIG: Record<NotificationFrequency, { label: string; description: string; icon: Icon }> = {
	instant: { label: "Instant", description: "Notified immediately", icon: LightningIcon },
	daily: { label: "Daily", description: "Daily summary", icon: CalendarIcon },
	weekly: { label: "Weekly", description: "Weekly summary", icon: ClockIcon },
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
	good: { label: "Good", color: "text-blue-600", bgColor: "bg-blue-100 dark:bg-blue-900/30", minScore: 70 },
	fair: { label: "Fair", color: "text-amber-600", bgColor: "bg-amber-100 dark:bg-amber-900/30", minScore: 0 },
};
