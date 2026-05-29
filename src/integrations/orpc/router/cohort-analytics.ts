import z from "zod";
import { adminProcedure } from "../context";
import { type CohortCriteria, cohortAnalyticsService } from "../services/cohort-analytics";

// Zod schemas for validation
const cohortCriteriaSchema = z.object({
	program: z.string().optional(),
	year: z.number().optional(),
	specialization: z.string().optional(),
	field: z.string().optional(),
	minEnrollmentDate: z.string().optional(),
	maxEnrollmentDate: z.string().optional(),
});

const cohortMetricsOutputSchema = z.object({
	totalMembers: z.number(),
	avgResumeProgress: z.number(),
	avgSkillsScore: z.number(),
	avgInterviewScore: z.number(),
	placementRate: z.number(),
	activeMembers: z.number(),
	completedTraining: z.number(),
	atRiskCount: z.number(),
});

const studentPerformanceSchema = z.object({
	userId: z.string(),
	userName: z.string(),
	userEmail: z.string(),
	resumeCount: z.number(),
	avgSkillsScore: z.number(),
	interviewsCompleted: z.number(),
	avgInterviewScore: z.number(),
	trainingProgress: z.number(),
	isPlaced: z.boolean(),
	riskLevel: z.enum(["low", "medium", "high"]),
	lastActivity: z.coerce.date().nullable(),
});

const cohortPredictionSchema = z.object({
	predictedPlacementRate: z.number(),
	predictedCompletionRate: z.number(),
	riskFactors: z.array(z.string()),
	recommendations: z.array(z.string()),
	confidenceLevel: z.number(),
});

