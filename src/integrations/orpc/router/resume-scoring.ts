import z from "zod";
import { protectedProcedure } from "../context";
import { resumeScoringService } from "../services/resume-scoring";

// Section score status schema
const sectionScoreStatusSchema = z.enum(["excellent", "good", "needs-improvement", "missing"]);

// Impact level schema
const impactLevelSchema = z.enum(["high", "medium", "low"]);

// Effort level schema
const effortLevelSchema = z.enum(["easy", "medium", "hard"]);

// Section score schema
const sectionScoreSchema = z.object({
	name: z.string(),
	score: z.number(),
	maxScore: z.number(),
	feedback: z.string(),
	status: sectionScoreStatusSchema,
});

// ATS check item schema
const atsCheckItemSchema = z.object({
	id: z.string().uuid(),
	label: z.string(),
	passed: z.boolean(),
	impact: impactLevelSchema,
	suggestion: z.string().optional(),
});

// Readability score schema
const readabilityScoreSchema = z.object({
	score: z.number(),
	gradeLevel: z.string(),
	avgSentenceLength: z.number(),
	complexWords: z.number(),
	passiveVoice: z.number(),
	feedback: z.string(),
});

// Visual appeal score schema
const visualAppealScoreSchema = z.object({
	score: z.number(),
	balance: z.number(),
	whitespace: z.number(),
	consistency: z.number(),
	hierarchy: z.number(),
	feedback: z.string(),
});

// Content completeness schema
const contentCompletenessSchema = z.object({
	score: z.number(),
	filledSections: z.number(),
	totalSections: z.number(),
	missingCritical: z.array(z.string()),
	recommendations: z.array(z.string()),
});

// Improvement suggestion schema
const improvementSuggestionSchema = z.object({
	id: z.string().uuid(),
	category: z.string(),
	title: z.string(),
	description: z.string(),
	impact: impactLevelSchema,
	effort: effortLevelSchema,
});

// Industry benchmark schema
const industryBenchmarkSchema = z.object({
	industry: z.string(),
	avgScore: z.number(),
	topScore: z.number(),
	yourScore: z.number(),
	percentile: z.number(),
});

// Radar data point schema
const radarDataPointSchema = z.object({
	dimension: z.string(),
	score: z.number(),
	fullMark: z.number(),
});

// Before/after comparison schema
const beforeAfterComparisonSchema = z.object({
	metric: z.string(),
	before: z.number(),
	after: z.number(),
	improvement: z.number(),
});

// Scoring result schema
const scoringResultSchema = z.object({
	id: z.string().uuid(),
	userId: z.string(),
	resumeId: z.string().nullable(),
	resumeName: z.string(),
	overallScore: z.number(),
	sectionScores: z.array(sectionScoreSchema),
	atsChecklist: z.array(atsCheckItemSchema),
	atsScore: z.number(),
	readabilityScore: readabilityScoreSchema.nullable(),
	visualAppealScore: visualAppealScoreSchema.nullable(),
	contentCompleteness: contentCompletenessSchema.nullable(),
	improvementSuggestions: z.array(improvementSuggestionSchema),
	industryBenchmarks: z.array(industryBenchmarkSchema),
	radarData: z.array(radarDataPointSchema),
	selectedIndustry: z.string().nullable(),
	createdAt: z.coerce.date(),
	updatedAt: z.coerce.date(),
});

// Scoring history schema
const scoringHistorySchema = z.object({
	id: z.string().uuid(),
	userId: z.string(),
	resumeId: z.string().nullable(),
	scoringResultId: z.string(),
	overallScore: z.number(),
	atsScore: z.number(),
	readabilityScore: z.number(),
	visualScore: z.number(),
	completenessScore: z.number(),
	createdAt: z.coerce.date(),
});

