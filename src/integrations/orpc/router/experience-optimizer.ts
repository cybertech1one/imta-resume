import z from "zod";
import { protectedProcedure } from "../context";
import { experienceOptimizerService } from "../services/experience-optimizer";

const verbCategorySchema = z.enum(["leadership", "technical", "communication"]);
const industrySchema = z.enum([
	"technology",
	"healthcare",
	"finance",
	"marketing",
	"engineering",
	"education",
	"general",
]);

const beforeAfterExampleSchema = z.object({
	id: z.string().uuid(),
	userId: z.string(),
	before: z.string(),
	after: z.string(),
	improvement: z.string(),
	category: z.string(),
	isCustom: z.boolean(),
	createdAt: z.coerce.date(),
	updatedAt: z.coerce.date(),
});

const actionVerbSchema = z.object({
	id: z.string().uuid(),
	userId: z.string(),
	verb: z.string(),
	description: z.string(),
	example: z.string(),
	category: z.string(),
	isCustom: z.boolean(),
	isFavorite: z.boolean(),
	createdAt: z.coerce.date(),
});

const optimizationHistorySchema = z.object({
	id: z.string().uuid(),
	userId: z.string(),
	inputText: z.string(),
	outputText: z.string(),
	industry: z.string().nullable(),
	createdAt: z.coerce.date(),
});

const industryPreferenceSchema = z.object({
	id: z.string().uuid(),
	userId: z.string(),
	selectedIndustry: z.string(),
	favoriteKeywords: z.array(z.string()),
	favoritePhrases: z.array(z.string()),
	createdAt: z.coerce.date(),
	updatedAt: z.coerce.date(),
});

