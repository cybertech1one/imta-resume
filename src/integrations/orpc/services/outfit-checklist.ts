import { and, eq } from "drizzle-orm";
import { schema } from "@/integrations/drizzle";
import { db } from "@/integrations/drizzle/client";
import { generateId } from "@/utils/string";

export const outfitChecklistService = {
	// Get all checked items for a user
	getCheckedItems: async (userId: string): Promise<string[]> => {
		const items = await db
			.select({ itemId: schema.outfitChecklistItem.itemId })
			.from(schema.outfitChecklistItem)
			.where(and(eq(schema.outfitChecklistItem.userId, userId), eq(schema.outfitChecklistItem.isChecked, true)));

		return items.map((item) => item.itemId);
	},

	// Toggle a checklist item (check/uncheck)
	toggleItem: async (input: { userId: string; itemId: string }): Promise<boolean> => {
		const { userId, itemId } = input;

		// Check if item exists
		const [existing] = await db
			.select()
			.from(schema.outfitChecklistItem)
			.where(and(eq(schema.outfitChecklistItem.userId, userId), eq(schema.outfitChecklistItem.itemId, itemId)));

		if (existing) {
			// Toggle the existing item
			const newChecked = !existing.isChecked;
			await db
				.update(schema.outfitChecklistItem)
				.set({ isChecked: newChecked })
				.where(and(eq(schema.outfitChecklistItem.userId, userId), eq(schema.outfitChecklistItem.itemId, itemId)));
			return newChecked;
		}

		// Create new checked item
		await db.insert(schema.outfitChecklistItem).values({
			id: generateId(),
			userId,
			itemId,
			isChecked: true,
		});
		return true;
	},

	// Set multiple items at once (for bulk operations)
	setItems: async (input: { userId: string; itemIds: string[] }): Promise<void> => {
		const { userId, itemIds } = input;

		// First, uncheck all items for this user
		await db
			.update(schema.outfitChecklistItem)
			.set({ isChecked: false })
			.where(eq(schema.outfitChecklistItem.userId, userId));

		// Then, upsert all the checked items
		for (const itemId of itemIds) {
			await db
				.insert(schema.outfitChecklistItem)
				.values({
					id: generateId(),
					userId,
					itemId,
					isChecked: true,
				})
				.onConflictDoUpdate({
					target: [schema.outfitChecklistItem.userId, schema.outfitChecklistItem.itemId],
					set: { isChecked: true },
				});
		}
	},

	// Clear all checked items for a user
	clearAll: async (userId: string): Promise<void> => {
		await db.delete(schema.outfitChecklistItem).where(eq(schema.outfitChecklistItem.userId, userId));
	},
};
