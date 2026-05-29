import type { SQL } from "drizzle-orm";
import { and, count, desc, eq, gte, sql, sum } from "drizzle-orm";
import { db } from "@/integrations/drizzle/client";
import * as schema from "@/integrations/drizzle/schema";

const GLOBAL_SETTINGS_ID = "global";

export const aiQuotaService = {
	// Global Settings Management
	globalSettings: {
		async get() {
			const [settings] = await db
				.select()
				.from(schema.aiGlobalSettings)
				.where(eq(schema.aiGlobalSettings.id, GLOBAL_SETTINGS_ID));

			if (!settings) {
				// Return default settings if none exist
				return {
					id: GLOBAL_SETTINGS_ID,
					maxDailyRequests: 10000,
					maxMonthlyRequests: 100000,
					maxDailyTokens: 10000000,
					maxMonthlyTokens: 100000000,
					alertThresholdPercent: 80,
					suspendOnExceed: false,
					defaultLanguage: "fr",
					allowedLanguages: ["fr", "ar", "en", "darija"],
					isActive: true,
					createdAt: new Date(),
					updatedAt: new Date(),
				};
			}

			return settings;
		},

		async update(input: {
			maxDailyRequests?: number;
			maxMonthlyRequests?: number;
			maxDailyTokens?: number;
			maxMonthlyTokens?: number;
			alertThresholdPercent?: number;
			suspendOnExceed?: boolean;
			defaultLanguage?: string;
			allowedLanguages?: string[];
			isActive?: boolean;
		}) {
			const existing = await db
				.select()
				.from(schema.aiGlobalSettings)
				.where(eq(schema.aiGlobalSettings.id, GLOBAL_SETTINGS_ID));

			if (existing.length === 0) {
				// Create new settings
				const [created] = await db
					.insert(schema.aiGlobalSettings)
					.values({
						id: GLOBAL_SETTINGS_ID,
						...input,
					})
					.returning();
				return created;
			}

			// Update existing settings
			const [updated] = await db
				.update(schema.aiGlobalSettings)
				.set(input)
				.where(eq(schema.aiGlobalSettings.id, GLOBAL_SETTINGS_ID))
				.returning();

			return updated;
		},
	},

	// Check global quota limits before user quota
	async checkGlobalQuota() {
		const settings = await aiQuotaService.globalSettings.get();

		if (!settings.isActive) {
			return {
				allowed: true,
				globalLimitsActive: false,
			};
		}

		const startOfDay = new Date();
		startOfDay.setHours(0, 0, 0, 0);

		const startOfMonth = new Date();
		startOfMonth.setDate(1);
		startOfMonth.setHours(0, 0, 0, 0);

		// Get daily global stats
		const [dailyStats] = await db
			.select({
				requests: count(),
				tokens: sum(schema.aiUsageLog.totalTokens),
			})
			.from(schema.aiUsageLog)
			.where(and(gte(schema.aiUsageLog.createdAt, startOfDay), sql`${schema.aiUsageLog.status} != 'quota_exceeded'`));

		// Get monthly global stats
		const [monthlyStats] = await db
			.select({
				requests: count(),
				tokens: sum(schema.aiUsageLog.totalTokens),
			})
			.from(schema.aiUsageLog)
			.where(and(gte(schema.aiUsageLog.createdAt, startOfMonth), sql`${schema.aiUsageLog.status} != 'quota_exceeded'`));

		const dailyRequests = Number(dailyStats.requests);
		const monthlyRequests = Number(monthlyStats.requests);
		const dailyTokens = Number(dailyStats.tokens) || 0;
		const monthlyTokens = Number(monthlyStats.tokens) || 0;

		const maxDailyRequests = settings.maxDailyRequests ?? 10000;
		const maxMonthlyRequests = settings.maxMonthlyRequests ?? 100000;
		const maxDailyTokens = settings.maxDailyTokens ?? 10000000;
		const maxMonthlyTokens = settings.maxMonthlyTokens ?? 100000000;

		// Check if we're at alert threshold
		const alertThreshold = (settings.alertThresholdPercent ?? 80) / 100;
		const dailyRequestsPercent = dailyRequests / maxDailyRequests;
		const monthlyRequestsPercent = monthlyRequests / maxMonthlyRequests;
		const dailyTokensPercent = dailyTokens / maxDailyTokens;
		const monthlyTokensPercent = monthlyTokens / maxMonthlyTokens;

		const isAtAlert =
			dailyRequestsPercent >= alertThreshold ||
			monthlyRequestsPercent >= alertThreshold ||
			dailyTokensPercent >= alertThreshold ||
			monthlyTokensPercent >= alertThreshold;

		// Check if any limit exceeded
		const dailyRequestsExceeded = dailyRequests >= maxDailyRequests;
		const monthlyRequestsExceeded = monthlyRequests >= maxMonthlyRequests;
		const dailyTokensExceeded = dailyTokens >= maxDailyTokens;
		const monthlyTokensExceeded = monthlyTokens >= maxMonthlyTokens;

		const limitExceeded =
			dailyRequestsExceeded || monthlyRequestsExceeded || dailyTokensExceeded || monthlyTokensExceeded;

		// If suspendOnExceed is true and limit is exceeded, deny access
		if (settings.suspendOnExceed && limitExceeded) {
			let reason = "Global quota limit exceeded";
			if (dailyRequestsExceeded) reason = "Global daily request limit exceeded";
			else if (monthlyRequestsExceeded) reason = "Global monthly request limit exceeded";
			else if (dailyTokensExceeded) reason = "Global daily token limit exceeded";
			else if (monthlyTokensExceeded) reason = "Global monthly token limit exceeded";

			return {
				allowed: false,
				globalLimitsActive: true,
				reason,
				usage: {
					daily: { requests: dailyRequests, tokens: dailyTokens },
					monthly: { requests: monthlyRequests, tokens: monthlyTokens },
				},
				limits: {
					daily: { requests: maxDailyRequests, tokens: maxDailyTokens },
					monthly: { requests: maxMonthlyRequests, tokens: maxMonthlyTokens },
				},
				percentUsed: {
					dailyRequests: Math.round(dailyRequestsPercent * 100),
					monthlyRequests: Math.round(monthlyRequestsPercent * 100),
					dailyTokens: Math.round(dailyTokensPercent * 100),
					monthlyTokens: Math.round(monthlyTokensPercent * 100),
				},
				isAtAlert,
			};
		}

		return {
			allowed: true,
			globalLimitsActive: true,
			usage: {
				daily: { requests: dailyRequests, tokens: dailyTokens },
				monthly: { requests: monthlyRequests, tokens: monthlyTokens },
			},
			limits: {
				daily: { requests: maxDailyRequests, tokens: maxDailyTokens },
				monthly: { requests: maxMonthlyRequests, tokens: maxMonthlyTokens },
			},
			percentUsed: {
				dailyRequests: Math.round(dailyRequestsPercent * 100),
				monthlyRequests: Math.round(monthlyRequestsPercent * 100),
				dailyTokens: Math.round(dailyTokensPercent * 100),
				monthlyTokens: Math.round(monthlyTokensPercent * 100),
			},
			isAtAlert,
		};
	},

	// Get global usage statistics
	async getGlobalUsageStats() {
		const settings = await aiQuotaService.globalSettings.get();

		const startOfDay = new Date();
		startOfDay.setHours(0, 0, 0, 0);

		const startOfMonth = new Date();
		startOfMonth.setDate(1);
		startOfMonth.setHours(0, 0, 0, 0);

		// Get daily stats
		const [dailyStats] = await db
			.select({
				requests: count(),
				tokens: sum(schema.aiUsageLog.totalTokens),
				successCount: sql<number>`count(*) filter (where ${schema.aiUsageLog.status} = 'success')`,
				errorCount: sql<number>`count(*) filter (where ${schema.aiUsageLog.status} = 'error')`,
				quotaExceededCount: sql<number>`count(*) filter (where ${schema.aiUsageLog.status} = 'quota_exceeded')`,
			})
			.from(schema.aiUsageLog)
			.where(gte(schema.aiUsageLog.createdAt, startOfDay));

		// Get monthly stats
		const [monthlyStats] = await db
			.select({
				requests: count(),
				tokens: sum(schema.aiUsageLog.totalTokens),
				successCount: sql<number>`count(*) filter (where ${schema.aiUsageLog.status} = 'success')`,
				errorCount: sql<number>`count(*) filter (where ${schema.aiUsageLog.status} = 'error')`,
				quotaExceededCount: sql<number>`count(*) filter (where ${schema.aiUsageLog.status} = 'quota_exceeded')`,
			})
			.from(schema.aiUsageLog)
			.where(gte(schema.aiUsageLog.createdAt, startOfMonth));

		// Get unique users today and this month
		const [dailyUsers] = await db
			.select({
				count: sql<number>`count(distinct ${schema.aiUsageLog.userId})`,
			})
			.from(schema.aiUsageLog)
			.where(gte(schema.aiUsageLog.createdAt, startOfDay));

		const [monthlyUsers] = await db
			.select({
				count: sql<number>`count(distinct ${schema.aiUsageLog.userId})`,
			})
			.from(schema.aiUsageLog)
			.where(gte(schema.aiUsageLog.createdAt, startOfMonth));

		const maxDailyRequests = settings.maxDailyRequests ?? 10000;
		const maxMonthlyRequests = settings.maxMonthlyRequests ?? 100000;
		const maxDailyTokens = settings.maxDailyTokens ?? 10000000;
		const maxMonthlyTokens = settings.maxMonthlyTokens ?? 100000000;

		return {
			settings: {
				maxDailyRequests,
				maxMonthlyRequests,
				maxDailyTokens,
				maxMonthlyTokens,
				alertThresholdPercent: settings.alertThresholdPercent ?? 80,
				suspendOnExceed: settings.suspendOnExceed ?? false,
				defaultLanguage: settings.defaultLanguage ?? "fr",
				allowedLanguages: settings.allowedLanguages ?? ["fr", "ar", "en", "darija"],
				isActive: settings.isActive,
			},
			daily: {
				requests: Number(dailyStats.requests),
				tokens: Number(dailyStats.tokens) || 0,
				successCount: Number(dailyStats.successCount) || 0,
				errorCount: Number(dailyStats.errorCount) || 0,
				quotaExceededCount: Number(dailyStats.quotaExceededCount) || 0,
				uniqueUsers: Number(dailyUsers.count) || 0,
				requestsPercent: Math.round((Number(dailyStats.requests) / maxDailyRequests) * 100),
				tokensPercent: Math.round(((Number(dailyStats.tokens) || 0) / maxDailyTokens) * 100),
			},
			monthly: {
				requests: Number(monthlyStats.requests),
				tokens: Number(monthlyStats.tokens) || 0,
				successCount: Number(monthlyStats.successCount) || 0,
				errorCount: Number(monthlyStats.errorCount) || 0,
				quotaExceededCount: Number(monthlyStats.quotaExceededCount) || 0,
				uniqueUsers: Number(monthlyUsers.count) || 0,
				requestsPercent: Math.round((Number(monthlyStats.requests) / maxMonthlyRequests) * 100),
				tokensPercent: Math.round(((Number(monthlyStats.tokens) || 0) / maxMonthlyTokens) * 100),
			},
		};
	},

	plans: {
		async list() {
			return db.select().from(schema.aiUsageQuota).orderBy(desc(schema.aiUsageQuota.createdAt));
		},

		async getById(id: string) {
			const [plan] = await db.select().from(schema.aiUsageQuota).where(eq(schema.aiUsageQuota.id, id));

			return plan ?? null;
		},

		async getDefault() {
			const [plan] = await db
				.select()
				.from(schema.aiUsageQuota)
				.where(and(eq(schema.aiUsageQuota.isDefault, true), eq(schema.aiUsageQuota.isActive, true)));

			return plan ?? null;
		},

		async create(input: {
			name: string;
			description?: string;
			dailyRequestLimit?: number;
			monthlyRequestLimit?: number;
			maxTokensPerRequest?: number;
			dailyTokenLimit?: number;
			monthlyTokenLimit?: number;
			allowedFeatures?: string[];
			isDefault?: boolean;
			isActive?: boolean;
		}) {
			if (input.isDefault) {
				await db.update(schema.aiUsageQuota).set({ isDefault: false }).where(eq(schema.aiUsageQuota.isDefault, true));
			}

			const [plan] = await db.insert(schema.aiUsageQuota).values(input).returning();

			return plan;
		},

		async update(
			id: string,
			input: {
				name?: string;
				description?: string;
				dailyRequestLimit?: number;
				monthlyRequestLimit?: number;
				maxTokensPerRequest?: number;
				dailyTokenLimit?: number;
				monthlyTokenLimit?: number;
				allowedFeatures?: string[];
				isDefault?: boolean;
				isActive?: boolean;
			},
		) {
			if (input.isDefault) {
				await db.update(schema.aiUsageQuota).set({ isDefault: false }).where(eq(schema.aiUsageQuota.isDefault, true));
			}

			const [plan] = await db.update(schema.aiUsageQuota).set(input).where(eq(schema.aiUsageQuota.id, id)).returning();

			return plan ?? null;
		},

		async delete(id: string) {
			const [assignment] = await db
				.select({ count: count() })
				.from(schema.userAiQuota)
				.where(eq(schema.userAiQuota.quotaId, id));

			if (Number(assignment.count) > 0) {
				throw new Error("Cannot delete quota plan with assigned users");
			}

			const [deleted] = await db.delete(schema.aiUsageQuota).where(eq(schema.aiUsageQuota.id, id)).returning();

			return deleted ?? null;
		},
	},

	assignments: {
		async getByUserId(userId: string) {
			const [assignment] = await db
				.select()
				.from(schema.userAiQuota)
				.innerJoin(schema.aiUsageQuota, eq(schema.userAiQuota.quotaId, schema.aiUsageQuota.id))
				.where(eq(schema.userAiQuota.userId, userId));

			if (!assignment) return null;

			return {
				...assignment.user_ai_quota,
				plan: assignment.ai_usage_quota,
			};
		},

		async assign(input: {
			userId: string;
			quotaId: string;
			assignedBy?: string;
			overrides?: {
				dailyRequestLimit?: number;
				monthlyRequestLimit?: number;
				dailyTokenLimit?: number;
				monthlyTokenLimit?: number;
			};
			notes?: string;
		}) {
			const [assignment] = await db
				.insert(schema.userAiQuota)
				.values({
					userId: input.userId,
					quotaId: input.quotaId,
					assignedBy: input.assignedBy,
					overrideDailyRequestLimit: input.overrides?.dailyRequestLimit,
					overrideMonthlyRequestLimit: input.overrides?.monthlyRequestLimit,
					overrideDailyTokenLimit: input.overrides?.dailyTokenLimit,
					overrideMonthlyTokenLimit: input.overrides?.monthlyTokenLimit,
					notes: input.notes,
				})
				.onConflictDoUpdate({
					target: schema.userAiQuota.userId,
					set: {
						quotaId: input.quotaId,
						assignedBy: input.assignedBy,
						overrideDailyRequestLimit: input.overrides?.dailyRequestLimit,
						overrideMonthlyRequestLimit: input.overrides?.monthlyRequestLimit,
						overrideDailyTokenLimit: input.overrides?.dailyTokenLimit,
						overrideMonthlyTokenLimit: input.overrides?.monthlyTokenLimit,
						notes: input.notes,
						assignedAt: new Date(),
					},
				})
				.returning();

			return assignment;
		},

		async remove(userId: string) {
			const [removed] = await db.delete(schema.userAiQuota).where(eq(schema.userAiQuota.userId, userId)).returning();

			return removed ?? null;
		},

		async listByPlan(quotaId: string) {
			return db.select().from(schema.userAiQuota).where(eq(schema.userAiQuota.quotaId, quotaId));
		},
	},

	async checkQuota(userId: string, feature: string, role?: string) {
		if (role === "admin") {
			return {
				allowed: true,
				remaining: { dailyRequests: -1, monthlyRequests: -1, dailyTokens: -1, monthlyTokens: -1 },
			};
		}

		const assignment = await aiQuotaService.assignments.getByUserId(userId);
		let plan: typeof schema.aiUsageQuota.$inferSelect | null = null;

		if (assignment) {
			plan = assignment.plan;
		} else {
			plan = await aiQuotaService.plans.getDefault();
		}

		if (!plan) {
			return {
				allowed: true,
				remaining: {
					dailyRequests: -1,
					monthlyRequests: -1,
					dailyTokens: -1,
					monthlyTokens: -1,
				},
			};
		}

		if (plan.allowedFeatures.length > 0 && !plan.allowedFeatures.includes(feature)) {
			return {
				allowed: false,
				reason: `Feature "${feature}" is not allowed under your quota plan`,
				remaining: {
					dailyRequests: 0,
					monthlyRequests: 0,
					dailyTokens: 0,
					monthlyTokens: 0,
				},
			};
		}

		const startOfDay = new Date();
		startOfDay.setHours(0, 0, 0, 0);

		const startOfMonth = new Date();
		startOfMonth.setDate(1);
		startOfMonth.setHours(0, 0, 0, 0);

		const [dailyStats] = await db
			.select({
				requests: count(),
				tokens: sum(schema.aiUsageLog.totalTokens),
			})
			.from(schema.aiUsageLog)
			.where(
				and(
					eq(schema.aiUsageLog.userId, userId),
					gte(schema.aiUsageLog.createdAt, startOfDay),
					sql`${schema.aiUsageLog.status} != 'quota_exceeded'`,
				),
			);

		const [monthlyStats] = await db
			.select({
				requests: count(),
				tokens: sum(schema.aiUsageLog.totalTokens),
			})
			.from(schema.aiUsageLog)
			.where(
				and(
					eq(schema.aiUsageLog.userId, userId),
					gte(schema.aiUsageLog.createdAt, startOfMonth),
					sql`${schema.aiUsageLog.status} != 'quota_exceeded'`,
				),
			);

		const dailyRequestLimit = assignment?.overrideDailyRequestLimit || plan.dailyRequestLimit;
		const monthlyRequestLimit = assignment?.overrideMonthlyRequestLimit || plan.monthlyRequestLimit;
		const dailyTokenLimit = assignment?.overrideDailyTokenLimit || plan.dailyTokenLimit;
		const monthlyTokenLimit = assignment?.overrideMonthlyTokenLimit || plan.monthlyTokenLimit;

		const dailyRequests = Number(dailyStats.requests);
		const monthlyRequests = Number(monthlyStats.requests);
		const dailyTokens = Number(dailyStats.tokens) || 0;
		const monthlyTokens = Number(monthlyStats.tokens) || 0;

		const remainingDailyRequests = dailyRequestLimit - dailyRequests;
		const remainingMonthlyRequests = monthlyRequestLimit - monthlyRequests;
		const remainingDailyTokens = dailyTokenLimit - dailyTokens;
		const remainingMonthlyTokens = monthlyTokenLimit - monthlyTokens;

		const nextMidnight = new Date();
		nextMidnight.setHours(24, 0, 0, 0);

		const nextMonth = new Date();
		nextMonth.setMonth(nextMonth.getMonth() + 1, 1);
		nextMonth.setHours(0, 0, 0, 0);

		if (remainingDailyRequests <= 0) {
			return {
				allowed: false,
				reason: "Daily request limit exceeded",
				resetAt: nextMidnight.toISOString(),
				limit: dailyRequestLimit,
				remaining: {
					dailyRequests: 0,
					monthlyRequests: Math.max(0, remainingMonthlyRequests),
					dailyTokens: Math.max(0, remainingDailyTokens),
					monthlyTokens: Math.max(0, remainingMonthlyTokens),
				},
			};
		}

		if (remainingMonthlyRequests <= 0) {
			return {
				allowed: false,
				reason: "Monthly request limit exceeded",
				resetAt: nextMonth.toISOString(),
				limit: monthlyRequestLimit,
				remaining: {
					dailyRequests: Math.max(0, remainingDailyRequests),
					monthlyRequests: 0,
					dailyTokens: Math.max(0, remainingDailyTokens),
					monthlyTokens: Math.max(0, remainingMonthlyTokens),
				},
			};
		}

		if (remainingDailyTokens <= 0) {
			return {
				allowed: false,
				reason: "Daily token limit exceeded",
				resetAt: nextMidnight.toISOString(),
				limit: dailyTokenLimit,
				remaining: {
					dailyRequests: Math.max(0, remainingDailyRequests),
					monthlyRequests: Math.max(0, remainingMonthlyRequests),
					dailyTokens: 0,
					monthlyTokens: Math.max(0, remainingMonthlyTokens),
				},
			};
		}

		if (remainingMonthlyTokens <= 0) {
			return {
				allowed: false,
				reason: "Monthly token limit exceeded",
				resetAt: nextMonth.toISOString(),
				limit: monthlyTokenLimit,
				remaining: {
					dailyRequests: Math.max(0, remainingDailyRequests),
					monthlyRequests: Math.max(0, remainingMonthlyRequests),
					dailyTokens: Math.max(0, remainingDailyTokens),
					monthlyTokens: 0,
				},
			};
		}

		return {
			allowed: true,
			remaining: {
				dailyRequests: remainingDailyRequests,
				monthlyRequests: remainingMonthlyRequests,
				dailyTokens: remainingDailyTokens,
				monthlyTokens: remainingMonthlyTokens,
			},
		};
	},

	async getUserUsage(userId: string, period: "day" | "month") {
		const startDate = new Date();
		if (period === "day") {
			startDate.setHours(0, 0, 0, 0);
		} else {
			startDate.setDate(1);
			startDate.setHours(0, 0, 0, 0);
		}

		const [totals] = await db
			.select({
				requests: count(),
				tokens: sum(schema.aiUsageLog.totalTokens),
			})
			.from(schema.aiUsageLog)
			.where(and(eq(schema.aiUsageLog.userId, userId), gte(schema.aiUsageLog.createdAt, startDate)));

		const byFeature = await db
			.select({
				feature: schema.aiUsageLog.feature,
				count: count(),
				tokens: sum(schema.aiUsageLog.totalTokens),
			})
			.from(schema.aiUsageLog)
			.where(and(eq(schema.aiUsageLog.userId, userId), gte(schema.aiUsageLog.createdAt, startDate)))
			.groupBy(schema.aiUsageLog.feature);

		return {
			requests: Number(totals.requests),
			tokens: Number(totals.tokens) || 0,
			byFeature: byFeature.map((row) => ({
				feature: row.feature,
				count: Number(row.count),
				tokens: Number(row.tokens) || 0,
			})),
		};
	},

	async logUsage(input: {
		userId: string;
		feature: string;
		providerId?: string;
		provider: string;
		model: string;
		inputTokens?: number;
		outputTokens?: number;
		totalTokens?: number;
		status: "success" | "error" | "quota_exceeded";
		errorMessage?: string;
		durationMs?: number;
	}) {
		const [log] = await db
			.insert(schema.aiUsageLog)
			.values({
				userId: input.userId,
				feature: input.feature,
				providerId: input.providerId,
				provider: input.provider,
				model: input.model,
				inputTokens: input.inputTokens,
				outputTokens: input.outputTokens,
				totalTokens: input.totalTokens,
				status: input.status,
				errorMessage: input.errorMessage,
				durationMs: input.durationMs,
			})
			.returning();

		return log;
	},

	async getDetailedStats(userId?: string) {
		const last30Days = new Date();
		last30Days.setDate(last30Days.getDate() - 30);

		const buildCondition = (extraConditions?: SQL[]) => {
			const conditions = [];
			if (userId) {
				conditions.push(eq(schema.aiUsageLog.userId, userId));
			}
			conditions.push(gte(schema.aiUsageLog.createdAt, last30Days));
			if (extraConditions) {
				conditions.push(...extraConditions);
			}
			return conditions.length > 0 ? and(...conditions) : undefined;
		};

		// By feature
		const byFeature = await db
			.select({
				feature: schema.aiUsageLog.feature,
				count: count(),
				tokens: sum(schema.aiUsageLog.totalTokens),
				avgDuration: sql<number>`avg(${schema.aiUsageLog.durationMs})`,
			})
			.from(schema.aiUsageLog)
			.where(buildCondition())
			.groupBy(schema.aiUsageLog.feature)
			.orderBy(desc(count()));

		// By status
		const byStatus = await db
			.select({
				status: schema.aiUsageLog.status,
				count: count(),
			})
			.from(schema.aiUsageLog)
			.where(buildCondition())
			.groupBy(schema.aiUsageLog.status);

		// By day (last 30 days)
		const byDay = await db
			.select({
				date: sql<string>`date(${schema.aiUsageLog.createdAt})`,
				count: count(),
				tokens: sum(schema.aiUsageLog.totalTokens),
			})
			.from(schema.aiUsageLog)
			.where(buildCondition())
			.groupBy(sql`date(${schema.aiUsageLog.createdAt})`)
			.orderBy(sql`date(${schema.aiUsageLog.createdAt})`);

		// By provider
		const byProvider = await db
			.select({
				provider: schema.aiUsageLog.provider,
				model: schema.aiUsageLog.model,
				count: count(),
				tokens: sum(schema.aiUsageLog.totalTokens),
			})
			.from(schema.aiUsageLog)
			.where(buildCondition())
			.groupBy(schema.aiUsageLog.provider, schema.aiUsageLog.model)
			.orderBy(desc(count()));

		// Recent errors
		const recentErrors = await db
			.select({
				feature: schema.aiUsageLog.feature,
				errorMessage: schema.aiUsageLog.errorMessage,
				createdAt: schema.aiUsageLog.createdAt,
			})
			.from(schema.aiUsageLog)
			.where(buildCondition([eq(schema.aiUsageLog.status, "error")]))
			.orderBy(desc(schema.aiUsageLog.createdAt))
			.limit(10);

		return {
			byFeature: byFeature.map((row) => ({
				feature: row.feature,
				count: Number(row.count),
				tokens: Number(row.tokens) || 0,
				avgDurationMs: Math.round(Number(row.avgDuration) || 0),
			})),
			byStatus: byStatus.map((row) => ({
				status: row.status,
				count: Number(row.count),
			})),
			byDay: byDay.map((row) => ({
				date: row.date,
				count: Number(row.count),
				tokens: Number(row.tokens) || 0,
			})),
			byProvider: byProvider.map((row) => ({
				provider: row.provider,
				model: row.model,
				count: Number(row.count),
				tokens: Number(row.tokens) || 0,
			})),
			recentErrors: recentErrors.map((row) => ({
				feature: row.feature,
				errorMessage: row.errorMessage,
				createdAt: row.createdAt,
			})),
		};
	},

	async getUsageStats(userId?: string) {
		const startOfDay = new Date();
		startOfDay.setHours(0, 0, 0, 0);

		const startOfMonth = new Date();
		startOfMonth.setDate(1);
		startOfMonth.setHours(0, 0, 0, 0);

		const buildCondition = (since?: Date) => {
			const conditions = [];
			if (userId) {
				conditions.push(eq(schema.aiUsageLog.userId, userId));
			}
			if (since) {
				conditions.push(gte(schema.aiUsageLog.createdAt, since));
			}
			return conditions.length > 0 ? and(...conditions) : undefined;
		};

		const [todayStats] = await db
			.select({
				requests: count(),
				tokens: sum(schema.aiUsageLog.totalTokens),
			})
			.from(schema.aiUsageLog)
			.where(buildCondition(startOfDay));

		const [monthStats] = await db
			.select({
				requests: count(),
				tokens: sum(schema.aiUsageLog.totalTokens),
			})
			.from(schema.aiUsageLog)
			.where(buildCondition(startOfMonth));

		const [totalStats] = await db
			.select({
				requests: count(),
				tokens: sum(schema.aiUsageLog.totalTokens),
			})
			.from(schema.aiUsageLog)
			.where(buildCondition());

		return {
			today: {
				requests: Number(todayStats.requests),
				tokens: Number(todayStats.tokens) || 0,
			},
			month: {
				requests: Number(monthStats.requests),
				tokens: Number(monthStats.tokens) || 0,
			},
			total: {
				requests: Number(totalStats.requests),
				tokens: Number(totalStats.tokens) || 0,
			},
		};
	},
};
