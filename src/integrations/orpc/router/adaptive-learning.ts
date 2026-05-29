import { ORPCError } from "@orpc/server";
import { z } from "zod";
import { protectedProcedure } from "../context";
import {
	assessmentService,
	difficultyService,
	learningPathService,
	learningProfileService,
	milestoneService,
	recommendationService,
} from "../services/adaptive-learning";

// ============================================================================
// SCHEMAS
// ============================================================================

const learningStyleSchema = z.enum(["visual", "auditory", "reading_writing", "kinesthetic", "mixed"]);
const learningPaceSchema = z.enum(["slow", "moderate", "fast", "self_paced"]);
const skillLevelSchema = z.enum(["novice", "beginner", "intermediate", "advanced", "expert"]);
const pathStatusSchema = z.enum(["not_started", "in_progress", "paused", "completed", "abandoned"]);
const milestoneStatusSchema = z.enum(["locked", "unlocked", "in_progress", "completed", "skipped"]);
const recommendationTypeSchema = z.enum([
	"next_skill",
	"review_topic",
	"practice_exercise",
	"take_assessment",
	"adjust_pace",
	"try_resource",
	"milestone_goal",
]);
const recommendationPrioritySchema = z.enum(["low", "medium", "high", "critical"]);

const contentPreferencesSchema = z.object({
	preferredFormats: z.array(z.string()),
	preferredLanguages: z.array(z.string()),
	excludedTopics: z.array(z.string()),
});

const moduleResourceSchema = z.object({
	id: z.string().uuid(),
	type: z.enum(["video", "article", "quiz", "exercise", "project"]),
	title: z.string(),
	url: z.string().optional(),
	duration: z.number().optional(),
	completed: z.boolean(),
	completedAt: z.string().optional(),
});

const moduleSchema = z.object({
	id: z.string().uuid(),
	title: z.string(),
	titleFr: z.string().optional(),
	description: z.string().optional(),
	order: z.number(),
	estimatedHours: z.number(),
	skillsToLearn: z.array(z.string()),
	resources: z.array(moduleResourceSchema),
	isCompleted: z.boolean(),
	completedAt: z.string().optional(),
	progress: z.number(),
});

// ============================================================================
// LEARNING PROFILE ROUTER
// ============================================================================

const profileRouter = {
	// Get or create profile
	getOrCreate: protectedProcedure
		.route({
			method: "GET",
			path: "/adaptive-learning/profile",
			tags: ["Adaptive Learning"],
			summary: "Get or create learning profile",
		})
		.handler(async ({ context }) => {
			return learningProfileService.getOrCreate(context.user.id);
		}),

	// Update profile
	update: protectedProcedure
		.route({
			method: "PUT",
			path: "/adaptive-learning/profile",
			tags: ["Adaptive Learning"],
			summary: "Update learning profile",
		})
		.input(
			z.object({
				learningStyle: learningStyleSchema.optional(),
				preferredPace: learningPaceSchema.optional(),
				dailyTimeCommitment: z.number().min(5).max(480).optional(),
				weeklyGoalHours: z.number().min(1).max(168).optional(),
				preferredSessionLength: z.number().min(5).max(240).optional(),
				currentField: z.string().optional(),
				currentLevel: skillLevelSchema.optional(),
				targetLevel: skillLevelSchema.optional(),
				contentPreferences: contentPreferencesSchema.optional(),
			}),
		)
		.handler(async ({ context, input }) => {
			return learningProfileService.update(context.user.id, input);
		}),

	// Complete onboarding
	completeOnboarding: protectedProcedure
		.route({
			method: "POST",
			path: "/adaptive-learning/profile/onboarding/complete",
			tags: ["Adaptive Learning"],
			summary: "Complete onboarding",
		})
		.handler(async ({ context }) => {
			return learningProfileService.completeOnboarding(context.user.id);
		}),
};

// ============================================================================
// LEARNING PATH ROUTER
// ============================================================================

