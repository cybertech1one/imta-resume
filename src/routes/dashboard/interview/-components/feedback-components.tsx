import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import {
	ArrowRightIcon,
	CalendarIcon,
	CaretDownIcon,
	CaretUpIcon,
	ChartBarIcon,
	ChartLineUpIcon,
	CheckCircleIcon,
	ClipboardTextIcon,
	ClockIcon,
	DownloadSimpleIcon,
	LightbulbIcon,
	LinkIcon,
	ListBulletsIcon,
	PencilSimpleIcon,
	PlusIcon,
	ShareNetworkIcon,
	SparkleIcon,
	SpinnerIcon,
	TagIcon,
	TargetIcon,
	TrashIcon,
	TrendUpIcon,
	TrophyIcon,
	UserCircleIcon,
	WarningCircleIcon,
	XIcon,
} from "@phosphor-icons/react";
import { Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/utils/style";
import { categoryColors, categoryGradients, categoryLabels, priorityColors, priorityLabels } from "./feedback-config";
import type { FeedbackCategory, FeedbackItem, Goal, Pattern, TrendData } from "./feedback-types";

function AnimatedScore({ value, duration = 1500 }: { value: number; duration?: number }) {
	const [displayValue, setDisplayValue] = useState(0);

	useEffect(() => {
		let startTime: number;
		let animationFrame: number;

		const animate = (timestamp: number) => {
			if (!startTime) startTime = timestamp;
			const progress = Math.min((timestamp - startTime) / duration, 1);
			const easeOutQuart = 1 - (1 - progress) ** 4;
			setDisplayValue(Math.round(easeOutQuart * value));

			if (progress < 1) {
				animationFrame = requestAnimationFrame(animate);
			}
		};

		animationFrame = requestAnimationFrame(animate);
		return () => cancelAnimationFrame(animationFrame);
	}, [value, duration]);

	return <span>{displayValue}</span>;
}

function ProgressChart({ data, category }: { data: TrendData[]; category?: FeedbackCategory }) {
	const chartHeight = 200;
	const chartWidth = 100;

	const getCategoryValue = (d: TrendData, cat?: FeedbackCategory): number => {
		if (!cat) return d.overall;
		switch (cat) {
			case "technical":
				return d.technical;
			case "behavioral":
				return d.behavioral;
			case "communication":
				return d.communication;
			case "problem_solving":
				return d.problemSolving;
			case "leadership":
				return d.leadership;
			case "cultural_fit":
				return d.culturalFit;
			default:
				return d.overall;
		}
	};

	const values = data.map((d) => getCategoryValue(d, category));
	const minVal = Math.min(...values);
	const maxVal = Math.max(...values);
	const range = maxVal - minVal || 1;

	const getY = (value: number) => chartHeight - ((value - minVal) / range) * (chartHeight - 40);

	const pathData = values
		.map((value, index) => {
			const x = (index / (values.length - 1)) * chartWidth;
			const y = getY(value);
			return `${index === 0 ? "M" : "L"} ${x} ${y}`;
		})
		.join(" ");

	const areaPath = `${pathData} L ${chartWidth} ${chartHeight} L 0 ${chartHeight} Z`;

	return (
		<div className="relative h-[200px] w-full">
			<svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} preserveAspectRatio="none" className="h-full w-full">
				<defs>
					<linearGradient id="progressGradient" x1="0%" y1="0%" x2="0%" y2="100%">
						<stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.3" />
						<stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
					</linearGradient>
				</defs>
				<motion.path
					d={areaPath}
					fill="url(#progressGradient)"
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
					transition={{ duration: 2, ease: "easeOut" }}
				/>
				{values.map((value, index) => (
					<motion.circle
						key={index}
						cx={(index / (values.length - 1)) * chartWidth}
						cy={getY(value)}
						r="3"
						fill="hsl(var(--background))"
						stroke="hsl(var(--primary))"
						strokeWidth="2"
						initial={{ scale: 0 }}
						animate={{ scale: 1 }}
						transition={{ delay: 0.5 + index * 0.1 }}
					/>
				))}
			</svg>
			<div className="absolute right-0 bottom-0 left-0 flex justify-between text-muted-foreground text-xs">
				{data.map((d, i) => (
					<span key={i} className={i === 0 || i === data.length - 1 ? "" : "hidden md:block"}>
						{new Date(d.date).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
					</span>
				))}
			</div>
		</div>
	);
}

export function FeedbackCard({
	feedback,
	onEdit,
	onDelete,
	onToggleResolved,
	isDeleting,
	isToggling,
}: {
	feedback: FeedbackItem;
	onEdit: (id: string) => void;
	onDelete: (id: string) => void;
	onToggleResolved: (id: string) => void;
	isDeleting?: boolean;
	isToggling?: boolean;
}) {
	const [isOpen, setIsOpen] = useState(false);

	return (
		<motion.div initial={false} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} layout>
			<Collapsible open={isOpen} onOpenChange={setIsOpen}>
				<div
					className={cn(
						"rounded-xl border transition-all hover:shadow-md",
						feedback.type === "strength"
							? "border-green-200 bg-gradient-to-r from-green-50/50 to-transparent dark:border-green-900/50 dark:from-green-900/10"
							: "border-orange-200 bg-gradient-to-r from-orange-50/50 to-transparent dark:border-orange-900/50 dark:from-orange-900/10",
						feedback.isResolved && "opacity-60",
					)}
				>
					<CollapsibleTrigger asChild>
						<button className="flex w-full items-center justify-between p-4 text-left">
							<div className="flex items-center gap-3">
								<div
									className={cn(
										"flex size-10 items-center justify-center rounded-full",
										feedback.type === "strength"
											? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
											: "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400",
									)}
								>
									{feedback.type === "strength" ? (
										<CheckCircleIcon className="size-5" weight="fill" />
									) : (
										<TargetIcon className="size-5" weight="fill" />
									)}
								</div>
								<div className="flex-1">
									<div className="mb-1 flex flex-wrap items-center gap-2">
										<Badge className={categoryColors[feedback.category]}>{categoryLabels[feedback.category]}</Badge>
										<Badge variant="outline" className="text-xs">
											<CalendarIcon className="mr-1 size-3" />
											{new Date(feedback.date).toLocaleDateString()}
										</Badge>
										{feedback.priority === "high" && (
											<Badge className={priorityColors.high}>
												<Trans>High priority</Trans>
											</Badge>
										)}
									</div>
									<p className="line-clamp-1 font-medium text-sm">{feedback.content}</p>
								</div>
							</div>
							<div className="flex items-center gap-2">
								{feedback.sessionId && (
									<Link to="/dashboard/interview/results/$sessionId" params={{ sessionId: feedback.sessionId }}>
										<Button variant="ghost" size="icon" className="size-8">
											<LinkIcon className="size-4" />
										</Button>
									</Link>
								)}
								<motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
									<CaretDownIcon className="size-5 text-muted-foreground" />
								</motion.div>
							</div>
						</button>
					</CollapsibleTrigger>

					<CollapsibleContent>
						<div className="space-y-4 border-t p-4">
							<div>
								<h4 className="mb-2 font-semibold text-muted-foreground text-sm">
									<Trans>Full feedback</Trans>
								</h4>
								<p className="text-sm">{feedback.content}</p>
							</div>

							<div className="flex flex-wrap items-center gap-2">
								<UserCircleIcon className="size-4 text-muted-foreground" />
								<span className="text-muted-foreground text-sm">
									<Trans>Source: {feedback.source}</Trans>
								</span>
								{feedback.sessionTitle && (
									<>
										<span className="text-muted-foreground">|</span>
										<span className="text-muted-foreground text-sm">{feedback.sessionTitle}</span>
									</>
								)}
							</div>

							{feedback.tags.length > 0 && (
								<div className="flex flex-wrap gap-2">
									{feedback.tags.map((tag, idx) => (
										<Badge key={idx} variant="outline" className="text-xs">
											<TagIcon className="mr-1 size-3" />
											{tag}
										</Badge>
									))}
								</div>
							)}

							{feedback.actionItems.length > 0 && (
								<div className="rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-900 dark:bg-blue-900/20">
									<h5 className="mb-2 flex items-center gap-2 font-semibold text-blue-700 text-xs dark:text-blue-400">
										<ListBulletsIcon className="size-4" />
										<Trans>Action items</Trans>
									</h5>
									<ul className="space-y-1">
										{feedback.actionItems.map((item, idx) => (
											<li key={idx} className="flex items-start gap-2 text-blue-700 text-xs dark:text-blue-300">
												<ArrowRightIcon className="mt-0.5 size-3 shrink-0" />
												{item}
											</li>
										))}
									</ul>
								</div>
							)}

							{feedback.notes && (
								<div className="rounded-lg bg-muted/50 p-3">
									<h5 className="mb-1 font-semibold text-xs">
										<Trans>Personal notes</Trans>
									</h5>
									<p className="text-muted-foreground text-xs">{feedback.notes}</p>
								</div>
							)}

							<div className="flex justify-between border-t pt-4">
								<div className="flex gap-2">
									<Button
										variant="outline"
										size="sm"
										onClick={() => onToggleResolved(feedback.id)}
										disabled={isToggling}
									>
										{isToggling ? (
											<SpinnerIcon className="mr-1 size-4 animate-spin" />
										) : feedback.isResolved ? (
											<>
												<XIcon className="mr-1 size-4" />
												<Trans>Mark unresolved</Trans>
											</>
										) : (
											<>
												<CheckCircleIcon className="mr-1 size-4" />
												<Trans>Mark resolved</Trans>
											</>
										)}
									</Button>
								</div>
								<div className="flex gap-2">
									<Button variant="ghost" size="sm" onClick={() => onEdit(feedback.id)}>
										<PencilSimpleIcon className="mr-1 size-4" />
										<Trans>Edit</Trans>
									</Button>
									<Button
										variant="ghost"
										size="sm"
										className="text-destructive"
										onClick={() => onDelete(feedback.id)}
										disabled={isDeleting}
									>
										{isDeleting ? (
											<SpinnerIcon className="mr-1 size-4 animate-spin" />
										) : (
											<TrashIcon className="mr-1 size-4" />
										)}
										<Trans>Delete</Trans>
									</Button>
								</div>
							</div>
						</div>
					</CollapsibleContent>
				</div>
			</Collapsible>
		</motion.div>
	);
}

