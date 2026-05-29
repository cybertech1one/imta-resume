import { ORPCError } from "@orpc/client";
import { eq } from "drizzle-orm";
import { schema } from "@/integrations/drizzle";
import { db } from "@/integrations/drizzle/client";
import type {
	GapAnalysisCurrentSkill,
	GapAnalysisExportHistory,
	GapAnalysisProgressRecord,
	GapAnalysisSkillCategory,
} from "@/integrations/drizzle/schema";
import { generateId } from "@/utils/string";

export type GapAnalysisData = {
	id: string;
	userId: string;
	currentSkills: GapAnalysisCurrentSkill[];
	selectedRoleId: string | null;
	progressRecords: GapAnalysisProgressRecord[];
	weeklyGoalHours: number;
	lastAnalysisDate: Date;
	exportHistory: GapAnalysisExportHistory[];
	createdAt: Date;
	updatedAt: Date;
};

export type CreateGapAnalysisInput = {
	userId: string;
	currentSkills?: GapAnalysisCurrentSkill[];
	selectedRoleId?: string | null;
	weeklyGoalHours?: number;
};

export type UpdateGapAnalysisInput = {
	userId: string;
	currentSkills?: GapAnalysisCurrentSkill[];
	selectedRoleId?: string | null;
	progressRecords?: GapAnalysisProgressRecord[];
	weeklyGoalHours?: number;
	exportHistory?: GapAnalysisExportHistory[];
};

export type AddSkillInput = {
	userId: string;
	name: string;
	nameFr: string;
	category: GapAnalysisSkillCategory;
	currentLevel: number;
	yearsExperience: number;
	notes?: string;
};

export type UpdateSkillInput = {
	userId: string;
	skillId: string;
	name?: string;
	nameFr?: string;
	category?: GapAnalysisSkillCategory;
	currentLevel?: number;
	yearsExperience?: number;
	notes?: string;
};

export type UpdateSkillLevelInput = {
	userId: string;
	skillId: string;
	newLevel: number;
	notes?: string;
};

