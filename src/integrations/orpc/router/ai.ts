import { ORPCError } from "@orpc/server";
import { generateText, Output, streamText } from "ai";
import z, { flattenError, ZodError } from "zod";
import docxParserSystemPrompt from "@/integrations/ai/prompts/docx-parser-system.md?raw";
import docxParserUserPrompt from "@/integrations/ai/prompts/docx-parser-user.md?raw";
import fixGrammarSystemPrompt from "@/integrations/ai/prompts/fix-grammar-system.md?raw";
import generateHeadlineSystemPrompt from "@/integrations/ai/prompts/generate-headline-system.md?raw";
import generateSummarySystemPrompt from "@/integrations/ai/prompts/generate-summary-system.md?raw";
import improveContentSystemPrompt from "@/integrations/ai/prompts/improve-content-system.md?raw";
import pdfParserSystemPrompt from "@/integrations/ai/prompts/pdf-parser-system.md?raw";
import pdfParserUserPrompt from "@/integrations/ai/prompts/pdf-parser-user.md?raw";
import resumeAnalysisSystemPrompt from "@/integrations/ai/prompts/resume-analysis-system.md?raw";
import suggestSkillsSystemPrompt from "@/integrations/ai/prompts/suggest-skills-system.md?raw";
import { sanitizeAiInput, validateAiOutput } from "@/integrations/ai/sanitize";
import type * as schema from "@/integrations/drizzle/schema";
import { resumeAnalysisSchema } from "@/schema/resume/analysis";
import { defaultResumeData, resumeDataSchema } from "@/schema/resume/data";
import { aiRateLimitedProcedure } from "../context";
import { aiHistoryService } from "../services/ai-history";
import { aiQuotaService } from "../services/ai-quota";
import { userSettingsService } from "../services/user-settings";
import { type AIProvider, type getModel, getServerModel, getServerModelForProvider } from "./ai-provider-utils";

type UsageInfo = { inputTokens?: number; outputTokens?: number; totalTokens?: number };
type WithUsage<T> = { result: T; usage?: UsageInfo };

function normalizeAiResumeData(raw: Record<string, unknown>) {
	const str = (v: unknown, fallback = "") => (typeof v === "string" ? v : fallback);
	const url = (v: unknown) =>
		v && typeof v === "object" && "url" in v
			? { url: str((v as Record<string, unknown>).url), label: str((v as Record<string, unknown>).label) }
			: { url: "", label: "" };
	const id = () => crypto.randomUUID();

	const rawBasics = (raw.basics && typeof raw.basics === "object" ? raw.basics : {}) as Record<string, unknown>;
	const rawSummary = (raw.summary && typeof raw.summary === "object" ? raw.summary : {}) as Record<string, unknown>;
	const rawSections = (raw.sections && typeof raw.sections === "object" ? raw.sections : {}) as Record<string, unknown>;

	const normalizeItems = <T>(items: unknown, normalizer: (item: Record<string, unknown>) => T): T[] => {
		if (!Array.isArray(items)) return [];
		return items.map((item) => normalizer(typeof item === "object" && item ? (item as Record<string, unknown>) : {}));
	};

	const baseItem = (item: Record<string, unknown>) => ({
		id: str(item.id) || id(),
		hidden: item.hidden === true,
	});

	const normalizeSection = (
		sectionData: unknown,
		itemNormalizer: (item: Record<string, unknown>) => Record<string, unknown>,
	) => {
		const section =
			sectionData && typeof sectionData === "object" ? (sectionData as Record<string, unknown>) : { items: [] };
		return {
			title: str(section.title),
			columns: typeof section.columns === "number" ? section.columns : 1,
			hidden: section.hidden === true,
			items: normalizeItems(section.items, itemNormalizer),
		};
	};

	const data = {
		picture: defaultResumeData.picture,
		basics: {
			name: str(rawBasics.name),
			headline: str(rawBasics.headline),
			email: str(rawBasics.email),
			phone: str(rawBasics.phone),
			location: str(rawBasics.location),
			website: url(rawBasics.website),
			customFields: normalizeItems(rawBasics.customFields as unknown, (f) => ({
				id: str(f.id) || id(),
				icon: str(f.icon),
				text: str(f.text),
				link: str(f.link),
			})),
			cin: str(rawBasics.cin),
			militaryServiceStatus: "not-applicable" as const,
			dateOfBirth: str(rawBasics.dateOfBirth),
			nationality: str(rawBasics.nationality),
			maritalStatus: str(rawBasics.maritalStatus),
		},
		summary: {
			title: str(rawSummary.title),
			columns: typeof rawSummary.columns === "number" ? rawSummary.columns : 1,
			hidden: rawSummary.hidden === true,
			content: str(rawSummary.content || (typeof raw.summary === "string" ? raw.summary : "")),
		},
		sections: {
			profiles: normalizeSection(rawSections.profiles, (item) => ({
				...baseItem(item),
				icon: str(item.icon),
				network: str(item.network),
				username: str(item.username),
				website: url(item.website),
			})),
			experience: normalizeSection(rawSections.experience, (item) => ({
				...baseItem(item),
				company: str(item.company),
				position: str(item.position),
				location: str(item.location),
				period: str(item.period),
				website: url(item.website),
				description: str(item.description),
			})),
			education: normalizeSection(rawSections.education, (item) => ({
				...baseItem(item),
				school: str(item.school || item.institution),
				degree: str(item.degree),
				area: str(item.area),
				grade: str(item.grade),
				location: str(item.location),
				period: str(item.period),
				website: url(item.website),
				description: str(item.description),
			})),
			projects: normalizeSection(rawSections.projects, (item) => ({
				...baseItem(item),
				name: str(item.name),
				description: str(item.description),
				period: str(item.period),
				website: url(item.website),
				keywords: Array.isArray(item.keywords) ? item.keywords.filter((k: unknown) => typeof k === "string") : [],
			})),
			skills: normalizeSection(rawSections.skills, (item) => ({
				...baseItem(item),
				icon: str(item.icon),
				name: str(item.name),
				proficiency: str(item.proficiency || item.description),
				level: typeof item.level === "number" ? item.level : 0,
				keywords: Array.isArray(item.keywords) ? item.keywords.filter((k: unknown) => typeof k === "string") : [],
			})),
			languages: normalizeSection(rawSections.languages, (item) => ({
				...baseItem(item),
				language: str(item.language || item.name),
				fluency: str(item.fluency),
				level: typeof item.level === "number" ? item.level : 0,
			})),
			interests: normalizeSection(rawSections.interests, (item) => ({
				...baseItem(item),
				icon: str(item.icon),
				name: str(item.name),
				keywords: Array.isArray(item.keywords) ? item.keywords.filter((k: unknown) => typeof k === "string") : [],
			})),
			awards: normalizeSection(rawSections.awards, (item) => ({
				...baseItem(item),
				title: str(item.title),
				awarder: str(item.awarder),
				date: str(item.date),
				website: url(item.website),
				description: str(item.description),
			})),
			certifications: normalizeSection(rawSections.certifications, (item) => ({
				...baseItem(item),
				title: str(item.title),
				issuer: str(item.issuer),
				date: str(item.date),
				website: url(item.website),
				description: str(item.description),
			})),
			publications: normalizeSection(rawSections.publications, (item) => ({
				...baseItem(item),
				title: str(item.title),
				publisher: str(item.publisher),
				date: str(item.date),
				website: url(item.website),
				description: str(item.description),
			})),
			volunteer: normalizeSection(rawSections.volunteer, (item) => ({
				...baseItem(item),
				organization: str(item.organization),
				position: str(item.position),
				location: str(item.location),
				period: str(item.period),
				website: url(item.website),
				description: str(item.description),
			})),
			references: normalizeSection(rawSections.references, (item) => ({
				...baseItem(item),
				name: str(item.name),
				position: str(item.position),
				website: url(item.website),
				phone: str(item.phone),
				description: str(item.description),
			})),
			internships: normalizeSection(rawSections.internships, (item) => ({
				...baseItem(item),
				company: str(item.company),
				position: str(item.position),
				supervisor: str(item.supervisor),
				location: str(item.location),
				period: str(item.period),
				type: (["observation", "application", "end-of-studies", "professional", "other"] as const).includes(
					item.type as any,
				)
					? (item.type as "observation" | "application" | "end-of-studies" | "professional" | "other")
					: "application",
				website: url(item.website),
				tasksPerformed: str(item.tasksPerformed),
				skillsAcquired: Array.isArray(item.skillsAcquired)
					? item.skillsAcquired.filter((k: unknown) => typeof k === "string")
					: [],
				evaluation: str(item.evaluation),
			})),
		},
		customSections: [],
		metadata: defaultResumeData.metadata,
	};

	return resumeDataSchema.parse(data);
}