function GoalCard({
	goal,
	onToggleMilestone,
	isUpdating,
}: {
	goal: Goal;
	onToggleMilestone: (goalId: string, milestoneIndex: number) => void;
	isUpdating?: boolean;
}) {
	const completedMilestones = goal.milestones.filter((m) => m.completed).length;
	const totalMilestones = goal.milestones.length;

	const statusColors = {
		not_started: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400",
		in_progress: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
		completed: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
	};

	const statusLabels = {
		not_started: t`Not started`,
		in_progress: t`In progress`,
		completed: t`Completed`,
	};

	const isOverdue = new Date(goal.targetDate) < new Date() && goal.status !== "completed";

	return (
		<motion.div
			initial={false}
			animate={{ opacity: 1, scale: 1 }}
			className={cn(
				"rounded-xl border p-4 transition-all hover:shadow-md",
				"bg-gradient-to-br",
				categoryGradients[goal.category],
			)}
		>
			<div className="mb-3 flex items-start justify-between">
				<div className="flex items-center gap-2">
					<Badge className={categoryColors[goal.category]}>{categoryLabels[goal.category]}</Badge>
					<Badge className={statusColors[goal.status]}>{statusLabels[goal.status]}</Badge>
				</div>
				{isOverdue && (
					<Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
						<WarningCircleIcon className="mr-1 size-3" />
						<Trans>Overdue</Trans>
					</Badge>
				)}
			</div>

			<h3 className="mb-2 font-semibold">{goal.title}</h3>
			<p className="mb-4 text-muted-foreground text-sm">{goal.description}</p>

			<div className="mb-4">
				<div className="mb-1 flex items-center justify-between text-sm">
					<span className="text-muted-foreground">
						<Trans>Progress</Trans>
					</span>
					<span className="font-semibold">{goal.progress}%</span>
				</div>
				<Progress value={goal.progress} className="h-2" />
			</div>

			{totalMilestones > 0 && (
				<div className="mb-4 space-y-2">
					<h4 className="font-medium text-sm">
						<Trans>
							Milestones ({completedMilestones}/{totalMilestones})
						</Trans>
					</h4>
					{goal.milestones.map((milestone, idx) => (
						<button
							key={idx}
							type="button"
							className="flex w-full items-center gap-2 text-left text-sm"
							onClick={() => onToggleMilestone(goal.id, idx)}
							disabled={isUpdating}
						>
							<div
								className={cn(
									"flex size-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
									milestone.completed ? "border-green-500 bg-green-500 text-white" : "border-muted-foreground/30",
								)}
							>
								{milestone.completed && <CheckCircleIcon className="size-3" weight="bold" />}
							</div>
							<span className={cn(milestone.completed && "text-muted-foreground line-through")}>{milestone.title}</span>
						</button>
					))}
				</div>
			)}

			<div className="flex items-center justify-between border-t pt-3">
				<div className="flex items-center gap-1 text-muted-foreground text-xs">
					<CalendarIcon className="size-3" />
					<Trans>Target:</Trans> {new Date(goal.targetDate).toLocaleDateString()}
				</div>
			</div>
		</motion.div>
	);
}

