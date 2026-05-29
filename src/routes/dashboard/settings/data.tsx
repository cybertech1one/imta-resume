import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import {
	ArrowDownIcon,
	ArrowUpIcon,
	CheckCircleIcon,
	CloudArrowDownIcon,
	CloudArrowUpIcon,
	DatabaseIcon,
	FileIcon,
	SpinnerIcon,
	WarningCircleIcon,
	XCircleIcon,
} from "@phosphor-icons/react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";
import { ErrorComponent } from "@/components/error-component";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { authClient } from "@/integrations/auth/client";
import { orpc } from "@/integrations/orpc/client";
import { getQueryClient } from "@/integrations/query/client";
import { formatDate } from "@/utils/format-date";
import { cn } from "@/utils/style";
import { DashboardHeader } from "../-components/header";

export const Route = createFileRoute("/dashboard/settings/data")({
	component: RouteComponent,
	errorComponent: ErrorComponent,
});

const DATA_TYPE_IDS = [
	"resumes",
	"job_applications",
	"contacts",
	"career_goals",
	"cover_letters",
	"certifications",
	"salary_history",
	"journal_entries",
	"interview_notes",
	"skills",
] as const;
type DataType = (typeof DATA_TYPE_IDS)[number];

function getDataTypes() {
	return [
		{ id: "resumes" as const, label: t`Resumes`, description: t`All your resume documents and data` },
		{
			id: "job_applications" as const,
			label: t`Job Applications`,
			description: t`Application tracking and status history`,
		},
		{
			id: "contacts" as const,
			label: t`Contacts & References`,
			description: t`Networking contacts and professional references`,
		},
		{ id: "career_goals" as const, label: t`Career Goals`, description: t`Goals, milestones, and progress tracking` },
		{ id: "cover_letters" as const, label: t`Cover Letters`, description: t`All saved cover letter templates` },
		{
			id: "certifications" as const,
			label: t`Certifications`,
			description: t`Professional certifications and credentials`,
		},
		{ id: "salary_history" as const, label: t`Salary History`, description: t`Compensation records and history` },
		{
			id: "journal_entries" as const,
			label: t`Journal Entries`,
			description: t`Job search journal and daily reflections`,
		},
		{ id: "interview_notes" as const, label: t`Interview Notes`, description: t`Interview prep checklists and notes` },
		{ id: "skills" as const, label: t`Skills Assessment`, description: t`Skills quiz results and assessments` },
	];
}

const DUPLICATE_OPTION_IDS = ["skip", "overwrite", "create_new"] as const;
type DuplicateHandling = (typeof DUPLICATE_OPTION_IDS)[number];

function getDuplicateOptions() {
	return [
		{ id: "skip" as const, label: t`Skip duplicates`, description: t`Keep existing data, ignore duplicates` },
		{
			id: "overwrite" as const,
			label: t`Overwrite duplicates`,
			description: t`Replace existing data with imported data`,
		},
		{
			id: "create_new" as const,
			label: t`Create new entries`,
			description: t`Import as new entries with modified identifiers`,
		},
	];
}

