import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import {
	BellIcon,
	BellSimpleIcon,
	BuildingsIcon,
	CalendarIcon,
	CaretLeftIcon,
	CaretRightIcon,
	CheckCircleIcon,
	ClockIcon,
	NoteIcon,
	PencilSimpleIcon,
	PlusIcon,
	SpinnerIcon,
	StarIcon,
	TargetIcon,
	TimerIcon,
	TrashIcon,
	XCircleIcon,
} from "@phosphor-icons/react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import type { UseFormReturn } from "react-hook-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { formatDate } from "@/utils/format-date";
import { cn } from "@/utils/style";

import {
	DAYS_OF_WEEK,
	formatShortDate,
	formatTime,
	getDaysUntil,
	getDeadlineStatus,
	getUrgencyConfig,
	getUrgencyLevel,
	isSameDay,
	isToday,
	priorityConfig,
} from "./deadlines-config";
import type { Deadline, DeadlineFormValues, Priority } from "./deadlines-types";

// ---------------------------------------------------------------------------
// Countdown timer hook
// ---------------------------------------------------------------------------
function useCountdown(targetDate: string, targetTime: string) {
	const [timeLeft, setTimeLeft] = useState<{
		days: number;
		hours: number;
		minutes: number;
		seconds: number;
		isPast: boolean;
	}>({ days: 0, hours: 0, minutes: 0, seconds: 0, isPast: false });

	useEffect(() => {
		const calculateTimeLeft = () => {
			const target = new Date(`${targetDate}T${targetTime}`);
			const now = new Date();
			const diff = target.getTime() - now.getTime();

			if (diff <= 0) {
				return { days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true };
			}

			const days = Math.floor(diff / (1000 * 60 * 60 * 24));
			const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
			const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
			const seconds = Math.floor((diff % (1000 * 60)) / 1000);

			return { days, hours, minutes, seconds, isPast: false };
		};

		setTimeLeft(calculateTimeLeft());
		const interval = setInterval(() => setTimeLeft(calculateTimeLeft()), 1000);
		return () => clearInterval(interval);
	}, [targetDate, targetTime]);

	return timeLeft;
}

// ---------------------------------------------------------------------------
// Countdown display component
// ---------------------------------------------------------------------------
function CountdownTimer({ deadline }: { deadline: Deadline }) {
	const timeLeft = useCountdown(deadline.deadlineDate, deadline.deadlineTime);

	if (deadline.completed) {
		return (
			<div className="flex items-center gap-2 text-green-600 dark:text-green-400">
				<CheckCircleIcon className="size-5" weight="fill" />
				<span className="font-medium">
					<Trans>Terminée</Trans>
				</span>
			</div>
		);
	}

	if (timeLeft.isPast) {
		return (
			<div className="flex items-center gap-2 text-red-600 dark:text-red-400">
				<XCircleIcon className="size-5" weight="fill" />
				<span className="font-medium">
					<Trans>Échéance dépassée</Trans>
				</span>
			</div>
		);
	}

	const urgency = getUrgencyLevel(deadline.deadlineDate, deadline.deadlineTime);
	const urgencyConf = getUrgencyConfig(urgency);

	return (
		<div className={cn("flex items-center gap-3", urgencyConf.color)}>
			<TimerIcon className="size-5" weight="duotone" />
			<div className="flex items-center gap-2 font-mono text-sm">
				{timeLeft.days > 0 && (
					<div className={cn("rounded-lg px-2 py-1", urgencyConf.bgColor)}>
						<span className="font-bold">{timeLeft.days}</span>
						<span className="ml-1 text-xs">d</span>
					</div>
				)}
				<div className={cn("rounded-lg px-2 py-1", urgencyConf.bgColor)}>
					<span className="font-bold">{String(timeLeft.hours).padStart(2, "0")}</span>
					<span className="ml-1 text-xs">h</span>
				</div>
				<div className={cn("rounded-lg px-2 py-1", urgencyConf.bgColor)}>
					<span className="font-bold">{String(timeLeft.minutes).padStart(2, "0")}</span>
					<span className="ml-1 text-xs">m</span>
				</div>
				<div className={cn("rounded-lg px-2 py-1", urgencyConf.bgColor)}>
					<span className="font-bold">{String(timeLeft.seconds).padStart(2, "0")}</span>
					<span className="ml-1 text-xs">s</span>
				</div>
			</div>
		</div>
	);
}

