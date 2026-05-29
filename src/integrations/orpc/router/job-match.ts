import z from "zod";
import type {
	JobMatchExperienceResult,
	JobMatchKeywordResult,
	JobMatchResult,
	JobMatchSkillMatch,
	JobMatchSkillsResult,
	JobMatchSuggestion,
} from "@/integrations/drizzle/schema";
import { protectedProcedure } from "../context";
import { jobMatchService } from "../services/job-match";

// Zod schemas for validation
const skillMatchSchema = z.object({
	skill: z.string(),
	resumeLevel: z.number(),
	requiredLevel: z.enum(["basic", "intermediate", "advanced", "expert"]),
	match: z.enum(["exact", "above", "below"]),
}) satisfies z.ZodType<JobMatchSkillMatch>;

const keywordResultSchema = z.object({
	score: z.number(),
	matched: z.array(z.string()),
	missing: z.array(z.string()),
	partial: z.array(z.string()),
}) satisfies z.ZodType<JobMatchKeywordResult>;

const skillsResultSchema = z.object({
	score: z.number(),
	matched: z.array(skillMatchSchema),
	missing: z.array(z.string()),
	additional: z.array(z.string()),
}) satisfies z.ZodType<JobMatchSkillsResult>;

const experienceResultSchema = z.object({
	score: z.number(),
	requiredYears: z.number(),
	candidateYears: z.number(),
	relevantExperience: z.array(z.string()),
	gaps: z.array(z.string()),
}) satisfies z.ZodType<JobMatchExperienceResult>;

const suggestionSchema = z.object({
	id: z.string().uuid(),
	category: z.enum(["keyword", "skill", "experience", "content"]),
	priority: z.enum(["high", "medium", "low"]),
	title: z.string(),
	description: z.string(),
	actionable: z.boolean(),
}) satisfies z.ZodType<JobMatchSuggestion>;

const matchResultSchema = z.object({
	overallScore: z.number(),
	keywordMatch: keywordResultSchema,
	skillsAlignment: skillsResultSchema,
	experienceComparison: experienceResultSchema,
	missingRequirements: z.array(z.string()),
	suggestions: z.array(suggestionSchema),
	analyzedAt: z.string(),
}) satisfies z.ZodType<JobMatchResult>;

const savedJobSchema = z.object({
	id: z.string().uuid(),
	userId: z.string(),
	title: z.string(),
	company: z.string(),
	description: z.string(),
	lastScore: z.number().nullable(),
	lastAnalyzedAt: z.coerce.date().nullable(),
	createdAt: z.coerce.date(),
	updatedAt: z.coerce.date(),
});

const analysisHistoryItemSchema = z.object({
	id: z.string().uuid(),
	jobTitle: z.string(),
	company: z.string(),
	resumeName: z.string(),
	score: z.number(),
	createdAt: z.coerce.date(),
});

