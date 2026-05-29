import { and, count, desc, eq } from "drizzle-orm";
import { schema } from "@/integrations/drizzle";
import { db } from "@/integrations/drizzle/client";
import type {
	InsightsBarrier,
	InsightsCompetition,
	InsightsExperienceLevel,
	InsightsHotness,
	InsightsIndustry,
	InsightsRegion,
	InsightsSkillTrend,
	InsightsTrend,
	SkillsHeatmapIndustries,
} from "@/integrations/drizzle/schema";
import { generateId } from "@/utils/string";

// Types for service inputs and outputs
export type CreateIndustryTrendInput = {
	industry: InsightsIndustry;
	currentDemand: number;
	changePercent: number;
	trend: InsightsTrend;
	openPositions: number;
	avgTimeToHire: number;
	competitionLevel: InsightsCompetition;
};

export type CreateSalaryBenchmarkInput = {
	role: string;
	industry: InsightsIndustry;
	experienceLevel: InsightsExperienceLevel;
	region: InsightsRegion;
	minSalary: number;
	maxSalary: number;
	medianSalary: number;
	percentile25: number;
	percentile75: number;
	yearOverYearChange: number;
};

export type CreateJobDemandInput = {
	skill: string;
	industry: InsightsIndustry;
	demandScore: number;
	growthRate: number;
	totalJobs: number;
	avgSalaryPremium: number;
	hotness: InsightsHotness;
};

export type CreateSkillsHeatmapInput = {
	skill: string;
	industries: SkillsHeatmapIndustries;
	overallDemand: number;
	trend: InsightsSkillTrend;
};

export type CreateCompanyHiringInput = {
	company: string;
	industry: InsightsIndustry;
	openPositions: number;
	hiringGrowth: number;
	avgSalary: number;
	employeeCount: string;
	hiringFreeze: boolean;
};

export type CreateRemoteWorkStatInput = {
	industry: InsightsIndustry;
	fullyRemote: number;
	hybrid: number;
	onsite: number;
	remoteGrowth: number;
};

export type CreateGrowthProjectionInput = {
	industry: InsightsIndustry;
	currentSize: number;
	projectedSize: number;
	growthRate: number;
	timeframe: string;
	keyDrivers: string[];
	risks: string[];
};

export type CreateCompetitiveLandscapeInput = {
	industry: InsightsIndustry;
	totalCompanies: number;
	marketLeaders: string[];
	emergingPlayers: string[];
	avgCompanySize: string;
	barrierToEntry: InsightsBarrier;
};

export type CreateRegionalComparisonInput = {
	region: InsightsRegion;
	totalJobs: number;
	avgSalary: number;
	costOfLivingIndex: number;
	qualityOfLifeScore: number;
	jobGrowthRate: number;
	topIndustries: InsightsIndustry[];
};

export type UpdateUserProfileInput = {
	userId: string;
	targetIndustries?: InsightsIndustry[];
	experienceLevel?: InsightsExperienceLevel;
	preferredRegions?: InsightsRegion[];
	skills?: string[];
	targetSalary?: number;
};

export type SalaryBenchmarkFilters = {
	industry?: InsightsIndustry;
	region?: InsightsRegion;
	experienceLevel?: InsightsExperienceLevel;
};

export type JobDemandFilters = {
	industry?: InsightsIndustry;
};

export type CompanyHiringFilters = {
	industry?: InsightsIndustry;
};

