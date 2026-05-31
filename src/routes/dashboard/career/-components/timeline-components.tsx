import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import {
	ArrowDownIcon,
	ArrowUpIcon,
	BriefcaseIcon,
	CalendarIcon,
	ChartBarIcon,
	ChartLineUpIcon,
	CheckCircleIcon,
	ClockIcon,
	CurrencyCircleDollarIcon,
	DownloadSimpleIcon,
	ImageIcon,
	LightbulbIcon,
	MedalIcon,
	PencilSimpleIcon,
	PlusCircleIcon,
	StarIcon,
	TargetIcon,
	TrashIcon,
	TrophyIcon,
	WarningCircleIcon,
	XIcon,
} from "@phosphor-icons/react";
import { motion } from "motion/react";
import { useMemo } from "react";

import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/utils/style";

import { EVENT_TYPE_CONFIG, GOAL_CATEGORY_CONFIG, INDUSTRY_BENCHMARKS, SKILL_CATEGORY_CONFIG } from "./timeline-config";
import type { CareerGoal, EventType, SkillAcquisition, TimelineEvent } from "./timeline-types";
import { formatDate, formatDateFull, getDateDiff } from "./timeline-utils";

// TimelineEventCard
export function TimelineEventCard({
	event,
	onEdit,
	onDelete,
	isGap = false,
}: {
	event: TimelineEvent;
	onEdit: () => void;
	onDelete: () => void;
	isGap?: boolean;
}) {
	const config = EVENT_TYPE_CONFIG[event.type];
	const EventIcon = config.icon;
	const isOngoing = !event.endDate;
	const duration = getDateDiff(event.startDate, event.endDate);

	return (
		<motion.div
			initial={false}
			animate={{ opacity: 1, x: 0 }}
			exit={{ opacity: 0, x: 20 }}
			className="relative flex gap-4"
		>
			{/* Timeline dot and line */}
			<div className="flex flex-col items-center">
				<motion.div
					whileHover={{ scale: 1.2 }}
					className={cn(
						"z-10 flex size-12 shrink-0 items-center justify-center rounded-full border-4 border-background shadow-lg",
						config.bgColor,
						isGap && "border-amber-500 border-dashed bg-amber-50",
					)}
				>
					<EventIcon className={cn("size-6", config.color, isGap && "text-amber-500")} weight="duotone" />
				</motion.div>
				<div className="h-full w-0.5 bg-gradient-to-b from-primary/50 to-transparent" />
			</div>

			{/* Event card */}
			<Card
				className={cn(
					"mb-6 flex-1 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg",
					isOngoing && "border-primary/50",
					event.isGoal && !event.completed && "border-rose-500/50 border-dashed",
				)}
			>
				<CardContent className="p-4">
					<div className="mb-3 flex items-start justify-between">
						<div className="flex-1">
							<div className="mb-1 flex flex-wrap items-center gap-2">
								<Badge className={cn(config.bgColor, config.color)}>{config.label}</Badge>
								{isOngoing && (
									<Badge variant="outline" className="gap-1 border-primary text-primary">
										<span className="relative flex size-2">
											<span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-75" />
											<span className="relative inline-flex size-2 rounded-full bg-primary" />
										</span>
										<Trans>In progress</Trans>
									</Badge>
								)}
								{event.isGoal && event.completed && (
									<Badge className="gap-1 bg-green-500">
										<CheckCircleIcon className="size-3" weight="fill" />
										<Trans>Achieved</Trans>
									</Badge>
								)}
							</div>
							<h4 className="font-bold text-lg">{event.title}</h4>
							<p className="text-muted-foreground">{event.organization}</p>
						</div>
						<div className="flex gap-1">
							<Tooltip>
								<TooltipTrigger asChild>
									<Button variant="ghost" size="icon-sm" onClick={onEdit}>
										<PencilSimpleIcon className="size-4" />
									</Button>
								</TooltipTrigger>
								<TooltipContent>
									<Trans>Edit</Trans>
								</TooltipContent>
							</Tooltip>
							<AlertDialog>
								<AlertDialogTrigger asChild>
									<Button variant="ghost" size="icon-sm">
										<TrashIcon className="size-4 text-destructive" />
									</Button>
								</AlertDialogTrigger>
								<AlertDialogContent>
									<AlertDialogHeader>
										<AlertDialogTitle>
											<Trans>Delete this event?</Trans>
										</AlertDialogTitle>
										<AlertDialogDescription>
											<Trans>This action is irreversible. The event "{event.title}" will be permanently deleted.</Trans>
										</AlertDialogDescription>
									</AlertDialogHeader>
									<AlertDialogFooter>
										<AlertDialogCancel>
											<Trans>Cancel</Trans>
										</AlertDialogCancel>
										<AlertDialogAction onClick={onDelete}>
											<Trans>Delete</Trans>
										</AlertDialogAction>
									</AlertDialogFooter>
								</AlertDialogContent>
							</AlertDialog>
						</div>
					</div>

					{/* Date and duration */}
					<div className="mb-3 flex flex-wrap items-center gap-4 text-muted-foreground text-sm">
						<div className="flex items-center gap-1">
							<CalendarIcon className="size-4" />
							<span>{formatDate(event.startDate, { month: "short", year: "numeric" })}</span>
							<span>-</span>
							<span>{event.endDate ? formatDate(event.endDate, { month: "short", year: "numeric" }) : t`Present`}</span>
						</div>
						<div className="flex items-center gap-1">
							<ClockIcon className="size-4" />
							<span>{duration}</span>
						</div>
						{event.salary && (
							<div className="flex items-center gap-1 font-medium text-green-600 dark:text-green-400">
								<CurrencyCircleDollarIcon className="size-4" />
								<span>{event.salary.toLocaleString("fr-FR")} DH</span>
							</div>
						)}
					</div>

					{/* Description */}
					{event.description && <p className="mb-3 text-sm">{event.description}</p>}

					{/* Skills */}
					{event.skills && event.skills.length > 0 && (
						<div className="mb-3">
							<p className="mb-1 font-medium text-muted-foreground text-xs uppercase">
								<Trans>Skills</Trans>
							</p>
							<div className="flex flex-wrap gap-1">
								{event.skills.map((skill, i) => (
									<Badge key={i} variant="secondary" className="text-xs">
										{skill}
									</Badge>
								))}
							</div>
						</div>
					)}

					{/* Achievements */}
					{event.achievements && event.achievements.length > 0 && (
						<div>
							<p className="mb-1 font-medium text-muted-foreground text-xs uppercase">
								<Trans>Accomplishments</Trans>
							</p>
							<ul className="space-y-1 text-sm">
								{event.achievements.map((achievement, i) => (
									<li key={i} className="flex items-start gap-2">
										<CheckCircleIcon className="mt-0.5 size-4 shrink-0 text-green-500" weight="fill" />
										<span>{achievement}</span>
									</li>
								))}
							</ul>
						</div>
					)}
				</CardContent>
			</Card>
		</motion.div>
	);
}

