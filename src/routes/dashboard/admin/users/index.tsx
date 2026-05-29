import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import {
	ArrowLeftIcon,
	CheckCircleIcon,
	EyeIcon,
	MagnifyingGlassIcon,
	ShieldCheckIcon,
	TrashIcon,
	UserCircleIcon,
	UserIcon,
	WarningCircleIcon,
	XCircleIcon,
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { client, orpc } from "@/integrations/orpc/client";
import { DashboardHeader } from "../../-components/header";

type AdminUser = {
	id: string;
	name: string;
	email: string;
	username: string;
	role: "user" | "admin";
	emailVerified: boolean;
	createdAt: Date;
	resumeCount: number;
};

const searchSchema = z.object({
	page: z.number().optional().default(1),
	search: z.string().optional(),
});

export const Route = createFileRoute("/dashboard/admin/users/")({
	component: RouteComponent,
	pendingComponent: UserManagementSkeleton,
	validateSearch: searchSchema,
	loaderDeps: ({ search }) => ({ page: search.page, search: search.search }),
	errorComponent: ({ error, reset }) => (
		<div className="space-y-4">
			<DashboardHeader icon={UserCircleIcon} title={t`User Management`} />
			<div className="flex flex-col items-center justify-center rounded-xl border bg-background p-8">
				<WarningCircleIcon className="size-12 text-destructive" />
				<p className="mt-4 text-muted-foreground">
					<Trans>Failed to load users</Trans>
				</p>
				<p className="mt-2 text-muted-foreground text-sm">{error.message}</p>
				<Button onClick={reset} className="mt-4">
					Retry
				</Button>
			</div>
		</div>
	),
	loader: async ({ deps }) => {
		const result = await client.admin.users.list({
			page: deps.page,
			limit: 20,
			search: deps.search,
		});
		return result;
	},
});

function UserManagementSkeleton() {
	return (
		<div className="space-y-4">
			<DashboardHeader icon={UserCircleIcon} title={t`User Management`} />

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
									<Trans>User</Trans>
								</TableHead>
								<TableHead>
									<Trans>Role</Trans>
								</TableHead>
								<TableHead>
									<Trans>Verified</Trans>
								</TableHead>
								<TableHead>
									<Trans>Resumes</Trans>
								</TableHead>
								<TableHead>
									<Trans>Joined</Trans>
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
										<div className="space-y-2">
											<Skeleton className="h-4 w-32" />
											<Skeleton className="h-3 w-40" />
											<Skeleton className="h-3 w-24" />
										</div>
									</TableCell>
									<TableCell>
										<Skeleton className="h-6 w-16" />
									</TableCell>
									<TableCell>
										<Skeleton className="size-5 rounded-full" />
									</TableCell>
									<TableCell>
										<Skeleton className="h-4 w-8" />
									</TableCell>
									<TableCell>
										<Skeleton className="h-4 w-24" />
									</TableCell>
									<TableCell className="text-right">
										<div className="flex items-center justify-end gap-2">
											<Skeleton className="h-8 w-8" />
											<Skeleton className="h-8 w-24" />
											<Skeleton className="size-8" />
										</div>
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
	const { users, total, totalPages } = Route.useLoaderData();

	const [searchInput, setSearchInput] = useState(search ?? "");
	const [deleteUserId, setDeleteUserId] = useState<string | null>(null);
	const [roleChangeUser, setRoleChangeUser] = useState<{
		id: string;
		name: string;
		currentRole: "user" | "admin";
	} | null>(null);

	// Bulk selection state
	const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

	const { mutate: deleteUser } = useMutation(orpc.admin.users.delete.mutationOptions());
	const { mutate: updateRole } = useMutation(orpc.admin.users.updateRole.mutationOptions());
	const { mutate: bulkDeleteUsers } = useMutation(orpc.admin.users.bulkDelete.mutationOptions());
	const { mutate: bulkUpdateRole } = useMutation(orpc.admin.users.bulkUpdateRole.mutationOptions());

	const handleSearch = (e: React.FormEvent) => {
		e.preventDefault();
		navigate({
			to: "/dashboard/admin/users",
			search: { page: 1, search: searchInput || undefined },
		});
	};

	const handlePageChange = (newPage: number) => {
		navigate({
			to: "/dashboard/admin/users",
			search: { page: newPage, search },
		});
	};

	const handleDeleteUser = async () => {
		if (!deleteUserId) return;

		const toastId = toast.loading(t`Deleting user...`);
		deleteUser(
			{ userId: deleteUserId },
			{
				onSuccess: () => {
					toast.success(t`User deleted successfully`, { id: toastId });
					router.invalidate();
				},
				onError: (error) => {
					toast.error(error.message || t`Failed to delete user`, { id: toastId });
				},
			},
		);
		setDeleteUserId(null);
	};

	const handleRoleChange = async (newRole: "user" | "admin") => {
		if (!roleChangeUser) return;

		const toastId = toast.loading(t`Updating role...`);
		updateRole(
			{ userId: roleChangeUser.id, role: newRole },
			{
				onSuccess: () => {
					toast.success(t`Role updated successfully`, { id: toastId });
					router.invalidate();
				},
				onError: (error) => {
					toast.error(error.message || t`Failed to update role`, { id: toastId });
				},
			},
		);
		setRoleChangeUser(null);
	};

	const toggleSelectAll = () => {
		if (selectedIds.size === (users as AdminUser[]).length) {
			setSelectedIds(new Set());
		} else {
			setSelectedIds(new Set((users as AdminUser[]).map((u) => u.id)));
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
		const toastId = toast.loading(t`Deleting ${selectedIds.size} users...`);
		bulkDeleteUsers(
			{ userIds: Array.from(selectedIds) },
			{
				onSuccess: (data) => {
					toast.success(t`${data.deleted} users deleted`, { id: toastId });
					setSelectedIds(new Set());
					router.invalidate();
				},
				onError: (error) => {
					toast.error(error.message || t`Failed to delete users`, { id: toastId });
				},
			},
		);
	};

	const handleBulkRoleChange = (role: "user" | "admin") => {
		if (selectedIds.size === 0) return;
		const toastId = toast.loading(t`Updating roles...`);
		bulkUpdateRole(
			{ userIds: Array.from(selectedIds), role },
			{
				onSuccess: (data) => {
					toast.success(t`${data.updated} users updated`, { id: toastId });
					setSelectedIds(new Set());
					router.invalidate();
				},
				onError: (error) => {
					toast.error(error.message || t`Failed to update roles`, { id: toastId });
				},
			},
		);
	};

	return (
		<div className="space-y-4">
			<DashboardHeader icon={UserCircleIcon} title={t`User Management`} />

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
						{total} <Trans>total users</Trans>
					</p>
				</div>

				{/* Search */}
				<form onSubmit={handleSearch} className="flex gap-2">
					<div className="relative flex-1">
						<MagnifyingGlassIcon className="absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground" size={18} />
						<Input
							placeholder={t`Search by name, email, or username...`}
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
						<div className="flex gap-2">
							<Button size="sm" variant="outline" onClick={() => handleBulkRoleChange("admin")}>
								<Trans>Make Admin</Trans>
							</Button>
							<Button size="sm" variant="outline" onClick={() => handleBulkRoleChange("user")}>
								<Trans>Make User</Trans>
							</Button>
							<Button size="sm" variant="destructive" onClick={handleBulkDelete}>
								<TrashIcon size={14} className="mr-1" />
								<Trans>Delete Selected</Trans>
							</Button>
						</div>
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
										checked={selectedIds.size === (users as AdminUser[]).length && (users as AdminUser[]).length > 0}
										onChange={toggleSelectAll}
										className="size-4 rounded border-gray-300"
									/>
								</TableHead>
								<TableHead>
									<Trans>User</Trans>
								</TableHead>
								<TableHead>
									<Trans>Role</Trans>
								</TableHead>
								<TableHead>
									<Trans>Verified</Trans>
								</TableHead>
								<TableHead>
									<Trans>Resumes</Trans>
								</TableHead>
								<TableHead>
									<Trans>Joined</Trans>
								</TableHead>
								<TableHead className="text-right">
									<Trans>Actions</Trans>
								</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{(users as AdminUser[]).map((user) => (
								<TableRow key={user.id} className={selectedIds.has(user.id) ? "bg-blue-50/50" : undefined}>
									<TableCell>
										<input
											type="checkbox"
											checked={selectedIds.has(user.id)}
											onChange={() => toggleSelect(user.id)}
											className="size-4 rounded border-gray-300"
										/>
									</TableCell>
									<TableCell>
										<div>
											<p className="font-medium">{user.name}</p>
											<p className="text-muted-foreground text-sm">{user.email}</p>
											<p className="text-muted-foreground text-xs">@{user.username}</p>
										</div>
									</TableCell>
									<TableCell>
										<Badge variant={user.role === "admin" ? "default" : "secondary"}>
											{user.role === "admin" ? (
												<ShieldCheckIcon className="mr-1" size={14} />
											) : (
												<UserIcon className="mr-1" size={14} />
											)}
											{user.role}
										</Badge>
									</TableCell>
									<TableCell>
										{user.emailVerified ? (
											<CheckCircleIcon size={20} className="text-green-600" />
										) : (
											<XCircleIcon size={20} className="text-muted-foreground" />
										)}
									</TableCell>
									<TableCell>{user.resumeCount}</TableCell>
									<TableCell suppressHydrationWarning>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
									<TableCell className="text-right">
										<div className="flex items-center justify-end gap-2">
											<Link
												to="/dashboard/admin/users/$userId"
												params={{ userId: user.id }}
												className="inline-flex items-center justify-center rounded-md p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
											>
												<EyeIcon size={18} />
											</Link>
											<Select
												value={user.role}
												onValueChange={() =>
													setRoleChangeUser({
														id: user.id,
														name: user.name,
														currentRole: user.role,
													})
												}
											>
												<SelectTrigger className="h-8 w-24">
													<SelectValue />
												</SelectTrigger>
												<SelectContent>
													<SelectItem value="user">User</SelectItem>
													<SelectItem value="admin">Admin</SelectItem>
												</SelectContent>
											</Select>
											<Button
												variant="ghost"
												size="icon"
												className="text-destructive hover:text-destructive"
												onClick={() => setDeleteUserId(user.id)}
											>
												<TrashIcon size={18} />
											</Button>
										</div>
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
			<AlertDialog open={!!deleteUserId} onOpenChange={() => setDeleteUserId(null)}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>
							<Trans>Delete User</Trans>
						</AlertDialogTitle>
						<AlertDialogDescription>
							<Trans>
								Are you sure you want to delete this user? This action cannot be undone and will permanently delete the
								user and all their resumes.
							</Trans>
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>
							<Trans>Cancel</Trans>
						</AlertDialogCancel>
						<AlertDialogAction
							className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
							onClick={handleDeleteUser}
						>
							<Trans>Delete</Trans>
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>

			{/* Role Change Dialog */}
			<AlertDialog open={!!roleChangeUser} onOpenChange={() => setRoleChangeUser(null)}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>
							<Trans>Change User Role</Trans>
						</AlertDialogTitle>
						<AlertDialogDescription>
							{roleChangeUser && (
								<Trans>
									Change {roleChangeUser.name}'s role from {roleChangeUser.currentRole}?
								</Trans>
							)}
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>
							<Trans>Cancel</Trans>
						</AlertDialogCancel>
						{roleChangeUser?.currentRole === "user" ? (
							<AlertDialogAction onClick={() => handleRoleChange("admin")}>
								<Trans>Make Admin</Trans>
							</AlertDialogAction>
						) : (
							<AlertDialogAction onClick={() => handleRoleChange("user")}>
								<Trans>Remove Admin</Trans>
							</AlertDialogAction>
						)}
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
