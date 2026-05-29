import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { BrainIcon, CheckCircleIcon, ListChecksIcon, SparkleIcon, WarningCircleIcon } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";
import { ErrorComponent } from "@/components/error-component";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { authClient } from "@/integrations/auth/client";
import { orpc } from "@/integrations/orpc/client";
import { DashboardHeader } from "../-components/header";

export const Route = createFileRoute("/dashboard/settings/ai")({
	component: RouteComponent,
	errorComponent: ErrorComponent,
});

const AI_FEATURES = [
	{ key: "resume-improvement", label: () => t`Resume Improvement` },
	{ key: "summary-generation", label: () => t`Summary Generation` },
	{ key: "skill-suggestions", label: () => t`Skill Suggestions` },
	{ key: "headline-generation", label: () => t`Headline Generation` },
	{ key: "grammar-fix", label: () => t`Grammar Fix` },
	{ key: "resume-analysis", label: () => t`Resume Analysis` },
	{ key: "pdf-docx-parsing", label: () => t`PDF/DOCX Parsing` },
] as const;

function formatNumber(num: number): string {
	if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
	if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
	return num.toLocaleString();
}

function RemainingDisplay({ remaining, label }: { remaining: number; label: string }) {
	const isUnlimited = remaining === -1;

	return (
		<div className="flex items-center justify-between rounded-sm border px-4 py-3">
			<span className="text-muted-foreground text-sm">{label}</span>
			<span className="font-semibold tabular-nums">{isUnlimited ? t`Unlimited` : formatNumber(remaining)}</span>
		</div>
	);
}

function AIStatusCard() {
	// AI status is a public endpoint - no auth guard needed, fires immediately
	const { data: status, isLoading } = useQuery(orpc.aiConfig.status.check.queryOptions());

	if (isLoading) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>
						<Trans>AI Availability</Trans>
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="space-y-3 py-2">
						<Skeleton className="h-4 w-3/4" />
						<Skeleton className="h-4 w-1/2" />
					</div>
				</CardContent>
			</Card>
		);
	}

	const isAvailable = status?.available ?? false;

	return (
		<Card>
			<CardHeader>
				<CardTitle>
					<Trans>AI Availability</Trans>
				</CardTitle>
			</CardHeader>
			<CardContent>
				{isAvailable ? (
					<div className="flex items-start gap-4">
						<div className="rounded-sm bg-green-500/10 p-2.5">
							<CheckCircleIcon className="text-green-600" size={24} weight="fill" />
						</div>
						<div className="flex-1 space-y-2">
							<p className="font-medium text-green-700 dark:text-green-400">
								<Trans>AI features are available</Trans>
							</p>
							<div className="flex flex-wrap gap-2">
								{status?.provider?.displayName && (
									<Badge variant="secondary">
										<Trans>Provider: {status.provider.displayName}</Trans>
									</Badge>
								)}
								{status?.provider?.model && (
									<Badge variant="secondary">
										<Trans>Model: {status.provider.model}</Trans>
									</Badge>
								)}
							</div>
						</div>
					</div>
				) : (
					<div className="flex items-start gap-4">
						<div className="rounded-sm bg-amber-500/10 p-2.5">
							<WarningCircleIcon className="text-amber-600" size={24} weight="fill" />
						</div>
						<div className="flex-1 space-y-1">
							<p className="font-medium text-amber-700 dark:text-amber-400">
								<Trans>AI features are not available</Trans>
							</p>
							<p className="text-muted-foreground text-sm leading-relaxed">
								<Trans>AI features are not configured. Contact your administrator.</Trans>
							</p>
						</div>
					</div>
				)}
			</CardContent>
		</Card>
	);
}

function UsageCard() {
	const { data: session } = authClient.useSession();
	const { data: usage, isLoading } = useQuery({
		...orpc.aiConfig.usage.getMyUsage.queryOptions(),
		enabled: !!session?.user,
	});

	if (isLoading) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>
						<Trans>My Usage</Trans>
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="grid gap-4 sm:grid-cols-3">
						{Array.from({ length: 3 }).map((_, i) => (
							<div key={i} className="space-y-2">
								<Skeleton className="h-4 w-20" />
								<Skeleton className="h-6 w-16" />
							</div>
						))}
					</div>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle>
					<Trans>My Usage</Trans>
				</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="grid gap-6 sm:grid-cols-3">
					<div className="space-y-1 rounded-sm border p-4">
						<p className="text-muted-foreground text-sm">
							<Trans>Today</Trans>
						</p>
						<p className="font-semibold text-lg tabular-nums">
							{formatNumber(usage?.today?.requests ?? 0)}{" "}
							<span className="font-normal text-muted-foreground text-sm">
								<Trans>requests</Trans>
							</span>
						</p>
						<p className="text-muted-foreground text-sm tabular-nums">
							{formatNumber(usage?.today?.tokens ?? 0)} <Trans>tokens</Trans>
						</p>
					</div>

					<div className="space-y-1 rounded-sm border p-4">
						<p className="text-muted-foreground text-sm">
							<Trans>This Month</Trans>
						</p>
						<p className="font-semibold text-lg tabular-nums">
							{formatNumber(usage?.month?.requests ?? 0)}{" "}
							<span className="font-normal text-muted-foreground text-sm">
								<Trans>requests</Trans>
							</span>
						</p>
						<p className="text-muted-foreground text-sm tabular-nums">
							{formatNumber(usage?.month?.tokens ?? 0)} <Trans>tokens</Trans>
						</p>
					</div>

					<div className="space-y-1 rounded-sm border p-4">
						<p className="text-muted-foreground text-sm">
							<Trans>All Time</Trans>
						</p>
						<p className="font-semibold text-lg tabular-nums">
							{formatNumber(usage?.total?.requests ?? 0)}{" "}
							<span className="font-normal text-muted-foreground text-sm">
								<Trans>requests</Trans>
							</span>
						</p>
						<p className="text-muted-foreground text-sm tabular-nums">
							{formatNumber(usage?.total?.tokens ?? 0)} <Trans>tokens</Trans>
						</p>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}