// GapIndicator
export function GapIndicator({ gap }: { gap: { start: string; end: string; duration: number } }) {
	const months = Math.round(gap.duration / 30);

	return (
		<motion.div initial={false} animate={{ opacity: 1, scale: 1 }} className="relative flex gap-4">
			<div className="flex flex-col items-center">
				<div className="z-10 flex size-12 shrink-0 items-center justify-center rounded-full border-2 border-amber-500 border-dashed bg-amber-50 dark:bg-amber-900/20">
					<WarningCircleIcon className="size-6 text-amber-500" weight="duotone" />
				</div>
				<div className="h-full w-0.5 border-amber-300 border-l-2 border-dashed" />
			</div>

			<Card className="mb-6 flex-1 border-amber-500/50 border-dashed bg-amber-50/50 dark:bg-amber-900/10">
				<CardContent className="p-4">
					<div className="flex items-center justify-between">
						<div>
							<Badge variant="outline" className="mb-2 border-amber-500 text-amber-600">
								<WarningCircleIcon className="mr-1 size-3" />
								<Trans>Inactivity period</Trans>
							</Badge>
							<p className="font-medium text-amber-700 dark:text-amber-400">{months} months without employment</p>
							<p className="text-muted-foreground text-sm">
								{formatDate(gap.start, { month: "short", year: "numeric" })} -{" "}
								{formatDate(gap.end, { month: "short", year: "numeric" })}
							</p>
						</div>
						<div className="text-right text-amber-600">
							<ClockIcon className="size-8" weight="duotone" />
						</div>
					</div>
				</CardContent>
			</Card>
		</motion.div>
	);
}

// SalaryChart
export function SalaryChart({ data }: { data: { date: string; salary: number; title: string }[] }) {
	if (data.length === 0) return null;

	const maxSalary = Math.max(...data.map((d) => d.salary));
	const minSalary = Math.min(...data.map((d) => d.salary));
	const range = maxSalary - minSalary || maxSalary;

	// Calculate percentage increase
	const firstSalary = data[0]?.salary || 0;
	const lastSalary = data[data.length - 1]?.salary || 0;
	const percentIncrease = firstSalary > 0 ? Math.round(((lastSalary - firstSalary) / firstSalary) * 100) : 0;

	return (
		<Card>
			<CardHeader className="pb-2">
				<CardTitle className="flex items-center gap-2 text-lg">
					<ChartLineUpIcon className="size-5 text-primary" weight="duotone" />
					<Trans>Salary Progression</Trans>
				</CardTitle>
				<CardDescription>
					<Trans>Evolution of your salary over time</Trans>
				</CardDescription>
			</CardHeader>
			<CardContent>
				{/* Summary */}
				<div className="mb-6 grid grid-cols-3 gap-4">
					<div className="rounded-lg bg-muted/50 p-3 text-center">
						<p className="text-muted-foreground text-xs">
							<Trans>First</Trans>
						</p>
						<p className="font-bold text-lg">{firstSalary.toLocaleString("fr-FR")} DH</p>
					</div>
					<div className="rounded-lg bg-muted/50 p-3 text-center">
						<p className="text-muted-foreground text-xs">
							<Trans>Current</Trans>
						</p>
						<p className="font-bold text-lg">{lastSalary.toLocaleString("fr-FR")} DH</p>
					</div>
					<div className="rounded-lg bg-green-50 p-3 text-center dark:bg-green-900/20">
						<p className="text-muted-foreground text-xs">
							<Trans>Progress</Trans>
						</p>
						<p
							className={cn(
								"flex items-center justify-center gap-1 font-bold text-lg",
								percentIncrease >= 0 ? "text-green-600" : "text-red-600",
							)}
						>
							{percentIncrease >= 0 ? <ArrowUpIcon className="size-4" /> : <ArrowDownIcon className="size-4" />}
							{Math.abs(percentIncrease)}%
						</p>
					</div>
				</div>

				{/* Chart */}
				<div className="relative h-48">
					<svg viewBox="0 0 400 150" className="size-full">
						{/* Grid lines */}
						{[0, 25, 50, 75, 100].map((pct) => (
							<line
								key={pct}
								x1="40"
								y1={20 + (100 - pct)}
								x2="380"
								y2={20 + (100 - pct)}
								stroke="currentColor"
								strokeOpacity="0.1"
								strokeWidth="1"
							/>
						))}

						{/* Y-axis labels */}
						<text x="35" y="25" textAnchor="end" className="fill-muted-foreground text-[8px]">
							{maxSalary.toLocaleString("fr-FR")}
						</text>
						<text x="35" y="75" textAnchor="end" className="fill-muted-foreground text-[8px]">
							{Math.round((maxSalary + minSalary) / 2).toLocaleString("fr-FR")}
						</text>
						<text x="35" y="120" textAnchor="end" className="fill-muted-foreground text-[8px]">
							{minSalary.toLocaleString("fr-FR")}
						</text>

						{/* Line chart */}
						<motion.path
							initial={{ pathLength: 0 }}
							animate={{ pathLength: 1 }}
							transition={{ duration: 1.5, ease: "easeOut" }}
							d={data
								.map((point, i) => {
									const x = 50 + (i * 320) / Math.max(data.length - 1, 1);
									const y = 120 - ((point.salary - minSalary) / range) * 100;
									return `${i === 0 ? "M" : "L"} ${x} ${y}`;
								})
								.join(" ")}
							fill="none"
							stroke="oklch(0.6 0.2 250)"
							strokeWidth="3"
							strokeLinecap="round"
							strokeLinejoin="round"
						/>

						{/* Data points */}
						{data.map((point, i) => {
							const x = 50 + (i * 320) / Math.max(data.length - 1, 1);
							const y = 120 - ((point.salary - minSalary) / range) * 100;
							return (
								<g key={i}>
									<motion.circle
										initial={{ scale: 0 }}
										animate={{ scale: 1 }}
										transition={{ delay: 0.5 + i * 0.1 }}
										cx={x}
										cy={y}
										r="6"
										fill="oklch(0.6 0.2 250)"
										stroke="white"
										strokeWidth="2"
									/>
									<text x={x} y="140" textAnchor="middle" className="fill-muted-foreground text-[7px]">
										{formatDate(point.date, { month: "short", year: "numeric" })}
									</text>
								</g>
							);
						})}
					</svg>
				</div>

				{/* Legend */}
				<div className="mt-4 flex flex-wrap gap-2">
					{data.map((point, i) => (
						<Tooltip key={i}>
							<TooltipTrigger asChild>
								<Badge variant="outline" className="cursor-default">
									{point.title}: {point.salary.toLocaleString("fr-FR")} DH
								</Badge>
							</TooltipTrigger>
							<TooltipContent>{formatDateFull(point.date)}</TooltipContent>
						</Tooltip>
					))}
				</div>
			</CardContent>
		</Card>
	);
}

