import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import {
	ArrowUpIcon,
	BellIcon,
	CalendarIcon,
	EnvelopeIcon,
	HandshakeIcon,
	PlusIcon,
	UsersIcon,
} from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { createLazyFileRoute } from "@tanstack/react-router";
import { useCallback, useMemo, useState } from "react";
import { ErrorComponent } from "@/components/error-component";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { authClient } from "@/integrations/auth/client";
import { orpc } from "@/integrations/orpc/client";
import { DashboardHeader } from "../-components/header";
import {
	ContactDetailDialog,
	ContactDialog,
	ContactsTab,
	EventDialog,
	EventsTab,
	HeroSection,
	ImportExportDialog,
	InteractionDialog,
	ReminderDialog,
	RemindersTab,
	TemplatePreviewDialog,
	TemplatesTab,
} from "./-components/networking-index-components";
import {
	INITIAL_CONTACT_FORM,
	INITIAL_EVENT_FORM,
	INITIAL_INTERACTION_FORM,
	INITIAL_REMINDER_FORM,
} from "./-components/networking-index-config";
import { useNetworkingMutations } from "./-components/networking-index-hooks";
import {
	computeStats,
	copyTemplateToClipboard,
	exportContactsAsCsv,
	exportContactsAsJson,
	filterContacts,
	getInteractionsForContact,
	getRemindersForContact,
	transformDbContacts,
	transformDbEvents,
	transformDbFollowUps,
} from "./-components/networking-index-utils";
import { INITIAL_TEMPLATES } from "./-components/networking-templates";
import type { Contact, EmailTemplate, Interaction, NetworkingEvent, Reminder } from "./-components/networking-types";

// biome-ignore lint/suspicious/noExplicitAny: Route path not in generated route tree
export const Route = createLazyFileRoute("/dashboard/networking/" as any)({
	component: NetworkingPage,
	errorComponent: ErrorComponent,
});

