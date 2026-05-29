import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import {
	BookmarkSimpleIcon,
	BriefcaseIcon,
	BuildingsIcon,
	ClockIcon,
	CompassIcon,
	FunnelIcon,
	MagnifyingGlassIcon,
	MapPinIcon,
	SpinnerIcon,
	XIcon,
} from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ErrorComponent } from "@/components/error-component";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useDebounce } from "@/hooks/use-debounce";
import { authClient } from "@/integrations/auth/client";
import { orpc } from "@/integrations/orpc/client";
import { DashboardHeader } from "../-components/header";

// biome-ignore lint/suspicious/noExplicitAny: Route path not in generated route tree
export const Route = createFileRoute("/dashboard/jobs/search" as any)({
	component: JobSearchPage,
	errorComponent: ErrorComponent,
});

function JobSearchPage() {
	const { data: session } = authClient.useSession();
	const [searchQuery, setSearchQuery] = useState("");
	const debouncedSearch = useDebounce(searchQuery, 300);
	const [locationFilter, setLocationFilter] = useState<string>("all");
	const [workTypeFilter, setWorkTypeFilter] = useState<"all" | "onsite" | "remote" | "hybrid">("all");
	const [experienceFilter, setExperienceFilter] = useState<"all" | "entry" | "junior" | "mid" | "senior" | "lead">(
		"all",
	);

	// Fetch jobs from the aggregator
	const {
		data: jobs = [],
		isLoading,
		isError,
	} = useQuery({
		...orpc.jobAggregator.jobs.list.queryOptions({
			input: {
				search: debouncedSearch || undefined,
				locations: locationFilter !== "all" ? [locationFilter] : undefined,
				workTypes: workTypeFilter !== "all" ? [workTypeFilter] : undefined,
				experienceLevels: experienceFilter !== "all" ? [experienceFilter] : undefined,
			},
		}),
		enabled: !!session?.user,
	});

	// Fetch statistics
	const { data: stats } = useQuery({
		...orpc.jobAggregator.jobs.getStatistics.queryOptions(),
		enabled: !!session?.user,
	});

	// Extract unique locations and work types for filter dropdowns
	const filterOptions = useMemo(() => {
		const locations = new Set<string>();
		const workTypes = new Set<string>();

		for (const job of jobs) {
			if (job.location) locations.add(job.location);
			if (job.workType) workTypes.add(job.workType);
		}

		return {
			locations: Array.from(locations).sort(),
			workTypes: Array.from(workTypes).sort(),
		};
	}, [jobs]);

	const hasActiveFilters = locationFilter !== "all" || workTypeFilter !== "all" || experienceFilter !== "all";

	function clearFilters() {
		setLocationFilter("all");
		setWorkTypeFilter("all");
		setExperienceFilter("all");
		setSearchQuery("");
	}

	return (
		<>
			<DashboardHeader icon={CompassIcon} title={t`Job Search`} />

			{/* Search hero section */}
			<Card className="mb-6 border-none bg-gradient-to-br from-primary/5 to-primary/10">
				<CardContent className="py-8">
					<div className="mx-auto max-w-2xl text-center">
						<h2 className="mb-2 font-bold text-2xl">
							<Trans>Find your ideal job</Trans>
						</h2>
						<p className="mb-6 text-muted-foreground">
							<Trans>Search among available offers and find the opportunity that matches your profile</Trans>
						</p>

						{/* Main search bar */}
						<div className="relative">
							<MagnifyingGlassIcon className="absolute top-1/2 left-3 size-5 -translate-y-1/2 text-muted-foreground" />
							<Input
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								placeholder={t`Search by title, company, skill...`}
								className="h-12 pr-4 pl-10 text-base"
							/>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Filters row */}
			<div className="mb-6 flex flex-wrap items-center gap-3">
				<div className="flex items-center gap-2">
					<FunnelIcon className="size-4 text-muted-foreground" />
					<span className="font-medium text-muted-foreground text-sm">
						<Trans>Filters</Trans>
					</span>
				</div>

				<Select value={locationFilter} onValueChange={setLocationFilter}>
					<SelectTrigger className="w-[180px]">
						<MapPinIcon className="mr-1 size-4" />
						<SelectValue placeholder={t`Location`} />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">
							<Trans>All locations</Trans>
						</SelectItem>
						{filterOptions.locations.map((loc) => (
							<SelectItem key={loc} value={loc}>
								{loc}
							</SelectItem>
						))}
					</SelectContent>
				</Select>

				<Select value={workTypeFilter} onValueChange={(v) => setWorkTypeFilter(v as typeof workTypeFilter)}>
					<SelectTrigger className="w-[180px]">
						<BriefcaseIcon className="mr-1 size-4" />
						<SelectValue placeholder={t`Type`} />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">
							<Trans>All types</Trans>
						</SelectItem>
						{filterOptions.workTypes.map((wt) => (
							<SelectItem key={wt} value={wt}>
								{wt}
							</SelectItem>
						))}
					</SelectContent>
				</Select>

				<Select value={experienceFilter} onValueChange={(v) => setExperienceFilter(v as typeof experienceFilter)}>
					<SelectTrigger className="w-[180px]">
						<ClockIcon className="mr-1 size-4" />
						<SelectValue placeholder={t`Experience`} />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">
							<Trans>All levels</Trans>
						</SelectItem>
						<SelectItem value="junior">Junior</SelectItem>
						<SelectItem value="mid">
							<Trans>Intermediate</Trans>
						</SelectItem>
						<SelectItem value="senior">Senior</SelectItem>
						<SelectItem value="lead">Lead</SelectItem>
					</SelectContent>
				</Select>

				{hasActiveFilters && (
					<Button variant="ghost" size="sm" onClick={clearFilters}>
						<XIcon className="mr-1 size-4" />
						<Trans>Clear</Trans>
					</Button>
				)}

				<div className="ml-auto text-muted-foreground text-sm">
					{jobs.length > 0 && <Trans>{jobs.length} job(s) found</Trans>}
				</div>
			</div>

			{/* Stats cards */}
			{stats && (
				<div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-3">
					<Card>
						<CardContent className="flex items-center gap-3 py-4">
							<BriefcaseIcon className="size-8 text-primary" weight="duotone" />
							<div>
								<p className="font-bold text-2xl">{stats.total ?? 0}</p>
								<p className="text-muted-foreground text-xs">
									<Trans>Total offers</Trans>
								</p>
							</div>
						</CardContent>
					</Card>
					<Card>
						<CardContent className="flex items-center gap-3 py-4">
							<BookmarkSimpleIcon className="size-8 text-primary" weight="duotone" />
							<div>
								<p className="font-bold text-2xl">{stats.saved ?? 0}</p>
								<p className="text-muted-foreground text-xs">
									<Trans>Saved</Trans>
								</p>
							</div>
						</CardContent>
					</Card>
					<Card>
						<CardContent className="flex items-center gap-3 py-4">
							<CompassIcon className="size-8 text-primary" weight="duotone" />
							<div>
								<p className="font-bold text-2xl">{stats.applied ?? 0}</p>
								<p className="text-muted-foreground text-xs">
									<Trans>Applications</Trans>
								</p>
							</div>
						</CardContent>
					</Card>
				</div>
			)}

			{/* Loading state */}
			{isLoading && (
				<div className="flex h-64 items-center justify-center">
					<SpinnerIcon className="size-8 animate-spin text-primary" />
				</div>
			)}

			{/* Error state */}
			{isError && (
				<Card className="border-destructive">
					<CardContent className="flex flex-col items-center justify-center py-16">
						<XIcon className="mb-4 size-16 text-destructive" weight="duotone" />
						<h3 className="mb-2 font-semibold text-lg">
							<Trans>Loading error</Trans>
						</h3>
						<p className="text-muted-foreground">
							<Trans>Unable to load job offers. Please try again.</Trans>
						</p>
					</CardContent>
				</Card>
			)}

			{/* Job listings */}
			{!isLoading &&
				!isError &&
				(jobs.length === 0 ? (
					<Card>
						<CardContent className="flex flex-col items-center justify-center py-16">
							<CompassIcon className="mb-4 size-16 text-muted-foreground" weight="duotone" />
							<h3 className="mb-2 font-semibold text-lg">
								{searchQuery || hasActiveFilters ? <Trans>No results</Trans> : <Trans>No offers available</Trans>}
							</h3>
							<p className="mb-4 text-center text-muted-foreground">
								{searchQuery || hasActiveFilters ? (
									<Trans>Try modifying your search criteria or broadening your filters</Trans>
								) : (
									<Trans>Job offers will appear here once added by the aggregator</Trans>
								)}
							</p>
							{(searchQuery || hasActiveFilters) && (
								<Button variant="outline" onClick={clearFilters}>
									<Trans>Reset search</Trans>
								</Button>
							)}
						</CardContent>
					</Card>
				) : (
					<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
						{jobs.map((job) => (
							<Card key={job.id} className="transition-shadow hover:shadow-md">
								<CardHeader className="pb-3">
									<div className="flex items-start justify-between">
										<div className="min-w-0 flex-1">
											<CardTitle className="truncate text-base">{job.title}</CardTitle>
											<CardDescription className="mt-1 flex items-center gap-1">
												<BuildingsIcon className="size-3.5" />
												{job.company}
											</CardDescription>
										</div>
									</div>
								</CardHeader>
								<CardContent className="pt-0">
									<div className="mb-3 flex flex-wrap gap-1.5">
										{job.location && (
											<Badge variant="outline" className="text-xs">
												<MapPinIcon className="mr-1 size-3" />
												{job.location}
											</Badge>
										)}
										{job.workType && (
											<Badge variant="secondary" className="text-xs">
												{job.workType}
											</Badge>
										)}
										{job.experienceLevel && (
											<Badge variant="secondary" className="text-xs">
												{job.experienceLevel}
											</Badge>
										)}
									</div>
									{job.description && <p className="line-clamp-2 text-muted-foreground text-sm">{job.description}</p>}
									{(job.salaryMin || job.salaryMax) && (
										<p className="mt-2 font-medium text-primary text-sm">
											{job.salaryMin && job.salaryMax
												? `${job.salaryMin.toLocaleString()} - ${job.salaryMax.toLocaleString()} ${job.currency}`
												: job.salaryMin
													? `${job.salaryMin.toLocaleString()}+ ${job.currency}`
													: `${job.salaryMax?.toLocaleString()} ${job.currency}`}
										</p>
									)}
									{job.postedDate && (
										<p className="mt-1 text-muted-foreground text-xs">
											<ClockIcon className="mr-1 inline size-3" />
											{new Date(job.postedDate).toLocaleDateString()}
										</p>
									)}
								</CardContent>
							</Card>
						))}
					</div>
				))}
		</>
	);
}
