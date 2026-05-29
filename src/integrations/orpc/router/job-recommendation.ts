import { z } from "zod";
import { protectedProcedure } from "../context";
import { jobRecommendationService } from "../services/job-recommendation";

// ============================================================================
// SCHEMAS
// ============================================================================

const jobRecommendationStatusSchema = z.enum(["new", "viewed", "applied", "saved", "dismissed"]);

const userJobPreferenceSchema = z.object({
	preferredFields: z.array(z.string()).optional(),
	preferredLocations: z.array(z.string()).optional(),
	preferredRegions: z.array(z.string()).optional(),
	minSalary: z.number().optional(),
	maxSalary: z.number().optional(),
	jobTypes: z.array(z.string()).optional(),
	experienceLevel: z.string().optional(),
	willingToRelocate: z.boolean().optional(),
	remotePreference: z.enum(["onsite", "remote", "hybrid"]).optional(),
	keywords: z.array(z.string()).optional(),
	excludedCompanies: z.array(z.string()).optional(),
	prioritySkills: z.array(z.string()).optional(),
});

// ============================================================================
// ROUTER
// ============================================================================

export const jobRecommendationRouter = {
	// Get user's job preferences
	getPreferences: protectedProcedure
		.route({
			method: "GET",
			path: "/job-recommendations/preferences",
			tags: ["Job Recommendations"],
			summary: "Get user's job preferences",
		})
		.handler(async ({ context }) => {
			const prefs = await jobRecommendationService.getUserPreferences(context.user.id);
			return prefs;
		}),

	// Update user's job preferences
	updatePreferences: protectedProcedure
		.route({
			method: "PUT",
			path: "/job-recommendations/preferences",
			tags: ["Job Recommendations"],
			summary: "Update user's job preferences",
		})
		.input(userJobPreferenceSchema)
		.handler(async ({ context, input }) => {
			const prefs = await jobRecommendationService.updateUserPreferences(context.user.id, input);
			return prefs;
		}),

	// Get job recommendations
	getRecommendations: protectedProcedure
		.route({
			method: "GET",
			path: "/job-recommendations",
			tags: ["Job Recommendations"],
			summary: "Get personalized job recommendations",
		})
		.input(
			z
				.object({
					status: jobRecommendationStatusSchema.optional(),
					minScore: z.number().min(0).max(100).optional(),
					limit: z.number().min(1).max(100).optional(),
					offset: z.number().min(0).optional(),
				})
				.optional(),
		)
		.handler(async ({ context, input }) => {
			return jobRecommendationService.getRecommendations(context.user.id, input);
		}),

	// Generate new recommendations
	generateRecommendations: protectedProcedure
		.route({
			method: "POST",
			path: "/job-recommendations/generate",
			tags: ["Job Recommendations"],
			summary: "Generate new job recommendations based on profile",
		})
		.input(
			z
				.object({
					resumeId: z.string().optional(),
					forceRefresh: z.boolean().optional(),
				})
				.optional(),
		)
		.handler(async ({ context, input }) => {
			return jobRecommendationService.generateRecommendations(context.user.id, input);
		}),

	// Update recommendation status
	updateStatus: protectedProcedure
		.route({
			method: "PUT",
			path: "/job-recommendations/{id}/status",
			tags: ["Job Recommendations"],
			summary: "Update recommendation status",
		})
		.input(
			z.object({
				id: z.string().uuid(),
				status: jobRecommendationStatusSchema,
			}),
		)
		.handler(async ({ context, input }) => {
			return jobRecommendationService.updateRecommendationStatus(input.id, context.user.id, input.status);
		}),

	// Dismiss a recommendation
	dismiss: protectedProcedure
		.route({
			method: "POST",
			path: "/job-recommendations/{id}/dismiss",
			tags: ["Job Recommendations"],
			summary: "Dismiss a job recommendation",
		})
		.input(z.object({ id: z.string().uuid() }))
		.handler(async ({ context, input }) => {
			await jobRecommendationService.dismissRecommendation(input.id, context.user.id);
			return { success: true };
		}),

	// Save a recommendation
	save: protectedProcedure
		.route({
			method: "POST",
			path: "/job-recommendations/{id}/save",
			tags: ["Job Recommendations"],
			summary: "Save a job recommendation",
		})
		.input(z.object({ id: z.string().uuid() }))
		.handler(async ({ context, input }) => {
			return jobRecommendationService.saveRecommendation(input.id, context.user.id);
		}),

	// Mark as viewed
	markViewed: protectedProcedure
		.route({
			method: "POST",
			path: "/job-recommendations/{id}/view",
			tags: ["Job Recommendations"],
			summary: "Mark recommendation as viewed",
		})
		.input(z.object({ id: z.string().uuid() }))
		.handler(async ({ context, input }) => {
			return jobRecommendationService.updateRecommendationStatus(input.id, context.user.id, "viewed");
		}),

	// Mark as applied
	markApplied: protectedProcedure
		.route({
			method: "POST",
			path: "/job-recommendations/{id}/apply",
			tags: ["Job Recommendations"],
			summary: "Mark recommendation as applied",
		})
		.input(z.object({ id: z.string().uuid() }))
		.handler(async ({ context, input }) => {
			return jobRecommendationService.updateRecommendationStatus(input.id, context.user.id, "applied");
		}),

	// Get recommendation stats
	getStats: protectedProcedure
		.route({
			method: "GET",
			path: "/job-recommendations/stats",
			tags: ["Job Recommendations"],
			summary: "Get recommendation statistics",
		})
		.handler(async ({ context }) => {
			return jobRecommendationService.getRecommendationStats(context.user.id);
		}),
};
