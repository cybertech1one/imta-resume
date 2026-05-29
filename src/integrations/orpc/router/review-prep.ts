import z from "zod";
import { protectedProcedure } from "../context";
import {
	accomplishmentService,
	goalService,
	type ReviewGoalMilestone,
	reviewPrepDataService,
	salaryResearchService,
} from "../services/review-prep";

// ============================================================================
// Schemas
// ============================================================================

const accomplishmentCategorySchema = z.enum(["project", "achievement", "skill", "recognition", "improvement"]);
const accomplishmentImpactSchema = z.enum(["high", "medium", "low"]);

const reviewGoalCategorySchema = z.enum(["performance", "development", "career", "collaboration"]);
const reviewGoalStatusSchema = z.enum(["on_track", "at_risk", "completed", "not_started"]);
const salaryMarketTrendSchema = z.enum(["up", "stable", "down"]);

const reviewGoalMilestoneSchema = z.object({
	title: z.string(),
	completed: z.boolean(),
});

const accomplishmentSchema = z.object({
	id: z.string().uuid(),
	userId: z.string(),
	date: z.string(),
	title: z.string(),
	description: z.string(),
	category: accomplishmentCategorySchema,
	impact: accomplishmentImpactSchema,
	metrics: z.string().nullable(),
	createdAt: z.coerce.date(),
	updatedAt: z.coerce.date(),
});

const reviewGoalSchema = z.object({
	id: z.string().uuid(),
	userId: z.string(),
	title: z.string(),
	description: z.string(),
	category: reviewGoalCategorySchema,
	targetDate: z.string(),
	progress: z.number(),
	status: reviewGoalStatusSchema,
	milestones: z.array(reviewGoalMilestoneSchema),
	createdAt: z.coerce.date(),
	updatedAt: z.coerce.date(),
});

const salaryResearchSchema = z.object({
	id: z.string().uuid(),
	userId: z.string(),
	role: z.string(),
	level: z.string(),
	minSalary: z.number(),
	maxSalary: z.number(),
	avgSalary: z.number(),
	marketTrend: salaryMarketTrendSchema,
	source: z.string(),
	lastUpdated: z.string(),
	createdAt: z.coerce.date(),
	updatedAt: z.coerce.date(),
});

// ============================================================================
// Router
// ============================================================================

