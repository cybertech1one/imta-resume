import z from "zod";
import type { MockAiMessage } from "@/integrations/drizzle/schema";
import { protectedProcedure } from "../context";
import { mockAiService } from "../services/mock-ai";

const fieldSchema = z.enum(["healthcare", "industrial", "hse", "technology", "management"]);
const difficultySchema = z.enum(["debutant", "intermediaire", "avance"]);

const messageFeedbackSchema = z.object({
	score: z.number(),
	strengths: z.array(z.string()),
	improvements: z.array(z.string()),
	tip: z.string().optional(),
});

const messageSchema = z.object({
	id: z.string().uuid(),
	role: z.enum(["user", "assistant"]),
	content: z.string(),
	timestamp: z.string(),
	feedback: messageFeedbackSchema.optional(),
});

export const mockAiRouter = {
	// ========================================
	// SESSION MANAGEMENT
	// ========================================

	// Create a new interview session
	createSession: protectedProcedure
		.input(
			z.object({
				field: fieldSchema,
				program: z.string(),
				difficulty: difficultySchema,
				totalQuestions: z.number().min(1).max(20),
				initialMessage: messageSchema,
			}),
		)
		.handler(async ({ context, input }) => {
			return await mockAiService.createSession({
				userId: context.user.id,
				field: input.field,
				program: input.program,
				difficulty: input.difficulty,
				totalQuestions: input.totalQuestions,
				initialMessage: input.initialMessage as MockAiMessage,
			});
		}),

	// Get current (incomplete) session
	getCurrentSession: protectedProcedure.handler(async ({ context }) => {
		return await mockAiService.getCurrentSession(context.user.id);
	}),

	// Get session by ID
	getSession: protectedProcedure.input(z.object({ sessionId: z.string() })).handler(async ({ context, input }) => {
		return await mockAiService.getSession(input.sessionId, context.user.id);
	}),

	// Update session (add messages, update score, etc.)
	updateSession: protectedProcedure
		.input(
			z.object({
				sessionId: z.string(),
				messages: z.array(messageSchema).optional(),
				currentQuestionIndex: z.number().optional(),
				scores: z.array(z.number()).optional(),
				overallScore: z.number().optional(),
				completedAt: z.string().optional(), // ISO date string
			}),
		)
		.handler(async ({ context, input }) => {
			return await mockAiService.updateSession({
				sessionId: input.sessionId,
				userId: context.user.id,
				messages: input.messages as MockAiMessage[] | undefined,
				currentQuestionIndex: input.currentQuestionIndex,
				scores: input.scores,
				overallScore: input.overallScore,
				completedAt: input.completedAt ? new Date(input.completedAt) : undefined,
			});
		}),

	// Delete/abandon current session
	deleteSession: protectedProcedure.input(z.object({ sessionId: z.string() })).handler(async ({ context, input }) => {
		return await mockAiService.deleteSession(input.sessionId, context.user.id);
	}),

	// Get session history (completed sessions)
	getHistory: protectedProcedure
		.input(z.object({ limit: z.number().min(1).max(100).optional() }).optional())
		.handler(async ({ context, input }) => {
			return await mockAiService.getHistory(context.user.id, input?.limit ?? 20);
		}),

	// Get statistics
	getStatistics: protectedProcedure.handler(async ({ context }) => {
		return await mockAiService.getStatistics(context.user.id);
	}),

	// ========================================
	// CONFIGURATION DATA
	// ========================================

	// Get all field configurations
	getFieldConfigs: protectedProcedure.handler(async () => {
		return await mockAiService.getFieldConfigs();
	}),

	// Get programs for a specific field
	getProgramsByField: protectedProcedure.input(z.object({ field: fieldSchema })).handler(async ({ input }) => {
		return await mockAiService.getProgramsByField(input.field);
	}),

	// Get all programs grouped by field
	getAllPrograms: protectedProcedure.handler(async () => {
		return await mockAiService.getAllPrograms();
	}),

	// Get all difficulty configurations
	getDifficultyConfigs: protectedProcedure.handler(async () => {
		return await mockAiService.getDifficultyConfigs();
	}),

	// ========================================
	// QUESTIONS
	// ========================================

	// Get questions for a specific field/program/difficulty
	getQuestions: protectedProcedure
		.input(
			z.object({
				field: fieldSchema,
				program: z.string(),
				difficulty: difficultySchema,
			}),
		)
		.handler(async ({ input }) => {
			return await mockAiService.getQuestions(input.field, input.program, input.difficulty);
		}),

	// ========================================
	// FEEDBACK TEMPLATES
	// ========================================

	// Get all feedback templates
	getFeedbackTemplates: protectedProcedure.handler(async () => {
		return await mockAiService.getFeedbackTemplates();
	}),

	// Get feedback template for a specific score
	getFeedbackTemplateForScore: protectedProcedure
		.input(z.object({ score: z.number().min(0).max(100) }))
		.handler(async ({ input }) => {
			return await mockAiService.getFeedbackTemplateForScore(input.score);
		}),

	// ========================================
	// INTERVIEW TIPS
	// ========================================

	// Get all interview tips
	getInterviewTips: protectedProcedure.handler(async () => {
		return await mockAiService.getInterviewTips();
	}),

	// Get a random interview tip
	getRandomTip: protectedProcedure.handler(async () => {
		return await mockAiService.getRandomTip();
	}),
};
