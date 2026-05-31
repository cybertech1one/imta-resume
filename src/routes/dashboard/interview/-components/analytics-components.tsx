import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import {
	ArrowClockwiseIcon,
	ArrowDownIcon,
	ArrowRightIcon,
	ArrowUpIcon,
	BookOpenIcon,
	BrainIcon,
	ChartBarIcon,
	ChartLineUpIcon,
	CheckCircleIcon,
	ClockIcon,
	FireIcon,
	LightbulbIcon,
	ListBulletsIcon,
	TargetIcon,
	TrendUpIcon,
	TrophyIcon,
	WarningCircleIcon,
	XCircleIcon,
} from "@phosphor-icons/react";
import { Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/utils/style";
import { DashboardHeader } from "../../-components/header";
import { readinessConfig, severityConfig, trendIcons } from "./analytics-config";
import type { TimePeriod } from "./analytics-types";

export function AnalyticsLoadingState() {
	return (
		<main role="main" aria-label={t`Interview analytics`}>
			<DashboardHeader icon={ChartLineUpIcon} title={t`Performance Analysis`} />
			<div className="flex items-center justify-center py-24">
				<motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
					<ArrowClockwiseIcon className="size-8 text-primary" />
				</motion.div>
			</div>
		</main>
	);
}

export function ReadinessHeroSection({ readiness }: { readiness: any }) {
	return (
		<motion.section
			className="relative mb-8 overflow-hidden rounded-3xl border border-primary/20 p-8"
			style={{
				background:
					"linear-gradient(135deg, oklch(0.7 0.15 150 / 0.15) 0%, oklch(0.6 0.2 200 / 0.1) 50%, oklch(0.65 0.18 250 / 0.08) 100%)",
			}}
			initial={false}
			animate={{ opacity: 1, y: 0 }}
			aria-labelledby="readiness-heading"
		>
			<div className="relative z-10 flex flex-col items-center gap-6 md:flex-row md:justify-between">
				<div className="text-center md:text-left">
					<h2 id="readiness-heading" className="mb-2 font-bold text-2xl">
						<Trans>Readiness Level</Trans>
					</h2>
					{readiness && (
						<>
							<div className="mb-4 flex items-center gap-3">
								{(() => {
									const config = readinessConfig[readiness.readinessLevel as keyof typeof readinessConfig];
									const ReadinessIcon = config.icon;
									return (
										<Badge className={cn("gap-1 text-lg", config.bgColor, config.color)}>
											<ReadinessIcon className="size-5" weight="fill" />
											{config.label}
										</Badge>
									);
								})()}
							</div>
							<p className="text-muted-foreground">
								{readiness.estimatedSessionsNeeded > 0 ? (
									<Trans>About {readiness.estimatedSessionsNeeded} sessions to reach the optimal level</Trans>
								) : (
									<Trans>You are ready for your interview!</Trans>
								)}
							</p>
						</>
					)}
				</div>

				<div className="flex flex-col items-center gap-4">
					<div className="relative">
						<svg className="size-36" viewBox="0 0 100 100">
							<circle className="stroke-muted" strokeWidth="8" fill="none" cx="50" cy="50" r="42" />
							<circle
								className="stroke-primary"
								strokeWidth="8"
								fill="none"
								cx="50"
								cy="50"
								r="42"
								strokeLinecap="round"
								strokeDasharray={`${(readiness?.overallReadiness || 0) * 2.64} 264`}
								transform="rotate(-90 50 50)"
							/>
						</svg>
						<div className="absolute inset-0 flex flex-col items-center justify-center">
							<span className="font-bold text-3xl">{readiness?.overallReadiness || 0}%</span>
							<span className="text-muted-foreground text-sm">Ready</span>
						</div>
					</div>
				</div>
			</div>
		</motion.section>
	);
}

export function AnalyticsTabsHeader() {
	return (
		<TabsList className="grid w-full grid-cols-4">
			<TabsTrigger value="overview" className="gap-2">
				<ChartBarIcon className="size-4" />
				<span className="hidden md:inline">
					<Trans>Overview</Trans>
				</span>
			</TabsTrigger>
			<TabsTrigger value="weaknesses" className="gap-2">
				<WarningCircleIcon className="size-4" />
				<span className="hidden md:inline">
					<Trans>Weaknesses</Trans>
				</span>
			</TabsTrigger>
			<TabsTrigger value="improvements" className="gap-2">
				<TrendUpIcon className="size-4" />
				<span className="hidden md:inline">
					<Trans>Progress</Trans>
				</span>
			</TabsTrigger>
			<TabsTrigger value="plan" className="gap-2">
				<ListBulletsIcon className="size-4" />
				<span className="hidden md:inline">
					<Trans>Action plan</Trans>
				</span>
			</TabsTrigger>
		</TabsList>
	);
}

export function OverviewTab({ readiness, benchmark, patterns }: { readiness: any; benchmark: any; patterns: any }) {
	return (
		<TabsContent value="overview" className="space-y-6">
			<ScoreBreakdown readiness={readiness} />
			{benchmark && <BenchmarkComparison benchmark={benchmark} />}
			{patterns && patterns.questionTypePerformance.length > 0 && <QuestionTypePerformance patterns={patterns} />}
		</TabsContent>
	);
}

function ScoreBreakdown({ readiness }: { readiness: any }) {
	return (
		<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
			<motion.div initial={false} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="flex items-center gap-2 text-sm">
							<BrainIcon className="size-4 text-purple-500" />
							<Trans>Confidence</Trans>
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="font-bold text-2xl">{readiness?.confidence || 0}%</div>
						<Progress value={readiness?.confidence || 0} className="mt-2 h-2" />
					</CardContent>
				</Card>
			</motion.div>

			<motion.div initial={false} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="flex items-center gap-2 text-sm">
							<TargetIcon className="size-4 text-blue-500" />
							<Trans>Technical</Trans>
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="font-bold text-2xl">{readiness?.technicalPreparedness || 0}%</div>
						<Progress value={readiness?.technicalPreparedness || 0} className="mt-2 h-2" />
					</CardContent>
				</Card>
			</motion.div>

			<motion.div initial={false} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="flex items-center gap-2 text-sm">
							<BookOpenIcon className="size-4 text-amber-500" />
							<Trans>Behavioral</Trans>
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="font-bold text-2xl">{readiness?.behavioralReadiness || 0}%</div>
						<Progress value={readiness?.behavioralReadiness || 0} className="mt-2 h-2" />
					</CardContent>
				</Card>
			</motion.div>

			<motion.div initial={false} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="flex items-center gap-2 text-sm">
							<LightbulbIcon className="size-4 text-green-500" />
							<Trans>Communication</Trans>
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="font-bold text-2xl">{readiness?.communicationSkills || 0}%</div>
						<Progress value={readiness?.communicationSkills || 0} className="mt-2 h-2" />
					</CardContent>
				</Card>
			</motion.div>
		</div>
	);
}

function BenchmarkComparison({ benchmark }: { benchmark: any }) {
	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<TrophyIcon className="size-5 text-amber-500" />
					<Trans>Comparison to successful candidates</Trans>
				</CardTitle>
				<CardDescription>
					<Trans>Your performance compared to candidates who passed their interviews</Trans>
				</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="grid gap-6 md:grid-cols-3">
					<div className="text-center">
						<div className="mb-2 font-bold text-3xl text-primary">{benchmark.userScore}%</div>
						<p className="text-muted-foreground text-sm">
							<Trans>Your score</Trans>
						</p>
					</div>
					<div className="text-center">
						<div className="mb-2 font-bold text-3xl text-green-500">{benchmark.successfulCandidateAvg}%</div>
						<p className="text-muted-foreground text-sm">
							<Trans>Successful average</Trans>
						</p>
					</div>
					<div className="text-center">
						<div className="mb-2 font-bold text-3xl text-blue-500">{benchmark.percentile}e</div>
						<p className="text-muted-foreground text-sm">
							<Trans>Percentile</Trans>
						</p>
					</div>
				</div>

				{benchmark.gapsToClose.length > 0 && (
					<div className="mt-6">
						<h4 className="mb-3 font-medium">
							<Trans>Gaps to close</Trans>
						</h4>
						<div className="space-y-2">
							{benchmark.gapsToClose.slice(0, 3).map((gap: any, idx: number) => (
								<div key={idx} className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
									<span className="font-medium">{gap.area}</span>
									<div className="flex items-center gap-3">
										<span className="text-muted-foreground">{gap.userScore}%</span>
										<ArrowRightIcon className="size-4 text-muted-foreground" />
										<span className="text-green-500">{gap.targetScore}%</span>
										<Badge variant="outline" className="text-red-500">
											-{gap.gap}
										</Badge>
									</div>
								</div>
							))}
						</div>
					</div>
				)}
			</CardContent>
		</Card>
	);
}

