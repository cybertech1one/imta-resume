import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import {
	ArrowDownIcon,
	ArrowRightIcon,
	ArrowUpIcon,
	BookOpenIcon,
	ChartBarIcon,
	CheckCircleIcon,
	ClockIcon,
	DownloadSimpleIcon,
	EyeIcon,
	FileTextIcon,
	GraduationCapIcon,
	LightbulbIcon,
	ListChecksIcon,
	MagnifyingGlassIcon,
	PaletteIcon,
	PlusIcon,
	RocketLaunchIcon,
	SparkleIcon,
	StarIcon,
	TargetIcon,
	TrendUpIcon,
	WarningCircleIcon,
	XCircleIcon,
} from "@phosphor-icons/react";
import { motion } from "motion/react";
import {
	Legend,
	PolarAngleAxis,
	PolarGrid,
	PolarRadiusAxis,
	Radar,
	RadarChart,
	Tooltip as RechartsTooltip,
	ResponsiveContainer,
} from "recharts";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/utils/style";

import { DashboardHeader } from "../../-components/header";
import type {
	ATSCheckItem,
	BeforeAfterComparison,
	ContentCompletenessData,
	ImprovementSuggestion,
	IndustryBenchmark,
	RadarDataPoint,
	ReadabilityScoreData,
	ScoringResultForExport,
	SectionScore,
	VisualAppealScoreData,
} from "./scoring-types";

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

export function getScoreColor(score: number): string {
	if (score >= 85) return "text-green-600 dark:text-green-400";
	if (score >= 70) return "text-blue-600 dark:text-blue-400";
	if (score >= 50) return "text-amber-600 dark:text-amber-400";
	return "text-red-600 dark:text-red-400";
}

function getScoreBgColor(score: number): string {
	if (score >= 85) return "bg-green-100 dark:bg-green-900/30";
	if (score >= 70) return "bg-blue-100 dark:bg-blue-900/30";
	if (score >= 50) return "bg-amber-100 dark:bg-amber-900/30";
	return "bg-red-100 dark:bg-red-900/30";
}

function getStatusIcon(status: SectionScore["status"]) {
	switch (status) {
		case "excellent":
			return <CheckCircleIcon className="size-5 text-green-600" weight="fill" />;
		case "good":
			return <CheckCircleIcon className="size-5 text-blue-600" weight="fill" />;
		case "needs-improvement":
			return <WarningCircleIcon className="size-5 text-amber-600" weight="fill" />;
		case "missing":
			return <XCircleIcon className="size-5 text-red-600" weight="fill" />;
	}
}

function getImpactBadge(impact: "high" | "medium" | "low") {
	switch (impact) {
		case "high":
			return <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">High impact</Badge>;
		case "medium":
			return (
				<Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">Medium impact</Badge>
			);
		case "low":
			return <Badge className="bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400">Low impact</Badge>;
	}
}

function getEffortBadge(effort: "easy" | "medium" | "hard") {
	switch (effort) {
		case "easy":
			return (
				<Badge variant="outline" className="border-green-500 text-green-600">
					Easy
				</Badge>
			);
		case "medium":
			return (
				<Badge variant="outline" className="border-amber-500 text-amber-600">
					Medium
				</Badge>
			);
		case "hard":
			return (
				<Badge variant="outline" className="border-red-500 text-red-600">
					Hard
				</Badge>
			);
	}
}

// =============================================================================
// CIRCULAR PROGRESS COMPONENT
// =============================================================================

