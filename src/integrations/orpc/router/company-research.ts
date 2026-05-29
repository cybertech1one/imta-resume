import z from "zod";
import { protectedProcedure } from "../context";
import { companyResearchService } from "../services/company-research";

const industrySchema = z.enum([
	"healthcare",
	"industrial",
	"manufacturing",
	"mining",
	"automotive",
	"services",
	"energy",
	"tech",
]);

const cultureInsightSchema = z.object({
	category: z.string(),
	score: z.number(),
	description: z.string(),
});

const companyValueSchema = z.object({
	value: z.string(),
	description: z.string(),
});

const employeeReviewSchema = z.object({
	id: z.string().uuid(),
	title: z.string(),
	position: z.string(),
	rating: z.number(),
	date: z.string(),
	pros: z.string(),
	cons: z.string(),
	advice: z.string(),
	recommend: z.boolean(),
	approveOfCEO: z.boolean(),
});

const interviewQuestionSchema = z.object({
	id: z.string().uuid(),
	question: z.string(),
	category: z.enum(["behavioral", "technical", "situational", "general"]),
	difficulty: z.enum(["easy", "medium", "hard"]),
	frequency: z.number(),
});

const interviewTipSchema = z.object({
	tip: z.string(),
	category: z.string(),
});

const salaryRangeSchema = z.object({
	role: z.string(),
	minSalary: z.number(),
	maxSalary: z.number(),
	medianSalary: z.number(),
	totalComp: z.number().optional(),
	sampleSize: z.number(),
});

const benefitSchema = z.object({
	category: z.string(),
	items: z.array(z.string()),
	rating: z.number(),
});

const newsItemSchema = z.object({
	id: z.string().uuid(),
	title: z.string(),
	summary: z.string(),
	date: z.string(),
	source: z.string(),
	url: z.string().optional(),
	type: z.enum(["announcement", "press", "award", "partnership", "hiring"]),
});

const keyPersonSchema = z.object({
	id: z.string().uuid(),
	name: z.string(),
	title: z.string(),
	department: z.string(),
	linkedIn: z.string().optional(),
	bio: z.string().optional(),
	yearsAtCompany: z.number(),
});

const companySchema = z.object({
	id: z.string().uuid(),
	userId: z.string(),
	name: z.string(),
	logo: z.string().nullable(),
	industry: industrySchema,
	description: z.string(),
	mission: z.string(),
	vision: z.string(),
	location: z.string(),
	headquarters: z.string(),
	employeeCount: z.string(),
	founded: z.number(),
	website: z.string().nullable(),
	linkedIn: z.string().nullable(),
	revenue: z.string().nullable(),
	stockSymbol: z.string().nullable(),
	cultureInsights: z.array(cultureInsightSchema),
	cultureValues: z.array(companyValueSchema),
	cultureOverallScore: z.number(),
	reviews: z.array(employeeReviewSchema),
	reviewsAverageRating: z.number(),
	reviewsTotalCount: z.number(),
	reviewsRecommendRate: z.number(),
	reviewsCeoApprovalRate: z.number(),
	interviewQuestions: z.array(interviewQuestionSchema),
	interviewTips: z.array(interviewTipSchema),
	interviewDifficulty: z.number(),
	interviewAverageDuration: z.string().nullable(),
	interviewProcessSteps: z.array(z.string()),
	salaries: z.array(salaryRangeSchema),
	benefits: z.array(benefitSchema),
	news: z.array(newsItemSchema),
	keyPeople: z.array(keyPersonSchema),
	createdAt: z.coerce.date(),
	updatedAt: z.coerce.date(),
});

