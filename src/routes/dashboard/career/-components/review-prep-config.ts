import type { Icon } from "@phosphor-icons/react";
import {
	BriefcaseIcon,
	ChatCircleDotsIcon,
	CheckCircleIcon,
	ClipboardTextIcon,
	ClockIcon,
	FlagIcon,
	GraduationCapIcon,
	MedalIcon,
	NotepadIcon,
	RocketLaunchIcon,
	StarIcon,
	TargetIcon,
	TrophyIcon,
	UsersIcon,
} from "@phosphor-icons/react";

import type {
	CareerGrowthTopic,
	ManagerQuestion,
	SelfAssessmentQuestion,
	TalkingPoint,
	TimelinePhase,
} from "./review-prep-types";

// ============================================================================
// Static Data (Templates/Guidance)
// ============================================================================

export const SELF_ASSESSMENT_QUESTIONS: Record<string, SelfAssessmentQuestion[]> = {
	performance: [
		{
			id: "sa-1",
			category: "Performance",
			question: "What are your three most significant accomplishments this year?",
			placeholder: "Describe your major achievements and their impact on the company...",
		},
		{
			id: "sa-2",
			category: "Performance",
			question: "How did you exceed expectations in your main responsibilities?",
			placeholder: "Give concrete examples of exceeding your objectives...",
		},
		{
			id: "sa-3",
			category: "Performance",
			question: "What challenges did you overcome and how?",
			placeholder: "Explain the obstacles you encountered and the strategies you used...",
		},
	],
	competences: [
		{
			id: "sa-4",
			category: "Skills",
			question: "What new skills did you develop this year?",
			placeholder: "List the training, certifications, or learning you completed...",
		},
		{
			id: "sa-5",
			category: "Skills",
			question: "What are your main professional strengths?",
			placeholder: "Identify your strengths and how they benefit the team...",
		},
		{
			id: "sa-6",
			category: "Skills",
			question: "What areas would you like to improve?",
			placeholder: "Be honest about the areas for improvement you have identified...",
		},
	],
	collaboration: [
		{
			id: "sa-7",
			category: "Collaboration",
			question: "How did you contribute to your team's success?",
			placeholder: "Give examples of collaboration and mutual support...",
		},
		{
			id: "sa-8",
			category: "Collaboration",
			question: "How did you handle conflicts or professional disagreements?",
			placeholder: "Describe your approach to conflict resolution...",
		},
	],
	leadership: [
		{
			id: "sa-9",
			category: "Leadership",
			question: "What initiatives did you take without being asked?",
			placeholder: "Talk about projects or improvements you initiated...",
		},
		{
			id: "sa-10",
			category: "Leadership",
			question: "How did you help your colleagues develop?",
			placeholder: "Describe your role as mentor or support to others...",
		},
	],
};

export const TALKING_POINTS: TalkingPoint[] = [
	{
		id: "tp-1",
		category: "Achievements",
		title: "Presenting accomplishments",
		description: "Structure your achievements with the STAR method (Situation, Task, Action, Result).",
		tips: [
			"Quantify your results with precise numbers",
			"Link your accomplishments to company objectives",
			"Prepare 3-5 concrete examples to share",
		],
		icon: TrophyIcon,
	},
	{
		id: "tp-2",
		category: "Goals",
		title: "Discussing future objectives",
		description: "Propose SMART goals aligned with the team's strategy.",
		tips: [
			"Research the company's priorities for the coming year",
			"Propose ambitious but realistic goals",
			"Include personal development objectives",
		],
		icon: TargetIcon,
	},
	{
		id: "tp-3",
		category: "Development",
		title: "Development plan",
		description: "Present your vision of professional growth.",
		tips: [
			"Identify the key skills for your career advancement",
			"Propose specific training or certifications",
			"Ask for feedback on your areas for improvement",
		],
		icon: GraduationCapIcon,
	},
	{
		id: "tp-4",
		category: "Recognition",
		title: "Requesting recognition",
		description: "Articulate your expectations regarding compensation and advancement.",
		tips: [
			"Base your request on market data",
			"Link your request to your contributions",
			"Be ready to negotiate on different elements",
		],
		icon: MedalIcon,
	},
	{
		id: "tp-5",
		category: "Feedback",
		title: "Receiving feedback",
		description: "Prepare yourself to receive and integrate constructive feedback.",
		tips: [
			"Listen actively without getting defensive",
			"Ask clarifying questions",
			"Propose concrete improvement actions",
		],
		icon: ChatCircleDotsIcon,
	},
];

export const MANAGER_QUESTIONS: ManagerQuestion[] = [
	{
		id: "mq-1",
		category: "career",
		question: "What growth opportunities do you see for me in the next 12-18 months?",
		purpose: "Understand your career trajectory within the organization.",
	},
	{
		id: "mq-2",
		category: "career",
		question: "What skills should I develop to reach the next level?",
		purpose: "Identify gaps to fill to advance in your career.",
	},
	{
		id: "mq-3",
		category: "feedback",
		question: "On what specific aspects can I improve to have more impact?",
		purpose: "Get actionable feedback for your development.",
	},
	{
		id: "mq-4",
		category: "feedback",
		question: "How do you perceive my contribution to the team this year?",
		purpose: "Validate your perception of your performance against your manager's.",
	},
	{
		id: "mq-5",
		category: "development",
		question: "What training or certifications would you recommend for my role?",
		purpose: "Benefit from your manager's experience to guide your training.",
	},
	{
		id: "mq-6",
		category: "development",
		question: "Are there projects or responsibilities I could take on to grow?",
		purpose: "Identify stretch assignment opportunities.",
	},
	{
		id: "mq-7",
		category: "expectations",
		question: "What are your priority expectations for me next year?",
		purpose: "Align your efforts with your manager's priorities.",
	},
	{
		id: "mq-8",
		category: "expectations",
		question: "How can I better support the team's objectives?",
		purpose: "Show your commitment to collective success.",
	},
	{
		id: "mq-9",
		category: "support",
		question: "What additional resources would I need to achieve my objectives?",
		purpose: "Ensure you have the support needed to succeed.",
	},
	{
		id: "mq-10",
		category: "support",
		question: "How do you prefer I keep you informed of my progress?",
		purpose: "Establish effective communication with your manager.",
	},
];