// SkillsTimeline
export function SkillsTimeline({ skills, onDelete }: { skills: SkillAcquisition[]; onDelete: (id: string) => void }) {
	const sortedSkills = useMemo(
		() => [...skills].sort((a, b) => new Date(a.acquiredDate).getTime() - new Date(b.acquiredDate).getTime()),
		[skills],
	);

	const skillsByYear = useMemo(() => {
		const grouped: Record<string, SkillAcquisition[]> = {};
		for (const skill of sortedSkills) {
			const year = new Date(skill.acquiredDate).getFullYear().toString();
			if (!grouped[year]) grouped[year] = [];
			grouped[year].push(skill);
		}
		return grouped;
	}, [sortedSkills]);

	if (skills.length === 0) {
		return (
			<Card className="border-dashed">
				<CardContent className="flex flex-col items-center py-12 text-center">
					<LightbulbIcon className="mb-4 size-12 text-muted-foreground/50" />
					<p className="text-muted-foreground">
						<Trans>No skills recorded. Add skills from your career events.</Trans>
					</p>
				</CardContent>
			</Card>
		);
	}

	return (
		<div className="space-y-6">
			{Object.entries(skillsByYear)
				.sort(([a], [b]) => Number(b) - Number(a))
				.map(([year, yearSkills]) => (
					<div key={year}>
						<h4 className="mb-3 flex items-center gap-2 font-semibold">
							<CalendarIcon className="size-4 text-primary" />
							{year}
							<Badge variant="secondary">{yearSkills.length}</Badge>
						</h4>
						<div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
							{yearSkills.map((skill) => {
								const categoryConfig = SKILL_CATEGORY_CONFIG[skill.category];
								return (
									<motion.div key={skill.id} initial={false} animate={{ opacity: 1, scale: 1 }}>
										<Card className="h-full transition-all hover:shadow-md">
											<CardContent className="p-4">
												<div className="mb-2 flex items-start justify-between">
													<div>
														<h5 className="font-medium">{skill.name}</h5>
														<Badge className={cn("mt-1 text-xs", categoryConfig.color)}>{categoryConfig.label}</Badge>
													</div>
													<AlertDialog>
														<AlertDialogTrigger asChild>
															<Button variant="ghost" size="icon-sm">
																<TrashIcon className="size-3 text-destructive" />
															</Button>
														</AlertDialogTrigger>
														<AlertDialogContent>
															<AlertDialogHeader>
																<AlertDialogTitle>
																	<Trans>Delete this skill?</Trans>
																</AlertDialogTitle>
																<AlertDialogDescription>
																	<Trans>This skill will be removed from your history.</Trans>
																</AlertDialogDescription>
															</AlertDialogHeader>
															<AlertDialogFooter>
																<AlertDialogCancel>
																	<Trans>Cancel</Trans>
																</AlertDialogCancel>
																<AlertDialogAction onClick={() => onDelete(skill.id)}>
																	<Trans>Delete</Trans>
																</AlertDialogAction>
															</AlertDialogFooter>
														</AlertDialogContent>
													</AlertDialog>
												</div>
												<div className="mb-2 flex items-center gap-1">
													{[1, 2, 3, 4, 5].map((level) => (
														<StarIcon
															key={level}
															className={cn(
																"size-4",
																level <= skill.level ? "text-amber-500" : "text-gray-300 dark:text-gray-600",
															)}
															weight={level <= skill.level ? "fill" : "regular"}
														/>
													))}
												</div>
												<p className="text-muted-foreground text-xs">
													<Trans>Acquired on</Trans>{" "}
													{formatDate(skill.acquiredDate, { month: "short", year: "numeric" })}
												</p>
											</CardContent>
										</Card>
									</motion.div>
								);
							})}
						</div>
					</div>
				))}
		</div>
	);
}

