import { Trans } from "@lingui/react/macro";
import { CalendarIcon, CaretLeftIcon, CaretRightIcon, PlusIcon } from "@phosphor-icons/react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TabsContent } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/utils/style";
import { DAYS_OF_WEEK, INTERVIEW_TYPES } from "./scheduler-config";
import type { Interview, InterviewType } from "./scheduler-types";
import { formatDate, formatTime, isPastDate, isSameDay, isToday } from "./scheduler-utils";

// ==================== CALENDAR VIEW ====================

interface CalendarViewProps {
	currentMonth: Date;
	selectedDate: Date | null;
	calendarDays: Date[];
	interviewsByDate: Record<string, Interview[]>;
	onNavigateMonth: (direction: "prev" | "next") => void;
	onSelectDate: (date: Date) => void;
	onSetCurrentMonth: (date: Date) => void;
	onCreateForDate: (dateStr: string) => void;
	renderInterviewCard: (interview: Interview) => React.ReactNode;
}

export function CalendarView({
	currentMonth,
	selectedDate,
	calendarDays,
	interviewsByDate,
	onNavigateMonth,
	onSelectDate,
	onSetCurrentMonth,
	onCreateForDate,
	renderInterviewCard,
}: CalendarViewProps) {
	return (
		<TabsContent value="calendar" className="mt-0">
			<Card>
				<CardHeader className="pb-4">
					<div className="flex items-center justify-between">
						<CardTitle className="flex items-center gap-2">
							<CalendarIcon className="size-5" weight="duotone" />
							{currentMonth.toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}
						</CardTitle>
						<div className="flex items-center gap-2">
							<Button variant="outline" size="icon" onClick={() => onNavigateMonth("prev")}>
								<CaretLeftIcon className="size-4" />
							</Button>
							<Button variant="outline" size="sm" onClick={() => onSetCurrentMonth(new Date())}>
								<Trans>Today</Trans>
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
							const dayInterviews = interviewsByDate[dateStr] || [];
							const isCurrentMonth = date.getMonth() === currentMonth.getMonth();
							const isSelected = selectedDate && isSameDay(date, selectedDate);
							const isPast = isPastDate(date) && !isToday(date);

							return (
								<motion.button
									key={index}
									type="button"
									className={cn(
										"relative min-h-24 rounded-lg border p-2 text-left transition-all hover:border-primary/50",
										!isCurrentMonth && "bg-muted/30 text-muted-foreground",
										isToday(date) && "border-primary bg-primary/5",
										isSelected && "border-primary ring-2 ring-primary/20",
										isPast && "opacity-60",
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

									{/* Interview indicators */}
									<div className="mt-1 space-y-1">
										{dayInterviews.slice(0, 2).map((interview) => {
											const typeConfig = INTERVIEW_TYPES[interview.type as InterviewType] || INTERVIEW_TYPES.video;
											return (
												<Tooltip key={interview.id}>
													<TooltipTrigger asChild>
														<div
															className={cn(
																"truncate rounded px-1.5 py-0.5 text-xs",
																typeConfig.bgColor,
																typeConfig.color,
															)}
														>
															{formatTime(interview.startTime)} {interview.company}
														</div>
													</TooltipTrigger>
													<TooltipContent>
														<p>
															{interview.company} - {interview.role}
														</p>
														<p className="text-muted-foreground">
															{formatTime(interview.startTime)} - {formatTime(interview.endTime)}
														</p>
													</TooltipContent>
												</Tooltip>
											);
										})}
										{dayInterviews.length > 2 && (
											<div className="text-center text-muted-foreground text-xs">
												+{dayInterviews.length - 2} <Trans>more</Trans>
											</div>
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
								<Button
									size="sm"
									className="gap-2"
									onClick={() => onCreateForDate(selectedDate.toISOString().split("T")[0])}
								>
									<PlusIcon className="size-4" />
									<Trans>Add</Trans>
								</Button>
							</div>
						</CardHeader>
						<CardContent>
							{interviewsByDate[selectedDate.toISOString().split("T")[0]]?.length > 0 ? (
								<div className="space-y-4">
									{interviewsByDate[selectedDate.toISOString().split("T")[0]].map((interview) =>
										renderInterviewCard(interview),
									)}
								</div>
							) : (
								<p className="text-center text-muted-foreground">
									<Trans>No interviews today</Trans>
								</p>
							)}
						</CardContent>
					</Card>
				</motion.div>
			)}
		</TabsContent>
	);
}
