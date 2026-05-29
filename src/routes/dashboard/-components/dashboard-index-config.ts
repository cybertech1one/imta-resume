import type { MessageDescriptor } from "@lingui/core";
import { msg } from "@lingui/core/macro";
import type { Icon } from "@phosphor-icons/react";
import {
	BriefcaseIcon,
	CalendarIcon,
	ChartLineUpIcon,
	ChatsCircleIcon,
	CheckCircleIcon,
	CompassIcon,
	FileTextIcon,
	GraduationCapIcon,
	PencilSimpleIcon,
	PlusCircleIcon,
	SparkleIcon,
	StarIcon,
	TargetIcon,
	TrendUpIcon,
	TrophyIcon,
	UsersIcon,
} from "@phosphor-icons/react";
import type { QuickAction } from "./dashboard-index-types";

export const MOTIVATIONAL_MESSAGES: MessageDescriptor[] = [
	msg`Every day is a new opportunity to shine!`,
	msg`Your resume is your passport to success.`,
	msg`Preparation is the key to interview success.`,
	msg`Invest in your training, reap the rewards.`,
	msg`Your career starts with a great presentation.`,
	msg`Success comes to those who prepare.`,
	msg`Today is the first day of your professional future.`,
	msg`Every skill you acquire brings you closer to your goal.`,
	msg`Confidence is built through preparation.`,
	msg`Your potential is limitless, explore it!`,
];

export const activityIcons: Record<string, Icon> = {
	resume_created: PlusCircleIcon,
	resume_updated: PencilSimpleIcon,
	resume_deleted: FileTextIcon,
	job_application_created: BriefcaseIcon,
	job_application_updated: BriefcaseIcon,
	job_application_status_changed: TrendUpIcon,
	interview_scheduled: CalendarIcon,
	interview_completed: CheckCircleIcon,
	interview_practice_started: ChatsCircleIcon,
	interview_practice_completed: TrophyIcon,
	skill_added: StarIcon,
	skill_updated: ChartLineUpIcon,
	goal_created: TargetIcon,
	goal_completed: TrophyIcon,
	contact_added: UsersIcon,
	training_started: GraduationCapIcon,
	training_completed: GraduationCapIcon,
	deadline_created: CalendarIcon,
	deadline_completed: CheckCircleIcon,
};

export const activityLabels: Record<string, MessageDescriptor> = {
	resume_created: msg`Resume created`,
	resume_updated: msg`Resume updated`,
	resume_deleted: msg`Resume deleted`,
	job_application_created: msg`Application added`,
	job_application_updated: msg`Application updated`,
	job_application_status_changed: msg`Application status changed`,
	interview_scheduled: msg`Interview scheduled`,
	interview_completed: msg`Interview completed`,
	interview_practice_started: msg`Practice started`,
	interview_practice_completed: msg`Practice completed`,
	skill_added: msg`Skill added`,
	skill_updated: msg`Skill updated`,
	goal_created: msg`Goal created`,
	goal_completed: msg`Goal achieved`,
	contact_added: msg`Contact added`,
	training_started: msg`Training started`,
	training_completed: msg`Training completed`,
	deadline_created: msg`Deadline created`,
	deadline_completed: msg`Deadline completed`,
};

export const quickActions: QuickAction[] = [
	{
		id: "create-cv",
		title: msg`Create a Resume`,
		description: msg`Start a new professional resume with AI assistance`,
		icon: PlusCircleIcon,
		href: "/dashboard/resumes",
		accentColor: "var(--imta-emerald)",
		shortcut: "N",
	},
	{
		id: "practice-interview",
		title: msg`Practice Interview`,
		description: msg`Prepare with our AI-powered interview simulator`,
		icon: ChatsCircleIcon,
		href: "/dashboard/interview",
		accentColor: "var(--imta-blue)",
		shortcut: "E",
	},
	{
		id: "ai-mentor",
		title: msg`AI Mentor`,
		description: msg`Get personalized advice for your career`,
		icon: SparkleIcon,
		href: "/dashboard/ai-mentor",
		accentColor: "var(--imta-teal)",
		shortcut: "M",
	},
	{
		id: "career-guidance",
		title: msg`Job Search`,
		description: msg`Explore opportunities matching your profile`,
		icon: CompassIcon,
		href: "/dashboard/jobs",
		accentColor: "var(--imta-terracotta)",
		shortcut: "J",
	},
];

export const APPLICATION_CHART_COLORS = [
	"oklch(0.45 0.14 160)",
	"oklch(0.55 0.15 195)",
	"oklch(0.35 0.12 250)",
	"oklch(0.55 0.14 35)",
	"oklch(0.55 0.2 25)",
	"oklch(0.5 0.02 250)",
	"oklch(0.5 0.14 200)",
	"oklch(0.62 0.17 155)",
];

export const SKILLS_CHART_COLORS = [
	"oklch(0.45 0.14 160)",
	"oklch(0.55 0.15 195)",
	"oklch(0.55 0.14 35)",
	"oklch(0.35 0.12 250)",
];

export const APPLICATION_STATUS_LABELS: Record<string, MessageDescriptor> = {
	saved: msg`Saved`,
	applied: msg`Applied`,
	phone_screen: msg`Phone Screen`,
	interview: msg`Interview`,
	offer: msg`Offer`,
	rejected: msg`Rejected`,
	withdrawn: msg`Withdrawn`,
	accepted: msg`Accepted`,
};

export const SKILLS_CATEGORY_LABELS: Record<string, MessageDescriptor> = {
	technical: msg`Technical`,
	soft: msg`Soft Skills`,
	languages: msg`Languages`,
	certifications: msg`Certifications`,
};
