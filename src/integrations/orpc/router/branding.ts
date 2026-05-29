import z from "zod";
import { protectedProcedure } from "../context";
import { brandingService } from "../services/branding";

const brandingDataSchema = z.object({
	profession: z.string(),
	targetAudience: z.string(),
	uniqueStrength: z.string(),
	valueProvided: z.string(),
	personality: z.string(),
	generatedStatement: z.string(),
	uvpProblem: z.string(),
	uvpSolution: z.string(),
	uvpBenefit: z.string(),
	uvpDifferentiator: z.string(),
	selectedLogo: z.string().nullable(),
	selectedPalette: z.string().nullable(),
	selectedVoice: z.string().nullable(),
	socialCheckedItems: z.array(z.string()),
	websiteCheckedItems: z.array(z.string()),
});

export const brandingRouter = {
	// Get branding data
	getData: protectedProcedure
		.route({
			method: "GET",
			path: "/branding",
			tags: ["Branding"],
			summary: "Get personal branding data",
		})
		.output(brandingDataSchema)
		.handler(async ({ context }) => {
			return await brandingService.get(context.user.id);
		}),

	// Update branding data
	update: protectedProcedure
		.route({
			method: "PUT",
			path: "/branding",
			tags: ["Branding"],
			summary: "Update personal branding data",
		})
		.input(brandingDataSchema.partial())
		.output(z.void())
		.handler(async ({ context, input }) => {
			return await brandingService.update({
				userId: context.user.id,
				...input,
			});
		}),

	// Toggle social checklist item
	toggleSocialItem: protectedProcedure
		.route({
			method: "POST",
			path: "/branding/social/toggle",
			tags: ["Branding"],
			summary: "Toggle a social checklist item",
		})
		.input(z.object({ itemId: z.string() }))
		.output(z.array(z.string()))
		.handler(async ({ context, input }) => {
			return await brandingService.toggleSocialItem(context.user.id, input.itemId);
		}),

	// Toggle website checklist item
	toggleWebsiteItem: protectedProcedure
		.route({
			method: "POST",
			path: "/branding/website/toggle",
			tags: ["Branding"],
			summary: "Toggle a website checklist item",
		})
		.input(z.object({ itemId: z.string() }))
		.output(z.array(z.string()))
		.handler(async ({ context, input }) => {
			return await brandingService.toggleWebsiteItem(context.user.id, input.itemId);
		}),
};
