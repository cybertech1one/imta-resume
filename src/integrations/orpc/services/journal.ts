import { ORPCError } from "@orpc/client";
import { and, desc, eq, gte, lte } from "drizzle-orm";
import { schema } from "@/integrations/drizzle";
import { db } from "@/integrations/drizzle/client";
import { generateId } from "@/utils/string";

export type MoodType = "great" | "good" | "neutral" | "frustrated" | "stressed";

export type CreateJournalEntryInput = {
	userId: string;
	date: string; // YYYY-MM-DD format
	title?: string;
	content?: string;
	mood?: MoodType;
	applicationsSubmitted?: number;
	interviewsCompleted?: number;
	networkingActivities?: number;
	wins?: string[];
	challenges?: string[];
	learnings?: string[];
	tomorrowGoals?: string[];
	tags?: string[];
};

export type UpdateJournalEntryInput = {
	id: string;
	userId: string;
	title?: string;
	content?: string;
	mood?: MoodType;
	applicationsSubmitted?: number;
	interviewsCompleted?: number;
	networkingActivities?: number;
	wins?: string[];
	challenges?: string[];
	learnings?: string[];
	tomorrowGoals?: string[];
	tags?: string[];
};

export const journalService = {
	// Create a new journal entry
	create: async (input: CreateJournalEntryInput): Promise<string> => {
		const id = generateId();

		try {
			await db.insert(schema.journalEntry).values({
				id,
				userId: input.userId,
				date: input.date,
				title: input.title,
				content: input.content,
				mood: input.mood,
				applicationsSubmitted: input.applicationsSubmitted ?? 0,
				interviewsCompleted: input.interviewsCompleted ?? 0,
				networkingActivities: input.networkingActivities ?? 0,
				wins: input.wins ?? [],
				challenges: input.challenges ?? [],
				learnings: input.learnings ?? [],
				tomorrowGoals: input.tomorrowGoals ?? [],
				tags: input.tags ?? [],
			});

			return id;
		} catch (error: unknown) {
			// Check for unique constraint violation (already exists for this date)
			if (error && typeof error === "object" && "code" in error && error.code === "23505") {
				throw new ORPCError("CONFLICT", { message: "Journal entry already exists for this date" });
			}
			throw error;
		}
	},

	// Get journal entry by ID
	getById: async (input: { id: string; userId: string }) => {
		const [entry] = await db
			.select()
			.from(schema.journalEntry)
			.where(and(eq(schema.journalEntry.id, input.id), eq(schema.journalEntry.userId, input.userId)));

		if (!entry) {
			throw new ORPCError("NOT_FOUND", { message: "Journal entry not found" });
		}

		return entry;
	},

	// Get journal entry by date
	getByDate: async (input: { userId: string; date: string }) => {
		const [entry] = await db
			.select()
			.from(schema.journalEntry)
			.where(and(eq(schema.journalEntry.userId, input.userId), eq(schema.journalEntry.date, input.date)));

		return entry ?? null;
	},

	// List journal entries
	list: async (input: {
		userId: string;
		startDate?: string;
		endDate?: string;
		mood?: MoodType;
		limit?: number;
		offset?: number;
	}) => {
		const conditions = [eq(schema.journalEntry.userId, input.userId)];

		if (input.startDate) {
			conditions.push(gte(schema.journalEntry.date, input.startDate));
		}

		if (input.endDate) {
			conditions.push(lte(schema.journalEntry.date, input.endDate));
		}

		if (input.mood) {
			conditions.push(eq(schema.journalEntry.mood, input.mood));
		}

		return await db
			.select()
			.from(schema.journalEntry)
			.where(and(...conditions))
			.orderBy(desc(schema.journalEntry.date))
			.limit(input.limit ?? 30)
			.offset(input.offset ?? 0);
	},

	// Update journal entry
	update: async (input: UpdateJournalEntryInput): Promise<void> => {
		const [existing] = await db
			.select({ id: schema.journalEntry.id })
			.from(schema.journalEntry)
			.where(and(eq(schema.journalEntry.id, input.id), eq(schema.journalEntry.userId, input.userId)));

		if (!existing) {
			throw new ORPCError("NOT_FOUND", { message: "Journal entry not found" });
		}

		await db
			.update(schema.journalEntry)
			.set({
				title: input.title,
				content: input.content,
				mood: input.mood,
				applicationsSubmitted: input.applicationsSubmitted,
				interviewsCompleted: input.interviewsCompleted,
				networkingActivities: input.networkingActivities,
				wins: input.wins,
				challenges: input.challenges,
				learnings: input.learnings,
				tomorrowGoals: input.tomorrowGoals,
				tags: input.tags,
			})
			.where(and(eq(schema.journalEntry.id, input.id), eq(schema.journalEntry.userId, input.userId)));
	},

	// Upsert - create or update for a specific date
	upsert: async (input: CreateJournalEntryInput): Promise<string> => {
		const existing = await journalService.getByDate({ userId: input.userId, date: input.date });

		if (existing) {
			await journalService.update({
				id: existing.id,
				userId: input.userId,
				title: input.title,
				content: input.content,
				mood: input.mood,
				applicationsSubmitted: input.applicationsSubmitted,
				interviewsCompleted: input.interviewsCompleted,
				networkingActivities: input.networkingActivities,
				wins: input.wins,
				challenges: input.challenges,
				learnings: input.learnings,
				tomorrowGoals: input.tomorrowGoals,
				tags: input.tags,
			});
			return existing.id;
		}

		return await journalService.create(input);
	},

	// Delete journal entry
	delete: async (input: { id: string; userId: string }): Promise<void> => {
		await db
			.delete(schema.journalEntry)
			.where(and(eq(schema.journalEntry.id, input.id), eq(schema.journalEntry.userId, input.userId)));
	},

	// Get statistics and analytics
	getStatistics: async (input: { userId: string; days?: number }) => {
		const daysToLook = input.days ?? 30;
		const startDate = new Date();
		startDate.setDate(startDate.getDate() - daysToLook);
		const startDateStr = startDate.toISOString().split("T")[0];

		const entries = await db
			.select()
			.from(schema.journalEntry)
			.where(and(eq(schema.journalEntry.userId, input.userId), gte(schema.journalEntry.date, startDateStr)))
			.orderBy(desc(schema.journalEntry.date));

		// Calculate totals
		const totalApplications = entries.reduce((sum, e) => sum + (e.applicationsSubmitted ?? 0), 0);
		const totalInterviews = entries.reduce((sum, e) => sum + (e.interviewsCompleted ?? 0), 0);
		const totalNetworking = entries.reduce((sum, e) => sum + (e.networkingActivities ?? 0), 0);

		// Mood distribution
		const moodCounts: Record<string, number> = {};
		for (const entry of entries) {
			if (entry.mood) {
				moodCounts[entry.mood] = (moodCounts[entry.mood] ?? 0) + 1;
			}
		}

		// Calculate streak
		let streak = 0;
		const today = new Date().toISOString().split("T")[0];
		const sortedDates = entries
			.map((e) => e.date)
			.sort()
			.reverse();

		if (sortedDates.length > 0) {
			const checkDate = new Date(today);
			for (let i = 0; i < sortedDates.length; i++) {
				const expectedDate = checkDate.toISOString().split("T")[0];
				if (sortedDates.includes(expectedDate)) {
					streak++;
					checkDate.setDate(checkDate.getDate() - 1);
				} else if (i === 0 && expectedDate !== sortedDates[0]) {
					// Today doesn't have an entry, check yesterday
					checkDate.setDate(checkDate.getDate() - 1);
					if (sortedDates.includes(checkDate.toISOString().split("T")[0])) {
						streak = 1;
						checkDate.setDate(checkDate.getDate() - 1);
					}
				} else {
					break;
				}
			}
		}

		// Activity by day
		const activityByDay = entries.map((e) => ({
			date: e.date,
			applications: e.applicationsSubmitted ?? 0,
			interviews: e.interviewsCompleted ?? 0,
			networking: e.networkingActivities ?? 0,
		}));

		return {
			totalEntries: entries.length,
			totalApplications,
			totalInterviews,
			totalNetworking,
			moodDistribution: moodCounts,
			streak,
			activityByDay,
			averageApplicationsPerDay: entries.length > 0 ? Math.round((totalApplications / entries.length) * 10) / 10 : 0,
		};
	},
};
