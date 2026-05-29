import z from "zod";
import { protectedProcedure } from "../context";
import { achievementsService } from "../services/achievements";

// Zod schemas
const achievementCategorySchema = z.enum([
	"resume",
	"interview",
	"job_search",
	"learning",
	"engagement",
	"networking",
	"career",
]);
const challengeTypeSchema = z.enum(["daily", "weekly"]);
const notificationTypeSchema = z.enum(["achievement", "level_up", "streak", "challenge", "reward"]);
const rewardTypeSchema = z.enum(["theme", "badge", "feature", "template"]);

// Output schemas
const achievementDefinitionSchema = z.object({
	id: z.string(),
	title: z.string(),
	description: z.string(),
	icon: z.string(),
	category: achievementCategorySchema,
	unit: z.string(),
	bronzeTarget: z.number(),
	bronzeXp: z.number(),
	silverTarget: z.number(),
	silverXp: z.number(),
	goldTarget: z.number(),
	goldXp: z.number(),
	platinumTarget: z.number(),
	platinumXp: z.number(),
	createdAt: z.coerce.date(),
});

const userAchievementSchema = z.object({
	id: z.string().uuid(),
	userId: z.string(),
	achievementId: z.string(),
	currentValue: z.number(),
	unlockedTiers: z.array(z.string()),
	lastUnlockedAt: z.coerce.date().nullable(),
	isNew: z.boolean(),
	createdAt: z.coerce.date(),
	updatedAt: z.coerce.date(),
});

const userAchievementWithDefinitionSchema = z.object({
	definition: achievementDefinitionSchema,
	progress: userAchievementSchema.nullable(),
});

const gamificationProfileSchema = z.object({
	id: z.string().uuid(),
	userId: z.string(),
	totalXp: z.number(),
	currentStreak: z.number(),
	longestStreak: z.number(),
	lastLoginDate: z.string().nullable(),
	showOnLeaderboard: z.boolean(),
	createdAt: z.coerce.date(),
	updatedAt: z.coerce.date(),
});

const challengeSchema = z.object({
	id: z.string().uuid(),
	userId: z.string(),
	title: z.string(),
	description: z.string(),
	icon: z.string(),
	type: challengeTypeSchema,
	target: z.number(),
	current: z.number(),
	xpReward: z.number(),
	expiresAt: z.coerce.date(),
	completedAt: z.coerce.date().nullable(),
	createdAt: z.coerce.date(),
});

const leaderboardEntrySchema = z.object({
	rank: z.number(),
	odataUserId: z.string(),
	userName: z.string(),
	avatarUrl: z.string().nullable(),
	level: z.number(),
	totalXp: z.number(),
	achievementCount: z.number(),
	isCurrentUser: z.boolean(),
});

const milestoneSchema = z.object({
	id: z.string(),
	title: z.string(),
	description: z.string(),
	icon: z.string(),
	xpRequired: z.number(),
	reward: z.string(),
	createdAt: z.coerce.date(),
	isUnlocked: z.boolean(),
});

const rewardSchema = z.object({
	id: z.string(),
	title: z.string(),
	description: z.string(),
	icon: z.string(),
	type: rewardTypeSchema,
	requiredLevel: z.number(),
	createdAt: z.coerce.date(),
	isUnlocked: z.boolean(),
	isActive: z.boolean(),
});

const notificationSchema = z.object({
	id: z.string().uuid(),
	userId: z.string(),
	type: notificationTypeSchema,
	title: z.string(),
	description: z.string(),
	icon: z.string(),
	isRead: z.boolean(),
	createdAt: z.coerce.date(),
});

const notificationPreferencesSchema = z.object({
	id: z.string().uuid(),
	userId: z.string(),
	achievements: z.boolean(),
	levelUps: z.boolean(),
	streaks: z.boolean(),
	challenges: z.boolean(),
	leaderboard: z.boolean(),
	createdAt: z.coerce.date(),
	updatedAt: z.coerce.date(),
});

const statisticsSchema = z.object({
	totalXp: z.number(),
	currentLevel: z.number(),
	xpProgress: z.number(),
	xpToNextLevel: z.number(),
	currentStreak: z.number(),
	longestStreak: z.number(),
	totalAchievements: z.number(),
	activeChallenges: z.number(),
	completedChallenges: z.number(),
	unreadNotifications: z.number(),
	showOnLeaderboard: z.boolean(),
});

