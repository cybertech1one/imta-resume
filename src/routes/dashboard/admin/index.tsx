import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import {
	BrainIcon,
	ChartLineIcon,
	DownloadSimpleIcon,
	ExportIcon,
	EyeIcon,
	FileIcon,
	GaugeIcon,
	ScalesIcon,
	SpinnerGapIcon,
	UsersIcon,
	WarningCircleIcon,
} from "@phosphor-icons/react";
import { useMutation } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { client, orpc } from "@/integrations/orpc/client";
import { cn } from "@/utils/style";
import { DashboardHeader } from "../-components/header";

type RecentUser = {
	id: string;
	name: string;
	email: string;
	createdAt: Date;
};

type TopResume = {
	id: string;
	name: string;
	slug: string;
	isPublic: boolean;
	views: number | null;
	downloads: number | null;
	userName: string;
	userEmail: string;
};

type RecentResume = {
	id: string;
	name: string;
	createdAt: Date;
	userName: string;
};

export const Route = createFileRoute("/dashboard/admin/")({
	component: RouteComponent,
	pendingComponent: AdminDashboardSkeleton,
	errorComponent: ({ error, reset }) => (
		<div className="space-y-4">
			<DashboardHeader icon={GaugeIcon} title={t`Admin Dashboard`} />
			<div className="flex flex-col items-center justify-center rounded-xl border bg-background p-8">
				<WarningCircleIcon className="size-12 text-destructive" />
				<p className="mt-4 text-muted-foreground">
					<Trans>Failed to load admin dashboard data</Trans>
				</p>
				<p className="mt-2 text-muted-foreground text-sm">{error.message}</p>
				<Button onClick={reset} className="mt-4">
					Retry
				</Button>
			</div>
		</div>
	),
	loader: async () => {
		const [overview, recentActivity, topResumes, userGrowth, resumeGrowth] = await Promise.all([
			client.admin.analytics.getOverview(),
			client.admin.analytics.getRecentActivity({ limit: 5 }),
			client.admin.analytics.getTopResumes({ limit: 5 }),
			client.admin.analytics.getUserGrowth({ days: 30 }),
			client.admin.analytics.getResumeGrowth({ days: 30 }),
		]);

		return { overview, recentActivity, topResumes, userGrowth, resumeGrowth };
	},
});

type StatCardProps = {
	title: string;
	value: number;
	icon: React.ReactNode;
	color: "blue" | "green" | "purple" | "orange";
};

function StatCard({ title, value, icon, color }: StatCardProps) {
	const colorClasses = {
		blue: "bg-blue-50 text-blue-600 ring-blue-200",
		green: "bg-green-50 text-green-600 ring-green-200",
		purple: "bg-purple-50 text-purple-600 ring-purple-200",
		orange: "bg-orange-50 text-orange-600 ring-orange-200",
	};

	return (
		<div className="rounded-xl border bg-card p-6 shadow-sm">
			<div className="flex items-center justify-between">
				<div>
					<p className="font-medium text-muted-foreground text-sm">{title}</p>
					<p className="mt-2 font-bold text-3xl tracking-tight">{value.toLocaleString()}</p>
				</div>
				<div className={cn("flex size-12 items-center justify-center rounded-xl ring-1", colorClasses[color])}>
					{icon}
				</div>
			</div>
		</div>
	);
}

type GrowthChartProps = {
	title: string;
	data: { date: string; count: number }[];
	color: string;
};

function GrowthChart({ title, data, color }: GrowthChartProps) {
	// Format data for the chart
	const chartData = data.map((item) => ({
		date: new Date(item.date).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
		count: item.count,
	}));

	return (
		<div className="rounded-xl border bg-card p-6">
			<h2 className="mb-4 font-semibold text-lg">{title}</h2>
			{chartData.length > 0 ? (
				<ResponsiveContainer width="100%" height={200}>
					<AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
						<defs>
							<linearGradient id={`gradient-${color}`} x1="0" y1="0" x2="0" y2="1">
								<stop offset="5%" stopColor={color} stopOpacity={0.3} />
								<stop offset="95%" stopColor={color} stopOpacity={0} />
							</linearGradient>
						</defs>
						<CartesianGrid strokeDasharray="3 3" className="stroke-border" />
						<XAxis
							dataKey="date"
							tick={{ fontSize: 12 }}
							tickLine={false}
							axisLine={false}
							className="fill-muted-foreground"
						/>
						<YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} className="fill-muted-foreground" />
						<Tooltip
							contentStyle={{
								backgroundColor: "hsl(var(--card))",
								border: "1px solid hsl(var(--border))",
								borderRadius: "8px",
								fontSize: "12px",
							}}
						/>
						<Area type="monotone" dataKey="count" stroke={color} fill={`url(#gradient-${color})`} strokeWidth={2} />
					</AreaChart>
				</ResponsiveContainer>
			) : (
				<div className="flex h-[200px] items-center justify-center text-muted-foreground text-sm">
					<Trans>No data available</Trans>
				</div>
			)}
		</div>
	);
}

