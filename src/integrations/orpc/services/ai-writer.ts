import { createAnthropic } from "@ai-sdk/anthropic";
import { createDeepSeek } from "@ai-sdk/deepseek";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createGroq } from "@ai-sdk/groq";
import { createMistral } from "@ai-sdk/mistral";
import { createOpenAI } from "@ai-sdk/openai";
import { createTogetherAI } from "@ai-sdk/togetherai";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { ORPCError } from "@orpc/client";
import { createGateway, generateText } from "ai";
import { createOllama } from "ai-sdk-ollama";
import { and, desc, eq, ilike, or } from "drizzle-orm";
import { match } from "ts-pattern";
import { sanitizeAiInput } from "@/integrations/ai/sanitize";
import { schema } from "@/integrations/drizzle";
import { db } from "@/integrations/drizzle/client";
import type {
	AiWriterBulletPoint,
	AiWriterContentType,
	AiWriterGrammarIssue,
	AiWriterIndustry,
	AiWriterSkillExtraction,
	AiWriterTone,
} from "@/integrations/drizzle/schema";
import { generateId } from "@/utils/string";
import { aiConfigService } from "./ai-config";
import { aiQuotaService } from "./ai-quota";

export type CreateAiWriterContentInput = {
	userId: string;
	type: AiWriterContentType;
	name: string;
	originalInput?: string;
	generatedContent?: string;
	tone?: AiWriterTone;
	industry?: AiWriterIndustry;
	experienceYears?: number;
	bulletPoints?: AiWriterBulletPoint[];
	skillExtraction?: AiWriterSkillExtraction;
	grammarIssues?: AiWriterGrammarIssue[];
	jobTitle?: string;
	companyName?: string;
	linkedinKeywords?: string[];
	tags?: string[];
};

export type UpdateAiWriterContentInput = {
	id: string;
	userId: string;
	name?: string;
	originalInput?: string;
	generatedContent?: string;
	tone?: AiWriterTone;
	industry?: AiWriterIndustry;
	experienceYears?: number;
	bulletPoints?: AiWriterBulletPoint[];
	skillExtraction?: AiWriterSkillExtraction;
	grammarIssues?: AiWriterGrammarIssue[];
	jobTitle?: string;
	companyName?: string;
	linkedinKeywords?: string[];
	isFavorite?: boolean;
	tags?: string[];
};

// ============================================================================
// AI MODEL SETUP (same pattern as ai.ts)
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

async function withQuotaAndLogging<T>(
	userId: string,
	feature: string,
	fn: (model: ReturnType<typeof getModel>) => Promise<T>,
	role?: string,
): Promise<T> {
	const quotaCheck = await aiQuotaService.checkQuota(userId, feature, role);
	if (!quotaCheck.allowed) {
		await aiQuotaService.logUsage({
			userId,
			feature,
			provider: "none",
			model: "none",
			status: "quota_exceeded",
			errorMessage: quotaCheck.reason,
		});
		throw new ORPCError("FORBIDDEN", { message: quotaCheck.reason || "AI usage quota exceeded" });
	}

	const { model, config } = await getServerModel();
	const startTime = Date.now();

	try {
		const result = await fn(model);
		await aiQuotaService.logUsage({
			userId,
			feature,
			providerId: config.id,
			provider: config.provider,
			model: config.model,
			status: "success",
			durationMs: Date.now() - startTime,
		});
		return result;
	} catch (error) {
		if (error instanceof ORPCError) throw error;
		await aiQuotaService.logUsage({
			userId,
			feature,
			providerId: config.id,
			provider: config.provider,
			model: config.model,
			status: "error",
			errorMessage: error instanceof Error ? error.message : "Unknown error",
			durationMs: Date.now() - startTime,
		});
		throw new ORPCError("INTERNAL_SERVER_ERROR", {
			message: "AI generation failed. Please try again.",
		});
	}
}

// Helper to parse AI JSON response
function parseAIJson<T>(text: string): T {
	const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, text];
	const jsonStr = jsonMatch[1]?.trim() || text.trim();

	try {
		return JSON.parse(jsonStr) as T;
	} catch {
		// Try extracting JSON object/array from the text
		const objectMatch = jsonStr.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
		if (objectMatch) {
			try {
				return JSON.parse(objectMatch[1]) as T;
			} catch {
				// fall through
			}
		}
		throw new ORPCError("INTERNAL_SERVER_ERROR", {
			message: "Failed to parse AI response as JSON",
		});
	}
}

