import z from "zod";
import type {
	FeedbackCategory,
	FeedbackPriority,
	FeedbackType,
	InterviewGoalStatus,
	PatternType,
} from "@/integrations/drizzle/schema";
import { protectedProcedure } from "../context";
import { interviewFeedbackService } from "../services/interview-feedback";

// ============================================
// SCHEMAS
// ============================================

const feedbackCategorySchema = z.enum([
	"technical",
	"behavioral",
	"communication",
	"problem_solving",
	"leadership",
	"cultural_fit",
]);

const feedbackTypeSchema = z.enum(["strength", "improvement"]);

const feedbackPrioritySchema = z.enum(["high", "medium", "low"]);

const goalStatusSchema = z.enum(["not_started", "in_progress", "completed"]);

const patternTypeSchema = z.enum(["recurring_strength", "recurring_weakness", "improvement_trend", "decline_trend"]);

const milestoneSchema = z.object({
	title: z.string(),
	completed: z.boolean(),
});

const feedbackItemSchema = z.object({
	id: z.string().uuid(),
	userId: z.string(),
	sessionId: z.string().nullable(),
	sessionTitle: z.string().nullable(),
	date: z.string(),
	category: feedbackCategorySchema,
	type: feedbackTypeSchema,
	content: z.string(),
	source: z.string(),
	actionItems: z.array(z.string()),
	isResolved: z.boolean(),
	priority: feedbackPrioritySchema,
	tags: z.array(z.string()),
	notes: z.string().nullable(),
	createdAt: z.coerce.date(),
	updatedAt: z.coerce.date(),
});

const goalSchema = z.object({
	id: z.string().uuid(),
	userId: z.string(),
	title: z.string(),
	description: z.string(),
	category: feedbackCategorySchema,
	targetDate: z.string(),
	progress: z.number(),
	status: goalStatusSchema,
	relatedFeedbackIds: z.array(z.string()),
	milestones: z.array(milestoneSchema),
	createdAt: z.coerce.date(),
	updatedAt: z.coerce.date(),
});

const trendDataSchema = z.object({
	id: z.string().uuid(),
	userId: z.string(),
	date: z.string(),
	technical: z.number(),
	behavioral: z.number(),
	communication: z.number(),
	problemSolving: z.number(),
	leadership: z.number(),
	culturalFit: z.number(),
	overall: z.number(),
	createdAt: z.coerce.date(),
});

const patternSchema = z.object({
	id: z.string().uuid(),
	userId: z.string(),
	type: patternTypeSchema,
	category: feedbackCategorySchema,
	description: z.string(),
	frequency: z.number(),
	confidence: z.number(),
	recommendations: z.array(z.string()),
	relatedFeedbackIds: z.array(z.string()),
	createdAt: z.coerce.date(),
	updatedAt: z.coerce.date(),
});

// ============================================
// FEEDBACK ROUTER
// ============================================

