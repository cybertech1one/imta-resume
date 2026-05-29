import z from "zod";
import { adminProcedure, publicProcedure } from "../context";
import { brandingExampleService } from "../services/branding-example";

const brandingExampleSchema = z.object({
	id: z.string(),
	category: z.string(),
	value: z.string(),
	valueFr: z.string().nullable(),
	field: z.string().nullable(),
	isActive: z.boolean(),
	sortOrder: z.number().nullable(),
});

const categorySchema = z.enum(["profession", "audience", "strength", "value", "personality"]);

export const brandingExampleRouter = {
	// List examples by category (public - for wizard suggestions)
	list: publicProcedure
		.route({
			method: "GET",
			path: "/branding-examples",
			tags: ["Branding Examples"],
			summary: "Get branding examples by category",
		})
		.input(
			z.object({
				category: categorySchema,
				field: z.string().optional(),
			}),
		)
		.output(z.array(z.string()))
		.handler(async ({ input }) => {
			return await brandingExampleService.list(input.category, input.field);
		}),

	// List all examples (admin only)
	listAll: adminProcedure
		.route({
			method: "GET",
			path: "/branding-examples/all",
			tags: ["Branding Examples"],
			summary: "Get all branding examples (admin)",
		})
		.output(z.array(brandingExampleSchema))
		.handler(async () => {
			return await brandingExampleService.listAll();
		}),

	// Get single example (admin only)
	get: adminProcedure
		.route({
			method: "GET",
			path: "/branding-examples/{id}",
			tags: ["Branding Examples"],
			summary: "Get branding example by ID (admin)",
		})
		.input(z.object({ id: z.string().uuid() }))
		.output(brandingExampleSchema.nullable())
		.handler(async ({ input }) => {
			return await brandingExampleService.get(input.id);
		}),

	// Create example (admin only)
	create: adminProcedure
		.route({
			method: "POST",
			path: "/branding-examples",
			tags: ["Branding Examples"],
			summary: "Create branding example (admin)",
		})
		.input(
			z.object({
				id: z.string().uuid(),
				category: z.string(),
				value: z.string(),
				valueFr: z.string().optional(),
				field: z.string().optional(),
				isActive: z.boolean().optional(),
				sortOrder: z.number().optional(),
			}),
		)
		.output(brandingExampleSchema)
		.handler(async ({ input }) => {
			return await brandingExampleService.create(input);
		}),

	// Update example (admin only)
	update: adminProcedure
		.route({
			method: "PUT",
			path: "/branding-examples/{id}",
			tags: ["Branding Examples"],
			summary: "Update branding example (admin)",
		})
		.input(
			z.object({
				id: z.string().uuid(),
				value: z.string().optional(),
				valueFr: z.string().optional(),
				field: z.string().nullable().optional(),
				isActive: z.boolean().optional(),
				sortOrder: z.number().optional(),
			}),
		)
		.output(brandingExampleSchema.nullable())
		.handler(async ({ input }) => {
			const { id, ...data } = input;
			return await brandingExampleService.update(id, data);
		}),

	// Delete example (admin only)
	delete: adminProcedure
		.route({
			method: "DELETE",
			path: "/branding-examples/{id}",
			tags: ["Branding Examples"],
			summary: "Delete branding example (admin)",
		})
		.input(z.object({ id: z.string().uuid() }))
		.output(z.boolean())
		.handler(async ({ input }) => {
			return await brandingExampleService.delete(input.id);
		}),

	// Seed initial data (admin only)
	seed: adminProcedure
		.route({
			method: "POST",
			path: "/branding-examples/seed",
			tags: ["Branding Examples"],
			summary: "Seed branding examples (admin)",
		})
		.output(z.object({ count: z.number() }))
		.handler(async () => {
			const count = await brandingExampleService.seed();
			return { count };
		}),
};
