import { t } from "@lingui/core/macro";

import type { FeedbackCategory } from "./feedback-types";

function getCategoryLabels(): Record<FeedbackCategory, string> {
	return {
		technical: t`Technical`,
		behavioral: t`Behavioral`,
		communication: t`Communication`,
		problem_solving: t`Problem Solving`,
		leadership: t`Leadership`,
		cultural_fit: t`Cultural Fit`,
	};
}

export const categoryLabels: Record<FeedbackCategory, string> = new Proxy({} as Record<FeedbackCategory, string>, {
	get(_target, prop: string) {
		return getCategoryLabels()[prop as FeedbackCategory];
	},
	ownKeys() {
		return Object.keys(getCategoryLabels());
	},
	getOwnPropertyDescriptor(_target, prop) {
		const data = getCategoryLabels();
		if (prop in data) {
			return { configurable: true, enumerable: true, value: data[prop as FeedbackCategory] };
		}
		return undefined;
	},
});

export const categoryColors: Record<FeedbackCategory, string> = {
	technical: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
	behavioral: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
	communication: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
	problem_solving: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
	leadership: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
	cultural_fit: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400",
};

export const categoryGradients: Record<FeedbackCategory, string> = {
	technical: "from-blue-500/20 via-blue-500/10 to-transparent",
	behavioral: "from-purple-500/20 via-purple-500/10 to-transparent",
	communication: "from-green-500/20 via-green-500/10 to-transparent",
	problem_solving: "from-amber-500/20 via-amber-500/10 to-transparent",
	leadership: "from-red-500/20 via-red-500/10 to-transparent",
	cultural_fit: "from-cyan-500/20 via-cyan-500/10 to-transparent",
};

export const priorityColors = {
	high: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
	medium: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
	low: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
};

function getPriorityLabels() {
	return {
		high: t`High`,
		medium: t`Medium`,
		low: t`Low`,
	};
}

export const priorityLabels = new Proxy({} as Record<string, string>, {
	get(_target, prop: string) {
		return getPriorityLabels()[prop as keyof ReturnType<typeof getPriorityLabels>];
	},
	ownKeys() {
		return Object.keys(getPriorityLabels());
	},
	getOwnPropertyDescriptor(_target, prop) {
		const data = getPriorityLabels();
		if (prop in data) {
			return { configurable: true, enumerable: true, value: data[prop as keyof typeof data] };
		}
		return undefined;
	},
});
