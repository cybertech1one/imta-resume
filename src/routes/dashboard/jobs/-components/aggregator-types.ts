export type JobSource = "linkedin" | "indeed" | "glassdoor";
export type ExperienceLevel = "entry" | "junior" | "mid" | "senior" | "lead";
export type WorkType = "onsite" | "remote" | "hybrid";
export type Industry = "healthcare" | "industrial" | "hse" | "tech" | "finance" | "general";
export type ApplicationStatus = "not_applied" | "applied" | "interview" | "offer" | "rejected";

export interface AggregatedJob {
	id: string;
	title: string;
	company: string;
	companyLogo?: string | null;
	location: string;
	workType: WorkType;
	industry: Industry;
	experienceLevel: ExperienceLevel;
	salaryMin?: number | null;
	salaryMax?: number | null;
	currency: string;
	postedDate: string;
	description: string;
	requirements: string[];
	skills: string[];
	benefits: string[];
	source: JobSource;
	sourceUrl: string;
	applicationStatus: ApplicationStatus;
	isSaved: boolean;
	matchScore?: number | null;
}

export interface SavedSearch {
	id: string;
	name: string;
	query: string;
	filters: SearchFilters;
	createdAt: Date;
	resultsCount: number;
}

export interface SearchFilters {
	sources: JobSource[];
	salaryMin: number;
	salaryMax: number;
	locations: string[];
	workTypes: WorkType[];
	experienceLevels: ExperienceLevel[];
	industries: Industry[];
}

export interface IndustryRecommendation {
	industry: Industry;
	platforms: { source: JobSource; strength: "high" | "medium" | "low"; description: string }[];
	tips: string[];
}
