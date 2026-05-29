import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import type { Icon } from "@phosphor-icons/react";
import {
	ArrowRightIcon,
	BellIcon,
	CalendarIcon,
	CaretRightIcon,
	ChatsCircleIcon,
	CheckCircleIcon,
	ClockIcon,
	CompassIcon,
	FileTextIcon,
	FlagIcon,
	GearSixIcon,
	GlobeIcon,
	GraduationCapIcon,
	LightbulbIcon,
	LockIcon,
	MedalIcon,
	PaintBrushIcon,
	PencilSimpleIcon,
	ReadCvLogoIcon,
	ShieldCheckIcon,
	TrendUpIcon,
	TrophyIcon,
	UserCircleIcon,
} from "@phosphor-icons/react";
import { Link } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { TabsContent } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { getInitials } from "@/utils/string";
import { cn } from "@/utils/style";
import { DashboardHeader } from "../../-components/header";
import { ACHIEVEMENTS, ACTIVITY_CONFIG, ANIMATION_VARIANTS, GOAL_TEMPLATES } from "./profile-config";
import type { Achievement, AchievementWithStatus, ActivityItem, GoalTemplate, ProfileStats } from "./profile-types";
import { formatDate, formatRelativeTime } from "./profile-utils";

function ProgressRing({
	value,
	size = 120,
	strokeWidth = 10,
	className,
}: {
	value: number;
	size?: number;
	strokeWidth?: number;
	className?: string;
}) {
	const radius = (size - strokeWidth) / 2;
	const circumference = radius * 2 * Math.PI;
	const offset = circumference - (value / 100) * circumference;

	return (
		<div className={cn("relative", className)} style={{ width: size, height: size }}>
			<svg className="rotate-[-90deg]" width={size} height={size}>
				<circle
					cx={size / 2}
					cy={size / 2}
					r={radius}
					stroke="currentColor"
					strokeWidth={strokeWidth}
					fill="none"
					className="text-muted"
				/>
				<motion.circle
					cx={size / 2}
					cy={size / 2}
					r={radius}
					stroke="url(#progressGradient)"
					strokeWidth={strokeWidth}
					fill="none"
					strokeLinecap="round"
					initial={{ strokeDashoffset: circumference }}
					animate={{ strokeDashoffset: offset }}
					transition={{ duration: 1.5, ease: "easeOut" }}
					style={{ strokeDasharray: circumference }}
				/>
				<defs>
					<linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
						<stop offset="0%" stopColor="oklch(0.65 0.2 280)" />
						<stop offset="50%" stopColor="oklch(0.6 0.2 200)" />
						<stop offset="100%" stopColor="oklch(0.55 0.2 150)" />
					</linearGradient>
				</defs>
			</svg>
			<div className="absolute inset-0 flex flex-col items-center justify-center">
				<motion.span
					className="font-bold text-3xl"
					initial={false}
					animate={{ opacity: 1, scale: 1 }}
					transition={{ delay: 0.5, duration: 0.5 }}
				>
					{value}%
				</motion.span>
				<span className="text-muted-foreground text-xs">Score</span>
			</div>
		</div>
	);
}

function AchievementBadge({
	achievement,
	isUnlocked,
	progress,
	onNewBadge,
}: {
	achievement: Achievement;
	isUnlocked: boolean;
	progress: number;
	onNewBadge?: () => void;
}) {
	const [showAnimation, setShowAnimation] = useState(false);

	useEffect(() => {
		if (isUnlocked && onNewBadge) {
			setShowAnimation(true);
			const timer = setTimeout(() => setShowAnimation(false), 2000);
			return () => clearTimeout(timer);
		}
	}, [isUnlocked, onNewBadge]);

	return (
		<Tooltip>
			<TooltipTrigger asChild>
				<motion.div
					className={cn(
						"relative flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all",
						isUnlocked
							? `${achievement.borderColor} ${achievement.bgColor}`
							: "border-muted-foreground/30 border-dashed bg-muted/30 opacity-60",
					)}
					whileHover={{ scale: 1.05 }}
					whileTap={{ scale: 0.95 }}
				>
					{showAnimation && (
						<motion.div
							className="pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-r from-amber-500/30 via-yellow-500/30 to-amber-500/30"
							initial={false}
							animate={{ opacity: [0, 1, 0] }}
							transition={{ duration: 1.5, repeat: 2 }}
						/>
					)}
					<div
						className={cn(
							"relative flex size-12 items-center justify-center rounded-full",
							isUnlocked ? achievement.bgColor : "bg-muted",
						)}
					>
						{isUnlocked ? (
							<achievement.icon className={cn("size-6", achievement.color)} weight="duotone" />
						) : (
							<LockIcon className="size-5 text-muted-foreground" />
						)}
						{isUnlocked && (
							<motion.div
								className="absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full bg-green-500"
								initial={{ scale: 0 }}
								animate={{ scale: 1 }}
								transition={{ type: "spring", delay: 0.3 }}
							>
								<CheckCircleIcon className="size-3 text-white" weight="bold" />
							</motion.div>
						)}
					</div>
					<span className={cn("text-center font-medium text-sm", isUnlocked ? "" : "text-muted-foreground")}>
						{achievement.title}
					</span>
					{!isUnlocked && progress > 0 && (
						<div className="w-full">
							<Progress value={(progress / achievement.requiredValue) * 100} className="h-1" />
							<span className="text-muted-foreground text-xs">
								{progress}/{achievement.requiredValue}
							</span>
						</div>
					)}
				</motion.div>
			</TooltipTrigger>
			<TooltipContent>
				<p className="font-medium">{achievement.title}</p>
				<p className="text-muted-foreground text-xs">{achievement.description}</p>
			</TooltipContent>
		</Tooltip>
	);
}

