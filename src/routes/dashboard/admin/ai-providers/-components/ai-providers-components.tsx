import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import {
	BellRingingIcon,
	BrainIcon,
	ChartLineUpIcon,
	CheckCircleIcon,
	CurrencyDollarIcon,
	GaugeIcon,
	LightningIcon,
	TrendUpIcon,
	WarningCircleIcon,
	WarningIcon,
} from "@phosphor-icons/react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { authClient } from "@/integrations/auth/client";
import { orpc } from "@/integrations/orpc/client";
import { cn } from "@/utils/style";
import { DashboardHeader } from "../../../-components/header";
import { PROVIDER_OPTIONS } from "./ai-providers-config";
import type { ProviderFormData } from "./ai-providers-types";

export function AIProviderManagementSkeleton() {
	return (
		<div className="space-y-4">
			<DashboardHeader icon={BrainIcon} title={t`AI Provider Management`} />
			<div className="space-y-6 rounded-xl border bg-background p-6">
				<div className="flex items-center gap-4">
					<Skeleton className="size-10 rounded-lg" />
					<Skeleton className="h-4 w-48" />
				</div>
				<div className="overflow-x-auto rounded-lg border">
					<Table className="min-w-[700px]">
						<TableHeader>
							<TableRow>
								<TableHead>
									<Trans>Provider</Trans>
								</TableHead>
								<TableHead>
									<Trans>Model</Trans>
								</TableHead>
								<TableHead>
									<Trans>Status</Trans>
								</TableHead>
								<TableHead>
									<Trans>Default</Trans>
								</TableHead>
								<TableHead>
									<Trans>Priority</Trans>
								</TableHead>
								<TableHead className="text-right">
									<Trans>Actions</Trans>
								</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{Array.from({ length: 4 }).map((_, i) => (
								<TableRow key={i}>
									<TableCell>
										<div className="space-y-1">
											<Skeleton className="h-4 w-28" />
											<Skeleton className="h-3 w-20" />
										</div>
									</TableCell>
									<TableCell>
										<Skeleton className="h-4 w-24" />
									</TableCell>
									<TableCell>
										<Skeleton className="h-6 w-16" />
									</TableCell>
									<TableCell>
										<Skeleton className="h-6 w-12" />
									</TableCell>
									<TableCell>
										<Skeleton className="h-4 w-8" />
									</TableCell>
									<TableCell className="text-right">
										<div className="flex items-center justify-end gap-2">
											<Skeleton className="size-8" />
											<Skeleton className="size-8" />
											<Skeleton className="size-8" />
											<Skeleton className="size-8" />
										</div>
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

export function ProviderFormDialog({
	open,
	onOpenChange,
	initialData,
	onSubmit,
	isEdit,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	initialData: ProviderFormData;
	onSubmit: (data: ProviderFormData) => void;
	isEdit: boolean;
}) {
	const [formData, setFormData] = useState<ProviderFormData>(initialData);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		onSubmit(formData);
	};

	const updateField = <K extends keyof ProviderFormData>(key: K, value: ProviderFormData[K]) => {
		setFormData((prev) => ({ ...prev, [key]: value }));
	};

	const handleOpenChange = (nextOpen: boolean) => {
		if (nextOpen) {
			setFormData(initialData);
		}
		onOpenChange(nextOpen);
	};

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>{isEdit ? <Trans>Edit Provider</Trans> : <Trans>Add Provider</Trans>}</DialogTitle>
					<DialogDescription>
						{isEdit ? (
							<Trans>Update the AI provider configuration.</Trans>
						) : (
							<Trans>Configure a new AI provider for resume generation.</Trans>
						)}
					</DialogDescription>
				</DialogHeader>

				<form onSubmit={handleSubmit} className="space-y-4">
					<div className="grid gap-4 sm:grid-cols-2">
						<div className="space-y-2">
							<Label htmlFor="provider">
								<Trans>Provider</Trans>
							</Label>
							<Select value={formData.provider} onValueChange={(value) => updateField("provider", value)}>
								<SelectTrigger>
									<SelectValue placeholder={t`Select a provider`} />
								</SelectTrigger>
								<SelectContent>
									{PROVIDER_OPTIONS.map((option) => (
										<SelectItem key={option.value} value={option.value}>
											{option.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						<div className="space-y-2">
							<Label htmlFor="displayName">
								<Trans>Display Name</Trans>
							</Label>
							<Input
								id="displayName"
								value={formData.displayName}
								onChange={(e) => updateField("displayName", e.target.value)}
								placeholder={t`e.g., Primary OpenAI`}
								required
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="apiKey">
								<Trans>API Key</Trans>
							</Label>
							<Input
								id="apiKey"
								type="password"
								value={formData.apiKey}
								onChange={(e) => updateField("apiKey", e.target.value)}
								placeholder={t`sk-...`}
								required={!isEdit}
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="model">
								<Trans>Model</Trans>
							</Label>
							{(() => {
								const selectedProvider = PROVIDER_OPTIONS.find((p) => p.value === formData.provider);
								const modelSuggestions = selectedProvider?.models || [];
								const datalistId = `model-suggestions-${formData.provider}`;
								return (
									<>
										<Input
											id="model"
											value={formData.model}
											onChange={(e) => updateField("model", e.target.value)}
											placeholder={t`e.g., gpt-4o, claude-sonnet-4-20250514`}
											list={modelSuggestions.length > 0 ? datalistId : undefined}
											required
										/>
										{modelSuggestions.length > 0 && (
											<datalist id={datalistId}>
												{modelSuggestions.map((model) => (
													<option key={model} value={model} />
												))}
											</datalist>
										)}
									</>
								);
							})()}
						</div>

						<div className="space-y-2 sm:col-span-2">
							<Label htmlFor="baseUrl">
								<Trans>Base URL (optional)</Trans>
							</Label>
							<Input
								id="baseUrl"
								value={formData.baseUrl}
								onChange={(e) => updateField("baseUrl", e.target.value)}
								placeholder={t`e.g., https://api.openai.com/v1`}
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="maxTokensPerRequest">
								<Trans>Max Tokens Per Request</Trans>
							</Label>
							<Input
								id="maxTokensPerRequest"
								type="number"
								value={formData.maxTokensPerRequest}
								onChange={(e) => updateField("maxTokensPerRequest", Number(e.target.value))}
								min={1}
								required
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="temperature">
								<Trans>Temperature</Trans>
							</Label>
							<Input
								id="temperature"
								type="number"
								value={formData.temperature}
								onChange={(e) => updateField("temperature", Number(e.target.value))}
								min={0}
								max={2}
								step={0.1}
								required
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="priority">
								<Trans>Priority</Trans>
							</Label>
							<Input
								id="priority"
								type="number"
								value={formData.priority}
								onChange={(e) => updateField("priority", Number(e.target.value))}
								min={0}
								required
							/>
						</div>

						<div className="flex items-center gap-2 self-end pb-2">
							<Checkbox
								id="isDefault"
								checked={formData.isDefault}
								onCheckedChange={(checked) => updateField("isDefault", checked === true)}
							/>
							<Label htmlFor="isDefault">
								<Trans>Set as Default</Trans>
							</Label>
						</div>
					</div>

					<DialogFooter>
						<DialogClose asChild>
							<Button type="button" variant="outline">
								<Trans>Cancel</Trans>
							</Button>
						</DialogClose>
						<Button type="submit">{isEdit ? <Trans>Update Provider</Trans> : <Trans>Add Provider</Trans>}</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}

export function PerformanceMetricsTab() {
	const { data: session } = authClient.useSession();
	const [selectedFeature, setSelectedFeature] = useState<string>("");

	const { data: modelComparison, isLoading: modelsLoading } = useQuery({
		...orpc.aiMetrics.analytics.modelComparison.queryOptions({ input: { days: 30 } }),
		enabled: !!session?.user,
	});

	const { data: featurePerformance, isLoading: featuresLoading } = useQuery({
		...orpc.aiMetrics.analytics.featurePerformance.queryOptions({ input: { days: 30 } }),
		enabled: !!session?.user,
	});

	const { data: costEfficiency, isLoading: costLoading } = useQuery({
		...orpc.aiMetrics.analytics.costEfficiency.queryOptions({ input: { days: 30 } }),
		enabled: !!session?.user,
	});

	const { data: errorRates, isLoading: errorsLoading } = useQuery({
		...orpc.aiMetrics.analytics.errorRates.queryOptions({ input: { days: 30 } }),
		enabled: !!session?.user,
	});

	const { data: alerts, isLoading: alertsLoading } = useQuery({
		...orpc.aiMetrics.alerts.list.queryOptions(),
		enabled: !!session?.user,
	});

	const { data: optimalModel, isLoading: optimalLoading } = useQuery({
		...orpc.aiMetrics.analytics.optimalModel.queryOptions({
			input: { feature: selectedFeature || "improve_content" },
		}),
		enabled: !!session?.user,
	});

	const { mutate: acknowledgeAlert } = useMutation(orpc.aiMetrics.alerts.acknowledge.mutationOptions());
	const { mutate: resolveAlert } = useMutation(orpc.aiMetrics.alerts.resolve.mutationOptions());
	const { mutate: checkDegradation } = useMutation(orpc.aiMetrics.alerts.checkDegradation.mutationOptions());

	const isLoading = modelsLoading || featuresLoading || costLoading || errorsLoading || alertsLoading;

	if (isLoading) {
		return (
			<div className="space-y-6">
				<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
					{Array.from({ length: 4 }).map((_, i) => (
						<Skeleton key={i} className="h-32" />
					))}
				</div>
				<Skeleton className="h-96" />
			</div>
		);
	}

	// Calculate summary stats
	const totalRequests = modelComparison?.reduce((sum, m) => sum + m.totalRequests, 0) || 0;
	const avgSuccessRate =
		modelComparison && modelComparison.length > 0
			? modelComparison.reduce((sum, m) => sum + m.successRate, 0) / modelComparison.length
			: 0;
	const totalCost = modelComparison?.reduce((sum, m) => sum + (m.estimatedCost || 0), 0) || 0;
	const activeAlertCount = alerts?.length || 0;

	return (
		<div className="space-y-6">
			{/* Summary Cards */}
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="font-medium text-sm">
							<Trans>Total Requests</Trans>
						</CardTitle>
						<ChartLineUpIcon className="size-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="font-bold text-2xl">{totalRequests.toLocaleString()}</div>
						<p className="text-muted-foreground text-xs">
							<Trans>Last 30 days</Trans>
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="font-medium text-sm">
							<Trans>Success Rate</Trans>
						</CardTitle>
						<CheckCircleIcon className="size-4 text-green-500" />
					</CardHeader>
					<CardContent>
						<div className="font-bold text-2xl">{avgSuccessRate.toFixed(1)}%</div>
						<Progress value={avgSuccessRate} className="mt-2" />
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="font-medium text-sm">
							<Trans>Estimated Cost</Trans>
						</CardTitle>
						<CurrencyDollarIcon className="size-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="font-bold text-2xl">${(totalCost / 100).toFixed(2)}</div>
						<p className="text-muted-foreground text-xs">
							<Trans>Last 30 days</Trans>
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="font-medium text-sm">
							<Trans>Active Alerts</Trans>
						</CardTitle>
						<BellRingingIcon
							className={cn("size-4", activeAlertCount > 0 ? "text-orange-500" : "text-muted-foreground")}
						/>
					</CardHeader>
					<CardContent>
						<div className={cn("font-bold text-2xl", activeAlertCount > 0 && "text-orange-500")}>
							{activeAlertCount}
						</div>
						<Button
							variant="link"
							size="sm"
							className="h-auto p-0 text-xs"
							onClick={() =>
								checkDegradation(undefined, {
									onSuccess: () => toast.success(t`Degradation check completed`),
								})
							}
						>
							<Trans>Run Check</Trans>
						</Button>
					</CardContent>
				</Card>
			</div>

			{/* Active Alerts */}
			{alerts && alerts.length > 0 && (
				<Card className="border-orange-200 bg-orange-50 dark:border-orange-900 dark:bg-orange-950">
					<CardHeader>
						<CardTitle className="flex items-center gap-2 text-orange-700 dark:text-orange-300">
							<WarningIcon className="size-5" />
							<Trans>Active Performance Alerts</Trans>
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="space-y-3">
							{alerts.map((alert) => (
								<div
									key={alert.id}
									className="flex items-start justify-between gap-4 rounded-lg border bg-background p-4"
								>
									<div className="flex-1">
										<div className="flex items-center gap-2">
											<Badge
												variant={
													alert.severity === "critical"
														? "destructive"
														: alert.severity === "high"
															? "destructive"
															: "secondary"
												}
											>
												{alert.severity}
											</Badge>
											<span className="font-medium">{alert.title}</span>
										</div>
										<p className="mt-1 text-muted-foreground text-sm">{alert.description}</p>
										<p className="mt-1 text-muted-foreground text-xs">
											{alert.metric}: {alert.currentValue.toFixed(1)} (threshold: {alert.threshold})
										</p>
									</div>
									<div className="flex gap-2">
										<Button
											variant="outline"
											size="sm"
											onClick={() =>
												acknowledgeAlert({ id: alert.id }, { onSuccess: () => toast.success(t`Alert acknowledged`) })
											}
										>
											<Trans>Acknowledge</Trans>
										</Button>
										<Button
											variant="outline"
											size="sm"
											onClick={() =>
												resolveAlert(
													{ id: alert.id, resolution: "Manual resolution" },
													{ onSuccess: () => toast.success(t`Alert resolved`) },
												)
											}
										>
											<Trans>Resolve</Trans>
										</Button>
									</div>
								</div>
							))}
						</div>
					</CardContent>
				</Card>
			)}

			{/* Model Comparison Table */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<GaugeIcon className="size-5" />
						<Trans>Model Performance Comparison</Trans>
					</CardTitle>
					<CardDescription>
						<Trans>Compare performance metrics across all configured AI models</Trans>
					</CardDescription>
				</CardHeader>
				<CardContent>
					{modelComparison && modelComparison.length > 0 ? (
						<div className="overflow-x-auto">
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>
											<Trans>Model</Trans>
										</TableHead>
										<TableHead className="text-right">
											<Trans>Requests</Trans>
										</TableHead>
										<TableHead className="text-right">
											<Trans>Success Rate</Trans>
										</TableHead>
										<TableHead className="text-right">
											<Trans>Avg Latency</Trans>
										</TableHead>
										<TableHead className="text-right">
											<Trans>Acceptance</Trans>
										</TableHead>
										<TableHead className="text-right">
											<Trans>Cost</Trans>
										</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{modelComparison.map((model) => (
										<TableRow key={`${model.provider}-${model.model}`}>
											<TableCell>
												<div>
													<p className="font-medium">{model.model}</p>
													<p className="text-muted-foreground text-xs">{model.provider}</p>
												</div>
											</TableCell>
											<TableCell className="text-right">{model.totalRequests.toLocaleString()}</TableCell>
											<TableCell className="text-right">
												<span
													className={cn(
														model.successRate >= 95
															? "text-green-600"
															: model.successRate >= 90
																? "text-yellow-600"
																: "text-red-600",
													)}
												>
													{model.successRate.toFixed(1)}%
												</span>
											</TableCell>
											<TableCell className="text-right">{model.avgLatency ? `${model.avgLatency}ms` : "-"}</TableCell>
											<TableCell className="text-right">
												{model.acceptanceRate !== null ? `${model.acceptanceRate.toFixed(1)}%` : "-"}
											</TableCell>
											<TableCell className="text-right">${(model.estimatedCost / 100).toFixed(2)}</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</div>
					) : (
						<div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
							<ChartLineUpIcon className="mb-4 size-12" />
							<p>
								<Trans>No model performance data available yet</Trans>
							</p>
							<p className="text-sm">
								<Trans>Start using AI features to see metrics</Trans>
							</p>
						</div>
					)}
				</CardContent>
			</Card>

			{/* Feature Performance */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<LightningIcon className="size-5" />
						<Trans>Feature Performance</Trans>
					</CardTitle>
					<CardDescription>
						<Trans>Performance metrics for each AI feature</Trans>
					</CardDescription>
				</CardHeader>
				<CardContent>
					{featurePerformance && featurePerformance.length > 0 ? (
						<div className="overflow-x-auto">
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>
											<Trans>Feature</Trans>
										</TableHead>
										<TableHead className="text-right">
											<Trans>Requests</Trans>
										</TableHead>
										<TableHead className="text-right">
											<Trans>Success</Trans>
										</TableHead>
										<TableHead className="text-right">
											<Trans>Avg Latency</Trans>
										</TableHead>
										<TableHead className="text-right">
											<Trans>Acceptance</Trans>
										</TableHead>
										<TableHead>
											<Trans>Best Model</Trans>
										</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{featurePerformance.map((feature) => (
										<TableRow key={feature.feature}>
											<TableCell className="font-medium">{feature.feature.replace(/_/g, " ")}</TableCell>
											<TableCell className="text-right">{feature.totalRequests.toLocaleString()}</TableCell>
											<TableCell className="text-right">
												<span
													className={cn(
														feature.successRate >= 95
															? "text-green-600"
															: feature.successRate >= 90
																? "text-yellow-600"
																: "text-red-600",
													)}
												>
													{feature.successRate.toFixed(1)}%
												</span>
											</TableCell>
											<TableCell className="text-right">{feature.avgDuration}ms</TableCell>
											<TableCell className="text-right">
												{feature.acceptanceRate !== null ? `${feature.acceptanceRate.toFixed(1)}%` : "-"}
											</TableCell>
											<TableCell>
												{feature.bestModel ? <Badge variant="outline">{feature.bestModel}</Badge> : "-"}
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</div>
					) : (
						<div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
							<LightningIcon className="mb-4 size-12" />
							<p>
								<Trans>No feature performance data available yet</Trans>
							</p>
						</div>
					)}
				</CardContent>
			</Card>

			{/* Model Recommendation Engine */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<TrendUpIcon className="size-5" />
						<Trans>Model Recommendation Engine</Trans>
					</CardTitle>
					<CardDescription>
						<Trans>Get the optimal model recommendation for each feature</Trans>
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="space-y-4">
						<div className="flex items-center gap-4">
							<Label htmlFor="feature-select">
								<Trans>Select Feature:</Trans>
							</Label>
							<Select value={selectedFeature || "improve_content"} onValueChange={setSelectedFeature}>
								<SelectTrigger className="w-64">
									<SelectValue placeholder={t`Select a feature`} />
								</SelectTrigger>
								<SelectContent>
									{featurePerformance?.map((f) => (
										<SelectItem key={f.feature} value={f.feature}>
											{f.feature.replace(/_/g, " ")}
										</SelectItem>
									)) || (
										<>
											<SelectItem value="improve_content">Improve Content</SelectItem>
											<SelectItem value="fix_grammar">Fix Grammar</SelectItem>
											<SelectItem value="generate_summary">Generate Summary</SelectItem>
											<SelectItem value="suggest_skills">Suggest Skills</SelectItem>
										</>
									)}
								</SelectContent>
							</Select>
						</div>

						{optimalLoading ? (
							<Skeleton className="h-48" />
						) : optimalModel?.recommendations && optimalModel.recommendations.length > 0 ? (
							<div className="space-y-3">
								{optimalModel.recommendations.slice(0, 5).map((rec, index) => (
									<div
										key={`${rec.provider}-${rec.model}`}
										className={cn(
											"flex items-center justify-between rounded-lg border p-4",
											index === 0 && "border-green-500 bg-green-50 dark:bg-green-950",
										)}
									>
										<div className="flex items-center gap-4">
											{index === 0 && (
												<Badge variant="default" className="bg-green-600">
													<Trans>Recommended</Trans>
												</Badge>
											)}
											<div>
												<p className="font-medium">{rec.model}</p>
												<p className="text-muted-foreground text-xs">{rec.provider}</p>
											</div>
										</div>
										<div className="flex items-center gap-6 text-sm">
											<div className="text-center">
												<p className="font-medium">{rec.overallScore}</p>
												<p className="text-muted-foreground text-xs">
													<Trans>Score</Trans>
												</p>
											</div>
											<div className="text-center">
												<p className="font-medium">{rec.successRate}%</p>
												<p className="text-muted-foreground text-xs">
													<Trans>Success</Trans>
												</p>
											</div>
											<div className="text-center">
												<p className="font-medium">{rec.avgDuration}ms</p>
												<p className="text-muted-foreground text-xs">
													<Trans>Latency</Trans>
												</p>
											</div>
											<div className="text-center">
												<p className="font-medium">${rec.costPerRequest.toFixed(4)}</p>
												<p className="text-muted-foreground text-xs">
													<Trans>Cost/Req</Trans>
												</p>
											</div>
										</div>
									</div>
								))}
							</div>
						) : (
							<div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
								<TrendUpIcon className="mb-4 size-12" />
								<p>
									<Trans>No recommendation data available</Trans>
								</p>
								<p className="text-sm">
									<Trans>Use AI features to generate recommendations</Trans>
								</p>
							</div>
						)}
					</div>
				</CardContent>
			</Card>

			{/* Error Analysis */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<WarningCircleIcon className="size-5" />
						<Trans>Error Analysis</Trans>
					</CardTitle>
					<CardDescription>
						<Trans>Error rates and recent errors by model and category</Trans>
					</CardDescription>
				</CardHeader>
				<CardContent>
					{errorRates && (errorRates.byModel?.length > 0 || errorRates.recentErrors?.length > 0) ? (
						<div className="space-y-6">
							{/* Error rates by model */}
							{errorRates.byModel && errorRates.byModel.length > 0 && (
								<div>
									<h4 className="mb-3 font-medium">
										<Trans>Error Rates by Model</Trans>
									</h4>
									<div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
										{errorRates.byModel.map((m) => (
											<div key={`${m.provider}-${m.model}`} className="rounded-lg border p-3">
												<div className="flex items-center justify-between">
													<div>
														<p className="font-medium text-sm">{m.model}</p>
														<p className="text-muted-foreground text-xs">{m.provider}</p>
													</div>
													<span
														className={cn(
															"font-medium",
															m.errorRate < 5
																? "text-green-600"
																: m.errorRate < 10
																	? "text-yellow-600"
																	: "text-red-600",
														)}
													>
														{m.errorRate.toFixed(1)}%
													</span>
												</div>
												<Progress value={100 - m.errorRate} className="mt-2" />
												<p className="mt-1 text-muted-foreground text-xs">
													{m.totalErrors} errors / {m.totalRequests} requests
												</p>
											</div>
										))}
									</div>
								</div>
							)}

							{/* Recent errors */}
							{errorRates.recentErrors && errorRates.recentErrors.length > 0 && (
								<div>
									<h4 className="mb-3 font-medium">
										<Trans>Recent Errors</Trans>
									</h4>
									<div className="space-y-2">
										{errorRates.recentErrors.slice(0, 5).map((error) => (
											<div key={error.id} className="flex items-start gap-3 rounded-lg border p-3">
												<Badge
													variant={
														error.severity === "critical" || error.severity === "high" ? "destructive" : "secondary"
													}
													className="mt-0.5"
												>
													{error.errorCategory}
												</Badge>
												<div className="flex-1">
													<div className="flex items-center gap-2">
														<span className="font-medium text-sm">{error.feature}</span>
														<span className="text-muted-foreground text-xs">
															{error.provider}/{error.model}
														</span>
													</div>
													<p className="mt-1 line-clamp-2 text-muted-foreground text-sm">{error.errorMessage}</p>
												</div>
												<Badge variant={error.isResolved ? "default" : "outline"}>
													{error.isResolved ? <Trans>Resolved</Trans> : <Trans>Open</Trans>}
												</Badge>
											</div>
										))}
									</div>
								</div>
							)}
						</div>
					) : (
						<div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
							<CheckCircleIcon className="mb-4 size-12 text-green-500" />
							<p>
								<Trans>No errors recorded in the last 30 days</Trans>
							</p>
						</div>
					)}
				</CardContent>
			</Card>

			{/* Cost Efficiency */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<CurrencyDollarIcon className="size-5" />
						<Trans>Cost Efficiency Analysis</Trans>
					</CardTitle>
					<CardDescription>
						<Trans>Token usage and cost per request by model and feature</Trans>
					</CardDescription>
				</CardHeader>
				<CardContent>
					{costEfficiency && costEfficiency.length > 0 ? (
						<div className="overflow-x-auto">
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>
											<Trans>Model</Trans>
										</TableHead>
										<TableHead>
											<Trans>Feature</Trans>
										</TableHead>
										<TableHead className="text-right">
											<Trans>Requests</Trans>
										</TableHead>
										<TableHead className="text-right">
											<Trans>Tokens</Trans>
										</TableHead>
										<TableHead className="text-right">
											<Trans>Cost/Req</Trans>
										</TableHead>
										<TableHead className="text-right">
											<Trans>Cost/Accepted</Trans>
										</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{costEfficiency.slice(0, 20).map((row, i) => (
										<TableRow key={i}>
											<TableCell>
												<div>
													<p className="font-medium text-sm">{row.model}</p>
													<p className="text-muted-foreground text-xs">{row.provider}</p>
												</div>
											</TableCell>
											<TableCell>{row.feature.replace(/_/g, " ")}</TableCell>
											<TableCell className="text-right">{row.totalRequests}</TableCell>
											<TableCell className="text-right">
												{(row.totalInputTokens + row.totalOutputTokens).toLocaleString()}
											</TableCell>
											<TableCell className="text-right">${row.costPerRequest.toFixed(4)}</TableCell>
											<TableCell className="text-right">
												{row.costPerAccepted !== null ? `$${row.costPerAccepted.toFixed(4)}` : "-"}
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</div>
					) : (
						<div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
							<CurrencyDollarIcon className="mb-4 size-12" />
							<p>
								<Trans>No cost data available yet</Trans>
							</p>
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