const feedbackRouter = {
	create: protectedProcedure
		.route({
			method: "POST",
			path: "/interview-feedback/feedback",
			tags: ["Interview Feedback"],
			summary: "Create new feedback item",
		})
		.input(
			z.object({
				sessionId: z.string().optional(),
				sessionTitle: z.string().optional(),
				date: z.string(),
				category: feedbackCategorySchema,
				type: feedbackTypeSchema,
				content: z.string().min(1),
				source: z.string().min(1),
				actionItems: z.array(z.string()).optional(),
				priority: feedbackPrioritySchema.optional(),
				tags: z.array(z.string()).optional(),
				notes: z.string().optional(),
			}),
		)
		.output(feedbackItemSchema)
		.handler(async ({ context, input }) => {
			return await interviewFeedbackService.feedback.create({
				userId: context.user.id,
				...input,
				category: input.category as FeedbackCategory,
				type: input.type as FeedbackType,
				priority: input.priority as FeedbackPriority | undefined,
			});
		}),

	getById: protectedProcedure
		.route({
			method: "GET",
			path: "/interview-feedback/feedback/{id}",
			tags: ["Interview Feedback"],
			summary: "Get feedback by ID",
		})
		.input(z.object({ id: z.string().uuid() }))
		.output(feedbackItemSchema)
		.handler(async ({ context, input }) => {
			return await interviewFeedbackService.feedback.getById({
				id: input.id,
				userId: context.user.id,
			});
		}),

	list: protectedProcedure
		.route({
			method: "GET",
			path: "/interview-feedback/feedback",
			tags: ["Interview Feedback"],
			summary: "List feedback items",
		})
		.input(
			z
				.object({
					category: feedbackCategorySchema.optional(),
					type: feedbackTypeSchema.optional(),
					isResolved: z.boolean().optional(),
					search: z.string().optional(),
					limit: z.number().optional(),
					offset: z.number().optional(),
				})
				.optional()
				.default({}),
		)
		.output(
			z.object({
				items: z.array(feedbackItemSchema),
				total: z.number(),
			}),
		)
		.handler(async ({ context, input }) => {
			return await interviewFeedbackService.feedback.list({
				userId: context.user.id,
				category: input.category as FeedbackCategory | undefined,
				type: input.type as FeedbackType | undefined,
				isResolved: input.isResolved,
				search: input.search,
				limit: input.limit,
				offset: input.offset,
			});
		}),

	update: protectedProcedure
		.route({
			method: "PUT",
			path: "/interview-feedback/feedback/{id}",
			tags: ["Interview Feedback"],
			summary: "Update feedback item",
		})
		.input(
			z.object({
				id: z.string().uuid(),
				sessionId: z.string().optional(),
				sessionTitle: z.string().optional(),
				date: z.string().optional(),
				category: feedbackCategorySchema.optional(),
				type: feedbackTypeSchema.optional(),
				content: z.string().optional(),
				source: z.string().optional(),
				actionItems: z.array(z.string()).optional(),
				isResolved: z.boolean().optional(),
				priority: feedbackPrioritySchema.optional(),
				tags: z.array(z.string()).optional(),
				notes: z.string().optional(),
			}),
		)
		.output(feedbackItemSchema)
		.handler(async ({ context, input }) => {
			return await interviewFeedbackService.feedback.update({
				...input,
				userId: context.user.id,
				category: input.category as FeedbackCategory | undefined,
				type: input.type as FeedbackType | undefined,
				priority: input.priority as FeedbackPriority | undefined,
			});
		}),

	toggleResolved: protectedProcedure
		.route({
			method: "POST",
			path: "/interview-feedback/feedback/{id}/toggle-resolved",
			tags: ["Interview Feedback"],
			summary: "Toggle feedback resolved status",
		})
		.input(z.object({ id: z.string().uuid() }))
		.output(z.boolean())
		.handler(async ({ context, input }) => {
			return await interviewFeedbackService.feedback.toggleResolved({
				id: input.id,
				userId: context.user.id,
			});
		}),

	delete: protectedProcedure
		.route({
			method: "DELETE",
			path: "/interview-feedback/feedback/{id}",
			tags: ["Interview Feedback"],
			summary: "Delete feedback item",
		})
		.input(z.object({ id: z.string().uuid() }))
		.output(z.void())
		.handler(async ({ context, input }) => {
			return await interviewFeedbackService.feedback.delete({
				id: input.id,
				userId: context.user.id,
			});
		}),

	getStatistics: protectedProcedure
		.route({
			method: "GET",
			path: "/interview-feedback/feedback/statistics",
			tags: ["Interview Feedback"],
			summary: "Get feedback statistics",
		})
		.output(
			z.object({
				total: z.number(),
				strengths: z.number(),
				improvements: z.number(),
				unresolvedCount: z.number(),
				highPriority: z.number(),
				categoryBreakdown: z.record(feedbackCategorySchema, z.number()),
			}),
		)
		.handler(async ({ context }) => {
			return await interviewFeedbackService.feedback.getStatistics({
				userId: context.user.id,
			});
		}),
};

// ============================================
// GOALS ROUTER
// ============================================

