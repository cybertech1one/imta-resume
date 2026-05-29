import type { Icon } from "@phosphor-icons/react";
import {
	CalendarCheckIcon,
	ChartLineUpIcon,
	ChatsCircleIcon,
	ClockIcon,
	CloudIcon,
	ComputerTowerIcon,
	DesktopIcon,
	GlobeIcon,
	HeadsetIcon,
	HouseLineIcon,
	LightbulbIcon,
	ListChecksIcon,
	MonitorIcon,
	PresentationChartIcon,
	RocketLaunchIcon,
	ShieldCheckIcon,
	SparkleIcon,
	TargetIcon,
	TimerIcon,
	TrendUpIcon,
	UsersIcon,
	VideoIcon,
	WifiHighIcon,
	WrenchIcon,
} from "@phosphor-icons/react";

import type {
	ChecklistItem,
	HomeOfficeItem,
	ProductivityTip,
	ReadinessLevel,
	RemoteTool,
	SkillCategory,
} from "./remote-readiness-types";

// =============================================================================
// CATEGORY & LEVEL CONFIG
// =============================================================================

export const CATEGORY_CONFIG: Record<SkillCategory, { label: string; icon: Icon; color: string; bgColor: string }> = {
	communication: {
		label: "Communication",
		icon: ChatsCircleIcon,
		color: "text-blue-600 dark:text-blue-400",
		bgColor: "bg-blue-100 dark:bg-blue-900/30",
	},
	time_management: {
		label: "Time Management",
		icon: ClockIcon,
		color: "text-purple-600 dark:text-purple-400",
		bgColor: "bg-purple-100 dark:bg-purple-900/30",
	},
	tech_proficiency: {
		label: "Tech Proficiency",
		icon: ComputerTowerIcon,
		color: "text-green-600 dark:text-green-400",
		bgColor: "bg-green-100 dark:bg-green-900/30",
	},
	self_discipline: {
		label: "Self-Discipline",
		icon: TargetIcon,
		color: "text-amber-600 dark:text-amber-400",
		bgColor: "bg-amber-100 dark:bg-amber-900/30",
	},
	home_office: {
		label: "Home Office",
		icon: HouseLineIcon,
		color: "text-red-600 dark:text-red-400",
		bgColor: "bg-red-100 dark:bg-red-900/30",
	},
};

export const LEVEL_CONFIG: Record<
	ReadinessLevel,
	{ label: string; minPercentage: number; color: string; description: string }
> = {
	beginner: {
		label: "Beginner",
		minPercentage: 0,
		color: "text-red-600 dark:text-red-400",
		description: "You need significant preparation for remote work.",
	},
	developing: {
		label: "Developing",
		minPercentage: 40,
		color: "text-orange-600 dark:text-orange-400",
		description: "You are progressing but some skills need more work.",
	},
	competent: {
		label: "Competent",
		minPercentage: 60,
		color: "text-amber-600 dark:text-amber-400",
		description: "You have the basics to work remotely effectively.",
	},
	proficient: {
		label: "Proficient",
		minPercentage: 75,
		color: "text-green-600 dark:text-green-400",
		description: "You are well prepared for remote work.",
	},
	expert: {
		label: "Expert",
		minPercentage: 90,
		color: "text-primary",
		description: "You have mastered remote work skills!",
	},
};

// =============================================================================
// CHECKLIST DATA
// =============================================================================

export const CHECKLIST_ITEMS: ChecklistItem[] = [
	// Communication
	{
		id: "check-comm-1",
		category: "communication",
		text: "Master at least 2 video conferencing tools (Zoom, Teams, Meet)",
	},
	{
		id: "check-comm-2",
		category: "communication",
		text: "Know how to run a virtual meeting effectively",
	},
	{
		id: "check-comm-3",
		category: "communication",
		text: "Practice clear and concise writing for asynchronous messages",
	},
	{
		id: "check-comm-4",
		category: "communication",
		text: "Configure smart notifications (not too many, not too few)",
	},

	// Time Management
	{
		id: "check-time-1",
		category: "time_management",
		text: "Establish a daily routine with fixed hours",
	},
	{
		id: "check-time-2",
		category: "time_management",
		text: "Use a prioritization method (Eisenhower, MoSCoW, etc.)",
	},
	{
		id: "check-time-3",
		category: "time_management",
		text: "Set clear boundaries between work and personal life",
	},
	{
		id: "check-time-4",
		category: "time_management",
		text: "Schedule deep work blocks without interruption",
	},

	// Tech Proficiency
	{
		id: "check-tech-1",
		category: "tech_proficiency",
		text: "Set up two-factor authentication everywhere",
	},
	{
		id: "check-tech-2",
		category: "tech_proficiency",
		text: "Set up automatic backups",
	},
	{
		id: "check-tech-3",
		category: "tech_proficiency",
		text: "Master essential keyboard shortcuts",
	},
	{
		id: "check-tech-4",
		category: "tech_proficiency",
		text: "Know how to troubleshoot common audio/video issues",
	},

	// Self Discipline
	{
		id: "check-disc-1",
		category: "self_discipline",
		text: "Practice the Pomodoro technique or similar",
	},
	{
		id: "check-disc-2",
		category: "self_discipline",
		text: "Keep a productivity journal for one week",
	},
	{
		id: "check-disc-3",
		category: "self_discipline",
		text: "Identify and eliminate your top 3 distractions",
	},
	{
		id: "check-disc-4",
		category: "self_discipline",
		text: "Create start-of-day and end-of-day rituals",
	},

	// Home Office
	{
		id: "check-office-1",
		category: "home_office",
		text: "Have a dedicated and organized workspace",
	},
	{
		id: "check-office-2",
		category: "home_office",
		text: "Test and optimize your internet connection",
	},
	{
		id: "check-office-3",
		category: "home_office",
		text: "Invest in a quality headset with microphone",
	},
	{
		id: "check-office-4",
		category: "home_office",
		text: "Optimize your workstation ergonomics",
	},
];

