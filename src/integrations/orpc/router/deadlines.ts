import z from "zod";
import type { DeadlinePriority } from "@/integrations/drizzle/schema";
import { protectedProcedure } from "../context";
import { deadlinesService } from "../services/deadlines";

const prioritySchema = z.enum(["high", "medium", "low"]);

const deadlineSchema = z.object({
	id: z.string().uuid(),
	userId: z.string(),
	title: z.string(),
	company: z.string(),
	position: z.string(),
	deadlineDate: z.string(),
	deadlineTime: z.string(),
	priority: prioritySchema,
	notes: z.string(),
	reminderEnabled: z.boolean(),
	reminderDate: z.string().nullable(),
	reminderTime: z.string().nullable(),
	completed: z.boolean(),
	createdAt: z.coerce.date(),
	updatedAt: z.coerce.date(),
});

export const deadlinesRouter = {
	create: protectedProcedure
		.route({
			method: "POST",
			path: "/deadlines",
			tags: ["Deadlines"],
			summary: "Create a new deadline",
		})
		.input(
			z.object({
				title: z.string().min(1),
				company: z.string().min(1),
				position: z.string().optional(),
				deadlineDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
				deadlineTime: z
					.string()
					.regex(/^\d{2}:\d{2}$/)
					.optional(),
				priority: prioritySchema.optional(),
				notes: z.string().optional(),
				reminderEnabled: z.boolean().optional(),
				reminderDate: z
					.string()
					.regex(/^\d{4}-\d{2}-\d{2}$/)
					.optional(),
				reminderTime: z
					.string()
					.regex(/^\d{2}:\d{2}$/)
					.optional(),
				completed: z.boolean().optional(),
			}),
		)
		.output(z.string())
		.handler(async ({ context, input }) => {
			return await deadlinesService.create({
				...input,
				userId: context.user.id,
				priority: input.priority as DeadlinePriority | undefined,
			});
		}),

	getById: protectedProcedure
		.route({
			method: "GET",
			path: "/deadlines/{id}",
			tags: ["Deadlines"],
			summary: "Get deadline by ID",
		})
		.input(z.object({ id: z.string().uuid() }))
		.output(deadlineSchema)
		.handler(async ({ context, input }) => {
			return await deadlinesService.getById({ id: input.id, userId: context.user.id });
		}),

	list: protectedProcedure
		.route({
			method: "GET",
			path: "/deadlines",
			tags: ["Deadlines"],
			summary: "List deadlines",
		})
		.input(
			z
				.object({
					startDate: z
						.string()
						.regex(/^\d{4}-\d{2}-\d{2}$/)
						.optional(),
					endDate: z
						.string()
						.regex(/^\d{4}-\d{2}-\d{2}$/)
						.optional(),
					priority: prioritySchema.optional(),
					completed: z.boolean().optional(),
					limit: z.number().optional(),
					offset: z.number().optional(),
				})
				.optional()
				.default({}),
		)
		.output(z.array(deadlineSchema))
		.handler(async ({ context, input }) => {
			return await deadlinesService.list({
				userId: context.user.id,
				...input,
				priority: input.priority as DeadlinePriority | undefined,
			});
		}),

	update: protectedProcedure
		.route({
			method: "PUT",
			path: "/deadlines/{id}",
			tags: ["Deadlines"],
			summary: "Update a deadline",
		})
		.input(
			z.object({
				id: z.string().uuid(),
				title: z.string().min(1).optional(),
				company: z.string().min(1).optional(),
				position: z.string().optional(),
				deadlineDate: z
					.string()
					.regex(/^\d{4}-\d{2}-\d{2}$/)
					.optional(),
				deadlineTime: z
					.string()
					.regex(/^\d{2}:\d{2}$/)
					.optional(),
				priority: prioritySchema.optional(),
				notes: z.string().optional(),
				reminderEnabled: z.boolean().optional(),
				reminderDate: z
					.string()
					.regex(/^\d{4}-\d{2}-\d{2}$/)
					.nullable()
					.optional(),
				reminderTime: z
					.string()
					.regex(/^\d{2}:\d{2}$/)
					.nullable()
					.optional(),
				completed: z.boolean().optional(),
			}),
		)
		.output(z.void())
		.handler(async ({ context, input }) => {
			return await deadlinesService.update({
				...input,
				userId: context.user.id,
				priority: input.priority as DeadlinePriority | undefined,
			});
		}),

	toggleComplete: protectedProcedure
		.route({
			method: "POST",
			path: "/deadlines/{id}/toggle-complete",
			tags: ["Deadlines"],
			summary: "Toggle deadline completion status",
		})
		.input(z.object({ id: z.string().uuid() }))
		.output(z.boolean())
		.handler(async ({ context, input }) => {
			return await deadlinesService.toggleComplete({ id: input.id, userId: context.user.id });
		}),

	toggleReminder: protectedProcedure
		.route({
			method: "POST",
			path: "/deadlines/{id}/toggle-reminder",
			tags: ["Deadlines"],
			summary: "Toggle deadline reminder",
		})
		.input(z.object({ id: z.string().uuid() }))
		.output(z.boolean())
		.handler(async ({ context, input }) => {
			return await deadlinesService.toggleReminder({ id: input.id, userId: context.user.id });
		}),

	delete: protectedProcedure
		.route({
			method: "DELETE",
			path: "/deadlines/{id}",
			tags: ["Deadlines"],
			summary: "Delete a deadline",
		})
		.input(z.object({ id: z.string().uuid() }))
		.output(z.void())
		.handler(async ({ context, input }) => {
			return await deadlinesService.delete({ id: input.id, userId: context.user.id });
		}),

	getStatistics: protectedProcedure
		.route({
			method: "GET",
			path: "/deadlines/statistics",
			tags: ["Deadlines"],
			summary: "Get deadline statistics",
		})
		.input(z.object({}).optional().default({}))
		.output(
			z.object({
				total: z.number(),
				upcoming: z.number(),
				past: z.number(),
				completed: z.number(),
				highPriority: z.number(),
				thisWeek: z.number(),
				byPriority: z.object({
					high: z.number(),
					medium: z.number(),
					low: z.number(),
				}),
			}),
		)
		.handler(async ({ context }) => {
			return await deadlinesService.getStatistics({ userId: context.user.id });
		}),
};