// ---------------------------------------------------------------------------
// Shared props for deadline card actions
// ---------------------------------------------------------------------------
export interface DeadlineCardActions {
	onToggleReminder: (id: string) => void;
	onToggleComplete: (id: string) => void;
	onEdit: (deadline: Deadline) => void;
	onDelete: (id: string) => void;
	toggleReminderPending: boolean;
	toggleCompletePending: boolean;
}

// ---------------------------------------------------------------------------
// Deadline card component
// ---------------------------------------------------------------------------
interface DeadlineCardProps extends DeadlineCardActions {
	deadline: Deadline;
	compact?: boolean;
}

function DeadlineCard({
	deadline,
	compact = false,
	onToggleReminder,
	onToggleComplete,
	onEdit,
	onDelete,
	toggleReminderPending,
	toggleCompletePending,
}: DeadlineCardProps) {
	const status = getDeadlineStatus(deadline);
	const urgency = status === "upcoming" ? getUrgencyLevel(deadline.deadlineDate, deadline.deadlineTime) : null;
	const urgencyConf = urgency ? getUrgencyConfig(urgency) : null;
	const priorityConf = priorityConfig[deadline.priority];
	const PriorityIcon = priorityConf.icon;

	return (
		<motion.div
			key={deadline.id}
			initial={false}
			animate={{ opacity: 1, y: 0 }}
			exit={{ opacity: 0, scale: 0.95 }}
			layout
		>
			<Card
				className={cn(
					"group transition-shadow duration-300 hover:shadow-lg",
					deadline.completed && "opacity-60",
					urgencyConf && !deadline.completed && `border-l-4 ${urgencyConf.borderColor}`,
				)}
			>
				<CardContent className={cn(compact ? "p-4" : "p-5")}>
					<div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
						<div className="flex-1 space-y-3">
							{/* Header */}
							<div className="flex flex-wrap items-start gap-2">
								<h3 className={cn("font-semibold text-lg", deadline.completed && "text-muted-foreground line-through")}>
									{deadline.title}
								</h3>
								<div className="flex flex-wrap gap-2">
									<Badge className={cn(priorityConf.bgColor, priorityConf.color, "gap-1")}>
										<PriorityIcon className="size-3" />
										{priorityConf.label}
									</Badge>
									{urgencyConf && !deadline.completed && (
										<Badge className={cn(urgencyConf.bgColor, urgencyConf.color)}>{urgencyConf.label}</Badge>
									)}
									{deadline.completed && (
										<Badge className="gap-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
											<CheckCircleIcon className="size-3" weight="fill" />
											<Trans>Terminée</Trans>
										</Badge>
									)}
								</div>
							</div>

							{/* Company & Position */}
							<div className="flex flex-wrap items-center gap-4 text-muted-foreground text-sm">
								<span className="flex items-center gap-1">
									<BuildingsIcon className="size-4" />
									{deadline.company}
								</span>
								<span className="flex items-center gap-1">
									<TargetIcon className="size-4" />
									{deadline.position}
								</span>
							</div>

							{/* Date & Time */}
							<div className="flex flex-wrap items-center gap-4 text-sm">
								<span className="flex items-center gap-1 text-muted-foreground">
									<CalendarIcon className="size-4" />
									{formatDate(deadline.deadlineDate, {
										weekday: "long",
										day: "numeric",
										month: "long",
										year: "numeric",
									})}
								</span>
								<span className="flex items-center gap-1 text-muted-foreground">
									<ClockIcon className="size-4" />
									{formatTime(deadline.deadlineTime)}
								</span>
							</div>

							{/* Countdown */}
							{!compact && <CountdownTimer deadline={deadline} />}

							{/* Notes */}
							{!compact && deadline.notes && (
								<p className="line-clamp-2 text-muted-foreground text-sm">{deadline.notes}</p>
							)}

							{/* Reminder */}
							{deadline.reminderEnabled && deadline.reminderDate && (
								<div className="flex items-center gap-2 text-sm">
									<BellIcon className="size-4 text-primary" weight="fill" />
									<span className="text-muted-foreground">
										<Trans>Reminder:</Trans> {formatShortDate(deadline.reminderDate)}{" "}
										{deadline.reminderTime && formatTime(deadline.reminderTime)}
									</span>
								</div>
							)}
						</div>

						{/* Actions */}
						<div className="flex shrink-0 items-center gap-2">
							<Button
								variant="outline"
								size="icon"
								className="size-9"
								onClick={() => onToggleReminder(deadline.id)}
								disabled={toggleReminderPending}
							>
								{deadline.reminderEnabled ? (
									<BellIcon className="size-4 text-primary" weight="fill" />
								) : (
									<BellSimpleIcon className="size-4" />
								)}
							</Button>
							<Button
								variant="outline"
								size="icon"
								className={cn("size-9", deadline.completed && "text-green-600")}
								onClick={() => onToggleComplete(deadline.id)}
								disabled={toggleCompletePending}
							>
								<CheckCircleIcon className="size-4" weight={deadline.completed ? "fill" : "regular"} />
							</Button>
							<Button variant="outline" size="icon" className="size-9" onClick={() => onEdit(deadline)}>
								<PencilSimpleIcon className="size-4" />
							</Button>
							<Button
								variant="outline"
								size="icon"
								className="size-9 text-red-600 hover:bg-red-50 hover:text-red-700"
								onClick={() => onDelete(deadline.id)}
							>
								<TrashIcon className="size-4" />
							</Button>
						</div>
					</div>
				</CardContent>
			</Card>
		</motion.div>
	);
}

