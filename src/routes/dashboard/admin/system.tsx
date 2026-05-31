import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import {
	ArrowLeftIcon,
	CheckCircleIcon,
	DatabaseIcon,
	HardDriveIcon,
	ListIcon,
	UsersIcon,
	WarningCircleIcon,
	XCircleIcon,
} from "@phosphor-icons/react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { client } from "@/integrations/orpc/client";
import { cn } from "@/utils/style";
import { DashboardHeader } from "../-components/header";

export const Route = createFileRoute("/dashboard/admin/system")({
	component: RouteComponent,
	pendingComponent: SystemHealthSkeleton,
	errorComponent: ({ error, reset }) => (
		<div className="space-y-4">
			<DashboardHeader icon={DatabaseIcon} title={t`System Health`} />
			<div className="flex flex-col items-center justify-center rounded-xl border bg-background p-8">
				<WarningCircleIcon className="size-12 text-destructive" />
				<p className="mt-4 text-muted-foreground">
					<Trans>Failed to load system health data</Trans>
				</p>
				<p className="mt-2 text-muted-foreground text-sm">{error.message}</p>
				<Button onClick={reset} className="mt-4">
					Retry
				</Button>
			</div>
		</div>
	),
	loader: async () => {
		const [health, advanced] = await Promise.all([
			client.admin.system.getHealth(),
			client.admin.analytics.getAdvancedOverview(),
		]);
		return { health, advanced };
	},
});

function SystemHealthSkeleton() {
	return (
		<div className="space-y-4">
			<DashboardHeader icon={DatabaseIcon} title={t`System Health`} />
			<div className="space-y-6 rounded-xl border bg-background p-6">
				<div className="flex items-center gap-4">
					<Skeleton className="size-10 rounded-lg" />
					<Skeleton className="h-4 w-48" />
				</div>
				<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
					{Array.from({ length: 4 }).map((_, i) => (
						<Skeleton key={i} className="h-36 rounded-xl" />
					))}
				</div>
				<div className="grid gap-4 md:grid-cols-2">
					<Skeleton className="h-64 rounded-xl" />
					<Skeleton className="h-64 rounded-xl" />
				</div>
			</div>
		</div>
	);
}

type StatusIndicatorProps = {
	status: string;
	label: string;
	detail?: string;
};

function StatusIndicator({ status, label, detail }: StatusIndicatorProps) {
	const isHealthy = status === "healthy";
	return (
		<div className="flex items-center gap-3">
			{isHealthy ? (
				<CheckCircleIcon size={20} className="text-green-500" />
			) : (
				<XCircleIcon size={20} className="text-red-500" />
			)}
			<div>
				<p className="font-medium text-sm">{label}</p>
				{detail && <p className="text-muted-foreground text-xs">{detail}</p>}
			</div>
			<span
				className={cn(
					"ml-auto rounded-full px-2 py-0.5 font-medium text-xs",
					isHealthy ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700",
				)}
			>
				{isHealthy ? t`Healthy` : t`Unhealthy`}
			</span>
		</div>
	);
}

