import type { SQL } from "drizzle-orm";
import { and, avg, count, desc, eq, gte, lt, sql, sum } from "drizzle-orm";
import { db } from "@/integrations/drizzle/client";
import * as schema from "@/integrations/drizzle/schema";

// Cost estimates per 1M tokens (approximate)
const TOKEN_COSTS: Record<string, { input: number; output: number }> = {
	"gpt-4o": { input: 2.5, output: 10 },
	"gpt-4o-mini": { input: 0.15, output: 0.6 },
	"gpt-4-turbo": { input: 10, output: 30 },
	"gpt-3.5-turbo": { input: 0.5, output: 1.5 },
	"claude-3-opus": { input: 15, output: 75 },
	"claude-3-sonnet": { input: 3, output: 15 },
	"claude-3-haiku": { input: 0.25, output: 1.25 },
	"gemini-pro": { input: 0.5, output: 1.5 },
	"gemini-1.5-pro": { input: 1.25, output: 5 },
	default: { input: 1, output: 3 },
};

function getTokenCost(model: string): { input: number; output: number } {
	const normalizedModel = model.toLowerCase();
	for (const [key, cost] of Object.entries(TOKEN_COSTS)) {
		if (normalizedModel.includes(key)) {
			return cost;
		}
	}
	return TOKEN_COSTS.default;
}

