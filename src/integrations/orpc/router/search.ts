import z from "zod";
import { protectedProcedure } from "../context";
import { searchService } from "../services/search";

const searchResultTypeSchema = z.enum(["route", "resume", "job_application", "contact", "skill"]);

const searchResultSchema = z.object({
	id: z.string().uuid(),
	type: searchResultTypeSchema,
	title: z.string(),
	subtitle: z.string().optional(),
	path: z.string().optional(),
	icon: z.string().optional(),
	metadata: z.record(z.string(), z.unknown()).optional(),
});

export const searchRouter = {
	// Global search across all user data
	global: protectedProcedure
		.route({
			method: "GET",
			path: "/search/global",
			tags: ["Search"],
			summary: "Global search",
			description: "Search across all user data including resumes, job applications, contacts, and skills.",
		})
		.input(
			z.object({
				query: z.string().min(1).max(200),
				limit: z.number().min(1).max(50).optional().default(20),
			}),
		)
		.output(z.array(searchResultSchema))
		.handler(async ({ context, input }) => {
			return await searchService.globalSearch({
				userId: context.user.id,
				query: input.query,
				limit: input.limit,
			});
		}),

	// Get recent searches
	getRecent: protectedProcedure
		.route({
			method: "GET",
			path: "/search/recent",
			tags: ["Search"],
			summary: "Get recent searches",
			description: "Get the user's recent command palette searches.",
		})
		.input(
			z
				.object({
					limit: z.number().min(1).max(50).optional().default(10),
				})
				.optional()
				.default({ limit: 10 }),
		)
		.output(z.array(searchResultSchema))
		.handler(async ({ context, input }) => {
			return await searchService.getRecentSearches({
				userId: context.user.id,
				limit: input.limit,
			});
		}),

	// Save a recent search
	saveRecent: protectedProcedure
		.route({
			method: "POST",
			path: "/search/recent",
			tags: ["Search"],
			summary: "Save recent search",
			description: "Save a search to the user's recent searches history.",
		})
		.input(
			z.object({
				query: z.string(),
				resultType: searchResultTypeSchema,
				resultId: z.string().optional(),
				resultTitle: z.string(),
				resultPath: z.string().optional(),
			}),
		)
		.output(z.string())
		.handler(async ({ context, input }) => {
			return await searchService.saveRecentSearch({
				userId: context.user.id,
				query: input.query,
				resultType: input.resultType,
				resultId: input.resultId,
				resultTitle: input.resultTitle,
				resultPath: input.resultPath,
			});
		}),

	// Clear all recent searches
	clearRecent: protectedProcedure
		.route({
			method: "DELETE",
			path: "/search/recent",
			tags: ["Search"],
			summary: "Clear recent searches",
			description: "Clear all recent searches for the user.",
		})
		.output(z.void())
		.handler(async ({ context }) => {
			return await searchService.clearRecentSearches({
				userId: context.user.id,
			});
		}),

	// Delete a specific recent search
	deleteRecent: protectedProcedure
		.route({
			method: "DELETE",
			path: "/search/recent/{id}",
			tags: ["Search"],
			summary: "Delete recent search",
			description: "Delete a specific recent search entry.",
		})
		.input(z.object({ id: z.string().uuid() }))
		.output(z.void())
		.handler(async ({ context, input }) => {
			return await searchService.deleteRecentSearch({
				id: input.id,
				userId: context.user.id,
			});
		}),
};
