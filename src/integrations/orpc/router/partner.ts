import { ORPCError } from "@orpc/server";
import { and, count, desc, eq, ilike, or, sql } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/integrations/drizzle/client";
import {
	partnerEvent,
	partnerEventRegistration,
	partnerJobApplication,
	partnerJobPosting,
	partnerProfile,
} from "@/integrations/drizzle/schema";
import { adminProcedure, protectedProcedure, publicProcedure } from "../context";

/**
 * Accepts both date-only (YYYY-MM-DD) and ISO datetime (YYYY-MM-DDTHH:mm:ss.sssZ) strings.
 * HTML <input type="date"> returns YYYY-MM-DD, while programmatic callers may send full ISO datetime.
 */
const dateOrDatetime = z.union([z.string().date(), z.string().datetime()]);

// ============================================================================
// Custom partnerProcedure — requires role "partner" or "admin"
// ============================================================================

const partnerProcedure = protectedProcedure.use(async ({ context, next }) => {
	if (context.user.role !== "partner" && context.user.role !== "admin") {
		throw new ORPCError("FORBIDDEN", {
			message: "This endpoint requires partner or admin privileges",
		});
	}
	return next({ context });
});

// ============================================================================
// Zod Schemas
// ============================================================================

const partnerStatusSchema = z.enum(["pending", "approved", "rejected", "suspended"]);

const partnerTypeSchema = z.enum(["employer", "recruiter", "training_center", "government", "ngo"]);

const jobStatusSchema = z.enum(["draft", "pending_review", "published", "expired", "closed", "rejected"]);

const eventTypeSchema = z.enum([
	"job_fair",
	"workshop",
	"webinar",
	"networking",
	"training",
	"open_day",
	"recruitment",
	"conference",
	"other",
]);

const applicationStatusSchema = z.enum([
	"submitted",
	"reviewed",
	"shortlisted",
	"interviewed",
	"offered",
	"hired",
	"rejected",
]);

const speakerSchema = z.object({
	name: z.string(),
	title: z.string(),
	company: z.string().optional(),
	photo: z.string().optional(),
});

const agendaItemSchema = z.object({
	time: z.string(),
	title: z.string(),
	description: z.string().optional(),
});

// ============================================================================
// PUBLIC ENDPOINTS
// ============================================================================

const listPublishedJobs = publicProcedure
	.route({
		method: "GET",
		path: "/partner/jobs/published",
		tags: ["Partner"],
		summary: "List published job postings",
	})
	.input(
		z.object({
			location: z.string().optional(),
			field: z.string().optional(),
			jobType: z.string().optional(),
			experienceLevel: z.string().optional(),
			search: z.string().optional(),
			page: z.number().int().min(1).optional().default(1),
			limit: z.number().int().min(1).max(100).optional().default(20),
		}),
	)
	.handler(async ({ input }) => {
		const conditions = [eq(partnerJobPosting.status, "published")];

		if (input.location) {
			conditions.push(ilike(partnerJobPosting.location, `%${input.location}%`));
		}
		if (input.field) {
			conditions.push(eq(partnerJobPosting.field, input.field));
		}
		if (input.jobType) {
			conditions.push(eq(partnerJobPosting.jobType, input.jobType));
		}
		if (input.experienceLevel) {
			conditions.push(eq(partnerJobPosting.experienceLevel, input.experienceLevel));
		}
		if (input.search) {
			conditions.push(
				or(
					ilike(partnerJobPosting.title, `%${input.search}%`),
					ilike(partnerJobPosting.description, `%${input.search}%`),
				)!,
			);
		}

		const offset = (input.page - 1) * input.limit;

		const [rows, totalResult] = await Promise.all([
			db
				.select({
					// All job posting columns
					id: partnerJobPosting.id,
					partnerId: partnerJobPosting.partnerId,
					title: partnerJobPosting.title,
					titleFr: partnerJobPosting.titleFr,
					description: partnerJobPosting.description,
					descriptionFr: partnerJobPosting.descriptionFr,
					location: partnerJobPosting.location,
					region: partnerJobPosting.region,
					jobType: partnerJobPosting.jobType,
					experienceLevel: partnerJobPosting.experienceLevel,
					field: partnerJobPosting.field,
					requirements: partnerJobPosting.requirements,
					skills: partnerJobPosting.skills,
					education: partnerJobPosting.education,
					certifications: partnerJobPosting.certifications,
					salaryMin: partnerJobPosting.salaryMin,
					salaryMax: partnerJobPosting.salaryMax,
					salaryPeriod: partnerJobPosting.salaryPeriod,
					salaryCurrency: partnerJobPosting.salaryCurrency,
					benefits: partnerJobPosting.benefits,
					applicationDeadline: partnerJobPosting.applicationDeadline,
					startDate: partnerJobPosting.startDate,
					positions: partnerJobPosting.positions,
					applicationUrl: partnerJobPosting.applicationUrl,
					applicationEmail: partnerJobPosting.applicationEmail,
					applicationInstructions: partnerJobPosting.applicationInstructions,
					status: partnerJobPosting.status,
					publishedAt: partnerJobPosting.publishedAt,
					expiresAt: partnerJobPosting.expiresAt,
					viewCount: partnerJobPosting.viewCount,
					applicationCount: partnerJobPosting.applicationCount,
					saveCount: partnerJobPosting.saveCount,
					isFeatured: partnerJobPosting.isFeatured,
					isUrgent: partnerJobPosting.isUrgent,
					createdAt: partnerJobPosting.createdAt,
					updatedAt: partnerJobPosting.updatedAt,
					// Partner profile columns for company info
					companyName: partnerProfile.companyName,
					companyNameFr: partnerProfile.companyNameFr,
					companyLogo: partnerProfile.logo,
				})
				.from(partnerJobPosting)
				.leftJoin(partnerProfile, eq(partnerJobPosting.partnerId, partnerProfile.id))
				.where(and(...conditions))
				.orderBy(desc(partnerJobPosting.publishedAt))
				.limit(input.limit)
				.offset(offset),
			db
				.select({ count: count() })
				.from(partnerJobPosting)
				.where(and(...conditions)),
		]);

		return {
			jobs: rows,
			total: Number(totalResult[0]?.count ?? 0),
			page: input.page,
			totalPages: Math.ceil(Number(totalResult[0]?.count ?? 0) / input.limit),
		};
	});

