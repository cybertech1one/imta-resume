import { t } from "@lingui/core/macro";
import {
	BellIcon,
	CalendarIcon,
	CheckCircleIcon,
	ClockIcon,
	MapPinIcon,
	PencilSimpleIcon,
	PlusIcon,
	TrashIcon,
	UsersIcon,
	XIcon,
} from "@phosphor-icons/react";
import { motion } from "motion/react";
import { useMemo, useState } from "react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { formatDate } from "@/utils/format-date";
import { cn } from "@/utils/style";
import {
	formatTime,
	getDayNames,
	getDaysInMonth,
	getEventTypeConfig,
	getFirstDayOfMonth,
	getRsvpStatusConfig,
} from "./events-config";
import type { EventOutcome, EventType, NetworkingEvent, RsvpStatus } from "./events-types";

export function EventCard({
	event,
	onEdit,
	onDelete,
	onViewDetails,
}: {
	event: NetworkingEvent;
	onEdit: () => void;
	onDelete: () => void;
	onViewDetails: () => void;
}) {
	const typeConfig = getEventTypeConfig()[event.type];
	const rsvpConfig = getRsvpStatusConfig()[event.rsvpStatus];
	const TypeIcon = typeConfig.icon;
	const RsvpIcon = rsvpConfig.icon;

	return (
		<motion.div
			initial={false}
			animate={{ opacity: 1, y: 0 }}
			exit={{ opacity: 0, y: -20 }}
			transition={{ duration: 0.2 }}
		>
			<Card
				className={cn("group cursor-pointer transition-all hover:shadow-md", event.isPast && "opacity-75")}
				onClick={onViewDetails}
			>
				<CardHeader className="pb-2">
					<div className="flex items-start justify-between">
						<div className="flex items-center gap-2">
							<Badge className={typeConfig.color}>
								<TypeIcon className="mr-1 size-3" />
								{typeConfig.label}
							</Badge>
							{event.isPast && (
								<Badge variant="outline" className="text-muted-foreground">
									{t`Past`}
								</Badge>
							)}
						</div>
						<div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
							<Tooltip>
								<TooltipTrigger asChild>
									<Button
										variant="ghost"
										size="icon"
										className="size-8"
										onClick={(e) => {
											e.stopPropagation();
											onEdit();
										}}
									>
										<PencilSimpleIcon className="size-4" />
									</Button>
								</TooltipTrigger>
								<TooltipContent>{t`Edit`}</TooltipContent>
							</Tooltip>
							<Tooltip>
								<TooltipTrigger asChild>
									<Button
										variant="ghost"
										size="icon"
										className="size-8 text-destructive hover:text-destructive"
										onClick={(e) => {
											e.stopPropagation();
											onDelete();
										}}
									>
										<TrashIcon className="size-4" />
									</Button>
								</TooltipTrigger>
								<TooltipContent>{t`Delete`}</TooltipContent>
							</Tooltip>
						</div>
					</div>
					<CardTitle className="mt-2 text-lg">{event.title}</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="space-y-2 text-sm">
						<div className="flex items-center gap-2 text-muted-foreground">
							<CalendarIcon className="size-4" />
							<span>
								{formatDate(event.date)} - {formatTime(event.startTime)} - {formatTime(event.endTime)}
							</span>
						</div>
						<div className="flex items-center gap-2 text-muted-foreground">
							<MapPinIcon className="size-4" />
							<span>{event.location}</span>
						</div>
						<div className="flex items-center gap-2">
							<Badge className={rsvpConfig.color}>
								<RsvpIcon className="mr-1 size-3" />
								{rsvpConfig.label}
							</Badge>
						</div>
						{event.expectedContacts.length > 0 && (
							<div className="flex items-center gap-2 text-muted-foreground">
								<UsersIcon className="size-4" />
								<span>
									{event.expectedContacts.length} {t`expected contacts`}
								</span>
							</div>
						)}
						{event.followUpReminders.length > 0 && (
							<div className="flex items-center gap-2 text-muted-foreground">
								<BellIcon className="size-4" />
								<span>
									{event.followUpReminders.filter((r) => !r.completed).length} {t`pending reminders`}
								</span>
							</div>
						)}
						{event.outcome && (
							<div className="mt-2 rounded-md bg-muted/50 p-2">
								<div className="font-medium text-xs">{t`Results`}</div>
								<div className="mt-1 flex gap-4 text-muted-foreground text-xs">
									<span>
										{event.outcome.contactsMade} {t`contacts`}
									</span>
									<span>
										{event.outcome.followUpsScheduled} {t`follow-ups`}
									</span>
									<span>
										{event.outcome.opportunitiesIdentified} {t`opportunities`}
									</span>
								</div>
							</div>
						)}
					</div>
				</CardContent>
			</Card>
		</motion.div>
	);
}

