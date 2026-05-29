import type { Icon } from "@phosphor-icons/react";

export type PitchLength = "30s" | "60s" | "2min";
export type Industry = "technology" | "finance" | "healthcare" | "marketing" | "consulting" | "education" | "general";
export type ContextType = "interview" | "networking" | "cold-outreach";

export interface PitchStep {
	id: string;
	title: string;
	description: string;
	placeholder: string;
	tip: string;
	icon: Icon;
}

export interface SavedPitch {
	id: string;
	name: string;
	content: string;
	length: PitchLength;
	context: ContextType;
	industry: Industry;
	createdAt: Date;
	wordCount: number;
	estimatedTime: number;
}

export interface IndustryTemplate {
	industry: Industry;
	label: string;
	icon: Icon;
	color: string;
	templates: Record<PitchLength, string>;
}

export interface DeliveryTip {
	id: string;
	title: string;
	description: string;
	icon: Icon;
	category: "vocal" | "body" | "content" | "mental";
}

export interface ExamplePitch {
	id: string;
	title: string;
	context: ContextType;
	industry: Industry;
	length: PitchLength;
	content: string;
	highlights: string[];
}