function RouteComponent() {
	const { health, advanced } = Route.useLoaderData();

	return (
		<div className="space-y-4">
			<DashboardHeader icon={DatabaseIcon} title={t`System Health`} />

			<div className="@container space-y-6 rounded-xl border bg-background p-6">
				{/* Header */}
				<div className="flex items-center gap-4">
					<Link
						to="/dashboard/admin"
						className="inline-flex items-center justify-center rounded-lg border p-2 transition-colors hover:bg-muted"
					>
						<ArrowLeftIcon size={20} />
					</Link>
					<p className="text-muted-foreground text-sm">
						<Trans>Monitor system services and infrastructure health</Trans>
					</p>
				</div>

				{/* Service Status Cards */}
				<div className="grid @md:grid-cols-2 @xl:grid-cols-4 gap-4">
					{/* Database */}
					<div className="rounded-xl border bg-card p-5">
						<div className="mb-3 flex items-center gap-2">
							<div
								className={cn(
									"flex size-10 items-center justify-center rounded-lg ring-1",
									health.database.status === "healthy"
										? "bg-green-50 text-green-600 ring-green-200"
										: "bg-red-50 text-red-600 ring-red-200",
								)}
							>
								<DatabaseIcon size={20} weight="duotone" />
							</div>
							<div>
								<p className="font-medium text-sm">
									<Trans>Database</Trans>
								</p>
								<p
									className={cn(
										"font-medium text-xs",
										health.database.status === "healthy" ? "text-green-600" : "text-red-600",
									)}
								>
									{health.database.status === "healthy" ? t`Connected` : t`Disconnected`}
								</p>
							</div>
						</div>
						<p className="text-muted-foreground text-xs">
							<Trans>Latency</Trans>: {health.database.latencyMs}ms
						</p>
					</div>

					{/* Storage */}
					<div className="rounded-xl border bg-card p-5">
						<div className="mb-3 flex items-center gap-2">
							<div
								className={cn(
									"flex size-10 items-center justify-center rounded-lg ring-1",
									health.storage.status === "healthy"
										? "bg-green-50 text-green-600 ring-green-200"
										: "bg-red-50 text-red-600 ring-red-200",
								)}
							>
								<HardDriveIcon size={20} weight="duotone" />
							</div>
							<div>
								<p className="font-medium text-sm">
									<Trans>Storage</Trans>
								</p>
								<p
									className={cn(
										"font-medium text-xs",
										health.storage.status === "healthy" ? "text-green-600" : "text-red-600",
									)}
								>
									{health.storage.status === "healthy" ? t`Available` : t`Unavailable`}
								</p>
							</div>
						</div>
						<p className="text-muted-foreground text-xs">S3-compatible storage</p>
					</div>

					{/* Active Sessions */}
					<div className="rounded-xl border bg-card p-5">
						<div className="mb-3 flex items-center gap-2">
							<div className="flex size-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600 ring-1 ring-blue-200">
								<UsersIcon size={20} weight="duotone" />
							</div>
							<div>
								<p className="font-medium text-sm">
									<Trans>Active Sessions</Trans>
								</p>
								<p className="font-bold text-lg">{health.activeSessions}</p>
							</div>
						</div>
						<p className="text-muted-foreground text-xs">
							<Trans>Currently active user sessions</Trans>
						</p>
					</div>

					{/* Audit Logs */}
					<div className="rounded-xl border bg-card p-5">
						<div className="mb-3 flex items-center gap-2">
							<div className="flex size-10 items-center justify-center rounded-lg bg-purple-50 text-purple-600 ring-1 ring-purple-200">
								<ListIcon size={20} weight="duotone" />
							</div>
							<div>
								<p className="font-medium text-sm">
									<Trans>Audit Logs</Trans>
								</p>
								<p className="font-bold text-lg">{health.totalAuditLogs}</p>
							</div>
						</div>
						<p className="text-muted-foreground text-xs">
							<Trans>Total admin actions recorded</Trans>
						</p>
					</div>
				</div>

				{/* Platform Statistics */}
				<div className="grid @xl:grid-cols-2 gap-6">
					{/* Users Breakdown */}
					<div className="rounded-xl border bg-card p-5">
						<h3 className="mb-4 font-semibold text-lg">
							<Trans>Users Breakdown</Trans>
						</h3>
						<div className="space-y-3">
							<div className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
								<span className="text-sm">
									<Trans>Total Users</Trans>
								</span>
								<span className="font-semibold">{advanced.users.total}</span>
							</div>
							<div className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
								<span className="text-sm">
									<Trans>Active (7 days)</Trans>
								</span>
								<span className="font-semibold">{advanced.users.active7d}</span>
							</div>
							<div className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
								<span className="text-sm">
									<Trans>Active (30 days)</Trans>
								</span>
								<span className="font-semibold">{advanced.users.active30d}</span>
							</div>
							<div className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
								<span className="text-sm">
									<Trans>New (7 days)</Trans>
								</span>
								<span className="font-semibold text-green-600">{advanced.users.new7d}</span>
							</div>
							<div className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
								<span className="text-sm">
									<Trans>New (30 days)</Trans>
								</span>
								<span className="font-semibold text-green-600">{advanced.users.new30d}</span>
							</div>
							<div className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
								<span className="text-sm">
									<Trans>Email Verified</Trans>
								</span>
								<span className="font-semibold">
									{advanced.users.verified} / {advanced.users.total}
								</span>
							</div>
							<div className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
								<span className="text-sm">
									<Trans>Admins</Trans>
								</span>
								<span className="font-semibold">{advanced.users.admins}</span>
							</div>
						</div>
					</div>

					{/* Resumes & Engagement Breakdown */}
					<div className="space-y-6">
						<div className="rounded-xl border bg-card p-5">
							<h3 className="mb-4 font-semibold text-lg">
								<Trans>Resumes Breakdown</Trans>
							</h3>
							<div className="space-y-3">
								<div className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
									<span className="text-sm">
										<Trans>Total Resumes</Trans>
									</span>
									<span className="font-semibold">{advanced.resumes.total}</span>
								</div>
								<div className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
									<span className="text-sm">
										<Trans>Public</Trans>
									</span>
									<span className="font-semibold">{advanced.resumes.public}</span>
								</div>
								<div className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
									<span className="text-sm">
										<Trans>Locked</Trans>
									</span>
									<span className="font-semibold">{advanced.resumes.locked}</span>
								</div>
								<div className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
									<span className="text-sm">
										<Trans>Private</Trans>
									</span>
									<span className="font-semibold">
										{advanced.resumes.total - advanced.resumes.public - advanced.resumes.locked}
									</span>
								</div>
							</div>
						</div>

						<div className="rounded-xl border bg-card p-5">
							<h3 className="mb-4 font-semibold text-lg">
								<Trans>Engagement</Trans>
							</h3>
							<div className="space-y-3">
								<div className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
									<span className="text-sm">
										<Trans>Total Views</Trans>
									</span>
									<span className="font-semibold">{advanced.engagement.totalViews.toLocaleString("fr-FR")}</span>
								</div>
								<div className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
									<span className="text-sm">
										<Trans>Total Downloads</Trans>
									</span>
									<span className="font-semibold">{advanced.engagement.totalDownloads.toLocaleString("fr-FR")}</span>
								</div>
								<div className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
									<span className="text-sm">
										<Trans>Active Sessions</Trans>
									</span>
									<span className="font-semibold">{advanced.engagement.activeSessions}</span>
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* Template Usage */}
				{advanced.templateUsage.length > 0 && (
					<div className="rounded-xl border bg-card p-5">
						<h3 className="mb-4 font-semibold text-lg">
							<Trans>Template Usage</Trans>
						</h3>
						<div className="grid @md:grid-cols-2 @xl:grid-cols-4 gap-2">
							{advanced.templateUsage
								.filter((t) => t.template && t.template !== "unknown")
								.map((tmpl) => (
									<div key={tmpl.template} className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
										<span className="text-sm capitalize">{tmpl.template}</span>
										<span className="font-semibold">{tmpl.count}</span>
									</div>
								))}
						</div>
					</div>
				)}

				{/* Health Check Summary */}
				<div className="rounded-xl border bg-card p-5">
					<h3 className="mb-4 font-semibold text-lg">
						<Trans>Service Status</Trans>
					</h3>
					<div className="space-y-3">
						<StatusIndicator
							status={health.database.status}
							label={t`PostgreSQL Database`}
							detail={`${health.database.latencyMs}ms latency`}
						/>
						<StatusIndicator
							status={health.storage.status}
							label={t`S3 Object Storage (SeaweedFS)`}
							detail={t`File uploads and screenshots`}
						/>
					</div>
				</div>
			</div>
		</div>
	);
}
