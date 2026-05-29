import { ORPCError } from "@orpc/client";
import { and, desc, eq, inArray, sql } from "drizzle-orm";
import { schema } from "@/integrations/drizzle";
import { db } from "@/integrations/drizzle/client";
import { generateId } from "@/utils/string";

// Helper type for transaction context
type TransactionContext = Parameters<Parameters<typeof db.transaction>[0]>[0];

// Helper function to recalculate progress within a transaction
async function recalculateProgressWithTx(tx: TransactionContext, goalId: string): Promise<void> {
	const milestones = await tx
		.select({ isCompleted: schema.goalMilestone.isCompleted })
		.from(schema.goalMilestone)
		.where(eq(schema.goalMilestone.goalId, goalId));

	if (milestones.length === 0) return;

	const completed = milestones.filter((m) => m.isCompleted).length;
	const progress = Math.round((completed / milestones.length) * 100);

	const updateData: Partial<typeof schema.careerGoal.$inferSelect> = { progress };

	// Auto-complete goal if all milestones are done
	if (progress >= 100) {
		updateData.status = "completed";
		updateData.completedAt = new Date();
	}

	await tx.update(schema.careerGoal).set(updateData).where(eq(schema.careerGoal.id, goalId));
}

export type GoalStatus = "not_started" | "in_progress" | "completed" | "on_hold" | "cancelled";
export type GoalCategory = "career" | "skill" | "education" | "networking" | "financial" | "other";

export type GoalMetric = {
	name: string;
	target: number;
	current: number;
};

export type CreateGoalInput = {
	userId: string;
	title: string;
	description?: string;
	category: GoalCategory;
	status?: GoalStatus;
	priority?: number;
	targetDate?: Date;
	progress?: number;
	tags?: string[];
	metrics?: GoalMetric[];
};

export type UpdateGoalInput = {
	id: string;
	userId: string;
	title?: string;
	description?: string;
	category?: GoalCategory;
	status?: GoalStatus;
	priority?: number;
	targetDate?: Date;
	progress?: number;
	tags?: string[];
	metrics?: GoalMetric[];
};

export type CreateMilestoneInput = {
	goalId: string;
	title: string;
	description?: string;
	dueDate?: Date;
	order?: number;
};

export type UpdateMilestoneInput = {
	id: string;
	goalId: string;
	title?: string;
	description?: string;
	isCompleted?: boolean;
	dueDate?: Date;
	order?: number;
};

