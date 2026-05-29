import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import {
	ChartLineUpIcon,
	CheckCircleIcon,
	ClockIcon,
	FireIcon,
	LightbulbIcon,
	MapPinIcon,
	PathIcon,
	SparkleIcon,
	TargetIcon,
	TrophyIcon,
	WarningCircleIcon,
} from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { lazy, Suspense } from "react";
import { ErrorComponent } from "@/components/error-component";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { authClient } from "@/integrations/auth/client";
import { orpc } from "@/integrations/orpc/client";
import { DashboardHeader } from "../-components/header";

const LearningDashboardLazy = lazy(() => Promise.resolve({ default: LearningDashboard }));

// biome-ignore lint/suspicious/noExplicitAny: Route path not in generated route tree
export const Route = createFileRoute("/dashboard/learn/" as any)({
	component: () => (
		<Suspense
			fallback={
				<div className="flex items-center justify-center p-8">
					<Trans>Loading learning dashboard...</Trans>
				</div>
			}
		>
			<LearningDashboardLazy />
		</Suspense>
	),
	errorComponent: ErrorComponent,
});

type DashboardPath = {
	id: string;
	title: string;
	field?: string | null;
	status: string;
	completionPercentage?: number | null;
	totalModules?: number | null;
	completedModules?: number | null;
	estimatedHours?: number | null;
};

type DashboardRec = {
	id: string;
	title?: string | null;
	description?: string | null;
	type: string;
	priority: string;
};

function StatCard({
	icon: Icon,
	label,
	value,
	sub,
	color,
	delay,
}: {
	icon: typeof PathIcon;
	label: string;
	value: string | number;
	sub?: string;
	color: string;
	delay: number;
}) {
	return (
		<motion.div
			initial={false}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.35, delay, ease: [0.22, 1, 0.36, 1] }}
		>
			<Card className="h-full">
				<CardContent className="flex items-center gap-4 pt-6">
					<div
						className="flex size-12 shrink-0 items-center justify-center rounded-xl"
						style={{ background: `oklch(from ${color} l c h / 0.1)` }}
					>
						<Icon weight="duotone" className="size-6" style={{ color }} />
					</div>
					<div className="min-w-0 flex-1">
						<p className="text-muted-foreground text-sm">{label}</p>
						<p className="font-bold text-2xl tabular-nums">{value}</p>
						{sub && <p className="text-muted-foreground text-xs">{sub}</p>}
					</div>
				</CardContent>
			</Card>
		</motion.div>
	);
}

function LoadingSkeleton() {
	return (
		<div className="space-y-8">
			<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
				{Array.from({ length: 4 }).map((_, i) => (
					<Skeleton key={String(i)} className="h-28 rounded-xl" />
				))}
			</div>
			<div className="grid gap-6 lg:grid-cols-3">
				<Skeleton className="h-72 rounded-xl lg:col-span-2" />
				<Skeleton className="h-72 rounded-xl" />
			</div>
			<div className="grid gap-6 md:grid-cols-2">
				<Skeleton className="h-64 rounded-xl" />
				<Skeleton className="h-64 rounded-xl" />
			</div>
		</div>
	);
}

function PathStatusBadge({ status }: { status: string }) {
	const map: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
		in_progress: { label: t`In Progress`, variant: "default" },
		completed: { label: t`Completed`, variant: "secondary" },
		not_started: { label: t`Not Started`, variant: "outline" },
		paused: { label: t`Paused`, variant: "outline" },
		abandoned: { label: t`Abandoned`, variant: "destructive" },
	};
	const info = map[status] ?? { label: status, variant: "outline" as const };
	return <Badge variant={info.variant}>{info.label}</Badge>;
}