export const insightsService = {
	// ============================================
	// Industry Trends
	// ============================================
	industryTrends: {
		list: async () => {
			return await db.select().from(schema.industryTrend).orderBy(desc(schema.industryTrend.currentDemand));
		},

		getByIndustry: async (industry: InsightsIndustry) => {
			const [trend] = await db.select().from(schema.industryTrend).where(eq(schema.industryTrend.industry, industry));
			return trend ?? null;
		},

		upsert: async (input: CreateIndustryTrendInput): Promise<string> => {
			const existing = await insightsService.industryTrends.getByIndustry(input.industry);

			if (existing) {
				await db
					.update(schema.industryTrend)
					.set({
						currentDemand: input.currentDemand,
						changePercent: input.changePercent,
						trend: input.trend,
						openPositions: input.openPositions,
						avgTimeToHire: input.avgTimeToHire,
						competitionLevel: input.competitionLevel,
					})
					.where(eq(schema.industryTrend.id, existing.id));
				return existing.id;
			}

			const id = generateId();
			await db.insert(schema.industryTrend).values({ id, ...input });
			return id;
		},
	},

	// ============================================
	// Salary Benchmarks
	// ============================================
	salaryBenchmarks: {
		list: async (filters?: SalaryBenchmarkFilters) => {
			const conditions = [];

			if (filters?.industry) {
				conditions.push(eq(schema.salaryBenchmark.industry, filters.industry));
			}
			if (filters?.region) {
				conditions.push(eq(schema.salaryBenchmark.region, filters.region));
			}
			if (filters?.experienceLevel) {
				conditions.push(eq(schema.salaryBenchmark.experienceLevel, filters.experienceLevel));
			}

			if (conditions.length > 0) {
				return await db
					.select()
					.from(schema.salaryBenchmark)
					.where(and(...conditions))
					.orderBy(desc(schema.salaryBenchmark.medianSalary));
			}

			return await db.select().from(schema.salaryBenchmark).orderBy(desc(schema.salaryBenchmark.medianSalary));
		},

		upsert: async (input: CreateSalaryBenchmarkInput): Promise<string> => {
			const [existing] = await db
				.select()
				.from(schema.salaryBenchmark)
				.where(
					and(
						eq(schema.salaryBenchmark.role, input.role),
						eq(schema.salaryBenchmark.industry, input.industry),
						eq(schema.salaryBenchmark.experienceLevel, input.experienceLevel),
						eq(schema.salaryBenchmark.region, input.region),
					),
				);

			if (existing) {
				await db
					.update(schema.salaryBenchmark)
					.set({
						minSalary: input.minSalary,
						maxSalary: input.maxSalary,
						medianSalary: input.medianSalary,
						percentile25: input.percentile25,
						percentile75: input.percentile75,
						yearOverYearChange: input.yearOverYearChange,
					})
					.where(eq(schema.salaryBenchmark.id, existing.id));
				return existing.id;
			}

			const id = generateId();
			await db.insert(schema.salaryBenchmark).values({ id, ...input });
			return id;
		},
	},

	// ============================================
	// Job Demand Indicators
	// ============================================
	jobDemand: {
		list: async (filters?: JobDemandFilters) => {
			if (filters?.industry) {
				return await db
					.select()
					.from(schema.jobDemandIndicator)
					.where(eq(schema.jobDemandIndicator.industry, filters.industry))
					.orderBy(desc(schema.jobDemandIndicator.demandScore));
			}

			return await db.select().from(schema.jobDemandIndicator).orderBy(desc(schema.jobDemandIndicator.demandScore));
		},

		upsert: async (input: CreateJobDemandInput): Promise<string> => {
			const [existing] = await db
				.select()
				.from(schema.jobDemandIndicator)
				.where(
					and(eq(schema.jobDemandIndicator.skill, input.skill), eq(schema.jobDemandIndicator.industry, input.industry)),
				);

			if (existing) {
				await db
					.update(schema.jobDemandIndicator)
					.set({
						demandScore: input.demandScore,
						growthRate: input.growthRate,
						totalJobs: input.totalJobs,
						avgSalaryPremium: input.avgSalaryPremium,
						hotness: input.hotness,
					})
					.where(eq(schema.jobDemandIndicator.id, existing.id));
				return existing.id;
			}

			const id = generateId();
			await db.insert(schema.jobDemandIndicator).values({ id, ...input });
			return id;
		},
	},

	// ============================================
	// Skills Heatmap
	// ============================================
	skillsHeatmap: {
		list: async () => {
			return await db.select().from(schema.skillsHeatmap).orderBy(desc(schema.skillsHeatmap.overallDemand));
		},

		upsert: async (input: CreateSkillsHeatmapInput): Promise<string> => {
			const [existing] = await db
				.select()
				.from(schema.skillsHeatmap)
				.where(eq(schema.skillsHeatmap.skill, input.skill));

			if (existing) {
				await db
					.update(schema.skillsHeatmap)
					.set({
						industries: input.industries,
						overallDemand: input.overallDemand,
						trend: input.trend,
					})
					.where(eq(schema.skillsHeatmap.id, existing.id));
				return existing.id;
			}

			const id = generateId();
			await db.insert(schema.skillsHeatmap).values({ id, ...input });
			return id;
		},
	},

	// ============================================
	// Company Hiring Trends
	// ============================================
	companyHiring: {
		list: async (filters?: CompanyHiringFilters) => {
			if (filters?.industry) {
				return await db
					.select()
					.from(schema.companyHiringTrend)
					.where(eq(schema.companyHiringTrend.industry, filters.industry))
					.orderBy(desc(schema.companyHiringTrend.hiringGrowth));
			}

			return await db.select().from(schema.companyHiringTrend).orderBy(desc(schema.companyHiringTrend.hiringGrowth));
		},

		upsert: async (input: CreateCompanyHiringInput): Promise<string> => {
			const [existing] = await db
				.select()
				.from(schema.companyHiringTrend)
				.where(eq(schema.companyHiringTrend.company, input.company));

			if (existing) {
				await db
					.update(schema.companyHiringTrend)
					.set({
						industry: input.industry,
						openPositions: input.openPositions,
						hiringGrowth: input.hiringGrowth,
						avgSalary: input.avgSalary,
						employeeCount: input.employeeCount,
						hiringFreeze: input.hiringFreeze,
					})
					.where(eq(schema.companyHiringTrend.id, existing.id));
				return existing.id;
			}

			const id = generateId();
			await db.insert(schema.companyHiringTrend).values({ id, ...input });
			return id;
		},
	},

	// ============================================
	// Remote Work Stats
	// ============================================
	remoteWork: {
		list: async () => {
			return await db.select().from(schema.remoteWorkStat).orderBy(desc(schema.remoteWorkStat.remoteGrowth));
		},

		upsert: async (input: CreateRemoteWorkStatInput): Promise<string> => {
			const [existing] = await db
				.select()
				.from(schema.remoteWorkStat)
				.where(eq(schema.remoteWorkStat.industry, input.industry));

			if (existing) {
				await db
					.update(schema.remoteWorkStat)
					.set({
						fullyRemote: input.fullyRemote,
						hybrid: input.hybrid,
						onsite: input.onsite,
						remoteGrowth: input.remoteGrowth,
					})
					.where(eq(schema.remoteWorkStat.id, existing.id));
				return existing.id;
			}

			const id = generateId();
			await db.insert(schema.remoteWorkStat).values({ id, ...input });
			return id;
		},
	},

	// ============================================
	// Growth Projections
	// ============================================
	growthProjections: {
		list: async () => {
			return await db
				.select()
				.from(schema.industryGrowthProjection)
				.orderBy(desc(schema.industryGrowthProjection.growthRate));
		},

		upsert: async (input: CreateGrowthProjectionInput): Promise<string> => {
			const [existing] = await db
				.select()
				.from(schema.industryGrowthProjection)
				.where(eq(schema.industryGrowthProjection.industry, input.industry));

			if (existing) {
				await db
					.update(schema.industryGrowthProjection)
					.set({
						currentSize: input.currentSize,
						projectedSize: input.projectedSize,
						growthRate: input.growthRate,
						timeframe: input.timeframe,
						keyDrivers: input.keyDrivers,
						risks: input.risks,
					})
					.where(eq(schema.industryGrowthProjection.id, existing.id));
				return existing.id;
			}

			const id = generateId();
			await db.insert(schema.industryGrowthProjection).values({ id, ...input });
			return id;
		},
	},

	// ============================================
	// Competitive Landscape
	// ============================================
	competitiveLandscape: {
		list: async () => {
			return await db.select().from(schema.competitiveLandscape).orderBy(schema.competitiveLandscape.industry);
		},

		upsert: async (input: CreateCompetitiveLandscapeInput): Promise<string> => {
			const [existing] = await db
				.select()
				.from(schema.competitiveLandscape)
				.where(eq(schema.competitiveLandscape.industry, input.industry));

			if (existing) {
				await db
					.update(schema.competitiveLandscape)
					.set({
						totalCompanies: input.totalCompanies,
						marketLeaders: input.marketLeaders,
						emergingPlayers: input.emergingPlayers,
						avgCompanySize: input.avgCompanySize,
						barrierToEntry: input.barrierToEntry,
					})
					.where(eq(schema.competitiveLandscape.id, existing.id));
				return existing.id;
			}

			const id = generateId();
			await db.insert(schema.competitiveLandscape).values({ id, ...input });
			return id;
		},
	},

	// ============================================
	// Regional Comparisons
	// ============================================
	regionalComparisons: {
		list: async () => {
			return await db.select().from(schema.regionalComparison).orderBy(desc(schema.regionalComparison.totalJobs));
		},

		upsert: async (input: CreateRegionalComparisonInput): Promise<string> => {
			const [existing] = await db
				.select()
				.from(schema.regionalComparison)
				.where(eq(schema.regionalComparison.region, input.region));

			if (existing) {
				await db
					.update(schema.regionalComparison)
					.set({
						totalJobs: input.totalJobs,
						avgSalary: input.avgSalary,
						costOfLivingIndex: input.costOfLivingIndex,
						qualityOfLifeScore: input.qualityOfLifeScore,
						jobGrowthRate: input.jobGrowthRate,
						topIndustries: input.topIndustries,
					})
					.where(eq(schema.regionalComparison.id, existing.id));
				return existing.id;
			}

			const id = generateId();
			await db.insert(schema.regionalComparison).values({ id, ...input });
			return id;
		},
	},

	// ============================================
	// User Profile
	// ============================================
	userProfile: {
		get: async (userId: string) => {
			const [profile] = await db
				.select()
				.from(schema.userInsightsProfile)
				.where(eq(schema.userInsightsProfile.userId, userId));
			return profile ?? null;
		},

		getOrCreate: async (userId: string) => {
			const existing = await insightsService.userProfile.get(userId);
			if (existing) return existing;

			const id = generateId();
			const [profile] = await db
				.insert(schema.userInsightsProfile)
				.values({
					id,
					userId,
					targetIndustries: [],
					experienceLevel: "mid",
					preferredRegions: [],
					skills: [],
					targetSalary: 0,
				})
				.returning();

			return profile;
		},

		update: async (input: UpdateUserProfileInput): Promise<void> => {
			const existing = await insightsService.userProfile.get(input.userId);

			if (!existing) {
				const id = generateId();
				await db.insert(schema.userInsightsProfile).values({
					id,
					userId: input.userId,
					targetIndustries: input.targetIndustries ?? [],
					experienceLevel: input.experienceLevel ?? "mid",
					preferredRegions: input.preferredRegions ?? [],
					skills: input.skills ?? [],
					targetSalary: input.targetSalary ?? 0,
				});
				return;
			}

			const updateData: Partial<typeof schema.userInsightsProfile.$inferSelect> = {};

			if (input.targetIndustries !== undefined) {
				updateData.targetIndustries = input.targetIndustries;
			}
			if (input.experienceLevel !== undefined) {
				updateData.experienceLevel = input.experienceLevel;
			}
			if (input.preferredRegions !== undefined) {
				updateData.preferredRegions = input.preferredRegions;
			}
			if (input.skills !== undefined) {
				updateData.skills = input.skills;
			}
			if (input.targetSalary !== undefined) {
				updateData.targetSalary = input.targetSalary;
			}

			await db
				.update(schema.userInsightsProfile)
				.set(updateData)
				.where(eq(schema.userInsightsProfile.userId, input.userId));
		},
	},

	// ============================================
	// Statistics
	// ============================================
	getStatistics: async () => {
		const [companiesCount] = await db.select({ count: schema.companyHiringTrend.id }).from(schema.companyHiringTrend);

		// Calculate total open positions
		const trends = await db.select().from(schema.industryTrend);
		const totalPositions = trends.reduce((sum, t) => sum + t.openPositions, 0);

		return {
			totalIndustries: trends.length,
			totalCompaniesTracked: companiesCount?.count ? 1 : 0,
			totalOpenPositions: totalPositions,
		};
	},

	// ============================================
	// Seed If Empty (auto-seed guard)
	// ============================================
	seedIfEmpty: async (): Promise<{ seeded: boolean; message: string }> => {
		const [result] = await db.select({ count: count() }).from(schema.industryTrend);
		const existingCount = Number(result?.count ?? 0);

		if (existingCount > 0) {
			return { seeded: false, message: `Insights data already exists (${existingCount} industry trends found)` };
		}

		await insightsService.seedInitialData();
		return { seeded: true, message: "Insights data seeded successfully with Moroccan market data" };
	},

	// ============================================
	// Seed Initial Data
	// ============================================
	seedInitialData: async () => {
		// Seed industry trends
		const industryTrendsData: CreateIndustryTrendInput[] = [
			{
				industry: "healthcare",
				currentDemand: 87,
				changePercent: 12,
				trend: "up",
				openPositions: 1250,
				avgTimeToHire: 28,
				competitionLevel: "medium",
			},
			{
				industry: "industrial",
				currentDemand: 82,
				changePercent: 8,
				trend: "up",
				openPositions: 980,
				avgTimeToHire: 21,
				competitionLevel: "high",
			},
			{
				industry: "hse",
				currentDemand: 91,
				changePercent: 18,
				trend: "up",
				openPositions: 620,
				avgTimeToHire: 25,
				competitionLevel: "low",
			},
			{
				industry: "tech",
				currentDemand: 95,
				changePercent: 22,
				trend: "up",
				openPositions: 1580,
				avgTimeToHire: 18,
				competitionLevel: "high",
			},
			{
				industry: "automotive",
				currentDemand: 78,
				changePercent: 5,
				trend: "stable",
				openPositions: 450,
				avgTimeToHire: 32,
				competitionLevel: "medium",
			},
			{
				industry: "services",
				currentDemand: 72,
				changePercent: -3,
				trend: "down",
				openPositions: 890,
				avgTimeToHire: 15,
				competitionLevel: "high",
			},
		];

		for (const trend of industryTrendsData) {
			await insightsService.industryTrends.upsert(trend);
		}

		// Seed salary benchmarks
		const salaryBenchmarksData: CreateSalaryBenchmarkInput[] = [
			{
				role: "Infirmier Polyvalent",
				industry: "healthcare",
				experienceLevel: "entry",
				region: "casablanca",
				minSalary: 4500,
				maxSalary: 7000,
				medianSalary: 5500,
				percentile25: 5000,
				percentile75: 6200,
				yearOverYearChange: 6,
			},
			{
				role: "Infirmier Polyvalent",
				industry: "healthcare",
				experienceLevel: "mid",
				region: "casablanca",
				minSalary: 6000,
				maxSalary: 9500,
				medianSalary: 7500,
				percentile25: 6800,
				percentile75: 8500,
				yearOverYearChange: 7,
			},
			{
				role: "Infirmier Polyvalent",
				industry: "healthcare",
				experienceLevel: "senior",
				region: "casablanca",
				minSalary: 8000,
				maxSalary: 14000,
				medianSalary: 10500,
				percentile25: 9200,
				percentile75: 12000,
				yearOverYearChange: 8,
			},
			{
				role: "Responsable HSE",
				industry: "hse",
				experienceLevel: "mid",
				region: "casablanca",
				minSalary: 10000,
				maxSalary: 16000,
				medianSalary: 13000,
				percentile25: 11500,
				percentile75: 14500,
				yearOverYearChange: 12,
			},
			{
				role: "Responsable HSE",
				industry: "hse",
				experienceLevel: "senior",
				region: "casablanca",
				minSalary: 14000,
				maxSalary: 22000,
				medianSalary: 17500,
				percentile25: 15500,
				percentile75: 19500,
				yearOverYearChange: 10,
			},
			{
				role: "Technicien Maintenance",
				industry: "industrial",
				experienceLevel: "entry",
				region: "tanger",
				minSalary: 4000,
				maxSalary: 6500,
				medianSalary: 5000,
				percentile25: 4500,
				percentile75: 5800,
				yearOverYearChange: 5,
			},
			{
				role: "Technicien Maintenance",
				industry: "industrial",
				experienceLevel: "mid",
				region: "tanger",
				minSalary: 5500,
				maxSalary: 9000,
				medianSalary: 7000,
				percentile25: 6200,
				percentile75: 8000,
				yearOverYearChange: 6,
			},
			{
				role: "Ingenieur Process",
				industry: "automotive",
				experienceLevel: "mid",
				region: "tanger",
				minSalary: 9000,
				maxSalary: 15000,
				medianSalary: 12000,
				percentile25: 10500,
				percentile75: 13500,
				yearOverYearChange: 8,
			},
			{
				role: "Developpeur Full Stack",
				industry: "tech",
				experienceLevel: "mid",
				region: "casablanca",
				minSalary: 12000,
				maxSalary: 22000,
				medianSalary: 16000,
				percentile25: 14000,
				percentile75: 18500,
				yearOverYearChange: 15,
			},
			{
				role: "Data Analyst",
				industry: "tech",
				experienceLevel: "entry",
				region: "rabat",
				minSalary: 8000,
				maxSalary: 14000,
				medianSalary: 10500,
				percentile25: 9000,
				percentile75: 12000,
				yearOverYearChange: 18,
			},
		];

		for (const salary of salaryBenchmarksData) {
			await insightsService.salaryBenchmarks.upsert(salary);
		}

		// Seed job demand indicators
		const jobDemandData: CreateJobDemandInput[] = [
			{
				skill: "Gestion HSE",
				industry: "hse",
				demandScore: 95,
				growthRate: 22,
				totalJobs: 580,
				avgSalaryPremium: 18,
				hotness: "fire",
			},
			{
				skill: "Soins d'urgence",
				industry: "healthcare",
				demandScore: 92,
				growthRate: 15,
				totalJobs: 720,
				avgSalaryPremium: 12,
				hotness: "hot",
			},
			{
				skill: "Data Science",
				industry: "tech",
				demandScore: 98,
				growthRate: 35,
				totalJobs: 450,
				avgSalaryPremium: 25,
				hotness: "fire",
			},
			{
				skill: "Maintenance predictive",
				industry: "industrial",
				demandScore: 88,
				growthRate: 18,
				totalJobs: 380,
				avgSalaryPremium: 15,
				hotness: "hot",
			},
			{
				skill: "Cloud Computing",
				industry: "tech",
				demandScore: 96,
				growthRate: 28,
				totalJobs: 520,
				avgSalaryPremium: 22,
				hotness: "fire",
			},
			{
				skill: "Audit securite",
				industry: "hse",
				demandScore: 85,
				growthRate: 20,
				totalJobs: 290,
				avgSalaryPremium: 16,
				hotness: "hot",
			},
			{
				skill: "Electromecanique",
				industry: "industrial",
				demandScore: 82,
				growthRate: 12,
				totalJobs: 420,
				avgSalaryPremium: 10,
				hotness: "warm",
			},
			{
				skill: "Soins palliatifs",
				industry: "healthcare",
				demandScore: 78,
				growthRate: 10,
				totalJobs: 180,
				avgSalaryPremium: 8,
				hotness: "warm",
			},
			{
				skill: "Cybersecurite",
				industry: "tech",
				demandScore: 94,
				growthRate: 32,
				totalJobs: 280,
				avgSalaryPremium: 28,
				hotness: "fire",
			},
			{
				skill: "Lean Manufacturing",
				industry: "automotive",
				demandScore: 80,
				growthRate: 8,
				totalJobs: 210,
				avgSalaryPremium: 12,
				hotness: "warm",
			},
		];

		for (const demand of jobDemandData) {
			await insightsService.jobDemand.upsert(demand);
		}

		// Seed skills heatmap
		const skillsHeatmapData: CreateSkillsHeatmapInput[] = [
			{
				skill: "Python",
				industries: { healthcare: 45, industrial: 35, hse: 25, tech: 95, automotive: 40, services: 55 },
				overallDemand: 92,
				trend: "rising",
			},
			{
				skill: "Normes ISO",
				industries: { healthcare: 60, industrial: 85, hse: 95, tech: 40, automotive: 90, services: 45 },
				overallDemand: 88,
				trend: "stable",
			},
			{
				skill: "Gestion de projet",
				industries: { healthcare: 70, industrial: 80, hse: 75, tech: 85, automotive: 78, services: 90 },
				overallDemand: 85,
				trend: "rising",
			},
			{
				skill: "Communication",
				industries: { healthcare: 90, industrial: 70, hse: 80, tech: 75, automotive: 72, services: 95 },
				overallDemand: 82,
				trend: "stable",
			},
			{
				skill: "Leadership",
				industries: { healthcare: 75, industrial: 78, hse: 82, tech: 80, automotive: 76, services: 85 },
				overallDemand: 80,
				trend: "rising",
			},
			{
				skill: "Advanced Excel",
				industries: { healthcare: 65, industrial: 75, hse: 80, tech: 50, automotive: 70, services: 85 },
				overallDemand: 75,
				trend: "declining",
			},
			{
				skill: "Machine Learning",
				industries: { healthcare: 30, industrial: 45, hse: 20, tech: 90, automotive: 55, services: 35 },
				overallDemand: 78,
				trend: "rising",
			},
			{
				skill: "First Aid",
				industries: { healthcare: 95, industrial: 85, hse: 90, tech: 25, automotive: 80, services: 40 },
				overallDemand: 70,
				trend: "stable",
			},
		];

		for (const skill of skillsHeatmapData) {
			await insightsService.skillsHeatmap.upsert(skill);
		}

		// Seed company hiring trends
		const companyHiringData: CreateCompanyHiringInput[] = [
			{
				company: "OCP Group",
				industry: "industrial",
				openPositions: 245,
				hiringGrowth: 15,
				avgSalary: 12000,
				employeeCount: "21,000+",
				hiringFreeze: false,
			},
			{
				company: "Renault Maroc",
				industry: "automotive",
				openPositions: 180,
				hiringGrowth: 12,
				avgSalary: 10500,
				employeeCount: "9,000+",
				hiringFreeze: false,
			},
			{
				company: "CHU Ibn Rochd",
				industry: "healthcare",
				openPositions: 120,
				hiringGrowth: 8,
				avgSalary: 7500,
				employeeCount: "5,000+",
				hiringFreeze: false,
			},
			{
				company: "Capgemini Maroc",
				industry: "tech",
				openPositions: 320,
				hiringGrowth: 28,
				avgSalary: 15000,
				employeeCount: "3,500+",
				hiringFreeze: false,
			},
			{
				company: "Lafarge Holcim Maroc",
				industry: "industrial",
				openPositions: 85,
				hiringGrowth: 5,
				avgSalary: 11000,
				employeeCount: "2,800+",
				hiringFreeze: false,
			},
			{
				company: "BMCE Bank",
				industry: "services",
				openPositions: 95,
				hiringGrowth: -5,
				avgSalary: 9500,
				employeeCount: "7,200+",
				hiringFreeze: true,
			},
			{
				company: "Clinique Internationale",
				industry: "healthcare",
				openPositions: 65,
				hiringGrowth: 18,
				avgSalary: 8500,
				employeeCount: "1,200+",
				hiringFreeze: false,
			},
			{
				company: "Stellantis Kenitra",
				industry: "automotive",
				openPositions: 210,
				hiringGrowth: 25,
				avgSalary: 9800,
				employeeCount: "4,500+",
				hiringFreeze: false,
			},
		];

		for (const company of companyHiringData) {
			await insightsService.companyHiring.upsert(company);
		}

		// Seed remote work stats
		const remoteWorkData: CreateRemoteWorkStatInput[] = [
			{ industry: "healthcare", fullyRemote: 5, hybrid: 15, onsite: 80, remoteGrowth: 8 },
			{ industry: "industrial", fullyRemote: 3, hybrid: 12, onsite: 85, remoteGrowth: 5 },
			{ industry: "hse", fullyRemote: 8, hybrid: 25, onsite: 67, remoteGrowth: 15 },
			{ industry: "tech", fullyRemote: 35, hybrid: 45, onsite: 20, remoteGrowth: 42 },
			{ industry: "automotive", fullyRemote: 5, hybrid: 18, onsite: 77, remoteGrowth: 10 },
			{ industry: "services", fullyRemote: 22, hybrid: 38, onsite: 40, remoteGrowth: 28 },
		];

		for (const remote of remoteWorkData) {
			await insightsService.remoteWork.upsert(remote);
		}

		// Seed growth projections
		const growthProjectionsData: CreateGrowthProjectionInput[] = [
			{
				industry: "healthcare",
				currentSize: 42000,
				projectedSize: 52000,
				growthRate: 24,
				timeframe: "2025-2028",
				keyDrivers: [
					"Expansion des cliniques privees",
					"Vieillissement de la population",
					"Couverture medicale universelle",
				],
				risks: ["Emigration des professionnels", "Budget sante limite"],
			},
			{
				industry: "industrial",
				currentSize: 85000,
				projectedSize: 102000,
				growthRate: 20,
				timeframe: "2025-2028",
				keyDrivers: ["Industrialisation acceleree", "Nearshoring europeen", "Zones franches en expansion"],
				risks: ["Automatisation", "Dependance aux marches europeens"],
			},
			{
				industry: "hse",
				currentSize: 12000,
				projectedSize: 18000,
				growthRate: 50,
				timeframe: "2025-2028",
				keyDrivers: ["Reglementations plus strictes", "Certifications obligatoires", "Conscience environnementale"],
				risks: ["Manque de formations specialisees", "Concurrence des consultants etrangers"],
			},
			{
				industry: "tech",
				currentSize: 35000,
				projectedSize: 55000,
				growthRate: 57,
				timeframe: "2025-2028",
				keyDrivers: ["Transformation digitale", "Offshoring", "Startups en croissance"],
				risks: ["Fuite des cerveaux", "Concurrence regionale"],
			},
			{
				industry: "automotive",
				currentSize: 28000,
				projectedSize: 35000,
				growthRate: 25,
				timeframe: "2025-2028",
				keyDrivers: ["Vehicules electriques", "Expansion Renault/Stellantis", "Nouveaux equipementiers"],
				risks: ["Transition electrique", "Chaine d'approvisionnement"],
			},
			{
				industry: "services",
				currentSize: 120000,
				projectedSize: 138000,
				growthRate: 15,
				timeframe: "2025-2028",
				keyDrivers: ["Croissance economique", "Tourisme", "Bancarisation"],
				risks: ["Digitalisation des services", "Concurrence internationale"],
			},
		];

		for (const projection of growthProjectionsData) {
			await insightsService.growthProjections.upsert(projection);
		}

		// Seed competitive landscape
		const competitiveLandscapeData: CreateCompetitiveLandscapeInput[] = [
			{
				industry: "healthcare",
				totalCompanies: 2500,
				marketLeaders: ["CHU", "Cliniques privees Akdital", "Hopitaux universitaires"],
				emergingPlayers: ["Telemedecine startups", "Cliniques specialisees", "Laboratoires prives"],
				avgCompanySize: "50-200",
				barrierToEntry: "high",
			},
			{
				industry: "industrial",
				totalCompanies: 8500,
				marketLeaders: ["OCP", "ONEE", "Lafarge Holcim", "Managem"],
				emergingPlayers: ["PME industrielles", "Sous-traitants automobiles"],
				avgCompanySize: "100-500",
				barrierToEntry: "medium",
			},
			{
				industry: "hse",
				totalCompanies: 450,
				marketLeaders: ["Bureau Veritas", "SGS Maroc", "Departements HSE grands groupes"],
				emergingPlayers: ["Consultants independants", "Startups HSE tech"],
				avgCompanySize: "10-50",
				barrierToEntry: "low",
			},
			{
				industry: "tech",
				totalCompanies: 3200,
				marketLeaders: ["Capgemini", "CGI", "Atos", "HPS"],
				emergingPlayers: ["Startups fintech", "Agences digitales", "ESN locales"],
				avgCompanySize: "20-100",
				barrierToEntry: "low",
			},
			{
				industry: "automotive",
				totalCompanies: 280,
				marketLeaders: ["Renault", "Stellantis", "Yazaki", "SNOP"],
				emergingPlayers: ["Equipementiers EV", "Startups mobilite"],
				avgCompanySize: "500-2000",
				barrierToEntry: "high",
			},
			{
				industry: "services",
				totalCompanies: 45000,
				marketLeaders: ["Banques", "Assurances", "Grands cabinets"],
				emergingPlayers: ["Fintechs", "Insurtech", "Neobanques"],
				avgCompanySize: "10-100",
				barrierToEntry: "medium",
			},
		];

		for (const landscape of competitiveLandscapeData) {
			await insightsService.competitiveLandscape.upsert(landscape);
		}

		// Seed regional comparisons
		const regionalComparisonsData: CreateRegionalComparisonInput[] = [
			{
				region: "casablanca",
				totalJobs: 12500,
				avgSalary: 9200,
				costOfLivingIndex: 100,
				qualityOfLifeScore: 72,
				jobGrowthRate: 12,
				topIndustries: ["services", "tech", "healthcare"],
			},
			{
				region: "rabat",
				totalJobs: 5800,
				avgSalary: 8800,
				costOfLivingIndex: 92,
				qualityOfLifeScore: 78,
				jobGrowthRate: 10,
				topIndustries: ["services", "tech", "healthcare"],
			},
			{
				region: "tanger",
				totalJobs: 4200,
				avgSalary: 7800,
				costOfLivingIndex: 78,
				qualityOfLifeScore: 75,
				jobGrowthRate: 22,
				topIndustries: ["automotive", "industrial", "hse"],
			},
			{
				region: "marrakech",
				totalJobs: 2800,
				avgSalary: 7200,
				costOfLivingIndex: 85,
				qualityOfLifeScore: 80,
				jobGrowthRate: 8,
				topIndustries: ["services", "healthcare", "tech"],
			},
			{
				region: "fes",
				totalJobs: 2100,
				avgSalary: 6800,
				costOfLivingIndex: 72,
				qualityOfLifeScore: 74,
				jobGrowthRate: 6,
				topIndustries: ["healthcare", "industrial", "services"],
			},
			{
				region: "agadir",
				totalJobs: 1800,
				avgSalary: 7000,
				costOfLivingIndex: 75,
				qualityOfLifeScore: 82,
				jobGrowthRate: 14,
				topIndustries: ["services", "hse", "industrial"],
			},
			{
				region: "kenitra",
				totalJobs: 1500,
				avgSalary: 7200,
				costOfLivingIndex: 68,
				qualityOfLifeScore: 70,
				jobGrowthRate: 18,
				topIndustries: ["automotive", "industrial", "hse"],
			},
			{
				region: "meknes",
				totalJobs: 1200,
				avgSalary: 6500,
				costOfLivingIndex: 65,
				qualityOfLifeScore: 72,
				jobGrowthRate: 5,
				topIndustries: ["healthcare", "services", "industrial"],
			},
		];

		for (const regional of regionalComparisonsData) {
			await insightsService.regionalComparisons.upsert(regional);
		}
	},
};
