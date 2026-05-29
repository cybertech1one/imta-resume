import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import {
	ArrowCounterClockwiseIcon,
	CalendarIcon,
	CaretDownIcon,
	CaretRightIcon,
	CheckCircleIcon,
	ClockIcon,
	CloudCheckIcon,
	DownloadSimpleIcon,
	EyeIcon,
	FunnelIcon,
	HardDriveIcon,
	MagnifyingGlassIcon,
	NoteIcon,
	SpinnerIcon,
	WarningIcon,
	XIcon,
} from "@phosphor-icons/react";
import { AnimatePresence, motion } from "motion/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { formatDate } from "@/utils/format-date";
import { cn } from "@/utils/style";
import { DashboardHeader } from "../../-components/header";
import type { ResumeVersion, VersionChange } from "./history-types";
import { formatBytes, getChangeIcon } from "./history-utils";

export function HistoryLoading() {
	return (
		<div className="space-y-4">
			<DashboardHeader icon={ClockIcon} title={t`Version History`} />
			<Separator />
			<div className="flex flex-col items-center justify-center py-12">
				<SpinnerIcon className="size-8 animate-spin text-primary" />
				<p className="mt-4 text-muted-foreground">
					<Trans>Loading...</Trans>
				</p>
			</div>
		</div>
	);
}

export function HistoryError({ onRetry }: { onRetry: () => void }) {
	return (
		<div className="space-y-4">
			<DashboardHeader icon={ClockIcon} title={t`Version History`} />
			<Separator />
			<Card className="border-destructive/50 bg-destructive/5">
				<CardContent className="flex flex-col items-center justify-center py-12">
					<WarningIcon className="size-12 text-destructive" />
					<p className="mt-4 text-destructive">
						<Trans>Error loading history</Trans>
					</p>
					<Button variant="outline" className="mt-4" onClick={onRetry}>
						<Trans>Retry</Trans>
					</Button>
				</CardContent>
			</Card>
		</div>
	);
}

function DiffLine({ change }: { change: VersionChange }) {
	return (
		<div className="space-y-1 rounded-md border p-2">
			<div className="flex items-center gap-2">
				{getChangeIcon(change.type)}
				<span className="font-mono text-muted-foreground text-xs">{change.field}</span>
			</div>
			{change.oldValue && (
				<div className="flex items-start gap-2">
					<span className="shrink-0 rounded bg-red-500/20 px-1 font-mono text-red-600 text-xs dark:text-red-400">
						-
					</span>
					<span className="rounded bg-red-500/10 px-1 text-sm line-through">{change.oldValue}</span>
				</div>
			)}
			{change.newValue && (
				<div className="flex items-start gap-2">
					<span className="shrink-0 rounded bg-green-500/20 px-1 font-mono text-green-600 text-xs dark:text-green-400">
						+
					</span>
					<span className="rounded bg-green-500/10 px-1 text-sm">{change.newValue}</span>
				</div>
			)}
		</div>
	);
}

