import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { ChartLineUpIcon, ClockIcon, FlagIcon, GearSixIcon, MedalIcon, UserCircleIcon } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";
import { useMemo, useState } from "react";
import { ErrorComponent } from "@/components/error-component";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { orpc } from "@/integrations/orpc/client";
import { DashboardHeader } from "../-components/header";
import {
	AchievementsTab,
	ActivityTab,
	GoalsTab,
	OverviewTab,
	ProfileHeaderCard,
	ProfileLoadingSkeleton,
	SettingsTab,
} from "./-components/profile-components";
import { ANIMATION_VARIANTS } from "./-components/profile-config";
import {
	computeAchievementsStatus,
	computeStats,
	computeSuggestedGoals,
	deriveActivities,
} from "./-components/profile-utils";

// biome-ignore lint/suspicious/noExplicitAny: Route not yet in generated tree
export const Route = createFileRoute("/dashboard/profile/" as any)({
	component: ProfilePage,
	errorComponent: ErrorComponent,
});

function ProfilePage() {
	const { session } = Route.useRouteContext();
	const [activeTab, setActiveTab] = useState("overview");

	const { data: resumes, isLoading: resumesLoading } = useQuery({
		...orpc.resume.list.queryOptions({ input: { tags: [], sort: "lastUpdatedAt" } }),
		staleTime: 5 * 60 * 1000,
		enabled: !!session?.user,
	});
	const { data: interviewSessions, isLoading: interviewsLoading } = useQuery({
		...orpc.interview.getSessions.queryOptions({ input: { limit: 100, offset: 0 } }),
		staleTime: 5 * 60 * 1000,
		enabled: !!session?.user,
	});
	const { data: trainingStats, isLoading: trainingLoading } = useQuery({
		...orpc.training.getTrainingStats.queryOptions(),
		staleTime: 10 * 60 * 1000,
		enabled: !!session?.user,
	});

	const isLoading = resumesLoading || interviewsLoading || trainingLoading;

	const recentActivities = useMemo(() => deriveActivities(resumes, interviewSessions), [resumes, interviewSessions]);

	const stats = useMemo(
		() => computeStats(resumes, interviewSessions, trainingStats),
		[resumes, interviewSessions, trainingStats],
	);

	const achievementsStatus = useMemo(() => computeAchievementsStatus(stats), [stats]);

	const unlockedCount = achievementsStatus.filter((a) => a.isUnlocked).length;

	const suggestedGoals = useMemo(() => computeSuggestedGoals(stats), [stats]);

	if (isLoading) {
		return <ProfileLoadingSkeleton />;
	}

	// biome-ignore lint/suspicious/noExplicitAny: createdAt exists on user but type not exported
	const userCreatedAt = (session.user as any).createdAt;
	const memberSince = userCreatedAt ? new Date(userCreatedAt) : new Date();

	return (
		<motion.div className="space-y-6" initial="hidden" animate="visible" variants={ANIMATION_VARIANTS.container}>
			<DashboardHeader icon={UserCircleIcon} title={t`Mon Profil`} />

			<ProfileHeaderCard
				user={session.user}
				memberSince={memberSince}
				unlockedCount={unlockedCount}
				overallProgress={stats.overallProgress}
			/>

			<motion.div variants={ANIMATION_VARIANTS.item}>
				<Tabs value={activeTab} onValueChange={setActiveTab}>
					<TabsList variant="line" className="w-full justify-start">
						<TabsTrigger value="overview" className="gap-2">
							<ChartLineUpIcon className="size-4" />
							<Trans>Preview</Trans>
						</TabsTrigger>
						<TabsTrigger value="achievements" className="gap-2">
							<MedalIcon className="size-4" />
							<Trans>Badges</Trans>
						</TabsTrigger>
						<TabsTrigger value="activity" className="gap-2">
							<ClockIcon className="size-4" />
							<Trans>Activity</Trans>
						</TabsTrigger>
						<TabsTrigger value="goals" className="gap-2">
							<FlagIcon className="size-4" />
							<Trans>Goals</Trans>
						</TabsTrigger>
						<TabsTrigger value="settings" className="gap-2">
							<GearSixIcon className="size-4" />
							<Trans>Settings</Trans>
						</TabsTrigger>
					</TabsList>

					<OverviewTab
						stats={stats}
						achievementsStatus={achievementsStatus}
						unlockedCount={unlockedCount}
						setActiveTab={setActiveTab}
					/>

					<AchievementsTab achievementsStatus={achievementsStatus} unlockedCount={unlockedCount} />

					<ActivityTab recentActivities={recentActivities} />

					<GoalsTab suggestedGoals={suggestedGoals} stats={stats} />

					<SettingsTab />
				</Tabs>
			</motion.div>
		</motion.div>
	);
}
