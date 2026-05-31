import { Trans } from "@lingui/react/macro";
import type { Icon } from "@phosphor-icons/react";
import {
	CalendarIcon,
	ChartBarIcon,
	ChartLineUpIcon,
	CheckCircleIcon,
	ClockIcon,
	FireIcon,
	LightbulbIcon,
	MicrophoneIcon,
	PlusIcon,
	SparkleIcon,
	SpinnerIcon,
	StarIcon,
	TargetIcon,
	TrendUpIcon,
	TrophyIcon,
	WarningCircleIcon,
} from "@phosphor-icons/react";
import { Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/utils/style";
import { RADAR_CATEGORIES, STATUS_COLORS, STATUS_LABELS } from "./performance-config";
import type { PerformanceTrend, ScoreBreakdown } from "./performance-types";

function AnimatedScore({ value, suffix = "" }: { value: number; suffix?: string }) {
	const [displayValue, setDisplayValue] = useState(0);

	useEffect(() => {
		let startTime: number;
		let animationFrame: number;

		const animate = (timestamp: number) => {
			if (!startTime) startTime = timestamp;
			const progress = Math.min((timestamp - startTime) / 1500, 1);
			const easeOutQuart = 1 - (1 - progress) ** 4;
			setDisplayValue(Math.round(easeOutQuart * value));

			if (progress < 1) {
				animationFrame = requestAnimationFrame(animate);
			}
		};

		animationFrame = requestAnimationFrame(animate);
		return () => cancelAnimationFrame(animationFrame);
	}, [value]);

	return (
		<span>
			{displayValue}
			{suffix}
		</span>
	);
}

function RadarChart({ data }: { data: ScoreBreakdown }) {
	const categories = RADAR_CATEGORIES;

	const size = 200;
	const center = size / 2;
	const radius = 80;
	const angleStep = (2 * Math.PI) / categories.length;

	const getPoint = (index: number, value: number) => {
		const angle = index * angleStep - Math.PI / 2;
		const r = (value / 100) * radius;
		return {
			x: center + r * Math.cos(angle),
			y: center + r * Math.sin(angle),
		};
	};

	const polygonPoints = categories
		.map((cat, i) => {
			const value = data[cat.key as keyof ScoreBreakdown] || 0;
			const point = getPoint(i, value);
			return `${point.x},${point.y}`;
		})
		.join(" ");

	return (
		<div className="flex flex-col items-center gap-4">
			<svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
				{[20, 40, 60, 80, 100].map((level) => (
					<circle
						key={level}
						cx={center}
						cy={center}
						r={(level / 100) * radius}
						fill="none"
						stroke="currentColor"
						strokeOpacity={0.1}
						strokeWidth={1}
					/>
				))}

				{categories.map((_, i) => {
					const point = getPoint(i, 100);
					return (
						<line
							key={i}
							x1={center}
							y1={center}
							x2={point.x}
							y2={point.y}
							stroke="currentColor"
							strokeOpacity={0.1}
							strokeWidth={1}
						/>
					);
				})}

				<motion.polygon
					points={polygonPoints}
					fill="hsl(var(--primary))"
					fillOpacity={0.2}
					stroke="hsl(var(--primary))"
					strokeWidth={2}
					initial={false}
					animate={{ opacity: 1, scale: 1 }}
					transition={{ duration: 0.8, ease: "easeOut" }}
				/>

				{categories.map((cat, i) => {
					const value = data[cat.key as keyof ScoreBreakdown] || 0;
					const point = getPoint(i, value);
					return (
						<motion.circle
							key={cat.key}
							cx={point.x}
							cy={point.y}
							r={4}
							fill="hsl(var(--primary))"
							initial={{ scale: 0 }}
							animate={{ scale: 1 }}
							transition={{ delay: 0.3 + i * 0.1 }}
						/>
					);
				})}

				{categories.map((cat, i) => {
					const point = getPoint(i, 115);
					return (
						<text
							key={cat.key}
							x={point.x}
							y={point.y}
							textAnchor="middle"
							dominantBaseline="middle"
							className="fill-muted-foreground text-[10px]"
						>
							{cat.label}
						</text>
					);
				})}
			</svg>

			<div className="flex flex-wrap justify-center gap-4">
				{categories.map((cat) => (
					<div key={cat.key} className="flex items-center gap-1.5">
						<div className="size-2 rounded-full" style={{ backgroundColor: cat.color }} />
						<span className="text-muted-foreground text-xs">{cat.label}</span>
						<span className="font-semibold text-xs">{data[cat.key as keyof ScoreBreakdown] || 0}%</span>
					</div>
				))}
			</div>
		</div>
	);
}

function TrendChart({ data }: { data: PerformanceTrend[] }) {
	if (data.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center py-12 text-center">
				<ChartLineUpIcon className="mb-4 size-12 text-muted-foreground" />
				<p className="text-muted-foreground">
					<Trans>No progress data yet</Trans>
				</p>
				<p className="text-muted-foreground text-sm">
					<Trans>Start practicing to see your trends</Trans>
				</p>
			</div>
		);
	}

	const chartHeight = 180;
	const chartWidth = 100;
	const padding = 10;

	const values = data.map((d) => d.overallScore);
	const minVal = Math.min(...values, 0);
	const maxVal = Math.max(...values, 100);
	const range = maxVal - minVal || 1;

	const getY = (value: number) => chartHeight - padding - ((value - minVal) / range) * (chartHeight - 2 * padding);
	const getX = (index: number) => (index / Math.max(1, data.length - 1)) * chartWidth;

	const pathData = values
		.map((value, index) => {
			const x = getX(index);
			const y = getY(value);
			return `${index === 0 ? "M" : "L"} ${x} ${y}`;
		})
		.join(" ");

	const areaPath = `${pathData} L ${chartWidth} ${chartHeight - padding} L 0 ${chartHeight - padding} Z`;

	return (
		<div className="relative h-[200px] w-full">
			<svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} preserveAspectRatio="none" className="h-full w-full">
				<defs>
					<linearGradient id="trendGradient" x1="0%" y1="0%" x2="0%" y2="100%">
						<stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.4" />
						<stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
					</linearGradient>
				</defs>

				{[0, 25, 50, 75, 100].map((level) => (
					<line
						key={level}
						x1={0}
						y1={getY(level)}
						x2={chartWidth}
						y2={getY(level)}
						stroke="currentColor"
						strokeOpacity={0.1}
						strokeWidth={0.5}
					/>
				))}

				<motion.path
					d={areaPath}
					fill="url(#trendGradient)"
					initial={false}
					animate={{ opacity: 1 }}
					transition={{ duration: 1 }}
				/>

				<motion.path
					d={pathData}
					fill="none"
					stroke="hsl(var(--primary))"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
					initial={{ pathLength: 0 }}
					animate={{ pathLength: 1 }}
					transition={{ duration: 1.5, ease: "easeOut" }}
				/>

				{values.map((value, index) => (
					<motion.circle
						key={index}
						cx={getX(index)}
						cy={getY(value)}
						r="2"
						fill="hsl(var(--background))"
						stroke="hsl(var(--primary))"
						strokeWidth="1.5"
						initial={{ scale: 0 }}
						animate={{ scale: 1 }}
						transition={{ delay: 0.5 + index * 0.1 }}
					/>
				))}
			</svg>

			<div className="absolute right-0 bottom-0 left-0 flex justify-between px-2 text-muted-foreground text-xs">
				{data.length > 0 && (
					<>
						<span>{new Date(data[0].date).toLocaleDateString("fr-FR", { month: "short", day: "numeric" })}</span>
						{data.length > 1 && (
							<span>
								{new Date(data[data.length - 1].date).toLocaleDateString("fr-FR", {
									month: "short",
									day: "numeric",
								})}
							</span>
						)}
					</>
				)}
			</div>
		</div>
	);
}

