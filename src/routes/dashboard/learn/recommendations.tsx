import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import {
	BookOpenIcon,
	ChartBarIcon,
	LightbulbIcon,
	ShuffleIcon,
	SparkleIcon,
	TargetIcon,
	UsersIcon,
	WarningCircleIcon,
} from "@phosphor-icons/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense, useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import { ErrorComponent } from "@/components/error-component";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { authClient } from "@/integrations/auth/client";
import { orpc } from "@/integrations/orpc/client";
import { DashboardHeader } from "../-components/header";
import {
	ContinueLearningSection,
	ExploreTabContent,
	ForYouTabContent,
	GoalsTabContent,
	HeroSection,
	LoadingSkeleton,
	MentorsTabContent,
	ProgressTabContent,
} from "./-components/recommendations-components";
import type {
	CompletionStatus,
	DifficultyLevel,
	LearningResource,
	ResourceCompletion,
	ResourceType,
} from "./-components/recommendations-types";

const LearningRecommendationsLazy = lazy(() => Promise.resolve({ default: LearningRecommendations }));

// biome-ignore lint/suspicious/noExplicitAny: Route path not in generated route tree
export const Route = createFileRoute("/dashboard/learn/recommendations" as any)({
	component: () => (
		<Suspense
			fallback={
				<div className="flex items-center justify-center p-8">
					<Trans>Loading learning recommendations...</Trans>
				</div>
			}
		>
			<LearningRecommendationsLazy />
		</Suspense>
	),
	errorComponent: ErrorComponent,
});

