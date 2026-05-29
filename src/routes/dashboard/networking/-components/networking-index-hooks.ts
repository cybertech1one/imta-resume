import { t } from "@lingui/core/macro";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { toast } from "sonner";
import { orpc } from "@/integrations/orpc/client";
import { buildContactMutationData, buildImportContactData } from "./networking-index-utils";
import type { Contact, Interaction, InteractionType, NetworkingEvent, Reminder } from "./networking-types";

interface UseNetworkingMutationsArgs {
	contactForm: Partial<Contact>;
	interactionForm: Partial<Interaction>;
	reminderForm: Partial<Reminder>;
	eventForm: Partial<NetworkingEvent>;
	editingContact: Contact | null;
	selectedContact: Contact | null;
	events: NetworkingEvent[];
	setIsContactDialogOpen: (open: boolean) => void;
	setIsInteractionDialogOpen: (open: boolean) => void;
	setIsReminderDialogOpen: (open: boolean) => void;
	setIsEventDialogOpen: (open: boolean) => void;
	setIsContactDetailOpen: (open: boolean) => void;
	setEditingContact: (contact: Contact | null) => void;
	setSelectedContact: (contact: Contact | null) => void;
	setContactForm: (form: Partial<Contact>) => void;
	setLocalInteractions: React.Dispatch<React.SetStateAction<Interaction[]>>;
	resetContactForm: () => void;
	resetInteractionForm: () => void;
	resetReminderForm: () => void;
	resetEventForm: () => void;
}

