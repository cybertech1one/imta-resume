import { count, desc, eq, sum } from "drizzle-orm";
import { db } from "@/integrations/drizzle/client";
import { interviewSession, resume, resumeStatistics, userTrainingInterests } from "@/integrations/drizzle/schema";

export const analyticsService = {
	getOverview: async (userId: string) => {
		// Get aggregated stats
		const [stats] = await db
			.select({
				totalViews: sum(resumeStatistics.views).mapWith(Number),
				totalDownloads: sum(resumeStatistics.downloads).mapWith(Number),
				totalResumes: count(resume.id),
			})
			.from(resume)
			.leftJoin(resumeStatistics, eq(resumeStatistics.resumeId, resume.id))
			.where(eq(resume.userId, userId));

		// Get per-resume stats (Top performing)
		const resumeMetrics = await db
			.select({
				id: resume.id,
				name: resume.name,
				slug: resume.slug,
				views: resumeStatistics.views,
				downloads: resumeStatistics.downloads,
				lastUpdated: resume.updatedAt,
				lastViewed: resumeStatistics.lastViewedAt,
			})
			.from(resume)
			.leftJoin(resumeStatistics, eq(resumeStatistics.resumeId, resume.id))
			.where(eq(resume.userId, userId))
			.orderBy(desc(resumeStatistics.views)) // Order by views descending
			.limit(5);

		// Transform to match UI needs
		const metrics = resumeMetrics.map((r) => ({
			id: r.id,
			resumeName: r.name,
			views: r.views ?? 0,
			downloads: r.downloads ?? 0,
			shares: 0,
			lastUpdated: r.lastUpdated,
			trend: "stable" as const,
			changePercent: 0,
		}));

		// Get interview stats
		const interviewStats = await db
			.select({
				status: interviewSession.status,
				count: count(interviewSession.id),
			})
			.from(interviewSession)
			.where(eq(interviewSession.userId, userId))
			.groupBy(interviewSession.status);

		// Get skill stats (training interests)
		const skillStats = await db
			.select({
				status: userTrainingInterests.status,
				count: count(userTrainingInterests.id),
			})
			.from(userTrainingInterests)
			.where(eq(userTrainingInterests.userId, userId))
			.groupBy(userTrainingInterests.status);

		return {
			...stats,
			resumeMetrics: metrics,
			interviewStats: interviewStats.map((s) => ({ status: s.status, count: s.count })),
			skillStats: skillStats.map((s) => ({ status: s.status, count: s.count })),
		};
	},
};
