import z from "zod";
import { adminProcedure, protectedProcedure, publicProcedure } from "../context";
import { adminService } from "../services/admin";
import { aiConfigService } from "../services/ai-config";
import { aiQuotaService } from "../services/ai-quota";

// Provider Config Input Schemas
const aiProviderSchema = z.enum([
	"openai",
	"anthropic",
	"gemini",
	"ollama",
	"vercel-ai-gateway",
	"deepseek",
	"groq",
	"mistral",
	"togetherai",
	"openrouter",
]);

/**
 * Allowed AI provider base URL domains.
 * Only well-known provider endpoints are permitted to prevent SSRF attacks
 * where an admin could point the AI provider at internal services.
 *
 * For Ollama (self-hosted), localhost is allowed since it runs on the same machine.
 */
const ALLOWED_BASE_URL_PATTERNS = [
	/^https:\/\/api\.openai\.com(\/|$)/,
	/^https:\/\/api\.anthropic\.com(\/|$)/,
	/^https:\/\/generativelanguage\.googleapis\.com(\/|$)/,
	/^https:\/\/api\.groq\.com(\/|$)/,
	/^https:\/\/api\.mistral\.ai(\/|$)/,
	/^https:\/\/api\.together\.xyz(\/|$)/,
	/^https:\/\/api\.deepseek\.com(\/|$)/,
	/^https:\/\/openrouter\.ai(\/|$)/,
	/^https:\/\/gateway\.ai\.cloudflare\.com(\/|$)/,
	// Ollama self-hosted (local only)
	/^https?:\/\/localhost(:\d+)?(\/|$)/,
	/^https?:\/\/127\.0\.0\.1(:\d+)?(\/|$)/,
	/^https?:\/\/host\.docker\.internal(:\d+)?(\/|$)/,
];

/**
 * Validate that a base URL is an allowed AI provider endpoint.
 * Prevents SSRF attacks by blocking arbitrary internal URLs.
 */
const safeBaseUrlSchema = z
	.string()
	.url()
	.refine(
		(url) => ALLOWED_BASE_URL_PATTERNS.some((pattern) => pattern.test(url)),
		"Base URL must be a known AI provider endpoint (e.g., api.openai.com, api.deepseek.com). Arbitrary URLs are not allowed to prevent SSRF attacks.",
	)
	.optional();

/**
 * Temperature must be a valid decimal string between 0 and 2.
 * Stored as numeric in the database but transmitted as a string.
 */
const temperatureSchema = z
	.string()
	.refine((val) => {
		const num = Number.parseFloat(val);
		return !Number.isNaN(num) && num >= 0 && num <= 2;
	}, "Temperature must be a number between 0 and 2")
	.optional();

const createProviderSchema = z.object({
	provider: aiProviderSchema,
	displayName: z.string().min(1).max(100),
	apiKey: z.string().min(1).max(500),
	model: z.string().min(1).max(200),
	baseUrl: safeBaseUrlSchema,
	isDefault: z.boolean().optional(),
	maxTokensPerRequest: z.number().int().min(100).max(128000).optional(),
	temperature: temperatureSchema,
	priority: z.number().int().min(0).max(100).optional(),
});

const updateProviderSchema = z.object({
	id: z.string().uuid(),
	provider: aiProviderSchema.optional(),
	displayName: z.string().min(1).max(100).optional(),
	apiKey: z.string().min(1).max(500).optional(),
	model: z.string().min(1).max(200).optional(),
	baseUrl: safeBaseUrlSchema,
	isDefault: z.boolean().optional(),
	maxTokensPerRequest: z.number().int().min(100).max(128000).optional(),
	temperature: temperatureSchema,
	priority: z.number().int().min(0).max(100).optional(),
});

// Quota Plan Input Schemas
const createQuotaSchema = z.object({
	name: z.string().min(1),
	description: z.string().optional(),
	dailyRequestLimit: z.number().int().min(0).optional(),
	monthlyRequestLimit: z.number().int().min(0).optional(),
	maxTokensPerRequest: z.number().int().min(0).optional(),
	dailyTokenLimit: z.number().int().min(0).optional(),
	monthlyTokenLimit: z.number().int().min(0).optional(),
	allowedFeatures: z.array(z.string()).optional(),
	isDefault: z.boolean().optional(),
	isActive: z.boolean().optional(),
});

