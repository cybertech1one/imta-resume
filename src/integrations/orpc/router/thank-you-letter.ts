import z from "zod";
import { protectedProcedure } from "../context";
import {
	type InterviewType,
	type SendMethod,
	type SuggestionCategory,
	type TemplateStyle,
	thankYouLetterService,
} from "../services/thank-you-letter";

// Schemas
const templateStyleSchema = z.enum(["formal", "warm", "enthusiastic"]);
const interviewTypeSchema = z.enum(["phone", "video", "inperson", "panel", "technical"]);
const sendMethodSchema = z.enum(["email", "physical", "linkedin"]);
const suggestionCategorySchema = z.enum(["opening", "body", "closing", "personalization"]);

const thankYouLetterSchema = z.object({
	id: z.string().uuid(),
	userId: z.string(),
	recipientName: z.string(),
	recipientCompany: z.string(),
	recipientPosition: z.string().nullable(),
	recipientEmail: z.string().nullable(),
	interviewDate: z.string(),
	interviewType: interviewTypeSchema,
	discussionPoints: z.array(z.string()),
	jobPosition: z.string(),
	template: templateStyleSchema,
	content: z.string(),
	createdAt: z.coerce.date(),
	updatedAt: z.coerce.date(),
});

const sendTrackingSchema = z.object({
	id: z.string().uuid(),
	letterId: z.string(),
	sentDate: z.string(),
	method: sendMethodSchema,
	followUpDate: z.string().nullable(),
	notes: z.string().nullable(),
	createdAt: z.coerce.date(),
});

const suggestionSchema = z.object({
	id: z.string().uuid(),
	letterId: z.string(),
	category: suggestionCategorySchema,
	text: z.string(),
	applied: z.boolean(),
	createdAt: z.coerce.date(),
});

