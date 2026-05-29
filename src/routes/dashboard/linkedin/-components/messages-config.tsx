import {
	ChatCircleDotsIcon,
	HandshakeIcon,
	HeartIcon,
	PaperPlaneRightIcon,
	StarIcon,
	UserPlusIcon,
	UsersIcon,
} from "@phosphor-icons/react";

import type { MessageFormality, MessageType } from "./messages-types";

export const MESSAGE_TYPES: { value: MessageType; label: string; icon: React.ReactNode; description: string }[] = [
	{
		value: "connection_request",
		label: "Connection Request",
		icon: <UserPlusIcon className="size-5" />,
		description: "Invite someone to join your network",
	},
	{
		value: "follow_up",
		label: "Follow-up",
		icon: <PaperPlaneRightIcon className="size-5" />,
		description: "Follow up after a meeting or interview",
	},
	{
		value: "informational_interview",
		label: "Informational Interview",
		icon: <ChatCircleDotsIcon className="size-5" />,
		description: "Ask for advice about a career path or industry",
	},
	{
		value: "thank_you",
		label: "Thank You",
		icon: <HeartIcon className="size-5" />,
		description: "Thank someone for their help or recommendation",
	},
	{
		value: "referral_request",
		label: "Referral Request",
		icon: <HandshakeIcon className="size-5" />,
		description: "Ask for an introduction or reference",
	},
	{
		value: "congratulations",
		label: "Congratulations",
		icon: <StarIcon className="size-5" />,
		description: "Congratulate on a promotion or achievement",
	},
	{
		value: "introduction",
		label: "Introduction",
		icon: <UsersIcon className="size-5" />,
		description: "Introduce yourself to a new contact",
	},
];

export const FORMALITY_OPTIONS: { value: MessageFormality; label: string; description: string }[] = [
	{ value: "formal", label: "Formal", description: "Professional and respectful tone" },
	{ value: "semi_formal", label: "Semi-formal", description: "Professional but approachable" },
	{ value: "casual", label: "Casual", description: "Friendly and conversational tone" },
];

export const LANGUAGES = [
	{ value: "fr", label: "French" },
	{ value: "en", label: "English" },
	{ value: "ar", label: "العربية" },
];
