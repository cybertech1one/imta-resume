import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import {
	ArrowsLeftRightIcon,
	BookmarkSimpleIcon,
	BuildingsIcon,
	CalendarIcon,
	CaretLeftIcon,
	CaretRightIcon,
	CheckCircleIcon,
	CurrencyCircleDollarIcon,
	FactoryIcon,
	FloppyDiskIcon,
	FunnelIcon,
	GlobeIcon,
	GraduationCapIcon,
	HouseIcon,
	LightbulbIcon,
	LinkedinLogoIcon,
	ListIcon,
	MagnifyingGlassIcon,
	MapPinIcon,
	SparkleIcon,
	SpinnerIcon,
	XIcon,
} from "@phosphor-icons/react";
import { AnimatePresence, motion } from "motion/react";
import type { Dispatch, SetStateAction } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
	Sheet,
	SheetClose,
	SheetContent,
	SheetDescription,
	SheetFooter,
	SheetHeader,
	SheetTitle,
} from "@/components/ui/sheet";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/utils/style";
import {
	applicationStatusConfig,
	experienceConfig,
	industryConfig,
	industryRecommendations,
	locations,
	sourceConfig,
	workTypeConfig,
} from "./aggregator-config";
import type {
	AggregatedJob,
	ApplicationStatus,
	ExperienceLevel,
	Industry,
	JobSource,
	SavedSearch,
	SearchFilters,
	WorkType,
} from "./aggregator-types";

const formatCurrency = (amount: number) => `${amount.toLocaleString()} MAD`;

const getDaysAgo = (dateString: string) => {
	const days = Math.floor((Date.now() - new Date(dateString).getTime()) / (1000 * 60 * 60 * 24));
	if (days === 0) return t`Today`;
	if (days === 1) return t`Yesterday`;
	return t`${days} days ago`;
};

// Hero Section
export function HeroSection({
	stats,
}: {
	stats: {
		total: number;
		bySource: { linkedin: number; indeed: number; glassdoor: number };
		applied: number;
		saved: number;
	};
}) {
	return (
		<motion.div
			className="relative mb-8 overflow-hidden rounded-3xl border border-primary/20 p-8 md:p-12"
			style={{
				background:
					"linear-gradient(135deg, oklch(0.65 0.18 240 / 0.15) 0%, oklch(0.6 0.2 280 / 0.1) 50%, oklch(0.7 0.15 200 / 0.08) 100%)",
			}}
			initial={false}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.6, ease: "easeOut" }}
		>
			<div className="pointer-events-none absolute inset-0 overflow-hidden">
				<motion.div
					className="absolute -top-32 -right-32 size-96 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/10 blur-3xl"
					animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.3, 0.5] }}
					transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
				/>
				<motion.div
					className="absolute -bottom-32 -left-32 size-96 rounded-full bg-gradient-to-tr from-blue-500/15 to-cyan-500/10 blur-3xl"
					animate={{ scale: [1.2, 1, 1.2], opacity: [0.3, 0.5, 0.3] }}
					transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
				/>
			</div>

			<div className="relative z-10">
				<motion.div
					className="mb-3 flex items-center gap-2"
					initial={false}
					animate={{ opacity: 1, x: 0 }}
					transition={{ delay: 0.2 }}
				>
					<GlobeIcon className="size-5 text-primary" weight="fill" />
					<span className="font-semibold text-primary text-sm uppercase tracking-wider">
						<Trans>Unified Search</Trans>
					</span>
				</motion.div>

				<motion.h2
					className="mb-4 bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text font-bold text-3xl text-transparent tracking-tight md:text-4xl lg:text-5xl"
					initial={false}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.3 }}
				>
					<Trans>Job Listings Aggregator</Trans>
				</motion.h2>

				<motion.p
					className="mb-8 max-w-2xl text-lg text-muted-foreground"
					initial={false}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.4 }}
				>
					<Trans>
						Search LinkedIn, Indeed, and Glassdoor in one interface. Compare listings, track your applications, and save
						your searches.
					</Trans>
				</motion.p>

				{/* Stats */}
				<motion.div
					className="grid grid-cols-2 gap-4 sm:grid-cols-4"
					initial={false}
					animate={{ opacity: 1 }}
					transition={{ delay: 0.5 }}
				>
					<div className="rounded-xl border border-white/20 bg-white/50 p-4 backdrop-blur-sm dark:bg-black/20">
						<p className="font-bold text-2xl">{stats.total}</p>
						<p className="text-muted-foreground text-sm">
							<Trans>Listings found</Trans>
						</p>
					</div>
					<div className="rounded-xl border border-white/20 bg-white/50 p-4 backdrop-blur-sm dark:bg-black/20">
						<div className="flex items-center gap-2">
							<LinkedinLogoIcon className="size-5 text-blue-600" weight="fill" />
							<p className="font-bold text-2xl">{stats.bySource.linkedin}</p>
						</div>
						<p className="text-muted-foreground text-sm">LinkedIn</p>
					</div>
					<div className="rounded-xl border border-white/20 bg-white/50 p-4 backdrop-blur-sm dark:bg-black/20">
						<p className="font-bold text-2xl text-green-600 dark:text-green-400">{stats.saved}</p>
						<p className="text-muted-foreground text-sm">
							<Trans>Saved</Trans>
						</p>
					</div>
					<div className="rounded-xl border border-white/20 bg-white/50 p-4 backdrop-blur-sm dark:bg-black/20">
						<p className="font-bold text-2xl text-purple-600 dark:text-purple-400">{stats.applied}</p>
						<p className="text-muted-foreground text-sm">
							<Trans>Applications</Trans>
						</p>
					</div>
				</motion.div>
			</div>
		</motion.div>
	);
}

