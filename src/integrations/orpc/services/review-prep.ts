import { ORPCError } from "@orpc/client";
import { and, desc, eq } from "drizzle-orm";
import { schema } from "@/integrations/drizzle";
import { db } from "@/integrations/drizzle/client";
import { generateId } from "@/utils/string";

// ============================================================================
// Accomplishments
// ============================================================================

export type CreateAccomplishmentInput = {
	userId: string;
	date: string;
	title: string;
	description: string;
	category: "project" | "achievement" | "skill" | "recognition" | "improvement";
	impact: "high" | "medium" | "low";
	metrics?: string;
};

export type UpdateAccomplishmentInput = {
	id: string;
	userId: string;
	date?: string;
	title?: string;
	description?: string;
	category?: "project" | "achievement" | "skill" | "recognition" | "improvement";
	impact?: "high" | "medium" | "low";
	metrics?: string;
};

export const accomplishmentService = {
	create: async (input: CreateAccomplishmentInput): Promise<string> => {
		const id = generateId();

		await db.insert(schema.reviewAccomplishment).values({
			id,
			userId: input.userId,
			date: input.date,
			title: input.title,
			description: input.description,
			category: input.category,
			impact: input.impact,
			metrics: input.metrics,
		});

		return id;
	},

	getById: async (input: { id: string; userId: string }) => {
		const [accomplishment] = await db
			.select()
			.from(schema.reviewAccomplishment)
			.where(and(eq(schema.reviewAccomplishment.id, input.id), eq(schema.reviewAccomplishment.userId, input.userId)));

		if (!accomplishment) {
			throw new ORPCError("NOT_FOUND", { message: "Accomplishment not found" });
		}

		return accomplishment;
	},

	list: async (input: { userId: string }) => {
		return await db
			.select()
			.from(schema.reviewAccomplishment)
			.where(eq(schema.reviewAccomplishment.userId, input.userId))
			.orderBy(desc(schema.reviewAccomplishment.date));
	},

	update: async (input: UpdateAccomplishmentInput): Promise<void> => {
		const [existing] = await db
			.select({ id: schema.reviewAccomplishment.id })
			.from(schema.reviewAccomplishment)
			.where(and(eq(schema.reviewAccomplishment.id, input.id), eq(schema.reviewAccomplishment.userId, input.userId)));

		if (!existing) {
			throw new ORPCError("NOT_FOUND", { message: "Accomplishment not found" });
		}

		await db
			.update(schema.reviewAccomplishment)
			.set({
				date: input.date,
				title: input.title,
				description: input.description,
				category: input.category,
				impact: input.impact,
				metrics: input.metrics,
			})
			.where(and(eq(schema.reviewAccomplishment.id, input.id), eq(schema.reviewAccomplishment.userId, input.userId)));
	},

	delete: async (input: { id: string; userId: string }): Promise<void> => {
		await db
			.delete(schema.reviewAccomplishment)
			.where(and(eq(schema.reviewAccomplishment.id, input.id), eq(schema.reviewAccomplishment.userId, input.userId)));
	},
};

// ============================================================================
// Goals
// ============================================================================

export type ReviewGoalMilestone = {
	title: string;
	completed: boolean;
};

export type CreateGoalInput = {
	userId: string;
	title: string;
	description: string;
	category: "performance" | "development" | "career" | "collaboration";
	targetDate: string;
	progress?: number;
	status?: "on_track" | "at_risk" | "completed" | "not_started";
	milestones?: ReviewGoalMilestone[];
};

export type UpdateGoalInput = {
	id: string;
	userId: string;
	title?: string;
	description?: string;
	category?: "performance" | "development" | "career" | "collaboration";
	targetDate?: string;
	progress?: number;
	status?: "on_track" | "at_risk" | "completed" | "not_started";
	milestones?: ReviewGoalMilestone[];
};

export const goalService = {
	create: async (input: CreateGoalInput): Promise<string> => {
		const id = generateId();

		await db.insert(schema.reviewGoal).values({
			id,
			userId: input.userId,
			title: input.title,
			description: input.description,
			category: input.category,
			targetDate: input.targetDate,
			progress: input.progress ?? 0,
			status: input.status ?? "not_started",
			milestones: input.milestones ?? [],
		});

		return id;
	},

	getById: async (input: { id: string; userId: string }) => {
		const [goal] = await db
			.select()
			.from(schema.reviewGoal)
			.where(and(eq(schema.reviewGoal.id, input.id), eq(schema.reviewGoal.userId, input.userId)));

		if (!goal) {
			throw new ORPCError("NOT_FOUND", { message: "Goal not found" });
		}

		return goal;
	},

	list: async (input: { userId: string }) => {
		return await db
			.select()
			.from(schema.reviewGoal)
			.where(eq(schema.reviewGoal.userId, input.userId))
			.orderBy(desc(schema.reviewGoal.targetDate));
	},

	update: async (input: UpdateGoalInput): Promise<void> => {
		const [existing] = await db
			.select({ id: schema.reviewGoal.id })
			.from(schema.reviewGoal)
			.where(and(eq(schema.reviewGoal.id, input.id), eq(schema.reviewGoal.userId, input.userId)));

		if (!existing) {
			throw new ORPCError("NOT_FOUND", { message: "Goal not found" });
		}

		await db
			.update(schema.reviewGoal)
			.set({
				title: input.title,
				description: input.description,
				category: input.category,
				targetDate: input.targetDate,
				progress: input.progress,
				status: input.status,
				milestones: input.milestones,
			})
			.where(and(eq(schema.reviewGoal.id, input.id), eq(schema.reviewGoal.userId, input.userId)));
	},

	delete: async (input: { id: string; userId: string }): Promise<void> => {
		await db
			.delete(schema.reviewGoal)
			.where(and(eq(schema.reviewGoal.id, input.id), eq(schema.reviewGoal.userId, input.userId)));
	},
};