const goalsRouter = {
	create: protectedProcedure
		.route({
			method: "POST",
			path: "/interview-feedback/goals",
			tags: ["Interview Feedback"],
			summary: "Create new goal",
		})
		.input(
			z.object({
				title: z.string().min(1),
				description: z.string().min(1),
				category: feedbackCategorySchema,
				targetDate: z.string(),
				relatedFeedbackIds: z.array(z.string()).optional(),
				milestones: z.array(milestoneSchema).optional(),
			}),
		)
		.output(goalSchema)
		.handler(async ({ context, input }) => {
			return await interviewFeedbackService.goals.create({
				userId: context.user.id,
				...input,
				category: input.category as FeedbackCategory,
			});
		}),

	getById: protectedProcedure
		.route({
			method: "GET",
			path: "/interview-feedback/goals/{id}",
			tags: ["Interview Feedback"],
			summary: "Get goal by ID",
		})
		.input(z.object({ id: z.string().uuid() }))
		.output(goalSchema)
		.handler(async ({ context, input }) => {
			return await interviewFeedbackService.goals.getById({
				id: input.id,
				userId: context.user.id,
			});
		}),

	list: protectedProcedure
		.route({
			method: "GET",
			path: "/interview-feedback/goals",
			tags: ["Interview Feedback"],
			summary: "List goals",
		})
		.input(
			z
				.object({
					status: goalStatusSchema.optional(),
					category: feedbackCategorySchema.optional(),
					limit: z.number().optional(),
				})
				.optional()
				.default({}),
		)
		.output(z.array(goalSchema))
		.handler(async ({ context, input }) => {
			return await interviewFeedbackService.goals.list({
				userId: context.user.id,
				status: input.status as InterviewGoalStatus | undefined,
				category: input.category as FeedbackCategory | undefined,
				limit: input.limit,
			});
		}),

	update: protectedProcedure
		.route({
			method: "PUT",
			path: "/interview-feedback/goals/{id}",
			tags: ["Interview Feedback"],
			summary: "Update goal",
		})
		.input(
			z.object({
				id: z.string().uuid(),
				title: z.string().optional(),
				description: z.string().optional(),
				category: feedbackCategorySchema.optional(),
				targetDate: z.string().optional(),
				progress: z.number().optional(),
				status: goalStatusSchema.optional(),
				relatedFeedbackIds: z.array(z.string()).optional(),
				milestones: z.array(milestoneSchema).optional(),
			}),
		)
		.output(goalSchema)
		.handler(async ({ context, input }) => {
			return await interviewFeedbackService.goals.update({
				...input,
				userId: context.user.id,
				category: input.category as FeedbackCategory | undefined,
				status: input.status as InterviewGoalStatus | undefined,
			});
		}),

	toggleMilestone: protectedProcedure
		.route({
			method: "POST",
			path: "/interview-feedback/goals/{goalId}/milestones/{milestoneIndex}/toggle",
			tags: ["Interview Feedback"],
			summary: "Toggle milestone completion",
		})
		.input(
			z.object({
				goalId: z.string(),
				milestoneIndex: z.number(),
			}),
		)
		.output(goalSchema)
		.handler(async ({ context, input }) => {
			return await interviewFeedbackService.goals.toggleMilestone({
				goalId: input.goalId,
				userId: context.user.id,
				milestoneIndex: input.milestoneIndex,
			});
		}),

	delete: protectedProcedure
		.route({
			method: "DELETE",
			path: "/interview-feedback/goals/{id}",
			tags: ["Interview Feedback"],
			summary: "Delete goal",
		})
		.input(z.object({ id: z.string().uuid() }))
		.output(z.void())
		.handler(async ({ context, input }) => {
			return await interviewFeedbackService.goals.delete({
				id: input.id,
				userId: context.user.id,
			});
		}),

	getStatistics: protectedProcedure
		.route({
			method: "GET",
			path: "/interview-feedback/goals/statistics",
			tags: ["Interview Feedback"],
			summary: "Get goals statistics",
		})
		.output(
			z.object({
				total: z.number(),
				inProgress: z.number(),
				completed: z.number(),
				notStarted: z.number(),
				overdue: z.number(),
			}),
		)
		.handler(async ({ context }) => {
			return await interviewFeedbackService.goals.getStatistics({
				userId: context.user.id,
			});
		}),
};

