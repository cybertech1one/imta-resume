import z from "zod";
import { protectedProcedure } from "../context";
import { resumeHistoryService } from "../services/resume-history";

const versionChangeSchema = z.object({
	field: z.string(),
	oldValue: z.string(),
	newValue: z.string(),
	type: z.enum(["addition", "deletion", "modification"]),
});

export const resumeHistoryRouter = {
	// List all versions for the current user
	list: protectedProcedure
		.route({
			method: "GET",
			path: "/resume-history/list",
			tags: ["Resume History"],
			summary: "List resume version history",
			description: "List all resume versions for the authenticated user with optional filtering.",
		})
		.input(
			z
				.object({
					resumeId: z.string().optional(),
					search: z.string().optional(),
					dateFrom: z.string().optional(),
					dateTo: z.string().optional(),
				})
				.optional()
				.default({}),
		)
		.output(
			z.array(
				z.object({
					id: z.string().uuid(),
					versionNumber: z.number(),
					note: z.string(),
					resumeName: z.string(),
					resumeId: z.string(),
					size: z.number(),
					changes: z.array(versionChangeSchema),
					createdAt: z.coerce.date(),
				}),
			),
		)
		.handler(async ({ context, input }) => {
			return await resumeHistoryService.list({
				userId: context.user.id,
				resumeId: input.resumeId,
				search: input.search,
				dateFrom: input.dateFrom,
				dateTo: input.dateTo,
			});
		}),

	// Get a specific version by ID
	getById: protectedProcedure
		.route({
			method: "GET",
			path: "/resume-history/{id}",
			tags: ["Resume History"],
			summary: "Get resume version by ID",
			description: "Get a specific resume version including its full data.",
		})
		.input(z.object({ id: z.string().uuid() }))
		.handler(async ({ context, input }) => {
			return await resumeHistoryService.getById({
				id: input.id,
				userId: context.user.id,
			});
		}),

	// Update a version's note
	updateNote: protectedProcedure
		.route({
			method: "PUT",
			path: "/resume-history/{id}/note",
			tags: ["Resume History"],
			summary: "Update version note",
			description: "Update the note/description for a specific version.",
		})
		.input(
			z.object({
				id: z.string().uuid(),
				note: z.string(),
			}),
		)
		.output(z.void())
		.handler(async ({ context, input }) => {
			await resumeHistoryService.updateNote({
				id: input.id,
				userId: context.user.id,
				note: input.note,
			});
		}),

	// Restore a version
	restore: protectedProcedure
		.route({
			method: "POST",
			path: "/resume-history/{id}/restore",
			tags: ["Resume History"],
			summary: "Restore a version",
			description: "Restore a previous version, creating a new version with the old data.",
		})
		.input(z.object({ id: z.string().uuid() }))
		.output(z.string().describe("The ID of the newly created version"))
		.handler(async ({ context, input }) => {
			return await resumeHistoryService.restore({
				id: input.id,
				userId: context.user.id,
			});
		}),

	// Get storage statistics
	getStorageStats: protectedProcedure
		.route({
			method: "GET",
			path: "/resume-history/storage-stats",
			tags: ["Resume History"],
			summary: "Get storage statistics",
			description: "Get storage usage statistics for the authenticated user.",
		})
		.output(
			z.object({
				usedStorage: z.number(),
				totalStorage: z.number(),
			}),
		)
		.handler(async ({ context }) => {
			return await resumeHistoryService.getStorageStats({
				userId: context.user.id,
			});
		}),

	// Get version statistics
	getStats: protectedProcedure
		.route({
			method: "GET",
			path: "/resume-history/stats",
			tags: ["Resume History"],
			summary: "Get version statistics",
			description: "Get statistics about versions including count and total size.",
		})
		.input(
			z
				.object({
					resumeId: z.string().optional(),
				})
				.optional()
				.default({}),
		)
		.output(
			z.object({
				totalVersions: z.number(),
				totalSize: z.number(),
				lastModified: z.coerce.date().nullable(),
			}),
		)
		.handler(async ({ context, input }) => {
			return await resumeHistoryService.getStats({
				userId: context.user.id,
				resumeId: input.resumeId,
			});
		}),

	// Clean up old versions
	cleanupOldVersions: protectedProcedure
		.route({
			method: "POST",
			path: "/resume-history/cleanup",
			tags: ["Resume History"],
			summary: "Cleanup old versions",
			description: "Delete old versions, keeping only the most recent N versions.",
		})
		.input(
			z.object({
				resumeId: z.string(),
				keepCount: z.number().min(1).default(10),
			}),
		)
		.output(z.number().describe("Number of versions deleted"))
		.handler(async ({ context, input }) => {
			return await resumeHistoryService.cleanupOldVersions({
				userId: context.user.id,
				resumeId: input.resumeId,
				keepCount: input.keepCount,
			});
		}),
};
