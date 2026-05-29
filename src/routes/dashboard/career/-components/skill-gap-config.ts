import { t } from "@lingui/core/macro";
import {
	BriefcaseIcon,
	CertificateIcon,
	FirstAidKitIcon,
	GearIcon,
	GlobeIcon,
	HardHatIcon,
	UsersIcon,
} from "@phosphor-icons/react";

import type {
	CategoryConfigItem,
	ImportanceConfigItem,
	IndustryConfigItem,
	SkillCategory,
	SkillImportance,
} from "./skill-gap-types";

function getCategoryConfig(): Record<SkillCategory, CategoryConfigItem> {
	return {
		technical: {
			label: t`Technical Skills`,
			labelFr: "Compétences Techniques",
			icon: GearIcon,
			color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
		},
		soft: {
			label: t`Soft Skills`,
			labelFr: "Compétences Relationnelles",
			icon: UsersIcon,
			color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
		},
		languages: {
			label: t`Languages`,
			labelFr: "Langues",
			icon: GlobeIcon,
			color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
		},
		certifications: {
			label: t`Certifications`,
			labelFr: "Certifications",
			icon: CertificateIcon,
			color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
		},
		tools: {
			label: t`Tools & Software`,
			labelFr: "Outils & Logiciels",
			icon: GearIcon,
			color: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400",
		},
	};
}

export const CATEGORY_CONFIG: Record<SkillCategory, CategoryConfigItem> = new Proxy(
	{} as Record<SkillCategory, CategoryConfigItem>,
	{
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
	},
);

function getIndustryConfig(): Record<string, IndustryConfigItem> {
	return {
		healthcare: {
			label: t`Healthcare`,
			labelFr: "Santé",
			icon: FirstAidKitIcon,
			color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
		},
		industrial: {
			label: t`Industrial`,
			labelFr: "Industrie",
			icon: GearIcon,
			color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
		},
		hse: {
			label: "HSE",
			labelFr: "HSE",
			icon: HardHatIcon,
			color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
		},
		tech: {
			label: t`Technology`,
			labelFr: "Technologie",
			icon: GearIcon,
			color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
		},
		automotive: {
			label: t`Automotive`,
			labelFr: "Automobile",
			icon: GearIcon,
			color: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400",
		},
		services: {
			label: t`Services`,
			labelFr: "Services",
			icon: BriefcaseIcon,
			color: "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400",
		},
	};
}

export const INDUSTRY_CONFIG: Record<string, IndustryConfigItem> = new Proxy({} as Record<string, IndustryConfigItem>, {
	get(_target, prop: string) {
		return getIndustryConfig()[prop];
	},
	ownKeys() {
		return Object.keys(getIndustryConfig());
	},
	getOwnPropertyDescriptor(_target, prop) {
		const data = getIndustryConfig();
		if (prop in data) {
			return { configurable: true, enumerable: true, value: data[prop as keyof typeof data] };
		}
		return undefined;
	},
});

function getImportanceConfig(): Record<SkillImportance, ImportanceConfigItem> {
	return {
		critical: {
			label: t`Critical`,
			labelFr: "Critique",
			color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
		},
		important: {
			label: t`Important`,
			labelFr: "Important",
			color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
		},
		"nice-to-have": {
			label: t`Nice to Have`,
			labelFr: "Optionnel",
			color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
		},
	};
}

export const IMPORTANCE_CONFIG: Record<SkillImportance, ImportanceConfigItem> = new Proxy(
	{} as Record<SkillImportance, ImportanceConfigItem>,
	{
		get(_target, prop: string) {
			return getImportanceConfig()[prop as SkillImportance];
		},
		ownKeys() {
			return Object.keys(getImportanceConfig());
		},
		getOwnPropertyDescriptor(_target, prop) {
			const data = getImportanceConfig();
			if (prop in data) {
				return { configurable: true, enumerable: true, value: data[prop as SkillImportance] };
			}
			return undefined;
		},
	},
);