const getPublishedJob = publicProcedure
	.route({
		method: "GET",
		path: "/partner/jobs/published/{id}",
		tags: ["Partner"],
		summary: "Get a published job posting by ID",
	})
	.input(z.object({ id: z.string().uuid() }))
	.handler(async ({ input }) => {
		const [job] = await db
			.select()
			.from(partnerJobPosting)
			.where(and(eq(partnerJobPosting.id, input.id), eq(partnerJobPosting.status, "published")))
			.limit(1);

		if (!job) {
			throw new ORPCError("NOT_FOUND", { message: "Job posting not found" });
		}

		// Increment view count
		await db
			.update(partnerJobPosting)
			.set({ viewCount: sql`${partnerJobPosting.viewCount} + 1` })
			.where(eq(partnerJobPosting.id, input.id));

		return job;
	});

const listPublishedEvents = publicProcedure
	.route({
		method: "GET",
		path: "/partner/events/published",
		tags: ["Partner"],
		summary: "List published events",
	})
	.input(
		z.object({
			page: z.number().int().min(1).optional().default(1),
			limit: z.number().int().min(1).max(100).optional().default(20),
		}),
	)
	.handler(async ({ input }) => {
		const offset = (input.page - 1) * input.limit;

		const [events, totalResult] = await Promise.all([
			db
				.select()
				.from(partnerEvent)
				.where(eq(partnerEvent.status, "published"))
				.orderBy(desc(partnerEvent.startDate))
				.limit(input.limit)
				.offset(offset),
			db.select({ count: count() }).from(partnerEvent).where(eq(partnerEvent.status, "published")),
		]);

		return {
			events,
			total: Number(totalResult[0]?.count ?? 0),
			page: input.page,
			totalPages: Math.ceil(Number(totalResult[0]?.count ?? 0) / input.limit),
		};
	});

const getPublishedEvent = publicProcedure
	.route({
		method: "GET",
		path: "/partner/events/published/{id}",
		tags: ["Partner"],
		summary: "Get a published event by ID",
	})
	.input(z.object({ id: z.string().uuid() }))
	.handler(async ({ input }) => {
		const [event] = await db
			.select()
			.from(partnerEvent)
			.where(and(eq(partnerEvent.id, input.id), eq(partnerEvent.status, "published")))
			.limit(1);

		if (!event) {
			throw new ORPCError("NOT_FOUND", { message: "Event not found" });
		}

		// Increment view count
		await db
			.update(partnerEvent)
			.set({ viewCount: sql`${partnerEvent.viewCount} + 1` })
			.where(eq(partnerEvent.id, input.id));

		return event;
	});

// ============================================================================
// USER ENDPOINTS (protectedProcedure)
// ============================================================================

const applyToJob = protectedProcedure
	.route({
		method: "POST",
		path: "/partner/jobs/{jobId}/apply",
		tags: ["Partner"],
		summary: "Apply to a job posting",
	})
	.input(
		z.object({
			jobId: z.string().uuid(),
			resumeId: z.string().uuid().optional(),
			coverLetter: z.string().optional(),
		}),
	)
	.handler(async ({ context, input }) => {
		// Verify job is published
		const [job] = await db
			.select()
			.from(partnerJobPosting)
			.where(and(eq(partnerJobPosting.id, input.jobId), eq(partnerJobPosting.status, "published")))
			.limit(1);

		if (!job) {
			throw new ORPCError("NOT_FOUND", { message: "Job posting not found or not accepting applications" });
		}

		// Check for existing application (unique constraint on jobId + userId)
		const [existing] = await db
			.select()
			.from(partnerJobApplication)
			.where(and(eq(partnerJobApplication.jobId, input.jobId), eq(partnerJobApplication.userId, context.user.id)))
			.limit(1);

		if (existing) {
			throw new ORPCError("CONFLICT", { message: "You have already applied to this job" });
		}

		const [application] = await db
			.insert(partnerJobApplication)
			.values({
				jobId: input.jobId,
				userId: context.user.id,
				resumeId: input.resumeId ?? null,
				coverLetter: input.coverLetter ?? null,
				status: "submitted",
			})
			.returning({ id: partnerJobApplication.id });

		// Increment application count on job
		await db
			.update(partnerJobPosting)
			.set({ applicationCount: sql`${partnerJobPosting.applicationCount} + 1` })
			.where(eq(partnerJobPosting.id, input.jobId));

		return { id: application!.id };
	});