// GoalsTracker
export function GoalsTracker({
	goals,
	onToggleComplete,
	onDelete,
}: {
	goals: CareerGoal[];
	onToggleComplete: (id: string) => void;
	onDelete: (id: string) => void;
}) {
	const activeGoals = goals.filter((g) => !g.completed);
	const completedGoals = goals.filter((g) => g.completed);

	return (
		<div className="space-y-6">
			{/* Active Goals */}
			<div>
				<h4 className="mb-4 flex items-center gap-2 font-semibold">
					<TargetIcon className="size-5 text-primary" weight="duotone" />
					<Trans>Goals in Progress</Trans>
					<Badge variant="secondary">{activeGoals.length}</Badge>
				</h4>
				{activeGoals.length === 0 ? (
					<Card className="border-dashed">
						<CardContent className="flex flex-col items-center py-8 text-center">
							<TargetIcon className="mb-4 size-10 text-muted-foreground/50" />
							<p className="text-muted-foreground">
								<Trans>No active goals. Define your career goals!</Trans>
							</p>
						</CardContent>
					</Card>
				) : (
					<div className="grid gap-4 md:grid-cols-2">
						{activeGoals.map((goal) => {
							const config = GOAL_CATEGORY_CONFIG[goal.category];
							const GoalIcon = config.icon;
							const daysUntil = Math.ceil((new Date(goal.targetDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
							const progress = goal.targetValue && goal.currentValue ? (goal.currentValue / goal.targetValue) * 100 : 0;
							const isOverdue = daysUntil < 0;

							return (
								<motion.div key={goal.id} initial={false} animate={{ opacity: 1, y: 0 }}>
									<Card className={cn("h-full transition-all hover:shadow-md", isOverdue && "border-red-500/50")}>
										<CardContent className="p-4">
											<div className="mb-3 flex items-start justify-between">
												<div className="flex items-center gap-3">
													<div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
														<GoalIcon className="size-5 text-primary" weight="duotone" />
													</div>
													<div>
														<h5 className="font-medium">{goal.title}</h5>
														<Badge variant="outline" className="mt-1 text-xs">
															{config.label}
														</Badge>
													</div>
												</div>
												<div className="flex gap-1">
													<Tooltip>
														<TooltipTrigger asChild>
															<Button variant="ghost" size="icon-sm" onClick={() => onToggleComplete(goal.id)}>
																<CheckCircleIcon className="size-4 text-green-500" />
															</Button>
														</TooltipTrigger>
														<TooltipContent>
															<Trans>Mark as achieved</Trans>
														</TooltipContent>
													</Tooltip>
													<AlertDialog>
														<AlertDialogTrigger asChild>
															<Button variant="ghost" size="icon-sm">
																<TrashIcon className="size-4 text-destructive" />
															</Button>
														</AlertDialogTrigger>
														<AlertDialogContent>
															<AlertDialogHeader>
																<AlertDialogTitle>
																	<Trans>Delete this goal?</Trans>
																</AlertDialogTitle>
															</AlertDialogHeader>
															<AlertDialogFooter>
																<AlertDialogCancel>
																	<Trans>Cancel</Trans>
																</AlertDialogCancel>
																<AlertDialogAction onClick={() => onDelete(goal.id)}>
																	<Trans>Delete</Trans>
																</AlertDialogAction>
															</AlertDialogFooter>
														</AlertDialogContent>
													</AlertDialog>
												</div>
											</div>
											{goal.description && <p className="mb-3 text-muted-foreground text-sm">{goal.description}</p>}
											{goal.targetValue && (
												<div className="mb-3 space-y-1">
													<div className="flex items-center justify-between text-sm">
														<span className="text-muted-foreground">
															<Trans>Progress</Trans>
														</span>
														<span className="font-medium">
															{goal.currentValue?.toLocaleString("fr-FR") || 0} /{" "}
															{goal.targetValue.toLocaleString("fr-FR")}
														</span>
													</div>
													<Progress value={progress} className="h-2" />
												</div>
											)}
											<div className="flex items-center justify-between text-sm">
												<span className="text-muted-foreground">
													<Trans>Deadline</Trans>
												</span>
												<span className={cn("font-medium", isOverdue && "text-red-500")}>
													{isOverdue ? (
														<span className="flex items-center gap-1">
															<WarningCircleIcon className="size-4" />
															{Math.abs(daysUntil)} days overdue
														</span>
													) : (
														<span>{daysUntil} days remaining</span>
													)}
												</span>
											</div>
										</CardContent>
									</Card>
								</motion.div>
							);
						})}
					</div>
				)}
			</div>

			{/* Completed Goals */}
			{completedGoals.length > 0 && (
				<div>
					<h4 className="mb-4 flex items-center gap-2 font-semibold">
						<TrophyIcon className="size-5 text-green-500" weight="fill" />
						<Trans>Goals Achieved</Trans>
						<Badge className="bg-green-500">{completedGoals.length}</Badge>
					</h4>
					<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
						{completedGoals.map((goal) => {
							const config = GOAL_CATEGORY_CONFIG[goal.category];
							const GoalIcon = config.icon;

							return (
								<motion.div key={goal.id} initial={false} animate={{ opacity: 1, scale: 1 }}>
									<Card className="h-full border-green-500/30 bg-green-50/50 dark:bg-green-900/10">
										<CardContent className="p-4">
											<div className="flex items-start justify-between">
												<div className="flex items-center gap-3">
													<div className="flex size-10 items-center justify-center rounded-lg bg-green-500/20">
														<GoalIcon className="size-5 text-green-600" weight="fill" />
													</div>
													<div>
														<div className="flex items-center gap-2">
															<h5 className="font-medium">{goal.title}</h5>
															<CheckCircleIcon className="size-4 text-green-500" weight="fill" />
														</div>
														<p className="text-muted-foreground text-xs">
															{formatDate(goal.targetDate, { month: "short", year: "numeric" })}
														</p>
													</div>
												</div>
												<Button variant="ghost" size="icon-sm" onClick={() => onToggleComplete(goal.id)}>
													<XIcon className="size-3" />
												</Button>
											</div>
										</CardContent>
									</Card>
								</motion.div>
							);
						})}
					</div>
				</div>
			)}
		</div>
	);
}

// BenchmarkComparison
export function BenchmarkComparison({ currentSalary, experience }: { currentSalary: number; experience: number }) {
	const relevantBenchmarks = INDUSTRY_BENCHMARKS.filter((b) => Math.abs(b.experienceYears - experience) <= 2);

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2 text-lg">
					<ChartBarIcon className="size-5 text-primary" weight="duotone" />
					<Trans>Market Comparison</Trans>
				</CardTitle>
				<CardDescription>
					<Trans>Compare your salary with industry benchmarks in Morocco</Trans>
				</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="mb-6 rounded-lg bg-primary/5 p-4">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-muted-foreground text-sm">
								<Trans>Your current salary</Trans>
							</p>
							<p className="font-bold text-2xl text-primary">{currentSalary.toLocaleString("fr-FR")} DH</p>
						</div>
						<div className="text-right">
							<p className="text-muted-foreground text-sm">
								<Trans>Experience</Trans>
							</p>
							<p className="font-bold text-2xl">{experience} years</p>
						</div>
					</div>
				</div>

				<div className="space-y-4">
					{relevantBenchmarks.map((benchmark, index) => {
						const position =
							currentSalary <= benchmark.salaryMin
								? "below"
								: currentSalary >= benchmark.salaryMax
									? "above"
									: "within";
						const percentile = Math.round(
							((currentSalary - benchmark.salaryMin) / (benchmark.salaryMax - benchmark.salaryMin)) * 100,
						);

						return (
							<motion.div
								key={index}
								initial={false}
								animate={{ opacity: 1, x: 0 }}
								transition={{ delay: index * 0.1 }}
								className="rounded-lg border p-4"
							>
								<div className="mb-2 flex items-center justify-between">
									<h5 className="font-medium">{benchmark.role}</h5>
									<Badge variant="outline">{benchmark.experienceYears} years exp.</Badge>
								</div>
								<div className="mb-2 flex items-center justify-between text-muted-foreground text-sm">
									<span>{benchmark.salaryMin.toLocaleString("fr-FR")} DH</span>
									<span className="font-medium">{benchmark.salaryMedian.toLocaleString("fr-FR")} DH</span>
									<span>{benchmark.salaryMax.toLocaleString("fr-FR")} DH</span>
								</div>
								<div className="relative h-3 overflow-hidden rounded-full bg-muted">
									<div
										className="h-full bg-gradient-to-r from-red-400 via-yellow-400 to-green-400"
										style={{ width: "100%" }}
									/>
									{currentSalary >= benchmark.salaryMin && currentSalary <= benchmark.salaryMax && (
										<motion.div
											initial={{ scale: 0 }}
											animate={{ scale: 1 }}
											className="absolute top-1/2 size-4 -translate-y-1/2 rounded-full border-2 border-white bg-primary shadow-md"
											style={{ left: `calc(${Math.min(100, Math.max(0, percentile))}% - 8px)` }}
										/>
									)}
								</div>
								<p
									className={cn(
										"mt-2 text-sm",
										position === "above" && "text-green-600",
										position === "below" && "text-red-600",
										position === "within" && "text-amber-600",
									)}
								>
									{position === "above" && <Trans>Above market</Trans>}
									{position === "below" && <Trans>Below market</Trans>}
									{position === "within" && <Trans>At market average (Top {100 - percentile}%)</Trans>}
								</p>
							</motion.div>
						);
					})}
				</div>
			</CardContent>
		</Card>
	);
}

export interface HeroSectionProps {
	stats: {
		totalEvents: number;
		totalSkills: number;
		activeGoals: number;
		completedGoals: number;
		totalExperience: number;
		employmentGaps: number;
	};
}

export function HeroSection({ stats }: HeroSectionProps) {
	return (
		<motion.div
			className="relative mb-8 overflow-hidden rounded-3xl border border-primary/20 p-8 md:p-12"
			style={{
				background:
					"linear-gradient(135deg, oklch(0.7 0.15 200 / 0.15) 0%, oklch(0.6 0.2 260 / 0.1) 50%, oklch(0.65 0.18 180 / 0.08) 100%)",
			}}
			initial={false}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.6, ease: "easeOut" }}
		>
			<div className="pointer-events-none absolute inset-0 overflow-hidden">
				<motion.div
					className="absolute -top-32 -right-32 size-96 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/10 blur-3xl"
					animate={{
						scale: [1, 1.2, 1],
						rotate: [0, 10, 0],
						opacity: [0.5, 0.3, 0.5],
					}}
					transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
				/>
				<motion.div
					className="absolute -bottom-32 -left-32 size-96 rounded-full bg-gradient-to-tr from-green-500/15 to-cyan-500/10 blur-3xl"
					animate={{
						scale: [1.2, 1, 1.2],
						rotate: [0, -10, 0],
						opacity: [0.3, 0.5, 0.3],
					}}
					transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
				/>
			</div>

			<div className="relative z-10">
				<motion.div
					className="mb-3 flex items-center gap-2"
					initial={false}
					animate={{ opacity: 1, x: 0 }}
					transition={{ delay: 0.2 }}
				>
					<ChartLineUpIcon className="size-5 text-primary" weight="fill" />
					<span className="font-semibold text-primary text-sm uppercase tracking-wider">
						<Trans>Your Journey</Trans>
					</span>
				</motion.div>

				<motion.h2
					className="mb-4 bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text font-bold text-3xl text-transparent tracking-tight md:text-4xl lg:text-5xl"
					initial={false}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.3 }}
				>
					<Trans>Career Timeline</Trans>
				</motion.h2>

				<motion.p
					className="mb-8 max-w-2xl text-lg text-muted-foreground"
					initial={false}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.4 }}
				>
					<Trans>
						Visualize your professional journey, track your skills, set your goals and benchmark yourself against market
						benchmarks.
					</Trans>
				</motion.p>

				<motion.div
					className="flex flex-wrap items-center gap-6"
					initial={false}
					animate={{ opacity: 1 }}
					transition={{ delay: 0.5 }}
				>
					<div className="flex items-center gap-2">
						<div className="flex size-10 items-center justify-center rounded-full bg-primary/10">
							<BriefcaseIcon className="size-5 text-primary" weight="duotone" />
						</div>
						<div>
							<p className="font-bold text-xl">{stats.totalExperience}</p>
							<p className="text-muted-foreground text-sm">
								<Trans>Years of experience</Trans>
							</p>
						</div>
					</div>
					<div className="flex items-center gap-2">
						<div className="flex size-10 items-center justify-center rounded-full bg-amber-500/10">
							<LightbulbIcon className="size-5 text-amber-500" weight="duotone" />
						</div>
						<div>
							<p className="font-bold text-xl">{stats.totalSkills}</p>
							<p className="text-muted-foreground text-sm">
								<Trans>Skills</Trans>
							</p>
						</div>
					</div>
					<div className="flex items-center gap-2">
						<div className="flex size-10 items-center justify-center rounded-full bg-green-500/10">
							<TargetIcon className="size-5 text-green-500" weight="duotone" />
						</div>
						<div>
							<p className="font-bold text-xl">
								{stats.completedGoals}/{stats.activeGoals + stats.completedGoals}
							</p>
							<p className="text-muted-foreground text-sm">
								<Trans>Goals achieved</Trans>
							</p>
						</div>
					</div>
					{stats.employmentGaps > 0 && (
						<div className="flex items-center gap-2">
							<div className="flex size-10 items-center justify-center rounded-full bg-amber-500/10">
								<WarningCircleIcon className="size-5 text-amber-500" weight="duotone" />
							</div>
							<div>
								<p className="font-bold text-xl">{stats.employmentGaps}</p>
								<p className="text-muted-foreground text-sm">
									<Trans>Inactivity periods</Trans>
								</p>
							</div>
						</div>
					)}
				</motion.div>
			</div>
		</motion.div>
	);
}

