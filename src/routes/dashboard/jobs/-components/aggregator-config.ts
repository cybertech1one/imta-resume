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
		label: "Santé",
		icon: FirstAidKitIcon,
		color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
	},
	industrial: {
		label: "Industrie",
		icon: GearIcon,
		color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
	},
	hse: {
		label: "HSE",
		icon: HardHatIcon,
		color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
	},
	tech: {
		label: "Technologie",
		icon: RocketLaunchIcon,
		color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
	},
	finance: {
		label: "Finance",
		icon: CurrencyCircleDollarIcon,
		color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
	},
	general: {
		label: "Général",
		icon: BriefcaseIcon,
		color: "bg-gray-100 text-gray-700 dark:bg-gray-800/30 dark:text-gray-400",
	},
};

// Experience level configuration
export const experienceConfig: Record<ExperienceLevel, { label: string; years: string }> = {
	entry: { label: "Débutant", years: "0-1 an" },
	junior: { label: "Junior", years: "1-3 ans" },
	mid: { label: "Intermédiaire", years: "3-5 ans" },
	senior: { label: "Senior", years: "5-8 ans" },
	lead: { label: "Responsable", years: "8+ ans" },
};

// Work type configuration
export const workTypeConfig: Record<WorkType, { label: string; icon: Icon }> = {
	onsite: { label: "Sur site", icon: BuildingsIcon },
	remote: { label: "À distance", icon: HouseIcon },
	hybrid: { label: "Hybride", icon: GlobeIcon },
};

// Application status configuration
export const applicationStatusConfig: Record<ApplicationStatus, { label: string; color: string; icon: Icon }> = {
	not_applied: {
		label: "Non postulée",
		color: "bg-gray-100 text-gray-600 dark:bg-gray-800/30 dark:text-gray-400",
		icon: ClockIcon,
	},
	applied: {
		label: "Candidature envoyée",
		color: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
		icon: CheckCircleIcon,
	},
	interview: {
		label: "Entretien",
		color: "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400",
		icon: UserIcon,
	},
	offer: {
		label: "Offre reçue",
		color: "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400",
		icon: StarIcon,
	},
	rejected: {
		label: "Refusée",
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
	"Fès",
	"Agadir",
	"Meknès",
	"Oujda",
	"Kénitra",
	"National",
	"International",
];

// Industry recommendations
export const industryRecommendations: IndustryRecommendation[] = [
	{
		industry: "healthcare",
		platforms: [
			{ source: "linkedin", strength: "high", description: "Très utile pour les cliniques privées" },
			{ source: "indeed", strength: "medium", description: "Bon complément pour les hôpitaux et centres publics" },
			{ source: "glassdoor", strength: "low", description: "Peu d'offres santé au Maroc" },
		],
		tips: [
			"Priorise LinkedIn pour les cliniques privées",
			"Consulte aussi les sites des CHU et hôpitaux",
			"Rejoins des groupes professionnels santé au Maroc",
		],
	},
	{
		industry: "industrial",
		platforms: [
			{ source: "indeed", strength: "high", description: "Très présent sur les postes techniques" },
			{ source: "linkedin", strength: "high", description: "Excellent pour les multinationales" },
			{ source: "glassdoor", strength: "medium", description: "Utile pour comparer les entreprises" },
		],
		tips: [
			"Cible les zones industrielles comme Tanger Med et Casablanca",
			"Mets en avant tes certifications techniques",
			"L'automobile recrute régulièrement des profils juniors",
		],
	},
	{
		industry: "hse",
		platforms: [
			{ source: "linkedin", strength: "high", description: "Indispensable pour les offres HSE" },
			{ source: "indeed", strength: "medium", description: "Bon pour les postes terrain et production" },
			{ source: "glassdoor", strength: "medium", description: "Utile pour évaluer la culture sécurité" },
		],
		tips: [
			"Les bases ISO 45001 sont très valorisées",
			"Toute expérience d'audit est un avantage clair",
			"Les secteurs énergie et industrie offrent souvent de meilleurs salaires",
		],
	},
	{
		industry: "tech",
		platforms: [
			{ source: "linkedin", strength: "high", description: "Très fort pour les postes tech" },
			{ source: "glassdoor", strength: "high", description: "Utile pour les startups et salaires" },
			{ source: "indeed", strength: "medium", description: "Bon pour support technique et junior" },
		],
		tips: [
			"Un portfolio GitHub renforce beaucoup le profil",
			"Casablanca et Rabat concentrent beaucoup d'opportunités",
			"Le freelancing international peut compléter la recherche",
		],
	},
	{
		industry: "finance",
		platforms: [
			{ source: "linkedin", strength: "high", description: "Banques et assurances recrutent beaucoup ici" },
			{ source: "glassdoor", strength: "medium", description: "Utile pour comparer les avantages" },
			{ source: "indeed", strength: "low", description: "Moins d'offres finance spécialisées" },
		],
		tips: [
			"Les banques apprécient aussi les candidatures directes",
			"Les certifications CFA/ACCA sont valorisées",
			"Casablanca Finance City concentre plusieurs opportunités",
		],
	},
	{
		industry: "general",
		platforms: [
			{ source: "indeed", strength: "high", description: "Très large couverture d'offres" },
			{ source: "linkedin", strength: "high", description: "Fort pour le réseau et les recruteurs" },
			{ source: "glassdoor", strength: "medium", description: "Utile pour préparer l'entreprise" },
		],
		tips: [
			"Utilise plusieurs plateformes pour augmenter tes chances",
			"Adapte ton CV au secteur ciblé",
			"Le réseau reste un canal très efficace",
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
