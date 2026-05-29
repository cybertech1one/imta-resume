import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import {
	ArrowRightIcon,
	BriefcaseIcon,
	CalendarIcon,
	ChartBarIcon,
	ChartLineUpIcon,
	CheckCircleIcon,
	ClockIcon,
	FileTextIcon,
	RobotIcon,
	TargetIcon,
	TrendUpIcon,
	TrophyIcon,
} from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { useMemo, useState } from "react";
import { ErrorComponent } from "@/components/error-component";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { authClient } from "@/integrations/auth/client";
import { orpc } from "@/integrations/orpc/client";
import { DashboardHeader } from "../-components/header";

// biome-ignore lint/suspicious/noExplicitAny: Route path not in generated route tree
export const Route = createFileRoute("/dashboard/analytics/reports" as any)({
	component: WeeklyReports,
	errorComponent: ErrorComponent,
});

type ReportPeriod = "week" | "month" | "quarter";

function WeeklyReports() {
	const { data: session } = authClient.useSession();
	const [period, setPeriod] = useState<ReportPeriod>("week");

	// Fetch activities
	const { data: activities, isLoading: loadingActivities } = useQuery({
		...orpc.activity.list.queryOptions({ input: { limit: 50 } }),
		enabled: !!session?.user,
	});

	// Fetch goals
	const { data: goals, isLoading: loadingGoals } = useQuery({
		...orpc.goals.list.queryOptions({ input: { includeCompleted: true } }),
		enabled: !!session?.user,
	});

	// Fetch skills
	const { data: skills } = useQuery({
		...orpc.career.userSkills.list.queryOptions({}),
		enabled: !!session?.user,
	});

	// Fetch resumes
	const { data: resumes } = useQuery({
		...orpc.resume.list.queryOptions({ input: {} }),
		enabled: !!session?.user,
	});

	// Calculate period dates
	const periodDates = useMemo(() => {
		const now = new Date();
		const start = new Date();
		switch (period) {
			case "week":
				start.setDate(now.getDate() - 7);
				break;
			case "month":
				start.setMonth(now.getMonth() - 1);
				break;
			case "quarter":
				start.setMonth(now.getMonth() - 3);
				break;
		}
		return { start, end: now };
	}, [period]);

	// Filter data by period
	const periodActivities = useMemo(() => {
		if (!activities) return [];
		return activities.filter((a) => new Date(a.createdAt) >= periodDates.start);
	}, [activities, periodDates]);

	// Calculate metrics
	const metrics = useMemo(() => {
		const activityCount = periodActivities.length;

		// Activity breakdown
		const activityBreakdown: Record<string, number> = {};
		for (const activity of periodActivities) {
			const type = activity.type.split("_")[0];
			activityBreakdown[type] = (activityBreakdown[type] || 0) + 1;
		}

		// Goals progress
		const goalsCompleted =
			goals?.filter((g) => g.status === "completed" && g.completedAt && new Date(g.completedAt) >= periodDates.start)
				.length || 0;
		const goalsInProgress = goals?.filter((g) => g.status === "in_progress").length || 0;

		// Skills updated
		const skillsUpdated = skills?.filter((s) => new Date(s.updatedAt) >= periodDates.start).length || 0;

		// Resumes updated
		const resumesUpdated = resumes?.filter((r) => new Date(r.updatedAt) >= periodDates.start).length || 0;

		return {
			activityCount,
			activityBreakdown,
			goalsCompleted,
			goalsInProgress,
			skillsUpdated,
			resumesUpdated,
		};
	}, [periodActivities, skills, resumes, periodDates, goals?.filter]);

	// Top activities for the period
	const topActivities = useMemo(() => {
		const counts: Record<string, { count: number; label: string }> = {};
		const labels: Record<string, string> = {
			resume: t`Resumes`,
			job: t`Applications`,
			interview: t`Interviews`,
			skill: t`Skills`,
			goal: t`Goals`,
			training: t`Programs`,
			contact: t`Contacts`,
		};

		for (const activity of periodActivities) {
			const type = activity.type.split("_")[0];
			if (!counts[type]) {
				counts[type] = { count: 0, label: labels[type] || type };
			}
			counts[type].count++;
		}

		return Object.entries(counts)
			.sort((a, b) => b[1].count - a[1].count)
			.slice(0, 5);
	}, [periodActivities]);

	const periodLabels: Record<ReportPeriod, string> = {
		week: t`This Week`,
		month: t`This Month`,
		quarter: t`This Quarter`,
	};

	const isLoading = loadingActivities || loadingGoals;

	return (
		<div className="space-y-8">
			<DashboardHeader icon={ChartBarIcon} title={t`Reports`} />

			{/* Period Selector */}
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-2">
					<CalendarIcon className="size-5 text-muted-foreground" />
					<span className="font-medium">
						{periodDates.start.toLocaleDateString()} - {periodDates.end.toLocaleDateString()}
					</span>
				</div>
				<Select value={period} onValueChange={(v) => setPeriod(v as ReportPeriod)}>
					<SelectTrigger className="w-[180px]">
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="week">
							<Trans>This week</Trans>
						</SelectItem>
						<SelectItem value="month">
							<Trans>This month</Trans>
						</SelectItem>
						<SelectItem value="quarter">
							<Trans>This quarter</Trans>
						</SelectItem>
					</SelectContent>
				</Select>
			</div>

			{/* Summary Cards */}
			<div className="grid gap-4 md:grid-cols-4">
				<Card>
					<CardHeader className="pb-2">
						<CardDescription className="flex items-center gap-2">
							<ChartLineUpIcon className="size-4" />
							<Trans>Activities</Trans>
						</CardDescription>
						<CardTitle className="text-3xl">
							{isLoading ? <Skeleton className="h-9 w-16" /> : metrics.activityCount}
						</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-muted-foreground text-xs">{periodLabels[period]}</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="pb-2">
						<CardDescription className="flex items-center gap-2">
							<TargetIcon className="size-4" />
							<Trans>Goals Achieved</Trans>
						</CardDescription>
						<CardTitle className="text-3xl">
							{isLoading ? <Skeleton className="h-9 w-12" /> : metrics.goalsCompleted}
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="flex items-center gap-1 text-muted-foreground text-xs">
							<ClockIcon className="size-3" />
							<span>
								<Trans>{metrics.goalsInProgress} in progress</Trans>
							</span>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="pb-2">
						<CardDescription className="flex items-center gap-2">
							<FileTextIcon className="size-4" />
							<Trans>Resumes Updated</Trans>
						</CardDescription>
						<CardTitle className="text-3xl">
							{isLoading ? <Skeleton className="h-9 w-12" /> : metrics.resumesUpdated}
						</CardTitle>
					</CardHeader>
				</Card>

				<Card>
					<CardHeader className="pb-2">
						<CardDescription className="flex items-center gap-2">
							<TrendUpIcon className="size-4" />
							<Trans>Skills</Trans>
						</CardDescription>
						<CardTitle className="text-3xl">
							{isLoading ? <Skeleton className="h-9 w-12" /> : metrics.skillsUpdated}
						</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-muted-foreground text-xs">
							<Trans>updated</Trans>
						</p>
					</CardContent>
				</Card>
			</div>

			{/* Main Content */}
			<div className="grid gap-6 lg:grid-cols-2">
				{/* Activity Breakdown */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<ChartBarIcon className="size-5" />
							<Trans>Activity Breakdown</Trans>
						</CardTitle>
						<CardDescription>
							<Trans>Your activities by category for the period</Trans>
						</CardDescription>
					</CardHeader>
					<CardContent>
						{isLoading ? (
							<div className="space-y-4">
								{[1, 2, 3, 4].map((i) => (
									<div key={i} className="space-y-2">
										<div className="flex justify-between">
											<Skeleton className="h-4 w-24" />
											<Skeleton className="h-4 w-8" />
										</div>
										<Skeleton className="h-3 w-full" />
									</div>
								))}
							</div>
						) : topActivities.length === 0 ? (
							<div className="flex flex-col items-center gap-4 py-8 text-center">
								<div className="flex size-12 items-center justify-center rounded-full bg-muted">
									<ChartBarIcon className="size-6 text-muted-foreground" />
								</div>
								<p className="text-muted-foreground text-sm">
									<Trans>No activity for this period</Trans>
								</p>
							</div>
						) : (
							<div className="space-y-4">
								{topActivities.map(([type, data], index) => {
									const percentage = Math.round((data.count / metrics.activityCount) * 100);
									return (
										<motion.div
											key={type}
											initial={false}
											animate={{ opacity: 1, x: 0 }}
											transition={{ delay: index * 0.1 }}
											className="space-y-2"
										>
											<div className="flex items-center justify-between">
												<span className="font-medium text-sm">{data.label}</span>
												<span className="text-muted-foreground text-sm">
													{data.count} ({percentage}%)
												</span>
											</div>
											<Progress value={percentage} className="h-2" />
										</motion.div>
									);
								})}
							</div>
						)}
					</CardContent>
				</Card>

				{/* Highlights */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<TrophyIcon className="size-5" />
							<Trans>Strengths</Trans>
						</CardTitle>
						<CardDescription>
							<Trans>Your achievements for the period</Trans>
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="space-y-4">
							{metrics.goalsCompleted > 0 && (
								<motion.div
									initial={false}
									animate={{ opacity: 1, y: 0 }}
									className="flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 p-3 dark:border-green-900 dark:bg-green-950/30"
								>
									<div className="flex size-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/50">
										<CheckCircleIcon className="size-5 text-green-600" weight="duotone" />
									</div>
									<div>
										<p className="font-medium text-green-800 text-sm dark:text-green-200">
											<Trans>{metrics.goalsCompleted} goal(s) achieved</Trans>
										</p>
										<p className="text-green-600 text-xs dark:text-green-400">
											<Trans>Congratulations!</Trans>
										</p>
									</div>
								</motion.div>
							)}

							{metrics.resumesUpdated > 0 && (
								<motion.div
									initial={false}
									animate={{ opacity: 1, y: 0 }}
									transition={{ delay: 0.1 }}
									className="flex items-center gap-3 rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-900 dark:bg-blue-950/30"
								>
									<div className="flex size-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/50">
										<FileTextIcon className="size-5 text-blue-600" weight="duotone" />
									</div>
									<div>
										<p className="font-medium text-blue-800 text-sm dark:text-blue-200">
											<Trans>{metrics.resumesUpdated} resume(s) updated</Trans>
										</p>
										<p className="text-blue-600 text-xs dark:text-blue-400">
											<Trans>Keep your resume up to date</Trans>
										</p>
									</div>
								</motion.div>
							)}

							{metrics.skillsUpdated > 0 && (
								<motion.div
									initial={false}
									animate={{ opacity: 1, y: 0 }}
									transition={{ delay: 0.2 }}
									className="flex items-center gap-3 rounded-lg border border-purple-200 bg-purple-50 p-3 dark:border-purple-900 dark:bg-purple-950/30"
								>
									<div className="flex size-10 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/50">
										<TrendUpIcon className="size-5 text-purple-600" weight="duotone" />
									</div>
									<div>
										<p className="font-medium text-purple-800 text-sm dark:text-purple-200">
											<Trans>{metrics.skillsUpdated} skill(s) tracked</Trans>
										</p>
										<p className="text-purple-600 text-xs dark:text-purple-400">
											<Trans>Keep progressing</Trans>
										</p>
									</div>
								</motion.div>
							)}

							{metrics.activityCount === 0 && metrics.goalsCompleted === 0 && (
								<div className="flex flex-col items-center gap-4 py-4 text-center">
									<p className="text-muted-foreground text-sm">
										<Trans>No activity for this period yet</Trans>
									</p>
									<Button asChild variant="outline" size="sm">
										<Link to="/dashboard">
											<Trans>Start</Trans>
											<ArrowRightIcon className="ml-2 size-4" />
										</Link>
									</Button>
								</div>
							)}
						</div>
					</CardContent>
				</Card>

				{/* Quick Actions */}
				<Card className="lg:col-span-2">
					<CardHeader>
						<CardTitle>
							<Trans>Suggestions for the Next Period</Trans>
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="grid gap-3 md:grid-cols-3">
							<Button asChild variant="outline" className="h-auto justify-start py-3">
								<Link to="/dashboard/career">
									<TargetIcon className="mr-3 size-5 text-amber-500" />
									<div className="text-left">
										<p className="font-medium">
											<Trans>Set goals</Trans>
										</p>
										<p className="text-muted-foreground text-xs">
											<Trans>Plan your week</Trans>
										</p>
									</div>
								</Link>
							</Button>
							<Button asChild variant="outline" className="h-auto justify-start py-3">
								<Link to="/dashboard/interview">
									<RobotIcon className="mr-3 size-5 text-blue-500" />
									<div className="text-left">
										<p className="font-medium">
											<Trans>Practice an interview</Trans>
										</p>
										<p className="text-muted-foreground text-xs">
											<Trans>Improve your skills</Trans>
										</p>
									</div>
								</Link>
							</Button>
							<Button asChild variant="outline" className="h-auto justify-start py-3">
								<Link to="/dashboard/jobs">
									<BriefcaseIcon className="mr-3 size-5 text-green-500" />
									<div className="text-left">
										<p className="font-medium">
											<Trans>Explore offers</Trans>
										</p>
										<p className="text-muted-foreground text-xs">
											<Trans>Find your next opportunity</Trans>
										</p>
									</div>
								</Link>
							</Button>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
