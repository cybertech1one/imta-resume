import z from "zod";
import { protectedProcedure } from "../context";
import { userSettingsService } from "../services/user-settings";

export const userSettingsRouter = {
	getPreferredAiLanguage: protectedProcedure
		.route({
			method: "GET",
			path: "/user-settings/preferred-ai-language",
			tags: ["User Settings"],
			summary: "Get preferred AI response language",
		})
		.output(z.object({ language: z.string() }))
		.handler(async ({ context }) => {
			const language = await userSettingsService.getPreferredAiLanguage(context.user.id);
			return { language };
		}),

	updatePreferredAiLanguage: protectedProcedure
		.route({
			method: "PUT",
			path: "/user-settings/preferred-ai-language",
			tags: ["User Settings"],
			summary: "Update preferred AI response language",
		})
		.input(z.object({ language: z.string() }))
		.output(z.object({ success: z.boolean() }))
		.handler(async ({ context, input }) => {
			await userSettingsService.updatePreferredAiLanguage(context.user.id, input.language);
			return { success: true };
		}),

	getOnboardingStatus: protectedProcedure
		.route({
			method: "GET",
			path: "/user-settings/onboarding-status",
			tags: ["User Settings"],
			summary: "Check if user has completed the onboarding wizard",
		})
		.output(z.object({ completed: z.boolean() }))
		.handler(async ({ context }) => {
			const completed = await userSettingsService.getOnboardingCompleted(context.user.id);
			return { completed };
		}),

	completeOnboarding: protectedProcedure
		.route({
			method: "POST",
			path: "/user-settings/onboarding/complete",
			tags: ["User Settings"],
			summary: "Mark the onboarding wizard as completed",
		})
		.output(z.object({ success: z.boolean() }))
		.handler(async ({ context }) => {
			await userSettingsService.completeOnboarding(context.user.id);
			return { success: true };
		}),
};
