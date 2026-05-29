import { t } from "@lingui/core/macro";
import type { Icon } from "@phosphor-icons/react";
import {
	ArrowsClockwiseIcon,
	ClipboardTextIcon,
	EnvelopeIcon,
	HandshakeIcon,
	HeartIcon,
	LinkedinLogoIcon,
	SparkleIcon,
	UserIcon,
} from "@phosphor-icons/react";

import type {
	EffectiveMessageTip,
	MessageTemplate,
	PersonalizationField,
	TemplateCategory,
} from "./message-templates-types";

// Category configuration
export const categoryConfig: Record<
	TemplateCategory,
	{ label: string; color: string; icon: Icon; description: string }
> = {
	linkedin: {
		label: t`LinkedIn`,
		color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
		icon: LinkedinLogoIcon,
		description: t`LinkedIn connection and engagement messages`,
	},
	email: {
		label: t`Email`,
		color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
		icon: EnvelopeIcon,
		description: t`Professional outreach emails`,
	},
	follow_up: {
		label: t`Follow-up`,
		color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
		icon: ArrowsClockwiseIcon,
		description: t`Follow-up and reminder messages`,
	},
	thank_you: {
		label: t`Thank You`,
		color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
		icon: HeartIcon,
		description: t`Thank you and gratitude messages`,
	},
};

// Personalization field templates
export const commonPersonalizationFields: PersonalizationField[] = [
	{ key: "{{NOM}}", label: t`Recipient name`, placeholder: "Jean Dupont", example: "Jean Dupont" },
	{ key: "{{ENTREPRISE}}", label: t`Company name`, placeholder: "TechCorp", example: "TechCorp" },
	{
		key: "{{POSTE}}",
		label: t`Job title`,
		placeholder: "Marketing Director",
		example: "Marketing Director",
	},
	{ key: "{{MON_NOM}}", label: t`Your name`, placeholder: "Marie Martin", example: "Marie Martin" },
	{
		key: "{{POINT_COMMUN}}",
		label: t`Common connection`,
		placeholder: "Tech 2024 conference",
		example: "Tech 2024 conference",
	},
	{
		key: "{{COMPETENCE}}",
		label: t`Specific skill`,
		placeholder: "web development",
		example: "web development",
	},
];