// ---------------------------------------------------------------------------
// Statistics panel component
// ---------------------------------------------------------------------------
interface StatsPanelProps {
	stats: {
		total: number;
		upcoming: number;
		past: number;
		completed: number;
		highPriority: number;
		thisWeek: number;
		byPriority: { high: number; medium: number; low: number };
	};
}

export function StatsPanel({ stats }: StatsPanelProps) {
	return (
		<Card className="mb-8">
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<NoteIcon className="size-5 text-primary" weight="duotone" />
					<Trans>Répartition par priorité</Trans>
				</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="grid gap-4 sm:grid-cols-3">
					{(["high", "medium", "low"] as Priority[]).map((priority) => {
						const config = priorityConfig[priority];
						const PIcon = config.icon;
						const count = stats.byPriority[priority];
						const percentage = stats.upcoming > 0 ? Math.round((count / stats.upcoming) * 100) : 0;

						return (
							<div key={priority} className="space-y-2">
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-2">
										<div className={cn("flex size-8 items-center justify-center rounded-lg", config.bgColor)}>
											<PIcon className={cn("size-4", config.color)} />
										</div>
										<span className="font-medium">{config.label}</span>
									</div>
									<span className="font-bold text-lg">{count}</span>
								</div>
								<div className="h-2 overflow-hidden rounded-full bg-muted">
									<motion.div
										className={cn("h-full rounded-full", config.bgColor.replace("bg-", "bg-").replace("/30", ""))}
										initial={{ width: 0 }}
										animate={{ width: `${percentage}%` }}
										transition={{ duration: 0.8, ease: "easeOut" }}
										style={{
											backgroundColor:
												priority === "high"
													? "rgb(220, 38, 38)"
													: priority === "medium"
														? "rgb(217, 119, 6)"
														: "rgb(22, 163, 74)",
										}}
									/>
								</div>
							</div>
						);
					})}
				</div>
			</CardContent>
		</Card>
	);
}

// ---------------------------------------------------------------------------
// Hero section component
// ---------------------------------------------------------------------------
interface HeroSectionProps {
	stats: StatsPanelProps["stats"];
}

