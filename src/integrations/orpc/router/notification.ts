import z from "zod";
import { protectedProcedure } from "../context";
import { type NotificationType, notificationService } from "../services/notification";

const notificationTypeSchema = z.enum(["tip", "reminder", "milestone", "announcement"]);

const notificationSchema = z.object({
	id: z.string().uuid(),
	userId: z.string(),
	type: notificationTypeSchema,
	title: z.string(),
	description: z.string(),
	link: z.string().nullable(),
	metadata: z.record(z.string(), z.unknown()).nullable(),
	read: z.boolean(),
	dismissed: z.boolean(),
	createdAt: z.coerce.date(),
	updatedAt: z.coerce.date(),
});

const notificationPreferencesSchema = z.object({
	tips: z.boolean(),
	reminders: z.boolean(),
	milestones: z.boolean(),
	announcements: z.boolean(),
});

export const notificationRouter = {
	create: protectedProcedure
		.route({
			method: "POST",
			path: "/notifications",
			tags: ["Notifications"],
			summary: "Create a new notification",
		})
		.input(
			z.object({
				type: notificationTypeSchema,
				title: z.string().min(1).max(255),
				description: z.string().min(1),
				link: z.string().optional(),
				metadata: z.record(z.string(), z.unknown()).optional(),
			}),
		)
		.output(z.string())
		.handler(async ({ context, input }) => {
			return await notificationService.create({
				...input,
				userId: context.user.id,
			});
		}),

	getById: protectedProcedure
		.route({
			method: "GET",
			path: "/notifications/{id}",
			tags: ["Notifications"],
			summary: "Get notification by ID",
		})
		.input(z.object({ id: z.string().uuid() }))
		.output(notificationSchema)
		.handler(async ({ context, input }) => {
			return await notificationService.getById({ id: input.id, userId: context.user.id });
		}),

	list: protectedProcedure
		.route({
			method: "GET",
			path: "/notifications",
			tags: ["Notifications"],
			summary: "List all notifications",
		})
		.input(
			z
				.object({
					type: notificationTypeSchema.optional(),
					read: z.boolean().optional(),
					dismissed: z.boolean().optional(),
					limit: z.number().optional(),
					offset: z.number().optional(),
				})
				.optional()
				.default({}),
		)
		.output(z.array(notificationSchema))
		.handler(async ({ context, input }) => {
			return await notificationService.list({
				userId: context.user.id,
				type: input.type as NotificationType | undefined,
				read: input.read,
				dismissed: input.dismissed,
				limit: input.limit,
				offset: input.offset,
			});
		}),

	update: protectedProcedure
		.route({
			method: "PUT",
			path: "/notifications/{id}",
			tags: ["Notifications"],
			summary: "Update a notification",
		})
		.input(
			z.object({
				id: z.string().uuid(),
				read: z.boolean().optional(),
				dismissed: z.boolean().optional(),
			}),
		)
		.output(z.void())
		.handler(async ({ context, input }) => {
			return await notificationService.update({
				...input,
				userId: context.user.id,
			});
		}),

	markAllAsRead: protectedProcedure
		.route({
			method: "POST",
			path: "/notifications/mark-all-read",
			tags: ["Notifications"],
			summary: "Mark all notifications as read",
		})
		.output(z.void())
		.handler(async ({ context }) => {
			return await notificationService.markAllAsRead({ userId: context.user.id });
		}),

	delete: protectedProcedure
		.route({
			method: "DELETE",
			path: "/notifications/{id}",
			tags: ["Notifications"],
			summary: "Delete a notification",
		})
		.input(z.object({ id: z.string().uuid() }))
		.output(z.void())
		.handler(async ({ context, input }) => {
			return await notificationService.delete({ id: input.id, userId: context.user.id });
		}),

	cleanup: protectedProcedure
		.route({
			method: "POST",
			path: "/notifications/cleanup",
			tags: ["Notifications"],
			summary: "Delete old dismissed notifications",
		})
		.output(z.void())
		.handler(async ({ context }) => {
			return await notificationService.cleanup({ userId: context.user.id });
		}),

	getUnreadCount: protectedProcedure
		.route({
			method: "GET",
			path: "/notifications/unread-count",
			tags: ["Notifications"],
			summary: "Get unread notification count",
		})
		.output(z.number())
		.handler(async ({ context }) => {
			return await notificationService.getUnreadCount({ userId: context.user.id });
		}),

	preferences: {
		get: protectedProcedure
			.route({
				method: "GET",
				path: "/notifications/preferences",
				tags: ["Notifications"],
				summary: "Get notification preferences",
			})
			.output(notificationPreferencesSchema)
			.handler(async ({ context }) => {
				return await notificationService.preferences.get({ userId: context.user.id });
			}),

		update: protectedProcedure
			.route({
				method: "PUT",
				path: "/notifications/preferences",
				tags: ["Notifications"],
				summary: "Update notification preferences",
			})
			.input(
				z.object({
					tips: z.boolean().optional(),
					reminders: z.boolean().optional(),
					milestones: z.boolean().optional(),
					announcements: z.boolean().optional(),
				}),
			)
			.output(z.void())
			.handler(async ({ context, input }) => {
				return await notificationService.preferences.update({
					userId: context.user.id,
					...input,
				});
			}),
	},
};
