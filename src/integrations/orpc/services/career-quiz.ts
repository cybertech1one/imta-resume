import { and, asc, desc, eq } from "drizzle-orm";
import { schema } from "@/integrations/drizzle";
import { db } from "@/integrations/drizzle/client";
import { generateId } from "@/utils/string";

// Type exports
export type CareerQuizQuestion = typeof schema.careerQuizQuestion.$inferSelect;
export type CareerQuizOption = typeof schema.careerQuizOption.$inferSelect;
export type UserQuizResult = typeof schema.userQuizResult.$inferSelect;

export type QuizType = "career_assessment" | "career_quiz" | "remote_readiness";
export type QuestionType = "multiple_choice" | "scale";

export interface QuestionWithOptions extends CareerQuizQuestion {
	options: CareerQuizOption[];
}

// Input types for create/update operations
export interface QuestionInput {
	id?: string;
	quizType?: QuizType;
	question: string;
	questionFr?: string | null;
	description?: string | null;
	descriptionFr?: string | null;
	category: string;
	type?: QuestionType;
	trait?: string | null;
	scaleMin?: string | null;
	scaleMax?: string | null;
	scaleMinFr?: string | null;
	scaleMaxFr?: string | null;
	isActive?: boolean;
	sortOrder?: number;
}

export interface OptionInput {
	id?: string;
	questionId: string;
	text: string;
	textFr?: string | null;
	icon?: string | null;
	scores?: Record<string, number> | unknown;
	sortOrder?: number;
}

export interface ResultInput {
	userId: string;
	quizType: QuizType;
	answers: unknown;
	personalityProfile: Record<string, number>;
	topMatches: unknown[];
}

