import { and, count, desc, eq, gte, lte, sql } from "drizzle-orm";
import { schema } from "@/integrations/drizzle";
import { db } from "@/integrations/drizzle/client";
import type { UserActivityCategory, UserActivityType } from "@/integrations/drizzle/schema";
import { generateId } from "@/utils/string";

// ============================================
// Types
// ============================================

export type LogActivityInput = {
	userId: string;
	type: UserActivityType;
	category: UserActivityCategory;
	resourceId?: string;
	resourceType?: string;
	metadata?: Record<string, unknown>;
};

export type GetRecentInput = {
	userId: string;
	limit?: number;
};

export type GetByCategoryInput = {
	userId: string;
	category: UserActivityCategory;
	startDate?: Date;
	endDate?: Date;
	limit?: number;
	offset?: number;
};

export type GetStatsInput = {
	userId: string;
	startDate?: Date;
	endDate?: Date;
};

export type GetDailyActivityInput = {
	userId: string;
	days: number;
};

export type ActivityRecord = {
	id: string;
	userId: string;
	activityType: string;
	category: string;
	resourceId: string | null;
	resourceType: string | null;
	metadata: Record<string, unknown> | null;
	createdAt: Date;
};

export type ActivityStats = {
	totalActivities: number;
	byCategory: { category: string; count: number }[];
	byType: { type: string; count: number }[];
	mostActiveDay: string | null;
	averagePerDay: number;
};

export type DailyActivity = {
	date: string;
	count: number;
	byCategory: { category: string; count: number }[];
};

// ============================================
// Service
// ============================================

