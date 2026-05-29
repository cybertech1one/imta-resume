import { t } from "@lingui/core/macro";
import type { Icon } from "@phosphor-icons/react";
import {
	BookOpenIcon,
	BriefcaseIcon,
	CertificateIcon,
	GearIcon,
	GraduationCapIcon,
	LightbulbIcon,
	RocketLaunchIcon,
	UsersIcon,
	VideoIcon,
} from "@phosphor-icons/react";

import { generateId } from "@/utils/string";

import type { CareerGoal, Resource, RoadmapStep, SkillRequirement } from "./roadmap-types";

export { generateId };

export function getIndustries() {
	return [
		{ value: "healthcare", label: t`Healthcare`, icon: "heart" },
		{ value: "industrial", label: t`Industrial`, icon: "gear" },
		{ value: "hse", label: t`HSE / Safety`, icon: "shield" },
		{ value: "technology", label: t`Technology`, icon: "code" },
		{ value: "finance", label: t`Finance / Banking`, icon: "currency" },
		{ value: "marketing", label: t`Marketing / Communications`, icon: "megaphone" },
		{ value: "education", label: t`Education / Training`, icon: "graduation" },
		{ value: "consulting", label: t`Consulting`, icon: "briefcase" },
		{ value: "other", label: t`Other`, icon: "dots" },
	];
}

export function getRoadmapPriorities() {
	return [
		{ value: "salary", label: t`Higher Salary` },
		{ value: "growth", label: t`Career Growth` },
		{ value: "balance", label: t`Work-Life Balance` },
		{ value: "impact", label: t`Social Impact` },
		{ value: "learning", label: t`Learning Opportunities` },
		{ value: "leadership", label: t`Leadership / Management` },
		{ value: "remote", label: t`Remote Work` },
		{ value: "stability", label: t`Job Security` },
	];
}

export function getConstraints() {
	return [
		{ value: "time", label: t`Limited Time` },
		{ value: "budget", label: t`Budget Constraints` },
		{ value: "location", label: t`Location Restrictions` },
		{ value: "family", label: t`Family Obligations` },
		{ value: "education", label: t`Education Gap` },
		{ value: "experience", label: t`Experience Gap` },
		{ value: "language", label: t`Language Barrier` },
	];
}

export function getStepTypeConfig(): Record<
	RoadmapStep["type"],
	{ label: string; labelFr: string; icon: Icon; color: string }
> {
	return {
		skill: {
			label: t`Skill Development`,
			labelFr: t`Skill Development`,
			icon: LightbulbIcon,
			color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
		},
		experience: {
			label: t`Work Experience`,
			labelFr: t`Work Experience`,
			icon: BriefcaseIcon,
			color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
		},
		certification: {
			label: t`Certification`,
			labelFr: t`Certification`,
			icon: CertificateIcon,
			color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
		},
		networking: {
			label: t`Networking`,
			labelFr: t`Networking`,
			icon: UsersIcon,
			color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
		},
		education: {
			label: t`Education`,
			labelFr: t`Education`,
			icon: GraduationCapIcon,
			color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
		},
		project: {
			label: t`Project`,
			labelFr: t`Project`,
			icon: RocketLaunchIcon,
			color: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400",
		},
	};
}

export function getSkillCategoryConfig(): Record<SkillRequirement["category"], { label: string; color: string }> {
	return {
		technical: { label: t`Technical`, color: "bg-blue-500" },
		soft: { label: t`Soft Skills`, color: "bg-purple-500" },
		language: { label: t`Language`, color: "bg-green-500" },
		tool: { label: t`Tool`, color: "bg-amber-500" },
		certification: { label: t`Certification`, color: "bg-red-500" },
	};
}

export const RESOURCE_TYPE_CONFIG: Record<Resource["type"], { icon: Icon; color: string }> = {
	course: { icon: GraduationCapIcon, color: "text-blue-500" },
	book: { icon: BookOpenIcon, color: "text-amber-500" },
	video: { icon: VideoIcon, color: "text-red-500" },
	article: { icon: BookOpenIcon, color: "text-green-500" },
	certification: { icon: CertificateIcon, color: "text-purple-500" },
	tool: { icon: GearIcon, color: "text-cyan-500" },
	community: { icon: UsersIcon, color: "text-pink-500" },
};

// Helper functions
export { formatDate } from "@/utils/format-date";

export function formatWeeks(weeks: number): string {
	if (weeks < 4) return t`${weeks} weeks`;
	const months = Math.round(weeks / 4);
	if (months < 12) return t`${months} months`;
	const years = Math.floor(months / 12);
	const remainingMonths = months % 12;
	if (remainingMonths === 0) return t`${years} year(s)`;
	return t`${years} year(s) ${remainingMonths} months`;
}

export function calculateSuccessProbability(goal: CareerGoal, steps: RoadmapStep[], constraints: string[]): number {
	let probability = 75; // Base probability

	// Adjust based on timeline (shorter = harder)
	if (goal.timeline < 6) probability -= 15;
	else if (goal.timeline < 12) probability -= 5;
	else if (goal.timeline > 24) probability += 10;

	// Adjust based on experience
	if (goal.yearsExperience > 5) probability += 10;
	else if (goal.yearsExperience < 2) probability -= 10;

	// Adjust based on constraints
	probability -= constraints.length * 3;

	// Adjust based on steps (more steps = more comprehensive but harder)
	if (steps.length > 6) probability -= 5;
	if (steps.length < 4) probability += 5;

	// Clamp between 30 and 95
	return Math.max(30, Math.min(95, probability));
}
