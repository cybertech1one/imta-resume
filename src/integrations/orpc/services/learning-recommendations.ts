import { ORPCError } from "@orpc/client";
import { and, desc, eq, gte, ilike, inArray, or, sql } from "drizzle-orm";
import { schema } from "@/integrations/drizzle";
import { db } from "@/integrations/drizzle/client";
import type {
	CompletionStatus,
	LearningCostType,
	LearningDifficulty,
	LearningResourceType,
	RecommendationFeedbackType,
	RecommendationReason,
} from "@/integrations/drizzle/schema";
import { generateId } from "@/utils/string";

// ============================================================================
// Types
// ============================================================================

export type CreateResourceInput = {
	title: string;
	titleFr?: string;
	description: string;
	descriptionFr?: string;
	resourceType: LearningResourceType;
	difficulty?: LearningDifficulty;
	costType?: LearningCostType;
	price?: number;
	currency?: string;
	platform?: string;
	provider?: string;
	url?: string;
	thumbnailUrl?: string;
	durationMinutes?: number;
	durationWeeks?: number;
	skills?: string[];
	prerequisites?: string[];
	targetFields?: string[];
	languages?: string[];
	certificationAwarded?: boolean;
	certificationName?: string;
	tags?: string[];
};

export type UpdateResourceInput = Partial<CreateResourceInput> & {
	id: string;
	rating?: number;
	totalRatings?: number;
	totalEnrollments?: number;
	totalCompletions?: number;
	isRecommended?: boolean;
	isFeatured?: boolean;
	isActive?: boolean;
};

export type ResourceFilterInput = {
	search?: string;
	resourceType?: LearningResourceType;
	difficulty?: LearningDifficulty;
	costType?: LearningCostType;
	targetField?: string;
	skill?: string;
	isRecommended?: boolean;
	isFeatured?: boolean;
	minRating?: number;
	limit?: number;
	offset?: number;
};

export type CompletionInput = {
	userId: string;
	resourceId: string;
	status?: CompletionStatus;
	progress?: number;
	timeSpentMinutes?: number;
	rating?: number;
	review?: string;
	notes?: string;
	isFavorite?: boolean;
	reminderEnabled?: boolean;
	reminderFrequency?: string;
};

export type RecommendationInput = {
	userId: string;
	resourceId: string;
	reason: RecommendationReason;
	reasonDetails?: string;
	score: number;
	rank?: number;
	skillsAddressed?: string[];
	aiModelUsed?: string;
	contextData?: Record<string, unknown>;
};

export type FeedbackInput = {
	userId: string;
	recommendationId: string;
	feedbackType: RecommendationFeedbackType;
	rating?: number;
	comment?: string;
	wasUseful?: boolean;
};

export type LearningGoalInput = {
	userId: string;
	title: string;
	titleFr?: string;
	description?: string;
	goalType: "weekly" | "monthly" | "custom";
	targetValue: number;
	metricType: "hours" | "courses" | "lessons" | "skills";
	startDate: string;
	endDate: string;
	skillFocus?: string[];
};

export type SequenceInput = {
	userId: string;
	title: string;
	titleFr?: string;
	description?: string;
	targetRole?: string;
	targetField?: string;
	resources: Array<{
		resourceId: string;
		order: number;
		estimatedWeeks: number;
		isRequired: boolean;
	}>;
	aiGenerated?: boolean;
	aiModelUsed?: string;
};

// ============================================================================
// Learning Resources Service
// ============================================================================