export const careerQuizService = {
	// ============================================================================
	// Questions
	// ============================================================================

	questions: {
		list: async (options?: { quizType?: QuizType; category?: string; activeOnly?: boolean }) => {
			const conditions = [];
			if (options?.activeOnly !== false) {
				conditions.push(eq(schema.careerQuizQuestion.isActive, true));
			}
			if (options?.quizType) {
				conditions.push(eq(schema.careerQuizQuestion.quizType, options.quizType));
			}
			if (options?.category) {
				conditions.push(eq(schema.careerQuizQuestion.category, options.category));
			}

			return db
				.select()
				.from(schema.careerQuizQuestion)
				.where(conditions.length > 0 ? and(...conditions) : undefined)
				.orderBy(asc(schema.careerQuizQuestion.sortOrder), asc(schema.careerQuizQuestion.id));
		},

		listWithOptions: async (options?: {
			quizType?: QuizType;
			activeOnly?: boolean;
		}): Promise<QuestionWithOptions[]> => {
			const questions = await careerQuizService.questions.list(options);

			// Fetch all options for these questions
			const questionIds = questions.map((q) => q.id);
			if (questionIds.length === 0) return [];

			const allOptions = await db
				.select()
				.from(schema.careerQuizOption)
				.orderBy(asc(schema.careerQuizOption.questionId), asc(schema.careerQuizOption.sortOrder));

			// Group options by question
			const optionsByQuestion = new Map<string, CareerQuizOption[]>();
			for (const option of allOptions) {
				if (questionIds.includes(option.questionId)) {
					const existing = optionsByQuestion.get(option.questionId) || [];
					existing.push(option);
					optionsByQuestion.set(option.questionId, existing);
				}
			}

			return questions.map((q) => ({
				...q,
				options: optionsByQuestion.get(q.id) || [],
			}));
		},

		getById: async (id: string) => {
			const [question] = await db.select().from(schema.careerQuizQuestion).where(eq(schema.careerQuizQuestion.id, id));
			return question;
		},

		getByIdWithOptions: async (id: string): Promise<QuestionWithOptions | null> => {
			const question = await careerQuizService.questions.getById(id);
			if (!question) return null;

			const options = await db
				.select()
				.from(schema.careerQuizOption)
				.where(eq(schema.careerQuizOption.questionId, id))
				.orderBy(asc(schema.careerQuizOption.sortOrder));

			return { ...question, options };
		},

		create: async (data: QuestionInput) => {
			const [question] = await db
				.insert(schema.careerQuizQuestion)
				.values({
					id: data.id || generateId(),
					quizType: data.quizType || "career_assessment",
					question: data.question,
					questionFr: data.questionFr,
					description: data.description,
					descriptionFr: data.descriptionFr,
					category: data.category,
					type: data.type || "multiple_choice",
					trait: data.trait,
					scaleMin: data.scaleMin,
					scaleMax: data.scaleMax,
					scaleMinFr: data.scaleMinFr,
					scaleMaxFr: data.scaleMaxFr,
					isActive: data.isActive ?? true,
					sortOrder: data.sortOrder ?? 0,
				})
				.returning();
			return question;
		},

		update: async (id: string, data: Partial<QuestionInput>) => {
			const [question] = await db
				.update(schema.careerQuizQuestion)
				.set({ ...data, updatedAt: new Date() })
				.where(eq(schema.careerQuizQuestion.id, id))
				.returning();
			return question;
		},

		delete: async (id: string) => {
			await db.delete(schema.careerQuizQuestion).where(eq(schema.careerQuizQuestion.id, id));
		},

		getCategories: async (quizType?: QuizType) => {
			const conditions = [];
			if (quizType) {
				conditions.push(eq(schema.careerQuizQuestion.quizType, quizType));
			}
			conditions.push(eq(schema.careerQuizQuestion.isActive, true));

			const questions = await db
				.select({ category: schema.careerQuizQuestion.category })
				.from(schema.careerQuizQuestion)
				.where(and(...conditions));

			return [...new Set(questions.map((q) => q.category))].sort();
		},
	},

	// ============================================================================
	// Options
	// ============================================================================

	options: {
		listByQuestion: async (questionId: string) => {
			return db
				.select()
				.from(schema.careerQuizOption)
				.where(eq(schema.careerQuizOption.questionId, questionId))
				.orderBy(asc(schema.careerQuizOption.sortOrder));
		},

		create: async (data: OptionInput) => {
			const [option] = await db
				.insert(schema.careerQuizOption)
				.values({
					id: data.id || generateId(),
					questionId: data.questionId,
					text: data.text,
					textFr: data.textFr,
					icon: data.icon,
					scores: data.scores,
					sortOrder: data.sortOrder ?? 0,
				})
				.returning();
			return option;
		},

		update: async (id: string, data: Partial<Omit<OptionInput, "questionId">>) => {
			const [option] = await db
				.update(schema.careerQuizOption)
				.set(data)
				.where(eq(schema.careerQuizOption.id, id))
				.returning();
			return option;
		},

		delete: async (id: string) => {
			await db.delete(schema.careerQuizOption).where(eq(schema.careerQuizOption.id, id));
		},
	},

	// ============================================================================
	// User Results
	// ============================================================================

	results: {
		list: async (userId: string, quizType?: QuizType) => {
			const conditions = [eq(schema.userQuizResult.userId, userId)];
			if (quizType) {
				conditions.push(eq(schema.userQuizResult.quizType, quizType));
			}

			return db
				.select()
				.from(schema.userQuizResult)
				.where(and(...conditions))
				.orderBy(asc(schema.userQuizResult.completedAt));
		},

		getLatest: async (userId: string, quizType: QuizType) => {
			const [result] = await db
				.select()
				.from(schema.userQuizResult)
				.where(and(eq(schema.userQuizResult.userId, userId), eq(schema.userQuizResult.quizType, quizType)))
				// Order DESC so "latest" returns the most recent result, not the oldest.
				.orderBy(desc(schema.userQuizResult.completedAt))
				.limit(1);
			return result;
		},

		create: async (data: ResultInput) => {
			const [result] = await db
				.insert(schema.userQuizResult)
				.values({
					id: generateId(),
					userId: data.userId,
					quizType: data.quizType,
					answers: data.answers,
					personalityProfile: data.personalityProfile,
					topMatches: data.topMatches,
				})
				.returning();
			return result;
		},

		delete: async (id: string, userId: string) => {
			await db
				.delete(schema.userQuizResult)
				.where(and(eq(schema.userQuizResult.id, id), eq(schema.userQuizResult.userId, userId)));
		},
	},

	// ============================================================================
	// Bulk Operations (for admin seeding)
	// ============================================================================

	bulkSeed: {
		questions: async (questions: QuestionInput[]) => {
			if (questions.length === 0) return [];
			const values = questions.map((q) => ({
				id: q.id || generateId(),
				quizType: q.quizType || "career_assessment",
				question: q.question,
				questionFr: q.questionFr,
				description: q.description,
				descriptionFr: q.descriptionFr,
				category: q.category,
				type: q.type || "multiple_choice",
				trait: q.trait,
				scaleMin: q.scaleMin,
				scaleMax: q.scaleMax,
				scaleMinFr: q.scaleMinFr,
				scaleMaxFr: q.scaleMaxFr,
				isActive: q.isActive ?? true,
				sortOrder: q.sortOrder ?? 0,
			}));
			return db.insert(schema.careerQuizQuestion).values(values).onConflictDoNothing().returning();
		},

		options: async (options: OptionInput[]) => {
			if (options.length === 0) return [];
			const values = options.map((o) => ({
				id: o.id || generateId(),
				questionId: o.questionId,
				text: o.text,
				textFr: o.textFr,
				icon: o.icon,
				scores: o.scores,
				sortOrder: o.sortOrder ?? 0,
			}));
			return db.insert(schema.careerQuizOption).values(values).onConflictDoNothing().returning();
		},
	},
};
