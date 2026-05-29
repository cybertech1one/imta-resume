import z from "zod";
import { protectedProcedure } from "../context";
import { salaryHistoryService } from "../services/salary-history";

const salaryRecordSchema = z.object({
	id: z.string().uuid(),
	userId: z.string(),
	companyName: z.string(),
	position: z.string(),
	baseSalary: z.number(),
	currency: z.string(),
	bonus: z.number().nullable(),
	commission: z.number().nullable(),
	otherCompensation: z.number().nullable(),
	totalCompensation: z.number(),
	payFrequency: z.string(),
	startDate: z.coerce.date(),
	endDate: z.coerce.date().nullable(),
	isCurrent: z.boolean(),
	notes: z.string().nullable(),
	benefits: z.array(z.string()).nullable(),
	location: z.string().nullable(),
	industry: z.string().nullable(),
	createdAt: z.coerce.date(),
	updatedAt: z.coerce.date(),
});

export const salaryHistoryRouter = {
	create: protectedProcedure
		.route({
			method: "POST",
			path: "/salary-history",
			tags: ["Salary History"],
			summary: "Create a new salary record",
		})
		.input(
			z.object({
				companyName: z.string().min(1).max(255),
				position: z.string().min(1).max(255),
				baseSalary: z.number().min(0),
				currency: z.string().default("MAD"),
				bonus: z.number().optional(),
				commission: z.number().optional(),
				otherCompensation: z.number().optional(),
				payFrequency: z.enum(["monthly", "yearly", "hourly"]).default("monthly"),
				startDate: z.coerce.date(),
				endDate: z.coerce.date().optional(),
				isCurrent: z.boolean().default(false),
				notes: z.string().optional(),
				benefits: z.array(z.string()).optional(),
				location: z.string().optional(),
				industry: z.string().optional(),
			}),
		)
		.output(z.string())
		.handler(async ({ context, input }) => {
			return await salaryHistoryService.create({
				...input,
				userId: context.user.id,
			});
		}),

	getById: protectedProcedure
		.route({
			method: "GET",
			path: "/salary-history/{id}",
			tags: ["Salary History"],
			summary: "Get salary record by ID",
		})
		.input(z.object({ id: z.string().uuid() }))
		.output(salaryRecordSchema)
		.handler(async ({ context, input }) => {
			return await salaryHistoryService.getById({ id: input.id, userId: context.user.id });
		}),

	list: protectedProcedure
		.route({
			method: "GET",
			path: "/salary-history",
			tags: ["Salary History"],
			summary: "List all salary records",
		})
		.output(z.array(salaryRecordSchema))
		.handler(async ({ context }) => {
			return await salaryHistoryService.list({ userId: context.user.id });
		}),

	update: protectedProcedure
		.route({
			method: "PUT",
			path: "/salary-history/{id}",
			tags: ["Salary History"],
			summary: "Update a salary record",
		})
		.input(
			z.object({
				id: z.string().uuid(),
				companyName: z.string().min(1).max(255).optional(),
				position: z.string().min(1).max(255).optional(),
				baseSalary: z.number().min(0).optional(),
				currency: z.string().optional(),
				bonus: z.number().optional(),
				commission: z.number().optional(),
				otherCompensation: z.number().optional(),
				payFrequency: z.enum(["monthly", "yearly", "hourly"]).optional(),
				startDate: z.coerce.date().optional(),
				endDate: z.coerce.date().optional(),
				isCurrent: z.boolean().optional(),
				notes: z.string().optional(),
				benefits: z.array(z.string()).optional(),
				location: z.string().optional(),
				industry: z.string().optional(),
			}),
		)
		.output(z.void())
		.handler(async ({ context, input }) => {
			return await salaryHistoryService.update({
				...input,
				userId: context.user.id,
			});
		}),

	delete: protectedProcedure
		.route({
			method: "DELETE",
			path: "/salary-history/{id}",
			tags: ["Salary History"],
			summary: "Delete a salary record",
		})
		.input(z.object({ id: z.string().uuid() }))
		.output(z.void())
		.handler(async ({ context, input }) => {
			return await salaryHistoryService.delete({ id: input.id, userId: context.user.id });
		}),

	getStatistics: protectedProcedure
		.route({
			method: "GET",
			path: "/salary-history/statistics",
			tags: ["Salary History"],
			summary: "Get salary statistics and analytics",
		})
		.output(
			z.object({
				currentSalary: z
					.object({
						company: z.string(),
						position: z.string(),
						baseSalary: z.number(),
						totalCompensation: z.number(),
						currency: z.string(),
					})
					.nullable(),
				totalRecords: z.number(),
				averageSalary: z.number(),
				highestSalary: z.number(),
				lowestSalary: z.number(),
				salaryGrowth: z.number(),
				salaryGrowthPercentage: z.number(),
				timeline: z.array(
					z.object({
						date: z.string(),
						company: z.string(),
						position: z.string(),
						salary: z.number(),
						currency: z.string(),
					}),
				),
			}),
		)
		.handler(async ({ context }) => {
			return await salaryHistoryService.getStatistics({ userId: context.user.id });
		}),
};
