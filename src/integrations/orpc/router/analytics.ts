import z from "zod";
import { protectedProcedure } from "../context";
import { analyticsService } from "../services/analytics";

export const analyticsRouter = {
	getOverview: protectedProcedure
		.route({
			method: "GET",
			path: "/analytics/overview",
			tags: ["Analytics"],
			summary: "Get analytics overview",
			description: "Get aggregated analytics data for the user dashboard.",
		})
		.output(
			z.object({
				totalViews: z.number(),
				totalDownloads: z.number(),
				totalResumes: z.number(),
				resumeMetrics: z.array(
					z.object({
						id: z.string().uuid(),
						resumeName: z.string(),
						views: z.number(),
						downloads: z.number(),
						shares: z.number(),
						lastUpdated: z.coerce.date(),
						trend: z.enum(["up", "down", "stable"]),
						changePercent: z.number(),
					}),
				),
				interviewStats: z.array(z.object({ status: z.string(), count: z.number() })),
				skillStats: z.array(z.object({ status: z.string(), count: z.number() })),
			}),
		)
		.handler(async ({ context }) => {
			const data = await analyticsService.getOverview(context.user.id);
			return {
				totalViews: data.totalViews ?? 0,
				totalDownloads: data.totalDownloads ?? 0,
				totalResumes: data.totalResumes ?? 0,
				resumeMetrics: data.resumeMetrics,
				interviewStats: data.interviewStats,
				skillStats: data.skillStats,
			};
		}),
};
