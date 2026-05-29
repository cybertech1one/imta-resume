import { z } from "zod";
import { referenceDataService } from "@/integrations/orpc/services/reference-data";
import { adminProcedure, publicProcedure } from "../context";

// ============================================================================
// Schemas
// ============================================================================

const imtaProgramCreateSchema = z.object({
	id: z.string().min(1),
	name: z.string().min(1),
	nameFr: z.string().min(1),
	field: z.string().min(1),
	duration: z.string().min(1),
	durationFr: z.string().min(1),
	requirements: z.string().min(1),
	requirementsFr: z.string().min(1),
	description: z.string().min(1),
	descriptionFr: z.string().min(1),
	successRate: z.number().int().min(0).max(100).optional(),
	avgSalary: z.number().int().min(0).optional(),
	employmentRate: z.number().int().min(0).max(100).optional(),
	skills: z.array(z.string()),
	certifications: z.array(z.string()),
	isActive: z.boolean().optional(),
	sortOrder: z.number().int().optional(),
});

const imtaProgramUpdateSchema = imtaProgramCreateSchema.partial().omit({ id: true });

const interviewTipCreateSchema = z.object({
	id: z.string().min(1),
	title: z.string().min(1),
	titleFr: z.string().min(1),
	content: z.string().min(1),
	contentFr: z.string().min(1),
	extendedContent: z.string().optional(),
	extendedContentFr: z.string().optional(),
	category: z.string().min(1),
	field: z.string().optional(),
	tags: z.array(z.string()),
	isActive: z.boolean().optional(),
	sortOrder: z.number().int().optional(),
});

const interviewTipUpdateSchema = interviewTipCreateSchema.partial().omit({ id: true });

const interviewQuestionCreateSchema = z.object({
	id: z.string().min(1),
	question: z.string().min(1),
	questionFr: z.string().min(1),
	type: z.string().min(1),
	field: z.string().min(1),
	sampleAnswer: z.string().optional(),
	sampleAnswerFr: z.string().optional(),
	tips: z.array(z.string()),
	tipsFr: z.array(z.string()),
	difficulty: z.string().optional(),
	isActive: z.boolean().optional(),
	sortOrder: z.number().int().optional(),
});

const interviewQuestionUpdateSchema = interviewQuestionCreateSchema.partial().omit({ id: true });

const marketInsightCreateSchema = z.object({
	title: z.string().min(1),
	titleFr: z.string().min(1),
	value: z.string().min(1),
	description: z.string().optional(),
	descriptionFr: z.string().optional(),
	icon: z.string().optional(),
	color: z.string().optional(),
	field: z.string().optional(),
	isActive: z.boolean().optional(),
	sortOrder: z.number().int().optional(),
});

const marketInsightUpdateSchema = marketInsightCreateSchema.partial();

const employerCreateSchema = z.object({
	name: z.string().min(1),
	sector: z.string().min(1),
	sectorFr: z.string().min(1),
	location: z.string().min(1),
	locationFr: z.string().optional(),
	openPositions: z.number().int().min(0).optional(),
	website: z.string().url().optional(),
	logo: z.string().optional(),
	description: z.string().optional(),
	descriptionFr: z.string().optional(),
	fields: z.array(z.string()),
	isActive: z.boolean().optional(),
	sortOrder: z.number().int().optional(),
});

const employerUpdateSchema = employerCreateSchema.partial();

const skillCreateSchema = z.object({
	name: z.string().min(1),
	nameFr: z.string().min(1),
	field: z.string().min(1),
	category: z.string().min(1),
	description: z.string().optional(),
	descriptionFr: z.string().optional(),
	isRecommended: z.boolean().optional(),
	isActive: z.boolean().optional(),
	sortOrder: z.number().int().optional(),
});

const skillUpdateSchema = skillCreateSchema.partial();

// ============================================================================
// IMTA Programs Router
// ============================================================================