function NetworkingPage() {
	const { data: session } = authClient.useSession();
	const [activeTab, setActiveTab] = useState("contacts");
	const [searchQuery, setSearchQuery] = useState("");
	const [categoryFilter, setCategoryFilter] = useState<string>("all");
	const [strengthFilter, setStrengthFilter] = useState<string>("all");
	const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

	const { data: dbContacts } = useQuery({ ...orpc.networking.list.queryOptions({}), enabled: !!session?.user });
	const { data: dbEvents } = useQuery({
		...orpc.networkingEvents.list.queryOptions({ showPast: true }),
		enabled: !!session?.user,
	});
	const { data: dbStats } = useQuery({ ...orpc.networking.getStatistics.queryOptions(), enabled: !!session?.user });
	const { data: dbFollowUps } = useQuery({
		...orpc.networking.getFollowUpReminders.queryOptions({}),
		enabled: !!session?.user,
	});

	// biome-ignore lint/suspicious/noExplicitAny: DB types don't match exactly
	const contacts: Contact[] = useMemo(() => transformDbContacts(dbContacts as any), [dbContacts]);
	// biome-ignore lint/suspicious/noExplicitAny: DB types don't match exactly
	const events: NetworkingEvent[] = useMemo(() => transformDbEvents(dbEvents as any), [dbEvents]);
	const [localInteractions, setLocalInteractions] = useState<Interaction[]>([]);
	// biome-ignore lint/suspicious/noExplicitAny: DB types don't match exactly
	const reminders: Reminder[] = useMemo(() => transformDbFollowUps(dbFollowUps as any), [dbFollowUps]);

	const interactions = localInteractions;
	const templates = INITIAL_TEMPLATES;

	const [isContactDialogOpen, setIsContactDialogOpen] = useState(false);
	const [isInteractionDialogOpen, setIsInteractionDialogOpen] = useState(false);
	const [isReminderDialogOpen, setIsReminderDialogOpen] = useState(false);
	const [isEventDialogOpen, setIsEventDialogOpen] = useState(false);
	const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);
	const [isContactDetailOpen, setIsContactDetailOpen] = useState(false);
	const [isImportExportDialogOpen, setIsImportExportDialogOpen] = useState(false);

	const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
	const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
	const [editingContact, setEditingContact] = useState<Contact | null>(null);

	const [contactForm, setContactForm] = useState<Partial<Contact>>(INITIAL_CONTACT_FORM);
	const [interactionForm, setInteractionForm] = useState<Partial<Interaction>>(INITIAL_INTERACTION_FORM);
	const [reminderForm, setReminderForm] = useState<Partial<Reminder>>(INITIAL_REMINDER_FORM);
	const [eventForm, setEventForm] = useState<Partial<NetworkingEvent>>(INITIAL_EVENT_FORM);

	const resetContactForm = () => setContactForm(INITIAL_CONTACT_FORM);
	const resetInteractionForm = () =>
		setInteractionForm({
			type: "email",
			date: new Date().toISOString().split("T")[0],
			notes: "",
			followUpNeeded: false,
		});
	const resetReminderForm = () => setReminderForm(INITIAL_REMINDER_FORM);
	const resetEventForm = () => setEventForm(INITIAL_EVENT_FORM);

	const filteredContacts = useMemo(
		() => filterContacts(contacts, searchQuery, categoryFilter, strengthFilter, showFavoritesOnly),
		[contacts, searchQuery, categoryFilter, strengthFilter, showFavoritesOnly],
	);

	const getContactInteractions = useCallback(
		(contactId: string) => getInteractionsForContact(interactions, contactId),
		[interactions],
	);

	const getContactReminders = useCallback(
		(contactId: string) => getRemindersForContact(reminders, contactId),
		[reminders],
	);

	const stats = useMemo(
		// biome-ignore lint/suspicious/noExplicitAny: DB types don't match exactly
		() => computeStats(contacts, reminders, events, interactions, dbStats as any),
		[contacts, reminders, events, interactions, dbStats],
	);

	const {
		handleSaveContact,
		handleDeleteContact,
		handleToggleFavorite,
		handleAddInteraction,
		handleAddReminder,
		handleCompleteReminder,
		handleSnoozeReminder,
		handleSaveEvent,
		handleToggleEventAttendance,
		openEditContact,
		openContactDetail,
		handleImportContacts,
	} = useNetworkingMutations({
		contactForm,
		interactionForm,
		reminderForm,
		eventForm,
		editingContact,
		selectedContact,
		events,
		setIsContactDialogOpen,
		setIsInteractionDialogOpen,
		setIsReminderDialogOpen,
		setIsEventDialogOpen,
		setIsContactDetailOpen,
		setEditingContact,
		setSelectedContact,
		setContactForm,
		setLocalInteractions,
		resetContactForm,
		resetInteractionForm,
		resetReminderForm,
		resetEventForm,
	});

	const handleExportContacts = () => exportContactsAsJson(contacts);
	const handleExportCSV = () => exportContactsAsCsv(contacts);

	const clearFilters = () => {
		setSearchQuery("");
		setCategoryFilter("all");
		setStrengthFilter("all");
		setShowFavoritesOnly(false);
	};

	const hasActiveFilters = searchQuery || categoryFilter !== "all" || strengthFilter !== "all" || showFavoritesOnly;

	return (
		<>
			<DashboardHeader icon={HandshakeIcon} title={t`Networking & Contacts`} />

			<HeroSection stats={stats} />

			<Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
				<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
					<TabsList className="flex h-auto flex-wrap gap-2 bg-transparent p-0">
						{[
							{ value: "contacts", icon: UsersIcon, label: t`Contacts` },
							{ value: "reminders", icon: BellIcon, label: t`Reminders` },
							{ value: "events", icon: CalendarIcon, label: t`Events` },
							{ value: "templates", icon: EnvelopeIcon, label: t`Templates` },
						].map((tab) => (
							<TabsTrigger
								key={tab.value}
								value={tab.value}
								className="gap-2 rounded-full border border-transparent bg-muted/50 px-6 py-2.5 data-[state=active]:border-primary/30 data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
							>
								<tab.icon className="size-4" />
								{tab.label}
								{tab.value === "reminders" && stats.pendingReminders > 0 && (
									<Badge className="ml-1 size-5 justify-center rounded-full bg-red-500 p-0 text-white text-xs">
										{stats.pendingReminders}
									</Badge>
								)}
							</TabsTrigger>
						))}
					</TabsList>

					{activeTab === "contacts" && (
						<div className="flex gap-2">
							<Button variant="outline" size="sm" onClick={() => setIsImportExportDialogOpen(true)} className="gap-2">
								<ArrowUpIcon className="size-4" />
								<Trans>Import/Export</Trans>
							</Button>
							<Button
								size="sm"
								onClick={() => {
									setEditingContact(null);
									resetContactForm();
									setIsContactDialogOpen(true);
								}}
								className="gap-2"
							>
								<PlusIcon className="size-4" />
								<Trans>Add Contact</Trans>
							</Button>
						</div>
					)}

					{activeTab === "events" && (
						<Button
							size="sm"
							onClick={() => {
								resetEventForm();
								setIsEventDialogOpen(true);
							}}
							className="gap-2"
						>
							<PlusIcon className="size-4" />
							<Trans>Add Event</Trans>
						</Button>
					)}
				</div>

				<TabsContent value="contacts">
					<ContactsTab
						filteredContacts={filteredContacts}
						searchQuery={searchQuery}
						setSearchQuery={setSearchQuery}
						categoryFilter={categoryFilter}
						setCategoryFilter={setCategoryFilter}
						strengthFilter={strengthFilter}
						setStrengthFilter={setStrengthFilter}
						showFavoritesOnly={showFavoritesOnly}
						setShowFavoritesOnly={setShowFavoritesOnly}
						hasActiveFilters={!!hasActiveFilters}
						clearFilters={clearFilters}
						getContactReminders={getContactReminders}
						openContactDetail={openContactDetail}
						openEditContact={openEditContact}
						handleToggleFavorite={handleToggleFavorite}
						handleDeleteContact={handleDeleteContact}
						onAddContact={() => {
							setEditingContact(null);
							resetContactForm();
							setIsContactDialogOpen(true);
						}}
					/>
				</TabsContent>

				<TabsContent value="reminders">
					<RemindersTab
						reminders={reminders}
						handleCompleteReminder={handleCompleteReminder}
						handleSnoozeReminder={handleSnoozeReminder}
					/>
				</TabsContent>

				<TabsContent value="events">
					<EventsTab
						events={events}
						handleToggleEventAttendance={handleToggleEventAttendance}
						onAddEvent={() => {
							resetEventForm();
							setIsEventDialogOpen(true);
						}}
					/>
				</TabsContent>

				<TabsContent value="templates">
					<TemplatesTab
						templates={templates}
						copyTemplateToClipboard={copyTemplateToClipboard}
						onViewTemplate={(template) => {
							setSelectedTemplate(template);
							setIsTemplateDialogOpen(true);
						}}
					/>
				</TabsContent>
			</Tabs>

			<ContactDialog
				open={isContactDialogOpen}
				onOpenChange={setIsContactDialogOpen}
				editingContact={editingContact}
				contactForm={contactForm}
				setContactForm={setContactForm}
				handleSaveContact={handleSaveContact}
			/>

			<ContactDetailDialog
				open={isContactDetailOpen}
				onOpenChange={setIsContactDetailOpen}
				selectedContact={selectedContact}
				getContactInteractions={getContactInteractions}
				getContactReminders={getContactReminders}
				handleCompleteReminder={handleCompleteReminder}
				handleDeleteContact={handleDeleteContact}
				onEditContact={(contact) => {
					openEditContact(contact);
					setIsContactDetailOpen(false);
				}}
				onLogInteraction={() => setIsInteractionDialogOpen(true)}
				onAddReminder={() => setIsReminderDialogOpen(true)}
			/>

			<InteractionDialog
				open={isInteractionDialogOpen}
				onOpenChange={setIsInteractionDialogOpen}
				interactionForm={interactionForm}
				setInteractionForm={setInteractionForm}
				handleAddInteraction={handleAddInteraction}
			/>

			<ReminderDialog
				open={isReminderDialogOpen}
				onOpenChange={setIsReminderDialogOpen}
				reminderForm={reminderForm}
				setReminderForm={setReminderForm}
				handleAddReminder={handleAddReminder}
			/>

			<EventDialog
				open={isEventDialogOpen}
				onOpenChange={setIsEventDialogOpen}
				eventForm={eventForm}
				setEventForm={setEventForm}
				handleSaveEvent={handleSaveEvent}
			/>

			<TemplatePreviewDialog
				open={isTemplateDialogOpen}
				onOpenChange={setIsTemplateDialogOpen}
				selectedTemplate={selectedTemplate}
				copyTemplateToClipboard={copyTemplateToClipboard}
			/>

			<ImportExportDialog
				open={isImportExportDialogOpen}
				onOpenChange={setIsImportExportDialogOpen}
				handleExportContacts={handleExportContacts}
				handleExportCSV={handleExportCSV}
				onImportContacts={handleImportContacts}
			/>
		</>
	);
}
