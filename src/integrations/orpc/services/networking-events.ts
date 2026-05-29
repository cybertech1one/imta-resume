import { ORPCError } from "@orpc/client";
import { and, desc, eq, gte, lte, sql } from "drizzle-orm";
import { schema } from "@/integrations/drizzle";
import { db } from "@/integrations/drizzle/client";
import { generateId } from "@/utils/string";

export type EventType = "conference" | "meetup" | "webinar" | "networking";
export type RsvpStatus = "going" | "maybe" | "not_going";

export type ExpectedContact = {
	id: string;
	name: string;
	company: string;
	role: string;
};

export type FollowUpReminder = {
	id: string;
	eventId: string;
	title: string;
	description: string | null;
	dueDate: string;
	completed: boolean;
};

export type EventOutcome = {
	contactsMade: number;
	followUpsScheduled: number;
	opportunitiesIdentified: number;
	notes: string;
};

export type CreateEventInput = {
	userId: string;
	title: string;
	date: string;
	startTime: string;
	endTime: string;
	location: string;
	type: EventType;
	description?: string;
	rsvpStatus?: RsvpStatus;
	notes?: string;
	link?: string;
	expectedContacts?: Array<{ name: string; company: string; role: string }>;
	followUpReminders?: Array<{ title: string; description?: string; dueDate: string }>;
};

export type UpdateEventInput = {
	id: string;
	userId: string;
	title?: string;
	date?: string;
	startTime?: string;
	endTime?: string;
	location?: string;
	type?: EventType;
	description?: string;
	rsvpStatus?: RsvpStatus;
	notes?: string;
	link?: string;
	expectedContacts?: Array<{ id?: string; name: string; company: string; role: string }>;
	followUpReminders?: Array<{ id?: string; title: string; description?: string; dueDate: string; completed?: boolean }>;
	outcome?: EventOutcome;
};

