import z from "zod";
import type {
	CompletionStatus,
	LearningCostType,
	LearningDifficulty,
	LearningResourceType,
	RecommendationFeedbackType,
} from "../../drizzle/schema";
import { adminProcedure, protectedProcedure } from "../context";
import { learningRecommendationsService } from "../services/learning-recommendations";

// ============================================================================
// Schemas
// ============================================================================

const resourceTypeSchema = z.enum([
	"course",
	"tutorial",
	"certification",
	"video",
	"article",
	"book",
	"workshop",
	"webinar",
	"practice",
	"mentorship",
]);

const difficultySchema = z.enum(["beginner", "intermediate", "advanced", "expert"]);

const costTypeSchema = z.enum(["free", "paid", "subscription", "freemium"]);

const completionStatusSchema = z.enum(["not_started", "in_progress", "completed", "paused", "dropped"]);

const recommendationReasonSchema = z.enum([
	"skill_gap",
	"career_goal",
	"trending",
	"peer_popularity",
	"mentor_suggested",
	"completion_pattern",
	"personalized_ai",
	"curated",
	"new_release",
]);

const feedbackTypeSchema = z.enum([
	"helpful",
	"not_helpful",
	"too_easy",
	"too_hard",
	"not_relevant",
	"already_know",
	"will_try_later",
	"enrolled",
	"completed",
	"dismissed",
]);

const resourceSchema = z.object({
	id: z.string().uuid(),
	title: z.string(),
	titleFr: z.string().nullable(),
	description: z.string(),
	descriptionFr: z.string().nullable(),
	resourceType: resourceTypeSchema,
	difficulty: difficultySchema,
	costType: costTypeSchema,
	price: z.number().nullable(),
	currency: z.string().nullable(),
	platform: z.string().nullable(),
	provider: z.string().nullable(),
	url: z.string().nullable(),
	thumbnailUrl: z.string().nullable(),
	durationMinutes: z.number().nullable(),
	durationWeeks: z.number().nullable(),
	skills: z.array(z.string()).nullable(),
	prerequisites: z.array(z.string()).nullable(),
	targetFields: z.array(z.string()).nullable(),
	languages: z.array(z.string()).nullable(),
	rating: z.number().nullable(),
	totalRatings: z.number().nullable(),
	totalEnrollments: z.number().nullable(),
	totalCompletions: z.number().nullable(),
	certificationAwarded: z.boolean().nullable(),
	certificationName: z.string().nullable(),
	isRecommended: z.boolean().nullable(),
	isFeatured: z.boolean().nullable(),
	isActive: z.boolean().nullable(),
	tags: z.array(z.string()).nullable(),
	metadata: z.record(z.string(), z.unknown()).nullable(),
	createdAt: z.coerce.date(),
	updatedAt: z.coerce.date(),
});

const completionSchema = z.object({
	id: z.string().uuid(),
	userId: z.string(),
	resourceId: z.string(),
	status: completionStatusSchema,
	progress: z.number(),
	startedAt: z.coerce.date().nullable(),
	completedAt: z.coerce.date().nullable(),
	lastAccessedAt: z.coerce.date().nullable(),
	timeSpentMinutes: z.number(),
	rating: z.number().nullable(),
	review: z.string().nullable(),
	notes: z.string().nullable(),
	certificateUrl: z.string().nullable(),
	certificateEarnedAt: z.coerce.date().nullable(),
	isFavorite: z.boolean().nullable(),
	reminderEnabled: z.boolean().nullable(),
	reminderFrequency: z.string().nullable(),
	nextReminderAt: z.coerce.date().nullable(),
	metadata: z.record(z.string(), z.unknown()).nullable(),
	createdAt: z.coerce.date(),
	updatedAt: z.coerce.date(),
});

