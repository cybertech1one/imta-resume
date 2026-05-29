import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import {
	ArrowDownIcon,
	ArrowRightIcon,
	ArrowUpIcon,
	BookOpenIcon,
	BriefcaseIcon,
	ChartLineUpIcon,
	CheckCircleIcon,
	ClockIcon,
	FireIcon,
	GraduationCapIcon,
	LightbulbIcon,
	MedalIcon,
	StarIcon,
	TargetIcon,
	TrendUpIcon,
	TrophyIcon,
	UsersIcon,
} from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { useMemo } from "react";
import { ErrorComponent } from "@/components/error-component";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { authClient } from "@/integrations/auth/client";
import { orpc } from "@/integrations/orpc/client";
import { DashboardHeader } from "../-components/header";

// biome-ignore lint/suspicious/noExplicitAny: Route path not in generated route tree
export const Route = createFileRoute("/dashboard/progress" as any)({
	component: StudentProgressDashboard,
	errorComponent: ErrorComponent,
});

// Icon mapping for badge types
const badgeIcons: Record<string, typeof TrophyIcon> = {
	FileText: BookOpenIcon,
	Files: BookOpenIcon,
	UserSound: UsersIcon,
	Trophy: TrophyIcon,
	MagnifyingGlass: LightbulbIcon,
	Star: StarIcon,
	Fire: FireIcon,
	SunHorizon: TrendUpIcon,
	Moon: ClockIcon,
	Lightning: TrendUpIcon,
	CheckCircle: CheckCircleIcon,
	Users: UsersIcon,
	HandHeart: GraduationCapIcon,
	Target: TargetIcon,
	Certificate: MedalIcon,
};

// Tier colors
const tierColors: Record<string, string> = {
	bronze: "bg-amber-700 text-amber-100",
	silver: "bg-slate-400 text-slate-900",
	gold: "bg-yellow-500 text-yellow-900",
	platinum: "bg-purple-500 text-purple-100",
};