export function CircularProgress({
	score,
	size = 200,
	strokeWidth = 12,
}: {
	score: number;
	size?: number;
	strokeWidth?: number;
}) {
	const radius = (size - strokeWidth) / 2;
	const circumference = radius * 2 * Math.PI;
	const offset = circumference - (score / 100) * circumference;
	const center = size / 2;

	return (
		<div className="relative" style={{ width: size, height: size }}>
			<svg width={size} height={size} className="-rotate-90">
				{/* Background circle */}
				<circle cx={center} cy={center} r={radius} fill="none" stroke="hsl(var(--muted))" strokeWidth={strokeWidth} />
				{/* Progress circle */}
				<motion.circle
					cx={center}
					cy={center}
					r={radius}
					fill="none"
					stroke={score >= 85 ? "#22c55e" : score >= 70 ? "#3b82f6" : score >= 50 ? "#f59e0b" : "#ef4444"}
					strokeWidth={strokeWidth}
					strokeLinecap="round"
					strokeDasharray={circumference}
					initial={{ strokeDashoffset: circumference }}
					animate={{ strokeDashoffset: offset }}
					transition={{ duration: 1.5, ease: "easeOut" }}
				/>
			</svg>
			<div className="absolute inset-0 flex flex-col items-center justify-center">
				<motion.span
					className={cn("font-bold text-5xl", getScoreColor(score))}
					initial={false}
					animate={{ opacity: 1, scale: 1 }}
					transition={{ delay: 0.5, duration: 0.5 }}
				>
					{score}
				</motion.span>
				<span className="text-muted-foreground text-sm">out of 100</span>
			</div>
		</div>
	);
}

// =============================================================================
// SECTION SCORE CARD COMPONENT
// =============================================================================

export function SectionScoreCard({ section, index }: { section: SectionScore; index: number }) {
	return (
		<motion.div initial={false} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.05 }}>
			<Card className="transition-all hover:shadow-md">
				<CardContent className="p-4">
					<div className="mb-3 flex items-center justify-between">
						<div className="flex items-center gap-3">
							{getStatusIcon(section.status)}
							<span className="font-medium">{section.name}</span>
						</div>
						<span className={cn("font-bold text-lg", getScoreColor(section.score))}>{section.score}%</span>
					</div>
					<Progress value={section.score} className="mb-2 h-2" />
					<p className="text-muted-foreground text-sm">{section.feedback}</p>
				</CardContent>
			</Card>
		</motion.div>
	);
}

// =============================================================================
// ATS CHECKLIST COMPONENT
// =============================================================================

export function ATSChecklist({ items }: { items: ATSCheckItem[] }) {
	const passedCount = items.filter((item) => item.passed).length;
	const score = Math.round((passedCount / items.length) * 100);

	return (
		<Card>
			<CardHeader>
				<div className="flex items-center justify-between">
					<div>
						<CardTitle className="flex items-center gap-2">
							<MagnifyingGlassIcon className="size-5 text-primary" weight="duotone" />
							<Trans>ATS Compatibility</Trans>
						</CardTitle>
						<CardDescription>
							<Trans>Checking compatibility with applicant tracking systems</Trans>
						</CardDescription>
					</div>
					<div className="text-right">
						<p className={cn("font-bold text-3xl", getScoreColor(score))}>{score}%</p>
						<p className="text-muted-foreground text-sm">
							{passedCount}/{items.length} criteria
						</p>
					</div>
				</div>
			</CardHeader>
			<CardContent>
				<ScrollArea className="h-80">
					<div className="space-y-3">
						{items.map((item, index) => (
							<motion.div
								key={item.id}
								initial={false}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: index * 0.03 }}
								className={cn(
									"flex items-start gap-3 rounded-lg border p-3 transition-all",
									item.passed
										? "border-green-200 bg-green-50/50 dark:border-green-900/50 dark:bg-green-950/20"
										: "border-red-200 bg-red-50/50 dark:border-red-900/50 dark:bg-red-950/20",
								)}
							>
								{item.passed ? (
									<CheckCircleIcon className="mt-0.5 size-5 shrink-0 text-green-600" weight="fill" />
								) : (
									<XCircleIcon className="mt-0.5 size-5 shrink-0 text-red-600" weight="fill" />
								)}
								<div className="min-w-0 flex-1">
									<div className="flex items-center gap-2">
										<span
											className={cn(
												"text-sm",
												item.passed ? "text-green-700 dark:text-green-400" : "text-red-700 dark:text-red-400",
											)}
										>
											{item.label}
										</span>
										{getImpactBadge(item.impact)}
									</div>
									{item.suggestion && <p className="mt-1 text-muted-foreground text-xs">{item.suggestion}</p>}
								</div>
							</motion.div>
						))}
					</div>
				</ScrollArea>
			</CardContent>
		</Card>
	);
}

