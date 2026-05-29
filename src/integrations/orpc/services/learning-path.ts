import { and, desc, eq } from "drizzle-orm";
import { db } from "@/integrations/drizzle/client";
import {
	careerRoleRequirement,
	careerRoleSkill,
	gapAnalysis,
	type LearningPath,
	type LearningPathMilestone,
	type LearningPathPriority,
	type LearningPathResource,
	type LearningPathSkill,
	type LearningPathStatus,
	learningPath,
	type NewLearningPath,
	type NewSkillProgress,
	type SkillProgress,
	skillProgress,
} from "@/integrations/drizzle/schema";
import { generateId } from "@/utils/string";

// Re-export types
export type {
	LearningPath,
	SkillProgress,
	LearningPathSkill,
	LearningPathResource,
	LearningPathMilestone,
	LearningPathStatus,
	LearningPathPriority,
};

// ============================================================================
// SKILL GAP ANALYSIS
// ============================================================================

export type SkillGapAnalysisResult = {
	skillName: string;
	skillNameFr?: string;
	category: string;
	currentLevel: number;
	requiredLevel: number;
	gapSize: number;
	importance: string;
	industryBenchmark: number;
	estimatedWeeksToClose: number;
	priority: number; // Calculated priority score
};

export type GapAnalysisResult = {
	targetRoleId: string;
	targetRoleName: string;
	targetRoleNameFr?: string;
	readinessScore: number;
	totalSkills: number;
	skillsCovered: number;
	skillsToImprove: number;
	criticalGaps: number;
	estimatedWeeks: number;
	gaps: SkillGapAnalysisResult[];
	recommendations: string[];
};

/**
 * Analyze skill gaps between user's current skills and target role requirements
 */
export async function analyzeSkillGap(userId: string, targetRoleId: string): Promise<GapAnalysisResult | null> {
	// Get target role with skills
	const [role] = await db.select().from(careerRoleRequirement).where(eq(careerRoleRequirement.id, targetRoleId));

	if (!role) return null;

	// Get required skills for the role
	const requiredSkills = await db.select().from(careerRoleSkill).where(eq(careerRoleSkill.roleId, targetRoleId));

	// Get user's current skills from gap analysis
	const [userGapData] = await db.select().from(gapAnalysis).where(eq(gapAnalysis.userId, userId));

	const currentSkills = userGapData?.currentSkills ?? [];

	// Calculate gaps
	const gaps: SkillGapAnalysisResult[] = requiredSkills.map((required) => {
		const currentSkill = currentSkills.find(
			(s) =>
				s.name.toLowerCase() === required.skillName.toLowerCase() ||
				(s.nameFr && required.skillNameFr && s.nameFr.toLowerCase() === required.skillNameFr.toLowerCase()),
		);

		const currentLevel = currentSkill?.currentLevel ?? 0;
		const requiredLevel = required.requiredLevel ?? 3;
		const gapSize = Math.max(0, requiredLevel - currentLevel);

		// Calculate priority: importance weight * gap size
		const importanceWeight = required.importance === "critical" ? 3 : required.importance === "important" ? 2 : 1;
		const priority = gapSize * importanceWeight;

		// Estimate weeks to close gap
		const baseWeeksPerLevel: Record<string, number> = {
			technical: 8,
			soft: 6,
			languages: 12,
			certifications: 4,
			tools: 4,
		};
		const category = required.category ?? "technical";
		const estimatedWeeksToClose = Math.ceil(gapSize * (baseWeeksPerLevel[category] ?? 6));

		return {
			skillName: required.skillName,
			skillNameFr: required.skillNameFr ?? undefined,
			category,
			currentLevel,
			requiredLevel,
			gapSize,
			importance: required.importance ?? "important",
			industryBenchmark: Number.parseFloat(required.industryBenchmark ?? "3.0"),
			estimatedWeeksToClose,
			priority,
		};
	});

	// Sort by priority (descending)
	gaps.sort((a, b) => b.priority - a.priority);

	// Calculate metrics
	const totalSkills = gaps.length;
	const skillsCovered = gaps.filter((g) => g.currentLevel >= g.requiredLevel).length;
	const skillsToImprove = gaps.filter((g) => g.gapSize > 0).length;
	const criticalGaps = gaps.filter((g) => g.gapSize > 0 && g.importance === "critical").length;
	const totalRequired = gaps.reduce((sum, g) => sum + g.requiredLevel, 0);
	const totalCurrent = gaps.reduce((sum, g) => sum + g.currentLevel, 0);
	const readinessScore = totalRequired > 0 ? Math.round((totalCurrent / totalRequired) * 100) : 0;
	const estimatedWeeks = Math.max(...gaps.map((g) => g.estimatedWeeksToClose), 0);

	// Generate recommendations
	const recommendations: string[] = [];
	const topGaps = gaps.filter((g) => g.gapSize > 0).slice(0, 3);

	if (criticalGaps > 0) {
		recommendations.push(`Concentrez-vous sur les ${criticalGaps} competence(s) critique(s) en priorite.`);
	}

	topGaps.forEach((gap) => {
		recommendations.push(
			`Improve "${gap.skillName || gap.skillNameFr}" from level ${gap.currentLevel} to ${gap.requiredLevel}.`,
		);
	});

	if (readinessScore >= 80) {
		recommendations.push("You're almost ready for this role! Keep refining your skills.");
	} else if (readinessScore >= 50) {
		recommendations.push("You have a solid foundation. A targeted training plan will help you progress.");
	} else {
		recommendations.push(
			"This role requires significant development. Start with the basics and progress methodically.",
		);
	}

	return {
		targetRoleId,
		targetRoleName: role.role,
		targetRoleNameFr: role.roleFr ?? undefined,
		readinessScore,
		totalSkills,
		skillsCovered,
		skillsToImprove,
		criticalGaps,
		estimatedWeeks,
		gaps,
		recommendations,
	};
}