// ============================================================================
// REAL AI GENERATION FUNCTIONS
// ============================================================================

async function generateBulletPointsWithAI(
	userId: string,
	description: string,
	tone: AiWriterTone,
	role?: string,
): Promise<AiWriterBulletPoint[]> {
	return withQuotaAndLogging(
		userId,
		"ai_writer_bullet_points",
		async (model) => {
			const toneInstructions: Record<AiWriterTone, string> = {
				professional: "Use a professional, measured tone with clear, factual language.",
				confident: "Use confident, assertive language that emphasizes achievements and impact.",
				friendly: "Use warm, approachable language while maintaining professionalism.",
				executive: "Use strategic, leadership-oriented language emphasizing vision and organizational impact.",
				creative: "Use dynamic, innovative language that highlights creativity and problem-solving.",
			};

			const result = await generateText({
				model,
				messages: [
					{
						role: "system",
						content: `You are an expert resume writer specializing in the Moroccan and French-speaking job market.
Your task is to transform work experience descriptions into powerful, quantified resume bullet points.

Guidelines:
- Start each bullet point with a strong action verb (Dirige, Pilote, Optimise, Developpe, Implemente, etc.)
- Add specific metrics and numbers wherever possible (percentages, monetary values, team sizes, timeframes)
- ${toneInstructions[tone]}
- Keep each bullet point concise (1-2 lines maximum)
- Focus on impact and results, not just responsibilities
- Use French language for all bullet points

IMPORTANT: Respond ONLY with a valid JSON array. No text before or after.

Response format:
[
  {
    "original": "The original description point",
    "enhanced": "The improved, quantified bullet point in French",
    "metrics": "Key metric summary (e.g., '+30% revenue', '15 team members')"
  }
]`,
					},
					{
						role: "user",
						content: `Transform these work experience descriptions into powerful resume bullet points:\n\n${sanitizeAiInput(description)}`,
					},
				],
				temperature: 0.7,
				maxOutputTokens: 1500,
			});

			const parsed = parseAIJson<Array<{ original: string; enhanced: string; metrics?: string }>>(result.text);

			return parsed.map((item) => ({
				id: generateId(),
				original: item.original,
				enhanced: item.enhanced,
				metrics: item.metrics,
			}));
		},
		role,
	);
}

async function generateSummaryWithAI(
	userId: string,
	expertise: string,
	tone: AiWriterTone,
	experienceYears: number,
	role?: string,
): Promise<string> {
	return withQuotaAndLogging(
		userId,
		"ai_writer_summary",
		async (model) => {
			const toneDescriptions: Record<AiWriterTone, string> = {
				professional: "professional, measured, and methodical",
				confident: "confident, ambitious, and results-oriented",
				friendly: "collaborative, enthusiastic, and approachable",
				executive: "strategic, visionary, and leadership-focused",
				creative: "innovative, passionate, and forward-thinking",
			};

			const result = await generateText({
				model,
				messages: [
					{
						role: "system",
						content: `You are an expert resume writer for the Moroccan and French-speaking job market.
Write a compelling professional summary (3-5 sentences) in French.

Guidelines:
- Tone: ${toneDescriptions[tone]}
- Highlight years of experience, key strengths, and career achievements
- Use strong action verbs and quantified accomplishments where possible
- Tailor to the Moroccan/French professional context
- The summary should be ready to paste directly into a resume
- Do NOT include any JSON formatting or markdown - output only the plain text summary in French`,
					},
					{
						role: "user",
						content: `Write a professional resume summary for someone with ${experienceYears}+ years of experience in: ${sanitizeAiInput(expertise)}`,
					},
				],
				temperature: 0.7,
				maxOutputTokens: 1000,
			});

			return result.text.trim();
		},
		role,
	);
}

