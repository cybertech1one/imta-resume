import z from "zod";
import { protectedProcedure } from "../context";
import { linkedinService } from "../services/linkedin";

const linkedinIndustrySchema = z.enum([
	"technology",
	"finance",
	"healthcare",
	"marketing",
	"engineering",
	"education",
	"consulting",
	"general",
]);

const photoTipSchema = z.object({
	id: z.string().uuid(),
	title: z.string(),
	description: z.string(),
	iconName: z.string(),
	checked: z.boolean(),
});

const checklistItemSchema = z.object({
	id: z.string().uuid(),
	category: z.string(),
	item: z.string(),
	completed: z.boolean(),
	priority: z.enum(["high", "medium", "low"]),
});

const headlineSuggestionSchema = z.object({
	id: z.string().uuid(),
	headline: z.string(),
	keywords: z.array(z.string()),
	tone: z.enum(["professional", "creative", "executive"]),
});

const summarySuggestionSchema = z.object({
	id: z.string().uuid(),
	summary: z.string(),
	wordCount: z.number(),
	keywords: z.array(z.string()),
});

const profileScoreSchema = z.object({
	overall: z.number(),
	photo: z.number(),
	headline: z.number(),
	summary: z.number(),
	experience: z.number(),
	skills: z.number(),
	connections: z.number(),
	engagement: z.number(),
});

const linkedinProfileSchema = z.object({
	id: z.string().uuid(),
	userId: z.string(),
	industry: linkedinIndustrySchema,
	currentRole: z.string().nullable(),
	currentHeadline: z.string().nullable(),
	currentSummary: z.string().nullable(),
	yearsExperience: z.number(),
	hasProfilePhoto: z.boolean(),
	skillsCount: z.number(),
	experienceCount: z.number(),
	connectionsCount: z.number(),
	photoTips: z.array(photoTipSchema),
	checklist: z.array(checklistItemSchema),
	headlineSuggestions: z.array(headlineSuggestionSchema),
	summarySuggestions: z.array(summarySuggestionSchema),
	createdAt: z.coerce.date(),
	updatedAt: z.coerce.date(),
});

const keywordOptimizationSchema = z.object({
	keyword: z.string(),
	searchVolume: z.string(),
	competition: z.string(),
	recommended: z.boolean(),
});