const getMyApplications = protectedProcedure
	.route({
		method: "GET",
		path: "/partner/applications/mine",
		tags: ["Partner"],
		summary: "List current user's job applications",
	})
	.handler(async ({ context }) => {
		const applications = await db
			.select({
				application: partnerJobApplication,
				job: partnerJobPosting,
			})
			.from(partnerJobApplication)
			.innerJoin(partnerJobPosting, eq(partnerJobApplication.jobId, partnerJobPosting.id))
			.where(eq(partnerJobApplication.userId, context.user.id))
			.orderBy(desc(partnerJobApplication.createdAt));

		return applications;
	});

const registerForEvent = protectedProcedure
	.route({
		method: "POST",
		path: "/partner/events/{eventId}/register",
		tags: ["Partner"],
		summary: "Register for an event",
	})
	.input(
		z.object({
			eventId: z.string().uuid(),
			notes: z.string().optional(),
		}),
	)
	.handler(async ({ context, input }) => {
		// Verify event is published
		const [event] = await db
			.select()
			.from(partnerEvent)
			.where(and(eq(partnerEvent.id, input.eventId), eq(partnerEvent.status, "published")))
			.limit(1);

		if (!event) {
			throw new ORPCError("NOT_FOUND", { message: "Event not found or not accepting registrations" });
		}

		// Check capacity
		if (event.capacity && event.registrationCount >= event.capacity) {
			throw new ORPCError("PRECONDITION_FAILED", { message: "Event is at full capacity" });
		}

		// Check registration deadline
		if (event.registrationDeadline && new Date() > event.registrationDeadline) {
			throw new ORPCError("PRECONDITION_FAILED", { message: "Registration deadline has passed" });
		}

		// Check for existing registration (unique constraint on eventId + userId)
		const [existing] = await db
			.select()
			.from(partnerEventRegistration)
			.where(
				and(eq(partnerEventRegistration.eventId, input.eventId), eq(partnerEventRegistration.userId, context.user.id)),
			)
			.limit(1);

		if (existing) {
			throw new ORPCError("CONFLICT", { message: "You are already registered for this event" });
		}

		const [registration] = await db
			.insert(partnerEventRegistration)
			.values({
				eventId: input.eventId,
				userId: context.user.id,
				notes: input.notes ?? null,
				status: "registered",
			})
			.returning({ id: partnerEventRegistration.id });

		// Increment registration count
		await db
			.update(partnerEvent)
			.set({ registrationCount: sql`${partnerEvent.registrationCount} + 1` })
			.where(eq(partnerEvent.id, input.eventId));

		return { id: registration!.id };
	});

const getMyRegistrations = protectedProcedure
	.route({
		method: "GET",
		path: "/partner/registrations/mine",
		tags: ["Partner"],
		summary: "List current user's event registrations",
	})
	.handler(async ({ context }) => {
		const registrations = await db
			.select({
				registration: partnerEventRegistration,
				event: partnerEvent,
			})
			.from(partnerEventRegistration)
			.innerJoin(partnerEvent, eq(partnerEventRegistration.eventId, partnerEvent.id))
			.where(eq(partnerEventRegistration.userId, context.user.id))
			.orderBy(desc(partnerEventRegistration.createdAt));

		return registrations;
	});

const getPartnerProfile = protectedProcedure
	.route({
		method: "GET",
		path: "/partner/profile/{id}",
		tags: ["Partner"],
		summary: "Get a partner's public profile",
	})
	.input(z.object({ id: z.string().uuid() }))
	.handler(async ({ input }) => {
		const [profile] = await db
			.select()
			.from(partnerProfile)
			.where(and(eq(partnerProfile.id, input.id), eq(partnerProfile.status, "approved")))
			.limit(1);

		if (!profile) {
			throw new ORPCError("NOT_FOUND", { message: "Partner profile not found" });
		}

		return profile;
	});

// ============================================================================
// PARTNER ENDPOINTS (partnerProcedure — role "partner" or "admin")
// ============================================================================

/** Helper: get partner profile for the current user or throw */
async function getOwnPartnerProfile(userId: string) {
	const [profile] = await db.select().from(partnerProfile).where(eq(partnerProfile.userId, userId)).limit(1);

	if (!profile) {
		throw new ORPCError("NOT_FOUND", { message: "You do not have a partner profile" });
	}
	return profile;
}

const getMyProfile = partnerProcedure
	.route({
		method: "GET",
		path: "/partner/profile/mine",
		tags: ["Partner"],
		summary: "Get own partner profile",
	})
	.handler(async ({ context }) => {
		return await getOwnPartnerProfile(context.user.id);
	});

