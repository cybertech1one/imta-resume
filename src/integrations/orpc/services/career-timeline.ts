import { ORPCError } from "@orpc/client";
import { and, desc, eq } from "drizzle-orm";
import { schema } from "@/integrations/drizzle";
import { db } from "@/integrations/drizzle/client";
import { generateId } from "@/utils/string";

// Types
export type TimelineEventType = "job" | "promotion" | "education" | "certification" | "achievement" | "skill" | "goal";

export type TimelineSkillCategory = "technical" | "soft" | "language" | "tool";

export type TimelineGoalCategory = "position" | "salary" | "skill" | "certification" | "other";

// Event types
export type CreateEventInput = {
	userId: string;
	type: TimelineEventType;
	title: string;
	organization?: string;
	description?: string;
	startDate: string;
	endDate?: string | null;
	salary?: number;
	skills?: string[];
	achievements?: string[];
	isGoal?: boolean;
	targetDate?: string;
	completed?: boolean;
};

export type UpdateEventInput = {
	id: string;
	userId: string;
	type?: TimelineEventType;
	title?: string;
	organization?: string;
	description?: string;
	startDate?: string;
	endDate?: string | null;
	salary?: number;
	skills?: string[];
	achievements?: string[];
	isGoal?: boolean;
	targetDate?: string;
	completed?: boolean;
};

// Skill types
export type CreateSkillInput = {
	userId: string;
	name: string;
	level: number;
	acquiredDate: string;
	source?: string;
	category: TimelineSkillCategory;
};

// Goal types
export type CreateGoalInput = {
	userId: string;
	title: string;
	description?: string;
	targetDate: string;
	category: TimelineGoalCategory;
	targetValue?: number;
	currentValue?: number;
};

export type UpdateGoalInput = {
	id: string;
	userId: string;
	title?: string;
	description?: string;
	targetDate?: string;
	category?: TimelineGoalCategory;
	targetValue?: number;
	currentValue?: number;
	completed?: boolean;
};

