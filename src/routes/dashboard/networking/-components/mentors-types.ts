export type MentorStatus = "available" | "busy" | "on_vacation";
export type RequestStatus = "pending" | "accepted" | "declined" | "completed";
export type SessionType = "video_call" | "phone_call" | "in_person" | "chat";
export type GoalStatus = "not_started" | "in_progress" | "completed";
export type ExpertiseLevel = "beginner" | "intermediate" | "advanced" | "expert";

export interface Skill {
	name: string;
	level: ExpertiseLevel;
}

export interface AvailabilitySlot {
	day: "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday";
	startTime: string;
	endTime: string;
}

export interface UserGoals {
	targetRole: string;
	skills: string[];
	industries: string[];
	timeline: string;
}
