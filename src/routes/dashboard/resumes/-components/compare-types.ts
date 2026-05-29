import type { RouterOutput } from "@/integrations/orpc/client";

export type Resume = RouterOutput["resume"]["list"][number];
export type ResumeWithData = RouterOutput["resume"]["getById"];

// Types for comparison data
export type ComparisonMetrics = {
	wordCount: number;
	sectionCounts: Record<string, number>;
	skills: string[];
	experienceCount: number;
	educationCount: number;
	projectCount: number;
	certificationCount: number;
	languageCount: number;
	atsScore: number;
	completenessScore: number;
};

export type DifferenceType = "added" | "removed" | "modified" | "unchanged";

export type SectionDifference = {
	section: string;
	type: DifferenceType;
	items: {
		content: string;
		type: DifferenceType;
	}[];
};

export type JobTypeRecommendation = {
	jobType: string;
	recommendedVersion: string;
	reason: string;
	matchScore: number;
	icon: React.ElementType;
};
