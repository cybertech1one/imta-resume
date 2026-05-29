import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import {
	BuildingOfficeIcon,
	ChartBarIcon,
	ChartLineUpIcon,
	CurrencyCircleDollarIcon,
	SparkleIcon,
} from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { ErrorComponent } from "@/components/error-component";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { authClient } from "@/integrations/auth/client";
import { orpc } from "@/integrations/orpc/client";

import { DashboardHeader } from "../-components/header";
import {
	EmployersCard,
	ErrorAlert,
	FiltersCard,
	IndustryDistributionCard,
	MarketHighlightsCard,
	NextStepsCard,
	QuickStats,
	RecommendedSkillsCard,
	RegionalJobMarketCard,
	SalaryByFieldCard,
	SkillDevelopmentCta,
	TopHiringSectorsCard,
} from "./-components/insights-components";
import {
	computeFilteredEmployers,
	computeInDemandSkills,
	computeIndustryPieData,
	computeRegionalDistribution,
	computeSalaryChartData,
	computeSectorStats,
	computeSkillsDemandData,
	computeTotalPositions,
	computeTrendLineData,
} from "./-components/insights-utils";

// Lazy-load chart components to avoid Recharts SSR hydration crashes
const LazyMarketTrendsChart = lazy(() =>
	import("./-components/insights-charts").then((m) => ({ default: m.MarketTrendsChart })),
);
const LazySalaryRangesChart = lazy(() =>
	import("./-components/insights-charts").then((m) => ({ default: m.SalaryRangesChart })),
);
const LazySkillsDemandChart = lazy(() =>
	import("./-components/insights-charts").then((m) => ({ default: m.SkillsDemandChart })),
);

function ChartFallback() {
	return (
		<Card>
			<CardContent className="p-6">
				<Skeleton className="h-72 w-full" />
			</CardContent>
		</Card>
	);
}

// biome-ignore lint/suspicious/noExplicitAny: Route path not in generated route tree
export const Route = createFileRoute("/dashboard/jobs/insights" as any)({
	component: JobMarketInsightsPage,
	errorComponent: ErrorComponent,
});

