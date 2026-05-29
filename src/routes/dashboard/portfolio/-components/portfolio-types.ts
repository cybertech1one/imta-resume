import type { Icon } from "@phosphor-icons/react";

export interface Project {
	id: string;
	title: string;
	description: string;
	longDescription?: string;
	images: string[];
	thumbnail: string;
	tags: string[];
	links: {
		live?: string;
		github?: string;
		demo?: string;
		documentation?: string;
	};
	featured: boolean;
	category: string;
	date: string;
	status: "completed" | "in-progress" | "archived";
	metrics?: {
		views?: number;
		likes?: number;
		shares?: number;
	};
}

export interface CaseStudy {
	id: string;
	projectId: string;
	title: string;
	overview: string;
	challenge: string;
	solution: string;
	results: string;
	process: {
		step: number;
		title: string;
		description: string;
	}[];
	technologies: string[];
	duration: string;
	role: string;
	team?: string[];
}

export interface WorkSample {
	id: string;
	title: string;
	type: "image" | "document" | "video" | "code";
	url: string;
	thumbnail: string;
	description: string;
	tags: string[];
	uploadedAt: string;
}

export interface Certification {
	id: string;
	name: string;
	issuer: string;
	date: string;
	expiryDate?: string;
	credentialId?: string;
	credentialUrl?: string;
	icon: Icon;
	color: string;
}

export interface Testimonial {
	id: string;
	author: string;
	role: string;
	company: string;
	avatar?: string;
	content: string;
	rating: number;
	date: string;
	featured: boolean;
}

export interface PortfolioTheme {
	id: string;
	name: string;
	preview: string;
	colors: {
		primary: string;
		secondary: string;
		accent: string;
	};
	layout: "grid" | "masonry" | "list" | "cards";
}

export interface AnalyticsData {
	totalViews: number;
	uniqueVisitors: number;
	avgTimeOnPage: number;
	topProjects: { id: string; title: string; views: number }[];
	viewsOverTime: { date: string; views: number }[];
	referralSources: { source: string; count: number; percentage: number }[];
}