const pathRouter = {
	// List paths
	list: protectedProcedure
		.route({
			method: "GET",
			path: "/adaptive-learning/paths",
			tags: ["Adaptive Learning"],
			summary: "List learning paths",
		})
		.input(
			z
				.object({
					status: pathStatusSchema.optional(),
					field: z.string().optional(),
					activeOnly: z.boolean().optional(),
				})
				.optional(),
		)
		.handler(async ({ context, input }) => {
			return learningPathService.list(context.user.id, input);
		}),

	// Get path by ID
	getById: protectedProcedure
		.route({
			method: "GET",
			path: "/adaptive-learning/paths/{id}",
			tags: ["Adaptive Learning"],
			summary: "Get learning path by ID",
		})
		.input(z.object({ id: z.string().uuid() }))
		.handler(async ({ context, input }) => {
			const path = await learningPathService.getById(input.id);
			if (!path || path.userId !== context.user.id) {
				throw new ORPCError("NOT_FOUND");
			}
			return path;
		}),

	// Get primary path
	getPrimary: protectedProcedure
		.route({
			method: "GET",
			path: "/adaptive-learning/paths/primary",
			tags: ["Adaptive Learning"],
			summary: "Get primary learning path",
		})
		.handler(async ({ context }) => {
			return learningPathService.getPrimary(context.user.id);
		}),

	// Create path
	create: protectedProcedure
		.route({
			method: "POST",
			path: "/adaptive-learning/paths",
			tags: ["Adaptive Learning"],
			summary: "Create learning path",
		})
		.input(
			z.object({
				title: z.string().min(1).max(255),
				titleFr: z.string().optional(),
				description: z.string().optional(),
				descriptionFr: z.string().optional(),
				field: z.string(),
				targetRole: z.string().optional(),
				targetRoleFr: z.string().optional(),
				targetSkills: z.array(z.string()).optional(),
				targetLevel: skillLevelSchema.optional(),
				estimatedDuration: z.string().optional(),
				estimatedHours: z.number().optional(),
				modules: z.array(moduleSchema).optional(),
				targetCompletionDate: z.coerce.date().optional(),
				isPrimary: z.boolean().optional(),
			}),
		)
		.handler(async ({ context, input }) => {
			return learningPathService.create({
				...input,
				userId: context.user.id,
			});
		}),

	// Update path
	update: protectedProcedure
		.route({
			method: "PUT",
			path: "/adaptive-learning/paths/{id}",
			tags: ["Adaptive Learning"],
			summary: "Update learning path",
		})
		.input(
			z.object({
				id: z.string().uuid(),
				title: z.string().min(1).max(255).optional(),
				titleFr: z.string().optional(),
				description: z.string().optional(),
				descriptionFr: z.string().optional(),
				field: z.string().optional(),
				targetRole: z.string().optional(),
				targetRoleFr: z.string().optional(),
				targetSkills: z.array(z.string()).optional(),
				targetLevel: skillLevelSchema.optional(),
				estimatedDuration: z.string().optional(),
				estimatedHours: z.number().optional(),
				modules: z.array(moduleSchema).optional(),
				targetCompletionDate: z.coerce.date().optional(),
				isPrimary: z.boolean().optional(),
				isActive: z.boolean().optional(),
			}),
		)
		.handler(async ({ context, input }) => {
			const { id, ...data } = input;
			return learningPathService.update(id, context.user.id, data);
		}),

	// Start path
	start: protectedProcedure
		.route({
			method: "POST",
			path: "/adaptive-learning/paths/{id}/start",
			tags: ["Adaptive Learning"],
			summary: "Start learning path",
		})
		.input(z.object({ id: z.string().uuid() }))
		.handler(async ({ context, input }) => {
			return learningPathService.start(input.id, context.user.id);
		}),

	// Update progress
	updateProgress: protectedProcedure
		.route({
			method: "POST",
			path: "/adaptive-learning/paths/{id}/progress",
			tags: ["Adaptive Learning"],
			summary: "Update path progress",
		})
		.input(
			z.object({
				id: z.string().uuid(),
				progress: z.number().min(0).max(100),
				completedModules: z.number().optional(),
			}),
		)
		.handler(async ({ context, input }) => {
			return learningPathService.updateProgress(input.id, context.user.id, input.progress, input.completedModules);
		}),

	// Delete path
	delete: protectedProcedure
		.route({
			method: "DELETE",
			path: "/adaptive-learning/paths/{id}",
			tags: ["Adaptive Learning"],
			summary: "Delete learning path",
		})
		.input(z.object({ id: z.string().uuid() }))
		.handler(async ({ context, input }) => {
			await learningPathService.delete(input.id, context.user.id);
			return { success: true };
		}),

	// Generate AI path
	generate: protectedProcedure
		.route({
			method: "POST",
			path: "/adaptive-learning/paths/generate",
			tags: ["Adaptive Learning"],
			summary: "Generate AI-powered learning path",
		})
		.input(
			z.object({
				field: z.string(),
				targetRole: z.string(),
				targetLevel: skillLevelSchema,
			}),
		)
		.handler(async ({ context, input }) => {
			return learningPathService.generatePath(context.user.id, input);
		}),
};

