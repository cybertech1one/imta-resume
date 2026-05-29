import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import {
	ArrowLeftIcon,
	FloppyDiskIcon,
	GearSixIcon,
	GlobeIcon,
	LightningIcon,
	ShieldCheckIcon,
	SparkleIcon,
	WarningCircleIcon,
} from "@phosphor-icons/react";
import { useMutation } from "@tanstack/react-query";
import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { client, orpc } from "@/integrations/orpc/client";
import { DashboardHeader } from "../../-components/header";

type GlobalSettings = {
	id: string;
	maxDailyRequests: number | null;
	maxMonthlyRequests: number | null;
	maxDailyTokens: number | null;
	maxMonthlyTokens: number | null;
	alertThresholdPercent: number | null;
	suspendOnExceed: boolean | null;
	defaultLanguage: string | null;
	allowedLanguages: string[] | null;
	isActive: boolean;
	createdAt: Date | string;
	updatedAt: Date | string;
};

type GlobalStats = {
	settings: {
		maxDailyRequests: number;
		maxMonthlyRequests: number;
		maxDailyTokens: number;
		maxMonthlyTokens: number;
		alertThresholdPercent: number;
		suspendOnExceed: boolean;
		defaultLanguage: string;
		allowedLanguages: string[];
		isActive: boolean;
	};
	daily: {
		requests: number;
		tokens: number;
		successCount: number;
		errorCount: number;
		quotaExceededCount: number;
		uniqueUsers: number;
		requestsPercent: number;
		tokensPercent: number;
	};
	monthly: {
		requests: number;
		tokens: number;
		successCount: number;
		errorCount: number;
		quotaExceededCount: number;
		uniqueUsers: number;
		requestsPercent: number;
		tokensPercent: number;
	};
};

const LANGUAGE_OPTIONS = [
	{ value: "fr", label: "Francais" },
	{ value: "ar", label: "Arabe" },
	{ value: "en", label: "Anglais" },
	{ value: "darija", label: "Darija" },
] as const;

export const Route = createFileRoute("/dashboard/admin/ai-settings/")({
	component: RouteComponent,
	pendingComponent: AISettingsSkeleton,
	errorComponent: ({ error, reset }) => (
		<div className="space-y-4">
			<DashboardHeader icon={GearSixIcon} title={t`Global AI Settings`} />
			<div className="flex flex-col items-center justify-center rounded-xl border bg-background p-8">
				<WarningCircleIcon className="size-12 text-destructive" />
				<p className="mt-4 text-muted-foreground">
					<Trans>Failed to load AI settings</Trans>
				</p>
				<p className="mt-2 text-muted-foreground text-sm">{error.message}</p>
				<Button onClick={reset} className="mt-4">
					<Trans>Retry</Trans>
				</Button>
			</div>
		</div>
	),
	loader: async () => {
		const [settings, stats] = await Promise.all([
			client.aiConfig.globalSettings.get(),
			client.aiConfig.globalSettings.getStats(),
		]);
		return { settings, stats };
	},
});

function AISettingsSkeleton() {
	return (
		<div className="space-y-4">
			<DashboardHeader icon={GearSixIcon} title={t`Global AI Settings`} />
			<div className="grid gap-6 lg:grid-cols-2">
				{Array.from({ length: 4 }).map((_, i) => (
					<Card key={i}>
						<CardHeader>
							<Skeleton className="h-5 w-32" />
							<Skeleton className="h-4 w-48" />
						</CardHeader>
						<CardContent>
							<div className="space-y-4">
								<Skeleton className="h-10 w-full" />
								<Skeleton className="h-10 w-full" />
							</div>
						</CardContent>
					</Card>
				))}
			</div>
		</div>
	);
}

function formatNumber(num: number): string {
	if (num >= 1000000) {
		return `${(num / 1000000).toFixed(1)}M`;
	}
	if (num >= 1000) {
		return `${(num / 1000).toFixed(1)}K`;
	}
	return num.toString();
}

