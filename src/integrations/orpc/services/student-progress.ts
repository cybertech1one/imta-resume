import { and, avg, count, desc, eq, gte, lte, sql } from "drizzle-orm";
import { schema } from "@/integrations/drizzle";
import { db } from "@/integrations/drizzle/client";
import type { BadgeType, ProgressActivityAction, SkillLevel } from "@/integrations/drizzle/schema";
import { generateId } from "@/utils/string";

// Badge definitions with criteria and rewards
const BADGE_DEFINITIONS: Record<
	BadgeType,
	{
		name: string;
		nameFr: string;
		description: string;
		descriptionFr: string;
		icon: string;
		tiers: { tier: string; threshold: number; xp: number }[];
	}
> = {
	first_resume: {
		name: "Resume Creator",
		nameFr: "Createur de CV",
		description: "Created your first resume",
		descriptionFr: "Cree votre premier CV",
		icon: "FileText",
		tiers: [{ tier: "bronze", threshold: 1, xp: 50 }],
	},
	resume_master: {
		name: "Resume Master",
		nameFr: "Maitre du CV",
		description: "Created multiple polished resumes",
		descriptionFr: "Cree plusieurs CV professionnels",
		icon: "Files",
		tiers: [
			{ tier: "bronze", threshold: 3, xp: 100 },
			{ tier: "silver", threshold: 5, xp: 200 },
			{ tier: "gold", threshold: 10, xp: 400 },
			{ tier: "platinum", threshold: 20, xp: 800 },
		],
	},
	interview_ready: {
		name: "Interview Ready",
		nameFr: "Pret pour l'entretien",
		description: "Completed interview practice sessions",
		descriptionFr: "Complete des sessions de pratique d'entretien",
		icon: "UserSound",
		tiers: [
			{ tier: "bronze", threshold: 1, xp: 75 },
			{ tier: "silver", threshold: 5, xp: 150 },
			{ tier: "gold", threshold: 15, xp: 300 },
		],
	},
	interview_champion: {
		name: "Interview Champion",
		nameFr: "Champion d'entretien",
		description: "Achieved high scores in interview practice",
		descriptionFr: "Obtenu des scores eleves en pratique d'entretien",
		icon: "Trophy",
		tiers: [
			{ tier: "bronze", threshold: 70, xp: 100 },
			{ tier: "silver", threshold: 85, xp: 250 },
			{ tier: "gold", threshold: 95, xp: 500 },
		],
	},
	skill_seeker: {
		name: "Skill Seeker",
		nameFr: "Chercheur de competences",
		description: "Started learning new skills",
		descriptionFr: "Commence a apprendre de nouvelles competences",
		icon: "MagnifyingGlass",
		tiers: [
			{ tier: "bronze", threshold: 3, xp: 50 },
			{ tier: "silver", threshold: 10, xp: 150 },
			{ tier: "gold", threshold: 25, xp: 350 },
		],
	},
	skill_expert: {
		name: "Skill Expert",
		nameFr: "Expert en competences",
		description: "Reached advanced level in skills",
		descriptionFr: "Atteint le niveau avance dans les competences",
		icon: "Star",
		tiers: [
			{ tier: "bronze", threshold: 1, xp: 150 },
			{ tier: "silver", threshold: 3, xp: 400 },
			{ tier: "gold", threshold: 5, xp: 750 },
			{ tier: "platinum", threshold: 10, xp: 1500 },
		],
	},
	consistency_streak: {
		name: "Consistency Champion",
		nameFr: "Champion de la regularite",
		description: "Maintained a learning streak",
		descriptionFr: "Maintenu une serie d'apprentissage",
		icon: "Fire",
		tiers: [
			{ tier: "bronze", threshold: 7, xp: 100 },
			{ tier: "silver", threshold: 14, xp: 250 },
			{ tier: "gold", threshold: 30, xp: 600 },
			{ tier: "platinum", threshold: 60, xp: 1200 },
		],
	},
	early_bird: {
		name: "Early Bird",
		nameFr: "Leve-tot",
		description: "Completed activities in the morning",
		descriptionFr: "Complete des activites le matin",
		icon: "SunHorizon",
		tiers: [
			{ tier: "bronze", threshold: 5, xp: 50 },
			{ tier: "silver", threshold: 20, xp: 150 },
			{ tier: "gold", threshold: 50, xp: 350 },
		],
	},
	night_owl: {
		name: "Night Owl",
		nameFr: "Oiseau de nuit",
		description: "Completed activities late at night",
		descriptionFr: "Complete des activites tard le soir",
		icon: "Moon",
		tiers: [
			{ tier: "bronze", threshold: 5, xp: 50 },
			{ tier: "silver", threshold: 20, xp: 150 },
			{ tier: "gold", threshold: 50, xp: 350 },
		],
	},
	fast_learner: {
		name: "Fast Learner",
		nameFr: "Apprenant rapide",
		description: "Completed lessons quickly with high scores",
		descriptionFr: "Complete des lecons rapidement avec des scores eleves",
		icon: "Lightning",
		tiers: [
			{ tier: "bronze", threshold: 5, xp: 100 },
			{ tier: "silver", threshold: 15, xp: 300 },
			{ tier: "gold", threshold: 30, xp: 600 },
		],
	},
	perfectionist: {
		name: "Perfectionist",
		nameFr: "Perfectionniste",
		description: "Achieved perfect scores",
		descriptionFr: "Obtenu des scores parfaits",
		icon: "CheckCircle",
		tiers: [
			{ tier: "bronze", threshold: 1, xp: 75 },
			{ tier: "silver", threshold: 5, xp: 200 },
			{ tier: "gold", threshold: 15, xp: 500 },
			{ tier: "platinum", threshold: 30, xp: 1000 },
		],
	},
	team_player: {
		name: "Team Player",
		nameFr: "Joueur d'equipe",
		description: "Participated in peer activities",
		descriptionFr: "Participe a des activites entre pairs",
		icon: "Users",
		tiers: [
			{ tier: "bronze", threshold: 3, xp: 75 },
			{ tier: "silver", threshold: 10, xp: 200 },
			{ tier: "gold", threshold: 25, xp: 450 },
		],
	},
	mentor_helper: {
		name: "Mentor Helper",
		nameFr: "Aide mentor",
		description: "Helped other students or received mentorship",
		descriptionFr: "Aide d'autres etudiants ou recu du mentorat",
		icon: "HandHeart",
		tiers: [
			{ tier: "bronze", threshold: 1, xp: 100 },
			{ tier: "silver", threshold: 5, xp: 300 },
			{ tier: "gold", threshold: 10, xp: 600 },
		],
	},
	goal_crusher: {
		name: "Goal Crusher",
		nameFr: "Ecraseur d'objectifs",
		description: "Achieved learning goals",
		descriptionFr: "Atteint des objectifs d'apprentissage",
		icon: "Target",
		tiers: [
			{ tier: "bronze", threshold: 1, xp: 75 },
			{ tier: "silver", threshold: 5, xp: 200 },
			{ tier: "gold", threshold: 15, xp: 500 },
			{ tier: "platinum", threshold: 30, xp: 1000 },
		],
	},
	certificate_collector: {
		name: "Certificate Collector",
		nameFr: "Collectionneur de certificats",
		description: "Earned certifications",
		descriptionFr: "Obtenu des certifications",
		icon: "Certificate",
		tiers: [
			{ tier: "bronze", threshold: 1, xp: 150 },
			{ tier: "silver", threshold: 3, xp: 400 },
			{ tier: "gold", threshold: 5, xp: 750 },
			{ tier: "platinum", threshold: 10, xp: 1500 },
		],
	},
};

