import z from "zod";
import { protectedProcedure } from "../context";
import { journalService, type MoodType } from "../services/journal";

const moodSchema = z.enum(["great", "good", "neutral", "frustrated", "stressed"]);

const journalEntrySchema = z.object({
	id: z.string().uuid(),
	userId: z.string(),
	date: z.string(),
	title: z.string().nullable(),
	content: z.string().nullable(),
	mood: z.string().nullable(),
	applicationsSubmitted: z.number().nullable(),
	interviewsCompleted: z.number().nullable(),
	networkingActivities: z.number().nullable(),
	wins: z.array(z.string()).nullable(),
	challenges: z.array(z.string()).nullable(),
	learnings: z.array(z.string()).nullable(),
	tomorrowGoals: z.array(z.string()).nullable(),
	tags: z.array(z.string()).nullable(),
	createdAt: z.coerce.date(),
	updatedAt: z.coerce.date(),
});

export const journalRouter = {
	create: protectedProcedure
		.route({
			method: "POST",
			path: "/journal",
			tags: ["Journal"],
			summary: "Create a new journal entry",
		})
		.input(
			z.object({
				date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
				title: z.string().optional(),
				content: z.string().optional(),
				mood: moodSchema.optional(),
				applicationsSubmitted: z.number().min(0).optional(),
				interviewsCompleted: z.number().min(0).optional(),
				networkingActivities: z.number().min(0).optional(),
				wins: z.array(z.string()).optional(),
				challenges: z.array(z.string()).optional(),
				learnings: z.array(z.string()).optional(),
				tomorrowGoals: z.array(z.string()).optional(),
				tags: z.array(z.string()).optional(),
			}),
		)
		.output(z.string())
		.handler(async ({ context, input }) => {
			return await journalService.create({
				...input,
				userId: context.user.id,
				mood: input.mood as MoodType | undefined,
			});
		}),

	getById: protectedProcedure
		.route({
			method: "GET",
			path: "/journal/{id}",
			tags: ["Journal"],
			summary: "Get journal entry by ID",
		})
		.input(z.object({ id: z.string().uuid() }))
		.output(journalEntrySchema)
		.handler(async ({ context, input }) => {
			return await journalService.getById({ id: input.id, userId: context.user.id });
		}),

	getByDate: protectedProcedure
		.route({
			method: "GET",
			path: "/journal/date/{date}",
			tags: ["Journal"],
			summary: "Get journal entry by date",
		})
		.input(z.object({ date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/) }))
		.output(journalEntrySchema.nullable())
		.handler(async ({ context, input }) => {
			return await journalService.getByDate({ date: input.date, userId: context.user.id });
		}),

	list: protectedProcedure
		.route({
			method: "GET",
			path: "/journal",
			tags: ["Journal"],
			summary: "List journal entries",
		})
		.input(
			z
				.object({
					startDate: z
						.string()
						.regex(/^\d{4}-\d{2}-\d{2}$/)
						.optional(),
					endDate: z
						.string()
						.regex(/^\d{4}-\d{2}-\d{2}$/)
						.optional(),
					mood: moodSchema.optional(),
					limit: z.number().optional(),
					offset: z.number().optional(),
				})
				.optional()
				.default({}),
		)
		.output(z.array(journalEntrySchema))
		.handler(async ({ context, input }) => {
			return await journalService.list({
				userId: context.user.id,
				...input,
				mood: input.mood as MoodType | undefined,
			});
		}),

	update: protectedProcedure
		.route({
			method: "PUT",
			path: "/journal/{id}",
			tags: ["Journal"],
			summary: "Update a journal entry",
		})
		.input(
			z.object({
				id: z.string().uuid(),
				title: z.string().optional(),
				content: z.string().optional(),
				mood: moodSchema.optional(),
				applicationsSubmitted: z.number().min(0).optional(),
				interviewsCompleted: z.number().min(0).optional(),
				networkingActivities: z.number().min(0).optional(),
				wins: z.array(z.string()).optional(),
				challenges: z.array(z.string()).optional(),
				learnings: z.array(z.string()).optional(),
				tomorrowGoals: z.array(z.string()).optional(),
				tags: z.array(z.string()).optional(),
			}),
		)
		.output(z.void())
		.handler(async ({ context, input }) => {
			return await journalService.update({
				...input,
				userId: context.user.id,
				mood: input.mood as MoodType | undefined,
			});
		}),

	upsert: protectedProcedure
		.route({
			method: "POST",
			path: "/journal/upsert",
			tags: ["Journal"],
			summary: "Create or update journal entry for a date",
		})
		.input(
			z.object({
				date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
				title: z.string().optional(),
				content: z.string().optional(),
				mood: moodSchema.optional(),
				applicationsSubmitted: z.number().min(0).optional(),
				interviewsCompleted: z.number().min(0).optional(),
				networkingActivities: z.number().min(0).optional(),
				wins: z.array(z.string()).optional(),
				challenges: z.array(z.string()).optional(),
				learnings: z.array(z.string()).optional(),
				tomorrowGoals: z.array(z.string()).optional(),
				tags: z.array(z.string()).optional(),
			}),
		)
		.output(z.string())
		.handler(async ({ context, input }) => {
			return await journalService.upsert({
				...input,
				userId: context.user.id,
				mood: input.mood as MoodType | undefined,
			});
		}),

	delete: protectedProcedure
		.route({
			method: "DELETE",
			path: "/journal/{id}",
			tags: ["Journal"],
			summary: "Delete a journal entry",
		})
		.input(z.object({ id: z.string().uuid() }))
		.output(z.void())
		.handler(async ({ context, input }) => {
			return await journalService.delete({ id: input.id, userId: context.user.id });
		}),

	getStatistics: protectedProcedure
		.route({
			method: "GET",
			path: "/journal/statistics",
			tags: ["Journal"],
			summary: "Get journal statistics",
		})
		.input(z.object({ days: z.number().optional() }).optional().default({}))
		.output(
			z.object({
				totalEntries: z.number(),
				totalApplications: z.number(),
				totalInterviews: z.number(),
				totalNetworking: z.number(),
				moodDistribution: z.record(z.string(), z.number()),
				streak: z.number(),
				activityByDay: z.array(
					z.object({
						date: z.string(),
						applications: z.number(),
						interviews: z.number(),
						networking: z.number(),
					}),
				),
				averageApplicationsPerDay: z.number(),
			}),
		)
		.handler(async ({ context, input }) => {
			return await journalService.getStatistics({ userId: context.user.id, days: input.days });
		}),
};