// Search Bar with source filters and active filters display
export function SearchBar({
	searchQuery,
	setSearchQuery,
	filters,
	setFilters,
	setCurrentPage,
	setIsFilterSheetOpen,
	setIsSaveSearchOpen,
	hasActiveFilters,
	clearFilters,
}: {
	searchQuery: string;
	setSearchQuery: Dispatch<SetStateAction<string>>;
	filters: SearchFilters;
	setFilters: Dispatch<SetStateAction<SearchFilters>>;
	setCurrentPage: Dispatch<SetStateAction<number>>;
	setIsFilterSheetOpen: Dispatch<SetStateAction<boolean>>;
	setIsSaveSearchOpen: Dispatch<SetStateAction<boolean>>;
	hasActiveFilters: boolean | string;
	clearFilters: () => void;
}) {
	return (
		<Card>
			<CardContent className="p-4">
				<div className="flex flex-col gap-4 md:flex-row md:items-center">
					<div className="relative flex-1">
						<MagnifyingGlassIcon className="absolute top-1/2 left-3 size-5 -translate-y-1/2 text-muted-foreground" />
						<Input
							placeholder={t`Search for a position, company, skill...`}
							value={searchQuery}
							onChange={(e) => {
								setSearchQuery(e.target.value);
								setCurrentPage(1);
							}}
							className="pl-10"
						/>
					</div>

					{/* Source filters */}
					<div className="flex flex-wrap gap-2">
						{(Object.keys(sourceConfig) as JobSource[]).map((source) => {
							const config = sourceConfig[source];
							const SourceIcon = config.icon;
							const isActive = filters.sources.includes(source);
							return (
								<Button
									key={source}
									variant={isActive ? "default" : "outline"}
									size="sm"
									className={cn("gap-2", isActive && config.bgColor, isActive && config.color)}
									onClick={() => {
										setFilters((prev) => ({
											...prev,
											sources: isActive ? prev.sources.filter((s) => s !== source) : [...prev.sources, source],
										}));
										setCurrentPage(1);
									}}
								>
									<SourceIcon className="size-4" weight={isActive ? "fill" : "regular"} />
									{config.label}
								</Button>
							);
						})}
					</div>

					<div className="flex gap-2">
						<Button variant="outline" className="gap-2" onClick={() => setIsFilterSheetOpen(true)}>
							<FunnelIcon className="size-4" />
							<Trans>Filters</Trans>
							{hasActiveFilters && (
								<Badge className="ml-1 size-5 rounded-full bg-primary p-0 text-primary-foreground text-xs">!</Badge>
							)}
						</Button>
						<Button
							variant="outline"
							className="gap-2"
							onClick={() => setIsSaveSearchOpen(true)}
							disabled={!searchQuery && !hasActiveFilters}
						>
							<FloppyDiskIcon className="size-4" />
							<Trans>Save</Trans>
						</Button>
					</div>
				</div>

				{/* Active filters display */}
				{hasActiveFilters && (
					<div className="mt-4 flex flex-wrap items-center gap-2">
						<span className="text-muted-foreground text-sm">
							<Trans>Active filters:</Trans>
						</span>
						{filters.industries.map((ind) => (
							<Badge key={ind} variant="secondary" className="gap-1">
								{industryConfig[ind].label}
								<XIcon
									className="size-3 cursor-pointer"
									onClick={() =>
										setFilters((prev) => ({
											...prev,
											industries: prev.industries.filter((i) => i !== ind),
										}))
									}
								/>
							</Badge>
						))}
						{filters.locations.map((loc) => (
							<Badge key={loc} variant="secondary" className="gap-1">
								<MapPinIcon className="size-3" />
								{loc}
								<XIcon
									className="size-3 cursor-pointer"
									onClick={() =>
										setFilters((prev) => ({
											...prev,
											locations: prev.locations.filter((l) => l !== loc),
										}))
									}
								/>
							</Badge>
						))}
						{filters.workTypes.map((wt) => (
							<Badge key={wt} variant="secondary" className="gap-1">
								{workTypeConfig[wt].label}
								<XIcon
									className="size-3 cursor-pointer"
									onClick={() =>
										setFilters((prev) => ({
											...prev,
											workTypes: prev.workTypes.filter((w) => w !== wt),
										}))
									}
								/>
							</Badge>
						))}
						{(filters.salaryMin > 0 || filters.salaryMax < 30000) && (
							<Badge variant="secondary" className="gap-1">
								<CurrencyCircleDollarIcon className="size-3" />
								{formatCurrency(filters.salaryMin)} - {formatCurrency(filters.salaryMax)}
								<XIcon
									className="size-3 cursor-pointer"
									onClick={() => setFilters((prev) => ({ ...prev, salaryMin: 0, salaryMax: 30000 }))}
								/>
							</Badge>
						)}
						<Button variant="ghost" size="sm" className="h-6 gap-1 text-xs" onClick={clearFilters}>
							<XIcon className="size-3" />
							<Trans>Clear all</Trans>
						</Button>
					</div>
				)}
			</CardContent>
		</Card>
	);
}

// Individual Job Card
function JobCard({
	job,
	index,
	isInCompare,
	toggleSaveJob,
	toggleCompareJob,
	setSelectedJob,
	isSavePending,
}: {
	job: AggregatedJob;
	index: number;
	isInCompare: boolean;
	toggleSaveJob: (jobId: string) => void;
	toggleCompareJob: (job: AggregatedJob) => void;
	setSelectedJob: Dispatch<SetStateAction<AggregatedJob | null>>;
	isSavePending: boolean;
}) {
	const sourceConf = sourceConfig[job.source];
	const industryConf = industryConfig[job.industry];
	const SourceIcon = sourceConf.icon;
	const IndustryIcon = industryConf.icon;
	const statusConf = applicationStatusConfig[job.applicationStatus];

	return (
		<motion.div
			key={job.id}
			initial={false}
			animate={{ opacity: 1, scale: 1 }}
			exit={{ opacity: 0, scale: 0.95 }}
			transition={{ delay: index * 0.03 }}
			layout
		>
			<Card
				className={cn(
					"group h-full cursor-pointer transition-all duration-300 hover:shadow-lg",
					isInCompare && "ring-2 ring-primary",
					job.isSaved && "border-amber-500/30",
				)}
				onClick={() => setSelectedJob(job)}
			>
				<CardHeader className="pb-2">
					<div className="mb-2 flex items-start justify-between">
						{/* Source badge */}
						<Badge className={cn("gap-1", sourceConf.bgColor, sourceConf.color)}>
							<SourceIcon className="size-3" weight="fill" />
							{sourceConf.label}
						</Badge>
						<div className="flex items-center gap-1">
							{job.matchScore && job.matchScore >= 85 && (
								<Badge className="gap-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
									<SparkleIcon className="size-3" weight="fill" />
									{job.matchScore}%
								</Badge>
							)}
							<Button
								variant="ghost"
								size="icon"
								className="size-8"
								onClick={(e) => {
									e.stopPropagation();
									toggleSaveJob(job.id);
								}}
								disabled={isSavePending}
							>
								<BookmarkSimpleIcon
									className={cn("size-4", job.isSaved && "text-amber-500")}
									weight={job.isSaved ? "fill" : "regular"}
								/>
							</Button>
						</div>
					</div>

					<CardTitle className="line-clamp-1 text-lg group-hover:text-primary">{job.title}</CardTitle>
					<CardDescription className="flex items-center gap-2">
						<BuildingsIcon className="size-4" />
						{job.company}
					</CardDescription>
				</CardHeader>

				<CardContent className="space-y-3 pb-2">
					<div className="flex flex-wrap gap-2">
						<Badge className={industryConf.color}>
							<IndustryIcon className="mr-1 size-3" />
							{industryConf.label}
						</Badge>
						<Badge variant="outline" className="gap-1">
							{(() => {
								const WTIcon = workTypeConfig[job.workType].icon;
								return <WTIcon className="size-3" />;
							})()}
							{workTypeConfig[job.workType].label}
						</Badge>
					</div>

					<div className="flex items-center gap-2 text-muted-foreground text-sm">
						<MapPinIcon className="size-4" />
						{job.location}
					</div>

					{job.salaryMin && job.salaryMax && (
						<div className="flex items-center gap-2 font-medium text-green-600 text-sm dark:text-green-400">
							<CurrencyCircleDollarIcon className="size-4" />
							{formatCurrency(job.salaryMin)} - {formatCurrency(job.salaryMax)}
						</div>
					)}

					<div className="flex items-center gap-2 text-muted-foreground text-xs">
						<CalendarIcon className="size-3" />
						{getDaysAgo(job.postedDate)}
					</div>
				</CardContent>

				<CardFooter className="flex items-center justify-between pt-2">
					<Badge className={cn("text-xs", statusConf.color)}>
						{(() => {
							const StatusIcon = statusConf.icon;
							return <StatusIcon className="mr-1 size-3" />;
						})()}
						{statusConf.label}
					</Badge>
					<Button
						variant="ghost"
						size="sm"
						className={cn("gap-1", isInCompare && "text-primary")}
						onClick={(e) => {
							e.stopPropagation();
							toggleCompareJob(job);
						}}
					>
						<ArrowsLeftRightIcon className="size-4" />
						{isInCompare ? <Trans>Remove</Trans> : <Trans>Compare</Trans>}
					</Button>
				</CardFooter>
			</Card>
		</motion.div>
	);
}

