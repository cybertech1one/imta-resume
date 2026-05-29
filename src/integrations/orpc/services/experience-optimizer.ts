import { ORPCError } from "@orpc/client";
import { and, desc, eq } from "drizzle-orm";
import { schema } from "@/integrations/drizzle";
import { db } from "@/integrations/drizzle/client";
import type { ExperienceIndustry, ExperienceVerbCategory } from "@/integrations/drizzle/schema";
import { generateId } from "@/utils/string";

// =============================================================================
// TYPES
// =============================================================================

export type CreateBeforeAfterExampleInput = {
	userId: string;
	before: string;
	after: string;
	improvement: string;
	category: ExperienceVerbCategory;
	isCustom?: boolean;
};

export type UpdateBeforeAfterExampleInput = {
	id: string;
	userId: string;
	before?: string;
	after?: string;
	improvement?: string;
	category?: ExperienceVerbCategory;
};

export type CreateActionVerbInput = {
	userId: string;
	verb: string;
	description: string;
	example: string;
	category: ExperienceVerbCategory;
	isCustom?: boolean;
	isFavorite?: boolean;
};

export type CreateOptimizationHistoryInput = {
	userId: string;
	inputText: string;
	outputText: string;
	industry?: ExperienceIndustry;
};

export type UpdateIndustryPreferenceInput = {
	userId: string;
	selectedIndustry?: ExperienceIndustry;
	favoriteKeywords?: string[];
	favoritePhrases?: string[];
};

export type UpdateExpandedTipsInput = {
	userId: string;
	expandedTipIds: string[];
};

// =============================================================================
// SERVICE
// =============================================================================

