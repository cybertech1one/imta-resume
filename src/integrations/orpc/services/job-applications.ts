import { ORPCError } from "@orpc/client";
import { and, asc, desc, eq, gte, ilike, or, sql } from "drizzle-orm";
import { schema } from "@/integrations/drizzle";
import { db } from "@/integrations/drizzle/client";
import { generateId } from "@/utils/string";

export type ApplicationStatus =
	| "saved"
	| "applied"
	| "phone_screen"
	| "interview"
	| "offer"
	| "rejected"
	| "withdrawn"
	| "accepted";

export type CreateApplicationInput = {
	userId: string;
	companyName: string;
	position: string;
	location?: string;
	jobUrl?: string;
	jobDescription?: string;
	salary?: string;
	salaryMin?: number;
	salaryMax?: number;
	salaryCurrency?: string;
	status?: ApplicationStatus;
	appliedAt?: Date;
	deadline?: Date;
	source?: string;
	contactName?: string;
	contactEmail?: string;
	contactPhone?: string;
	notes?: string;
	tags?: string[];
	priority?: number;
	isRemote?: boolean;
	workType?: string;
	resumeId?: string;
};

export type UpdateApplicationInput = {
	id: string;
	userId: string;
	companyName?: string;
	position?: string;
	location?: string;
	jobUrl?: string;
	jobDescription?: string;
	salary?: string;
	salaryMin?: number;
	salaryMax?: number;
	salaryCurrency?: string;
	status?: ApplicationStatus;
	appliedAt?: Date;
	deadline?: Date;
	source?: string;
	contactName?: string;
	contactEmail?: string;
	contactPhone?: string;
	notes?: string;
	tags?: string[];
	priority?: number;
	isRemote?: boolean;
	workType?: string;
	resumeId?: string;
};

export type ListApplicationsInput = {
	userId: string;
	status?: ApplicationStatus;
	search?: string;
	tags?: string[];
	sort?: "createdAt" | "updatedAt" | "companyName" | "appliedAt" | "deadline";
	sortOrder?: "asc" | "desc";
	limit?: number;
	offset?: number;
};

