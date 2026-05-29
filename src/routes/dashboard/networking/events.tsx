import { t } from "@lingui/core/macro";
import {
	BellIcon,
	CalendarBlankIcon,
	CalendarCheckIcon,
	CalendarIcon,
	CaretLeftIcon,
	CaretRightIcon,
	CheckCircleIcon,
	ClockIcon,
	ListIcon,
	PlusIcon,
	UsersIcon,
} from "@phosphor-icons/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import { ErrorComponent } from "@/components/error-component";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { authClient } from "@/integrations/auth/client";
import { orpc } from "@/integrations/orpc/client";
import { formatDate } from "@/utils/format-date";
import { DashboardHeader } from "../-components/header";
import {
	AddEditEventModal,
	CalendarGrid,
	DeleteConfirmModal,
	EventCard,
	EventDetailsModal,
} from "./-components/events-components";
import { getEventTypeConfig, getMonthNames, getRsvpStatusConfig } from "./-components/events-config";
import type { EventOutcome, EventType, NetworkingEvent, RsvpStatus, ViewMode } from "./-components/events-types";

// biome-ignore lint/suspicious/noExplicitAny: Route path not in generated route tree
export const Route = createFileRoute("/dashboard/networking/events" as any)({
	component: NetworkingEventsPage,
	errorComponent: ErrorComponent,
});

