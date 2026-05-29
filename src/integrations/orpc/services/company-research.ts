import { ORPCError } from "@orpc/client";
import { and, desc, eq, ilike, or } from "drizzle-orm";
import { schema } from "@/integrations/drizzle";
import { db } from "@/integrations/drizzle/client";
import type {
	CompanyBenefit,
	CompanyCultureInsight,
	CompanyEmployeeReview,
	CompanyIndustry,
	CompanyInterviewQuestion,
	CompanyInterviewTip,
	CompanyKeyPerson,
	CompanyNewsItem,
	CompanySalaryRange,
	CompanyValue,
} from "@/integrations/drizzle/schema";
import { generateId } from "@/utils/string";

export type CreateCompanyInput = {
	userId: string;
	name: string;
	logo?: string;
	industry: CompanyIndustry;
	description: string;
	mission: string;
	vision: string;
	location: string;
	headquarters: string;
	employeeCount: string;
	founded: number;
	website?: string;
	linkedIn?: string;
	revenue?: string;
	stockSymbol?: string;
	cultureInsights?: CompanyCultureInsight[];
	cultureValues?: CompanyValue[];
	cultureOverallScore?: number;
	reviews?: CompanyEmployeeReview[];
	reviewsAverageRating?: number;
	reviewsTotalCount?: number;
	reviewsRecommendRate?: number;
	reviewsCeoApprovalRate?: number;
	interviewQuestions?: CompanyInterviewQuestion[];
	interviewTips?: CompanyInterviewTip[];
	interviewDifficulty?: number;
	interviewAverageDuration?: string;
	interviewProcessSteps?: string[];
	salaries?: CompanySalaryRange[];
	benefits?: CompanyBenefit[];
	news?: CompanyNewsItem[];
	keyPeople?: CompanyKeyPerson[];
};

export type UpdateCompanyInput = {
	id: string;
	userId: string;
	name?: string;
	logo?: string;
	industry?: CompanyIndustry;
	description?: string;
	mission?: string;
	vision?: string;
	location?: string;
	headquarters?: string;
	employeeCount?: string;
	founded?: number;
	website?: string;
	linkedIn?: string;
	revenue?: string;
	stockSymbol?: string;
	cultureInsights?: CompanyCultureInsight[];
	cultureValues?: CompanyValue[];
	cultureOverallScore?: number;
	reviews?: CompanyEmployeeReview[];
	reviewsAverageRating?: number;
	reviewsTotalCount?: number;
	reviewsRecommendRate?: number;
	reviewsCeoApprovalRate?: number;
	interviewQuestions?: CompanyInterviewQuestion[];
	interviewTips?: CompanyInterviewTip[];
	interviewDifficulty?: number;
	interviewAverageDuration?: string;
	interviewProcessSteps?: string[];
	salaries?: CompanySalaryRange[];
	benefits?: CompanyBenefit[];
	news?: CompanyNewsItem[];
	keyPeople?: CompanyKeyPerson[];
};

export type ListCompaniesInput = {
	userId: string;
	industry?: CompanyIndustry;
	search?: string;
	sort?: "createdAt" | "name" | "reviewsAverageRating";
	sortOrder?: "asc" | "desc";
	limit?: number;
	offset?: number;
};

