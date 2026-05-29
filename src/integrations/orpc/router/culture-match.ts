import z from "zod";
import { protectedProcedure } from "../context";
import { cultureMatchService } from "../services/culture-match";

const personalProfileSchema = z.object({
	workLifeBalance: z.number().min(0).max(100),
	innovation: z.number().min(0).max(100),
	collaboration: z.number().min(0).max(100),
	growth: z.number().min(0).max(100),
	diversity: z.number().min(0).max(100),
	transparency: z.number().min(0).max(100),
});

const assessmentSchema = z.object({
	id: z.string().uuid(),
	userId: z.string(),
	workStyleAnswers: z.record(z.string(), z.string()),
	valuesScores: z.record(z.string(), z.number()),
	redFlagsChecked: z.array(z.string()),
	personalProfile: personalProfileSchema.nullable(),
	completedAt: z.coerce.date().nullable(),
	createdAt: z.coerce.date(),
	updatedAt: z.coerce.date(),
});

export const cultureMatchRouter = {
	// Get assessment for current user
	get: protectedProcedure
		.route({
			method: "GET",
			path: "/culture-match",
			tags: ["Culture Match"],
			summary: "Get user's culture match assessment",
		})
		.output(assessmentSchema.nullable())
		.handler(async ({ context }) => {
			const assessment = await cultureMatchService.get(context.user.id);
			return assessment;
		}),

	// Get or create assessment
	getOrCreate: protectedProcedure
		.route({
			method: "POST",
			path: "/culture-match/init",
			tags: ["Culture Match"],
			summary: "Get or create culture match assessment",
		})
		.output(assessmentSchema)
		.handler(async ({ context }) => {
			return await cultureMatchService.getOrCreate(context.user.id);
		}),

	// Update work style answer
	updateWorkStyleAnswer: protectedProcedure
		.route({
			method: "POST",
			path: "/culture-match/work-style",
			tags: ["Culture Match"],
			summary: "Update work style answer",
		})
		.input(
			z.object({
				questionId: z.string(),
				optionId: z.string(),
			}),
		)
		.output(z.void())
		.handler(async ({ context, input }) => {
			await cultureMatchService.updateWorkStyleAnswer(context.user.id, input.questionId, input.optionId);
		}),

	// Update values score
	updateValuesScore: protectedProcedure
		.route({
			method: "POST",
			path: "/culture-match/values",
			tags: ["Culture Match"],
			summary: "Update values score",
		})
		.input(
			z.object({
				questionId: z.string(),
				score: z.number().min(1).max(5),
			}),
		)
		.output(z.void())
		.handler(async ({ context, input }) => {
			await cultureMatchService.updateValuesScore(context.user.id, input.questionId, input.score);
		}),

	// Toggle red flag
	toggleRedFlag: protectedProcedure
		.route({
			method: "POST",
			path: "/culture-match/red-flags/toggle",
			tags: ["Culture Match"],
			summary: "Toggle red flag checked state",
		})
		.input(
			z.object({
				flagId: z.string(),
			}),
		)
		.output(z.array(z.string()))
		.handler(async ({ context, input }) => {
			return await cultureMatchService.toggleRedFlag(context.user.id, input.flagId);
		}),

	// Save personal profile
	saveProfile: protectedProcedure
		.route({
			method: "POST",
			path: "/culture-match/profile",
			tags: ["Culture Match"],
			summary: "Save personal culture profile",
		})
		.input(personalProfileSchema)
		.output(z.void())
		.handler(async ({ context, input }) => {
			await cultureMatchService.saveProfile(context.user.id, input);
		}),

	// Reset assessment
	reset: protectedProcedure
		.route({
			method: "POST",
			path: "/culture-match/reset",
			tags: ["Culture Match"],
			summary: "Reset culture match assessment",
		})
		.output(z.void())
		.handler(async ({ context }) => {
			await cultureMatchService.reset(context.user.id);
		}),
};