function downloadJson(data: unknown, filename: string) {
	const json = JSON.stringify(data, null, 2);
	const blob = new Blob([json], { type: "application/json" });
	const url = URL.createObjectURL(blob);
	const link = document.createElement("a");
	link.href = url;
	link.download = filename;
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
	URL.revokeObjectURL(url);
}

function AdminDashboardSkeleton() {
	return (
		<div className="space-y-4">
			<DashboardHeader icon={GaugeIcon} title={t`Admin Dashboard`} />

			<div className="@container space-y-8 rounded-xl border bg-background p-6">
				<Skeleton className="h-4 w-64" />

				<div className="grid @md:grid-cols-2 @xl:grid-cols-4 gap-4">
					{Array.from({ length: 4 }).map((_, i) => (
						<Skeleton key={i} className="h-32 rounded-xl" />
					))}
				</div>

				<div className="grid @xl:grid-cols-2 gap-6">
					{Array.from({ length: 2 }).map((_, i) => (
						<Skeleton key={i} className="h-64 rounded-xl" />
					))}
				</div>

				<div className="flex flex-wrap gap-3">
					{Array.from({ length: 3 }).map((_, i) => (
						<Skeleton key={i} className="h-10 w-40" />
					))}
				</div>

				<Skeleton className="h-48 rounded-xl" />

				<div className="grid @xl:grid-cols-2 gap-6">
					{Array.from({ length: 2 }).map((_, i) => (
						<Skeleton key={i} className="h-64 rounded-xl" />
					))}
				</div>

				<Skeleton className="h-64 rounded-xl" />
			</div>
		</div>
	);
}

