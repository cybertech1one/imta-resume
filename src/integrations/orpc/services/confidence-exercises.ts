import { and, desc, eq } from "drizzle-orm";
import { schema } from "@/integrations/drizzle";
import { db } from "@/integrations/drizzle/client";
import type { ConfidenceExerciseCategory } from "@/integrations/drizzle/schema";
import { generateId } from "@/utils/string";

export type DailyRoutineItem = {
	id: string;
	exerciseId: string;
	scheduledTime: string | null;
	order: number;
	completed: boolean;
};

export type ExerciseStats = {
	totalCompleted: number;
	streak: number;
	lastCompletedDate: string | null;
	categoryProgress: Record<ConfidenceExerciseCategory, number>;
};

// Helper to format date as YYYY-MM-DD
function formatDate(date: Date): string {
	return date.toISOString().split("T")[0];
}

// Helper to get yesterday's date string
function getYesterdayDateString(): string {
	const yesterday = new Date();
	yesterday.setDate(yesterday.getDate() - 1);
	return formatDate(yesterday);
}

export const confidenceExercisesService = {
	// Get or create stats for a user
	getOrCreateStats: async (userId: string): Promise<ExerciseStats> => {
		const [stats] = await db
			.select()
			.from(schema.confidenceExerciseStats)
			.where(eq(schema.confidenceExerciseStats.userId, userId))
			.limit(1);

		if (stats) {
			return {
				totalCompleted: stats.totalCompleted,
				streak: stats.streak,
				lastCompletedDate: stats.lastCompletedDate,
				categoryProgress: stats.categoryProgress,
			};
		}

		// Create new stats record
		const defaultStats: ExerciseStats = {
			totalCompleted: 0,
			streak: 0,
			lastCompletedDate: null,
			categoryProgress: {
				breathing: 0,
				affirmations: 0,
				power_poses: 0,
				visualization: 0,
				anxiety_management: 0,
			},
		};

		await db.insert(schema.confidenceExerciseStats).values({
			id: generateId(),
			userId,
			...defaultStats,
		});

		return defaultStats;
	},

	// Get completed exercises for today
	getCompletedToday: async (userId: string): Promise<string[]> => {
		const today = formatDate(new Date());

		const completed = await db
			.select({ exerciseId: schema.confidenceCompletedExercise.exerciseId })
			.from(schema.confidenceCompletedExercise)
			.where(
				and(
					eq(schema.confidenceCompletedExercise.userId, userId),
					eq(schema.confidenceCompletedExercise.completedDate, today),
				),
			);

		return completed.map((c) => c.exerciseId);
	},

	// Complete an exercise
	completeExercise: async (
		userId: string,
		exerciseId: string,
		category: ConfidenceExerciseCategory,
	): Promise<ExerciseStats> => {
		const today = formatDate(new Date());

		// Check if already completed today
		const [existing] = await db
			.select()
			.from(schema.confidenceCompletedExercise)
			.where(
				and(
					eq(schema.confidenceCompletedExercise.userId, userId),
					eq(schema.confidenceCompletedExercise.exerciseId, exerciseId),
					eq(schema.confidenceCompletedExercise.completedDate, today),
				),
			)
			.limit(1);

		if (existing) {
			// Already completed today, just return current stats
			return await confidenceExercisesService.getOrCreateStats(userId);
		}

		// Insert completion record
		await db.insert(schema.confidenceCompletedExercise).values({
			id: generateId(),
			userId,
			exerciseId,
			completedDate: today,
		});

		// Update stats
		const stats = await confidenceExercisesService.getOrCreateStats(userId);
		const newCategoryProgress = { ...stats.categoryProgress };
		newCategoryProgress[category] = (newCategoryProgress[category] || 0) + 1;

		// Calculate new streak
		let newStreak = stats.streak;
		const yesterday = getYesterdayDateString();

		if (stats.lastCompletedDate !== today) {
			if (stats.lastCompletedDate === yesterday) {
				// Continuing streak
				newStreak = stats.streak + 1;
			} else if (stats.lastCompletedDate !== today) {
				// Starting new streak
				newStreak = 1;
			}
		}

		const newStats: ExerciseStats = {
			totalCompleted: stats.totalCompleted + 1,
			streak: newStreak,
			lastCompletedDate: today,
			categoryProgress: newCategoryProgress,
		};

		await db
			.update(schema.confidenceExerciseStats)
			.set({
				totalCompleted: newStats.totalCompleted,
				streak: newStats.streak,
				lastCompletedDate: newStats.lastCompletedDate,
				categoryProgress: newStats.categoryProgress,
			})
			.where(eq(schema.confidenceExerciseStats.userId, userId));

		return newStats;
	},

	// Get daily routine
	getDailyRoutine: async (userId: string): Promise<DailyRoutineItem[]> => {
		const routineItems = await db
			.select()
			.from(schema.confidenceDailyRoutineItem)
			.where(eq(schema.confidenceDailyRoutineItem.userId, userId))
			.orderBy(schema.confidenceDailyRoutineItem.order);

		// Get completed exercises for today
		const completedToday = await confidenceExercisesService.getCompletedToday(userId);

		return routineItems.map((item) => ({
			id: item.id,
			exerciseId: item.exerciseId,
			scheduledTime: item.scheduledTime,
			order: item.order,
			completed: completedToday.includes(item.exerciseId),
		}));
	},

	// Add exercise to routine
	addToRoutine: async (userId: string, exerciseId: string, scheduledTime?: string): Promise<DailyRoutineItem> => {
		// Check if already in routine
		const [existing] = await db
			.select()
			.from(schema.confidenceDailyRoutineItem)
			.where(
				and(
					eq(schema.confidenceDailyRoutineItem.userId, userId),
					eq(schema.confidenceDailyRoutineItem.exerciseId, exerciseId),
				),
			)
			.limit(1);

		if (existing) {
			throw new Error("Exercise is already in your routine");
		}

		// Get max order
		const items = await db
			.select({ order: schema.confidenceDailyRoutineItem.order })
			.from(schema.confidenceDailyRoutineItem)
			.where(eq(schema.confidenceDailyRoutineItem.userId, userId))
			.orderBy(desc(schema.confidenceDailyRoutineItem.order))
			.limit(1);

		const newOrder = items.length > 0 ? items[0].order + 1 : 0;

		const id = generateId();
		await db.insert(schema.confidenceDailyRoutineItem).values({
			id,
			userId,
			exerciseId,
			scheduledTime: scheduledTime || null,
			order: newOrder,
		});

		// Check if completed today
		const completedToday = await confidenceExercisesService.getCompletedToday(userId);

		return {
			id,
			exerciseId,
			scheduledTime: scheduledTime || null,
			order: newOrder,
			completed: completedToday.includes(exerciseId),
		};
	},

	// Remove exercise from routine
	removeFromRoutine: async (userId: string, exerciseId: string): Promise<void> => {
		await db
			.delete(schema.confidenceDailyRoutineItem)
			.where(
				and(
					eq(schema.confidenceDailyRoutineItem.userId, userId),
					eq(schema.confidenceDailyRoutineItem.exerciseId, exerciseId),
				),
			);
	},

	// Update routine item order
	updateRoutineOrder: async (userId: string, exerciseId: string, newOrder: number): Promise<void> => {
		await db
			.update(schema.confidenceDailyRoutineItem)
			.set({ order: newOrder })
			.where(
				and(
					eq(schema.confidenceDailyRoutineItem.userId, userId),
					eq(schema.confidenceDailyRoutineItem.exerciseId, exerciseId),
				),
			);
	},

	// Clear routine
	clearRoutine: async (userId: string): Promise<void> => {
		await db.delete(schema.confidenceDailyRoutineItem).where(eq(schema.confidenceDailyRoutineItem.userId, userId));
	},

	// Check if exercise is completed today
	isCompletedToday: async (userId: string, exerciseId: string): Promise<boolean> => {
		const today = formatDate(new Date());

		const [existing] = await db
			.select({ id: schema.confidenceCompletedExercise.id })
			.from(schema.confidenceCompletedExercise)
			.where(
				and(
					eq(schema.confidenceCompletedExercise.userId, userId),
					eq(schema.confidenceCompletedExercise.exerciseId, exerciseId),
					eq(schema.confidenceCompletedExercise.completedDate, today),
				),
			)
			.limit(1);

		return !!existing;
	},
};
