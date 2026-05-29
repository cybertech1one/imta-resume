import type { Icon } from "@phosphor-icons/react";

export type TemplateCategory = "linkedin" | "email" | "follow_up" | "thank_you";

export interface PersonalizationField {
	key: string;
	label: string;
	placeholder: string;
	example: string;
}

export interface MessageTemplate {
	id: string;
	name: string;
	category: TemplateCategory;
	subject?: string;
	body: string;
	personalizationFields: PersonalizationField[];
	tags: string[];
	isFavorite: boolean;
	usageCount: number;
	createdAt: string;
	isCustom: boolean;
}

export interface EffectiveMessageTip {
	id: string;
	title: string;
	description: string;
	category: TemplateCategory | "general";
	icon: Icon;
}
