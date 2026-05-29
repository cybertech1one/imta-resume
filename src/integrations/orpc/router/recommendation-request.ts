import z from "zod";
import { protectedProcedure } from "../context";
import {
	type RecommendationRequestStatus,
	type RecommenderType,
	type ReminderFrequency,
	recommendationRequestService,
} from "../services/recommendation-request";

const recommenderTypeSchema = z.enum(["supervisor", "colleague", "professor", "mentor", "client"]);
const requestStatusSchema = z.enum(["pending", "received", "sent"]);
const reminderFrequencySchema = z.enum(["none", "daily", "weekly", "biweekly"]);

const recommenderSchema = z.object({
	id: z.string().uuid(),
	userId: z.string(),
	name: z.string(),
	email: z.string(),
	phone: z.string(),
	title: z.string(),
	company: z.string(),
	relationship: recommenderTypeSchema,
	yearsKnown: z.number(),
	notes: z.string(),
	createdAt: z.coerce.date(),
	updatedAt: z.coerce.date(),
});

const requestSchema = z.object({
	id: z.string().uuid(),
	userId: z.string(),
	recommenderId: z.string(),
	purpose: z.string(),
	deadline: z.string(),
	status: requestStatusSchema,
	requestDate: z.string(),
	receivedDate: z.string().nullable(),
	sentToDate: z.string().nullable(),
	talkingPoints: z.array(z.string()),
	followUpReminder: reminderFrequencySchema,
	lastReminderSent: z.string().nullable(),
	notes: z.string(),
	createdAt: z.coerce.date(),
	updatedAt: z.coerce.date(),
});

// Recommender sub-router
const recommendersRouter = {
	create: protectedProcedure
		.route({
			method: "POST",
			path: "/recommendation-request/recommenders",
			tags: ["RecommendationRequest"],
			summary: "Create a new recommender",
		})
		.input(
			z.object({
				name: z.string().min(1).max(255),
				email: z.string().email(),
				phone: z.string().optional(),
				title: z.string().optional(),
				company: z.string().optional(),
				relationship: recommenderTypeSchema.optional(),
				yearsKnown: z.number().min(1).optional(),
				notes: z.string().optional(),
			}),
		)
		.output(z.string())
		.handler(async ({ context, input }) => {
			return await recommendationRequestService.createRecommender({
				...input,
				userId: context.user.id,
				relationship: input.relationship as RecommenderType | undefined,
			});
		}),

	getById: protectedProcedure
		.route({
			method: "GET",
			path: "/recommendation-request/recommenders/{id}",
			tags: ["RecommendationRequest"],
			summary: "Get recommender by ID",
		})
		.input(z.object({ id: z.string().uuid() }))
		.output(recommenderSchema)
		.handler(async ({ context, input }) => {
			return await recommendationRequestService.getRecommenderById({
				id: input.id,
				userId: context.user.id,
			});
		}),

	list: protectedProcedure
		.route({
			method: "GET",
			path: "/recommendation-request/recommenders",
			tags: ["RecommendationRequest"],
			summary: "List all recommenders",
		})
		.input(
			z
				.object({
					relationship: recommenderTypeSchema.optional(),
					limit: z.number().optional(),
					offset: z.number().optional(),
				})
				.optional()
				.default({}),
		)
		.output(z.array(recommenderSchema))
		.handler(async ({ context, input }) => {
			return await recommendationRequestService.listRecommenders({
				userId: context.user.id,
				...input,
				relationship: input.relationship as RecommenderType | undefined,
			});
		}),

	update: protectedProcedure
		.route({
			method: "PUT",
			path: "/recommendation-request/recommenders/{id}",
			tags: ["RecommendationRequest"],
			summary: "Update a recommender",
		})
		.input(
			z.object({
				id: z.string().uuid(),
				name: z.string().min(1).max(255).optional(),
				email: z.string().email().optional(),
				phone: z.string().optional(),
				title: z.string().optional(),
				company: z.string().optional(),
				relationship: recommenderTypeSchema.optional(),
				yearsKnown: z.number().min(1).optional(),
				notes: z.string().optional(),
			}),
		)
		.output(z.void())
		.handler(async ({ context, input }) => {
			return await recommendationRequestService.updateRecommender({
				...input,
				userId: context.user.id,
				relationship: input.relationship as RecommenderType | undefined,
			});
		}),

	delete: protectedProcedure
		.route({
			method: "DELETE",
			path: "/recommendation-request/recommenders/{id}",
			tags: ["RecommendationRequest"],
			summary: "Delete a recommender",
		})
		.input(z.object({ id: z.string().uuid() }))
		.output(z.void())
		.handler(async ({ context, input }) => {
			return await recommendationRequestService.deleteRecommender({
				id: input.id,
				userId: context.user.id,
			});
		}),
};