function PatternCard({ pattern }: { pattern: Pattern }) {
	const typeConfig = {
		recurring_strength: {
			icon: TrophyIcon,
			label: t`Recurring strength`,
			color: "text-green-600",
			bg: "bg-green-100 dark:bg-green-900/30",
		},
		recurring_weakness: {
			icon: TargetIcon,
			label: t`Area to improve`,
			color: "text-orange-600",
			bg: "bg-orange-100 dark:bg-orange-900/30",
		},
		improvement_trend: {
			icon: TrendUpIcon,
			label: t`Positive trend`,
			color: "text-blue-600",
			bg: "bg-blue-100 dark:bg-blue-900/30",
		},
		decline_trend: {
			icon: CaretDownIcon,
			label: t`Trend to watch`,
			color: "text-red-600",
			bg: "bg-red-100 dark:bg-red-900/30",
		},
	};

	const config = typeConfig[pattern.type];
	const Icon = config.icon;

	return (
		<motion.div initial={false} animate={{ opacity: 1, y: 0 }} className="rounded-xl border bg-card p-4">
			<div className="mb-3 flex items-center justify-between">
				<div className={cn("flex items-center gap-2 rounded-full px-3 py-1", config.bg)}>
					<Icon className={cn("size-4", config.color)} weight="fill" />
					<span className={cn("font-medium text-sm", config.color)}>{config.label}</span>
				</div>
				<Badge variant="outline">
					<Trans>Confidence: {pattern.confidence}%</Trans>
				</Badge>
			</div>

			<Badge className={cn("mb-3", categoryColors[pattern.category])}>{categoryLabels[pattern.category]}</Badge>

			<p className="mb-4 text-sm">{pattern.description}</p>

			<div className="mb-3 flex items-center gap-2 text-muted-foreground text-xs">
				<SparkleIcon className="size-4" />
				<Trans>Detected {pattern.frequency} times in your feedback</Trans>
			</div>

			{pattern.recommendations.length > 0 && (
				<div className="rounded-lg bg-muted/50 p-3">
					<h5 className="mb-2 flex items-center gap-2 font-semibold text-xs">
						<LightbulbIcon className="size-4 text-amber-500" weight="fill" />
						<Trans>Recommendations</Trans>
					</h5>
					<ul className="space-y-1">
						{pattern.recommendations.map((rec, idx) => (
							<li key={idx} className="flex items-start gap-2 text-xs">
								<ArrowRightIcon className="mt-0.5 size-3 shrink-0 text-primary" />
								{rec}
							</li>
						))}
					</ul>
				</div>
			)}
		</motion.div>
	);
}