export const learningRecommendationsService = {
	// ========================
	// LEARNING RESOURCES
	// ========================

	createResource: async (input: CreateResourceInput): Promise<string> => {
		const id = generateId();

		await db.insert(schema.learningResource).values({
			id,
			title: input.title,
			titleFr: input.titleFr,
			description: input.description,
			descriptionFr: input.descriptionFr,
			resourceType: input.resourceType,
			difficulty: input.difficulty ?? "beginner",
			costType: input.costType ?? "free",
			price: input.price,
			currency: input.currency ?? "USD",
			platform: input.platform,
			provider: input.provider,
			url: input.url,
			thumbnailUrl: input.thumbnailUrl,
			durationMinutes: input.durationMinutes,
			durationWeeks: input.durationWeeks,
			skills: input.skills ?? [],
			prerequisites: input.prerequisites ?? [],
			targetFields: input.targetFields ?? [],
			languages: input.languages ?? ["en"],
			certificationAwarded: input.certificationAwarded ?? false,
			certificationName: input.certificationName,
			tags: input.tags ?? [],
		});

		return id;
	},

	getResourceById: async (id: string) => {
		const [resource] = await db.select().from(schema.learningResource).where(eq(schema.learningResource.id, id));

		if (!resource) {
			throw new ORPCError("NOT_FOUND", { message: "Resource not found" });
		}

		return resource;
	},

	listResources: async (input: ResourceFilterInput = {}) => {
		const conditions = [eq(schema.learningResource.isActive, true)];

		if (input.search) {
			const searchCondition = or(
				ilike(schema.learningResource.title, `%${input.search}%`),
				ilike(schema.learningResource.description, `%${input.search}%`),
			);
			if (searchCondition) conditions.push(searchCondition);
		}

		if (input.resourceType) {
			conditions.push(eq(schema.learningResource.resourceType, input.resourceType));
		}

		if (input.difficulty) {
			conditions.push(eq(schema.learningResource.difficulty, input.difficulty));
		}

		if (input.costType) {
			conditions.push(eq(schema.learningResource.costType, input.costType));
		}

		if (input.isRecommended !== undefined) {
			conditions.push(eq(schema.learningResource.isRecommended, input.isRecommended));
		}

		if (input.isFeatured !== undefined) {
			conditions.push(eq(schema.learningResource.isFeatured, input.isFeatured));
		}

		if (input.minRating !== undefined) {
			conditions.push(gte(schema.learningResource.rating, input.minRating));
		}

		const resources = await db
			.select()
			.from(schema.learningResource)
			.where(and(...conditions))
			.orderBy(desc(schema.learningResource.rating), desc(schema.learningResource.totalEnrollments))
			.limit(input.limit ?? 50)
			.offset(input.offset ?? 0);

		// Filter by targetField and skill in JavaScript (array containment)
		let filtered = resources;

		if (input.targetField) {
			filtered = filtered.filter((r) =>
				r.targetFields?.some((f) => f.toLowerCase().includes(input.targetField?.toLowerCase() ?? "")),
			);
		}

		if (input.skill) {
			filtered = filtered.filter((r) =>
				r.skills?.some((s) => s.toLowerCase().includes(input.skill?.toLowerCase() ?? "")),
			);
		}

		return filtered;
	},

	updateResource: async (input: UpdateResourceInput): Promise<void> => {
		const [existing] = await db
			.select({ id: schema.learningResource.id })
			.from(schema.learningResource)
			.where(eq(schema.learningResource.id, input.id));

		if (!existing) {
			throw new ORPCError("NOT_FOUND", { message: "Resource not found" });
		}

		await db
			.update(schema.learningResource)
			.set({
				title: input.title,
				titleFr: input.titleFr,
				description: input.description,
				descriptionFr: input.descriptionFr,
				resourceType: input.resourceType,
				difficulty: input.difficulty,
				costType: input.costType,
				price: input.price,
				currency: input.currency,
				platform: input.platform,
				provider: input.provider,
				url: input.url,
				thumbnailUrl: input.thumbnailUrl,
				durationMinutes: input.durationMinutes,
				durationWeeks: input.durationWeeks,
				skills: input.skills,
				prerequisites: input.prerequisites,
				targetFields: input.targetFields,
				languages: input.languages,
				certificationAwarded: input.certificationAwarded,
				certificationName: input.certificationName,
				tags: input.tags,
				rating: input.rating,
				totalRatings: input.totalRatings,
				totalEnrollments: input.totalEnrollments,
				totalCompletions: input.totalCompletions,
				isRecommended: input.isRecommended,
				isFeatured: input.isFeatured,
				isActive: input.isActive,
			})
			.where(eq(schema.learningResource.id, input.id));
	},

	deleteResource: async (id: string): Promise<void> => {
		await db.delete(schema.learningResource).where(eq(schema.learningResource.id, id));
	},

	// ========================
	// RESOURCE COMPLETION TRACKING
	// ========================

	startResource: async (input: CompletionInput): Promise<string> => {
		// Check if already started
		const [existing] = await db
			.select()
			.from(schema.resourceCompletion)
			.where(
				and(
					eq(schema.resourceCompletion.userId, input.userId),
					eq(schema.resourceCompletion.resourceId, input.resourceId),
				),
			);

		if (existing) {
			// Update last accessed
			await db
				.update(schema.resourceCompletion)
				.set({
					lastAccessedAt: new Date(),
					status: existing.status === "not_started" ? "in_progress" : existing.status,
					startedAt: existing.startedAt ?? new Date(),
				})
				.where(eq(schema.resourceCompletion.id, existing.id));
			return existing.id;
		}

		const id = generateId();
		await db.insert(schema.resourceCompletion).values({
			id,
			userId: input.userId,
			resourceId: input.resourceId,
			status: "in_progress",
			progress: 0,
			startedAt: new Date(),
			lastAccessedAt: new Date(),
			isFavorite: input.isFavorite ?? false,
			reminderEnabled: input.reminderEnabled ?? false,
			reminderFrequency: input.reminderFrequency,
		});

		// Increment enrollment count
		await db
			.update(schema.learningResource)
			.set({
				totalEnrollments: sql`COALESCE(${schema.learningResource.totalEnrollments}, 0) + 1`,
			})
			.where(eq(schema.learningResource.id, input.resourceId));

		return id;
	},

	trackEngagement: async (input: CompletionInput): Promise<void> => {
		const [existing] = await db
			.select()
			.from(schema.resourceCompletion)
			.where(
				and(
					eq(schema.resourceCompletion.userId, input.userId),
					eq(schema.resourceCompletion.resourceId, input.resourceId),
				),
			);

		if (!existing) {
			throw new ORPCError("NOT_FOUND", { message: "Resource completion record not found" });
		}

		const updates: Record<string, unknown> = {
			lastAccessedAt: new Date(),
		};

		if (input.progress !== undefined) {
			updates.progress = input.progress;
			if (input.progress >= 100 && existing.status !== "completed") {
				updates.status = "completed";
				updates.completedAt = new Date();

				// Increment completion count on resource
				await db
					.update(schema.learningResource)
					.set({
						totalCompletions: sql`COALESCE(${schema.learningResource.totalCompletions}, 0) + 1`,
					})
					.where(eq(schema.learningResource.id, input.resourceId));
			}
		}

		if (input.timeSpentMinutes !== undefined) {
			updates.timeSpentMinutes = sql`COALESCE(${schema.resourceCompletion.timeSpentMinutes}, 0) + ${input.timeSpentMinutes}`;
		}

		if (input.status !== undefined) {
			updates.status = input.status;
			if (input.status === "completed" && !existing.completedAt) {
				updates.completedAt = new Date();
			}
		}

		if (input.rating !== undefined) {
			updates.rating = input.rating;
		}

		if (input.review !== undefined) {
			updates.review = input.review;
		}

		if (input.notes !== undefined) {
			updates.notes = input.notes;
		}

		if (input.isFavorite !== undefined) {
			updates.isFavorite = input.isFavorite;
		}

		await db.update(schema.resourceCompletion).set(updates).where(eq(schema.resourceCompletion.id, existing.id));
	},

	getUserCompletions: async (userId: string, status?: CompletionStatus) => {
		const conditions = [eq(schema.resourceCompletion.userId, userId)];

		if (status) {
			conditions.push(eq(schema.resourceCompletion.status, status));
		}

		return await db
			.select({
				completion: schema.resourceCompletion,
				resource: schema.learningResource,
			})
			.from(schema.resourceCompletion)
			.innerJoin(schema.learningResource, eq(schema.resourceCompletion.resourceId, schema.learningResource.id))
			.where(and(...conditions))
			.orderBy(desc(schema.resourceCompletion.lastAccessedAt));
	},

	getUserFavorites: async (userId: string) => {
		return await db
			.select({
				completion: schema.resourceCompletion,
				resource: schema.learningResource,
			})
			.from(schema.resourceCompletion)
			.innerJoin(schema.learningResource, eq(schema.resourceCompletion.resourceId, schema.learningResource.id))
			.where(and(eq(schema.resourceCompletion.userId, userId), eq(schema.resourceCompletion.isFavorite, true)))
			.orderBy(desc(schema.resourceCompletion.lastAccessedAt));
	},

	// ========================
	// AI RECOMMENDATIONS
	// ========================

	generateRecommendations: async (
		userId: string,
		options?: {
			limit?: number;
			targetField?: string;
			skillGaps?: string[];
			careerGoal?: string;
		},
	) => {
		// Get user's current skills and completions
		const completions = await db
			.select()
			.from(schema.resourceCompletion)
			.where(eq(schema.resourceCompletion.userId, userId));

		const completedResourceIds = completions.filter((c) => c.status === "completed").map((c) => c.resourceId);

		const inProgressResourceIds = completions.filter((c) => c.status === "in_progress").map((c) => c.resourceId);

		// Get available resources (not already completed or in progress)
		const excludeIds = [...completedResourceIds, ...inProgressResourceIds];

		let resources = await db
			.select()
			.from(schema.learningResource)
			.where(eq(schema.learningResource.isActive, true))
			.orderBy(desc(schema.learningResource.rating), desc(schema.learningResource.isRecommended))
			.limit(100);

		// Filter out already started/completed resources
		if (excludeIds.length > 0) {
			resources = resources.filter((r) => !excludeIds.includes(r.id));
		}

		// Filter by target field if specified
		if (options?.targetField) {
			const targetField = options.targetField.toLowerCase();
			resources = resources.filter((r) => r.targetFields?.some((f) => f.toLowerCase().includes(targetField)));
		}

		// Score resources based on various factors
		const scoredResources = resources.map((resource) => {
			let score = 0.5; // Base score
			let reason: RecommendationReason = "curated";
			const skillsAddressed: string[] = [];

			// Boost for recommended/featured
			if (resource.isRecommended) score += 0.2;
			if (resource.isFeatured) score += 0.1;

			// Boost for high ratings
			if (resource.rating && resource.rating >= 4.5) score += 0.15;
			else if (resource.rating && resource.rating >= 4.0) score += 0.1;

			// Boost for skill gap matches
			if (options?.skillGaps && options.skillGaps.length > 0) {
				const matchingSkills = resource.skills?.filter((s) =>
					options.skillGaps?.some((gap) => s.toLowerCase().includes(gap.toLowerCase())),
				);
				if (matchingSkills && matchingSkills.length > 0) {
					score += 0.25 * Math.min(1, matchingSkills.length / options.skillGaps.length);
					reason = "skill_gap";
					skillsAddressed.push(...matchingSkills);
				}
			}

			// Boost for career goal match
			if (options?.careerGoal && resource.tags) {
				const careerGoalLower = options.careerGoal.toLowerCase();
				const goalMatch = resource.tags.some((t) => t.toLowerCase().includes(careerGoalLower));
				if (goalMatch) {
					score += 0.15;
					reason = "career_goal";
				}
			}

			// Normalize score to 0-1
			score = Math.min(1, Math.max(0, score));

			return {
				resource,
				score,
				reason,
				skillsAddressed,
			};
		});

		// Sort by score and take top N
		const topRecommendations = scoredResources.sort((a, b) => b.score - a.score).slice(0, options?.limit ?? 10);

		// Store recommendations in history
		for (let i = 0; i < topRecommendations.length; i++) {
			const rec = topRecommendations[i];
			await db.insert(schema.recommendationHistory).values({
				id: generateId(),
				userId,
				resourceId: rec.resource.id,
				reason: rec.reason,
				score: rec.score,
				rank: i + 1,
				skillsAddressed: rec.skillsAddressed,
				aiModelUsed: "rule-based-v1",
				contextData: options ?? {},
				isActive: true,
			});
		}

		return topRecommendations.map((r, index) => ({
			...r.resource,
			recommendationScore: r.score,
			recommendationReason: r.reason,
			skillsAddressed: r.skillsAddressed,
			rank: index + 1,
		}));
	},

	personalizeContent: async (userId: string, resourceId: string) => {
		// Get user's learning profile
		const completions = await db
			.select()
			.from(schema.resourceCompletion)
			.where(eq(schema.resourceCompletion.userId, userId));

		const resource = await db
			.select()
			.from(schema.learningResource)
			.where(eq(schema.learningResource.id, resourceId))
			.then((r) => r[0]);

		if (!resource) {
			throw new ORPCError("NOT_FOUND", { message: "Resource not found" });
		}

		// Calculate average learning pace
		const completedWithTime = completions.filter(
			(c) => c.status === "completed" && c.timeSpentMinutes && c.timeSpentMinutes > 0,
		);
		const avgTimeMultiplier =
			completedWithTime.length > 0
				? completedWithTime.reduce((sum, c) => sum + (c.timeSpentMinutes ?? 0), 0) / completedWithTime.length / 60 // hours
				: 1;

		// Determine learning style based on completed resources
		const completedResources = await db
			.select()
			.from(schema.learningResource)
			.where(
				inArray(
					schema.learningResource.id,
					completions.filter((c) => c.status === "completed").map((c) => c.resourceId),
				),
			);

		const typePreferences: Record<string, number> = {};
		for (const r of completedResources) {
			typePreferences[r.resourceType] = (typePreferences[r.resourceType] || 0) + 1;
		}

		const preferredType = Object.entries(typePreferences).sort(([, a], [, b]) => b - a)[0]?.[0];

		return {
			resource,
			personalization: {
				estimatedCompletionHours: resource.durationMinutes
					? Math.round((resource.durationMinutes / 60) * avgTimeMultiplier)
					: null,
				preferredLearningType: preferredType || "course",
				recommendedPace: avgTimeMultiplier > 1.5 ? "slow" : avgTimeMultiplier < 0.8 ? "fast" : "normal",
				relatedSkills: resource.skills?.slice(0, 5) || [],
				prerequisites: resource.prerequisites || [],
			},
		};
	},

	scheduleReminders: async (
		userId: string,
		resourceId: string,
		frequency: "daily" | "weekly" | "none",
	): Promise<void> => {
		const [existing] = await db
			.select()
			.from(schema.resourceCompletion)
			.where(and(eq(schema.resourceCompletion.userId, userId), eq(schema.resourceCompletion.resourceId, resourceId)));

		if (!existing) {
			throw new ORPCError("NOT_FOUND", { message: "Resource completion record not found" });
		}

		const nextReminderAt =
			frequency === "none"
				? null
				: frequency === "daily"
					? new Date(Date.now() + 24 * 60 * 60 * 1000)
					: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

		await db
			.update(schema.resourceCompletion)
			.set({
				reminderEnabled: frequency !== "none",
				reminderFrequency: frequency,
				nextReminderAt,
			})
			.where(eq(schema.resourceCompletion.id, existing.id));
	},

	optimizeSequence: async (userId: string): Promise<void> => {
		// Get user's current sequences
		const sequences = await db
			.select()
			.from(schema.learningSequence)
			.where(and(eq(schema.learningSequence.userId, userId), eq(schema.learningSequence.status, "active")));

		// Get user's completions to track what's done
		const completions = await db
			.select()
			.from(schema.resourceCompletion)
			.where(eq(schema.resourceCompletion.userId, userId));

		const completedIds = new Set(completions.filter((c) => c.status === "completed").map((c) => c.resourceId));

		// Update each sequence
		for (const sequence of sequences) {
			const resources = sequence.resources || [];
			let completedCount = 0;
			let currentIndex = 0;

			// Find first incomplete resource
			for (let i = 0; i < resources.length; i++) {
				if (completedIds.has(resources[i].resourceId)) {
					resources[i].isCompleted = true;
					completedCount++;
				} else if (currentIndex === 0) {
					currentIndex = i;
				}
			}

			await db
				.update(schema.learningSequence)
				.set({
					resources,
					completedResources: completedCount,
					currentResourceIndex: currentIndex,
					status: completedCount === resources.length ? "completed" : "active",
					completedAt: completedCount === resources.length ? new Date() : null,
				})
				.where(eq(schema.learningSequence.id, sequence.id));
		}
	},

	connectWithMentors: async (_userId: string, skillId: string) => {
		// Find mentors who can teach this skill
		const mentorMatches = await db
			.select()
			.from(schema.mentorSkillMatch)
			.where(and(ilike(schema.mentorSkillMatch.skillName, `%${skillId}%`), eq(schema.mentorSkillMatch.canTeach, true)))
			.orderBy(desc(schema.mentorSkillMatch.teachingRating), desc(schema.mentorSkillMatch.proficiencyLevel))
			.limit(10);

		if (mentorMatches.length === 0) {
			return [];
		}

		// Get mentor profiles
		const mentorIds = mentorMatches.map((m) => m.mentorId);
		const mentors = await db
			.select()
			.from(schema.mentorProfile)
			.where(and(inArray(schema.mentorProfile.id, mentorIds), eq(schema.mentorProfile.status, "available")));

		return mentors.map((mentor) => {
			const skillMatch = mentorMatches.find((m) => m.mentorId === mentor.id);
			return {
				...mentor,
				skillProficiency: skillMatch?.proficiencyLevel ?? null,
				teachingRating: skillMatch?.teachingRating ?? null,
				sessionsOnSkill: skillMatch?.totalSessionsOnSkill ?? null,
			};
		});
	},

	// ========================
	// RECOMMENDATION FEEDBACK
	// ========================

	provideFeedback: async (input: FeedbackInput): Promise<string> => {
		const id = generateId();

		// Get recommendation to calculate time to feedback
		const [recommendation] = await db
			.select()
			.from(schema.recommendationHistory)
			.where(eq(schema.recommendationHistory.id, input.recommendationId));

		if (!recommendation) {
			throw new ORPCError("NOT_FOUND", { message: "Recommendation not found" });
		}

		const timeToFeedback = Math.floor((Date.now() - new Date(recommendation.createdAt).getTime()) / 1000);

		await db.insert(schema.recommendationFeedback).values({
			id,
			userId: input.userId,
			recommendationId: input.recommendationId,
			feedbackType: input.feedbackType,
			rating: input.rating,
			comment: input.comment,
			timeToFeedback,
			wasUseful: input.wasUseful,
		});

		// Update recommendation status based on feedback
		const updates: Record<string, unknown> = {};
		if (input.feedbackType === "enrolled") {
			updates.wasEnrolled = true;
			updates.enrolledAt = new Date();
		} else if (input.feedbackType === "completed") {
			updates.wasCompleted = true;
			updates.completedAt = new Date();
		} else if (input.feedbackType === "dismissed") {
			updates.isActive = false;
		}

		if (Object.keys(updates).length > 0) {
			await db
				.update(schema.recommendationHistory)
				.set(updates)
				.where(eq(schema.recommendationHistory.id, input.recommendationId));
		}

		return id;
	},

	markRecommendationViewed: async (recommendationId: string, userId: string): Promise<void> => {
		await db
			.update(schema.recommendationHistory)
			.set({
				wasViewed: true,
				viewedAt: new Date(),
			})
			.where(
				and(eq(schema.recommendationHistory.id, recommendationId), eq(schema.recommendationHistory.userId, userId)),
			);
	},

	markRecommendationClicked: async (recommendationId: string, userId: string): Promise<void> => {
		await db
			.update(schema.recommendationHistory)
			.set({
				wasClicked: true,
				clickedAt: new Date(),
			})
			.where(
				and(eq(schema.recommendationHistory.id, recommendationId), eq(schema.recommendationHistory.userId, userId)),
			);
	},

	getActiveRecommendations: async (userId: string, limit?: number) => {
		return await db
			.select({
				recommendation: schema.recommendationHistory,
				resource: schema.learningResource,
			})
			.from(schema.recommendationHistory)
			.innerJoin(schema.learningResource, eq(schema.recommendationHistory.resourceId, schema.learningResource.id))
			.where(and(eq(schema.recommendationHistory.userId, userId), eq(schema.recommendationHistory.isActive, true)))
			.orderBy(desc(schema.recommendationHistory.score), desc(schema.recommendationHistory.createdAt))
			.limit(limit ?? 10);
	},

	// ========================
	// LEARNING GOALS
	// ========================

	createGoal: async (input: LearningGoalInput): Promise<string> => {
		const id = generateId();

		await db.insert(schema.learningGoal).values({
			id,
			userId: input.userId,
			title: input.title,
			titleFr: input.titleFr,
			description: input.description,
			goalType: input.goalType,
			targetValue: input.targetValue,
			currentValue: 0,
			metricType: input.metricType,
			startDate: input.startDate,
			endDate: input.endDate,
			status: "active",
			skillFocus: input.skillFocus ?? [],
			streakDays: 0,
			bestStreak: 0,
		});

		return id;
	},

	updateGoalProgress: async (userId: string, goalId: string, incrementValue: number): Promise<void> => {
		const [goal] = await db
			.select()
			.from(schema.learningGoal)
			.where(and(eq(schema.learningGoal.id, goalId), eq(schema.learningGoal.userId, userId)));

		if (!goal) {
			throw new ORPCError("NOT_FOUND", { message: "Goal not found" });
		}

		const newValue = (goal.currentValue ?? 0) + incrementValue;
		const isCompleted = newValue >= goal.targetValue;

		// Only increment streak if progress hasn't been updated today
		const todayStr = new Date().toISOString().split("T")[0];
		const lastUpdatedStr = goal.updatedAt ? new Date(goal.updatedAt).toISOString().split("T")[0] : null;
		const alreadyUpdatedToday = lastUpdatedStr === todayStr;

		const newStreakDays = alreadyUpdatedToday ? (goal.streakDays ?? 0) : (goal.streakDays ?? 0) + 1;

		await db
			.update(schema.learningGoal)
			.set({
				currentValue: newValue,
				status: isCompleted ? "completed" : "active",
				completedAt: isCompleted ? new Date() : null,
				streakDays: newStreakDays,
				bestStreak: Math.max(goal.bestStreak ?? 0, newStreakDays),
			})
			.where(eq(schema.learningGoal.id, goalId));
	},

	getUserGoals: async (userId: string, status?: string) => {
		const conditions = [eq(schema.learningGoal.userId, userId)];

		if (status) {
			conditions.push(eq(schema.learningGoal.status, status));
		}

		return await db
			.select()
			.from(schema.learningGoal)
			.where(and(...conditions))
			.orderBy(desc(schema.learningGoal.createdAt));
	},

	// ========================
	// LEARNING SEQUENCES
	// ========================

	createSequence: async (input: SequenceInput): Promise<string> => {
		const id = generateId();

		const resources = input.resources.map((r) => ({
			...r,
			isCompleted: false,
		}));

		const estimatedWeeks = resources.reduce((sum, r) => sum + r.estimatedWeeks, 0);

		await db.insert(schema.learningSequence).values({
			id,
			userId: input.userId,
			title: input.title,
			titleFr: input.titleFr,
			description: input.description,
			targetRole: input.targetRole,
			targetField: input.targetField,
			resources,
			totalResources: resources.length,
			completedResources: 0,
			estimatedWeeks,
			currentResourceIndex: 0,
			aiGenerated: input.aiGenerated ?? false,
			aiModelUsed: input.aiModelUsed,
			status: "active",
		});

		return id;
	},

	getUserSequences: async (userId: string, status?: string) => {
		const conditions = [eq(schema.learningSequence.userId, userId)];

		if (status) {
			conditions.push(eq(schema.learningSequence.status, status));
		}

		return await db
			.select()
			.from(schema.learningSequence)
			.where(and(...conditions))
			.orderBy(desc(schema.learningSequence.createdAt));
	},

	// ========================
	// STATISTICS
	// ========================

	getStatistics: async (userId: string) => {
		const completions = await db
			.select()
			.from(schema.resourceCompletion)
			.where(eq(schema.resourceCompletion.userId, userId));

		const goals = await db.select().from(schema.learningGoal).where(eq(schema.learningGoal.userId, userId));

		const sequences = await db.select().from(schema.learningSequence).where(eq(schema.learningSequence.userId, userId));

		const recommendations = await db
			.select()
			.from(schema.recommendationHistory)
			.where(and(eq(schema.recommendationHistory.userId, userId), eq(schema.recommendationHistory.isActive, true)));

		const totalTimeSpent = completions.reduce((sum, c) => sum + (c.timeSpentMinutes ?? 0), 0);
		const completedResources = completions.filter((c) => c.status === "completed").length;
		const inProgressResources = completions.filter((c) => c.status === "in_progress").length;
		const activeGoals = goals.filter((g) => g.status === "active").length;
		const completedGoals = goals.filter((g) => g.status === "completed").length;
		const activeSequences = sequences.filter((s) => s.status === "active").length;

		return {
			totalResourcesStarted: completions.length,
			completedResources,
			inProgressResources,
			totalTimeSpentMinutes: totalTimeSpent,
			totalTimeSpentHours: Math.round(totalTimeSpent / 60),
			activeGoals,
			completedGoals,
			activeSequences,
			pendingRecommendations: recommendations.length,
			averageProgress:
				completions.length > 0
					? Math.round(completions.reduce((sum, c) => sum + (c.progress ?? 0), 0) / completions.length)
					: 0,
			currentStreak: goals.length > 0 ? Math.max(...goals.map((g) => g.streakDays ?? 0)) : 0,
			bestStreak: goals.length > 0 ? Math.max(...goals.map((g) => g.bestStreak ?? 0)) : 0,
		};
	},

	// ========================
	// SEED DATA
	// ========================

	seedResources: async (): Promise<void> => {
		const existingResources = await db.select().from(schema.learningResource).limit(1);
		if (existingResources.length > 0) return;

		const resources: CreateResourceInput[] = [
			{
				title: "Introduction to Patient Care",
				titleFr: "Introduction aux Soins aux Patients",
				description: "Learn the fundamentals of patient care including communication, safety, and basic procedures.",
				descriptionFr:
					"Apprenez les fondamentaux des soins aux patients, y compris la communication, la securite et les procedures de base.",
				resourceType: "course",
				difficulty: "beginner",
				costType: "free",
				platform: "IMTA Learning",
				provider: "IMTA",
				durationMinutes: 480,
				durationWeeks: 2,
				skills: ["Patient Care", "Communication", "Safety"],
				targetFields: ["healthcare"],
				languages: ["fr", "en"],
				certificationAwarded: true,
				certificationName: "Patient Care Fundamentals",
				tags: ["healthcare", "nursing", "aide-soignant"],
			},
			{
				title: "Industrial Safety Certification",
				titleFr: "Certification Securite Industrielle",
				description:
					"Complete safety certification for industrial environments covering risk assessment and emergency procedures.",
				descriptionFr:
					"Certification complete de securite pour les environnements industriels couvrant l'evaluation des risques et les procedures d'urgence.",
				resourceType: "certification",
				difficulty: "intermediate",
				costType: "free",
				platform: "IMTA Learning",
				provider: "IMTA",
				durationMinutes: 960,
				durationWeeks: 4,
				skills: ["Safety Procedures", "Risk Assessment", "Emergency Response"],
				targetFields: ["industrial", "hse"],
				languages: ["fr"],
				certificationAwarded: true,
				certificationName: "Industrial Safety Level 1",
				tags: ["industrial", "safety", "hse"],
			},
			{
				title: "Communication Skills for Healthcare",
				titleFr: "Competences en Communication pour la Sante",
				description: "Develop effective communication skills for patient interactions and healthcare teams.",
				descriptionFr:
					"Developpez des competences en communication efficaces pour les interactions avec les patients et les equipes de sante.",
				resourceType: "tutorial",
				difficulty: "beginner",
				costType: "free",
				platform: "IMTA Learning",
				provider: "IMTA",
				durationMinutes: 240,
				skills: ["Communication", "Empathy", "Teamwork"],
				targetFields: ["healthcare"],
				languages: ["fr", "ar"],
				tags: ["soft-skills", "healthcare", "communication"],
			},
			{
				title: "Machine Operation Fundamentals",
				titleFr: "Fondamentaux de l'Operation des Machines",
				description: "Learn safe and efficient machine operation techniques for industrial settings.",
				descriptionFr:
					"Apprenez des techniques d'operation de machines sures et efficaces pour les environnements industriels.",
				resourceType: "video",
				difficulty: "beginner",
				costType: "free",
				platform: "IMTA Learning",
				provider: "IMTA",
				durationMinutes: 180,
				skills: ["Machine Operation", "Safety", "Technical Reading"],
				targetFields: ["industrial"],
				languages: ["fr"],
				tags: ["industrial", "machines", "technical"],
			},
			{
				title: "HSE Management System",
				titleFr: "Systeme de Management HSE",
				description: "Comprehensive course on Health, Safety, and Environment management systems.",
				descriptionFr: "Cours complet sur les systemes de management Sante, Securite et Environnement.",
				resourceType: "course",
				difficulty: "advanced",
				costType: "paid",
				price: 15000, // 150.00 in currency
				platform: "IMTA Learning",
				provider: "IMTA",
				durationMinutes: 1200,
				durationWeeks: 6,
				skills: ["HSE Management", "ISO 45001", "Regulatory Compliance"],
				targetFields: ["hse"],
				languages: ["fr", "en"],
				certificationAwarded: true,
				certificationName: "HSE Manager Certification",
				tags: ["hse", "management", "certification"],
			},
		];

		for (const resource of resources) {
			await db.insert(schema.learningResource).values({
				id: generateId(),
				...resource,
				isRecommended: true,
				isActive: true,
				rating: 4.5,
				totalRatings: 25,
				totalEnrollments: 100,
			});
		}
	},
};
