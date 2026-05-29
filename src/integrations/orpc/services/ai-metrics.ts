import { and, avg, count, desc, eq, gte, lte, max, min, sql, sum } from "drizzle-orm";
import { db } from "@/integrations/drizzle/client";
import * as schema from "@/integrations/drizzle/schema";

// Cost per 1K tokens in cents (approximate, varies by model)
const MODEL_COSTS: Record<string, { input: number; output: number }> = {
	"gpt-4o": { input: 0.25, output: 1.0 },
	"gpt-4o-mini": { input: 0.015, output: 0.06 },
	"gpt-4-turbo": { input: 1.0, output: 3.0 },
	"gpt-3.5-turbo": { input: 0.05, output: 0.15 },
	"claude-sonnet-4-20250514": { input: 0.3, output: 1.5 },
	"claude-3-5-sonnet-20241022": { input: 0.3, output: 1.5 },
	"claude-3-opus-20240229": { input: 1.5, output: 7.5 },
	"claude-3-haiku-20240307": { input: 0.025, output: 0.125 },
	"gemini-2.0-flash-exp": { input: 0.075, output: 0.3 },
	"gemini-1.5-pro": { input: 0.125, output: 0.5 },
	"gemini-1.5-flash": { input: 0.0375, output: 0.15 },
	"deepseek-chat": { input: 0.014, output: 0.028 },
	"deepseek-reasoner": { input: 0.055, output: 0.22 },
};

// Alert thresholds
const ALERT_THRESHOLDS = {
	latency_p90: 5000, // 5 seconds
	error_rate: 10, // 10%
	quality_score: 60, // Below 60% is concerning
	acceptance_rate: 50, // Below 50% is concerning
};

type ErrorCategory =
	| "rate_limit"
	| "timeout"
	| "invalid_request"
	| "authentication"
	| "model_error"
	| "content_filter"
	| "quota_exceeded"
	| "network_error"
	| "parsing_error"
	| "unknown";

type ErrorSeverity = "low" | "medium" | "high" | "critical";

