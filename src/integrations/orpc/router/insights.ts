import z from "zod";
import { adminProcedure, protectedProcedure, publicProcedure } from "../context";
import { insightsService } from "../services/insights";

// Enum schemas
const industrySchema = z.enum(["healthcare", "industrial", "hse", "tech", "automotive", "services"]);
const experienceLevelSchema = z.enum(["entry", "mid", "senior", "executive"]);
const regionSchema = z.enum(["casablanca", "rabat", "tanger", "marrakech", "fes", "agadir", "kenitra", "meknes"]);
const trendSchema = z.enum(["up", "down", "stable"]);
const competitionSchema = z.enum(["low", "medium", "high"]);
const hotnessSchema = z.enum(["cold", "warm", "hot", "fire"]);
const skillTrendSchema = z.enum(["rising", "stable", "declining"]);
const barrierSchema = z.enum(["low", "medium", "high"]);

// Output schemas
const industryTrendSchema = z.object({
	id: z.string().uuid(),
	industry: industrySchema,
	currentDemand: z.number(),
	changePercent: z.number(),
	trend: trendSchema,
	openPositions: z.number(),
	avgTimeToHire: z.number(),
	competitionLevel: competitionSchema,
	createdAt: z.coerce.date(),
	updatedAt: z.coerce.date(),
});

const salaryBenchmarkSchema = z.object({
	id: z.string(),
	role: z.string(),
	industry: industrySchema,
	experienceLevel: experienceLevelSchema,
	region: regionSchema,
	minSalary: z.number(),
	maxSalary: z.number(),
	medianSalary: z.number(),
	percentile25: z.number(),
	percentile75: z.number(),
	yearOverYearChange: z.number(),
	createdAt: z.coerce.date(),
	updatedAt: z.coerce.date(),
});

const jobDemandIndicatorSchema = z.object({
	id: z.string(),
	skill: z.string(),
	industry: industrySchema,
	demandScore: z.number(),
	growthRate: z.number(),
	totalJobs: z.number(),
	avgSalaryPremium: z.number(),
	hotness: hotnessSchema,
	createdAt: z.coerce.date(),
	updatedAt: z.coerce.date(),
});

const skillsHeatmapIndustriesSchema = z.record(industrySchema, z.number());

const skillsHeatmapSchema = z.object({
	id: z.string(),
	skill: z.string(),
	industries: skillsHeatmapIndustriesSchema,
	overallDemand: z.number(),
	trend: skillTrendSchema,
	createdAt: z.coerce.date(),
	updatedAt: z.coerce.date(),
});

const companyHiringTrendSchema = z.object({
	id: z.string(),
	company: z.string(),
	industry: industrySchema,
	openPositions: z.number(),
	hiringGrowth: z.number(),
	avgSalary: z.number(),
	employeeCount: z.string(),
	hiringFreeze: z.boolean(),
	createdAt: z.coerce.date(),
	updatedAt: z.coerce.date(),
});

const remoteWorkStatSchema = z.object({
	id: z.string().uuid(),
	industry: industrySchema,
	fullyRemote: z.number(),
	hybrid: z.number(),
	onsite: z.number(),
	remoteGrowth: z.number(),
	createdAt: z.coerce.date(),
	updatedAt: z.coerce.date(),
});

const industryGrowthProjectionSchema = z.object({
	id: z.string().uuid(),
	industry: industrySchema,
	currentSize: z.number(),
	projectedSize: z.number(),
	growthRate: z.number(),
	timeframe: z.string(),
	keyDrivers: z.array(z.string()),
	risks: z.array(z.string()),
	createdAt: z.coerce.date(),
	updatedAt: z.coerce.date(),
});

const competitiveLandscapeSchema = z.object({
	id: z.string().uuid(),
	industry: industrySchema,
	totalCompanies: z.number(),
	marketLeaders: z.array(z.string()),
	emergingPlayers: z.array(z.string()),
	avgCompanySize: z.string(),
	barrierToEntry: barrierSchema,
	createdAt: z.coerce.date(),
	updatedAt: z.coerce.date(),
});

const regionalComparisonSchema = z.object({
	id: z.string().uuid(),
	region: regionSchema,
	totalJobs: z.number(),
	avgSalary: z.number(),
	costOfLivingIndex: z.number(),
	qualityOfLifeScore: z.number(),
	jobGrowthRate: z.number(),
	topIndustries: z.array(industrySchema),
	createdAt: z.coerce.date(),
	updatedAt: z.coerce.date(),
});

