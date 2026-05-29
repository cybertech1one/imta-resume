import z from "zod";
import { protectedProcedure } from "../context";
import { userSkillsService } from "../services/user-skills";

export const careerUserSkillsEndpoints = {
	// Create a new skill
	create: protectedProcedure
		.route({
			method: "POST",
			path: "/career/user-skills",
			tags: ["User Skills"],
			summary: "Create a new user skill",
		})
		.input(
			z.object({
				name: z.string().min(1),
				nameFr: z.string().min(1),
				category: z.enum(["technical", "soft", "languages", "certifications"]),
				rating: z.number().min(1).max(5).optional().default(1),
				targetRating: z.number().min(1).max(5).optional().default(5),
			}),
		)
		.output(z.string())
		.handler(async ({ context, input }) => {
			return await userSkillsService.create({
				...input,
				userId: context.user.id,
			});
		}),

	// Get skill by ID
	getById: protectedProcedure
		.route({
			method: "GET",
			path: "/career/user-skills/{id}",
			tags: ["User Skills"],
			summary: "Get user skill by ID",
		})
		.input(z.object({ id: z.string().uuid() }))
		.output(
			z.object({
				id: z.string().uuid(),
				userId: z.string(),
				name: z.string(),
				nameFr: z.string(),
				category: z.enum(["technical", "soft", "languages", "certifications"]),
				rating: z.number(),
				targetRating: z.number(),
				progress: z.array(
					z.object({
						date: z.string(),
						rating: z.number(),
					}),
				),
				createdAt: z.coerce.date(),
				updatedAt: z.coerce.date(),
			}),
		)
		.handler(async ({ context, input }) => {
			return await userSkillsService.getById({ id: input.id, userId: context.user.id });
		}),

	// List all skills
	list: protectedProcedure
		.route({
			method: "GET",
			path: "/career/user-skills",
			tags: ["User Skills"],
			summary: "List all user skills",
		})
		.input(
			z
				.object({
					category: z.enum(["technical", "soft", "languages", "certifications"]).optional(),
				})
				.optional()
				.default({}),
		)
		.output(
			z.array(
				z.object({
					id: z.string().uuid(),
					userId: z.string(),
					name: z.string(),
					nameFr: z.string(),
					category: z.enum(["technical", "soft", "languages", "certifications"]),
					rating: z.number(),
					targetRating: z.number(),
					progress: z.array(
						z.object({
							date: z.string(),
							rating: z.number(),
						}),
					),
					createdAt: z.coerce.date(),
					updatedAt: z.coerce.date(),
				}),
			),
		)
		.handler(async ({ context, input }) => {
			return await userSkillsService.list({
				userId: context.user.id,
				category: input.category,
			});
		}),

	// Update skill
	update: protectedProcedure
		.route({
			method: "PUT",
			path: "/career/user-skills/{id}",
			tags: ["User Skills"],
			summary: "Update a user skill",
		})
		.input(
			z.object({
				id: z.string().uuid(),
				name: z.string().min(1).optional(),
				nameFr: z.string().min(1).optional(),
				category: z.enum(["technical", "soft", "languages", "certifications"]).optional(),
				rating: z.number().min(1).max(5).optional(),
				targetRating: z.number().min(1).max(5).optional(),
			}),
		)
		.output(z.void())
		.handler(async ({ context, input }) => {
			return await userSkillsService.update({
				...input,
				userId: context.user.id,
			});
		}),

	// Update rating (adds progress entry)
	updateRating: protectedProcedure
		.route({
			method: "PATCH",
			path: "/career/user-skills/{id}/rating",
			tags: ["User Skills"],
			summary: "Update skill rating and add progress entry",
		})
		.input(
			z.object({
				id: z.string().uuid(),
				rating: z.number().min(1).max(5),
			}),
		)
		.output(z.void())
		.handler(async ({ context, input }) => {
			return await userSkillsService.updateRating({
				id: input.id,
				userId: context.user.id,
				rating: input.rating,
			});
		}),

	// Update target rating
	updateTarget: protectedProcedure
		.route({
			method: "PATCH",
			path: "/career/user-skills/{id}/target",
			tags: ["User Skills"],
			summary: "Update skill target rating",
		})
		.input(
			z.object({
				id: z.string().uuid(),
				targetRating: z.number().min(1).max(5),
			}),
		)
		.output(z.void())
		.handler(async ({ context, input }) => {
			return await userSkillsService.updateTarget({
				id: input.id,
				userId: context.user.id,
				targetRating: input.targetRating,
			});
		}),

	// Delete skill
	delete: protectedProcedure
		.route({
			method: "DELETE",
			path: "/career/user-skills/{id}",
			tags: ["User Skills"],
			summary: "Delete a user skill",
		})
		.input(z.object({ id: z.string().uuid() }))
		.output(z.void())
		.handler(async ({ context, input }) => {
			return await userSkillsService.delete({ id: input.id, userId: context.user.id });
		}),

	// Get skills data (career path)
	getSkillsData: protectedProcedure
		.route({
			method: "GET",
			path: "/career/user-skills/data",
			tags: ["User Skills"],
			summary: "Get user skills data including selected career path",
		})
		.output(
			z.object({
				id: z.string().uuid(),
				userId: z.string(),
				selectedCareerPath: z.string().nullable(),
				createdAt: z.coerce.date(),
				updatedAt: z.coerce.date(),
			}),
		)
		.handler(async ({ context }) => {
			return await userSkillsService.getSkillsData({ userId: context.user.id });
		}),

	// Update career path
	updateCareerPath: protectedProcedure
		.route({
			method: "PATCH",
			path: "/career/user-skills/career-path",
			tags: ["User Skills"],
			summary: "Update selected career path",
		})
		.input(
			z.object({
				careerPathId: z.string().nullable(),
			}),
		)
		.output(z.void())
		.handler(async ({ context, input }) => {
			return await userSkillsService.updateCareerPath({
				userId: context.user.id,
				careerPathId: input.careerPathId,
			});
		}),

	// Get statistics
	getStatistics: protectedProcedure
		.route({
			method: "GET",
			path: "/career/user-skills/statistics",
			tags: ["User Skills"],
			summary: "Get user skills statistics",
		})
		.output(
			z.object({
				total: z.number(),
				byCategory: z.record(z.string(), z.number()),
				goalsReached: z.number(),
				inProgress: z.number(),
				overallProgress: z.number(),
				categoryProgress: z.record(z.string(), z.number()),
			}),
		)
		.handler(async ({ context }) => {
			return await userSkillsService.getStatistics({ userId: context.user.id });
		}),
};
