import { t } from "@lingui/core/macro";

import type { InterviewNoteImpression, InterviewNoteStatus, InterviewNoteType } from "./notes-types";

function getInterviewTypeLabels(): Record<InterviewNoteType, string> {
	return {
		phone: t`Telephone`,
		video: t`Vidéo`,
		in_person: t`En présentiel`,
		technical: t`Technique`,
		panel: t`Panel`,
	};
}

export const interviewTypeLabels: Record<InterviewNoteType, string> = new Proxy(
	{} as Record<InterviewNoteType, string>,
	{
		get(_target, prop: string) {
			return getInterviewTypeLabels()[prop as InterviewNoteType];
		},
		ownKeys() {
			return Object.keys(getInterviewTypeLabels());
		},
		getOwnPropertyDescriptor(_target, prop) {
			const data = getInterviewTypeLabels();
			if (prop in data) {
				return { configurable: true, enumerable: true, value: data[prop as InterviewNoteType] };
			}
			return undefined;
		},
	},
);

export const interviewTypeColors: Record<InterviewNoteType, string> = {
	phone: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
	video: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
	in_person: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
	technical: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
	panel: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

function getStatusLabels(): Record<InterviewNoteStatus, string> {
	return {
		scheduled: t`Planifie`,
		completed: t`Terminé`,
		cancelled: t`Annule`,
	};
}

export const statusLabels: Record<InterviewNoteStatus, string> = new Proxy({} as Record<InterviewNoteStatus, string>, {
	get(_target, prop: string) {
		return getStatusLabels()[prop as InterviewNoteStatus];
	},
	ownKeys() {
		return Object.keys(getStatusLabels());
	},
	getOwnPropertyDescriptor(_target, prop) {
		const data = getStatusLabels();
		if (prop in data) {
			return { configurable: true, enumerable: true, value: data[prop as InterviewNoteStatus] };
		}
		return undefined;
	},
});

export const statusColors: Record<InterviewNoteStatus, string> = {
	scheduled: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
	completed: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
	cancelled: "bg-gray-100 text-gray-700 dark:bg-gray-800/30 dark:text-gray-400",
};

export const priorityColors = {
	high: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
	medium: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
	low: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
};

function getImpressionLabels(): Record<InterviewNoteImpression, string> {
	return {
		positive: t`Positive`,
		neutral: t`Neutre`,
		negative: t`Negative`,
	};
}

export const impressionLabels: Record<InterviewNoteImpression, string> = new Proxy(
	{} as Record<InterviewNoteImpression, string>,
	{
		get(_target, prop: string) {
			return getImpressionLabels()[prop as InterviewNoteImpression];
		},
		ownKeys() {
			return Object.keys(getImpressionLabels());
		},
		getOwnPropertyDescriptor(_target, prop) {
			const data = getImpressionLabels();
			if (prop in data) {
				return { configurable: true, enumerable: true, value: data[prop as InterviewNoteImpression] };
			}
			return undefined;
		},
	},
);

export const impressionColors: Record<InterviewNoteImpression, string> = {
	positive: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
	neutral: "bg-gray-100 text-gray-700 dark:bg-gray-800/30 dark:text-gray-400",
	negative: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};