const goalSchema = z.object({
	id: z.string().uuid(),
	userId: z.string(),
	title: z.string(),
	titleFr: z.string().nullable(),
	description: z.string().nullable(),
	goalType: z.string(),
	targetValue: z.number(),
	currentValue: z.number(),
	metricType: z.string(),
	startDate: z.string(),
	endDate: z.string(),
	status: z.string(),
	skillFocus: z.array(z.string()).nullable(),
	resourceIds: z.array(z.string()).nullable(),
	streakDays: z.number(),
	bestStreak: z.number(),
	completedAt: z.coerce.date().nullable(),
	createdAt: z.coerce.date(),
	updatedAt: z.coerce.date(),
});

const sequenceResourceSchema = z.object({
	resourceId: z.string(),
	order: z.number(),
	estimatedWeeks: z.number(),
	isRequired: z.boolean(),
	isCompleted: z.boolean(),
});

const sequenceSchema = z.object({
	id: z.string().uuid(),
	userId: z.string(),
	title: z.string(),
	titleFr: z.string().nullable(),
	description: z.string().nullable(),
	targetRole: z.string().nullable(),
	targetField: z.string().nullable(),
	resources: z.array(sequenceResourceSchema),
	totalResources: z.number(),
	completedResources: z.number(),
	estimatedWeeks: z.number().nullable(),
	currentResourceIndex: z.number().nullable(),
	aiGenerated: z.boolean().nullable(),
	aiModelUsed: z.string().nullable(),
	status: z.string(),
	startedAt: z.coerce.date().nullable(),
	completedAt: z.coerce.date().nullable(),
	createdAt: z.coerce.date(),
	updatedAt: z.coerce.date(),
});

// ============================================================================
// Router
// ============================================================================

