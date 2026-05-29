import z from "zod";
import { protectedProcedure } from "../context";
import { outfitChecklistService } from "../services/outfit-checklist";

export const outfitChecklistRouter = {
	// Get all checked items for the current user
	getCheckedItems: protectedProcedure
		.route({
			method: "GET",
			path: "/outfit-checklist",
			tags: ["Outfit Checklist"],
			summary: "Get all checked outfit checklist items",
		})
		.output(z.array(z.string()))
		.handler(async ({ context }) => {
			return await outfitChecklistService.getCheckedItems(context.user.id);
		}),

	// Toggle a single checklist item
	toggleItem: protectedProcedure
		.route({
			method: "POST",
			path: "/outfit-checklist/{itemId}/toggle",
			tags: ["Outfit Checklist"],
			summary: "Toggle a checklist item (check/uncheck)",
		})
		.input(z.object({ itemId: z.string() }))
		.output(z.boolean())
		.handler(async ({ context, input }) => {
			return await outfitChecklistService.toggleItem({
				userId: context.user.id,
				itemId: input.itemId,
			});
		}),

	// Set multiple items at once
	setItems: protectedProcedure
		.route({
			method: "PUT",
			path: "/outfit-checklist",
			tags: ["Outfit Checklist"],
			summary: "Set multiple checklist items at once",
		})
		.input(z.object({ itemIds: z.array(z.string()) }))
		.output(z.void())
		.handler(async ({ context, input }) => {
			return await outfitChecklistService.setItems({
				userId: context.user.id,
				itemIds: input.itemIds,
			});
		}),

	// Clear all checked items
	clearAll: protectedProcedure
		.route({
			method: "DELETE",
			path: "/outfit-checklist",
			tags: ["Outfit Checklist"],
			summary: "Clear all checked items",
		})
		.output(z.void())
		.handler(async ({ context }) => {
			return await outfitChecklistService.clearAll(context.user.id);
		}),
};
