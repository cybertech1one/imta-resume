import z from "zod";
import { protectedProcedure } from "../context";
import { type EventType, networkingEventsService, type RsvpStatus } from "../services/networking-events";

const eventTypeSchema = z.enum(["conference", "meetup", "webinar", "networking"]);
const rsvpStatusSchema = z.enum(["going", "maybe", "not_going"]);

const expectedContactSchema = z.object({
	id: z.string().uuid(),
	name: z.string(),
	company: z.string(),
	role: z.string(),
});

const followUpReminderSchema = z.object({
	id: z.string().uuid(),
	eventId: z.string(),
	title: z.string(),
	description: z.string().nullable(),
	dueDate: z.string(),
	completed: z.boolean(),
});

const eventOutcomeSchema = z.object({
	contactsMade: z.number(),
	followUpsScheduled: z.number(),
	opportunitiesIdentified: z.number(),
	notes: z.string(),
});

const eventSchema = z.object({
	id: z.string().uuid(),
	userId: z.string(),
	title: z.string(),
	date: z.string(),
	startTime: z.string(),
	endTime: z.string(),
	location: z.string(),
	type: eventTypeSchema,
	description: z.string().nullable(),
	rsvpStatus: rsvpStatusSchema,
	notes: z.string().nullable(),
	link: z.string().nullable(),
	isPast: z.boolean(),
	expectedContacts: z.array(expectedContactSchema),
	followUpReminders: z.array(followUpReminderSchema),
	outcome: eventOutcomeSchema.optional(),
	outcomeContactsMade: z.number().nullable(),
	outcomeFollowUpsScheduled: z.number().nullable(),
	outcomeOpportunitiesIdentified: z.number().nullable(),
	outcomeNotes: z.string().nullable(),
	createdAt: z.coerce.date(),
	updatedAt: z.coerce.date(),
});

const pendingReminderSchema = z.object({
	id: z.string().uuid(),
	eventId: z.string(),
	title: z.string(),
	description: z.string().nullable(),
	dueDate: z.string(),
	completed: z.boolean(),
	eventTitle: z.string(),
});

