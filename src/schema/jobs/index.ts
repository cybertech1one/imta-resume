import { z } from "zod";

// Job field schema
export const jobFieldSchema = z.enum(["healthcare", "industrial", "hse", "general"]);
export type JobField = z.infer<typeof jobFieldSchema>;

// Experience level schema
export const experienceLevelSchema = z.enum(["entry", "junior", "mid", "senior"]);
export type ExperienceLevel = z.infer<typeof experienceLevelSchema>;

// Application status schema
export const applicationStatusSchema = z.enum(["applied", "reviewing", "interview", "offer", "rejected", "withdrawn"]);
export type ApplicationStatus = z.infer<typeof applicationStatusSchema>;

// Contract type schema
export const contractTypeSchema = z.enum(["cdi", "cdd", "stage", "freelance", "alternance"]);
export type ContractType = z.infer<typeof contractTypeSchema>;

// Job listing schema
export const jobListingSchema = z.object({
	id: z.string(),
	title: z.string(),
	titleFr: z.string().optional(),
	company: z.string(),
	companyLogo: z.string().url().optional(),
	location: z.string(),
	region: z.string(),
	field: jobFieldSchema,
	experienceLevel: experienceLevelSchema,
	contractType: contractTypeSchema.optional(),
	salaryMin: z.number().optional(),
	salaryMax: z.number().optional(),
	currency: z.string().default("DH"),
	postedDate: z.string(),
	expiresDate: z.string().optional(),
	description: z.string(),
	descriptionFr: z.string().optional(),
	requirements: z.array(z.string()),
	skills: z.array(z.string()),
	benefits: z.array(z.string()).optional(),
	howToApply: z.string(),
	applyUrl: z.string().url().optional(),
	applyEmail: z.string().email().optional(),
	featured: z.boolean().default(false),
	urgent: z.boolean().default(false),
	remote: z.boolean().default(false),
	viewCount: z.number().default(0),
	applicationCount: z.number().default(0),
});
export type JobListing = z.infer<typeof jobListingSchema>;

// Employer schema
export const employerSchema = z.object({
	id: z.string(),
	name: z.string(),
	logo: z.string().url().optional(),
	industry: z.string(),
	industryFr: z.string().optional(),
	description: z.string(),
	descriptionFr: z.string().optional(),
	location: z.string(),
	headquarters: z.string(),
	website: z.string().url().optional(),
	linkedIn: z.string().url().optional(),
	employeeCount: z.string(),
	founded: z.number().optional(),
	fields: z.array(jobFieldSchema),
	openPositions: z.number().default(0),
	salaryRange: z
		.object({
			min: z.number(),
			max: z.number(),
			currency: z.string().default("DH"),
		})
		.optional(),
	benefits: z.array(z.string()).optional(),
	culture: z.array(z.string()).optional(),
	rating: z.number().min(0).max(5).optional(),
	reviewCount: z.number().default(0),
	featured: z.boolean().default(false),
	hiring: z.boolean().default(true),
});
export type Employer = z.infer<typeof employerSchema>;

// Job application schema
export const jobApplicationSchema = z.object({
	id: z.string(),
	userId: z.string().optional(),
	jobId: z.string(),
	jobTitle: z.string(),
	company: z.string(),
	location: z.string(),
	appliedDate: z.string(),
	status: applicationStatusSchema,
	notes: z.string().optional(),
	nextStep: z.string().optional(),
	nextStepDate: z.string().optional(),
	salary: z.string().optional(),
	contactPerson: z.string().optional(),
	contactEmail: z.string().email().optional(),
	resumeId: z.string().optional(),
	coverLetter: z.string().optional(),
	updatedAt: z.string().optional(),
});
export type JobApplication = z.infer<typeof jobApplicationSchema>;

// Market insight schema for jobs
export const jobMarketInsightSchema = z.object({
	id: z.string(),
	title: z.string(),
	titleFr: z.string().optional(),
	value: z.string(),
	change: z.string().optional(),
	trend: z.enum(["up", "down", "stable"]),
	description: z.string().optional(),
	descriptionFr: z.string().optional(),
	icon: z.string().optional(),
	field: jobFieldSchema.optional(),
	updatedAt: z.string().optional(),
});
export type JobMarketInsight = z.infer<typeof jobMarketInsightSchema>;

