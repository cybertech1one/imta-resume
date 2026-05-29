import type { EnvelopeIcon, StarIcon } from "@phosphor-icons/react";

export type TemplateStyle = "formal" | "warm" | "enthusiastic";
export type InterviewType = "phone" | "video" | "inperson" | "panel" | "technical";
export type SendMethod = "email" | "physical" | "linkedin";

export type TemplateConfig = Record<
	TemplateStyle,
	{ label: string; description: string; icon: typeof StarIcon; color: string; tone: string }
>;

export type InterviewTypeConfig = Record<InterviewType, { label: string; description: string }>;

export type SendMethodConfig = Record<SendMethod, { label: string; icon: typeof EnvelopeIcon }>;

export type TimingRecommendation = {
	status: "optimal" | "acceptable" | "late";
	message: string;
};
