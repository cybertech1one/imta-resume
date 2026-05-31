import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import {
	BellIcon,
	CheckCircleIcon,
	ClockIcon,
	CopyIcon,
	DownloadIcon,
	EnvelopeIcon,
	LinkedinLogoIcon,
	MapPinIcon,
	NotePencilIcon,
	PencilSimpleIcon,
	PhoneIcon,
	PlusIcon,
	TagIcon,
	TrashIcon,
	UploadIcon,
} from "@phosphor-icons/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/utils/style";
import {
	categoryConfig,
	eventTypeConfig,
	interactionTypeConfig,
	strengthConfig,
	templateCategoryConfig,
} from "./networking-config";
import type {
	ConnectionStrength,
	Contact,
	ContactCategory,
	EmailTemplate,
	EventType,
	Interaction,
	InteractionType,
	NetworkingEvent,
	Reminder,
} from "./networking-types";

// ============================================================================
// ContactDialog (Add/Edit Contact)
// ============================================================================

interface ContactDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	editingContact: Contact | null;
	contactForm: Partial<Contact>;
	setContactForm: (form: Partial<Contact>) => void;
	handleSaveContact: () => void;
}

export function ContactDialog({
	open,
	onOpenChange,
	editingContact,
	contactForm,
	setContactForm,
	handleSaveContact,
}: ContactDialogProps) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
				<DialogHeader>
					<DialogTitle>{editingContact ? <Trans>Edit Contact</Trans> : <Trans>Add New Contact</Trans>}</DialogTitle>
					<DialogDescription>
						{editingContact ? (
							<Trans>Update contact information</Trans>
						) : (
							<Trans>Add a new contact to your network</Trans>
						)}
					</DialogDescription>
				</DialogHeader>

				<div className="grid gap-4 py-4">
					<div className="grid grid-cols-2 gap-4">
						<div className="space-y-2">
							<Label htmlFor="firstName">
								<Trans>First Name</Trans> *
							</Label>
							<Input
								id="firstName"
								value={contactForm.firstName}
								onChange={(e) => setContactForm({ ...contactForm, firstName: e.target.value })}
								placeholder={t`John`}
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="lastName">
								<Trans>Last Name</Trans> *
							</Label>
							<Input
								id="lastName"
								value={contactForm.lastName}
								onChange={(e) => setContactForm({ ...contactForm, lastName: e.target.value })}
								placeholder={t`Doe`}
							/>
						</div>
					</div>

					<div className="space-y-2">
						<Label htmlFor="email">
							<Trans>Email</Trans> *
						</Label>
						<Input
							id="email"
							type="email"
							value={contactForm.email}
							onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
							placeholder={t`john.doe@company.com`}
						/>
					</div>

					<div className="grid grid-cols-2 gap-4">
						<div className="space-y-2">
							<Label htmlFor="phone">
								<Trans>Phone</Trans>
							</Label>
							<Input
								id="phone"
								value={contactForm.phone}
								onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
								placeholder={t`+1 555-123-4567`}
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="location">
								<Trans>Location</Trans>
							</Label>
							<Input
								id="location"
								value={contactForm.location}
								onChange={(e) => setContactForm({ ...contactForm, location: e.target.value })}
								placeholder={t`San Francisco, CA`}
							/>
						</div>
					</div>

					<div className="grid grid-cols-2 gap-4">
						<div className="space-y-2">
							<Label htmlFor="company">
								<Trans>Company</Trans> *
							</Label>
							<Input
								id="company"
								value={contactForm.company}
								onChange={(e) => setContactForm({ ...contactForm, company: e.target.value })}
								placeholder={t`Tech Corp`}
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="jobTitle">
								<Trans>Job Title</Trans> *
							</Label>
							<Input
								id="jobTitle"
								value={contactForm.jobTitle}
								onChange={(e) => setContactForm({ ...contactForm, jobTitle: e.target.value })}
								placeholder={t`Senior Recruiter`}
							/>
						</div>
					</div>

					<div className="grid grid-cols-2 gap-4">
						<div className="space-y-2">
							<Label htmlFor="category">
								<Trans>Category</Trans>
							</Label>
							<Select
								value={contactForm.category}
								onValueChange={(v) => setContactForm({ ...contactForm, category: v as ContactCategory })}
							>
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									{Object.entries(categoryConfig).map(([key, { label, icon: Icon }]) => (
										<SelectItem key={key} value={key}>
											<div className="flex items-center gap-2">
												<Icon className="size-4" />
												{label}
											</div>
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
						<div className="space-y-2">
							<Label htmlFor="strength">
								<Trans>Connection Strength</Trans>
							</Label>
							<Select
								value={contactForm.connectionStrength}
								onValueChange={(v) => setContactForm({ ...contactForm, connectionStrength: v as ConnectionStrength })}
							>
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									{Object.entries(strengthConfig).map(([key, { label }]) => (
										<SelectItem key={key} value={key}>
											{label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
					</div>

					<div className="space-y-2">
						<Label htmlFor="linkedin">
							<Trans>LinkedIn Profile URL</Trans>
						</Label>
						<div className="relative">
							<LinkedinLogoIcon className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
							<Input
								id="linkedin"
								value={contactForm.linkedinUrl}
								onChange={(e) => setContactForm({ ...contactForm, linkedinUrl: e.target.value })}
								placeholder={t`https://linkedin.com/in/username`}
								className="pl-10"
							/>
						</div>
					</div>

					<div className="space-y-2">
						<Label htmlFor="tags">
							<Trans>Tags (comma-separated)</Trans>
						</Label>
						<Input
							id="tags"
							value={contactForm.tags?.join(", ")}
							onChange={(e) =>
								setContactForm({
									...contactForm,
									tags: e.target.value
										.split(",")
										.map((t) => t.trim())
										.filter(Boolean),
								})
							}
							placeholder={t`tech, senior-roles, responsive`}
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="notes">
							<Trans>Notes</Trans>
						</Label>
						<Textarea
							id="notes"
							value={contactForm.notes}
							onChange={(e) => setContactForm({ ...contactForm, notes: e.target.value })}
							placeholder={t`How you met, topics discussed, etc.`}
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
					<Button
						onClick={handleSaveContact}
						disabled={
							!contactForm.firstName ||
							!contactForm.lastName ||
							!contactForm.email ||
							!contactForm.company ||
							!contactForm.jobTitle
						}
					>
						{editingContact ? <Trans>Save Changes</Trans> : <Trans>Add Contact</Trans>}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

// ============================================================================
// ContactDetailDialog
// ============================================================================

interface ContactDetailDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	selectedContact: Contact | null;
	getContactInteractions: (contactId: string) => Interaction[];
	getContactReminders: (contactId: string) => Reminder[];
	handleCompleteReminder: (reminderId: string) => void;
	handleDeleteContact: (contactId: string) => void;
	onEditContact: (contact: Contact) => void;
	onLogInteraction: () => void;
	onAddReminder: () => void;
}

export function ContactDetailDialog({
	open,
	onOpenChange,
	selectedContact,
	getContactInteractions,
	getContactReminders,
	handleCompleteReminder,
	handleDeleteContact,
	onEditContact,
	onLogInteraction,
	onAddReminder,
}: ContactDetailDialogProps) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
				{selectedContact && (
					<>
						<DialogHeader>
							<div className="flex items-start gap-4">
								<div
									className={cn(
										"flex size-16 shrink-0 items-center justify-center rounded-full",
										categoryConfig[selectedContact.category].color,
									)}
								>
									<span className="font-semibold text-2xl">
										{selectedContact.firstName[0]}
										{selectedContact.lastName[0]}
									</span>
								</div>
								<div className="flex-1">
									<div className="flex items-center gap-2">
										<DialogTitle className="text-2xl">
											{selectedContact.firstName} {selectedContact.lastName}
										</DialogTitle>
									</div>
									<DialogDescription className="text-base">
										{selectedContact.jobTitle} at {selectedContact.company}
									</DialogDescription>
								</div>
							</div>
						</DialogHeader>

						<div className="space-y-6 py-4">
							{/* Contact Info */}
							<div className="grid gap-4 md:grid-cols-2">
								<div className="flex items-center gap-3 rounded-lg bg-muted/50 p-3">
									<EnvelopeIcon className="size-5 text-muted-foreground" />
									<div>
										<p className="text-muted-foreground text-xs">
											<Trans>Email</Trans>
										</p>
										<a href={`mailto:${selectedContact.email}`} className="font-medium hover:text-primary">
											{selectedContact.email}
										</a>
									</div>
								</div>
								{selectedContact.phone && (
									<div className="flex items-center gap-3 rounded-lg bg-muted/50 p-3">
										<PhoneIcon className="size-5 text-muted-foreground" />
										<div>
											<p className="text-muted-foreground text-xs">
												<Trans>Phone</Trans>
											</p>
											<a href={`tel:${selectedContact.phone}`} className="font-medium hover:text-primary">
												{selectedContact.phone}
											</a>
										</div>
									</div>
								)}
								{selectedContact.location && (
									<div className="flex items-center gap-3 rounded-lg bg-muted/50 p-3">
										<MapPinIcon className="size-5 text-muted-foreground" />
										<div>
											<p className="text-muted-foreground text-xs">
												<Trans>Location</Trans>
											</p>
											<p className="font-medium">{selectedContact.location}</p>
										</div>
									</div>
								)}
								{selectedContact.linkedinUrl && (
									<div className="flex items-center gap-3 rounded-lg bg-muted/50 p-3">
										<LinkedinLogoIcon className="size-5 text-blue-600" />
										<div>
											<p className="text-muted-foreground text-xs">
												<Trans>LinkedIn</Trans>
											</p>
											<a
												href={selectedContact.linkedinUrl}
												target="_blank"
												rel="noopener noreferrer"
												className="font-medium hover:text-primary"
											>
												<Trans>View Profile</Trans>
											</a>
										</div>
									</div>
								)}
							</div>

							{/* Connection Strength & Category */}
							<div className="flex flex-wrap items-center gap-4">
								<div>
									<p className="mb-1 text-muted-foreground text-xs">
										<Trans>Category</Trans>
									</p>
									<Badge className={categoryConfig[selectedContact.category].color}>
										{categoryConfig[selectedContact.category].label}
									</Badge>
								</div>
							</div>

							{/* Tags */}
							{selectedContact.tags.length > 0 && (
								<div>
									<p className="mb-2 flex items-center gap-1 text-muted-foreground text-sm">
										<TagIcon className="size-4" />
										<Trans>Tags</Trans>
									</p>
									<div className="flex flex-wrap gap-2">
										{selectedContact.tags.map((tag) => (
											<Badge key={tag} variant="outline">
												{tag}
											</Badge>
										))}
									</div>
								</div>
							)}

							{/* Notes */}
							{selectedContact.notes && (
								<div>
									<p className="mb-2 flex items-center gap-1 text-muted-foreground text-sm">
										<NotePencilIcon className="size-4" />
										<Trans>Notes</Trans>
									</p>
									<p className="rounded-lg bg-muted/50 p-3 text-sm">{selectedContact.notes}</p>
								</div>
							)}

							{/* Interaction History */}
							<div>
								<div className="mb-3 flex items-center justify-between">
									<p className="flex items-center gap-1 font-medium">
										<ClockIcon className="size-4" />
										<Trans>Interaction History</Trans>
									</p>
									<Button size="sm" variant="outline" onClick={onLogInteraction}>
										<PlusIcon className="mr-1 size-4" />
										<Trans>Log Interaction</Trans>
									</Button>
								</div>
								<div className="space-y-2">
									{getContactInteractions(selectedContact.id).length > 0 ? (
										getContactInteractions(selectedContact.id).map((interaction) => {
											const typeConf = interactionTypeConfig[interaction.type];
											const TypeIcon = typeConf.icon;

											return (
												<div key={interaction.id} className="flex items-start gap-3 rounded-lg bg-muted/30 p-3">
													<div className="flex size-8 items-center justify-center rounded-full bg-primary/10">
														<TypeIcon className="size-4 text-primary" />
													</div>
													<div className="flex-1">
														<div className="flex items-center gap-2">
															<span className="font-medium text-sm">{typeConf.label}</span>
															<span className="text-muted-foreground text-xs">
																{new Date(interaction.date).toLocaleDateString("fr-FR")}
															</span>
															{interaction.followUpNeeded && (
																<Badge className="bg-amber-100 text-amber-700 text-xs dark:bg-amber-900/30 dark:text-amber-400">
																	<Trans>Follow-up needed</Trans>
																</Badge>
															)}
														</div>
														<p className="mt-1 text-muted-foreground text-sm">{interaction.notes}</p>
													</div>
												</div>
											);
										})
									) : (
										<p className="text-center text-muted-foreground text-sm">
											<Trans>No interactions logged yet</Trans>
										</p>
									)}
								</div>
							</div>

							{/* Reminders */}
							<div>
								<div className="mb-3 flex items-center justify-between">
									<p className="flex items-center gap-1 font-medium">
										<BellIcon className="size-4" />
										<Trans>Follow-up Reminders</Trans>
									</p>
									<Button size="sm" variant="outline" onClick={onAddReminder}>
										<PlusIcon className="mr-1 size-4" />
										<Trans>Add Reminder</Trans>
									</Button>
								</div>
								<div className="space-y-2">
									{getContactReminders(selectedContact.id).length > 0 ? (
										getContactReminders(selectedContact.id).map((reminder) => (
											<div
												key={reminder.id}
												className="flex items-center justify-between rounded-lg bg-amber-50 p-3 dark:bg-amber-900/20"
											>
												<div>
													<p className="font-medium text-sm">{reminder.title}</p>
													<p className="text-muted-foreground text-xs">
														Due: {new Date(reminder.dueDate).toLocaleDateString("fr-FR")}
													</p>
												</div>
												<Button size="sm" onClick={() => handleCompleteReminder(reminder.id)}>
													<CheckCircleIcon className="mr-1 size-4" />
													<Trans>Done</Trans>
												</Button>
											</div>
										))
									) : (
										<p className="text-center text-muted-foreground text-sm">
											<Trans>No pending reminders</Trans>
										</p>
									)}
								</div>
							</div>
						</div>

						<DialogFooter>
							<Button
								variant="outline"
								onClick={() => {
									onEditContact(selectedContact);
								}}
							>
								<PencilSimpleIcon className="mr-2 size-4" />
								<Trans>Edit</Trans>
							</Button>
							<Button variant="destructive" onClick={() => handleDeleteContact(selectedContact.id)}>
								<TrashIcon className="mr-2 size-4" />
								<Trans>Delete</Trans>
							</Button>
						</DialogFooter>
					</>
				)}
			</DialogContent>
		</Dialog>
	);
}

// ============================================================================
// InteractionDialog
// ============================================================================

interface InteractionDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	interactionForm: Partial<Interaction>;
	setInteractionForm: (form: Partial<Interaction>) => void;
	handleAddInteraction: () => void;
}

export function InteractionDialog({
	open,
	onOpenChange,
	interactionForm,
	setInteractionForm,
	handleAddInteraction,
}: InteractionDialogProps) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>
						<Trans>Log Interaction</Trans>
					</DialogTitle>
					<DialogDescription>
						<Trans>Record an interaction with this contact</Trans>
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-4 py-4">
					<div className="space-y-2">
						<Label htmlFor="interactionType">
							<Trans>Type</Trans>
						</Label>
						<Select
							value={interactionForm.type}
							onValueChange={(v) => setInteractionForm({ ...interactionForm, type: v as InteractionType })}
						>
							<SelectTrigger>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{Object.entries(interactionTypeConfig).map(([key, { label, icon: Icon }]) => (
									<SelectItem key={key} value={key}>
										<div className="flex items-center gap-2">
											<Icon className="size-4" />
											{label}
										</div>
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					<div className="space-y-2">
						<Label htmlFor="interactionDate">
							<Trans>Date</Trans>
						</Label>
						<Input
							id="interactionDate"
							type="date"
							value={interactionForm.date}
							onChange={(e) => setInteractionForm({ ...interactionForm, date: e.target.value })}
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="interactionNotes">
							<Trans>Notes</Trans>
						</Label>
						<Textarea
							id="interactionNotes"
							value={interactionForm.notes}
							onChange={(e) => setInteractionForm({ ...interactionForm, notes: e.target.value })}
							placeholder={t`What did you discuss?`}
							rows={3}
						/>
					</div>

					<div className="flex items-center gap-2">
						<input
							type="checkbox"
							id="followUpNeeded"
							checked={interactionForm.followUpNeeded}
							onChange={(e) => setInteractionForm({ ...interactionForm, followUpNeeded: e.target.checked })}
							className="size-4 rounded border"
						/>
						<Label htmlFor="followUpNeeded">
							<Trans>Follow-up needed</Trans>
						</Label>
					</div>
				</div>

				<DialogFooter>
					<DialogClose asChild>
						<Button variant="outline">
							<Trans>Cancel</Trans>
						</Button>
					</DialogClose>
					<Button onClick={handleAddInteraction}>
						<Trans>Log Interaction</Trans>
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

// ============================================================================
// ReminderDialog
// ============================================================================

interface ReminderDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	reminderForm: Partial<Reminder>;
	setReminderForm: (form: Partial<Reminder>) => void;
	handleAddReminder: () => void;
}

export function ReminderDialog({
	open,
	onOpenChange,
	reminderForm,
	setReminderForm,
	handleAddReminder,
}: ReminderDialogProps) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>
						<Trans>Add Follow-up Reminder</Trans>
					</DialogTitle>
					<DialogDescription>
						<Trans>Set a reminder to follow up with this contact</Trans>
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-4 py-4">
					<div className="space-y-2">
						<Label htmlFor="reminderTitle">
							<Trans>Title</Trans> *
						</Label>
						<Input
							id="reminderTitle"
							value={reminderForm.title}
							onChange={(e) => setReminderForm({ ...reminderForm, title: e.target.value })}
							placeholder={t`e.g., Follow up on job opening`}
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="reminderDescription">
							<Trans>Description</Trans>
						</Label>
						<Textarea
							id="reminderDescription"
							value={reminderForm.description}
							onChange={(e) => setReminderForm({ ...reminderForm, description: e.target.value })}
							placeholder={t`Details about this follow-up...`}
							rows={2}
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="reminderDate">
							<Trans>Due Date</Trans> *
						</Label>
						<Input
							id="reminderDate"
							type="date"
							value={reminderForm.dueDate}
							onChange={(e) => setReminderForm({ ...reminderForm, dueDate: e.target.value })}
						/>
					</div>
				</div>

				<DialogFooter>
					<DialogClose asChild>
						<Button variant="outline">
							<Trans>Cancel</Trans>
						</Button>
					</DialogClose>
					<Button onClick={handleAddReminder} disabled={!reminderForm.title || !reminderForm.dueDate}>
						<Trans>Add Reminder</Trans>
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

// ============================================================================
// EventDialog
// ============================================================================

interface EventDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	eventForm: Partial<NetworkingEvent>;
	setEventForm: (form: Partial<NetworkingEvent>) => void;
	handleSaveEvent: () => void;
}

export function EventDialog({ open, onOpenChange, eventForm, setEventForm, handleSaveEvent }: EventDialogProps) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>
						<Trans>Add Networking Event</Trans>
					</DialogTitle>
					<DialogDescription>
						<Trans>Track networking events and opportunities</Trans>
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-4 py-4">
					<div className="space-y-2">
						<Label htmlFor="eventName">
							<Trans>Event Name</Trans> *
						</Label>
						<Input
							id="eventName"
							value={eventForm.name}
							onChange={(e) => setEventForm({ ...eventForm, name: e.target.value })}
							placeholder={t`TechConnect 2024`}
						/>
					</div>

					<div className="grid grid-cols-2 gap-4">
						<div className="space-y-2">
							<Label htmlFor="eventType">
								<Trans>Type</Trans>
							</Label>
							<Select
								value={eventForm.type}
								onValueChange={(v) => setEventForm({ ...eventForm, type: v as EventType })}
							>
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									{Object.entries(eventTypeConfig).map(([key, { label }]) => (
										<SelectItem key={key} value={key}>
											{label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
						<div className="space-y-2">
							<Label htmlFor="eventDate">
								<Trans>Date</Trans> *
							</Label>
							<Input
								id="eventDate"
								type="date"
								value={eventForm.date}
								onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })}
							/>
						</div>
					</div>

					<div className="space-y-2">
						<Label htmlFor="eventLocation">
							<Trans>Location</Trans> *
						</Label>
						<Input
							id="eventLocation"
							value={eventForm.location}
							onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })}
							placeholder={t`Convention Center, San Francisco`}
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="eventLink">
							<Trans>Website URL</Trans>
						</Label>
						<Input
							id="eventLink"
							value={eventForm.link}
							onChange={(e) => setEventForm({ ...eventForm, link: e.target.value })}
							placeholder={t`https://event-website.com`}
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="eventDescription">
							<Trans>Description</Trans>
						</Label>
						<Textarea
							id="eventDescription"
							value={eventForm.description}
							onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
							placeholder={t`Brief description of the event...`}
							rows={2}
						/>
					</div>

					<div className="flex items-center gap-2">
						<input
							type="checkbox"
							id="isAttending"
							checked={eventForm.isAttending}
							onChange={(e) => setEventForm({ ...eventForm, isAttending: e.target.checked })}
							className="size-4 rounded border"
						/>
						<Label htmlFor="isAttending">
							<Trans>I'm attending this event</Trans>
						</Label>
					</div>
				</div>

				<DialogFooter>
					<DialogClose asChild>
						<Button variant="outline">
							<Trans>Cancel</Trans>
						</Button>
					</DialogClose>
					<Button onClick={handleSaveEvent} disabled={!eventForm.name || !eventForm.date || !eventForm.location}>
						<Trans>Add Event</Trans>
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

// ============================================================================
// TemplatePreviewDialog
// ============================================================================

interface TemplatePreviewDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	selectedTemplate: EmailTemplate | null;
	copyTemplateToClipboard: (template: EmailTemplate) => void;
}

export function TemplatePreviewDialog({
	open,
	onOpenChange,
	selectedTemplate,
	copyTemplateToClipboard,
}: TemplatePreviewDialogProps) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-2xl">
				{selectedTemplate && (
					<>
						<DialogHeader>
							<div className="flex items-center gap-2">
								<Badge className={templateCategoryConfig[selectedTemplate.category].color}>
									{templateCategoryConfig[selectedTemplate.category].label}
								</Badge>
							</div>
							<DialogTitle>{selectedTemplate.name}</DialogTitle>
						</DialogHeader>

						<div className="space-y-4 py-4">
							<div>
								<Label className="text-muted-foreground">
									<Trans>Subject Line</Trans>
								</Label>
								<p className="mt-1 rounded-lg bg-muted/50 p-3 font-medium">{selectedTemplate.subject}</p>
							</div>
							<div>
								<Label className="text-muted-foreground">
									<Trans>Email Body</Trans>
								</Label>
								<pre className="mt-1 max-h-80 overflow-y-auto whitespace-pre-wrap rounded-lg bg-muted/50 p-4 font-sans text-sm">
									{selectedTemplate.body}
								</pre>
							</div>
						</div>

						<DialogFooter>
							<DialogClose asChild>
								<Button variant="outline">
									<Trans>Close</Trans>
								</Button>
							</DialogClose>
							<Button onClick={() => copyTemplateToClipboard(selectedTemplate)} className="gap-2">
								<CopyIcon className="size-4" />
								<Trans>Copy to Clipboard</Trans>
							</Button>
						</DialogFooter>
					</>
				)}
			</DialogContent>
		</Dialog>
	);
}