// ============================================================================
// Salary Research
// ============================================================================

export type CreateSalaryResearchInput = {
	userId: string;
	role: string;
	level: string;
	minSalary: number;
	maxSalary: number;
	avgSalary: number;
	marketTrend: "up" | "stable" | "down";
	source: string;
	lastUpdated: string;
};

export type UpdateSalaryResearchInput = {
	id: string;
	userId: string;
	role?: string;
	level?: string;
	minSalary?: number;
	maxSalary?: number;
	avgSalary?: number;
	marketTrend?: "up" | "stable" | "down";
	source?: string;
	lastUpdated?: string;
};

export const salaryResearchService = {
	create: async (input: CreateSalaryResearchInput): Promise<string> => {
		const id = generateId();

		await db.insert(schema.salaryResearch).values({
			id,
			userId: input.userId,
			role: input.role,
			level: input.level,
			minSalary: input.minSalary,
			maxSalary: input.maxSalary,
			avgSalary: input.avgSalary,
			marketTrend: input.marketTrend,
			source: input.source,
			lastUpdated: input.lastUpdated,
		});

		return id;
	},

	getById: async (input: { id: string; userId: string }) => {
		const [research] = await db
			.select()
			.from(schema.salaryResearch)
			.where(and(eq(schema.salaryResearch.id, input.id), eq(schema.salaryResearch.userId, input.userId)));

		if (!research) {
			throw new ORPCError("NOT_FOUND", { message: "Salary research not found" });
		}

		return research;
	},

	list: async (input: { userId: string }) => {
		return await db
			.select()
			.from(schema.salaryResearch)
			.where(eq(schema.salaryResearch.userId, input.userId))
			.orderBy(desc(schema.salaryResearch.createdAt));
	},

	update: async (input: UpdateSalaryResearchInput): Promise<void> => {
		const [existing] = await db
			.select({ id: schema.salaryResearch.id })
			.from(schema.salaryResearch)
			.where(and(eq(schema.salaryResearch.id, input.id), eq(schema.salaryResearch.userId, input.userId)));

		if (!existing) {
			throw new ORPCError("NOT_FOUND", { message: "Salary research not found" });
		}

		await db
			.update(schema.salaryResearch)
			.set({
				role: input.role,
				level: input.level,
				minSalary: input.minSalary,
				maxSalary: input.maxSalary,
				avgSalary: input.avgSalary,
				marketTrend: input.marketTrend,
				source: input.source,
				lastUpdated: input.lastUpdated,
			})
			.where(and(eq(schema.salaryResearch.id, input.id), eq(schema.salaryResearch.userId, input.userId)));
	},

	delete: async (input: { id: string; userId: string }): Promise<void> => {
		await db
			.delete(schema.salaryResearch)
			.where(and(eq(schema.salaryResearch.id, input.id), eq(schema.salaryResearch.userId, input.userId)));
	},
};

// ============================================================================
// Review Prep User Data Service (Assessment, Timeline, Salary)
// ============================================================================

export const reviewPrepDataService = {
	async get(userId: string, dataType: string) {
		const [result] = await db
			.select()
			.from(schema.reviewPrepUserData)
			.where(and(eq(schema.reviewPrepUserData.userId, userId), eq(schema.reviewPrepUserData.dataType, dataType)));
		return result?.data ?? null;
	},

	async upsert(userId: string, dataType: string, data: Record<string, unknown>) {
		const existing = await db
			.select()
			.from(schema.reviewPrepUserData)
			.where(and(eq(schema.reviewPrepUserData.userId, userId), eq(schema.reviewPrepUserData.dataType, dataType)));

		if (existing.length > 0) {
			const [updated] = await db
				.update(schema.reviewPrepUserData)
				.set({ data })
				.where(and(eq(schema.reviewPrepUserData.userId, userId), eq(schema.reviewPrepUserData.dataType, dataType)))
				.returning();
			return updated;
		}

		const [created] = await db.insert(schema.reviewPrepUserData).values({ userId, dataType, data }).returning();
		return created;
	},
};