const updateQuotaSchema = z.object({
	id: z.string().uuid(),
	name: z.string().min(1).optional(),
	description: z.string().optional(),
	dailyRequestLimit: z.number().int().min(0).optional(),
	monthlyRequestLimit: z.number().int().min(0).optional(),
	maxTokensPerRequest: z.number().int().min(0).optional(),
	dailyTokenLimit: z.number().int().min(0).optional(),
	monthlyTokenLimit: z.number().int().min(0).optional(),
	allowedFeatures: z.array(z.string()).optional(),
	isDefault: z.boolean().optional(),
	isActive: z.boolean().optional(),
});

const assignQuotaSchema = z.object({
	userId: z.string().uuid(),
	quotaId: z.string().uuid(),
	overrideDailyRequestLimit: z.number().int().optional(),
	overrideMonthlyRequestLimit: z.number().int().optional(),
	overrideDailyTokenLimit: z.number().int().optional(),
	overrideMonthlyTokenLimit: z.number().int().optional(),
	notes: z.string().optional(),
});

// Providers Router
const providersRouter = {
	list: adminProcedure
		.route({
			method: "GET",
			path: "/ai-config/providers",
			tags: ["AI Config", "Providers"],
			summary: "List all AI provider configs",
			description: "Get all configured AI providers.",
		})
		.handler(async () => {
			return await aiConfigService.list();
		}),

	getById: adminProcedure
		.route({
			method: "GET",
			path: "/ai-config/providers/{id}",
			tags: ["AI Config", "Providers"],
			summary: "Get AI provider config by ID",
			description: "Get a specific AI provider configuration.",
		})
		.input(z.object({ id: z.string().uuid() }))
		.handler(async ({ input }) => {
			return await aiConfigService.getById(input.id);
		}),

	create: adminProcedure
		.route({
			method: "POST",
			path: "/ai-config/providers",
			tags: ["AI Config", "Providers"],
			summary: "Create AI provider config",
			description: "Add a new AI provider configuration.",
		})
		.input(createProviderSchema)
		.handler(async ({ input, context }) => {
			const result = await aiConfigService.create(input);
			// Audit log: AI provider created (never log apiKey)
			await adminService.audit.log({
				adminId: context.user.id,
				action: "ai_provider_created",
				targetType: "ai_provider_config",
				targetId: result.id,
				metadata: { provider: input.provider, model: input.model, baseUrl: input.baseUrl ?? null },
			});
			return result;
		}),

	update: adminProcedure
		.route({
			method: "PUT",
			path: "/ai-config/providers/{id}",
			tags: ["AI Config", "Providers"],
			summary: "Update AI provider config",
			description: "Update an existing AI provider configuration.",
		})
		.input(updateProviderSchema)
		.handler(async ({ input, context }) => {
			const { id, ...data } = input;
			const result = await aiConfigService.update(id, data);
			// Audit log: AI provider updated (never log apiKey)
			const { apiKey: _omit, ...safeData } = data;
			await adminService.audit.log({
				adminId: context.user.id,
				action: "ai_provider_updated",
				targetType: "ai_provider_config",
				targetId: id,
				metadata: safeData,
			});
			return result;
		}),

	delete: adminProcedure
		.route({
			method: "DELETE",
			path: "/ai-config/providers/{id}",
			tags: ["AI Config", "Providers"],
			summary: "Delete AI provider config",
			description: "Remove an AI provider configuration.",
		})
		.input(z.object({ id: z.string().uuid() }))
		.handler(async ({ input, context }) => {
			// Get provider info before deletion for audit log
			const provider = await aiConfigService.getById(input.id);
			await aiConfigService.delete(input.id);
			await adminService.audit.log({
				adminId: context.user.id,
				action: "ai_provider_deleted",
				targetType: "ai_provider_config",
				targetId: input.id,
				metadata: { provider: provider?.provider ?? "unknown", model: provider?.model ?? "unknown" },
			});
			return { success: true };
		}),

	setDefault: adminProcedure
		.route({
			method: "PUT",
			path: "/ai-config/providers/{id}/default",
			tags: ["AI Config", "Providers"],
			summary: "Set default AI provider",
			description: "Set an AI provider as the default.",
		})
		.input(z.object({ id: z.string().uuid() }))
		.handler(async ({ input }) => {
			await aiConfigService.setDefault(input.id);
			return { success: true };
		}),

	toggleEnabled: adminProcedure
		.route({
			method: "PUT",
			path: "/ai-config/providers/{id}/toggle",
			tags: ["AI Config", "Providers"],
			summary: "Toggle AI provider enabled status",
			description: "Enable or disable an AI provider.",
		})
		.input(z.object({ id: z.string().uuid() }))
		.handler(async ({ input }) => {
			await aiConfigService.toggleEnabled(input.id);
			return { success: true };
		}),
};

