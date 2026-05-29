import z from "zod";
import { adminProcedure, publicProcedure } from "../context";
import { certificationLibraryService } from "../services/certification-library";

// Certification library item schema
const certificationLibraryItemSchema = z.object({
	id: z.string(),
	name: z.string(),
	nameFr: z.string().nullable(),
	provider: z.string(),
	field: z.string(),
	level: z.string().nullable(),
	duration: z.string().nullable(),
	cost: z.string().nullable(),
	description: z.string().nullable(),
	descriptionFr: z.string().nullable(),
	skills: z.array(z.string()).nullable(),
	prerequisites: z.array(z.string()).nullable(),
	url: z.string().nullable(),
	isRecommended: z.boolean().nullable(),
	isActive: z.boolean(),
	sortOrder: z.number().nullable(),
	createdAt: z.coerce.date(),
	updatedAt: z.coerce.date(),
});

// List certifications from library
const list = publicProcedure
	.input(
		z.object({
			field: z.string().optional(),
			level: z.enum(["beginner", "intermediate", "advanced"]).optional(),
			isRecommended: z.boolean().optional(),
			activeOnly: z.boolean().optional().default(true),
			search: z.string().optional(),
		}),
	)
	.output(z.array(certificationLibraryItemSchema))
	.handler(async ({ input }) => {
		return certificationLibraryService.list(input);
	});

// Get certification by ID
const getById = publicProcedure
	.input(z.object({ id: z.string().uuid() }))
	.output(certificationLibraryItemSchema)
	.handler(async ({ input }) => {
		return certificationLibraryService.getById(input.id);
	});

// Get recommended certifications for a field
const getRecommendedForField = publicProcedure
	.input(z.object({ field: z.string() }))
	.output(z.array(certificationLibraryItemSchema))
	.handler(async ({ input }) => {
		return certificationLibraryService.getRecommendedForField(input.field);
	});

// Admin: Create certification
const create = adminProcedure
	.input(
		z.object({
			id: z.string().uuid(),
			name: z.string(),
			nameFr: z.string().optional(),
			provider: z.string(),
			field: z.string(),
			level: z.enum(["beginner", "intermediate", "advanced"]).optional(),
			duration: z.string().optional(),
			cost: z.string().optional(),
			description: z.string().optional(),
			descriptionFr: z.string().optional(),
			skills: z.array(z.string()).optional(),
			prerequisites: z.array(z.string()).optional(),
			url: z.string().optional(),
			isRecommended: z.boolean().optional(),
			isActive: z.boolean().optional(),
			sortOrder: z.number().optional(),
		}),
	)
	.output(certificationLibraryItemSchema)
	.handler(async ({ input }) => {
		return certificationLibraryService.create(input);
	});

// Admin: Update certification
const update = adminProcedure
	.input(
		z.object({
			id: z.string().uuid(),
			name: z.string().optional(),
			nameFr: z.string().optional(),
			provider: z.string().optional(),
			field: z.string().optional(),
			level: z.enum(["beginner", "intermediate", "advanced"]).optional(),
			duration: z.string().optional(),
			cost: z.string().optional(),
			description: z.string().optional(),
			descriptionFr: z.string().optional(),
			skills: z.array(z.string()).optional(),
			prerequisites: z.array(z.string()).optional(),
			url: z.string().optional(),
			isRecommended: z.boolean().optional(),
			isActive: z.boolean().optional(),
			sortOrder: z.number().optional(),
		}),
	)
	.output(certificationLibraryItemSchema)
	.handler(async ({ input }) => {
		return certificationLibraryService.update(input);
	});

// Admin: Delete certification
const deleteCertification = adminProcedure
	.input(z.object({ id: z.string().uuid() }))
	.output(z.object({ success: z.boolean() }))
	.handler(async ({ input }) => {
		await certificationLibraryService.delete(input.id);
		return { success: true };
	});

// Admin: Seed certifications with default data
const seed = adminProcedure
	.input(z.object({}))
	.output(z.object({ seeded: z.number(), skipped: z.number() }))
	.handler(async () => {
		return certificationLibraryService.seed();
	});

export const certificationLibraryRouter = {
	list,
	getById,
	getRecommendedForField,
	create,
	update,
	delete: deleteCertification,
	seed,
};