// ============================================
// TRENDS ROUTER
// ============================================

const trendsRouter = {
	list: protectedProcedure
		.route({
			method: "GET",
			path: "/interview-feedback/trends",
			tags: ["Interview Feedback"],
			summary: "Get trend data",
		})
		.input(
			z
				.object({
					startDate: z.string().optional(),
					endDate: z.string().optional(),
					limit: z.number().optional(),
				})
				.optional()
				.default({}),
		)
		.output(z.array(trendDataSchema))
		.handler(async ({ context, input }) => {
			return await interviewFeedbackService.trends.list({
				userId: context.user.id,
				startDate: input.startDate,
				endDate: input.endDate,
				limit: input.limit,
			});
		}),

	getLatest: protectedProcedure
		.route({
			method: "GET",
			path: "/interview-feedback/trends/latest",
			tags: ["Interview Feedback"],
			summary: "Get latest trend data",
		})
		.output(trendDataSchema.nullable())
		.handler(async ({ context }) => {
			return await interviewFeedbackService.trends.getLatest({
				userId: context.user.id,
			});
		}),

	calculate: protectedProcedure
		.route({
			method: "POST",
			path: "/interview-feedback/trends/calculate",
			tags: ["Interview Feedback"],
			summary: "Calculate and store current trend",
		})
		.output(trendDataSchema)
		.handler(async ({ context }) => {
			return await interviewFeedbackService.trends.calculateAndStore({
				userId: context.user.id,
			});
		}),
};

// ============================================
// PATTERNS ROUTER
// ============================================

const patternsRouter = {
	list: protectedProcedure
		.route({
			method: "GET",
			path: "/interview-feedback/patterns",
			tags: ["Interview Feedback"],
			summary: "List patterns",
		})
		.input(
			z
				.object({
					type: patternTypeSchema.optional(),
					category: feedbackCategorySchema.optional(),
				})
				.optional()
				.default({}),
		)
		.output(z.array(patternSchema))
		.handler(async ({ context, input }) => {
			return await interviewFeedbackService.patterns.list({
				userId: context.user.id,
				type: input.type as PatternType | undefined,
				category: input.category as FeedbackCategory | undefined,
			});
		}),

	analyze: protectedProcedure
		.route({
			method: "POST",
			path: "/interview-feedback/patterns/analyze",
			tags: ["Interview Feedback"],
			summary: "Analyze feedback and detect patterns",
		})
		.output(z.array(patternSchema))
		.handler(async ({ context }) => {
			return await interviewFeedbackService.patterns.analyze({
				userId: context.user.id,
			});
		}),

	delete: protectedProcedure
		.route({
			method: "DELETE",
			path: "/interview-feedback/patterns/{id}",
			tags: ["Interview Feedback"],
			summary: "Delete pattern",
		})
		.input(z.object({ id: z.string().uuid() }))
		.output(z.void())
		.handler(async ({ context, input }) => {
			return await interviewFeedbackService.patterns.delete({
				id: input.id,
				userId: context.user.id,
			});
		}),
};

// ============================================
// EXPORT ROUTER
// ============================================

const exportRouter = protectedProcedure
	.route({
		method: "GET",
		path: "/interview-feedback/export",
		tags: ["Interview Feedback"],
		summary: "Export all interview feedback data",
	})
	.output(
		z.object({
			exportDate: z.string(),
			feedback: z.array(z.any()),
			goals: z.array(z.any()),
			patterns: z.array(z.any()),
			trends: z.array(z.any()),
			summary: z.object({
				totalFeedback: z.number(),
				strengths: z.number(),
				improvements: z.number(),
				activeGoals: z.number(),
				overallProgress: z.number(),
			}),
		}),
	)
	.handler(async ({ context }) => {
		return await interviewFeedbackService.export({
			userId: context.user.id,
		});
	});

// ============================================
// MAIN ROUTER
// ============================================

export const interviewFeedbackRouter = {
	feedback: feedbackRouter,
	goals: goalsRouter,
	trends: trendsRouter,
	patterns: patternsRouter,
	export: exportRouter,
};
