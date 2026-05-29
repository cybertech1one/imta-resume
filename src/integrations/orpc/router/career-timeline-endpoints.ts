import z from "zod";
import { protectedProcedure } from "../context";
import { careerTimelineService, type TimelineEventType, type TimelineSkillCategory } from "../services/career-timeline";

export const careerTimelineEndpoints = {
	// Get all timeline data (events, skills, goals)
	getAll: protectedProcedure
		.route({
			method: "GET",
			path: "/career/timeline",
			tags: ["Career Timeline"],
			summary: "Get all career timeline data",
		})
		.output(
			z.object({
				events: z.array(
					z.object({
						id: z.string().uuid(),
						userId: z.string(),
						type: z.enum(["job", "promotion", "education", "certification", "achievement", "skill", "goal"]),
						title: z.string(),
						organization: z.string(),
						description: z.string(),
						startDate: z.string(),
						endDate: z.string().nullable(),
						salary: z.number().nullable(),
						skills: z.array(z.string()).nullable(),
						achievements: z.array(z.string()).nullable(),
						isGoal: z.boolean(),
						targetDate: z.string().nullable(),
						completed: z.boolean(),
						createdAt: z.coerce.date(),
						updatedAt: z.coerce.date(),
					}),
				),
				skills: z.array(
					z.object({
						id: z.string().uuid(),
						userId: z.string(),
						name: z.string(),
						level: z.number(),
						acquiredDate: z.string(),
						source: z.string(),
						category: z.enum(["technical", "soft", "language", "tool"]),
						createdAt: z.coerce.date(),
					}),
				),
				goals: z.array(
					z.object({
						id: z.string().uuid(),
						userId: z.string(),
						title: z.string(),
						description: z.string(),
						targetDate: z.string(),
						category: z.enum(["position", "salary", "skill", "certification", "other"]),
						targetValue: z.number().nullable(),
						currentValue: z.number().nullable(),
						completed: z.boolean(),
						createdAt: z.coerce.date(),
						updatedAt: z.coerce.date(),
					}),
				),
			}),
		)
		.handler(async ({ context }) => {
			return await careerTimelineService.getAll({ userId: context.user.id });
		}),

	// Get timeline statistics
	getStatistics: protectedProcedure
		.route({
			method: "GET",
			path: "/career/timeline/statistics",
			tags: ["Career Timeline"],
			summary: "Get career timeline statistics",
		})
		.output(
			z.object({
				totalEvents: z.number(),
				totalSkills: z.number(),
				totalGoals: z.number(),
				activeGoals: z.number(),
				completedGoals: z.number(),
				totalExperience: z.number(),
				eventsByType: z.record(z.string(), z.number()),
				skillsByCategory: z.record(z.string(), z.number()),
				employmentGaps: z.number(),
				gaps: z.array(
					z.object({
						start: z.string(),
						end: z.string(),
						duration: z.number(),
					}),
				),
				salaryProgression: z.array(
					z.object({
						date: z.string(),
						salary: z.number(),
						title: z.string(),
					}),
				),
				currentSalary: z.number().nullable(),
			}),
		)
		.handler(async ({ context }) => {
			return await careerTimelineService.getStatistics({ userId: context.user.id });
		}),

	// Events endpoints
	events: {
		// Create event
		create: protectedProcedure
			.route({
				method: "POST",
				path: "/career/timeline/events",
				tags: ["Career Timeline"],
				summary: "Create a timeline event",
			})
			.input(
				z.object({
					type: z.enum(["job", "promotion", "education", "certification", "achievement", "skill", "goal"]),
					title: z.string().min(1),
					organization: z.string().optional(),
					description: z.string().optional(),
					startDate: z.string(),
					endDate: z.string().nullable().optional(),
					salary: z.number().optional(),
					skills: z.array(z.string()).optional(),
					achievements: z.array(z.string()).optional(),
					isGoal: z.boolean().optional(),
					targetDate: z.string().optional(),
					completed: z.boolean().optional(),
				}),
			)
			.output(z.string())
			.handler(async ({ context, input }) => {
				return await careerTimelineService.events.create({
					...input,
					userId: context.user.id,
				});
			}),

		// Get event by ID
		getById: protectedProcedure
			.route({
				method: "GET",
				path: "/career/timeline/events/{id}",
				tags: ["Career Timeline"],
				summary: "Get a timeline event by ID",
			})
			.input(z.object({ id: z.string().uuid() }))
			.output(
				z.object({
					id: z.string().uuid(),
					userId: z.string(),
					type: z.enum(["job", "promotion", "education", "certification", "achievement", "skill", "goal"]),
					title: z.string(),
					organization: z.string(),
					description: z.string(),
					startDate: z.string(),
					endDate: z.string().nullable(),
					salary: z.number().nullable(),
					skills: z.array(z.string()).nullable(),
					achievements: z.array(z.string()).nullable(),
					isGoal: z.boolean(),
					targetDate: z.string().nullable(),
					completed: z.boolean(),
					createdAt: z.coerce.date(),
					updatedAt: z.coerce.date(),
				}),
			)
			.handler(async ({ context, input }) => {
				return await careerTimelineService.events.getById({
					id: input.id,
					userId: context.user.id,
				});
			}),

		// List events
		list: protectedProcedure
			.route({
				method: "GET",
				path: "/career/timeline/events",
				tags: ["Career Timeline"],
				summary: "List timeline events",
			})
			.input(
				z
					.object({
						type: z.enum(["job", "promotion", "education", "certification", "achievement", "skill", "goal"]).optional(),
					})
					.optional()
					.default({}),
			)
			.output(
				z.array(
					z.object({
						id: z.string().uuid(),
						userId: z.string(),
						type: z.enum(["job", "promotion", "education", "certification", "achievement", "skill", "goal"]),
						title: z.string(),
						organization: z.string(),
						description: z.string(),
						startDate: z.string(),
						endDate: z.string().nullable(),
						salary: z.number().nullable(),
						skills: z.array(z.string()).nullable(),
						achievements: z.array(z.string()).nullable(),
						isGoal: z.boolean(),
						targetDate: z.string().nullable(),
						completed: z.boolean(),
						createdAt: z.coerce.date(),
						updatedAt: z.coerce.date(),
					}),
				),
			)
			.handler(async ({ context, input }) => {
				return await careerTimelineService.events.list({
					userId: context.user.id,
					type: input.type as TimelineEventType | undefined,
				});
			}),

		// Update event
		update: protectedProcedure
			.route({
				method: "PUT",
				path: "/career/timeline/events/{id}",
				tags: ["Career Timeline"],
				summary: "Update a timeline event",
			})
			.input(
				z.object({
					id: z.string().uuid(),
					type: z.enum(["job", "promotion", "education", "certification", "achievement", "skill", "goal"]).optional(),
					title: z.string().min(1).optional(),
					organization: z.string().optional(),
					description: z.string().optional(),
					startDate: z.string().optional(),
					endDate: z.string().nullable().optional(),
					salary: z.number().optional(),
					skills: z.array(z.string()).optional(),
					achievements: z.array(z.string()).optional(),
					isGoal: z.boolean().optional(),
					targetDate: z.string().optional(),
					completed: z.boolean().optional(),
				}),
			)
			.output(z.void())
			.handler(async ({ context, input }) => {
				return await careerTimelineService.events.update({
					...input,
					userId: context.user.id,
				});
			}),

		// Delete event
		delete: protectedProcedure
			.route({
				method: "DELETE",
				path: "/career/timeline/events/{id}",
				tags: ["Career Timeline"],
				summary: "Delete a timeline event",
			})
			.input(z.object({ id: z.string().uuid() }))
			.output(z.void())
			.handler(async ({ context, input }) => {
				return await careerTimelineService.events.delete({
					id: input.id,
					userId: context.user.id,
				});
			}),
	},

	// Skills endpoints
	skills: {
		// Create skill
		create: protectedProcedure
			.route({
				method: "POST",
				path: "/career/timeline/skills",
				tags: ["Career Timeline"],
				summary: "Create a timeline skill",
			})
			.input(
				z.object({
					name: z.string().min(1),
					level: z.number().min(1).max(5),
					acquiredDate: z.string(),
					source: z.string().optional(),
					category: z.enum(["technical", "soft", "language", "tool"]),
				}),
			)
			.output(z.string())
			.handler(async ({ context, input }) => {
				return await careerTimelineService.skills.create({
					...input,
					userId: context.user.id,
				});
			}),

		// List skills
		list: protectedProcedure
			.route({
				method: "GET",
				path: "/career/timeline/skills",
				tags: ["Career Timeline"],
				summary: "List timeline skills",
			})
			.input(
				z
					.object({
						category: z.enum(["technical", "soft", "language", "tool"]).optional(),
					})
					.optional()
					.default({}),
			)
			.output(
				z.array(
					z.object({
						id: z.string().uuid(),
						userId: z.string(),
						name: z.string(),
						level: z.number(),
						acquiredDate: z.string(),
						source: z.string(),
						category: z.enum(["technical", "soft", "language", "tool"]),
						createdAt: z.coerce.date(),
					}),
				),
			)
			.handler(async ({ context, input }) => {
				return await careerTimelineService.skills.list({
					userId: context.user.id,
					category: input.category as TimelineSkillCategory | undefined,
				});
			}),

		// Delete skill
		delete: protectedProcedure
			.route({
				method: "DELETE",
				path: "/career/timeline/skills/{id}",
				tags: ["Career Timeline"],
				summary: "Delete a timeline skill",
			})
			.input(z.object({ id: z.string().uuid() }))
			.output(z.void())
			.handler(async ({ context, input }) => {
				return await careerTimelineService.skills.delete({
					id: input.id,
					userId: context.user.id,
				});
			}),
	},

	// Goals endpoints
	goals: {
		// Create goal
		create: protectedProcedure
			.route({
				method: "POST",
				path: "/career/timeline/goals",
				tags: ["Career Timeline"],
				summary: "Create a timeline goal",
			})
			.input(
				z.object({
					title: z.string().min(1),
					description: z.string().optional(),
					targetDate: z.string(),
					category: z.enum(["position", "salary", "skill", "certification", "other"]),
					targetValue: z.number().optional(),
					currentValue: z.number().optional(),
				}),
			)
			.output(z.string())
			.handler(async ({ context, input }) => {
				return await careerTimelineService.goals.create({
					...input,
					userId: context.user.id,
				});
			}),

		// List goals
		list: protectedProcedure
			.route({
				method: "GET",
				path: "/career/timeline/goals",
				tags: ["Career Timeline"],
				summary: "List timeline goals",
			})
			.input(
				z
					.object({
						completed: z.boolean().optional(),
					})
					.optional()
					.default({}),
			)
			.output(
				z.array(
					z.object({
						id: z.string().uuid(),
						userId: z.string(),
						title: z.string(),
						description: z.string(),
						targetDate: z.string(),
						category: z.enum(["position", "salary", "skill", "certification", "other"]),
						targetValue: z.number().nullable(),
						currentValue: z.number().nullable(),
						completed: z.boolean(),
						createdAt: z.coerce.date(),
						updatedAt: z.coerce.date(),
					}),
				),
			)
			.handler(async ({ context, input }) => {
				return await careerTimelineService.goals.list({
					userId: context.user.id,
					completed: input.completed,
				});
			}),

		// Update goal
		update: protectedProcedure
			.route({
				method: "PUT",
				path: "/career/timeline/goals/{id}",
				tags: ["Career Timeline"],
				summary: "Update a timeline goal",
			})
			.input(
				z.object({
					id: z.string().uuid(),
					title: z.string().min(1).optional(),
					description: z.string().optional(),
					targetDate: z.string().optional(),
					category: z.enum(["position", "salary", "skill", "certification", "other"]).optional(),
					targetValue: z.number().optional(),
					currentValue: z.number().optional(),
					completed: z.boolean().optional(),
				}),
			)
			.output(z.void())
			.handler(async ({ context, input }) => {
				return await careerTimelineService.goals.update({
					...input,
					userId: context.user.id,
				});
			}),

		// Toggle goal completion
		toggleComplete: protectedProcedure
			.route({
				method: "PATCH",
				path: "/career/timeline/goals/{id}/toggle",
				tags: ["Career Timeline"],
				summary: "Toggle goal completion status",
			})
			.input(z.object({ id: z.string().uuid() }))
			.output(z.boolean())
			.handler(async ({ context, input }) => {
				return await careerTimelineService.goals.toggleComplete({
					id: input.id,
					userId: context.user.id,
				});
			}),

		// Delete goal
		delete: protectedProcedure
			.route({
				method: "DELETE",
				path: "/career/timeline/goals/{id}",
				tags: ["Career Timeline"],
				summary: "Delete a timeline goal",
			})
			.input(z.object({ id: z.string().uuid() }))
			.output(z.void())
			.handler(async ({ context, input }) => {
				return await careerTimelineService.goals.delete({
					id: input.id,
					userId: context.user.id,
				});
			}),
	},
};
