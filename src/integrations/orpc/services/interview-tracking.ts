import { ORPCError } from "@orpc/client";
import { and, desc, eq, gte, lte, sql } from "drizzle-orm";
import { schema } from "@/integrations/drizzle";
import { db } from "@/integrations/drizzle/client";
import type { InterviewGoalOutcome, InterviewGoalPrepStatus } from "@/integrations/drizzle/schema";
import { generateId } from "@/utils/string";

// ============================================
// TYPES
// ============================================

export type CreatePerformanceInput = {
	userId: string;
	sessionId?: string;
	overallScore?: number;
	confidenceScore?: number;
	clarityScore?: number;
	relevanceScore?: number;
	technicalScore?: number;
	communicationScore?: number;
	strengths?: string[];
	improvements?: string[];
	aiAnalysis?: string;
};

export type UpdatePerformanceInput = {
	id: string;
	userId: string;
	overallScore?: number;
	confidenceScore?: number;
	clarityScore?: number;
	relevanceScore?: number;
	technicalScore?: number;
	communicationScore?: number;
	strengths?: string[];
	improvements?: string[];
	aiAnalysis?: string;
};

export type CreateGoalInput = {
	userId: string;
	targetRole?: string;
	targetCompany?: string;
	interviewDate?: Date;
	targetPracticeCount?: number;
	notes?: string;
};

export type UpdateGoalInput = {
	id: string;
	userId: string;
	targetRole?: string;
	targetCompany?: string;
	interviewDate?: Date;
	preparationStatus?: InterviewGoalPrepStatus;
	practiceCount?: number;
	targetPracticeCount?: number;
	notes?: string;
	completed?: boolean;
	outcome?: InterviewGoalOutcome;
};

export type PerformanceTrend = {
	date: string;
	overallScore: number;
	confidenceScore: number;
	clarityScore: number;
	relevanceScore: number;
	technicalScore: number;
	communicationScore: number;
};

export type ScoreBreakdown = {
	confidence: number;
	clarity: number;
	relevance: number;
	technical: number;
	communication: number;
};

export type PerformanceStatistics = {
	totalSessions: number;
	averageScore: number;
	scoreImprovement: number;
	bestCategory: string;
	worstCategory: string;
	recentTrend: "improving" | "stable" | "declining";
	practiceStreak: number;
};

export type GoalStatistics = {
	totalGoals: number;
	completedGoals: number;
	activeGoals: number;
	upcomingInterviews: number;
	averagePracticeCount: number;
	successRate: number;
};

// ============================================
// PERFORMANCE SERVICE
// ============================================