function QuestionTypePerformance({ patterns }: { patterns: any }) {
	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<ChartBarIcon className="size-5 text-primary" />
					<Trans>Performance by question type</Trans>
				</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="space-y-4">
					{patterns.questionTypePerformance.map((perf: any) => (
						<div key={perf.type} className="space-y-1">
							<div className="flex items-center justify-between">
								<span className="font-medium capitalize">{perf.type}</span>
								<span className="text-muted-foreground">{perf.avgScore}%</span>
							</div>
							<Progress value={perf.avgScore} className="h-3" />
							<p className="text-muted-foreground text-xs">{perf.count} questions answered</p>
						</div>
					))}
				</div>
			</CardContent>
		</Card>
	);
}

export function WeaknessesTab({ summary, weaknesses, patterns }: { summary: any; weaknesses: any; patterns: any }) {
	return (
		<TabsContent value="weaknesses" className="space-y-6">
			<WeaknessSummaryCards summary={summary} />
			<WeaknessCardList weaknesses={weaknesses} />
			{patterns && patterns.commonMistakes.length > 0 && <CommonMistakes patterns={patterns} />}
		</TabsContent>
	);
}

function WeaknessSummaryCards({ summary }: { summary: any }) {
	return (
		<div className="grid gap-4 md:grid-cols-3">
			<Card className="border-red-200 dark:border-red-800">
				<CardHeader className="pb-2">
					<CardTitle className="flex items-center gap-2 text-red-500 text-sm">
						<FireIcon className="size-4" weight="fill" />
						<Trans>Critical</Trans>
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="font-bold text-3xl text-red-500">{summary?.criticalWeaknesses || 0}</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader className="pb-2">
					<CardTitle className="flex items-center gap-2 text-sm">
						<WarningCircleIcon className="size-4 text-amber-500" />
						<Trans>Total</Trans>
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="font-bold text-3xl">{summary?.totalWeaknesses || 0}</div>
				</CardContent>
			</Card>

			<Card className="border-green-200 dark:border-green-800">
				<CardHeader className="pb-2">
					<CardTitle className="flex items-center gap-2 text-green-500 text-sm">
						<TrendUpIcon className="size-4" />
						<Trans>Improving</Trans>
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="font-bold text-3xl text-green-500">{summary?.improvementAreas || 0}</div>
				</CardContent>
			</Card>
		</div>
	);
}