function SettingsQuickLink({
	icon: IconComponent,
	label,
	href,
	description,
}: {
	icon: Icon;
	label: string;
	href: string;
	description: string;
}) {
	return (
		<Link to={href as "/dashboard/settings/profile"}>
			<motion.div
				className="group flex items-center gap-4 rounded-xl border p-4 transition-all hover:border-primary/50 hover:bg-muted/50"
				whileHover={{ x: 4 }}
			>
				<div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
					<IconComponent className="size-5 text-primary" weight="duotone" />
				</div>
				<div className="min-w-0 flex-1">
					<p className="font-medium">{label}</p>
					<p className="truncate text-muted-foreground text-sm">{description}</p>
				</div>
				<CaretRightIcon className="size-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
			</motion.div>
		</Link>
	);
}

export function ProfileLoadingSkeleton() {
	return (
		<div className="space-y-6">
			<DashboardHeader icon={UserCircleIcon} title={t`My Profile`} />

			<div className="space-y-6 rounded-2xl border bg-gradient-to-br from-primary/5 to-transparent p-8">
				<div className="flex flex-col gap-6 md:flex-row md:items-start">
					<Skeleton className="size-24 rounded-full" />
					<div className="flex-1 space-y-4">
						<Skeleton className="h-8 w-48" />
						<Skeleton className="h-6 w-64" />
						<div className="flex flex-wrap gap-2">
							{Array.from({ length: 3 }).map((_, i) => (
								<Skeleton key={i} className="h-8 w-24" />
							))}
						</div>
					</div>
					<Skeleton className="h-10 w-32" />
				</div>
			</div>

			<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
				{Array.from({ length: 4 }).map((_, i) => (
					<Skeleton key={i} className="h-32 rounded-xl" />
				))}
			</div>

			<div className="space-y-4">
				<div className="flex gap-2">
					{Array.from({ length: 4 }).map((_, i) => (
						<Skeleton key={i} className="h-10 w-28 rounded-full" />
					))}
				</div>
				<div className="grid gap-6 md:grid-cols-2">
					{Array.from({ length: 4 }).map((_, i) => (
						<Skeleton key={i} className="h-64 rounded-xl" />
					))}
				</div>
			</div>
		</div>
	);
}

