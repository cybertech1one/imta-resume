import { and, desc, eq } from "drizzle-orm";
import { db } from "@/integrations/drizzle/client";
import * as schema from "@/integrations/drizzle/schema";

/**
 * AI Configuration Service
 *
 * SECURITY NOTES:
 * - `list()` and `getById()` explicitly exclude apiKey for safe client exposure
 * - `getDefault()`, `getByProvider()`, and `getActiveProvider()` return full records
 *   including apiKey - these are ONLY for internal server-side AI API calls
 * - Router endpoints that expose data to clients MUST use list() or getById()
 * - Never expose the full provider object to client responses
 */
export const aiConfigService = {
	list: async () => {
		return db
			.select({
				id: schema.aiProviderConfig.id,
				provider: schema.aiProviderConfig.provider,
				displayName: schema.aiProviderConfig.displayName,
				model: schema.aiProviderConfig.model,
				baseUrl: schema.aiProviderConfig.baseUrl,
				maxTokensPerRequest: schema.aiProviderConfig.maxTokensPerRequest,
				temperature: schema.aiProviderConfig.temperature,
				priority: schema.aiProviderConfig.priority,
				isDefault: schema.aiProviderConfig.isDefault,
				isEnabled: schema.aiProviderConfig.isEnabled,
				createdAt: schema.aiProviderConfig.createdAt,
				updatedAt: schema.aiProviderConfig.updatedAt,
			})
			.from(schema.aiProviderConfig)
			.orderBy(desc(schema.aiProviderConfig.priority), desc(schema.aiProviderConfig.createdAt));
	},

	getById: async (id: string) => {
		const [result] = await db
			.select({
				id: schema.aiProviderConfig.id,
				provider: schema.aiProviderConfig.provider,
				displayName: schema.aiProviderConfig.displayName,
				model: schema.aiProviderConfig.model,
				baseUrl: schema.aiProviderConfig.baseUrl,
				maxTokensPerRequest: schema.aiProviderConfig.maxTokensPerRequest,
				temperature: schema.aiProviderConfig.temperature,
				priority: schema.aiProviderConfig.priority,
				isDefault: schema.aiProviderConfig.isDefault,
				isEnabled: schema.aiProviderConfig.isEnabled,
				createdAt: schema.aiProviderConfig.createdAt,
				updatedAt: schema.aiProviderConfig.updatedAt,
			})
			.from(schema.aiProviderConfig)
			.where(eq(schema.aiProviderConfig.id, id));

		return result ?? null;
	},

	getDefault: async () => {
		// Try to find the default enabled provider
		const [defaultProvider] = await db
			.select()
			.from(schema.aiProviderConfig)
			.where(and(eq(schema.aiProviderConfig.isDefault, true), eq(schema.aiProviderConfig.isEnabled, true)));

		if (defaultProvider) return defaultProvider;

		// Fall back to the first enabled provider by priority
		const [firstEnabled] = await db
			.select()
			.from(schema.aiProviderConfig)
			.where(eq(schema.aiProviderConfig.isEnabled, true))
			.orderBy(desc(schema.aiProviderConfig.priority))
			.limit(1);

		return firstEnabled ?? null;
	},

	getByProvider: async (provider: string) => {
		return db
			.select()
			.from(schema.aiProviderConfig)
			.where(
				and(
					eq(schema.aiProviderConfig.provider, provider as typeof schema.aiProviderConfig.$inferSelect.provider),
					eq(schema.aiProviderConfig.isEnabled, true),
				),
			);
	},

	create: async (input: {
		provider: typeof schema.aiProviderConfig.$inferSelect.provider;
		displayName: string;
		apiKey: string;
		model: string;
		baseUrl?: string;
		isDefault?: boolean;
		maxTokensPerRequest?: number;
		temperature?: string;
		priority?: number;
	}) => {
		if (input.isDefault) {
			await db
				.update(schema.aiProviderConfig)
				.set({ isDefault: false })
				.where(eq(schema.aiProviderConfig.isDefault, true));
		}

		const [created] = await db
			.insert(schema.aiProviderConfig)
			.values({
				provider: input.provider,
				displayName: input.displayName,
				apiKey: input.apiKey,
				model: input.model,
				baseUrl: input.baseUrl,
				isDefault: input.isDefault ?? false,
				maxTokensPerRequest: input.maxTokensPerRequest,
				temperature: input.temperature,
				priority: input.priority,
			})
			.returning({
				id: schema.aiProviderConfig.id,
				provider: schema.aiProviderConfig.provider,
				displayName: schema.aiProviderConfig.displayName,
				model: schema.aiProviderConfig.model,
				baseUrl: schema.aiProviderConfig.baseUrl,
				maxTokensPerRequest: schema.aiProviderConfig.maxTokensPerRequest,
				temperature: schema.aiProviderConfig.temperature,
				priority: schema.aiProviderConfig.priority,
				isDefault: schema.aiProviderConfig.isDefault,
				isEnabled: schema.aiProviderConfig.isEnabled,
				createdAt: schema.aiProviderConfig.createdAt,
				updatedAt: schema.aiProviderConfig.updatedAt,
			});

		return created;
	},

	update: async (
		id: string,
		input: {
			provider?: typeof schema.aiProviderConfig.$inferSelect.provider;
			displayName?: string;
			apiKey?: string;
			model?: string;
			baseUrl?: string;
			isDefault?: boolean;
			maxTokensPerRequest?: number;
			temperature?: string;
			priority?: number;
		},
	) => {
		if (input.isDefault) {
			await db
				.update(schema.aiProviderConfig)
				.set({ isDefault: false })
				.where(eq(schema.aiProviderConfig.isDefault, true));
		}

		const [updated] = await db
			.update(schema.aiProviderConfig)
			.set(input)
			.where(eq(schema.aiProviderConfig.id, id))
			.returning({
				id: schema.aiProviderConfig.id,
				provider: schema.aiProviderConfig.provider,
				displayName: schema.aiProviderConfig.displayName,
				model: schema.aiProviderConfig.model,
				baseUrl: schema.aiProviderConfig.baseUrl,
				maxTokensPerRequest: schema.aiProviderConfig.maxTokensPerRequest,
				temperature: schema.aiProviderConfig.temperature,
				priority: schema.aiProviderConfig.priority,
				isDefault: schema.aiProviderConfig.isDefault,
				isEnabled: schema.aiProviderConfig.isEnabled,
				createdAt: schema.aiProviderConfig.createdAt,
				updatedAt: schema.aiProviderConfig.updatedAt,
			});

		return updated;
	},

	delete: async (id: string) => {
		await db.delete(schema.aiProviderConfig).where(eq(schema.aiProviderConfig.id, id));
	},

	setDefault: async (id: string) => {
		await db
			.update(schema.aiProviderConfig)
			.set({ isDefault: false })
			.where(eq(schema.aiProviderConfig.isDefault, true));

		await db.update(schema.aiProviderConfig).set({ isDefault: true }).where(eq(schema.aiProviderConfig.id, id));
	},

	toggleEnabled: async (id: string) => {
		const config = await aiConfigService.getById(id);
		if (!config) return;

		await db
			.update(schema.aiProviderConfig)
			.set({ isEnabled: !config.isEnabled })
			.where(eq(schema.aiProviderConfig.id, id));
	},

	getActiveProvider: async () => {
		const provider = await aiConfigService.getDefault();

		if (!provider) {
			throw new Error("No AI provider configured. Please ask an administrator to set up AI.");
		}

		return provider;
	},
};