export function HeroSection({ stats }: HeroSectionProps) {
	return (
		<motion.div
			className="relative mb-8 overflow-hidden rounded-2xl border bg-card p-6 shadow-sm md:p-8"
			initial={false}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.6, ease: "easeOut" }}
		>
			<div className="relative z-10">
				<motion.div
					className="mb-3 flex items-center gap-2"
					initial={false}
					animate={{ opacity: 1, x: 0 }}
					transition={{ delay: 0.2 }}
				>
					<TimerIcon className="size-5 text-primary" weight="fill" />
					<span className="font-semibold text-primary text-sm uppercase tracking-wider">
						<Trans>Gestion des candidatures</Trans>
					</span>
				</motion.div>

				<motion.h2
					className="mb-4 max-w-4xl font-bold text-3xl tracking-tight md:text-4xl"
					initial={false}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.3 }}
				>
					<Trans>Suivi des échéances</Trans>
				</motion.h2>

				<motion.p
					className="mb-8 max-w-2xl text-lg text-muted-foreground"
					initial={false}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.4 }}
				>
					<Trans>
						Ne manque plus aucune date limite. Suis tes candidatures, active les rappels et garde une vision claire de
						tes prochaines actions.
					</Trans>
				</motion.p>

				{/* Stats */}
				<motion.div
					className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-6"
					initial={false}
					animate={{ opacity: 1 }}
					transition={{ delay: 0.5 }}
				>
					<div className="rounded-xl border border-white/20 bg-white/50 p-4 backdrop-blur-sm dark:bg-black/20">
						<p className="font-bold text-2xl">{stats.total}</p>
						<p className="text-muted-foreground text-sm">
							<Trans>Total</Trans>
						</p>
					</div>
					<div className="rounded-xl border border-white/20 bg-white/50 p-4 backdrop-blur-sm dark:bg-black/20">
						<p className="font-bold text-2xl text-blue-600 dark:text-blue-400">{stats.upcoming}</p>
						<p className="text-muted-foreground text-sm">
							<Trans>À venir</Trans>
						</p>
					</div>
					<div className="rounded-xl border border-white/20 bg-white/50 p-4 backdrop-blur-sm dark:bg-black/20">
						<p className="font-bold text-2xl text-red-600 dark:text-red-400">{stats.highPriority}</p>
						<p className="text-muted-foreground text-sm">
							<Trans>High priority</Trans>
						</p>
					</div>
					<div className="rounded-xl border border-white/20 bg-white/50 p-4 backdrop-blur-sm dark:bg-black/20">
						<p className="font-bold text-2xl text-amber-600 dark:text-amber-400">{stats.thisWeek}</p>
						<p className="text-muted-foreground text-sm">
							<Trans>Cette semaine</Trans>
						</p>
					</div>
					<div className="rounded-xl border border-white/20 bg-white/50 p-4 backdrop-blur-sm dark:bg-black/20">
						<p className="font-bold text-2xl text-green-600 dark:text-green-400">{stats.completed}</p>
						<p className="text-muted-foreground text-sm">
							<Trans>Terminées</Trans>
						</p>
					</div>
					<div className="rounded-xl border border-white/20 bg-white/50 p-4 backdrop-blur-sm dark:bg-black/20">
						<p className="font-bold text-2xl text-gray-600 dark:text-gray-400">{stats.past}</p>
						<p className="text-muted-foreground text-sm">
							<Trans>En retard</Trans>
						</p>
					</div>
				</motion.div>
			</div>
		</motion.div>
	);
}

// ---------------------------------------------------------------------------
// Timeline view component
// ---------------------------------------------------------------------------
interface TimelineViewProps {
	groupedDeadlines: Record<string, Deadline[]>;
	searchQuery: string;
	statusFilter: string;
	priorityFilter: string;
	onOpenAddDialog: () => void;
	cardActions: DeadlineCardActions;
}

export function TimelineView({
	groupedDeadlines,
	searchQuery,
	statusFilter,
	priorityFilter,
	onOpenAddDialog,
	cardActions,
}: TimelineViewProps) {
	return (
		<AnimatePresence mode="popLayout">
			{Object.keys(groupedDeadlines).length > 0 ? (
				<div className="space-y-8">
					{Object.entries(groupedDeadlines).map(([date, dateDeadlines]) => {
						const days = getDaysUntil(date, "23:59");
						const isPast = days < 0;
						const isTodayDate = days === 0;

						return (
							<motion.div
								key={date}
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								className="relative"
							>
								{/* Date Header */}
								<div className="mb-4 flex items-center gap-4">
									<div
										className={cn(
											"flex size-14 shrink-0 flex-col items-center justify-center rounded-xl border-2",
											isTodayDate && "border-primary bg-primary/10",
											isPast && "border-gray-300 bg-gray-100 dark:border-gray-700 dark:bg-gray-800",
											!isTodayDate && !isPast && "border-blue-500 bg-blue-50 dark:bg-blue-900/20",
										)}
									>
										<span className="font-bold text-xl">{new Date(date).getDate()}</span>
										<span className="text-muted-foreground text-xs uppercase">
											{new Date(date).toLocaleDateString(undefined, { month: "short" })}
										</span>
									</div>
									<div>
										<h3 className="font-semibold text-lg">
											{new Date(date).toLocaleDateString(undefined, { weekday: "long" })}
										</h3>
										<p className="text-muted-foreground text-sm">
											{isTodayDate ? (
												<Trans>Aujourd'hui</Trans>
											) : isPast ? (
												<Trans>Il y a {Math.abs(days)} jour(s)</Trans>
											) : (
												<Trans>Dans {days} jour(s)</Trans>
											)}
										</p>
									</div>
									<Badge variant="secondary" className="ml-auto">
										{dateDeadlines.length} <Trans>échéance(s)</Trans>
									</Badge>
								</div>

								{/* Deadlines for this date */}
								<div className="ml-7 space-y-4 border-muted border-l-2 pl-8">
									{dateDeadlines.map((deadline) => (
										<DeadlineCard key={deadline.id} deadline={deadline} {...cardActions} />
									))}
								</div>
							</motion.div>
						);
					})}
				</div>
			) : (
				<EmptyState
					searchQuery={searchQuery}
					statusFilter={statusFilter}
					priorityFilter={priorityFilter}
					onOpenAddDialog={onOpenAddDialog}
				/>
			)}
		</AnimatePresence>
	);
}

