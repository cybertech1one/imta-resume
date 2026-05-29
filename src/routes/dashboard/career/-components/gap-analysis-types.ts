export type SkillCategory = "technical" | "soft" | "languages" | "certifications" | "tools";

export interface CurrentSkill {
	id: string;
	name: string;
	nameFr: string;
	category: SkillCategory;
	currentLevel: number; // 1-5
	yearsExperience: number;
	lastUsed: string; // date
	notes: string;
	createdAt: string;
	updatedAt: string;
}

export interface TargetRole {
	id: string;
	name: string;
	nameFr: string;
	industry: "healthcare" | "industrial" | "hse" | "technology" | "general";
	description: string;
	salaryRange: { min: number; max: number };
	demandLevel: "high" | "medium" | "low";
	requiredSkills: RequiredSkill[];
}

export interface RequiredSkill {
	name: string;
	nameFr: string;
	category: SkillCategory;
	requiredLevel: number; // 1-5
	importance: "critical" | "important" | "nice-to-have";
	industryBenchmark: number; // Average level in industry
}

export interface SkillGap {
	skillName: string;
	skillNameFr: string;
	category: SkillCategory;
	currentLevel: number;
	requiredLevel: number;
	industryBenchmark: number;
	gapSize: number;
	priority: number; // Calculated priority score
	importance: "critical" | "important" | "nice-to-have";
	timeToClose: number; // Estimated weeks
	learningResources: LearningResource[];
}

export interface LearningResource {
	id: string;
	title: string;
	titleFr: string;
	type: "course" | "book" | "certification" | "tutorial" | "practice" | "mentorship";
	platform: string;
	url: string;
	duration: string;
	cost: "free" | "paid" | "subscription";
	difficulty: "beginner" | "intermediate" | "advanced";
	rating: number;
}

export interface ProgressRecord {
	skillId: string;
	skillName: string;
	date: string;
	previousLevel: number;
	newLevel: number;
	notes: string;
}

export interface GapAnalysisData {
	currentSkills: CurrentSkill[];
	selectedRoleId: string | null;
	progressRecords: ProgressRecord[];
	weeklyGoalHours: number;
	lastAnalysisDate: string;
	exportHistory: { date: string; format: string }[];
}