function GoalCard({
	goal,
	onPractice,
	onComplete,
	isPracticing,
}: {
	goal: {
		id: string;
		targetRole: string | null;
		targetCompany: string | null;
		interviewDate: Date | null;
		preparationStatus: string | null;
		practiceCount: number | null;
		targetPracticeCount: number | null;
		completed: boolean | null;
	};
	onPractice: (id: string) => void;
	onComplete: (id: string) => void;
	isPracticing?: boolean;
}) {
	const progress =
		goal.targetPracticeCount && goal.targetPracticeCount > 0
			? Math.min(100, Math.round(((goal.practiceCount ?? 0) / goal.targetPracticeCount) * 100))
			: 0;

	const isUpcoming = goal.interviewDate && new Date(goal.interviewDate) > new Date() && !goal.completed;
	const daysUntil = goal.interviewDate
		? Math.ceil((new Date(goal.interviewDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
		: null;

	return (
		<motion.div initial={false} animate={{ opacity: 1, y: 0 }} className="rounded-xl border p-4">
			<div className="mb-3 flex items-start justify-between">
				<div>
					<h3 className="font-semibold">{goal.targetRole || "Interview goal"}</h3>
					{goal.targetCompany && <p className="text-muted-foreground text-sm">{goal.targetCompany}</p>}
				</div>
				<Badge className={STATUS_COLORS[goal.preparationStatus || "not_started"]}>
					{STATUS_LABELS[goal.preparationStatus || "not_started"]}
				</Badge>
			</div>

			{goal.interviewDate && (
				<div className="mb-3 flex items-center gap-2 text-sm">
					<CalendarIcon className="size-4 text-muted-foreground" />
					<span>
						{new Date(goal.interviewDate).toLocaleDateString("fr-FR", {
							weekday: "long",
							day: "numeric",
							month: "long",
						})}
					</span>
					{isUpcoming && daysUntil !== null && (
						<Badge variant="outline" className={daysUntil <= 3 ? "border-red-300 text-red-600" : ""}>
							{daysUntil === 0 ? "Today" : daysUntil === 1 ? "Tomorrow" : `In ${daysUntil} days`}
						</Badge>
					)}
				</div>
			)}

			<div className="mb-3">
				<div className="mb-1 flex items-center justify-between text-sm">
					<span className="text-muted-foreground">Pratiques</span>
					<span className="font-medium">
						{goal.practiceCount ?? 0}/{goal.targetPracticeCount ?? 10}
					</span>
				</div>
				<Progress value={progress} className="h-2" />
			</div>

			<div className="flex gap-2">
				{!goal.completed && (
					<>
						<Button
							variant="outline"
							size="sm"
							className="flex-1"
							onClick={() => onPractice(goal.id)}
							disabled={isPracticing}
						>
							{isPracticing ? (
								<SpinnerIcon className="mr-2 size-4 animate-spin" />
							) : (
								<MicrophoneIcon className="mr-2 size-4" />
							)}
							Practice
						</Button>
						{progress >= 100 && (
							<Button variant="default" size="sm" onClick={() => onComplete(goal.id)}>
								<CheckCircleIcon className="mr-2 size-4" />
								Complete
							</Button>
						)}
					</>
				)}
				{goal.completed && (
					<Badge className="flex items-center gap-1 bg-green-100 text-green-700">
						<CheckCircleIcon className="size-4" weight="fill" />
						Complete
					</Badge>
				)}
			</div>
		</motion.div>
	);
}

export function LoadingSkeleton() {
	return (
		<div className="space-y-6">
			<div className="grid gap-4 md:grid-cols-4">
				{[1, 2, 3, 4].map((i) => (
					<Skeleton key={i} className="h-32" />
				))}
			</div>
			<div className="grid gap-6 lg:grid-cols-2">
				<Skeleton className="h-80" />
				<Skeleton className="h-80" />
			</div>
		</div>
	);
}

export function HeroSection({
	stats,
	trendDirection,
	trendIcon,
	trendColor,
}: {
	stats: { totalSessions: number; averageScore: number; scoreImprovement?: number; practiceStreak: number } | undefined;
	trendDirection: string;
	trendIcon: Icon | null;
	trendColor: string;
}) {
	return (
		<motion.div
			className="relative mb-8 overflow-hidden rounded-3xl border border-primary/20 p-8 md:p-12"
			style={{
				background:
					"linear-gradient(135deg, oklch(0.7 0.15 280 / 0.15) 0%, oklch(0.6 0.2 200 / 0.1) 50%, oklch(0.65 0.18 150 / 0.08) 100%)",
			}}
			initial={false}
			animate={{ opacity: 1, y: 0 }}
		>
			<div className="pointer-events-none absolute inset-0 overflow-hidden">
				<motion.div
					className="absolute -top-32 -right-32 size-96 rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/10 blur-3xl"
					animate={{ scale: [1, 1.2, 1], rotate: [0, 10, 0] }}
					transition={{ duration: 10, repeat: Number.POSITIVE_INFINITY }}
				/>
			</div>

			<div className="relative z-10">
				<motion.div
					className="mb-3 flex items-center gap-2"
					initial={false}
					animate={{ opacity: 1, x: 0 }}
					transition={{ delay: 0.2 }}
				>
					<SparkleIcon className="size-5 text-primary" weight="fill" />
					<span className="font-semibold text-primary text-sm uppercase tracking-wider">
						<Trans>AI Analysis</Trans>
					</span>
				</motion.div>

				<motion.h2
					className="mb-4 font-bold text-3xl tracking-tight md:text-4xl"
					initial={false}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.3 }}
				>
					<Trans>Interview Performance Tracking</Trans>
				</motion.h2>

				<motion.p
					className="mb-8 max-w-2xl text-lg text-muted-foreground"
					initial={false}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.4 }}
				>
					<Trans>Track your progress, identify your strengths, and improve your interview skills through IA.</Trans>
				</motion.p>

				<motion.div
					className="flex flex-wrap items-center gap-6"
					initial={false}
					animate={{ opacity: 1 }}
					transition={{ delay: 0.5 }}
				>
					<div className="flex items-center gap-2">
						<div className="flex size-10 items-center justify-center rounded-full bg-primary/10">
							<MicrophoneIcon className="size-5 text-primary" weight="duotone" />
						</div>
						<div>
							<p className="font-bold text-xl">
								<AnimatedScore value={stats?.totalSessions ?? 0} />
							</p>
							<p className="text-muted-foreground text-sm">
								<Trans>Sessions</Trans>
							</p>
						</div>
					</div>
					<div className="flex items-center gap-2">
						<div className="flex size-10 items-center justify-center rounded-full bg-amber-500/10">
							<StarIcon className="size-5 text-amber-500" weight="duotone" />
						</div>
						<div>
							<p className="font-bold text-xl">
								<AnimatedScore value={stats?.averageScore ?? 0} suffix="%" />
							</p>
							<p className="text-muted-foreground text-sm">
								<Trans>Average score</Trans>
							</p>
						</div>
					</div>
					<div className="flex items-center gap-2">
						<div
							className={cn(
								"flex size-10 items-center justify-center rounded-full",
								trendDirection === "improving"
									? "bg-green-500/10"
									: trendDirection === "declining"
										? "bg-red-500/10"
										: "bg-gray-500/10",
							)}
						>
							{trendIcon ? (
								(() => {
									const TrendIcon = trendIcon;
									return <TrendIcon className={cn("size-5", trendColor)} weight="fill" />;
								})()
							) : (
								<TrendUpIcon className="size-5 text-muted-foreground" />
							)}
						</div>
						<div>
							<p className={cn("font-bold text-xl", trendColor)}>
								{stats?.scoreImprovement !== undefined
									? `${stats.scoreImprovement >= 0 ? "+" : ""}${stats.scoreImprovement}%`
									: "-"}
							</p>
							<p className="text-muted-foreground text-sm">
								<Trans>Progress</Trans>
							</p>
						</div>
					</div>
					<div className="flex items-center gap-2">
						<div className="flex size-10 items-center justify-center rounded-full bg-purple-500/10">
							<FireIcon className="size-5 text-purple-500" weight="duotone" />
						</div>
						<div>
							<p className="font-bold text-xl">{stats?.practiceStreak ?? 0}</p>
							<p className="text-muted-foreground text-sm">
								<Trans>Consecutive days</Trans>
							</p>
						</div>
					</div>
				</motion.div>
			</div>
		</motion.div>
	);
}

