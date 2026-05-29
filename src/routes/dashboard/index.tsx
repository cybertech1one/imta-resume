import { i18n } from "@lingui/core";
import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import {
	BriefcaseIcon,
	CalendarIcon,
	ChartLineUpIcon,
	CheckCircleIcon,
	HouseIcon,
	ReadCvLogoIcon,
	StarIcon,
	TargetIcon,
	TrendUpIcon,
	UsersIcon,
	WarningCircleIcon,
} from "@phosphor-icons/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import { ErrorComponent } from "@/components/error-component";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { authClient } from "@/integrations/auth/client";
import { orpc } from "@/integrations/orpc/client";
import {
	ChartsSection,
	QuickActionsSection,
	RecentActivitySection,
	StatCard,
	UpcomingItemsSection,
	WelcomeBanner,
} from "./-components/dashboard-index-components";
import { APPLICATION_STATUS_LABELS, SKILLS_CATEGORY_LABELS } from "./-components/dashboard-index-config";
import { getDailyMotivation, getTimeOfDayGreeting } from "./-components/dashboard-index-utils";
import { DashboardHeader } from "./-components/header";
import { OnboardingDialog } from "./-components/onboarding-dialog";

export const Route = createFileRoute("/dashboard/")({
	component: DashboardHome,
	errorComponent: ErrorComponent,
});