// Quotas Router
const quotasRouter = {
	list: adminProcedure
		.route({
			method: "GET",
			path: "/ai-config/quotas",
			tags: ["AI Config", "Quotas"],
			summary: "List all quota plans",
			description: "Get all AI quota plans.",
		})
		.handler(async () => {
			return await aiQuotaService.plans.list();
		}),

	create: adminProcedure
		.route({
			method: "POST",
			path: "/ai-config/quotas",
			tags: ["AI Config", "Quotas"],
			summary: "Create quota plan",
			description: "Create a new AI quota plan.",
		})
		.input(createQuotaSchema)
		.handler(async ({ input }) => {
			return await aiQuotaService.plans.create(input);
		}),

	update: adminProcedure
		.route({
			method: "PUT",
			path: "/ai-config/quotas/{id}",
			tags: ["AI Config", "Quotas"],
			summary: "Update quota plan",
			description: "Update an existing AI quota plan.",
		})
		.input(updateQuotaSchema)
		.handler(async ({ input }) => {
			const { id, ...data } = input;
			return await aiQuotaService.plans.update(id, data);
		}),

	delete: adminProcedure
		.route({
			method: "DELETE",
			path: "/ai-config/quotas/{id}",
			tags: ["AI Config", "Quotas"],
			summary: "Delete quota plan",
			description: "Remove an AI quota plan.",
		})
		.input(z.object({ id: z.string().uuid() }))
		.handler(async ({ input }) => {
			return await aiQuotaService.plans.delete(input.id);
		}),

	assignToUser: adminProcedure
		.route({
			method: "POST",
			path: "/ai-config/quotas/assign",
			tags: ["AI Config", "Quotas"],
			summary: "Assign quota plan to user",
			description: "Assign an AI quota plan to a specific user with optional overrides.",
		})
		.input(assignQuotaSchema)
		.handler(async ({ input, context }) => {
			return await aiQuotaService.assignments.assign({
				...input,
				assignedBy: context.user.id,
			});
		}),

	removeFromUser: adminProcedure
		.route({
			method: "DELETE",
			path: "/ai-config/quotas/assign/{userId}",
			tags: ["AI Config", "Quotas"],
			summary: "Remove quota assignment from user",
			description: "Remove a quota plan assignment from a user.",
		})
		.input(z.object({ userId: z.string().uuid() }))
		.handler(async ({ input }) => {
			return await aiQuotaService.assignments.remove(input.userId);
		}),
};

