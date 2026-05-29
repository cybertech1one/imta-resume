import {
	ArrowDownIcon,
	ArrowRightIcon,
	BriefcaseIcon,
	CalendarIcon,
	ChalkboardTeacherIcon,
	ClockIcon,
	EnvelopeIcon,
	HandshakeIcon,
	LinkedinLogoIcon,
	NotePencilIcon,
	PhoneIcon,
	PlusIcon,
	StarIcon,
	TrendUpIcon,
	UserCircleIcon,
	UserPlusIcon,
	UsersIcon,
} from "@phosphor-icons/react";

import type {
	ConnectionStrength,
	ContactCategory,
	EmailTemplate,
	EventType,
	InteractionType,
} from "./networking-types";

// Category configurations
export const categoryConfig: Record<ContactCategory, { label: string; icon: typeof UsersIcon; color: string }> = {
	recruiter: {
		label: "Recruiter",
		icon: UserCircleIcon,
		color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
	},
	hiring_manager: {
		label: "Hiring Manager",
		icon: BriefcaseIcon,
		color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
	},
	colleague: {
		label: "Colleague",
		icon: UsersIcon,
		color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
	},
	mentor: {
		label: "Mentor",
		icon: ChalkboardTeacherIcon,
		color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
	},
	industry_peer: {
		label: "Industry Peer",
		icon: HandshakeIcon,
		color: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400",
	},
	alumni: {
		label: "Alumni",
		icon: StarIcon,
		color: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400",
	},
	referral: {
		label: "Referral",
		icon: UserPlusIcon,
		color: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400",
	},
	other: {
		label: "Other",
		icon: UserPlusIcon,
		color: "bg-gray-100 text-gray-700 dark:bg-gray-800/30 dark:text-gray-400",
	},
};

export const strengthConfig: Record<ConnectionStrength, { label: string; color: string; icon: typeof TrendUpIcon }> = {
	strong: {
		label: "Strong",
		color: "bg-green-500",
		icon: TrendUpIcon,
	},
	moderate: {
		label: "Moderate",
		color: "bg-blue-500",
		icon: ArrowRightIcon,
	},
	weak: {
		label: "Weak",
		color: "bg-amber-500",
		icon: ArrowDownIcon,
	},
	new: {
		label: "New",
		color: "bg-gray-400",
		icon: PlusIcon,
	},
	dormant: {
		label: "Dormant",
		color: "bg-gray-300",
		icon: ClockIcon,
	},
};

export const interactionTypeConfig: Record<InteractionType, { label: string; icon: typeof EnvelopeIcon }> = {
	email: { label: "Email", icon: EnvelopeIcon },
	call: { label: "Phone Call", icon: PhoneIcon },
	meeting: { label: "Meeting", icon: UsersIcon },
	linkedin: { label: "LinkedIn", icon: LinkedinLogoIcon },
	event: { label: "Event", icon: CalendarIcon },
	other: { label: "Other", icon: NotePencilIcon },
};

export const eventTypeConfig: Record<EventType, { label: string; color: string }> = {
	conference: {
		label: "Conference",
		color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
	},
	meetup: { label: "Meetup", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
	workshop: { label: "Workshop", color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
	networking: { label: "Networking", color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
	career_fair: { label: "Career Fair", color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
	other: { label: "Other", color: "bg-gray-100 text-gray-700 dark:bg-gray-800/30 dark:text-gray-400" },
};

export const templateCategoryConfig: Record<EmailTemplate["category"], { label: string; color: string }> = {
	introduction: { label: "Introduction", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
	follow_up: { label: "Follow Up", color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
	thank_you: { label: "Thank You", color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400" },
	referral: {
		label: "Referral Request",
		color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
	},
	reconnect: { label: "Reconnect", color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
};
