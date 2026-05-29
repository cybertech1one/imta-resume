import { t } from "@lingui/core/macro";
import type { Icon } from "@phosphor-icons/react";
import {
	CheckCircleIcon,
	ClockIcon,
	PhoneIcon,
	TrophyIcon,
	UserIcon,
	VideoCameraIcon,
	XCircleIcon,
} from "@phosphor-icons/react";

import type { FormData, InterviewOutcome, InterviewStatus, InterviewType, RecurrenceType } from "./scheduler-types";

// ==================== CONSTANTS ====================

function getInterviewTypes(): Record<InterviewType, { label: string; icon: Icon; color: string; bgColor: string }> {
	return {
		phone: {
			label: t`Phone`,
			icon: PhoneIcon,
			color: "text-blue-600 dark:text-blue-400",
			bgColor: "bg-blue-100 dark:bg-blue-900/30",
		},
		video: {
			label: t`Video`,
			icon: VideoCameraIcon,
			color: "text-purple-600 dark:text-purple-400",
			bgColor: "bg-purple-100 dark:bg-purple-900/30",
		},
		in_person: {
			label: t`In Person`,
			icon: UserIcon,
			color: "text-green-600 dark:text-green-400",
			bgColor: "bg-green-100 dark:bg-green-900/30",
		},
	};
}

export const INTERVIEW_TYPES: Record<InterviewType, { label: string; icon: Icon; color: string; bgColor: string }> =
	new Proxy({} as Record<InterviewType, { label: string; icon: Icon; color: string; bgColor: string }>, {
		get(_target, prop: string) {
			return getInterviewTypes()[prop as InterviewType];
		},
		ownKeys() {
			return Object.keys(getInterviewTypes());
		},
		getOwnPropertyDescriptor(_target, prop) {
			const data = getInterviewTypes();
			if (prop in data) {
				return { configurable: true, enumerable: true, value: data[prop as InterviewType] };
			}
			return undefined;
		},
	});

function getInterviewStatus(): Record<InterviewStatus, { label: string; color: string; bgColor: string }> {
	return {
		scheduled: {
			label: t`Scheduled`,
			color: "text-blue-600 dark:text-blue-400",
			bgColor: "bg-blue-100 dark:bg-blue-900/30",
		},
		completed: {
			label: t`Completed`,
			color: "text-green-600 dark:text-green-400",
			bgColor: "bg-green-100 dark:bg-green-900/30",
		},
		cancelled: {
			label: t`Cancelled`,
			color: "text-red-600 dark:text-red-400",
			bgColor: "bg-red-100 dark:bg-red-900/30",
		},
		rescheduled: {
			label: t`Rescheduled`,
			color: "text-amber-600 dark:text-amber-400",
			bgColor: "bg-amber-100 dark:bg-amber-900/30",
		},
		no_show: {
			label: t`No Show`,
			color: "text-gray-600 dark:text-gray-400",
			bgColor: "bg-gray-100 dark:bg-gray-800/30",
		},
	};
}

export const INTERVIEW_STATUS: Record<InterviewStatus, { label: string; color: string; bgColor: string }> = new Proxy(
	{} as Record<InterviewStatus, { label: string; color: string; bgColor: string }>,
	{
		get(_target, prop: string) {
			return getInterviewStatus()[prop as InterviewStatus];
		},
		ownKeys() {
			return Object.keys(getInterviewStatus());
		},
		getOwnPropertyDescriptor(_target, prop) {
			const data = getInterviewStatus();
			if (prop in data) {
				return { configurable: true, enumerable: true, value: data[prop as InterviewStatus] };
			}
			return undefined;
		},
	},
);

function getInterviewOutcomes(): Record<
	InterviewOutcome,
	{ label: string; icon: Icon; color: string; bgColor: string }