export const learningRecommendationsRouter = {
	// ========================
	// LEARNING RESOURCES
	// ========================

	listResources: protectedProcedure
		.route({
			method: "GET",
			path: "/learning/resources",
			tags: ["Learning Recommendations"],
			summary: "List all learning resources",
		})
		.input(
			z
				.object({
					search: z.string().optional(),
					resourceType: resourceTypeSchema.optional(),
					difficulty: difficultySchema.optional(),
					costType: costTypeSchema.optional(),
					targetField: z.string().optional(),
					skill: z.string().optional(),
					isRecommended: z.boolean().optional(),
					isFeatured: z.boolean().optional(),
					minRating: z.number().optional(),
					limit: z.number().optional(),
					offset: z.number().optional(),
				})
				.optional()
				.default({}),
		)
		.output(z.array(resourceSchema))
		.handler(async ({ input }) => {
			return await learningRecommendationsService.listResources({
				...input,
				resourceType: input.resourceType as LearningResourceType | undefined,
				difficulty: input.difficulty as LearningDifficulty | undefined,
				costType: input.costType as LearningCostType | undefined,
			});
		}),

	getResource: protectedProcedure
		.route({
			method: "GET",
			path: "/learning/resources/{id}",
			tags: ["Learning Recommendations"],
			summary: "Get a specific learning resource",
		})
		.input(z.object({ id: z.string().uuid() }))
		.output(resourceSchema)
		.handler(async ({ input }) => {
			return await learningRecommendationsService.getResourceById(input.id);
		}),

	createResource: adminProcedure
		.route({
			method: "POST",
			path: "/learning/resources",
			tags: ["Learning Recommendations"],
			summary: "Create a new learning resource",
		})
		.input(
			z.object({
				title: z.string().min(1),
				titleFr: z.string().optional(),
				description: z.string().min(1),
				descriptionFr: z.string().optional(),
				resourceType: resourceTypeSchema,
				difficulty: difficultySchema.optional(),
				costType: costTypeSchema.optional(),
				price: z.number().optional(),
				currency: z.string().optional(),
				platform: z.string().optional(),
				provider: z.string().optional(),
				url: z.string().optional(),
				thumbnailUrl: z.string().optional(),
				durationMinutes: z.number().optional(),
				durationWeeks: z.number().optional(),
				skills: z.array(z.string()).optional(),
				prerequisites: z.array(z.string()).optional(),
				targetFields: z.array(z.string()).optional(),
				languages: z.array(z.string()).optional(),
				certificationAwarded: z.boolean().optional(),
				certificationName: z.string().optional(),
				tags: z.array(z.string()).optional(),
			}),
		)
		.output(z.string())
		.handler(async ({ input }) => {
			return await learningRecommendationsService.createResource({
				...input,
				resourceType: input.resourceType as LearningResourceType,
				difficulty: input.difficulty as LearningDifficulty | undefined,
				costType: input.costType as LearningCostType | undefined,
			});
		}),

	updateResource: adminProcedure
		.route({
			method: "PUT",
			path: "/learning/resources/{id}",
			tags: ["Learning Recommendations"],
			summary: "Update a learning resource",
		})
		.input(
			z.object({
				id: z.string().uuid(),
				title: z.string().optional(),
				titleFr: z.string().optional(),
				description: z.string().optional(),
				descriptionFr: z.string().optional(),
				resourceType: resourceTypeSchema.optional(),
				difficulty: difficultySchema.optional(),
				costType: costTypeSchema.optional(),
				price: z.number().optional(),
				platform: z.string().optional(),
				provider: z.string().optional(),
				url: z.string().optional(),
				thumbnailUrl: z.string().optional(),
				durationMinutes: z.number().optional(),
				durationWeeks: z.number().optional(),
				skills: z.array(z.string()).optional(),
				prerequisites: z.array(z.string()).optional(),
				targetFields: z.array(z.string()).optional(),
				isRecommended: z.boolean().optional(),
				isFeatured: z.boolean().optional(),
				isActive: z.boolean().optional(),
			}),
		)
		.output(z.void())
		.handler(async ({ input }) => {
			await learningRecommendationsService.updateResource({
				...input,
				resourceType: input.resourceType as LearningResourceType | undefined,
				difficulty: input.difficulty as LearningDifficulty | undefined,
				costType: input.costType as LearningCostType | undefined,
			});
		}),

	deleteResource: adminProcedure
		.route({
			method: "DELETE",
			path: "/learning/resources/{id}",
			tags: ["Learning Recommendations"],
			summary: "Delete a learning resource",
		})
		.input(z.object({ id: z.string().uuid() }))
		.output(z.void())
		.handler(async ({ input }) => {
			await learningRecommendationsService.deleteResource(input.id);
		}),

	seedResources: adminProcedure
		.route({
			method: "POST",
			path: "/learning/resources/seed",
			tags: ["Learning Recommendations"],
			summary: "Seed initial learning resources",
		})
		.output(z.void())
		.handler(async () => {
			await learningRecommendationsService.seedResources();
		}),

	// ========================
	// RESOURCE COMPLETION
	// ========================

	startResource: protectedProcedure
		.route({
			method: "POST",
			path: "/learning/resources/{resourceId}/start",
			tags: ["Learning Recommendations"],
			summary: "Start learning a resource",
		})
		.input(z.object({ resourceId: z.string() }))
		.output(z.string())
		.handler(async ({ context, input }) => {
			return await learningRecommendationsService.startResource({
				userId: context.user.id,
				resourceId: input.resourceId,
			});
		}),

	trackEngagement: protectedProcedure
		.route({
			method: "POST",
			path: "/learning/resources/{resourceId}/track",
			tags: ["Learning Recommendations"],
			summary: "Track engagement with a resource",
		})
		.input(
			z.object({
				resourceId: z.string(),
				progress: z.number().min(0).max(100).optional(),
				timeSpentMinutes: z.number().optional(),
				status: completionStatusSchema.optional(),
				rating: z.number().min(1).max(5).optional(),
				review: z.string().optional(),
				notes: z.string().optional(),
				isFavorite: z.boolean().optional(),
			}),
		)
		.output(z.void())
		.handler(async ({ context, input }) => {
			await learningRecommendationsService.trackEngagement({
				userId: context.user.id,
				resourceId: input.resourceId,
				progress: input.progress,
				timeSpentMinutes: input.timeSpentMinutes,
				status: input.status as CompletionStatus | undefined,
				rating: input.rating,
				review: input.review,
				notes: input.notes,
				isFavorite: input.isFavorite,
			});
		}),

	getUserCompletions: protectedProcedure
		.route({
			method: "GET",
			path: "/learning/completions",
			tags: ["Learning Recommendations"],
			summary: "Get user's resource completions",
		})
		.input(
			z
				.object({
					status: completionStatusSchema.optional(),
				})
				.optional()
				.default({}),
		)
		.output(
			z.array(
				z.object({
					completion: completionSchema,
					resource: resourceSchema,
				}),
			),
		)
		.handler(async ({ context, input }) => {
			return await learningRecommendationsService.getUserCompletions(
				context.user.id,
				input.status as CompletionStatus | undefined,
			);
		}),

	getUserFavorites: protectedProcedure
		.route({
			method: "GET",
			path: "/learning/favorites",
			tags: ["Learning Recommendations"],
			summary: "Get user's favorite resources",
		})
		.output(
			z.array(
				z.object({
					completion: completionSchema,
					resource: resourceSchema,
				}),
			),
		)
		.handler(async ({ context }) => {
			return await learningRecommendationsService.getUserFavorites(context.user.id);
		}),

	// ========================
	// AI RECOMMENDATIONS
	// ========================

	generateRecommendations: protectedProcedure
		.route({
			method: "POST",
			path: "/learning/recommendations/generate",
			tags: ["Learning Recommendations"],
			summary: "Generate AI-powered learning recommendations",
		})
		.input(
			z
				.object({
					limit: z.number().optional(),
					targetField: z.string().optional(),
					skillGaps: z.array(z.string()).optional(),
					careerGoal: z.string().optional(),
				})
				.optional()
				.default({}),
		)
		.output(
			z.array(
				resourceSchema.extend({
					recommendationScore: z.number(),
					recommendationReason: recommendationReasonSchema,
					skillsAddressed: z.array(z.string()),
					rank: z.number(),
				}),
			),
		)
		.handler(async ({ context, input }) => {
			return await learningRecommendationsService.generateRecommendations(context.user.id, input);
		}),

	personalizeContent: protectedProcedure
		.route({
			method: "GET",
			path: "/learning/resources/{resourceId}/personalize",
			tags: ["Learning Recommendations"],
			summary: "Get personalized content for a resource",
		})
		.input(z.object({ resourceId: z.string() }))
		.output(
			z.object({
				resource: resourceSchema,
				personalization: z.object({
					estimatedCompletionHours: z.number().nullable(),
					preferredLearningType: z.string(),
					recommendedPace: z.string(),
					relatedSkills: z.array(z.string()),
					prerequisites: z.array(z.string()),
				}),
			}),
		)
		.handler(async ({ context, input }) => {
			return await learningRecommendationsService.personalizeContent(context.user.id, input.resourceId);
		}),

	scheduleReminders: protectedProcedure
		.route({
			method: "POST",
			path: "/learning/resources/{resourceId}/reminders",
			tags: ["Learning Recommendations"],
			summary: "Schedule learning reminders",
		})
		.input(
			z.object({
				resourceId: z.string(),
				frequency: z.enum(["daily", "weekly", "none"]),
			}),
		)
		.output(z.void())
		.handler(async ({ context, input }) => {
			await learningRecommendationsService.scheduleReminders(context.user.id, input.resourceId, input.frequency);
		}),

	optimizeSequence: protectedProcedure
		.route({
			method: "POST",
			path: "/learning/sequences/optimize",
			tags: ["Learning Recommendations"],
			summary: "Optimize learning sequences based on progress",
		})
		.output(z.void())
		.handler(async ({ context }) => {
			await learningRecommendationsService.optimizeSequence(context.user.id);
		}),

	connectWithMentors: protectedProcedure
		.route({
			method: "GET",
			path: "/learning/mentors/match/{skillId}",
			tags: ["Learning Recommendations"],
			summary: "Find mentors who can teach a skill",
		})
		.input(z.object({ skillId: z.string() }))
		.output(
			z.array(
				z.object({
					id: z.string().uuid(),
					userId: z.string(),
					firstName: z.string(),
					lastName: z.string(),
					email: z.string(),
					avatar: z.string().nullable(),
					title: z.string(),
					company: z.string(),
					location: z.string(),
					bio: z.string(),
					status: z.string(),
					rating: z.number(),
					totalSessions: z.number(),
					skillProficiency: z.number().nullable(),
					teachingRating: z.number().nullable(),
					sessionsOnSkill: z.number().nullable(),
				}),
			),
		)
		.handler(async ({ context, input }) => {
			return await learningRecommendationsService.connectWithMentors(context.user.id, input.skillId);
		}),

	getActiveRecommendations: protectedProcedure
		.route({
			method: "GET",
			path: "/learning/recommendations",
			tags: ["Learning Recommendations"],
			summary: "Get active recommendations for user",
		})
		.input(
			z
				.object({
					limit: z.number().optional(),
				})
				.optional()
				.default({}),
		)
		.output(
			z.array(
				z.object({
					recommendation: z.object({
						id: z.string().uuid(),
						userId: z.string(),
						resourceId: z.string(),
						reason: recommendationReasonSchema,
						reasonDetails: z.string().nullable(),
						score: z.number(),
						rank: z.number().nullable(),
						skillsAddressed: z.array(z.string()).nullable(),
						aiModelUsed: z.string().nullable(),
						wasViewed: z.boolean().nullable(),
						wasClicked: z.boolean().nullable(),
						wasEnrolled: z.boolean().nullable(),
						wasCompleted: z.boolean().nullable(),
						isActive: z.boolean().nullable(),
						createdAt: z.coerce.date(),
					}),
					resource: resourceSchema,
				}),
			),
		)
		.handler(async ({ context, input }) => {
			return await learningRecommendationsService.getActiveRecommendations(context.user.id, input.limit);
		}),

	markViewed: protectedProcedure
		.route({
			method: "POST",
			path: "/learning/recommendations/{id}/view",
			tags: ["Learning Recommendations"],
			summary: "Mark recommendation as viewed",
		})
		.input(z.object({ id: z.string().uuid() }))
		.output(z.void())
		.handler(async ({ input, context }) => {
			await learningRecommendationsService.markRecommendationViewed(input.id, context.user.id);
		}),

	markClicked: protectedProcedure
		.route({
			method: "POST",
			path: "/learning/recommendations/{id}/click",
			tags: ["Learning Recommendations"],
			summary: "Mark recommendation as clicked",
		})
		.input(z.object({ id: z.string().uuid() }))
		.output(z.void())
		.handler(async ({ input, context }) => {
			await learningRecommendationsService.markRecommendationClicked(input.id, context.user.id);
		}),

	// ========================
	// RECOMMENDATION FEEDBACK
	// ========================

	provideFeedback: protectedProcedure
		.route({
			method: "POST",
			path: "/learning/recommendations/{recommendationId}/feedback",
			tags: ["Learning Recommendations"],
			summary: "Provide feedback on a recommendation",
		})
		.input(
			z.object({
				recommendationId: z.string(),
				feedbackType: feedbackTypeSchema,
				rating: z.number().min(1).max(5).optional(),
				comment: z.string().optional(),
				wasUseful: z.boolean().optional(),
			}),
		)
		.output(z.string())
		.handler(async ({ context, input }) => {
			return await learningRecommendationsService.provideFeedback({
				userId: context.user.id,
				recommendationId: input.recommendationId,
				feedbackType: input.feedbackType as RecommendationFeedbackType,
				rating: input.rating,
				comment: input.comment,
				wasUseful: input.wasUseful,
			});
		}),

	// ========================
	// LEARNING GOALS
	// ========================

	createGoal: protectedProcedure
		.route({
			method: "POST",
			path: "/learning/goals",
			tags: ["Learning Recommendations"],
			summary: "Create a learning goal",
		})
		.input(
			z.object({
				title: z.string().min(1),
				titleFr: z.string().optional(),
				description: z.string().optional(),
				goalType: z.enum(["weekly", "monthly", "custom"]),
				targetValue: z.number().min(1),
				metricType: z.enum(["hours", "courses", "lessons", "skills"]),
				startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
				endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
				skillFocus: z.array(z.string()).optional(),
			}),
		)
		.output(z.string())
		.handler(async ({ context, input }) => {
			return await learningRecommendationsService.createGoal({
				userId: context.user.id,
				...input,
			});
		}),

	updateGoalProgress: protectedProcedure
		.route({
			method: "POST",
			path: "/learning/goals/{goalId}/progress",
			tags: ["Learning Recommendations"],
			summary: "Update goal progress",
		})
		.input(
			z.object({
				goalId: z.string(),
				incrementValue: z.number(),
			}),
		)
		.output(z.void())
		.handler(async ({ context, input }) => {
			await learningRecommendationsService.updateGoalProgress(context.user.id, input.goalId, input.incrementValue);
		}),

	getUserGoals: protectedProcedure
		.route({
			method: "GET",
			path: "/learning/goals",
			tags: ["Learning Recommendations"],
			summary: "Get user's learning goals",
		})
		.input(
			z
				.object({
					status: z.string().optional(),
				})
				.optional()
				.default({}),
		)
		.output(z.array(goalSchema))
		.handler(async ({ context, input }) => {
			return await learningRecommendationsService.getUserGoals(context.user.id, input.status);
		}),

	// ========================
	// LEARNING SEQUENCES
	// ========================

	createSequence: protectedProcedure
		.route({
			method: "POST",
			path: "/learning/sequences",
			tags: ["Learning Recommendations"],
			summary: "Create a learning sequence",
		})
		.input(
			z.object({
				title: z.string().min(1),
				titleFr: z.string().optional(),
				description: z.string().optional(),
				targetRole: z.string().optional(),
				targetField: z.string().optional(),
				resources: z.array(
					z.object({
						resourceId: z.string(),
						order: z.number(),
						estimatedWeeks: z.number(),
						isRequired: z.boolean(),
					}),
				),
				aiGenerated: z.boolean().optional(),
				aiModelUsed: z.string().optional(),
			}),
		)
		.output(z.string())
		.handler(async ({ context, input }) => {
			return await learningRecommendationsService.createSequence({
				userId: context.user.id,
				...input,
			});
		}),

	getUserSequences: protectedProcedure
		.route({
			method: "GET",
			path: "/learning/sequences",
			tags: ["Learning Recommendations"],
			summary: "Get user's learning sequences",
		})
		.input(
			z
				.object({
					status: z.string().optional(),
				})
				.optional()
				.default({}),
		)
		.output(z.array(sequenceSchema))
		.handler(async ({ context, input }) => {
			return await learningRecommendationsService.getUserSequences(context.user.id, input.status);
		}),

	// ========================
	// STATISTICS
	// ========================

	getStatistics: protectedProcedure
		.route({
			method: "GET",
			path: "/learning/statistics",
			tags: ["Learning Recommendations"],
			summary: "Get learning statistics",
		})
		.output(
			z.object({
				totalResourcesStarted: z.number(),
				completedResources: z.number(),
				inProgressResources: z.number(),
				totalTimeSpentMinutes: z.number(),
				totalTimeSpentHours: z.number(),
				activeGoals: z.number(),
				completedGoals: z.number(),
				activeSequences: z.number(),
				pendingRecommendations: z.number(),
				averageProgress: z.number(),
				currentStreak: z.number(),
				bestStreak: z.number(),
			}),
		)
		.handler(async ({ context }) => {
			return await learningRecommendationsService.getStatistics(context.user.id);
		}),
};
