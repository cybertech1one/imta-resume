import z from "zod";
import { protectedProcedure } from "../context";
import { careerGoalsService, type GoalCategory, type GoalStatus } from "../services/career-goals";

const goalStatusSchema = z.enum(["not_started", "in_progress", "completed", "on_hold", "cancelled"]);
const goalCategorySchema = z.enum(["career", "skill", "education", "networking", "financial", "other"]);

const goalMetricSchema = z.object({
	name: z.string(),
	target: z.number(),
	current: z.number(),
});

const milestoneSchema = z.object({
	id: z.string().uuid(),
	goalId: z.string(),
	title: z.string(),
	description: z.string().nullable(),
	isCompleted: z.boolean(),
	completedAt: z.coerce.date().nullable(),
	dueDate: z.coerce.date().nullable(),
	order: z.number(),
	createdAt: z.coerce.date(),
});

const goalSchema = z.object({
	id: z.string().uuid(),
	userId: z.string(),
	title: z.string(),
	description: z.string().nullable(),
	category: z.string(),
	status: goalStatusSchema,
	priority: z.number(),
	targetDate: z.coerce.date().nullable(),
	completedAt: z.coerce.date().nullable(),
	progress: z.number(),
	tags: z.array(z.string()).nullable(),
	metrics: z.array(goalMetricSchema).nullable(),
	createdAt: z.coerce.date(),
	updatedAt: z.coerce.date(),
});

const goalWithMilestonesSchema = goalSchema.extend({
	milestones: z.array(milestoneSchema),
});

const milestonesRouter = {
	create: protectedProcedure
		.route({
			method: "POST",
			path: "/goals/{goalId}/milestones",
			tags: ["Career Goals"],
			summary: "Create a milestone",
		})
		.input(
			z.object({
				goalId: z.string(),
				title: z.string().min(1).max(255),
				description: z.string().optional(),
				dueDate: z.coerce.date().optional(),
				order: z.number().optional(),
			}),
		)
		.output(z.string())
		.handler(async ({ context, input }) => {
			// Verify goal belongs to current user
			await careerGoalsService.getById({ id: input.goalId, userId: context.user.id });
			return await careerGoalsService.milestones.create(input);
		}),

	update: protectedProcedure
		.route({
			method: "PUT",
			path: "/goals/{goalId}/milestones/{id}",
			tags: ["Career Goals"],
			summary: "Update a milestone",
		})
		.input(
			z.object({
				id: z.string().uuid(),
				goalId: z.string(),
				title: z.string().min(1).max(255).optional(),
				description: z.string().optional(),
				isCompleted: z.boolean().optional(),
				dueDate: z.coerce.date().optional(),
				order: z.number().optional(),
			}),
		)
		.output(z.void())
		.handler(async ({ context, input }) => {
			// Verify goal belongs to current user
			await careerGoalsService.getById({ id: input.goalId, userId: context.user.id });
			return await careerGoalsService.milestones.update(input);
		}),

	toggle: protectedProcedure
		.route({
			method: "POST",
			path: "/goals/{goalId}/milestones/{id}/toggle",
			tags: ["Career Goals"],
			summary: "Toggle milestone completion",
		})
		.input(z.object({ id: z.string().uuid(), goalId: z.string() }))
		.output(z.boolean())
		.handler(async ({ context, input }) => {
			// Verify goal belongs to current user
			await careerGoalsService.getById({ id: input.goalId, userId: context.user.id });
			return await careerGoalsService.milestones.toggle(input);
		}),

	delete: protectedProcedure
		.route({
			method: "DELETE",
			path: "/goals/{goalId}/milestones/{id}",
			tags: ["Career Goals"],
			summary: "Delete a milestone",
		})
		.input(z.object({ id: z.string().uuid(), goalId: z.string() }))
		.output(z.void())
		.handler(async ({ context, input }) => {
			// Verify goal belongs to current user
			await careerGoalsService.getById({ id: input.goalId, userId: context.user.id });
			return await careerGoalsService.milestones.delete(input);
		}),
};

