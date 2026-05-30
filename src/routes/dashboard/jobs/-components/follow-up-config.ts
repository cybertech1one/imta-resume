import {
	CheckCircleIcon,
	ClockIcon,
	EnvelopeIcon,
	EnvelopeSimpleIcon,
	HandWavingIcon,
	LightbulbIcon,
	PaperPlaneTiltIcon,
	TargetIcon,
	TimerIcon,
	XCircleIcon,
} from "@phosphor-icons/react";

import type {
	BestPracticeTip,
	EmailTemplate,
	FollowUpStatus,
	FollowUpType,
	FollowUpTypeConfigEntry,
	StatusConfigEntry,
} from "./follow-up-types";

// Status configuration
export const statusConfig: Record<FollowUpStatus, StatusConfigEntry> = {
	not_sent: {
		label: "Non envoyée",
		icon: EnvelopeSimpleIcon,
		color: "text-gray-600 dark:text-gray-400",
		bgColor: "bg-gray-100 dark:bg-gray-800/30",
	},
	sent: {
		label: "Envoyée",
		icon: PaperPlaneTiltIcon,
		color: "text-blue-600 dark:text-blue-400",
		bgColor: "bg-blue-100 dark:bg-blue-900/30",
	},
	responded: {
		label: "Réponse reçue",
		icon: CheckCircleIcon,
		color: "text-green-600 dark:text-green-400",
		bgColor: "bg-green-100 dark:bg-green-900/30",
	},
	no_response: {
		label: "Sans réponse",
		icon: XCircleIcon,
		color: "text-red-600 dark:text-red-400",
		bgColor: "bg-red-100 dark:bg-red-900/30",
	},
};

// Follow-up type configuration
export const followUpTypeConfig: Record<FollowUpType, FollowUpTypeConfigEntry> = {
	initial: {
		label: "Première relance",
		color: "bg-blue-500",
		days: 7,
	},
	second: {
		label: "Deuxième relance",
		color: "bg-amber-500",
		days: 14,
	},
	final: {
		label: "Dernière relance",
		color: "bg-red-500",
		days: 21,
	},
};

// Default email templates
export const defaultEmailTemplates: EmailTemplate[] = [
	{
		id: "initial-1",
		type: "initial",
		name: "Première relance - standard",
		subject: "Relance concernant ma candidature - [Poste]",
		body: `Bonjour [Nom du recruteur],

J'espère que vous allez bien. Je me permets de revenir vers vous au sujet de ma candidature pour le poste de [Poste], envoyée le [Date].

Je reste très intéressé par cette opportunité et serais ravi d'échanger avec vous. N'hésitez pas à me contacter si vous avez besoin d'informations complémentaires.

Merci pour votre temps et votre considération.

Cordialement,
[Votre nom]`,
	},
	{
		id: "second-1",
		type: "second",
		name: "Deuxième relance - rappel",
		subject: "Relance - candidature au poste de [Poste]",
		body: `Bonjour [Nom du recruteur],

Je me permets de vous relancer concernant ma candidature au poste de [Poste]. Je vous avais contacté la semaine dernière et souhaitais savoir si vous aviez pu l'examiner.

Je reste très motivé par cette opportunité et convaincu que mes compétences peuvent répondre aux besoins de votre équipe.

Serait-il possible d'organiser un échange téléphonique pour en discuter ?

Merci d'avance pour votre retour.

Cordialement,
[Votre nom]`,
	},
	{
		id: "final-1",
		type: "final",
		name: "Dernière relance - clôture",
		subject: "Dernière relance - candidature au poste de [Poste]",
		body: `Bonjour [Nom du recruteur],

Je me permets de vous contacter une dernière fois au sujet de ma candidature au poste de [Poste], envoyée le [Date].

Je comprends tout à fait que vous receviez de nombreuses candidatures. Si le poste est déjà pourvu ou si ma candidature n'a pas été retenue, je vous serais reconnaissant de m'en informer afin d'orienter mes recherches.

Je reste disponible si une opportunité correspondant à mon profil se présente à l'avenir.

Merci pour votre attention.

Cordialement,
[Votre nom]`,
	},
];

// Best practices tips
export const bestPracticesTips: BestPracticeTip[] = [
	{
		id: "1",
		icon: ClockIcon,
		title: "Bon timing",
		description:
			"Envoie la première relance environ 7 jours après la candidature. C'est un délai simple, professionnel et facile à suivre.",
	},
	{
		id: "2",
		icon: EnvelopeIcon,
		title: "Personnalisation",
		description:
			"Personnalise chaque message avec le nom du recruteur et un détail précis sur le poste pour montrer ton intérêt.",
	},
	{
		id: "3",
		icon: TargetIcon,
		title: "Concision",
		description: "Garde tes emails courts et directs. Trois ou quatre paragraphes suffisent.",
	},
	{
		id: "4",
		icon: LightbulbIcon,
		title: "Valeur ajoutée",
		description:
			"Ajoute un élément utile à chaque relance : projet récent, certification, disponibilité ou précision sur ton profil.",
	},
	{
		id: "5",
		icon: HandWavingIcon,
		title: "Ton professionnel",
		description: "Reste courtois et professionnel, même sans réponse. Le ton compte autant que le contenu.",
	},
	{
		id: "6",
		icon: TimerIcon,
		title: "Limite claire",
		description:
			"Ne dépasse pas trois relances. Au-delà, il vaut mieux concentrer ton énergie sur d'autres opportunités.",
	},
];
