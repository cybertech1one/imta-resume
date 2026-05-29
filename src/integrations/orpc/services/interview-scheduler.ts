import { ORPCError } from "@orpc/client";
import { and, asc, eq, gte, lte } from "drizzle-orm";
import { schema } from "@/integrations/drizzle";
import { db } from "@/integrations/drizzle/client";
import { generateId } from "@/utils/string";

export type ScheduledInterviewType = "phone" | "video" | "in_person";
export type ScheduledInterviewStatus = "scheduled" | "completed" | "cancelled" | "rescheduled" | "no_show";
export type ScheduledInterviewOutcome = "pending" | "passed" | "failed" | "on_hold" | "offer_received";
export type RecurrenceType = "none" | "daily" | "weekly" | "biweekly" | "monthly";
export type ReminderType = "preparation" | "followup";

export type CreateInterviewInput = {
	userId: string;
	applicationId?: string;
	title: string;
	company: string;
	role: string;
	type: ScheduledInterviewType;
	date: string;
	startTime: string;
	endTime: string;
	timezone: string;
	location?: string;
	meetingLink?: string;
	contactName?: string;
	contactEmail?: string;
	contactPhone?: string;
	notes?: string;
	preparationMaterials?: string;
	interviewerNames?: string[];
	round?: number;
	recurrence?: RecurrenceType;
};

export type UpdateInterviewInput = {
	id: string;
	userId: string;
	title?: string;
	company?: string;
	role?: string;
	type?: ScheduledInterviewType;
	status?: ScheduledInterviewStatus;
	outcome?: ScheduledInterviewOutcome;
	date?: string;
	startTime?: string;
	endTime?: string;
	timezone?: string;
	location?: string;
	meetingLink?: string;
	contactName?: string;
	contactEmail?: string;
	contactPhone?: string;
	notes?: string;
	preparationMaterials?: string;
	interviewerNames?: string[];
	round?: number;
	recurrence?: RecurrenceType;
};

export type CreateReminderInput = {
	interviewId: string;
	type: ReminderType;
	date: string;
	time: string;
	message: string;
};

export type CreateAvailabilityInput = {
	userId: string;
	dayOfWeek: number;
	startTime: string;
	endTime: string;
	isRecurring?: boolean;
};

