import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import {
	ArrowRightIcon,
	BookOpenIcon,
	ChartBarIcon,
	ChartLineUpIcon,
	CheckCircleIcon,
	FlameIcon,
	GearIcon,
	InfoIcon,
	LightbulbIcon,
	SparkleIcon,
	SpinnerIcon,
	TargetIcon,
	TrendUpIcon,
} from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ErrorComponent } from "@/components/error-component";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { authClient } from "@/integrations/auth/client";
import { orpc } from "@/integrations/orpc/client";
import { DashboardHeader } from "../-components/header";
import {
	IndustryBenchmarkCard,
	MarketDemandCard,
	PrioritySkillCard,
	ResourcesDialog,
	SkillsRadarChart,
} from "./-components/skill-gap-components";
import { CATEGORY_CONFIG, IMPORTANCE_CONFIG, INDUSTRY_CONFIG } from "./-components/skill-gap-config";
import type { SkillCategory } from "./-components/skill-gap-types";

// biome-ignore lint/suspicious/noExplicitAny: Route path not in generated route tree
export const Route = createFileRoute("/dashboard/career/skill-gap" as any)({
	component: SkillGapAnalyzerPage,
	errorComponent: ErrorComponent,
});

function SkillGapAnalyzerPage() {
	const { data: session } = authClient.useSession();
	const [activeTab, setActiveTab] = useState("overview");
	const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
	const [selectedIndustry, setSelectedIndustry] = useState<string | null>(null);
	const [resourceDialogOpen, setResourceDialogOpen] = useState(false);
	const [selectedSkillId, setSelectedSkillId] = useState<string | null>(null);

	const { data: roles, isLoading: rolesLoading } = useQuery({
		...orpc.careerRole.listWithSkillCount.queryOptions({ input: {} }),
		enabled: !!session?.user,
	});

	const { data: gapAnalysis, isLoading: analysisLoading } = useQuery({
		...orpc.skillGap.analyzeGap.queryOptions({ input: { targetRoleId: selectedRoleId || "" } }),
		enabled: !!session?.user && !!selectedRoleId,
	});

	const { data: marketDemand, isLoading: demandLoading } = useQuery({
		...orpc.skillGap.getMarketDemand.queryOptions({ input: { field: selectedIndustry || undefined } }),
		enabled: !!session?.user,
	});

	const { data: prioritizedSkills, isLoading: priorityLoading } = useQuery({
		...orpc.skillGap.prioritizeSkills.queryOptions({ input: {} }),
		enabled: !!session?.user,
	});

	const { data: benchmarks, isLoading: benchmarksLoading } = useQuery({
		...orpc.skillGap.getIndustryBenchmarks.queryOptions({ input: { industry: selectedIndustry || undefined } }),
		enabled: !!session?.user,
	});

	const handleViewResources = (skillId: string) => {
		setSelectedSkillId(skillId);
		setResourceDialogOpen(true);
	};

	const stats = useMemo(() => {
		if (!gapAnalysis) return null;
		return {
			readinessScore: gapAnalysis.readinessScore,
			totalSkills: gapAnalysis.totalSkills,
			skillsCovered: gapAnalysis.skillsCovered,
			criticalGaps: gapAnalysis.criticalGaps,
			estimatedWeeks: gapAnalysis.estimatedWeeksTotal,
		};
	}, [gapAnalysis]);

	return (
		<>
			<DashboardHeader title={t`Skills Gap Analyzer`} icon={TargetIcon} />

			<div className="space-y-6 p-6">
				{/* Role Selector */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<TargetIcon className="size-5" />
							<Trans>Select a target role</Trans>
						</CardTitle>
						<CardDescription>
							<Trans>Choose the position you want to move towards to analyze gaps</Trans>
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="flex gap-4">
							<Select value={selectedRoleId || ""} onValueChange={setSelectedRoleId}>
								<SelectTrigger className="w-full max-w-md">
									<SelectValue placeholder={t`Choose a role...`} />
								</SelectTrigger>
								<SelectContent>
									{rolesLoading ? (
										<div className="flex items-center justify-center p-4">
											<SpinnerIcon className="size-4 animate-spin" />
										</div>
									) : roles && roles.length > 0 ? (
										roles.map((role) => (
											<SelectItem key={role.id} value={role.id}>
												{role.role} - {role.field}
											</SelectItem>
										))
									) : (
										<div className="p-4 text-center text-muted-foreground text-sm">
											<Trans>No roles available</Trans>
										</div>
									)}
								</SelectContent>
							</Select>

							<Select value={selectedIndustry || ""} onValueChange={setSelectedIndustry}>
								<SelectTrigger className="w-48">
									<SelectValue placeholder={t`Industry...`} />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="">
										<Trans>All</Trans>
									</SelectItem>
									{Object.entries(INDUSTRY_CONFIG).map(([key, config]) => (
										<SelectItem key={key} value={key}>
											{config.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
					</CardContent>
				</Card>

				{/* Stats Cards */}
				{stats && (
					<div className="grid gap-4 md:grid-cols-5">
						<Card>
							<CardContent className="pt-6">
								<div className="text-center">
									<div className="font-bold text-3xl text-primary">{stats.readinessScore}%</div>
									<p className="text-muted-foreground text-sm">
										<Trans>Ready for the role</Trans>
									</p>
								</div>
							</CardContent>
						</Card>
						<Card>
							<CardContent className="pt-6">
								<div className="text-center">
									<div className="font-bold text-3xl">
										{stats.skillsCovered}/{stats.totalSkills}
									</div>
									<p className="text-muted-foreground text-sm">
										<Trans>Skills covered</Trans>
									</p>
								</div>
							</CardContent>
						</Card>
						<Card>
							<CardContent className="pt-6">
								<div className="text-center">
									<div className="font-bold text-3xl text-red-600">{stats.criticalGaps}</div>
									<p className="text-muted-foreground text-sm">
										<Trans>Critical gaps</Trans>
									</p>
								</div>
							</CardContent>
						</Card>
						<Card>
							<CardContent className="pt-6">
								<div className="text-center">
									<div className="font-bold text-3xl">{stats.estimatedWeeks}</div>
									<p className="text-muted-foreground text-sm">
										<Trans>Estimated weeks</Trans>
									</p>
								</div>
							</CardContent>
						</Card>
						<Card>
							<CardContent className="pt-6">
								<div className="text-center">
									<Link
										to="/dashboard/career/gap-analysis"
										className="inline-flex items-center gap-2 text-primary hover:underline"
									>
										<Trans>Manage my skills</Trans>
										<ArrowRightIcon className="size-4" />
									</Link>
								</div>
							</CardContent>
						</Card>
					</div>
				)}

				{/* Tabs */}
				<Tabs value={activeTab} onValueChange={setActiveTab}>
					<TabsList className="grid w-full grid-cols-4">
						<TabsTrigger value="overview" className="flex items-center gap-2">
							<ChartBarIcon className="size-4" />
							<span className="hidden sm:inline">
								<Trans>Overview</Trans>
							</span>
						</TabsTrigger>
						<TabsTrigger value="priorities" className="flex items-center gap-2">
							<TargetIcon className="size-4" />
							<span className="hidden sm:inline">
								<Trans>Priorities</Trans>
							</span>
						</TabsTrigger>
						<TabsTrigger value="market" className="flex items-center gap-2">
							<TrendUpIcon className="size-4" />
							<span className="hidden sm:inline">
								<Trans>Market</Trans>
							</span>
						</TabsTrigger>
						<TabsTrigger value="benchmarks" className="flex items-center gap-2">
							<ChartLineUpIcon className="size-4" />
							<span className="hidden sm:inline">
								<Trans>Benchmarks</Trans>
							</span>
						</TabsTrigger>
					</TabsList>

					{/* Overview Tab */}
					<TabsContent value="overview" className="space-y-6">
						{analysisLoading ? (
							<div className="flex items-center justify-center py-12">
								<SpinnerIcon className="size-8 animate-spin" />
							</div>
						) : gapAnalysis ? (
							<div className="grid gap-6 lg:grid-cols-2">
								{/* Radar Chart */}
								<Card>
									<CardHeader>
										<CardTitle>
											<Trans>Gap visualization</Trans>
										</CardTitle>
										<CardDescription>
											<Trans>Comparison of your skills with role requirements</Trans>
										</CardDescription>
									</CardHeader>
									<CardContent>
										<SkillsRadarChart gaps={gapAnalysis.gaps} />
									</CardContent>
								</Card>

								{/* Gap Details */}
								<Card>
									<CardHeader>
										<CardTitle>
											<Trans>Gap details</Trans>
										</CardTitle>
										<CardDescription>
											<Trans>Skills to develop by priority order</Trans>
										</CardDescription>
									</CardHeader>
									<CardContent>
										<div className="space-y-3">
											{gapAnalysis.gaps
												.filter((g) => g.gapSize > 0)
												.slice(0, 6)
												.map((gap) => {
													const CategoryIcon = CATEGORY_CONFIG[gap.category as SkillCategory]?.icon || GearIcon;
													return (
														<div key={gap.skillId} className="flex items-center justify-between rounded-lg border p-3">
															<div className="flex items-center gap-3">
																<CategoryIcon className="size-5 text-muted-foreground" />
																<div>
																	<div className="font-medium text-sm">{gap.skillName}</div>
																	<div className="flex items-center gap-2 text-muted-foreground text-xs">
																		<span>
																			{gap.currentLevel} &rarr; {gap.requiredLevel}
																		</span>
																		<Badge variant="outline" className={IMPORTANCE_CONFIG[gap.importance]?.color}>
																			{IMPORTANCE_CONFIG[gap.importance]?.label}
																		</Badge>
																	</div>
																</div>
															</div>
															<Button variant="ghost" size="sm" onClick={() => handleViewResources(gap.skillId)}>
																<BookOpenIcon className="size-4" />
															</Button>
														</div>
													);
												})}
										</div>
									</CardContent>
								</Card>

								{/* AI Insights */}
								{gapAnalysis.aiInsights && (
									<Card className="lg:col-span-2">
										<CardHeader>
											<CardTitle className="flex items-center gap-2">
												<SparkleIcon className="size-5 text-primary" />
												<Trans>Personalized advice</Trans>
											</CardTitle>
										</CardHeader>
										<CardContent>
											<div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">
												{gapAnalysis.aiInsights}
											</div>
										</CardContent>
									</Card>
								)}

								{/* Recommendations */}
								<Card className="lg:col-span-2">
									<CardHeader>
										<CardTitle className="flex items-center gap-2">
											<LightbulbIcon className="size-5 text-amber-500" />
											<Trans>Recommendations</Trans>
										</CardTitle>
									</CardHeader>
									<CardContent>
										<ul className="space-y-2">
											{gapAnalysis.recommendations.map((rec, i) => (
												<li key={i} className="flex items-start gap-2 text-sm">
													<CheckCircleIcon className="mt-0.5 size-4 shrink-0 text-green-500" />
													<span>{rec}</span>
												</li>
											))}
										</ul>
									</CardContent>
								</Card>
							</div>
						) : (
							<Card>
								<CardContent className="py-12 text-center">
									<TargetIcon className="mx-auto size-12 text-muted-foreground opacity-50" />
									<h3 className="mt-4 font-medium text-lg">
										<Trans>Select a target role</Trans>
									</h3>
									<p className="mt-2 text-muted-foreground">
										<Trans>Choose a role above to see your skills gap analysis</Trans>
									</p>
								</CardContent>
							</Card>
						)}
					</TabsContent>

					{/* Priorities Tab */}
					<TabsContent value="priorities" className="space-y-6">
						{priorityLoading ? (
							<div className="flex items-center justify-center py-12">
								<SpinnerIcon className="size-8 animate-spin" />
							</div>
						) : prioritizedSkills && prioritizedSkills.length > 0 ? (
							<>
								<div className="flex items-center gap-2 rounded-lg bg-muted/50 p-4">
									<InfoIcon className="size-5 text-muted-foreground" />
									<p className="text-muted-foreground text-sm">
										<Trans>
											These skills are ranked by impact on your employability, based on market demand and your current
											level.
										</Trans>
									</p>
								</div>
								<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
									{prioritizedSkills.slice(0, 9).map((skill) => (
										<PrioritySkillCard key={skill.skillId} skill={skill} onViewResources={handleViewResources} />
									))}
								</div>
							</>
						) : (
							<Card>
								<CardContent className="py-12 text-center">
									<TargetIcon className="mx-auto size-12 text-muted-foreground opacity-50" />
									<h3 className="mt-4 font-medium text-lg">
										<Trans>No skills to prioritize</Trans>
									</h3>
									<p className="mt-2 text-muted-foreground">
										<Trans>Add your skills in the gap analysis to see priorities</Trans>
									</p>
									<Button className="mt-4" asChild>
										<Link to="/dashboard/career/gap-analysis">
											<Trans>Manage my skills</Trans>
										</Link>
									</Button>
								</CardContent>
							</Card>
						)}
					</TabsContent>

					{/* Market Tab */}
					<TabsContent value="market" className="space-y-6">
						{demandLoading ? (
							<div className="flex items-center justify-center py-12">
								<SpinnerIcon className="size-8 animate-spin" />
							</div>
						) : marketDemand && marketDemand.length > 0 ? (
							<>
								<div className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-red-500/10 to-orange-500/10 p-4">
									<FlameIcon className="size-5 text-orange-500" weight="fill" />
									<p className="text-sm">
										<Trans>Most in-demand skills on the job market in Morocco</Trans>
									</p>
								</div>
								<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
									{marketDemand.slice(0, 12).map((skill) => (
										<MarketDemandCard key={skill.skillName} skill={skill} />
									))}
								</div>
							</>
						) : (
							<Card>
								<CardContent className="py-12 text-center">
									<TrendUpIcon className="mx-auto size-12 text-muted-foreground opacity-50" />
									<h3 className="mt-4 font-medium text-lg">
										<Trans>Market data not available</Trans>
									</h3>
									<p className="mt-2 text-muted-foreground">
										<Trans>Market demand data will be available soon</Trans>
									</p>
								</CardContent>
							</Card>
						)}
					</TabsContent>

					{/* Benchmarks Tab */}
					<TabsContent value="benchmarks" className="space-y-6">
						{benchmarksLoading ? (
							<div className="flex items-center justify-center py-12">
								<SpinnerIcon className="size-8 animate-spin" />
							</div>
						) : benchmarks && benchmarks.length > 0 ? (
							<>
								<div className="flex items-center gap-2 rounded-lg bg-muted/50 p-4">
									<ChartLineUpIcon className="size-5 text-muted-foreground" />
									<p className="text-muted-foreground text-sm">
										<Trans>Compare skill requirements across different industries</Trans>
									</p>
								</div>
								<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
									{benchmarks.map((benchmark) => (
										<IndustryBenchmarkCard
											key={benchmark.industry}
											benchmark={benchmark}
											isSelected={selectedIndustry === benchmark.industry}
											onSelect={() =>
												setSelectedIndustry(selectedIndustry === benchmark.industry ? null : benchmark.industry)
											}
										/>
									))}
								</div>
							</>
						) : (
							<Card>
								<CardContent className="py-12 text-center">
									<ChartLineUpIcon className="mx-auto size-12 text-muted-foreground opacity-50" />
									<h3 className="mt-4 font-medium text-lg">
										<Trans>Benchmarks not available</Trans>
									</h3>
									<p className="mt-2 text-muted-foreground">
										<Trans>Industry benchmarks will be available soon</Trans>
									</p>
								</CardContent>
							</Card>
						)}
					</TabsContent>
				</Tabs>
			</div>

			<ResourcesDialog open={resourceDialogOpen} onOpenChange={setResourceDialogOpen} skillId={selectedSkillId} />
		</>
	);
}
