import { z } from "zod";
import { jobResourcesService } from "@/integrations/orpc/services/job-resources";
import { publicProcedure } from "../context";

export const jobResourcesRouter = {
	list: publicProcedure
		.input(
			z
				.object({
					category: z.string().optional(),
					location: z.string().optional(),
					field: z.string().optional(),
					isFree: z.boolean().optional(),
					search: z.string().optional(),
					page: z.number().int().min(1).optional(),
					pageSize: z.number().int().min(1).max(50).optional(),
				})
				.optional(),
		)
		.handler(async ({ input }) => {
			return jobResourcesService.list(input);
		}),

	getById: publicProcedure.input(z.object({ id: z.string().uuid() })).handler(async ({ input }) => {
		return jobResourcesService.getById(input.id);
	}),

	getCategories: publicProcedure.handler(async () => {
		return jobResourcesService.getCategories();
	}),

	getLocations: publicProcedure.handler(async () => {
		return jobResourcesService.getLocations();
	}),

	getFields: publicProcedure.handler(async () => {
		return jobResourcesService.getFields();
	}),

	getByCategory: publicProcedure.input(z.object({ category: z.string().min(1) })).handler(async ({ input }) => {
		return jobResourcesService.getByCategory(input.category);
	}),
};
