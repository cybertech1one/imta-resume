import z from "zod";
import type { ExportableDataType } from "@/integrations/drizzle/schema";
import { protectedProcedure } from "../context";
import { dataExportService, type ExportData } from "../services/data-export";

// Schema for exportable data types
const exportableDataTypeSchema = z.enum([
	"resumes",
	"job_applications",
	"contacts",
	"skills",
	"career_goals",
	"interview_notes",
	"cover_letters",
	"certifications",
	"salary_history",
	"journal_entries",
	"settings",
]);

// Schema for duplicate handling
const duplicateHandlingSchema = z.enum(["skip", "overwrite", "create_new"]);

// Schema for export/import status
const exportStatusSchema = z.enum(["pending", "processing", "completed", "failed"]);

// Schema for export metadata
const exportMetadataSchema = z.object({
	dataTypes: z.array(exportableDataTypeSchema),
	recordCounts: z.record(z.string(), z.number()),
	fileSize: z.number().optional(),
	fileName: z.string().optional(),
});

// Schema for import metadata
const importMetadataSchema = z.object({
	dataTypes: z.array(exportableDataTypeSchema),
	recordCounts: z.record(z.string(), z.number()),
	duplicateHandling: duplicateHandlingSchema,
	importedCounts: z.record(z.string(), z.number()),
	skippedCounts: z.record(z.string(), z.number()),
	errors: z.array(z.string()),
});

// Schema for history record
const historyRecordSchema = z.object({
	id: z.string().uuid(),
	operation: z.enum(["export", "import"]),
	status: exportStatusSchema,
	exportMetadata: exportMetadataSchema.nullable(),
	importMetadata: importMetadataSchema.nullable(),
	errorMessage: z.string().nullable(),
	startedAt: z.coerce.date().nullable(),
	completedAt: z.coerce.date().nullable(),
	createdAt: z.coerce.date(),
});

// Schema for validation result
const validationResultSchema = z.object({
	isValid: z.boolean(),
	errors: z.array(z.string()),
	preview: z.object({
		dataTypes: z.array(exportableDataTypeSchema),
		recordCounts: z.record(z.string(), z.number()),
		exportedAt: z.string(),
		version: z.string(),
	}),
});

