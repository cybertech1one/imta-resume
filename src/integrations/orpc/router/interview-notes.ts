import z from "zod";
import { protectedProcedure } from "../context";
import { interviewNotesService } from "../services/interview-notes";

// Enum schemas
const interviewNoteTypeSchema = z.enum(["phone", "video", "in_person", "technical", "panel"]);
const interviewNoteStatusSchema = z.enum(["scheduled", "completed", "cancelled"]);
const interviewNoteImpressionSchema = z.enum(["positive", "neutral", "negative"]);
const followUpPrioritySchema = z.enum(["high", "medium", "low"]);

// Interviewer info schema
const interviewerInfoSchema = z.object({
	name: z.string(),
	title: z.string(),
	email: z.string().optional(),
	phone: z.string().optional(),
	linkedIn: z.string().optional(),
	notes: z.string().optional(),
});

// Key point schema
const keyPointSchema = z.object({
	id: z.string().uuid(),
	text: z.string(),
	checked: z.boolean(),
});

// Follow-up action schema
const followUpActionSchema = z.object({
	id: z.string().uuid(),
	text: z.string(),
	dueDate: z.string().optional(),
	completed: z.boolean(),
	priority: followUpPrioritySchema,
});

// Question response schema
const questionResponseSchema = z.object({
	id: z.string().uuid(),
	timestamp: z.string(),
	question: z.string(),
	response: z.string(),
	rating: z.number().optional(),
	notes: z.string().optional(),
});

// Full interview note schema
const interviewNoteSchema = z.object({
	id: z.string().uuid(),
	userId: z.string(),
	applicationId: z.string().nullable(),
	title: z.string(),
	company: z.string(),
	position: z.string(),
	date: z.string(),
	startTime: z.string(),
	endTime: z.string().nullable(),
	location: z.string().nullable(),
	type: interviewNoteTypeSchema,
	status: interviewNoteStatusSchema,
	interviewers: z.array(interviewerInfoSchema),
	keyPoints: z.array(keyPointSchema),
	followUpActions: z.array(followUpActionSchema),
	questionResponses: z.array(questionResponseSchema),
	generalNotes: z.string(),
	tags: z.array(z.string()),
	overallImpression: interviewNoteImpressionSchema.nullable(),
	nextSteps: z.string().nullable(),
	createdAt: z.coerce.date(),
	updatedAt: z.coerce.date(),
});

