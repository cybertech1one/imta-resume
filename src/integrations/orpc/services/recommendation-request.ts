import { ORPCError } from "@orpc/client";
import { and, desc, eq, sql } from "drizzle-orm";
import { schema } from "@/integrations/drizzle";
import { db } from "@/integrations/drizzle/client";
import { generateId } from "@/utils/string";

export type RecommenderType = "supervisor" | "colleague" | "professor" | "mentor" | "client";
export type RecommendationRequestStatus = "pending" | "received" | "sent";
export type ReminderFrequency = "none" | "daily" | "weekly" | "biweekly";

export type CreateRecommenderInput = {
	userId: string;
	name: string;
	email: string;
	phone?: string;
	title?: string;
	company?: string;
	relationship?: RecommenderType;
	yearsKnown?: number;
	notes?: string;
};

export type UpdateRecommenderInput = {
	id: string;
	userId: string;
	name?: string;
	email?: string;
	phone?: string;
	title?: string;
	company?: string;
	relationship?: RecommenderType;
	yearsKnown?: number;
	notes?: string;
};

export type CreateRequestInput = {
	userId: string;
	recommenderId: string;
	purpose: string;
	deadline: string;
	status?: RecommendationRequestStatus;
	requestDate: string;
	receivedDate?: string;
	sentToDate?: string;
	talkingPoints?: string[];
	followUpReminder?: ReminderFrequency;
	lastReminderSent?: string;
	notes?: string;
};

export type UpdateRequestInput = {
	id: string;
	userId: string;
	recommenderId?: string;
	purpose?: string;
	deadline?: string;
	status?: RecommendationRequestStatus;
	requestDate?: string;
	receivedDate?: string;
	sentToDate?: string;
	talkingPoints?: string[];
	followUpReminder?: ReminderFrequency;
	lastReminderSent?: string;
	notes?: string;
};

