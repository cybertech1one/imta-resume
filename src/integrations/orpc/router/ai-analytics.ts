import z from "zod";
import { adminProcedure, protectedProcedure } from "../context";
import { aiAnalyticsService } from "../services/ai-analytics";

// Common date range schema
const dateRangeSchema = z.object({
	startDate: z.string().optional(),
	endDate: z.string().optional(),
});

// Output schemas
const modelPerformanceSchema = z.array(
	z.object({
		provider: z.string(),
		model: z.string(),
		totalRequests: z.number(),
		successCount: z.number(),
		errorCount: z.number(),
		quotaExceededCount: z.number(),
		successRate: z.number(),
		latency: z.object({
			avg: z.number(),
			min: z.number(),
			max: z.number(),
			p95: z.number(),
		}),
		tokens: z.object({
			input: z.number(),
			output: z.number(),
			total: z.number(),
			avgPerRequest: z.number(),
		}),
		estimatedCost: z.object({
			input: z.number(),
			output: z.number(),
			total: z.number(),
		}),
	}),
);

const featureUsageSchema = z.object({
	features: z.array(
		z.object({
			feature: z.string(),
			totalRequests: z.number(),
			successCount: z.number(),
			errorCount: z.number(),
			successRate: z.number(),
			totalTokens: z.number(),
			avgLatency: z.number(),
			uniqueUsers: z.number(),
			topUsers: z.array(
				z.object({
					userId: z.string(),
					userName: z.string(),
					count: z.number(),
				}),
			),
		}),
	),
});

const costAnalysisSchema = z.object({
	byFeature: z.array(
		z.object({
			feature: z.string(),
			model: z.string(),
			inputTokens: z.number(),
			outputTokens: z.number(),
			totalTokens: z.number(),
			requestCount: z.number(),
			estimatedCost: z.number(),
		}),
	),
	byTime: z.array(
		z.object({
			period: z.string(),
			inputTokens: z.number(),
			outputTokens: z.number(),
			totalTokens: z.number(),
			requestCount: z.number(),
			estimatedCost: z.number(),
		}),
	),
	byUser: z.array(
		z.object({
			userId: z.string(),
			userName: z.string(),
			inputTokens: z.number(),
			outputTokens: z.number(),
			totalTokens: z.number(),
			requestCount: z.number(),
			estimatedCost: z.number(),
		}),
	),
	summary: z.object({
		totalInputTokens: z.number(),
		totalOutputTokens: z.number(),
		totalTokens: z.number(),
		totalRequests: z.number(),
		totalEstimatedCost: z.number(),
	}),
});

const qualityScoresSchema = z.object({
	overall: z.object({
		totalRequests: z.number(),
		successCount: z.number(),
		errorCount: z.number(),
		quotaExceededCount: z.number(),
		successRate: z.number(),
	}),
	byFeature: z.array(
		z.object({
			feature: z.string(),
			totalRequests: z.number(),
			successCount: z.number(),
			successRate: z.number(),
			avgLatency: z.number(),
		}),
	),
	interviews: z.object({
		totalSessions: z.number(),
		completedSessions: z.number(),
		completionRate: z.number(),
		avgScore: z.number(),
		avgCompletionRate: z.number(),
	}),
});

const studentProgressSchema = z.object({
	learning: z.object({
		totalPaths: z.number(),
		completedPaths: z.number(),
		inProgressPaths: z.number(),
		avgProgress: z.number(),
		completionRate: z.number(),
	}),
	skills: z.object({
		byCategory: z.array(
			z.object({
				category: z.string().nullable(),
				totalSkills: z.number(),
				avgProgress: z.number(),
				avgCurrentLevel: z.number(),
				avgTargetLevel: z.number(),
				totalHoursInvested: z.number(),
			}),
		),
		totalHoursInvested: z.number(),
	}),
	interviews: z.object({
		totalSessions: z.number(),
		completedSessions: z.number(),
		avgScore: z.number(),
	}),
	training: z.object({
		totalInterests: z.number(),
		inProgress: z.number(),
		completed: z.number(),
	}),
});