function WeaknessCardList({ weaknesses }: { weaknesses: any }) {
	if (weaknesses && weaknesses.length > 0) {
		return (
			<div className="grid gap-4 md:grid-cols-2">
				{weaknesses.map((weakness: any) => {
					const severity = severityConfig[weakness.severity as keyof typeof severityConfig];
					return (
						<motion.div key={weakness.id} initial={false} animate={{ opacity: 1, scale: 1 }}>
							<Card className={cn("transition-shadow hover:shadow-md", severity.bgColor, "bg-opacity-10")}>
								<CardHeader>
									<div className="flex items-start justify-between">
										<div>
											<CardTitle className="text-lg">{weakness.title}</CardTitle>
											<CardDescription>{weakness.description}</CardDescription>
										</div>
										<Badge className={cn(severity.bgColor, severity.color)}>{severity.label}</Badge>
									</div>
								</CardHeader>
								<CardContent>
									<div className="flex items-center justify-between text-sm">
										<span className="text-muted-foreground">Seen {weakness.occurrenceCount} times</span>
										<span className="text-muted-foreground">Type: {weakness.weaknessType}</span>
									</div>

									{(weakness.suggestedResources as { title: string }[])?.length > 0 && (
										<div className="mt-4">
											<h5 className="mb-2 font-medium text-sm">Suggested resources:</h5>
											<ul className="space-y-1 text-sm">
												{(weakness.suggestedResources as { title: string }[]).slice(0, 2).map((r, idx) => (
													<li key={idx} className="flex items-center gap-2 text-muted-foreground">
														<CheckCircleIcon className="size-3 text-green-500" />
														{r.title}
													</li>
												))}
											</ul>
										</div>
									)}
								</CardContent>
							</Card>
						</motion.div>
					);
				})}
			</div>
		);
	}

	return (
		<Card className="border-dashed">
			<CardContent className="flex flex-col items-center justify-center py-12">
				<CheckCircleIcon className="mb-4 size-12 text-green-500" />
				<h3 className="mb-2 font-semibold text-lg">
					<Trans>No weaknesses identified</Trans>
				</h3>
				<p className="text-center text-muted-foreground">
					<Trans>Complete more sessions to identify areas for improvement</Trans>
				</p>
			</CardContent>
		</Card>
	);
}

