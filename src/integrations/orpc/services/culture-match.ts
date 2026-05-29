import { eq } from "drizzle-orm";
import { schema } from "@/integrations/drizzle";
import { db } from "@/integrations/drizzle/client";
import type { CultureMatchPersonalProfile } from "@/integrations/drizzle/schema";
import { generateId } from "@/utils/string";

export type UpdateAssessmentInput = {
	userId: string;
	workStyleAnswers?: Record<string, string>;
	valuesScores?: Record<string, number>;
	redFlagsChecked?: string[];
	personalProfile?: CultureMatchPersonalProfile | null;
};

export const cultureMatchService = {
	// Get or create assessment for user
	getOrCreate: async (userId: string) => {
		const [existing] = await db
			.select()
			.from(schema.cultureMatchAssessment)
			.where(eq(schema.cultureMatchAssessment.userId, userId));

		if (existing) {
			return existing;
		}

		// Create new assessment
		const id = generateId();
		const [newAssessment] = await db
			.insert(schema.cultureMatchAssessment)
			.values({
				id,
				userId,
				workStyleAnswers: {},
				valuesScores: {},
				redFlagsChecked: [],
				personalProfile: null,
			})
			.returning();

		return newAssessment;
	},

	// Get assessment by user ID
	get: async (userId: string) => {
		const [assessment] = await db
			.select()
			.from(schema.cultureMatchAssessment)
			.where(eq(schema.cultureMatchAssessment.userId, userId));

		return assessment ?? null;
	},

	// Update assessment
	update: async (input: UpdateAssessmentInput): Promise<void> => {
		const existing = await cultureMatchService.get(input.userId);

		if (!existing) {
			// Create new assessment if it doesn't exist
			const id = generateId();
			await db.insert(schema.cultureMatchAssessment).values({
				id,
				userId: input.userId,
				workStyleAnswers: input.workStyleAnswers ?? {},
				valuesScores: input.valuesScores ?? {},
				redFlagsChecked: input.redFlagsChecked ?? [],
				personalProfile: input.personalProfile ?? null,
				completedAt: input.personalProfile ? new Date() : null,
			});
			return;
		}

		// Update existing assessment
		const updateData: Partial<typeof schema.cultureMatchAssessment.$inferSelect> = {};

		if (input.workStyleAnswers !== undefined) {
			updateData.workStyleAnswers = input.workStyleAnswers;
		}
		if (input.valuesScores !== undefined) {
			updateData.valuesScores = input.valuesScores;
		}
		if (input.redFlagsChecked !== undefined) {
			updateData.redFlagsChecked = input.redFlagsChecked;
		}
		if (input.personalProfile !== undefined) {
			updateData.personalProfile = input.personalProfile;
			if (input.personalProfile) {
				updateData.completedAt = new Date();
			}
		}

		await db
			.update(schema.cultureMatchAssessment)
			.set(updateData)
			.where(eq(schema.cultureMatchAssessment.userId, input.userId));
	},

	// Update work style answer
	updateWorkStyleAnswer: async (userId: string, questionId: string, optionId: string): Promise<void> => {
		const assessment = await cultureMatchService.getOrCreate(userId);

		const workStyleAnswers = { ...(assessment.workStyleAnswers as Record<string, string>), [questionId]: optionId };

		await db
			.update(schema.cultureMatchAssessment)
			.set({ workStyleAnswers })
			.where(eq(schema.cultureMatchAssessment.userId, userId));
	},

	// Update values score
	updateValuesScore: async (userId: string, questionId: string, score: number): Promise<void> => {
		const assessment = await cultureMatchService.getOrCreate(userId);

		const valuesScores = { ...(assessment.valuesScores as Record<string, number>), [questionId]: score };

		await db
			.update(schema.cultureMatchAssessment)
			.set({ valuesScores })
			.where(eq(schema.cultureMatchAssessment.userId, userId));
	},

	// Toggle red flag
	toggleRedFlag: async (userId: string, flagId: string): Promise<string[]> => {
		const assessment = await cultureMatchService.getOrCreate(userId);

		const redFlagsChecked = assessment.redFlagsChecked ?? [];
		let newRedFlags: string[];

		if (redFlagsChecked.includes(flagId)) {
			newRedFlags = redFlagsChecked.filter((id) => id !== flagId);
		} else {
			newRedFlags = [...redFlagsChecked, flagId];
		}

		await db
			.update(schema.cultureMatchAssessment)
			.set({ redFlagsChecked: newRedFlags })
			.where(eq(schema.cultureMatchAssessment.userId, userId));

		return newRedFlags;
	},

	// Save personal profile
	saveProfile: async (userId: string, profile: CultureMatchPersonalProfile): Promise<void> => {
		await cultureMatchService.getOrCreate(userId);

		await db
			.update(schema.cultureMatchAssessment)
			.set({
				personalProfile: profile,
				completedAt: new Date(),
			})
			.where(eq(schema.cultureMatchAssessment.userId, userId));
	},

	// Reset assessment
	reset: async (userId: string): Promise<void> => {
		const existing = await cultureMatchService.get(userId);

		if (existing) {
			await db
				.update(schema.cultureMatchAssessment)
				.set({
					workStyleAnswers: {},
					valuesScores: {},
					redFlagsChecked: [],
					personalProfile: null,
					completedAt: null,
				})
				.where(eq(schema.cultureMatchAssessment.userId, userId));
		}
	},
};