// ============================================================================
// MILESTONE ROUTER
// ============================================================================

const milestoneRouter = {
	// List milestones for path
	listByPath: protectedProcedure
		.route({
			method: "GET",
			path: "/adaptive-learning/paths/{pathId}/milestones",
			tags: ["Adaptive Learning"],
			summary: "List milestones for path",
		})
		.input(z.object({ pathId: z.string() }))
		.handler(async ({ context, input }) => {
			const path = await learningPathService.getById(input.pathId);
			if (!path || path.userId !== context.user.id) {
				throw new ORPCError("NOT_FOUND");
			}
			return milestoneService.listByPath(input.pathId);
		}),

	// Get milestone by ID
	getById: protectedProcedure
		.route({
			method: "GET",
			path: "/adaptive-learning/milestones/{id}",
			tags: ["Adaptive Learning"],
			summary: "Get milestone by ID",
		})
		.input(z.object({ id: z.string().uuid() }))
		.handler(async ({ context, input }) => {
			const milestone = await milestoneService.getById(input.id);
			if (!milestone || milestone.userId !== context.user.id) {
				throw new ORPCError("NOT_FOUND");
			}
			return milestone;
		}),

	// Create milestone
	create: protectedProcedure
		.route({
			method: "POST",
			path: "/adaptive-learning/paths/{pathId}/milestones",
			tags: ["Adaptive Learning"],
			summary: "Create milestone",
		})
		.input(
			z.object({
				pathId: z.string(),
				title: z.string().min(1).max(255),
				titleFr: z.string().optional(),
				description: z.string().optional(),
				descriptionFr: z.string().optional(),
				order: z.number(),
				requiredSkills: z.array(z.string()).optional(),
				requiredAssessmentScore: z.number().min(0).max(100).optional(),
				xpReward: z.number().optional(),
				badgeReward: z.string().optional(),
				certificateReward: z.boolean().optional(),
				targetDate: z.coerce.date().optional(),
			}),
		)
		.handler(async ({ context, input }) => {
			return milestoneService.create({
				...input,
				userId: context.user.id,
			});
		}),

	// Update milestone status
	updateStatus: protectedProcedure
		.route({
			method: "POST",
			path: "/adaptive-learning/milestones/{id}/status",
			tags: ["Adaptive Learning"],
			summary: "Update milestone status",
		})
		.input(
			z.object({
				id: z.string().uuid(),
				status: milestoneStatusSchema,
				assessmentScore: z.number().min(0).max(100).optional(),
			}),
		)
		.handler(async ({ context, input }) => {
			const milestone = await milestoneService.getById(input.id);
			if (!milestone || milestone.userId !== context.user.id) {
				throw new ORPCError("NOT_FOUND");
			}
			return milestoneService.updateStatus(input.id, input.status, input.assessmentScore);
		}),

	// Update milestone progress
	updateProgress: protectedProcedure
		.route({
			method: "POST",
			path: "/adaptive-learning/milestones/{id}/progress",
			tags: ["Adaptive Learning"],
			summary: "Update milestone progress",
		})
		.input(
			z.object({
				id: z.string().uuid(),
				progress: z.number().min(0).max(100),
			}),
		)
		.handler(async ({ context, input }) => {
			const milestone = await milestoneService.getById(input.id);
			if (!milestone || milestone.userId !== context.user.id) {
				throw new ORPCError("NOT_FOUND");
			}
			return milestoneService.updateProgress(input.id, input.progress);
		}),

	// Delete milestone
	delete: protectedProcedure
		.route({
			method: "DELETE",
			path: "/adaptive-learning/milestones/{id}",
			tags: ["Adaptive Learning"],
			summary: "Delete milestone",
		})
		.input(z.object({ id: z.string().uuid() }))
		.handler(async ({ context, input }) => {
			const milestone = await milestoneService.getById(input.id);
			if (!milestone || milestone.userId !== context.user.id) {
				throw new ORPCError("NOT_FOUND");
			}
			await milestoneService.delete(input.id);
			return { success: true };
		}),
};

