import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import {
	BookmarkSimpleIcon,
	CheckCircleIcon,
	CircleNotchIcon,
	CurrencyCircleDollarIcon,
	EyeIcon,
	FunnelIcon,
	GearIcon,
	LightningIcon,
	MapPinIcon,
	PaperPlaneTiltIcon,
	SparkleIcon,
	StarIcon,
	TrendUpIcon,
	XCircleIcon,
} from "@phosphor-icons/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { ErrorComponent } from "@/components/error-component";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { authClient } from "@/integrations/auth/client";
import { orpc } from "@/integrations/orpc/client";
import { cn } from "@/utils/style";
import { DashboardHeader } from "../-components/header";
import { PreferencesDialog } from "./-components/recommendations-components";
import { getScoreBgColor, getScoreColor, JOB_TYPES } from "./-components/recommendations-config";
import type { PreferencesDialogProps } from "./-components/recommendations-types";

// biome-ignore lint/suspicious/noExplicitAny: Route path not in generated route tree
export const Route = createFileRoute("/dashboard/jobs/recommendations" as any)({
	component: JobRecommendationsPage,
	errorComponent: ErrorComponent,
});

function JobRecommendationsPage() {
	const { data: session } = authClient.useSession();
	const queryClient = useQueryClient();
	const [activeTab, setActiveTab] = useState<"new" | "saved" | "applied" | "all">("new");
	const [showPreferences, setShowPreferences] = useState(false);
	const [selectedJob, setSelectedJob] = useState<string | null>(null);
	const [sortBy, setSortBy] = useState<"score" | "date">("score");
	const [minScore, setMinScore] = useState<number>(0);

	// Fetch recommendations
	const statusFilter = activeTab === "all" ? undefined : activeTab;
	const { data: recommendationsData, isLoading: loadingRecommendations } = useQuery({
		...orpc.jobRecommendations.getRecommendations.queryOptions({
			input: {
				status: statusFilter,
				minScore: minScore > 0 ? minScore : undefined,
				limit: 50,
			},
		}),
		enabled: !!session?.user,
	});

	// Fetch stats
	const { data: stats, isLoading: loadingStats } = useQuery({
		...orpc.jobRecommendations.getStats.queryOptions({}),
		enabled: !!session?.user,
	});

	// Fetch preferences
	const { data: preferences } = useQuery({
		...orpc.jobRecommendations.getPreferences.queryOptions({}),
		enabled: !!session?.user,
	});

	// Fetch resumes for generating recommendations
	const { data: resumes } = useQuery({
		...orpc.resume.list.queryOptions({}),
		enabled: !!session?.user,
	});

	// Generate recommendations mutation
	const generateMutation = useMutation({
		mutationFn: async (input: { resumeId?: string; forceRefresh?: boolean }) => {
			return orpc.jobRecommendations.generateRecommendations.call(input);
		},
		onSuccess: (data) => {
			toast.success(t`${data.generated} new recommendations generated`);
			queryClient.invalidateQueries({ queryKey: ["jobRecommendations"] });
		},
		onError: () => {
			toast.error(t`Error generating recommendations`);
		},
	});

	// Update preferences mutation
	const updatePreferencesMutation = useMutation({
		mutationFn: async (input: Record<string, unknown>) => {
			return orpc.jobRecommendations.updatePreferences.call(input);
		},
		onSuccess: () => {
			toast.success(t`Preferences updated`);
			queryClient.invalidateQueries({ queryKey: ["jobRecommendations"] });
			setShowPreferences(false);
		},
		onError: () => {
			toast.error(t`Error updating preferences`);
		},
	});

	// Update status mutation
	const updateStatusMutation = useMutation({
		mutationFn: async ({
			id,
			status,
		}: {
			id: string;
			status: "new" | "viewed" | "applied" | "saved" | "dismissed";
		}) => {
			return orpc.jobRecommendations.updateStatus.call({ id, status });
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["jobRecommendations"] });
		},
	});

	// Dismiss mutation
	const dismissMutation = useMutation({
		mutationFn: async (id: string) => {
			return orpc.jobRecommendations.dismiss.call({ id });
		},
		onSuccess: () => {
			toast.success(t`Recommendation hidden`);
			queryClient.invalidateQueries({ queryKey: ["jobRecommendations"] });
		},
	});

	// Save mutation
	const saveMutation = useMutation({
		mutationFn: async (id: string) => {
			return orpc.jobRecommendations.save.call({ id });
		},
		onSuccess: () => {
			toast.success(t`Job saved`);
			queryClient.invalidateQueries({ queryKey: ["jobRecommendations"] });
		},
	});

	// Mark applied mutation
	const applyMutation = useMutation({
		mutationFn: async (id: string) => {
			return orpc.jobRecommendations.markApplied.call({ id });
		},
		onSuccess: () => {
			toast.success(t`Marked as applied`);
			queryClient.invalidateQueries({ queryKey: ["jobRecommendations"] });
		},
	});

	// Sort recommendations
	const recommendations = useMemo(() => {
		if (!recommendationsData?.recommendations) return [];
		const sorted = [...recommendationsData.recommendations];
		if (sortBy === "score") {
			sorted.sort((a, b) => b.matchScore - a.matchScore);
		} else {
			sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
		}
		return sorted;
	}, [recommendationsData, sortBy]);

	// Get selected recommendation details
	const selectedRecommendation = useMemo(() => {
		if (!selectedJob) return null;
		return recommendations.find((r) => r.id === selectedJob);
	}, [selectedJob, recommendations]);

	return (
		<div className="space-y-6">
			<DashboardHeader icon={SparkleIcon} title={t`AI Recommendations`} />

			{/* Stats Cards */}
			<div className="grid gap-4 md:grid-cols-5">
				<Card>
					<CardHeader className="pb-2">
						<CardDescription className="flex items-center gap-2">
							<SparkleIcon className="size-4" />
							<Trans>Total</Trans>
						</CardDescription>
						<CardTitle className="text-2xl">
							{loadingStats ? <Skeleton className="h-8 w-12" /> : stats?.total || 0}
						</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-muted-foreground text-xs">
							<Trans>recommendations</Trans>
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="pb-2">
						<CardDescription className="flex items-center gap-2">
							<LightningIcon className="size-4 text-blue-500" />
							<Trans>New</Trans>
						</CardDescription>
						<CardTitle className="text-2xl text-blue-600 dark:text-blue-400">
							{loadingStats ? <Skeleton className="h-8 w-12" /> : stats?.new || 0}
						</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-muted-foreground text-xs">
							<Trans>to review</Trans>
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="pb-2">
						<CardDescription className="flex items-center gap-2">
							<BookmarkSimpleIcon className="size-4 text-yellow-500" />
							<Trans>Saved</Trans>
						</CardDescription>
						<CardTitle className="text-2xl text-yellow-600 dark:text-yellow-400">
							{loadingStats ? <Skeleton className="h-8 w-12" /> : stats?.saved || 0}
						</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-muted-foreground text-xs">
							<Trans>for later</Trans>
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="pb-2">
						<CardDescription className="flex items-center gap-2">
							<PaperPlaneTiltIcon className="size-4 text-green-500" />
							<Trans>Applied</Trans>
						</CardDescription>
						<CardTitle className="text-2xl text-green-600 dark:text-green-400">
							{loadingStats ? <Skeleton className="h-8 w-12" /> : stats?.applied || 0}
						</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-muted-foreground text-xs">
							<Trans>applications</Trans>
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="pb-2">
						<CardDescription className="flex items-center gap-2">
							<TrendUpIcon className="size-4 text-purple-500" />
							<Trans>Average Score</Trans>
						</CardDescription>
						<CardTitle className="text-2xl text-purple-600 dark:text-purple-400">
							{loadingStats ? <Skeleton className="h-8 w-12" /> : `${stats?.averageScore || 0}%`}
						</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-muted-foreground text-xs">
							<Trans>compatibility</Trans>
						</p>
					</CardContent>
				</Card>
			</div>

			{/* Actions Row */}
			<Card>
				<CardContent className="flex flex-col gap-4 p-4 lg:flex-row lg:items-center lg:justify-between">
					<div className="flex flex-wrap items-center gap-2">
						<Button onClick={() => generateMutation.mutate({})} disabled={generateMutation.isPending}>
							{generateMutation.isPending ? (
								<CircleNotchIcon className="mr-2 size-4 animate-spin" />
							) : (
								<SparkleIcon className="mr-2 size-4" />
							)}
							<Trans>Generate recommendations</Trans>
						</Button>

						{resumes && resumes.length > 0 && (
							<Select onValueChange={(resumeId) => generateMutation.mutate({ resumeId })}>
								<SelectTrigger className="w-[200px]">
									<SelectValue placeholder={t`Use a resume`} />
								</SelectTrigger>
								<SelectContent>
									{resumes.map((resume) => (
										<SelectItem key={resume.id} value={resume.id}>
											{resume.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						)}

						<Button variant="outline" onClick={() => setShowPreferences(true)}>
							<GearIcon className="mr-2 size-4" />
							<Trans>Preferences</Trans>
						</Button>
					</div>

					<div className="flex flex-wrap items-center gap-2">
						<Select value={`${minScore}`} onValueChange={(v) => setMinScore(Number(v))}>
							<SelectTrigger className="w-[160px]">
								<FunnelIcon className="mr-2 size-4" />
								<SelectValue placeholder={t`Minimum score`} />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="0">
									<Trans>All scores</Trans>
								</SelectItem>
								<SelectItem value="40">40%+</SelectItem>
								<SelectItem value="60">60%+</SelectItem>
								<SelectItem value="80">80%+</SelectItem>
							</SelectContent>
						</Select>

						<Select value={sortBy} onValueChange={(v) => setSortBy(v as "score" | "date")}>
							<SelectTrigger className="w-[160px]">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="score">
									<Trans>By score</Trans>
								</SelectItem>
								<SelectItem value="date">
									<Trans>By date</Trans>
								</SelectItem>
							</SelectContent>
						</Select>
					</div>
				</CardContent>
			</Card>

			{/* Main Content */}
			<div className="grid gap-6 lg:grid-cols-3">
				{/* Recommendations List */}
				<div className="lg:col-span-2">
					<Card>
						<CardHeader>
							<div className="flex items-center justify-between">
								<CardTitle>
									<Trans>Recommended Jobs</Trans>
								</CardTitle>
								<Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
									<TabsList>
										<TabsTrigger value="new" className="gap-1">
											<LightningIcon className="size-4" />
											<Trans>New</Trans>
											{stats?.new ? (
												<Badge variant="secondary" className="ml-1 text-xs">
													{stats.new}
												</Badge>
											) : null}
										</TabsTrigger>
										<TabsTrigger value="saved" className="gap-1">
											<BookmarkSimpleIcon className="size-4" />
											<Trans>Saved</Trans>
										</TabsTrigger>
										<TabsTrigger value="applied" className="gap-1">
											<PaperPlaneTiltIcon className="size-4" />
											<Trans>Applied</Trans>
										</TabsTrigger>
										<TabsTrigger value="all">
											<Trans>All</Trans>
										</TabsTrigger>
									</TabsList>
								</Tabs>
							</div>
						</CardHeader>
						<CardContent>
							{loadingRecommendations ? (
								<div className="space-y-4">
									{[1, 2, 3].map((i) => (
										<Skeleton key={i} className="h-32" />
									))}
								</div>
							) : recommendations.length > 0 ? (
								<ScrollArea className="h-[600px] pr-4">
									<div className="space-y-4">
										<AnimatePresence mode="popLayout">
											{recommendations.map((rec, index) => (
												<motion.div
													key={rec.id}
													initial={{ opacity: 0, y: 20 }}
													animate={{ opacity: 1, y: 0 }}
													exit={{ opacity: 0, x: -20 }}
													transition={{ delay: index * 0.05 }}
												>
													<Card
														className={cn(
															"cursor-pointer transition-all hover:shadow-md",
															selectedJob === rec.id && "ring-2 ring-primary",
														)}
														onClick={() => {
															setSelectedJob(rec.id);
															if (rec.status === "new") {
																updateStatusMutation.mutate({ id: rec.id, status: "viewed" });
															}
														}}
													>
														<CardContent className="p-4">
															<div className="flex items-start gap-4">
																{/* Match Score */}
																<div
																	className={cn(
																		"flex size-16 shrink-0 flex-col items-center justify-center rounded-lg",
																		getScoreBgColor(rec.matchScore),
																	)}
																>
																	<span className={cn("font-bold text-xl", getScoreColor(rec.matchScore))}>
																		{rec.matchScore}%
																	</span>
																	<span className="text-muted-foreground text-xs">match</span>
																</div>

																{/* Job Info */}
																<div className="min-w-0 flex-1">
																	<div className="flex items-start justify-between gap-2">
																		<div>
																			<h3 className="truncate font-semibold">{rec.job?.title || "Job"}</h3>
																			<p className="text-muted-foreground text-sm">{rec.job?.company || "Company"}</p>
																		</div>
																		{rec.status === "new" && (
																			<Badge className="shrink-0 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
																				<Trans>New</Trans>
																			</Badge>
																		)}
																		{rec.status === "saved" && (
																			<Badge variant="secondary" className="shrink-0">
																				<BookmarkSimpleIcon className="mr-1 size-3" />
																				<Trans>Saved</Trans>
																			</Badge>
																		)}
																		{rec.status === "applied" && (
																			<Badge className="shrink-0 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
																				<CheckCircleIcon className="mr-1 size-3" />
																				<Trans>Applied</Trans>
																			</Badge>
																		)}
																	</div>

																	{/* Job Details */}
																	<div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
																		{rec.job?.location && (
																			<span className="flex items-center gap-1 text-muted-foreground">
																				<MapPinIcon className="size-3" />
																				{rec.job.location}
																			</span>
																		)}
																		{rec.job?.jobType && (
																			<Badge variant="outline" className="text-xs">
																				{JOB_TYPES.find((t) => t.id === rec.job?.jobType)?.name || rec.job.jobType}
																			</Badge>
																		)}
																		{(rec.job?.salaryMin || rec.job?.salaryMax) && (
																			<span className="flex items-center gap-1 text-muted-foreground">
																				<CurrencyCircleDollarIcon className="size-3" />
																				{rec.job.salaryMin?.toLocaleString()} - {rec.job.salaryMax?.toLocaleString()}{" "}
																				MAD
																			</span>
																		)}
																	</div>

																	{/* Match Reasons */}
																	{rec.reasons && (rec.reasons as { matched?: string[] }).matched?.length ? (
																		<div className="mt-2">
																			<p className="text-green-600 text-xs dark:text-green-400">
																				{(rec.reasons as { matched: string[] }).matched.slice(0, 2).join(" | ")}
																			</p>
																		</div>
																	) : null}

																	{/* Quick Actions */}
																	<div className="mt-3 flex items-center gap-2">
																		{rec.status !== "saved" && rec.status !== "applied" && (
																			<Tooltip>
																				<TooltipTrigger asChild>
																					<Button
																						size="sm"
																						variant="ghost"
																						onClick={(e) => {
																							e.stopPropagation();
																							saveMutation.mutate(rec.id);
																						}}
																					>
																						<BookmarkSimpleIcon className="size-4" />
																					</Button>
																				</TooltipTrigger>
																				<TooltipContent>
																					<Trans>Save</Trans>
																				</TooltipContent>
																			</Tooltip>
																		)}
																		{rec.status !== "applied" && (
																			<Tooltip>
																				<TooltipTrigger asChild>
																					<Button
																						size="sm"
																						variant="ghost"
																						onClick={(e) => {
																							e.stopPropagation();
																							applyMutation.mutate(rec.id);
																						}}
																					>
																						<PaperPlaneTiltIcon className="size-4" />
																					</Button>
																				</TooltipTrigger>
																				<TooltipContent>
																					<Trans>Mark as applied</Trans>
																				</TooltipContent>
																			</Tooltip>
																		)}
																		<Tooltip>
																			<TooltipTrigger asChild>
																				<Button
																					size="sm"
																					variant="ghost"
																					onClick={(e) => {
																						e.stopPropagation();
																						dismissMutation.mutate(rec.id);
																					}}
																				>
																					<XCircleIcon className="size-4" />
																				</Button>
																			</TooltipTrigger>
																			<TooltipContent>
																				<Trans>Dismiss</Trans>
																			</TooltipContent>
																		</Tooltip>
																	</div>
																</div>
															</div>
														</CardContent>
													</Card>
												</motion.div>
											))}
										</AnimatePresence>
									</div>
								</ScrollArea>
							) : (
								<div className="flex flex-col items-center gap-4 py-12 text-center">
									<SparkleIcon className="size-12 text-muted-foreground" />
									<div>
										<h3 className="font-semibold">
											<Trans>No recommendations</Trans>
										</h3>
										<p className="text-muted-foreground text-sm">
											{activeTab === "new" ? (
												<Trans>Generate new recommendations based on your profile</Trans>
											) : activeTab === "saved" ? (
												<Trans>Save recommendations to find them here</Trans>
											) : activeTab === "applied" ? (
												<Trans>Mark recommendations as applied</Trans>
											) : (
												<Trans>Configure your preferences and generate recommendations</Trans>
											)}
										</p>
									</div>
									<Button onClick={() => generateMutation.mutate({})}>
										<SparkleIcon className="mr-2 size-4" />
										<Trans>Generate recommendations</Trans>
									</Button>
								</div>
							)}
						</CardContent>
					</Card>
				</div>

				{/* Job Details Panel */}
				<div className="lg:col-span-1">
					<Card className="sticky top-4">
						<CardHeader>
							<CardTitle>
								<Trans>Job Details</Trans>
							</CardTitle>
						</CardHeader>
						<CardContent>
							{selectedRecommendation ? (
								<div className="space-y-6">
									{/* Score Breakdown */}
									<div>
										<h4 className="mb-3 font-medium">
											<Trans>Compatibility Analysis</Trans>
										</h4>
										<div className="space-y-3">
											<div>
												<div className="mb-1 flex items-center justify-between text-sm">
													<span>
														<Trans>Skills</Trans>
													</span>
													<span className={getScoreColor(selectedRecommendation.skillMatchScore || 0)}>
														{selectedRecommendation.skillMatchScore || 0}%
													</span>
												</div>
												<Progress value={selectedRecommendation.skillMatchScore || 0} className="h-2" />
											</div>
											<div>
												<div className="mb-1 flex items-center justify-between text-sm">
													<span>
														<Trans>Experience</Trans>
													</span>
													<span className={getScoreColor(selectedRecommendation.experienceMatchScore || 0)}>
														{selectedRecommendation.experienceMatchScore || 0}%
													</span>
												</div>
												<Progress value={selectedRecommendation.experienceMatchScore || 0} className="h-2" />
											</div>
											<div>
												<div className="mb-1 flex items-center justify-between text-sm">
													<span>
														<Trans>Location</Trans>
													</span>
													<span className={getScoreColor(selectedRecommendation.locationMatchScore || 0)}>
														{selectedRecommendation.locationMatchScore || 0}%
													</span>
												</div>
												<Progress value={selectedRecommendation.locationMatchScore || 0} className="h-2" />
											</div>
											<div>
												<div className="mb-1 flex items-center justify-between text-sm">
													<span>
														<Trans>Salary</Trans>
													</span>
													<span className={getScoreColor(selectedRecommendation.salaryMatchScore || 0)}>
														{selectedRecommendation.salaryMatchScore || 0}%
													</span>
												</div>
												<Progress value={selectedRecommendation.salaryMatchScore || 0} className="h-2" />
											</div>
										</div>
									</div>

									{/* Match Reasons */}
									{selectedRecommendation.reasons && (
										<div>
											<h4 className="mb-3 font-medium">
												<Trans>Why this job matches</Trans>
											</h4>
											<ul className="space-y-2 text-sm">
												{(selectedRecommendation.reasons as { matched?: string[] }).matched?.map((reason, i) => (
													<li key={i} className="flex items-start gap-2">
														<CheckCircleIcon className="mt-0.5 size-4 shrink-0 text-green-500" />
														<span>{reason}</span>
													</li>
												))}
											</ul>

											{(selectedRecommendation.reasons as { highlights?: string[] }).highlights?.length ? (
												<div className="mt-3">
													<p className="text-muted-foreground text-xs uppercase tracking-wide">
														<Trans>Strengths</Trans>
													</p>
													<ul className="mt-1 space-y-1 text-sm">
														{(selectedRecommendation.reasons as { highlights: string[] }).highlights.map((h, i) => (
															<li key={i} className="flex items-start gap-2 text-blue-600 dark:text-blue-400">
																<StarIcon className="mt-0.5 size-4 shrink-0" />
																<span>{h}</span>
															</li>
														))}
													</ul>
												</div>
											) : null}

											{(selectedRecommendation.reasons as { missingSkills?: string[] }).missingSkills?.length ? (
												<div className="mt-3">
													<p className="text-muted-foreground text-xs uppercase tracking-wide">
														<Trans>Skills to develop</Trans>
													</p>
													<div className="mt-1 flex flex-wrap gap-1">
														{(selectedRecommendation.reasons as { missingSkills: string[] }).missingSkills.map(
															(skill, i) => (
																<Badge key={i} variant="outline" className="text-xs">
																	{skill}
																</Badge>
															),
														)}
													</div>
												</div>
											) : null}
										</div>
									)}

									{/* Job Description */}
									{selectedRecommendation.job?.description && (
										<div>
											<h4 className="mb-3 font-medium">
												<Trans>Description</Trans>
											</h4>
											<p className="line-clamp-6 text-muted-foreground text-sm">
												{selectedRecommendation.job.description}
											</p>
										</div>
									)}

									{/* Actions */}
									<div className="flex flex-col gap-2">
										{selectedRecommendation.job?.applicationUrl && (
											<Button asChild>
												<a href={selectedRecommendation.job.applicationUrl} target="_blank" rel="noopener noreferrer">
													<PaperPlaneTiltIcon className="mr-2 size-4" />
													<Trans>Apply now</Trans>
												</a>
											</Button>
										)}
										{selectedRecommendation.status !== "saved" && (
											<Button variant="outline" onClick={() => saveMutation.mutate(selectedRecommendation.id)}>
												<BookmarkSimpleIcon className="mr-2 size-4" />
												<Trans>Save for later</Trans>
											</Button>
										)}
									</div>
								</div>
							) : (
								<div className="flex flex-col items-center gap-4 py-8 text-center">
									<EyeIcon className="size-10 text-muted-foreground" />
									<p className="text-muted-foreground text-sm">
										<Trans>Select a recommendation to view details</Trans>
									</p>
								</div>
							)}
						</CardContent>
					</Card>
				</div>
			</div>

			{/* Preferences Dialog */}
			<PreferencesDialog
				open={showPreferences}
				onOpenChange={setShowPreferences}
				preferences={preferences as PreferencesDialogProps["preferences"]}
				onSave={(prefs) => updatePreferencesMutation.mutate(prefs)}
				isLoading={updatePreferencesMutation.isPending}
			/>
		</div>
	);
}