export function useNetworkingMutations({
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
}: UseNetworkingMutationsArgs) {
	const queryClient = useQueryClient();

	const invalidateNetworking = useCallback(() => {
		queryClient.invalidateQueries({ queryKey: orpc.networking.list.key() });
		queryClient.invalidateQueries({ queryKey: orpc.networking.getStatistics.key() });
		queryClient.invalidateQueries({ queryKey: orpc.networking.getFollowUpReminders.key() });
	}, [queryClient]);

	const createContactMutation = useMutation({
		...orpc.networking.create.mutationOptions(),
		onSuccess: () => {
			invalidateNetworking();
			toast.success(t`Contact added`);
		},
		onError: () => toast.error(t`Failed to add contact`),
	});

	const updateContactMutation = useMutation({
		...orpc.networking.update.mutationOptions(),
		onSuccess: () => {
			invalidateNetworking();
			toast.success(t`Contact updated`);
		},
		onError: () => toast.error(t`Failed to update contact`),
	});

	const deleteContactMutation = useMutation({
		...orpc.networking.delete.mutationOptions(),
		onSuccess: () => {
			invalidateNetworking();
			toast.success(t`Contact deleted`);
		},
		onError: () => toast.error(t`Failed to delete contact`),
	});

	const toggleFavoriteMutation = useMutation({
		...orpc.networking.toggleFavorite.mutationOptions(),
		onSuccess: () => {
			invalidateNetworking();
		},
		onError: () => toast.error(t`Failed to update favorite status. Please try again.`),
	});

	const addInteractionMutation = useMutation({
		...orpc.networking.interactions.add.mutationOptions(),
		onSuccess: () => {
			invalidateNetworking();
			toast.success(t`Interaction added`);
		},
		onError: () => toast.error(t`Failed to add interaction`),
	});

	const createEventMutation = useMutation({
		...orpc.networkingEvents.create.mutationOptions(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: orpc.networkingEvents.list.key() });
			toast.success(t`Event added`);
		},
		onError: () => toast.error(t`Failed to add event`),
	});

	const updateRsvpMutation = useMutation({
		...orpc.networkingEvents.updateRsvp.mutationOptions(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: orpc.networkingEvents.list.key() });
		},
		onError: () => toast.error(t`Failed to update event attendance. Please try again.`),
	});

	const handleSaveContact = () => {
		const contactData = buildContactMutationData(contactForm);
		if (editingContact) {
			updateContactMutation.mutate({ id: editingContact.id, ...contactData });
		} else {
			createContactMutation.mutate(contactData);
		}
		setIsContactDialogOpen(false);
		setEditingContact(null);
		resetContactForm();
	};

	const handleDeleteContact = (contactId: string) => {
		deleteContactMutation.mutate({ id: contactId });
		setIsContactDetailOpen(false);
		setSelectedContact(null);
	};

	const handleToggleFavorite = (contactId: string) => {
		toggleFavoriteMutation.mutate({ id: contactId });
	};

	const handleAddInteraction = () => {
		if (!selectedContact) return;

		addInteractionMutation.mutate({
			contactId: selectedContact.id,
			interactionType: interactionForm.type || "other",
			description: interactionForm.notes || undefined,
			followUpNeeded: interactionForm.followUpNeeded || false,
			interactedAt: interactionForm.date ? new Date(interactionForm.date) : new Date(),
		});

		const newInteraction: Interaction = {
			id: `int-${Date.now()}`,
			contactId: selectedContact.id,
			type: (interactionForm.type as InteractionType) || "other",
			date: interactionForm.date || new Date().toISOString().split("T")[0],
			notes: interactionForm.notes || "",
			followUpNeeded: interactionForm.followUpNeeded || false,
		};
		setLocalInteractions((prev) => [...prev, newInteraction]);

		setIsInteractionDialogOpen(false);
		resetInteractionForm();
	};

	const handleAddReminder = () => {
		if (!selectedContact) return;
		const followUpDate = reminderForm.dueDate ? new Date(reminderForm.dueDate) : undefined;
		if (followUpDate) {
			updateContactMutation.mutate({
				id: selectedContact.id,
				nextFollowUpAt: followUpDate,
				notes: `${selectedContact.notes ? `${selectedContact.notes}\n` : ""}Follow-up: ${reminderForm.title || ""} - ${reminderForm.description || ""}`,
			});
		}
		setIsReminderDialogOpen(false);
		resetReminderForm();
	};

	const handleCompleteReminder = (reminderId: string) => {
		const contactId = reminderId.replace("rem-", "");
		updateContactMutation.mutate({ id: contactId, nextFollowUpAt: undefined });
	};

	const handleSnoozeReminder = (reminderId: string) => {
		const contactId = reminderId.replace("rem-", "");
		const newDate = new Date();
		newDate.setDate(newDate.getDate() + 3);
		updateContactMutation.mutate({ id: contactId, nextFollowUpAt: newDate });
	};

	const handleSaveEvent = () => {
		createEventMutation.mutate({
			title: eventForm.name || "",
			type: (eventForm.type as "conference" | "meetup" | "webinar" | "networking") || "networking",
			date: eventForm.date || new Date().toISOString().split("T")[0],
			startTime: "09:00",
			endTime: "17:00",
			location: eventForm.location || "",
			description: eventForm.description || undefined,
			rsvpStatus: eventForm.isAttending ? "going" : "not_going",
			notes: eventForm.notes || undefined,
			link: eventForm.link || undefined,
		});
		setIsEventDialogOpen(false);
		resetEventForm();
	};

	const handleToggleEventAttendance = (eventId: string) => {
		const event = events.find((e) => e.id === eventId);
		if (!event) return;
		updateRsvpMutation.mutate({
			id: eventId,
			rsvpStatus: event.isAttending ? "not_going" : "going",
		});
	};

	const openEditContact = (contact: Contact) => {
		setEditingContact(contact);
		setContactForm({
			firstName: contact.firstName,
			lastName: contact.lastName,
			email: contact.email,
			phone: contact.phone,
			company: contact.company,
			jobTitle: contact.jobTitle,
			category: contact.category,
			linkedinUrl: contact.linkedinUrl,
			location: contact.location,
			connectionStrength: contact.connectionStrength,
			tags: contact.tags,
			notes: contact.notes,
			isFavorite: contact.isFavorite,
		});
		setIsContactDialogOpen(true);
	};

	const openContactDetail = (contact: Contact) => {
		setSelectedContact(contact);
		setIsContactDetailOpen(true);
	};

	const handleImportContacts = (imported: Contact[]) => {
		try {
			for (const c of imported) {
				createContactMutation.mutate(buildImportContactData(c));
			}
			toast.success(t`Contacts imported`);
		} catch {
			toast.error(t`Failed to parse JSON`);
		}
	};

	return {
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
	};
}
