import { t } from "@lingui/core/macro";
import { BriefcaseIcon } from "@phosphor-icons/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import { ErrorComponent } from "@/components/error-component";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { authClient } from "@/integrations/auth/client";
import { orpc } from "@/integrations/orpc/client";
import { DashboardHeader } from "../-components/header";

import {
	AchievementsTab,
	ActionVerbsTab,
	containerVariants,
	HeroSection,
	ImpactGeneratorTab,
	IndustryTab,
	itemVariants,
	LoadingSkeleton,
	PreviewTab,
	ProTipsSection,
	QuantificationTab,
	RefinementTab,
	TAB_DEFINITIONS,
} from "./-components/experience-optimizer-components";
import { defaultBeforeAfterExamples, industryOptimizations } from "./-components/experience-optimizer-config";
import type { ActionVerb, Industry, VerbCategory } from "./-components/experience-optimizer-types";

// biome-ignore lint/suspicious/noExplicitAny: Route path not in generated route tree
export const Route = createFileRoute("/dashboard/resumes/experience-optimizer" as any)({
	component: ExperienceOptimizerComponent,
	errorComponent: ErrorComponent,
});

function ExperienceOptimizerComponent() {
	const { data: session } = authClient.useSession();
	const queryClient = useQueryClient();
	const [activeTab, setActiveTab] = useState("impact-generator");
	const [selectedVerbCategory, setSelectedVerbCategory] = useState<VerbCategory>("leadership");
	const [inputText, setInputText] = useState("");
	const [optimizedText, setOptimizedText] = useState("");
	const [isOptimizing, setIsOptimizing] = useState(false);

	// ==========================================================================
	// DATABASE QUERIES
	// ==========================================================================

	const { data: userExamples = [], isLoading: isLoadingExamples } = useQuery({
		...orpc.experienceOptimizer.getBeforeAfterExamples.queryOptions({}),
		enabled: !!session?.user,
	});

	const { data: userActionVerbs = [] } = useQuery({
		...orpc.experienceOptimizer.getActionVerbs.queryOptions({}),
		enabled: !!session?.user,
	});

	const { data: optimizationHistory = [] } = useQuery({
		...orpc.experienceOptimizer.getOptimizationHistory.queryOptions({ limit: 20 }),
		enabled: !!session?.user,
	});

	const { data: industryPreference, isLoading: isLoadingPreference } = useQuery({
		...orpc.experienceOptimizer.getIndustryPreference.queryOptions({}),
		enabled: !!session?.user,
	});

	const { data: expandedTips = [] } = useQuery({
		...orpc.experienceOptimizer.getExpandedTips.queryOptions({}),
		enabled: !!session?.user,
	});

	const selectedIndustry = (industryPreference?.selectedIndustry ?? "general") as Industry;

	const allBeforeAfterExamples = useMemo(() => {
		const userExamplesList = userExamples.map((e) => ({
			id: e.id,
			before: e.before,
			after: e.after,
			improvement: e.improvement,
			category: e.category,
		}));
		return [...defaultBeforeAfterExamples, ...userExamplesList];
	}, [userExamples]);

	// ==========================================================================
	// MUTATIONS
	// ==========================================================================

	const createHistoryMutation = useMutation(
		orpc.experienceOptimizer.createOptimizationHistory.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries({ queryKey: ["experienceOptimizer", "getOptimizationHistory"] });
			},
		}),
	);

	const updateIndustryMutation = useMutation(
		orpc.experienceOptimizer.upsertIndustryPreference.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries({ queryKey: ["experienceOptimizer", "getIndustryPreference"] });
			},
		}),
	);

	const addFavoriteKeywordMutation = useMutation(
		orpc.experienceOptimizer.addFavoriteKeyword.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries({ queryKey: ["experienceOptimizer", "getIndustryPreference"] });
				toast.success(t`Mot-clé ajouté aux favoris`);
			},
		}),
	);

	const addFavoritePhraseMutation = useMutation(
		orpc.experienceOptimizer.addFavoritePhrase.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries({ queryKey: ["experienceOptimizer", "getIndustryPreference"] });
				toast.success(t`Phrase ajoutée aux favoris`);
			},
		}),
	);

	const toggleExpandedTipMutation = useMutation(
		orpc.experienceOptimizer.toggleExpandedTip.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries({ queryKey: ["experienceOptimizer", "getExpandedTips"] });
			},
		}),
	);

	const createActionVerbMutation = useMutation(
		orpc.experienceOptimizer.createActionVerb.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries({ queryKey: ["experienceOptimizer", "getActionVerbs"] });
				toast.success(t`Verbe d'action ajouté aux favoris`);
			},
		}),
	);

	// ==========================================================================
	// HANDLERS
	// ==========================================================================

	const copyToClipboard = useCallback((text: string) => {
		navigator.clipboard.writeText(text);
		toast.success(t`Copié dans le presse-papiers`);
	}, []);

	const optimizeText = useCallback(async () => {
		if (!inputText.trim()) {
			toast.error(t`Veuillez saisir un texte à améliorer`);
			return;
		}
		setIsOptimizing(true);

		await new Promise((resolve) => setTimeout(resolve, 1500));

		const cleanedInput = inputText
			.trim()
			.replace(
				/^(je\s+suis\s+|j['’]ai\s+|j['’]etais\s+|j['’]étais\s+|responsable\s+de\s+|chargé(?:e)?\s+de\s+|chargee\s+de\s+|en\s+charge\s+de\s+|i was\s+|i have\s+|responsible for\s+|in charge of\s+)/i,
				"",
			);
		const optimized = `${cleanedInput.charAt(0).toUpperCase()}${cleanedInput.slice(1)}`;
		const enhanced =
			optimized.includes("%") || optimized.includes("MAD") || optimized.includes("DH") || optimized.includes("+")
				? optimized
				: `${optimized}, avec un gain estimé de 25 % sur la performance et une réduction des coûts de 15 %`;

		setOptimizedText(enhanced);
		setIsOptimizing(false);

		createHistoryMutation.mutate({
			inputText: inputText.trim(),
			outputText: enhanced,
			industry: selectedIndustry,
		});

		toast.success(t`Texte amélioré`);
	}, [inputText, selectedIndustry, createHistoryMutation]);

	const handleToggleTip = useCallback(
		(tipId: string) => {
			toggleExpandedTipMutation.mutate({ tipId });
		},
		[toggleExpandedTipMutation],
	);

	const handleIndustryChange = useCallback(
		(value: Industry) => {
			updateIndustryMutation.mutate({ selectedIndustry: value });
		},
		[updateIndustryMutation],
	);

	const handleSaveKeyword = useCallback(
		(keyword: string) => {
			addFavoriteKeywordMutation.mutate({ keyword });
		},
		[addFavoriteKeywordMutation],
	);

	const handleSavePhrase = useCallback(
		(phrase: string) => {
			addFavoritePhraseMutation.mutate({ phrase });
		},
		[addFavoritePhraseMutation],
	);

	const handleSaveActionVerb = useCallback(
		(verb: ActionVerb, category: VerbCategory) => {
			createActionVerbMutation.mutate({
				verb: verb.verb,
				description: verb.description,
				example: verb.example,
				category,
				isFavorite: true,
			});
		},
		[createActionVerbMutation],
	);

	const currentIndustry = industryOptimizations[selectedIndustry];

	// ==========================================================================
	// LOADING STATE
	// ==========================================================================

	if (isLoadingExamples || isLoadingPreference) {
		return (
			<div className="space-y-8">
				<DashboardHeader icon={BriefcaseIcon} title={t`Optimiseur d'expérience professionnelle`} />
				<LoadingSkeleton />
			</div>
		);
	}

	// ==========================================================================
	// RENDER
	// ==========================================================================

	return (
		<motion.div className="space-y-8" initial="hidden" animate="visible" variants={containerVariants}>
			<DashboardHeader icon={BriefcaseIcon} title={t`Optimiseur d'expérience professionnelle`} />

			<HeroSection optimizationHistoryLength={optimizationHistory.length} />

			<Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
				<motion.div variants={itemVariants}>
					<TabsList className="flex h-auto flex-wrap gap-2 bg-transparent p-0">
						{TAB_DEFINITIONS.map((tab) => (
							<TabsTrigger
								key={tab.value}
								value={tab.value}
								className="gap-2 rounded-full border border-transparent bg-muted/50 px-4 py-2 data-[state=active]:border-primary/30 data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
							>
								<tab.icon className="size-4" />
								{tab.label()}
							</TabsTrigger>
						))}
					</TabsList>
				</motion.div>

				<TabsContent value="impact-generator" className="space-y-6">
					<ImpactGeneratorTab
						allBeforeAfterExamples={allBeforeAfterExamples}
						copyToClipboard={copyToClipboard}
						inputText={inputText}
						setInputText={setInputText}
						optimizeText={optimizeText}
						isOptimizing={isOptimizing}
						optimizedText={optimizedText}
					/>
				</TabsContent>

				<TabsContent value="action-verbs" className="space-y-6">
					<ActionVerbsTab
						selectedVerbCategory={selectedVerbCategory}
						setSelectedVerbCategory={setSelectedVerbCategory}
						copyToClipboard={copyToClipboard}
						handleSaveActionVerb={handleSaveActionVerb}
						userActionVerbs={userActionVerbs}
					/>
				</TabsContent>

				<TabsContent value="quantification" className="space-y-6">
					<QuantificationTab />
				</TabsContent>

				<TabsContent value="refinement" className="space-y-6">
					<RefinementTab copyToClipboard={copyToClipboard} />
				</TabsContent>

				<TabsContent value="achievements" className="space-y-6">
					<AchievementsTab expandedTips={expandedTips} handleToggleTip={handleToggleTip} />
				</TabsContent>

				<TabsContent value="industry" className="space-y-6">
					<IndustryTab
						selectedIndustry={selectedIndustry}
						handleIndustryChange={handleIndustryChange}
						currentIndustry={currentIndustry}
						copyToClipboard={copyToClipboard}
						handleSaveKeyword={handleSaveKeyword}
						handleSavePhrase={handleSavePhrase}
						industryPreference={industryPreference}
					/>
				</TabsContent>

				<TabsContent value="preview" className="space-y-6">
					<PreviewTab allBeforeAfterExamples={allBeforeAfterExamples} copyToClipboard={copyToClipboard} />
				</TabsContent>
			</Tabs>

			<ProTipsSection />
		</motion.div>
	);
}