export const achievementsRouter = {
	// ==========================================
	// PROFILE & STATISTICS
	// ==========================================

	getProfile: protectedProcedure
		.route({
			method: "GET",
			path: "/achievements/profile",
			tags: ["Achievements"],
			summary: "Get user's gamification profile",
		})
		.input(z.object({}).optional().default({}))
		.output(gamificationProfileSchema)
		.handler(async ({ context }) => {
			return await achievementsService.getProfile(context.user.id);
		}),

	getStatistics: protectedProcedure
		.route({
			method: "GET",
			path: "/achievements/statistics",
			tags: ["Achievements"],
			summary: "Get user's gamification statistics",
		})
		.input(z.object({}).optional().default({}))
		.output(statisticsSchema)
		.handler(async ({ context }) => {
			return await achievementsService.getStatistics(context.user.id);
		}),

	updateStreak: protectedProcedure
		.route({
			method: "POST",
			path: "/achievements/streak",
			tags: ["Achievements"],
			summary: "Update user's login streak",
		})
		.input(z.object({}).optional().default({}))
		.output(z.object({ currentStreak: z.number(), longestStreak: z.number() }))
		.handler(async ({ context }) => {
			return await achievementsService.updateStreak(context.user.id);
		}),

	toggleLeaderboardVisibility: protectedProcedure
		.route({
			method: "POST",
			path: "/achievements/leaderboard/visibility",
			tags: ["Achievements"],
			summary: "Toggle leaderboard visibility",
		})
		.input(z.object({ show: z.boolean() }))
		.output(z.void())
		.handler(async ({ context, input }) => {
			await achievementsService.toggleLeaderboardVisibility(context.user.id, input.show);
		}),

	// ==========================================
	// ACHIEVEMENTS
	// ==========================================

	getAchievementDefinitions: protectedProcedure
		.route({
			method: "GET",
			path: "/achievements/definitions",
			tags: ["Achievements"],
			summary: "Get all achievement definitions",
		})
		.input(z.object({}).optional().default({}))
		.output(z.array(achievementDefinitionSchema))
		.handler(async () => {
			return await achievementsService.getAchievementDefinitions();
		}),

	getUserAchievements: protectedProcedure
		.route({
			method: "GET",
			path: "/achievements/user",
			tags: ["Achievements"],
			summary: "Get user's achievement progress",
		})
		.input(z.object({}).optional().default({}))
		.output(z.array(userAchievementSchema))
		.handler(async ({ context }) => {
			return await achievementsService.getUserAchievements(context.user.id);
		}),

	getUserAchievementsWithDefinitions: protectedProcedure
		.route({
			method: "GET",
			path: "/achievements/user/full",
			tags: ["Achievements"],
			summary: "Get user's achievements with definitions",
		})
		.input(z.object({}).optional().default({}))
		.output(z.array(userAchievementWithDefinitionSchema))
		.handler(async ({ context }) => {
			return await achievementsService.getUserAchievementsWithDefinitions(context.user.id);
		}),

	updateAchievementProgress: protectedProcedure
		.route({
			method: "POST",
			path: "/achievements/progress",
			tags: ["Achievements"],
			summary: "Update achievement progress",
		})
		.input(
			z.object({
				achievementId: z.string(),
				incrementBy: z.number().optional(),
				setTo: z.number().optional(),
			}),
		)
		.output(
			z.object({
				newValue: z.number(),
				newUnlockedTiers: z.array(z.string()),
				xpEarned: z.number(),
			}),
		)
		.handler(async ({ context, input }) => {
			return await achievementsService.updateAchievementProgress({
				userId: context.user.id,
				...input,
			});
		}),

	markAchievementSeen: protectedProcedure
		.route({
			method: "POST",
			path: "/achievements/{achievementId}/seen",
			tags: ["Achievements"],
			summary: "Mark achievement as seen",
		})
		.input(z.object({ achievementId: z.string() }))
		.output(z.void())
		.handler(async ({ context, input }) => {
			await achievementsService.markAchievementSeen(context.user.id, input.achievementId);
		}),

	// ==========================================
	// CHALLENGES
	// ==========================================

	getChallenges: protectedProcedure
		.route({
			method: "GET",
			path: "/achievements/challenges",
			tags: ["Achievements"],
			summary: "Get user's active challenges",
		})
		.input(z.object({}).optional().default({}))
		.output(z.array(challengeSchema))
		.handler(async ({ context }) => {
			// Generate challenges if needed
			await achievementsService.generateDailyChallenges(context.user.id);
			await achievementsService.generateWeeklyChallenges(context.user.id);
			return await achievementsService.getChallenges(context.user.id);
		}),

	updateChallengeProgress: protectedProcedure
		.route({
			method: "POST",
			path: "/achievements/challenges/{challengeId}/progress",
			tags: ["Achievements"],
			summary: "Update challenge progress",
		})
		.input(
			z.object({
				challengeId: z.string(),
				incrementBy: z.number().optional(),
				setTo: z.number().optional(),
			}),
		)
		.output(z.object({ completed: z.boolean(), current: z.number() }))
		.handler(async ({ context, input }) => {
			return await achievementsService.updateChallengeProgress({
				userId: context.user.id,
				...input,
			});
		}),

	// ==========================================
	// LEADERBOARD
	// ==========================================

	getLeaderboard: protectedProcedure
		.route({
			method: "GET",
			path: "/achievements/leaderboard",
			tags: ["Achievements"],
			summary: "Get global leaderboard",
		})
		.input(z.object({ limit: z.number().optional() }).optional().default({}))
		.output(z.array(leaderboardEntrySchema))
		.handler(async ({ context, input }) => {
			return await achievementsService.getLeaderboard(context.user.id, input.limit);
		}),

	// ==========================================
	// MILESTONES
	// ==========================================

	getMilestones: protectedProcedure
		.route({
			method: "GET",
			path: "/achievements/milestones",
			tags: ["Achievements"],
			summary: "Get user's milestone progress",
		})
		.input(z.object({}).optional().default({}))
		.output(z.array(milestoneSchema))
		.handler(async ({ context }) => {
			return await achievementsService.getUserMilestones(context.user.id);
		}),

	// ==========================================
	// REWARDS
	// ==========================================

	getRewards: protectedProcedure
		.route({
			method: "GET",
			path: "/achievements/rewards",
			tags: ["Achievements"],
			summary: "Get user's rewards",
		})
		.input(z.object({}).optional().default({}))
		.output(z.array(rewardSchema))
		.handler(async ({ context }) => {
			return await achievementsService.getUserRewards(context.user.id);
		}),

	activateReward: protectedProcedure
		.route({
			method: "POST",
			path: "/achievements/rewards/{rewardId}/activate",
			tags: ["Achievements"],
			summary: "Activate a reward",
		})
		.input(z.object({ rewardId: z.string() }))
		.output(z.void())
		.handler(async ({ context, input }) => {
			await achievementsService.activateReward(context.user.id, input.rewardId);
		}),

	// ==========================================
	// NOTIFICATIONS
	// ==========================================

	getNotifications: protectedProcedure
		.route({
			method: "GET",
			path: "/achievements/notifications",
			tags: ["Achievements"],
			summary: "Get user's notifications",
		})
		.input(z.object({ limit: z.number().optional() }).optional().default({}))
		.output(z.array(notificationSchema))
		.handler(async ({ context, input }) => {
			return await achievementsService.getNotifications(context.user.id, input.limit);
		}),

	markNotificationRead: protectedProcedure
		.route({
			method: "POST",
			path: "/achievements/notifications/{notificationId}/read",
			tags: ["Achievements"],
			summary: "Mark notification as read",
		})
		.input(z.object({ notificationId: z.string() }))
		.output(z.void())
		.handler(async ({ context, input }) => {
			await achievementsService.markNotificationRead(context.user.id, input.notificationId);
		}),

	markAllNotificationsRead: protectedProcedure
		.route({
			method: "POST",
			path: "/achievements/notifications/read-all",
			tags: ["Achievements"],
			summary: "Mark all notifications as read",
		})
		.input(z.object({}).optional().default({}))
		.output(z.void())
		.handler(async ({ context }) => {
			await achievementsService.markAllNotificationsRead(context.user.id);
		}),

	getNotificationPreferences: protectedProcedure
		.route({
			method: "GET",
			path: "/achievements/notifications/preferences",
			tags: ["Achievements"],
			summary: "Get notification preferences",
		})
		.input(z.object({}).optional().default({}))
		.output(notificationPreferencesSchema)
		.handler(async ({ context }) => {
			return await achievementsService.getNotificationPreferences(context.user.id);
		}),

	updateNotificationPreferences: protectedProcedure
		.route({
			method: "PUT",
			path: "/achievements/notifications/preferences",
			tags: ["Achievements"],
			summary: "Update notification preferences",
		})
		.input(
			z.object({
				achievements: z.boolean().optional(),
				levelUps: z.boolean().optional(),
				streaks: z.boolean().optional(),
				challenges: z.boolean().optional(),
				leaderboard: z.boolean().optional(),
			}),
		)
		.output(z.void())
		.handler(async ({ context, input }) => {
			await achievementsService.updateNotificationPreferences({
				userId: context.user.id,
				...input,
			});
		}),
};