export const interviewSchedulerService = {
	// Create a new scheduled interview
	create: async (input: CreateInterviewInput): Promise<string> => {
		const id = generateId();

		await db.insert(schema.scheduledInterview).values({
			id,
			userId: input.userId,
			applicationId: input.applicationId,
			title: input.title,
			company: input.company,
			role: input.role,
			type: input.type,
			date: input.date,
			startTime: input.startTime,
			endTime: input.endTime,
			timezone: input.timezone,
			location: input.location,
			meetingLink: input.meetingLink,
			contactName: input.contactName,
			contactEmail: input.contactEmail,
			contactPhone: input.contactPhone,
			notes: input.notes,
			preparationMaterials: input.preparationMaterials,
			interviewerNames: input.interviewerNames || [],
			round: input.round || 1,
			recurrence: input.recurrence || "none",
		});

		return id;
	},

	// Get interview by ID
	getById: async (input: { id: string; userId: string }) => {
		const [interview] = await db
			.select()
			.from(schema.scheduledInterview)
			.where(and(eq(schema.scheduledInterview.id, input.id), eq(schema.scheduledInterview.userId, input.userId)));

		if (!interview) {
			throw new ORPCError("NOT_FOUND", { message: "Interview not found" });
		}

		// Get reminders
		const reminders = await db
			.select()
			.from(schema.interviewReminder)
			.where(eq(schema.interviewReminder.interviewId, interview.id))
			.orderBy(asc(schema.interviewReminder.date), asc(schema.interviewReminder.time));

		return {
			...interview,
			reminders,
		};
	},

	// List interviews
	list: async (input: {
		userId: string;
		status?: ScheduledInterviewStatus;
		type?: ScheduledInterviewType;
		startDate?: string;
		endDate?: string;
		limit?: number;
	}) => {
		const conditions = [eq(schema.scheduledInterview.userId, input.userId)];

		if (input.status) {
			conditions.push(eq(schema.scheduledInterview.status, input.status));
		}

		if (input.type) {
			conditions.push(eq(schema.scheduledInterview.type, input.type));
		}

		if (input.startDate) {
			conditions.push(gte(schema.scheduledInterview.date, input.startDate));
		}

		if (input.endDate) {
			conditions.push(lte(schema.scheduledInterview.date, input.endDate));
		}

		const interviews = await db
			.select()
			.from(schema.scheduledInterview)
			.where(and(...conditions))
			.orderBy(asc(schema.scheduledInterview.date), asc(schema.scheduledInterview.startTime))
			.limit(input.limit ?? 100);

		// Get reminders for each interview
		const interviewsWithReminders = await Promise.all(
			interviews.map(async (interview) => {
				const reminders = await db
					.select()
					.from(schema.interviewReminder)
					.where(eq(schema.interviewReminder.interviewId, interview.id))
					.orderBy(asc(schema.interviewReminder.date), asc(schema.interviewReminder.time));

				return {
					...interview,
					reminders,
				};
			}),
		);

		return interviewsWithReminders;
	},

	// Update interview
	update: async (input: UpdateInterviewInput): Promise<void> => {
		const [existing] = await db
			.select({ id: schema.scheduledInterview.id })
			.from(schema.scheduledInterview)
			.where(and(eq(schema.scheduledInterview.id, input.id), eq(schema.scheduledInterview.userId, input.userId)));

		if (!existing) {
			throw new ORPCError("NOT_FOUND", { message: "Interview not found" });
		}

		await db
			.update(schema.scheduledInterview)
			.set({
				title: input.title,
				company: input.company,
				role: input.role,
				type: input.type,
				status: input.status,
				outcome: input.outcome,
				date: input.date,
				startTime: input.startTime,
				endTime: input.endTime,
				timezone: input.timezone,
				location: input.location,
				meetingLink: input.meetingLink,
				contactName: input.contactName,
				contactEmail: input.contactEmail,
				contactPhone: input.contactPhone,
				notes: input.notes,
				preparationMaterials: input.preparationMaterials,
				interviewerNames: input.interviewerNames,
				round: input.round,
				recurrence: input.recurrence,
			})
			.where(and(eq(schema.scheduledInterview.id, input.id), eq(schema.scheduledInterview.userId, input.userId)));
	},

	// Update interview outcome
	updateOutcome: async (input: { id: string; userId: string; outcome: ScheduledInterviewOutcome }): Promise<void> => {
		const [existing] = await db
			.select({ id: schema.scheduledInterview.id })
			.from(schema.scheduledInterview)
			.where(and(eq(schema.scheduledInterview.id, input.id), eq(schema.scheduledInterview.userId, input.userId)));

		if (!existing) {
			throw new ORPCError("NOT_FOUND", { message: "Interview not found" });
		}

		await db
			.update(schema.scheduledInterview)
			.set({
				outcome: input.outcome,
				status: input.outcome !== "pending" ? "completed" : undefined,
			})
			.where(eq(schema.scheduledInterview.id, input.id));
	},

	// Delete interview
	delete: async (input: { id: string; userId: string }): Promise<void> => {
		await db
			.delete(schema.scheduledInterview)
			.where(and(eq(schema.scheduledInterview.id, input.id), eq(schema.scheduledInterview.userId, input.userId)));
	},

	// Get upcoming interviews
	getUpcoming: async (input: { userId: string; days?: number; limit?: number }) => {
		const today = new Date().toISOString().split("T")[0];
		const futureDate = new Date();
		futureDate.setDate(futureDate.getDate() + (input.days ?? 7));
		const futureDateStr = futureDate.toISOString().split("T")[0];

		const interviews = await db
			.select()
			.from(schema.scheduledInterview)
			.where(
				and(
					eq(schema.scheduledInterview.userId, input.userId),
					eq(schema.scheduledInterview.status, "scheduled"),
					gte(schema.scheduledInterview.date, today),
					lte(schema.scheduledInterview.date, futureDateStr),
				),
			)
			.orderBy(asc(schema.scheduledInterview.date), asc(schema.scheduledInterview.startTime))
			.limit(input.limit ?? 10);

		return interviews;
	},

	// Get statistics
	getStatistics: async (input: { userId: string }) => {
		const interviews = await db
			.select()
			.from(schema.scheduledInterview)
			.where(eq(schema.scheduledInterview.userId, input.userId));

		const total = interviews.length;
		const now = new Date();
		const today = now.toISOString().split("T")[0];

		const upcoming = interviews.filter((i) => i.date >= today && i.status === "scheduled").length;
		const completed = interviews.filter((i) => i.status === "completed").length;

		// This month's interviews
		const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0];
		const thisMonth = interviews.filter((i) => i.date >= startOfMonth);

		// Success rate calculation
		const completedThisMonth = thisMonth.filter((i) => i.status === "completed");
		const passedThisMonth = completedThisMonth.filter(
			(i) => i.outcome === "passed" || i.outcome === "offer_received",
		).length;
		const successRate = completedThisMonth.length > 0 ? passedThisMonth / completedThisMonth.length : 0;

		// By status
		const byStatus: Record<string, number> = {};
		for (const interview of interviews) {
			byStatus[interview.status] = (byStatus[interview.status] ?? 0) + 1;
		}

		// By type
		const byType: Record<string, number> = {};
		for (const interview of interviews) {
			byType[interview.type] = (byType[interview.type] ?? 0) + 1;
		}

		// By outcome
		const byOutcome: Record<string, number> = {};
		for (const interview of interviews) {
			byOutcome[interview.outcome] = (byOutcome[interview.outcome] ?? 0) + 1;
		}

		return {
			total,
			upcoming,
			completed,
			thisMonth: thisMonth.length,
			successRate,
			byStatus,
			byType,
			byOutcome,
		};
	},

	// Reminders
	reminders: {
		// Add reminder
		add: async (input: CreateReminderInput): Promise<string> => {
			const id = generateId();

			await db.insert(schema.interviewReminder).values({
				id,
				interviewId: input.interviewId,
				type: input.type,
				date: input.date,
				time: input.time,
				message: input.message,
			});

			return id;
		},

		// Toggle reminder completion
		toggle: async (input: { id: string; interviewId: string }): Promise<boolean> => {
			const [existing] = await db
				.select({ completed: schema.interviewReminder.completed })
				.from(schema.interviewReminder)
				.where(
					and(eq(schema.interviewReminder.id, input.id), eq(schema.interviewReminder.interviewId, input.interviewId)),
				);

			if (!existing) {
				throw new ORPCError("NOT_FOUND", { message: "Reminder not found" });
			}

			const newCompleted = !existing.completed;

			await db
				.update(schema.interviewReminder)
				.set({ completed: newCompleted })
				.where(eq(schema.interviewReminder.id, input.id));

			return newCompleted;
		},

		// Delete reminder
		delete: async (input: { id: string; interviewId: string }): Promise<void> => {
			await db
				.delete(schema.interviewReminder)
				.where(
					and(eq(schema.interviewReminder.id, input.id), eq(schema.interviewReminder.interviewId, input.interviewId)),
				);
		},

		// Get pending reminders
		getPending: async (input: { userId: string }) => {
			const today = new Date().toISOString().split("T")[0];

			const reminders = await db
				.select({
					reminder: schema.interviewReminder,
					interview: schema.scheduledInterview,
				})
				.from(schema.interviewReminder)
				.innerJoin(schema.scheduledInterview, eq(schema.interviewReminder.interviewId, schema.scheduledInterview.id))
				.where(
					and(
						eq(schema.scheduledInterview.userId, input.userId),
						eq(schema.interviewReminder.completed, false),
						gte(schema.interviewReminder.date, today),
					),
				)
				.orderBy(asc(schema.interviewReminder.date), asc(schema.interviewReminder.time));

			return reminders.map((r) => ({
				...r.reminder,
				interviewId: r.interview.id,
				interviewTitle: `${r.interview.company} - ${r.interview.role}`,
			}));
		},
	},

	// Availability
	availability: {
		// Add availability slot
		add: async (input: CreateAvailabilityInput): Promise<string> => {
			const id = generateId();

			await db.insert(schema.availabilitySlot).values({
				id,
				userId: input.userId,
				dayOfWeek: input.dayOfWeek,
				startTime: input.startTime,
				endTime: input.endTime,
				isRecurring: input.isRecurring ?? true,
			});

			return id;
		},

		// List availability slots
		list: async (input: { userId: string }) => {
			const slots = await db
				.select()
				.from(schema.availabilitySlot)
				.where(eq(schema.availabilitySlot.userId, input.userId))
				.orderBy(asc(schema.availabilitySlot.dayOfWeek), asc(schema.availabilitySlot.startTime));

			return slots;
		},

		// Delete availability slot
		delete: async (input: { id: string; userId: string }): Promise<void> => {
			await db
				.delete(schema.availabilitySlot)
				.where(and(eq(schema.availabilitySlot.id, input.id), eq(schema.availabilitySlot.userId, input.userId)));
		},
	},
};