export function ProfileHeaderCard({
	user,
	memberSince,
	unlockedCount,
	overallProgress,
}: {
	user: { name: string; email: string; username?: string | null; image?: string | null };
	memberSince: Date;
	unlockedCount: number;
	overallProgress: number;
}) {
	return (
		<motion.div variants={ANIMATION_VARIANTS.item}>
			<Card className="overflow-hidden">
				<div className="relative h-32 bg-gradient-to-r from-primary/20 via-purple-500/20 to-blue-500/20">
					<div className="pointer-events-none absolute inset-0 overflow-hidden">
						<motion.div
							className="absolute -top-20 -right-20 size-64 rounded-full bg-gradient-to-br from-primary/30 to-transparent blur-3xl"
							animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
							transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
						/>
					</div>
				</div>

				<CardContent className="relative -mt-16 px-6 pb-6">
					<div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
						<div className="flex flex-col items-center gap-4 md:flex-row md:items-end">
							<motion.div initial={false} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring" }}>
								<Avatar className="size-28 border-4 border-background shadow-xl">
									<AvatarImage src={user.image ?? undefined} />
									<AvatarFallback className="bg-primary/10 font-bold text-3xl">{getInitials(user.name)}</AvatarFallback>
								</Avatar>
							</motion.div>

							<div className="text-center md:text-left">
								<h2 className="font-bold text-2xl">{user.name}</h2>
								<p className="text-muted-foreground">@{user.username || user.email.split("@")[0]}</p>
								<div className="mt-2 flex flex-wrap items-center justify-center gap-2 md:justify-start">
									<Badge variant="outline" className="gap-1">
										<CalendarIcon className="size-3" />
										<Trans>Member since</Trans> {formatDate(memberSince)}
									</Badge>
									<Badge variant="outline" className="gap-1 border-amber-500/50 bg-amber-500/10 text-amber-600">
										<TrophyIcon className="size-3" weight="fill" />
										<Trans>
											{unlockedCount}/{ACHIEVEMENTS.length} badges
										</Trans>
									</Badge>
								</div>
							</div>
						</div>

						<div className="flex flex-col items-center gap-4 md:flex-row">
							<ProgressRing value={overallProgress} size={100} strokeWidth={8} />
							<Link to="/dashboard/settings/profile">
								<Button className="gap-2">
									<PencilSimpleIcon className="size-4" />
									<Trans>Edit profile</Trans>
								</Button>
							</Link>
						</div>
					</div>
				</CardContent>
			</Card>
		</motion.div>
	);
}