function LearningDashboard() {
	const { data: session } = authClient.useSession();

	const {
		data: profile,
		isLoading: isLoadingProfile,
		error: profileError,
	} = useQuery({
		queryKey: ["adaptiveLearning", "profile"],
		queryFn: () => orpc.adaptiveLearning.profile.getOrCreate.call({}),
		enabled: !!session?.user,
	});

	const { data: rawPaths = [], isLoading: isLoadingPaths } = useQuery({
		queryKey: ["adaptiveLearning", "paths", "active"],
		queryFn: () => orpc.adaptiveLearning.paths.list.call({ activeOnly: true }),
		enabled: !!session?.user,
	});

	const { data: rawRecommendations = [], isLoading: isLoadingRecommendations } = useQuery({
		queryKey: ["adaptiveLearning", "recommendations", "preview"],
		queryFn: () => orpc.adaptiveLearning.recommendations.list.call({ activeOnly: true, limit: 4 }),
		enabled: !!session?.user,
	});

	const isLoading = isLoadingProfile || isLoadingPaths || isLoadingRecommendations || !profile;

	// Cast to dashboard-friendly types
	const paths = rawPaths as DashboardPath[];
	const recommendations = rawRecommendations as DashboardRec[];

	// Compute quick stats
	const activePaths = paths.filter((p) => p.status === "in_progress").length;
	const completedPaths = paths.filter((p) => p.status === "completed").length;
	const totalHours = paths.reduce((sum, p) => sum + (p.estimatedHours ?? 0), 0);
	const streak = (profile as { currentStreak?: number } | undefined)?.currentStreak ?? 0;

	if (isLoading) {
		return (
			<>
				<DashboardHeader icon={PathIcon} title={t`Learning Dashboard`} />
				<LoadingSkeleton />
			</>
		);
	}

	if (profileError) {
		return (
			<>
				<DashboardHeader icon={PathIcon} title={t`Learning Dashboard`} />
				<Card className="border-destructive">
					<CardContent className="flex flex-col items-center py-12 text-center">
						<WarningCircleIcon className="mb-4 size-12 text-destructive" />
						<h3 className="mb-2 font-medium text-lg">
							<Trans>Unable to load your learning profile</Trans>
						</h3>
						<p className="text-muted-foreground text-sm">
							<Trans>Please refresh the page or try again later.</Trans>
						</p>
					</CardContent>
				</Card>
			</>
		);
	}

	return (
		<>
			<DashboardHeader icon={PathIcon} title={t`Learning Dashboard`} />

			{/* Quick Stats */}
			<div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
				<StatCard
					icon={ClockIcon}
					label={t`Total Hours`}
					value={totalHours}
					sub={t`across all paths`}
					color="var(--imta-emerald)"
					delay={0}
				/>
				<StatCard
					icon={ChartLineUpIcon}
					label={t`Active Paths`}
					value={activePaths}
					sub={t`in progress`}
					color="var(--imta-teal)"
					delay={0.05}
				/>
				<StatCard
					icon={CheckCircleIcon}
					label={t`Paths Completed`}
					value={completedPaths}
					color="var(--imta-emerald)"
					delay={0.1}
				/>
				<StatCard
					icon={FireIcon}
					label={t`Current Streak`}
					value={streak}
					sub={t`days`}
					color="oklch(0.65 0.18 35)"
					delay={0.15}
				/>
			</div>

			{/* Main content grid */}
			<div className="mb-8 grid gap-6 lg:grid-cols-3">
				{/* Active Learning Paths */}
				<motion.div
					className="lg:col-span-2"
					initial={false}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.4, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
				>
					<Card className="h-full">
						<CardHeader className="flex flex-row items-center justify-between">
							<CardTitle className="flex items-center gap-2 text-base">
								<PathIcon weight="duotone" className="size-5 text-emerald-500" />
								<Trans>Active Learning Paths</Trans>
							</CardTitle>
							<Button variant="outline" size="sm" asChild>
								{/* biome-ignore lint/suspicious/noExplicitAny: route not in generated tree */}
								<Link to={"/dashboard/learn/paths" as any}>
									<Trans>View All</Trans>
								</Link>
							</Button>
						</CardHeader>
						<CardContent>
							{paths.length === 0 ? (
								<div className="flex flex-col items-center py-8 text-center">
									<PathIcon className="mb-3 size-10 text-muted-foreground/40" />
									<p className="font-medium text-sm">
										<Trans>No learning paths yet</Trans>
									</p>
									<p className="text-muted-foreground text-xs">
										<Trans>Generate your first AI-powered learning path to get started.</Trans>
									</p>
									<Button size="sm" className="mt-4" asChild>
										{/* biome-ignore lint/suspicious/noExplicitAny: route not in generated tree */}
										<Link to={"/dashboard/learn/paths" as any}>
											<SparkleIcon className="mr-2 size-4" />
											<Trans>Generate Path</Trans>
										</Link>
									</Button>
								</div>
							) : (
								<div className="space-y-4">
									{paths.slice(0, 3).map((path) => (
										<div key={path.id} className="rounded-lg border p-4">
											<div className="mb-2 flex items-start justify-between gap-2">
												<div className="min-w-0 flex-1">
													<p className="truncate font-medium text-sm">{path.title}</p>
													{path.field && <p className="text-muted-foreground text-xs capitalize">{path.field}</p>}
												</div>
												<PathStatusBadge status={path.status} />
											</div>
											<div className="space-y-1">
												<div className="flex justify-between text-muted-foreground text-xs">
													<span>
														<Trans>Progress</Trans>
													</span>
													<span>{path.completionPercentage ?? 0}%</span>
												</div>
												<Progress value={path.completionPercentage ?? 0} className="h-1.5" />
											</div>
											{path.totalModules != null && (
												<p className="mt-1 text-muted-foreground text-xs">
													{path.completedModules ?? 0} / {path.totalModules} <Trans>modules completed</Trans>
												</p>
											)}
										</div>
									))}
									{paths.length > 3 && (
										<p className="text-center text-muted-foreground text-xs">
											<Trans>+{paths.length - 3} more paths</Trans>
										</p>
									)}
								</div>
							)}
						</CardContent>
					</Card>
				</motion.div>

				{/* Recommendations Preview */}
				<motion.div
					initial={false}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.4, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
				>
					<Card className="h-full">
						<CardHeader className="flex flex-row items-center justify-between">
							<CardTitle className="flex items-center gap-2 text-base">
								<LightbulbIcon weight="duotone" className="size-5 text-amber-500" />
								<Trans>Recommendations</Trans>
							</CardTitle>
							<Button variant="outline" size="sm" asChild>
								{/* biome-ignore lint/suspicious/noExplicitAny: route not in generated tree */}
								<Link to={"/dashboard/learn/recommendations" as any}>
									<Trans>View All</Trans>
								</Link>
							</Button>
						</CardHeader>
						<CardContent>
							{recommendations.length === 0 ? (
								<div className="flex flex-col items-center py-8 text-center">
									<LightbulbIcon className="mb-3 size-10 text-muted-foreground/40" />
									<p className="text-muted-foreground text-sm">
										<Trans>No recommendations yet. Complete an assessment to get personalized suggestions.</Trans>
									</p>
								</div>
							) : (
								<div className="space-y-3">
									{recommendations.slice(0, 4).map((rec) => (
										<div key={rec.id} className="flex items-start gap-3 rounded-lg border p-3">
											<div className="mt-0.5 shrink-0">
												{rec.priority === "critical" || rec.priority === "high" ? (
													<TargetIcon className="size-4 text-destructive" />
												) : (
													<LightbulbIcon className="size-4 text-amber-500" />
												)}
											</div>
											<div className="min-w-0 flex-1">
												<p className="truncate font-medium text-sm">{rec.title ?? rec.type.replace(/_/g, " ")}</p>
												{rec.description && (
													<p className="line-clamp-2 text-muted-foreground text-xs">{rec.description}</p>
												)}
											</div>
										</div>
									))}
								</div>
							)}
						</CardContent>
					</Card>
				</motion.div>
			</div>

			{/* Quick Action Links */}
			<div className="grid gap-4 md:grid-cols-3">
				{[
					{
						// biome-ignore lint/suspicious/noExplicitAny: route not in generated tree
						to: "/dashboard/learn/paths" as any,
						icon: PathIcon,
						title: t`Learning Paths`,
						description: t`Manage and track your learning journeys`,
						color: "var(--imta-emerald)",
						delay: 0.3,
					},
					{
						// biome-ignore lint/suspicious/noExplicitAny: route not in generated tree
						to: "/dashboard/learn/assessments" as any,
						icon: ChartLineUpIcon,
						title: t`Skill Assessments`,
						description: t`Evaluate and measure your skill levels`,
						color: "var(--imta-teal)",
						delay: 0.35,
					},
					{
						// biome-ignore lint/suspicious/noExplicitAny: route not in generated tree
						to: "/dashboard/learn/recommendations" as any,
						icon: TrophyIcon,
						title: t`Recommendations`,
						description: t`Personalized suggestions for your growth`,
						color: "oklch(0.6 0.15 250)",
						delay: 0.4,
					},
				].map((item) => (
					<motion.div
						key={item.to}
						initial={false}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.35, delay: item.delay, ease: [0.22, 1, 0.36, 1] }}
					>
						<Card className="group cursor-pointer transition-shadow hover:shadow-md">
							<CardContent className="pt-6">
								<Link to={item.to} className="flex flex-col gap-3">
									<div
										className="flex size-10 items-center justify-center rounded-lg"
										style={{ background: `oklch(from ${item.color} l c h / 0.1)` }}
									>
										<item.icon weight="duotone" className="size-5" style={{ color: item.color }} />
									</div>
									<div>
										<p className="font-semibold text-sm transition-colors group-hover:text-primary">{item.title}</p>
										<p className="text-muted-foreground text-xs">{item.description}</p>
									</div>
									<MapPinIcon className="size-3 text-muted-foreground/50" />
								</Link>
							</CardContent>
						</Card>
					</motion.div>
				))}
			</div>
		</>
	);
}
