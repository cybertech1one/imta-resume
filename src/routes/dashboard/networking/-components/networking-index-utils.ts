import type { DbContact, DbEvent, DbFollowUp, DbStats, NetworkingStats } from "./networking-index-types";
import type {
	ConnectionStrength,
	Contact,
	ContactCategory,
	EmailTemplate,
	EventType,
	Interaction,
	NetworkingEvent,
	Reminder,
	ReminderStatus,
} from "./networking-types";

export function transformDbContacts(dbContacts: DbContact[] | undefined): Contact[] {
	if (!dbContacts || dbContacts.length === 0) return [];
	return dbContacts.map((c) => {
		const nameParts = (c.name || "").split(" ");
		const firstName = nameParts[0] || "";
		const lastName = nameParts.slice(1).join(" ") || "";
		return {
			id: c.id,
			firstName,
			lastName,
			email: c.email || "",
			phone: c.phone || undefined,
			company: c.company || "",
			jobTitle: c.position || "",
			category: (c.relationship as ContactCategory) || "other",
			linkedinUrl: c.linkedinUrl || undefined,
			location: undefined,
			connectionStrength: (c.relationshipStrength as ConnectionStrength) || "new",
			tags: (c.tags as string[]) || [],
			notes: c.notes || "",
			createdAt: c.createdAt ? new Date(c.createdAt).toISOString().split("T")[0] : "",
			lastContactedAt: c.lastContactedAt ? new Date(c.lastContactedAt).toISOString().split("T")[0] : undefined,
			isFavorite: c.isFavorite || false,
		};
	});
}

export function transformDbEvents(dbEvents: DbEvent[] | undefined): NetworkingEvent[] {
	if (!dbEvents || dbEvents.length === 0) return [];
	return dbEvents.map((e) => ({
		id: e.id,
		name: e.title || "",
		type: (e.type as EventType) || "other",
		date: e.date || "",
		location: e.location || "",
		description: e.description || "",
		link: e.link || undefined,
		contactsMet: [],
		notes: e.notes || "",
		isAttending: e.rsvpStatus === "going",
	}));
}

export function transformDbFollowUps(dbFollowUps: DbFollowUp[] | undefined): Reminder[] {
	if (!dbFollowUps || dbFollowUps.length === 0) return [];
	return dbFollowUps.map((c) => {
		const nameParts = (c.name || "").split(" ");
		return {
			id: `rem-${c.id}`,
			contactId: c.id,
			contactName: c.name || "",
			title: `Follow up with ${nameParts[0] || "contact"}`,
			description: c.notes || "",
			dueDate: c.nextFollowUpAt ? new Date(c.nextFollowUpAt).toISOString().split("T")[0] : "",
			status: "pending" as ReminderStatus,
		};
	});
}