export function OverviewTab({
	scoreBreakdown,
	trends,
	strengths,
	improvements,
}: {
	scoreBreakdown: ScoreBreakdown;
	trends: PerformanceTrend[];
	strengths: { text: string; count: number }[];
	improvements: { text: string; count: number }[];
}) {
	return (
		<div className="space-y-6">
			<div className="grid gap-6 lg:grid-cols-2">
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<ChartBarIcon className="size-5" />
							<Trans>Score Distribution</Trans>
						</CardTitle>
						<CardDescription>
							<Trans>Your performance by category</Trans>
						</CardDescription>
					</CardHeader>
					<CardContent>
						<RadarChart data={scoreBreakdown} />
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<TrendUpIcon className="size-5" />
							<Trans>Performance Trend</Trans>
						</CardTitle>
						<CardDescription>
							<Trans>Evolution of your scores over time</Trans>
						</CardDescription>
					</CardHeader>
					<CardContent>
						<TrendChart data={trends} />
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<TrophyIcon className="size-5 text-green-500" />
							<Trans>Strengths</Trans>
						</CardTitle>
						<CardDescription>
							<Trans>Your identified strengths</Trans>
						</CardDescription>
					</CardHeader>
					<CardContent>
						{strengths.length === 0 ? (
							<div className="flex flex-col items-center py-6 text-center">
								<TrophyIcon className="mb-2 size-8 text-muted-foreground" />
								<p className="text-muted-foreground text-sm">
									<Trans>Practice to discover your strengths</Trans>
								</p>
							</div>
						) : (
							<div className="space-y-3">
								{strengths.map((item, i) => (
									<motion.div
										key={i}
										initial={false}
										animate={{ opacity: 1, x: 0 }}
										transition={{ delay: i * 0.1 }}
										className="flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 p-3 dark:border-green-900 dark:bg-green-900/20"
									>
										<CheckCircleIcon className="size-5 text-green-600" weight="fill" />
										<span className="flex-1 text-sm">{item.text}</span>
										<Badge variant="outline" className="text-xs">
											{item.count}x
										</Badge>
									</motion.div>
								))}
							</div>
						)}
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<TargetIcon className="size-5 text-amber-500" />
							<Trans>Areas for Improvement</Trans>
						</CardTitle>
						<CardDescription>
							<Trans>Points to work on</Trans>
						</CardDescription>
					</CardHeader>
					<CardContent>
						{improvements.length === 0 ? (
							<div className="flex flex-col items-center py-6 text-center">
								<TargetIcon className="mb-2 size-8 text-muted-foreground" />
								<p className="text-muted-foreground text-sm">
									<Trans>Practice to identify your areas for improvement</Trans>
								</p>
							</div>
						) : (
							<div className="space-y-3">
								{improvements.map((item, i) => (
									<motion.div
										key={i}
										initial={false}
										animate={{ opacity: 1, x: 0 }}
										transition={{ delay: i * 0.1 }}
										className="flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-900 dark:bg-amber-900/20"
									>
										<WarningCircleIcon className="size-5 text-amber-600" weight="fill" />
										<span className="flex-1 text-sm">{item.text}</span>
										<Badge variant="outline" className="text-xs">
											{item.count}x
										</Badge>
									</motion.div>
								))}
							</div>
						)}
					</CardContent>
				</Card>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>
						<Trans>Quick Actions</Trans>
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="grid gap-4 md:grid-cols-3">
						<Button asChild variant="outline" className="h-auto justify-start py-4">
							<Link to="/dashboard/interview">
								<MicrophoneIcon className="mr-3 size-6" />
								<div className="text-left">
									<p className="font-medium">
										<Trans>Practice an interview</Trans>
									</p>
									<p className="text-muted-foreground text-xs">
										<Trans>Improve your skills</Trans>
									</p>
								</div>
							</Link>
						</Button>
						<Button asChild variant="outline" className="h-auto justify-start py-4">
							<Link to="/dashboard/interview/mock-ai">
								<SparkleIcon className="mr-3 size-6" />
								<div className="text-left">
									<p className="font-medium">
										<Trans>AI Interview</Trans>
									</p>
									<p className="text-muted-foreground text-xs">
										<Trans>Simulation realiste</Trans>
									</p>
								</div>
							</Link>
						</Button>
						<Button asChild variant="outline" className="h-auto justify-start py-4">
							<Link to="/dashboard/interview/question-bank">
								<LightbulbIcon className="mr-3 size-6" />
								<div className="text-left">
									<p className="font-medium">
										<Trans>Question bank</Trans>
									</p>
									<p className="text-muted-foreground text-xs">
										<Trans>Prepare your answers</Trans>
									</p>
								</div>
							</Link>
						</Button>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}

export function GoalsTab({
	summary,
	goals,
	completedGoals,
	isLoadingGoals,
	isPracticing,
	onPractice,
	onComplete,
	onOpenAddGoal,
}: {
	summary:
		| {
				goalStatistics?: {
					activeGoals: number;
					completedGoals: number;
					upcomingInterviews: number;
					successRate: number;
				};
		  }
		| undefined;
	goals:
		| Array<{
				id: string;
				targetRole: string | null;
				targetCompany: string | null;
				interviewDate: Date | null;
				preparationStatus: string | null;
				practiceCount: number | null;
				targetPracticeCount: number | null;
				completed: boolean | null;
		  }>
		| undefined;
	completedGoals:
		| Array<{
				id: string;
				targetRole: string | null;
				targetCompany: string | null;
				interviewDate: Date | null;
				practiceCount: number | null;
				outcome: string | null;
		  }>
		| undefined;
	isLoadingGoals: boolean;
	isPracticing: boolean;
	onPractice: (id: string) => void;
	onComplete: (id: string) => void;
	onOpenAddGoal: () => void;
}) {
	return (
		<div className="space-y-6">
			<div className="grid gap-4 md:grid-cols-4">
				<Card>
					<CardContent className="flex items-center gap-4 p-4">
						<div className="flex size-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
							<TargetIcon className="size-6 text-blue-600" />
						</div>
						<div>
							<p className="font-bold text-2xl">{summary?.goalStatistics?.activeGoals ?? 0}</p>
							<p className="text-muted-foreground text-sm">
								<Trans>Active</Trans>
							</p>
						</div>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="flex items-center gap-4 p-4">
						<div className="flex size-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
							<CheckCircleIcon className="size-6 text-green-600" />
						</div>
						<div>
							<p className="font-bold text-2xl">{summary?.goalStatistics?.completedGoals ?? 0}</p>
							<p className="text-muted-foreground text-sm">
								<Trans>Completed</Trans>
							</p>
						</div>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="flex items-center gap-4 p-4">
						<div className="flex size-12 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/30">
							<CalendarIcon className="size-6 text-purple-600" />
						</div>
						<div>
							<p className="font-bold text-2xl">{summary?.goalStatistics?.upcomingInterviews ?? 0}</p>
							<p className="text-muted-foreground text-sm">
								<Trans>Upcoming</Trans>
							</p>
						</div>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="flex items-center gap-4 p-4">
						<div className="flex size-12 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
							<TrophyIcon className="size-6 text-amber-600" />
						</div>
						<div>
							<p className="font-bold text-2xl">{summary?.goalStatistics?.successRate ?? 0}%</p>
							<p className="text-muted-foreground text-sm">
								<Trans>Success rate</Trans>
							</p>
						</div>
					</CardContent>
				</Card>
			</div>

			<div className="grid gap-6 lg:grid-cols-2">
				<div className="space-y-4">
					<h3 className="font-semibold text-lg">
						<Trans>Active Goals</Trans>
					</h3>
					{isLoadingGoals ? (
						<div className="space-y-4">
							<Skeleton className="h-40" />
							<Skeleton className="h-40" />
						</div>
					) : !goals || goals.length === 0 ? (
						<Card className="p-8 text-center">
							<TargetIcon className="mx-auto mb-4 size-12 text-muted-foreground" />
							<h4 className="mb-2 font-semibold">
								<Trans>No active goals</Trans>
							</h4>
							<p className="mb-4 text-muted-foreground text-sm">
								<Trans>Create your first interview goal</Trans>
							</p>
							<Button onClick={onOpenAddGoal}>
								<PlusIcon className="mr-2 size-4" />
								<Trans>Create a goal</Trans>
							</Button>
						</Card>
					) : (
						<div className="space-y-4">
							{goals.map((goal) => (
								<GoalCard
									key={goal.id}
									goal={goal}
									onPractice={onPractice}
									onComplete={onComplete}
									isPracticing={isPracticing}
								/>
							))}
						</div>
					)}
				</div>

				<div className="space-y-4">
					<h3 className="font-semibold text-lg">
						<Trans>Completed Goals</Trans>
					</h3>
					{!completedGoals || completedGoals.length === 0 ? (
						<Card className="p-8 text-center">
							<TrophyIcon className="mx-auto mb-4 size-12 text-muted-foreground" />
							<p className="text-muted-foreground text-sm">
								<Trans>No completed goals</Trans>
							</p>
						</Card>
					) : (
						<div className="space-y-4">
							{completedGoals.map((goal) => (
								<motion.div
									key={goal.id}
									initial={false}
									animate={{ opacity: 1 }}
									className="rounded-lg border bg-muted/30 p-4"
								>
									<div className="flex items-center justify-between">
										<div>
											<h4 className="font-medium">{goal.targetRole || "Interview goal"}</h4>
											{goal.targetCompany && <p className="text-muted-foreground text-sm">{goal.targetCompany}</p>}
										</div>
										<Badge
											className={
												goal.outcome === "offered"
													? "bg-green-100 text-green-700"
													: goal.outcome === "rejected"
														? "bg-red-100 text-red-700"
														: "bg-gray-100 text-gray-700"
											}
										>
											{goal.outcome === "offered"
												? "Offer"
												: goal.outcome === "rejected"
													? "Rejected"
													: goal.outcome === "pending"
														? "Pending"
														: "Completed"}
										</Badge>
									</div>
									<div className="mt-2 flex items-center gap-4 text-muted-foreground text-sm">
										<span>{goal.practiceCount ?? 0} practices</span>
										{goal.interviewDate && (
											<span>
												{new Date(goal.interviewDate).toLocaleDateString("fr-FR", {
													month: "short",
													day: "numeric",
												})}
											</span>
										)}
									</div>
								</motion.div>
							))}
						</div>
					)}
				</div>
			</div>
		</div>
	);
}

export function TipsTab({ recommendations }: { recommendations: string[] }) {
	return (
		<div className="space-y-6">
			<Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
				<CardContent className="flex items-center gap-4 p-6">
					<div className="flex size-14 items-center justify-center rounded-full bg-primary/10">
						<SparkleIcon className="size-7 text-primary" weight="fill" />
					</div>
					<div>
						<h3 className="mb-1 font-semibold text-lg">
							<Trans>Personalized Tips</Trans>
						</h3>
						<p className="text-muted-foreground">
							<Trans>Based on your performance, here are tips to improve.</Trans>
						</p>
					</div>
				</CardContent>
			</Card>

			<div className="grid gap-4 md:grid-cols-2">
				{recommendations.length === 0 ? (
					<Card className="col-span-2 p-8 text-center">
						<LightbulbIcon className="mx-auto mb-4 size-12 text-muted-foreground" />
						<h4 className="mb-2 font-semibold">
							<Trans>No tips yet</Trans>
						</h4>
						<p className="text-muted-foreground">
							<Trans>Complete a few practice sessions to receive personalized tips.</Trans>
						</p>
						<Button asChild className="mt-4">
							<Link to="/dashboard/interview">
								<MicrophoneIcon className="mr-2 size-4" />
								<Trans>Start practicing</Trans>
							</Link>
						</Button>
					</Card>
				) : (
					recommendations.map((tip, i) => (
						<motion.div key={i} initial={false} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
							<Card className="h-full">
								<CardContent className="flex gap-4 p-4">
									<div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
										<LightbulbIcon className="size-5 text-amber-600" weight="fill" />
									</div>
									<p className="text-sm">{tip}</p>
								</CardContent>
							</Card>
						</motion.div>
					))
				)}
			</div>

			<Card>
				<CardHeader>
					<CardTitle>
						<Trans>Ressources Supplementaires</Trans>
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="grid gap-4 md:grid-cols-3">
						<Button asChild variant="outline" className="h-auto justify-start py-4">
							<Link to="/dashboard/interview/tips">
								<LightbulbIcon className="mr-3 size-6" />
								<div className="text-left">
									<p className="font-medium">
										<Trans>Preparation Guide</Trans>
									</p>
									<p className="text-muted-foreground text-xs">
										<Trans>Tips and tricks</Trans>
									</p>
								</div>
							</Link>
						</Button>
						<Button asChild variant="outline" className="h-auto justify-start py-4">
							<Link to="/dashboard/interview/feedback">
								<ClockIcon className="mr-3 size-6" />
								<div className="text-left">
									<p className="font-medium">
										<Trans>Feedback history</Trans>
									</p>
									<p className="text-muted-foreground text-xs">
										<Trans>Track your feedback</Trans>
									</p>
								</div>
							</Link>
						</Button>
						<Button asChild variant="outline" className="h-auto justify-start py-4">
							<Link to="/dashboard/interview/confidence">
								<FireIcon className="mr-3 size-6" />
								<div className="text-left">
									<p className="font-medium">
										<Trans>Confidence Exercises</Trans>
									</p>
									<p className="text-muted-foreground text-xs">
										<Trans>Boost your confidence</Trans>
									</p>
								</div>
							</Link>
						</Button>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
