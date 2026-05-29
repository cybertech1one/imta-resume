import { z } from "zod";
import { adminProcedure, protectedProcedure, publicProcedure } from "../context";
import {
	employerDatabaseService,
	jobMatchService,
	marketAnalyticsService,
	regionalStatsService,
	salaryDataService,
	skillDemandService,
} from "../services/market-intelligence";

// ============================================================================
// SALARY DATA ROUTER
// ============================================================================

const marketSalaryRouter = {
	// List salary data
	list: publicProcedure
		.route({
			method: "GET",
			path: "/market/salaries",
			tags: ["Market Intelligence"],
			summary: "List salary benchmarks",
		})
		.input(
			z
				.object({
					field: z.string().optional(),
					region: z.string().optional(),
					experienceLevel: z.string().optional(),
				})
				.optional(),
		)
		.handler(async ({ input }) => {
			return salaryDataService.list(input);
		}),

	// Get salary by role
	getByRole: publicProcedure
		.route({
			method: "GET",
			path: "/market/salaries/role/{role}",
			tags: ["Market Intelligence"],
			summary: "Get salary by role",
		})
		.input(z.object({ role: z.string(), region: z.string().optional() }))
		.handler(async ({ input }) => {
			return salaryDataService.getByRole(input.role, input.region);
		}),

	// Predict salary
	predict: protectedProcedure
		.route({
			method: "POST",
			path: "/market/salaries/predict",
			tags: ["Market Intelligence"],
			summary: "Predict salary based on profile",
		})
		.input(
			z.object({
				field: z.string(),
				role: z.string(),
				experienceLevel: z.string(),
				region: z.string().optional(),
				skills: z.array(z.string()).optional(),
			}),
		)
		.handler(async ({ input }) => {
			return salaryDataService.predictSalary(input);
		}),

	// Seed salary data (admin)
	seed: adminProcedure
		.route({
			method: "POST",
			path: "/market/salaries/seed",
			tags: ["Market Intelligence", "Admin"],
			summary: "Seed salary data",
		})
		.handler(async () => {
			return salaryDataService.seed();
		}),
};

// ============================================================================
// SKILL DEMAND ROUTER
// ============================================================================

const marketSkillsRouter = {
	// List skills
	list: publicProcedure
		.route({
			method: "GET",
			path: "/market/skills",
			tags: ["Market Intelligence"],
			summary: "List skill demand data",
		})
		.input(
			z
				.object({
					field: z.string().optional(),
					category: z.string().optional(),
				})
				.optional(),
		)
		.handler(async ({ input }) => {
			return skillDemandService.list(input);
		}),

	// Get top skills
	getTop: publicProcedure
		.route({
			method: "GET",
			path: "/market/skills/top",
			tags: ["Market Intelligence"],
			summary: "Get top in-demand skills",
		})
		.input(z.object({ field: z.string().optional(), limit: z.number().optional() }).optional())
		.handler(async ({ input }) => {
			return skillDemandService.getTopSkills(input?.field, input?.limit);
		}),

	// Get rising skills
	getRising: publicProcedure
		.route({
			method: "GET",
			path: "/market/skills/rising",
			tags: ["Market Intelligence"],
			summary: "Get rising skills",
		})
		.input(z.object({ limit: z.number().optional() }).optional())
		.handler(async ({ input }) => {
			return skillDemandService.getRisingSkills(input?.limit);
		}),

	// Seed skills data (admin)
	seed: adminProcedure
		.route({
			method: "POST",
			path: "/market/skills/seed",
			tags: ["Market Intelligence", "Admin"],
			summary: "Seed skills data",
		})
		.handler(async () => {
			return skillDemandService.seed();
		}),
};

// ============================================================================
// REGIONAL STATS ROUTER
// ============================================================================

const marketRegionsRouter = {
	// List regions
	list: publicProcedure
		.route({
			method: "GET",
			path: "/market/regions",
			tags: ["Market Intelligence"],
			summary: "List regional job statistics",
		})
		.handler(async () => {
			return regionalStatsService.list();
		}),

	// Get by region
	get: publicProcedure
		.route({
			method: "GET",
			path: "/market/regions/{region}",
			tags: ["Market Intelligence"],
			summary: "Get regional statistics",
		})
		.input(z.object({ region: z.string() }))
		.handler(async ({ input }) => {
			return regionalStatsService.getByRegion(input.region);
		}),

	// Seed regions (admin)
	seed: adminProcedure
		.route({
			method: "POST",
			path: "/market/regions/seed",
			tags: ["Market Intelligence", "Admin"],
			summary: "Seed regional data",
		})
		.handler(async () => {
			return regionalStatsService.seed();
		}),
};

// ============================================================================
// EMPLOYER DATABASE ROUTER
// ============================================================================

