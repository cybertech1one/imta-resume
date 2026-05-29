import { ORPCError } from "@orpc/server";
import { and, count, desc, eq } from "drizzle-orm";
import z from "zod";
import { db } from "@/integrations/drizzle/client";
import {
	type TrainingCategory,
	type TrainingInterestStatus,
	userTrainingInterests,
} from "@/integrations/drizzle/schema";
import { protectedProcedure } from "../context";

// Zod schemas for validation
const trainingProgramTypeSchema = z.enum([
	"imta_program",
	"external_course",
	"certification",
	"bootcamp",
	"self_learning",
]);

const trainingCategorySchema = z.enum(["healthcare", "industrial", "hse", "technology", "business", "other"]);

const trainingInterestStatusSchema = z.enum(["interested", "in_progress", "completed"]);

// Output schema for training interest with program details
const trainingInterestOutputSchema = z.object({
	id: z.string().uuid(),
	userId: z.string(),
	programId: z.string(),
	programName: z.string(),
	programType: trainingProgramTypeSchema,
	category: trainingCategorySchema,
	status: trainingInterestStatusSchema,
	startDate: z.coerce.date().nullable(),
	completionDate: z.coerce.date().nullable(),
	notes: z.string().nullable(),
	createdAt: z.coerce.date(),
	updatedAt: z.coerce.date(),
});

// Output schema for training statistics
const trainingStatsOutputSchema = z.object({
	totalInterests: z.number(),
	inProgressCount: z.number(),
	completedCount: z.number(),
	interestedCount: z.number(),
	byCategory: z.array(
		z.object({
			category: trainingCategorySchema,
			count: z.number(),
		}),
	),
});

