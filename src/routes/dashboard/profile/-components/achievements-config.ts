import { t } from "@lingui/core/macro";
import type { Icon } from "@phosphor-icons/react";
import {
	BookOpenIcon,
	BriefcaseIcon,
	CalendarIcon,
	ChartLineUpIcon,
	ChatsCircleIcon,
	CheckCircleIcon,
	ClockIcon,
	CrownIcon,
	EyeIcon,
	FireIcon,
	FlagIcon,
	GraduationCapIcon,
	HeartIcon,
	LightningIcon,
	MagicWandIcon,
	MedalIcon,
	PencilSimpleIcon,
	RocketLaunchIcon,
	ShareNetworkIcon,
	ShieldCheckIcon,
	SparkleIcon,
	StarIcon,
	TargetIcon,
	TrendUpIcon,
	TrophyIcon,
	UsersIcon,
} from "@phosphor-icons/react";

import type { AchievementCategory, AchievementDefinition, AchievementTier } from "./achievements-types";

// =============================================================================
// ICON MAP
// =============================================================================

const ICON_MAP: Record<string, Icon> = {
	PencilSimpleIcon,
	CheckCircleIcon,
	EyeIcon,
	ChatsCircleIcon,
	StarIcon,
	BookOpenIcon,
	BriefcaseIcon,
	CalendarIcon,
	TrophyIcon,
	LightningIcon,
	GraduationCapIcon,
	FireIcon,
	ClockIcon,
	MagicWandIcon,
	UsersIcon,
	ShareNetworkIcon,
	HeartIcon,
	FlagIcon,
	ChartLineUpIcon,
	TargetIcon,
	RocketLaunchIcon,
	CrownIcon,
	SparkleIcon,
	ShieldCheckIcon,
	TrendUpIcon,
	MedalIcon,
};

export const getIcon = (iconName: string): Icon => {
	return ICON_MAP[iconName] ?? StarIcon;
};

// =============================================================================
// TIER CONFIG
// =============================================================================

export function getTierConfig(): Record<
	AchievementTier,
	{ color: string; bgColor: string; borderColor: string; label: string }
> {
	return {
		bronze: {
			color: "text-amber-700 dark:text-amber-500",
			bgColor: "bg-amber-100 dark:bg-amber-900/30",
			borderColor: "border-amber-500/50",
			label: t`Bronze`,
		},
		silver: {
			color: "text-slate-500 dark:text-slate-400",
			bgColor: "bg-slate-100 dark:bg-slate-800/50",
			borderColor: "border-slate-400/50",
			label: t`Silver`,
		},
		gold: {
			color: "text-yellow-600 dark:text-yellow-400",
			bgColor: "bg-yellow-100 dark:bg-yellow-900/30",
			borderColor: "border-yellow-500/50",
			label: t`Gold`,
		},
		platinum: {
			color: "text-cyan-600 dark:text-cyan-400",
			bgColor: "bg-cyan-100 dark:bg-cyan-900/30",
			borderColor: "border-cyan-500/50",
			label: t`Platinum`,
		},
	};
}

// Proxy for backwards compat - lazily evaluates t`` at access time
export const TIER_CONFIG = new Proxy({} as ReturnType<typeof getTierConfig>, {
	get(_target, prop: string) {
		return getTierConfig()[prop as AchievementTier];
	},
});

// =============================================================================
// CATEGORY CONFIG
// =============================================================================

export function getCategoryConfig(): Record<
	AchievementCategory,
	{ icon: Icon; color: string; bgColor: string; label: string }
> {
	return {
		resume: {
			icon: PencilSimpleIcon,
			color: "text-blue-600 dark:text-blue-400",
			bgColor: "bg-blue-100 dark:bg-blue-900/30",
			label: t`Resume`,
		},
		interview: {
			icon: ChatsCircleIcon,
			color: "text-purple-600 dark:text-purple-400",
			bgColor: "bg-purple-100 dark:bg-purple-900/30",
			label: t`Interview`,
		},
		job_search: {
			icon: BriefcaseIcon,
			color: "text-green-600 dark:text-green-400",
			bgColor: "bg-green-100 dark:bg-green-900/30",
			label: t`Job Search`,
		},
		learning: {
			icon: GraduationCapIcon,
			color: "text-amber-600 dark:text-amber-400",
			bgColor: "bg-amber-100 dark:bg-amber-900/30",
			label: t`Learning`,
		},
		engagement: {
			icon: FireIcon,
			color: "text-orange-600 dark:text-orange-400",
			bgColor: "bg-orange-100 dark:bg-orange-900/30",
			label: t`Engagement`,
		},
		networking: {
			icon: UsersIcon,
			color: "text-pink-600 dark:text-pink-400",
			bgColor: "bg-pink-100 dark:bg-pink-900/30",
			label: t`Networking`,
		},
		career: {
			icon: TrendUpIcon,
			color: "text-indigo-600 dark:text-indigo-400",
			bgColor: "bg-indigo-100 dark:bg-indigo-900/30",
			label: t`Career`,
		},
	};
}