// ============================================================================
// SKILL ASSESSMENT ROUTER
// ============================================================================

const assessmentRouter = {
	// List assessments
	list: protectedProcedure
		.route({
			method: "GET",
			path: "/adaptive-learning/assessments",
			tags: ["Adaptive Learning"],
			summary: "List skill assessments",
		})
		.input(
			z
				.object({
					skillId: z.string().optional(),
					category: z.string().optional(),
					field: z.string().optional(),
					limit: z.number().optional(),
				})
				.optional(),
		)
		.handler(async ({ context, input }) => {
			return assessmentService.list(context.user.id, input);
		}),

	// Get assessment by ID
	getById: protectedProcedure
		.route({
			method: "GET",
			path: "/adaptive-learning/assessments/{id}",
			tags: ["Adaptive Learning"],
			summary: "Get assessment by ID",
		})
		.input(z.object({ id: z.string().uuid() }))
		.handler(async ({ context, input }) => {
			const assessment = await assessmentService.getById(input.id);
			if (!assessment || assessment.userId !== context.user.id) {
				throw new ORPCError("NOT_FOUND");
			}
			return assessment;
		}),

	// Get latest assessment for skill
	getLatest: protectedProcedure
		.route({
			method: "GET",
			path: "/adaptive-learning/assessments/skill/{skillId}/latest",
			tags: ["Adaptive Learning"],
			summary: "Get latest assessment for skill",
		})
		.input(z.object({ skillId: z.string() }))
		.handler(async ({ context, input }) => {
			return assessmentService.getLatest(context.user.id, input.skillId);
		}),

	// Create assessment
	create: protectedProcedure
		.route({
			method: "POST",
			path: "/adaptive-learning/assessments",
			tags: ["Adaptive Learning"],
			summary: "Create skill assessment",
		})
		.input(
			z.object({
				profileId: z.string().optional(),
				pathId: z.string().optional(),
				milestoneId: z.string().optional(),
				skillId: z.string(),
				skillName: z.string(),
				skillNameFr: z.string().optional(),
				category: z.string(),
				field: z.string().optional(),
				assessmentType: z.string().optional(),
				currentLevel: skillLevelSchema,
				score: z.number().min(0).max(100),
				confidenceScore: z.number().min(0).max(100).optional(),
				questionsTotal: z.number().optional(),
				questionsCorrect: z.number().optional(),
				timeSpent: z.number().optional(),
				detailedResults: z
					.object({
						strengths: z.array(z.string()),
						weaknesses: z.array(z.string()),
						recommendations: z.array(z.string()),
						topicScores: z.record(z.string(), z.number()),
					})
					.optional(),
				aiEvaluation: z.string().optional(),
				aiSuggestions: z.array(z.string()).optional(),
			}),
		)
		.handler(async ({ context, input }) => {
			return assessmentService.create({
				...input,
				userId: context.user.id,
			});
		}),

	// AI skill assessment
	assessSkillLevel: protectedProcedure
		.route({
			method: "POST",
			path: "/adaptive-learning/assessments/ai-evaluate",
			tags: ["Adaptive Learning"],
			summary: "AI-powered skill level assessment",
		})
		.input(
			z.object({
				skillId: z.string(),
				skillName: z.string(),
				category: z.string(),
				field: z.string().optional(),
			}),
		)
		.handler(async ({ context, input }) => {
			return assessmentService.assessSkillLevel(
				context.user.id,
				input.skillId,
				input.skillName,
				input.category,
				input.field,
			);
		}),
};

// ============================================================================
// RECOMMENDATION ROUTER
// ============================================================================

