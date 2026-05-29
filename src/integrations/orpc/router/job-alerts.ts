import z from "zod";
import { protectedProcedure } from "../context";
import {
	type AlertFrequency,
	type AlertStatus,
	type AlertWorkPreference,
	jobAlertService,
} from "../services/job-alerts";

const alertFrequencySchema = z.enum(["instant", "daily", "weekly"]);
const alertWorkPreferenceSchema = z.enum(["remote", "hybrid", "onsite", "any"]);
const alertStatusSchema = z.enum(["active", "paused"]);
const matchQualitySchema = z.enum(["excellent", "good", "fair"]);

const alertSchema = z.object({
	id: z.string().uuid(),
	userId: z.string(),
	name: z.string(),
	keywords: z.array(z.string()),
	locations: z.array(z.string()),
	salaryMin: z.number(),
	salaryMax: z.number(),
	industries: z.array(z.string()),
	companySizes: z.array(z.string()),
	workPreference: alertWorkPreferenceSchema,
	frequency: alertFrequencySchema,
	status: alertStatusSchema,
	lastTriggered: z.coerce.date().nullable(),
	matchCount: z.number(),
	viewedCount: z.number(),
	appliedCount: z.number(),
	createdAt: z.coerce.date(),
	updatedAt: z.coerce.date(),
});

const matchSchema = z.object({
	id: z.string().uuid(),
	alertId: z.string(),
	jobId: z.string(),
	jobTitle: z.string(),
	company: z.string(),
	location: z.string().nullable(),
	salary: z.string().nullable(),
	matchScore: z.number(),
	matchQuality: matchQualitySchema,
	matchedKeywords: z.array(z.string()),
	postedDate: z.string().nullable(),
	matchedDate: z.string(),
	isViewed: z.boolean(),
	isApplied: z.boolean(),
	isDuplicate: z.boolean(),
	duplicateOf: z.string().nullable(),
	createdAt: z.coerce.date(),
});

const matchRouter = {
	create: protectedProcedure
		.route({
			method: "POST",
			path: "/job-alerts/{alertId}/matches",
			tags: ["Job Alerts"],
			summary: "Create a new match for an alert",
		})
		.input(
			z.object({
				alertId: z.string(),
				jobId: z.string(),
				jobTitle: z.string().min(1),
				company: z.string().min(1),
				location: z.string().optional(),
				salary: z.string().optional(),
				matchScore: z.number().min(0).max(100),
				matchQuality: matchQualitySchema,
				matchedKeywords: z.array(z.string()),
				postedDate: z.string().optional(),
				isDuplicate: z.boolean().optional(),
				duplicateOf: z.string().optional(),
			}),
		)
		.output(z.string())
		.handler(async ({ context, input }) => {
			// Verify the alert belongs to the user
			await jobAlertService.getById({ id: input.alertId, userId: context.user.id });
			return await jobAlertService.match.create(input);
		}),

	list: protectedProcedure
		.route({
			method: "GET",
			path: "/job-alerts/matches",
			tags: ["Job Alerts"],
			summary: "List matches for user's alerts",
		})
		.input(
			z
				.object({
					alertId: z.string().optional(),
					matchQuality: matchQualitySchema.optional(),
					showDuplicates: z.boolean().optional(),
					limit: z.number().optional(),
					offset: z.number().optional(),
				})
				.optional()
				.default({}),
		)
		.output(z.array(matchSchema))
		.handler(async ({ context, input }) => {
			return await jobAlertService.match.list({
				userId: context.user.id,
				...input,
			});
		}),

	markViewed: protectedProcedure
		.route({
			method: "POST",
			path: "/job-alerts/{alertId}/matches/{id}/view",
			tags: ["Job Alerts"],
			summary: "Mark a match as viewed",
		})
		.input(z.object({ id: z.string().uuid(), alertId: z.string() }))
		.output(z.void())
		.handler(async ({ context, input }) => {
			return await jobAlertService.match.markViewed({
				id: input.id,
				alertId: input.alertId,
				userId: context.user.id,
			});
		}),

	markApplied: protectedProcedure
		.route({
			method: "POST",
			path: "/job-alerts/{alertId}/matches/{id}/apply",
			tags: ["Job Alerts"],
			summary: "Mark a match as applied",
		})
		.input(z.object({ id: z.string().uuid(), alertId: z.string() }))
		.output(z.void())
		.handler(async ({ context, input }) => {
			return await jobAlertService.match.markApplied({
				id: input.id,
				alertId: input.alertId,
				userId: context.user.id,
			});
		}),

	delete: protectedProcedure
		.route({
			method: "DELETE",
			path: "/job-alerts/{alertId}/matches/{id}",
			tags: ["Job Alerts"],
			summary: "Delete a match",
		})
		.input(z.object({ id: z.string().uuid(), alertId: z.string() }))
		.output(z.void())
		.handler(async ({ context, input }) => {
			return await jobAlertService.match.delete({
				id: input.id,
				alertId: input.alertId,
				userId: context.user.id,
			});
		}),
};

