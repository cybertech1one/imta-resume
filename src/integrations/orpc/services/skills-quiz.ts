import { ORPCError } from "@orpc/client";
import { and, desc, eq } from "drizzle-orm";
import { schema } from "@/integrations/drizzle";
import { db } from "@/integrations/drizzle/client";
import type { SkillBreakdown, SkillsQuizCategory, SkillsQuizLevel } from "@/integrations/drizzle/schema";
import { generateId } from "@/utils/string";

export type CreateQuizResultInput = {
	userId: string;
	category: SkillsQuizCategory;
	totalQuestions: number;
	correctAnswers: number;
	score: number;
	level: SkillsQuizLevel;
	timeSpent: number;
	skillBreakdown: SkillBreakdown;
	badges: string[];
};

export type QuizResultOutput = {
	id: string;
	userId: string;
	category: SkillsQuizCategory;
	totalQuestions: number;
	correctAnswers: number;
	score: number;
	level: SkillsQuizLevel;
	timeSpent: number;
	skillBreakdown: SkillBreakdown;
	badges: string[];
	createdAt: Date;
};

export const skillsQuizService = {
	// Create a new quiz result
	create: async (input: CreateQuizResultInput): Promise<string> => {
		const id = generateId();

		await db.insert(schema.skillsQuizResult).values({
			id,
			userId: input.userId,
			category: input.category,
			totalQuestions: input.totalQuestions,
			correctAnswers: input.correctAnswers,
			score: input.score,
			level: input.level,
			timeSpent: input.timeSpent,
			skillBreakdown: input.skillBreakdown,
			badges: input.badges,
		});

		return id;
	},

	// Get quiz result by ID
	getById: async (input: { id: string; userId: string }): Promise<QuizResultOutput> => {
		const [result] = await db
			.select()
			.from(schema.skillsQuizResult)
			.where(and(eq(schema.skillsQuizResult.id, input.id), eq(schema.skillsQuizResult.userId, input.userId)));

		if (!result) {
			throw new ORPCError("NOT_FOUND", { message: "Quiz result not found" });
		}

		return {
			id: result.id,
			userId: result.userId,
			category: result.category,
			totalQuestions: result.totalQuestions,
			correctAnswers: result.correctAnswers,
			score: result.score,
			level: result.level,
			timeSpent: result.timeSpent,
			skillBreakdown: result.skillBreakdown,
			badges: result.badges,
			createdAt: result.createdAt,
		};
	},

	// List all quiz results for a user
	list: async (input: { userId: string; category?: SkillsQuizCategory }): Promise<QuizResultOutput[]> => {
		const conditions = [eq(schema.skillsQuizResult.userId, input.userId)];

		if (input.category) {
			conditions.push(eq(schema.skillsQuizResult.category, input.category));
		}

		const results = await db
			.select()
			.from(schema.skillsQuizResult)
			.where(and(...conditions))
			.orderBy(desc(schema.skillsQuizResult.createdAt));

		return results.map((result) => ({
			id: result.id,
			userId: result.userId,
			category: result.category,
			totalQuestions: result.totalQuestions,
			correctAnswers: result.correctAnswers,
			score: result.score,
			level: result.level,
			timeSpent: result.timeSpent,
			skillBreakdown: result.skillBreakdown,
			badges: result.badges,
			createdAt: result.createdAt,
		}));
	},

	// Delete a quiz result
	delete: async (input: { id: string; userId: string }): Promise<void> => {
		await db
			.delete(schema.skillsQuizResult)
			.where(and(eq(schema.skillsQuizResult.id, input.id), eq(schema.skillsQuizResult.userId, input.userId)));
	},

	// Get statistics for user's quiz results
	getStatistics: async (input: { userId: string }) => {
		const results = await db
			.select()
			.from(schema.skillsQuizResult)
			.where(eq(schema.skillsQuizResult.userId, input.userId));

		const total = results.length;
		const byCategory: Record<string, number> = {};
		const byLevel: Record<string, number> = {};
		const allBadges = new Set<string>();
		let totalScore = 0;
		let totalTimeSpent = 0;

		// Best results per category
		const bestByCategory: Record<string, QuizResultOutput | null> = {
			technical: null,
			soft_skills: null,
			leadership: null,
		};

		for (const result of results) {
			// Count by category
			byCategory[result.category] = (byCategory[result.category] ?? 0) + 1;

			// Count by level
			byLevel[result.level] = (byLevel[result.level] ?? 0) + 1;

			// Collect badges
			for (const badge of result.badges) {
				allBadges.add(badge);
			}

			// Sum totals
			totalScore += result.score;
			totalTimeSpent += result.timeSpent;

			// Track best results per category
			if (!bestByCategory[result.category] || result.score > (bestByCategory[result.category]?.score ?? 0)) {
				bestByCategory[result.category] = {
					id: result.id,
					userId: result.userId,
					category: result.category,
					totalQuestions: result.totalQuestions,
					correctAnswers: result.correctAnswers,
					score: result.score,
					level: result.level,
					timeSpent: result.timeSpent,
					skillBreakdown: result.skillBreakdown,
					badges: result.badges,
					createdAt: result.createdAt,
				};
			}
		}

		return {
			total,
			byCategory,
			byLevel,
			badges: Array.from(allBadges),
			badgeCount: allBadges.size,
			averageScore: total > 0 ? Math.round(totalScore / total) : 0,
			totalTimeSpent,
			bestByCategory,
		};
	},
};
