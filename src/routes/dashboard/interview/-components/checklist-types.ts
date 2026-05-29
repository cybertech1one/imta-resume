import type { Icon } from "@phosphor-icons/react";

export type ChecklistItem = {
	id: string;
	title: string;
	description: string;
	tips?: string[];
	link?: {
		text: string;
		href: string;
	};
	icon: Icon;
};

export type DbChecklistItem = {
	id: string;
	category: string;
	title: string;
	titleFr: string | null;
	description: string | null;
	descriptionFr: string | null;
	tip: string | null;
	tipFr: string | null;
	link: string | null;
	linkLabel: string | null;
	icon: string | null;
	sortOrder: number | null;
	isActive: boolean;
};

export type InterviewReminder = {
	date: string;
	time: string;
	company?: string;
	notificationScheduled: boolean;
};