const userInsightsProfileSchema = z.object({
	id: z.string().uuid(),
	userId: z.string(),
	targetIndustries: z.array(industrySchema),
	experienceLevel: experienceLevelSchema,
	preferredRegions: z.array(regionSchema),
	skills: z.array(z.string()),
	targetSalary: z.number(),
	createdAt: z.coerce.date(),
	updatedAt: z.coerce.date(),
});

export const insightsRouter = {
	// ============================================
	// Industry Trends
	// ============================================
	listIndustryTrends: publicProcedure
		.route({
			method: "GET",
			path: "/insights/industry-trends",
			tags: ["Insights"],
			summary: "List all industry trends",
		})
		.output(z.array(industryTrendSchema))
		.handler(async () => {
			return await insightsService.industryTrends.list();
		}),

	// ============================================
	// Salary Benchmarks
	// ============================================
	listSalaryBenchmarks: publicProcedure
		.route({
			method: "GET",
			path: "/insights/salary-benchmarks",
			tags: ["Insights"],
			summary: "List salary benchmarks with optional filters",
		})
		.input(
			z
				.object({
					industry: industrySchema.optional(),
					region: regionSchema.optional(),
					experienceLevel: experienceLevelSchema.optional(),
				})
				.optional()
				.default({}),
		)
		.output(z.array(salaryBenchmarkSchema))
		.handler(async ({ input }) => {
			return await insightsService.salaryBenchmarks.list(input);
		}),

	// ============================================
	// Job Demand Indicators
	// ============================================
	listJobDemand: publicProcedure
		.route({
			method: "GET",
			path: "/insights/job-demand",
			tags: ["Insights"],
			summary: "List job demand indicators with optional filters",
		})
		.input(
			z
				.object({
					industry: industrySchema.optional(),
				})
				.optional()
				.default({}),
		)
		.output(z.array(jobDemandIndicatorSchema))
		.handler(async ({ input }) => {
			return await insightsService.jobDemand.list(input);
		}),

	// ============================================
	// Skills Heatmap
	// ============================================
	listSkillsHeatmap: publicProcedure
		.route({
			method: "GET",
			path: "/insights/skills-heatmap",
			tags: ["Insights"],
			summary: "List skills heatmap data",
		})
		.output(z.array(skillsHeatmapSchema))
		.handler(async () => {
			return await insightsService.skillsHeatmap.list();
		}),

	// ============================================
	// Company Hiring Trends
	// ============================================
	listCompanyHiring: publicProcedure
		.route({
			method: "GET",
			path: "/insights/company-hiring",
			tags: ["Insights"],
			summary: "List company hiring trends with optional filters",
		})
		.input(
			z
				.object({
					industry: industrySchema.optional(),
				})
				.optional()
				.default({}),
		)
		.output(z.array(companyHiringTrendSchema))
		.handler(async ({ input }) => {
			return await insightsService.companyHiring.list(input);
		}),

	// ============================================
	// Remote Work Stats
	// ============================================
	listRemoteWorkStats: publicProcedure
		.route({
			method: "GET",
			path: "/insights/remote-work",
			tags: ["Insights"],
			summary: "List remote work statistics",
		})
		.output(z.array(remoteWorkStatSchema))
		.handler(async () => {
			return await insightsService.remoteWork.list();
		}),

	// ============================================
	// Growth Projections
	// ============================================
	listGrowthProjections: publicProcedure
		.route({
			method: "GET",
			path: "/insights/growth-projections",
			tags: ["Insights"],
			summary: "List industry growth projections",
		})
		.output(z.array(industryGrowthProjectionSchema))
		.handler(async () => {
			return await insightsService.growthProjections.list();
		}),

	// ============================================
	// Competitive Landscape
	// ============================================
	listCompetitiveLandscape: publicProcedure
		.route({
			method: "GET",
			path: "/insights/competitive-landscape",
			tags: ["Insights"],
			summary: "List competitive landscape data",
		})
		.output(z.array(competitiveLandscapeSchema))
		.handler(async () => {
			return await insightsService.competitiveLandscape.list();
		}),

	// ============================================
	// Regional Comparisons
	// ============================================
	listRegionalComparisons: publicProcedure
		.route({
			method: "GET",
			path: "/insights/regional-comparisons",
			tags: ["Insights"],
			summary: "List regional comparison data",
		})
		.output(z.array(regionalComparisonSchema))
		.handler(async () => {
			return await insightsService.regionalComparisons.list();
		}),

	// ============================================
	// User Profile (Protected)
	// ============================================
	getUserProfile: protectedProcedure
		.route({
			method: "GET",
			path: "/insights/user-profile",
			tags: ["Insights"],
			summary: "Get user's insights profile",
		})
		.output(userInsightsProfileSchema.nullable())
		.handler(async ({ context }) => {
			return await insightsService.userProfile.get(context.user.id);
		}),

	getOrCreateUserProfile: protectedProcedure
		.route({
			method: "POST",
			path: "/insights/user-profile/init",
			tags: ["Insights"],
			summary: "Get or create user's insights profile",
		})
		.output(userInsightsProfileSchema)
		.handler(async ({ context }) => {
			return await insightsService.userProfile.getOrCreate(context.user.id);
		}),

	updateUserProfile: protectedProcedure
		.route({
			method: "PUT",
			path: "/insights/user-profile",
			tags: ["Insights"],
			summary: "Update user's insights profile",
		})
		.input(
			z.object({
				targetIndustries: z.array(industrySchema).optional(),
				experienceLevel: experienceLevelSchema.optional(),
				preferredRegions: z.array(regionSchema).optional(),
				skills: z.array(z.string()).optional(),
				targetSalary: z.number().optional(),
			}),
		)
		.output(z.void())
		.handler(async ({ context, input }) => {
			await insightsService.userProfile.update({
				userId: context.user.id,
				...input,
			});
		}),

	// ============================================
	// Statistics
	// ============================================
	getStatistics: publicProcedure
		.route({
			method: "GET",
			path: "/insights/statistics",
			tags: ["Insights"],
			summary: "Get insights statistics",
		})
		.output(
			z.object({
				totalIndustries: z.number(),
				totalCompaniesTracked: z.number(),
				totalOpenPositions: z.number(),
			}),
		)
		.handler(async () => {
			return await insightsService.getStatistics();
		}),

	// ============================================
	// Seed Data (Protected - Admin only in production)
	// ============================================
	seedData: protectedProcedure
		.route({
			method: "POST",
			path: "/insights/seed",
			tags: ["Insights"],
			summary: "Seed initial insights data",
		})
		.output(z.void())
		.handler(async () => {
			await insightsService.seedInitialData();
		}),

	// ============================================
	// Seed If Empty (Admin only - auto-seed guard)
	// ============================================
	seedIfEmpty: adminProcedure
		.route({
			method: "POST",
			path: "/insights/seed-if-empty",
			tags: ["Insights"],
			summary: "Seed insights data only if database is empty (admin only)",
		})
		.output(
			z.object({
				seeded: z.boolean(),
				message: z.string(),
			}),
		)
		.handler(async () => {
			return await insightsService.seedIfEmpty();
		}),

	// ============================================
	// Fetch All Data (for the component)
	// ============================================
	getAllData: publicProcedure
		.route({
			method: "GET",
			path: "/insights/all",
			tags: ["Insights"],
			summary: "Fetch all insights data in one call",
		})
		.output(
			z.object({
				industryTrends: z.array(industryTrendSchema),
				salaryBenchmarks: z.array(salaryBenchmarkSchema),
				jobDemandIndicators: z.array(jobDemandIndicatorSchema),
				skillsHeatmap: z.array(skillsHeatmapSchema),
				companyHiringTrends: z.array(companyHiringTrendSchema),
				remoteWorkStats: z.array(remoteWorkStatSchema),
				growthProjections: z.array(industryGrowthProjectionSchema),
				competitiveLandscapes: z.array(competitiveLandscapeSchema),
				regionalComparisons: z.array(regionalComparisonSchema),
			}),
		)
		.handler(async () => {
			const [
				industryTrends,
				salaryBenchmarks,
				jobDemandIndicators,
				skillsHeatmap,
				companyHiringTrends,
				remoteWorkStats,
				growthProjections,
				competitiveLandscapes,
				regionalComparisons,
			] = await Promise.all([
				insightsService.industryTrends.list(),
				insightsService.salaryBenchmarks.list(),
				insightsService.jobDemand.list(),
				insightsService.skillsHeatmap.list(),
				insightsService.companyHiring.list(),
				insightsService.remoteWork.list(),
				insightsService.growthProjections.list(),
				insightsService.competitiveLandscape.list(),
				insightsService.regionalComparisons.list(),
			]);

			return {
				industryTrends,
				salaryBenchmarks,
				jobDemandIndicators,
				skillsHeatmap,
				companyHiringTrends,
				remoteWorkStats,
				growthProjections,
				competitiveLandscapes,
				regionalComparisons,
			};
		}),
};
