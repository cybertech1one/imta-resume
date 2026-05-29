import z from "zod";
import type { UserActivityCategory, UserActivityType } from "@/integrations/drizzle/schema";
import { protectedProcedure } from "../context";
import { userActivityService } from "../services/user-activity";

// ============================================
// Schemas
// ============================================

const activityTypeSchema = z.enum([
	// Resume activities
	"resume_created",
	"resume_updated",
	"resume_deleted",
	"resume_viewed",
	"resume_downloaded",
	"resume_shared",
	// Job application activities
	"job_application_created",
	"job_application_updated",
	"job_application_status_changed",
	"job_application_deleted",
	// Interview activities
	"interview_scheduled",
	"interview_completed",
	"interview_cancelled",
	"interview_practice_started",
	"interview_practice_completed",
	// AI activities
	"ai_content_generated",
	"ai_resume_analyzed",
	"ai_interview_chat",
	"ai_cover_letter_generated",
	// Skill activities
	"skill_added",
	"skill_updated",
	"skill_removed",
	// Goal activities
	"goal_created",
	"goal_updated",
	"goal_completed",
	"goal_deleted",
	// Network activities
	"contact_added",
	"contact_updated",
	"contact_deleted",
	"networking_event_attended",
	// Training activities
	"training_started",
	"training_completed",
	"certification_added",
	// Deadline activities
	"deadline_created",
	"deadline_completed",
	// Page view activities
	"page_view",
	"feature_used",
]);

const activityCategorySchema = z.enum([
	"resume",
	"career",
	"interview",
	"jobs",
	"networking",
	"ai",
	"training",
	"goals",
	"general",
]);

const activityRecordSchema = z.object({
	id: z.string().uuid(),
	userId: z.string(),
	activityType: z.string(),
	category: z.string(),
	resourceId: z.string().nullable(),
	resourceType: z.string().nullable(),
	metadata: z.record(z.string(), z.unknown()).nullable(),
	createdAt: z.coerce.date(),
});

const activityStatsSchema = z.object({
	totalActivities: z.number(),
	byCategory: z.array(
		z.object({
			category: z.string(),
			count: z.number(),
		}),
	),
	byType: z.array(
		z.object({
			type: z.string(),
			count: z.number(),
		}),
	),
	mostActiveDay: z.string().nullable(),
	averagePerDay: z.number(),
});

const dailyActivitySchema = z.object({
	date: z.string(),
	count: z.number(),
	byCategory: z.array(
		z.object({
			category: z.string(),
			count: z.number(),
		}),
	),
});

// ============================================
// Router
// ============================================

export const userActivityRouter = {
	/**
	 * Log a new user activity
	 */
	log: protectedProcedure
		.route({
			method: "POST",
			path: "/user-activity/log",
			tags: ["User Activity"],
			summary: "Log a new user activity",
		})
		.input(
			z.object({
				type: activityTypeSchema,
				category: activityCategorySchema,
				resourceId: z.string().optional(),
				resourceType: z.string().optional(),
				metadata: z.record(z.string(), z.unknown()).optional(),
			}),
		)
		.output(z.string())
		.handler(async ({ context, input }) => {
			return await userActivityService.log({
				userId: context.user.id,
				type: input.type as UserActivityType,
				category: input.category as UserActivityCategory,
				resourceId: input.resourceId,
				resourceType: input.resourceType,
				metadata: input.metadata,
			});
		}),

	/**
	 * Get recent activities for the current user
	 */
	getRecent: protectedProcedure
		.route({
			method: "GET",
			path: "/user-activity/recent",
			tags: ["User Activity"],
			summary: "Get recent activities",
		})
		.input(
			z
				.object({
					limit: z.number().min(1).max(100).optional(),
				})
				.optional()
				.default({}),
		)
		.output(z.array(activityRecordSchema))
		.handler(async ({ context, input }) => {
			return await userActivityService.getRecent({
				userId: context.user.id,
				limit: input.limit,
			});
		}),

	/**
	 * Get activities by category
	 */
	getByCategory: protectedProcedure
		.route({
			method: "GET",
			path: "/user-activity/category/{category}",
			tags: ["User Activity"],
			summary: "Get activities by category",
		})
		.input(
			z.object({
				category: activityCategorySchema,
				startDate: z.string().datetime().optional(),
				endDate: z.string().datetime().optional(),
				limit: z.number().min(1).max(100).optional(),
				offset: z.number().min(0).optional(),
			}),
		)
		.output(z.array(activityRecordSchema))
		.handler(async ({ context, input }) => {
			return await userActivityService.getByCategory({
				userId: context.user.id,
				category: input.category as UserActivityCategory,
				startDate: input.startDate ? new Date(input.startDate) : undefined,
				endDate: input.endDate ? new Date(input.endDate) : undefined,
				limit: input.limit,
				offset: input.offset,
			});
		}),

	/**
	 * Get aggregate statistics
	 */
	getStats: protectedProcedure
		.route({
			method: "GET",
			path: "/user-activity/stats",
			tags: ["User Activity"],
			summary: "Get activity statistics",
		})
		.input(
			z
				.object({
					startDate: z.string().datetime().optional(),
					endDate: z.string().datetime().optional(),
				})
				.optional()
				.default({}),
		)
		.output(activityStatsSchema)
		.handler(async ({ context, input }) => {
			return await userActivityService.getStats({
				userId: context.user.id,
				startDate: input.startDate ? new Date(input.startDate) : undefined,
				endDate: input.endDate ? new Date(input.endDate) : undefined,
			});
		}),

	/**
	 * Get daily activity for charts
	 */
	getDailyActivity: protectedProcedure
		.route({
			method: "GET",
			path: "/user-activity/daily",
			tags: ["User Activity"],
			summary: "Get daily activity counts",
		})
		.input(
			z.object({
				days: z.number().min(1).max(365).default(30),
			}),
		)
		.output(z.array(dailyActivitySchema))
		.handler(async ({ context, input }) => {
			return await userActivityService.getDailyActivity({
				userId: context.user.id,
				days: input.days,
			});
		}),

	/**
	 * Get today's activity count
	 */
	getTodayCount: protectedProcedure
		.route({
			method: "GET",
			path: "/user-activity/today-count",
			tags: ["User Activity"],
			summary: "Get today's activity count",
		})
		.output(z.number())
		.handler(async ({ context }) => {
			return await userActivityService.getTodayCount(context.user.id);
		}),

	/**
	 * Get this week's activity count
	 */
	getWeekCount: protectedProcedure
		.route({
			method: "GET",
			path: "/user-activity/week-count",
			tags: ["User Activity"],
			summary: "Get this week's activity count",
		})
		.output(z.number())
		.handler(async ({ context }) => {
			return await userActivityService.getWeekCount(context.user.id);
		}),

	/**
	 * Delete an activity record
	 */
	delete: protectedProcedure
		.route({
			method: "DELETE",
			path: "/user-activity/{id}",
			tags: ["User Activity"],
			summary: "Delete an activity record",
		})
		.input(z.object({ id: z.string().uuid() }))
		.output(z.void())
		.handler(async ({ context, input }) => {
			await userActivityService.delete({
				id: input.id,
				userId: context.user.id,
			});
		}),
};