// ============================================================================
// LEARNING PATH SERVICE
// ============================================================================

export const learningPathService = {
	/**
	 * Get all learning paths for a user
	 */
	async list(userId: string): Promise<LearningPath[]> {
		return db.select().from(learningPath).where(eq(learningPath.userId, userId)).orderBy(desc(learningPath.createdAt));
	},

	/**
	 * Get a specific learning path by ID (scoped to user)
	 */
	async getById(id: string, userId: string): Promise<LearningPath | null> {
		const [result] = await db
			.select()
			.from(learningPath)
			.where(and(eq(learningPath.id, id), eq(learningPath.userId, userId)));
		return result ?? null;
	},

	/**
	 * Get learning paths for a user filtered by status
	 */
	async getByStatus(userId: string, status: LearningPathStatus): Promise<LearningPath[]> {
		return db
			.select()
			.from(learningPath)
			.where(and(eq(learningPath.userId, userId), eq(learningPath.status, status)))
			.orderBy(desc(learningPath.createdAt));
	},

	/**
	 * Get learning path for a specific target role
	 */
	async getByTargetRole(userId: string, targetRoleId: string): Promise<LearningPath | null> {
		const [result] = await db
			.select()
			.from(learningPath)
			.where(and(eq(learningPath.userId, userId), eq(learningPath.targetRoleId, targetRoleId)))
			.orderBy(desc(learningPath.createdAt))
			.limit(1);
		return result ?? null;
	},

	/**
	 * Create a new learning path
	 */
	async create(data: Omit<NewLearningPath, "id">): Promise<LearningPath> {
		const id = generateId();
		const [result] = await db
			.insert(learningPath)
			.values({
				id,
				...data,
			})
			.returning();
		return result;
	},

	/**
	 * Update a learning path (scoped to user)
	 */
	async update(
		id: string,
		userId: string,
		data: Partial<Omit<NewLearningPath, "id" | "userId" | "createdAt">>,
	): Promise<LearningPath | null> {
		const [result] = await db
			.update(learningPath)
			.set(data)
			.where(and(eq(learningPath.id, id), eq(learningPath.userId, userId)))
			.returning();
		return result ?? null;
	},

	/**
	 * Update learning path progress (scoped to user)
	 */
	async updateProgress(id: string, userId: string, progress: number): Promise<LearningPath | null> {
		const [existing] = await db
			.select({ startedAt: learningPath.startedAt })
			.from(learningPath)
			.where(and(eq(learningPath.id, id), eq(learningPath.userId, userId)));
		if (!existing) return null;

		const updates: Partial<NewLearningPath> = { progress };

		if (progress === 0) {
			updates.status = "not_started";
		} else if (progress >= 100) {
			updates.status = "completed";
			updates.completedAt = new Date();
		} else {
			updates.status = "in_progress";
			if (!existing?.startedAt) {
				updates.startedAt = new Date();
			}
		}

		const [result] = await db
			.update(learningPath)
			.set(updates)
			.where(and(eq(learningPath.id, id), eq(learningPath.userId, userId)))
			.returning();
		return result ?? null;
	},

	/**
	 * Start a learning path (scoped to user)
	 */
	async start(id: string, userId: string): Promise<LearningPath | null> {
		const [result] = await db
			.update(learningPath)
			.set({
				status: "in_progress",
				startedAt: new Date(),
			})
			.where(and(eq(learningPath.id, id), eq(learningPath.userId, userId)))
			.returning();
		return result ?? null;
	},

	/**
	 * Complete a learning path (scoped to user)
	 */
	async complete(id: string, userId: string): Promise<LearningPath | null> {
		const [result] = await db
			.update(learningPath)
			.set({
				status: "completed",
				progress: 100,
				completedAt: new Date(),
			})
			.where(and(eq(learningPath.id, id), eq(learningPath.userId, userId)))
			.returning();
		return result ?? null;
	},

	/**
	 * Delete a learning path (scoped to user)
	 */
	async delete(id: string, userId: string): Promise<void> {
		await db.delete(learningPath).where(and(eq(learningPath.id, id), eq(learningPath.userId, userId)));
	},

	/**
	 * Update milestones
	 */
	async updateMilestones(
		id: string,
		milestones: LearningPathMilestone[],
		userId?: string,
	): Promise<LearningPath | null> {
		// Calculate progress based on completed milestones
		const completedCount = milestones.filter((m) => m.completed).length;
		const progress = milestones.length > 0 ? Math.round((completedCount / milestones.length) * 100) : 0;

		const conditions = [eq(learningPath.id, id)];
		if (userId) conditions.push(eq(learningPath.userId, userId));

		const [result] = await db
			.update(learningPath)
			.set({ milestones, progress })
			.where(and(...conditions))
			.returning();
		return result ?? null;
	},

	/**
	 * Mark a milestone as complete (scoped to user)
	 */
	async completeMilestone(pathId: string, milestoneId: string, userId: string): Promise<LearningPath | null> {
		const path = await this.getById(pathId, userId);
		if (!path) return null;

		const milestones = (path.milestones ?? []).map((m) =>
			m.id === milestoneId ? { ...m, completed: true, completedAt: new Date().toISOString() } : m,
		);

		return this.updateMilestones(pathId, milestones);
	},
};

