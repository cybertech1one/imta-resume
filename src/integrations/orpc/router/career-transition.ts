import z from "zod";
import { protectedProcedure } from "../context";
import {
	careerTransitionService,
	type TransitionActionCategory,
	type TransitionActionPriority,
	type TransitionSkillCategory,
} from "../services/career-transition";

// Zod schemas for validation
const skillCategorySchema = z.enum(["technical", "soft", "leadership", "communication", "analytical"]);
const actionCategorySchema = z.enum(["skill", "network", "certification", "experience", "branding"]);
const actionPrioritySchema = z.enum(["high", "medium", "low"]);

const createSkillSchema = z.object({
	name: z.string().min(1),
	nameFr: z.string().min(1),
	category: skillCategorySchema,
	currentLevel: z.number().min(0).max(100),
	relevanceToTarget: z.number().min(0).max(100),
	description: z.string().optional(),
});

const updateSkillSchema = z.object({
	id: z.string().uuid(),
	name: z.string().min(1).optional(),
	nameFr: z.string().min(1).optional(),
	category: skillCategorySchema.optional(),
	currentLevel: z.number().min(0).max(100).optional(),
	relevanceToTarget: z.number().min(0).max(100).optional(),
	description: z.string().optional(),
});

const createTimelinePhaseSchema = z.object({
	name: z.string().min(1),
	nameFr: z.string().min(1),
	duration: z.string().min(1),
	durationWeeks: z.number().min(1),
	description: z.string().optional(),
	tasks: z.array(z.string()).optional(),
	icon: z.string().optional(),
	color: z.string().optional(),
	order: z.number().optional(),
});

const updateTimelinePhaseSchema = z.object({
	id: z.string().uuid(),
	name: z.string().min(1).optional(),
	nameFr: z.string().min(1).optional(),
	duration: z.string().min(1).optional(),
	durationWeeks: z.number().min(1).optional(),
	description: z.string().optional(),
	tasks: z.array(z.string()).optional(),
	icon: z.string().optional(),
	color: z.string().optional(),
	order: z.number().optional(),
	completed: z.boolean().optional(),
});

const createActionItemSchema = z.object({
	task: z.string().min(1),
	taskFr: z.string().min(1),
	category: actionCategorySchema,
	priority: actionPrioritySchema.optional(),
	deadline: z.coerce.date(),
	estimatedHours: z.number().min(1).optional(),
});

const updateActionItemSchema = z.object({
	id: z.string().uuid(),
	task: z.string().min(1).optional(),
	taskFr: z.string().min(1).optional(),
	category: actionCategorySchema.optional(),
	priority: actionPrioritySchema.optional(),
	deadline: z.coerce.date().optional(),
	completed: z.boolean().optional(),
	estimatedHours: z.number().min(1).optional(),
});

