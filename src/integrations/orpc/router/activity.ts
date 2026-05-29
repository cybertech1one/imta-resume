import z from "zod";
import type { UserActivityType } from "@/integrations/drizzle/schema";
import { protectedProcedure } from "../context";
import { activityService } from "../services/activity";

// Expanded activity type schema to match the new schema
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
	// General activities
	"page_view",
	"feature_used",
]);

const activitySchema = z.object({
	id: z.string(),
	userId: z.string(),
	type: activityTypeSchema,
	title: z.string(),
	description: z.string().nullable(),
	entityId: z.string().nullable(),
	entityType: z.string().nullable(),
	metadata: z.record(z.string(), z.unknown()).nullable(),
	createdAt: z.coerce.date(),
});

export const activityRouter = {
	create: protectedProcedure
		.route({
			method: "POST",
			path: "/activity",
			tags: ["Activity"],
			summary: "Create a new activity record",
		})
		.input(
			z.object({
				type: activityTypeSchema,
				title: z.string().min(1).max(255),
				description: z.string().optional(),
				entityId: z.string().optional(),
				entityType: z.string().optional(),
				metadata: z.record(z.string(), z.unknown()).optional(),
			}),
		)
		.output(z.string())
		.handler(async ({ context, input }) => {
			return await activityService.create({
				...input,
				userId: context.user.id,
				type: input.type as UserActivityType,
			});
		}),

	list: protectedProcedure
		.route({
			method: "GET",
			path: "/activity",
			tags: ["Activity"],
			summary: "List recent activities",
		})
		.input(
			z
				.object({
					limit: z.number().min(1).max(100).optional(),
					offset: z.number().min(0).optional(),
					type: activityTypeSchema.optional(),
				})
				.optional()
				.default({}),
		)
		.output(z.array(activitySchema))
		.handler(async ({ context, input }) => {
			return await activityService.list({
				userId: context.user.id,
				limit: input.limit,
				offset: input.offset,
				type: input.type as UserActivityType | undefined,
			});
		}),

	delete: protectedProcedure
		.route({
			method: "DELETE",
			path: "/activity/{id}",
			tags: ["Activity"],
			summary: "Delete an activity record",
		})
		.input(z.object({ id: z.string().uuid() }))
		.output(z.void())
		.handler(async ({ context, input }) => {
			return await activityService.delete({ id: input.id, userId: context.user.id });
		}),
};
