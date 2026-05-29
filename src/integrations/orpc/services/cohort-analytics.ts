import { and, avg, count, desc, eq, gte, inArray, lte } from "drizzle-orm";
import { db } from "@/integrations/drizzle/client";
import {
	cohortAnalyticsBenchmark,
	cohortAnalyticsMetrics,
	cohortMembership,
	interviewSession,
	resume,
	skillsQuizResult,
	studentCohort,
	user,
	userTrainingInterests,
} from "@/integrations/drizzle/schema";
import { generateId } from "@/utils/string";

// Types for cohort analytics
export type CohortCriteria = {
	program?: string;
	year?: number;
	specialization?: string;
	field?: string;
	minEnrollmentDate?: string;
	maxEnrollmentDate?: string;
};

export type CohortMetricsData = {
	totalMembers: number;
	avgResumeProgress: number;
	avgSkillsScore: number;
	avgInterviewScore: number;
	placementRate: number;
	activeMembers: number;
	completedTraining: number;
	atRiskCount: number;
};

export type CohortComparison = {
	cohortId: string;
	cohortName: string;
	metrics: CohortMetricsData;
};

export type StudentPerformance = {
	userId: string;
	userName: string;
	userEmail: string;
	resumeCount: number;
	avgSkillsScore: number;
	interviewsCompleted: number;
	avgInterviewScore: number;
	trainingProgress: number;
	isPlaced: boolean;
	riskLevel: "low" | "medium" | "high";
	lastActivity: Date | null;
};

export type CohortPrediction = {
	predictedPlacementRate: number;
	predictedCompletionRate: number;
	riskFactors: string[];
	recommendations: string[];
	confidenceLevel: number;
};

