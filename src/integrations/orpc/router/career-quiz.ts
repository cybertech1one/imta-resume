import { ORPCError } from "@orpc/server";
import { generateText, Output } from "ai";
import z from "zod";
import { sanitizeAiInput } from "@/integrations/ai/sanitize";
import { adminProcedure, aiRateLimitedProcedure, protectedProcedure, publicProcedure } from "../context";
import { aiHistoryService } from "../services/ai-history";
import { aiQuotaService } from "../services/ai-quota";
import { careerQuizService } from "../services/career-quiz";
import { getServerModel } from "./ai-provider-utils";

// Zod schemas
const quizTypeSchema = z.enum(["career_assessment", "career_quiz", "remote_readiness"]);
const questionTypeSchema = z.enum(["multiple_choice", "scale"]);

const questionInputSchema = z.object({
	id: z.string().optional(),
	quizType: quizTypeSchema.default("career_assessment"),
	question: z.string().min(1),
	questionFr: z.string().optional(),
	description: z.string().optional(),
	descriptionFr: z.string().optional(),
	category: z.string().min(1),
	type: questionTypeSchema.default("multiple_choice"),
	trait: z.string().optional(),
	scaleMin: z.string().optional(),
	scaleMax: z.string().optional(),
	scaleMinFr: z.string().optional(),
	scaleMaxFr: z.string().optional(),
	isActive: z.boolean().optional(),
	sortOrder: z.number().optional(),
});

const optionInputSchema = z.object({
	id: z.string().optional(),
	questionId: z.string(),
	text: z.string().min(1),
	textFr: z.string().optional(),
	icon: z.string().optional(),
	scores: z.record(z.string(), z.number()).default({}),
	sortOrder: z.number().optional(),
});

const quizAnswerSchema = z.object({
	questionId: z.string(),
	optionId: z.string().optional(),
	scaleValue: z.number().optional(),
});

const resultInputSchema = z.object({
	quizType: quizTypeSchema,
	answers: z.array(quizAnswerSchema),
	personalityProfile: z.record(z.string(), z.number()),
	topMatches: z.array(z.any()),
});

// ============================================================================
// Questions Router (Public read, Admin write)
// ============================================================================

export const careerQuizQuestionsRouter = {
	// List questions (public)
	list: publicProcedure
		.route({
			method: "GET",
			path: "/career-quiz/questions/list",
			tags: ["Career Quiz"],
			summary: "List career quiz questions",
		})
		.input(
			z
				.object({
					quizType: quizTypeSchema.optional(),
					category: z.string().optional(),
					activeOnly: z.boolean().optional(),
				})
				.optional(),
		)
		.handler(async ({ input }) => {
			return careerQuizService.questions.list(input);
		}),

	// List questions with options (public)
	listWithOptions: publicProcedure
		.route({
			method: "GET",
			path: "/career-quiz/questions/list-with-options",
			tags: ["Career Quiz"],
			summary: "List questions with their options",
		})
		.input(
			z
				.object({
					quizType: quizTypeSchema.optional(),
					activeOnly: z.boolean().optional(),
				})
				.optional(),
		)
		.handler(async ({ input }) => {
			return careerQuizService.questions.listWithOptions(input);
		}),

	// Get single question (public)
	getById: publicProcedure
		.route({
			method: "GET",
			path: "/career-quiz/questions/{id}",
			tags: ["Career Quiz"],
			summary: "Get a question by ID",
		})
		.input(z.object({ id: z.string().uuid() }))
		.handler(async ({ input }) => {
			return careerQuizService.questions.getById(input.id);
		}),

	// Get question with options (public)
	getByIdWithOptions: publicProcedure
		.route({
			method: "GET",
			path: "/career-quiz/questions/{id}/with-options",
			tags: ["Career Quiz"],
			summary: "Get a question with its options",
		})
		.input(z.object({ id: z.string().uuid() }))
		.handler(async ({ input }) => {
			return careerQuizService.questions.getByIdWithOptions(input.id);
		}),

	// Get categories (public)
	getCategories: publicProcedure
		.route({
			method: "GET",
			path: "/career-quiz/questions/categories",
			tags: ["Career Quiz"],
			summary: "Get question categories",
		})
		.input(z.object({ quizType: quizTypeSchema.optional() }).optional())
		.handler(async ({ input }) => {
			return careerQuizService.questions.getCategories(input?.quizType);
		}),

	// Create question (admin only)
	create: adminProcedure
		.route({
			method: "POST",
			path: "/career-quiz/questions/create",
			tags: ["Career Quiz"],
			summary: "Create a new question",
		})
		.input(questionInputSchema)
		.handler(async ({ input }) => {
			return careerQuizService.questions.create(input);
		}),

	// Update question (admin only)
	update: adminProcedure
		.route({
			method: "PUT",
			path: "/career-quiz/questions/{id}",
			tags: ["Career Quiz"],
			summary: "Update a question",
		})
		.input(z.object({ id: z.string().uuid(), data: questionInputSchema.partial() }))
		.handler(async ({ input }) => {
			return careerQuizService.questions.update(input.id, input.data);
		}),

	// Delete question (admin only)
	delete: adminProcedure
		.route({
			method: "DELETE",
			path: "/career-quiz/questions/{id}",
			tags: ["Career Quiz"],
			summary: "Delete a question",
		})
		.input(z.object({ id: z.string().uuid() }))
		.handler(async ({ input }) => {
			await careerQuizService.questions.delete(input.id);
			return { success: true };
		}),
};

