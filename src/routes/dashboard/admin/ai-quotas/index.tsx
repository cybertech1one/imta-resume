import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import {
	ArrowLeftIcon,
	CheckCircleIcon,
	PencilSimpleIcon,
	PlusIcon,
	ScalesIcon,
	TrashIcon,
	WarningCircleIcon,
	XCircleIcon,
} from "@phosphor-icons/react";
import { useMutation } from "@tanstack/react-query";
import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
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
import { Checkbox } from "@/components/ui/checkbox";
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
import { Skeleton } from "@/components/ui/skeleton";
import { client, orpc } from "@/integrations/orpc/client";
import { DashboardHeader } from "../../-components/header";

type QuotaPlan = {
	id: string;
	name: string;
	description: string | null;
	dailyRequestLimit: number | null;
	monthlyRequestLimit: number | null;
	dailyTokenLimit: number | null;
	monthlyTokenLimit: number | null;
	maxTokensPerRequest: number | null;
	allowedFeatures: string[] | null;
	isDefault: boolean;
	isActive: boolean;
	createdAt: string;
	updatedAt: string;
};

type QuotaFormData = {
	name: string;
	description: string;
	dailyRequests: number;
	monthlyRequests: number;
	dailyTokens: number;
	monthlyTokens: number;
	maxTokensPerRequest: number;
	allowedFeatures: string;
	isDefault: boolean;
	isActive: boolean;
};

const DEFAULT_FORM_DATA: QuotaFormData = {
	name: "",
	description: "",
	dailyRequests: 100,
	monthlyRequests: 3000,
	dailyTokens: 100000,
	monthlyTokens: 3000000,
	maxTokensPerRequest: 4096,
	allowedFeatures: "",
	isDefault: false,
	isActive: true,
};

export const Route = createFileRoute("/dashboard/admin/ai-quotas/")({
	component: RouteComponent,
	pendingComponent: AIQuotaManagementSkeleton,
	errorComponent: ({ error, reset }) => (
		<div className="space-y-4">
			<DashboardHeader icon={ScalesIcon} title={t`AI Quota Management`} />
			<div className="flex flex-col items-center justify-center rounded-xl border bg-background p-8">
				<WarningCircleIcon className="size-12 text-destructive" aria-hidden="true" />
				<p className="mt-4 text-muted-foreground">
					<Trans>Failed to load AI quotas</Trans>
				</p>
				<p className="mt-2 text-muted-foreground text-sm">{error.message}</p>
				<Button onClick={reset} className="mt-4">
					Retry
				</Button>
			</div>
		</div>
	),
	loader: async () => {
		return await client.aiConfig.quotas.list();
	},
});

function AIQuotaManagementSkeleton() {
	return (
		<div className="space-y-4">
			<DashboardHeader icon={ScalesIcon} title={t`AI Quota Management`} />

			<div className="space-y-6 rounded-xl border bg-background p-6">
				<div className="flex items-center gap-4">
					<Skeleton className="size-10 rounded-lg" />
					<Skeleton className="h-4 w-48" />
				</div>

				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{Array.from({ length: 3 }).map((_, i) => (
						<Skeleton key={i} className="h-64 rounded-xl" />
					))}
				</div>

				<Skeleton className="h-48 rounded-xl" />
			</div>
		</div>
	);
}

