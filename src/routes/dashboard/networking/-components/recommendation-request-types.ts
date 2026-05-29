export type RecommenderType = "supervisor" | "colleague" | "professor" | "mentor" | "client";
export type RequestStatus = "pending" | "received" | "sent";
export type ReminderFrequency = "none" | "daily" | "weekly" | "biweekly";

export interface Recommender {
	id: string;
	userId: string;
	name: string;
	email: string;
	phone: string;
	title: string;
	company: string;
	relationship: RecommenderType;
	yearsKnown: number;
	notes: string;
	createdAt: Date;
	updatedAt: Date;
}

export interface RecommendationRequest {
	id: string;
	userId: string;
	recommenderId: string;
	purpose: string;
	deadline: string;
	status: RequestStatus;
	requestDate: string;
	receivedDate: string | null;
	sentToDate: string | null;
	talkingPoints: string[];
	followUpReminder: ReminderFrequency;
	lastReminderSent: string | null;
	notes: string;
	createdAt: Date;
	updatedAt: Date;
}

export interface EmailTemplate {
	id: string;
	name: string;
	subject: string;
	body: string;
	type: "initial" | "follow_up" | "thank_you";
}

export interface SampleLetter {
	id: string;
	title: string;
	type: RecommenderType;
	content: string;
	highlights: string[];
}

export interface RecommenderFormData {
	name: string;
	email: string;
	phone: string;
	title: string;
	company: string;
	relationship: RecommenderType;
	yearsKnown: number;
	notes: string;
}

export interface RequestFormData {
	recommenderId: string;
	purpose: string;
	deadline: string;
	status: RequestStatus;
	requestDate: string;
	receivedDate?: string;
	sentToDate?: string;
	talkingPoints: string[];
	followUpReminder: ReminderFrequency;
	lastReminderSent?: string;
	notes: string;
}