export const experienceOptimizerService = {
	// =============================================================================
	// BEFORE/AFTER EXAMPLES
	// =============================================================================

	createBeforeAfterExample: async (input: CreateBeforeAfterExampleInput): Promise<string> => {
		const id = generateId();
		await db.insert(schema.experienceBeforeAfterExample).values({
			id,
			userId: input.userId,
			before: input.before,
			after: input.after,
			improvement: input.improvement,
			category: input.category,
			isCustom: input.isCustom ?? true,
		});
		return id;
	},

	getBeforeAfterExamples: async (input: { userId: string; category?: ExperienceVerbCategory }) => {
		const conditions = [eq(schema.experienceBeforeAfterExample.userId, input.userId)];
		if (input.category) {
			conditions.push(eq(schema.experienceBeforeAfterExample.category, input.category));
		}

		return await db
			.select()
			.from(schema.experienceBeforeAfterExample)
			.where(and(...conditions))
			.orderBy(desc(schema.experienceBeforeAfterExample.createdAt));
	},

	updateBeforeAfterExample: async (input: UpdateBeforeAfterExampleInput): Promise<void> => {
		const [existing] = await db
			.select({ id: schema.experienceBeforeAfterExample.id })
			.from(schema.experienceBeforeAfterExample)
			.where(
				and(
					eq(schema.experienceBeforeAfterExample.id, input.id),
					eq(schema.experienceBeforeAfterExample.userId, input.userId),
				),
			);

		if (!existing) {
			throw new ORPCError("NOT_FOUND", { message: "Before/After example not found" });
		}

		await db
			.update(schema.experienceBeforeAfterExample)
			.set({
				before: input.before,
				after: input.after,
				improvement: input.improvement,
				category: input.category,
			})
			.where(
				and(
					eq(schema.experienceBeforeAfterExample.id, input.id),
					eq(schema.experienceBeforeAfterExample.userId, input.userId),
				),
			);
	},

	deleteBeforeAfterExample: async (input: { id: string; userId: string }): Promise<void> => {
		await db
			.delete(schema.experienceBeforeAfterExample)
			.where(
				and(
					eq(schema.experienceBeforeAfterExample.id, input.id),
					eq(schema.experienceBeforeAfterExample.userId, input.userId),
				),
			);
	},

	// =============================================================================
	// ACTION VERBS
	// =============================================================================

	createActionVerb: async (input: CreateActionVerbInput): Promise<string> => {
		const id = generateId();
		await db.insert(schema.experienceActionVerb).values({
			id,
			userId: input.userId,
			verb: input.verb,
			description: input.description,
			example: input.example,
			category: input.category,
			isCustom: input.isCustom ?? true,
			isFavorite: input.isFavorite ?? false,
		});
		return id;
	},

	getActionVerbs: async (input: { userId: string; category?: ExperienceVerbCategory; favoritesOnly?: boolean }) => {
		const conditions = [eq(schema.experienceActionVerb.userId, input.userId)];
		if (input.category) {
			conditions.push(eq(schema.experienceActionVerb.category, input.category));
		}
		if (input.favoritesOnly) {
			conditions.push(eq(schema.experienceActionVerb.isFavorite, true));
		}

		return await db
			.select()
			.from(schema.experienceActionVerb)
			.where(and(...conditions))
			.orderBy(desc(schema.experienceActionVerb.createdAt));
	},

	toggleActionVerbFavorite: async (input: { id: string; userId: string; isFavorite: boolean }): Promise<void> => {
		await db
			.update(schema.experienceActionVerb)
			.set({ isFavorite: input.isFavorite })
			.where(and(eq(schema.experienceActionVerb.id, input.id), eq(schema.experienceActionVerb.userId, input.userId)));
	},

	deleteActionVerb: async (input: { id: string; userId: string }): Promise<void> => {
		await db
			.delete(schema.experienceActionVerb)
			.where(and(eq(schema.experienceActionVerb.id, input.id), eq(schema.experienceActionVerb.userId, input.userId)));
	},

	// =============================================================================
	// OPTIMIZATION HISTORY
	// =============================================================================

	createOptimizationHistory: async (input: CreateOptimizationHistoryInput): Promise<string> => {
		const id = generateId();
		await db.insert(schema.experienceOptimizationHistory).values({
			id,
			userId: input.userId,
			inputText: input.inputText,
			outputText: input.outputText,
			industry: input.industry,
		});
		return id;
	},

	getOptimizationHistory: async (input: { userId: string; limit?: number }) => {
		return await db
			.select()
			.from(schema.experienceOptimizationHistory)
			.where(eq(schema.experienceOptimizationHistory.userId, input.userId))
			.orderBy(desc(schema.experienceOptimizationHistory.createdAt))
			.limit(input.limit ?? 50);
	},

	deleteOptimizationHistory: async (input: { id: string; userId: string }): Promise<void> => {
		await db
			.delete(schema.experienceOptimizationHistory)
			.where(
				and(
					eq(schema.experienceOptimizationHistory.id, input.id),
					eq(schema.experienceOptimizationHistory.userId, input.userId),
				),
			);
	},

	clearOptimizationHistory: async (input: { userId: string }): Promise<void> => {
		await db
			.delete(schema.experienceOptimizationHistory)
			.where(eq(schema.experienceOptimizationHistory.userId, input.userId));
	},

	// =============================================================================
	// INDUSTRY PREFERENCES
	// =============================================================================

	getIndustryPreference: async (input: { userId: string }) => {
		const [preference] = await db
			.select()
			.from(schema.experienceIndustryPreference)
			.where(eq(schema.experienceIndustryPreference.userId, input.userId));

		return preference ?? null;
	},

	upsertIndustryPreference: async (input: UpdateIndustryPreferenceInput): Promise<string> => {
		const existing = await experienceOptimizerService.getIndustryPreference({ userId: input.userId });

		if (existing) {
			await db
				.update(schema.experienceIndustryPreference)
				.set({
					selectedIndustry: input.selectedIndustry ?? existing.selectedIndustry,
					favoriteKeywords: input.favoriteKeywords ?? existing.favoriteKeywords,
					favoritePhrases: input.favoritePhrases ?? existing.favoritePhrases,
				})
				.where(eq(schema.experienceIndustryPreference.userId, input.userId));
			return existing.id;
		}

		const id = generateId();
		await db.insert(schema.experienceIndustryPreference).values({
			id,
			userId: input.userId,
			selectedIndustry: input.selectedIndustry ?? "general",
			favoriteKeywords: input.favoriteKeywords ?? [],
			favoritePhrases: input.favoritePhrases ?? [],
		});
		return id;
	},

	addFavoriteKeyword: async (input: { userId: string; keyword: string }): Promise<void> => {
		const existing = await experienceOptimizerService.getIndustryPreference({ userId: input.userId });
		const keywords = existing?.favoriteKeywords ?? [];
		if (!keywords.includes(input.keyword)) {
			keywords.push(input.keyword);
			await experienceOptimizerService.upsertIndustryPreference({
				userId: input.userId,
				favoriteKeywords: keywords,
			});
		}
	},

	removeFavoriteKeyword: async (input: { userId: string; keyword: string }): Promise<void> => {
		const existing = await experienceOptimizerService.getIndustryPreference({ userId: input.userId });
		if (existing) {
			const keywords = existing.favoriteKeywords.filter((k) => k !== input.keyword);
			await experienceOptimizerService.upsertIndustryPreference({
				userId: input.userId,
				favoriteKeywords: keywords,
			});
		}
	},

	addFavoritePhrase: async (input: { userId: string; phrase: string }): Promise<void> => {
		const existing = await experienceOptimizerService.getIndustryPreference({ userId: input.userId });
		const phrases = existing?.favoritePhrases ?? [];
		if (!phrases.includes(input.phrase)) {
			phrases.push(input.phrase);
			await experienceOptimizerService.upsertIndustryPreference({
				userId: input.userId,
				favoritePhrases: phrases,
			});
		}
	},

	removeFavoritePhrase: async (input: { userId: string; phrase: string }): Promise<void> => {
		const existing = await experienceOptimizerService.getIndustryPreference({ userId: input.userId });
		if (existing) {
			const phrases = existing.favoritePhrases.filter((p) => p !== input.phrase);
			await experienceOptimizerService.upsertIndustryPreference({
				userId: input.userId,
				favoritePhrases: phrases,
			});
		}
	},

	// =============================================================================
	// EXPANDED TIPS TRACKING
	// =============================================================================

	getExpandedTips: async (input: { userId: string }) => {
		const [result] = await db
			.select()
			.from(schema.experienceExpandedTips)
			.where(eq(schema.experienceExpandedTips.userId, input.userId));

		return result?.expandedTipIds ?? [];
	},

	upsertExpandedTips: async (input: UpdateExpandedTipsInput): Promise<void> => {
		const [existing] = await db
			.select()
			.from(schema.experienceExpandedTips)
			.where(eq(schema.experienceExpandedTips.userId, input.userId));

		if (existing) {
			await db
				.update(schema.experienceExpandedTips)
				.set({ expandedTipIds: input.expandedTipIds })
				.where(eq(schema.experienceExpandedTips.userId, input.userId));
		} else {
			await db.insert(schema.experienceExpandedTips).values({
				id: generateId(),
				userId: input.userId,
				expandedTipIds: input.expandedTipIds,
			});
		}
	},

	toggleExpandedTip: async (input: { userId: string; tipId: string }): Promise<string[]> => {
		const expandedTips = await experienceOptimizerService.getExpandedTips({ userId: input.userId });
		const newExpandedTips = expandedTips.includes(input.tipId)
			? expandedTips.filter((id) => id !== input.tipId)
			: [...expandedTips, input.tipId];

		await experienceOptimizerService.upsertExpandedTips({
			userId: input.userId,
			expandedTipIds: newExpandedTips,
		});

		return newExpandedTips;
	},
};