const marketEmployersRouter = {
	// List employers
	list: publicProcedure
		.route({
			method: "GET",
			path: "/market/employers",
			tags: ["Market Intelligence"],
			summary: "List employers in database",
		})
		.input(
			z
				.object({
					industry: z.string().optional(),
					headquarters: z.string().optional(),
					isActive: z.boolean().optional(),
				})
				.optional(),
		)
		.handler(async ({ input }) => {
			return employerDatabaseService.list(input);
		}),

	// Get by ID
	get: publicProcedure
		.route({
			method: "GET",
			path: "/market/employers/{id}",
			tags: ["Market Intelligence"],
			summary: "Get employer by ID",
		})
		.input(z.object({ id: z.string().uuid() }))
		.handler(async ({ input }) => {
			return employerDatabaseService.getById(input.id);
		}),

	// Search employers
	search: publicProcedure
		.route({
			method: "GET",
			path: "/market/employers/search",
			tags: ["Market Intelligence"],
			summary: "Search employers",
		})
		.input(z.object({ query: z.string() }))
		.handler(async ({ input }) => {
			return employerDatabaseService.search(input.query);
		}),

	// Seed employers (admin)
	seed: adminProcedure
		.route({
			method: "POST",
			path: "/market/employers/seed",
			tags: ["Market Intelligence", "Admin"],
			summary: "Seed employer data",
		})
		.handler(async () => {
			return employerDatabaseService.seed();
		}),
};

// ============================================================================
// JOB MATCH ROUTER
// ============================================================================

const marketJobMatchRouter = {
	// Calculate job match score
	calculate: protectedProcedure
		.route({
			method: "POST",
			path: "/market/job-match",
			tags: ["Market Intelligence"],
			summary: "Calculate job match score",
		})
		.input(
			z.object({
				userProfile: z.object({
					skills: z.array(z.string()),
					experienceLevel: z.string(),
					preferredLocations: z.array(z.string()),
					salaryExpectation: z
						.object({
							min: z.number(),
							max: z.number(),
						})
						.optional(),
					field: z.string().optional(),
				}),
				job: z.object({
					skills: z.array(z.string()),
					experienceLevel: z.string(),
					location: z.string(),
					salaryMin: z.number().optional(),
					salaryMax: z.number().optional(),
					field: z.string().optional(),
				}),
			}),
		)
		.handler(async ({ input }) => {
			return jobMatchService.calculateMatchScore(input.userProfile, input.job);
		}),
};

// ============================================================================
// MARKET ANALYTICS ROUTER
// ============================================================================

const marketAnalyticsRouter = {
	// Get market overview
	overview: publicProcedure
		.route({
			method: "GET",
			path: "/market/analytics/overview",
			tags: ["Market Intelligence"],
			summary: "Get comprehensive market overview",
		})
		.handler(async () => {
			return marketAnalyticsService.getMarketOverview();
		}),

	// Get salary comparison
	salaryComparison: publicProcedure
		.route({
			method: "GET",
			path: "/market/analytics/salary-comparison",
			tags: ["Market Intelligence"],
			summary: "Get salary comparison data",
		})
		.input(
			z
				.object({
					field: z.string().optional(),
					experienceLevel: z.string().optional(),
				})
				.optional(),
		)
		.handler(async ({ input }) => {
			return marketAnalyticsService.getSalaryComparison(input?.field, input?.experienceLevel);
		}),

	// Get personalized insights
	personalizedInsights: protectedProcedure
		.route({
			method: "POST",
			path: "/market/analytics/personalized",
			tags: ["Market Intelligence"],
			summary: "Get personalized career insights",
		})
		.input(
			z.object({
				skills: z.array(z.string()),
				field: z.string().optional(),
				experienceLevel: z.string().optional(),
				region: z.string().optional(),
				targetSalary: z.number().optional(),
			}),
		)
		.handler(async ({ input }) => {
			return marketAnalyticsService.getPersonalizedInsights(input);
		}),

	// Get career progression
	careerProgression: publicProcedure
		.route({
			method: "GET",
			path: "/market/analytics/career-progression",
			tags: ["Market Intelligence"],
			summary: "Get career progression timeline",
		})
		.input(
			z.object({
				role: z.string(),
				field: z.string().optional(),
			}),
		)
		.handler(async ({ input }) => {
			return marketAnalyticsService.getCareerProgression(input.role, input.field);
		}),

	// Get industry trends
	industryTrends: publicProcedure
		.route({
			method: "GET",
			path: "/market/analytics/trends",
			tags: ["Market Intelligence"],
			summary: "Get industry trends and news",
		})
		.handler(async () => {
			return marketAnalyticsService.getIndustryTrends();
		}),
};

// ============================================================================
// COMBINED MARKET INTELLIGENCE ROUTER
// ============================================================================

export const marketIntelligenceRouter = {
	salaries: marketSalaryRouter,
	skills: marketSkillsRouter,
	regions: marketRegionsRouter,
	employers: marketEmployersRouter,
	jobMatch: marketJobMatchRouter,
	analytics: marketAnalyticsRouter,
};
