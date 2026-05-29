import z from "zod";
import type { JobAggregatorAppStatus, JobAggregatorSearchFilters } from "@/integrations/drizzle/schema";
import { protectedProcedure } from "../context";
import { jobAggregatorService } from "../services/job-aggregator";

// Zod schemas
const jobSourceSchema = z.enum(["linkedin", "indeed", "glassdoor"]);
const experienceLevelSchema = z.enum(["entry", "junior", "mid", "senior", "lead"]);
const workTypeSchema = z.enum(["onsite", "remote", "hybrid"]);
const industrySchema = z.enum(["healthcare", "industrial", "hse", "tech", "finance", "general"]);
const applicationStatusSchema = z.enum(["not_applied", "applied", "interview", "offer", "rejected"]);

const searchFiltersSchema = z.object({
	sources: z.array(jobSourceSchema),
	salaryMin: z.number(),
	salaryMax: z.number(),
	locations: z.array(z.string()),
	workTypes: z.array(workTypeSchema),
	experienceLevels: z.array(experienceLevelSchema),
	industries: z.array(industrySchema),
});

const aggregatedJobSchema = z.object({
	id: z.string().uuid(),
	userId: z.string(),
	title: z.string(),
	company: z.string(),
	companyLogo: z.string().nullable(),
	location: z.string(),
	workType: workTypeSchema,
	industry: industrySchema,
	experienceLevel: experienceLevelSchema,
	salaryMin: z.number().nullable(),
	salaryMax: z.number().nullable(),
	currency: z.string(),
	postedDate: z.string(),
	description: z.string(),
	requirements: z.array(z.string()),
	skills: z.array(z.string()),
	benefits: z.array(z.string()),
	source: jobSourceSchema,
	sourceUrl: z.string(),
	applicationStatus: applicationStatusSchema,
	isSaved: z.boolean(),
	matchScore: z.number().nullable(),
	createdAt: z.coerce.date(),
	updatedAt: z.coerce.date(),
});

const savedSearchSchema = z.object({
	id: z.string().uuid(),
	userId: z.string(),
	name: z.string(),
	query: z.string(),
	filters: searchFiltersSchema,
	resultsCount: z.number(),
	createdAt: z.coerce.date(),
	updatedAt: z.coerce.date(),
});

// Jobs sub-router
const jobsRouter = {
	create: protectedProcedure
		.route({
			method: "POST",
			path: "/job-aggregator/jobs",
			tags: ["Job Aggregator"],
			summary: "Create a new aggregated job",
		})
		.input(
			z.object({
				title: z.string().min(1).max(255),
				company: z.string().min(1).max(255),
				companyLogo: z.string().optional(),
				location: z.string().min(1).max(255),
				workType: workTypeSchema,
				industry: industrySchema,
				experienceLevel: experienceLevelSchema,
				salaryMin: z.number().optional(),
				salaryMax: z.number().optional(),
				currency: z.string().optional(),
				postedDate: z.string(),
				description: z.string().min(1),
				requirements: z.array(z.string()),
				skills: z.array(z.string()),
				benefits: z.array(z.string()),
				source: jobSourceSchema,
				sourceUrl: z.string().url(),
				matchScore: z.number().min(0).max(100).optional(),
			}),
		)
		.output(z.string())
		.handler(async ({ context, input }) => {
			return await jobAggregatorService.jobs.create({
				...input,
				userId: context.user.id,
			});
		}),

	getById: protectedProcedure
		.route({
			method: "GET",
			path: "/job-aggregator/jobs/{id}",
			tags: ["Job Aggregator"],
			summary: "Get job by ID",
		})
		.input(z.object({ id: z.string().uuid() }))
		.output(aggregatedJobSchema)
		.handler(async ({ context, input }) => {
			return await jobAggregatorService.jobs.getById({ id: input.id, userId: context.user.id });
		}),

	list: protectedProcedure
		.route({
			method: "GET",
			path: "/job-aggregator/jobs",
			tags: ["Job Aggregator"],
			summary: "List all aggregated jobs",
		})
		.input(
			z
				.object({
					search: z.string().optional(),
					sources: z.array(jobSourceSchema).optional(),
					salaryMin: z.number().optional(),
					salaryMax: z.number().optional(),
					locations: z.array(z.string()).optional(),
					workTypes: z.array(workTypeSchema).optional(),
					experienceLevels: z.array(experienceLevelSchema).optional(),
					industries: z.array(industrySchema).optional(),
					isSaved: z.boolean().optional(),
					applicationStatus: applicationStatusSchema.optional(),
					limit: z.number().optional(),
					offset: z.number().optional(),
				})
				.optional()
				.default({}),
		)
		.output(z.array(aggregatedJobSchema))
		.handler(async ({ context, input }) => {
			return await jobAggregatorService.jobs.list({
				userId: context.user.id,
				...input,
			});
		}),

	update: protectedProcedure
		.route({
			method: "PUT",
			path: "/job-aggregator/jobs/{id}",
			tags: ["Job Aggregator"],
			summary: "Update a job",
		})
		.input(
			z.object({
				id: z.string().uuid(),
				title: z.string().min(1).max(255).optional(),
				company: z.string().min(1).max(255).optional(),
				companyLogo: z.string().optional(),
				location: z.string().min(1).max(255).optional(),
				workType: workTypeSchema.optional(),
				industry: industrySchema.optional(),
				experienceLevel: experienceLevelSchema.optional(),
				salaryMin: z.number().optional(),
				salaryMax: z.number().optional(),
				currency: z.string().optional(),
				postedDate: z.string().optional(),
				description: z.string().min(1).optional(),
				requirements: z.array(z.string()).optional(),
				skills: z.array(z.string()).optional(),
				benefits: z.array(z.string()).optional(),
				source: jobSourceSchema.optional(),
				sourceUrl: z.string().url().optional(),
				applicationStatus: applicationStatusSchema.optional(),
				isSaved: z.boolean().optional(),
				matchScore: z.number().min(0).max(100).optional(),
			}),
		)
		.output(z.void())
		.handler(async ({ context, input }) => {
			return await jobAggregatorService.jobs.update({
				...input,
				userId: context.user.id,
			});
		}),

	toggleSaved: protectedProcedure
		.route({
			method: "POST",
			path: "/job-aggregator/jobs/{id}/toggle-saved",
			tags: ["Job Aggregator"],
			summary: "Toggle job saved status",
		})
		.input(z.object({ id: z.string().uuid() }))
		.output(z.boolean())
		.handler(async ({ context, input }) => {
			return await jobAggregatorService.jobs.toggleSaved({ id: input.id, userId: context.user.id });
		}),

	updateStatus: protectedProcedure
		.route({
			method: "POST",
			path: "/job-aggregator/jobs/{id}/status",
			tags: ["Job Aggregator"],
			summary: "Update job application status",
		})
		.input(
			z.object({
				id: z.string().uuid(),
				status: applicationStatusSchema,
			}),
		)
		.output(z.void())
		.handler(async ({ context, input }) => {
			return await jobAggregatorService.jobs.updateStatus({
				id: input.id,
				userId: context.user.id,
				status: input.status as JobAggregatorAppStatus,
			});
		}),

	delete: protectedProcedure
		.route({
			method: "DELETE",
			path: "/job-aggregator/jobs/{id}",
			tags: ["Job Aggregator"],
			summary: "Delete a job",
		})
		.input(z.object({ id: z.string().uuid() }))
		.output(z.void())
		.handler(async ({ context, input }) => {
			return await jobAggregatorService.jobs.delete({ id: input.id, userId: context.user.id });
		}),

	getStatistics: protectedProcedure
		.route({
			method: "GET",
			path: "/job-aggregator/jobs/statistics",
			tags: ["Job Aggregator"],
			summary: "Get job statistics",
		})
		.output(
			z.object({
				total: z.number(),
				saved: z.number(),
				applied: z.number(),
				bySource: z.object({
					linkedin: z.number(),
					indeed: z.number(),
					glassdoor: z.number(),
				}),
			}),
		)
		.handler(async ({ context }) => {
			return await jobAggregatorService.jobs.getStatistics({ userId: context.user.id });
		}),
};

