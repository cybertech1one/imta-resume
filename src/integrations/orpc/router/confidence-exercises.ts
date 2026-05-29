import z from "zod";
import { protectedProcedure } from "../context";
import { confidenceExercisesService } from "../services/confidence-exercises";

// Zod schemas
const exerciseCategorySchema = z.enum([
	"breathing",
	"affirmations",
	"power_poses",
	"visualization",
	"anxiety_management",
]);

const categoryProgressSchema = z.object({
	breathing: z.number(),
	affirmations: z.number(),
	power_poses: z.number(),
	visualization: z.number(),
	anxiety_management: z.number(),
});

const exerciseStatsSchema = z.object({
	totalCompleted: z.number(),
	streak: z.number(),
	lastCompletedDate: z.string().nullable(),
	categoryProgress: categoryProgressSchema,
});

const dailyRoutineItemSchema = z.object({
	id: z.string().uuid(),
	exerciseId: z.string(),
	scheduledTime: z.string().nullable(),
	order: z.number(),
	completed: z.boolean(),
});

export const confidenceExercisesRouter = {
	// Get user's exercise statistics
	getStats: protectedProcedure
		.route({
			method: "GET",
			path: "/confidence-exercises/stats",
			tags: ["Confidence Exercises"],
			summary: "Get exercise statistics",
			description:
				"Get user's confidence exercise statistics including total completed, streak, and category progress.",
		})
		.output(exerciseStatsSchema)
		.handler(async ({ context }) => {
			return await confidenceExercisesService.getOrCreateStats(context.user.id);
		}),

	// Get exercises completed today
	getCompletedToday: protectedProcedure
		.route({
			method: "GET",
			path: "/confidence-exercises/completed-today",
			tags: ["Confidence Exercises"],
			summary: "Get completed exercises today",
			description: "Get list of exercise IDs completed today.",
		})
		.output(z.array(z.string()))
		.handler(async ({ context }) => {
			return await confidenceExercisesService.getCompletedToday(context.user.id);
		}),

	// Complete an exercise
	completeExercise: protectedProcedure
		.route({
			method: "POST",
			path: "/confidence-exercises/complete",
			tags: ["Confidence Exercises"],
			summary: "Complete an exercise",
			description: "Mark an exercise as completed and update statistics.",
		})
		.input(
			z.object({
				exerciseId: z.string().min(1),
				category: exerciseCategorySchema,
			}),
		)
		.output(exerciseStatsSchema)
		.handler(async ({ context, input }) => {
			return await confidenceExercisesService.completeExercise(context.user.id, input.exerciseId, input.category);
		}),

	// Get daily routine
	getDailyRoutine: protectedProcedure
		.route({
			method: "GET",
			path: "/confidence-exercises/routine",
			tags: ["Confidence Exercises"],
			summary: "Get daily routine",
			description: "Get user's daily exercise routine with completion status.",
		})
		.output(z.array(dailyRoutineItemSchema))
		.handler(async ({ context }) => {
			return await confidenceExercisesService.getDailyRoutine(context.user.id);
		}),

	// Add exercise to routine
	addToRoutine: protectedProcedure
		.route({
			method: "POST",
			path: "/confidence-exercises/routine",
			tags: ["Confidence Exercises"],
			summary: "Add to routine",
			description: "Add an exercise to the daily routine.",
		})
		.input(
			z.object({
				exerciseId: z.string().min(1),
				scheduledTime: z.string().optional(),
			}),
		)
		.output(dailyRoutineItemSchema)
		.handler(async ({ context, input }) => {
			return await confidenceExercisesService.addToRoutine(context.user.id, input.exerciseId, input.scheduledTime);
		}),

	// Remove exercise from routine
	removeFromRoutine: protectedProcedure
		.route({
			method: "DELETE",
			path: "/confidence-exercises/routine/{exerciseId}",
			tags: ["Confidence Exercises"],
			summary: "Remove from routine",
			description: "Remove an exercise from the daily routine.",
		})
		.input(z.object({ exerciseId: z.string() }))
		.output(z.object({ success: z.boolean() }))
		.handler(async ({ context, input }) => {
			await confidenceExercisesService.removeFromRoutine(context.user.id, input.exerciseId);
			return { success: true };
		}),

	// Clear entire routine
	clearRoutine: protectedProcedure
		.route({
			method: "DELETE",
			path: "/confidence-exercises/routine",
			tags: ["Confidence Exercises"],
			summary: "Clear routine",
			description: "Clear all exercises from the daily routine.",
		})
		.output(z.object({ success: z.boolean() }))
		.handler(async ({ context }) => {
			await confidenceExercisesService.clearRoutine(context.user.id);
			return { success: true };
		}),

	// Check if exercise is completed today
	isCompletedToday: protectedProcedure
		.route({
			method: "GET",
			path: "/confidence-exercises/is-completed/{exerciseId}",
			tags: ["Confidence Exercises"],
			summary: "Check if completed today",
			description: "Check if a specific exercise has been completed today.",
		})
		.input(z.object({ exerciseId: z.string() }))
		.output(z.object({ completed: z.boolean() }))
		.handler(async ({ context, input }) => {
			const completed = await confidenceExercisesService.isCompletedToday(context.user.id, input.exerciseId);
			return { completed };
		}),
};
