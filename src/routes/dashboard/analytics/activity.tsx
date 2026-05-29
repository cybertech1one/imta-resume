import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import type { Icon } from "@phosphor-icons/react";
import {
	ArrowRightIcon,
	BriefcaseIcon,
	CalendarBlankIcon,
	ChartBarIcon,
	ChartLineUpIcon,
	ClockIcon,
	CursorClickIcon,
	FileTextIcon,
	GraduationCapIcon,
	PulseIcon,
	ReadCvLogoIcon,
	RobotIcon,
	ShareNetworkIcon,
	TargetIcon,
	TrashIcon,
	TrendUpIcon,
	TrophyIcon,
	UsersIcon,
} from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { useMemo, useState } from "react";
import { ErrorComponent } from "@/components/error-component";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { authClient } from "@/integrations/auth/client";
import { orpc } from "@/integrations/orpc/client";
import { cn } from "@/utils/style";
import { DashboardHeader } from "../-components/header";

// Simple relative time formatter
function formatRelativeTime(date: Date): string {
	const now = new Date();
	const diff = now.getTime() - date.getTime();
	const minutes = Math.floor(diff / 60000);
	const hours = Math.floor(diff / 3600000);
	const days = Math.floor(diff / 86400000);

	if (minutes < 1) return t`just now`;
	if (minutes < 60) return t`${minutes} min ago`;
	if (hours < 24) return t`${hours}h ago`;
	if (days < 7) return t`${days}d ago`;
	return date.toLocaleDateString();
}

// biome-ignore lint/suspicious/noExplicitAny: Route path not in generated route tree
export const Route = createFileRoute("/dashboard/analytics/activity" as any)({
	component: ActivityTracking,
	errorComponent: ErrorComponent,
});

// Activity type icons and colors - expanded for new types
// Note: labels use t`` macro for i18n. These are called at render time within the component.
function getActivityConfig(): Record<string, { icon: Icon; color: string; label: string }> {
	return {
		// Resume activities
		resume_created: { icon: FileTextIcon, color: "text-green-500", label: t`Resume created` },
		resume_updated: { icon: FileTextIcon, color: "text-blue-500", label: t`Resume updated` },
		resume_deleted: { icon: TrashIcon, color: "text-red-500", label: t`Resume deleted` },
		resume_viewed: { icon: FileTextIcon, color: "text-cyan-500", label: t`Resume viewed` },
		resume_downloaded: { icon: FileTextIcon, color: "text-indigo-500", label: t`Resume downloaded` },
		resume_shared: { icon: ShareNetworkIcon, color: "text-purple-500", label: t`Resume shared` },
		// Job application activities
		job_application_created: { icon: BriefcaseIcon, color: "text-purple-500", label: t`Application created` },
		job_application_updated: { icon: BriefcaseIcon, color: "text-purple-400", label: t`Application updated` },
		job_application_status_changed: {
			icon: BriefcaseIcon,
			color: "text-orange-500",
			label: t`Application status changed`,
		},
		job_application_deleted: { icon: TrashIcon, color: "text-red-400", label: t`Application deleted` },
		// Interview activities
		interview_scheduled: { icon: CalendarBlankIcon, color: "text-cyan-500", label: t`Interview scheduled` },
		interview_completed: { icon: CalendarBlankIcon, color: "text-green-500", label: t`Interview completed` },
		interview_cancelled: { icon: CalendarBlankIcon, color: "text-red-400", label: t`Interview cancelled` },
		interview_practice_started: { icon: RobotIcon, color: "text-indigo-500", label: t`Interview practice started` },
		interview_practice_completed: { icon: RobotIcon, color: "text-indigo-600", label: t`Interview practice completed` },
		// AI activities
		ai_content_generated: { icon: RobotIcon, color: "text-violet-500", label: t`AI content generated` },
		ai_resume_analyzed: { icon: RobotIcon, color: "text-violet-600", label: t`Resume analyzed by AI` },
		ai_interview_chat: { icon: RobotIcon, color: "text-violet-400", label: t`AI interview chat` },
		ai_cover_letter_generated: { icon: RobotIcon, color: "text-violet-700", label: t`AI cover letter` },
		// Skill activities
		skill_added: { icon: ChartLineUpIcon, color: "text-amber-500", label: t`Skill added` },
		skill_updated: { icon: ChartLineUpIcon, color: "text-amber-400", label: t`Skill updated` },
		skill_removed: { icon: ChartLineUpIcon, color: "text-amber-300", label: t`Skill removed` },
		// Goal activities
		goal_created: { icon: TargetIcon, color: "text-pink-500", label: t`Goal created` },
		goal_updated: { icon: TargetIcon, color: "text-pink-400", label: t`Goal updated` },
		goal_completed: { icon: TrophyIcon, color: "text-yellow-500", label: t`Goal achieved` },
		goal_deleted: { icon: TargetIcon, color: "text-pink-300", label: t`Goal deleted` },
		// Network activities
		contact_added: { icon: UsersIcon, color: "text-teal-500", label: t`Contact added` },
		contact_updated: { icon: UsersIcon, color: "text-teal-400", label: t`Contact updated` },
		contact_deleted: { icon: UsersIcon, color: "text-teal-300", label: t`Contact deleted` },
		networking_event_attended: { icon: UsersIcon, color: "text-teal-600", label: t`Networking event` },
		// Training activities
		training_started: { icon: GraduationCapIcon, color: "text-violet-500", label: t`Training started` },
		training_completed: { icon: GraduationCapIcon, color: "text-violet-600", label: t`Training completed` },
		certification_added: { icon: GraduationCapIcon, color: "text-violet-700", label: t`Certification added` },
		// Deadline activities
		deadline_created: { icon: ClockIcon, color: "text-rose-500", label: t`Deadline created` },
		deadline_completed: { icon: ClockIcon, color: "text-rose-600", label: t`Deadline completed` },
		// General activities
		page_view: { icon: CursorClickIcon, color: "text-gray-500", label: t`Page viewed` },
		feature_used: { icon: CursorClickIcon, color: "text-gray-400", label: t`Feature used` },
	};
}

