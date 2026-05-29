import { ORPCError } from "@orpc/client";
import { and, desc, eq } from "drizzle-orm";
import { schema } from "@/integrations/drizzle";
import { db } from "@/integrations/drizzle/client";
import type {
	RoadmapAlternativePath,
	RoadmapCareerGoal,
	RoadmapProgress,
	RoadmapStep,
} from "@/integrations/drizzle/schema";
import { generateId } from "@/utils/string";

export type CreateRoadmapInput = {
	userId: string;
	name: string;
	goal: RoadmapCareerGoal;
	selectedPath: RoadmapAlternativePath;
	progress: RoadmapProgress;
	isShared?: boolean;
	shareCode?: string;
};

export type UpdateRoadmapInput = {
	id: string;
	userId: string;
	name?: string;
	goal?: RoadmapCareerGoal;
	selectedPath?: RoadmapAlternativePath;
	progress?: RoadmapProgress;
	isShared?: boolean;
	shareCode?: string;
};

export type UpdateProgressInput = {
	id: string;
	userId: string;
	progress: RoadmapProgress;
};

export type ToggleStepCompleteInput = {
	id: string;
	userId: string;
	stepId: string;
};

export const roadmapsService = {
	// Create a new roadmap
	create: async (input: CreateRoadmapInput): Promise<string> => {
		const id = generateId();

		await db.insert(schema.careerRoadmap).values({
			id,
			userId: input.userId,
			name: input.name,
			goal: input.goal,
			selectedPath: input.selectedPath,
			progress: input.progress,
			isShared: input.isShared ?? false,
			shareCode: input.shareCode,
		});

		return id;
	},

	// Get roadmap by ID
	getById: async (input: { id: string; userId: string }) => {
		const [roadmap] = await db
			.select()
			.from(schema.careerRoadmap)
			.where(and(eq(schema.careerRoadmap.id, input.id), eq(schema.careerRoadmap.userId, input.userId)));

		if (!roadmap) {
			throw new ORPCError("NOT_FOUND", { message: "Roadmap not found" });
		}

		return roadmap;
	},

	// Get roadmap by share code (public access)
	getByShareCode: async (input: { shareCode: string }) => {
		const [roadmap] = await db
			.select()
			.from(schema.careerRoadmap)
			.where(and(eq(schema.careerRoadmap.shareCode, input.shareCode), eq(schema.careerRoadmap.isShared, true)));

		if (!roadmap) {
			throw new ORPCError("NOT_FOUND", { message: "Roadmap not found or not shared" });
		}

		return roadmap;
	},

	// List roadmaps for a user
	list: async (input: { userId: string }) => {
		const roadmaps = await db
			.select()
			.from(schema.careerRoadmap)
			.where(eq(schema.careerRoadmap.userId, input.userId))
			.orderBy(desc(schema.careerRoadmap.updatedAt));

		return roadmaps;
	},

	// Get the current/active roadmap for a user (most recently updated)
	getCurrent: async (input: { userId: string }) => {
		const [roadmap] = await db
			.select()
			.from(schema.careerRoadmap)
			.where(eq(schema.careerRoadmap.userId, input.userId))
			.orderBy(desc(schema.careerRoadmap.updatedAt))
			.limit(1);

		return roadmap ?? null;
	},

	// Update roadmap
	update: async (input: UpdateRoadmapInput): Promise<void> => {
		const [existing] = await db
			.select({ id: schema.careerRoadmap.id })
			.from(schema.careerRoadmap)
			.where(and(eq(schema.careerRoadmap.id, input.id), eq(schema.careerRoadmap.userId, input.userId)));

		if (!existing) {
			throw new ORPCError("NOT_FOUND", { message: "Roadmap not found" });
		}

		await db
			.update(schema.careerRoadmap)
			.set({
				name: input.name,
				goal: input.goal,
				selectedPath: input.selectedPath,
				progress: input.progress,
				isShared: input.isShared,
				shareCode: input.shareCode,
			})
			.where(and(eq(schema.careerRoadmap.id, input.id), eq(schema.careerRoadmap.userId, input.userId)));
	},

	// Update progress only
	updateProgress: async (input: UpdateProgressInput): Promise<void> => {
		const [existing] = await db
			.select({ id: schema.careerRoadmap.id })
			.from(schema.careerRoadmap)
			.where(and(eq(schema.careerRoadmap.id, input.id), eq(schema.careerRoadmap.userId, input.userId)));

		if (!existing) {
			throw new ORPCError("NOT_FOUND", { message: "Roadmap not found" });
		}

		await db
			.update(schema.careerRoadmap)
			.set({
				progress: input.progress,
			})
			.where(and(eq(schema.careerRoadmap.id, input.id), eq(schema.careerRoadmap.userId, input.userId)));
	},

	// Toggle step completion
	toggleStepComplete: async (input: ToggleStepCompleteInput) => {
		const [roadmap] = await db
			.select()
			.from(schema.careerRoadmap)
			.where(and(eq(schema.careerRoadmap.id, input.id), eq(schema.careerRoadmap.userId, input.userId)));

		if (!roadmap) {
			throw new ORPCError("NOT_FOUND", { message: "Roadmap not found" });
		}

		const selectedPath = roadmap.selectedPath as RoadmapAlternativePath;
		const progress = roadmap.progress as RoadmapProgress;

		// Update the step completion status
		const updatedSteps = selectedPath.steps.map((step: RoadmapStep) =>
			step.id === input.stepId
				? {
						...step,
						completed: !step.completed,
						completedDate: !step.completed ? new Date().toISOString() : undefined,
					}
				: step,
		);

		const updatedPath = {
			...selectedPath,
			steps: updatedSteps,
		};

		// Recalculate progress
		const completedSteps = updatedSteps.filter((s: RoadmapStep) => s.completed).length;
		const overallProgress = Math.round((completedSteps / updatedSteps.length) * 100);
		const currentStepId = updatedSteps.find((s: RoadmapStep) => !s.completed)?.id || null;

		const updatedProgress: RoadmapProgress = {
			...progress,
			overallProgress,
			completedSteps,
			currentStepId,
			lastActivityDate: new Date().toISOString(),
			streakDays: progress.streakDays + 1,
		};

		await db
			.update(schema.careerRoadmap)
			.set({
				selectedPath: updatedPath,
				progress: updatedProgress,
			})
			.where(and(eq(schema.careerRoadmap.id, input.id), eq(schema.careerRoadmap.userId, input.userId)));

		return {
			selectedPath: updatedPath,
			progress: updatedProgress,
		};
	},

	// Share roadmap
	share: async (input: { id: string; userId: string }) => {
		const [existing] = await db
			.select()
			.from(schema.careerRoadmap)
			.where(and(eq(schema.careerRoadmap.id, input.id), eq(schema.careerRoadmap.userId, input.userId)));

		if (!existing) {
			throw new ORPCError("NOT_FOUND", { message: "Roadmap not found" });
		}

		// Generate share code if not already shared
		const shareCode = existing.shareCode || Math.random().toString(36).substring(2, 8).toUpperCase();

		await db
			.update(schema.careerRoadmap)
			.set({
				isShared: true,
				shareCode,
			})
			.where(and(eq(schema.careerRoadmap.id, input.id), eq(schema.careerRoadmap.userId, input.userId)));

		return shareCode;
	},

	// Unshare roadmap
	unshare: async (input: { id: string; userId: string }): Promise<void> => {
		await db
			.update(schema.careerRoadmap)
			.set({
				isShared: false,
			})
			.where(and(eq(schema.careerRoadmap.id, input.id), eq(schema.careerRoadmap.userId, input.userId)));
	},

	// Delete roadmap
	delete: async (input: { id: string; userId: string }): Promise<void> => {
		await db
			.delete(schema.careerRoadmap)
			.where(and(eq(schema.careerRoadmap.id, input.id), eq(schema.careerRoadmap.userId, input.userId)));
	},

	// Get statistics
	getStatistics: async (input: { userId: string }) => {
		const roadmaps = await db.select().from(schema.careerRoadmap).where(eq(schema.careerRoadmap.userId, input.userId));

		const total = roadmaps.length;
		let totalProgress = 0;
		let completedRoadmaps = 0;
		let totalStepsCompleted = 0;
		let totalSteps = 0;

		for (const roadmap of roadmaps) {
			const progress = roadmap.progress as RoadmapProgress;
			totalProgress += progress.overallProgress;
			totalStepsCompleted += progress.completedSteps;
			totalSteps += progress.totalSteps;

			if (progress.overallProgress === 100) {
				completedRoadmaps++;
			}
		}

		return {
			total,
			completedRoadmaps,
			averageProgress: total > 0 ? Math.round(totalProgress / total) : 0,
			totalStepsCompleted,
			totalSteps,
			inProgressRoadmaps: total - completedRoadmaps,
		};
	},
};
