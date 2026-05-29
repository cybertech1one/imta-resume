import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import {
	ArrowLeftIcon,
	DownloadSimpleIcon,
	EyeIcon,
	FileIcon,
	GlobeIcon,
	LockIcon,
	MagnifyingGlassIcon,
	TrashIcon,
	WarningCircleIcon,
} from "@phosphor-icons/react";
import { useMutation } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import z from "zod";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { client, orpc } from "@/integrations/orpc/client";
import { DashboardHeader } from "../../-components/header";

type AdminResume = {
	id: string;
	name: string;
	slug: string;
	isPublic: boolean;
	isLocked: boolean;
	createdAt: Date;
	userId: string;
	userName: string;
	userEmail: string;
	views: number | null;
	downloads: number | null;
};

const searchSchema = z.object({
	page: z.number().optional().default(1),
	search: z.string().optional(),
});

export const Route = createFileRoute("/dashboard/admin/resumes/")({
	component: RouteComponent,
	pendingComponent: ResumeManagementSkeleton,
	validateSearch: searchSchema,
	loaderDeps: ({ search }) => ({ page: search.page, search: search.search }),
	errorComponent: ({ error, reset }) => (
		<div className="space-y-4">
			<DashboardHeader icon={FileIcon} title={t`Resume Management`} />
			<div className="flex flex-col items-center justify-center rounded-xl border bg-background p-8">
				<WarningCircleIcon className="size-12 text-destructive" />
				<p className="mt-4 text-muted-foreground">
					<Trans>Failed to load resumes</Trans>
				</p>
				<p className="mt-2 text-muted-foreground text-sm">{error.message}</p>
				<Button onClick={reset} className="mt-4">
					Retry
				</Button>
			</div>
		</div>
	),
	loader: async ({ deps }) => {
		const result = await client.admin.resumes.list({
			page: deps.page,
			limit: 20,
			search: deps.search,
		});
		return result;
	},
});

