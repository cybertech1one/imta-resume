import { z } from "zod";
import { interviewChecklistService } from "@/integrations/orpc/services/interview-checklist";
import { adminProcedure, publicProcedure } from "../context";

// ============================================================================
// Schemas
// ============================================================================

const checklistCategorySchema = z.enum(["pre_interview", "day_of", "post_interview"]);

const checklistItemCreateSchema = z.object({
	id: z.string().min(1),
	category: checklistCategorySchema,
	title: z.string().min(1),
	titleFr: z.string().optional(),
	description: z.string().optional(),
	descriptionFr: z.string().optional(),
	tip: z.string().optional(),
	tipFr: z.string().optional(),
	link: z.string().optional(),
	linkLabel: z.string().optional(),
	icon: z.string().optional(),
	sortOrder: z.number().int().optional(),
	isActive: z.boolean().optional(),
});

const checklistItemUpdateSchema = checklistItemCreateSchema.partial().omit({ id: true });

// ============================================================================
// Interview Checklist Router
// ============================================================================

export const interviewChecklistRouter = {
	// List checklist items by category
	list: publicProcedure
		.input(
			z
				.object({
					category: checklistCategorySchema.optional(),
					activeOnly: z.boolean().optional(),
				})
				.optional(),
		)
		.handler(async ({ input }) => {
			return interviewChecklistService.list(input);
		}),

	// Get a single checklist item by ID
	getById: publicProcedure.input(z.object({ id: z.string().uuid() })).handler(async ({ input }) => {
		return interviewChecklistService.getById(input.id);
	}),

	// Get available categories
	getCategories: publicProcedure.handler(async () => {
		return interviewChecklistService.getCategories();
	}),

	// Create a new checklist item (admin only)
	create: adminProcedure.input(checklistItemCreateSchema).handler(async ({ input }) => {
		return interviewChecklistService.create(input);
	}),

	// Update a checklist item (admin only)
	update: adminProcedure
		.input(
			z.object({
				id: z.string().uuid(),
				data: checklistItemUpdateSchema,
			}),
		)
		.handler(async ({ input }) => {
			return interviewChecklistService.update(input.id, input.data);
		}),

	// Delete a checklist item (admin only)
	delete: adminProcedure.input(z.object({ id: z.string().uuid() })).handler(async ({ input }) => {
		await interviewChecklistService.delete(input.id);
		return { success: true };
	}),

	// Seed initial data (admin only)
	seed: adminProcedure.handler(async () => {
		return interviewChecklistService.seed();
	}),

	// Bulk seed checklist items (admin only)
	bulkSeed: adminProcedure.input(z.array(checklistItemCreateSchema)).handler(async ({ input }) => {
		return interviewChecklistService.bulkSeed(input);
	}),
};
