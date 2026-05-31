import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import {
	BrainIcon,
	ChartBarIcon,
	ChartLineIcon,
	ClockIcon,
	CurrencyDollarIcon,
	FunnelIcon,
	LightningIcon,
	SparkleIcon,
	StudentIcon,
	TrendUpIcon,
	UsersIcon,
	WarningCircleIcon,
} from "@phosphor-icons/react";
import { motion } from "motion/react";
import {
	Area,
	AreaChart,
	Bar,
	BarChart,
	CartesianGrid,
	Cell,
	Legend,
	Line,
	LineChart,
	Pie,
	PieChart,
	Tooltip as RechartsTooltip,
	ResponsiveContainer,
	XAxis,
	YAxis,
} from "recharts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AnalyticsSummarySkeleton, ChartWithAxisSkeleton, TableSkeleton } from "@/components/ui/skeletons";
import { cn } from "@/utils/style";
import { DashboardHeader } from "../../-components/header";
import { CHART_COLORS, featureLabel, formatCurrency, formatDuration, formatNumber } from "./ai-matrix-config";
import type {
	AIMatrixTabProps,
	CostAnalysisData,
	FeatureUsageData,
	ModelPerformanceData,
	PredictiveInsightsData,
	QualityScoresData,
	StudentProgressData,
} from "./ai-matrix-types";

// ---------- Loading skeleton ----------

export function AIMatrixLoadingSkeleton() {
	return (
		<div className="space-y-8">
			<DashboardHeader icon={ChartBarIcon} title={t`AI Analytics Matrix`} />
			<AnalyticsSummarySkeleton count={4} />
			<ChartWithAxisSkeleton height="h-72" />
			<div className="grid gap-6 lg:grid-cols-2">
				<Card>
					<CardHeader>
						<Skeleton className="h-5 w-32" />
					</CardHeader>
					<CardContent>
						<ChartWithAxisSkeleton height="h-64" />
					</CardContent>
				</Card>
				<Card>
					<CardHeader>
						<Skeleton className="h-5 w-32" />
					</CardHeader>
					<CardContent>
						<Skeleton className="mx-auto size-48 rounded-full" />
					</CardContent>
				</Card>
			</div>
			<TableSkeleton rows={5} columns={6} />
		</div>
	);
}

// ---------- Error state ----------

export function AIMatrixErrorState() {
	return (
		<div className="space-y-8">
			<DashboardHeader icon={ChartBarIcon} title={t`AI Analytics Matrix`} />
			<div className="flex flex-col items-center justify-center py-12">
				<WarningCircleIcon className="size-12 text-destructive" />
				<p className="mt-4 text-muted-foreground">
					<Trans>Failed to load AI analytics data</Trans>
				</p>
				<Button onClick={() => window.location.reload()} className="mt-4">
					<Trans>Retry</Trans>
				</Button>
			</div>
		</div>
	);
}

// ---------- Empty state ----------

export function AIMatrixEmptyState({ itemVariants }: { itemVariants: AIMatrixTabProps["itemVariants"] }) {
	return (
		<motion.div variants={itemVariants} className="flex items-center justify-center py-12">
			<Card className="w-full max-w-md text-center">
				<CardContent className="flex flex-col items-center gap-4 p-8">
					<div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10">
						<ChartBarIcon className="size-7 text-primary" weight="duotone" />
					</div>
					<div className="space-y-1">
						<h3 className="font-semibold text-lg">
							<Trans>No analytics data yet</Trans>
						</h3>
						<p className="text-muted-foreground text-sm">
							<Trans>
								Start using AI features to see detailed analytics about your usage, performance, and progress.
							</Trans>
						</p>
					</div>
				</CardContent>
			</Card>
		</motion.div>
	);
}

// ---------- Summary cards ----------

interface SummaryCardsProps {
	totalRequests: number;
	totalTokens: number;
	avgSuccessRate: number;
	totalCost: number;
	itemVariants: AIMatrixTabProps["itemVariants"];
}