// Category configuration
function getCategoryConfig(): Record<string, { icon: Icon; color: string; label: string; bgColor: string }> {
	return {
		resume: { icon: FileTextIcon, color: "text-blue-500", bgColor: "bg-blue-500/10", label: t`Resume & Documents` },
		career: { icon: TrendUpIcon, color: "text-green-500", bgColor: "bg-green-500/10", label: t`Career` },
		interview: { icon: CalendarBlankIcon, color: "text-cyan-500", bgColor: "bg-cyan-500/10", label: t`Interviews` },
		jobs: { icon: BriefcaseIcon, color: "text-purple-500", bgColor: "bg-purple-500/10", label: t`Jobs` },
		networking: { icon: UsersIcon, color: "text-teal-500", bgColor: "bg-teal-500/10", label: t`Networking` },
		ai: { icon: RobotIcon, color: "text-violet-500", bgColor: "bg-violet-500/10", label: t`AI` },
		training: { icon: GraduationCapIcon, color: "text-orange-500", bgColor: "bg-orange-500/10", label: t`Programs` },
		goals: { icon: TargetIcon, color: "text-pink-500", bgColor: "bg-pink-500/10", label: t`Goals` },
		general: { icon: CursorClickIcon, color: "text-gray-500", bgColor: "bg-gray-500/10", label: t`General` },
	};
}

function getActivityCategories() {
	return [
		{ value: "all", label: t`All activities` },
		{ value: "resume", label: t`Resume & Documents` },
		{ value: "jobs", label: t`Applications` },
		{ value: "interview", label: t`Interviews` },
		{ value: "ai", label: t`AI` },
		{ value: "career", label: t`Career` },
		{ value: "goals", label: t`Goals` },
		{ value: "networking", label: t`Networking` },
		{ value: "training", label: t`Programs` },
	];
}

