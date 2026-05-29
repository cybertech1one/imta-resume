import { ORPCError } from "@orpc/client";
import { and, desc, eq } from "drizzle-orm";
import { schema } from "@/integrations/drizzle";
import { db } from "@/integrations/drizzle/client";
import { generateId } from "@/utils/string";

export type NotificationType = "tip" | "reminder" | "milestone" | "announcement";

export type CreateNotificationInput = {
	userId: string;
	type: NotificationType;
	title: string;
	description: string;
	link?: string;
	metadata?: Record<string, unknown>;
};

export type UpdateNotificationInput = {
	id: string;
	userId: string;
	read?: boolean;
	dismissed?: boolean;
};

export type NotificationPreferences = {
	tips: boolean;
	reminders: boolean;
	milestones: boolean;
	announcements: boolean;
};

export type UpdatePreferencesInput = {
	userId: string;
	tips?: boolean;
	reminders?: boolean;
	milestones?: boolean;
	announcements?: boolean;
};

export const notificationService = {
	// Create a new notification
	create: async (input: CreateNotificationInput): Promise<string> => {
		const id = generateId();

		await db.insert(schema.notification).values({
			id,
			userId: input.userId,
			type: input.type,
			title: input.title,
			description: input.description,
			link: input.link,
			metadata: input.metadata,
			read: false,
			dismissed: false,
		});

		return id;
	},

	// Get notification by ID
	getById: async (input: { id: string; userId: string }) => {
		const [notification] = await db
			.select()
			.from(schema.notification)
			.where(and(eq(schema.notification.id, input.id), eq(schema.notification.userId, input.userId)));

		if (!notification) {
			throw new ORPCError("NOT_FOUND", { message: "Notification not found" });
		}

		return notification;
	},

	// List all notifications for a user
	list: async (input: {
		userId: string;
		type?: NotificationType;
		read?: boolean;
		dismissed?: boolean;
		limit?: number;
		offset?: number;
	}) => {
		const conditions = [eq(schema.notification.userId, input.userId)];

		if (input.type) {
			conditions.push(eq(schema.notification.type, input.type));
		}

		if (input.read !== undefined) {
			conditions.push(eq(schema.notification.read, input.read));
		}

		if (input.dismissed !== undefined) {
			conditions.push(eq(schema.notification.dismissed, input.dismissed));
		}

		return await db
			.select()
			.from(schema.notification)
			.where(and(...conditions))
			.orderBy(desc(schema.notification.createdAt))
			.limit(input.limit ?? 100)
			.offset(input.offset ?? 0);
	},

	// Update notification (mark as read/dismissed)
	update: async (input: UpdateNotificationInput): Promise<void> => {
		const [existing] = await db
			.select({ id: schema.notification.id })
			.from(schema.notification)
			.where(and(eq(schema.notification.id, input.id), eq(schema.notification.userId, input.userId)));

		if (!existing) {
			throw new ORPCError("NOT_FOUND", { message: "Notification not found" });
		}

		const updateData: { read?: boolean; dismissed?: boolean } = {};
		if (input.read !== undefined) {
			updateData.read = input.read;
		}
		if (input.dismissed !== undefined) {
			updateData.dismissed = input.dismissed;
		}

		if (Object.keys(updateData).length > 0) {
			await db
				.update(schema.notification)
				.set(updateData)
				.where(and(eq(schema.notification.id, input.id), eq(schema.notification.userId, input.userId)));
		}
	},

	// Mark all as read
	markAllAsRead: async (input: { userId: string }): Promise<void> => {
		await db
			.update(schema.notification)
			.set({ read: true })
			.where(and(eq(schema.notification.userId, input.userId), eq(schema.notification.read, false)));
	},

	// Delete notification
	delete: async (input: { id: string; userId: string }): Promise<void> => {
		await db
			.delete(schema.notification)
			.where(and(eq(schema.notification.id, input.id), eq(schema.notification.userId, input.userId)));
	},

	// Delete all dismissed notifications older than 7 days
	cleanup: async (input: { userId: string }): Promise<void> => {
		const sevenDaysAgo = new Date();
		sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

		await db.delete(schema.notification).where(
			and(
				eq(schema.notification.userId, input.userId),
				eq(schema.notification.dismissed, true),
				// Note: Add date comparison if needed
			),
		);
	},

	// Get unread count
	getUnreadCount: async (input: { userId: string }): Promise<number> => {
		try {
			const result = await db
				.select({ id: schema.notification.id })
				.from(schema.notification)
				.where(and(eq(schema.notification.userId, input.userId), eq(schema.notification.read, false)));

			return result.length;
		} catch {
			// Return 0 rather than propagating a DB error as a 500 to the client.
			// This keeps the badge hidden gracefully on transient failures.
			return 0;
		}
	},

	// Preferences operations
	preferences: {
		// Get user preferences (create default if not exists)
		get: async (input: { userId: string }): Promise<NotificationPreferences> => {
			const [prefs] = await db
				.select()
				.from(schema.notificationPreference)
				.where(eq(schema.notificationPreference.userId, input.userId));

			if (!prefs) {
				// Create default preferences
				const id = generateId();
				await db.insert(schema.notificationPreference).values({
					id,
					userId: input.userId,
					tips: true,
					reminders: true,
					milestones: true,
					announcements: true,
				});

				return {
					tips: true,
					reminders: true,
					milestones: true,
					announcements: true,
				};
			}

			return {
				tips: prefs.tips,
				reminders: prefs.reminders,
				milestones: prefs.milestones,
				announcements: prefs.announcements,
			};
		},

		// Update preferences
		update: async (input: UpdatePreferencesInput): Promise<void> => {
			const [existing] = await db
				.select({ id: schema.notificationPreference.id })
				.from(schema.notificationPreference)
				.where(eq(schema.notificationPreference.userId, input.userId));

			if (!existing) {
				// Create with provided values
				const id = generateId();
				await db.insert(schema.notificationPreference).values({
					id,
					userId: input.userId,
					tips: input.tips ?? true,
					reminders: input.reminders ?? true,
					milestones: input.milestones ?? true,
					announcements: input.announcements ?? true,
				});
			} else {
				// Update existing
				const updateData: Partial<NotificationPreferences> = {};
				if (input.tips !== undefined) updateData.tips = input.tips;
				if (input.reminders !== undefined) updateData.reminders = input.reminders;
				if (input.milestones !== undefined) updateData.milestones = input.milestones;
				if (input.announcements !== undefined) updateData.announcements = input.announcements;

				if (Object.keys(updateData).length > 0) {
					await db
						.update(schema.notificationPreference)
						.set(updateData)
						.where(eq(schema.notificationPreference.userId, input.userId));
				}
			}
		},
	},
};