export function LoadingSkeleton() {
	return (
		<div className="space-y-4">
			<Skeleton className="h-64 w-full rounded-3xl" />
			<div className="flex gap-4">
				<Skeleton className="h-10 w-32" />
				<Skeleton className="h-10 w-32" />
			</div>
			<div className="grid gap-4 md:grid-cols-2">
				<Skeleton className="h-48 w-full" />
				<Skeleton className="h-48 w-full" />
			</div>
		</div>
	);
}

export function HeroSection({
	stats,
	trendChange,
}: {
	stats: { total: number; strengths: number; unresolvedCount: number };
	trendChange: number;
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
			transition={{ duration: 0.6, ease: "easeOut" }}
		>
			<div className="pointer-events-none absolute inset-0 overflow-hidden">
				<motion.div
					className="absolute -top-32 -right-32 size-96 rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/10 blur-3xl"
					animate={{ scale: [1, 1.2, 1], rotate: [0, 10, 0], opacity: [0.5, 0.3, 0.5] }}
					transition={{ duration: 10, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
				/>
				<motion.div
					className="absolute -bottom-32 -left-32 size-96 rounded-full bg-gradient-to-tr from-amber-500/15 to-green-500/10 blur-3xl"
					animate={{ scale: [1.2, 1, 1.2], rotate: [0, -10, 0], opacity: [0.3, 0.5, 0.3] }}
					transition={{ duration: 10, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
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
						<Trans>Analysis and Progress</Trans>
					</span>
				</motion.div>

				<motion.h2
					className="mb-4 bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text font-bold text-3xl text-transparent tracking-tight md:text-4xl"
					initial={false}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.3 }}
				>
					<Trans>Interview Feedback Tracker</Trans>
				</motion.h2>

				<motion.p
					className="mb-8 max-w-2xl text-lg text-muted-foreground"
					initial={false}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.4 }}
				>
					<Trans>
						Analyze your performance, identify trends, and turn every piece of feedback into an opportunity for
						improvement.
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
							<ClipboardTextIcon className="size-5 text-primary" weight="duotone" />
						</div>
						<div>
							<p className="font-bold text-xl">{stats.total}</p>
							<p className="text-muted-foreground text-sm">
								<Trans>Feedbacks</Trans>
							</p>
						</div>
					</div>
					<div className="flex items-center gap-2">
						<div className="flex size-10 items-center justify-center rounded-full bg-green-500/10">
							<TrophyIcon className="size-5 text-green-500" weight="duotone" />
						</div>
						<div>
							<p className="font-bold text-xl">{stats.strengths}</p>
							<p className="text-muted-foreground text-sm">
								<Trans>Strengths</Trans>
							</p>
						</div>
					</div>
					<div className="flex items-center gap-2">
						<div className="flex size-10 items-center justify-center rounded-full bg-amber-500/10">
							<TargetIcon className="size-5 text-amber-500" weight="duotone" />
						</div>
						<div>
							<p className="font-bold text-xl">{stats.unresolvedCount}</p>
							<p className="text-muted-foreground text-sm">
								<Trans>To improve</Trans>
							</p>
						</div>
					</div>
					<div className="flex items-center gap-2">
						<div
							className={cn(
								"flex size-10 items-center justify-center rounded-full",
								trendChange >= 0 ? "bg-green-500/10" : "bg-red-500/10",
							)}
						>
							{trendChange >= 0 ? (
								<CaretUpIcon className="size-5 text-green-500" weight="fill" />
							) : (
								<CaretDownIcon className="size-5 text-red-500" weight="fill" />
							)}
						</div>
						<div>
							<p className="font-bold text-xl">
								{trendChange >= 0 ? "+" : ""}
								{trendChange}%
							</p>
							<p className="text-muted-foreground text-sm">
								<Trans>This week</Trans>
							</p>
						</div>
					</div>
				</motion.div>
			</div>
		</motion.div>
	);
}

