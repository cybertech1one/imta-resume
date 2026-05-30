import { SECTORS } from "./insights-config";
import type {
	IndustryPieItem,
	RegionalDistItem,
	SalaryChartItem,
	SectorStat,
	SkillsDemandItem,
	TrendLineItem,
} from "./insights-types";

export function formatCurrency(value: number): string {
	if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M DH`;
	if (value >= 1_000) return `${(value / 1_000).toFixed(0)}K DH`;
	return `${value.toLocaleString("fr-FR")} DH`;
}

export function formatNumber(value: number): string {
	if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
	if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
	return value.toLocaleString("fr-FR");
}

export function computeFilteredEmployers<
	T extends { name: string; fields?: string[] | null; location?: string | null; openPositions?: number | null },
>(employers: T[] | undefined, selectedSector: string, selectedRegion: string, searchQuery: string) {
	if (!employers) return [];
	return employers.filter((e) => {
		if (selectedSector !== "all" && !e.fields?.includes(selectedSector)) return false;
		if (
			selectedRegion !== "all" &&
			!e.location?.toLowerCase().includes(selectedRegion.replace(/-/g, " ").split("-")[0])
		)
			return false;
		if (searchQuery && !e.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
		return true;
	});
}

export function computeSectorStats(
	employers: Array<{ fields?: string[] | null; openPositions?: number | null }> | undefined,
): SectorStat[] {
	if (!employers) return [];
	const stats: Record<string, { count: number; positions: number }> = {};
	for (const employer of employers) {
		const employerFields = employer.fields || [];
		for (const field of employerFields) {
			if (!stats[field]) stats[field] = { count: 0, positions: 0 };
			stats[field].count++;
			stats[field].positions += employer.openPositions || 0;
		}
	}
	return Object.entries(stats)
		.map(([sector, data]) => ({
			sector,
			sectorName: SECTORS.find((s) => s.id === sector)?.nameFr || sector,
			...data,
		}))
		.sort((a, b) => b.positions - a.positions);
}

export function computeInDemandSkills<T extends { field?: string | null }>(
	skillLibrary: T[] | undefined,
	selectedSector: string,
): T[] {
	if (!skillLibrary) return [];
	let filtered = skillLibrary;
	if (selectedSector !== "all") {
		filtered = skillLibrary.filter((s) => s.field === selectedSector || s.field === "general");
	}
	return filtered.slice(0, 12);
}

export function computeRegionalDistribution(
	regionalStats:
		| Array<{
				region: string;
				regionFr?: string | null;
				totalJobs?: number | null;
				jobGrowth?: number | null;
				averageSalary?: number | null;
		  }>
		| undefined,
): RegionalDistItem[] {
	if (!regionalStats) return [];
	return regionalStats.map((region) => ({
		regionId: region.region,
		regionName: region.regionFr || region.region,
		totalJobs: region.totalJobs || 0,
		jobGrowth: region.jobGrowth || 0,
		avgSalary: region.averageSalary || 0,
	}));
}

export function computeSalaryChartData(
	salaryData:
		| {
				roles?: Array<{
					role: string;
					roleFr?: string | null;
					levels: Record<string, { min?: number | null; median?: number | null; max?: number | null } | undefined>;
				}>;
		  }
		| undefined,
): SalaryChartItem[] {
	if (!salaryData?.roles) return [];
	return salaryData.roles.slice(0, 8).map((role) => {
		const midLevel = role.levels.mid || role.levels.entry || Object.values(role.levels)[0];
		return {
			name: role.roleFr || role.role,
			min: midLevel?.min || 0,
			median: midLevel?.median || 0,
			max: midLevel?.max || 0,
		};
	});
}

export function computeIndustryPieData(fieldDistribution: Record<string, number> | undefined): IndustryPieItem[] {
	if (!fieldDistribution) return [];
	return Object.entries(fieldDistribution).map(([field, count]) => ({
		name: SECTORS.find((s) => s.id === field)?.nameFr || field,
		value: count,
	}));
}

export function computeSkillsDemandData(
	topSkills:
		| Array<{
				skill: string;
				skillFr?: string | null;
				demandScore?: number | null;
				growthPercent?: number | null;
				averageSalaryBoost?: number | null;
		  }>
		| undefined,
): SkillsDemandItem[] {
	if (!topSkills) return [];
	return topSkills.slice(0, 8).map((skill) => ({
		name: skill.skillFr || skill.skill,
		demandScore: skill.demandScore || 0,
		growth: skill.growthPercent || 0,
		salaryBoost: skill.averageSalaryBoost || 0,
	}));
}

export function computeTrendLineData(
	marketOverview: { summary?: { totalJobs?: number; avgJobGrowth?: number; avgSalary?: number } } | undefined,
): TrendLineItem[] {
	const baseJobs = marketOverview?.summary?.totalJobs || 100000;
	const growth = marketOverview?.summary?.avgJobGrowth || 7.5;
	const months = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin"];
	return months.map((month, i) => ({
		month,
		jobs: Math.round(baseJobs * (1 - (5 - i) * (growth / 100))),
		salaries: Math.round((marketOverview?.summary?.avgSalary || 84000) * (1 + i * 0.02)),
	}));
}

export function computeTotalPositions(employers: Array<{ openPositions?: number | null }> | undefined): number {
	return employers?.reduce((sum, e) => sum + (e.openPositions || 0), 0) || 0;
}