// Skill demand schema
export const skillDemandSchema = z.object({
	skill: z.string(),
	skillFr: z.string().optional(),
	demand: z.number().min(0).max(100),
	growth: z.number(),
	field: jobFieldSchema,
	category: z.string().optional(),
});
export type SkillDemand = z.infer<typeof skillDemandSchema>;

// Salary trend schema
export const salaryTrendSchema = z.object({
	position: z.string(),
	positionFr: z.string().optional(),
	field: jobFieldSchema,
	salaryMin: z.number(),
	salaryMax: z.number(),
	salaryMedian: z.number(),
	currency: z.string().default("DH"),
	changeFromLastYear: z.number(),
	region: z.string().optional(),
});
export type SalaryTrend = z.infer<typeof salaryTrendSchema>;

// Regional job data schema
export const regionalJobDataSchema = z.object({
	region: z.string(),
	jobs: z.number(),
	growth: z.number(),
	avgSalary: z.number(),
	currency: z.string().default("DH"),
	topField: jobFieldSchema,
	costOfLiving: z.number().optional(),
	jobAvailability: z.enum(["low", "medium", "high"]).optional(),
});
export type RegionalJobData = z.infer<typeof regionalJobDataSchema>;

// Input schemas for API endpoints
export const searchJobsInputSchema = z.object({
	query: z.string().optional(),
	field: jobFieldSchema.optional(),
	experienceLevel: experienceLevelSchema.optional(),
	region: z.string().optional(),
	contractType: contractTypeSchema.optional(),
	salaryMin: z.number().optional(),
	salaryMax: z.number().optional(),
	remote: z.boolean().optional(),
	featured: z.boolean().optional(),
	page: z.number().default(1),
	limit: z.number().default(20),
	sortBy: z.enum(["postedDate", "salary", "relevance"]).default("postedDate"),
	sortOrder: z.enum(["asc", "desc"]).default("desc"),
});
export type SearchJobsInput = z.infer<typeof searchJobsInputSchema>;

export const getEmployersInputSchema = z.object({
	query: z.string().optional(),
	industry: z.string().optional(),
	field: jobFieldSchema.optional(),
	hiring: z.boolean().optional(),
	featured: z.boolean().optional(),
	page: z.number().default(1),
	limit: z.number().default(20),
	sortBy: z.enum(["name", "openPositions", "rating"]).default("openPositions"),
	sortOrder: z.enum(["asc", "desc"]).default("desc"),
});
export type GetEmployersInput = z.infer<typeof getEmployersInputSchema>;

export const createApplicationInputSchema = z.object({
	jobId: z.string(),
	jobTitle: z.string(),
	company: z.string(),
	location: z.string(),
	notes: z.string().optional(),
	resumeId: z.string().optional(),
	coverLetter: z.string().optional(),
});
export type CreateApplicationInput = z.infer<typeof createApplicationInputSchema>;

export const updateApplicationInputSchema = z.object({
	id: z.string(),
	status: applicationStatusSchema.optional(),
	notes: z.string().optional(),
	nextStep: z.string().optional(),
	nextStepDate: z.string().optional(),
	salary: z.string().optional(),
	contactPerson: z.string().optional(),
	contactEmail: z.string().email().optional(),
});
export type UpdateApplicationInput = z.infer<typeof updateApplicationInputSchema>;

export const getMarketTrendsInputSchema = z.object({
	field: jobFieldSchema.optional(),
	region: z.string().optional(),
	language: z.enum(["fr", "en", "ar"]).default("fr"),
});
export type GetMarketTrendsInput = z.infer<typeof getMarketTrendsInputSchema>;

// Export all schemas as a group
export const jobSchemas = {
	jobField: jobFieldSchema,
	experienceLevel: experienceLevelSchema,
	applicationStatus: applicationStatusSchema,
	contractType: contractTypeSchema,
	jobListing: jobListingSchema,
	employer: employerSchema,
	jobApplication: jobApplicationSchema,
	jobMarketInsight: jobMarketInsightSchema,
	skillDemand: skillDemandSchema,
	salaryTrend: salaryTrendSchema,
	regionalJobData: regionalJobDataSchema,
};
