import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import type { Icon } from "@phosphor-icons/react";
import {
	ArrowDownIcon,
	ArrowUpIcon,
	ChartBarIcon,
	ClockCountdownIcon,
	DownloadSimpleIcon,
	EyeIcon,
	FileTextIcon,
	PencilSimpleIcon,
	PresentationChartIcon,
	ShareNetworkIcon,
	WarningCircleIcon,
} from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { createLazyFileRoute, useNavigate } from "@tanstack/react-router";
import { motion } from "motion/react";
import { CountUp } from "@/components/animation/count-up";
import { ErrorComponent } from "@/components/error-component";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { authClient } from "@/integrations/auth/client";
import { orpc } from "@/integrations/orpc/client";
import { cn } from "@/utils/style";
import { DashboardHeader } from "../-components/header";

// biome-ignore lint/suspicious/noExplicitAny: Route path not in generated route tree
export const Route = createLazyFileRoute("/dashboard/analytics" as any)({
	component: AnalyticsDashboard,
	errorComponent: ErrorComponent,
});

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

function formatRelativeDate(date: Date): string {
	const now = new Date();
	const diffMs = now.getTime() - date.getTime();
	const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

	if (diffDays === 0) return t`Aujourd'hui`;
	if (diffDays === 1) return t`Hier`;
	if (diffDays < 7) return t`Il y a ${diffDays} jours`;
	if (diffDays < 30) return t`Il y a ${Math.floor(diffDays / 7)} semaines`;
	return date.toLocaleDateString("fr-FR");
}

function formatNumber(num: number): string {
	if (num >= 1000) {
		return `${(num / 1000).toFixed(1)}k`;
	}
	return num.toString();
}

// =============================================================================
// SUB-COMPONENTS
// =============================================================================

interface StatCardProps {
	title: string;
	value: number;
	suffix?: string;
	icon: Icon;
	trend?: "up" | "down" | "stable";
	changePercent?: number;
	color: "blue" | "purple";
	delay?: number;
}

const statCardColorClasses = {
	blue: {
		border: "border-blue-500/20",
		gradient: "from-blue-500 to-transparent",
		iconBg: "bg-blue-100 dark:bg-blue-900/30",
		iconText: "text-blue-600 dark:text-blue-400",
		valueText: "text-blue-600 dark:text-blue-400",
	},
	purple: {
		border: "border-purple-500/20",
		gradient: "from-purple-500 to-transparent",
		iconBg: "bg-purple-100 dark:bg-purple-900/30",
		iconText: "text-purple-600 dark:text-purple-400",
		valueText: "text-purple-600 dark:text-purple-400",
	},
};

