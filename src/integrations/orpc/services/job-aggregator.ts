import { ORPCError } from "@orpc/client";
import { and, desc, eq, ilike, inArray, or, sql } from "drizzle-orm";
import { schema } from "@/integrations/drizzle";
import { db } from "@/integrations/drizzle/client";
import type {
	JobAggregatorAppStatus,
	JobAggregatorExperience,
	JobAggregatorIndustry,
	JobAggregatorSearchFilters,
	JobAggregatorSource,
	JobAggregatorWorkType,
} from "@/integrations/drizzle/schema";
import { generateId } from "@/utils/string";

// Types
export type CreateJobInput = {
	userId: string;
	title: string;
	company: string;
	companyLogo?: string;
	location: string;
	workType: JobAggregatorWorkType;
	industry: JobAggregatorIndustry;
	experienceLevel: JobAggregatorExperience;
	salaryMin?: number;
	salaryMax?: number;
	currency?: string;
	postedDate: string;
	description: string;
	requirements: string[];
	skills: string[];
	benefits: string[];
	source: JobAggregatorSource;
	sourceUrl: string;
	matchScore?: number;
};

export type UpdateJobInput = {
	id: string;
	userId: string;
	title?: string;
	company?: string;
	companyLogo?: string;
	location?: string;
	workType?: JobAggregatorWorkType;
	industry?: JobAggregatorIndustry;
	experienceLevel?: JobAggregatorExperience;
	salaryMin?: number;
	salaryMax?: number;
	currency?: string;
	postedDate?: string;
	description?: string;
	requirements?: string[];
	skills?: string[];
	benefits?: string[];
	source?: JobAggregatorSource;
	sourceUrl?: string;
	applicationStatus?: JobAggregatorAppStatus;
	isSaved?: boolean;
	matchScore?: number;
};

export type ListJobsInput = {
	userId: string;
	search?: string;
	sources?: JobAggregatorSource[];
	salaryMin?: number;
	salaryMax?: number;
	locations?: string[];
	workTypes?: JobAggregatorWorkType[];
	experienceLevels?: JobAggregatorExperience[];
	industries?: JobAggregatorIndustry[];
	isSaved?: boolean;
	applicationStatus?: JobAggregatorAppStatus;
	limit?: number;
	offset?: number;
};

export type CreateSavedSearchInput = {
	userId: string;
	name: string;
	query: string;
	filters: JobAggregatorSearchFilters;
	resultsCount: number;
};

export type UpdateSavedSearchInput = {
	id: string;
	userId: string;
	name?: string;
	query?: string;
	filters?: JobAggregatorSearchFilters;
	resultsCount?: number;
};

