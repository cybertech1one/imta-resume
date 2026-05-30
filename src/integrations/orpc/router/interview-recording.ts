import z from "zod";
import type { RecordingStatus } from "@/integrations/drizzle/schema";
import { protectedProcedure } from "../context";
import { interviewRecordingService } from "../services/interview-recording";

// ============================================
// SCHEMAS
// ============================================

const recordingStatusSchema = z.enum(["pending", "processing", "analyzed", "failed"]);

const interviewFieldSchema = z.enum(["healthcare", "industrial", "hse", "technology", "management", "general"]);

const bodyLanguageCategorySchema = z.enum(["posture", "eye_contact", "gestures", "facial", "movement"]);

const bodyLanguageSeveritySchema = z.enum(["minor", "moderate", "major"]);

const fillerWordSchema = z.object({
	word: z.string(),
	count: z.number(),
	timestamps: z.array(z.number()),
});

const answerStructureSchema = z.object({
	hasIntro: z.boolean(),
	hasBody: z.boolean(),
	hasConclusion: z.boolean(),
	usesSTAR: z.boolean(),
});

const answerSegmentSchema = z.object({
	id: z.string().uuid(),
	question: z.string(),
	startTime: z.number(),
	endTime: z.number(),
	transcript: z.string(),
	score: z.number(),
	feedback: z.array(z.string()),
	idealAnswer: z.string().optional(),
	fillerWords: z.array(fillerWordSchema),
	speakingPace: z.number(),
	clarity: z.number(),
	structure: answerStructureSchema,
});

const bodyLanguageTipSchema = z.object({
	id: z.string().uuid(),
	category: bodyLanguageCategorySchema,
	issue: z.string(),
	suggestion: z.string(),
	timestamp: z.number().optional(),
	severity: bodyLanguageSeveritySchema,
});

const recordingSchema = z.object({
	id: z.string().uuid(),
	userId: z.string(),
	title: z.string(),
	date: z.string(),
	duration: z.number(),
	status: recordingStatusSchema,
	thumbnailUrl: z.string().nullable(),
	videoUrl: z.string().nullable(),
	field: z.string(),
	program: z.string().nullable(),
	overallScore: z.number(),
	speakingPaceScore: z.number(),
	clarityScore: z.number(),
	contentQualityScore: z.number(),
	bodyLanguageScore: z.number(),
	answerStructureScore: z.number(),
	fillerWordCount: z.number(),
	segments: z.array(answerSegmentSchema),
	bodyLanguageTips: z.array(bodyLanguageTipSchema),
	improvementSuggestions: z.array(z.string()),
	strengths: z.array(z.string()),
	areasToImprove: z.array(z.string()),
	createdAt: z.coerce.date(),
	updatedAt: z.coerce.date(),
});

const progressDataSchema = z.object({
	id: z.string().uuid(),
	userId: z.string(),
	date: z.string(),
	overallScore: z.number(),
	speakingPace: z.number(),
	clarity: z.number(),
	contentQuality: z.number(),
	bodyLanguage: z.number(),
	fillerWords: z.number(),
	recordingId: z.string().nullable(),
	createdAt: z.coerce.date(),
});

// ============================================
// RECORDINGS ROUTER
// ============================================