export const reviewPrepRouter = {
	// ========================================
	// Accomplishments
	// ========================================

	createAccomplishment: protectedProcedure
		.route({
			method: "POST",
			path: "/review-prep/accomplishments",
			tags: ["ReviewPrep"],
			summary: "Create a new accomplishment",
		})
		.input(
			z.object({
				date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
				title: z.string().min(1),
				description: z.string().min(1),
				category: accomplishmentCategorySchema,
				impact: accomplishmentImpactSchema,
				metrics: z.string().optional(),
			}),
		)
		.output(z.string())
		.handler(async ({ context, input }) => {
			return await accomplishmentService.create({
				...input,
				userId: context.user.id,
			});
		}),

	getAccomplishment: protectedProcedure
		.route({
			method: "GET",
			path: "/review-prep/accomplishments/{id}",
			tags: ["ReviewPrep"],
			summary: "Get accomplishment by ID",
		})
		.input(z.object({ id: z.string().uuid() }))
		.output(accomplishmentSchema)
		.handler(async ({ context, input }) => {
			return await accomplishmentService.getById({ id: input.id, userId: context.user.id });
		}),

	getAccomplishments: protectedProcedure
		.route({
			method: "GET",
			path: "/review-prep/accomplishments",
			tags: ["ReviewPrep"],
			summary: "List all accomplishments",
		})
		.input(z.object({}).optional().default({}))
		.output(z.array(accomplishmentSchema))
		.handler(async ({ context }) => {
			return await accomplishmentService.list({ userId: context.user.id });
		}),

	updateAccomplishment: protectedProcedure
		.route({
			method: "PUT",
			path: "/review-prep/accomplishments/{id}",
			tags: ["ReviewPrep"],
			summary: "Update an accomplishment",
		})
		.input(
			z.object({
				id: z.string().uuid(),
				date: z
					.string()
					.regex(/^\d{4}-\d{2}-\d{2}$/)
					.optional(),
				title: z.string().min(1).optional(),
				description: z.string().min(1).optional(),
				category: accomplishmentCategorySchema.optional(),
				impact: accomplishmentImpactSchema.optional(),
				metrics: z.string().optional(),
			}),
		)
		.output(z.void())
		.handler(async ({ context, input }) => {
			return await accomplishmentService.update({
				...input,
				userId: context.user.id,
			});
		}),

	deleteAccomplishment: protectedProcedure
		.route({
			method: "DELETE",
			path: "/review-prep/accomplishments/{id}",
			tags: ["ReviewPrep"],
			summary: "Delete an accomplishment",
		})
		.input(z.object({ id: z.string().uuid() }))
		.output(z.void())
		.handler(async ({ context, input }) => {
			return await accomplishmentService.delete({ id: input.id, userId: context.user.id });
		}),

	// ========================================
	// Goals
	// ========================================

	createGoal: protectedProcedure
		.route({
			method: "POST",
			path: "/review-prep/goals",
			tags: ["ReviewPrep"],
			summary: "Create a new review goal",
		})
		.input(
			z.object({
				title: z.string().min(1),
				description: z.string().min(1),
				category: reviewGoalCategorySchema,
				targetDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
				progress: z.number().min(0).max(100).optional(),
				status: reviewGoalStatusSchema.optional(),
				milestones: z.array(reviewGoalMilestoneSchema).optional(),
			}),
		)
		.output(z.string())
		.handler(async ({ context, input }) => {
			return await goalService.create({
				...input,
				userId: context.user.id,
				milestones: input.milestones as ReviewGoalMilestone[] | undefined,
			});
		}),

	getGoal: protectedProcedure
		.route({
			method: "GET",
			path: "/review-prep/goals/{id}",
			tags: ["ReviewPrep"],
			summary: "Get review goal by ID",
		})
		.input(z.object({ id: z.string().uuid() }))
		.output(reviewGoalSchema)
		.handler(async ({ context, input }) => {
			return await goalService.getById({ id: input.id, userId: context.user.id });
		}),

	getGoals: protectedProcedure
		.route({
			method: "GET",
			path: "/review-prep/goals",
			tags: ["ReviewPrep"],
			summary: "List all review goals",
		})
		.input(z.object({}).optional().default({}))
		.output(z.array(reviewGoalSchema))
		.handler(async ({ context }) => {
			return await goalService.list({ userId: context.user.id });
		}),

	updateGoal: protectedProcedure
		.route({
			method: "PUT",
			path: "/review-prep/goals/{id}",
			tags: ["ReviewPrep"],
			summary: "Update a review goal",
		})
		.input(
			z.object({
				id: z.string().uuid(),
				title: z.string().min(1).optional(),
				description: z.string().min(1).optional(),
				category: reviewGoalCategorySchema.optional(),
				targetDate: z
					.string()
					.regex(/^\d{4}-\d{2}-\d{2}$/)
					.optional(),
				progress: z.number().min(0).max(100).optional(),
				status: reviewGoalStatusSchema.optional(),
				milestones: z.array(reviewGoalMilestoneSchema).optional(),
			}),
		)
		.output(z.void())
		.handler(async ({ context, input }) => {
			return await goalService.update({
				...input,
				userId: context.user.id,
				milestones: input.milestones as ReviewGoalMilestone[] | undefined,
			});
		}),

	deleteGoal: protectedProcedure
		.route({
			method: "DELETE",
			path: "/review-prep/goals/{id}",
			tags: ["ReviewPrep"],
			summary: "Delete a review goal",
		})
		.input(z.object({ id: z.string().uuid() }))
		.output(z.void())
		.handler(async ({ context, input }) => {
			return await goalService.delete({ id: input.id, userId: context.user.id });
		}),

	// ========================================
	// Salary Research
	// ========================================

	createSalaryResearch: protectedProcedure
		.route({
			method: "POST",
			path: "/review-prep/salary-research",
			tags: ["ReviewPrep"],
			summary: "Create a new salary research entry",
		})
		.input(
			z.object({
				role: z.string().min(1),
				level: z.string().min(1),
				minSalary: z.number().min(0),
				maxSalary: z.number().min(0),
				avgSalary: z.number().min(0),
				marketTrend: salaryMarketTrendSchema,
				source: z.string().min(1),
				lastUpdated: z.string(),
			}),
		)
		.output(z.string())
		.handler(async ({ context, input }) => {
			return await salaryResearchService.create({
				...input,
				userId: context.user.id,
			});
		}),

	getSalaryResearch: protectedProcedure
		.route({
			method: "GET",
			path: "/review-prep/salary-research/{id}",
			tags: ["ReviewPrep"],
			summary: "Get salary research by ID",
		})
		.input(z.object({ id: z.string().uuid() }))
		.output(salaryResearchSchema)
		.handler(async ({ context, input }) => {
			return await salaryResearchService.getById({ id: input.id, userId: context.user.id });
		}),

	getSalaryResearches: protectedProcedure
		.route({
			method: "GET",
			path: "/review-prep/salary-research",
			tags: ["ReviewPrep"],
			summary: "List all salary research entries",
		})
		.input(z.object({}).optional().default({}))
		.output(z.array(salaryResearchSchema))
		.handler(async ({ context }) => {
			return await salaryResearchService.list({ userId: context.user.id });
		}),

	updateSalaryResearch: protectedProcedure
		.route({
			method: "PUT",
			path: "/review-prep/salary-research/{id}",
			tags: ["ReviewPrep"],
			summary: "Update a salary research entry",
		})
		.input(
			z.object({
				id: z.string().uuid(),
				role: z.string().min(1).optional(),
				level: z.string().min(1).optional(),
				minSalary: z.number().min(0).optional(),
				maxSalary: z.number().min(0).optional(),
				avgSalary: z.number().min(0).optional(),
				marketTrend: salaryMarketTrendSchema.optional(),
				source: z.string().min(1).optional(),
				lastUpdated: z.string().optional(),
			}),
		)
		.output(z.void())
		.handler(async ({ context, input }) => {
			return await salaryResearchService.update({
				...input,
				userId: context.user.id,
			});
		}),

	deleteSalaryResearch: protectedProcedure
		.route({
			method: "DELETE",
			path: "/review-prep/salary-research/{id}",
			tags: ["ReviewPrep"],
			summary: "Delete a salary research entry",
		})
		.input(z.object({ id: z.string().uuid() }))
		.output(z.void())
		.handler(async ({ context, input }) => {
			return await salaryResearchService.delete({ id: input.id, userId: context.user.id });
		}),

	// ========================================
	// Self-Assessment Data
	// ========================================

	getAssessmentData: protectedProcedure
		.route({
			method: "GET",
			path: "/review-prep/assessment-data",
			tags: ["ReviewPrep"],
			summary: "Get persisted self-assessment responses",
		})
		.input(z.object({}).optional().default({}))
		.handler(async ({ context }) => {
			const data = await reviewPrepDataService.get(context.user.id, "assessment");
			return data as { responses: Record<string, string> } | null;
		}),

	saveAssessmentData: protectedProcedure
		.route({
			method: "POST",
			path: "/review-prep/assessment-data",
			tags: ["ReviewPrep"],
			summary: "Save self-assessment responses",
		})
		.input(
			z.object({
				responses: z.record(z.string(), z.string()),
			}),
		)
		.handler(async ({ input, context }) => {
			await reviewPrepDataService.upsert(context.user.id, "assessment", { responses: input.responses });
			return { success: true };
		}),

	// ========================================
	// Timeline Progress Data
	// ========================================

	getTimelineData: protectedProcedure
		.route({
			method: "GET",
			path: "/review-prep/timeline-data",
			tags: ["ReviewPrep"],
			summary: "Get persisted timeline progress",
		})
		.input(z.object({}).optional().default({}))
		.handler(async ({ context }) => {
			const data = await reviewPrepDataService.get(context.user.id, "timeline");
			return data as { progress: Record<string, boolean[]> } | null;
		}),

	saveTimelineData: protectedProcedure
		.route({
			method: "POST",
			path: "/review-prep/timeline-data",
			tags: ["ReviewPrep"],
			summary: "Save timeline progress",
		})
		.input(
			z.object({
				progress: z.record(z.string(), z.array(z.boolean())),
			}),
		)
		.handler(async ({ input, context }) => {
			await reviewPrepDataService.upsert(context.user.id, "timeline", { progress: input.progress });
			return { success: true };
		}),

	// ========================================
	// Salary Expectation Data
	// ========================================

	getSalaryExpectation: protectedProcedure
		.route({
			method: "GET",
			path: "/review-prep/salary-expectation",
			tags: ["ReviewPrep"],
			summary: "Get persisted salary expectation",
		})
		.input(z.object({}).optional().default({}))
		.handler(async ({ context }) => {
			const data = await reviewPrepDataService.get(context.user.id, "salary_expectation");
			return data as { value: number[] } | null;
		}),

	saveSalaryExpectation: protectedProcedure
		.route({
			method: "POST",
			path: "/review-prep/salary-expectation",
			tags: ["ReviewPrep"],
			summary: "Save salary expectation",
		})
		.input(
			z.object({
				value: z.array(z.number()),
			}),
		)
		.handler(async ({ input, context }) => {
			await reviewPrepDataService.upsert(context.user.id, "salary_expectation", { value: input.value });
			return { success: true };
		}),
};
