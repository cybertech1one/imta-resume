import { Trans } from "@lingui/react/macro";
import { ChartBarIcon, SparkleIcon, TrendUpIcon, UsersIcon } from "@phosphor-icons/react";
import { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

import { categoryConfig } from "./network-map-config";
import type {
	ConnectionCategory,
	Interaction,
	NetworkAnalytics,
	NetworkEdge,
	NetworkGrowthData,
	NetworkNode,
} from "./network-map-types";

export interface AnalyticsDashboardProps {
	nodes: NetworkNode[];
	edges: NetworkEdge[];
	interactions: Interaction[];
	growthData: NetworkGrowthData[];
}

export function AnalyticsDashboard({ nodes, edges: _edges, interactions, growthData }: AnalyticsDashboardProps) {
	const analytics = useMemo<NetworkAnalytics>(() => {
		const categoryDistribution = nodes.reduce(
			(acc, node) => {
				acc[node.category] = (acc[node.category] || 0) + 1;
				return acc;
			},
			{} as Record<ConnectionCategory, number>,
		);

		const strengthCounts = {
			strong: nodes.filter((n) => n.relationshipStrength === "strong").length,
			moderate: nodes.filter((n) => n.relationshipStrength === "moderate").length,
			weak: nodes.filter((n) => n.relationshipStrength === "weak").length,
			dormant: nodes.filter((n) => n.relationshipStrength === "dormant").length,
		};

		// Calculate diversity score based on category distribution
		const totalNodes = nodes.length;
		const categoryCount = Object.keys(categoryDistribution).length;
		const idealPerCategory = totalNodes / categoryCount;
		const diversityScore =
			totalNodes > 0
				? Math.round(
						(1 -
							Object.values(categoryDistribution).reduce((sum, count) => {
								return sum + Math.abs(count - idealPerCategory) / totalNodes;
							}, 0) /
								categoryCount) *
							100,
					)
				: 0;

		// Calculate engagement score based on interaction frequency
		const recentInteractions = interactions.filter((i) => {
			const date = new Date(i.date);
			const thirtyDaysAgo = new Date();
			thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
			return date >= thirtyDaysAgo;
		}).length;
		const engagementScore = Math.min(100, Math.round((recentInteractions / Math.max(1, nodes.length)) * 100));

		// Growth rate
		const growthRate =
			growthData.length >= 2
				? Math.round(
						((growthData[growthData.length - 1].total - growthData[growthData.length - 2].total) /
							Math.max(1, growthData[growthData.length - 2].total)) *
							100,
					)
				: 0;

		return {
			totalConnections: totalNodes,
			strongConnections: strengthCounts.strong,
			moderateConnections: strengthCounts.moderate,
			weakConnections: strengthCounts.weak,
			dormantConnections: strengthCounts.dormant,
			categoryDistribution,
			averageInteractionsPerMonth: interactions.length > 0 ? Math.round((interactions.length / 6) * 10) / 10 : 0,
			networkDiversity: diversityScore,
			engagementScore,
			growthRate,
		};
	}, [nodes, interactions, growthData]);

	const categoryData = useMemo(() => {
		return Object.entries(analytics.categoryDistribution).map(([category, count]) => ({
			name: categoryConfig[category as ConnectionCategory].label,
			value: count,
			color: categoryConfig[category as ConnectionCategory].nodeColor,
		}));
	}, [analytics.categoryDistribution]);

	const strengthData = [
		{ name: "Strong", value: analytics.strongConnections, color: "#22c55e" },
		{ name: "Moderate", value: analytics.moderateConnections, color: "#3b82f6" },
		{ name: "Weak", value: analytics.weakConnections, color: "#f59e0b" },
		{ name: "Dormant", value: analytics.dormantConnections, color: "#6b7280" },
	];

	return (
		<div className="space-y-6">
			{/* Key Metrics */}
			<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
				<Card>
					<CardContent className="p-4">
						<div className="flex items-center gap-3">
							<div className="flex size-10 items-center justify-center rounded-full bg-primary/10">
								<UsersIcon className="size-5 text-primary" weight="duotone" />
							</div>
							<div>
								<p className="text-muted-foreground text-sm">
									<Trans>Total Network</Trans>
								</p>
								<p className="font-bold text-2xl">{analytics.totalConnections}</p>
							</div>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardContent className="p-4">
						<div className="flex items-center gap-3">
							<div className="flex size-10 items-center justify-center rounded-full bg-green-500/10">
								<TrendUpIcon className="size-5 text-green-500" weight="duotone" />
							</div>
							<div>
								<p className="text-muted-foreground text-sm">
									<Trans>Growth Rate</Trans>
								</p>
								<p className="font-bold text-2xl">
									{analytics.growthRate >= 0 ? "+" : ""}
									{analytics.growthRate}%
								</p>
							</div>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardContent className="p-4">
						<div className="flex items-center gap-3">
							<div className="flex size-10 items-center justify-center rounded-full bg-purple-500/10">
								<ChartBarIcon className="size-5 text-purple-500" weight="duotone" />
							</div>
							<div>
								<p className="text-muted-foreground text-sm">
									<Trans>Diversity Score</Trans>
								</p>
								<p className="font-bold text-2xl">{analytics.networkDiversity}%</p>
							</div>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardContent className="p-4">
						<div className="flex items-center gap-3">
							<div className="flex size-10 items-center justify-center rounded-full bg-amber-500/10">
								<SparkleIcon className="size-5 text-amber-500" weight="duotone" />
							</div>
							<div>
								<p className="text-muted-foreground text-sm">
									<Trans>Engagement</Trans>
								</p>
								<p className="font-bold text-2xl">{analytics.engagementScore}%</p>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Charts Row */}
			<div className="grid gap-6 lg:grid-cols-2">
				{/* Category Distribution */}
				<Card>
					<CardHeader>
						<CardTitle className="text-lg">
							<Trans>Category Distribution</Trans>
						</CardTitle>
						<CardDescription>
							<Trans>Breakdown of your connections by type</Trans>
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="space-y-3">
							{categoryData.map((item) => (
								<div key={item.name} className="space-y-1">
									<div className="flex justify-between text-sm">
										<span>{item.name}</span>
										<span className="font-medium">{item.value}</span>
									</div>
									<Progress
										value={(item.value / analytics.totalConnections) * 100}
										className="h-2"
										style={{ "--progress-color": item.color } as React.CSSProperties}
									/>
								</div>
							))}
						</div>
					</CardContent>
				</Card>

				{/* Relationship Strength */}
				<Card>
					<CardHeader>
						<CardTitle className="text-lg">
							<Trans>Relationship Strength</Trans>
						</CardTitle>
						<CardDescription>
							<Trans>How strong are your connections</Trans>
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="space-y-3">
							{strengthData.map((item) => (
								<div key={item.name} className="space-y-1">
									<div className="flex justify-between text-sm">
										<span className="flex items-center gap-2">
											<div className="size-3 rounded-full" style={{ backgroundColor: item.color }} />
											{item.name}
										</span>
										<span className="font-medium">{item.value}</span>
									</div>
									<Progress
										value={(item.value / analytics.totalConnections) * 100}
										className="h-2"
										style={{ "--progress-color": item.color } as React.CSSProperties}
									/>
								</div>
							))}
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Network Growth Chart */}
			<Card>
				<CardHeader>
					<CardTitle className="text-lg">
						<Trans>Network Growth Over Time</Trans>
					</CardTitle>
					<CardDescription>
						<Trans>Track how your network has expanded</Trans>
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="space-y-4">
						{growthData.map((data, _index) => (
							<div key={data.month} className="flex items-center gap-4">
								<span className="w-12 font-medium text-sm">{data.month}</span>
								<div className="flex flex-1 items-center gap-1">
									<div className="h-6 rounded bg-blue-500" style={{ width: `${(data.colleagues / 10) * 100}%` }} />
									<div className="h-6 rounded bg-purple-500" style={{ width: `${(data.mentors / 10) * 100}%` }} />
									<div className="h-6 rounded bg-green-500" style={{ width: `${(data.recruiters / 10) * 100}%` }} />
									<div className="h-6 rounded bg-gray-500" style={{ width: `${(data.others / 10) * 100}%` }} />
								</div>
								<span className="w-8 text-right font-semibold text-sm">{data.total}</span>
							</div>
						))}
					</div>
					<div className="mt-4 flex flex-wrap gap-4 border-t pt-4">
						<div className="flex items-center gap-2">
							<div className="size-3 rounded bg-blue-500" />
							<span className="text-muted-foreground text-xs">
								<Trans>Colleagues</Trans>
							</span>
						</div>
						<div className="flex items-center gap-2">
							<div className="size-3 rounded bg-purple-500" />
							<span className="text-muted-foreground text-xs">
								<Trans>Mentors</Trans>
							</span>
						</div>
						<div className="flex items-center gap-2">
							<div className="size-3 rounded bg-green-500" />
							<span className="text-muted-foreground text-xs">
								<Trans>Recruiters</Trans>
							</span>
						</div>
						<div className="flex items-center gap-2">
							<div className="size-3 rounded bg-gray-500" />
							<span className="text-muted-foreground text-xs">
								<Trans>Others</Trans>
							</span>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
