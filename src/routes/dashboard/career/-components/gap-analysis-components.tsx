// Re-export all gap analysis components from split sub-files.
// The route file (gap-analysis.tsx) imports from this barrel.

export { GapSummaryCategories, IndustryBenchmarks } from "./gap-analysis-analysis";
export { MetricsCards, QuickActions, StudyPlanCTA } from "./gap-analysis-cards";
export { HeroSection } from "./gap-analysis-hero";
export { LearningPathsContent } from "./gap-analysis-learning";
export { ProgressTabContent } from "./gap-analysis-progress";
export { ResourcesDialog, ResourcesTabContent } from "./gap-analysis-resources";
export {
	AddSkillDialog,
	PrioritySkills,
	QuickAddSkills,
	SearchFilterBar,
	SkillsGrid,
	SkillsRadarSection,
	TargetRoleSelection,
} from "./gap-analysis-skills";
