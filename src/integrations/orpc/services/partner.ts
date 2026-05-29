import { and, asc, count, desc, eq, ilike, or, sql } from "drizzle-orm";
import { schema } from "@/integrations/drizzle";
import { db } from "@/integrations/drizzle/client";

// ---------------------------------------------------------------------------
// Type helpers
// ---------------------------------------------------------------------------
export type PartnerProfile = typeof schema.partnerProfile.$inferSelect;
export type PartnerJobPosting = typeof schema.partnerJobPosting.$inferSelect;
export type PartnerJobApplication = typeof schema.partnerJobApplication.$inferSelect;
export type PartnerEvent = typeof schema.partnerEvent.$inferSelect;
export type PartnerEventRegistration = typeof schema.partnerEventRegistration.$inferSelect;

// ---------------------------------------------------------------------------
// Option interfaces
// ---------------------------------------------------------------------------
export interface ProfileListOptions {
	status?: string;
	partnerType?: string;
	search?: string;
	page?: number;
	pageSize?: number;
}

export interface JobListOptions {
	location?: string;
	field?: string;
	jobType?: string;
	experienceLevel?: string;
	search?: string;
	page?: number;
	pageSize?: number;
}

export interface PartnerJobListOptions {
	status?: string;
	page?: number;
	pageSize?: number;
}

