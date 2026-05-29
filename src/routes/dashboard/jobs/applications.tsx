import { zodResolver } from "@hookform/resolvers/zod";
import { t } from "@lingui/core/macro";
import { NoteIcon } from "@phosphor-icons/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { ErrorComponent } from "@/components/error-component";
import { useDebounce } from "@/hooks/use-debounce";
import { authClient } from "@/integrations/auth/client";
import { orpc } from "@/integrations/orpc/client";
import { DashboardHeader } from "../-components/header";
import {
	ActionsBar,
	ApplicationFormDialog,
	ApplicationsList,
	CtaSection,
	DeleteConfirmDialog,
	ErrorState,
	HeroSection,
	LoadingState,
} from "./-components/applications-components";
import { applicationFormSchema } from "./-components/applications-config";
import type { ApplicationFormValues, ApplicationStatus } from "./-components/applications-types";

// biome-ignore lint/suspicious/noExplicitAny: Route path not in generated route tree
export const Route = createFileRoute("/dashboard/jobs/applications" as any)({
	component: MyApplicationsPage,
	errorComponent: ErrorComponent,
});

function MyApplicationsPage() {
	const { data: session } = authClient.useSession();
	const queryClient = useQueryClient();
	const [searchQuery, setSearchQuery] = useState("");
	const debouncedSearchQuery = useDebounce(searchQuery, 300);
	const [statusFilter, setStatusFilter] = useState<ApplicationStatus | "all">("all");
	const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
	const [editingApplicationId, setEditingApplicationId] = useState<string | null>(null);
	const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

	const form = useForm<ApplicationFormValues>({
		resolver: zodResolver(applicationFormSchema),
		defaultValues: {
			position: "",
			companyName: "",
			location: "",
			appliedAt: new Date().toISOString().split("T")[0],
			status: "applied",
			notes: "",
			salary: "",
			contactName: "",
			contactEmail: "",
		},
	});

	const {
		data: applications = [],
		isLoading,
		isError,
		error,
	} = useQuery({
		...orpc.jobApplications.list.queryOptions({
			input: {
				status: statusFilter !== "all" ? statusFilter : undefined,
				search: debouncedSearchQuery || undefined,
				sort: "createdAt",
				sortOrder: "desc",
			},
		}),
		enabled: !!session?.user,
		staleTime: 2 * 60 * 1000,
		gcTime: 5 * 60 * 1000,
		placeholderData: [],
	});

	const { data: statisticsData } = useQuery({
		...orpc.jobApplications.getStatistics.queryOptions(),
		enabled: !!session?.user,
		staleTime: 5 * 60 * 1000,
		gcTime: 10 * 60 * 1000,
	});

	const resetForm = useCallback(() => {
		form.reset({
			position: "",
			companyName: "",
			location: "",
			appliedAt: new Date().toISOString().split("T")[0],
			status: "applied",
			notes: "",
			salary: "",
			contactName: "",
			contactEmail: "",
		});
	}, [form]);

	const createMutation = useMutation({
		...orpc.jobApplications.create.mutationOptions(),
		onMutate: async (newApplication) => {
			await queryClient.cancelQueries({ queryKey: ["jobApplications"] });

			const previousApplications = queryClient.getQueryData(["jobApplications"]);

			queryClient.setQueryData(
				orpc.jobApplications.list.key({
					input: {
						status: statusFilter !== "all" ? statusFilter : undefined,
						search: debouncedSearchQuery || undefined,
						sort: "createdAt",
						sortOrder: "desc",
					},
				}),
				(old: typeof applications | undefined) => {
					if (!old) return old;
					const optimisticApplication = {
						...newApplication,
						id: `temp-${Date.now()}`,
						createdAt: new Date(),
						updatedAt: new Date(),
						userId: "",
						salary: newApplication.salary || null,
						contactName: newApplication.contactName || null,
						contactEmail: newApplication.contactEmail || null,
						jobPostingUrl: null,
						deadline: null,
					};
					return [optimisticApplication, ...old];
				},
			);

			setIsAddDialogOpen(false);
			resetForm();

			return { previousApplications };
		},
		onSuccess: () => {
			toast.success(t`Application added`);
		},
		onError: (error, _newApplication, context) => {
			if (context?.previousApplications) {
				queryClient.setQueryData(["jobApplications"], context.previousApplications);
			}
			toast.error(error.message || t`Error adding application`);
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: ["jobApplications"] });
		},
	});

	const updateMutation = useMutation({
		...orpc.jobApplications.update.mutationOptions(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["jobApplications"] });
			setEditingApplicationId(null);
			resetForm();
			toast.success(t`Application updated`);
		},
		onError: (error) => {
			toast.error(error.message || t`Error during update`);
		},
	});

	const deleteMutation = useMutation({
		...orpc.jobApplications.delete.mutationOptions(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["jobApplications"] });
			setDeleteConfirmId(null);
			toast.success(t`Application deleted`);
		},
		onError: (error) => {
			toast.error(error.message || t`Error during deletion`);
		},
	});

	const stats = useMemo(() => {
		if (!statisticsData) {
			return { total: 0, active: 0, interviews: 0, offers: 0 };
		}
		const byStatus = statisticsData.byStatus || {};
		const active =
			statisticsData.total - (byStatus.rejected || 0) - (byStatus.withdrawn || 0) - (byStatus.accepted || 0);
		return {
			total: statisticsData.total,
			active,
			interviews: (byStatus.interview || 0) + (byStatus.phone_screen || 0),
			offers: byStatus.offer || 0,
		};
	}, [statisticsData]);

	const handleAddApplication = useCallback(
		(data: ApplicationFormValues) => {
			createMutation.mutate({
				position: data.position,
				companyName: data.companyName,
				location: data.location || undefined,
				appliedAt: data.appliedAt ? new Date(data.appliedAt) : undefined,
				status: data.status,
				notes: data.notes || undefined,
				salary: data.salary || undefined,
				contactName: data.contactName || undefined,
				contactEmail: data.contactEmail || undefined,
			});
		},
		[createMutation],
	);

	const handleUpdateApplication = useCallback(
		(data: ApplicationFormValues) => {
			if (!editingApplicationId) return;
			updateMutation.mutate({
				id: editingApplicationId,
				position: data.position,
				companyName: data.companyName,
				location: data.location || undefined,
				appliedAt: data.appliedAt ? new Date(data.appliedAt) : undefined,
				status: data.status,
				notes: data.notes || undefined,
				salary: data.salary || undefined,
				contactName: data.contactName || undefined,
				contactEmail: data.contactEmail || undefined,
			});
		},
		[editingApplicationId, updateMutation],
	);

	const handleDeleteApplication = useCallback(
		(id: string) => {
			deleteMutation.mutate({ id });
		},
		[deleteMutation],
	);

	const openEditDialog = useCallback(
		(app: (typeof applications)[0]) => {
			form.reset({
				position: app.position,
				companyName: app.companyName,
				location: app.location || "",
				appliedAt: app.appliedAt ? new Date(app.appliedAt).toISOString().split("T")[0] : "",
				status: app.status as ApplicationStatus,
				notes: app.notes || "",
				salary: app.salary || "",
				contactName: app.contactName || "",
				contactEmail: app.contactEmail || "",
			});
			setEditingApplicationId(app.id);
		},
		[form],
	);

	if (isLoading) {
		return (
			<>
				<DashboardHeader icon={NoteIcon} title={t`My Applications`} />
				<LoadingState />
			</>
		);
	}

	if (isError) {
		return (
			<>
				<DashboardHeader icon={NoteIcon} title={t`My Applications`} />
				<ErrorState error={error} />
			</>
		);
	}

	return (
		<>
			<DashboardHeader icon={NoteIcon} title={t`My Applications`} />

			<HeroSection stats={stats} />

			<ActionsBar
				searchQuery={searchQuery}
				setSearchQuery={setSearchQuery}
				statusFilter={statusFilter}
				setStatusFilter={setStatusFilter}
				onAddClick={() => setIsAddDialogOpen(true)}
			/>

			<ApplicationsList
				applications={applications}
				searchQuery={searchQuery}
				statusFilter={statusFilter}
				openEditDialog={openEditDialog}
				setDeleteConfirmId={setDeleteConfirmId}
				setIsAddDialogOpen={setIsAddDialogOpen}
			/>

			<CtaSection />

			<ApplicationFormDialog
				open={isAddDialogOpen || !!editingApplicationId}
				onOpenChange={(open) => {
					if (!open) {
						setIsAddDialogOpen(false);
						setEditingApplicationId(null);
						resetForm();
					}
				}}
				editingApplicationId={editingApplicationId}
				form={form}
				onSubmitAdd={handleAddApplication}
				onSubmitUpdate={handleUpdateApplication}
				isSubmitting={createMutation.isPending || updateMutation.isPending}
			/>

			<DeleteConfirmDialog
				open={!!deleteConfirmId}
				onOpenChange={() => setDeleteConfirmId(null)}
				onConfirm={() => deleteConfirmId && handleDeleteApplication(deleteConfirmId)}
				isPending={deleteMutation.isPending}
			/>
		</>
	);
}
