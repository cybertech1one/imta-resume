import type {
	ContactFormState,
	EventFormState,
	InteractionFormState,
	ReminderFormState,
} from "./networking-index-types";

export const INITIAL_CONTACT_FORM: ContactFormState = {
	firstName: "",
	lastName: "",
	email: "",
	phone: "",
	company: "",
	jobTitle: "",
	category: "other",
	linkedinUrl: "",
	location: "",
	connectionStrength: "new",
	tags: [],
	notes: "",
	isFavorite: false,
};

export const INITIAL_INTERACTION_FORM: InteractionFormState = {
	type: "email",
	date: new Date().toISOString().split("T")[0],
	notes: "",
	followUpNeeded: false,
};

export const INITIAL_REMINDER_FORM: ReminderFormState = {
	title: "",
	description: "",
	dueDate: "",
};

export const INITIAL_EVENT_FORM: EventFormState = {
	name: "",
	type: "networking",
	date: "",
	location: "",
	description: "",
	link: "",
	notes: "",
	isAttending: false,
};