export const careerGoalsService = {
	// Create a new goal
	create: async (input: CreateGoalInput): Promise<string> => {
		const id = generateId();

		await db.insert(schema.careerGoal).values({
			id,
			userId: input.userId,
			title: input.title,
			description: input.description,
			category: input.category,
			status: input.status ?? "not_started",
			priority: input.priority ?? 0,
			targetDate: input.targetDate,
			progress: input.progress ?? 0,
			tags: input.tags ?? [],
			metrics: input.metrics,
		});

		return id;
	},

	// Get goal by ID
	getById: async (input: { id: string; userId: string }) => {
		const [goal] = await db
			.select()
			.from(schema.careerGoal)
			.where(and(eq(schema.careerGoal.id, input.id), eq(schema.careerGoal.userId, input.userId)));

		if (!goal) {
			throw new ORPCError("NOT_FOUND", { message: "Goal not found" });
		}

		// Get milestones
		const milestones = await db
			.select()
			.from(schema.goalMilestone)
			.where(eq(schema.goalMilestone.goalId, goal.id))
			.orderBy(schema.goalMilestone.order);

		return { ...goal, milestones };
	},

	// List goals
	list: async (input: { userId: string; status?: GoalStatus; category?: GoalCategory; includeCompleted?: boolean }) => {
		const conditions = [eq(schema.careerGoal.userId, input.userId)];

		if (input.status) {
			conditions.push(eq(schema.careerGoal.status, input.status));
		}

		if (input.category) {
			conditions.push(eq(schema.careerGoal.category, input.category));
		}

		const goals = await db
			.select()
			.from(schema.careerGoal)
			.where(and(...conditions))
			.orderBy(desc(schema.careerGoal.priority), schema.careerGoal.targetDate);

		if (goals.length === 0) return [];

		const goalIds = goals.map((g) => g.id);
		const allMilestones = await db
			.select()
			.from(schema.goalMilestone)
			.where(inArray(schema.goalMilestone.goalId, goalIds))
			.orderBy(schema.goalMilestone.order);

		const milestonesByGoal = new Map<string, (typeof allMilestones)[number][]>();
		for (const m of allMilestones) {
			const list = milestonesByGoal.get(m.goalId) ?? [];
			list.push(m);
			milestonesByGoal.set(m.goalId, list);
		}

		return goals.map((goal) => ({ ...goal, milestones: milestonesByGoal.get(goal.id) ?? [] }));
	},

	// Update goal
	update: async (input: UpdateGoalInput): Promise<void> => {
		const [existing] = await db
			.select({ id: schema.careerGoal.id, status: schema.careerGoal.status })
			.from(schema.careerGoal)
			.where(and(eq(schema.careerGoal.id, input.id), eq(schema.careerGoal.userId, input.userId)));

		if (!existing) {
			throw new ORPCError("NOT_FOUND", { message: "Goal not found" });
		}

		const updateData: Partial<typeof schema.careerGoal.$inferSelect> = {
			title: input.title,
			description: input.description,
			category: input.category,
			status: input.status,
			priority: input.priority,
			targetDate: input.targetDate,
			progress: input.progress,
			tags: input.tags,
			metrics: input.metrics,
		};

		// Set completedAt when status changes to completed
		if (input.status === "completed" && existing.status !== "completed") {
			updateData.completedAt = new Date();
			updateData.progress = 100;
		}

		await db
			.update(schema.careerGoal)
			.set(updateData)
			.where(and(eq(schema.careerGoal.id, input.id), eq(schema.careerGoal.userId, input.userId)));
	},

	// Update goal progress
	updateProgress: async (input: { id: string; userId: string; progress: number }): Promise<void> => {
		const [existing] = await db
			.select({ id: schema.careerGoal.id })
			.from(schema.careerGoal)
			.where(and(eq(schema.careerGoal.id, input.id), eq(schema.careerGoal.userId, input.userId)));

		if (!existing) {
			throw new ORPCError("NOT_FOUND", { message: "Goal not found" });
		}

		const updateData: Partial<typeof schema.careerGoal.$inferSelect> = {
			progress: Math.min(100, Math.max(0, input.progress)),
		};

		// Auto-complete if progress reaches 100
		if (input.progress >= 100) {
			updateData.status = "completed";
			updateData.completedAt = new Date();
		}

		await db
			.update(schema.careerGoal)
			.set(updateData)
			.where(and(eq(schema.careerGoal.id, input.id), eq(schema.careerGoal.userId, input.userId)));
	},

	// Delete goal
	delete: async (input: { id: string; userId: string }): Promise<void> => {
		await db
			.delete(schema.careerGoal)
			.where(and(eq(schema.careerGoal.id, input.id), eq(schema.careerGoal.userId, input.userId)));
	},

	// Milestone methods
	milestones: {
		// Create milestone
		create: async (input: CreateMilestoneInput): Promise<string> => {
			const id = generateId();

			await db.transaction(async (tx) => {
				// Get max order for the goal
				const [maxOrder] = await tx
					.select({ max: sql<number>`COALESCE(MAX(${schema.goalMilestone.order}), -1)` })
					.from(schema.goalMilestone)
					.where(eq(schema.goalMilestone.goalId, input.goalId));

				await tx.insert(schema.goalMilestone).values({
					id,
					goalId: input.goalId,
					title: input.title,
					description: input.description,
					dueDate: input.dueDate,
					order: input.order ?? (maxOrder?.max ?? -1) + 1,
				});

				// Update goal progress based on milestones
				await recalculateProgressWithTx(tx, input.goalId);
			});

			return id;
		},

		// Update milestone
		update: async (input: UpdateMilestoneInput): Promise<void> => {
			const [existing] = await db
				.select({ id: schema.goalMilestone.id, isCompleted: schema.goalMilestone.isCompleted })
				.from(schema.goalMilestone)
				.where(and(eq(schema.goalMilestone.id, input.id), eq(schema.goalMilestone.goalId, input.goalId)));

			if (!existing) {
				throw new ORPCError("NOT_FOUND", { message: "Milestone not found" });
			}

			const updateData: Partial<typeof schema.goalMilestone.$inferSelect> = {
				title: input.title,
				description: input.description,
				isCompleted: input.isCompleted,
				dueDate: input.dueDate,
				order: input.order,
			};

			// Set completedAt when marking as completed
			if (input.isCompleted && !existing.isCompleted) {
				updateData.completedAt = new Date();
			} else if (input.isCompleted === false && existing.isCompleted) {
				updateData.completedAt = null;
			}

			await db.transaction(async (tx) => {
				await tx
					.update(schema.goalMilestone)
					.set(updateData)
					.where(and(eq(schema.goalMilestone.id, input.id), eq(schema.goalMilestone.goalId, input.goalId)));

				// Update goal progress
				await recalculateProgressWithTx(tx, input.goalId);
			});
		},

		// Toggle milestone completion
		toggle: async (input: { id: string; goalId: string }): Promise<boolean> => {
			const [existing] = await db
				.select({ isCompleted: schema.goalMilestone.isCompleted })
				.from(schema.goalMilestone)
				.where(and(eq(schema.goalMilestone.id, input.id), eq(schema.goalMilestone.goalId, input.goalId)));

			if (!existing) {
				throw new ORPCError("NOT_FOUND", { message: "Milestone not found" });
			}

			const newCompleted = !existing.isCompleted;

			await db.transaction(async (tx) => {
				await tx
					.update(schema.goalMilestone)
					.set({
						isCompleted: newCompleted,
						completedAt: newCompleted ? new Date() : null,
					})
					.where(and(eq(schema.goalMilestone.id, input.id), eq(schema.goalMilestone.goalId, input.goalId)));

				// Update goal progress
				await recalculateProgressWithTx(tx, input.goalId);
			});

			return newCompleted;
		},

		// Delete milestone
		delete: async (input: { id: string; goalId: string }): Promise<void> => {
			await db.transaction(async (tx) => {
				await tx
					.delete(schema.goalMilestone)
					.where(and(eq(schema.goalMilestone.id, input.id), eq(schema.goalMilestone.goalId, input.goalId)));

				// Update goal progress
				await recalculateProgressWithTx(tx, input.goalId);
			});
		},

		// Recalculate goal progress based on milestones (standalone version)
		recalculateProgress: async (goalId: string): Promise<void> => {
			await db.transaction(async (tx) => {
				await recalculateProgressWithTx(tx, goalId);
			});
		},
	},

	// Get statistics
	getStatistics: async (input: { userId: string }) => {
		const goals = await db.select().from(schema.careerGoal).where(eq(schema.careerGoal.userId, input.userId));

		const total = goals.length;
		const byStatus: Record<string, number> = {};
		const byCategory: Record<string, number> = {};

		for (const goal of goals) {
			byStatus[goal.status] = (byStatus[goal.status] ?? 0) + 1;
			byCategory[goal.category] = (byCategory[goal.category] ?? 0) + 1;
		}

		const completedThisMonth = goals.filter((g) => {
			if (!g.completedAt) return false;
			const now = new Date();
			const completedDate = new Date(g.completedAt);
			return completedDate.getMonth() === now.getMonth() && completedDate.getFullYear() === now.getFullYear();
		}).length;

		const averageProgress =
			goals.length > 0 ? Math.round(goals.reduce((sum, g) => sum + g.progress, 0) / goals.length) : 0;

		return {
			total,
			byStatus,
			byCategory,
			completedThisMonth,
			averageProgress,
			active: (byStatus.in_progress ?? 0) + (byStatus.not_started ?? 0),
		};
	},
};