export const gapAnalysisService = {
	// Get or create gap analysis data for a user
	get: async (input: { userId: string }): Promise<GapAnalysisData | null> => {
		const [analysis] = await db.select().from(schema.gapAnalysis).where(eq(schema.gapAnalysis.userId, input.userId));

		return analysis ?? null;
	},

	// Create gap analysis record for a user
	create: async (input: CreateGapAnalysisInput): Promise<GapAnalysisData> => {
		const id = generateId();

		await db.insert(schema.gapAnalysis).values({
			id,
			userId: input.userId,
			currentSkills: input.currentSkills ?? [],
			selectedRoleId: input.selectedRoleId ?? null,
			weeklyGoalHours: input.weeklyGoalHours ?? 10,
			progressRecords: [],
			exportHistory: [],
		});

		const [analysis] = await db.select().from(schema.gapAnalysis).where(eq(schema.gapAnalysis.id, id));

		return analysis as GapAnalysisData;
	},

	// Get or create - ensures a record exists
	getOrCreate: async (input: { userId: string }): Promise<GapAnalysisData> => {
		const existing = await gapAnalysisService.get({ userId: input.userId });
		if (existing) {
			return existing;
		}
		return await gapAnalysisService.create({ userId: input.userId });
	},

	// Update gap analysis data
	update: async (input: UpdateGapAnalysisInput): Promise<GapAnalysisData> => {
		const existing = await gapAnalysisService.getOrCreate({ userId: input.userId });

		await db
			.update(schema.gapAnalysis)
			.set({
				currentSkills: input.currentSkills ?? existing.currentSkills,
				selectedRoleId: input.selectedRoleId !== undefined ? input.selectedRoleId : existing.selectedRoleId,
				progressRecords: input.progressRecords ?? existing.progressRecords,
				weeklyGoalHours: input.weeklyGoalHours ?? existing.weeklyGoalHours,
				exportHistory: input.exportHistory ?? existing.exportHistory,
				lastAnalysisDate: new Date(),
			})
			.where(eq(schema.gapAnalysis.userId, input.userId));

		const [updated] = await db.select().from(schema.gapAnalysis).where(eq(schema.gapAnalysis.userId, input.userId));

		return updated as GapAnalysisData;
	},

	// Add a new skill
	addSkill: async (input: AddSkillInput): Promise<GapAnalysisData> => {
		const existing = await gapAnalysisService.getOrCreate({ userId: input.userId });

		const newSkill: GapAnalysisCurrentSkill = {
			id: `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
			name: input.name,
			nameFr: input.nameFr,
			category: input.category,
			currentLevel: input.currentLevel,
			yearsExperience: input.yearsExperience,
			lastUsed: new Date().toISOString(),
			notes: input.notes ?? "",
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		};

		const updatedSkills = [...existing.currentSkills, newSkill];

		return await gapAnalysisService.update({
			userId: input.userId,
			currentSkills: updatedSkills,
		});
	},

	// Update an existing skill
	updateSkill: async (input: UpdateSkillInput): Promise<GapAnalysisData> => {
		const existing = await gapAnalysisService.getOrCreate({ userId: input.userId });

		const skillIndex = existing.currentSkills.findIndex((s) => s.id === input.skillId);
		if (skillIndex === -1) {
			throw new ORPCError("NOT_FOUND", { message: "Skill not found" });
		}

		const updatedSkills = [...existing.currentSkills];
		updatedSkills[skillIndex] = {
			...updatedSkills[skillIndex],
			name: input.name ?? updatedSkills[skillIndex].name,
			nameFr: input.nameFr ?? updatedSkills[skillIndex].nameFr,
			category: input.category ?? updatedSkills[skillIndex].category,
			currentLevel: input.currentLevel ?? updatedSkills[skillIndex].currentLevel,
			yearsExperience: input.yearsExperience ?? updatedSkills[skillIndex].yearsExperience,
			notes: input.notes ?? updatedSkills[skillIndex].notes,
			updatedAt: new Date().toISOString(),
		};

		return await gapAnalysisService.update({
			userId: input.userId,
			currentSkills: updatedSkills,
		});
	},

	// Update skill level with progress tracking
	updateSkillLevel: async (input: UpdateSkillLevelInput): Promise<GapAnalysisData> => {
		const existing = await gapAnalysisService.getOrCreate({ userId: input.userId });

		const skill = existing.currentSkills.find((s) => s.id === input.skillId);
		if (!skill) {
			throw new ORPCError("NOT_FOUND", { message: "Skill not found" });
		}

		// Create progress record
		const progressRecord: GapAnalysisProgressRecord = {
			skillId: input.skillId,
			skillName: skill.name,
			date: new Date().toISOString(),
			previousLevel: skill.currentLevel,
			newLevel: input.newLevel,
			notes: input.notes ?? "",
		};

		// Update skill level
		const updatedSkills = existing.currentSkills.map((s) => {
			if (s.id === input.skillId) {
				return {
					...s,
					currentLevel: input.newLevel,
					updatedAt: new Date().toISOString(),
				};
			}
			return s;
		});

		return await gapAnalysisService.update({
			userId: input.userId,
			currentSkills: updatedSkills,
			progressRecords: [...existing.progressRecords, progressRecord],
		});
	},

	// Delete a skill
	deleteSkill: async (input: { userId: string; skillId: string }): Promise<GapAnalysisData> => {
		const existing = await gapAnalysisService.getOrCreate({ userId: input.userId });

		const updatedSkills = existing.currentSkills.filter((s) => s.id !== input.skillId);

		return await gapAnalysisService.update({
			userId: input.userId,
			currentSkills: updatedSkills,
		});
	},

	// Select target role
	selectRole: async (input: { userId: string; roleId: string | null }): Promise<GapAnalysisData> => {
		return await gapAnalysisService.update({
			userId: input.userId,
			selectedRoleId: input.roleId,
		});
	},

	// Update weekly goal hours
	updateWeeklyGoal: async (input: { userId: string; weeklyGoalHours: number }): Promise<GapAnalysisData> => {
		return await gapAnalysisService.update({
			userId: input.userId,
			weeklyGoalHours: input.weeklyGoalHours,
		});
	},

	// Record an export
	recordExport: async (input: { userId: string; format: string }): Promise<GapAnalysisData> => {
		const existing = await gapAnalysisService.getOrCreate({ userId: input.userId });

		const exportEntry: GapAnalysisExportHistory = {
			date: new Date().toISOString(),
			format: input.format,
		};

		return await gapAnalysisService.update({
			userId: input.userId,
			exportHistory: [...existing.exportHistory, exportEntry],
		});
	},

	// Reset/delete all gap analysis data for a user
	reset: async (input: { userId: string }): Promise<void> => {
		await db.delete(schema.gapAnalysis).where(eq(schema.gapAnalysis.userId, input.userId));
	},

	// Get statistics
	getStatistics: async (input: { userId: string }) => {
		const data = await gapAnalysisService.get({ userId: input.userId });

		if (!data) {
			return {
				totalSkills: 0,
				byCategory: {} as Record<string, number>,
				averageLevel: 0,
				totalProgressRecords: 0,
				recentProgress: [] as GapAnalysisProgressRecord[],
				exportCount: 0,
			};
		}

		const byCategory: Record<string, number> = {};
		let totalLevel = 0;

		for (const skill of data.currentSkills) {
			byCategory[skill.category] = (byCategory[skill.category] ?? 0) + 1;
			totalLevel += skill.currentLevel;
		}

		const averageLevel = data.currentSkills.length > 0 ? totalLevel / data.currentSkills.length : 0;

		// Get recent progress (last 10)
		const recentProgress = data.progressRecords.slice(-10).reverse();

		return {
			totalSkills: data.currentSkills.length,
			byCategory,
			averageLevel: Math.round(averageLevel * 10) / 10,
			totalProgressRecords: data.progressRecords.length,
			recentProgress,
			exportCount: data.exportHistory.length,
		};
	},
};
