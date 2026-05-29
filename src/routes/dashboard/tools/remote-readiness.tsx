import { t } from "@lingui/core/macro";
import {
	ChartLineUpIcon,
	CheckCircleIcon,
	HouseLineIcon,
	LightbulbIcon,
	ListChecksIcon,
	TrendUpIcon,
	WrenchIcon,
} from "@phosphor-icons/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useMemo, useState } from "react";
import { ErrorComponent } from "@/components/error-component";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { authClient } from "@/integrations/auth/client";
import { orpc } from "@/integrations/orpc/client";

import { DashboardHeader } from "../-components/header";
import {
	ChecklistTabContent,
	HeroSection,
	OfficeTabContent,
	ProgressTabContent,
	QuizActive,
	QuizStartCard,
	ResultsTabContent,
	TipsTabContent,
	ToolsTabContent,
} from "./-components/remote-readiness-components";
import {
	CATEGORY_CONFIG,
	CHECKLIST_ITEMS,
	HOME_OFFICE_ITEMS,
	PRODUCTIVITY_TIPS,
} from "./-components/remote-readiness-data";
import type {
	ImprovementTask,
	QuizAnswer,
	QuizQuestion,
	ReadinessLevel,
	ReadinessResult,
	SkillCategory,
} from "./-components/remote-readiness-types";
import { calculateLevel, getImprovementDescription } from "./-components/remote-readiness-utils";

// biome-ignore lint/suspicious/noExplicitAny: Route path not in generated route tree
export const Route = createFileRoute("/dashboard/tools/remote-readiness" as any)({
	component: RemoteReadinessChecker,
	errorComponent: ErrorComponent,
});

// =============================================================================
// COMPONENT
// =============================================================================