export interface EventFormDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	editingEvent: TimelineEvent | null;
	eventType: EventType;
	onEventTypeChange: (v: EventType) => void;
	eventTitle: string;
	onEventTitleChange: (v: string) => void;
	eventOrg: string;
	onEventOrgChange: (v: string) => void;
	eventDesc: string;
	onEventDescChange: (v: string) => void;
	eventStartDate: string;
	onEventStartDateChange: (v: string) => void;
	eventEndDate: string;
	onEventEndDateChange: (v: string) => void;
	eventSalary: string;
	onEventSalaryChange: (v: string) => void;
	eventSkills: string;
	onEventSkillsChange: (v: string) => void;
	eventAchievements: string;
	onEventAchievementsChange: (v: string) => void;
	eventIsOngoing: boolean;
	onEventIsOngoingChange: (v: boolean) => void;
	onSave: () => void;
	onReset: () => void;
	isSaving: boolean;
}

export function EventFormDialog({
	open,
	onOpenChange,
	editingEvent,
	eventType,
	onEventTypeChange,
	eventTitle,
	onEventTitleChange,
	eventOrg,
	onEventOrgChange,
	eventDesc,
	onEventDescChange,
	eventStartDate,
	onEventStartDateChange,
	eventEndDate,
	onEventEndDateChange,
	eventSalary,
	onEventSalaryChange,
	eventSkills,
	onEventSkillsChange,
	eventAchievements,
	onEventAchievementsChange,
	eventIsOngoing,
	onEventIsOngoingChange,
	onSave,
	onReset,
	isSaving,
}: EventFormDialogProps) {
	return (
		<Dialog
			open={open}
			onOpenChange={(o) => {
				onOpenChange(o);
				if (!o) onReset();
			}}
		>
			<DialogTrigger asChild>
				<Button className="gap-2">
					<PlusCircleIcon className="size-4" />
					<Trans>Add an Event</Trans>
				</Button>
			</DialogTrigger>
			<DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
				<DialogHeader>
					<DialogTitle>{editingEvent ? <Trans>Edit Event</Trans> : <Trans>New Event</Trans>}</DialogTitle>
					<DialogDescription>
						<Trans>Add an event to your career timeline</Trans>
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-4 py-4">
					<div className="space-y-2">
						<label className="font-medium text-sm">
							<Trans>Event type</Trans>
						</label>
						<Select value={eventType} onValueChange={(v) => onEventTypeChange(v as EventType)}>
							<SelectTrigger>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{(Object.keys(EVENT_TYPE_CONFIG) as EventType[]).map((type) => {
									const config = EVENT_TYPE_CONFIG[type];
									const TypeIcon = config.icon;
									return (
										<SelectItem key={type} value={type}>
											<div className="flex items-center gap-2">
												<TypeIcon className={cn("size-4", config.color)} />
												{config.label}
											</div>
										</SelectItem>
									);
								})}
							</SelectContent>
						</Select>
					</div>

					<div className="space-y-2">
						<label className="font-medium text-sm">
							<Trans>Title</Trans>
						</label>
						<Input
							value={eventTitle}
							onChange={(e) => onEventTitleChange(e.target.value)}
							placeholder={t`E.g.: Full-Stack Developer`}
						/>
					</div>

					<div className="space-y-2">
						<label className="font-medium text-sm">
							<Trans>Organisation</Trans>
						</label>
						<Input value={eventOrg} onChange={(e) => onEventOrgChange(e.target.value)} placeholder={t`Ex: OCP Group`} />
					</div>

					<div className="grid grid-cols-2 gap-4">
						<div className="space-y-2">
							<label className="font-medium text-sm">
								<Trans>Start date</Trans>
							</label>
							<Input type="date" value={eventStartDate} onChange={(e) => onEventStartDateChange(e.target.value)} />
						</div>
						<div className="space-y-2">
							<label className="font-medium text-sm">
								<Trans>End date</Trans>
							</label>
							<Input
								type="date"
								value={eventEndDate}
								onChange={(e) => onEventEndDateChange(e.target.value)}
								disabled={eventIsOngoing}
							/>
						</div>
					</div>

					<div className="flex items-center gap-2">
						<input
							type="checkbox"
							id="ongoing"
							checked={eventIsOngoing}
							onChange={(e) => onEventIsOngoingChange(e.target.checked)}
							className="rounded"
						/>
						<label htmlFor="ongoing" className="text-sm">
							<Trans>In progress</Trans>
						</label>
					</div>

					{(eventType === "job" || eventType === "promotion") && (
						<div className="space-y-2">
							<label className="font-medium text-sm">
								<Trans>Salary (DH/month)</Trans>
							</label>
							<Input
								type="number"
								value={eventSalary}
								onChange={(e) => onEventSalaryChange(e.target.value)}
								placeholder={t`Ex: 15000`}
							/>
						</div>
					)}

					<div className="space-y-2">
						<label className="font-medium text-sm">
							<Trans>Description</Trans>
						</label>
						<Textarea
							value={eventDesc}
							onChange={(e) => onEventDescChange(e.target.value)}
							placeholder={t`Describe your responsibilities...`}
							rows={3}
						/>
					</div>

					<div className="space-y-2">
						<label className="font-medium text-sm">
							<Trans>Skills (comma-separated)</Trans>
						</label>
						<Input
							value={eventSkills}
							onChange={(e) => onEventSkillsChange(e.target.value)}
							placeholder={t`Ex: React, TypeScript, Node.js`}
						/>
					</div>

					<div className="space-y-2">
						<label className="font-medium text-sm">
							<Trans>Accomplishments (one per line)</Trans>
						</label>
						<Textarea
							value={eventAchievements}
							onChange={(e) => onEventAchievementsChange(e.target.value)}
							placeholder={t`E.g.: Increased sales by 25%\nLaunched a new product`}
							rows={3}
						/>
					</div>
				</div>

				<DialogFooter>
					<DialogClose asChild>
						<Button variant="outline">
							<Trans>Cancel</Trans>
						</Button>
					</DialogClose>
					<Button onClick={onSave} disabled={!eventTitle.trim() || !eventStartDate || isSaving}>
						{editingEvent ? <Trans>Save</Trans> : <Trans>Add</Trans>}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

export interface SkillFormDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	skillName: string;
	onSkillNameChange: (v: string) => void;
	skillCategory: string;
	onSkillCategoryChange: (v: string) => void;
	skillLevel: number[];
	onSkillLevelChange: (v: number[]) => void;
	skillDate: string;
	onSkillDateChange: (v: string) => void;
	onSave: () => void;
	isSaving: boolean;
}

export function SkillFormDialog({
	open,
	onOpenChange,
	skillName,
	onSkillNameChange,
	skillCategory,
	onSkillCategoryChange,
	skillLevel,
	onSkillLevelChange,
	skillDate,
	onSkillDateChange,
	onSave,
	isSaving,
}: SkillFormDialogProps) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogTrigger asChild>
				<Button className="gap-2">
					<PlusCircleIcon className="size-4" />
					<Trans>Add a Skill</Trans>
				</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>
						<Trans>New Skill</Trans>
					</DialogTitle>
				</DialogHeader>
				<div className="space-y-4 py-4">
					<div className="space-y-2">
						<label className="font-medium text-sm">
							<Trans>Skill name</Trans>
						</label>
						<Input
							value={skillName}
							onChange={(e) => onSkillNameChange(e.target.value)}
							placeholder={t`Ex: React.js`}
						/>
					</div>
					<div className="space-y-2">
						<label className="font-medium text-sm">
							<Trans>Category</Trans>
						</label>
						<Select value={skillCategory} onValueChange={onSkillCategoryChange}>
							<SelectTrigger>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{Object.entries(SKILL_CATEGORY_CONFIG).map(([key, config]) => (
									<SelectItem key={key} value={key}>
										{config.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
					<div className="space-y-2">
						<label className="font-medium text-sm">
							<Trans>Level (1-5)</Trans>
						</label>
						<div className="px-2 pt-2">
							<Slider value={skillLevel} onValueChange={onSkillLevelChange} min={1} max={5} step={1} />
							<div className="mt-2 flex justify-between text-muted-foreground text-xs">
								<span>
									<Trans>Beginner</Trans>
								</span>
								<span>
									<Trans>Expert</Trans>
								</span>
							</div>
						</div>
					</div>
					<div className="space-y-2">
						<label className="font-medium text-sm">
							<Trans>Acquisition date</Trans>
						</label>
						<Input type="date" value={skillDate} onChange={(e) => onSkillDateChange(e.target.value)} />
					</div>
				</div>
				<DialogFooter>
					<DialogClose asChild>
						<Button variant="outline">
							<Trans>Cancel</Trans>
						</Button>
					</DialogClose>
					<Button onClick={onSave} disabled={!skillName.trim() || !skillDate || isSaving}>
						<Trans>Add</Trans>
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

export interface GoalFormDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	goalTitle: string;
	onGoalTitleChange: (v: string) => void;
	goalDesc: string;
	onGoalDescChange: (v: string) => void;
	goalCategory: string;
	onGoalCategoryChange: (v: string) => void;
	goalTargetDate: string;
	onGoalTargetDateChange: (v: string) => void;
	goalTargetValue: string;
	onGoalTargetValueChange: (v: string) => void;
	goalCurrentValue: string;
	onGoalCurrentValueChange: (v: string) => void;
	onSave: () => void;
	isSaving: boolean;
}

export function GoalFormDialog({
	open,
	onOpenChange,
	goalTitle,
	onGoalTitleChange,
	goalDesc,
	onGoalDescChange,
	goalCategory,
	onGoalCategoryChange,
	goalTargetDate,
	onGoalTargetDateChange,
	goalTargetValue,
	onGoalTargetValueChange,
	goalCurrentValue,
	onGoalCurrentValueChange,
	onSave,
	isSaving,
}: GoalFormDialogProps) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogTrigger asChild>
				<Button className="gap-2">
					<PlusCircleIcon className="size-4" />
					<Trans>Set a Goal</Trans>
				</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>
						<Trans>New Goal</Trans>
					</DialogTitle>
				</DialogHeader>
				<div className="space-y-4 py-4">
					<div className="space-y-2">
						<label className="font-medium text-sm">
							<Trans>Goal title</Trans>
						</label>
						<Input
							value={goalTitle}
							onChange={(e) => onGoalTitleChange(e.target.value)}
							placeholder={t`E.g.: Become Tech Lead`}
						/>
					</div>
					<div className="space-y-2">
						<label className="font-medium text-sm">
							<Trans>Category</Trans>
						</label>
						<Select value={goalCategory} onValueChange={onGoalCategoryChange}>
							<SelectTrigger>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{Object.entries(GOAL_CATEGORY_CONFIG).map(([key, config]) => (
									<SelectItem key={key} value={key}>
										{config.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
					<div className="space-y-2">
						<label className="font-medium text-sm">
							<Trans>Description</Trans>
						</label>
						<Textarea
							value={goalDesc}
							onChange={(e) => onGoalDescChange(e.target.value)}
							placeholder={t`Describe your goal...`}
							rows={2}
						/>
					</div>
					<div className="space-y-2">
						<label className="font-medium text-sm">
							<Trans>Target date</Trans>
						</label>
						<Input type="date" value={goalTargetDate} onChange={(e) => onGoalTargetDateChange(e.target.value)} />
					</div>
					{goalCategory === "salary" && (
						<div className="grid grid-cols-2 gap-4">
							<div className="space-y-2">
								<label className="font-medium text-sm">
									<Trans>Target salary (DH)</Trans>
								</label>
								<Input
									type="number"
									value={goalTargetValue}
									onChange={(e) => onGoalTargetValueChange(e.target.value)}
									placeholder={t`Ex: 25000`}
								/>
							</div>
							<div className="space-y-2">
								<label className="font-medium text-sm">
									<Trans>Current salary (DH)</Trans>
								</label>
								<Input
									type="number"
									value={goalCurrentValue}
									onChange={(e) => onGoalCurrentValueChange(e.target.value)}
									placeholder={t`Ex: 15000`}
								/>
							</div>
						</div>
					)}
				</div>
				<DialogFooter>
					<DialogClose asChild>
						<Button variant="outline">
							<Trans>Cancel</Trans>
						</Button>
					</DialogClose>
					<Button onClick={onSave} disabled={!goalTitle.trim() || !goalTargetDate || isSaving}>
						<Trans>Set</Trans>
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

export interface AnalysisTabContentProps {
	employmentGaps: { start: string; end: string; duration: number }[];
	stats: {
		totalEvents: number;
		totalSkills: number;
		completedGoals: number;
		totalExperience: number;
	};
	events: TimelineEvent[];
	onExport: (format: "json" | "image") => void;
}

export function AnalysisTabContent({ employmentGaps, stats, events, onExport }: AnalysisTabContentProps) {
	return (
		<div className="space-y-6">
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2 text-lg">
						<WarningCircleIcon className="size-5 text-amber-500" weight="duotone" />
						<Trans>Inactivity Period Analysis</Trans>
					</CardTitle>
					<CardDescription>
						<Trans>Identify periods without employment in your journey</Trans>
					</CardDescription>
				</CardHeader>
				<CardContent>
					{employmentGaps.length === 0 ? (
						<div className="flex items-center gap-3 rounded-lg border border-green-500/50 bg-green-50 p-4 dark:bg-green-900/20">
							<CheckCircleIcon className="size-8 text-green-500" weight="fill" />
							<div>
								<p className="font-medium text-green-700 dark:text-green-400">
									<Trans>Excellent! No inactivity period detected</Trans>
								</p>
								<p className="text-green-600/80 text-sm dark:text-green-400/80">
									<Trans>Your professional journey is continuous.</Trans>
								</p>
							</div>
						</div>
					) : (
						<div className="space-y-4">
							{employmentGaps.map((gap, index) => (
								<div
									key={index}
									className="flex items-center gap-4 rounded-lg border border-amber-500/30 bg-amber-50/50 p-4 dark:bg-amber-900/10"
								>
									<div className="flex size-12 items-center justify-center rounded-full bg-amber-500/20">
										<ClockIcon className="size-6 text-amber-600" weight="duotone" />
									</div>
									<div className="flex-1">
										<p className="font-medium text-amber-700 dark:text-amber-400">
											{Math.round(gap.duration / 30)} months of inactivity
										</p>
										<p className="text-muted-foreground text-sm">
											{formatDate(gap.start, { month: "short", year: "numeric" })} -{" "}
											{formatDate(gap.end, { month: "short", year: "numeric" })}
										</p>
									</div>
									<Badge variant="outline" className="border-amber-500 text-amber-600">
										{gap.duration} days
									</Badge>
								</div>
							))}
							<p className="text-muted-foreground text-sm">
								<Trans>
									Inactivity periods longer than 30 days are highlighted. Prepare explanations for recruiters.
								</Trans>
							</p>
						</div>
					)}
				</CardContent>
			</Card>

			<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
				<Card className="border-blue-500/30 bg-blue-50/50 dark:bg-blue-900/10">
					<CardContent className="p-6 text-center">
						<BriefcaseIcon className="mx-auto mb-3 size-10 text-blue-600" weight="duotone" />
						<p className="font-bold text-3xl text-blue-600">{stats.totalEvents}</p>
						<p className="text-muted-foreground text-sm">
							<Trans>Events</Trans>
						</p>
					</CardContent>
				</Card>
				<Card className="border-purple-500/30 bg-purple-50/50 dark:bg-purple-900/10">
					<CardContent className="p-6 text-center">
						<LightbulbIcon className="mx-auto mb-3 size-10 text-purple-600" weight="duotone" />
						<p className="font-bold text-3xl text-purple-600">{stats.totalSkills}</p>
						<p className="text-muted-foreground text-sm">
							<Trans>Skills</Trans>
						</p>
					</CardContent>
				</Card>
				<Card className="border-green-500/30 bg-green-50/50 dark:bg-green-900/10">
					<CardContent className="p-6 text-center">
						<TrophyIcon className="mx-auto mb-3 size-10 text-green-600" weight="duotone" />
						<p className="font-bold text-3xl text-green-600">{stats.completedGoals}</p>
						<p className="text-muted-foreground text-sm">
							<Trans>Goals achieved</Trans>
						</p>
					</CardContent>
				</Card>
				<Card className="border-amber-500/30 bg-amber-50/50 dark:bg-amber-900/10">
					<CardContent className="p-6 text-center">
						<ClockIcon className="mx-auto mb-3 size-10 text-amber-600" weight="duotone" />
						<p className="font-bold text-3xl text-amber-600">{stats.totalExperience}</p>
						<p className="text-muted-foreground text-sm">
							<Trans>Years of experience</Trans>
						</p>
					</CardContent>
				</Card>
			</div>

			{events.some((e) => e.achievements && e.achievements.length > 0) && (
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2 text-lg">
							<MedalIcon className="size-5 text-amber-500" weight="fill" />
							<Trans>Your Career Highlights</Trans>
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="grid gap-4 md:grid-cols-2">
							{events
								.filter((e) => e.achievements && e.achievements.length > 0)
								.flatMap(
									(e) =>
										e.achievements?.map((achievement, i) => ({
											achievement,
											event: e,
											key: `${e.id}-${i}`,
										})) ?? [],
								)
								.slice(0, 8)
								.map(({ achievement, event, key }) => (
									<motion.div
										key={key}
										initial={false}
										animate={{ opacity: 1, x: 0 }}
										className="flex items-start gap-3 rounded-lg border p-3"
									>
										<TrophyIcon className="mt-0.5 size-5 shrink-0 text-amber-500" weight="fill" />
										<div>
											<p className="font-medium text-sm">{achievement}</p>
											<p className="text-muted-foreground text-xs">
												{event.title} @ {event.organization}
											</p>
										</div>
									</motion.div>
								))}
						</div>
					</CardContent>
				</Card>
			)}

			<Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-transparent">
				<CardContent className="flex flex-col items-center py-8 text-center">
					<DownloadSimpleIcon className="mb-4 size-12 text-primary" weight="duotone" />
					<h3 className="mb-2 font-bold text-xl">
						<Trans>Export Your Timeline</Trans>
					</h3>
					<p className="mb-6 max-w-md text-muted-foreground">
						<Trans>Download your career timeline to share or archive it.</Trans>
					</p>
					<div className="flex flex-wrap justify-center gap-4">
						<Button onClick={() => onExport("json")} className="gap-2">
							<DownloadSimpleIcon className="size-5" />
							<Trans>Export JSON</Trans>
						</Button>
						<Button variant="outline" onClick={() => onExport("image")} className="gap-2">
							<ImageIcon className="size-5" />
							<Trans>Capture screen</Trans>
						</Button>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