export function FilterBar({
	searchQuery,
	setSearchQuery,
	showFilters,
	setShowFilters,
	dateFrom,
	setDateFrom,
	dateTo,
	setDateTo,
	storageStats,
	storagePercentage,
}: {
	searchQuery: string;
	setSearchQuery: (v: string) => void;
	showFilters: boolean;
	setShowFilters: (v: boolean) => void;
	dateFrom: string;
	setDateFrom: (v: string) => void;
	dateTo: string;
	setDateTo: (v: string) => void;
	storageStats: { usedStorage: number; totalStorage: number } | undefined;
	storagePercentage: number;
}) {
	return (
		<>
			<div className="flex flex-wrap items-center justify-between gap-4">
				<div className="flex items-center gap-2">
					<div className="relative">
						<MagnifyingGlassIcon className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
						<Input
							placeholder={t`Search history...`}
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="w-64 pl-8"
						/>
					</div>
					<Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)}>
						<FunnelIcon />
						<Trans>Filters</Trans>
					</Button>
				</div>

				<div className="flex items-center gap-4">
					<div className="flex items-center gap-2">
						<motion.div
							initial={false}
							animate={{ opacity: 1, scale: 1 }}
							className="flex items-center gap-1 text-green-600 text-sm dark:text-green-400"
						>
							<CloudCheckIcon className="size-4" />
							<Trans>Auto-save</Trans>
						</motion.div>
					</div>

					<Tooltip>
						<TooltipTrigger asChild>
							<div className="flex items-center gap-2">
								<HardDriveIcon className="size-4 text-muted-foreground" />
								<div className="w-24">
									<Progress value={storagePercentage} />
								</div>
								<span className="text-muted-foreground text-xs">
									{formatBytes(storageStats?.usedStorage ?? 0)} / {formatBytes(storageStats?.totalStorage ?? 104857600)}
								</span>
							</div>
						</TooltipTrigger>
						<TooltipContent>
							<Trans>Storage space used</Trans>: {storagePercentage.toFixed(1)}%
						</TooltipContent>
					</Tooltip>
				</div>
			</div>

			<AnimatePresence>
				{showFilters && (
					<motion.div
						initial={{ opacity: 0, height: 0 }}
						animate={{ opacity: 1, height: "auto" }}
						exit={{ opacity: 0, height: 0 }}
						className="overflow-hidden"
					>
						<div className="flex flex-wrap items-end gap-4 rounded-lg border bg-card p-4">
							<div className="grid gap-1.5">
								<Label>
									<CalendarIcon className="size-4" />
									<Trans>Start date</Trans>
								</Label>
								<Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="w-40" />
							</div>
							<div className="grid gap-1.5">
								<Label>
									<CalendarIcon className="size-4" />
									<Trans>End date</Trans>
								</Label>
								<Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="w-40" />
							</div>
							<Button
								variant="ghost"
								size="sm"
								onClick={() => {
									setDateFrom("");
									setDateTo("");
									setSearchQuery("");
								}}
							>
								<XIcon />
								<Trans>Clear filters</Trans>
							</Button>
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</>
	);
}