// ============================================================================
// ImportExportDialog
// ============================================================================

interface ImportExportDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	handleExportContacts: () => void;
	handleExportCSV: () => void;
	onImportContacts: (contacts: Contact[]) => void;
}

export function ImportExportDialog({
	open,
	onOpenChange,
	handleExportContacts,
	handleExportCSV,
	onImportContacts,
}: ImportExportDialogProps) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>
						<Trans>Import / Export Contacts</Trans>
					</DialogTitle>
					<DialogDescription>
						<Trans>Manage your contacts data</Trans>
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-4 py-4">
					<div className="space-y-3">
						<h4 className="font-medium">
							<Trans>Export Contacts</Trans>
						</h4>
						<div className="flex gap-2">
							<Button variant="outline" onClick={handleExportContacts} className="flex-1 gap-2">
								<DownloadIcon className="size-4" />
								<Trans>Export as JSON</Trans>
							</Button>
							<Button variant="outline" onClick={handleExportCSV} className="flex-1 gap-2">
								<DownloadIcon className="size-4" />
								<Trans>Export as CSV</Trans>
							</Button>
						</div>
					</div>

					<div className="border-t pt-4">
						<h4 className="mb-3 font-medium">
							<Trans>Import Contacts</Trans>
						</h4>
						<div className="rounded-lg border-2 border-dashed p-6 text-center">
							<UploadIcon className="mx-auto mb-2 size-8 text-muted-foreground" />
							<p className="text-muted-foreground text-sm">
								<Trans>Drag and drop a JSON file here, or click to browse</Trans>
							</p>
							<input
								type="file"
								accept=".json"
								className="mt-2"
								onChange={(e) => {
									const file = e.target.files?.[0];
									if (file) {
										const reader = new FileReader();
										reader.onload = (event) => {
											try {
												const imported = JSON.parse(event.target?.result as string);
												if (Array.isArray(imported)) {
													onImportContacts(imported as Contact[]);
												}
											} catch {
												// Error handling is done by the parent via toast
											}
										};
										reader.readAsText(file);
									}
								}}
							/>
						</div>
					</div>
				</div>

				<DialogFooter>
					<DialogClose asChild>
						<Button variant="outline">
							<Trans>Close</Trans>
						</Button>
					</DialogClose>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
