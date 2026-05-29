import { t } from "@lingui/core/macro";

// =============================================================================
// FIELD OPTIONS
// =============================================================================

function getFields() {
	return [
		{ value: "healthcare", label: t`Healthcare`, icon: "first-aid" },
		{ value: "industrial", label: t`Industrial`, icon: "gear" },
		{ value: "hse", label: t`HSE / Safety`, icon: "shield" },
		{ value: "tech", label: t`Tech / IT`, icon: "code" },
		{ value: "automotive", label: t`Automotive`, icon: "car" },
		{ value: "services", label: t`Services`, icon: "briefcase" },
	];
}

export const FIELDS = new Proxy([] as ReturnType<typeof getFields>, {
	get(_target, prop) {
		const data = getFields();
		if (prop === Symbol.iterator) return () => data[Symbol.iterator]();
		return (data as unknown as Record<string | symbol, unknown>)[prop];
	},
});

// =============================================================================
// EXPERIENCE LEVELS
// =============================================================================

function getExperienceLevels() {
	return [
		{ value: "entry", label: t`Entry Level (0-2 years)` },
		{ value: "mid", label: t`Mid-Level (3-5 years)` },
		{ value: "senior", label: t`Senior (6-10 years)` },
		{ value: "executive", label: t`Executive (10+ years)` },
	];
}

export const EXPERIENCE_LEVELS = new Proxy([] as ReturnType<typeof getExperienceLevels>, {
	get(_target, prop) {
		const data = getExperienceLevels();
		if (prop === Symbol.iterator) return () => data[Symbol.iterator]();
		return (data as unknown as Record<string | symbol, unknown>)[prop];
	},
});

// =============================================================================
// REGIONS
// =============================================================================

export const REGIONS = [
	{ value: "casablanca", label: "Casablanca-Settat" },
	{ value: "rabat", label: "Rabat-Sale-Kenitra" },
	{ value: "tanger", label: "Tanger-Tetouan-Al Hoceima" },
	{ value: "marrakech", label: "Marrakech-Safi" },
	{ value: "fes", label: "Fes-Meknes" },
	{ value: "agadir", label: "Souss-Massa" },
];

// =============================================================================
// STAT CARD COLORS
// =============================================================================

export const statCardColors = {
	blue: {
		bg: "bg-blue-50 dark:bg-blue-950/30",
		border: "border-blue-200 dark:border-blue-800",
		icon: "bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400",
		value: "text-blue-600 dark:text-blue-400",
	},
	green: {
		bg: "bg-green-50 dark:bg-green-950/30",
		border: "border-green-200 dark:border-green-800",
		icon: "bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400",
		value: "text-green-600 dark:text-green-400",
	},
	purple: {
		bg: "bg-purple-50 dark:bg-purple-950/30",
		border: "border-purple-200 dark:border-purple-800",
		icon: "bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400",
		value: "text-purple-600 dark:text-purple-400",
	},
	orange: {
		bg: "bg-orange-50 dark:bg-orange-950/30",
		border: "border-orange-200 dark:border-orange-800",
		icon: "bg-orange-100 dark:bg-orange-900/50 text-orange-600 dark:text-orange-400",
		value: "text-orange-600 dark:text-orange-400",
	},
	red: {
		bg: "bg-red-50 dark:bg-red-950/30",
		border: "border-red-200 dark:border-red-800",
		icon: "bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400",
		value: "text-red-600 dark:text-red-400",
	},
};

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

export function formatCurrency(amount: number): string {
	return new Intl.NumberFormat("fr-MA", {
		style: "currency",
		currency: "MAD",
		minimumFractionDigits: 0,
		maximumFractionDigits: 0,
	}).format(amount);
}

export function getHotnessColor(score: number): string {
	if (score >= 90) return "text-red-500";
	if (score >= 80) return "text-orange-500";
	if (score >= 70) return "text-yellow-500";
	return "text-blue-500";
}
