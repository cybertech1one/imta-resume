import z from "zod";
import { protectedProcedure } from "../context";
import { gapAnalysisService } from "../services/gap-analysis";

export const careerGapAnalysisEndpoints = {
	// Get gap analysis data
	get: protectedProcedure
		.route({
			method: "GET",
			path: "/career/gap-analysis",
			tags: ["Gap Analysis"],
			summary: "Get gap analysis data",
		})
		.output(
			z
				.object({
					id: z.string().uuid(),
					userId: z.string(),
					currentSkills: z.array(
						z.object({
							id: z.string().uuid(),
							name: z.string(),
							nameFr: z.string(),
							category: z.enum(["technical", "soft", "languages", "certifications", "tools"]),
							currentLevel: z.number(),
							yearsExperience: z.number(),
							lastUsed: z.string(),
							notes: z.string(),
							createdAt: z.string(),
							updatedAt: z.string(),
						}),
					),
					selectedRoleId: z.string().nullable(),
					progressRecords: z.array(
						z.object({
							skillId: z.string(),
							skillName: z.string(),
							date: z.string(),
							previousLevel: z.number(),
							newLevel: z.number(),
							notes: z.string(),
						}),
					),
					weeklyGoalHours: z.number(),
					lastAnalysisDate: z.coerce.date(),
					exportHistory: z.array(z.object({ date: z.string(), format: z.string() })),
					createdAt: z.coerce.date(),
					updatedAt: z.coerce.date(),
				})
				.nullable(),
		)
		.handler(async ({ context }) => {
			return await gapAnalysisService.get({ userId: context.user.id });
		}),

	// Get or create gap analysis data
	getOrCreate: protectedProcedure
		.route({
			method: "POST",
			path: "/career/gap-analysis/init",
			tags: ["Gap Analysis"],
			summary: "Get or create gap analysis data",
		})
		.output(
			z.object({
				id: z.string().uuid(),
				userId: z.string(),
				currentSkills: z.array(
					z.object({
						id: z.string().uuid(),
						name: z.string(),
						nameFr: z.string(),
						category: z.enum(["technical", "soft", "languages", "certifications", "tools"]),
						currentLevel: z.number(),
						yearsExperience: z.number(),
						lastUsed: z.string(),
						notes: z.string(),
						createdAt: z.string(),
						updatedAt: z.string(),
					}),
				),
				selectedRoleId: z.string().nullable(),
				progressRecords: z.array(
					z.object({
						skillId: z.string(),
						skillName: z.string(),
						date: z.string(),
						previousLevel: z.number(),
						newLevel: z.number(),
						notes: z.string(),
					}),
				),
				weeklyGoalHours: z.number(),
				lastAnalysisDate: z.coerce.date(),
				exportHistory: z.array(z.object({ date: z.string(), format: z.string() })),
				createdAt: z.coerce.date(),
				updatedAt: z.coerce.date(),
			}),
		)
		.handler(async ({ context }) => {
			return await gapAnalysisService.getOrCreate({ userId: context.user.id });
		}),

	// Update gap analysis data
	update: protectedProcedure
		.route({
			method: "PUT",
			path: "/career/gap-analysis",
			tags: ["Gap Analysis"],
			summary: "Update gap analysis data",
		})
		.input(
			z.object({
				currentSkills: z
					.array(
						z.object({
							id: z.string().uuid(),
							name: z.string(),
							nameFr: z.string(),
							category: z.enum(["technical", "soft", "languages", "certifications", "tools"]),
							currentLevel: z.number(),
							yearsExperience: z.number(),
							lastUsed: z.string(),
							notes: z.string(),
							createdAt: z.string(),
							updatedAt: z.string(),
						}),
					)
					.optional(),
				selectedRoleId: z.string().nullable().optional(),
				progressRecords: z
					.array(
						z.object({
							skillId: z.string(),
							skillName: z.string(),
							date: z.string(),
							previousLevel: z.number(),
							newLevel: z.number(),
							notes: z.string(),
						}),
					)
					.optional(),
				weeklyGoalHours: z.number().optional(),
				exportHistory: z.array(z.object({ date: z.string(), format: z.string() })).optional(),
			}),
		)
		.output(
			z.object({
				id: z.string().uuid(),
				userId: z.string(),
				currentSkills: z.array(
					z.object({
						id: z.string().uuid(),
						name: z.string(),
						nameFr: z.string(),
						category: z.enum(["technical", "soft", "languages", "certifications", "tools"]),
						currentLevel: z.number(),
						yearsExperience: z.number(),
						lastUsed: z.string(),
						notes: z.string(),
						createdAt: z.string(),
						updatedAt: z.string(),
					}),
				),
				selectedRoleId: z.string().nullable(),
				progressRecords: z.array(
					z.object({
						skillId: z.string(),
						skillName: z.string(),
						date: z.string(),
						previousLevel: z.number(),
						newLevel: z.number(),
						notes: z.string(),
					}),
				),
				weeklyGoalHours: z.number(),
				lastAnalysisDate: z.coerce.date(),
				exportHistory: z.array(z.object({ date: z.string(), format: z.string() })),
				createdAt: z.coerce.date(),
				updatedAt: z.coerce.date(),
			}),
		)
		.handler(async ({ context, input }) => {
			return await gapAnalysisService.update({ userId: context.user.id, ...input });
		}),

	// Add a skill
	addSkill: protectedProcedure
		.route({
			method: "POST",
			path: "/career/gap-analysis/skills",
			tags: ["Gap Analysis"],
			summary: "Add a new skill",
		})
		.input(
			z.object({
				name: z.string().min(1),
				nameFr: z.string().min(1),
				category: z.enum(["technical", "soft", "languages", "certifications", "tools"]),
				currentLevel: z.number().min(1).max(5),
				yearsExperience: z.number().min(0),
				notes: z.string().optional(),
			}),
		)
		.output(
			z.object({
				id: z.string().uuid(),
				userId: z.string(),
				currentSkills: z.array(
					z.object({
						id: z.string().uuid(),
						name: z.string(),
						nameFr: z.string(),
						category: z.enum(["technical", "soft", "languages", "certifications", "tools"]),
						currentLevel: z.number(),
						yearsExperience: z.number(),
						lastUsed: z.string(),
						notes: z.string(),
						createdAt: z.string(),
						updatedAt: z.string(),
					}),
				),
				selectedRoleId: z.string().nullable(),
				progressRecords: z.array(
					z.object({
						skillId: z.string(),
						skillName: z.string(),
						date: z.string(),
						previousLevel: z.number(),
						newLevel: z.number(),
						notes: z.string(),
					}),
				),
				weeklyGoalHours: z.number(),
				lastAnalysisDate: z.coerce.date(),
				exportHistory: z.array(z.object({ date: z.string(), format: z.string() })),
				createdAt: z.coerce.date(),
				updatedAt: z.coerce.date(),
			}),
		)
		.handler(async ({ context, input }) => {
			return await gapAnalysisService.addSkill({ userId: context.user.id, ...input });
		}),

	// Update skill level with progress tracking
	updateSkillLevel: protectedProcedure
		.route({
			method: "PATCH",
			path: "/career/gap-analysis/skills/{skillId}/level",
			tags: ["Gap Analysis"],
			summary: "Update skill level with progress tracking",
		})
		.input(
			z.object({
				skillId: z.string(),
				newLevel: z.number().min(1).max(5),
				notes: z.string().optional(),
			}),
		)
		.output(
			z.object({
				id: z.string().uuid(),
				userId: z.string(),
				currentSkills: z.array(
					z.object({
						id: z.string().uuid(),
						name: z.string(),
						nameFr: z.string(),
						category: z.enum(["technical", "soft", "languages", "certifications", "tools"]),
						currentLevel: z.number(),
						yearsExperience: z.number(),
						lastUsed: z.string(),
						notes: z.string(),
						createdAt: z.string(),
						updatedAt: z.string(),
					}),
				),
				selectedRoleId: z.string().nullable(),
				progressRecords: z.array(
					z.object({
						skillId: z.string(),
						skillName: z.string(),
						date: z.string(),
						previousLevel: z.number(),
						newLevel: z.number(),
						notes: z.string(),
					}),
				),
				weeklyGoalHours: z.number(),
				lastAnalysisDate: z.coerce.date(),
				exportHistory: z.array(z.object({ date: z.string(), format: z.string() })),
				createdAt: z.coerce.date(),
				updatedAt: z.coerce.date(),
			}),
		)
		.handler(async ({ context, input }) => {
			return await gapAnalysisService.updateSkillLevel({ userId: context.user.id, ...input });
		}),

	// Delete a skill
	deleteSkill: protectedProcedure
		.route({
			method: "DELETE",
			path: "/career/gap-analysis/skills/{skillId}",
			tags: ["Gap Analysis"],
			summary: "Delete a skill",
		})
		.input(z.object({ skillId: z.string() }))
		.output(
			z.object({
				id: z.string().uuid(),
				userId: z.string(),
				currentSkills: z.array(
					z.object({
						id: z.string().uuid(),
						name: z.string(),
						nameFr: z.string(),
						category: z.enum(["technical", "soft", "languages", "certifications", "tools"]),
						currentLevel: z.number(),
						yearsExperience: z.number(),
						lastUsed: z.string(),
						notes: z.string(),
						createdAt: z.string(),
						updatedAt: z.string(),
					}),
				),
				selectedRoleId: z.string().nullable(),
				progressRecords: z.array(
					z.object({
						skillId: z.string(),
						skillName: z.string(),
						date: z.string(),
						previousLevel: z.number(),
						newLevel: z.number(),
						notes: z.string(),
					}),
				),
				weeklyGoalHours: z.number(),
				lastAnalysisDate: z.coerce.date(),
				exportHistory: z.array(z.object({ date: z.string(), format: z.string() })),
				createdAt: z.coerce.date(),
				updatedAt: z.coerce.date(),
			}),
		)
		.handler(async ({ context, input }) => {
			return await gapAnalysisService.deleteSkill({ userId: context.user.id, skillId: input.skillId });
		}),

	// Select target role
	selectRole: protectedProcedure
		.route({
			method: "PATCH",
			path: "/career/gap-analysis/role",
			tags: ["Gap Analysis"],
			summary: "Select target role",
		})
		.input(z.object({ roleId: z.string().nullable() }))
		.output(
			z.object({
				id: z.string().uuid(),
				userId: z.string(),
				currentSkills: z.array(
					z.object({
						id: z.string().uuid(),
						name: z.string(),
						nameFr: z.string(),
						category: z.enum(["technical", "soft", "languages", "certifications", "tools"]),
						currentLevel: z.number(),
						yearsExperience: z.number(),
						lastUsed: z.string(),
						notes: z.string(),
						createdAt: z.string(),
						updatedAt: z.string(),
					}),
				),
				selectedRoleId: z.string().nullable(),
				progressRecords: z.array(
					z.object({
						skillId: z.string(),
						skillName: z.string(),
						date: z.string(),
						previousLevel: z.number(),
						newLevel: z.number(),
						notes: z.string(),
					}),
				),
				weeklyGoalHours: z.number(),
				lastAnalysisDate: z.coerce.date(),
				exportHistory: z.array(z.object({ date: z.string(), format: z.string() })),
				createdAt: z.coerce.date(),
				updatedAt: z.coerce.date(),
			}),
		)
		.handler(async ({ context, input }) => {
			return await gapAnalysisService.selectRole({ userId: context.user.id, roleId: input.roleId });
		}),

	// Record an export
	recordExport: protectedProcedure
		.route({
			method: "POST",
			path: "/career/gap-analysis/export",
			tags: ["Gap Analysis"],
			summary: "Record an export",
		})
		.input(z.object({ format: z.string() }))
		.output(
			z.object({
				id: z.string().uuid(),
				userId: z.string(),
				currentSkills: z.array(
					z.object({
						id: z.string().uuid(),
						name: z.string(),
						nameFr: z.string(),
						category: z.enum(["technical", "soft", "languages", "certifications", "tools"]),
						currentLevel: z.number(),
						yearsExperience: z.number(),
						lastUsed: z.string(),
						notes: z.string(),
						createdAt: z.string(),
						updatedAt: z.string(),
					}),
				),
				selectedRoleId: z.string().nullable(),
				progressRecords: z.array(
					z.object({
						skillId: z.string(),
						skillName: z.string(),
						date: z.string(),
						previousLevel: z.number(),
						newLevel: z.number(),
						notes: z.string(),
					}),
				),
				weeklyGoalHours: z.number(),
				lastAnalysisDate: z.coerce.date(),
				exportHistory: z.array(z.object({ date: z.string(), format: z.string() })),
				createdAt: z.coerce.date(),
				updatedAt: z.coerce.date(),
			}),
		)
		.handler(async ({ context, input }) => {
			return await gapAnalysisService.recordExport({ userId: context.user.id, format: input.format });
		}),

	// Reset gap analysis data
	reset: protectedProcedure
		.route({
			method: "DELETE",
			path: "/career/gap-analysis",
			tags: ["Gap Analysis"],
			summary: "Reset gap analysis data",
		})
		.output(z.void())
		.handler(async ({ context }) => {
			return await gapAnalysisService.reset({ userId: context.user.id });
		}),

	// Get statistics
	getStatistics: protectedProcedure
		.route({
			method: "GET",
			path: "/career/gap-analysis/statistics",
			tags: ["Gap Analysis"],
			summary: "Get gap analysis statistics",
		})
		.output(
			z.object({
				totalSkills: z.number(),
				byCategory: z.record(z.string(), z.number()),
				averageLevel: z.number(),
				totalProgressRecords: z.number(),
				recentProgress: z.array(
					z.object({
						skillId: z.string(),
						skillName: z.string(),
						date: z.string(),
						previousLevel: z.number(),
						newLevel: z.number(),
						notes: z.string(),
					}),
				),
				exportCount: z.number(),
			}),
		)
		.handler(async ({ context }) => {
			return await gapAnalysisService.getStatistics({ userId: context.user.id });
		}),
};
