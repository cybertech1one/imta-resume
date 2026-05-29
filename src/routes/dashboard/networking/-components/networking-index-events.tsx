import { Trans } from "@lingui/react/macro";
import {
	CalendarIcon,
	CheckCircleIcon,
	ClockIcon,
	GlobeIcon,
	MapPinIcon,
	PlusIcon,
	UsersIcon,
	XIcon,
} from "@phosphor-icons/react";
import { motion } from "motion/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/utils/style";
import { eventTypeConfig } from "./networking-config";
import type { NetworkingEvent } from "./networking-types";

// ============================================================================
// EventsTab
// ============================================================================

interface EventsTabProps {
	events: NetworkingEvent[];
	handleToggleEventAttendance: (eventId: string) => void;
	onAddEvent: () => void;
}

export function EventsTab({ events, handleToggleEventAttendance, onAddEvent }: EventsTabProps) {
	return (
		<div className="grid gap-6 lg:grid-cols-2">
			{/* Upcoming Events */}
			<div>
				<h3 className="mb-4 flex items-center gap-2 font-semibold text-xl">
					<CalendarIcon className="size-5 text-primary" weight="duotone" />
					<Trans>Upcoming Events</Trans>
				</h3>

				<div className="space-y-4">
					{events
						.filter((e) => new Date(e.date) >= new Date())
						.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
						.map((event, index) => {
							const typeConfig = eventTypeConfig[event.type];

							return (
								<motion.div
									key={event.id}
									initial={false}
									animate={{ opacity: 1, y: 0 }}
									transition={{ delay: index * 0.05 }}
								>
									<Card className="transition-all hover:shadow-md">
										<CardContent className="p-4">
											<div className="flex items-start justify-between">
												<div className="flex-1">
													<div className="mb-2 flex items-center gap-2">
														<Badge className={typeConfig.color}>{typeConfig.label}</Badge>
														{event.isAttending && (
															<Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
																<CheckCircleIcon className="mr-1 size-3" />
																<Trans>Attending</Trans>
															</Badge>
														)}
													</div>
													<h4 className="mb-1 font-semibold text-lg">{event.name}</h4>
													<p className="mb-2 text-muted-foreground text-sm">{event.description}</p>
													<div className="flex flex-wrap gap-3 text-muted-foreground text-sm">
														<span className="flex items-center gap-1">
															<CalendarIcon className="size-4" />
															{new Date(event.date).toLocaleDateString()}
														</span>
														<span className="flex items-center gap-1">
															<MapPinIcon className="size-4" />
															{event.location}
														</span>
													</div>
												</div>
											</div>
											<div className="mt-4 flex gap-2">
												<Button
													variant={event.isAttending ? "outline" : "default"}
													size="sm"
													onClick={() => handleToggleEventAttendance(event.id)}
												>
													{event.isAttending ? (
														<>
															<XIcon className="mr-1 size-4" />
															<Trans>Cancel</Trans>
														</>
													) : (
														<>
															<CheckCircleIcon className="mr-1 size-4" />
															<Trans>Attend</Trans>
														</>
													)}
												</Button>
												{event.link && (
													<Button variant="outline" size="sm" onClick={() => window.open(event.link, "_blank")}>
														<GlobeIcon className="mr-1 size-4" />
														<Trans>Website</Trans>
													</Button>
												)}
											</div>
										</CardContent>
									</Card>
								</motion.div>
							);
						})}

					{events.filter((e) => new Date(e.date) >= new Date()).length === 0 && (
						<motion.div
							initial={false}
							animate={{ opacity: 1, y: 0 }}
							className="flex flex-col items-center justify-center py-16 text-center"
						>
							<CalendarIcon className="mb-4 size-12 text-muted-foreground/50" weight="duotone" />
							<h3 className="mb-2 font-semibold text-lg">
								<Trans>No upcoming events</Trans>
							</h3>
							<p className="mb-6 max-w-sm text-muted-foreground text-sm">
								<Trans>
									Plan networking events to expand your professional connections and discover new opportunities.
								</Trans>
							</p>
							<Button onClick={onAddEvent}>
								<PlusIcon className="mr-2 size-4" />
								<Trans>Add Event</Trans>
							</Button>
						</motion.div>
					)}
				</div>
			</div>

			{/* Past Events */}
			<div>
				<h3 className="mb-4 flex items-center gap-2 font-semibold text-xl">
					<ClockIcon className="size-5 text-muted-foreground" weight="duotone" />
					<Trans>Past Events</Trans>
				</h3>

				<div className="space-y-3">
					{events
						.filter((e) => new Date(e.date) < new Date())
						.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
						.slice(0, 5)
						.map((event) => {
							const typeConfig = eventTypeConfig[event.type];

							return (
								<Card key={event.id} className="opacity-75">
									<CardContent className="p-3">
										<div className="flex items-center justify-between">
											<div>
												<div className="mb-1 flex items-center gap-2">
													<Badge className={cn("text-xs", typeConfig.color)}>{typeConfig.label}</Badge>
													<span className="font-medium">{event.name}</span>
												</div>
												<p className="text-muted-foreground text-xs">
													{new Date(event.date).toLocaleDateString()} - {event.location}
												</p>
											</div>
											{event.contactsMet.length > 0 && (
												<Badge variant="outline">
													<UsersIcon className="mr-1 size-3" />
													{event.contactsMet.length} contacts
												</Badge>
											)}
										</div>
									</CardContent>
								</Card>
							);
						})}
				</div>
			</div>
		</div>
	);
}
