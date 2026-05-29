import z from "zod";
import { protectedProcedure, publicProcedure } from "../context";
import { qrCodeService } from "../services/qr-code";

const qrSizeSchema = z.enum(["small", "medium", "large"]);
const qrStyleSchema = z.enum(["square", "rounded", "dots"]);

const qrCodeSchema = z.object({
	id: z.string().uuid(),
	userId: z.string(),
	name: z.string(),
	url: z.string(),
	foregroundColor: z.string(),
	backgroundColor: z.string(),
	size: qrSizeSchema,
	style: qrStyleSchema,
	createdAt: z.coerce.date(),
	updatedAt: z.coerce.date(),
	scans: z.number(),
});

export const qrCodeRouter = {
	create: protectedProcedure
		.route({
			method: "POST",
			path: "/qr-code",
			tags: ["QR Code"],
			summary: "Create a new QR code",
		})
		.input(
			z.object({
				name: z.string().min(1).max(255),
				url: z.string().url(),
				foregroundColor: z.string().optional(),
				backgroundColor: z.string().optional(),
				size: qrSizeSchema.optional(),
				style: qrStyleSchema.optional(),
			}),
		)
		.output(z.string())
		.handler(async ({ context, input }) => {
			return await qrCodeService.create({
				...input,
				userId: context.user.id,
			});
		}),

	getById: protectedProcedure
		.route({
			method: "GET",
			path: "/qr-code/{id}",
			tags: ["QR Code"],
			summary: "Get QR code by ID",
		})
		.input(z.object({ id: z.string().uuid() }))
		.output(qrCodeSchema)
		.handler(async ({ context, input }) => {
			return await qrCodeService.getById({ id: input.id, userId: context.user.id });
		}),

	list: protectedProcedure
		.route({
			method: "GET",
			path: "/qr-code",
			tags: ["QR Code"],
			summary: "List all QR codes",
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
		.output(z.array(qrCodeSchema))
		.handler(async ({ context, input }) => {
			return await qrCodeService.list({
				userId: context.user.id,
				...input,
			});
		}),

	update: protectedProcedure
		.route({
			method: "PUT",
			path: "/qr-code/{id}",
			tags: ["QR Code"],
			summary: "Update a QR code",
		})
		.input(
			z.object({
				id: z.string().uuid(),
				name: z.string().min(1).max(255).optional(),
				url: z.string().url().optional(),
				foregroundColor: z.string().optional(),
				backgroundColor: z.string().optional(),
				size: qrSizeSchema.optional(),
				style: qrStyleSchema.optional(),
			}),
		)
		.output(z.void())
		.handler(async ({ context, input }) => {
			return await qrCodeService.update({
				...input,
				userId: context.user.id,
			});
		}),

	delete: protectedProcedure
		.route({
			method: "DELETE",
			path: "/qr-code/{id}",
			tags: ["QR Code"],
			summary: "Delete a QR code",
		})
		.input(z.object({ id: z.string().uuid() }))
		.output(z.void())
		.handler(async ({ context, input }) => {
			return await qrCodeService.delete({ id: input.id, userId: context.user.id });
		}),

	// Public endpoint to record a scan (called when QR code is scanned)
	recordScan: publicProcedure
		.route({
			method: "POST",
			path: "/qr-code/{qrCodeId}/scan",
			tags: ["QR Code"],
			summary: "Record a QR code scan",
		})
		.input(
			z.object({
				qrCodeId: z.string(),
				device: z.string().optional(),
				location: z.string().optional(),
				source: z.string().optional(),
				ipAddress: z.string().optional(),
				userAgent: z.string().optional(),
			}),
		)
		.output(z.void())
		.handler(async ({ input }) => {
			return await qrCodeService.recordScan(input);
		}),

	// Get statistics for user's QR codes
	getStatistics: protectedProcedure
		.route({
			method: "GET",
			path: "/qr-code/statistics",
			tags: ["QR Code"],
			summary: "Get QR code scan statistics",
		})
		.input(
			z
				.object({
					qrCodeId: z.string().optional(),
					days: z.number().optional(),
				})
				.optional()
				.default({}),
		)
		.output(
			z.object({
				scansByDate: z.array(
					z.object({
						date: z.string(),
						scans: z.number(),
					}),
				),
				scansByDevice: z.array(
					z.object({
						device: z.string(),
						count: z.number(),
						percentage: z.number(),
					}),
				),
				scansByLocation: z.array(
					z.object({
						location: z.string(),
						count: z.number(),
						percentage: z.number(),
					}),
				),
				totalScans: z.number(),
			}),
		)
		.handler(async ({ context, input }) => {
			return await qrCodeService.getStatistics({
				userId: context.user.id,
				...input,
			});
		}),
};
