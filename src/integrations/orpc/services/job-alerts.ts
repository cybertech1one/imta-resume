import { ORPCError } from "@orpc/client";
import { and, desc, eq, inArray, sql } from "drizzle-orm";
import { schema } from "@/integrations/drizzle";
import { db } from "@/integrations/drizzle/client";
import { generateId } from "@/utils/string";

export type AlertFrequency = "instant" | "daily" | "weekly";
export type AlertWorkPreference = "remote" | "hybrid" | "onsite" | "any";
export type AlertStatus = "active" | "paused";
export type MatchQuality = "excellent" | "good" | "fair";

export type CreateAlertInput = {
	userId: string;
	name: string;
	keywords: string[];
	locations: string[];
	salaryMin: number;
	salaryMax: number;
	industries: string[];
	companySizes: string[];
	workPreference: AlertWorkPreference;
	frequency: AlertFrequency;
};

export type UpdateAlertInput = {
	id: string;
	userId: string;
	name?: string;
	keywords?: string[];
	locations?: string[];
	salaryMin?: number;
	salaryMax?: number;
	industries?: string[];
	companySizes?: string[];
	workPreference?: AlertWorkPreference;
	frequency?: AlertFrequency;
	status?: AlertStatus;
};

export type CreateMatchInput = {
	alertId: string;
	jobId: string;
	jobTitle: string;
	company: string;
	location?: string;
	salary?: string;
	matchScore: number;
	matchQuality: MatchQuality;
	matchedKeywords: string[];
	postedDate?: string;
	isDuplicate?: boolean;
	duplicateOf?: string;
};

