import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import {
	ArrowLeftIcon,
	MagnifyingGlassIcon,
	PlusIcon,
	SpinnerGapIcon,
	UsersIcon,
	WarningCircleIcon,
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
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { client, orpc } from "@/integrations/orpc/client";
import { DashboardHeader } from "../../-components/header";
import { CohortCard, CohortDetailView, CohortsSkeleton } from "./-components/cohorts-components";
import type { CohortData } from "./-components/cohorts-types";

export const Route = createFileRoute("/dashboard/admin/cohorts/")({
	component: RouteComponent,
	pendingComponent: PendingComponent,
	errorComponent: ({ error, reset }) => (
		<div className="space-y-4">
			<DashboardHeader icon={UsersIcon} title={t`Cohort Analytics`} />
			<div className="flex flex-col items-center justify-center rounded-xl border bg-background p-8">
				<WarningCircleIcon className="size-12 text-destructive" />
				<p className="mt-4 text-muted-foreground">
					<Trans>Failed to load cohort data</Trans>
				</p>
				<p className="mt-2 text-muted-foreground text-sm">{error.message}</p>
				<Button onClick={reset} className="mt-4">
					Retry
				</Button>
			</div>
		</div>
	),
	loader: async () => {
		const result = await client.cohortAnalytics.list({ activeOnly: false, limit: 50, offset: 0 });
		return result;
	},
});

function PendingComponent() {
	return (
		<div className="space-y-4">
			<DashboardHeader icon={UsersIcon} title={t`Cohort Analytics`} />
			<CohortsSkeleton />
		</div>
	);
}

function RouteComponent() {
	const router = useRouter();
	const { cohorts, total } = Route.useLoaderData();

	const [searchQuery, setSearchQuery] = useState("");
	const [selectedCohortId, setSelectedCohortId] = useState<string | null>(null);
	const [createDialogOpen, setCreateDialogOpen] = useState(false);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [cohortToDelete, setCohortToDelete] = useState<string | null>(null);

	const [newCohort, setNewCohort] = useState({
		name: "",
		description: "",
		program: "",
		year: "",
		field: "",
		specialization: "",
	});

	const { mutate: createCohort, isPending: creatingCohort } = useMutation(
		orpc.cohortAnalytics.create.mutationOptions(),
	);
	const { mutate: deleteCohort, isPending: deletingCohort } = useMutation(
		orpc.cohortAnalytics.delete.mutationOptions(),
	);

	const handleCreateCohort = () => {
		if (!newCohort.name.trim()) {
			toast.error(t`Cohort name is required`);
			return;
		}

		const toastId = toast.loading(t`Creating cohort...`);
		createCohort(
			{
				name: newCohort.name,
				description: newCohort.description || undefined,
				criteria: {
					program: newCohort.program || undefined,
					year: newCohort.year ? parseInt(newCohort.year, 10) : undefined,
					field: newCohort.field || undefined,
					specialization: newCohort.specialization || undefined,
				},
			},
			{
				onSuccess: () => {
					toast.success(t`Cohort created successfully`, { id: toastId });
					setCreateDialogOpen(false);
					setNewCohort({ name: "", description: "", program: "", year: "", field: "", specialization: "" });
					router.invalidate();
				},
				onError: (error) => {
					toast.error(error.message || t`Failed to create cohort`, { id: toastId });
				},
			},
		);
	};

	const handleDeleteCohort = () => {
		if (!cohortToDelete) return;

		const toastId = toast.loading(t`Deleting cohort...`);
		deleteCohort(
			{ id: cohortToDelete },
			{
				onSuccess: () => {
					toast.success(t`Cohort deleted successfully`, { id: toastId });
					setDeleteDialogOpen(false);
					setCohortToDelete(null);
					if (selectedCohortId === cohortToDelete) {
						setSelectedCohortId(null);
					}
					router.invalidate();
				},
				onError: (error) => {
					toast.error(error.message || t`Failed to delete cohort`, { id: toastId });
				},
			},
		);
	};

	const filteredCohorts = cohorts.filter(
		(c) =>
			c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			c.description?.toLowerCase().includes(searchQuery.toLowerCase()),
	);

	if (selectedCohortId) {
		return (
			<div className="space-y-4">
				<DashboardHeader icon={UsersIcon} title={t`Cohort Analytics`} />
				<div className="@container rounded-xl border bg-background p-6">
					<CohortDetailView cohortId={selectedCohortId} onBack={() => setSelectedCohortId(null)} />
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-4">
			<DashboardHeader icon={UsersIcon} title={t`Cohort Analytics`} />

			<div className="@container space-y-6 rounded-xl border bg-background p-6">
				<div className="flex items-center gap-4">
					<Link
						to="/dashboard/admin"
						className="inline-flex items-center justify-center rounded-lg border p-2 transition-colors hover:bg-muted"
					>
						<ArrowLeftIcon size={20} />
					</Link>
					<p className="text-muted-foreground text-sm">
						{total} <Trans>total cohorts</Trans>
					</p>
				</div>

				<div className="flex @md:flex-row flex-col @md:items-center @md:justify-between gap-4">
					<div className="relative @md:max-w-xs flex-1">
						<MagnifyingGlassIcon className="absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground" size={18} />
						<Input
							placeholder={t`Search cohorts...`}
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="pl-10"
						/>
					</div>
					<Button onClick={() => setCreateDialogOpen(true)}>
						<PlusIcon size={18} />
						<Trans>Create Cohort</Trans>
					</Button>
				</div>

				{filteredCohorts.length > 0 ? (
					<div className="grid @lg:grid-cols-2 @xl:grid-cols-3 gap-4">
						{filteredCohorts.map((cohort) => (
							<CohortCard
								key={cohort.id}
								cohort={cohort as CohortData}
								onSelect={setSelectedCohortId}
								onDelete={(id) => {
									setCohortToDelete(id);
									setDeleteDialogOpen(true);
								}}
							/>
						))}
					</div>
				) : (
					<div className="flex flex-col items-center justify-center py-12">
						<UsersIcon size={48} className="text-muted-foreground" />
						<h3 className="mt-4 font-semibold text-lg">
							<Trans>No cohorts found</Trans>
						</h3>
						<p className="text-muted-foreground text-sm">
							{searchQuery ? (
								<Trans>Try adjusting your search</Trans>
							) : (
								<Trans>Create your first cohort to get started</Trans>
							)}
						</p>
						{!searchQuery && (
							<Button onClick={() => setCreateDialogOpen(true)} className="mt-4">
								<PlusIcon size={18} />
								<Trans>Create Cohort</Trans>
							</Button>
						)}
					</div>
				)}
			</div>

			<Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle>
							<Trans>Create New Cohort</Trans>
						</DialogTitle>
						<DialogDescription>
							<Trans>Group students by program, year, or specialization for analytics tracking.</Trans>
						</DialogDescription>
					</DialogHeader>
					<div className="space-y-4 py-4">
						<div className="space-y-2">
							<Label htmlFor="name">
								<Trans>Cohort Name</Trans> *
							</Label>
							<Input
								id="name"
								value={newCohort.name}
								onChange={(e) => setNewCohort({ ...newCohort, name: e.target.value })}
								placeholder={t`e.g., Healthcare 2024`}
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="description">
								<Trans>Description</Trans>
							</Label>
							<Textarea
								id="description"
								value={newCohort.description}
								onChange={(e) => setNewCohort({ ...newCohort, description: e.target.value })}
								placeholder={t`Optional description for this cohort`}
								rows={3}
							/>
						</div>
						<div className="grid grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label htmlFor="program">
									<Trans>Program</Trans>
								</Label>
								<Input
									id="program"
									value={newCohort.program}
									onChange={(e) => setNewCohort({ ...newCohort, program: e.target.value })}
									placeholder={t`e.g., IMTA`}
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="year">
									<Trans>Year</Trans>
								</Label>
								<Input
									id="year"
									type="number"
									value={newCohort.year}
									onChange={(e) => setNewCohort({ ...newCohort, year: e.target.value })}
									placeholder={t`e.g., 2024`}
								/>
							</div>
						</div>
						<div className="space-y-2">
							<Label htmlFor="field">
								<Trans>Field</Trans>
							</Label>
							<Select value={newCohort.field} onValueChange={(v) => setNewCohort({ ...newCohort, field: v })}>
								<SelectTrigger>
									<SelectValue placeholder={t`Select field`} />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="healthcare">Healthcare</SelectItem>
									<SelectItem value="industrial">Industrial</SelectItem>
									<SelectItem value="hse">HSE</SelectItem>
									<SelectItem value="general">General</SelectItem>
								</SelectContent>
							</Select>
						</div>
						<div className="space-y-2">
							<Label htmlFor="specialization">
								<Trans>Specialization</Trans>
							</Label>
							<Input
								id="specialization"
								value={newCohort.specialization}
								onChange={(e) => setNewCohort({ ...newCohort, specialization: e.target.value })}
								placeholder={t`e.g., Nursing, Welding`}
							/>
						</div>
					</div>
					<DialogFooter>
						<Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
							<Trans>Cancel</Trans>
						</Button>
						<Button onClick={handleCreateCohort} disabled={creatingCohort}>
							{creatingCohort && <SpinnerGapIcon size={18} className="animate-spin" />}
							<Trans>Create Cohort</Trans>
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			<AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>
							<Trans>Delete Cohort</Trans>
						</AlertDialogTitle>
						<AlertDialogDescription>
							<Trans>
								Are you sure you want to delete this cohort? This action cannot be undone and will remove all associated
								data.
							</Trans>
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>
							<Trans>Cancel</Trans>
						</AlertDialogCancel>
						<AlertDialogAction
							className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
							onClick={handleDeleteCohort}
							disabled={deletingCohort}
						>
							{deletingCohort && <SpinnerGapIcon size={18} className="animate-spin" />}
							<Trans>Delete</Trans>
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