export function OverviewTab({
	stats,
	achievementsStatus,
	unlockedCount,
	setActiveTab,
}: {
	stats: ProfileStats;
	achievementsStatus: AchievementWithStatus[];
	unlockedCount: number;
	setActiveTab: (tab: string) => void;
}) {
	return (
		<TabsContent value="overview" className="space-y-6 pt-6">
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				<motion.div whileHover={{ scale: 1.02 }} transition={{ type: "spring", stiffness: 300 }}>
					<Card className="relative overflow-hidden border-blue-500/20 bg-gradient-to-br from-blue-500/10 via-blue-500/5 to-transparent">
						<CardContent className="p-5">
							<div className="mb-3 flex items-center justify-between">
								<div className="flex size-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
									<ReadCvLogoIcon className="size-5 text-blue-600 dark:text-blue-400" weight="duotone" />
								</div>
								<span className="font-bold text-blue-600 text-xl">{stats.resumeCount}</span>
							</div>
							<p className="mb-2 font-medium text-sm">
								<Trans>Resumes created</Trans>
							</p>
							<Progress value={stats.resumeCompletion} className="h-2" />
							<p className="mt-1 text-muted-foreground text-xs">
								<Trans>{stats.resumeCompletion}% complete</Trans>
							</p>
						</CardContent>
					</Card>
				</motion.div>

				<motion.div whileHover={{ scale: 1.02 }} transition={{ type: "spring", stiffness: 300 }}>
					<Card className="relative overflow-hidden border-purple-500/20 bg-gradient-to-br from-purple-500/10 via-purple-500/5 to-transparent">
						<CardContent className="p-5">
							<div className="mb-3 flex items-center justify-between">
								<div className="flex size-10 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/30">
									<ChatsCircleIcon className="size-5 text-purple-600 dark:text-purple-400" weight="duotone" />
								</div>
								<span className="font-bold text-purple-600 text-xl">{stats.completedInterviews}</span>
							</div>
							<p className="mb-2 font-medium text-sm">
								<Trans>Interviews completed</Trans>
							</p>
							<Progress value={stats.interviewCompletion} className="h-2" />
							<p className="mt-1 text-muted-foreground text-xs">
								<Trans>{stats.interviewCompletion}% complete</Trans>
							</p>
						</CardContent>
					</Card>
				</motion.div>

				<motion.div whileHover={{ scale: 1.02 }} transition={{ type: "spring", stiffness: 300 }}>
					<Card className="relative overflow-hidden border-amber-500/20 bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent">
						<CardContent className="p-5">
							<div className="mb-3 flex items-center justify-between">
								<div className="flex size-10 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/30">
									<GraduationCapIcon className="size-5 text-amber-600 dark:text-amber-400" weight="duotone" />
								</div>
								<span className="font-bold text-amber-600 text-xl">{stats.totalTrainings}</span>
							</div>
							<p className="mb-2 font-medium text-sm">
								<Trans>Trainings completed</Trans>
							</p>
							<Progress value={stats.trainingCompletion} className="h-2" />
							<p className="mt-1 text-muted-foreground text-xs">
								<Trans>{stats.trainingCompletion}% complete</Trans>
							</p>
						</CardContent>
					</Card>
				</motion.div>

				<motion.div whileHover={{ scale: 1.02 }} transition={{ type: "spring", stiffness: 300 }}>
					<Card className="relative overflow-hidden border-green-500/20 bg-gradient-to-br from-green-500/10 via-green-500/5 to-transparent">
						<CardContent className="p-5">
							<div className="mb-3 flex items-center justify-between">
								<div className="flex size-10 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/30">
									<CompassIcon className="size-5 text-green-600 dark:text-green-400" weight="duotone" />
								</div>
								<span className="font-bold text-green-600 text-xl">{stats.careerAssessmentCompletion}%</span>
							</div>
							<p className="mb-2 font-medium text-sm">
								<Trans>Career guidance</Trans>
							</p>
							<Progress value={stats.careerAssessmentCompletion} className="h-2" />
							<p className="mt-1 text-muted-foreground text-xs">
								{stats.careerAssessmentCompletion > 0 ? t`Complete` : t`Not started`}
							</p>
						</CardContent>
					</Card>
				</motion.div>
			</div>

			<div className="grid gap-6 lg:grid-cols-2">
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<TrendUpIcon className="size-5 text-primary" weight="duotone" />
							<Trans>Interview Statistics</Trans>
						</CardTitle>
						<CardDescription>
							<Trans>Your interview simulation performance</Trans>
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="grid grid-cols-2 gap-4">
							<div className="rounded-lg border bg-muted/30 p-4 text-center">
								<p className="font-bold text-3xl text-primary">{stats.averageScore || "--"}</p>
								<p className="text-muted-foreground text-sm">
									<Trans>Average score</Trans>
								</p>
							</div>
							<div className="rounded-lg border bg-muted/30 p-4 text-center">
								<p className="font-bold text-3xl text-amber-600">{stats.highestScore || "--"}</p>
								<p className="text-muted-foreground text-sm">
									<Trans>Best score</Trans>
								</p>
							</div>
						</div>

						<Separator />

						<div className="space-y-3">
							<div className="flex items-center justify-between">
								<span className="text-muted-foreground text-sm">
									<Trans>Total sessions</Trans>
								</span>
								<span className="font-medium">{stats.totalInterviews}</span>
							</div>
							<div className="flex items-center justify-between">
								<span className="text-muted-foreground text-sm">
									<Trans>Completed sessions</Trans>
								</span>
								<span className="font-medium text-green-600">{stats.completedInterviews}</span>
							</div>
							<div className="flex items-center justify-between">
								<span className="text-muted-foreground text-sm">
									<Trans>Completion rate</Trans>
								</span>
								<span className="font-medium">
									{stats.totalInterviews > 0
										? Math.round((stats.completedInterviews / stats.totalInterviews) * 100)
										: 0}
									%
								</span>
							</div>
						</div>

						{stats.completedInterviews > 0 && (
							<Link to="/dashboard/interview">
								<Button variant="outline" className="w-full gap-2">
									<Trans>View all sessions</Trans>
									<ArrowRightIcon className="size-4" />
								</Button>
							</Link>
						)}
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<TrophyIcon className="size-5 text-amber-500" weight="duotone" />
							<Trans>Recent Badges</Trans>
						</CardTitle>
						<CardDescription>
							<Trans>
								{unlockedCount} of {ACHIEVEMENTS.length} badges unlocked
							</Trans>
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="grid grid-cols-4 gap-3">
							{achievementsStatus.slice(0, 4).map((achievement) => (
								<AchievementBadge
									key={achievement.id}
									achievement={achievement}
									isUnlocked={achievement.isUnlocked}
									progress={achievement.progress}
								/>
							))}
						</div>
						<Button variant="ghost" className="mt-4 w-full gap-2" onClick={() => setActiveTab("achievements")}>
							<Trans>View all badges</Trans>
							<ArrowRightIcon className="size-4" />
						</Button>
					</CardContent>
				</Card>
			</div>
		</TabsContent>
	);
}

