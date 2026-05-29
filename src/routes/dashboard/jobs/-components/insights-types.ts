import type { Icon } from "@phosphor-icons/react";

export type Sector = {
	id: string;
	name: string;
	nameFr: string;
};

export type Region = {
	id: string;
	name: string;
	nameFr: string;
};

export type TimeRange = {
	id: string;
	name: string;
	nameFr: string;
};

export type InsightIconMap = Record<string, Icon>;

export type SectorStat = {
	sector: string;
	sectorName: string;
	count: number;
	positions: number;
};

export type RegionalDistItem = {
	regionId: string;
	regionName: string;
	totalJobs: number;
	jobGrowth: number;
	avgSalary: number;
};

export type SalaryChartItem = {
	name: string;
	min: number;
	median: number;
	max: number;
};

export type IndustryPieItem = {
	name: string;
	value: number;
};

export type SkillsDemandItem = {
	name: string;
	demandScore: number;
	growth: number;
	salaryBoost: number;
};

export type TrendLineItem = {
	month: string;
	jobs: number;
	salaries: number;
};

export type InsightsFilterState = {
	selectedSector: string;
	setSelectedSector: (value: string) => void;
	selectedRegion: string;
	setSelectedRegion: (value: string) => void;
	selectedTimeRange: string;
	setSelectedTimeRange: (value: string) => void;
	searchQuery: string;
	setSearchQuery: (value: string) => void;
	activeTab: string;
	setActiveTab: (value: string) => void;
};