// =============================================================================
// READABILITY SCORE COMPONENT
// =============================================================================

export function ReadabilityScore({ data }: { data: ReadabilityScoreData }) {
	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<BookOpenIcon className="size-5 text-primary" weight="duotone" />
					<Trans>Readability Score</Trans>
				</CardTitle>
				<CardDescription>
					<Trans>Analysis of your resume's readability</Trans>
				</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="mb-6 flex items-center justify-between">
					<div>
						<p className={cn("font-bold text-4xl", getScoreColor(data.score))}>{data.score}</p>
						<p className="text-muted-foreground text-sm">{data.gradeLevel}</p>
					</div>
					<div className={cn("flex size-20 items-center justify-center rounded-full", getScoreBgColor(data.score))}>
						<GraduationCapIcon className={cn("size-10", getScoreColor(data.score))} weight="duotone" />
					</div>
				</div>

				<div className="space-y-4">
					<div className="flex items-center justify-between">
						<span className="text-muted-foreground text-sm">Average sentence length</span>
						<span className="font-medium">{data.avgSentenceLength} words</span>
					</div>
					<Separator />
					<div className="flex items-center justify-between">
						<span className="text-muted-foreground text-sm">Complex words</span>
						<span className="font-medium">{data.complexWords}%</span>
					</div>
					<Separator />
					<div className="flex items-center justify-between">
						<span className="text-muted-foreground text-sm">Passive voice</span>
						<span className="font-medium">{data.passiveVoice}%</span>
					</div>
				</div>

				<Card className="mt-4 border-primary/30 bg-primary/5">
					<CardContent className="flex items-start gap-3 p-4">
						<LightbulbIcon className="mt-0.5 size-5 shrink-0 text-primary" weight="fill" />
						<p className="text-sm">{data.feedback}</p>
					</CardContent>
				</Card>
			</CardContent>
		</Card>
	);
}

// =============================================================================
// VISUAL APPEAL SCORE COMPONENT
// =============================================================================

export function VisualAppealScore({ data }: { data: VisualAppealScoreData }) {
	const metrics = [
		{ name: "Balance", value: data.balance },
		{ name: "Whitespace", value: data.whitespace },
		{ name: "Consistency", value: data.consistency },
		{ name: "Hierarchy", value: data.hierarchy },
	];

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<PaletteIcon className="size-5 text-primary" weight="duotone" />
					<Trans>Visual Appeal</Trans>
				</CardTitle>
				<CardDescription>
					<Trans>Evaluation of your resume's appearance and design</Trans>
				</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="mb-6 flex items-center justify-between">
					<div>
						<p className={cn("font-bold text-4xl", getScoreColor(data.score))}>{data.score}</p>
						<p className="text-muted-foreground text-sm">Visual score</p>
					</div>
					<div className={cn("flex size-20 items-center justify-center rounded-full", getScoreBgColor(data.score))}>
						<EyeIcon className={cn("size-10", getScoreColor(data.score))} weight="duotone" />
					</div>
				</div>

				<div className="space-y-4">
					{metrics.map((metric, index) => (
						<motion.div
							key={metric.name}
							initial={false}
							animate={{ opacity: 1, x: 0 }}
							transition={{ delay: index * 0.1 }}
							className="space-y-2"
						>
							<div className="flex items-center justify-between text-sm">
								<span className="text-muted-foreground">{metric.name}</span>
								<span className={cn("font-semibold", getScoreColor(metric.value))}>{metric.value}%</span>
							</div>
							<Progress value={metric.value} className="h-2" />
						</motion.div>
					))}
				</div>

				<Card className="mt-4 border-primary/30 bg-primary/5">
					<CardContent className="flex items-start gap-3 p-4">
						<SparkleIcon className="mt-0.5 size-5 shrink-0 text-primary" weight="fill" />
						<p className="text-sm">{data.feedback}</p>
					</CardContent>
				</Card>
			</CardContent>
		</Card>
	);
}

