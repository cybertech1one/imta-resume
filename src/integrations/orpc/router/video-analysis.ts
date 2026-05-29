import z from "zod";
import { protectedProcedure } from "../context";
import { videoAnalysisService } from "../services/video-analysis";

// ============================================
// SCHEMAS
// ============================================

const videoAnalysisCategorySchema = z.enum([
	"body_language",
	"eye_contact",
	"voice",
	"confidence",
	"posture",
	"facial_expression",
]);

const categoryScoreSchema = z.object({
	category: videoAnalysisCategorySchema,
	score: z.number().min(0).max(100),
	feedback: z.string(),
	suggestions: z.array(z.string()),
});

const voiceMetricSchema = z.object({
	label: z.string(),
	score: z.number().min(0).max(100),
	description: z.string(),
});

const voiceMetricsSchema = z.object({
	tone: voiceMetricSchema,
	pace: voiceMetricSchema,
	clarity: voiceMetricSchema,
	volume: voiceMetricSchema,
	fillerWords: z.object({
		count: z.number(),
		examples: z.array(z.string()),
	}),
});

const highlightSchema = z.object({
	type: z.enum(["positive", "negative"]),
	time: z.string(),
	description: z.string(),
});

const videoAnalysisResultSchema = z.object({
	id: z.string().uuid(),
	userId: z.string(),
	title: z.string(),
	overallScore: z.number(),
	duration: z.number(),
	categories: z.array(categoryScoreSchema),
	voiceMetrics: voiceMetricsSchema,
	highlights: z.array(highlightSchema),
	recommendations: z.array(z.string()),
	videoUrl: z.string().nullable(),
	thumbnailUrl: z.string().nullable(),
	createdAt: z.coerce.date(),
	updatedAt: z.coerce.date(),
});

const postureChecklistSchema = z.object({
	id: z.string().uuid(),
	userId: z.string(),
	checkedItems: z.array(z.string()),
	createdAt: z.coerce.date(),
	updatedAt: z.coerce.date(),
});

// ============================================
// RESULTS ROUTER
// ============================================

const resultsRouter = {
	create: protectedProcedure
		.route({
			method: "POST",
			path: "/video-analysis/results",
			tags: ["Video Analysis"],
			summary: "Create new video analysis result",
		})
		.input(
			z.object({
				title: z.string().min(1),
				overallScore: z.number().min(0).max(100),
				duration: z.number().min(0),
				categories: z.array(categoryScoreSchema),
				voiceMetrics: voiceMetricsSchema,
				highlights: z.array(highlightSchema),
				recommendations: z.array(z.string()),
				videoUrl: z.string().optional(),
				thumbnailUrl: z.string().optional(),
			}),
		)
		.output(videoAnalysisResultSchema)
		.handler(async ({ context, input }) => {
			return await videoAnalysisService.results.create({
				userId: context.user.id,
				...input,
			});
		}),

	getById: protectedProcedure
		.route({
			method: "GET",
			path: "/video-analysis/results/{id}",
			tags: ["Video Analysis"],
			summary: "Get video analysis result by ID",
		})
		.input(z.object({ id: z.string().uuid() }))
		.output(videoAnalysisResultSchema)
		.handler(async ({ context, input }) => {
			return await videoAnalysisService.results.getById({
				id: input.id,
				userId: context.user.id,
			});
		}),

	list: protectedProcedure
		.route({
			method: "GET",
			path: "/video-analysis/results",
			tags: ["Video Analysis"],
			summary: "List video analysis results",
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
		.output(
			z.object({
				items: z.array(videoAnalysisResultSchema),
				total: z.number(),
			}),
		)
		.handler(async ({ context, input }) => {
			return await videoAnalysisService.results.list({
				userId: context.user.id,
				limit: input.limit,
				offset: input.offset,
			});
		}),

	update: protectedProcedure
		.route({
			method: "PUT",
			path: "/video-analysis/results/{id}",
			tags: ["Video Analysis"],
			summary: "Update video analysis result",
		})
		.input(
			z.object({
				id: z.string().uuid(),
				title: z.string().optional(),
				overallScore: z.number().min(0).max(100).optional(),
				duration: z.number().min(0).optional(),
				categories: z.array(categoryScoreSchema).optional(),
				voiceMetrics: voiceMetricsSchema.optional(),
				highlights: z.array(highlightSchema).optional(),
				recommendations: z.array(z.string()).optional(),
				videoUrl: z.string().optional(),
				thumbnailUrl: z.string().optional(),
			}),
		)
		.output(videoAnalysisResultSchema)
		.handler(async ({ context, input }) => {
			return await videoAnalysisService.results.update({
				...input,
				userId: context.user.id,
			});
		}),

	delete: protectedProcedure
		.route({
			method: "DELETE",
			path: "/video-analysis/results/{id}",
			tags: ["Video Analysis"],
			summary: "Delete video analysis result",
		})
		.input(z.object({ id: z.string().uuid() }))
		.output(z.void())
		.handler(async ({ context, input }) => {
			return await videoAnalysisService.results.delete({
				id: input.id,
				userId: context.user.id,
			});
		}),

	getStatistics: protectedProcedure
		.route({
			method: "GET",
			path: "/video-analysis/statistics",
			tags: ["Video Analysis"],
			summary: "Get video analysis statistics",
		})
		.output(
			z.object({
				totalAnalyses: z.number(),
				averageScore: z.number(),
				totalDuration: z.number(),
				bestScore: z.number(),
				categoryAverages: z.record(videoAnalysisCategorySchema, z.number()),
				recentImprovement: z.number(),
			}),
		)
		.handler(async ({ context }) => {
			return await videoAnalysisService.results.getStatistics({
				userId: context.user.id,
			});
		}),

	getLatest: protectedProcedure
		.route({
			method: "GET",
			path: "/video-analysis/results/latest",
			tags: ["Video Analysis"],
			summary: "Get latest video analysis result",
		})
		.output(videoAnalysisResultSchema.nullable())
		.handler(async ({ context }) => {
			return await videoAnalysisService.results.getLatest({
				userId: context.user.id,
			});
		}),
};

// ============================================
// POSTURE CHECKLIST ROUTER
// ============================================

const postureChecklistRouter = {
	get: protectedProcedure
		.route({
			method: "GET",
			path: "/video-analysis/posture-checklist",
			tags: ["Video Analysis"],
			summary: "Get posture checklist state",
		})
		.output(postureChecklistSchema)
		.handler(async ({ context }) => {
			return await videoAnalysisService.postureChecklist.get({
				userId: context.user.id,
			});
		}),

	toggleItem: protectedProcedure
		.route({
			method: "POST",
			path: "/video-analysis/posture-checklist/toggle",
			tags: ["Video Analysis"],
			summary: "Toggle posture checklist item",
		})
		.input(z.object({ itemId: z.string() }))
		.output(postureChecklistSchema)
		.handler(async ({ context, input }) => {
			return await videoAnalysisService.postureChecklist.toggleItem({
				userId: context.user.id,
				itemId: input.itemId,
			});
		}),

	reset: protectedProcedure
		.route({
			method: "POST",
			path: "/video-analysis/posture-checklist/reset",
			tags: ["Video Analysis"],
			summary: "Reset posture checklist",
		})
		.output(postureChecklistSchema)
		.handler(async ({ context }) => {
			return await videoAnalysisService.postureChecklist.reset({
				userId: context.user.id,
			});
		}),
};

// ============================================
// MAIN ROUTER
// ============================================

export const videoAnalysisRouter = {
	results: resultsRouter,
	postureChecklist: postureChecklistRouter,
};
