import { createAnthropic } from "@ai-sdk/anthropic";
import { createDeepSeek } from "@ai-sdk/deepseek";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createGroq } from "@ai-sdk/groq";
import { createMistral } from "@ai-sdk/mistral";
import { createOpenAI } from "@ai-sdk/openai";
import { createTogetherAI } from "@ai-sdk/togetherai";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { ORPCError } from "@orpc/server";
import { createGateway, generateText } from "ai";
import { createOllama } from "ai-sdk-ollama";
import { and, desc, eq, or } from "drizzle-orm";
import { match } from "ts-pattern";
import { validateAiOutput } from "@/integrations/ai/sanitize";
import { db } from "@/integrations/drizzle/client";
import {
	careerRoleRequirement,
	careerRoleSkill,
	gapAnalysis,
	industryTrend,
	jobDemandIndicator,
	skillLibrary,
	skillsHeatmap,
} from "@/integrations/drizzle/schema";
import { generateId } from "@/utils/string";
import { aiConfigService } from "./ai-config";
import { aiHistoryService } from "./ai-history";
import { userSettingsService } from "./user-settings";

// ============================================================================
// AI MODEL SETUP
// ============================================================================

type AIProvider =
	| "ollama"
	| "openai"
	| "gemini"
	| "anthropic"
	| "vercel-ai-gateway"
	| "deepseek"
	| "groq"
	| "mistral"
	| "togetherai"
	| "openrouter";

type GetModelInput = {
	provider: AIProvider;
	model: string;
	apiKey: string;
	baseURL: string;
};

function getModel(input: GetModelInput) {
	const { provider, model, apiKey } = input;
	const baseURL = input.baseURL || undefined;

	return match(provider)
		.with("openai", () => createOpenAI({ apiKey, baseURL }).languageModel(model))
		.with("ollama", () => createOllama({ apiKey, baseURL }).languageModel(model))
		.with("anthropic", () => createAnthropic({ apiKey, baseURL }).languageModel(model))
		.with("vercel-ai-gateway", () => createGateway({ apiKey, baseURL }).languageModel(model))
		.with("gemini", () => createGoogleGenerativeAI({ apiKey, baseURL }).languageModel(model))
		.with("deepseek", () => createDeepSeek({ apiKey, baseURL }).languageModel(model))
		.with("groq", () => createGroq({ apiKey, baseURL }).languageModel(model))
		.with("mistral", () => createMistral({ apiKey, baseURL }).languageModel(model))
		.with("togetherai", () => createTogetherAI({ apiKey, baseURL }).languageModel(model))
		.with("openrouter", () => createOpenRouter({ apiKey, baseURL }).languageModel(model))
		.exhaustive();
}

async function getServerModel() {
	let config: Awaited<ReturnType<typeof aiConfigService.getActiveProvider>>;
	try {
		config = await aiConfigService.getActiveProvider();
	} catch {
		throw new ORPCError("PRECONDITION_FAILED", {
			message: "No AI provider configured. Please ask an administrator to set up AI.",
		});
	}
	return {
		model: getModel({
			provider: config.provider as AIProvider,
			model: config.model,
			apiKey: config.apiKey,
			baseURL: config.baseUrl || "",
		}),
		config,
	};
}

// ============================================================================
// TYPES
// ============================================================================

export type SkillCategory = "technical" | "soft" | "languages" | "certifications" | "tools";
export type SkillImportance = "critical" | "important" | "nice-to-have";

export type SkillGapItem = {
	skillId: string;
	skillName: string;
	skillNameFr?: string;
	category: SkillCategory;
	currentLevel: number;
	requiredLevel: number;
	industryBenchmark: number;
	gapSize: number;
	priority: number;
	importance: SkillImportance;
	timeToClose: number; // Estimated weeks
	demandScore: number;
	growthRate: number;
};

