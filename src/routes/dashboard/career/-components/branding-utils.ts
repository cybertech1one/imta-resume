import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";

import { authClient } from "@/integrations/auth/client";
import { orpc } from "@/integrations/orpc/client";

import {
	getColorPalettes,
	getFallbackAudienceExamples,
	getFallbackPersonalityTraits,
	getFallbackProfessionExamples,
	getFallbackStrengthExamples,
	getFallbackValueExamples,
	getLogoConcepts,
	getSocialMediaChecklist,
	getVoiceTones,
	getWebsiteChecklist,
} from "./branding-config";
import type { BrandStatementData, UVPData } from "./branding-types";

export function useBrandingData() {
	const { data: session } = authClient.useSession();
	const queryClient = useQueryClient();

	const LOGO_CONCEPTS = getLogoConcepts();
	const COLOR_PALETTES = getColorPalettes();
	const VOICE_TONES = getVoiceTones();
	const SOCIAL_MEDIA_CHECKLIST = getSocialMediaChecklist();
	const WEBSITE_CHECKLIST = getWebsiteChecklist();

	// Fetch branding data from database
	const { data: brandingData } = useQuery({
		...orpc.branding.getData.queryOptions({}),
		staleTime: 5 * 60 * 1000,
		enabled: !!session?.user,
	});

	// Fetch branding examples from database with fallbacks
	const { data: professionExamples } = useQuery({
		...orpc.brandingExamples.list.queryOptions({ input: { category: "profession" } }),
		staleTime: 10 * 60 * 1000,
		enabled: !!session?.user,
	});

	const { data: audienceExamples } = useQuery({
		...orpc.brandingExamples.list.queryOptions({ input: { category: "audience" } }),
		staleTime: 10 * 60 * 1000,
		enabled: !!session?.user,
	});

	const { data: strengthExamples } = useQuery({
		...orpc.brandingExamples.list.queryOptions({ input: { category: "strength" } }),
		staleTime: 10 * 60 * 1000,
		enabled: !!session?.user,
	});

	const { data: valueExamples } = useQuery({
		...orpc.brandingExamples.list.queryOptions({ input: { category: "value" } }),
		staleTime: 10 * 60 * 1000,
		enabled: !!session?.user,
	});

	const { data: personalityExamples } = useQuery({
		...orpc.brandingExamples.list.queryOptions({ input: { category: "personality" } }),
		staleTime: 10 * 60 * 1000,
		enabled: !!session?.user,
	});

	// Use database data with fallbacks
	const PROFESSION_EXAMPLES = professionExamples?.length ? professionExamples : getFallbackProfessionExamples();
	const AUDIENCE_EXAMPLES = audienceExamples?.length ? audienceExamples : getFallbackAudienceExamples();
	const STRENGTH_EXAMPLES = strengthExamples?.length ? strengthExamples : getFallbackStrengthExamples();
	const VALUE_EXAMPLES = valueExamples?.length ? valueExamples : getFallbackValueExamples();
	const PERSONALITY_TRAITS = personalityExamples?.length ? personalityExamples : getFallbackPersonalityTraits();

	// Local UI state (not persisted)
	const [wizardStep, setWizardStep] = useState(1);
	const [activeTab, setActiveTab] = useState("statement");

	// Brand Statement Data (from database)
	const brandData: BrandStatementData = useMemo(
		() => ({
			profession: brandingData?.profession ?? "",
			targetAudience: brandingData?.targetAudience ?? "",
			uniqueStrength: brandingData?.uniqueStrength ?? "",
			valueProvided: brandingData?.valueProvided ?? "",
			personality: brandingData?.personality ?? "",
		}),
		[
			brandingData?.profession,
			brandingData?.targetAudience,
			brandingData?.uniqueStrength,
			brandingData?.valueProvided,
			brandingData?.personality,
		],
	);

	const generatedStatement = brandingData?.generatedStatement ?? "";

	// UVP Data (from database)
	const uvpData: UVPData = useMemo(
		() => ({
			problem: brandingData?.uvpProblem ?? "",
			solution: brandingData?.uvpSolution ?? "",
			benefit: brandingData?.uvpBenefit ?? "",
			differentiator: brandingData?.uvpDifferentiator ?? "",
		}),
		[brandingData?.uvpProblem, brandingData?.uvpSolution, brandingData?.uvpBenefit, brandingData?.uvpDifferentiator],
	);

	// Visual Identity (from database)
	const selectedLogo = brandingData?.selectedLogo ?? null;
	const selectedPalette = brandingData?.selectedPalette ?? null;

	// Voice/Tone (from database)
	const selectedVoice = brandingData?.selectedVoice ?? null;

	// Checklists (from database - convert array to object)
	const socialChecked = useMemo(() => {
		const checked: Record<string, boolean> = {};
		brandingData?.socialCheckedItems.forEach((itemId) => {
			checked[itemId] = true;
		});
		return checked;
	}, [brandingData?.socialCheckedItems]);

	const websiteChecked = useMemo(() => {
		const checked: Record<string, boolean> = {};
		brandingData?.websiteCheckedItems.forEach((itemId) => {
			checked[itemId] = true;
		});
		return checked;
	}, [brandingData?.websiteCheckedItems]);

	// Mutation for updating branding data
	const updateMutation = useMutation({
		...orpc.branding.update.mutationOptions(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: orpc.branding.getData.key() });
		},
		onError: (error) => {
			toast.error(error.message);
		},
	});

	// Mutation for toggling social checklist items
	const toggleSocialMutation = useMutation({
		...orpc.branding.toggleSocialItem.mutationOptions(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: orpc.branding.getData.key() });
		},
	});

	// Mutation for toggling website checklist items
	const toggleWebsiteMutation = useMutation({
		...orpc.branding.toggleWebsiteItem.mutationOptions(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: orpc.branding.getData.key() });
		},
	});

	// Generate brand statement
	const generateBrandStatement = useCallback(() => {
		const { profession, targetAudience, uniqueStrength, valueProvided, personality } = brandData;
		if (profession && targetAudience && uniqueStrength && valueProvided && personality) {
			const statement = `Je suis ${profession}, specialise(e) dans l'accompagnement de ${targetAudience}. Grace a ma capacite de ${uniqueStrength.toLowerCase()}, j'aide mes clients a ${valueProvided.toLowerCase()}. Mon approche ${personality.toLowerCase()} me distingue et cree des relations durables basees sur la confiance.`;
			updateMutation.mutate({ generatedStatement: statement });
		}
	}, [brandData, updateMutation]);

	// Generate UVP
	const generatedUVP = useMemo(() => {
		const { problem, solution, benefit, differentiator } = uvpData;
		if (problem && solution && benefit && differentiator) {
			return `Pour ${problem}, je propose ${solution} qui permet de ${benefit}, contrairement a d'autres car ${differentiator}.`;
		}
		return "";
	}, [uvpData]);

	// Calculate audit scores
	const socialScore = useMemo(() => {
		const total = SOCIAL_MEDIA_CHECKLIST.length;
		const checked = Object.values(socialChecked).filter(Boolean).length;
		return Math.round((checked / total) * 100);
	}, [socialChecked, SOCIAL_MEDIA_CHECKLIST.length]);

	const websiteScore = useMemo(() => {
		const total = WEBSITE_CHECKLIST.length;
		const checked = Object.values(websiteChecked).filter(Boolean).length;
		return Math.round((checked / total) * 100);
	}, [websiteChecked, WEBSITE_CHECKLIST.length]);

	const overallBrandScore = useMemo(() => {
		let score = 0;
		let maxScore = 0;

		// Brand Statement (25 points)
		maxScore += 25;
		if (generatedStatement) score += 25;

		// UVP (20 points)
		maxScore += 20;
		if (generatedUVP) score += 20;

		// Logo Concept (15 points)
		maxScore += 15;
		if (selectedLogo) score += 15;

		// Color Palette (15 points)
		maxScore += 15;
		if (selectedPalette) score += 15;

		// Voice/Tone (10 points)
		maxScore += 10;
		if (selectedVoice) score += 10;

		// Social Media (10 points based on percentage)
		maxScore += 10;
		score += (socialScore / 100) * 10;

		// Website (5 points based on percentage)
		maxScore += 5;
		score += (websiteScore / 100) * 5;

		return Math.round((score / maxScore) * 100);
	}, [generatedStatement, generatedUVP, selectedLogo, selectedPalette, selectedVoice, socialScore, websiteScore]);

	// Copy to clipboard
	const copyToClipboard = useCallback((text: string) => {
		navigator.clipboard.writeText(text);
	}, []);

	// Wizard navigation
	const nextStep = useCallback(() => {
		if (wizardStep < 5) {
			setWizardStep((s) => s + 1);
		} else {
			generateBrandStatement();
		}
	}, [wizardStep, generateBrandStatement]);

	const prevStep = useCallback(() => {
		if (wizardStep > 1) {
			setWizardStep((s) => s - 1);
		}
	}, [wizardStep]);

	// Wizard step validation
	const isStepValid = useMemo(() => {
		switch (wizardStep) {
			case 1:
				return brandData.profession.length > 0;
			case 2:
				return brandData.targetAudience.length > 0;
			case 3:
				return brandData.uniqueStrength.length > 0;
			case 4:
				return brandData.valueProvided.length > 0;
			case 5:
				return brandData.personality.length > 0;
			default:
				return false;
		}
	}, [wizardStep, brandData]);

	return {
		// Config data
		LOGO_CONCEPTS,
		COLOR_PALETTES,
		VOICE_TONES,
		SOCIAL_MEDIA_CHECKLIST,
		WEBSITE_CHECKLIST,
		PROFESSION_EXAMPLES,
		AUDIENCE_EXAMPLES,
		STRENGTH_EXAMPLES,
		VALUE_EXAMPLES,
		PERSONALITY_TRAITS,

		// UI state
		wizardStep,
		activeTab,
		setActiveTab,

		// Brand data
		brandData,
		generatedStatement,
		uvpData,
		generatedUVP,

		// Visual identity
		selectedLogo,
		selectedPalette,

		// Voice
		selectedVoice,

		// Checklists
		socialChecked,
		websiteChecked,

		// Mutations
		updateMutation,
		toggleSocialMutation,
		toggleWebsiteMutation,

		// Scores
		socialScore,
		websiteScore,
		overallBrandScore,

		// Actions
		copyToClipboard,
		nextStep,
		prevStep,
		isStepValid,
	};
}

export type BrandingHookReturn = ReturnType<typeof useBrandingData>;