// =============================================================================
// CONTENT COMPLETENESS COMPONENT
// =============================================================================

export function ContentCompleteness({ data }: { data: ContentCompletenessData }) {
	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<ListChecksIcon className="size-5 text-primary" weight="duotone" />
					<Trans>Content Completeness</Trans>
				</CardTitle>
				<CardDescription>
					<Trans>Checking for the presence of all important sections</Trans>
				</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="mb-6 flex items-center justify-between">
					<div>
						<p className={cn("font-bold text-4xl", getScoreColor(data.score))}>{data.score}%</p>
						<p className="text-muted-foreground text-sm">
							{data.filledSections}/{data.totalSections} sections
						</p>
					</div>
					<div className={cn("flex size-20 items-center justify-center rounded-full", getScoreBgColor(data.score))}>
						<FileTextIcon className={cn("size-10", getScoreColor(data.score))} weight="duotone" />
					</div>
				</div>

				{data.missingCritical.length > 0 && (
					<div className="mb-4">
						<p className="mb-2 font-medium text-sm">Critical missing sections:</p>
						<div className="flex flex-wrap gap-2">
							{data.missingCritical.map((section) => (
								<Badge key={section} variant="destructive" className="gap-1">
									<XCircleIcon className="size-3" />
									{section}
								</Badge>
							))}
						</div>
					</div>
				)}

				<div className="space-y-2">
					<p className="font-medium text-sm">Recommendations:</p>
					{data.recommendations.map((rec, index) => (
						<div key={index} className="flex items-start gap-2 text-sm">
							<ArrowRightIcon className="mt-0.5 size-4 shrink-0 text-primary" />
							<span className="text-muted-foreground">{rec}</span>
						</div>
					))}
				</div>
			</CardContent>
		</Card>
	);
}

// =============================================================================
// IMPROVEMENT SUGGESTIONS COMPONENT
// =============================================================================

export function ImprovementSuggestions({ suggestions }: { suggestions: ImprovementSuggestion[] }) {
	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<RocketLaunchIcon className="size-5 text-primary" weight="duotone" />
					<Trans>Improvement Suggestions</Trans>
				</CardTitle>
				<CardDescription>
					<Trans>Recommended actions to improve your score</Trans>
				</CardDescription>
			</CardHeader>
			<CardContent>
				<ScrollArea className="h-96">
					<div className="space-y-4">
						{suggestions.map((suggestion, index) => (
							<motion.div
								key={suggestion.id}
								initial={false}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: index * 0.05 }}
							>
								<Card className="transition-all hover:shadow-md">
									<CardContent className="p-4">
										<div className="mb-2 flex items-start justify-between gap-2">
											<div>
												<Badge variant="outline" className="mb-2">
													{suggestion.category}
												</Badge>
												<h4 className="font-medium">{suggestion.title}</h4>
											</div>
											<div className="flex flex-col items-end gap-1">
												{getImpactBadge(suggestion.impact)}
												{getEffortBadge(suggestion.effort)}
											</div>
										</div>
										<p className="text-muted-foreground text-sm">{suggestion.description}</p>
									</CardContent>
								</Card>
							</motion.div>
						))}
					</div>
				</ScrollArea>
			</CardContent>
		</Card>
	);
}

// =============================================================================
// INDUSTRY BENCHMARKS COMPONENT
// =============================================================================