const favoritesRouter = {
	add: protectedProcedure
		.route({
			method: "POST",
			path: "/company-research/favorites",
			tags: ["Company Research"],
			summary: "Add company to favorites",
		})
		.input(z.object({ companyId: z.string() }))
		.output(z.string())
		.handler(async ({ context, input }) => {
			return await companyResearchService.favorites.add({
				userId: context.user.id,
				companyId: input.companyId,
			});
		}),

	remove: protectedProcedure
		.route({
			method: "DELETE",
			path: "/company-research/favorites/{companyId}",
			tags: ["Company Research"],
			summary: "Remove company from favorites",
		})
		.input(z.object({ companyId: z.string() }))
		.output(z.void())
		.handler(async ({ context, input }) => {
			return await companyResearchService.favorites.remove({
				userId: context.user.id,
				companyId: input.companyId,
			});
		}),

	list: protectedProcedure
		.route({
			method: "GET",
			path: "/company-research/favorites",
			tags: ["Company Research"],
			summary: "List favorite companies",
		})
		.output(
			z.array(
				z.object({
					id: z.string().uuid(),
					companyId: z.string(),
					createdAt: z.coerce.date(),
				}),
			),
		)
		.handler(async ({ context }) => {
			return await companyResearchService.favorites.list({ userId: context.user.id });
		}),

	listIds: protectedProcedure
		.route({
			method: "GET",
			path: "/company-research/favorites/ids",
			tags: ["Company Research"],
			summary: "List favorite company IDs",
		})
		.output(z.array(z.string()))
		.handler(async ({ context }) => {
			return await companyResearchService.favorites.listIds({ userId: context.user.id });
		}),

	toggle: protectedProcedure
		.route({
			method: "POST",
			path: "/company-research/favorites/{companyId}/toggle",
			tags: ["Company Research"],
			summary: "Toggle company favorite status",
		})
		.input(z.object({ companyId: z.string() }))
		.output(z.boolean())
		.handler(async ({ context, input }) => {
			return await companyResearchService.favorites.toggle({
				userId: context.user.id,
				companyId: input.companyId,
			});
		}),
};