export type SkillGapAnalysis = {
	userId: string;
	targetRoleId: string;
	targetRoleName: string;
	targetRoleNameFr?: string;
	targetRoleField: string;
	analysisDate: Date;
	readinessScore: number;
	totalSkills: number;
	skillsCovered: number;
	skillsToImprove: number;
	criticalGaps: number;
	estimatedWeeksTotal: number;
	gaps: SkillGapItem[];
	recommendations: string[];
	aiInsights?: string;
};

export type MarketDemandSkill = {
	skillName: string;
	skillNameFr?: string;
	demandScore: number;
	growthRate: number;
	totalJobs: number;
	avgSalaryPremium: number;
	hotness: "fire" | "hot" | "warm" | "cold";
	industries: string[];
	trend: "rising" | "stable" | "declining";
};

export type PrioritizedSkill = {
	skillId: string;
	skillName: string;
	skillNameFr?: string;
	category: SkillCategory;
	currentLevel: number;
	targetLevel: number;
	priorityScore: number;
	priorityRank: number;
	reasons: string[];
	impactOnEmployability: "high" | "medium" | "low";
	marketDemand: number;
	timeToAcquire: number;
	learningResourcesCount: number;
};

export type LearningResource = {
	id: string;
	title: string;
	titleFr?: string;
	type: "course" | "book" | "certification" | "tutorial" | "practice" | "mentorship" | "video" | "article";
	platform: string;
	url?: string;
	duration?: string;
	cost: "free" | "paid" | "subscription";
	difficulty: "beginner" | "intermediate" | "advanced";
	rating?: number;
	relevanceScore: number;
};

export type TimeEstimate = {
	skillId: string;
	skillName: string;
	skillNameFr?: string;
	currentLevel: number;
	targetLevel: number;
	estimatedWeeks: number;
	estimatedHours: number;
	confidenceLevel: "high" | "medium" | "low";
	factors: {
		baseTime: number;
		categoryMultiplier: number;
		gapMultiplier: number;
		complexityBonus: number;
	};
	milestones: {
		level: number;
		weeksFromStart: number;
		description: string;
		descriptionFr?: string;
	}[];
};

export type IndustryBenchmark = {
	industry: string;
	industryFr?: string;
	totalPositions: number;
	avgSalaryRange: { min: number; max: number };
	topSkills: {
		name: string;
		nameFr?: string;
		averageLevel: number;
		demandScore: number;
	}[];
	growthRate: number;
	competitionLevel: "low" | "medium" | "high";
	entryBarrier: "low" | "medium" | "high";
	remoteWorkPercent: number;
};

// ============================================================================
// SERVICE
// ============================================================================

// Time estimates per level per category (in weeks)
const WEEKS_PER_LEVEL: Record<SkillCategory, number> = {
	technical: 8,
	soft: 6,
	languages: 12,
	certifications: 4,
	tools: 4,
};

// Hours per week assumption
const HOURS_PER_WEEK = 10;

