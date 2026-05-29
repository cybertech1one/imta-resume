export type ProjectType = "web" | "mobile" | "design" | "backend" | "fullstack" | "data" | "devops";
export type ProjectStatus = "completed" | "in-progress" | "archived";
export type TechCategory = "frontend" | "backend" | "database" | "cloud" | "design" | "other";
export type LinkType = "live" | "github" | "demo" | "documentation" | "figma" | "video";

export interface ProjectTechnology {
	name: string;
	category: TechCategory;
}

export interface ProjectLink {
	type: LinkType;
	url: string;
	label: string;
}

export interface BeforeAfterImage {
	before: string;
	after: string;
	label: string;
}

export interface ProjectMetric {
	label: string;
	value: string;
	change?: string;
}

export interface Project {
	id: string;
	userId: string;
	title: string;
	description: string;
	longDescription: string;
	role: string;
	type: ProjectType;
	status: ProjectStatus;
	technologies: ProjectTechnology[];
	skills: string[];
	images: string[];
	thumbnail: string | null;
	links: ProjectLink[];
	featured: boolean;
	startDate: string | null;
	endDate: string | null;
	teamSize: number | null;
	client: string | null;
	industry: string | null;
	metrics: ProjectMetric[] | null;
	beforeAfter: BeforeAfterImage[] | null;
	createdAt: Date;
	updatedAt: Date;
}

export interface CaseStudyTimeline {
	phase: string;
	duration: string;
	description: string;
}

export interface CaseStudy {
	id: string;
	userId: string;
	projectId: string;
	title: string;
	overview: string;
	challenge: string;
	approach: string;
	solution: string;
	results: string;
	learnings: string;
	timeline: CaseStudyTimeline[];
	keyFeatures: string[];
	createdAt: Date;
	updatedAt: Date;
}

export interface SkillFilter {
	name: string;
	count: number;
	category: string;
}
