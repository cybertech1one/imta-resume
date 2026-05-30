import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import {
	BellIcon,
	BellRingingIcon,
	BriefcaseIcon,
	ChartBarIcon,
	DownloadSimpleIcon,
	PlusIcon,
	SpinnerIcon,
	WarningIcon,
} from "@phosphor-icons/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import { ErrorComponent } from "@/components/error-component";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { authClient } from "@/integrations/auth/client";
import { orpc } from "@/integrations/orpc/client";
import { DashboardHeader } from "../-components/header";

import {
	AlertFormDialog,
	AlertsTab,
	CtaSection,
	DeleteConfirmDialog,
	HeroSection,
	HistoryTab,
	MatchesTab,
} from "./-components/alerts-components";
import type { AlertFormData, MatchQuality } from "./-components/alerts-types";
import { INITIAL_FORM_DATA } from "./-components/alerts-types";

// biome-ignore lint/suspicious/noExplicitAny: Route path not in generated route tree
export const Route = createFileRoute("/dashboard/jobs/alerts" as any)({
	component: JobAlertsPage,
	errorComponent: ErrorComponent,
});

function JobAlertsPage() {
	const { data: session } = authClient.useSession();
	const queryClient = useQueryClient();
	const [activeTab, setActiveTab] = useState("alerts");
	const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
	const [editingAlertId, setEditingAlertId] = useState<string | null>(null);
	const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
	const [selectedMatchFilter, setSelectedMatchFilter] = useState<string>("all");
	const [matchQualityFilter, setMatchQualityFilter] = useState<MatchQuality | "all">("all");
	const [showDuplicates, setShowDuplicates] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");

	// Form state
	const [formData, setFormData] = useState<AlertFormData>({ ...INITIAL_FORM_DATA });

	// Fetch alerts from database
	const {
		data: alerts = [],
		isLoading: isLoadingAlerts,
		isError: isAlertsError,
	} = useQuery({
		...orpc.jobAlerts.list.queryOptions({ input: {} }),
		enabled: !!session?.user,
	});

	// Fetch matches from database
	const { data: matches = [], isLoading: isLoadingMatches } = useQuery({
		...orpc.jobAlerts.match.list.queryOptions({
			input: {
				alertId: selectedMatchFilter !== "all" ? selectedMatchFilter : undefined,
				matchQuality: matchQualityFilter !== "all" ? matchQualityFilter : undefined,
				showDuplicates,
			},
		}),
		enabled: !!session?.user,
	});

	// Fetch statistics
	const { data: statsData } = useQuery({
		...orpc.jobAlerts.getStatistics.queryOptions(),
		enabled: !!session?.user,
	});

	// Create mutation with optimistic updates
	const createMutation = useMutation({
		...orpc.jobAlerts.create.mutationOptions(),
		onMutate: async (newAlert) => {
			await queryClient.cancelQueries({ queryKey: ["jobAlerts"] });
			const previousAlerts = queryClient.getQueryData(orpc.jobAlerts.list.key({ input: {} }));

			queryClient.setQueryData(orpc.jobAlerts.list.key({ input: {} }), (old: typeof alerts | undefined) => {
				if (!old) return old;
				const optimisticAlert = {
					...newAlert,
					id: `temp-${Date.now()}`,
					userId: "",
					status: "active" as const,
					matchCount: 0,
					viewedCount: 0,
					appliedCount: 0,
					lastTriggered: null,
					createdAt: new Date(),
					updatedAt: new Date(),
				};
				return [...old, optimisticAlert];
			});

			setIsCreateDialogOpen(false);
			resetForm();

			return { previousAlerts };
		},
		onSuccess: () => {
			toast.success(t`Alerte créée`);
		},
		onError: (error, _newAlert, context) => {
			if (context?.previousAlerts) {
				queryClient.setQueryData(orpc.jobAlerts.list.key({ input: {} }), context.previousAlerts);
			}
			toast.error(error.message || t`Impossible de créer l'alerte`);
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: ["jobAlerts"] });
		},
	});

	// Update mutation
	const updateMutation = useMutation({
		...orpc.jobAlerts.update.mutationOptions(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["jobAlerts"] });
			setEditingAlertId(null);
			resetForm();
			toast.success(t`Alerte mise à jour`);
		},
		onError: (error) => {
			toast.error(error.message || t`Impossible de mettre à jour l'alerte`);
		},
	});

	// Toggle status mutation
	const toggleStatusMutation = useMutation({
		...orpc.jobAlerts.toggleStatus.mutationOptions(),
		onSuccess: (newStatus) => {
			queryClient.invalidateQueries({ queryKey: ["jobAlerts"] });
			toast.success(newStatus === "active" ? t`Alerte activée` : t`Alerte mise en pause`);
		},
		onError: (error) => {
			toast.error(error.message || t`Impossible de changer le statut`);
		},
	});

	// Delete mutation
	const deleteMutation = useMutation({
		...orpc.jobAlerts.delete.mutationOptions(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["jobAlerts"] });
			setDeleteConfirmId(null);
			toast.success(t`Alerte supprimée`);
		},
		onError: (error) => {
			toast.error(error.message || t`Impossible de supprimer l'alerte`);
		},
	});

	// Mark match as viewed mutation
	const markViewedMutation = useMutation({
		...orpc.jobAlerts.match.markViewed.mutationOptions(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["jobAlerts"] });
		},
	});

	// Mark match as applied mutation
	const markAppliedMutation = useMutation({
		...orpc.jobAlerts.match.markApplied.mutationOptions(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["jobAlerts"] });
			toast.success(t`Candidature enregistrée`);
		},
		onError: (error) => {
			toast.error(error.message || t`Impossible d'enregistrer la candidature`);
		},
	});

	// Compute stats from API or defaults
	const stats = useMemo(() => {
		if (statsData) return statsData;
		return {
			totalAlerts: 0,
			activeAlerts: 0,
			totalMatches: 0,
			appliedFromAlerts: 0,
			avgMatchScore: 0,
			topPerformingAlert: "-",
		};
	}, [statsData]);

	// Filter matches by search query
	const filteredMatches = useMemo(() => {
		if (!searchQuery) return matches;
		const query = searchQuery.toLowerCase();
		return matches.filter(
			(match) => match.jobTitle.toLowerCase().includes(query) || match.company.toLowerCase().includes(query),
		);
	}, [matches, searchQuery]);

	// Group matches by date
	const groupedMatches = useMemo(() => {
		const groups: Record<string, typeof matches> = {};
		for (const match of filteredMatches) {
			const date = match.matchedDate;
			if (!groups[date]) groups[date] = [];
			groups[date].push(match);
		}
		return Object.entries(groups).sort(([a], [b]) => b.localeCompare(a));
	}, [filteredMatches]);

	// Alert history data (last 7 days)
	const alertHistory = useMemo(() => {
		const last7Days = Array.from({ length: 7 }, (_, i) => {
			const date = new Date();
			date.setDate(date.getDate() - i);
			return date.toISOString().split("T")[0];
		}).reverse();

		return last7Days.map((date) => ({
			date,
			count: matches.filter((m) => m.matchedDate === date).length,
		}));
	}, [matches]);

	// Handlers
	const resetForm = useCallback(() => {
		setFormData({ ...INITIAL_FORM_DATA });
	}, []);

	const handleCreateAlert = useCallback(() => {
		const keywordsArray = formData.keywords
			.split(",")
			.map((k) => k.trim())
			.filter(Boolean);

		if (keywordsArray.length === 0) {
			toast.error(t`Ajoute au moins un mot-clé`);
			return;
		}

		createMutation.mutate({
			name: formData.name || `Alerte ${alerts.length + 1}`,
			keywords: keywordsArray,
			locations: formData.locations,
			salaryMin: formData.salaryMin,
			salaryMax: formData.salaryMax,
			industries: formData.industries,
			companySizes: formData.companySizes,
			workPreference: formData.workPreference,
			frequency: formData.frequency,
		});
	}, [formData, alerts.length, createMutation]);

	const handleUpdateAlert = useCallback(() => {
		if (!editingAlertId) return;

		const keywordsArray = formData.keywords
			.split(",")
			.map((k) => k.trim())
			.filter(Boolean);

		updateMutation.mutate({
			id: editingAlertId,
			name: formData.name,
			keywords: keywordsArray,
			locations: formData.locations,
			salaryMin: formData.salaryMin,
			salaryMax: formData.salaryMax,
			industries: formData.industries,
			companySizes: formData.companySizes,
			workPreference: formData.workPreference,
			frequency: formData.frequency,
		});
	}, [formData, editingAlertId, updateMutation]);

	const handleDeleteAlert = useCallback(
		(id: string) => {
			deleteMutation.mutate({ id });
		},
		[deleteMutation],
	);

	const handleToggleAlertStatus = useCallback(
		(id: string) => {
			toggleStatusMutation.mutate({ id });
		},
		[toggleStatusMutation],
	);

	const openEditDialog = useCallback((alert: (typeof alerts)[0]) => {
		setFormData({
			name: alert.name,
			keywords: alert.keywords.join(", "),
			locations: alert.locations,
			salaryMin: alert.salaryMin,
			salaryMax: alert.salaryMax,
			industries: alert.industries,
			companySizes: alert.companySizes,
			workPreference: alert.workPreference,
			frequency: alert.frequency,
		});
		setEditingAlertId(alert.id);
	}, []);

	const handleMarkMatchViewed = useCallback(
		(matchId: string, alertId: string) => {
			markViewedMutation.mutate({ id: matchId, alertId });
		},
		[markViewedMutation],
	);

	const handleQuickApply = useCallback(
		(matchId: string, alertId: string) => {
			markAppliedMutation.mutate({ id: matchId, alertId });
		},
		[markAppliedMutation],
	);

	const handleExportAlerts = useCallback(() => {
		const exportData = {
			alerts,
			matches,
			exportedAt: new Date().toISOString(),
		};
		const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = `job-alerts-export-${new Date().toISOString().split("T")[0]}.json`;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
		toast.success(t`Export téléchargé`);
	}, [alerts, matches]);

	// Loading state
	if (isLoadingAlerts) {
		return (
			<>
				<DashboardHeader icon={BellRingingIcon} title={t`Alertes d'emploi`} />
				<div className="flex min-h-[400px] items-center justify-center">
					<SpinnerIcon aria-hidden="true" className="size-8 animate-spin text-primary" />
				</div>
			</>
		);
	}

	// Error state
	if (isAlertsError) {
		return (
			<>
				<DashboardHeader icon={BellRingingIcon} title={t`Alertes d'emploi`} />
				<Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
					<CardContent className="flex flex-col items-center justify-center py-16">
						<WarningIcon aria-hidden="true" className="mb-4 size-16 text-red-500" weight="duotone" />
						<h3 className="mb-2 font-semibold text-lg">
							<Trans>Erreur de chargement</Trans>
						</h3>
						<p className="text-center text-muted-foreground">
							<Trans>Impossible de charger les alertes. Réessaie dans quelques instants.</Trans>
						</p>
					</CardContent>
				</Card>
			</>
		);
	}

	return (
		<>
			<DashboardHeader icon={BellRingingIcon} title={t`Alertes d'emploi`} />

			<HeroSection stats={stats} />

			{/* Main Content Tabs */}
			<Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
				<div className="flex flex-wrap items-center justify-between gap-4">
					<TabsList className="flex h-auto flex-wrap gap-2 bg-transparent p-0">
						{[
							{ value: "alerts", icon: BellIcon, label: t`Mes alertes` },
							{ value: "matches", icon: BriefcaseIcon, label: t`Offres reçues` },
							{ value: "history", icon: ChartBarIcon, label: t`Historique` },
						].map((tab) => (
							<TabsTrigger
								key={tab.value}
								value={tab.value}
								className="gap-2 rounded-full border border-transparent bg-muted/50 px-6 py-2.5 data-[state=active]:border-primary/30 data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
							>
								<tab.icon aria-hidden="true" className="size-4" />
								{tab.label}
							</TabsTrigger>
						))}
					</TabsList>

					<div className="flex gap-2">
						<Button variant="outline" size="sm" className="gap-2" onClick={handleExportAlerts}>
							<DownloadSimpleIcon aria-hidden="true" className="size-4" />
							<Trans>Export</Trans>
						</Button>
						<Button className="gap-2" onClick={() => setIsCreateDialogOpen(true)}>
							<PlusIcon aria-hidden="true" className="size-4" />
							<Trans>Nouvelle alerte</Trans>
						</Button>
					</div>
				</div>

				<AlertsTab
					alerts={alerts}
					onToggleStatus={handleToggleAlertStatus}
					onEdit={openEditDialog}
					onDelete={(id) => setDeleteConfirmId(id)}
					onCreateOpen={() => setIsCreateDialogOpen(true)}
					toggleStatusPending={toggleStatusMutation.isPending}
				/>

				<MatchesTab
					alerts={alerts}
					matches={matches}
					filteredMatches={filteredMatches}
					groupedMatches={groupedMatches}
					isLoadingMatches={isLoadingMatches}
					searchQuery={searchQuery}
					selectedMatchFilter={selectedMatchFilter}
					matchQualityFilter={matchQualityFilter}
					showDuplicates={showDuplicates}
					onSearchChange={setSearchQuery}
					onMatchFilterChange={setSelectedMatchFilter}
					onQualityFilterChange={setMatchQualityFilter}
					onShowDuplicatesChange={setShowDuplicates}
					onMarkViewed={handleMarkMatchViewed}
					onQuickApply={handleQuickApply}
					onCreateOpen={() => setIsCreateDialogOpen(true)}
					markViewedPending={markViewedMutation.isPending}
					markAppliedPending={markAppliedMutation.isPending}
				/>

				<HistoryTab alerts={alerts} matches={matches} alertHistory={alertHistory} stats={stats} />
			</Tabs>

			<AlertFormDialog
				isOpen={isCreateDialogOpen}
				editingAlertId={editingAlertId}
				formData={formData}
				onFormDataChange={setFormData}
				onClose={() => {
					setIsCreateDialogOpen(false);
					setEditingAlertId(null);
					resetForm();
				}}
				onCreate={handleCreateAlert}
				onUpdate={handleUpdateAlert}
				createPending={createMutation.isPending}
				updatePending={updateMutation.isPending}
			/>

			<DeleteConfirmDialog
				deleteConfirmId={deleteConfirmId}
				onClose={() => setDeleteConfirmId(null)}
				onConfirm={handleDeleteAlert}
				isPending={deleteMutation.isPending}
			/>

			<CtaSection />
		</>
	);
}