function ActivityTracking() {
	const { data: session } = authClient.useSession();
	const activityConfig = getActivityConfig();
	const categoryConfig = getCategoryConfig();
	const activityCategories = getActivityCategories();
	const [selectedCategory, setSelectedCategory] = useState("all");
	const [limit, setLimit] = useState(20);
	const [activeTab, setActiveTab] = useState("activity");

	// Fetch recent activities using new userActivity router
	const {
		data: activities,
		isLoading: activitiesLoading,
		error: activitiesError,
	} = useQuery({
		...orpc.userActivity.getRecent.queryOptions({
			input: { limit: 100 },
		}),
		enabled: !!session?.user,
	});

	// Fetch activity stats
	const { data: stats, isLoading: statsLoading } = useQuery({
		...orpc.userActivity.getStats.queryOptions({
			input: {},
		}),
		enabled: !!session?.user,
	});

	// Fetch daily activity for chart
	const { data: dailyActivity, isLoading: dailyLoading } = useQuery({
		...orpc.userActivity.getDailyActivity.queryOptions({
			input: { days: 30 },
		}),
		enabled: !!session?.user,
	});

	// Fetch today and week counts
	const { data: todayCount } = useQuery({
		...orpc.userActivity.getTodayCount.queryOptions({}),
		enabled: !!session?.user,
	});

	const { data: weekCount } = useQuery({
		...orpc.userActivity.getWeekCount.queryOptions({}),
		enabled: !!session?.user,
	});

	const isLoading = activitiesLoading || statsLoading || dailyLoading || !activities;

	// Filter activities by category
	const filteredActivities = useMemo(() => {
		if (!activities) return [];
		if (selectedCategory === "all") return activities;
		return activities.filter((a) => a.category === selectedCategory);
	}, [activities, selectedCategory]);

	// Group activities by date
	const groupedActivities = useMemo(() => {
		const groups: Record<string, typeof filteredActivities> = {};
		for (const activity of filteredActivities.slice(0, limit)) {
			const date = new Date(activity.createdAt);
			const dateKey = date.toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long" });
			if (!groups[dateKey]) groups[dateKey] = [];
			groups[dateKey].push(activity);
		}
		return groups;
	}, [filteredActivities, limit]);

	// Calculate max daily count for chart scaling
	const maxDailyCount = useMemo(() => {
		if (!dailyActivity) return 1;
		return Math.max(1, ...dailyActivity.map((d) => d.count));
	}, [dailyActivity]);

	if (activitiesError) {
		return (
			<div className="space-y-8">
				<DashboardHeader icon={PulseIcon} title={t`Activity Tracking`} />
				<Card className="border-destructive">
					<CardContent className="p-6 text-center text-destructive">
						<Trans>Error loading activities</Trans>
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<div className="space-y-8">
			<DashboardHeader icon={PulseIcon} title={t`Activity Tracking`} />

			{/* Statistics Cards */}
			<div className="grid gap-4 md:grid-cols-4">
				<Card>
					<CardHeader className="pb-2">
						<CardDescription>
							<Trans>Total Activities</Trans>
						</CardDescription>
						<CardTitle className="text-3xl">
							{isLoading ? <Skeleton className="h-9 w-16" /> : (stats?.totalActivities ?? 0)}
						</CardTitle>
					</CardHeader>
				</Card>
				<Card>
					<CardHeader className="pb-2">
						<CardDescription>
							<Trans>Today</Trans>
						</CardDescription>
						<CardTitle className="text-3xl">
							{isLoading ? <Skeleton className="h-9 w-12" /> : (todayCount ?? 0)}
						</CardTitle>
					</CardHeader>
				</Card>
				<Card>
					<CardHeader className="pb-2">
						<CardDescription>
							<Trans>This Week</Trans>
						</CardDescription>
						<CardTitle className="text-3xl">
							{isLoading ? <Skeleton className="h-9 w-12" /> : (weekCount ?? 0)}
						</CardTitle>
					</CardHeader>
				</Card>
				<Card>
					<CardHeader className="pb-2">
						<CardDescription>
							<Trans>Average/Day</Trans>
						</CardDescription>
						<CardTitle className="text-3xl">
							{isLoading ? <Skeleton className="h-9 w-12" /> : (stats?.averagePerDay ?? 0).toFixed(1)}
						</CardTitle>
					</CardHeader>
				</Card>
			</div>

			{/* Tabs for different views */}
			<Tabs value={activeTab} onValueChange={setActiveTab}>
				<TabsList>
					<TabsTrigger value="activity">
						<PulseIcon className="mr-2 size-4" />
						<Trans>Activities</Trans>
					</TabsTrigger>
					<TabsTrigger value="stats">
						<ChartBarIcon className="mr-2 size-4" />
						<Trans>Statistics</Trans>
					</TabsTrigger>
					<TabsTrigger value="chart">
						<ChartLineUpIcon className="mr-2 size-4" />
						<Trans>Chart</Trans>
					</TabsTrigger>
				</TabsList>

				{/* Activity Feed Tab */}
				<TabsContent value="activity" className="space-y-6">
					{/* Filter */}
					<div className="flex items-center gap-4">
						<Select value={selectedCategory} onValueChange={setSelectedCategory}>
							<SelectTrigger className="w-[200px]">
								<SelectValue placeholder={t`Filter by category`} />
							</SelectTrigger>
							<SelectContent>
								{activityCategories.map((cat) => (
									<SelectItem key={cat.value} value={cat.value}>
										{cat.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
						<Badge variant="secondary">
							<Trans>{filteredActivities.length} activity(ies)</Trans>
						</Badge>
					</div>

					{/* Activity List */}
					{isLoading ? (
						<div className="space-y-4">
							{[1, 2, 3, 4, 5].map((i) => (
								<Card key={i}>
									<CardContent className="p-4">
										<div className="flex items-center gap-4">
											<Skeleton className="h-10 w-10 rounded-full" />
											<div className="flex-1 space-y-2">
												<Skeleton className="h-4 w-3/4" />
												<Skeleton className="h-3 w-1/2" />
											</div>
										</div>
									</CardContent>
								</Card>
							))}
						</div>
					) : filteredActivities.length === 0 ? (
						<Card>
							<CardContent className="flex flex-col items-center gap-4 p-12 text-center">
								<div className="flex size-16 items-center justify-center rounded-full bg-muted">
									<PulseIcon className="size-8 text-muted-foreground" />
								</div>
								<div className="space-y-2">
									<h3 className="font-semibold text-lg">
										<Trans>No activity</Trans>
									</h3>
									<p className="text-muted-foreground text-sm">
										<Trans>Start using the application to see your activity history here.</Trans>
									</p>
								</div>
								<div className="flex gap-2">
									<Button asChild variant="outline">
										<Link to="/dashboard/resumes">
											<ReadCvLogoIcon className="mr-2 size-4" />
											<Trans>Create a resume</Trans>
										</Link>
									</Button>
									<Button asChild>
										<Link to="/dashboard/interview">
											<RobotIcon className="mr-2 size-4" />
											<Trans>Practice an interview</Trans>
										</Link>
									</Button>
								</div>
							</CardContent>
						</Card>
					) : (
						<div className="space-y-6">
							{Object.entries(groupedActivities).map(([date, dayActivities]) => (
								<div key={date}>
									<h3 className="mb-3 font-medium text-muted-foreground text-sm capitalize">{date}</h3>
									<div className="space-y-2">
										{dayActivities.map((activity, index) => {
											const config = activityConfig[activity.activityType] || {
												icon: CursorClickIcon,
												color: "text-gray-500",
												label: activity.activityType,
											};
											const catConfig = categoryConfig[activity.category] || categoryConfig.general;
											const ActivityIcon = config.icon;
											const title = ((activity.metadata as Record<string, unknown>)?.title as string) || config.label;
											const description = (activity.metadata as Record<string, unknown>)?.description as string | null;

											return (
												<motion.div
													key={activity.id}
													initial={false}
													animate={{ opacity: 1, x: 0 }}
													transition={{ delay: index * 0.05 }}
												>
													<Card className="transition-colors hover:bg-muted/50">
														<CardContent className="flex items-center gap-4 p-4">
															<div
																className={cn(
																	"flex size-10 items-center justify-center rounded-full",
																	catConfig.bgColor,
																	config.color,
																)}
															>
																<ActivityIcon className="size-5" weight="duotone" />
															</div>
															<div className="min-w-0 flex-1">
																<p className="truncate font-medium">{title}</p>
																{description && <p className="truncate text-muted-foreground text-sm">{description}</p>}
															</div>
															<div className="text-right">
																<Badge variant="outline" className="mb-1">
																	{config.label}
																</Badge>
																<p className="text-muted-foreground text-xs">
																	{formatRelativeTime(new Date(activity.createdAt))}
																</p>
															</div>
														</CardContent>
													</Card>
												</motion.div>
											);
										})}
									</div>
								</div>
							))}

							{filteredActivities.length > limit && (
								<div className="flex justify-center">
									<Button variant="outline" onClick={() => setLimit((l) => l + 20)}>
										<Trans>Load more</Trans>
										<ArrowRightIcon className="ml-2 size-4" />
									</Button>
								</div>
							)}
						</div>
					)}
				</TabsContent>

				{/* Statistics Tab */}
				<TabsContent value="stats" className="space-y-6">
					<div className="grid gap-6 md:grid-cols-2">
						{/* By Category */}
						<Card>
							<CardHeader>
								<CardTitle>
									<Trans>By Category</Trans>
								</CardTitle>
								<CardDescription>
									<Trans>Breakdown of your activities by category</Trans>
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								{isLoading ? (
									<div className="space-y-3">
										{[1, 2, 3, 4].map((i) => (
											<Skeleton key={i} className="h-8 w-full" />
										))}
									</div>
								) : stats?.byCategory && stats.byCategory.length > 0 ? (
									stats.byCategory.map((cat) => {
										const catConfig = categoryConfig[cat.category] || categoryConfig.general;
										const CategoryIcon = catConfig.icon;
										const percentage = stats.totalActivities > 0 ? (cat.count / stats.totalActivities) * 100 : 0;

										return (
											<div key={cat.category} className="space-y-2">
												<div className="flex items-center justify-between">
													<div className="flex items-center gap-2">
														<CategoryIcon className={cn("size-4", catConfig.color)} />
														<span className="font-medium">{catConfig.label}</span>
													</div>
													<span className="text-muted-foreground text-sm">
														{cat.count} ({percentage.toFixed(0)}%)
													</span>
												</div>
												<Progress value={percentage} className="h-2" />
											</div>
										);
									})
								) : (
									<p className="text-center text-muted-foreground">
										<Trans>No data available</Trans>
									</p>
								)}
							</CardContent>
						</Card>

						{/* Top Activity Types */}
						<Card>
							<CardHeader>
								<CardTitle>
									<Trans>Activity Types</Trans>
								</CardTitle>
								<CardDescription>
									<Trans>Top 10 most frequent activity types</Trans>
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-3">
								{isLoading ? (
									<div className="space-y-3">
										{[1, 2, 3, 4, 5].map((i) => (
											<Skeleton key={i} className="h-6 w-full" />
										))}
									</div>
								) : stats?.byType && stats.byType.length > 0 ? (
									stats.byType.map((type) => {
										const config = activityConfig[type.type] || {
											icon: CursorClickIcon,
											color: "text-gray-500",
											label: type.type,
										};
										const TypeIcon = config.icon;

										return (
											<div key={type.type} className="flex items-center justify-between">
												<div className="flex items-center gap-2">
													<TypeIcon className={cn("size-4", config.color)} />
													<span className="text-sm">{config.label}</span>
												</div>
												<Badge variant="secondary">{type.count}</Badge>
											</div>
										);
									})
								) : (
									<p className="text-center text-muted-foreground">
										<Trans>No data available</Trans>
									</p>
								)}
							</CardContent>
						</Card>
					</div>

					{/* Most Active Day */}
					{stats?.mostActiveDay && (
						<Card>
							<CardHeader>
								<CardTitle>
									<Trans>Most Active Day</Trans>
								</CardTitle>
							</CardHeader>
							<CardContent>
								<p className="font-semibold text-2xl">
									{new Date(stats.mostActiveDay).toLocaleDateString(undefined, {
										weekday: "long",
										day: "numeric",
										month: "long",
										year: "numeric",
									})}
								</p>
							</CardContent>
						</Card>
					)}
				</TabsContent>

				{/* Chart Tab */}
				<TabsContent value="chart" className="space-y-6">
					<Card>
						<CardHeader>
							<CardTitle>
								<Trans>Activity of the Last 30 Days</Trans>
							</CardTitle>
							<CardDescription>
								<Trans>Number of activities per day</Trans>
							</CardDescription>
						</CardHeader>
						<CardContent>
							{dailyLoading ? (
								<div className="flex h-[200px] items-end justify-between gap-1">
									{Array.from({ length: 30 }).map((_, i) => (
										<Skeleton key={i} className="flex-1" style={{ height: `${Math.random() * 100 + 20}px` }} />
									))}
								</div>
							) : dailyActivity && dailyActivity.length > 0 ? (
								<div className="space-y-4">
									{/* Simple bar chart */}
									<div className="flex h-[200px] items-end justify-between gap-1">
										{dailyActivity.map((day) => {
											const height = maxDailyCount > 0 ? (day.count / maxDailyCount) * 100 : 0;
											const date = new Date(day.date);

											return (
												<div
													key={day.date}
													className="group relative flex-1"
													title={`${date.toLocaleDateString()}: ${day.count} activities`}
												>
													<div
														className="w-full rounded-t bg-primary/80 transition-colors hover:bg-primary"
														style={{ height: `${Math.max(4, height)}%` }}
													/>
													{/* Tooltip on hover */}
													<div className="invisible absolute bottom-full left-1/2 z-10 mb-2 -translate-x-1/2 whitespace-nowrap rounded bg-popover px-2 py-1 text-popover-foreground text-xs shadow-md group-hover:visible">
														{date.toLocaleDateString(undefined, { day: "numeric", month: "short" })}: {day.count}
													</div>
												</div>
											);
										})}
									</div>

									{/* X-axis labels (every 5 days) */}
									<div className="flex justify-between text-muted-foreground text-xs">
										{dailyActivity
											.filter((_, i) => i % 5 === 0 || i === dailyActivity.length - 1)
											.map((day) => (
												<span key={day.date}>
													{new Date(day.date).toLocaleDateString(undefined, { day: "numeric", month: "short" })}
												</span>
											))}
									</div>

									{/* Summary */}
									<div className="flex justify-between border-t pt-4">
										<div>
											<p className="text-muted-foreground text-sm">
												<Trans>Total over 30 days</Trans>
											</p>
											<p className="font-semibold text-xl">{dailyActivity.reduce((sum, d) => sum + d.count, 0)}</p>
										</div>
										<div>
											<p className="text-muted-foreground text-sm">
												<Trans>Most active day</Trans>
											</p>
											<p className="font-semibold text-xl">{maxDailyCount}</p>
										</div>
									</div>
								</div>
							) : (
								<div className="flex h-[200px] items-center justify-center text-muted-foreground">
									<Trans>No data available</Trans>
								</div>
							)}
						</CardContent>
					</Card>

					{/* Category breakdown per day (simplified) */}
					{dailyActivity && dailyActivity.length > 0 && (
						<Card>
							<CardHeader>
								<CardTitle>
									<Trans>Trends by Category</Trans>
								</CardTitle>
								<CardDescription>
									<Trans>Evolution of activity categories</Trans>
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="space-y-4">
									{Object.entries(categoryConfig).map(([key, config]) => {
										const CategoryIcon = config.icon;
										const totalForCategory = dailyActivity.reduce((sum, day) => {
											const catData = day.byCategory.find((c) => c.category === key);
											return sum + (catData?.count ?? 0);
										}, 0);

										if (totalForCategory === 0) return null;

										const totalAll = dailyActivity.reduce((sum, d) => sum + d.count, 0);
										const percentage = totalAll > 0 ? (totalForCategory / totalAll) * 100 : 0;

										return (
											<div key={key} className="space-y-2">
												<div className="flex items-center justify-between">
													<div className="flex items-center gap-2">
														<CategoryIcon className={cn("size-4", config.color)} />
														<span className="font-medium">{config.label}</span>
													</div>
													<span className="text-muted-foreground text-sm">
														{totalForCategory} ({percentage.toFixed(0)}%)
													</span>
												</div>
												<Progress value={percentage} className="h-2" />
											</div>
										);
									})}
								</div>
							</CardContent>
						</Card>
					)}
				</TabsContent>
			</Tabs>
		</div>
	);
}
