import { zodResolver } from "@hookform/resolvers/zod";
import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import {
	CalendarCheckIcon,
	CertificateIcon,
	ChartBarIcon,
	ChartLineUpIcon,
	LightbulbIcon,
	WarningCircleIcon,
} from "@phosphor-icons/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { ErrorComponent } from "@/components/error-component";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { authClient } from "@/integrations/auth/client";
import { orpc } from "@/integrations/orpc/client";
import { DashboardHeader } from "../-components/header";
import {
	CertificationCard,
	ExpirationTabContent,
	HeroSection,
	InventoryActionsBar,
	InventoryEmptyState,
	InventoryFilters,
	RecommendationsTabContent,
	ROITabContent,
	StatisticsTabContent,
} from "./-components/certifications-components";
import type { CertificationFormValues } from "./-components/certifications-config";
import { certificationFormSchema, mapDbToRecommended } from "./-components/certifications-config";
import type {
	CertificationCategory,
	CertificationStatus,
	DbCertification,
	RecommendedCertification,
} from "./-components/certifications-types";
import { calculateDaysUntilExpiration, getDefaultFormData } from "./-components/certifications-utils";

// Tab configuration for the main tabs
const TABS_CONFIG = [
	{ value: "inventory", icon: CertificateIcon, label: () => t`Inventory` },
	{ value: "expiration", icon: CalendarCheckIcon, label: () => t`Expirations` },
	{ value: "roi", icon: ChartLineUpIcon, label: () => t`ROI` },
	{ value: "recommendations", icon: LightbulbIcon, label: () => t`Recommendations` },
	{ value: "statistics", icon: ChartBarIcon, label: () => t`Statistics` },
] as const;

// biome-ignore lint/suspicious/noExplicitAny: Route path not in generated route tree
export const Route = createFileRoute("/dashboard/career/certifications" as any)({
	component: CertificationTracker,
	errorComponent: ErrorComponent,
});

