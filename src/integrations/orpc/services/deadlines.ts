import { ORPCError } from "@orpc/client";
import { and, desc, eq, gte, lte } from "drizzle-orm";
import { schema } from "@/integrations/drizzle";
import { db } from "@/integrations/drizzle/client";
import type { DeadlinePriority } from "@/integrations/drizzle/schema";
import { generateId } from "@/utils/string";

export type CreateDeadlineInput = {
	userId: string;
	title: string;
	company: string;
	position?: string;
	deadlineDate: string; // YYYY-MM-DD format
	deadlineTime?: string; // HH:MM format
	priority?: DeadlinePriority;
	notes?: string;
	reminderEnabled?: boolean;
	reminderDate?: string;
	reminderTime?: string;
	completed?: boolean;
};

export type UpdateDeadlineInput = {
	id: string;
	userId: string;
	title?: string;
	company?: string;
	position?: string;
	deadlineDate?: string;
	deadlineTime?: string;
	priority?: DeadlinePriority;
	notes?: string;
	reminderEnabled?: boolean;
	reminderDate?: string | null;
	reminderTime?: string | null;
	completed?: boolean;
};

export const deadlinesService = {
	// Create a new deadline
	create: async (input: CreateDeadlineInput): Promise<string> => {
		const id = generateId();

		await db.insert(schema.jobDeadline).values({
			id,
			userId: input.userId,
			title: input.title,
			company: input.company,
			position: input.position ?? "",
			deadlineDate: input.deadlineDate,
			deadlineTime: input.deadlineTime ?? "23:59",
			priority: input.priority ?? "medium",
			notes: input.notes ?? "",
			reminderEnabled: input.reminderEnabled ?? false,
			reminderDate: input.reminderDate ?? null,
			reminderTime: input.reminderTime ?? null,
			completed: input.completed ?? false,
		});

		return id;
	},

	// Get deadline by ID
	getById: async (input: { id: string; userId: string }) => {
		const [deadline] = await db
			.select()
			.from(schema.jobDeadline)
			.where(and(eq(schema.jobDeadline.id, input.id), eq(schema.jobDeadline.userId, input.userId)));

		if (!deadline) {
			throw new ORPCError("NOT_FOUND", { message: "Deadline not found" });
		}

		return deadline;
	},

	// List deadlines
	list: async (input: {
		userId: string;
		startDate?: string;
		endDate?: string;
		priority?: DeadlinePriority;
		completed?: boolean;
		limit?: number;
		offset?: number;
	}) => {
		const conditions = [eq(schema.jobDeadline.userId, input.userId)];

		if (input.startDate) {
			conditions.push(gte(schema.jobDeadline.deadlineDate, input.startDate));
		}

		if (input.endDate) {
			conditions.push(lte(schema.jobDeadline.deadlineDate, input.endDate));
		}

		if (input.priority) {
			conditions.push(eq(schema.jobDeadline.priority, input.priority));
		}

		if (input.completed !== undefined) {
			conditions.push(eq(schema.jobDeadline.completed, input.completed));
		}

		return await db
			.select()
			.from(schema.jobDeadline)
			.where(and(...conditions))
			.orderBy(desc(schema.jobDeadline.deadlineDate))
			.limit(input.limit ?? 100)
			.offset(input.offset ?? 0);
	},

	// Update deadline
	update: async (input: UpdateDeadlineInput): Promise<void> => {
		const [existing] = await db
			.select({ id: schema.jobDeadline.id })
			.from(schema.jobDeadline)
			.where(and(eq(schema.jobDeadline.id, input.id), eq(schema.jobDeadline.userId, input.userId)));

		if (!existing) {
			throw new ORPCError("NOT_FOUND", { message: "Deadline not found" });
		}

		await db
			.update(schema.jobDeadline)
			.set({
				title: input.title,
				company: input.company,
				position: input.position,
				deadlineDate: input.deadlineDate,
				deadlineTime: input.deadlineTime,
				priority: input.priority,
				notes: input.notes,
				reminderEnabled: input.reminderEnabled,
				reminderDate: input.reminderDate,
				reminderTime: input.reminderTime,
				completed: input.completed,
			})
			.where(and(eq(schema.jobDeadline.id, input.id), eq(schema.jobDeadline.userId, input.userId)));
	},

	// Toggle completed status
	toggleComplete: async (input: { id: string; userId: string }): Promise<boolean> => {
		const [existing] = await db
			.select({ id: schema.jobDeadline.id, completed: schema.jobDeadline.completed })
			.from(schema.jobDeadline)
			.where(and(eq(schema.jobDeadline.id, input.id), eq(schema.jobDeadline.userId, input.userId)));

		if (!existing) {
			throw new ORPCError("NOT_FOUND", { message: "Deadline not found" });
		}

		const newCompleted = !existing.completed;

		await db
			.update(schema.jobDeadline)
			.set({ completed: newCompleted })
			.where(and(eq(schema.jobDeadline.id, input.id), eq(schema.jobDeadline.userId, input.userId)));

		return newCompleted;
	},

	// Toggle reminder
	toggleReminder: async (input: { id: string; userId: string }): Promise<boolean> => {
		const [existing] = await db
			.select({ id: schema.jobDeadline.id, reminderEnabled: schema.jobDeadline.reminderEnabled })
			.from(schema.jobDeadline)
			.where(and(eq(schema.jobDeadline.id, input.id), eq(schema.jobDeadline.userId, input.userId)));

		if (!existing) {
			throw new ORPCError("NOT_FOUND", { message: "Deadline not found" });
		}

		const newReminderEnabled = !existing.reminderEnabled;

		await db
			.update(schema.jobDeadline)
			.set({ reminderEnabled: newReminderEnabled })
			.where(and(eq(schema.jobDeadline.id, input.id), eq(schema.jobDeadline.userId, input.userId)));

		return newReminderEnabled;
	},

	// Delete deadline
	delete: async (input: { id: string; userId: string }): Promise<void> => {
		await db
			.delete(schema.jobDeadline)
			.where(and(eq(schema.jobDeadline.id, input.id), eq(schema.jobDeadline.userId, input.userId)));
	},

	// Get statistics
	getStatistics: async (input: { userId: string }) => {
		const now = new Date();
		const nowDateStr = now.toISOString().split("T")[0];
		const weekFromNow = new Date();
		weekFromNow.setDate(weekFromNow.getDate() + 7);
		const weekFromNowStr = weekFromNow.toISOString().split("T")[0];

		const deadlines = await db.select().from(schema.jobDeadline).where(eq(schema.jobDeadline.userId, input.userId));

		const total = deadlines.length;
		const completed = deadlines.filter((d) => d.completed).length;
		const upcoming = deadlines.filter((d) => {
			if (d.completed) return false;
			return d.deadlineDate >= nowDateStr;
		}).length;
		const past = deadlines.filter((d) => {
			if (d.completed) return false;
			return d.deadlineDate < nowDateStr;
		}).length;

		const highPriority = deadlines.filter((d) => d.priority === "high" && !d.completed).length;
		const thisWeek = deadlines.filter((d) => {
			if (d.completed) return false;
			return d.deadlineDate >= nowDateStr && d.deadlineDate <= weekFromNowStr;
		}).length;

		const byPriority = {
			high: deadlines.filter((d) => d.priority === "high" && !d.completed).length,
			medium: deadlines.filter((d) => d.priority === "medium" && !d.completed).length,
			low: deadlines.filter((d) => d.priority === "low" && !d.completed).length,
		};

		return {
			total,
			upcoming,
			past,
			completed,
			highPriority,
			thisWeek,
			byPriority,
		};
	},
};