export const thankYouLetterRouter = {
	// Create a new thank you letter
	create: protectedProcedure
		.route({
			method: "POST",
			path: "/thank-you-letter",
			tags: ["Thank You Letter"],
			summary: "Create a new thank you letter",
		})
		.input(
			z.object({
				recipientName: z.string().min(1),
				recipientCompany: z.string().min(1),
				recipientPosition: z.string().optional(),
				recipientEmail: z.string().email().optional(),
				interviewDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
				interviewType: interviewTypeSchema,
				discussionPoints: z.array(z.string()),
				jobPosition: z.string().min(1),
				template: templateStyleSchema,
				content: z.string(),
			}),
		)
		.output(z.string())
		.handler(async ({ context, input }) => {
			return await thankYouLetterService.create({
				...input,
				userId: context.user.id,
				interviewType: input.interviewType as InterviewType,
				template: input.template as TemplateStyle,
			});
		}),

	// Get thank you letter by ID
	getById: protectedProcedure
		.route({
			method: "GET",
			path: "/thank-you-letter/{id}",
			tags: ["Thank You Letter"],
			summary: "Get thank you letter by ID",
		})
		.input(z.object({ id: z.string().uuid() }))
		.output(thankYouLetterSchema)
		.handler(async ({ context, input }) => {
			return await thankYouLetterService.getById({ id: input.id, userId: context.user.id });
		}),

	// List all thank you letters
	list: protectedProcedure
		.route({
			method: "GET",
			path: "/thank-you-letter",
			tags: ["Thank You Letter"],
			summary: "List all thank you letters",
		})
		.input(
			z
				.object({
					limit: z.number().optional(),
					offset: z.number().optional(),
				})
				.optional()
				.default({}),
		)
		.output(z.array(thankYouLetterSchema))
		.handler(async ({ context, input }) => {
			return await thankYouLetterService.list({
				userId: context.user.id,
				...input,
			});
		}),

	// Update a thank you letter
	update: protectedProcedure
		.route({
			method: "PUT",
			path: "/thank-you-letter/{id}",
			tags: ["Thank You Letter"],
			summary: "Update a thank you letter",
		})
		.input(
			z.object({
				id: z.string().uuid(),
				recipientName: z.string().min(1).optional(),
				recipientCompany: z.string().min(1).optional(),
				recipientPosition: z.string().optional(),
				recipientEmail: z.string().email().optional(),
				interviewDate: z
					.string()
					.regex(/^\d{4}-\d{2}-\d{2}$/)
					.optional(),
				interviewType: interviewTypeSchema.optional(),
				discussionPoints: z.array(z.string()).optional(),
				jobPosition: z.string().min(1).optional(),
				template: templateStyleSchema.optional(),
				content: z.string().optional(),
			}),
		)
		.output(z.void())
		.handler(async ({ context, input }) => {
			return await thankYouLetterService.update({
				...input,
				userId: context.user.id,
				interviewType: input.interviewType as InterviewType | undefined,
				template: input.template as TemplateStyle | undefined,
			});
		}),

	// Delete a thank you letter
	delete: protectedProcedure
		.route({
			method: "DELETE",
			path: "/thank-you-letter/{id}",
			tags: ["Thank You Letter"],
			summary: "Delete a thank you letter",
		})
		.input(z.object({ id: z.string().uuid() }))
		.output(z.void())
		.handler(async ({ context, input }) => {
			return await thankYouLetterService.delete({ id: input.id, userId: context.user.id });
		}),

	// List all send tracking entries for user
	listSendTracking: protectedProcedure
		.route({
			method: "GET",
			path: "/thank-you-letter/tracking",
			tags: ["Thank You Letter"],
			summary: "List all send tracking entries",
		})
		.input(z.object({ limit: z.number().optional() }).optional().default({}))
		.output(
			z.array(
				z.object({
					tracking: sendTrackingSchema,
					letter: z.object({
						id: z.string().uuid(),
						recipientName: z.string(),
						recipientCompany: z.string(),
						jobPosition: z.string(),
					}),
				}),
			),
		)
		.handler(async ({ context, input }) => {
			return await thankYouLetterService.listAllSendTracking({
				userId: context.user.id,
				limit: input.limit,
			});
		}),

	// Get send tracking for a specific letter
	getSendTracking: protectedProcedure
		.route({
			method: "GET",
			path: "/thank-you-letter/{letterId}/tracking",
			tags: ["Thank You Letter"],
			summary: "Get send tracking for a letter",
		})
		.input(z.object({ letterId: z.string() }))
		.output(z.array(sendTrackingSchema))
		.handler(async ({ context, input }) => {
			return await thankYouLetterService.getSendTracking({
				letterId: input.letterId,
				userId: context.user.id,
			});
		}),

	// Create send tracking entry
	createSendTracking: protectedProcedure
		.route({
			method: "POST",
			path: "/thank-you-letter/{letterId}/tracking",
			tags: ["Thank You Letter"],
			summary: "Create send tracking entry",
		})
		.input(
			z.object({
				letterId: z.string(),
				sentDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
				method: sendMethodSchema,
				notes: z.string().optional(),
			}),
		)
		.output(z.string())
		.handler(async ({ context, input }) => {
			return await thankYouLetterService.createSendTracking({
				userId: context.user.id,
				letterId: input.letterId,
				sentDate: input.sentDate,
				method: input.method as SendMethod,
				notes: input.notes,
			});
		}),

	// Delete send tracking entry
	deleteSendTracking: protectedProcedure
		.route({
			method: "DELETE",
			path: "/thank-you-letter/tracking/{id}",
			tags: ["Thank You Letter"],
			summary: "Delete send tracking entry",
		})
		.input(z.object({ id: z.string().uuid() }))
		.output(z.void())
		.handler(async ({ context, input }) => {
			return await thankYouLetterService.deleteSendTracking({
				id: input.id,
				userId: context.user.id,
			});
		}),

	// Get AI suggestions for a letter
	getSuggestions: protectedProcedure
		.route({
			method: "GET",
			path: "/thank-you-letter/{letterId}/suggestions",
			tags: ["Thank You Letter"],
			summary: "Get AI suggestions for a letter",
		})
		.input(z.object({ letterId: z.string() }))
		.output(z.array(suggestionSchema))
		.handler(async ({ context, input }) => {
			return await thankYouLetterService.getAISuggestions({
				letterId: input.letterId,
				userId: context.user.id,
			});
		}),

	// Create AI suggestion
	createSuggestion: protectedProcedure
		.route({
			method: "POST",
			path: "/thank-you-letter/{letterId}/suggestions",
			tags: ["Thank You Letter"],
			summary: "Create AI suggestion",
		})
		.input(
			z.object({
				letterId: z.string(),
				category: suggestionCategorySchema,
				text: z.string(),
			}),
		)
		.output(z.string())
		.handler(async ({ context, input }) => {
			return await thankYouLetterService.createAISuggestion({
				userId: context.user.id,
				letterId: input.letterId,
				category: input.category as SuggestionCategory,
				text: input.text,
			});
		}),

	// Toggle suggestion applied status
	toggleSuggestion: protectedProcedure
		.route({
			method: "POST",
			path: "/thank-you-letter/suggestions/{suggestionId}/toggle",
			tags: ["Thank You Letter"],
			summary: "Toggle suggestion applied status",
		})
		.input(z.object({ suggestionId: z.string() }))
		.output(z.void())
		.handler(async ({ context, input }) => {
			return await thankYouLetterService.toggleSuggestionApplied({
				suggestionId: input.suggestionId,
				userId: context.user.id,
			});
		}),

	// Delete all suggestions for a letter (for regeneration)
	deleteSuggestions: protectedProcedure
		.route({
			method: "DELETE",
			path: "/thank-you-letter/{letterId}/suggestions",
			tags: ["Thank You Letter"],
			summary: "Delete all suggestions for a letter",
		})
		.input(z.object({ letterId: z.string() }))
		.output(z.void())
		.handler(async ({ context, input }) => {
			return await thankYouLetterService.deleteSuggestions({
				letterId: input.letterId,
				userId: context.user.id,
			});
		}),

	// Get statistics
	getStatistics: protectedProcedure
		.route({
			method: "GET",
			path: "/thank-you-letter/statistics",
			tags: ["Thank You Letter"],
			summary: "Get thank you letter statistics",
		})
		.input(z.void())
		.output(
			z.object({
				totalLetters: z.number(),
				totalSent: z.number(),
				templateDistribution: z.record(z.string(), z.number()),
				methodDistribution: z.record(z.string(), z.number()),
				pendingFollowUps: z.number(),
			}),
		)
		.handler(async ({ context }) => {
			return await thankYouLetterService.getStatistics({ userId: context.user.id });
		}),
};
