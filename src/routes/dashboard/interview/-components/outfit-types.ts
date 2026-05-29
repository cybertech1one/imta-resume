import type { Icon } from "@phosphor-icons/react";

export type IndustryConfig = {
	id: string;
	label: string;
	icon: Icon;
	color: string;
	bgColor: string;
	description: string;
	formalityLevel: "formal" | "professional" | "casual" | "variable";
	dressCode: string;
	menOutfit: string[];
	womenOutfit: string[];
	colors: string[];
	avoid: string[];
	tips: string[];
};

export type SeasonConfig = {
	id: string;
	label: string;
	icon: Icon;
	color: string;
	tips: string[];
};

export type VirtualTip = {
	id: string;
	title: string;
	description: string;
	icon: Icon;
	tips: string[];
};

export type DoOrDont = {
	text: string;
	category: "general" | "men" | "women";
};

export type ChecklistItem = {
	id: string;
	title: string;
	description: string;
};

export type AccessoryCategory = {
	id: string;
	title: string;
	icon: Icon;
	items: string[];
};

export type CultureQuestion = {
	id: string;
	question: string;
	options: { value: string; label: string; formalityScore: number }[];
};
