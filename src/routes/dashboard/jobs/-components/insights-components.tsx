import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import {
	ArrowRightIcon,
	ArrowUpIcon,
	BriefcaseIcon,
	BuildingOfficeIcon,
	CalendarIcon,
	ChartBarIcon,
	CurrencyCircleDollarIcon,
	GraduationCapIcon,
	LightbulbIcon,
	MagnifyingGlassIcon,
	MapPinIcon,
	RocketLaunchIcon,
	SparkleIcon,
	StarIcon,
	TrendUpIcon,
	UsersIcon,
	WarningCircleIcon,
} from "@phosphor-icons/react";
import { Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { Cell, Legend, Pie, PieChart, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/utils/style";

import { CHART_COLORS, insightIconMap, REGIONS, SECTORS, TIME_RANGES } from "./insights-config";
import type { IndustryPieItem, InsightsFilterState, RegionalDistItem, SectorStat } from "./insights-types";
import { formatCurrency, formatNumber } from "./insights-utils";

export function ErrorAlert() {
	return (
		<Card className="border-destructive/50 bg-destructive/5">
			<CardContent className="flex items-center gap-3 py-4">
				<div className="flex size-10 items-center justify-center rounded-full bg-destructive/10">
					<WarningCircleIcon className="size-5 text-destructive" />
				</div>
				<div>
					<p className="font-medium text-destructive">
						<Trans>Loading Error</Trans>
					</p>
					<p className="text-muted-foreground text-sm">
						<Trans>Some data could not be loaded. Please refresh the page.</Trans>
					</p>
				</div>
			</CardContent>
		</Card>
	);
}

export function QuickStats({
	isLoading,
	marketOverview,
	totalPositions,
	employers,
	skillLibrary,
}: {
	isLoading: boolean;
	marketOverview:
		| {
				summary?: {
					totalJobs?: number;
					avgJobGrowth?: number;
					avgSalary?: number;
					totalEmployers?: number;
					totalSkillsTracked?: number;
				};
		  }
		| undefined;
	totalPositions: number;
	employers: Array<unknown> | undefined;
	skillLibrary: Array<unknown> | undefined;
}) {
	return (
		<div className="grid gap-4 md:grid-cols-4">
			<Card>
				<CardHeader className="pb-2">
					<CardDescription className="flex items-center gap-2">
						<BriefcaseIcon className="size-4" />
						<Trans>Open Positions</Trans>
					</CardDescription>
					<CardTitle className="text-3xl">
						{isLoading ? (
							<Skeleton className="h-9 w-20" />
						) : (
							formatNumber(marketOverview?.summary?.totalJobs || totalPositions)
						)}
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="flex items-center gap-1 text-green-500 text-sm">
						<ArrowUpIcon className="size-4" />
						<span>
							<Trans>+{marketOverview?.summary?.avgJobGrowth || 7.5}% this month</Trans>
						</span>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader className="pb-2">
					<CardDescription className="flex items-center gap-2">
						<CurrencyCircleDollarIcon className="size-4" />
						<Trans>Avg. Salary</Trans>
					</CardDescription>
					<CardTitle className="text-3xl">
						{isLoading ? (
							<Skeleton className="h-9 w-24" />
						) : (
							formatCurrency(marketOverview?.summary?.avgSalary || 84000)
						)}
					</CardTitle>
				</CardHeader>
				<CardContent>
					<p className="text-muted-foreground text-sm">
						<Trans>median annual</Trans>
					</p>
				</CardContent>
			</Card>

			<Card>
				<CardHeader className="pb-2">
					<CardDescription className="flex items-center gap-2">
						<BuildingOfficeIcon className="size-4" />
						<Trans>Active Employers</Trans>
					</CardDescription>
					<CardTitle className="text-3xl">
						{isLoading ? (
							<Skeleton className="h-9 w-16" />
						) : (
							marketOverview?.summary?.totalEmployers || employers?.length || 0
						)}
					</CardTitle>
				</CardHeader>
				<CardContent>
					<p className="text-muted-foreground text-sm">
						<Trans>hiring now</Trans>
					</p>
				</CardContent>
			</Card>

			<Card>
				<CardHeader className="pb-2">
					<CardDescription className="flex items-center gap-2">
						<TrendUpIcon className="size-4" />
						<Trans>Skills Tracked</Trans>
					</CardDescription>
					<CardTitle className="text-3xl">
						{isLoading ? (
							<Skeleton className="h-9 w-12" />
						) : (
							marketOverview?.summary?.totalSkillsTracked || skillLibrary?.length || 0
						)}
					</CardTitle>
				</CardHeader>
				<CardContent>
					<p className="text-muted-foreground text-sm">
						<Trans>in-demand skills</Trans>
					</p>
				</CardContent>
			</Card>
		</div>
	);
}

export function FiltersCard({ filters }: { filters: InsightsFilterState }) {
	return (
		<Card>
			<CardContent className="p-4">
				<div className="flex flex-col gap-4 lg:flex-row lg:items-center">
					<div className="relative flex-1">
						<MagnifyingGlassIcon className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
						<Input
							placeholder={t`Search employers...`}
							value={filters.searchQuery}
							onChange={(e) => filters.setSearchQuery(e.target.value)}
							className="pl-10"
						/>
					</div>
					<div className="flex flex-wrap items-center gap-2">
						<Select value={filters.selectedSector} onValueChange={filters.setSelectedSector}>
							<SelectTrigger className="w-[180px]">
								<SelectValue placeholder={t`Sector`} />
							</SelectTrigger>
							<SelectContent>
								{SECTORS.map((sector) => (
									<SelectItem key={sector.id} value={sector.id}>
										{sector.name}
									</SelectItem>
								))}
							</SelectContent>
						</Select>

						<Select value={filters.selectedRegion} onValueChange={filters.setSelectedRegion}>
							<SelectTrigger className="w-[200px]">
								<SelectValue placeholder={t`Region`} />
							</SelectTrigger>
							<SelectContent>
								{REGIONS.map((region) => (
									<SelectItem key={region.id} value={region.id}>
										{region.name}
									</SelectItem>
								))}
							</SelectContent>
						</Select>

						<Select value={filters.selectedTimeRange} onValueChange={filters.setSelectedTimeRange}>
							<SelectTrigger className="w-[140px]">
								<CalendarIcon className="mr-2 size-4" />
								<SelectValue placeholder={t`Time Range`} />
							</SelectTrigger>
							<SelectContent>
								{TIME_RANGES.map((range) => (
									<SelectItem key={range.id} value={range.id}>
										{range.name}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}

export function MarketHighlightsCard({
	loadingInsights,
	marketInsights,
}: {
	loadingInsights: boolean;
	marketInsights:
		| Array<{
				id: string;
				icon?: string | null;
				color?: string | null;
				value?: string | null;
				titleFr?: string | null;
				title: string;
		  }>
		| undefined;
}) {
	return (
		<Card className="lg:col-span-2">
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<LightbulbIcon className="size-5" />
					<Trans>Market Highlights</Trans>
				</CardTitle>
				<CardDescription>
					<Trans>Key insights and statistics</Trans>
				</CardDescription>
			</CardHeader>
			<CardContent>
				{loadingInsights ? (
					<div className="grid gap-4 md:grid-cols-2">
						{[1, 2, 3, 4].map((i) => (
							<Skeleton key={i} className="h-24" />
						))}
					</div>
				) : marketInsights && marketInsights.length > 0 ? (
					<div className="grid gap-4 md:grid-cols-2">
						{marketInsights.slice(0, 6).map((insight, index) => {
							const InsightIcon = insightIconMap[insight.icon || "default"] || SparkleIcon;
							return (
								<motion.div
									key={insight.id}
									initial={false}
									animate={{ opacity: 1, y: 0 }}
									transition={{ delay: index * 0.05 }}
								>
									<Card className="h-full">
										<CardContent className="p-4">
											<div className="flex items-start gap-3">
												<div
													className={cn(
														"flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10",
														insight.color,
													)}
												>
													<InsightIcon className="size-5" weight="duotone" />
												</div>
												<div className="min-w-0 flex-1">
													<p className="font-bold text-lg">{insight.value}</p>
													<p className="truncate text-muted-foreground text-sm">{insight.titleFr || insight.title}</p>
												</div>
											</div>
										</CardContent>
									</Card>
								</motion.div>
							);
						})}
					</div>
				) : (
					<div className="flex flex-col items-center gap-4 py-8 text-center">
						<ChartBarIcon className="size-12 text-muted-foreground" />
						<p className="text-muted-foreground">
							<Trans>No market data available</Trans>
						</p>
					</div>
				)}
			</CardContent>
		</Card>
	);
}

export function IndustryDistributionCard({
	isLoading,
	industryPieData,
}: {
	isLoading: boolean;
	industryPieData: IndustryPieItem[];
}) {
	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<ChartBarIcon className="size-5" />
					<Trans>By Industry</Trans>
				</CardTitle>
			</CardHeader>
			<CardContent>
				{isLoading ? (
					<Skeleton className="h-56" />
				) : industryPieData.length > 0 ? (
					<div className="h-56">
						<ResponsiveContainer width="100%" height="100%">
							<PieChart>
								<Pie
									data={industryPieData}
									cx="50%"
									cy="50%"
									innerRadius={40}
									outerRadius={70}
									paddingAngle={4}
									dataKey="value"
								>
									{industryPieData.map((_, index) => (
										<Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
									))}
								</Pie>
								<Legend wrapperStyle={{ fontSize: "11px" }} />
								<RechartsTooltip />
							</PieChart>
						</ResponsiveContainer>
					</div>
				) : (
					<div className="flex h-56 items-center justify-center">
						<p className="text-muted-foreground text-sm">
							<Trans>No industry data</Trans>
						</p>
					</div>
				)}
			</CardContent>
		</Card>
	);
}

export function RegionalJobMarketCard({
	loadingRegions,
	regionalDistribution,
}: {
	loadingRegions: boolean;
	regionalDistribution: RegionalDistItem[];
}) {
	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<MapPinIcon className="size-5" />
					<Trans>Regional Job Market</Trans>
				</CardTitle>
				<CardDescription>
					<Trans>Job distribution by region</Trans>
				</CardDescription>
			</CardHeader>
			<CardContent>
				{loadingRegions ? (
					<div className="space-y-4">
						{[1, 2, 3, 4].map((i) => (
							<Skeleton key={i} className="h-8" />
						))}
					</div>
				) : regionalDistribution.length > 0 ? (
					<div className="space-y-4">
						{regionalDistribution.slice(0, 5).map((region, index) => {
							const maxJobs = Math.max(...regionalDistribution.map((r) => r.totalJobs));
							const percentage = Math.round((region.totalJobs / maxJobs) * 100);
							return (
								<motion.div
									key={region.regionId}
									initial={false}
									animate={{ opacity: 1, x: 0 }}
									transition={{ delay: index * 0.1 }}
									className="space-y-2"
								>
									<div className="flex items-center justify-between">
										<span className="font-medium text-sm">{region.regionName}</span>
										<div className="flex items-center gap-2">
											<span className="text-muted-foreground text-sm">
												<Trans>{formatNumber(region.totalJobs)} jobs</Trans>
											</span>
											<Badge
												variant="outline"
												className={cn("text-xs", region.jobGrowth > 8 ? "border-green-500 text-green-600" : "")}
											>
												+{region.jobGrowth}%
											</Badge>
										</div>
									</div>
									<Progress value={percentage} className="h-2" />
								</motion.div>
							);
						})}
					</div>
				) : (
					<div className="flex flex-col items-center gap-4 py-8 text-center">
						<MapPinIcon className="size-12 text-muted-foreground" />
						<p className="text-muted-foreground">
							<Trans>No regional data available</Trans>
						</p>
					</div>
				)}
			</CardContent>
		</Card>
	);
}

export function TopHiringSectorsCard({
	loadingEmployers,
	sectorStats,
}: {
	loadingEmployers: boolean;
	sectorStats: SectorStat[];
}) {
	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<TrendUpIcon className="size-5" />
					<Trans>Top Hiring Sectors</Trans>
				</CardTitle>
				<CardDescription>
					<Trans>Sectors with most opportunities</Trans>
				</CardDescription>
			</CardHeader>
			<CardContent>
				{loadingEmployers ? (
					<div className="space-y-4">
						{[1, 2, 3, 4].map((i) => (
							<Skeleton key={i} className="h-12" />
						))}
					</div>
				) : sectorStats.length > 0 ? (
					<div className="space-y-3">
						{sectorStats.slice(0, 5).map((sector, index) => (
							<motion.div
								key={sector.sector}
								initial={false}
								animate={{ opacity: 1, x: 0 }}
								transition={{ delay: index * 0.1 }}
								className="flex items-center gap-3 rounded-lg border p-3"
							>
								<div className="flex size-10 items-center justify-center rounded-full bg-primary/10">
									<BuildingOfficeIcon className="size-5 text-primary" />
								</div>
								<div className="min-w-0 flex-1">
									<p className="truncate font-medium">{sector.sectorName}</p>
									<p className="text-muted-foreground text-sm">
										<Trans>{sector.count} employer(s)</Trans>
									</p>
								</div>
								<Badge variant="secondary">
									<Trans>{formatNumber(sector.positions)} positions</Trans>
								</Badge>
							</motion.div>
						))}
					</div>
				) : (
					<div className="flex flex-col items-center gap-4 py-8 text-center">
						<BuildingOfficeIcon className="size-12 text-muted-foreground" />
						<p className="text-muted-foreground">
							<Trans>No sector data available</Trans>
						</p>
					</div>
				)}
			</CardContent>
		</Card>
	);
}

export function SalaryByFieldCard({
	salaryData,
}: {
	salaryData: { averageByField?: Array<{ field: string; averageSalary: number }> } | undefined;
}) {
	if (!salaryData?.averageByField || salaryData.averageByField.length === 0) return null;
	return (
		<div>
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<ChartBarIcon className="size-5" />
						<Trans>Average Salary by Field</Trans>
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="grid gap-4 md:grid-cols-3">
						{salaryData.averageByField.map((item, index) => (
							<motion.div
								key={item.field}
								initial={false}
								animate={{ opacity: 1, scale: 1 }}
								transition={{ delay: index * 0.1 }}
							>
								<Card>
									<CardContent className="p-4 text-center">
										<p className="font-bold text-2xl text-primary">{formatCurrency(item.averageSalary)}</p>
										<p className="text-muted-foreground text-sm capitalize">
											{SECTORS.find((s) => s.id === item.field)?.name || item.field}
										</p>
									</CardContent>
								</Card>
							</motion.div>
						))}
					</div>
				</CardContent>
			</Card>
		</div>
	);
}

export function RecommendedSkillsCard({
	loadingSkills,
	inDemandSkills,
	selectedSector,
}: {
	loadingSkills: boolean;
	inDemandSkills: Array<{
		id: string;
		nameFr?: string | null;
		name: string;
		category?: string | null;
		isRecommended?: boolean | null;
	}>;
	selectedSector: string;
}) {
	return (
		<div>
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<StarIcon className="size-5" />
						<Trans>Recommended Skills</Trans>
					</CardTitle>
					<CardDescription>
						{selectedSector !== "all" ? (
							<Trans>Top skills for {SECTORS.find((s) => s.id === selectedSector)?.name}</Trans>
						) : (
							<Trans>Most sought-after skills in the market</Trans>
						)}
					</CardDescription>
				</CardHeader>
				<CardContent>
					{loadingSkills ? (
						<div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
							{[1, 2, 3, 4, 5, 6].map((i) => (
								<Skeleton key={i} className="h-16" />
							))}
						</div>
					) : inDemandSkills.length > 0 ? (
						<div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
							{inDemandSkills.map((skill, index) => (
								<motion.div
									key={skill.id}
									initial={false}
									animate={{ opacity: 1, y: 0 }}
									transition={{ delay: index * 0.05 }}
									className="flex items-center gap-3 rounded-lg border p-3"
								>
									<div className="flex size-10 items-center justify-center rounded-full bg-primary/10">
										<StarIcon className="size-5 text-primary" weight="duotone" />
									</div>
									<div className="min-w-0 flex-1">
										<p className="truncate font-medium text-sm">{skill.name || skill.nameFr}</p>
										<p className="truncate text-muted-foreground text-xs">{skill.category}</p>
									</div>
									{skill.isRecommended && (
										<Badge variant="outline" className="shrink-0 text-xs">
											<Trans>Hot</Trans>
										</Badge>
									)}
								</motion.div>
							))}
						</div>
					) : (
						<div className="flex flex-col items-center gap-4 py-8 text-center">
							<SparkleIcon className="size-12 text-muted-foreground" />
							<p className="text-muted-foreground">
								<Trans>No skills found</Trans>
							</p>
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}

export function SkillDevelopmentCta() {
	return (
		<div>
			<Card>
				<CardContent className="flex items-center justify-between p-6">
					<div className="flex items-center gap-4">
						<div className="flex size-12 items-center justify-center rounded-full bg-primary/10">
							<GraduationCapIcon className="size-6 text-primary" />
						</div>
						<div>
							<h3 className="font-semibold">
								<Trans>Develop Your Skills</Trans>
							</h3>
							<p className="text-muted-foreground text-sm">
								<Trans>Track your skills and identify gaps to fill</Trans>
							</p>
						</div>
					</div>
					<Button asChild>
						<Link to="/dashboard/career/skills">
							<Trans>Manage My Skills</Trans>
							<ArrowRightIcon className="ml-2 size-4" />
						</Link>
					</Button>
				</CardContent>
			</Card>
		</div>
	);
}

export function EmployersCard({
	loadingEmployers,
	filteredEmployers,
	onResetFilters,
}: {
	loadingEmployers: boolean;
	filteredEmployers: Array<{
		id: string;
		name: string;
		sector?: string | null;
		sectorFr?: string | null;
		location?: string | null;
		locationFr?: string | null;
		openPositions?: number | null;
	}>;
	onResetFilters: () => void;
}) {
	return (
		<div>
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<BuildingOfficeIcon className="size-5" />
						<Trans>Top Employers</Trans>
					</CardTitle>
					<CardDescription>
						<Trans>
							{filteredEmployers.length} employer{filteredEmployers.length !== 1 ? "s" : ""} found
						</Trans>
					</CardDescription>
				</CardHeader>
				<CardContent>
					{loadingEmployers ? (
						<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
							{[1, 2, 3, 4, 5, 6].map((i) => (
								<Skeleton key={i} className="h-32" />
							))}
						</div>
					) : filteredEmployers.length > 0 ? (
						<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
							{filteredEmployers.map((employer, index) => (
								<motion.div
									key={employer.id}
									initial={false}
									animate={{ opacity: 1, y: 0 }}
									transition={{ delay: index * 0.03 }}
								>
									<Card className="h-full">
										<CardContent className="p-4">
											<div className="flex items-start gap-3">
												<div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
													<BuildingOfficeIcon className="size-6 text-primary" />
												</div>
												<div className="min-w-0 flex-1">
													<h3 className="truncate font-semibold">{employer.name}</h3>
													<p className="truncate text-muted-foreground text-sm">
														{employer.sectorFr || employer.sector}
													</p>
													<div className="mt-2 flex flex-wrap items-center gap-2">
														<Badge variant="secondary" className="text-xs">
															<MapPinIcon className="mr-1 size-3" />
															{employer.locationFr || employer.location}
														</Badge>
														{employer.openPositions && employer.openPositions > 0 && (
															<Badge className="bg-green-100 text-green-700 text-xs dark:bg-green-900/30 dark:text-green-400">
																<Trans>{employer.openPositions} position(s)</Trans>
															</Badge>
														)}
													</div>
												</div>
											</div>
										</CardContent>
									</Card>
								</motion.div>
							))}
						</div>
					) : (
						<div className="flex flex-col items-center gap-4 py-12 text-center">
							<MagnifyingGlassIcon className="size-12 text-muted-foreground" />
							<div>
								<h3 className="font-semibold">
									<Trans>No employers found</Trans>
								</h3>
								<p className="text-muted-foreground text-sm">
									<Trans>Try modifying your search filters</Trans>
								</p>
							</div>
							<Button variant="outline" onClick={onResetFilters}>
								<Trans>Reset Filters</Trans>
							</Button>
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}

export function NextStepsCard() {
	return (
		<div>
			<Card>
				<CardHeader>
					<CardTitle>
						<Trans>Next Steps</Trans>
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="grid gap-3 md:grid-cols-3">
						<Button asChild variant="outline" className="h-auto justify-start py-3">
							<Link to="/dashboard/career/transition">
								<RocketLaunchIcon className="mr-3 size-5 text-purple-500" />
								<div className="text-left">
									<p className="font-medium">
										<Trans>Plan a Transition</Trans>
									</p>
									<p className="text-muted-foreground text-xs">
										<Trans>Change your career</Trans>
									</p>
								</div>
							</Link>
						</Button>
						<Button asChild variant="outline" className="h-auto justify-start py-3">
							<Link to="/dashboard/resumes">
								<BriefcaseIcon className="mr-3 size-5 text-blue-500" />
								<div className="text-left">
									<p className="font-medium">
										<Trans>Prepare Your CV</Trans>
									</p>
									<p className="text-muted-foreground text-xs">
										<Trans>Update it now</Trans>
									</p>
								</div>
							</Link>
						</Button>
						<Button asChild variant="outline" className="h-auto justify-start py-3">
							<Link to="/dashboard/interview">
								<UsersIcon className="mr-3 size-5 text-green-500" />
								<div className="text-left">
									<p className="font-medium">
										<Trans>Prepare Interviews</Trans>
									</p>
									<p className="text-muted-foreground text-xs">
										<Trans>Practice now</Trans>
									</p>
								</div>
							</Link>
						</Button>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