// Initial templates library
export const INITIAL_TEMPLATES: MessageTemplate[] = [
	// LinkedIn Templates
	{
		id: "template-1",
		name: t`LinkedIn Connection Request - Standard`,
		category: "linkedin",
		body: `Hello {{NOM}},

I came across your profile and I'm impressed by your career at {{ENTREPRISE}}. Your expertise in {{COMPETENCE}} particularly interests me.

I would love to connect and exchange ideas on industry trends and expand my professional network.

Best regards,
{{MON_NOM}}`,
		personalizationFields: [
			commonPersonalizationFields[0],
			commonPersonalizationFields[1],
			commonPersonalizationFields[5],
			commonPersonalizationFields[3],
		],
		tags: ["connection", "standard", "first contact"],
		isFavorite: true,
		usageCount: 45,
		createdAt: "2024-01-01",
		isCustom: false,
	},
	{
		id: "template-2",
		name: t`Post-event Connection`,
		category: "linkedin",
		body: `Hello {{NOM}},

It was a pleasure meeting you at {{POINT_COMMUN}}. Our discussion about {{COMPETENCE}} was very inspiring.

I would love to stay in touch and continue our conversation. Would you be available for a virtual coffee soon?

Best regards,
{{MON_NOM}}`,
		personalizationFields: [
			commonPersonalizationFields[0],
			commonPersonalizationFields[4],
			commonPersonalizationFields[5],
			commonPersonalizationFields[3],
		],
		tags: ["event", "networking", "virtual coffee"],
		isFavorite: true,
		usageCount: 32,
		createdAt: "2024-01-05",
		isCustom: false,
	},
	{
		id: "template-3",
		name: t`Job Information Request`,
		category: "linkedin",
		body: `Hello {{NOM}},

I am very interested in the {{POSTE}} position at {{ENTREPRISE}}. As a professional in the field, could you share some insights about the company culture and growth opportunities?

I would be very grateful for your time.

Thank you in advance,
{{MON_NOM}}`,
		personalizationFields: [
			commonPersonalizationFields[0],
			commonPersonalizationFields[2],
			commonPersonalizationFields[1],
			commonPersonalizationFields[3],
		],
		tags: ["job", "information", "opportunity"],
		isFavorite: false,
		usageCount: 28,
		createdAt: "2024-01-10",
		isCustom: false,
	},
	{
		id: "template-4",
		name: t`Recommendation Request`,
		category: "linkedin",
		body: `Hello {{NOM}},

I hope you are doing well. We worked together at {{ENTREPRISE}} and I truly enjoyed collaborating with you.

I am currently exploring new opportunities and a recommendation from you on LinkedIn would be very valuable to me.

Would you be available to write a few lines about our collaboration?

Thank you so much,
{{MON_NOM}}`,
		personalizationFields: [
			commonPersonalizationFields[0],
			commonPersonalizationFields[1],
			commonPersonalizationFields[3],
		],
		tags: ["recommendation", "former colleague", "profile"],
		isFavorite: false,
		usageCount: 15,
		createdAt: "2024-01-15",
		isCustom: false,
	},

	// Email Templates
	{
		id: "template-5",
		name: t`Unsolicited Application Email`,
		category: "email",
		subject: t`Unsolicited Application - {{POSTE}} - {{MON_NOM}}`,
		body: `Dear {{NOM}},

I am reaching out because {{ENTREPRISE}} inspires me with its commitment to {{COMPETENCE}} and I would like to contribute to your projects as a {{POSTE}}.

My background has allowed me to develop strong skills that align with your company's values. I would be honored to present my profile in more detail during an interview.

I remain at your disposal for any discussion.

Best regards,
{{MON_NOM}}`,
		personalizationFields: [
			commonPersonalizationFields[0],
			commonPersonalizationFields[1],
			commonPersonalizationFields[5],
			commonPersonalizationFields[2],
			commonPersonalizationFields[3],
		],
		tags: ["application", "unsolicited", "job"],
		isFavorite: true,
		usageCount: 67,
		createdAt: "2024-01-02",
		isCustom: false,
	},
	{
		id: "template-6",
		name: t`Professional Networking Email`,
		category: "email",
		subject: t`Professional Exchange - {{COMPETENCE}}`,
		body: `Hello {{NOM}},

I am {{MON_NOM}}, passionate about {{COMPETENCE}}. I discovered your work at {{ENTREPRISE}} and I am impressed by your accomplishments.

I would be very interested in discussing your career path and the current challenges in your industry. Would you have 20 minutes for a call next week?

Looking forward to hearing from you,
{{MON_NOM}}`,
		personalizationFields: [
			commonPersonalizationFields[0],
			commonPersonalizationFields[3],
			commonPersonalizationFields[5],
			commonPersonalizationFields[1],
		],
		tags: ["networking", "exchange", "call"],
		isFavorite: false,
		usageCount: 41,
		createdAt: "2024-01-08",
		isCustom: false,
	},
	{
		id: "template-7",
		name: t`Referral Follow-up Email`,
		category: "email",
		subject: t`Referral from {{POINT_COMMUN}}`,
		body: `Hello {{NOM}},

{{POINT_COMMUN}} strongly recommended that I reach out to you regarding opportunities at {{ENTREPRISE}}.

With experience in {{COMPETENCE}}, I am confident that my profile could bring real value to your team.

Would you be available for a brief discussion this week?

Best regards,
{{MON_NOM}}`,
		personalizationFields: [
			commonPersonalizationFields[0],
			commonPersonalizationFields[4],
			commonPersonalizationFields[1],
			commonPersonalizationFields[5],
			commonPersonalizationFields[3],
		],
		tags: ["referral", "recommendation", "opportunity"],
		isFavorite: true,
		usageCount: 23,
		createdAt: "2024-01-12",
		isCustom: false,
	},

	// Follow-up Templates
	{
		id: "template-8",
		name: t`Post-application Follow-up`,
		category: "follow_up",
		subject: t`Application Follow-up - {{POSTE}}`,
		body: `Hello {{NOM}},

I am reaching out following my application for the {{POSTE}} position at {{ENTREPRISE}} submitted a week ago.

I remain very motivated by this opportunity and would be happy to present my skills and vision for this role in more detail.

Could you provide an update on the recruitment process?

Best regards,
{{MON_NOM}}`,
		personalizationFields: [
			commonPersonalizationFields[0],
			commonPersonalizationFields[2],
			commonPersonalizationFields[1],
			commonPersonalizationFields[3],
		],
		tags: ["follow-up", "application", "reminder"],
		isFavorite: true,
		usageCount: 89,
		createdAt: "2024-01-03",
		isCustom: false,
	},
	{
		id: "template-9",
		name: t`Post-interview Follow-up`,
		category: "follow_up",
		subject: t`Following Our Interview - {{POSTE}}`,
		body: `Hello {{NOM}},

I wanted to follow up on our interview last week regarding the {{POSTE}} position.

Our discussion about {{COMPETENCE}} reinforced my enthusiasm for this opportunity. I am confident that my experience would be an asset to {{ENTREPRISE}}.

Do you have any updates regarding the next steps?

Best regards,
{{MON_NOM}}`,
		personalizationFields: [
			commonPersonalizationFields[0],
			commonPersonalizationFields[2],
			commonPersonalizationFields[5],
			commonPersonalizationFields[1],
			commonPersonalizationFields[3],
		],
		tags: ["follow-up", "interview", "decision"],
		isFavorite: false,
		usageCount: 54,
		createdAt: "2024-01-06",
		isCustom: false,
	},
	{
		id: "template-10",
		name: t`Contact Follow-up`,
		category: "follow_up",
		body: `Hello {{NOM}},

I hope you are doing well. I am following up on my previous message.

I remain very interested in the possibility of discussing {{COMPETENCE}} and opportunities at {{ENTREPRISE}} with you.

Would you be available for a brief call this week or next?

Thank you for your time,
{{MON_NOM}}`,
		personalizationFields: [
			commonPersonalizationFields[0],
			commonPersonalizationFields[5],
			commonPersonalizationFields[1],
			commonPersonalizationFields[3],
		],
		tags: ["follow-up", "reminder", "contact"],
		isFavorite: false,
		usageCount: 36,
		createdAt: "2024-01-11",
		isCustom: false,
	},

	// Thank You Templates
	{
		id: "template-11",
		name: t`Post-interview Thank You`,
		category: "thank_you",
		subject: t`Thank You - Interview for {{POSTE}}`,
		body: `Hello {{NOM}},

I wanted to sincerely thank you for the time you gave me during our interview today.

Our discussion about {{COMPETENCE}} and the vision of {{ENTREPRISE}} reinforced my interest in the {{POSTE}} position.

I remain at your disposal for any additional information.

Best regards,
{{MON_NOM}}`,
		personalizationFields: [
			commonPersonalizationFields[0],
			commonPersonalizationFields[5],
			commonPersonalizationFields[1],
			commonPersonalizationFields[2],
			commonPersonalizationFields[3],
		],
		tags: ["thank you", "interview", "gratitude"],
		isFavorite: true,
		usageCount: 112,
		createdAt: "2024-01-01",
		isCustom: false,
	},
	{
		id: "template-12",
		name: t`Networking Coffee Thank You`,
		category: "thank_you",
		body: `Hello {{NOM}},

Thank you again for our conversation today! Your career at {{ENTREPRISE}} is truly inspiring.

Your advice on {{COMPETENCE}} gave me new perspectives for my career going forward.

I hope we will have the chance to meet again. Please don't hesitate if I can be of help to you as well.

Warm regards,
{{MON_NOM}}`,
		personalizationFields: [
			commonPersonalizationFields[0],
			commonPersonalizationFields[1],
			commonPersonalizationFields[5],
			commonPersonalizationFields[3],
		],
		tags: ["thank you", "coffee", "networking"],
		isFavorite: false,
		usageCount: 47,
		createdAt: "2024-01-04",
		isCustom: false,
	},
	{
		id: "template-13",
		name: t`Thank You for Recommendation`,
		category: "thank_you",
		body: `Dear {{NOM}},

I wanted to express my sincere gratitude for the recommendation you wrote for me.

Your words about our collaboration at {{ENTREPRISE}} are very valuable and will certainly help me in my future professional endeavors.

I wish you all the best and remain at your disposal.

With all my gratitude,
{{MON_NOM}}`,
		personalizationFields: [
			commonPersonalizationFields[0],
			commonPersonalizationFields[1],
			commonPersonalizationFields[3],
		],
		tags: ["thank you", "recommendation", "gratitude"],
		isFavorite: false,
		usageCount: 29,
		createdAt: "2024-01-09",
		isCustom: false,
	},
	{
		id: "template-14",
		name: t`Post-event Thank You`,
		category: "thank_you",
		body: `Hello {{NOM}},

It was a real pleasure meeting you at {{POINT_COMMUN}}.

Your presentation on {{COMPETENCE}} was very enriching. I particularly appreciated your insights on current trends.

I hope we can connect again very soon.

Best regards,
{{MON_NOM}}`,
		personalizationFields: [
			commonPersonalizationFields[0],
			commonPersonalizationFields[4],
			commonPersonalizationFields[5],
			commonPersonalizationFields[3],
		],
		tags: ["thank you", "event", "conference"],
		isFavorite: true,
		usageCount: 38,
		createdAt: "2024-01-07",
		isCustom: false,
	},
];