const createProfile = partnerProcedure
	.route({
		method: "POST",
		path: "/partner/profile",
		tags: ["Partner"],
		summary: "Create partner profile",
	})
	.input(
		z.object({
			companyName: z.string().min(1).max(255),
			companyNameFr: z.string().optional(),
			logo: z.string().optional(),
			website: z.string().url().optional(),
			linkedinUrl: z.string().url().optional(),
			partnerType: partnerTypeSchema,
			industry: z.string().min(1),
			industryFr: z.string().optional(),
			description: z.string().min(1),
			descriptionFr: z.string().optional(),
			size: z.string().optional(),
			employeeCount: z.string().optional(),
			headquarters: z.string().min(1),
			locations: z.array(z.string()).optional(),
			founded: z.number().int().optional(),
			contactEmail: z.string().email(),
			contactPhone: z.string().optional(),
			contactPerson: z.string().optional(),
			fields: z.array(z.string()).optional(),
		}),
	)
	.handler(async ({ context, input }) => {
		// Check for existing profile
		const [existing] = await db
			.select()
			.from(partnerProfile)
			.where(eq(partnerProfile.userId, context.user.id))
			.limit(1);

		if (existing) {
			throw new ORPCError("CONFLICT", { message: "You already have a partner profile" });
		}

		const [profile] = await db
			.insert(partnerProfile)
			.values({
				userId: context.user.id,
				companyName: input.companyName,
				companyNameFr: input.companyNameFr ?? null,
				logo: input.logo ?? null,
				website: input.website ?? null,
				linkedinUrl: input.linkedinUrl ?? null,
				partnerType: input.partnerType,
				industry: input.industry,
				industryFr: input.industryFr ?? null,
				description: input.description,
				descriptionFr: input.descriptionFr ?? null,
				size: input.size ?? null,
				employeeCount: input.employeeCount ?? null,
				headquarters: input.headquarters,
				locations: input.locations ?? null,
				founded: input.founded ?? null,
				contactEmail: input.contactEmail,
				contactPhone: input.contactPhone ?? null,
				contactPerson: input.contactPerson ?? null,
				fields: input.fields ?? null,
				status: "pending",
			})
			.returning();

		return profile!;
	});

const updateProfile = partnerProcedure
	.route({
		method: "PUT",
		path: "/partner/profile/mine",
		tags: ["Partner"],
		summary: "Update own partner profile",
	})
	.input(
		z.object({
			companyName: z.string().min(1).max(255).optional(),
			companyNameFr: z.string().optional(),
			logo: z.string().optional(),
			website: z.string().url().optional(),
			linkedinUrl: z.string().url().optional(),
			industry: z.string().optional(),
			industryFr: z.string().optional(),
			description: z.string().optional(),
			descriptionFr: z.string().optional(),
			size: z.string().optional(),
			employeeCount: z.string().optional(),
			headquarters: z.string().optional(),
			locations: z.array(z.string()).optional(),
			founded: z.number().int().optional(),
			contactEmail: z.string().email().optional(),
			contactPhone: z.string().optional(),
			contactPerson: z.string().optional(),
			fields: z.array(z.string()).optional(),
		}),
	)
	.handler(async ({ context, input }) => {
		const profile = await getOwnPartnerProfile(context.user.id);

		const [updated] = await db
			.update(partnerProfile)
			.set({
				...input,
				updatedAt: new Date(),
			})
			.where(eq(partnerProfile.id, profile.id))
			.returning();

		return updated!;
	});

const createJob = partnerProcedure
	.route({
		method: "POST",
		path: "/partner/jobs",
		tags: ["Partner"],
		summary: "Create a job posting",
	})
	.input(
		z.object({
			title: z.string().min(1).max(255),
			titleFr: z.string().optional(),
			description: z.string().min(1),
			descriptionFr: z.string().optional(),
			location: z.string().min(1),
			region: z.string().optional(),
			jobType: z.string().min(1),
			experienceLevel: z.string().min(1),
			field: z.string().optional(),
			requirements: z.array(z.string()).optional(),
			skills: z.array(z.string()).optional(),
			education: z.string().optional(),
			certifications: z.array(z.string()).optional(),
			salaryMin: z.number().int().optional(),
			salaryMax: z.number().int().optional(),
			salaryPeriod: z.string().optional(),
			salaryCurrency: z.string().optional(),
			benefits: z.array(z.string()).optional(),
			applicationDeadline: dateOrDatetime.optional(),
			startDate: dateOrDatetime.optional(),
			positions: z.number().int().min(1).optional(),
			applicationUrl: z.string().url().optional(),
			applicationEmail: z.string().email().optional(),
			applicationInstructions: z.string().optional(),
		}),
	)
	.handler(async ({ context, input }) => {
		const profile = await getOwnPartnerProfile(context.user.id);

		const [job] = await db
			.insert(partnerJobPosting)
			.values({
				partnerId: profile.id,
				title: input.title,
				titleFr: input.titleFr ?? null,
				description: input.description,
				descriptionFr: input.descriptionFr ?? null,
				location: input.location,
				region: input.region ?? null,
				jobType: input.jobType,
				experienceLevel: input.experienceLevel,
				field: input.field ?? null,
				requirements: input.requirements ?? null,
				skills: input.skills ?? null,
				education: input.education ?? null,
				certifications: input.certifications ?? null,
				salaryMin: input.salaryMin ?? null,
				salaryMax: input.salaryMax ?? null,
				salaryPeriod: input.salaryPeriod ?? "monthly",
				salaryCurrency: input.salaryCurrency ?? "MAD",
				benefits: input.benefits ?? null,
				applicationDeadline: input.applicationDeadline ? new Date(input.applicationDeadline) : null,
				startDate: input.startDate ? new Date(input.startDate) : null,
				positions: input.positions ?? 1,
				applicationUrl: input.applicationUrl ?? null,
				applicationEmail: input.applicationEmail ?? null,
				applicationInstructions: input.applicationInstructions ?? null,
				status: "draft",
			})
			.returning();

		return job!;
	});