export const aiAnalyticsService = {
	/**
	 * Get model performance metrics - accuracy, latency, token efficiency per model
	 */
	async getModelPerformanceMetrics(options?: { userId?: string; startDate?: Date; endDate?: Date }) {
		const conditions: SQL[] = [];

		if (options?.userId) {
			conditions.push(eq(schema.aiUsageLog.userId, options.userId));
		}
		if (options?.startDate) {
			conditions.push(gte(schema.aiUsageLog.createdAt, options.startDate));
		}
		if (options?.endDate) {
			conditions.push(lt(schema.aiUsageLog.createdAt, options.endDate));
		}

		const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

		// Metrics by model
		const modelMetrics = await db
			.select({
				provider: schema.aiUsageLog.provider,
				model: schema.aiUsageLog.model,
				totalRequests: count(),
				successCount: sql<number>`count(*) filter (where ${schema.aiUsageLog.status} = 'success')`,
				errorCount: sql<number>`count(*) filter (where ${schema.aiUsageLog.status} = 'error')`,
				quotaExceededCount: sql<number>`count(*) filter (where ${schema.aiUsageLog.status} = 'quota_exceeded')`,
				avgLatency: avg(schema.aiUsageLog.durationMs),
				minLatency: sql<number>`min(${schema.aiUsageLog.durationMs})`,
				maxLatency: sql<number>`max(${schema.aiUsageLog.durationMs})`,
				p95Latency: sql<number>`percentile_cont(0.95) within group (order by ${schema.aiUsageLog.durationMs})`,
				totalInputTokens: sum(schema.aiUsageLog.inputTokens),
				totalOutputTokens: sum(schema.aiUsageLog.outputTokens),
				totalTokens: sum(schema.aiUsageLog.totalTokens),
				avgTokensPerRequest: avg(schema.aiUsageLog.totalTokens),
			})
			.from(schema.aiUsageLog)
			.where(whereClause)
			.groupBy(schema.aiUsageLog.provider, schema.aiUsageLog.model)
			.orderBy(desc(count()));

		return modelMetrics.map((m) => {
			const successRate =
				Number(m.totalRequests) > 0 ? Math.round((Number(m.successCount) / Number(m.totalRequests)) * 100) : 0;

			const tokenCost = getTokenCost(m.model);
			const inputCost = ((Number(m.totalInputTokens) || 0) / 1_000_000) * tokenCost.input;
			const outputCost = ((Number(m.totalOutputTokens) || 0) / 1_000_000) * tokenCost.output;

			return {
				provider: m.provider,
				model: m.model,
				totalRequests: Number(m.totalRequests),
				successCount: Number(m.successCount) || 0,
				errorCount: Number(m.errorCount) || 0,
				quotaExceededCount: Number(m.quotaExceededCount) || 0,
				successRate,
				latency: {
					avg: Math.round(Number(m.avgLatency) || 0),
					min: Number(m.minLatency) || 0,
					max: Number(m.maxLatency) || 0,
					p95: Math.round(Number(m.p95Latency) || 0),
				},
				tokens: {
					input: Number(m.totalInputTokens) || 0,
					output: Number(m.totalOutputTokens) || 0,
					total: Number(m.totalTokens) || 0,
					avgPerRequest: Math.round(Number(m.avgTokensPerRequest) || 0),
				},
				estimatedCost: {
					input: Math.round(inputCost * 100) / 100,
					output: Math.round(outputCost * 100) / 100,
					total: Math.round((inputCost + outputCost) * 100) / 100,
				},
			};
		});
	},

	/**
	 * Get feature usage matrix - which AI features are used most, by whom
	 */
	async getFeatureUsageMatrix(options?: { userId?: string; startDate?: Date; endDate?: Date }) {
		const conditions: SQL[] = [];

		if (options?.userId) {
			conditions.push(eq(schema.aiUsageLog.userId, options.userId));
		}
		if (options?.startDate) {
			conditions.push(gte(schema.aiUsageLog.createdAt, options.startDate));
		}
		if (options?.endDate) {
			conditions.push(lt(schema.aiUsageLog.createdAt, options.endDate));
		}

		const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

		// Feature usage breakdown
		const featureUsage = await db
			.select({
				feature: schema.aiUsageLog.feature,
				totalRequests: count(),
				successCount: sql<number>`count(*) filter (where ${schema.aiUsageLog.status} = 'success')`,
				errorCount: sql<number>`count(*) filter (where ${schema.aiUsageLog.status} = 'error')`,
				totalTokens: sum(schema.aiUsageLog.totalTokens),
				avgLatency: avg(schema.aiUsageLog.durationMs),
				uniqueUsers: sql<number>`count(distinct ${schema.aiUsageLog.userId})`,
			})
			.from(schema.aiUsageLog)
			.where(whereClause)
			.groupBy(schema.aiUsageLog.feature)
			.orderBy(desc(count()));

		// Top users per feature (admin only, when no userId filter)
		const topUsersByFeature: Record<string, Array<{ userId: string; userName: string; count: number }>> = {};

		if (!options?.userId) {
			for (const f of featureUsage.slice(0, 5)) {
				const topUsers = await db
					.select({
						userId: schema.aiUsageLog.userId,
						userName: schema.user.name,
						count: count(),
					})
					.from(schema.aiUsageLog)
					.innerJoin(schema.user, eq(schema.aiUsageLog.userId, schema.user.id))
					.where(
						and(
							eq(schema.aiUsageLog.feature, f.feature),
							options?.startDate ? gte(schema.aiUsageLog.createdAt, options.startDate) : undefined,
							options?.endDate ? lt(schema.aiUsageLog.createdAt, options.endDate) : undefined,
						),
					)
					.groupBy(schema.aiUsageLog.userId, schema.user.name)
					.orderBy(desc(count()))
					.limit(5);

				topUsersByFeature[f.feature] = topUsers.map((u) => ({
					userId: u.userId,
					userName: u.userName,
					count: Number(u.count),
				}));
			}
		}

		return {
			features: featureUsage.map((f) => ({
				feature: f.feature,
				totalRequests: Number(f.totalRequests),
				successCount: Number(f.successCount) || 0,
				errorCount: Number(f.errorCount) || 0,
				successRate:
					Number(f.totalRequests) > 0 ? Math.round((Number(f.successCount) / Number(f.totalRequests)) * 100) : 0,
				totalTokens: Number(f.totalTokens) || 0,
				avgLatency: Math.round(Number(f.avgLatency) || 0),
				uniqueUsers: Number(f.uniqueUsers) || 0,
				topUsers: topUsersByFeature[f.feature] || [],
			})),
		};
	},

	/**
	 * Get cost analysis - token costs by feature/user/time
	 */
	async getCostAnalysis(options?: {
		userId?: string;
		startDate?: Date;
		endDate?: Date;
		groupBy?: "day" | "week" | "month";
	}) {
		const conditions: SQL[] = [];

		if (options?.userId) {
			conditions.push(eq(schema.aiUsageLog.userId, options.userId));
		}
		if (options?.startDate) {
			conditions.push(gte(schema.aiUsageLog.createdAt, options.startDate));
		}
		if (options?.endDate) {
			conditions.push(lt(schema.aiUsageLog.createdAt, options.endDate));
		}

		const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

		// Cost by feature
		const costByFeature = await db
			.select({
				feature: schema.aiUsageLog.feature,
				model: schema.aiUsageLog.model,
				inputTokens: sum(schema.aiUsageLog.inputTokens),
				outputTokens: sum(schema.aiUsageLog.outputTokens),
				totalTokens: sum(schema.aiUsageLog.totalTokens),
				requestCount: count(),
			})
			.from(schema.aiUsageLog)
			.where(whereClause)
			.groupBy(schema.aiUsageLog.feature, schema.aiUsageLog.model)
			.orderBy(desc(sum(schema.aiUsageLog.totalTokens)));

		// Cost over time
		const dateFormat =
			options?.groupBy === "month"
				? sql<string>`to_char(${schema.aiUsageLog.createdAt}, 'YYYY-MM')`
				: options?.groupBy === "week"
					? sql<string>`to_char(date_trunc('week', ${schema.aiUsageLog.createdAt}), 'YYYY-MM-DD')`
					: sql<string>`date(${schema.aiUsageLog.createdAt})`;

		const costOverTime = await db
			.select({
				period: dateFormat,
				inputTokens: sum(schema.aiUsageLog.inputTokens),
				outputTokens: sum(schema.aiUsageLog.outputTokens),
				totalTokens: sum(schema.aiUsageLog.totalTokens),
				requestCount: count(),
			})
			.from(schema.aiUsageLog)
			.where(whereClause)
			.groupBy(dateFormat)
			.orderBy(dateFormat);

		// Cost by user (admin only, when no userId filter)
		let costByUser: Array<{
			userId: string;
			userName: string;
			inputTokens: number;
			outputTokens: number;
			totalTokens: number;
			requestCount: number;
			estimatedCost: number;
		}> = [];

		if (!options?.userId) {
			const userCosts = await db
				.select({
					userId: schema.aiUsageLog.userId,
					userName: schema.user.name,
					inputTokens: sum(schema.aiUsageLog.inputTokens),
					outputTokens: sum(schema.aiUsageLog.outputTokens),
					totalTokens: sum(schema.aiUsageLog.totalTokens),
					requestCount: count(),
				})
				.from(schema.aiUsageLog)
				.innerJoin(schema.user, eq(schema.aiUsageLog.userId, schema.user.id))
				.where(whereClause)
				.groupBy(schema.aiUsageLog.userId, schema.user.name)
				.orderBy(desc(sum(schema.aiUsageLog.totalTokens)))
				.limit(20);

			costByUser = userCosts.map((u) => {
				const inputCost = ((Number(u.inputTokens) || 0) / 1_000_000) * TOKEN_COSTS.default.input;
				const outputCost = ((Number(u.outputTokens) || 0) / 1_000_000) * TOKEN_COSTS.default.output;
				return {
					userId: u.userId,
					userName: u.userName,
					inputTokens: Number(u.inputTokens) || 0,
					outputTokens: Number(u.outputTokens) || 0,
					totalTokens: Number(u.totalTokens) || 0,
					requestCount: Number(u.requestCount),
					estimatedCost: Math.round((inputCost + outputCost) * 100) / 100,
				};
			});
		}

		// Calculate costs for each feature
		const featureCosts = costByFeature.map((f) => {
			const tokenCost = getTokenCost(f.model);
			const inputCost = ((Number(f.inputTokens) || 0) / 1_000_000) * tokenCost.input;
			const outputCost = ((Number(f.outputTokens) || 0) / 1_000_000) * tokenCost.output;
			return {
				feature: f.feature,
				model: f.model,
				inputTokens: Number(f.inputTokens) || 0,
				outputTokens: Number(f.outputTokens) || 0,
				totalTokens: Number(f.totalTokens) || 0,
				requestCount: Number(f.requestCount),
				estimatedCost: Math.round((inputCost + outputCost) * 100) / 100,
			};
		});

		// Calculate costs over time
		const timeCosts = costOverTime.map((t) => {
			const inputCost = ((Number(t.inputTokens) || 0) / 1_000_000) * TOKEN_COSTS.default.input;
			const outputCost = ((Number(t.outputTokens) || 0) / 1_000_000) * TOKEN_COSTS.default.output;
			return {
				period: t.period,
				inputTokens: Number(t.inputTokens) || 0,
				outputTokens: Number(t.outputTokens) || 0,
				totalTokens: Number(t.totalTokens) || 0,
				requestCount: Number(t.requestCount),
				estimatedCost: Math.round((inputCost + outputCost) * 100) / 100,
			};
		});

		// Total cost summary
		const totalInputTokens = featureCosts.reduce((sum, f) => sum + f.inputTokens, 0);
		const totalOutputTokens = featureCosts.reduce((sum, f) => sum + f.outputTokens, 0);
		const totalCost = featureCosts.reduce((sum, f) => sum + f.estimatedCost, 0);

		return {
			byFeature: featureCosts,
			byTime: timeCosts,
			byUser: costByUser,
			summary: {
				totalInputTokens,
				totalOutputTokens,
				totalTokens: totalInputTokens + totalOutputTokens,
				totalRequests: featureCosts.reduce((sum, f) => sum + f.requestCount, 0),
				totalEstimatedCost: Math.round(totalCost * 100) / 100,
			},
		};
	},

	/**
	 * Get quality scores - user satisfaction, content acceptance rates
	 */
	async getQualityScores(options?: { userId?: string; startDate?: Date; endDate?: Date }) {
		const conditions: SQL[] = [];

		if (options?.userId) {
			conditions.push(eq(schema.aiUsageLog.userId, options.userId));
		}
		if (options?.startDate) {
			conditions.push(gte(schema.aiUsageLog.createdAt, options.startDate));
		}
		if (options?.endDate) {
			conditions.push(lt(schema.aiUsageLog.createdAt, options.endDate));
		}

		const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

		// Overall success/error rates as a proxy for quality
		const [overallStats] = await db
			.select({
				totalRequests: count(),
				successCount: sql<number>`count(*) filter (where ${schema.aiUsageLog.status} = 'success')`,
				errorCount: sql<number>`count(*) filter (where ${schema.aiUsageLog.status} = 'error')`,
				quotaExceededCount: sql<number>`count(*) filter (where ${schema.aiUsageLog.status} = 'quota_exceeded')`,
			})
			.from(schema.aiUsageLog)
			.where(whereClause);

		// Success rate by feature (quality indicator)
		const qualityByFeature = await db
			.select({
				feature: schema.aiUsageLog.feature,
				totalRequests: count(),
				successCount: sql<number>`count(*) filter (where ${schema.aiUsageLog.status} = 'success')`,
				avgLatency: avg(schema.aiUsageLog.durationMs),
			})
			.from(schema.aiUsageLog)
			.where(whereClause)
			.groupBy(schema.aiUsageLog.feature)
			.orderBy(desc(count()));

		// Interview session completion and scores (if available)
		const interviewConditions: SQL[] = [];
		if (options?.userId) {
			interviewConditions.push(eq(schema.interviewSession.userId, options.userId));
		}
		if (options?.startDate) {
			interviewConditions.push(gte(schema.interviewSession.createdAt, options.startDate));
		}
		if (options?.endDate) {
			interviewConditions.push(lt(schema.interviewSession.createdAt, options.endDate));
		}

		const interviewWhereClause = interviewConditions.length > 0 ? and(...interviewConditions) : undefined;

		const [interviewStats] = await db
			.select({
				totalSessions: count(),
				completedSessions: sql<number>`count(*) filter (where ${schema.interviewSession.status} = 'completed')`,
				avgScore: avg(schema.interviewSession.overallScore),
				avgCompletionRate: sql<number>`avg(case when total_questions > 0 then (completed_questions::float / total_questions) * 100 else 0 end)`,
			})
			.from(schema.interviewSession)
			.where(interviewWhereClause);

		const overallSuccessRate =
			Number(overallStats.totalRequests) > 0
				? Math.round((Number(overallStats.successCount) / Number(overallStats.totalRequests)) * 100)
				: 0;

		return {
			overall: {
				totalRequests: Number(overallStats.totalRequests),
				successCount: Number(overallStats.successCount) || 0,
				errorCount: Number(overallStats.errorCount) || 0,
				quotaExceededCount: Number(overallStats.quotaExceededCount) || 0,
				successRate: overallSuccessRate,
			},
			byFeature: qualityByFeature.map((f) => ({
				feature: f.feature,
				totalRequests: Number(f.totalRequests),
				successCount: Number(f.successCount) || 0,
				successRate:
					Number(f.totalRequests) > 0 ? Math.round((Number(f.successCount) / Number(f.totalRequests)) * 100) : 0,
				avgLatency: Math.round(Number(f.avgLatency) || 0),
			})),
			interviews: {
				totalSessions: Number(interviewStats.totalSessions),
				completedSessions: Number(interviewStats.completedSessions) || 0,
				completionRate:
					Number(interviewStats.totalSessions) > 0
						? Math.round((Number(interviewStats.completedSessions) / Number(interviewStats.totalSessions)) * 100)
						: 0,
				avgScore: Math.round(Number(interviewStats.avgScore) || 0),
				avgCompletionRate: Math.round(Number(interviewStats.avgCompletionRate) || 0),
			},
		};
	},

	/**
	 * Get student progress metrics - learning velocity, skill improvements
	 */
	async getStudentProgressMetrics(options?: { userId?: string; startDate?: Date; endDate?: Date }) {
		const conditions: SQL[] = [];

		if (options?.userId) {
			conditions.push(eq(schema.learningPath.userId, options.userId));
		}
		if (options?.startDate) {
			conditions.push(gte(schema.learningPath.createdAt, options.startDate));
		}
		if (options?.endDate) {
			conditions.push(lt(schema.learningPath.createdAt, options.endDate));
		}

		const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

		// Learning path progress
		const [learningStats] = await db
			.select({
				totalPaths: count(),
				completedPaths: sql<number>`count(*) filter (where ${schema.learningPath.status} = 'completed')`,
				inProgressPaths: sql<number>`count(*) filter (where ${schema.learningPath.status} = 'in_progress')`,
				avgProgress: avg(schema.learningPath.progress),
			})
			.from(schema.learningPath)
			.where(whereClause);

		// Skill progress
		const skillConditions: SQL[] = [];
		if (options?.userId) {
			skillConditions.push(eq(schema.skillProgress.userId, options.userId));
		}
		if (options?.startDate) {
			skillConditions.push(gte(schema.skillProgress.createdAt, options.startDate));
		}
		if (options?.endDate) {
			skillConditions.push(lt(schema.skillProgress.createdAt, options.endDate));
		}

		const skillWhereClause = skillConditions.length > 0 ? and(...skillConditions) : undefined;

		const skillStats = await db
			.select({
				category: schema.skillProgress.category,
				totalSkills: count(),
				avgProgress: avg(schema.skillProgress.progress),
				avgCurrentLevel: avg(schema.skillProgress.currentLevel),
				avgTargetLevel: avg(schema.skillProgress.targetLevel),
				totalHoursInvested: sum(schema.skillProgress.hoursInvested),
			})
			.from(schema.skillProgress)
			.where(skillWhereClause)
			.groupBy(schema.skillProgress.category);

		// Interview progress
		const interviewConditions: SQL[] = [];
		if (options?.userId) {
			interviewConditions.push(eq(schema.interviewSession.userId, options.userId));
		}
		if (options?.startDate) {
			interviewConditions.push(gte(schema.interviewSession.createdAt, options.startDate));
		}
		if (options?.endDate) {
			interviewConditions.push(lt(schema.interviewSession.createdAt, options.endDate));
		}

		const interviewWhereClause = interviewConditions.length > 0 ? and(...interviewConditions) : undefined;

		const [interviewProgress] = await db
			.select({
				totalSessions: count(),
				completedSessions: sql<number>`count(*) filter (where ${schema.interviewSession.status} = 'completed')`,
				avgScore: avg(schema.interviewSession.overallScore),
			})
			.from(schema.interviewSession)
			.where(interviewWhereClause);

		// Training interest progress
		const trainingConditions: SQL[] = [];
		if (options?.userId) {
			trainingConditions.push(eq(schema.userTrainingInterests.userId, options.userId));
		}
		if (options?.startDate) {
			trainingConditions.push(gte(schema.userTrainingInterests.createdAt, options.startDate));
		}
		if (options?.endDate) {
			trainingConditions.push(lt(schema.userTrainingInterests.createdAt, options.endDate));
		}

		const trainingWhereClause = trainingConditions.length > 0 ? and(...trainingConditions) : undefined;

		const [trainingProgress] = await db
			.select({
				totalInterests: count(),
				inProgress: sql<number>`count(*) filter (where ${schema.userTrainingInterests.status} = 'in_progress')`,
				completed: sql<number>`count(*) filter (where ${schema.userTrainingInterests.status} = 'completed')`,
			})
			.from(schema.userTrainingInterests)
			.where(trainingWhereClause);

		return {
			learning: {
				totalPaths: Number(learningStats.totalPaths),
				completedPaths: Number(learningStats.completedPaths) || 0,
				inProgressPaths: Number(learningStats.inProgressPaths) || 0,
				avgProgress: Math.round(Number(learningStats.avgProgress) || 0),
				completionRate:
					Number(learningStats.totalPaths) > 0
						? Math.round((Number(learningStats.completedPaths) / Number(learningStats.totalPaths)) * 100)
						: 0,
			},
			skills: {
				byCategory: skillStats.map((s) => ({
					category: s.category,
					totalSkills: Number(s.totalSkills),
					avgProgress: Math.round(Number(s.avgProgress) || 0),
					avgCurrentLevel: Math.round((Number(s.avgCurrentLevel) || 0) * 10) / 10,
					avgTargetLevel: Math.round((Number(s.avgTargetLevel) || 0) * 10) / 10,
					totalHoursInvested: Number(s.totalHoursInvested) || 0,
				})),
				totalHoursInvested: skillStats.reduce((sum, s) => sum + (Number(s.totalHoursInvested) || 0), 0),
			},
			interviews: {
				totalSessions: Number(interviewProgress.totalSessions),
				completedSessions: Number(interviewProgress.completedSessions) || 0,
				avgScore: Math.round(Number(interviewProgress.avgScore) || 0),
			},
			training: {
				totalInterests: Number(trainingProgress.totalInterests),
				inProgress: Number(trainingProgress.inProgress) || 0,
				completed: Number(trainingProgress.completed) || 0,
			},
		};
	},

	/**
	 * Get predictive insights - forecast usage, identify at-risk students
	 */
	async getPredictiveInsights(_options?: { startDate?: Date; endDate?: Date }) {
		const last30Days = new Date();
		last30Days.setDate(last30Days.getDate() - 30);

		const last7Days = new Date();
		last7Days.setDate(last7Days.getDate() - 7);

		// Usage trend for prediction
		const usageTrend = await db
			.select({
				date: sql<string>`date(${schema.aiUsageLog.createdAt})`,
				requestCount: count(),
				tokenCount: sum(schema.aiUsageLog.totalTokens),
				uniqueUsers: sql<number>`count(distinct ${schema.aiUsageLog.userId})`,
			})
			.from(schema.aiUsageLog)
			.where(gte(schema.aiUsageLog.createdAt, last30Days))
			.groupBy(sql`date(${schema.aiUsageLog.createdAt})`)
			.orderBy(sql`date(${schema.aiUsageLog.createdAt})`);

		// Calculate growth rate (simple linear)
		const recentData = usageTrend.slice(-7);
		const olderData = usageTrend.slice(-14, -7);

		const recentAvg = recentData.reduce((sum, d) => sum + Number(d.requestCount), 0) / Math.max(recentData.length, 1);
		const olderAvg = olderData.reduce((sum, d) => sum + Number(d.requestCount), 0) / Math.max(olderData.length, 1);

		const growthRate = olderAvg > 0 ? Math.round(((recentAvg - olderAvg) / olderAvg) * 100) : 0;

		// Forecast next 7 days (simple linear projection)
		const dailyGrowth = growthRate / 7 / 100;
		const forecastedUsage: Array<{ date: string; predictedRequests: number }> = [];
		let lastValue = recentAvg;

		for (let i = 1; i <= 7; i++) {
			const date = new Date();
			date.setDate(date.getDate() + i);
			lastValue = lastValue * (1 + dailyGrowth);
			forecastedUsage.push({
				date: date.toISOString().split("T")[0],
				predictedRequests: Math.round(lastValue),
			});
		}

		// Identify at-risk students (low engagement)
		// Students who have used AI features but haven't in the last 7 days
		const activeUsersLast30 = await db
			.selectDistinct({ userId: schema.aiUsageLog.userId })
			.from(schema.aiUsageLog)
			.where(gte(schema.aiUsageLog.createdAt, last30Days));

		const activeUsersLast7 = await db
			.selectDistinct({ userId: schema.aiUsageLog.userId })
			.from(schema.aiUsageLog)
			.where(gte(schema.aiUsageLog.createdAt, last7Days));

		const activeUserIds7 = new Set(activeUsersLast7.map((u) => u.userId));
		const atRiskUserIds = activeUsersLast30.filter((u) => !activeUserIds7.has(u.userId)).map((u) => u.userId);

		// Get details of at-risk users
		let atRiskUsers: Array<{ userId: string; userName: string; email: string; lastActivity: Date | null }> = [];

		if (atRiskUserIds.length > 0) {
			const users = await db
				.select({
					userId: schema.user.id,
					userName: schema.user.name,
					email: schema.user.email,
					lastActivity: sql<Date>`max(${schema.aiUsageLog.createdAt})`,
				})
				.from(schema.user)
				.innerJoin(schema.aiUsageLog, eq(schema.user.id, schema.aiUsageLog.userId))
				.where(sql`${schema.user.id} = ANY(${atRiskUserIds})`)
				.groupBy(schema.user.id, schema.user.name, schema.user.email)
				.orderBy(sql`max(${schema.aiUsageLog.createdAt})`);

			atRiskUsers = users.map((u) => ({
				userId: u.userId,
				userName: u.userName,
				email: u.email,
				lastActivity: u.lastActivity,
			}));
		}

		// High engagement users (top performers)
		const highEngagementUsers = await db
			.select({
				userId: schema.aiUsageLog.userId,
				userName: schema.user.name,
				requestCount: count(),
				tokenCount: sum(schema.aiUsageLog.totalTokens),
			})
			.from(schema.aiUsageLog)
			.innerJoin(schema.user, eq(schema.aiUsageLog.userId, schema.user.id))
			.where(gte(schema.aiUsageLog.createdAt, last7Days))
			.groupBy(schema.aiUsageLog.userId, schema.user.name)
			.orderBy(desc(count()))
			.limit(10);

		// Determine trend as literal type
		const trend: "increasing" | "decreasing" | "stable" =
			growthRate > 5 ? "increasing" : growthRate < -5 ? "decreasing" : "stable";

		return {
			usageTrend: usageTrend.map((t) => ({
				date: t.date,
				requestCount: Number(t.requestCount),
				tokenCount: Number(t.tokenCount) || 0,
				uniqueUsers: Number(t.uniqueUsers) || 0,
			})),
			forecast: {
				growthRate,
				trend,
				predictedUsage: forecastedUsage,
			},
			engagement: {
				activeUsersLast30: activeUsersLast30.length,
				activeUsersLast7: activeUsersLast7.length,
				retentionRate:
					activeUsersLast30.length > 0 ? Math.round((activeUsersLast7.length / activeUsersLast30.length) * 100) : 0,
				atRiskCount: atRiskUserIds.length,
				atRiskUsers: atRiskUsers.slice(0, 10),
				highEngagementUsers: highEngagementUsers.map((u) => ({
					userId: u.userId,
					userName: u.userName,
					requestCount: Number(u.requestCount),
					tokenCount: Number(u.tokenCount) || 0,
				})),
			},
		};
	},

	/**
	 * Generate export data for reports
	 */
	async generateExportData(options: {
		userId?: string;
		startDate: Date;
		endDate: Date;
		sections: Array<"performance" | "features" | "costs" | "quality" | "progress" | "predictions">;
	}) {
		const data: Record<string, unknown> = {
			exportedAt: new Date().toISOString(),
			dateRange: {
				start: options.startDate.toISOString(),
				end: options.endDate.toISOString(),
			},
		};

		if (options.sections.includes("performance")) {
			data.modelPerformance = await this.getModelPerformanceMetrics(options);
		}

		if (options.sections.includes("features")) {
			data.featureUsage = await this.getFeatureUsageMatrix(options);
		}

		if (options.sections.includes("costs")) {
			data.costAnalysis = await this.getCostAnalysis(options);
		}

		if (options.sections.includes("quality")) {
			data.qualityScores = await this.getQualityScores(options);
		}

		if (options.sections.includes("progress")) {
			data.studentProgress = await this.getStudentProgressMetrics(options);
		}

		if (options.sections.includes("predictions") && !options.userId) {
			data.predictiveInsights = await this.getPredictiveInsights(options);
		}

		return data;
	},
};
