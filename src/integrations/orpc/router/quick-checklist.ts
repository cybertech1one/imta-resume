import z from "zod";
import { protectedProcedure } from "../context";
import { quickChecklistService } from "../services/quick-checklist";

const quickChecklistDataSchema = z.object({
	checkedItems: z.array(z.string()),
	reminderDate: z.string().nullable(),
	reminderTime: z.string().nullable(),
	reminderCompany: z.string().nullable(),
	reminderNotificationScheduled: z.boolean(),
});

export const quickChecklistRouter = {
	// Get checklist state
	get: protectedProcedure
		.route({
			method: "GET",
			path: "/quick-checklist",
			tags: ["Quick Checklist"],
			summary: "Get quick checklist state",
		})
		.output(quickChecklistDataSchema)
		.handler(async ({ context }) => {
			return await quickChecklistService.get(context.user.id);
		}),

	// Toggle a checklist item
	toggleItem: protectedProcedure
		.route({
			method: "POST",
			path: "/quick-checklist/toggle",
			tags: ["Quick Checklist"],
			summary: "Toggle a checklist item",
		})
		.input(z.object({ itemId: z.string() }))
		.output(z.array(z.string()))
		.handler(async ({ context, input }) => {
			return await quickChecklistService.toggleItem(context.user.id, input.itemId);
		}),

	// Update checked items (bulk)
	updateCheckedItems: protectedProcedure
		.route({
			method: "PUT",
			path: "/quick-checklist/items",
			tags: ["Quick Checklist"],
			summary: "Update checked items",
		})
		.input(z.object({ checkedItems: z.array(z.string()) }))
		.output(z.void())
		.handler(async ({ context, input }) => {
			return await quickChecklistService.updateCheckedItems(context.user.id, input.checkedItems);
		}),

	// Reset checklist
	reset: protectedProcedure
		.route({
			method: "POST",
			path: "/quick-checklist/reset",
			tags: ["Quick Checklist"],
			summary: "Reset checklist",
		})
		.output(z.void())
		.handler(async ({ context }) => {
			return await quickChecklistService.resetChecklist(context.user.id);
		}),

	// Set reminder
	setReminder: protectedProcedure
		.route({
			method: "POST",
			path: "/quick-checklist/reminder",
			tags: ["Quick Checklist"],
			summary: "Set interview reminder",
		})
		.input(
			z.object({
				date: z.string(),
				time: z.string(),
				company: z.string().optional(),
				notificationScheduled: z.boolean().optional(),
			}),
		)
		.output(z.void())
		.handler(async ({ context, input }) => {
			return await quickChecklistService.setReminder({
				userId: context.user.id,
				date: input.date,
				time: input.time,
				company: input.company,
				notificationScheduled: input.notificationScheduled,
			});
		}),

	// Clear reminder
	clearReminder: protectedProcedure
		.route({
			method: "DELETE",
			path: "/quick-checklist/reminder",
			tags: ["Quick Checklist"],
			summary: "Clear interview reminder",
		})
		.output(z.void())
		.handler(async ({ context }) => {
			return await quickChecklistService.clearReminder(context.user.id);
		}),
};
