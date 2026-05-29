import z from "zod";
import { protectedProcedure } from "../context";
import { type CertificationStatus, certificationsService } from "../services/certifications";

export const careerCertificationsEndpoints = {
	// Create a new certification
	create: protectedProcedure
		.route({
			method: "POST",
			path: "/career/certifications",
			tags: ["Certifications"],
			summary: "Create a new certification",
		})
		.input(
			z.object({
				name: z.string().min(1).max(255),
				issuer: z.string().min(1).max(255),
				category: z.string().optional(),
				status: z.enum(["planned", "in_progress", "completed", "expired"]).optional(),
				credentialId: z.string().optional(),
				credentialUrl: z.string().url().optional().or(z.literal("")),
				issueDate: z.coerce.date().optional(),
				expiryDate: z.coerce.date().optional(),
				cost: z.number().min(0).optional(),
				currency: z.string().optional(),
				notes: z.string().optional(),
				reminderDays: z.number().min(0).optional(),
			}),
		)
		.output(z.string())
		.handler(async ({ context, input }) => {
			return await certificationsService.create({
				...input,
				userId: context.user.id,
				status: input.status as CertificationStatus | undefined,
			});
		}),

	// Get certification by ID
	getById: protectedProcedure
		.route({
			method: "GET",
			path: "/career/certifications/{id}",
			tags: ["Certifications"],
			summary: "Get certification by ID",
		})
		.input(z.object({ id: z.string().uuid() }))
		.output(
			z.object({
				id: z.string().uuid(),
				userId: z.string(),
				name: z.string(),
				issuer: z.string(),
				category: z.string().nullable(),
				status: z.enum(["planned", "in_progress", "completed", "expired"]),
				credentialId: z.string().nullable(),
				credentialUrl: z.string().nullable(),
				issueDate: z.coerce.date().nullable(),
				expiryDate: z.coerce.date().nullable(),
				cost: z.number().nullable(),
				currency: z.string().nullable(),
				notes: z.string().nullable(),
				reminderDays: z.number().nullable(),
				createdAt: z.coerce.date(),
				updatedAt: z.coerce.date(),
			}),
		)
		.handler(async ({ context, input }) => {
			return await certificationsService.getById({ id: input.id, userId: context.user.id });
		}),

	// List certifications
	list: protectedProcedure
		.route({
			method: "GET",
			path: "/career/certifications",
			tags: ["Certifications"],
			summary: "List certifications",
		})
		.input(
			z
				.object({
					status: z.enum(["planned", "in_progress", "completed", "expired"]).optional(),
					category: z.string().optional(),
				})
				.optional()
				.default({}),
		)
		.output(
			z.array(
				z.object({
					id: z.string().uuid(),
					userId: z.string(),
					name: z.string(),
					issuer: z.string(),
					category: z.string().nullable(),
					status: z.enum(["planned", "in_progress", "completed", "expired"]),
					credentialId: z.string().nullable(),
					credentialUrl: z.string().nullable(),
					issueDate: z.coerce.date().nullable(),
					expiryDate: z.coerce.date().nullable(),
					cost: z.number().nullable(),
					currency: z.string().nullable(),
					notes: z.string().nullable(),
					reminderDays: z.number().nullable(),
					createdAt: z.coerce.date(),
					updatedAt: z.coerce.date(),
				}),
			),
		)
		.handler(async ({ context, input }) => {
			return await certificationsService.list({
				userId: context.user.id,
				status: input.status as CertificationStatus | undefined,
				category: input.category,
			});
		}),

	// Update certification
	update: protectedProcedure
		.route({
			method: "PUT",
			path: "/career/certifications/{id}",
			tags: ["Certifications"],
			summary: "Update a certification",
		})
		.input(
			z.object({
				id: z.string().uuid(),
				name: z.string().min(1).max(255).optional(),
				issuer: z.string().min(1).max(255).optional(),
				category: z.string().optional(),
				status: z.enum(["planned", "in_progress", "completed", "expired"]).optional(),
				credentialId: z.string().optional(),
				credentialUrl: z.string().url().optional().or(z.literal("")),
				issueDate: z.coerce.date().optional(),
				expiryDate: z.coerce.date().optional(),
				cost: z.number().min(0).optional(),
				currency: z.string().optional(),
				notes: z.string().optional(),
				reminderDays: z.number().min(0).optional(),
			}),
		)
		.output(z.void())
		.handler(async ({ context, input }) => {
			return await certificationsService.update({
				...input,
				userId: context.user.id,
				status: input.status as CertificationStatus | undefined,
			});
		}),

	// Delete certification
	delete: protectedProcedure
		.route({
			method: "DELETE",
			path: "/career/certifications/{id}",
			tags: ["Certifications"],
			summary: "Delete a certification",
		})
		.input(z.object({ id: z.string().uuid() }))
		.output(z.void())
		.handler(async ({ context, input }) => {
			return await certificationsService.delete({ id: input.id, userId: context.user.id });
		}),

	// Get expiring soon
	getExpiringSoon: protectedProcedure
		.route({
			method: "GET",
			path: "/career/certifications/expiring-soon",
			tags: ["Certifications"],
			summary: "Get certifications expiring soon",
		})
		.input(
			z
				.object({ days: z.number().min(1).max(365).optional() })
				.optional()
				.default({}),
		)
		.output(
			z.array(
				z.object({
					id: z.string().uuid(),
					userId: z.string(),
					name: z.string(),
					issuer: z.string(),
					category: z.string().nullable(),
					status: z.enum(["planned", "in_progress", "completed", "expired"]),
					credentialId: z.string().nullable(),
					credentialUrl: z.string().nullable(),
					issueDate: z.coerce.date().nullable(),
					expiryDate: z.coerce.date().nullable(),
					cost: z.number().nullable(),
					currency: z.string().nullable(),
					notes: z.string().nullable(),
					reminderDays: z.number().nullable(),
					createdAt: z.coerce.date(),
					updatedAt: z.coerce.date(),
				}),
			),
		)
		.handler(async ({ context, input }) => {
			return await certificationsService.getExpiringSoon({
				userId: context.user.id,
				days: input.days,
			});
		}),

	// Get statistics
	getStatistics: protectedProcedure
		.route({
			method: "GET",
			path: "/career/certifications/statistics",
			tags: ["Certifications"],
			summary: "Get certification statistics",
		})
		.output(
			z.object({
				total: z.number(),
				byStatus: z.record(z.string(), z.number()),
				byCategory: z.record(z.string(), z.number()),
				totalCost: z.number(),
				expiringSoon: z.number(),
				active: z.number(),
				inProgress: z.number(),
				planned: z.number(),
				expired: z.number(),
			}),
		)
		.handler(async ({ context }) => {
			return await certificationsService.getStatistics({ userId: context.user.id });
		}),
};