function QuotaFormDialog({
	open,
	onOpenChange,
	initialData,
	onSubmit,
	isEdit,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	initialData: QuotaFormData;
	onSubmit: (data: QuotaFormData) => void;
	isEdit: boolean;
}) {
	const [formData, setFormData] = useState<QuotaFormData>(initialData);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		onSubmit(formData);
	};

	const updateField = <K extends keyof QuotaFormData>(key: K, value: QuotaFormData[K]) => {
		setFormData((prev) => ({ ...prev, [key]: value }));
	};

	const handleOpenChange = (nextOpen: boolean) => {
		if (nextOpen) {
			setFormData(initialData);
		}
		onOpenChange(nextOpen);
	};

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>{isEdit ? <Trans>Edit Quota Plan</Trans> : <Trans>Create Quota Plan</Trans>}</DialogTitle>
					<DialogDescription>
						{isEdit ? (
							<Trans>Update the quota plan configuration.</Trans>
						) : (
							<Trans>Create a new quota plan to manage AI usage limits.</Trans>
						)}
					</DialogDescription>
				</DialogHeader>

				<form
					onSubmit={handleSubmit}
					className="space-y-4"
					aria-label={isEdit ? t`Edit quota plan form` : t`Create quota plan form`}
				>
					<div className="grid gap-4 sm:grid-cols-2">
						{/* Plan Name */}
						<div className="space-y-2">
							<Label htmlFor="name">
								<Trans>Plan Name</Trans>
							</Label>
							<Input
								id="name"
								value={formData.name}
								onChange={(e) => updateField("name", e.target.value)}
								placeholder={t`e.g., Free Tier, Pro Plan`}
								required
								aria-required="true"
							/>
						</div>

						{/* Description */}
						<div className="space-y-2">
							<Label htmlFor="description">
								<Trans>Description</Trans>
							</Label>
							<Input
								id="description"
								value={formData.description}
								onChange={(e) => updateField("description", e.target.value)}
								placeholder={t`Brief description of this plan`}
							/>
						</div>

						{/* Daily Requests */}
						<div className="space-y-2">
							<Label htmlFor="dailyRequests">
								<Trans>Daily Requests</Trans>
							</Label>
							<Input
								id="dailyRequests"
								type="number"
								value={formData.dailyRequests}
								onChange={(e) => updateField("dailyRequests", Number(e.target.value))}
								min={0}
								required
								aria-required="true"
							/>
						</div>

						{/* Monthly Requests */}
						<div className="space-y-2">
							<Label htmlFor="monthlyRequests">
								<Trans>Monthly Requests</Trans>
							</Label>
							<Input
								id="monthlyRequests"
								type="number"
								value={formData.monthlyRequests}
								onChange={(e) => updateField("monthlyRequests", Number(e.target.value))}
								min={0}
								required
								aria-required="true"
							/>
						</div>

						{/* Daily Tokens */}
						<div className="space-y-2">
							<Label htmlFor="dailyTokens">
								<Trans>Daily Tokens</Trans>
							</Label>
							<Input
								id="dailyTokens"
								type="number"
								value={formData.dailyTokens}
								onChange={(e) => updateField("dailyTokens", Number(e.target.value))}
								min={0}
								required
								aria-required="true"
							/>
						</div>

						{/* Monthly Tokens */}
						<div className="space-y-2">
							<Label htmlFor="monthlyTokens">
								<Trans>Monthly Tokens</Trans>
							</Label>
							<Input
								id="monthlyTokens"
								type="number"
								value={formData.monthlyTokens}
								onChange={(e) => updateField("monthlyTokens", Number(e.target.value))}
								min={0}
								required
								aria-required="true"
							/>
						</div>

						{/* Max Tokens Per Request */}
						<div className="space-y-2">
							<Label htmlFor="maxTokensPerRequest">
								<Trans>Max Tokens Per Request</Trans>
							</Label>
							<Input
								id="maxTokensPerRequest"
								type="number"
								value={formData.maxTokensPerRequest}
								onChange={(e) => updateField("maxTokensPerRequest", Number(e.target.value))}
								min={1}
								required
								aria-required="true"
							/>
						</div>

						{/* Allowed Features */}
						<div className="space-y-2">
							<Label htmlFor="allowedFeatures">
								<Trans>Allowed Features (comma-separated)</Trans>
							</Label>
							<Input
								id="allowedFeatures"
								value={formData.allowedFeatures}
								onChange={(e) => updateField("allowedFeatures", e.target.value)}
								placeholder={t`Leave empty for all features`}
							/>
						</div>

						{/* Is Default */}
						<div className="flex items-center gap-2 self-end pb-2">
							<Checkbox
								id="isDefault"
								checked={formData.isDefault}
								onCheckedChange={(checked) => updateField("isDefault", checked === true)}
							/>
							<Label htmlFor="isDefault">
								<Trans>Set as Default Plan</Trans>
							</Label>
						</div>

						{/* Is Active */}
						<div className="flex items-center gap-2 self-end pb-2">
							<Checkbox
								id="isActive"
								checked={formData.isActive}
								onCheckedChange={(checked) => updateField("isActive", checked === true)}
							/>
							<Label htmlFor="isActive">
								<Trans>Active</Trans>
							</Label>
						</div>
					</div>

					<DialogFooter>
						<DialogClose asChild>
							<Button type="button" variant="outline">
								<Trans>Cancel</Trans>
							</Button>
						</DialogClose>
						<Button type="submit">{isEdit ? <Trans>Update Plan</Trans> : <Trans>Create Plan</Trans>}</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}