function RouteComponent() {
	const { overview, recentActivity, topResumes, userGrowth, resumeGrowth } = Route.useLoaderData();

	const [exportingUsers, setExportingUsers] = useState(false);
	const [exportingResumes, setExportingResumes] = useState(false);

	const { mutate: exportUsers } = useMutation(orpc.admin.export.users.mutationOptions());
	const { mutate: exportResumes } = useMutation(orpc.admin.export.resumes.mutationOptions());

	const handleExportUsers = () => {
		setExportingUsers(true);
		const toastId = toast.loading(t`Exporting users...`);
		exportUsers(undefined, {
			onSuccess: (data) => {
				downloadJson(data, `users-export-${new Date().toISOString().split("T")[0]}.json`);
				toast.success(t`Users exported successfully`, { id: toastId });
				setExportingUsers(false);
			},
			onError: (error) => {
				toast.error(error.message || t`Failed to export users`, { id: toastId });
				setExportingUsers(false);
			},
		});
	};

	const handleExportResumes = () => {
		setExportingResumes(true);
		const toastId = toast.loading(t`Exporting resumes...`);
		exportResumes(undefined, {
			onSuccess: (data) => {
				downloadJson(data, `resumes-export-${new Date().toISOString().split("T")[0]}.json`);
				toast.success(t`Resumes exported successfully`, { id: toastId });
				setExportingResumes(false);
			},
			onError: (error) => {
				toast.error(error.message || t`Failed to export resumes`, { id: toastId });
				setExportingResumes(false);
			},
		});
	};

	return (
		<div className="space-y-4">
			<DashboardHeader icon={GaugeIcon} title={t`Admin Dashboard`} />

			<div className="@container space-y-8 rounded-xl border bg-background p-6">
				{/* Page Description */}
				<p className="text-muted-foreground">
					<Trans>Monitor your application statistics and manage users.</Trans>
				</p>

				{/* Stats Grid */}
				<div className="grid @md:grid-cols-2 @xl:grid-cols-4 gap-4">
					<StatCard
						title={t`Total Users`}
						value={overview.users}
						icon={<UsersIcon size={24} weight="duotone" />}
						color="blue"
					/>
					<StatCard
						title={t`Total Resumes`}
						value={overview.resumes}
						icon={<FileIcon size={24} weight="duotone" />}
						color="green"
					/>
					<StatCard
						title={t`Total Views`}
						value={overview.views}
						icon={<EyeIcon size={24} weight="duotone" />}
						color="purple"
					/>
					<StatCard
						title={t`Total Downloads`}
						value={overview.downloads}
						icon={<DownloadSimpleIcon size={24} weight="duotone" />}
						color="orange"
					/>
				</div>

				{/* Growth Charts */}
				<div className="grid @xl:grid-cols-2 gap-6">
					<GrowthChart title={t`User Growth (Last 30 Days)`} data={userGrowth} color="#3b82f6" />
					<GrowthChart title={t`Resume Growth (Last 30 Days)`} data={resumeGrowth} color="#22c55e" />
				</div>

				{/* Quick Links */}
				<div className="flex flex-wrap gap-3">
					<Link
						to="/dashboard/admin/users"
						className="inline-flex items-center gap-2 rounded-lg border bg-card px-4 py-2 font-medium text-sm transition-colors hover:bg-muted"
					>
						<UsersIcon size={18} />
						<Trans>Manage Users</Trans>
					</Link>
					<Link
						to="/dashboard/admin/resumes"
						className="inline-flex items-center gap-2 rounded-lg border bg-card px-4 py-2 font-medium text-sm transition-colors hover:bg-muted"
					>
						<FileIcon size={18} />
						<Trans>Manage Resumes</Trans>
					</Link>
					<Link
						to="/dashboard/admin/audit-log"
						className="inline-flex items-center gap-2 rounded-lg border bg-card px-4 py-2 font-medium text-sm transition-colors hover:bg-muted"
					>
						<ChartLineIcon size={18} />
						<Trans>View Audit Log</Trans>
					</Link>
					<Link
						to="/dashboard/admin/ai-providers"
						className="inline-flex items-center gap-2 rounded-lg border bg-card px-4 py-2 font-medium text-sm transition-colors hover:bg-muted"
					>
						<BrainIcon size={18} />
						<Trans>AI Providers</Trans>
					</Link>
					<Link
						to="/dashboard/admin/ai-quotas"
						className="inline-flex items-center gap-2 rounded-lg border bg-card px-4 py-2 font-medium text-sm transition-colors hover:bg-muted"
					>
						<ScalesIcon size={18} />
						<Trans>AI Quotas</Trans>
					</Link>
				</div>

				{/* Export Section */}
				<div className="rounded-xl border bg-card p-6">
					<h2 className="mb-4 font-semibold text-lg">
						<Trans>Export Data</Trans>
					</h2>
					<p className="mb-4 text-muted-foreground text-sm">
						<Trans>Export your application data as JSON files for backup or analysis.</Trans>
					</p>
					<div className="flex flex-wrap gap-3">
						<Button variant="outline" onClick={handleExportUsers} disabled={exportingUsers}>
							{exportingUsers ? <SpinnerGapIcon size={18} className="animate-spin" /> : <ExportIcon size={18} />}
							<Trans>Export Users</Trans>
						</Button>
						<Button variant="outline" onClick={handleExportResumes} disabled={exportingResumes}>
							{exportingResumes ? <SpinnerGapIcon size={18} className="animate-spin" /> : <ExportIcon size={18} />}
							<Trans>Export Resumes</Trans>
						</Button>
					</div>
				</div>

				{/* Two Column Layout */}
				<div className="grid @xl:grid-cols-2 gap-6">
					{/* Recent Users */}
					<div className="rounded-xl border bg-card p-6">
						<h2 className="mb-4 font-semibold text-lg">
							<Trans>Recent Users</Trans>
						</h2>
						<div className="space-y-3">
							{(recentActivity.recentUsers as RecentUser[]).map((user) => (
								<div key={user.id} className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
									<div>
										<p className="font-medium text-sm">{user.name}</p>
										<p className="text-muted-foreground text-xs">{user.email}</p>
									</div>
									<p className="text-muted-foreground text-xs">{new Date(user.createdAt).toLocaleDateString()}</p>
								</div>
							))}
							{recentActivity.recentUsers.length === 0 && (
								<p className="py-4 text-center text-muted-foreground text-sm">
									<Trans>No recent users</Trans>
								</p>
							)}
						</div>
					</div>

					{/* Top Resumes */}
					<div className="rounded-xl border bg-card p-6">
						<h2 className="mb-4 font-semibold text-lg">
							<Trans>Top Resumes by Views</Trans>
						</h2>
						<div className="space-y-3">
							{(topResumes as TopResume[]).map((resume) => (
								<div key={resume.id} className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
									<div>
										<p className="font-medium text-sm">{resume.name}</p>
										<p className="text-muted-foreground text-xs">{resume.userName}</p>
									</div>
									<div className="text-right">
										<p className="font-medium text-sm">{resume.views ?? 0} views</p>
										<p className="text-muted-foreground text-xs">{resume.downloads ?? 0} downloads</p>
									</div>
								</div>
							))}
							{topResumes.length === 0 && (
								<p className="py-4 text-center text-muted-foreground text-sm">
									<Trans>No resumes yet</Trans>
								</p>
							)}
						</div>
					</div>
				</div>

				{/* Recent Resumes */}
				<div className="rounded-xl border bg-card p-6">
					<h2 className="mb-4 font-semibold text-lg">
						<Trans>Recent Resumes</Trans>
					</h2>
					<div className="space-y-3">
						{(recentActivity.recentResumes as RecentResume[]).map((resume) => (
							<div key={resume.id} className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
								<div>
									<p className="font-medium text-sm">{resume.name}</p>
									<p className="text-muted-foreground text-xs">by {resume.userName}</p>
								</div>
								<p className="text-muted-foreground text-xs">{new Date(resume.createdAt).toLocaleDateString()}</p>
							</div>
						))}
						{recentActivity.recentResumes.length === 0 && (
							<p className="py-4 text-center text-muted-foreground text-sm">
								<Trans>No recent resumes</Trans>
							</p>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