// Job Cards Grid with pagination
export function JobCardsGrid({
	paginatedJobs,
	compareJobs,
	filteredJobsCount,
	toggleSaveJob,
	toggleCompareJob,
	setSelectedJob,
	isSavePending,
	clearFilters,
	currentPage,
	totalPages,
	setCurrentPage,
	setIsCompareOpen,
}: {
	paginatedJobs: AggregatedJob[];
	compareJobs: AggregatedJob[];
	filteredJobsCount: number;
	toggleSaveJob: (jobId: string) => void;
	toggleCompareJob: (job: AggregatedJob) => void;
	setSelectedJob: Dispatch<SetStateAction<AggregatedJob | null>>;
	isSavePending: boolean;
	clearFilters: () => void;
	currentPage: number;
	totalPages: number;
	setCurrentPage: Dispatch<SetStateAction<number>>;
	setIsCompareOpen: Dispatch<SetStateAction<boolean>>;
}) {
	return (
		<>
			{/* Results count */}
			<div className="flex items-center justify-between">
				<p className="text-muted-foreground text-sm">
					{filteredJobsCount} <Trans>offers found</Trans>
				</p>
				{compareJobs.length > 0 && (
					<Button variant="outline" size="sm" className="gap-2" onClick={() => setIsCompareOpen(true)}>
						<ArrowsLeftRightIcon className="size-4" />
						<Trans>Compare</Trans> ({compareJobs.length})
					</Button>
				)}
			</div>

			{/* Job Cards Grid */}
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
				<AnimatePresence mode="popLayout">
					{paginatedJobs.map((job, index) => (
						<JobCard
							key={job.id}
							job={job}
							index={index}
							isInCompare={compareJobs.some((j) => j.id === job.id)}
							toggleSaveJob={toggleSaveJob}
							toggleCompareJob={toggleCompareJob}
							setSelectedJob={setSelectedJob}
							isSavePending={isSavePending}
						/>
					))}
				</AnimatePresence>
			</div>

			{filteredJobsCount === 0 && (
				<Card className="border-dashed">
					<CardContent className="flex flex-col items-center justify-center py-16">
						<MagnifyingGlassIcon className="mb-4 size-16 text-muted-foreground/50" weight="duotone" />
						<h3 className="mb-2 font-semibold text-lg">
							<Trans>No offers found</Trans>
						</h3>
						<p className="mb-4 text-center text-muted-foreground">
							<Trans>Try changing your search criteria</Trans>
						</p>
						<Button variant="outline" onClick={clearFilters}>
							<Trans>Clear filters</Trans>
						</Button>
					</CardContent>
				</Card>
			)}

			{/* Pagination */}
			{totalPages > 1 && (
				<Pagination currentPage={currentPage} totalPages={totalPages} setCurrentPage={setCurrentPage} />
			)}
		</>
	);
}

// Pagination
function Pagination({
	currentPage,
	totalPages,
	setCurrentPage,
}: {
	currentPage: number;
	totalPages: number;
	setCurrentPage: Dispatch<SetStateAction<number>>;
}) {
	return (
		<div className="flex items-center justify-center gap-2">
			<Button variant="outline" size="icon" disabled={currentPage === 1} onClick={() => setCurrentPage((p) => p - 1)}>
				<CaretLeftIcon className="size-4" />
			</Button>
			<span className="text-muted-foreground text-sm">
				<Trans>
					Page {currentPage} of {totalPages}
				</Trans>
			</span>
			<Button
				variant="outline"
				size="icon"
				disabled={currentPage === totalPages}
				onClick={() => setCurrentPage((p) => p + 1)}
			>
				<CaretRightIcon className="size-4" />
			</Button>
		</div>
	);
}

