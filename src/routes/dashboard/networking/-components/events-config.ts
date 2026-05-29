import { t } from "@lingui/core/macro";
import {
	CheckCircleIcon,
	GlobeIcon,
	MicrophoneStageIcon,
	QuestionIcon,
	UsersIcon,
	VideoIcon,
	XCircleIcon,
} from "@phosphor-icons/react";
import type { EventType, EventTypeConfig, RsvpStatus, RsvpStatusConfig } from "./events-types";

export const getEventTypeConfig = (): Record<EventType, EventTypeConfig> => ({
	conference: {
		label: t`Conference`,
		color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
		icon: MicrophoneStageIcon,
	},
	meetup: {
		label: t`Meetup`,
		color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
		icon: UsersIcon,
	},
	webinar: {
		label: t`Webinar`,
		color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
		icon: VideoIcon,
	},
	networking: {
		label: t`Networking`,
		color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
		icon: GlobeIcon,
	},
});

export const getRsvpStatusConfig = (): Record<RsvpStatus, RsvpStatusConfig> => ({
	going: {
		label: t`Going`,
		color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
		icon: CheckCircleIcon,
	},
	maybe: {
		label: t`Maybe`,
		color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
		icon: QuestionIcon,
	},
	not_going: {
		label: t`Not Going`,
		color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
		icon: XCircleIcon,
	},
});

export const getMonthNames = () => [
	t`January`,
	t`February`,
	t`March`,
	t`April`,
	t`May`,
	t`June`,
	t`July`,
	t`August`,
	t`September`,
	t`October`,
	t`November`,
	t`December`,
];

export const getDayNames = () => [t`Sun`, t`Mon`, t`Tue`, t`Wed`, t`Thu`, t`Fri`, t`Sat`];

export function getDaysInMonth(year: number, month: number): number {
	return new Date(year, month + 1, 0).getDate();
}

export function getFirstDayOfMonth(year: number, month: number): number {
	return new Date(year, month, 1).getDay();
}

export function formatTime(time: string): string {
	return time;
}
