import z from "zod";
import { protectedProcedure } from "../context";
import { elevatorPitchService } from "../services/elevator-pitch";

export const elevatorPitchRouter = {
	list: protectedProcedure
		.route({ method: "GET", path: "/elevator-pitch/list", tags: ["Elevator Pitch"] })
		.input(z.object({}))
		.handler(async ({ context }) => {
			return elevatorPitchService.list(context.user.id);
		}),

	create: protectedProcedure
		.route({ method: "POST", path: "/elevator-pitch/create", tags: ["Elevator Pitch"] })
		.input(
			z.object({
				name: z.string().min(1).max(200),
				content: z.string().min(1).max(5000),
				length: z.string().default("60s"),
				context: z.string().default("interview"),
				industry: z.string().default("general"),
				wordCount: z.number().optional(),
				estimatedTime: z.number().optional(),
			}),
		)
		.handler(async ({ input, context }) => {
			return elevatorPitchService.create({
				userId: context.user.id,
				...input,
			});
		}),

	update: protectedProcedure
		.route({ method: "POST", path: "/elevator-pitch/update", tags: ["Elevator Pitch"] })
		.input(
			z.object({
				id: z.string().uuid(),
				name: z.string().min(1).max(200).optional(),
				content: z.string().min(1).max(5000).optional(),
				length: z.string().optional(),
				context: z.string().optional(),
				industry: z.string().optional(),
				wordCount: z.number().optional(),
				estimatedTime: z.number().optional(),
			}),
		)
		.handler(async ({ input, context }) => {
			return elevatorPitchService.update({
				...input,
				userId: context.user.id,
			});
		}),

	delete: protectedProcedure
		.route({ method: "POST", path: "/elevator-pitch/delete", tags: ["Elevator Pitch"] })
		.input(z.object({ id: z.string().uuid() }))
		.handler(async ({ input, context }) => {
			await elevatorPitchService.delete(input.id, context.user.id);
			return { success: true };
		}),
};
