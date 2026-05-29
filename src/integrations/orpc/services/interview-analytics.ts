import { and, avg, desc, eq, gte, sql } from "drizzle-orm";
import { db } from "@/integrations/drizzle/client";
import * as schema from "@/integrations/drizzle/schema";

// Types for analytics results
export type PerformanceMetrics = {
	overallScore: number;
	confidenceScore: number;
	clarityScore: number;
	relevanceScore: number;
	technicalScore: number;
	communicationScore: number;
	strengths: string[];
	weaknesses: string[];
	recommendations: string[];
	scoreBreakdown: {
		behavioral?: number;
		technical?: number;
		situational?: number;
		motivational?: number;
		general?: number;
	};
	trendDirection: "improving" | "stable" | "declining";
	sessionsAnalyzed: number;
};

export type PatternAnalysis = {
	commonMistakes: { pattern: string; frequency: number; severity: string }[];
	strengthPatterns: { pattern: string; frequency: number }[];
	weaknessPatterns: { pattern: string; frequency: number; suggestions: string[] }[];
	questionTypePerformance: { type: string; avgScore: number; count: number }[];
	fieldPerformance: { field: string; avgScore: number; count: number }[];
	timeOfDayPerformance: { timeSlot: string; avgScore: number; count: number }[];
};

export type ImprovementPlan = {
	userId: string;
	priorityAreas: { area: string; currentScore: number; targetScore: number; priority: "high" | "medium" | "low" }[];
	weeklyGoals: { week: number; goals: string[]; focusArea: string }[];
	recommendedResources: { title: string; type: string; url?: string; relevance: number }[];
	practiceSchedule: { day: string; activity: string; duration: number; focusArea: string }[];
	milestones: { milestone: string; targetDate: string; criteria: string }[];
	estimatedTimeToGoal: number; // in days
};

export type ImprovementTracking = {
	skillArea: string;
	previousScore: number;
	currentScore: number;
	improvementPercentage: number;
	trend: "improving" | "stable" | "declining";
	sessionsCount: number;
	timeframe: string;
};

export type BenchmarkComparison = {
	userScore: number;
	successfulCandidateAvg: number;
	percentile: number;
	gapsToClose: { area: string; userScore: number; targetScore: number; gap: number }[];
	strengthsAboveAverage: string[];
	areasNeedingImprovement: string[];
};

export type ReadinessScore = {
	overallReadiness: number;
	confidence: number;
	technicalPreparedness: number;
	behavioralReadiness: number;
	communicationSkills: number;
	readinessLevel: "not_ready" | "needs_practice" | "almost_ready" | "interview_ready";
	recommendations: string[];
	estimatedSessionsNeeded: number;
};

