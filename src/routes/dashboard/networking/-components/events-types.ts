import type { Icon } from "@phosphor-icons/react";

export type EventType = "conference" | "meetup" | "webinar" | "networking";
export type RsvpStatus = "going" | "maybe" | "not_going";
export type ViewMode = "calendar" | "list";

export interface ExpectedContact {
	id: string;
	name: string;
	company: string;
	role: string;
}

export interface FollowUpReminder {
	id: string;
	eventId: string;
	title: string;
	description: string | null;
	dueDate: string;
	completed: boolean;
}

export interface EventOutcome {
	contactsMade: number;
	followUpsScheduled: number;
	opportunitiesIdentified: number;
	notes: string;
}

export interface NetworkingEvent {
	id: string;
	title: string;
	date: string;
	startTime: string;
	endTime: string;
	location: string;
	type: EventType;
	description: string | null;
	rsvpStatus: RsvpStatus;
	expectedContacts: ExpectedContact[];
	notes: string | null;
	followUpReminders: FollowUpReminder[];
	outcome?: EventOutcome;
	link?: string | null;
	isPast: boolean;
}

export interface EventTypeConfig {
	label: string;
	color: string;
	icon: Icon;
}

export interface RsvpStatusConfig {
	label: string;
	color: string;
	icon: Icon;
}
