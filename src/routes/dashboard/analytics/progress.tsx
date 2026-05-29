import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import {
	ArrowRightIcon,
	BookOpenIcon,
	BriefcaseIcon,
	ChartBarIcon,
	ChartLineUpIcon,
	CheckCircleIcon,
	ClockIcon,
	FireIcon,
	GraduationCapIcon,
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
import { authClient } from "@/integrations/auth/client";
import { orpc } from "@/integrations/orpc/client";
import { DashboardHeader } from "../-components/header";

// biome-ignore lint/suspicious/noExplicitAny: Route path not in generated route tree
export const Route = createFileRoute("/dashboard/analytics/progress" as any)({
	component: ProgressAnalytics,
	errorComponent: ErrorComponent,
});

function ProgressAnalytics() {
	const { data: session } = authClient.useSession();

	// Fetch skills data
	const { data: skills, isLoading: isLoadingSkills } = useQuery({
		...orpc.career.userSkills.list.queryOptions({}),
		enabled: !!session?.user,
	});

	// Fetch goals from backend
	const { data: goalsData, isLoading: isLoadingGoals } = useQuery({
		...orpc.goals.list.queryOptions({ includeCompleted: true }),
		enabled: !!session?.user,
	});
	const goals = goalsData ?? [];

	// Fetch achievements from backend
	const { data: achievementsData, isLoading: isLoadingAchievements } = useQuery({
		...orpc.achievements.getUserAchievementsWithDefinitions.queryOptions({}),
		enabled: !!session?.user,
	});
	const achievements = (achievementsData ?? []).map((a) => ({
		id: a.definition.id,
		title: a.definition.title,
		description: a.definition.description,
	}));

	// Calculate goal stats
	const goalStats = useMemo(() => {
		if (!goals) return { total: 0, completed: 0, inProgress: 0, avgProgress: 0 };
		const completed = goals.filter((g) => g.status === "completed").length;
		const inProgress = goals.filter((g) => g.status === "in_progress").length;
		const avgProgress =
			goals.length > 0 ? Math.round(goals.reduce((sum, g) => sum + (g.progress || 0), 0) / goals.length) : 0;
		return { total: goals.length, completed, inProgress, avgProgress };
	}, [goals]);

	// Calculate skill progress
	const skillProgress = useMemo(() => {
		if (!skills || skills.length === 0) return { avgRating: 0, avgTarget: 0, completion: 0 };
		const avgRating = skills.reduce((sum, s) => sum + (s.rating || 0), 0) / skills.length;
		const avgTarget = skills.reduce((sum, s) => sum + (s.targetRating || 5), 0) / skills.length;
		const completion = avgTarget > 0 ? Math.round((avgRating / avgTarget) * 100) : 0;
		return { avgRating: Math.round(avgRating * 10) / 10, avgTarget: Math.round(avgTarget * 10) / 10, completion };
	}, [skills]);

	const isLoading = isLoadingGoals || isLoadingSkills || isLoadingAchievements;

	// Group goals by category
	const goalsByCategory = useMemo(() => {
		if (!goals) return {};
		const grouped: Record<string, typeof goals> = {};
		for (const goal of goals) {
			const cat = goal.category || "other";
			if (!grouped[cat]) grouped[cat] = [];
			grouped[cat].push(goal);
		}
		return grouped;
	}, [goals]);

	const categoryIcons: Record<string, typeof TargetIcon> = {
		career: BriefcaseIcon,
		skill: ChartLineUpIcon,
		education: GraduationCapIcon,
		networking: UsersIcon,
		financial: StarIcon,
		other: TargetIcon,
	};

	const categoryLabels: Record<string, string> = {
		career: t`Career`,
		skill: t`Skills`,
		education: t`Education`,
		networking: t`Networking`,
		financial: t`Financial`,
		other: t`Other`,
	};

	return (
		<div className="space-y-8">
			<DashboardHeader icon={TrendUpIcon} title={t`Progress Analysis`} />

			{/* Summary Cards */}
			<div className="grid gap-4 md:grid-cols-4">
				<Card>
					<CardHeader className="pb-2">
						<CardDescription className="flex items-center gap-2">
							<TargetIcon className="size-4" />
							<Trans>Goals</Trans>
						</CardDescription>
						<CardTitle className="text-3xl">
							{isLoading ? <Skeleton className="h-9 w-16" /> : goalStats.total}
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="flex items-center gap-2 text-muted-foreground text-sm">
							<CheckCircleIcon className="size-4 text-green-500" />
							<span>
								<Trans>{goalStats.completed} completes</Trans>
							</span>
							<span className="text-muted-foreground/50">|</span>
							<ClockIcon className="size-4 text-blue-500" />
							<span>
								<Trans>{goalStats.inProgress} in progress</Trans>
							</span>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="pb-2">
						<CardDescription className="flex items-center gap-2">
							<ChartBarIcon className="size-4" />
							<Trans>Average Progress</Trans>
						</CardDescription>
						<CardTitle className="text-3xl">
							{isLoading ? <Skeleton className="h-9 w-16" /> : `${goalStats.avgProgress}%`}
						</CardTitle>
					</CardHeader>
					<CardContent>
						<Progress value={goalStats.avgProgress} className="h-2" />
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="pb-2">
						<CardDescription className="flex items-center gap-2">
							<ChartLineUpIcon className="size-4" />
							<Trans>Skills</Trans>
						</CardDescription>
						<CardTitle className="text-3xl">
							{isLoading ? <Skeleton className="h-9 w-16" /> : skills?.length || 0}
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="flex items-center gap-2 text-muted-foreground text-sm">
							<span>
								<Trans>Average level: {skillProgress.avgRating}/5</Trans>
							</span>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="pb-2">
						<CardDescription className="flex items-center gap-2">
							<TrophyIcon className="size-4" />
							<Trans>Success</Trans>
						</CardDescription>
						<CardTitle className="text-3xl">
							{isLoading ? <Skeleton className="h-9 w-16" /> : achievements?.length || 0}
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="flex items-center gap-2 text-muted-foreground text-sm">
							<MedalIcon className="size-4 text-amber-500" />
							<span>
								<Trans>Unlocked</Trans>
							</span>
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Main Content */}
			<div className="grid gap-6 lg:grid-cols-2">
				{/* Goals by Category */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<TargetIcon className="size-5" />
							<Trans>Goals by Category</Trans>
						</CardTitle>
						<CardDescription>
							<Trans>Progress of your goals by domain</Trans>
						</CardDescription>
					</CardHeader>
					<CardContent>
						{isLoadingGoals ? (
							<div className="space-y-4">
								{[1, 2, 3].map((i) => (
									<div key={i} className="flex items-center gap-3">
										<Skeleton className="h-10 w-10 rounded-full" />
										<div className="flex-1 space-y-2">
											<Skeleton className="h-4 w-24" />
											<Skeleton className="h-2 w-full" />
										</div>
									</div>
								))}
							</div>
						) : Object.keys(goalsByCategory).length === 0 ? (
							<div className="flex flex-col items-center gap-4 py-8 text-center">
								<div className="flex size-12 items-center justify-center rounded-full bg-muted">
									<TargetIcon className="size-6 text-muted-foreground" />
								</div>
								<p className="text-muted-foreground text-sm">
									<Trans>No goals defined</Trans>
								</p>
								<Button asChild variant="outline" size="sm">
									<Link to="/dashboard/career">
										<Trans>Create a goal</Trans>
										<ArrowRightIcon className="ml-2 size-4" />
									</Link>
								</Button>
							</div>
						) : (
							<div className="space-y-4">
								{Object.entries(goalsByCategory).map(([category, catGoals]) => {
									const CategoryIcon = categoryIcons[category] || TargetIcon;
									const completed = catGoals.filter((g) => g.status === "completed").length;
									const progress = catGoals.length > 0 ? Math.round((completed / catGoals.length) * 100) : 0;

									return (
										<motion.div
											key={category}
											initial={false}
											animate={{ opacity: 1, x: 0 }}
											className="flex items-center gap-3"
										>
											<div className="flex size-10 items-center justify-center rounded-full bg-muted">
												<CategoryIcon className="size-5" weight="duotone" />
											</div>
											<div className="min-w-0 flex-1">
												<div className="mb-1 flex items-center justify-between">
													<span className="font-medium text-sm">{categoryLabels[category] || category}</span>
													<span className="text-muted-foreground text-xs">
														{completed}/{catGoals.length}
													</span>
												</div>
												<Progress value={progress} className="h-2" />
											</div>
										</motion.div>
									);
								})}
							</div>
						)}
					</CardContent>
				</Card>

				{/* Skill Development */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<ChartLineUpIcon className="size-5" />
							<Trans>Skills Development</Trans>
						</CardTitle>
						<CardDescription>
							<Trans>Your progress toward your skill goals</Trans>
						</CardDescription>
					</CardHeader>
					<CardContent>
						{isLoadingSkills ? (
							<div className="space-y-4">
								{[1, 2, 3].map((i) => (
									<div key={i} className="space-y-2">
										<div className="flex justify-between">
											<Skeleton className="h-4 w-24" />
											<Skeleton className="h-4 w-12" />
										</div>
										<Skeleton className="h-2 w-full" />
									</div>
								))}
							</div>
						) : !skills || skills.length === 0 ? (
							<div className="flex flex-col items-center gap-4 py-8 text-center">
								<div className="flex size-12 items-center justify-center rounded-full bg-muted">
									<ChartLineUpIcon className="size-6 text-muted-foreground" />
								</div>
								<p className="text-muted-foreground text-sm">
									<Trans>No skills tracked</Trans>
								</p>
								<Button asChild variant="outline" size="sm">
									<Link to="/dashboard/career/skills">
										<Trans>Add skills</Trans>
										<ArrowRightIcon className="ml-2 size-4" />
									</Link>
								</Button>
							</div>
						) : (
							<div className="space-y-4">
								{skills.slice(0, 5).map((skill, index) => {
									const progress = skill.targetRating
										? Math.round((skill.rating / skill.targetRating) * 100)
										: Math.round((skill.rating / 5) * 100);

									return (
										<motion.div
											key={skill.id}
											initial={false}
											animate={{ opacity: 1, x: 0 }}
											transition={{ delay: index * 0.1 }}
											className="space-y-2"
										>
											<div className="flex items-center justify-between">
												<span className="truncate font-medium text-sm">{skill.name || skill.nameFr}</span>
												<Badge variant="outline" className="shrink-0">
													{skill.rating}/{skill.targetRating || 5}
												</Badge>
											</div>
											<Progress value={progress} className="h-2" />
										</motion.div>
									);
								})}
								{skills.length > 5 && (
									<Button asChild variant="ghost" size="sm" className="w-full">
										<Link to="/dashboard/career/skills">
											<Trans>View all skills</Trans>
											<ArrowRightIcon className="ml-2 size-4" />
										</Link>
									</Button>
								)}
							</div>
						)}
					</CardContent>
				</Card>

				{/* Recent Achievements */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<TrophyIcon className="size-5" />
							<Trans>Recent Achievements</Trans>
						</CardTitle>
						<CardDescription>
							<Trans>Your latest accomplishments</Trans>
						</CardDescription>
					</CardHeader>
					<CardContent>
						{!achievements || achievements.length === 0 ? (
							<div className="flex flex-col items-center gap-4 py-8 text-center">
								<div className="flex size-12 items-center justify-center rounded-full bg-muted">
									<TrophyIcon className="size-6 text-muted-foreground" />
								</div>
								<p className="text-muted-foreground text-sm">
									<Trans>Keep progressing to unlock achievements</Trans>
								</p>
							</div>
						) : (
							<div className="space-y-3">
								{achievements.slice(0, 4).map((achievement, index) => (
									<motion.div
										key={achievement.id}
										initial={false}
										animate={{ opacity: 1, y: 0 }}
										transition={{ delay: index * 0.1 }}
										className="flex items-center gap-3 rounded-lg border p-3"
									>
										<div className="flex size-10 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
											<MedalIcon className="size-5 text-amber-600" weight="duotone" />
										</div>
										<div className="min-w-0 flex-1">
											<p className="truncate font-medium text-sm">{achievement.title}</p>
											{achievement.description && (
												<p className="truncate text-muted-foreground text-xs">{achievement.description}</p>
											)}
										</div>
									</motion.div>
								))}
							</div>
						)}
					</CardContent>
				</Card>

				{/* Quick Actions */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<FireIcon className="size-5" />
							<Trans>Quick Actions</Trans>
						</CardTitle>
						<CardDescription>
							<Trans>Keep progressing</Trans>
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="grid gap-3">
							<Button asChild variant="outline" className="h-auto justify-start py-3">
								<Link to="/dashboard/career">
									<TargetIcon className="mr-3 size-5" />
									<div className="text-left">
										<p className="font-medium">
											<Trans>Set a goal</Trans>
										</p>
										<p className="text-muted-foreground text-xs">
											<Trans>Plan your progress</Trans>
										</p>
									</div>
								</Link>
							</Button>
							<Button asChild variant="outline" className="h-auto justify-start py-3">
								<Link to="/dashboard/career/skills">
									<ChartLineUpIcon className="mr-3 size-5" />
									<div className="text-left">
										<p className="font-medium">
											<Trans>Track a skill</Trans>
										</p>
										<p className="text-muted-foreground text-xs">
											<Trans>Measure your development</Trans>
										</p>
									</div>
								</Link>
							</Button>
							<Button asChild variant="outline" className="h-auto justify-start py-3">
								<Link to="/dashboard/interview">
									<BookOpenIcon className="mr-3 size-5" />
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
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
