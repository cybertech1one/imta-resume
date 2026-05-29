import { t } from "@lingui/core/macro";
import type { Icon } from "@phosphor-icons/react";
import {
	BriefcaseIcon,
	CertificateIcon,
	CurrencyCircleDollarIcon,
	FlagIcon,
	GraduationCapIcon,
	LightbulbIcon,
	TargetIcon,
	TrendUpIcon,
	TrophyIcon,
} from "@phosphor-icons/react";

import type { EventType, IndustryBenchmark } from "./timeline-types";

// Event type configuration
function getEventTypeConfig(): Record<
	EventType,
	{ label: string; labelFr: string; icon: Icon; color: string; bgColor: string }
> {
	return {
		job: {
			label: t`Job`,
			labelFr: "Emploi",
			icon: BriefcaseIcon,
			color: "text-blue-600 dark:text-blue-400",
			bgColor: "bg-blue-100 dark:bg-blue-900/30",
		},
		promotion: {
			label: t`Promotion`,
			labelFr: "Promotion",
			icon: TrendUpIcon,
			color: "text-green-600 dark:text-green-400",
			bgColor: "bg-green-100 dark:bg-green-900/30",
		},
		education: {
			label: t`Education`,
			labelFr: "Formation",
			icon: GraduationCapIcon,
			color: "text-purple-600 dark:text-purple-400",
			bgColor: "bg-purple-100 dark:bg-purple-900/30",
		},
		certification: {
			label: t`Certification`,
			labelFr: "Certification",
			icon: CertificateIcon,
			color: "text-amber-600 dark:text-amber-400",
			bgColor: "bg-amber-100 dark:bg-amber-900/30",
		},
		achievement: {
			label: t`Achievement`,
			labelFr: "Accomplissement",
			icon: TrophyIcon,
			color: "text-yellow-600 dark:text-yellow-400",
			bgColor: "bg-yellow-100 dark:bg-yellow-900/30",
		},
		skill: {
			label: t`Skill`,
			labelFr: "Compétence",
			icon: LightbulbIcon,
			color: "text-cyan-600 dark:text-cyan-400",
			bgColor: "bg-cyan-100 dark:bg-cyan-900/30",
		},
		goal: {
			label: t`Goal`,
			labelFr: "Objectif",
			icon: TargetIcon,
			color: "text-rose-600 dark:text-rose-400",
			bgColor: "bg-rose-100 dark:bg-rose-900/30",
		},
	};
}

export const EVENT_TYPE_CONFIG: Record<
	EventType,
	{ label: string; labelFr: string; icon: Icon; color: string; bgColor: string }
> = new Proxy({} as Record<EventType, { label: string; labelFr: string; icon: Icon; color: string; bgColor: string }>, {
	get(_target, prop: string) {
		return getEventTypeConfig()[prop as EventType];
	},
	ownKeys() {
		return Object.keys(getEventTypeConfig());
	},
	getOwnPropertyDescriptor(_target, prop) {
		const data = getEventTypeConfig();
		if (prop in data) {
			return { configurable: true, enumerable: true, value: data[prop as EventType] };
		}
		return undefined;
	},
});

// Skill category configuration
function getSkillCategoryConfig(): Record<string, { label: string; labelFr: string; color: string }> {
	return {
		technical: {
			label: t`Technical`,
			labelFr: "Technique",
			color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
		},
		soft: {
			label: t`Soft Skills`,
			labelFr: "Relationnel",
			color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
		},
		language: {
			label: t`Language`,
			labelFr: "Langue",
			color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
		},
		tool: {
			label: t`Tool`,
			labelFr: "Outil",
			color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
		},
	};
}

export const SKILL_CATEGORY_CONFIG: Record<string, { label: string; labelFr: string; color: string }> = new Proxy(
	{} as Record<string, { label: string; labelFr: string; color: string }>,
	{
		get(_target, prop: string) {
			return getSkillCategoryConfig()[prop];
		},
		ownKeys() {
			return Object.keys(getSkillCategoryConfig());
		},
		getOwnPropertyDescriptor(_target, prop) {
			const data = getSkillCategoryConfig();
			if (prop in data) {
				return { configurable: true, enumerable: true, value: data[prop as keyof typeof data] };
			}
			return undefined;
		},
	},
);

// Goal category configuration
function getGoalCategoryConfig(): Record<string, { label: string; labelFr: string; icon: Icon }> {
	return {
		position: { label: t`Position`, labelFr: "Poste", icon: BriefcaseIcon },
		salary: { label: t`Salary`, labelFr: "Salaire", icon: CurrencyCircleDollarIcon },
		skill: { label: t`Skill`, labelFr: "Compétence", icon: LightbulbIcon },
		certification: { label: t`Certification`, labelFr: "Certification", icon: CertificateIcon },
		other: { label: t`Other`, labelFr: "Autre", icon: FlagIcon },
	};
}

export const GOAL_CATEGORY_CONFIG: Record<string, { label: string; labelFr: string; icon: Icon }> = new Proxy(
	{} as Record<string, { label: string; labelFr: string; icon: Icon }>,
	{
		get(_target, prop: string) {
			return getGoalCategoryConfig()[prop];
		},
		ownKeys() {
			return Object.keys(getGoalCategoryConfig());
		},
		getOwnPropertyDescriptor(_target, prop) {
			const data = getGoalCategoryConfig();
			if (prop in data) {
				return { configurable: true, enumerable: true, value: data[prop as keyof typeof data] };
			}
			return undefined;
		},
	},
);

// Industry benchmarks (sample data - Morocco market)
export const INDUSTRY_BENCHMARKS: IndustryBenchmark[] = [
	{
		role: "Junior Developer",
		experienceYears: 1,
		salaryMin: 6000,
		salaryMax: 10000,
		salaryMedian: 8000,
		currency: "DH",
	},
	{ role: "Developer", experienceYears: 3, salaryMin: 10000, salaryMax: 18000, salaryMedian: 14000, currency: "DH" },
	{
		role: "Senior Developer",
		experienceYears: 5,
		salaryMin: 18000,
		salaryMax: 30000,
		salaryMedian: 24000,
		currency: "DH",
	},
	{ role: "Tech Lead", experienceYears: 7, salaryMin: 25000, salaryMax: 40000, salaryMedian: 32000, currency: "DH" },
	{ role: "Nurse (Entry)", experienceYears: 1, salaryMin: 4000, salaryMax: 6000, salaryMedian: 5000, currency: "DH" },
	{ role: "Nurse (Senior)", experienceYears: 5, salaryMin: 7000, salaryMax: 12000, salaryMedian: 9500, currency: "DH" },
	{ role: "HSE Officer", experienceYears: 2, salaryMin: 7000, salaryMax: 12000, salaryMedian: 9500, currency: "DH" },
	{ role: "HSE Manager", experienceYears: 5, salaryMin: 15000, salaryMax: 25000, salaryMedian: 20000, currency: "DH" },
	{
		role: "Maintenance Tech",
		experienceYears: 2,
		salaryMin: 5000,
		salaryMax: 9000,
		salaryMedian: 7000,
		currency: "DH",
	},
	{
		role: "Industrial Engineer",
		experienceYears: 5,
		salaryMin: 12000,
		salaryMax: 22000,
		salaryMedian: 17000,
		currency: "DH",
	},
];
