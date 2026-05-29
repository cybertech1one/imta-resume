import { desc, eq } from "drizzle-orm";
import { schema } from "@/integrations/drizzle";
import { db } from "@/integrations/drizzle/client";
import type {
	RemoteReadinessCategory,
	RemoteReadinessCategoryScores,
	RemoteReadinessLevel,
} from "@/integrations/drizzle/schema";
import { generateId } from "@/utils/string";

// Types for the service
export type RemoteReadinessResultData = {
	id: string;
	date: string;
	totalScore: number;
	maxScore: number;
	percentage: number;
	categoryScores: RemoteReadinessCategoryScores;
	level: RemoteReadinessLevel;
};

export type ImprovementTask = {
	id: string;
	category: RemoteReadinessCategory;
	title: string;
	description: string;
	completed: boolean;
	priority: "high" | "medium" | "low";
};

export type CreateResultInput = {
	userId: string;
	totalScore: number;
	maxScore: number;
	percentage: number;
	level: RemoteReadinessLevel;
	categoryScores: RemoteReadinessCategoryScores;
};

export type CreateImprovementInput = {
	userId: string;
	category: RemoteReadinessCategory;
	title: string;
	description: string;
	priority: "high" | "medium" | "low";
};

export const remoteReadinessService = {
	// ============================================
	// QUIZ RESULTS
	// ============================================

	// Get all results for a user
	getResults: async (userId: string): Promise<RemoteReadinessResultData[]> => {
		const results = await db
			.select()
			.from(schema.remoteReadinessResult)
			.where(eq(schema.remoteReadinessResult.userId, userId))
			.orderBy(desc(schema.remoteReadinessResult.createdAt));

		return results.map((r) => ({
			id: r.id,
			date: r.createdAt.toISOString(),
			totalScore: r.totalScore,
			maxScore: r.maxScore,
			percentage: r.percentage,
			categoryScores: r.categoryScores,
			level: r.level,
		}));
	},

	// Get latest result for a user
	getLatestResult: async (userId: string): Promise<RemoteReadinessResultData | null> => {
		const [result] = await db
			.select()
			.from(schema.remoteReadinessResult)
			.where(eq(schema.remoteReadinessResult.userId, userId))
			.orderBy(desc(schema.remoteReadinessResult.createdAt))
			.limit(1);

		if (!result) return null;

		return {
			id: result.id,
			date: result.createdAt.toISOString(),
			totalScore: result.totalScore,
			maxScore: result.maxScore,
			percentage: result.percentage,
			categoryScores: result.categoryScores,
			level: result.level,
		};
	},

	// Save a new result
	saveResult: async (input: CreateResultInput): Promise<RemoteReadinessResultData> => {
		const id = generateId();
		const now = new Date();

		await db.insert(schema.remoteReadinessResult).values({
			id,
			userId: input.userId,
			totalScore: input.totalScore,
			maxScore: input.maxScore,
			percentage: input.percentage,
			level: input.level,
			categoryScores: input.categoryScores,
			createdAt: now,
		});

		return {
			id,
			date: now.toISOString(),
			totalScore: input.totalScore,
			maxScore: input.maxScore,
			percentage: input.percentage,
			categoryScores: input.categoryScores,
			level: input.level,
		};
	},

	// ============================================
	// CHECKLIST
	// ============================================

	// Get checklist state (or create default if doesn't exist)
	getChecklist: async (userId: string): Promise<string[]> => {
		const [existing] = await db
			.select()
			.from(schema.remoteReadinessChecklist)
			.where(eq(schema.remoteReadinessChecklist.userId, userId));

		if (existing) {
			return existing.checkedItems;
		}

		// Create default entry
		await db.insert(schema.remoteReadinessChecklist).values({
			id: generateId(),
			userId,
			checkedItems: [],
		});

		return [];
	},

	// Toggle a checklist item
	toggleChecklistItem: async (userId: string, itemId: string): Promise<string[]> => {
		const current = await remoteReadinessService.getChecklist(userId);
		const checkedItems = current.includes(itemId) ? current.filter((id) => id !== itemId) : [...current, itemId];

		await db
			.update(schema.remoteReadinessChecklist)
			.set({ checkedItems })
			.where(eq(schema.remoteReadinessChecklist.userId, userId));

		return checkedItems;
	},

	// Update checked items (bulk)
	updateChecklistItems: async (userId: string, checkedItems: string[]): Promise<void> => {
		// Ensure record exists
		await remoteReadinessService.getChecklist(userId);

		await db
			.update(schema.remoteReadinessChecklist)
			.set({ checkedItems })
			.where(eq(schema.remoteReadinessChecklist.userId, userId));
	},

	// ============================================
	// HOME OFFICE
	// ============================================

	// Get office items state (or create default if doesn't exist)
	getOfficeItems: async (userId: string): Promise<string[]> => {
		const [existing] = await db
			.select()
			.from(schema.remoteReadinessOffice)
			.where(eq(schema.remoteReadinessOffice.userId, userId));

		if (existing) {
			return existing.checkedItems;
		}

		// Create default entry
		await db.insert(schema.remoteReadinessOffice).values({
			id: generateId(),
			userId,
			checkedItems: [],
		});

		return [];
	},

	// Toggle an office item
	toggleOfficeItem: async (userId: string, itemId: string): Promise<string[]> => {
		const current = await remoteReadinessService.getOfficeItems(userId);
		const checkedItems = current.includes(itemId) ? current.filter((id) => id !== itemId) : [...current, itemId];

		await db
			.update(schema.remoteReadinessOffice)
			.set({ checkedItems })
			.where(eq(schema.remoteReadinessOffice.userId, userId));

		return checkedItems;
	},

	// Update office items (bulk)
	updateOfficeItems: async (userId: string, checkedItems: string[]): Promise<void> => {
		// Ensure record exists
		await remoteReadinessService.getOfficeItems(userId);

		await db
			.update(schema.remoteReadinessOffice)
			.set({ checkedItems })
			.where(eq(schema.remoteReadinessOffice.userId, userId));
	},

	// ============================================
	// IMPROVEMENT TASKS
	// ============================================

	// Get all improvement tasks for a user
	getImprovements: async (userId: string): Promise<ImprovementTask[]> => {
		const improvements = await db
			.select()
			.from(schema.remoteReadinessImprovement)
			.where(eq(schema.remoteReadinessImprovement.userId, userId))
			.orderBy(desc(schema.remoteReadinessImprovement.createdAt));

		return improvements.map((i) => ({
			id: i.id,
			category: i.category,
			title: i.title,
			description: i.description,
			completed: i.completed,
			priority: i.priority as "high" | "medium" | "low",
		}));
	},

	// Create a new improvement task
	createImprovement: async (input: CreateImprovementInput): Promise<ImprovementTask> => {
		const id = generateId();

		await db.insert(schema.remoteReadinessImprovement).values({
			id,
			userId: input.userId,
			category: input.category,
			title: input.title,
			description: input.description,
			priority: input.priority,
			completed: false,
		});

		return {
			id,
			category: input.category,
			title: input.title,
			description: input.description,
			completed: false,
			priority: input.priority,
		};
	},

	// Toggle an improvement task
	toggleImprovement: async (userId: string, improvementId: string): Promise<boolean> => {
		const [existing] = await db
			.select()
			.from(schema.remoteReadinessImprovement)
			.where(eq(schema.remoteReadinessImprovement.id, improvementId));

		if (!existing || existing.userId !== userId) {
			throw new Error("Improvement not found");
		}

		const newCompleted = !existing.completed;

		await db
			.update(schema.remoteReadinessImprovement)
			.set({ completed: newCompleted })
			.where(eq(schema.remoteReadinessImprovement.id, improvementId));

		return newCompleted;
	},

	// Delete an improvement task
	deleteImprovement: async (userId: string, improvementId: string): Promise<void> => {
		const [existing] = await db
			.select()
			.from(schema.remoteReadinessImprovement)
			.where(eq(schema.remoteReadinessImprovement.id, improvementId));

		if (!existing || existing.userId !== userId) {
			throw new Error("Improvement not found");
		}

		await db.delete(schema.remoteReadinessImprovement).where(eq(schema.remoteReadinessImprovement.id, improvementId));
	},

	// Clear all improvements for a user (when starting new quiz)
	clearImprovements: async (userId: string): Promise<void> => {
		await db.delete(schema.remoteReadinessImprovement).where(eq(schema.remoteReadinessImprovement.userId, userId));
	},

	// Bulk create improvements
	createImprovements: async (improvements: CreateImprovementInput[]): Promise<ImprovementTask[]> => {
		const created: ImprovementTask[] = [];

		for (const input of improvements) {
			const task = await remoteReadinessService.createImprovement(input);
			created.push(task);
		}

		return created;
	},
};