// Main Component
function CertificationTracker() {
	const { data: session } = authClient.useSession();
	const queryClient = useQueryClient();
	const [activeTab, setActiveTab] = useState("inventory");
	const [searchQuery, setSearchQuery] = useState("");
	const [statusFilter, setStatusFilter] = useState<CertificationStatus | "all">("all");
	const [categoryFilter, setCategoryFilter] = useState<CertificationCategory | "all">("all");
	const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
	const [editingCertification, setEditingCertification] = useState<DbCertification | null>(null);
	const [selectedIndustry, setSelectedIndustry] = useState<string>("all");
	const [showFilters, setShowFilters] = useState(false);

	// Form with validation
	const form = useForm<CertificationFormValues>({
		resolver: zodResolver(certificationFormSchema),
		defaultValues: getDefaultFormData(),
	});

	// ── Data Queries ──────────────────────────────────────────────────

	const {
		data: certifications = [],
		isLoading,
		error,
	} = useQuery({ ...orpc.career.certifications.list.queryOptions({}), enabled: !!session?.user });

	const { data: _statistics } = useQuery({
		...orpc.career.certifications.getStatistics.queryOptions(),
		enabled: !!session?.user,
	});

	const { data: certificationLibrary = [] } = useQuery({
		...orpc.certificationLibrary.list.queryOptions({ input: { isRecommended: true, activeOnly: true } }),
		enabled: !!session?.user,
	});

	// ── Derived Data ──────────────────────────────────────────────────

	const recommendedCertifications = useMemo(() => {
		if (certificationLibrary.length > 0) {
			return certificationLibrary.map(mapDbToRecommended);
		}
		return [];
	}, [certificationLibrary]);

	// ── Mutations ─────────────────────────────────────────────────────

	const resetForm = useCallback(() => {
		form.reset(getDefaultFormData());
		setEditingCertification(null);
	}, [form]);

	const createMutation = useMutation({
		...orpc.career.certifications.create.mutationOptions(),
		onMutate: async (newCertification) => {
			await queryClient.cancelQueries({ queryKey: ["career", "certifications"] });
			const previousCertifications = queryClient.getQueryData(orpc.career.certifications.list.key({}));

			queryClient.setQueryData(orpc.career.certifications.list.key({}), (old: typeof certifications | undefined) => {
				if (!old) return old;
				const optimisticCertification = {
					...newCertification,
					id: `temp-${Date.now()}`,
					userId: "",
					category: newCertification.category || null,
					credentialId: newCertification.credentialId || null,
					credentialUrl: newCertification.credentialUrl || null,
					issueDate: newCertification.issueDate || null,
					expiryDate: newCertification.expiryDate || null,
					cost: newCertification.cost || null,
					currency: newCertification.currency || null,
					notes: newCertification.notes || null,
					reminderDays: newCertification.reminderDays || null,
					createdAt: new Date(),
					updatedAt: new Date(),
				};
				return [...old, optimisticCertification];
			});

			resetForm();
			setIsAddDialogOpen(false);

			return { previousCertifications };
		},
		onError: (_error, _newCertification, context) => {
			if (context?.previousCertifications) {
				queryClient.setQueryData(orpc.career.certifications.list.key({}), context.previousCertifications);
			}
			toast.error(t`Failed to create certification. Please try again.`);
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: ["career", "certifications"] });
		},
	});

	const updateMutation = useMutation(
		orpc.career.certifications.update.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries({ queryKey: ["career", "certifications"] });
				resetForm();
				setIsAddDialogOpen(false);
			},
			onError: () => toast.error(t`Failed to update certification. Please try again.`),
		}),
	);

	const deleteMutation = useMutation(
		orpc.career.certifications.delete.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries({ queryKey: ["career", "certifications"] });
			},
			onError: () => toast.error(t`Failed to delete certification. Please try again.`),
		}),
	);

	// ── Handlers ──────────────────────────────────────────────────────

	const handleSaveCertification = useCallback(
		(data: CertificationFormValues) => {
			const certData = {
				name: data.name,
				issuer: data.issuer,
				category: data.category,
				status: data.status,
				credentialId: data.credentialId || undefined,
				credentialUrl: data.credentialUrl || undefined,
				issueDate: data.issueDate ? new Date(data.issueDate) : undefined,
				expiryDate: data.expiryDate ? new Date(data.expiryDate) : undefined,
				cost: data.cost || undefined,
				currency: data.currency,
				notes: data.notes || undefined,
				reminderDays: data.reminderDays,
			};

			if (editingCertification) {
				updateMutation.mutate({ id: editingCertification.id, ...certData });
			} else {
				createMutation.mutate(certData);
			}
		},
		[editingCertification, createMutation, updateMutation],
	);

	const handleDeleteCertification = useCallback(
		(certId: string) => {
			deleteMutation.mutate({ id: certId });
		},
		[deleteMutation],
	);

	const handleEditCertification = useCallback(
		(cert: DbCertification) => {
			setEditingCertification(cert);
			form.reset({
				name: cert.name,
				issuer: cert.issuer,
				category: (cert.category as CertificationCategory) || "hse",
				status: cert.status,
				credentialId: cert.credentialId || "",
				credentialUrl: cert.credentialUrl || "",
				issueDate: cert.issueDate ? new Date(cert.issueDate).toISOString().split("T")[0] : "",
				expiryDate: cert.expiryDate ? new Date(cert.expiryDate).toISOString().split("T")[0] : "",
				cost: cert.cost || 0,
				currency: cert.currency || "EUR",
				notes: cert.notes || "",
				reminderDays: cert.reminderDays || 30,
			});
			setIsAddDialogOpen(true);
		},
		[form],
	);

	const handleAddRecommended = useCallback(
		(rec: RecommendedCertification) => {
			form.reset({
				name: rec.name,
				issuer: rec.issuer,
				category: rec.category,
				status: "planned",
				credentialId: "",
				credentialUrl: "",
				issueDate: "",
				expiryDate: "",
				cost: rec.averageCost,
				currency: rec.currency,
				notes: rec.description,
				reminderDays: 30,
			});
			setIsAddDialogOpen(true);
		},
		[form],
	);

	const handleExport = useCallback(() => {
		const exportData = {
			certifications,
			exportedAt: new Date().toISOString(),
		};
		const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = "imta-certifications-export.json";
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
	}, [certifications]);

	// ── Computed / Filtered Data ──────────────────────────────────────

	const filteredCertifications = useMemo(() => {
		return certifications.filter((cert) => {
			const matchesSearch =
				cert.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
				cert.issuer.toLowerCase().includes(searchQuery.toLowerCase());
			const matchesStatus = statusFilter === "all" || cert.status === statusFilter;
			const matchesCategory = categoryFilter === "all" || cert.category === categoryFilter;
			return matchesSearch && matchesStatus && matchesCategory;
		});
	}, [certifications, searchQuery, statusFilter, categoryFilter]);

	const computedStatistics = useMemo(() => {
		const certs = certifications;
		const active = certs.filter((c) => c.status === "completed").length;
		const expired = certs.filter((c) => c.status === "expired").length;
		const inProgress = certs.filter((c) => c.status === "in_progress").length;
		const planned = certs.filter((c) => c.status === "planned").length;

		const totalCost = certs.reduce((sum, c) => {
			const rate = c.currency === "USD" ? 0.92 : 1;
			return sum + (c.cost || 0) * rate;
		}, 0);

		const expiringSoon = certs.filter((c) => {
			const days = calculateDaysUntilExpiration(c.expiryDate);
			return days !== null && days > 0 && days <= 90;
		}).length;

		return { total: certs.length, active, expired, inProgress, planned, totalCost, expiringSoon };
	}, [certifications]);

	const certsByCategory = useMemo(() => {
		const counts: Record<CertificationCategory, number> = {
			healthcare: 0,
			industrial: 0,
			hse: 0,
			management: 0,
			technical: 0,
			language: 0,
		};
		for (const cert of certifications) {
			if (cert.category && cert.category in counts) {
				counts[cert.category as CertificationCategory]++;
			}
		}
		return counts;
	}, [certifications]);

	const filteredRecommendations = useMemo(() => {
		const existingNames = certifications.map((c) => c.name.toLowerCase());
		return recommendedCertifications.filter((rec) => {
			const notOwned = !existingNames.includes(rec.name.toLowerCase());
			const matchesIndustry =
				selectedIndustry === "all" ||
				rec.industries.some((i) => i.toLowerCase().includes(selectedIndustry.toLowerCase()));
			return notOwned && matchesIndustry;
		});
	}, [certifications, selectedIndustry, recommendedCertifications]);

	const industries = useMemo(() => {
		const set = new Set<string>();
		for (const rec of recommendedCertifications) {
			for (const ind of rec.industries) {
				set.add(ind);
			}
		}
		return Array.from(set).sort();
	}, [recommendedCertifications]);

	// ── Loading State ─────────────────────────────────────────────────

	if (isLoading) {
		return (
			<>
				<DashboardHeader icon={CertificateIcon} title={t`Certification Tracking`} />
				<div className="flex items-center justify-center py-12">
					<div className="flex flex-col items-center gap-4">
						<div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
						<p className="text-muted-foreground">
							<Trans>Loading certifications...</Trans>
						</p>
					</div>
				</div>
			</>
		);
	}

	// ── Error State ───────────────────────────────────────────────────

	if (error) {
		return (
			<>
				<DashboardHeader icon={CertificateIcon} title={t`Certification Tracking`} />
				<Card className="border-destructive">
					<CardContent className="flex flex-col items-center py-12 text-center">
						<WarningCircleIcon className="mb-4 size-12 text-destructive" />
						<h3 className="mb-2 font-medium text-lg">
							<Trans>Loading error</Trans>
						</h3>
						<p className="max-w-sm text-muted-foreground">
							<Trans>Unable to load your certifications. Please try again.</Trans>
						</p>
					</CardContent>
				</Card>
			</>
		);
	}

	// ── Shared Props ──────────────────────────────────────────────────

	const hasFilters = searchQuery !== "" || statusFilter !== "all" || categoryFilter !== "all";

	const formDialogProps = {
		isOpen: isAddDialogOpen,
		onOpenChange: setIsAddDialogOpen,
		form,
		editingCertification,
		onSubmit: handleSaveCertification,
		isPending: createMutation.isPending || updateMutation.isPending,
		resetForm,
	};

	// ── Render ─────────────────────────────────────────────────────────

	return (
		<>
			<DashboardHeader icon={CertificateIcon} title={t`Certification Tracking`} />

			<HeroSection statistics={computedStatistics} />

			<Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
				<TabsList className="flex h-auto flex-wrap gap-2 bg-transparent p-0">
					{TABS_CONFIG.map((tab) => (
						<TabsTrigger
							key={tab.value}
							value={tab.value}
							className="gap-2 rounded-full border border-transparent bg-muted/50 px-6 py-2.5 data-[state=active]:border-primary/30 data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
						>
							<tab.icon className="size-4" />
							{tab.label()}
						</TabsTrigger>
					))}
				</TabsList>

				{/* Inventory Tab */}
				<TabsContent value="inventory" className="space-y-6">
					<InventoryActionsBar
						searchQuery={searchQuery}
						onSearchChange={setSearchQuery}
						showFilters={showFilters}
						onToggleFilters={() => setShowFilters(!showFilters)}
						onExport={handleExport}
						formDialogProps={formDialogProps}
					/>

					<InventoryFilters
						showFilters={showFilters}
						statusFilter={statusFilter}
						categoryFilter={categoryFilter}
						onStatusFilterChange={setStatusFilter}
						onCategoryFilterChange={setCategoryFilter}
						onReset={() => {
							setStatusFilter("all");
							setCategoryFilter("all");
							setSearchQuery("");
						}}
					/>

					{filteredCertifications.length === 0 ? (
						<InventoryEmptyState hasFilters={hasFilters} onAdd={() => setIsAddDialogOpen(true)} />
					) : (
						<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
							{filteredCertifications.map((cert, index) => (
								<CertificationCard
									key={cert.id}
									cert={cert}
									index={index}
									onEdit={handleEditCertification}
									onDelete={handleDeleteCertification}
								/>
							))}
						</div>
					)}
				</TabsContent>

				{/* Expiration Tab */}
				<TabsContent value="expiration" className="space-y-6">
					<ExpirationTabContent certifications={certifications} />
				</TabsContent>

				{/* ROI Tab */}
				<TabsContent value="roi" className="space-y-6">
					<ROITabContent certifications={certifications} statistics={computedStatistics} />
				</TabsContent>

				{/* Recommendations Tab */}
				<TabsContent value="recommendations" className="space-y-6">
					<RecommendationsTabContent
						filteredRecommendations={filteredRecommendations}
						industries={industries}
						selectedIndustry={selectedIndustry}
						onIndustryChange={setSelectedIndustry}
						onAddRecommended={handleAddRecommended}
					/>
				</TabsContent>

				{/* Statistics Tab */}
				<TabsContent value="statistics" className="space-y-6">
					<StatisticsTabContent
						certifications={certifications}
						statistics={computedStatistics}
						certsByCategory={certsByCategory}
					/>
				</TabsContent>
			</Tabs>
		</>
	);
}