function RouteComponent() {
	const router = useRouter();
	const { settings: initialSettings, stats } = Route.useLoaderData() as {
		settings: GlobalSettings;
		stats: GlobalStats;
	};

	const [formData, setFormData] = useState({
		maxDailyRequests: initialSettings.maxDailyRequests ?? 10000,
		maxMonthlyRequests: initialSettings.maxMonthlyRequests ?? 100000,
		maxDailyTokens: initialSettings.maxDailyTokens ?? 10000000,
		maxMonthlyTokens: initialSettings.maxMonthlyTokens ?? 100000000,
		alertThresholdPercent: initialSettings.alertThresholdPercent ?? 80,
		suspendOnExceed: initialSettings.suspendOnExceed ?? false,
		defaultLanguage: initialSettings.defaultLanguage ?? "fr",
		allowedLanguages: initialSettings.allowedLanguages ?? ["fr", "ar", "en", "darija"],
		isActive: initialSettings.isActive,
	});

	const { mutate: updateSettings, isPending } = useMutation(orpc.aiConfig.globalSettings.update.mutationOptions());

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		const toastId = toast.loading(t`Saving settings...`);
		updateSettings(formData, {
			onSuccess: () => {
				toast.success(t`Settings saved successfully`, { id: toastId });
				router.invalidate();
			},
			onError: (error) => {
				toast.error(error.message || t`Failed to save settings`, { id: toastId });
			},
		});
	};

	const toggleLanguage = (language: string) => {
		setFormData((prev) => {
			const languages = prev.allowedLanguages.includes(language)
				? prev.allowedLanguages.filter((l) => l !== language)
				: [...prev.allowedLanguages, language];
			return { ...prev, allowedLanguages: languages };
		});
	};

	return (
		<div className="space-y-4">
			<DashboardHeader icon={GearSixIcon} title={t`Global AI Settings`} />

			<div className="space-y-6">
				{/* Header with back button and save */}
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-4">
						<Link
							to="/dashboard/admin"
							className="inline-flex items-center justify-center rounded-lg border p-2 transition-colors hover:bg-muted"
						>
							<ArrowLeftIcon size={20} />
						</Link>
						<div>
							<p className="text-muted-foreground text-sm">
								<Trans>Configure organization-wide AI quota controls and spending limits</Trans>
							</p>
						</div>
					</div>
					<Button onClick={handleSubmit} disabled={isPending}>
						<FloppyDiskIcon size={18} className="mr-2" />
						<Trans>Save Settings</Trans>
					</Button>
				</div>

				{/* Usage Statistics */}
				<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
					<Card>
						<CardContent className="pt-6">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-muted-foreground text-sm">
										<Trans>Daily Requests</Trans>
									</p>
									<p className="mt-1 font-semibold text-2xl">
										{formatNumber(stats.daily.requests)}{" "}
										<span className="font-normal text-muted-foreground text-sm">
											/ {formatNumber(stats.settings.maxDailyRequests)}
										</span>
									</p>
								</div>
								<LightningIcon size={24} className="text-muted-foreground" />
							</div>
							<Progress value={stats.daily.requestsPercent} className="mt-3" />
							<p className="mt-1 text-muted-foreground text-xs">
								{stats.daily.requestsPercent}% <Trans>used</Trans>
							</p>
						</CardContent>
					</Card>

					<Card>
						<CardContent className="pt-6">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-muted-foreground text-sm">
										<Trans>Monthly Requests</Trans>
									</p>
									<p className="mt-1 font-semibold text-2xl">
										{formatNumber(stats.monthly.requests)}{" "}
										<span className="font-normal text-muted-foreground text-sm">
											/ {formatNumber(stats.settings.maxMonthlyRequests)}
										</span>
									</p>
								</div>
								<SparkleIcon size={24} className="text-muted-foreground" />
							</div>
							<Progress value={stats.monthly.requestsPercent} className="mt-3" />
							<p className="mt-1 text-muted-foreground text-xs">
								{stats.monthly.requestsPercent}% <Trans>used</Trans>
							</p>
						</CardContent>
					</Card>

					<Card>
						<CardContent className="pt-6">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-muted-foreground text-sm">
										<Trans>Daily Tokens</Trans>
									</p>
									<p className="mt-1 font-semibold text-2xl">
										{formatNumber(stats.daily.tokens)}{" "}
										<span className="font-normal text-muted-foreground text-sm">
											/ {formatNumber(stats.settings.maxDailyTokens)}
										</span>
									</p>
								</div>
								<LightningIcon size={24} className="text-muted-foreground" />
							</div>
							<Progress value={stats.daily.tokensPercent} className="mt-3" />
							<p className="mt-1 text-muted-foreground text-xs">
								{stats.daily.tokensPercent}% <Trans>used</Trans>
							</p>
						</CardContent>
					</Card>

					<Card>
						<CardContent className="pt-6">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-muted-foreground text-sm">
										<Trans>Monthly Tokens</Trans>
									</p>
									<p className="mt-1 font-semibold text-2xl">
										{formatNumber(stats.monthly.tokens)}{" "}
										<span className="font-normal text-muted-foreground text-sm">
											/ {formatNumber(stats.settings.maxMonthlyTokens)}
										</span>
									</p>
								</div>
								<SparkleIcon size={24} className="text-muted-foreground" />
							</div>
							<Progress value={stats.monthly.tokensPercent} className="mt-3" />
							<p className="mt-1 text-muted-foreground text-xs">
								{stats.monthly.tokensPercent}% <Trans>used</Trans>
							</p>
						</CardContent>
					</Card>
				</div>

				{/* Main Settings Form */}
				<form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-2">
					{/* Request Limits Card */}
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<LightningIcon size={20} />
								<Trans>Request Limits</Trans>
							</CardTitle>
							<CardDescription>
								<Trans>Set maximum number of AI requests per day and month</Trans>
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-6">
							<div className="space-y-2">
								<Label htmlFor="maxDailyRequests">
									<Trans>Max Daily Requests</Trans>
								</Label>
								<Input
									id="maxDailyRequests"
									type="number"
									min={0}
									value={formData.maxDailyRequests}
									onChange={(e) =>
										setFormData((prev) => ({
											...prev,
											maxDailyRequests: Number(e.target.value),
										}))
									}
								/>
								<p className="text-muted-foreground text-xs">
									<Trans>Maximum AI requests allowed across all users per day</Trans>
								</p>
							</div>

							<div className="space-y-2">
								<Label htmlFor="maxMonthlyRequests">
									<Trans>Max Monthly Requests</Trans>
								</Label>
								<Input
									id="maxMonthlyRequests"
									type="number"
									min={0}
									value={formData.maxMonthlyRequests}
									onChange={(e) =>
										setFormData((prev) => ({
											...prev,
											maxMonthlyRequests: Number(e.target.value),
										}))
									}
								/>
								<p className="text-muted-foreground text-xs">
									<Trans>Maximum AI requests allowed across all users per month</Trans>
								</p>
							</div>
						</CardContent>
					</Card>

					{/* Token Limits Card */}
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<SparkleIcon size={20} />
								<Trans>Token Limits</Trans>
							</CardTitle>
							<CardDescription>
								<Trans>Set maximum token usage per day and month</Trans>
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-6">
							<div className="space-y-2">
								<Label htmlFor="maxDailyTokens">
									<Trans>Max Daily Tokens</Trans>
								</Label>
								<Input
									id="maxDailyTokens"
									type="number"
									min={0}
									value={formData.maxDailyTokens}
									onChange={(e) =>
										setFormData((prev) => ({
											...prev,
											maxDailyTokens: Number(e.target.value),
										}))
									}
								/>
								<p className="text-muted-foreground text-xs">
									<Trans>Maximum tokens that can be consumed per day</Trans>
								</p>
							</div>

							<div className="space-y-2">
								<Label htmlFor="maxMonthlyTokens">
									<Trans>Max Monthly Tokens</Trans>
								</Label>
								<Input
									id="maxMonthlyTokens"
									type="number"
									min={0}
									value={formData.maxMonthlyTokens}
									onChange={(e) =>
										setFormData((prev) => ({
											...prev,
											maxMonthlyTokens: Number(e.target.value),
										}))
									}
								/>
								<p className="text-muted-foreground text-xs">
									<Trans>Maximum tokens that can be consumed per month</Trans>
								</p>
							</div>
						</CardContent>
					</Card>

					{/* Alert & Control Card */}
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<ShieldCheckIcon size={20} />
								<Trans>Alerts & Controls</Trans>
							</CardTitle>
							<CardDescription>
								<Trans>Configure alert thresholds and automatic suspension</Trans>
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-6">
							<div className="space-y-4">
								<Label>
									<Trans>Alert Threshold</Trans>: {formData.alertThresholdPercent}%
								</Label>
								<Slider
									value={[formData.alertThresholdPercent]}
									onValueChange={([value]) =>
										setFormData((prev) => ({
											...prev,
											alertThresholdPercent: value,
										}))
									}
									min={10}
									max={100}
									step={5}
								/>
								<p className="text-muted-foreground text-xs">
									<Trans>Send alerts when usage reaches this percentage of the limit</Trans>
								</p>
							</div>

							<div className="flex items-center justify-between rounded-lg border p-4">
								<div className="space-y-0.5">
									<Label htmlFor="suspendOnExceed">
										<Trans>Suspend on Exceed</Trans>
									</Label>
									<p className="text-muted-foreground text-xs">
										<Trans>Automatically suspend AI access when limits are exceeded</Trans>
									</p>
								</div>
								<Switch
									id="suspendOnExceed"
									checked={formData.suspendOnExceed}
									onCheckedChange={(checked) =>
										setFormData((prev) => ({
											...prev,
											suspendOnExceed: checked,
										}))
									}
								/>
							</div>

							<div className="flex items-center justify-between rounded-lg border p-4">
								<div className="space-y-0.5">
									<Label htmlFor="isActive">
										<Trans>Global Limits Active</Trans>
									</Label>
									<p className="text-muted-foreground text-xs">
										<Trans>Enable or disable global quota enforcement</Trans>
									</p>
								</div>
								<Switch
									id="isActive"
									checked={formData.isActive}
									onCheckedChange={(checked) =>
										setFormData((prev) => ({
											...prev,
											isActive: checked,
										}))
									}
								/>
							</div>
						</CardContent>
					</Card>

					{/* Language Settings Card */}
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<GlobeIcon size={20} />
								<Trans>Language Settings</Trans>
							</CardTitle>
							<CardDescription>
								<Trans>Configure default and allowed languages for AI responses</Trans>
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-6">
							<div className="space-y-2">
								<Label htmlFor="defaultLanguage">
									<Trans>Default Language</Trans>
								</Label>
								<Select
									value={formData.defaultLanguage}
									onValueChange={(value) =>
										setFormData((prev) => ({
											...prev,
											defaultLanguage: value,
										}))
									}
								>
									<SelectTrigger>
										<SelectValue placeholder={t`Select a language`} />
									</SelectTrigger>
									<SelectContent>
										{LANGUAGE_OPTIONS.map((option) => (
											<SelectItem key={option.value} value={option.value}>
												{option.label}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
								<p className="text-muted-foreground text-xs">
									<Trans>Default language for AI-generated content</Trans>
								</p>
							</div>

							<div className="space-y-3">
								<Label>
									<Trans>Allowed Languages</Trans>
								</Label>
								<div className="grid grid-cols-2 gap-3">
									{LANGUAGE_OPTIONS.map((option) => (
										<div key={option.value} className="flex items-center space-x-2 rounded-lg border p-3">
											<Checkbox
												id={`lang-${option.value}`}
												checked={formData.allowedLanguages.includes(option.value)}
												onCheckedChange={() => toggleLanguage(option.value)}
											/>
											<Label htmlFor={`lang-${option.value}`} className="cursor-pointer font-normal">
												{option.label}
											</Label>
										</div>
									))}
								</div>
								<p className="text-muted-foreground text-xs">
									<Trans>Languages users can select for AI content generation</Trans>
								</p>
							</div>
						</CardContent>
					</Card>
				</form>

				{/* Usage Summary */}
				<Card>
					<CardHeader>
						<CardTitle>
							<Trans>Usage Summary</Trans>
						</CardTitle>
						<CardDescription>
							<Trans>Current period usage statistics</Trans>
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="grid gap-6 md:grid-cols-2">
							{/* Daily Stats */}
							<div className="space-y-4">
								<h4 className="font-medium">
									<Trans>Today</Trans>
								</h4>
								<div className="grid grid-cols-2 gap-4">
									<div className="rounded-lg border p-3">
										<p className="text-muted-foreground text-xs">
											<Trans>Success Rate</Trans>
										</p>
										<p className="mt-1 font-semibold text-lg">
											{stats.daily.requests > 0
												? Math.round((stats.daily.successCount / stats.daily.requests) * 100)
												: 100}
											%
										</p>
									</div>
									<div className="rounded-lg border p-3">
										<p className="text-muted-foreground text-xs">
											<Trans>Unique Users</Trans>
										</p>
										<p className="mt-1 font-semibold text-lg">{stats.daily.uniqueUsers}</p>
									</div>
									<div className="rounded-lg border p-3">
										<p className="text-muted-foreground text-xs">
											<Trans>Errors</Trans>
										</p>
										<p className="mt-1 font-semibold text-destructive text-lg">{stats.daily.errorCount}</p>
									</div>
									<div className="rounded-lg border p-3">
										<p className="text-muted-foreground text-xs">
											<Trans>Quota Exceeded</Trans>
										</p>
										<p className="mt-1 font-semibold text-lg text-orange-500">{stats.daily.quotaExceededCount}</p>
									</div>
								</div>
							</div>

							{/* Monthly Stats */}
							<div className="space-y-4">
								<h4 className="font-medium">
									<Trans>This Month</Trans>
								</h4>
								<div className="grid grid-cols-2 gap-4">
									<div className="rounded-lg border p-3">
										<p className="text-muted-foreground text-xs">
											<Trans>Success Rate</Trans>
										</p>
										<p className="mt-1 font-semibold text-lg">
											{stats.monthly.requests > 0
												? Math.round((stats.monthly.successCount / stats.monthly.requests) * 100)
												: 100}
											%
										</p>
									</div>
									<div className="rounded-lg border p-3">
										<p className="text-muted-foreground text-xs">
											<Trans>Unique Users</Trans>
										</p>
										<p className="mt-1 font-semibold text-lg">{stats.monthly.uniqueUsers}</p>
									</div>
									<div className="rounded-lg border p-3">
										<p className="text-muted-foreground text-xs">
											<Trans>Errors</Trans>
										</p>
										<p className="mt-1 font-semibold text-destructive text-lg">{stats.monthly.errorCount}</p>
									</div>
									<div className="rounded-lg border p-3">
										<p className="text-muted-foreground text-xs">
											<Trans>Quota Exceeded</Trans>
										</p>
										<p className="mt-1 font-semibold text-lg text-orange-500">{stats.monthly.quotaExceededCount}</p>
									</div>
								</div>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