const predictiveInsightsSchema = z.object({
	usageTrend: z.array(
		z.object({
			date: z.string(),
			requestCount: z.number(),
			tokenCount: z.number(),
			uniqueUsers: z.number(),
		}),
	),
	forecast: z.object({
		growthRate: z.number(),
		trend: z.enum(["increasing", "decreasing", "stable"]),
		predictedUsage: z.array(
			z.object({
				date: z.string(),
				predictedRequests: z.number(),
			}),
		),
	}),
	engagement: z.object({
		activeUsersLast30: z.number(),
		activeUsersLast7: z.number(),
		retentionRate: z.number(),
		atRiskCount: z.number(),
		atRiskUsers: z.array(
			z.object({
				userId: z.string(),
				userName: z.string(),
				email: z.string(),
				lastActivity: z.coerce.date().nullable(),
			}),
		),
		highEngagementUsers: z.array(
			z.object({
				userId: z.string(),
				userName: z.string(),
				requestCount: z.number(),
				tokenCount: z.number(),
			}),
		),
	}),
});

// Helper to parse dates
function parseDateRange(startDate?: string, endDate?: string) {
	return {
		startDate: startDate ? new Date(startDate) : undefined,
		endDate: endDate ? new Date(endDate) : undefined,
	};
}

// Admin endpoints for all metrics
export const aiAnalyticsAdminRouter = {
	// Get model performance metrics (admin - all users)
	getModelPerformance: adminProcedure
		.route({
			method: "GET",
			path: "/ai-analytics/admin/model-performance",
			tags: ["AI Analytics"],
			summary: "Get model performance metrics (admin)",
			description: "Get accuracy, latency, and token efficiency per model for all users.",
		})
		.input(dateRangeSchema)
		.output(modelPerformanceSchema)
		.handler(async ({ input }) => {
			const dates = parseDateRange(input.startDate, input.endDate);
			return aiAnalyticsService.getModelPerformanceMetrics(dates);
		}),

	// Get feature usage matrix (admin - all users)
	getFeatureUsage: adminProcedure
		.route({
			method: "GET",
			path: "/ai-analytics/admin/feature-usage",
			tags: ["AI Analytics"],
			summary: "Get feature usage matrix (admin)",
			description: "Get which AI features are used most, by whom.",
		})
		.input(dateRangeSchema)
		.output(featureUsageSchema)
		.handler(async ({ input }) => {
			const dates = parseDateRange(input.startDate, input.endDate);
			return aiAnalyticsService.getFeatureUsageMatrix(dates);
		}),

	// Get cost analysis (admin - all users)
	getCostAnalysis: adminProcedure
		.route({
			method: "GET",
			path: "/ai-analytics/admin/cost-analysis",
			tags: ["AI Analytics"],
			summary: "Get cost analysis (admin)",
			description: "Get token costs by feature, user, and time period.",
		})
		.input(
			dateRangeSchema.extend({
				groupBy: z.enum(["day", "week", "month"]).optional(),
			}),
		)
		.output(costAnalysisSchema)
		.handler(async ({ input }) => {
			const dates = parseDateRange(input.startDate, input.endDate);
			return aiAnalyticsService.getCostAnalysis({ ...dates, groupBy: input.groupBy });
		}),

	// Get quality scores (admin - all users)
	getQualityScores: adminProcedure
		.route({
			method: "GET",
			path: "/ai-analytics/admin/quality-scores",
			tags: ["AI Analytics"],
			summary: "Get quality scores (admin)",
			description: "Get user satisfaction and content acceptance rates.",
		})
		.input(dateRangeSchema)
		.output(qualityScoresSchema)
		.handler(async ({ input }) => {
			const dates = parseDateRange(input.startDate, input.endDate);
			return aiAnalyticsService.getQualityScores(dates);
		}),

	// Get student progress metrics (admin - all users)
	getStudentProgress: adminProcedure
		.route({
			method: "GET",
			path: "/ai-analytics/admin/student-progress",
			tags: ["AI Analytics"],
			summary: "Get student progress metrics (admin)",
			description: "Get learning velocity and skill improvements across all students.",
		})
		.input(dateRangeSchema)
		.output(studentProgressSchema)
		.handler(async ({ input }) => {
			const dates = parseDateRange(input.startDate, input.endDate);
			return aiAnalyticsService.getStudentProgressMetrics(dates);
		}),

	// Get predictive insights (admin only)
	getPredictiveInsights: adminProcedure
		.route({
			method: "GET",
			path: "/ai-analytics/admin/predictive-insights",
			tags: ["AI Analytics"],
			summary: "Get predictive insights (admin)",
			description: "Forecast usage and identify at-risk students.",
		})
		.input(dateRangeSchema)
		.output(predictiveInsightsSchema)
		.handler(async ({ input }) => {
			const dates = parseDateRange(input.startDate, input.endDate);
			return aiAnalyticsService.getPredictiveInsights(dates);
		}),

	// Generate export data (admin)
	generateExport: adminProcedure
		.route({
			method: "POST",
			path: "/ai-analytics/admin/export",
			tags: ["AI Analytics"],
			summary: "Generate analytics export (admin)",
			description: "Generate comprehensive export data for reports.",
		})
		.input(
			z.object({
				startDate: z.string(),
				endDate: z.string(),
				sections: z.array(z.enum(["performance", "features", "costs", "quality", "progress", "predictions"])),
			}),
		)
		.output(z.record(z.string(), z.unknown()))
		.handler(async ({ input }) => {
			return aiAnalyticsService.generateExportData({
				startDate: new Date(input.startDate),
				endDate: new Date(input.endDate),
				sections: input.sections,
			});
		}),
};