const recommendationRouter = {
	// List recommendations
	list: protectedProcedure
		.route({
			method: "GET",
			path: "/adaptive-learning/recommendations",
			tags: ["Adaptive Learning"],
			summary: "List recommendations",
		})
		.input(
			z
				.object({
					type: recommendationTypeSchema.optional(),
					priority: recommendationPrioritySchema.optional(),
					activeOnly: z.boolean().optional(),
					limit: z.number().optional(),
				})
				.optional(),
		)
		.handler(async ({ context, input }) => {
			return recommendationService.list(context.user.id, input);
		}),

	// Get recommendation by ID
	getById: protectedProcedure
		.route({
			method: "GET",
			path: "/adaptive-learning/recommendations/{id}",
			tags: ["Adaptive Learning"],
			summary: "Get recommendation by ID",
		})
		.input(z.object({ id: z.string().uuid() }))
		.handler(async ({ context, input }) => {
			const recommendation = await recommendationService.getById(input.id);
			if (!recommendation || recommendation.userId !== context.user.id) {
				throw new ORPCError("NOT_FOUND");
			}
			return recommendation;
		}),

	// Mark recommendation as viewed
	markViewed: protectedProcedure
		.route({
			method: "POST",
			path: "/adaptive-learning/recommendations/{id}/view",
			tags: ["Adaptive Learning"],
			summary: "Mark recommendation as viewed",
		})
		.input(z.object({ id: z.string().uuid() }))
		.handler(async ({ context, input }) => {
			const recommendation = await recommendationService.getById(input.id);
			if (!recommendation || recommendation.userId !== context.user.id) {
				throw new ORPCError("NOT_FOUND");
			}
			return recommendationService.markViewed(input.id);
		}),

	// Accept recommendation
	accept: protectedProcedure
		.route({
			method: "POST",
			path: "/adaptive-learning/recommendations/{id}/accept",
			tags: ["Adaptive Learning"],
			summary: "Accept recommendation",
		})
		.input(z.object({ id: z.string().uuid() }))
		.handler(async ({ context, input }) => {
			const recommendation = await recommendationService.getById(input.id);
			if (!recommendation || recommendation.userId !== context.user.id) {
				throw new ORPCError("NOT_FOUND");
			}
			return recommendationService.accept(input.id);
		}),

	// Complete recommendation
	complete: protectedProcedure
		.route({
			method: "POST",
			path: "/adaptive-learning/recommendations/{id}/complete",
			tags: ["Adaptive Learning"],
			summary: "Complete recommendation",
		})
		.input(z.object({ id: z.string().uuid() }))
		.handler(async ({ context, input }) => {
			const recommendation = await recommendationService.getById(input.id);
			if (!recommendation || recommendation.userId !== context.user.id) {
				throw new ORPCError("NOT_FOUND");
			}
			return recommendationService.complete(input.id);
		}),

	// Dismiss recommendation
	dismiss: protectedProcedure
		.route({
			method: "POST",
			path: "/adaptive-learning/recommendations/{id}/dismiss",
			tags: ["Adaptive Learning"],
			summary: "Dismiss recommendation",
		})
		.input(
			z.object({
				id: z.string().uuid(),
				reason: z.string().optional(),
			}),
		)
		.handler(async ({ context, input }) => {
			const recommendation = await recommendationService.getById(input.id);
			if (!recommendation || recommendation.userId !== context.user.id) {
				throw new ORPCError("NOT_FOUND");
			}
			return recommendationService.dismiss(input.id, input.reason);
		}),

	// Generate AI recommendations
	generate: protectedProcedure
		.route({
			method: "POST",
			path: "/adaptive-learning/recommendations/generate",
			tags: ["Adaptive Learning"],
			summary: "Generate AI recommendations",
		})
		.handler(async ({ context }) => {
			return recommendationService.generateRecommendations(context.user.id);
		}),
};

// ============================================================================
// DIFFICULTY ADAPTATION ROUTER
// ============================================================================

const difficultyRouter = {
	// Adapt difficulty based on performance
	adapt: protectedProcedure
		.route({
			method: "POST",
			path: "/adaptive-learning/difficulty/adapt",
			tags: ["Adaptive Learning"],
			summary: "Adapt difficulty based on performance",
		})
		.handler(async ({ context }) => {
			return difficultyService.adaptDifficulty(context.user.id);
		}),
};

// ============================================================================
// COMBINED ROUTER
// ============================================================================

export const adaptiveLearningRouter = {
	profile: profileRouter,
	paths: pathRouter,
	milestones: milestoneRouter,
	assessments: assessmentRouter,
	recommendations: recommendationRouter,
	difficulty: difficultyRouter,
};
