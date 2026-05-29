import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import {
	BriefcaseIcon,
	CheckCircleIcon,
	ListChecksIcon,
	SunIcon,
	TShirtIcon,
	UsersIcon,
	VideoIcon,
	WatchIcon,
} from "@phosphor-icons/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useState } from "react";
import { ErrorComponent } from "@/components/error-component";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { authClient } from "@/integrations/auth/client";
import { orpc } from "@/integrations/orpc/client";
import { DashboardHeader } from "../-components/header";
import {
	AccessoriesTabContent,
	ChecklistTabContent,
	CultureTabContent,
	DosDontsTabContent,
	IndustryTabContent,
	OutfitHeroSection,
	OutfitPrintStyles,
	QuickLinksSection,
	SeasonalTabContent,
	VirtualInterviewTabContent,
} from "./-components/outfit-components";
import { cultureQuestions, industryConfigs, preparationChecklist } from "./-components/outfit-config";

// biome-ignore lint/suspicious/noExplicitAny: Route path not in generated route tree
export const Route = createFileRoute("/dashboard/interview/outfit" as any)({
	component: InterviewOutfitAdvisorPage,
	errorComponent: ErrorComponent,
});

function InterviewOutfitAdvisorPage() {
	const queryClient = useQueryClient();
	const { data: session } = authClient.useSession();

	// State
	const [selectedIndustry, setSelectedIndustry] = useState<string>("corporate");
	const [expandedSection, setExpandedSection] = useState<string | null>(null);
	const [cultureAnswers, setCultureAnswers] = useState<Record<string, string>>({});
	const [showCultureResult, setShowCultureResult] = useState(false);

	// Fetch checked items from database
	const {
		data: checkedItemsArray = [],
		isLoading,
		isError,
	} = useQuery({ ...orpc.outfitChecklist.getCheckedItems.queryOptions(), enabled: !!session?.user });

	// Convert array to Set for easier lookup
	const checkedItems = new Set(checkedItemsArray);

	// Toggle mutation
	const toggleMutation = useMutation({
		mutationFn: (itemId: string) => orpc.outfitChecklist.toggleItem.call({ itemId }),
		onMutate: async (itemId) => {
			// Cancel any outgoing refetches
			await queryClient.cancelQueries({ queryKey: orpc.outfitChecklist.getCheckedItems.queryOptions().queryKey });

			// Snapshot the previous value
			const previousItems = queryClient.getQueryData<string[]>(
				orpc.outfitChecklist.getCheckedItems.queryOptions().queryKey,
			);

			// Optimistically update to the new value
			queryClient.setQueryData<string[]>(orpc.outfitChecklist.getCheckedItems.queryOptions().queryKey, (old = []) => {
				if (old.includes(itemId)) {
					return old.filter((id) => id !== itemId);
				}
				return [...old, itemId];
			});

			// Return a context object with the snapshotted value
			return { previousItems };
		},
		onError: (_err, _itemId, context) => {
			// If the mutation fails, use the context returned from onMutate to roll back
			if (context?.previousItems) {
				queryClient.setQueryData(orpc.outfitChecklist.getCheckedItems.queryOptions().queryKey, context.previousItems);
			}
		},
		onSettled: () => {
			// Always refetch after error or success
			queryClient.invalidateQueries({ queryKey: orpc.outfitChecklist.getCheckedItems.queryOptions().queryKey });
		},
	});

	// Toggle checklist item
	const toggleChecklistItem = useCallback(
		(itemId: string) => {
			toggleMutation.mutate(itemId);
		},
		[toggleMutation],
	);

	// Toggle expand section
	const toggleSection = useCallback((sectionId: string) => {
		setExpandedSection((prev) => (prev === sectionId ? null : sectionId));
	}, []);

	// Calculate culture formality score
	const calculateFormalityScore = useCallback(() => {
		const answeredQuestions = Object.keys(cultureAnswers).length;
		if (answeredQuestions === 0) return 0;

		let totalScore = 0;
		for (const question of cultureQuestions) {
			const answer = cultureAnswers[question.id];
			if (answer) {
				const option = question.options.find((o) => o.value === answer);
				if (option) {
					totalScore += option.formalityScore;
				}
			}
		}
		return Math.round((totalScore / (answeredQuestions * 5)) * 100);
	}, [cultureAnswers]);

	// Get formality recommendation
	const getFormalityRecommendation = useCallback(() => {
		const score = calculateFormalityScore();
		if (score >= 80) {
			return {
				level: t`Tres formel`,
				description: t`Optez pour une tenue tres formelle : costume complet, couleurs neutres, accessoires classiques.`,
				color: "text-blue-600",
			};
		}
		if (score >= 60) {
			return {
				level: t`Formel`,
				description: t`Une tenue professionnelle formelle est recommandee : costume ou tailleur, chemise ou chemisier.`,
				color: "text-indigo-600",
			};
		}
		if (score >= 40) {
			return {
				level: t`Business casual`,
				description: t`Adoptez un style business casual : pantalon habille, chemise, cravate non obligatoire.`,
				color: "text-purple-600",
			};
		}
		return {
			level: t`Smart casual`,
			description: t`Un style smart casual convient : jean fonce, polo ou chemise decontractee.`,
			color: "text-pink-600",
		};
	}, [calculateFormalityScore]);

	// Checklist progress
	const checklistProgress = Math.round((checkedItems.size / preparationChecklist.length) * 100);

	// Get selected industry config
	const selectedIndustryConfig = industryConfigs.find((i) => i.id === selectedIndustry);

	return (
		<>
			<DashboardHeader icon={TShirtIcon} title={t`Conseils de tenue pour l'entretien`} />

			<OutfitHeroSection />

			{/* Main Content Tabs */}
			<Tabs defaultValue="industry" className="space-y-6">
				<TabsList className="flex h-auto flex-wrap justify-start gap-2 bg-transparent p-0 print:hidden">
					<TabsTrigger
						value="industry"
						className="flex items-center gap-2 rounded-lg border bg-card px-4 py-2.5 data-[state=active]:border-primary data-[state=active]:bg-primary/5"
					>
						<BriefcaseIcon className="size-4 text-blue-600" weight="duotone" />
						<span>
							<Trans>Par secteur</Trans>
						</span>
					</TabsTrigger>
					<TabsTrigger
						value="culture"
						className="flex items-center gap-2 rounded-lg border bg-card px-4 py-2.5 data-[state=active]:border-primary data-[state=active]:bg-primary/5"
					>
						<UsersIcon className="size-4 text-purple-600" weight="duotone" />
						<span>
							<Trans>Culture d'entreprise</Trans>
						</span>
					</TabsTrigger>
					<TabsTrigger
						value="seasonal"
						className="flex items-center gap-2 rounded-lg border bg-card px-4 py-2.5 data-[state=active]:border-primary data-[state=active]:bg-primary/5"
					>
						<SunIcon className="size-4 text-amber-500" weight="duotone" />
						<span>
							<Trans>Saisons</Trans>
						</span>
					</TabsTrigger>
					<TabsTrigger
						value="virtual"
						className="flex items-center gap-2 rounded-lg border bg-card px-4 py-2.5 data-[state=active]:border-primary data-[state=active]:bg-primary/5"
					>
						<VideoIcon className="size-4 text-green-600" weight="duotone" />
						<span>
							<Trans>Entretien en visio</Trans>
						</span>
					</TabsTrigger>
					<TabsTrigger
						value="dos-donts"
						className="flex items-center gap-2 rounded-lg border bg-card px-4 py-2.5 data-[state=active]:border-primary data-[state=active]:bg-primary/5"
					>
						<CheckCircleIcon className="size-4 text-green-600" weight="duotone" />
						<span>
							<Trans>À faire / À éviter</Trans>
						</span>
					</TabsTrigger>
					<TabsTrigger
						value="accessories"
						className="flex items-center gap-2 rounded-lg border bg-card px-4 py-2.5 data-[state=active]:border-primary data-[state=active]:bg-primary/5"
					>
						<WatchIcon className="size-4 text-indigo-600" weight="duotone" />
						<span>
							<Trans>Accessoires</Trans>
						</span>
					</TabsTrigger>
					<TabsTrigger
						value="checklist"
						className="flex items-center gap-2 rounded-lg border bg-card px-4 py-2.5 data-[state=active]:border-primary data-[state=active]:bg-primary/5"
					>
						<ListChecksIcon className="size-4 text-teal-600" weight="duotone" />
						<span>
							<Trans>Liste</Trans>
						</span>
					</TabsTrigger>
				</TabsList>

				<TabsContent value="industry" className="mt-0 space-y-6">
					<IndustryTabContent
						selectedIndustry={selectedIndustry}
						setSelectedIndustry={setSelectedIndustry}
						selectedIndustryConfig={selectedIndustryConfig}
					/>
				</TabsContent>

				<TabsContent value="culture" className="mt-0 space-y-6">
					<CultureTabContent
						cultureAnswers={cultureAnswers}
						setCultureAnswers={setCultureAnswers}
						showCultureResult={showCultureResult}
						setShowCultureResult={setShowCultureResult}
						calculateFormalityScore={calculateFormalityScore}
						getFormalityRecommendation={getFormalityRecommendation}
					/>
				</TabsContent>

				<TabsContent value="seasonal" className="mt-0 space-y-6">
					<SeasonalTabContent expandedSection={expandedSection} toggleSection={toggleSection} />
				</TabsContent>

				<TabsContent value="virtual" className="mt-0 space-y-6">
					<VirtualInterviewTabContent />
				</TabsContent>

				<TabsContent value="dos-donts" className="mt-0 space-y-6">
					<DosDontsTabContent />
				</TabsContent>

				<TabsContent value="accessories" className="mt-0 space-y-6">
					<AccessoriesTabContent />
				</TabsContent>

				<TabsContent value="checklist" className="mt-0 space-y-6">
					<ChecklistTabContent
						checkedItems={checkedItems}
						checklistProgress={checklistProgress}
						isLoading={isLoading}
						isError={isError}
						toggleChecklistItem={toggleChecklistItem}
						toggleMutation={toggleMutation}
					/>
				</TabsContent>
			</Tabs>

			<QuickLinksSection />

			<OutfitPrintStyles />
		</>
	);
}