export const trainingRouter = {
	// Get all training interests for current user
	getMyTrainingInterests: protectedProcedure
		.route({
			method: "GET",
			path: "/training/interests",
			tags: ["Training"],
			summary: "Get user training interests",
			description: "Get all training interests for the authenticated user with optional filtering.",
		})
		.input(
			z
				.object({
					status: trainingInterestStatusSchema.optional(),
					category: trainingCategorySchema.optional(),
				})
				.optional()
				.default({}),
		)
		.output(z.array(trainingInterestOutputSchema))
		.handler(async ({ context, input }) => {
			const conditions = [eq(userTrainingInterests.userId, context.user.id)];

			if (input.status) {
				conditions.push(eq(userTrainingInterests.status, input.status));
			}

			if (input.category) {
				conditions.push(eq(userTrainingInterests.category, input.category));
			}

			const interests = await db
				.select()
				.from(userTrainingInterests)
				.where(and(...conditions))
				.orderBy(desc(userTrainingInterests.createdAt));

			return interests;
		}),

	// Add a new training interest
	addTrainingInterest: protectedProcedure
		.route({
			method: "POST",
			path: "/training/interests",
			tags: ["Training"],
			summary: "Add training interest",
			description: "Add a new training interest for the authenticated user.",
		})
		.input(
			z.object({
				programId: z.string().min(1),
				programName: z.string().min(1),
				programType: trainingProgramTypeSchema,
				category: trainingCategorySchema,
				notes: z.string().optional(),
			}),
		)
		.output(trainingInterestOutputSchema)
		.handler(async ({ context, input }) => {
			// Check if user already has this program in their interests
			const [existing] = await db
				.select()
				.from(userTrainingInterests)
				.where(
					and(eq(userTrainingInterests.userId, context.user.id), eq(userTrainingInterests.programId, input.programId)),
				)
				.limit(1);

			if (existing) {
				throw new ORPCError("BAD_REQUEST", {
					message: "You have already added this program to your training interests.",
				});
			}

			const [created] = await db
				.insert(userTrainingInterests)
				.values({
					userId: context.user.id,
					programId: input.programId,
					programName: input.programName,
					programType: input.programType,
					category: input.category,
					notes: input.notes,
					status: "interested",
				})
				.returning();

			return created;
		}),

	// Update an existing training interest
	updateTrainingInterest: protectedProcedure
		.route({
			method: "PUT",
			path: "/training/interests/{id}",
			tags: ["Training"],
			summary: "Update training interest",
			description: "Update an existing training interest for the authenticated user.",
		})
		.input(
			z.object({
				id: z.string().uuid(),
				status: trainingInterestStatusSchema.optional(),
				notes: z.string().optional(),
				startDate: z.coerce.date().nullable().optional(),
				completionDate: z.coerce.date().nullable().optional(),
			}),
		)
		.output(trainingInterestOutputSchema)
		.handler(async ({ context, input }) => {
			// Verify ownership
			const [existing] = await db
				.select()
				.from(userTrainingInterests)
				.where(and(eq(userTrainingInterests.id, input.id), eq(userTrainingInterests.userId, context.user.id)))
				.limit(1);

			if (!existing) {
				throw new ORPCError("NOT_FOUND", {
					message: "Training interest not found.",
				});
			}

			// Build update object with only provided fields
			const updateData: Partial<{
				status: TrainingInterestStatus;
				notes: string | null;
				startDate: Date | null;
				completionDate: Date | null;
			}> = {};

			if (input.status !== undefined) {
				updateData.status = input.status;
			}

			if (input.notes !== undefined) {
				updateData.notes = input.notes;
			}

			if (input.startDate !== undefined) {
				updateData.startDate = input.startDate;
			}

			if (input.completionDate !== undefined) {
				updateData.completionDate = input.completionDate;
			}

			// If status is changing to in_progress and no startDate provided, set it now
			if (input.status === "in_progress" && !existing.startDate && input.startDate === undefined) {
				updateData.startDate = new Date();
			}

			// If status is changing to completed and no completionDate provided, set it now
			if (input.status === "completed" && !existing.completionDate && input.completionDate === undefined) {
				updateData.completionDate = new Date();
			}

			const [updated] = await db
				.update(userTrainingInterests)
				.set(updateData)
				.where(eq(userTrainingInterests.id, input.id))
				.returning();

			return updated;
		}),

	// Delete a training interest
	deleteTrainingInterest: protectedProcedure
		.route({
			method: "DELETE",
			path: "/training/interests/{id}",
			tags: ["Training"],
			summary: "Delete training interest",
			description: "Remove a training interest from the authenticated user's list.",
		})
		.input(z.object({ id: z.string().uuid() }))
		.output(z.object({ success: z.boolean() }))
		.handler(async ({ context, input }) => {
			// Verify ownership before deletion
			const [existing] = await db
				.select()
				.from(userTrainingInterests)
				.where(and(eq(userTrainingInterests.id, input.id), eq(userTrainingInterests.userId, context.user.id)))
				.limit(1);

			if (!existing) {
				throw new ORPCError("NOT_FOUND", {
					message: "Training interest not found.",
				});
			}

			await db
				.delete(userTrainingInterests)
				.where(and(eq(userTrainingInterests.id, input.id), eq(userTrainingInterests.userId, context.user.id)));

			return { success: true };
		}),

	// Get user's training statistics
	getTrainingStats: protectedProcedure
		.route({
			method: "GET",
			path: "/training/stats",
			tags: ["Training"],
			summary: "Get training statistics",
			description: "Get training statistics for the authenticated user including totals and breakdown by category.",
		})
		.output(trainingStatsOutputSchema)
		.handler(async ({ context }) => {
			// Get counts by status
			const statusCounts = await db
				.select({
					status: userTrainingInterests.status,
					count: count(),
				})
				.from(userTrainingInterests)
				.where(eq(userTrainingInterests.userId, context.user.id))
				.groupBy(userTrainingInterests.status);

			// Get counts by category
			const categoryCounts = await db
				.select({
					category: userTrainingInterests.category,
					count: count(),
				})
				.from(userTrainingInterests)
				.where(eq(userTrainingInterests.userId, context.user.id))
				.groupBy(userTrainingInterests.category);

			// Parse status counts
			const statusMap: Record<string, number> = {};
			for (const row of statusCounts) {
				statusMap[row.status] = row.count;
			}

			const interestedCount = statusMap.interested ?? 0;
			const inProgressCount = statusMap.in_progress ?? 0;
			const completedCount = statusMap.completed ?? 0;
			const totalInterests = interestedCount + inProgressCount + completedCount;

			// Format category breakdown
			const byCategory = categoryCounts.map((row) => ({
				category: row.category as TrainingCategory,
				count: row.count,
			}));

			return {
				totalInterests,
				inProgressCount,
				completedCount,
				interestedCount,
				byCategory,
			};
		}),
};
