import { t } from "@lingui/core/macro";
import type { Icon } from "@phosphor-icons/react";
import {
	BriefcaseIcon,
	BuildingsIcon,
	ChartLineUpIcon,
	CheckCircleIcon,
	ClockIcon,
	CurrencyCircleDollarIcon,
	FirstAidKitIcon,
	GearIcon,
	HardHatIcon,
	SparkleIcon,
	StarIcon,
	TrendUpIcon,
	TrophyIcon,
	UsersIcon,
	XIcon,
} from "@phosphor-icons/react";

// Field configurations - wrapped in functions to avoid module-scope i18n calls
export const getFieldConfig = () => ({
	healthcare: {
		label: t`Santé`,
		icon: FirstAidKitIcon,
		color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
		gradient: "from-red-500/20 via-rose-500/10 to-transparent",
	},
	industrial: {
		label: t`Industrie`,
		icon: GearIcon,
		color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
		gradient: "from-blue-500/20 via-indigo-500/10 to-transparent",
	},
	hse: {
		label: t`HSE`,
		icon: HardHatIcon,
		color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
		gradient: "from-amber-500/20 via-orange-500/10 to-transparent",
	},
	general: {
		label: t`Général`,
		icon: BriefcaseIcon,
		color: "bg-gray-100 text-gray-700 dark:bg-gray-800/30 dark:text-gray-400",
		gradient: "from-gray-500/20 via-slate-500/10 to-transparent",
	},
});

export const getExperienceLevels = () => ({
	entry: { label: t`Débutant`, description: t`0-1 an` },
	junior: { label: t`1-3 ans`, description: t`Junior` },
	mid: { label: t`3-5 ans`, description: t`Intermédiaire` },
	senior: { label: t`5+ ans`, description: t`Senior` },
});

export const regions = [
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

export const getApplicationStatusConfig = () => ({
	pending: {
		label: t`En attente`,
		color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
		icon: ClockIcon,
	},
	interview: {
		label: t`Interview`,
		color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
		icon: UsersIcon,
	},
	accepted: {
		label: t`Acceptée`,
		color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
		icon: CheckCircleIcon,
	},
	rejected: {
		label: t`Refusée`,
		color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
		icon: XIcon,
	},
});

// Icon mapping for market insights from database
export const insightIconMap: Record<string, Icon> = {
	BriefcaseIcon,
	TrendUpIcon,
	CurrencyCircleDollarIcon,
	TrophyIcon,
	ChartLineUpIcon,
	StarIcon,
	BuildingsIcon,
	SparkleIcon,
};
