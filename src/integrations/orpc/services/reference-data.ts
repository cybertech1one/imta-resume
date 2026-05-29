import { and, asc, desc, eq, sql } from "drizzle-orm";
import { schema } from "@/integrations/drizzle";
import { db } from "@/integrations/drizzle/client";

// Type exports for use in routers
export type ImtaProgram = typeof schema.imtaProgram.$inferSelect;
export type InterviewTip = typeof schema.interviewTip.$inferSelect;
export type InterviewCommonQuestion = typeof schema.interviewCommonQuestion.$inferSelect;
export type CareerMarketInsight = typeof schema.careerMarketInsight.$inferSelect;
export type CareerEmployer = typeof schema.careerEmployer.$inferSelect;
export type SkillLibraryItem = typeof schema.skillLibrary.$inferSelect;

export const referenceDataService = {
	// ============================================================================
	// IMTA Programs
	// ============================================================================

	imtaPrograms: {
		list: async (options?: { field?: string; activeOnly?: boolean }) => {
			const conditions = [];
			if (options?.activeOnly !== false) {
				conditions.push(eq(schema.imtaProgram.isActive, true));
			}
			if (options?.field) {
				conditions.push(eq(schema.imtaProgram.field, options.field));
			}

			return db
				.select()
				.from(schema.imtaProgram)
				.where(conditions.length > 0 ? and(...conditions) : undefined)
				.orderBy(asc(schema.imtaProgram.sortOrder), asc(schema.imtaProgram.name));
		},

		getById: async (id: string) => {
			const [program] = await db.select().from(schema.imtaProgram).where(eq(schema.imtaProgram.id, id));
			return program;
		},

		create: async (data: Omit<typeof schema.imtaProgram.$inferInsert, "createdAt" | "updatedAt">) => {
			const [program] = await db.insert(schema.imtaProgram).values(data).returning();
			return program;
		},

		update: async (id: string, data: Partial<Omit<typeof schema.imtaProgram.$inferInsert, "id" | "createdAt">>) => {
			const [program] = await db
				.update(schema.imtaProgram)
				.set({ ...data, updatedAt: new Date() })
				.where(eq(schema.imtaProgram.id, id))
				.returning();
			return program;
		},

		delete: async (id: string) => {
			await db.delete(schema.imtaProgram).where(eq(schema.imtaProgram.id, id));
		},
	},

	// ============================================================================
	// Interview Tips
	// ============================================================================

	interviewTips: {
		list: async (options?: { category?: string; field?: string; activeOnly?: boolean }) => {
			const conditions = [];
			if (options?.activeOnly !== false) {
				conditions.push(eq(schema.interviewTip.isActive, true));
			}
			if (options?.category) {
				conditions.push(eq(schema.interviewTip.category, options.category));
			}
			if (options?.field) {
				conditions.push(eq(schema.interviewTip.field, options.field));
			}

			return db
				.select()
				.from(schema.interviewTip)
				.where(conditions.length > 0 ? and(...conditions) : undefined)
				.orderBy(asc(schema.interviewTip.sortOrder), asc(schema.interviewTip.title));
		},

		getById: async (id: string) => {
			const [tip] = await db.select().from(schema.interviewTip).where(eq(schema.interviewTip.id, id));
			return tip;
		},

		create: async (data: Omit<typeof schema.interviewTip.$inferInsert, "createdAt" | "updatedAt">) => {
			const [tip] = await db.insert(schema.interviewTip).values(data).returning();
			return tip;
		},

		update: async (id: string, data: Partial<Omit<typeof schema.interviewTip.$inferInsert, "id" | "createdAt">>) => {
			const [tip] = await db
				.update(schema.interviewTip)
				.set({ ...data, updatedAt: new Date() })
				.where(eq(schema.interviewTip.id, id))
				.returning();
			return tip;
		},

		delete: async (id: string) => {
			await db.delete(schema.interviewTip).where(eq(schema.interviewTip.id, id));
		},

		getCategories: async () => {
			const result = await db
				.selectDistinct({ category: schema.interviewTip.category })
				.from(schema.interviewTip)
				.where(eq(schema.interviewTip.isActive, true));
			return result.map((r: { category: string }) => r.category);
		},
	},

	// ============================================================================
	// Interview Common Questions
	// ============================================================================

	interviewQuestions: {
		list: async (options?: { type?: string; field?: string; difficulty?: string; activeOnly?: boolean }) => {
			const conditions = [];
			if (options?.activeOnly !== false) {
				conditions.push(eq(schema.interviewCommonQuestion.isActive, true));
			}
			if (options?.type) {
				conditions.push(eq(schema.interviewCommonQuestion.type, options.type));
			}
			if (options?.field) {
				conditions.push(eq(schema.interviewCommonQuestion.field, options.field));
			}
			if (options?.difficulty) {
				conditions.push(eq(schema.interviewCommonQuestion.difficulty, options.difficulty));
			}

			return db
				.select()
				.from(schema.interviewCommonQuestion)
				.where(conditions.length > 0 ? and(...conditions) : undefined)
				.orderBy(asc(schema.interviewCommonQuestion.sortOrder), asc(schema.interviewCommonQuestion.question));
		},

		getById: async (id: string) => {
			const [question] = await db
				.select()
				.from(schema.interviewCommonQuestion)
				.where(eq(schema.interviewCommonQuestion.id, id));
			return question;
		},

		create: async (data: Omit<typeof schema.interviewCommonQuestion.$inferInsert, "createdAt" | "updatedAt">) => {
			const [question] = await db.insert(schema.interviewCommonQuestion).values(data).returning();
			return question;
		},

		update: async (
			id: string,
			data: Partial<Omit<typeof schema.interviewCommonQuestion.$inferInsert, "id" | "createdAt">>,
		) => {
			const [question] = await db
				.update(schema.interviewCommonQuestion)
				.set({ ...data, updatedAt: new Date() })
				.where(eq(schema.interviewCommonQuestion.id, id))
				.returning();
			return question;
		},

		delete: async (id: string) => {
			await db.delete(schema.interviewCommonQuestion).where(eq(schema.interviewCommonQuestion.id, id));
		},

		getTypes: async () => {
			const result = await db
				.selectDistinct({ type: schema.interviewCommonQuestion.type })
				.from(schema.interviewCommonQuestion)
				.where(eq(schema.interviewCommonQuestion.isActive, true));
			return result.map((r: { type: string }) => r.type);
		},
	},

	// ============================================================================
	// Career Market Insights
	// ============================================================================

	marketInsights: {
		list: async (options?: { field?: string; activeOnly?: boolean }) => {
			const conditions = [];
			if (options?.activeOnly !== false) {
				conditions.push(eq(schema.careerMarketInsight.isActive, true));
			}
			if (options?.field) {
				conditions.push(eq(schema.careerMarketInsight.field, options.field));
			}

			return db
				.select()
				.from(schema.careerMarketInsight)
				.where(conditions.length > 0 ? and(...conditions) : undefined)
				.orderBy(asc(schema.careerMarketInsight.sortOrder));
		},

		getById: async (id: string) => {
			const [insight] = await db.select().from(schema.careerMarketInsight).where(eq(schema.careerMarketInsight.id, id));
			return insight;
		},

		create: async (data: Omit<typeof schema.careerMarketInsight.$inferInsert, "id" | "createdAt" | "updatedAt">) => {
			const [insight] = await db.insert(schema.careerMarketInsight).values(data).returning();
			return insight;
		},

		update: async (
			id: string,
			data: Partial<Omit<typeof schema.careerMarketInsight.$inferInsert, "id" | "createdAt">>,
		) => {
			const [insight] = await db
				.update(schema.careerMarketInsight)
				.set({ ...data, updatedAt: new Date() })
				.where(eq(schema.careerMarketInsight.id, id))
				.returning();
			return insight;
		},

		delete: async (id: string) => {
			await db.delete(schema.careerMarketInsight).where(eq(schema.careerMarketInsight.id, id));
		},
	},

	// ============================================================================
	// Career Employers
	// ============================================================================

	employers: {
		list: async (options?: { field?: string; activeOnly?: boolean }) => {
			const conditions = [];
			if (options?.activeOnly !== false) {
				conditions.push(eq(schema.careerEmployer.isActive, true));
			}
			// For field filtering, we need to check if field is in the fields array
			// This is handled via JSONB containment

			let query = db
				.select()
				.from(schema.careerEmployer)
				.where(conditions.length > 0 ? and(...conditions) : undefined)
				.orderBy(asc(schema.careerEmployer.sortOrder), desc(schema.careerEmployer.openPositions));

			if (options?.field) {
				// Filter by field using JSONB @> operator
				query = db
					.select()
					.from(schema.careerEmployer)
					.where(
						and(
							conditions.length > 0 ? and(...conditions) : undefined,
							sql`${schema.careerEmployer.fields} @> ${JSON.stringify([options.field])}::jsonb`,
						),
					)
					.orderBy(asc(schema.careerEmployer.sortOrder), desc(schema.careerEmployer.openPositions));
			}

			return query;
		},

		getById: async (id: string) => {
			const [employer] = await db.select().from(schema.careerEmployer).where(eq(schema.careerEmployer.id, id));
			return employer;
		},

		create: async (data: Omit<typeof schema.careerEmployer.$inferInsert, "id" | "createdAt" | "updatedAt">) => {
			const [employer] = await db.insert(schema.careerEmployer).values(data).returning();
			return employer;
		},

		update: async (id: string, data: Partial<Omit<typeof schema.careerEmployer.$inferInsert, "id" | "createdAt">>) => {
			const [employer] = await db
				.update(schema.careerEmployer)
				.set({ ...data, updatedAt: new Date() })
				.where(eq(schema.careerEmployer.id, id))
				.returning();
			return employer;
		},

		delete: async (id: string) => {
			await db.delete(schema.careerEmployer).where(eq(schema.careerEmployer.id, id));
		},
	},

	// ============================================================================
	// Skill Library
	// ============================================================================

	skills: {
		list: async (options?: { field?: string; category?: string; recommendedOnly?: boolean; activeOnly?: boolean }) => {
			const conditions = [];
			if (options?.activeOnly !== false) {
				conditions.push(eq(schema.skillLibrary.isActive, true));
			}
			if (options?.field) {
				conditions.push(eq(schema.skillLibrary.field, options.field));
			}
			if (options?.category) {
				conditions.push(eq(schema.skillLibrary.category, options.category));
			}
			if (options?.recommendedOnly) {
				conditions.push(eq(schema.skillLibrary.isRecommended, true));
			}

			return db
				.select()
				.from(schema.skillLibrary)
				.where(conditions.length > 0 ? and(...conditions) : undefined)
				.orderBy(asc(schema.skillLibrary.category), asc(schema.skillLibrary.sortOrder), asc(schema.skillLibrary.name));
		},

		getById: async (id: string) => {
			const [skill] = await db.select().from(schema.skillLibrary).where(eq(schema.skillLibrary.id, id));
			return skill;
		},

		create: async (data: Omit<typeof schema.skillLibrary.$inferInsert, "id" | "createdAt" | "updatedAt">) => {
			const [skill] = await db.insert(schema.skillLibrary).values(data).returning();
			return skill;
		},

		update: async (id: string, data: Partial<Omit<typeof schema.skillLibrary.$inferInsert, "id" | "createdAt">>) => {
			const [skill] = await db
				.update(schema.skillLibrary)
				.set({ ...data, updatedAt: new Date() })
				.where(eq(schema.skillLibrary.id, id))
				.returning();
			return skill;
		},

		delete: async (id: string) => {
			await db.delete(schema.skillLibrary).where(eq(schema.skillLibrary.id, id));
		},

		getCategories: async (field?: string) => {
			const conditions = [eq(schema.skillLibrary.isActive, true)];
			if (field) {
				conditions.push(eq(schema.skillLibrary.field, field));
			}

			const result = await db
				.selectDistinct({ category: schema.skillLibrary.category })
				.from(schema.skillLibrary)
				.where(and(...conditions));
			return result.map((r: { category: string }) => r.category);
		},

		getFields: async () => {
			const result = await db
				.selectDistinct({ field: schema.skillLibrary.field })
				.from(schema.skillLibrary)
				.where(eq(schema.skillLibrary.isActive, true));
			return result.map((r: { field: string }) => r.field);
		},
	},

	// ============================================================================
	// Bulk Operations (for admin seeding)
	// ============================================================================

	bulkSeed: {
		imtaPrograms: async (programs: (typeof schema.imtaProgram.$inferInsert)[]) => {
			if (programs.length === 0) return [];
			return db.insert(schema.imtaProgram).values(programs).onConflictDoNothing().returning();
		},

		interviewTips: async (tips: (typeof schema.interviewTip.$inferInsert)[]) => {
			if (tips.length === 0) return [];
			return db.insert(schema.interviewTip).values(tips).onConflictDoNothing().returning();
		},

		interviewQuestions: async (questions: (typeof schema.interviewCommonQuestion.$inferInsert)[]) => {
			if (questions.length === 0) return [];
			return db.insert(schema.interviewCommonQuestion).values(questions).onConflictDoNothing().returning();
		},

		marketInsights: async (insights: (typeof schema.careerMarketInsight.$inferInsert)[]) => {
			if (insights.length === 0) return [];
			return db.insert(schema.careerMarketInsight).values(insights).onConflictDoNothing().returning();
		},

		employers: async (employers: (typeof schema.careerEmployer.$inferInsert)[]) => {
			if (employers.length === 0) return [];
			return db.insert(schema.careerEmployer).values(employers).onConflictDoNothing().returning();
		},

		skills: async (skills: (typeof schema.skillLibrary.$inferInsert)[]) => {
			if (skills.length === 0) return [];
			return db.insert(schema.skillLibrary).values(skills).onConflictDoNothing().returning();
		},
	},
};
