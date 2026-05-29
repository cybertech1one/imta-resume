import type { Icon } from "@phosphor-icons/react";

export type SkillCategory = "technical" | "soft" | "languages" | "certifications" | "tools";
export type SkillImportance = "critical" | "important" | "nice-to-have";

export type CategoryConfigItem = { label: string; labelFr: string; icon: Icon; color: string };
export type IndustryConfigItem = { label: string; labelFr: string; icon: Icon; color: string };
export type ImportanceConfigItem = { label: string; labelFr: string; color: string };

export type RadarChartGap = {
	skillName: string;
	skillNameFr?: string;
	currentLevel: number;
	requiredLevel: number;
	industryBenchmark: number;
};

export type PrioritySkill = {
	skillId: string;
	skillName: string;
	skillNameFr?: string;
	category: SkillCategory;
	currentLevel: number;
	targetLevel: number;
	priorityRank: number;
	priorityScore: number;
	reasons: string[];
	impactOnEmployability: "high" | "medium" | "low";
	marketDemand: number;
	timeToAcquire: number;
};

export type MarketDemandSkill = {
	skillName: string;
	demandScore: number;
	growthRate: number;
	totalJobs: number;
	avgSalaryPremium: number;
	hotness: "fire" | "hot" | "warm" | "cold";
	trend: "rising" | "stable" | "declining";
};

export type IndustryBenchmark = {
	industry: string;
	industryFr?: string;
	totalPositions: number;
	growthRate: number;
	competitionLevel: "low" | "medium" | "high";
	topSkills: Array<{ name: string; demandScore: number }>;
};