export function CalendarGrid({
	events,
	currentDate,
	onDateClick,
	onEventClick,
}: {
	events: NetworkingEvent[];
	currentDate: Date;
	onDateClick: (date: Date) => void;
	onEventClick: (event: NetworkingEvent) => void;
}) {
	const year = currentDate.getFullYear();
	const month = currentDate.getMonth();
	const daysInMonth = getDaysInMonth(year, month);
	const firstDay = getFirstDayOfMonth(year, month);

	const days: (number | null)[] = [];
	for (let i = 0; i < firstDay; i++) {
		days.push(null);
	}
	for (let i = 1; i <= daysInMonth; i++) {
		days.push(i);
	}

	const getEventsForDay = (day: number) => {
		const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
		return events.filter((e) => e.date === dateStr);
	};

	const today = new Date();
	const isToday = (day: number) =>
		day === today.getDate() && month === today.getMonth() && year === today.getFullYear();

	return (
		<div className="rounded-lg border">
			<div className="grid grid-cols-7 border-b bg-muted/50">
				{getDayNames().map((dayName, index) => (
					<div key={index} className="py-2 text-center font-medium text-muted-foreground text-sm">
						{dayName}
					</div>
				))}
			</div>
			<div className="grid grid-cols-7">
				{days.map((day, index) => {
					const dayEvents = day ? getEventsForDay(day) : [];
					return (
						<motion.div
							key={index}
							className={cn(
								"min-h-24 border-r border-b p-1 transition-colors last:border-r-0",
								day && "cursor-pointer hover:bg-muted/30",
								isToday(day ?? 0) && "bg-primary/5",
							)}
							onClick={() => day && onDateClick(new Date(year, month, day))}
							whileHover={day ? { scale: 1.02 } : undefined}
						>
							{day && (
								<>
									<div className={cn("mb-1 text-right text-sm", isToday(day) && "font-bold text-primary")}>{day}</div>
									<div className="space-y-0.5">
										{dayEvents.slice(0, 3).map((event) => {
											const typeConfig = getEventTypeConfig()[event.type];
											return (
												<motion.div
													key={event.id}
													className={cn("cursor-pointer truncate rounded px-1 text-xs", typeConfig.color)}
													onClick={(e) => {
														e.stopPropagation();
														onEventClick(event);
													}}
													whileHover={{ scale: 1.05 }}
												>
													{event.title}
												</motion.div>
											);
										})}
										{dayEvents.length > 3 && (
											<div className="text-muted-foreground text-xs">
												+{dayEvents.length - 3} {t`more`}
											</div>
										)}
									</div>
								</>
							)}
						</motion.div>
					);
				})}
			</div>
		</div>
	);
}

