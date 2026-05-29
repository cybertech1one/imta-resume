import { and, eq } from "drizzle-orm";
import { schema } from "@/integrations/drizzle";
import { db } from "@/integrations/drizzle/client";
import type { ShortcutCategory } from "@/integrations/drizzle/schema";
import { generateId } from "@/utils/string";

// Default keyboard shortcuts that will be used if user has no customizations
export const defaultShortcuts = [
	// Navigation shortcuts
	{
		id: "go_dashboard",
		category: "navigation" as const,
		keys: ["g", "d"],
		label: "Go to Dashboard",
		description: "Navigate to the main dashboard",
	},
	{
		id: "go_resumes",
		category: "navigation" as const,
		keys: ["g", "r"],
		label: "Go to Resumes",
		description: "Navigate to resumes list",
	},
	{
		id: "go_jobs",
		category: "navigation" as const,
		keys: ["g", "j"],
		label: "Go to Jobs",
		description: "Navigate to job applications",
	},
	{
		id: "go_interview",
		category: "navigation" as const,
		keys: ["g", "i"],
		label: "Go to Interview",
		description: "Navigate to interview prep",
	},
	{
		id: "go_career",
		category: "navigation" as const,
		keys: ["g", "c"],
		label: "Go to Career",
		description: "Navigate to career tools",
	},
	{
		id: "go_analytics",
		category: "navigation" as const,
		keys: ["g", "a"],
		label: "Go to Analytics",
		description: "Navigate to analytics",
	},
	{
		id: "go_settings",
		category: "navigation" as const,
		keys: ["g", "s"],
		label: "Go to Settings",
		description: "Navigate to settings",
	},
	{
		id: "go_help",
		category: "navigation" as const,
		keys: ["g", "h"],
		label: "Go to Help",
		description: "Navigate to help center",
	},

	// Action shortcuts
	{
		id: "new_resume",
		category: "actions" as const,
		keys: ["n", "r"],
		label: "New Resume",
		description: "Create a new resume",
	},
	{
		id: "new_job",
		category: "actions" as const,
		keys: ["n", "j"],
		label: "New Job Application",
		description: "Create a new job application",
	},
	{
		id: "new_cover_letter",
		category: "actions" as const,
		keys: ["n", "c"],
		label: "New Cover Letter",
		description: "Create a new cover letter",
	},

	// Editor shortcuts
	{ id: "save", category: "editor" as const, keys: ["mod", "s"], label: "Save", description: "Save current changes" },
	{ id: "undo", category: "editor" as const, keys: ["mod", "z"], label: "Undo", description: "Undo last action" },
	{
		id: "redo",
		category: "editor" as const,
		keys: ["mod", "shift", "z"],
		label: "Redo",
		description: "Redo last undone action",
	},
	{
		id: "duplicate",
		category: "editor" as const,
		keys: ["mod", "d"],
		label: "Duplicate",
		description: "Duplicate selected item",
	},
	{
		id: "delete",
		category: "editor" as const,
		keys: ["mod", "backspace"],
		label: "Delete",
		description: "Delete selected item",
	},

	// General shortcuts
	{
		id: "search",
		category: "general" as const,
		keys: ["mod", "k"],
		label: "Search / Command Palette",
		description: "Open command palette",
	},
	{
		id: "shortcuts_help",
		category: "general" as const,
		keys: ["?"],
		label: "Keyboard Shortcuts",
		description: "Show keyboard shortcuts guide",
	},
	{
		id: "shortcuts_help_alt",
		category: "general" as const,
		keys: ["mod", "/"],
		label: "Keyboard Shortcuts (Alt)",
		description: "Show keyboard shortcuts guide",
	},
	{
		id: "close_modal",
		category: "general" as const,
		keys: ["escape"],
		label: "Close Modal",
		description: "Close current modal or dialog",
	},
	{
		id: "toggle_sidebar",
		category: "general" as const,
		keys: ["mod", "b"],
		label: "Basculer la barre laterale",
		description: "Afficher ou masquer la barre laterale",
	},
] as const;

export type DefaultShortcut = (typeof defaultShortcuts)[number];

export type ShortcutWithEnabled = {
	id: string;
	category: ShortcutCategory;
	keys: string[];
	label: string;
	description: string;
	enabled: boolean;
	isCustomized: boolean;
};

export type GetShortcutsInput = {
	userId: string;
	category?: ShortcutCategory;
};

export type UpdateShortcutInput = {
	userId: string;
	shortcutId: string;
	keys?: string[];
	enabled?: boolean;
};

export type ResetShortcutsInput = {
	userId: string;
	category?: ShortcutCategory;
};