// =============================================================================
// HOME OFFICE SETUP DATA
// =============================================================================

export const HOME_OFFICE_ITEMS: HomeOfficeItem[] = [
	// Essential
	{
		id: "ho-1",
		category: "essential",
		name: "Reliable internet connection",
		description: "Minimum 25 Mbps download, ideally fiber optic",
		icon: WifiHighIcon,
	},
	{
		id: "ho-2",
		category: "essential",
		name: "Capable computer",
		description: "Laptop or desktop with adequate specs for your tasks",
		icon: DesktopIcon,
	},
	{
		id: "ho-3",
		category: "essential",
		name: "Headset with microphone",
		description: "For calls and meetings without echo or background noise",
		icon: HeadsetIcon,
	},
	{
		id: "ho-4",
		category: "essential",
		name: "Quality webcam",
		description: "HD minimum, with good low-light performance",
		icon: VideoIcon,
	},
	{
		id: "ho-5",
		category: "essential",
		name: "Desk and chair",
		description: "Adequate work surface and comfortable seating",
		icon: HouseLineIcon,
	},

	// Recommended
	{
		id: "ho-6",
		category: "recommended",
		name: "External monitor",
		description: "24 inches minimum for better visual comfort",
		icon: MonitorIcon,
	},
	{
		id: "ho-7",
		category: "recommended",
		name: "Ergonomic keyboard and mouse",
		description: "To prevent RSI during long sessions",
		icon: ComputerTowerIcon,
	},
	{
		id: "ho-8",
		category: "recommended",
		name: "Adequate lighting",
		description: "Natural light plus desk lamp for video calls",
		icon: LightbulbIcon,
	},
	{
		id: "ho-9",
		category: "recommended",
		name: "Backup connection",
		description: "Mobile hotspot or 4G dongle in case of outage",
		icon: GlobeIcon,
	},
	{
		id: "ho-10",
		category: "recommended",
		name: "Noise-canceling headphones",
		description: "For noisy environments",
		icon: ShieldCheckIcon,
	},

	// Nice to have
	{
		id: "ho-11",
		category: "nice_to_have",
		name: "Laptop stand",
		description: "For better posture and airflow",
		icon: RocketLaunchIcon,
	},
	{
		id: "ho-12",
		category: "nice_to_have",
		name: "Dual monitors",
		description: "For maximum productivity with multiple applications",
		icon: MonitorIcon,
	},
	{
		id: "ho-13",
		category: "nice_to_have",
		name: "Standing desk",
		description: "Sit-stand desk to vary positions",
		icon: ChartLineUpIcon,
	},
	{
		id: "ho-14",
		category: "nice_to_have",
		name: "Professional video lighting",
		description: "Ring light or LED panel for better video quality",
		icon: SparkleIcon,
	},
	{
		id: "ho-15",
		category: "nice_to_have",
		name: "Green screen or virtual background",
		description: "For more professional video calls",
		icon: PresentationChartIcon,
	},
];

// =============================================================================
// PRODUCTIVITY TIPS DATA
// =============================================================================

