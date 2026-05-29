export type PlatformType = "upwork" | "fiverr" | "linkedin";
export type PackageTier = "basic" | "standard" | "premium";
export type SkillProficiency = "beginner" | "intermediate" | "advanced" | "expert";
export type DayOfWeek = "lun" | "mar" | "mer" | "jeu" | "ven" | "sam" | "dim";

export type FreelanceAvailability = Record<DayOfWeek, boolean>;
