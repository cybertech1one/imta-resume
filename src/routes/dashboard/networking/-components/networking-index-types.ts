import type { ConnectionStrength, ContactCategory, EventType, InteractionType } from "./networking-types";

export interface NetworkingStats {
	totalContacts: number;
	strongConnections: number;
	pendingReminders: number;
	upcomingEvents: number;
	recentInteractions: number;
}

export interface ContactFormState {
	firstName: string;
	lastName: string;
	email: string;
	phone: string;
	company: string;
	jobTitle: string;
	category: ContactCategory;
	linkedinUrl: string;
	location: string;
	connectionStrength: ConnectionStrength;
	tags: string[];
	notes: string;
	isFavorite: boolean;
}

export interface InteractionFormState {
	type: InteractionType;
	date: string;
	notes: string;
	followUpNeeded: boolean;
}

export interface ReminderFormState {
	title: string;
	description: string;
	dueDate: string;
}

export interface EventFormState {
	name: string;
	type: EventType;
	date: string;
	location: string;
	description: string;
	link: string;
	notes: string;
	isAttending: boolean;
}

export type DbContact = {
	id: string;
	name: string | null;
	email: string | null;
	phone: string | null;
	company: string | null;
	position: string | null;
	relationship: string | null;
	relationshipStrength: string | null;
	tags: unknown;
	notes: string | null;
	createdAt: string | Date | null;
	lastContactedAt: string | Date | null;
	isFavorite: boolean | null;
	linkedinUrl: string | null;
};

export type DbEvent = {
	id: string;
	title: string | null;
	type: string | null;
	date: string | null;
	location: string | null;
	description: string | null;
	link: string | null;
	notes: string | null;
	rsvpStatus: string | null;
};

export type DbFollowUp = {
	id: string;
	name: string | null;
	notes: string | null;
	nextFollowUpAt: string | Date | null;
};

export type DbStats = {
	total?: number;
	byStrength?: { strong?: number };
	needsFollowUp?: number;
	recentInteractions?: number;
};
