import z from "zod";
import { adminProcedure, protectedProcedure } from "../context";
import { careerCoachingService } from "../services/career-coaching";

// Schemas
const coachingTopicSchema = z.enum([
	"resume_review",
	"interview_prep",
	"career_transition",
	"skill_development",
	"networking",
	"negotiation",
	"leadership",
	"work_life_balance",
	"job_search",
	"personal_branding",
]);

const coachingSessionStatusSchema = z.enum(["scheduled", "in_progress", "completed", "cancelled"]);

const confidenceLevelSchema = z.enum(["very_low", "low", "moderate", "high", "very_high"]);

const weeklyGoalCategorySchema = z.enum([
	"applications",
	"networking",
	"skills",
	"interview_prep",
	"personal_branding",
	"research",
	"other",
]);

const weeklyGoalStatusSchema = z.enum(["pending", "in_progress", "completed", "missed"]);

const confidenceEntryTypeSchema = z.enum(["win", "challenge", "learning", "affirmation", "reflection"]);

const milestoneTypeSchema = z.enum(["education", "certification", "skill", "experience", "networking", "achievement"]);

const milestoneStatusSchema = z.enum(["not_started", "in_progress", "completed", "skipped"]);

const milestoneSchema = z.object({
	id: z.string(),
	title: z.string(),
	titleFr: z.string().optional(),
	description: z.string().optional(),
	type: milestoneTypeSchema,
	status: milestoneStatusSchema,
	targetDate: z.string().optional(),
	completedDate: z.string().optional(),
	progress: z.number(),
	resources: z.array(z.string()).optional(),
	notes: z.string().optional(),
});

const skillGapItemSchema = z.object({
	skill: z.string(),
	skillFr: z.string().optional(),
	currentLevel: z.number(),
	requiredLevel: z.number(),
	priority: z.enum(["high", "medium", "low"]),
	learningResources: z.array(z.string()).optional(),
	estimatedHours: z.number().optional(),
	progress: z.number(),
});

const careerPathSchema = z.object({
	id: z.string(),
	userId: z.string(),
	currentRole: z.string().nullable(),
	currentRoleFr: z.string().nullable(),
	targetRole: z.string(),
	targetRoleFr: z.string().nullable(),
	targetIndustry: z.string().nullable(),
	targetCompany: z.string().nullable(),
	targetSalary: z.number().nullable(),
	targetDate: z.coerce.date().nullable(),
	milestones: z.array(milestoneSchema).nullable(),
	overallProgress: z.number().nullable(),
	isActive: z.boolean().nullable(),
	notes: z.string().nullable(),
	createdAt: z.coerce.date(),
	updatedAt: z.coerce.date(),
});

const skillGapAnalysisSchema = z.object({
	id: z.string(),
	userId: z.string(),
	careerPathId: z.string().nullable(),
	targetRole: z.string(),
	gaps: z.array(skillGapItemSchema).nullable(),
	strengths: z.array(z.string()).nullable(),
	recommendations: z.array(z.string()).nullable(),
	overallReadiness: z.number().nullable(),
	aiAnalysis: z.string().nullable(),
	createdAt: z.coerce.date(),
	updatedAt: z.coerce.date(),
});

const weeklyGoalSchema = z.object({
	id: z.string(),
	userId: z.string(),
	weekStartDate: z.string(),
	category: weeklyGoalCategorySchema,
	title: z.string(),
	titleFr: z.string().nullable(),
	description: z.string().nullable(),
	targetValue: z.number().nullable(),
	currentValue: z.number().nullable(),
	status: weeklyGoalStatusSchema,
	priority: z.string().nullable(),
	completedAt: z.coerce.date().nullable(),
	notes: z.string().nullable(),
	createdAt: z.coerce.date(),
	updatedAt: z.coerce.date(),
});