export const goalsRouter = {
	milestones: milestonesRouter,

	create: protectedProcedure
		.route({
			method: "POST",
			path: "/goals",
			tags: ["Career Goals"],
			summary: "Create a new career goal",
		})
		.input(
			z.object({
				title: z.string().min(1).max(255),
				description: z.string().optional(),
				category: goalCategorySchema,
				status: goalStatusSchema.optional(),
				priority: z.number().min(0).max(5).optional(),
				targetDate: z.coerce.date().optional(),
				progress: z.number().min(0).max(100).optional(),
				tags: z.array(z.string()).optional(),
				metrics: z.array(goalMetricSchema).optional(),
			}),
		)
		.output(z.string())
		.handler(async ({ context, input }) => {
			return await careerGoalsService.create({
				...input,
				userId: context.user.id,
				category: input.category as GoalCategory,
				status: input.status as GoalStatus | undefined,
			});
		}),

	getById: protectedProcedure
		.route({
			method: "GET",
			path: "/goals/{id}",
			tags: ["Career Goals"],
			summary: "Get goal by ID",
		})
		.input(z.object({ id: z.string().uuid() }))
		.output(goalWithMilestonesSchema)
		.handler(async ({ context, input }) => {
			return await careerGoalsService.getById({ id: input.id, userId: context.user.id });
		}),

	list: protectedProcedure
		.route({
			method: "GET",
			path: "/goals",
			tags: ["Career Goals"],
			summary: "List career goals",
		})
		.input(
			z
				.object({
					status: goalStatusSchema.optional(),
					category: goalCategorySchema.optional(),
					includeCompleted: z.boolean().optional(),
				})
				.optional()
				.default({}),
		)
		.output(z.array(goalWithMilestonesSchema))
		.handler(async ({ context, input }) => {
			return await careerGoalsService.list({
				userId: context.user.id,
				status: input.status as GoalStatus | undefined,
				category: input.category as GoalCategory | undefined,
				includeCompleted: input.includeCompleted,
			});
		}),

	update: protectedProcedure
		.route({
			method: "PUT",
			path: "/goals/{id}",
			tags: ["Career Goals"],
			summary: "Update a goal",
		})
		.input(
			z.object({
				id: z.string().uuid(),
				title: z.string().min(1).max(255).optional(),
				description: z.string().optional(),
				category: goalCategorySchema.optional(),
				status: goalStatusSchema.optional(),
				priority: z.number().min(0).max(5).optional(),
				targetDate: z.coerce.date().optional(),
				progress: z.number().min(0).max(100).optional(),
				tags: z.array(z.string()).optional(),
				metrics: z.array(goalMetricSchema).optional(),
			}),
		)
		.output(z.void())
		.handler(async ({ context, input }) => {
			return await careerGoalsService.update({
				...input,
				userId: context.user.id,
				category: input.category as GoalCategory | undefined,
				status: input.status as GoalStatus | undefined,
			});
		}),

	updateProgress: protectedProcedure
		.route({
			method: "POST",
			path: "/goals/{id}/progress",
			tags: ["Career Goals"],
			summary: "Update goal progress",
		})
		.input(z.object({ id: z.string().uuid(), progress: z.number().min(0).max(100) }))
		.output(z.void())
		.handler(async ({ context, input }) => {
			return await careerGoalsService.updateProgress({
				id: input.id,
				userId: context.user.id,
				progress: input.progress,
			});
		}),

	delete: protectedProcedure
		.route({
			method: "DELETE",
			path: "/goals/{id}",
			tags: ["Career Goals"],
			summary: "Delete a goal",
		})
		.input(z.object({ id: z.string().uuid() }))
		.output(z.void())
		.handler(async ({ context, input }) => {
			return await careerGoalsService.delete({ id: input.id, userId: context.user.id });
		}),

	getStatistics: protectedProcedure
		.route({
			method: "GET",
			path: "/goals/statistics",
			tags: ["Career Goals"],
			summary: "Get goal statistics",
		})
		.output(
			z.object({
				total: z.number(),
				byStatus: z.record(z.string(), z.number()),
				byCategory: z.record(z.string(), z.number()),
				completedThisMonth: z.number(),
				averageProgress: z.number(),
				active: z.number(),
			}),
		)
		.handler(async ({ context }) => {
			return await careerGoalsService.getStatistics({ userId: context.user.id });
		}),
};