export const linkedinRouter = {
	// Get or create profile
	getProfile: protectedProcedure
		.route({
			method: "GET",
			path: "/linkedin/profile",
			tags: ["LinkedIn"],
			summary: "Get or create LinkedIn profile optimization data",
		})
		.output(linkedinProfileSchema)
		.handler(async ({ context }) => {
			return await linkedinService.getOrCreate(context.user.id);
		}),

	// Update profile
	updateProfile: protectedProcedure
		.route({
			method: "PUT",
			path: "/linkedin/profile",
			tags: ["LinkedIn"],
			summary: "Update LinkedIn profile optimization data",
		})
		.input(
			z.object({
				industry: linkedinIndustrySchema.optional(),
				currentRole: z.string().optional(),
				currentHeadline: z.string().optional(),
				currentSummary: z.string().optional(),
				yearsExperience: z.number().optional(),
				hasProfilePhoto: z.boolean().optional(),
				skillsCount: z.number().optional(),
				experienceCount: z.number().optional(),
				connectionsCount: z.number().optional(),
				photoTips: z.array(photoTipSchema).optional(),
				checklist: z.array(checklistItemSchema).optional(),
				headlineSuggestions: z.array(headlineSuggestionSchema).optional(),
				summarySuggestions: z.array(summarySuggestionSchema).optional(),
			}),
		)
		.output(z.void())
		.handler(async ({ context, input }) => {
			return await linkedinService.update({
				userId: context.user.id,
				...input,
			});
		}),

	// Toggle photo tip
	togglePhotoTip: protectedProcedure
		.route({
			method: "POST",
			path: "/linkedin/photo-tips/{tipId}/toggle",
			tags: ["LinkedIn"],
			summary: "Toggle a photo tip checked state",
		})
		.input(z.object({ tipId: z.string() }))
		.output(z.array(photoTipSchema))
		.handler(async ({ context, input }) => {
			return await linkedinService.togglePhotoTip({
				userId: context.user.id,
				tipId: input.tipId,
			});
		}),

	// Generate headline suggestions
	generateHeadlines: protectedProcedure
		.route({
			method: "POST",
			path: "/linkedin/headlines/generate",
			tags: ["LinkedIn"],
			summary: "Generate headline suggestions",
		})
		.input(
			z.object({
				currentRole: z.string(),
				industry: linkedinIndustrySchema,
			}),
		)
		.output(z.array(headlineSuggestionSchema))
		.handler(async ({ context, input }) => {
			return await linkedinService.generateHeadlines({
				userId: context.user.id,
				currentRole: input.currentRole,
				industry: input.industry,
			});
		}),

	// Generate summary suggestions
	generateSummaries: protectedProcedure
		.route({
			method: "POST",
			path: "/linkedin/summaries/generate",
			tags: ["LinkedIn"],
			summary: "Generate summary suggestions",
		})
		.input(
			z.object({
				currentRole: z.string(),
				industry: linkedinIndustrySchema,
				yearsExperience: z.number(),
			}),
		)
		.output(z.array(summarySuggestionSchema))
		.handler(async ({ context, input }) => {
			return await linkedinService.generateSummaries({
				userId: context.user.id,
				currentRole: input.currentRole,
				industry: input.industry,
				yearsExperience: input.yearsExperience,
			});
		}),

	// Generate checklist
	generateChecklist: protectedProcedure
		.route({
			method: "POST",
			path: "/linkedin/checklist/generate",
			tags: ["LinkedIn"],
			summary: "Generate optimization checklist",
		})
		.output(z.array(checklistItemSchema))
		.handler(async ({ context }) => {
			return await linkedinService.generateChecklist({ userId: context.user.id });
		}),

	// Toggle checklist item
	toggleChecklistItem: protectedProcedure
		.route({
			method: "POST",
			path: "/linkedin/checklist/{itemId}/toggle",
			tags: ["LinkedIn"],
			summary: "Toggle a checklist item completion state",
		})
		.input(z.object({ itemId: z.string() }))
		.output(z.array(checklistItemSchema))
		.handler(async ({ context, input }) => {
			return await linkedinService.toggleChecklistItem({
				userId: context.user.id,
				itemId: input.itemId,
			});
		}),

	// Get industry keywords
	getIndustryKeywords: protectedProcedure
		.route({
			method: "GET",
			path: "/linkedin/keywords/{industry}",
			tags: ["LinkedIn"],
			summary: "Get keyword optimizations for an industry",
		})
		.input(z.object({ industry: linkedinIndustrySchema }))
		.output(z.array(keywordOptimizationSchema))
		.handler(async ({ input }) => {
			return await linkedinService.getIndustryKeywords({ industry: input.industry });
		}),

	// Get skill recommendations for an industry
	getIndustrySkills: protectedProcedure
		.route({
			method: "GET",
			path: "/linkedin/skills/{industry}",
			tags: ["LinkedIn"],
			summary: "Get skill recommendations for an industry",
		})
		.input(z.object({ industry: linkedinIndustrySchema }))
		.output(
			z.array(
				z.object({
					skill: z.string(),
					category: z.enum(["technical", "soft", "industry"]),
					relevance: z.enum(["high", "medium", "low"]),
					inDemand: z.boolean(),
				}),
			),
		)
		.handler(async ({ input }) => {
			return await linkedinService.getIndustrySkills({ industry: input.industry });
		}),

	// Get connection strategies
	getConnectionStrategies: protectedProcedure
		.route({
			method: "GET",
			path: "/linkedin/strategies",
			tags: ["LinkedIn"],
			summary: "Get connection strategies",
		})
		.output(
			z.array(
				z.object({
					id: z.string().uuid(),
					title: z.string(),
					description: z.string(),
					tips: z.array(z.string()),
					priority: z.enum(["high", "medium", "low"]),
				}),
			),
		)
		.handler(async () => {
			return await linkedinService.getConnectionStrategies();
		}),

	// Get engagement tips
	getEngagementTips: protectedProcedure
		.route({
			method: "GET",
			path: "/linkedin/engagement-tips",
			tags: ["LinkedIn"],
			summary: "Get engagement tips",
		})
		.output(
			z.array(
				z.object({
					id: z.string().uuid(),
					category: z.enum(["posting", "commenting", "sharing", "networking"]),
					title: z.string(),
					description: z.string(),
					frequency: z.string(),
					iconName: z.string(),
				}),
			),
		)
		.handler(async () => {
			return await linkedinService.getEngagementTips();
		}),

	// Get industries list
	getIndustries: protectedProcedure
		.route({
			method: "GET",
			path: "/linkedin/industries",
			tags: ["LinkedIn"],
			summary: "Get list of industries",
		})
		.output(
			z.array(
				z.object({
					value: linkedinIndustrySchema,
					label: z.string(),
				}),
			),
		)
		.handler(async () => {
			return await linkedinService.getIndustries();
		}),

	// Calculate profile score
	calculateScore: protectedProcedure
		.route({
			method: "POST",
			path: "/linkedin/score/calculate",
			tags: ["LinkedIn"],
			summary: "Calculate profile completeness score",
		})
		.input(
			z.object({
				hasProfilePhoto: z.boolean(),
				currentHeadline: z.string(),
				currentSummary: z.string(),
				skillsCount: z.number(),
				experienceCount: z.number(),
				connectionsCount: z.number(),
			}),
		)
		.output(profileScoreSchema)
		.handler(async ({ input }) => {
			return linkedinService.calculateScore(input);
		}),
};
