import { ORPCError } from "@orpc/client";
import { and, desc, eq, gte, lte, or, sql } from "drizzle-orm";
import { schema } from "@/integrations/drizzle";
import { db } from "@/integrations/drizzle/client";
import type { VersionChange } from "@/integrations/drizzle/schema";
import type { ResumeData } from "@/schema/resume/data";
import { generateId } from "@/utils/string";

// Helper to calculate data size in bytes
function calculateDataSize(data: ResumeData): number {
	return new TextEncoder().encode(JSON.stringify(data)).length;
}

// Helper to detect changes between two resume versions
function detectChanges(oldData: ResumeData | null, newData: ResumeData): VersionChange[] {
	const changes: VersionChange[] = [];

	if (!oldData) {
		changes.push({
			field: "all",
			oldValue: "",
			newValue: "Creation du CV",
			type: "addition",
		});
		return changes;
	}

	// Compare basics
	if (oldData.basics.name !== newData.basics.name) {
		changes.push({
			field: "basics.name",
			oldValue: oldData.basics.name,
			newValue: newData.basics.name,
			type: "modification",
		});
	}

	if (oldData.basics.email !== newData.basics.email) {
		changes.push({
			field: "basics.email",
			oldValue: oldData.basics.email,
			newValue: newData.basics.email,
			type: "modification",
		});
	}

	if (oldData.basics.phone !== newData.basics.phone) {
		changes.push({
			field: "basics.phone",
			oldValue: oldData.basics.phone,
			newValue: newData.basics.phone,
			type: "modification",
		});
	}

	if (oldData.basics.headline !== newData.basics.headline) {
		changes.push({
			field: "basics.headline",
			oldValue: oldData.basics.headline,
			newValue: newData.basics.headline,
			type: "modification",
		});
	}

	// Compare summary
	if (oldData.summary.content !== newData.summary.content) {
		const oldContent = oldData.summary.content || "";
		const newContent = newData.summary.content || "";
		if (oldContent && !newContent) {
			changes.push({
				field: "summary",
				oldValue: oldContent.substring(0, 100),
				newValue: "",
				type: "deletion",
			});
		} else if (!oldContent && newContent) {
			changes.push({
				field: "summary",
				oldValue: "",
				newValue: newContent.substring(0, 100),
				type: "addition",
			});
		} else {
			changes.push({
				field: "summary",
				oldValue: oldContent.substring(0, 100),
				newValue: newContent.substring(0, 100),
				type: "modification",
			});
		}
	}

	// Compare sections
	const sectionKeys = [
		"experience",
		"education",
		"skills",
		"projects",
		"certifications",
		"publications",
		"languages",
		"interests",
		"awards",
		"references",
		"profiles",
		"volunteer",
	] as const;

	for (const key of sectionKeys) {
		const oldSection = oldData.sections[key];
		const newSection = newData.sections[key];

		if (oldSection && newSection) {
			const oldItems = oldSection.items || [];
			const newItems = newSection.items || [];

			if (oldItems.length !== newItems.length) {
				if (newItems.length > oldItems.length) {
					changes.push({
						field: key,
						oldValue: `${oldItems.length} elements`,
						newValue: `${newItems.length} elements`,
						type: "addition",
					});
				} else {
					changes.push({
						field: key,
						oldValue: `${oldItems.length} elements`,
						newValue: `${newItems.length} elements`,
						type: "deletion",
					});
				}
			}
		}
	}

	return changes;
}