export const resumeScoringRouter = {
	create: protectedProcedure
		.route({
			method: "POST",
			path: "/resume-scoring",
			tags: ["Resume Scoring"],
			summary: "Create a new resume scoring result",
		})
		.input(
			z.object({
				resumeId: z.string().optional().nullable(),
				resumeName: z.string(),
				overallScore: z.number().min(0).max(100),
				sectionScores: z.array(sectionScoreSchema),
				atsChecklist: z.array(atsCheckItemSchema),
				atsScore: z.number().min(0).max(100),
				readabilityScore: readabilityScoreSchema.optional().nullable(),
				visualAppealScore: visualAppealScoreSchema.optional().nullable(),
				contentCompleteness: contentCompletenessSchema.optional().nullable(),
				improvementSuggestions: z.array(improvementSuggestionSchema),
				industryBenchmarks: z.array(industryBenchmarkSchema),
				radarData: z.array(radarDataPointSchema),
				selectedIndustry: z.string().optional().nullable(),
			}),
		)
		.output(z.string())
		.handler(async ({ context, input }) => {
			return await resumeScoringService.create({
				...input,
				userId: context.user.id,
			});
		}),

	getById: protectedProcedure
		.route({
			method: "GET",
			path: "/resume-scoring/{id}",
			tags: ["Resume Scoring"],
			summary: "Get scoring result by ID",
		})
		.input(z.object({ id: z.string().uuid() }))
		.output(scoringResultSchema)
		.handler(async ({ context, input }) => {
			return await resumeScoringService.getById({ id: input.id, userId: context.user.id });
		}),

	getLatest: protectedProcedure
		.route({
			method: "GET",
			path: "/resume-scoring/latest",
			tags: ["Resume Scoring"],
			summary: "Get the latest scoring result for the user",
		})
		.output(scoringResultSchema.nullable())
		.handler(async ({ context }) => {
			return await resumeScoringService.getLatest({ userId: context.user.id });
		}),

	getLatestByResumeId: protectedProcedure
		.route({
			method: "GET",
			path: "/resume-scoring/resume/{resumeId}/latest",
			tags: ["Resume Scoring"],
			summary: "Get the latest scoring result for a specific resume",
		})
		.input(z.object({ resumeId: z.string() }))
		.output(scoringResultSchema.nullable())
		.handler(async ({ context, input }) => {
			return await resumeScoringService.getLatestByResumeId({
				resumeId: input.resumeId,
				userId: context.user.id,
			});
		}),

	list: protectedProcedure
		.route({
			method: "GET",
			path: "/resume-scoring",
			tags: ["Resume Scoring"],
			summary: "List all scoring results",
		})
		.input(
			z
				.object({
					resumeId: z.string().optional(),
				})
				.optional()
				.default({}),
		)
		.output(z.array(scoringResultSchema))
		.handler(async ({ context, input }) => {
			return await resumeScoringService.list({
				userId: context.user.id,
				resumeId: input.resumeId,
			});
		}),

	update: protectedProcedure
		.route({
			method: "PUT",
			path: "/resume-scoring/{id}",
			tags: ["Resume Scoring"],
			summary: "Update a scoring result",
		})
		.input(
			z.object({
				id: z.string().uuid(),
				overallScore: z.number().min(0).max(100).optional(),
				sectionScores: z.array(sectionScoreSchema).optional(),
				atsChecklist: z.array(atsCheckItemSchema).optional(),
				atsScore: z.number().min(0).max(100).optional(),
				readabilityScore: readabilityScoreSchema.optional().nullable(),
				visualAppealScore: visualAppealScoreSchema.optional().nullable(),
				contentCompleteness: contentCompletenessSchema.optional().nullable(),
				improvementSuggestions: z.array(improvementSuggestionSchema).optional(),
				industryBenchmarks: z.array(industryBenchmarkSchema).optional(),
				radarData: z.array(radarDataPointSchema).optional(),
				selectedIndustry: z.string().optional().nullable(),
			}),
		)
		.output(z.void())
		.handler(async ({ context, input }) => {
			return await resumeScoringService.update({
				...input,
				userId: context.user.id,
			});
		}),

	updateSelectedIndustry: protectedProcedure
		.route({
			method: "POST",
			path: "/resume-scoring/{id}/industry",
			tags: ["Resume Scoring"],
			summary: "Update selected industry for a scoring result",
		})
		.input(
			z.object({
				id: z.string().uuid(),
				industry: z.string(),
			}),
		)
		.output(z.void())
		.handler(async ({ context, input }) => {
			return await resumeScoringService.updateSelectedIndustry({
				id: input.id,
				userId: context.user.id,
				industry: input.industry,
			});
		}),

	delete: protectedProcedure
		.route({
			method: "DELETE",
			path: "/resume-scoring/{id}",
			tags: ["Resume Scoring"],
			summary: "Delete a scoring result",
		})
		.input(z.object({ id: z.string().uuid() }))
		.output(z.void())
		.handler(async ({ context, input }) => {
			return await resumeScoringService.delete({ id: input.id, userId: context.user.id });
		}),

	getHistory: protectedProcedure
		.route({
			method: "GET",
			path: "/resume-scoring/history",
			tags: ["Resume Scoring"],
			summary: "Get scoring history",
		})
		.input(
			z
				.object({
					limit: z.number().min(1).max(50).optional(),
				})
				.optional()
				.default({}),
		)
		.output(z.array(scoringHistorySchema))
		.handler(async ({ context, input }) => {
			return await resumeScoringService.getHistory({
				userId: context.user.id,
				limit: input.limit,
			});
		}),

	getBeforeAfterComparison: protectedProcedure
		.route({
			method: "GET",
			path: "/resume-scoring/comparison",
			tags: ["Resume Scoring"],
			summary: "Get before/after comparison data",
		})
		.output(z.array(beforeAfterComparisonSchema))
		.handler(async ({ context }) => {
			return await resumeScoringService.getBeforeAfterComparison({ userId: context.user.id });
		}),

	getStatistics: protectedProcedure
		.route({
			method: "GET",
			path: "/resume-scoring/statistics",
			tags: ["Resume Scoring"],
			summary: "Get scoring statistics",
		})
		.output(
			z.object({
				total: z.number(),
				averageOverallScore: z.number(),
				averageAtsScore: z.number(),
				highestScore: z.number(),
				latestScore: z.number(),
				improvementFromFirst: z.number(),
			}),
		)
		.handler(async ({ context }) => {
			return await resumeScoringService.getStatistics({ userId: context.user.id });
		}),
};
