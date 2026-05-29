import type z from "zod";

import type { interviewFormSchema } from "./scheduler-schema";

// ==================== TYPES ====================

export type InterviewType = "phone" | "video" | "in_person";
export type InterviewStatus = "scheduled" | "completed" | "cancelled" | "rescheduled" | "no_show";
export type InterviewOutcome = "pending" | "passed" | "failed" | "on_hold" | "offer_received";
export type RecurrenceType = "none" | "daily" | "weekly" | "biweekly" | "monthly";
export type ReminderType = "preparation" | "followup";

export interface Reminder {
	id: string;
	interviewId: string;
	type: string;
	date: string;
	time: string;
	message: string;
	completed: boolean;
	createdAt: Date;
}

export interface Interview {
	id: string;
	userId: string;
	applicationId: string | null;
	title: string;
	company: string;
	role: string;
	type: string;
	status: string;
	outcome: string;
	date: string;
	startTime: string;
	endTime: string;
	timezone: string;
	location: string | null;
	meetingLink: string | null;
	contactName: string | null;
	contactEmail: string | null;
	contactPhone: string | null;
	notes: string | null;
	preparationMaterials: string | null;
	interviewerNames: string[] | null;
	round: number;
	recurrence: string;
	reminders: Reminder[];
	createdAt: Date;
	updatedAt: Date;
}

// ==================== FORM TYPES ====================

export type FormData = {
	title: string;
	company: string;
	role: string;
	type: InterviewType;
	status: InterviewStatus;
	outcome: InterviewOutcome;
	date: string;
	startTime: string;
	endTime: string;
	timezone: string;
	location: string;
	meetingLink: string;
	contactName: string;
	contactEmail: string;
	contactPhone: string;
	notes: string;
	preparationMaterials: string;
	interviewerNames: string[];
	round: number;
	recurrence: RecurrenceType;
};

export type InterviewFormValues = z.infer<typeof interviewFormSchema>;
