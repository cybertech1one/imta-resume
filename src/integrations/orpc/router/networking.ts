import { ORPCError } from "@orpc/server";
import z from "zod";
import { protectedProcedure } from "../context";
import { type ContactRelationship, networkingService, type RelationshipStrength } from "../services/networking";

const relationshipSchema = z.enum([
	"colleague",
	"mentor",
	"recruiter",
	"hiring_manager",
	"industry_peer",
	"alumni",
	"referral",
	"other",
]);

const strengthSchema = z.enum(["strong", "moderate", "weak", "dormant"]);

const contactSchema = z.object({
	id: z.string().uuid(),
	userId: z.string(),
	name: z.string(),
	email: z.string().nullable(),
	phone: z.string().nullable(),
	company: z.string().nullable(),
	position: z.string().nullable(),
	linkedinUrl: z.string().nullable(),
	relationship: relationshipSchema,
	relationshipStrength: z.string().nullable(),
	howMet: z.string().nullable(),
	notes: z.string().nullable(),
	tags: z.array(z.string()).nullable(),
	lastContactedAt: z.coerce.date().nullable(),
	nextFollowUpAt: z.coerce.date().nullable(),
	isFavorite: z.boolean().nullable(),
	createdAt: z.coerce.date(),
	updatedAt: z.coerce.date(),
});

const interactionSchema = z.object({
	id: z.string().uuid(),
	contactId: z.string(),
	interactionType: z.string(),
	description: z.string().nullable(),
	outcome: z.string().nullable(),
	followUpNeeded: z.boolean().nullable(),
	followUpDate: z.coerce.date().nullable(),
	interactedAt: z.coerce.date(),
	createdAt: z.coerce.date(),
});

const interactionsRouter = {
	add: protectedProcedure
		.route({
			method: "POST",
			path: "/networking/contacts/{contactId}/interactions",
			tags: ["Networking"],
			summary: "Add interaction to contact",
		})
		.input(
			z.object({
				contactId: z.string(),
				interactionType: z.string(),
				description: z.string().optional(),
				outcome: z.string().optional(),
				followUpNeeded: z.boolean().optional(),
				followUpDate: z.coerce.date().optional(),
				interactedAt: z.coerce.date().optional(),
			}),
		)
		.output(z.string())
		.handler(async ({ input, context }) => {
			// Verify contact belongs to the current user
			const contact = await networkingService.getById({ id: input.contactId, userId: context.user.id });
			if (!contact) {
				throw new ORPCError("NOT_FOUND", { message: "Contact not found" });
			}
			return await networkingService.interactions.add(input);
		}),

	list: protectedProcedure
		.route({
			method: "GET",
			path: "/networking/contacts/{contactId}/interactions",
			tags: ["Networking"],
			summary: "List interactions for contact",
		})
		.input(z.object({ contactId: z.string(), limit: z.number().optional() }))
		.output(z.array(interactionSchema))
		.handler(async ({ input, context }) => {
			// Verify contact belongs to the current user
			const contact = await networkingService.getById({ id: input.contactId, userId: context.user.id });
			if (!contact) {
				throw new ORPCError("NOT_FOUND", { message: "Contact not found" });
			}
			return await networkingService.interactions.list(input);
		}),

	delete: protectedProcedure
		.route({
			method: "DELETE",
			path: "/networking/contacts/{contactId}/interactions/{id}",
			tags: ["Networking"],
			summary: "Delete an interaction",
		})
		.input(z.object({ id: z.string().uuid(), contactId: z.string() }))
		.output(z.void())
		.handler(async ({ input, context }) => {
			// Verify contact belongs to the current user
			const contact = await networkingService.getById({ id: input.contactId, userId: context.user.id });
			if (!contact) {
				throw new ORPCError("NOT_FOUND", { message: "Contact not found" });
			}
			return await networkingService.interactions.delete(input);
		}),
};

