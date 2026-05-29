import { t } from "@lingui/core/macro";

import type { GoalCategory, JournalEntryType } from "./coaching-types";

function getGoalCategories(): { value: GoalCategory; label: string }[] {
	return [
		{ value: "applications", label: t`Applications` },
		{ value: "networking", label: t`Networking` },
		{ value: "skills", label: t`Skills` },
		{ value: "interview_prep", label: t`Interview Prep` },
		{ value: "personal_branding", label: t`Personal Branding` },
		{ value: "research", label: t`Research` },
		{ value: "other", label: t`Other` },
	];
}

export const GOAL_CATEGORIES = new Proxy([] as ReturnType<typeof getGoalCategories>, {
	get(_target, prop) {
		const data = getGoalCategories();
		if (prop === Symbol.iterator) return () => data[Symbol.iterator]();
		return (data as unknown as Record<string | symbol, unknown>)[prop];
	},
});

function getEntryTypes(): { value: JournalEntryType; label: string; emoji: string; color: string }[] {
	return [
		{ value: "win", label: t`Victory`, emoji: "🎉", color: "bg-green-500/10 text-green-600" },
		{ value: "challenge", label: t`Challenge`, emoji: "💪", color: "bg-amber-500/10 text-amber-600" },
		{ value: "learning", label: t`Learning`, emoji: "📚", color: "bg-blue-500/10 text-blue-600" },
		{ value: "reflection", label: t`Reflection`, emoji: "🤔", color: "bg-purple-500/10 text-purple-600" },
	];
}

export const ENTRY_TYPES = new Proxy([] as ReturnType<typeof getEntryTypes>, {
	get(_target, prop) {
		const data = getEntryTypes();
		if (prop === Symbol.iterator) return () => data[Symbol.iterator]();
		return (data as unknown as Record<string | symbol, unknown>)[prop];
	},
});

export const MOOD_EMOJIS = ["😢", "😔", "😐", "😊", "😄"];