// ---------------------------------------------------------------------------
// Calendar view component
// ---------------------------------------------------------------------------
interface CalendarViewProps {
	currentMonth: Date;
	calendarDays: Date[];
	deadlinesByDate: Record<string, Deadline[]>;
	selectedDate: Date | null;
	onSelectDate: (date: Date) => void;
	onNavigateMonth: (direction: "prev" | "next") => void;
	onSetCurrentMonth: (date: Date) => void;
	onOpenAddDialogForDate: (date: Date) => void;
	cardActions: DeadlineCardActions;
}

export function CalendarView({
	currentMonth,
	calendarDays,
	deadlinesByDate,
	selectedDate,
	onSelectDate,
	onNavigateMonth,
	onSetCurrentMonth,
	onOpenAddDialogForDate,
	cardActions,
}: CalendarViewProps) {
	return (
		<>
			<Card>
				<CardHeader className="pb-4">
					<div className="flex items-center justify-between">
						<CardTitle className="flex items-center gap-2">
							<CalendarIcon className="size-5" weight="duotone" />
							{currentMonth.toLocaleDateString(undefined, { month: "long", year: "numeric" })}
						</CardTitle>
						<div className="flex items-center gap-2">
							<Button variant="outline" size="icon" onClick={() => onNavigateMonth("prev")}>
								<CaretLeftIcon className="size-4" />
							</Button>
							<Button variant="outline" size="sm" onClick={() => onSetCurrentMonth(new Date())}>
								<Trans>Aujourd'hui</Trans>
							</Button>
							<Button variant="outline" size="icon" onClick={() => onNavigateMonth("next")}>
								<CaretRightIcon className="size-4" />
							</Button>
						</div>
					</div>
				</CardHeader>
				<CardContent>
					{/* Calendar Header */}
					<div className="mb-2 grid grid-cols-7 gap-1">
						{DAYS_OF_WEEK.map((day) => (
							<div key={day.value} className="py-2 text-center font-medium text-muted-foreground text-sm">
								{day.short}
							</div>
						))}
					</div>

					{/* Calendar Grid */}
					<div className="grid grid-cols-7 gap-1">
						{calendarDays.map((date, index) => {
							const dateStr = date.toISOString().split("T")[0];
							const dayDeadlines = deadlinesByDate[dateStr] || [];
							const isCurrentMonth = date.getMonth() === currentMonth.getMonth();
							const isSelected = selectedDate && isSameDay(date, selectedDate);
							const isPast = date < new Date() && !isToday(date);

							return (
								<motion.button
									key={index}
									type="button"
									className={cn(
										"relative min-h-24 rounded-lg border p-2 text-left transition-all hover:border-primary/50",
										!isCurrentMonth && "bg-muted/30 text-muted-foreground",
										isToday(date) && "border-primary bg-primary/5",
										isSelected && "border-primary ring-2 ring-primary/20",
										isPast && !isCurrentMonth && "opacity-40",
									)}
									onClick={() => onSelectDate(date)}
									whileHover={{ scale: 1.02 }}
									whileTap={{ scale: 0.98 }}
								>
									<span
										className={cn(
											"flex size-7 items-center justify-center rounded-full text-sm",
											isToday(date) && "bg-primary font-semibold text-primary-foreground",
										)}
									>
										{date.getDate()}
									</span>

									{/* Deadline indicators */}
									<div className="mt-1 space-y-1">
										{dayDeadlines.slice(0, 2).map((deadline) => {
											const urgency =
												getDeadlineStatus(deadline) === "upcoming"
													? getUrgencyLevel(deadline.deadlineDate, deadline.deadlineTime)
													: null;
											const urgencyConf = urgency ? getUrgencyConfig(urgency) : null;

											return (
												<div
													key={deadline.id}
													className={cn(
														"truncate rounded px-1.5 py-0.5 text-xs",
														deadline.completed
															? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
															: urgencyConf
																? cn(urgencyConf.bgColor, urgencyConf.color)
																: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
													)}
												>
													{formatTime(deadline.deadlineTime)} {deadline.company}
												</div>
											);
										})}
										{dayDeadlines.length > 2 && (
											<div className="text-center text-muted-foreground text-xs">+{dayDeadlines.length - 2}</div>
										)}
									</div>
								</motion.button>
							);
						})}
					</div>
				</CardContent>
			</Card>

			{/* Selected Date Details */}
			{selectedDate && (
				<motion.div initial={false} animate={{ opacity: 1, y: 0 }} className="mt-6">
					<Card>
						<CardHeader>
							<div className="flex items-center justify-between">
								<CardTitle>
									{formatDate(selectedDate.toISOString(), {
										weekday: "long",
										day: "numeric",
										month: "long",
										year: "numeric",
									})}
								</CardTitle>
								<Button size="sm" className="gap-2" onClick={() => onOpenAddDialogForDate(selectedDate)}>
									<PlusIcon className="size-4" />
									<Trans>Add</Trans>
								</Button>
							</div>
						</CardHeader>
						<CardContent>
							{deadlinesByDate[selectedDate.toISOString().split("T")[0]]?.length > 0 ? (
								<div className="space-y-4">
									{deadlinesByDate[selectedDate.toISOString().split("T")[0]].map((deadline) => (
										<DeadlineCard key={deadline.id} deadline={deadline} compact {...cardActions} />
									))}
								</div>
							) : (
								<p className="text-center text-muted-foreground">
									<Trans>Aucune échéance aujourd'hui</Trans>
								</p>
							)}
						</CardContent>
					</Card>
				</motion.div>
			)}
		</>
	);
}

