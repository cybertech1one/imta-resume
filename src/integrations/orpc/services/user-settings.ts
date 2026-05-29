import { eq } from "drizzle-orm";
import { db } from "@/integrations/drizzle/client";
import { user } from "@/integrations/drizzle/schema";

export const userSettingsService = {
	async getPreferredAiLanguage(userId: string): Promise<string> {
		const [result] = await db
			.select({ preferredAiLanguage: user.preferredAiLanguage })
			.from(user)
			.where(eq(user.id, userId))
			.limit(1);
		return result?.preferredAiLanguage ?? "fr";
	},

	async updatePreferredAiLanguage(userId: string, language: string): Promise<void> {
		await db.update(user).set({ preferredAiLanguage: language }).where(eq(user.id, userId));
	},

	async getOnboardingCompleted(userId: string): Promise<boolean> {
		const [result] = await db
			.select({ onboardingCompleted: user.onboardingCompleted })
			.from(user)
			.where(eq(user.id, userId))
			.limit(1);
		return result?.onboardingCompleted ?? false;
	},

	async completeOnboarding(userId: string): Promise<void> {
		await db.update(user).set({ onboardingCompleted: true }).where(eq(user.id, userId));
	},
};