function StatCard({
	title,
	value,
	suffix = "",
	icon: IconComponent,
	trend,
	changePercent,
	color,
	delay = 0,
}: StatCardProps) {
	const colorClasses = statCardColorClasses[color];

	return (
		<motion.div
			initial={false}
			animate={{ opacity: 1, y: 0 }}
			transition={{ delay, duration: 0.4 }}
			whileHover={{ scale: 1.02, y: -4 }}
		>
			<Card className={cn("relative overflow-hidden transition-all hover:shadow-lg", colorClasses.border)}>
				<div className={cn("absolute inset-0 bg-gradient-to-br opacity-10", colorClasses.gradient)} />
				<CardContent className="relative p-6">
					<div className="mb-4 flex items-center justify-between">
						<div className={cn("flex size-12 items-center justify-center rounded-xl", colorClasses.iconBg)}>
							<IconComponent className={cn("size-6", colorClasses.iconText)} weight="duotone" />
						</div>
						{trend && changePercent !== undefined && (
							<Badge
								className={cn(
									"gap-1",
									trend === "up" && "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
									trend === "down" && "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
									trend === "stable" && "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400",
								)}
							>
								{trend === "up" && <ArrowUpIcon className="size-3" />}
								{trend === "down" && <ArrowDownIcon className="size-3" />}
								{Math.abs(changePercent)}%
							</Badge>
						)}
					</div>
					<p className={cn("font-bold text-3xl", colorClasses.valueText)}>
						<CountUp to={value} duration={1.5} separator="," />
						{suffix}
					</p>
					<p className="text-muted-foreground text-sm">{title}</p>
				</CardContent>
			</Card>
		</motion.div>
	);
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

function AnalyticsDashboard() {
	const { data: session } = authClient.useSession();
	const navigate = useNavigate();
	const isAuthenticated = !!session?.user;

	// Fetch real data
	const {
		data: analytics,
		isLoading,
		error,
		refetch,
	} = useQuery({
		...orpc.analytics.getOverview.queryOptions(),
		enabled: isAuthenticated,
	});

	// Loading state - show skeleton layout matching the real page structure
	if (isLoading) {
		return (
			<div className="space-y-8">
				<DashboardHeader icon={ChartBarIcon} title={t`Tableau de bord analytique`} />
				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
					{Array.from({ length: 4 }).map((_, i) => (
						<Card key={i}>
							<CardContent className="p-6">
								<div className="flex items-center gap-3">
									<Skeleton className="size-10 rounded-lg" />
									<div className="space-y-2">
										<Skeleton className="h-7 w-20" />
										<Skeleton className="h-4 w-28" />
									</div>
								</div>
							</CardContent>
						</Card>
					))}
				</div>
				<div className="grid gap-6 lg:grid-cols-2">
					{Array.from({ length: 2 }).map((_, i) => (
						<Card key={i}>
							<CardHeader>
								<Skeleton className="h-5 w-40" />
								<Skeleton className="h-4 w-56" />
							</CardHeader>
							<CardContent>
								<Skeleton className="h-48 w-full" />
							</CardContent>
						</Card>
					))}
				</div>
			</div>
		);
	}

	// Show error state
	if (error) {
		return (
			<div className="space-y-8">
				<DashboardHeader icon={ChartBarIcon} title={t`Tableau de bord analytique`} />
				<div className="flex flex-col items-center justify-center py-12 text-center">
					<WarningCircleIcon className="mb-4 size-12 text-destructive" />
					<p className="font-medium text-muted-foreground">
						<Trans>Impossible de charger les donnees analytiques.</Trans>
					</p>
					<p className="mt-1 max-w-md text-muted-foreground/70 text-sm">{error.message}</p>
					<Button onClick={() => refetch()} className="mt-4">
						<Trans>Reessayer</Trans>
					</Button>
				</div>
			</div>
		);
	}

	// Use real metrics
	const resumeMetrics = analytics?.resumeMetrics ?? [];

	// Computed values
	const totalViews = analytics?.totalViews ?? 0;
	const totalDownloads = analytics?.totalDownloads ?? 0;
	const totalResumes = analytics?.totalResumes ?? 0;

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

	// Empty state - user has no resumes at all
	if (totalResumes === 0) {
		return (
			<motion.div className="space-y-8" initial="hidden" animate="visible" variants={containerVariants}>
				<DashboardHeader icon={ChartBarIcon} title={t`Tableau de bord analytique`} />
				<motion.div variants={itemVariants}>
					<Card className="border-dashed">
						<CardContent className="flex flex-col items-center justify-center py-16 text-center">
							<div className="mb-6 flex size-20 items-center justify-center rounded-2xl bg-primary/10">
								<ChartBarIcon className="size-10 text-primary" weight="duotone" />
							</div>
							<CardTitle className="mb-2 text-xl">
								<Trans>Aucune donnee analytique disponible</Trans>
							</CardTitle>
							<CardDescription className="mb-6 max-w-md">
								<Trans>
									Creez votre premier CV pour commencer a suivre vos statistiques de performance. Les vues,
									telechargements et partages de vos CV apparaitront ici.
								</Trans>
							</CardDescription>
							<Button onClick={() => navigate({ to: "/dashboard/resumes" as string })}>
								<PencilSimpleIcon className="size-4" />
								<Trans>Creer un CV</Trans>
							</Button>
						</CardContent>
					</Card>
				</motion.div>
			</motion.div>
		);
	}

	return (
		<motion.div className="space-y-8" initial="hidden" animate="visible" variants={containerVariants}>
			<DashboardHeader icon={ChartBarIcon} title={t`Tableau de bord analytique`} />

			{/* Hero Section */}
			<motion.div
				variants={itemVariants}
				className="relative overflow-hidden rounded-3xl border border-primary/20 p-8 md:p-10"
				style={{
					background:
						"linear-gradient(135deg, oklch(0.65 0.18 280 / 0.15) 0%, oklch(0.6 0.2 220 / 0.1) 35%, oklch(0.7 0.15 160 / 0.08) 70%, oklch(0.65 0.12 40 / 0.1) 100%)",
				}}
			>
				{/* Animated background */}
				<div className="pointer-events-none absolute inset-0 overflow-hidden">
					<motion.div
						className="absolute -top-32 -right-32 size-96 rounded-full bg-gradient-to-br from-purple-500/20 to-indigo-500/10 blur-3xl"
						animate={{
							scale: [1, 1.2, 1],
							rotate: [0, 15, 0],
							opacity: [0.5, 0.3, 0.5],
						}}
						transition={{ duration: 12, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
					/>
					<motion.div
						className="absolute -bottom-32 -left-32 size-96 rounded-full bg-gradient-to-tr from-blue-500/15 to-cyan-500/10 blur-3xl"
						animate={{
							scale: [1.2, 1, 1.2],
							rotate: [0, -15, 0],
							opacity: [0.3, 0.5, 0.3],
						}}
						transition={{ duration: 12, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
					/>
				</div>

				<div className="relative z-10">
					<div className="mb-6">
						<motion.div
							className="mb-2 flex items-center gap-2"
							initial={false}
							animate={{ opacity: 1, x: 0 }}
							transition={{ delay: 0.2 }}
						>
							<PresentationChartIcon className="size-5 text-primary" weight="fill" />
							<span className="font-semibold text-primary text-sm uppercase tracking-wider">
								<Trans>Apercu des performances</Trans>
							</span>
						</motion.div>
						<motion.h2
							className="mb-2 bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text font-bold text-3xl text-transparent tracking-tight md:text-4xl"
							initial={false}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.3 }}
						>
							<Trans>Vos analytiques de carriere</Trans>
						</motion.h2>
						<motion.p
							className="text-muted-foreground"
							initial={false}
							animate={{ opacity: 1 }}
							transition={{ delay: 0.4 }}
						>
							<Trans>Suivez les performances de vos CV et decouvrez des insights pour accelerer votre carriere.</Trans>
						</motion.p>
					</div>

					{/* Quick Stats */}
					<div className="grid gap-4 sm:grid-cols-2">
						<StatCard title={t`Vues totales`} value={totalViews} icon={EyeIcon} color="blue" delay={0.5} />
						<StatCard
							title={t`Telechargements`}
							value={totalDownloads}
							icon={DownloadSimpleIcon}
							color="purple"
							delay={0.6}
						/>
					</div>
				</div>
			</motion.div>

			{/* Performance Over Time - Not Yet Available */}
			<motion.div variants={itemVariants}>
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<ClockCountdownIcon className="size-5 text-primary" weight="duotone" />
							<Trans>Performance dans le temps</Trans>
						</CardTitle>
						<CardDescription>
							<Trans>Tendance quotidienne des vues et telechargements</Trans>
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="flex flex-col items-center justify-center py-12 text-center">
							<ClockCountdownIcon className="mb-4 size-12 text-muted-foreground/50" />
							<p className="font-medium text-muted-foreground">
								<Trans>Le suivi temporel n'est pas encore disponible.</Trans>
							</p>
							<p className="mt-1 max-w-md text-muted-foreground/70 text-sm">
								<Trans>
									Le systeme actuel suit le nombre total de vues et telechargements par CV. Les donnees de tendance
									quotidienne seront disponibles une fois le suivi evenementiel mis en place.
								</Trans>
							</p>
						</div>
					</CardContent>
				</Card>
			</motion.div>

			{/* Resume Performance Table */}
			<motion.div variants={itemVariants}>
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<EyeIcon className="size-5 text-blue-500" weight="duotone" />
							<Trans>Performance des CV</Trans>
						</CardTitle>
						<CardDescription>
							<Trans>Metriques individuelles et engagement par CV</Trans>
						</CardDescription>
					</CardHeader>
					<CardContent>
						{resumeMetrics.length === 0 ? (
							<div className="flex flex-col items-center justify-center py-12 text-center">
								<FileTextIcon className="mb-4 size-12 text-muted-foreground/50" />
								<p className="font-medium text-muted-foreground">
									<Trans>Aucune statistique de CV disponible</Trans>
								</p>
								<p className="mt-1 max-w-md text-muted-foreground/70 text-sm">
									<Trans>
										Partagez vos CV en les rendant publics pour commencer a suivre les vues et telechargements.
									</Trans>
								</p>
							</div>
						) : (
							<div className="overflow-x-auto">
								<table className="w-full">
									<thead>
										<tr className="border-b text-left text-muted-foreground text-sm">
											<th className="pb-3 font-medium">
												<Trans>CV</Trans>
											</th>
											<th className="pb-3 font-medium">
												<Trans>Vues</Trans>
											</th>
											<th className="pb-3 font-medium">
												<Trans>Telechargements</Trans>
											</th>
											<th className="pb-3 font-medium">
												<Trans>Partages</Trans>
											</th>
											<th className="pb-3 font-medium">
												<Trans>Tendance</Trans>
											</th>
											<th className="pb-3 font-medium">
												<Trans>Derniere mise a jour</Trans>
											</th>
										</tr>
									</thead>
									<tbody>
										{resumeMetrics.map((resume, index) => (
											<motion.tr
												key={resume.id}
												initial={false}
												animate={{ opacity: 1, x: 0 }}
												transition={{ delay: index * 0.05 }}
												className="border-b last:border-0"
											>
												<td className="py-4 font-medium">{resume.resumeName}</td>
												<td className="py-4">
													<div className="flex items-center gap-2">
														<EyeIcon className="size-4 text-muted-foreground" />
														{formatNumber(resume.views)}
													</div>
												</td>
												<td className="py-4">
													<div className="flex items-center gap-2">
														<DownloadSimpleIcon className="size-4 text-muted-foreground" />
														{resume.downloads}
													</div>
												</td>
												<td className="py-4">
													<div className="flex items-center gap-2">
														<ShareNetworkIcon className="size-4 text-muted-foreground" />
														{resume.shares}
													</div>
												</td>
												<td className="py-4">
													<Badge
														className={cn(
															"gap-1",
															resume.trend === "up" &&
																"bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
															resume.trend === "down" && "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
															resume.trend === "stable" &&
																"bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400",
														)}
													>
														{resume.trend === "up" && <ArrowUpIcon className="size-3" />}
														{resume.trend === "down" && <ArrowDownIcon className="size-3" />}
														{Math.abs(resume.changePercent)}%
													</Badge>
												</td>
												<td className="py-4 text-muted-foreground text-sm">{formatRelativeDate(resume.lastUpdated)}</td>
											</motion.tr>
										))}
									</tbody>
								</table>
							</div>
						)}
					</CardContent>
				</Card>
			</motion.div>
		</motion.div>
	);
}