export const jobAggregatorService = {
	// Job operations
	jobs: {
		// Create a new job
		create: async (input: CreateJobInput): Promise<string> => {
			const id = generateId();

			await db.insert(schema.aggregatedJob).values({
				id,
				userId: input.userId,
				title: input.title,
				company: input.company,
				companyLogo: input.companyLogo,
				location: input.location,
				workType: input.workType,
				industry: input.industry,
				experienceLevel: input.experienceLevel,
				salaryMin: input.salaryMin,
				salaryMax: input.salaryMax,
				currency: input.currency ?? "MAD",
				postedDate: input.postedDate,
				description: input.description,
				requirements: input.requirements,
				skills: input.skills,
				benefits: input.benefits,
				source: input.source,
				sourceUrl: input.sourceUrl,
				matchScore: input.matchScore,
			});

			return id;
		},

		// Get job by ID
		getById: async (input: { id: string; userId: string }) => {
			const [job] = await db
				.select()
				.from(schema.aggregatedJob)
				.where(and(eq(schema.aggregatedJob.id, input.id), eq(schema.aggregatedJob.userId, input.userId)));

			if (!job) {
				throw new ORPCError("NOT_FOUND", { message: "Job not found" });
			}

			return job;
		},

		// List jobs with filters
		list: async (input: ListJobsInput) => {
			const conditions = [eq(schema.aggregatedJob.userId, input.userId)];

			if (input.search) {
				const searchCondition = or(
					ilike(schema.aggregatedJob.title, `%${input.search}%`),
					ilike(schema.aggregatedJob.company, `%${input.search}%`),
					ilike(schema.aggregatedJob.description, `%${input.search}%`),
				);
				if (searchCondition) conditions.push(searchCondition);
			}

			if (input.sources && input.sources.length > 0) {
				conditions.push(inArray(schema.aggregatedJob.source, input.sources));
			}

			if (input.locations && input.locations.length > 0) {
				conditions.push(inArray(schema.aggregatedJob.location, input.locations));
			}

			if (input.workTypes && input.workTypes.length > 0) {
				conditions.push(inArray(schema.aggregatedJob.workType, input.workTypes));
			}

			if (input.experienceLevels && input.experienceLevels.length > 0) {
				conditions.push(inArray(schema.aggregatedJob.experienceLevel, input.experienceLevels));
			}

			if (input.industries && input.industries.length > 0) {
				conditions.push(inArray(schema.aggregatedJob.industry, input.industries));
			}

			if (input.isSaved !== undefined) {
				conditions.push(eq(schema.aggregatedJob.isSaved, input.isSaved));
			}

			if (input.applicationStatus) {
				conditions.push(eq(schema.aggregatedJob.applicationStatus, input.applicationStatus));
			}

			const jobs = await db
				.select()
				.from(schema.aggregatedJob)
				.where(and(...conditions))
				.orderBy(desc(schema.aggregatedJob.createdAt))
				.limit(input.limit ?? 100)
				.offset(input.offset ?? 0);

			return jobs;
		},

		// Update job
		update: async (input: UpdateJobInput): Promise<void> => {
			const [existing] = await db
				.select({ id: schema.aggregatedJob.id })
				.from(schema.aggregatedJob)
				.where(and(eq(schema.aggregatedJob.id, input.id), eq(schema.aggregatedJob.userId, input.userId)));

			if (!existing) {
				throw new ORPCError("NOT_FOUND", { message: "Job not found" });
			}

			await db
				.update(schema.aggregatedJob)
				.set({
					title: input.title,
					company: input.company,
					companyLogo: input.companyLogo,
					location: input.location,
					workType: input.workType,
					industry: input.industry,
					experienceLevel: input.experienceLevel,
					salaryMin: input.salaryMin,
					salaryMax: input.salaryMax,
					currency: input.currency,
					postedDate: input.postedDate,
					description: input.description,
					requirements: input.requirements,
					skills: input.skills,
					benefits: input.benefits,
					source: input.source,
					sourceUrl: input.sourceUrl,
					applicationStatus: input.applicationStatus,
					isSaved: input.isSaved,
					matchScore: input.matchScore,
				})
				.where(and(eq(schema.aggregatedJob.id, input.id), eq(schema.aggregatedJob.userId, input.userId)));
		},

		// Toggle job saved status
		toggleSaved: async (input: { id: string; userId: string }): Promise<boolean> => {
			const [existing] = await db
				.select({ isSaved: schema.aggregatedJob.isSaved })
				.from(schema.aggregatedJob)
				.where(and(eq(schema.aggregatedJob.id, input.id), eq(schema.aggregatedJob.userId, input.userId)));

			if (!existing) {
				throw new ORPCError("NOT_FOUND", { message: "Job not found" });
			}

			const newSavedStatus = !existing.isSaved;

			await db
				.update(schema.aggregatedJob)
				.set({ isSaved: newSavedStatus })
				.where(and(eq(schema.aggregatedJob.id, input.id), eq(schema.aggregatedJob.userId, input.userId)));

			return newSavedStatus;
		},

		// Update application status
		updateStatus: async (input: { id: string; userId: string; status: JobAggregatorAppStatus }): Promise<void> => {
			const [existing] = await db
				.select({ id: schema.aggregatedJob.id })
				.from(schema.aggregatedJob)
				.where(and(eq(schema.aggregatedJob.id, input.id), eq(schema.aggregatedJob.userId, input.userId)));

			if (!existing) {
				throw new ORPCError("NOT_FOUND", { message: "Job not found" });
			}

			await db
				.update(schema.aggregatedJob)
				.set({ applicationStatus: input.status })
				.where(and(eq(schema.aggregatedJob.id, input.id), eq(schema.aggregatedJob.userId, input.userId)));
		},

		// Delete job
		delete: async (input: { id: string; userId: string }): Promise<void> => {
			await db
				.delete(schema.aggregatedJob)
				.where(and(eq(schema.aggregatedJob.id, input.id), eq(schema.aggregatedJob.userId, input.userId)));
		},

		// Get statistics
		getStatistics: async (input: { userId: string }) => {
			const stats = await db
				.select({
					total: sql<number>`count(*)::int`,
					saved: sql<number>`count(*) filter (where ${schema.aggregatedJob.isSaved} = true)::int`,
					applied: sql<number>`count(*) filter (where ${schema.aggregatedJob.applicationStatus} != 'not_applied')::int`,
					bySource: sql<Record<string, number>>`jsonb_object_agg(
						${schema.aggregatedJob.source},
						1
					)`,
				})
				.from(schema.aggregatedJob)
				.where(eq(schema.aggregatedJob.userId, input.userId));

			// Get counts by source
			const sourceCounts = await db
				.select({
					source: schema.aggregatedJob.source,
					count: sql<number>`count(*)::int`,
				})
				.from(schema.aggregatedJob)
				.where(eq(schema.aggregatedJob.userId, input.userId))
				.groupBy(schema.aggregatedJob.source);

			const bySource = Object.fromEntries(sourceCounts.map((s) => [s.source, s.count]));

			return {
				total: stats[0]?.total ?? 0,
				saved: stats[0]?.saved ?? 0,
				applied: stats[0]?.applied ?? 0,
				bySource: {
					linkedin: bySource.linkedin ?? 0,
					indeed: bySource.indeed ?? 0,
					glassdoor: bySource.glassdoor ?? 0,
				},
			};
		},
	},

	// Saved search operations
	savedSearches: {
		// Create a saved search
		create: async (input: CreateSavedSearchInput): Promise<string> => {
			const id = generateId();

			await db.insert(schema.aggregatorSavedSearch).values({
				id,
				userId: input.userId,
				name: input.name,
				query: input.query,
				filters: input.filters,
				resultsCount: input.resultsCount,
			});

			return id;
		},

		// List saved searches
		list: async (input: { userId: string }) => {
			return await db
				.select()
				.from(schema.aggregatorSavedSearch)
				.where(eq(schema.aggregatorSavedSearch.userId, input.userId))
				.orderBy(desc(schema.aggregatorSavedSearch.createdAt));
		},

		// Get saved search by ID
		getById: async (input: { id: string; userId: string }) => {
			const [search] = await db
				.select()
				.from(schema.aggregatorSavedSearch)
				.where(
					and(eq(schema.aggregatorSavedSearch.id, input.id), eq(schema.aggregatorSavedSearch.userId, input.userId)),
				);

			if (!search) {
				throw new ORPCError("NOT_FOUND", { message: "Saved search not found" });
			}

			return search;
		},

		// Update saved search
		update: async (input: UpdateSavedSearchInput): Promise<void> => {
			const [existing] = await db
				.select({ id: schema.aggregatorSavedSearch.id })
				.from(schema.aggregatorSavedSearch)
				.where(
					and(eq(schema.aggregatorSavedSearch.id, input.id), eq(schema.aggregatorSavedSearch.userId, input.userId)),
				);

			if (!existing) {
				throw new ORPCError("NOT_FOUND", { message: "Saved search not found" });
			}

			await db
				.update(schema.aggregatorSavedSearch)
				.set({
					name: input.name,
					query: input.query,
					filters: input.filters,
					resultsCount: input.resultsCount,
				})
				.where(
					and(eq(schema.aggregatorSavedSearch.id, input.id), eq(schema.aggregatorSavedSearch.userId, input.userId)),
				);
		},

		// Delete saved search
		delete: async (input: { id: string; userId: string }): Promise<void> => {
			await db
				.delete(schema.aggregatorSavedSearch)
				.where(
					and(eq(schema.aggregatorSavedSearch.id, input.id), eq(schema.aggregatorSavedSearch.userId, input.userId)),
				);
		},
	},
};