export const aiMetricsService = {
	// Track latency for a request
	async trackLatency(input: {
		userId: string;
		feature: string;
		provider: string;
		model: string;
		usageLogId?: string;
		totalLatency: number;
		timeToFirstToken?: number;
		inputTokens?: number;
		outputTokens?: number;
		isStreaming?: boolean;
		promptLength?: number;
		responseLength?: number;
	}) {
		const tokensPerSecond =
			input.totalLatency > 0 && input.outputTokens ? (input.outputTokens / input.totalLatency) * 1000 : undefined;

		const [log] = await db
			.insert(schema.aiLatencyLog)
			.values({
				userId: input.userId,
				usageLogId: input.usageLogId,
				feature: input.feature,
				provider: input.provider,
				model: input.model,
				totalLatency: input.totalLatency,
				timeToFirstToken: input.timeToFirstToken,
				inputTokens: input.inputTokens,
				outputTokens: input.outputTokens,
				isStreaming: input.isStreaming ?? false,
				promptLength: input.promptLength,
				responseLength: input.responseLength,
				tokensPerSecond,
			})
			.returning();

		return log;
	},

	// Track content quality feedback
	async trackQuality(input: {
		userId: string;
		feature: string;
		provider: string;
		model: string;
		usageLogId?: string;
		contentType: string;
		wasAccepted?: boolean;
		wasModified?: boolean;
		modificationPercent?: number;
		userRating?: number;
		resumeId?: string;
		sectionType?: string;
		contentHash?: string;
	}) {
		const [quality] = await db
			.insert(schema.aiContentQuality)
			.values({
				userId: input.userId,
				usageLogId: input.usageLogId,
				feature: input.feature,
				provider: input.provider,
				model: input.model,
				contentType: input.contentType,
				contentHash: input.contentHash,
				wasAccepted: input.wasAccepted,
				wasModified: input.wasModified,
				modificationPercent: input.modificationPercent,
				userRating: input.userRating,
				resumeId: input.resumeId,
				sectionType: input.sectionType,
				feedbackAt: input.wasAccepted !== undefined ? new Date() : undefined,
			})
			.returning();

		return quality;
	},

	// Track errors with categorization
	async trackError(input: {
		userId?: string;
		feature: string;
		provider: string;
		model: string;
		usageLogId?: string;
		errorCategory: ErrorCategory;
		errorCode?: string;
		errorMessage: string;
		errorStack?: string;
		severity?: ErrorSeverity;
		requestPayload?: object;
		responsePayload?: object;
		retryCount?: number;
		wasRetried?: boolean;
		retrySucceeded?: boolean;
	}) {
		const [error] = await db
			.insert(schema.aiErrorLog)
			.values({
				userId: input.userId,
				usageLogId: input.usageLogId,
				feature: input.feature,
				provider: input.provider,
				model: input.model,
				errorCategory: input.errorCategory,
				errorCode: input.errorCode,
				errorMessage: input.errorMessage,
				errorStack: input.errorStack,
				severity: input.severity ?? "medium",
				requestPayload: input.requestPayload,
				responsePayload: input.responsePayload,
				retryCount: input.retryCount ?? 0,
				wasRetried: input.wasRetried ?? false,
				retrySucceeded: input.retrySucceeded,
			})
			.returning();

		return error;
	},

	// Get model comparison stats
	async getModelComparison(days = 30) {
		const startDate = new Date();
		startDate.setDate(startDate.getDate() - days);

		const metrics = await db
			.select({
				provider: schema.aiUsageLog.provider,
				model: schema.aiUsageLog.model,
				totalRequests: count(),
				successfulRequests: sql<number>`count(*) filter (where ${schema.aiUsageLog.status} = 'success')`,
				failedRequests: sql<number>`count(*) filter (where ${schema.aiUsageLog.status} = 'error')`,
				avgDuration: avg(schema.aiUsageLog.durationMs),
				totalInputTokens: sum(schema.aiUsageLog.inputTokens),
				totalOutputTokens: sum(schema.aiUsageLog.outputTokens),
				totalTokens: sum(schema.aiUsageLog.totalTokens),
			})
			.from(schema.aiUsageLog)
			.where(gte(schema.aiUsageLog.createdAt, startDate))
			.groupBy(schema.aiUsageLog.provider, schema.aiUsageLog.model)
			.orderBy(desc(count()));

		// Get quality metrics
		const qualityMetrics = await db
			.select({
				provider: schema.aiContentQuality.provider,
				model: schema.aiContentQuality.model,
				totalFeedback: count(),
				accepted: sql<number>`count(*) filter (where ${schema.aiContentQuality.wasAccepted} = true)`,
				rejected: sql<number>`count(*) filter (where ${schema.aiContentQuality.wasAccepted} = false)`,
				modified: sql<number>`count(*) filter (where ${schema.aiContentQuality.wasModified} = true)`,
				avgRating: avg(schema.aiContentQuality.userRating),
			})
			.from(schema.aiContentQuality)
			.where(gte(schema.aiContentQuality.generatedAt, startDate))
			.groupBy(schema.aiContentQuality.provider, schema.aiContentQuality.model);

		// Get latency percentiles
		const latencyMetrics = await db
			.select({
				provider: schema.aiLatencyLog.provider,
				model: schema.aiLatencyLog.model,
				minLatency: min(schema.aiLatencyLog.totalLatency),
				maxLatency: max(schema.aiLatencyLog.totalLatency),
				avgLatency: avg(schema.aiLatencyLog.totalLatency),
				avgTokensPerSecond: avg(schema.aiLatencyLog.tokensPerSecond),
			})
			.from(schema.aiLatencyLog)
			.where(gte(schema.aiLatencyLog.createdAt, startDate))
			.groupBy(schema.aiLatencyLog.provider, schema.aiLatencyLog.model);

		// Merge all metrics
		const modelMap = new Map<
			string,
			{
				provider: string;
				model: string;
				totalRequests: number;
				successfulRequests: number;
				failedRequests: number;
				successRate: number;
				avgDuration: number;
				totalInputTokens: number;
				totalOutputTokens: number;
				totalTokens: number;
				estimatedCost: number;
				acceptanceRate: number | null;
				avgRating: number | null;
				avgLatency: number | null;
				avgTokensPerSecond: number | null;
			}
		>();

		for (const m of metrics) {
			const key = `${m.provider}:${m.model}`;
			const totalRequests = Number(m.totalRequests);
			const successfulRequests = Number(m.successfulRequests) || 0;
			const failedRequests = Number(m.failedRequests) || 0;
			const totalInputTokens = Number(m.totalInputTokens) || 0;
			const totalOutputTokens = Number(m.totalOutputTokens) || 0;

			// Calculate cost
			const costs = MODEL_COSTS[m.model] || { input: 0.1, output: 0.3 };
			const estimatedCost = Math.round(
				(totalInputTokens / 1000) * costs.input + (totalOutputTokens / 1000) * costs.output,
			);

			modelMap.set(key, {
				provider: m.provider,
				model: m.model,
				totalRequests,
				successfulRequests,
				failedRequests,
				successRate: totalRequests > 0 ? (successfulRequests / totalRequests) * 100 : 0,
				avgDuration: Math.round(Number(m.avgDuration) || 0),
				totalInputTokens,
				totalOutputTokens,
				totalTokens: Number(m.totalTokens) || 0,
				estimatedCost,
				acceptanceRate: null,
				avgRating: null,
				avgLatency: null,
				avgTokensPerSecond: null,
			});
		}

		// Add quality metrics
		for (const q of qualityMetrics) {
			const key = `${q.provider}:${q.model}`;
			const existing = modelMap.get(key);
			if (existing) {
				const totalFeedback = Number(q.totalFeedback) || 0;
				const accepted = Number(q.accepted) || 0;
				existing.acceptanceRate = totalFeedback > 0 ? (accepted / totalFeedback) * 100 : null;
				existing.avgRating = q.avgRating ? Number(q.avgRating) : null;
			}
		}

		// Add latency metrics
		for (const l of latencyMetrics) {
			const key = `${l.provider}:${l.model}`;
			const existing = modelMap.get(key);
			if (existing) {
				existing.avgLatency = l.avgLatency ? Math.round(Number(l.avgLatency)) : null;
				existing.avgTokensPerSecond = l.avgTokensPerSecond ? Number(l.avgTokensPerSecond) : null;
			}
		}

		return Array.from(modelMap.values()).sort((a, b) => b.totalRequests - a.totalRequests);
	},

	// Get feature performance stats
	async getFeaturePerformance(days = 30) {
		const startDate = new Date();
		startDate.setDate(startDate.getDate() - days);

		const metrics = await db
			.select({
				feature: schema.aiUsageLog.feature,
				totalRequests: count(),
				successfulRequests: sql<number>`count(*) filter (where ${schema.aiUsageLog.status} = 'success')`,
				failedRequests: sql<number>`count(*) filter (where ${schema.aiUsageLog.status} = 'error')`,
				avgDuration: avg(schema.aiUsageLog.durationMs),
				totalTokens: sum(schema.aiUsageLog.totalTokens),
			})
			.from(schema.aiUsageLog)
			.where(gte(schema.aiUsageLog.createdAt, startDate))
			.groupBy(schema.aiUsageLog.feature)
			.orderBy(desc(count()));

		// Get quality by feature
		const qualityByFeature = await db
			.select({
				feature: schema.aiContentQuality.feature,
				totalFeedback: count(),
				accepted: sql<number>`count(*) filter (where ${schema.aiContentQuality.wasAccepted} = true)`,
				rejected: sql<number>`count(*) filter (where ${schema.aiContentQuality.wasAccepted} = false)`,
				modified: sql<number>`count(*) filter (where ${schema.aiContentQuality.wasModified} = true)`,
				avgRating: avg(schema.aiContentQuality.userRating),
			})
			.from(schema.aiContentQuality)
			.where(gte(schema.aiContentQuality.generatedAt, startDate))
			.groupBy(schema.aiContentQuality.feature);

		// Get best model per feature
		const bestModelPerFeature = await db
			.select({
				feature: schema.aiUsageLog.feature,
				provider: schema.aiUsageLog.provider,
				model: schema.aiUsageLog.model,
				successRate: sql<number>`(count(*) filter (where ${schema.aiUsageLog.status} = 'success')::float / count(*) * 100)`,
				avgDuration: avg(schema.aiUsageLog.durationMs),
			})
			.from(schema.aiUsageLog)
			.where(gte(schema.aiUsageLog.createdAt, startDate))
			.groupBy(schema.aiUsageLog.feature, schema.aiUsageLog.provider, schema.aiUsageLog.model)
			.orderBy(desc(sql`count(*)`));

		// Build result
		const featureMap = new Map<
			string,
			{
				feature: string;
				totalRequests: number;
				successfulRequests: number;
				failedRequests: number;
				successRate: number;
				avgDuration: number;
				totalTokens: number;
				acceptanceRate: number | null;
				avgRating: number | null;
				bestModel: string | null;
				bestModelProvider: string | null;
			}
		>();

		for (const m of metrics) {
			const totalRequests = Number(m.totalRequests);
			const successfulRequests = Number(m.successfulRequests) || 0;

			featureMap.set(m.feature, {
				feature: m.feature,
				totalRequests,
				successfulRequests,
				failedRequests: Number(m.failedRequests) || 0,
				successRate: totalRequests > 0 ? (successfulRequests / totalRequests) * 100 : 0,
				avgDuration: Math.round(Number(m.avgDuration) || 0),
				totalTokens: Number(m.totalTokens) || 0,
				acceptanceRate: null,
				avgRating: null,
				bestModel: null,
				bestModelProvider: null,
			});
		}

		// Add quality metrics
		for (const q of qualityByFeature) {
			const existing = featureMap.get(q.feature);
			if (existing) {
				const totalFeedback = Number(q.totalFeedback) || 0;
				const accepted = Number(q.accepted) || 0;
				existing.acceptanceRate = totalFeedback > 0 ? (accepted / totalFeedback) * 100 : null;
				existing.avgRating = q.avgRating ? Number(q.avgRating) : null;
			}
		}

		// Add best model per feature
		const bestModelMap = new Map<string, { provider: string; model: string }>();
		for (const b of bestModelPerFeature) {
			if (!bestModelMap.has(b.feature)) {
				bestModelMap.set(b.feature, { provider: b.provider, model: b.model });
			}
		}

		for (const [feature, best] of bestModelMap) {
			const existing = featureMap.get(feature);
			if (existing) {
				existing.bestModel = best.model;
				existing.bestModelProvider = best.provider;
			}
		}

		return Array.from(featureMap.values()).sort((a, b) => b.totalRequests - a.totalRequests);
	},

	// Get cost efficiency metrics
	async getCostEfficiency(days = 30) {
		const startDate = new Date();
		startDate.setDate(startDate.getDate() - days);

		const metrics = await db
			.select({
				provider: schema.aiUsageLog.provider,
				model: schema.aiUsageLog.model,
				feature: schema.aiUsageLog.feature,
				totalRequests: count(),
				totalInputTokens: sum(schema.aiUsageLog.inputTokens),
				totalOutputTokens: sum(schema.aiUsageLog.outputTokens),
				avgDuration: avg(schema.aiUsageLog.durationMs),
			})
			.from(schema.aiUsageLog)
			.where(and(gte(schema.aiUsageLog.createdAt, startDate), eq(schema.aiUsageLog.status, "success")))
			.groupBy(schema.aiUsageLog.provider, schema.aiUsageLog.model, schema.aiUsageLog.feature);

		// Get acceptance rates by model/feature
		const qualityMetrics = await db
			.select({
				provider: schema.aiContentQuality.provider,
				model: schema.aiContentQuality.model,
				feature: schema.aiContentQuality.feature,
				totalFeedback: count(),
				accepted: sql<number>`count(*) filter (where ${schema.aiContentQuality.wasAccepted} = true)`,
			})
			.from(schema.aiContentQuality)
			.where(gte(schema.aiContentQuality.generatedAt, startDate))
			.groupBy(schema.aiContentQuality.provider, schema.aiContentQuality.model, schema.aiContentQuality.feature);

		// Build efficiency map
		const results = metrics.map((m) => {
			const totalInputTokens = Number(m.totalInputTokens) || 0;
			const totalOutputTokens = Number(m.totalOutputTokens) || 0;
			const totalRequests = Number(m.totalRequests);

			// Calculate cost
			const costs = MODEL_COSTS[m.model] || { input: 0.1, output: 0.3 };
			const estimatedCost = Math.round(
				(totalInputTokens / 1000) * costs.input + (totalOutputTokens / 1000) * costs.output,
			);

			// Find acceptance rate
			const quality = qualityMetrics.find(
				(q) => q.provider === m.provider && q.model === m.model && q.feature === m.feature,
			);

			const totalFeedback = quality ? Number(quality.totalFeedback) || 0 : 0;
			const accepted = quality ? Number(quality.accepted) || 0 : 0;
			const acceptanceRate = totalFeedback > 0 ? (accepted / totalFeedback) * 100 : null;

			// Cost per accepted request
			const costPerRequest = totalRequests > 0 ? estimatedCost / totalRequests : 0;
			const costPerAccepted = acceptanceRate && acceptanceRate > 0 ? costPerRequest / (acceptanceRate / 100) : null;

			return {
				provider: m.provider,
				model: m.model,
				feature: m.feature,
				totalRequests,
				totalInputTokens,
				totalOutputTokens,
				estimatedCost,
				costPerRequest: Math.round(costPerRequest * 100) / 100,
				acceptanceRate,
				costPerAccepted: costPerAccepted ? Math.round(costPerAccepted * 100) / 100 : null,
				avgDuration: Math.round(Number(m.avgDuration) || 0),
			};
		});

		return results.sort((a, b) => {
			// Sort by cost efficiency (cost per accepted, lower is better)
			if (a.costPerAccepted !== null && b.costPerAccepted !== null) {
				return a.costPerAccepted - b.costPerAccepted;
			}
			if (a.costPerAccepted !== null) return -1;
			if (b.costPerAccepted !== null) return 1;
			return b.totalRequests - a.totalRequests;
		});
	},

	// Get error rates by model/feature
	async getErrorRates(days = 30) {
		const startDate = new Date();
		startDate.setDate(startDate.getDate() - days);

		// By model
		const byModel = await db
			.select({
				provider: schema.aiErrorLog.provider,
				model: schema.aiErrorLog.model,
				totalErrors: count(),
			})
			.from(schema.aiErrorLog)
			.where(gte(schema.aiErrorLog.createdAt, startDate))
			.groupBy(schema.aiErrorLog.provider, schema.aiErrorLog.model)
			.orderBy(desc(count()));

		// By category
		const byCategory = await db
			.select({
				category: schema.aiErrorLog.errorCategory,
				totalErrors: count(),
			})
			.from(schema.aiErrorLog)
			.where(gte(schema.aiErrorLog.createdAt, startDate))
			.groupBy(schema.aiErrorLog.errorCategory)
			.orderBy(desc(count()));

		// By feature
		const byFeature = await db
			.select({
				feature: schema.aiErrorLog.feature,
				totalErrors: count(),
				highSeverity: sql<number>`count(*) filter (where ${schema.aiErrorLog.severity} in ('high', 'critical'))`,
			})
			.from(schema.aiErrorLog)
			.where(gte(schema.aiErrorLog.createdAt, startDate))
			.groupBy(schema.aiErrorLog.feature)
			.orderBy(desc(count()));

		// Recent errors
		const recentErrors = await db
			.select({
				id: schema.aiErrorLog.id,
				feature: schema.aiErrorLog.feature,
				provider: schema.aiErrorLog.provider,
				model: schema.aiErrorLog.model,
				errorCategory: schema.aiErrorLog.errorCategory,
				errorMessage: schema.aiErrorLog.errorMessage,
				severity: schema.aiErrorLog.severity,
				isResolved: schema.aiErrorLog.isResolved,
				createdAt: schema.aiErrorLog.createdAt,
			})
			.from(schema.aiErrorLog)
			.where(gte(schema.aiErrorLog.createdAt, startDate))
			.orderBy(desc(schema.aiErrorLog.createdAt))
			.limit(20);

		// Calculate error rates compared to total requests
		const totalRequests = await db
			.select({
				provider: schema.aiUsageLog.provider,
				model: schema.aiUsageLog.model,
				total: count(),
			})
			.from(schema.aiUsageLog)
			.where(gte(schema.aiUsageLog.createdAt, startDate))
			.groupBy(schema.aiUsageLog.provider, schema.aiUsageLog.model);

		const modelErrorRates = byModel.map((m) => {
			const totalForModel = totalRequests.find((t) => t.provider === m.provider && t.model === m.model);
			const total = totalForModel ? Number(totalForModel.total) : 0;
			const errors = Number(m.totalErrors);
			return {
				provider: m.provider,
				model: m.model,
				totalErrors: errors,
				totalRequests: total,
				errorRate: total > 0 ? (errors / total) * 100 : 0,
			};
		});

		return {
			byModel: modelErrorRates,
			byCategory: byCategory.map((c) => ({
				category: c.category,
				totalErrors: Number(c.totalErrors),
			})),
			byFeature: byFeature.map((f) => ({
				feature: f.feature,
				totalErrors: Number(f.totalErrors),
				highSeverityCount: Number(f.highSeverity) || 0,
			})),
			recentErrors,
		};
	},

	// Get optimal model recommendation for a feature
	async getOptimalModel(feature: string) {
		const last30Days = new Date();
		last30Days.setDate(last30Days.getDate() - 30);

		// Get performance metrics per model for this feature
		const modelPerformance = await db
			.select({
				provider: schema.aiUsageLog.provider,
				model: schema.aiUsageLog.model,
				totalRequests: count(),
				successfulRequests: sql<number>`count(*) filter (where ${schema.aiUsageLog.status} = 'success')`,
				avgDuration: avg(schema.aiUsageLog.durationMs),
				totalInputTokens: sum(schema.aiUsageLog.inputTokens),
				totalOutputTokens: sum(schema.aiUsageLog.outputTokens),
			})
			.from(schema.aiUsageLog)
			.where(and(gte(schema.aiUsageLog.createdAt, last30Days), eq(schema.aiUsageLog.feature, feature)))
			.groupBy(schema.aiUsageLog.provider, schema.aiUsageLog.model)
			.orderBy(desc(count()));

		// Get quality metrics
		const qualityMetrics = await db
			.select({
				provider: schema.aiContentQuality.provider,
				model: schema.aiContentQuality.model,
				totalFeedback: count(),
				accepted: sql<number>`count(*) filter (where ${schema.aiContentQuality.wasAccepted} = true)`,
				avgRating: avg(schema.aiContentQuality.userRating),
			})
			.from(schema.aiContentQuality)
			.where(and(gte(schema.aiContentQuality.generatedAt, last30Days), eq(schema.aiContentQuality.feature, feature)))
			.groupBy(schema.aiContentQuality.provider, schema.aiContentQuality.model);

		// Get error rates
		const errorRates = await db
			.select({
				provider: schema.aiErrorLog.provider,
				model: schema.aiErrorLog.model,
				totalErrors: count(),
			})
			.from(schema.aiErrorLog)
			.where(and(gte(schema.aiErrorLog.createdAt, last30Days), eq(schema.aiErrorLog.feature, feature)))
			.groupBy(schema.aiErrorLog.provider, schema.aiErrorLog.model);

		// Calculate scores
		const scores = modelPerformance.map((m) => {
			const totalRequests = Number(m.totalRequests);
			const successfulRequests = Number(m.successfulRequests) || 0;
			const avgDuration = Number(m.avgDuration) || 0;
			const totalInputTokens = Number(m.totalInputTokens) || 0;
			const totalOutputTokens = Number(m.totalOutputTokens) || 0;

			// Success rate (0-100)
			const successRate = totalRequests > 0 ? (successfulRequests / totalRequests) * 100 : 0;

			// Speed score (inverse of duration, normalized to 0-100)
			const speedScore = Math.max(0, 100 - avgDuration / 100); // 10 seconds = 0

			// Cost (lower is better)
			const costs = MODEL_COSTS[m.model] || { input: 0.1, output: 0.3 };
			const costPer1k = (totalInputTokens / 1000) * costs.input + (totalOutputTokens / 1000) * costs.output;
			const costPerRequest = totalRequests > 0 ? costPer1k / totalRequests : 0;
			const costScore = Math.max(0, 100 - costPerRequest * 10); // $0.10 per request = 0

			// Quality score
			const quality = qualityMetrics.find((q) => q.provider === m.provider && q.model === m.model);
			const acceptanceRate =
				quality && Number(quality.totalFeedback) > 0
					? (Number(quality.accepted) / Number(quality.totalFeedback)) * 100
					: 50; // Default to 50% if no feedback

			const avgRating = quality?.avgRating ? Number(quality.avgRating) * 20 : 60; // Convert 1-5 to 0-100

			// Error penalty
			const errors = errorRates.find((e) => e.provider === m.provider && e.model === m.model);
			const errorCount = errors ? Number(errors.totalErrors) : 0;
			const errorPenalty = totalRequests > 0 ? (errorCount / totalRequests) * 100 : 0;

			// Calculate overall score (weighted average)
			const overallScore =
				successRate * 0.25 +
				speedScore * 0.15 +
				costScore * 0.2 +
				acceptanceRate * 0.25 +
				avgRating * 0.15 -
				errorPenalty * 0.5;

			return {
				provider: m.provider,
				model: m.model,
				totalRequests,
				successRate: Math.round(successRate * 10) / 10,
				avgDuration: Math.round(avgDuration),
				costPerRequest: Math.round(costPerRequest * 1000) / 1000,
				acceptanceRate: Math.round(acceptanceRate * 10) / 10,
				avgRating: quality?.avgRating ? Number(quality.avgRating) : null,
				errorCount,
				overallScore: Math.round(overallScore * 10) / 10,
			};
		});

		// Sort by overall score
		scores.sort((a, b) => b.overallScore - a.overallScore);

		return {
			feature,
			recommendations: scores,
			bestModel: scores[0] || null,
		};
	},

	// Check for performance degradation and create alerts
	async alertOnDegradation() {
		const last24Hours = new Date();
		last24Hours.setHours(last24Hours.getHours() - 24);

		const lastWeek = new Date();
		lastWeek.setDate(lastWeek.getDate() - 7);

		const newAlerts: {
			provider: string | null;
			model: string | null;
			feature: string | null;
			alertType: string;
			severity: ErrorSeverity;
			title: string;
			description: string;
			metric: string;
			threshold: number;
			currentValue: number;
		}[] = [];

		// Check latency degradation per model
		const recentLatency = await db
			.select({
				provider: schema.aiLatencyLog.provider,
				model: schema.aiLatencyLog.model,
				avgLatency: avg(schema.aiLatencyLog.totalLatency),
				p90Latency: sql<number>`percentile_cont(0.9) within group (order by ${schema.aiLatencyLog.totalLatency})`,
			})
			.from(schema.aiLatencyLog)
			.where(gte(schema.aiLatencyLog.createdAt, last24Hours))
			.groupBy(schema.aiLatencyLog.provider, schema.aiLatencyLog.model);

		for (const l of recentLatency) {
			const p90 = Number(l.p90Latency) || 0;
			if (p90 > ALERT_THRESHOLDS.latency_p90) {
				newAlerts.push({
					provider: l.provider,
					model: l.model,
					feature: null,
					alertType: "latency_spike",
					severity: p90 > ALERT_THRESHOLDS.latency_p90 * 2 ? "high" : "medium",
					title: `High latency detected for ${l.model}`,
					description: `P90 latency is ${Math.round(p90)}ms, exceeding threshold of ${ALERT_THRESHOLDS.latency_p90}ms`,
					metric: "p90_latency_ms",
					threshold: ALERT_THRESHOLDS.latency_p90,
					currentValue: p90,
				});
			}
		}

		// Check error rate per model
		const recentErrors = await db
			.select({
				provider: schema.aiUsageLog.provider,
				model: schema.aiUsageLog.model,
				total: count(),
				errors: sql<number>`count(*) filter (where ${schema.aiUsageLog.status} = 'error')`,
			})
			.from(schema.aiUsageLog)
			.where(gte(schema.aiUsageLog.createdAt, last24Hours))
			.groupBy(schema.aiUsageLog.provider, schema.aiUsageLog.model);

		for (const e of recentErrors) {
			const total = Number(e.total);
			const errors = Number(e.errors) || 0;
			const errorRate = total > 0 ? (errors / total) * 100 : 0;

			if (errorRate > ALERT_THRESHOLDS.error_rate) {
				newAlerts.push({
					provider: e.provider,
					model: e.model,
					feature: null,
					alertType: "error_rate_high",
					severity: errorRate > ALERT_THRESHOLDS.error_rate * 2 ? "critical" : "high",
					title: `High error rate for ${e.model}`,
					description: `Error rate is ${errorRate.toFixed(1)}%, exceeding threshold of ${ALERT_THRESHOLDS.error_rate}%`,
					metric: "error_rate_percent",
					threshold: ALERT_THRESHOLDS.error_rate,
					currentValue: errorRate,
				});
			}
		}

		// Check quality degradation
		const recentQuality = await db
			.select({
				provider: schema.aiContentQuality.provider,
				model: schema.aiContentQuality.model,
				totalFeedback: count(),
				accepted: sql<number>`count(*) filter (where ${schema.aiContentQuality.wasAccepted} = true)`,
			})
			.from(schema.aiContentQuality)
			.where(gte(schema.aiContentQuality.generatedAt, last24Hours))
			.groupBy(schema.aiContentQuality.provider, schema.aiContentQuality.model);

		for (const q of recentQuality) {
			const total = Number(q.totalFeedback);
			const accepted = Number(q.accepted) || 0;
			const acceptanceRate = total > 0 ? (accepted / total) * 100 : 100;

			if (total >= 10 && acceptanceRate < ALERT_THRESHOLDS.acceptance_rate) {
				newAlerts.push({
					provider: q.provider,
					model: q.model,
					feature: null,
					alertType: "quality_degradation",
					severity: acceptanceRate < ALERT_THRESHOLDS.acceptance_rate / 2 ? "high" : "medium",
					title: `Low acceptance rate for ${q.model}`,
					description: `Acceptance rate is ${acceptanceRate.toFixed(1)}%, below threshold of ${ALERT_THRESHOLDS.acceptance_rate}%`,
					metric: "acceptance_rate_percent",
					threshold: ALERT_THRESHOLDS.acceptance_rate,
					currentValue: acceptanceRate,
				});
			}
		}

		// Insert new alerts (avoid duplicates by checking for similar active alerts)
		const insertedAlerts = [];
		for (const alert of newAlerts) {
			// Check for existing similar active alert
			const [existing] = await db
				.select({ id: schema.aiPerformanceAlert.id })
				.from(schema.aiPerformanceAlert)
				.where(
					and(
						eq(schema.aiPerformanceAlert.alertType, alert.alertType),
						eq(schema.aiPerformanceAlert.status, "active"),
						alert.provider ? eq(schema.aiPerformanceAlert.provider, alert.provider) : sql`true`,
						alert.model ? eq(schema.aiPerformanceAlert.model, alert.model) : sql`true`,
					),
				)
				.limit(1);

			if (!existing) {
				const [inserted] = await db.insert(schema.aiPerformanceAlert).values(alert).returning();
				insertedAlerts.push(inserted);
			}
		}

		return {
			newAlerts: insertedAlerts,
			checkedMetrics: {
				latency: recentLatency.length,
				errorRates: recentErrors.length,
				quality: recentQuality.length,
			},
		};
	},

	// Get active alerts
	async getActiveAlerts() {
		return db
			.select()
			.from(schema.aiPerformanceAlert)
			.where(eq(schema.aiPerformanceAlert.status, "active"))
			.orderBy(
				desc(
					sql`case ${schema.aiPerformanceAlert.severity}
						when 'critical' then 4
						when 'high' then 3
						when 'medium' then 2
						when 'low' then 1
						else 0 end`,
				),
				desc(schema.aiPerformanceAlert.createdAt),
			);
	},

	// Acknowledge an alert
	async acknowledgeAlert(alertId: string, userId: string) {
		const [updated] = await db
			.update(schema.aiPerformanceAlert)
			.set({
				status: "acknowledged",
				acknowledgedBy: userId,
				acknowledgedAt: new Date(),
			})
			.where(eq(schema.aiPerformanceAlert.id, alertId))
			.returning();

		return updated;
	},

	// Resolve an alert
	async resolveAlert(alertId: string, resolution: string) {
		const [updated] = await db
			.update(schema.aiPerformanceAlert)
			.set({
				status: "resolved",
				resolution,
				resolvedAt: new Date(),
			})
			.where(eq(schema.aiPerformanceAlert.id, alertId))
			.returning();

		return updated;
	},

	// Aggregate daily metrics (run via cron)
	async aggregateDailyMetrics(date?: Date) {
		const targetDate = date || new Date();
		const dateStr = targetDate.toISOString().split("T")[0];

		const startOfDay = new Date(dateStr);
		const endOfDay = new Date(dateStr);
		endOfDay.setDate(endOfDay.getDate() + 1);

		// Aggregate model metrics
		const modelStats = await db
			.select({
				provider: schema.aiUsageLog.provider,
				model: schema.aiUsageLog.model,
				totalRequests: count(),
				successfulRequests: sql<number>`count(*) filter (where ${schema.aiUsageLog.status} = 'success')`,
				failedRequests: sql<number>`count(*) filter (where ${schema.aiUsageLog.status} = 'error')`,
				avgDuration: avg(schema.aiUsageLog.durationMs),
				totalInputTokens: sum(schema.aiUsageLog.inputTokens),
				totalOutputTokens: sum(schema.aiUsageLog.outputTokens),
			})
			.from(schema.aiUsageLog)
			.where(and(gte(schema.aiUsageLog.createdAt, startOfDay), lte(schema.aiUsageLog.createdAt, endOfDay)))
			.groupBy(schema.aiUsageLog.provider, schema.aiUsageLog.model);

		// Get latency percentiles
		const latencyStats = await db
			.select({
				provider: schema.aiLatencyLog.provider,
				model: schema.aiLatencyLog.model,
				avgLatency: avg(schema.aiLatencyLog.totalLatency),
				minLatency: min(schema.aiLatencyLog.totalLatency),
				maxLatency: max(schema.aiLatencyLog.totalLatency),
				p50Latency: sql<number>`percentile_cont(0.5) within group (order by ${schema.aiLatencyLog.totalLatency})`,
				p90Latency: sql<number>`percentile_cont(0.9) within group (order by ${schema.aiLatencyLog.totalLatency})`,
				p99Latency: sql<number>`percentile_cont(0.99) within group (order by ${schema.aiLatencyLog.totalLatency})`,
				avgTokensPerSecond: avg(schema.aiLatencyLog.tokensPerSecond),
			})
			.from(schema.aiLatencyLog)
			.where(and(gte(schema.aiLatencyLog.createdAt, startOfDay), lte(schema.aiLatencyLog.createdAt, endOfDay)))
			.groupBy(schema.aiLatencyLog.provider, schema.aiLatencyLog.model);

		// Get quality stats
		const qualityStats = await db
			.select({
				provider: schema.aiContentQuality.provider,
				model: schema.aiContentQuality.model,
				totalFeedback: count(),
				accepted: sql<number>`count(*) filter (where ${schema.aiContentQuality.wasAccepted} = true)`,
				avgRating: avg(schema.aiContentQuality.userRating),
			})
			.from(schema.aiContentQuality)
			.where(
				and(gte(schema.aiContentQuality.generatedAt, startOfDay), lte(schema.aiContentQuality.generatedAt, endOfDay)),
			)
			.groupBy(schema.aiContentQuality.provider, schema.aiContentQuality.model);

		// Upsert model metrics
		for (const m of modelStats) {
			const latency = latencyStats.find((l) => l.provider === m.provider && l.model === m.model);
			const quality = qualityStats.find((q) => q.provider === m.provider && q.model === m.model);

			const totalRequests = Number(m.totalRequests);
			const successfulRequests = Number(m.successfulRequests) || 0;
			const failedRequests = Number(m.failedRequests) || 0;
			const totalInputTokens = Number(m.totalInputTokens) || 0;
			const totalOutputTokens = Number(m.totalOutputTokens) || 0;

			// Calculate cost
			const costs = MODEL_COSTS[m.model] || { input: 0.1, output: 0.3 };
			const estimatedCost = Math.round(
				(totalInputTokens / 1000) * costs.input + (totalOutputTokens / 1000) * costs.output,
			);

			// Quality metrics
			const qualityTotal = quality ? Number(quality.totalFeedback) : 0;
			const qualityAccepted = quality ? Number(quality.accepted) : 0;
			const acceptanceRate = qualityTotal > 0 ? (qualityAccepted / qualityTotal) * 100 : null;

			await db
				.insert(schema.aiModelMetrics)
				.values({
					provider: m.provider,
					model: m.model,
					date: dateStr,
					totalRequests,
					successfulRequests,
					failedRequests,
					avgLatency: latency ? Math.round(Number(latency.avgLatency) || 0) : null,
					minLatency: latency ? Number(latency.minLatency) : null,
					maxLatency: latency ? Number(latency.maxLatency) : null,
					p50Latency: latency ? Math.round(Number(latency.p50Latency) || 0) : null,
					p90Latency: latency ? Math.round(Number(latency.p90Latency) || 0) : null,
					p99Latency: latency ? Math.round(Number(latency.p99Latency) || 0) : null,
					totalInputTokens,
					totalOutputTokens,
					avgInputTokens: totalRequests > 0 ? Math.round(totalInputTokens / totalRequests) : null,
					avgOutputTokens: totalRequests > 0 ? Math.round(totalOutputTokens / totalRequests) : null,
					estimatedCost,
					costPerRequest: totalRequests > 0 ? Math.round(estimatedCost / totalRequests) : null,
					avgQualityScore: quality?.avgRating ? Number(quality.avgRating) * 20 : null,
					acceptanceRate,
					successRate: totalRequests > 0 ? (successfulRequests / totalRequests) * 100 : null,
					tokensPerSecond: latency ? Number(latency.avgTokensPerSecond) : null,
				})
				.onConflictDoUpdate({
					target: [schema.aiModelMetrics.provider, schema.aiModelMetrics.model, schema.aiModelMetrics.date],
					set: {
						totalRequests,
						successfulRequests,
						failedRequests,
						avgLatency: latency ? Math.round(Number(latency.avgLatency) || 0) : null,
						minLatency: latency ? Number(latency.minLatency) : null,
						maxLatency: latency ? Number(latency.maxLatency) : null,
						p50Latency: latency ? Math.round(Number(latency.p50Latency) || 0) : null,
						p90Latency: latency ? Math.round(Number(latency.p90Latency) || 0) : null,
						p99Latency: latency ? Math.round(Number(latency.p99Latency) || 0) : null,
						totalInputTokens,
						totalOutputTokens,
						avgInputTokens: totalRequests > 0 ? Math.round(totalInputTokens / totalRequests) : null,
						avgOutputTokens: totalRequests > 0 ? Math.round(totalOutputTokens / totalRequests) : null,
						estimatedCost,
						costPerRequest: totalRequests > 0 ? Math.round(estimatedCost / totalRequests) : null,
						avgQualityScore: quality?.avgRating ? Number(quality.avgRating) * 20 : null,
						acceptanceRate,
						successRate: totalRequests > 0 ? (successfulRequests / totalRequests) * 100 : null,
						tokensPerSecond: latency ? Number(latency.avgTokensPerSecond) : null,
						updatedAt: new Date(),
					},
				});
		}

		// Aggregate feature metrics
		const featureStats = await db
			.select({
				feature: schema.aiUsageLog.feature,
				totalRequests: count(),
				successfulRequests: sql<number>`count(*) filter (where ${schema.aiUsageLog.status} = 'success')`,
				failedRequests: sql<number>`count(*) filter (where ${schema.aiUsageLog.status} = 'error')`,
				avgDuration: avg(schema.aiUsageLog.durationMs),
				totalTokens: sum(schema.aiUsageLog.totalTokens),
			})
			.from(schema.aiUsageLog)
			.where(and(gte(schema.aiUsageLog.createdAt, startOfDay), lte(schema.aiUsageLog.createdAt, endOfDay)))
			.groupBy(schema.aiUsageLog.feature);

		const featureQuality = await db
			.select({
				feature: schema.aiContentQuality.feature,
				totalFeedback: count(),
				accepted: sql<number>`count(*) filter (where ${schema.aiContentQuality.wasAccepted} = true)`,
				rejected: sql<number>`count(*) filter (where ${schema.aiContentQuality.wasAccepted} = false)`,
				modified: sql<number>`count(*) filter (where ${schema.aiContentQuality.wasModified} = true)`,
				avgRating: avg(schema.aiContentQuality.userRating),
			})
			.from(schema.aiContentQuality)
			.where(
				and(gte(schema.aiContentQuality.generatedAt, startOfDay), lte(schema.aiContentQuality.generatedAt, endOfDay)),
			)
			.groupBy(schema.aiContentQuality.feature);

		// Get p90 latency per feature
		const featureLatency = await db
			.select({
				feature: schema.aiLatencyLog.feature,
				avgLatency: avg(schema.aiLatencyLog.totalLatency),
				p90Latency: sql<number>`percentile_cont(0.9) within group (order by ${schema.aiLatencyLog.totalLatency})`,
			})
			.from(schema.aiLatencyLog)
			.where(and(gte(schema.aiLatencyLog.createdAt, startOfDay), lte(schema.aiLatencyLog.createdAt, endOfDay)))
			.groupBy(schema.aiLatencyLog.feature);

		for (const f of featureStats) {
			const quality = featureQuality.find((q) => q.feature === f.feature);
			const latency = featureLatency.find((l) => l.feature === f.feature);

			const totalRequests = Number(f.totalRequests);
			const totalTokens = Number(f.totalTokens) || 0;

			await db
				.insert(schema.aiFeatureMetrics)
				.values({
					feature: f.feature,
					date: dateStr,
					totalRequests,
					successfulRequests: Number(f.successfulRequests) || 0,
					failedRequests: Number(f.failedRequests) || 0,
					avgLatency: latency ? Math.round(Number(latency.avgLatency) || 0) : null,
					p90Latency: latency ? Math.round(Number(latency.p90Latency) || 0) : null,
					totalTokens,
					avgTokensPerRequest: totalRequests > 0 ? Math.round(totalTokens / totalRequests) : null,
					avgQualityScore: quality?.avgRating ? Number(quality.avgRating) * 20 : null,
					acceptanceCount: quality ? Number(quality.accepted) : 0,
					rejectionCount: quality ? Number(quality.rejected) : 0,
					modificationCount: quality ? Number(quality.modified) : 0,
				})
				.onConflictDoUpdate({
					target: [schema.aiFeatureMetrics.feature, schema.aiFeatureMetrics.date],
					set: {
						totalRequests,
						successfulRequests: Number(f.successfulRequests) || 0,
						failedRequests: Number(f.failedRequests) || 0,
						avgLatency: latency ? Math.round(Number(latency.avgLatency) || 0) : null,
						p90Latency: latency ? Math.round(Number(latency.p90Latency) || 0) : null,
						totalTokens,
						avgTokensPerRequest: totalRequests > 0 ? Math.round(totalTokens / totalRequests) : null,
						avgQualityScore: quality?.avgRating ? Number(quality.avgRating) * 20 : null,
						acceptanceCount: quality ? Number(quality.accepted) : 0,
						rejectionCount: quality ? Number(quality.rejected) : 0,
						modificationCount: quality ? Number(quality.modified) : 0,
						updatedAt: new Date(),
					},
				});
		}

		return {
			date: dateStr,
			modelsAggregated: modelStats.length,
			featuresAggregated: featureStats.length,
		};
	},

	// Get historical metrics for charting
	async getHistoricalMetrics(days = 30) {
		const startDate = new Date();
		startDate.setDate(startDate.getDate() - days);
		const startDateStr = startDate.toISOString().split("T")[0];

		const modelMetrics = await db
			.select()
			.from(schema.aiModelMetrics)
			.where(gte(schema.aiModelMetrics.date, startDateStr))
			.orderBy(schema.aiModelMetrics.date);

		const featureMetrics = await db
			.select()
			.from(schema.aiFeatureMetrics)
			.where(gte(schema.aiFeatureMetrics.date, startDateStr))
			.orderBy(schema.aiFeatureMetrics.date);

		// Group by date for totals
		const dailyTotals = new Map<
			string,
			{
				date: string;
				totalRequests: number;
				successfulRequests: number;
				failedRequests: number;
				totalTokens: number;
				estimatedCost: number;
				avgLatency: number;
			}
		>();

		for (const m of modelMetrics) {
			const existing = dailyTotals.get(m.date) || {
				date: m.date,
				totalRequests: 0,
				successfulRequests: 0,
				failedRequests: 0,
				totalTokens: 0,
				estimatedCost: 0,
				avgLatency: 0,
			};

			existing.totalRequests += m.totalRequests;
			existing.successfulRequests += m.successfulRequests;
			existing.failedRequests += m.failedRequests;
			existing.totalTokens += m.totalInputTokens + m.totalOutputTokens;
			existing.estimatedCost += m.estimatedCost || 0;

			dailyTotals.set(m.date, existing);
		}

		return {
			byModel: modelMetrics,
			byFeature: featureMetrics,
			dailyTotals: Array.from(dailyTotals.values()).sort((a, b) => a.date.localeCompare(b.date)),
		};
	},
};