export function IndustryBenchmarks({
	benchmarks,
	selectedIndustry,
	onSelectIndustry,
}: {
	benchmarks: IndustryBenchmark[];
	selectedIndustry: string;
	onSelectIndustry: (industry: string) => void;
}) {
	const selected = benchmarks.find((b) => b.industry === selectedIndustry) || benchmarks[0];

	return (
		<Card>
			<CardHeader>
				<div className="flex flex-wrap items-center justify-between gap-4">
					<div>
						<CardTitle className="flex items-center gap-2">
							<ChartBarIcon className="size-5 text-primary" weight="duotone" />
							<Trans>Industry Comparison</Trans>
						</CardTitle>
						<CardDescription>
							<Trans>Compare your score to industry standards</Trans>
						</CardDescription>
					</div>
					<Select value={selectedIndustry} onValueChange={onSelectIndustry}>
						<SelectTrigger className="w-48">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							{benchmarks.map((b) => (
								<SelectItem key={b.industry} value={b.industry}>
									{b.industry}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
			</CardHeader>
			<CardContent>
				<div className="mb-6 grid gap-4 md:grid-cols-3">
					<Card className="border-blue-500/30 bg-blue-50/50 dark:bg-blue-950/20">
						<CardContent className="p-4 text-center">
							<p className="text-muted-foreground text-sm">Industry average</p>
							<p className="font-bold text-2xl text-blue-600">{selected.avgScore}%</p>
						</CardContent>
					</Card>
					<Card className="border-green-500/30 bg-green-50/50 dark:bg-green-950/20">
						<CardContent className="p-4 text-center">
							<p className="text-muted-foreground text-sm">Your score</p>
							<p className="font-bold text-2xl text-green-600">{selected.yourScore}%</p>
						</CardContent>
					</Card>
					<Card className="border-amber-500/30 bg-amber-50/50 dark:bg-amber-950/20">
						<CardContent className="p-4 text-center">
							<p className="text-muted-foreground text-sm">Top performers</p>
							<p className="font-bold text-2xl text-amber-600">{selected.topScore}%</p>
						</CardContent>
					</Card>
				</div>

				<div className="space-y-4">
					<div className="relative h-8 overflow-hidden rounded-full bg-muted">
						{/* Average marker */}
						<div className="absolute top-0 z-10 h-full w-1 bg-blue-500" style={{ left: `${selected.avgScore}%` }}>
							<Tooltip>
								<TooltipTrigger asChild>
									<div className="absolute -top-1 left-1/2 size-3 -translate-x-1/2 rounded-full bg-blue-500" />
								</TooltipTrigger>
								<TooltipContent>Moyenne: {selected.avgScore}%</TooltipContent>
							</Tooltip>
						</div>
						{/* Top marker */}
						<div className="absolute top-0 z-10 h-full w-1 bg-amber-500" style={{ left: `${selected.topScore}%` }}>
							<Tooltip>
								<TooltipTrigger asChild>
									<div className="absolute -top-1 left-1/2 size-3 -translate-x-1/2 rounded-full bg-amber-500" />
								</TooltipTrigger>
								<TooltipContent>Top: {selected.topScore}%</TooltipContent>
							</Tooltip>
						</div>
						{/* Your score bar */}
						<motion.div
							className="h-full rounded-full bg-gradient-to-r from-green-400 to-green-500"
							initial={{ width: 0 }}
							animate={{ width: `${selected.yourScore}%` }}
							transition={{ duration: 1, ease: "easeOut" }}
						/>
					</div>

					<div className="flex items-center justify-between">
						<span className="text-muted-foreground text-sm">0%</span>
						<div className="flex items-center gap-2">
							<Badge variant="outline" className="gap-1">
								<TrendUpIcon className="size-3" />
								Top {100 - selected.percentile}%
							</Badge>
						</div>
						<span className="text-muted-foreground text-sm">100%</span>
					</div>
				</div>

				<Card className="mt-4 border-primary/30 bg-primary/5">
					<CardContent className="flex items-start gap-3 p-4">
						<TargetIcon className="mt-0.5 size-5 shrink-0 text-primary" weight="fill" />
						<p className="text-sm">
							{selected.yourScore > selected.avgScore
								? `Excellent! Your score is ${selected.yourScore - selected.avgScore} points above the ${selected.industry} industry average.`
								: `Your score is ${selected.avgScore - selected.yourScore} points below the industry average. Check the improvement suggestions.`}
						</p>
					</CardContent>
				</Card>
			</CardContent>
		</Card>
	);
}

// =============================================================================
// RADAR CHART COMPONENT
// =============================================================================

export function ScoreRadarChart({ data }: { data: RadarDataPoint[] }) {
	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<TargetIcon className="size-5 text-primary" weight="duotone" />
					<Trans>Dimensions Overview</Trans>
				</CardTitle>
				<CardDescription>
					<Trans>Radar visualization of all evaluated dimensions</Trans>
				</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="h-80">
					<ResponsiveContainer width="100%" height="100%">
						<RadarChart data={data} cx="50%" cy="50%" outerRadius="80%">
							<PolarGrid stroke="hsl(var(--border))" />
							<PolarAngleAxis dataKey="dimension" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
							<PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10 }} />
							<Radar
								name="Your score"
								dataKey="score"
								stroke="#6366f1"
								fill="#6366f1"
								fillOpacity={0.3}
								strokeWidth={2}
							/>
							<RechartsTooltip
								contentStyle={{
									backgroundColor: "hsl(var(--card))",
									border: "1px solid hsl(var(--border))",
									borderRadius: "8px",
								}}
							/>
							<Legend />
						</RadarChart>
					</ResponsiveContainer>
				</div>
			</CardContent>
		</Card>
	);
}