export function AchievementsTab({
	achievementsStatus,
	unlockedCount,
}: {
	achievementsStatus: AchievementWithStatus[];
	unlockedCount: number;
}) {
	return (
		<TabsContent value="achievements" className="space-y-6 pt-6">
			<Card>
				<CardHeader>
					<div className="flex items-center justify-between">
						<div>
							<CardTitle className="flex items-center gap-2">
								<MedalIcon className="size-5 text-amber-500" weight="duotone" />
								<Trans>All Badges</Trans>
							</CardTitle>
							<CardDescription>
								<Trans>Unlock badges by progressing on the platform</Trans>
							</CardDescription>
						</div>
						<Badge variant="outline" className="gap-1 border-amber-500/50 bg-amber-500/10 px-3 py-1 text-amber-600">
							<TrophyIcon className="size-4" weight="fill" />
							{unlockedCount}/{ACHIEVEMENTS.length}
						</Badge>
					</div>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
						{achievementsStatus.map((achievement) => (
							<AchievementBadge
								key={achievement.id}
								achievement={achievement}
								isUnlocked={achievement.isUnlocked}
								progress={achievement.progress}
							/>
						))}
					</div>
				</CardContent>
			</Card>

			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				{[
					{ category: "resume", label: "Resumes", icon: ReadCvLogoIcon, color: "blue" },
					{ category: "interview", label: "Interviews", icon: ChatsCircleIcon, color: "purple" },
					{ category: "training", label: "Trainings", icon: GraduationCapIcon, color: "amber" },
					{ category: "career", label: "Career", icon: CompassIcon, color: "green" },
				].map(({ category, label, icon: IconComp, color }) => {
					const categoryAchievements = achievementsStatus.filter((a) => a.category === category);
					const unlocked = categoryAchievements.filter((a) => a.isUnlocked).length;
					return (
						<Card key={category} className={`border-${color}-500/20`}>
							<CardContent className="p-4">
								<div className="flex items-center gap-3">
									<div
										className={`flex size-10 items-center justify-center rounded-lg bg-${color}-100 dark:bg-${color}-900/30`}
									>
										<IconComp className={`size-5 text-${color}-600 dark:text-${color}-400`} weight="duotone" />
									</div>
									<div>
										<p className="font-medium">{label}</p>
										<p className="text-muted-foreground text-sm">
											{unlocked}/{categoryAchievements.length} unlocked
										</p>
									</div>
								</div>
							</CardContent>
						</Card>
					);
				})}
			</div>
		</TabsContent>
	);
}

export function ActivityTab({ recentActivities }: { recentActivities: ActivityItem[] }) {
	return (
		<TabsContent value="activity" className="space-y-6 pt-6">
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<ClockIcon className="size-5 text-primary" weight="duotone" />
						<Trans>Activity History</Trans>
					</CardTitle>
					<CardDescription>
						<Trans>Your recent actions on the platform</Trans>
					</CardDescription>
				</CardHeader>
				<CardContent>
					{recentActivities.length === 0 ? (
						<div className="py-8 text-center text-muted-foreground">
							<ClockIcon className="mx-auto mb-2 size-8" />
							<p>
								<Trans>No recent activity</Trans>
							</p>
							<p className="text-sm">
								<Trans>Your actions will appear here</Trans>
							</p>
						</div>
					) : (
						<div className="relative space-y-0">
							<div className="absolute top-0 bottom-0 left-5 w-0.5 bg-border" />

							<AnimatePresence mode="popLayout">
								{recentActivities.map((activity, index) => {
									const config = ACTIVITY_CONFIG[activity.type] || {
										icon: FileTextIcon,
										color: "text-muted-foreground",
										bgColor: "bg-muted",
									};
									const IconComp = config.icon;

									return (
										<motion.div
											key={activity.id}
											initial={{ opacity: 0, x: -20 }}
											animate={{ opacity: 1, x: 0 }}
											exit={{ opacity: 0, x: 20 }}
											transition={{ delay: index * 0.05 }}
											className="relative flex gap-4 pb-6"
										>
											<div
												className={cn(
													"relative z-10 flex size-10 shrink-0 items-center justify-center rounded-full border-2 border-background",
													config.bgColor,
												)}
											>
												<IconComp className={cn("size-5", config.color)} weight="duotone" />
											</div>

											<div className="flex-1 rounded-lg border bg-card p-4 transition-colors hover:bg-muted/30">
												<div className="flex items-start justify-between gap-2">
													<div>
														<p className="font-medium">{activity.title}</p>
														<p className="text-muted-foreground text-sm">{activity.details}</p>
													</div>
													<span className="shrink-0 text-muted-foreground text-xs">
														{formatRelativeTime(activity.timestamp)}
													</span>
												</div>
											</div>
										</motion.div>
									);
								})}
							</AnimatePresence>
						</div>
					)}
				</CardContent>
			</Card>
		</TabsContent>
	);
}

