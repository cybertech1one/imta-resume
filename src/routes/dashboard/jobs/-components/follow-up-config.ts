import {
	CheckCircleIcon,
	ClockIcon,
	EnvelopeIcon,
	EnvelopeSimpleIcon,
	HandWavingIcon,
	LightbulbIcon,
	PaperPlaneTiltIcon,
	TargetIcon,
	TimerIcon,
	XCircleIcon,
} from "@phosphor-icons/react";

import type {
	BestPracticeTip,
	EmailTemplate,
	FollowUpStatus,
	FollowUpType,
	FollowUpTypeConfigEntry,
	StatusConfigEntry,
} from "./follow-up-types";

// Status configuration
export const statusConfig: Record<FollowUpStatus, StatusConfigEntry> = {
	not_sent: {
		label: "Not Sent",
		icon: EnvelopeSimpleIcon,
		color: "text-gray-600 dark:text-gray-400",
		bgColor: "bg-gray-100 dark:bg-gray-800/30",
	},
	sent: {
		label: "Sent",
		icon: PaperPlaneTiltIcon,
		color: "text-blue-600 dark:text-blue-400",
		bgColor: "bg-blue-100 dark:bg-blue-900/30",
	},
	responded: {
		label: "Response Received",
		icon: CheckCircleIcon,
		color: "text-green-600 dark:text-green-400",
		bgColor: "bg-green-100 dark:bg-green-900/30",
	},
	no_response: {
		label: "No Response",
		icon: XCircleIcon,
		color: "text-red-600 dark:text-red-400",
		bgColor: "bg-red-100 dark:bg-red-900/30",
	},
};

// Follow-up type configuration
export const followUpTypeConfig: Record<FollowUpType, FollowUpTypeConfigEntry> = {
	initial: {
		label: "First Follow-up",
		color: "bg-blue-500",
		days: 7,
	},
	second: {
		label: "Second Follow-up",
		color: "bg-amber-500",
		days: 14,
	},
	final: {
		label: "Final Follow-up",
		color: "bg-red-500",
		days: 21,
	},
};

// Default email templates
export const defaultEmailTemplates: EmailTemplate[] = [
	{
		id: "initial-1",
		type: "initial",
		name: "First Follow-up - Standard",
		subject: "Following up on my application - [Position]",
		body: `Dear [Recruiter Name],

I hope this message finds you well. I am writing to follow up on my application for the [Position] role that I submitted on [Date].

I remain very interested in this opportunity and would be happy to discuss my application with you. Please do not hesitate to contact me if you need any additional information.

Thank you for your time and consideration.

Best regards,
[Your Name]`,
	},
	{
		id: "second-1",
		type: "second",
		name: "Second Follow-up - Reminder",
		subject: "Follow-up - Application for [Position]",
		body: `Dear [Recruiter Name],

I am reaching out again regarding my application for the [Position] role. I contacted you a week ago and wanted to check if you have had the chance to review my application.

I remain very motivated by this opportunity and confident that my skills match your team's needs.

Would it be possible to arrange a phone call to discuss further?

Thank you in advance for your response.

Best regards,
[Your Name]`,
	},
	{
		id: "final-1",
		type: "final",
		name: "Final Follow-up - Closing",
		subject: "Final follow-up - Application for [Position]",
		body: `Dear [Recruiter Name],

I am reaching out one last time regarding my application for the [Position] role submitted on [Date].

I completely understand that you have many applications to review. If the position has been filled or if my application was not selected, I would appreciate being informed so that I can focus my search accordingly.

I remain available should an opportunity matching my profile arise in the future.

Thank you for your attention.

Best regards,
[Your Name]`,
	},
];

// Best practices tips
export const bestPracticesTips: BestPracticeTip[] = [
	{
		id: "1",
		icon: ClockIcon,
		title: "Optimal Timing",
		description:
			"Send your first follow-up 7 days after the application. This is the optimal delay to maximize your chances of a response.",
	},
	{
		id: "2",
		icon: EnvelopeIcon,
		title: "Personalization",
		description:
			"Personalize each email with the recruiter's name and specific details about the position to show your interest.",
	},
	{
		id: "3",
		icon: TargetIcon,
		title: "Conciseness",
		description: "Keep your follow-up emails short and direct. 3-4 paragraphs maximum are sufficient.",
	},
	{
		id: "4",
		icon: LightbulbIcon,
		title: "Added Value",
		description:
			"Include a new relevant piece of information in each follow-up: a recent article, a new project, or a certification earned.",
	},
	{
		id: "5",
		icon: HandWavingIcon,
		title: "Professional Tone",
		description: "Stay courteous and professional, even without a response. Your attitude can open future doors.",
	},
	{
		id: "6",
		icon: TimerIcon,
		title: "Follow-up Limit",
		description: "Do not exceed 3 follow-ups. Beyond that, you risk being perceived as pushy.",
	},
];
