import { z } from "zod";
import { resumeGalleryService } from "@/integrations/orpc/services/resume-gallery";
import { protectedProcedure, publicProcedure } from "../context";

export const resumeGalleryRouter = {
	list: publicProcedure
		.input(
			z
				.object({
					field: z.string().optional(),
					experienceMin: z.number().int().min(0).optional(),
					experienceMax: z.number().int().min(0).optional(),
					language: z.string().optional(),
					templateName: z.string().optional(),
					search: z.string().optional(),
					page: z.number().int().min(1).optional(),
					pageSize: z.number().int().min(1).max(50).optional(),
				})
				.optional(),
		)
		.handler(async ({ input }) => {
			return resumeGalleryService.list(input);
		}),

	getById: publicProcedure.input(z.object({ id: z.string().uuid() })).handler(async ({ input }) => {
		return resumeGalleryService.getById(input.id);
	}),

	incrementViewCount: protectedProcedure.input(z.object({ id: z.string().uuid() })).handler(async ({ input }) => {
		return resumeGalleryService.incrementViewCount(input.id);
	}),

	incrementUseCount: protectedProcedure.input(z.object({ id: z.string().uuid() })).handler(async ({ input }) => {
		return resumeGalleryService.incrementUseCount(input.id);
	}),

	getFeatured: publicProcedure.handler(async () => {
		return resumeGalleryService.getFeatured();
	}),

	getFields: publicProcedure.handler(async () => {
		return resumeGalleryService.getFields();
	}),

	getTemplates: publicProcedure.handler(async () => {
		return resumeGalleryService.getTemplates();
	}),

	getLanguages: publicProcedure.handler(async () => {
		return resumeGalleryService.getLanguages();
	}),
};
