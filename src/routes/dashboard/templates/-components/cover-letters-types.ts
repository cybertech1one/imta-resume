import type { Icon } from "@phosphor-icons/react";

export type DomainCategory = "healthcare" | "industrial" | "hse" | "technology" | "management" | "general";
export type TypeCategory = "spontaneous" | "response" | "internship" | "first_job";

export interface CoverLetterTemplate {
	id: string;
	name: string;
	description: string;
	domain: DomainCategory;
	type: TypeCategory;
	icon: Icon;
	content: string;
	tags: string[];
}
