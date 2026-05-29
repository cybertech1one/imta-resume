import z from "zod";
import type { ShortcutCategory } from "@/integrations/drizzle/schema";
import { protectedProcedure } from "../context";
import { defaultShortcuts, type ShortcutWithEnabled, shortcutsService } from "../services/shortcuts";

const shortcutCategorySchema = z.enum(["navigation", "actions", "editor", "general"]);

const shortcutSchema = z.object({
	id: z.string(),
	category: shortcutCategorySchema,
	keys: z.array(z.string()),
	label: z.string(),
	description: z.string(),
	enabled: z.boolean(),
	isCustomized: z.boolean(),
});

export const shortcutsRouter = {
	// Get all shortcuts for the current user
	getAll: protectedProcedure
		.route({
			method: "GET",
			path: "/shortcuts",
			tags: ["Shortcuts"],
			summary: "Get all keyboard shortcuts",
		})
		.input(
			z
				.object({
					category: shortcutCategorySchema.optional(),
				})
				.optional()
				.default({}),
		)
		.output(z.array(shortcutSchema))
		.handler(async ({ context, input }): Promise<ShortcutWithEnabled[]> => {
			return await shortcutsService.getAll({
				userId: context.user.id,
				category: input.category as ShortcutCategory | undefined,
			});
		}),

	// Get a single shortcut by ID
	getById: protectedProcedure
		.route({
			method: "GET",
			path: "/shortcuts/{shortcutId}",
			tags: ["Shortcuts"],
			summary: "Get a keyboard shortcut by ID",
		})
		.input(z.object({ shortcutId: z.string() }))
		.output(shortcutSchema.nullable())
		.handler(async ({ context, input }) => {
			return await shortcutsService.getById({
				userId: context.user.id,
				shortcutId: input.shortcutId,
			});
		}),

	// Get default shortcuts (no auth required for reference)
	getDefaults: protectedProcedure
		.route({
			method: "GET",
			path: "/shortcuts/defaults",
			tags: ["Shortcuts"],
			summary: "Get default keyboard shortcuts",
		})
		.input(
			z
				.object({
					category: shortcutCategorySchema.optional(),
				})
				.optional()
				.default({}),
		)
		.output(
			z.array(
				z.object({
					id: z.string(),
					category: shortcutCategorySchema,
					keys: z.array(z.string()),
					label: z.string(),
					description: z.string(),
				}),
			),
		)
		.handler(async ({ input }) => {
			const filtered = input.category
				? defaultShortcuts.filter((s) => s.category === input.category)
				: defaultShortcuts;

			return filtered.map((s) => ({
				id: s.id,
				category: s.category,
				keys: [...s.keys],
				label: s.label,
				description: s.description,
			}));
		}),

	// Update a shortcut
	update: protectedProcedure
		.route({
			method: "PUT",
			path: "/shortcuts/{shortcutId}",
			tags: ["Shortcuts"],
			summary: "Update a keyboard shortcut",
		})
		.input(
			z.object({
				shortcutId: z.string(),
				keys: z.array(z.string()).min(1).max(4).optional(),
				enabled: z.boolean().optional(),
			}),
		)
		.output(shortcutSchema.nullable())
		.handler(async ({ context, input }) => {
			return await shortcutsService.update({
				userId: context.user.id,
				shortcutId: input.shortcutId,
				keys: input.keys,
				enabled: input.enabled,
			});
		}),

	// Toggle a shortcut enabled/disabled
	toggle: protectedProcedure
		.route({
			method: "POST",
			path: "/shortcuts/{shortcutId}/toggle",
			tags: ["Shortcuts"],
			summary: "Toggle a keyboard shortcut on/off",
		})
		.input(z.object({ shortcutId: z.string() }))
		.output(shortcutSchema.nullable())
		.handler(async ({ context, input }) => {
			// First get the current state
			const current = await shortcutsService.getById({
				userId: context.user.id,
				shortcutId: input.shortcutId,
			});

			if (!current) return null;

			// Toggle the enabled state
			return await shortcutsService.update({
				userId: context.user.id,
				shortcutId: input.shortcutId,
				enabled: !current.enabled,
			});
		}),

	// Reset shortcuts to defaults
	resetToDefaults: protectedProcedure
		.route({
			method: "POST",
			path: "/shortcuts/reset",
			tags: ["Shortcuts"],
			summary: "Reset keyboard shortcuts to defaults",
		})
		.input(
			z
				.object({
					category: shortcutCategorySchema.optional(),
				})
				.optional()
				.default({}),
		)
		.output(z.object({ success: z.boolean() }))
		.handler(async ({ context, input }) => {
			await shortcutsService.resetToDefaults({
				userId: context.user.id,
				category: input.category as ShortcutCategory | undefined,
			});
			return { success: true };
		}),
};
