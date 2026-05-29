import z from "zod";
import { protectedProcedure } from "../context";
import { skillsQuizService } from "../services/skills-quiz";

export const careerSkillsQuizEndpoints = {
	// Create a new quiz result
	create: protectedProcedure
		.route({
			method: "POST",
			path: "/career/skills-quiz",
			tags: ["Skills Quiz"],
			summary: "Save a skills quiz result",
		})
		.input(
			z.object({
				category: z.enum(["technical", "soft_skills", "leadership"]),
				totalQuestions: z.number().min(1),
				correctAnswers: z.number().min(0),
				score: z.number().min(0).max(100),
				level: z.enum(["beginner", "intermediate", "advanced", "expert"]),
				timeSpent: z.number().min(0),
				skillBreakdown: z.record(
					z.string(),
					z.object({
						correct: z.number(),
						total: z.number(),
					}),
				),
				badges: z.array(z.string()),
			}),
		)
		.output(z.string())
		.handler(async ({ context, input }) => {
			return await skillsQuizService.create({
				...input,
				userId: context.user.id,
			});
		}),

	// Get quiz result by ID
	getById: protectedProcedure
		.route({
			method: "GET",
			path: "/career/skills-quiz/{id}",
			tags: ["Skills Quiz"],
			summary: "Get quiz result by ID",
		})
		.input(z.object({ id: z.string().uuid() }))
		.output(
			z.object({
				id: z.string().uuid(),
				userId: z.string(),
				category: z.enum(["technical", "soft_skills", "leadership"]),
				totalQuestions: z.number(),
				correctAnswers: z.number(),
				score: z.number(),
				level: z.enum(["beginner", "intermediate", "advanced", "expert"]),
				timeSpent: z.number(),
				skillBreakdown: z.record(
					z.string(),
					z.object({
						correct: z.number(),
						total: z.number(),
					}),
				),
				badges: z.array(z.string()),
				createdAt: z.coerce.date(),
			}),
		)
		.handler(async ({ context, input }) => {
			return await skillsQuizService.getById({ id: input.id, userId: context.user.id });
		}),

	// List quiz results
	list: protectedProcedure
		.route({
			method: "GET",
			path: "/career/skills-quiz",
			tags: ["Skills Quiz"],
			summary: "List quiz results",
		})
		.input(
			z
				.object({
					category: z.enum(["technical", "soft_skills", "leadership"]).optional(),
				})
				.optional()
				.default({}),
		)
		.output(
			z.array(
				z.object({
					id: z.string().uuid(),
					userId: z.string(),
					category: z.enum(["technical", "soft_skills", "leadership"]),
					totalQuestions: z.number(),
					correctAnswers: z.number(),
					score: z.number(),
					level: z.enum(["beginner", "intermediate", "advanced", "expert"]),
					timeSpent: z.number(),
					skillBreakdown: z.record(
						z.string(),
						z.object({
							correct: z.number(),
							total: z.number(),
						}),
					),
					badges: z.array(z.string()),
					createdAt: z.coerce.date(),
				}),
			),
		)
		.handler(async ({ context, input }) => {
			return await skillsQuizService.list({
				userId: context.user.id,
				category: input.category,
			});
		}),

	// Delete quiz result
	delete: protectedProcedure
		.route({
			method: "DELETE",
			path: "/career/skills-quiz/{id}",
			tags: ["Skills Quiz"],
			summary: "Delete a quiz result",
		})
		.input(z.object({ id: z.string().uuid() }))
		.output(z.void())
		.handler(async ({ context, input }) => {
			return await skillsQuizService.delete({ id: input.id, userId: context.user.id });
		}),

	// Get statistics
	getStatistics: protectedProcedure
		.route({
			method: "GET",
			path: "/career/skills-quiz/statistics",
			tags: ["Skills Quiz"],
			summary: "Get skills quiz statistics",
		})
		.output(
			z.object({
				total: z.number(),
				byCategory: z.record(z.string(), z.number()),
				byLevel: z.record(z.string(), z.number()),
				badges: z.array(z.string()),
				badgeCount: z.number(),
				averageScore: z.number(),
				totalTimeSpent: z.number(),
				bestByCategory: z.record(
					z.string(),
					z
						.object({
							id: z.string().uuid(),
							userId: z.string(),
							category: z.enum(["technical", "soft_skills", "leadership"]),
							totalQuestions: z.number(),
							correctAnswers: z.number(),
							score: z.number(),
							level: z.enum(["beginner", "intermediate", "advanced", "expert"]),
							timeSpent: z.number(),
							skillBreakdown: z.record(
								z.string(),
								z.object({
									correct: z.number(),
									total: z.number(),
								}),
							),
							badges: z.array(z.string()),
							createdAt: z.coerce.date(),
						})
						.nullable(),
				),
			}),
		)
		.handler(async ({ context }) => {
			return await skillsQuizService.getStatistics({ userId: context.user.id });
		}),
};
