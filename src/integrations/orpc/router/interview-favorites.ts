import { and, eq } from "drizzle-orm";
import z from "zod";
import { db } from "@/integrations/drizzle/client";
import { interviewTipFavorite, questionBankFavorite } from "@/integrations/drizzle/schema";
import { protectedProcedure } from "../context";

export const interviewFavoriteEndpoints = {
	// Get all favorite tip IDs for the current user
	getTipFavorites: protectedProcedure.handler(async ({ context }) => {
		const favorites = await db
			.select({ tipId: interviewTipFavorite.tipId })
			.from(interviewTipFavorite)
			.where(eq(interviewTipFavorite.userId, context.user.id));

		return favorites.map((f) => f.tipId);
	}),

	// Add a tip to favorites
	addTipFavorite: protectedProcedure.input(z.object({ tipId: z.string() })).handler(async ({ input, context }) => {
		await db
			.insert(interviewTipFavorite)
			.values({
				userId: context.user.id,
				tipId: input.tipId,
			})
			.onConflictDoNothing();

		return { success: true };
	}),

	// Remove a tip from favorites
	removeTipFavorite: protectedProcedure.input(z.object({ tipId: z.string() })).handler(async ({ input, context }) => {
		await db
			.delete(interviewTipFavorite)
			.where(and(eq(interviewTipFavorite.userId, context.user.id), eq(interviewTipFavorite.tipId, input.tipId)));

		return { success: true };
	}),

	// Get all question bank favorite IDs for the current user
	getQuestionBankFavorites: protectedProcedure.handler(async ({ context }) => {
		const favorites = await db
			.select({ questionId: questionBankFavorite.questionId })
			.from(questionBankFavorite)
			.where(eq(questionBankFavorite.userId, context.user.id));

		return favorites.map((f) => f.questionId);
	}),

	// Add a question to favorites
	addQuestionBankFavorite: protectedProcedure
		.input(z.object({ questionId: z.string() }))
		.handler(async ({ input, context }) => {
			await db
				.insert(questionBankFavorite)
				.values({
					userId: context.user.id,
					questionId: input.questionId,
				})
				.onConflictDoNothing();

			return { success: true };
		}),

	// Remove a question from favorites
	removeQuestionBankFavorite: protectedProcedure
		.input(z.object({ questionId: z.string() }))
		.handler(async ({ input, context }) => {
			await db
				.delete(questionBankFavorite)
				.where(
					and(eq(questionBankFavorite.userId, context.user.id), eq(questionBankFavorite.questionId, input.questionId)),
				);

			return { success: true };
		}),
};