export function EventDetailsModal({
	event,
	isOpen,
	onClose,
	onUpdateRsvp,
	onUpdateOutcome,
	onToggleReminder,
}: {
	event: NetworkingEvent | null;
	isOpen: boolean;
	onClose: () => void;
	onUpdateRsvp: (eventId: string, status: RsvpStatus) => void;
	onUpdateOutcome: (eventId: string, outcome: EventOutcome) => void;
	onToggleReminder: (eventId: string, reminderId: string) => void;
}) {
	const [outcomeForm, setOutcomeForm] = useState<EventOutcome>({
		contactsMade: 0,
		followUpsScheduled: 0,
		opportunitiesIdentified: 0,
		notes: "",
	});
	const [showOutcomeForm, setShowOutcomeForm] = useState(false);

	if (!event) return null;

	const typeConfig = getEventTypeConfig()[event.type];
	const TypeIcon = typeConfig.icon;

	const handleSaveOutcome = () => {
		onUpdateOutcome(event.id, outcomeForm);
		setShowOutcomeForm(false);
	};

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="max-w-2xl">
				<DialogHeader>
					<div className="flex items-center gap-2">
						<Badge className={typeConfig.color}>
							<TypeIcon className="mr-1 size-3" />
							{typeConfig.label}
						</Badge>
						{event.isPast && (
							<Badge variant="outline" className="text-muted-foreground">
								{t`Past`}
							</Badge>
						)}
					</div>
					<DialogTitle className="text-xl">{event.title}</DialogTitle>
					<DialogDescription>{event.description}</DialogDescription>
				</DialogHeader>

				<ScrollArea className="max-h-96">
					<div className="space-y-4 pr-4">
						<div className="grid grid-cols-2 gap-4">
							<div>
								<Label className="text-muted-foreground">{t`Date and time`}</Label>
								<div className="mt-1 flex items-center gap-2">
									<CalendarIcon className="size-4" />
									<span>
										{formatDate(event.date)} - {formatTime(event.startTime)} - {formatTime(event.endTime)}
									</span>
								</div>
							</div>
							<div>
								<Label className="text-muted-foreground">{t`Location`}</Label>
								<div className="mt-1 flex items-center gap-2">
									<MapPinIcon className="size-4" />
									<span>{event.location}</span>
								</div>
							</div>
						</div>

						{event.link && (
							<div>
								<Label className="text-muted-foreground">{t`Link`}</Label>
								<div className="mt-1">
									<a
										href={event.link}
										target="_blank"
										rel="noopener noreferrer"
										className="text-primary hover:underline"
									>
										{event.link}
									</a>
								</div>
							</div>
						)}

						<div>
							<Label className="text-muted-foreground">{t`RSVP Status`}</Label>
							<div className="mt-2 flex gap-2">
								{(Object.keys(getRsvpStatusConfig()) as RsvpStatus[]).map((status) => {
									const config = getRsvpStatusConfig()[status];
									const StatusIcon = config.icon;
									return (
										<Button
											key={status}
											variant={event.rsvpStatus === status ? "default" : "outline"}
											size="sm"
											onClick={() => onUpdateRsvp(event.id, status)}
											className={event.rsvpStatus === status ? config.color : ""}
										>
											<StatusIcon className="mr-1 size-4" />
											{config.label}
										</Button>
									);
								})}
							</div>
						</div>

						{event.expectedContacts.length > 0 && (
							<div>
								<Label className="text-muted-foreground">{t`Expected contacts`}</Label>
								<div className="mt-2 space-y-2">
									{event.expectedContacts.map((contact) => (
										<div key={contact.id} className="flex items-center justify-between rounded-md border p-2">
											<div>
												<div className="font-medium">{contact.name}</div>
												<div className="text-muted-foreground text-sm">
													{contact.role} @ {contact.company}
												</div>
											</div>
										</div>
									))}
								</div>
							</div>
						)}

						{event.notes && (
							<div>
								<Label className="text-muted-foreground">{t`Notes`}</Label>
								<div className="mt-1 rounded-md bg-muted/50 p-3 text-sm">{event.notes}</div>
							</div>
						)}

						{event.followUpReminders.length > 0 && (
							<div>
								<Label className="text-muted-foreground">{t`Follow-up reminders`}</Label>
								<div className="mt-2 space-y-2">
									{event.followUpReminders.map((reminder) => (
										<div
											key={reminder.id}
											className={cn(
												"flex items-center justify-between rounded-md border p-2",
												reminder.completed && "opacity-60",
											)}
										>
											<div className="flex items-center gap-2">
												<Button
													variant="ghost"
													size="icon"
													className="size-6"
													onClick={() => onToggleReminder(event.id, reminder.id)}
												>
													{reminder.completed ? (
														<CheckCircleIcon className="size-4 text-green-600" />
													) : (
														<ClockIcon className="size-4" />
													)}
												</Button>
												<div>
													<div className={cn("font-medium", reminder.completed && "line-through")}>
														{reminder.title}
													</div>
													<div className="text-muted-foreground text-xs">{formatDate(reminder.dueDate)}</div>
												</div>
											</div>
										</div>
									))}
								</div>
							</div>
						)}

						{event.isPast && (
							<div>
								<div className="flex items-center justify-between">
									<Label className="text-muted-foreground">{t`Results`}</Label>
									{!event.outcome && !showOutcomeForm && (
										<Button variant="outline" size="sm" onClick={() => setShowOutcomeForm(true)}>
											<PlusIcon className="mr-1 size-4" />
											{t`Add results`}
										</Button>
									)}
								</div>
								{event.outcome && (
									<div className="mt-2 rounded-md bg-muted/50 p-3">
										<div className="grid grid-cols-3 gap-4">
											<div className="text-center">
												<div className="font-bold text-2xl">{event.outcome.contactsMade}</div>
												<div className="text-muted-foreground text-xs">{t`Contacts made`}</div>
											</div>
											<div className="text-center">
												<div className="font-bold text-2xl">{event.outcome.followUpsScheduled}</div>
												<div className="text-muted-foreground text-xs">{t`Follow-ups scheduled`}</div>
											</div>
											<div className="text-center">
												<div className="font-bold text-2xl">{event.outcome.opportunitiesIdentified}</div>
												<div className="text-muted-foreground text-xs">{t`Opportunities`}</div>
											</div>
										</div>
										{event.outcome.notes && <div className="mt-3 border-t pt-3 text-sm">{event.outcome.notes}</div>}
									</div>
								)}
								{showOutcomeForm && (
									<motion.div
										initial={false}
										animate={{ opacity: 1, height: "auto" }}
										className="mt-2 space-y-3 rounded-md border p-3"
									>
										<div className="grid grid-cols-3 gap-3">
											<div>
												<Label>{t`Contacts made`}</Label>
												<Input
													type="number"
													min="0"
													value={outcomeForm.contactsMade}
													onChange={(e) =>
														setOutcomeForm({
															...outcomeForm,
															contactsMade: Number.parseInt(e.target.value, 10) || 0,
														})
													}
												/>
											</div>
											<div>
												<Label>{t`Follow-ups scheduled`}</Label>
												<Input
													type="number"
													min="0"
													value={outcomeForm.followUpsScheduled}
													onChange={(e) =>
														setOutcomeForm({
															...outcomeForm,
															followUpsScheduled: Number.parseInt(e.target.value, 10) || 0,
														})
													}
												/>
											</div>
											<div>
												<Label>{t`Opportunities`}</Label>
												<Input
													type="number"
													min="0"
													value={outcomeForm.opportunitiesIdentified}
													onChange={(e) =>
														setOutcomeForm({
															...outcomeForm,
															opportunitiesIdentified: Number.parseInt(e.target.value, 10) || 0,
														})
													}
												/>
											</div>
										</div>
										<div>
											<Label>{t`Result notes`}</Label>
											<Textarea
												value={outcomeForm.notes}
												onChange={(e) => setOutcomeForm({ ...outcomeForm, notes: e.target.value })}
												rows={3}
											/>
										</div>
										<div className="flex justify-end gap-2">
											<Button variant="outline" size="sm" onClick={() => setShowOutcomeForm(false)}>
												{t`Cancel`}
											</Button>
											<Button size="sm" onClick={handleSaveOutcome}>
												{t`Save`}
											</Button>
										</div>
									</motion.div>
								)}
							</div>
						)}
					</div>
				</ScrollArea>

				<DialogFooter>
					<DialogClose asChild>
						<Button variant="outline">{t`Close`}</Button>
					</DialogClose>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

export function AddEditEventModal({
	event,
	isOpen,
	onClose,
	onSave,
	isSaving,
}: {
	event: NetworkingEvent | null;
	isOpen: boolean;
	onClose: () => void;
	onSave: (event: Omit<NetworkingEvent, "id" | "isPast">) => void;
	isSaving?: boolean;
}) {
	const [form, setForm] = useState<Omit<NetworkingEvent, "id" | "isPast">>({
		title: "",
		date: "",
		startTime: "09:00",
		endTime: "17:00",
		location: "",
		type: "conference",
		description: "",
		rsvpStatus: "maybe",
		expectedContacts: [],
		notes: "",
		followUpReminders: [],
		link: "",
	});

	const [newContact, setNewContact] = useState({ name: "", company: "", role: "" });
	const [newReminder, setNewReminder] = useState({ title: "", description: "", dueDate: "" });

	useMemo(() => {
		if (event) {
			setForm({
				title: event.title,
				date: event.date,
				startTime: event.startTime,
				endTime: event.endTime,
				location: event.location,
				type: event.type,
				description: event.description,
				rsvpStatus: event.rsvpStatus,
				expectedContacts: event.expectedContacts,
				notes: event.notes,
				followUpReminders: event.followUpReminders,
				link: event.link || "",
				outcome: event.outcome,
			});
		} else {
			setForm({
				title: "",
				date: "",
				startTime: "09:00",
				endTime: "17:00",
				location: "",
				type: "conference",
				description: "",
				rsvpStatus: "maybe",
				expectedContacts: [],
				notes: "",
				followUpReminders: [],
				link: "",
			});
		}
	}, [event]);

	const handleAddContact = () => {
		if (newContact.name && newContact.company && newContact.role) {
			setForm({
				...form,
				expectedContacts: [...form.expectedContacts, { id: `ec-${Date.now()}`, ...newContact }],
			});
			setNewContact({ name: "", company: "", role: "" });
		}
	};

	const handleRemoveContact = (id: string) => {
		setForm({
			...form,
			expectedContacts: form.expectedContacts.filter((c) => c.id !== id),
		});
	};

	const handleAddReminder = () => {
		if (newReminder.title && newReminder.dueDate) {
			setForm({
				...form,
				followUpReminders: [
					...form.followUpReminders,
					{
						id: `fr-${Date.now()}`,
						eventId: event?.id || "",
						...newReminder,
						description: newReminder.description || null,
						completed: false,
					},
				],
			});
			setNewReminder({ title: "", description: "", dueDate: "" });
		}
	};

	const handleRemoveReminder = (id: string) => {
		setForm({
			...form,
			followUpReminders: form.followUpReminders.filter((r) => r.id !== id),
		});
	};

	const handleSubmit = () => {
		if (form.title && form.date && form.location) {
			onSave(form);
		}
	};

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="max-w-2xl">
				<DialogHeader>
					<DialogTitle>{event ? t`Edit event` : t`Add event`}</DialogTitle>
					<DialogDescription>
						{event ? t`Modify the details of the networking event.` : t`Add a new event to your networking calendar.`}
					</DialogDescription>
				</DialogHeader>

				<ScrollArea className="max-h-96">
					<div className="space-y-4 pr-4">
						<div className="grid grid-cols-2 gap-4">
							<div className="col-span-2">
								<Label>{t`Title`}</Label>
								<Input
									value={form.title}
									onChange={(e) => setForm({ ...form, title: e.target.value })}
									placeholder={t`Event name`}
								/>
							</div>
							<div>
								<Label>{t`Type`}</Label>
								<Select value={form.type} onValueChange={(value: EventType) => setForm({ ...form, type: value })}>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										{(Object.keys(getEventTypeConfig()) as EventType[]).map((type) => (
											<SelectItem key={type} value={type}>
												{getEventTypeConfig()[type].label}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
							<div>
								<Label>{t`Date`}</Label>
								<Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
							</div>
							<div>
								<Label>{t`Start time`}</Label>
								<Input
									type="time"
									value={form.startTime}
									onChange={(e) => setForm({ ...form, startTime: e.target.value })}
								/>
							</div>
							<div>
								<Label>{t`End time`}</Label>
								<Input
									type="time"
									value={form.endTime}
									onChange={(e) => setForm({ ...form, endTime: e.target.value })}
								/>
							</div>
							<div className="col-span-2">
								<Label>{t`Location`}</Label>
								<Input
									value={form.location}
									onChange={(e) => setForm({ ...form, location: e.target.value })}
									placeholder={t`Address or online link`}
								/>
							</div>
							<div className="col-span-2">
								<Label>{t`Link (optional)`}</Label>
								<Input
									value={form.link || ""}
									onChange={(e) => setForm({ ...form, link: e.target.value })}
									placeholder="https://..."
								/>
							</div>
							<div className="col-span-2">
								<Label>{t`Description`}</Label>
								<Textarea
									value={form.description || ""}
									onChange={(e) => setForm({ ...form, description: e.target.value })}
									rows={3}
								/>
							</div>
							<div className="col-span-2">
								<Label>{t`Notes`}</Label>
								<Textarea
									value={form.notes || ""}
									onChange={(e) => setForm({ ...form, notes: e.target.value })}
									rows={2}
									placeholder={t`Personal notes for this event...`}
								/>
							</div>
						</div>

						<div className="border-t pt-4">
							<Label className="mb-2 block">{t`Expected contacts`}</Label>
							<div className="space-y-2">
								{form.expectedContacts.map((contact) => (
									<div key={contact.id} className="flex items-center justify-between rounded-md border p-2">
										<div>
											<div className="font-medium">{contact.name}</div>
											<div className="text-muted-foreground text-sm">
												{contact.role} @ {contact.company}
											</div>
										</div>
										<Button
											variant="ghost"
											size="icon"
											className="size-8"
											onClick={() => handleRemoveContact(contact.id)}
										>
											<XIcon className="size-4" />
										</Button>
									</div>
								))}
								<div className="grid grid-cols-4 gap-2">
									<Input
										placeholder={t`Name`}
										value={newContact.name}
										onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
									/>
									<Input
										placeholder={t`Company`}
										value={newContact.company}
										onChange={(e) => setNewContact({ ...newContact, company: e.target.value })}
									/>
									<Input
										placeholder={t`Role`}
										value={newContact.role}
										onChange={(e) => setNewContact({ ...newContact, role: e.target.value })}
									/>
									<Button variant="outline" onClick={handleAddContact}>
										<PlusIcon className="size-4" />
									</Button>
								</div>
							</div>
						</div>

						<div className="border-t pt-4">
							<Label className="mb-2 block">{t`Follow-up reminders`}</Label>
							<div className="space-y-2">
								{form.followUpReminders.map((reminder) => (
									<div key={reminder.id} className="flex items-center justify-between rounded-md border p-2">
										<div>
											<div className="font-medium">{reminder.title}</div>
											<div className="text-muted-foreground text-sm">{formatDate(reminder.dueDate)}</div>
										</div>
										<Button
											variant="ghost"
											size="icon"
											className="size-8"
											onClick={() => handleRemoveReminder(reminder.id)}
										>
											<XIcon className="size-4" />
										</Button>
									</div>
								))}
								<div className="grid grid-cols-4 gap-2">
									<Input
										placeholder={t`Reminder title`}
										value={newReminder.title}
										onChange={(e) => setNewReminder({ ...newReminder, title: e.target.value })}
									/>
									<Input
										placeholder={t`Description`}
										value={newReminder.description}
										onChange={(e) =>
											setNewReminder({
												...newReminder,
												description: e.target.value,
											})
										}
									/>
									<Input
										type="date"
										value={newReminder.dueDate}
										onChange={(e) => setNewReminder({ ...newReminder, dueDate: e.target.value })}
									/>
									<Button variant="outline" onClick={handleAddReminder}>
										<PlusIcon className="size-4" />
									</Button>
								</div>
							</div>
						</div>
					</div>
				</ScrollArea>

				<DialogFooter>
					<DialogClose asChild>
						<Button variant="outline">{t`Cancel`}</Button>
					</DialogClose>
					<Button onClick={handleSubmit} disabled={isSaving}>
						{isSaving ? t`Saving...` : event ? t`Save` : t`Add`}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

export function DeleteConfirmModal({
	isOpen,
	onClose,
	onConfirm,
	eventTitle,
	isDeleting,
}: {
	isOpen: boolean;
	onClose: () => void;
	onConfirm: () => void;
	eventTitle: string;
	isDeleting?: boolean;
}) {
	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>{t`Delete event`}</DialogTitle>
					<DialogDescription>
						{t`Are you sure you want to delete "${eventTitle}"? This action cannot be undone.`}
					</DialogDescription>
				</DialogHeader>
				<DialogFooter>
					<DialogClose asChild>
						<Button variant="outline">{t`Cancel`}</Button>
					</DialogClose>
					<Button variant="destructive" onClick={onConfirm} disabled={isDeleting}>
						{isDeleting ? t`Deleting...` : t`Delete`}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
