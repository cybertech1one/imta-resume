import type { MessageDescriptor } from "@lingui/core";
import { msg } from "@lingui/core/macro";
import { MicrophoneIcon, SparkleIcon, TargetIcon } from "@phosphor-icons/react";

import type { ChatbotField, ChatbotLanguage, ChatbotMode } from "./chatbot-types";

export const modeConfig: Record<
	ChatbotMode,
	{
		label: MessageDescriptor;
		labelFr: string;
		description: MessageDescriptor;
		descriptionFr: string;
		icon: typeof SparkleIcon;
		color: string;
	}
> = {
	quick_practice: {
		label: msg`Quick Practice`,
		labelFr: "Pratique Rapide",
		description: msg`3-5 questions with immediate feedback`,
		descriptionFr: "3-5 questions avec feedback immédiat après chaque réponse",
		icon: SparkleIcon,
		color: "from-blue-500 to-cyan-500",
	},
	mock_interview: {
		label: msg`Full Interview`,
		labelFr: "Entretien Complet",
		description: msg`Complete simulation (8-10 questions), feedback at end`,
		descriptionFr: "Simulation complète (8-10 questions), feedback à la fin",
		icon: MicrophoneIcon,
		color: "from-purple-500 to-pink-500",
	},
	topic_focus: {
		label: msg`Topic Focus`,
		labelFr: "Focus Thématique",
		description: msg`In-depth questions on a specific skill`,
		descriptionFr: "Questions approfondies sur une compétence spécifique",
		icon: TargetIcon,
		color: "from-orange-500 to-red-500",
	},
};

export const fieldConfig: Record<ChatbotField, { label: MessageDescriptor; labelFr: string; emoji: string }> = {
	healthcare: { label: msg`Santé / Soins infirmiers`, labelFr: "Santé / Soins infirmiers", emoji: "🏥" },
	industrial: { label: msg`Industrial Maintenance`, labelFr: "Maintenance Industrielle", emoji: "🔧" },
	hse: { label: msg`HSE / Safety`, labelFr: "HSE / Sécurité", emoji: "⚠️" },
	management: { label: msg`Management / Gestion`, labelFr: "Management / Gestion", emoji: "📊" },
	technology: { label: msg`Technologie / Informatique`, labelFr: "Technologie / Informatique", emoji: "💻" },
	general: { label: msg`Général`, labelFr: "Général", emoji: "💼" },
};

export const languageConfig: Record<ChatbotLanguage, { label: MessageDescriptor; nativeLabel: string; flag: string }> =
	{
		fr: { label: msg`French`, nativeLabel: "Français", flag: "🇫🇷" },
		en: { label: msg`English`, nativeLabel: "English", flag: "🇬🇧" },
		ar: { label: msg`Arabic`, nativeLabel: "العربية", flag: "🇲🇦" },
	};

export const readinessConfig: Record<
	string,
	{ label: MessageDescriptor; labelFr: string; color: string; bgColor: string }
> = {
	not_ready: {
		label: msg`Needs More Practice`,
		labelFr: "Besoin de plus de pratique",
		color: "text-red-600",
		bgColor: "bg-red-50 border-red-200",
	},
	needs_practice: {
		label: msg`Making Progress`,
		labelFr: "En progression",
		color: "text-orange-600",
		bgColor: "bg-orange-50 border-orange-200",
	},
	almost_ready: {
		label: msg`Almost Ready`,
		labelFr: "Presque prêt",
		color: "text-yellow-600",
		bgColor: "bg-yellow-50 border-yellow-200",
	},
	interview_ready: {
		label: msg`Interview Ready`,
		labelFr: "Prêt pour l'entretien",
		color: "text-green-600",
		bgColor: "bg-green-50 border-green-200",
	},
};