// ---------------------------------------------------------------------------
// List view component
// ---------------------------------------------------------------------------
interface ListViewProps {
	filteredDeadlines: Deadline[];
	searchQuery: string;
	statusFilter: string;
	priorityFilter: string;
	onOpenAddDialog: () => void;
	cardActions: DeadlineCardActions;
}

export function ListView({
	filteredDeadlines,
	searchQuery,
	statusFilter,
	priorityFilter,
	onOpenAddDialog,
	cardActions,
}: ListViewProps) {
	return (
		<AnimatePresence mode="popLayout">
			{filteredDeadlines.length > 0 ? (
				<div className="space-y-4">
					{filteredDeadlines.map((deadline) => (
						<DeadlineCard key={deadline.id} deadline={deadline} {...cardActions} />
					))}
				</div>
			) : (
				<EmptyState
					searchQuery={searchQuery}
					statusFilter={statusFilter}
					priorityFilter={priorityFilter}
					onOpenAddDialog={onOpenAddDialog}
				/>
			)}
		</AnimatePresence>
	);
}

// ---------------------------------------------------------------------------
// Upcoming deadlines widget
// ---------------------------------------------------------------------------
interface UpcomingWidgetProps {
	filteredDeadlines: Deadline[];
	statsUpcoming: number;
	activeTab: string;
	cardActions: DeadlineCardActions;
}

export function UpcomingWidget({ filteredDeadlines, statsUpcoming, activeTab, cardActions }: UpcomingWidgetProps) {
	if (statsUpcoming <= 0 || activeTab === "list") return null;

	return (
		<section className="mt-8">
			<h3 className="mb-4 flex items-center gap-2 font-semibold text-xl">
				<StarIcon className="size-5 text-amber-500" weight="fill" />
				<Trans>Échéances urgentes à venir</Trans>
			</h3>
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
				{filteredDeadlines
					.filter((d) => !d.completed && getDaysUntil(d.deadlineDate, d.deadlineTime) >= 0)
					.slice(0, 3)
					.map((deadline) => (
						<DeadlineCard key={deadline.id} deadline={deadline} compact {...cardActions} />
					))}
			</div>
		</section>
	);
}

