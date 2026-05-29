import { Trans } from "@lingui/react/macro";
import { BellIcon, CalendarIcon, CheckCircleIcon, ClockIcon, UserCircleIcon } from "@phosphor-icons/react";
import { motion } from "motion/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/utils/style";
import type { Reminder } from "./networking-types";

// ============================================================================
// RemindersTab
// ============================================================================

interface RemindersTabProps {
	reminders: Reminder[];
	handleCompleteReminder: (reminderId: string) => void;
	handleSnoozeReminder: (reminderId: string) => void;
}

export function RemindersTab({ reminders, handleCompleteReminder, handleSnoozeReminder }: RemindersTabProps) {
	return (
		<div className="grid gap-6 lg:grid-cols-3">
			{/* Pending Reminders */}
			<div className="lg:col-span-2">
				<h3 className="mb-4 flex items-center gap-2 font-semibold text-xl">
					<BellIcon className="size-5 text-amber-500" weight="duotone" />
					<Trans>Pending Follow-ups</Trans>
				</h3>

				{reminders.filter((r) => r.status === "pending").length > 0 ? (
					<div className="space-y-3">
						{reminders
							.filter((r) => r.status === "pending")
							.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
							.map((reminder, index) => {
								const isOverdue = new Date(reminder.dueDate) < new Date();
								const isDueSoon =
									!isOverdue && new Date(reminder.dueDate).getTime() - Date.now() < 3 * 24 * 60 * 60 * 1000;

								return (
									<motion.div
										key={reminder.id}
										initial={false}
										animate={{ opacity: 1, x: 0 }}
										transition={{ delay: index * 0.05 }}
									>
										<Card
											className={cn(
												"transition-all hover:shadow-md",
												isOverdue && "border-red-500/50",
												isDueSoon && !isOverdue && "border-amber-500/50",
											)}
										>
											<CardContent className="p-4">
												<div className="flex items-start justify-between gap-4">
													<div className="flex-1">
														<div className="mb-1 flex items-center gap-2">
															<h4 className="font-semibold">{reminder.title}</h4>
															{isOverdue && (
																<Badge className="bg-red-500 text-white text-xs">
																	<Trans>Overdue</Trans>
																</Badge>
															)}
															{isDueSoon && !isOverdue && (
																<Badge className="bg-amber-500 text-white text-xs">
																	<Trans>Due Soon</Trans>
																</Badge>
															)}
														</div>
														<p className="mb-2 text-muted-foreground text-sm">{reminder.description}</p>
														<div className="flex items-center gap-4 text-muted-foreground text-sm">
															<span className="flex items-center gap-1">
																<UserCircleIcon className="size-4" />
																{reminder.contactName}
															</span>
															<span className="flex items-center gap-1">
																<CalendarIcon className="size-4" />
																{new Date(reminder.dueDate).toLocaleDateString()}
															</span>
														</div>
													</div>
													<div className="flex gap-2">
														<Tooltip>
															<TooltipTrigger asChild>
																<Button variant="outline" size="sm" onClick={() => handleSnoozeReminder(reminder.id)}>
																	<ClockIcon className="size-4" />
																</Button>
															</TooltipTrigger>
															<TooltipContent>
																<Trans>Snooze 3 days</Trans>
															</TooltipContent>
														</Tooltip>
														<Button size="sm" onClick={() => handleCompleteReminder(reminder.id)}>
															<CheckCircleIcon className="mr-1 size-4" />
															<Trans>Done</Trans>
														</Button>
													</div>
												</div>
											</CardContent>
										</Card>
									</motion.div>
								);
							})}
					</div>
				) : (
					<Card className="border-dashed">
						<CardContent className="flex flex-col items-center justify-center py-12">
							<CheckCircleIcon className="mb-4 size-12 text-green-500" weight="duotone" />
							<h3 className="mb-2 font-semibold text-lg">
								<Trans>All caught up!</Trans>
							</h3>
							<p className="text-muted-foreground">
								<Trans>No pending follow-ups</Trans>
							</p>
						</CardContent>
					</Card>
				)}
			</div>

			{/* Completed Reminders */}
			<div>
				<h3 className="mb-4 flex items-center gap-2 font-semibold text-xl">
					<CheckCircleIcon className="size-5 text-green-500" weight="duotone" />
					<Trans>Completed</Trans>
				</h3>

				<div className="space-y-2">
					{reminders
						.filter((r) => r.status === "completed")
						.slice(0, 5)
						.map((reminder) => (
							<Card key={reminder.id} className="opacity-60">
								<CardContent className="p-3">
									<p className="line-through">{reminder.title}</p>
									<p className="text-muted-foreground text-xs">{reminder.contactName}</p>
								</CardContent>
							</Card>
						))}
				</div>
			</div>
		</div>
	);
}
