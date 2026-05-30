import { t } from "@lingui/core/macro";
import {
	BookOpenIcon,
	BriefcaseIcon,
	CheckCircleIcon,
	FirstAidKitIcon,
	GearIcon,
	HardHatIcon,
	PersonIcon,
	SparkleIcon,
	UserIcon,
} from "@phosphor-icons/react";
import z from "zod";

import type { CategoryConfigItem, FieldConfigItem } from "./tips-types";

export const searchSchema = z.object({
	category: z
		.enum(["preparation", "during", "after", "common_questions", "body_language", "field_specific"])
		.optional()
		.default("preparation"),
	field: z.enum(["healthcare", "industrial", "hse", "technology", "management", "general"]).optional(),
});

function getCategoryConfig(): Record<string, CategoryConfigItem> {
	return {
		preparation: {
			label: t`Préparation`,
			labelFr: t`Préparation`,
			description: t`Les actions à faire avant le jour de l'entretien`,
			icon: BookOpenIcon,
			color: "text-blue-600",
			bgColor: "from-blue-500/20 to-cyan-500/10",
		},
		during: {
			label: t`Pendant l'entretien`,
			labelFr: t`Pendant l'entretien`,
			description: t`Les bons réflexes pendant l'échange`,
			icon: PersonIcon,
			color: "text-purple-600",
			bgColor: "from-purple-500/20 to-pink-500/10",
		},
		after: {
			label: t`Après l'entretien`,
			labelFr: t`Après l'entretien`,
			description: t`Relance, suivi et amélioration après l'échange`,
			icon: CheckCircleIcon,
			color: "text-green-600",
			bgColor: "from-green-500/20 to-emerald-500/10",
		},
		common_questions: {
			label: t`Questions fréquentes`,
			labelFr: t`Questions fréquentes`,
			description: t`Préparer les réponses les plus demandées`,
			icon: BookOpenIcon,
			color: "text-cyan-600",
			bgColor: "from-cyan-500/20 to-sky-500/10",
		},
		body_language: {
			label: t`Langage corporel`,
			labelFr: t`Langage corporel`,
			description: t`Posture, regard, gestes et présence`,
			icon: UserIcon,
			color: "text-orange-600",
			bgColor: "from-orange-500/20 to-amber-500/10",
		},
		field_specific: {
			label: t`Conseils par domaine`,
			labelFr: t`Conseils par domaine`,
			description: t`Conseils adaptés à votre filière`,
			icon: SparkleIcon,
			color: "text-indigo-600",
			bgColor: "from-indigo-500/20 to-violet-500/10",
		},
	};
}

export const categoryConfig: Record<string, CategoryConfigItem> = new Proxy({} as Record<string, CategoryConfigItem>, {
	get(_target, prop: string) {
		return getCategoryConfig()[prop];
	},
	ownKeys() {
		return Object.keys(getCategoryConfig());
	},
	getOwnPropertyDescriptor(_target, prop) {
		const data = getCategoryConfig();
		if (prop in data) {
			return { configurable: true, enumerable: true, value: data[prop as string] };
		}
		return undefined;
	},
});

function getFieldConfig(): Record<string, FieldConfigItem> {
	return {
		healthcare: {
			label: t`Santé`,
			labelFr: t`Santé`,
			icon: FirstAidKitIcon,
			color: "text-red-600",
			bgColor: "bg-red-100 dark:bg-red-900/30",
		},
		industrial: {
			label: t`Industrie`,
			labelFr: t`Industrie`,
			icon: GearIcon,
			color: "text-blue-600",
			bgColor: "bg-blue-100 dark:bg-blue-900/30",
		},
		hse: {
			label: t`HSE`,
			labelFr: t`HSE`,
			icon: HardHatIcon,
			color: "text-amber-600",
			bgColor: "bg-amber-100 dark:bg-amber-900/30",
		},
		general: {
			label: t`Général`,
			labelFr: t`Général`,
			icon: BriefcaseIcon,
			color: "text-gray-600",
			bgColor: "bg-gray-100 dark:bg-gray-800/30",
		},
	};
}

export const fieldConfig: Record<string, FieldConfigItem> = new Proxy({} as Record<string, FieldConfigItem>, {
	get(_target, prop: string) {
		return getFieldConfig()[prop];
	},
	ownKeys() {
		return Object.keys(getFieldConfig());
	},
	getOwnPropertyDescriptor(_target, prop) {
		const data = getFieldConfig();
		if (prop in data) {
			return { configurable: true, enumerable: true, value: data[prop as string] };
		}
		return undefined;
	},
});