export const CAREER_GROWTH_TOPICS: CareerGrowthTopic[] = [
	{
		id: "cg-1",
		title: "Career Trajectory",
		description: "Discuss your ideal career path within the organization.",
		questions: [
			"Where do you see yourself in 2-3 years within the company?",
			"What roles interest you for the next stage of your career?",
			"How can the company support your ambitions?",
		],
		icon: RocketLaunchIcon,
	},
	{
		id: "cg-2",
		title: "Skills Development",
		description: "Identify the key skills for your career advancement.",
		questions: [
			"What technical skills should I strengthen?",
			"What soft skills are essential for my next role?",
			"Are there internal training programs available?",
		],
		icon: GraduationCapIcon,
	},
	{
		id: "cg-3",
		title: "Visibility and Networking",
		description: "Increase your impact and presence within the organization.",
		questions: [
			"How can I gain visibility with senior leadership?",
			"What strategic projects could I be assigned to?",
			"Are there committees or working groups I could contribute to?",
		],
		icon: UsersIcon,
	},
	{
		id: "cg-4",
		title: "Transition to Management",
		description: "Prepare your evolution toward a people manager role.",
		questions: [
			"What leadership experiences can I gain?",
			"Can I supervise interns or junior team members?",
			"What management training programs are recommended?",
		],
		icon: BriefcaseIcon,
	},
];

export const PREPARATION_TIMELINE: TimelinePhase[] = [
	{
		id: "phase-1",
		title: "4 Weeks Before",
		description: "Start gathering your data and accomplishments.",
		dueDate: "-28 days",
		tasks: [
			{ title: "Collect performance metrics", completed: false },
			{ title: "Review beginning-of-year objectives", completed: false },
			{ title: "List major projects completed", completed: false },
			{ title: "Gather feedback received", completed: false },
		],
		icon: NotepadIcon,
	},
	{
		id: "phase-2",
		title: "2 Weeks Before",
		description: "Structure your self-assessment and talking points.",
		dueDate: "-14 days",
		tasks: [
			{ title: "Complete the self-assessment", completed: false },
			{ title: "Prepare talking points", completed: false },
			{ title: "Research market salaries", completed: false },
			{ title: "Define your objectives for next year", completed: false },
		],
		icon: ClipboardTextIcon,
	},
	{
		id: "phase-3",
		title: "1 Week Before",
		description: "Finalize your preparation and practice.",
		dueDate: "-7 days",
		tasks: [
			{ title: "Rehearse your key points out loud", completed: false },
			{ title: "Prepare your questions for the manager", completed: false },
			{ title: "Anticipate difficult questions", completed: false },
			{ title: "Confirm the review date and time", completed: false },
		],
		icon: ChatCircleDotsIcon,
	},
	{
		id: "phase-4",
		title: "Day Of",
		description: "Be ready and confident for your review.",
		dueDate: "Review day",
		tasks: [
			{ title: "Re-read your preparation notes", completed: false },
			{ title: "Arrive 5 minutes early", completed: false },
			{ title: "Bring your reference documents", completed: false },
			{ title: "Take notes during the review", completed: false },
		],
		icon: StarIcon,
	},
];

// ============================================================================
// Helper Lookups & Functions
// ============================================================================

export const categoryColors: Record<string, string> = {
	project: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
	achievement: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
	skill: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
	recognition: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
	improvement: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400",
};

export const categoryLabels: Record<string, string> = {
	project: "Project",
	achievement: "Achievement",
	skill: "Skill",
	recognition: "Recognition",
	improvement: "Improvement",
};

export const goalCategoryColors: Record<string, string> = {
	performance: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
	development: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
	career: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
	collaboration: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
};

export const goalCategoryLabels: Record<string, string> = {
	performance: "Performance",
	development: "Development",
	career: "Career",
	collaboration: "Collaboration",
};

export const statusConfig: Record<string, { label: string; color: string; icon: Icon }> = {
	on_track: {
		label: "On Track",
		color: "text-green-600 dark:text-green-400",
		icon: CheckCircleIcon,
	},
	at_risk: {
		label: "At Risk",
		color: "text-amber-600 dark:text-amber-400",
		icon: FlagIcon,
	},
	completed: {
		label: "Completed",
		color: "text-blue-600 dark:text-blue-400",
		icon: TrophyIcon,
	},
	not_started: {
		label: "Not Started",
		color: "text-gray-500 dark:text-gray-400",
		icon: ClockIcon,
	},
};

export const questionCategoryLabels: Record<string, string> = {
	career: "Career",
	feedback: "Feedback",
	development: "Development",
	expectations: "Expectations",
	support: "Support",
};

export function formatCurrency(amount: number): string {
	return new Intl.NumberFormat(undefined, {
		style: "currency",
		currency: "EUR",
		maximumFractionDigits: 0,
	}).format(amount);
}
