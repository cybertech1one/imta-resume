import z from "zod";
import type {
	MentorStatus,
	MentorshipGoalStatus,
	MentorshipRequestStatus,
	MentorshipSessionStatus,
	MentorshipSessionType,
} from "../../drizzle/schema";
import { protectedProcedure } from "../context";
import { mentorsService } from "../services/mentors";

// Schemas
const mentorStatusSchema = z.enum(["available", "busy", "on_vacation"]);
const requestStatusSchema = z.enum(["pending", "accepted", "declined", "completed"]);
const sessionTypeSchema = z.enum(["video_call", "phone_call", "in_person", "chat"]);
const sessionStatusSchema = z.enum(["scheduled", "completed", "cancelled"]);
const goalStatusSchema = z.enum(["not_started", "in_progress", "completed"]);
const expertiseLevelSchema = z.enum(["beginner", "intermediate", "advanced", "expert"]);

const availabilitySlotSchema = z.object({
	day: z.enum(["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]),
	startTime: z.string(),
	endTime: z.string(),
});

const skillSchema = z.object({
	name: z.string(),
	level: expertiseLevelSchema,
});

const milestoneSchema = z.object({
	id: z.string().uuid(),
	title: z.string(),
	completed: z.boolean(),
	completedAt: z.string().optional(),
});

const mentorProfileSchema = z.object({
	id: z.string().uuid(),
	userId: z.string(),
	firstName: z.string(),
	lastName: z.string(),
	email: z.string(),
	avatar: z.string().nullable(),
	title: z.string(),
	company: z.string(),
	location: z.string(),
	bio: z.string(),
	expertise: z.array(z.string()).nullable(),
	skills: z.array(skillSchema).nullable(),
	yearsOfExperience: z.number(),
	industries: z.array(z.string()).nullable(),
	languages: z.array(z.string()).nullable(),
	status: mentorStatusSchema,
	rating: z.number(),
	totalReviews: z.number(),
	totalSessions: z.number(),
	totalMentees: z.number(),
	hourlyRate: z.number().nullable(),
	isFree: z.boolean(),
	linkedinUrl: z.string().nullable(),
	availability: z.array(availabilitySlotSchema).nullable(),
	careerPath: z.array(z.string()).nullable(),
	achievements: z.array(z.string()).nullable(),
	createdAt: z.coerce.date(),
	updatedAt: z.coerce.date(),
});

const reviewSchema = z.object({
	id: z.string().uuid(),
	mentorId: z.string(),
	menteeId: z.string(),
	menteeName: z.string(),
	menteeAvatar: z.string().nullable(),
	rating: z.number(),
	comment: z.string(),
	sessionId: z.string(),
	createdAt: z.coerce.date(),
});

const requestSchema = z.object({
	id: z.string().uuid(),
	userId: z.string(),
	mentorId: z.string(),
	mentorName: z.string(),
	menteeId: z.string(),
	menteeName: z.string(),
	message: z.string(),
	goals: z.array(z.string()).nullable(),
	status: requestStatusSchema,
	respondedAt: z.coerce.date().nullable(),
	createdAt: z.coerce.date(),
	updatedAt: z.coerce.date(),
});

const sessionSchema = z.object({
	id: z.string().uuid(),
	userId: z.string(),
	mentorId: z.string(),
	mentorName: z.string(),
	mentorAvatar: z.string().nullable(),
	menteeId: z.string(),
	menteeName: z.string(),
	type: sessionTypeSchema,
	scheduledAt: z.coerce.date(),
	duration: z.number(),
	topic: z.string(),
	notes: z.string(),
	status: sessionStatusSchema,
	rating: z.number().nullable(),
	feedback: z.string().nullable(),
	createdAt: z.coerce.date(),
	updatedAt: z.coerce.date(),
});

const goalSchema = z.object({
	id: z.string().uuid(),
	userId: z.string(),
	mentorshipId: z.string(),
	title: z.string(),
	description: z.string(),
	targetDate: z.string(),
	status: goalStatusSchema,
	progress: z.number(),
	milestones: z.array(milestoneSchema),
	createdAt: z.coerce.date(),
	updatedAt: z.coerce.date(),
});

const userGoalsSchema = z.object({
	targetRole: z.string(),
	skills: z.array(z.string()),
	industries: z.array(z.string()),
	timeline: z.string(),
});

export const mentorsRouter = {
	// ========================
	// MENTOR PROFILES
	// ========================

	listMentors: protectedProcedure
		.route({
			method: "GET",
			path: "/mentors",
			tags: ["Mentors"],
			summary: "List all mentors",
		})
		.input(
			z
				.object({
					search: z.string().optional(),
					expertise: z.string().optional(),
					industry: z.string().optional(),
					status: mentorStatusSchema.optional(),
					limit: z.number().optional(),
					offset: z.number().optional(),
				})
				.optional()
				.default({}),
		)
		.output(z.array(mentorProfileSchema))
		.handler(async ({ input }) => {
			return await mentorsService.listMentors({
				...input,
				status: input.status as MentorStatus | undefined,
			});
		}),

	getMentor: protectedProcedure
		.route({
			method: "GET",
			path: "/mentors/{id}",
			tags: ["Mentors"],
			summary: "Get mentor by ID",
		})
		.input(z.object({ id: z.string().uuid() }))
		.output(mentorProfileSchema.extend({ reviews: z.array(reviewSchema) }))
		.handler(async ({ input }) => {
			return await mentorsService.getMentorById(input.id);
		}),

	seedMentors: protectedProcedure
		.route({
			method: "POST",
			path: "/mentors/seed",
			tags: ["Mentors"],
			summary: "Seed initial mentor data",
		})
		.output(z.void())
		.handler(async ({ context }) => {
			await mentorsService.seedMentors(context.user.id);
		}),

	// ========================
	// MENTORSHIP REQUESTS
	// ========================

	createRequest: protectedProcedure
		.route({
			method: "POST",
			path: "/mentors/requests",
			tags: ["Mentors"],
			summary: "Create a mentorship request",
		})
		.input(
			z.object({
				mentorId: z.string(),
				mentorName: z.string(),
				message: z.string().min(1),
				goals: z.array(z.string()).optional(),
			}),
		)
		.output(z.string())
		.handler(async ({ context, input }) => {
			return await mentorsService.createRequest({
				userId: context.user.id,
				mentorId: input.mentorId,
				mentorName: input.mentorName,
				menteeId: context.user.id,
				menteeName: context.user.name,
				message: input.message,
				goals: input.goals,
			});
		}),

	listRequests: protectedProcedure
		.route({
			method: "GET",
			path: "/mentors/requests",
			tags: ["Mentors"],
			summary: "List mentorship requests",
		})
		.input(
			z
				.object({
					status: requestStatusSchema.optional(),
				})
				.optional()
				.default({}),
		)
		.output(z.array(requestSchema))
		.handler(async ({ context, input }) => {
			return await mentorsService.listRequests({
				userId: context.user.id,
				status: input.status as MentorshipRequestStatus | undefined,
			});
		}),

	updateRequestStatus: protectedProcedure
		.route({
			method: "PUT",
			path: "/mentors/requests/{id}/status",
			tags: ["Mentors"],
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
			await mentorsService.updateRequestStatus({
				id: input.id,
				userId: context.user.id,
				status: input.status as MentorshipRequestStatus,
			});
		}),

	deleteRequest: protectedProcedure
		.route({
			method: "DELETE",
			path: "/mentors/requests/{id}",
			tags: ["Mentors"],
			summary: "Delete a request",
		})
		.input(z.object({ id: z.string().uuid() }))
		.output(z.void())
		.handler(async ({ context, input }) => {
			await mentorsService.deleteRequest({
				id: input.id,
				userId: context.user.id,
			});
		}),

	// ========================
	// MENTORSHIP SESSIONS
	// ========================

	createSession: protectedProcedure
		.route({
			method: "POST",
			path: "/mentors/sessions",
			tags: ["Mentors"],
			summary: "Create a mentorship session",
		})
		.input(
			z.object({
				mentorId: z.string(),
				mentorName: z.string(),
				mentorAvatar: z.string().optional(),
				scheduledAt: z.coerce.date(),
				type: sessionTypeSchema.optional(),
				duration: z.number().optional(),
				topic: z.string().min(1),
			}),
		)
		.output(z.string())
		.handler(async ({ context, input }) => {
			return await mentorsService.createSession({
				userId: context.user.id,
				mentorId: input.mentorId,
				mentorName: input.mentorName,
				mentorAvatar: input.mentorAvatar,
				menteeId: context.user.id,
				menteeName: context.user.name,
				scheduledAt: input.scheduledAt,
				type: input.type as MentorshipSessionType | undefined,
				duration: input.duration,
				topic: input.topic,
			});
		}),

	listSessions: protectedProcedure
		.route({
			method: "GET",
			path: "/mentors/sessions",
			tags: ["Mentors"],
			summary: "List mentorship sessions",
		})
		.input(
			z
				.object({
					status: sessionStatusSchema.optional(),
				})
				.optional()
				.default({}),
		)
		.output(z.array(sessionSchema))
		.handler(async ({ context, input }) => {
			return await mentorsService.listSessions({
				userId: context.user.id,
				status: input.status as MentorshipSessionStatus | undefined,
			});
		}),

	updateSession: protectedProcedure
		.route({
			method: "PUT",
			path: "/mentors/sessions/{id}",
			tags: ["Mentors"],
			summary: "Update a session",
		})
		.input(
			z.object({
				id: z.string().uuid(),
				notes: z.string().optional(),
				status: sessionStatusSchema.optional(),
				rating: z.number().min(1).max(5).optional(),
				feedback: z.string().optional(),
			}),
		)
		.output(z.void())
		.handler(async ({ context, input }) => {
			await mentorsService.updateSession({
				id: input.id,
				userId: context.user.id,
				notes: input.notes,
				status: input.status as MentorshipSessionStatus | undefined,
				rating: input.rating,
				feedback: input.feedback,
			});
		}),

	deleteSession: protectedProcedure
		.route({
			method: "DELETE",
			path: "/mentors/sessions/{id}",
			tags: ["Mentors"],
			summary: "Delete a session",
		})
		.input(z.object({ id: z.string().uuid() }))
		.output(z.void())
		.handler(async ({ context, input }) => {
			await mentorsService.deleteSession({
				id: input.id,
				userId: context.user.id,
			});
		}),

	// ========================
	// MENTORSHIP GOALS
	// ========================

	createGoal: protectedProcedure
		.route({
			method: "POST",
			path: "/mentors/goals",
			tags: ["Mentors"],
			summary: "Create a mentorship goal",
		})
		.input(
			z.object({
				mentorshipId: z.string(),
				title: z.string().min(1),
				description: z.string().optional(),
				targetDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
			}),
		)
		.output(z.string())
		.handler(async ({ context, input }) => {
			return await mentorsService.createGoal({
				userId: context.user.id,
				mentorshipId: input.mentorshipId,
				title: input.title,
				description: input.description,
				targetDate: input.targetDate,
			});
		}),

	listGoals: protectedProcedure
		.route({
			method: "GET",
			path: "/mentors/goals",
			tags: ["Mentors"],
			summary: "List mentorship goals",
		})
		.input(
			z
				.object({
					mentorshipId: z.string().optional(),
				})
				.optional()
				.default({}),
		)
		.output(z.array(goalSchema))
		.handler(async ({ context, input }) => {
			return await mentorsService.listGoals({
				userId: context.user.id,
				mentorshipId: input.mentorshipId,
			});
		}),

	updateGoal: protectedProcedure
		.route({
			method: "PUT",
			path: "/mentors/goals/{id}",
			tags: ["Mentors"],
			summary: "Update a goal",
		})
		.input(
			z.object({
				id: z.string().uuid(),
				title: z.string().optional(),
				description: z.string().optional(),
				targetDate: z
					.string()
					.regex(/^\d{4}-\d{2}-\d{2}$/)
					.optional(),
				status: goalStatusSchema.optional(),
				progress: z.number().min(0).max(100).optional(),
				milestones: z.array(milestoneSchema).optional(),
			}),
		)
		.output(z.void())
		.handler(async ({ context, input }) => {
			await mentorsService.updateGoal({
				id: input.id,
				userId: context.user.id,
				title: input.title,
				description: input.description,
				targetDate: input.targetDate,
				status: input.status as MentorshipGoalStatus | undefined,
				progress: input.progress,
				milestones: input.milestones,
			});
		}),

	toggleMilestone: protectedProcedure
		.route({
			method: "POST",
			path: "/mentors/goals/{id}/milestones/{milestoneId}/toggle",
			tags: ["Mentors"],
			summary: "Toggle milestone completion",
		})
		.input(
			z.object({
				id: z.string().uuid(),
				milestoneId: z.string(),
			}),
		)
		.output(z.void())
		.handler(async ({ context, input }) => {
			await mentorsService.toggleMilestone({
				id: input.id,
				userId: context.user.id,
				milestoneId: input.milestoneId,
			});
		}),

	deleteGoal: protectedProcedure
		.route({
			method: "DELETE",
			path: "/mentors/goals/{id}",
			tags: ["Mentors"],
			summary: "Delete a goal",
		})
		.input(z.object({ id: z.string().uuid() }))
		.output(z.void())
		.handler(async ({ context, input }) => {
			await mentorsService.deleteGoal({
				id: input.id,
				userId: context.user.id,
			});
		}),

	// ========================
	// USER MENTORSHIP GOALS (for matching)
	// ========================

	getUserGoals: protectedProcedure
		.route({
			method: "GET",
			path: "/mentors/user-goals",
			tags: ["Mentors"],
			summary: "Get user mentorship goals/preferences",
		})
		.output(userGoalsSchema)
		.handler(async ({ context }) => {
			return await mentorsService.getUserGoals(context.user.id);
		}),

	updateUserGoals: protectedProcedure
		.route({
			method: "PUT",
			path: "/mentors/user-goals",
			tags: ["Mentors"],
			summary: "Update user mentorship goals/preferences",
		})
		.input(
			z.object({
				targetRole: z.string(),
				skills: z.array(z.string()),
				industries: z.array(z.string()),
				timeline: z.string(),
			}),
		)
		.output(z.void())
		.handler(async ({ context, input }) => {
			await mentorsService.updateUserGoals({
				userId: context.user.id,
				...input,
			});
		}),

	// ========================
	// REVIEWS
	// ========================

	createReview: protectedProcedure
		.route({
			method: "POST",
			path: "/mentors/{mentorId}/reviews",
			tags: ["Mentors"],
			summary: "Create a mentor review",
		})
		.input(
			z.object({
				mentorId: z.string(),
				rating: z.number().min(1).max(5),
				comment: z.string().min(1),
				sessionId: z.string(),
			}),
		)
		.output(z.string())
		.handler(async ({ context, input }) => {
			return await mentorsService.createReview({
				mentorId: input.mentorId,
				menteeId: context.user.id,
				menteeName: context.user.name,
				rating: input.rating,
				comment: input.comment,
				sessionId: input.sessionId,
			});
		}),

	listReviews: protectedProcedure
		.route({
			method: "GET",
			path: "/mentors/{mentorId}/reviews",
			tags: ["Mentors"],
			summary: "List reviews for a mentor",
		})
		.input(z.object({ mentorId: z.string() }))
		.output(z.array(reviewSchema))
		.handler(async ({ input }) => {
			return await mentorsService.listReviews(input.mentorId);
		}),

	// ========================
	// STATISTICS
	// ========================

	getStatistics: protectedProcedure
		.route({
			method: "GET",
			path: "/mentors/statistics",
			tags: ["Mentors"],
			summary: "Get mentorship statistics",
		})
		.output(
			z.object({
				totalMentors: z.number(),
				completedSessions: z.number(),
				upcomingSessions: z.number(),
				activeGoals: z.number(),
				pendingRequests: z.number(),
				hasActiveMentorship: z.boolean(),
				activeMentorId: z.string().nullable(),
			}),
		)
		.handler(async ({ context }) => {
			return await mentorsService.getStatistics(context.user.id);
		}),
};
