import { t } from "@lingui/core/macro";
import { ClockIcon } from "@phosphor-icons/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { ErrorComponent } from "@/components/error-component";
import { Separator } from "@/components/ui/separator";
import { authClient } from "@/integrations/auth/client";
import { orpc } from "@/integrations/orpc/client";
import { DashboardHeader } from "../-components/header";
import {
	CompareDialog,
	FilterBar,
	HistoryError,
	HistoryLoading,
	RestoreDialog,
	StatsSidebar,
	VersionTimeline,
} from "./-components/history-components";
import type { ResumeVersion } from "./-components/history-types";

// biome-ignore lint/suspicious/noExplicitAny: Route path not in generated route tree
export const Route = createFileRoute("/dashboard/resumes/history" as any)({
	component: RouteComponent,
	errorComponent: ErrorComponent,
});

function RouteComponent() {
	const { data: session } = authClient.useSession();
	const queryClient = useQueryClient();
	const [selectedVersion, setSelectedVersion] = useState<ResumeVersion | null>(null);
	const [compareVersion, setCompareVersion] = useState<ResumeVersion | null>(null);
	const [expandedVersions, setExpandedVersions] = useState<Set<string>>(new Set());
	const [searchQuery, setSearchQuery] = useState("");
	const [dateFrom, setDateFrom] = useState("");
	const [dateTo, setDateTo] = useState("");
	const [showFilters, setShowFilters] = useState(false);
	const [isRestoreDialogOpen, setIsRestoreDialogOpen] = useState(false);
	const [isCompareDialogOpen, setIsCompareDialogOpen] = useState(false);
	const [editingNote, setEditingNote] = useState<string | null>(null);
	const [noteText, setNoteText] = useState("");

	const {
		data: versions = [],
		isLoading,
		error,
	} = useQuery({
		...orpc.resumeHistory.list.queryOptions({
			search: searchQuery || undefined,
			dateFrom: dateFrom || undefined,
			dateTo: dateTo || undefined,
		}),
		enabled: !!session?.user,
	});

	const { data: storageStats } = useQuery({
		...orpc.resumeHistory.getStorageStats.queryOptions(),
		enabled: !!session?.user,
	});
	const { data: stats } = useQuery({ ...orpc.resumeHistory.getStats.queryOptions({}), enabled: !!session?.user });

	const { mutate: updateNoteMutation, isPending: isUpdatingNote } = useMutation({
		...orpc.resumeHistory.updateNote.mutationOptions(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["resumeHistory"] });
			setEditingNote(null);
			setNoteText("");
			toast.success(t`Note updated`);
		},
		onError: () => {
			toast.error(t`Error during update`);
		},
	});

	const { mutate: restoreMutation, isPending: isRestoring } = useMutation({
		...orpc.resumeHistory.restore.mutationOptions(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["resumeHistory"] });
			queryClient.invalidateQueries({ queryKey: ["resume"] });
			setIsRestoreDialogOpen(false);
			toast.success(t`Version restored successfully`);
		},
		onError: () => {
			toast.error(t`Error during restoration`);
		},
	});

	const toggleExpanded = (id: string) => {
		const newExpanded = new Set(expandedVersions);
		if (newExpanded.has(id)) {
			newExpanded.delete(id);
		} else {
			newExpanded.add(id);
		}
		setExpandedVersions(newExpanded);
	};

	const storagePercentage = storageStats ? (storageStats.usedStorage / storageStats.totalStorage) * 100 : 0;

	const handleRestore = (version: ResumeVersion) => {
		setSelectedVersion(version);
		setIsRestoreDialogOpen(true);
	};

	const confirmRestore = () => {
		if (selectedVersion) {
			restoreMutation({ id: selectedVersion.id });
		}
	};

	const handleCompare = (version: ResumeVersion) => {
		if (!selectedVersion) {
			setSelectedVersion(version);
		} else if (selectedVersion.id !== version.id) {
			setCompareVersion(version);
			setIsCompareDialogOpen(true);
		}
	};

	const handleExport = (version: ResumeVersion) => {
		const blob = new Blob([JSON.stringify(version, null, 2)], { type: "application/json" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = `${version.resumeName}-v${version.versionNumber}.json`;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
	};

	const saveNote = (versionId: string) => {
		updateNoteMutation({ id: versionId, note: noteText });
	};

	if (isLoading) {
		return <HistoryLoading />;
	}

	if (error) {
		return <HistoryError onRetry={() => queryClient.invalidateQueries({ queryKey: ["resumeHistory"] })} />;
	}

	return (
		<div className="space-y-4">
			<DashboardHeader icon={ClockIcon} title={t`Version History`} />

			<Separator />

			<FilterBar
				searchQuery={searchQuery}
				setSearchQuery={setSearchQuery}
				showFilters={showFilters}
				setShowFilters={setShowFilters}
				dateFrom={dateFrom}
				setDateFrom={setDateFrom}
				dateTo={dateTo}
				setDateTo={setDateTo}
				storageStats={storageStats}
				storagePercentage={storagePercentage}
			/>

			<div className="grid gap-4 lg:grid-cols-3">
				<div className="lg:col-span-2">
					<VersionTimeline
						versions={versions}
						expandedVersions={expandedVersions}
						selectedVersion={selectedVersion}
						editingNote={editingNote}
						noteText={noteText}
						isUpdatingNote={isUpdatingNote}
						onToggleExpand={toggleExpanded}
						onCompare={handleCompare}
						onRestore={handleRestore}
						onExport={handleExport}
						onEditNote={(versionId, currentNote) => {
							setEditingNote(versionId);
							setNoteText(currentNote);
						}}
						onSaveNote={saveNote}
						onCancelNote={() => {
							setEditingNote(null);
							setNoteText("");
						}}
						onNoteTextChange={setNoteText}
					/>
				</div>

				<StatsSidebar
					stats={stats}
					versions={versions}
					selectedVersion={selectedVersion}
					isCompareDialogOpen={isCompareDialogOpen}
					onExportCurrent={() => versions[0] && handleExport(versions[0])}
					onComparePrevious={() => {
						if (versions.length >= 2) {
							setSelectedVersion(versions[0]);
							setCompareVersion(versions[1]);
							setIsCompareDialogOpen(true);
						}
					}}
					onClearSelection={() => {
						setSelectedVersion(null);
						setCompareVersion(null);
					}}
				/>
			</div>

			<RestoreDialog
				isOpen={isRestoreDialogOpen}
				onOpenChange={setIsRestoreDialogOpen}
				selectedVersion={selectedVersion}
				isRestoring={isRestoring}
				onConfirm={confirmRestore}
			/>

			<CompareDialog
				isOpen={isCompareDialogOpen}
				onOpenChange={setIsCompareDialogOpen}
				selectedVersion={selectedVersion}
				compareVersion={compareVersion}
				onRestore={handleRestore}
			/>
		</div>
	);
}