export const interviewNotesRouter = {
	// Create a new interview note
	create: protectedProcedure
		.route({
			method: "POST",
			path: "/interview-notes",
			tags: ["Interview Notes"],
			summary: "Create a new interview note",
		})
		.input(
			z.object({
				applicationId: z.string().optional(),
				title: z.string().min(1).max(255),
				company: z.string().min(1).max(255),
				position: z.string().min(1).max(255),
				date: z.string(),
				startTime: z.string(),
				endTime: z.string().optional(),
				location: z.string().optional(),
				type: interviewNoteTypeSchema,
				tags: z.array(z.string()).optional(),
			}),
		)
		.output(z.string())
		.handler(async ({ context, input }) => {
			return await interviewNotesService.create({
				...input,
				userId: context.user.id,
			});
		}),

	// Get interview note by ID
	getById: protectedProcedure
		.route({
			method: "GET",
			path: "/interview-notes/{id}",
			tags: ["Interview Notes"],
			summary: "Get interview note by ID",
		})
		.input(z.object({ id: z.string().uuid() }))
		.output(interviewNoteSchema)
		.handler(async ({ context, input }) => {
			return await interviewNotesService.getById({
				id: input.id,
				userId: context.user.id,
			});
		}),

	// List interview notes
	list: protectedProcedure
		.route({
			method: "GET",
			path: "/interview-notes",
			tags: ["Interview Notes"],
			summary: "List interview notes",
		})
		.input(
			z
				.object({
					status: interviewNoteStatusSchema.optional(),
					type: interviewNoteTypeSchema.optional(),
					company: z.string().optional(),
					search: z.string().optional(),
					dateFilter: z.string().optional(),
					limit: z.number().optional(),
					offset: z.number().optional(),
				})
				.optional()
				.default({}),
		)
		.output(z.array(interviewNoteSchema))
		.handler(async ({ context, input }) => {
			return await interviewNotesService.list({
				...input,
				userId: context.user.id,
			});
		}),

	// Update interview note
	update: protectedProcedure
		.route({
			method: "PUT",
			path: "/interview-notes/{id}",
			tags: ["Interview Notes"],
			summary: "Update interview note",
		})
		.input(
			z.object({
				id: z.string().uuid(),
				title: z.string().min(1).max(255).optional(),
				company: z.string().min(1).max(255).optional(),
				position: z.string().min(1).max(255).optional(),
				date: z.string().optional(),
				startTime: z.string().optional(),
				endTime: z.string().optional(),
				location: z.string().optional(),
				type: interviewNoteTypeSchema.optional(),
				status: interviewNoteStatusSchema.optional(),
				interviewers: z.array(interviewerInfoSchema).optional(),
				keyPoints: z.array(keyPointSchema).optional(),
				followUpActions: z.array(followUpActionSchema).optional(),
				questionResponses: z.array(questionResponseSchema).optional(),
				generalNotes: z.string().optional(),
				tags: z.array(z.string()).optional(),
				overallImpression: interviewNoteImpressionSchema.nullable().optional(),
				nextSteps: z.string().nullable().optional(),
			}),
		)
		.output(z.void())
		.handler(async ({ context, input }) => {
			return await interviewNotesService.update({
				...input,
				userId: context.user.id,
			});
		}),

	// Delete interview note
	delete: protectedProcedure
		.route({
			method: "DELETE",
			path: "/interview-notes/{id}",
			tags: ["Interview Notes"],
			summary: "Delete interview note",
		})
		.input(z.object({ id: z.string().uuid() }))
		.output(z.void())
		.handler(async ({ context, input }) => {
			return await interviewNotesService.delete({
				id: input.id,
				userId: context.user.id,
			});
		}),

	// Toggle key point
	toggleKeyPoint: protectedProcedure
		.route({
			method: "POST",
			path: "/interview-notes/{noteId}/key-points/{keyPointId}/toggle",
			tags: ["Interview Notes"],
			summary: "Toggle key point checked status",
		})
		.input(z.object({ noteId: z.string(), keyPointId: z.string() }))
		.output(z.array(keyPointSchema))
		.handler(async ({ context, input }) => {
			return await interviewNotesService.toggleKeyPoint({
				...input,
				userId: context.user.id,
			});
		}),

	// Toggle follow-up action
	toggleFollowUpAction: protectedProcedure
		.route({
			method: "POST",
			path: "/interview-notes/{noteId}/follow-up-actions/{actionId}/toggle",
			tags: ["Interview Notes"],
			summary: "Toggle follow-up action completed status",
		})
		.input(z.object({ noteId: z.string(), actionId: z.string() }))
		.output(z.array(followUpActionSchema))
		.handler(async ({ context, input }) => {
			return await interviewNotesService.toggleFollowUpAction({
				...input,
				userId: context.user.id,
			});
		}),

	// Add key point
	addKeyPoint: protectedProcedure
		.route({
			method: "POST",
			path: "/interview-notes/{noteId}/key-points",
			tags: ["Interview Notes"],
			summary: "Add a key point",
		})
		.input(z.object({ noteId: z.string(), text: z.string().min(1) }))
		.output(z.array(keyPointSchema))
		.handler(async ({ context, input }) => {
			return await interviewNotesService.addKeyPoint({
				...input,
				userId: context.user.id,
			});
		}),

	// Add follow-up action
	addFollowUpAction: protectedProcedure
		.route({
			method: "POST",
			path: "/interview-notes/{noteId}/follow-up-actions",
			tags: ["Interview Notes"],
			summary: "Add a follow-up action",
		})
		.input(
			z.object({
				noteId: z.string(),
				text: z.string().min(1),
				dueDate: z.string().optional(),
				priority: followUpPrioritySchema,
			}),
		)
		.output(z.array(followUpActionSchema))
		.handler(async ({ context, input }) => {
			return await interviewNotesService.addFollowUpAction({
				...input,
				userId: context.user.id,
			});
		}),

	// Add interviewer
	addInterviewer: protectedProcedure
		.route({
			method: "POST",
			path: "/interview-notes/{noteId}/interviewers",
			tags: ["Interview Notes"],
			summary: "Add an interviewer",
		})
		.input(
			z.object({
				noteId: z.string(),
				interviewer: interviewerInfoSchema,
			}),
		)
		.output(z.array(interviewerInfoSchema))
		.handler(async ({ context, input }) => {
			return await interviewNotesService.addInterviewer({
				...input,
				userId: context.user.id,
			});
		}),

	// Add question response
	addQuestionResponse: protectedProcedure
		.route({
			method: "POST",
			path: "/interview-notes/{noteId}/question-responses",
			tags: ["Interview Notes"],
			summary: "Add a question response",
		})
		.input(
			z.object({
				noteId: z.string(),
				question: z.string().min(1),
				response: z.string().min(1),
				timestamp: z.string(),
				rating: z.number().min(1).max(5).optional(),
				notes: z.string().optional(),
			}),
		)
		.output(z.array(questionResponseSchema))
		.handler(async ({ context, input }) => {
			return await interviewNotesService.addQuestionResponse({
				...input,
				userId: context.user.id,
			});
		}),

	// Get companies for filtering
	getCompanies: protectedProcedure
		.route({
			method: "GET",
			path: "/interview-notes/companies",
			tags: ["Interview Notes"],
			summary: "Get unique companies for filtering",
		})
		.output(z.array(z.string()))
		.handler(async ({ context }) => {
			return await interviewNotesService.getCompanies({
				userId: context.user.id,
			});
		}),

	// Get statistics
	getStatistics: protectedProcedure
		.route({
			method: "GET",
			path: "/interview-notes/statistics",
			tags: ["Interview Notes"],
			summary: "Get interview notes statistics",
		})
		.output(
			z.object({
				total: z.number(),
				completed: z.number(),
				scheduled: z.number(),
				pendingActions: z.number(),
			}),
		)
		.handler(async ({ context }) => {
			return await interviewNotesService.getStatistics({
				userId: context.user.id,
			});
		}),
};