export function AddFeedbackDialog({
	open,
	onOpenChange,
	newFeedback,
	setNewFeedback,
	onSubmit,
	isPending,
	children,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	newFeedback: {
		category: FeedbackCategory;
		type: "strength" | "improvement";
		content: string;
		source: string;
		priority: "high" | "medium" | "low";
		actionItems: string;
		tags: string;
	};
	setNewFeedback: (fn: (prev: typeof newFeedback) => typeof newFeedback) => void;
	onSubmit: () => void;
	isPending: boolean;
	children: ReactNode;
}) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogTrigger asChild>{children}</DialogTrigger>
			<DialogContent className="max-w-lg">
				<DialogHeader>
					<DialogTitle>
						<Trans>New Feedback</Trans>
					</DialogTitle>
					<DialogDescription>
						<Trans>Record feedback received during an interview or practice session.</Trans>
					</DialogDescription>
				</DialogHeader>
				<div className="grid gap-4 py-4">
					<div className="grid gap-2">
						<Label>
							<Trans>Category</Trans>
						</Label>
						<Select
							value={newFeedback.category}
							onValueChange={(v) => setNewFeedback((prev) => ({ ...prev, category: v as FeedbackCategory }))}
						>
							<SelectTrigger>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{Object.entries(categoryLabels).map(([key, label]) => (
									<SelectItem key={key} value={key}>
										{label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
					<div className="grid gap-2">
						<Label>
							<Trans>Type</Trans>
						</Label>
						<Select
							value={newFeedback.type}
							onValueChange={(v) => setNewFeedback((prev) => ({ ...prev, type: v as "strength" | "improvement" }))}
						>
							<SelectTrigger>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="strength">
									<Trans>Strength</Trans>
								</SelectItem>
								<SelectItem value="improvement">
									<Trans>To improve</Trans>
								</SelectItem>
							</SelectContent>
						</Select>
					</div>
					<div className="grid gap-2">
						<Label>
							<Trans>Priority</Trans>
						</Label>
						<Select
							value={newFeedback.priority}
							onValueChange={(v) => setNewFeedback((prev) => ({ ...prev, priority: v as "high" | "medium" | "low" }))}
						>
							<SelectTrigger>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{Object.entries(priorityLabels).map(([key, label]) => (
									<SelectItem key={key} value={key}>
										{label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
					<div className="grid gap-2">
						<Label>
							<Trans>Source</Trans>
						</Label>
						<Input
							placeholder={t`Ex: Dr. Martin, AI Feedback, Coach...`}
							value={newFeedback.source}
							onChange={(e) => setNewFeedback((prev) => ({ ...prev, source: e.target.value }))}
						/>
					</div>
					<div className="grid gap-2">
						<Label>
							<Trans>Feedback</Trans>
						</Label>
						<Textarea
							placeholder={t`Describe the feedback received...`}
							value={newFeedback.content}
							onChange={(e) => setNewFeedback((prev) => ({ ...prev, content: e.target.value }))}
							className="min-h-[100px]"
						/>
					</div>
					<div className="grid gap-2">
						<Label>
							<Trans>Actions to take (one per line)</Trans>
						</Label>
						<Textarea
							placeholder={t`Practice the STAR method\nPrepare concrete examples`}
							value={newFeedback.actionItems}
							onChange={(e) => setNewFeedback((prev) => ({ ...prev, actionItems: e.target.value }))}
							className="min-h-[80px]"
						/>
					</div>
					<div className="grid gap-2">
						<Label>
							<Trans>Tags (separated by commas)</Trans>
						</Label>
						<Input
							placeholder={t`communication, STAR, examples`}
							value={newFeedback.tags}
							onChange={(e) => setNewFeedback((prev) => ({ ...prev, tags: e.target.value }))}
						/>
					</div>
				</div>
				<DialogFooter>
					<Button variant="outline" onClick={() => onOpenChange(false)}>
						<Trans>Cancel</Trans>
					</Button>
					<Button onClick={onSubmit} disabled={!newFeedback.content || !newFeedback.source || isPending}>
						{isPending && <SpinnerIcon className="mr-2 size-4 animate-spin" />}
						<PlusIcon className="mr-2 size-4" />
						<Trans>Add</Trans>
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

export function AddGoalDialog({
	open,
	onOpenChange,
	newGoal,
	setNewGoal,
	onSubmit,
	isPending,
	children,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	newGoal: {
		title: string;
		description: string;
		category: FeedbackCategory;
		targetDate: string;
		milestones: string;
	};
	setNewGoal: (fn: (prev: typeof newGoal) => typeof newGoal) => void;
	onSubmit: () => void;
	isPending: boolean;
	children: ReactNode;
}) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogTrigger asChild>{children}</DialogTrigger>
			<DialogContent className="max-w-lg">
				<DialogHeader>
					<DialogTitle>
						<Trans>Create a Goal</Trans>
					</DialogTitle>
					<DialogDescription>
						<Trans>Define a SMART goal based on your feedback.</Trans>
					</DialogDescription>
				</DialogHeader>
				<div className="grid gap-4 py-4">
					<div className="grid gap-2">
						<Label>
							<Trans>Title</Trans>
						</Label>
						<Input
							placeholder={t`E.g.: Improve structured communication`}
							value={newGoal.title}
							onChange={(e) => setNewGoal((prev) => ({ ...prev, title: e.target.value }))}
						/>
					</div>
					<div className="grid gap-2">
						<Label>
							<Trans>Description</Trans>
						</Label>
						<Textarea
							placeholder={t`Describe your goal in detail...`}
							value={newGoal.description}
							onChange={(e) => setNewGoal((prev) => ({ ...prev, description: e.target.value }))}
						/>
					</div>
					<div className="grid gap-2">
						<Label>
							<Trans>Category</Trans>
						</Label>
						<Select
							value={newGoal.category}
							onValueChange={(v) => setNewGoal((prev) => ({ ...prev, category: v as FeedbackCategory }))}
						>
							<SelectTrigger>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{Object.entries(categoryLabels).map(([key, label]) => (
									<SelectItem key={key} value={key}>
										{label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
					<div className="grid gap-2">
						<Label>
							<Trans>Target date</Trans>
						</Label>
						<Input
							type="date"
							value={newGoal.targetDate}
							onChange={(e) => setNewGoal((prev) => ({ ...prev, targetDate: e.target.value }))}
						/>
					</div>
					<div className="grid gap-2">
						<Label>
							<Trans>Milestones (one per line)</Trans>
						</Label>
						<Textarea
							placeholder={t`Learn the STAR method\nPrepare 10 examples\nPractice with a mentor`}
							value={newGoal.milestones}
							onChange={(e) => setNewGoal((prev) => ({ ...prev, milestones: e.target.value }))}
							className="min-h-[100px]"
						/>
					</div>
				</div>
				<DialogFooter>
					<Button variant="outline" onClick={() => onOpenChange(false)}>
						<Trans>Cancel</Trans>
					</Button>
					<Button onClick={onSubmit} disabled={!newGoal.title || !newGoal.targetDate || isPending}>
						{isPending && <SpinnerIcon className="mr-2 size-4 animate-spin" />}
						<PlusIcon className="mr-2 size-4" />
						<Trans>Create</Trans>
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

export function TrendsTabContent({
	trends,
	latestTrend,
	previousTrend,
	trendChange,
	stats,
	goalStats,
}: {
	trends: TrendData[];
	latestTrend: TrendData | null;
	previousTrend: TrendData | null;
	trendChange: number;
	stats: { total: number; strengths: number; improvements: number };
	goalStats: { inProgress?: number } | undefined;
}) {
	return (
		<div className="space-y-6">
			<Card className="overflow-hidden">
				<CardHeader className="bg-gradient-to-r from-primary/10 to-transparent">
					<CardTitle className="flex items-center gap-2">
						<TrendUpIcon className="size-5 text-primary" />
						<Trans>Overall Progress</Trans>
					</CardTitle>
					<CardDescription>
						<Trans>Track your performance over time</Trans>
					</CardDescription>
				</CardHeader>
				<CardContent className="p-6">
					{trends.length > 0 ? (
						<>
							<div className="mb-6 flex items-center justify-between">
								<div>
									<p className="text-muted-foreground text-sm">
										<Trans>Current score</Trans>
									</p>
									<p className="font-bold text-4xl text-primary">
										<AnimatedScore value={latestTrend?.overall ?? 0} />%
									</p>
								</div>
								<div
									className={cn(
										"flex items-center gap-1 rounded-full px-3 py-1",
										trendChange >= 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700",
									)}
								>
									{trendChange >= 0 ? (
										<CaretUpIcon className="size-4" weight="fill" />
									) : (
										<CaretDownIcon className="size-4" weight="fill" />
									)}
									<span className="font-semibold">{Math.abs(trendChange)}%</span>
								</div>
							</div>
							<ProgressChart data={trends} />
						</>
					) : (
						<div className="py-8 text-center">
							<ChartBarIcon className="mx-auto mb-4 size-12 text-muted-foreground" />
							<p className="text-muted-foreground">
								<Trans>Not enough data to display trends</Trans>
							</p>
						</div>
					)}
				</CardContent>
			</Card>

			{latestTrend && (
				<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
					{Object.entries(categoryLabels).map(([key, label]) => {
						const currentScore =
							key === "problem_solving"
								? latestTrend.problemSolving
								: key === "cultural_fit"
									? latestTrend.culturalFit
									: latestTrend[key as keyof TrendData];
						const previousScore = previousTrend
							? key === "problem_solving"
								? previousTrend.problemSolving
								: key === "cultural_fit"
									? previousTrend.culturalFit
									: previousTrend[key as keyof TrendData]
							: currentScore;
						const change = (currentScore as number) - (previousScore as number);

						return (
							<motion.div key={key} initial={false} animate={{ opacity: 1, y: 0 }}>
								<Card className={cn("h-full bg-gradient-to-br", categoryGradients[key as FeedbackCategory])}>
									<CardHeader className="pb-2">
										<CardTitle className="flex items-center justify-between text-base">
											<Badge className={categoryColors[key as FeedbackCategory]}>{label}</Badge>
											<span
												className={cn(
													"flex items-center gap-1 text-sm",
													change >= 0 ? "text-green-600" : "text-red-600",
												)}
											>
												{change >= 0 ? (
													<CaretUpIcon className="size-4" weight="fill" />
												) : (
													<CaretDownIcon className="size-4" weight="fill" />
												)}
												{Math.abs(change)}%
											</span>
										</CardTitle>
									</CardHeader>
									<CardContent>
										<div className="mb-2 flex items-end justify-between">
											<span className="font-bold text-3xl">{currentScore as number}%</span>
										</div>
										<Progress value={currentScore as number} className="h-2" />
									</CardContent>
								</Card>
							</motion.div>
						);
					})}
				</div>
			)}

			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<CalendarIcon className="size-5" />
						<Trans>Weekly Summary</Trans>
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="grid gap-4 md:grid-cols-4">
						<div className="rounded-lg bg-muted/50 p-4 text-center">
							<p className="mb-1 text-muted-foreground text-sm">
								<Trans>Feedback received</Trans>
							</p>
							<p className="font-bold text-2xl">{stats.total}</p>
						</div>
						<div className="rounded-lg bg-muted/50 p-4 text-center">
							<p className="mb-1 text-muted-foreground text-sm">
								<Trans>Strengths</Trans>
							</p>
							<p className="font-bold text-2xl">{stats.strengths}</p>
						</div>
						<div className="rounded-lg bg-muted/50 p-4 text-center">
							<p className="mb-1 text-muted-foreground text-sm">
								<Trans>To improve</Trans>
							</p>
							<p className="font-bold text-2xl">{stats.improvements}</p>
						</div>
						<div className="rounded-lg bg-muted/50 p-4 text-center">
							<p className="mb-1 text-muted-foreground text-sm">
								<Trans>Active goals</Trans>
							</p>
							<p className="font-bold text-2xl">{goalStats?.inProgress ?? 0}</p>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}

export function PatternsTabContent({
	patterns,
	onAnalyze,
	isAnalyzing,
}: {
	patterns: Pattern[];
	onAnalyze: () => void;
	isAnalyzing: boolean;
}) {
	return (
		<div className="space-y-6">
			<Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
				<CardContent className="flex items-center justify-between gap-4 p-6">
					<div className="flex items-center gap-4">
						<div className="flex size-14 items-center justify-center rounded-full bg-primary/10">
							<SparkleIcon className="size-7 text-primary" weight="fill" />
						</div>
						<div>
							<h3 className="mb-1 font-semibold text-lg">
								<Trans>Smart Analysis</Trans>
							</h3>
							<p className="text-muted-foreground">
								<Trans>
									Our algorithms analyze your feedback to identify recurring trends and offer personalized
									recommendations.
								</Trans>
							</p>
						</div>
					</div>
					<Button onClick={onAnalyze} disabled={isAnalyzing}>
						{isAnalyzing ? (
							<SpinnerIcon className="mr-2 size-4 animate-spin" />
						) : (
							<SparkleIcon className="mr-2 size-4" />
						)}
						<Trans>Analyze</Trans>
					</Button>
				</CardContent>
			</Card>

			<div className="grid gap-4 md:grid-cols-2">
				{patterns.map((pattern) => (
					<PatternCard key={pattern.id} pattern={pattern} />
				))}
			</div>

			{patterns.length === 0 && (
				<div className="py-12 text-center">
					<SparkleIcon className="mx-auto mb-4 size-12 text-muted-foreground" />
					<h4 className="mb-2 font-semibold text-lg">
						<Trans>Not enough data</Trans>
					</h4>
					<p className="text-muted-foreground">
						<Trans>Continue adding feedback so we can identify patterns.</Trans>
					</p>
				</div>
			)}
		</div>
	);
}

export function GoalsTabContent({
	goals,
	goalsLoading,
	goalStats,
	onToggleMilestone,
	isUpdating,
	onOpenAddGoal,
	addGoalDialog,
}: {
	goals: Goal[];
	goalsLoading: boolean;
	goalStats: { inProgress?: number; completed?: number; overdue?: number } | undefined;
	onToggleMilestone: (goalId: string, milestoneIndex: number) => void;
	isUpdating: boolean;
	onOpenAddGoal: () => void;
	addGoalDialog: ReactNode;
}) {
	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h3 className="font-semibold text-xl">
						<Trans>Development Goals</Trans>
					</h3>
					<p className="text-muted-foreground">
						<Trans>Define and track your goals based on feedback received.</Trans>
					</p>
				</div>
				{addGoalDialog}
			</div>

			<div className="grid gap-4 md:grid-cols-3">
				<Card className="bg-gradient-to-br from-blue-50 to-transparent dark:from-blue-900/20">
					<CardContent className="flex items-center gap-4 p-4">
						<div className="flex size-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
							<ClockIcon className="size-6 text-blue-600" />
						</div>
						<div>
							<p className="font-bold text-2xl">{goalStats?.inProgress ?? 0}</p>
							<p className="text-muted-foreground text-sm">
								<Trans>In progress</Trans>
							</p>
						</div>
					</CardContent>
				</Card>
				<Card className="bg-gradient-to-br from-green-50 to-transparent dark:from-green-900/20">
					<CardContent className="flex items-center gap-4 p-4">
						<div className="flex size-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
							<CheckCircleIcon className="size-6 text-green-600" />
						</div>
						<div>
							<p className="font-bold text-2xl">{goalStats?.completed ?? 0}</p>
							<p className="text-muted-foreground text-sm">
								<Trans>Completed</Trans>
							</p>
						</div>
					</CardContent>
				</Card>
				<Card className="bg-gradient-to-br from-amber-50 to-transparent dark:from-amber-900/20">
					<CardContent className="flex items-center gap-4 p-4">
						<div className="flex size-12 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
							<WarningCircleIcon className="size-6 text-amber-600" />
						</div>
						<div>
							<p className="font-bold text-2xl">{goalStats?.overdue ?? 0}</p>
							<p className="text-muted-foreground text-sm">
								<Trans>Overdue</Trans>
							</p>
						</div>
					</CardContent>
				</Card>
			</div>

			{goalsLoading ? (
				<div className="grid gap-4 md:grid-cols-2">
					<Skeleton className="h-64 w-full" />
					<Skeleton className="h-64 w-full" />
				</div>
			) : goals.length > 0 ? (
				<div className="grid gap-4 md:grid-cols-2">
					{goals.map((goal) => (
						<GoalCard key={goal.id} goal={goal} onToggleMilestone={onToggleMilestone} isUpdating={isUpdating} />
					))}
				</div>
			) : (
				<div className="py-12 text-center">
					<TargetIcon className="mx-auto mb-4 size-12 text-muted-foreground" />
					<h4 className="mb-2 font-semibold text-lg">
						<Trans>No goals defined</Trans>
					</h4>
					<p className="mb-4 text-muted-foreground">
						<Trans>Create your first goal based on your feedback.</Trans>
					</p>
					<Button onClick={onOpenAddGoal}>
						<PlusIcon className="mr-2 size-4" />
						<Trans>Create a goal</Trans>
					</Button>
				</div>
			)}
		</div>
	);
}

export function ShareExportSection({ onExport, isExporting }: { onExport: () => void; isExporting: boolean }) {
	return (
		<section className="mt-10">
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<ShareNetworkIcon className="size-5" />
						<Trans>Share with a Mentor</Trans>
					</CardTitle>
					<CardDescription>
						<Trans>Export your progress report to share with your coach or mentor.</Trans>
					</CardDescription>
				</CardHeader>
				<CardContent className="flex flex-wrap gap-4">
					<Button variant="outline" onClick={onExport} disabled={isExporting}>
						{isExporting ? (
							<SpinnerIcon className="mr-2 size-4 animate-spin" />
						) : (
							<DownloadSimpleIcon className="mr-2 size-4" />
						)}
						<Trans>Download JSON</Trans>
					</Button>
					<Button variant="outline" onClick={() => toast.info(t`PDF export is under development`)}>
						<DownloadSimpleIcon className="mr-2 size-4" />
						<Trans>Download PDF</Trans>
					</Button>
					<Button
						variant="outline"
						onClick={() => {
							navigator.clipboard.writeText(window.location.href);
							toast.success(t`Link copied to clipboard`);
						}}
					>
						<LinkIcon className="mr-2 size-4" />
						<Trans>Copy link</Trans>
					</Button>
				</CardContent>
			</Card>
		</section>
	);
}
