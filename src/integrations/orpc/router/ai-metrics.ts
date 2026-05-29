import z from "zod";
import { adminProcedure, protectedProcedure } from "../context";
import { aiMetricsService } from "../services/ai-metrics";

// Input schemas
const trackLatencySchema = z.object({
	feature: z.string(),
	provider: z.string(),
	model: z.string(),
	usageLogId: z.string().uuid().optional(),
	totalLatency: z.number().int().min(0),
	timeToFirstToken: z.number().int().min(0).optional(),
	inputTokens: z.number().int().min(0).optional(),
	outputTokens: z.number().int().min(0).optional(),
	isStreaming: z.boolean().optional(),
	promptLength: z.number().int().min(0).optional(),
	responseLength: z.number().int().min(0).optional(),
});

const trackQualitySchema = z.object({
	feature: z.string(),
	provider: z.string(),
	model: z.string(),
	usageLogId: z.string().uuid().optional(),
	contentType: z.string(),
	wasAccepted: z.boolean().optional(),
	wasModified: z.boolean().optional(),
	modificationPercent: z.number().int().min(0).max(100).optional(),
	userRating: z.number().int().min(1).max(5).optional(),
	resumeId: z.string().uuid().optional(),
	sectionType: z.string().optional(),
	contentHash: z.string().optional(),
});

const trackErrorSchema = z.object({
	feature: z.string(),
	provider: z.string(),
	model: z.string(),
	usageLogId: z.string().uuid().optional(),
	errorCategory: z.enum([
		"rate_limit",
		"timeout",
		"invalid_request",
		"authentication",
		"model_error",
		"content_filter",
		"quota_exceeded",
		"network_error",
		"parsing_error",
		"unknown",
	]),
	errorCode: z.string().optional(),
	errorMessage: z.string(),
	errorStack: z.string().optional(),
	severity: z.enum(["low", "medium", "high", "critical"]).optional(),
	requestPayload: z.record(z.string(), z.unknown()).optional(),
	responsePayload: z.record(z.string(), z.unknown()).optional(),
	retryCount: z.number().int().min(0).optional(),
	wasRetried: z.boolean().optional(),
	retrySucceeded: z.boolean().optional(),
});

// Tracking router - for recording metrics (protected, called by AI handlers)
const trackingRouter = {
	latency: protectedProcedure
		.route({
			method: "POST",
			path: "/ai-metrics/track/latency",
			tags: ["AI Metrics", "Tracking"],
			summary: "Track AI request latency",
			description: "Record latency metrics for an AI request.",
		})
		.input(trackLatencySchema)
		.handler(async ({ input, context }) => {
			return await aiMetricsService.trackLatency({
				userId: context.user.id,
				...input,
			});
		}),

	quality: protectedProcedure
		.route({
			method: "POST",
			path: "/ai-metrics/track/quality",
			tags: ["AI Metrics", "Tracking"],
			summary: "Track AI content quality feedback",
			description: "Record quality feedback for AI-generated content.",
		})
		.input(trackQualitySchema)
		.handler(async ({ input, context }) => {
			return await aiMetricsService.trackQuality({
				userId: context.user.id,
				...input,
			});
		}),

	error: protectedProcedure
		.route({
			method: "POST",
			path: "/ai-metrics/track/error",
			tags: ["AI Metrics", "Tracking"],
			summary: "Track AI error",
			description: "Record error details for an AI request.",
		})
		.input(trackErrorSchema)
		.handler(async ({ input, context }) => {
			return await aiMetricsService.trackError({
				userId: context.user.id,
				...input,
			});
		}),
};