function LearningRecommendations() {
	const { data: session } = authClient.useSession();
	const queryClient = useQueryClient();
	const [activeTab, setActiveTab] = useState("for-you");
	const [selectedType, setSelectedType] = useState<ResourceType | "all">("all");
	const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyLevel | "all">("all");

	const {
		data: recommendations = [],
		isLoading: isLoadingRecommendations,
		error: recommendationsError,
		refetch: refetchRecommendations,
	} = useQuery({
		...orpc.learningRecommendations.getActiveRecommendations.queryOptions({ input: { limit: 12 } }),
		enabled: !!session?.user,
	});

	const { data: resources = [], isLoading: isLoadingResources } = useQuery({
		...orpc.learningRecommendations.listResources.queryOptions({
			resourceType: selectedType === "all" ? undefined : selectedType,
			difficulty: selectedDifficulty === "all" ? undefined : selectedDifficulty,
			activeOnly: true,
			limit: 50,
		}),
		enabled: !!session?.user,
	});

	const { data: completions = [] } = useQuery({
		...orpc.learningRecommendations.getUserCompletions.queryOptions({ input: {} }),
		enabled: !!session?.user,
	});

	const { data: goals = [] } = useQuery({
		...orpc.learningRecommendations.getUserGoals.queryOptions({ input: { status: "active" } }),
		enabled: !!session?.user,
	});

	const { data: mentorMatches = [] } = useQuery({
		...orpc.learningRecommendations.connectWithMentors.queryOptions({ input: { skillId: "" } }),
		enabled: false,
	});

	const { data: statistics } = useQuery({
		...orpc.learningRecommendations.getStatistics.queryOptions({ input: {} }),
		enabled: !!session?.user,
	});

	const generateMutation = useMutation({
		...orpc.learningRecommendations.generateRecommendations.mutationOptions(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["learningRecommendations"] });
			toast.success(t`New recommendations generated`);
		},
		onError: (error) => {
			toast.error(error.message || t`Failed to generate recommendations`);
		},
	});

	const startMutation = useMutation({
		...orpc.learningRecommendations.startResource.mutationOptions(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["learningRecommendations"] });
			toast.success(t`Started learning resource`);
		},
		onError: (error) => {
			toast.error(error.message || t`Failed to start resource`);
		},
	});

	const trackMutation = useMutation({
		...orpc.learningRecommendations.trackEngagement.mutationOptions(),
		onError: () => toast.error(t`Failed to track learning progress. Please try again.`),
	});

	useMutation({
		...orpc.learningRecommendations.provideFeedback.mutationOptions(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["learningRecommendations"] });
			toast.success(t`Thank you for your feedback!`);
		},
		onError: () => toast.error(t`Failed to submit feedback. Please try again.`),
	});

	const getCompletion = useCallback(
		(resourceId: string): ResourceCompletion | undefined => {
			const found = completions.find(
				(c: { completion: { resourceId: string }; resource: unknown }) => c.completion.resourceId === resourceId,
			);
			if (!found) return undefined;
			return {
				id: found.completion.id,
				userId: found.completion.userId,
				resourceId: found.completion.resourceId,
				resource: found.resource as LearningResource,
				status: found.completion.status as CompletionStatus,
				progress: found.completion.progress,
				startedAt: found.completion.startedAt,
				completedAt: found.completion.completedAt,
				timeSpent: found.completion.timeSpentMinutes,
			};
		},
		[completions],
	);

	const handleStartResource = useCallback(
		(resourceId: string) => {
			startMutation.mutate({ resourceId });
		},
		[startMutation],
	);

	const handleContinueResource = useCallback(
		(resourceId: string, url?: string | null) => {
			trackMutation.mutate({
				resourceId,
				timeSpentMinutes: 1,
				progress: getCompletion(resourceId)?.progress ?? 0,
			});

			if (url) {
				window.open(url, "_blank");
			}
		},
		[trackMutation, getCompletion],
	);

	const filteredResources = useMemo(() => {
		return resources.filter((resource) => {
			const matchesType = selectedType === "all" || resource.resourceType === selectedType;
			const matchesDifficulty = selectedDifficulty === "all" || resource.difficulty === selectedDifficulty;
			return matchesType && matchesDifficulty;
		});
	}, [resources, selectedType, selectedDifficulty]);

	const inProgressResources = useMemo(() => {
		return completions
			.filter((c: { completion: { status: string }; resource: unknown }) => c.completion.status === "in_progress")
			.map(
				(c: {
					completion: {
						id: string;
						userId: string;
						resourceId: string;
						status: string;
						progress: number;
						startedAt: Date | null;
						completedAt: Date | null;
						timeSpentMinutes: number;
					};
					resource: unknown;
				}) => ({
					id: c.completion.id,
					userId: c.completion.userId,
					resourceId: c.completion.resourceId,
					resource: c.resource as LearningResource,
					status: c.completion.status as CompletionStatus,
					progress: c.completion.progress,
					startedAt: c.completion.startedAt,
					completedAt: c.completion.completedAt,
					timeSpent: c.completion.timeSpentMinutes,
				}),
			);
	}, [completions]);

	const overallProgress = statistics?.averageProgress ?? 0;

	if (isLoadingRecommendations || isLoadingResources) {
		return (
			<>
				<DashboardHeader icon={LightbulbIcon} title={t`Learning Recommendations`} />
				<LoadingSkeleton />
			</>
		);
	}

	if (recommendationsError) {
		return (
			<>
				<DashboardHeader icon={LightbulbIcon} title={t`Learning Recommendations`} />
				<Card className="border-destructive">
					<CardContent className="flex flex-col items-center py-12 text-center">
						<WarningCircleIcon className="mb-4 size-12 text-destructive" />
						<h3 className="mb-2 font-medium text-lg">
							<Trans>Error Loading Recommendations</Trans>
						</h3>
						<p className="text-muted-foreground">
							<Trans>Please try again later.</Trans>
						</p>
						<Button onClick={() => refetchRecommendations()} className="mt-4">
							<Trans>Retry</Trans>
						</Button>
					</CardContent>
				</Card>
			</>
		);
	}

	return (
		<>
			<DashboardHeader icon={LightbulbIcon} title={t`Learning Recommendations`} />

			<HeroSection statistics={statistics} />

			<ContinueLearningSection
				inProgressResources={inProgressResources}
				onStart={handleStartResource}
				onContinue={handleContinueResource}
			/>

			<Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
				<div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
					<TabsList className="flex h-auto flex-wrap gap-2 bg-transparent p-0">
						{[
							{ value: "for-you", icon: SparkleIcon, label: t`For You` },
							{ value: "explore", icon: BookOpenIcon, label: t`Explore` },
							{ value: "progress", icon: ChartBarIcon, label: t`Progress` },
							{ value: "goals", icon: TargetIcon, label: t`Goals` },
							{ value: "mentors", icon: UsersIcon, label: t`Mentors` },
						].map((tab) => (
							<TabsTrigger
								key={tab.value}
								value={tab.value}
								className="gap-2 rounded-full border border-transparent bg-muted/50 px-6 py-2.5 data-[state=active]:border-primary/30 data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
							>
								<tab.icon className="size-4" />
								{tab.label}
							</TabsTrigger>
						))}
					</TabsList>

					{activeTab === "for-you" && (
						<Button
							onClick={() => generateMutation.mutate({})}
							disabled={generateMutation.isPending}
							variant="outline"
							className="gap-2"
						>
							<ShuffleIcon className="size-4" />
							<Trans>Refresh Recommendations</Trans>
						</Button>
					)}
				</div>

				<TabsContent value="for-you" className="space-y-8">
					<ForYouTabContent
						recommendations={recommendations}
						getCompletion={getCompletion}
						onStart={handleStartResource}
						onContinue={handleContinueResource}
						onGenerate={() => generateMutation.mutate({})}
					/>
				</TabsContent>

				<TabsContent value="explore" className="space-y-8">
					<ExploreTabContent
						selectedType={selectedType}
						setSelectedType={setSelectedType}
						selectedDifficulty={selectedDifficulty}
						setSelectedDifficulty={setSelectedDifficulty}
						filteredResources={filteredResources}
						getCompletion={getCompletion}
						onStart={handleStartResource}
						onContinue={handleContinueResource}
					/>
				</TabsContent>

				<TabsContent value="progress" className="space-y-8">
					<ProgressTabContent overallProgress={overallProgress} statistics={statistics} completions={completions} />
				</TabsContent>

				<TabsContent value="goals" className="space-y-8">
					<GoalsTabContent goals={goals} />
				</TabsContent>

				<TabsContent value="mentors" className="space-y-8">
					<MentorsTabContent mentorMatches={mentorMatches} />
				</TabsContent>
			</Tabs>
		</>
	);
}
