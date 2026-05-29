import z from "zod";
import { protectedProcedure } from "../context";
import { aiHistoryService } from "../services/ai-history";

// AI Content Source schema - matches the enum in schema.ts
const aiContentSourceSchema = z.enum([
	"ai_writer_bullet_point",
	"ai_writer_summary",
	"ai_writer_achievement",
	"ai_writer_cover_letter",
	"ai_writer_linkedin_summary",
	"ai_writer_skill_extraction",
	"improve_content",
	"generate_summary",
	"fix_grammar",
	"suggest_skills",
	"generate_headline",
	"analyze_resume",
	"parse_pdf",
	"parse_docx",
	"interview_questions",
	"interview_evaluation",
	"interview_chat",
	"interview_analysis",
	"career_prediction",
	"job_match",
	"career_trajectory",
	"transferable_skills",
	"success_factors",
	"ai_mentor_chat",
	"learning_path_generate",
	"learning_path_recommend",
	"voice_interview",
	"adaptive_quiz",
	"interview_coach",
	"interview_improve",
	"resume_gap_analysis",
	"resume_adapt_job",
	"resume_wizard_chat",
	"generate_resume",
	"apply_gap_fixes",
]);

export const aiHistoryRouter = {
	// List AI history with filters
	list: protectedProcedure
		.route({
			method: "GET",
			path: "/ai-history",
			tags: ["AI History"],
			summary: "List AI generation history",
		})
		.input(
			z
				.object({
					source: z.union([aiContentSourceSchema, z.array(aiContentSourceSchema)]).optional(),
					resumeId: z.string().uuid().optional().nullable(),
					search: z.string().optional(),
					isFavorite: z.boolean().optional(),
					includeExpired: z.boolean().optional(),
					limit: z.number().min(1).max(100).optional(),
					offset: z.number().min(0).optional(),
				})
				.optional()
				.default({}),
		)
		.output(z.array(z.any()))
		.handler(async ({ context, input }) => {
			return await aiHistoryService.list({
				userId: context.user.id,
				...input,
			});
		}),

	// Get a single history item
	getById: protectedProcedure
		.route({
			method: "GET",
			path: "/ai-history/{id}",
			tags: ["AI History"],
			summary: "Get specific AI history item",
		})
		.input(z.object({ id: z.string().uuid() }))
		.output(z.any().nullable())
		.handler(async ({ context, input }) => {
			return await aiHistoryService.getById({
				id: input.id,
				userId: context.user.id,
			});
		}),

	// Toggle favorite status
	toggleFavorite: protectedProcedure
		.route({
			method: "POST",
			path: "/ai-history/{id}/favorite",
			tags: ["AI History"],
			summary: "Toggle favorite status",
		})
		.input(z.object({ id: z.string().uuid() }))
		.output(z.object({ isFavorite: z.boolean() }))
		.handler(async ({ context, input }) => {
			const isFavorite = await aiHistoryService.toggleFavorite({
				id: input.id,
				userId: context.user.id,
			});
			return { isFavorite };
		}),

	// Mark content as applied to resume
	markApplied: protectedProcedure
		.route({
			method: "POST",
			path: "/ai-history/{id}/apply",
			tags: ["AI History"],
			summary: "Mark content as applied to resume",
		})
		.input(z.object({ id: z.string().uuid() }))
		.output(z.object({ success: z.boolean() }))
		.handler(async ({ context, input }) => {
			await aiHistoryService.markApplied({
				id: input.id,
				userId: context.user.id,
			});
			return { success: true };
		}),

	// Delete a history item
	delete: protectedProcedure
		.route({
			method: "DELETE",
			path: "/ai-history/{id}",
			tags: ["AI History"],
			summary: "Delete AI history item",
		})
		.input(z.object({ id: z.string().uuid() }))
		.output(z.object({ success: z.boolean() }))
		.handler(async ({ context, input }) => {
			await aiHistoryService.delete({
				id: input.id,
				userId: context.user.id,
			});
			return { success: true };
		}),

	// Get statistics
	getStats: protectedProcedure
		.route({
			method: "GET",
			path: "/ai-history/stats",
			tags: ["AI History"],
			summary: "Get AI history statistics",
		})
		.input(
			z
				.object({
					resumeId: z.string().uuid().optional(),
				})
				.optional()
				.default({}),
		)
		.output(
			z.object({
				total: z.number(),
				bySource: z.record(z.string(), z.number()),
				favorites: z.number(),
				applied: z.number(),
				lastWeek: z.number(),
			}),
		)
		.handler(async ({ context, input }) => {
			return await aiHistoryService.getStats({
				userId: context.user.id,
				resumeId: input.resumeId,
			});
		}),

	// Extend expiration
	extendExpiration: protectedProcedure
		.route({
			method: "POST",
			path: "/ai-history/{id}/extend",
			tags: ["AI History"],
			summary: "Extend expiration by specified days",
		})
		.input(
			z.object({
				id: z.string().uuid(),
				days: z.number().min(1).max(365).default(90),
			}),
		)
		.output(z.object({ success: z.boolean() }))
		.handler(async ({ context, input }) => {
			await aiHistoryService.extendExpiration({
				id: input.id,
				userId: context.user.id,
				days: input.days,
			});
			return { success: true };
		}),
};
