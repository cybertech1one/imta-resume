import z from "zod";
import { protectedProcedure } from "../context";
import { studyPlanService } from "../services/study-plan";

export const careerStudyPlanEndpoints = {
	// Get study plan data
	get: protectedProcedure
		.route({
			method: "GET",
			path: "/career/study-plan",
			tags: ["Study Plan"],
			summary: "Get user study plan data",
		})
		.output(
			z.object({
				careerGoal: z
					.object({
						id: z.string().uuid(),
						targetRole: z.string(),
						industry: z.string(),
						timeline: z.number(),
						description: z.string(),
						createdAt: z.string(),
					})
					.nullable(),
				skills: z.array(
					z.object({
						id: z.string().uuid(),
						name: z.string(),
						category: z.enum(["technical", "soft", "language", "certification"]),
						currentLevel: z.number(),
						targetLevel: z.number(),
						priority: z.enum(["high", "medium", "low"]),
					}),
				),
				resources: z.array(
					z.object({
						id: z.string().uuid(),
						title: z.string(),
						type: z.enum(["course", "book", "tutorial", "certification", "video"]),
						platform: z.string(),
						url: z.string(),
						duration: z.string(),
						skillId: z.string(),
						completed: z.boolean(),
						rating: z.number().optional(),
					}),
				),
				tasks: z.array(
					z.object({
						id: z.string().uuid(),
						title: z.string(),
						description: z.string(),
						skillId: z.string(),
						resourceId: z.string().optional(),
						scheduledDate: z.string(),
						duration: z.number(),
						completed: z.boolean(),
						type: z.enum(["study", "practice", "review", "assessment"]),
					}),
				),
				milestones: z.array(
					z.object({
						id: z.string().uuid(),
						title: z.string(),
						description: z.string(),
						targetDate: z.string(),
						completed: z.boolean(),
						completedDate: z.string().optional(),
						skillIds: z.array(z.string()),
					}),
				),
				flashcards: z.array(
					z.object({
						id: z.string().uuid(),
						skillId: z.string(),
						question: z.string(),
						answer: z.string(),
						nextReview: z.string(),
						interval: z.number(),
						easeFactor: z.number(),
						repetitions: z.number(),
					}),
				),
				streak: z.object({
					currentStreak: z.number(),
					longestStreak: z.number(),
					lastStudyDate: z.string(),
					totalStudyDays: z.number(),
					totalStudyMinutes: z.number(),
					weeklyGoal: z.number(),
					badges: z.array(
						z.object({
							id: z.string().uuid(),
							name: z.string(),
							description: z.string(),
							icon: z.string(),
							earnedDate: z.string(),
						}),
					),
				}),
				lastUpdated: z.string(),
			}),
		)
		.handler(async ({ context }) => {
			return await studyPlanService.get({ userId: context.user.id });
		}),

	// Update study plan data
	update: protectedProcedure
		.route({
			method: "PUT",
			path: "/career/study-plan",
			tags: ["Study Plan"],
			summary: "Update user study plan data",
		})
		.input(
			z.object({
				careerGoal: z
					.object({
						id: z.string().uuid(),
						targetRole: z.string(),
						industry: z.string(),
						timeline: z.number(),
						description: z.string(),
						createdAt: z.string(),
					})
					.nullable(),
				skills: z.array(
					z.object({
						id: z.string().uuid(),
						name: z.string(),
						category: z.enum(["technical", "soft", "language", "certification"]),
						currentLevel: z.number(),
						targetLevel: z.number(),
						priority: z.enum(["high", "medium", "low"]),
					}),
				),
				resources: z.array(
					z.object({
						id: z.string().uuid(),
						title: z.string(),
						type: z.enum(["course", "book", "tutorial", "certification", "video"]),
						platform: z.string(),
						url: z.string(),
						duration: z.string(),
						skillId: z.string(),
						completed: z.boolean(),
						rating: z.number().optional(),
					}),
				),
				tasks: z.array(
					z.object({
						id: z.string().uuid(),
						title: z.string(),
						description: z.string(),
						skillId: z.string(),
						resourceId: z.string().optional(),
						scheduledDate: z.string(),
						duration: z.number(),
						completed: z.boolean(),
						type: z.enum(["study", "practice", "review", "assessment"]),
					}),
				),
				milestones: z.array(
					z.object({
						id: z.string().uuid(),
						title: z.string(),
						description: z.string(),
						targetDate: z.string(),
						completed: z.boolean(),
						completedDate: z.string().optional(),
						skillIds: z.array(z.string()),
					}),
				),
				flashcards: z.array(
					z.object({
						id: z.string().uuid(),
						skillId: z.string(),
						question: z.string(),
						answer: z.string(),
						nextReview: z.string(),
						interval: z.number(),
						easeFactor: z.number(),
						repetitions: z.number(),
					}),
				),
				streak: z.object({
					currentStreak: z.number(),
					longestStreak: z.number(),
					lastStudyDate: z.string(),
					totalStudyDays: z.number(),
					totalStudyMinutes: z.number(),
					weeklyGoal: z.number(),
					badges: z.array(
						z.object({
							id: z.string().uuid(),
							name: z.string(),
							description: z.string(),
							icon: z.string(),
							earnedDate: z.string(),
						}),
					),
				}),
				lastUpdated: z.string(),
			}),
		)
		.output(
			z.object({
				careerGoal: z
					.object({
						id: z.string().uuid(),
						targetRole: z.string(),
						industry: z.string(),
						timeline: z.number(),
						description: z.string(),
						createdAt: z.string(),
					})
					.nullable(),
				skills: z.array(
					z.object({
						id: z.string().uuid(),
						name: z.string(),
						category: z.enum(["technical", "soft", "language", "certification"]),
						currentLevel: z.number(),
						targetLevel: z.number(),
						priority: z.enum(["high", "medium", "low"]),
					}),
				),
				resources: z.array(
					z.object({
						id: z.string().uuid(),
						title: z.string(),
						type: z.enum(["course", "book", "tutorial", "certification", "video"]),
						platform: z.string(),
						url: z.string(),
						duration: z.string(),
						skillId: z.string(),
						completed: z.boolean(),
						rating: z.number().optional(),
					}),
				),
				tasks: z.array(
					z.object({
						id: z.string().uuid(),
						title: z.string(),
						description: z.string(),
						skillId: z.string(),
						resourceId: z.string().optional(),
						scheduledDate: z.string(),
						duration: z.number(),
						completed: z.boolean(),
						type: z.enum(["study", "practice", "review", "assessment"]),
					}),
				),
				milestones: z.array(
					z.object({
						id: z.string().uuid(),
						title: z.string(),
						description: z.string(),
						targetDate: z.string(),
						completed: z.boolean(),
						completedDate: z.string().optional(),
						skillIds: z.array(z.string()),
					}),
				),
				flashcards: z.array(
					z.object({
						id: z.string().uuid(),
						skillId: z.string(),
						question: z.string(),
						answer: z.string(),
						nextReview: z.string(),
						interval: z.number(),
						easeFactor: z.number(),
						repetitions: z.number(),
					}),
				),
				streak: z.object({
					currentStreak: z.number(),
					longestStreak: z.number(),
					lastStudyDate: z.string(),
					totalStudyDays: z.number(),
					totalStudyMinutes: z.number(),
					weeklyGoal: z.number(),
					badges: z.array(
						z.object({
							id: z.string().uuid(),
							name: z.string(),
							description: z.string(),
							icon: z.string(),
							earnedDate: z.string(),
						}),
					),
				}),
				lastUpdated: z.string(),
			}),
		)
		.handler(async ({ context, input }) => {
			return await studyPlanService.update({
				userId: context.user.id,
				data: input,
			});
		}),

	// Reset study plan
	reset: protectedProcedure
		.route({
			method: "DELETE",
			path: "/career/study-plan",
			tags: ["Study Plan"],
			summary: "Reset study plan to defaults",
		})
		.output(
			z.object({
				careerGoal: z
					.object({
						id: z.string().uuid(),
						targetRole: z.string(),
						industry: z.string(),
						timeline: z.number(),
						description: z.string(),
						createdAt: z.string(),
					})
					.nullable(),
				skills: z.array(
					z.object({
						id: z.string().uuid(),
						name: z.string(),
						category: z.enum(["technical", "soft", "language", "certification"]),
						currentLevel: z.number(),
						targetLevel: z.number(),
						priority: z.enum(["high", "medium", "low"]),
					}),
				),
				resources: z.array(
					z.object({
						id: z.string().uuid(),
						title: z.string(),
						type: z.enum(["course", "book", "tutorial", "certification", "video"]),
						platform: z.string(),
						url: z.string(),
						duration: z.string(),
						skillId: z.string(),
						completed: z.boolean(),
						rating: z.number().optional(),
					}),
				),
				tasks: z.array(
					z.object({
						id: z.string().uuid(),
						title: z.string(),
						description: z.string(),
						skillId: z.string(),
						resourceId: z.string().optional(),
						scheduledDate: z.string(),
						duration: z.number(),
						completed: z.boolean(),
						type: z.enum(["study", "practice", "review", "assessment"]),
					}),
				),
				milestones: z.array(
					z.object({
						id: z.string().uuid(),
						title: z.string(),
						description: z.string(),
						targetDate: z.string(),
						completed: z.boolean(),
						completedDate: z.string().optional(),
						skillIds: z.array(z.string()),
					}),
				),
				flashcards: z.array(
					z.object({
						id: z.string().uuid(),
						skillId: z.string(),
						question: z.string(),
						answer: z.string(),
						nextReview: z.string(),
						interval: z.number(),
						easeFactor: z.number(),
						repetitions: z.number(),
					}),
				),
				streak: z.object({
					currentStreak: z.number(),
					longestStreak: z.number(),
					lastStudyDate: z.string(),
					totalStudyDays: z.number(),
					totalStudyMinutes: z.number(),
					weeklyGoal: z.number(),
					badges: z.array(
						z.object({
							id: z.string().uuid(),
							name: z.string(),
							description: z.string(),
							icon: z.string(),
							earnedDate: z.string(),
						}),
					),
				}),
				lastUpdated: z.string(),
			}),
		)
		.handler(async ({ context }) => {
			return await studyPlanService.reset({ userId: context.user.id });
		}),

	// Get statistics
	getStatistics: protectedProcedure
		.route({
			method: "GET",
			path: "/career/study-plan/statistics",
			tags: ["Study Plan"],
			summary: "Get study plan statistics",
		})
		.output(
			z.object({
				skillProgress: z.number(),
				totalSkills: z.number(),
				completedSkills: z.number(),
				totalMilestones: z.number(),
				completedMilestones: z.number(),
				totalResources: z.number(),
				completedResources: z.number(),
				totalTasks: z.number(),
				completedTasks: z.number(),
				todayTasksTotal: z.number(),
				todayTasksCompleted: z.number(),
				weekProgress: z.number(),
				currentStreak: z.number(),
				longestStreak: z.number(),
				totalStudyDays: z.number(),
				totalStudyMinutes: z.number(),
				badgeCount: z.number(),
				dueFlashcards: z.number(),
				hasCareerGoal: z.boolean(),
			}),
		)
		.handler(async ({ context }) => {
			return await studyPlanService.getStatistics({ userId: context.user.id });
		}),
};
