import z from "zod";
import { protectedProcedure } from "../context";
import {
	interviewSchedulerService,
	type RecurrenceType,
	type ReminderType,
	type ScheduledInterviewOutcome,
	type ScheduledInterviewStatus,
	type ScheduledInterviewType,
} from "../services/interview-scheduler";

const interviewTypeSchema = z.enum(["phone", "video", "in_person"]);
const interviewStatusSchema = z.enum(["scheduled", "completed", "cancelled", "rescheduled", "no_show"]);
const interviewOutcomeSchema = z.enum(["pending", "passed", "failed", "on_hold", "offer_received"]);
const recurrenceTypeSchema = z.enum(["none", "daily", "weekly", "biweekly", "monthly"]);
const reminderTypeSchema = z.enum(["preparation", "followup"]);

const reminderSchema = z.object({
	id: z.string().uuid(),
	interviewId: z.string(),
	type: z.string(),
	date: z.string(),
	time: z.string(),
	message: z.string(),
	completed: z.boolean(),
	createdAt: z.coerce.date(),
});

const interviewSchema = z.object({
	id: z.string().uuid(),
	userId: z.string(),
	applicationId: z.string().nullable(),
	title: z.string(),
	company: z.string(),
	role: z.string(),
	type: z.string(),
	status: z.string(),
	outcome: z.string(),
	date: z.string(),
	startTime: z.string(),
	endTime: z.string(),
	timezone: z.string(),
	location: z.string().nullable(),
	meetingLink: z.string().nullable(),
	contactName: z.string().nullable(),
	contactEmail: z.string().nullable(),
	contactPhone: z.string().nullable(),
	notes: z.string().nullable(),
	preparationMaterials: z.string().nullable(),
	interviewerNames: z.array(z.string()).nullable(),
	round: z.number(),
	recurrence: z.string(),
	createdAt: z.coerce.date(),
	updatedAt: z.coerce.date(),
});

const interviewWithRemindersSchema = interviewSchema.extend({
	reminders: z.array(reminderSchema),
});

const availabilitySlotSchema = z.object({
	id: z.string().uuid(),
	userId: z.string(),
	dayOfWeek: z.number(),
	startTime: z.string(),
	endTime: z.string(),
	isRecurring: z.boolean(),
	createdAt: z.coerce.date(),
});

const remindersRouter = {
	add: protectedProcedure
		.route({
			method: "POST",
			path: "/interview-scheduler/{interviewId}/reminders",
			tags: ["Interview Scheduler"],
			summary: "Add reminder to interview",
		})
		.input(
			z.object({
				interviewId: z.string(),
				type: reminderTypeSchema,
				date: z.string(),
				time: z.string(),
				message: z.string().min(1).max(500),
			}),
		)
		.output(z.string())
		.handler(async ({ input }) => {
			return await interviewSchedulerService.reminders.add({
				...input,
				type: input.type as ReminderType,
			});
		}),

	toggle: protectedProcedure
		.route({
			method: "POST",
			path: "/interview-scheduler/{interviewId}/reminders/{id}/toggle",
			tags: ["Interview Scheduler"],
			summary: "Toggle reminder completion",
		})
		.input(z.object({ id: z.string().uuid(), interviewId: z.string() }))
		.output(z.boolean())
		.handler(async ({ input }) => {
			return await interviewSchedulerService.reminders.toggle(input);
		}),

	delete: protectedProcedure
		.route({
			method: "DELETE",
			path: "/interview-scheduler/{interviewId}/reminders/{id}",
			tags: ["Interview Scheduler"],
			summary: "Delete a reminder",
		})
		.input(z.object({ id: z.string().uuid(), interviewId: z.string() }))
		.output(z.void())
		.handler(async ({ input }) => {
			return await interviewSchedulerService.reminders.delete(input);
		}),

	getPending: protectedProcedure
		.route({
			method: "GET",
			path: "/interview-scheduler/reminders/pending",
			tags: ["Interview Scheduler"],
			summary: "Get pending reminders",
		})
		.output(
			z.array(
				reminderSchema.extend({
					interviewTitle: z.string(),
				}),
			),
		)
		.handler(async ({ context }) => {
			return await interviewSchedulerService.reminders.getPending({ userId: context.user.id });
		}),
};