function CommonMistakes({ patterns }: { patterns: any }) {
	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<XCircleIcon className="size-5 text-red-500" />
					<Trans>Common mistakes</Trans>
				</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="space-y-3">
					{patterns.commonMistakes.slice(0, 5).map((mistake: any, idx: number) => (
						<div key={idx} className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
							<span className="font-medium">{mistake.pattern}</span>
							<div className="flex items-center gap-3">
								<Badge variant="outline">{mistake.frequency}x</Badge>
								<Badge
									className={cn(
										mistake.severity === "critical"
											? "bg-red-100 text-red-700 dark:bg-red-900/30"
											: mistake.severity === "major"
												? "bg-amber-100 text-amber-700 dark:bg-amber-900/30"
												: "bg-blue-100 text-blue-700 dark:bg-blue-900/30",
									)}
								>
									{mistake.severity}
								</Badge>
							</div>
						</div>
					))}
				</div>
			</CardContent>
		</Card>
	);
}

export function ImprovementsTab({
	timePeriod,
	setTimePeriod,
	improvements,
	patterns,
}: {
	timePeriod: TimePeriod;
	setTimePeriod: (v: TimePeriod) => void;
	improvements: any;
	patterns: any;
}) {
	return (
		<TabsContent value="improvements" className="space-y-6">
			<div className="flex items-center justify-between">
				<h3 className="font-semibold text-lg">
					<Trans>Score evolution</Trans>
				</h3>
				<Select value={timePeriod} onValueChange={(v) => setTimePeriod(v as TimePeriod)}>
					<SelectTrigger className="w-40">
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="weekly">This week</SelectItem>
						<SelectItem value="monthly">This month</SelectItem>
						<SelectItem value="all_time">All time</SelectItem>
					</SelectContent>
				</Select>
			</div>

			<ImprovementCardList improvements={improvements} />
			{patterns && patterns.strengthPatterns.length > 0 && <StrengthPatterns patterns={patterns} />}
		</TabsContent>
	);
}

function ImprovementCardList({ improvements }: { improvements: any }) {
	if (improvements && improvements.length > 0) {
		return (
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
				{improvements.map((imp: any, idx: number) => {
					const trend = trendIcons[imp.trend as keyof typeof trendIcons];
					const TrendIcon = trend.icon;
					const isPositive = imp.improvementPercentage > 0;

					return (
						<motion.div key={idx} initial={false} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}>
							<Card>
								<CardHeader className="pb-2">
									<CardTitle className="flex items-center justify-between text-base">
										<span>{imp.skillArea}</span>
										<TrendIcon className={cn("size-5", trend.color)} weight="bold" />
									</CardTitle>
								</CardHeader>
								<CardContent>
									<div className="flex items-center gap-4">
										<div className="text-center">
											<div className="text-lg text-muted-foreground">{imp.previousScore}%</div>
											<span className="text-muted-foreground text-xs">Before</span>
										</div>
										<div className="flex-1">
											<ArrowRightIcon className="mx-auto size-5 text-muted-foreground" />
										</div>
										<div className="text-center">
											<div className="font-bold text-lg text-primary">{imp.currentScore}%</div>
											<span className="text-muted-foreground text-xs">Now</span>
										</div>
										<Badge
											className={cn(
												isPositive
													? "bg-green-100 text-green-700 dark:bg-green-900/30"
													: "bg-red-100 text-red-700 dark:bg-red-900/30",
											)}
										>
											{isPositive ? <ArrowUpIcon className="mr-1 size-3" /> : <ArrowDownIcon className="mr-1 size-3" />}
											{Math.abs(imp.improvementPercentage)}%
										</Badge>
									</div>
									<p className="mt-2 text-muted-foreground text-xs">{imp.sessionsCount} sessions completed</p>
								</CardContent>
							</Card>
						</motion.div>
					);
				})}
			</div>
		);
	}

	return (
		<Card className="border-dashed">
			<CardContent className="flex flex-col items-center justify-center py-12">
				<ChartLineUpIcon className="mb-4 size-12 text-muted-foreground" />
				<h3 className="mb-2 font-semibold text-lg">
					<Trans>No data yet</Trans>
				</h3>
				<p className="text-center text-muted-foreground">
					<Trans>Complete multiple sessions to see your progress</Trans>
				</p>
				<Link to="/dashboard/interview" className="mt-4">
					<Button>
						<Trans>Start a session</Trans>
					</Button>
				</Link>
			</CardContent>
		</Card>
	);
}