// Requests sub-router
const requestsRouter = {
	create: protectedProcedure
		.route({
			method: "POST",
			path: "/recommendation-request/requests",
			tags: ["RecommendationRequest"],
			summary: "Create a new recommendation request",
		})
		.input(
			z.object({
				recommenderId: z.string(),
				purpose: z.string().min(1),
				deadline: z.string(),
				status: requestStatusSchema.optional(),
				requestDate: z.string(),
				receivedDate: z.string().optional(),
				sentToDate: z.string().optional(),
				talkingPoints: z.array(z.string()).optional(),
				followUpReminder: reminderFrequencySchema.optional(),
				lastReminderSent: z.string().optional(),
				notes: z.string().optional(),
			}),
		)
		.output(z.string())
		.handler(async ({ context, input }) => {
			return await recommendationRequestService.createRequest({
				...input,
				userId: context.user.id,
				status: input.status as RecommendationRequestStatus | undefined,
				followUpReminder: input.followUpReminder as ReminderFrequency | undefined,
			});
		}),

	getById: protectedProcedure
		.route({
			method: "GET",
			path: "/recommendation-request/requests/{id}",
			tags: ["RecommendationRequest"],
			summary: "Get request by ID",
		})
		.input(z.object({ id: z.string().uuid() }))
		.output(requestSchema.extend({ recommender: recommenderSchema.nullable() }))
		.handler(async ({ context, input }) => {
			return await recommendationRequestService.getRequestById({
				id: input.id,
				userId: context.user.id,
			});
		}),

	list: protectedProcedure
		.route({
			method: "GET",
			path: "/recommendation-request/requests",
			tags: ["RecommendationRequest"],
			summary: "List all recommendation requests",
		})
		.input(
			z
				.object({
					status: requestStatusSchema.optional(),
					limit: z.number().optional(),
					offset: z.number().optional(),
				})
				.optional()
				.default({}),
		)
		.output(z.array(requestSchema))
		.handler(async ({ context, input }) => {
			return await recommendationRequestService.listRequests({
				userId: context.user.id,
				...input,
				status: input.status as RecommendationRequestStatus | undefined,
			});
		}),

	update: protectedProcedure
		.route({
			method: "PUT",
			path: "/recommendation-request/requests/{id}",
			tags: ["RecommendationRequest"],
			summary: "Update a recommendation request",
		})
		.input(
			z.object({
				id: z.string().uuid(),
				recommenderId: z.string().optional(),
				purpose: z.string().min(1).optional(),
				deadline: z.string().optional(),
				status: requestStatusSchema.optional(),
				requestDate: z.string().optional(),
				receivedDate: z.string().optional(),
				sentToDate: z.string().optional(),
				talkingPoints: z.array(z.string()).optional(),
				followUpReminder: reminderFrequencySchema.optional(),
				lastReminderSent: z.string().optional(),
				notes: z.string().optional(),
			}),
		)
		.output(z.void())
		.handler(async ({ context, input }) => {
			return await recommendationRequestService.updateRequest({
				...input,
				userId: context.user.id,
				status: input.status as RecommendationRequestStatus | undefined,
				followUpReminder: input.followUpReminder as ReminderFrequency | undefined,
			});
		}),

	updateStatus: protectedProcedure
		.route({
			method: "PATCH",
			path: "/recommendation-request/requests/{id}/status",
			tags: ["RecommendationRequest"],
			summary: "Update request status",
		})
		.input(
			z.object({
				id: z.string().uuid(),
				status: requestStatusSchema,
			}),
		)
		.output(z.void())
		.handler(async ({ context, input }) => {
			return await recommendationRequestService.updateRequestStatus({
				id: input.id,
				userId: context.user.id,
				status: input.status as RecommendationRequestStatus,
			});
		}),

	delete: protectedProcedure
		.route({
			method: "DELETE",
			path: "/recommendation-request/requests/{id}",
			tags: ["RecommendationRequest"],
			summary: "Delete a recommendation request",
		})
		.input(z.object({ id: z.string().uuid() }))
		.output(z.void())
		.handler(async ({ context, input }) => {
			return await recommendationRequestService.deleteRequest({
				id: input.id,
				userId: context.user.id,
			});
		}),
};

export const recommendationRequestRouter = {
	recommenders: recommendersRouter,
	requests: requestsRouter,

	// Statistics endpoint
	getStatistics: protectedProcedure
		.route({
			method: "GET",
			path: "/recommendation-request/statistics",
			tags: ["RecommendationRequest"],
			summary: "Get recommendation request statistics",
		})
		.output(
			z.object({
				total: z.number(),
				pending: z.number(),
				received: z.number(),
				sent: z.number(),
				urgent: z.number(),
				recommenders: z.number(),
			}),
		)
		.handler(async ({ context }) => {
			return await recommendationRequestService.getStatistics({ userId: context.user.id });
		}),

	// Get pending follow-ups
	getPendingFollowUps: protectedProcedure
		.route({
			method: "GET",
			path: "/recommendation-request/pending-follow-ups",
			tags: ["RecommendationRequest"],
			summary: "Get pending requests needing follow-up",
		})
		.output(z.array(requestSchema))
		.handler(async ({ context }) => {
			return await recommendationRequestService.getPendingFollowUps({ userId: context.user.id });
		}),
};
