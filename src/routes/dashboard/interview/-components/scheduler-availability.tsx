import { Trans } from "@lingui/react/macro";
import { CalendarIcon, ClockIcon, PlusIcon, RepeatIcon, TrashIcon } from "@phosphor-icons/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TabsContent } from "@/components/ui/tabs";
import { DAYS_OF_WEEK } from "./scheduler-config";
import { formatTime } from "./scheduler-utils";

// ==================== AVAILABILITY VIEW ====================

interface AvailabilityViewProps {
	availability: Array<{
		id: string;
		dayOfWeek: number;
		startTime: string;
		endTime: string;
		isRecurring: boolean;
	}>;
	onAddAvailability: () => void;
	onDeleteAvailabilitySlot: (slotId: string) => void;
}

export function AvailabilityView({ availability, onAddAvailability, onDeleteAvailabilitySlot }: AvailabilityViewProps) {
	return (
		<TabsContent value="availability" className="mt-0">
			<div className="grid gap-6 lg:grid-cols-2">
				{/* Recurring Availability */}
				<Card>
					<CardHeader>
						<div className="flex items-center justify-between">
							<div>
								<CardTitle className="flex items-center gap-2">
									<RepeatIcon className="size-5 text-primary" />
									<Trans>Recurring Availability</Trans>
								</CardTitle>
								<CardDescription>
									<Trans>Set your usual availability slots</Trans>
								</CardDescription>
							</div>
							<Button size="sm" className="gap-2" onClick={onAddAvailability}>
								<PlusIcon className="size-4" />
								<Trans>Add</Trans>
							</Button>
						</div>
					</CardHeader>
					<CardContent>
						{availability.length > 0 ? (
							<div className="space-y-3">
								{availability.map((slot) => (
									<div key={slot.id} className="flex items-center justify-between rounded-lg border bg-card p-3">
										<div className="flex items-center gap-3">
											<div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
												<ClockIcon className="size-5 text-primary" />
											</div>
											<div>
												<p className="font-medium">{DAYS_OF_WEEK[slot.dayOfWeek].label}</p>
												<p className="text-muted-foreground text-sm">
													{formatTime(slot.startTime)} - {formatTime(slot.endTime)}
												</p>
											</div>
										</div>
										<div className="flex items-center gap-2">
											{slot.isRecurring && (
												<Badge variant="secondary" className="gap-1 text-xs">
													<RepeatIcon className="size-3" />
													<Trans>Recurrent</Trans>
												</Badge>
											)}
											<Button
												variant="ghost"
												size="icon"
												className="size-8 text-destructive hover:bg-destructive/10"
												onClick={() => onDeleteAvailabilitySlot(slot.id)}
											>
												<TrashIcon className="size-4" />
											</Button>
										</div>
									</div>
								))}
							</div>
						) : (
							<div className="py-8 text-center">
								<ClockIcon className="mx-auto mb-4 size-12 text-muted-foreground/50" />
								<p className="text-muted-foreground">
									<Trans>No availability defined</Trans>
								</p>
							</div>
						)}
					</CardContent>
				</Card>

				{/* Weekly Overview */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<CalendarIcon className="size-5 text-primary" />
							<Trans>Weekly Overview</Trans>
						</CardTitle>
						<CardDescription>
							<Trans>Your availability this week</Trans>
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="space-y-2">
							{DAYS_OF_WEEK.map((day) => {
								const daySlots = availability.filter((s) => s.dayOfWeek === day.value);
								return (
									<div key={day.value} className="flex items-center gap-3 rounded-lg border p-3">
										<div className="w-24 font-medium">{day.label}</div>
										<div className="flex-1">
											{daySlots.length > 0 ? (
												<div className="flex flex-wrap gap-2">
													{daySlots.map((slot) => (
														<Badge key={slot.id} variant="secondary" className="text-xs">
															{formatTime(slot.startTime)} - {formatTime(slot.endTime)}
														</Badge>
													))}
												</div>
											) : (
												<span className="text-muted-foreground text-sm">
													<Trans>Not available</Trans>
												</span>
											)}
										</div>
									</div>
								);
							})}
						</div>
					</CardContent>
				</Card>
			</div>
		</TabsContent>
	);
}
