import type { Icon } from "@phosphor-icons/react";

export interface FAQItem {
	question: string;
	answer: string;
}

export interface FAQCategory {
	id: string;
	title: string;
	icon: Icon;
	color: string;
	items: FAQItem[];
}

export interface QuickHelpCard {
	id: string;
	title: string;
	description: string;
	icon: Icon;
	color: string;
	link: string;
}

export interface VideoTutorial {
	id: string;
	title: string;
	duration: string;
	thumbnail: string;
	category: string;
	url: string;
	description: string;
	gradient: string;
}
