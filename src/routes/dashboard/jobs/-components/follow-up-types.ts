import type { Icon } from "@phosphor-icons/react";

// Follow-up status types
export type FollowUpStatus = "not_sent" | "sent" | "responded" | "no_response";
export type FollowUpType = "initial" | "second" | "final";

export interface FollowUpApplication {
	id: string;
	jobTitle: string;
	company: string;
	appliedDate: string;
	followUpStatus: FollowUpStatus;
	lastFollowUpDate?: string;
	followUpCount: number;
	contactEmail?: string;
	contactName?: string;
	responseReceived: boolean;
	notes: string;
}

export interface EmailTemplate {
	id: string;
	type: FollowUpType;
	subject: string;
	body: string;
	name: string;
}

export interface ReminderSettings {
	enabled: boolean;
	firstFollowUp: number;
	secondFollowUp: number;
	finalFollowUp: number;
	emailNotifications: boolean;
	browserNotifications: boolean;
}

export interface FollowUpScheduleItem {
	applicationId: string;
	company: string;
	jobTitle: string;
	dueDate: string;
	type: FollowUpType;
	daysUntilDue: number;
	isOverdue: boolean;
}

export interface StatusConfigEntry {
	label: string;
	icon: Icon;
	color: string;
	bgColor: string;
}

export interface FollowUpTypeConfigEntry {
	label: string;
	color: string;
	days: number;
}

export interface BestPracticeTip {
	id: string;
	icon: Icon;
	title: string;
	description: string;
}
