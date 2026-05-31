import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import {
	BrainIcon,
	ChartBarIcon,
	ClockIcon,
	LightningIcon,
	SparkleIcon,
	WarningCircleIcon,
} from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";
import {
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
import { ErrorComponent } from "@/components/error-component";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { authClient } from "@/integrations/auth/client";
import { orpc } from "@/integrations/orpc/client";
import { cn } from "@/utils/style";
import { DashboardHeader } from "../-components/header";

// biome-ignore lint/suspicious/noExplicitAny: Route path not in generated route tree
export const Route = createFileRoute("/dashboard/analytics/ai-usage" as any)({
	component: AIUsageAnalytics,
	errorComponent: ErrorComponent,
});

const CHART_COLORS = ["#6366f1", "#8b5cf6", "#10b981", "#f59e0b", "#ef4444", "#3b82f6", "#ec4899", "#14b8a6"];

const FEATURE_LABELS: Record<string, string> = {
	test_connection: "Test Connection",
	parse_pdf: "PDF Parsing",
	parse_docx: "DOCX Parsing",
	improve_content: "Content Improvement",
	generate_summary: "Summary Generation",
	suggest_skills: "Skill Suggestions",
	generate_headline: "Headline Generation",
	fix_grammar: "Grammar Fix",
	analyze_resume: "Resume Analysis",
	interview_generate_questions: "Interview Questions",
	interview_evaluate_response: "Response Evaluation",
	interview_analyze_session: "Session Analysis",
	interview_chat: "Interview Chat",
	interview_chatbot_summary: "Chatbot Summary",
};

function formatNumber(num: number): string {
	if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
	if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
	return num.toLocaleString("fr-FR");
}

function formatDuration(ms: number): string {
	if (ms >= 60_000) return `${(ms / 60_000).toFixed(1)}m`;
	if (ms >= 1_000) return `${(ms / 1_000).toFixed(1)}s`;
	return `${ms}ms`;
}

function featureLabel(feature: string): string {
	return FEATURE_LABELS[feature] ?? feature.replaceAll("_", " ");
}

function AIUsageAnalytics() {
	const { data: session } = authClient.useSession();
	const { data: stats } = useQuery({
		...orpc.aiConfig.usage.getDetailedStats.queryOptions(),
		enabled: !!session?.user,
	});

	const byFeature = stats?.byFeature ?? [];
	const byStatus = stats?.byStatus ?? [];
	const byDay = stats?.byDay ?? [];
	const byProvider = stats?.byProvider ?? [];
	const recentErrors = stats?.recentErrors ?? [];

	const totalRequests = byStatus.reduce((sum, s) => sum + s.count, 0);
	const totalTokens = byFeature.reduce((sum, f) => sum + f.tokens, 0);
	const successCount = byStatus.find((s) => s.status === "success")?.count ?? 0;
	const errorCount = byStatus.find((s) => s.status === "error")?.count ?? 0;
	const successRate = totalRequests > 0 ? Math.round((successCount / totalRequests) * 100) : 0;

	const containerVariants = {
		hidden: { opacity: 0 },
		visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
	};
	const itemVariants = {
		hidden: { opacity: 0, y: 20 },
		visible: { opacity: 1, y: 0 },
	};

	return (
		<motion.div className="space-y-8" initial="hidden" animate="visible" variants={containerVariants}>
			<DashboardHeader icon={BrainIcon} title={t`AI Usage Analytics`} />

			{/* Summary Cards */}
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
									<Trans>Total Requests (30d)</Trans>
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
									<Trans>Total Tokens (30d)</Trans>
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
									successRate >= 90 ? "bg-green-100 dark:bg-green-900/30" : "bg-amber-100 dark:bg-amber-900/30",
								)}
							>
								<ChartBarIcon
									className={cn(
										"size-5",
										successRate >= 90 ? "text-green-600 dark:text-green-400" : "text-amber-600 dark:text-amber-400",
									)}
									weight="duotone"
								/>
							</div>
							<div>
								<p className="font-bold text-2xl tabular-nums">{successRate}%</p>
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
							<div className="flex size-10 items-center justify-center rounded-lg bg-red-100 dark:bg-red-900/30">
								<WarningCircleIcon className="size-5 text-red-600 dark:text-red-400" weight="duotone" />
							</div>
							<div>
								<p className="font-bold text-2xl tabular-nums">{errorCount}</p>
								<p className="text-muted-foreground text-sm">
									<Trans>Errors (30d)</Trans>
								</p>
							</div>
						</div>
					</CardContent>
				</Card>
			</motion.div>

			{/* Usage Over Time */}
			{byDay.length > 0 && (
				<motion.div variants={itemVariants}>
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<ChartBarIcon className="size-5 text-primary" weight="duotone" />
								<Trans>Usage Over Time</Trans>
							</CardTitle>
							<CardDescription>
								<Trans>AI requests and token usage over the last 30 days</Trans>
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="h-72">
								<ResponsiveContainer width="100%" height="100%">
									<LineChart data={byDay} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
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
										<Line
											yAxisId="left"
											type="monotone"
											dataKey="count"
											name="Requests"
											stroke="#6366f1"
											strokeWidth={2}
											dot={false}
										/>
										<Line
											yAxisId="right"
											type="monotone"
											dataKey="tokens"
											name="Tokens"
											stroke="#8b5cf6"
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

			{/* Feature Breakdown + Status Pie */}
			<motion.div variants={itemVariants} className="grid gap-6 lg:grid-cols-3">
				{/* Feature Usage Bar Chart */}
				{byFeature.length > 0 && (
					<Card className="lg:col-span-2">
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<SparkleIcon className="size-5 text-primary" weight="duotone" />
								<Trans>Usage by Feature</Trans>
							</CardTitle>
							<CardDescription>
								<Trans>Request count per AI feature</Trans>
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="h-72">
								<ResponsiveContainer width="100%" height="100%">
									<BarChart
										data={byFeature.map((f) => ({ ...f, label: featureLabel(f.feature) }))}
										layout="vertical"
										margin={{ top: 0, right: 30, left: 0, bottom: 0 }}
									>
										<CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
										<XAxis type="number" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
										<YAxis
											type="category"
											dataKey="label"
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
										<Bar dataKey="count" name="Requests" radius={[0, 4, 4, 0]}>
											{byFeature.map((_entry, index) => (
												<Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
											))}
										</Bar>
									</BarChart>
								</ResponsiveContainer>
							</div>
						</CardContent>
					</Card>
				)}

				{/* Status Breakdown Pie */}
				{byStatus.length > 0 && (
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<ChartBarIcon className="size-5 text-primary" weight="duotone" />
								<Trans>Status Breakdown</Trans>
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="h-56">
								<ResponsiveContainer width="100%" height="100%">
									<PieChart>
										<Pie
											data={byStatus.map((s) => ({
												name: s.status === "success" ? "Success" : s.status === "error" ? "Error" : "Quota Exceeded",
												value: s.count,
											}))}
											cx="50%"
											cy="50%"
											innerRadius={50}
											outerRadius={80}
											paddingAngle={4}
											dataKey="value"
										>
											{byStatus.map((s) => (
												<Cell
													key={s.status}
													fill={s.status === "success" ? "#10b981" : s.status === "error" ? "#ef4444" : "#f59e0b"}
												/>
											))}
										</Pie>
										<Legend />
										<RechartsTooltip />
									</PieChart>
								</ResponsiveContainer>
							</div>
						</CardContent>
					</Card>
				)}
			</motion.div>

			{/* Feature Details Table */}
			{byFeature.length > 0 && (
				<motion.div variants={itemVariants}>
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<ClockIcon className="size-5 text-primary" weight="duotone" />
								<Trans>Feature Performance</Trans>
							</CardTitle>
							<CardDescription>
								<Trans>Detailed metrics per AI feature</Trans>
							</CardDescription>
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
												<Trans>Tokens Used</Trans>
											</th>
											<th className="pb-3 font-medium">
												<Trans>Avg Duration</Trans>
											</th>
										</tr>
									</thead>
									<tbody>
										{byFeature.map((f) => (
											<tr key={f.feature} className="border-b last:border-0">
												<td className="py-3 font-medium">{featureLabel(f.feature)}</td>
												<td className="py-3 tabular-nums">{formatNumber(f.count)}</td>
												<td className="py-3 tabular-nums">{formatNumber(f.tokens)}</td>
												<td className="py-3 tabular-nums">{formatDuration(f.avgDurationMs)}</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						</CardContent>
					</Card>
				</motion.div>
			)}

			{/* Provider Info */}
			{byProvider.length > 0 && (
				<motion.div variants={itemVariants}>
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<BrainIcon className="size-5 text-primary" weight="duotone" />
								<Trans>Provider Usage</Trans>
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="flex flex-wrap gap-3">
								{byProvider.map((p) => (
									<div key={`${p.provider}-${p.model}`} className="rounded-lg border p-4">
										<p className="font-medium capitalize">{p.provider}</p>
										<p className="text-muted-foreground text-sm">{p.model}</p>
										<div className="mt-2 flex gap-3">
											<Badge variant="secondary">{formatNumber(p.count)} requests</Badge>
											<Badge variant="outline">{formatNumber(p.tokens)} tokens</Badge>
										</div>
									</div>
								))}
							</div>
						</CardContent>
					</Card>
				</motion.div>
			)}

			{/* Recent Errors */}
			{recentErrors.length > 0 && (
				<motion.div variants={itemVariants}>
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<WarningCircleIcon className="size-5 text-red-500" weight="duotone" />
								<Trans>Recent Errors</Trans>
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="space-y-3">
								{recentErrors.map((err, i) => (
									<div
										key={`error-${i}`}
										className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-900/30 dark:bg-red-900/10"
									>
										<WarningCircleIcon className="mt-0.5 size-4 shrink-0 text-red-500" />
										<div className="min-w-0 flex-1">
											<div className="flex items-center gap-2">
												<Badge variant="destructive" className="text-xs">
													{featureLabel(err.feature)}
												</Badge>
												<span className="text-muted-foreground text-xs">
													{err.createdAt ? new Date(err.createdAt).toLocaleString("fr-FR") : ""}
												</span>
											</div>
											<p className="mt-1 truncate text-sm">{err.errorMessage ?? "Unknown error"}</p>
										</div>
									</div>
								))}
							</div>
						</CardContent>
					</Card>
				</motion.div>
			)}

			{/* Empty State */}
			{totalRequests === 0 && (
				<motion.div variants={itemVariants} className="flex items-center justify-center py-12">
					<Card className="w-full max-w-md text-center">
						<CardContent className="flex flex-col items-center gap-4 p-8">
							<div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10">
								<BrainIcon className="size-7 text-primary" weight="duotone" />
							</div>
							<div className="space-y-1">
								<h3 className="font-semibold text-lg">
									<Trans>No AI usage yet</Trans>
								</h3>
								<p className="text-muted-foreground text-sm">
									<Trans>
										Start using AI features like resume improvement, summary generation, or interview practice to see
										analytics here.
									</Trans>
								</p>
							</div>
						</CardContent>
					</Card>
				</motion.div>
			)}
		</motion.div>
	);
}