export const recommendationRequestService = {
	// ===========================
	// RECOMMENDER OPERATIONS
	// ===========================

	// Create a new recommender
	createRecommender: async (input: CreateRecommenderInput): Promise<string> => {
		const id = generateId();

		await db.insert(schema.recommender).values({
			id,
			userId: input.userId,
			name: input.name,
			email: input.email,
			phone: input.phone ?? "",
			title: input.title ?? "",
			company: input.company ?? "",
			relationship: input.relationship ?? "supervisor",
			yearsKnown: input.yearsKnown ?? 1,
			notes: input.notes ?? "",
		});

		return id;
	},

	// Get recommender by ID
	getRecommenderById: async (input: { id: string; userId: string }) => {
		const [recommender] = await db
			.select()
			.from(schema.recommender)
			.where(and(eq(schema.recommender.id, input.id), eq(schema.recommender.userId, input.userId)));

		if (!recommender) {
			throw new ORPCError("NOT_FOUND", { message: "Recommender not found" });
		}

		return recommender;
	},

	// List all recommenders for a user
	listRecommenders: async (input: {
		userId: string;
		relationship?: RecommenderType;
		limit?: number;
		offset?: number;
	}) => {
		const conditions = [eq(schema.recommender.userId, input.userId)];

		if (input.relationship) {
			conditions.push(eq(schema.recommender.relationship, input.relationship));
		}

		return await db
			.select()
			.from(schema.recommender)
			.where(and(...conditions))
			.orderBy(desc(schema.recommender.createdAt))
			.limit(input.limit ?? 100)
			.offset(input.offset ?? 0);
	},

	// Update a recommender
	updateRecommender: async (input: UpdateRecommenderInput): Promise<void> => {
		const [existing] = await db
			.select({ id: schema.recommender.id })
			.from(schema.recommender)
			.where(and(eq(schema.recommender.id, input.id), eq(schema.recommender.userId, input.userId)));

		if (!existing) {
			throw new ORPCError("NOT_FOUND", { message: "Recommender not found" });
		}

		await db
			.update(schema.recommender)
			.set({
				name: input.name,
				email: input.email,
				phone: input.phone,
				title: input.title,
				company: input.company,
				relationship: input.relationship,
				yearsKnown: input.yearsKnown,
				notes: input.notes,
			})
			.where(and(eq(schema.recommender.id, input.id), eq(schema.recommender.userId, input.userId)));
	},

	// Delete a recommender
	deleteRecommender: async (input: { id: string; userId: string }): Promise<void> => {
		// Check if recommender has any associated requests
		const [hasRequests] = await db
			.select({ count: sql<number>`count(*)::int` })
			.from(schema.recommendationRequest)
			.where(eq(schema.recommendationRequest.recommenderId, input.id));

		if (hasRequests && hasRequests.count > 0) {
			throw new ORPCError("BAD_REQUEST", { message: "Cannot delete recommender with associated requests" });
		}

		await db
			.delete(schema.recommender)
			.where(and(eq(schema.recommender.id, input.id), eq(schema.recommender.userId, input.userId)));
	},

	// ===========================
	// REQUEST OPERATIONS
	// ===========================

	// Create a new recommendation request
	createRequest: async (input: CreateRequestInput): Promise<string> => {
		const id = generateId();

		await db.insert(schema.recommendationRequest).values({
			id,
			userId: input.userId,
			recommenderId: input.recommenderId,
			purpose: input.purpose,
			deadline: input.deadline,
			status: input.status ?? "pending",
			requestDate: input.requestDate,
			receivedDate: input.receivedDate,
			sentToDate: input.sentToDate,
			talkingPoints: input.talkingPoints ?? [],
			followUpReminder: input.followUpReminder ?? "weekly",
			lastReminderSent: input.lastReminderSent,
			notes: input.notes ?? "",
		});

		return id;
	},

	// Get request by ID with recommender info
	getRequestById: async (input: { id: string; userId: string }) => {
		const [request] = await db
			.select()
			.from(schema.recommendationRequest)
			.where(and(eq(schema.recommendationRequest.id, input.id), eq(schema.recommendationRequest.userId, input.userId)));

		if (!request) {
			throw new ORPCError("NOT_FOUND", { message: "Request not found" });
		}

		// Get recommender info
		const [recommender] = await db
			.select()
			.from(schema.recommender)
			.where(eq(schema.recommender.id, request.recommenderId));

		return { ...request, recommender };
	},

	// List all requests for a user
	listRequests: async (input: {
		userId: string;
		status?: RecommendationRequestStatus;
		limit?: number;
		offset?: number;
	}) => {
		const conditions = [eq(schema.recommendationRequest.userId, input.userId)];

		if (input.status) {
			conditions.push(eq(schema.recommendationRequest.status, input.status));
		}

		return await db
			.select()
			.from(schema.recommendationRequest)
			.where(and(...conditions))
			.orderBy(desc(schema.recommendationRequest.createdAt))
			.limit(input.limit ?? 100)
			.offset(input.offset ?? 0);
	},

	// Update a request
	updateRequest: async (input: UpdateRequestInput): Promise<void> => {
		const [existing] = await db
			.select({ id: schema.recommendationRequest.id })
			.from(schema.recommendationRequest)
			.where(and(eq(schema.recommendationRequest.id, input.id), eq(schema.recommendationRequest.userId, input.userId)));

		if (!existing) {
			throw new ORPCError("NOT_FOUND", { message: "Request not found" });
		}

		await db
			.update(schema.recommendationRequest)
			.set({
				recommenderId: input.recommenderId,
				purpose: input.purpose,
				deadline: input.deadline,
				status: input.status,
				requestDate: input.requestDate,
				receivedDate: input.receivedDate,
				sentToDate: input.sentToDate,
				talkingPoints: input.talkingPoints,
				followUpReminder: input.followUpReminder,
				lastReminderSent: input.lastReminderSent,
				notes: input.notes,
			})
			.where(and(eq(schema.recommendationRequest.id, input.id), eq(schema.recommendationRequest.userId, input.userId)));
	},

	// Update request status
	updateRequestStatus: async (input: {
		id: string;
		userId: string;
		status: RecommendationRequestStatus;
	}): Promise<void> => {
		const [existing] = await db
			.select()
			.from(schema.recommendationRequest)
			.where(and(eq(schema.recommendationRequest.id, input.id), eq(schema.recommendationRequest.userId, input.userId)));

		if (!existing) {
			throw new ORPCError("NOT_FOUND", { message: "Request not found" });
		}

		const updates: Partial<{
			status: RecommendationRequestStatus;
			receivedDate: string;
			sentToDate: string;
		}> = { status: input.status };

		// Auto-set dates based on status change
		const today = new Date().toISOString().split("T")[0];
		if (input.status === "received" && !existing.receivedDate) {
			updates.receivedDate = today;
		}
		if (input.status === "sent" && !existing.sentToDate) {
			updates.sentToDate = today;
		}

		await db
			.update(schema.recommendationRequest)
			.set(updates)
			.where(and(eq(schema.recommendationRequest.id, input.id), eq(schema.recommendationRequest.userId, input.userId)));
	},

	// Delete a request
	deleteRequest: async (input: { id: string; userId: string }): Promise<void> => {
		await db
			.delete(schema.recommendationRequest)
			.where(and(eq(schema.recommendationRequest.id, input.id), eq(schema.recommendationRequest.userId, input.userId)));
	},

	// ===========================
	// STATISTICS
	// ===========================

	// Get statistics for the user's recommendation requests
	getStatistics: async (input: { userId: string }) => {
		const requests = await db
			.select()
			.from(schema.recommendationRequest)
			.where(eq(schema.recommendationRequest.userId, input.userId));

		const total = requests.length;
		const pending = requests.filter((r) => r.status === "pending").length;
		const received = requests.filter((r) => r.status === "received").length;
		const sent = requests.filter((r) => r.status === "sent").length;

		// Calculate urgent (pending requests with deadline within 7 days)
		const today = new Date();
		const sevenDaysFromNow = new Date();
		sevenDaysFromNow.setDate(today.getDate() + 7);

		const urgent = requests.filter((r) => {
			if (r.status !== "pending") return false;
			const deadline = new Date(r.deadline);
			return deadline >= today && deadline <= sevenDaysFromNow;
		}).length;

		// Count recommenders
		const [recommendersCount] = await db
			.select({ count: sql<number>`count(*)::int` })
			.from(schema.recommender)
			.where(eq(schema.recommender.userId, input.userId));

		return {
			total,
			pending,
			received,
			sent,
			urgent,
			recommenders: recommendersCount?.count ?? 0,
		};
	},

	// Get pending requests needing follow-up
	getPendingFollowUps: async (input: { userId: string }) => {
		const today = new Date();

		// Get requests that are pending and have follow-up reminders enabled
		const requests = await db
			.select()
			.from(schema.recommendationRequest)
			.where(
				and(eq(schema.recommendationRequest.userId, input.userId), eq(schema.recommendationRequest.status, "pending")),
			);

		return requests.filter((r) => {
			if (r.followUpReminder === "none") return false;
			if (!r.lastReminderSent) return true;

			const lastReminder = new Date(r.lastReminderSent);
			const daysSinceReminder = Math.floor((today.getTime() - lastReminder.getTime()) / (1000 * 60 * 60 * 24));

			switch (r.followUpReminder) {
				case "daily":
					return daysSinceReminder >= 1;
				case "weekly":
					return daysSinceReminder >= 7;
				case "biweekly":
					return daysSinceReminder >= 14;
				default:
					return false;
			}
		});
	},
};
