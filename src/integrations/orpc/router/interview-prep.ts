import z from "zod";
import { protectedProcedure } from "../context";
import {
	type ChecklistCategory,
	type ChecklistStatus,
	type InterviewType,
	interviewPrepService,
} from "../services/interview-prep";

const checklistStatusSchema = z.enum(["preparing", "ready", "completed"]);
const interviewTypeSchema = z.enum(["phone", "video", "in-person", "technical", "behavioral", "panel"]);
const checklistCategorySchema = z.enum(["research", "preparation", "logistics", "questions", "follow_up"]);

const checklistItemSchema = z.object({
	id: z.string().uuid(),
	checklistId: z.string(),
	category: z.string(),
	title: z.string(),
	description: z.string().nullable(),
	isCompleted: z.boolean(),
	completedAt: z.coerce.date().nullable(),
	order: z.number(),
	createdAt: z.coerce.date(),
});

const checklistSchema = z.object({
	id: z.string().uuid(),
	userId: z.string(),
	applicationId: z.string().nullable(),
	companyName: z.string(),
	position: z.string(),
	interviewDate: z.coerce.date().nullable(),
	interviewType: z.string().nullable(),
	interviewerName: z.string().nullable(),
	interviewerRole: z.string().nullable(),
	notes: z.string().nullable(),
	status: z.string(),
	createdAt: z.coerce.date(),
	updatedAt: z.coerce.date(),
});

const checklistWithStatsSchema = checklistSchema.extend({
	totalItems: z.number(),
	completedItems: z.number(),
	completionPercentage: z.number(),
});

const checklistWithItemsSchema = checklistSchema.extend({
	items: z.array(checklistItemSchema),
	itemsByCategory: z.record(z.string(), z.array(checklistItemSchema)),
	totalItems: z.number(),
	completedItems: z.number(),
	completionPercentage: z.number(),
});

const itemsRouter = {
	add: protectedProcedure
		.route({
			method: "POST",
			path: "/interview-prep/{checklistId}/items",
			tags: ["Interview Prep"],
			summary: "Add item to checklist",
		})
		.input(
			z.object({
				checklistId: z.string(),
				category: checklistCategorySchema,
				title: z.string().min(1).max(255),
				description: z.string().optional(),
				order: z.number().optional(),
			}),
		)
		.output(z.string())
		.handler(async ({ input }) => {
			return await interviewPrepService.items.add({
				...input,
				category: input.category as ChecklistCategory,
			});
		}),

	toggle: protectedProcedure
		.route({
			method: "POST",
			path: "/interview-prep/{checklistId}/items/{id}/toggle",
			tags: ["Interview Prep"],
			summary: "Toggle item completion",
		})
		.input(z.object({ id: z.string().uuid(), checklistId: z.string() }))
		.output(z.boolean())
		.handler(async ({ input }) => {
			return await interviewPrepService.items.toggle(input);
		}),

	update: protectedProcedure
		.route({
			method: "PUT",
			path: "/interview-prep/{checklistId}/items/{id}",
			tags: ["Interview Prep"],
			summary: "Update a checklist item",
		})
		.input(
			z.object({
				id: z.string().uuid(),
				checklistId: z.string(),
				title: z.string().min(1).max(255).optional(),
				description: z.string().optional(),
				order: z.number().optional(),
			}),
		)
		.output(z.void())
		.handler(async ({ input }) => {
			return await interviewPrepService.items.update(input);
		}),

	delete: protectedProcedure
		.route({
			method: "DELETE",
			path: "/interview-prep/{checklistId}/items/{id}",
			tags: ["Interview Prep"],
			summary: "Delete a checklist item",
		})
		.input(z.object({ id: z.string().uuid(), checklistId: z.string() }))
		.output(z.void())
		.handler(async ({ input }) => {
			return await interviewPrepService.items.delete(input);
		}),
};