// Effective messaging tips
export const MESSAGING_TIPS: EffectiveMessageTip[] = [
	{
		id: "tip-1",
		title: t`Personalize every message`,
		description: t`Avoid generic messages. Mention a specific detail from the recipient's profile or career to show your genuine interest.`,
		category: "general",
		icon: UserIcon,
	},
	{
		id: "tip-2",
		title: t`Be concise and clear`,
		description: t`Professionals are busy. Get to the point in 3-4 paragraphs maximum while remaining polite and professional.`,
		category: "general",
		icon: ClipboardTextIcon,
	},
	{
		id: "tip-3",
		title: t`Include a clear call to action`,
		description: t`End with a specific request: a 15-minute call, a virtual coffee, or simply an answer to a question.`,
		category: "general",
		icon: HandshakeIcon,
	},
	{
		id: "tip-4",
		title: t`LinkedIn: Stay under 300 characters`,
		description: t`Connection requests are limited. Be impactful and make them want to accept your invitation.`,
		category: "linkedin",
		icon: LinkedinLogoIcon,
	},
	{
		id: "tip-5",
		title: t`Email: Catchy subject line`,
		description: t`Your email subject line determines whether it will be opened. Be specific and avoid generic phrasing.`,
		category: "email",
		icon: EnvelopeIcon,
	},
	{
		id: "tip-6",
		title: t`Follow-up: Wait 5-7 days`,
		description: t`Allow enough time before following up. A follow-up too soon can come across as pushy.`,
		category: "follow_up",
		icon: ArrowsClockwiseIcon,
	},
	{
		id: "tip-7",
		title: t`Thank you: Send within 24 hours`,
		description: t`A thank you message should be sent promptly after the interview or meeting to remain memorable.`,
		category: "thank_you",
		icon: HeartIcon,
	},
	{
		id: "tip-8",
		title: t`Mention a mutual connection`,
		description: t`If you have a mutual contact, mention them. Personal referrals significantly increase the response rate.`,
		category: "general",
		icon: SparkleIcon,
	},
];