function ResumeManagementSkeleton() {
	return (
		<div className="space-y-4">
			<DashboardHeader icon={FileIcon} title={t`Resume Management`} />

			<div className="space-y-6 rounded-xl border bg-background p-6">
				<div className="flex items-center gap-4">
					<Skeleton className="size-10 rounded-lg" />
					<Skeleton className="h-4 w-32" />
				</div>

				<div className="flex gap-2">
					<Skeleton className="h-10 flex-1" />
					<Skeleton className="h-10 w-24" />
				</div>

				<div className="overflow-x-auto rounded-lg border">
					<Table className="min-w-[800px]">
						<TableHeader>
							<TableRow>
								<TableHead className="w-10" />
								<TableHead>
									<Trans>Resume</Trans>
								</TableHead>
								<TableHead>
									<Trans>Owner</Trans>
								</TableHead>
								<TableHead>
									<Trans>Status</Trans>
								</TableHead>
								<TableHead>
									<Trans>Stats</Trans>
								</TableHead>
								<TableHead>
									<Trans>Created</Trans>
								</TableHead>
								<TableHead className="text-right">
									<Trans>Actions</Trans>
								</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{Array.from({ length: 8 }).map((_, i) => (
								<TableRow key={i}>
									<TableCell>
										<Skeleton className="size-4" />
									</TableCell>
									<TableCell>
										<div className="space-y-1">
											<Skeleton className="h-4 w-32" />
											<Skeleton className="h-3 w-20" />
										</div>
									</TableCell>
									<TableCell>
										<div className="space-y-1">
											<Skeleton className="h-4 w-28" />
											<Skeleton className="h-3 w-36" />
										</div>
									</TableCell>
									<TableCell>
										<div className="flex gap-1">
											<Skeleton className="h-6 w-16" />
										</div>
									</TableCell>
									<TableCell>
										<div className="flex gap-3">
											<Skeleton className="h-4 w-12" />
											<Skeleton className="h-4 w-12" />
										</div>
									</TableCell>
									<TableCell>
										<Skeleton className="h-4 w-24" />
									</TableCell>
									<TableCell className="text-right">
										<Skeleton className="ml-auto size-8" />
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</div>
			</div>
		</div>
	);
}

function RouteComponent() {
	const navigate = useNavigate();
	const router = useRouter();
	const { page, search } = Route.useSearch();
	const { resumes, total, totalPages } = Route.useLoaderData();

	const [searchInput, setSearchInput] = useState(search ?? "");
	const [deleteResumeId, setDeleteResumeId] = useState<string | null>(null);
	const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

	const { mutate: deleteResume } = useMutation(orpc.admin.resumes.delete.mutationOptions());
	const { mutate: bulkDeleteResumes } = useMutation(orpc.admin.resumes.bulkDelete.mutationOptions());

	const handleSearch = (e: React.FormEvent) => {
		e.preventDefault();
		navigate({
			to: "/dashboard/admin/resumes",
			search: { page: 1, search: searchInput || undefined },
		});
	};

	const handlePageChange = (newPage: number) => {
		navigate({
			to: "/dashboard/admin/resumes",
			search: { page: newPage, search },
		});
	};

	const handleDeleteResume = async () => {
		if (!deleteResumeId) return;

		const toastId = toast.loading(t`Deleting resume...`);
		deleteResume(
			{ resumeId: deleteResumeId },
			{
				onSuccess: () => {
					toast.success(t`Resume deleted successfully`, { id: toastId });
					router.invalidate();
				},
				onError: (error) => {
					toast.error(error.message || t`Failed to delete resume`, { id: toastId });
				},
			},
		);
		setDeleteResumeId(null);
	};

	const toggleSelectAll = () => {
		if (selectedIds.size === (resumes as AdminResume[]).length) {
			setSelectedIds(new Set());
		} else {
			setSelectedIds(new Set((resumes as AdminResume[]).map((r) => r.id)));
		}
	};

	const toggleSelect = (id: string) => {
		const next = new Set(selectedIds);
		if (next.has(id)) next.delete(id);
		else next.add(id);
		setSelectedIds(next);
	};

	const handleBulkDelete = () => {
		if (selectedIds.size === 0) return;
		const toastId = toast.loading(t`Deleting ${selectedIds.size} resumes...`);
		bulkDeleteResumes(
			{ resumeIds: Array.from(selectedIds) },
			{
				onSuccess: (data) => {
					toast.success(t`${data.deleted} resumes deleted`, { id: toastId });
					setSelectedIds(new Set());
					router.invalidate();
				},
				onError: (error) => {
					toast.error(error.message || t`Failed to delete resumes`, { id: toastId });
				},
			},
		);
	};

	return (
		<div className="space-y-4">
			<DashboardHeader icon={FileIcon} title={t`Resume Management`} />

			<div className="space-y-6 rounded-xl border bg-background p-6">
				{/* Header */}
				<div className="flex items-center gap-4">
					<Link
						to="/dashboard/admin"
						className="inline-flex items-center justify-center rounded-lg border p-2 transition-colors hover:bg-muted"
					>
						<ArrowLeftIcon size={20} />
					</Link>
					<p className="text-muted-foreground text-sm">
						{total} <Trans>total resumes</Trans>
					</p>
				</div>

				{/* Search */}
				<form onSubmit={handleSearch} className="flex gap-2">
					<div className="relative flex-1">
						<MagnifyingGlassIcon className="absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground" size={18} />
						<Input
							placeholder={t`Search by resume name or user name...`}
							value={searchInput}
							onChange={(e) => setSearchInput(e.target.value)}
							className="pl-10"
						/>
					</div>
					<Button type="submit">
						<Trans>Search</Trans>
					</Button>
				</form>

				{/* Bulk Actions */}
				{selectedIds.size > 0 && (
					<div className="flex items-center gap-3 rounded-lg border border-blue-200 bg-blue-50 p-3">
						<span className="font-medium text-blue-700 text-sm">
							{selectedIds.size} <Trans>selected</Trans>
						</span>
						<Button size="sm" variant="destructive" onClick={handleBulkDelete}>
							<TrashIcon size={14} className="mr-1" />
							<Trans>Delete Selected</Trans>
						</Button>
						<Button size="sm" variant="ghost" onClick={() => setSelectedIds(new Set())} className="ml-auto">
							<Trans>Clear</Trans>
						</Button>
					</div>
				)}

				{/* Table */}
				<div className="overflow-x-auto rounded-lg border">
					<Table className="min-w-[800px]">
						<TableHeader>
							<TableRow>
								<TableHead className="w-10">
									<input
										type="checkbox"
										checked={
											selectedIds.size === (resumes as AdminResume[]).length && (resumes as AdminResume[]).length > 0
										}
										onChange={toggleSelectAll}
										className="size-4 rounded border-gray-300"
									/>
								</TableHead>
								<TableHead>
									<Trans>Resume</Trans>
								</TableHead>
								<TableHead>
									<Trans>Owner</Trans>
								</TableHead>
								<TableHead>
									<Trans>Status</Trans>
								</TableHead>
								<TableHead>
									<Trans>Stats</Trans>
								</TableHead>
								<TableHead>
									<Trans>Created</Trans>
								</TableHead>
								<TableHead className="text-right">
									<Trans>Actions</Trans>
								</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{(resumes as AdminResume[]).map((resume) => (
								<TableRow key={resume.id} className={selectedIds.has(resume.id) ? "bg-blue-50/50" : undefined}>
									<TableCell>
										<input
											type="checkbox"
											checked={selectedIds.has(resume.id)}
											onChange={() => toggleSelect(resume.id)}
											className="size-4 rounded border-gray-300"
										/>
									</TableCell>
									<TableCell>
										<div>
											<p className="font-medium">{resume.name}</p>
											<p className="text-muted-foreground text-xs">/{resume.slug}</p>
										</div>
									</TableCell>
									<TableCell>
										<div>
											<Link
												to="/dashboard/admin/users/$userId"
												params={{ userId: resume.userId }}
												className="font-medium text-sm hover:underline"
											>
												{resume.userName}
											</Link>
											<p className="text-muted-foreground text-xs">{resume.userEmail}</p>
										</div>
									</TableCell>
									<TableCell>
										<div className="flex flex-wrap gap-1">
											{resume.isPublic ? (
												<Badge variant="secondary" className="gap-1">
													<GlobeIcon size={12} />
													Public
												</Badge>
											) : (
												<Badge variant="outline" className="gap-1">
													<LockIcon size={12} />
													Private
												</Badge>
											)}
											{resume.isLocked && (
												<Badge variant="destructive" className="gap-1">
													<LockIcon size={12} />
													Locked
												</Badge>
											)}
										</div>
									</TableCell>
									<TableCell>
										<div className="flex items-center gap-3 text-sm">
											<span className="flex items-center gap-1 text-muted-foreground">
												<EyeIcon size={14} />
												{resume.views ?? 0}
											</span>
											<span className="flex items-center gap-1 text-muted-foreground">
												<DownloadSimpleIcon size={14} />
												{resume.downloads ?? 0}
											</span>
										</div>
									</TableCell>
									<TableCell>
										<p suppressHydrationWarning className="text-sm">
											{new Date(resume.createdAt).toLocaleDateString()}
										</p>
									</TableCell>
									<TableCell className="text-right">
										<Button
											variant="ghost"
											size="icon"
											className="text-destructive hover:text-destructive"
											onClick={() => setDeleteResumeId(resume.id)}
										>
											<TrashIcon size={18} />
										</Button>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</div>

				{/* Pagination */}
				{totalPages > 1 && (
					<div className="flex items-center justify-between">
						<p className="text-muted-foreground text-sm">
							<Trans>
								Page {page} of {totalPages}
							</Trans>
						</p>
						<div className="flex gap-2">
							<Button variant="outline" size="sm" disabled={page <= 1} onClick={() => handlePageChange(page - 1)}>
								<Trans>Previous</Trans>
							</Button>
							<Button
								variant="outline"
								size="sm"
								disabled={page >= totalPages}
								onClick={() => handlePageChange(page + 1)}
							>
								<Trans>Next</Trans>
							</Button>
						</div>
					</div>
				)}
			</div>

			{/* Delete Confirmation Dialog */}
			<AlertDialog open={!!deleteResumeId} onOpenChange={() => setDeleteResumeId(null)}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>
							<Trans>Delete Resume</Trans>
						</AlertDialogTitle>
						<AlertDialogDescription>
							<Trans>Are you sure you want to delete this resume? This action cannot be undone.</Trans>
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>
							<Trans>Cancel</Trans>
						</AlertDialogCancel>
						<AlertDialogAction
							className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
							onClick={handleDeleteResume}
						>
							<Trans>Delete</Trans>
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