// ============================================================================
// Options Router (Admin only for writes)
// ============================================================================

export const careerQuizOptionsRouter = {
	// List options by question (public)
	listByQuestion: publicProcedure
		.route({
			method: "GET",
			path: "/career-quiz/options/by-question/{questionId}",
			tags: ["Career Quiz"],
			summary: "List options for a question",
		})
		.input(z.object({ questionId: z.string() }))
		.handler(async ({ input }) => {
			return careerQuizService.options.listByQuestion(input.questionId);
		}),

	// Create option (admin only)
	create: adminProcedure
		.route({
			method: "POST",
			path: "/career-quiz/options/create",
			tags: ["Career Quiz"],
			summary: "Create a new option",
		})
		.input(optionInputSchema)
		.handler(async ({ input }) => {
			return careerQuizService.options.create(input);
		}),

	// Update option (admin only)
	update: adminProcedure
		.route({
			method: "PUT",
			path: "/career-quiz/options/{id}",
			tags: ["Career Quiz"],
			summary: "Update an option",
		})
		.input(z.object({ id: z.string().uuid(), data: optionInputSchema.partial().omit({ questionId: true }) }))
		.handler(async ({ input }) => {
			return careerQuizService.options.update(input.id, input.data);
		}),

	// Delete option (admin only)
	delete: adminProcedure
		.route({
			method: "DELETE",
			path: "/career-quiz/options/{id}",
			tags: ["Career Quiz"],
			summary: "Delete an option",
		})
		.input(z.object({ id: z.string().uuid() }))
		.handler(async ({ input }) => {
			await careerQuizService.options.delete(input.id);
			return { success: true };
		}),
};

// ============================================================================
// Results Router (User-specific)
// ============================================================================

export const careerQuizResultsRouter = {
	// List user's results
	list: protectedProcedure
		.route({
			method: "GET",
			path: "/career-quiz/results/list",
			tags: ["Career Quiz"],
			summary: "List user quiz results",
		})
		.input(z.object({ quizType: quizTypeSchema.optional() }).optional())
		.handler(async ({ context, input }) => {
			return careerQuizService.results.list(context.user.id, input?.quizType);
		}),

	// Get latest result for a quiz type
	getLatest: protectedProcedure
		.route({
			method: "GET",
			path: "/career-quiz/results/latest",
			tags: ["Career Quiz"],
			summary: "Get latest result for a quiz type",
		})
		.input(z.object({ quizType: quizTypeSchema }))
		.handler(async ({ context, input }) => {
			return careerQuizService.results.getLatest(context.user.id, input.quizType);
		}),

	// Save quiz result
	save: protectedProcedure
		.route({
			method: "POST",
			path: "/career-quiz/results/save",
			tags: ["Career Quiz"],
			summary: "Save quiz result",
		})
		.input(resultInputSchema)
		.handler(async ({ context, input }) => {
			return careerQuizService.results.create({
				userId: context.user.id,
				...input,
			});
		}),

	// Delete result
	delete: protectedProcedure
		.route({
			method: "DELETE",
			path: "/career-quiz/results/{id}",
			tags: ["Career Quiz"],
			summary: "Delete a quiz result",
		})
		.input(z.object({ id: z.string().uuid() }))
		.handler(async ({ context, input }) => {
			await careerQuizService.results.delete(input.id, context.user.id);
			return { success: true };
		}),
};

// ============================================================================
// Seed Router (Admin only)
// ============================================================================

export const careerQuizSeedRouter = {
	// Seed questions
	questions: adminProcedure
		.route({
			method: "POST",
			path: "/career-quiz/seed/questions",
			tags: ["Career Quiz"],
			summary: "Seed quiz questions",
		})
		.input(z.array(questionInputSchema))
		.handler(async ({ input }) => {
			return careerQuizService.bulkSeed.questions(input);
		}),

	// Seed options
	options: adminProcedure
		.route({
			method: "POST",
			path: "/career-quiz/seed/options",
			tags: ["Career Quiz"],
			summary: "Seed quiz options",
		})
		.input(z.array(optionInputSchema))
		.handler(async ({ input }) => {
			return careerQuizService.bulkSeed.options(input);
		}),
};

// ============================================================================
// Adaptive AI Quiz Router
// ============================================================================

const adaptiveQuizInputSchema = z.object({
	field: z.string().default("général"),
	experienceYears: z.number().default(0),
	skills: z.array(z.string()).default([]),
	language: z.enum(["fr", "en", "ar"]).default("fr"),
	quizType: z
		.enum(["career_orientation", "field_discovery", "self_assessment", "technical_aptitude"])
		.default("career_orientation"),
	numberOfQuestions: z.number().min(5).max(20).default(10),
	previousResults: z.record(z.string(), z.number()).optional(),
});