export const jobMatchRouter = {
	// Saved Jobs endpoints
	createSavedJob: protectedProcedure
		.route({
			method: "POST",
			path: "/job-match/saved-jobs",
			tags: ["Job Match"],
			summary: "Save a job description for later analysis",
		})
		.input(
			z.object({
				title: z.string().min(1),
				company: z.string().min(1),
				description: z.string().min(1),
			}),
		)
		.output(z.string())
		.handler(async ({ context, input }) => {
			return await jobMatchService.createSavedJob({
				...input,
				userId: context.user.id,
			});
		}),

	getSavedJobById: protectedProcedure
		.route({
			method: "GET",
			path: "/job-match/saved-jobs/{id}",
			tags: ["Job Match"],
			summary: "Get a saved job description by ID",
		})
		.input(z.object({ id: z.string().uuid() }))
		.output(savedJobSchema)
		.handler(async ({ context, input }) => {
			return await jobMatchService.getSavedJobById({ id: input.id, userId: context.user.id });
		}),

	listSavedJobs: protectedProcedure
		.route({
			method: "GET",
			path: "/job-match/saved-jobs",
			tags: ["Job Match"],
			summary: "List all saved job descriptions",
		})
		.input(
			z
				.object({
					limit: z.number().optional(),
					offset: z.number().optional(),
				})
				.optional()
				.default({}),
		)
		.output(z.array(savedJobSchema))
		.handler(async ({ context, input }) => {
			return await jobMatchService.listSavedJobs({
				userId: context.user.id,
				...input,
			});
		}),

	updateSavedJob: protectedProcedure
		.route({
			method: "PUT",
			path: "/job-match/saved-jobs/{id}",
			tags: ["Job Match"],
			summary: "Update a saved job description",
		})
		.input(
			z.object({
				id: z.string().uuid(),
				title: z.string().optional(),
				company: z.string().optional(),
				description: z.string().optional(),
			}),
		)
		.output(z.void())
		.handler(async ({ context, input }) => {
			return await jobMatchService.updateSavedJob({
				...input,
				userId: context.user.id,
			});
		}),

	deleteSavedJob: protectedProcedure
		.route({
			method: "DELETE",
			path: "/job-match/saved-jobs/{id}",
			tags: ["Job Match"],
			summary: "Delete a saved job description",
		})
		.input(z.object({ id: z.string().uuid() }))
		.output(z.void())
		.handler(async ({ context, input }) => {
			return await jobMatchService.deleteSavedJob({ id: input.id, userId: context.user.id });
		}),

	// Analysis endpoints
	analyzeJobMatch: protectedProcedure
		.route({
			method: "POST",
			path: "/job-match/analyze",
			tags: ["Job Match"],
			summary: "Analyze job match between a resume and job description",
		})
		.input(
			z.object({
				resumeId: z.string(),
				jobTitle: z.string().min(1),
				company: z.string().min(1),
				jobDescription: z.string().min(1),
				savedJobId: z.string().optional(),
			}),
		)
		.output(
			z.object({
				analysisId: z.string(),
				result: matchResultSchema,
			}),
		)
		.handler(async ({ context, input }) => {
			return await jobMatchService.analyzeJobMatch({
				...input,
				userId: context.user.id,
			});
		}),

	getAnalysisById: protectedProcedure
		.route({
			method: "GET",
			path: "/job-match/analysis/{id}",
			tags: ["Job Match"],
			summary: "Get a job match analysis by ID",
		})
		.input(z.object({ id: z.string().uuid() }))
		.output(
			z.object({
				id: z.string().uuid(),
				userId: z.string(),
				savedJobId: z.string().nullable(),
				resumeId: z.string(),
				resumeName: z.string(),
				jobTitle: z.string(),
				company: z.string(),
				jobDescription: z.string(),
				score: z.number(),
				result: matchResultSchema,
				createdAt: z.coerce.date(),
			}),
		)
		.handler(async ({ context, input }) => {
			return await jobMatchService.getAnalysisById({ id: input.id, userId: context.user.id });
		}),

	listAnalysisHistory: protectedProcedure
		.route({
			method: "GET",
			path: "/job-match/analysis",
			tags: ["Job Match"],
			summary: "List job match analysis history",
		})
		.input(
			z
				.object({
					limit: z.number().optional(),
					offset: z.number().optional(),
				})
				.optional()
				.default({}),
		)
		.output(z.array(analysisHistoryItemSchema))
		.handler(async ({ context, input }) => {
			return await jobMatchService.listAnalysisHistory({
				userId: context.user.id,
				...input,
			});
		}),

	deleteAnalysis: protectedProcedure
		.route({
			method: "DELETE",
			path: "/job-match/analysis/{id}",
			tags: ["Job Match"],
			summary: "Delete a job match analysis",
		})
		.input(z.object({ id: z.string().uuid() }))
		.output(z.void())
		.handler(async ({ context, input }) => {
			return await jobMatchService.deleteAnalysis({ id: input.id, userId: context.user.id });
		}),

	clearAnalysisHistory: protectedProcedure
		.route({
			method: "DELETE",
			path: "/job-match/analysis",
			tags: ["Job Match"],
			summary: "Clear all job match analysis history",
		})
		.input(z.void())
		.output(z.void())
		.handler(async ({ context }) => {
			return await jobMatchService.clearAnalysisHistory({ userId: context.user.id });
		}),
};
