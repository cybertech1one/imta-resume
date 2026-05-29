import type { MessageDescriptor } from "@lingui/core";
import type { Icon } from "@phosphor-icons/react";

// Template and tone type aliases
export type TemplateType = "formal" | "creative" | "tech-focused" | "executive";
export type ToneType = "professional" | "friendly" | "confident" | "enthusiastic";
export type SectionType = "intro" | "body" | "closing";

export interface JobDetails {
	company: string;
	position: string;
	description: string;
}

export interface CoverLetterData {
	intro: string;
	body: string;
	closing: string;
	keywords: string[];
}

export interface KeywordMatch {
	keyword: string;
	count: number;
	category: string;
}

// Database cover letter type
export interface DbCoverLetter {
	id: string;
	userId: string;
	name: string;
	companyName: string | null;
	position: string | null;
	template: string | null;
	tone: string | null;
	content: string;
	tags: string[] | null;
	createdAt: Date;
	updatedAt: Date;
}

// Template configuration shape
export interface TemplateConfig {
	label: MessageDescriptor;
	icon: Icon;
	description: MessageDescriptor;
	color: string;
	gradient: string;
}

// Tone configuration shape
export interface ToneConfig {
	label: MessageDescriptor;
	icon: Icon;
	description: MessageDescriptor;
}