export function SummaryCards({
	totalRequests,
	totalTokens,
	avgSuccessRate,
	totalCost,
	itemVariants,
}: SummaryCardsProps) {
	return (
		<motion.div variants={itemVariants} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
			<Card>
				<CardContent className="p-6">
					<div className="flex items-center gap-3">
						<div className="flex size-10 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-900/30">
							<LightningIcon className="size-5 text-indigo-600 dark:text-indigo-400" weight="duotone" />
						</div>
						<div>
							<p className="font-bold text-2xl tabular-nums">{formatNumber(totalRequests)}</p>
							<p className="text-muted-foreground text-sm">
								<Trans>Total Requests</Trans>
							</p>
						</div>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardContent className="p-6">
					<div className="flex items-center gap-3">
						<div className="flex size-10 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/30">
							<SparkleIcon className="size-5 text-purple-600 dark:text-purple-400" weight="duotone" />
						</div>
						<div>
							<p className="font-bold text-2xl tabular-nums">{formatNumber(totalTokens)}</p>
							<p className="text-muted-foreground text-sm">
								<Trans>Total Tokens</Trans>
							</p>
						</div>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardContent className="p-6">
					<div className="flex items-center gap-3">
						<div
							className={cn(
								"flex size-10 items-center justify-center rounded-lg",
								avgSuccessRate >= 90 ? "bg-green-100 dark:bg-green-900/30" : "bg-amber-100 dark:bg-amber-900/30",
							)}
						>
							<ChartLineIcon
								className={cn(
									"size-5",
									avgSuccessRate >= 90 ? "text-green-600 dark:text-green-400" : "text-amber-600 dark:text-amber-400",
								)}
								weight="duotone"
							/>
						</div>
						<div>
							<p className="font-bold text-2xl tabular-nums">{avgSuccessRate}%</p>
							<p className="text-muted-foreground text-sm">
								<Trans>Success Rate</Trans>
							</p>
						</div>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardContent className="p-6">
					<div className="flex items-center gap-3">
						<div className="flex size-10 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
							<CurrencyDollarIcon className="size-5 text-emerald-600 dark:text-emerald-400" weight="duotone" />
						</div>
						<div>
							<p className="font-bold text-2xl tabular-nums">{formatCurrency(totalCost)}</p>
							<p className="text-muted-foreground text-sm">
								<Trans>Est. Cost</Trans>
							</p>
						</div>
					</div>
				</CardContent>
			</Card>
		</motion.div>
	);
}

// ---------- Overview tab ----------

interface OverviewTabProps extends AIMatrixTabProps {
	costAnalysis: CostAnalysisData | undefined;
	qualityScores: QualityScoresData | undefined;
	studentProgress: StudentProgressData | undefined;
}

export function OverviewTabContent({ itemVariants, costAnalysis, qualityScores, studentProgress }: OverviewTabProps) {
	return (
		<div className="space-y-6">
			{/* Usage Over Time */}
			{costAnalysis?.byTime && costAnalysis.byTime.length > 0 && (
				<motion.div variants={itemVariants}>
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<ChartLineIcon className="size-5 text-primary" weight="duotone" />
								<Trans>Usage Over Time</Trans>
							</CardTitle>
							<CardDescription>
								<Trans>AI requests and token usage trends</Trans>
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="h-72">
								<ResponsiveContainer width="100%" height="100%">
									<AreaChart data={costAnalysis.byTime} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
										<defs>
											<linearGradient id="colorRequests" x1="0" y1="0" x2="0" y2="1">
												<stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
												<stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
											</linearGradient>
											<linearGradient id="colorTokens" x1="0" y1="0" x2="0" y2="1">
												<stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
												<stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
											</linearGradient>
										</defs>
										<CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
										<XAxis
											dataKey="period"
											tick={{ fontSize: 11 }}
											stroke="hsl(var(--muted-foreground))"
											tickFormatter={(d: string) => {
												const date = new Date(d);
												return `${date.getMonth() + 1}/${date.getDate()}`;
											}}
										/>
										<YAxis yAxisId="left" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
										<YAxis
											yAxisId="right"
											orientation="right"
											tick={{ fontSize: 11 }}
											stroke="hsl(var(--muted-foreground))"
										/>
										<RechartsTooltip
											contentStyle={{
												backgroundColor: "hsl(var(--card))",
												border: "1px solid hsl(var(--border))",
												borderRadius: "8px",
											}}
										/>
										<Legend />
										<Area
											yAxisId="left"
											type="monotone"
											dataKey="requestCount"
											name="Requests"
											stroke="#6366f1"
											fill="url(#colorRequests)"
											strokeWidth={2}
										/>
										<Area
											yAxisId="right"
											type="monotone"
											dataKey="totalTokens"
											name="Tokens"
											stroke="#8b5cf6"
											fill="url(#colorTokens)"
											strokeWidth={2}
										/>
									</AreaChart>
								</ResponsiveContainer>
							</div>
						</CardContent>
					</Card>
				</motion.div>
			)}

			{/* Quality and Progress Cards */}
			<motion.div variants={itemVariants} className="grid gap-6 lg:grid-cols-2">
				{qualityScores && <QualityMetricsCard qualityScores={qualityScores} />}
				{studentProgress && <LearningProgressCard studentProgress={studentProgress} />}
			</motion.div>
		</div>
	);
}