function DashboardHome() {
	const { data: session } = authClient.useSession();
	const queryClient = useQueryClient();
	const [currentDate, setCurrentDate] = useState(() => new Date());
	const [dailyMotivation] = useState(getDailyMotivation);
	const [greeting, setGreeting] = useState(t`Hello`);
	const [showOnboarding, setShowOnboarding] = useState(false);

	// Query the DB for onboarding status (source of truth)
	const { data: onboardingStatus } = useQuery({
		...orpc.userSettings.getOnboardingStatus.queryOptions(),
		staleTime: 60 * 60 * 1000, // 1 hour - rarely changes
		enabled: !!session?.user,
	});

	// Mutation to mark onboarding as complete in the DB
	const completeOnboardingMutation = useMutation({
		mutationFn: () => orpc.userSettings.completeOnboarding.call({}),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["userSettings", "getOnboardingStatus"] });
			try {
				localStorage.setItem("onboarding-completed", "true");
			} catch {
				// localStorage may not be available
			}
		},
	});

	useEffect(() => {
		setGreeting(getTimeOfDayGreeting());
		setCurrentDate(new Date());
	}, []);

	// Determine whether to show onboarding based on DB status (with localStorage as fast cache)
	useEffect(() => {
		if (!session?.user) return;

		// Fast path: check localStorage cache first to prevent flash
		try {
			const cachedCompleted = localStorage.getItem("onboarding-completed");
			if (cachedCompleted === "true") return; // already done, no flash
		} catch {
			// localStorage may not be available
		}

		// DB is the source of truth
		if (onboardingStatus !== undefined) {
			if (onboardingStatus.completed) {
				// DB says completed - sync localStorage cache
				try {
					localStorage.setItem("onboarding-completed", "true");
				} catch {
					// localStorage may not be available
				}
			} else {
				// DB says not completed - show onboarding
				setShowOnboarding(true);
			}
		}
	}, [session?.user, onboardingStatus]);

	const {
		data: dashboardStats,
		isLoading: statsLoading,
		error: statsError,
		refetch: refetchStats,
	} = useQuery({
		...orpc.dashboard.getStatistics.queryOptions(),
		staleTime: 15 * 60 * 1000,
		gcTime: 30 * 60 * 1000,
		enabled: !!session?.user,
	});

	const { data: recentActivity, isLoading: activityLoading } = useQuery({
		...orpc.dashboard.getRecentActivity.queryOptions({ input: { limit: 10 } }),
		staleTime: 10 * 60 * 1000,
		gcTime: 30 * 60 * 1000,
		enabled: !!session?.user,
	});

	const { data: upcomingItems, isLoading: upcomingLoading } = useQuery({
		...orpc.dashboard.getUpcomingItems.queryOptions({ input: { limit: 5 } }),
		staleTime: 10 * 60 * 1000,
		gcTime: 30 * 60 * 1000,
		enabled: !!session?.user,
	});

	const progressScore = useMemo(() => {
		if (!dashboardStats) return 0;
		const { resumeCount, activeApplicationsCount, upcomingInterviewsCount, skillsTrackedCount, goalsProgress } =
			dashboardStats;

		const resumeScore = Math.min(resumeCount * 15, 20);
		const applicationScore = Math.min(activeApplicationsCount * 5, 25);
		const interviewScore = Math.min(upcomingInterviewsCount * 10, 20);
		const skillsScore = Math.min(skillsTrackedCount * 3, 15);
		const goalsScore = Math.min((goalsProgress / 100) * 20, 20);

		return Math.min(Math.round(resumeScore + applicationScore + interviewScore + skillsScore + goalsScore), 100);
	}, [dashboardStats]);

	const applicationChartData = useMemo(() => {
		if (!dashboardStats?.applicationStatusBreakdown) return [];
		return Object.entries(dashboardStats.applicationStatusBreakdown).map(([status, count]) => {
			const descriptor = APPLICATION_STATUS_LABELS[status];
			return {
				label: descriptor ? i18n.t(descriptor) : status,
				value: count,
			};
		});
	}, [dashboardStats?.applicationStatusBreakdown]);

	const skillsChartData = useMemo(() => {
		if (!dashboardStats?.skillsByCategory) return [];
		return Object.entries(dashboardStats.skillsByCategory).map(([category, count]) => {
			const descriptor = SKILLS_CATEGORY_LABELS[category];
			return {
				label: descriptor ? i18n.t(descriptor) : category,
				value: count,
			};
		});
	}, [dashboardStats?.skillsByCategory]);

	const userName = session?.user?.name?.split(" ")[0] ?? t`User`;

	const containerVariants = {
		hidden: { opacity: 0 },
		visible: {
			opacity: 1,
			transition: {
				staggerChildren: 0.08,
				delayChildren: 0.1,
			},
		},
	};

	const itemVariants = {
		hidden: { opacity: 0, y: 24 },
		visible: {
			opacity: 1,
			y: 0,
			transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
		},
	};

	if (statsError) {
		return (
			<>
				<DashboardHeader icon={HouseIcon} title={t`Dashboard`} accentColor="var(--imta-emerald)" />
				<Card className="border-destructive/50">
					<CardContent className="flex flex-col items-center py-8 text-center">
						<WarningCircleIcon className="mb-4 size-12 text-destructive" />
						<h2 className="mb-2 font-semibold text-lg">
							<Trans>Loading Error</Trans>
						</h2>
						<p className="mb-4 text-muted-foreground">
							<Trans>Unable to load dashboard statistics.</Trans>
						</p>
						<Button onClick={() => refetchStats()} variant="outline">
							<Trans>Retry</Trans>
						</Button>
					</CardContent>
				</Card>
			</>
		);
	}

	return (
		<motion.main
			className="space-y-8 pb-8"
			initial="hidden"
			animate="visible"
			variants={containerVariants}
			role="main"
			aria-label={t`Dashboard main content`}
		>
			<DashboardHeader
				icon={HouseIcon}
				title={t`Dashboard`}
				subtitle={t`Your career journey at a glance`}
				accentColor="var(--imta-emerald)"
				gradient="linear-gradient(135deg, oklch(0.97 0.02 160) 0%, oklch(0.96 0.015 140) 50%, oklch(0.97 0.01 120) 100%)"
			/>

			<WelcomeBanner
				itemVariants={itemVariants}
				currentDate={currentDate}
				greeting={greeting}
				userName={userName}
				dailyMotivation={dailyMotivation}
				progressScore={progressScore}
			/>

			<QuickActionsSection itemVariants={itemVariants} />

			<motion.div variants={itemVariants} className="section-divider" aria-hidden="true" />

			<motion.section variants={itemVariants} aria-labelledby="stats-heading">
				<div className="mb-5 flex items-center justify-between">
					<h2 id="stats-heading" className="flex items-center gap-2 font-bold text-xl tracking-tight">
						<div
							className="flex size-8 items-center justify-center rounded-lg"
							style={{ background: "oklch(from var(--imta-emerald) l c h / 0.12)" }}
						>
							<ChartLineUpIcon
								className="size-4"
								weight="duotone"
								style={{ color: "var(--imta-emerald)" }}
								aria-hidden="true"
							/>
						</div>
						<Trans>Your Statistics</Trans>
					</h2>
				</div>
				<div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-6">
					<StatCard
						icon={ReadCvLogoIcon}
						count={dashboardStats?.resumeCount ?? 0}
						label={t`Resumes Created`}
						badge={dashboardStats?.resumeCount ? { text: t`Active`, icon: TrendUpIcon } : null}
						accentColor="var(--imta-emerald)"
						href="/dashboard/resumes"
						isLoading={statsLoading}
						index={0}
					/>
					<StatCard
						icon={BriefcaseIcon}
						count={dashboardStats?.activeApplicationsCount ?? 0}
						label={t`Active Applications`}
						accentColor="var(--imta-teal)"
						href="/dashboard/jobs"
						isLoading={statsLoading}
						index={1}
					/>
					<StatCard
						icon={CalendarIcon}
						count={dashboardStats?.upcomingInterviewsCount ?? 0}
						label={t`Upcoming Interviews`}
						badge={dashboardStats?.upcomingInterviewsCount ? { text: t`Scheduled`, icon: CheckCircleIcon } : null}
						accentColor="var(--imta-blue)"
						href="/dashboard/interview"
						isLoading={statsLoading}
						index={2}
					/>
					<StatCard
						icon={UsersIcon}
						count={dashboardStats?.networkContactsCount ?? 0}
						label={t`Network Contacts`}
						accentColor="var(--imta-terracotta)"
						href="/dashboard/networking"
						isLoading={statsLoading}
						index={3}
					/>
					<StatCard
						icon={StarIcon}
						count={dashboardStats?.skillsTrackedCount ?? 0}
						label={t`Skills Tracked`}
						accentColor="var(--imta-teal)"
						href="/dashboard/career/skills"
						isLoading={statsLoading}
						index={4}
					/>
					<StatCard
						icon={TargetIcon}
						count={dashboardStats?.goalsProgress ?? 0}
						label={t`Goal Progress`}
						accentColor="var(--imta-emerald)"
						href="/dashboard/career"
						isLoading={statsLoading}
						index={5}
					/>
				</div>
			</motion.section>

			<ChartsSection
				itemVariants={itemVariants}
				statsLoading={statsLoading}
				applicationChartData={applicationChartData}
				skillsChartData={skillsChartData}
			/>

			<div className="grid gap-6 sm:gap-8 lg:grid-cols-2">
				<RecentActivitySection
					itemVariants={itemVariants}
					activityLoading={activityLoading}
					recentActivity={recentActivity as any}
				/>
				<UpcomingItemsSection
					itemVariants={itemVariants}
					upcomingLoading={upcomingLoading}
					upcomingItems={upcomingItems as any}
				/>
			</div>

			<OnboardingDialog
				open={showOnboarding}
				onOpenChange={setShowOnboarding}
				onComplete={() => {
					completeOnboardingMutation.mutate();
				}}
			/>
		</motion.main>
	);
}