const journalEntrySchema = z.object({
	id: z.string(),
	userId: z.string(),
	entryType: confidenceEntryTypeSchema,
	entryDate: z.string(),
	title: z.string(),
	content: z.string(),
	mood: z.number().nullable(),
	tags: z.array(z.string()).nullable(),
	isPrivate: z.boolean().nullable(),
	createdAt: z.coerce.date(),
	updatedAt: z.coerce.date(),
});

const affirmationSchema = z.object({
	id: z.string(),
	category: z.string(),
	content: z.string(),
	contentFr: z.string().nullable(),
	contentAr: z.string().nullable(),
	author: z.string().nullable(),
	isActive: z.boolean().nullable(),
	sortOrder: z.number().nullable(),
	createdAt: z.coerce.date(),
});

const coachingSessionSchema = z.object({
	id: z.string(),
	userId: z.string(),
	topic: coachingTopicSchema,
	status: coachingSessionStatusSchema,
	scheduledAt: z.coerce.date().nullable(),
	startedAt: z.coerce.date().nullable(),
	completedAt: z.coerce.date().nullable(),
	duration: z.number().nullable(),
	notes: z.string().nullable(),
	aiSummary: z.string().nullable(),
	actionItems: z.array(z.string()).nullable(),
	nextSteps: z.array(z.string()).nullable(),
	confidenceBefore: confidenceLevelSchema.nullable(),
	confidenceAfter: confidenceLevelSchema.nullable(),
	rating: z.number().nullable(),
	feedback: z.string().nullable(),
	createdAt: z.coerce.date(),
	updatedAt: z.coerce.date(),
});