export const skillGapService = {
	/**
	 * Analyze gap between user's current skills and target role requirements
	 * AI-powered analysis with detailed insights
	 */
	async analyzeGap(userId: string, targetRoleId: string): Promise<SkillGapAnalysis> {
		// Get target role
		const [role] = await db
			.select()
			.from(careerRoleRequirement)
			.where(and(eq(careerRoleRequirement.id, targetRoleId), eq(careerRoleRequirement.isActive, true)));

		if (!role) {
			throw new ORPCError("NOT_FOUND", { message: "Target role not found" });
		}

		// Get required skills for the role
		const requiredSkills = await db
			.select()
			.from(careerRoleSkill)
			.where(eq(careerRoleSkill.roleId, targetRoleId))
			.orderBy(desc(careerRoleSkill.importance));

		// Get user's current skills from gap analysis
		const [userGapData] = await db.select().from(gapAnalysis).where(eq(gapAnalysis.userId, userId));

		const currentSkills = userGapData?.currentSkills ?? [];

		// Get market demand data for skills
		const demandData = await db.select().from(jobDemandIndicator);
		const demandMap = new Map(demandData.map((d) => [d.skill.toLowerCase(), d]));

		// Calculate gaps
		const gaps: SkillGapItem[] = requiredSkills.map((required) => {
			const currentSkill = currentSkills.find(
				(s) =>
					s.name.toLowerCase() === required.skillName.toLowerCase() ||
					(s.nameFr && required.skillNameFr && s.nameFr.toLowerCase() === required.skillNameFr.toLowerCase()),
			);

			const currentLevel = currentSkill?.currentLevel ?? 0;
			const requiredLevel = required.requiredLevel ?? 3;
			const gapSize = Math.max(0, requiredLevel - currentLevel);
			const category = (required.category ?? "technical") as SkillCategory;
			const importance = (required.importance ?? "important") as SkillImportance;

			// Get market demand for this skill
			const demand = demandMap.get(required.skillName.toLowerCase());

			// Calculate priority: importance weight * gap size * demand factor
			const importanceWeight = importance === "critical" ? 3 : importance === "important" ? 2 : 1;
			const demandFactor = demand ? demand.demandScore / 100 + 1 : 1;
			const priority = Math.round(gapSize * importanceWeight * demandFactor * 10);

			// Estimate time to close gap
			const timeToClose = Math.ceil(gapSize * WEEKS_PER_LEVEL[category]);

			return {
				skillId: required.id,
				skillName: required.skillName,
				skillNameFr: required.skillNameFr ?? undefined,
				category,
				currentLevel,
				requiredLevel,
				industryBenchmark: Number.parseFloat(required.industryBenchmark ?? "3.0"),
				gapSize,
				priority,
				importance,
				timeToClose,
				demandScore: demand?.demandScore ?? 50,
				growthRate: demand?.growthRate ?? 0,
			};
		});

		// Sort by priority (descending)
		gaps.sort((a, b) => b.priority - a.priority);

		// Calculate metrics
		const totalSkills = gaps.length;
		const skillsCovered = gaps.filter((g) => g.currentLevel >= g.requiredLevel).length;
		const skillsToImprove = gaps.filter((g) => g.gapSize > 0).length;
		const criticalGaps = gaps.filter((g) => g.gapSize > 0 && g.importance === "critical").length;
		const totalRequired = gaps.reduce((sum, g) => sum + g.requiredLevel, 0);
		const totalCurrent = gaps.reduce((sum, g) => sum + g.currentLevel, 0);
		const readinessScore = totalRequired > 0 ? Math.round((totalCurrent / totalRequired) * 100) : 0;
		const estimatedWeeksTotal = Math.max(...gaps.map((g) => g.timeToClose), 0);

		// Generate recommendations
		const recommendations: string[] = [];
		const topGaps = gaps.filter((g) => g.gapSize > 0).slice(0, 5);

		if (criticalGaps > 0) {
			recommendations.push(`Priority: ${criticalGaps} critical skill(s) to develop urgently.`);
		}

		topGaps.forEach((gap) => {
			const demandText = gap.demandScore > 80 ? " (high demand)" : gap.demandScore > 60 ? " (growing demand)" : "";
			recommendations.push(
				`Improve "${gap.skillName}" from level ${gap.currentLevel} to ${gap.requiredLevel}${demandText}.`,
			);
		});

		if (readinessScore >= 80) {
			recommendations.push("Excellent! You are almost ready for this role. Keep refining your skills.");
		} else if (readinessScore >= 50) {
			recommendations.push("Good progress! Focus on critical skills to accelerate your preparation.");
		} else {
			recommendations.push(
				"Start with the fundamentals. A structured learning plan will help you progress efficiently.",
			);
		}

		// Get AI insights
		let aiInsights: string | undefined;
		try {
			const { model } = await getServerModel();
			const preferredLanguage = await userSettingsService.getPreferredAiLanguage(userId);
			const languageInstruction = preferredLanguage === "en" ? "Respond in English." : "Reponds en francais.";

			const prompt = `You are an expert in career development in Morocco.
${languageInstruction}

Analyze this situation:
- Target role: ${role.roleFr || role.role}
- Readiness score: ${readinessScore}%
- Skills covered: ${skillsCovered}/${totalSkills}
- Critical gaps: ${criticalGaps}

Main gaps:
${topGaps.map((g) => `- ${g.skillNameFr || g.skillName}: level ${g.currentLevel}/5 (required: ${g.requiredLevel}/5, importance: ${g.importance})`).join("\n")}

Give 2-3 personalized and motivating strategic tips to help this person reach their goal. Be concise and actionable.`;

			const result = await generateText({
				model,
				messages: [{ role: "user", content: prompt }],
				temperature: 0.7,
			});

			aiInsights = validateAiOutput(result.text).cleaned;

			// Save to AI history (fire-and-forget)
			aiHistoryService
				.save({
					userId,
					source: "resume_gap_analysis",
					generatedContent: aiInsights,
					outputData: { readinessScore, criticalGaps, skillsCovered, totalSkills },
					inputData: { targetRoleId, targetRole: role.roleFr || role.role },
					metadata: {},
				})
				.catch(() => {});
		} catch {
			// AI insights are optional
			aiInsights = undefined;
		}

		return {
			userId,
			targetRoleId,
			targetRoleName: role.role,
			targetRoleNameFr: role.roleFr ?? undefined,
			targetRoleField: role.field,
			analysisDate: new Date(),
			readinessScore,
			totalSkills,
			skillsCovered,
			skillsToImprove,
			criticalGaps,
			estimatedWeeksTotal,
			gaps,
			recommendations,
			aiInsights,
		};
	},

	/**
	 * Get skills in demand from job market data
	 */
	async getMarketDemand(field?: string): Promise<MarketDemandSkill[]> {
		// Get job demand indicators
		const demandQuery = field
			? db
					.select()
					.from(jobDemandIndicator)
					.where(
						eq(
							jobDemandIndicator.industry,
							field as "healthcare" | "industrial" | "hse" | "tech" | "automotive" | "services",
						),
					)
			: db.select().from(jobDemandIndicator);

		const demandData = await demandQuery.then((results) => results.sort((a, b) => b.demandScore - a.demandScore));

		// Get skills heatmap for trend data
		const heatmapData = await db.select().from(skillsHeatmap);
		const heatmapMap = new Map(heatmapData.map((h) => [h.skill.toLowerCase(), h]));

		return demandData.map((d) => {
			const heatmap = heatmapMap.get(d.skill.toLowerCase());
			return {
				skillName: d.skill,
				demandScore: d.demandScore,
				growthRate: d.growthRate,
				totalJobs: d.totalJobs,
				avgSalaryPremium: d.avgSalaryPremium,
				hotness: d.hotness as "fire" | "hot" | "warm" | "cold",
				industries: heatmap ? Object.keys(heatmap.industries as Record<string, number>) : [d.industry],
				trend: heatmap?.trend === "rising" ? "rising" : heatmap?.trend === "declining" ? "declining" : "stable",
			};
		});
	},

	/**
	 * Prioritize skills by impact on employability
	 */
	async prioritizeSkills(userId: string): Promise<PrioritizedSkill[]> {
		// Get user's current skills
		const [userGapData] = await db.select().from(gapAnalysis).where(eq(gapAnalysis.userId, userId));

		if (!userGapData || userGapData.currentSkills.length === 0) {
			return [];
		}

		const currentSkills = userGapData.currentSkills;

		// Get market demand data
		const demandData = await db.select().from(jobDemandIndicator);
		const demandMap = new Map(demandData.map((d) => [d.skill.toLowerCase(), d]));

		// Get skill library for additional context
		const librarySkills = await db.select().from(skillLibrary).where(eq(skillLibrary.isActive, true));
		const libraryMap = new Map(librarySkills.map((s) => [s.name.toLowerCase(), s]));

		// Calculate priority for each skill
		const prioritizedSkills: PrioritizedSkill[] = currentSkills.map((skill) => {
			const demand = demandMap.get(skill.name.toLowerCase());
			const librarySkill = libraryMap.get(skill.name.toLowerCase());

			// Calculate priority factors
			const marketDemand = demand?.demandScore ?? 50;
			const growthRate = demand?.growthRate ?? 0;
			const skillGap = 5 - skill.currentLevel; // Gap to mastery
			const timeToAcquire = Math.ceil(skillGap * WEEKS_PER_LEVEL[skill.category as SkillCategory] || 6);

			// Priority score formula
			const priorityScore = Math.round(
				marketDemand * 0.4 + // Market demand weight
					growthRate * 0.2 + // Growth potential
					skillGap * 20 * 0.2 + // Room for improvement
					(5 - skill.currentLevel) * 10 * 0.2, // Current gap penalty
			);

			// Determine reasons for priority
			const reasons: string[] = [];
			if (marketDemand > 80) reasons.push("Very high market demand");
			if (growthRate > 20) reasons.push(`${growthRate}% annual growth`);
			if (skillGap > 2) reasons.push("Significant improvement potential");
			if (demand?.hotness === "fire") reasons.push("Highly sought-after skill");
			if (librarySkill?.isRecommended) reasons.push("Recommended for your field");

			// Determine impact level
			let impactOnEmployability: "high" | "medium" | "low" = "medium";
			if (priorityScore > 70 || demand?.hotness === "fire") impactOnEmployability = "high";
			else if (priorityScore < 40) impactOnEmployability = "low";

			return {
				skillId: skill.id,
				skillName: skill.name,
				skillNameFr: skill.nameFr,
				category: skill.category as SkillCategory,
				currentLevel: skill.currentLevel,
				targetLevel: 5, // Default target is mastery
				priorityScore,
				priorityRank: 0, // Will be set after sorting
				reasons,
				impactOnEmployability,
				marketDemand,
				timeToAcquire,
				learningResourcesCount: librarySkill ? 3 : 0,
			};
		});

		// Sort by priority score and assign ranks
		prioritizedSkills.sort((a, b) => b.priorityScore - a.priorityScore);
		prioritizedSkills.forEach((skill, index) => {
			skill.priorityRank = index + 1;
		});

		return prioritizedSkills;
	},

	/**
	 * Suggest learning resources for a specific skill
	 */
	async suggestResources(skillId: string, userId: string): Promise<LearningResource[]> {
		// Get the skill from user's gap analysis or skill library
		const [userGapData] = await db.select().from(gapAnalysis).where(eq(gapAnalysis.userId, userId));

		const userSkill = userGapData?.currentSkills.find((s) => s.id === skillId);

		// Get skill info from library — skillId may be a UUID or a slug/name string.
		// Only query by id when it looks like a valid UUID; otherwise fall back to name match.
		const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
		const isUuid = uuidPattern.test(skillId);
		const skillNameHint = userSkill?.name;
		const skillNameFrHint = userSkill?.nameFr;
		const [librarySkill] = await db
			.select()
			.from(skillLibrary)
			.where(
				isUuid
					? eq(skillLibrary.id, skillId)
					: skillNameHint
						? or(
								eq(skillLibrary.name, skillNameHint),
								skillNameFrHint ? eq(skillLibrary.nameFr, skillNameFrHint) : eq(skillLibrary.name, skillNameHint),
							)
						: eq(skillLibrary.name, skillId), // last resort: treat skillId as a name
			)
			.limit(1);

		const skillName = userSkill?.name || librarySkill?.name;
		const category = (userSkill?.category || librarySkill?.category || "technical") as SkillCategory;
		const currentLevel = userSkill?.currentLevel ?? 1;

		if (!skillName) {
			throw new ORPCError("NOT_FOUND", { message: "Skill not found" });
		}

		// Generate AI-powered resource suggestions
		try {
			const { model } = await getServerModel();
			const preferredLanguage = await userSettingsService.getPreferredAiLanguage(userId);
			const languageInstruction = preferredLanguage === "en" ? "Respond in English." : "Reponds en francais.";

			const prompt = `You are an expert in professional training in Morocco.
${languageInstruction}

Suggest 5-8 learning resources to develop this skill:
- Skill: ${skillName}
- Category: ${category}
- Current level: ${currentLevel}/5

Include a mix of:
- Online courses (Coursera, Udemy, LinkedIn Learning)
- Recognized certifications
- Books/Guides
- Free tutorials
- Practice (internships, projects)

IMPORTANT: Respond ONLY with a valid JSON array, with no text before or after.

Expected JSON format:
[
  {
    "id": "res_1",
    "title": "Resource title",
    "titleFr": "Title in French",
    "type": "course|book|certification|tutorial|practice|mentorship|video|article",
    "platform": "Platform name",
    "url": "https://...",
    "duration": "X hours/weeks",
    "cost": "free|paid|subscription",
    "difficulty": "beginner|intermediate|advanced",
    "rating": 4.5,
    "relevanceScore": 85
  }
]`;

			const result = await generateText({
				model,
				messages: [{ role: "user", content: prompt }],
				temperature: 0.7,
			});

			// Parse AI response
			const safeText = validateAiOutput(result.text).cleaned;
			const jsonMatch = safeText.match(/\[[\s\S]*\]/);
			if (jsonMatch) {
				const resources = JSON.parse(jsonMatch[0]) as LearningResource[];
				const sorted = resources.sort((a, b) => b.relevanceScore - a.relevanceScore);

				// Save to AI history (fire-and-forget)
				aiHistoryService
					.save({
						userId,
						source: "learning_path_recommend",
						generatedContent: `${sorted.length} ressources d'apprentissage pour ${skillName}`,
						outputData: { resources: sorted },
						inputData: { skillId, skillName, category, currentLevel },
						metadata: {},
					})
					.catch(() => {});

				return sorted;
			}
		} catch (error) {
			console.error("Failed to generate AI resources:", error);
		}

		// Fallback to static resources
		return getDefaultResources(skillName, category, currentLevel);
	},

	/**
	 * Estimate time to close skill gap
	 */
	async estimateTimeToClose(userId: string, skillId: string): Promise<TimeEstimate> {
		// Get user's current skill data
		const [userGapData] = await db.select().from(gapAnalysis).where(eq(gapAnalysis.userId, userId));

		const userSkill = userGapData?.currentSkills.find((s) => s.id === skillId);

		// Get skill from library as fallback — skillId may be a UUID or a slug/name string.
		const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
		const isUuid = uuidPattern.test(skillId);
		const skillNameHint = userSkill?.name;
		const skillNameFrHint = userSkill?.nameFr;
		const [librarySkill] = await db
			.select()
			.from(skillLibrary)
			.where(
				isUuid
					? eq(skillLibrary.id, skillId)
					: skillNameHint
						? or(
								eq(skillLibrary.name, skillNameHint),
								skillNameFrHint ? eq(skillLibrary.nameFr, skillNameFrHint) : eq(skillLibrary.name, skillNameHint),
							)
						: eq(skillLibrary.name, skillId),
			)
			.limit(1);

		const skillName = userSkill?.name || librarySkill?.name;
		const skillNameFr = userSkill?.nameFr || librarySkill?.nameFr;
		const category = (userSkill?.category || librarySkill?.category || "technical") as SkillCategory;
		const currentLevel = userSkill?.currentLevel ?? 1;
		const targetLevel = 5; // Default target is mastery

		if (!skillName) {
			throw new ORPCError("NOT_FOUND", { message: "Skill not found" });
		}

		const gapSize = targetLevel - currentLevel;
		const baseTimePerLevel = WEEKS_PER_LEVEL[category];

		// Calculate factors
		const baseTime = gapSize * baseTimePerLevel;
		const categoryMultiplier = category === "languages" ? 1.5 : category === "technical" ? 1.2 : 1.0;
		const gapMultiplier = gapSize > 3 ? 1.3 : gapSize > 2 ? 1.1 : 1.0;
		const complexityBonus = currentLevel === 0 ? 2 : 0; // Extra time for complete beginners

		const estimatedWeeks = Math.ceil(baseTime * categoryMultiplier * gapMultiplier + complexityBonus);
		const estimatedHours = estimatedWeeks * HOURS_PER_WEEK;

		// Determine confidence level
		let confidenceLevel: "high" | "medium" | "low" = "medium";
		if (gapSize <= 2 && currentLevel > 0) confidenceLevel = "high";
		else if (gapSize > 3 || currentLevel === 0) confidenceLevel = "low";

		// Generate milestones
		const milestones: TimeEstimate["milestones"] = [];
		let weeksAccumulated = 0;

		for (let level = currentLevel + 1; level <= targetLevel; level++) {
			weeksAccumulated += Math.ceil(baseTimePerLevel * categoryMultiplier);
			milestones.push({
				level,
				weeksFromStart: weeksAccumulated,
				description: getMilestoneDescription(level, category, "en"),
				descriptionFr: getMilestoneDescription(level, category, "fr"),
			});
		}

		return {
			skillId,
			skillName,
			skillNameFr: skillNameFr ?? undefined,
			currentLevel,
			targetLevel,
			estimatedWeeks,
			estimatedHours,
			confidenceLevel,
			factors: {
				baseTime,
				categoryMultiplier,
				gapMultiplier,
				complexityBonus,
			},
			milestones,
		};
	},

	/**
	 * Get industry benchmarks for skill requirements
	 */
	async getIndustryBenchmarks(industry?: string): Promise<IndustryBenchmark[]> {
		// Get industry trends
		const trendsQuery = industry
			? db
					.select()
					.from(industryTrend)
					.where(
						eq(
							industryTrend.industry,
							industry as "healthcare" | "industrial" | "hse" | "tech" | "automotive" | "services",
						),
					)
			: db.select().from(industryTrend);

		const trends = await trendsQuery;

		// Get job demand by industry
		const demandData = await db.select().from(jobDemandIndicator);

		// Get skills heatmap
		const heatmapData = await db.select().from(skillsHeatmap);

		return trends.map((trend) => {
			// Get top skills for this industry
			const industryDemand = demandData.filter((d) => d.industry === trend.industry);
			const topSkillsFromDemand = industryDemand
				.sort((a, b) => b.demandScore - a.demandScore)
				.slice(0, 5)
				.map((d) => ({
					name: d.skill,
					averageLevel: 3, // Default
					demandScore: d.demandScore,
				}));

			// Add skills from heatmap
			const heatmapSkills = heatmapData
				.filter((h) => {
					const industries = h.industries as Record<string, number>;
					return industries[trend.industry] > 50;
				})
				.slice(0, 3)
				.map((h) => {
					const industries = h.industries as Record<string, number>;
					return {
						name: h.skill,
						averageLevel: Math.round((industries[trend.industry] || 50) / 20),
						demandScore: h.overallDemand,
					};
				});

			const allTopSkills = [...topSkillsFromDemand, ...heatmapSkills].slice(0, 8);

			return {
				industry: trend.industry,
				industryFr: getIndustryFrenchName(trend.industry),
				totalPositions: trend.openPositions,
				avgSalaryRange: { min: 5000, max: 15000 }, // Default range in MAD
				topSkills: allTopSkills,
				growthRate: trend.changePercent,
				competitionLevel: trend.competitionLevel as "low" | "medium" | "high",
				entryBarrier: trend.competitionLevel === "high" ? "high" : trend.competitionLevel === "low" ? "low" : "medium",
				remoteWorkPercent: 20, // Default
			};
		});
	},
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function getDefaultResources(skillName: string, _category: SkillCategory, currentLevel: number): LearningResource[] {
	const difficulty = currentLevel < 2 ? "beginner" : currentLevel < 4 ? "intermediate" : ("advanced" as const);

	return [
		{
			id: generateId(),
			title: `${skillName} Fundamentals`,
			titleFr: `Fondamentaux de ${skillName}`,
			type: "course",
			platform: "Coursera",
			url: "https://coursera.org",
			duration: "4-6 weeks",
			cost: "subscription",
			difficulty,
			rating: 4.5,
			relevanceScore: 85,
		},
		{
			id: generateId(),
			title: `${skillName} Certification`,
			titleFr: `Certification ${skillName}`,
			type: "certification",
			platform: "Professional Institute",
			duration: "2-4 weeks",
			cost: "paid",
			difficulty,
			rating: 4.7,
			relevanceScore: 80,
		},
		{
			id: generateId(),
			title: `${skillName} Practice Projects`,
			titleFr: `Projets Pratiques ${skillName}`,
			type: "practice",
			platform: "IMTA",
			duration: "Ongoing",
			cost: "free",
			difficulty: "intermediate",
			rating: 4.3,
			relevanceScore: 75,
		},
	];
}

function getMilestoneDescription(level: number, category: SkillCategory, language: "en" | "fr"): string {
	const descriptions: Record<SkillCategory, Record<number, { en: string; fr: string }>> = {
		technical: {
			1: { en: "Basic understanding", fr: "Comprehension de base" },
			2: { en: "Can apply with guidance", fr: "Peut appliquer avec aide" },
			3: { en: "Independent application", fr: "Application autonome" },
			4: { en: "Advanced practitioner", fr: "Praticien avance" },
			5: { en: "Expert level", fr: "Niveau expert" },
		},
		soft: {
			1: { en: "Awareness level", fr: "Niveau de sensibilisation" },
			2: { en: "Developing skill", fr: "Competence en developpement" },
			3: { en: "Consistent application", fr: "Application coherente" },
			4: { en: "Role model", fr: "Modele de reference" },
			5: { en: "Mastery", fr: "Maitrise" },
		},
		languages: {
			1: { en: "Beginner (A1)", fr: "Debutant (A1)" },
			2: { en: "Elementary (A2)", fr: "Elementaire (A2)" },
			3: { en: "Intermediate (B1)", fr: "Intermediaire (B1)" },
			4: { en: "Upper Intermediate (B2)", fr: "Intermediaire superieur (B2)" },
			5: { en: "Advanced (C1+)", fr: "Avance (C1+)" },
		},
		certifications: {
			1: { en: "Awareness", fr: "Sensibilisation" },
			2: { en: "Foundation", fr: "Fondation" },
			3: { en: "Practitioner", fr: "Praticien" },
			4: { en: "Expert", fr: "Expert" },
			5: { en: "Master", fr: "Maitre" },
		},
		tools: {
			1: { en: "Basic user", fr: "Utilisateur de base" },
			2: { en: "Regular user", fr: "Utilisateur regulier" },
			3: { en: "Proficient", fr: "Competent" },
			4: { en: "Advanced user", fr: "Utilisateur avance" },
			5: { en: "Power user", fr: "Utilisateur expert" },
		},
	};

	return descriptions[category]?.[level]?.[language] ?? (language === "fr" ? `Niveau ${level}` : `Level ${level}`);
}

function getIndustryFrenchName(industry: string): string {
	const names: Record<string, string> = {
		healthcare: "Sante",
		industrial: "Industrie",
		hse: "Hygiene, Securite, Environnement",
		tech: "Technologie",
		automotive: "Automobile",
		services: "Services",
	};
	return names[industry] ?? industry;
}