export const interviewPrepRouter = {
	items: itemsRouter,

	create: protectedProcedure
		.route({
			method: "POST",
			path: "/interview-prep",
			tags: ["Interview Prep"],
			summary: "Create a new interview checklist",
		})
		.input(
			z.object({
				applicationId: z.string().optional(),
				companyName: z.string().min(1).max(255),
				position: z.string().min(1).max(255),
				interviewDate: z.coerce.date().optional(),
				interviewType: interviewTypeSchema.optional(),
				interviewerName: z.string().optional(),
				interviewerRole: z.string().optional(),
				notes: z.string().optional(),
			}),
		)
		.output(z.string())
		.handler(async ({ context, input }) => {
			return await interviewPrepService.create({
				...input,
				userId: context.user.id,
				interviewType: input.interviewType as InterviewType | undefined,
			});
		}),

	getById: protectedProcedure
		.route({
			method: "GET",
			path: "/interview-prep/{id}",
			tags: ["Interview Prep"],
			summary: "Get checklist by ID",
		})
		.input(z.object({ id: z.string().uuid() }))
		.output(checklistWithItemsSchema)
		.handler(async ({ context, input }) => {
			return await interviewPrepService.getById({ id: input.id, userId: context.user.id });
		}),

	list: protectedProcedure
		.route({
			method: "GET",
			path: "/interview-prep",
			tags: ["Interview Prep"],
			summary: "List interview checklists",
		})
		.input(
			z
				.object({
					status: checklistStatusSchema.optional(),
					upcoming: z.boolean().optional(),
					limit: z.number().optional(),
				})
				.optional()
				.default({}),
		)
		.output(z.array(checklistWithStatsSchema))
		.handler(async ({ context, input }) => {
			return await interviewPrepService.list({
				userId: context.user.id,
				status: input.status as ChecklistStatus | undefined,
				upcoming: input.upcoming,
				limit: input.limit,
			});
		}),

	update: protectedProcedure
		.route({
			method: "PUT",
			path: "/interview-prep/{id}",
			tags: ["Interview Prep"],
			summary: "Update a checklist",
		})
		.input(
			z.object({
				id: z.string().uuid(),
				companyName: z.string().min(1).max(255).optional(),
				position: z.string().min(1).max(255).optional(),
				interviewDate: z.coerce.date().optional(),
				interviewType: interviewTypeSchema.optional(),
				interviewerName: z.string().optional(),
				interviewerRole: z.string().optional(),
				notes: z.string().optional(),
				status: checklistStatusSchema.optional(),
			}),
		)
		.output(z.void())
		.handler(async ({ context, input }) => {
			return await interviewPrepService.update({
				...input,
				userId: context.user.id,
				interviewType: input.interviewType as InterviewType | undefined,
				status: input.status as ChecklistStatus | undefined,
			});
		}),

	delete: protectedProcedure
		.route({
			method: "DELETE",
			path: "/interview-prep/{id}",
			tags: ["Interview Prep"],
			summary: "Delete a checklist",
		})
		.input(z.object({ id: z.string().uuid() }))
		.output(z.void())
		.handler(async ({ context, input }) => {
			return await interviewPrepService.delete({ id: input.id, userId: context.user.id });
		}),

	getUpcoming: protectedProcedure
		.route({
			method: "GET",
			path: "/interview-prep/upcoming",
			tags: ["Interview Prep"],
			summary: "Get upcoming interviews",
		})
		.input(z.object({ days: z.number().optional() }).optional().default({}))
		.output(z.array(checklistSchema))
		.handler(async ({ context, input }) => {
			return await interviewPrepService.getUpcoming({ userId: context.user.id, days: input.days });
		}),

	getStatistics: protectedProcedure
		.route({
			method: "GET",
			path: "/interview-prep/statistics",
			tags: ["Interview Prep"],
			summary: "Get interview prep statistics",
		})
		.output(
			z.object({
				total: z.number(),
				byStatus: z.record(z.string(), z.number()),
				byType: z.record(z.string(), z.number()),
				upcoming: z.number(),
				preparing: z.number(),
				ready: z.number(),
				completed: z.number(),
			}),
		)
		.handler(async ({ context }) => {
			return await interviewPrepService.getStatistics({ userId: context.user.id });
		}),
};
