import type React from "react";

export type StyleCategory = "professional" | "creative" | "modern" | "classic" | "tech" | "executive";
export type IndustryCategory =
	| "technology"
	| "finance"
	| "healthcare"
	| "education"
	| "marketing"
	| "engineering"
	| "legal"
	| "general";
export type ExperienceLevel = "entry" | "mid" | "senior" | "executive";

export interface ResumeTemplate {
	id: string;
	name: string;
	description: string;
	style: StyleCategory;
	industries: IndustryCategory[];
	experienceLevel: ExperienceLevel[];
	previewImage: string;
	rating: number;
	reviewCount: number;
	downloadCount: number;
	isTrending: boolean;
	isNew: boolean;
	isPremium: boolean;
	colors: string[];
	features: string[];
	tags: string[];
}

export interface TemplateReview {
	id: string;
	templateId: string;
	userName: string;
	userAvatar?: string;
	rating: number;
	comment: string;
	date: string;
	helpful: number;
}

export interface TemplateCardProps {
	template: ResumeTemplate;
	index: number;
	isFavorite: boolean;
	isInCompare: boolean;
	onPreview: () => void;
	onUse: () => void;
	onToggleFavorite: () => void;
	onAddToCompare: () => void;
	renderStars: (rating: number, size?: "sm" | "md") => React.ReactElement;
	showTrendingBadge?: boolean;
}