export const resumeHistoryService = {
	// List all versions for a user (optionally filtered by resumeId)
	list: async (input: { userId: string; resumeId?: string; search?: string; dateFrom?: string; dateTo?: string }) => {
		const conditions = [eq(schema.resumeVersion.userId, input.userId)];

		if (input.resumeId) {
			conditions.push(eq(schema.resumeVersion.resumeId, input.resumeId));
		}

		if (input.dateFrom) {
			conditions.push(gte(schema.resumeVersion.createdAt, new Date(input.dateFrom)));
		}

		if (input.dateTo) {
			conditions.push(lte(schema.resumeVersion.createdAt, new Date(`${input.dateTo}T23:59:59`)));
		}

		const versions = await db
			.select({
				id: schema.resumeVersion.id,
				versionNumber: schema.resumeVersion.versionNumber,
				note: schema.resumeVersion.note,
				resumeName: schema.resumeVersion.resumeName,
				resumeId: schema.resumeVersion.resumeId,
				size: schema.resumeVersion.size,
				changes: schema.resumeVersion.changes,
				createdAt: schema.resumeVersion.createdAt,
			})
			.from(schema.resumeVersion)
			.where(and(...conditions))
			.orderBy(desc(schema.resumeVersion.createdAt));

		// Filter by search if provided
		if (input.search) {
			const searchLower = input.search.toLowerCase();
			return versions.filter(
				(v) =>
					v.note.toLowerCase().includes(searchLower) ||
					v.resumeName.toLowerCase().includes(searchLower) ||
					v.changes.some(
						(c) =>
							c.field.toLowerCase().includes(searchLower) ||
							c.oldValue.toLowerCase().includes(searchLower) ||
							c.newValue.toLowerCase().includes(searchLower),
					),
			);
		}

		return versions;
	},

	// Get a single version by ID
	getById: async (input: { id: string; userId: string }) => {
		const [version] = await db
			.select()
			.from(schema.resumeVersion)
			.where(and(eq(schema.resumeVersion.id, input.id), eq(schema.resumeVersion.userId, input.userId)));

		if (!version) {
			throw new ORPCError("NOT_FOUND");
		}

		return version;
	},

	// Create a new version (called when resume is updated)
	create: async (input: {
		userId: string;
		resumeId: string;
		resumeName: string;
		data: ResumeData;
		note?: string;
		previousData?: ResumeData | null;
	}) => {
		const id = generateId();

		// Get the highest version number for this resume
		const [latestVersion] = await db
			.select({ versionNumber: schema.resumeVersion.versionNumber })
			.from(schema.resumeVersion)
			.where(eq(schema.resumeVersion.resumeId, input.resumeId))
			.orderBy(desc(schema.resumeVersion.versionNumber))
			.limit(1);

		const versionNumber = (latestVersion?.versionNumber ?? 0) + 1;
		const size = calculateDataSize(input.data);
		const changes = detectChanges(input.previousData ?? null, input.data);

		await db.insert(schema.resumeVersion).values({
			id,
			userId: input.userId,
			resumeId: input.resumeId,
			versionNumber,
			note: input.note ?? "",
			resumeName: input.resumeName,
			size,
			changes,
			data: input.data,
		});

		// Update storage stats
		await db
			.insert(schema.resumeStorageStats)
			.values({
				userId: input.userId,
				usedStorage: size,
			})
			.onConflictDoUpdate({
				target: [schema.resumeStorageStats.userId],
				set: {
					usedStorage: sql`${schema.resumeStorageStats.usedStorage} + ${size}`,
				},
			});

		return id;
	},

	// Update a version's note
	updateNote: async (input: { id: string; userId: string; note: string }) => {
		await db
			.update(schema.resumeVersion)
			.set({ note: input.note })
			.where(and(eq(schema.resumeVersion.id, input.id), eq(schema.resumeVersion.userId, input.userId)));
	},

	// Restore a version (creates a new version with the old data)
	restore: async (input: { id: string; userId: string }) => {
		// Get the version to restore
		const [versionToRestore] = await db
			.select()
			.from(schema.resumeVersion)
			.where(and(eq(schema.resumeVersion.id, input.id), eq(schema.resumeVersion.userId, input.userId)));

		if (!versionToRestore) {
			throw new ORPCError("NOT_FOUND");
		}

		// Get the current resume data
		const [currentResume] = await db
			.select({ data: schema.resume.data, name: schema.resume.name })
			.from(schema.resume)
			.where(and(eq(schema.resume.id, versionToRestore.resumeId), eq(schema.resume.userId, input.userId)));

		if (!currentResume) {
			throw new ORPCError("NOT_FOUND");
		}

		// Create a new version with the restored data
		const newVersionId = await resumeHistoryService.create({
			userId: input.userId,
			resumeId: versionToRestore.resumeId,
			resumeName: currentResume.name,
			data: versionToRestore.data,
			note: `Restauration de la version ${versionToRestore.versionNumber}`,
			previousData: currentResume.data,
		});

		// Update the actual resume with the restored data
		await db
			.update(schema.resume)
			.set({ data: versionToRestore.data })
			.where(and(eq(schema.resume.id, versionToRestore.resumeId), eq(schema.resume.userId, input.userId)));

		return newVersionId;
	},

	// Get storage statistics
	getStorageStats: async (input: { userId: string }) => {
		const [stats] = await db
			.select()
			.from(schema.resumeStorageStats)
			.where(eq(schema.resumeStorageStats.userId, input.userId));

		if (!stats) {
			// Return default values if no stats exist
			return {
				usedStorage: 0,
				totalStorage: 104857600, // 100MB
			};
		}

		return {
			usedStorage: stats.usedStorage,
			totalStorage: stats.totalStorage,
		};
	},

	// Get version count and stats
	getStats: async (input: { userId: string; resumeId?: string }) => {
		const conditions = [eq(schema.resumeVersion.userId, input.userId)];
		if (input.resumeId) {
			conditions.push(eq(schema.resumeVersion.resumeId, input.resumeId));
		}

		const [result] = await db
			.select({
				totalVersions: sql<number>`count(*)::int`,
				totalSize: sql<number>`coalesce(sum(${schema.resumeVersion.size}), 0)::int`,
				lastModified: sql<Date>`max(${schema.resumeVersion.createdAt})`,
			})
			.from(schema.resumeVersion)
			.where(and(...conditions));

		return {
			totalVersions: result?.totalVersions ?? 0,
			totalSize: result?.totalSize ?? 0,
			lastModified: result?.lastModified ?? null,
		};
	},

	// Delete old versions (keep last N versions)
	cleanupOldVersions: async (input: { userId: string; resumeId: string; keepCount: number }) => {
		// Get all versions for this resume, ordered by creation date
		const versions = await db
			.select({ id: schema.resumeVersion.id, size: schema.resumeVersion.size })
			.from(schema.resumeVersion)
			.where(and(eq(schema.resumeVersion.resumeId, input.resumeId), eq(schema.resumeVersion.userId, input.userId)))
			.orderBy(desc(schema.resumeVersion.createdAt));

		// Keep the most recent versions
		const versionsToDelete = versions.slice(input.keepCount);

		if (versionsToDelete.length === 0) {
			return 0;
		}

		// Calculate total size being deleted
		const sizeToDelete = versionsToDelete.reduce((acc, v) => acc + v.size, 0);

		// Delete old versions
		await db
			.delete(schema.resumeVersion)
			.where(
				and(
					eq(schema.resumeVersion.userId, input.userId),
					or(...versionsToDelete.map((v) => eq(schema.resumeVersion.id, v.id))),
				),
			);

		// Update storage stats
		await db
			.update(schema.resumeStorageStats)
			.set({
				usedStorage: sql`greatest(${schema.resumeStorageStats.usedStorage} - ${sizeToDelete}, 0)`,
			})
			.where(eq(schema.resumeStorageStats.userId, input.userId));

		return versionsToDelete.length;
	},
};
