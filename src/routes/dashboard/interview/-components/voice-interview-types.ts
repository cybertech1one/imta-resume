import type { Icon } from "@phosphor-icons/react";

export type InterviewType = "single" | "panel";
export type Difficulty = "easy" | "medium" | "hard";
export type Language = "fr" | "en" | "ar" | "darija";
export type InterviewPhase = "setup" | "interview" | "feedback";

export interface PanelMember {
	id: string;
	name: string;
	role: string;
	avatar: string;
	voiceStyle: "professional" | "friendly" | "challenging" | "technical";
	color: string;
}

export interface TranscriptEntry {
	id: string;
	speaker: string;
	speakerId: string;
	text: string;
	timestamp: number;
	isUser: boolean;
}

export interface FeedbackCategory {
	name: string;
	nameFr: string;
	score: number;
	maxScore: number;
	icon: Icon;
	color: string;
}

export interface InterviewerFeedback {
	interviewerId: string;
	interviewer: PanelMember;
	impression: string;
	keyPoints: string[];
	score: number;
}
