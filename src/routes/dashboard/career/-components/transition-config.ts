import { t } from "@lingui/core/macro";
import {
	BriefcaseIcon,
	CertificateIcon,
	ChartLineUpIcon,
	GraduationCapIcon,
	HandshakeIcon,
	LightbulbIcon,
	SparkleIcon,
	StarIcon,
	UsersIcon,
} from "@phosphor-icons/react";

import type {
	ActionCategory,
	ActionCategoryConfig,
	Priority,
	PriorityConfig,
	SkillCategory,
	SkillCategoryConfig,
} from "./transition-types";

// Skill category configuration
export function getSkillCategories(): Record<SkillCategory, SkillCategoryConfig> {
	return {
		technical: {
			name: t`Technical Skills`,
			nameFr: t`Technical Skills`,
			icon: ChartLineUpIcon,
			color: "text-blue-500",
			bgColor: "bg-blue-100 dark:bg-blue-900/30",
		},
		soft: {
			name: t`Soft Skills`,
			nameFr: t`Soft Skills`,
			icon: UsersIcon,
			color: "text-green-500",
			bgColor: "bg-green-100 dark:bg-green-900/30",
		},
		leadership: {
			name: t`Leadership Skills`,
			nameFr: t`Leadership Skills`,
			icon: StarIcon,
			color: "text-amber-500",
			bgColor: "bg-amber-100 dark:bg-amber-900/30",
		},
		communication: {
			name: t`Communication Skills`,
			nameFr: t`Communication Skills`,
			icon: HandshakeIcon,
			color: "text-purple-500",
			bgColor: "bg-purple-100 dark:bg-purple-900/30",
		},
		analytical: {
			name: t`Analytical Skills`,
			nameFr: t`Analytical Skills`,
			icon: LightbulbIcon,
			color: "text-cyan-500",
			bgColor: "bg-cyan-100 dark:bg-cyan-900/30",
		},
	};
}

// Action category configuration
export function getActionCategories(): Record<ActionCategory, ActionCategoryConfig> {
	return {
		skill: {
			name: t`Skill Development`,
			nameFr: t`Skills Development`,
			icon: GraduationCapIcon,
			color: "text-blue-500",
		},
		network: {
			name: t`Networking`,
			nameFr: t`Networking`,
			icon: UsersIcon,
			color: "text-green-500",
		},
		certification: {
			name: t`Certification`,
			nameFr: t`Certification`,
			icon: CertificateIcon,
			color: "text-amber-500",
		},
		experience: {
			name: t`Experience`,
			nameFr: t`Experience`,
			icon: BriefcaseIcon,
			color: "text-purple-500",
		},
		branding: {
			name: t`Personal Branding`,
			nameFr: t`Personal Branding`,
			icon: SparkleIcon,
			color: "text-pink-500",
		},
	};
}

// Priority configuration
export function getPriorities(): Record<Priority, PriorityConfig> {
	return {
		high: { name: t`High`, nameFr: t`High`, color: "text-red-500 bg-red-100 dark:bg-red-900/30" },
		medium: {
			name: t`Medium`,
			nameFr: t`Medium`,
			color: "text-amber-500 bg-amber-100 dark:bg-amber-900/30",
		},
		low: { name: t`Low`, nameFr: t`Low`, color: "text-green-500 bg-green-100 dark:bg-green-900/30" },
	};
}