export const networkingRouter = {
	interactions: interactionsRouter,

	create: protectedProcedure
		.route({
			method: "POST",
			path: "/networking/contacts",
			tags: ["Networking"],
			summary: "Create a new contact",
		})
		.input(
			z.object({
				name: z.string().min(1).max(255),
				email: z.string().email().optional().or(z.literal("")),
				phone: z.string().optional(),
				company: z.string().optional(),
				position: z.string().optional(),
				linkedinUrl: z.string().url().optional().or(z.literal("")),
				relationship: relationshipSchema.optional(),
				relationshipStrength: strengthSchema.optional(),
				howMet: z.string().optional(),
				notes: z.string().optional(),
				tags: z.array(z.string()).optional(),
				lastContactedAt: z.coerce.date().optional(),
				nextFollowUpAt: z.coerce.date().optional(),
				isFavorite: z.boolean().optional(),
			}),
		)
		.output(z.string())
		.handler(async ({ context, input }) => {
			return await networkingService.create({
				...input,
				userId: context.user.id,
				email: input.email || undefined,
				linkedinUrl: input.linkedinUrl || undefined,
				relationship: input.relationship as ContactRelationship | undefined,
				relationshipStrength: input.relationshipStrength as RelationshipStrength | undefined,
			});
		}),

	getById: protectedProcedure
		.route({
			method: "GET",
			path: "/networking/contacts/{id}",
			tags: ["Networking"],
			summary: "Get contact by ID",
		})
		.input(z.object({ id: z.string().uuid() }))
		.output(contactSchema.extend({ interactions: z.array(interactionSchema) }))
		.handler(async ({ context, input }) => {
			return await networkingService.getById({ id: input.id, userId: context.user.id });
		}),

	list: protectedProcedure
		.route({
			method: "GET",
			path: "/networking/contacts",
			tags: ["Networking"],
			summary: "List contacts",
		})
		.input(
			z
				.object({
					search: z.string().optional(),
					relationship: relationshipSchema.optional(),
					relationshipStrength: strengthSchema.optional(),
					company: z.string().optional(),
					tags: z.array(z.string()).optional(),
					favoritesOnly: z.boolean().optional(),
					needsFollowUp: z.boolean().optional(),
					limit: z.number().optional(),
					offset: z.number().optional(),
				})
				.optional()
				.default({}),
		)
		.output(z.array(contactSchema))
		.handler(async ({ context, input }) => {
			return await networkingService.list({
				userId: context.user.id,
				...input,
				relationship: input.relationship as ContactRelationship | undefined,
				relationshipStrength: input.relationshipStrength as RelationshipStrength | undefined,
			});
		}),

	update: protectedProcedure
		.route({
			method: "PUT",
			path: "/networking/contacts/{id}",
			tags: ["Networking"],
			summary: "Update a contact",
		})
		.input(
			z.object({
				id: z.string().uuid(),
				name: z.string().min(1).max(255).optional(),
				email: z.string().email().optional().or(z.literal("")),
				phone: z.string().optional(),
				company: z.string().optional(),
				position: z.string().optional(),
				linkedinUrl: z.string().url().optional().or(z.literal("")),
				relationship: relationshipSchema.optional(),
				relationshipStrength: strengthSchema.optional(),
				howMet: z.string().optional(),
				notes: z.string().optional(),
				tags: z.array(z.string()).optional(),
				lastContactedAt: z.coerce.date().optional(),
				nextFollowUpAt: z.coerce.date().optional(),
				isFavorite: z.boolean().optional(),
			}),
		)
		.output(z.void())
		.handler(async ({ context, input }) => {
			return await networkingService.update({
				...input,
				userId: context.user.id,
				email: input.email || undefined,
				linkedinUrl: input.linkedinUrl || undefined,
				relationship: input.relationship as ContactRelationship | undefined,
				relationshipStrength: input.relationshipStrength as RelationshipStrength | undefined,
			});
		}),

	toggleFavorite: protectedProcedure
		.route({
			method: "POST",
			path: "/networking/contacts/{id}/favorite",
			tags: ["Networking"],
			summary: "Toggle contact favorite status",
		})
		.input(z.object({ id: z.string().uuid() }))
		.output(z.boolean())
		.handler(async ({ context, input }) => {
			return await networkingService.toggleFavorite({ id: input.id, userId: context.user.id });
		}),

	delete: protectedProcedure
		.route({
			method: "DELETE",
			path: "/networking/contacts/{id}",
			tags: ["Networking"],
			summary: "Delete a contact",
		})
		.input(z.object({ id: z.string().uuid() }))
		.output(z.void())
		.handler(async ({ context, input }) => {
			return await networkingService.delete({ id: input.id, userId: context.user.id });
		}),

	getFollowUpReminders: protectedProcedure
		.route({
			method: "GET",
			path: "/networking/follow-ups",
			tags: ["Networking"],
			summary: "Get contacts needing follow-up",
		})
		.input(z.object({ daysAhead: z.number().optional() }).optional().default({}))
		.output(z.array(contactSchema))
		.handler(async ({ context, input }) => {
			return await networkingService.getFollowUpReminders({
				userId: context.user.id,
				daysAhead: input.daysAhead,
			});
		}),

	getDormantContacts: protectedProcedure
		.route({
			method: "GET",
			path: "/networking/dormant",
			tags: ["Networking"],
			summary: "Get dormant contacts",
		})
		.input(z.object({ daysSinceContact: z.number().optional() }).optional().default({}))
		.output(z.array(contactSchema))
		.handler(async ({ context, input }) => {
			return await networkingService.getDormantContacts({
				userId: context.user.id,
				daysSinceContact: input.daysSinceContact,
			});
		}),

	getStatistics: protectedProcedure
		.route({
			method: "GET",
			path: "/networking/statistics",
			tags: ["Networking"],
			summary: "Get networking statistics",
		})
		.output(
			z.object({
				total: z.number(),
				favorites: z.number(),
				byRelationship: z.record(z.string(), z.number()),
				byStrength: z.record(z.string(), z.number()),
				topCompanies: z.array(z.object({ company: z.string(), count: z.number() })),
				recentInteractions: z.number(),
				needsFollowUp: z.number(),
			}),
		)
		.handler(async ({ context }) => {
			return await networkingService.getStatistics({ userId: context.user.id });
		}),
};
