import z from "zod";
import { protectedProcedure } from "../context";
import { interviewTrackingService } from "../services/interview-tracking";

// ============================================
// SCHEMAS
// ============================================

const goalStatusSchema = z.enum(["not_started", "preparing", "practicing", "ready", "completed"]);
const goalOutcomeSchema = z.enum(["offered", "rejected", "pending", "withdrawn"]);

const performanceSchema = z.object({
	id: z.string(),
	userId: z.string(),
	sessionId: z.string().nullable(),
	overallScore: z.number().nullable(),
	confidenceScore: z.number().nullable(),
	clarityScore: z.number().nullable(),
	relevanceScore: z.number().nullable(),
	technicalScore: z.number().nullable(),
	communicationScore: z.number().nullable(),
	strengths: z.array(z.string()).nullable(),
	improvements: z.array(z.string()).nullable(),
	aiAnalysis: z.string().nullable(),
	createdAt: z.coerce.date(),
});

const goalSchema = z.object({
	id: z.string(),
	userId: z.string(),
	targetRole: z.string().nullable(),
	targetCompany: z.string().nullable(),
	interviewDate: z.coerce.date().nullable(),
	preparationStatus: z.string().nullable(),
	practiceCount: z.number().nullable(),
	targetPracticeCount: z.number().nullable(),
	notes: z.string().nullable(),
	completed: z.boolean().nullable(),
	outcome: z.string().nullable(),
	createdAt: z.coerce.date(),
	updatedAt: z.coerce.date(),
});

const trendSchema = z.object({
	date: z.string(),
	overallScore: z.number(),
	confidenceScore: z.number(),
	clarityScore: z.number(),
	relevanceScore: z.number(),
	technicalScore: z.number(),
	communicationScore: z.number(),
});

const scoreBreakdownSchema = z.object({
	confidence: z.number(),
	clarity: z.number(),
	relevance: z.number(),
	technical: z.number(),
	communication: z.number(),
});

const performanceStatsSchema = z.object({
	totalSessions: z.number(),
	averageScore: z.number(),
	scoreImprovement: z.number(),
	bestCategory: z.string(),
	worstCategory: z.string(),
	recentTrend: z.enum(["improving", "stable", "declining"]),
	practiceStreak: z.number(),
});

const goalStatsSchema = z.object({
	totalGoals: z.number(),
	completedGoals: z.number(),
	activeGoals: z.number(),
	upcomingInterviews: z.number(),
	averagePracticeCount: z.number(),
	successRate: z.number(),
});

const strengthImprovementItemSchema = z.object({
	text: z.string(),
	count: z.number(),
});

const summarySchema = z.object({
	statistics: performanceStatsSchema,
	scoreBreakdown: scoreBreakdownSchema,
	strengths: z.array(strengthImprovementItemSchema),
	improvements: z.array(strengthImprovementItemSchema),
	trends: z.array(trendSchema),
	goalStatistics: goalStatsSchema,
	recommendations: z.array(z.string()),
});

// ============================================
// PERFORMANCE ROUTER
// ============================================