const availabilityRouter = {
	add: protectedProcedure
		.route({
			method: "POST",
			path: "/interview-scheduler/availability",
			tags: ["Interview Scheduler"],
			summary: "Add availability slot",
		})
		.input(
			z.object({
				dayOfWeek: z.number().min(0).max(6),
				startTime: z.string(),
				endTime: z.string(),
				isRecurring: z.boolean().optional(),
			}),
		)
		.output(z.string())
		.handler(async ({ context, input }) => {
			return await interviewSchedulerService.availability.add({
				...input,
				userId: context.user.id,
			});
		}),

	list: protectedProcedure
		.route({
			method: "GET",
			path: "/interview-scheduler/availability",
			tags: ["Interview Scheduler"],
			summary: "List availability slots",
		})
		.output(z.array(availabilitySlotSchema))
		.handler(async ({ context }) => {
			return await interviewSchedulerService.availability.list({ userId: context.user.id });
		}),

	delete: protectedProcedure
		.route({
			method: "DELETE",
			path: "/interview-scheduler/availability/{id}",
			tags: ["Interview Scheduler"],
			summary: "Delete availability slot",
		})
		.input(z.object({ id: z.string().uuid() }))
		.output(z.void())
		.handler(async ({ context, input }) => {
			return await interviewSchedulerService.availability.delete({
				id: input.id,
				userId: context.user.id,
			});
		}),
};