function QualityMetricsCard({ qualityScores }: { qualityScores: QualityScoresData }) {
	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<ChartBarIcon className="size-5 text-primary" weight="duotone" />
					<Trans>Quality Metrics</Trans>
				</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="space-y-4">
					<div className="flex items-center justify-between">
						<span className="text-muted-foreground text-sm">
							<Trans>AI Success Rate</Trans>
						</span>
						<span className="font-semibold">{qualityScores.overall.successRate}%</span>
					</div>
					<div className="h-2 rounded-full bg-muted">
						<div className="h-2 rounded-full bg-green-500" style={{ width: `${qualityScores.overall.successRate}%` }} />
					</div>

					<div className="flex items-center justify-between">
						<span className="text-muted-foreground text-sm">
							<Trans>Interview Completion</Trans>
						</span>
						<span className="font-semibold">{qualityScores.interviews.completionRate}%</span>
					</div>
					<div className="h-2 rounded-full bg-muted">
						<div
							className="h-2 rounded-full bg-indigo-500"
							style={{ width: `${qualityScores.interviews.completionRate}%` }}
						/>
					</div>

					<div className="flex items-center justify-between">
						<span className="text-muted-foreground text-sm">
							<Trans>Avg Interview Score</Trans>
						</span>
						<span className="font-semibold">{qualityScores.interviews.avgScore}/100</span>
					</div>
					<div className="h-2 rounded-full bg-muted">
						<div
							className="h-2 rounded-full bg-purple-500"
							style={{ width: `${qualityScores.interviews.avgScore}%` }}
						/>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}

function LearningProgressCard({ studentProgress }: { studentProgress: StudentProgressData }) {
	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<StudentIcon className="size-5 text-primary" weight="duotone" />
					<Trans>Learning Progress</Trans>
				</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="space-y-4">
					<div className="flex items-center justify-between">
						<span className="text-muted-foreground text-sm">
							<Trans>Learning Paths</Trans>
						</span>
						<span className="font-semibold">
							{studentProgress.learning.completedPaths}/{studentProgress.learning.totalPaths}
						</span>
					</div>

					<div className="flex items-center justify-between">
						<span className="text-muted-foreground text-sm">
							<Trans>Avg Path Progress</Trans>
						</span>
						<span className="font-semibold">{studentProgress.learning.avgProgress}%</span>
					</div>
					<div className="h-2 rounded-full bg-muted">
						<div
							className="h-2 rounded-full bg-emerald-500"
							style={{ width: `${studentProgress.learning.avgProgress}%` }}
						/>
					</div>

					<div className="flex items-center justify-between">
						<span className="text-muted-foreground text-sm">
							<Trans>Interview Sessions</Trans>
						</span>
						<span className="font-semibold">
							{studentProgress.interviews.completedSessions}/{studentProgress.interviews.totalSessions}
						</span>
					</div>

					<div className="flex items-center justify-between">
						<span className="text-muted-foreground text-sm">
							<Trans>Hours Invested</Trans>
						</span>
						<span className="font-semibold">{studentProgress.skills.totalHoursInvested}h</span>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}

// ---------- Models tab ----------

interface ModelsTabProps extends AIMatrixTabProps {
	modelPerformance: ModelPerformanceData[] | undefined;
}

