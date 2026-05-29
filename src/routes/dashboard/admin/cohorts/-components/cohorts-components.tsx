import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import {
	ArrowLeftIcon,
	ChartBarIcon,
	DownloadSimpleIcon,
	LightbulbIcon,
	SpinnerGapIcon,
	TrashIcon,
	TrendUpIcon,
	UsersIcon,
	WarningIcon,
} from "@phosphor-icons/react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
	Bar,
	BarChart,
	CartesianGrid,
	Cell,
	Legend,
	Pie,
	PieChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { authClient } from "@/integrations/auth/client";
import { orpc } from "@/integrations/orpc/client";
import { cn } from "@/utils/style";
import { COLORS } from "./cohorts-config";
import type { CohortData, CohortPrediction, StudentPerformance } from "./cohorts-types";

export function CohortsSkeleton() {
	return (
		<div className="@container space-y-6 rounded-xl border bg-background p-6">
			<div className="flex items-center justify-between">
				<Skeleton className="h-10 w-40" />
				<Skeleton className="h-10 w-32" />
			</div>
			<div className="grid @lg:grid-cols-2 @xl:grid-cols-3 gap-4">
				{Array.from({ length: 6 }).map((_, i) => (
					<Skeleton key={i} className="h-48 rounded-xl" />
				))}
			</div>
		</div>
	);
}

function MetricCard({
	title,
	value,
	suffix = "",
	color = "blue",
	icon,
}: {
	title: string;
	value: number;
	suffix?: string;
	color?: "blue" | "green" | "purple" | "orange" | "red";
	icon: React.ReactNode;
}) {
	const colorClasses = {
		blue: "bg-blue-50 text-blue-600",
		green: "bg-green-50 text-green-600",
		purple: "bg-purple-50 text-purple-600",
		orange: "bg-orange-50 text-orange-600",
		red: "bg-red-50 text-red-600",
	};

	return (
		<div className="rounded-lg border bg-card p-4">
			<div className="flex items-center gap-3">
				<div className={cn("flex size-10 items-center justify-center rounded-lg", colorClasses[color])}>{icon}</div>
				<div>
					<p className="text-muted-foreground text-sm">{title}</p>
					<p className="font-bold text-2xl">
						{Math.round(value)}
						{suffix}
					</p>
				</div>
			</div>
		</div>
	);
}

export function CohortCard({
	cohort,
	onSelect,
	onDelete,
}: {
	cohort: CohortData;
	onSelect: (id: string) => void;
	onDelete: (id: string) => void;
}) {
	return (
		<div
			className={cn(
				"group cursor-pointer rounded-xl border bg-card p-5 transition-all hover:border-primary hover:shadow-md",
				!cohort.isActive && "opacity-60",
			)}
			onClick={() => onSelect(cohort.id)}
		>
			<div className="flex items-start justify-between">
				<div className="flex-1">
					<h3 className="font-semibold text-lg">{cohort.name}</h3>
					{cohort.description && (
						<p className="mt-1 line-clamp-2 text-muted-foreground text-sm">{cohort.description}</p>
					)}
				</div>
				<Button
					variant="ghost"
					size="icon"
					className="opacity-0 transition-opacity group-hover:opacity-100"
					onClick={(e) => {
						e.stopPropagation();
						onDelete(cohort.id);
					}}
				>
					<TrashIcon size={18} className="text-destructive" />
				</Button>
			</div>
			<div className="mt-4 flex flex-wrap gap-2">
				{cohort.criteria.program && <Badge variant="secondary">{cohort.criteria.program}</Badge>}
				{cohort.criteria.year && <Badge variant="outline">{cohort.criteria.year}</Badge>}
				{cohort.criteria.field && <Badge variant="outline">{cohort.criteria.field}</Badge>}
				{!cohort.isActive && <Badge variant="destructive">Inactive</Badge>}
			</div>
			<p className="mt-3 text-muted-foreground text-xs">Created {new Date(cohort.createdAt).toLocaleDateString()}</p>
		</div>
	);
}