export const interviewSchedulerRouter = {
	reminders: remindersRouter,
	availability: availabilityRouter,

	create: protectedProcedure
		.route({
			method: "POST",
			path: "/interview-scheduler",
			tags: ["Interview Scheduler"],
			summary: "Create a new scheduled interview",
		})
		.input(
			z.object({
				applicationId: z.string().optional(),
				title: z.string().min(1).max(255),
				company: z.string().min(1).max(255),
				role: z.string().min(1).max(255),
				type: interviewTypeSchema,
				date: z.string(),
				startTime: z.string(),
				endTime: z.string(),
				timezone: z.string(),
				location: z.string().optional(),
				meetingLink: z.string().optional(),
				contactName: z.string().optional(),
				contactEmail: z.string().optional(),
				contactPhone: z.string().optional(),
				notes: z.string().optional(),
				preparationMaterials: z.string().optional(),
				interviewerNames: z.array(z.string()).optional(),
				round: z.number().optional(),
				recurrence: recurrenceTypeSchema.optional(),
			}),
		)
		.output(z.string())
		.handler(async ({ context, input }) => {
			return await interviewSchedulerService.create({
				...input,
				userId: context.user.id,
				type: input.type as ScheduledInterviewType,
				recurrence: input.recurrence as RecurrenceType | undefined,
			});
		}),

	getById: protectedProcedure
		.route({
			method: "GET",
			path: "/interview-scheduler/{id}",
			tags: ["Interview Scheduler"],
			summary: "Get interview by ID",
		})
		.input(z.object({ id: z.string().uuid() }))
		.output(interviewWithRemindersSchema)
		.handler(async ({ context, input }) => {
			return await interviewSchedulerService.getById({ id: input.id, userId: context.user.id });
		}),

	list: protectedProcedure
		.route({
			method: "GET",
			path: "/interview-scheduler",
			tags: ["Interview Scheduler"],
			summary: "List scheduled interviews",
		})
		.input(
			z
				.object({
					status: interviewStatusSchema.optional(),
					type: interviewTypeSchema.optional(),
					startDate: z.string().optional(),
					endDate: z.string().optional(),
					limit: z.number().optional(),
				})
				.optional()
				.default({}),
		)
		.output(z.array(interviewWithRemindersSchema))
		.handler(async ({ context, input }) => {
			return await interviewSchedulerService.list({
				userId: context.user.id,
				status: input.status as ScheduledInterviewStatus | undefined,
				type: input.type as ScheduledInterviewType | undefined,
				startDate: input.startDate,
				endDate: input.endDate,
				limit: input.limit,
			});
		}),

	update: protectedProcedure
		.route({
			method: "PUT",
			path: "/interview-scheduler/{id}",
			tags: ["Interview Scheduler"],
			summary: "Update an interview",
		})
		.input(
			z.object({
				id: z.string().uuid(),
				title: z.string().min(1).max(255).optional(),
				company: z.string().min(1).max(255).optional(),
				role: z.string().min(1).max(255).optional(),
				type: interviewTypeSchema.optional(),
				status: interviewStatusSchema.optional(),
				outcome: interviewOutcomeSchema.optional(),
				date: z.string().optional(),
				startTime: z.string().optional(),
				endTime: z.string().optional(),
				timezone: z.string().optional(),
				location: z.string().optional(),
				meetingLink: z.string().optional(),
				contactName: z.string().optional(),
				contactEmail: z.string().optional(),
				contactPhone: z.string().optional(),
				notes: z.string().optional(),
				preparationMaterials: z.string().optional(),
				interviewerNames: z.array(z.string()).optional(),
				round: z.number().optional(),
				recurrence: recurrenceTypeSchema.optional(),
			}),
		)
		.output(z.void())
		.handler(async ({ context, input }) => {
			return await interviewSchedulerService.update({
				...input,
				userId: context.user.id,
				type: input.type as ScheduledInterviewType | undefined,
				status: input.status as ScheduledInterviewStatus | undefined,
				outcome: input.outcome as ScheduledInterviewOutcome | undefined,
				recurrence: input.recurrence as RecurrenceType | undefined,
			});
		}),

	updateOutcome: protectedProcedure
		.route({
			method: "PUT",
			path: "/interview-scheduler/{id}/outcome",
			tags: ["Interview Scheduler"],
			summary: "Update interview outcome",
		})
		.input(
			z.object({
				id: z.string().uuid(),
				outcome: interviewOutcomeSchema,
			}),
		)
		.output(z.void())
		.handler(async ({ context, input }) => {
			return await interviewSchedulerService.updateOutcome({
				id: input.id,
				userId: context.user.id,
				outcome: input.outcome as ScheduledInterviewOutcome,
			});
		}),

	delete: protectedProcedure
		.route({
			method: "DELETE",
			path: "/interview-scheduler/{id}",
			tags: ["Interview Scheduler"],
			summary: "Delete an interview",
		})
		.input(z.object({ id: z.string().uuid() }))
		.output(z.void())
		.handler(async ({ context, input }) => {
			return await interviewSchedulerService.delete({ id: input.id, userId: context.user.id });
		}),

	getUpcoming: protectedProcedure
		.route({
			method: "GET",
			path: "/interview-scheduler/upcoming",
			tags: ["Interview Scheduler"],
			summary: "Get upcoming interviews",
		})
		.input(z.object({ days: z.number().optional(), limit: z.number().optional() }).optional().default({}))
		.output(z.array(interviewSchema))
		.handler(async ({ context, input }) => {
			return await interviewSchedulerService.getUpcoming({
				userId: context.user.id,
				days: input.days,
				limit: input.limit,
			});
		}),

	getStatistics: protectedProcedure
		.route({
			method: "GET",
			path: "/interview-scheduler/statistics",
			tags: ["Interview Scheduler"],
			summary: "Get interview scheduler statistics",
		})
		.output(
			z.object({
				total: z.number(),
				upcoming: z.number(),
				completed: z.number(),
				thisMonth: z.number(),
				successRate: z.number(),
				byStatus: z.record(z.string(), z.number()),
				byType: z.record(z.string(), z.number()),
				byOutcome: z.record(z.string(), z.number()),
			}),
		)
		.handler(async ({ context }) => {
			return await interviewSchedulerService.getStatistics({ userId: context.user.id });
		}),
};