export const careerCoachingRouter = {
	// ==========================================
	// CAREER PATH
	// ==========================================

	createCareerPath: protectedProcedure
		.route({
			method: "POST",
			path: "/coaching/career-path",
			tags: ["Career Coaching"],
			summary: "Create a new career path",
		})
		.input(
			z.object({
				currentRole: z.string().optional(),
				currentRoleFr: z.string().optional(),
				targetRole: z.string(),
				targetRoleFr: z.string().optional(),
				targetIndustry: z.string().optional(),
				targetCompany: z.string().optional(),
				targetSalary: z.number().optional(),
				targetDate: z.coerce.date().optional(),
				milestones: z.array(milestoneSchema).optional(),
			}),
		)
		.output(z.object({ id: z.string() }))
		.handler(async ({ context, input }) => {
			const id = await careerCoachingService.createCareerPath({
				userId: context.user.id,
				...input,
			});
			return { id };
		}),

	updateCareerPath: protectedProcedure
		.route({
			method: "PUT",
			path: "/coaching/career-path/{id}",
			tags: ["Career Coaching"],
			summary: "Update a career path",
		})
		.input(
			z.object({
				id: z.string().uuid(),
				currentRole: z.string().optional(),
				targetRole: z.string().optional(),
				targetIndustry: z.string().optional(),
				targetCompany: z.string().optional(),
				targetSalary: z.number().optional(),
				targetDate: z.coerce.date().optional(),
				milestones: z.array(milestoneSchema).optional(),
				overallProgress: z.number().optional(),
				isActive: z.boolean().optional(),
				notes: z.string().optional(),
			}),
		)
		.output(z.void())
		.handler(async ({ context, input }) => {
			const { id, ...updates } = input;
			await careerCoachingService.updateCareerPath(id, context.user.id, updates);
		}),

	getCareerPath: protectedProcedure
		.route({
			method: "GET",
			path: "/coaching/career-path/{id}",
			tags: ["Career Coaching"],
			summary: "Get a specific career path",
		})
		.input(z.object({ id: z.string().uuid() }))
		.output(careerPathSchema.nullable())
		.handler(async ({ context, input }) => {
			return careerCoachingService.getCareerPath(input.id, context.user.id);
		}),

	getActiveCareerPath: protectedProcedure
		.route({
			method: "GET",
			path: "/coaching/career-path/active",
			tags: ["Career Coaching"],
			summary: "Get the user's active career path",
		})
		.output(careerPathSchema.nullable())
		.handler(async ({ context }) => {
			return careerCoachingService.getActiveCareerPath(context.user.id);
		}),

	listCareerPaths: protectedProcedure
		.route({
			method: "GET",
			path: "/coaching/career-paths",
			tags: ["Career Coaching"],
			summary: "List all career paths",
		})
		.output(z.array(careerPathSchema))
		.handler(async ({ context }) => {
			return careerCoachingService.listCareerPaths(context.user.id);
		}),

	updateMilestone: protectedProcedure
		.route({
			method: "PUT",
			path: "/coaching/career-path/{pathId}/milestone/{milestoneId}",
			tags: ["Career Coaching"],
			summary: "Update a milestone in a career path",
		})
		.input(
			z.object({
				pathId: z.string(),
				milestoneId: z.string(),
				status: milestoneStatusSchema.optional(),
				progress: z.number().optional(),
				completedDate: z.string().optional(),
				notes: z.string().optional(),
			}),
		)
		.output(
			z
				.object({
					milestones: z.array(milestoneSchema),
					overallProgress: z.number(),
				})
				.nullable(),
		)
		.handler(async ({ context, input }) => {
			const { pathId, milestoneId, ...updates } = input;
			return careerCoachingService.updateMilestone(pathId, context.user.id, milestoneId, updates);
		}),

	// ==========================================
	// SKILL GAP ANALYSIS
	// ==========================================

	createSkillGapAnalysis: protectedProcedure
		.route({
			method: "POST",
			path: "/coaching/skill-gap",
			tags: ["Career Coaching"],
			summary: "Create a skill gap analysis",
		})
		.input(
			z.object({
				careerPathId: z.string().optional(),
				targetRole: z.string(),
				gaps: z.array(skillGapItemSchema),
				strengths: z.array(z.string()).optional(),
				recommendations: z.array(z.string()).optional(),
				overallReadiness: z.number(),
				aiAnalysis: z.string().optional(),
			}),
		)
		.output(z.object({ id: z.string() }))
		.handler(async ({ context, input }) => {
			const id = await careerCoachingService.createSkillGapAnalysis({
				userId: context.user.id,
				...input,
			});
			return { id };
		}),

	getLatestSkillGapAnalysis: protectedProcedure
		.route({
			method: "GET",
			path: "/coaching/skill-gap/latest",
			tags: ["Career Coaching"],
			summary: "Get the latest skill gap analysis",
		})
		.output(skillGapAnalysisSchema.nullable())
		.handler(async ({ context }) => {
			return careerCoachingService.getLatestSkillGapAnalysis(context.user.id);
		}),

	listSkillGapAnalyses: protectedProcedure
		.route({
			method: "GET",
			path: "/coaching/skill-gaps",
			tags: ["Career Coaching"],
			summary: "List skill gap analyses",
		})
		.input(z.object({ limit: z.number().optional() }).optional())
		.output(z.array(skillGapAnalysisSchema))
		.handler(async ({ context, input }) => {
			return careerCoachingService.listSkillGapAnalyses(context.user.id, input?.limit);
		}),

	// ==========================================
	// WEEKLY GOALS
	// ==========================================

	createWeeklyGoal: protectedProcedure
		.route({
			method: "POST",
			path: "/coaching/weekly-goals",
			tags: ["Career Coaching"],
			summary: "Create a weekly goal",
		})
		.input(
			z.object({
				weekStartDate: z.string(),
				category: weeklyGoalCategorySchema,
				title: z.string(),
				titleFr: z.string().optional(),
				description: z.string().optional(),
				targetValue: z.number().optional(),
				priority: z.string().optional(),
			}),
		)
		.output(z.object({ id: z.string() }))
		.handler(async ({ context, input }) => {
			const id = await careerCoachingService.createWeeklyGoal({
				userId: context.user.id,
				...input,
			});
			return { id };
		}),

	updateWeeklyGoal: protectedProcedure
		.route({
			method: "PUT",
			path: "/coaching/weekly-goals/{id}",
			tags: ["Career Coaching"],
			summary: "Update a weekly goal",
		})
		.input(
			z.object({
				id: z.string().uuid(),
				title: z.string().optional(),
				description: z.string().optional(),
				targetValue: z.number().optional(),
				currentValue: z.number().optional(),
				status: weeklyGoalStatusSchema.optional(),
				priority: z.string().optional(),
				notes: z.string().optional(),
			}),
		)
		.output(z.void())
		.handler(async ({ context, input }) => {
			const { id, ...updates } = input;
			await careerCoachingService.updateWeeklyGoal(id, context.user.id, updates);
		}),

	deleteWeeklyGoal: protectedProcedure
		.route({
			method: "DELETE",
			path: "/coaching/weekly-goals/{id}",
			tags: ["Career Coaching"],
			summary: "Delete a weekly goal",
		})
		.input(z.object({ id: z.string().uuid() }))
		.output(z.void())
		.handler(async ({ context, input }) => {
			await careerCoachingService.deleteWeeklyGoal(input.id, context.user.id);
		}),

	getWeeklyGoals: protectedProcedure
		.route({
			method: "GET",
			path: "/coaching/weekly-goals/{weekStartDate}",
			tags: ["Career Coaching"],
			summary: "Get weekly goals for a specific week",
		})
		.input(z.object({ weekStartDate: z.string() }))
		.output(z.array(weeklyGoalSchema))
		.handler(async ({ context, input }) => {
			return careerCoachingService.getWeeklyGoals(context.user.id, input.weekStartDate);
		}),

	getCurrentWeekGoals: protectedProcedure
		.route({
			method: "GET",
			path: "/coaching/weekly-goals/current",
			tags: ["Career Coaching"],
			summary: "Get current week's goals",
		})
		.output(z.array(weeklyGoalSchema))
		.handler(async ({ context }) => {
			return careerCoachingService.getCurrentWeekGoals(context.user.id);
		}),

	getWeeklyGoalStats: protectedProcedure
		.route({
			method: "GET",
			path: "/coaching/weekly-goals/stats",
			tags: ["Career Coaching"],
			summary: "Get weekly goal statistics",
		})
		.output(
			z.object({
				total: z.number(),
				completed: z.number(),
				inProgress: z.number(),
				pending: z.number(),
				completionRate: z.number(),
				byCategory: z.object({
					applications: z.number(),
					networking: z.number(),
					skills: z.number(),
					interview_prep: z.number(),
					personal_branding: z.number(),
					research: z.number(),
					other: z.number(),
				}),
			}),
		)
		.handler(async ({ context }) => {
			return careerCoachingService.getWeeklyGoalStats(context.user.id);
		}),

	// ==========================================
	// CONFIDENCE JOURNAL
	// ==========================================

	createJournalEntry: protectedProcedure
		.route({
			method: "POST",
			path: "/coaching/journal",
			tags: ["Career Coaching"],
			summary: "Create a journal entry",
		})
		.input(
			z.object({
				entryType: confidenceEntryTypeSchema,
				entryDate: z.string(),
				title: z.string(),
				content: z.string(),
				mood: z.number().optional(),
				tags: z.array(z.string()).optional(),
			}),
		)
		.output(z.object({ id: z.string() }))
		.handler(async ({ context, input }) => {
			const id = await careerCoachingService.createJournalEntry({
				userId: context.user.id,
				...input,
			});
			return { id };
		}),

	updateJournalEntry: protectedProcedure
		.route({
			method: "PUT",
			path: "/coaching/journal/{id}",
			tags: ["Career Coaching"],
			summary: "Update a journal entry",
		})
		.input(
			z.object({
				id: z.string().uuid(),
				title: z.string().optional(),
				content: z.string().optional(),
				mood: z.number().optional(),
				tags: z.array(z.string()).optional(),
			}),
		)
		.output(z.void())
		.handler(async ({ context, input }) => {
			const { id, ...updates } = input;
			await careerCoachingService.updateJournalEntry(id, context.user.id, updates);
		}),

	deleteJournalEntry: protectedProcedure
		.route({
			method: "DELETE",
			path: "/coaching/journal/{id}",
			tags: ["Career Coaching"],
			summary: "Delete a journal entry",
		})
		.input(z.object({ id: z.string().uuid() }))
		.output(z.void())
		.handler(async ({ context, input }) => {
			await careerCoachingService.deleteJournalEntry(input.id, context.user.id);
		}),

	getJournalEntries: protectedProcedure
		.route({
			method: "GET",
			path: "/coaching/journal",
			tags: ["Career Coaching"],
			summary: "List journal entries",
		})
		.input(
			z
				.object({
					entryType: confidenceEntryTypeSchema.optional(),
					startDate: z.string().optional(),
					endDate: z.string().optional(),
					limit: z.number().optional(),
				})
				.optional(),
		)
		.output(z.array(journalEntrySchema))
		.handler(async ({ context, input }) => {
			return careerCoachingService.getJournalEntries(context.user.id, input);
		}),

	getTodaysWins: protectedProcedure
		.route({
			method: "GET",
			path: "/coaching/journal/wins/today",
			tags: ["Career Coaching"],
			summary: "Get today's wins",
		})
		.output(z.array(journalEntrySchema))
		.handler(async ({ context }) => {
			return careerCoachingService.getTodaysWins(context.user.id);
		}),

	getJournalStats: protectedProcedure
		.route({
			method: "GET",
			path: "/coaching/journal/stats",
			tags: ["Career Coaching"],
			summary: "Get journal statistics",
		})
		.input(z.object({ days: z.number().optional() }).optional())
		.output(
			z.object({
				totalEntries: z.number(),
				winCount: z.number(),
				challengeCount: z.number(),
				learningCount: z.number(),
				averageMood: z.number(),
				streak: z.number(),
				daysTracked: z.number(),
			}),
		)
		.handler(async ({ context, input }) => {
			return careerCoachingService.getJournalStats(context.user.id, input?.days);
		}),

	// ==========================================
	// AFFIRMATIONS
	// ==========================================

	getTodaysAffirmation: protectedProcedure
		.route({
			method: "GET",
			path: "/coaching/affirmation/today",
			tags: ["Career Coaching"],
			summary: "Get today's affirmation",
		})
		.input(z.object({ category: z.string().optional() }).optional())
		.output(affirmationSchema.nullable())
		.handler(async ({ context, input }) => {
			return careerCoachingService.getTodaysAffirmation(context.user.id, input?.category);
		}),

	likeAffirmation: protectedProcedure
		.route({
			method: "POST",
			path: "/coaching/affirmation/{id}/like",
			tags: ["Career Coaching"],
			summary: "Like an affirmation",
		})
		.input(z.object({ id: z.string().uuid() }))
		.output(z.void())
		.handler(async ({ context, input }) => {
			await careerCoachingService.likeAffirmation(context.user.id, input.id);
		}),

	saveAffirmation: protectedProcedure
		.route({
			method: "POST",
			path: "/coaching/affirmation/{id}/save",
			tags: ["Career Coaching"],
			summary: "Save an affirmation",
		})
		.input(z.object({ id: z.string().uuid() }))
		.output(z.void())
		.handler(async ({ context, input }) => {
			await careerCoachingService.saveAffirmation(context.user.id, input.id);
		}),

	getSavedAffirmations: protectedProcedure
		.route({
			method: "GET",
			path: "/coaching/affirmations/saved",
			tags: ["Career Coaching"],
			summary: "Get saved affirmations",
		})
		.output(z.array(affirmationSchema))
		.handler(async ({ context }) => {
			return careerCoachingService.getSavedAffirmations(context.user.id);
		}),

	seedAffirmations: adminProcedure
		.route({
			method: "POST",
			path: "/coaching/affirmations/seed",
			tags: ["Career Coaching"],
			summary: "Seed default affirmations (admin only)",
		})
		.output(z.object({ seeded: z.boolean() }))
		.handler(async () => {
			return careerCoachingService.seedAffirmations();
		}),

	// ==========================================
	// COACHING SESSIONS
	// ==========================================

	createCoachingSession: protectedProcedure
		.route({
			method: "POST",
			path: "/coaching/sessions",
			tags: ["Career Coaching"],
			summary: "Create a coaching session",
		})
		.input(
			z.object({
				topic: coachingTopicSchema,
				scheduledAt: z.coerce.date().optional(),
				notes: z.string().optional(),
			}),
		)
		.output(z.object({ id: z.string() }))
		.handler(async ({ context, input }) => {
			const id = await careerCoachingService.createCoachingSession({
				userId: context.user.id,
				...input,
			});
			return { id };
		}),

	updateCoachingSession: protectedProcedure
		.route({
			method: "PUT",
			path: "/coaching/sessions/{id}",
			tags: ["Career Coaching"],
			summary: "Update a coaching session",
		})
		.input(
			z.object({
				id: z.string().uuid(),
				status: coachingSessionStatusSchema.optional(),
				startedAt: z.coerce.date().optional(),
				completedAt: z.coerce.date().optional(),
				duration: z.number().optional(),
				notes: z.string().optional(),
				aiSummary: z.string().optional(),
				actionItems: z.array(z.string()).optional(),
				nextSteps: z.array(z.string()).optional(),
				confidenceBefore: confidenceLevelSchema.optional(),
				confidenceAfter: confidenceLevelSchema.optional(),
				rating: z.number().optional(),
				feedback: z.string().optional(),
			}),
		)
		.output(z.void())
		.handler(async ({ context, input }) => {
			const { id, ...updates } = input;
			await careerCoachingService.updateCoachingSession(id, context.user.id, updates);
		}),

	getCoachingSession: protectedProcedure
		.route({
			method: "GET",
			path: "/coaching/sessions/{id}",
			tags: ["Career Coaching"],
			summary: "Get a coaching session",
		})
		.input(z.object({ id: z.string().uuid() }))
		.output(coachingSessionSchema.nullable())
		.handler(async ({ context, input }) => {
			return careerCoachingService.getCoachingSession(input.id, context.user.id);
		}),

	listCoachingSessions: protectedProcedure
		.route({
			method: "GET",
			path: "/coaching/sessions",
			tags: ["Career Coaching"],
			summary: "List coaching sessions",
		})
		.input(z.object({ limit: z.number().optional() }).optional())
		.output(z.array(coachingSessionSchema))
		.handler(async ({ context, input }) => {
			return careerCoachingService.listCoachingSessions(context.user.id, input?.limit);
		}),

	// ==========================================
	// DASHBOARD
	// ==========================================

	getDashboardStats: protectedProcedure
		.route({
			method: "GET",
			path: "/coaching/dashboard",
			tags: ["Career Coaching"],
			summary: "Get career coaching dashboard stats",
		})
		.output(
			z.object({
				careerPath: z
					.object({
						targetRole: z.string(),
						progress: z.number(),
						milestonesTotal: z.number(),
						milestonesCompleted: z.number(),
					})
					.nullable(),
				weeklyGoals: z.object({
					total: z.number(),
					completed: z.number(),
					inProgress: z.number(),
					pending: z.number(),
					completionRate: z.number(),
					byCategory: z.object({
						applications: z.number(),
						networking: z.number(),
						skills: z.number(),
						interview_prep: z.number(),
						personal_branding: z.number(),
						research: z.number(),
						other: z.number(),
					}),
				}),
				journal: z.object({
					totalEntries: z.number(),
					winCount: z.number(),
					challengeCount: z.number(),
					learningCount: z.number(),
					averageMood: z.number(),
					streak: z.number(),
					daysTracked: z.number(),
				}),
				skillReadiness: z.number(),
				coachingSessions: z.number(),
			}),
		)
		.handler(async ({ context }) => {
			return careerCoachingService.getDashboardStats(context.user.id);
		}),
};
