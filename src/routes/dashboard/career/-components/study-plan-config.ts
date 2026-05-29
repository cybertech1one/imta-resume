import { t } from "@lingui/core/macro";
import type { Icon } from "@phosphor-icons/react";
import {
	BookBookmarkIcon,
	BookOpenIcon,
	CertificateIcon,
	GearIcon,
	GraduationCapIcon,
	LightbulbIcon,
	PlayIcon,
	VideoIcon,
} from "@phosphor-icons/react";

import type { StudyBadge } from "./study-plan-types";

function getIndustries() {
	return [
		{ value: "healthcare", label: t`Healthcare` },
		{ value: "industrial", label: t`Industrial` },
		{ value: "hse", label: t`HSE / Safety` },
		{ value: "technology", label: t`Technology` },
		{ value: "finance", label: t`Finance` },
		{ value: "education", label: t`Education` },
		{ value: "other", label: t`Other` },
	];
}

export const INDUSTRIES = new Proxy([] as ReturnType<typeof getIndustries>, {
	get(_target, prop) {
		const data = getIndustries();
		if (prop === Symbol.iterator) return () => data[Symbol.iterator]();
		return (data as unknown as Record<string | symbol, unknown>)[prop];
	},
});

function getSkillCategories(): Record<string, { label: string; icon: Icon; color: string }> {
	return {
		technical: {
			label: t`Technical`,
			icon: GearIcon,
			color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
		},
		soft: {
			label: t`Soft Skills`,
			icon: LightbulbIcon,
			color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
		},
		language: {
			label: t`Languages`,
			icon: BookOpenIcon,
			color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
		},
		certification: {
			label: t`Certifications`,
			icon: CertificateIcon,
			color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
		},
	};
}

export const SKILL_CATEGORIES: Record<string, { label: string; icon: Icon; color: string }> = new Proxy(
	{} as Record<string, { label: string; icon: Icon; color: string }>,
	{
		get(_target, prop: string) {
			return getSkillCategories()[prop];
		},
		ownKeys() {
			return Object.keys(getSkillCategories());
		},
		getOwnPropertyDescriptor(_target, prop) {
			const data = getSkillCategories();
			if (prop in data) {
				return { configurable: true, enumerable: true, value: data[prop as keyof typeof data] };
			}
			return undefined;
		},
	},
);

function getResourceTypes(): Record<string, { label: string; icon: Icon; color: string }> {
	return {
		course: {
			label: t`Course`,
			icon: GraduationCapIcon,
			color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
		},
		book: {
			label: t`Book`,
			icon: BookBookmarkIcon,
			color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
		},
		tutorial: {
			label: t`Tutorial`,
			icon: PlayIcon,
			color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
		},
		certification: {
			label: t`Certification`,
			icon: CertificateIcon,
			color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
		},
		video: {
			label: t`Video`,
			icon: VideoIcon,
			color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
		},
	};
}

export const RESOURCE_TYPES: Record<string, { label: string; icon: Icon; color: string }> = new Proxy(
	{} as Record<string, { label: string; icon: Icon; color: string }>,
	{
		get(_target, prop: string) {
			return getResourceTypes()[prop];
		},
		ownKeys() {
			return Object.keys(getResourceTypes());
		},
		getOwnPropertyDescriptor(_target, prop) {
			const data = getResourceTypes();
			if (prop in data) {
				return { configurable: true, enumerable: true, value: data[prop as keyof typeof data] };
			}
			return undefined;
		},
	},
);

export const PLATFORMS = [
	"Coursera",
	"Udemy",
	"LinkedIn Learning",
	"edX",
	"Pluralsight",
	"YouTube",
	"Skillshare",
	"Khan Academy",
	"FreeCodeCamp",
	"Other",
];

function getGamificationBadges(): Omit<StudyBadge, "earnedDate">[] {
	return [
		{ id: "first_day", name: t`First Step`, description: t`Complete your first study session`, icon: "rocket" },
		{ id: "week_streak", name: t`Week Warrior`, description: t`Maintain a 7-day study streak`, icon: "fire" },
		{ id: "month_streak", name: t`Monthly Master`, description: t`Maintain a 30-day study streak`, icon: "trophy" },
		{ id: "skill_master", name: t`Skill Master`, description: t`Reach level 5 in any skill`, icon: "star" },
		{ id: "resource_hunter", name: t`Resource Hunter`, description: t`Add 10 learning resources`, icon: "book" },
		{ id: "milestone_achiever", name: t`Milestone Achiever`, description: t`Complete 5 milestones`, icon: "flag" },
		{ id: "flashcard_pro", name: t`Flashcard Pro`, description: t`Review 100 flashcards`, icon: "brain" },
		{ id: "early_bird", name: t`Early Bird`, description: t`Study before 8 AM`, icon: "sun" },
		{ id: "night_owl", name: t`Night Owl`, description: t`Study after 10 PM`, icon: "moon" },
		{ id: "perfectionist", name: t`Perfectionist`, description: t`Complete all tasks for a week`, icon: "check" },
	];
}

export const GAMIFICATION_BADGES = new Proxy([] as ReturnType<typeof getGamificationBadges>, {
	get(_target, prop) {
		const data = getGamificationBadges();
		if (prop === Symbol.iterator) return () => data[Symbol.iterator]();
		return (data as unknown as Record<string | symbol, unknown>)[prop];
	},
});
