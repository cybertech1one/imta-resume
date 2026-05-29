import { and, desc, eq } from "drizzle-orm";
import { db } from "@/integrations/drizzle/client";
import {
	type AssessmentStatus,
	type CareerAssessmentAnswer,
	type CareerAssessmentMatch,
	type CareerPersonalityProfile,
	careerAssessment,
} from "@/integrations/drizzle/schema";

// Re-export types for use in router
export type { AssessmentStatus, CareerAssessmentAnswer, CareerAssessmentMatch, CareerPersonalityProfile };

export type CareerAssessmentRow = typeof careerAssessment.$inferSelect;

type GetAssessmentInput = {
	userId: string;
};

type SaveProgressInput = {
	userId: string;
	currentQuestion: number;
	answers: CareerAssessmentAnswer[];
};

type CompleteAssessmentInput = {
	userId: string;
	answers: CareerAssessmentAnswer[];
	personalityProfile: CareerPersonalityProfile;
	careerMatches: CareerAssessmentMatch[];
};

type ResetAssessmentInput = {
	userId: string;
};

export const careerAssessmentService = {
	/**
	 * Get the current assessment for a user (most recent one)
	 */
	async get(input: GetAssessmentInput): Promise<CareerAssessmentRow | null> {
		const result = await db
			.select()
			.from(careerAssessment)
			.where(eq(careerAssessment.userId, input.userId))
			.orderBy(desc(careerAssessment.updatedAt))
			.limit(1);

		return result[0] ?? null;
	},

	/**
	 * Get a completed assessment for a user
	 */
	async getCompleted(input: GetAssessmentInput): Promise<CareerAssessmentRow | null> {
		const result = await db
			.select()
			.from(careerAssessment)
			.where(and(eq(careerAssessment.userId, input.userId), eq(careerAssessment.status, "completed")))
			.orderBy(desc(careerAssessment.completedAt))
			.limit(1);

		return result[0] ?? null;
	},

	/**
	 * Save progress on an assessment (creates new if none exists)
	 */
	async saveProgress(input: SaveProgressInput): Promise<CareerAssessmentRow> {
		// Check for existing in-progress assessment
		const existing = await db
			.select()
			.from(careerAssessment)
			.where(and(eq(careerAssessment.userId, input.userId), eq(careerAssessment.status, "in_progress")))
			.orderBy(desc(careerAssessment.updatedAt))
			.limit(1);

		if (existing[0]) {
			// Update existing
			const updated = await db
				.update(careerAssessment)
				.set({
					currentQuestion: input.currentQuestion,
					answers: input.answers,
				})
				.where(eq(careerAssessment.id, existing[0].id))
				.returning();

			return updated[0];
		}

		// Create new assessment
		const created = await db
			.insert(careerAssessment)
			.values({
				userId: input.userId,
				currentQuestion: input.currentQuestion,
				answers: input.answers,
				status: "in_progress",
			})
			.returning();

		return created[0];
	},

	/**
	 * Complete an assessment with results
	 */
	async complete(input: CompleteAssessmentInput): Promise<CareerAssessmentRow> {
		// Check for existing in-progress assessment
		const existing = await db
			.select()
			.from(careerAssessment)
			.where(and(eq(careerAssessment.userId, input.userId), eq(careerAssessment.status, "in_progress")))
			.orderBy(desc(careerAssessment.updatedAt))
			.limit(1);

		if (existing[0]) {
			// Update existing to completed
			const updated = await db
				.update(careerAssessment)
				.set({
					status: "completed",
					answers: input.answers,
					personalityProfile: input.personalityProfile,
					careerMatches: input.careerMatches,
					completedAt: new Date(),
				})
				.where(eq(careerAssessment.id, existing[0].id))
				.returning();

			return updated[0];
		}

		// Create new completed assessment
		const created = await db
			.insert(careerAssessment)
			.values({
				userId: input.userId,
				status: "completed",
				currentQuestion: 17, // Last question index
				answers: input.answers,
				personalityProfile: input.personalityProfile,
				careerMatches: input.careerMatches,
				completedAt: new Date(),
			})
			.returning();

		return created[0];
	},

	/**
	 * Reset/delete an assessment for a user
	 */
	async reset(input: ResetAssessmentInput): Promise<void> {
		await db.delete(careerAssessment).where(eq(careerAssessment.userId, input.userId));
	},

	/**
	 * List all assessments for a user
	 */
	async list(input: GetAssessmentInput): Promise<CareerAssessmentRow[]> {
		return await db
			.select()
			.from(careerAssessment)
			.where(eq(careerAssessment.userId, input.userId))
			.orderBy(desc(careerAssessment.updatedAt));
	},
};
