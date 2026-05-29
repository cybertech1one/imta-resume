import { t } from "@lingui/core/macro";
import type { Icon } from "@phosphor-icons/react";
import {
	BellIcon,
	CalendarIcon,
	CheckCircleIcon,
	ClockIcon,
	FileTextIcon,
	GraduationCapIcon,
	LightbulbIcon,
	PaperPlaneTiltIcon,
	StarIcon,
	UserCircleIcon,
	UsersIcon,
} from "@phosphor-icons/react";

import type {
	EmailTemplate,
	RecommenderFormData,
	RecommenderType,
	ReminderFrequency,
	RequestFormData,
	RequestStatus,
	SampleLetter,
} from "./recommendation-request-types";

export const recommenderTypeConfig: Record<RecommenderType, { label: string; icon: Icon; color: string }> = {
	supervisor: {
		label: t`Supervisor`,
		icon: UserCircleIcon,
		color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
	},
	colleague: {
		label: t`Colleague`,
		icon: UsersIcon,
		color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
	},
	professor: {
		label: t`Professor`,
		icon: GraduationCapIcon,
		color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
	},
	mentor: {
		label: t`Mentor`,
		icon: LightbulbIcon,
		color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
	},
	client: {
		label: t`Client`,
		icon: StarIcon,
		color: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400",
	},
};

export const statusConfig: Record<RequestStatus, { label: string; icon: Icon; color: string; bgColor: string }> = {
	pending: {
		label: t`Pending`,
		icon: ClockIcon,
		color: "text-amber-600 dark:text-amber-400",
		bgColor: "bg-amber-100 dark:bg-amber-900/30",
	},
	received: {
		label: t`Received`,
		icon: CheckCircleIcon,
		color: "text-green-600 dark:text-green-400",
		bgColor: "bg-green-100 dark:bg-green-900/30",
	},
	sent: {
		label: t`Sent`,
		icon: PaperPlaneTiltIcon,
		color: "text-blue-600 dark:text-blue-400",
		bgColor: "bg-blue-100 dark:bg-blue-900/30",
	},
};

export const reminderConfig: Record<ReminderFrequency, { label: string }> = {
	none: { label: t`No reminder` },
	daily: { label: t`Daily` },
	weekly: { label: t`Weekly` },
	biweekly: { label: t`Biweekly` },
};

export const EMAIL_TEMPLATES: EmailTemplate[] = [
	{
		id: "tpl-1",
		name: t`Formal initial request`,
		type: "initial",
		subject: t`Recommendation Letter Request`,
		body: t`Dear [NOM],

I hope you are doing well. I am reaching out because I would like to apply for [OBJECTIF].

Given our collaboration at [ENTREPRISE] and your knowledge of my work, I would be very honored if you would agree to write a recommendation letter on my behalf.

The submission deadline is [DATE]. I am happy to provide any useful documents (resume, job description, etc.).

Here are some points you could potentially mention:
[POINTS_CLES]

I would completely understand if you are unable to accommodate this request. Otherwise, I would be extremely grateful.

Best regards,
[VOTRE_NOM]`,
	},
	{
		id: "tpl-2",
		name: t`Informal request`,
		type: "initial",
		subject: t`A favor to ask`,
		body: t`Hi [NOM],

I hope you're doing well! I'm writing because I'm applying for [OBJECTIF] and I would need a recommendation letter.

You know my work well and I think your testimony would be very valuable. The deadline is [DATE].

Some points you could mention:
[POINTS_CLES]

Let me know if this works for you. Thanks in advance!

Best,
[VOTRE_NOM]`,
	},
	{
		id: "tpl-3",
		name: t`Polite follow-up`,
		type: "follow_up",
		subject: t`Follow-up - Recommendation Letter`,
		body: t`Dear [NOM],

I am following up regarding my recommendation letter request for [OBJECTIF].

I understand you have a busy schedule, but the deadline is approaching ([DATE]). If you need any additional information, please do not hesitate to contact me.

I remain at your disposal and thank you in advance for your help.

Best regards,
[VOTRE_NOM]`,
	},
	{
		id: "tpl-4",
		name: t`Thank you`,
		type: "thank_you",
		subject: t`Thank You for Your Recommendation`,
		body: t`Dear [NOM],

I wanted to sincerely thank you for taking the time to write a recommendation letter on my behalf.

Your support means a lot to me and I greatly appreciate the trust you have placed in me. I will be sure to keep you informed about the outcome of my application.

Thank you again for your invaluable help.

With all my gratitude,
[VOTRE_NOM]`,
	},
];