function VersionCard({
	version,
	index,
	isExpanded,
	isSelected,
	editingNote,
	noteText,
	isUpdatingNote,
	onToggleExpand,
	onCompare,
	onRestore,
	onExport,
	onEditNote,
	onSaveNote,
	onCancelNote,
	onNoteTextChange,
}: {
	version: ResumeVersion;
	index: number;
	isExpanded: boolean;
	isSelected: boolean;
	editingNote: boolean;
	noteText: string;
	isUpdatingNote: boolean;
	onToggleExpand: () => void;
	onCompare: () => void;
	onRestore: () => void;
	onExport: () => void;
	onEditNote: () => void;
	onSaveNote: () => void;
	onCancelNote: () => void;
	onNoteTextChange: (v: string) => void;
}) {
	return (
		<motion.div
			key={version.id}
			initial={false}
			animate={{ opacity: 1, x: 0 }}
			exit={{ opacity: 0, x: -20 }}
			transition={{ delay: index * 0.05 }}
			className="relative pl-10"
		>
			<div
				className={cn(
					"absolute top-3 left-2 size-5 rounded-full border-2 bg-background",
					index === 0 ? "border-primary bg-primary" : "border-muted-foreground",
				)}
			/>

			<div
				className={cn(
					"rounded-lg border bg-card p-4 transition-all hover:shadow-md",
					isSelected && "ring-2 ring-primary",
				)}
			>
				<div className="flex items-start justify-between gap-4">
					<div className="flex-1">
						<div className="flex items-center gap-2">
							<button
								type="button"
								onClick={onToggleExpand}
								className="flex items-center gap-1 font-medium hover:text-primary"
							>
								{isExpanded ? <CaretDownIcon className="size-4" /> : <CaretRightIcon className="size-4" />}
								<Trans>Version</Trans> {version.versionNumber}
							</button>
							{index === 0 && (
								<Badge variant="default">
									<Trans>Current</Trans>
								</Badge>
							)}
							<Badge variant="outline">{formatBytes(version.size)}</Badge>
						</div>

						<div className="mt-1 flex items-center gap-2 text-muted-foreground text-sm">
							<ClockIcon className="size-3" />
							{formatDate(version.createdAt, {
								day: "2-digit",
								month: "long",
								year: "numeric",
								hour: "2-digit",
								minute: "2-digit",
							})}
						</div>

						{editingNote ? (
							<div className="mt-2 flex gap-2">
								<Textarea
									value={noteText}
									onChange={(e) => onNoteTextChange(e.target.value)}
									placeholder={t`Add a note...`}
									className="min-h-[60px]"
								/>
								<div className="flex flex-col gap-1">
									<Button size="sm" onClick={onSaveNote} disabled={isUpdatingNote}>
										{isUpdatingNote ? <SpinnerIcon className="size-4 animate-spin" /> : <CheckCircleIcon />}
									</Button>
									<Button size="sm" variant="ghost" onClick={onCancelNote}>
										<XIcon />
									</Button>
								</div>
							</div>
						) : (
							<button type="button" onClick={onEditNote} className="mt-2 text-left text-sm hover:text-primary">
								<NoteIcon className="mr-1 inline size-3" />
								{version.note || t`Add a note...`}
							</button>
						)}
					</div>

					<div className="flex items-center gap-1">
						<Tooltip>
							<TooltipTrigger asChild>
								<Button
									variant="ghost"
									size="icon-sm"
									onClick={onCompare}
									className={cn(isSelected && "bg-primary/10")}
								>
									<EyeIcon />
								</Button>
							</TooltipTrigger>
							<TooltipContent>
								<Trans>Compare versions</Trans>
							</TooltipContent>
						</Tooltip>

						<Tooltip>
							<TooltipTrigger asChild>
								<Button variant="ghost" size="icon-sm" onClick={onRestore} disabled={index === 0}>
									<ArrowCounterClockwiseIcon />
								</Button>
							</TooltipTrigger>
							<TooltipContent>
								<Trans>Restore this version</Trans>
							</TooltipContent>
						</Tooltip>

						<Tooltip>
							<TooltipTrigger asChild>
								<Button variant="ghost" size="icon-sm" onClick={onExport}>
									<DownloadSimpleIcon />
								</Button>
							</TooltipTrigger>
							<TooltipContent>
								<Trans>Export this version</Trans>
							</TooltipContent>
						</Tooltip>
					</div>
				</div>

				<AnimatePresence>
					{isExpanded && (
						<motion.div
							initial={{ opacity: 0, height: 0 }}
							animate={{ opacity: 1, height: "auto" }}
							exit={{ opacity: 0, height: 0 }}
							className="mt-4 space-y-2 overflow-hidden"
						>
							<Separator />
							<div className="pt-2">
								<h4 className="mb-2 font-medium text-sm">
									<Trans>Changes</Trans>
								</h4>
								<div className="space-y-2">
									{version.changes.map((change, changeIndex) => (
										<motion.div
											key={changeIndex}
											initial={{ opacity: 0, y: -10 }}
											animate={{ opacity: 1, y: 0 }}
											transition={{ delay: changeIndex * 0.05 }}
										>
											<DiffLine change={change} />
										</motion.div>
									))}
								</div>
							</div>
						</motion.div>
					)}
				</AnimatePresence>
			</div>
		</motion.div>
	);
}