export function CohortDetailView({ cohortId, onBack }: { cohortId: string; onBack: () => void }) {
	const { data: session } = authClient.useSession();
	const [activeTab, setActiveTab] = useState("overview");

	const { data: cohort, isLoading: loadingCohort } = useQuery({
		...orpc.cohortAnalytics.get.queryOptions({ input: { id: cohortId } }),
		enabled: !!session?.user && !!cohortId,
	});

	const { data: metrics, isLoading: loadingMetrics } = useQuery({
		...orpc.cohortAnalytics.getMetrics.queryOptions({ input: { cohortId } }),
		enabled: !!session?.user && !!cohortId,
	});

	const { data: members } = useQuery({
		...orpc.cohortAnalytics.getMembers.queryOptions({ input: { cohortId } }),
		enabled: !!session?.user && !!cohortId && activeTab === "members",
	});

	const { data: topPerformers } = useQuery({
		...orpc.cohortAnalytics.getTopPerformers.queryOptions({ input: { cohortId, limit: 10 } }),
		enabled: !!session?.user && !!cohortId && activeTab === "performers",
	});

	const { data: atRiskStudents } = useQuery({
		...orpc.cohortAnalytics.getAtRisk.queryOptions({ input: { cohortId } }),
		enabled: !!session?.user && !!cohortId && activeTab === "at-risk",
	});

	const { data: predictions } = useQuery({
		...orpc.cohortAnalytics.predictOutcomes.queryOptions({ input: { cohortId } }),
		enabled: !!session?.user && !!cohortId && activeTab === "predictions",
	});

	const { data: _history } = useQuery({
		...orpc.cohortAnalytics.getMetricsHistory.queryOptions({ input: { cohortId, limit: 30 } }),
		enabled: !!session?.user && !!cohortId && activeTab === "trends",
	});

	const { mutate: saveSnapshot, isPending: savingSnapshot } = useMutation(
		orpc.cohortAnalytics.saveMetricsSnapshot.mutationOptions(),
	);

	const handleSaveSnapshot = () => {
		const toastId = toast.loading(t`Saving metrics snapshot...`);
		saveSnapshot(
			{ cohortId },
			{
				onSuccess: () => {
					toast.success(t`Metrics snapshot saved`, { id: toastId });
				},
				onError: (error) => {
					toast.error(error.message || t`Failed to save snapshot`, { id: toastId });
				},
			},
		);
	};

	if (loadingCohort || loadingMetrics) {
		return (
			<div className="space-y-6">
				<Button variant="ghost" onClick={onBack} className="gap-2">
					<ArrowLeftIcon size={18} />
					<Trans>Back to Cohorts</Trans>
				</Button>
				<Skeleton className="h-12 w-64" />
				<div className="grid @lg:grid-cols-4 gap-4">
					{Array.from({ length: 8 }).map((_, i) => (
						<Skeleton key={i} className="h-24 rounded-lg" />
					))}
				</div>
			</div>
		);
	}

	if (!cohort || !metrics) {
		return (
			<div className="space-y-6">
				<Button variant="ghost" onClick={onBack} className="gap-2">
					<ArrowLeftIcon size={18} />
					<Trans>Back to Cohorts</Trans>
				</Button>
				<div className="text-center text-muted-foreground">
					<Trans>Cohort not found</Trans>
				</div>
			</div>
		);
	}

	const metricsChartData = [
		{ name: "Resume Progress", value: metrics.avgResumeProgress, fill: COLORS[0] },
		{ name: "Skills Score", value: metrics.avgSkillsScore, fill: COLORS[1] },
		{ name: "Interview Score", value: metrics.avgInterviewScore, fill: COLORS[2] },
		{ name: "Placement Rate", value: metrics.placementRate, fill: COLORS[3] },
	];

	const memberDistribution = [
		{ name: "Active", value: metrics.activeMembers, fill: COLORS[1] },
		{ name: "At Risk", value: metrics.atRiskCount, fill: COLORS[3] },
		{ name: "Completed Training", value: metrics.completedTraining, fill: COLORS[4] },
	];

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<Button variant="ghost" onClick={onBack} className="gap-2">
					<ArrowLeftIcon size={18} />
					<Trans>Back to Cohorts</Trans>
				</Button>
				<Button onClick={handleSaveSnapshot} disabled={savingSnapshot} variant="outline">
					{savingSnapshot ? <SpinnerGapIcon size={18} className="animate-spin" /> : <DownloadSimpleIcon size={18} />}
					<Trans>Save Snapshot</Trans>
				</Button>
			</div>

			<div>
				<h2 className="font-bold text-2xl">{cohort.name}</h2>
				{cohort.description && <p className="mt-1 text-muted-foreground">{cohort.description}</p>}
			</div>

			<div className="grid @lg:grid-cols-4 @sm:grid-cols-2 gap-4">
				<MetricCard title={t`Total Members`} value={metrics.totalMembers} color="blue" icon={<UsersIcon size={20} />} />
				<MetricCard
					title={t`Active Members`}
					value={metrics.activeMembers}
					color="green"
					icon={<TrendUpIcon size={20} />}
				/>
				<MetricCard
					title={t`Placement Rate`}
					value={metrics.placementRate}
					suffix="%"
					color="purple"
					icon={<ChartBarIcon size={20} />}
				/>
				<MetricCard title={t`At Risk`} value={metrics.atRiskCount} color="red" icon={<WarningIcon size={20} />} />
			</div>

			<Tabs value={activeTab} onValueChange={setActiveTab}>
				<TabsList className="grid w-full grid-cols-5">
					<TabsTrigger value="overview">
						<Trans>Overview</Trans>
					</TabsTrigger>
					<TabsTrigger value="members">
						<Trans>Members</Trans>
					</TabsTrigger>
					<TabsTrigger value="performers">
						<Trans>Top Performers</Trans>
					</TabsTrigger>
					<TabsTrigger value="at-risk">
						<Trans>At Risk</Trans>
					</TabsTrigger>
					<TabsTrigger value="predictions">
						<Trans>Predictions</Trans>
					</TabsTrigger>
				</TabsList>

				<TabsContent value="overview" className="mt-6 space-y-6">
					<div className="grid @xl:grid-cols-2 gap-6">
						<div className="rounded-xl border bg-card p-6">
							<h3 className="mb-4 font-semibold text-lg">
								<Trans>Performance Metrics</Trans>
							</h3>
							<ResponsiveContainer width="100%" height={250}>
								<BarChart data={metricsChartData}>
									<CartesianGrid strokeDasharray="3 3" className="stroke-border" />
									<XAxis dataKey="name" tick={{ fontSize: 11 }} />
									<YAxis domain={[0, 100]} />
									<Tooltip
										contentStyle={{
											backgroundColor: "hsl(var(--card))",
											border: "1px solid hsl(var(--border))",
											borderRadius: "8px",
										}}
									/>
									<Bar dataKey="value" radius={[4, 4, 0, 0]}>
										{metricsChartData.map((entry, index) => (
											<Cell key={`cell-${index}`} fill={entry.fill} />
										))}
									</Bar>
								</BarChart>
							</ResponsiveContainer>
						</div>

						<div className="rounded-xl border bg-card p-6">
							<h3 className="mb-4 font-semibold text-lg">
								<Trans>Member Distribution</Trans>
							</h3>
							<ResponsiveContainer width="100%" height={250}>
								<PieChart>
									<Pie
										data={memberDistribution.filter((d) => d.value > 0)}
										dataKey="value"
										nameKey="name"
										cx="50%"
										cy="50%"
										outerRadius={80}
										label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
									>
										{memberDistribution.map((entry, index) => (
											<Cell key={`cell-${index}`} fill={entry.fill} />
										))}
									</Pie>
									<Tooltip />
									<Legend />
								</PieChart>
							</ResponsiveContainer>
						</div>
					</div>

					<div className="grid @lg:grid-cols-4 @sm:grid-cols-2 gap-4">
						<MetricCard
							title={t`Avg Resume Progress`}
							value={metrics.avgResumeProgress}
							suffix="%"
							color="blue"
							icon={<ChartBarIcon size={20} />}
						/>
						<MetricCard
							title={t`Avg Skills Score`}
							value={metrics.avgSkillsScore}
							suffix="%"
							color="green"
							icon={<ChartBarIcon size={20} />}
						/>
						<MetricCard
							title={t`Avg Interview Score`}
							value={metrics.avgInterviewScore}
							suffix="%"
							color="purple"
							icon={<ChartBarIcon size={20} />}
						/>
						<MetricCard
							title={t`Completed Training`}
							value={metrics.completedTraining}
							color="orange"
							icon={<TrendUpIcon size={20} />}
						/>
					</div>
				</TabsContent>

				<TabsContent value="members" className="mt-6">
					<div className="rounded-xl border bg-card">
						<div className="p-6">
							<h3 className="font-semibold text-lg">
								<Trans>Cohort Members</Trans> ({members?.length ?? 0})
							</h3>
						</div>
						<div className="divide-y">
							{members?.map((member) => (
								<div key={member.id} className="flex items-center justify-between px-6 py-4">
									<div>
										<p className="font-medium">{member.userName}</p>
										<p className="text-muted-foreground text-sm">{member.userEmail}</p>
									</div>
									<div className="text-right">
										<Badge variant="secondary">{member.status}</Badge>
										<p className="mt-1 text-muted-foreground text-xs">
											Joined {new Date(member.joinedAt).toLocaleDateString()}
										</p>
									</div>
								</div>
							))}
							{(!members || members.length === 0) && (
								<p className="p-6 text-center text-muted-foreground">
									<Trans>No members in this cohort</Trans>
								</p>
							)}
						</div>
					</div>
				</TabsContent>

				<TabsContent value="performers" className="mt-6">
					<div className="rounded-xl border bg-card">
						<div className="p-6">
							<h3 className="font-semibold text-lg">
								<Trans>Top Performers</Trans>
							</h3>
						</div>
						<div className="divide-y">
							{(topPerformers as StudentPerformance[] | undefined)?.map((student, index) => (
								<div key={student.userId} className="flex items-center justify-between px-6 py-4">
									<div className="flex items-center gap-4">
										<div
											className={cn(
												"flex size-8 items-center justify-center rounded-full font-bold text-sm text-white",
												index === 0
													? "bg-yellow-500"
													: index === 1
														? "bg-gray-400"
														: index === 2
															? "bg-amber-600"
															: "bg-muted-foreground",
											)}
										>
											{index + 1}
										</div>
										<div>
											<p className="font-medium">{student.userName}</p>
											<p className="text-muted-foreground text-sm">{student.userEmail}</p>
										</div>
									</div>
									<div className="flex items-center gap-4 text-right">
										<div>
											<p className="font-medium text-sm">Skills: {Math.round(student.avgSkillsScore)}%</p>
											<p className="text-muted-foreground text-xs">
												Interview: {Math.round(student.avgInterviewScore)}%
											</p>
										</div>
										{student.isPlaced && (
											<Badge variant="default" className="bg-green-600">
												Placed
											</Badge>
										)}
									</div>
								</div>
							))}
							{(!topPerformers || topPerformers.length === 0) && (
								<p className="p-6 text-center text-muted-foreground">
									<Trans>No performance data available</Trans>
								</p>
							)}
						</div>
					</div>
				</TabsContent>

				<TabsContent value="at-risk" className="mt-6">
					<div className="rounded-xl border bg-card">
						<div className="p-6">
							<h3 className="font-semibold text-lg">
								<Trans>At-Risk Students</Trans>
							</h3>
							<p className="text-muted-foreground text-sm">
								<Trans>Students who need intervention based on activity and performance</Trans>
							</p>
						</div>
						<div className="divide-y">
							{(atRiskStudents as StudentPerformance[] | undefined)?.map((student) => (
								<div key={student.userId} className="flex items-center justify-between px-6 py-4">
									<div className="flex items-center gap-4">
										<WarningIcon
											size={24}
											className={student.riskLevel === "high" ? "text-red-500" : "text-orange-500"}
										/>
										<div>
											<p className="font-medium">{student.userName}</p>
											<p className="text-muted-foreground text-sm">{student.userEmail}</p>
										</div>
									</div>
									<div className="flex items-center gap-4 text-right">
										<div>
											<p className="text-muted-foreground text-xs">
												Last active:{" "}
												{student.lastActivity ? new Date(student.lastActivity).toLocaleDateString() : "Never"}
											</p>
											<p className="text-muted-foreground text-xs">
												Skills: {Math.round(student.avgSkillsScore)}% | Interview:{" "}
												{Math.round(student.avgInterviewScore)}%
											</p>
										</div>
										<Badge variant={student.riskLevel === "high" ? "destructive" : "secondary"}>
											{student.riskLevel === "high" ? "High Risk" : "Medium Risk"}
										</Badge>
									</div>
								</div>
							))}
							{(!atRiskStudents || atRiskStudents.length === 0) && (
								<p className="p-6 text-center text-muted-foreground">
									<Trans>No at-risk students identified</Trans>
								</p>
							)}
						</div>
					</div>
				</TabsContent>

				<TabsContent value="predictions" className="mt-6 space-y-6">
					{predictions && (
						<>
							<div className="grid @lg:grid-cols-3 @sm:grid-cols-2 gap-4">
								<MetricCard
									title={t`Predicted Placement Rate`}
									value={(predictions as CohortPrediction).predictedPlacementRate}
									suffix="%"
									color="green"
									icon={<TrendUpIcon size={20} />}
								/>
								<MetricCard
									title={t`Predicted Completion Rate`}
									value={(predictions as CohortPrediction).predictedCompletionRate}
									suffix="%"
									color="blue"
									icon={<ChartBarIcon size={20} />}
								/>
								<MetricCard
									title={t`Confidence Level`}
									value={(predictions as CohortPrediction).confidenceLevel}
									suffix="%"
									color="purple"
									icon={<LightbulbIcon size={20} />}
								/>
							</div>

							{(predictions as CohortPrediction).riskFactors.length > 0 && (
								<div className="rounded-xl border bg-red-50 p-6">
									<h3 className="mb-3 flex items-center gap-2 font-semibold text-red-800">
										<WarningIcon size={20} />
										<Trans>Risk Factors</Trans>
									</h3>
									<ul className="space-y-2">
										{(predictions as CohortPrediction).riskFactors.map((factor, index) => (
											<li key={index} className="flex items-start gap-2 text-red-700 text-sm">
												<span className="mt-1.5 size-1.5 flex-shrink-0 rounded-full bg-red-600" />
												{factor}
											</li>
										))}
									</ul>
								</div>
							)}

							{(predictions as CohortPrediction).recommendations.length > 0 && (
								<div className="rounded-xl border bg-green-50 p-6">
									<h3 className="mb-3 flex items-center gap-2 font-semibold text-green-800">
										<LightbulbIcon size={20} />
										<Trans>Recommendations</Trans>
									</h3>
									<ul className="space-y-2">
										{(predictions as CohortPrediction).recommendations.map((rec, index) => (
											<li key={index} className="flex items-start gap-2 text-green-700 text-sm">
												<span className="mt-1.5 size-1.5 flex-shrink-0 rounded-full bg-green-600" />
												{rec}
											</li>
										))}
									</ul>
								</div>
							)}
						</>
					)}
				</TabsContent>
			</Tabs>
		</div>
	);
}