export const interviewAnalyticsService = {
	/**
	 * Deep AI analysis of interview performance for a specific session
	 */
	analyzePerformance: async (sessionId: string, userId: string): Promise<PerformanceMetrics> => {
		// Get the session and its analysis
		const [session] = await db
			.select()
			.from(schema.interviewSession)
			.where(and(eq(schema.interviewSession.id, sessionId), eq(schema.interviewSession.userId, userId)))
			.limit(1);

		if (!session) {
			throw new Error("Session not found");
		}

		// Get the analysis if it exists
		const [analysis] = await db
			.select()
			.from(schema.interviewAnalysis)
			.where(eq(schema.interviewAnalysis.sessionId, sessionId))
			.limit(1);

		// Get recent sessions for trend analysis
		const recentSessions = await db
			.select()
			.from(schema.interviewSession)
			.where(and(eq(schema.interviewSession.userId, userId), eq(schema.interviewSession.status, "completed")))
			.orderBy(desc(schema.interviewSession.completedAt))
			.limit(10);

		// Calculate trend direction
		let trendDirection: "improving" | "stable" | "declining" = "stable";
		if (recentSessions.length >= 3) {
			const recentScores = recentSessions.slice(0, 3).map((s) => s.overallScore || 0);
			const olderScores = recentSessions.slice(3, 6).map((s) => s.overallScore || 0);
			const recentAvg = recentScores.reduce((a, b) => a + b, 0) / recentScores.length;
			const olderAvg = olderScores.length > 0 ? olderScores.reduce((a, b) => a + b, 0) / olderScores.length : recentAvg;

			if (recentAvg > olderAvg + 5) trendDirection = "improving";
			else if (recentAvg < olderAvg - 5) trendDirection = "declining";
		}

		// Get performance metrics if exists
		const [performance] = await db
			.select()
			.from(schema.interviewPerformance)
			.where(eq(schema.interviewPerformance.sessionId, sessionId))
			.limit(1);

		// Extract evaluations from session
		const evaluations = (session.evaluations as schema.ResponseEvaluation[]) || [];
		const strengths = new Set<string>();
		const weaknesses = new Set<string>();

		for (const eval_ of evaluations) {
			for (const s of eval_.strengths ?? []) strengths.add(s);
			for (const w of eval_.areasForImprovement ?? []) weaknesses.add(w);
		}

		return {
			overallScore: session.overallScore || 0,
			confidenceScore: performance?.confidenceScore || 70,
			clarityScore: performance?.clarityScore || 70,
			relevanceScore: performance?.relevanceScore || 70,
			technicalScore: performance?.technicalScore || 70,
			communicationScore: performance?.communicationScore || 70,
			strengths: Array.from(strengths),
			weaknesses: Array.from(weaknesses),
			recommendations: analysis?.recommendations || [],
			scoreBreakdown: analysis?.scoreBreakdown || {},
			trendDirection,
			sessionsAnalyzed: recentSessions.length,
		};
	},

	/**
	 * Identify common patterns and mistakes across sessions
	 */
	identifyPatterns: async (userId: string): Promise<PatternAnalysis> => {
		// Get all completed sessions for the user
		const sessions = await db
			.select()
			.from(schema.interviewSession)
			.where(and(eq(schema.interviewSession.userId, userId), eq(schema.interviewSession.status, "completed")))
			.orderBy(desc(schema.interviewSession.completedAt))
			.limit(50);

		// Analyze patterns
		const mistakeFrequency: Record<string, { count: number; severity: string }> = {};
		const strengthFrequency: Record<string, number> = {};
		const weaknessFrequency: Record<string, { count: number; suggestions: string[] }> = {};
		const typePerformance: Record<string, { totalScore: number; count: number }> = {};
		const fieldPerformance: Record<string, { totalScore: number; count: number }> = {};

		for (const session of sessions) {
			const evaluations = (session.evaluations as schema.ResponseEvaluation[]) || [];
			const questions = (session.questions as schema.InterviewQuestion[]) || [];

			// Aggregate evaluations
			evaluations.forEach((eval_) => {
				// Track strengths
				eval_.strengths?.forEach((s) => {
					strengthFrequency[s] = (strengthFrequency[s] || 0) + 1;
				});

				// Track weaknesses
				eval_.areasForImprovement?.forEach((w) => {
					if (!weaknessFrequency[w]) {
						weaknessFrequency[w] = { count: 0, suggestions: [] };
					}
					weaknessFrequency[w].count++;
					if (eval_.suggestions) {
						weaknessFrequency[w].suggestions.push(...eval_.suggestions);
					}
				});

				// Track missed key points as mistakes
				eval_.keyPointsMissed?.forEach((m) => {
					if (!mistakeFrequency[m]) {
						mistakeFrequency[m] = { count: 0, severity: "minor" };
					}
					mistakeFrequency[m].count++;
					if (mistakeFrequency[m].count > 3) mistakeFrequency[m].severity = "major";
					if (mistakeFrequency[m].count > 5) mistakeFrequency[m].severity = "critical";
				});

				// Track performance by question type
				const question = questions.find((q) => q.id === eval_.questionId);
				if (question) {
					const type = question.type;
					if (!typePerformance[type]) {
						typePerformance[type] = { totalScore: 0, count: 0 };
					}
					typePerformance[type].totalScore += eval_.score;
					typePerformance[type].count++;
				}
			});

			// Track field performance
			const field = session.field;
			if (!fieldPerformance[field]) {
				fieldPerformance[field] = { totalScore: 0, count: 0 };
			}
			fieldPerformance[field].totalScore += session.overallScore || 0;
			fieldPerformance[field].count++;
		}

		return {
			commonMistakes: Object.entries(mistakeFrequency)
				.map(([pattern, data]) => ({
					pattern,
					frequency: data.count,
					severity: data.severity,
				}))
				.sort((a, b) => b.frequency - a.frequency)
				.slice(0, 10),
			strengthPatterns: Object.entries(strengthFrequency)
				.map(([pattern, frequency]) => ({ pattern, frequency }))
				.sort((a, b) => b.frequency - a.frequency)
				.slice(0, 10),
			weaknessPatterns: Object.entries(weaknessFrequency)
				.map(([pattern, data]) => ({
					pattern,
					frequency: data.count,
					suggestions: [...new Set(data.suggestions)].slice(0, 3),
				}))
				.sort((a, b) => b.frequency - a.frequency)
				.slice(0, 10),
			questionTypePerformance: Object.entries(typePerformance).map(([type, data]) => ({
				type,
				avgScore: Math.round(data.totalScore / data.count),
				count: data.count,
			})),
			fieldPerformance: Object.entries(fieldPerformance).map(([field, data]) => ({
				field,
				avgScore: Math.round(data.totalScore / data.count),
				count: data.count,
			})),
			timeOfDayPerformance: [], // Could be enhanced with timestamp analysis
		};
	},

	/**
	 * Generate personalized practice plan based on user's weaknesses
	 */
	generateImprovementPlan: async (userId: string): Promise<ImprovementPlan> => {
		// Get user weaknesses
		const weaknesses = await db
			.select()
			.from(schema.interviewWeakness)
			.where(and(eq(schema.interviewWeakness.userId, userId), eq(schema.interviewWeakness.isResolved, false)))
			.orderBy(desc(schema.interviewWeakness.occurrenceCount));

		// Get recent improvements (fetched for future use)
		await db
			.select()
			.from(schema.interviewImprovement)
			.where(eq(schema.interviewImprovement.userId, userId))
			.orderBy(desc(schema.interviewImprovement.recordedAt))
			.limit(20);

		// Calculate priority areas
		const priorityAreas = weaknesses.slice(0, 5).map((w) => ({
			area: w.title,
			currentScore: 100 - w.occurrenceCount * 10, // Rough estimate
			targetScore: 80,
			priority:
				w.severity === "critical" ? "high" : w.severity === "major" ? "medium" : ("low" as "high" | "medium" | "low"),
		}));

		// Generate weekly goals based on weaknesses
		const weeklyGoals: ImprovementPlan["weeklyGoals"] = [];
		for (let week = 1; week <= 4; week++) {
			const focusArea = priorityAreas[(week - 1) % priorityAreas.length]?.area || "general practice";
			weeklyGoals.push({
				week,
				goals: [
					`Complete 3 practice sessions focusing on ${focusArea}`,
					"Review feedback from previous sessions",
					"Practice answering 5 new questions",
				],
				focusArea,
			});
		}

		// Compile recommended resources from weaknesses
		const resources: ImprovementPlan["recommendedResources"] = [];
		for (const weakness of weaknesses.slice(0, 5)) {
			const suggestedResources = (weakness.suggestedResources as { title: string; url?: string; type: string }[]) || [];
			resources.push(...suggestedResources.map((r) => ({ ...r, relevance: 100 - weaknesses.indexOf(weakness) * 10 })));
		}

		// Generate practice schedule
		const practiceSchedule = [
			{
				day: "Monday",
				activity: "Mock Interview Session",
				duration: 30,
				focusArea: priorityAreas[0]?.area || "behavioral",
			},
			{
				day: "Wednesday",
				activity: "Question Practice",
				duration: 20,
				focusArea: priorityAreas[1]?.area || "technical",
			},
			{ day: "Friday", activity: "Full Interview Simulation", duration: 45, focusArea: "comprehensive" },
			{ day: "Saturday", activity: "Review and Reflection", duration: 15, focusArea: "analysis" },
		];

		// Define milestones
		const milestones = [
			{
				milestone: "Complete 5 practice sessions",
				targetDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
				criteria: "Finish 5 interview practice sessions with feedback",
			},
			{
				milestone: "Achieve 70% average score",
				targetDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
				criteria: "Maintain 70% or higher on last 3 sessions",
			},
			{
				milestone: "Resolve top 3 weaknesses",
				targetDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(),
				criteria: "Show improvement in identified weak areas",
			},
			{
				milestone: "Interview ready status",
				targetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
				criteria: "Achieve 80%+ score and 'interview_ready' status",
			},
		];

		return {
			userId,
			priorityAreas,
			weeklyGoals,
			recommendedResources: resources.slice(0, 10),
			practiceSchedule,
			milestones,
			estimatedTimeToGoal: 30, // Default 30 days
		};
	},

	/**
	 * Track score changes and improvements over time
	 */
	trackImprovement: async (
		userId: string,
		period: "weekly" | "monthly" | "all_time" = "monthly",
	): Promise<ImprovementTracking[]> => {
		// Calculate date range
		const now = new Date();
		let startDate: Date;
		switch (period) {
			case "weekly":
				startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
				break;
			case "monthly":
				startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
				break;
			default:
				startDate = new Date(0); // All time
		}

		// Get improvements from the database
		const improvements = await db
			.select()
			.from(schema.interviewImprovement)
			.where(
				and(eq(schema.interviewImprovement.userId, userId), gte(schema.interviewImprovement.recordedAt, startDate)),
			)
			.orderBy(desc(schema.interviewImprovement.recordedAt));

		// Group by skill area
		const skillAreas: Record<string, ImprovementTracking> = {};

		for (const imp of improvements) {
			const area = imp.skillArea;
			if (!skillAreas[area]) {
				skillAreas[area] = {
					skillArea: area,
					previousScore: imp.previousScore,
					currentScore: imp.currentScore,
					improvementPercentage: imp.improvementPercentage,
					trend: imp.improvementPercentage > 5 ? "improving" : imp.improvementPercentage < -5 ? "declining" : "stable",
					sessionsCount: imp.sessionsCompleted,
					timeframe: period,
				};
			} else {
				// Update with the most recent values
				skillAreas[area].currentScore = imp.currentScore;
				skillAreas[area].improvementPercentage =
					((imp.currentScore - skillAreas[area].previousScore) / skillAreas[area].previousScore) * 100;
				skillAreas[area].sessionsCount += imp.sessionsCompleted;
			}
		}

		// If no improvements in DB, calculate from sessions
		if (Object.keys(skillAreas).length === 0) {
			const sessions = await db
				.select()
				.from(schema.interviewSession)
				.where(
					and(
						eq(schema.interviewSession.userId, userId),
						eq(schema.interviewSession.status, "completed"),
						gte(schema.interviewSession.completedAt, startDate),
					),
				)
				.orderBy(schema.interviewSession.completedAt);

			if (sessions.length >= 2) {
				const firstHalf = sessions.slice(0, Math.floor(sessions.length / 2));
				const secondHalf = sessions.slice(Math.floor(sessions.length / 2));

				const firstAvg = firstHalf.reduce((acc, s) => acc + (s.overallScore || 0), 0) / firstHalf.length;
				const secondAvg = secondHalf.reduce((acc, s) => acc + (s.overallScore || 0), 0) / secondHalf.length;

				skillAreas.overall = {
					skillArea: "Overall Performance",
					previousScore: Math.round(firstAvg),
					currentScore: Math.round(secondAvg),
					improvementPercentage: Math.round(((secondAvg - firstAvg) / firstAvg) * 100),
					trend: secondAvg > firstAvg + 5 ? "improving" : secondAvg < firstAvg - 5 ? "declining" : "stable",
					sessionsCount: sessions.length,
					timeframe: period,
				};
			}
		}

		return Object.values(skillAreas);
	},

	/**
	 * Benchmark user against successful candidates
	 */
	compareToSuccessful: async (userId: string): Promise<BenchmarkComparison> => {
		// Get user's average scores
		const userSessions = await db
			.select()
			.from(schema.interviewSession)
			.where(and(eq(schema.interviewSession.userId, userId), eq(schema.interviewSession.status, "completed")))
			.orderBy(desc(schema.interviewSession.completedAt))
			.limit(10);

		const userAvgScore =
			userSessions.length > 0
				? userSessions.reduce((acc, s) => acc + (s.overallScore || 0), 0) / userSessions.length
				: 0;

		// Get all completed sessions for benchmarking (successful = score >= 75)
		const allSuccessfulSessions = await db
			.select({
				avgScore: avg(schema.interviewSession.overallScore),
			})
			.from(schema.interviewSession)
			.where(and(eq(schema.interviewSession.status, "completed"), gte(schema.interviewSession.overallScore, 75)));

		const successfulAvg = Number(allSuccessfulSessions[0]?.avgScore || 75);

		// Calculate percentile (simplified)
		const allScores = await db
			.select({ score: schema.interviewSession.overallScore })
			.from(schema.interviewSession)
			.where(eq(schema.interviewSession.status, "completed"));

		const scoresBelow = allScores.filter((s) => (s.score || 0) < userAvgScore).length;
		const percentile = Math.round((scoresBelow / Math.max(allScores.length, 1)) * 100);

		// Get user's analyses for gap calculation
		const userAnalyses = await db
			.select()
			.from(schema.interviewAnalysis)
			.innerJoin(schema.interviewSession, eq(schema.interviewAnalysis.sessionId, schema.interviewSession.id))
			.where(eq(schema.interviewSession.userId, userId))
			.limit(5);

		// Compile strengths and weaknesses
		const strengths = new Set<string>();
		const weaknesses = new Set<string>();

		for (const row of userAnalyses) {
			for (const s of (row.interview_analysis.topStrengths as string[]) ?? []) strengths.add(s);
			for (const w of (row.interview_analysis.topWeaknesses as string[]) ?? []) weaknesses.add(w);
		}

		// Calculate gaps
		const gapsToClose: BenchmarkComparison["gapsToClose"] = [];
		const scoreBreakdown = (userAnalyses[0]?.interview_analysis.scoreBreakdown as Record<string, number>) || {};

		for (const [area, score] of Object.entries(scoreBreakdown)) {
			if (score < 75) {
				gapsToClose.push({
					area,
					userScore: score,
					targetScore: 80,
					gap: 80 - score,
				});
			}
		}

		return {
			userScore: Math.round(userAvgScore),
			successfulCandidateAvg: Math.round(successfulAvg),
			percentile,
			gapsToClose: gapsToClose.sort((a, b) => b.gap - a.gap),
			strengthsAboveAverage: Array.from(strengths).slice(0, 5),
			areasNeedingImprovement: Array.from(weaknesses).slice(0, 5),
		};
	},

	/**
	 * Predict interview success probability based on historical performance
	 */
	predictInterviewSuccess: async (userId: string, jobType: string): Promise<ReadinessScore> => {
		// Get user's sessions filtered by job type/field
		const sessions = await db
			.select()
			.from(schema.interviewSession)
			.where(and(eq(schema.interviewSession.userId, userId), eq(schema.interviewSession.status, "completed")))
			.orderBy(desc(schema.interviewSession.completedAt))
			.limit(20);

		// Filter by job type if applicable
		const relevantSessions = jobType
			? sessions.filter((s) => s.field === jobType || s.jobPosition?.toLowerCase().includes(jobType.toLowerCase()))
			: sessions;

		// Calculate various readiness scores
		const avgScore =
			relevantSessions.length > 0
				? relevantSessions.reduce((acc, s) => acc + (s.overallScore || 0), 0) / relevantSessions.length
				: 0;

		// Get performance metrics if available
		const performances = await db
			.select()
			.from(schema.interviewPerformance)
			.where(eq(schema.interviewPerformance.userId, userId))
			.orderBy(desc(schema.interviewPerformance.createdAt))
			.limit(10);

		const avgConfidence =
			performances.length > 0
				? performances.reduce((acc, p) => acc + (p.confidenceScore || 0), 0) / performances.length
				: 60;

		const avgTechnical =
			performances.length > 0
				? performances.reduce((acc, p) => acc + (p.technicalScore || 0), 0) / performances.length
				: 60;

		const avgCommunication =
			performances.length > 0
				? performances.reduce((acc, p) => acc + (p.communicationScore || 0), 0) / performances.length
				: 60;

		// Calculate behavioral readiness from session types
		const behavioralSessions = sessions.filter((s) => ((s.types as string[]) || []).includes("behavioral"));
		const behavioralAvg =
			behavioralSessions.length > 0
				? behavioralSessions.reduce((acc, s) => acc + (s.overallScore || 0), 0) / behavioralSessions.length
				: 60;

		// Overall readiness score (weighted average)
		const overallReadiness = Math.round(
			avgScore * 0.4 + avgConfidence * 0.15 + avgTechnical * 0.2 + avgCommunication * 0.15 + behavioralAvg * 0.1,
		);

		// Determine readiness level
		let readinessLevel: ReadinessScore["readinessLevel"];
		if (overallReadiness >= 80) readinessLevel = "interview_ready";
		else if (overallReadiness >= 65) readinessLevel = "almost_ready";
		else if (overallReadiness >= 50) readinessLevel = "needs_practice";
		else readinessLevel = "not_ready";

		// Estimate sessions needed
		const sessionsNeeded = Math.max(0, Math.ceil((80 - overallReadiness) / 5));

		// Generate recommendations
		const recommendations: string[] = [];
		if (avgConfidence < 70) recommendations.push("Practice mock interviews to build confidence");
		if (avgTechnical < 70) recommendations.push("Review technical concepts for your field");
		if (avgCommunication < 70) recommendations.push("Work on articulating your responses clearly");
		if (behavioralAvg < 70) recommendations.push("Practice STAR method for behavioral questions");
		if (relevantSessions.length < 5) recommendations.push("Complete more practice sessions");

		return {
			overallReadiness,
			confidence: Math.round(avgConfidence),
			technicalPreparedness: Math.round(avgTechnical),
			behavioralReadiness: Math.round(behavioralAvg),
			communicationSkills: Math.round(avgCommunication),
			readinessLevel,
			recommendations,
			estimatedSessionsNeeded: sessionsNeeded,
		};
	},

	/**
	 * Record a weakness identified during an interview session
	 */
	recordWeakness: async (input: {
		userId: string;
		sessionId?: string;
		weaknessType: schema.WeaknessType;
		severity: schema.WeaknessSeverity;
		field?: (typeof schema.interviewFieldEnum.enumValues)[number];
		title: string;
		titleFr?: string;
		description: string;
		descriptionFr?: string;
		exampleQuestions?: string[];
		suggestedResources?: { title: string; url?: string; type: string }[];
		practiceExercises?: string[];
	}) => {
		// Check if this weakness type already exists for the user
		const [existing] = await db
			.select()
			.from(schema.interviewWeakness)
			.where(
				and(
					eq(schema.interviewWeakness.userId, input.userId),
					eq(schema.interviewWeakness.weaknessType, input.weaknessType),
					eq(schema.interviewWeakness.title, input.title),
					eq(schema.interviewWeakness.isResolved, false),
				),
			)
			.limit(1);

		if (existing) {
			// Update occurrence count and last seen
			const [updated] = await db
				.update(schema.interviewWeakness)
				.set({
					occurrenceCount: existing.occurrenceCount + 1,
					lastSeenAt: new Date(),
					severity:
						existing.occurrenceCount >= 3 ? "major" : existing.occurrenceCount >= 5 ? "critical" : input.severity,
				})
				.where(eq(schema.interviewWeakness.id, existing.id))
				.returning();
			return updated;
		}

		// Create new weakness
		const [created] = await db
			.insert(schema.interviewWeakness)
			.values({
				userId: input.userId,
				sessionId: input.sessionId,
				weaknessType: input.weaknessType,
				severity: input.severity,
				field: input.field,
				title: input.title,
				titleFr: input.titleFr,
				description: input.description,
				descriptionFr: input.descriptionFr,
				exampleQuestions: input.exampleQuestions || [],
				suggestedResources: input.suggestedResources || [],
				practiceExercises: input.practiceExercises || [],
			})
			.returning();

		return created;
	},

	/**
	 * Mark a weakness as resolved
	 */
	resolveWeakness: async (weaknessId: string, userId: string) => {
		const [updated] = await db
			.update(schema.interviewWeakness)
			.set({
				isResolved: true,
				resolvedAt: new Date(),
			})
			.where(and(eq(schema.interviewWeakness.id, weaknessId), eq(schema.interviewWeakness.userId, userId)))
			.returning();

		return updated;
	},

	/**
	 * Record an improvement in skill area
	 */
	recordImprovement: async (input: {
		userId: string;
		weaknessId?: string;
		field?: (typeof schema.interviewFieldEnum.enumValues)[number];
		skillArea: string;
		skillAreaFr?: string;
		previousScore: number;
		currentScore: number;
		sessionsCompleted: number;
		notes?: string;
		milestonesAchieved?: string[];
	}) => {
		const improvementPercentage = Math.round(
			((input.currentScore - input.previousScore) / Math.max(input.previousScore, 1)) * 100,
		);

		const [created] = await db
			.insert(schema.interviewImprovement)
			.values({
				userId: input.userId,
				weaknessId: input.weaknessId,
				field: input.field,
				skillArea: input.skillArea,
				skillAreaFr: input.skillAreaFr,
				previousScore: input.previousScore,
				currentScore: input.currentScore,
				improvementPercentage,
				sessionsCompleted: input.sessionsCompleted,
				notes: input.notes,
				milestonesAchieved: input.milestonesAchieved || [],
			})
			.returning();

		return created;
	},

	/**
	 * Get user's weaknesses
	 */
	getWeaknesses: async (userId: string, includeResolved = false) => {
		const conditions = [eq(schema.interviewWeakness.userId, userId)];
		if (!includeResolved) {
			conditions.push(eq(schema.interviewWeakness.isResolved, false));
		}

		return db
			.select()
			.from(schema.interviewWeakness)
			.where(and(...conditions))
			.orderBy(desc(schema.interviewWeakness.occurrenceCount));
	},

	/**
	 * Get improvements history
	 */
	getImprovements: async (userId: string, limit = 20) => {
		return db
			.select()
			.from(schema.interviewImprovement)
			.where(eq(schema.interviewImprovement.userId, userId))
			.orderBy(desc(schema.interviewImprovement.recordedAt))
			.limit(limit);
	},

	/**
	 * Get or create mock interview templates
	 */
	getTemplates: async (industry?: string, difficulty?: string) => {
		const conditions = [eq(schema.mockInterviewTemplate.isActive, true)];
		if (industry) {
			conditions.push(
				eq(schema.mockInterviewTemplate.industry, industry as (typeof schema.templateIndustryEnum.enumValues)[number]),
			);
		}
		if (difficulty) {
			conditions.push(
				eq(
					schema.mockInterviewTemplate.difficulty,
					difficulty as (typeof schema.templateDifficultyEnum.enumValues)[number],
				),
			);
		}

		return db
			.select()
			.from(schema.mockInterviewTemplate)
			.where(and(...conditions))
			.orderBy(desc(schema.mockInterviewTemplate.usageCount));
	},

	/**
	 * Record template usage
	 */
	recordTemplateUsage: async (input: {
		userId: string;
		templateId: string;
		sessionId?: string;
		score?: number;
		feedback?: string;
	}) => {
		// Create usage record
		const [usage] = await db
			.insert(schema.templateUsage)
			.values({
				userId: input.userId,
				templateId: input.templateId,
				sessionId: input.sessionId,
				score: input.score,
				completedAt: input.score !== undefined ? new Date() : undefined,
				feedback: input.feedback,
			})
			.returning();

		// Update template usage count
		await db
			.update(schema.mockInterviewTemplate)
			.set({
				usageCount: sql`${schema.mockInterviewTemplate.usageCount} + 1`,
			})
			.where(eq(schema.mockInterviewTemplate.id, input.templateId));

		return usage;
	},

	/**
	 * Get adaptive question difficulty based on user performance
	 */
	getAdaptiveDifficulty: async (userId: string, field: string): Promise<"beginner" | "intermediate" | "advanced"> => {
		// Get recent session performance in this field
		const recentSessions = await db
			.select()
			.from(schema.interviewSession)
			.where(
				and(
					eq(schema.interviewSession.userId, userId),
					eq(schema.interviewSession.field, field as (typeof schema.interviewFieldEnum.enumValues)[number]),
					eq(schema.interviewSession.status, "completed"),
				),
			)
			.orderBy(desc(schema.interviewSession.completedAt))
			.limit(5);

		if (recentSessions.length === 0) {
			return "beginner";
		}

		const avgScore = recentSessions.reduce((acc, s) => acc + (s.overallScore || 0), 0) / recentSessions.length;

		// Adapt difficulty based on performance
		if (avgScore >= 80) return "advanced";
		if (avgScore >= 60) return "intermediate";
		return "beginner";
	},
};