export const companyResearchRouter = {
	favorites: favoritesRouter,

	create: protectedProcedure
		.route({
			method: "POST",
			path: "/company-research",
			tags: ["Company Research"],
			summary: "Create a new company profile",
		})
		.input(
			z.object({
				name: z.string().min(1).max(255),
				logo: z.string().optional(),
				industry: industrySchema,
				description: z.string(),
				mission: z.string(),
				vision: z.string(),
				location: z.string(),
				headquarters: z.string(),
				employeeCount: z.string(),
				founded: z.number(),
				website: z.string().url().optional().or(z.literal("")),
				linkedIn: z.string().url().optional().or(z.literal("")),
				revenue: z.string().optional(),
				stockSymbol: z.string().optional(),
				cultureInsights: z.array(cultureInsightSchema).optional(),
				cultureValues: z.array(companyValueSchema).optional(),
				cultureOverallScore: z.number().optional(),
				reviews: z.array(employeeReviewSchema).optional(),
				reviewsAverageRating: z.number().optional(),
				reviewsTotalCount: z.number().optional(),
				reviewsRecommendRate: z.number().optional(),
				reviewsCeoApprovalRate: z.number().optional(),
				interviewQuestions: z.array(interviewQuestionSchema).optional(),
				interviewTips: z.array(interviewTipSchema).optional(),
				interviewDifficulty: z.number().optional(),
				interviewAverageDuration: z.string().optional(),
				interviewProcessSteps: z.array(z.string()).optional(),
				salaries: z.array(salaryRangeSchema).optional(),
				benefits: z.array(benefitSchema).optional(),
				news: z.array(newsItemSchema).optional(),
				keyPeople: z.array(keyPersonSchema).optional(),
			}),
		)
		.output(z.string())
		.handler(async ({ context, input }) => {
			return await companyResearchService.create({
				...input,
				userId: context.user.id,
				website: input.website || undefined,
				linkedIn: input.linkedIn || undefined,
			});
		}),

	getById: protectedProcedure
		.route({
			method: "GET",
			path: "/company-research/{id}",
			tags: ["Company Research"],
			summary: "Get company by ID",
		})
		.input(z.object({ id: z.string().uuid() }))
		.output(companySchema)
		.handler(async ({ context, input }) => {
			return await companyResearchService.getById({ id: input.id, userId: context.user.id });
		}),

	list: protectedProcedure
		.route({
			method: "GET",
			path: "/company-research",
			tags: ["Company Research"],
			summary: "List all companies",
		})
		.input(
			z
				.object({
					industry: industrySchema.optional(),
					search: z.string().optional(),
					sort: z.enum(["createdAt", "name", "reviewsAverageRating"]).optional(),
					sortOrder: z.enum(["asc", "desc"]).optional(),
					limit: z.number().optional(),
					offset: z.number().optional(),
				})
				.optional()
				.default({}),
		)
		.output(z.array(companySchema))
		.handler(async ({ context, input }) => {
			return await companyResearchService.list({
				userId: context.user.id,
				...input,
			});
		}),

	update: protectedProcedure
		.route({
			method: "PUT",
			path: "/company-research/{id}",
			tags: ["Company Research"],
			summary: "Update a company",
		})
		.input(
			z.object({
				id: z.string().uuid(),
				name: z.string().min(1).max(255).optional(),
				logo: z.string().optional(),
				industry: industrySchema.optional(),
				description: z.string().optional(),
				mission: z.string().optional(),
				vision: z.string().optional(),
				location: z.string().optional(),
				headquarters: z.string().optional(),
				employeeCount: z.string().optional(),
				founded: z.number().optional(),
				website: z.string().url().optional().or(z.literal("")),
				linkedIn: z.string().url().optional().or(z.literal("")),
				revenue: z.string().optional(),
				stockSymbol: z.string().optional(),
				cultureInsights: z.array(cultureInsightSchema).optional(),
				cultureValues: z.array(companyValueSchema).optional(),
				cultureOverallScore: z.number().optional(),
				reviews: z.array(employeeReviewSchema).optional(),
				reviewsAverageRating: z.number().optional(),
				reviewsTotalCount: z.number().optional(),
				reviewsRecommendRate: z.number().optional(),
				reviewsCeoApprovalRate: z.number().optional(),
				interviewQuestions: z.array(interviewQuestionSchema).optional(),
				interviewTips: z.array(interviewTipSchema).optional(),
				interviewDifficulty: z.number().optional(),
				interviewAverageDuration: z.string().optional(),
				interviewProcessSteps: z.array(z.string()).optional(),
				salaries: z.array(salaryRangeSchema).optional(),
				benefits: z.array(benefitSchema).optional(),
				news: z.array(newsItemSchema).optional(),
				keyPeople: z.array(keyPersonSchema).optional(),
			}),
		)
		.output(z.void())
		.handler(async ({ context, input }) => {
			return await companyResearchService.update({
				...input,
				userId: context.user.id,
				website: input.website || undefined,
				linkedIn: input.linkedIn || undefined,
			});
		}),

	delete: protectedProcedure
		.route({
			method: "DELETE",
			path: "/company-research/{id}",
			tags: ["Company Research"],
			summary: "Delete a company",
		})
		.input(z.object({ id: z.string().uuid() }))
		.output(z.void())
		.handler(async ({ context, input }) => {
			return await companyResearchService.delete({ id: input.id, userId: context.user.id });
		}),

	getStatistics: protectedProcedure
		.route({
			method: "GET",
			path: "/company-research/statistics",
			tags: ["Company Research"],
			summary: "Get company research statistics",
		})
		.output(
			z.object({
				totalCompanies: z.number(),
				totalFavorites: z.number(),
				totalReviews: z.number(),
				byIndustry: z.record(z.string(), z.number()),
			}),
		)
		.handler(async ({ context }) => {
			return await companyResearchService.getStatistics({ userId: context.user.id });
		}),
};