async function extractSkillsWithAI(
	userId: string,
	jobPosting: string,
	role?: string,
): Promise<AiWriterSkillExtraction> {
	return withQuotaAndLogging(
		userId,
		"ai_writer_extract_skills",
		async (model) => {
			const result = await generateText({
				model,
				messages: [
					{
						role: "system",
						content: `You are an expert HR analyst and job market specialist for Morocco and French-speaking countries.
Analyze the given job posting and extract all required and desired skills, organized by category.

IMPORTANT: Respond ONLY with a valid JSON object. No text before or after.

Response format:
{
  "hardSkills": ["Technical skill 1", "Technical skill 2"],
  "softSkills": ["Soft skill 1", "Soft skill 2"],
  "certifications": ["Certification 1", "Certification 2"],
  "tools": ["Tool 1", "Tool 2"]
}

Guidelines:
- Extract actual skills mentioned or implied in the posting
- Include both explicit and implicit requirements
- Categorize correctly: hardSkills for technical/domain skills, softSkills for interpersonal/behavioral, certifications for formal qualifications, tools for software/platforms
- Return at least 3 items per category when possible
- If the posting is in French, keep skill names in their commonly used form (mix of French and English as used in the market)`,
					},
					{
						role: "user",
						content: `Extract all skills from this job posting:\n\n${sanitizeAiInput(jobPosting)}`,
					},
				],
				temperature: 0.3,
				maxOutputTokens: 1000,
			});

			return parseAIJson<AiWriterSkillExtraction>(result.text);
		},
		role,
	);
}

async function checkGrammarWithAI(userId: string, text: string, role?: string): Promise<AiWriterGrammarIssue[]> {
	return withQuotaAndLogging(
		userId,
		"ai_writer_grammar",
		async (model) => {
			const result = await generateText({
				model,
				messages: [
					{
						role: "system",
						content: `You are an expert French language editor specializing in professional and resume writing.
Analyze the given text for grammar, style, clarity, and spelling issues. Focus on:

1. Grammar errors (accords, conjugaison, syntaxe)
2. Style improvements for professional/resume context (avoid "je", use action verbs, quantify achievements)
3. Clarity issues (vague terms like "beaucoup", "divers", etc. that should be quantified)
4. Spelling errors (including missing accents)

IMPORTANT: Respond ONLY with a valid JSON array. No text before or after.
If there are no issues, return an empty array: []

Response format:
[
  {
    "text": "the problematic text",
    "suggestion": "The suggested improvement or fix in French",
    "type": "grammar|clarity|style|spelling",
    "position": 0
  }
]

For position, provide the approximate character position of the issue in the original text.`,
					},
					{
						role: "user",
						content: `Check this text for grammar, style, and clarity issues:\n\n${sanitizeAiInput(text)}`,
					},
				],
				temperature: 0.2,
				maxOutputTokens: 2000,
			});

			return parseAIJson<AiWriterGrammarIssue[]>(result.text);
		},
		role,
	);
}

async function generateCoverLetterWithAI(
	userId: string,
	jobTitle: string,
	company: string,
	skills: string[],
	tone: AiWriterTone,
	role?: string,
): Promise<string> {
	return withQuotaAndLogging(
		userId,
		"ai_writer_cover_letter",
		async (model) => {
			const toneDescriptions: Record<AiWriterTone, string> = {
				professional: "formal and professional",
				confident: "confident and assertive",
				friendly: "warm yet professional",
				executive: "strategic and leadership-focused",
				creative: "innovative and dynamic",
			};

			const result = await generateText({
				model,
				messages: [
					{
						role: "system",
						content: `You are an expert cover letter writer for the Moroccan and French-speaking job market.
Write a compelling cover letter in French following the standard French business letter format.

Guidelines:
- Tone: ${toneDescriptions[tone]}
- Follow French business letter conventions (Madame, Monsieur / formule de politesse)
- Structure: Opening (purpose), Body (skills match + motivation), Closing (call to action + formule de politesse)
- Highlight relevant skills and how they apply to the position
- Show genuine interest in the company
- Keep it concise (300-400 words)
- Do NOT include any JSON formatting or markdown - output only the plain text letter in French
- Do NOT include date, address headers, or signature - just the letter body`,
					},
					{
						role: "user",
						content: `Write a cover letter for the position of "${sanitizeAiInput(jobTitle)}" at "${sanitizeAiInput(company)}". Key skills to highlight: ${skills.map((s) => sanitizeAiInput(s)).join(", ")}`,
					},
				],
				temperature: 0.7,
				maxOutputTokens: 3000,
			});

			return result.text.trim();
		},
		role,
	);
}

