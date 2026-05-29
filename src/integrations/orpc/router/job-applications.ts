import z from "zod";
import { protectedProcedure } from "../context";
import { type ApplicationStatus, jobApplicationService } from "../services/job-applications";

const applicationStatusSchema = z.enum([
	"saved",
	"applied",
	"phone_screen",
	"interview",
	"offer",
	"rejected",
	"withdrawn",
	"accepted",
]);

const applicationSchema = z.object({
	id: z.string().uuid(),
	userId: z.string(),
	resumeId: z.string().nullable(),
	companyName: z.string(),
	position: z.string(),
	location: z.string().nullable(),
	jobUrl: z.string().nullable(),
	jobDescription: z.string().nullable(),
	salary: z.string().nullable(),
	salaryMin: z.number().nullable(),
	salaryMax: z.number().nullable(),
	salaryCurrency: z.string().nullable(),
	status: applicationStatusSchema,
	appliedAt: z.coerce.date().nullable(),
	deadline: z.coerce.date().nullable(),
	source: z.string().nullable(),
	contactName: z.string().nullable(),
	contactEmail: z.string().nullable(),
	contactPhone: z.string().nullable(),
	notes: z.string().nullable(),
	tags: z.array(z.string()),
	priority: z.number(),
	isRemote: z.boolean().nullable(),
	workType: z.string().nullable(),
	createdAt: z.coerce.date(),
	updatedAt: z.coerce.date(),
});

const activityRouter = {
	add: protectedProcedure
		.route({
			method: "POST",
			path: "/job-applications/{applicationId}/activities",
			tags: ["Job Applications"],
			summary: "Add activity to application",
		})
		.input(
			z.object({
				applicationId: z.string(),
				activityType: z.string(),
				description: z.string().optional(),
				scheduledAt: z.coerce.date().optional(),
				metadata: z.record(z.string(), z.unknown()).optional(),
			}),
		)
		.output(z.string())
		.handler(async ({ context, input }) => {
			// Verify application belongs to current user
			await jobApplicationService.getById({ id: input.applicationId, userId: context.user.id });
			return await jobApplicationService.activity.add(input);
		}),

	list: protectedProcedure
		.route({
			method: "GET",
			path: "/job-applications/{applicationId}/activities",
			tags: ["Job Applications"],
			summary: "List activities for application",
		})
		.input(z.object({ applicationId: z.string(), limit: z.number().optional() }))
		.handler(async ({ context, input }) => {
			// Verify application belongs to current user
			await jobApplicationService.getById({ id: input.applicationId, userId: context.user.id });
			return await jobApplicationService.activity.list(input);
		}),
};