export function VersionTimeline({
	versions,
	expandedVersions,
	selectedVersion,
	editingNote,
	noteText,
	isUpdatingNote,
	onToggleExpand,
	onCompare,
	onRestore,
	onExport,
	onEditNote,
	onSaveNote,
	onCancelNote,
	onNoteTextChange,
}: {
	versions: ResumeVersion[];
	expandedVersions: Set<string>;
	selectedVersion: ResumeVersion | null;
	editingNote: string | null;
	noteText: string;
	isUpdatingNote: boolean;
	onToggleExpand: (id: string) => void;
	onCompare: (version: ResumeVersion) => void;
	onRestore: (version: ResumeVersion) => void;
	onExport: (version: ResumeVersion) => void;
	onEditNote: (versionId: string, currentNote: string) => void;
	onSaveNote: (versionId: string) => void;
	onCancelNote: () => void;
	onNoteTextChange: (v: string) => void;
}) {
	return (
		<ScrollArea className="h-[600px] rounded-lg border">
			<div className="p-4">
				<div className="relative">
					<div className="absolute top-0 bottom-0 left-4 w-0.5 bg-border" />

					<div className="space-y-4">
						<AnimatePresence>
							{versions.map((version, index) => (
								<VersionCard
									key={version.id}
									version={version}
									index={index}
									isExpanded={expandedVersions.has(version.id)}
									isSelected={selectedVersion?.id === version.id}
									editingNote={editingNote === version.id}
									noteText={noteText}
									isUpdatingNote={isUpdatingNote}
									onToggleExpand={() => onToggleExpand(version.id)}
									onCompare={() => onCompare(version)}
									onRestore={() => onRestore(version)}
									onExport={() => onExport(version)}
									onEditNote={() => onEditNote(version.id, version.note)}
									onSaveNote={() => onSaveNote(version.id)}
									onCancelNote={onCancelNote}
									onNoteTextChange={onNoteTextChange}
								/>
							))}
						</AnimatePresence>
					</div>
				</div>

				{versions.length === 0 && (
					<div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
						<ClockIcon className="mb-2 size-12" />
						<p>
							<Trans>No versions found</Trans>
						</p>
					</div>
				)}
			</div>
		</ScrollArea>
	);
}

export function StatsSidebar({
	stats,
	versions,
	selectedVersion,
	isCompareDialogOpen,
	onExportCurrent,
	onComparePrevious,
	onClearSelection,
}: {
	stats: { totalVersions: number; lastModified: Date | null; totalSize: number } | undefined;
	versions: ResumeVersion[];
	selectedVersion: ResumeVersion | null;
	isCompareDialogOpen: boolean;
	onExportCurrent: () => void;
	onComparePrevious: () => void;
	onClearSelection: () => void;
}) {
	return (
		<div className="space-y-4">
			<div className="rounded-lg border bg-card p-4">
				<h3 className="mb-4 font-medium">
					<Trans>Statistics summary</Trans>
				</h3>
				<div className="space-y-3">
					<div className="flex items-center justify-between">
						<span className="text-muted-foreground text-sm">
							<Trans>Total number of versions</Trans>
						</span>
						<Badge variant="secondary">{stats?.totalVersions ?? 0}</Badge>
					</div>
					<div className="flex items-center justify-between">
						<span className="text-muted-foreground text-sm">
							<Trans>Last modified</Trans>
						</span>
						<span className="text-sm">
							{stats?.lastModified
								? formatDate(stats.lastModified, {
										day: "2-digit",
										month: "long",
										year: "numeric",
										hour: "2-digit",
										minute: "2-digit",
									})
										.split(" ")
										.slice(0, 3)
										.join(" ")
								: "-"}
						</span>
					</div>
					<div className="flex items-center justify-between">
						<span className="text-muted-foreground text-sm">
							<Trans>Total size</Trans>
						</span>
						<span className="text-sm">{formatBytes(stats?.totalSize ?? 0)}</span>
					</div>
				</div>
			</div>

			<div className="rounded-lg border bg-card p-4">
				<h3 className="mb-4 font-medium">
					<Trans>Quick actions</Trans>
				</h3>
				<div className="space-y-2">
					<Button
						variant="outline"
						className="w-full justify-start"
						onClick={onExportCurrent}
						disabled={versions.length === 0}
					>
						<DownloadSimpleIcon />
						<Trans>Export current version</Trans>
					</Button>
					<Button
						variant="outline"
						className="w-full justify-start"
						onClick={onComparePrevious}
						disabled={versions.length < 2}
					>
						<EyeIcon />
						<Trans>Compare with previous version</Trans>
					</Button>
				</div>
			</div>

			{selectedVersion && !isCompareDialogOpen && (
				<motion.div
					initial={false}
					animate={{ opacity: 1, y: 0 }}
					className="rounded-lg border border-primary bg-primary/5 p-4"
				>
					<h3 className="mb-2 font-medium">
						<Trans>Selected version</Trans>
					</h3>
					<p className="text-sm">
						<Trans>Version</Trans> {selectedVersion.versionNumber}
					</p>
					<p className="text-muted-foreground text-xs">
						{formatDate(selectedVersion.createdAt, {
							day: "2-digit",
							month: "long",
							year: "numeric",
							hour: "2-digit",
							minute: "2-digit",
						})}
					</p>
					<p className="mt-2 text-muted-foreground text-sm">
						<Trans>Click on another version to compare</Trans>
					</p>
					<Button variant="ghost" size="sm" className="mt-2" onClick={onClearSelection}>
						<XIcon />
						<Trans>Cancel selection</Trans>
					</Button>
				</motion.div>
			)}
		</div>
	);
}

