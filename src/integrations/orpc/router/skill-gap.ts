import { z } from "zod";
import { protectedProcedure } from "../context";
import { skillGapService } from "../services/skill-gap";

// ============================================================================
// SCHEMAS
// ============================================================================

const analyzeGapInputSchema = z.object({
	targetRoleId: z.string().min(1, "Target role ID is required"),
});

const getMarketDemandInputSchema = z.object({
	field: z.string().optional(),
});

const suggestResourcesInputSchema = z.object({
	skillId: z.string().min(1, "Skill ID is required"),
});

const estimateTimeInputSchema = z.object({
	skillId: z.string().min(1, "Skill ID is required"),
});

const getIndustryBenchmarksInputSchema = z.object({
	industry: z.string().optional(),
});

// ============================================================================
// ROUTER
// ============================================================================

export const skillGapRouter = {
	/**
	 * Analyze skill gap between user's current skills and target role requirements
	 * AI-powered analysis with detailed insights
	 */
	analyzeGap: protectedProcedure
		.route({
			method: "POST",
			path: "/skill-gap/analyze",
			tags: ["Skill Gap", "AI"],
			summary: "Analyze skill gap for a target role",
			description:
				"Performs AI-powered analysis comparing user's current skills against target role requirements. Returns readiness score, gaps, and personalized recommendations.",
		})
		.input(analyzeGapInputSchema)
		.handler(async ({ context, input }) => {
			return skillGapService.analyzeGap(context.user.id, input.targetRoleId);
		}),

	/**
	 * Get skills in demand from job market data
	 */
	getMarketDemand: protectedProcedure
		.route({
			method: "GET",
			path: "/skill-gap/market-demand",
			tags: ["Skill Gap", "Market"],
			summary: "Get skills in market demand",
			description:
				"Returns list of skills currently in demand based on job market data, including demand scores, growth rates, and salary premiums.",
		})
		.input(getMarketDemandInputSchema)
		.handler(async ({ input }) => {
			return skillGapService.getMarketDemand(input.field);
		}),

	/**
	 * Prioritize skills by impact on employability
	 */
	prioritizeSkills: protectedProcedure
		.route({
			method: "GET",
			path: "/skill-gap/prioritize",
			tags: ["Skill Gap"],
			summary: "Prioritize user's skills by employability impact",
			description:
				"Ranks user's skills based on market demand, growth potential, and current gap. Helps identify which skills to focus on for maximum career impact.",
		})
		.handler(async ({ context }) => {
			return skillGapService.prioritizeSkills(context.user.id);
		}),

	/**
	 * Suggest learning resources for a specific skill
	 */
	suggestResources: protectedProcedure
		.route({
			method: "GET",
			path: "/skill-gap/resources/{skillId}",
			tags: ["Skill Gap", "Learning"],
			summary: "Get learning resource suggestions for a skill",
			description:
				"Returns AI-generated learning resource recommendations for developing a specific skill, including courses, certifications, and practice opportunities.",
		})
		.input(suggestResourcesInputSchema)
		.handler(async ({ context, input }) => {
			return skillGapService.suggestResources(input.skillId, context.user.id);
		}),

	/**
	 * Estimate time to close skill gap
	 */
	estimateTimeToClose: protectedProcedure
		.route({
			method: "GET",
			path: "/skill-gap/time-estimate/{skillId}",
			tags: ["Skill Gap"],
			summary: "Estimate time to reach target skill level",
			description:
				"Calculates estimated time to close skill gap based on skill category, current level, and learning factors. Includes milestones for progress tracking.",
		})
		.input(estimateTimeInputSchema)
		.handler(async ({ context, input }) => {
			return skillGapService.estimateTimeToClose(context.user.id, input.skillId);
		}),

	/**
	 * Get industry benchmarks for skill requirements
	 */
	getIndustryBenchmarks: protectedProcedure
		.route({
			method: "GET",
			path: "/skill-gap/benchmarks",
			tags: ["Skill Gap", "Industry"],
			summary: "Get industry skill benchmarks",
			description:
				"Returns skill requirements and benchmarks by industry, including top skills in demand, salary ranges, and competition levels.",
		})
		.input(getIndustryBenchmarksInputSchema)
		.handler(async ({ input }) => {
			return skillGapService.getIndustryBenchmarks(input.industry);
		}),
};