export const networkingEventsRouter = {
	create: protectedProcedure
		.route({
			method: "POST",
			path: "/networking-events",
			tags: ["Networking Events"],
			summary: "Create a new networking event",
		})
		.input(
			z.object({
				title: z.string().min(1).max(255),
				date: z.string(),
				startTime: z.string(),
				endTime: z.string(),
				location: z.string().min(1),
				type: eventTypeSchema,
				description: z.string().optional(),
				rsvpStatus: rsvpStatusSchema.optional(),
				notes: z.string().optional(),
				link: z.string().url().optional().or(z.literal("")),
				expectedContacts: z
					.array(
						z.object({
							name: z.string(),
							company: z.string(),
							role: z.string(),
						}),
					)
					.optional(),
				followUpReminders: z
					.array(
						z.object({
							title: z.string(),
							description: z.string().optional(),
							dueDate: z.string(),
						}),
					)
					.optional(),
			}),
		)
		.output(z.string())
		.handler(async ({ context, input }) => {
			return await networkingEventsService.create({
				...input,
				userId: context.user.id,
				type: input.type as EventType,
				rsvpStatus: input.rsvpStatus as RsvpStatus | undefined,
				link: input.link || undefined,
			});
		}),

	getById: protectedProcedure
		.route({
			method: "GET",
			path: "/networking-events/{id}",
			tags: ["Networking Events"],
			summary: "Get event by ID",
		})
		.input(z.object({ id: z.string().uuid() }))
		.output(eventSchema)
		.handler(async ({ context, input }) => {
			return await networkingEventsService.getById({ id: input.id, userId: context.user.id });
		}),

	list: protectedProcedure
		.route({
			method: "GET",
			path: "/networking-events",
			tags: ["Networking Events"],
			summary: "List networking events",
		})
		.input(
			z
				.object({
					type: eventTypeSchema.optional(),
					rsvpStatus: rsvpStatusSchema.optional(),
					showPast: z.boolean().optional(),
					startDate: z.string().optional(),
					endDate: z.string().optional(),
					limit: z.number().optional(),
					offset: z.number().optional(),
				})
				.optional()
				.default({}),
		)
		.output(z.array(eventSchema))
		.handler(async ({ context, input }) => {
			return await networkingEventsService.list({
				userId: context.user.id,
				...input,
				type: input.type as EventType | undefined,
				rsvpStatus: input.rsvpStatus as RsvpStatus | undefined,
			});
		}),

	update: protectedProcedure
		.route({
			method: "PUT",
			path: "/networking-events/{id}",
			tags: ["Networking Events"],
			summary: "Update a networking event",
		})
		.input(
			z.object({
				id: z.string().uuid(),
				title: z.string().min(1).max(255).optional(),
				date: z.string().optional(),
				startTime: z.string().optional(),
				endTime: z.string().optional(),
				location: z.string().optional(),
				type: eventTypeSchema.optional(),
				description: z.string().optional(),
				rsvpStatus: rsvpStatusSchema.optional(),
				notes: z.string().optional(),
				link: z.string().url().optional().or(z.literal("")),
				expectedContacts: z
					.array(
						z.object({
							id: z.string().optional(),
							name: z.string(),
							company: z.string(),
							role: z.string(),
						}),
					)
					.optional(),
				followUpReminders: z
					.array(
						z.object({
							id: z.string().optional(),
							title: z.string(),
							description: z.string().optional(),
							dueDate: z.string(),
							completed: z.boolean().optional(),
						}),
					)
					.optional(),
				outcome: eventOutcomeSchema.optional(),
			}),
		)
		.output(z.void())
		.handler(async ({ context, input }) => {
			return await networkingEventsService.update({
				...input,
				userId: context.user.id,
				type: input.type as EventType | undefined,
				rsvpStatus: input.rsvpStatus as RsvpStatus | undefined,
				link: input.link || undefined,
			});
		}),

	updateRsvp: protectedProcedure
		.route({
			method: "POST",
			path: "/networking-events/{id}/rsvp",
			tags: ["Networking Events"],
			summary: "Update event RSVP status",
		})
		.input(
			z.object({
				id: z.string().uuid(),
				rsvpStatus: rsvpStatusSchema,
			}),
		)
		.output(z.void())
		.handler(async ({ context, input }) => {
			return await networkingEventsService.updateRsvp({
				id: input.id,
				userId: context.user.id,
				rsvpStatus: input.rsvpStatus as RsvpStatus,
			});
		}),

	updateOutcome: protectedProcedure
		.route({
			method: "POST",
			path: "/networking-events/{id}/outcome",
			tags: ["Networking Events"],
			summary: "Update event outcome",
		})
		.input(
			z.object({
				id: z.string().uuid(),
				outcome: eventOutcomeSchema,
			}),
		)
		.output(z.void())
		.handler(async ({ context, input }) => {
			return await networkingEventsService.updateOutcome({
				id: input.id,
				userId: context.user.id,
				outcome: input.outcome,
			});
		}),

	toggleReminder: protectedProcedure
		.route({
			method: "POST",
			path: "/networking-events/{eventId}/reminders/{reminderId}/toggle",
			tags: ["Networking Events"],
			summary: "Toggle reminder completion status",
		})
		.input(
			z.object({
				eventId: z.string(),
				reminderId: z.string(),
			}),
		)
		.output(z.boolean())
		.handler(async ({ context, input }) => {
			return await networkingEventsService.toggleReminder({
				eventId: input.eventId,
				reminderId: input.reminderId,
				userId: context.user.id,
			});
		}),

	delete: protectedProcedure
		.route({
			method: "DELETE",
			path: "/networking-events/{id}",
			tags: ["Networking Events"],
			summary: "Delete a networking event",
		})
		.input(z.object({ id: z.string().uuid() }))
		.output(z.void())
		.handler(async ({ context, input }) => {
			return await networkingEventsService.delete({ id: input.id, userId: context.user.id });
		}),

	getPendingReminders: protectedProcedure
		.route({
			method: "GET",
			path: "/networking-events/reminders/pending",
			tags: ["Networking Events"],
			summary: "Get pending reminders",
		})
		.input(z.object({ daysAhead: z.number().optional() }).optional().default({}))
		.output(z.array(pendingReminderSchema))
		.handler(async ({ context, input }) => {
			return await networkingEventsService.getPendingReminders({
				userId: context.user.id,
				daysAhead: input.daysAhead,
			});
		}),

	getStatistics: protectedProcedure
		.route({
			method: "GET",
			path: "/networking-events/statistics",
			tags: ["Networking Events"],
			summary: "Get networking events statistics",
		})
		.output(
			z.object({
				totalUpcoming: z.number(),
				totalPast: z.number(),
				goingCount: z.number(),
				totalContacts: z.number(),
				pendingReminders: z.number(),
			}),
		)
		.handler(async ({ context }) => {
			return await networkingEventsService.getStatistics({ userId: context.user.id });
		}),
};