export function filterContacts(
	contacts: Contact[],
	searchQuery: string,
	categoryFilter: string,
	strengthFilter: string,
	showFavoritesOnly: boolean,
): Contact[] {
	return contacts.filter((contact) => {
		const matchesSearch =
			searchQuery === "" ||
			`${contact.firstName} ${contact.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
			contact.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
			contact.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
			contact.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));

		const matchesCategory = categoryFilter === "all" || contact.category === categoryFilter;
		const matchesStrength = strengthFilter === "all" || contact.connectionStrength === strengthFilter;
		const matchesFavorites = !showFavoritesOnly || contact.isFavorite;

		return matchesSearch && matchesCategory && matchesStrength && matchesFavorites;
	});
}

export function computeStats(
	contacts: Contact[],
	reminders: Reminder[],
	events: NetworkingEvent[],
	interactions: Interaction[],
	dbStats: DbStats | undefined,
): NetworkingStats {
	const totalContacts = dbStats?.total ?? contacts.length;
	const strongConnections =
		dbStats?.byStrength?.strong ?? contacts.filter((c) => c.connectionStrength === "strong").length;
	const pendingReminders = dbStats?.needsFollowUp ?? reminders.filter((r) => r.status === "pending").length;
	const upcomingEvents = events.filter((e) => e.isAttending && new Date(e.date) > new Date()).length;
	const recentInteractions =
		dbStats?.recentInteractions ??
		interactions.filter((i) => {
			const interactionDate = new Date(i.date);
			const weekAgo = new Date();
			weekAgo.setDate(weekAgo.getDate() - 7);
			return interactionDate >= weekAgo;
		}).length;

	return { totalContacts, strongConnections, pendingReminders, upcomingEvents, recentInteractions };
}

export function getInteractionsForContact(interactions: Interaction[], contactId: string): Interaction[] {
	return interactions
		.filter((i) => i.contactId === contactId)
		.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getRemindersForContact(reminders: Reminder[], contactId: string): Reminder[] {
	return reminders.filter((r) => r.contactId === contactId && r.status === "pending");
}

export function exportContactsAsJson(contacts: Contact[]): void {
	const dataStr = JSON.stringify(contacts, null, 2);
	const blob = new Blob([dataStr], { type: "application/json" });
	const url = URL.createObjectURL(blob);
	const link = document.createElement("a");
	link.href = url;
	link.download = "networking-contacts.json";
	link.click();
	URL.revokeObjectURL(url);
}

export function exportContactsAsCsv(contacts: Contact[]): void {
	const headers = [
		"First Name",
		"Last Name",
		"Email",
		"Phone",
		"Company",
		"Job Title",
		"Category",
		"LinkedIn URL",
		"Location",
		"Tags",
		"Notes",
	];
	const csvContent = [
		headers.join(","),
		...contacts.map((c) =>
			[
				c.firstName,
				c.lastName,
				c.email,
				c.phone || "",
				c.company,
				c.jobTitle,
				c.category,
				c.linkedinUrl || "",
				c.location || "",
				c.tags.join(";"),
				`"${c.notes.replace(/"/g, '""')}"`,
			].join(","),
		),
	].join("\n");

	const blob = new Blob([csvContent], { type: "text/csv" });
	const url = URL.createObjectURL(blob);
	const link = document.createElement("a");
	link.href = url;
	link.download = "networking-contacts.csv";
	link.click();
	URL.revokeObjectURL(url);
}

export function copyTemplateToClipboard(template: EmailTemplate): void {
	const text = `Subject: ${template.subject}\n\n${template.body}`;
	navigator.clipboard.writeText(text);
}

export function buildContactMutationData(contactForm: Partial<Contact>) {
	const name = `${contactForm.firstName || ""} ${contactForm.lastName || ""}`.trim();
	return {
		name,
		email: contactForm.email || "",
		phone: contactForm.phone || undefined,
		company: contactForm.company || undefined,
		position: contactForm.jobTitle || undefined,
		linkedinUrl: contactForm.linkedinUrl || undefined,
		relationship:
			(contactForm.category as
				| "colleague"
				| "mentor"
				| "recruiter"
				| "hiring_manager"
				| "industry_peer"
				| "alumni"
				| "referral"
				| "other") || "other",
		relationshipStrength: (contactForm.connectionStrength === "new" ? "weak" : contactForm.connectionStrength) as
			| "strong"
			| "moderate"
			| "weak"
			| "dormant"
			| undefined,
		notes: contactForm.notes || undefined,
		tags: contactForm.tags || undefined,
		isFavorite: contactForm.isFavorite || false,
	};
}

export function buildImportContactData(c: Contact) {
	return {
		name: `${c.firstName || ""} ${c.lastName || ""}`.trim(),
		email: c.email || "",
		phone: c.phone || undefined,
		company: c.company || undefined,
		position: c.jobTitle || undefined,
		relationship:
			(c.category as
				| "colleague"
				| "mentor"
				| "recruiter"
				| "hiring_manager"
				| "industry_peer"
				| "alumni"
				| "referral"
				| "other") || "other",
		tags: c.tags || undefined,
		notes: c.notes || undefined,
	};
}
