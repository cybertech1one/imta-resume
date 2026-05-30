import { t } from "@lingui/core/macro";
import { HeartIcon } from "@phosphor-icons/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useMemo, useState } from "react";
import { ErrorComponent } from "@/components/error-component";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { authClient } from "@/integrations/auth/client";
import { orpc } from "@/integrations/orpc/client";

import { DashboardHeader } from "../-components/header";
import {
	CompaniesTab,
	CompareTab,
	CompatibilityTab,
	CultureMatchError,
	CultureMatchLoading,
	HeroSection,
	ProfileTab,
	QuestionsTab,
	RedFlagsTab,
	TAB_ITEMS,
	ValuesTab,
	WorkStyleTab,
} from "./-components/culture-match-components";
import { COMPANY_PROFILES, VALUES_QUESTIONS, WORK_STYLE_QUESTIONS } from "./-components/culture-match-data";
import type { PersonalCultureProfile } from "./-components/culture-match-types";

// biome-ignore lint/suspicious/noExplicitAny: Route path not in generated route tree
export const Route = createFileRoute("/dashboard/jobs/culture-match" as any)({
	component: CultureMatchPage,
	errorComponent: ErrorComponent,
});

function CultureMatchPage() {
	const { data: session } = authClient.useSession();
	const queryClient = useQueryClient();

	// Local UI state
	const [activeTab, setActiveTab] = useState("work-style");
	const [currentWorkStyleQuestion, setCurrentWorkStyleQuestion] = useState(0);
	const [selectedCompanies, setSelectedCompanies] = useState<string[]>([]);
	const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null);

	// =============================================================================
	// QUERIES
	// =============================================================================

	const {
		data: assessment,
		isLoading,
		isError,
	} = useQuery({
		...orpc.cultureMatch.get.queryOptions(),
		enabled: !!session?.user,
	});

	// Extract data from assessment
	const workStyleAnswers = (assessment?.workStyleAnswers ?? {}) as Record<string, string>;
	const valuesScores = (assessment?.valuesScores ?? {}) as Record<string, number>;
	const redFlagsChecked = assessment?.redFlagsChecked ?? [];
	const personalProfile = assessment?.personalProfile as PersonalCultureProfile | null;

	// =============================================================================
	// MUTATIONS
	// =============================================================================

	const updateWorkStyleMutation = useMutation({
		mutationFn: (data: { questionId: string; optionId: string }) => orpc.cultureMatch.updateWorkStyleAnswer.call(data),
		onMutate: async ({ questionId, optionId }) => {
			await queryClient.cancelQueries({ queryKey: orpc.cultureMatch.get.queryOptions().queryKey });
			const previousData = queryClient.getQueryData(orpc.cultureMatch.get.queryOptions().queryKey);
			queryClient.setQueryData(orpc.cultureMatch.get.queryOptions().queryKey, (old: typeof assessment) => {
				if (!old) return old;
				return {
					...old,
					workStyleAnswers: { ...(old.workStyleAnswers as Record<string, string>), [questionId]: optionId },
				};
			});
			return { previousData };
		},
		onError: (_err, _vars, context) => {
			if (context?.previousData) {
				queryClient.setQueryData(orpc.cultureMatch.get.queryOptions().queryKey, context.previousData);
			}
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: orpc.cultureMatch.get.queryOptions().queryKey });
		},
	});

	const updateValuesScoreMutation = useMutation({
		mutationFn: (data: { questionId: string; score: number }) => orpc.cultureMatch.updateValuesScore.call(data),
		onMutate: async ({ questionId, score }) => {
			await queryClient.cancelQueries({ queryKey: orpc.cultureMatch.get.queryOptions().queryKey });
			const previousData = queryClient.getQueryData(orpc.cultureMatch.get.queryOptions().queryKey);
			queryClient.setQueryData(orpc.cultureMatch.get.queryOptions().queryKey, (old: typeof assessment) => {
				if (!old) return old;
				return {
					...old,
					valuesScores: { ...(old.valuesScores as Record<string, number>), [questionId]: score },
				};
			});
			return { previousData };
		},
		onError: (_err, _vars, context) => {
			if (context?.previousData) {
				queryClient.setQueryData(orpc.cultureMatch.get.queryOptions().queryKey, context.previousData);
			}
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: orpc.cultureMatch.get.queryOptions().queryKey });
		},
	});

	const toggleRedFlagMutation = useMutation({
		mutationFn: (flagId: string) => orpc.cultureMatch.toggleRedFlag.call({ flagId }),
		onMutate: async (flagId) => {
			await queryClient.cancelQueries({ queryKey: orpc.cultureMatch.get.queryOptions().queryKey });
			const previousData = queryClient.getQueryData(orpc.cultureMatch.get.queryOptions().queryKey);
			queryClient.setQueryData(orpc.cultureMatch.get.queryOptions().queryKey, (old: typeof assessment) => {
				if (!old) return old;
				const currentFlags = old.redFlagsChecked ?? [];
				const newFlags = currentFlags.includes(flagId)
					? currentFlags.filter((id) => id !== flagId)
					: [...currentFlags, flagId];
				return { ...old, redFlagsChecked: newFlags };
			});
			return { previousData };
		},
		onError: (_err, _vars, context) => {
			if (context?.previousData) {
				queryClient.setQueryData(orpc.cultureMatch.get.queryOptions().queryKey, context.previousData);
			}
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: orpc.cultureMatch.get.queryOptions().queryKey });
		},
	});

	const saveProfileMutation = useMutation({
		mutationFn: (profile: PersonalCultureProfile) => orpc.cultureMatch.saveProfile.call(profile),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: orpc.cultureMatch.get.queryOptions().queryKey });
		},
	});

	const resetMutation = useMutation({
		mutationFn: () => orpc.cultureMatch.reset.call(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: orpc.cultureMatch.get.queryOptions().queryKey });
			setCurrentWorkStyleQuestion(0);
			setSelectedCompanies([]);
		},
	});

	// =============================================================================
	// HANDLERS
	// =============================================================================

	const calculateProfile = useCallback((): PersonalCultureProfile => {
		const profile: PersonalCultureProfile = {
			workLifeBalance: 50,
			innovation: 50,
			collaboration: 50,
			growth: 50,
			diversity: 50,
			transparency: 50,
		};

		for (const [questionId, optionId] of Object.entries(workStyleAnswers)) {
			const question = WORK_STYLE_QUESTIONS.find((q) => q.id === questionId);
			if (question) {
				const option = question.options.find((o) => o.id === optionId);
				if (option) {
					for (const [key, value] of Object.entries(option.scores)) {
						if (key in profile) {
							profile[key as keyof PersonalCultureProfile] += value * 5;
						}
					}
				}
			}
		}

		for (const [questionId, score] of Object.entries(valuesScores)) {
			const question = VALUES_QUESTIONS.find((q) => q.id === questionId);
			if (question && question.dimension in profile) {
				profile[question.dimension as keyof PersonalCultureProfile] += (score - 3) * 8;
			}
		}

		for (const key of Object.keys(profile) as (keyof PersonalCultureProfile)[]) {
			profile[key] = Math.max(0, Math.min(100, profile[key]));
		}

		return profile;
	}, [workStyleAnswers, valuesScores]);

	const handleWorkStyleAnswer = useCallback(
		(questionId: string, optionId: string) => {
			updateWorkStyleMutation.mutate({ questionId, optionId });

			if (currentWorkStyleQuestion < WORK_STYLE_QUESTIONS.length - 1) {
				setTimeout(() => {
					setCurrentWorkStyleQuestion((prev) => prev + 1);
				}, 300);
			}
		},
		[currentWorkStyleQuestion, updateWorkStyleMutation],
	);

	const handleValuesScore = useCallback(
		(questionId: string, score: number) => {
			updateValuesScoreMutation.mutate({ questionId, score });
		},
		[updateValuesScoreMutation],
	);

	const handleRedFlagToggle = useCallback(
		(flagId: string) => {
			toggleRedFlagMutation.mutate(flagId);
		},
		[toggleRedFlagMutation],
	);

	const generateProfile = useCallback(() => {
		const profile = calculateProfile();
		saveProfileMutation.mutate(profile);
	}, [calculateProfile, saveProfileMutation]);

	const resetAssessment = useCallback(() => {
		resetMutation.mutate();
	}, [resetMutation]);

	// =============================================================================
	// COMPUTED VALUES
	// =============================================================================

	const companyCompatibility = useMemo(() => {
		if (!personalProfile) return [];

		return COMPANY_PROFILES.map((company) => {
			let totalDiff = 0;
			let dimensions = 0;

			for (const key of Object.keys(personalProfile) as (keyof PersonalCultureProfile)[]) {
				const userScore = personalProfile[key];
				const companyScore = company.cultureScores[key];
				totalDiff += Math.abs(userScore - companyScore);
				dimensions++;
			}

			const avgDiff = totalDiff / dimensions;
			const compatibility = Math.max(0, 100 - avgDiff);

			return {
				...company,
				compatibility: Math.round(compatibility),
			};
		}).sort((a, b) => b.compatibility - a.compatibility);
	}, [personalProfile]);

	const radarData = useMemo(() => {
		if (!personalProfile) return [];

		const labels: Record<keyof PersonalCultureProfile, string> = {
			workLifeBalance: "Equilibre vie-travail",
			innovation: "Innovation",
			collaboration: "Collaboration",
			growth: "Croissance",
			diversity: "Diversite",
			transparency: "Transparence",
		};

		return (Object.keys(personalProfile) as (keyof PersonalCultureProfile)[]).map((key) => ({
			dimension: labels[key],
			value: personalProfile[key],
			fullMark: 100,
		}));
	}, [personalProfile]);

	const comparisonRadarData = useMemo(() => {
		if (selectedCompanies.length === 0 || !personalProfile) return [];

		const labels: Record<keyof PersonalCultureProfile, string> = {
			workLifeBalance: "Equilibre",
			innovation: "Innovation",
			collaboration: "Collab.",
			growth: "Croissance",
			diversity: "Diversite",
			transparency: "Transparence",
		};

		return (Object.keys(personalProfile) as (keyof PersonalCultureProfile)[]).map((key) => {
			const dataPoint: Record<string, string | number> = {
				dimension: labels[key],
				"Your profile": personalProfile[key],
			};

			for (const companyId of selectedCompanies) {
				const company = COMPANY_PROFILES.find((c) => c.id === companyId);
				if (company) {
					dataPoint[company.name] = company.cultureScores[key];
				}
			}

			return dataPoint;
		});
	}, [selectedCompanies, personalProfile]);

	const toggleCompanyComparison = useCallback((companyId: string) => {
		setSelectedCompanies((prev) => {
			if (prev.includes(companyId)) {
				return prev.filter((id) => id !== companyId);
			}
			if (prev.length >= 2) {
				return [...prev.slice(1), companyId];
			}
			return [...prev, companyId];
		});
	}, []);

	// Progress calculations
	const workStyleProgress = (Object.keys(workStyleAnswers).length / WORK_STYLE_QUESTIONS.length) * 100;
	const valuesProgress = (Object.keys(valuesScores).length / VALUES_QUESTIONS.length) * 100;
	const overallProgress = (workStyleProgress + valuesProgress) / 2;

	// Loading state
	if (isLoading) {
		return (
			<>
				<DashboardHeader icon={HeartIcon} title={t`Compatibilité culturelle`} />
				<CultureMatchLoading />
			</>
		);
	}

	// Error state
	if (isError) {
		return (
			<>
				<DashboardHeader icon={HeartIcon} title={t`Compatibilité culturelle`} />
				<CultureMatchError
					onRetry={() => queryClient.invalidateQueries({ queryKey: orpc.cultureMatch.get.queryOptions().queryKey })}
				/>
			</>
		);
	}

	return (
		<>
			<DashboardHeader icon={HeartIcon} title={t`Compatibilité culturelle`} />

			<HeroSection overallProgress={overallProgress} />

			{/* Main Content */}
			<Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
				<TabsList className="flex h-auto flex-wrap gap-2 bg-transparent p-0">
					{TAB_ITEMS.map((tab) => (
						<TabsTrigger
							key={tab.value}
							value={tab.value}
							className="gap-2 rounded-full border border-transparent bg-muted/50 px-4 py-2 data-[state=active]:border-primary/30 data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
						>
							<tab.icon className="size-4" />
							{tab.label}
						</TabsTrigger>
					))}
				</TabsList>

				<TabsContent value="work-style" className="space-y-6">
					<WorkStyleTab
						currentWorkStyleQuestion={currentWorkStyleQuestion}
						workStyleProgress={workStyleProgress}
						workStyleAnswers={workStyleAnswers}
						isPending={updateWorkStyleMutation.isPending}
						onAnswer={handleWorkStyleAnswer}
						onNavigate={setCurrentWorkStyleQuestion}
					/>
				</TabsContent>

				<TabsContent value="values" className="space-y-6">
					<ValuesTab
						valuesScores={valuesScores}
						valuesProgress={valuesProgress}
						overallProgress={overallProgress}
						isPending={updateValuesScoreMutation.isPending}
						isSaving={saveProfileMutation.isPending}
						onScore={handleValuesScore}
						onGenerateProfile={generateProfile}
					/>
				</TabsContent>

				<TabsContent value="companies" className="space-y-6">
					<CompaniesTab />
				</TabsContent>

				<TabsContent value="compatibility" className="space-y-6">
					<CompatibilityTab
						personalProfile={personalProfile}
						radarData={radarData}
						companyCompatibility={companyCompatibility}
						onSwitchTab={setActiveTab}
					/>
				</TabsContent>

				<TabsContent value="red-flags" className="space-y-6">
					<RedFlagsTab
						redFlagsChecked={redFlagsChecked}
						isPending={toggleRedFlagMutation.isPending}
						onToggle={handleRedFlagToggle}
					/>
				</TabsContent>

				<TabsContent value="questions" className="space-y-6">
					<QuestionsTab expandedQuestion={expandedQuestion} onToggleExpand={setExpandedQuestion} />
				</TabsContent>

				<TabsContent value="compare" className="space-y-6">
					<CompareTab
						personalProfile={personalProfile}
						selectedCompanies={selectedCompanies}
						companyCompatibility={companyCompatibility}
						comparisonRadarData={comparisonRadarData}
						onToggleCompany={toggleCompanyComparison}
						onSwitchTab={setActiveTab}
					/>
				</TabsContent>

				<TabsContent value="profile" className="space-y-6">
					<ProfileTab
						personalProfile={personalProfile}
						radarData={radarData}
						companyCompatibility={companyCompatibility}
						workStyleProgress={workStyleProgress}
						valuesProgress={valuesProgress}
						isResetting={resetMutation.isPending}
						onReset={resetAssessment}
						onSwitchTab={setActiveTab}
					/>
				</TabsContent>
			</Tabs>
		</>
	);
}
