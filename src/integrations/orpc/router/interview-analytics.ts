import { ORPCError } from "@orpc/server";
import z from "zod";
import { aiRateLimitedProcedure, protectedProcedure } from "../context";
import { interviewAnalyticsService } from "../services/interview-analytics";

// Zod schemas for inputs
const weaknessTypeSchema = z.enum([
	"communication",
	"technical",
	"behavioral",
	"confidence",
	"structure",
	"time_management",
	"stress_handling",
	"knowledge_gap",
]);

const weaknessSeveritySchema = z.enum(["critical", "major", "minor"]);

const interviewFieldSchema = z.enum(["healthcare", "industrial", "hse", "technology", "management", "general"]);

const templateIndustrySchema = z.enum([
	"healthcare",
	"industrial",
	"hse",
	"general",
	"technology",
	"finance",
	"retail",
	"hospitality",
]);

const templateDifficultySchema = z.enum(["entry_level", "mid_level", "senior_level"]);

export const interviewAnalyticsRouter = {
	/**
	 * Deep AI analysis of interview performance for a session
	 */
	analyzePerformance: aiRateLimitedProcedure
		.input(
			z.object({
				sessionId: z.string(),
			}),
		)
		.handler(async ({ input, context }) => {
			try {
				const result = await interviewAnalyticsService.analyzePerformance(input.sessionId, context.user.id);
				return result;
			} catch (error) {
				if (error instanceof Error && error.message === "Session not found") {
					throw new ORPCError("NOT_FOUND", { message: "Session not found" });
				}
				throw error;
			}
		}),

	/**
	 * Identify common patterns and mistakes across sessions
	 */
	identifyPatterns: protectedProcedure.handler(async ({ context }) => {
		const result = await interviewAnalyticsService.identifyPatterns(context.user.id);
		return result;
	}),

	/**
	 * Generate personalized improvement plan
	 */
	generateImprovementPlan: aiRateLimitedProcedure.handler(async ({ context }) => {
		const result = await interviewAnalyticsService.generateImprovementPlan(context.user.id);
		return result;
	}),

	/**
	 * Track score improvements over time
	 */
	trackImprovement: protectedProcedure
		.input(
			z.object({
				period: z.enum(["weekly", "monthly", "all_time"]).default("monthly"),
			}),
		)
		.handler(async ({ input, context }) => {
			const result = await interviewAnalyticsService.trackImprovement(context.user.id, input.period);
			return result;
		}),

	/**
	 * Benchmark against successful candidates
	 */
	compareToSuccessful: protectedProcedure.handler(async ({ context }) => {
		const result = await interviewAnalyticsService.compareToSuccessful(context.user.id);
		return result;
	}),

	/**
	 * Predict interview success probability
	 */
	predictInterviewSuccess: aiRateLimitedProcedure
		.input(
			z.object({
				jobType: z.string().optional().default("general"),
			}),
		)
		.handler(async ({ input, context }) => {
			const result = await interviewAnalyticsService.predictInterviewSuccess(context.user.id, input.jobType);
			return result;
		}),

	/**
	 * Record a weakness identified during interview
	 */
	recordWeakness: protectedProcedure
		.input(
			z.object({
				sessionId: z.string().optional(),
				weaknessType: weaknessTypeSchema,
				severity: weaknessSeveritySchema.default("minor"),
				field: interviewFieldSchema.optional(),
				title: z.string().min(1).max(200),
				titleFr: z.string().optional(),
				description: z.string().min(1).max(1000),
				descriptionFr: z.string().optional(),
				exampleQuestions: z.array(z.string()).optional(),
				suggestedResources: z
					.array(
						z.object({
							title: z.string(),
							url: z.string().optional(),
							type: z.string(),
						}),
					)
					.optional(),
				practiceExercises: z.array(z.string()).optional(),
			}),
		)
		.handler(async ({ input, context }) => {
			const result = await interviewAnalyticsService.recordWeakness({
				userId: context.user.id,
				...input,
			});
			return result;
		}),

	/**
	 * Mark a weakness as resolved
	 */
	resolveWeakness: protectedProcedure
		.input(
			z.object({
				weaknessId: z.string(),
			}),
		)
		.handler(async ({ input, context }) => {
			const result = await interviewAnalyticsService.resolveWeakness(input.weaknessId, context.user.id);
			if (!result) {
				throw new ORPCError("NOT_FOUND", { message: "Weakness not found" });
			}
			return result;
		}),

	/**
	 * Record an improvement in skill area
	 */
	recordImprovement: protectedProcedure
		.input(
			z.object({
				weaknessId: z.string().optional(),
				field: interviewFieldSchema.optional(),
				skillArea: z.string().min(1).max(100),
				skillAreaFr: z.string().optional(),
				previousScore: z.number().min(0).max(100),
				currentScore: z.number().min(0).max(100),
				sessionsCompleted: z.number().min(0).default(0),
				notes: z.string().optional(),
				milestonesAchieved: z.array(z.string()).optional(),
			}),
		)
		.handler(async ({ input, context }) => {
			const result = await interviewAnalyticsService.recordImprovement({
				userId: context.user.id,
				...input,
			});
			return result;
		}),

	/**
	 * Get user's weaknesses
	 */
	getWeaknesses: protectedProcedure
		.input(
			z.object({
				includeResolved: z.boolean().default(false),
			}),
		)
		.handler(async ({ input, context }) => {
			const result = await interviewAnalyticsService.getWeaknesses(context.user.id, input.includeResolved);
			return result;
		}),

	/**
	 * Get improvements history
	 */
	getImprovements: protectedProcedure
		.input(
			z.object({
				limit: z.number().min(1).max(100).default(20),
			}),
		)
		.handler(async ({ input, context }) => {
			const result = await interviewAnalyticsService.getImprovements(context.user.id, input.limit);
			return result;
		}),

	/**
	 * Get mock interview templates
	 */
	getTemplates: protectedProcedure
		.input(
			z.object({
				industry: templateIndustrySchema.optional(),
				difficulty: templateDifficultySchema.optional(),
			}),
		)
		.handler(async ({ input }) => {
			const result = await interviewAnalyticsService.getTemplates(input.industry, input.difficulty);
			return result;
		}),

	/**
	 * Record template usage
	 */
	recordTemplateUsage: protectedProcedure
		.input(
			z.object({
				templateId: z.string(),
				sessionId: z.string().optional(),
				score: z.number().min(0).max(100).optional(),
				feedback: z.string().optional(),
			}),
		)
		.handler(async ({ input, context }) => {
			const result = await interviewAnalyticsService.recordTemplateUsage({
				userId: context.user.id,
				...input,
			});
			return result;
		}),

	/**
	 * Get adaptive difficulty based on user's performance
	 */
	getAdaptiveDifficulty: protectedProcedure
		.input(
			z.object({
				field: interviewFieldSchema,
			}),
		)
		.handler(async ({ input, context }) => {
			const result = await interviewAnalyticsService.getAdaptiveDifficulty(context.user.id, input.field);
			return { difficulty: result };
		}),

	/**
	 * Get comprehensive analytics dashboard data
	 */
	getDashboard: protectedProcedure.handler(async ({ context }) => {
		// Fetch all analytics data in parallel
		const [patterns, improvements, weaknesses, benchmark, readiness] = await Promise.all([
			interviewAnalyticsService.identifyPatterns(context.user.id),
			interviewAnalyticsService.trackImprovement(context.user.id, "monthly"),
			interviewAnalyticsService.getWeaknesses(context.user.id, false),
			interviewAnalyticsService.compareToSuccessful(context.user.id),
			interviewAnalyticsService.predictInterviewSuccess(context.user.id, "general"),
		]);

		return {
			patterns,
			improvements,
			weaknesses,
			benchmark,
			readiness,
			summary: {
				totalWeaknesses: weaknesses.length,
				criticalWeaknesses: weaknesses.filter((w) => w.severity === "critical").length,
				improvementAreas: improvements.filter((i) => i.trend === "improving").length,
				overallReadiness: readiness.overallReadiness,
				readinessLevel: readiness.readinessLevel,
				percentile: benchmark.percentile,
			},
		};
	}),
};
