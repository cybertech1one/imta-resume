import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { ChartBarIcon, DownloadIcon } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";
import { useState } from "react";
import { ErrorComponent } from "@/components/error-component";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { authClient } from "@/integrations/auth/client";
import { orpc } from "@/integrations/orpc/client";
import { DashboardHeader } from "../-components/header";
import {
	AIMatrixEmptyState,
	CostsTabContent,
	FeaturesTabContent,
	InsightsTabContent,
	ModelsTabContent,
	OverviewTabContent,
	SummaryCards,
} from "./-components/ai-matrix-components";
import { containerVariants, featureLabel, getDateRange, itemVariants } from "./-components/ai-matrix-config";

// biome-ignore lint/suspicious/noExplicitAny: Route path not in generated route tree
export const Route = createFileRoute("/dashboard/analytics/ai-matrix" as any)({
	component: AIMatrixDashboard,
	errorComponent: ErrorComponent,
});

function AIMatrixDashboard() {
	const { data: session } = authClient.useSession();
	const isAdmin = session?.user?.role === "admin";

	const [dateRange, setDateRange] = useState("30d");
	const [activeTab, setActiveTab] = useState("overview");

	const dates = getDateRange(dateRange);

	// Queries - use admin endpoints if admin, otherwise student endpoints
	const { data: modelPerformance } = useQuery({
		...(isAdmin
			? orpc.aiAnalyticsAdmin.getModelPerformance.queryOptions({ input: { ...dates } })
			: orpc.aiAnalyticsStudent.getMyModelPerformance.queryOptions({ input: { ...dates } })),
		enabled: !!session?.user,
	});

	const { data: featureUsage } = useQuery({
		...(isAdmin
			? orpc.aiAnalyticsAdmin.getFeatureUsage.queryOptions({ input: { ...dates } })
			: orpc.aiAnalyticsStudent.getMyFeatureUsage.queryOptions({ input: { ...dates } })),
		enabled: !!session?.user,
	});

	const { data: costAnalysis } = useQuery({
		...(isAdmin
			? orpc.aiAnalyticsAdmin.getCostAnalysis.queryOptions({ input: { ...dates, groupBy: "day" } })
			: orpc.aiAnalyticsStudent.getMyCostAnalysis.queryOptions({ input: { ...dates, groupBy: "day" } })),
		enabled: !!session?.user,
	});

	const { data: qualityScores } = useQuery({
		...(isAdmin
			? orpc.aiAnalyticsAdmin.getQualityScores.queryOptions({ input: { ...dates } })
			: orpc.aiAnalyticsStudent.getMyQualityScores.queryOptions({ input: { ...dates } })),
		enabled: !!session?.user,
	});

	const { data: studentProgress } = useQuery({
		...(isAdmin
			? orpc.aiAnalyticsAdmin.getStudentProgress.queryOptions({ input: { ...dates } })
			: orpc.aiAnalyticsStudent.getMyProgress.queryOptions({ input: { ...dates } })),
		enabled: !!session?.user,
	});

	const { data: predictiveInsights } = useQuery({
		...orpc.aiAnalyticsAdmin.getPredictiveInsights.queryOptions({ input: { ...dates } }),
		enabled: !!session?.user && isAdmin,
	});

	const handleExportCSV = () => {
		const csvData: string[] = [];

		if (modelPerformance) {
			csvData.push("Model Performance");
			csvData.push("Provider,Model,Requests,Success Rate,Avg Latency,Total Tokens,Est. Cost");
			for (const m of modelPerformance) {
				csvData.push(
					`${m.provider},${m.model},${m.totalRequests},${m.successRate}%,${m.latency.avg}ms,${m.tokens.total},$${m.estimatedCost.total}`,
				);
			}
			csvData.push("");
		}

		if (featureUsage?.features) {
			csvData.push("Feature Usage");
			csvData.push("Feature,Requests,Success Rate,Total Tokens,Avg Latency,Unique Users");
			for (const f of featureUsage.features) {
				csvData.push(
					`${featureLabel(f.feature)},${f.totalRequests},${f.successRate}%,${f.totalTokens},${f.avgLatency}ms,${f.uniqueUsers}`,
				);
			}
			csvData.push("");
		}

		if (costAnalysis?.summary) {
			csvData.push("Cost Summary");
			csvData.push(`Total Requests,${costAnalysis.summary.totalRequests}`);
			csvData.push(`Total Tokens,${costAnalysis.summary.totalTokens}`);
			csvData.push(`Estimated Cost,$${costAnalysis.summary.totalEstimatedCost}`);
		}

		const blob = new Blob([csvData.join("\n")], { type: "text/csv" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = `ai-analytics-${dateRange}.csv`;
		a.click();
		URL.revokeObjectURL(url);
	};

	// Summary stats
	const totalRequests = modelPerformance?.reduce((sum, m) => sum + m.totalRequests, 0) ?? 0;
	const totalTokens = modelPerformance?.reduce((sum, m) => sum + m.tokens.total, 0) ?? 0;
	const avgSuccessRate =
		modelPerformance && modelPerformance.length > 0
			? Math.round(modelPerformance.reduce((sum, m) => sum + m.successRate, 0) / modelPerformance.length)
			: 0;
	const totalCost = costAnalysis?.summary?.totalEstimatedCost ?? 0;

	return (
		<motion.div className="space-y-8" initial="hidden" animate="visible" variants={containerVariants}>
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<DashboardHeader icon={ChartBarIcon} title={t`AI Analytics Matrix`} />
				<div className="flex items-center gap-3">
					<Select value={dateRange} onValueChange={setDateRange}>
						<SelectTrigger className="w-32">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="7d">
								<Trans>Last 7 days</Trans>
							</SelectItem>
							<SelectItem value="30d">
								<Trans>Last 30 days</Trans>
							</SelectItem>
							<SelectItem value="90d">
								<Trans>Last 90 days</Trans>
							</SelectItem>
							<SelectItem value="1y">
								<Trans>Last year</Trans>
							</SelectItem>
						</SelectContent>
					</Select>
					<Button variant="outline" size="sm" onClick={handleExportCSV}>
						<DownloadIcon className="mr-2 size-4" />
						<Trans>Export CSV</Trans>
					</Button>
				</div>
			</div>

			{/* Summary Cards */}
			<SummaryCards
				totalRequests={totalRequests}
				totalTokens={totalTokens}
				avgSuccessRate={avgSuccessRate}
				totalCost={totalCost}
				itemVariants={itemVariants}
			/>

			{/* Tabs for different views */}
			<Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
				<TabsList className="grid w-full grid-cols-2 sm:w-auto sm:grid-cols-5">
					<TabsTrigger value="overview">
						<Trans>Overview</Trans>
					</TabsTrigger>
					<TabsTrigger value="models">
						<Trans>Models</Trans>
					</TabsTrigger>
					<TabsTrigger value="features">
						<Trans>Features</Trans>
					</TabsTrigger>
					<TabsTrigger value="costs">
						<Trans>Costs</Trans>
					</TabsTrigger>
					{isAdmin && (
						<TabsTrigger value="insights">
							<Trans>Insights</Trans>
						</TabsTrigger>
					)}
				</TabsList>

				<TabsContent value="overview" className="space-y-6">
					<OverviewTabContent
						isAdmin={isAdmin}
						itemVariants={itemVariants}
						costAnalysis={costAnalysis}
						qualityScores={qualityScores}
						studentProgress={studentProgress}
					/>
				</TabsContent>

				<TabsContent value="models" className="space-y-6">
					<ModelsTabContent isAdmin={isAdmin} itemVariants={itemVariants} modelPerformance={modelPerformance} />
				</TabsContent>

				<TabsContent value="features" className="space-y-6">
					<FeaturesTabContent isAdmin={isAdmin} itemVariants={itemVariants} featureUsage={featureUsage} />
				</TabsContent>

				<TabsContent value="costs" className="space-y-6">
					<CostsTabContent isAdmin={isAdmin} itemVariants={itemVariants} costAnalysis={costAnalysis} />
				</TabsContent>

				{isAdmin && (
					<TabsContent value="insights" className="space-y-6">
						<InsightsTabContent isAdmin={isAdmin} itemVariants={itemVariants} predictiveInsights={predictiveInsights} />
					</TabsContent>
				)}
			</Tabs>

			{/* Empty State */}
			{totalRequests === 0 && <AIMatrixEmptyState itemVariants={itemVariants} />}
		</motion.div>
	);
}
