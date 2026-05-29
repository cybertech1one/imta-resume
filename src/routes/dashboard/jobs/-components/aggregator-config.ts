import type { Icon } from "@phosphor-icons/react";
import {
	BriefcaseIcon,
	BuildingsIcon,
	CheckCircleIcon,
	ClockIcon,
	CurrencyCircleDollarIcon,
	FirstAidKitIcon,
	GearIcon,
	GlobeIcon,
	HardHatIcon,
	HouseIcon,
	LinkedinLogoIcon,
	RocketLaunchIcon,
	StarIcon,
	UserIcon,
	XIcon,
} from "@phosphor-icons/react";

import type {
	ApplicationStatus,
	ExperienceLevel,
	Industry,
	IndustryRecommendation,
	JobSource,
	SearchFilters,
	WorkType,
} from "./aggregator-types";

// Source configuration
export const sourceConfig: Record<JobSource, { label: string; color: string; icon: Icon; bgColor: string }> = {
	linkedin: {
		label: "LinkedIn",
		color: "text-blue-600 dark:text-blue-400",
		icon: LinkedinLogoIcon,
		bgColor: "bg-blue-100 dark:bg-blue-900/30",
	},
	indeed: {
		label: "Indeed",
		color: "text-indigo-600 dark:text-indigo-400",
		icon: BriefcaseIcon,
		bgColor: "bg-indigo-100 dark:bg-indigo-900/30",
	},
	glassdoor: {
		label: "Glassdoor",
		color: "text-green-600 dark:text-green-400",
		icon: BuildingsIcon,
		bgColor: "bg-green-100 dark:bg-green-900/30",
	},
};

// Industry configuration
export const industryConfig: Record<Industry, { label: string; icon: Icon; color: string }> = {
	healthcare: {
		label: "Healthcare",
		icon: FirstAidKitIcon,
		color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
	},
	industrial: {
		label: "Industrial",
		icon: GearIcon,
		color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
	},
	hse: {
		label: "HSE",
		icon: HardHatIcon,
		color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
	},
	tech: {
		label: "Technology",
		icon: RocketLaunchIcon,
		color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
	},
	finance: {
		label: "Finance",
		icon: CurrencyCircleDollarIcon,
		color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
	},
	general: {
		label: "General",
		icon: BriefcaseIcon,
		color: "bg-gray-100 text-gray-700 dark:bg-gray-800/30 dark:text-gray-400",
	},
};

// Experience level configuration
export const experienceConfig: Record<ExperienceLevel, { label: string; years: string }> = {
	entry: { label: "Entry Level", years: "0-1 yr" },
	junior: { label: "Junior", years: "1-3 yrs" },
	mid: { label: "Mid-Level", years: "3-5 yrs" },
	senior: { label: "Senior", years: "5-8 yrs" },
	lead: { label: "Lead/Manager", years: "8+ yrs" },
};

// Work type configuration
export const workTypeConfig: Record<WorkType, { label: string; icon: Icon }> = {
	onsite: { label: "On-site", icon: BuildingsIcon },
	remote: { label: "Remote", icon: HouseIcon },
	hybrid: { label: "Hybrid", icon: GlobeIcon },
};

// Application status configuration
export const applicationStatusConfig: Record<ApplicationStatus, { label: string; color: string; icon: Icon }> = {
	not_applied: {
		label: "Not Applied",
		color: "bg-gray-100 text-gray-600 dark:bg-gray-800/30 dark:text-gray-400",
		icon: ClockIcon,
	},
	applied: {
		label: "Applied",
		color: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
		icon: CheckCircleIcon,
	},
	interview: {
		label: "Interview",
		color: "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400",
		icon: UserIcon,
	},
	offer: {
		label: "Offer Received",
		color: "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400",
		icon: StarIcon,
	},
	rejected: {
		label: "Rejected",
		color: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
		icon: XIcon,
	},
};

// Locations
export const locations = [
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
	"International",
];

// Industry recommendations
export const industryRecommendations: IndustryRecommendation[] = [
	{
		industry: "healthcare",
		platforms: [
			{ source: "linkedin", strength: "high", description: "Best for private clinic positions" },
			{ source: "indeed", strength: "medium", description: "Good for public hospitals" },
			{ source: "glassdoor", strength: "low", description: "Few healthcare positions in Morocco" },
		],
		tips: [
			"Prioritize LinkedIn for private clinics",
			"Check university hospital websites directly",
			"Join professional healthcare groups",
		],
	},
	{
		industry: "industrial",
		platforms: [
			{ source: "indeed", strength: "high", description: "Leader for technical positions" },
			{ source: "linkedin", strength: "high", description: "Excellent for multinationals" },
			{ source: "glassdoor", strength: "medium", description: "Good for company reviews" },
		],
		tips: [
			"Target industrial zones (Tanger Med, Casablanca)",
			"Highlight your technical certifications",
			"Automotive companies are actively recruiting",
		],
	},
	{
		industry: "hse",
		platforms: [
			{ source: "linkedin", strength: "high", description: "Essential for HSE positions" },
			{ source: "indeed", strength: "medium", description: "Production/field positions" },
			{ source: "glassdoor", strength: "medium", description: "To evaluate safety culture" },
		],
		tips: [
			"ISO 45001 certifications are highly sought after",
			"Audit experience is a major advantage",
			"Oil/gas sectors offer the best salaries",
		],
	},
	{
		industry: "tech",
		platforms: [
			{ source: "linkedin", strength: "high", description: "Essential for tech" },
			{ source: "glassdoor", strength: "high", description: "Widely used by startups" },
			{ source: "indeed", strength: "medium", description: "Technical support positions" },
		],
		tips: [
			"A GitHub portfolio is essential",
			"Casablanca and Rabat concentrate the opportunities",
			"International freelancing is a viable option",
		],
	},
	{
		industry: "finance",
		platforms: [
			{ source: "linkedin", strength: "high", description: "Banks and insurance companies recruit here" },
			{ source: "glassdoor", strength: "medium", description: "To compare compensation packages" },
			{ source: "indeed", strength: "low", description: "Few finance job postings" },
		],
		tips: [
			"Banks prefer direct applications",
			"CFA/ACCA certifications are valued",
			"Casablanca Finance City offers opportunities",
		],
	},
	{
		industry: "general",
		platforms: [
			{ source: "indeed", strength: "high", description: "Very broad coverage" },
			{ source: "linkedin", strength: "high", description: "Effective networking" },
			{ source: "glassdoor", strength: "medium", description: "For company research" },
		],
		tips: [
			"Use all platforms to maximize your chances",
			"Customize your resume for the target sector",
			"Networking remains the best channel",
		],
	},
];

// Default filters
export const defaultFilters: SearchFilters = {
	sources: ["linkedin", "indeed", "glassdoor"],
	salaryMin: 0,
	salaryMax: 30000,
	locations: [],
	workTypes: [],
	experienceLevels: [],
	industries: [],
};
