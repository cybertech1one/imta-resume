export type AIProvider = {
	id: string;
	provider: string;
	displayName: string;
	apiKey: string;
	model: string;
	baseUrl: string | null;
	maxTokensPerRequest: number;
	temperature: string;
	priority: number;
	isDefault: boolean;
	isEnabled: boolean;
	createdAt: string;
	updatedAt: string;
};

export type ProviderFormData = {
	provider: string;
	displayName: string;
	apiKey: string;
	model: string;
	baseUrl: string;
	maxTokensPerRequest: number;
	temperature: number;
	priority: number;
	isDefault: boolean;
};