function StudentProgressDashboard() {
	const { data: session } = authClient.useSession();

	// Fetch progress data
	const { data: progress, isLoading: isLoadingProgress } = useQuery({
		...orpc.studentProgress.getProgress.queryOptions({ input: {} }),
		enabled: !!session?.user,
	});

	// Fetch activity stats
	const { data: activityStats, isLoading: isLoadingStats } = useQuery({
		...orpc.studentProgress.getActivityStats.queryOptions({ input: { days: 30 } }),
		enabled: !!session?.user,
	});

	// Fetch badges
	const { data: badges, isLoading: isLoadingBadges } = useQuery({
		...orpc.studentProgress.getUserBadges.queryOptions({ input: {} }),
		enabled: !!session?.user,
	});

	// Fetch cohort comparison
	const { data: cohortComparison, isLoading: isLoadingComparison } = useQuery({
		...orpc.studentProgress.compareToCohort.queryOptions({ input: {} }),
		enabled: !!session?.user,
	});

	// Fetch weak areas
	const { data: weakAreas, isLoading: isLoadingWeakAreas } = useQuery({
		...orpc.studentProgress.getWeakAreas.queryOptions({ input: {} }),
		enabled: !!session?.user,
	});

	// Fetch weekly snapshots
	const { data: weeklySnapshots, isLoading: isLoadingSnapshots } = useQuery({
		...orpc.studentProgress.getWeeklySnapshots.queryOptions({ input: { limit: 8 } }),
		enabled: !!session?.user,
	});

	// Fetch recent activities
	const { isLoading: isLoadingActivities } = useQuery({
		...orpc.studentProgress.getActivityLog.queryOptions({ input: { limit: 10 } }),
		enabled: !!session?.user,
	});

	void (
		isLoadingProgress ||
		isLoadingStats ||
		isLoadingBadges ||
		isLoadingComparison ||
		isLoadingWeakAreas ||
		isLoadingSnapshots ||
		isLoadingActivities
	);

	// Calculate progress trend
	const progressTrend = useMemo(() => {
		if (!weeklySnapshots || weeklySnapshots.length < 2) return null;
		const currentScore = weeklySnapshots[0]?.overallScore ?? 0;
		const previousScore = weeklySnapshots[1]?.overallScore ?? 0;
		const diff = currentScore - previousScore;
		return {
			value: Math.abs(diff),
			direction: diff >= 0 ? "up" : "down",
		};
	}, [weeklySnapshots]);

	// Group activities by type for stats
	const activitySummary = useMemo(() => {
		if (!activityStats) return { lessons: 0, quizzes: 0, practice: 0, total: 0 };
		return {
			lessons: Number(activityStats.find((s) => s.action === "lesson_completed")?.count ?? 0),
			quizzes: Number(activityStats.find((s) => s.action === "quiz_taken")?.count ?? 0),
			practice: Number(activityStats.find((s) => s.action === "interview_practiced")?.count ?? 0),
			total: activityStats.reduce((sum, s) => sum + Number(s.count), 0),
		};
	}, [activityStats]);

	// New badges (not seen yet)
	const newBadges = useMemo(() => {
		return badges?.filter((b) => b.isNew) ?? [];
	}, [badges]);

	return (
		<div className="space-y-8">
			<DashboardHeader icon={TrendUpIcon} title={t`Progress Tracking`} />

			{/* New Badges Alert */}
			{newBadges.length > 0 && (
				<motion.div initial={false} animate={{ opacity: 1, y: 0 }}>
					<Card className="border-amber-500 bg-amber-50 dark:bg-amber-950/20">
						<CardContent className="flex items-center gap-4 py-4">
							<div className="flex size-12 items-center justify-center rounded-full bg-amber-500">
								<TrophyIcon className="size-6 text-white" weight="fill" />
							</div>
							<div className="flex-1">
								<p className="font-semibold">
									<Trans>New rewards!</Trans>
								</p>
								<p className="text-muted-foreground text-sm">
									<Trans>You earned {newBadges.length} new badge(s). Congratulations!</Trans>
								</p>
							</div>
							<Button variant="outline" size="sm" asChild>
								<a href="#badges">
									<Trans>View</Trans>
								</a>
							</Button>
						</CardContent>
					</Card>
				</motion.div>
			)}

			{/* Summary Cards */}
			<div className="grid gap-4 md:grid-cols-4">
				<Card>
					<CardHeader className="pb-2">
						<CardDescription className="flex items-center gap-2">
							<TrendUpIcon className="size-4" />
							<Trans>Overall Score</Trans>
						</CardDescription>
						<CardTitle className="flex items-center gap-2 text-3xl">
							{isLoadingProgress ? (
								<Skeleton className="h-9 w-16" />
							) : (
								<>
									{progress?.overallScore ?? 0}%
									{progressTrend && (
										<span
											className={`flex items-center text-sm ${progressTrend.direction === "up" ? "text-green-500" : "text-red-500"}`}
										>
											{progressTrend.direction === "up" ? (
												<ArrowUpIcon className="size-4" />
											) : (
												<ArrowDownIcon className="size-4" />
											)}
											{progressTrend.value}
										</span>
									)}
								</>
							)}
						</CardTitle>
					</CardHeader>
					<CardContent>
						<Progress value={progress?.overallScore ?? 0} className="h-2" />
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="pb-2">
						<CardDescription className="flex items-center gap-2">
							<FireIcon className="size-4" />
							<Trans>Current Streak</Trans>
						</CardDescription>
						<CardTitle className="text-3xl">
							{isLoadingProgress ? (
								<Skeleton className="h-9 w-16" />
							) : (
								<>
									{progress?.currentStreak ?? 0}{" "}
									<span className="font-normal text-base text-muted-foreground">
										<Trans>days</Trans>
									</span>
								</>
							)}
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="flex items-center gap-2 text-muted-foreground text-sm">
							<TrophyIcon className="size-4 text-amber-500" />
							<span>
								<Trans>Record: {progress?.longestStreak ?? 0} days</Trans>
							</span>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="pb-2">
						<CardDescription className="flex items-center gap-2">
							<UsersIcon className="size-4" />
							<Trans>Cohort Rank</Trans>
						</CardDescription>
						<CardTitle className="text-3xl">
							{isLoadingComparison ? <Skeleton className="h-9 w-16" /> : <>Top {cohortComparison?.percentile ?? 50}%</>}
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="flex items-center gap-2 text-muted-foreground text-sm">
							<span>
								#{cohortComparison?.rank ?? 0} of {cohortComparison?.totalInCohort ?? cohortComparison?.totalUsers ?? 0}
							</span>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="pb-2">
						<CardDescription className="flex items-center gap-2">
							<MedalIcon className="size-4" />
							<Trans>Badges Earned</Trans>
						</CardDescription>
						<CardTitle className="text-3xl">
							{isLoadingBadges ? <Skeleton className="h-9 w-16" /> : (badges?.length ?? 0)}
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="flex items-center gap-2 text-muted-foreground text-sm">
							{newBadges.length > 0 && (
								<Badge variant="secondary" className="bg-amber-100 text-amber-700">
									{newBadges.length} new
								</Badge>
							)}
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Main Tabs */}
			<Tabs defaultValue="overview" className="space-y-6">
				<TabsList>
					<TabsTrigger value="overview">
						<Trans>Preview</Trans>
					</TabsTrigger>
					<TabsTrigger value="skills">
						<Trans>Skills</Trans>
					</TabsTrigger>
					<TabsTrigger value="badges" id="badges">
						<Trans>Badges</Trans>
					</TabsTrigger>
					<TabsTrigger value="cohort">
						<Trans>Comparison</Trans>
					</TabsTrigger>
				</TabsList>

				{/* Overview Tab */}
				<TabsContent value="overview" className="space-y-6">
					<div className="grid gap-6 lg:grid-cols-2">
						{/* Readiness Scores */}
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<TargetIcon className="size-5" />
									<Trans>Preparation</Trans>
								</CardTitle>
								<CardDescription>
									<Trans>Your readiness level by domain</Trans>
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								{isLoadingProgress ? (
									<div className="space-y-4">
										{[1, 2, 3].map((i) => (
											<div key={i} className="space-y-2">
												<Skeleton className="h-4 w-24" />
												<Skeleton className="h-2 w-full" />
											</div>
										))}
									</div>
								) : (
									<>
										<div className="space-y-2">
											<div className="flex items-center justify-between">
												<span className="flex items-center gap-2 font-medium text-sm">
													<BookOpenIcon className="size-4" />
													<Trans>Resume</Trans>
												</span>
												<span className="text-muted-foreground text-sm">{progress?.resumeCompleteness ?? 0}%</span>
											</div>
											<Progress value={progress?.resumeCompleteness ?? 0} className="h-2" />
										</div>
										<div className="space-y-2">
											<div className="flex items-center justify-between">
												<span className="flex items-center gap-2 font-medium text-sm">
													<UsersIcon className="size-4" />
													<Trans>Interview</Trans>
												</span>
												<span className="text-muted-foreground text-sm">{progress?.interviewReadiness ?? 0}%</span>
											</div>
											<Progress value={progress?.interviewReadiness ?? 0} className="h-2" />
										</div>
										<div className="space-y-2">
											<div className="flex items-center justify-between">
												<span className="flex items-center gap-2 font-medium text-sm">
													<BriefcaseIcon className="size-4" />
													<Trans>Job Search</Trans>
												</span>
												<span className="text-muted-foreground text-sm">{progress?.jobSearchReadiness ?? 0}%</span>
											</div>
											<Progress value={progress?.jobSearchReadiness ?? 0} className="h-2" />
										</div>
									</>
								)}
							</CardContent>
						</Card>

						{/* Activity Summary */}
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<ChartLineUpIcon className="size-5" />
									<Trans>Activity (30 days)</Trans>
								</CardTitle>
								<CardDescription>
									<Trans>Summary of your recent activities</Trans>
								</CardDescription>
							</CardHeader>
							<CardContent>
								{isLoadingStats ? (
									<div className="grid grid-cols-2 gap-4">
										{[1, 2, 3, 4].map((i) => (
											<Skeleton key={i} className="h-20 w-full" />
										))}
									</div>
								) : (
									<div className="grid grid-cols-2 gap-4">
										<div className="rounded-lg bg-muted/50 p-4 text-center">
											<p className="font-bold text-2xl">{activitySummary.lessons}</p>
											<p className="text-muted-foreground text-sm">
												<Trans>Lessons</Trans>
											</p>
										</div>
										<div className="rounded-lg bg-muted/50 p-4 text-center">
											<p className="font-bold text-2xl">{activitySummary.quizzes}</p>
											<p className="text-muted-foreground text-sm">Quiz</p>
										</div>
										<div className="rounded-lg bg-muted/50 p-4 text-center">
											<p className="font-bold text-2xl">{activitySummary.practice}</p>
											<p className="text-muted-foreground text-sm">
												<Trans>Practice</Trans>
											</p>
										</div>
										<div className="rounded-lg bg-muted/50 p-4 text-center">
											<p className="font-bold text-2xl">{progress?.totalPracticeTime ?? 0}</p>
											<p className="text-muted-foreground text-sm">Minutes</p>
										</div>
									</div>
								)}
							</CardContent>
						</Card>

						{/* Weak Areas */}
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<LightbulbIcon className="size-5" />
									<Trans>Areas to Improve</Trans>
								</CardTitle>
								<CardDescription>
									<Trans>Areas requiring more attention</Trans>
								</CardDescription>
							</CardHeader>
							<CardContent>
								{isLoadingWeakAreas ? (
									<div className="space-y-4">
										{[1, 2, 3].map((i) => (
											<Skeleton key={i} className="h-16 w-full" />
										))}
									</div>
								) : !weakAreas || weakAreas.length === 0 ? (
									<div className="flex flex-col items-center gap-4 py-8 text-center">
										<div className="flex size-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
											<CheckCircleIcon className="size-6 text-green-600" weight="fill" />
										</div>
										<p className="text-muted-foreground text-sm">
											<Trans>Excellent! No weaknesses detected.</Trans>
										</p>
									</div>
								) : (
									<div className="space-y-4">
										{weakAreas.slice(0, 3).map((area, index) => (
											<motion.div
												key={area.skillId}
												initial={{ opacity: 0, x: -20 }}
												animate={{ opacity: 1, x: 0 }}
												transition={{ delay: index * 0.1 }}
												className="rounded-lg border p-3"
											>
												<div className="mb-2 flex items-center justify-between">
													<span className="font-medium text-sm">{area.skillNameFr || area.skillName}</span>
													<div className="flex items-center gap-2">
														{area.recentTrend === "declining" && <ArrowDownIcon className="size-4 text-red-500" />}
														{area.recentTrend === "improving" && <ArrowUpIcon className="size-4 text-green-500" />}
														<Badge variant="outline">{area.averageScore}%</Badge>
													</div>
												</div>
												{area.suggestedActions.length > 0 && (
													<p className="text-muted-foreground text-xs">{area.suggestedActions[0]}</p>
												)}
											</motion.div>
										))}
									</div>
								)}
							</CardContent>
						</Card>

						{/* Weekly Progress Chart */}
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<ChartLineUpIcon className="size-5" />
									<Trans>Weekly Progress</Trans>
								</CardTitle>
								<CardDescription>
									<Trans>Evolution of your score over recent weeks</Trans>
								</CardDescription>
							</CardHeader>
							<CardContent>
								{isLoadingSnapshots ? (
									<Skeleton className="h-40 w-full" />
								) : !weeklySnapshots || weeklySnapshots.length === 0 ? (
									<div className="flex flex-col items-center gap-4 py-8 text-center">
										<div className="flex size-12 items-center justify-center rounded-full bg-muted">
											<ChartLineUpIcon className="size-6 text-muted-foreground" />
										</div>
										<p className="text-muted-foreground text-sm">
											<Trans>Not enough data yet to display progress</Trans>
										</p>
									</div>
								) : (
									<div className="space-y-3">
										{weeklySnapshots
											.slice(0, 6)
											.reverse()
											.map((snapshot, index) => {
												const prevScore = weeklySnapshots[index + 1]?.overallScore ?? snapshot.overallScore;
												const diff = snapshot.overallScore - prevScore;
												return (
													<div key={snapshot.id} className="flex items-center gap-4">
														<span className="w-20 shrink-0 text-muted-foreground text-xs">
															{snapshot.weekStartDate}
														</span>
														<div className="flex-1">
															<Progress value={snapshot.overallScore} className="h-3" />
														</div>
														<span className="flex w-16 items-center justify-end gap-1 text-sm">
															{snapshot.overallScore}%
															{diff !== 0 && (
																<span className={diff > 0 ? "text-green-500" : "text-red-500"}>
																	{diff > 0 ? "+" : ""}
																	{diff}
																</span>
															)}
														</span>
													</div>
												);
											})}
									</div>
								)}
							</CardContent>
						</Card>
					</div>
				</TabsContent>

				{/* Skills Tab */}
				<TabsContent value="skills" className="space-y-6">
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<GraduationCapIcon className="size-5" />
								<Trans>Skills Progress</Trans>
							</CardTitle>
							<CardDescription>
								<Trans>Track the evolution of your skills over time</Trans>
							</CardDescription>
						</CardHeader>
						<CardContent>
							{isLoadingWeakAreas ? (
								<div className="space-y-4">
									{[1, 2, 3].map((i) => (
										<Skeleton key={i} className="h-16 w-full" />
									))}
								</div>
							) : (
								<div className="flex flex-col items-center gap-4 py-8 text-center">
									<div className="flex size-12 items-center justify-center rounded-full bg-muted">
										<GraduationCapIcon className="size-6 text-muted-foreground" />
									</div>
									<p className="text-muted-foreground text-sm">
										<Trans>Start practicing to see your progress</Trans>
									</p>
									<Button asChild variant="outline" size="sm">
										<Link to="/dashboard/career/skills">
											<Trans>Add skills</Trans>
											<ArrowRightIcon className="ml-2 size-4" />
										</Link>
									</Button>
								</div>
							)}
						</CardContent>
					</Card>
				</TabsContent>

				{/* Badges Tab */}
				<TabsContent value="badges" className="space-y-6">
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<TrophyIcon className="size-5" />
								<Trans>Your Badges</Trans>
							</CardTitle>
							<CardDescription>
								<Trans>The rewards you have earned</Trans>
							</CardDescription>
						</CardHeader>
						<CardContent>
							{isLoadingBadges ? (
								<div className="grid grid-cols-2 gap-4 md:grid-cols-4">
									{[1, 2, 3, 4].map((i) => (
										<Skeleton key={i} className="h-32 w-full" />
									))}
								</div>
							) : !badges || badges.length === 0 ? (
								<div className="flex flex-col items-center gap-4 py-8 text-center">
									<div className="flex size-16 items-center justify-center rounded-full bg-muted">
										<MedalIcon className="size-8 text-muted-foreground" />
									</div>
									<div>
										<p className="font-medium">
											<Trans>No badges yet</Trans>
										</p>
										<p className="text-muted-foreground text-sm">
											<Trans>Complete activities to earn badges!</Trans>
										</p>
									</div>
									<Button asChild variant="outline" size="sm">
										<Link to="/dashboard/interview">
											<Trans>Start a practice</Trans>
											<ArrowRightIcon className="ml-2 size-4" />
										</Link>
									</Button>
								</div>
							) : (
								<div className="grid grid-cols-2 gap-4 md:grid-cols-4">
									{badges.map((badge, index) => {
										const IconComponent = badgeIcons[badge.badgeIcon] ?? TrophyIcon;
										return (
											<motion.div
												key={badge.id}
												initial={{ opacity: 0, scale: 0.8 }}
												animate={{ opacity: 1, scale: 1 }}
												transition={{ delay: index * 0.05 }}
												className={`relative rounded-lg border p-4 text-center ${badge.isNew ? "ring-2 ring-amber-500" : ""}`}
											>
												{badge.isNew && <Badge className="absolute -top-2 -right-2 bg-amber-500">New</Badge>}
												<div
													className={`mx-auto mb-3 flex size-12 items-center justify-center rounded-full ${tierColors[badge.tier] ?? "bg-gray-500"}`}
												>
													<IconComponent className="size-6" weight="fill" />
												</div>
												<p className="font-medium text-sm">{badge.badgeNameFr || badge.badgeName}</p>
												<p className="mt-1 text-muted-foreground text-xs capitalize">{badge.tier}</p>
												<p className="mt-1 text-muted-foreground text-xs">+{badge.xpAwarded} XP</p>
											</motion.div>
										);
									})}
								</div>
							)}
						</CardContent>
					</Card>
				</TabsContent>

				{/* Cohort Comparison Tab */}
				<TabsContent value="cohort" className="space-y-6">
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<UsersIcon className="size-5" />
								<Trans>Comparison with Cohort</Trans>
							</CardTitle>
							<CardDescription>
								<Trans>Your position compared to other students (anonymized)</Trans>
							</CardDescription>
						</CardHeader>
						<CardContent>
							{isLoadingComparison ? (
								<div className="space-y-6">
									<Skeleton className="h-24 w-full" />
									<Skeleton className="h-40 w-full" />
								</div>
							) : (
								<div className="space-y-6">
									{/* Rank Display */}
									<div className="flex items-center justify-center gap-8 rounded-lg bg-muted/50 py-6">
										<div className="text-center">
											<p className="font-bold text-4xl text-primary">#{cohortComparison?.rank ?? 0}</p>
											<p className="text-muted-foreground text-sm">
												<Trans>Your rank</Trans>
											</p>
										</div>
										<div className="h-12 w-px bg-border" />
										<div className="text-center">
											<p className="font-bold text-4xl">
												{cohortComparison?.totalInCohort ?? cohortComparison?.totalUsers ?? 0}
											</p>
											<p className="text-muted-foreground text-sm">
												<Trans>Students</Trans>
											</p>
										</div>
										<div className="h-12 w-px bg-border" />
										<div className="text-center">
											<p className="font-bold text-4xl text-green-500">Top {cohortComparison?.percentile ?? 50}%</p>
											<p className="text-muted-foreground text-sm">Percentile</p>
										</div>
									</div>

									{/* Comparison Details */}
									{cohortComparison?.comparison && (
										<div className="space-y-4">
											<h4 className="font-medium">
												<Trans>Detailed comparison</Trans>
											</h4>
											<div className="space-y-3">
												<div className="flex items-center justify-between rounded-lg border p-3">
													<span className="text-sm">
														<Trans>Overall score</Trans>
													</span>
													<div className="flex items-center gap-4">
														<span className="font-medium">{cohortComparison.comparison.userScore}%</span>
														<span className="text-muted-foreground text-sm">
															(<Trans>Average: {cohortComparison.comparison.avgScore}%</Trans>)
														</span>
														{cohortComparison.comparison.userScore >= cohortComparison.comparison.avgScore ? (
															<Badge variant="default" className="bg-green-500">
																Above
															</Badge>
														) : (
															<Badge variant="secondary">Below</Badge>
														)}
													</div>
												</div>
												<div className="flex items-center justify-between rounded-lg border p-3">
													<span className="text-sm">
														<Trans>Lessons completed</Trans>
													</span>
													<div className="flex items-center gap-4">
														<span className="font-medium">{cohortComparison.comparison.userLessons}</span>
														<span className="text-muted-foreground text-sm">
															(<Trans>Average: {cohortComparison.comparison.avgLessons}</Trans>)
														</span>
													</div>
												</div>
												<div className="flex items-center justify-between rounded-lg border p-3">
													<span className="text-sm">
														<Trans>Current streak</Trans>
													</span>
													<div className="flex items-center gap-4">
														<span className="font-medium">
															{cohortComparison.comparison.userStreak} <Trans>days</Trans>
														</span>
														<span className="text-muted-foreground text-sm">
															(<Trans>Average: {cohortComparison.comparison.avgStreak} days</Trans>)
														</span>
													</div>
												</div>
											</div>
										</div>
									)}
								</div>
							)}
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>

			{/* Quick Actions */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<TargetIcon className="size-5" />
						<Trans>Quick Actions</Trans>
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="grid gap-3 md:grid-cols-4">
						<Button asChild variant="outline" className="h-auto justify-start py-3">
							<Link to="/dashboard/interview">
								<UsersIcon className="mr-3 size-5" />
								<div className="text-left">
									<p className="font-medium">
										<Trans>Practice an interview</Trans>
									</p>
									<p className="text-muted-foreground text-xs">
										<Trans>Improve your performance</Trans>
									</p>
								</div>
							</Link>
						</Button>
						<Button asChild variant="outline" className="h-auto justify-start py-3">
							<Link to="/dashboard/resumes">
								<BookOpenIcon className="mr-3 size-5" />
								<div className="text-left">
									<p className="font-medium">
										<Trans>Edit your resume</Trans>
									</p>
									<p className="text-muted-foreground text-xs">
										<Trans>Increase your resume score</Trans>
									</p>
								</div>
							</Link>
						</Button>
						<Button asChild variant="outline" className="h-auto justify-start py-3">
							<Link to="/dashboard/career/skills">
								<GraduationCapIcon className="mr-3 size-5" />
								<div className="text-left">
									<p className="font-medium">
										<Trans>Add skills</Trans>
									</p>
									<p className="text-muted-foreground text-xs">
										<Trans>Track your development</Trans>
									</p>
								</div>
							</Link>
						</Button>
						<Button asChild variant="outline" className="h-auto justify-start py-3">
							<Link to="/dashboard/career">
								<TargetIcon className="mr-3 size-5" />
								<div className="text-left">
									<p className="font-medium">
										<Trans>Set a goal</Trans>
									</p>
									<p className="text-muted-foreground text-xs">
										<Trans>Plan your path</Trans>
									</p>
								</div>
							</Link>
						</Button>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