export const interviewTrackingService = {
	performance: {
		// Create a new performance record
		create: async (input: CreatePerformanceInput): Promise<string> => {
			const id = generateId();

			await db.insert(schema.interviewPerformance).values({
				id,
				userId: input.userId,
				sessionId: input.sessionId,
				overallScore: input.overallScore,
				confidenceScore: input.confidenceScore,
				clarityScore: input.clarityScore,
				relevanceScore: input.relevanceScore,
				technicalScore: input.technicalScore,
				communicationScore: input.communicationScore,
				strengths: input.strengths ?? [],
				improvements: input.improvements ?? [],
				aiAnalysis: input.aiAnalysis,
			});

			return id;
		},

		// Get performance by ID
		getById: async (input: { id: string; userId: string }) => {
			const [record] = await db
				.select()
				.from(schema.interviewPerformance)
				.where(and(eq(schema.interviewPerformance.id, input.id), eq(schema.interviewPerformance.userId, input.userId)));

			if (!record) {
				throw new ORPCError("NOT_FOUND", { message: "Performance record not found" });
			}

			return record;
		},

		// List performance records
		list: async (input: { userId: string; limit?: number; fromDate?: Date; toDate?: Date }) => {
			const conditions = [eq(schema.interviewPerformance.userId, input.userId)];

			if (input.fromDate) {
				conditions.push(gte(schema.interviewPerformance.createdAt, input.fromDate));
			}
			if (input.toDate) {
				conditions.push(lte(schema.interviewPerformance.createdAt, input.toDate));
			}

			const records = await db
				.select()
				.from(schema.interviewPerformance)
				.where(and(...conditions))
				.orderBy(desc(schema.interviewPerformance.createdAt))
				.limit(input.limit ?? 50);

			return records;
		},

		// Update performance record
		update: async (input: UpdatePerformanceInput): Promise<void> => {
			const [existing] = await db
				.select({ id: schema.interviewPerformance.id })
				.from(schema.interviewPerformance)
				.where(and(eq(schema.interviewPerformance.id, input.id), eq(schema.interviewPerformance.userId, input.userId)));

			if (!existing) {
				throw new ORPCError("NOT_FOUND", { message: "Performance record not found" });
			}

			await db
				.update(schema.interviewPerformance)
				.set({
					overallScore: input.overallScore,
					confidenceScore: input.confidenceScore,
					clarityScore: input.clarityScore,
					relevanceScore: input.relevanceScore,
					technicalScore: input.technicalScore,
					communicationScore: input.communicationScore,
					strengths: input.strengths,
					improvements: input.improvements,
					aiAnalysis: input.aiAnalysis,
				})
				.where(eq(schema.interviewPerformance.id, input.id));
		},

		// Delete performance record
		delete: async (input: { id: string; userId: string }): Promise<void> => {
			await db
				.delete(schema.interviewPerformance)
				.where(and(eq(schema.interviewPerformance.id, input.id), eq(schema.interviewPerformance.userId, input.userId)));
		},

		// Get performance trends over time
		getTrends: async (input: { userId: string; days?: number }): Promise<PerformanceTrend[]> => {
			const daysAgo = new Date();
			daysAgo.setDate(daysAgo.getDate() - (input.days ?? 30));

			const records = await db
				.select()
				.from(schema.interviewPerformance)
				.where(
					and(
						eq(schema.interviewPerformance.userId, input.userId),
						gte(schema.interviewPerformance.createdAt, daysAgo),
					),
				)
				.orderBy(schema.interviewPerformance.createdAt);

			return records.map((r) => ({
				date: r.createdAt.toISOString().split("T")[0],
				overallScore: r.overallScore ?? 0,
				confidenceScore: r.confidenceScore ?? 0,
				clarityScore: r.clarityScore ?? 0,
				relevanceScore: r.relevanceScore ?? 0,
				technicalScore: r.technicalScore ?? 0,
				communicationScore: r.communicationScore ?? 0,
			}));
		},

		// Get average score breakdown
		getScoreBreakdown: async (input: { userId: string }): Promise<ScoreBreakdown> => {
			const [result] = await db
				.select({
					avgConfidence: sql<number>`COALESCE(AVG(${schema.interviewPerformance.confidenceScore}), 0)::int`,
					avgClarity: sql<number>`COALESCE(AVG(${schema.interviewPerformance.clarityScore}), 0)::int`,
					avgRelevance: sql<number>`COALESCE(AVG(${schema.interviewPerformance.relevanceScore}), 0)::int`,
					avgTechnical: sql<number>`COALESCE(AVG(${schema.interviewPerformance.technicalScore}), 0)::int`,
					avgCommunication: sql<number>`COALESCE(AVG(${schema.interviewPerformance.communicationScore}), 0)::int`,
				})
				.from(schema.interviewPerformance)
				.where(eq(schema.interviewPerformance.userId, input.userId));

			return {
				confidence: result?.avgConfidence ?? 0,
				clarity: result?.avgClarity ?? 0,
				relevance: result?.avgRelevance ?? 0,
				technical: result?.avgTechnical ?? 0,
				communication: result?.avgCommunication ?? 0,
			};
		},

		// Get aggregated strengths and improvements
		getStrengthsAndImprovements: async (input: { userId: string }) => {
			const records = await db
				.select({
					strengths: schema.interviewPerformance.strengths,
					improvements: schema.interviewPerformance.improvements,
				})
				.from(schema.interviewPerformance)
				.where(eq(schema.interviewPerformance.userId, input.userId))
				.orderBy(desc(schema.interviewPerformance.createdAt))
				.limit(10);

			// Aggregate and count frequency
			const strengthsMap = new Map<string, number>();
			const improvementsMap = new Map<string, number>();

			for (const record of records) {
				const strengths = (record.strengths as string[]) ?? [];
				const improvements = (record.improvements as string[]) ?? [];

				for (const s of strengths) {
					strengthsMap.set(s, (strengthsMap.get(s) ?? 0) + 1);
				}
				for (const i of improvements) {
					improvementsMap.set(i, (improvementsMap.get(i) ?? 0) + 1);
				}
			}

			// Sort by frequency and return top items
			const sortedStrengths = Array.from(strengthsMap.entries())
				.sort((a, b) => b[1] - a[1])
				.slice(0, 5)
				.map(([text, count]) => ({ text, count }));

			const sortedImprovements = Array.from(improvementsMap.entries())
				.sort((a, b) => b[1] - a[1])
				.slice(0, 5)
				.map(([text, count]) => ({ text, count }));

			return {
				strengths: sortedStrengths,
				improvements: sortedImprovements,
			};
		},

		// Get performance statistics
		getStatistics: async (input: { userId: string }): Promise<PerformanceStatistics> => {
			const records = await db
				.select()
				.from(schema.interviewPerformance)
				.where(eq(schema.interviewPerformance.userId, input.userId))
				.orderBy(desc(schema.interviewPerformance.createdAt));

			if (records.length === 0) {
				return {
					totalSessions: 0,
					averageScore: 0,
					scoreImprovement: 0,
					bestCategory: "N/A",
					worstCategory: "N/A",
					recentTrend: "stable",
					practiceStreak: 0,
				};
			}

			// Calculate average score
			const avgScore = records.reduce((sum, r) => sum + (r.overallScore ?? 0), 0) / records.length;

			// Calculate improvement (compare first half to second half)
			const mid = Math.floor(records.length / 2);
			const recentAvg = records.slice(0, mid).reduce((sum, r) => sum + (r.overallScore ?? 0), 0) / Math.max(1, mid);
			const oldAvg =
				records.slice(mid).reduce((sum, r) => sum + (r.overallScore ?? 0), 0) / Math.max(1, records.length - mid);
			const improvement = recentAvg - oldAvg;

			// Find best and worst categories
			const categoryAvgs = {
				confidence: records.reduce((sum, r) => sum + (r.confidenceScore ?? 0), 0) / records.length,
				clarity: records.reduce((sum, r) => sum + (r.clarityScore ?? 0), 0) / records.length,
				relevance: records.reduce((sum, r) => sum + (r.relevanceScore ?? 0), 0) / records.length,
				technical: records.reduce((sum, r) => sum + (r.technicalScore ?? 0), 0) / records.length,
				communication: records.reduce((sum, r) => sum + (r.communicationScore ?? 0), 0) / records.length,
			};

			const categories = Object.entries(categoryAvgs);
			const best = categories.reduce((a, b) => (a[1] > b[1] ? a : b));
			const worst = categories.reduce((a, b) => (a[1] < b[1] ? a : b));

			// Determine trend
			let trend: "improving" | "stable" | "declining" = "stable";
			if (improvement > 5) trend = "improving";
			else if (improvement < -5) trend = "declining";

			// Calculate practice streak (consecutive days with practice)
			let streak = 0;
			const today = new Date();
			today.setHours(0, 0, 0, 0);
			const checkDate = new Date(today);

			for (const record of records) {
				const recordDate = new Date(record.createdAt);
				recordDate.setHours(0, 0, 0, 0);

				if (recordDate.getTime() === checkDate.getTime()) {
					streak++;
					checkDate.setDate(checkDate.getDate() - 1);
				} else if (recordDate.getTime() < checkDate.getTime()) {
					break;
				}
			}

			return {
				totalSessions: records.length,
				averageScore: Math.round(avgScore),
				scoreImprovement: Math.round(improvement),
				bestCategory: best[0],
				worstCategory: worst[0],
				recentTrend: trend,
				practiceStreak: streak,
			};
		},
	},

	// ============================================
	// GOALS SERVICE
	// ============================================

	goals: {
		// Create a new goal
		create: async (input: CreateGoalInput): Promise<string> => {
			const id = generateId();

			await db.insert(schema.interviewGoal).values({
				id,
				userId: input.userId,
				targetRole: input.targetRole,
				targetCompany: input.targetCompany,
				interviewDate: input.interviewDate,
				targetPracticeCount: input.targetPracticeCount ?? 10,
				notes: input.notes,
				preparationStatus: "not_started",
				practiceCount: 0,
				completed: false,
			});

			return id;
		},

		// Get goal by ID
		getById: async (input: { id: string; userId: string }) => {
			const [goal] = await db
				.select()
				.from(schema.interviewGoal)
				.where(and(eq(schema.interviewGoal.id, input.id), eq(schema.interviewGoal.userId, input.userId)));

			if (!goal) {
				throw new ORPCError("NOT_FOUND", { message: "Goal not found" });
			}

			return goal;
		},

		// List goals
		list: async (input: { userId: string; completed?: boolean; limit?: number }) => {
			const conditions = [eq(schema.interviewGoal.userId, input.userId)];

			if (input.completed !== undefined) {
				conditions.push(eq(schema.interviewGoal.completed, input.completed));
			}

			const goals = await db
				.select()
				.from(schema.interviewGoal)
				.where(and(...conditions))
				.orderBy(desc(schema.interviewGoal.createdAt))
				.limit(input.limit ?? 50);

			return goals;
		},

		// Update goal
		update: async (input: UpdateGoalInput): Promise<void> => {
			const [existing] = await db
				.select({ id: schema.interviewGoal.id })
				.from(schema.interviewGoal)
				.where(and(eq(schema.interviewGoal.id, input.id), eq(schema.interviewGoal.userId, input.userId)));

			if (!existing) {
				throw new ORPCError("NOT_FOUND", { message: "Goal not found" });
			}

			await db
				.update(schema.interviewGoal)
				.set({
					targetRole: input.targetRole,
					targetCompany: input.targetCompany,
					interviewDate: input.interviewDate,
					preparationStatus: input.preparationStatus,
					practiceCount: input.practiceCount,
					targetPracticeCount: input.targetPracticeCount,
					notes: input.notes,
					completed: input.completed,
					outcome: input.outcome,
				})
				.where(eq(schema.interviewGoal.id, input.id));
		},

		// Delete goal
		delete: async (input: { id: string; userId: string }): Promise<void> => {
			await db
				.delete(schema.interviewGoal)
				.where(and(eq(schema.interviewGoal.id, input.id), eq(schema.interviewGoal.userId, input.userId)));
		},

		// Increment practice count
		incrementPractice: async (input: { id: string; userId: string }): Promise<number> => {
			const [goal] = await db
				.select()
				.from(schema.interviewGoal)
				.where(and(eq(schema.interviewGoal.id, input.id), eq(schema.interviewGoal.userId, input.userId)));

			if (!goal) {
				throw new ORPCError("NOT_FOUND", { message: "Goal not found" });
			}

			const newCount = (goal.practiceCount ?? 0) + 1;
			let newStatus = goal.preparationStatus;

			// Auto-update status based on practice count
			if (newCount >= 1 && goal.preparationStatus === "not_started") {
				newStatus = "practicing";
			}
			if (newCount >= (goal.targetPracticeCount ?? 10)) {
				newStatus = "ready";
			}

			await db
				.update(schema.interviewGoal)
				.set({
					practiceCount: newCount,
					preparationStatus: newStatus,
				})
				.where(eq(schema.interviewGoal.id, input.id));

			return newCount;
		},

		// Get goal statistics
		getStatistics: async (input: { userId: string }): Promise<GoalStatistics> => {
			const goals = await db.select().from(schema.interviewGoal).where(eq(schema.interviewGoal.userId, input.userId));

			const completed = goals.filter((g) => g.completed);
			const active = goals.filter((g) => !g.completed);
			const upcoming = active.filter((g) => {
				if (!g.interviewDate) return false;
				const date = new Date(g.interviewDate);
				const now = new Date();
				const weekFromNow = new Date();
				weekFromNow.setDate(weekFromNow.getDate() + 14);
				return date >= now && date <= weekFromNow;
			});

			const avgPractice =
				goals.length > 0 ? goals.reduce((sum, g) => sum + (g.practiceCount ?? 0), 0) / goals.length : 0;

			// Calculate success rate from completed goals with outcomes
			const withOutcome = completed.filter((g) => g.outcome);
			const offered = withOutcome.filter((g) => g.outcome === "offered");
			const successRate = withOutcome.length > 0 ? (offered.length / withOutcome.length) * 100 : 0;

			return {
				totalGoals: goals.length,
				completedGoals: completed.length,
				activeGoals: active.length,
				upcomingInterviews: upcoming.length,
				averagePracticeCount: Math.round(avgPractice),
				successRate: Math.round(successRate),
			};
		},

		// Get upcoming interviews
		getUpcoming: async (input: { userId: string; days?: number }) => {
			const now = new Date();
			const futureDate = new Date();
			futureDate.setDate(futureDate.getDate() + (input.days ?? 14));

			return await db
				.select()
				.from(schema.interviewGoal)
				.where(
					and(
						eq(schema.interviewGoal.userId, input.userId),
						eq(schema.interviewGoal.completed, false),
						gte(schema.interviewGoal.interviewDate, now),
						lte(schema.interviewGoal.interviewDate, futureDate),
					),
				)
				.orderBy(schema.interviewGoal.interviewDate);
		},
	},

	// ============================================
	// AI ANALYSIS SERVICE
	// ============================================

	aiAnalysis: {
		// Generate AI tips based on performance
		generateTips: async (input: { userId: string }): Promise<string[]> => {
			const stats = await interviewTrackingService.performance.getStatistics({
				userId: input.userId,
			});
			const breakdown = await interviewTrackingService.performance.getScoreBreakdown({
				userId: input.userId,
			});
			const { strengths, improvements } = await interviewTrackingService.performance.getStrengthsAndImprovements({
				userId: input.userId,
			});

			const tips: string[] = [];

			// Generate tips based on weakest areas
			if (breakdown.confidence < 60) {
				tips.push(
					"Pratiquez vos reponses a voix haute pour gagner en confiance. L'enregistrement video peut vous aider a identifier les points a ameliorer.",
				);
			}
			if (breakdown.clarity < 60) {
				tips.push("Structure your answers using the STAR method (Situation, Task, Action, Result) for better clarity.");
			}
			if (breakdown.relevance < 60) {
				tips.push(
					"Before each interview, study the job description and prepare specific examples that match the required skills.",
				);
			}
			if (breakdown.technical < 60) {
				tips.push(
					"Review key technical concepts in your field. Prepare concrete examples of technical projects you have completed.",
				);
			}
			if (breakdown.communication < 60) {
				tips.push(
					"Work on eye contact, speech pace, and active listening. Don't hesitate to ask for clarification if needed.",
				);
			}

			// Add tips based on improvements needed
			if (improvements.length > 0) {
				tips.push(
					`Focus on these frequently identified areas for improvement: ${improvements
						.slice(0, 3)
						.map((i) => i.text)
						.join(", ")}.`,
				);
			}

			// Add encouragement based on strengths
			if (strengths.length > 0) {
				tips.push(
					`Keep building on your strengths: ${strengths
						.slice(0, 3)
						.map((s) => s.text)
						.join(", ")}.`,
				);
			}

			// Add tips based on trend
			if (stats.recentTrend === "improving") {
				tips.push(
					"Excellent! Your progress is showing. Keep up this positive momentum by continuing to practice regularly.",
				);
			} else if (stats.recentTrend === "declining") {
				tips.push(
					"Your recent scores are declining. Take time to review the basics and focus on quality over quantity.",
				);
			}

			// Add practice recommendations
			if (stats.practiceStreak < 3) {
				tips.push(
					"Try to maintain daily practice to build a routine. Even 15 minutes a day can make a big difference.",
				);
			}

			return tips.slice(0, 6); // Return max 6 tips
		},

		// Get comprehensive performance summary
		getPerformanceSummary: async (input: { userId: string }) => {
			const [stats, breakdown, strengthsImprovements, trends, goalStats] = await Promise.all([
				interviewTrackingService.performance.getStatistics({ userId: input.userId }),
				interviewTrackingService.performance.getScoreBreakdown({ userId: input.userId }),
				interviewTrackingService.performance.getStrengthsAndImprovements({
					userId: input.userId,
				}),
				interviewTrackingService.performance.getTrends({ userId: input.userId, days: 30 }),
				interviewTrackingService.goals.getStatistics({ userId: input.userId }),
			]);

			const tips = await interviewTrackingService.aiAnalysis.generateTips({
				userId: input.userId,
			});

			return {
				statistics: stats,
				scoreBreakdown: breakdown,
				strengths: strengthsImprovements.strengths,
				improvements: strengthsImprovements.improvements,
				trends,
				goalStatistics: goalStats,
				recommendations: tips,
			};
		},
	},
};
