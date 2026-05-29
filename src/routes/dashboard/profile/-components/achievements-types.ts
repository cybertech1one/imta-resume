import type { RouterOutput } from "@/integrations/orpc/client";

// =============================================================================
// TYPES & INTERFACES
// =============================================================================

export type AchievementTier = "bronze" | "silver" | "gold" | "platinum";
export type AchievementCategory =
	| "resume"
	| "interview"
	| "job_search"
	| "learning"
	| "engagement"
	| "networking"
	| "career";

// Types from router output
export type AchievementDefinition = RouterOutput["achievements"]["getAchievementDefinitions"][number];
export type UserAchievementWithDefinition = RouterOutput["achievements"]["getUserAchievementsWithDefinitions"][number];
export type Challenge = RouterOutput["achievements"]["getChallenges"][number];
export type LeaderboardEntry = RouterOutput["achievements"]["getLeaderboard"][number];
export type Milestone = RouterOutput["achievements"]["getMilestones"][number];
export type Reward = RouterOutput["achievements"]["getRewards"][number];
export type Notification = RouterOutput["achievements"]["getNotifications"][number];