function StrengthPatterns({ patterns }: { patterns: any }) {
	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<TrophyIcon className="size-5 text-amber-500" />
					<Trans>Your strengths</Trans>
				</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="flex flex-wrap gap-2">
					{patterns.strengthPatterns.map((strength: any, idx: number) => (
						<Badge key={idx} variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/30">
							{strength.pattern} ({strength.frequency}x)
						</Badge>
					))}
				</div>
			</CardContent>
		</Card>
	);
}

export function ImprovementPlanTab({
	isLoadingPlan,
	improvementPlan,
}: {
	isLoadingPlan: boolean;
	improvementPlan: any;
}) {
	return (
		<TabsContent value="plan" className="space-y-6">
			{isLoadingPlan ? (
				<div className="flex items-center justify-center py-12">
					<motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
						<ArrowClockwiseIcon className="size-8 text-primary" />
					</motion.div>
				</div>
			) : improvementPlan ? (
				<>
					{improvementPlan.priorityAreas.length > 0 && <PriorityAreas priorityAreas={improvementPlan.priorityAreas} />}
					{improvementPlan.weeklyGoals.length > 0 && <WeeklyGoals weeklyGoals={improvementPlan.weeklyGoals} />}
					{improvementPlan.practiceSchedule.length > 0 && (
						<PracticeSchedule practiceSchedule={improvementPlan.practiceSchedule} />
					)}
					{improvementPlan.milestones.length > 0 && <Milestones milestones={improvementPlan.milestones} />}
					<EstimatedTimeCard estimatedTimeToGoal={improvementPlan.estimatedTimeToGoal} />
				</>
			) : (
				<Card className="border-dashed">
					<CardContent className="flex flex-col items-center justify-center py-12">
						<BrainIcon className="mb-4 size-12 text-muted-foreground" />
						<h3 className="mb-2 font-semibold text-lg">
							<Trans>Generate your personalized plan</Trans>
						</h3>
						<p className="text-center text-muted-foreground">
							<Trans>Complete a few sessions to generate a tailored improvement plan</Trans>
						</p>
					</CardContent>
				</Card>
			)}
		</TabsContent>
	);
}

function PriorityAreas({ priorityAreas }: { priorityAreas: any[] }) {
	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<TargetIcon className="size-5 text-primary" />
					<Trans>Priority areas</Trans>
				</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="space-y-4">
					{priorityAreas.map((area: any, idx: number) => (
						<div key={idx} className="space-y-2">
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-2">
									<span className="font-medium">{area.area}</span>
									<Badge
										className={cn(
											area.priority === "high"
												? "bg-red-100 text-red-700"
												: area.priority === "medium"
													? "bg-amber-100 text-amber-700"
													: "bg-blue-100 text-blue-700",
										)}
									>
										{area.priority === "high" ? "High" : area.priority === "medium" ? "Medium" : "Low"}
									</Badge>
								</div>
								<span className="text-muted-foreground text-sm">
									{area.currentScore}% / {area.targetScore}%
								</span>
							</div>
							<Progress value={(area.currentScore / area.targetScore) * 100} className="h-2" />
						</div>
					))}
				</div>
			</CardContent>
		</Card>
	);
}

