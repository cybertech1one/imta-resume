import z from "zod";
import type { BadgeType, ProgressActivityAction, SkillLevel } from "@/integrations/drizzle/schema";
import { protectedProcedure } from "../context";
import { studentProgressService } from "../services/student-progress";

// Zod schemas
const progressActivityActionSchema = z.enum([
	"lesson_started",
	"lesson_completed",
	"quiz_taken",
	"skill_practiced",
	"resume_edited",
	"interview_practiced",
	"goal_set",
	"goal_achieved",
	"badge_earned",
	"module_completed",
	"resource_viewed",
	"feedback_received",
	"peer_review_given",
	"mentor_session",
	"certification_earned",
]);

const badgeTypeSchema = z.enum([
	"first_resume",
	"resume_master",
	"interview_ready",
	"interview_champion",
	"skill_seeker",
	"skill_expert",
	"consistency_streak",
	"early_bird",
	"night_owl",
	"fast_learner",
	"perfectionist",
	"team_player",
	"mentor_helper",
	"goal_crusher",
	"certificate_collector",
]);

const skillLevelSchema = z.enum(["beginner", "elementary", "intermediate", "upper_intermediate", "advanced", "expert"]);

// Output schemas
const progressSchema = z.object({
	id: z.string().uuid(),
	userId: z.string(),
	overallScore: z.number(),
	totalLessonsCompleted: z.number(),
	totalQuizzesTaken: z.number(),
	totalPracticeTime: z.number(),
	currentStreak: z.number(),
	longestStreak: z.number(),
	lastActivityDate: z.string().nullable(),
	resumeCompleteness: z.number(),
	interviewReadiness: z.number(),
	jobSearchReadiness: z.number(),
	weeklyGoalProgress: z.number(),
	weeklyGoalTarget: z.number(),
	cohortId: z.string().nullable(),
	createdAt: z.coerce.date(),
	updatedAt: z.coerce.date(),
});

const activityLogSchema = z.object({
	id: z.string().uuid(),
	userId: z.string(),
	action: progressActivityActionSchema,
	entityType: z.string().nullable(),
	entityId: z.string().nullable(),
	entityName: z.string().nullable(),
	durationMinutes: z.number().nullable(),
	scoreAchieved: z.number().nullable(),
	metadata: z.record(z.string(), z.unknown()).nullable(),
	sessionId: z.string().nullable(),
	deviceType: z.string().nullable(),
	completedAt: z.coerce.date().nullable(),
	createdAt: z.coerce.date(),
});

const skillProgressionSchema = z.object({
	id: z.string().uuid(),
	userId: z.string(),
	skillId: z.string(),
	skillName: z.string(),
	skillNameFr: z.string().nullable(),
	previousLevel: skillLevelSchema.nullable(),
	currentLevel: skillLevelSchema,
	score: z.number(),
	assessmentType: z.string(),
	notes: z.string().nullable(),
	recordedAt: z.coerce.date(),
	createdAt: z.coerce.date(),
});

const badgeSchema = z.object({
	id: z.string().uuid(),
	userId: z.string(),
	badgeType: badgeTypeSchema,
	badgeName: z.string(),
	badgeNameFr: z.string().nullable(),
	badgeDescription: z.string(),
	badgeDescriptionFr: z.string().nullable(),
	badgeIcon: z.string(),
	tier: z.string(),
	xpAwarded: z.number(),
	criteriaValue: z.number().nullable(),
	isNew: z.boolean(),
	earnedAt: z.coerce.date(),
	createdAt: z.coerce.date(),
});

const cohortSchema = z.object({
	id: z.string().uuid(),
	name: z.string(),
	nameFr: z.string().nullable(),
	description: z.string().nullable(),
	descriptionFr: z.string().nullable(),
	cohortType: z.string(),
	programId: z.string().nullable(),
	startDate: z.string().nullable(),
	endDate: z.string().nullable(),
	isActive: z.boolean(),
	memberCount: z.number(),
	avgProgress: z.number(),
	metadata: z.record(z.string(), z.unknown()).nullable(),
	createdAt: z.coerce.date(),
	updatedAt: z.coerce.date(),
});