// Usage Router
const usageRouter = {
	getMyUsage: protectedProcedure
		.route({
			method: "GET",
			path: "/ai-config/usage/me",
			tags: ["AI Config", "Usage"],
			summary: "Get my AI usage stats",
			description: "Get the current user's AI usage statistics.",
		})
		.handler(async ({ context }) => {
			return await aiQuotaService.getUsageStats(context.user.id);
		}),

	getMyQuota: protectedProcedure
		.route({
			method: "GET",
			path: "/ai-config/usage/me/quota",
			tags: ["AI Config", "Usage"],
			summary: "Get my AI quota limits",
			description: "Get the current user's remaining AI quota limits.",
		})
		.handler(async ({ context }) => {
			return await aiQuotaService.checkQuota(context.user.id, "any", context.user.role);
		}),

	getUserUsage: adminProcedure
		.route({
			method: "GET",
			path: "/ai-config/usage/{userId}",
			tags: ["AI Config", "Usage"],
			summary: "Get user AI usage stats",
			description: "Get a specific user's AI usage statistics (admin only).",
		})
		.input(z.object({ userId: z.string().uuid() }))
		.handler(async ({ input }) => {
			return await aiQuotaService.getUsageStats(input.userId);
		}),

	getGlobalStats: adminProcedure
		.route({
			method: "GET",
			path: "/ai-config/usage/global",
			tags: ["AI Config", "Usage"],
			summary: "Get global AI usage stats",
			description: "Get global AI usage statistics across all users (admin only).",
		})
		.handler(async () => {
			return await aiQuotaService.getUsageStats();
		}),

	getDetailedStats: protectedProcedure
		.route({
			method: "GET",
			path: "/ai-config/usage/detailed",
			tags: ["AI Config", "Usage"],
			summary: "Get detailed AI usage analytics",
			description: "Get detailed AI usage analytics for the current user.",
		})
		.handler(async ({ context }) => {
			return await aiQuotaService.getDetailedStats(context.user.id);
		}),

	getGlobalDetailedStats: adminProcedure
		.route({
			method: "GET",
			path: "/ai-config/usage/detailed/global",
			tags: ["AI Config", "Usage"],
			summary: "Get global detailed AI usage analytics",
			description: "Get detailed AI usage analytics across all users (admin only).",
		})
		.handler(async () => {
			return await aiQuotaService.getDetailedStats();
		}),
};

// Global Settings Router
const globalSettingsRouter = {
	get: adminProcedure
		.route({
			method: "GET",
			path: "/ai-config/global-settings",
			tags: ["AI Config", "Global Settings"],
			summary: "Get global AI settings",
			description: "Get organization-wide AI quota settings.",
		})
		.handler(async () => {
			return await aiQuotaService.globalSettings.get();
		}),

	update: adminProcedure
		.route({
			method: "PUT",
			path: "/ai-config/global-settings",
			tags: ["AI Config", "Global Settings"],
			summary: "Update global AI settings",
			description: "Update organization-wide AI quota settings.",
		})
		.input(
			z.object({
				maxDailyRequests: z.number().int().min(0).optional(),
				maxMonthlyRequests: z.number().int().min(0).optional(),
				maxDailyTokens: z.number().int().min(0).optional(),
				maxMonthlyTokens: z.number().int().min(0).optional(),
				alertThresholdPercent: z.number().int().min(0).max(100).optional(),
				suspendOnExceed: z.boolean().optional(),
				defaultLanguage: z.string().optional(),
				allowedLanguages: z.array(z.string()).optional(),
				isActive: z.boolean().optional(),
			}),
		)
		.handler(async ({ input }) => {
			return await aiQuotaService.globalSettings.update(input);
		}),

	checkGlobalQuota: adminProcedure
		.route({
			method: "GET",
			path: "/ai-config/global-settings/check-quota",
			tags: ["AI Config", "Global Settings"],
			summary: "Check global quota status",
			description: "Check if global quota limits allow more requests.",
		})
		.handler(async () => {
			return await aiQuotaService.checkGlobalQuota();
		}),

	getStats: adminProcedure
		.route({
			method: "GET",
			path: "/ai-config/global-settings/stats",
			tags: ["AI Config", "Global Settings"],
			summary: "Get global usage statistics",
			description: "Get organization-wide AI usage statistics.",
		})
		.handler(async () => {
			return await aiQuotaService.getGlobalUsageStats();
		}),
};

// Status Router
const statusRouter = {
	check: publicProcedure
		.route({
			method: "GET",
			path: "/ai-config/status",
			tags: ["AI Config", "Status"],
			summary: "Check AI availability",
			description: "Check whether AI is configured and available.",
		})
		.handler(async () => {
			const provider = await aiConfigService.getDefault();
			return {
				available: !!provider,
				provider: provider
					? {
							displayName: provider.displayName,
							provider: provider.provider,
							model: provider.model,
						}
					: null,
			};
		}),
};

export const aiConfigRouter = {
	providers: providersRouter,
	quotas: quotasRouter,
	usage: usageRouter,
	globalSettings: globalSettingsRouter,
	status: statusRouter,
};