const performanceRouter = {
	create: protectedProcedure
		.route({
			method: "POST",
			path: "/interview-tracking/performance",
			tags: ["Interview Tracking"],
			summary: "Create a performance record",
		})
		.input(
			z.object({
				sessionId: z.string().optional(),
				overallScore: z.number().min(0).max(100).optional(),
				confidenceScore: z.number().min(0).max(100).optional(),
				clarityScore: z.number().min(0).max(100).optional(),
				relevanceScore: z.number().min(0).max(100).optional(),
				technicalScore: z.number().min(0).max(100).optional(),
				communicationScore: z.number().min(0).max(100).optional(),
				strengths: z.array(z.string()).optional(),
				improvements: z.array(z.string()).optional(),
				aiAnalysis: z.string().optional(),
			}),
		)
		.output(z.string())
		.handler(async ({ context, input }) => {
			return await interviewTrackingService.performance.create({
				...input,
				userId: context.user.id,
			});
		}),

	getById: protectedProcedure
		.route({
			method: "GET",
			path: "/interview-tracking/performance/{id}",
			tags: ["Interview Tracking"],
			summary: "Get performance by ID",
		})
		.input(z.object({ id: z.string().uuid() }))
		.output(performanceSchema)
		.handler(async ({ context, input }) => {
			return await interviewTrackingService.performance.getById({
				id: input.id,
				userId: context.user.id,
			});
		}),

	list: protectedProcedure
		.route({
			method: "GET",
			path: "/interview-tracking/performance",
			tags: ["Interview Tracking"],
			summary: "List performance records",
		})
		.input(
			z
				.object({
					limit: z.number().optional(),
					fromDate: z.coerce.date().optional(),
					toDate: z.coerce.date().optional(),
				})
				.optional()
				.default({}),
		)
		.output(z.array(performanceSchema))
		.handler(async ({ context, input }) => {
			return await interviewTrackingService.performance.list({
				userId: context.user.id,
				...input,
			});
		}),

	update: protectedProcedure
		.route({
			method: "PUT",
			path: "/interview-tracking/performance/{id}",
			tags: ["Interview Tracking"],
			summary: "Update performance record",
		})
		.input(
			z.object({
				id: z.string().uuid(),
				overallScore: z.number().min(0).max(100).optional(),
				confidenceScore: z.number().min(0).max(100).optional(),
				clarityScore: z.number().min(0).max(100).optional(),
				relevanceScore: z.number().min(0).max(100).optional(),
				technicalScore: z.number().min(0).max(100).optional(),
				communicationScore: z.number().min(0).max(100).optional(),
				strengths: z.array(z.string()).optional(),
				improvements: z.array(z.string()).optional(),
				aiAnalysis: z.string().optional(),
			}),
		)
		.output(z.void())
		.handler(async ({ context, input }) => {
			return await interviewTrackingService.performance.update({
				...input,
				userId: context.user.id,
			});
		}),

	delete: protectedProcedure
		.route({
			method: "DELETE",
			path: "/interview-tracking/performance/{id}",
			tags: ["Interview Tracking"],
			summary: "Delete performance record",
		})
		.input(z.object({ id: z.string().uuid() }))
		.output(z.void())
		.handler(async ({ context, input }) => {
			return await interviewTrackingService.performance.delete({
				id: input.id,
				userId: context.user.id,
			});
		}),

	getTrends: protectedProcedure
		.route({
			method: "GET",
			path: "/interview-tracking/performance/trends",
			tags: ["Interview Tracking"],
			summary: "Get performance trends",
		})
		.input(z.object({ days: z.number().optional() }).optional().default({}))
		.output(z.array(trendSchema))
		.handler(async ({ context, input }) => {
			return await interviewTrackingService.performance.getTrends({
				userId: context.user.id,
				days: input.days,
			});
		}),

	getScoreBreakdown: protectedProcedure
		.route({
			method: "GET",
			path: "/interview-tracking/performance/breakdown",
			tags: ["Interview Tracking"],
			summary: "Get score breakdown",
		})
		.output(scoreBreakdownSchema)
		.handler(async ({ context }) => {
			return await interviewTrackingService.performance.getScoreBreakdown({
				userId: context.user.id,
			});
		}),

	getStrengthsAndImprovements: protectedProcedure
		.route({
			method: "GET",
			path: "/interview-tracking/performance/strengths-improvements",
			tags: ["Interview Tracking"],
			summary: "Get aggregated strengths and improvements",
		})
		.output(
			z.object({
				strengths: z.array(strengthImprovementItemSchema),
				improvements: z.array(strengthImprovementItemSchema),
			}),
		)
		.handler(async ({ context }) => {
			return await interviewTrackingService.performance.getStrengthsAndImprovements({
				userId: context.user.id,
			});
		}),

	getStatistics: protectedProcedure
		.route({
			method: "GET",
			path: "/interview-tracking/performance/statistics",
			tags: ["Interview Tracking"],
			summary: "Get performance statistics",
		})
		.output(performanceStatsSchema)
		.handler(async ({ context }) => {
			return await interviewTrackingService.performance.getStatistics({
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
			path: "/interview-tracking/goals",
			tags: ["Interview Tracking"],
			summary: "Create a goal",
		})
		.input(
			z.object({
				targetRole: z.string().optional(),
				targetCompany: z.string().optional(),
				interviewDate: z.coerce.date().optional(),
				targetPracticeCount: z.number().optional(),
				notes: z.string().optional(),
			}),
		)
		.output(z.string())
		.handler(async ({ context, input }) => {
			return await interviewTrackingService.goals.create({
				...input,
				userId: context.user.id,
			});
		}),

	getById: protectedProcedure
		.route({
			method: "GET",
			path: "/interview-tracking/goals/{id}",
			tags: ["Interview Tracking"],
			summary: "Get goal by ID",
		})
		.input(z.object({ id: z.string().uuid() }))
		.output(goalSchema)
		.handler(async ({ context, input }) => {
			return await interviewTrackingService.goals.getById({
				id: input.id,
				userId: context.user.id,
			});
		}),

	list: protectedProcedure
		.route({
			method: "GET",
			path: "/interview-tracking/goals",
			tags: ["Interview Tracking"],
			summary: "List goals",
		})
		.input(
			z
				.object({
					completed: z.boolean().optional(),
					limit: z.number().optional(),
				})
				.optional()
				.default({}),
		)
		.output(z.array(goalSchema))
		.handler(async ({ context, input }) => {
			return await interviewTrackingService.goals.list({
				userId: context.user.id,
				...input,
			});
		}),

	update: protectedProcedure
		.route({
			method: "PUT",
			path: "/interview-tracking/goals/{id}",
			tags: ["Interview Tracking"],
			summary: "Update goal",
		})
		.input(
			z.object({
				id: z.string().uuid(),
				targetRole: z.string().optional(),
				targetCompany: z.string().optional(),
				interviewDate: z.coerce.date().optional(),
				preparationStatus: goalStatusSchema.optional(),
				practiceCount: z.number().optional(),
				targetPracticeCount: z.number().optional(),
				notes: z.string().optional(),
				completed: z.boolean().optional(),
				outcome: goalOutcomeSchema.optional(),
			}),
		)
		.output(z.void())
		.handler(async ({ context, input }) => {
			return await interviewTrackingService.goals.update({
				...input,
				userId: context.user.id,
			});
		}),

	delete: protectedProcedure
		.route({
			method: "DELETE",
			path: "/interview-tracking/goals/{id}",
			tags: ["Interview Tracking"],
			summary: "Delete goal",
		})
		.input(z.object({ id: z.string().uuid() }))
		.output(z.void())
		.handler(async ({ context, input }) => {
			return await interviewTrackingService.goals.delete({
				id: input.id,
				userId: context.user.id,
			});
		}),

	incrementPractice: protectedProcedure
		.route({
			method: "POST",
			path: "/interview-tracking/goals/{id}/practice",
			tags: ["Interview Tracking"],
			summary: "Increment practice count",
		})
		.input(z.object({ id: z.string().uuid() }))
		.output(z.number())
		.handler(async ({ context, input }) => {
			return await interviewTrackingService.goals.incrementPractice({
				id: input.id,
				userId: context.user.id,
			});
		}),

	getStatistics: protectedProcedure
		.route({
			method: "GET",
			path: "/interview-tracking/goals/statistics",
			tags: ["Interview Tracking"],
			summary: "Get goal statistics",
		})
		.output(goalStatsSchema)
		.handler(async ({ context }) => {
			return await interviewTrackingService.goals.getStatistics({
				userId: context.user.id,
			});
		}),

	getUpcoming: protectedProcedure
		.route({
			method: "GET",
			path: "/interview-tracking/goals/upcoming",
			tags: ["Interview Tracking"],
			summary: "Get upcoming interviews",
		})
		.input(z.object({ days: z.number().optional() }).optional().default({}))
		.output(z.array(goalSchema))
		.handler(async ({ context, input }) => {
			return await interviewTrackingService.goals.getUpcoming({
				userId: context.user.id,
				days: input.days,
			});
		}),
};

// ============================================
// AI ANALYSIS ROUTER
// ============================================

const aiAnalysisRouter = {
	getTips: protectedProcedure
		.route({
			method: "GET",
			path: "/interview-tracking/ai/tips",
			tags: ["Interview Tracking"],
			summary: "Get AI-powered tips",
		})
		.output(z.array(z.string()))
		.handler(async ({ context }) => {
			return await interviewTrackingService.aiAnalysis.generateTips({
				userId: context.user.id,
			});
		}),

	getSummary: protectedProcedure
		.route({
			method: "GET",
			path: "/interview-tracking/ai/summary",
			tags: ["Interview Tracking"],
			summary: "Get comprehensive performance summary",
		})
		.output(summarySchema)
		.handler(async ({ context }) => {
			return await interviewTrackingService.aiAnalysis.getPerformanceSummary({
				userId: context.user.id,
			});
		}),
};

// ============================================
// EXPORT
// ============================================

export const interviewTrackingRouter = {
	performance: performanceRouter,
	goals: goalsRouter,
	ai: aiAnalysisRouter,
};