function NetworkingEventsPage() {
	const { data: session } = authClient.useSession();
	const queryClient = useQueryClient();
	const [viewMode, setViewMode] = useState<ViewMode>("calendar");
	const [currentDate, setCurrentDate] = useState(new Date());
	const [filterType, setFilterType] = useState<EventType | "all">("all");
	const [filterRsvp, setFilterRsvp] = useState<RsvpStatus | "all">("all");
	const [showPast, setShowPast] = useState(true);

	const [selectedEvent, setSelectedEvent] = useState<NetworkingEvent | null>(null);
	const [editingEvent, setEditingEvent] = useState<NetworkingEvent | null>(null);
	const [deletingEvent, setDeletingEvent] = useState<NetworkingEvent | null>(null);
	const [isAddModalOpen, setIsAddModalOpen] = useState(false);
	const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

	// Query for events list
	const { data: eventsData = [], isLoading: isLoadingEvents } = useQuery({
		...orpc.networkingEvents.list.queryOptions({
			input: {
				type: filterType !== "all" ? filterType : undefined,
				rsvpStatus: filterRsvp !== "all" ? filterRsvp : undefined,
			},
		}),
		staleTime: 5 * 60 * 1000,
		enabled: !!session?.user,
	});

	// Query for statistics
	const { data: stats } = useQuery({
		...orpc.networkingEvents.getStatistics.queryOptions({ input: {} }),
		staleTime: 5 * 60 * 1000,
		enabled: !!session?.user,
	});

	// Query for pending reminders
	const { data: pendingRemindersData = [] } = useQuery({
		...orpc.networkingEvents.getPendingReminders.queryOptions({ input: { daysAhead: 30 } }),
		staleTime: 5 * 60 * 1000,
		enabled: !!session?.user,
	});

	// Transform events data to match component types
	const events: NetworkingEvent[] = useMemo(() => {
		return eventsData.map((event) => ({
			id: event.id,
			title: event.title,
			date: event.date,
			startTime: event.startTime,
			endTime: event.endTime,
			location: event.location,
			type: event.type as EventType,
			description: event.description,
			rsvpStatus: event.rsvpStatus as RsvpStatus,
			expectedContacts: event.expectedContacts,
			notes: event.notes,
			followUpReminders: event.followUpReminders,
			outcome: event.outcome,
			link: event.link,
			isPast: event.isPast,
		}));
	}, [eventsData]);

	// Create event mutation with optimistic updates
	const createEventMutation = useMutation({
		...orpc.networkingEvents.create.mutationOptions(),
		onMutate: async (newEvent) => {
			// Cancel outgoing refetches
			await queryClient.cancelQueries({ queryKey: orpc.networkingEvents.list.key() });

			// Snapshot previous value
			const previousEvents = queryClient.getQueryData(
				orpc.networkingEvents.list.key({
					input: {
						type: filterType !== "all" ? filterType : undefined,
						rsvpStatus: filterRsvp !== "all" ? filterRsvp : undefined,
					},
				}),
			);

			// Optimistically update the cache
			queryClient.setQueryData(
				orpc.networkingEvents.list.key({
					input: {
						type: filterType !== "all" ? filterType : undefined,
						rsvpStatus: filterRsvp !== "all" ? filterRsvp : undefined,
					},
				}),
				(old: typeof eventsData | undefined) => {
					if (!old) return old;
					const optimisticEvent = {
						...newEvent,
						id: `temp-${Date.now()}`,
						userId: "",
						description: newEvent.description || null,
						notes: newEvent.notes || null,
						link: newEvent.link || null,
						expectedContacts: (newEvent.expectedContacts || []).map((c, i) => ({
							...c,
							id: `temp-contact-${i}`,
						})),
						followUpReminders: (newEvent.followUpReminders || []).map((r, i) => ({
							...r,
							id: `temp-reminder-${i}`,
							eventId: `temp-${Date.now()}`,
							description: r.description || null,
							completed: false,
						})),
						outcome: null,
						isPast: new Date(newEvent.date) < new Date(),
						createdAt: new Date(),
						updatedAt: new Date(),
					};
					return [...old, optimisticEvent];
				},
			);

			// Close modal immediately for better UX
			setIsAddModalOpen(false);

			return { previousEvents };
		},
		onSuccess: () => {
			toast.success(t`Event created successfully`);
		},
		onError: (_error, _newEvent, context) => {
			// Rollback on error
			if (context?.previousEvents) {
				queryClient.setQueryData(
					orpc.networkingEvents.list.key({
						input: {
							type: filterType !== "all" ? filterType : undefined,
							rsvpStatus: filterRsvp !== "all" ? filterRsvp : undefined,
						},
					}),
					context.previousEvents,
				);
			}
			toast.error(t`Failed to create event`);
		},
		onSettled: () => {
			// Always refetch after mutation
			queryClient.invalidateQueries({ queryKey: orpc.networkingEvents.list.key() });
			queryClient.invalidateQueries({ queryKey: orpc.networkingEvents.getStatistics.key() });
			queryClient.invalidateQueries({ queryKey: orpc.networkingEvents.getPendingReminders.key() });
		},
	});

	// Update event mutation
	const updateEventMutation = useMutation({
		...orpc.networkingEvents.update.mutationOptions(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: orpc.networkingEvents.list.key() });
			queryClient.invalidateQueries({ queryKey: orpc.networkingEvents.getStatistics.key() });
			queryClient.invalidateQueries({ queryKey: orpc.networkingEvents.getPendingReminders.key() });
			setEditingEvent(null);
			toast.success(t`Event updated successfully`);
		},
		onError: () => {
			toast.error(t`Failed to update event`);
		},
	});

	// Delete event mutation
	const deleteEventMutation = useMutation({
		...orpc.networkingEvents.delete.mutationOptions(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: orpc.networkingEvents.list.key() });
			queryClient.invalidateQueries({ queryKey: orpc.networkingEvents.getStatistics.key() });
			queryClient.invalidateQueries({ queryKey: orpc.networkingEvents.getPendingReminders.key() });
			setDeletingEvent(null);
			toast.success(t`Event deleted successfully`);
		},
		onError: () => {
			toast.error(t`Failed to delete event`);
		},
	});

	// Update RSVP mutation
	const updateRsvpMutation = useMutation({
		...orpc.networkingEvents.updateRsvp.mutationOptions(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: orpc.networkingEvents.list.key() });
			queryClient.invalidateQueries({ queryKey: orpc.networkingEvents.getStatistics.key() });
			toast.success(t`RSVP updated`);
		},
		onError: () => {
			toast.error(t`Failed to update RSVP`);
		},
	});

	// Update outcome mutation
	const updateOutcomeMutation = useMutation({
		...orpc.networkingEvents.updateOutcome.mutationOptions(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: orpc.networkingEvents.list.key() });
			queryClient.invalidateQueries({ queryKey: orpc.networkingEvents.getStatistics.key() });
			toast.success(t`Results saved`);
		},
		onError: () => {
			toast.error(t`Failed to save results`);
		},
	});

	// Toggle reminder mutation
	const toggleReminderMutation = useMutation({
		...orpc.networkingEvents.toggleReminder.mutationOptions(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: orpc.networkingEvents.list.key() });
			queryClient.invalidateQueries({ queryKey: orpc.networkingEvents.getPendingReminders.key() });
			toast.success(t`Reminder updated`);
		},
		onError: () => {
			toast.error(t`Failed to update reminder`);
		},
	});

	const filteredEvents = useMemo(() => {
		return events.filter((event) => {
			if (!showPast && event.isPast) return false;
			return true;
		});
	}, [events, showPast]);

	const upcomingEvents = useMemo(
		() => filteredEvents.filter((e) => !e.isPast).sort((a, b) => a.date.localeCompare(b.date)),
		[filteredEvents],
	);

	const pastEvents = useMemo(
		() => filteredEvents.filter((e) => e.isPast).sort((a, b) => b.date.localeCompare(a.date)),
		[filteredEvents],
	);

	const pendingReminders = useMemo(() => {
		return pendingRemindersData.map((r) => ({
			...r,
			eventTitle: r.eventTitle,
		}));
	}, [pendingRemindersData]);

	const handlePrevMonth = useCallback(() => {
		setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
	}, [currentDate]);

	const handleNextMonth = useCallback(() => {
		setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
	}, [currentDate]);

	const handleAddEvent = useCallback(
		(eventData: Omit<NetworkingEvent, "id" | "isPast">) => {
			createEventMutation.mutate({
				title: eventData.title,
				date: eventData.date,
				startTime: eventData.startTime,
				endTime: eventData.endTime,
				location: eventData.location,
				type: eventData.type,
				description: eventData.description || undefined,
				rsvpStatus: eventData.rsvpStatus,
				notes: eventData.notes || undefined,
				link: eventData.link || undefined,
				expectedContacts: eventData.expectedContacts.map((c) => ({
					name: c.name,
					company: c.company,
					role: c.role,
				})),
				followUpReminders: eventData.followUpReminders.map((r) => ({
					title: r.title,
					description: r.description || undefined,
					dueDate: r.dueDate,
				})),
			});
		},
		[createEventMutation],
	);

	const handleEditEvent = useCallback(
		(eventData: Omit<NetworkingEvent, "id" | "isPast">) => {
			if (!editingEvent) return;
			updateEventMutation.mutate({
				id: editingEvent.id,
				title: eventData.title,
				date: eventData.date,
				startTime: eventData.startTime,
				endTime: eventData.endTime,
				location: eventData.location,
				type: eventData.type,
				description: eventData.description || undefined,
				rsvpStatus: eventData.rsvpStatus,
				notes: eventData.notes || undefined,
				link: eventData.link || undefined,
				expectedContacts: eventData.expectedContacts.map((c) => ({
					id: c.id,
					name: c.name,
					company: c.company,
					role: c.role,
				})),
				followUpReminders: eventData.followUpReminders.map((r) => ({
					id: r.id,
					title: r.title,
					description: r.description || undefined,
					dueDate: r.dueDate,
					completed: r.completed,
				})),
				outcome: eventData.outcome,
			});
		},
		[editingEvent, updateEventMutation],
	);

	const handleDeleteEvent = useCallback(() => {
		if (!deletingEvent) return;
		deleteEventMutation.mutate({ id: deletingEvent.id });
	}, [deletingEvent, deleteEventMutation]);

	const handleUpdateRsvp = useCallback(
		(eventId: string, status: RsvpStatus) => {
			updateRsvpMutation.mutate({ id: eventId, rsvpStatus: status });
			// Update selected event locally for immediate UI feedback
			if (selectedEvent && selectedEvent.id === eventId) {
				setSelectedEvent({ ...selectedEvent, rsvpStatus: status });
			}
		},
		[updateRsvpMutation, selectedEvent],
	);

	const handleUpdateOutcome = useCallback(
		(eventId: string, outcome: EventOutcome) => {
			updateOutcomeMutation.mutate({ id: eventId, outcome });
			// Update selected event locally for immediate UI feedback
			if (selectedEvent && selectedEvent.id === eventId) {
				setSelectedEvent({ ...selectedEvent, outcome });
			}
		},
		[updateOutcomeMutation, selectedEvent],
	);

	const handleToggleReminder = useCallback(
		(eventId: string, reminderId: string) => {
			toggleReminderMutation.mutate({ eventId, reminderId });
			// Update selected event locally for immediate UI feedback
			if (selectedEvent && selectedEvent.id === eventId) {
				setSelectedEvent({
					...selectedEvent,
					followUpReminders: selectedEvent.followUpReminders.map((r) =>
						r.id === reminderId ? { ...r, completed: !r.completed } : r,
					),
				});
			}
		},
		[toggleReminderMutation, selectedEvent],
	);

	const handleDateClick = useCallback((_date: Date) => {
		setEditingEvent(null);
		setIsAddModalOpen(true);
	}, []);

	const handleEventClick = useCallback((event: NetworkingEvent) => {
		setSelectedEvent(event);
		setIsDetailsModalOpen(true);
	}, []);

	const displayStats = stats ?? {
		totalUpcoming: 0,
		totalPast: 0,
		goingCount: 0,
		totalContacts: 0,
		pendingReminders: 0,
	};

	if (isLoadingEvents) {
		return (
			<div className="min-h-screen">
				<DashboardHeader title={t`Event Calendar`} icon={CalendarIcon} />
				<div className="flex items-center justify-center py-12">
					<div className="text-muted-foreground">{t`Loading events...`}</div>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen">
			<DashboardHeader title={t`Event Calendar`} icon={CalendarIcon} />

			<div className="space-y-6">
				{/* Stats */}
				<motion.div initial={false} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-2 gap-4 md:grid-cols-4">
					<Card>
						<CardContent className="pt-4">
							<div className="flex items-center gap-3">
								<div className="rounded-lg bg-blue-100 p-2 dark:bg-blue-900/30">
									<CalendarCheckIcon className="size-5 text-blue-600 dark:text-blue-400" />
								</div>
								<div>
									<div className="font-bold text-2xl">{displayStats.totalUpcoming}</div>
									<div className="text-muted-foreground text-sm">{t`Upcoming`}</div>
								</div>
							</div>
						</CardContent>
					</Card>
					<Card>
						<CardContent className="pt-4">
							<div className="flex items-center gap-3">
								<div className="rounded-lg bg-green-100 p-2 dark:bg-green-900/30">
									<CheckCircleIcon className="size-5 text-green-600 dark:text-green-400" />
								</div>
								<div>
									<div className="font-bold text-2xl">{displayStats.goingCount}</div>
									<div className="text-muted-foreground text-sm">{t`Confirmed`}</div>
								</div>
							</div>
						</CardContent>
					</Card>
					<Card>
						<CardContent className="pt-4">
							<div className="flex items-center gap-3">
								<div className="rounded-lg bg-purple-100 p-2 dark:bg-purple-900/30">
									<CalendarBlankIcon className="size-5 text-purple-600 dark:text-purple-400" />
								</div>
								<div>
									<div className="font-bold text-2xl">{displayStats.totalPast}</div>
									<div className="text-muted-foreground text-sm">{t`Past`}</div>
								</div>
							</div>
						</CardContent>
					</Card>
					<Card>
						<CardContent className="pt-4">
							<div className="flex items-center gap-3">
								<div className="rounded-lg bg-amber-100 p-2 dark:bg-amber-900/30">
									<UsersIcon className="size-5 text-amber-600 dark:text-amber-400" />
								</div>
								<div>
									<div className="font-bold text-2xl">{displayStats.totalContacts}</div>
									<div className="text-muted-foreground text-sm">{t`Contacts made`}</div>
								</div>
							</div>
						</CardContent>
					</Card>
				</motion.div>

				{/* Pending Reminders */}
				{pendingReminders.length > 0 && (
					<motion.div initial={false} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
						<Card>
							<CardHeader className="pb-2">
								<CardTitle className="flex items-center gap-2 text-base">
									<BellIcon className="size-5 text-amber-500" />
									{t`Pending reminders`}
								</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="flex flex-wrap gap-2">
									{pendingReminders.slice(0, 5).map((reminder) => (
										<Badge
											key={reminder.id}
											variant="outline"
											className="cursor-pointer hover:bg-muted"
											onClick={() => {
												const event = events.find((e) => e.id === reminder.eventId);
												if (event) handleEventClick(event);
											}}
										>
											<ClockIcon className="mr-1 size-3" />
											{reminder.title} - {formatDate(reminder.dueDate)}
										</Badge>
									))}
									{pendingReminders.length > 5 && (
										<Badge variant="secondary">
											+{pendingReminders.length - 5} {t`more`}
										</Badge>
									)}
								</div>
							</CardContent>
						</Card>
					</motion.div>
				)}

				{/* Toolbar */}
				<motion.div
					initial={false}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.2 }}
					className="flex flex-wrap items-center justify-between gap-4"
				>
					<div className="flex items-center gap-2">
						<Tabs value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)} className="w-auto">
							<TabsList>
								<TabsTrigger value="calendar" className="gap-1">
									<CalendarIcon className="size-4" />
									{t`Calendar`}
								</TabsTrigger>
								<TabsTrigger value="list" className="gap-1">
									<ListIcon className="size-4" />
									{t`List`}
								</TabsTrigger>
							</TabsList>
						</Tabs>
					</div>

					<div className="flex flex-wrap items-center gap-2">
						<Select value={filterType} onValueChange={(v) => setFilterType(v as EventType | "all")}>
							<SelectTrigger className="w-36">
								<SelectValue placeholder={t`Type`} />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">{t`All types`}</SelectItem>
								{(Object.keys(getEventTypeConfig()) as EventType[]).map((type) => (
									<SelectItem key={type} value={type}>
										{getEventTypeConfig()[type].label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>

						<Select value={filterRsvp} onValueChange={(v) => setFilterRsvp(v as RsvpStatus | "all")}>
							<SelectTrigger className="w-36">
								<SelectValue placeholder={t`Status`} />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">{t`All statuses`}</SelectItem>
								{(Object.keys(getRsvpStatusConfig()) as RsvpStatus[]).map((status) => (
									<SelectItem key={status} value={status}>
										{getRsvpStatusConfig()[status].label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>

						<Button variant={showPast ? "default" : "outline"} size="sm" onClick={() => setShowPast(!showPast)}>
							{showPast ? t`Hide past` : t`Show past`}
						</Button>

						<Button onClick={() => setIsAddModalOpen(true)}>
							<PlusIcon className="mr-1 size-4" />
							{t`Add`}
						</Button>
					</div>
				</motion.div>

				{/* Calendar View */}
				{viewMode === "calendar" && (
					<motion.div initial={false} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
						<Card>
							<CardHeader className="pb-2">
								<div className="flex items-center justify-between">
									<CardTitle className="text-lg">
										{getMonthNames()[currentDate.getMonth()]} {currentDate.getFullYear()}
									</CardTitle>
									<div className="flex items-center gap-1">
										<Button variant="ghost" size="icon" onClick={handlePrevMonth}>
											<CaretLeftIcon className="size-5" />
										</Button>
										<Button variant="ghost" size="icon" onClick={handleNextMonth}>
											<CaretRightIcon className="size-5" />
										</Button>
									</div>
								</div>
							</CardHeader>
							<CardContent>
								<CalendarGrid
									events={filteredEvents}
									currentDate={currentDate}
									onDateClick={handleDateClick}
									onEventClick={handleEventClick}
								/>
							</CardContent>
						</Card>
					</motion.div>
				)}

				{/* List View */}
				{viewMode === "list" && (
					<motion.div initial={false} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="space-y-6">
						{upcomingEvents.length > 0 && (
							<div>
								<h2 className="mb-4 font-semibold text-lg">{t`Upcoming events`}</h2>
								<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
									<AnimatePresence>
										{upcomingEvents.map((event) => (
											<EventCard
												key={event.id}
												event={event}
												onEdit={() => setEditingEvent(event)}
												onDelete={() => setDeletingEvent(event)}
												onViewDetails={() => handleEventClick(event)}
											/>
										))}
									</AnimatePresence>
								</div>
							</div>
						)}

						{showPast && pastEvents.length > 0 && (
							<div>
								<h2 className="mb-4 font-semibold text-lg">{t`Event history`}</h2>
								<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
									<AnimatePresence>
										{pastEvents.map((event) => (
											<EventCard
												key={event.id}
												event={event}
												onEdit={() => setEditingEvent(event)}
												onDelete={() => setDeletingEvent(event)}
												onViewDetails={() => handleEventClick(event)}
											/>
										))}
									</AnimatePresence>
								</div>
							</div>
						)}

						{upcomingEvents.length === 0 && pastEvents.length === 0 && (
							<Card>
								<CardContent className="py-12 text-center">
									<CalendarIcon className="mx-auto mb-4 size-12 text-muted-foreground" />
									<p className="text-muted-foreground">{t`No events found`}</p>
									<Button className="mt-4" onClick={() => setIsAddModalOpen(true)}>
										<PlusIcon className="mr-1 size-4" />
										{t`Add an event`}
									</Button>
								</CardContent>
							</Card>
						)}
					</motion.div>
				)}
			</div>

			{/* Modals */}
			<EventDetailsModal
				event={selectedEvent}
				isOpen={isDetailsModalOpen}
				onClose={() => {
					setIsDetailsModalOpen(false);
					setSelectedEvent(null);
				}}
				onUpdateRsvp={handleUpdateRsvp}
				onUpdateOutcome={handleUpdateOutcome}
				onToggleReminder={handleToggleReminder}
			/>

			<AddEditEventModal
				event={editingEvent}
				isOpen={isAddModalOpen || editingEvent !== null}
				onClose={() => {
					setIsAddModalOpen(false);
					setEditingEvent(null);
				}}
				onSave={editingEvent ? handleEditEvent : handleAddEvent}
				isSaving={createEventMutation.isPending || updateEventMutation.isPending}
			/>

			<DeleteConfirmModal
				isOpen={deletingEvent !== null}
				onClose={() => setDeletingEvent(null)}
				onConfirm={handleDeleteEvent}
				eventTitle={deletingEvent?.title || ""}
				isDeleting={deleteEventMutation.isPending}
			/>
		</div>
	);
}