const aiQuizQuestionSchema = z.object({
	id: z.string(),
	question: z.string(),
	questionFr: z.string(),
	category: z.string(),
	explanation: z.string(),
	explanationFr: z.string(),
	options: z.array(
		z.object({
			id: z.string(),
			text: z.string(),
			textFr: z.string(),
			scores: z.record(z.string(), z.number()),
		}),
	),
});

export const careerQuizAdaptiveRouter = {
	generate: aiRateLimitedProcedure.input(adaptiveQuizInputSchema).handler(async ({ input, context }) => {
		const quotaCheck = await aiQuotaService.checkQuota(context.user.id, "adaptive_quiz", context.user.role);
		if (!quotaCheck.allowed) {
			throw new ORPCError("FORBIDDEN", { message: quotaCheck.reason || "AI usage quota exceeded" });
		}

		const startTime = Date.now();
		const { field, experienceYears, skills, language, quizType, numberOfQuestions, previousResults } = input;

		const skillsList = skills.length > 0 ? skills.join(", ") : "non spécifié";
		const previousContext = previousResults
			? `\nPrevious assessment results: ${JSON.stringify(previousResults)}\nAdapt questions to probe weaker areas.`
			: "";

		const langName = language === "fr" ? "French" : language === "ar" ? "Arabic" : "English";

		const prompt =
			sanitizeAiInput(`Generate ${numberOfQuestions} career quiz questions personalized for this student profile:

Field of study: ${field}
Experience: ${experienceYears} years
Skills: ${skillsList}
Quiz type: ${quizType}
${previousContext}

Context: This is for IMTA (Institut des Métiers et Technologies Appliquées) students in Morocco.
The questions should help students discover their career aptitudes and interests.

Requirements:
1. Questions must be in BOTH English AND French
2. Each question must have exactly 4 options
3. Each option must have trait scores mapping to career traits (e.g. technical_aptitude, teamwork, leadership, analytical, communication, creativity, safety_focus, patient_care)
4. Questions should be adapted to the student's field and experience level
5. For ${quizType === "technical_aptitude" ? "technical aptitude" : quizType === "field_discovery" ? "field discovery" : quizType === "self_assessment" ? "self assessment" : "career orientation"} focus
6. Include situational questions relevant to Moroccan workplace culture
7. Reference real industries in Morocco (OCP, automotive, IT offshoring, renewable energy, logistics)
8. Each question needs an explanation in both languages

Return a JSON array of questions.`);

		try {
			const { model, config } = await getServerModel();
			const questionsOutputSchema = z.array(aiQuizQuestionSchema);

			const result = await generateText({
				model,
				temperature: 0.7,
				maxRetries: 2,
				maxOutputTokens: 4000,
				output: Output.object({ schema: questionsOutputSchema }),
				messages: [
					{
						role: "system",
						content: `You are a career counseling AI for IMTA Morocco. Generate personalized career assessment quiz questions.
Each question must help identify the student's strengths, interests, and ideal career path.
Questions should be culturally appropriate for Morocco, reference real companies and industries.
IMPORTANT: Generate all text in ${langName} as primary language, but include both English and French versions.
Output valid JSON only.`,
					},
					{ role: "user", content: prompt },
				],
			});

			const parsed = questionsOutputSchema.parse(result.output);

			await aiQuotaService.logUsage({
				userId: context.user.id,
				feature: "adaptive_quiz",
				providerId: config.id,
				provider: config.provider,
				model: config.model,
				status: "success",
				durationMs: Date.now() - startTime,
				inputTokens: result.usage.inputTokens,
				outputTokens: result.usage.outputTokens,
				totalTokens: result.usage.totalTokens,
			});

			aiHistoryService
				.save({
					userId: context.user.id,
					source: "adaptive_quiz",
					name: `Adaptive Quiz - ${field} (${quizType})`,
					inputData: input as unknown as Record<string, unknown>,
					outputData: { questions: parsed } as unknown as Record<string, unknown>,
					metadata: {
						tokens: {
							input: result.usage.inputTokens ?? 0,
							output: result.usage.outputTokens ?? 0,
							total: result.usage.totalTokens ?? 0,
						},
						model: config.model,
						provider: config.provider,
						language,
					},
				})
				.catch(() => {});

			return { questions: parsed, cached: false };
		} catch (error) {
			await aiQuotaService.logUsage({
				userId: context.user.id,
				feature: "adaptive_quiz",
				providerId: "",
				provider: "",
				model: "",
				status: "error",
				durationMs: Date.now() - startTime,
				errorMessage: error instanceof Error ? error.message : "Unknown error",
			});
			throw error instanceof ORPCError
				? error
				: new ORPCError("INTERNAL_SERVER_ERROR", { message: "Failed to generate adaptive quiz" });
		}
	}),
};
