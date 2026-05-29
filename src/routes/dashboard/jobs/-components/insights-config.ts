import {
	ChartBarIcon,
	ChartLineUpIcon,
	CurrencyCircleDollarIcon,
	GlobeIcon,
	GraduationCapIcon,
	RocketLaunchIcon,
	SparkleIcon,
	TrendUpIcon,
	UsersIcon,
} from "@phosphor-icons/react";

import type { InsightIconMap, Region, Sector, TimeRange } from "./insights-types";

export const CHART_COLORS = ["#6366f1", "#8b5cf6", "#10b981", "#f59e0b", "#ef4444", "#3b82f6", "#ec4899", "#14b8a6"];

export const SECTORS: Sector[] = [
	{ id: "all", name: "All Sectors", nameFr: "Tous les secteurs" },
	{ id: "healthcare", name: "Healthcare", nameFr: "Santé" },
	{ id: "industrial", name: "Industrial", nameFr: "Industrie" },
	{ id: "hse", name: "HSE", nameFr: "HSE" },
	{ id: "tech", name: "Technology", nameFr: "Technologie" },
	{ id: "finance", name: "Finance", nameFr: "Finance" },
	{ id: "consulting", name: "Consulting", nameFr: "Conseil" },
	{ id: "education", name: "Education", nameFr: "Éducation" },
	{ id: "public", name: "Public Sector", nameFr: "Secteur Public" },
];

export const REGIONS: Region[] = [
	{ id: "all", name: "All Regions", nameFr: "Toutes les régions" },
	{ id: "casablanca-settat", name: "Casablanca-Settat", nameFr: "Casablanca-Settat" },
	{ id: "rabat-sale-kenitra", name: "Rabat-Sale-Kenitra", nameFr: "Rabat-Sale-Kenitra" },
	{ id: "tanger-tetouan-al-hoceima", name: "Tanger-Tetouan", nameFr: "Tanger-Tetouan" },
	{ id: "marrakech-safi", name: "Marrakech-Safi", nameFr: "Marrakech-Safi" },
	{ id: "fes-meknes", name: "Fes-Meknes", nameFr: "Fes-Meknes" },
];

export const TIME_RANGES: TimeRange[] = [
	{ id: "30d", name: "30 Days", nameFr: "30 jours" },
	{ id: "90d", name: "90 Days", nameFr: "90 jours" },
	{ id: "6m", name: "6 Months", nameFr: "6 mois" },
	{ id: "1y", name: "1 Year", nameFr: "1 an" },
];

export const insightIconMap: InsightIconMap = {
	growth: TrendUpIcon,
	hiring: UsersIcon,
	salary: CurrencyCircleDollarIcon,
	demand: ChartLineUpIcon,
	trend: ChartBarIcon,
	opportunity: RocketLaunchIcon,
	education: GraduationCapIcon,
	remote: GlobeIcon,
	default: SparkleIcon,
};

export const containerVariants = {
	hidden: { opacity: 0 },
	visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

export const itemVariants = {
	hidden: { opacity: 0, y: 20 },
	visible: { opacity: 1, y: 0 },
};