export const dataExportRouter = {
	// Export user data
	exportData: protectedProcedure
		.route({
			method: "POST",
			path: "/data-export/export",
			tags: ["Data Export"],
			summary: "Export user data",
			description: "Export selected data types to JSON format for backup or transfer.",
		})
		.input(
			z.object({
				dataTypes: z.array(exportableDataTypeSchema).min(1, "Select at least one data type to export"),
			}),
		)
		.output(z.unknown())
		.handler(async ({ context, input }) => {
			// Try to create history record (non-blocking - table may not exist yet)
			let historyId: string | null = null;
			try {
				historyId = await dataExportService.createHistoryRecord({
					userId: context.user.id,
					operation: "export",
					status: "processing",
				});
			} catch {
				// History tracking unavailable - continue with export anyway
			}

			try {
				// Export data
				const exportData = await dataExportService.exportData({
					userId: context.user.id,
					dataTypes: input.dataTypes as ExportableDataType[],
				});

				// Calculate record counts
				const recordCounts: Record<string, number> = {};
				for (const dataType of input.dataTypes) {
					const data = exportData.data[dataType as keyof typeof exportData.data];
					recordCounts[dataType] = Array.isArray(data) ? data.length : 0;
				}

				// Update history with success (non-blocking)
				if (historyId) {
					try {
						await dataExportService.updateHistoryRecord({
							id: historyId,
							userId: context.user.id,
							status: "completed",
							exportMetadata: {
								dataTypes: input.dataTypes as ExportableDataType[],
								recordCounts,
							},
						});
					} catch {
						// History update failed - not critical
					}
				}

				return exportData;
			} catch (error) {
				// Update history with failure (non-blocking)
				if (historyId) {
					try {
						await dataExportService.updateHistoryRecord({
							id: historyId,
							userId: context.user.id,
							status: "failed",
							errorMessage: error instanceof Error ? error.message : "Unknown error occurred",
						});
					} catch {
						// History update failed - not critical
					}
				}

				throw error;
			}
		}),

	// Validate import data
	validateImportData: protectedProcedure
		.route({
			method: "POST",
			path: "/data-export/validate",
			tags: ["Data Export"],
			summary: "Validate import data",
			description: "Validate the structure of import data before importing.",
		})
		.input(
			z.object({
				data: z.unknown(),
			}),
		)
		.output(validationResultSchema)
		.handler(async ({ input }) => {
			const result = dataExportService.validateImportData(input.data);
			return {
				...result,
				preview: {
					...result.preview,
					dataTypes: result.preview.dataTypes as z.infer<typeof exportableDataTypeSchema>[],
				},
			};
		}),

	// Import user data
	importData: protectedProcedure
		.route({
			method: "POST",
			path: "/data-export/import",
			tags: ["Data Export"],
			summary: "Import user data",
			description: "Import data from a previously exported JSON file.",
		})
		.input(
			z.object({
				data: z.unknown(),
				duplicateHandling: duplicateHandlingSchema,
				selectedDataTypes: z.array(exportableDataTypeSchema).min(1, "Select at least one data type to import"),
			}),
		)
		.output(importMetadataSchema)
		.handler(async ({ context, input }) => {
			// Validate data first
			const validationResult = dataExportService.validateImportData(input.data);
			if (!validationResult.isValid) {
				throw new Error(`Invalid import data: ${validationResult.errors.join(", ")}`);
			}

			// Try to create history record (non-blocking - table may not exist yet)
			let historyId: string | null = null;
			try {
				historyId = await dataExportService.createHistoryRecord({
					userId: context.user.id,
					operation: "import",
					status: "processing",
				});
			} catch {
				// History tracking unavailable - continue with import anyway
			}

			try {
				// Import data
				const importResult = await dataExportService.importData({
					userId: context.user.id,
					data: input.data as ExportData,
					duplicateHandling: input.duplicateHandling,
					selectedDataTypes: input.selectedDataTypes as ExportableDataType[],
				});

				// Update history with success (non-blocking)
				if (historyId) {
					try {
						await dataExportService.updateHistoryRecord({
							id: historyId,
							userId: context.user.id,
							status: "completed",
							importMetadata: {
								...importResult,
								dataTypes: importResult.dataTypes as z.infer<typeof exportableDataTypeSchema>[],
							},
						});
					} catch {
						// History update failed - not critical
					}
				}

				return {
					...importResult,
					dataTypes: importResult.dataTypes as z.infer<typeof exportableDataTypeSchema>[],
				};
			} catch (error) {
				// Update history with failure (non-blocking)
				if (historyId) {
					try {
						await dataExportService.updateHistoryRecord({
							id: historyId,
							userId: context.user.id,
							status: "failed",
							errorMessage: error instanceof Error ? error.message : "Unknown error occurred",
						});
					} catch {
						// History update failed - not critical
					}
				}

				throw error;
			}
		}),

	// Get export/import history
	getHistory: protectedProcedure
		.route({
			method: "GET",
			path: "/data-export/history",
			tags: ["Data Export"],
			summary: "Get export/import history",
			description: "Get the history of data export and import operations.",
		})
		.input(
			z
				.object({
					limit: z.number().min(1).max(100).optional().default(20),
					offset: z.number().min(0).optional().default(0),
				})
				.optional()
				.default({ limit: 20, offset: 0 }),
		)
		.output(z.array(historyRecordSchema))
		.handler(async ({ context, input }) => {
			try {
				const history = await dataExportService.getHistory({
					userId: context.user.id,
					limit: input.limit,
					offset: input.offset,
				});

				return history.map((record) => ({
					...record,
					exportMetadata: record.exportMetadata
						? {
								...record.exportMetadata,
								dataTypes: record.exportMetadata.dataTypes as z.infer<typeof exportableDataTypeSchema>[],
							}
						: null,
					importMetadata: record.importMetadata
						? {
								...record.importMetadata,
								dataTypes: record.importMetadata.dataTypes as z.infer<typeof exportableDataTypeSchema>[],
							}
						: null,
				}));
			} catch {
				// Table may not exist yet - return empty array
				return [];
			}
		}),

	// Get single history record
	getHistoryById: protectedProcedure
		.route({
			method: "GET",
			path: "/data-export/history/{id}",
			tags: ["Data Export"],
			summary: "Get history record by ID",
			description: "Get a single export/import history record by its ID.",
		})
		.input(z.object({ id: z.string().uuid() }))
		.output(historyRecordSchema)
		.handler(async ({ context, input }) => {
			const record = await dataExportService.getHistoryById({
				id: input.id,
				userId: context.user.id,
			});

			return {
				...record,
				exportMetadata: record.exportMetadata
					? {
							...record.exportMetadata,
							dataTypes: record.exportMetadata.dataTypes as z.infer<typeof exportableDataTypeSchema>[],
						}
					: null,
				importMetadata: record.importMetadata
					? {
							...record.importMetadata,
							dataTypes: record.importMetadata.dataTypes as z.infer<typeof exportableDataTypeSchema>[],
						}
					: null,
			};
		}),
};