// Skill level weights for score calculation
const SKILL_LEVEL_SCORES: Record<SkillLevel, number> = {
	beginner: 10,
	elementary: 25,
	intermediate: 50,
	upper_intermediate: 70,
	advanced: 85,
	expert: 100,
};

export type TrackActivityInput = {
	userId: string;
	action: ProgressActivityAction;
	entityType?: string;
	entityId?: string;
	entityName?: string;
	durationMinutes?: number;
	scoreAchieved?: number;
	metadata?: Record<string, unknown>;
	sessionId?: string;
	deviceType?: string;
};

export type SkillProgressionInput = {
	userId: string;
	skillId: string;
	skillName: string;
	skillNameFr?: string;
	currentLevel: SkillLevel;
	score?: number;
	assessmentType: string;
	notes?: string;
};

export type AwardBadgeInput = {
	userId: string;
	badgeType: BadgeType;
	criteriaValue?: number;
};

export type WeakAreaResult = {
	skillId: string;
	skillName: string;
	skillNameFr?: string;
	currentLevel: SkillLevel;
	averageScore: number;
	recentTrend: "improving" | "declining" | "stable";
	suggestedActions: string[];
	practiceCount: number;
};

export const studentProgressService = {
	// ==========================================
	// ACTIVITY TRACKING
	// ==========================================

	trackActivity: async (input: TrackActivityInput): Promise<string> => {
		const id = generateId();

		// Insert activity log
		await db.insert(schema.progressActivityLog).values({
			id,
			userId: input.userId,
			action: input.action,
			entityType: input.entityType,
			entityId: input.entityId,
			entityName: input.entityName,
			durationMinutes: input.durationMinutes,
			scoreAchieved: input.scoreAchieved,
			metadata: input.metadata ?? {},
			sessionId: input.sessionId,
			deviceType: input.deviceType,
			completedAt: input.action.includes("completed") ? new Date() : null,
		});

		// Update student progress
		await studentProgressService.updateProgressFromActivity(input.userId, input);

		return id;
	},

	getActivityLog: async (userId: string, limit = 50, offset = 0) => {
		return await db
			.select()
			.from(schema.progressActivityLog)
			.where(eq(schema.progressActivityLog.userId, userId))
			.orderBy(desc(schema.progressActivityLog.createdAt))
			.limit(limit)
			.offset(offset);
	},

	getActivityStats: async (userId: string, days = 30) => {
		const startDate = new Date();
		startDate.setDate(startDate.getDate() - days);

		const activities = await db
			.select({
				action: schema.progressActivityLog.action,
				count: count(),
				totalDuration: sql<number>`COALESCE(SUM(${schema.progressActivityLog.durationMinutes}), 0)`,
				avgScore: avg(schema.progressActivityLog.scoreAchieved),
			})
			.from(schema.progressActivityLog)
			.where(and(eq(schema.progressActivityLog.userId, userId), gte(schema.progressActivityLog.createdAt, startDate)))
			.groupBy(schema.progressActivityLog.action);

		return activities;
	},

	// ==========================================
	// PROGRESS SCORE CALCULATION
	// ==========================================

	calculateProgressScore: async (userId: string): Promise<number> => {
		// Get or create progress record
		let progress = await db
			.select()
			.from(schema.studentProgress)
			.where(eq(schema.studentProgress.userId, userId))
			.limit(1);

		if (progress.length === 0) {
			await db.insert(schema.studentProgress).values({
				id: generateId(),
				userId,
			});
			progress = await db.select().from(schema.studentProgress).where(eq(schema.studentProgress.userId, userId));
		}

		const p = progress[0];

		// Calculate weighted score from various metrics
		const resumeWeight = 0.25;
		const interviewWeight = 0.25;
		const jobSearchWeight = 0.2;
		const activityWeight = 0.15;
		const streakWeight = 0.15;

		const streakScore = Math.min(100, p.currentStreak * 5); // Max out at 20 days
		const activityScore = Math.min(100, p.totalLessonsCompleted * 2 + p.totalQuizzesTaken * 5);

		const overallScore = Math.round(
			p.resumeCompleteness * resumeWeight +
				p.interviewReadiness * interviewWeight +
				p.jobSearchReadiness * jobSearchWeight +
				activityScore * activityWeight +
				streakScore * streakWeight,
		);

		// Update progress record
		await db
			.update(schema.studentProgress)
			.set({ overallScore, updatedAt: new Date() })
			.where(eq(schema.studentProgress.userId, userId));

		return overallScore;
	},

	getProgress: async (userId: string) => {
		const progress = await db
			.select()
			.from(schema.studentProgress)
			.where(eq(schema.studentProgress.userId, userId))
			.limit(1);

		if (progress.length === 0) {
			// Create default progress record
			const id = generateId();
			await db.insert(schema.studentProgress).values({ id, userId });
			return (await db.select().from(schema.studentProgress).where(eq(schema.studentProgress.userId, userId)))[0];
		}

		return progress[0];
	},

	updateProgressFromActivity: async (userId: string, activity: TrackActivityInput): Promise<void> => {
		const progress = await studentProgressService.getProgress(userId);
		const today = new Date().toISOString().split("T")[0];

		const updates: Partial<typeof schema.studentProgress.$inferInsert> = {
			lastActivityDate: today,
			updatedAt: new Date(),
		};

		// Update streak
		if (progress.lastActivityDate) {
			const lastDate = new Date(progress.lastActivityDate);
			const todayDate = new Date(today);
			const diffDays = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

			if (diffDays === 1) {
				updates.currentStreak = progress.currentStreak + 1;
				if ((updates.currentStreak ?? 0) > progress.longestStreak) {
					updates.longestStreak = updates.currentStreak;
				}
			} else if (diffDays > 1) {
				updates.currentStreak = 1;
			}
		} else {
			updates.currentStreak = 1;
		}

		// Update specific metrics based on activity type
		switch (activity.action) {
			case "lesson_completed":
				updates.totalLessonsCompleted = progress.totalLessonsCompleted + 1;
				break;
			case "quiz_taken":
				updates.totalQuizzesTaken = progress.totalQuizzesTaken + 1;
				break;
			case "interview_practiced":
				if (activity.scoreAchieved) {
					const newReadiness = Math.min(100, progress.interviewReadiness + Math.floor(activity.scoreAchieved / 10));
					updates.interviewReadiness = newReadiness;
				}
				break;
			case "resume_edited":
				updates.resumeCompleteness = Math.min(100, progress.resumeCompleteness + 5);
				break;
		}

		// Update practice time
		if (activity.durationMinutes) {
			updates.totalPracticeTime = progress.totalPracticeTime + activity.durationMinutes;
		}

		await db.update(schema.studentProgress).set(updates).where(eq(schema.studentProgress.userId, userId));
	},

	// ==========================================
	// SKILL PROGRESSION
	// ==========================================

	trackSkillProgression: async (input: SkillProgressionInput): Promise<string> => {
		const id = generateId();

		// Get previous level for this skill
		const previousRecords = await db
			.select()
			.from(schema.skillProgression)
			.where(and(eq(schema.skillProgression.userId, input.userId), eq(schema.skillProgression.skillId, input.skillId)))
			.orderBy(desc(schema.skillProgression.recordedAt))
			.limit(1);

		const previousLevel = previousRecords.length > 0 ? previousRecords[0].currentLevel : null;

		await db.insert(schema.skillProgression).values({
			id,
			userId: input.userId,
			skillId: input.skillId,
			skillName: input.skillName,
			skillNameFr: input.skillNameFr,
			previousLevel,
			currentLevel: input.currentLevel,
			score: input.score ?? SKILL_LEVEL_SCORES[input.currentLevel],
			assessmentType: input.assessmentType,
			notes: input.notes,
		});

		return id;
	},

	getSkillProgression: async (userId: string, skillId?: string) => {
		const conditions = [eq(schema.skillProgression.userId, userId)];
		if (skillId) {
			conditions.push(eq(schema.skillProgression.skillId, skillId));
		}

		return await db
			.select()
			.from(schema.skillProgression)
			.where(conditions.length > 1 ? and(...conditions) : conditions[0])
			.orderBy(desc(schema.skillProgression.recordedAt));
	},

	getSkillTimeline: async (userId: string, skillId: string, limit = 20) => {
		return await db
			.select()
			.from(schema.skillProgression)
			.where(and(eq(schema.skillProgression.userId, userId), eq(schema.skillProgression.skillId, skillId)))
			.orderBy(desc(schema.skillProgression.recordedAt))
			.limit(limit);
	},

	// ==========================================
	// COHORT COMPARISON
	// ==========================================

	compareToCohort: async (userId: string) => {
		// Get user's cohort
		const membership = await db
			.select()
			.from(schema.cohortMembership)
			.where(eq(schema.cohortMembership.userId, userId))
			.limit(1);

		if (membership.length === 0) {
			// Return comparison to all users if not in a cohort
			return await studentProgressService.compareToGlobal(userId);
		}

		const cohortId = membership[0].cohortId;

		// Get all members' progress
		const cohortMembers = await db
			.select({
				userId: schema.cohortMembership.userId,
				overallScore: schema.studentProgress.overallScore,
				totalLessonsCompleted: schema.studentProgress.totalLessonsCompleted,
				currentStreak: schema.studentProgress.currentStreak,
			})
			.from(schema.cohortMembership)
			.innerJoin(schema.studentProgress, eq(schema.cohortMembership.userId, schema.studentProgress.userId))
			.where(eq(schema.cohortMembership.cohortId, cohortId));

		if (cohortMembers.length === 0) {
			return { percentile: 50, rank: 1, totalInCohort: 1, aheadOf: 0 };
		}

		// Sort by overall score
		const sorted = cohortMembers.sort((a, b) => (b.overallScore ?? 0) - (a.overallScore ?? 0));
		const userRank = sorted.findIndex((m) => m.userId === userId) + 1;
		const userProgress = sorted.find((m) => m.userId === userId);

		const avgScore = sorted.reduce((sum, m) => sum + (m.overallScore ?? 0), 0) / sorted.length;
		const avgLessons = sorted.reduce((sum, m) => sum + (m.totalLessonsCompleted ?? 0), 0) / sorted.length;
		const avgStreak = sorted.reduce((sum, m) => sum + (m.currentStreak ?? 0), 0) / sorted.length;

		const percentile = Math.round(((sorted.length - userRank) / sorted.length) * 100);

		return {
			percentile,
			rank: userRank,
			totalInCohort: sorted.length,
			aheadOf: sorted.length - userRank,
			comparison: {
				userScore: userProgress?.overallScore ?? 0,
				avgScore: Math.round(avgScore),
				userLessons: userProgress?.totalLessonsCompleted ?? 0,
				avgLessons: Math.round(avgLessons),
				userStreak: userProgress?.currentStreak ?? 0,
				avgStreak: Math.round(avgStreak),
			},
		};
	},

	compareToGlobal: async (userId: string) => {
		// Get all users' progress
		const allProgress = await db
			.select({
				userId: schema.studentProgress.userId,
				overallScore: schema.studentProgress.overallScore,
			})
			.from(schema.studentProgress)
			.orderBy(desc(schema.studentProgress.overallScore));

		if (allProgress.length === 0) {
			return { percentile: 50, rank: 1, totalUsers: 1, aheadOf: 0 };
		}

		const userRank = allProgress.findIndex((p) => p.userId === userId) + 1;
		const percentile = Math.round(((allProgress.length - userRank) / allProgress.length) * 100);

		return {
			percentile,
			rank: userRank,
			totalUsers: allProgress.length,
			aheadOf: allProgress.length - userRank,
		};
	},

	// ==========================================
	// BADGE SYSTEM
	// ==========================================

	awardBadge: async (
		input: AwardBadgeInput,
	): Promise<{ awarded: boolean; badge?: typeof schema.achievementBadge.$inferSelect }> => {
		const definition = BADGE_DEFINITIONS[input.badgeType];
		if (!definition) {
			return { awarded: false };
		}

		// Find the highest tier the user qualifies for
		const qualifyingTiers = definition.tiers.filter((t) => (input.criteriaValue ?? 0) >= t.threshold);
		if (qualifyingTiers.length === 0) {
			return { awarded: false };
		}

		const highestTier = qualifyingTiers[qualifyingTiers.length - 1];

		// Check if already has this tier
		const existing = await db
			.select()
			.from(schema.achievementBadge)
			.where(
				and(
					eq(schema.achievementBadge.userId, input.userId),
					eq(schema.achievementBadge.badgeType, input.badgeType),
					eq(schema.achievementBadge.tier, highestTier.tier),
				),
			)
			.limit(1);

		if (existing.length > 0) {
			return { awarded: false, badge: existing[0] };
		}

		// Award the badge
		const id = generateId();
		await db.insert(schema.achievementBadge).values({
			id,
			userId: input.userId,
			badgeType: input.badgeType,
			badgeName: definition.name,
			badgeNameFr: definition.nameFr,
			badgeDescription: definition.description,
			badgeDescriptionFr: definition.descriptionFr,
			badgeIcon: definition.icon,
			tier: highestTier.tier,
			xpAwarded: highestTier.xp,
			criteriaValue: input.criteriaValue,
		});

		const badge = await db.select().from(schema.achievementBadge).where(eq(schema.achievementBadge.id, id)).limit(1);

		// Track the activity
		await studentProgressService.trackActivity({
			userId: input.userId,
			action: "badge_earned",
			entityType: "badge",
			entityId: id,
			entityName: definition.name,
			metadata: { tier: highestTier.tier, xp: highestTier.xp },
		});

		return { awarded: true, badge: badge[0] };
	},

	getUserBadges: async (userId: string) => {
		return await db
			.select()
			.from(schema.achievementBadge)
			.where(eq(schema.achievementBadge.userId, userId))
			.orderBy(desc(schema.achievementBadge.earnedAt));
	},

	markBadgeSeen: async (userId: string, badgeId: string) => {
		await db
			.update(schema.achievementBadge)
			.set({ isNew: false })
			.where(and(eq(schema.achievementBadge.id, badgeId), eq(schema.achievementBadge.userId, userId)));
	},

	// ==========================================
	// WEAK AREAS ANALYSIS
	// ==========================================

	getWeakAreas: async (userId: string): Promise<WeakAreaResult[]> => {
		// Get all skill progressions for the user
		const skillProgressions = await db
			.select()
			.from(schema.skillProgression)
			.where(eq(schema.skillProgression.userId, userId))
			.orderBy(desc(schema.skillProgression.recordedAt));

		// Group by skill
		const skillMap = new Map<
			string,
			{
				skillName: string;
				skillNameFr?: string;
				records: (typeof skillProgressions)[0][];
			}
		>();

		for (const record of skillProgressions) {
			if (!skillMap.has(record.skillId)) {
				skillMap.set(record.skillId, {
					skillName: record.skillName,
					skillNameFr: record.skillNameFr ?? undefined,
					records: [],
				});
			}
			skillMap.get(record.skillId)?.records.push(record);
		}

		const weakAreas: WeakAreaResult[] = [];

		for (const [skillId, data] of skillMap) {
			const records = data.records;
			if (records.length === 0) continue;

			const currentLevel = records[0].currentLevel;
			const avgScore = records.reduce((sum, r) => sum + r.score, 0) / records.length;

			// Determine trend
			let trend: "improving" | "declining" | "stable" = "stable";
			if (records.length >= 2) {
				const recentAvg =
					records.slice(0, Math.ceil(records.length / 2)).reduce((sum, r) => sum + r.score, 0) /
					Math.ceil(records.length / 2);
				const olderAvg =
					records.slice(Math.ceil(records.length / 2)).reduce((sum, r) => sum + r.score, 0) /
					(records.length - Math.ceil(records.length / 2));
				if (recentAvg > olderAvg + 5) trend = "improving";
				else if (recentAvg < olderAvg - 5) trend = "declining";
			}

			// Identify weak areas (below intermediate or declining)
			const levelScore = SKILL_LEVEL_SCORES[currentLevel];
			if (levelScore < 50 || (trend === "declining" && avgScore < 70)) {
				const suggestedActions: string[] = [];
				if (levelScore < 25) {
					suggestedActions.push("Complete beginner tutorials");
					suggestedActions.push("Practice with guided exercises");
				} else if (levelScore < 50) {
					suggestedActions.push("Take intermediate courses");
					suggestedActions.push("Practice with real-world scenarios");
				}
				if (trend === "declining") {
					suggestedActions.push("Review fundamentals");
					suggestedActions.push("Schedule regular practice sessions");
				}

				weakAreas.push({
					skillId,
					skillName: data.skillName,
					skillNameFr: data.skillNameFr,
					currentLevel,
					averageScore: Math.round(avgScore),
					recentTrend: trend,
					suggestedActions,
					practiceCount: records.length,
				});
			}
		}

		// Sort by average score ascending (weakest first)
		return weakAreas.sort((a, b) => a.averageScore - b.averageScore);
	},

	// ==========================================
	// COHORT MANAGEMENT
	// ==========================================

	getCohorts: async (activeOnly = true) => {
		const conditions = activeOnly ? [eq(schema.studentCohort.isActive, true)] : [];
		return await db
			.select()
			.from(schema.studentCohort)
			.where(conditions.length > 0 ? and(...conditions) : undefined)
			.orderBy(desc(schema.studentCohort.createdAt));
	},

	getCohort: async (cohortId: string) => {
		const cohort = await db.select().from(schema.studentCohort).where(eq(schema.studentCohort.id, cohortId)).limit(1);
		return cohort[0] ?? null;
	},

	getCohortMembers: async (cohortId: string) => {
		return await db
			.select({
				membership: schema.cohortMembership,
				user: { id: schema.user.id, name: schema.user.name, email: schema.user.email },
				progress: schema.studentProgress,
			})
			.from(schema.cohortMembership)
			.innerJoin(schema.user, eq(schema.cohortMembership.userId, schema.user.id))
			.leftJoin(schema.studentProgress, eq(schema.cohortMembership.userId, schema.studentProgress.userId))
			.where(eq(schema.cohortMembership.cohortId, cohortId));
	},

	joinCohort: async (userId: string, cohortId: string, role = "member") => {
		const id = generateId();
		await db.insert(schema.cohortMembership).values({
			id,
			userId,
			cohortId,
			role,
		});

		// Update cohort member count
		await db
			.update(schema.studentCohort)
			.set({
				memberCount: sql`${schema.studentCohort.memberCount} + 1`,
			})
			.where(eq(schema.studentCohort.id, cohortId));

		// Update user's progress record
		await db.update(schema.studentProgress).set({ cohortId }).where(eq(schema.studentProgress.userId, userId));

		return id;
	},

	leaveCohort: async (userId: string, cohortId: string) => {
		await db
			.update(schema.cohortMembership)
			.set({ leftAt: new Date() })
			.where(and(eq(schema.cohortMembership.userId, userId), eq(schema.cohortMembership.cohortId, cohortId)));

		// Update cohort member count
		await db
			.update(schema.studentCohort)
			.set({
				memberCount: sql`GREATEST(${schema.studentCohort.memberCount} - 1, 0)`,
			})
			.where(eq(schema.studentCohort.id, cohortId));

		// Remove cohort from user's progress
		await db.update(schema.studentProgress).set({ cohortId: null }).where(eq(schema.studentProgress.userId, userId));
	},

	// ==========================================
	// WEEKLY SNAPSHOTS
	// ==========================================

	createWeeklySnapshot: async (userId: string) => {
		const progress = await studentProgressService.getProgress(userId);
		const cohortComparison = await studentProgressService.compareToCohort(userId);

		const now = new Date();
		const weekStart = new Date(now);
		weekStart.setDate(now.getDate() - now.getDay()); // Start of week (Sunday)
		const weekEnd = new Date(weekStart);
		weekEnd.setDate(weekStart.getDate() + 6);

		// Get activity stats for the week
		const weekActivities = await db
			.select({
				action: schema.progressActivityLog.action,
				count: count(),
				totalDuration: sql<number>`COALESCE(SUM(${schema.progressActivityLog.durationMinutes}), 0)`,
				avgScore: avg(schema.progressActivityLog.scoreAchieved),
			})
			.from(schema.progressActivityLog)
			.where(
				and(
					eq(schema.progressActivityLog.userId, userId),
					gte(schema.progressActivityLog.createdAt, weekStart),
					lte(schema.progressActivityLog.createdAt, weekEnd),
				),
			)
			.groupBy(schema.progressActivityLog.action);

		const lessonsCompleted = weekActivities.find((a) => a.action === "lesson_completed")?.count ?? 0;
		const practiceMinutes = weekActivities.reduce((sum, a) => sum + Number(a.totalDuration), 0);
		const quizzesTaken = weekActivities.find((a) => a.action === "quiz_taken")?.count ?? 0;

		// Get badges earned this week
		const weekBadges = await db
			.select({ count: count() })
			.from(schema.achievementBadge)
			.where(
				and(
					eq(schema.achievementBadge.userId, userId),
					gte(schema.achievementBadge.earnedAt, weekStart),
					lte(schema.achievementBadge.earnedAt, weekEnd),
				),
			);

		const id = generateId();
		await db.insert(schema.weeklyProgressSnapshot).values({
			id,
			userId,
			weekStartDate: weekStart.toISOString().split("T")[0],
			weekEndDate: weekEnd.toISOString().split("T")[0],
			overallScore: progress.overallScore,
			lessonsCompleted: Number(lessonsCompleted),
			practiceMinutes,
			quizzesTaken: Number(quizzesTaken),
			badgesEarned: Number(weekBadges[0]?.count ?? 0),
			streakDays: progress.currentStreak,
			cohortRank: cohortComparison.rank,
			cohortPercentile: cohortComparison.percentile,
		});

		return id;
	},

	getWeeklySnapshots: async (userId: string, limit = 12) => {
		return await db
			.select()
			.from(schema.weeklyProgressSnapshot)
			.where(eq(schema.weeklyProgressSnapshot.userId, userId))
			.orderBy(desc(schema.weeklyProgressSnapshot.weekStartDate))
			.limit(limit);
	},
};