export function RestoreDialog({
	isOpen,
	onOpenChange,
	selectedVersion,
	isRestoring,
	onConfirm,
}: {
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
	selectedVersion: ResumeVersion | null;
	isRestoring: boolean;
	onConfirm: () => void;
}) {
	return (
		<Dialog open={isOpen} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>
						<Trans>Restore version</Trans>
					</DialogTitle>
					<DialogDescription>
						<Trans>Are you sure you want to restore version</Trans> {selectedVersion?.versionNumber}?{" "}
						<Trans>This action will create a new version with the restored content.</Trans>
					</DialogDescription>
				</DialogHeader>
				{selectedVersion && (
					<div className="rounded-lg border bg-muted/50 p-4">
						<p className="font-medium">
							<Trans>Version</Trans> {selectedVersion.versionNumber}
						</p>
						<p className="text-muted-foreground text-sm">
							{formatDate(selectedVersion.createdAt, {
								day: "2-digit",
								month: "long",
								year: "numeric",
								hour: "2-digit",
								minute: "2-digit",
							})}
						</p>
						<p className="mt-2 text-sm">{selectedVersion.note}</p>
					</div>
				)}
				<DialogFooter>
					<DialogClose asChild>
						<Button variant="outline">
							<Trans>Cancel</Trans>
						</Button>
					</DialogClose>
					<Button onClick={onConfirm} disabled={isRestoring}>
						{isRestoring ? <SpinnerIcon className="mr-2 size-4 animate-spin" /> : <ArrowCounterClockwiseIcon />}
						<Trans>Restore</Trans>
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

export function CompareDialog({
	isOpen,
	onOpenChange,
	selectedVersion,
	compareVersion,
	onRestore,
}: {
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
	selectedVersion: ResumeVersion | null;
	compareVersion: ResumeVersion | null;
	onRestore: (version: ResumeVersion) => void;
}) {
	return (
		<Dialog open={isOpen} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-5xl">
				<DialogHeader>
					<DialogTitle>
						<Trans>Version comparison</Trans>
					</DialogTitle>
					<DialogDescription>
						<Trans>Side-by-side comparison of changes between versions</Trans>
					</DialogDescription>
				</DialogHeader>

				{selectedVersion && compareVersion && (
					<Tabs defaultValue="side-by-side" className="w-full">
						<TabsList>
							<TabsTrigger value="side-by-side">
								<Trans>Side by side</Trans>
							</TabsTrigger>
							<TabsTrigger value="unified">
								<Trans>Unified view</Trans>
							</TabsTrigger>
						</TabsList>

						<TabsContent value="side-by-side" className="mt-4">
							<div className="grid grid-cols-2 gap-4">
								<ComparePanel version={selectedVersion} />
								<ComparePanel version={compareVersion} />
							</div>
						</TabsContent>

						<TabsContent value="unified" className="mt-4">
							<ScrollArea className="h-[400px] rounded-lg border p-4">
								<div className="space-y-4">
									<UnifiedChangeList version={compareVersion} variant="old" />
									<Separator />
									<UnifiedChangeList version={selectedVersion} variant="new" />
								</div>
							</ScrollArea>
						</TabsContent>
					</Tabs>
				)}

				<DialogFooter>
					<DialogClose asChild>
						<Button variant="outline">
							<Trans>Close</Trans>
						</Button>
					</DialogClose>
					{selectedVersion && compareVersion && selectedVersion.versionNumber < compareVersion.versionNumber && (
						<Button onClick={() => onRestore(selectedVersion)}>
							<ArrowCounterClockwiseIcon />
							<Trans>Restore version</Trans> {selectedVersion.versionNumber}
						</Button>
					)}
					{selectedVersion && compareVersion && selectedVersion.versionNumber > compareVersion.versionNumber && (
						<Button onClick={() => onRestore(compareVersion)}>
							<ArrowCounterClockwiseIcon />
							<Trans>Restore version</Trans> {compareVersion.versionNumber}
						</Button>
					)}
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

function ComparePanel({ version }: { version: ResumeVersion }) {
	return (
		<div className="rounded-lg border p-4">
			<div className="mb-4 flex items-center justify-between">
				<Badge variant="outline">
					<Trans>Version</Trans> {version.versionNumber}
				</Badge>
				<span className="text-muted-foreground text-xs">
					{formatDate(version.createdAt, {
						day: "2-digit",
						month: "long",
						year: "numeric",
						hour: "2-digit",
						minute: "2-digit",
					})}
				</span>
			</div>
			<ScrollArea className="h-[300px]">
				<div className="space-y-2">
					{version.changes.map((change, index) => (
						<div key={index} className="rounded border bg-muted/30 p-2">
							<p className="font-mono text-muted-foreground text-xs">{change.field}</p>
							{change.oldValue && <p className="mt-1 rounded bg-red-500/10 p-1 text-sm">{change.oldValue}</p>}
							{change.newValue && <p className="mt-1 rounded bg-green-500/10 p-1 text-sm">{change.newValue}</p>}
						</div>
					))}
				</div>
			</ScrollArea>
		</div>
	);
}

function UnifiedChangeList({ version, variant }: { version: ResumeVersion; variant: "old" | "new" }) {
	const isOld = variant === "old";
	const borderColor = isOld ? "border-red-500/30" : "border-green-500/30";
	const badgeClass = isOld ? "bg-red-500/10" : "bg-green-500/10";

	return (
		<div>
			<div className="mb-2 flex items-center gap-2">
				<Badge variant="outline" className={badgeClass}>
					<Trans>Version</Trans> {version.versionNumber}
				</Badge>
				<span className="text-muted-foreground text-xs">
					{formatDate(version.createdAt, {
						day: "2-digit",
						month: "long",
						year: "numeric",
						hour: "2-digit",
						minute: "2-digit",
					})}
				</span>
			</div>
			{version.changes.map((change, index) => (
				<div key={`${variant}-${index}`} className={cn("mb-2 border-l-2 pl-3", borderColor)}>
					<p className="font-mono text-muted-foreground text-xs">{change.field}</p>
					{change.oldValue && (
						<p className="rounded bg-red-500/10 p-1 text-red-600 text-sm dark:text-red-400">- {change.oldValue}</p>
					)}
					{change.newValue && (
						<p className="rounded bg-green-500/10 p-1 text-green-600 text-sm dark:text-green-400">
							+ {change.newValue}
						</p>
					)}
				</div>
			))}
		</div>
	);
}
