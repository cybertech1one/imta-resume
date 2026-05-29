import { and, count, desc, eq, gte, sql } from "drizzle-orm";
import { schema } from "@/integrations/drizzle";
import { db } from "@/integrations/drizzle/client";

export type DashboardStatistics = {
	resumeCount: number;
	activeApplicationsCount: number;
	upcomingInterviewsCount: number;
	networkContactsCount: number;
	skillsTrackedCount: number;
	goalsProgress: number;
	applicationStatusBreakdown: Record<string, number>;
	skillsByCategory: Record<string, number>;
};

export type UpcomingItem = {
	id: string;
	type: "interview" | "deadline" | "follow_up";
	title: string;
	subtitle: string;
	date: Date;
	priority?: "high" | "medium" | "low";
};

export const dashboardService = {
	getStatistics: async (input: { userId: string }): Promise<DashboardStatistics> => {
		const today = new Date().toISOString().split("T")[0];

		const [
			[resumeResult],
			[applicationsResult],
			[interviewsResult],
			[contactsResult],
			[skillsResult],
			goals,
			statusBreakdown,
			skillsByCategoryRows,
		] = await Promise.all([
			db.select({ count: count() }).from(schema.resume).where(eq(schema.resume.userId, input.userId)),
			db
				.select({ count: count() })
				.from(schema.jobApplication)
				.where(
					and(
						eq(schema.jobApplication.userId, input.userId),
						sql`${schema.jobApplication.status} NOT IN ('rejected', 'withdrawn', 'accepted')`,
					),
				),
			db
				.select({ count: count() })
				.from(schema.scheduledInterview)
				.where(
					and(
						eq(schema.scheduledInterview.userId, input.userId),
						eq(schema.scheduledInterview.status, "scheduled"),
						gte(schema.scheduledInterview.date, today),
					),
				),
			db
				.select({ count: count() })
				.from(schema.networkingContact)
				.where(eq(schema.networkingContact.userId, input.userId)),
			db.select({ count: count() }).from(schema.userSkill).where(eq(schema.userSkill.userId, input.userId)),
			db
				.select({ progress: schema.careerGoal.progress })
				.from(schema.careerGoal)
				.where(
					and(
						eq(schema.careerGoal.userId, input.userId),
						sql`${schema.careerGoal.status} NOT IN ('completed', 'cancelled')`,
					),
				),
			db
				.select({ status: schema.jobApplication.status, count: count() })
				.from(schema.jobApplication)
				.where(eq(schema.jobApplication.userId, input.userId))
				.groupBy(schema.jobApplication.status),
			db
				.select({ category: schema.userSkill.category, count: count() })
				.from(schema.userSkill)
				.where(eq(schema.userSkill.userId, input.userId))
				.groupBy(schema.userSkill.category),
		]);

		const goalsProgress =
			goals.length > 0 ? Math.round(goals.reduce((sum, g) => sum + g.progress, 0) / goals.length) : 0;

		const applicationStatusBreakdown: Record<string, number> = {};
		for (const row of statusBreakdown) {
			applicationStatusBreakdown[row.status] = row.count;
		}

		const skillsByCategoryMap: Record<string, number> = {};
		for (const row of skillsByCategoryRows) {
			skillsByCategoryMap[row.category] = row.count;
		}

		return {
			resumeCount: resumeResult?.count ?? 0,
			activeApplicationsCount: applicationsResult?.count ?? 0,
			upcomingInterviewsCount: interviewsResult?.count ?? 0,
			networkContactsCount: contactsResult?.count ?? 0,
			skillsTrackedCount: skillsResult?.count ?? 0,
			goalsProgress,
			applicationStatusBreakdown,
			skillsByCategory: skillsByCategoryMap,
		};
	},

	getUpcomingItems: async (input: { userId: string; limit?: number }): Promise<UpcomingItem[]> => {
		const limit = input.limit ?? 10;
		const today = new Date().toISOString().split("T")[0];

		const [upcomingInterviews, upcomingDeadlines, followUps] = await Promise.all([
			db
				.select({
					id: schema.scheduledInterview.id,
					title: schema.scheduledInterview.title,
					company: schema.scheduledInterview.company,
					role: schema.scheduledInterview.role,
					date: schema.scheduledInterview.date,
					startTime: schema.scheduledInterview.startTime,
				})
				.from(schema.scheduledInterview)
				.where(
					and(
						eq(schema.scheduledInterview.userId, input.userId),
						eq(schema.scheduledInterview.status, "scheduled"),
						gte(schema.scheduledInterview.date, today),
					),
				)
				.orderBy(schema.scheduledInterview.date)
				.limit(limit),
			db
				.select({
					id: schema.jobDeadline.id,
					title: schema.jobDeadline.title,
					company: schema.jobDeadline.company,
					position: schema.jobDeadline.position,
					deadlineDate: schema.jobDeadline.deadlineDate,
					deadlineTime: schema.jobDeadline.deadlineTime,
					priority: schema.jobDeadline.priority,
				})
				.from(schema.jobDeadline)
				.where(
					and(
						eq(schema.jobDeadline.userId, input.userId),
						eq(schema.jobDeadline.completed, false),
						gte(schema.jobDeadline.deadlineDate, today),
					),
				)
				.orderBy(schema.jobDeadline.deadlineDate)
				.limit(limit),
			db
				.select({
					id: schema.networkingContact.id,
					name: schema.networkingContact.name,
					company: schema.networkingContact.company,
					nextFollowUpAt: schema.networkingContact.nextFollowUpAt,
				})
				.from(schema.networkingContact)
				.where(
					and(
						eq(schema.networkingContact.userId, input.userId),
						gte(schema.networkingContact.nextFollowUpAt, new Date()),
					),
				)
				.orderBy(schema.networkingContact.nextFollowUpAt)
				.limit(limit),
		]);

		const items: UpcomingItem[] = [];

		for (const interview of upcomingInterviews) {
			items.push({
				id: interview.id,
				type: "interview",
				title: interview.title,
				subtitle: `${interview.company} - ${interview.role}`,
				date: new Date(`${interview.date}T${interview.startTime}`),
				priority: "high",
			});
		}

		for (const deadline of upcomingDeadlines) {
			items.push({
				id: deadline.id,
				type: "deadline",
				title: deadline.title,
				subtitle: `${deadline.company} - ${deadline.position}`,
				date: new Date(`${deadline.deadlineDate}T${deadline.deadlineTime}`),
				priority: deadline.priority as "high" | "medium" | "low",
			});
		}

		for (const contact of followUps) {
			if (contact.nextFollowUpAt) {
				items.push({
					id: contact.id,
					type: "follow_up",
					title: `Follow up with ${contact.name}`,
					subtitle: contact.company ?? "Contact",
					date: contact.nextFollowUpAt,
					priority: "medium",
				});
			}
		}

		items.sort((a, b) => a.date.getTime() - b.date.getTime());
		return items.slice(0, limit);
	},

	// Get recent activities
	getRecentActivity: async (input: { userId: string; limit?: number }) => {
		const limit = input.limit ?? 10;

		const activities = await db
			.select()
			.from(schema.userActivity)
			.where(eq(schema.userActivity.userId, input.userId))
			.orderBy(desc(schema.userActivity.createdAt))
			.limit(limit);

		return activities;
	},
};