export const imtaProgramsRouter = {
	list: publicProcedure
		.input(
			z
				.object({
					field: z.string().optional(),
					activeOnly: z.boolean().optional(),
				})
				.optional(),
		)
		.handler(async ({ input }) => {
			return referenceDataService.imtaPrograms.list(input);
		}),

	getById: publicProcedure.input(z.object({ id: z.string().uuid() })).handler(async ({ input }) => {
		return referenceDataService.imtaPrograms.getById(input.id);
	}),

	create: adminProcedure.input(imtaProgramCreateSchema).handler(async ({ input }) => {
		return referenceDataService.imtaPrograms.create(input);
	}),

	update: adminProcedure
		.input(
			z.object({
				id: z.string().uuid(),
				data: imtaProgramUpdateSchema,
			}),
		)
		.handler(async ({ input }) => {
			return referenceDataService.imtaPrograms.update(input.id, input.data);
		}),

	delete: adminProcedure.input(z.object({ id: z.string().uuid() })).handler(async ({ input }) => {
		await referenceDataService.imtaPrograms.delete(input.id);
		return { success: true };
	}),
};

// ============================================================================
// Interview Tips Router
// ============================================================================

export const interviewTipsRouter = {
	list: publicProcedure
		.input(
			z
				.object({
					category: z.string().optional(),
					field: z.string().optional(),
					activeOnly: z.boolean().optional(),
					limit: z.number().int().positive().max(500).optional(),
				})
				.optional(),
		)
		.handler(async ({ input }) => {
			return referenceDataService.interviewTips.list(input);
		}),

	getById: publicProcedure.input(z.object({ id: z.string().uuid() })).handler(async ({ input }) => {
		return referenceDataService.interviewTips.getById(input.id);
	}),

	getCategories: publicProcedure.handler(async () => {
		return referenceDataService.interviewTips.getCategories();
	}),

	create: adminProcedure.input(interviewTipCreateSchema).handler(async ({ input }) => {
		return referenceDataService.interviewTips.create(input);
	}),

	update: adminProcedure
		.input(
			z.object({
				id: z.string().uuid(),
				data: interviewTipUpdateSchema,
			}),
		)
		.handler(async ({ input }) => {
			return referenceDataService.interviewTips.update(input.id, input.data);
		}),

	delete: adminProcedure.input(z.object({ id: z.string().uuid() })).handler(async ({ input }) => {
		await referenceDataService.interviewTips.delete(input.id);
		return { success: true };
	}),
};

// ============================================================================
// Interview Questions Router
// ============================================================================

export const interviewQuestionsRouter = {
	list: publicProcedure
		.input(
			z
				.object({
					type: z.string().optional(),
					field: z.string().optional(),
					difficulty: z.string().optional(),
					activeOnly: z.boolean().optional(),
				})
				.optional(),
		)
		.handler(async ({ input }) => {
			return referenceDataService.interviewQuestions.list(input);
		}),

	getById: publicProcedure.input(z.object({ id: z.string().uuid() })).handler(async ({ input }) => {
		return referenceDataService.interviewQuestions.getById(input.id);
	}),

	getTypes: publicProcedure.handler(async () => {
		return referenceDataService.interviewQuestions.getTypes();
	}),

	create: adminProcedure.input(interviewQuestionCreateSchema).handler(async ({ input }) => {
		return referenceDataService.interviewQuestions.create(input);
	}),

	update: adminProcedure
		.input(
			z.object({
				id: z.string().uuid(),
				data: interviewQuestionUpdateSchema,
			}),
		)
		.handler(async ({ input }) => {
			return referenceDataService.interviewQuestions.update(input.id, input.data);
		}),

	delete: adminProcedure.input(z.object({ id: z.string().uuid() })).handler(async ({ input }) => {
		await referenceDataService.interviewQuestions.delete(input.id);
		return { success: true };
	}),
};

// ============================================================================
// Market Insights Router
// ============================================================================

export const marketInsightsRouter = {
	list: publicProcedure
		.input(
			z
				.object({
					field: z.string().optional(),
					activeOnly: z.boolean().optional(),
				})
				.optional(),
		)
		.handler(async ({ input }) => {
			return referenceDataService.marketInsights.list(input);
		}),

	getById: publicProcedure.input(z.object({ id: z.string().uuid() })).handler(async ({ input }) => {
		return referenceDataService.marketInsights.getById(input.id);
	}),

	create: adminProcedure.input(marketInsightCreateSchema).handler(async ({ input }) => {
		return referenceDataService.marketInsights.create(input);
	}),

	update: adminProcedure
		.input(
			z.object({
				id: z.string().uuid(),
				data: marketInsightUpdateSchema,
			}),
		)
		.handler(async ({ input }) => {
			return referenceDataService.marketInsights.update(input.id, input.data);
		}),

	delete: adminProcedure.input(z.object({ id: z.string().uuid() })).handler(async ({ input }) => {
		await referenceDataService.marketInsights.delete(input.id);
		return { success: true };
	}),
};

