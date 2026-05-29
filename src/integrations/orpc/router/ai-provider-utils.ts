import { createAnthropic } from "@ai-sdk/anthropic";
import { createDeepSeek } from "@ai-sdk/deepseek";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createGroq } from "@ai-sdk/groq";
import { createMistral } from "@ai-sdk/mistral";
import { createOpenAI } from "@ai-sdk/openai";
import { createTogetherAI } from "@ai-sdk/togetherai";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { ORPCError } from "@orpc/server";
import { createGateway } from "ai";
import { createOllama } from "ai-sdk-ollama";
import { match } from "ts-pattern";
import z from "zod";
import { aiConfigService } from "../services/ai-config";

const aiProviderSchema = z.enum([
	"ollama",
	"openai",
	"gemini",
	"anthropic",
	"vercel-ai-gateway",
	"deepseek",
	"groq",
	"mistral",
	"togetherai",
	"openrouter",
]);

export type AIProvider = z.infer<typeof aiProviderSchema>;

export type GetModelInput = {
	provider: AIProvider;
	model: string;
	apiKey: string;
	baseURL: string;
};

export function getModel(input: GetModelInput) {
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

export async function getServerModel() {
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

export async function getServerModelForProvider(providerName: AIProvider) {
	const configs = await aiConfigService.getByProvider(providerName);
	if (configs.length === 0) {
		return null;
	}
	const config = configs[0];
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