export const companyResearchService = {
	// Create a new company profile
	create: async (input: CreateCompanyInput): Promise<string> => {
		const id = generateId();

		await db.insert(schema.companyProfile).values({
			id,
			userId: input.userId,
			name: input.name,
			logo: input.logo,
			industry: input.industry,
			description: input.description,
			mission: input.mission,
			vision: input.vision,
			location: input.location,
			headquarters: input.headquarters,
			employeeCount: input.employeeCount,
			founded: input.founded,
			website: input.website,
			linkedIn: input.linkedIn,
			revenue: input.revenue,
			stockSymbol: input.stockSymbol,
			cultureInsights: input.cultureInsights ?? [],
			cultureValues: input.cultureValues ?? [],
			cultureOverallScore: input.cultureOverallScore ?? 0,
			reviews: input.reviews ?? [],
			reviewsAverageRating: input.reviewsAverageRating ?? 0,
			reviewsTotalCount: input.reviewsTotalCount ?? 0,
			reviewsRecommendRate: input.reviewsRecommendRate ?? 0,
			reviewsCeoApprovalRate: input.reviewsCeoApprovalRate ?? 0,
			interviewQuestions: input.interviewQuestions ?? [],
			interviewTips: input.interviewTips ?? [],
			interviewDifficulty: input.interviewDifficulty ?? 0,
			interviewAverageDuration: input.interviewAverageDuration,
			interviewProcessSteps: input.interviewProcessSteps ?? [],
			salaries: input.salaries ?? [],
			benefits: input.benefits ?? [],
			news: input.news ?? [],
			keyPeople: input.keyPeople ?? [],
		});

		return id;
	},

	// Get company by ID
	getById: async (input: { id: string; userId: string }) => {
		const [company] = await db
			.select()
			.from(schema.companyProfile)
			.where(and(eq(schema.companyProfile.id, input.id), eq(schema.companyProfile.userId, input.userId)));

		if (!company) {
			throw new ORPCError("NOT_FOUND", { message: "Company not found" });
		}

		return company;
	},

	// List companies with filters
	list: async (input: ListCompaniesInput) => {
		const conditions = [eq(schema.companyProfile.userId, input.userId)];

		if (input.industry) {
			conditions.push(eq(schema.companyProfile.industry, input.industry));
		}

		if (input.search) {
			const searchCondition = or(
				ilike(schema.companyProfile.name, `%${input.search}%`),
				ilike(schema.companyProfile.description, `%${input.search}%`),
			);
			if (searchCondition) conditions.push(searchCondition);
		}

		const sortColumn = {
			createdAt: schema.companyProfile.createdAt,
			name: schema.companyProfile.name,
			reviewsAverageRating: schema.companyProfile.reviewsAverageRating,
		}[input.sort ?? "createdAt"];

		const orderFn = input.sortOrder === "asc" ? (col: typeof sortColumn) => col : desc;

		const companies = await db
			.select()
			.from(schema.companyProfile)
			.where(and(...conditions))
			.orderBy(orderFn(sortColumn))
			.limit(input.limit ?? 50)
			.offset(input.offset ?? 0);

		return companies;
	},

	// Update company
	update: async (input: UpdateCompanyInput): Promise<void> => {
		const [existing] = await db
			.select({ id: schema.companyProfile.id })
			.from(schema.companyProfile)
			.where(and(eq(schema.companyProfile.id, input.id), eq(schema.companyProfile.userId, input.userId)));

		if (!existing) {
			throw new ORPCError("NOT_FOUND", { message: "Company not found" });
		}

		await db
			.update(schema.companyProfile)
			.set({
				name: input.name,
				logo: input.logo,
				industry: input.industry,
				description: input.description,
				mission: input.mission,
				vision: input.vision,
				location: input.location,
				headquarters: input.headquarters,
				employeeCount: input.employeeCount,
				founded: input.founded,
				website: input.website,
				linkedIn: input.linkedIn,
				revenue: input.revenue,
				stockSymbol: input.stockSymbol,
				cultureInsights: input.cultureInsights,
				cultureValues: input.cultureValues,
				cultureOverallScore: input.cultureOverallScore,
				reviews: input.reviews,
				reviewsAverageRating: input.reviewsAverageRating,
				reviewsTotalCount: input.reviewsTotalCount,
				reviewsRecommendRate: input.reviewsRecommendRate,
				reviewsCeoApprovalRate: input.reviewsCeoApprovalRate,
				interviewQuestions: input.interviewQuestions,
				interviewTips: input.interviewTips,
				interviewDifficulty: input.interviewDifficulty,
				interviewAverageDuration: input.interviewAverageDuration,
				interviewProcessSteps: input.interviewProcessSteps,
				salaries: input.salaries,
				benefits: input.benefits,
				news: input.news,
				keyPeople: input.keyPeople,
			})
			.where(and(eq(schema.companyProfile.id, input.id), eq(schema.companyProfile.userId, input.userId)));
	},

	// Delete company
	delete: async (input: { id: string; userId: string }): Promise<void> => {
		await db
			.delete(schema.companyProfile)
			.where(and(eq(schema.companyProfile.id, input.id), eq(schema.companyProfile.userId, input.userId)));
	},

	// Favorites methods
	favorites: {
		// Add company to favorites
		add: async (input: { userId: string; companyId: string }): Promise<string> => {
			// Check if company exists and belongs to user
			const [company] = await db
				.select({ id: schema.companyProfile.id })
				.from(schema.companyProfile)
				.where(and(eq(schema.companyProfile.id, input.companyId), eq(schema.companyProfile.userId, input.userId)));

			if (!company) {
				throw new ORPCError("NOT_FOUND", { message: "Company not found" });
			}

			// Check if already a favorite
			const [existing] = await db
				.select({ id: schema.companyFavorite.id })
				.from(schema.companyFavorite)
				.where(
					and(eq(schema.companyFavorite.userId, input.userId), eq(schema.companyFavorite.companyId, input.companyId)),
				);

			if (existing) {
				return existing.id;
			}

			const id = generateId();

			await db.insert(schema.companyFavorite).values({
				id,
				userId: input.userId,
				companyId: input.companyId,
			});

			return id;
		},

		// Remove company from favorites
		remove: async (input: { userId: string; companyId: string }): Promise<void> => {
			await db
				.delete(schema.companyFavorite)
				.where(
					and(eq(schema.companyFavorite.userId, input.userId), eq(schema.companyFavorite.companyId, input.companyId)),
				);
		},

		// List favorite companies
		list: async (input: { userId: string }) => {
			const favorites = await db
				.select({
					id: schema.companyFavorite.id,
					companyId: schema.companyFavorite.companyId,
					createdAt: schema.companyFavorite.createdAt,
				})
				.from(schema.companyFavorite)
				.where(eq(schema.companyFavorite.userId, input.userId))
				.orderBy(desc(schema.companyFavorite.createdAt));

			return favorites;
		},

		// Get list of favorite company IDs
		listIds: async (input: { userId: string }): Promise<string[]> => {
			const favorites = await db
				.select({ companyId: schema.companyFavorite.companyId })
				.from(schema.companyFavorite)
				.where(eq(schema.companyFavorite.userId, input.userId));

			return favorites.map((f) => f.companyId);
		},

		// Check if a company is a favorite
		isFavorite: async (input: { userId: string; companyId: string }): Promise<boolean> => {
			const [favorite] = await db
				.select({ id: schema.companyFavorite.id })
				.from(schema.companyFavorite)
				.where(
					and(eq(schema.companyFavorite.userId, input.userId), eq(schema.companyFavorite.companyId, input.companyId)),
				);

			return !!favorite;
		},

		// Toggle favorite status
		toggle: async (input: { userId: string; companyId: string }): Promise<boolean> => {
			const isFavorite = await companyResearchService.favorites.isFavorite(input);

			if (isFavorite) {
				await companyResearchService.favorites.remove(input);
				return false;
			}

			await companyResearchService.favorites.add(input);
			return true;
		},
	},

	// Get statistics
	getStatistics: async (input: { userId: string }) => {
		const companies = await db
			.select()
			.from(schema.companyProfile)
			.where(eq(schema.companyProfile.userId, input.userId));

		const favorites = await db
			.select()
			.from(schema.companyFavorite)
			.where(eq(schema.companyFavorite.userId, input.userId));

		const totalReviews = companies.reduce((sum, c) => sum + c.reviewsTotalCount, 0);

		const byIndustry: Record<string, number> = {};
		for (const company of companies) {
			byIndustry[company.industry] = (byIndustry[company.industry] ?? 0) + 1;
		}

		return {
			totalCompanies: companies.length,
			totalFavorites: favorites.length,
			totalReviews,
			byIndustry,
		};
	},
};
