// Constants and helper functions for the Career Predictions feature

import { t } from "@lingui/core/macro";

function getFields() {
	return [
		{ value: "healthcare", label: t`Healthcare`, icon: "heart" },
		{ value: "industrial", label: t`Industrial`, icon: "gear" },
		{ value: "hse", label: t`HSE / Safety`, icon: "shield" },
		{ value: "technology", label: t`Technology`, icon: "code" },
		{ value: "finance", label: t`Finance`, icon: "currency" },
		{ value: "marketing", label: t`Marketing`, icon: "megaphone" },
		{ value: "education", label: t`Education`, icon: "graduation" },
		{ value: "other", label: t`Other`, icon: "dots" },
	];
}

export const FIELDS = new Proxy([] as ReturnType<typeof getFields>, {
	get(_target, prop) {
		const data = getFields();
		if (prop === Symbol.iterator) return () => data[Symbol.iterator]();
		return (data as unknown as Record<string | symbol, unknown>)[prop];
	},
});

function getEducationLevels() {
	return [
		{ value: "high_school", label: t`High School` },
		{ value: "bachelors", label: t`Bachelor's Degree` },
		{ value: "masters", label: t`Master's Degree` },
		{ value: "doctorate", label: t`Doctorate` },
		{ value: "professional", label: t`Professional Training` },
	];
}

export const EDUCATION_LEVELS = new Proxy([] as ReturnType<typeof getEducationLevels>, {
	get(_target, prop) {
		const data = getEducationLevels();
		if (prop === Symbol.iterator) return () => data[Symbol.iterator]();
		return (data as unknown as Record<string | symbol, unknown>)[prop];
	},
});

export function formatSalary(amount: number, currency = "MAD"): string {
	return `${amount.toLocaleString()} ${currency}`;
}

export function formatMonths(months: number): string {
	if (months < 12) return t`${months} months`;
	const years = Math.floor(months / 12);
	const remainingMonths = months % 12;
	if (remainingMonths === 0) return t`${years} years`;
	return t`${years} years ${remainingMonths} months`;
}

export function getConfidenceColor(confidence: "high" | "medium" | "low"): string {
	switch (confidence) {
		case "high":
			return "text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400";
		case "medium":
			return "text-amber-600 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400";
		case "low":
			return "text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400";
	}
}

export function getMatchColor(percentage: number): string {
	if (percentage >= 80) return "text-green-600";
	if (percentage >= 60) return "text-amber-600";
	return "text-red-600";
}

export function getGrowthBadgeColor(growth: "high" | "medium" | "low"): string {
	switch (growth) {
		case "high":
			return "bg-green-500";
		case "medium":
			return "bg-amber-500";
		case "low":
			return "bg-red-500";
	}
}