function RouteComponent() {
	const DATA_TYPES = getDataTypes();
	const DUPLICATE_OPTIONS = getDuplicateOptions();
	const { data: session } = authClient.useSession();

	// Export state
	const [selectedExportTypes, setSelectedExportTypes] = useState<Set<DataType>>(new Set());
	const [isExporting, setIsExporting] = useState(false);

	// Import state
	const [importFile, setImportFile] = useState<File | null>(null);
	const [importData, setImportData] = useState<unknown>(null);
	const [validationResult, setValidationResult] = useState<{
		isValid: boolean;
		errors: string[];
		preview: {
			dataTypes: string[];
			recordCounts: Record<string, number>;
			exportedAt: string;
			version: string;
		};
	} | null>(null);
	const [selectedImportTypes, setSelectedImportTypes] = useState<Set<DataType>>(new Set());
	const [duplicateHandling, setDuplicateHandling] = useState<DuplicateHandling>("skip");
	const [isImporting, setIsImporting] = useState(false);
	const [importProgress, setImportProgress] = useState(0);
	const fileInputRef = useRef<HTMLInputElement>(null);

	// History query
	const {
		data: history,
		isLoading: isLoadingHistory,
		isError: isHistoryError,
	} = useQuery({
		...orpc.dataExport.getHistory.queryOptions({ input: { limit: 10 } }),
		staleTime: 5 * 60 * 1000,
		enabled: !!session?.user,
		retry: 1,
	});

	// Export mutation
	const exportMutation = useMutation({
		...orpc.dataExport.exportData.mutationOptions(),
		onSuccess: (data) => {
			// Download the exported data as JSON file
			const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
			const url = URL.createObjectURL(blob);
			const a = document.createElement("a");
			const timestamp = new Date().toISOString().split("T")[0];
			a.href = url;
			a.download = `imta-resume-export-${timestamp}.json`;
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
			URL.revokeObjectURL(url);

			toast.success(t`Data exported successfully!`);
			setSelectedExportTypes(new Set());
			getQueryClient().invalidateQueries({ queryKey: ["dataExport", "getHistory"] });
		},
		onError: (error) => {
			toast.error(error.message || t`Failed to export data`);
		},
		onSettled: () => {
			setIsExporting(false);
		},
	});

	// Validate mutation
	const validateMutation = useMutation({
		...orpc.dataExport.validateImportData.mutationOptions(),
		onSuccess: (result) => {
			setValidationResult(result);
			if (result.isValid) {
				setSelectedImportTypes(new Set(result.preview.dataTypes as DataType[]));
			}
		},
		onError: (error) => {
			toast.error(error.message || t`Failed to validate import file`);
		},
	});

	// Import mutation
	const importMutation = useMutation({
		...orpc.dataExport.importData.mutationOptions(),
		onSuccess: (result) => {
			const totalImported = Object.values(result.importedCounts).reduce((a, b) => a + b, 0);
			const totalSkipped = Object.values(result.skippedCounts).reduce((a, b) => a + b, 0);

			if (result.errors.length > 0) {
				toast.warning(
					t`Import completed with ${result.errors.length} errors. ${totalImported} records imported, ${totalSkipped} skipped.`,
				);
			} else {
				toast.success(t`Import completed! ${totalImported} records imported, ${totalSkipped} skipped.`);
			}

			// Reset import state
			setImportFile(null);
			setImportData(null);
			setValidationResult(null);
			setSelectedImportTypes(new Set());
			if (fileInputRef.current) {
				fileInputRef.current.value = "";
			}

			getQueryClient().invalidateQueries({ queryKey: ["dataExport", "getHistory"] });
		},
		onError: (error) => {
			toast.error(error.message || t`Failed to import data`);
		},
		onSettled: () => {
			setIsImporting(false);
			setImportProgress(0);
		},
	});

	// Handle export
	const handleExport = useCallback(() => {
		if (selectedExportTypes.size === 0) {
			toast.error(t`Please select at least one data type to export`);
			return;
		}

		setIsExporting(true);
		exportMutation.mutate({
			dataTypes: Array.from(selectedExportTypes) as (typeof DATA_TYPES)[number]["id"][],
		});
	}, [selectedExportTypes, exportMutation]);

	// Handle file selection
	const handleFileSelect = useCallback(
		async (event: React.ChangeEvent<HTMLInputElement>) => {
			const file = event.target.files?.[0];
			if (!file) return;

			if (!file.name.endsWith(".json")) {
				toast.error(t`Please select a valid JSON file`);
				return;
			}

			setImportFile(file);
			setValidationResult(null);
			setSelectedImportTypes(new Set());

			try {
				const text = await file.text();
				const data = JSON.parse(text);
				setImportData(data);

				// Validate the data
				validateMutation.mutate({ data });
			} catch {
				toast.error(t`Failed to parse JSON file`);
				setImportFile(null);
			}
		},
		[validateMutation],
	);

	// Handle import
	const handleImport = useCallback(() => {
		if (!importData || !validationResult?.isValid) {
			toast.error(t`Please upload and validate a file first`);
			return;
		}

		if (selectedImportTypes.size === 0) {
			toast.error(t`Please select at least one data type to import`);
			return;
		}

		setIsImporting(true);
		setImportProgress(10);

		// Simulate progress
		const progressInterval = setInterval(() => {
			setImportProgress((prev) => Math.min(prev + 10, 90));
		}, 200);

		importMutation.mutate(
			{
				data: importData,
				duplicateHandling,
				selectedDataTypes: Array.from(selectedImportTypes) as (typeof DATA_TYPES)[number]["id"][],
			},
			{
				onSettled: () => {
					clearInterval(progressInterval);
					setImportProgress(100);
				},
			},
		);
	}, [importData, validationResult, selectedImportTypes, duplicateHandling, importMutation]);

	// Toggle export type selection
	const toggleExportType = (type: DataType) => {
		setSelectedExportTypes((prev) => {
			const next = new Set(prev);
			if (next.has(type)) {
				next.delete(type);
			} else {
				next.add(type);
			}
			return next;
		});
	};

	// Toggle import type selection
	const toggleImportType = (type: DataType) => {
		setSelectedImportTypes((prev) => {
			const next = new Set(prev);
			if (next.has(type)) {
				next.delete(type);
			} else {
				next.add(type);
			}
			return next;
		});
	};

	// Select/deselect all export types
	const toggleAllExportTypes = () => {
		if (selectedExportTypes.size === DATA_TYPES.length) {
			setSelectedExportTypes(new Set());
		} else {
			setSelectedExportTypes(new Set(DATA_TYPES.map((t) => t.id)));
		}
	};

	// Get status badge
	const getStatusBadge = (status: string) => {
		switch (status) {
			case "completed":
				return (
					<Badge variant="outline" className="gap-1 border-green-500 text-green-600">
						<CheckCircleIcon className="size-3" />
						<Trans>Completed</Trans>
					</Badge>
				);
			case "failed":
				return (
					<Badge variant="outline" className="gap-1 border-red-500 text-red-600">
						<XCircleIcon className="size-3" />
						<Trans>Failed</Trans>
					</Badge>
				);
			case "processing":
				return (
					<Badge variant="outline" className="gap-1 border-blue-500 text-blue-600">
						<SpinnerIcon className="size-3 animate-spin" />
						<Trans>Processing</Trans>
					</Badge>
				);
			default:
				return (
					<Badge variant="outline" className="gap-1">
						<Trans>Pending</Trans>
					</Badge>
				);
		}
	};

	return (
		<div className="space-y-4">
			<DashboardHeader icon={DatabaseIcon} title={t`Data Management`} />

			<Separator />

			<motion.div initial={false} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="grid gap-6">
				{/* Export Section */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<CloudArrowDownIcon className="size-5" />
							<Trans>Export Data</Trans>
						</CardTitle>
						<CardDescription>
							<Trans>Download your data as a JSON file for backup or transfer to another account.</Trans>
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="flex items-center justify-between">
							<Label>
								<Trans>Select data to export:</Trans>
							</Label>
							<Button variant="ghost" size="sm" onClick={toggleAllExportTypes}>
								{selectedExportTypes.size === DATA_TYPES.length ? (
									<Trans>Deselect All</Trans>
								) : (
									<Trans>Select All</Trans>
								)}
							</Button>
						</div>

						<div className="grid gap-3 md:grid-cols-2">
							{DATA_TYPES.map((type) => (
								<motion.div
									key={type.id}
									whileHover={{ scale: 1.01 }}
									whileTap={{ scale: 0.99 }}
									className={cn(
										"flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors",
										selectedExportTypes.has(type.id)
											? "border-primary bg-primary/5"
											: "border-border hover:border-primary/50",
									)}
									onClick={() => toggleExportType(type.id)}
								>
									<Checkbox
										checked={selectedExportTypes.has(type.id)}
										onCheckedChange={() => toggleExportType(type.id)}
										className="mt-0.5"
									/>
									<div className="space-y-1">
										<Label className="cursor-pointer font-medium">{type.label}</Label>
										<p className="text-muted-foreground text-xs">{type.description}</p>
									</div>
								</motion.div>
							))}
						</div>

						<div className="flex justify-end pt-2">
							<Button onClick={handleExport} disabled={isExporting || selectedExportTypes.size === 0}>
								{isExporting ? (
									<>
										<SpinnerIcon className="size-4 animate-spin" />
										<Trans>Exporting...</Trans>
									</>
								) : (
									<>
										<ArrowDownIcon className="size-4" />
										<Trans>Export Selected Data</Trans>
									</>
								)}
							</Button>
						</div>
					</CardContent>
				</Card>

				{/* Import Section */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<CloudArrowUpIcon className="size-5" />
							<Trans>Import Data</Trans>
						</CardTitle>
						<CardDescription>
							<Trans>Upload a previously exported JSON file to restore or merge your data.</Trans>
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						{/* File Upload */}
						<div className="space-y-2">
							<Label>
								<Trans>Upload export file:</Trans>
							</Label>
							<div
								className={cn(
									"flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-6 transition-colors hover:border-primary/50",
									importFile ? "border-primary bg-primary/5" : "border-border",
								)}
								onClick={() => fileInputRef.current?.click()}
							>
								<input ref={fileInputRef} type="file" accept=".json" onChange={handleFileSelect} className="hidden" />
								{importFile ? (
									<>
										<FileIcon className="size-8 text-primary" />
										<p className="text-sm">{importFile.name}</p>
										<p className="text-muted-foreground text-xs">{(importFile.size / 1024).toFixed(2)} KB</p>
									</>
								) : (
									<>
										<CloudArrowUpIcon className="size-8 text-muted-foreground" />
										<p className="text-muted-foreground text-sm">
											<Trans>Click to upload or drag and drop</Trans>
										</p>
										<p className="text-muted-foreground text-xs">
											<Trans>JSON files only</Trans>
										</p>
									</>
								)}
							</div>
						</div>

						{/* Validation Result */}
						<AnimatePresence>
							{validationResult && (
								<motion.div
									initial={{ opacity: 0, height: 0 }}
									animate={{ opacity: 1, height: "auto" }}
									exit={{ opacity: 0, height: 0 }}
									className="space-y-4"
								>
									{validationResult.isValid ? (
										<>
											<div className="flex items-center gap-2 rounded-lg bg-green-50 p-3 text-green-700 dark:bg-green-950/30 dark:text-green-400">
												<CheckCircleIcon className="size-5" />
												<span className="text-sm">
													<Trans>File validated successfully!</Trans>
												</span>
											</div>

											{/* Preview */}
											<div className="space-y-2">
												<Label>
													<Trans>Export details:</Trans>
												</Label>
												<div className="rounded-lg bg-muted/50 p-3 text-sm">
													<p>
														<Trans>Version:</Trans> {validationResult.preview.version}
													</p>
													<p>
														<Trans>Exported at:</Trans>{" "}
														{formatDate(validationResult.preview.exportedAt, {
															day: "numeric",
															month: "long",
															year: "numeric",
															hour: "2-digit",
															minute: "2-digit",
														})}
													</p>
												</div>
											</div>

											{/* Select data types to import */}
											<div className="space-y-2">
												<Label>
													<Trans>Select data to import:</Trans>
												</Label>
												<div className="grid gap-2 md:grid-cols-2">
													{validationResult.preview.dataTypes.map((type) => {
														const typeConfig = DATA_TYPES.find((t) => t.id === type);
														const count = validationResult.preview.recordCounts[type] ?? 0;

														return (
															<motion.div
																key={type}
																whileHover={{ scale: 1.01 }}
																whileTap={{ scale: 0.99 }}
																className={cn(
																	"flex cursor-pointer items-center justify-between rounded-lg border p-3 transition-colors",
																	selectedImportTypes.has(type as DataType)
																		? "border-primary bg-primary/5"
																		: "border-border hover:border-primary/50",
																)}
																onClick={() => toggleImportType(type as DataType)}
															>
																<div className="flex items-center gap-2">
																	<Checkbox
																		checked={selectedImportTypes.has(type as DataType)}
																		onCheckedChange={() => toggleImportType(type as DataType)}
																	/>
																	<span className="font-medium text-sm">{typeConfig?.label ?? type}</span>
																</div>
																<Badge variant="secondary">{count} records</Badge>
															</motion.div>
														);
													})}
												</div>
											</div>

											{/* Duplicate handling */}
											<div className="space-y-2">
												<Label>
													<Trans>Duplicate handling:</Trans>
												</Label>
												<div className="grid gap-2 md:grid-cols-3">
													{DUPLICATE_OPTIONS.map((option) => (
														<motion.div
															key={option.id}
															whileHover={{ scale: 1.01 }}
															whileTap={{ scale: 0.99 }}
															className={cn(
																"flex cursor-pointer flex-col gap-1 rounded-lg border p-3 transition-colors",
																duplicateHandling === option.id
																	? "border-primary bg-primary/5"
																	: "border-border hover:border-primary/50",
															)}
															onClick={() => setDuplicateHandling(option.id as DuplicateHandling)}
														>
															<div className="flex items-center gap-2">
																<Checkbox
																	checked={duplicateHandling === option.id}
																	onCheckedChange={() => setDuplicateHandling(option.id as DuplicateHandling)}
																/>
																<span className="font-medium text-sm">{option.label}</span>
															</div>
															<p className="pl-6 text-muted-foreground text-xs">{option.description}</p>
														</motion.div>
													))}
												</div>
											</div>
										</>
									) : (
										<div className="space-y-2">
											<div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-red-700 dark:bg-red-950/30 dark:text-red-400">
												<WarningCircleIcon className="size-5" />
												<span className="text-sm">
													<Trans>Validation failed</Trans>
												</span>
											</div>
											<ul className="list-inside list-disc space-y-1 text-muted-foreground text-sm">
												{validationResult.errors.map((error, index) => (
													<li key={index}>{error}</li>
												))}
											</ul>
										</div>
									)}
								</motion.div>
							)}
						</AnimatePresence>

						{/* Import progress */}
						<AnimatePresence>
							{isImporting && (
								<motion.div
									initial={{ opacity: 0, height: 0 }}
									animate={{ opacity: 1, height: "auto" }}
									exit={{ opacity: 0, height: 0 }}
									className="space-y-2"
								>
									<div className="flex items-center justify-between text-sm">
										<span>
											<Trans>Importing data...</Trans>
										</span>
										<span>{importProgress}%</span>
									</div>
									<Progress value={importProgress} />
								</motion.div>
							)}
						</AnimatePresence>

						<div className="flex justify-end pt-2">
							<Button
								onClick={handleImport}
								disabled={isImporting || !validationResult?.isValid || selectedImportTypes.size === 0}
							>
								{isImporting ? (
									<>
										<SpinnerIcon className="size-4 animate-spin" />
										<Trans>Importing...</Trans>
									</>
								) : (
									<>
										<ArrowUpIcon className="size-4" />
										<Trans>Import Selected Data</Trans>
									</>
								)}
							</Button>
						</div>
					</CardContent>
				</Card>

				{/* History Section */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<DatabaseIcon className="size-5" />
							<Trans>Export/Import History</Trans>
						</CardTitle>
						<CardDescription>
							<Trans>View your recent data export and import operations.</Trans>
						</CardDescription>
					</CardHeader>
					<CardContent>
						{isLoadingHistory ? (
							<div className="flex items-center justify-center py-8">
								<SpinnerIcon className="size-6 animate-spin text-muted-foreground" />
							</div>
						) : isHistoryError ? (
							<div className="flex flex-col items-center justify-center gap-2 py-8 text-muted-foreground">
								<DatabaseIcon className="size-8" />
								<p className="text-sm">
									<Trans>L'historique des opérations n'est pas encore disponible.</Trans>
								</p>
							</div>
						) : history && history.length > 0 ? (
							<div className="space-y-3">
								{history.map((record) => (
									<motion.div
										key={record.id}
										initial={{ opacity: 0, x: -20 }}
										animate={{ opacity: 1, x: 0 }}
										className="flex items-center justify-between rounded-lg border p-3"
									>
										<div className="flex items-center gap-3">
											{record.operation === "export" ? (
												<ArrowDownIcon className="size-5 text-blue-500" />
											) : (
												<ArrowUpIcon className="size-5 text-green-500" />
											)}
											<div>
												<p className="font-medium text-sm">
													{record.operation === "export" ? <Trans>Data Export</Trans> : <Trans>Data Import</Trans>}
												</p>
												<p className="text-muted-foreground text-xs">
													{formatDate(record.createdAt, {
														day: "numeric",
														month: "long",
														year: "numeric",
														hour: "2-digit",
														minute: "2-digit",
													})}
												</p>
											</div>
										</div>
										<div className="flex items-center gap-3">
											{record.operation === "export" && record.exportMetadata && (
												<span className="text-muted-foreground text-xs">
													{Object.values(record.exportMetadata.recordCounts).reduce((a, b) => a + b, 0)} records
												</span>
											)}
											{record.operation === "import" && record.importMetadata && (
												<span className="text-muted-foreground text-xs">
													{Object.values(record.importMetadata.importedCounts).reduce((a, b) => a + b, 0)} imported
												</span>
											)}
											{getStatusBadge(record.status)}
										</div>
									</motion.div>
								))}
							</div>
						) : (
							<div className="flex flex-col items-center justify-center gap-2 py-8 text-muted-foreground">
								<DatabaseIcon className="size-8" />
								<p className="text-sm">
									<Trans>No export/import history yet</Trans>
								</p>
							</div>
						)}
					</CardContent>
				</Card>
			</motion.div>
		</div>
	);
}
