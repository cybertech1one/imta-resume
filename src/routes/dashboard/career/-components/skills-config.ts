import { t } from "@lingui/core/macro";
import type { Icon } from "@phosphor-icons/react";
import { CertificateIcon, FirstAidKitIcon, GearIcon, GlobeIcon, HardHatIcon, UsersIcon } from "@phosphor-icons/react";

import type { SkillCategory } from "./skills-types";

// Category configuration - use function + Proxy to avoid Lingui race condition at module level
function getCategoryConfig(): Record<SkillCategory, { label: string; labelFr: string; icon: Icon; color: string }> {
	return {
		technical: {
			label: t`Technical Skills`,
			labelFr: t`Technical Skills`,
			icon: GearIcon,
			color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
		},
		soft: {
			label: t`Soft Skills`,
			labelFr: t`Soft Skills`,
			icon: UsersIcon,
			color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
		},
		languages: {
			label: t`Languages`,
			labelFr: t`Languages`,
			icon: GlobeIcon,
			color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
		},
		certifications: {
			label: t`Certifications`,
			labelFr: t`Certifications`,
			icon: CertificateIcon,
			color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
		},
	};
}

export const CATEGORY_CONFIG: Record<SkillCategory, { label: string; labelFr: string; icon: Icon; color: string }> =
	new Proxy({} as Record<SkillCategory, { label: string; labelFr: string; icon: Icon; color: string }>, {
		get(_target, prop: string) {
			return getCategoryConfig()[prop as SkillCategory];
		},
		ownKeys() {
			return Object.keys(getCategoryConfig());
		},
		getOwnPropertyDescriptor(_target, prop) {
			const data = getCategoryConfig();
			if (prop in data) {
				return { configurable: true, enumerable: true, value: data[prop as SkillCategory] };
			}
			return undefined;
		},
	});

// Field configuration - use function + Proxy to avoid Lingui race condition at module level
function getFieldConfig(): Record<string, { label: string; labelFr: string; icon: Icon; color: string }> {
	return {
		healthcare: {
			label: t`Healthcare`,
			labelFr: t`Healthcare`,
			icon: FirstAidKitIcon,
			color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
		},
		industrial: {
			label: t`Industrial`,
			labelFr: t`Industrial`,
			icon: GearIcon,
			color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
		},
		hse: {
			label: t`HSE`,
			labelFr: t`HSE`,
			icon: HardHatIcon,
			color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
		},
	};
}

export const FIELD_CONFIG: Record<string, { label: string; labelFr: string; icon: Icon; color: string }> = new Proxy(
	{} as Record<string, { label: string; labelFr: string; icon: Icon; color: string }>,
	{
		get(_target, prop: string) {
			return getFieldConfig()[prop];
		},
		ownKeys() {
			return Object.keys(getFieldConfig());
		},
		getOwnPropertyDescriptor(_target, prop) {
			const data = getFieldConfig();
			if (prop in data) {
				return { configurable: true, enumerable: true, value: data[prop as string] };
			}
			return undefined;
		},
	},
);

// Helper functions
export function calculateOverallProgress(skills: { rating: number; targetRating: number }[]): number {
	if (skills.length === 0) return 0;
	const totalProgress = skills.reduce((sum, skill) => {
		const progress = skill.targetRating > 0 ? (skill.rating / skill.targetRating) * 100 : skill.rating * 20;
		return sum + Math.min(100, progress);
	}, 0);
	return Math.round(totalProgress / skills.length);
}

export function calculateCategoryProgress(
	skills: { rating: number; category: SkillCategory }[],
	category: SkillCategory,
): number {
	const categorySkills = skills.filter((s) => s.category === category);
	if (categorySkills.length === 0) return 0;
	const total = categorySkills.reduce((sum, skill) => sum + skill.rating, 0);
	return Math.round((total / (categorySkills.length * 5)) * 100);
}

export function getSkillGapAnalysis(
	skills: { name: string; nameFr: string; rating: number }[],
	careerPath: { requiredSkills: { name: string; nameFr: string; minimumRating: number }[] },
): {
	met: number;
	total: number;
	gaps: { name: string; nameFr: string; category: SkillCategory; minimumRating: number }[];
} {
	const gaps: { name: string; nameFr: string; category: SkillCategory; minimumRating: number }[] = [];
	let met = 0;

	for (const required of careerPath.requiredSkills) {
		const userSkill = skills.find(
			(s) =>
				s.name.toLowerCase() === required.name.toLowerCase() ||
				s.nameFr.toLowerCase() === required.nameFr.toLowerCase(),
		);

		if (userSkill && userSkill.rating >= required.minimumRating) {
			met++;
		} else {
			gaps.push(required as { name: string; nameFr: string; category: SkillCategory; minimumRating: number });
		}
	}

	return { met, total: careerPath.requiredSkills.length, gaps };
}