export const jobApplicationService = {
	// Create a new job application
	create: async (input: CreateApplicationInput): Promise<string> => {
		const id = generateId();

		await db.transaction(async (tx) => {
			await tx.insert(schema.jobApplication).values({
				id,
				userId: input.userId,
				resumeId: input.resumeId,
				companyName: input.companyName,
				position: input.position,
				location: input.location,
				jobUrl: input.jobUrl,
				jobDescription: input.jobDescription,
				salary: input.salary,
				salaryMin: input.salaryMin,
				salaryMax: input.salaryMax,
				salaryCurrency: input.salaryCurrency,
				status: input.status ?? "saved",
				appliedAt: input.appliedAt,
				deadline: input.deadline,
				source: input.source,
				contactName: input.contactName,
				contactEmail: input.contactEmail,
				contactPhone: input.contactPhone,
				notes: input.notes,
				tags: input.tags ?? [],
				priority: input.priority ?? 0,
				isRemote: input.isRemote,
				workType: input.workType,
			});

			// Create initial activity
			await tx.insert(schema.applicationActivity).values({
				id: generateId(),
				applicationId: id,
				activityType: "created",
				description: "Application created",
				newStatus: input.status ?? "saved",
			});
		});

		return id;
	},

	// Get application by ID
	getById: async (input: { id: string; userId: string }) => {
		const [application] = await db
			.select()
			.from(schema.jobApplication)
			.where(and(eq(schema.jobApplication.id, input.id), eq(schema.jobApplication.userId, input.userId)));

		if (!application) {
			throw new ORPCError("NOT_FOUND", { message: "Application not found" });
		}

		return application;
	},

	// List applications with filters
	list: async (input: ListApplicationsInput) => {
		const conditions = [eq(schema.jobApplication.userId, input.userId)];

		if (input.status) {
			conditions.push(eq(schema.jobApplication.status, input.status));
		}

		if (input.search) {
			const searchCondition = or(
				ilike(schema.jobApplication.companyName, `%${input.search}%`),
				ilike(schema.jobApplication.position, `%${input.search}%`),
				ilike(schema.jobApplication.location, `%${input.search}%`),
			);
			if (searchCondition) conditions.push(searchCondition);
		}

		const sortColumn = {
			createdAt: schema.jobApplication.createdAt,
			updatedAt: schema.jobApplication.updatedAt,
			companyName: schema.jobApplication.companyName,
			appliedAt: schema.jobApplication.appliedAt,
			deadline: schema.jobApplication.deadline,
		}[input.sort ?? "createdAt"];

		const orderFn = input.sortOrder === "asc" ? asc : desc;

		const applications = await db
			.select()
			.from(schema.jobApplication)
			.where(and(...conditions))
			.orderBy(orderFn(sortColumn))
			.limit(input.limit ?? 50)
			.offset(input.offset ?? 0);

		return applications;
	},

	// Update application
	update: async (input: UpdateApplicationInput): Promise<void> => {
		const [existing] = await db
			.select({ status: schema.jobApplication.status })
			.from(schema.jobApplication)
			.where(and(eq(schema.jobApplication.id, input.id), eq(schema.jobApplication.userId, input.userId)));

		if (!existing) {
			throw new ORPCError("NOT_FOUND", { message: "Application not found" });
		}

		const oldStatus = existing.status;

		await db.transaction(async (tx) => {
			await tx
				.update(schema.jobApplication)
				.set({
					companyName: input.companyName,
					position: input.position,
					location: input.location,
					jobUrl: input.jobUrl,
					jobDescription: input.jobDescription,
					salary: input.salary,
					salaryMin: input.salaryMin,
					salaryMax: input.salaryMax,
					salaryCurrency: input.salaryCurrency,
					status: input.status,
					appliedAt: input.appliedAt,
					deadline: input.deadline,
					source: input.source,
					contactName: input.contactName,
					contactEmail: input.contactEmail,
					contactPhone: input.contactPhone,
					notes: input.notes,
					tags: input.tags,
					priority: input.priority,
					isRemote: input.isRemote,
					workType: input.workType,
					resumeId: input.resumeId,
				})
				.where(and(eq(schema.jobApplication.id, input.id), eq(schema.jobApplication.userId, input.userId)));

			// Log status change activity
			if (input.status && input.status !== oldStatus) {
				await tx.insert(schema.applicationActivity).values({
					id: generateId(),
					applicationId: input.id,
					activityType: "status_change",
					description: `Status changed from ${oldStatus} to ${input.status}`,
					oldStatus: oldStatus,
					newStatus: input.status,
				});
			}
		});
	},

	// Update application status
	updateStatus: async (input: { id: string; userId: string; status: ApplicationStatus }): Promise<void> => {
		const [existing] = await db
			.select({ status: schema.jobApplication.status })
			.from(schema.jobApplication)
			.where(and(eq(schema.jobApplication.id, input.id), eq(schema.jobApplication.userId, input.userId)));

		if (!existing) {
			throw new ORPCError("NOT_FOUND", { message: "Application not found" });
		}

		const updateData: Partial<typeof schema.jobApplication.$inferSelect> = {
			status: input.status,
		};

		// Set appliedAt when status changes to applied
		if (input.status === "applied" && existing.status === "saved") {
			updateData.appliedAt = new Date();
		}

		await db.transaction(async (tx) => {
			await tx
				.update(schema.jobApplication)
				.set(updateData)
				.where(and(eq(schema.jobApplication.id, input.id), eq(schema.jobApplication.userId, input.userId)));

			// Log activity
			await tx.insert(schema.applicationActivity).values({
				id: generateId(),
				applicationId: input.id,
				activityType: "status_change",
				description: `Status changed from ${existing.status} to ${input.status}`,
				oldStatus: existing.status,
				newStatus: input.status,
			});
		});
	},

	// Delete application
	delete: async (input: { id: string; userId: string }): Promise<void> => {
		await db
			.delete(schema.jobApplication)
			.where(and(eq(schema.jobApplication.id, input.id), eq(schema.jobApplication.userId, input.userId)));
	},

	// Get application statistics
	getStatistics: async (input: { userId: string }) => {
		const stats = await db
			.select({
				status: schema.jobApplication.status,
				count: sql<number>`count(*)::int`,
			})
			.from(schema.jobApplication)
			.where(eq(schema.jobApplication.userId, input.userId))
			.groupBy(schema.jobApplication.status);

		const total = stats.reduce((sum, s) => sum + s.count, 0);
		const byStatus = Object.fromEntries(stats.map((s) => [s.status, s.count]));

		// Get applications this week
		const weekAgo = new Date();
		weekAgo.setDate(weekAgo.getDate() - 7);

		const [thisWeek] = await db
			.select({ count: sql<number>`count(*)::int` })
			.from(schema.jobApplication)
			.where(and(eq(schema.jobApplication.userId, input.userId), gte(schema.jobApplication.createdAt, weekAgo)));

		// Get response rate (interviews + offers) / applied
		const applied =
			(byStatus.applied ?? 0) +
			(byStatus.phone_screen ?? 0) +
			(byStatus.interview ?? 0) +
			(byStatus.offer ?? 0) +
			(byStatus.rejected ?? 0) +
			(byStatus.accepted ?? 0);
		const responses =
			(byStatus.phone_screen ?? 0) + (byStatus.interview ?? 0) + (byStatus.offer ?? 0) + (byStatus.accepted ?? 0);
		const responseRate = applied > 0 ? Math.round((responses / applied) * 100) : 0;

		return {
			total,
			byStatus,
			thisWeek: thisWeek?.count ?? 0,
			responseRate,
		};
	},

	// Activity methods
	activity: {
		// Add activity to application
		add: async (input: {
			applicationId: string;
			activityType: string;
			description?: string;
			scheduledAt?: Date;
			metadata?: Record<string, unknown>;
		}): Promise<string> => {
			const id = generateId();

			await db.insert(schema.applicationActivity).values({
				id,
				applicationId: input.applicationId,
				activityType: input.activityType,
				description: input.description,
				scheduledAt: input.scheduledAt,
				metadata: input.metadata,
			});

			return id;
		},

		// Get activities for application
		list: async (input: { applicationId: string; limit?: number }) => {
			return await db
				.select()
				.from(schema.applicationActivity)
				.where(eq(schema.applicationActivity.applicationId, input.applicationId))
				.orderBy(desc(schema.applicationActivity.createdAt))
				.limit(input.limit ?? 50);
		},
	},
};