async function optimizeLinkedInWithAI(
	userId: string,
	summary: string,
	role?: string,
): Promise<{ optimized: string; keywords: string[] }> {
	return withQuotaAndLogging(
		userId,
		"ai_writer_linkedin",
		async (model) => {
			const result = await generateText({
				model,
				messages: [
					{
						role: "system",
						content: `You are a LinkedIn optimization specialist for the Moroccan and French-speaking professional market.
Optimize the given LinkedIn summary for better visibility and engagement.

IMPORTANT: Respond ONLY with a valid JSON object. No text before or after.

Response format:
{
  "optimized": "The optimized LinkedIn summary text",
  "keywords": ["keyword1", "keyword2", "keyword3"]
}

Guidelines:
- Improve SEO with relevant industry keywords
- Make the summary engaging and scannable
- Include a clear value proposition
- Add relevant keywords for LinkedIn search algorithm
- Maintain the professional tone while being personable
- Keep it in French if the original is in French, or bilingual French/English for international profiles
- The keywords array should contain 8-12 high-impact LinkedIn search terms`,
					},
					{
						role: "user",
						content: `Optimize this LinkedIn summary:\n\n${sanitizeAiInput(summary)}`,
					},
				],
				temperature: 0.6,
				maxOutputTokens: 1500,
			});

			return parseAIJson<{ optimized: string; keywords: string[] }>(result.text);
		},
		role,
	);
}

async function quantifyAchievementWithAI(userId: string, achievement: string, role?: string): Promise<string> {
	return withQuotaAndLogging(
		userId,
		"ai_writer_quantify",
		async (model) => {
			const result = await generateText({
				model,
				messages: [
					{
						role: "system",
						content: `You are an expert resume writer specializing in quantifying professional achievements.
Transform the given achievement description into a powerful, quantified statement.

Guidelines:
- Add specific, realistic metrics (percentages, monetary values, team sizes, timeframes)
- Start with a strong action verb
- Keep it concise (1-2 sentences maximum)
- Make the impact measurable and impressive
- Write in French
- Do NOT include any JSON formatting or markdown - output only the quantified achievement text`,
					},
					{
						role: "user",
						content: `Quantify this achievement with specific metrics:\n\n${sanitizeAiInput(achievement)}`,
					},
				],
				temperature: 0.7,
				maxOutputTokens: 1500,
			});

			return result.text.trim();
		},
		role,
	);
}

// ============================================================================
// SERVICE EXPORTS
// ============================================================================

