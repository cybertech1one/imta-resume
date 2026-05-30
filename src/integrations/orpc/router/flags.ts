import { z } from "zod";
import { adminProcedure, publicProcedure } from "../context";
import { type FeatureFlags, flagsService, registrationSettingsService } from "../services/flags";

const registrationStatusSchema = z.object({
	mode: z.enum(["open", "invite_only", "closed"]),
	dailyCap: z.number(),
	signupsToday: z.number(),
	capReached: z.boolean(),
});

export const flagsRouter = {
	get: publicProcedure
		.route({
			method: "GET",
			path: "/flags",
			tags: ["Feature Flags"],
			summary: "Get feature flags",
			description: "Returns the current feature flags for this instance.",
		})
		.handler((): FeatureFlags => flagsService.getFlags()),

	registrationStatus: publicProcedure
		.route({
			method: "GET",
			path: "/flags/registration-status",
			tags: ["Feature Flags"],
			summary: "Get registration status",
			description: "Returns the current registration mode, daily cap, and today's signup count.",
		})
		.output(registrationStatusSchema)
		.handler(() => registrationSettingsService.getStatus()),

	setRegistrationMode: adminProcedure
		.route({
			method: "POST",
			path: "/flags/registration-mode",
			tags: ["Feature Flags", "Admin"],
			summary: "Set registration mode",
			description: "Admin-controlled: open | invite_only | closed.",
		})
		.input(z.object({ mode: z.enum(["open", "invite_only", "closed"]) }))
		.output(registrationStatusSchema)
		.handler(({ input, context }) => registrationSettingsService.setMode(input.mode, context.user.id)),
};
