import { HourglassHighIcon, HourglassMediumIcon, WarningCircleIcon } from "@phosphor-icons/react";

import type {
	DayOfWeek,
	Deadline,
	DeadlineFormValues,
	DeadlineStatus,
	Priority,
	PriorityConfigEntry,
	UrgencyConfigEntry,
	UrgencyLevel,
} from "./deadlines-types";

// Priority configuration
export const priorityConfig: Record<Priority, PriorityConfigEntry> = {
	high: {
		label: "Haute",
		icon: WarningCircleIcon,
		color: "text-red-600 dark:text-red-400",
		bgColor: "bg-red-100 dark:bg-red-900/30",
	},
	medium: {
		label: "Moyenne",
		icon: HourglassMediumIcon,
		color: "text-amber-600 dark:text-amber-400",
		bgColor: "bg-amber-100 dark:bg-amber-900/30",
	},
	low: {
		label: "Basse",
		icon: HourglassHighIcon,
		color: "text-green-600 dark:text-green-400",
		bgColor: "bg-green-100 dark:bg-green-900/30",
	},
};

// Days of week for calendar header
export const DAYS_OF_WEEK: DayOfWeek[] = [
	{ value: 0, short: "Dim" },
	{ value: 1, short: "Lun" },
	{ value: 2, short: "Mar" },
	{ value: 3, short: "Mer" },
	{ value: 4, short: "Jeu" },
	{ value: 5, short: "Ven" },
	{ value: 6, short: "Sam" },
];

// Helper functions

export function formatShortDate(dateString: string): string {
	return new Date(dateString).toLocaleDateString(undefined, {
		day: "numeric",
		month: "short",
	});
}

export function formatTime(timeString: string): string {
	const [hours, minutes] = timeString.split(":");
	return `${hours}h${minutes}`;
}

export function getDeadlineStatus(deadline: Deadline): DeadlineStatus {
	if (deadline.completed) return "completed";
	const deadlineDateTime = new Date(`${deadline.deadlineDate}T${deadline.deadlineTime}`);
	const now = new Date();
	return deadlineDateTime > now ? "upcoming" : "past";
}

export function getDaysUntil(dateString: string, timeString: string): number {
	const target = new Date(`${dateString}T${timeString}`);
	const now = new Date();
	return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

export function getUrgencyLevel(dateString: string, timeString: string): UrgencyLevel {
	const days = getDaysUntil(dateString, timeString);
	if (days <= 2) return "urgent";
	if (days <= 7) return "soon";
	return "plenty";
}

export function getUrgencyConfig(urgency: UrgencyLevel): UrgencyConfigEntry {
	switch (urgency) {
		case "urgent":
			return {
				color: "text-red-600 dark:text-red-400",
				bgColor: "bg-red-100 dark:bg-red-900/30",
				borderColor: "border-red-500/50",
				label: "Urgent",
			};
		case "soon":
			return {
				color: "text-amber-600 dark:text-amber-400",
				bgColor: "bg-amber-100 dark:bg-amber-900/30",
				borderColor: "border-amber-500/50",
				label: "Bientôt",
			};
		case "plenty":
			return {
				color: "text-green-600 dark:text-green-400",
				bgColor: "bg-green-100 dark:bg-green-900/30",
				borderColor: "border-green-500/50",
				label: "Dans les temps",
			};
	}
}

// Calendar helper functions

export function getDaysInMonth(year: number, month: number): Date[] {
	const days: Date[] = [];
	const firstDay = new Date(year, month, 1);
	const lastDay = new Date(year, month + 1, 0);

	// Add padding days from previous month
	const startPadding = firstDay.getDay();
	for (let i = startPadding - 1; i >= 0; i--) {
		const date = new Date(year, month, -i);
		days.push(date);
	}

	// Add days of current month
	for (let day = 1; day <= lastDay.getDate(); day++) {
		days.push(new Date(year, month, day));
	}

	// Add padding days for next month
	const endPadding = 42 - days.length;
	for (let i = 1; i <= endPadding; i++) {
		days.push(new Date(year, month + 1, i));
	}

	return days;
}

export function isSameDay(date1: Date, date2: Date): boolean {
	return (
		date1.getFullYear() === date2.getFullYear() &&
		date1.getMonth() === date2.getMonth() &&
		date1.getDate() === date2.getDate()
	);
}

export function isToday(date: Date): boolean {
	return isSameDay(date, new Date());
}

// Default form data
export function getDefaultFormData(): DeadlineFormValues {
	const tomorrow = new Date();
	tomorrow.setDate(tomorrow.getDate() + 1);

	return {
		title: "",
		company: "",
		position: "",
		deadlineDate: tomorrow.toISOString().split("T")[0],
		deadlineTime: "23:59",
		priority: "medium",
		notes: "",
		reminderEnabled: false,
		reminderDate: null,
		reminderTime: null,
		completed: false,
	};
}
