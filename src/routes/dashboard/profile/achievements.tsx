import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import {
	BellIcon,
	ChartLineUpIcon,
	FlagIcon,
	MedalIcon,
	RocketLaunchIcon,
	SparkleIcon,
	SpinnerIcon,
	TargetIcon,
	TrophyIcon,
	WarningCircleIcon,
} from "@phosphor-icons/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { ErrorComponent } from "@/components/error-component";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { orpc } from "@/integrations/orpc/client";
import { DashboardHeader } from "../-components/header";
import {
	AchievementsTabContent,
	ChallengesTabContent,
	HeroSection,
	LeaderboardTabContent,
	MilestonesTabContent,
	NotificationsTabContent,
	RewardsTabContent,
	ShareAchievementModal,
} from "./-components/achievements-components";
import type { AchievementCategory, AchievementDefinition, AchievementTier } from "./-components/achievements-types";

// biome-ignore lint/suspicious/noExplicitAny: Route not yet in generated tree
export const Route = createFileRoute("/dashboard/profile/achievements" as any)({
	component: AchievementsPage,
	errorComponent: ErrorComponent,
});

// =============================================================================
// MAIN COMPONENT
// =============================================================================

function AchievementsPage() {
	const { session } = Route.useRouteContext();
	const queryClient = useQueryClient();
	const navigate = useNavigate();
	const [activeTab, setActiveTab] = useState("achievements");
	const [categoryFilter, setCategoryFilter] = useState<"all" | AchievementCategory>("all");
	const [shareModal, setShareModal] = useState<{ definition: AchievementDefinition; tier: AchievementTier } | null>(
		null,
	);
	const [markingNotificationId, setMarkingNotificationId] = useState<string | null>(null);

	const isAuthenticated = !!session?.user;

	// ==========================================
	// QUERIES
	// ==========================================

	const {
		data: stats,
		isLoading: statsLoading,
		error: statsError,
		refetch: refetchStats,
	} = useQuery({
		...orpc.achievements.getStatistics.queryOptions({}),
		staleTime: 5 * 60 * 1000,
		enabled: isAuthenticated,
	});

	const { data: achievementsWithDefs = [], isLoading: achievementsLoading } = useQuery({
		...orpc.achievements.getUserAchievementsWithDefinitions.queryOptions({}),
		staleTime: 5 * 60 * 1000,
		enabled: isAuthenticated,
	});

	const { data: challenges = [], isLoading: challengesLoading } = useQuery({
		...orpc.achievements.getChallenges.queryOptions({}),
		staleTime: 5 * 60 * 1000,
		enabled: isAuthenticated,
	});

	const { data: leaderboard = [], isLoading: leaderboardLoading } = useQuery({
		...orpc.achievements.getLeaderboard.queryOptions({ limit: 10 }),
		staleTime: 5 * 60 * 1000,
		enabled: isAuthenticated,
	});

	const { data: milestones = [], isLoading: milestonesLoading } = useQuery({
		...orpc.achievements.getMilestones.queryOptions({}),
		staleTime: 5 * 60 * 1000,
		enabled: isAuthenticated,
	});

	const { data: rewards = [], isLoading: rewardsLoading } = useQuery({
		...orpc.achievements.getRewards.queryOptions({}),
		staleTime: 5 * 60 * 1000,
		enabled: isAuthenticated,
	});

	const { data: notifications = [], isLoading: notificationsLoading } = useQuery({
		...orpc.achievements.getNotifications.queryOptions({ limit: 20 }),
		staleTime: 5 * 60 * 1000,
		enabled: isAuthenticated,
	});

	const { data: notificationPrefs } = useQuery({
		...orpc.achievements.getNotificationPreferences.queryOptions({}),
		staleTime: 5 * 60 * 1000,
		enabled: isAuthenticated,
	});

	// ==========================================
	// MUTATIONS
	// ==========================================

	const { mutate: updateStreak } = useMutation({
		...orpc.achievements.updateStreak.mutationOptions(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["achievements"] });
		},
	});

	const { mutate: toggleLeaderboardVisibility, isPending: isTogglingLeaderboard } = useMutation({
		...orpc.achievements.toggleLeaderboardVisibility.mutationOptions(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["achievements"] });
		},
	});

	const { mutate: markNotificationRead } = useMutation({
		...orpc.achievements.markNotificationRead.mutationOptions(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["achievements"] });
			setMarkingNotificationId(null);
		},
		onError: () => {
			toast.error(t`Impossible de marquer la notification comme lue`);
			setMarkingNotificationId(null);
		},
	});

	const { mutate: markAllNotificationsRead, isPending: isMarkingAllRead } = useMutation({
		...orpc.achievements.markAllNotificationsRead.mutationOptions(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["achievements"] });
			toast.success(t`Toutes les notifications sont marquees comme lues`);
		},
	});

	const { mutate: activateReward, isPending: isActivatingReward } = useMutation({
		...orpc.achievements.activateReward.mutationOptions(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["achievements"] });
			toast.success(t`Recompense activee !`);
		},
		onError: () => {
			toast.error(t`Impossible d'activer la recompense`);
		},
	});

	const { mutate: updateNotificationPrefs } = useMutation({
		...orpc.achievements.updateNotificationPreferences.mutationOptions(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["achievements"] });
		},
	});

	useEffect(() => {
		if (isAuthenticated) {
			updateStreak({});
		}
	}, [updateStreak, isAuthenticated]);

	// ==========================================
	// COMPUTED VALUES
	// ==========================================

	const filteredAchievements = useMemo(() => {
		if (categoryFilter === "all") return achievementsWithDefs;
		return achievementsWithDefs.filter((a) => a.definition.category === categoryFilter);
	}, [achievementsWithDefs, categoryFilter]);

	const totalAchievements = stats?.totalAchievements ?? 0;
	const currentStreak = stats?.currentStreak ?? 0;
	const completedChallenges = stats?.completedChallenges ?? 0;
	const unreadNotifications = stats?.unreadNotifications ?? 0;
	const userXp = stats?.totalXp ?? 0;
	const currentLevel = stats?.currentLevel ?? 1;
	const showLeaderboard = stats?.showOnLeaderboard ?? true;

	// ==========================================
	// HANDLERS
	// ==========================================

	const handleMarkNotificationRead = useCallback(
		(id: string) => {
			setMarkingNotificationId(id);
			markNotificationRead({ notificationId: id });
		},
		[markNotificationRead],
	);

	const handleShareAchievement = useCallback((definition: AchievementDefinition, tier: AchievementTier) => {
		setShareModal({ definition, tier });
	}, []);

	const handleActivateReward = useCallback(
		(rewardId: string) => {
			activateReward({ rewardId });
		},
		[activateReward],
	);

	const handleToggleLeaderboard = useCallback(
		(show: boolean) => {
			toggleLeaderboardVisibility({ show });
		},
		[toggleLeaderboardVisibility],
	);

	const handleUpdateNotificationPref = useCallback(
		(key: string, value: boolean) => {
			updateNotificationPrefs({ [key]: value });
		},
		[updateNotificationPrefs],
	);

	// Animation variants
	const containerVariants = {
		hidden: { opacity: 0 },
		visible: {
			opacity: 1,
			transition: { staggerChildren: 0.1 },
		},
	};

	const itemVariants = {
		hidden: { opacity: 0, y: 20 },
		visible: { opacity: 1, y: 0 },
	};

	// Loading state
	if (statsLoading) {
		return (
			<div className="flex min-h-[400px] items-center justify-center">
				<SpinnerIcon className="size-8 animate-spin text-primary" />
			</div>
		);
	}

	// Error state
	if (statsError) {
		return (
			<div className="space-y-6">
				<DashboardHeader icon={TrophyIcon} title={t`Succes & Gamification`} />
				<div className="flex flex-col items-center justify-center py-12 text-center">
					<WarningCircleIcon className="mb-4 size-12 text-destructive" />
					<p className="font-medium text-muted-foreground">
						<Trans>Impossible de charger vos succes.</Trans>
					</p>
					<p className="mt-1 max-w-md text-muted-foreground/70 text-sm">{statsError.message}</p>
					<Button onClick={() => refetchStats()} className="mt-4">
						<Trans>Reessayer</Trans>
					</Button>
				</div>
			</div>
		);
	}

	// Empty state - no data loaded yet (queries never fired or returned empty)
	if (!stats && !statsLoading) {
		return (
			<div className="space-y-6">
				<DashboardHeader icon={TrophyIcon} title={t`Succes & Gamification`} />
				<Card className="border-dashed">
					<CardContent className="flex flex-col items-center justify-center py-16 text-center">
						<div className="mb-6 flex size-20 items-center justify-center rounded-2xl bg-primary/10">
							<TrophyIcon className="size-10 text-primary" weight="duotone" />
						</div>
						<CardTitle className="mb-2 text-xl">
							<Trans>Commencez votre parcours de succes</Trans>
						</CardTitle>
						<CardDescription className="mb-6 max-w-md">
							<Trans>
								Creez votre premier CV, passez un entretien d'entrainement ou explorez les outils de carriere pour
								debloquer vos premiers succes et gagner des points XP.
							</Trans>
						</CardDescription>
						<div className="flex gap-3">
							<Button onClick={() => navigate({ to: "/dashboard" as string })} variant="outline">
								<RocketLaunchIcon className="size-4" />
								<Trans>Aller au tableau de bord</Trans>
							</Button>
						</div>
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<motion.div className="space-y-6" initial="hidden" animate="visible" variants={containerVariants}>
			<DashboardHeader icon={TrophyIcon} title={t`Succes & Gamification`} />

			<HeroSection
				currentLevel={currentLevel}
				userXp={userXp}
				totalAchievements={totalAchievements}
				currentStreak={currentStreak}
				completedChallenges={completedChallenges}
				totalChallenges={challenges.length}
				challenges={challenges}
				challengesLoading={challengesLoading}
				setActiveTab={setActiveTab}
				itemVariants={itemVariants}
			/>

			{/* Main Tabs */}
			<Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
				<motion.div variants={itemVariants}>
					<TabsList variant="line" className="w-full justify-start">
						<TabsTrigger value="achievements" className="gap-2">
							<MedalIcon className="size-4" />
							<Trans>Succes</Trans>
						</TabsTrigger>
						<TabsTrigger value="challenges" className="gap-2">
							<TargetIcon className="size-4" />
							<Trans>Defis</Trans>
						</TabsTrigger>
						<TabsTrigger value="leaderboard" className="gap-2">
							<ChartLineUpIcon className="size-4" />
							<Trans>Classement</Trans>
						</TabsTrigger>
						<TabsTrigger value="milestones" className="gap-2">
							<FlagIcon className="size-4" />
							<Trans>Jalons</Trans>
						</TabsTrigger>
						<TabsTrigger value="rewards" className="gap-2">
							<SparkleIcon className="size-4" />
							<Trans>Recompenses</Trans>
						</TabsTrigger>
						<TabsTrigger value="notifications" className="gap-2">
							<BellIcon className="size-4" />
							<Trans>Notifications</Trans>
							{unreadNotifications > 0 && (
								<Badge className="ml-1 size-5 justify-center rounded-full p-0 text-xs">{unreadNotifications}</Badge>
							)}
						</TabsTrigger>
					</TabsList>
				</motion.div>

				<TabsContent value="achievements" className="space-y-6">
					<AchievementsTabContent
						categoryFilter={categoryFilter}
						setCategoryFilter={setCategoryFilter}
						achievementsWithDefs={achievementsWithDefs}
						filteredAchievements={filteredAchievements}
						achievementsLoading={achievementsLoading}
						onShare={handleShareAchievement}
						itemVariants={itemVariants}
					/>
				</TabsContent>

				<TabsContent value="challenges" className="space-y-6">
					<ChallengesTabContent
						challenges={challenges}
						challengesLoading={challengesLoading}
						currentStreak={currentStreak}
						itemVariants={itemVariants}
					/>
				</TabsContent>

				<TabsContent value="leaderboard" className="space-y-6">
					<LeaderboardTabContent
						showLeaderboard={showLeaderboard}
						leaderboard={leaderboard}
						leaderboardLoading={leaderboardLoading}
						isTogglingLeaderboard={isTogglingLeaderboard}
						onToggleLeaderboard={handleToggleLeaderboard}
						itemVariants={itemVariants}
					/>
				</TabsContent>

				<TabsContent value="milestones" className="space-y-6">
					<MilestonesTabContent
						milestones={milestones}
						milestonesLoading={milestonesLoading}
						itemVariants={itemVariants}
					/>
				</TabsContent>

				<TabsContent value="rewards" className="space-y-6">
					<RewardsTabContent
						rewards={rewards}
						rewardsLoading={rewardsLoading}
						currentLevel={currentLevel}
						onActivate={handleActivateReward}
						isActivating={isActivatingReward}
						itemVariants={itemVariants}
					/>
				</TabsContent>

				<TabsContent value="notifications" className="space-y-6">
					<NotificationsTabContent
						notifications={notifications}
						notificationsLoading={notificationsLoading}
						unreadNotifications={unreadNotifications}
						markingNotificationId={markingNotificationId}
						isMarkingAllRead={isMarkingAllRead}
						notificationPrefs={notificationPrefs as Record<string, unknown> | undefined}
						onMarkRead={handleMarkNotificationRead}
						onMarkAllRead={() => markAllNotificationsRead({})}
						onUpdatePref={handleUpdateNotificationPref}
						itemVariants={itemVariants}
					/>
				</TabsContent>
			</Tabs>

			{/* Share Modal */}
			<AnimatePresence>
				{shareModal && (
					<ShareAchievementModal
						definition={shareModal.definition}
						tier={shareModal.tier}
						onClose={() => setShareModal(null)}
					/>
				)}
			</AnimatePresence>
		</motion.div>
	);
}