// Saved Searches Section
export function SavedSearchesSection({
	savedSearches,
	loadSavedSearch,
	deleteSavedSearch,
	isDeletePending,
}: {
	savedSearches: SavedSearch[];
	loadSavedSearch: (search: SavedSearch) => void;
	deleteSavedSearch: (searchId: string) => void;
	isDeletePending: boolean;
}) {
	return (
		<section>
			<h3 className="mb-4 flex items-center gap-2 font-semibold text-xl">
				<FloppyDiskIcon className="size-5 text-primary" weight="duotone" />
				<Trans>Saved Searches</Trans>
			</h3>

			{savedSearches.length > 0 ? (
				<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
					{savedSearches.map((search) => (
						<Card key={search.id} className="transition-all hover:shadow-md">
							<CardContent className="p-4">
								<div className="mb-3 flex items-start justify-between">
									<div>
										<h4 className="font-semibold">{search.name}</h4>
										<p className="text-muted-foreground text-sm">{search.query || "All positions"}</p>
									</div>
									<Button
										variant="ghost"
										size="icon"
										className="size-8 text-red-500 hover:text-red-600"
										onClick={() => deleteSavedSearch(search.id)}
										disabled={isDeletePending}
									>
										<XIcon className="size-4" />
									</Button>
								</div>
								<div className="mb-3 flex flex-wrap gap-1">
									{search.filters.industries.map((ind) => (
										<Badge key={ind} variant="secondary" className="text-xs">
											{industryConfig[ind].label}
										</Badge>
									))}
									{search.filters.locations.map((loc) => (
										<Badge key={loc} variant="secondary" className="text-xs">
											{loc}
										</Badge>
									))}
								</div>
								<div className="flex items-center justify-between">
									<span className="text-muted-foreground text-xs">{search.resultsCount} results</span>
									<Button size="sm" variant="outline" className="gap-1" onClick={() => loadSavedSearch(search)}>
										<MagnifyingGlassIcon className="size-3" />
										<Trans>Load</Trans>
									</Button>
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			) : (
				<Card className="border-dashed">
					<CardContent className="py-8 text-center">
						<FloppyDiskIcon className="mx-auto mb-4 size-12 text-muted-foreground/50" weight="duotone" />
						<p className="text-muted-foreground">
							<Trans>No saved searches</Trans>
						</p>
					</CardContent>
				</Card>
			)}
		</section>
	);
}

// Saved Jobs Section
export function SavedJobsSection({
	savedJobs,
	toggleSaveJob,
	setSelectedJob,
	isSavePending,
}: {
	savedJobs: AggregatedJob[];
	toggleSaveJob: (jobId: string) => void;
	setSelectedJob: Dispatch<SetStateAction<AggregatedJob | null>>;
	isSavePending: boolean;
}) {
	return (
		<section>
			<h3 className="mb-4 flex items-center gap-2 font-semibold text-xl">
				<BookmarkSimpleIcon className="size-5 text-amber-500" weight="fill" />
				<Trans>Saved Listings</Trans> ({savedJobs.length})
			</h3>

			{savedJobs.length > 0 ? (
				<div className="grid gap-4 md:grid-cols-2">
					{savedJobs.map((job) => {
						const sourceConf = sourceConfig[job.source];
						const SourceIcon = sourceConf.icon;
						return (
							<Card
								key={job.id}
								className="cursor-pointer transition-all hover:shadow-md"
								onClick={() => setSelectedJob(job)}
							>
								<CardContent className="p-4">
									<div className="flex items-start gap-4">
										<div className={cn("flex size-12 items-center justify-center rounded-xl", sourceConf.bgColor)}>
											<SourceIcon className={cn("size-6", sourceConf.color)} weight="fill" />
										</div>
										<div className="min-w-0 flex-1">
											<div className="flex items-start justify-between gap-2">
												<div>
													<h4 className="line-clamp-1 font-semibold">{job.title}</h4>
													<p className="text-muted-foreground text-sm">{job.company}</p>
												</div>
												<Button
													variant="ghost"
													size="icon"
													className="size-8"
													onClick={(e) => {
														e.stopPropagation();
														toggleSaveJob(job.id);
													}}
													disabled={isSavePending}
												>
													<BookmarkSimpleIcon className="size-4 text-amber-500" weight="fill" />
												</Button>
											</div>
											<div className="mt-2 flex flex-wrap gap-2">
												<Badge variant="outline" className="text-xs">
													<MapPinIcon className="mr-1 size-3" />
													{job.location}
												</Badge>
												{job.salaryMin && job.salaryMax && (
													<Badge variant="outline" className="text-green-600 text-xs">
														{formatCurrency(job.salaryMin)} - {formatCurrency(job.salaryMax)}
													</Badge>
												)}
											</div>
										</div>
									</div>
								</CardContent>
							</Card>
						);
					})}
				</div>
			) : (
				<Card className="border-dashed">
					<CardContent className="py-8 text-center">
						<BookmarkSimpleIcon className="mx-auto mb-4 size-12 text-muted-foreground/50" weight="duotone" />
						<p className="text-muted-foreground">
							<Trans>No saved offers</Trans>
						</p>
					</CardContent>
				</Card>
			)}
		</section>
	);
}

// Compare Tab Content
export function CompareTabContent({
	compareJobs,
	setCompareJobs,
	setSelectedJob,
	toggleCompareJob,
	toggleSaveJob,
	isSavePending,
	setActiveTab,
}: {
	compareJobs: AggregatedJob[];
	setCompareJobs: Dispatch<SetStateAction<AggregatedJob[]>>;
	setSelectedJob: Dispatch<SetStateAction<AggregatedJob | null>>;
	toggleCompareJob: (job: AggregatedJob) => void;
	toggleSaveJob: (jobId: string) => void;
	isSavePending: boolean;
	setActiveTab: Dispatch<SetStateAction<string>>;
}) {
	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h3 className="flex items-center gap-2 font-semibold text-xl">
						<ArrowsLeftRightIcon className="size-5 text-primary" weight="duotone" />
						<Trans>Job Comparison</Trans>
					</h3>
					<p className="text-muted-foreground text-sm">
						<Trans>Select up to 3 listings to compare them</Trans>
					</p>
				</div>
				{compareJobs.length > 0 && (
					<Button variant="outline" size="sm" onClick={() => setCompareJobs([])}>
						<XIcon className="mr-2 size-4" />
						<Trans>Tout effacer</Trans>
					</Button>
				)}
			</div>

			{compareJobs.length > 0 ? (
				<div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
					<table className="w-full min-w-[600px]">
						<thead>
							<tr>
								<th className="p-3 text-left font-medium text-muted-foreground text-sm">
									<Trans>Criteria</Trans>
								</th>
								{compareJobs.map((job) => (
									<th key={job.id} className="p-3 text-left">
										<div className="flex items-center justify-between">
											<div>
												<p className="font-semibold">{job.title}</p>
												<p className="font-normal text-muted-foreground text-sm">{job.company}</p>
											</div>
											<Button variant="ghost" size="icon" className="size-6" onClick={() => toggleCompareJob(job)}>
												<XIcon className="size-3" />
											</Button>
										</div>
									</th>
								))}
							</tr>
						</thead>
						<tbody className="divide-y">
							<tr className="bg-muted/30">
								<td className="p-3 font-medium">
									<Trans>Source</Trans>
								</td>
								{compareJobs.map((job) => {
									const conf = sourceConfig[job.source];
									const Icon = conf.icon;
									return (
										<td key={job.id} className="p-3">
											<Badge className={cn("gap-1", conf.bgColor, conf.color)}>
												<Icon className="size-3" weight="fill" />
												{conf.label}
											</Badge>
										</td>
									);
								})}
							</tr>
							<tr>
								<td className="p-3 font-medium">
									<Trans>Salary</Trans>
								</td>
								{compareJobs.map((job) => (
									<td key={job.id} className="p-3">
										{job.salaryMin && job.salaryMax ? (
											<span className="font-medium text-green-600 dark:text-green-400">
												{formatCurrency(job.salaryMin)} - {formatCurrency(job.salaryMax)}
											</span>
										) : (
											<span className="text-muted-foreground">
												<Trans>Not disclosed</Trans>
											</span>
										)}
									</td>
								))}
							</tr>
							<tr className="bg-muted/30">
								<td className="p-3 font-medium">
									<Trans>Location</Trans>
								</td>
								{compareJobs.map((job) => (
									<td key={job.id} className="p-3">
										<div className="flex items-center gap-2">
											<MapPinIcon className="size-4 text-muted-foreground" />
											{job.location}
										</div>
									</td>
								))}
							</tr>
							<tr>
								<td className="p-3 font-medium">
									<Trans>Work type</Trans>
								</td>
								{compareJobs.map((job) => (
									<td key={job.id} className="p-3">
										<Badge variant="outline">{workTypeConfig[job.workType].label}</Badge>
									</td>
								))}
							</tr>
							<tr className="bg-muted/30">
								<td className="p-3 font-medium">
									<Trans>Experience</Trans>
								</td>
								{compareJobs.map((job) => (
									<td key={job.id} className="p-3">
										{experienceConfig[job.experienceLevel].label} ({experienceConfig[job.experienceLevel].years})
									</td>
								))}
							</tr>
							<tr>
								<td className="p-3 font-medium">
									<Trans>Sector</Trans>
								</td>
								{compareJobs.map((job) => {
									const conf = industryConfig[job.industry];
									return (
										<td key={job.id} className="p-3">
											<Badge className={conf.color}>{conf.label}</Badge>
										</td>
									);
								})}
							</tr>
							<tr className="bg-muted/30">
								<td className="p-3 font-medium">
									<Trans>Match</Trans>
								</td>
								{compareJobs.map((job) => (
									<td key={job.id} className="p-3">
										{job.matchScore ? (
											<Badge
												className={cn(
													"gap-1",
													job.matchScore >= 85
														? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
														: job.matchScore >= 70
															? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
															: "bg-gray-100 text-gray-700 dark:bg-gray-800/30 dark:text-gray-400",
												)}
											>
												<SparkleIcon className="size-3" weight="fill" />
												{job.matchScore}%
											</Badge>
										) : (
											"-"
										)}
									</td>
								))}
							</tr>
							<tr>
								<td className="p-3 font-medium">
									<Trans>Benefits</Trans>
								</td>
								{compareJobs.map((job) => (
									<td key={job.id} className="p-3">
										<div className="flex flex-wrap gap-1">
											{job.benefits.slice(0, 3).map((benefit) => (
												<Badge key={benefit} variant="secondary" className="text-xs">
													{benefit}
												</Badge>
											))}
											{job.benefits.length > 3 && (
												<Badge variant="secondary" className="text-xs">
													+{job.benefits.length - 3}
												</Badge>
											)}
										</div>
									</td>
								))}
							</tr>
							<tr className="bg-muted/30">
								<td className="p-3 font-medium">
									<Trans>Actions</Trans>
								</td>
								{compareJobs.map((job) => (
									<td key={job.id} className="p-3">
										<div className="flex gap-2">
											<Button size="sm" variant="outline" onClick={() => setSelectedJob(job)}>
												<Trans>Details</Trans>
											</Button>
											<Button
												size="sm"
												variant={job.isSaved ? "secondary" : "outline"}
												onClick={() => toggleSaveJob(job.id)}
												disabled={isSavePending}
											>
												<BookmarkSimpleIcon
													className={cn("size-4", job.isSaved && "text-amber-500")}
													weight={job.isSaved ? "fill" : "regular"}
												/>
											</Button>
										</div>
									</td>
								))}
							</tr>
						</tbody>
					</table>
				</div>
			) : (
				<Card className="border-dashed">
					<CardContent className="py-16 text-center">
						<ArrowsLeftRightIcon className="mx-auto mb-4 size-16 text-muted-foreground/50" weight="duotone" />
						<h3 className="mb-2 font-semibold text-lg">
							<Trans>No offers to compare</Trans>
						</h3>
						<p className="mb-4 text-muted-foreground">
							<Trans>Select listings from the search tab to compare them</Trans>
						</p>
						<Button onClick={() => setActiveTab("search")}>
							<MagnifyingGlassIcon className="mr-2 size-4" />
							<Trans>Search for offers</Trans>
						</Button>
					</CardContent>
				</Card>
			)}
		</div>
	);
}

// Tracking Tab Content
export function TrackingTabContent({
	jobs,
	setSelectedJob,
}: {
	jobs: AggregatedJob[];
	setSelectedJob: Dispatch<SetStateAction<AggregatedJob | null>>;
}) {
	return (
		<div className="space-y-6">
			<h3 className="flex items-center gap-2 font-semibold text-xl">
				<ListIcon className="size-5 text-primary" weight="duotone" />
				<Trans>Application Tracking</Trans>
			</h3>

			{/* Status columns */}
			<div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-5">
				{(Object.keys(applicationStatusConfig) as ApplicationStatus[]).map((status) => {
					const statusJobs = jobs.filter((j) => j.applicationStatus === status);
					const conf = applicationStatusConfig[status];
					const StatusIcon = conf.icon;

					return (
						<div key={status} className="space-y-3">
							<div className="flex items-center justify-between">
								<Badge className={cn("gap-1", conf.color)}>
									<StatusIcon className="size-3" />
									{conf.label}
								</Badge>
								<span className="font-medium text-muted-foreground text-sm">{statusJobs.length}</span>
							</div>
							<div className="space-y-2">
								{statusJobs.slice(0, 5).map((job) => (
									<Card
										key={job.id}
										className="cursor-pointer transition-all hover:shadow-md"
										onClick={() => setSelectedJob(job)}
									>
										<CardContent className="p-3">
											<h4 className="line-clamp-1 font-medium text-sm">{job.title}</h4>
											<p className="line-clamp-1 text-muted-foreground text-xs">{job.company}</p>
										</CardContent>
									</Card>
								))}
								{statusJobs.length > 5 && (
									<p className="text-center text-muted-foreground text-xs">+{statusJobs.length - 5} more</p>
								)}
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
}

// Recommendations Tab Content
export function RecommendationsTabContent() {
	return (
		<div className="space-y-8">
			<div>
				<h3 className="mb-2 flex items-center gap-2 font-semibold text-xl">
					<LightbulbIcon className="size-5 text-amber-500" weight="fill" />
					<Trans>Recommendations by Industry</Trans>
				</h3>
				<p className="text-muted-foreground">
					<Trans>Discover the best platforms and search strategies for your field</Trans>
				</p>
			</div>

			<div className="grid gap-6 lg:grid-cols-2">
				{industryRecommendations.map((rec) => {
					const conf = industryConfig[rec.industry];
					const IndustryIcon = conf.icon;

					return (
						<Card key={rec.industry} className="overflow-hidden">
							<div className={cn("h-2 w-full", conf.color.replace("text-", "bg-").split(" ")[0])} />
							<CardHeader>
								<div className="flex items-center gap-3">
									<div className={cn("flex size-12 items-center justify-center rounded-xl", conf.color)}>
										<IndustryIcon className="size-6" weight="duotone" />
									</div>
									<div>
										<CardTitle>{conf.label}</CardTitle>
										<CardDescription>
											<Trans>Best recruitment platforms</Trans>
										</CardDescription>
									</div>
								</div>
							</CardHeader>
							<CardContent className="space-y-4">
								{/* Platform recommendations */}
								<div className="space-y-2">
									{rec.platforms.map((platform) => {
										const sourceConf = sourceConfig[platform.source];
										const SourceIcon = sourceConf.icon;
										return (
											<div
												key={platform.source}
												className="flex items-center justify-between rounded-lg bg-muted/50 p-3"
											>
												<div className="flex items-center gap-3">
													<SourceIcon className={cn("size-5", sourceConf.color)} weight="fill" />
													<div>
														<p className="font-medium">{sourceConf.label}</p>
														<p className="text-muted-foreground text-xs">{platform.description}</p>
													</div>
												</div>
												<Badge
													className={cn(
														"text-xs",
														platform.strength === "high" &&
															"bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
														platform.strength === "medium" &&
															"bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
														platform.strength === "low" &&
															"bg-gray-100 text-gray-600 dark:bg-gray-800/30 dark:text-gray-400",
													)}
												>
													{platform.strength === "high" && <Trans>Excellent</Trans>}
													{platform.strength === "medium" && <Trans>Good</Trans>}
													{platform.strength === "low" && <Trans>Limited</Trans>}
												</Badge>
											</div>
										);
									})}
								</div>

								{/* Tips */}
								<div>
									<h4 className="mb-2 font-medium text-sm">
										<Trans>Tips</Trans>
									</h4>
									<ul className="space-y-1">
										{rec.tips.map((tip) => (
											<li key={tip} className="flex items-start gap-2 text-muted-foreground text-sm">
												<CheckCircleIcon className="mt-0.5 size-4 shrink-0 text-green-500" weight="fill" />
												{tip}
											</li>
										))}
									</ul>
								</div>
							</CardContent>
						</Card>
					);
				})}
			</div>
		</div>
	);
}

// Filter Sheet
export function FilterSheet({
	isOpen,
	onOpenChange,
	filters,
	setFilters,
	clearFilters,
}: {
	isOpen: boolean;
	onOpenChange: Dispatch<SetStateAction<boolean>>;
	filters: SearchFilters;
	setFilters: Dispatch<SetStateAction<SearchFilters>>;
	clearFilters: () => void;
}) {
	return (
		<Sheet open={isOpen} onOpenChange={onOpenChange}>
			<SheetContent className="w-full overflow-y-auto sm:max-w-md">
				<SheetHeader>
					<SheetTitle>
						<Trans>Advanced Filters</Trans>
					</SheetTitle>
					<SheetDescription>
						<Trans>Refine your search with detailed criteria</Trans>
					</SheetDescription>
				</SheetHeader>

				<div className="space-y-6 py-6">
					{/* Salary Range */}
					<div className="space-y-4">
						<Label className="flex items-center gap-2">
							<CurrencyCircleDollarIcon className="size-4" />
							<Trans>Salary range (MAD)</Trans>
						</Label>
						<div className="px-2">
							<Slider
								min={0}
								max={30000}
								step={1000}
								value={[filters.salaryMin, filters.salaryMax]}
								onValueChange={([min, max]) => setFilters((prev) => ({ ...prev, salaryMin: min, salaryMax: max }))}
							/>
						</div>
						<div className="flex items-center justify-between text-muted-foreground text-sm">
							<span>{formatCurrency(filters.salaryMin)}</span>
							<span>{formatCurrency(filters.salaryMax)}</span>
						</div>
					</div>

					{/* Locations */}
					<div className="space-y-3">
						<Label className="flex items-center gap-2">
							<MapPinIcon className="size-4" />
							<Trans>Location</Trans>
						</Label>
						<div className="grid grid-cols-2 gap-2">
							{locations.map((loc) => (
								<div key={loc} className="flex items-center space-x-2">
									<Checkbox
										id={`loc-${loc}`}
										checked={filters.locations.includes(loc)}
										onCheckedChange={(checked) =>
											setFilters((prev) => ({
												...prev,
												locations: checked ? [...prev.locations, loc] : prev.locations.filter((l) => l !== loc),
											}))
										}
									/>
									<Label htmlFor={`loc-${loc}`} className="cursor-pointer text-sm">
										{loc}
									</Label>
								</div>
							))}
						</div>
					</div>

					{/* Work Type */}
					<div className="space-y-3">
						<Label className="flex items-center gap-2">
							<HouseIcon className="size-4" />
							<Trans>Work type</Trans>
						</Label>
						<div className="flex flex-wrap gap-2">
							{(Object.keys(workTypeConfig) as WorkType[]).map((wt) => {
								const conf = workTypeConfig[wt];
								const WTIcon = conf.icon;
								const isActive = filters.workTypes.includes(wt);
								return (
									<Button
										key={wt}
										variant={isActive ? "default" : "outline"}
										size="sm"
										className="gap-2"
										onClick={() =>
											setFilters((prev) => ({
												...prev,
												workTypes: isActive ? prev.workTypes.filter((w) => w !== wt) : [...prev.workTypes, wt],
											}))
										}
									>
										<WTIcon className="size-4" />
										{conf.label}
									</Button>
								);
							})}
						</div>
					</div>

					{/* Experience Level */}
					<div className="space-y-3">
						<Label className="flex items-center gap-2">
							<GraduationCapIcon className="size-4" />
							<Trans>Experience level</Trans>
						</Label>
						<div className="space-y-2">
							{(Object.keys(experienceConfig) as ExperienceLevel[]).map((exp) => {
								const conf = experienceConfig[exp];
								return (
									<div key={exp} className="flex items-center space-x-2">
										<Checkbox
											id={`exp-${exp}`}
											checked={filters.experienceLevels.includes(exp)}
											onCheckedChange={(checked) =>
												setFilters((prev) => ({
													...prev,
													experienceLevels: checked
														? [...prev.experienceLevels, exp]
														: prev.experienceLevels.filter((e) => e !== exp),
												}))
											}
										/>
										<Label htmlFor={`exp-${exp}`} className="cursor-pointer text-sm">
											{conf.label} <span className="text-muted-foreground">({conf.years})</span>
										</Label>
									</div>
								);
							})}
						</div>
					</div>

					{/* Industry */}
					<div className="space-y-3">
						<Label className="flex items-center gap-2">
							<FactoryIcon className="size-4" />
							<Trans>Industry sector</Trans>
						</Label>
						<div className="grid grid-cols-2 gap-2">
							{(Object.keys(industryConfig) as Industry[]).map((ind) => {
								const conf = industryConfig[ind];
								const IndIcon = conf.icon;
								const isActive = filters.industries.includes(ind);
								return (
									<Button
										key={ind}
										variant={isActive ? "default" : "outline"}
										size="sm"
										className={cn("justify-start gap-2", isActive && conf.color)}
										onClick={() =>
											setFilters((prev) => ({
												...prev,
												industries: isActive ? prev.industries.filter((i) => i !== ind) : [...prev.industries, ind],
											}))
										}
									>
										<IndIcon className="size-4" />
										{conf.label}
									</Button>
								);
							})}
						</div>
					</div>
				</div>

				<SheetFooter>
					<Button variant="outline" onClick={clearFilters}>
						<Trans>Reset</Trans>
					</Button>
					<SheetClose asChild>
						<Button>
							<Trans>Apply</Trans>
						</Button>
					</SheetClose>
				</SheetFooter>
			</SheetContent>
		</Sheet>
	);
}

// Save Search Dialog
export function SaveSearchDialog({
	isOpen,
	onOpenChange,
	saveSearchName,
	setSaveSearchName,
	searchQuery,
	filters,
	saveSearch,
	isPending,
}: {
	isOpen: boolean;
	onOpenChange: Dispatch<SetStateAction<boolean>>;
	saveSearchName: string;
	setSaveSearchName: Dispatch<SetStateAction<string>>;
	searchQuery: string;
	filters: SearchFilters;
	saveSearch: () => void;
	isPending: boolean;
}) {
	return (
		<Dialog open={isOpen} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>
						<Trans>Save search</Trans>
					</DialogTitle>
					<DialogDescription>
						<Trans>Name this search to find it easily later</Trans>
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-4 py-4">
					<div className="space-y-2">
						<Label>
							<Trans>Search name</Trans>
						</Label>
						<Input
							placeholder={t`E.g.: HSE Positions Casablanca`}
							value={saveSearchName}
							onChange={(e) => setSaveSearchName(e.target.value)}
						/>
					</div>
					<div className="rounded-lg bg-muted/50 p-3">
						<p className="mb-2 font-medium text-sm">
							<Trans>Current criteria:</Trans>
						</p>
						<div className="flex flex-wrap gap-1">
							{searchQuery && <Badge variant="secondary">"{searchQuery}"</Badge>}
							{filters.industries.map((ind) => (
								<Badge key={ind} variant="secondary">
									{industryConfig[ind].label}
								</Badge>
							))}
							{filters.locations.map((loc) => (
								<Badge key={loc} variant="secondary">
									{loc}
								</Badge>
							))}
							{filters.workTypes.map((wt) => (
								<Badge key={wt} variant="secondary">
									{workTypeConfig[wt].label}
								</Badge>
							))}
						</div>
					</div>
				</div>

				<DialogFooter>
					<DialogClose asChild>
						<Button variant="outline">
							<Trans>Cancel</Trans>
						</Button>
					</DialogClose>
					<Button onClick={saveSearch} disabled={!saveSearchName.trim() || isPending}>
						{isPending && <SpinnerIcon className="mr-2 size-4 animate-spin" />}
						<FloppyDiskIcon className="mr-2 size-4" />
						<Trans>Save</Trans>
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

// Job Detail Dialog
export function JobDetailDialog({
	selectedJob,
	setSelectedJob,
	toggleSaveJob,
	isSavePending,
	updateApplicationStatus,
	toggleCompareJob,
	compareJobs,
}: {
	selectedJob: AggregatedJob | null;
	setSelectedJob: Dispatch<SetStateAction<AggregatedJob | null>>;
	toggleSaveJob: (jobId: string) => void;
	isSavePending: boolean;
	updateApplicationStatus: (jobId: string, status: ApplicationStatus) => void;
	toggleCompareJob: (job: AggregatedJob) => void;
	compareJobs: AggregatedJob[];
}) {
	return (
		<Dialog open={!!selectedJob} onOpenChange={() => setSelectedJob(null)}>
			<DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
				{selectedJob && (
					<>
						<DialogHeader>
							<div className="mb-4 flex items-start gap-4">
								<div
									className={cn(
										"flex size-16 items-center justify-center rounded-2xl",
										sourceConfig[selectedJob.source].bgColor,
									)}
								>
									{(() => {
										const SourceIcon = sourceConfig[selectedJob.source].icon;
										return (
											<SourceIcon className={cn("size-8", sourceConfig[selectedJob.source].color)} weight="fill" />
										);
									})()}
								</div>
								<div className="flex-1">
									<DialogTitle className="text-2xl">{selectedJob.title}</DialogTitle>
									<DialogDescription className="flex items-center gap-2 text-base">
										<BuildingsIcon className="size-4" />
										{selectedJob.company}
									</DialogDescription>
								</div>
								<Button
									variant="ghost"
									size="icon"
									onClick={() => toggleSaveJob(selectedJob.id)}
									disabled={isSavePending}
								>
									<BookmarkSimpleIcon
										className={cn("size-5", selectedJob.isSaved && "text-amber-500")}
										weight={selectedJob.isSaved ? "fill" : "regular"}
									/>
								</Button>
							</div>

							<div className="flex flex-wrap gap-2">
								<Badge className={industryConfig[selectedJob.industry].color}>
									{industryConfig[selectedJob.industry].label}
								</Badge>
								<Badge variant="outline" className="gap-1">
									<MapPinIcon className="size-3" />
									{selectedJob.location}
								</Badge>
								<Badge variant="outline">{workTypeConfig[selectedJob.workType].label}</Badge>
								<Badge variant="outline">{experienceConfig[selectedJob.experienceLevel].label}</Badge>
								{selectedJob.salaryMin && selectedJob.salaryMax && (
									<Badge className="gap-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
										<CurrencyCircleDollarIcon className="size-3" />
										{formatCurrency(selectedJob.salaryMin)} - {formatCurrency(selectedJob.salaryMax)}
									</Badge>
								)}
								{selectedJob.matchScore && selectedJob.matchScore >= 80 && (
									<Badge className="gap-1 bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
										<SparkleIcon className="size-3" weight="fill" />
										Match {selectedJob.matchScore}%
									</Badge>
								)}
							</div>
						</DialogHeader>

						<div className="space-y-6 py-4">
							{/* Description */}
							<div>
								<h4 className="mb-2 font-semibold">
									<Trans>Job description</Trans>
								</h4>
								<p className="text-muted-foreground">{selectedJob.description}</p>
							</div>

							{/* Requirements */}
							<div>
								<h4 className="mb-2 font-semibold">
									<Trans>Requirements</Trans>
								</h4>
								<ul className="space-y-2">
									{selectedJob.requirements.map((req) => (
										<li key={req} className="flex items-start gap-2 text-muted-foreground">
											<CheckCircleIcon className="mt-0.5 size-4 shrink-0 text-green-500" weight="fill" />
											{req}
										</li>
									))}
								</ul>
							</div>

							{/* Skills */}
							<div>
								<h4 className="mb-2 font-semibold">
									<Trans>Required skills</Trans>
								</h4>
								<div className="flex flex-wrap gap-2">
									{selectedJob.skills.map((skill) => (
										<Badge key={skill} variant="secondary">
											{skill}
										</Badge>
									))}
								</div>
							</div>

							{/* Benefits */}
							<div>
								<h4 className="mb-2 font-semibold">
									<Trans>Benefits</Trans>
								</h4>
								<div className="flex flex-wrap gap-2">
									{selectedJob.benefits.map((benefit) => (
										<Badge key={benefit} variant="outline" className="gap-1 text-green-600">
											<CheckCircleIcon className="size-3" weight="fill" />
											{benefit}
										</Badge>
									))}
								</div>
							</div>

							{/* Application Status */}
							<div className="rounded-lg border bg-muted/30 p-4">
								<h4 className="mb-3 font-semibold">
									<Trans>Application status</Trans>
								</h4>
								<Select
									value={selectedJob.applicationStatus}
									onValueChange={(v) => {
										updateApplicationStatus(selectedJob.id, v as ApplicationStatus);
										setSelectedJob({ ...selectedJob, applicationStatus: v as ApplicationStatus });
									}}
								>
									<SelectTrigger className="w-full">
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										{(Object.keys(applicationStatusConfig) as ApplicationStatus[]).map((status) => {
											const conf = applicationStatusConfig[status];
											const StatusIcon = conf.icon;
											return (
												<SelectItem key={status} value={status}>
													<div className="flex items-center gap-2">
														<StatusIcon className="size-4" />
														{conf.label}
													</div>
												</SelectItem>
											);
										})}
									</SelectContent>
								</Select>
							</div>
						</div>

						<DialogFooter className="flex-col gap-2 sm:flex-row">
							<DialogClose asChild>
								<Button variant="outline">
									<Trans>Close</Trans>
								</Button>
							</DialogClose>
							<Button
								variant="outline"
								className={cn(compareJobs.some((j) => j.id === selectedJob.id) && "text-primary")}
								onClick={() => toggleCompareJob(selectedJob)}
							>
								<ArrowsLeftRightIcon className="mr-2 size-4" />
								{compareJobs.some((j) => j.id === selectedJob.id) ? (
									<Trans>Remove from comparison</Trans>
								) : (
									<Trans>Add to comparison</Trans>
								)}
							</Button>
							<Button asChild>
								<a href={selectedJob.sourceUrl} target="_blank" rel="noopener noreferrer">
									<Trans>View on {sourceConfig[selectedJob.source].label}</Trans>
									<CaretRightIcon className="ml-2 size-4" />
								</a>
							</Button>
						</DialogFooter>
					</>
				)}
			</DialogContent>
		</Dialog>
	);
}

// Compare Dialog (quick compare popup)
export function CompareDialog({
	isOpen,
	onOpenChange,
	compareJobs,
}: {
	isOpen: boolean;
	onOpenChange: Dispatch<SetStateAction<boolean>>;
	compareJobs: AggregatedJob[];
}) {
	return (
		<Dialog open={isOpen} onOpenChange={onOpenChange}>
			<DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
				<DialogHeader>
					<DialogTitle>
						<Trans>Job comparison</Trans>
					</DialogTitle>
					<DialogDescription>
						<Trans>Compare details of {compareJobs.length} selected listings</Trans>
					</DialogDescription>
				</DialogHeader>

				{compareJobs.length > 0 && (
					<div className="overflow-x-auto py-4">
						<table className="w-full min-w-[500px]">
							<thead>
								<tr>
									<th className="p-2 text-left font-medium text-muted-foreground text-sm" />
									{compareJobs.map((job) => (
										<th key={job.id} className="p-2 text-left">
											<div className="space-y-1">
												<p className="font-semibold">{job.title}</p>
												<p className="font-normal text-muted-foreground text-sm">{job.company}</p>
											</div>
										</th>
									))}
								</tr>
							</thead>
							<tbody className="divide-y">
								<tr>
									<td className="p-2 font-medium">
										<Trans>Salary</Trans>
									</td>
									{compareJobs.map((job) => (
										<td key={job.id} className="p-2 font-medium text-green-600 dark:text-green-400">
											{job.salaryMin && job.salaryMax
												? `${formatCurrency(job.salaryMin)} - ${formatCurrency(job.salaryMax)}`
												: "-"}
										</td>
									))}
								</tr>
								<tr>
									<td className="p-2 font-medium">
										<Trans>Location</Trans>
									</td>
									{compareJobs.map((job) => (
										<td key={job.id} className="p-2">
											{job.location}
										</td>
									))}
								</tr>
								<tr>
									<td className="p-2 font-medium">
										<Trans>Type</Trans>
									</td>
									{compareJobs.map((job) => (
										<td key={job.id} className="p-2">
											{workTypeConfig[job.workType].label}
										</td>
									))}
								</tr>
								<tr>
									<td className="p-2 font-medium">
										<Trans>Match</Trans>
									</td>
									{compareJobs.map((job) => (
										<td key={job.id} className="p-2">
											{job.matchScore ? `${job.matchScore}%` : "-"}
										</td>
									))}
								</tr>
							</tbody>
						</table>
					</div>
				)}

				<DialogFooter>
					<DialogClose asChild>
						<Button variant="outline">
							<Trans>Close</Trans>
						</Button>
					</DialogClose>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