export const careerTransitionRouter = {
	// ============================================
	// SKILLS ROUTES
	// ============================================

	skillsCreate: protectedProcedure
		.route({
			method: "POST",
			path: "/career-transition/skills",
			tags: ["Career Transition"],
			summary: "Create a transition skill",
		})
		.input(createSkillSchema)
		.handler(async ({ context, input }) => {
			return await careerTransitionService.skills.create({
				userId: context.user.id,
				...input,
			});
		}),

	skillsGetById: protectedProcedure
		.route({
			method: "GET",
			path: "/career-transition/skills/{id}",
			tags: ["Career Transition"],
			summary: "Get skill by ID",
		})
		.input(z.object({ id: z.string().uuid() }))
		.handler(async ({ context, input }) => {
			return await careerTransitionService.skills.getById({
				userId: context.user.id,
				id: input.id,
			});
		}),

	skillsList: protectedProcedure
		.route({
			method: "GET",
			path: "/career-transition/skills",
			tags: ["Career Transition"],
			summary: "List transition skills",
		})
		.input(
			z
				.object({
					category: skillCategorySchema.optional(),
				})
				.optional(),
		)
		.handler(async ({ context, input }) => {
			return await careerTransitionService.skills.list({
				userId: context.user.id,
				category: input?.category as TransitionSkillCategory | undefined,
			});
		}),

	skillsUpdate: protectedProcedure
		.route({
			method: "PUT",
			path: "/career-transition/skills/{id}",
			tags: ["Career Transition"],
			summary: "Update a transition skill",
		})
		.input(updateSkillSchema)
		.handler(async ({ context, input }) => {
			await careerTransitionService.skills.update({
				userId: context.user.id,
				...input,
			});
		}),

	skillsDelete: protectedProcedure
		.route({
			method: "DELETE",
			path: "/career-transition/skills/{id}",
			tags: ["Career Transition"],
			summary: "Delete a transition skill",
		})
		.input(z.object({ id: z.string().uuid() }))
		.handler(async ({ context, input }) => {
			await careerTransitionService.skills.delete({
				userId: context.user.id,
				id: input.id,
			});
		}),

	// ============================================
	// TIMELINE ROUTES
	// ============================================

	timelineCreate: protectedProcedure
		.route({
			method: "POST",
			path: "/career-transition/timeline",
			tags: ["Career Transition"],
			summary: "Create a timeline phase",
		})
		.input(createTimelinePhaseSchema)
		.handler(async ({ context, input }) => {
			return await careerTransitionService.timeline.create({
				userId: context.user.id,
				...input,
			});
		}),

	timelineGetById: protectedProcedure
		.route({
			method: "GET",
			path: "/career-transition/timeline/{id}",
			tags: ["Career Transition"],
			summary: "Get timeline phase by ID",
		})
		.input(z.object({ id: z.string().uuid() }))
		.handler(async ({ context, input }) => {
			return await careerTransitionService.timeline.getById({
				userId: context.user.id,
				id: input.id,
			});
		}),

	timelineList: protectedProcedure
		.route({
			method: "GET",
			path: "/career-transition/timeline",
			tags: ["Career Transition"],
			summary: "List timeline phases",
		})
		.input(z.object({}).optional())
		.handler(async ({ context }) => {
			return await careerTransitionService.timeline.list({
				userId: context.user.id,
			});
		}),

	timelineUpdate: protectedProcedure
		.route({
			method: "PUT",
			path: "/career-transition/timeline/{id}",
			tags: ["Career Transition"],
			summary: "Update a timeline phase",
		})
		.input(updateTimelinePhaseSchema)
		.handler(async ({ context, input }) => {
			await careerTransitionService.timeline.update({
				userId: context.user.id,
				...input,
			});
		}),

	timelineToggle: protectedProcedure
		.route({
			method: "POST",
			path: "/career-transition/timeline/{id}/toggle",
			tags: ["Career Transition"],
			summary: "Toggle timeline phase completion",
		})
		.input(z.object({ id: z.string().uuid() }))
		.handler(async ({ context, input }) => {
			return await careerTransitionService.timeline.toggle({
				userId: context.user.id,
				id: input.id,
			});
		}),

	timelineDelete: protectedProcedure
		.route({
			method: "DELETE",
			path: "/career-transition/timeline/{id}",
			tags: ["Career Transition"],
			summary: "Delete a timeline phase",
		})
		.input(z.object({ id: z.string().uuid() }))
		.handler(async ({ context, input }) => {
			await careerTransitionService.timeline.delete({
				userId: context.user.id,
				id: input.id,
			});
		}),

	// ============================================
	// ACTION ITEMS ROUTES
	// ============================================

	actionsCreate: protectedProcedure
		.route({
			method: "POST",
			path: "/career-transition/actions",
			tags: ["Career Transition"],
			summary: "Create an action item",
		})
		.input(createActionItemSchema)
		.handler(async ({ context, input }) => {
			return await careerTransitionService.actions.create({
				userId: context.user.id,
				...input,
			});
		}),

	actionsGetById: protectedProcedure
		.route({
			method: "GET",
			path: "/career-transition/actions/{id}",
			tags: ["Career Transition"],
			summary: "Get action item by ID",
		})
		.input(z.object({ id: z.string().uuid() }))
		.handler(async ({ context, input }) => {
			return await careerTransitionService.actions.getById({
				userId: context.user.id,
				id: input.id,
			});
		}),

	actionsList: protectedProcedure
		.route({
			method: "GET",
			path: "/career-transition/actions",
			tags: ["Career Transition"],
			summary: "List action items",
		})
		.input(
			z
				.object({
					category: actionCategorySchema.optional(),
					priority: actionPrioritySchema.optional(),
					completed: z.boolean().optional(),
				})
				.optional(),
		)
		.handler(async ({ context, input }) => {
			return await careerTransitionService.actions.list({
				userId: context.user.id,
				category: input?.category as TransitionActionCategory | undefined,
				priority: input?.priority as TransitionActionPriority | undefined,
				completed: input?.completed,
			});
		}),

	actionsUpdate: protectedProcedure
		.route({
			method: "PUT",
			path: "/career-transition/actions/{id}",
			tags: ["Career Transition"],
			summary: "Update an action item",
		})
		.input(updateActionItemSchema)
		.handler(async ({ context, input }) => {
			await careerTransitionService.actions.update({
				userId: context.user.id,
				...input,
			});
		}),

	actionsToggle: protectedProcedure
		.route({
			method: "POST",
			path: "/career-transition/actions/{id}/toggle",
			tags: ["Career Transition"],
			summary: "Toggle action item completion",
		})
		.input(z.object({ id: z.string().uuid() }))
		.handler(async ({ context, input }) => {
			return await careerTransitionService.actions.toggle({
				userId: context.user.id,
				id: input.id,
			});
		}),

	actionsDelete: protectedProcedure
		.route({
			method: "DELETE",
			path: "/career-transition/actions/{id}",
			tags: ["Career Transition"],
			summary: "Delete an action item",
		})
		.input(z.object({ id: z.string().uuid() }))
		.handler(async ({ context, input }) => {
			await careerTransitionService.actions.delete({
				userId: context.user.id,
				id: input.id,
			});
		}),

	actionsGetStatistics: protectedProcedure
		.route({
			method: "GET",
			path: "/career-transition/actions/statistics",
			tags: ["Career Transition"],
			summary: "Get action statistics",
		})
		.input(z.object({}).optional())
		.handler(async ({ context }) => {
			return await careerTransitionService.actions.getStatistics({
				userId: context.user.id,
			});
		}),

	// ============================================
	// OVERVIEW
	// ============================================

	getOverview: protectedProcedure
		.route({
			method: "GET",
			path: "/career-transition/overview",
			tags: ["Career Transition"],
			summary: "Get career transition overview",
		})
		.input(z.object({}).optional())
		.handler(async ({ context }) => {
			return await careerTransitionService.getOverview({
				userId: context.user.id,
			});
		}),
};
