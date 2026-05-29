import { t } from "@lingui/core/macro";
import type { Icon } from "@phosphor-icons/react";
import {
	ArrowLeftIcon,
	ArrowRightIcon,
	BookOpenIcon,
	BriefcaseIcon,
	BuildingsIcon,
	CaretLeftIcon,
	CaretRightIcon,
	CertificateIcon,
	ChartLineUpIcon,
	CheckCircleIcon,
	ClipboardTextIcon,
	ClockIcon,
	CompassIcon,
	CurrencyCircleDollarIcon,
	DownloadSimpleIcon,
	FirstAidKitIcon,
	GearIcon,
	GlobeIcon,
	GraduationCapIcon,
	HandshakeIcon,
	HardHatIcon,
	HeartIcon,
	HourglassIcon,
	InfoIcon,
	LightbulbIcon,
	ListChecksIcon,
	MedalIcon,
	PathIcon,
	PresentationChartIcon,
	RocketLaunchIcon,
	ShieldCheckIcon,
	SparkleIcon,
	StarIcon,
	SunIcon,
	TargetIcon,
	TrendUpIcon,
	TrophyIcon,
	UserIcon,
	UsersIcon,
	WarningCircleIcon,
	WrenchIcon,
} from "@phosphor-icons/react";

// ============================================================================
// Icon Mapping (for database-driven questions)
// ============================================================================

const iconNameToComponent: Record<string, Icon> = {
	SparkleIcon,
	RocketLaunchIcon,
	UsersIcon,
	LightbulbIcon,
	HeartIcon,
	TargetIcon,
	WrenchIcon,
	MedalIcon,
	FirstAidKitIcon,
	GearIcon,
	ShieldCheckIcon,
	BuildingsIcon,
	HardHatIcon,
	PresentationChartIcon,
	BookOpenIcon,
	ClipboardTextIcon,
	UserIcon,
	HandshakeIcon,
	SunIcon,
	ClockIcon,
	HourglassIcon,
	CompassIcon,
	TrendUpIcon,
	StarIcon,
	CheckCircleIcon,
	InfoIcon,
	WarningCircleIcon,
	GraduationCapIcon,
	BriefcaseIcon,
	CertificateIcon,
	CurrencyCircleDollarIcon,
	ChartLineUpIcon,
	PathIcon,
	DownloadSimpleIcon,
	GlobeIcon,
	ArrowLeftIcon,
	ArrowRightIcon,
	CaretLeftIcon,
	CaretRightIcon,
	ListChecksIcon,
	TrophyIcon,
};

// Helper to get icon component from string name
export function getIconFromName(iconName: string | null | undefined): Icon {
	if (!iconName) return CompassIcon;
	// Handle both "SparkleIcon" and "Sparkle" formats
	const normalizedName = iconName.endsWith("Icon") ? iconName : `${iconName}Icon`;
	return iconNameToComponent[normalizedName] || CompassIcon;
}

// ============================================================================
// Constants
// ============================================================================

// Field icon mapping
export const fieldIcons: Record<string, Icon> = {
	healthcare: FirstAidKitIcon,
	industrial: GearIcon,
	hse: HardHatIcon,
	general: CompassIcon,
};

// Field color mapping
export const fieldColors: Record<string, string> = {
	healthcare: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
	industrial: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
	hse: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
	general: "bg-gray-100 text-gray-700 dark:bg-gray-800/30 dark:text-gray-400",
};

// Category colors
export const categoryColors: Record<string, string> = {
	personality: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
	interests: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
	skills: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
	work_preferences: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
	values: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400",
	moroccan_market: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

// Category labels
export function getCategoryLabels(): Record<string, string> {
	return {
		personality: t`Personality`,
		interests: t`Interests`,
		skills: t`Skills`,
		work_preferences: t`Work Preferences`,
		values: t`Values`,
		moroccan_market: t`Moroccan Market`,
	};
}