export interface EventListOptions {
	eventType?: string;
	city?: string;
	format?: string;
	isFree?: boolean;
	search?: string;
	page?: number;
	pageSize?: number;
}

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------
export const partnerService = {
	// ========================================================================
	// Profile operations
	// ========================================================================

	getProfile: async (userId: string) => {
		const [profile] = await db.select().from(schema.partnerProfile).where(eq(schema.partnerProfile.userId, userId));
		return profile ?? null;
	},

	getProfileById: async (id: string) => {
		const [profile] = await db.select().from(schema.partnerProfile).where(eq(schema.partnerProfile.id, id));
		return profile ?? null;
	},

	createProfile: async (
		userId: string,
		data: Omit<typeof schema.partnerProfile.$inferInsert, "id" | "userId" | "status" | "createdAt" | "updatedAt">,
	) => {
		const [profile] = await db
			.insert(schema.partnerProfile)
			.values({ ...data, userId, status: "pending" })
			.returning();
		return profile;
	},

	updateProfile: async (
		id: string,
		data: Partial<Omit<typeof schema.partnerProfile.$inferInsert, "id" | "userId" | "createdAt" | "updatedAt">>,
	) => {
		const [updated] = await db
			.update(schema.partnerProfile)
			.set({ ...data, updatedAt: new Date() })
			.where(eq(schema.partnerProfile.id, id))
			.returning();
		return updated ?? null;
	},

	listProfiles: async (options?: ProfileListOptions) => {
		const page = options?.page ?? 1;
		const pageSize = options?.pageSize ?? 20;
		const offset = (page - 1) * pageSize;

		const conditions: ReturnType<typeof eq>[] = [];

		if (options?.status) {
			conditions.push(eq(schema.partnerProfile.status, options.status as PartnerProfile["status"]));
		}
		if (options?.partnerType) {
			conditions.push(eq(schema.partnerProfile.partnerType, options.partnerType as PartnerProfile["partnerType"]));
		}
		if (options?.search) {
			const term = `%${options.search}%`;
			const searchCondition = or(
				ilike(schema.partnerProfile.companyName, term),
				ilike(schema.partnerProfile.companyNameFr, term),
				ilike(schema.partnerProfile.industry, term),
			);
			if (searchCondition) conditions.push(searchCondition);
		}

		const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

		const [items, totalResult] = await Promise.all([
			db
				.select()
				.from(schema.partnerProfile)
				.where(whereClause)
				.orderBy(desc(schema.partnerProfile.createdAt))
				.limit(pageSize)
				.offset(offset),
			db.select({ total: count() }).from(schema.partnerProfile).where(whereClause),
		]);

		const total = Number(totalResult[0]?.total ?? 0);

		return {
			items,
			pagination: {
				page,
				pageSize,
				total,
				totalPages: Math.ceil(total / pageSize),
			},
		};
	},

	approveProfile: async (id: string, approvedBy: string) => {
		const [updated] = await db
			.update(schema.partnerProfile)
			.set({
				status: "approved",
				approvedAt: new Date(),
				approvedBy,
				updatedAt: new Date(),
			})
			.where(eq(schema.partnerProfile.id, id))
			.returning();
		return updated ?? null;
	},

	rejectProfile: async (id: string, reason: string) => {
		const [updated] = await db
			.update(schema.partnerProfile)
			.set({
				status: "rejected",
				rejectionReason: reason,
				updatedAt: new Date(),
			})
			.where(eq(schema.partnerProfile.id, id))
			.returning();
		return updated ?? null;
	},

	// ========================================================================
	// Job posting operations
	// ========================================================================

	listJobs: async (options?: JobListOptions) => {
		const page = options?.page ?? 1;
		const pageSize = options?.pageSize ?? 20;
		const offset = (page - 1) * pageSize;

		const conditions: ReturnType<typeof eq>[] = [eq(schema.partnerJobPosting.status, "published")];

		if (options?.location) {
			conditions.push(eq(schema.partnerJobPosting.location, options.location));
		}
		if (options?.field) {
			conditions.push(eq(schema.partnerJobPosting.field, options.field));
		}
		if (options?.jobType) {
			conditions.push(eq(schema.partnerJobPosting.jobType, options.jobType));
		}
		if (options?.experienceLevel) {
			conditions.push(eq(schema.partnerJobPosting.experienceLevel, options.experienceLevel));
		}
		if (options?.search) {
			const term = `%${options.search}%`;
			const searchCondition = or(
				ilike(schema.partnerJobPosting.title, term),
				ilike(schema.partnerJobPosting.titleFr, term),
				ilike(schema.partnerJobPosting.description, term),
			);
			if (searchCondition) conditions.push(searchCondition);
		}

		const whereClause = and(...conditions);

		const [items, totalResult] = await Promise.all([
			db
				.select()
				.from(schema.partnerJobPosting)
				.where(whereClause)
				.orderBy(desc(schema.partnerJobPosting.publishedAt))
				.limit(pageSize)
				.offset(offset),
			db.select({ total: count() }).from(schema.partnerJobPosting).where(whereClause),
		]);

		const total = Number(totalResult[0]?.total ?? 0);

		return {
			items,
			pagination: {
				page,
				pageSize,
				total,
				totalPages: Math.ceil(total / pageSize),
			},
		};
	},

	getJob: async (id: string) => {
		const [job] = await db
			.select({
				job: schema.partnerJobPosting,
				partner: schema.partnerProfile,
			})
			.from(schema.partnerJobPosting)
			.innerJoin(schema.partnerProfile, eq(schema.partnerJobPosting.partnerId, schema.partnerProfile.id))
			.where(eq(schema.partnerJobPosting.id, id));

		if (!job) return null;
		return { ...job.job, partner: job.partner };
	},

	createJob: async (
		partnerId: string,
		data: Omit<typeof schema.partnerJobPosting.$inferInsert, "id" | "partnerId" | "status" | "createdAt" | "updatedAt">,
	) => {
		const [job] = await db
			.insert(schema.partnerJobPosting)
			.values({ ...data, partnerId, status: "draft" })
			.returning();
		return job;
	},

	updateJob: async (
		id: string,
		data: Partial<Omit<typeof schema.partnerJobPosting.$inferInsert, "id" | "partnerId" | "createdAt" | "updatedAt">>,
	) => {
		const [updated] = await db
			.update(schema.partnerJobPosting)
			.set({ ...data, updatedAt: new Date() })
			.where(eq(schema.partnerJobPosting.id, id))
			.returning();
		return updated ?? null;
	},

	publishJob: async (id: string) => {
		const [updated] = await db
			.update(schema.partnerJobPosting)
			.set({
				status: "published",
				publishedAt: new Date(),
				updatedAt: new Date(),
			})
			.where(eq(schema.partnerJobPosting.id, id))
			.returning();
		return updated ?? null;
	},

	closeJob: async (id: string) => {
		const [updated] = await db
			.update(schema.partnerJobPosting)
			.set({
				status: "closed",
				updatedAt: new Date(),
			})
			.where(eq(schema.partnerJobPosting.id, id))
			.returning();
		return updated ?? null;
	},

	getPartnerJobs: async (partnerId: string, options?: PartnerJobListOptions) => {
		const page = options?.page ?? 1;
		const pageSize = options?.pageSize ?? 20;
		const offset = (page - 1) * pageSize;

		const conditions: ReturnType<typeof eq>[] = [eq(schema.partnerJobPosting.partnerId, partnerId)];

		if (options?.status) {
			conditions.push(eq(schema.partnerJobPosting.status, options.status as PartnerJobPosting["status"]));
		}

		const whereClause = and(...conditions);

		const [items, totalResult] = await Promise.all([
			db
				.select()
				.from(schema.partnerJobPosting)
				.where(whereClause)
				.orderBy(desc(schema.partnerJobPosting.createdAt))
				.limit(pageSize)
				.offset(offset),
			db.select({ total: count() }).from(schema.partnerJobPosting).where(whereClause),
		]);

		const total = Number(totalResult[0]?.total ?? 0);

		return {
			items,
			pagination: {
				page,
				pageSize,
				total,
				totalPages: Math.ceil(total / pageSize),
			},
		};
	},

	incrementJobViewCount: async (id: string) => {
		await db
			.update(schema.partnerJobPosting)
			.set({
				viewCount: sql`${schema.partnerJobPosting.viewCount} + 1`,
			})
			.where(eq(schema.partnerJobPosting.id, id));
	},

	// ========================================================================
	// Application operations
	// ========================================================================

	applyToJob: async (jobId: string, userId: string, resumeId?: string, coverLetter?: string) => {
		const [application] = await db
			.insert(schema.partnerJobApplication)
			.values({
				jobId,
				userId,
				resumeId: resumeId ?? null,
				coverLetter: coverLetter ?? null,
				status: "submitted",
			})
			.returning();

		// Increment the application count on the job posting
		await db
			.update(schema.partnerJobPosting)
			.set({
				applicationCount: sql`${schema.partnerJobPosting.applicationCount} + 1`,
			})
			.where(eq(schema.partnerJobPosting.id, jobId));

		return application;
	},

	getUserApplications: async (userId: string) => {
		const applications = await db
			.select({
				application: schema.partnerJobApplication,
				job: schema.partnerJobPosting,
			})
			.from(schema.partnerJobApplication)
			.innerJoin(schema.partnerJobPosting, eq(schema.partnerJobApplication.jobId, schema.partnerJobPosting.id))
			.where(eq(schema.partnerJobApplication.userId, userId))
			.orderBy(desc(schema.partnerJobApplication.createdAt));

		return applications.map((row) => ({
			...row.application,
			job: row.job,
		}));
	},

	getJobApplications: async (jobId: string) => {
		const applications = await db
			.select()
			.from(schema.partnerJobApplication)
			.where(eq(schema.partnerJobApplication.jobId, jobId))
			.orderBy(desc(schema.partnerJobApplication.createdAt));

		return applications;
	},

	updateApplicationStatus: async (id: string, status: string, notes?: string) => {
		const updateData: Record<string, unknown> = {
			status,
			reviewedAt: new Date(),
			updatedAt: new Date(),
		};
		if (notes !== undefined) {
			updateData.notes = notes;
		}

		const [updated] = await db
			.update(schema.partnerJobApplication)
			.set(updateData)
			.where(eq(schema.partnerJobApplication.id, id))
			.returning();
		return updated ?? null;
	},

	getApplicationStats: async (partnerId: string) => {
		const result = await db
			.select({
				status: schema.partnerJobApplication.status,
				total: count(),
			})
			.from(schema.partnerJobApplication)
			.innerJoin(schema.partnerJobPosting, eq(schema.partnerJobApplication.jobId, schema.partnerJobPosting.id))
			.where(eq(schema.partnerJobPosting.partnerId, partnerId))
			.groupBy(schema.partnerJobApplication.status);

		const stats: Record<string, number> = {};
		for (const row of result) {
			stats[row.status] = Number(row.total);
		}
		return stats;
	},

	// ========================================================================
	// Event operations
	// ========================================================================

	listEvents: async (options?: EventListOptions) => {
		const page = options?.page ?? 1;
		const pageSize = options?.pageSize ?? 20;
		const offset = (page - 1) * pageSize;

		const conditions: ReturnType<typeof eq>[] = [eq(schema.partnerEvent.status, "published")];

		if (options?.eventType) {
			conditions.push(eq(schema.partnerEvent.eventType, options.eventType as PartnerEvent["eventType"]));
		}
		if (options?.city) {
			conditions.push(eq(schema.partnerEvent.city, options.city));
		}
		if (options?.format) {
			conditions.push(eq(schema.partnerEvent.format, options.format));
		}
		if (options?.isFree !== undefined) {
			conditions.push(eq(schema.partnerEvent.isFree, options.isFree));
		}
		if (options?.search) {
			const term = `%${options.search}%`;
			const searchCondition = or(
				ilike(schema.partnerEvent.title, term),
				ilike(schema.partnerEvent.titleFr, term),
				ilike(schema.partnerEvent.description, term),
			);
			if (searchCondition) conditions.push(searchCondition);
		}

		const whereClause = and(...conditions);

		const [items, totalResult] = await Promise.all([
			db
				.select()
				.from(schema.partnerEvent)
				.where(whereClause)
				.orderBy(asc(schema.partnerEvent.startDate))
				.limit(pageSize)
				.offset(offset),
			db.select({ total: count() }).from(schema.partnerEvent).where(whereClause),
		]);

		const total = Number(totalResult[0]?.total ?? 0);

		return {
			items,
			pagination: {
				page,
				pageSize,
				total,
				totalPages: Math.ceil(total / pageSize),
			},
		};
	},

	createEvent: async (
		partnerId: string,
		data: Omit<typeof schema.partnerEvent.$inferInsert, "id" | "partnerId" | "status" | "createdAt" | "updatedAt">,
	) => {
		const [event] = await db
			.insert(schema.partnerEvent)
			.values({ ...data, partnerId, status: "draft" })
			.returning();
		return event;
	},

	registerForEvent: async (eventId: string, userId: string) => {
		const [registration] = await db
			.insert(schema.partnerEventRegistration)
			.values({
				eventId,
				userId,
				status: "registered",
			})
			.returning();

		// Increment the registration count on the event
		await db
			.update(schema.partnerEvent)
			.set({
				registrationCount: sql`${schema.partnerEvent.registrationCount} + 1`,
			})
			.where(eq(schema.partnerEvent.id, eventId));

		return registration;
	},

	getUserRegistrations: async (userId: string) => {
		const registrations = await db
			.select({
				registration: schema.partnerEventRegistration,
				event: schema.partnerEvent,
			})
			.from(schema.partnerEventRegistration)
			.innerJoin(schema.partnerEvent, eq(schema.partnerEventRegistration.eventId, schema.partnerEvent.id))
			.where(eq(schema.partnerEventRegistration.userId, userId))
			.orderBy(asc(schema.partnerEvent.startDate));

		return registrations.map((row) => ({
			...row.registration,
			event: row.event,
		}));
	},

	getEventRegistrations: async (eventId: string) => {
		const registrations = await db
			.select()
			.from(schema.partnerEventRegistration)
			.where(eq(schema.partnerEventRegistration.eventId, eventId))
			.orderBy(desc(schema.partnerEventRegistration.createdAt));

		return registrations;
	},
};
