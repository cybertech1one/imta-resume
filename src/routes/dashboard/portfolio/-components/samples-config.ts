import type { ProjectLink, ProjectStatus, ProjectTechnology, ProjectType } from "./samples-types";

// Project type configuration
export const PROJECT_TYPE_CONFIG: Record<ProjectType, { label: string; color: string; bgColor: string }> = {
	web: {
		label: "Developpement Web",
		color: "text-blue-600 dark:text-blue-400",
		bgColor: "bg-blue-100 dark:bg-blue-900/30",
	},
	mobile: {
		label: "Application Mobile",
		color: "text-green-600 dark:text-green-400",
		bgColor: "bg-green-100 dark:bg-green-900/30",
	},
	design: {
		label: "Design UI/UX",
		color: "text-purple-600 dark:text-purple-400",
		bgColor: "bg-purple-100 dark:bg-purple-900/30",
	},
	backend: {
		label: "Backend & API",
		color: "text-orange-600 dark:text-orange-400",
		bgColor: "bg-orange-100 dark:bg-orange-900/30",
	},
	fullstack: {
		label: "Full-Stack",
		color: "text-cyan-600 dark:text-cyan-400",
		bgColor: "bg-cyan-100 dark:bg-cyan-900/30",
	},
	data: {
		label: "Data & Analytics",
		color: "text-red-600 dark:text-red-400",
		bgColor: "bg-red-100 dark:bg-red-900/30",
	},
	devops: {
		label: "DevOps & Cloud",
		color: "text-amber-600 dark:text-amber-400",
		bgColor: "bg-amber-100 dark:bg-amber-900/30",
	},
};

// Status configuration
export const STATUS_CONFIG: Record<ProjectStatus, { label: string; color: string; bgColor: string }> = {
	completed: {
		label: "Completed",
		color: "text-green-600 dark:text-green-400",
		bgColor: "bg-green-100 dark:bg-green-900/30",
	},
	"in-progress": {
		label: "In Progress",
		color: "text-blue-600 dark:text-blue-400",
		bgColor: "bg-blue-100 dark:bg-blue-900/30",
	},
	archived: {
		label: "Archived",
		color: "text-gray-600 dark:text-gray-400",
		bgColor: "bg-gray-100 dark:bg-gray-900/30",
	},
};

// Default form values
export function getDefaultProjectForm() {
	return {
		title: "",
		description: "",
		longDescription: "",
		role: "",
		type: "web" as ProjectType,
		status: "in-progress" as ProjectStatus,
		technologies: [] as ProjectTechnology[],
		skills: [] as string[],
		images: [] as string[],
		links: [] as ProjectLink[],
		featured: false,
		startDate: "",
		endDate: "",
		teamSize: undefined as number | undefined,
		client: "",
		industry: "",
	};
}
