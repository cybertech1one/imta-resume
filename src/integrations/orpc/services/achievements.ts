import { ORPCError } from "@orpc/client";
import { and, desc, eq, gte, inArray, sql } from "drizzle-orm";
import { schema } from "@/integrations/drizzle";
import { db } from "@/integrations/drizzle/client";
import { generateId } from "@/utils/string";

export type AchievementTier = "bronze" | "silver" | "gold" | "platinum";
export type AchievementCategory =
	| "resume"
	| "interview"
	| "job_search"
	| "learning"
	| "engagement"
	| "networking"
	| "career";
export type ChallengeType = "daily" | "weekly";
export type NotificationType = "achievement" | "level_up" | "streak" | "challenge" | "reward";
export type RewardType = "theme" | "badge" | "feature" | "template";

// XP calculation helpers
const calculateLevelFromXp = (xp: number): number => {
	return Math.max(1, Math.floor(Math.sqrt(xp / 100)));
};

const calculateXpForLevel = (level: number): number => {
	return level * level * 100;
};

export const achievementsService = {
	// ==========================================
	// GAMIFICATION PROFILE
	// ==========================================

	// Get or create user's gamification profile
	getProfile: async (userId: string) => {
		let [profile] = await db
			.select()
			.from(schema.userGamificationProfile)
			.where(eq(schema.userGamificationProfile.userId, userId));

		if (!profile) {
			// Create a new profile
			const id = generateId();
			await db.insert(schema.userGamificationProfile).values({
				id,
				userId,
				totalXp: 0,
				currentStreak: 0,
				longestStreak: 0,
			});
			[profile] = await db
				.select()
				.from(schema.userGamificationProfile)
				.where(eq(schema.userGamificationProfile.userId, userId));
		}

		return profile;
	},

	// Update profile and handle streak
	updateStreak: async (userId: string) => {
		const profile = await achievementsService.getProfile(userId);
		const today = new Date().toISOString().split("T")[0];
		const lastLogin = profile.lastLoginDate;

		let newStreak = profile.currentStreak;

		if (!lastLogin) {
			// First login
			newStreak = 1;
		} else {
			const lastDate = new Date(lastLogin);
			const todayDate = new Date(today);
			const diffDays = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

			if (diffDays === 0) {
				// Same day, no change
			} else if (diffDays === 1) {
				// Consecutive day
				newStreak = profile.currentStreak + 1;
			} else {
				// Streak broken
				newStreak = 1;
			}
		}

		const longestStreak = Math.max(profile.longestStreak, newStreak);

		await db
			.update(schema.userGamificationProfile)
			.set({
				currentStreak: newStreak,
				longestStreak,
				lastLoginDate: today,
			})
			.where(eq(schema.userGamificationProfile.userId, userId));

		return { currentStreak: newStreak, longestStreak };
	},

	// Add XP to user
	addXp: async (userId: string, amount: number) => {
		const profile = await achievementsService.getProfile(userId);
		const oldLevel = calculateLevelFromXp(profile.totalXp);
		const newXp = profile.totalXp + amount;
		const newLevel = calculateLevelFromXp(newXp);

		await db
			.update(schema.userGamificationProfile)
			.set({ totalXp: newXp })
			.where(eq(schema.userGamificationProfile.userId, userId));

		// Check for level up
		if (newLevel > oldLevel) {
			// Create level up notification
			await db.insert(schema.achievementNotification).values({
				id: generateId(),
				userId,
				type: "level_up",
				title: "Level Up!",
				description: `Congratulations! You reached Level ${newLevel}!`,
				icon: "TrendUpIcon",
			});

			// Check for newly unlocked rewards
			const unlockedRewards = await db
				.select()
				.from(schema.unlockableReward)
				.where(
					and(
						gte(sql`${newLevel}`, schema.unlockableReward.requiredLevel),
						sql`${schema.unlockableReward.requiredLevel} > ${oldLevel}`,
					),
				);

			if (unlockedRewards.length > 0) {
				const rewardIds = unlockedRewards.map((r) => r.id);
				const existingRewards = await db
					.select({ rewardId: schema.userReward.rewardId })
					.from(schema.userReward)
					.where(and(eq(schema.userReward.userId, userId), inArray(schema.userReward.rewardId, rewardIds)));

				const existingRewardIds = new Set(existingRewards.map((r) => r.rewardId));
				const newRewards = unlockedRewards.filter((r) => !existingRewardIds.has(r.id));

				if (newRewards.length > 0) {
					await db.insert(schema.userReward).values(
						newRewards.map((reward) => ({
							id: generateId(),
							userId,
							rewardId: reward.id,
						})),
					);

					await db.insert(schema.achievementNotification).values(
						newRewards.map((reward) => ({
							id: generateId(),
							userId,
							type: "reward" as const,
							title: "New Reward Unlocked!",
							description: `You unlocked ${reward.title}!`,
							icon: reward.icon,
						})),
					);
				}
			}
		}

		return { oldXp: profile.totalXp, newXp, oldLevel, newLevel };
	},

	// Toggle leaderboard visibility
	toggleLeaderboardVisibility: async (userId: string, show: boolean) => {
		await db
			.update(schema.userGamificationProfile)
			.set({ showOnLeaderboard: show })
			.where(eq(schema.userGamificationProfile.userId, userId));
	},

	// ==========================================
	// ACHIEVEMENTS
	// ==========================================

	// Get all achievement definitions
	getAchievementDefinitions: async () => {
		return await db.select().from(schema.achievementDefinition);
	},

	// Get user's achievement progress
	getUserAchievements: async (userId: string) => {
		return await db.select().from(schema.userAchievement).where(eq(schema.userAchievement.userId, userId));
	},

	// Get user's achievements with definitions
	getUserAchievementsWithDefinitions: async (userId: string) => {
		const definitions = await achievementsService.getAchievementDefinitions();
		const userProgress = await achievementsService.getUserAchievements(userId);

		return definitions.map((def) => {
			const progress = userProgress.find((p) => p.achievementId === def.id);
			return {
				definition: def,
				progress: progress ?? null,
			};
		});
	},

	// Update achievement progress
	updateAchievementProgress: async (input: {
		userId: string;
		achievementId: string;
		incrementBy?: number;
		setTo?: number;
	}) => {
		const { userId, achievementId, incrementBy, setTo } = input;

		// Get achievement definition
		const [definition] = await db
			.select()
			.from(schema.achievementDefinition)
			.where(eq(schema.achievementDefinition.id, achievementId));

		if (!definition) {
			throw new ORPCError("NOT_FOUND", { message: "Achievement not found" });
		}

		// Get or create user achievement progress
		let [progress] = await db
			.select()
			.from(schema.userAchievement)
			.where(and(eq(schema.userAchievement.userId, userId), eq(schema.userAchievement.achievementId, achievementId)));

		if (!progress) {
			const id = generateId();
			await db.insert(schema.userAchievement).values({
				id,
				userId,
				achievementId,
				currentValue: 0,
				unlockedTiers: [],
			});
			[progress] = await db.select().from(schema.userAchievement).where(eq(schema.userAchievement.id, id));
		}

		// Calculate new value
		const newValue = setTo !== undefined ? setTo : progress.currentValue + (incrementBy ?? 1);

		// Check for newly unlocked tiers
		const tiers: { name: AchievementTier; target: number; xp: number }[] = [
			{ name: "bronze", target: definition.bronzeTarget, xp: definition.bronzeXp },
			{ name: "silver", target: definition.silverTarget, xp: definition.silverXp },
			{ name: "gold", target: definition.goldTarget, xp: definition.goldXp },
			{ name: "platinum", target: definition.platinumTarget, xp: definition.platinumXp },
		];

		const currentUnlocked = progress.unlockedTiers as string[];
		const newUnlockedTiers: string[] = [...currentUnlocked];
		let xpEarned = 0;

		for (const tier of tiers) {
			if (newValue >= tier.target && !currentUnlocked.includes(tier.name)) {
				newUnlockedTiers.push(tier.name);
				xpEarned += tier.xp;

				// Create achievement notification
				await db.insert(schema.achievementNotification).values({
					id: generateId(),
					userId,
					type: "achievement",
					title: "Achievement Unlocked!",
					description: `You earned the ${definition.title} ${tier.name} badge!`,
					icon: definition.icon,
				});
			}
		}

		// Update progress
		await db
			.update(schema.userAchievement)
			.set({
				currentValue: newValue,
				unlockedTiers: newUnlockedTiers,
				lastUnlockedAt: newUnlockedTiers.length > currentUnlocked.length ? new Date() : progress.lastUnlockedAt,
				isNew: newUnlockedTiers.length > currentUnlocked.length,
			})
			.where(eq(schema.userAchievement.id, progress.id));

		// Add XP if earned
		if (xpEarned > 0) {
			await achievementsService.addXp(userId, xpEarned);
		}

		return { newValue, newUnlockedTiers, xpEarned };
	},

	// Mark achievement as seen (clear isNew flag)
	markAchievementSeen: async (userId: string, achievementId: string) => {
		await db
			.update(schema.userAchievement)
			.set({ isNew: false })
			.where(and(eq(schema.userAchievement.userId, userId), eq(schema.userAchievement.achievementId, achievementId)));
	},

	// ==========================================
	// CHALLENGES
	// ==========================================

	// Get user's active challenges
	getChallenges: async (userId: string) => {
		const now = new Date();
		return await db
			.select()
			.from(schema.challenge)
			.where(and(eq(schema.challenge.userId, userId), gte(schema.challenge.expiresAt, now)))
			.orderBy(schema.challenge.expiresAt);
	},

	// Create a challenge for user
	createChallenge: async (input: {
		userId: string;
		title: string;
		description: string;
		icon: string;
		type: ChallengeType;
		target: number;
		xpReward: number;
		expiresAt: Date;
	}) => {
		const id = generateId();
		await db.insert(schema.challenge).values({
			id,
			...input,
			current: 0,
		});
		return id;
	},

	// Update challenge progress
	updateChallengeProgress: async (input: {
		userId: string;
		challengeId: string;
		incrementBy?: number;
		setTo?: number;
	}) => {
		const { userId, challengeId, incrementBy, setTo } = input;

		const [challenge] = await db
			.select()
			.from(schema.challenge)
			.where(and(eq(schema.challenge.id, challengeId), eq(schema.challenge.userId, userId)));

		if (!challenge) {
			throw new ORPCError("NOT_FOUND", { message: "Challenge not found" });
		}

		if (challenge.completedAt) {
			// Already completed
			return { completed: true, current: challenge.current };
		}

		const newValue = setTo !== undefined ? setTo : challenge.current + (incrementBy ?? 1);
		const completed = newValue >= challenge.target;

		await db
			.update(schema.challenge)
			.set({
				current: newValue,
				completedAt: completed ? new Date() : null,
			})
			.where(eq(schema.challenge.id, challengeId));

		// Award XP if completed
		if (completed && !challenge.completedAt) {
			await achievementsService.addXp(userId, challenge.xpReward);

			// Create notification
			await db.insert(schema.achievementNotification).values({
				id: generateId(),
				userId,
				type: "challenge",
				title: "Challenge Completed!",
				description: `You completed ${challenge.title}!`,
				icon: challenge.icon,
			});
		}

		return { completed, current: newValue };
	},

	// Generate daily challenges for a user
	generateDailyChallenges: async (userId: string) => {
		const now = new Date();
		const endOfDay = new Date(now);
		endOfDay.setHours(23, 59, 59, 999);

		// Check if user already has daily challenges for today
		const existingDaily = await db
			.select()
			.from(schema.challenge)
			.where(
				and(
					eq(schema.challenge.userId, userId),
					eq(schema.challenge.type, "daily"),
					gte(schema.challenge.expiresAt, now),
				),
			);

		if (existingDaily.length > 0) {
			return existingDaily;
		}

		// Create daily challenges
		const dailyChallenges = [
			{
				title: "Update Your Resume",
				description: "Make at least one edit to any of your resumes",
				icon: "PencilSimpleIcon",
				target: 1,
				xpReward: 25,
			},
			{
				title: "Practice Interview",
				description: "Complete a mock interview session",
				icon: "ChatsCircleIcon",
				target: 1,
				xpReward: 50,
			},
			{
				title: "Learn Something New",
				description: "Read 2 career articles or resources",
				icon: "BookOpenIcon",
				target: 2,
				xpReward: 30,
			},
		];

		const created = [];
		for (const challenge of dailyChallenges) {
			const id = await achievementsService.createChallenge({
				userId,
				...challenge,
				type: "daily",
				expiresAt: endOfDay,
			});
			created.push(id);
		}

		return await achievementsService.getChallenges(userId);
	},

	// Generate weekly challenges for a user
	generateWeeklyChallenges: async (userId: string) => {
		const now = new Date();
		const endOfWeek = new Date(now);
		endOfWeek.setDate(endOfWeek.getDate() + (7 - endOfWeek.getDay()));
		endOfWeek.setHours(23, 59, 59, 999);

		// Check if user already has weekly challenges
		const existingWeekly = await db
			.select()
			.from(schema.challenge)
			.where(
				and(
					eq(schema.challenge.userId, userId),
					eq(schema.challenge.type, "weekly"),
					gte(schema.challenge.expiresAt, now),
				),
			);

		if (existingWeekly.length > 0) {
			return existingWeekly;
		}

		// Create weekly challenges
		const weeklyChallenges = [
			{
				title: "Job Application Sprint",
				description: "Submit 10 job applications this week",
				icon: "BriefcaseIcon",
				target: 10,
				xpReward: 150,
			},
			{
				title: "Network Builder",
				description: "Add 5 new professional connections",
				icon: "UsersIcon",
				target: 5,
				xpReward: 100,
			},
		];

		for (const challenge of weeklyChallenges) {
			await achievementsService.createChallenge({
				userId,
				...challenge,
				type: "weekly",
				expiresAt: endOfWeek,
			});
		}

		return await achievementsService.getChallenges(userId);
	},

	// ==========================================
	// LEADERBOARD
	// ==========================================

	// Get global leaderboard
	getLeaderboard: async (userId: string, limit = 10) => {
		// Get top users
		const topUsers = await db
			.select({
				id: schema.userGamificationProfile.id,
				odataUserId: schema.userGamificationProfile.userId,
				totalXp: schema.userGamificationProfile.totalXp,
				userName: schema.user.name,
				avatarUrl: schema.user.image,
			})
			.from(schema.userGamificationProfile)
			.innerJoin(schema.user, eq(schema.userGamificationProfile.userId, schema.user.id))
			.where(eq(schema.userGamificationProfile.showOnLeaderboard, true))
			.orderBy(desc(schema.userGamificationProfile.totalXp))
			.limit(limit);

		// Get achievement counts for each user
		const leaderboard = await Promise.all(
			topUsers.map(async (user, index) => {
				const achievements = await db
					.select()
					.from(schema.userAchievement)
					.where(eq(schema.userAchievement.userId, user.odataUserId));

				const achievementCount = achievements.reduce((acc, a) => acc + (a.unlockedTiers as string[]).length, 0);

				return {
					rank: index + 1,
					odataUserId: user.odataUserId,
					userName: user.userName,
					avatarUrl: user.avatarUrl,
					level: calculateLevelFromXp(user.totalXp),
					totalXp: user.totalXp,
					achievementCount,
					isCurrentUser: user.odataUserId === userId,
				};
			}),
		);

		// Check if current user is in leaderboard
		const currentUserInBoard = leaderboard.some((u) => u.isCurrentUser);

		if (!currentUserInBoard) {
			// Add current user's position
			const profile = await achievementsService.getProfile(userId);
			const [userData] = await db
				.select({ name: schema.user.name, image: schema.user.image })
				.from(schema.user)
				.where(eq(schema.user.id, userId));

			// Get user's rank
			const [rankResult] = await db
				.select({ count: sql<number>`count(*)` })
				.from(schema.userGamificationProfile)
				.where(
					and(
						eq(schema.userGamificationProfile.showOnLeaderboard, true),
						gte(schema.userGamificationProfile.totalXp, profile.totalXp),
					),
				);

			const achievements = await db
				.select()
				.from(schema.userAchievement)
				.where(eq(schema.userAchievement.userId, userId));

			const achievementCount = achievements.reduce((acc, a) => acc + (a.unlockedTiers as string[]).length, 0);

			leaderboard.push({
				rank: rankResult?.count ?? leaderboard.length + 1,
				odataUserId: userId,
				userName: userData?.name ?? "You",
				avatarUrl: userData?.image,
				level: calculateLevelFromXp(profile.totalXp),
				totalXp: profile.totalXp,
				achievementCount,
				isCurrentUser: true,
			});
		}

		return leaderboard;
	},

	// ==========================================
	// MILESTONES
	// ==========================================

	// Get all milestones
	getMilestones: async () => {
		return await db.select().from(schema.progressMilestone).orderBy(schema.progressMilestone.xpRequired);
	},

	// Get user's milestone progress
	getUserMilestones: async (userId: string) => {
		const profile = await achievementsService.getProfile(userId);
		const allMilestones = await achievementsService.getMilestones();
		const userMilestones = await db.select().from(schema.userMilestone).where(eq(schema.userMilestone.userId, userId));

		const unlockedIds = new Set(userMilestones.map((m) => m.milestoneId));

		return allMilestones.map((milestone) => ({
			...milestone,
			isUnlocked: unlockedIds.has(milestone.id) || profile.totalXp >= milestone.xpRequired,
		}));
	},

	// ==========================================
	// REWARDS
	// ==========================================

	// Get all rewards
	getRewards: async () => {
		return await db.select().from(schema.unlockableReward).orderBy(schema.unlockableReward.requiredLevel);
	},

	// Get user's rewards
	getUserRewards: async (userId: string) => {
		const profile = await achievementsService.getProfile(userId);
		const currentLevel = calculateLevelFromXp(profile.totalXp);
		const allRewards = await achievementsService.getRewards();
		const userRewards = await db.select().from(schema.userReward).where(eq(schema.userReward.userId, userId));

		const unlockedMap = new Map(userRewards.map((r) => [r.rewardId, r] as const));

		return allRewards.map((reward) => {
			const userReward = unlockedMap.get(reward.id);
			return {
				...reward,
				isUnlocked: userReward !== undefined || currentLevel >= reward.requiredLevel,
				isActive: userReward ? userReward.isActive : false,
			};
		});
	},

	// Activate a reward
	activateReward: async (userId: string, rewardId: string) => {
		const [reward] = await db.select().from(schema.unlockableReward).where(eq(schema.unlockableReward.id, rewardId));

		if (!reward) {
			throw new ORPCError("NOT_FOUND", { message: "Reward not found" });
		}

		const profile = await achievementsService.getProfile(userId);
		const currentLevel = calculateLevelFromXp(profile.totalXp);

		if (currentLevel < reward.requiredLevel) {
			throw new ORPCError("FORBIDDEN", { message: "Reward not unlocked yet" });
		}

		// Deactivate other rewards of the same type
		await db.update(schema.userReward).set({ isActive: false }).where(eq(schema.userReward.userId, userId));

		// Activate or create user reward
		const [existing] = await db
			.select()
			.from(schema.userReward)
			.where(and(eq(schema.userReward.userId, userId), eq(schema.userReward.rewardId, rewardId)));

		if (existing) {
			await db.update(schema.userReward).set({ isActive: true }).where(eq(schema.userReward.id, existing.id));
		} else {
			await db.insert(schema.userReward).values({
				id: generateId(),
				userId,
				rewardId,
				isActive: true,
			});
		}
	},

	// ==========================================
	// NOTIFICATIONS
	// ==========================================

	// Get user notifications
	getNotifications: async (userId: string, limit = 20) => {
		return await db
			.select()
			.from(schema.achievementNotification)
			.where(eq(schema.achievementNotification.userId, userId))
			.orderBy(desc(schema.achievementNotification.createdAt))
			.limit(limit);
	},

	// Mark notification as read
	markNotificationRead: async (userId: string, notificationId: string) => {
		await db
			.update(schema.achievementNotification)
			.set({ isRead: true })
			.where(
				and(eq(schema.achievementNotification.id, notificationId), eq(schema.achievementNotification.userId, userId)),
			);
	},

	// Mark all notifications as read
	markAllNotificationsRead: async (userId: string) => {
		await db
			.update(schema.achievementNotification)
			.set({ isRead: true })
			.where(eq(schema.achievementNotification.userId, userId));
	},

	// Get notification preferences
	getNotificationPreferences: async (userId: string) => {
		let [prefs] = await db
			.select()
			.from(schema.achievementNotificationPreferences)
			.where(eq(schema.achievementNotificationPreferences.userId, userId));

		if (!prefs) {
			const id = generateId();
			await db.insert(schema.achievementNotificationPreferences).values({
				id,
				userId,
			});
			[prefs] = await db
				.select()
				.from(schema.achievementNotificationPreferences)
				.where(eq(schema.achievementNotificationPreferences.userId, userId));
		}

		return prefs;
	},

	// Update notification preferences
	updateNotificationPreferences: async (input: {
		userId: string;
		achievements?: boolean;
		levelUps?: boolean;
		streaks?: boolean;
		challenges?: boolean;
		leaderboard?: boolean;
	}) => {
		const { userId, ...updates } = input;
		await achievementsService.getNotificationPreferences(userId); // Ensure exists

		await db
			.update(schema.achievementNotificationPreferences)
			.set(updates)
			.where(eq(schema.achievementNotificationPreferences.userId, userId));
	},

	// ==========================================
	// STATISTICS
	// ==========================================

	// Get user's gamification statistics
	getStatistics: async (userId: string) => {
		const profile = await achievementsService.getProfile(userId);
		const achievements = await achievementsService.getUserAchievements(userId);
		const challenges = await achievementsService.getChallenges(userId);
		const notifications = await db
			.select()
			.from(schema.achievementNotification)
			.where(and(eq(schema.achievementNotification.userId, userId), eq(schema.achievementNotification.isRead, false)));

		const totalAchievements = achievements.reduce((acc, a) => acc + (a.unlockedTiers as string[]).length, 0);
		const completedChallenges = challenges.filter((c) => c.completedAt !== null).length;
		const currentLevel = calculateLevelFromXp(profile.totalXp);
		const currentLevelXp = calculateXpForLevel(currentLevel);
		const nextLevelXp = calculateXpForLevel(currentLevel + 1);
		const xpProgress = ((profile.totalXp - currentLevelXp) / (nextLevelXp - currentLevelXp)) * 100;

		return {
			totalXp: profile.totalXp,
			currentLevel,
			xpProgress: Math.max(0, Math.min(100, xpProgress)),
			xpToNextLevel: nextLevelXp - profile.totalXp,
			currentStreak: profile.currentStreak,
			longestStreak: profile.longestStreak,
			totalAchievements,
			activeChallenges: challenges.length,
			completedChallenges,
			unreadNotifications: notifications.length,
			showOnLeaderboard: profile.showOnLeaderboard,
		};
	},
};
