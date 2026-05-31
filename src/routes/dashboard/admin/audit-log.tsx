import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { ArrowLeftIcon, ClockIcon, ListIcon, WarningCircleIcon } from "@phosphor-icons/react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import z from "zod";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { client } from "@/integrations/orpc/client";
import { DashboardHeader } from "../-components/header";

type AuditLogEntry = {
	id: string;
	adminId: string | null;
	action: string;
	targetType: string | null;
	targetId: string | null;
	metadata: Record<string, unknown> | null;
	createdAt: Date;
	adminName: string | null;
	adminEmail: string | null;
};

const searchSchema = z.object({
	page: z.number().optional().default(1),
});

export const Route = createFileRoute("/dashboard/admin/audit-log")({
	component: RouteComponent,
	pendingComponent: AuditLogSkeleton,
	validateSearch: searchSchema,
	loaderDeps: ({ search }) => ({ page: search.page }),
	errorComponent: ({ error, reset }) => (
		<div className="space-y-4">
			<DashboardHeader icon={ListIcon} title={t`Audit Log`} />
			<div className="flex flex-col items-center justify-center rounded-xl border bg-background p-8">
				<WarningCircleIcon className="size-12 text-destructive" />
				<p className="mt-4 text-muted-foreground">
					<Trans>Failed to load audit log</Trans>
				</p>
				<p className="mt-2 text-muted-foreground text-sm">{error.message}</p>
				<Button onClick={reset} className="mt-4">
					Retry
				</Button>
			</div>
		</div>
	),
	loader: async ({ deps }) => {
		return await client.admin.audit.list({
			page: deps.page,
			limit: 30,
		});
	},
});

function getActionBadgeVariant(action: string): "destructive" | "default" | "secondary" | "outline" {
	if (action.includes("delete")) return "destructive";
	if (action.includes("update") || action.includes("change")) return "default";
	if (action.includes("export")) return "secondary";
	return "outline";
}

function formatAction(action: string) {
	return action
		.split("_")
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(" ");
}

function AuditLogSkeleton() {
	return (
		<div className="space-y-4">
			<DashboardHeader icon={ListIcon} title={t`Audit Log`} />

			<div className="space-y-6 rounded-xl border bg-background p-6">
				<div className="flex items-center gap-4">
					<Skeleton className="size-10 rounded-lg" />
					<Skeleton className="h-4 w-40" />
				</div>

				<div className="overflow-x-auto rounded-lg border">
					<Table className="min-w-[700px]">
						<TableHeader>
							<TableRow>
								<TableHead>
									<Trans>Timestamp</Trans>
								</TableHead>
								<TableHead>
									<Trans>Admin</Trans>
								</TableHead>
								<TableHead>
									<Trans>Action</Trans>
								</TableHead>
								<TableHead>
									<Trans>Target</Trans>
								</TableHead>
								<TableHead>
									<Trans>Details</Trans>
								</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{Array.from({ length: 10 }).map((_, i) => (
								<TableRow key={i}>
									<TableCell>
										<Skeleton className="h-4 w-32" />
									</TableCell>
									<TableCell>
										<div className="space-y-2">
											<Skeleton className="h-4 w-24" />
											<Skeleton className="h-3 w-32" />
										</div>
									</TableCell>
									<TableCell>
										<Skeleton className="h-6 w-20" />
									</TableCell>
									<TableCell>
										<Skeleton className="h-4 w-20" />
									</TableCell>
									<TableCell>
										<Skeleton className="h-16 w-40" />
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</div>
			</div>
		</div>
	);
}

function RouteComponent() {
	const navigate = useNavigate();
	const { page } = Route.useSearch();
	const data = Route.useLoaderData();
	const logs = data?.logs ?? [];
	const total = data?.total ?? 0;
	const totalPages = data?.totalPages ?? 1;

	const handlePageChange = (newPage: number) => {
		navigate({
			to: "/dashboard/admin/audit-log",
			search: { page: newPage },
		});
	};

	return (
		<div className="space-y-4">
			<DashboardHeader icon={ListIcon} title={t`Audit Log`} />

			<div className="space-y-6 rounded-xl border bg-background p-6">
				{/* Header */}
				<div className="flex items-center gap-4">
					<Link
						to="/dashboard/admin"
						className="inline-flex items-center justify-center rounded-lg border p-2 transition-colors hover:bg-muted"
					>
						<ArrowLeftIcon size={20} />
					</Link>
					<p className="text-muted-foreground text-sm">
						{total} <Trans>total actions recorded</Trans>
					</p>
				</div>

				{/* Table */}
				<div className="overflow-x-auto rounded-lg border">
					<Table className="min-w-[700px]">
						<TableHeader>
							<TableRow>
								<TableHead>
									<Trans>Timestamp</Trans>
								</TableHead>
								<TableHead>
									<Trans>Admin</Trans>
								</TableHead>
								<TableHead>
									<Trans>Action</Trans>
								</TableHead>
								<TableHead>
									<Trans>Target</Trans>
								</TableHead>
								<TableHead>
									<Trans>Details</Trans>
								</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{logs.length === 0 && (
								<TableRow>
									<TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
										<Trans>No audit logs yet</Trans>
									</TableCell>
								</TableRow>
							)}
							{(logs as AuditLogEntry[]).map((log) => (
								<TableRow key={log.id}>
									<TableCell>
										<div className="flex items-center gap-2 text-sm">
											<ClockIcon size={14} className="text-muted-foreground" />
											<span>
												{new Date(log.createdAt).toLocaleDateString("fr-FR")}{" "}
												{new Date(log.createdAt).toLocaleTimeString("fr-FR")}
											</span>
										</div>
									</TableCell>
									<TableCell>
										<div>
											<p className="font-medium text-sm">{log.adminName ?? "Unknown"}</p>
											<p className="text-muted-foreground text-xs">{log.adminEmail ?? "No email"}</p>
										</div>
									</TableCell>
									<TableCell>
										<Badge variant={getActionBadgeVariant(log.action)}>{formatAction(log.action)}</Badge>
									</TableCell>
									<TableCell>
										{log.targetType && (
											<div>
												<p className="font-medium text-sm capitalize">{log.targetType}</p>
												{log.targetId && (
													<p className="font-mono text-muted-foreground text-xs">{log.targetId.slice(0, 8)}...</p>
												)}
											</div>
										)}
									</TableCell>
									<TableCell>
										{log.metadata && (
											<pre className="max-w-xs overflow-hidden text-ellipsis rounded bg-muted p-2 font-mono text-xs">
												{JSON.stringify(log.metadata, null, 2)}
											</pre>
										)}
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</div>

				{/* Pagination */}
				{totalPages > 1 && (
					<div className="flex items-center justify-between">
						<p className="text-muted-foreground text-sm">
							<Trans>
								Page {page} of {totalPages}
							</Trans>
						</p>
						<div className="flex gap-2">
							<Button variant="outline" size="sm" disabled={page <= 1} onClick={() => handlePageChange(page - 1)}>
								<Trans>Previous</Trans>
							</Button>
							<Button
								variant="outline"
								size="sm"
								disabled={page >= totalPages}
								onClick={() => handlePageChange(page + 1)}
							>
								<Trans>Next</Trans>
							</Button>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