export const networkingEventsService = {
	// Create a new event
	create: async (input: CreateEventInput): Promise<string> => {
		const id = generateId();

		await db.insert(schema.networkingEvent).values({
			id,
			userId: input.userId,
			title: input.title,
			date: input.date,
			startTime: input.startTime,
			endTime: input.endTime,
			location: input.location,
			type: input.type,
			description: input.description,
			rsvpStatus: input.rsvpStatus ?? "maybe",
			notes: input.notes,
			link: input.link,
		});

		// Add expected contacts
		if (input.expectedContacts && input.expectedContacts.length > 0) {
			await db.insert(schema.networkingEventContact).values(
				input.expectedContacts.map((contact) => ({
					id: generateId(),
					eventId: id,
					name: contact.name,
					company: contact.company,
					role: contact.role,
				})),
			);
		}

		// Add follow-up reminders
		if (input.followUpReminders && input.followUpReminders.length > 0) {
			await db.insert(schema.networkingEventReminder).values(
				input.followUpReminders.map((reminder) => ({
					id: generateId(),
					eventId: id,
					title: reminder.title,
					description: reminder.description,
					dueDate: reminder.dueDate,
					completed: false,
				})),
			);
		}

		return id;
	},

	// Get event by ID with contacts and reminders
	getById: async (input: { id: string; userId: string }) => {
		const [event] = await db
			.select()
			.from(schema.networkingEvent)
			.where(and(eq(schema.networkingEvent.id, input.id), eq(schema.networkingEvent.userId, input.userId)));

		if (!event) {
			throw new ORPCError("NOT_FOUND", { message: "Event not found" });
		}

		const contacts = await db
			.select()
			.from(schema.networkingEventContact)
			.where(eq(schema.networkingEventContact.eventId, event.id));

		const reminders = await db
			.select()
			.from(schema.networkingEventReminder)
			.where(eq(schema.networkingEventReminder.eventId, event.id))
			.orderBy(schema.networkingEventReminder.dueDate);

		const isPast = new Date(event.date) < new Date(new Date().toISOString().split("T")[0]);

		return {
			...event,
			isPast,
			expectedContacts: contacts.map((c) => ({
				id: c.id,
				name: c.name,
				company: c.company,
				role: c.role,
			})),
			followUpReminders: reminders.map((r) => ({
				id: r.id,
				eventId: r.eventId,
				title: r.title,
				description: r.description,
				dueDate: r.dueDate,
				completed: r.completed,
			})),
			outcome:
				event.outcomeContactsMade !== null
					? {
							contactsMade: event.outcomeContactsMade ?? 0,
							followUpsScheduled: event.outcomeFollowUpsScheduled ?? 0,
							opportunitiesIdentified: event.outcomeOpportunitiesIdentified ?? 0,
							notes: event.outcomeNotes ?? "",
						}
					: undefined,
		};
	},

	// List events
	list: async (input: {
		userId: string;
		type?: EventType;
		rsvpStatus?: RsvpStatus;
		showPast?: boolean;
		startDate?: string;
		endDate?: string;
		limit?: number;
		offset?: number;
	}) => {
		const conditions = [eq(schema.networkingEvent.userId, input.userId)];

		if (input.type) {
			conditions.push(eq(schema.networkingEvent.type, input.type));
		}

		if (input.rsvpStatus) {
			conditions.push(eq(schema.networkingEvent.rsvpStatus, input.rsvpStatus));
		}

		if (input.startDate) {
			conditions.push(gte(schema.networkingEvent.date, input.startDate));
		}

		if (input.endDate) {
			conditions.push(lte(schema.networkingEvent.date, input.endDate));
		}

		const events = await db
			.select()
			.from(schema.networkingEvent)
			.where(and(...conditions))
			.orderBy(desc(schema.networkingEvent.date))
			.limit(input.limit ?? 100)
			.offset(input.offset ?? 0);

		// Get contacts and reminders for each event
		const eventIds = events.map((e) => e.id);

		const contacts =
			eventIds.length > 0
				? await db
						.select()
						.from(schema.networkingEventContact)
						.where(sql`${schema.networkingEventContact.eventId} = ANY(${eventIds})`)
				: [];

		const reminders =
			eventIds.length > 0
				? await db
						.select()
						.from(schema.networkingEventReminder)
						.where(sql`${schema.networkingEventReminder.eventId} = ANY(${eventIds})`)
				: [];

		const today = new Date().toISOString().split("T")[0];

		return events.map((event) => {
			const eventContacts = contacts.filter((c) => c.eventId === event.id);
			const eventReminders = reminders.filter((r) => r.eventId === event.id);
			const isPast = event.date < today;

			return {
				...event,
				isPast,
				expectedContacts: eventContacts.map((c) => ({
					id: c.id,
					name: c.name,
					company: c.company,
					role: c.role,
				})),
				followUpReminders: eventReminders.map((r) => ({
					id: r.id,
					eventId: r.eventId,
					title: r.title,
					description: r.description,
					dueDate: r.dueDate,
					completed: r.completed,
				})),
				outcome:
					event.outcomeContactsMade !== null
						? {
								contactsMade: event.outcomeContactsMade ?? 0,
								followUpsScheduled: event.outcomeFollowUpsScheduled ?? 0,
								opportunitiesIdentified: event.outcomeOpportunitiesIdentified ?? 0,
								notes: event.outcomeNotes ?? "",
							}
						: undefined,
			};
		});
	},

	// Update event
	update: async (input: UpdateEventInput): Promise<void> => {
		const [existing] = await db
			.select({ id: schema.networkingEvent.id })
			.from(schema.networkingEvent)
			.where(and(eq(schema.networkingEvent.id, input.id), eq(schema.networkingEvent.userId, input.userId)));

		if (!existing) {
			throw new ORPCError("NOT_FOUND", { message: "Event not found" });
		}

		await db
			.update(schema.networkingEvent)
			.set({
				title: input.title,
				date: input.date,
				startTime: input.startTime,
				endTime: input.endTime,
				location: input.location,
				type: input.type,
				description: input.description,
				rsvpStatus: input.rsvpStatus,
				notes: input.notes,
				link: input.link,
				outcomeContactsMade: input.outcome?.contactsMade,
				outcomeFollowUpsScheduled: input.outcome?.followUpsScheduled,
				outcomeOpportunitiesIdentified: input.outcome?.opportunitiesIdentified,
				outcomeNotes: input.outcome?.notes,
			})
			.where(and(eq(schema.networkingEvent.id, input.id), eq(schema.networkingEvent.userId, input.userId)));

		// Update expected contacts if provided
		if (input.expectedContacts !== undefined) {
			// Delete existing contacts
			await db.delete(schema.networkingEventContact).where(eq(schema.networkingEventContact.eventId, input.id));

			// Insert new contacts
			if (input.expectedContacts.length > 0) {
				await db.insert(schema.networkingEventContact).values(
					input.expectedContacts.map((contact) => ({
						id: contact.id || generateId(),
						eventId: input.id,
						name: contact.name,
						company: contact.company,
						role: contact.role,
					})),
				);
			}
		}

		// Update follow-up reminders if provided
		if (input.followUpReminders !== undefined) {
			// Delete existing reminders
			await db.delete(schema.networkingEventReminder).where(eq(schema.networkingEventReminder.eventId, input.id));

			// Insert new reminders
			if (input.followUpReminders.length > 0) {
				await db.insert(schema.networkingEventReminder).values(
					input.followUpReminders.map((reminder) => ({
						id: reminder.id || generateId(),
						eventId: input.id,
						title: reminder.title,
						description: reminder.description,
						dueDate: reminder.dueDate,
						completed: reminder.completed ?? false,
					})),
				);
			}
		}
	},

	// Update RSVP status
	updateRsvp: async (input: { id: string; userId: string; rsvpStatus: RsvpStatus }): Promise<void> => {
		const [existing] = await db
			.select({ id: schema.networkingEvent.id })
			.from(schema.networkingEvent)
			.where(and(eq(schema.networkingEvent.id, input.id), eq(schema.networkingEvent.userId, input.userId)));

		if (!existing) {
			throw new ORPCError("NOT_FOUND", { message: "Event not found" });
		}

		await db
			.update(schema.networkingEvent)
			.set({ rsvpStatus: input.rsvpStatus })
			.where(and(eq(schema.networkingEvent.id, input.id), eq(schema.networkingEvent.userId, input.userId)));
	},

	// Update event outcome
	updateOutcome: async (input: { id: string; userId: string; outcome: EventOutcome }): Promise<void> => {
		const [existing] = await db
			.select({ id: schema.networkingEvent.id })
			.from(schema.networkingEvent)
			.where(and(eq(schema.networkingEvent.id, input.id), eq(schema.networkingEvent.userId, input.userId)));

		if (!existing) {
			throw new ORPCError("NOT_FOUND", { message: "Event not found" });
		}

		await db
			.update(schema.networkingEvent)
			.set({
				outcomeContactsMade: input.outcome.contactsMade,
				outcomeFollowUpsScheduled: input.outcome.followUpsScheduled,
				outcomeOpportunitiesIdentified: input.outcome.opportunitiesIdentified,
				outcomeNotes: input.outcome.notes,
			})
			.where(and(eq(schema.networkingEvent.id, input.id), eq(schema.networkingEvent.userId, input.userId)));
	},

	// Toggle reminder completion
	toggleReminder: async (input: { reminderId: string; eventId: string; userId: string }): Promise<boolean> => {
		// Verify event ownership
		const [event] = await db
			.select({ id: schema.networkingEvent.id })
			.from(schema.networkingEvent)
			.where(and(eq(schema.networkingEvent.id, input.eventId), eq(schema.networkingEvent.userId, input.userId)));

		if (!event) {
			throw new ORPCError("NOT_FOUND", { message: "Event not found" });
		}

		const [reminder] = await db
			.select({ completed: schema.networkingEventReminder.completed })
			.from(schema.networkingEventReminder)
			.where(
				and(
					eq(schema.networkingEventReminder.id, input.reminderId),
					eq(schema.networkingEventReminder.eventId, input.eventId),
				),
			);

		if (!reminder) {
			throw new ORPCError("NOT_FOUND", { message: "Reminder not found" });
		}

		const newCompleted = !reminder.completed;

		await db
			.update(schema.networkingEventReminder)
			.set({ completed: newCompleted })
			.where(eq(schema.networkingEventReminder.id, input.reminderId));

		return newCompleted;
	},

	// Delete event
	delete: async (input: { id: string; userId: string }): Promise<void> => {
		await db
			.delete(schema.networkingEvent)
			.where(and(eq(schema.networkingEvent.id, input.id), eq(schema.networkingEvent.userId, input.userId)));
	},

	// Get pending reminders
	getPendingReminders: async (input: { userId: string; daysAhead?: number }) => {
		const futureDate = new Date();
		futureDate.setDate(futureDate.getDate() + (input.daysAhead ?? 7));
		const futureDateStr = futureDate.toISOString().split("T")[0];

		const reminders = await db
			.select({
				reminder: schema.networkingEventReminder,
				event: schema.networkingEvent,
			})
			.from(schema.networkingEventReminder)
			.innerJoin(schema.networkingEvent, eq(schema.networkingEventReminder.eventId, schema.networkingEvent.id))
			.where(
				and(
					eq(schema.networkingEvent.userId, input.userId),
					eq(schema.networkingEventReminder.completed, false),
					lte(schema.networkingEventReminder.dueDate, futureDateStr),
				),
			)
			.orderBy(schema.networkingEventReminder.dueDate);

		return reminders.map((r) => ({
			id: r.reminder.id,
			eventId: r.reminder.eventId,
			title: r.reminder.title,
			description: r.reminder.description,
			dueDate: r.reminder.dueDate,
			completed: r.reminder.completed,
			eventTitle: r.event.title,
		}));
	},

	// Get statistics
	getStatistics: async (input: { userId: string }) => {
		const events = await db
			.select()
			.from(schema.networkingEvent)
			.where(eq(schema.networkingEvent.userId, input.userId));

		const today = new Date().toISOString().split("T")[0];

		const upcomingEvents = events.filter((e) => e.date >= today);
		const pastEvents = events.filter((e) => e.date < today);
		const goingCount = upcomingEvents.filter((e) => e.rsvpStatus === "going").length;
		const totalContacts = pastEvents.reduce((sum, e) => sum + (e.outcomeContactsMade ?? 0), 0);

		// Get pending reminders count
		const [remindersResult] = await db
			.select({ count: sql<number>`count(*)::int` })
			.from(schema.networkingEventReminder)
			.innerJoin(schema.networkingEvent, eq(schema.networkingEventReminder.eventId, schema.networkingEvent.id))
			.where(and(eq(schema.networkingEvent.userId, input.userId), eq(schema.networkingEventReminder.completed, false)));

		return {
			totalUpcoming: upcomingEvents.length,
			totalPast: pastEvents.length,
			goingCount,
			totalContacts,
			pendingReminders: remindersResult?.count ?? 0,
		};
	},
};