// Proxy for backwards compat - lazily evaluates t`` at access time
export const CATEGORY_CONFIG = new Proxy({} as ReturnType<typeof getCategoryConfig>, {
	get(_target, prop: string) {
		return getCategoryConfig()[prop as AchievementCategory];
	},
});

// =============================================================================
// XP CALCULATION UTILITIES
// =============================================================================

// XP per level calculation (using a quadratic formula for progressive difficulty)
const calculateLevelFromXp = (xp: number): number => {
	return Math.max(1, Math.floor(Math.sqrt(xp / 100)));
};

export const calculateXpForLevel = (level: number): number => {
	return level * level * 100;
};

export const calculateXpProgress = (xp: number): { currentLevel: number; nextLevel: number; progress: number } => {
	const safeXp = Math.max(0, xp);
	const currentLevel = calculateLevelFromXp(safeXp);
	const currentLevelXp = calculateXpForLevel(currentLevel);
	const nextLevelXp = calculateXpForLevel(currentLevel + 1);
	const xpIntoLevel = Math.max(0, safeXp - currentLevelXp);
	const xpNeededForNext = nextLevelXp - currentLevelXp;
	const progress = (xpIntoLevel / xpNeededForNext) * 100;

	return { currentLevel, nextLevel: currentLevel + 1, progress: Math.max(0, Math.min(100, progress)) };
};

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

export function formatTimeRemaining(date: Date): string {
	const now = new Date();
	const diff = new Date(date).getTime() - now.getTime();

	if (diff <= 0) return t`Expired`;

	const hours = Math.floor(diff / (1000 * 60 * 60));
	const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

	if (hours >= 24) {
		const days = Math.floor(hours / 24);
		const remainingHours = hours % 24;
		return t`${days}d ${remainingHours}h remaining`;
	}

	return t`${hours}h ${minutes}m remaining`;
}

export function formatRelativeTime(date: Date): string {
	const now = new Date();
	const dateObj = new Date(date);
	const diffMs = now.getTime() - dateObj.getTime();
	const diffMins = Math.floor(diffMs / (1000 * 60));
	const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
	const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

	if (diffMins < 60) {
		return t`${diffMins}m ago`;
	}
	if (diffHours < 24) {
		return t`${diffHours}h ago`;
	}
	if (diffDays === 1) {
		return t`Yesterday`;
	}
	if (diffDays < 7) {
		return t`${diffDays}d ago`;
	}
	return dateObj.toLocaleDateString("fr-FR");
}

export function getNextTier(unlockedTiers: string[]): AchievementTier | null {
	const tiers: AchievementTier[] = ["bronze", "silver", "gold", "platinum"];
	const highestUnlockedIndex = Math.max(...unlockedTiers.map((t) => tiers.indexOf(t as AchievementTier)), -1);
	if (highestUnlockedIndex >= tiers.length - 1) return null;
	return tiers[highestUnlockedIndex + 1];
}

export function getHighestTier(unlockedTiers: string[]): AchievementTier | null {
	const tiers: AchievementTier[] = ["bronze", "silver", "gold", "platinum"];
	if (unlockedTiers.length === 0) return null;
	const highestIndex = Math.max(...unlockedTiers.map((t) => tiers.indexOf(t as AchievementTier)));
	return tiers[highestIndex];
}

export function getTierTarget(definition: AchievementDefinition, tier: AchievementTier): number {
	switch (tier) {
		case "bronze":
			return definition.bronzeTarget;
		case "silver":
			return definition.silverTarget;
		case "gold":
			return definition.goldTarget;
		case "platinum":
			return definition.platinumTarget;
	}
}

export function getTierXp(definition: AchievementDefinition, tier: AchievementTier): number {
	switch (tier) {
		case "bronze":
			return definition.bronzeXp;
		case "silver":
			return definition.silverXp;
		case "gold":
			return definition.goldXp;
		case "platinum":
			return definition.platinumXp;
	}
}