export const PRODUCTIVITY_TIPS: ProductivityTip[] = [
	{
		id: "tip-1",
		title: "The Pomodoro Technique",
		description: "Work in 25-minute sessions with 5-minute breaks. After 4 sessions, take a longer 15-30 minute break.",
		icon: TimerIcon,
		category: "focus",
	},
	{
		id: "tip-2",
		title: "Time Blocking",
		description:
			"Block specific time slots in your calendar for different types of tasks. Protect these blocks like important meetings.",
		icon: CalendarCheckIcon,
		category: "planning",
	},
	{
		id: "tip-3",
		title: "The 2-Minute Rule",
		description:
			"If a task takes less than 2 minutes, do it immediately instead of postponing it. This prevents small tasks from piling up.",
		icon: ClockIcon,
		category: "productivity",
	},
	{
		id: "tip-4",
		title: "Eat the Frog",
		description: "Start your day with the most difficult or unpleasant task. The rest of the day will feel easier.",
		icon: TargetIcon,
		category: "mindset",
	},
	{
		id: "tip-5",
		title: "Batch Processing",
		description: "Group similar tasks (emails, calls, admin work) and handle them together to avoid context switching.",
		icon: ListChecksIcon,
		category: "efficiency",
	},
	{
		id: "tip-6",
		title: "Transition Rituals",
		description: "Create rituals to mark the start and end of the workday: morning coffee, evening walk, etc.",
		icon: RocketLaunchIcon,
		category: "boundaries",
	},
	{
		id: "tip-7",
		title: "Asynchronous Communication",
		description:
			"Prefer written messages that allow others to respond when available. Reserve calls for urgent matters.",
		icon: ChatsCircleIcon,
		category: "communication",
	},
	{
		id: "tip-8",
		title: "Clean Desk",
		description:
			"An organized workspace reduces distractions and stress. Spend 5 minutes at the end of the day tidying up.",
		icon: HouseLineIcon,
		category: "environment",
	},
	{
		id: "tip-9",
		title: "Active Breaks",
		description:
			"Incorporate movement into your breaks: stretching, walking, exercises. This boosts energy and concentration.",
		icon: TrendUpIcon,
		category: "wellbeing",
	},
	{
		id: "tip-10",
		title: "Proactive Documentation",
		description:
			"Document your work as you go. This facilitates asynchronous collaboration and avoids unnecessary meetings.",
		icon: WrenchIcon,
		category: "collaboration",
	},
];

// =============================================================================
// REMOTE TOOLS DATA
// =============================================================================

export const REMOTE_TOOLS: RemoteTool[] = [
	// Communication
	{
		id: "tool-1",
		name: "Slack",
		description: "Team messaging with organized channels and integrations",
		category: "communication",
		icon: ChatsCircleIcon,
	},
	{
		id: "tool-2",
		name: "Zoom",
		description: "Reliable video conferencing for meetings and webinars",
		category: "communication",
		icon: VideoIcon,
	},
	{
		id: "tool-3",
		name: "Microsoft Teams",
		description: "Complete collaborative suite with chat, video, and file sharing",
		category: "communication",
		icon: UsersIcon,
	},

	// Project Management
	{
		id: "tool-4",
		name: "Notion",
		description: "All-in-one workspace for notes, docs, and projects",
		category: "project_management",
		icon: ListChecksIcon,
	},
	{
		id: "tool-5",
		name: "Trello",
		description: "Visual Kanban boards for task management",
		category: "project_management",
		icon: PresentationChartIcon,
	},
	{
		id: "tool-6",
		name: "Asana",
		description: "Project management with timelines and automations",
		category: "project_management",
		icon: TargetIcon,
	},

	// Time Tracking
	{
		id: "tool-7",
		name: "Toggl",
		description: "Simple time tracking with detailed reports",
		category: "time_tracking",
		icon: TimerIcon,
	},
	{
		id: "tool-8",
		name: "RescueTime",
		description: "Automatic analysis of time usage",
		category: "time_tracking",
		icon: ChartLineUpIcon,
	},
	{
		id: "tool-9",
		name: "Clockify",
		description: "Free time tracking with advanced features",
		category: "time_tracking",
		icon: ClockIcon,
	},

	// File Sharing
	{
		id: "tool-10",
		name: "Google Drive",
		description: "Cloud storage with real-time collaboration",
		category: "file_sharing",
		icon: CloudIcon,
	},
	{
		id: "tool-11",
		name: "Dropbox",
		description: "File synchronization and secure sharing",
		category: "file_sharing",
		icon: CloudIcon,
	},
	{
		id: "tool-12",
		name: "OneDrive",
		description: "Microsoft storage integrated with Office 365",
		category: "file_sharing",
		icon: CloudIcon,
	},

	// Focus
	{
		id: "tool-13",
		name: "Forest",
		description: "Gamified focus app with tree planting",
		category: "focus",
		icon: TargetIcon,
	},
	{
		id: "tool-14",
		name: "Freedom",
		description: "Distraction blocker for websites and apps",
		category: "focus",
		icon: ShieldCheckIcon,
	},
	{
		id: "tool-15",
		name: "Brain.fm",
		description: "Scientifically designed music for concentration",
		category: "focus",
		icon: SparkleIcon,
	},
];
