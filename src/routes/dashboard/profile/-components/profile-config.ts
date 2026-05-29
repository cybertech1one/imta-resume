import { t } from "@lingui/core/macro";
import type { Icon } from "@phosphor-icons/react";
import {
	BookOpenIcon,
	ChatsCircleIcon,
	CheckCircleIcon,
	CompassIcon,
	CrownIcon,
	FireIcon,
	GraduationCapIcon,
	PencilSimpleIcon,
	PlusCircleIcon,
	ReadCvLogoIcon,
	RocketLaunchIcon,
	TargetIcon,
	TrophyIcon,
} from "@phosphor-icons/react";
import type { Achievement, GoalTemplate } from "./profile-types";

export function getAchievements(): Achievement[] {
	return [
		{
			id: "premier-cv",
			title: t`First Resume`,
			description: t`Created your first resume`,
			icon: ReadCvLogoIcon,
			color: "text-blue-600 dark:text-blue-400",
			bgColor: "bg-blue-100 dark:bg-blue-900/30",
			borderColor: "border-blue-500/50",
			requiredValue: 1,
			category: "resume",
		},
		{
			id: "entretien-pratique",
			title: t`Practice Interview`,
			description: t`Completed your first interview session`,
			icon: ChatsCircleIcon,
			color: "text-purple-600 dark:text-purple-400",
			bgColor: "bg-purple-100 dark:bg-purple-900/30",
			borderColor: "border-purple-500/50",
			requiredValue: 1,
			category: "interview",
		},
		{
			id: "quiz-complete",
			title: t`Quiz Complete`,
			description: t`Completed career assessment quiz`,
			icon: CompassIcon,
			color: "text-green-600 dark:text-green-400",
			bgColor: "bg-green-100 dark:bg-green-900/30",
			borderColor: "border-green-500/50",
			requiredValue: 1,
			category: "career",
		},
		{
			id: "dix-sessions",
			title: t`10 Sessions`,
			description: t`Completed 10 interview sessions`,
			icon: FireIcon,
			color: "text-orange-600 dark:text-orange-400",
			bgColor: "bg-orange-100 dark:bg-orange-900/30",
			borderColor: "border-orange-500/50",
			requiredValue: 10,
			category: "interview",
		},
		{
			id: "score-parfait",
			title: t`Perfect Score`,
			description: t`Achieved 90+ score in an interview`,
			icon: TrophyIcon,
			color: "text-amber-600 dark:text-amber-400",
			bgColor: "bg-amber-100 dark:bg-amber-900/30",
			borderColor: "border-amber-500/50",
			requiredValue: 90,
			category: "interview",
		},
		{
			id: "explorateur",
			title: t`Explorer`,
			description: t`Explored all training programs`,
			icon: RocketLaunchIcon,
			color: "text-indigo-600 dark:text-indigo-400",
			bgColor: "bg-indigo-100 dark:bg-indigo-900/30",
			borderColor: "border-indigo-500/50",
			requiredValue: 5,
			category: "training",
		},
		{
			id: "cv-master",
			title: t`CV Master`,
			description: t`Created 5 resumes`,
			icon: CrownIcon,
			color: "text-yellow-600 dark:text-yellow-400",
			bgColor: "bg-yellow-100 dark:bg-yellow-900/30",
			borderColor: "border-yellow-500/50",
			requiredValue: 5,
			category: "resume",
		},
		{
			id: "formation-complete",
			title: t`Training Complete`,
			description: t`Completed a training program`,
			icon: GraduationCapIcon,
			color: "text-teal-600 dark:text-teal-400",
			bgColor: "bg-teal-100 dark:bg-teal-900/30",
			borderColor: "border-teal-500/50",
			requiredValue: 1,
			category: "training",
		},
	];
}

// Re-export for backwards compatibility - callers always get fresh translated values
export const ACHIEVEMENTS: Achievement[] = new Proxy([] as Achievement[], {
	get(_target, prop) {
		const data = getAchievements();
		if (prop === Symbol.iterator) return () => data[Symbol.iterator]();
		return (data as unknown as Record<string | symbol, unknown>)[prop];
	},
});

export const ACTIVITY_CONFIG: Record<string, { icon: Icon; color: string; bgColor: string }> = {
	resume_edit: { icon: PencilSimpleIcon, color: "text-blue-600", bgColor: "bg-blue-100 dark:bg-blue-900/30" },
	resume_create: { icon: PlusCircleIcon, color: "text-green-600", bgColor: "bg-green-100 dark:bg-green-900/30" },
	interview_session: {
		icon: ChatsCircleIcon,
		color: "text-purple-600",
		bgColor: "bg-purple-100 dark:bg-purple-900/30",
	},
	interview_complete: {
		icon: CheckCircleIcon,
		color: "text-emerald-600",
		bgColor: "bg-emerald-100 dark:bg-emerald-900/30",
	},
	training_start: { icon: GraduationCapIcon, color: "text-amber-600", bgColor: "bg-amber-100 dark:bg-amber-900/30" },
	training_complete: { icon: TrophyIcon, color: "text-yellow-600", bgColor: "bg-yellow-100 dark:bg-yellow-900/30" },
	career_assessment: { icon: CompassIcon, color: "text-indigo-600", bgColor: "bg-indigo-100 dark:bg-indigo-900/30" },
};

export function getGoalTemplates(): GoalTemplate[] {
	return [
		{
			id: "create-cv",
			title: t`Create your first resume`,
			description: t`Build a professional resume`,
			icon: ReadCvLogoIcon,
			targetValue: 1,
			unit: t`resume`,
			category: "resume",
		},
		{
			id: "practice-interviews",
			title: t`Practice 5 interviews`,
			description: t`Build your interview confidence`,
			icon: ChatsCircleIcon,
			targetValue: 5,
			unit: t`sessions`,
			category: "interview",
		},
		{
			id: "achieve-80-score",
			title: t`Achieve 80+ interview score`,
			description: t`Master interview techniques`,
			icon: TargetIcon,
			targetValue: 80,
			unit: t`score`,
			category: "interview",
		},
		{
			id: "explore-programs",
			title: t`Explore 3 programs`,
			description: t`Discover training opportunities`,
			icon: BookOpenIcon,
			targetValue: 3,
			unit: t`programs`,
			category: "training",
		},
		{
			id: "complete-quiz",
			title: t`Complete career quiz`,
			description: t`Find your ideal career path`,
			icon: CompassIcon,
			targetValue: 1,
			unit: t`quiz`,
			category: "career",
		},
	];
}

export const GOAL_TEMPLATES: GoalTemplate[] = new Proxy([] as GoalTemplate[], {
	get(_target, prop) {
		const data = getGoalTemplates();
		if (prop === Symbol.iterator) return () => data[Symbol.iterator]();
		return (data as unknown as Record<string | symbol, unknown>)[prop];
	},
});

export const ANIMATION_VARIANTS = {
	container: {
		hidden: { opacity: 0 },
		visible: {
			opacity: 1,
			transition: { staggerChildren: 0.1 },
		},
	},
	item: {
		hidden: { opacity: 0, y: 20 },
		visible: { opacity: 1, y: 0 },
	},
};
