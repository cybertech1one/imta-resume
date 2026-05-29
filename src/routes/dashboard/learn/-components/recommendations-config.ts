import {
	BookOpenIcon,
	CertificateIcon,
	CheckCircleIcon,
	GraduationCapIcon,
	PlayIcon,
	RocketLaunchIcon,
	TargetIcon,
	UsersIcon,
	VideoIcon,
	WarningCircleIcon,
} from "@phosphor-icons/react";

import type {
	CompletionStatus,
	DifficultyConfig,
	DifficultyLevel,
	ResourceType,
	ResourceTypeConfig,
	StatusConfig,
} from "./recommendations-types";

export const RESOURCE_TYPE_CONFIG: Record<ResourceType, ResourceTypeConfig> = {
	course: {
		label: "Course",
		labelFr: "Cours",
		icon: GraduationCapIcon,
		color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
	},
	tutorial: {
		label: "Tutorial",
		labelFr: "Tutoriel",
		icon: BookOpenIcon,
		color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
	},
	certification: {
		label: "Certification",
		labelFr: "Certification",
		icon: CertificateIcon,
		color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
	},
	video: {
		label: "Video",
		labelFr: "Vidéo",
		icon: VideoIcon,
		color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
	},
	article: {
		label: "Article",
		labelFr: "Article",
		icon: BookOpenIcon,
		color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
	},
	workshop: {
		label: "Workshop",
		labelFr: "Atelier",
		icon: UsersIcon,
		color: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400",
	},
	book: {
		label: "Book",
		labelFr: "Livre",
		icon: BookOpenIcon,
		color: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400",
	},
	webinar: {
		label: "Webinar",
		labelFr: "Webinaire",
		icon: VideoIcon,
		color: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400",
	},
	practice: {
		label: "Practice",
		labelFr: "Exercice",
		icon: TargetIcon,
		color: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
	},
	mentorship: {
		label: "Mentorship",
		labelFr: "Mentorat",
		icon: UsersIcon,
		color: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400",
	},
};

export const DIFFICULTY_CONFIG: Record<DifficultyLevel, DifficultyConfig> = {
	beginner: {
		label: "Beginner",
		labelFr: "Débutant",
		color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
	},
	intermediate: {
		label: "Intermediate",
		labelFr: "Intermédiaire",
		color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
	},
	advanced: {
		label: "Advanced",
		labelFr: "Avancé",
		color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
	},
	expert: {
		label: "Expert",
		labelFr: "Expert",
		color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
	},
};

export const STATUS_CONFIG: Record<CompletionStatus, StatusConfig> = {
	not_started: {
		label: "Not Started",
		labelFr: "Non commencé",
		color: "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400",
		icon: PlayIcon,
	},
	in_progress: {
		label: "In Progress",
		labelFr: "En cours",
		color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
		icon: RocketLaunchIcon,
	},
	completed: {
		label: "Completed",
		labelFr: "Terminé",
		color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
		icon: CheckCircleIcon,
	},
	paused: {
		label: "Paused",
		labelFr: "En pause",
		color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
		icon: WarningCircleIcon,
	},
	dropped: {
		label: "Dropped",
		labelFr: "Abandonné",
		color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
		icon: WarningCircleIcon,
	},
};