const updateJob = partnerProcedure
	.route({
		method: "PUT",
		path: "/partner/jobs/{id}",
		tags: ["Partner"],
		summary: "Update own job posting",
	})
	.input(
		z.object({
			id: z.string().uuid(),
			title: z.string().min(1).max(255).optional(),
			titleFr: z.string().optional(),
			description: z.string().optional(),
			descriptionFr: z.string().optional(),
			location: z.string().optional(),
			region: z.string().optional(),
			jobType: z.string().optional(),
			experienceLevel: z.string().optional(),
			field: z.string().optional(),
			requirements: z.array(z.string()).optional(),
			skills: z.array(z.string()).optional(),
			education: z.string().optional(),
			certifications: z.array(z.string()).optional(),
			salaryMin: z.number().int().optional(),
			salaryMax: z.number().int().optional(),
			salaryPeriod: z.string().optional(),
			salaryCurrency: z.string().optional(),
			benefits: z.array(z.string()).optional(),
			applicationDeadline: dateOrDatetime.optional(),
			startDate: dateOrDatetime.optional(),
			positions: z.number().int().min(1).optional(),
			applicationUrl: z.string().url().optional(),
			applicationEmail: z.string().email().optional(),
			applicationInstructions: z.string().optional(),
		}),
	)
	.handler(async ({ context, input }) => {
		const profile = await getOwnPartnerProfile(context.user.id);
		const { id, applicationDeadline, startDate, ...updateFields } = input;

		// Verify ownership
		const [job] = await db
			.select()
			.from(partnerJobPosting)
			.where(and(eq(partnerJobPosting.id, id), eq(partnerJobPosting.partnerId, profile.id)))
			.limit(1);

		if (!job) {
			throw new ORPCError("NOT_FOUND", { message: "Job posting not found or you do not own it" });
		}

		const [updated] = await db
			.update(partnerJobPosting)
			.set({
				...updateFields,
				...(applicationDeadline !== undefined && {
					applicationDeadline: new Date(applicationDeadline),
				}),
				...(startDate !== undefined && { startDate: new Date(startDate) }),
				updatedAt: new Date(),
			})
			.where(eq(partnerJobPosting.id, id))
			.returning();

		return updated!;
	});

const publishJob = partnerProcedure
	.route({
		method: "POST",
		path: "/partner/jobs/{id}/publish",
		tags: ["Partner"],
		summary: "Publish a draft job posting",
	})
	.input(z.object({ id: z.string().uuid() }))
	.handler(async ({ context, input }) => {
		const profile = await getOwnPartnerProfile(context.user.id);

		const [job] = await db
			.select()
			.from(partnerJobPosting)
			.where(and(eq(partnerJobPosting.id, input.id), eq(partnerJobPosting.partnerId, profile.id)))
			.limit(1);

		if (!job) {
			throw new ORPCError("NOT_FOUND", { message: "Job posting not found or you do not own it" });
		}

		if (job.status !== "draft" && job.status !== "rejected") {
			throw new ORPCError("PRECONDITION_FAILED", {
				message: `Cannot publish a job with status "${job.status}"`,
			});
		}

		const [updated] = await db
			.update(partnerJobPosting)
			.set({
				status: "pending_review",
				updatedAt: new Date(),
			})
			.where(eq(partnerJobPosting.id, input.id))
			.returning();

		return updated!;
	});

const closeJob = partnerProcedure
	.route({
		method: "POST",
		path: "/partner/jobs/{id}/close",
		tags: ["Partner"],
		summary: "Close a job posting",
	})
	.input(z.object({ id: z.string().uuid() }))
	.handler(async ({ context, input }) => {
		const profile = await getOwnPartnerProfile(context.user.id);

		const [job] = await db
			.select()
			.from(partnerJobPosting)
			.where(and(eq(partnerJobPosting.id, input.id), eq(partnerJobPosting.partnerId, profile.id)))
			.limit(1);

		if (!job) {
			throw new ORPCError("NOT_FOUND", { message: "Job posting not found or you do not own it" });
		}

		const [updated] = await db
			.update(partnerJobPosting)
			.set({
				status: "closed",
				updatedAt: new Date(),
			})
			.where(eq(partnerJobPosting.id, input.id))
			.returning();

		return updated!;
	});