export const jobAlertsRouter = {
	match: matchRouter,

	create: protectedProcedure
		.route({
			method: "POST",
			path: "/job-alerts",
			tags: ["Job Alerts"],
			summary: "Create a new job alert",
		})
		.input(
			z.object({
				name: z.string().min(1).max(255),
				keywords: z.array(z.string()).min(1),
				locations: z.array(z.string()).default([]),
				salaryMin: z.number().min(0).default(0),
				salaryMax: z.number().min(0).default(0),
				industries: z.array(z.string()).default([]),
				companySizes: z.array(z.string()).default([]),
				workPreference: alertWorkPreferenceSchema.default("any"),
				frequency: alertFrequencySchema.default("daily"),
			}),
		)
		.output(z.string())
		.handler(async ({ context, input }) => {
			return await jobAlertService.create({
				...input,
				userId: context.user.id,
			});
		}),

	getById: protectedProcedure
		.route({
			method: "GET",
			path: "/job-alerts/{id}",
			tags: ["Job Alerts"],
			summary: "Get alert by ID",
		})
		.input(z.object({ id: z.string().uuid() }))
		.output(alertSchema)
		.handler(async ({ context, input }) => {
			return await jobAlertService.getById({ id: input.id, userId: context.user.id });
		}),

	list: protectedProcedure
		.route({
			method: "GET",
			path: "/job-alerts",
			tags: ["Job Alerts"],
			summary: "List all job alerts",
		})
		.input(
			z
				.object({
					status: alertStatusSchema.optional(),
				})
				.optional()
				.default({}),
		)
		.output(z.array(alertSchema))
		.handler(async ({ context, input }) => {
			return await jobAlertService.list({
				userId: context.user.id,
				status: input.status as AlertStatus | undefined,
			});
		}),

	update: protectedProcedure
		.route({
			method: "PUT",
			path: "/job-alerts/{id}",
			tags: ["Job Alerts"],
			summary: "Update an alert",
		})
		.input(
			z.object({
				id: z.string().uuid(),
				name: z.string().min(1).max(255).optional(),
				keywords: z.array(z.string()).optional(),
				locations: z.array(z.string()).optional(),
				salaryMin: z.number().min(0).optional(),
				salaryMax: z.number().min(0).optional(),
				industries: z.array(z.string()).optional(),
				companySizes: z.array(z.string()).optional(),
				workPreference: alertWorkPreferenceSchema.optional(),
				frequency: alertFrequencySchema.optional(),
				status: alertStatusSchema.optional(),
			}),
		)
		.output(z.void())
		.handler(async ({ context, input }) => {
			return await jobAlertService.update({
				...input,
				userId: context.user.id,
				workPreference: input.workPreference as AlertWorkPreference | undefined,
				frequency: input.frequency as AlertFrequency | undefined,
				status: input.status as AlertStatus | undefined,
			});
		}),

	toggleStatus: protectedProcedure
		.route({
			method: "POST",
			path: "/job-alerts/{id}/toggle-status",
			tags: ["Job Alerts"],
			summary: "Toggle alert status (active/paused)",
		})
		.input(z.object({ id: z.string().uuid() }))
		.output(alertStatusSchema)
		.handler(async ({ context, input }) => {
			return await jobAlertService.toggleStatus({ id: input.id, userId: context.user.id });
		}),

	delete: protectedProcedure
		.route({
			method: "DELETE",
			path: "/job-alerts/{id}",
			tags: ["Job Alerts"],
			summary: "Delete an alert",
		})
		.input(z.object({ id: z.string().uuid() }))
		.output(z.void())
		.handler(async ({ context, input }) => {
			return await jobAlertService.delete({ id: input.id, userId: context.user.id });
		}),

	getStatistics: protectedProcedure
		.route({
			method: "GET",
			path: "/job-alerts/statistics",
			tags: ["Job Alerts"],
			summary: "Get alert statistics",
		})
		.output(
			z.object({
				totalAlerts: z.number(),
				activeAlerts: z.number(),
				totalMatches: z.number(),
				appliedFromAlerts: z.number(),
				avgMatchScore: z.number(),
				topPerformingAlert: z.string(),
			}),
		)
		.handler(async ({ context }) => {
			return await jobAlertService.getStatistics({ userId: context.user.id });
		}),
};
