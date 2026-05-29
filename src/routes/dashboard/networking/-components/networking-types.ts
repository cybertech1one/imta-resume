export type ContactCategory =
	| "recruiter"
	| "hiring_manager"
	| "colleague"
	| "mentor"
	| "industry_peer"
	| "alumni"
	| "referral"
	| "other";
export type ConnectionStrength = "strong" | "moderate" | "weak" | "new" | "dormant";
export type InteractionType = "email" | "call" | "meeting" | "linkedin" | "event" | "other";
export type ReminderStatus = "pending" | "completed" | "snoozed";
export type EventType = "conference" | "meetup" | "workshop" | "networking" | "career_fair" | "other";

export interface Contact {
	id: string;
	firstName: string;
	lastName: string;
	email: string;
	phone?: string;
	company: string;
	jobTitle: string;
	category: ContactCategory;
	linkedinUrl?: string;
	location?: string;
	connectionStrength: ConnectionStrength;
	tags: string[];
	notes: string;
	createdAt: string;
	lastContactedAt?: string;
	isFavorite: boolean;
}

export interface Interaction {
	id: string;
	contactId: string;
	type: InteractionType;
	date: string;
	notes: string;
	followUpNeeded: boolean;
}

export interface Reminder {
	id: string;
	contactId: string;
	contactName: string;
	title: string;
	description: string;
	dueDate: string;
	status: ReminderStatus;
}

export interface NetworkingEvent {
	id: string;
	name: string;
	type: EventType;
	date: string;
	location: string;
	description: string;
	link?: string;
	contactsMet: string[];
	notes: string;
	isAttending: boolean;
}

export interface EmailTemplate {
	id: string;
	name: string;
	category: "introduction" | "follow_up" | "thank_you" | "referral" | "reconnect";
	subject: string;
	body: string;
}