const getMyJobs = partnerProcedure
	.route({
		method: "GET",
		path: "/partner/jobs/mine",
		tags: ["Partner"],
		summary: "List own job postings",
	})
	.input(
		z
			.object({
				status: jobStatusSchema.optional(),
			})
			.optional()
			.default({}),
	)
	.handler(async ({ context, input }) => {
		const profile = await getOwnPartnerProfile(context.user.id);

		const conditions = [eq(partnerJobPosting.partnerId, profile.id)];

		if (input.status) {
			conditions.push(eq(partnerJobPosting.status, input.status));
		}

		return await db
			.select()
			.from(partnerJobPosting)
			.where(and(...conditions))
			.orderBy(desc(partnerJobPosting.createdAt));
	});

const getJobApplications = partnerProcedure
	.route({
		method: "GET",
		path: "/partner/jobs/{jobId}/applications",
		tags: ["Partner"],
		summary: "View applications for own job posting",
	})
	.input(
		z.object({
			jobId: z.string().uuid(),
			status: applicationStatusSchema.optional(),
		}),
	)
	.handler(async ({ context, input }) => {
		const profile = await getOwnPartnerProfile(context.user.id);

		// Verify job ownership
		const [job] = await db
			.select()
			.from(partnerJobPosting)
			.where(and(eq(partnerJobPosting.id, input.jobId), eq(partnerJobPosting.partnerId, profile.id)))
			.limit(1);

		if (!job) {
			throw new ORPCError("NOT_FOUND", { message: "Job posting not found or you do not own it" });
		}

		const conditions = [eq(partnerJobApplication.jobId, input.jobId)];

		if (input.status) {
			conditions.push(eq(partnerJobApplication.status, input.status));
		}

		return await db
			.select()
			.from(partnerJobApplication)
			.where(and(...conditions))
			.orderBy(desc(partnerJobApplication.createdAt));
	});

const updateApplicationStatus = partnerProcedure
	.route({
		method: "POST",
		path: "/partner/applications/{applicationId}/status",
		tags: ["Partner"],
		summary: "Update job application status",
	})
	.input(
		z.object({
			applicationId: z.string().uuid(),
			status: applicationStatusSchema,
			notes: z.string().optional(),
		}),
	)
	.handler(async ({ context, input }) => {
		const profile = await getOwnPartnerProfile(context.user.id);

		// Get the application and verify job ownership
		const [application] = await db
			.select({
				application: partnerJobApplication,
				job: partnerJobPosting,
			})
			.from(partnerJobApplication)
			.innerJoin(partnerJobPosting, eq(partnerJobApplication.jobId, partnerJobPosting.id))
			.where(and(eq(partnerJobApplication.id, input.applicationId), eq(partnerJobPosting.partnerId, profile.id)))
			.limit(1);

		if (!application) {
			throw new ORPCError("NOT_FOUND", {
				message: "Application not found or you do not own the associated job",
			});
		}

		const [updated] = await db
			.update(partnerJobApplication)
			.set({
				status: input.status,
				notes: input.notes ?? application.application.notes,
				reviewedAt: new Date(),
				updatedAt: new Date(),
			})
			.where(eq(partnerJobApplication.id, input.applicationId))
			.returning();

		return updated!;
	});

const createEvent = partnerProcedure
	.route({
		method: "POST",
		path: "/partner/events",
		tags: ["Partner"],
		summary: "Create an event",
	})
	.input(
		z.object({
			title: z.string().min(1).max(255),
			titleFr: z.string().optional(),
			description: z.string().min(1),
			descriptionFr: z.string().optional(),
			eventType: eventTypeSchema,
			format: z.enum(["in_person", "online", "hybrid"]),
			location: z.string().optional(),
			address: z.string().optional(),
			city: z.string().optional(),
			onlineUrl: z.string().url().optional(),
			startDate: dateOrDatetime,
			endDate: dateOrDatetime,
			registrationDeadline: dateOrDatetime.optional(),
			capacity: z.number().int().min(1).optional(),
			isFree: z.boolean().optional(),
			price: z.number().int().optional(),
			targetAudience: z.array(z.string()).optional(),
			fields: z.array(z.string()).optional(),
			speakers: z.array(speakerSchema).optional(),
			agenda: z.array(agendaItemSchema).optional(),
			requirements: z.array(z.string()).optional(),
			image: z.string().optional(),
		}),
	)
	.handler(async ({ context, input }) => {
		const profile = await getOwnPartnerProfile(context.user.id);

		const [event] = await db
			.insert(partnerEvent)
			.values({
				partnerId: profile.id,
				title: input.title,
				titleFr: input.titleFr ?? null,
				description: input.description,
				descriptionFr: input.descriptionFr ?? null,
				eventType: input.eventType,
				format: input.format,
				location: input.location ?? null,
				address: input.address ?? null,
				city: input.city ?? null,
				onlineUrl: input.onlineUrl ?? null,
				startDate: new Date(input.startDate),
				endDate: new Date(input.endDate),
				registrationDeadline: input.registrationDeadline ? new Date(input.registrationDeadline) : null,
				capacity: input.capacity ?? null,
				isFree: input.isFree ?? true,
				price: input.price ?? null,
				targetAudience: input.targetAudience ?? null,
				fields: input.fields ?? null,
				speakers: input.speakers ?? null,
				agenda: input.agenda ?? null,
				requirements: input.requirements ?? null,
				image: input.image ?? null,
				status: "draft",
			})
			.returning();

		return event!;
	});

