import type { Icon } from "@phosphor-icons/react";
import type { UseMutationResult } from "@tanstack/react-query";

// =============================================================================
// FORM TYPES
// =============================================================================

export interface UserProfileForm {
	skills: string[];
	field: string;
	experienceLevel: string;
	region: string;
	targetSalary: number;
}

// =============================================================================
// COMPONENT PROP TYPES
// =============================================================================

export interface StatCardProps {
	title: string;
	value: string | number;
	suffix?: string;
	icon: Icon;
	trend?: "up" | "down" | "stable";
	changePercent?: number;
	color: "blue" | "green" | "purple" | "orange" | "red";
	delay?: number;
}

export interface SkillDemandBarProps {
	skill: string;
	score: number;
	growth?: number;
	salaryBoost?: number;
}

export interface RegionalJobCardProps {
	region: string;
	jobs: number;
	growth: number;
	salary: number;
}

export interface CareerProgressionStepProps {
	stage: { level: string; years: string; title: string };
	salary: { min: number | null; median: number | null; max: number | null } | null;
	isActive: boolean;
}

export interface InsightCardProps {
	icon: Icon;
	title: string;
	description: string;
	type: "positive" | "negative" | "neutral";
}

export interface TrendNewsCardProps {
	category: string;
	title: string;
	items: { name: string; growth?: string; openPositions?: number }[];
}

// =============================================================================
// TAB SECTION PROP TYPES
// =============================================================================

export interface OverviewTabProps {
	marketOverview: any;
	overviewLoading: boolean;
	industryTrends: any;
	trendsLoading: boolean;
	itemVariants: Record<string, any>;
}

export interface SalaryTabProps {
	profileForm: UserProfileForm;
	setProfileForm: React.Dispatch<React.SetStateAction<UserProfileForm>>;
	salaryComparison: any;
	salaryLoading: boolean;
	itemVariants: Record<string, any>;
}

export interface SkillsTabProps {
	topSkills: any;
	skillsLoading: boolean;
	itemVariants: Record<string, any>;
}

export interface RegionsTabProps {
	regions: any;
	regionsLoading: boolean;
	itemVariants: Record<string, any>;
}

export interface PersonalizedTabProps {
	profileForm: UserProfileForm;
	setProfileForm: React.Dispatch<React.SetStateAction<UserProfileForm>>;
	skillInput: string;
	setSkillInput: (value: string) => void;
	handleAddSkill: () => void;
	handleRemoveSkill: (skill: string) => void;
	handleGetPersonalizedInsights: () => void;
	personalizedInsights: UseMutationResult<any, Error, UserProfileForm, unknown>;
	careerProgression: any;
	progressionLoading: boolean;
	itemVariants: Record<string, any>;
}