// Saved searches sub-router
const savedSearchesRouter = {
	create: protectedProcedure
		.route({
			method: "POST",
			path: "/job-aggregator/saved-searches",
			tags: ["Job Aggregator"],
			summary: "Create a saved search",
		})
		.input(
			z.object({
				name: z.string().min(1).max(255),
				query: z.string(),
				filters: searchFiltersSchema,
				resultsCount: z.number(),
			}),
		)
		.output(z.string())
		.handler(async ({ context, input }) => {
			return await jobAggregatorService.savedSearches.create({
				...input,
				userId: context.user.id,
				filters: input.filters as JobAggregatorSearchFilters,
			});
		}),

	list: protectedProcedure
		.route({
			method: "GET",
			path: "/job-aggregator/saved-searches",
			tags: ["Job Aggregator"],
			summary: "List saved searches",
		})
		.output(z.array(savedSearchSchema))
		.handler(async ({ context }) => {
			return await jobAggregatorService.savedSearches.list({ userId: context.user.id });
		}),

	getById: protectedProcedure
		.route({
			method: "GET",
			path: "/job-aggregator/saved-searches/{id}",
			tags: ["Job Aggregator"],
			summary: "Get saved search by ID",
		})
		.input(z.object({ id: z.string().uuid() }))
		.output(savedSearchSchema)
		.handler(async ({ context, input }) => {
			return await jobAggregatorService.savedSearches.getById({ id: input.id, userId: context.user.id });
		}),

	update: protectedProcedure
		.route({
			method: "PUT",
			path: "/job-aggregator/saved-searches/{id}",
			tags: ["Job Aggregator"],
			summary: "Update a saved search",
		})
		.input(
			z.object({
				id: z.string().uuid(),
				name: z.string().min(1).max(255).optional(),
				query: z.string().optional(),
				filters: searchFiltersSchema.optional(),
				resultsCount: z.number().optional(),
			}),
		)
		.output(z.void())
		.handler(async ({ context, input }) => {
			return await jobAggregatorService.savedSearches.update({
				...input,
				userId: context.user.id,
				filters: input.filters as JobAggregatorSearchFilters | undefined,
			});
		}),

	delete: protectedProcedure
		.route({
			method: "DELETE",
			path: "/job-aggregator/saved-searches/{id}",
			tags: ["Job Aggregator"],
			summary: "Delete a saved search",
		})
		.input(z.object({ id: z.string().uuid() }))
		.output(z.void())
		.handler(async ({ context, input }) => {
			return await jobAggregatorService.savedSearches.delete({ id: input.id, userId: context.user.id });
		}),
};

export const jobAggregatorRouter = {
	jobs: jobsRouter,
	savedSearches: savedSearchesRouter,
};
