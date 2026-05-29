import { t } from "@lingui/core/macro";
import type { Icon } from "@phosphor-icons/react";
import {
	ChatCircleDotsIcon,
	CheckCircleIcon,
	ClockIcon,
	EnvelopeIcon,
	UsersIcon,
	VideoIcon,
	XIcon,
} from "@phosphor-icons/react";

import type { ExpertiseLevel, GoalStatus, MentorStatus, RequestStatus, SessionType } from "./mentors-types";

export function getStatusConfig(): Record<MentorStatus, { label: string; color: string }> {
	return {
		available: {
			label: t`Available`,
			color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
		},
		busy: {
			label: t`Busy`,
			color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
		},
		on_vacation: {
			label: t`On Vacation`,
			color: "bg-gray-100 text-gray-700 dark:bg-gray-800/30 dark:text-gray-400",
		},
	};
}

export function getRequestStatusConfig(): Record<RequestStatus, { label: string; color: string; icon: Icon }> {
	return {
		pending: {
			label: t`Pending`,
			color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
			icon: ClockIcon,
		},
		accepted: {
			label: t`Accepted`,
			color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
			icon: CheckCircleIcon,
		},
		declined: {
			label: t`Declined`,
			color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
			icon: XIcon,
		},
		completed: {
			label: t`Completed`,
			color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
			icon: CheckCircleIcon,
		},
	};
}

export function getSessionTypeConfig(): Record<SessionType, { label: string; icon: Icon }> {
	return {
		video_call: { label: t`Video Call`, icon: VideoIcon },
		phone_call: { label: t`Phone Call`, icon: EnvelopeIcon },
		in_person: { label: t`In Person`, icon: UsersIcon },
		chat: { label: t`Chat`, icon: ChatCircleDotsIcon },
	};
}

export function getGoalStatusConfig(): Record<GoalStatus, { label: string; color: string }> {
	return {
		not_started: {
			label: t`Not Started`,
			color: "bg-gray-100 text-gray-700 dark:bg-gray-800/30 dark:text-gray-400",
		},
		in_progress: {
			label: t`In Progress`,
			color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
		},
		completed: {
			label: t`Completed`,
			color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
		},
	};
}

export function getExpertiseLevelConfig(): Record<ExpertiseLevel, { label: string; color: string }> {
	return {
		beginner: {
			label: t`Beginner`,
			color: "bg-gray-100 text-gray-700 dark:bg-gray-800/30 dark:text-gray-400",
		},
		intermediate: {
			label: t`Intermediate`,
			color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
		},
		advanced: {
			label: t`Advanced`,
			color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
		},
		expert: {
			label: t`Expert`,
			color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
		},
	};
}

export const daysOfWeek = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"] as const;