> {
	return {
		pending: {
			label: t`Pending`,
			icon: ClockIcon,
			color: "text-gray-600 dark:text-gray-400",
			bgColor: "bg-gray-100 dark:bg-gray-800/30",
		},
		passed: {
			label: t`Passed`,
			icon: CheckCircleIcon,
			color: "text-green-600 dark:text-green-400",
			bgColor: "bg-green-100 dark:bg-green-900/30",
		},
		failed: {
			label: t`Failed`,
			icon: XCircleIcon,
			color: "text-red-600 dark:text-red-400",
			bgColor: "bg-red-100 dark:bg-red-900/30",
		},
		on_hold: {
			label: t`On Hold`,
			icon: ClockIcon,
			color: "text-amber-600 dark:text-amber-400",
			bgColor: "bg-amber-100 dark:bg-amber-900/30",
		},
		offer_received: {
			label: t`Offer Received`,
			icon: TrophyIcon,
			color: "text-purple-600 dark:text-purple-400",
			bgColor: "bg-purple-100 dark:bg-purple-900/30",
		},
	};
}

export const INTERVIEW_OUTCOMES: Record<
	InterviewOutcome,
	{ label: string; icon: Icon; color: string; bgColor: string }
> = new Proxy({} as Record<InterviewOutcome, { label: string; icon: Icon; color: string; bgColor: string }>, {
	get(_target, prop: string) {
		return getInterviewOutcomes()[prop as InterviewOutcome];
	},
	ownKeys() {
		return Object.keys(getInterviewOutcomes());
	},
	getOwnPropertyDescriptor(_target, prop) {
		const data = getInterviewOutcomes();
		if (prop in data) {
			return { configurable: true, enumerable: true, value: data[prop as InterviewOutcome] };
		}
		return undefined;
	},
});

function getRecurrenceOptions(): Record<RecurrenceType, string> {
	return {
		none: t`None`,
		daily: t`Daily`,
		weekly: t`Weekly`,
		biweekly: t`Bi-weekly`,
		monthly: t`Monthly`,
	};
}

export const RECURRENCE_OPTIONS: Record<RecurrenceType, string> = new Proxy({} as Record<RecurrenceType, string>, {
	get(_target, prop: string) {
		return getRecurrenceOptions()[prop as RecurrenceType];
	},
	ownKeys() {
		return Object.keys(getRecurrenceOptions());
	},
	getOwnPropertyDescriptor(_target, prop) {
		const data = getRecurrenceOptions();
		if (prop in data) {
			return { configurable: true, enumerable: true, value: data[prop as RecurrenceType] };
		}
		return undefined;
	},
});

function getDaysOfWeek() {
	return [
		{ value: 0, label: t`Sunday`, short: t`Sun` },
		{ value: 1, label: t`Monday`, short: t`Mon` },
		{ value: 2, label: t`Tuesday`, short: t`Tue` },
		{ value: 3, label: t`Wednesday`, short: t`Wed` },
		{ value: 4, label: t`Thursday`, short: t`Thu` },
		{ value: 5, label: t`Friday`, short: t`Fri` },
		{ value: 6, label: t`Saturday`, short: t`Sat` },
	];
}

export const DAYS_OF_WEEK = new Proxy([] as ReturnType<typeof getDaysOfWeek>, {
	get(_target, prop) {
		const data = getDaysOfWeek();
		if (prop === Symbol.iterator) return () => data[Symbol.iterator]();
		return (data as unknown as Record<string | symbol, unknown>)[prop];
	},
});

export const TIMEZONES = [
	{ value: "Africa/Casablanca", label: "Casablanca (GMT+1)" },
	{ value: "Europe/Paris", label: "Paris (GMT+1)" },
	{ value: "Europe/London", label: "London (GMT)" },
	{ value: "America/New_York", label: "New York (GMT-5)" },
	{ value: "America/Los_Angeles", label: "Los Angeles (GMT-8)" },
	{ value: "Asia/Dubai", label: "Dubai (GMT+4)" },
];

// ==================== DEFAULT FORM VALUES ====================

export function getDefaultFormData(): FormData {
	return {
		title: "",
		company: "",
		role: "",
		type: "video",
		status: "scheduled",
		outcome: "pending",
		date: new Date().toISOString().split("T")[0],
		startTime: "09:00",
		endTime: "10:00",
		timezone: "Africa/Casablanca",
		location: "",
		meetingLink: "",
		contactName: "",
		contactEmail: "",
		contactPhone: "",
		notes: "",
		preparationMaterials: "",
		interviewerNames: [],
		round: 1,
		recurrence: "none",
	};
}
