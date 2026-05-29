import { t } from "@lingui/core/macro";
import { ChartLineUpIcon } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ErrorComponent } from "@/components/error-component";
import { Tabs } from "@/components/ui/tabs";
import { authClient } from "@/integrations/auth/client";
import { orpc } from "@/integrations/orpc/client";
import { DashboardHeader } from "../-components/header";
import {
	FieldFilter,
	HeroSection,
	OutlookTab,
	OverviewTab,
	RegionsTab,
	SalariesTab,
	SkillsTab,
	TrendsTabsList,
} from "./-components/trends-components";
import { EMERGING_JOBS_EDITORIAL, INDUSTRY_OUTLOOK_EDITORIAL } from "./-components/trends-config";
import type { Field, RegionalData, SalaryTrend, SkillDemand, TrendData } from "./-components/trends-types";

// biome-ignore lint/suspicious/noExplicitAny: Route path not in generated route tree
export const Route = createFileRoute("/dashboard/jobs/trends" as any)({
	component: MarketTrendsPage,
	errorComponent: ErrorComponent,
});

function MarketTrendsPage() {
	const [selectedField, setSelectedField] = useState<Field | "all">("all");
	const [activeTab, setActiveTab] = useState("overview");

	const { data: session } = authClient.useSession();

	// --- Fetch data from database ---

	const { data: rawSalaries } = useQuery({
		...orpc.marketIntelligence.salaries.list.queryOptions({ input: {} }),
		enabled: !!session?.user,
	});

	const { data: rawSkills } = useQuery({
		...orpc.marketIntelligence.skills.list.queryOptions({ input: {} }),
		enabled: !!session?.user,
	});

	const { data: rawRegions } = useQuery({
		...orpc.marketIntelligence.regions.list.queryOptions({}),
		enabled: !!session?.user,
	});

	const { data: rawOverview } = useQuery({
		...orpc.marketIntelligence.analytics.overview.queryOptions({}),
		enabled: !!session?.user,
	});

	// --- Transform DB data to component prop types ---

	const salaryTrends = useMemo<SalaryTrend[]>(() => {
		if (!rawSalaries) return [];
		return rawSalaries.map((s) => ({
			position: s.roleFr || s.role,
			field: (s.field || "industrial") as Field,
			salaryMin: s.salaryMin ?? 0,
			salaryMax: s.salaryMax ?? 0,
			salaryMedian: s.salaryMedian ?? 0,
			changeFromLastYear: 0,
		}));
	}, [rawSalaries]);

	const skillsDemand = useMemo<SkillDemand[]>(() => {
		if (!rawSkills) return [];
		return rawSkills
			.filter((s) => s.field !== null)
			.map((s) => ({
				skill: s.skill,
				demand: s.demandScore ?? 0,
				growth: s.growthPercent ?? 0,
				field: (s.field || "industrial") as Field,
			}));
	}, [rawSkills]);

	const regionalData = useMemo<RegionalData[]>(() => {
		if (!rawRegions) return [];
		return rawRegions.map((r) => {
			const topIndustry = r.topIndustries as { industry: string; jobCount: number }[] | null;
			const topField = topIndustry?.[0]?.industry?.toLowerCase() ?? "industrial";
			const fieldMap: Record<string, Field> = {
				industrial: "industrial",
				manufacturing: "industrial",
				automotive: "industrial",
				logistics: "industrial",
				healthcare: "healthcare",
				government: "industrial",
				services: "industrial",
				tourism: "industrial",
				education: "healthcare",
			};
			return {
				region: r.regionFr || r.region,
				jobs: r.totalJobs ?? 0,
				growth: r.jobGrowth ?? 0,
				avgSalary: r.averageSalary ?? 0,
				topField: fieldMap[topField] || "industrial",
			};
		});
	}, [rawRegions]);

	const marketOverview = useMemo<TrendData[]>(() => {
		if (!rawOverview) return [];
		const summary = rawOverview.summary;
		return [
			{
				label: t`Active Job Listings`,
				value: summary.totalJobs,
				change: Math.round(summary.avgJobGrowth),
				trend: summary.avgJobGrowth > 0 ? ("up" as const) : ("down" as const),
			},
			{
				label: t`Hiring Companies`,
				value: summary.totalEmployers,
				change: 0,
				trend: "up" as const,
			},
			{
				label: t`Median Salary (MAD)`,
				value: summary.avgSalary,
				change: 0,
				trend: "up" as const,
			},
			{
				label: t`Skills Tracked`,
				value: summary.totalSkillsTracked,
				change: 0,
				trend: "up" as const,
			},
		];
	}, [rawOverview]);

	// --- Filter by selected field ---

	const filteredSalaryTrends = useMemo(() => {
		if (selectedField === "all") return salaryTrends;
		return salaryTrends.filter((s) => s.field === selectedField);
	}, [selectedField, salaryTrends]);

	const filteredSkills = useMemo(() => {
		if (selectedField === "all") return skillsDemand;
		return skillsDemand.filter((s) => s.field === selectedField);
	}, [selectedField, skillsDemand]);

	return (
		<>
			<DashboardHeader icon={ChartLineUpIcon} title={t`Market Trends`} />

			<HeroSection marketOverview={marketOverview} />

			<FieldFilter selectedField={selectedField} setSelectedField={setSelectedField} />

			<Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
				<TrendsTabsList />
				<OverviewTab industryOutlook={INDUSTRY_OUTLOOK_EDITORIAL} emergingJobs={EMERGING_JOBS_EDITORIAL} />
				<SkillsTab filteredSkills={filteredSkills} />
				<SalariesTab filteredSalaryTrends={filteredSalaryTrends} />
				<RegionsTab regionalData={regionalData} />
				<OutlookTab selectedField={selectedField} industryOutlook={INDUSTRY_OUTLOOK_EDITORIAL} />
			</Tabs>
		</>
	);
}
