/**
 * Unit Tests for src/integrations/orpc/services/ai-config.ts
 *
 * Tests cover:
 * - AI provider configuration CRUD operations
 * - Default provider selection logic
 * - Provider enabling/disabling
 * - Priority ordering
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Mock the database client
const {
	mockSelect,
	mockFrom,
	mockWhere,
	mockOrderBy,
	mockLimit,
	mockInsert,
	mockValues,
	mockUpdate,
	mockSet,
	mockDelete,
	mockReturning,
	chainableMock,
} = vi.hoisted(() => {
	const mockSelect = vi.fn();
	const mockFrom = vi.fn();
	const mockWhere = vi.fn();
	const mockOrderBy = vi.fn();
	const mockLimit = vi.fn();
	const mockInsert = vi.fn();
	const mockValues = vi.fn();
	const mockUpdate = vi.fn();
	const mockSet = vi.fn();
	const mockDelete = vi.fn();
	const mockReturning = vi.fn();

	const chainableMock: Record<string, ReturnType<typeof vi.fn>> = {
		select: mockSelect,
		from: mockFrom,
		where: mockWhere,
		orderBy: mockOrderBy,
		limit: mockLimit,
		insert: mockInsert,
		values: mockValues,
		update: mockUpdate,
		set: mockSet,
		delete: mockDelete,
		returning: mockReturning,
	};

	// Set up chainable returns
	mockSelect.mockReturnValue(chainableMock);
	mockFrom.mockReturnValue(chainableMock);
	mockWhere.mockReturnValue(chainableMock);
	mockOrderBy.mockReturnValue(chainableMock);
	mockLimit.mockReturnValue(chainableMock);
	mockInsert.mockReturnValue(chainableMock);
	mockValues.mockReturnValue(chainableMock);
	mockUpdate.mockReturnValue(chainableMock);
	mockSet.mockReturnValue(chainableMock);
	mockDelete.mockReturnValue(chainableMock);
	mockReturning.mockReturnValue(chainableMock);

	return {
		mockSelect,
		mockFrom,
		mockWhere,
		mockOrderBy,
		mockLimit,
		mockInsert,
		mockValues,
		mockUpdate,
		mockSet,
		mockDelete,
		mockReturning,
		chainableMock,
	};
});

// Mock the database client
vi.mock("@/integrations/drizzle/client", () => ({
	db: chainableMock,
}));

// Mock env
vi.mock("@/utils/env", () => ({
	env: {
		APP_URL: "http://localhost:3000",
	},
}));

// Import after mocks are set up
import { aiConfigService } from "@/integrations/orpc/services/ai-config";

// Test fixtures
const mockProviderOpenAI = {
	id: "provider-1",
	provider: "openai" as const,
	displayName: "OpenAI GPT-4",
	apiKey: "sk-test-key-1",
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

const mockProviderAnthropic = {
	id: "provider-2",
	provider: "anthropic" as const,
	displayName: "Claude 3.5",
	apiKey: "sk-ant-test-key",
	model: "claude-3-5-sonnet-latest",
	baseUrl: null,
	maxTokensPerRequest: 8192,
	temperature: "0.5",
	priority: 50,
	isDefault: false,
	isEnabled: true,
	createdAt: new Date("2026-01-02"),
	updatedAt: new Date("2026-01-10"),
};

const mockProviderDisabled = {
	id: "provider-3",
	provider: "google" as const,
	displayName: "Google Gemini",
	apiKey: "google-api-key",
	model: "gemini-pro",
	baseUrl: null,
	maxTokensPerRequest: 4096,
	temperature: "0.6",
	priority: 25,
	isDefault: false,
	isEnabled: false,
	createdAt: new Date("2026-01-03"),
	updatedAt: new Date("2026-01-03"),
};

// Helper to set mock return values
const setMockResult = (result: unknown[]) => {
	chainableMock.then = vi.fn((resolve: (v: unknown) => void) => resolve(result));
};

describe("ai config service", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		// Reset chainable returns
		mockSelect.mockReturnValue(chainableMock);
		mockFrom.mockReturnValue(chainableMock);
		mockWhere.mockReturnValue(chainableMock);
		mockOrderBy.mockReturnValue(chainableMock);
		mockLimit.mockReturnValue(chainableMock);
		mockInsert.mockReturnValue(chainableMock);
		mockValues.mockReturnValue(chainableMock);
		mockUpdate.mockReturnValue(chainableMock);
		mockSet.mockReturnValue(chainableMock);
		mockDelete.mockReturnValue(chainableMock);
		mockReturning.mockReturnValue(chainableMock);
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	describe("list", () => {
		it("should return all providers ordered by priority and creation date", async () => {
			const providers = [mockProviderOpenAI, mockProviderAnthropic, mockProviderDisabled];
			setMockResult(providers);

			const result = await aiConfigService.list();

			expect(result).toEqual(providers);
			expect(mockSelect).toHaveBeenCalled();
			expect(mockFrom).toHaveBeenCalled();
			expect(mockOrderBy).toHaveBeenCalled();
		});

		it("should return empty array when no providers exist", async () => {
			setMockResult([]);

			const result = await aiConfigService.list();

			expect(result).toEqual([]);
		});
	});

	describe("getById", () => {
		it("should return provider by id", async () => {
			setMockResult([mockProviderOpenAI]);

			const result = await aiConfigService.getById("provider-1");

			expect(result).toEqual(mockProviderOpenAI);
			expect(mockSelect).toHaveBeenCalled();
			expect(mockWhere).toHaveBeenCalled();
		});

		it("should return null for non-existent provider", async () => {
			setMockResult([]);

			const result = await aiConfigService.getById("non-existent");

			expect(result).toBeNull();
		});
	});

	describe("getDefault", () => {
		it("should return the default enabled provider", async () => {
			setMockResult([mockProviderOpenAI]);

			const result = await aiConfigService.getDefault();

			expect(result).toEqual(mockProviderOpenAI);
			expect(mockWhere).toHaveBeenCalled();
		});

		it("should fallback to highest priority enabled provider when no default", async () => {
			// First call returns empty (no default), second call returns enabled provider
			let callCount = 0;
			chainableMock.then = vi.fn((resolve: (v: unknown) => void) => {
				callCount++;
				if (callCount === 1) {
					resolve([]);
				} else {
					resolve([mockProviderAnthropic]);
				}
			});

			const result = await aiConfigService.getDefault();

			expect(result).toEqual(mockProviderAnthropic);
		});

		it("should return null when no providers are enabled", async () => {
			chainableMock.then = vi.fn((resolve: (v: unknown) => void) => {
				resolve([]);
			});

			const result = await aiConfigService.getDefault();

			expect(result).toBeNull();
		});
	});

	describe("getByProvider", () => {
		it("should return enabled providers by provider type", async () => {
			setMockResult([mockProviderOpenAI]);

			const result = await aiConfigService.getByProvider("openai");

			expect(result).toEqual([mockProviderOpenAI]);
			expect(mockWhere).toHaveBeenCalled();
		});

		it("should return empty array when no providers match", async () => {
			setMockResult([]);

			const result = await aiConfigService.getByProvider("ollama");

			expect(result).toEqual([]);
		});
	});

	describe("create", () => {
		it("should create a new provider", async () => {
			const newProvider = {
				provider: "openai" as const,
				displayName: "New OpenAI",
				apiKey: "sk-new-key",
				model: "gpt-4-turbo",
			};

			setMockResult([{ ...mockProviderOpenAI, ...newProvider, id: "new-id" }]);

			const result = await aiConfigService.create(newProvider);

			expect(result).toBeDefined();
			expect(mockInsert).toHaveBeenCalled();
			expect(mockValues).toHaveBeenCalled();
		});

		it("should unset other defaults when creating with isDefault: true", async () => {
			const newProvider = {
				provider: "anthropic" as const,
				displayName: "New Default",
				apiKey: "sk-new-key",
				model: "claude-3-5-sonnet",
				isDefault: true,
			};

			setMockResult([{ ...mockProviderAnthropic, ...newProvider, id: "new-id" }]);

			await aiConfigService.create(newProvider);

			// Should call update to unset other defaults
			expect(mockUpdate).toHaveBeenCalled();
			expect(mockSet).toHaveBeenCalled();
		});

		it("should create provider with optional fields", async () => {
			const newProvider = {
				provider: "openai" as const,
				displayName: "Custom Config",
				apiKey: "sk-custom",
				model: "gpt-4",
				baseUrl: "https://custom.openai.azure.com",
				maxTokensPerRequest: 8192,
				temperature: "0.9",
				priority: 200,
			};

			setMockResult([{ ...mockProviderOpenAI, ...newProvider, id: "custom-id" }]);

			const result = await aiConfigService.create(newProvider);

			expect(result).toBeDefined();
			expect(mockValues).toHaveBeenCalled();
		});
	});

	describe("update", () => {
		it("should update provider fields", async () => {
			setMockResult([{ ...mockProviderOpenAI, displayName: "Updated Name" }]);

			const result = await aiConfigService.update("provider-1", {
				displayName: "Updated Name",
			});

			expect(result?.displayName).toBe("Updated Name");
			expect(mockUpdate).toHaveBeenCalled();
			expect(mockSet).toHaveBeenCalled();
			expect(mockWhere).toHaveBeenCalled();
		});

		it("should unset other defaults when updating with isDefault: true", async () => {
			setMockResult([{ ...mockProviderAnthropic, isDefault: true }]);

			await aiConfigService.update("provider-2", { isDefault: true });

			// Should call update twice: once to unset others, once to set this one
			expect(mockUpdate).toHaveBeenCalled();
		});

		it("should update API key", async () => {
			setMockResult([{ ...mockProviderOpenAI, apiKey: "new-api-key" }]);

			await aiConfigService.update("provider-1", {
				apiKey: "new-api-key",
			});

			expect(mockSet).toHaveBeenCalled();
		});
	});

	describe("delete", () => {
		it("should delete provider by id", async () => {
			await aiConfigService.delete("provider-1");

			expect(mockDelete).toHaveBeenCalled();
			expect(mockWhere).toHaveBeenCalled();
		});
	});

	describe("setDefault", () => {
		it("should set provider as default and unset others", async () => {
			await aiConfigService.setDefault("provider-2");

			// Should call update twice: once to unset all, once to set the new default
			expect(mockUpdate).toHaveBeenCalledTimes(2);
		});
	});

	describe("toggleEnabled", () => {
		it("should toggle provider enabled state", async () => {
			// First call returns the provider, update follows
			let callCount = 0;
			chainableMock.then = vi.fn((resolve: (v: unknown) => void) => {
				callCount++;
				if (callCount === 1) {
					resolve([mockProviderOpenAI]);
				} else {
					resolve(undefined);
				}
			});

			await aiConfigService.toggleEnabled("provider-1");

			expect(mockUpdate).toHaveBeenCalled();
			expect(mockSet).toHaveBeenCalled();
		});

		it("should do nothing if provider not found", async () => {
			setMockResult([]);

			await aiConfigService.toggleEnabled("non-existent");

			// Update should not be called if getById returns null
			expect(mockUpdate).not.toHaveBeenCalled();
		});
	});

	describe("getActiveProvider", () => {
		it("should return the active default provider", async () => {
			setMockResult([mockProviderOpenAI]);

			const result = await aiConfigService.getActiveProvider();

			expect(result).toEqual(mockProviderOpenAI);
		});

		it("should throw error when no provider is configured", async () => {
			chainableMock.then = vi.fn((resolve: (v: unknown) => void) => {
				resolve([]);
			});

			await expect(aiConfigService.getActiveProvider()).rejects.toThrow(
				"No AI provider configured. Please ask an administrator to set up AI.",
			);
		});
	});
});

describe("ai config service - provider types", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockSelect.mockReturnValue(chainableMock);
		mockFrom.mockReturnValue(chainableMock);
		mockWhere.mockReturnValue(chainableMock);
		mockOrderBy.mockReturnValue(chainableMock);
		mockLimit.mockReturnValue(chainableMock);
		mockInsert.mockReturnValue(chainableMock);
		mockValues.mockReturnValue(chainableMock);
		mockUpdate.mockReturnValue(chainableMock);
		mockSet.mockReturnValue(chainableMock);
		mockDelete.mockReturnValue(chainableMock);
		mockReturning.mockReturnValue(chainableMock);
	});

	it("should support OpenAI provider", async () => {
		const openaiProvider = {
			...mockProviderOpenAI,
			provider: "openai" as const,
		};
		setMockResult([openaiProvider]);

		const result = await aiConfigService.getById("provider-1");
		expect(result?.provider).toBe("openai");
	});

	it("should support Anthropic provider", async () => {
		const anthropicProvider = {
			...mockProviderAnthropic,
			provider: "anthropic" as const,
		};
		setMockResult([anthropicProvider]);

		const result = await aiConfigService.getById("provider-2");
		expect(result?.provider).toBe("anthropic");
	});

	it("should support Google provider", async () => {
		const googleProvider = {
			...mockProviderDisabled,
			provider: "google" as const,
		};
		setMockResult([googleProvider]);

		const result = await aiConfigService.getById("provider-3");
		expect(result?.provider).toBe("google");
	});

	it("should support Ollama provider", async () => {
		const ollamaProvider = {
			id: "provider-ollama",
			provider: "ollama" as const,
			displayName: "Local Ollama",
			apiKey: "",
			model: "llama2",
			baseUrl: "http://localhost:11434",
			maxTokensPerRequest: 4096,
			temperature: "0.7",
			priority: 10,
			isDefault: false,
			isEnabled: true,
			createdAt: new Date(),
			updatedAt: new Date(),
		};
		setMockResult([ollamaProvider]);

		const result = await aiConfigService.getById("provider-ollama");
		expect(result?.provider).toBe("ollama");
		expect(result?.baseUrl).toBe("http://localhost:11434");
	});
});

describe("ai config service - edge cases", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockSelect.mockReturnValue(chainableMock);
		mockFrom.mockReturnValue(chainableMock);
		mockWhere.mockReturnValue(chainableMock);
		mockOrderBy.mockReturnValue(chainableMock);
		mockLimit.mockReturnValue(chainableMock);
		mockInsert.mockReturnValue(chainableMock);
		mockValues.mockReturnValue(chainableMock);
		mockUpdate.mockReturnValue(chainableMock);
		mockSet.mockReturnValue(chainableMock);
		mockDelete.mockReturnValue(chainableMock);
		mockReturning.mockReturnValue(chainableMock);
	});

	it("should handle null temperature", async () => {
		const providerWithNullTemp = {
			...mockProviderOpenAI,
			temperature: null,
		};
		setMockResult([providerWithNullTemp]);

		const result = await aiConfigService.getById("provider-1");
		expect(result?.temperature).toBeNull();
	});

	it("should handle null baseUrl", async () => {
		setMockResult([mockProviderOpenAI]);

		const result = await aiConfigService.getById("provider-1");
		expect(result?.baseUrl).toBeNull();
	});

	it("should handle zero priority", async () => {
		const providerWithZeroPriority = {
			...mockProviderOpenAI,
			priority: 0,
		};
		setMockResult([providerWithZeroPriority]);

		const result = await aiConfigService.getById("provider-1");
		expect(result?.priority).toBe(0);
	});

	it("should handle null maxTokensPerRequest", async () => {
		const providerWithNullTokens = {
			...mockProviderOpenAI,
			maxTokensPerRequest: null,
		};
		setMockResult([providerWithNullTokens]);

		const result = await aiConfigService.getById("provider-1");
		expect(result?.maxTokensPerRequest).toBeNull();
	});
});
