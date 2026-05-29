import { eq } from "drizzle-orm";
import { schema } from "@/integrations/drizzle";
import { db } from "@/integrations/drizzle/client";
import { generateId } from "@/utils/string";

export type BrandingData = {
	// Brand Statement
	profession: string;
	targetAudience: string;
	uniqueStrength: string;
	valueProvided: string;
	personality: string;
	generatedStatement: string;
	// UVP
	uvpProblem: string;
	uvpSolution: string;
	uvpBenefit: string;
	uvpDifferentiator: string;
	// Visual Identity
	selectedLogo: string | null;
	selectedPalette: string | null;
	// Voice & Tone
	selectedVoice: string | null;
	// Checklists
	socialCheckedItems: string[];
	websiteCheckedItems: string[];
};

export type UpdateBrandingInput = Partial<BrandingData> & {
	userId: string;
};

export const brandingService = {
	// Get branding data (or create default if doesn't exist)
	get: async (userId: string): Promise<BrandingData> => {
		const [existing] = await db
			.select()
			.from(schema.personalBranding)
			.where(eq(schema.personalBranding.userId, userId));

		if (existing) {
			return {
				profession: existing.profession,
				targetAudience: existing.targetAudience,
				uniqueStrength: existing.uniqueStrength,
				valueProvided: existing.valueProvided,
				personality: existing.personality,
				generatedStatement: existing.generatedStatement,
				uvpProblem: existing.uvpProblem,
				uvpSolution: existing.uvpSolution,
				uvpBenefit: existing.uvpBenefit,
				uvpDifferentiator: existing.uvpDifferentiator,
				selectedLogo: existing.selectedLogo,
				selectedPalette: existing.selectedPalette,
				selectedVoice: existing.selectedVoice,
				socialCheckedItems: existing.socialCheckedItems,
				websiteCheckedItems: existing.websiteCheckedItems,
			};
		}

		// Create default entry
		await db.insert(schema.personalBranding).values({
			id: generateId(),
			userId,
		});

		return {
			profession: "",
			targetAudience: "",
			uniqueStrength: "",
			valueProvided: "",
			personality: "",
			generatedStatement: "",
			uvpProblem: "",
			uvpSolution: "",
			uvpBenefit: "",
			uvpDifferentiator: "",
			selectedLogo: null,
			selectedPalette: null,
			selectedVoice: null,
			socialCheckedItems: [],
			websiteCheckedItems: [],
		};
	},

	// Update branding data
	update: async (input: UpdateBrandingInput): Promise<void> => {
		// Ensure record exists
		await brandingService.get(input.userId);

		const updateData: Record<string, unknown> = {};

		if (input.profession !== undefined) updateData.profession = input.profession;
		if (input.targetAudience !== undefined) updateData.targetAudience = input.targetAudience;
		if (input.uniqueStrength !== undefined) updateData.uniqueStrength = input.uniqueStrength;
		if (input.valueProvided !== undefined) updateData.valueProvided = input.valueProvided;
		if (input.personality !== undefined) updateData.personality = input.personality;
		if (input.generatedStatement !== undefined) updateData.generatedStatement = input.generatedStatement;
		if (input.uvpProblem !== undefined) updateData.uvpProblem = input.uvpProblem;
		if (input.uvpSolution !== undefined) updateData.uvpSolution = input.uvpSolution;
		if (input.uvpBenefit !== undefined) updateData.uvpBenefit = input.uvpBenefit;
		if (input.uvpDifferentiator !== undefined) updateData.uvpDifferentiator = input.uvpDifferentiator;
		if (input.selectedLogo !== undefined) updateData.selectedLogo = input.selectedLogo;
		if (input.selectedPalette !== undefined) updateData.selectedPalette = input.selectedPalette;
		if (input.selectedVoice !== undefined) updateData.selectedVoice = input.selectedVoice;
		if (input.socialCheckedItems !== undefined) updateData.socialCheckedItems = input.socialCheckedItems;
		if (input.websiteCheckedItems !== undefined) updateData.websiteCheckedItems = input.websiteCheckedItems;

		await db.update(schema.personalBranding).set(updateData).where(eq(schema.personalBranding.userId, input.userId));
	},

	// Toggle social checklist item
	toggleSocialItem: async (userId: string, itemId: string): Promise<string[]> => {
		const current = await brandingService.get(userId);
		const socialCheckedItems = current.socialCheckedItems.includes(itemId)
			? current.socialCheckedItems.filter((id) => id !== itemId)
			: [...current.socialCheckedItems, itemId];

		await db
			.update(schema.personalBranding)
			.set({ socialCheckedItems })
			.where(eq(schema.personalBranding.userId, userId));

		return socialCheckedItems;
	},

	// Toggle website checklist item
	toggleWebsiteItem: async (userId: string, itemId: string): Promise<string[]> => {
		const current = await brandingService.get(userId);
		const websiteCheckedItems = current.websiteCheckedItems.includes(itemId)
			? current.websiteCheckedItems.filter((id) => id !== itemId)
			: [...current.websiteCheckedItems, itemId];

		await db
			.update(schema.personalBranding)
			.set({ websiteCheckedItems })
			.where(eq(schema.personalBranding.userId, userId));

		return websiteCheckedItems;
	},
};