async function withQuotaAndLogging<T>(
	userId: string,
	feature: string,
	fn: (
		model: ReturnType<typeof getModel>,
		config: typeof schema.aiProviderConfig.$inferSelect,
	) => Promise<T | WithUsage<T>>,
	preferredProvider?: AIProvider,
): Promise<T> {
	// Check quota (role resolved inside checkQuota via DB lookup is not needed —
	// direct callers of checkQuota pass role explicitly; withQuotaAndLogging callers
	// are all behind aiRateLimitedProcedure which requires auth)
	const quotaCheck = await aiQuotaService.checkQuota(userId, feature);
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

	let model: ReturnType<typeof getModel>;
	let config: typeof schema.aiProviderConfig.$inferSelect;
	try {
		let serverModel: {
			model: ReturnType<typeof getModel>;
			config: typeof schema.aiProviderConfig.$inferSelect;
		} | null = null;
		if (preferredProvider) {
			serverModel = await getServerModelForProvider(preferredProvider);
		}
		if (!serverModel) {
			serverModel = await getServerModel();
		}
		model = serverModel.model;
		config = serverModel.config;
	} catch (error) {
		if (error instanceof ORPCError) throw error;
		console.error("[AI] Provider setup error:", error instanceof Error ? error.message : error);
		throw new ORPCError("PRECONDITION_FAILED", {
			message: "AI service unavailable. Please contact an administrator.",
		});
	}
	const startTime = Date.now();

	try {
		const fnResult = await fn(model, config);

		// Check if the callback returned usage info alongside the result
		let actualResult: T;
		let usage: UsageInfo | undefined;
		if (fnResult && typeof fnResult === "object" && "result" in fnResult && "usage" in fnResult) {
			const withUsage = fnResult as WithUsage<T>;
			actualResult = withUsage.result;
			usage = withUsage.usage;
		} else {
			actualResult = fnResult as T;
		}

		// Validate AI output for potential data exfiltration or credential leakage
		if (typeof actualResult === "string") {
			const validation = validateAiOutput(actualResult);
			if (!validation.safe) {
				console.warn(`[AI ${feature}] Output contained potentially unsafe content, redacted`);
				actualResult = validation.cleaned as T;
			}
		}

		await aiQuotaService.logUsage({
			userId,
			feature,
			providerId: config.id,
			provider: config.provider,
			model: config.model,
			status: "success",
			durationMs: Date.now() - startTime,
			inputTokens: usage?.inputTokens,
			outputTokens: usage?.outputTokens,
			totalTokens: usage?.totalTokens,
		});
		return actualResult;
	} catch (error) {
		if (error instanceof ORPCError) throw error;
		console.error(`[AI ${feature}] Error:`, error instanceof Error ? error.message : error);
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
			message: "AI processing failed. Please try again.",
		});
	}
}

const fileInputSchema = z.object({
	name: z.string().max(255),
	data: z.string().max(14 * 1024 * 1024), // ~10MB after base64 overhead
});

