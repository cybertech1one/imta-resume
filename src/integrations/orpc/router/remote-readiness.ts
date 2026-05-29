import z from "zod";
import { protectedProcedure } from "../context";
import { remoteReadinessService } from "../services/remote-readiness";

const categorySchema = z.enum([
	"communication",
	"time_management",
	"tech_proficiency",
	"self_discipline",
	"home_office",
]);

const levelSchema = z.enum(["beginner", "developing", "competent", "proficient", "expert"]);

const prioritySchema = z.enum(["high", "medium", "low"]);

const categoryScoresSchema = z.record(
	categorySchema,
	z.object({
		score: z.number(),
		maxScore: z.number(),
		percentage: z.number(),
	}),
);

const resultSchema = z.object({
	id: z.string().uuid(),
	date: z.string(),
	totalScore: z.number(),
	maxScore: z.number(),
	percentage: z.number(),
	categoryScores: categoryScoresSchema,
	level: levelSchema,
});

const improvementSchema = z.object({
	id: z.string().uuid(),
	category: categorySchema,
	title: z.string(),
	description: z.string(),
	completed: z.boolean(),
	priority: prioritySchema,
});

export const remoteReadinessRouter = {
	// ============================================
	// QUIZ RESULTS
	// ============================================

	// Get all results
	getResults: protectedProcedure
		.route({
			method: "GET",
			path: "/remote-readiness/results",
			tags: ["Remote Readiness"],
			summary: "Get all quiz results",
		})
		.output(z.array(resultSchema))
		.handler(async ({ context }) => {
			return await remoteReadinessService.getResults(context.user.id);
		}),

	// Get latest result
	getLatestResult: protectedProcedure
		.route({
			method: "GET",
			path: "/remote-readiness/results/latest",
			tags: ["Remote Readiness"],
			summary: "Get latest quiz result",
		})
		.output(resultSchema.nullable())
		.handler(async ({ context }) => {
			return await remoteReadinessService.getLatestResult(context.user.id);
		}),

	// Save a result
	saveResult: protectedProcedure
		.route({
			method: "POST",
			path: "/remote-readiness/results",
			tags: ["Remote Readiness"],
			summary: "Save a quiz result",
		})
		.input(
			z.object({
				totalScore: z.number(),
				maxScore: z.number(),
				percentage: z.number(),
				level: levelSchema,
				categoryScores: categoryScoresSchema,
			}),
		)
		.output(resultSchema)
		.handler(async ({ context, input }) => {
			return await remoteReadinessService.saveResult({
				userId: context.user.id,
				...input,
			});
		}),

	// ============================================
	// CHECKLIST
	// ============================================

	// Get checklist state
	getChecklist: protectedProcedure
		.route({
			method: "GET",
			path: "/remote-readiness/checklist",
			tags: ["Remote Readiness"],
			summary: "Get checklist state",
		})
		.output(z.array(z.string()))
		.handler(async ({ context }) => {
			return await remoteReadinessService.getChecklist(context.user.id);
		}),

	// Toggle a checklist item
	toggleChecklistItem: protectedProcedure
		.route({
			method: "POST",
			path: "/remote-readiness/checklist/toggle",
			tags: ["Remote Readiness"],
			summary: "Toggle a checklist item",
		})
		.input(z.object({ itemId: z.string() }))
		.output(z.array(z.string()))
		.handler(async ({ context, input }) => {
			return await remoteReadinessService.toggleChecklistItem(context.user.id, input.itemId);
		}),

	// Update checklist items (bulk)
	updateChecklistItems: protectedProcedure
		.route({
			method: "PUT",
			path: "/remote-readiness/checklist",
			tags: ["Remote Readiness"],
			summary: "Update checklist items",
		})
		.input(z.object({ checkedItems: z.array(z.string()) }))
		.output(z.void())
		.handler(async ({ context, input }) => {
			return await remoteReadinessService.updateChecklistItems(context.user.id, input.checkedItems);
		}),

	// ============================================
	// HOME OFFICE
	// ============================================

	// Get office items state
	getOfficeItems: protectedProcedure
		.route({
			method: "GET",
			path: "/remote-readiness/office",
			tags: ["Remote Readiness"],
			summary: "Get office items state",
		})
		.output(z.array(z.string()))
		.handler(async ({ context }) => {
			return await remoteReadinessService.getOfficeItems(context.user.id);
		}),

	// Toggle an office item
	toggleOfficeItem: protectedProcedure
		.route({
			method: "POST",
			path: "/remote-readiness/office/toggle",
			tags: ["Remote Readiness"],
			summary: "Toggle an office item",
		})
		.input(z.object({ itemId: z.string() }))
		.output(z.array(z.string()))
		.handler(async ({ context, input }) => {
			return await remoteReadinessService.toggleOfficeItem(context.user.id, input.itemId);
		}),

	// Update office items (bulk)
	updateOfficeItems: protectedProcedure
		.route({
			method: "PUT",
			path: "/remote-readiness/office",
			tags: ["Remote Readiness"],
			summary: "Update office items",
		})
		.input(z.object({ checkedItems: z.array(z.string()) }))
		.output(z.void())
		.handler(async ({ context, input }) => {
			return await remoteReadinessService.updateOfficeItems(context.user.id, input.checkedItems);
		}),

	// ============================================
	// IMPROVEMENT TASKS
	// ============================================

	// Get all improvements
	getImprovements: protectedProcedure
		.route({
			method: "GET",
			path: "/remote-readiness/improvements",
			tags: ["Remote Readiness"],
			summary: "Get all improvement tasks",
		})
		.output(z.array(improvementSchema))
		.handler(async ({ context }) => {
			return await remoteReadinessService.getImprovements(context.user.id);
		}),

	// Create an improvement
	createImprovement: protectedProcedure
		.route({
			method: "POST",
			path: "/remote-readiness/improvements",
			tags: ["Remote Readiness"],
			summary: "Create an improvement task",
		})
		.input(
			z.object({
				category: categorySchema,
				title: z.string(),
				description: z.string(),
				priority: prioritySchema,
			}),
		)
		.output(improvementSchema)
		.handler(async ({ context, input }) => {
			return await remoteReadinessService.createImprovement({
				userId: context.user.id,
				...input,
			});
		}),

	// Toggle an improvement
	toggleImprovement: protectedProcedure
		.route({
			method: "POST",
			path: "/remote-readiness/improvements/toggle",
			tags: ["Remote Readiness"],
			summary: "Toggle an improvement task",
		})
		.input(z.object({ improvementId: z.string() }))
		.output(z.boolean())
		.handler(async ({ context, input }) => {
			return await remoteReadinessService.toggleImprovement(context.user.id, input.improvementId);
		}),

	// Delete an improvement
	deleteImprovement: protectedProcedure
		.route({
			method: "DELETE",
			path: "/remote-readiness/improvements",
			tags: ["Remote Readiness"],
			summary: "Delete an improvement task",
		})
		.input(z.object({ improvementId: z.string() }))
		.output(z.void())
		.handler(async ({ context, input }) => {
			return await remoteReadinessService.deleteImprovement(context.user.id, input.improvementId);
		}),

	// Clear all improvements
	clearImprovements: protectedProcedure
		.route({
			method: "DELETE",
			path: "/remote-readiness/improvements/all",
			tags: ["Remote Readiness"],
			summary: "Clear all improvement tasks",
		})
		.output(z.void())
		.handler(async ({ context }) => {
			return await remoteReadinessService.clearImprovements(context.user.id);
		}),

	// Bulk create improvements
	createImprovements: protectedProcedure
		.route({
			method: "POST",
			path: "/remote-readiness/improvements/bulk",
			tags: ["Remote Readiness"],
			summary: "Bulk create improvement tasks",
		})
		.input(
			z.object({
				improvements: z.array(
					z.object({
						category: categorySchema,
						title: z.string(),
						description: z.string(),
						priority: prioritySchema,
					}),
				),
			}),
		)
		.output(z.array(improvementSchema))
		.handler(async ({ context, input }) => {
			return await remoteReadinessService.createImprovements(
				input.improvements.map((i) => ({ ...i, userId: context.user.id })),
			);
		}),
};
