import { i18n } from "@lingui/core";
import { msg, t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import {
	ArrowRightIcon,
	BriefcaseIcon,
	BuildingsIcon,
	CalendarCheckIcon,
	ChartBarIcon,
	ClipboardTextIcon,
	FileTextIcon,
	MapPinIcon,
	PlusIcon,
	UsersIcon,
} from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion } from "motion/react";
import { ErrorComponent } from "@/components/error-component";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { authClient } from "@/integrations/auth/client";
import { orpc } from "@/integrations/orpc/client";
import { DashboardHeader } from "../-components/header";

// biome-ignore lint/suspicious/noExplicitAny: Route path not in generated route tree
export const Route = createFileRoute("/dashboard/partner" as any)({
	component: PartnerDashboardPage,
	errorComponent: ErrorComponent,
});

const STAT_CONFIGS = [
	{
		icon: BriefcaseIcon,
		key: "totalJobs" as const,
		labelKey: msg`Total Jobs Posted`,
		descKey: msg`Job postings created`,
		color: "#0ea5e9",
		bgGradient: "from-sky-500/10 to-blue-500/5",
	},
	{
		icon: ClipboardTextIcon,
		key: "totalApplications" as const,
		labelKey: msg`Total Applications`,
		descKey: msg`Across all job postings`,
		color: "#8b5cf6",
		bgGradient: "from-violet-500/10 to-purple-500/5",
	},
	{
		icon: CalendarCheckIcon,
		key: "totalEvents" as const,
		labelKey: msg`Events`,
		descKey: msg`Recruitment events created`,
		color: "#f59e0b",
		bgGradient: "from-amber-500/10 to-orange-500/5",
	},
	{
		icon: UsersIcon,
		key: "totalRegistrations" as const,
		labelKey: msg`Registrations`,
		descKey: msg`Event registrations received`,
		color: "#10b981",
		bgGradient: "from-emerald-500/10 to-green-500/5",
	},
];

function PartnerStatCard({
	icon: Icon,
	label,
	value,
	description,
	color,
	bgGradient,
	index,
}: {
	icon: React.ElementType;
	label: string;
	value: number;
	description?: string;
	color: string;
	bgGradient: string;
	index: number;
}) {
	return (
		<motion.div
			initial={false}
			animate={{ opacity: 1, y: 0 }}
			transition={{ delay: 0.1 * index, duration: 0.4, type: "spring", stiffness: 300 }}
		>
			<Card
				className={`group relative overflow-hidden bg-gradient-to-br ${bgGradient} transition-all duration-300 hover:-translate-y-1 hover:shadow-lg`}
			>
				<div
					className="pointer-events-none absolute -top-8 -right-8 size-24 rounded-full opacity-20 blur-2xl transition-opacity group-hover:opacity-40"
					style={{ background: color }}
					aria-hidden="true"
				/>
				<CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
					<CardTitle className="font-medium text-muted-foreground text-sm">{label}</CardTitle>
					<div
						className="flex size-10 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110"
						style={{ background: `color-mix(in oklch, ${color} 15%, transparent)` }}
					>
						<Icon className="size-5" weight="duotone" style={{ color }} />
					</div>
				</CardHeader>
				<CardContent className="relative">
					<div className="font-bold text-3xl tracking-tight">{value}</div>
					{description && <p className="mt-1 text-muted-foreground text-xs">{description}</p>}
				</CardContent>
			</Card>
		</motion.div>
	);
}

