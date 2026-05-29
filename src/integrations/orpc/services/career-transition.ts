import { ORPCError } from "@orpc/client";
import { and, desc, eq } from "drizzle-orm";
import { schema } from "@/integrations/drizzle";
import { db } from "@/integrations/drizzle/client";
import { generateId } from "@/utils/string";

// Type exports
export type TransitionSkillCategory = "technical" | "soft" | "leadership" | "communication" | "analytical";
export type TransitionActionCategory = "skill" | "network" | "certification" | "experience" | "branding";
export type TransitionActionPriority = "high" | "medium" | "low";

export type TransitionSkillRow = typeof schema.transitionSkill.$inferSelect;
export type TransitionTimelinePhaseRow = typeof schema.transitionTimelinePhase.$inferSelect;
export type TransitionActionItemRow = typeof schema.transitionActionItem.$inferSelect;

// Input types
export type CreateSkillInput = {
	userId: string;
	name: string;
	nameFr: string;
	category: TransitionSkillCategory;
	currentLevel: number;
	relevanceToTarget: number;
	description?: string;
};

export type UpdateSkillInput = {
	id: string;
	userId: string;
	name?: string;
	nameFr?: string;
	category?: TransitionSkillCategory;
	currentLevel?: number;
	relevanceToTarget?: number;
	description?: string;
};

export type CreateTimelinePhaseInput = {
	userId: string;
	name: string;
	nameFr: string;
	duration: string;
	durationWeeks: number;
	description?: string;
	tasks?: string[];
	icon?: string;
	color?: string;
	order?: number;
};

export type UpdateTimelinePhaseInput = {
	id: string;
	userId: string;
	name?: string;
	nameFr?: string;
	duration?: string;
	durationWeeks?: number;
	description?: string;
	tasks?: string[];
	icon?: string;
	color?: string;
	order?: number;
	completed?: boolean;
};

export type CreateActionItemInput = {
	userId: string;
	task: string;
	taskFr: string;
	category: TransitionActionCategory;
	priority?: TransitionActionPriority;
	deadline: Date;
	estimatedHours?: number;
};

export type UpdateActionItemInput = {
	id: string;
	userId: string;
	task?: string;
	taskFr?: string;
	category?: TransitionActionCategory;
	priority?: TransitionActionPriority;
	deadline?: Date;
	completed?: boolean;
	estimatedHours?: number;
};

