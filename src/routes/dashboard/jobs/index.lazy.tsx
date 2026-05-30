import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import {
	BriefcaseIcon,
	BuildingsIcon,
	ChartLineUpIcon,
	NoteIcon,
	SparkleIcon,
	SpinnerIcon,
	WarningIcon,
} from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { createLazyFileRoute } from "@tanstack/react-router";
import { useCallback, useMemo, useState } from "react";
import { ErrorComponent } from "@/components/error-component";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDebounce } from "@/hooks/use-debounce";
import { authClient } from "@/integrations/auth/client";
import { orpc } from "@/integrations/orpc/client";
import { DashboardHeader } from "../-components/header";

import {
	ApplicationsTab,
	EmployersTab,
	FeaturedJobsSection,
	HeroSection,
	InsightsTab,
	JobDetailDialog,
	JobFiltersSection,
	JobListingsGrid,
} from "./-components/jobs-index-components";
import { insightIconMap } from "./-components/jobs-index-config";
import type { Application, Employer, Job, MarketInsight } from "./-components/jobs-index-types";

// biome-ignore lint/suspicious/noExplicitAny: Route path not in generated route tree
export const Route = createLazyFileRoute("/dashboard/jobs/" as any)({
	component: JobBoard,
	errorComponent: ErrorComponent,
});