const getEventRegistrations = partnerProcedure
	.route({
		method: "GET",
		path: "/partner/events/{eventId}/registrations",
		tags: ["Partner"],
		summary: "View registrations for own event",
	})
	.input(z.object({ eventId: z.string().uuid() }))
	.handler(async ({ context, input }) => {
		const profile = await getOwnPartnerProfile(context.user.id);

		// Verify event ownership
		const [event] = await db
			.select()
			.from(partnerEvent)
			.where(and(eq(partnerEvent.id, input.eventId), eq(partnerEvent.partnerId, profile.id)))
			.limit(1);

		if (!event) {
			throw new ORPCError("NOT_FOUND", { message: "Event not found or you do not own it" });
		}

		return await db
			.select()
			.from(partnerEventRegistration)
			.where(eq(partnerEventRegistration.eventId, input.eventId))
			.orderBy(desc(partnerEventRegistration.createdAt));
	});

const getDashboardStats = partnerProcedure
	.route({
		method: "GET",
		path: "/partner/dashboard/stats",
		tags: ["Partner"],
		summary: "Get partner dashboard summary statistics",
	})
	.handler(async ({ context }) => {
		const profile = await getOwnPartnerProfile(context.user.id);

		const [jobCountResult] = await db
			.select({ count: count() })
			.from(partnerJobPosting)
			.where(eq(partnerJobPosting.partnerId, profile.id));

		const [applicationCountResult] = await db
			.select({ count: count() })
			.from(partnerJobApplication)
			.innerJoin(partnerJobPosting, eq(partnerJobApplication.jobId, partnerJobPosting.id))
			.where(eq(partnerJobPosting.partnerId, profile.id));

		const [eventCountResult] = await db
			.select({ count: count() })
			.from(partnerEvent)
			.where(eq(partnerEvent.partnerId, profile.id));

		const [registrationCountResult] = await db
			.select({ count: count() })
			.from(partnerEventRegistration)
			.innerJoin(partnerEvent, eq(partnerEventRegistration.eventId, partnerEvent.id))
			.where(eq(partnerEvent.partnerId, profile.id));

		return {
			totalJobs: Number(jobCountResult?.count ?? 0),
			totalApplications: Number(applicationCountResult?.count ?? 0),
			totalEvents: Number(eventCountResult?.count ?? 0),
			totalRegistrations: Number(registrationCountResult?.count ?? 0),
			profileStatus: profile.status,
		};
	});

// ============================================================================
// ADMIN ENDPOINTS (adminProcedure)
// ============================================================================

const listPartners = adminProcedure
	.route({
		method: "GET",
		path: "/partner/admin/list",
		tags: ["Partner Admin"],
		summary: "List all partner profiles",
	})
	.input(
		z.object({
			status: partnerStatusSchema.optional(),
			page: z.number().int().min(1).optional().default(1),
			limit: z.number().int().min(1).max(100).optional().default(20),
		}),
	)
	.handler(async ({ input }) => {
		const conditions = [];

		if (input.status) {
			conditions.push(eq(partnerProfile.status, input.status));
		}

		const offset = (input.page - 1) * input.limit;
		const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

		const [partners, totalResult] = await Promise.all([
			db
				.select()
				.from(partnerProfile)
				.where(whereClause)
				.orderBy(desc(partnerProfile.createdAt))
				.limit(input.limit)
				.offset(offset),
			db.select({ count: count() }).from(partnerProfile).where(whereClause),
		]);

		return {
			partners,
			total: Number(totalResult[0]?.count ?? 0),
			page: input.page,
			totalPages: Math.ceil(Number(totalResult[0]?.count ?? 0) / input.limit),
		};
	});

const approvePartner = adminProcedure
	.route({
		method: "POST",
		path: "/partner/admin/{id}/approve",
		tags: ["Partner Admin"],
		summary: "Approve a pending partner",
	})
	.input(z.object({ id: z.string().uuid() }))
	.handler(async ({ context, input }) => {
		const [profile] = await db.select().from(partnerProfile).where(eq(partnerProfile.id, input.id)).limit(1);

		if (!profile) {
			throw new ORPCError("NOT_FOUND", { message: "Partner profile not found" });
		}

		if (profile.status !== "pending") {
			throw new ORPCError("PRECONDITION_FAILED", {
				message: `Cannot approve a partner with status "${profile.status}"`,
			});
		}

		const [updated] = await db
			.update(partnerProfile)
			.set({
				status: "approved",
				approvedAt: new Date(),
				approvedBy: context.user.id,
				updatedAt: new Date(),
			})
			.where(eq(partnerProfile.id, input.id))
			.returning();

		return updated!;
	});

