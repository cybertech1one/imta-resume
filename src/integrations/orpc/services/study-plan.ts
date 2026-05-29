import { eq } from "drizzle-orm";
import { schema } from "@/integrations/drizzle";
import { db } from "@/integrations/drizzle/client";
import type { StudyPlanData } from "@/integrations/drizzle/schema";
import { generateId } from "@/utils/string";

// Re-export types from schema
export type {
	StudyPlanBadge,
	StudyPlanCareerGoal,
	StudyPlanData,
	StudyPlanFlashcard,
	StudyPlanMilestone,
	StudyPlanResource,
	StudyPlanSkill,
	StudyPlanStreak,
	StudyPlanTask,
} from "@/integrations/drizzle/schema";

// Default study plan data
const getDefaultStudyPlanData = (): StudyPlanData => ({
	careerGoal: null,
	skills: [],
	resources: [],
	tasks: [],
	milestones: [],
	flashcards: [],
	streak: {
		currentStreak: 0,
		longestStreak: 0,
		lastStudyDate: "",
		totalStudyDays: 0,
		totalStudyMinutes: 0,
		weeklyGoal: 300, // 5 hours per week
		badges: [],
	},
	lastUpdated: new Date().toISOString(),
});

export const studyPlanService = {
	// Get or create study plan for user
	get: async (input: { userId: string }): Promise<StudyPlanData> => {
		const [existingPlan] = await db.select().from(schema.studyPlan).where(eq(schema.studyPlan.userId, input.userId));

		if (existingPlan) {
			return existingPlan.data;
		}

		// Create new plan if doesn't exist
		const id = generateId();
		const defaultData = getDefaultStudyPlanData();

		await db.insert(schema.studyPlan).values({
			id,
			userId: input.userId,
			data: defaultData,
		});

		return defaultData;
	},

	// Update entire study plan data
	update: async (input: { userId: string; data: StudyPlanData }): Promise<StudyPlanData> => {
		const [existingPlan] = await db
			.select({ id: schema.studyPlan.id })
			.from(schema.studyPlan)
			.where(eq(schema.studyPlan.userId, input.userId));

		const updatedData = {
			...input.data,
			lastUpdated: new Date().toISOString(),
		};

		if (existingPlan) {
			await db.update(schema.studyPlan).set({ data: updatedData }).where(eq(schema.studyPlan.userId, input.userId));
		} else {
			// Create if doesn't exist
			const id = generateId();
			await db.insert(schema.studyPlan).values({
				id,
				userId: input.userId,
				data: updatedData,
			});
		}

		return updatedData;
	},

	// Reset study plan to default
	reset: async (input: { userId: string }): Promise<StudyPlanData> => {
		const defaultData = getDefaultStudyPlanData();

		const [existingPlan] = await db
			.select({ id: schema.studyPlan.id })
			.from(schema.studyPlan)
			.where(eq(schema.studyPlan.userId, input.userId));

		if (existingPlan) {
			await db.update(schema.studyPlan).set({ data: defaultData }).where(eq(schema.studyPlan.userId, input.userId));
		} else {
			const id = generateId();
			await db.insert(schema.studyPlan).values({
				id,
				userId: input.userId,
				data: defaultData,
			});
		}

		return defaultData;
	},

	// Get statistics
	getStatistics: async (input: { userId: string }) => {
		const data = await studyPlanService.get(input);

		const totalSkills = data.skills.length;
		const completedSkills = data.skills.filter((s) => s.currentLevel >= s.targetLevel).length;
		const skillProgress =
			totalSkills > 0
				? Math.round(
						data.skills.reduce((sum, s) => sum + ((s.currentLevel - 1) / (s.targetLevel - 1)) * 100, 0) / totalSkills,
					)
				: 0;

		const totalMilestones = data.milestones.length;
		const completedMilestones = data.milestones.filter((m) => m.completed).length;

		const totalResources = data.resources.length;
		const completedResources = data.resources.filter((r) => r.completed).length;

		const totalTasks = data.tasks.length;
		const completedTasks = data.tasks.filter((t) => t.completed).length;

		const today = new Date().toISOString().split("T")[0];
		const todayTasks = data.tasks.filter((t) => t.scheduledDate.split("T")[0] === today);
		const completedTodayTasks = todayTasks.filter((t) => t.completed).length;

		// Calculate week progress
		const weekStart = new Date();
		weekStart.setDate(weekStart.getDate() - weekStart.getDay());
		const weekTasks = data.tasks.filter(
			(t) => new Date(t.scheduledDate) >= weekStart && new Date(t.scheduledDate) <= new Date(),
		);
		const completedWeekMinutes = weekTasks.filter((t) => t.completed).reduce((sum, t) => sum + t.duration, 0);
		const weekProgress = Math.min(100, Math.round((completedWeekMinutes / data.streak.weeklyGoal) * 100));

		// Due flashcards
		const now = new Date();
		const dueFlashcards = data.flashcards.filter((f) => new Date(f.nextReview) <= now).length;

		return {
			skillProgress,
			totalSkills,
			completedSkills,
			totalMilestones,
			completedMilestones,
			totalResources,
			completedResources,
			totalTasks,
			completedTasks,
			todayTasksTotal: todayTasks.length,
			todayTasksCompleted: completedTodayTasks,
			weekProgress,
			currentStreak: data.streak.currentStreak,
			longestStreak: data.streak.longestStreak,
			totalStudyDays: data.streak.totalStudyDays,
			totalStudyMinutes: data.streak.totalStudyMinutes,
			badgeCount: data.streak.badges.length,
			dueFlashcards,
			hasCareerGoal: !!data.careerGoal,
		};
	},
};
