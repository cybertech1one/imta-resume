import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import {
	ChartBarIcon,
	CheckCircleIcon,
	ClipboardTextIcon,
	ExportIcon,
	FunnelIcon,
	MagnifyingGlassIcon,
	PlusIcon,
	SparkleIcon,
	SpinnerIcon,
	TargetIcon,
	WarningCircleIcon,
	XIcon,
} from "@phosphor-icons/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { ErrorComponent } from "@/components/error-component";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { authClient } from "@/integrations/auth/client";
import { orpc } from "@/integrations/orpc/client";
import { cn } from "@/utils/style";
import { DashboardHeader } from "../-components/header";
import {
	AddFeedbackDialog,
	AddGoalDialog,
	FeedbackCard,
	GoalsTabContent,
	HeroSection,
	LoadingSkeleton,
	PatternsTabContent,
	ShareExportSection,
	TrendsTabContent,
} from "./-components/feedback-components";
import { categoryColors, categoryLabels } from "./-components/feedback-config";
import type { FeedbackCategory, Pattern, TrendData } from "./-components/feedback-types";

// biome-ignore lint/suspicious/noExplicitAny: Route path not in generated route tree
export const Route = createFileRoute("/dashboard/interview/feedback" as any)({
	component: InterviewFeedbackTracker,
	errorComponent: ErrorComponent,
});