// ============================================================================
// Employers Router
// ============================================================================

export const employersRouter = {
	list: publicProcedure
		.input(
			z
				.object({
					field: z.string().optional(),
					activeOnly: z.boolean().optional(),
					limit: z.number().int().positive().max(500).optional(),
				})
				.optional(),
		)
		.handler(async ({ input }) => {
			return referenceDataService.employers.list(input);
		}),

	getById: publicProcedure.input(z.object({ id: z.string().uuid() })).handler(async ({ input }) => {
		return referenceDataService.employers.getById(input.id);
	}),

	create: adminProcedure.input(employerCreateSchema).handler(async ({ input }) => {
		return referenceDataService.employers.create(input);
	}),

	update: adminProcedure
		.input(
			z.object({
				id: z.string().uuid(),
				data: employerUpdateSchema,
			}),
		)
		.handler(async ({ input }) => {
			return referenceDataService.employers.update(input.id, input.data);
		}),

	delete: adminProcedure.input(z.object({ id: z.string().uuid() })).handler(async ({ input }) => {
		await referenceDataService.employers.delete(input.id);
		return { success: true };
	}),
};

// ============================================================================
// Skills Router
// ============================================================================

export const skillsRouter = {
	list: publicProcedure
		.input(
			z
				.object({
					field: z.string().optional(),
					category: z.string().optional(),
					recommendedOnly: z.boolean().optional(),
					activeOnly: z.boolean().optional(),
					limit: z.number().int().positive().max(500).optional(),
				})
				.optional(),
		)
		.handler(async ({ input }) => {
			return referenceDataService.skills.list(input);
		}),

	getById: publicProcedure.input(z.object({ id: z.string().uuid() })).handler(async ({ input }) => {
		return referenceDataService.skills.getById(input.id);
	}),

	getCategories: publicProcedure
		.input(z.object({ field: z.string().optional() }).optional())
		.handler(async ({ input }) => {
			return referenceDataService.skills.getCategories(input?.field);
		}),

	getFields: publicProcedure.handler(async () => {
		return referenceDataService.skills.getFields();
	}),

	create: adminProcedure.input(skillCreateSchema).handler(async ({ input }) => {
		return referenceDataService.skills.create(input);
	}),

	update: adminProcedure
		.input(
			z.object({
				id: z.string().uuid(),
				data: skillUpdateSchema,
			}),
		)
		.handler(async ({ input }) => {
			return referenceDataService.skills.update(input.id, input.data);
		}),

	delete: adminProcedure.input(z.object({ id: z.string().uuid() })).handler(async ({ input }) => {
		await referenceDataService.skills.delete(input.id);
		return { success: true };
	}),
};

// ============================================================================
// Bulk Seed Router (admin only)
// ============================================================================

export const seedRouter = {
	imtaPrograms: adminProcedure.input(z.array(imtaProgramCreateSchema)).handler(async ({ input }) => {
		return referenceDataService.bulkSeed.imtaPrograms(input);
	}),

	interviewTips: adminProcedure.input(z.array(interviewTipCreateSchema)).handler(async ({ input }) => {
		return referenceDataService.bulkSeed.interviewTips(input);
	}),

	interviewQuestions: adminProcedure.input(z.array(interviewQuestionCreateSchema)).handler(async ({ input }) => {
		return referenceDataService.bulkSeed.interviewQuestions(input);
	}),

	marketInsights: adminProcedure.input(z.array(marketInsightCreateSchema)).handler(async ({ input }) => {
		return referenceDataService.bulkSeed.marketInsights(input);
	}),

	employers: adminProcedure.input(z.array(employerCreateSchema)).handler(async ({ input }) => {
		return referenceDataService.bulkSeed.employers(input);
	}),

	skills: adminProcedure.input(z.array(skillCreateSchema)).handler(async ({ input }) => {
		return referenceDataService.bulkSeed.skills(input);
	}),
};
