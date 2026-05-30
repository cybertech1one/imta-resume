import type { Icon } from "@phosphor-icons/react";
import {
	BookOpenIcon,
	BriefcaseIcon,
	ChartLineUpIcon,
	CheckCircleIcon,
	FirstAidKitIcon,
	GearIcon,
	GraduationCapIcon,
	HardHatIcon,
	LaptopIcon,
	LightbulbIcon,
	TargetIcon,
	UserIcon,
} from "@phosphor-icons/react";

export const categoryIconMap: Record<string, Icon> = {
	preparation: BookOpenIcon,
	during: TargetIcon,
	after: CheckCircleIcon,
	body_language: UserIcon,
	common_questions: LightbulbIcon,
	field_specific: GraduationCapIcon,
};

export function getFieldLabels() {
	return {
		healthcare: "Santé / Soins infirmiers",
		industrial: "Maintenance industrielle",
		hse: "HSE / Sécurité",
		management: "Management / Gestion",
		technology: "Technologie / Informatique",
		general: "Général",
	};
}

// Re-export as a getter for backwards compat in non-component contexts
export const fieldLabels = new Proxy({} as Record<string, string>, {
	get(_target, prop: string) {
		return getFieldLabels()[prop as keyof ReturnType<typeof getFieldLabels>] ?? prop;
	},
});

export function getFieldDescriptions() {
	return {
		healthcare: "Questions pour soins infirmiers, aide-soignant et sage-femme",
		industrial: "Maintenance, électromécanique, soudure et conduite d'engins",
		hse: "Hygiène, sécurité et environnement industriel",
		management: "Finance, RH, commerce, supply chain et gestion de projets",
		technology: "Informatique, réseaux, data/IA, cybersécurité et télécoms",
		general: "Questions générales pour tous les domaines",
	};
}

export const fieldDescriptions = new Proxy({} as Record<string, string>, {
	get(_target, prop: string) {
		return getFieldDescriptions()[prop as keyof ReturnType<typeof getFieldDescriptions>] ?? prop;
	},
});

export const fieldIcons: Record<string, Icon> = {
	healthcare: FirstAidKitIcon,
	industrial: GearIcon,
	hse: HardHatIcon,
	management: ChartLineUpIcon,
	technology: LaptopIcon,
	general: BriefcaseIcon,
};

export const fieldColors = {
	healthcare: "from-red-500/20 via-rose-500/10 to-transparent",
	industrial: "from-blue-500/20 via-indigo-500/10 to-transparent",
	hse: "from-amber-500/20 via-orange-500/10 to-transparent",
	management: "from-violet-500/20 via-purple-500/10 to-transparent",
	technology: "from-cyan-500/20 via-sky-500/10 to-transparent",
	general: "from-gray-500/20 via-slate-500/10 to-transparent",
};

export const fieldBadgeColors = {
	healthcare: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
	industrial: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
	hse: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
	management: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400",
	technology: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400",
	general: "bg-gray-100 text-gray-700 dark:bg-gray-800/30 dark:text-gray-400",
};

export function getDifficultyLabels() {
	return {
		beginner: "Débutant",
		intermediate: "Intermédiaire",
		advanced: "Avancé",
	};
}

export const difficultyLabels = new Proxy({} as Record<string, string>, {
	get(_target, prop: string) {
		return getDifficultyLabels()[prop as keyof ReturnType<typeof getDifficultyLabels>] ?? prop;
	},
});

export function getStatusLabels() {
	return {
		pending: "En attente",
		in_progress: "En cours",
		completed: "Terminé",
		abandoned: "Abandonné",
	};
}

export const statusLabels = new Proxy({} as Record<string, string>, {
	get(_target, prop: string) {
		return getStatusLabels()[prop as keyof ReturnType<typeof getStatusLabels>] ?? prop;
	},
});

export const statusColors = {
	pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
	in_progress: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
	completed: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
	abandoned: "bg-gray-100 text-gray-800 dark:bg-gray-800/30 dark:text-gray-400",
};

export function getCategoryLabels(): Record<string, string> {
	return {
		preparation: "Préparation",
		during: "Pendant l'entretien",
		after: "Après l'entretien",
		body_language: "Langage corporel",
		common_questions: "Questions fréquentes",
		field_specific: "Par domaine",
	};
}

export const categoryLabels = new Proxy({} as Record<string, string>, {
	get(_target, prop: string) {
		return getCategoryLabels()[prop] ?? prop;
	},
});

export const INTERVIEW_FIELDS = ["healthcare", "industrial", "hse", "management", "technology", "general"] as const;