export const aiRouter = {
	testConnection: aiRateLimitedProcedure.handler(async function* ({ context }) {
		const quotaCheck = await aiQuotaService.checkQuota(context.user.id, "test_connection", context.user.role);
		if (!quotaCheck.allowed) {
			throw new ORPCError("FORBIDDEN", { message: quotaCheck.reason || "AI usage quota exceeded" });
		}
		const { model, config } = await getServerModel();
		const startTime = Date.now();

		const controller = new AbortController();
		const timeout = setTimeout(() => controller.abort(), 60_000);

		try {
			const stream = streamText({
				temperature: 0,
				model,
				maxOutputTokens: 10,
				messages: [{ role: "user", content: 'Respond with "1"' }],
				abortSignal: controller.signal,
			});

			yield* stream.textStream;

			// Log after streaming completes
			const usage = await stream.usage;
			await aiQuotaService.logUsage({
				userId: context.user.id,
				feature: "test_connection",
				providerId: config.id,
				provider: config.provider,
				model: config.model,
				status: "success",
				durationMs: Date.now() - startTime,
				inputTokens: usage.inputTokens,
				outputTokens: usage.outputTokens,
				totalTokens: usage.totalTokens,
			});
		} catch (error) {
			await aiQuotaService.logUsage({
				userId: context.user.id,
				feature: "test_connection",
				providerId: config.id,
				provider: config.provider,
				model: config.model,
				status: "error",
				errorMessage: error instanceof Error ? error.message : "Unknown error",
				durationMs: Date.now() - startTime,
			});
			throw error;
		} finally {
			clearTimeout(timeout);
		}
	}),

	parsePdf: aiRateLimitedProcedure
		.input(
			z.object({
				file: fileInputSchema,
			}),
		)
		.handler(async ({ input, context }) => {
			const parsed = await withQuotaAndLogging(
				context.user.id,
				"parse_pdf",
				async (model) => {
					try {
						const result = await generateText({
							model,
							maxRetries: 0,
							maxOutputTokens: 8000,
							messages: [
								{
									role: "system",
									content: `${pdfParserSystemPrompt}\n\nIMPORTANT: Respond ONLY with a valid JSON object, no markdown fences.`,
								},
								{
									role: "user",
									content: [
										{ type: "text", text: pdfParserUserPrompt },
										{
											type: "file",
											filename: input.file.name,
											mediaType: "application/pdf",
											data: input.file.data,
										},
									],
								},
							],
						});

						const jsonText = result.text
							.replace(/^```json\s*/, "")
							.replace(/```\s*$/, "")
							.trim();
						const rawData = JSON.parse(jsonText);

						const parsed = normalizeAiResumeData(rawData);

						return { result: parsed, usage: result.usage };
					} catch (error) {
						if (error instanceof ZodError) {
							const errors = flattenError(error);
							throw new Error(JSON.stringify(errors));
						}

						throw error;
					}
				},
				"gemini",
			);

			// Save to AI history (fire-and-forget)
			aiHistoryService
				.save({
					userId: context.user.id,
					source: "parse_pdf",
					generatedContent: `Parsed resume from ${input.file.name}`,
					outputData: { name: parsed.basics?.name, headline: parsed.basics?.headline },
					inputData: { fileName: input.file.name },
					metadata: { provider: "ai" },
				})
				.catch((err) => console.error("[AI History] Failed to save parse_pdf:", err));

			return parsed;
		}),

	parseDocx: aiRateLimitedProcedure
		.input(
			z.object({
				file: fileInputSchema,
				mediaType: z.enum([
					"application/msword",
					"application/vnd.openxmlformats-officedocument.wordprocessingml.document",
				]),
			}),
		)
		.handler(async ({ input, context }) => {
			const parsed = await withQuotaAndLogging(
				context.user.id,
				"parse_docx",
				async (model) => {
					try {
						const result = await generateText({
							model,
							maxRetries: 0,
							maxOutputTokens: 8000,
							messages: [
								{
									role: "system",
									content:
										docxParserSystemPrompt +
										"\n\nIMPORTANT: Respond ONLY with a valid JSON object, no markdown fences.",
								},
								{
									role: "user",
									content: [
										{ type: "text", text: docxParserUserPrompt },
										{
											type: "file",
											filename: input.file.name,
											mediaType: input.mediaType,
											data: input.file.data,
										},
									],
								},
							],
						});

						const jsonText = result.text
							.replace(/^```json\s*/, "")
							.replace(/```\s*$/, "")
							.trim();
						const rawData = JSON.parse(jsonText);

						const parsed = normalizeAiResumeData(rawData);

						return { result: parsed, usage: result.usage };
					} catch (error) {
						if (error instanceof ZodError) {
							const errors = flattenError(error);
							throw new Error(JSON.stringify(errors));
						}

						throw error;
					}
				},
				"gemini",
			);

			// Save to AI history (fire-and-forget)
			aiHistoryService
				.save({
					userId: context.user.id,
					source: "parse_docx",
					generatedContent: `Parsed resume from ${input.file.name}`,
					outputData: { name: parsed.basics?.name, headline: parsed.basics?.headline },
					inputData: { fileName: input.file.name },
					metadata: { provider: "ai" },
				})
				.catch((err) => console.error("[AI History] Failed to save parse_docx:", err));

			return parsed;
		}),

	improveContent: aiRateLimitedProcedure
		.input(
			z.object({
				content: z.string().min(1).max(10000),
				context: z.string().max(5000).optional(),
				language: z.string().optional(),
				resumeId: z.string().uuid().optional(),
			}),
		)
		.handler(async function* ({ input, context }) {
			const quotaCheck = await aiQuotaService.checkQuota(context.user.id, "improve_content", context.user.role);
			if (!quotaCheck.allowed) {
				throw new ORPCError("FORBIDDEN", { message: quotaCheck.reason || "AI usage quota exceeded" });
			}
			const { model, config } = await getServerModel();
			const startTime = Date.now();

			// Use provided language or fall back to user's preferred AI language
			const language = input.language || (await userSettingsService.getPreferredAiLanguage(context.user.id));

			let fullResponse = "";

			const controller = new AbortController();
			const timeout = setTimeout(() => controller.abort(), 60_000);

			try {
				const sanitizedContent = sanitizeAiInput(input.content);
				const sanitizedContext = input.context ? sanitizeAiInput(input.context) : undefined;

				const stream = streamText({
					temperature: 0.7,
					model,
					maxOutputTokens: 2000,
					messages: [
						{
							role: "system",
							content: `${improveContentSystemPrompt}\n\nIMPORTANT: Respond in ${language} language. Match the language of the original content if different.`,
						},
						{
							role: "user",
							content: sanitizedContext
								? `Context: ${sanitizedContext}\n\nContent to improve:\n${sanitizedContent}`
								: `Improve this resume content:\n${sanitizedContent}`,
						},
					],
					abortSignal: controller.signal,
				});

				// Stream to client while accumulating response
				for await (const chunk of stream.textStream) {
					fullResponse += chunk;
					yield chunk;
				}

				// Log after streaming completes
				const usage = await stream.usage;
				await aiQuotaService.logUsage({
					userId: context.user.id,
					feature: "improve_content",
					providerId: config.id,
					provider: config.provider,
					model: config.model,
					status: "success",
					durationMs: Date.now() - startTime,
					inputTokens: usage.inputTokens,
					outputTokens: usage.outputTokens,
					totalTokens: usage.totalTokens,
				});

				// Validate streamed output for security monitoring
				const streamValidation = validateAiOutput(fullResponse);
				if (!streamValidation.safe) {
					console.warn(
						`[AI improve_content] Streamed output contained potentially unsafe content for user ${context.user.id}`,
					);
				}

				// Save to AI history (fire-and-forget)
				aiHistoryService
					.save({
						userId: context.user.id,
						source: "improve_content",
						generatedContent: streamValidation.cleaned,
						inputData: { content: input.content, context: input.context, language },
						resumeId: input.resumeId,
						metadata: {
							tokens:
								usage.inputTokens !== undefined
									? { input: usage.inputTokens, output: usage.outputTokens ?? 0, total: usage.totalTokens ?? 0 }
									: undefined,
							model: config.model,
							provider: config.provider,
							language,
						},
					})
					.catch((err) => console.error("[AI History] Failed to save improve_content:", err));
			} catch (error) {
				await aiQuotaService.logUsage({
					userId: context.user.id,
					feature: "improve_content",
					providerId: config.id,
					provider: config.provider,
					model: config.model,
					status: "error",
					errorMessage: error instanceof Error ? error.message : "Unknown error",
					durationMs: Date.now() - startTime,
				});
				throw error;
			} finally {
				clearTimeout(timeout);
			}
		}),

	generateSummary: aiRateLimitedProcedure
		.input(
			z.object({
				resumeData: z.object({
					name: z.string().optional(),
					headline: z.string().optional(),
					experience: z
						.array(
							z.object({
								company: z.string().optional(),
								position: z.string().optional(),
								description: z.string().optional(),
							}),
						)
						.optional(),
					education: z
						.array(
							z.object({
								institution: z.string().optional(),
								degree: z.string().optional(),
								area: z.string().optional(),
							}),
						)
						.optional(),
					skills: z
						.array(
							z.object({
								name: z.string().optional(),
							}),
						)
						.optional(),
				}),
				language: z.string().optional(),
				resumeId: z.string().uuid().optional(),
			}),
		)
		.handler(async function* ({ input, context }) {
			const quotaCheck = await aiQuotaService.checkQuota(context.user.id, "generate_summary", context.user.role);
			if (!quotaCheck.allowed) {
				throw new ORPCError("FORBIDDEN", { message: quotaCheck.reason || "AI usage quota exceeded" });
			}
			const { model, config } = await getServerModel();
			const startTime = Date.now();

			// Use provided language or fall back to user's preferred AI language
			const language = input.language || (await userSettingsService.getPreferredAiLanguage(context.user.id));

			let fullResponse = "";

			const controller = new AbortController();
			const timeout = setTimeout(() => controller.abort(), 60_000);

			try {
				const { resumeData } = input;
				const experienceText =
					resumeData.experience
						?.map((e) => `${e.position || ""} at ${e.company || ""}: ${e.description || ""}`)
						.join("\n") || "";
				const educationText =
					resumeData.education
						?.map((e) => `${e.degree || ""} in ${e.area || ""} from ${e.institution || ""}`)
						.join("\n") || "";
				const skillsText = resumeData.skills?.map((s) => s.name).join(", ") || "";

				const stream = streamText({
					temperature: 0.7,
					model,
					maxOutputTokens: 1000,
					messages: [
						{
							role: "system",
							content: `${generateSummarySystemPrompt}\n\nIMPORTANT: Generate the summary in ${language} language.`,
						},
						{
							role: "user",
							content: sanitizeAiInput(`Generate a professional summary for this resume:

Name: ${resumeData.name || "Not provided"}
Current Title: ${resumeData.headline || "Not provided"}

Experience:
${experienceText || "Not provided"}

Education:
${educationText || "Not provided"}

Skills: ${skillsText || "Not provided"}`),
						},
					],
					abortSignal: controller.signal,
				});

				// Stream to client while accumulating response
				for await (const chunk of stream.textStream) {
					fullResponse += chunk;
					yield chunk;
				}

				// Log after streaming completes
				const usage = await stream.usage;
				await aiQuotaService.logUsage({
					userId: context.user.id,
					feature: "generate_summary",
					providerId: config.id,
					provider: config.provider,
					model: config.model,
					status: "success",
					durationMs: Date.now() - startTime,
					inputTokens: usage.inputTokens,
					outputTokens: usage.outputTokens,
					totalTokens: usage.totalTokens,
				});

				// Validate streamed output for security monitoring
				const streamValidation = validateAiOutput(fullResponse);
				if (!streamValidation.safe) {
					console.warn(
						`[AI generate_summary] Streamed output contained potentially unsafe content for user ${context.user.id}`,
					);
				}

				// Save to AI history (fire-and-forget)
				aiHistoryService
					.save({
						userId: context.user.id,
						source: "generate_summary",
						generatedContent: streamValidation.cleaned,
						inputData: { resumeData: input.resumeData, language },
						resumeId: input.resumeId,
						metadata: {
							tokens:
								usage.inputTokens !== undefined
									? { input: usage.inputTokens, output: usage.outputTokens ?? 0, total: usage.totalTokens ?? 0 }
									: undefined,
							model: config.model,
							provider: config.provider,
							language,
						},
					})
					.catch((err) => console.error("[AI History] Failed to save generate_summary:", err));
			} catch (error) {
				await aiQuotaService.logUsage({
					userId: context.user.id,
					feature: "generate_summary",
					providerId: config.id,
					provider: config.provider,
					model: config.model,
					status: "error",
					errorMessage: error instanceof Error ? error.message : "Unknown error",
					durationMs: Date.now() - startTime,
				});
				throw error;
			} finally {
				clearTimeout(timeout);
			}
		}),

	suggestSkills: aiRateLimitedProcedure
		.input(
			z.object({
				resumeData: z.object({
					experience: z
						.array(
							z.object({
								company: z.string().optional(),
								position: z.string().optional(),
								description: z.string().optional(),
							}),
						)
						.optional(),
					education: z
						.array(
							z.object({
								institution: z.string().optional(),
								degree: z.string().optional(),
								area: z.string().optional(),
							}),
						)
						.optional(),
					existingSkills: z.array(z.string()).optional(),
				}),
				language: z.string().optional(),
				resumeId: z.string().uuid().optional(),
			}),
		)
		.handler(async ({ input, context }) => {
			// Use provided language or fall back to user's preferred AI language
			const language = input.language || (await userSettingsService.getPreferredAiLanguage(context.user.id));

			const skills = await withQuotaAndLogging(context.user.id, "suggest_skills", async (model) => {
				const { resumeData } = input;
				const experienceText =
					resumeData.experience
						?.map((e) => `${e.position || ""} at ${e.company || ""}: ${e.description || ""}`)
						.join("\n") || "";
				const educationText =
					resumeData.education
						?.map((e) => `${e.degree || ""} in ${e.area || ""} from ${e.institution || ""}`)
						.join("\n") || "";

				const skillsOutputSchema = z.array(
					z.object({
						name: z.string(),
						level: z.number().min(1).max(5),
					}),
				);

				const result = await generateText({
					temperature: 0.5,
					model,
					maxRetries: 2,
					maxOutputTokens: 1000,
					output: Output.object({ schema: skillsOutputSchema }),
					messages: [
						{
							role: "system",
							content: `${suggestSkillsSystemPrompt}\n\nIMPORTANT: Use ${language} language for skill names where appropriate.`,
						},
						{
							role: "user",
							content: sanitizeAiInput(`Based on this resume, suggest relevant skills:

Experience:
${experienceText || "Not provided"}

Education:
${educationText || "Not provided"}

Already listed skills (do not duplicate): ${resumeData.existingSkills?.join(", ") || "None"}`),
						},
					],
				});

				return { result: skillsOutputSchema.parse(result.output), usage: result.usage };
			});

			// Save to AI history
			if (skills.length > 0) {
				aiHistoryService
					.save({
						userId: context.user.id,
						source: "suggest_skills",
						generatedContent: skills.map((s) => `${s.name} (Level ${s.level})`).join("\n"),
						outputData: { skills },
						inputData: { resumeData: input.resumeData, language },
						resumeId: input.resumeId,
						metadata: { language },
					})
					.catch((err) => console.error("[AI History] Failed to save suggest_skills:", err));
			}

			return skills;
		}),

	generateHeadline: aiRateLimitedProcedure
		.input(
			z.object({
				resumeData: z.object({
					name: z.string().optional(),
					currentHeadline: z.string().optional(),
					experience: z
						.array(
							z.object({
								company: z.string().optional(),
								position: z.string().optional(),
							}),
						)
						.optional(),
					skills: z.array(z.string()).optional(),
				}),
				language: z.string().optional(),
				resumeId: z.string().uuid().optional(),
			}),
		)
		.handler(async function* ({ input, context }) {
			const quotaCheck = await aiQuotaService.checkQuota(context.user.id, "generate_headline", context.user.role);
			if (!quotaCheck.allowed) {
				throw new ORPCError("FORBIDDEN", { message: quotaCheck.reason || "AI usage quota exceeded" });
			}
			const { model, config } = await getServerModel();
			const startTime = Date.now();

			// Use provided language or fall back to user's preferred AI language
			const language = input.language || (await userSettingsService.getPreferredAiLanguage(context.user.id));

			try {
				const { resumeData } = input;
				const recentPositions =
					resumeData.experience
						?.slice(0, 3)
						.map((e) => e.position)
						.filter(Boolean)
						.join(", ") || "";
				const topSkills = resumeData.skills?.slice(0, 5).join(", ") || "";

				const result = await generateText({
					temperature: 0.7,
					model,
					maxOutputTokens: 200,
					messages: [
						{
							role: "system",
							content: `${generateHeadlineSystemPrompt}\n\nGenerate the headline in ${language} language.`,
						},
						{
							role: "user",
							content: sanitizeAiInput(`Generate a brand new professional headline for:

Name: ${resumeData.name || "Not provided"}
Current/Recent Positions: ${recentPositions || "Not provided"}
Key Skills: ${topSkills || "Not provided"}
${resumeData.currentHeadline ? `Current Headline (DO NOT reuse or slightly modify this — generate something completely different): ${resumeData.currentHeadline}` : ""}`),
						},
					],
				});

				const headline = result.text.trim();
				yield headline;

				// Log after completion
				await aiQuotaService.logUsage({
					userId: context.user.id,
					feature: "generate_headline",
					providerId: config.id,
					provider: config.provider,
					model: config.model,
					status: "success",
					durationMs: Date.now() - startTime,
					inputTokens: result.usage.inputTokens,
					outputTokens: result.usage.outputTokens,
					totalTokens: result.usage.totalTokens,
				});

				// Save to AI history
				await aiHistoryService.save({
					userId: context.user.id,
					source: "generate_headline",
					generatedContent: headline,
					inputData: { resumeData: input.resumeData, language },
					resumeId: input.resumeId,
					metadata: {
						tokens:
							result.usage.inputTokens !== undefined
								? {
										input: result.usage.inputTokens,
										output: result.usage.outputTokens ?? 0,
										total: result.usage.totalTokens ?? 0,
									}
								: undefined,
						model: config.model,
						provider: config.provider,
						language,
					},
				});
			} catch (error) {
				await aiQuotaService.logUsage({
					userId: context.user.id,
					feature: "generate_headline",
					providerId: config.id,
					provider: config.provider,
					model: config.model,
					status: "error",
					errorMessage: error instanceof Error ? error.message : "Unknown error",
					durationMs: Date.now() - startTime,
				});
				throw error;
			}
		}),

	fixGrammar: aiRateLimitedProcedure
		.input(
			z.object({
				content: z.string().min(1).max(10000),
				language: z.string().optional(),
				resumeId: z.string().uuid().optional(),
			}),
		)
		.handler(async function* ({ input, context }) {
			const quotaCheck = await aiQuotaService.checkQuota(context.user.id, "fix_grammar", context.user.role);
			if (!quotaCheck.allowed) {
				throw new ORPCError("FORBIDDEN", { message: quotaCheck.reason || "AI usage quota exceeded" });
			}
			const { model, config } = await getServerModel();
			const startTime = Date.now();

			// Use provided language or fall back to user's preferred AI language
			const language = input.language || (await userSettingsService.getPreferredAiLanguage(context.user.id));

			let fullResponse = "";

			const controller = new AbortController();
			const timeout = setTimeout(() => controller.abort(), 60_000);

			try {
				const stream = streamText({
					temperature: 0.3,
					model,
					maxOutputTokens: 2000,
					messages: [
						{
							role: "system",
							content: `${fixGrammarSystemPrompt}\n\nThe content is in ${language} language. Preserve the language.`,
						},
						{
							role: "user",
							content: sanitizeAiInput(input.content),
						},
					],
					abortSignal: controller.signal,
				});

				// Stream to client while accumulating response
				for await (const chunk of stream.textStream) {
					fullResponse += chunk;
					yield chunk;
				}

				// Log after streaming completes
				const usage = await stream.usage;
				await aiQuotaService.logUsage({
					userId: context.user.id,
					feature: "fix_grammar",
					providerId: config.id,
					provider: config.provider,
					model: config.model,
					status: "success",
					durationMs: Date.now() - startTime,
					inputTokens: usage.inputTokens,
					outputTokens: usage.outputTokens,
					totalTokens: usage.totalTokens,
				});

				// Validate streamed output for security monitoring
				const streamValidation = validateAiOutput(fullResponse);
				if (!streamValidation.safe) {
					console.warn(
						`[AI fix_grammar] Streamed output contained potentially unsafe content for user ${context.user.id}`,
					);
				}

				// Save to AI history (fire-and-forget)
				aiHistoryService
					.save({
						userId: context.user.id,
						source: "fix_grammar",
						generatedContent: streamValidation.cleaned,
						inputData: { content: input.content, language },
						resumeId: input.resumeId,
						metadata: {
							tokens:
								usage.inputTokens !== undefined
									? { input: usage.inputTokens, output: usage.outputTokens ?? 0, total: usage.totalTokens ?? 0 }
									: undefined,
							model: config.model,
							provider: config.provider,
							language,
						},
					})
					.catch((err) => console.error("[AI History] Failed to save fix_grammar:", err));
			} catch (error) {
				await aiQuotaService.logUsage({
					userId: context.user.id,
					feature: "fix_grammar",
					providerId: config.id,
					provider: config.provider,
					model: config.model,
					status: "error",
					errorMessage: error instanceof Error ? error.message : "Unknown error",
					durationMs: Date.now() - startTime,
				});
				throw error;
			} finally {
				clearTimeout(timeout);
			}
		}),

	analyzeResume: aiRateLimitedProcedure
		.input(
			z.object({
				resumeData: z.object({
					picture: z.object({
						hidden: z.boolean(),
						url: z.string(),
					}),
					basics: z.object({
						name: z.string(),
						headline: z.string(),
						email: z.string(),
						phone: z.string(),
						location: z.string(),
						website: z.object({ url: z.string(), label: z.string() }),
						customFields: z.array(
							z.object({
								id: z.string().uuid(),
								icon: z.string(),
								text: z.string(),
								link: z.string(),
							}),
						),
					}),
					summary: z.object({
						title: z.string(),
						hidden: z.boolean(),
						content: z.string(),
					}),
					sections: z.object({
						profiles: z.object({
							title: z.string(),
							hidden: z.boolean(),
							items: z.array(
								z.object({
									network: z.string(),
									username: z.string(),
								}),
							),
						}),
						experience: z.object({
							title: z.string(),
							hidden: z.boolean(),
							items: z.array(
								z.object({
									company: z.string(),
									position: z.string(),
									location: z.string(),
									period: z.string(),
									description: z.string(),
								}),
							),
						}),
						education: z.object({
							title: z.string(),
							hidden: z.boolean(),
							items: z.array(
								z.object({
									school: z.string(),
									degree: z.string(),
									area: z.string(),
									grade: z.string(),
									location: z.string(),
									period: z.string(),
									description: z.string(),
								}),
							),
						}),
						skills: z.object({
							title: z.string(),
							hidden: z.boolean(),
							items: z.array(
								z.object({
									name: z.string(),
									level: z.number(),
									keywords: z.array(z.string()),
								}),
							),
						}),
						languages: z.object({
							title: z.string(),
							hidden: z.boolean(),
							items: z.array(
								z.object({
									language: z.string(),
									fluency: z.string(),
									level: z.number(),
								}),
							),
						}),
						certifications: z.object({
							title: z.string(),
							hidden: z.boolean(),
							items: z.array(
								z.object({
									title: z.string(),
									issuer: z.string(),
									date: z.string(),
									description: z.string(),
								}),
							),
						}),
						projects: z.object({
							title: z.string(),
							hidden: z.boolean(),
							items: z.array(
								z.object({
									name: z.string(),
									description: z.string(),
									period: z.string(),
								}),
							),
						}),
						awards: z.object({
							title: z.string(),
							hidden: z.boolean(),
							items: z.array(
								z.object({
									title: z.string(),
									awarder: z.string(),
									date: z.string(),
								}),
							),
						}),
						volunteer: z.object({
							title: z.string(),
							hidden: z.boolean(),
							items: z.array(
								z.object({
									organization: z.string(),
									location: z.string(),
									period: z.string(),
									description: z.string(),
								}),
							),
						}),
						interests: z.object({
							title: z.string(),
							hidden: z.boolean(),
							items: z.array(
								z.object({
									name: z.string(),
									keywords: z.array(z.string()),
								}),
							),
						}),
						references: z.object({
							title: z.string(),
							hidden: z.boolean(),
							items: z.array(
								z.object({
									name: z.string(),
									position: z.string(),
									phone: z.string(),
									description: z.string(),
								}),
							),
						}),
						publications: z.object({
							title: z.string(),
							hidden: z.boolean(),
							items: z.array(
								z.object({
									title: z.string(),
									publisher: z.string(),
									date: z.string(),
									description: z.string(),
								}),
							),
						}),
					}),
				}),
				language: z.string().optional(),
				resumeId: z.string().uuid().optional(),
			}),
		)
		.handler(async ({ input, context }) => {
			// Use provided language or fall back to user's preferred AI language
			const language = input.language || (await userSettingsService.getPreferredAiLanguage(context.user.id));

			const analysis = await withQuotaAndLogging(context.user.id, "analyze_resume", async (model) => {
				const { resumeData } = input;

				// Build a comprehensive resume text for analysis
				const profilesText =
					resumeData.sections.profiles.items.map((p) => `${p.network}: ${p.username}`).join(", ") || "None";

				const experienceText =
					resumeData.sections.experience.items
						.map((e) => `${e.position} at ${e.company} (${e.period}) - ${e.location}\n${e.description}`)
						.join("\n\n") || "None";

				const educationText =
					resumeData.sections.education.items
						.map(
							(e) =>
								`${e.degree} in ${e.area} at ${e.school} (${e.period}) - ${e.location}\nGrade: ${e.grade}\n${e.description}`,
						)
						.join("\n\n") || "None";

				const skillsText =
					resumeData.sections.skills.items
						.map((s) => `${s.name} (Level: ${s.level}/5) - Keywords: ${s.keywords.join(", ")}`)
						.join("\n") || "None";

				const languagesText =
					resumeData.sections.languages.items
						.map((l) => `${l.language}: ${l.fluency} (Level: ${l.level}/5)`)
						.join("\n") || "None";

				const certificationsText =
					resumeData.sections.certifications.items
						.map((c) => `${c.title} by ${c.issuer} (${c.date})\n${c.description}`)
						.join("\n\n") || "None";

				const projectsText =
					resumeData.sections.projects.items.map((p) => `${p.name} (${p.period})\n${p.description}`).join("\n\n") ||
					"None";

				const awardsText =
					resumeData.sections.awards.items.map((a) => `${a.title} by ${a.awarder} (${a.date})`).join("\n") || "None";

				const volunteerText =
					resumeData.sections.volunteer.items
						.map((v) => `${v.organization} - ${v.location} (${v.period})\n${v.description}`)
						.join("\n\n") || "None";

				const interestsText =
					resumeData.sections.interests.items.map((i) => `${i.name}: ${i.keywords.join(", ")}`).join("\n") || "None";

				const referencesText =
					resumeData.sections.references.items.map((r) => `${r.name} - ${r.position}\n${r.description}`).join("\n\n") ||
					"None";

				const publicationsText =
					resumeData.sections.publications.items
						.map((p) => `${p.title} - ${p.publisher} (${p.date})\n${p.description}`)
						.join("\n\n") || "None";

				const customFieldsText =
					resumeData.basics.customFields.map((f) => `${f.icon || "Field"}: ${f.text}`).join("\n") || "None";

				const resumeText = `
# RESUME DATA FOR ANALYSIS

## Basic Information
- Name: ${resumeData.basics.name || "Not provided"}
- Headline: ${resumeData.basics.headline || "Not provided"}
- Email: ${resumeData.basics.email ? "[provided]" : "Not provided"}
- Phone: ${resumeData.basics.phone ? "[provided]" : "Not provided"}
- Location: ${resumeData.basics.location || "Not provided"}
- Website: ${resumeData.basics.website.url ? "[provided]" : "Not provided"}

## Photo Status
- Has Photo: ${!resumeData.picture.hidden && resumeData.picture.url ? "Yes" : "No"}

## Custom Fields (Personal Information)
${customFieldsText}

## Summary
${resumeData.summary.hidden ? "Hidden" : resumeData.summary.content || "Not provided"}

## Social Profiles
${profilesText}

## Experience
${experienceText}

## Education
${educationText}

## Skills
${skillsText}

## Languages
${languagesText}

## Certifications
${certificationsText}

## Projects
${projectsText}

## Awards
${awardsText}

## Volunteer Experience
${volunteerText}

## Interests
${interestsText}

## References
${referencesText}

## Publications
${publicationsText}
`;

				try {
					const result = await generateText({
						model,
						temperature: 0.3,
						maxRetries: 2,
						maxOutputTokens: 4000,
						output: Output.object({ schema: resumeAnalysisSchema }),
						messages: [
							{
								role: "system",
								content: `${resumeAnalysisSystemPrompt}\n\nIMPORTANT: Respond in ${language} language for all text content in the analysis (messages, suggestions, etc.). However, keep JSON keys in English.`,
							},
							{
								role: "user",
								content: sanitizeAiInput(
									`Please analyze this resume for a student/job seeker in the Moroccan job market:\n\n${resumeText}`,
									8000,
								),
							},
						],
					});

					return { result: resumeAnalysisSchema.parse(result.output), usage: result.usage };
				} catch (error) {
					if (error instanceof ZodError) {
						const errors = flattenError(error);
						throw new Error(JSON.stringify(errors));
					}
					throw error;
				}
			});

			// Save to AI history
			aiHistoryService
				.save({
					userId: context.user.id,
					source: "analyze_resume",
					generatedContent: `Score: ${analysis.overallScore}/100`,
					outputData: analysis,
					inputData: { resumeData: input.resumeData, language },
					resumeId: input.resumeId,
					metadata: { language },
				})
				.catch((err) => console.error("[AI History] Failed to save analyze_resume:", err));

			return analysis;
		}),

	resumeGapAnalysis: aiRateLimitedProcedure
		.input(
			z.object({
				// SECURITY: Limit resume data size to prevent Denial-of-Wallet via oversized payloads
				resumeData: z.record(z.string(), z.unknown()).refine((data) => JSON.stringify(data).length <= 50_000, {
					message: "Resume data too large (max 50KB)",
				}),
				targetRole: z.string().max(256).optional(),
				field: z.string().max(128).optional(),
			}),
		)
		.handler(async ({ input, context }) => {
			const gapOutputSchema = z.object({
				overallScore: z.number().min(0).max(100),
				gaps: z.array(
					z.object({
						section: z.string(),
						issue: z.string(),
						severity: z.enum(["high", "medium", "low"]),
						suggestion: z.string(),
					}),
				),
				strengths: z.array(z.string()),
				weaknesses: z.array(z.string()),
				recommendations: z.array(z.string()),
			});

			const result = await withQuotaAndLogging(context.user.id, "resume_gap_analysis", async (model) => {
				const userMessage = [
					"Analyse ce CV et identifie les lacunes.",
					input.targetRole ? `Poste cible: ${input.targetRole}` : "",
					input.field ? `Domaine: ${input.field}` : "",
					"",
					"CV:",
					JSON.stringify(input.resumeData, null, 2),
				]
					.filter(Boolean)
					.join("\n");

				const aiResult = await generateText({
					model,
					temperature: 0.4,
					maxRetries: 2,
					maxOutputTokens: 4000,
					output: Output.object({ schema: gapOutputSchema }),
					messages: [
						{
							role: "system",
							content:
								"Tu es un expert en recrutement et en revision de CV pour le marche marocain et international. Analyse ce CV et identifie les lacunes, les sections faibles, et les ameliorations possibles. Respond ONLY with valid JSON matching the requested schema.",
						},
						{
							role: "user",
							content: sanitizeAiInput(userMessage, 8000),
						},
					],
				});

				return { result: gapOutputSchema.parse(aiResult.output), usage: aiResult.usage };
			});

			// Save to AI history (fire-and-forget)
			aiHistoryService
				.save({
					userId: context.user.id,
					source: "resume_gap_analysis",
					generatedContent: `Score: ${result.overallScore}/100 - ${result.gaps.length} gaps found`,
					outputData: result,
					inputData: { targetRole: input.targetRole, field: input.field },
					metadata: { provider: "ai" },
				})
				.catch((err) => console.error("[AI History] Failed to save resume_gap_analysis:", err));

			return result;
		}),

	adaptResumeToJob: aiRateLimitedProcedure
		.input(
			z.object({
				resumeData: z.record(z.string(), z.unknown()).refine((data) => JSON.stringify(data).length <= 50_000, {
					message: "Resume data too large (max 50KB)",
				}),
				jobDescription: z.string().min(10).max(10000),
				language: z.enum(["fr", "en"]).default("fr"),
			}),
		)
		.handler(async ({ input, context }) => {
			const adaptOutputSchema = z.object({
				adaptedSections: z.object({
					summary: z.string().optional(),
					headline: z.string().optional(),
					skills: z
						.array(
							z.object({
								name: z.string(),
								keywords: z.array(z.string()),
							}),
						)
						.optional(),
					experienceHighlights: z.array(z.string()).optional(),
				}),
				matchScore: z.number().min(0).max(100),
				keywordsToAdd: z.array(z.string()),
				keywordsMatched: z.array(z.string()),
				suggestions: z.array(z.string()),
			});

			const result = await withQuotaAndLogging(context.user.id, "resume_adapt_job", async (model) => {
				const userMessage = [
					`Langue de reponse: ${input.language === "en" ? "anglais" : "francais"}`,
					"",
					"CV:",
					JSON.stringify(input.resumeData, null, 2),
					"",
					"Offre d'emploi:",
					input.jobDescription,
				].join("\n");

				const aiResult = await generateText({
					model,
					temperature: 0.4,
					maxRetries: 2,
					maxOutputTokens: 4000,
					output: Output.object({ schema: adaptOutputSchema }),
					messages: [
						{
							role: "system",
							content:
								"Tu es un expert en optimisation de CV. Adapte ce CV pour correspondre au mieux a l'offre d'emploi fournie. Reecris les sections pertinentes pour mettre en valeur les competences et experiences qui correspondent au poste. Respond ONLY with valid JSON matching the requested schema.",
						},
						{
							role: "user",
							content: sanitizeAiInput(userMessage, 8000),
						},
					],
				});

				return { result: adaptOutputSchema.parse(aiResult.output), usage: aiResult.usage };
			});

			// Save to AI history (fire-and-forget)
			aiHistoryService
				.save({
					userId: context.user.id,
					source: "resume_adapt_job",
					generatedContent: `Match score: ${result.matchScore}/100 - ${result.keywordsMatched.length} keywords matched`,
					outputData: result,
					inputData: { jobDescription: input.jobDescription.slice(0, 200), language: input.language },
					metadata: { provider: "ai", language: input.language },
				})
				.catch((err) => console.error("[AI History] Failed to save resume_adapt_job:", err));

			return result;
		}),

	resumeWizardChat: aiRateLimitedProcedure
		.input(
			z.object({
				resumeData: z
					.record(z.string(), z.unknown())
					.refine((data) => JSON.stringify(data).length <= 50_000, {
						message: "Resume data too large (max 50KB)",
					})
					.optional(),
				message: z.string().min(1).max(2000),
				context: z.string().max(10000).optional(),
				step: z.enum(["basics", "summary", "experience", "education", "skills", "review"]).optional(),
			}),
		)
		.handler(async ({ input, context }) => {
			const wizardOutputSchema = z.object({
				response: z.string(),
				suggestedChanges: z.record(z.string(), z.unknown()).optional(),
				nextStep: z.string().optional(),
				isComplete: z.boolean().optional(),
			});

			const result = await withQuotaAndLogging(context.user.id, "resume_wizard_chat", async (model) => {
				const userMessage = [
					input.step ? `Etape actuelle: ${input.step}` : "",
					input.resumeData ? `CV actuel:\n${JSON.stringify(input.resumeData, null, 2)}` : "",
					input.context ? `Contexte:\n${input.context}` : "",
					"",
					`Message de l'utilisateur: ${input.message}`,
				]
					.filter(Boolean)
					.join("\n");

				const aiResult = await generateText({
					model,
					temperature: 0.6,
					maxRetries: 2,
					maxOutputTokens: 2000,
					output: Output.object({ schema: wizardOutputSchema }),
					messages: [
						{
							role: "system",
							content:
								"Tu es un assistant de creation de CV pour les diplomes IMTA Maroc. Guide l'utilisateur pour ameliorer ou creer son CV. Pose des questions pertinentes et propose des ameliorations concretes. Reponds en francais. Respond ONLY with valid JSON matching the requested schema.",
						},
						{
							role: "user",
							content: sanitizeAiInput(userMessage, 8000),
						},
					],
				});

				return { result: wizardOutputSchema.parse(aiResult.output), usage: aiResult.usage };
			});

			// Save to AI history (fire-and-forget)
			aiHistoryService
				.save({
					userId: context.user.id,
					source: "resume_wizard_chat",
					generatedContent: result.response,
					inputData: { message: input.message, step: input.step },
					metadata: { provider: "ai" },
				})
				.catch((err) => console.error("[AI History] Failed to save resume_wizard_chat:", err));

			return result;
		}),

	generateResume: aiRateLimitedProcedure
		.input(
			z.object({
				fullName: z.string().min(1).max(128),
				email: z.string().email().optional(),
				phone: z.string().max(32).optional(),
				targetJob: z.string().min(1).max(256),
				yearsExperience: z.number().min(0).max(50).optional(),
				skills: z.array(z.string().max(64)).max(30),
				education: z.string().max(2000).optional(),
				experience: z.string().max(5000).optional(),
				language: z.enum(["fr", "en"]).default("fr"),
			}),
		)
		.handler(async ({ input, context }) => {
			const generateOutputSchema = z.object({
				headline: z.string(),
				summary: z.string(),
				experience: z.array(
					z.object({
						company: z.string(),
						position: z.string(),
						location: z.string().optional(),
						period: z.string().optional(),
						description: z.string(),
					}),
				),
				education: z.array(
					z.object({
						school: z.string(),
						degree: z.string(),
						area: z.string().optional(),
						location: z.string().optional(),
						period: z.string().optional(),
						description: z.string().optional(),
					}),
				),
				skills: z.array(
					z.object({
						name: z.string(),
						keywords: z.array(z.string()),
					}),
				),
				languages: z
					.array(
						z.object({
							language: z.string(),
							fluency: z.string(),
						}),
					)
					.optional(),
			});

			const generated = await withQuotaAndLogging(context.user.id, "generate_resume", async (model) => {
				const langLabel = input.language === "en" ? "anglais" : "francais";
				const userMessage = [
					`Genere un CV professionnel complet en ${langLabel} pour le marche marocain.`,
					"",
					`Nom complet: ${input.fullName}`,
					input.email ? `Email: ${input.email}` : "",
					input.phone ? `Telephone: ${input.phone}` : "",
					`Poste cible: ${input.targetJob}`,
					input.yearsExperience !== undefined ? `Annees d'experience: ${input.yearsExperience}` : "",
					input.skills.length > 0 ? `Competences cles: ${input.skills.join(", ")}` : "",
					input.education ? `Formation: ${input.education}` : "",
					input.experience ? `Experience: ${input.experience}` : "",
					"",
					"Genere un CV realiste et professionnel avec des descriptions detaillees.",
					"Pour les experiences, ecris des descriptions riches avec des realisations concretes.",
					"Pour les competences, regroupe-les par categorie avec des mots-cles.",
					"Inclus au moins 2 langues (Francais et une autre).",
				]
					.filter(Boolean)
					.join("\n");

				const aiResult = await generateText({
					model,
					temperature: 0.6,
					maxRetries: 2,
					maxOutputTokens: 4000,
					output: Output.object({ schema: generateOutputSchema }),
					messages: [
						{
							role: "system",
							content:
								"Tu es un expert en creation de CV professionnels pour le marche marocain et international. " +
								"Genere un CV complet, professionnel et pret a l'emploi. " +
								"Les descriptions d'experience doivent etre detaillees avec des realisations mesurables. " +
								"Utilise un format HTML pour les descriptions (balises <p>, <ul>, <li>). " +
								"Respond ONLY with valid JSON matching the requested schema.",
						},
						{
							role: "user",
							content: sanitizeAiInput(userMessage, 8000),
						},
					],
				});

				return { result: generateOutputSchema.parse(aiResult.output), usage: aiResult.usage };
			});

			// Build a full ResumeData object using defaults + AI-generated content
			const id = () => crypto.randomUUID();
			const resumeData = {
				...defaultResumeData,
				basics: {
					...defaultResumeData.basics,
					name: input.fullName,
					headline: generated.headline,
					email: input.email ?? "",
					phone: input.phone ?? "",
				},
				summary: {
					title: input.language === "en" ? "Summary" : "Resume",
					columns: 1,
					hidden: false,
					content: generated.summary,
				},
				sections: {
					...defaultResumeData.sections,
					experience: {
						title: input.language === "en" ? "Experience" : "Experience professionnelle",
						columns: 1,
						hidden: false,
						items: generated.experience.map((exp) => ({
							id: id(),
							hidden: false,
							company: exp.company,
							position: exp.position,
							location: exp.location ?? "",
							period: exp.period ?? "",
							website: { url: "", label: "" },
							description: exp.description,
						})),
					},
					education: {
						title: input.language === "en" ? "Education" : "Formation",
						columns: 1,
						hidden: false,
						items: generated.education.map((edu) => ({
							id: id(),
							hidden: false,
							school: edu.school,
							degree: edu.degree,
							area: edu.area ?? "",
							grade: "",
							location: edu.location ?? "",
							period: edu.period ?? "",
							website: { url: "", label: "" },
							description: edu.description ?? "",
						})),
					},
					skills: {
						title: input.language === "en" ? "Skills" : "Competences",
						columns: 2,
						hidden: false,
						items: generated.skills.map((skill) => ({
							id: id(),
							hidden: false,
							icon: "",
							name: skill.name,
							proficiency: "",
							level: 0,
							keywords: skill.keywords,
						})),
					},
					languages: {
						title: input.language === "en" ? "Languages" : "Langues",
						columns: 2,
						hidden: false,
						items: (generated.languages ?? []).map((lang) => ({
							id: id(),
							hidden: false,
							language: lang.language,
							fluency: lang.fluency,
							level: 0,
						})),
					},
				},
				metadata: {
					...defaultResumeData.metadata,
					page: {
						...defaultResumeData.metadata.page,
						locale: input.language === "en" ? "en-US" : "fr-FR",
					},
				},
			};

			// Validate through the schema
			const validated = resumeDataSchema.parse(resumeData);

			// Save to AI history (fire-and-forget)
			aiHistoryService
				.save({
					userId: context.user.id,
					source: "generate_resume",
					generatedContent: `Generated resume for ${input.fullName} - ${input.targetJob}`,
					outputData: {
						headline: generated.headline,
						skills: generated.skills.length,
						experience: generated.experience.length,
					},
					inputData: { fullName: input.fullName, targetJob: input.targetJob, language: input.language },
					metadata: { provider: "ai", language: input.language },
				})
				.catch((err) => console.error("[AI History] Failed to save generate_resume:", err));

			return { resumeData: validated as unknown as Record<string, unknown> };
		}),

	applyGapFixes: aiRateLimitedProcedure
		.input(
			z.object({
				resumeData: z.record(z.string(), z.unknown()).refine((data) => JSON.stringify(data).length <= 50_000, {
					message: "Resume data too large (max 50KB)",
				}),
				gaps: z
					.array(
						z.object({
							section: z.string().max(200),
							issue: z.string().max(1000),
							severity: z.string().max(50),
							suggestion: z.string().max(2000),
						}),
					)
					.max(50),
				recommendations: z.array(z.string().max(2000)).max(30),
				targetRole: z.string().max(256).optional(),
			}),
		)
		.handler(async ({ input, context }) => {
			const result = await withQuotaAndLogging(context.user.id, "apply_gap_fixes", async (model) => {
				const userMessage = [
					"Voici un CV avec des lacunes identifiees. Applique les corrections recommandees.",
					"",
					"CV actuel:",
					JSON.stringify(input.resumeData, null, 2),
					"",
					"Lacunes identifiees:",
					input.gaps.map((g) => `- [${g.severity}] ${g.section}: ${g.issue} => ${g.suggestion}`).join("\n"),
					"",
					"Recommandations:",
					input.recommendations.map((r) => `- ${r}`).join("\n"),
					input.targetRole ? `\nPoste cible: ${input.targetRole}` : "",
				]
					.filter(Boolean)
					.join("\n");

				const aiResult = await generateText({
					model,
					temperature: 0.4,
					maxRetries: 2,
					maxOutputTokens: 6000,
					messages: [
						{
							role: "system",
							content:
								"Tu es un expert en optimisation de CV. On te donne un CV et une liste de lacunes detectees. " +
								"Tu dois retourner le CV complet CORRIGE au format JSON identique au format d'entree. " +
								"Ameliore les sections faibles, ajoute du contenu manquant, et renforce les descriptions. " +
								"Conserve la structure exacte du JSON d'entree (picture, basics, summary, sections, customSections, metadata). " +
								"N'invente pas de nouvelles experiences, mais ameliore les descriptions existantes et ajoute des competences pertinentes. " +
								"Respond ONLY with a valid JSON object, no markdown fences.",
						},
						{
							role: "user",
							content: sanitizeAiInput(userMessage, 12000),
						},
					],
				});

				const jsonText = aiResult.text
					.replace(/^```json\s*/, "")
					.replace(/```\s*$/, "")
					.trim();
				const rawData = JSON.parse(jsonText);
				const normalized = normalizeAiResumeData(rawData);

				return { result: normalized, usage: aiResult.usage };
			});

			// Save to AI history (fire-and-forget)
			aiHistoryService
				.save({
					userId: context.user.id,
					source: "apply_gap_fixes",
					generatedContent: `Applied ${input.gaps.length} gap fixes to resume`,
					outputData: { gapsFixed: input.gaps.length },
					inputData: { targetRole: input.targetRole, gapCount: input.gaps.length },
					metadata: { provider: "ai" },
				})
				.catch((err) => console.error("[AI History] Failed to save apply_gap_fixes:", err));

			return { resumeData: result as unknown as Record<string, unknown> };
		}),
};
