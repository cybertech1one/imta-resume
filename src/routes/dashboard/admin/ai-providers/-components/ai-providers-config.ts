import type { ProviderFormData } from "./ai-providers-types";

export const PROVIDER_OPTIONS = [
	{ value: "openai", label: "OpenAI", models: ["gpt-4o", "gpt-4o-mini", "gpt-4-turbo", "gpt-3.5-turbo"] },
	{
		value: "anthropic",
		label: "Anthropic",
		models: [
			"claude-sonnet-4-20250514",
			"claude-3-5-sonnet-20241022",
			"claude-3-opus-20240229",
			"claude-3-haiku-20240307",
		],
	},
	{
		value: "gemini",
		label: "Gemini",
		models: ["gemini-2.0-flash-exp", "gemini-1.5-pro", "gemini-1.5-flash", "gemini-1.0-pro"],
	},
	{ value: "ollama", label: "Ollama", models: ["llama3.2", "llama3.1", "mistral", "codellama", "phi3"] },
	{ value: "vercel-ai-gateway", label: "Vercel AI Gateway", models: ["gpt-4o", "claude-sonnet-4-20250514"] },
	{ value: "deepseek", label: "DeepSeek", models: ["deepseek-chat", "deepseek-coder", "deepseek-reasoner"] },
	{
		value: "groq",
		label: "Groq",
		models: ["llama-3.3-70b-versatile", "llama-3.1-8b-instant", "mixtral-8x7b-32768", "gemma2-9b-it"],
	},
	{
		value: "mistral",
		label: "Mistral",
		models: ["mistral-large-latest", "mistral-medium-latest", "mistral-small-latest", "open-mistral-7b"],
	},
	{
		value: "togetherai",
		label: "Together AI",
		models: [
			"meta-llama/Llama-3.3-70B-Instruct-Turbo",
			"meta-llama/Llama-3.2-3B-Instruct-Turbo",
			"mistralai/Mixtral-8x7B-Instruct-v0.1",
			"Qwen/Qwen2.5-72B-Instruct-Turbo",
		],
	},
	{
		value: "openrouter",
		label: "OpenRouter",
		models: [
			"openai/gpt-4o",
			"anthropic/claude-sonnet-4",
			"google/gemini-2.0-flash-exp:free",
			"meta-llama/llama-3.3-70b-instruct",
		],
	},
] as const;

export const DEFAULT_FORM_DATA: ProviderFormData = {
	provider: "",
	displayName: "",
	apiKey: "",
	model: "",
	baseUrl: "",
	maxTokensPerRequest: 4096,
	temperature: 0.7,
	priority: 0,
	isDefault: false,
};