// ---------------------------------------------------------------------------
// Empty state component
// ---------------------------------------------------------------------------
interface EmptyStateProps {
	searchQuery: string;
	statusFilter: string;
	priorityFilter: string;
	onOpenAddDialog: () => void;
}

function EmptyState({ searchQuery, statusFilter, priorityFilter, onOpenAddDialog }: EmptyStateProps) {
	return (
		<Card className="border-dashed">
			<CardContent className="flex flex-col items-center justify-center py-16">
				<CalendarIcon className="mb-4 size-16 text-muted-foreground/50" weight="duotone" />
				<h3 className="mb-2 font-semibold text-lg">
					<Trans>Aucune échéance trouvée</Trans>
				</h3>
				<p className="mb-4 text-center text-muted-foreground">
					{searchQuery || statusFilter !== "all" || priorityFilter !== "all" ? (
						<Trans>Modifie tes filtres</Trans>
					) : (
						<Trans>Commence par ajouter une échéance</Trans>
					)}
				</p>
				{!searchQuery && statusFilter === "all" && priorityFilter === "all" && (
					<Button onClick={onOpenAddDialog}>
						<PlusIcon className="mr-2 size-4" />
						<Trans>Ajouter une échéance</Trans>
					</Button>
				)}
			</CardContent>
		</Card>
	);
}

// ---------------------------------------------------------------------------
// Add/Edit dialog component
// ---------------------------------------------------------------------------
interface DeadlineFormDialogProps {
	isOpen: boolean;
	editingDeadline: Deadline | null;
	form: UseFormReturn<DeadlineFormValues>;
	onOpenChange: (open: boolean) => void;
	onSubmit: (values: DeadlineFormValues) => void;
	createPending: boolean;
	updatePending: boolean;
}