export const careerTransitionService = {
	// ============================================
	// TRANSFERABLE SKILLS
	// ============================================

	skills: {
		// Create a new skill
		create: async (input: CreateSkillInput): Promise<string> => {
			const id = generateId();

			await db.insert(schema.transitionSkill).values({
				id,
				userId: input.userId,
				name: input.name,
				nameFr: input.nameFr,
				category: input.category,
				currentLevel: input.currentLevel,
				relevanceToTarget: input.relevanceToTarget,
				description: input.description ?? "",
			});

			return id;
		},

		// Get skill by ID
		getById: async (input: { id: string; userId: string }): Promise<TransitionSkillRow> => {
			const [skill] = await db
				.select()
				.from(schema.transitionSkill)
				.where(and(eq(schema.transitionSkill.id, input.id), eq(schema.transitionSkill.userId, input.userId)));

			if (!skill) {
				throw new ORPCError("NOT_FOUND", { message: "Skill not found" });
			}

			return skill;
		},

		// List all skills for a user
		list: async (input: { userId: string; category?: TransitionSkillCategory }): Promise<TransitionSkillRow[]> => {
			const conditions = [eq(schema.transitionSkill.userId, input.userId)];

			if (input.category) {
				conditions.push(eq(schema.transitionSkill.category, input.category));
			}

			return await db
				.select()
				.from(schema.transitionSkill)
				.where(and(...conditions))
				.orderBy(desc(schema.transitionSkill.relevanceToTarget));
		},

		// Update a skill
		update: async (input: UpdateSkillInput): Promise<void> => {
			const [existing] = await db
				.select({ id: schema.transitionSkill.id })
				.from(schema.transitionSkill)
				.where(and(eq(schema.transitionSkill.id, input.id), eq(schema.transitionSkill.userId, input.userId)));

			if (!existing) {
				throw new ORPCError("NOT_FOUND", { message: "Skill not found" });
			}

			await db
				.update(schema.transitionSkill)
				.set({
					name: input.name,
					nameFr: input.nameFr,
					category: input.category,
					currentLevel: input.currentLevel,
					relevanceToTarget: input.relevanceToTarget,
					description: input.description,
				})
				.where(and(eq(schema.transitionSkill.id, input.id), eq(schema.transitionSkill.userId, input.userId)));
		},

		// Delete a skill
		delete: async (input: { id: string; userId: string }): Promise<void> => {
			await db
				.delete(schema.transitionSkill)
				.where(and(eq(schema.transitionSkill.id, input.id), eq(schema.transitionSkill.userId, input.userId)));
		},
	},

	// ============================================
	// TIMELINE PHASES
	// ============================================

	timeline: {
		// Create a new timeline phase
		create: async (input: CreateTimelinePhaseInput): Promise<string> => {
			const id = generateId();

			// Get max order if not provided
			let order = input.order;
			if (order === undefined) {
				const maxOrderResult = await db
					.select({ maxOrder: schema.transitionTimelinePhase.order })
					.from(schema.transitionTimelinePhase)
					.where(eq(schema.transitionTimelinePhase.userId, input.userId))
					.orderBy(desc(schema.transitionTimelinePhase.order))
					.limit(1);

				order = (maxOrderResult[0]?.maxOrder ?? -1) + 1;
			}

			await db.insert(schema.transitionTimelinePhase).values({
				id,
				userId: input.userId,
				name: input.name,
				nameFr: input.nameFr,
				duration: input.duration,
				durationWeeks: input.durationWeeks,
				description: input.description ?? "",
				tasks: input.tasks ?? [],
				icon: input.icon ?? "CalendarIcon",
				color: input.color ?? "bg-blue-500",
				order,
			});

			return id;
		},

		// Get timeline phase by ID
		getById: async (input: { id: string; userId: string }): Promise<TransitionTimelinePhaseRow> => {
			const [phase] = await db
				.select()
				.from(schema.transitionTimelinePhase)
				.where(
					and(eq(schema.transitionTimelinePhase.id, input.id), eq(schema.transitionTimelinePhase.userId, input.userId)),
				);

			if (!phase) {
				throw new ORPCError("NOT_FOUND", { message: "Timeline phase not found" });
			}

			return phase;
		},

		// List all timeline phases for a user
		list: async (input: { userId: string }): Promise<TransitionTimelinePhaseRow[]> => {
			return await db
				.select()
				.from(schema.transitionTimelinePhase)
				.where(eq(schema.transitionTimelinePhase.userId, input.userId))
				.orderBy(schema.transitionTimelinePhase.order);
		},

		// Update a timeline phase
		update: async (input: UpdateTimelinePhaseInput): Promise<void> => {
			const [existing] = await db
				.select({ id: schema.transitionTimelinePhase.id, completed: schema.transitionTimelinePhase.completed })
				.from(schema.transitionTimelinePhase)
				.where(
					and(eq(schema.transitionTimelinePhase.id, input.id), eq(schema.transitionTimelinePhase.userId, input.userId)),
				);

			if (!existing) {
				throw new ORPCError("NOT_FOUND", { message: "Timeline phase not found" });
			}

			const updateData: Partial<TransitionTimelinePhaseRow> = {
				name: input.name,
				nameFr: input.nameFr,
				duration: input.duration,
				durationWeeks: input.durationWeeks,
				description: input.description,
				tasks: input.tasks,
				icon: input.icon,
				color: input.color,
				order: input.order,
				completed: input.completed,
			};

			// Set completedAt when marking as completed
			if (input.completed && !existing.completed) {
				updateData.completedAt = new Date();
			} else if (input.completed === false && existing.completed) {
				updateData.completedAt = null;
			}

			await db
				.update(schema.transitionTimelinePhase)
				.set(updateData)
				.where(
					and(eq(schema.transitionTimelinePhase.id, input.id), eq(schema.transitionTimelinePhase.userId, input.userId)),
				);
		},

		// Toggle phase completion
		toggle: async (input: { id: string; userId: string }): Promise<boolean> => {
			const [existing] = await db
				.select({ completed: schema.transitionTimelinePhase.completed })
				.from(schema.transitionTimelinePhase)
				.where(
					and(eq(schema.transitionTimelinePhase.id, input.id), eq(schema.transitionTimelinePhase.userId, input.userId)),
				);

			if (!existing) {
				throw new ORPCError("NOT_FOUND", { message: "Timeline phase not found" });
			}

			const newCompleted = !existing.completed;

			await db
				.update(schema.transitionTimelinePhase)
				.set({
					completed: newCompleted,
					completedAt: newCompleted ? new Date() : null,
				})
				.where(
					and(eq(schema.transitionTimelinePhase.id, input.id), eq(schema.transitionTimelinePhase.userId, input.userId)),
				);

			return newCompleted;
		},

		// Delete a timeline phase
		delete: async (input: { id: string; userId: string }): Promise<void> => {
			await db
				.delete(schema.transitionTimelinePhase)
				.where(
					and(eq(schema.transitionTimelinePhase.id, input.id), eq(schema.transitionTimelinePhase.userId, input.userId)),
				);
		},
	},

	// ============================================
	// ACTION ITEMS
	// ============================================

	actions: {
		// Create a new action item
		create: async (input: CreateActionItemInput): Promise<string> => {
			const id = generateId();

			await db.insert(schema.transitionActionItem).values({
				id,
				userId: input.userId,
				task: input.task,
				taskFr: input.taskFr,
				category: input.category,
				priority: input.priority ?? "medium",
				deadline: input.deadline.toISOString().split("T")[0],
				estimatedHours: input.estimatedHours ?? 1,
			});

			return id;
		},

		// Get action item by ID
		getById: async (input: { id: string; userId: string }): Promise<TransitionActionItemRow> => {
			const [action] = await db
				.select()
				.from(schema.transitionActionItem)
				.where(and(eq(schema.transitionActionItem.id, input.id), eq(schema.transitionActionItem.userId, input.userId)));

			if (!action) {
				throw new ORPCError("NOT_FOUND", { message: "Action item not found" });
			}

			return action;
		},

		// List all action items for a user
		list: async (input: {
			userId: string;
			category?: TransitionActionCategory;
			priority?: TransitionActionPriority;
			completed?: boolean;
		}): Promise<TransitionActionItemRow[]> => {
			const conditions = [eq(schema.transitionActionItem.userId, input.userId)];

			if (input.category) {
				conditions.push(eq(schema.transitionActionItem.category, input.category));
			}

			if (input.priority) {
				conditions.push(eq(schema.transitionActionItem.priority, input.priority));
			}

			if (input.completed !== undefined) {
				conditions.push(eq(schema.transitionActionItem.completed, input.completed));
			}

			return await db
				.select()
				.from(schema.transitionActionItem)
				.where(and(...conditions))
				.orderBy(schema.transitionActionItem.deadline, desc(schema.transitionActionItem.priority));
		},

		// Update an action item
		update: async (input: UpdateActionItemInput): Promise<void> => {
			const [existing] = await db
				.select({ id: schema.transitionActionItem.id, completed: schema.transitionActionItem.completed })
				.from(schema.transitionActionItem)
				.where(and(eq(schema.transitionActionItem.id, input.id), eq(schema.transitionActionItem.userId, input.userId)));

			if (!existing) {
				throw new ORPCError("NOT_FOUND", { message: "Action item not found" });
			}

			const updateData: Partial<TransitionActionItemRow> = {
				task: input.task,
				taskFr: input.taskFr,
				category: input.category,
				priority: input.priority,
				deadline: input.deadline ? input.deadline.toISOString().split("T")[0] : undefined,
				completed: input.completed,
				estimatedHours: input.estimatedHours,
			};

			// Set completedAt when marking as completed
			if (input.completed && !existing.completed) {
				updateData.completedAt = new Date();
			} else if (input.completed === false && existing.completed) {
				updateData.completedAt = null;
			}

			await db
				.update(schema.transitionActionItem)
				.set(updateData)
				.where(and(eq(schema.transitionActionItem.id, input.id), eq(schema.transitionActionItem.userId, input.userId)));
		},

		// Toggle action item completion
		toggle: async (input: { id: string; userId: string }): Promise<boolean> => {
			const [existing] = await db
				.select({ completed: schema.transitionActionItem.completed })
				.from(schema.transitionActionItem)
				.where(and(eq(schema.transitionActionItem.id, input.id), eq(schema.transitionActionItem.userId, input.userId)));

			if (!existing) {
				throw new ORPCError("NOT_FOUND", { message: "Action item not found" });
			}

			const newCompleted = !existing.completed;

			await db
				.update(schema.transitionActionItem)
				.set({
					completed: newCompleted,
					completedAt: newCompleted ? new Date() : null,
				})
				.where(and(eq(schema.transitionActionItem.id, input.id), eq(schema.transitionActionItem.userId, input.userId)));

			return newCompleted;
		},

		// Delete an action item
		delete: async (input: { id: string; userId: string }): Promise<void> => {
			await db
				.delete(schema.transitionActionItem)
				.where(and(eq(schema.transitionActionItem.id, input.id), eq(schema.transitionActionItem.userId, input.userId)));
		},

		// Get statistics
		getStatistics: async (input: { userId: string }) => {
			const actions = await db
				.select()
				.from(schema.transitionActionItem)
				.where(eq(schema.transitionActionItem.userId, input.userId));

			const total = actions.length;
			const completed = actions.filter((a) => a.completed).length;
			const byCategory: Record<string, number> = {};
			const byPriority: Record<string, number> = {};

			for (const action of actions) {
				byCategory[action.category] = (byCategory[action.category] ?? 0) + 1;
				byPriority[action.priority] = (byPriority[action.priority] ?? 0) + 1;
			}

			const totalHours = actions.reduce((sum, a) => sum + a.estimatedHours, 0);
			const completedHours = actions.filter((a) => a.completed).reduce((sum, a) => sum + a.estimatedHours, 0);
			const urgentIncomplete = actions.filter((a) => a.priority === "high" && !a.completed).length;

			return {
				total,
				completed,
				byCategory,
				byPriority,
				totalHours,
				completedHours,
				urgentIncomplete,
				completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
			};
		},
	},

	// ============================================
	// OVERALL STATISTICS
	// ============================================

	getOverview: async (input: { userId: string }) => {
		const [skills, phases, actions] = await Promise.all([
			careerTransitionService.skills.list(input),
			careerTransitionService.timeline.list(input),
			careerTransitionService.actions.list(input),
		]);

		// Calculate overall readiness based on skills
		const overallReadiness =
			skills.length > 0
				? Math.round(
						skills.reduce((sum, skill) => {
							const effectiveness = (skill.currentLevel / 100) * (skill.relevanceToTarget / 100);
							return sum + effectiveness * 100;
						}, 0) / skills.length,
					)
				: 0;

		const completedPhases = phases.filter((p) => p.completed).length;
		const completedActions = actions.filter((a) => a.completed).length;

		return {
			overallReadiness,
			skills: {
				total: skills.length,
				byCategory: skills.reduce(
					(acc, skill) => {
						acc[skill.category] = (acc[skill.category] ?? 0) + 1;
						return acc;
					},
					{} as Record<string, number>,
				),
			},
			timeline: {
				total: phases.length,
				completed: completedPhases,
				completionRate: phases.length > 0 ? Math.round((completedPhases / phases.length) * 100) : 0,
			},
			actions: {
				total: actions.length,
				completed: completedActions,
				completionRate: actions.length > 0 ? Math.round((completedActions / actions.length) * 100) : 0,
			},
		};
	},
};
