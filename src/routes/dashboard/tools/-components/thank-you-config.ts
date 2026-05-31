import {
	EnvelopeIcon,
	HeartIcon,
	PaperPlaneTiltIcon,
	SealCheckIcon,
	SparkleIcon,
	UsersIcon,
} from "@phosphor-icons/react";

import type {
	InterviewTypeConfig,
	SendMethodConfig,
	TemplateConfig,
	TemplateStyle,
	TimingRecommendation,
} from "./thank-you-types";

// Template configurations
export const templateConfig: TemplateConfig = {
	formal: {
		label: "Formal",
		description: "Professional and traditional tone",
		icon: SealCheckIcon,
		color: "text-blue-600 dark:text-blue-400",
		tone: "respectful and professional",
	},
	warm: {
		label: "Warm",
		description: "Cordial and appreciative tone",
		icon: HeartIcon,
		color: "text-rose-600 dark:text-rose-400",
		tone: "warm and sincere",
	},
	enthusiastic: {
		label: "Enthusiastic",
		description: "Dynamic and passionate tone",
		icon: SparkleIcon,
		color: "text-amber-600 dark:text-amber-400",
		tone: "energetic and passionate",
	},
};

// Interview type configurations
export const interviewTypes: InterviewTypeConfig = {
	phone: { label: "Phone", description: "Phone interview" },
	video: { label: "Video", description: "Video conference interview" },
	inperson: { label: "In Person", description: "On-site interview" },
	panel: { label: "Panel", description: "Interview with multiple interviewers" },
	technical: { label: "Technical", description: "Technical interview or case study" },
};

// Send method configurations
export const sendMethods: SendMethodConfig = {
	email: { label: "Email", icon: EnvelopeIcon },
	physical: { label: "Mail", icon: PaperPlaneTiltIcon },
	linkedin: { label: "LinkedIn", icon: UsersIcon },
};

// Calculate timing recommendation
export function getTimingRecommendation(interviewDate: string): TimingRecommendation {
	const interview = new Date(interviewDate);
	const now = new Date();
	const hoursDiff = (now.getTime() - interview.getTime()) / (1000 * 60 * 60);

	if (hoursDiff < 0) {
		return {
			status: "optimal",
			message: "The interview has not taken place yet",
		};
	}
	if (hoursDiff <= 24) {
		return {
			status: "optimal",
			message: "Optimal timing! Send your letter in the next few hours.",
		};
	}
	if (hoursDiff <= 48) {
		return {
			status: "acceptable",
			message: "Good timing. Send your letter today.",
		};
	}
	return {
		status: "late",
		message: "It is recommended to send within 24-48h. Don't wait any longer!",
	};
}

// Generate thank you letter based on template and details
export function generateThankYouLetter(
	recipientName: string,
	recipientCompany: string,
	recipientPosition: string,
	interviewDate: string,
	discussionPoints: string[],
	jobPosition: string,
	template: TemplateStyle,
): string {
	const formattedDate = new Date(interviewDate).toLocaleDateString("fr-FR", {
		weekday: "long",
		day: "numeric",
		month: "long",
	});

	const templates: Record<TemplateStyle, string> = {
		formal: `Dear ${recipientPosition ? `${recipientPosition} ` : ""}${recipientName},

I wanted to express my sincere gratitude for the interview you granted me on ${formattedDate} regarding the ${jobPosition} position at ${recipientCompany}.

This meeting allowed me to better understand the challenges associated with this role, particularly ${discussionPoints[0] ? discussionPoints[0].toLowerCase() : "the various aspects of the position"}. Our discussion about ${discussionPoints[1] ? discussionPoints[1].toLowerCase() : "the team's objectives"} particularly caught my attention and reinforced my interest in this opportunity.

I am confident that my skills and experience align perfectly with the needs expressed. I remain at your complete disposal for any additional information.

Looking forward to hearing from you.

Sincerely,
[Your name]`,

		warm: `Dear ${recipientName},

I wanted to warmly thank you for our conversation on ${formattedDate}. It was a true pleasure meeting you and learning more about ${recipientCompany} and the ${jobPosition} position.

I was particularly impressed by your presentation of ${discussionPoints[0] ? discussionPoints[0].toLowerCase() : "the company's vision"}. Our discussion about ${discussionPoints[1] ? discussionPoints[1].toLowerCase() : "development opportunities"} motivated me even more to join your team.

${discussionPoints[2] ? `The prospects regarding ${discussionPoints[2].toLowerCase()} correspond exactly to what I am looking for in my next professional step.` : ""}

I hope to have the opportunity to continue our conversations and contribute to the success of ${recipientCompany}.

Best regards,
[Your name]`,

		enthusiastic: `Hello ${recipientName}!

What an enriching interview! I absolutely wanted to thank you for our meeting on ${formattedDate}. I left our conversation with tenfold motivation to join ${recipientCompany} as ${jobPosition}!

What particularly excited me was ${discussionPoints[0] ? discussionPoints[0].toLowerCase() : "your innovative vision"}. And when you mentioned ${discussionPoints[1] ? discussionPoints[1].toLowerCase() : "upcoming projects"}, I immediately saw how I could contribute!

${discussionPoints[2] ? `The prospects of ${discussionPoints[2].toLowerCase()} completely convinced me that this position is perfect for me!` : ""}

I truly look forward to learning more about the next steps. Please don't hesitate to reach out if you need any additional information!

Hope to hear from you soon,
[Your name]`,
	};

	return templates[template];
}