const cohortComparisonSchema = z.object({
	percentile: z.number(),
	rank: z.number(),
	totalInCohort: z.number().optional(),
	totalUsers: z.number().optional(),
	aheadOf: z.number(),
	comparison: z
		.object({
			userScore: z.number(),
			avgScore: z.number(),
			userLessons: z.number(),
			avgLessons: z.number(),
			userStreak: z.number(),
			avgStreak: z.number(),
		})
		.optional(),
});

const weakAreaSchema = z.object({
	skillId: z.string(),
	skillName: z.string(),
	skillNameFr: z.string().optional(),
	currentLevel: skillLevelSchema,
	averageScore: z.number(),
	recentTrend: z.enum(["improving", "declining", "stable"]),
	suggestedActions: z.array(z.string()),
	practiceCount: z.number(),
});

const weeklySnapshotSchema = z.object({
	id: z.string().uuid(),
	userId: z.string(),
	weekStartDate: z.string(),
	weekEndDate: z.string(),
	overallScore: z.number(),
	lessonsCompleted: z.number(),
	practiceMinutes: z.number(),
	quizzesTaken: z.number(),
	avgQuizScore: z.number().nullable(),
	badgesEarned: z.number(),
	streakDays: z.number(),
	topSkillImproved: z.string().nullable(),
	cohortRank: z.number().nullable(),
	cohortPercentile: z.number().nullable(),
	createdAt: z.coerce.date(),
});