function QuotaCard() {
	const { data: session } = authClient.useSession();
	const { data: quota, isLoading } = useQuery({
		...orpc.aiConfig.usage.getMyQuota.queryOptions(),
		enabled: !!session?.user,
	});

	if (isLoading) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>
						<Trans>My Quota</Trans>
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="space-y-4">
						{Array.from({ length: 2 }).map((_, i) => (
							<div key={i} className="space-y-2">
								<div className="flex justify-between">
									<Skeleton className="h-4 w-28" />
									<Skeleton className="h-4 w-16" />
								</div>
								<Skeleton className="h-2 w-full rounded-full" />
							</div>
						))}
					</div>
				</CardContent>
			</Card>
		);
	}

	const remaining = quota?.remaining;
	const allUnlimited =
		remaining &&
		remaining.dailyRequests === -1 &&
		remaining.monthlyRequests === -1 &&
		remaining.dailyTokens === -1 &&
		remaining.monthlyTokens === -1;

	if (!remaining || allUnlimited) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>
						<Trans>My Quota</Trans>
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="flex items-center gap-3 text-muted-foreground">
						<CheckCircleIcon size={20} className="text-green-600" />
						<p>
							<Trans>No usage limits</Trans>
						</p>
					</div>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle>
					<Trans>My Quota</Trans>
				</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="grid gap-4 sm:grid-cols-2">
					{remaining.dailyRequests !== -1 && (
						<RemainingDisplay remaining={remaining.dailyRequests} label={t`Daily Requests Remaining`} />
					)}

					{remaining.monthlyRequests !== -1 && (
						<RemainingDisplay remaining={remaining.monthlyRequests} label={t`Monthly Requests Remaining`} />
					)}

					{remaining.dailyTokens !== -1 && (
						<RemainingDisplay remaining={remaining.dailyTokens} label={t`Daily Tokens Remaining`} />
					)}

					{remaining.monthlyTokens !== -1 && (
						<RemainingDisplay remaining={remaining.monthlyTokens} label={t`Monthly Tokens Remaining`} />
					)}
				</div>
			</CardContent>
		</Card>
	);
}

function AvailableFeaturesCard() {
	// AI status is a public endpoint - no auth guard needed, fires immediately
	const { data: status, isLoading } = useQuery(orpc.aiConfig.status.check.queryOptions());

	if (isLoading) {
		return (
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<ListChecksIcon size={20} />
						<Trans>Available AI Features</Trans>
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="grid gap-3 sm:grid-cols-2">
						{Array.from({ length: 6 }).map((_, i) => (
							<div key={i} className="flex items-center gap-2">
								<Skeleton className="size-4 rounded" />
								<Skeleton className="h-4 w-32" />
							</div>
						))}
					</div>
				</CardContent>
			</Card>
		);
	}

	const isAvailable = status?.available ?? false;

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<ListChecksIcon size={20} />
					<Trans>Available AI Features</Trans>
				</CardTitle>
			</CardHeader>
			<CardContent>
				{isAvailable && (
					<div className="mb-3 flex items-center gap-3 text-muted-foreground">
						<SparkleIcon size={20} className="text-primary" />
						<p>
							<Trans>All AI features are available</Trans>
						</p>
					</div>
				)}

				<div className="flex flex-wrap gap-2">
					{AI_FEATURES.map((feature) => (
						<Badge key={feature.key} variant={isAvailable ? "secondary" : "outline"} className="gap-1.5">
							{isAvailable ? (
								<CheckCircleIcon size={14} className="text-green-600" weight="fill" />
							) : (
								<WarningCircleIcon size={14} className="text-muted-foreground" />
							)}
							{feature.label()}
						</Badge>
					))}
				</div>
			</CardContent>
		</Card>
	);
}

function RouteComponent() {
	return (
		<div className="space-y-4">
			<DashboardHeader icon={BrainIcon} title={t`Artificial Intelligence`} />

			<Separator />

			<motion.div
				initial={false}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.3 }}
				className="grid max-w-3xl gap-6"
			>
				<AIStatusCard />
				<UsageCard />
				<QuotaCard />
				<AvailableFeaturesCard />
			</motion.div>
		</div>
	);
}