function WeeklyGoals({ weeklyGoals }: { weeklyGoals: any[] }) {
	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<ClockIcon className="size-5 text-blue-500" />
					<Trans>Weekly goals</Trans>
				</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="grid gap-4 md:grid-cols-2">
					{weeklyGoals.map((week: any) => (
						<div key={week.week} className="rounded-lg border p-4">
							<h4 className="mb-3 font-medium">
								Week {week.week}: {week.focusArea}
							</h4>
							<ul className="space-y-2">
								{week.goals.map((goal: string, idx: number) => (
									<li key={idx} className="flex items-start gap-2 text-muted-foreground text-sm">
										<CheckCircleIcon className="mt-0.5 size-4 shrink-0 text-green-500" />
										{goal}
									</li>
								))}
							</ul>
						</div>
					))}
				</div>
			</CardContent>
		</Card>
	);
}

function PracticeSchedule({ practiceSchedule }: { practiceSchedule: any[] }) {
	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<BookOpenIcon className="size-5 text-amber-500" />
					<Trans>Practice program</Trans>
				</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
					{practiceSchedule.map((schedule: any, idx: number) => (
						<div key={idx} className="rounded-lg bg-muted/50 p-4 text-center">
							<div className="mb-2 font-semibold">{schedule.day}</div>
							<div className="mb-1 text-primary text-sm">{schedule.activity}</div>
							<div className="text-muted-foreground text-xs">{schedule.duration} min</div>
							<Badge variant="outline" className="mt-2 text-xs">
								{schedule.focusArea}
							</Badge>
						</div>
					))}
				</div>
			</CardContent>
		</Card>
	);
}

function Milestones({ milestones }: { milestones: any[] }) {
	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<TrophyIcon className="size-5 text-amber-500" />
					<Trans>Milestones</Trans>
				</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="space-y-4">
					{milestones.map((milestone: any, idx: number) => (
						<div key={idx} className="flex items-start gap-4 border-primary border-l-2 pl-4">
							<div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 font-medium text-primary text-sm">
								{idx + 1}
							</div>
							<div>
								<h4 className="font-medium">{milestone.milestone}</h4>
								<p className="text-muted-foreground text-sm">{milestone.criteria}</p>
								<Badge variant="outline" className="mt-2 text-xs">
									{new Date(milestone.targetDate).toLocaleDateString("fr-FR")}
								</Badge>
							</div>
						</div>
					))}
				</div>
			</CardContent>
		</Card>
	);
}

function EstimatedTimeCard({ estimatedTimeToGoal }: { estimatedTimeToGoal: number }) {
	return (
		<Card className="bg-gradient-to-br from-primary/10 to-primary/5">
			<CardContent className="flex items-center justify-between py-6">
				<div>
					<h4 className="font-semibold text-lg">
						<Trans>Estimated time to reach your goals</Trans>
					</h4>
					<p className="text-muted-foreground">
						<Trans>By following the recommended practice plan</Trans>
					</p>
				</div>
				<div className="text-center">
					<div className="font-bold text-3xl text-primary">{estimatedTimeToGoal}</div>
					<span className="text-muted-foreground">days</span>
				</div>
			</CardContent>
		</Card>
	);
}

export function RecommendationsSection({ readiness }: { readiness: any }) {
	if (!readiness || readiness.recommendations.length === 0) return null;

	return (
		<section className="mt-8">
			<h3 className="mb-4 flex items-center gap-2 font-semibold text-xl">
				<LightbulbIcon className="size-5 text-amber-500" weight="fill" />
				<Trans>Recommendations</Trans>
			</h3>
			<div className="grid gap-3 md:grid-cols-2">
				{readiness.recommendations.map((rec: string, idx: number) => (
					<motion.div key={idx} initial={false} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.1 }}>
						<Card className="h-full">
							<CardContent className="flex items-center gap-3 py-4">
								<CheckCircleIcon className="size-5 shrink-0 text-green-500" />
								<span>{rec}</span>
							</CardContent>
						</Card>
					</motion.div>
				))}
			</div>
		</section>
	);
}

export function PracticeNowCta() {
	return (
		<div className="mt-8 flex justify-center">
			<Link to="/dashboard/interview">
				<Button size="lg" className="gap-2">
					<Trans>Practice now</Trans>
					<ArrowRightIcon className="size-4" />
				</Button>
			</Link>
		</div>
	);
}