export function GoalsTab({ suggestedGoals, stats }: { suggestedGoals: GoalTemplate[]; stats: ProfileStats }) {
	return (
		<TabsContent value="goals" className="space-y-6 pt-6">
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<FlagIcon className="size-5 text-primary" weight="duotone" />
						<Trans>My Goals</Trans>
					</CardTitle>
					<CardDescription>
						<Trans>Track your progress towards your personal goals</Trans>
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					{suggestedGoals.length === 0 ? (
						<div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
							<TrophyIcon className="mb-2 size-12 text-amber-500" weight="duotone" />
							<p className="font-medium">
								<Trans>Congratulations!</Trans>
							</p>
							<p className="text-muted-foreground text-sm">
								<Trans>You have reached all your basic goals</Trans>
							</p>
						</div>
					) : (
						suggestedGoals.map((goal) => {
							let currentValue = 0;
							if (goal.category === "resume") currentValue = stats.resumeCount;
							else if (goal.category === "interview") {
								if (goal.id === "achieve-80-score") currentValue = stats.averageScore;
								else currentValue = stats.completedInterviews;
							} else if (goal.category === "training") currentValue = stats.totalTrainings;

							const progress = Math.min((currentValue / goal.targetValue) * 100, 100);

							return (
								<motion.div
									key={goal.id}
									className="flex items-center gap-4 rounded-xl border p-4"
									whileHover={{ scale: 1.01 }}
								>
									<div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
										<goal.icon className="size-6 text-primary" weight="duotone" />
									</div>
									<div className="min-w-0 flex-1">
										<div className="mb-1 flex items-center justify-between">
											<p className="font-medium">{goal.title}</p>
											<span className="text-muted-foreground text-sm">
												{currentValue}/{goal.targetValue} {goal.unit}
											</span>
										</div>
										<p className="mb-2 text-muted-foreground text-sm">{goal.description}</p>
										<Progress value={progress} className="h-2" />
									</div>
								</motion.div>
							);
						})
					)}
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<LightbulbIcon className="size-5 text-amber-500" weight="duotone" />
						<Trans>Suggested Goals</Trans>
					</CardTitle>
					<CardDescription>
						<Trans>Recommended goals based on your activity</Trans>
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="grid gap-3 sm:grid-cols-2">
						{GOAL_TEMPLATES.map((goal) => (
							<motion.div
								key={goal.id}
								className="flex items-center gap-3 rounded-lg border border-dashed p-3 transition-colors hover:border-primary/50 hover:bg-muted/30"
								whileHover={{ scale: 1.02 }}
							>
								<div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
									<goal.icon className="size-4 text-muted-foreground" weight="duotone" />
								</div>
								<div className="min-w-0">
									<p className="truncate font-medium text-sm">{goal.title}</p>
									<p className="truncate text-muted-foreground text-xs">{goal.description}</p>
								</div>
							</motion.div>
						))}
					</div>
				</CardContent>
			</Card>
		</TabsContent>
	);
}

export function SettingsTab() {
	return (
		<TabsContent value="settings" className="space-y-6 pt-6">
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<GearSixIcon className="size-5 text-primary" weight="duotone" />
						<Trans>Quick Access to Settings</Trans>
					</CardTitle>
					<CardDescription>
						<Trans>Manage your preferences and account settings</Trans>
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-3">
					<SettingsQuickLink
						icon={UserCircleIcon}
						label={t`Account settings`}
						href="/dashboard/settings/profile"
						description={t`Edit your name, email and profile photo`}
					/>
					<SettingsQuickLink
						icon={BellIcon}
						label={t`Notifications`}
						href="/dashboard/settings/preferences"
						description={t`Manage your notification preferences`}
					/>
					<SettingsQuickLink
						icon={GlobeIcon}
						label={t`Language`}
						href="/dashboard/settings/preferences"
						description={t`Change the interface language`}
					/>
					<SettingsQuickLink
						icon={PaintBrushIcon}
						label={t`Theme`}
						href="/dashboard/settings/preferences"
						description={t`Choose between light and dark mode`}
					/>
					<SettingsQuickLink
						icon={ShieldCheckIcon}
						label={t`Security`}
						href="/dashboard/settings/authentication"
						description={t`Manage your password and authentication`}
					/>
				</CardContent>
			</Card>
		</TabsContent>
	);
}