export const shortcutsService = {
	// Get all shortcuts for a user, merging defaults with customizations
	getAll: async (input: GetShortcutsInput): Promise<ShortcutWithEnabled[]> => {
		const { userId, category } = input;

		// Get user's custom shortcuts from database
		const conditions = [eq(schema.userKeyboardShortcut.userId, userId)];
		if (category) {
			conditions.push(eq(schema.userKeyboardShortcut.category, category));
		}

		const userShortcuts = await db
			.select()
			.from(schema.userKeyboardShortcut)
			.where(and(...conditions));

		// Create a map of user customizations
		const customizationMap = new Map(userShortcuts.map((s) => [s.shortcutId, { keys: s.keys, enabled: s.enabled }]));

		// Filter defaults by category if specified
		const filteredDefaults = category ? defaultShortcuts.filter((s) => s.category === category) : defaultShortcuts;

		// Merge defaults with user customizations
		return filteredDefaults.map((shortcut) => {
			const customization = customizationMap.get(shortcut.id);
			return {
				id: shortcut.id,
				category: shortcut.category,
				keys: customization?.keys ?? [...shortcut.keys],
				label: shortcut.label,
				description: shortcut.description,
				enabled: customization?.enabled ?? true,
				isCustomized: customization !== undefined,
			};
		});
	},

	// Get a single shortcut by ID
	getById: async (input: { userId: string; shortcutId: string }): Promise<ShortcutWithEnabled | null> => {
		const { userId, shortcutId } = input;

		// Find the default shortcut
		const defaultShortcut = defaultShortcuts.find((s) => s.id === shortcutId);
		if (!defaultShortcut) return null;

		// Check for user customization
		const [userShortcut] = await db
			.select()
			.from(schema.userKeyboardShortcut)
			.where(
				and(eq(schema.userKeyboardShortcut.userId, userId), eq(schema.userKeyboardShortcut.shortcutId, shortcutId)),
			)
			.limit(1);

		return {
			id: defaultShortcut.id,
			category: defaultShortcut.category,
			keys: userShortcut?.keys ?? [...defaultShortcut.keys],
			label: defaultShortcut.label,
			description: defaultShortcut.description,
			enabled: userShortcut?.enabled ?? true,
			isCustomized: userShortcut !== undefined,
		};
	},

	// Update a shortcut's keys or enabled state
	update: async (input: UpdateShortcutInput): Promise<ShortcutWithEnabled | null> => {
		const { userId, shortcutId, keys, enabled } = input;

		// Find the default shortcut
		const defaultShortcut = defaultShortcuts.find((s) => s.id === shortcutId);
		if (!defaultShortcut) return null;

		// Check if user already has a customization
		const [existingShortcut] = await db
			.select()
			.from(schema.userKeyboardShortcut)
			.where(
				and(eq(schema.userKeyboardShortcut.userId, userId), eq(schema.userKeyboardShortcut.shortcutId, shortcutId)),
			)
			.limit(1);

		if (existingShortcut) {
			// Update existing customization
			const updateData: Partial<{ keys: string[]; enabled: boolean }> = {};
			if (keys !== undefined) updateData.keys = keys;
			if (enabled !== undefined) updateData.enabled = enabled;

			await db
				.update(schema.userKeyboardShortcut)
				.set(updateData)
				.where(eq(schema.userKeyboardShortcut.id, existingShortcut.id));
		} else {
			// Create new customization
			await db.insert(schema.userKeyboardShortcut).values({
				id: generateId(),
				userId,
				shortcutId,
				category: defaultShortcut.category,
				keys: keys ?? [...defaultShortcut.keys],
				enabled: enabled ?? true,
			});
		}

		// Return the updated shortcut
		return shortcutsService.getById({ userId, shortcutId });
	},

	// Reset shortcuts to defaults (optionally by category)
	resetToDefaults: async (input: ResetShortcutsInput): Promise<void> => {
		const { userId, category } = input;

		if (category) {
			// Delete only shortcuts in the specified category
			const shortcutIds = defaultShortcuts.filter((s) => s.category === category).map((s) => s.id);

			for (const shortcutId of shortcutIds) {
				await db
					.delete(schema.userKeyboardShortcut)
					.where(
						and(eq(schema.userKeyboardShortcut.userId, userId), eq(schema.userKeyboardShortcut.shortcutId, shortcutId)),
					);
			}
		} else {
			// Delete all user shortcuts
			await db.delete(schema.userKeyboardShortcut).where(eq(schema.userKeyboardShortcut.userId, userId));
		}
	},
};
