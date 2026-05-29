import z from "zod";
import { protectedProcedure } from "../context";
import { chatbotSessionService } from "../services/chatbot-session";

export const chatbotSessionRouter = {
	list: protectedProcedure
		.route({ method: "GET", path: "/chatbot-session/list", tags: ["Chatbot Session"] })
		.input(z.object({}))
		.handler(async ({ context }) => {
			return chatbotSessionService.list(context.user.id);
		}),

	create: protectedProcedure
		.route({ method: "POST", path: "/chatbot-session/create", tags: ["Chatbot Session"] })
		.input(
			z.object({
				mode: z.string(),
				field: z.string(),
				language: z.string(),
				topic: z.string().optional(),
				messages: z.array(
					z.object({
						role: z.string(),
						content: z.string(),
						timestamp: z.string().optional(),
					}),
				),
				questionCount: z.number(),
				overallScore: z.number().optional(),
				summary: z.record(z.string(), z.unknown()).optional(),
			}),
		)
		.handler(async ({ input, context }) => {
			return chatbotSessionService.create({
				userId: context.user.id,
				...input,
			});
		}),

	delete: protectedProcedure
		.route({ method: "POST", path: "/chatbot-session/delete", tags: ["Chatbot Session"] })
		.input(z.object({ id: z.string().uuid() }))
		.handler(async ({ input, context }) => {
			await chatbotSessionService.delete(input.id, context.user.id);
			return { success: true };
		}),
};