const rejectPartner = adminProcedure
	.route({
		method: "POST",
		path: "/partner/admin/{id}/reject",
		tags: ["Partner Admin"],
		summary: "Reject a partner with reason",
	})
	.input(
		z.object({
			id: z.string().uuid(),
			reason: z.string().min(1),
		}),
	)
	.handler(async ({ input }) => {
		const [profile] = await db.select().from(partnerProfile).where(eq(partnerProfile.id, input.id)).limit(1);

		if (!profile) {
			throw new ORPCError("NOT_FOUND", { message: "Partner profile not found" });
		}

		const [updated] = await db
			.update(partnerProfile)
			.set({
				status: "rejected",
				rejectionReason: input.reason,
				updatedAt: new Date(),
			})
			.where(eq(partnerProfile.id, input.id))
			.returning();

		return updated!;
	});

const suspendPartner = adminProcedure
	.route({
		method: "POST",
		path: "/partner/admin/{id}/suspend",
		tags: ["Partner Admin"],
		summary: "Suspend a partner",
	})
	.input(
		z.object({
			id: z.string().uuid(),
			reason: z.string().min(1),
		}),
	)
	.handler(async ({ input }) => {
		const [profile] = await db.select().from(partnerProfile).where(eq(partnerProfile.id, input.id)).limit(1);

		if (!profile) {
			throw new ORPCError("NOT_FOUND", { message: "Partner profile not found" });
		}

		const [updated] = await db
			.update(partnerProfile)
			.set({
				status: "suspended",
				rejectionReason: input.reason,
				updatedAt: new Date(),
			})
			.where(eq(partnerProfile.id, input.id))
			.returning();

		return updated!;
	});

const reviewJob = adminProcedure
	.route({
		method: "POST",
		path: "/partner/admin/jobs/{id}/review",
		tags: ["Partner Admin"],
		summary: "Approve or reject a job posting",
	})
	.input(
		z.object({
			id: z.string().uuid(),
			action: z.enum(["approve", "reject"]),
			reason: z.string().optional(),
		}),
	)
	.handler(async ({ context, input }) => {
		const [job] = await db.select().from(partnerJobPosting).where(eq(partnerJobPosting.id, input.id)).limit(1);

		if (!job) {
			throw new ORPCError("NOT_FOUND", { message: "Job posting not found" });
		}

		if (job.status !== "pending_review") {
			throw new ORPCError("PRECONDITION_FAILED", {
				message: `Can only review jobs with status "pending_review", current status is "${job.status}"`,
			});
		}

		const newStatus = input.action === "approve" ? "published" : "rejected";

		const [updated] = await db
			.update(partnerJobPosting)
			.set({
				status: newStatus,
				publishedAt: input.action === "approve" ? new Date() : null,
				reviewedAt: new Date(),
				reviewedBy: context.user.id,
				rejectionReason: input.action === "reject" ? (input.reason ?? null) : null,
				updatedAt: new Date(),
			})
			.where(eq(partnerJobPosting.id, input.id))
			.returning();

		return updated!;
	});

const reviewEvent = adminProcedure
	.route({
		method: "POST",
		path: "/partner/admin/events/{id}/review",
		tags: ["Partner Admin"],
		summary: "Approve or reject an event",
	})
	.input(
		z.object({
			id: z.string().uuid(),
			action: z.enum(["approve", "reject"]),
			reason: z.string().optional(),
		}),
	)
	.handler(async ({ context, input }) => {
		const [event] = await db.select().from(partnerEvent).where(eq(partnerEvent.id, input.id)).limit(1);

		if (!event) {
			throw new ORPCError("NOT_FOUND", { message: "Event not found" });
		}

		if (event.status !== "pending_review") {
			throw new ORPCError("PRECONDITION_FAILED", {
				message: `Can only review events with status "pending_review", current status is "${event.status}"`,
			});
		}

		const newStatus = input.action === "approve" ? "published" : "rejected";

		const [updated] = await db
			.update(partnerEvent)
			.set({
				status: newStatus,
				publishedAt: input.action === "approve" ? new Date() : null,
				reviewedAt: new Date(),
				reviewedBy: context.user.id,
				rejectionReason: input.action === "reject" ? (input.reason ?? null) : null,
				updatedAt: new Date(),
			})
			.where(eq(partnerEvent.id, input.id))
			.returning();

		return updated!;
	});

// ============================================================================
// EXPORT
// ============================================================================

export const partnerRouter = {
	// Public
	listPublishedJobs,
	getPublishedJob,
	listPublishedEvents,
	getPublishedEvent,
	// User (authenticated)
	applyToJob,
	getMyApplications,
	registerForEvent,
	getMyRegistrations,
	getPartnerProfile,
	// Partner (role: partner or admin)
	getMyProfile,
	createProfile,
	updateProfile,
	createJob,
	updateJob,
	publishJob,
	closeJob,
	getMyJobs,
	getJobApplications,
	updateApplicationStatus,
	createEvent,
	getEventRegistrations,
	getDashboardStats,
	// Admin
	listPartners,
	approvePartner,
	rejectPartner,
	suspendPartner,
	reviewJob,
	reviewEvent,
};