function RemoteReadinessChecker() {
	const { data: session } = authClient.useSession();
	const queryClient = useQueryClient();

	// Local UI state
	const [activeTab, setActiveTab] = useState("quiz");
	const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
	const [answers, setAnswers] = useState<QuizAnswer[]>([]);
	const [selectedOption, setSelectedOption] = useState<string | null>(null);
	const [quizStarted, setQuizStarted] = useState(false);
	const [currentResult, setCurrentResult] = useState<ReadinessResult | null>(null);
	const [currentTipIndex, setCurrentTipIndex] = useState(0);

	// =============================================================================
	// QUERIES
	// =============================================================================

	const { data: dbQuestions } = useQuery({
		...orpc.careerQuizQuestions.listWithOptions.queryOptions({
			input: { quizType: "remote_readiness", activeOnly: true },
		}),
		enabled: !!session?.user,
	});

	const quizQuestions = useMemo((): QuizQuestion[] => {
		if (!dbQuestions || dbQuestions.length === 0) return [];
		return dbQuestions.map((q) => ({
			id: q.id,
			question: q.question,
			category: q.category as SkillCategory,
			options: (q.options ?? []).map((opt) => ({
				id: opt.id,
				text: opt.text,
				score: (opt.scores as Record<string, number>)?.score ?? 0,
			})),
		}));
	}, [dbQuestions]);

	const totalQuestions = quizQuestions.length;

	const {
		data: results = [],
		isLoading: resultsLoading,
		isError: resultsError,
	} = useQuery({
		...orpc.remoteReadiness.getResults.queryOptions(),
		staleTime: 5 * 60 * 1000,
		enabled: !!session?.user,
	});

	const {
		data: checklistCheckedItems = [],
		isLoading: checklistLoading,
		isError: checklistError,
	} = useQuery({
		...orpc.remoteReadiness.getChecklist.queryOptions(),
		staleTime: 5 * 60 * 1000,
		enabled: !!session?.user,
	});

	const {
		data: officeCheckedItems = [],
		isLoading: officeLoading,
		isError: officeError,
	} = useQuery({
		...orpc.remoteReadiness.getOfficeItems.queryOptions(),
		staleTime: 5 * 60 * 1000,
		enabled: !!session?.user,
	});

	const {
		data: improvements = [],
		isLoading: improvementsLoading,
		isError: improvementsError,
	} = useQuery({
		...orpc.remoteReadiness.getImprovements.queryOptions(),
		staleTime: 5 * 60 * 1000,
		enabled: !!session?.user,
	});

	// =============================================================================
	// MUTATIONS
	// =============================================================================

	const saveResultMutation = useMutation({
		mutationFn: (data: {
			totalScore: number;
			maxScore: number;
			percentage: number;
			level: ReadinessLevel;
			categoryScores: Record<SkillCategory, { score: number; maxScore: number; percentage: number }>;
		}) => orpc.remoteReadiness.saveResult.call(data),
		onSuccess: (result) => {
			queryClient.invalidateQueries({ queryKey: orpc.remoteReadiness.getResults.queryOptions().queryKey });
			setCurrentResult(result as ReadinessResult);
		},
	});

	const toggleChecklistMutation = useMutation({
		mutationFn: (itemId: string) => orpc.remoteReadiness.toggleChecklistItem.call({ itemId }),
		onMutate: async (itemId) => {
			await queryClient.cancelQueries({ queryKey: orpc.remoteReadiness.getChecklist.queryOptions().queryKey });
			const previousItems = queryClient.getQueryData<string[]>(
				orpc.remoteReadiness.getChecklist.queryOptions().queryKey,
			);
			queryClient.setQueryData<string[]>(orpc.remoteReadiness.getChecklist.queryOptions().queryKey, (old = []) => {
				if (old.includes(itemId)) {
					return old.filter((id) => id !== itemId);
				}
				return [...old, itemId];
			});
			return { previousItems };
		},
		onError: (_err, _itemId, context) => {
			if (context?.previousItems) {
				queryClient.setQueryData(orpc.remoteReadiness.getChecklist.queryOptions().queryKey, context.previousItems);
			}
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: orpc.remoteReadiness.getChecklist.queryOptions().queryKey });
		},
	});

	const toggleOfficeMutation = useMutation({
		mutationFn: (itemId: string) => orpc.remoteReadiness.toggleOfficeItem.call({ itemId }),
		onMutate: async (itemId) => {
			await queryClient.cancelQueries({ queryKey: orpc.remoteReadiness.getOfficeItems.queryOptions().queryKey });
			const previousItems = queryClient.getQueryData<string[]>(
				orpc.remoteReadiness.getOfficeItems.queryOptions().queryKey,
			);
			queryClient.setQueryData<string[]>(orpc.remoteReadiness.getOfficeItems.queryOptions().queryKey, (old = []) => {
				if (old.includes(itemId)) {
					return old.filter((id) => id !== itemId);
				}
				return [...old, itemId];
			});
			return { previousItems };
		},
		onError: (_err, _itemId, context) => {
			if (context?.previousItems) {
				queryClient.setQueryData(orpc.remoteReadiness.getOfficeItems.queryOptions().queryKey, context.previousItems);
			}
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: orpc.remoteReadiness.getOfficeItems.queryOptions().queryKey });
		},
	});

	const toggleImprovementMutation = useMutation({
		mutationFn: (improvementId: string) => orpc.remoteReadiness.toggleImprovement.call({ improvementId }),
		onMutate: async (improvementId) => {
			await queryClient.cancelQueries({ queryKey: orpc.remoteReadiness.getImprovements.queryOptions().queryKey });
			const previousItems = queryClient.getQueryData<ImprovementTask[]>(
				orpc.remoteReadiness.getImprovements.queryOptions().queryKey,
			);
			queryClient.setQueryData<ImprovementTask[]>(
				orpc.remoteReadiness.getImprovements.queryOptions().queryKey,
				(old = []) => old.map((item) => (item.id === improvementId ? { ...item, completed: !item.completed } : item)),
			);
			return { previousItems };
		},
		onError: (_err, _itemId, context) => {
			if (context?.previousItems) {
				queryClient.setQueryData(orpc.remoteReadiness.getImprovements.queryOptions().queryKey, context.previousItems);
			}
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: orpc.remoteReadiness.getImprovements.queryOptions().queryKey });
		},
	});

	const createImprovementsMutation = useMutation({
		mutationFn: (
			data: Array<{
				category: SkillCategory;
				title: string;
				description: string;
				priority: "high" | "medium" | "low";
			}>,
		) => orpc.remoteReadiness.createImprovements.call({ improvements: data }),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: orpc.remoteReadiness.getImprovements.queryOptions().queryKey });
		},
	});

	const clearImprovementsMutation = useMutation({
		mutationFn: () => orpc.remoteReadiness.clearImprovements.call(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: orpc.remoteReadiness.getImprovements.queryOptions().queryKey });
		},
	});

	// =============================================================================
	// COMPUTED VALUES
	// =============================================================================

	const currentQuestion = useMemo(() => quizQuestions[currentQuestionIndex], [quizQuestions, currentQuestionIndex]);
	const progress = useMemo(
		() => ((currentQuestionIndex + 1) / totalQuestions) * 100,
		[currentQuestionIndex, totalQuestions],
	);

	const radarData = useMemo(() => {
		if (!currentResult) return [];
		return (Object.entries(currentResult.categoryScores) as [SkillCategory, { percentage: number }][]).map(
			([category, data]) => ({
				skill: CATEGORY_CONFIG[category].label,
				score: data.percentage,
				fullMark: 100,
			}),
		);
	}, [currentResult]);

	const checklistProgress = useMemo(() => {
		const completed = checklistCheckedItems.length;
		return Math.round((completed / CHECKLIST_ITEMS.length) * 100);
	}, [checklistCheckedItems]);

	const officeProgress = useMemo(() => {
		const checked = officeCheckedItems.length;
		return Math.round((checked / HOME_OFFICE_ITEMS.length) * 100);
	}, [officeCheckedItems]);

	const improvementProgress = useMemo(() => {
		if (improvements.length === 0) return 0;
		const completed = improvements.filter((item) => item.completed).length;
		return Math.round((completed / improvements.length) * 100);
	}, [improvements]);

	// =============================================================================
	// HANDLERS
	// =============================================================================

	const startQuiz = useCallback(() => {
		setCurrentQuestionIndex(0);
		setAnswers([]);
		setSelectedOption(null);
		setQuizStarted(true);
		setCurrentResult(null);
	}, []);

	const handleSelectOption = useCallback((optionId: string) => {
		setSelectedOption(optionId);
	}, []);

	const finishQuiz = useCallback(
		async (finalAnswers: QuizAnswer[]) => {
			const categoryScores: Record<SkillCategory, { score: number; maxScore: number; percentage: number }> = {
				communication: { score: 0, maxScore: 0, percentage: 0 },
				time_management: { score: 0, maxScore: 0, percentage: 0 },
				tech_proficiency: { score: 0, maxScore: 0, percentage: 0 },
				self_discipline: { score: 0, maxScore: 0, percentage: 0 },
				home_office: { score: 0, maxScore: 0, percentage: 0 },
			};

			for (let i = 0; i < quizQuestions.length; i++) {
				const question = quizQuestions[i];
				const answer = finalAnswers[i];
				const category = question.category;
				const maxScore = Math.max(...question.options.map((o) => o.score));
				categoryScores[category].score += answer?.score || 0;
				categoryScores[category].maxScore += maxScore;
			}

			let totalScore = 0;
			let totalMaxScore = 0;
			for (const category of Object.keys(categoryScores) as SkillCategory[]) {
				const cat = categoryScores[category];
				cat.percentage = cat.maxScore > 0 ? Math.round((cat.score / cat.maxScore) * 100) : 0;
				totalScore += cat.score;
				totalMaxScore += cat.maxScore;
			}

			const percentage = Math.round((totalScore / totalMaxScore) * 100);
			const level = calculateLevel(percentage);

			await saveResultMutation.mutateAsync({ totalScore, maxScore: totalMaxScore, percentage, level, categoryScores });

			const newImprovements: Array<{
				category: SkillCategory;
				title: string;
				description: string;
				priority: "high" | "medium" | "low";
			}> = [];

			for (const [category, data] of Object.entries(categoryScores) as [SkillCategory, { percentage: number }][]) {
				if (data.percentage < 75) {
					const priority: "high" | "medium" | "low" =
						data.percentage < 50 ? "high" : data.percentage < 65 ? "medium" : "low";
					newImprovements.push({
						category,
						title: `Improve: ${CATEGORY_CONFIG[category].label}`,
						description: getImprovementDescription(category, data.percentage),
						priority,
					});
				}
			}

			if (newImprovements.length > 0) {
				await clearImprovementsMutation.mutateAsync();
				await createImprovementsMutation.mutateAsync(newImprovements);
			}

			setQuizStarted(false);
			setActiveTab("results");
		},
		[saveResultMutation, clearImprovementsMutation, createImprovementsMutation, quizQuestions],
	);

	const handleNextQuestion = useCallback(() => {
		if (!selectedOption || !currentQuestion) return;
		const selectedOpt = currentQuestion.options.find((o) => o.id === selectedOption);
		if (!selectedOpt) return;

		const answer: QuizAnswer = {
			questionId: currentQuestion.id,
			selectedOptionId: selectedOption,
			score: selectedOpt.score,
		};

		const newAnswers = [...answers, answer];
		setAnswers(newAnswers);
		setSelectedOption(null);

		if (currentQuestionIndex < totalQuestions - 1) {
			setCurrentQuestionIndex((prev) => prev + 1);
		} else {
			finishQuiz(newAnswers);
		}
	}, [selectedOption, currentQuestion, answers, currentQuestionIndex, finishQuiz, totalQuestions]);

	const handleChecklistToggle = useCallback(
		(itemId: string) => toggleChecklistMutation.mutate(itemId),
		[toggleChecklistMutation],
	);

	const handleOfficeToggle = useCallback(
		(itemId: string) => toggleOfficeMutation.mutate(itemId),
		[toggleOfficeMutation],
	);

	const handleImprovementToggle = useCallback(
		(itemId: string) => toggleImprovementMutation.mutate(itemId),
		[toggleImprovementMutation],
	);

	const nextTip = useCallback(() => {
		setCurrentTipIndex((prev) => (prev + 1) % PRODUCTIVITY_TIPS.length);
	}, []);

	const prevTip = useCallback(() => {
		setCurrentTipIndex((prev) => (prev - 1 + PRODUCTIVITY_TIPS.length) % PRODUCTIVITY_TIPS.length);
	}, []);

	const resetQuiz = useCallback(() => {
		setCurrentQuestionIndex(0);
		setAnswers([]);
		setSelectedOption(null);
		setQuizStarted(false);
		setCurrentResult(null);
	}, []);

	const isInitialLoading = resultsLoading || checklistLoading || officeLoading || improvementsLoading;

	// =============================================================================
	// RENDER
	// =============================================================================

	return (
		<>
			<DashboardHeader icon={HouseLineIcon} title={t`Remote Work Readiness Checker`} />

			<HeroSection totalQuestions={totalQuestions} resultsCount={results.length} isInitialLoading={isInitialLoading} />

			<Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
				<TabsList className="flex h-auto flex-wrap gap-2 bg-transparent p-0">
					{[
						{ value: "quiz", icon: ListChecksIcon, label: t`Quiz` },
						{ value: "results", icon: ChartLineUpIcon, label: t`Results` },
						{ value: "checklist", icon: CheckCircleIcon, label: t`Checklist` },
						{ value: "office", icon: HouseLineIcon, label: t`Office` },
						{ value: "tips", icon: LightbulbIcon, label: t`Tips` },
						{ value: "tools", icon: WrenchIcon, label: t`Tools` },
						{ value: "progress", icon: TrendUpIcon, label: t`Progress` },
					].map((tab) => (
						<TabsTrigger
							key={tab.value}
							value={tab.value}
							className="gap-2 rounded-full border border-transparent bg-muted/50 px-4 py-2 text-sm data-[state=active]:border-primary/30 data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
						>
							<tab.icon className="size-4" />
							{tab.label}
						</TabsTrigger>
					))}
				</TabsList>

				<TabsContent value="quiz" className="space-y-6">
					{!quizStarted ? (
						<QuizStartCard totalQuestions={totalQuestions} onStart={startQuiz} />
					) : (
						<QuizActive
							currentQuestion={currentQuestion}
							currentQuestionIndex={currentQuestionIndex}
							totalQuestions={totalQuestions}
							progress={progress}
							selectedOption={selectedOption}
							isSaving={saveResultMutation.isPending}
							onSelectOption={handleSelectOption}
							onNext={handleNextQuestion}
							onReset={resetQuiz}
						/>
					)}
				</TabsContent>

				<TabsContent value="results" className="space-y-8">
					<ResultsTabContent
						currentResult={currentResult}
						radarData={radarData}
						improvements={improvements}
						resultsLoading={resultsLoading}
						resultsError={resultsError}
						onSetActiveTab={setActiveTab}
					/>
				</TabsContent>

				<TabsContent value="checklist" className="space-y-6">
					<ChecklistTabContent
						checklistCheckedItems={checklistCheckedItems}
						checklistProgress={checklistProgress}
						checklistLoading={checklistLoading}
						checklistError={checklistError}
						isToggling={toggleChecklistMutation.isPending}
						togglingItemId={toggleChecklistMutation.variables}
						onToggle={handleChecklistToggle}
					/>
				</TabsContent>

				<TabsContent value="office" className="space-y-6">
					<OfficeTabContent
						officeCheckedItems={officeCheckedItems}
						officeProgress={officeProgress}
						officeLoading={officeLoading}
						officeError={officeError}
						isToggling={toggleOfficeMutation.isPending}
						togglingItemId={toggleOfficeMutation.variables}
						onToggle={handleOfficeToggle}
					/>
				</TabsContent>

				<TabsContent value="tips" className="space-y-6">
					<TipsTabContent
						currentTipIndex={currentTipIndex}
						onNextTip={nextTip}
						onPrevTip={prevTip}
						onSetTipIndex={setCurrentTipIndex}
					/>
				</TabsContent>

				<TabsContent value="tools" className="space-y-6">
					<ToolsTabContent />
				</TabsContent>

				<TabsContent value="progress" className="space-y-6">
					<ProgressTabContent
						checklistProgress={checklistProgress}
						officeProgress={officeProgress}
						improvementProgress={improvementProgress}
						improvements={improvements}
						results={results}
						checklistLoading={checklistLoading}
						officeLoading={officeLoading}
						improvementsLoading={improvementsLoading}
						improvementsError={improvementsError}
						resultsLoading={resultsLoading}
						isImprovementToggling={toggleImprovementMutation.isPending}
						improvementTogglingId={toggleImprovementMutation.variables}
						onImprovementToggle={handleImprovementToggle}
						onViewResult={(result) => {
							setCurrentResult(result as ReadinessResult);
							setActiveTab("results");
						}}
						onSetActiveTab={setActiveTab}
					/>
				</TabsContent>
			</Tabs>
		</>
	);
}