export const jobApplicationsRouter = {
	activity: activityRouter,

	create: protectedProcedure
		.route({
			method: "POST",
			path: "/job-applications",
			tags: ["Job Applications"],
			summary: "Create a new job application",
		})
		.input(
			z.object({
				companyName: z.string().min(1).max(255),
				position: z.string().min(1).max(255),
				location: z.string().optional(),
				jobUrl: z.string().url().optional().or(z.literal("")),
				jobDescription: z.string().optional(),
				salary: z.string().optional(),
				salaryMin: z.number().optional(),
				salaryMax: z.number().optional(),
				salaryCurrency: z.string().optional(),
				status: applicationStatusSchema.optional(),
				appliedAt: z.coerce.date().optional(),
				deadline: z.coerce.date().optional(),
				source: z.string().optional(),
				contactName: z.string().optional(),
				contactEmail: z.string().email().optional().or(z.literal("")),
				contactPhone: z.string().optional(),
				notes: z.string().optional(),
				tags: z.array(z.string()).optional(),
				priority: z.number().min(0).max(5).optional(),
				isRemote: z.boolean().optional(),
				workType: z.string().optional(),
				resumeId: z.string().optional(),
			}),
		)
		.output(z.string())
		.handler(async ({ context, input }) => {
			return await jobApplicationService.create({
				...input,
				userId: context.user.id,
				jobUrl: input.jobUrl || undefined,
				contactEmail: input.contactEmail || undefined,
			});
		}),

	getById: protectedProcedure
		.route({
			method: "GET",
			path: "/job-applications/{id}",
			tags: ["Job Applications"],
			summary: "Get application by ID",
		})
		.input(z.object({ id: z.string().uuid() }))
		.output(applicationSchema)
		.handler(async ({ context, input }) => {
			return await jobApplicationService.getById({ id: input.id, userId: context.user.id });
		}),

	list: protectedProcedure
		.route({
			method: "GET",
			path: "/job-applications",
			tags: ["Job Applications"],
			summary: "List all job applications",
		})
		.input(
			z
				.object({
					status: applicationStatusSchema.optional(),
					search: z.string().optional(),
					tags: z.array(z.string()).optional(),
					sort: z.enum(["createdAt", "updatedAt", "companyName", "appliedAt", "deadline"]).optional(),
					sortOrder: z.enum(["asc", "desc"]).optional(),
					limit: z.number().optional(),
					offset: z.number().optional(),
				})
				.optional()
				.default({}),
		)
		.output(z.array(applicationSchema))
		.handler(async ({ context, input }) => {
			return await jobApplicationService.list({
				userId: context.user.id,
				...input,
			});
		}),

	update: protectedProcedure
		.route({
			method: "PUT",
			path: "/job-applications/{id}",
			tags: ["Job Applications"],
			summary: "Update an application",
		})
		.input(
			z.object({
				id: z.string().uuid(),
				companyName: z.string().min(1).max(255).optional(),
				position: z.string().min(1).max(255).optional(),
				location: z.string().optional(),
				jobUrl: z.string().url().optional().or(z.literal("")),
				jobDescription: z.string().optional(),
				salary: z.string().optional(),
				salaryMin: z.number().optional(),
				salaryMax: z.number().optional(),
				salaryCurrency: z.string().optional(),
				status: applicationStatusSchema.optional(),
				appliedAt: z.coerce.date().optional(),
				deadline: z.coerce.date().optional(),
				source: z.string().optional(),
				contactName: z.string().optional(),
				contactEmail: z.string().email().optional().or(z.literal("")),
				contactPhone: z.string().optional(),
				notes: z.string().optional(),
				tags: z.array(z.string()).optional(),
				priority: z.number().min(0).max(5).optional(),
				isRemote: z.boolean().optional(),
				workType: z.string().optional(),
				resumeId: z.string().optional(),
			}),
		)
		.output(z.void())
		.handler(async ({ context, input }) => {
			return await jobApplicationService.update({
				...input,
				userId: context.user.id,
				jobUrl: input.jobUrl || undefined,
				contactEmail: input.contactEmail || undefined,
			});
		}),

	updateStatus: protectedProcedure
		.route({
			method: "POST",
			path: "/job-applications/{id}/status",
			tags: ["Job Applications"],
			summary: "Update application status",
		})
		.input(
			z.object({
				id: z.string().uuid(),
				status: applicationStatusSchema,
			}),
		)
		.output(z.void())
		.handler(async ({ context, input }) => {
			return await jobApplicationService.updateStatus({
				id: input.id,
				userId: context.user.id,
				status: input.status as ApplicationStatus,
			});
		}),

	delete: protectedProcedure
		.route({
			method: "DELETE",
			path: "/job-applications/{id}",
			tags: ["Job Applications"],
			summary: "Delete an application",
		})
		.input(z.object({ id: z.string().uuid() }))
		.output(z.void())
		.handler(async ({ context, input }) => {
			return await jobApplicationService.delete({ id: input.id, userId: context.user.id });
		}),

	getStatistics: protectedProcedure
		.route({
			method: "GET",
			path: "/job-applications/statistics",
			tags: ["Job Applications"],
			summary: "Get application statistics",
		})
		.output(
			z.object({
				total: z.number(),
				byStatus: z.record(z.string(), z.number()),
				thisWeek: z.number(),
				responseRate: z.number(),
			}),
		)
		.handler(async ({ context }) => {
			return await jobApplicationService.getStatistics({ userId: context.user.id });
		}),
};