function JobMarketInsightsPage() {
	const { data: session } = authClient.useSession();
	const [mounted, setMounted] = useState(false);
	const [selectedSector, setSelectedSector] = useState("all");
	const [selectedRegion, setSelectedRegion] = useState("all");
	const [selectedTimeRange, setSelectedTimeRange] = useState("30d");
	const [searchQuery, setSearchQuery] = useState("");
	const [activeTab, setActiveTab] = useState("overview");

	// Ensure client-side mount before rendering charts (prevents SSR hydration mismatch)
	useEffect(() => {
		setMounted(true);
	}, []);

	const {
		data: marketInsights,
		isLoading: loadingInsights,
		isError: insightsError,
	} = useQuery({
		...orpc.marketInsights.list.queryOptions({ input: { activeOnly: true } }),
		enabled: !!session?.user,
	});

	const {
		data: employers,
		isLoading: loadingEmployers,
		isError: employersError,
	} = useQuery({
		...orpc.employers.list.queryOptions({ input: { activeOnly: true } }),
		enabled: !!session?.user,
	});

	const {
		data: skillLibrary,
		isLoading: loadingSkills,
		isError: skillsError,
	} = useQuery({
		...orpc.skillLibrary.list.queryOptions({ input: { activeOnly: true } }),
		enabled: !!session?.user,
	});

	const {
		data: marketOverview,
		isLoading: loadingMarketOverview,
		isError: marketOverviewError,
	} = useQuery({
		...orpc.marketIntelligence.analytics.overview.queryOptions({}),
		enabled: !!session?.user,
	});

	const {
		data: salaryData,
		isLoading: loadingSalary,
		isError: salaryError,
	} = useQuery({
		...orpc.marketIntelligence.analytics.salaryComparison.queryOptions({
			input: selectedSector !== "all" ? { field: selectedSector } : {},
		}),
		enabled: !!session?.user,
	});

	const {
		data: topSkills,
		isLoading: loadingTopSkills,
		isError: topSkillsError,
	} = useQuery({
		...orpc.marketIntelligence.skills.getTop.queryOptions({
			input: { field: selectedSector !== "all" ? selectedSector : undefined, limit: 10 },
		}),
		enabled: !!session?.user,
	});

	const {
		data: regionalStats,
		isLoading: loadingRegions,
		isError: regionsError,
	} = useQuery({
		...orpc.marketIntelligence.regions.list.queryOptions({}),
		enabled: !!session?.user,
	});

	const { isLoading: loadingTrends, isError: trendsError } = useQuery({
		...orpc.marketIntelligence.analytics.industryTrends.queryOptions({}),
		enabled: !!session?.user,
	});

	const hasQueryError =
		insightsError ||
		employersError ||
		skillsError ||
		marketOverviewError ||
		salaryError ||
		topSkillsError ||
		regionsError ||
		trendsError;

	const filteredEmployers = useMemo(
		() => computeFilteredEmployers(employers, selectedSector, selectedRegion, searchQuery),
		[employers, selectedSector, selectedRegion, searchQuery],
	);

	const sectorStats = useMemo(() => computeSectorStats(employers), [employers]);

	const inDemandSkills = useMemo(
		() => computeInDemandSkills(skillLibrary, selectedSector),
		[skillLibrary, selectedSector],
	);

	const regionalDistribution = useMemo(() => computeRegionalDistribution(regionalStats), [regionalStats]);

	const salaryChartData = useMemo(() => computeSalaryChartData(salaryData as any), [salaryData]);

	const industryPieData = useMemo(() => computeIndustryPieData(marketOverview?.fieldDistribution), [marketOverview]);

	const skillsDemandData = useMemo(() => computeSkillsDemandData(topSkills), [topSkills]);

	const trendLineData = useMemo(() => computeTrendLineData(marketOverview), [marketOverview]);

	const isLoading =
		loadingInsights ||
		loadingEmployers ||
		loadingSkills ||
		loadingMarketOverview ||
		loadingSalary ||
		loadingTopSkills ||
		loadingRegions ||
		loadingTrends;

	const totalPositions = useMemo(() => computeTotalPositions(employers), [employers]);

	const filters = {
		selectedSector,
		setSelectedSector,
		selectedRegion,
		setSelectedRegion,
		selectedTimeRange,
		setSelectedTimeRange,
		searchQuery,
		setSearchQuery,
		activeTab,
		setActiveTab,
	};

	const handleResetFilters = () => {
		setSelectedSector("all");
		setSelectedRegion("all");
		setSearchQuery("");
	};

	return (
		<div className="space-y-8">
			<DashboardHeader icon={ChartLineUpIcon} title={t`Job Market Insights`} />

			{hasQueryError && <ErrorAlert />}

			<QuickStats
				isLoading={isLoading}
				marketOverview={marketOverview}
				totalPositions={totalPositions}
				employers={employers}
				skillLibrary={skillLibrary}
			/>

			<FiltersCard filters={filters} />

			<Tabs value={activeTab} onValueChange={setActiveTab}>
				<TabsList className="mb-4">
					<TabsTrigger value="overview">
						<ChartBarIcon className="mr-2 size-4" />
						<Trans>Overview</Trans>
					</TabsTrigger>
					<TabsTrigger value="salaries">
						<CurrencyCircleDollarIcon className="mr-2 size-4" />
						<Trans>Salaries</Trans>
					</TabsTrigger>
					<TabsTrigger value="skills">
						<SparkleIcon className="mr-2 size-4" />
						<Trans>Skills</Trans>
					</TabsTrigger>
					<TabsTrigger value="employers">
						<BuildingOfficeIcon className="mr-2 size-4" />
						<Trans>Employers</Trans>
					</TabsTrigger>
				</TabsList>

				<TabsContent value="overview" className="space-y-6">
					{mounted ? (
						<Suspense fallback={<ChartFallback />}>
							<LazyMarketTrendsChart isLoading={isLoading} trendLineData={trendLineData} />
						</Suspense>
					) : (
						<ChartFallback />
					)}

					<div className="grid gap-6 lg:grid-cols-3">
						<MarketHighlightsCard loadingInsights={loadingInsights} marketInsights={marketInsights} />
						<IndustryDistributionCard isLoading={isLoading} industryPieData={industryPieData} />
					</div>

					<div className="grid gap-6 lg:grid-cols-2">
						<RegionalJobMarketCard loadingRegions={loadingRegions} regionalDistribution={regionalDistribution} />
						<TopHiringSectorsCard loadingEmployers={loadingEmployers} sectorStats={sectorStats} />
					</div>
				</TabsContent>

				<TabsContent value="salaries" className="space-y-6">
					{mounted ? (
						<Suspense fallback={<ChartFallback />}>
							<LazySalaryRangesChart
								loadingSalary={loadingSalary}
								salaryChartData={salaryChartData}
								selectedSector={selectedSector}
							/>
						</Suspense>
					) : (
						<ChartFallback />
					)}
					<SalaryByFieldCard salaryData={salaryData} />
				</TabsContent>

				<TabsContent value="skills" className="space-y-6">
					{mounted ? (
						<Suspense fallback={<ChartFallback />}>
							<LazySkillsDemandChart loadingTopSkills={loadingTopSkills} skillsDemandData={skillsDemandData} />
						</Suspense>
					) : (
						<ChartFallback />
					)}
					<RecommendedSkillsCard
						loadingSkills={loadingSkills}
						inDemandSkills={inDemandSkills}
						selectedSector={selectedSector}
					/>
					<SkillDevelopmentCta />
				</TabsContent>

				<TabsContent value="employers" className="space-y-6">
					<EmployersCard
						loadingEmployers={loadingEmployers}
						filteredEmployers={filteredEmployers as any}
						onResetFilters={handleResetFilters}
					/>
				</TabsContent>
			</Tabs>

			<NextStepsCard />
		</div>
	);
}
