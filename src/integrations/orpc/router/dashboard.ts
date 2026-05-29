import z from "zod";
import { protectedProcedure } from "../context";
import { dashboardService } from "../services/dashboard";

const statisticsSchema = z.object({
	resumeCount: z.coerce.number(),
	activeApplicationsCount: z.coerce.number(),
	upcomingInterviewsCount: z.coerce.number(),
	networkContactsCount: z.coerce.number(),
	skillsTrackedCount: z.coerce.number(),
	goalsProgress: z.coerce.number(),
	applicationStatusBreakdown: z.record(z.string(), z.coerce.number()),
	skillsByCategory: z.record(z.string(), z.coerce.number()),
});

const upcomingItemSchema = z.object({
	id: z.string(),
	type: z.enum(["interview", "deadline", "follow_up"]),
	title: z.string(),
	subtitle: z.string(),
	date: z.coerce.date(),
	priority: z.enum(["high", "medium", "low"]).optional(),
});

const activitySchema = z.object({
	id: z.string(),
	userId: z.string(),
	activityType: z.string(),
	category: z.string(),
	resourceId: z.string().nullable(),
	resourceType: z.string().nullable(),
	metadata: z.record(z.string(), z.unknown()).nullable(),
	createdAt: z.coerce.date(),
});

export const dashboardRouter = {
	getStatistics: protectedProcedure
		.route({
			method: "GET",
			path: "/dashboard/statistics",
			tags: ["Dashboard"],
			summary: "Get dashboard statistics",
			description: "Get aggregated statistics for the dashboard including resume count, applications, interviews, etc.",
		})
		.output(statisticsSchema)
		.handler(async ({ context }) => {
			return await dashboardService.getStatistics({ userId: context.user.id });
		}),

	getUpcomingItems: protectedProcedure
		.route({
			method: "GET",
			path: "/dashboard/upcoming",
			tags: ["Dashboard"],
			summary: "Get upcoming items",
			description: "Get upcoming interviews, deadlines, and follow-ups for the dashboard.",
		})
		.input(
			z
				.object({ limit: z.number().min(1).max(20).optional() })
				.optional()
				.default({}),
		)
		.output(z.array(upcomingItemSchema))
		.handler(async ({ context, input }) => {
			return await dashboardService.getUpcomingItems({ userId: context.user.id, limit: input.limit });
		}),

	getRecentActivity: protectedProcedure
		.route({
			method: "GET",
			path: "/dashboard/activity",
			tags: ["Dashboard"],
			summary: "Get recent activity",
			description: "Get recent user activities for the dashboard feed.",
		})
		.input(
			z
				.object({ limit: z.number().min(1).max(20).optional() })
				.optional()
				.default({}),
		)
		.output(z.array(activitySchema))
		.handler(async ({ context, input }) => {
			return await dashboardService.getRecentActivity({ userId: context.user.id, limit: input.limit });
		}),
};