function formatNumber(num: number): string {
	if (num >= 1_000_000) {
		return `${(num / 1_000_000).toFixed(1)}M`;
	}
	if (num >= 1_000) {
		return `${(num / 1_000).toFixed(1)}K`;
	}
	return num.toString();
}

function RouteComponent() {
	const router = useRouter();
	const plans = (Route.useLoaderData() ?? []) as QuotaPlan[];

	const [createDialogOpen, setCreateDialogOpen] = useState(false);
	const [editPlan, setEditPlan] = useState<QuotaPlan | null>(null);
	const [deletePlanId, setDeletePlanId] = useState<string | null>(null);
	const { mutate: createPlan } = useMutation(orpc.aiConfig.quotas.create.mutationOptions());
	const { mutate: updatePlan } = useMutation(orpc.aiConfig.quotas.update.mutationOptions());
	const { mutate: deletePlan } = useMutation(orpc.aiConfig.quotas.delete.mutationOptions());

	const handleCreatePlan = (formData: QuotaFormData) => {
		const toastId = toast.loading(t`Creating quota plan...`);
		createPlan(
			{
				name: formData.name,
				description: formData.description || undefined,
				dailyRequestLimit: formData.dailyRequests,
				monthlyRequestLimit: formData.monthlyRequests,
				dailyTokenLimit: formData.dailyTokens,
				monthlyTokenLimit: formData.monthlyTokens,
				maxTokensPerRequest: formData.maxTokensPerRequest,
				allowedFeatures: formData.allowedFeatures ? formData.allowedFeatures.split(",").map((f) => f.trim()) : [],
				isDefault: formData.isDefault,
				isActive: formData.isActive,
			},
			{
				onSuccess: () => {
					toast.success(t`Quota plan created successfully`, { id: toastId });
					setCreateDialogOpen(false);
					router.invalidate();
				},
				onError: (error) => {
					toast.error(error.message || t`Failed to create quota plan`, { id: toastId });
				},
			},
		);
	};

	const handleUpdatePlan = (formData: QuotaFormData) => {
		if (!editPlan) return;

		const toastId = toast.loading(t`Updating quota plan...`);
		updatePlan(
			{
				id: editPlan.id,
				name: formData.name,
				description: formData.description || undefined,
				dailyRequestLimit: formData.dailyRequests,
				monthlyRequestLimit: formData.monthlyRequests,
				dailyTokenLimit: formData.dailyTokens,
				monthlyTokenLimit: formData.monthlyTokens,
				maxTokensPerRequest: formData.maxTokensPerRequest,
				allowedFeatures: formData.allowedFeatures ? formData.allowedFeatures.split(",").map((f) => f.trim()) : [],
				isDefault: formData.isDefault,
				isActive: formData.isActive,
			},
			{
				onSuccess: () => {
					toast.success(t`Quota plan updated successfully`, { id: toastId });
					setEditPlan(null);
					router.invalidate();
				},
				onError: (error) => {
					toast.error(error.message || t`Failed to update quota plan`, { id: toastId });
				},
			},
		);
	};

	const handleDeletePlan = () => {
		if (!deletePlanId) return;

		const toastId = toast.loading(t`Deleting quota plan...`);
		deletePlan(
			{ id: deletePlanId },
			{
				onSuccess: () => {
					toast.success(t`Quota plan deleted successfully`, { id: toastId });
					router.invalidate();
				},
				onError: (error) => {
					toast.error(error.message || t`Failed to delete quota plan`, { id: toastId });
				},
			},
		);
		setDeletePlanId(null);
	};

	return (
		<div className="space-y-4">
			<DashboardHeader icon={ScalesIcon} title={t`AI Quota Management`} />

			<div className="space-y-6 rounded-xl border bg-background p-6">
				{/* Header */}
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-4">
						<Link
							to="/dashboard/admin"
							className="inline-flex items-center justify-center rounded-lg border p-2 transition-colors hover:bg-muted"
							aria-label={t`Back to admin dashboard`}
						>
							<ArrowLeftIcon size={20} aria-hidden="true" />
						</Link>
						<p className="text-muted-foreground text-sm">
							{plans.length} <Trans>quota plans configured</Trans>
						</p>
					</div>
					<Button onClick={() => setCreateDialogOpen(true)}>
						<PlusIcon size={18} className="mr-1" />
						<Trans>Create Plan</Trans>
					</Button>
				</div>

				{/* Quota Plan Cards */}
				{plans.length === 0 ? (
					<div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12">
						<ScalesIcon size={48} className="text-muted-foreground" aria-hidden="true" />
						<p className="mt-4 font-medium text-muted-foreground">
							<Trans>No quota plans configured</Trans>
						</p>
						<p className="mt-1 text-muted-foreground text-sm">
							<Trans>Create a plan to manage AI usage limits for your users.</Trans>
						</p>
						<Button onClick={() => setCreateDialogOpen(true)} className="mt-4">
							<PlusIcon size={18} className="mr-1" />
							<Trans>Create Your First Plan</Trans>
						</Button>
					</div>
				) : (
					<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
						{plans.map((plan) => (
							<div key={plan.id} className="relative flex flex-col rounded-xl border bg-card p-6 shadow-sm">
								{/* Plan Header */}
								<div className="mb-4 flex items-start justify-between">
									<div>
										<h3 className="font-semibold text-lg">{plan.name}</h3>
										{plan.description && <p className="mt-1 text-muted-foreground text-sm">{plan.description}</p>}
									</div>
									<div className="flex gap-1">
										<Button
											variant="ghost"
											size="icon"
											title={t`Edit`}
											aria-label={t`Edit ${plan.name}`}
											onClick={() => setEditPlan(plan)}
										>
											<PencilSimpleIcon size={16} aria-hidden="true" />
										</Button>
										<Button
											variant="ghost"
											size="icon"
											className="text-destructive hover:text-destructive"
											title={t`Delete`}
											aria-label={t`Delete ${plan.name}`}
											onClick={() => setDeletePlanId(plan.id)}
										>
											<TrashIcon size={16} aria-hidden="true" />
										</Button>
									</div>
								</div>

								{/* Status Badges */}
								<div className="mb-4 flex flex-wrap gap-1.5" role="status" aria-label={t`Plan status`}>
									{plan.isDefault && (
										<Badge variant="default">
											<Trans>Default</Trans>
										</Badge>
									)}
									{plan.isActive ? (
										<Badge variant="secondary" className="gap-1">
											<CheckCircleIcon size={12} className="text-green-600" aria-hidden="true" />
											<Trans>Active</Trans>
										</Badge>
									) : (
										<Badge variant="secondary" className="gap-1">
											<XCircleIcon size={12} className="text-muted-foreground" aria-hidden="true" />
											<Trans>Inactive</Trans>
										</Badge>
									)}
								</div>

								{/* Limits Grid */}
								<div className="mb-4 grid grid-cols-2 gap-3">
									<div className="rounded-lg bg-muted/50 p-2.5">
										<p className="text-muted-foreground text-xs">
											<Trans>Daily Requests</Trans>
										</p>
										<p className="font-semibold text-sm">{formatNumber(plan.dailyRequestLimit ?? 0)}</p>
									</div>
									<div className="rounded-lg bg-muted/50 p-2.5">
										<p className="text-muted-foreground text-xs">
											<Trans>Monthly Requests</Trans>
										</p>
										<p className="font-semibold text-sm">{formatNumber(plan.monthlyRequestLimit ?? 0)}</p>
									</div>
									<div className="rounded-lg bg-muted/50 p-2.5">
										<p className="text-muted-foreground text-xs">
											<Trans>Daily Tokens</Trans>
										</p>
										<p className="font-semibold text-sm">{formatNumber(plan.dailyTokenLimit ?? 0)}</p>
									</div>
									<div className="rounded-lg bg-muted/50 p-2.5">
										<p className="text-muted-foreground text-xs">
											<Trans>Monthly Tokens</Trans>
										</p>
										<p className="font-semibold text-sm">{formatNumber(plan.monthlyTokenLimit ?? 0)}</p>
									</div>
								</div>

								{/* Max Tokens Per Request */}
								<div className="mb-4 rounded-lg bg-muted/50 p-2.5">
									<p className="text-muted-foreground text-xs">
										<Trans>Max Tokens Per Request</Trans>
									</p>
									<p className="font-semibold text-sm">{formatNumber(plan.maxTokensPerRequest ?? 4096)}</p>
								</div>

								{/* Allowed Features */}
								<div className="mb-4">
									<p className="mb-1 text-muted-foreground text-xs">
										<Trans>Allowed Features</Trans>
									</p>
									{(plan.allowedFeatures ?? []).length === 0 ? (
										<Badge variant="outline">
											<Trans>All features</Trans>
										</Badge>
									) : (
										<div className="flex flex-wrap gap-1">
											{(plan.allowedFeatures ?? []).map((feature) => (
												<Badge key={feature} variant="outline">
													{feature}
												</Badge>
											))}
										</div>
									)}
								</div>

								{/* Created Date */}
								<div className="mt-auto border-t pt-3 text-muted-foreground text-xs">
									<Trans>Created</Trans>: {new Date(plan.createdAt).toLocaleDateString("fr-FR")}
								</div>
							</div>
						))}
					</div>
				)}
			</div>

			{/* Create Plan Dialog */}
			<QuotaFormDialog
				open={createDialogOpen}
				onOpenChange={setCreateDialogOpen}
				initialData={DEFAULT_FORM_DATA}
				onSubmit={handleCreatePlan}
				isEdit={false}
			/>

			{/* Edit Plan Dialog */}
			{editPlan && (
				<QuotaFormDialog
					open={!!editPlan}
					onOpenChange={(open) => {
						if (!open) setEditPlan(null);
					}}
					initialData={{
						name: editPlan.name,
						description: editPlan.description ?? "",
						dailyRequests: editPlan.dailyRequestLimit ?? 100,
						monthlyRequests: editPlan.monthlyRequestLimit ?? 3000,
						dailyTokens: editPlan.dailyTokenLimit ?? 100000,
						monthlyTokens: editPlan.monthlyTokenLimit ?? 3000000,
						maxTokensPerRequest: editPlan.maxTokensPerRequest ?? 4096,
						allowedFeatures: (editPlan.allowedFeatures ?? []).join(", "),
						isDefault: editPlan.isDefault,
						isActive: editPlan.isActive,
					}}
					onSubmit={handleUpdatePlan}
					isEdit={true}
				/>
			)}

			{/* Delete Plan Confirmation Dialog */}
			<AlertDialog open={!!deletePlanId} onOpenChange={() => setDeletePlanId(null)}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>
							<Trans>Delete Quota Plan</Trans>
						</AlertDialogTitle>
						<AlertDialogDescription>
							<Trans>
								Are you sure you want to delete this quota plan? Users currently assigned to this plan will be moved to
								the default plan. This action cannot be undone.
							</Trans>
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>
							<Trans>Cancel</Trans>
						</AlertDialogCancel>
						<AlertDialogAction
							className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
							onClick={handleDeletePlan}
						>
							<Trans>Delete</Trans>
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
