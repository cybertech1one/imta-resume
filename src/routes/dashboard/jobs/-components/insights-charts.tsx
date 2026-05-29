import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { ChartLineUpIcon, CurrencyCircleDollarIcon, SparkleIcon } from "@phosphor-icons/react";
import {
	Bar,
	BarChart,
	CartesianGrid,
	Cell,
	Legend,
	Line,
	LineChart,
	Tooltip as RechartsTooltip,
	ResponsiveContainer,
	XAxis,
	YAxis,
} from "recharts";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

import { CHART_COLORS, SECTORS } from "./insights-config";
import type { SalaryChartItem, SkillsDemandItem, TrendLineItem } from "./insights-types";
import { formatCurrency } from "./insights-utils";

export function MarketTrendsChart({
	isLoading,
	trendLineData,
}: {
	isLoading: boolean;
	trendLineData: TrendLineItem[];
}) {
	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<ChartLineUpIcon className="size-5" />
					<Trans>Market Trends</Trans>
				</CardTitle>
				<CardDescription>
					<Trans>Job market evolution over time</Trans>
				</CardDescription>
			</CardHeader>
			<CardContent>
				{isLoading ? (
					<Skeleton className="h-72" />
				) : (
					<div className="h-72">
						<ResponsiveContainer width="100%" height="100%">
							<LineChart data={trendLineData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
								<CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
								<XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
								<YAxis yAxisId="left" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
								<YAxis
									yAxisId="right"
									orientation="right"
									tick={{ fontSize: 11 }}
									stroke="hsl(var(--muted-foreground))"
									tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`}
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
									dataKey="jobs"
									name={t`Job Openings`}
									stroke="#6366f1"
									strokeWidth={2}
									dot={false}
								/>
								<Line
									yAxisId="right"
									type="monotone"
									dataKey="salaries"
									name={t`Avg Salary (MAD)`}
									stroke="#10b981"
									strokeWidth={2}
									dot={false}
								/>
							</LineChart>
						</ResponsiveContainer>
					</div>
				)}
			</CardContent>
		</Card>
	);
}

export function SalaryRangesChart({
	loadingSalary,
	salaryChartData,
	selectedSector,
}: {
	loadingSalary: boolean;
	salaryChartData: SalaryChartItem[];
	selectedSector: string;
}) {
	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<CurrencyCircleDollarIcon className="size-5" />
					<Trans>Salary Ranges by Role</Trans>
				</CardTitle>
				<CardDescription>
					<Trans>
						Median annual salaries in MAD
						{selectedSector !== "all" && ` - ${SECTORS.find((s) => s.id === selectedSector)?.name}`}
					</Trans>
				</CardDescription>
			</CardHeader>
			<CardContent>
				{loadingSalary ? (
					<Skeleton className="h-80" />
				) : salaryChartData.length > 0 ? (
					<div className="h-80">
						<ResponsiveContainer width="100%" height="100%">
							<BarChart data={salaryChartData} layout="vertical" margin={{ top: 0, right: 30, left: 0, bottom: 0 }}>
								<CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
								<XAxis
									type="number"
									tick={{ fontSize: 11 }}
									stroke="hsl(var(--muted-foreground))"
									tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`}
								/>
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
									formatter={(value) => (typeof value === "number" ? formatCurrency(value) : value)}
								/>
								<Legend />
								<Bar dataKey="min" name={t`Min`} fill="#94a3b8" radius={[0, 0, 0, 0]} />
								<Bar dataKey="median" name={t`Median`} fill="#6366f1" radius={[0, 0, 0, 0]} />
								<Bar dataKey="max" name={t`Max`} fill="#10b981" radius={[0, 4, 4, 0]} />
							</BarChart>
						</ResponsiveContainer>
					</div>
				) : (
					<div className="flex h-80 flex-col items-center justify-center gap-4">
						<CurrencyCircleDollarIcon className="size-12 text-muted-foreground" />
						<p className="text-muted-foreground">
							<Trans>No salary data available for this sector</Trans>
						</p>
					</div>
				)}
			</CardContent>
		</Card>
	);
}

export function SkillsDemandChart({
	loadingTopSkills,
	skillsDemandData,
}: {
	loadingTopSkills: boolean;
	skillsDemandData: SkillsDemandItem[];
}) {
	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<SparkleIcon className="size-5" />
					<Trans>In-Demand Skills</Trans>
				</CardTitle>
				<CardDescription>
					<Trans>Skills ranked by market demand score</Trans>
				</CardDescription>
			</CardHeader>
			<CardContent>
				{loadingTopSkills ? (
					<Skeleton className="h-72" />
				) : skillsDemandData.length > 0 ? (
					<div className="h-72">
						<ResponsiveContainer width="100%" height="100%">
							<BarChart data={skillsDemandData} layout="vertical" margin={{ top: 0, right: 30, left: 0, bottom: 0 }}>
								<CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
								<XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
								<YAxis
									type="category"
									dataKey="name"
									width={120}
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
								<Bar dataKey="demandScore" name={t`Demand Score`} radius={[0, 4, 4, 0]}>
									{skillsDemandData.map((_, index) => (
										<Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
									))}
								</Bar>
							</BarChart>
						</ResponsiveContainer>
					</div>
				) : (
					<div className="flex h-72 flex-col items-center justify-center gap-4">
						<SparkleIcon className="size-12 text-muted-foreground" />
						<p className="text-muted-foreground">
							<Trans>No skills data available</Trans>
						</p>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
