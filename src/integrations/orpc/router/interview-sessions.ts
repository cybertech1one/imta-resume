import { ORPCError } from "@orpc/server";
import { and, desc, eq } from "drizzle-orm";
import z from "zod";
import { db } from "@/integrations/drizzle/client";
import {
	type InterviewResponse,
	interviewAnalysis,
	interviewSession,
	type ResponseEvaluation,
} from "@/integrations/drizzle/schema";
import { interviewQuestionSchema, responseEvaluationSchema } from "@/schema/interview";
import { protectedProcedure } from "../context";

export const interviewSessionEndpoints = {
	// Create a new interview session
	createSession: protectedProcedure
		.input(
			z.object({
				title: z.string(),
				description: z.string().optional(),
				field: z.enum(["healthcare", "industrial", "hse", "general"]),
				types: z.array(z.enum(["behavioral", "technical", "situational", "motivational", "general"])),
				difficulty: z.enum(["beginner", "intermediate", "advanced"]),
				language: z.enum(["fr", "en", "ar"]).default("fr"),
				resumeId: z.string().optional(),
				jobPosition: z.string().optional(),
				companyName: z.string().optional(),
				questions: z.array(interviewQuestionSchema),
			}),
		)
		.handler(async ({ input, context }) => {
			const [session] = await db
				.insert(interviewSession)
				.values({
					userId: context.user.id,
					title: input.title,
					description: input.description,
					field: input.field,
					types: input.types,
					difficulty: input.difficulty,
					language: input.language,
					resumeId: input.resumeId,
					jobPosition: input.jobPosition,
					companyName: input.companyName,
					questions: input.questions,
					totalQuestions: input.questions.length,
					status: "pending",
				})
				.returning();

			return session;
		}),

	// Get all sessions for current user
	getSessions: protectedProcedure
		.input(
			z.object({
				status: z.enum(["pending", "in_progress", "completed", "abandoned"]).optional(),
				limit: z.number().min(1).max(100).default(20),
				offset: z.number().min(0).default(0),
			}),
		)
		.handler(async ({ input, context }) => {
			let query = db
				.select()
				.from(interviewSession)
				.where(eq(interviewSession.userId, context.user.id))
				.orderBy(desc(interviewSession.createdAt))
				.limit(input.limit)
				.offset(input.offset);

			if (input.status) {
				query = db
					.select()
					.from(interviewSession)
					.where(and(eq(interviewSession.userId, context.user.id), eq(interviewSession.status, input.status)))
					.orderBy(desc(interviewSession.createdAt))
					.limit(input.limit)
					.offset(input.offset);
			}

			return await query;
		}),

	// Get a single session by ID
	getSession: protectedProcedure.input(z.object({ sessionId: z.string() })).handler(async ({ input, context }) => {
		const [session] = await db
			.select()
			.from(interviewSession)
			.where(and(eq(interviewSession.id, input.sessionId), eq(interviewSession.userId, context.user.id)))
			.limit(1);

		if (!session) {
			throw new ORPCError("NOT_FOUND", { message: "Session not found" });
		}

		// Get analysis if exists
		const [analysis] = await db
			.select()
			.from(interviewAnalysis)
			.where(eq(interviewAnalysis.sessionId, session.id))
			.limit(1);

		return { ...session, analysis: analysis || null };
	}),

	// Start a session
	startSession: protectedProcedure.input(z.object({ sessionId: z.string() })).handler(async ({ input, context }) => {
		const [session] = await db
			.update(interviewSession)
			.set({
				status: "in_progress",
				startedAt: new Date(),
			})
			.where(and(eq(interviewSession.id, input.sessionId), eq(interviewSession.userId, context.user.id)))
			.returning();

		return session;
	}),

	// Submit a response
	submitResponse: protectedProcedure
		.input(
			z.object({
				sessionId: z.string(),
				questionId: z.string(),
				response: z.string(),
				responseTime: z.number().optional(),
			}),
		)
		.handler(async ({ input, context }) => {
			const [session] = await db
				.select()
				.from(interviewSession)
				.where(and(eq(interviewSession.id, input.sessionId), eq(interviewSession.userId, context.user.id)))
				.limit(1);

			if (!session) {
				throw new ORPCError("NOT_FOUND", { message: "Session not found" });
			}

			const responses = session.responses as InterviewResponse[];

			const newResponse: InterviewResponse = {
				questionId: input.questionId,
				response: input.response,
				responseTime: input.responseTime,
				timestamp: new Date().toISOString(),
			};

			// Update responses array
			const updatedResponses = [
				...responses.filter((r: InterviewResponse) => r.questionId !== input.questionId),
				newResponse,
			];

			const [updated] = await db
				.update(interviewSession)
				.set({
					responses: updatedResponses,
					completedQuestions: updatedResponses.length,
				})
				.where(eq(interviewSession.id, input.sessionId))
				.returning();

			return updated;
		}),

	// Save evaluation for a response
	saveEvaluation: protectedProcedure
		.input(
			z.object({
				sessionId: z.string(),
				evaluation: responseEvaluationSchema,
			}),
		)
		.handler(async ({ input, context }) => {
			const [session] = await db
				.select()
				.from(interviewSession)
				.where(and(eq(interviewSession.id, input.sessionId), eq(interviewSession.userId, context.user.id)))
				.limit(1);

			if (!session) {
				throw new ORPCError("NOT_FOUND", { message: "Session not found" });
			}

			const evaluations = session.evaluations as ResponseEvaluation[];

			// Update evaluations array
			const updatedEvaluations = [
				...evaluations.filter((e: ResponseEvaluation) => e.questionId !== input.evaluation.questionId),
				input.evaluation,
			];

			const [updated] = await db
				.update(interviewSession)
				.set({
					evaluations: updatedEvaluations,
				})
				.where(eq(interviewSession.id, input.sessionId))
				.returning();

			return updated;
		}),

	// Delete a session
	deleteSession: protectedProcedure.input(z.object({ sessionId: z.string() })).handler(async ({ input, context }) => {
		await db
			.delete(interviewSession)
			.where(and(eq(interviewSession.id, input.sessionId), eq(interviewSession.userId, context.user.id)));

		return { success: true };
	}),
};