function InterviewFeedbackTracker() {
	const queryClient = useQueryClient();
	const { data: session } = authClient.useSession();
	const [activeTab, setActiveTab] = useState("feedback");
	const [searchQuery, setSearchQuery] = useState("");
	const [categoryFilter, setCategoryFilter] = useState<FeedbackCategory | "all">("all");
	const [typeFilter, setTypeFilter] = useState<"all" | "strength" | "improvement">("all");
	const [showResolved, setShowResolved] = useState(true);
	const [isAddFeedbackOpen, setIsAddFeedbackOpen] = useState(false);
	const [isAddGoalOpen, setIsAddGoalOpen] = useState(false);
	const [deletingId, setDeletingId] = useState<string | null>(null);
	const [togglingId, setTogglingId] = useState<string | null>(null);

	const [newFeedback, setNewFeedback] = useState({
		category: "technical" as FeedbackCategory,
		type: "improvement" as "strength" | "improvement",
		content: "",
		source: "",
		priority: "medium" as "high" | "medium" | "low",
		actionItems: "",
		tags: "",
	});

	const [newGoal, setNewGoal] = useState({
		title: "",
		description: "",
		category: "technical" as FeedbackCategory,
		targetDate: "",
		milestones: "",
	});

	// ============================================
	// QUERIES
	// ============================================

	const {
		data: feedbackData,
		isLoading: feedbackLoading,
		error: feedbackError,
	} = useQuery({
		...orpc.interviewFeedback.feedback.list.queryOptions({
			category: categoryFilter !== "all" ? categoryFilter : undefined,
			type: typeFilter !== "all" ? typeFilter : undefined,
			isResolved: showResolved ? undefined : false,
		}),
		enabled: !!session?.user,
	});

	const { data: feedbackStats } = useQuery({
		...orpc.interviewFeedback.feedback.getStatistics.queryOptions(),
		enabled: !!session?.user,
	});
	const { data: goalsData, isLoading: goalsLoading } = useQuery({
		...orpc.interviewFeedback.goals.list.queryOptions({}),
		enabled: !!session?.user,
	});
	const { data: goalStats } = useQuery({
		...orpc.interviewFeedback.goals.getStatistics.queryOptions(),
		enabled: !!session?.user,
	});
	const { data: trendsData } = useQuery({
		...orpc.interviewFeedback.trends.list.queryOptions({}),
		enabled: !!session?.user,
	});
	const { data: patternsData } = useQuery({
		...orpc.interviewFeedback.patterns.list.queryOptions({}),
		enabled: !!session?.user,
	});

	// ============================================
	// MUTATIONS
	// ============================================

	const createFeedbackMutation = useMutation(
		orpc.interviewFeedback.feedback.create.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries({ queryKey: ["interviewFeedback"] });
				setIsAddFeedbackOpen(false);
				setNewFeedback({
					category: "technical",
					type: "improvement",
					content: "",
					source: "",
					priority: "medium",
					actionItems: "",
					tags: "",
				});
				toast.success(t`Feedback added successfully`);
			},
			onError: () => {
				toast.error(t`Error adding feedback`);
			},
		}),
	);

	const deleteFeedbackMutation = useMutation(
		orpc.interviewFeedback.feedback.delete.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries({ queryKey: ["interviewFeedback"] });
				setDeletingId(null);
				toast.success(t`Feedback deleted`);
			},
			onError: () => {
				setDeletingId(null);
				toast.error(t`Error deleting feedback`);
			},
		}),
	);

	const toggleResolvedMutation = useMutation(
		orpc.interviewFeedback.feedback.toggleResolved.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries({ queryKey: ["interviewFeedback"] });
				setTogglingId(null);
			},
			onError: () => {
				setTogglingId(null);
				toast.error(t`Error updating`);
			},
		}),
	);

	const createGoalMutation = useMutation(
		orpc.interviewFeedback.goals.create.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries({ queryKey: ["interviewFeedback"] });
				setIsAddGoalOpen(false);
				setNewGoal({ title: "", description: "", category: "technical", targetDate: "", milestones: "" });
				toast.success(t`Goal created successfully`);
			},
			onError: () => {
				toast.error(t`Error creating goal`);
			},
		}),
	);

	const toggleMilestoneMutation = useMutation(
		orpc.interviewFeedback.goals.toggleMilestone.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries({ queryKey: ["interviewFeedback"] });
			},
			onError: () => {
				toast.error(t`Error updating`);
			},
		}),
	);

	const analyzePatternsMutation = useMutation(
		orpc.interviewFeedback.patterns.analyze.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries({ queryKey: ["interviewFeedback"] });
				toast.success(t`Pattern analysis complete`);
			},
			onError: () => {
				toast.error(t`Error during analysis`);
			},
		}),
	);

	const calculateTrendsMutation = useMutation(
		orpc.interviewFeedback.trends.calculate.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries({ queryKey: ["interviewFeedback"] });
			},
		}),
	);

	const { refetch: exportData, isFetching: isExporting } = useQuery({
		...orpc.interviewFeedback.export.queryOptions(),
		enabled: false,
	});

	// ============================================
	// COMPUTED VALUES
	// ============================================

	const feedback = useMemo(() => {
		const items = feedbackData?.items ?? [];
		if (!searchQuery) return items;
		const query = searchQuery.toLowerCase();
		return items.filter(
			(f) =>
				f.content.toLowerCase().includes(query) ||
				f.source.toLowerCase().includes(query) ||
				f.tags.some((t) => t.toLowerCase().includes(query)),
		);
	}, [feedbackData, searchQuery]);

	const goals = useMemo(() => goalsData ?? [], [goalsData]);
	const trends: TrendData[] = useMemo(() => (!trendsData || trendsData.length === 0 ? [] : trendsData), [trendsData]);
	const patterns: Pattern[] = useMemo(() => patternsData ?? [], [patternsData]);

	const stats = useMemo(
		() =>
			feedbackStats ?? {
				total: 0,
				strengths: 0,
				improvements: 0,
				unresolvedCount: 0,
				highPriority: 0,
				categoryBreakdown: {
					technical: 0,
					behavioral: 0,
					communication: 0,
					problem_solving: 0,
					leadership: 0,
					cultural_fit: 0,
				},
			},
		[feedbackStats],
	);

	const latestTrend = trends.length > 0 ? trends[trends.length - 1] : null;
	const previousTrend = trends.length > 1 ? trends[trends.length - 2] : null;
	const trendChange = latestTrend && previousTrend ? latestTrend.overall - previousTrend.overall : 0;

	// ============================================
	// HANDLERS
	// ============================================

	const handleAddFeedback = useCallback(() => {
		createFeedbackMutation.mutate({
			date: new Date().toISOString().split("T")[0],
			category: newFeedback.category,
			type: newFeedback.type,
			content: newFeedback.content,
			source: newFeedback.source,
			priority: newFeedback.priority,
			actionItems: newFeedback.actionItems.split("\n").filter(Boolean),
			tags: newFeedback.tags
				.split(",")
				.map((t) => t.trim())
				.filter(Boolean),
		});
	}, [newFeedback, createFeedbackMutation]);

	const handleAddGoal = useCallback(() => {
		createGoalMutation.mutate({
			title: newGoal.title,
			description: newGoal.description,
			category: newGoal.category,
			targetDate: newGoal.targetDate,
			milestones: newGoal.milestones
				.split("\n")
				.filter(Boolean)
				.map((m) => ({ title: m, completed: false })),
		});
	}, [newGoal, createGoalMutation]);

	const handleToggleResolved = useCallback(
		(id: string) => {
			setTogglingId(id);
			toggleResolvedMutation.mutate({ id });
		},
		[toggleResolvedMutation],
	);
	const handleDeleteFeedback = useCallback(
		(id: string) => {
			setDeletingId(id);
			deleteFeedbackMutation.mutate({ id });
		},
		[deleteFeedbackMutation],
	);
	const handleToggleMilestone = useCallback(
		(goalId: string, milestoneIndex: number) => {
			toggleMilestoneMutation.mutate({ goalId, milestoneIndex });
		},
		[toggleMilestoneMutation],
	);

	const handleExport = useCallback(async () => {
		try {
			const result = await exportData();
			if (result.data) {
				const blob = new Blob([JSON.stringify(result.data, null, 2)], { type: "application/json" });
				const url = URL.createObjectURL(blob);
				const a = document.createElement("a");
				a.href = url;
				a.download = `interview-feedback-${new Date().toISOString().split("T")[0]}.json`;
				document.body.appendChild(a);
				a.click();
				document.body.removeChild(a);
				URL.revokeObjectURL(url);
				toast.success(t`Report exported successfully`);
			}
		} catch {
			toast.error(t`Error during export`);
		}
	}, [exportData]);

	const handleAnalyzePatterns = useCallback(() => {
		analyzePatternsMutation.mutate({});
	}, [analyzePatternsMutation]);

	useEffect(() => {
		if (feedbackData && feedbackData.total > 0) {
			calculateTrendsMutation.mutate({});
		}
	}, [feedbackData?.total, calculateTrendsMutation.mutate, feedbackData]);

	if (feedbackLoading) {
		return (
			<>
				<DashboardHeader icon={ClipboardTextIcon} title={t`Feedback Tracking`} />
				<LoadingSkeleton />
			</>
		);
	}

	if (feedbackError) {
		return (
			<>
				<DashboardHeader icon={ClipboardTextIcon} title={t`Feedback Tracking`} />
				<Card className="p-8 text-center">
					<WarningCircleIcon className="mx-auto mb-4 size-12 text-destructive" />
					<h3 className="mb-2 font-semibold text-lg">
						<Trans>Loading error</Trans>
					</h3>
					<p className="text-muted-foreground">
						<Trans>Unable to load feedback. Please try again.</Trans>
					</p>
					<Button className="mt-4" onClick={() => queryClient.invalidateQueries({ queryKey: ["interviewFeedback"] })}>
						<Trans>Retry</Trans>
					</Button>
				</Card>
			</>
		);
	}

	return (
		<>
			<DashboardHeader icon={ClipboardTextIcon} title={t`Feedback Tracking`} />

			<HeroSection stats={stats} trendChange={trendChange} />

			<Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
				<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
					<TabsList>
						<TabsTrigger value="feedback">
							<ClipboardTextIcon className="mr-2 size-4" />
							<Trans>Feedbacks</Trans>
						</TabsTrigger>
						<TabsTrigger value="trends">
							<ChartBarIcon className="mr-2 size-4" />
							<Trans>Trends</Trans>
						</TabsTrigger>
						<TabsTrigger value="patterns">
							<SparkleIcon className="mr-2 size-4" />
							<Trans>Patterns</Trans>
						</TabsTrigger>
						<TabsTrigger value="goals">
							<TargetIcon className="mr-2 size-4" />
							<Trans>Goals</Trans>
						</TabsTrigger>
					</TabsList>

					<div className="flex gap-2">
						<Button variant="outline" onClick={handleExport} disabled={isExporting}>
							{isExporting ? (
								<SpinnerIcon className="mr-2 size-4 animate-spin" />
							) : (
								<ExportIcon className="mr-2 size-4" />
							)}
							<Trans>Export</Trans>
						</Button>
						<AddFeedbackDialog
							open={isAddFeedbackOpen}
							onOpenChange={setIsAddFeedbackOpen}
							newFeedback={newFeedback}
							setNewFeedback={setNewFeedback}
							onSubmit={handleAddFeedback}
							isPending={createFeedbackMutation.isPending}
						>
							<Button>
								<PlusIcon className="mr-2 size-4" />
								<Trans>Add Feedback</Trans>
							</Button>
						</AddFeedbackDialog>
					</div>
				</div>

				{/* Feedback Tab */}
				<TabsContent value="feedback" className="space-y-6">
					<Card>
						<CardContent className="flex flex-wrap items-center gap-4 p-4">
							<div className="flex-1">
								<div className="relative">
									<MagnifyingGlassIcon className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
									<Input
										placeholder={t`Search in feedbacks...`}
										value={searchQuery}
										onChange={(e) => setSearchQuery(e.target.value)}
										className="pl-9"
									/>
								</div>
							</div>
							<Select value={categoryFilter} onValueChange={(v) => setCategoryFilter(v as FeedbackCategory | "all")}>
								<SelectTrigger className="w-[180px]">
									<FunnelIcon className="mr-2 size-4" />
									<SelectValue placeholder={t`Category`} />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">{t`All categories`}</SelectItem>
									{Object.entries(categoryLabels).map(([key, label]) => (
										<SelectItem key={key} value={key}>
											{label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							<Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as "all" | "strength" | "improvement")}>
								<SelectTrigger className="w-[150px]">
									<SelectValue placeholder={t`Type`} />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">{t`All types`}</SelectItem>
									<SelectItem value="strength">{t`Strengths`}</SelectItem>
									<SelectItem value="improvement">{t`To improve`}</SelectItem>
								</SelectContent>
							</Select>
							<Button
								variant={showResolved ? "default" : "outline"}
								size="sm"
								onClick={() => setShowResolved(!showResolved)}
							>
								{showResolved ? <CheckCircleIcon className="mr-1 size-4" /> : <XIcon className="mr-1 size-4" />}
								Resolved
							</Button>
						</CardContent>
					</Card>

					<div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
						{Object.entries(categoryLabels).map(([key, label]) => (
							<motion.div key={key} initial={false} animate={{ opacity: 1, scale: 1 }} whileHover={{ scale: 1.02 }}>
								<Card
									className={cn(
										"cursor-pointer transition-all hover:shadow-md",
										categoryFilter === key && "ring-2 ring-primary",
									)}
									onClick={() => setCategoryFilter(categoryFilter === key ? "all" : (key as FeedbackCategory))}
								>
									<CardContent className="p-4 text-center">
										<div
											className={cn(
												"mx-auto mb-2 flex size-10 items-center justify-center rounded-full",
												categoryColors[key as FeedbackCategory],
											)}
										>
											<span className="font-bold">{stats.categoryBreakdown[key as FeedbackCategory] ?? 0}</span>
										</div>
										<p className="font-medium text-xs">{label}</p>
									</CardContent>
								</Card>
							</motion.div>
						))}
					</div>

					<div className="space-y-4">
						<div className="flex items-center justify-between">
							<h3 className="font-semibold text-lg">
								{feedback.length} feedback{feedback.length !== 1 ? "s" : ""}
							</h3>
						</div>
						<AnimatePresence mode="popLayout">
							{feedback.length > 0 ? (
								feedback.map((f) => (
									<FeedbackCard
										key={f.id}
										feedback={f}
										onEdit={() => toast.info(t`Feature in development`)}
										onDelete={handleDeleteFeedback}
										onToggleResolved={handleToggleResolved}
										isDeleting={deletingId === f.id}
										isToggling={togglingId === f.id}
									/>
								))
							) : (
								<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-12 text-center">
									<ClipboardTextIcon className="mx-auto mb-4 size-12 text-muted-foreground" />
									<h4 className="mb-2 font-semibold text-lg">
										<Trans>No feedback found</Trans>
									</h4>
									<p className="text-muted-foreground">
										<Trans>Add your first feedback to start tracking.</Trans>
									</p>
								</motion.div>
							)}
						</AnimatePresence>
					</div>
				</TabsContent>

				<TabsContent value="trends">
					<TrendsTabContent
						trends={trends}
						latestTrend={latestTrend}
						previousTrend={previousTrend}
						trendChange={trendChange}
						stats={stats}
						goalStats={goalStats}
					/>
				</TabsContent>

				<TabsContent value="patterns">
					<PatternsTabContent
						patterns={patterns}
						onAnalyze={handleAnalyzePatterns}
						isAnalyzing={analyzePatternsMutation.isPending}
					/>
				</TabsContent>

				<TabsContent value="goals">
					<GoalsTabContent
						goals={goals}
						goalsLoading={goalsLoading}
						goalStats={goalStats}
						onToggleMilestone={handleToggleMilestone}
						isUpdating={toggleMilestoneMutation.isPending}
						onOpenAddGoal={() => setIsAddGoalOpen(true)}
						addGoalDialog={
							<AddGoalDialog
								open={isAddGoalOpen}
								onOpenChange={setIsAddGoalOpen}
								newGoal={newGoal}
								setNewGoal={setNewGoal}
								onSubmit={handleAddGoal}
								isPending={createGoalMutation.isPending}
							>
								<Button>
									<PlusIcon className="mr-2 size-4" />
									<Trans>New Goal</Trans>
								</Button>
							</AddGoalDialog>
						}
					/>
				</TabsContent>
			</Tabs>

			<ShareExportSection onExport={handleExport} isExporting={isExporting} />
		</>
	);
}