function StatusBadge({ status }: { status: string }) {
	const variants: Record<string, { label: string; className: string }> = {
		active: { label: t`Active`, className: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" },
		pending: {
			label: t`Pending Review`,
			className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
		},
		inactive: {
			label: t`Inactive`,
			className: "bg-neutral-100 text-neutral-800 dark:bg-neutral-700 dark:text-neutral-200",
		},
	};
	const variant = variants[status] ?? variants.active;
	return <Badge className={variant.className}>{variant.label}</Badge>;
}

function ApplicationStatusBadge({ status }: { status: string }) {
	const variants: Record<string, { label: string; className: string }> = {
		pending: {
			label: t`Pending`,
			className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
		},
		reviewed: { label: t`Reviewed`, className: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" },
		shortlisted: {
			label: t`Shortlisted`,
			className: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
		},
		rejected: { label: t`Rejected`, className: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" },
		hired: {
			label: t`Hired`,
			className: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200",
		},
	};
	const variant = variants[status] ?? variants.pending;
	return (
		<Badge variant="outline" className={variant.className}>
			{variant.label}
		</Badge>
	);
}

const QUICK_ACTIONS = [
	{
		id: "post-job",
		icon: PlusIcon,
		label: msg`Post a Job`,
		description: msg`Create a new job listing`,
		to: "/dashboard/partner/post-job",
		color: "#0ea5e9",
		primary: true,
	},
	{
		id: "view-jobs",
		icon: BriefcaseIcon,
		label: msg`View My Jobs`,
		description: msg`Manage existing listings`,
		to: "/dashboard/partner/jobs",
		color: "#8b5cf6",
		primary: false,
	},
	{
		id: "applications",
		icon: FileTextIcon,
		label: msg`View Applications`,
		description: msg`Review candidates`,
		to: "/dashboard/partner/applications",
		color: "#f59e0b",
		primary: false,
	},
	{
		id: "events",
		icon: CalendarCheckIcon,
		label: msg`Create Event`,
		description: msg`Plan recruitment events`,
		to: "/dashboard/networking/events",
		color: "#10b981",
		primary: false,
	},
];

function PartnerDashboardPage() {
	const { data: session, isPending: isSessionPending } = authClient.useSession();
	const navigate = useNavigate();

	const isAuthenticated = !!session?.user;

	// Fetch partner dashboard stats
	const {
		data: dashboardStats,
		isPending: isStatsPending,
		isError: isStatsError,
	} = useQuery({
		...orpc.partner.getDashboardStats.queryOptions(),
		enabled: isAuthenticated,
		staleTime: 2 * 60 * 1000,
		gcTime: 5 * 60 * 1000,
	});

	// Fetch partner's jobs to show recent activity
	const {
		data: myJobs = [],
		isPending: isJobsPending,
		isError: isJobsError,
	} = useQuery({
		...orpc.partner.getMyJobs.queryOptions(),
		enabled: isAuthenticated,
		staleTime: 1 * 60 * 1000,
	});

	// Show loading skeletons until session is ready and queries have completed
	const isStatsLoading = isSessionPending || (isAuthenticated && isStatsPending);
	const isAppsLoading = isSessionPending || (isAuthenticated && isJobsPending);

	const containerVariants = {
		hidden: { opacity: 0 },
		visible: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
	};

	const itemVariants = {
		hidden: { opacity: 0, y: 16 },
		visible: {
			opacity: 1,
			y: 0,
			transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
		},
	};

	return (
		<motion.div
			className="mx-auto w-full max-w-6xl space-y-6 pb-8"
			initial="hidden"
			animate="visible"
			variants={containerVariants}
		>
			{/* Distinctive Partner Header with corporate gradient */}
			<DashboardHeader
				title={t`Partner Dashboard`}
				icon={BuildingsIcon}
				subtitle={t`Manage your job postings, events, and candidate applications`}
				accentColor="#0ea5e9"
				gradient="linear-gradient(135deg, oklch(0.97 0.01 220) 0%, oklch(0.95 0.02 250) 50%, oklch(0.96 0.015 200) 100%)"
				rightContent={<StatusBadge status="active" />}
			/>

			{/* Company identity bar */}
			<motion.div variants={itemVariants}>
				<Card className="border-l-4 border-l-sky-500 bg-gradient-to-r from-sky-500/5 to-transparent">
					<CardContent className="flex items-center gap-4 py-4">
						<div className="flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500/20 to-blue-600/10 shadow-sm">
							<BuildingsIcon className="size-7 text-sky-600" weight="duotone" />
						</div>
						<div className="flex-1">
							<h2 className="font-bold text-lg">{session?.user?.name ?? t`Partner Company`}</h2>
							<p className="text-muted-foreground text-sm">
								<Trans>Corporate Recruitment Partner</Trans>
							</p>
						</div>
						<div className="hidden items-center gap-2 sm:flex">
							<Badge
								variant="outline"
								className="gap-1 border-sky-200 text-sky-700 dark:border-sky-800 dark:text-sky-300"
							>
								<ChartBarIcon className="size-3" weight="fill" />
								<Trans>Active</Trans>
							</Badge>
						</div>
					</CardContent>
				</Card>
			</motion.div>

			{/* Stats with distinctive colors and gradients */}
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				{isStatsLoading || isStatsError
					? Array.from({ length: 4 }).map((_, i) => (
							<Card key={`stat-skeleton-${i}`}>
								<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
									<Skeleton className="h-4 w-24" />
									<Skeleton className="size-10 rounded-xl" />
								</CardHeader>
								<CardContent>
									<Skeleton className="h-9 w-14" />
									<Skeleton className="mt-1 h-3 w-32" />
								</CardContent>
							</Card>
						))
					: STAT_CONFIGS.map((config, index) => (
							<PartnerStatCard
								key={config.key}
								icon={config.icon}
								label={i18n.t(config.labelKey)}
								value={(dashboardStats as Record<string, number> | undefined)?.[config.key] ?? 0}
								description={i18n.t(config.descKey)}
								color={config.color}
								bgGradient={config.bgGradient}
								index={index}
							/>
						))}
			</div>

			{/* Quick actions with visual cards instead of plain buttons */}
			<motion.section variants={itemVariants} aria-labelledby="partner-actions-heading">
				<h2 id="partner-actions-heading" className="mb-4 flex items-center gap-2 font-semibold text-lg">
					<Trans>Quick Actions</Trans>
				</h2>
				<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
					{QUICK_ACTIONS.map((action, index) => {
						const ActionIcon = action.icon;
						return (
							<motion.div
								key={action.id}
								initial={false}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: 0.05 * index }}
							>
								<Card
									className="group cursor-pointer border-2 border-transparent transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg"
									onClick={() => navigate({ to: action.to as string })}
								>
									<CardContent className="flex items-center gap-4 p-4">
										<div
											className="flex size-12 shrink-0 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110"
											style={{ background: `color-mix(in oklch, ${action.color} 12%, transparent)` }}
										>
											<ActionIcon className="size-6" weight="duotone" style={{ color: action.color }} />
										</div>
										<div className="min-w-0 flex-1">
											<p className="font-semibold text-sm">{i18n.t(action.label)}</p>
											<p className="text-muted-foreground text-xs">{i18n.t(action.description)}</p>
										</div>
										<ArrowRightIcon className="size-4 text-muted-foreground transition-transform duration-300 group-hover:translate-x-1 group-hover:text-primary" />
									</CardContent>
								</Card>
							</motion.div>
						);
					})}
				</div>
			</motion.section>

			{/* Recent job postings - table-like layout */}
			<motion.section variants={itemVariants} aria-labelledby="recent-jobs-heading">
				<Card className="overflow-hidden">
					<CardHeader className="border-b bg-gradient-to-r from-slate-50 to-transparent dark:from-slate-900/50">
						<div className="flex items-center justify-between">
							<div>
								<CardTitle className="flex items-center gap-2 text-base">
									<BriefcaseIcon className="size-5 text-sky-600" weight="duotone" />
									<Trans>Recent Job Postings</Trans>
								</CardTitle>
								<CardDescription className="mt-1">
									<Trans>Your latest job listings and their performance</Trans>
								</CardDescription>
							</div>
							<Button
								variant="outline"
								size="sm"
								className="gap-1"
								onClick={() => navigate({ to: "/dashboard/partner/jobs" as string })}
							>
								<Trans>View All</Trans>
								<ArrowRightIcon className="size-3" />
							</Button>
						</div>
					</CardHeader>
					<CardContent className="p-0">
						{isAppsLoading || isJobsError ? (
							<div className="divide-y">
								{Array.from({ length: 3 }).map((_, i) => (
									<div key={`job-skeleton-${i}`} className="flex items-center justify-between p-4">
										<div className="space-y-2">
											<Skeleton className="h-4 w-40" />
											<Skeleton className="h-3 w-56" />
										</div>
										<Skeleton className="h-6 w-24" />
									</div>
								))}
							</div>
						) : myJobs.length === 0 ? (
							<div className="flex flex-col items-center py-12 text-center">
								<div className="mb-4 flex size-16 items-center justify-center rounded-full bg-sky-500/10">
									<BriefcaseIcon className="size-8 text-sky-500/50" weight="duotone" />
								</div>
								<p className="mb-1 font-semibold">
									<Trans>No job postings yet</Trans>
								</p>
								<p className="mb-4 max-w-sm text-muted-foreground text-sm">
									<Trans>Create your first job posting to start receiving applications.</Trans>
								</p>
								<Button onClick={() => navigate({ to: "/dashboard/partner/post-job" as string })} className="gap-2">
									<PlusIcon className="size-4" />
									<Trans>Post a Job</Trans>
								</Button>
							</div>
						) : (
							<div className="divide-y">
								{myJobs.slice(0, 5).map((job, index) => (
									<motion.div
										key={job.id}
										initial={false}
										animate={{ opacity: 1, x: 0 }}
										transition={{ delay: index * 0.05 }}
										className="flex items-center justify-between p-4 transition-colors hover:bg-muted/30"
									>
										<div className="flex items-center gap-3">
											<div className="hidden size-10 items-center justify-center rounded-lg bg-sky-500/10 sm:flex">
												<BriefcaseIcon className="size-5 text-sky-600" weight="duotone" />
											</div>
											<div>
												<p className="font-medium">{job.titleFr || job.title}</p>
												<div className="flex items-center gap-2 text-muted-foreground text-xs">
													<MapPinIcon className="size-3" />
													<span>{job.location}</span>
													<span aria-hidden="true">&middot;</span>
													<time dateTime={new Date(job.createdAt).toISOString()}>
														{new Date(job.createdAt).toLocaleDateString("fr-FR", {
															day: "numeric",
															month: "short",
															year: "numeric",
														})}
													</time>
												</div>
											</div>
										</div>
										<div className="flex items-center gap-3">
											<Badge variant="outline" className="gap-1 text-xs">
												<UsersIcon className="size-3" />
												{job.applicationCount}
											</Badge>
											<ApplicationStatusBadge status={job.status} />
										</div>
									</motion.div>
								))}
							</div>
						)}
					</CardContent>
				</Card>
			</motion.section>
		</motion.div>
	);
}
