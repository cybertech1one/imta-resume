import { and, desc, eq } from "drizzle-orm";
import { schema } from "@/integrations/drizzle";
import { db } from "@/integrations/drizzle/client";
import type { UserActivityCategory, UserActivityType } from "@/integrations/drizzle/schema";
import { generateId } from "@/utils/string";

// Map activity types to categories for backward compatibility
const typeToCategoryMap: Record<string, UserActivityCategory> = {
	resume_created: "resume",
	resume_updated: "resume",
	resume_deleted: "resume",
	resume_viewed: "resume",
	resume_downloaded: "resume",
	resume_shared: "resume",
	job_application_created: "jobs",
	job_application_updated: "jobs",
	job_application_status_changed: "jobs",
	job_application_deleted: "jobs",
	interview_scheduled: "interview",
	interview_completed: "interview",
	interview_cancelled: "interview",
	interview_practice_started: "interview",
	interview_practice_completed: "interview",
	ai_content_generated: "ai",
	ai_resume_analyzed: "ai",
	ai_interview_chat: "ai",
	ai_cover_letter_generated: "ai",
	skill_added: "career",
	skill_updated: "career",
	skill_removed: "career",
	goal_created: "goals",
	goal_updated: "goals",
	goal_completed: "goals",
	goal_deleted: "goals",
	contact_added: "networking",
	contact_updated: "networking",
	contact_deleted: "networking",
	networking_event_attended: "networking",
	training_started: "training",
	training_completed: "training",
	certification_added: "training",
	deadline_created: "goals",
	deadline_completed: "goals",
	page_view: "general",
	feature_used: "general",
};

export type CreateActivityInput = {
	userId: string;
	type: UserActivityType;
	title: string;
	description?: string;
	entityId?: string;
	entityType?: string;
	metadata?: Record<string, unknown>;
};

export type ListActivityInput = {
	userId: string;
	limit?: number;
	offset?: number;
	type?: UserActivityType;
};

export const activityService = {
	// Create a new activity record
	create: async (input: CreateActivityInput): Promise<string> => {
		const id = generateId();
		const category = typeToCategoryMap[input.type] ?? "general";

		// Store title and description in metadata for backward compatibility
		const metadata = {
			...input.metadata,
			title: input.title,
			description: input.description,
		};

		await db.insert(schema.userActivity).values({
			id,
			userId: input.userId,
			activityType: input.type,
			category,
			resourceId: input.entityId,
			resourceType: input.entityType,
			metadata,
		});

		return id;
	},

	// List recent activities for a user
	list: async (input: ListActivityInput) => {
		const conditions = [eq(schema.userActivity.userId, input.userId)];

		if (input.type) {
			conditions.push(eq(schema.userActivity.activityType, input.type));
		}

		const activities = await db
			.select()
			.from(schema.userActivity)
			.where(conditions.length > 1 ? and(...conditions) : conditions[0])
			.orderBy(desc(schema.userActivity.createdAt))
			.limit(input.limit ?? 10)
			.offset(input.offset ?? 0);

		// Transform to backward-compatible format
		return activities.map((a) => ({
			id: a.id,
			userId: a.userId,
			type: a.activityType as UserActivityType,
			title: ((a.metadata as Record<string, unknown>)?.title as string) || a.activityType,
			description: ((a.metadata as Record<string, unknown>)?.description as string | null) || null,
			entityId: a.resourceId,
			entityType: a.resourceType,
			metadata: a.metadata,
			createdAt: a.createdAt,
		}));
	},

	// Delete an activity
	delete: async (input: { id: string; userId: string }): Promise<void> => {
		await db
			.delete(schema.userActivity)
			.where(and(eq(schema.userActivity.id, input.id), eq(schema.userActivity.userId, input.userId)));
	},

	// Delete all activities for a user (cleanup)
	deleteAll: async (input: { userId: string }): Promise<void> => {
		await db.delete(schema.userActivity).where(eq(schema.userActivity.userId, input.userId));
	},
};
