import z from "zod";
import { protectedProcedure, publicProcedure } from "../context";
import { roadmapsService } from "../services/roadmaps";

export const careerRoadmapsEndpoints = {
	// Create a new roadmap
	create: protectedProcedure
		.route({
			method: "POST",
			path: "/career/roadmaps",
			tags: ["Roadmaps"],
			summary: "Create a new career roadmap",
		})
		.input(
			z.object({
				name: z.string().min(1).max(255),
				goal: z.object({
					id: z.string().uuid(),
					currentRole: z.string(),
					targetRole: z.string(),
					industry: z.string(),
					yearsExperience: z.number(),
					timeline: z.number(),
					priorities: z.array(z.string()),
					constraints: z.array(z.string()),
					createdAt: z.string(),
				}),
				selectedPath: z.object({
					id: z.string().uuid(),
					name: z.string(),
					description: z.string(),
					duration: z.number(),
					steps: z.array(z.any()),
					successProbability: z.number(),
					advantages: z.array(z.string()),
					challenges: z.array(z.string()),
					estimatedCost: z.string(),
					isSelected: z.boolean(),
				}),
				progress: z.object({
					overallProgress: z.number(),
					currentStepId: z.string().nullable(),
					completedSteps: z.number(),
					totalSteps: z.number(),
					completedMilestones: z.number(),
					totalMilestones: z.number(),
					completedSkills: z.number(),
					totalSkills: z.number(),
					startDate: z.string(),
					estimatedCompletionDate: z.string(),
					actualProgress: z.number(),
					streakDays: z.number(),
					lastActivityDate: z.string(),
				}),
				isShared: z.boolean().optional(),
				shareCode: z.string().optional(),
			}),
		)
		.output(z.string())
		.handler(async ({ context, input }) => {
			return await roadmapsService.create({
				...input,
				userId: context.user.id,
			});
		}),

	// Get roadmap by ID
	getById: protectedProcedure
		.route({
			method: "GET",
			path: "/career/roadmaps/{id}",
			tags: ["Roadmaps"],
			summary: "Get roadmap by ID",
		})
		.input(z.object({ id: z.string().uuid() }))
		.handler(async ({ context, input }) => {
			return await roadmapsService.getById({ id: input.id, userId: context.user.id });
		}),

	// Get roadmap by share code (public)
	getByShareCode: publicProcedure
		.route({
			method: "GET",
			path: "/career/roadmaps/shared/{shareCode}",
			tags: ["Roadmaps"],
			summary: "Get shared roadmap by code",
		})
		.input(z.object({ shareCode: z.string() }))
		.handler(async ({ input }) => {
			return await roadmapsService.getByShareCode({ shareCode: input.shareCode });
		}),

	// List roadmaps
	list: protectedProcedure
		.route({
			method: "GET",
			path: "/career/roadmaps",
			tags: ["Roadmaps"],
			summary: "List user roadmaps",
		})
		.handler(async ({ context }) => {
			return await roadmapsService.list({ userId: context.user.id });
		}),

	// Get current/active roadmap
	getCurrent: protectedProcedure
		.route({
			method: "GET",
			path: "/career/roadmaps/current",
			tags: ["Roadmaps"],
			summary: "Get current active roadmap",
		})
		.handler(async ({ context }) => {
			return await roadmapsService.getCurrent({ userId: context.user.id });
		}),

	// Update roadmap
	update: protectedProcedure
		.route({
			method: "PUT",
			path: "/career/roadmaps/{id}",
			tags: ["Roadmaps"],
			summary: "Update a roadmap",
		})
		.input(
			z.object({
				id: z.string().uuid(),
				name: z.string().min(1).max(255).optional(),
				goal: z
					.object({
						id: z.string().uuid(),
						currentRole: z.string(),
						targetRole: z.string(),
						industry: z.string(),
						yearsExperience: z.number(),
						timeline: z.number(),
						priorities: z.array(z.string()),
						constraints: z.array(z.string()),
						createdAt: z.string(),
					})
					.optional(),
				selectedPath: z
					.object({
						id: z.string().uuid(),
						name: z.string(),
						description: z.string(),
						duration: z.number(),
						steps: z.array(z.any()),
						successProbability: z.number(),
						advantages: z.array(z.string()),
						challenges: z.array(z.string()),
						estimatedCost: z.string(),
						isSelected: z.boolean(),
					})
					.optional(),
				progress: z
					.object({
						overallProgress: z.number(),
						currentStepId: z.string().nullable(),
						completedSteps: z.number(),
						totalSteps: z.number(),
						completedMilestones: z.number(),
						totalMilestones: z.number(),
						completedSkills: z.number(),
						totalSkills: z.number(),
						startDate: z.string(),
						estimatedCompletionDate: z.string(),
						actualProgress: z.number(),
						streakDays: z.number(),
						lastActivityDate: z.string(),
					})
					.optional(),
				isShared: z.boolean().optional(),
				shareCode: z.string().optional(),
			}),
		)
		.output(z.void())
		.handler(async ({ context, input }) => {
			return await roadmapsService.update({
				...input,
				userId: context.user.id,
			});
		}),

	// Update progress only
	updateProgress: protectedProcedure
		.route({
			method: "PATCH",
			path: "/career/roadmaps/{id}/progress",
			tags: ["Roadmaps"],
			summary: "Update roadmap progress",
		})
		.input(
			z.object({
				id: z.string().uuid(),
				progress: z.object({
					overallProgress: z.number(),
					currentStepId: z.string().nullable(),
					completedSteps: z.number(),
					totalSteps: z.number(),
					completedMilestones: z.number(),
					totalMilestones: z.number(),
					completedSkills: z.number(),
					totalSkills: z.number(),
					startDate: z.string(),
					estimatedCompletionDate: z.string(),
					actualProgress: z.number(),
					streakDays: z.number(),
					lastActivityDate: z.string(),
				}),
			}),
		)
		.output(z.void())
		.handler(async ({ context, input }) => {
			return await roadmapsService.updateProgress({
				id: input.id,
				userId: context.user.id,
				progress: input.progress,
			});
		}),

	// Toggle step completion
	toggleStepComplete: protectedProcedure
		.route({
			method: "PATCH",
			path: "/career/roadmaps/{id}/steps/{stepId}/toggle",
			tags: ["Roadmaps"],
			summary: "Toggle step completion status",
		})
		.input(
			z.object({
				id: z.string().uuid(),
				stepId: z.string(),
			}),
		)
		.handler(async ({ context, input }) => {
			return await roadmapsService.toggleStepComplete({
				id: input.id,
				userId: context.user.id,
				stepId: input.stepId,
			});
		}),

	// Share roadmap
	share: protectedProcedure
		.route({
			method: "POST",
			path: "/career/roadmaps/{id}/share",
			tags: ["Roadmaps"],
			summary: "Share a roadmap",
		})
		.input(z.object({ id: z.string().uuid() }))
		.output(z.string())
		.handler(async ({ context, input }) => {
			return await roadmapsService.share({ id: input.id, userId: context.user.id });
		}),

	// Unshare roadmap
	unshare: protectedProcedure
		.route({
			method: "POST",
			path: "/career/roadmaps/{id}/unshare",
			tags: ["Roadmaps"],
			summary: "Unshare a roadmap",
		})
		.input(z.object({ id: z.string().uuid() }))
		.output(z.void())
		.handler(async ({ context, input }) => {
			return await roadmapsService.unshare({ id: input.id, userId: context.user.id });
		}),

	// Delete roadmap
	delete: protectedProcedure
		.route({
			method: "DELETE",
			path: "/career/roadmaps/{id}",
			tags: ["Roadmaps"],
			summary: "Delete a roadmap",
		})
		.input(z.object({ id: z.string().uuid() }))
		.output(z.void())
		.handler(async ({ context, input }) => {
			return await roadmapsService.delete({ id: input.id, userId: context.user.id });
		}),

	// Get statistics
	getStatistics: protectedProcedure
		.route({
			method: "GET",
			path: "/career/roadmaps/statistics",
			tags: ["Roadmaps"],
			summary: "Get roadmap statistics",
		})
		.output(
			z.object({
				total: z.number(),
				completedRoadmaps: z.number(),
				averageProgress: z.number(),
				totalStepsCompleted: z.number(),
				totalSteps: z.number(),
				inProgressRoadmaps: z.number(),
			}),
		)
		.handler(async ({ context }) => {
			return await roadmapsService.getStatistics({ userId: context.user.id });
		}),
};