// Student-specific analytics endpoints
export const aiAnalyticsStudentRouter = {
	// Get my model performance metrics
	getMyModelPerformance: protectedProcedure
		.route({
			method: "GET",
			path: "/ai-analytics/me/model-performance",
			tags: ["AI Analytics"],
			summary: "Get my model performance metrics",
			description: "Get accuracy, latency, and token efficiency per model for current user.",
		})
		.input(dateRangeSchema)
		.output(modelPerformanceSchema)
		.handler(async ({ input, context }) => {
			const dates = parseDateRange(input.startDate, input.endDate);
			return aiAnalyticsService.getModelPerformanceMetrics({ ...dates, userId: context.user.id });
		}),

	// Get my feature usage
	getMyFeatureUsage: protectedProcedure
		.route({
			method: "GET",
			path: "/ai-analytics/me/feature-usage",
			tags: ["AI Analytics"],
			summary: "Get my feature usage",
			description: "Get which AI features I have used most.",
		})
		.input(dateRangeSchema)
		.output(featureUsageSchema)
		.handler(async ({ input, context }) => {
			const dates = parseDateRange(input.startDate, input.endDate);
			return aiAnalyticsService.getFeatureUsageMatrix({ ...dates, userId: context.user.id });
		}),

	// Get my cost analysis
	getMyCostAnalysis: protectedProcedure
		.route({
			method: "GET",
			path: "/ai-analytics/me/cost-analysis",
			tags: ["AI Analytics"],
			summary: "Get my cost analysis",
			description: "Get my token usage and estimated costs.",
		})
		.input(
			dateRangeSchema.extend({
				groupBy: z.enum(["day", "week", "month"]).optional(),
			}),
		)
		.output(costAnalysisSchema)
		.handler(async ({ input, context }) => {
			const dates = parseDateRange(input.startDate, input.endDate);
			return aiAnalyticsService.getCostAnalysis({ ...dates, userId: context.user.id, groupBy: input.groupBy });
		}),

	// Get my quality scores
	getMyQualityScores: protectedProcedure
		.route({
			method: "GET",
			path: "/ai-analytics/me/quality-scores",
			tags: ["AI Analytics"],
			summary: "Get my quality scores",
			description: "Get my AI feature success rates and interview performance.",
		})
		.input(dateRangeSchema)
		.output(qualityScoresSchema)
		.handler(async ({ input, context }) => {
			const dates = parseDateRange(input.startDate, input.endDate);
			return aiAnalyticsService.getQualityScores({ ...dates, userId: context.user.id });
		}),

	// Get my progress metrics
	getMyProgress: protectedProcedure
		.route({
			method: "GET",
			path: "/ai-analytics/me/progress",
			tags: ["AI Analytics"],
			summary: "Get my progress metrics",
			description: "Get my learning velocity and skill improvements.",
		})
		.input(dateRangeSchema)
		.output(studentProgressSchema)
		.handler(async ({ input, context }) => {
			const dates = parseDateRange(input.startDate, input.endDate);
			return aiAnalyticsService.getStudentProgressMetrics({ ...dates, userId: context.user.id });
		}),

	// Generate my export data
	generateMyExport: protectedProcedure
		.route({
			method: "POST",
			path: "/ai-analytics/me/export",
			tags: ["AI Analytics"],
			summary: "Generate my analytics export",
			description: "Generate comprehensive export of my analytics data.",
		})
		.input(
			z.object({
				startDate: z.string(),
				endDate: z.string(),
				sections: z.array(z.enum(["performance", "features", "costs", "quality", "progress"])),
			}),
		)
		.output(z.record(z.string(), z.unknown()))
		.handler(async ({ input, context }) => {
			return aiAnalyticsService.generateExportData({
				userId: context.user.id,
				startDate: new Date(input.startDate),
				endDate: new Date(input.endDate),
				sections: input.sections,
			});
		}),
};