export const experienceOptimizerRouter = {
	// =============================================================================
	// BEFORE/AFTER EXAMPLES
	// =============================================================================

	createBeforeAfterExample: protectedProcedure
		.route({
			method: "POST",
			path: "/experience-optimizer/before-after",
			tags: ["Experience Optimizer"],
			summary: "Create a new before/after example",
		})
		.input(
			z.object({
				before: z.string().min(1),
				after: z.string().min(1),
				improvement: z.string().min(1),
				category: verbCategorySchema,
				isCustom: z.boolean().optional(),
			}),
		)
		.output(z.string())
		.handler(async ({ context, input }) => {
			return await experienceOptimizerService.createBeforeAfterExample({
				...input,
				userId: context.user.id,
			});
		}),

	getBeforeAfterExamples: protectedProcedure
		.route({
			method: "GET",
			path: "/experience-optimizer/before-after",
			tags: ["Experience Optimizer"],
			summary: "Get all before/after examples",
		})
		.input(
			z
				.object({
					category: verbCategorySchema.optional(),
				})
				.optional()
				.default({}),
		)
		.output(z.array(beforeAfterExampleSchema))
		.handler(async ({ context, input }) => {
			return await experienceOptimizerService.getBeforeAfterExamples({
				userId: context.user.id,
				category: input.category,
			});
		}),

	updateBeforeAfterExample: protectedProcedure
		.route({
			method: "PUT",
			path: "/experience-optimizer/before-after/{id}",
			tags: ["Experience Optimizer"],
			summary: "Update a before/after example",
		})
		.input(
			z.object({
				id: z.string().uuid(),
				before: z.string().optional(),
				after: z.string().optional(),
				improvement: z.string().optional(),
				category: verbCategorySchema.optional(),
			}),
		)
		.output(z.void())
		.handler(async ({ context, input }) => {
			return await experienceOptimizerService.updateBeforeAfterExample({
				...input,
				userId: context.user.id,
			});
		}),

	deleteBeforeAfterExample: protectedProcedure
		.route({
			method: "DELETE",
			path: "/experience-optimizer/before-after/{id}",
			tags: ["Experience Optimizer"],
			summary: "Delete a before/after example",
		})
		.input(z.object({ id: z.string().uuid() }))
		.output(z.void())
		.handler(async ({ context, input }) => {
			return await experienceOptimizerService.deleteBeforeAfterExample({
				id: input.id,
				userId: context.user.id,
			});
		}),

	// =============================================================================
	// ACTION VERBS
	// =============================================================================

	createActionVerb: protectedProcedure
		.route({
			method: "POST",
			path: "/experience-optimizer/action-verbs",
			tags: ["Experience Optimizer"],
			summary: "Create a new action verb",
		})
		.input(
			z.object({
				verb: z.string().min(1),
				description: z.string().min(1),
				example: z.string().min(1),
				category: verbCategorySchema,
				isCustom: z.boolean().optional(),
				isFavorite: z.boolean().optional(),
			}),
		)
		.output(z.string())
		.handler(async ({ context, input }) => {
			return await experienceOptimizerService.createActionVerb({
				...input,
				userId: context.user.id,
			});
		}),

	getActionVerbs: protectedProcedure
		.route({
			method: "GET",
			path: "/experience-optimizer/action-verbs",
			tags: ["Experience Optimizer"],
			summary: "Get all action verbs",
		})
		.input(
			z
				.object({
					category: verbCategorySchema.optional(),
					favoritesOnly: z.boolean().optional(),
				})
				.optional()
				.default({}),
		)
		.output(z.array(actionVerbSchema))
		.handler(async ({ context, input }) => {
			return await experienceOptimizerService.getActionVerbs({
				userId: context.user.id,
				category: input.category,
				favoritesOnly: input.favoritesOnly,
			});
		}),

	toggleActionVerbFavorite: protectedProcedure
		.route({
			method: "PUT",
			path: "/experience-optimizer/action-verbs/{id}/favorite",
			tags: ["Experience Optimizer"],
			summary: "Toggle action verb favorite status",
		})
		.input(
			z.object({
				id: z.string().uuid(),
				isFavorite: z.boolean(),
			}),
		)
		.output(z.void())
		.handler(async ({ context, input }) => {
			return await experienceOptimizerService.toggleActionVerbFavorite({
				...input,
				userId: context.user.id,
			});
		}),

	deleteActionVerb: protectedProcedure
		.route({
			method: "DELETE",
			path: "/experience-optimizer/action-verbs/{id}",
			tags: ["Experience Optimizer"],
			summary: "Delete an action verb",
		})
		.input(z.object({ id: z.string().uuid() }))
		.output(z.void())
		.handler(async ({ context, input }) => {
			return await experienceOptimizerService.deleteActionVerb({
				id: input.id,
				userId: context.user.id,
			});
		}),

	// =============================================================================
	// OPTIMIZATION HISTORY
	// =============================================================================

	createOptimizationHistory: protectedProcedure
		.route({
			method: "POST",
			path: "/experience-optimizer/history",
			tags: ["Experience Optimizer"],
			summary: "Save an optimization to history",
		})
		.input(
			z.object({
				inputText: z.string().min(1),
				outputText: z.string().min(1),
				industry: industrySchema.optional(),
			}),
		)
		.output(z.string())
		.handler(async ({ context, input }) => {
			return await experienceOptimizerService.createOptimizationHistory({
				...input,
				userId: context.user.id,
			});
		}),

	getOptimizationHistory: protectedProcedure
		.route({
			method: "GET",
			path: "/experience-optimizer/history",
			tags: ["Experience Optimizer"],
			summary: "Get optimization history",
		})
		.input(z.object({ limit: z.number().optional() }).optional().default({}))
		.output(z.array(optimizationHistorySchema))
		.handler(async ({ context, input }) => {
			return await experienceOptimizerService.getOptimizationHistory({
				userId: context.user.id,
				limit: input.limit,
			});
		}),

	deleteOptimizationHistory: protectedProcedure
		.route({
			method: "DELETE",
			path: "/experience-optimizer/history/{id}",
			tags: ["Experience Optimizer"],
			summary: "Delete an optimization history entry",
		})
		.input(z.object({ id: z.string().uuid() }))
		.output(z.void())
		.handler(async ({ context, input }) => {
			return await experienceOptimizerService.deleteOptimizationHistory({
				id: input.id,
				userId: context.user.id,
			});
		}),

	clearOptimizationHistory: protectedProcedure
		.route({
			method: "DELETE",
			path: "/experience-optimizer/history",
			tags: ["Experience Optimizer"],
			summary: "Clear all optimization history",
		})
		.input(z.object({}).optional().default({}))
		.output(z.void())
		.handler(async ({ context }) => {
			return await experienceOptimizerService.clearOptimizationHistory({
				userId: context.user.id,
			});
		}),

	// =============================================================================
	// INDUSTRY PREFERENCES
	// =============================================================================

	getIndustryPreference: protectedProcedure
		.route({
			method: "GET",
			path: "/experience-optimizer/industry-preference",
			tags: ["Experience Optimizer"],
			summary: "Get industry preference",
		})
		.input(z.object({}).optional().default({}))
		.output(industryPreferenceSchema.nullable())
		.handler(async ({ context }) => {
			return await experienceOptimizerService.getIndustryPreference({
				userId: context.user.id,
			});
		}),

	upsertIndustryPreference: protectedProcedure
		.route({
			method: "PUT",
			path: "/experience-optimizer/industry-preference",
			tags: ["Experience Optimizer"],
			summary: "Update industry preference",
		})
		.input(
			z.object({
				selectedIndustry: industrySchema.optional(),
				favoriteKeywords: z.array(z.string()).optional(),
				favoritePhrases: z.array(z.string()).optional(),
			}),
		)
		.output(z.string())
		.handler(async ({ context, input }) => {
			return await experienceOptimizerService.upsertIndustryPreference({
				...input,
				userId: context.user.id,
			});
		}),

	addFavoriteKeyword: protectedProcedure
		.route({
			method: "POST",
			path: "/experience-optimizer/favorite-keywords",
			tags: ["Experience Optimizer"],
			summary: "Add a favorite keyword",
		})
		.input(z.object({ keyword: z.string().min(1) }))
		.output(z.void())
		.handler(async ({ context, input }) => {
			return await experienceOptimizerService.addFavoriteKeyword({
				userId: context.user.id,
				keyword: input.keyword,
			});
		}),

	removeFavoriteKeyword: protectedProcedure
		.route({
			method: "DELETE",
			path: "/experience-optimizer/favorite-keywords",
			tags: ["Experience Optimizer"],
			summary: "Remove a favorite keyword",
		})
		.input(z.object({ keyword: z.string().min(1) }))
		.output(z.void())
		.handler(async ({ context, input }) => {
			return await experienceOptimizerService.removeFavoriteKeyword({
				userId: context.user.id,
				keyword: input.keyword,
			});
		}),

	addFavoritePhrase: protectedProcedure
		.route({
			method: "POST",
			path: "/experience-optimizer/favorite-phrases",
			tags: ["Experience Optimizer"],
			summary: "Add a favorite phrase",
		})
		.input(z.object({ phrase: z.string().min(1) }))
		.output(z.void())
		.handler(async ({ context, input }) => {
			return await experienceOptimizerService.addFavoritePhrase({
				userId: context.user.id,
				phrase: input.phrase,
			});
		}),

	removeFavoritePhrase: protectedProcedure
		.route({
			method: "DELETE",
			path: "/experience-optimizer/favorite-phrases",
			tags: ["Experience Optimizer"],
			summary: "Remove a favorite phrase",
		})
		.input(z.object({ phrase: z.string().min(1) }))
		.output(z.void())
		.handler(async ({ context, input }) => {
			return await experienceOptimizerService.removeFavoritePhrase({
				userId: context.user.id,
				phrase: input.phrase,
			});
		}),

	// =============================================================================
	// EXPANDED TIPS
	// =============================================================================

	getExpandedTips: protectedProcedure
		.route({
			method: "GET",
			path: "/experience-optimizer/expanded-tips",
			tags: ["Experience Optimizer"],
			summary: "Get expanded tip IDs",
		})
		.input(z.object({}).optional().default({}))
		.output(z.array(z.string()))
		.handler(async ({ context }) => {
			return await experienceOptimizerService.getExpandedTips({
				userId: context.user.id,
			});
		}),

	toggleExpandedTip: protectedProcedure
		.route({
			method: "POST",
			path: "/experience-optimizer/expanded-tips/toggle",
			tags: ["Experience Optimizer"],
			summary: "Toggle a tip's expanded state",
		})
		.input(z.object({ tipId: z.string().min(1) }))
		.output(z.array(z.string()))
		.handler(async ({ context, input }) => {
			return await experienceOptimizerService.toggleExpandedTip({
				userId: context.user.id,
				tipId: input.tipId,
			});
		}),
};