const recordingsRouter = {
	create: protectedProcedure
		.route({
			method: "POST",
			path: "/interview-recording/recordings",
			tags: ["Interview Recording"],
			summary: "Create new interview recording",
		})
		.input(
			z.object({
				title: z.string().min(1).max(255),
				date: z.string(),
				duration: z.number().min(0),
				field: interviewFieldSchema,
				program: z.string().optional(),
				videoUrl: z.string().optional(),
				thumbnailUrl: z.string().optional(),
			}),
		)
		.output(recordingSchema)
		.handler(async ({ context, input }) => {
			return await interviewRecordingService.recordings.create({
				userId: context.user.id,
				...input,
			});
		}),

	getById: protectedProcedure
		.route({
			method: "GET",
			path: "/interview-recording/recordings/{id}",
			tags: ["Interview Recording"],
			summary: "Get recording by ID",
		})
		.input(z.object({ id: z.string().uuid() }))
		.output(recordingSchema)
		.handler(async ({ context, input }) => {
			return await interviewRecordingService.recordings.getById({
				id: input.id,
				userId: context.user.id,
			});
		}),

	list: protectedProcedure
		.route({
			method: "GET",
			path: "/interview-recording/recordings",
			tags: ["Interview Recording"],
			summary: "List interview recordings",
		})
		.input(
			z
				.object({
					field: z.string().optional(),
					status: recordingStatusSchema.optional(),
					search: z.string().optional(),
					limit: z.number().optional(),
					offset: z.number().optional(),
				})
				.optional()
				.default({}),
		)
		.output(
			z.object({
				items: z.array(recordingSchema),
				total: z.number(),
			}),
		)
		.handler(async ({ context, input }) => {
			return await interviewRecordingService.recordings.list({
				userId: context.user.id,
				field: input.field,
				status: input.status as RecordingStatus | undefined,
				search: input.search,
				limit: input.limit,
				offset: input.offset,
			});
		}),

	update: protectedProcedure
		.route({
			method: "PUT",
			path: "/interview-recording/recordings/{id}",
			tags: ["Interview Recording"],
			summary: "Update recording",
		})
		.input(
			z.object({
				id: z.string().uuid(),
				title: z.string().min(1).max(255).optional(),
				status: recordingStatusSchema.optional(),
				overallScore: z.number().optional(),
				speakingPaceScore: z.number().optional(),
				clarityScore: z.number().optional(),
				contentQualityScore: z.number().optional(),
				bodyLanguageScore: z.number().optional(),
				answerStructureScore: z.number().optional(),
				fillerWordCount: z.number().optional(),
				segments: z.array(answerSegmentSchema).optional(),
				bodyLanguageTips: z.array(bodyLanguageTipSchema).optional(),
				improvementSuggestions: z.array(z.string()).optional(),
				strengths: z.array(z.string()).optional(),
				areasToImprove: z.array(z.string()).optional(),
			}),
		)
		.output(recordingSchema)
		.handler(async ({ context, input }) => {
			return await interviewRecordingService.recordings.update({
				...input,
				userId: context.user.id,
				status: input.status as RecordingStatus | undefined,
			});
		}),

	delete: protectedProcedure
		.route({
			method: "DELETE",
			path: "/interview-recording/recordings/{id}",
			tags: ["Interview Recording"],
			summary: "Delete recording",
		})
		.input(z.object({ id: z.string().uuid() }))
		.output(z.void())
		.handler(async ({ context, input }) => {
			return await interviewRecordingService.recordings.delete({
				id: input.id,
				userId: context.user.id,
			});
		}),

	analyze: protectedProcedure
		.route({
			method: "POST",
			path: "/interview-recording/recordings/{id}/analyze",
			tags: ["Interview Recording"],
			summary: "Trigger AI analysis of recording",
		})
		.input(z.object({ id: z.string().uuid() }))
		.output(recordingSchema)
		.handler(async ({ context, input }) => {
			return await interviewRecordingService.recordings.analyze({
				id: input.id,
				userId: context.user.id,
			});
		}),

	getStatistics: protectedProcedure
		.route({
			method: "GET",
			path: "/interview-recording/statistics",
			tags: ["Interview Recording"],
			summary: "Get recording statistics",
		})
		.output(
			z.object({
				total: z.number(),
				analyzed: z.number(),
				avgScore: z.number(),
				avgFillerWords: z.number(),
				trend: z.number(),
			}),
		)
		.handler(async ({ context }) => {
			return await interviewRecordingService.recordings.getStatistics({
				userId: context.user.id,
			});
		}),
};

// ============================================
// PROGRESS ROUTER
// ============================================

const progressRouter = {
	list: protectedProcedure
		.route({
			method: "GET",
			path: "/interview-recording/progress",
			tags: ["Interview Recording"],
			summary: "Get progress data",
		})
		.input(
			z
				.object({
					limit: z.number().optional(),
				})
				.optional()
				.default({}),
		)
		.output(z.array(progressDataSchema))
		.handler(async ({ context, input }) => {
			return await interviewRecordingService.progress.list({
				userId: context.user.id,
				limit: input.limit,
			});
		}),

	getLatest: protectedProcedure
		.route({
			method: "GET",
			path: "/interview-recording/progress/latest",
			tags: ["Interview Recording"],
			summary: "Get latest progress entry",
		})
		.output(progressDataSchema.nullable())
		.handler(async ({ context }) => {
			return await interviewRecordingService.progress.getLatest({
				userId: context.user.id,
			});
		}),
};

// ============================================
// MAIN ROUTER
// ============================================

export const interviewRecordingRouter = {
	recordings: recordingsRouter,
	progress: progressRouter,
};