export const aiWriterService = {
	// Create new AI writer content
	create: async (input: CreateAiWriterContentInput): Promise<string> => {
		const id = generateId();

		await db.insert(schema.aiWriterContent).values({
			id,
			userId: input.userId,
			type: input.type,
			name: input.name,
			originalInput: input.originalInput,
			generatedContent: input.generatedContent,
			tone: input.tone,
			industry: input.industry,
			experienceYears: input.experienceYears,
			bulletPoints: input.bulletPoints,
			skillExtraction: input.skillExtraction,
			grammarIssues: input.grammarIssues,
			jobTitle: input.jobTitle,
			companyName: input.companyName,
			linkedinKeywords: input.linkedinKeywords,
			tags: input.tags ?? [],
		});

		return id;
	},

	// Get content by ID
	getById: async (input: { id: string; userId: string }) => {
		const [content] = await db
			.select()
			.from(schema.aiWriterContent)
			.where(and(eq(schema.aiWriterContent.id, input.id), eq(schema.aiWriterContent.userId, input.userId)));

		if (!content) {
			throw new ORPCError("NOT_FOUND", { message: "AI Writer content not found" });
		}

		return content;
	},

	// List all saved content
	list: async (input: {
		userId: string;
		type?: AiWriterContentType;
		search?: string;
		isFavorite?: boolean;
		limit?: number;
		offset?: number;
	}) => {
		const conditions = [eq(schema.aiWriterContent.userId, input.userId)];

		if (input.type) {
			conditions.push(eq(schema.aiWriterContent.type, input.type));
		}

		if (input.isFavorite !== undefined) {
			conditions.push(eq(schema.aiWriterContent.isFavorite, input.isFavorite));
		}

		if (input.search) {
			const searchCondition = or(
				ilike(schema.aiWriterContent.name, `%${input.search}%`),
				ilike(schema.aiWriterContent.generatedContent, `%${input.search}%`),
				ilike(schema.aiWriterContent.jobTitle, `%${input.search}%`),
				ilike(schema.aiWriterContent.companyName, `%${input.search}%`),
			);
			if (searchCondition) conditions.push(searchCondition);
		}

		const contents = await db
			.select()
			.from(schema.aiWriterContent)
			.where(and(...conditions))
			.orderBy(desc(schema.aiWriterContent.updatedAt))
			.limit(input.limit ?? 50)
			.offset(input.offset ?? 0);

		return contents;
	},

	// Update content
	update: async (input: UpdateAiWriterContentInput): Promise<void> => {
		const [existing] = await db
			.select({ id: schema.aiWriterContent.id })
			.from(schema.aiWriterContent)
			.where(and(eq(schema.aiWriterContent.id, input.id), eq(schema.aiWriterContent.userId, input.userId)));

		if (!existing) {
			throw new ORPCError("NOT_FOUND", { message: "AI Writer content not found" });
		}

		await db
			.update(schema.aiWriterContent)
			.set({
				name: input.name,
				originalInput: input.originalInput,
				generatedContent: input.generatedContent,
				tone: input.tone,
				industry: input.industry,
				experienceYears: input.experienceYears,
				bulletPoints: input.bulletPoints,
				skillExtraction: input.skillExtraction,
				grammarIssues: input.grammarIssues,
				jobTitle: input.jobTitle,
				companyName: input.companyName,
				linkedinKeywords: input.linkedinKeywords,
				isFavorite: input.isFavorite,
				tags: input.tags,
			})
			.where(and(eq(schema.aiWriterContent.id, input.id), eq(schema.aiWriterContent.userId, input.userId)));
	},

	// Delete content
	delete: async (input: { id: string; userId: string }): Promise<void> => {
		await db
			.delete(schema.aiWriterContent)
			.where(and(eq(schema.aiWriterContent.id, input.id), eq(schema.aiWriterContent.userId, input.userId)));
	},

	// Toggle favorite
	toggleFavorite: async (input: { id: string; userId: string }): Promise<boolean> => {
		const [content] = await db
			.select({ isFavorite: schema.aiWriterContent.isFavorite })
			.from(schema.aiWriterContent)
			.where(and(eq(schema.aiWriterContent.id, input.id), eq(schema.aiWriterContent.userId, input.userId)));

		if (!content) {
			throw new ORPCError("NOT_FOUND", { message: "AI Writer content not found" });
		}

		const newFavoriteStatus = !content.isFavorite;

		await db
			.update(schema.aiWriterContent)
			.set({ isFavorite: newFavoriteStatus })
			.where(and(eq(schema.aiWriterContent.id, input.id), eq(schema.aiWriterContent.userId, input.userId)));

		return newFavoriteStatus;
	},

	// Generate bullet points using REAL AI
	generateBulletPoints: async (input: {
		userId: string;
		description: string;
		tone: AiWriterTone;
		save?: boolean;
		role?: string;
	}): Promise<{ bulletPoints: AiWriterBulletPoint[]; id?: string }> => {
		const bulletPoints = await generateBulletPointsWithAI(input.userId, input.description, input.tone, input.role);

		if (input.save) {
			const id = generateId();
			await db.insert(schema.aiWriterContent).values({
				id,
				userId: input.userId,
				type: "bullet_point",
				contentSource: "ai_writer_bullet_point",
				name: `Bullet Points - ${new Date().toLocaleDateString()}`,
				originalInput: input.description,
				tone: input.tone,
				bulletPoints,
				tags: [],
			});
			return { bulletPoints, id };
		}

		return { bulletPoints };
	},

	// Generate professional summary using REAL AI
	generateSummary: async (input: {
		userId: string;
		expertise: string;
		tone: AiWriterTone;
		experienceYears: number;
		save?: boolean;
		role?: string;
	}): Promise<{ summary: string; id?: string }> => {
		const summary = await generateSummaryWithAI(
			input.userId,
			input.expertise,
			input.tone,
			input.experienceYears,
			input.role,
		);

		if (input.save) {
			const id = generateId();
			await db.insert(schema.aiWriterContent).values({
				id,
				userId: input.userId,
				type: "summary",
				contentSource: "ai_writer_summary",
				name: `Resume - ${new Date().toLocaleDateString()}`,
				originalInput: input.expertise,
				generatedContent: summary,
				tone: input.tone,
				experienceYears: input.experienceYears,
				tags: [],
			});
			return { summary, id };
		}

		return { summary };
	},

	// Quantify achievement using REAL AI
	quantifyAchievement: async (input: {
		userId: string;
		achievement: string;
		save?: boolean;
		role?: string;
	}): Promise<{ quantified: string; id?: string }> => {
		const quantified = await quantifyAchievementWithAI(input.userId, input.achievement, input.role);

		if (input.save) {
			const id = generateId();
			await db.insert(schema.aiWriterContent).values({
				id,
				userId: input.userId,
				type: "achievement",
				contentSource: "ai_writer_achievement",
				name: `Achievement - ${new Date().toLocaleDateString()}`,
				originalInput: input.achievement,
				generatedContent: quantified,
				tags: [],
			});
			return { quantified, id };
		}

		return { quantified };
	},

	// Extract skills using REAL AI
	extractSkills: async (input: {
		userId: string;
		jobPosting: string;
		save?: boolean;
		role?: string;
	}): Promise<{ skills: AiWriterSkillExtraction; id?: string }> => {
		const skills = await extractSkillsWithAI(input.userId, input.jobPosting, input.role);

		if (input.save) {
			const id = generateId();
			await db.insert(schema.aiWriterContent).values({
				id,
				userId: input.userId,
				type: "skill_extraction",
				contentSource: "ai_writer_skill_extraction",
				name: `Skills - ${new Date().toLocaleDateString()}`,
				originalInput: input.jobPosting,
				skillExtraction: skills,
				tags: [],
			});
			return { skills, id };
		}

		return { skills };
	},

	// Generate cover letter using REAL AI
	generateCoverLetter: async (input: {
		userId: string;
		jobTitle: string;
		companyName: string;
		skills: string[];
		tone: AiWriterTone;
		save?: boolean;
		role?: string;
	}): Promise<{ coverLetter: string; id?: string }> => {
		const coverLetter = await generateCoverLetterWithAI(
			input.userId,
			input.jobTitle,
			input.companyName,
			input.skills,
			input.tone,
			input.role,
		);

		if (input.save) {
			const id = generateId();
			await db.insert(schema.aiWriterContent).values({
				id,
				userId: input.userId,
				type: "cover_letter",
				contentSource: "ai_writer_cover_letter",
				name: `Lettre - ${input.companyName || "Sans nom"} - ${new Date().toLocaleDateString()}`,
				generatedContent: coverLetter,
				jobTitle: input.jobTitle,
				companyName: input.companyName,
				tone: input.tone,
				tags: [],
			});
			return { coverLetter, id };
		}

		return { coverLetter };
	},

	// Optimize LinkedIn summary using REAL AI
	optimizeLinkedIn: async (input: {
		userId: string;
		summary: string;
		save?: boolean;
		role?: string;
	}): Promise<{ optimized: string; keywords: string[]; id?: string }> => {
		const { optimized, keywords } = await optimizeLinkedInWithAI(input.userId, input.summary, input.role);

		if (input.save) {
			const id = generateId();
			await db.insert(schema.aiWriterContent).values({
				id,
				userId: input.userId,
				type: "linkedin_summary",
				contentSource: "ai_writer_linkedin_summary",
				name: `LinkedIn - ${new Date().toLocaleDateString()}`,
				originalInput: input.summary,
				generatedContent: optimized,
				linkedinKeywords: keywords,
				tags: [],
			});
			return { optimized, keywords, id };
		}

		return { optimized, keywords };
	},

	// Check grammar using REAL AI
	checkGrammar: async (input: { userId: string; text: string; role?: string }): Promise<AiWriterGrammarIssue[]> => {
		return checkGrammarWithAI(input.userId, input.text, input.role);
	},

	// Get statistics
	getStatistics: async (input: { userId: string }) => {
		const contents = await db
			.select()
			.from(schema.aiWriterContent)
			.where(eq(schema.aiWriterContent.userId, input.userId));

		const total = contents.length;
		const byType: Record<string, number> = {};
		const byTone: Record<string, number> = {};
		const favorites = contents.filter((c) => c.isFavorite).length;

		for (const content of contents) {
			if (content.type) {
				byType[content.type] = (byType[content.type] ?? 0) + 1;
			}
			if (content.tone) {
				byTone[content.tone] = (byTone[content.tone] ?? 0) + 1;
			}
		}

		return {
			total,
			byType,
			byTone,
			favorites,
			recentCount: contents.filter((c) => {
				const weekAgo = new Date();
				weekAgo.setDate(weekAgo.getDate() - 7);
				return c.createdAt > weekAgo;
			}).length,
		};
	},
};
