import { t } from "@lingui/core/macro";
import {
	ArrowsLeftRightIcon,
	BookmarkSimpleIcon,
	GlobeIcon,
	LightbulbIcon,
	ListIcon,
	MagnifyingGlassIcon,
} from "@phosphor-icons/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import { ErrorComponent } from "@/components/error-component";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { authClient } from "@/integrations/auth/client";
import { orpc } from "@/integrations/orpc/client";
import { DashboardHeader } from "../-components/header";
import {
	CompareDialog,
	CompareTabContent,
	FilterSheet,
	HeroSection,
	JobCardsGrid,
	JobDetailDialog,
	RecommendationsTabContent,
	SavedJobsSection,
	SavedSearchesSection,
	SaveSearchDialog,
	SearchBar,
	TrackingTabContent,
} from "./-components/aggregator-components";
import { defaultFilters } from "./-components/aggregator-config";
import type { AggregatedJob, ApplicationStatus, SavedSearch, SearchFilters } from "./-components/aggregator-types";

// biome-ignore lint/suspicious/noExplicitAny: Route path not in generated route tree
export const Route = createFileRoute("/dashboard/jobs/aggregator" as any)({
	component: JobAggregatorPage,
	errorComponent: ErrorComponent,
});

// Component
function JobAggregatorPage() {
	const { data: session } = authClient.useSession();
	const queryClient = useQueryClient();

	// State
	const [searchQuery, setSearchQuery] = useState("");
	const [filters, setFilters] = useState<SearchFilters>(defaultFilters);
	const [selectedJob, setSelectedJob] = useState<AggregatedJob | null>(null);
	const [compareJobs, setCompareJobs] = useState<AggregatedJob[]>([]);
	const [isCompareOpen, setIsCompareOpen] = useState(false);
	const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);
	const [isSaveSearchOpen, setIsSaveSearchOpen] = useState(false);
	const [saveSearchName, setSaveSearchName] = useState("");
	const [currentPage, setCurrentPage] = useState(1);
	const [activeTab, setActiveTab] = useState("search");
	const jobsPerPage = 6;

	// Fetch jobs from database
	const { data: jobsData = [] } = useQuery({
		...orpc.jobAggregator.jobs.list.queryOptions({
			input: {
				search: searchQuery || undefined,
				sources: filters.sources.length > 0 && filters.sources.length < 3 ? filters.sources : undefined,
				locations: filters.locations.length > 0 ? filters.locations : undefined,
				workTypes: filters.workTypes.length > 0 ? filters.workTypes : undefined,
				experienceLevels: filters.experienceLevels.length > 0 ? filters.experienceLevels : undefined,
				industries: filters.industries.length > 0 ? filters.industries : undefined,
			},
		}),
		enabled: !!session?.user,
	});

	// Fetch saved searches from database
	const { data: savedSearchesData = [] } = useQuery({
		...orpc.jobAggregator.savedSearches.list.queryOptions(),
		enabled: !!session?.user,
	});

	// Fetch statistics
	const { data: statsData } = useQuery({
		...orpc.jobAggregator.jobs.getStatistics.queryOptions(),
		enabled: !!session?.user,
	});

	// Toggle saved mutation
	const toggleSavedMutation = useMutation({
		...orpc.jobAggregator.jobs.toggleSaved.mutationOptions(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["jobAggregator", "jobs"] });
		},
		onError: (error) => {
			toast.error(error.message || t`Error during save`);
		},
	});

	// Update application status mutation
	const updateStatusMutation = useMutation({
		...orpc.jobAggregator.jobs.updateStatus.mutationOptions(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["jobAggregator", "jobs"] });
			toast.success(t`Status updated`);
		},
		onError: (error) => {
			toast.error(error.message || t`Error during update`);
		},
	});

	// Create saved search mutation
	const createSavedSearchMutation = useMutation({
		...orpc.jobAggregator.savedSearches.create.mutationOptions(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["jobAggregator", "savedSearches"] });
			setIsSaveSearchOpen(false);
			setSaveSearchName("");
			toast.success(t`Search saved`);
		},
		onError: (error) => {
			toast.error(error.message || t`Error during save`);
		},
	});

	// Delete saved search mutation
	const deleteSavedSearchMutation = useMutation({
		...orpc.jobAggregator.savedSearches.delete.mutationOptions(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["jobAggregator", "savedSearches"] });
			toast.success(t`Search deleted`);
		},
		onError: (error) => {
			toast.error(error.message || t`Error during deletion`);
		},
	});

	// Transform database jobs to component format
	const jobs: AggregatedJob[] = useMemo(() => {
		return jobsData.map((job) => ({
			id: job.id,
			title: job.title,
			company: job.company,
			companyLogo: job.companyLogo,
			location: job.location,
			workType: job.workType,
			industry: job.industry,
			experienceLevel: job.experienceLevel,
			salaryMin: job.salaryMin,
			salaryMax: job.salaryMax,
			currency: job.currency,
			postedDate: job.postedDate,
			description: job.description,
			requirements: job.requirements,
			skills: job.skills,
			benefits: job.benefits,
			source: job.source,
			sourceUrl: job.sourceUrl,
			applicationStatus: job.applicationStatus,
			isSaved: job.isSaved,
			matchScore: job.matchScore,
		}));
	}, [jobsData]);

	// Transform saved searches
	const savedSearches: SavedSearch[] = useMemo(() => {
		return savedSearchesData.map((search) => ({
			id: search.id,
			name: search.name,
			query: search.query,
			filters: search.filters as SearchFilters,
			createdAt: search.createdAt,
			resultsCount: search.resultsCount,
		}));
	}, [savedSearchesData]);

	// Filtered jobs (client-side filtering for salary range)
	const filteredJobs = useMemo(() => {
		return jobs.filter((job) => {
			// Salary filter (client-side)
			if (job.salaryMin && job.salaryMax) {
				if (filters.salaryMin > 0 && job.salaryMax < filters.salaryMin) return false;
				if (filters.salaryMax < 30000 && job.salaryMin > filters.salaryMax) return false;
			}
			return true;
		});
	}, [jobs, filters]);

	// Pagination
	const totalPages = Math.ceil(filteredJobs.length / jobsPerPage);
	const paginatedJobs = useMemo(() => {
		const start = (currentPage - 1) * jobsPerPage;
		return filteredJobs.slice(start, start + jobsPerPage);
	}, [filteredJobs, currentPage]);

	// Saved jobs
	const savedJobs = useMemo(() => filteredJobs.filter((job) => job.isSaved), [filteredJobs]);

	// Stats
	const stats = useMemo(() => {
		return {
			total: statsData?.total ?? filteredJobs.length,
			bySource: statsData?.bySource ?? {
				linkedin: filteredJobs.filter((j) => j.source === "linkedin").length,
				indeed: filteredJobs.filter((j) => j.source === "indeed").length,
				glassdoor: filteredJobs.filter((j) => j.source === "glassdoor").length,
			},
			applied: statsData?.applied ?? jobs.filter((j) => j.applicationStatus !== "not_applied").length,
			saved: statsData?.saved ?? savedJobs.length,
		};
	}, [filteredJobs, jobs, savedJobs, statsData]);

	// Handlers
	const toggleSaveJob = useCallback(
		(jobId: string) => {
			toggleSavedMutation.mutate({ id: jobId });
		},
		[toggleSavedMutation],
	);

	const updateApplicationStatus = useCallback(
		(jobId: string, status: ApplicationStatus) => {
			updateStatusMutation.mutate({ id: jobId, status });
		},
		[updateStatusMutation],
	);

	const toggleCompareJob = useCallback((job: AggregatedJob) => {
		setCompareJobs((prev) => {
			const exists = prev.find((j) => j.id === job.id);
			if (exists) {
				return prev.filter((j) => j.id !== job.id);
			}
			if (prev.length >= 3) {
				return [...prev.slice(1), job];
			}
			return [...prev, job];
		});
	}, []);

	const saveSearch = useCallback(() => {
		if (!saveSearchName.trim()) return;
		createSavedSearchMutation.mutate({
			name: saveSearchName,
			query: searchQuery,
			filters: { ...filters },
			resultsCount: filteredJobs.length,
		});
	}, [saveSearchName, searchQuery, filters, filteredJobs.length, createSavedSearchMutation]);

	const loadSavedSearch = useCallback((search: SavedSearch) => {
		setSearchQuery(search.query);
		setFilters(search.filters);
		setCurrentPage(1);
		setActiveTab("search");
	}, []);

	const deleteSavedSearch = useCallback(
		(searchId: string) => {
			deleteSavedSearchMutation.mutate({ id: searchId });
		},
		[deleteSavedSearchMutation],
	);

	const clearFilters = useCallback(() => {
		setFilters(defaultFilters);
		setSearchQuery("");
		setCurrentPage(1);
	}, []);

	const hasActiveFilters =
		searchQuery ||
		filters.sources.length !== 3 ||
		filters.salaryMin > 0 ||
		filters.salaryMax < 30000 ||
		filters.locations.length > 0 ||
		filters.workTypes.length > 0 ||
		filters.experienceLevels.length > 0 ||
		filters.industries.length > 0;

	return (
		<>
			<DashboardHeader icon={GlobeIcon} title={t`Job Aggregator`} />

			<HeroSection stats={stats} />

			{/* Main Content */}
			<Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
				<TabsList className="flex h-auto flex-wrap gap-2 bg-transparent p-0">
					{[
						{ value: "search", icon: MagnifyingGlassIcon, label: t`Search` },
						{ value: "saved", icon: BookmarkSimpleIcon, label: t`Saved` },
						{ value: "compare", icon: ArrowsLeftRightIcon, label: t`Compare` },
						{ value: "tracking", icon: ListIcon, label: t`Tracking` },
						{ value: "recommendations", icon: LightbulbIcon, label: t`Recommendations` },
					].map((tab) => (
						<TabsTrigger
							key={tab.value}
							value={tab.value}
							className="gap-2 rounded-full border border-transparent bg-muted/50 px-6 py-2.5 data-[state=active]:border-primary/30 data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
						>
							<tab.icon className="size-4" />
							{tab.label}
							{tab.value === "saved" && savedJobs.length > 0 && (
								<Badge variant="secondary" className="ml-1 size-5 rounded-full p-0 text-xs">
									{savedJobs.length}
								</Badge>
							)}
							{tab.value === "compare" && compareJobs.length > 0 && (
								<Badge variant="secondary" className="ml-1 size-5 rounded-full p-0 text-xs">
									{compareJobs.length}
								</Badge>
							)}
						</TabsTrigger>
					))}
				</TabsList>

				{/* Search Tab */}
				<TabsContent value="search" className="space-y-6">
					<SearchBar
						searchQuery={searchQuery}
						setSearchQuery={setSearchQuery}
						filters={filters}
						setFilters={setFilters}
						setCurrentPage={setCurrentPage}
						setIsFilterSheetOpen={setIsFilterSheetOpen}
						setIsSaveSearchOpen={setIsSaveSearchOpen}
						hasActiveFilters={hasActiveFilters}
						clearFilters={clearFilters}
					/>

					<JobCardsGrid
						paginatedJobs={paginatedJobs}
						compareJobs={compareJobs}
						filteredJobsCount={filteredJobs.length}
						toggleSaveJob={toggleSaveJob}
						toggleCompareJob={toggleCompareJob}
						setSelectedJob={setSelectedJob}
						isSavePending={toggleSavedMutation.isPending}
						clearFilters={clearFilters}
						currentPage={currentPage}
						totalPages={totalPages}
						setCurrentPage={setCurrentPage}
						setIsCompareOpen={setIsCompareOpen}
					/>
				</TabsContent>

				{/* Saved Jobs Tab */}
				<TabsContent value="saved" className="space-y-8">
					<SavedSearchesSection
						savedSearches={savedSearches}
						loadSavedSearch={loadSavedSearch}
						deleteSavedSearch={deleteSavedSearch}
						isDeletePending={deleteSavedSearchMutation.isPending}
					/>

					<SavedJobsSection
						savedJobs={savedJobs}
						toggleSaveJob={toggleSaveJob}
						setSelectedJob={setSelectedJob}
						isSavePending={toggleSavedMutation.isPending}
					/>
				</TabsContent>

				{/* Compare Tab */}
				<TabsContent value="compare" className="space-y-6">
					<CompareTabContent
						compareJobs={compareJobs}
						setCompareJobs={setCompareJobs}
						setSelectedJob={setSelectedJob}
						toggleCompareJob={toggleCompareJob}
						toggleSaveJob={toggleSaveJob}
						isSavePending={toggleSavedMutation.isPending}
						setActiveTab={setActiveTab}
					/>
				</TabsContent>

				{/* Tracking Tab */}
				<TabsContent value="tracking" className="space-y-6">
					<TrackingTabContent jobs={jobs} setSelectedJob={setSelectedJob} />
				</TabsContent>

				{/* Recommendations Tab */}
				<TabsContent value="recommendations" className="space-y-8">
					<RecommendationsTabContent />
				</TabsContent>
			</Tabs>

			<FilterSheet
				isOpen={isFilterSheetOpen}
				onOpenChange={setIsFilterSheetOpen}
				filters={filters}
				setFilters={setFilters}
				clearFilters={clearFilters}
			/>

			<SaveSearchDialog
				isOpen={isSaveSearchOpen}
				onOpenChange={setIsSaveSearchOpen}
				saveSearchName={saveSearchName}
				setSaveSearchName={setSaveSearchName}
				searchQuery={searchQuery}
				filters={filters}
				saveSearch={saveSearch}
				isPending={createSavedSearchMutation.isPending}
			/>

			<JobDetailDialog
				selectedJob={selectedJob}
				setSelectedJob={setSelectedJob}
				toggleSaveJob={toggleSaveJob}
				isSavePending={toggleSavedMutation.isPending}
				updateApplicationStatus={updateApplicationStatus}
				toggleCompareJob={toggleCompareJob}
				compareJobs={compareJobs}
			/>

			<CompareDialog isOpen={isCompareOpen} onOpenChange={setIsCompareOpen} compareJobs={compareJobs} />
		</>
	);
}