// Component
function JobBoard() {
	const { data: session } = authClient.useSession();
	const [activeTab, setActiveTab] = useState("jobs");
	const [searchQuery, setSearchQuery] = useState("");
	const debouncedSearchQuery = useDebounce(searchQuery, 200);
	const [fieldFilter, setFieldFilter] = useState<string>("all");
	const [regionFilter, setRegionFilter] = useState<string>("all");
	const [experienceFilter, setExperienceFilter] = useState<string>("all");
	const [selectedJob, setSelectedJob] = useState<Job | null>(null);
	const [isJobDetailOpen, setIsJobDetailOpen] = useState(false);

	// Database queries — fetch published partner jobs (not per-user aggregator)
	const {
		data: dbJobsData,
		isLoading: isLoadingJobs,
		isError: isJobsError,
	} = useQuery({
		...orpc.partner.listPublishedJobs.queryOptions({
			input: { page: 1, limit: 100 },
		}),
		enabled: !!session?.user,
		staleTime: 2 * 60 * 1000,
	});
	// biome-ignore lint/suspicious/noExplicitAny: ORPC response shape varies at runtime
	const dbJobs: unknown[] = (dbJobsData as any)?.jobs ?? [];
	const { data: dbEmployers } = useQuery({
		...orpc.employers.list.queryOptions({ input: { activeOnly: true } }),
		enabled: !!session?.user,
	});
	const { data: dbMarketInsights } = useQuery({
		...orpc.marketInsights.list.queryOptions({ input: { activeOnly: true } }),
		enabled: !!session?.user,
	});

	// Transform employers to the Employer interface
	const featuredEmployers: Employer[] = useMemo(() => {
		if (!dbEmployers || dbEmployers.length === 0) return [];
		return dbEmployers.map((e) => ({
			id: e.id,
			name: e.name,
			industry: e.sector || e.sectorFr || "",
			location: e.location || e.locationFr || "",
			openPositions: e.openPositions || 0,
			description: e.descriptionFr || e.description || "",
			featured: (e.sortOrder || 0) <= 5,
		}));
	}, [dbEmployers]);

	// Transform market insights
	const marketInsights: MarketInsight[] = useMemo(() => {
		if (!dbMarketInsights || dbMarketInsights.length === 0) return [];
		return dbMarketInsights.map((mi) => ({
			id: mi.id,
			title: mi.titleFr || mi.title || "",
			value: mi.value || "",
			change: undefined,
			trend: "stable" as const,
			description: mi.descriptionFr || mi.description || "",
			icon: insightIconMap[mi.icon || ""] || SparkleIcon,
		}));
	}, [dbMarketInsights]);

	// Transform partner job postings into the Job interface
	const allJobs: Job[] = useMemo(() => {
		if (!dbJobs || dbJobs.length === 0) return [];
		const fieldMap: Record<string, Job["field"]> = {
			healthcare: "healthcare",
			industrial: "industrial",
			hse: "hse",
			tech: "general",
			finance: "general",
			general: "general",
		};
		const expMap: Record<string, Job["experienceLevel"]> = {
			entry: "entry",
			junior: "junior",
			mid: "mid",
			senior: "senior",
			lead: "senior",
		};
		return (
			dbJobs as Array<{
				id: string;
				title: string;
				titleFr: string | null;
				companyName: string | null;
				companyLogo: string | null;
				location: string;
				region: string | null;
				field: string | null;
				experienceLevel: string;
				salaryMin: number | null;
				salaryMax: number | null;
				salaryCurrency: string | null;
				publishedAt: Date | string | null;
				createdAt: Date | string;
				description: string;
				descriptionFr: string | null;
				requirements: string[] | null;
				skills: string[] | null;
				applicationUrl: string | null;
				applicationEmail: string | null;
				isFeatured: boolean;
				isUrgent: boolean;
			}>
		).map((j) => ({
			id: j.id,
			title: j.titleFr || j.title,
			company: j.companyName ?? "Entreprise partenaire",
			companyLogo: j.companyLogo ?? undefined,
			location: j.location,
			region: j.region ?? j.location,
			field: fieldMap[j.field ?? ""] ?? "general",
			experienceLevel: expMap[j.experienceLevel] ?? "mid",
			salaryMin: j.salaryMin ?? undefined,
			salaryMax: j.salaryMax ?? undefined,
			currency: j.salaryCurrency ?? "MAD",
			postedDate: new Date(j.publishedAt ?? j.createdAt).toISOString().split("T")[0],
			description: j.descriptionFr || j.description,
			requirements: (j.requirements as string[]) ?? [],
			skills: (j.skills as string[]) ?? [],
			howToApply: j.applicationUrl ?? j.applicationEmail ?? "",
			featured: j.isFeatured,
			urgent: j.isUrgent,
		}));
	}, [dbJobs]);

	// Application tracker state (starts empty, user adds applications)
	const [applications, setApplications] = useState<Application[]>([]);
	const [editingNotes, setEditingNotes] = useState<string | null>(null);
	const [notesText, setNotesText] = useState("");

	// Filter jobs with debounced search for better performance
	const filteredJobs = useMemo(() => {
		return allJobs.filter((job) => {
			const matchesSearch =
				debouncedSearchQuery === "" ||
				job.title.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
				job.company.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
				job.description.toLowerCase().includes(debouncedSearchQuery.toLowerCase());

			const matchesField = fieldFilter === "all" || job.field === fieldFilter;
			const matchesRegion = regionFilter === "all" || job.region === regionFilter;
			const matchesExperience = experienceFilter === "all" || job.experienceLevel === experienceFilter;

			return matchesSearch && matchesField && matchesRegion && matchesExperience;
		});
	}, [allJobs, debouncedSearchQuery, fieldFilter, regionFilter, experienceFilter]);

	// Featured jobs
	const featuredJobs = useMemo(() => allJobs.filter((job) => job.featured), [allJobs]);

	// Similar jobs for detail modal
	const getSimilarJobs = useCallback(
		(job: Job) => {
			return allJobs.filter((j) => j.id !== job.id && (j.field === job.field || j.company === job.company)).slice(0, 3);
		},
		[allJobs],
	);

	// Open job detail
	const openJobDetail = useCallback((job: Job) => {
		setSelectedJob(job);
		setIsJobDetailOpen(true);
	}, []);

	// Add application
	const addApplication = useCallback((job: Job) => {
		const newApp: Application = {
			id: `app-${Date.now()}`,
			jobId: job.id,
			jobTitle: job.title,
			company: job.company,
			appliedDate: new Date().toISOString().split("T")[0],
			status: "pending",
			notes: "",
		};
		setApplications((prev) => [...prev, newApp]);
	}, []);

	// Update application status
	const updateApplicationStatus = useCallback((appId: string, status: Application["status"]) => {
		setApplications((prev) => prev.map((app) => (app.id === appId ? { ...app, status } : app)));
	}, []);

	// Save notes
	const saveNotes = useCallback(
		(appId: string) => {
			setApplications((prev) => prev.map((app) => (app.id === appId ? { ...app, notes: notesText } : app)));
			setEditingNotes(null);
			setNotesText("");
		},
		[notesText],
	);

	// Clear filters
	const clearFilters = useCallback(() => {
		setSearchQuery("");
		setFieldFilter("all");
		setRegionFilter("all");
		setExperienceFilter("all");
	}, []);

	// View employer jobs handler
	const handleViewEmployerJobs = useCallback((employerName: string) => {
		setFieldFilter("all");
		setSearchQuery(employerName);
		setActiveTab("jobs");
	}, []);

	const hasActiveFilters = !!(
		searchQuery ||
		fieldFilter !== "all" ||
		regionFilter !== "all" ||
		experienceFilter !== "all"
	);

	return (
		<main role="main" aria-label={t`Contenu principal des offres`}>
			<DashboardHeader icon={BriefcaseIcon} title={t`Offres de stage et emploi`} />

			<HeroSection
				allJobsCount={allJobs.length}
				employerCount={featuredEmployers.length}
				featuredJobsCount={featuredJobs.length}
			/>

			{/* Loading state */}
			{isLoadingJobs && (
				<Card className="border-dashed">
					<CardContent className="flex flex-col items-center justify-center py-12">
						<SpinnerIcon className="mb-4 size-10 animate-spin text-primary" />
						<p className="text-muted-foreground">
							<Trans>Chargement des offres...</Trans>
						</p>
					</CardContent>
				</Card>
			)}

			{/* Error state */}
			{isJobsError && (
				<Card className="border-destructive/50 border-dashed">
					<CardContent className="flex flex-col items-center justify-center py-12">
						<WarningIcon className="mb-4 size-10 text-destructive" />
						<h3 className="mb-2 font-semibold text-lg">
							<Trans>Erreur de chargement</Trans>
						</h3>
						<p className="text-muted-foreground">
							<Trans>Impossible de charger les offres. Veuillez réessayer.</Trans>
						</p>
					</CardContent>
				</Card>
			)}

			{/* Main Tabs */}
			<Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
				<TabsList className="flex h-auto flex-wrap gap-2 bg-transparent p-0" aria-label={t`Sections des offres`}>
					{[
						{ value: "jobs", icon: BriefcaseIcon, label: t`Offres` },
						{ value: "employers", icon: BuildingsIcon, label: t`Employeurs` },
						{ value: "applications", icon: NoteIcon, label: t`Mes candidatures` },
						{ value: "insights", icon: ChartLineUpIcon, label: t`Tendances` },
					].map((tab) => (
						<TabsTrigger
							key={tab.value}
							value={tab.value}
							className="gap-2 rounded-full border border-transparent bg-muted/50 px-6 py-2.5 focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 data-[state=active]:border-primary/30 data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
							aria-label={tab.label}
						>
							<tab.icon className="size-4" aria-hidden="true" />
							{tab.label}
						</TabsTrigger>
					))}
				</TabsList>

				{/* Jobs Tab */}
				<TabsContent value="jobs" className="space-y-8">
					<FeaturedJobsSection featuredJobs={featuredJobs} onJobClick={openJobDetail} />

					<JobFiltersSection
						searchQuery={searchQuery}
						onSearchChange={setSearchQuery}
						fieldFilter={fieldFilter}
						onFieldFilterChange={setFieldFilter}
						regionFilter={regionFilter}
						onRegionFilterChange={setRegionFilter}
						experienceFilter={experienceFilter}
						onExperienceFilterChange={setExperienceFilter}
						hasActiveFilters={hasActiveFilters}
						onClearFilters={clearFilters}
					/>

					<JobListingsGrid
						filteredJobs={filteredJobs}
						applications={applications}
						onJobClick={openJobDetail}
						onApply={addApplication}
						onClearFilters={clearFilters}
					/>
				</TabsContent>

				{/* Employers Tab */}
				<TabsContent value="employers" className="space-y-8">
					<EmployersTab featuredEmployers={featuredEmployers} onViewEmployerJobs={handleViewEmployerJobs} />
				</TabsContent>

				{/* Applications Tab */}
				<TabsContent value="applications" className="space-y-8">
					<ApplicationsTab
						applications={applications}
						editingNotes={editingNotes}
						notesText={notesText}
						onSetEditingNotes={setEditingNotes}
						onSetNotesText={setNotesText}
						onUpdateStatus={updateApplicationStatus}
						onSaveNotes={saveNotes}
						onGoToJobs={() => setActiveTab("jobs")}
					/>
				</TabsContent>

				{/* Market Insights Tab */}
				<TabsContent value="insights" className="space-y-8">
					<InsightsTab marketInsights={marketInsights} allJobs={allJobs} featuredEmployers={featuredEmployers} />
				</TabsContent>
			</Tabs>

			<JobDetailDialog
				isOpen={isJobDetailOpen}
				onOpenChange={setIsJobDetailOpen}
				selectedJob={selectedJob}
				onSelectJob={setSelectedJob}
				applications={applications}
				onApply={addApplication}
				getSimilarJobs={getSimilarJobs}
			/>
		</main>
	);
}