export const studentProgressRouter = {
	// ==========================================
	// ACTIVITY TRACKING
	// ==========================================

	trackActivity: protectedProcedure
		.route({
			method: "POST",
			path: "/student-progress/activity",
			tags: ["Student Progress"],
			summary: "Log a learning activity",
		})
		.input(
			z.object({
				action: progressActivityActionSchema,
				entityType: z.string().optional(),
				entityId: z.string().optional(),
				entityName: z.string().optional(),
				durationMinutes: z.number().optional(),
				scoreAchieved: z.number().min(0).max(100).optional(),
				metadata: z.record(z.string(), z.unknown()).optional(),
				sessionId: z.string().optional(),
				deviceType: z.string().optional(),
			}),
		)
		.output(z.string())
		.handler(async ({ context, input }) => {
			return await studentProgressService.trackActivity({
				...input,
				userId: context.user.id,
				action: input.action as ProgressActivityAction,
			});
		}),

	getActivityLog: protectedProcedure
		.route({
			method: "GET",
			path: "/student-progress/activity",
			tags: ["Student Progress"],
			summary: "Get activity log",
		})
		.input(
			z
				.object({
					limit: z.number().min(1).max(100).optional(),
					offset: z.number().min(0).optional(),
				})
				.optional()
				.default({}),
		)
		.output(z.array(activityLogSchema))
		.handler(async ({ context, input }) => {
			const logs = await studentProgressService.getActivityLog(context.user.id, input.limit ?? 50, input.offset ?? 0);
			return logs.map((log) => {
				const { metadata, ...rest } = log;
				return {
					...rest,
					metadata: (metadata as Record<string, unknown> | null) ?? null,
				};
			});
		}),

	getActivityStats: protectedProcedure
		.route({
			method: "GET",
			path: "/student-progress/activity/stats",
			tags: ["Student Progress"],
			summary: "Get activity statistics",
		})
		.input(
			z
				.object({ days: z.number().min(1).max(365).optional() })
				.optional()
				.default({}),
		)
		.output(
			z.array(
				z.object({
					action: progressActivityActionSchema,
					count: z.number(),
					totalDuration: z.number(),
					avgScore: z.number().nullable(),
				}),
			),
		)
		.handler(async ({ context, input }) => {
			const stats = await studentProgressService.getActivityStats(context.user.id, input.days ?? 30);
			return stats.map((s) => ({
				action: s.action as ProgressActivityAction,
				count: Number(s.count),
				totalDuration: Number(s.totalDuration),
				avgScore: s.avgScore ? Number(s.avgScore) : null,
			}));
		}),

	// ==========================================
	// PROGRESS SCORE
	// ==========================================

	getProgress: protectedProcedure
		.route({
			method: "GET",
			path: "/student-progress",
			tags: ["Student Progress"],
			summary: "Get overall progress",
		})
		.input(z.object({}).optional().default({}))
		.output(progressSchema)
		.handler(async ({ context }) => {
			return await studentProgressService.getProgress(context.user.id);
		}),

	calculateProgressScore: protectedProcedure
		.route({
			method: "POST",
			path: "/student-progress/calculate",
			tags: ["Student Progress"],
			summary: "Calculate overall progress score",
		})
		.input(z.object({}).optional().default({}))
		.output(z.number())
		.handler(async ({ context }) => {
			return await studentProgressService.calculateProgressScore(context.user.id);
		}),

	// ==========================================
	// SKILL PROGRESSION
	// ==========================================

	trackSkillProgression: protectedProcedure
		.route({
			method: "POST",
			path: "/student-progress/skills",
			tags: ["Student Progress"],
			summary: "Track skill progression",
		})
		.input(
			z.object({
				skillId: z.string(),
				skillName: z.string(),
				skillNameFr: z.string().optional(),
				currentLevel: skillLevelSchema,
				score: z.number().min(0).max(100).optional(),
				assessmentType: z.string(),
				notes: z.string().optional(),
			}),
		)
		.output(z.string())
		.handler(async ({ context, input }) => {
			return await studentProgressService.trackSkillProgression({
				...input,
				userId: context.user.id,
				currentLevel: input.currentLevel as SkillLevel,
			});
		}),

	getSkillProgression: protectedProcedure
		.route({
			method: "GET",
			path: "/student-progress/skills",
			tags: ["Student Progress"],
			summary: "Get skill progression history",
		})
		.input(z.object({ skillId: z.string().optional() }).optional().default({}))
		.output(z.array(skillProgressionSchema))
		.handler(async ({ context, input }) => {
			return await studentProgressService.getSkillProgression(context.user.id, input.skillId);
		}),

	getSkillTimeline: protectedProcedure
		.route({
			method: "GET",
			path: "/student-progress/skills/{skillId}/timeline",
			tags: ["Student Progress"],
			summary: "Get skill timeline",
		})
		.input(z.object({ skillId: z.string(), limit: z.number().optional() }))
		.output(z.array(skillProgressionSchema))
		.handler(async ({ context, input }) => {
			return await studentProgressService.getSkillTimeline(context.user.id, input.skillId, input.limit ?? 20);
		}),

	// ==========================================
	// COHORT COMPARISON
	// ==========================================

	compareToCohort: protectedProcedure
		.route({
			method: "GET",
			path: "/student-progress/compare",
			tags: ["Student Progress"],
			summary: "Compare progress to cohort",
		})
		.input(z.object({}).optional().default({}))
		.output(cohortComparisonSchema)
		.handler(async ({ context }) => {
			const result = await studentProgressService.compareToCohort(context.user.id);
			// Normalize the result to match the schema
			const comparison =
				"comparison" in result &&
				result.comparison &&
				typeof result.comparison === "object" &&
				"userScore" in result.comparison
					? (result.comparison as {
							userScore: number;
							avgScore: number;
							userLessons: number;
							avgLessons: number;
							userStreak: number;
							avgStreak: number;
						})
					: undefined;
			return {
				percentile: result.percentile,
				rank: result.rank,
				aheadOf: result.aheadOf,
				totalInCohort: "totalInCohort" in result ? (result.totalInCohort as number) : undefined,
				totalUsers: "totalUsers" in result ? (result.totalUsers as number) : undefined,
				comparison,
			};
		}),

	// ==========================================
	// BADGES
	// ==========================================

	awardBadge: protectedProcedure
		.route({
			method: "POST",
			path: "/student-progress/badges",
			tags: ["Student Progress"],
			summary: "Award a badge",
		})
		.input(
			z.object({
				badgeType: badgeTypeSchema,
				criteriaValue: z.number().optional(),
			}),
		)
		.output(z.object({ awarded: z.boolean(), badge: badgeSchema.optional() }))
		.handler(async ({ context, input }) => {
			return await studentProgressService.awardBadge({
				userId: context.user.id,
				badgeType: input.badgeType as BadgeType,
				criteriaValue: input.criteriaValue,
			});
		}),

	getUserBadges: protectedProcedure
		.route({
			method: "GET",
			path: "/student-progress/badges",
			tags: ["Student Progress"],
			summary: "Get user badges",
		})
		.input(z.object({}).optional().default({}))
		.output(z.array(badgeSchema))
		.handler(async ({ context }) => {
			return await studentProgressService.getUserBadges(context.user.id);
		}),

	markBadgeSeen: protectedProcedure
		.route({
			method: "POST",
			path: "/student-progress/badges/{badgeId}/seen",
			tags: ["Student Progress"],
			summary: "Mark badge as seen",
		})
		.input(z.object({ badgeId: z.string() }))
		.output(z.void())
		.handler(async ({ context, input }) => {
			await studentProgressService.markBadgeSeen(context.user.id, input.badgeId);
		}),

	// ==========================================
	// WEAK AREAS
	// ==========================================

	getWeakAreas: protectedProcedure
		.route({
			method: "GET",
			path: "/student-progress/weak-areas",
			tags: ["Student Progress"],
			summary: "AI identifies struggling areas",
		})
		.input(z.object({}).optional().default({}))
		.output(z.array(weakAreaSchema))
		.handler(async ({ context }) => {
			return await studentProgressService.getWeakAreas(context.user.id);
		}),

	// ==========================================
	// COHORTS
	// ==========================================

	getCohorts: protectedProcedure
		.route({
			method: "GET",
			path: "/student-progress/cohorts",
			tags: ["Student Progress"],
			summary: "Get available cohorts",
		})
		.input(z.object({ activeOnly: z.boolean().optional() }).optional().default({}))
		.output(z.array(cohortSchema))
		.handler(async ({ input }) => {
			const cohorts = await studentProgressService.getCohorts(input.activeOnly ?? true);
			return cohorts.map((c) => {
				const { metadata, ...rest } = c;
				return {
					...rest,
					metadata: (metadata as Record<string, unknown> | null) ?? null,
				};
			});
		}),

	getCohort: protectedProcedure
		.route({
			method: "GET",
			path: "/student-progress/cohorts/{cohortId}",
			tags: ["Student Progress"],
			summary: "Get cohort details",
		})
		.input(z.object({ cohortId: z.string() }))
		.output(cohortSchema.nullable())
		.handler(async ({ input }) => {
			const cohort = await studentProgressService.getCohort(input.cohortId);
			if (!cohort) return null;
			const { metadata, ...rest } = cohort;
			return {
				...rest,
				metadata: (metadata as Record<string, unknown> | null) ?? null,
			};
		}),

	joinCohort: protectedProcedure
		.route({
			method: "POST",
			path: "/student-progress/cohorts/{cohortId}/join",
			tags: ["Student Progress"],
			summary: "Join a cohort",
		})
		.input(z.object({ cohortId: z.string() }))
		.output(z.string())
		.handler(async ({ context, input }) => {
			return await studentProgressService.joinCohort(context.user.id, input.cohortId);
		}),

	leaveCohort: protectedProcedure
		.route({
			method: "POST",
			path: "/student-progress/cohorts/{cohortId}/leave",
			tags: ["Student Progress"],
			summary: "Leave a cohort",
		})
		.input(z.object({ cohortId: z.string() }))
		.output(z.void())
		.handler(async ({ context, input }) => {
			await studentProgressService.leaveCohort(context.user.id, input.cohortId);
		}),

	// ==========================================
	// WEEKLY SNAPSHOTS
	// ==========================================

	createWeeklySnapshot: protectedProcedure
		.route({
			method: "POST",
			path: "/student-progress/snapshots",
			tags: ["Student Progress"],
			summary: "Create weekly progress snapshot",
		})
		.input(z.object({}).optional().default({}))
		.output(z.string())
		.handler(async ({ context }) => {
			return await studentProgressService.createWeeklySnapshot(context.user.id);
		}),

	getWeeklySnapshots: protectedProcedure
		.route({
			method: "GET",
			path: "/student-progress/snapshots",
			tags: ["Student Progress"],
			summary: "Get weekly progress snapshots",
		})
		.input(z.object({ limit: z.number().optional() }).optional().default({}))
		.output(z.array(weeklySnapshotSchema))
		.handler(async ({ context, input }) => {
			return await studentProgressService.getWeeklySnapshots(context.user.id, input.limit ?? 12);
		}),
};
