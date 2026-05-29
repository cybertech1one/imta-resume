import { eq } from "drizzle-orm";
import { schema } from "@/integrations/drizzle";
import { db } from "@/integrations/drizzle/client";
import { generateId } from "@/utils/string";

export type QuickChecklistData = {
	checkedItems: string[];
	reminderDate: string | null;
	reminderTime: string | null;
	reminderCompany: string | null;
	reminderNotificationScheduled: boolean;
};

export type SetReminderInput = {
	userId: string;
	date: string;
	time: string;
	company?: string;
	notificationScheduled?: boolean;
};

export const quickChecklistService = {
	// Get checklist state (or create default if doesn't exist)
	get: async (userId: string): Promise<QuickChecklistData> => {
		const [existing] = await db
			.select()
			.from(schema.quickInterviewChecklist)
			.where(eq(schema.quickInterviewChecklist.userId, userId));

		if (existing) {
			return {
				checkedItems: existing.checkedItems,
				reminderDate: existing.reminderDate,
				reminderTime: existing.reminderTime,
				reminderCompany: existing.reminderCompany,
				reminderNotificationScheduled: existing.reminderNotificationScheduled,
			};
		}

		// Create default entry
		await db.insert(schema.quickInterviewChecklist).values({
			id: generateId(),
			userId,
			checkedItems: [],
		});

		return {
			checkedItems: [],
			reminderDate: null,
			reminderTime: null,
			reminderCompany: null,
			reminderNotificationScheduled: false,
		};
	},

	// Toggle a checklist item
	toggleItem: async (userId: string, itemId: string): Promise<string[]> => {
		const current = await quickChecklistService.get(userId);
		const checkedItems = current.checkedItems.includes(itemId)
			? current.checkedItems.filter((id) => id !== itemId)
			: [...current.checkedItems, itemId];

		await db
			.update(schema.quickInterviewChecklist)
			.set({ checkedItems })
			.where(eq(schema.quickInterviewChecklist.userId, userId));

		return checkedItems;
	},

	// Update checked items (bulk update)
	updateCheckedItems: async (userId: string, checkedItems: string[]): Promise<void> => {
		// Ensure record exists
		await quickChecklistService.get(userId);

		await db
			.update(schema.quickInterviewChecklist)
			.set({ checkedItems })
			.where(eq(schema.quickInterviewChecklist.userId, userId));
	},

	// Reset all checked items
	resetChecklist: async (userId: string): Promise<void> => {
		// Ensure record exists
		await quickChecklistService.get(userId);

		await db
			.update(schema.quickInterviewChecklist)
			.set({ checkedItems: [] })
			.where(eq(schema.quickInterviewChecklist.userId, userId));
	},

	// Set interview reminder
	setReminder: async (input: SetReminderInput): Promise<void> => {
		// Ensure record exists
		await quickChecklistService.get(input.userId);

		await db
			.update(schema.quickInterviewChecklist)
			.set({
				reminderDate: input.date,
				reminderTime: input.time,
				reminderCompany: input.company ?? null,
				reminderNotificationScheduled: input.notificationScheduled ?? false,
			})
			.where(eq(schema.quickInterviewChecklist.userId, input.userId));
	},

	// Clear interview reminder
	clearReminder: async (userId: string): Promise<void> => {
		// Ensure record exists
		await quickChecklistService.get(userId);

		await db
			.update(schema.quickInterviewChecklist)
			.set({
				reminderDate: null,
				reminderTime: null,
				reminderCompany: null,
				reminderNotificationScheduled: false,
			})
			.where(eq(schema.quickInterviewChecklist.userId, userId));
	},
};