// =============================================================================
// BEFORE/AFTER COMPARISON COMPONENT
// =============================================================================

export function BeforeAfterComparisonComponent({ data }: { data: BeforeAfterComparison[] }) {
	if (data.length === 0) {
		return (
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<ClockIcon className="size-5 text-primary" weight="duotone" />
						<Trans>Before/After Comparison</Trans>
					</CardTitle>
					<CardDescription>
						<Trans>Score evolution since last modifications</Trans>
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="flex flex-col items-center justify-center py-12 text-center">
						<ClockIcon className="mb-4 size-12 text-muted-foreground" weight="duotone" />
						<p className="text-muted-foreground">
							<Trans>Not enough data to display history.</Trans>
						</p>
						<p className="text-muted-foreground text-sm">
							<Trans>Analyze your resume multiple times to see your progress.</Trans>
						</p>
					</div>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<ClockIcon className="size-5 text-primary" weight="duotone" />
					<Trans>Before/After Comparison</Trans>
				</CardTitle>
				<CardDescription>
					<Trans>Score evolution since last modifications</Trans>
				</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="space-y-4">
					{data.map((item, index) => (
						<motion.div
							key={item.metric}
							initial={false}
							animate={{ opacity: 1, x: 0 }}
							transition={{ delay: index * 0.1 }}
							className="space-y-2"
						>
							<div className="flex items-center justify-between">
								<span className="font-medium">{item.metric}</span>
								<div className="flex items-center gap-3">
									<span className="text-muted-foreground text-sm">{item.before}%</span>
									<ArrowRightIcon className="size-4 text-muted-foreground" />
									<span className={cn("font-bold", getScoreColor(item.after))}>{item.after}%</span>
									<Badge
										className={cn(
											"gap-1",
											item.improvement > 0
												? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
												: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
										)}
									>
										{item.improvement > 0 ? <ArrowUpIcon className="size-3" /> : <ArrowDownIcon className="size-3" />}
										{Math.abs(item.improvement)}%
									</Badge>
								</div>
							</div>
							<div className="relative h-3 overflow-hidden rounded-full bg-muted">
								<div className="absolute h-full rounded-full bg-gray-400/50" style={{ width: `${item.before}%` }} />
								<motion.div
									className="absolute h-full rounded-full bg-gradient-to-r from-primary to-primary/80"
									initial={{ width: `${item.before}%` }}
									animate={{ width: `${item.after}%` }}
									transition={{ duration: 1, delay: index * 0.1 }}
								/>
							</div>
						</motion.div>
					))}
				</div>

				<Card className="mt-6 border-green-500/30 bg-green-50/50 dark:bg-green-950/20">
					<CardContent className="flex items-center gap-4 p-4">
						<div className="flex size-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
							<TrendUpIcon className="size-6 text-green-600" weight="fill" />
						</div>
						<div>
							<p className="font-bold text-2xl text-green-600">
								+{Math.round(data.reduce((acc, d) => acc + d.improvement, 0) / data.length)}%
							</p>
							<p className="text-muted-foreground text-sm">Average improvement</p>
						</div>
					</CardContent>
				</Card>
			</CardContent>
		</Card>
	);
}

// =============================================================================
// EXPORT REPORT COMPONENT
// =============================================================================

export function ExportReport({ scoringResult }: { scoringResult: ScoringResultForExport | null }) {
	const handleExport = () => {
		if (!scoringResult) return;

		const report = {
			generatedAt: new Date().toISOString(),
			overallScore: scoringResult.overallScore,
			sectionScores: scoringResult.sectionScores,
			atsScore: scoringResult.atsScore,
			readabilityScore: scoringResult.readabilityScore?.score ?? 0,
			visualScore: scoringResult.visualAppealScore?.score ?? 0,
			completenessScore: scoringResult.contentCompleteness?.score ?? 0,
			suggestions: scoringResult.improvementSuggestions,
			radarData: scoringResult.radarData,
		};

		const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = `resume-score-report-${new Date().toISOString().split("T")[0]}.json`;
		a.click();
		URL.revokeObjectURL(url);
	};

	return (
		<Card className="border-primary/30 border-dashed bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5">
			<CardContent className="flex flex-col items-center gap-4 p-6 md:flex-row">
				<div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-primary/20">
					<DownloadSimpleIcon className="size-7 text-primary" weight="duotone" />
				</div>
				<div className="flex-1 text-center md:text-left">
					<h3 className="mb-1 font-semibold text-lg">
						<Trans>Export Score Report</Trans>
					</h3>
					<p className="text-muted-foreground text-sm">
						<Trans>Download a complete evaluation report of your resume for your records.</Trans>
					</p>
				</div>
				<Button onClick={handleExport} className="gap-2" disabled={!scoringResult}>
					<DownloadSimpleIcon className="size-4" />
					<Trans>Download Report</Trans>
				</Button>
			</CardContent>
		</Card>
	);
}

// =============================================================================
// LOADING SKELETON COMPONENT
// =============================================================================

export function LoadingSkeleton() {
	return (
		<div className="space-y-8">
			<Skeleton className="h-10 w-64" />
			<div className="rounded-3xl border border-primary/20 p-8">
				<div className="flex flex-col items-center gap-8 md:flex-row md:justify-between">
					<div className="flex flex-col items-center md:flex-row md:gap-8">
						<Skeleton className="size-[200px] rounded-full" />
						<div className="mt-4 space-y-2 md:mt-0">
							<Skeleton className="h-10 w-80" />
							<Skeleton className="h-6 w-96" />
						</div>
					</div>
					<div className="grid grid-cols-2 gap-4 md:grid-cols-4">
						{[1, 2, 3, 4].map((i) => (
							<Skeleton key={i} className="h-24 w-24 rounded-lg" />
						))}
					</div>
				</div>
			</div>
			<Skeleton className="h-12 w-full" />
			<div className="grid gap-6 lg:grid-cols-2">
				<Skeleton className="h-96" />
				<Skeleton className="h-96" />
			</div>
		</div>
	);
}

// =============================================================================
// EMPTY STATE COMPONENT
// =============================================================================

export function EmptyState({ onCreateScoring }: { onCreateScoring: () => void }) {
	return (
		<div className="space-y-8">
			<DashboardHeader icon={StarIcon} title={t`Resume Evaluation`} />
			<Card className="border-dashed">
				<CardContent className="flex flex-col items-center justify-center py-16 text-center">
					<div className="mb-6 flex size-20 items-center justify-center rounded-full bg-primary/10">
						<StarIcon className="size-10 text-primary" weight="duotone" />
					</div>
					<h3 className="mb-2 font-semibold text-xl">
						<Trans>No evaluations available</Trans>
					</h3>
					<p className="mb-6 max-w-md text-muted-foreground">
						<Trans>Start your first resume evaluation to get a detailed score and personalized recommendations.</Trans>
					</p>
					<Button onClick={onCreateScoring} className="gap-2">
						<PlusIcon className="size-4" />
						<Trans>Create an evaluation</Trans>
					</Button>
				</CardContent>
			</Card>
		</div>
	);
}