export const cohortAnalyticsRouter = {
	// Create a new cohort
	create: adminProcedure
		.route({
			method: "POST",
			path: "/cohorts",
			tags: ["Cohort Analytics"],
			summary: "Create a new student cohort",
			description: "Creates a new cohort for grouping students by program, year, or specialization.",
		})
		.input(
			z.object({
				name: z.string().min(1).max(200),
				description: z.string().optional(),
				criteria: cohortCriteriaSchema,
			}),
		)
		.output(
			z.object({
				id: z.string().uuid(),
				name: z.string(),
				description: z.string().nullable(),
				criteria: cohortCriteriaSchema,
				isActive: z.boolean(),
				createdAt: z.coerce.date(),
			}),
		)
		.handler(async ({ input, context }) => {
			const result = await cohortAnalyticsService.createCohort({
				name: input.name,
				description: input.description,
				criteria: input.criteria as CohortCriteria,
				createdBy: context.user.id,
			});
			return result;
		}),

	// Get cohort by ID
	get: adminProcedure
		.route({
			method: "GET",
			path: "/cohorts/:id",
			tags: ["Cohort Analytics"],
			summary: "Get cohort details",
			description: "Retrieves details for a specific cohort.",
		})
		.input(z.object({ id: z.string().uuid() }))
		.output(
			z
				.object({
					id: z.string().uuid(),
					name: z.string(),
					description: z.string().nullable(),
					criteria: cohortCriteriaSchema,
					isActive: z.boolean(),
					createdAt: z.coerce.date(),
					updatedAt: z.coerce.date(),
				})
				.nullable(),
		)
		.handler(async ({ input }) => {
			const result = await cohortAnalyticsService.getCohort(input.id);
			return result ?? null;
		}),

	// List all cohorts
	list: adminProcedure
		.route({
			method: "GET",
			path: "/cohorts",
			tags: ["Cohort Analytics"],
			summary: "List all cohorts",
			description: "Returns a paginated list of all cohorts.",
		})
		.input(
			z.object({
				activeOnly: z.boolean().optional().default(false),
				limit: z.number().optional().default(50),
				offset: z.number().optional().default(0),
			}),
		)
		.output(
			z.object({
				cohorts: z.array(
					z.object({
						id: z.string().uuid(),
						name: z.string(),
						description: z.string().nullable(),
						criteria: cohortCriteriaSchema,
						isActive: z.boolean(),
						createdAt: z.coerce.date(),
						updatedAt: z.coerce.date(),
					}),
				),
				total: z.number(),
			}),
		)
		.handler(async ({ input }) => {
			return await cohortAnalyticsService.listCohorts(input);
		}),

	// Update cohort
	update: adminProcedure
		.route({
			method: "PUT",
			path: "/cohorts/:id",
			tags: ["Cohort Analytics"],
			summary: "Update a cohort",
			description: "Updates cohort details.",
		})
		.input(
			z.object({
				id: z.string().uuid(),
				name: z.string().min(1).max(200).optional(),
				description: z.string().optional(),
				criteria: cohortCriteriaSchema.optional(),
				isActive: z.boolean().optional(),
			}),
		)
		.output(
			z.object({
				id: z.string().uuid(),
				name: z.string(),
				description: z.string().nullable(),
				criteria: cohortCriteriaSchema,
				isActive: z.boolean(),
				updatedAt: z.coerce.date(),
			}),
		)
		.handler(async ({ input }) => {
			const { id, ...data } = input;
			return await cohortAnalyticsService.updateCohort(id, data);
		}),

	// Delete cohort
	delete: adminProcedure
		.route({
			method: "DELETE",
			path: "/cohorts/:id",
			tags: ["Cohort Analytics"],
			summary: "Delete a cohort",
			description: "Permanently deletes a cohort and all associated data.",
		})
		.input(z.object({ id: z.string().uuid() }))
		.output(z.object({ success: z.boolean() }))
		.handler(async ({ input }) => {
			return await cohortAnalyticsService.deleteCohort(input.id);
		}),

	// Add member to cohort
	addMember: adminProcedure
		.route({
			method: "POST",
			path: "/cohorts/:cohortId/members",
			tags: ["Cohort Analytics"],
			summary: "Add member to cohort",
			description: "Adds a user to a cohort.",
		})
		.input(
			z.object({
				cohortId: z.string(),
				userId: z.string(),
			}),
		)
		.output(
			z
				.object({
					id: z.string().uuid(),
					cohortId: z.string(),
					userId: z.string(),
					joinedAt: z.coerce.date(),
				})
				.nullable(),
		)
		.handler(async ({ input, context }) => {
			const result = await cohortAnalyticsService.addMember(input.cohortId, input.userId, context.user.id);
			return result ?? null;
		}),

	// Remove member from cohort
	removeMember: adminProcedure
		.route({
			method: "DELETE",
			path: "/cohorts/:cohortId/members/:userId",
			tags: ["Cohort Analytics"],
			summary: "Remove member from cohort",
			description: "Removes a user from a cohort.",
		})
		.input(
			z.object({
				cohortId: z.string(),
				userId: z.string(),
			}),
		)
		.output(z.object({ success: z.boolean() }))
		.handler(async ({ input }) => {
			return await cohortAnalyticsService.removeMember(input.cohortId, input.userId);
		}),

	// Get cohort members
	getMembers: adminProcedure
		.route({
			method: "GET",
			path: "/cohorts/:cohortId/members",
			tags: ["Cohort Analytics"],
			summary: "Get cohort members",
			description: "Returns all members of a cohort.",
		})
		.input(z.object({ cohortId: z.string() }))
		.output(
			z.array(
				z.object({
					id: z.string().uuid(),
					userId: z.string(),
					userName: z.string(),
					userEmail: z.string(),
					joinedAt: z.coerce.date(),
					status: z.string(),
				}),
			),
		)
		.handler(async ({ input }) => {
			return await cohortAnalyticsService.getCohortMembers(input.cohortId);
		}),

	// Get cohort metrics
	getMetrics: adminProcedure
		.route({
			method: "GET",
			path: "/cohorts/:cohortId/metrics",
			tags: ["Cohort Analytics"],
			summary: "Get cohort metrics",
			description: "Returns aggregated metrics for a cohort including progress, skills, and placement rates.",
		})
		.input(z.object({ cohortId: z.string() }))
		.output(cohortMetricsOutputSchema)
		.handler(async ({ input }) => {
			return await cohortAnalyticsService.getCohortMetrics(input.cohortId);
		}),

	// Compare multiple cohorts
	compareCohorts: adminProcedure
		.route({
			method: "POST",
			path: "/cohorts/compare",
			tags: ["Cohort Analytics"],
			summary: "Compare cohorts",
			description: "Returns side-by-side comparison of multiple cohorts.",
		})
		.input(z.object({ cohortIds: z.array(z.string()).min(2).max(5) }))
		.output(
			z.array(
				z.object({
					cohortId: z.string(),
					cohortName: z.string(),
					metrics: cohortMetricsOutputSchema,
				}),
			),
		)
		.handler(async ({ input }) => {
			return await cohortAnalyticsService.compareCohorts(input.cohortIds);
		}),

	// Get top performers
	getTopPerformers: adminProcedure
		.route({
			method: "GET",
			path: "/cohorts/:cohortId/top-performers",
			tags: ["Cohort Analytics"],
			summary: "Get top performers",
			description: "Returns the top performing students in a cohort.",
		})
		.input(
			z.object({
				cohortId: z.string(),
				limit: z.number().optional().default(10),
			}),
		)
		.output(z.array(studentPerformanceSchema))
		.handler(async ({ input }) => {
			return await cohortAnalyticsService.identifyTopPerformers(input.cohortId, input.limit);
		}),

	// Get at-risk students
	getAtRisk: adminProcedure
		.route({
			method: "GET",
			path: "/cohorts/:cohortId/at-risk",
			tags: ["Cohort Analytics"],
			summary: "Get at-risk students",
			description: "Returns students who need intervention based on activity and performance.",
		})
		.input(z.object({ cohortId: z.string() }))
		.output(z.array(studentPerformanceSchema))
		.handler(async ({ input }) => {
			return await cohortAnalyticsService.identifyAtRisk(input.cohortId);
		}),

	// Predict cohort outcomes
	predictOutcomes: adminProcedure
		.route({
			method: "GET",
			path: "/cohorts/:cohortId/predictions",
			tags: ["Cohort Analytics"],
			summary: "Predict cohort outcomes",
			description: "Returns predicted success rates and recommendations for a cohort.",
		})
		.input(z.object({ cohortId: z.string() }))
		.output(cohortPredictionSchema)
		.handler(async ({ input }) => {
			return await cohortAnalyticsService.predictCohortOutcomes(input.cohortId);
		}),

	// Save metrics snapshot
	saveMetricsSnapshot: adminProcedure
		.route({
			method: "POST",
			path: "/cohorts/:cohortId/metrics/snapshot",
			tags: ["Cohort Analytics"],
			summary: "Save metrics snapshot",
			description: "Records current metrics for historical tracking.",
		})
		.input(z.object({ cohortId: z.string() }))
		.output(
			z.object({
				id: z.string().uuid(),
				cohortId: z.string(),
				recordedAt: z.coerce.date(),
			}),
		)
		.handler(async ({ input }) => {
			return await cohortAnalyticsService.saveCohortMetrics(input.cohortId);
		}),

	// Get metrics history
	getMetricsHistory: adminProcedure
		.route({
			method: "GET",
			path: "/cohorts/:cohortId/metrics/history",
			tags: ["Cohort Analytics"],
			summary: "Get metrics history",
			description: "Returns historical metrics snapshots for trend analysis.",
		})
		.input(
			z.object({
				cohortId: z.string(),
				limit: z.number().optional().default(30),
			}),
		)
		.output(
			z.array(
				z.object({
					id: z.string().uuid(),
					cohortId: z.string(),
					totalMembers: z.number(),
					avgResumeProgress: z.number(),
					avgSkillsScore: z.number(),
					avgInterviewScore: z.number(),
					placementRate: z.number(),
					activeMembers: z.number(),
					completedTraining: z.number(),
					atRiskCount: z.number(),
					recordedAt: z.coerce.date(),
				}),
			),
		)
		.handler(async ({ input }) => {
			return await cohortAnalyticsService.getMetricsHistory(input.cohortId, input.limit);
		}),

	// Set benchmark
	setBenchmark: adminProcedure
		.route({
			method: "POST",
			path: "/cohorts/:cohortId/benchmarks",
			tags: ["Cohort Analytics"],
			summary: "Set cohort benchmark",
			description: "Creates a performance benchmark for the cohort.",
		})
		.input(
			z.object({
				cohortId: z.string(),
				name: z.string().min(1).max(200),
				targetPlacementRate: z.number().min(0).max(100).optional(),
				targetSkillsScore: z.number().min(0).max(100).optional(),
				targetInterviewScore: z.number().min(0).max(100).optional(),
				targetCompletionRate: z.number().min(0).max(100).optional(),
			}),
		)
		.output(
			z.object({
				id: z.string().uuid(),
				cohortId: z.string(),
				name: z.string(),
				createdAt: z.coerce.date(),
			}),
		)
		.handler(async ({ input }) => {
			const { cohortId, ...data } = input;
			return await cohortAnalyticsService.setBenchmark(cohortId, data);
		}),

	// Get benchmarks
	getBenchmarks: adminProcedure
		.route({
			method: "GET",
			path: "/cohorts/:cohortId/benchmarks",
			tags: ["Cohort Analytics"],
			summary: "Get cohort benchmarks",
			description: "Returns all active benchmarks for a cohort.",
		})
		.input(z.object({ cohortId: z.string() }))
		.output(
			z.array(
				z.object({
					id: z.string().uuid(),
					cohortId: z.string(),
					name: z.string(),
					targetPlacementRate: z.number().nullable(),
					targetSkillsScore: z.number().nullable(),
					targetInterviewScore: z.number().nullable(),
					targetCompletionRate: z.number().nullable(),
					isActive: z.boolean(),
					createdAt: z.coerce.date(),
				}),
			),
		)
		.handler(async ({ input }) => {
			return await cohortAnalyticsService.getBenchmarks(input.cohortId);
		}),

	// Generate cohort report
	generateReport: adminProcedure
		.route({
			method: "GET",
			path: "/cohorts/:cohortId/report",
			tags: ["Cohort Analytics"],
			summary: "Generate cohort report",
			description: "Generates a comprehensive report for a cohort suitable for admin review.",
		})
		.input(z.object({ cohortId: z.string() }))
		.output(
			z.object({
				cohort: z.object({
					id: z.string().uuid(),
					name: z.string(),
					description: z.string().nullable(),
					criteria: cohortCriteriaSchema,
				}),
				generatedAt: z.string(),
				summary: z.object({
					totalMembers: z.number(),
					activeMembers: z.number(),
					placementRate: z.number(),
					atRiskCount: z.number(),
				}),
				metrics: cohortMetricsOutputSchema,
				members: z.array(
					z.object({
						id: z.string().uuid(),
						userId: z.string(),
						userName: z.string(),
						userEmail: z.string(),
						joinedAt: z.coerce.date(),
						status: z.string(),
					}),
				),
				topPerformers: z.array(studentPerformanceSchema),
				atRiskStudents: z.array(studentPerformanceSchema),
				predictions: cohortPredictionSchema,
				history: z.array(z.any()),
				benchmarks: z.array(z.any()),
				insights: z.object({
					strengthAreas: z.array(z.string()),
					improvementAreas: z.array(z.string()),
					keyRecommendations: z.array(z.string()),
				}),
			}),
		)
		.handler(async ({ input }) => {
			return await cohortAnalyticsService.generateCohortReport(input.cohortId);
		}),
};
