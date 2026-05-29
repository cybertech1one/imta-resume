import type { Icon } from "@phosphor-icons/react";

// Core domain types
export type Priority = "high" | "medium" | "low";
export type DeadlineStatus = "upcoming" | "past" | "completed";
export type UrgencyLevel = "urgent" | "soon" | "plenty";

export interface Deadline {
	id: string;
	title: string;
	company: string;
	position: string;
	deadlineDate: string;
	deadlineTime: string;
	priority: Priority;
	notes: string;
	reminderEnabled: boolean;
	reminderDate: string | null;
	reminderTime: string | null;
	completed: boolean;
	createdAt: Date;
	updatedAt: Date;
}

export type DeadlineFormValues = {
	title: string;
	company: string;
	position?: string | undefined;
	deadlineDate: string;
	deadlineTime?: string | undefined;
	priority: "high" | "medium" | "low";
	notes?: string | undefined;
	reminderEnabled: boolean;
	reminderDate?: string | null | undefined;
	reminderTime?: string | null | undefined;
	completed: boolean;
};

export interface PriorityConfigEntry {
	label: string;
	icon: Icon;
	color: string;
	bgColor: string;
}

export interface UrgencyConfigEntry {
	color: string;
	bgColor: string;
	borderColor: string;
	label: string;
}

export interface DayOfWeek {
	value: number;
	short: string;
}
