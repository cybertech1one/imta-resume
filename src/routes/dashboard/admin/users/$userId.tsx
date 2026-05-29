import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import {
	ArrowLeftIcon,
	CalendarIcon,
	CheckCircleIcon,
	ClockIcon,
	DownloadSimpleIcon,
	EnvelopeSimpleIcon,
	EyeIcon,
	FileIcon,
	GlobeIcon,
	LockIcon,
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { authClient } from "@/integrations/auth/client";
import { client, orpc } from "@/integrations/orpc/client";
import { DashboardHeader } from "../../-components/header";
import { AccountAdminPanel } from "./-components/account-admin-panel";

export const Route = createFileRoute("/dashboard/admin/users/$userId")({
	component: RouteComponent,
	pendingComponent: UserDetailSkeleton,
	errorComponent: ({ error, reset }) => (
		<div className="space-y-4">
			<DashboardHeader icon={UserCircleIcon} title={t`User Details`} />
			<div className="flex flex-col items-center justify-center rounded-xl border bg-background p-8">
				<WarningCircleIcon className="size-12 text-destructive" />
				<p className="mt-4 text-muted-foreground">
					<Trans>Failed to load user details</Trans>
				</p>
				<p className="mt-2 text-muted-foreground text-sm">{error.message}</p>
				<Button onClick={reset} className="mt-4">
					Retry
				</Button>
			</div>
		</div>
	),
	loader: async ({ params }) => {
		const user = await client.admin.users.getById({ userId: params.userId });
		if (!user) throw new Error("User not found");
		return user;
	},
});

function UserDetailSkeleton() {
	return (
		<div className="space-y-4">
			<DashboardHeader icon={UserCircleIcon} title={t`User Details`} />
			<div className="space-y-6 rounded-xl border bg-background p-6">
				<div className="flex items-center gap-4">
					<Skeleton className="size-10 rounded-lg" />
					<Skeleton className="h-6 w-48" />
				</div>
				<div className="grid gap-6 md:grid-cols-2">
					<Skeleton className="h-48 rounded-xl" />
					<Skeleton className="h-48 rounded-xl" />
				</div>
				<Skeleton className="h-64 rounded-xl" />
			</div>
		</div>
	);
}

function RouteComponent() {
	const user = Route.useLoaderData();
	const navigate = useNavigate();
	const router = useRouter();
	const { data: session } = authClient.useSession();
	const isSelf = session?.user?.id === user.id;

	const [showDeleteDialog, setShowDeleteDialog] = useState(false);
	const [roleChangeTarget, setRoleChangeTarget] = useState<"user" | "admin" | null>(null);

	const { mutate: deleteUser } = useMutation(orpc.admin.users.delete.mutationOptions());
	const { mutate: updateRole } = useMutation(orpc.admin.users.updateRole.mutationOptions());

	const handleDelete = () => {
		const toastId = toast.loading(t`Deleting user...`);
		deleteUser(
			{ userId: user.id },
			{
				onSuccess: () => {
					toast.success(t`User deleted successfully`, { id: toastId });
					navigate({ to: "/dashboard/admin/users" });
				},
				onError: (error) => {
					toast.error(error.message || t`Failed to delete user`, { id: toastId });
				},
			},
		);
		setShowDeleteDialog(false);
	};

	const handleRoleChange = (newRole: "user" | "admin") => {
		const toastId = toast.loading(t`Updating role...`);
		updateRole(
			{ userId: user.id, role: newRole },
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
		setRoleChangeTarget(null);
	};

	const totalViews = user.resumes.reduce((sum, r) => sum + (r.views ?? 0), 0);
	const totalDownloads = user.resumes.reduce((sum, r) => sum + (r.downloads ?? 0), 0);

	return (
		<div className="space-y-4">
			<DashboardHeader icon={UserCircleIcon} title={t`User Details`} />

			<div className="@container space-y-6 rounded-xl border bg-background p-6">
				{/* Back + User Name */}
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-4">
						<Link
							to="/dashboard/admin/users"
							className="inline-flex items-center justify-center rounded-lg border p-2 transition-colors hover:bg-muted"
						>
							<ArrowLeftIcon size={20} />
						</Link>
						<div>
							<h2 className="font-semibold text-xl">{user.name}</h2>
							<p className="text-muted-foreground text-sm">@{user.displayUsername}</p>
						</div>
					</div>
					<div className="flex items-center gap-2">
						<Select value={user.role} onValueChange={(val) => setRoleChangeTarget(val as "user" | "admin")}>
							<SelectTrigger className="w-28">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="user">User</SelectItem>
								<SelectItem value="admin">Admin</SelectItem>
							</SelectContent>
						</Select>
						<Button variant="destructive" size="sm" onClick={() => setShowDeleteDialog(true)}>
							<TrashIcon size={16} className="mr-1" />
							<Trans>Delete</Trans>
						</Button>
					</div>
				</div>

				{/* User Info Cards */}
				<div className="grid @md:grid-cols-2 @xl:grid-cols-4 gap-4">
					{/* Profile Card */}
					<div className="col-span-2 rounded-xl border bg-card p-5">
						<h3 className="mb-4 font-semibold text-muted-foreground text-sm uppercase tracking-wider">
							<Trans>Profile Information</Trans>
						</h3>
						<div className="space-y-3">
							<div className="flex items-center gap-3">
								<EnvelopeSimpleIcon size={16} className="text-muted-foreground" />
								<span className="text-sm">{user.email}</span>
								{user.emailVerified ? (
									<Badge variant="secondary" className="gap-1">
										<CheckCircleIcon size={12} /> Verified
									</Badge>
								) : (
									<Badge variant="outline" className="gap-1">
										<XCircleIcon size={12} /> Unverified
									</Badge>
								)}
							</div>
							<div className="flex items-center gap-3">
								{user.role === "admin" ? (
									<ShieldCheckIcon size={16} className="text-muted-foreground" />
								) : (
									<UserIcon size={16} className="text-muted-foreground" />
								)}
								<Badge variant={user.role === "admin" ? "default" : "secondary"}>{user.role}</Badge>
								{user.twoFactorEnabled && (
									<Badge variant="secondary" className="gap-1">
										<ShieldCheckIcon size={12} /> 2FA
									</Badge>
								)}
							</div>
							<div className="flex items-center gap-3">
								<CalendarIcon size={16} className="text-muted-foreground" />
								<span className="text-sm">
									<Trans>Joined</Trans> {new Date(user.createdAt).toLocaleDateString()}
								</span>
							</div>
							<div className="flex items-center gap-3">
								<ClockIcon size={16} className="text-muted-foreground" />
								<span className="text-sm">
									<Trans>Last active</Trans>{" "}
									{user.lastActiveAt ? new Date(user.lastActiveAt).toLocaleDateString() : t`Never`}
								</span>
							</div>
						</div>
					</div>

					{/* Stats Cards */}
					<div className="rounded-xl border bg-card p-5">
						<h3 className="mb-3 font-semibold text-muted-foreground text-sm uppercase tracking-wider">
							<Trans>Activity</Trans>
						</h3>
						<div className="space-y-3">
							<div className="flex items-center justify-between">
								<span className="text-muted-foreground text-sm">
									<Trans>Resumes</Trans>
								</span>
								<span className="font-semibold">{user.resumes.length}</span>
							</div>
							<div className="flex items-center justify-between">
								<span className="text-muted-foreground text-sm">
									<Trans>Sessions</Trans>
								</span>
								<span className="font-semibold">{user.sessionCount}</span>
							</div>
							<div className="flex items-center justify-between">
								<span className="text-muted-foreground text-sm">
									<Trans>Active Sessions</Trans>
								</span>
								<span className="font-semibold">{user.activeSessionCount}</span>
							</div>
						</div>
					</div>

					<div className="rounded-xl border bg-card p-5">
						<h3 className="mb-3 font-semibold text-muted-foreground text-sm uppercase tracking-wider">
							<Trans>Engagement</Trans>
						</h3>
						<div className="space-y-3">
							<div className="flex items-center justify-between">
								<span className="flex items-center gap-1.5 text-muted-foreground text-sm">
									<EyeIcon size={14} /> <Trans>Views</Trans>
								</span>
								<span className="font-semibold">{totalViews}</span>
							</div>
							<div className="flex items-center justify-between">
								<span className="flex items-center gap-1.5 text-muted-foreground text-sm">
									<DownloadSimpleIcon size={14} /> <Trans>Downloads</Trans>
								</span>
								<span className="font-semibold">{totalDownloads}</span>
							</div>
							<div className="flex items-center justify-between">
								<span className="flex items-center gap-1.5 text-muted-foreground text-sm">
									<GlobeIcon size={14} /> <Trans>Public</Trans>
								</span>
								<span className="font-semibold">{user.resumes.filter((r) => r.isPublic).length}</span>
							</div>
						</div>
					</div>
				</div>

				{/* Resumes Table */}
				<div className="rounded-xl border bg-card p-5">
					<h3 className="mb-4 font-semibold text-lg">
						<Trans>Resumes</Trans>
						<span className="ml-2 text-muted-foreground text-sm">({user.resumes.length})</span>
					</h3>

					{user.resumes.length === 0 ? (
						<div className="flex flex-col items-center justify-center py-8">
							<FileIcon size={40} className="text-muted-foreground" />
							<p className="mt-3 text-muted-foreground text-sm">
								<Trans>This user has no resumes yet</Trans>
							</p>
						</div>
					) : (
						<div className="overflow-x-auto rounded-lg border">
							<Table className="min-w-[700px]">
								<TableHeader>
									<TableRow>
										<TableHead>
											<Trans>Resume</Trans>
										</TableHead>
										<TableHead>
											<Trans>Status</Trans>
										</TableHead>
										<TableHead>
											<Trans>Stats</Trans>
										</TableHead>
										<TableHead>
											<Trans>Last Updated</Trans>
										</TableHead>
										<TableHead>
											<Trans>Created</Trans>
										</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{user.resumes.map((resume) => (
										<TableRow key={resume.id}>
											<TableCell>
												<div>
													<p className="font-medium">{resume.name}</p>
													<p className="text-muted-foreground text-xs">/{resume.slug}</p>
												</div>
											</TableCell>
											<TableCell>
												<div className="flex flex-wrap gap-1">
													{resume.isPublic ? (
														<Badge variant="secondary" className="gap-1">
															<GlobeIcon size={12} /> Public
														</Badge>
													) : (
														<Badge variant="outline" className="gap-1">
															<LockIcon size={12} /> Private
														</Badge>
													)}
													{resume.isLocked && (
														<Badge variant="destructive" className="gap-1">
															<LockIcon size={12} /> Locked
														</Badge>
													)}
												</div>
											</TableCell>
											<TableCell>
												<div className="flex items-center gap-3 text-sm">
													<span className="flex items-center gap-1 text-muted-foreground">
														<EyeIcon size={14} /> {resume.views ?? 0}
													</span>
													<span className="flex items-center gap-1 text-muted-foreground">
														<DownloadSimpleIcon size={14} /> {resume.downloads ?? 0}
													</span>
												</div>
											</TableCell>
											<TableCell>
												<p className="text-sm">{new Date(resume.updatedAt).toLocaleDateString()}</p>
											</TableCell>
											<TableCell>
												<p className="text-sm">{new Date(resume.createdAt).toLocaleDateString()}</p>
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</div>
					)}
				</div>

				{/* Account / Administration Panel */}
				<AccountAdminPanel
					user={{
						id: user.id,
						name: user.name,
						email: user.email,
						username: user.username,
						emailVerified: user.emailVerified,
						imtaProgram: user.imtaProgram,
						banned: user.banned,
						banReason: user.banReason,
						banExpiresAt: user.banExpiresAt,
					}}
					isSelf={isSelf}
				/>
			</div>

			{/* Delete Confirmation */}
			<AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>
							<Trans>Delete User</Trans>
						</AlertDialogTitle>
						<AlertDialogDescription>
							<Trans>
								Are you sure you want to delete {user.name}? This will permanently delete the user, all their resumes (
								{user.resumes.length}), and all associated data. This action cannot be undone.
							</Trans>
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>
							<Trans>Cancel</Trans>
						</AlertDialogCancel>
						<AlertDialogAction
							className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
							onClick={handleDelete}
						>
							<Trans>Delete</Trans>
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>

			{/* Role Change Confirmation */}
			<AlertDialog open={!!roleChangeTarget} onOpenChange={() => setRoleChangeTarget(null)}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>
							<Trans>Change Role</Trans>
						</AlertDialogTitle>
						<AlertDialogDescription>
							<Trans>
								Change {user.name}'s role from {user.role} to {roleChangeTarget}?
							</Trans>
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>
							<Trans>Cancel</Trans>
						</AlertDialogCancel>
						<AlertDialogAction onClick={() => roleChangeTarget && handleRoleChange(roleChangeTarget)}>
							<Trans>Confirm</Trans>
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