export const userActivityService = {
	/**
	 * Log a new user activity
	 */
	log: async (input: LogActivityInput): Promise<string> => {
		const id = generateId();

		await db.insert(schema.userActivity).values({
			id,
			userId: input.userId,
			activityType: input.type,
			category: input.category,
			resourceId: input.resourceId,
			resourceType: input.resourceType,
			metadata: input.metadata,
		});

		return id;
	},

	/**
	 * Get recent activities for a user
	 */
	getRecent: async (input: GetRecentInput): Promise<ActivityRecord[]> => {
		const limit = input.limit ?? 20;

		const activities = await db
			.select()
			.from(schema.userActivity)
			.where(eq(schema.userActivity.userId, input.userId))
			.orderBy(desc(schema.userActivity.createdAt))
			.limit(limit);

		return activities;
	},

	/**
	 * Get activities by category with optional date filtering
	 */
	getByCategory: async (input: GetByCategoryInput): Promise<ActivityRecord[]> => {
		const conditions = [eq(schema.userActivity.userId, input.userId), eq(schema.userActivity.category, input.category)];

		if (input.startDate) {
			conditions.push(gte(schema.userActivity.createdAt, input.startDate));
		}

		if (input.endDate) {
			conditions.push(lte(schema.userActivity.createdAt, input.endDate));
		}

		const activities = await db
			.select()
			.from(schema.userActivity)
			.where(and(...conditions))
			.orderBy(desc(schema.userActivity.createdAt))
			.limit(input.limit ?? 50)
			.offset(input.offset ?? 0);

		return activities;
	},

	/**
	 * Get aggregate statistics for user activities
	 */
	getStats: async (input: GetStatsInput): Promise<ActivityStats> => {
		const conditions = [eq(schema.userActivity.userId, input.userId)];

		if (input.startDate) {
			conditions.push(gte(schema.userActivity.createdAt, input.startDate));
		}

		if (input.endDate) {
			conditions.push(lte(schema.userActivity.createdAt, input.endDate));
		}

		const whereClause = and(...conditions);

		// Get total count
		const [totalResult] = await db.select({ count: count() }).from(schema.userActivity).where(whereClause);

		const totalActivities = totalResult?.count ?? 0;

		// Get counts by category
		const byCategory = await db
			.select({
				category: schema.userActivity.category,
				count: count(),
			})
			.from(schema.userActivity)
			.where(whereClause)
			.groupBy(schema.userActivity.category)
			.orderBy(desc(count()));

		// Get counts by type
		const byType = await db
			.select({
				type: schema.userActivity.activityType,
				count: count(),
			})
			.from(schema.userActivity)
			.where(whereClause)
			.groupBy(schema.userActivity.activityType)
			.orderBy(desc(count()))
			.limit(10);

		// Get most active day
		const dailyCounts = await db
			.select({
				date: sql<string>`DATE(${schema.userActivity.createdAt})`.as("date"),
				count: count(),
			})
			.from(schema.userActivity)
			.where(whereClause)
			.groupBy(sql`DATE(${schema.userActivity.createdAt})`)
			.orderBy(desc(count()))
			.limit(1);

		const mostActiveDay = dailyCounts[0]?.date ?? null;

		// Calculate days in range
		let daysInRange = 30; // Default
		if (input.startDate && input.endDate) {
			daysInRange = Math.max(
				1,
				Math.ceil((input.endDate.getTime() - input.startDate.getTime()) / (1000 * 60 * 60 * 24)),
			);
		}

		const averagePerDay = totalActivities / daysInRange;

		return {
			totalActivities,
			byCategory: byCategory.map((c) => ({ category: c.category, count: c.count })),
			byType: byType.map((t) => ({ type: t.type, count: t.count })),
			mostActiveDay,
			averagePerDay,
		};
	},

	/**
	 * Get daily activity counts for charts
	 */
	getDailyActivity: async (input: GetDailyActivityInput): Promise<DailyActivity[]> => {
		const startDate = new Date();
		startDate.setDate(startDate.getDate() - input.days);
		startDate.setHours(0, 0, 0, 0);

		// Get daily counts
		const dailyCounts = await db
			.select({
				date: sql<string>`DATE(${schema.userActivity.createdAt})`.as("date"),
				count: count(),
			})
			.from(schema.userActivity)
			.where(and(eq(schema.userActivity.userId, input.userId), gte(schema.userActivity.createdAt, startDate)))
			.groupBy(sql`DATE(${schema.userActivity.createdAt})`)
			.orderBy(sql`DATE(${schema.userActivity.createdAt})`);

		// Get daily counts by category
		const dailyByCategory = await db
			.select({
				date: sql<string>`DATE(${schema.userActivity.createdAt})`.as("date"),
				category: schema.userActivity.category,
				count: count(),
			})
			.from(schema.userActivity)
			.where(and(eq(schema.userActivity.userId, input.userId), gte(schema.userActivity.createdAt, startDate)))
			.groupBy(sql`DATE(${schema.userActivity.createdAt})`, schema.userActivity.category)
			.orderBy(sql`DATE(${schema.userActivity.createdAt})`);

		// Build daily activity with categories
		const dailyMap = new Map<string, DailyActivity>();

		// Initialize all days in range
		for (let i = 0; i < input.days; i++) {
			const date = new Date(startDate);
			date.setDate(date.getDate() + i);
			const dateStr = date.toISOString().split("T")[0];
			dailyMap.set(dateStr, { date: dateStr, count: 0, byCategory: [] });
		}

		// Fill in counts
		for (const row of dailyCounts) {
			const existing = dailyMap.get(row.date);
			if (existing) {
				existing.count = row.count;
			}
		}

		// Fill in category breakdowns
		for (const row of dailyByCategory) {
			const existing = dailyMap.get(row.date);
			if (existing) {
				existing.byCategory.push({ category: row.category, count: row.count });
			}
		}

		return Array.from(dailyMap.values());
	},

	/**
	 * Delete an activity record (for admin/cleanup purposes)
	 */
	delete: async (input: { id: string; userId: string }): Promise<void> => {
		await db
			.delete(schema.userActivity)
			.where(and(eq(schema.userActivity.id, input.id), eq(schema.userActivity.userId, input.userId)));
	},

	/**
	 * Delete all activities for a user (cleanup/GDPR)
	 */
	deleteAll: async (input: { userId: string }): Promise<void> => {
		await db.delete(schema.userActivity).where(eq(schema.userActivity.userId, input.userId));
	},

	/**
	 * Get activity count for today
	 */
	getTodayCount: async (userId: string): Promise<number> => {
		const today = new Date();
		today.setHours(0, 0, 0, 0);

		const [result] = await db
			.select({ count: count() })
			.from(schema.userActivity)
			.where(and(eq(schema.userActivity.userId, userId), gte(schema.userActivity.createdAt, today)));

		return result?.count ?? 0;
	},

	/**
	 * Get activity count for this week
	 */
	getWeekCount: async (userId: string): Promise<number> => {
		const weekStart = new Date();
		weekStart.setDate(weekStart.getDate() - 7);
		weekStart.setHours(0, 0, 0, 0);

		const [result] = await db
			.select({ count: count() })
			.from(schema.userActivity)
			.where(and(eq(schema.userActivity.userId, userId), gte(schema.userActivity.createdAt, weekStart)));

		return result?.count ?? 0;
	},
};
