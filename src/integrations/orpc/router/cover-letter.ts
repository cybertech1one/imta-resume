import z from "zod";
import { protectedProcedure } from "../context";
import { coverLetterService, type TemplateType, type ToneType } from "../services/cover-letter";

const templateSchema = z.enum(["formal", "creative", "tech-focused", "executive"]);
const toneSchema = z.enum(["professional", "friendly", "confident", "enthusiastic"]);

const coverLetterSchema = z.object({
	id: z.string().uuid(),
	userId: z.string(),
	applicationId: z.string().nullable(),
	resumeId: z.string().nullable(),
	name: z.string(),
	companyName: z.string().nullable(),
	position: z.string().nullable(),
	template: z.string().nullable(),
	tone: z.string().nullable(),
	content: z.string(),
	tags: z.array(z.string()).nullable(),
	createdAt: z.coerce.date(),
	updatedAt: z.coerce.date(),
});

export const coverLetterRouter = {
	create: protectedProcedure
		.route({
			method: "POST",
			path: "/cover-letter",
			tags: ["Cover Letter"],
			summary: "Create a new cover letter",
		})
		.input(
			z.object({
				name: z.string().min(1).max(255),
				companyName: z.string().max(255).optional(),
				position: z.string().max(255).optional(),
				template: templateSchema.optional(),
				tone: toneSchema.optional(),
				content: z.string(),
				tags: z.array(z.string()).optional(),
				applicationId: z.string().uuid().optional(),
				resumeId: z.string().uuid().optional(),
			}),
		)
		.output(z.string())
		.handler(async ({ context, input }) => {
			return await coverLetterService.create({
				...input,
				userId: context.user.id,
				template: input.template as TemplateType | undefined,
				tone: input.tone as ToneType | undefined,
			});
		}),

	getById: protectedProcedure
		.route({
			method: "GET",
			path: "/cover-letter/{id}",
			tags: ["Cover Letter"],
			summary: "Get cover letter by ID",
		})
		.input(z.object({ id: z.string().uuid() }))
		.output(coverLetterSchema)
		.handler(async ({ context, input }) => {
			return await coverLetterService.getById({ id: input.id, userId: context.user.id });
		}),

	list: protectedProcedure
		.route({
			method: "GET",
			path: "/cover-letter",
			tags: ["Cover Letter"],
			summary: "List cover letters",
		})
		.input(
			z
				.object({
					template: templateSchema.optional(),
					tone: toneSchema.optional(),
					search: z.string().optional(),
					limit: z.number().optional(),
					offset: z.number().optional(),
				})
				.optional()
				.default({}),
		)
		.output(z.array(coverLetterSchema))
		.handler(async ({ context, input }) => {
			return await coverLetterService.list({
				userId: context.user.id,
				...input,
				template: input.template as TemplateType | undefined,
				tone: input.tone as ToneType | undefined,
			});
		}),

	update: protectedProcedure
		.route({
			method: "PUT",
			path: "/cover-letter/{id}",
			tags: ["Cover Letter"],
			summary: "Update a cover letter",
		})
		.input(
			z.object({
				id: z.string().uuid(),
				name: z.string().min(1).max(255).optional(),
				companyName: z.string().max(255).optional(),
				position: z.string().max(255).optional(),
				template: templateSchema.optional(),
				tone: toneSchema.optional(),
				content: z.string().optional(),
				tags: z.array(z.string()).optional(),
				applicationId: z.string().uuid().optional().nullable(),
				resumeId: z.string().uuid().optional().nullable(),
			}),
		)
		.output(z.void())
		.handler(async ({ context, input }) => {
			return await coverLetterService.update({
				...input,
				userId: context.user.id,
				template: input.template as TemplateType | undefined,
				tone: input.tone as ToneType | undefined,
			});
		}),

	delete: protectedProcedure
		.route({
			method: "DELETE",
			path: "/cover-letter/{id}",
			tags: ["Cover Letter"],
			summary: "Delete a cover letter",
		})
		.input(z.object({ id: z.string().uuid() }))
		.output(z.void())
		.handler(async ({ context, input }) => {
			return await coverLetterService.delete({ id: input.id, userId: context.user.id });
		}),

	duplicate: protectedProcedure
		.route({
			method: "POST",
			path: "/cover-letter/{id}/duplicate",
			tags: ["Cover Letter"],
			summary: "Duplicate a cover letter",
		})
		.input(
			z.object({
				id: z.string().uuid(),
				name: z.string().optional(),
			}),
		)
		.output(z.string())
		.handler(async ({ context, input }) => {
			return await coverLetterService.duplicate({
				id: input.id,
				userId: context.user.id,
				name: input.name,
			});
		}),

	getStatistics: protectedProcedure
		.route({
			method: "GET",
			path: "/cover-letter/statistics",
			tags: ["Cover Letter"],
			summary: "Get cover letter statistics",
		})
		.input(z.object({}).optional().default({}))
		.output(
			z.object({
				total: z.number(),
				byTemplate: z.record(z.string(), z.number()),
				byTone: z.record(z.string(), z.number()),
				recentCompanies: z.array(z.string()),
			}),
		)
		.handler(async ({ context }) => {
			return await coverLetterService.getStatistics({ userId: context.user.id });
		}),
};