export const jobAlertService = {
	// Create a new job alert
	create: async (input: CreateAlertInput): Promise<string> => {
		const id = generateId();

		await db.insert(schema.jobAlert).values({
			id,
			userId: input.userId,
			name: input.name,
			keywords: input.keywords,
			locations: input.locations,
			salaryMin: input.salaryMin,
			salaryMax: input.salaryMax,
			industries: input.industries,
			companySizes: input.companySizes,
			workPreference: input.workPreference,
			frequency: input.frequency,
			status: "active",
		});

		return id;
	},

	// Get alert by ID
	getById: async (input: { id: string; userId: string }) => {
		const [alert] = await db
			.select()
			.from(schema.jobAlert)
			.where(and(eq(schema.jobAlert.id, input.id), eq(schema.jobAlert.userId, input.userId)));

		if (!alert) {
			throw new ORPCError("NOT_FOUND", { message: "Alert not found" });
		}

		return alert;
	},

	// List all alerts for a user
	list: async (input: { userId: string; status?: AlertStatus }) => {
		const conditions = [eq(schema.jobAlert.userId, input.userId)];

		if (input.status) {
			conditions.push(eq(schema.jobAlert.status, input.status));
		}

		return await db
			.select()
			.from(schema.jobAlert)
			.where(and(...conditions))
			.orderBy(desc(schema.jobAlert.createdAt));
	},

	// Update alert
	update: async (input: UpdateAlertInput): Promise<void> => {
		const [existing] = await db
			.select({ id: schema.jobAlert.id })
			.from(schema.jobAlert)
			.where(and(eq(schema.jobAlert.id, input.id), eq(schema.jobAlert.userId, input.userId)));

		if (!existing) {
			throw new ORPCError("NOT_FOUND", { message: "Alert not found" });
		}

		await db
			.update(schema.jobAlert)
			.set({
				name: input.name,
				keywords: input.keywords,
				locations: input.locations,
				salaryMin: input.salaryMin,
				salaryMax: input.salaryMax,
				industries: input.industries,
				companySizes: input.companySizes,
				workPreference: input.workPreference,
				frequency: input.frequency,
				status: input.status,
			})
			.where(and(eq(schema.jobAlert.id, input.id), eq(schema.jobAlert.userId, input.userId)));
	},

	// Toggle alert status
	toggleStatus: async (input: { id: string; userId: string }): Promise<AlertStatus> => {
		const [existing] = await db
			.select({ status: schema.jobAlert.status })
			.from(schema.jobAlert)
			.where(and(eq(schema.jobAlert.id, input.id), eq(schema.jobAlert.userId, input.userId)));

		if (!existing) {
			throw new ORPCError("NOT_FOUND", { message: "Alert not found" });
		}

		const newStatus: AlertStatus = existing.status === "active" ? "paused" : "active";

		await db
			.update(schema.jobAlert)
			.set({ status: newStatus })
			.where(and(eq(schema.jobAlert.id, input.id), eq(schema.jobAlert.userId, input.userId)));

		return newStatus;
	},

	// Delete alert
	delete: async (input: { id: string; userId: string }): Promise<void> => {
		// Matches will be deleted via cascade
		await db
			.delete(schema.jobAlert)
			.where(and(eq(schema.jobAlert.id, input.id), eq(schema.jobAlert.userId, input.userId)));
	},

	// Get statistics for a user's alerts
	getStatistics: async (input: { userId: string }) => {
		const alerts = await db.select().from(schema.jobAlert).where(eq(schema.jobAlert.userId, input.userId));

		const totalAlerts = alerts.length;
		const activeAlerts = alerts.filter((a) => a.status === "active").length;

		// Get total matches across all alerts
		const alertIds = alerts.map((a) => a.id);
		let totalMatches = 0;
		let appliedFromAlerts = 0;
		let totalMatchScore = 0;
		let matchCount = 0;

		if (alertIds.length > 0) {
			const allMatches = await db
				.select()
				.from(schema.jobAlertMatch)
				.where(inArray(schema.jobAlertMatch.alertId, alertIds));

			totalMatches = allMatches.length;
			appliedFromAlerts = allMatches.filter((m) => m.isApplied).length;
			for (const match of allMatches) {
				totalMatchScore += match.matchScore;
				matchCount++;
			}
		}

		const avgMatchScore = matchCount > 0 ? Math.round(totalMatchScore / matchCount) : 0;

		// Find top performing alert (most matches)
		let topPerformingAlert = "-";
		if (alerts.length > 0) {
			const alertWithMostMatches = alerts.reduce(
				(max, alert) => (alert.matchCount > max.matchCount ? alert : max),
				alerts[0],
			);
			topPerformingAlert = alertWithMostMatches.name;
		}

		return {
			totalAlerts,
			activeAlerts,
			totalMatches,
			appliedFromAlerts,
			avgMatchScore,
			topPerformingAlert,
		};
	},

	// Match operations
	match: {
		// Create a new match
		create: async (input: CreateMatchInput): Promise<string> => {
			const id = generateId();
			const today = new Date().toISOString().split("T")[0];

			await db.insert(schema.jobAlertMatch).values({
				id,
				alertId: input.alertId,
				jobId: input.jobId,
				jobTitle: input.jobTitle,
				company: input.company,
				location: input.location,
				salary: input.salary,
				matchScore: input.matchScore,
				matchQuality: input.matchQuality,
				matchedKeywords: input.matchedKeywords,
				postedDate: input.postedDate,
				matchedDate: today,
				isDuplicate: input.isDuplicate ?? false,
				duplicateOf: input.duplicateOf,
			});

			// Update alert match count and last triggered
			await db
				.update(schema.jobAlert)
				.set({
					matchCount: sql`${schema.jobAlert.matchCount} + 1`,
					lastTriggered: new Date(),
				})
				.where(eq(schema.jobAlert.id, input.alertId));

			return id;
		},

		// List matches for alerts belonging to a user
		list: async (input: {
			userId: string;
			alertId?: string;
			matchQuality?: MatchQuality;
			showDuplicates?: boolean;
			limit?: number;
			offset?: number;
		}) => {
			// First get the user's alert IDs
			const userAlerts = await db
				.select({ id: schema.jobAlert.id })
				.from(schema.jobAlert)
				.where(eq(schema.jobAlert.userId, input.userId));

			const alertIds = userAlerts.map((a) => a.id);

			if (alertIds.length === 0) {
				return [];
			}

			// Build conditions
			const conditions = [];

			if (input.alertId) {
				// Make sure the alert belongs to the user
				if (!alertIds.includes(input.alertId)) {
					return [];
				}
				conditions.push(eq(schema.jobAlertMatch.alertId, input.alertId));
			} else {
				conditions.push(inArray(schema.jobAlertMatch.alertId, alertIds));
			}

			if (input.matchQuality) {
				conditions.push(eq(schema.jobAlertMatch.matchQuality, input.matchQuality));
			}

			if (!input.showDuplicates) {
				conditions.push(eq(schema.jobAlertMatch.isDuplicate, false));
			}

			return await db
				.select()
				.from(schema.jobAlertMatch)
				.where(and(...conditions))
				.orderBy(desc(schema.jobAlertMatch.matchedDate), desc(schema.jobAlertMatch.createdAt))
				.limit(input.limit ?? 100)
				.offset(input.offset ?? 0);
		},

		// Mark match as viewed
		markViewed: async (input: { id: string; alertId: string; userId: string }): Promise<void> => {
			// Verify the alert belongs to the user
			const [alert] = await db
				.select({ id: schema.jobAlert.id })
				.from(schema.jobAlert)
				.where(and(eq(schema.jobAlert.id, input.alertId), eq(schema.jobAlert.userId, input.userId)));

			if (!alert) {
				throw new ORPCError("NOT_FOUND", { message: "Alert not found" });
			}

			const [match] = await db
				.select({ isViewed: schema.jobAlertMatch.isViewed })
				.from(schema.jobAlertMatch)
				.where(and(eq(schema.jobAlertMatch.id, input.id), eq(schema.jobAlertMatch.alertId, input.alertId)));

			if (!match) {
				throw new ORPCError("NOT_FOUND", { message: "Match not found" });
			}

			if (!match.isViewed) {
				await db.update(schema.jobAlertMatch).set({ isViewed: true }).where(eq(schema.jobAlertMatch.id, input.id));

				// Update alert viewed count
				await db
					.update(schema.jobAlert)
					.set({ viewedCount: sql`${schema.jobAlert.viewedCount} + 1` })
					.where(eq(schema.jobAlert.id, input.alertId));
			}
		},

		// Mark match as applied
		markApplied: async (input: { id: string; alertId: string; userId: string }): Promise<void> => {
			// Verify the alert belongs to the user
			const [alert] = await db
				.select({ id: schema.jobAlert.id })
				.from(schema.jobAlert)
				.where(and(eq(schema.jobAlert.id, input.alertId), eq(schema.jobAlert.userId, input.userId)));

			if (!alert) {
				throw new ORPCError("NOT_FOUND", { message: "Alert not found" });
			}

			const [match] = await db
				.select({ isApplied: schema.jobAlertMatch.isApplied, isViewed: schema.jobAlertMatch.isViewed })
				.from(schema.jobAlertMatch)
				.where(and(eq(schema.jobAlertMatch.id, input.id), eq(schema.jobAlertMatch.alertId, input.alertId)));

			if (!match) {
				throw new ORPCError("NOT_FOUND", { message: "Match not found" });
			}

			if (!match.isApplied) {
				await db
					.update(schema.jobAlertMatch)
					.set({ isApplied: true, isViewed: true })
					.where(eq(schema.jobAlertMatch.id, input.id));

				// Update alert counts
				const updateData: { appliedCount: ReturnType<typeof sql>; viewedCount?: ReturnType<typeof sql> } = {
					appliedCount: sql`${schema.jobAlert.appliedCount} + 1`,
				};
				if (!match.isViewed) {
					updateData.viewedCount = sql`${schema.jobAlert.viewedCount} + 1`;
				}

				await db.update(schema.jobAlert).set(updateData).where(eq(schema.jobAlert.id, input.alertId));
			}
		},

		// Delete a match
		delete: async (input: { id: string; alertId: string; userId: string }): Promise<void> => {
			// Verify the alert belongs to the user
			const [alert] = await db
				.select({ id: schema.jobAlert.id })
				.from(schema.jobAlert)
				.where(and(eq(schema.jobAlert.id, input.alertId), eq(schema.jobAlert.userId, input.userId)));

			if (!alert) {
				throw new ORPCError("NOT_FOUND", { message: "Alert not found" });
			}

			await db
				.delete(schema.jobAlertMatch)
				.where(and(eq(schema.jobAlertMatch.id, input.id), eq(schema.jobAlertMatch.alertId, input.alertId)));

			// Decrement alert match count
			await db
				.update(schema.jobAlert)
				.set({ matchCount: sql`GREATEST(${schema.jobAlert.matchCount} - 1, 0)` })
				.where(eq(schema.jobAlert.id, input.alertId));
		},
	},
};