export const careerTimelineService = {
	// ============================================
	// EVENTS
	// ============================================

	events: {
		// Create a new event
		create: async (input: CreateEventInput): Promise<string> => {
			const id = generateId();

			await db.insert(schema.careerTimelineEvent).values({
				id,
				userId: input.userId,
				type: input.type,
				title: input.title,
				organization: input.organization ?? "",
				description: input.description ?? "",
				startDate: input.startDate,
				endDate: input.endDate ?? null,
				salary: input.salary,
				skills: input.skills ?? [],
				achievements: input.achievements ?? [],
				isGoal: input.isGoal ?? false,
				targetDate: input.targetDate,
				completed: input.completed ?? false,
			});

			return id;
		},

		// Get event by ID
		getById: async (input: { id: string; userId: string }) => {
			const [event] = await db
				.select()
				.from(schema.careerTimelineEvent)
				.where(and(eq(schema.careerTimelineEvent.id, input.id), eq(schema.careerTimelineEvent.userId, input.userId)));

			if (!event) {
				throw new ORPCError("NOT_FOUND", { message: "Event not found" });
			}

			return event;
		},

		// List all events for a user
		list: async (input: { userId: string; type?: TimelineEventType }) => {
			const conditions = [eq(schema.careerTimelineEvent.userId, input.userId)];

			if (input.type) {
				conditions.push(eq(schema.careerTimelineEvent.type, input.type));
			}

			return await db
				.select()
				.from(schema.careerTimelineEvent)
				.where(and(...conditions))
				.orderBy(desc(schema.careerTimelineEvent.startDate));
		},

		// Update event
		update: async (input: UpdateEventInput): Promise<void> => {
			const [existing] = await db
				.select({ id: schema.careerTimelineEvent.id })
				.from(schema.careerTimelineEvent)
				.where(and(eq(schema.careerTimelineEvent.id, input.id), eq(schema.careerTimelineEvent.userId, input.userId)));

			if (!existing) {
				throw new ORPCError("NOT_FOUND", { message: "Event not found" });
			}

			await db
				.update(schema.careerTimelineEvent)
				.set({
					type: input.type,
					title: input.title,
					organization: input.organization,
					description: input.description,
					startDate: input.startDate,
					endDate: input.endDate,
					salary: input.salary,
					skills: input.skills,
					achievements: input.achievements,
					isGoal: input.isGoal,
					targetDate: input.targetDate,
					completed: input.completed,
				})
				.where(and(eq(schema.careerTimelineEvent.id, input.id), eq(schema.careerTimelineEvent.userId, input.userId)));
		},

		// Delete event
		delete: async (input: { id: string; userId: string }): Promise<void> => {
			await db
				.delete(schema.careerTimelineEvent)
				.where(and(eq(schema.careerTimelineEvent.id, input.id), eq(schema.careerTimelineEvent.userId, input.userId)));
		},
	},

	// ============================================
	// SKILLS
	// ============================================

	skills: {
		// Create a new skill
		create: async (input: CreateSkillInput): Promise<string> => {
			const id = generateId();

			await db.insert(schema.careerTimelineSkill).values({
				id,
				userId: input.userId,
				name: input.name,
				level: input.level,
				acquiredDate: input.acquiredDate,
				source: input.source ?? "manual",
				category: input.category,
			});

			return id;
		},

		// List all skills for a user
		list: async (input: { userId: string; category?: TimelineSkillCategory }) => {
			const conditions = [eq(schema.careerTimelineSkill.userId, input.userId)];

			if (input.category) {
				conditions.push(eq(schema.careerTimelineSkill.category, input.category));
			}

			return await db
				.select()
				.from(schema.careerTimelineSkill)
				.where(and(...conditions))
				.orderBy(desc(schema.careerTimelineSkill.acquiredDate));
		},

		// Delete skill
		delete: async (input: { id: string; userId: string }): Promise<void> => {
			await db
				.delete(schema.careerTimelineSkill)
				.where(and(eq(schema.careerTimelineSkill.id, input.id), eq(schema.careerTimelineSkill.userId, input.userId)));
		},
	},

	// ============================================
	// GOALS
	// ============================================

	goals: {
		// Create a new goal
		create: async (input: CreateGoalInput): Promise<string> => {
			const id = generateId();

			await db.insert(schema.careerTimelineGoal).values({
				id,
				userId: input.userId,
				title: input.title,
				description: input.description ?? "",
				targetDate: input.targetDate,
				category: input.category,
				targetValue: input.targetValue,
				currentValue: input.currentValue,
				completed: false,
			});

			return id;
		},

		// List all goals for a user
		list: async (input: { userId: string; completed?: boolean }) => {
			const conditions = [eq(schema.careerTimelineGoal.userId, input.userId)];

			if (input.completed !== undefined) {
				conditions.push(eq(schema.careerTimelineGoal.completed, input.completed));
			}

			return await db
				.select()
				.from(schema.careerTimelineGoal)
				.where(and(...conditions))
				.orderBy(schema.careerTimelineGoal.targetDate);
		},

		// Update goal
		update: async (input: UpdateGoalInput): Promise<void> => {
			const [existing] = await db
				.select({ id: schema.careerTimelineGoal.id })
				.from(schema.careerTimelineGoal)
				.where(and(eq(schema.careerTimelineGoal.id, input.id), eq(schema.careerTimelineGoal.userId, input.userId)));

			if (!existing) {
				throw new ORPCError("NOT_FOUND", { message: "Goal not found" });
			}

			await db
				.update(schema.careerTimelineGoal)
				.set({
					title: input.title,
					description: input.description,
					targetDate: input.targetDate,
					category: input.category,
					targetValue: input.targetValue,
					currentValue: input.currentValue,
					completed: input.completed,
				})
				.where(and(eq(schema.careerTimelineGoal.id, input.id), eq(schema.careerTimelineGoal.userId, input.userId)));
		},

		// Toggle goal completion
		toggleComplete: async (input: { id: string; userId: string }): Promise<boolean> => {
			const [existing] = await db
				.select({ completed: schema.careerTimelineGoal.completed })
				.from(schema.careerTimelineGoal)
				.where(and(eq(schema.careerTimelineGoal.id, input.id), eq(schema.careerTimelineGoal.userId, input.userId)));

			if (!existing) {
				throw new ORPCError("NOT_FOUND", { message: "Goal not found" });
			}

			const newCompleted = !existing.completed;

			await db
				.update(schema.careerTimelineGoal)
				.set({ completed: newCompleted })
				.where(and(eq(schema.careerTimelineGoal.id, input.id), eq(schema.careerTimelineGoal.userId, input.userId)));

			return newCompleted;
		},

		// Delete goal
		delete: async (input: { id: string; userId: string }): Promise<void> => {
			await db
				.delete(schema.careerTimelineGoal)
				.where(and(eq(schema.careerTimelineGoal.id, input.id), eq(schema.careerTimelineGoal.userId, input.userId)));
		},
	},

	// ============================================
	// AGGREGATED DATA
	// ============================================

	// Get all timeline data for a user (events, skills, goals)
	getAll: async (input: { userId: string }) => {
		const [events, skills, goals] = await Promise.all([
			db
				.select()
				.from(schema.careerTimelineEvent)
				.where(eq(schema.careerTimelineEvent.userId, input.userId))
				.orderBy(desc(schema.careerTimelineEvent.startDate)),
			db
				.select()
				.from(schema.careerTimelineSkill)
				.where(eq(schema.careerTimelineSkill.userId, input.userId))
				.orderBy(desc(schema.careerTimelineSkill.acquiredDate)),
			db
				.select()
				.from(schema.careerTimelineGoal)
				.where(eq(schema.careerTimelineGoal.userId, input.userId))
				.orderBy(schema.careerTimelineGoal.targetDate),
		]);

		return { events, skills, goals };
	},

	// Get statistics
	getStatistics: async (input: { userId: string }) => {
		const [events, skills, goals] = await Promise.all([
			db.select().from(schema.careerTimelineEvent).where(eq(schema.careerTimelineEvent.userId, input.userId)),
			db.select().from(schema.careerTimelineSkill).where(eq(schema.careerTimelineSkill.userId, input.userId)),
			db.select().from(schema.careerTimelineGoal).where(eq(schema.careerTimelineGoal.userId, input.userId)),
		]);

		// Calculate total experience from job events
		const jobs = events.filter((e) => e.type === "job");
		let totalMonths = 0;

		for (const job of jobs) {
			const start = new Date(job.startDate);
			const end = job.endDate ? new Date(job.endDate) : new Date();
			const diffMs = end.getTime() - start.getTime();
			totalMonths += Math.floor(diffMs / (1000 * 60 * 60 * 24 * 30));
		}

		const totalExperience = Math.round((totalMonths / 12) * 10) / 10;

		// Count events by type
		const eventsByType: Record<string, number> = {};
		for (const event of events) {
			eventsByType[event.type] = (eventsByType[event.type] ?? 0) + 1;
		}

		// Count skills by category
		const skillsByCategory: Record<string, number> = {};
		for (const skill of skills) {
			skillsByCategory[skill.category] = (skillsByCategory[skill.category] ?? 0) + 1;
		}

		// Goals statistics
		const activeGoals = goals.filter((g) => !g.completed).length;
		const completedGoals = goals.filter((g) => g.completed).length;

		// Find employment gaps
		const sortedJobs = jobs.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

		const gaps: { start: string; end: string; duration: number }[] = [];

		for (let i = 0; i < sortedJobs.length - 1; i++) {
			const currentEnd = sortedJobs[i].endDate;
			const nextStart = sortedJobs[i + 1].startDate;

			if (currentEnd) {
				const endDate = new Date(currentEnd);
				const startDate = new Date(nextStart);
				const diffDays = (startDate.getTime() - endDate.getTime()) / (1000 * 60 * 60 * 24);

				if (diffDays > 30) {
					gaps.push({
						start: currentEnd,
						end: nextStart,
						duration: Math.round(diffDays),
					});
				}
			}
		}

		// Get salary progression
		const salaryProgression = events
			.filter((e): e is typeof e & { salary: number } => e.salary !== null && e.salary > 0)
			.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
			.map((e) => ({
				date: e.startDate,
				salary: e.salary,
				title: e.title,
			}));

		return {
			totalEvents: events.length,
			totalSkills: skills.length,
			totalGoals: goals.length,
			activeGoals,
			completedGoals,
			totalExperience,
			eventsByType,
			skillsByCategory,
			employmentGaps: gaps.length,
			gaps,
			salaryProgression,
			currentSalary: salaryProgression.length > 0 ? salaryProgression[salaryProgression.length - 1].salary : null,
		};
	},
};