export const cohortAnalyticsService = {
	// Create a new cohort
	createCohort: async (data: { name: string; description?: string; criteria: CohortCriteria; createdBy: string }) => {
		const id = generateId();
		const [newCohort] = await db
			.insert(studentCohort)
			.values({
				id,
				name: data.name,
				description: data.description,
				cohortType: "custom",
				metadata: data.criteria,
			})
			.returning();

		return {
			id: newCohort.id,
			name: newCohort.name,
			description: newCohort.description,
			criteria: (newCohort.metadata ?? {}) as CohortCriteria,
			isActive: newCohort.isActive,
			createdAt: newCohort.createdAt,
			updatedAt: newCohort.updatedAt,
		};
	},

	// Get cohort by ID
	getCohort: async (cohortId: string) => {
		const [result] = await db.select().from(studentCohort).where(eq(studentCohort.id, cohortId)).limit(1);
		if (!result) return null;

		return {
			id: result.id,
			name: result.name,
			description: result.description,
			criteria: (result.metadata ?? {}) as CohortCriteria,
			isActive: result.isActive,
			createdAt: result.createdAt,
			updatedAt: result.updatedAt,
		};
	},

	// List all cohorts
	listCohorts: async (options?: { activeOnly?: boolean; limit?: number; offset?: number }) => {
		let query = db.select().from(studentCohort);

		if (options?.activeOnly) {
			query = query.where(eq(studentCohort.isActive, true)) as typeof query;
		}

		const results = await query
			.orderBy(desc(studentCohort.createdAt))
			.limit(options?.limit ?? 50)
			.offset(options?.offset ?? 0);

		const [countResult] = await db
			.select({ count: count() })
			.from(studentCohort)
			.where(options?.activeOnly ? eq(studentCohort.isActive, true) : undefined);

		return {
			cohorts: results.map((r) => ({
				id: r.id,
				name: r.name,
				description: r.description,
				criteria: (r.metadata ?? {}) as CohortCriteria,
				isActive: r.isActive,
				createdAt: r.createdAt,
				updatedAt: r.updatedAt,
			})),
			total: countResult?.count ?? 0,
		};
	},

	// Update cohort
	updateCohort: async (
		cohortId: string,
		data: {
			name?: string;
			description?: string;
			criteria?: CohortCriteria;
			isActive?: boolean;
		},
	) => {
		const updateData: Record<string, unknown> = {};
		if (data.name !== undefined) updateData.name = data.name;
		if (data.description !== undefined) updateData.description = data.description;
		if (data.criteria !== undefined) updateData.metadata = data.criteria;
		if (data.isActive !== undefined) updateData.isActive = data.isActive;

		const [updated] = await db.update(studentCohort).set(updateData).where(eq(studentCohort.id, cohortId)).returning();

		return {
			id: updated.id,
			name: updated.name,
			description: updated.description,
			criteria: (updated.metadata ?? {}) as CohortCriteria,
			isActive: updated.isActive,
			updatedAt: updated.updatedAt,
		};
	},

	// Delete cohort
	deleteCohort: async (cohortId: string) => {
		await db.delete(studentCohort).where(eq(studentCohort.id, cohortId));
		return { success: true };
	},

	// Add member to cohort
	addMember: async (cohortId: string, userId: string, _addedBy: string) => {
		const id = generateId();
		const [member] = await db
			.insert(cohortMembership)
			.values({
				id,
				cohortId,
				userId,
				role: "member",
			})
			.onConflictDoNothing()
			.returning();
		if (!member) return null;
		return {
			id: member.id,
			cohortId: member.cohortId,
			userId: member.userId,
			joinedAt: member.joinedAt,
		};
	},

	// Remove member from cohort
	removeMember: async (cohortId: string, userId: string) => {
		await db
			.delete(cohortMembership)
			.where(and(eq(cohortMembership.cohortId, cohortId), eq(cohortMembership.userId, userId)));
		return { success: true };
	},

	// Get cohort members
	getCohortMembers: async (cohortId: string) => {
		const members = await db
			.select({
				id: cohortMembership.id,
				userId: cohortMembership.userId,
				userName: user.name,
				userEmail: user.email,
				joinedAt: cohortMembership.joinedAt,
				status: cohortMembership.role,
			})
			.from(cohortMembership)
			.innerJoin(user, eq(cohortMembership.userId, user.id))
			.where(eq(cohortMembership.cohortId, cohortId))
			.orderBy(desc(cohortMembership.joinedAt));

		return members;
	},

	// Get aggregated metrics for a cohort
	getCohortMetrics: async (cohortId: string): Promise<CohortMetricsData> => {
		// Get member IDs
		const members = await db
			.select({ userId: cohortMembership.userId })
			.from(cohortMembership)
			.where(eq(cohortMembership.cohortId, cohortId));

		if (members.length === 0) {
			return {
				totalMembers: 0,
				avgResumeProgress: 0,
				avgSkillsScore: 0,
				avgInterviewScore: 0,
				placementRate: 0,
				activeMembers: 0,
				completedTraining: 0,
				atRiskCount: 0,
			};
		}

		const memberIds = members.map((m) => m.userId);

		// Get resume count per member
		const resumeStats = await db
			.select({
				userId: resume.userId,
				count: count(resume.id),
			})
			.from(resume)
			.where(inArray(resume.userId, memberIds))
			.groupBy(resume.userId);

		// Get average skills quiz score
		const skillsStats = await db
			.select({
				avgScore: avg(skillsQuizResult.score),
			})
			.from(skillsQuizResult)
			.where(inArray(skillsQuizResult.userId, memberIds));

		// Get average interview score
		const interviewStats = await db
			.select({
				avgScore: avg(interviewSession.overallScore),
			})
			.from(interviewSession)
			.where(and(inArray(interviewSession.userId, memberIds), eq(interviewSession.status, "completed")));

		// Get training completion stats
		const trainingStats = await db
			.select({
				status: userTrainingInterests.status,
				count: count(),
			})
			.from(userTrainingInterests)
			.where(inArray(userTrainingInterests.userId, memberIds))
			.groupBy(userTrainingInterests.status);

		// Get active members (had activity in last 30 days)
		const thirtyDaysAgo = new Date();
		thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

		const activeMembers = await db
			.select({ userId: user.id })
			.from(user)
			.where(and(inArray(user.id, memberIds), gte(user.updatedAt, thirtyDaysAgo)));

		// Get placement rate from cohort members (using role = "placed" or checking leftAt for graduated students)
		const placedMembers = await db
			.select({ count: count() })
			.from(cohortMembership)
			.where(and(eq(cohortMembership.cohortId, cohortId), eq(cohortMembership.role, "placed")));

		const completedTraining = trainingStats.find((s) => s.status === "completed")?.count ?? 0;

		// Calculate at-risk (no activity in 14 days, low scores)
		const fourteenDaysAgo = new Date();
		fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

		const atRiskMembers = await db
			.select({ count: count() })
			.from(user)
			.where(and(inArray(user.id, memberIds), lte(user.updatedAt, fourteenDaysAgo)));

		return {
			totalMembers: members.length,
			avgResumeProgress:
				resumeStats.length > 0 ? (resumeStats.reduce((sum, r) => sum + r.count, 0) / members.length) * 20 : 0, // Normalize to 0-100
			avgSkillsScore: Number(skillsStats[0]?.avgScore) || 0,
			avgInterviewScore: Number(interviewStats[0]?.avgScore) || 0,
			placementRate: members.length > 0 ? (Number(placedMembers[0]?.count ?? 0) / members.length) * 100 : 0,
			activeMembers: activeMembers.length,
			completedTraining: Number(completedTraining),
			atRiskCount: Number(atRiskMembers[0]?.count ?? 0),
		};
	},

	// Compare multiple cohorts
	compareCohorts: async (cohortIds: string[]): Promise<CohortComparison[]> => {
		const comparisons: CohortComparison[] = [];

		for (const cohortId of cohortIds) {
			const cohortData = await cohortAnalyticsService.getCohort(cohortId);
			if (!cohortData) continue;

			const metrics = await cohortAnalyticsService.getCohortMetrics(cohortId);
			comparisons.push({
				cohortId,
				cohortName: cohortData.name,
				metrics,
			});
		}

		return comparisons;
	},

	// Identify top performers in a cohort
	identifyTopPerformers: async (cohortId: string, limit = 10): Promise<StudentPerformance[]> => {
		const members = await db
			.select({ userId: cohortMembership.userId })
			.from(cohortMembership)
			.where(eq(cohortMembership.cohortId, cohortId));

		if (members.length === 0) return [];

		const memberIds = members.map((m) => m.userId);

		// Get user details with their performance metrics
		const performances: StudentPerformance[] = [];

		for (const memberId of memberIds) {
			const [userData] = await db.select().from(user).where(eq(user.id, memberId)).limit(1);
			if (!userData) continue;

			// Resume count
			const [resumeCount] = await db.select({ count: count() }).from(resume).where(eq(resume.userId, memberId));

			// Skills score
			const [skillsScore] = await db
				.select({ avgScore: avg(skillsQuizResult.score) })
				.from(skillsQuizResult)
				.where(eq(skillsQuizResult.userId, memberId));

			// Interview stats
			const interviewData = await db
				.select({
					count: count(),
					avgScore: avg(interviewSession.overallScore),
				})
				.from(interviewSession)
				.where(and(eq(interviewSession.userId, memberId), eq(interviewSession.status, "completed")));

			// Training progress
			const [trainingData] = await db
				.select({ count: count() })
				.from(userTrainingInterests)
				.where(and(eq(userTrainingInterests.userId, memberId), eq(userTrainingInterests.status, "completed")));

			// Check placement status
			const [memberData] = await db
				.select({ role: cohortMembership.role })
				.from(cohortMembership)
				.where(and(eq(cohortMembership.cohortId, cohortId), eq(cohortMembership.userId, memberId)));

			// Calculate risk level
			const avgSkills = Number(skillsScore?.avgScore) || 0;
			const avgInterview = Number(interviewData[0]?.avgScore) || 0;
			const daysSinceActivity = Math.floor(
				(Date.now() - new Date(userData.updatedAt).getTime()) / (1000 * 60 * 60 * 24),
			);

			let riskLevel: "low" | "medium" | "high" = "low";
			if (daysSinceActivity > 14 || avgSkills < 40 || avgInterview < 40) {
				riskLevel = "high";
			} else if (daysSinceActivity > 7 || avgSkills < 60 || avgInterview < 60) {
				riskLevel = "medium";
			}

			performances.push({
				userId: memberId,
				userName: userData.name,
				userEmail: userData.email,
				resumeCount: resumeCount?.count ?? 0,
				avgSkillsScore: avgSkills,
				interviewsCompleted: Number(interviewData[0]?.count) || 0,
				avgInterviewScore: avgInterview,
				trainingProgress: trainingData?.count ?? 0,
				isPlaced: memberData?.role === "placed",
				riskLevel,
				lastActivity: userData.updatedAt,
			});
		}

		// Sort by composite score (higher is better)
		performances.sort((a, b) => {
			const scoreA = a.avgSkillsScore * 0.3 + a.avgInterviewScore * 0.4 + a.trainingProgress * 10 * 0.3;
			const scoreB = b.avgSkillsScore * 0.3 + b.avgInterviewScore * 0.4 + b.trainingProgress * 10 * 0.3;
			return scoreB - scoreA;
		});

		return performances.slice(0, limit);
	},

	// Identify at-risk students
	identifyAtRisk: async (cohortId: string): Promise<StudentPerformance[]> => {
		const allMembers = await cohortAnalyticsService.identifyTopPerformers(cohortId, 1000);
		return allMembers.filter((m) => m.riskLevel === "high" || m.riskLevel === "medium").reverse();
	},

	// Predict cohort outcomes
	predictCohortOutcomes: async (cohortId: string): Promise<CohortPrediction> => {
		const metrics = await cohortAnalyticsService.getCohortMetrics(cohortId);
		const topPerformers = await cohortAnalyticsService.identifyTopPerformers(cohortId, 100);
		const atRisk = await cohortAnalyticsService.identifyAtRisk(cohortId);

		// Simple prediction model based on current metrics
		const riskFactors: string[] = [];
		const recommendations: string[] = [];

		if (metrics.totalMembers > 0 && metrics.activeMembers / metrics.totalMembers < 0.7) {
			riskFactors.push(
				`Low engagement rate - only ${Math.round((metrics.activeMembers / metrics.totalMembers) * 100)}% active`,
			);
			recommendations.push("Implement engagement campaigns to re-activate inactive students");
		}

		if (metrics.avgSkillsScore < 60) {
			riskFactors.push("Below average skills assessment scores");
			recommendations.push("Provide additional skills training workshops");
		}

		if (metrics.avgInterviewScore < 60) {
			riskFactors.push("Low interview performance scores");
			recommendations.push("Increase mock interview practice sessions");
		}

		if (metrics.totalMembers > 0 && atRisk.length / metrics.totalMembers > 0.2) {
			riskFactors.push(
				`High percentage of at-risk students (${Math.round((atRisk.length / metrics.totalMembers) * 100)}%)`,
			);
			recommendations.push("Implement early intervention programs for at-risk students");
		}

		// Calculate predicted rates
		const activeRate = metrics.totalMembers > 0 ? metrics.activeMembers / metrics.totalMembers : 0;
		const performanceRate = (metrics.avgSkillsScore + metrics.avgInterviewScore) / 200;

		const predictedPlacementRate = Math.min(100, Math.round(activeRate * performanceRate * 100 * 1.2));
		const predictedCompletionRate = Math.min(
			100,
			Math.round((1 - atRisk.length / Math.max(1, metrics.totalMembers)) * 100),
		);

		const confidenceLevel = Math.min(100, Math.round(topPerformers.length * 2 + metrics.avgSkillsScore * 0.5));

		return {
			predictedPlacementRate,
			predictedCompletionRate,
			riskFactors,
			recommendations,
			confidenceLevel,
		};
	},

	// Save cohort metrics snapshot
	saveCohortMetrics: async (cohortId: string) => {
		const metrics = await cohortAnalyticsService.getCohortMetrics(cohortId);
		const id = generateId();

		const [saved] = await db
			.insert(cohortAnalyticsMetrics)
			.values({
				id,
				cohortId,
				totalMembers: metrics.totalMembers,
				avgResumeProgress: Math.round(metrics.avgResumeProgress),
				avgSkillsScore: Math.round(metrics.avgSkillsScore),
				avgInterviewScore: Math.round(metrics.avgInterviewScore),
				placementRate: Math.round(metrics.placementRate),
				activeMembers: metrics.activeMembers,
				completedTraining: metrics.completedTraining,
				atRiskCount: metrics.atRiskCount,
			})
			.returning();

		return saved;
	},

	// Get historical metrics for a cohort
	getMetricsHistory: async (cohortId: string, limit = 30) => {
		const history = await db
			.select()
			.from(cohortAnalyticsMetrics)
			.where(eq(cohortAnalyticsMetrics.cohortId, cohortId))
			.orderBy(desc(cohortAnalyticsMetrics.recordedAt))
			.limit(limit);

		return history;
	},

	// Set benchmark for a cohort
	setBenchmark: async (
		cohortId: string,
		data: {
			name: string;
			targetPlacementRate?: number;
			targetSkillsScore?: number;
			targetInterviewScore?: number;
			targetCompletionRate?: number;
		},
	) => {
		const id = generateId();
		const [benchmark] = await db
			.insert(cohortAnalyticsBenchmark)
			.values({
				id,
				cohortId,
				name: data.name,
				targetPlacementRate: data.targetPlacementRate,
				targetSkillsScore: data.targetSkillsScore,
				targetInterviewScore: data.targetInterviewScore,
				targetCompletionRate: data.targetCompletionRate,
			})
			.returning();

		return benchmark;
	},

	// Get benchmarks for a cohort
	getBenchmarks: async (cohortId: string) => {
		const benchmarks = await db
			.select()
			.from(cohortAnalyticsBenchmark)
			.where(and(eq(cohortAnalyticsBenchmark.cohortId, cohortId), eq(cohortAnalyticsBenchmark.isActive, true)))
			.orderBy(desc(cohortAnalyticsBenchmark.createdAt));

		return benchmarks;
	},

	// Generate cohort report data
	generateCohortReport: async (cohortId: string) => {
		const cohortData = await cohortAnalyticsService.getCohort(cohortId);
		if (!cohortData) throw new Error("Cohort not found");

		const metrics = await cohortAnalyticsService.getCohortMetrics(cohortId);
		const members = await cohortAnalyticsService.getCohortMembers(cohortId);
		const topPerformers = await cohortAnalyticsService.identifyTopPerformers(cohortId, 5);
		const atRisk = await cohortAnalyticsService.identifyAtRisk(cohortId);
		const predictions = await cohortAnalyticsService.predictCohortOutcomes(cohortId);
		const history = await cohortAnalyticsService.getMetricsHistory(cohortId, 12);
		const benchmarks = await cohortAnalyticsService.getBenchmarks(cohortId);

		return {
			cohort: cohortData,
			generatedAt: new Date().toISOString(),
			summary: {
				totalMembers: metrics.totalMembers,
				activeMembers: metrics.activeMembers,
				placementRate: metrics.placementRate,
				atRiskCount: metrics.atRiskCount,
			},
			metrics,
			members: members.slice(0, 50), // Limit for report
			topPerformers,
			atRiskStudents: atRisk.slice(0, 10),
			predictions,
			history,
			benchmarks,
			insights: {
				strengthAreas: metrics.avgSkillsScore > 70 ? ["Strong skills development"] : [],
				improvementAreas: metrics.avgInterviewScore < 60 ? ["Interview preparation needs improvement"] : [],
				keyRecommendations: predictions.recommendations,
			},
		};
	},
};
