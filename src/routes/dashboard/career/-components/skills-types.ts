import type { Icon } from "@phosphor-icons/react";

export type SkillCategory = "technical" | "soft" | "languages" | "certifications";

export interface DbSkill {
	id: string;
	userId: string;
	name: string;
	nameFr: string;
	category: SkillCategory;
	rating: number;
	targetRating: number;
	progress: { date: string; rating: number }[];
	createdAt: Date;
	updatedAt: Date;
}

export interface CareerPath {
	id: string;
	name: string;
	nameFr: string;
	field: "healthcare" | "industrial" | "hse";
	requiredSkills: RequiredSkill[];
	icon: Icon;
}

export interface RequiredSkill {
	name: string;
	nameFr: string;
	category: SkillCategory;
	minimumRating: number;
}