export function DeadlineFormDialog({
	isOpen,
	editingDeadline,
	form,
	onOpenChange,
	onSubmit,
	createPending,
	updatePending,
}: DeadlineFormDialogProps) {
	return (
		<Dialog open={isOpen} onOpenChange={onOpenChange}>
			<DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
				<DialogHeader>
					<DialogTitle>
						{editingDeadline ? <Trans>Modifier l'échéance</Trans> : <Trans>Nouvelle échéance</Trans>}
					</DialogTitle>
					<DialogDescription>
						{editingDeadline ? (
							<Trans>Mets à jour les informations de cette échéance</Trans>
						) : (
							<Trans>Ajoute une nouvelle échéance à suivre</Trans>
						)}
					</DialogDescription>
				</DialogHeader>

				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
						{/* Title */}
						<FormField
							control={form.control}
							name="title"
							render={({ field }) => (
								<FormItem>
									<FormLabel>
										<Trans>Titre</Trans> *
									</FormLabel>
									<FormControl>
										<Input placeholder={t`Ex. : candidature infirmier`} {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						{/* Company & Position */}
						<div className="grid gap-4 sm:grid-cols-2">
							<FormField
								control={form.control}
								name="company"
								render={({ field }) => (
									<FormItem>
										<FormLabel>
											<Trans>Entreprise</Trans> *
										</FormLabel>
										<FormControl>
											<Input placeholder={t`Ex. : CHU Ibn Sina`} {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="position"
								render={({ field }) => (
									<FormItem>
										<FormLabel>
											<Trans>Poste</Trans>
										</FormLabel>
										<FormControl>
											<Input placeholder={t`Ex. : Infirmier`} {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						{/* Date & Time */}
						<div className="grid gap-4 sm:grid-cols-2">
							<FormField
								control={form.control}
								name="deadlineDate"
								render={({ field }) => (
									<FormItem>
										<FormLabel>
											<Trans>Date limite</Trans> *
										</FormLabel>
										<FormControl>
											<Input type="date" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="deadlineTime"
								render={({ field }) => (
									<FormItem>
										<FormLabel>
											<Trans>Heure limite</Trans>
										</FormLabel>
										<FormControl>
											<Input type="time" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						{/* Priority */}
						<FormField
							control={form.control}
							name="priority"
							render={({ field }) => (
								<FormItem>
									<FormLabel>
										<Trans>Priorité</Trans>
									</FormLabel>
									<Select value={field.value} onValueChange={field.onChange}>
										<FormControl>
											<SelectTrigger>
												<SelectValue />
											</SelectTrigger>
										</FormControl>
										<SelectContent>
											{(["high", "medium", "low"] as Priority[]).map((p) => {
												const config = priorityConfig[p];
												const PIcon = config.icon;
												return (
													<SelectItem key={p} value={p}>
														<div className="flex items-center gap-2">
															<PIcon className="size-4" />
															{config.label}
														</div>
													</SelectItem>
												);
											})}
										</SelectContent>
									</Select>
									<FormMessage />
								</FormItem>
							)}
						/>

						{/* Notes */}
						<FormField
							control={form.control}
							name="notes"
							render={({ field }) => (
								<FormItem>
									<FormLabel>
										<Trans>Notes</Trans>
									</FormLabel>
									<FormControl>
										<Textarea placeholder={t`Notes ou consignes...`} rows={3} {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						{/* Reminder */}
						<div className="space-y-4 rounded-lg border p-4">
							<FormField
								control={form.control}
								name="reminderEnabled"
								render={({ field }) => (
									<FormItem className="flex items-center justify-between">
										<div className="flex items-center gap-2">
											<BellIcon className="size-5 text-primary" />
											<FormLabel className="cursor-pointer">
												<Trans>Activer le rappel</Trans>
											</FormLabel>
										</div>
										<FormControl>
											<Switch checked={field.value} onCheckedChange={field.onChange} />
										</FormControl>
									</FormItem>
								)}
							/>

							{form.watch("reminderEnabled") && (
								<div className="grid gap-4 sm:grid-cols-2">
									<FormField
										control={form.control}
										name="reminderDate"
										render={({ field }) => (
											<FormItem>
												<FormLabel>
													<Trans>Date du rappel</Trans>
												</FormLabel>
												<FormControl>
													<Input
														type="date"
														value={field.value || ""}
														onChange={(e) => field.onChange(e.target.value || null)}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
									<FormField
										control={form.control}
										name="reminderTime"
										render={({ field }) => (
											<FormItem>
												<FormLabel>
													<Trans>Heure du rappel</Trans>
												</FormLabel>
												<FormControl>
													<Input
														type="time"
														value={field.value || ""}
														onChange={(e) => field.onChange(e.target.value || null)}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>
							)}
						</div>

						{/* Completed (Edit only) */}
						{editingDeadline && (
							<FormField
								control={form.control}
								name="completed"
								render={({ field }) => (
									<FormItem className="flex items-center justify-between rounded-lg border p-4">
										<div className="flex items-center gap-2">
											<CheckCircleIcon className="size-5 text-green-600" />
											<FormLabel className="cursor-pointer">
												<Trans>Marquer comme terminée</Trans>
											</FormLabel>
										</div>
										<FormControl>
											<Switch checked={field.value} onCheckedChange={field.onChange} />
										</FormControl>
									</FormItem>
								)}
							/>
						)}

						<DialogFooter>
							<DialogClose asChild>
								<Button type="button" variant="outline">
									<Trans>Annuler</Trans>
								</Button>
							</DialogClose>
							<Button type="submit" disabled={createPending || updatePending}>
								{(createPending || updatePending) && <SpinnerIcon className="mr-2 size-4 animate-spin" />}
								{editingDeadline ? <Trans>Mettre à jour</Trans> : <Trans>Ajouter</Trans>}
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}

// ---------------------------------------------------------------------------
// Delete confirmation dialog
// ---------------------------------------------------------------------------
interface DeleteConfirmDialogProps {
	deleteConfirmId: string | null;
	onClose: () => void;
	onConfirmDelete: (id: string) => void;
	deletePending: boolean;
}

export function DeleteConfirmDialog({
	deleteConfirmId,
	onClose,
	onConfirmDelete,
	deletePending,
}: DeleteConfirmDialogProps) {
	return (
		<Dialog open={!!deleteConfirmId} onOpenChange={() => onClose()}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>
						<Trans>Supprimer cette échéance ?</Trans>
					</DialogTitle>
					<DialogDescription>
						<Trans>Cette action est irréversible. L'échéance sera supprimée définitivement.</Trans>
					</DialogDescription>
				</DialogHeader>
				<DialogFooter>
					<DialogClose asChild>
						<Button variant="outline">
							<Trans>Annuler</Trans>
						</Button>
					</DialogClose>
					<Button
						variant="destructive"
						onClick={() => deleteConfirmId && onConfirmDelete(deleteConfirmId)}
						disabled={deletePending}
					>
						{deletePending && <SpinnerIcon className="mr-2 size-4 animate-spin" />}
						<Trans>Supprimer</Trans>
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