export function ModelsTabContent({ itemVariants, modelPerformance }: ModelsTabProps) {
	if (!modelPerformance || modelPerformance.length === 0) return null;

	return (
		<div className="space-y-6">
			{/* Model Performance Chart */}
			<motion.div variants={itemVariants}>
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<BrainIcon className="size-5 text-primary" weight="duotone" />
							<Trans>Model Performance Comparison</Trans>
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="h-72">
							<ResponsiveContainer width="100%" height="100%">
								<BarChart
									data={modelPerformance.map((m) => ({
										name: m.model.split("-").slice(-2).join("-"),
										requests: m.totalRequests,
										successRate: m.successRate,
										avgLatency: m.latency.avg,
									}))}
									margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
								>
									<CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
									<XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
									<YAxis yAxisId="left" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
									<YAxis
										yAxisId="right"
										orientation="right"
										tick={{ fontSize: 11 }}
										stroke="hsl(var(--muted-foreground))"
										domain={[0, 100]}
									/>
									<RechartsTooltip
										contentStyle={{
											backgroundColor: "hsl(var(--card))",
											border: "1px solid hsl(var(--border))",
											borderRadius: "8px",
										}}
									/>
									<Legend />
									<Bar yAxisId="left" dataKey="requests" name="Requests" fill="#6366f1" radius={[4, 4, 0, 0]} />
									<Bar yAxisId="right" dataKey="successRate" name="Success %" fill="#10b981" radius={[4, 4, 0, 0]} />
								</BarChart>
							</ResponsiveContainer>
						</div>
					</CardContent>
				</Card>
			</motion.div>

			{/* Model Details Table */}
			<motion.div variants={itemVariants}>
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<ClockIcon className="size-5 text-primary" weight="duotone" />
							<Trans>Model Performance Details</Trans>
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="overflow-x-auto">
							<table className="w-full">
								<thead>
									<tr className="border-b text-left text-muted-foreground text-sm">
										<th className="pb-3 font-medium">
											<Trans>Provider / Model</Trans>
										</th>
										<th className="pb-3 font-medium">
											<Trans>Requests</Trans>
										</th>
										<th className="pb-3 font-medium">
											<Trans>Success Rate</Trans>
										</th>
										<th className="pb-3 font-medium">
											<Trans>Avg Latency</Trans>
										</th>
										<th className="pb-3 font-medium">
											<Trans>P95 Latency</Trans>
										</th>
										<th className="pb-3 font-medium">
											<Trans>Tokens</Trans>
										</th>
										<th className="pb-3 font-medium">
											<Trans>Est. Cost</Trans>
										</th>
									</tr>
								</thead>
								<tbody>
									{modelPerformance.map((m) => (
										<tr key={`${m.provider}-${m.model}`} className="border-b last:border-0">
											<td className="py-3">
												<div>
													<p className="font-medium capitalize">{m.provider}</p>
													<p className="text-muted-foreground text-sm">{m.model}</p>
												</div>
											</td>
											<td className="py-3 tabular-nums">{formatNumber(m.totalRequests)}</td>
											<td className="py-3">
												<Badge
													variant={m.successRate >= 90 ? "default" : m.successRate >= 70 ? "secondary" : "destructive"}
												>
													{m.successRate}%
												</Badge>
											</td>
											<td className="py-3 tabular-nums">{formatDuration(m.latency.avg)}</td>
											<td className="py-3 tabular-nums">{formatDuration(m.latency.p95)}</td>
											<td className="py-3 tabular-nums">{formatNumber(m.tokens.total)}</td>
											<td className="py-3 tabular-nums">{formatCurrency(m.estimatedCost.total)}</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</CardContent>
				</Card>
			</motion.div>
		</div>
	);
}

// ---------- Features tab ----------

interface FeaturesTabProps extends AIMatrixTabProps {
	featureUsage: { features: FeatureUsageData["features"] } | undefined;
}

export function FeaturesTabContent({ itemVariants, isAdmin, featureUsage }: FeaturesTabProps) {
	if (!featureUsage?.features || featureUsage.features.length === 0) return null;

	return (
		<div className="space-y-6">
			{/* Feature Usage Chart + Pie */}
			<motion.div variants={itemVariants} className="grid gap-6 lg:grid-cols-3">
				<Card className="lg:col-span-2">
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<SparkleIcon className="size-5 text-primary" weight="duotone" />
							<Trans>Feature Usage Distribution</Trans>
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="h-72">
							<ResponsiveContainer width="100%" height="100%">
								<BarChart
									data={featureUsage.features.slice(0, 10).map((f: FeatureUsageData["features"][number]) => ({
										name: featureLabel(f.feature),
										requests: f.totalRequests,
									}))}
									layout="vertical"
									margin={{ top: 0, right: 30, left: 0, bottom: 0 }}
								>
									<CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
									<XAxis type="number" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
									<YAxis
										type="category"
										dataKey="name"
										width={140}
										tick={{ fontSize: 11 }}
										stroke="hsl(var(--muted-foreground))"
									/>
									<RechartsTooltip
										contentStyle={{
											backgroundColor: "hsl(var(--card))",
											border: "1px solid hsl(var(--border))",
											borderRadius: "8px",
										}}
									/>
									<Bar dataKey="requests" name="Requests" radius={[0, 4, 4, 0]}>
										{featureUsage.features.slice(0, 10).map((_entry: unknown, index: number) => (
											<Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
										))}
									</Bar>
								</BarChart>
							</ResponsiveContainer>
						</div>
					</CardContent>
				</Card>

				{/* Feature Pie Chart */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<FunnelIcon className="size-5 text-primary" weight="duotone" />
							<Trans>Usage Share</Trans>
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="h-64">
							<ResponsiveContainer width="100%" height="100%">
								<PieChart>
									<Pie
										data={featureUsage.features.slice(0, 6).map((f: FeatureUsageData["features"][number]) => ({
											name: featureLabel(f.feature),
											value: f.totalRequests,
										}))}
										cx="50%"
										cy="50%"
										innerRadius={50}
										outerRadius={80}
										paddingAngle={4}
										dataKey="value"
									>
										{featureUsage.features.slice(0, 6).map((_entry: unknown, index: number) => (
											<Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
										))}
									</Pie>
									<Legend />
									<RechartsTooltip />
								</PieChart>
							</ResponsiveContainer>
						</div>
					</CardContent>
				</Card>
			</motion.div>

			{/* Feature Details Table */}
			<motion.div variants={itemVariants}>
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<ChartBarIcon className="size-5 text-primary" weight="duotone" />
							<Trans>Feature Performance</Trans>
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="overflow-x-auto">
							<table className="w-full">
								<thead>
									<tr className="border-b text-left text-muted-foreground text-sm">
										<th className="pb-3 font-medium">
											<Trans>Feature</Trans>
										</th>
										<th className="pb-3 font-medium">
											<Trans>Requests</Trans>
										</th>
										<th className="pb-3 font-medium">
											<Trans>Success Rate</Trans>
										</th>
										<th className="pb-3 font-medium">
											<Trans>Tokens</Trans>
										</th>
										<th className="pb-3 font-medium">
											<Trans>Avg Latency</Trans>
										</th>
										{isAdmin && (
											<th className="pb-3 font-medium">
												<Trans>Unique Users</Trans>
											</th>
										)}
									</tr>
								</thead>
								<tbody>
									{featureUsage.features.map((f: FeatureUsageData["features"][number]) => (
										<tr key={f.feature} className="border-b last:border-0">
											<td className="py-3 font-medium">{featureLabel(f.feature)}</td>
											<td className="py-3 tabular-nums">{formatNumber(f.totalRequests)}</td>
											<td className="py-3">
												<Badge
													variant={f.successRate >= 90 ? "default" : f.successRate >= 70 ? "secondary" : "destructive"}
												>
													{f.successRate}%
												</Badge>
											</td>
											<td className="py-3 tabular-nums">{formatNumber(f.totalTokens)}</td>
											<td className="py-3 tabular-nums">{formatDuration(f.avgLatency)}</td>
											{isAdmin && <td className="py-3 tabular-nums">{f.uniqueUsers}</td>}
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</CardContent>
				</Card>
			</motion.div>
		</div>
	);
}

// ---------- Costs tab ----------

interface CostsTabProps extends AIMatrixTabProps {
	costAnalysis: CostAnalysisData | undefined;
}

export function CostsTabContent({ itemVariants, isAdmin, costAnalysis }: CostsTabProps) {
	if (!costAnalysis) return null;

	return (
		<div className="space-y-6">
			{/* Cost Summary Cards */}
			<motion.div variants={itemVariants} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
				<Card>
					<CardContent className="p-6">
						<p className="text-muted-foreground text-sm">
							<Trans>Total Requests</Trans>
						</p>
						<p className="mt-1 font-bold text-2xl tabular-nums">{formatNumber(costAnalysis.summary.totalRequests)}</p>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="p-6">
						<p className="text-muted-foreground text-sm">
							<Trans>Input Tokens</Trans>
						</p>
						<p className="mt-1 font-bold text-2xl tabular-nums">
							{formatNumber(costAnalysis.summary.totalInputTokens)}
						</p>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="p-6">
						<p className="text-muted-foreground text-sm">
							<Trans>Output Tokens</Trans>
						</p>
						<p className="mt-1 font-bold text-2xl tabular-nums">
							{formatNumber(costAnalysis.summary.totalOutputTokens)}
						</p>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="p-6">
						<p className="text-muted-foreground text-sm">
							<Trans>Estimated Cost</Trans>
						</p>
						<p className="mt-1 font-bold text-2xl text-emerald-600 tabular-nums">
							{formatCurrency(costAnalysis.summary.totalEstimatedCost)}
						</p>
					</CardContent>
				</Card>
			</motion.div>

			{/* Cost Over Time */}
			{costAnalysis.byTime.length > 0 && (
				<motion.div variants={itemVariants}>
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<CurrencyDollarIcon className="size-5 text-primary" weight="duotone" />
								<Trans>Cost Trend</Trans>
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="h-72">
								<ResponsiveContainer width="100%" height="100%">
									<LineChart data={costAnalysis.byTime} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
										<CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
										<XAxis
											dataKey="period"
											tick={{ fontSize: 11 }}
											stroke="hsl(var(--muted-foreground))"
											tickFormatter={(d: string) => {
												const date = new Date(d);
												return `${date.getMonth() + 1}/${date.getDate()}`;
											}}
										/>
										<YAxis
											tick={{ fontSize: 11 }}
											stroke="hsl(var(--muted-foreground))"
											tickFormatter={(v) => `$${v}`}
										/>
										<RechartsTooltip
											contentStyle={{
												backgroundColor: "hsl(var(--card))",
												border: "1px solid hsl(var(--border))",
												borderRadius: "8px",
											}}
											formatter={(value: number | undefined) => [`$${(value ?? 0).toFixed(2)}`, "Cost"]}
										/>
										<Line
											type="monotone"
											dataKey="estimatedCost"
											name="Cost"
											stroke="#10b981"
											strokeWidth={2}
											dot={false}
										/>
									</LineChart>
								</ResponsiveContainer>
							</div>
						</CardContent>
					</Card>
				</motion.div>
			)}

			{/* Cost by Feature */}
			{costAnalysis.byFeature.length > 0 && (
				<motion.div variants={itemVariants}>
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<SparkleIcon className="size-5 text-primary" weight="duotone" />
								<Trans>Cost by Feature</Trans>
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="overflow-x-auto">
								<table className="w-full">
									<thead>
										<tr className="border-b text-left text-muted-foreground text-sm">
											<th className="pb-3 font-medium">
												<Trans>Feature</Trans>
											</th>
											<th className="pb-3 font-medium">
												<Trans>Model</Trans>
											</th>
											<th className="pb-3 font-medium">
												<Trans>Requests</Trans>
											</th>
											<th className="pb-3 font-medium">
												<Trans>Input Tokens</Trans>
											</th>
											<th className="pb-3 font-medium">
												<Trans>Output Tokens</Trans>
											</th>
											<th className="pb-3 font-medium">
												<Trans>Est. Cost</Trans>
											</th>
										</tr>
									</thead>
									<tbody>
										{costAnalysis.byFeature.slice(0, 10).map((f) => (
											<tr key={`${f.feature}-${f.model}`} className="border-b last:border-0">
												<td className="py-3 font-medium">{featureLabel(f.feature)}</td>
												<td className="py-3 text-muted-foreground text-sm">{f.model}</td>
												<td className="py-3 tabular-nums">{formatNumber(f.requestCount)}</td>
												<td className="py-3 tabular-nums">{formatNumber(f.inputTokens)}</td>
												<td className="py-3 tabular-nums">{formatNumber(f.outputTokens)}</td>
												<td className="py-3 font-medium text-emerald-600 tabular-nums">
													{formatCurrency(f.estimatedCost)}
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						</CardContent>
					</Card>
				</motion.div>
			)}

			{/* Cost by User (Admin only) */}
			{isAdmin && costAnalysis.byUser.length > 0 && (
				<motion.div variants={itemVariants}>
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<UsersIcon className="size-5 text-primary" weight="duotone" />
								<Trans>Top Users by Cost</Trans>
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="overflow-x-auto">
								<table className="w-full">
									<thead>
										<tr className="border-b text-left text-muted-foreground text-sm">
											<th className="pb-3 font-medium">
												<Trans>User</Trans>
											</th>
											<th className="pb-3 font-medium">
												<Trans>Requests</Trans>
											</th>
											<th className="pb-3 font-medium">
												<Trans>Tokens</Trans>
											</th>
											<th className="pb-3 font-medium">
												<Trans>Est. Cost</Trans>
											</th>
										</tr>
									</thead>
									<tbody>
										{costAnalysis.byUser.slice(0, 10).map((u) => (
											<tr key={u.userId} className="border-b last:border-0">
												<td className="py-3 font-medium">{u.userName}</td>
												<td className="py-3 tabular-nums">{formatNumber(u.requestCount)}</td>
												<td className="py-3 tabular-nums">{formatNumber(u.totalTokens)}</td>
												<td className="py-3 font-medium text-emerald-600 tabular-nums">
													{formatCurrency(u.estimatedCost)}
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						</CardContent>
					</Card>
				</motion.div>
			)}
		</div>
	);
}

// ---------- Insights tab (Admin only) ----------

interface InsightsTabProps extends AIMatrixTabProps {
	predictiveInsights: PredictiveInsightsData | undefined;
}

export function InsightsTabContent({ itemVariants, predictiveInsights }: InsightsTabProps) {
	if (!predictiveInsights) return null;

	return (
		<div className="space-y-6">
			{/* Engagement Summary */}
			<motion.div variants={itemVariants} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
				<Card>
					<CardContent className="p-6">
						<p className="text-muted-foreground text-sm">
							<Trans>Active Users (30d)</Trans>
						</p>
						<p className="mt-1 font-bold text-2xl tabular-nums">{predictiveInsights.engagement.activeUsersLast30}</p>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="p-6">
						<p className="text-muted-foreground text-sm">
							<Trans>Active Users (7d)</Trans>
						</p>
						<p className="mt-1 font-bold text-2xl tabular-nums">{predictiveInsights.engagement.activeUsersLast7}</p>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="p-6">
						<p className="text-muted-foreground text-sm">
							<Trans>Retention Rate</Trans>
						</p>
						<p className="mt-1 font-bold text-2xl tabular-nums">{predictiveInsights.engagement.retentionRate}%</p>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="p-6">
						<p className="text-muted-foreground text-sm">
							<Trans>At-Risk Students</Trans>
						</p>
						<p
							className={cn(
								"mt-1 font-bold text-2xl tabular-nums",
								predictiveInsights.engagement.atRiskCount > 0 && "text-amber-600",
							)}
						>
							{predictiveInsights.engagement.atRiskCount}
						</p>
					</CardContent>
				</Card>
			</motion.div>

			{/* Forecast */}
			<motion.div variants={itemVariants}>
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<TrendUpIcon className="size-5 text-primary" weight="duotone" />
							<Trans>Usage Forecast</Trans>
							<Badge
								variant={
									predictiveInsights.forecast.trend === "increasing"
										? "default"
										: predictiveInsights.forecast.trend === "decreasing"
											? "destructive"
											: "secondary"
								}
							>
								{predictiveInsights.forecast.trend === "increasing"
									? `+${predictiveInsights.forecast.growthRate}%`
									: predictiveInsights.forecast.trend === "decreasing"
										? `${predictiveInsights.forecast.growthRate}%`
										: "Stable"}
							</Badge>
						</CardTitle>
						<CardDescription>
							<Trans>Predicted requests for the next 7 days based on recent trends</Trans>
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="h-72">
							<ResponsiveContainer width="100%" height="100%">
								<LineChart
									data={[
										...predictiveInsights.usageTrend.slice(-14).map((t) => ({
											date: t.date,
											requests: t.requestCount,
											predicted: null,
										})),
										...predictiveInsights.forecast.predictedUsage.map((p) => ({
											date: p.date,
											requests: null,
											predicted: p.predictedRequests,
										})),
									]}
									margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
								>
									<CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
									<XAxis
										dataKey="date"
										tick={{ fontSize: 11 }}
										stroke="hsl(var(--muted-foreground))"
										tickFormatter={(d: string) => {
											const date = new Date(d);
											return `${date.getMonth() + 1}/${date.getDate()}`;
										}}
									/>
									<YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
									<RechartsTooltip
										contentStyle={{
											backgroundColor: "hsl(var(--card))",
											border: "1px solid hsl(var(--border))",
											borderRadius: "8px",
										}}
									/>
									<Legend />
									<Line
										type="monotone"
										dataKey="requests"
										name="Actual"
										stroke="#6366f1"
										strokeWidth={2}
										dot={false}
										connectNulls={false}
									/>
									<Line
										type="monotone"
										dataKey="predicted"
										name="Predicted"
										stroke="#8b5cf6"
										strokeWidth={2}
										strokeDasharray="5 5"
										dot={false}
										connectNulls={false}
									/>
								</LineChart>
							</ResponsiveContainer>
						</div>
					</CardContent>
				</Card>
			</motion.div>

			{/* At-Risk and High Engagement Users */}
			<motion.div variants={itemVariants} className="grid gap-6 lg:grid-cols-2">
				{predictiveInsights.engagement.atRiskUsers.length > 0 && (
					<AtRiskStudentsCard users={predictiveInsights.engagement.atRiskUsers} />
				)}
				{predictiveInsights.engagement.highEngagementUsers.length > 0 && (
					<TopPerformersCard users={predictiveInsights.engagement.highEngagementUsers} />
				)}
			</motion.div>
		</div>
	);
}

function AtRiskStudentsCard({ users }: { users: PredictiveInsightsData["engagement"]["atRiskUsers"] }) {
	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<WarningCircleIcon className="size-5 text-amber-500" weight="duotone" />
					<Trans>At-Risk Students</Trans>
				</CardTitle>
				<CardDescription>
					<Trans>Students who haven't used AI features in the last 7 days</Trans>
				</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="space-y-3">
					{users.map((u) => (
						<div
							key={u.userId}
							className="flex items-center justify-between rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-900/30 dark:bg-amber-900/10"
						>
							<div>
								<p className="font-medium">{u.userName}</p>
								<p className="text-muted-foreground text-sm">{u.email}</p>
							</div>
							<div className="text-right">
								<p className="text-muted-foreground text-xs">
									<Trans>Last active</Trans>
								</p>
								<p className="text-sm">
									{u.lastActivity ? new Date(u.lastActivity).toLocaleDateString("fr-FR") : "N/A"}
								</p>
							</div>
						</div>
					))}
				</div>
			</CardContent>
		</Card>
	);
}

function TopPerformersCard({ users }: { users: PredictiveInsightsData["engagement"]["highEngagementUsers"] }) {
	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<TrendUpIcon className="size-5 text-green-500" weight="duotone" />
					<Trans>Top Performers</Trans>
				</CardTitle>
				<CardDescription>
					<Trans>Most active students in the last 7 days</Trans>
				</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="space-y-3">
					{users.map((u, i) => (
						<div key={u.userId} className="flex items-center justify-between rounded-lg border p-3">
							<div className="flex items-center gap-3">
								<div
									className={cn(
										"flex size-8 items-center justify-center rounded-full font-bold text-sm",
										i === 0
											? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
											: i === 1
												? "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
												: i === 2
													? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
													: "bg-muted text-muted-foreground",
									)}
								>
									{i + 1}
								</div>
								<p className="font-medium">{u.userName}</p>
							</div>
							<div className="text-right">
								<p className="font-semibold tabular-nums">{formatNumber(u.requestCount)} req</p>
								<p className="text-muted-foreground text-xs tabular-nums">{formatNumber(u.tokenCount)} tokens</p>
							</div>
						</div>
					))}
				</div>
			</CardContent>
		</Card>
	);
}