// ============================================================================
// SKILL PROGRESS SERVICE
// ============================================================================

export const skillProgressService = {
	/**
	 * Get all skill progress for a user
	 */
	async list(userId: string): Promise<SkillProgress[]> {
		return db
			.select()
			.from(skillProgress)
			.where(eq(skillProgress.userId, userId))
			.orderBy(desc(skillProgress.updatedAt));
	},

	/**
	 * Get skill progress by category
	 */
	async getByCategory(userId: string, category: string): Promise<SkillProgress[]> {
		return db
			.select()
			.from(skillProgress)
			.where(and(eq(skillProgress.userId, userId), eq(skillProgress.category, category)))
			.orderBy(desc(skillProgress.progress));
	},

	/**
	 * Get a specific skill progress
	 */
	async get(userId: string, skillName: string): Promise<SkillProgress | null> {
		const [result] = await db
			.select()
			.from(skillProgress)
			.where(and(eq(skillProgress.userId, userId), eq(skillProgress.skillName, skillName)));
		return result ?? null;
	},

	/**
	 * Get skill progress by ID
	 */
	async getById(id: string): Promise<SkillProgress | null> {
		const [result] = await db.select().from(skillProgress).where(eq(skillProgress.id, id));
		return result ?? null;
	},

	/**
	 * Create or update skill progress
	 */
	async upsert(userId: string, data: Omit<NewSkillProgress, "id" | "userId">): Promise<SkillProgress> {
		// Check if exists
		const existing = await this.get(userId, data.skillName);

		if (existing) {
			const [result] = await db
				.update(skillProgress)
				.set({
					...data,
					updatedAt: new Date(),
				})
				.where(eq(skillProgress.id, existing.id))
				.returning();
			return result;
		}

		// Create new
		const id = generateId();
		const [result] = await db
			.insert(skillProgress)
			.values({
				id,
				userId,
				...data,
			})
			.returning();
		return result;
	},

	/**
	 * Update skill level
	 */
	async updateLevel(userId: string, skillName: string, level: number, notes?: string): Promise<SkillProgress | null> {
		const existing = await this.get(userId, skillName);
		if (!existing) return null;

		// Calculate progress based on current vs target level
		const targetLevel = existing.targetLevel ?? 3;
		const progress = Math.round((level / targetLevel) * 100);

		const [result] = await db
			.update(skillProgress)
			.set({
				currentLevel: level,
				progress: Math.min(progress, 100),
				lastPracticed: new Date(),
				notes: notes ?? existing.notes,
			})
			.where(eq(skillProgress.id, existing.id))
			.returning();
		return result ?? null;
	},

	/**
	 * Log practice session
	 */
	async logPractice(userId: string, skillName: string, hours: number, notes?: string): Promise<SkillProgress | null> {
		const existing = await this.get(userId, skillName);
		if (!existing) return null;

		// Check if this is a consecutive day
		const lastPracticed = existing.lastPracticed;
		const now = new Date();
		let streak = existing.practiceStreak ?? 0;

		if (lastPracticed) {
			const daysSinceLastPractice = Math.floor(
				(now.getTime() - new Date(lastPracticed).getTime()) / (1000 * 60 * 60 * 24),
			);
			if (daysSinceLastPractice === 1) {
				streak += 1;
			} else if (daysSinceLastPractice > 1) {
				streak = 1;
			}
		} else {
			streak = 1;
		}

		const [result] = await db
			.update(skillProgress)
			.set({
				hoursInvested: Math.round(Number(existing.hoursInvested ?? 0) + hours),
				lastPracticed: now,
				practiceStreak: streak,
				notes: notes ?? existing.notes,
			})
			.where(eq(skillProgress.id, existing.id))
			.returning();
		return result ?? null;
	},

	/**
	 * Delete skill progress
	 */
	async delete(userId: string, skillName: string): Promise<void> {
		await db.delete(skillProgress).where(and(eq(skillProgress.userId, userId), eq(skillProgress.skillName, skillName)));
	},

	/**
	 * Get statistics
	 */
	async getStats(userId: string) {
		const allProgress = await this.list(userId);

		const byCategory: Record<string, { count: number; avgProgress: number; avgLevel: number }> = {};
		let totalProgress = 0;
		let totalLevel = 0;
		let totalHours = 0;

		for (const sp of allProgress) {
			const category = sp.category ?? "technical";
			if (!byCategory[category]) {
				byCategory[category] = { count: 0, avgProgress: 0, avgLevel: 0 };
			}
			byCategory[category].count += 1;
			byCategory[category].avgProgress += sp.progress ?? 0;
			byCategory[category].avgLevel += sp.currentLevel ?? 1;
			totalProgress += sp.progress ?? 0;
			totalLevel += sp.currentLevel ?? 1;
			totalHours += Number(sp.hoursInvested ?? 0);
		}

		// Calculate averages
		for (const category of Object.keys(byCategory)) {
			const cat = byCategory[category];
			cat.avgProgress = cat.count > 0 ? Math.round(cat.avgProgress / cat.count) : 0;
			cat.avgLevel = cat.count > 0 ? Math.round((cat.avgLevel / cat.count) * 10) / 10 : 0;
		}

		const skillCount = allProgress.length;
		const avgProgress = skillCount > 0 ? Math.round(totalProgress / skillCount) : 0;
		const avgLevel = skillCount > 0 ? Math.round((totalLevel / skillCount) * 10) / 10 : 0;

		// Find skills with longest streaks
		const topStreaks = [...allProgress].sort((a, b) => (b.practiceStreak ?? 0) - (a.practiceStreak ?? 0)).slice(0, 5);

		// Find most improved skills (highest progress)
		const mostImproved = [...allProgress]
			.filter((sp) => (sp.progress ?? 0) > 0)
			.sort((a, b) => (b.progress ?? 0) - (a.progress ?? 0))
			.slice(0, 5);

		return {
			totalSkills: skillCount,
			avgProgress,
			avgLevel,
			totalHoursInvested: totalHours,
			byCategory,
			topStreaks,
			mostImproved,
		};
	},
};