export const SAMPLE_LETTERS: SampleLetter[] = [
	{
		id: "sample-1",
		title: t`Professor Letter - Master's`,
		type: "professor",
		content: t`Dear Sir/Madam,

I am pleased to recommend [NOM_CANDIDAT] for your Master's program. As the professor supervising their research project, I have had the opportunity to appreciate their exceptional qualities.

[NOM_CANDIDAT] demonstrated remarkable scientific rigor and an outstanding analytical ability. Their work on [SUJET] showed deep technical mastery and rare intellectual creativity.

Beyond their academic skills, [NOM_CANDIDAT] possesses excellent interpersonal qualities. They collaborated effectively with the research team and contributed positively to seminars.

I therefore recommend [NOM_CANDIDAT] without any reservation for your program. I am confident they will excel.

Respectfully,
[SIGNATAIRE]`,
		highlights: [t`Scientific rigor`, t`Analytical ability`, t`Technical mastery`, t`Interpersonal skills`],
	},
	{
		id: "sample-2",
		title: t`Supervisor Letter - Employment`,
		type: "supervisor",
		content: t`Dear Sir/Madam,

It is with great enthusiasm that I recommend [NOM_CANDIDAT] for the position of [POSTE] within your company.

As [NOM_CANDIDAT]'s manager for [DUREE] years at [ENTREPRISE], I was able to observe their remarkable professional growth. They consistently exceeded our expectations and played a key role in several strategic projects.

Among their main achievements:
- Leadership on the [PROJET1] project generating [RESULTAT]
- Process improvement in [DOMAINE] reducing costs by [POURCENTAGE]
- Mentoring of [NOMBRE] junior team members

[NOM_CANDIDAT] combines solid technical expertise with excellent communication and team management skills. They are an integrous, motivated professional always ready to take on new challenges.

I strongly recommend them and remain available for any additional information.

Best regards,
[SIGNATAIRE]`,
		highlights: [t`Project Leadership`, t`Process Improvement`, t`Mentoring`, t`Effective Communication`],
	},
	{
		id: "sample-3",
		title: t`Colleague Letter - Collaboration`,
		type: "colleague",
		content: t`Dear Sir/Madam,

I am happy to recommend [NOM_CANDIDAT] with whom I had the pleasure of collaborating for [DUREE] at [ENTREPRISE].

Our collaboration on [PROJET] allowed me to appreciate their many professional qualities. [NOM_CANDIDAT] is an exceptional colleague, always available and positive.

What distinguishes [NOM_CANDIDAT]:
- Excellent teamwork ability
- Creative resolution of complex problems
- Clear and supportive communication
- Reliability and commitment to deadlines

I do not hesitate to recommend [NOM_CANDIDAT] for any professional opportunity. Any team would be lucky to have them.

Best regards,
[SIGNATAIRE]`,
		highlights: [t`Teamwork`, t`Creativity`, t`Communication`, t`Reliability`],
	},
];

export const RECOMMENDATION_TIPS = [
	{
		id: "tip-1",
		title: t`Choose the right people`,
		description: t`Select recommenders who know you well and can speak to specific skills relevant to your application.`,
		icon: UsersIcon,
	},
	{
		id: "tip-2",
		title: t`Give enough time`,
		description: t`Make your request at least 3-4 weeks before the deadline to allow for a thoughtful and quality letter.`,
		icon: CalendarIcon,
	},
	{
		id: "tip-3",
		title: t`Provide information`,
		description: t`Share your resume, the job/program description, and key points you would like to see mentioned.`,
		icon: FileTextIcon,
	},
	{
		id: "tip-4",
		title: t`Make it easy`,
		description: t`Offer specific examples of projects or achievements that the recommender could mention.`,
		icon: LightbulbIcon,
	},
	{
		id: "tip-5",
		title: t`Follow up politely`,
		description: t`If you haven't heard back a week before the deadline, send a courteous reminder.`,
		icon: BellIcon,
	},
	{
		id: "tip-6",
		title: t`Always say thank you`,
		description: t`Send a thank you message after receiving the letter and keep the recommender informed of the outcome.`,
		icon: StarIcon,
	},
];

export const INITIAL_RECOMMENDER_FORM: RecommenderFormData = {
	name: "",
	email: "",
	phone: "",
	title: "",
	company: "",
	relationship: "supervisor",
	yearsKnown: 1,
	notes: "",
};

export function createInitialRequestForm(defaultRecommenderId = ""): RequestFormData {
	return {
		recommenderId: defaultRecommenderId,
		purpose: "",
		deadline: "",
		status: "pending",
		requestDate: new Date().toISOString().split("T")[0],
		talkingPoints: [],
		followUpReminder: "weekly",
		notes: "",
	};
}
