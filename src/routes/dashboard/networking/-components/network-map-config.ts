import type { Icon } from "@phosphor-icons/react";
import {
	BriefcaseIcon,
	CalendarIcon,
	ChalkboardTeacherIcon,
	EnvelopeIcon,
	HandshakeIcon,
	HeartIcon,
	InfoIcon,
	LinkedinLogoIcon,
	ShareNetworkIcon,
	StarIcon,
	UserCircleIcon,
	UserPlusIcon,
	UsersIcon,
} from "@phosphor-icons/react";

import type { ConnectionCategory, InteractionType, RelationshipStrength } from "./network-map-types";

export const categoryConfig: Record<
	ConnectionCategory,
	{ label: string; icon: Icon; color: string; nodeColor: string }
> = {
	colleague: {
		label: "Colleague",
		icon: UsersIcon,
		color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
		nodeColor: "#3b82f6",
	},
	mentor: {
		label: "Mentor",
		icon: ChalkboardTeacherIcon,
		color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
		nodeColor: "#8b5cf6",
	},
	recruiter: {
		label: "Recruiter",
		icon: UserCircleIcon,
		color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
		nodeColor: "#22c55e",
	},
	hiring_manager: {
		label: "Hiring Manager",
		icon: BriefcaseIcon,
		color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
		nodeColor: "#f59e0b",
	},
	industry_peer: {
		label: "Industry Peer",
		icon: HandshakeIcon,
		color: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400",
		nodeColor: "#06b6d4",
	},
	alumni: {
		label: "Alumni",
		icon: StarIcon,
		color: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400",
		nodeColor: "#ec4899",
	},
	other: {
		label: "Other",
		icon: UserPlusIcon,
		color: "bg-gray-100 text-gray-700 dark:bg-gray-800/30 dark:text-gray-400",
		nodeColor: "#6b7280",
	},
};

export const strengthConfig: Record<
	RelationshipStrength,
	{ label: string; color: string; lineWidth: number; opacity: number }
> = {
	strong: { label: "Strong", color: "#22c55e", lineWidth: 4, opacity: 1 },
	moderate: { label: "Moderate", color: "#3b82f6", lineWidth: 2.5, opacity: 0.8 },
	weak: { label: "Weak", color: "#f59e0b", lineWidth: 1.5, opacity: 0.5 },
	dormant: { label: "Dormant", color: "#6b7280", lineWidth: 1, opacity: 0.3 },
};

export const interactionTypeConfig: Record<InteractionType, { label: string; icon: Icon; color: string }> = {
	email: { label: "Email", icon: EnvelopeIcon, color: "text-blue-500" },
	call: { label: "Phone Call", icon: HandshakeIcon, color: "text-green-500" },
	meeting: { label: "Meeting", icon: UsersIcon, color: "text-purple-500" },
	linkedin: { label: "LinkedIn", icon: LinkedinLogoIcon, color: "text-cyan-500" },
	event: { label: "Event", icon: CalendarIcon, color: "text-amber-500" },
	coffee: { label: "Coffee Chat", icon: HeartIcon, color: "text-pink-500" },
	referral: { label: "Referral", icon: ShareNetworkIcon, color: "text-indigo-500" },
	other: { label: "Other", icon: InfoIcon, color: "text-gray-500" },
};
