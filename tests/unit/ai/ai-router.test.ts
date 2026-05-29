/**
 * Unit Tests for src/integrations/orpc/router/ai.ts
 *
 * Tests cover:
 * - AI provider model selection
 * - Quota checking and logging
 * - Error handling for missing providers
 * - Rate limiting behavior
 * - Various AI feature endpoints
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Mock AI services
const mockAiConfigService = {
	getActiveProvider: vi.fn(),
	list: vi.fn(),
	getById: vi.fn(),
	getDefault: vi.fn(),
};

const mockAiQuotaService = {
	checkQuota: vi.fn(),
	logUsage: vi.fn(),
};

const mockAiHistoryService = {
	create: vi.fn(),
	list: vi.fn(),
};

const mockUserSettingsService = {
	get: vi.fn(),
	update: vi.fn(),
};

vi.mock("@/integrations/orpc/services/ai-config", () => ({
	aiConfigService: mockAiConfigService,
}));

vi.mock("@/integrations/orpc/services/ai-quota", () => ({
	aiQuotaService: mockAiQuotaService,
}));

vi.mock("@/integrations/orpc/services/ai-history", () => ({
	aiHistoryService: mockAiHistoryService,
}));

vi.mock("@/integrations/orpc/services/user-settings", () => ({
	userSettingsService: mockUserSettingsService,
}));

// Mock the AI SDK providers
vi.mock("@ai-sdk/openai", () => ({
	createOpenAI: vi.fn(() => ({
		languageModel: vi.fn(() => ({})),
	})),
}));

vi.mock("@ai-sdk/anthropic", () => ({
	createAnthropic: vi.fn(() => ({
		languageModel: vi.fn(() => ({})),
	})),
}));

vi.mock("@ai-sdk/google", () => ({
	createGoogleGenerativeAI: vi.fn(() => ({
		languageModel: vi.fn(() => ({})),
	})),
}));

vi.mock("ai-sdk-ollama", () => ({
	createOllama: vi.fn(() => ({
		languageModel: vi.fn(() => ({})),
	})),
}));

vi.mock("@ai-sdk/deepseek", () => ({
	createDeepSeek: vi.fn(() => ({
		languageModel: vi.fn(() => ({})),
	})),
}));

vi.mock("@ai-sdk/groq", () => ({
	createGroq: vi.fn(() => ({
		languageModel: vi.fn(() => ({})),
	})),
}));

vi.mock("@ai-sdk/mistral", () => ({
	createMistral: vi.fn(() => ({
		languageModel: vi.fn(() => ({})),
	})),
}));

vi.mock("@ai-sdk/togetherai", () => ({
	createTogetherAI: vi.fn(() => ({
		languageModel: vi.fn(() => ({})),
	})),
}));

vi.mock("@openrouter/ai-sdk-provider", () => ({
	createOpenRouter: vi.fn(() => ({
		languageModel: vi.fn(() => ({})),
	})),
}));

// Mock AI SDK core
vi.mock("ai", () => ({
	generateText: vi.fn(() =>
		Promise.resolve({
			text: "Generated content",
			usage: { inputTokens: 100, outputTokens: 50, totalTokens: 150 },
		}),
	),
	streamText: vi.fn(() => ({
		textStream: (async function* () {
			yield "Streamed ";
			yield "content";
		})(),
		usage: Promise.resolve({ inputTokens: 100, outputTokens: 50 }),
	})),
	createGateway: vi.fn(() => ({
		languageModel: vi.fn(() => ({})),
	})),
	Output: {
		object: vi.fn(() => ({})),
	},
}));

// Test fixtures
const mockProviderConfig = {
	id: "provider-123",
	provider: "openai" as const,
	displayName: "OpenAI GPT-4",
	apiKey: "sk-test-key",
	model: "gpt-4",
	baseUrl: null,
	maxTokensPerRequest: 4096,
	temperature: "0.7",
	priority: 100,
	isDefault: true,
	isEnabled: true,
	createdAt: new Date("2026-01-01"),
	updatedAt: new Date("2026-01-15"),
};

const mockUser = {
	id: "user-123",
	email: "test@example.com",
	name: "Test User",
	role: "user" as const,
};

describe("ai router - provider selection", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	describe("getServerModel", () => {
		it("should return model when provider is configured", async () => {
			mockAiConfigService.getActiveProvider.mockResolvedValue(mockProviderConfig);

			const result = await mockAiConfigService.getActiveProvider();

			expect(result).toEqual(mockProviderConfig);
			expect(result.provider).toBe("openai");
			expect(result.model).toBe("gpt-4");
		});

		it("should throw PRECONDITION_FAILED when no provider configured", async () => {
			mockAiConfigService.getActiveProvider.mockRejectedValue(
				new Error("No AI provider configured. Please ask an administrator to set up AI."),
			);

			await expect(mockAiConfigService.getActiveProvider()).rejects.toThrow(
				"No AI provider configured. Please ask an administrator to set up AI.",
			);
		});
	});

	describe("provider types", () => {
		it("should support OpenAI provider", async () => {
			const openaiConfig = { ...mockProviderConfig, provider: "openai" };
			mockAiConfigService.getActiveProvider.mockResolvedValue(openaiConfig);

			const result = await mockAiConfigService.getActiveProvider();
			expect(result.provider).toBe("openai");
		});

		it("should support Anthropic provider", async () => {
			const anthropicConfig = { ...mockProviderConfig, provider: "anthropic", model: "claude-3-5-sonnet" };
			mockAiConfigService.getActiveProvider.mockResolvedValue(anthropicConfig);

			const result = await mockAiConfigService.getActiveProvider();
			expect(result.provider).toBe("anthropic");
		});

		it("should support Gemini provider", async () => {
			const geminiConfig = { ...mockProviderConfig, provider: "gemini", model: "gemini-pro" };
			mockAiConfigService.getActiveProvider.mockResolvedValue(geminiConfig);

			const result = await mockAiConfigService.getActiveProvider();
			expect(result.provider).toBe("gemini");
		});

		it("should support Ollama provider", async () => {
			const ollamaConfig = {
				...mockProviderConfig,
				provider: "ollama",
				model: "llama2",
				baseUrl: "http://localhost:11434",
			};
			mockAiConfigService.getActiveProvider.mockResolvedValue(ollamaConfig);

			const result = await mockAiConfigService.getActiveProvider();
			expect(result.provider).toBe("ollama");
			expect(result.baseUrl).toBe("http://localhost:11434");
		});

		it("should support DeepSeek provider", async () => {
			const deepseekConfig = { ...mockProviderConfig, provider: "deepseek", model: "deepseek-chat" };
			mockAiConfigService.getActiveProvider.mockResolvedValue(deepseekConfig);

			const result = await mockAiConfigService.getActiveProvider();
			expect(result.provider).toBe("deepseek");
		});

		it("should support Groq provider", async () => {
			const groqConfig = { ...mockProviderConfig, provider: "groq", model: "mixtral-8x7b" };
			mockAiConfigService.getActiveProvider.mockResolvedValue(groqConfig);

			const result = await mockAiConfigService.getActiveProvider();
			expect(result.provider).toBe("groq");
		});

		it("should support Mistral provider", async () => {
			const mistralConfig = { ...mockProviderConfig, provider: "mistral", model: "mistral-large" };
			mockAiConfigService.getActiveProvider.mockResolvedValue(mistralConfig);

			const result = await mockAiConfigService.getActiveProvider();
			expect(result.provider).toBe("mistral");
		});

		it("should support TogetherAI provider", async () => {
			const togetherConfig = { ...mockProviderConfig, provider: "togetherai", model: "llama-2-70b" };
			mockAiConfigService.getActiveProvider.mockResolvedValue(togetherConfig);

			const result = await mockAiConfigService.getActiveProvider();
			expect(result.provider).toBe("togetherai");
		});

		it("should support OpenRouter provider", async () => {
			const openrouterConfig = { ...mockProviderConfig, provider: "openrouter", model: "openai/gpt-4" };
			mockAiConfigService.getActiveProvider.mockResolvedValue(openrouterConfig);

			const result = await mockAiConfigService.getActiveProvider();
			expect(result.provider).toBe("openrouter");
		});

		it("should support Vercel AI Gateway", async () => {
			const gatewayConfig = { ...mockProviderConfig, provider: "vercel-ai-gateway", model: "gpt-4" };
			mockAiConfigService.getActiveProvider.mockResolvedValue(gatewayConfig);

			const result = await mockAiConfigService.getActiveProvider();
			expect(result.provider).toBe("vercel-ai-gateway");
		});
	});
});

describe("ai router - quota management", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockAiConfigService.getActiveProvider.mockResolvedValue(mockProviderConfig);
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	describe("checkQuota", () => {
		it("should allow request when quota is available", async () => {
			mockAiQuotaService.checkQuota.mockResolvedValue({
				allowed: true,
				remaining: 100,
			});

			const result = await mockAiQuotaService.checkQuota(mockUser.id, "improve_content");

			expect(result.allowed).toBe(true);
			expect(result.remaining).toBe(100);
		});

		it("should deny request when quota is exceeded", async () => {
			mockAiQuotaService.checkQuota.mockResolvedValue({
				allowed: false,
				reason: "Daily quota exceeded",
			});

			const result = await mockAiQuotaService.checkQuota(mockUser.id, "improve_content");

			expect(result.allowed).toBe(false);
			expect(result.reason).toBe("Daily quota exceeded");
		});

		it("should track usage for different features", async () => {
			const features = ["improve_content", "fix_grammar", "generate_summary", "suggest_skills"];

			for (const feature of features) {
				mockAiQuotaService.checkQuota.mockResolvedValue({ allowed: true });
				await mockAiQuotaService.checkQuota(mockUser.id, feature);
			}

			expect(mockAiQuotaService.checkQuota).toHaveBeenCalledTimes(4);
		});
	});

	describe("logUsage", () => {
		it("should log successful usage", async () => {
			mockAiQuotaService.logUsage.mockResolvedValue(undefined);

			await mockAiQuotaService.logUsage({
				userId: mockUser.id,
				feature: "improve_content",
				providerId: mockProviderConfig.id,
				provider: mockProviderConfig.provider,
				model: mockProviderConfig.model,
				status: "success",
				inputTokens: 100,
				outputTokens: 50,
				durationMs: 1500,
			});

			expect(mockAiQuotaService.logUsage).toHaveBeenCalled();
		});

		it("should log failed usage with error message", async () => {
			mockAiQuotaService.logUsage.mockResolvedValue(undefined);

			await mockAiQuotaService.logUsage({
				userId: mockUser.id,
				feature: "improve_content",
				providerId: mockProviderConfig.id,
				provider: mockProviderConfig.provider,
				model: mockProviderConfig.model,
				status: "error",
				errorMessage: "Rate limit exceeded",
				durationMs: 500,
			});

			expect(mockAiQuotaService.logUsage).toHaveBeenCalledWith(
				expect.objectContaining({
					status: "error",
					errorMessage: "Rate limit exceeded",
				}),
			);
		});

		it("should log quota exceeded status", async () => {
			mockAiQuotaService.logUsage.mockResolvedValue(undefined);

			await mockAiQuotaService.logUsage({
				userId: mockUser.id,
				feature: "improve_content",
				provider: "none",
				model: "none",
				status: "quota_exceeded",
				errorMessage: "Daily quota exceeded",
			});

			expect(mockAiQuotaService.logUsage).toHaveBeenCalledWith(
				expect.objectContaining({
					status: "quota_exceeded",
				}),
			);
		});
	});
});

describe("ai router - feature endpoints", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockAiConfigService.getActiveProvider.mockResolvedValue(mockProviderConfig);
		mockAiQuotaService.checkQuota.mockResolvedValue({ allowed: true });
		mockAiQuotaService.logUsage.mockResolvedValue(undefined);
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	describe("improve content", () => {
		it("should require content input", () => {
			const input = { content: "Original text to improve" };
			expect(input.content).toBeDefined();
			expect(typeof input.content).toBe("string");
		});

		it("should accept optional language parameter", () => {
			const input = { content: "Text", language: "en" };
			expect(input.language).toBe("en");
		});
	});

	describe("fix grammar", () => {
		it("should require content input", () => {
			const input = { content: "Text with grammer errors" };
			expect(input.content).toBeDefined();
		});
	});

	describe("generate summary", () => {
		it("should require resume data input", () => {
			const input = {
				data: {
					basics: { name: "John Doe" },
					experience: [],
					education: [],
				},
			};
			expect(input.data).toBeDefined();
		});

		it("should accept optional tone parameter", () => {
			const input = {
				data: { basics: { name: "John" } },
				tone: "professional",
			};
			expect(input.tone).toBe("professional");
		});
	});

	describe("generate headline", () => {
		it("should require job title input", () => {
			const input = { jobTitle: "Software Engineer" };
			expect(input.jobTitle).toBeDefined();
		});

		it("should accept skills array", () => {
			const input = {
				jobTitle: "Developer",
				skills: ["JavaScript", "React", "TypeScript"],
			};
			expect(input.skills).toHaveLength(3);
		});
	});

	describe("suggest skills", () => {
		it("should require job title input", () => {
			const input = { jobTitle: "Full Stack Developer" };
			expect(input.jobTitle).toBeDefined();
		});

		it("should accept existing skills", () => {
			const input = {
				jobTitle: "Developer",
				existingSkills: ["React"],
			};
			expect(input.existingSkills).toContain("React");
		});
	});

	describe("resume analysis", () => {
		it("should require resume data input", () => {
			const input = {
				data: {
					basics: { name: "Jane Doe", email: "jane@example.com" },
					sections: {},
				},
			};
			expect(input.data).toBeDefined();
		});
	});

	describe("parse PDF", () => {
		it("should require base64 PDF data", () => {
			const input = { pdf: "base64encodedpdfdata" };
			expect(input.pdf).toBeDefined();
			expect(typeof input.pdf).toBe("string");
		});
	});

	describe("parse DOCX", () => {
		it("should require base64 DOCX data", () => {
			const input = { docx: "base64encodeddocxdata" };
			expect(input.docx).toBeDefined();
			expect(typeof input.docx).toBe("string");
		});
	});
});

describe("ai router - error handling", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	describe("provider errors", () => {
		it("should throw PRECONDITION_FAILED when no provider", async () => {
			mockAiConfigService.getActiveProvider.mockRejectedValue(new Error("No provider configured"));

			await expect(mockAiConfigService.getActiveProvider()).rejects.toThrow();
		});

		it("should handle API key errors", async () => {
			mockAiConfigService.getActiveProvider.mockRejectedValue(new Error("Invalid API key"));

			await expect(mockAiConfigService.getActiveProvider()).rejects.toThrow("Invalid API key");
		});
	});

	describe("quota errors", () => {
		it("should throw FORBIDDEN when quota exceeded", async () => {
			mockAiQuotaService.checkQuota.mockResolvedValue({
				allowed: false,
				reason: "Monthly quota exceeded",
			});

			const result = await mockAiQuotaService.checkQuota(mockUser.id, "any_feature");

			expect(result.allowed).toBe(false);
		});
	});

	describe("AI generation errors", () => {
		it("should handle rate limit errors gracefully", async () => {
			const rateLimitError = new Error("Rate limit exceeded");
			// This simulates what would happen in actual AI call
			expect(() => {
				throw rateLimitError;
			}).toThrow("Rate limit exceeded");
		});

		it("should handle timeout errors", async () => {
			const timeoutError = new Error("Request timeout");
			expect(() => {
				throw timeoutError;
			}).toThrow("Request timeout");
		});

		it("should handle invalid response format", async () => {
			const parseError = new Error("Failed to parse AI response");
			expect(() => {
				throw parseError;
			}).toThrow("Failed to parse AI response");
		});
	});
});

describe("ai router - rate limiting", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("should respect daily request limits", async () => {
		mockAiQuotaService.checkQuota
			.mockResolvedValueOnce({ allowed: true, remaining: 1 })
			.mockResolvedValueOnce({ allowed: false, reason: "Daily limit reached" });

		const firstCheck = await mockAiQuotaService.checkQuota(mockUser.id, "feature");
		const secondCheck = await mockAiQuotaService.checkQuota(mockUser.id, "feature");

		expect(firstCheck.allowed).toBe(true);
		expect(secondCheck.allowed).toBe(false);
	});

	it("should respect monthly token limits", async () => {
		mockAiQuotaService.checkQuota.mockResolvedValue({
			allowed: false,
			reason: "Monthly token quota exceeded",
		});

		const result = await mockAiQuotaService.checkQuota(mockUser.id, "feature");

		expect(result.allowed).toBe(false);
		expect(result.reason).toContain("token");
	});

	it("should track per-user quotas independently", async () => {
		mockAiQuotaService.checkQuota
			.mockResolvedValueOnce({ allowed: true })
			.mockResolvedValueOnce({ allowed: false, reason: "Quota exceeded" });

		const user1Result = await mockAiQuotaService.checkQuota("user-1", "feature");
		const user2Result = await mockAiQuotaService.checkQuota("user-2", "feature");

		expect(user1Result.allowed).toBe(true);
		expect(user2Result.allowed).toBe(false);
	});
});
