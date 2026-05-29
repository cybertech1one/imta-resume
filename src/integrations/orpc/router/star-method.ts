import z from "zod";
import { protectedProcedure } from "../context";
import { starMethodService } from "../services/star-method";

export const starMethodRouter = {
	list: protectedProcedure
		.route({ method: "GET", path: "/star-method/list", tags: ["STAR Method"] })
		.input(z.object({}))
		.handler(async ({ context }) => {
			return starMethodService.list(context.user.id);
		}),

	create: protectedProcedure
		.route({ method: "POST", path: "/star-method/create", tags: ["STAR Method"] })
		.input(
			z.object({
				scenarioId: z.string().min(1),
				questionFr: z.string().min(1).max(1000),
				category: z.string().min(1).max(100),
				situation: z.string().min(1).max(5000),
				task: z.string().min(1).max(5000),
				action: z.string().min(1).max(5000),
				result: z.string().min(1).max(5000),
				overallScore: z.number().min(0).max(100).optional(),
				evaluation: z.record(z.string(), z.unknown()).optional(),
			}),
		)
		.handler(async ({ input, context }) => {
			return starMethodService.create({
				userId: context.user.id,
				...input,
			});
		}),

	delete: protectedProcedure
		.route({ method: "POST", path: "/star-method/delete", tags: ["STAR Method"] })
		.input(z.object({ id: z.string().uuid() }))
		.handler(async ({ input, context }) => {
			await starMethodService.delete(input.id, context.user.id);
			return { success: true };
		}),
};
