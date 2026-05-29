import z from "zod";
import { protectedProcedure } from "../context";
import { messageTemplateService } from "../services/message-template";

const personalizationFieldSchema = z.object({
	key: z.string(),
	label: z.string(),
	placeholder: z.string(),
	example: z.string(),
});

const messageTemplateSchema = z.object({
	id: z.string().uuid(),
	userId: z.string(),
	name: z.string(),
	category: z.string(),
	subject: z.string().nullable(),
	body: z.string(),
	tags: z.array(z.string()),
	isFavorite: z.boolean(),
	isCustom: z.boolean(),
	personalizationFields: z.array(personalizationFieldSchema),
	createdAt: z.coerce.date(),
	updatedAt: z.coerce.date(),
});

export const messageTemplateRouter = {
	list: protectedProcedure
		.route({
			method: "GET",
			path: "/message-template",
			tags: ["MessageTemplate"],
			summary: "List all message templates for the current user",
		})
		.input(z.object({}).optional().default({}))
		.output(z.array(messageTemplateSchema))
		.handler(async ({ context }) => {
			return await messageTemplateService.list(context.user.id);
		}),

	create: protectedProcedure
		.route({
			method: "POST",
			path: "/message-template",
			tags: ["MessageTemplate"],
			summary: "Create a new message template",
		})
		.input(
			z.object({
				name: z.string().min(1),
				category: z.string().default("email"),
				subject: z.string().optional(),
				body: z.string().min(1),
				tags: z.array(z.string()).optional().default([]),
				isFavorite: z.boolean().optional().default(false),
				isCustom: z.boolean().optional().default(true),
				personalizationFields: z.array(personalizationFieldSchema).optional().default([]),
			}),
		)
		.output(messageTemplateSchema)
		.handler(async ({ context, input }) => {
			return await messageTemplateService.create({
				...input,
				userId: context.user.id,
			});
		}),

	update: protectedProcedure
		.route({
			method: "PUT",
			path: "/message-template/{id}",
			tags: ["MessageTemplate"],
			summary: "Update a message template",
		})
		.input(
			z.object({
				id: z.string().uuid(),
				name: z.string().min(1).optional(),
				category: z.string().optional(),
				subject: z.string().nullable().optional(),
				body: z.string().min(1).optional(),
				tags: z.array(z.string()).optional(),
				isFavorite: z.boolean().optional(),
				isCustom: z.boolean().optional(),
				personalizationFields: z.array(personalizationFieldSchema).optional(),
			}),
		)
		.output(messageTemplateSchema.nullable())
		.handler(async ({ context, input }) => {
			return await messageTemplateService.update({
				...input,
				userId: context.user.id,
			});
		}),

	delete: protectedProcedure
		.route({
			method: "DELETE",
			path: "/message-template/{id}",
			tags: ["MessageTemplate"],
			summary: "Delete a message template",
		})
		.input(z.object({ id: z.string().uuid() }))
		.output(z.void())
		.handler(async ({ context, input }) => {
			return await messageTemplateService.delete(input.id, context.user.id);
		}),

	toggleFavorite: protectedProcedure
		.route({
			method: "POST",
			path: "/message-template/{id}/toggle-favorite",
			tags: ["MessageTemplate"],
			summary: "Toggle favorite status of a message template",
		})
		.input(z.object({ id: z.string().uuid() }))
		.output(messageTemplateSchema.nullable())
		.handler(async ({ context, input }) => {
			return await messageTemplateService.toggleFavorite(input.id, context.user.id);
		}),
};