// Analytics router - for viewing metrics (admin only)
const analyticsRouter = {
	modelComparison: adminProcedure
		.route({
			method: "GET",
			path: "/ai-metrics/analytics/models",
			tags: ["AI Metrics", "Analytics"],
			summary: "Get model comparison stats",
			description: "Compare performance metrics across all AI models.",
		})
		.input(z.object({ days: z.number().int().min(1).max(365).optional() }))
		.handler(async ({ input }) => {
			return await aiMetricsService.getModelComparison(input.days);
		}),

	featurePerformance: adminProcedure
		.route({
			method: "GET",
			path: "/ai-metrics/analytics/features",
			tags: ["AI Metrics", "Analytics"],
			summary: "Get feature performance stats",
			description: "View performance metrics for each AI feature.",
		})
		.input(z.object({ days: z.number().int().min(1).max(365).optional() }))
		.handler(async ({ input }) => {
			return await aiMetricsService.getFeaturePerformance(input.days);
		}),

	costEfficiency: adminProcedure
		.route({
			method: "GET",
			path: "/ai-metrics/analytics/cost",
			tags: ["AI Metrics", "Analytics"],
			summary: "Get cost efficiency metrics",
			description: "Analyze cost efficiency by model and feature.",
		})
		.input(z.object({ days: z.number().int().min(1).max(365).optional() }))
		.handler(async ({ input }) => {
			return await aiMetricsService.getCostEfficiency(input.days);
		}),

	errorRates: adminProcedure
		.route({
			method: "GET",
			path: "/ai-metrics/analytics/errors",
			tags: ["AI Metrics", "Analytics"],
			summary: "Get error rates and details",
			description: "View error rates by model, feature, and category.",
		})
		.input(z.object({ days: z.number().int().min(1).max(365).optional() }))
		.handler(async ({ input }) => {
			return await aiMetricsService.getErrorRates(input.days);
		}),

	optimalModel: adminProcedure
		.route({
			method: "GET",
			path: "/ai-metrics/analytics/optimal-model",
			tags: ["AI Metrics", "Analytics"],
			summary: "Get optimal model recommendation",
			description: "Get the recommended best model for a specific feature.",
		})
		.input(z.object({ feature: z.string() }))
		.handler(async ({ input }) => {
			return await aiMetricsService.getOptimalModel(input.feature);
		}),

	historical: adminProcedure
		.route({
			method: "GET",
			path: "/ai-metrics/analytics/historical",
			tags: ["AI Metrics", "Analytics"],
			summary: "Get historical metrics",
			description: "Get historical metrics data for charting.",
		})
		.input(z.object({ days: z.number().int().min(1).max(365).optional() }))
		.handler(async ({ input }) => {
			return await aiMetricsService.getHistoricalMetrics(input.days);
		}),
};

// Alerts router - for managing performance alerts
const alertsRouter = {
	list: adminProcedure
		.route({
			method: "GET",
			path: "/ai-metrics/alerts",
			tags: ["AI Metrics", "Alerts"],
			summary: "Get active alerts",
			description: "List all active performance alerts.",
		})
		.handler(async () => {
			return await aiMetricsService.getActiveAlerts();
		}),

	checkDegradation: adminProcedure
		.route({
			method: "POST",
			path: "/ai-metrics/alerts/check",
			tags: ["AI Metrics", "Alerts"],
			summary: "Check for performance degradation",
			description: "Run degradation checks and create alerts if needed.",
		})
		.handler(async () => {
			return await aiMetricsService.alertOnDegradation();
		}),

	acknowledge: adminProcedure
		.route({
			method: "PUT",
			path: "/ai-metrics/alerts/{id}/acknowledge",
			tags: ["AI Metrics", "Alerts"],
			summary: "Acknowledge an alert",
			description: "Mark an alert as acknowledged.",
		})
		.input(z.object({ id: z.string().uuid() }))
		.handler(async ({ input, context }) => {
			return await aiMetricsService.acknowledgeAlert(input.id, context.user.id);
		}),

	resolve: adminProcedure
		.route({
			method: "PUT",
			path: "/ai-metrics/alerts/{id}/resolve",
			tags: ["AI Metrics", "Alerts"],
			summary: "Resolve an alert",
			description: "Mark an alert as resolved with resolution notes.",
		})
		.input(z.object({ id: z.string().uuid(), resolution: z.string() }))
		.handler(async ({ input }) => {
			return await aiMetricsService.resolveAlert(input.id, input.resolution);
		}),
};

// Aggregation router - for running aggregations (admin only, for cron jobs)
const aggregationRouter = {
	aggregateDaily: adminProcedure
		.route({
			method: "POST",
			path: "/ai-metrics/aggregate/daily",
			tags: ["AI Metrics", "Aggregation"],
			summary: "Aggregate daily metrics",
			description: "Run daily aggregation for metrics. Should be called by cron job.",
		})
		.input(z.object({ date: z.string().optional() }))
		.handler(async ({ input }) => {
			const date = input.date ? new Date(input.date) : undefined;
			return await aiMetricsService.aggregateDailyMetrics(date);
		}),
};

export const aiMetricsRouter = {
	tracking: trackingRouter,
	analytics: analyticsRouter,
	alerts: alertsRouter,
	aggregation: aggregationRouter,
};
