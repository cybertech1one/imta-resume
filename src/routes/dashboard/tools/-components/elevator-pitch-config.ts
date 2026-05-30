import type { Icon } from "@phosphor-icons/react";
import {
	ArrowRightIcon,
	BookmarkSimpleIcon,
	BriefcaseIcon,
	ClockIcon,
	FirstAidKitIcon,
	HeartIcon,
	LightbulbIcon,
	MagnifyingGlassIcon,
	MegaphoneIcon,
	RocketLaunchIcon,
	SparkleIcon,
	SpeakerHighIcon,
	StarIcon,
	TargetIcon,
	TrendUpIcon,
	TruckIcon,
	UserIcon,
	UsersIcon,
	WrenchIcon,
} from "@phosphor-icons/react";

import type {
	ContextType,
	DeliveryTip,
	ExamplePitch,
	IndustryTemplate,
	PitchLength,
	PitchStep,
} from "./elevator-pitch-types";

const WORDS_PER_MINUTE = 150;

export const pitchLengthConfig: Record<
	PitchLength,
	{ label: string; seconds: number; words: number; description: string }
> = {
	"30s": {
		label: "30 secondes",
		seconds: 30,
		words: 75,
		description: "Pour un salon, un appel ou une première prise de contact",
	},
	"60s": {
		label: "60 secondes",
		seconds: 60,
		words: 150,
		description: "Le format le plus utile pour un entretien",
	},
	"2min": {
		label: "2 minutes",
		seconds: 120,
		words: 300,
		description: "Pour une réponse complète à « Présentez-vous »",
	},
};

export const contextConfig: Record<ContextType, { label: string; icon: Icon; description: string; color: string }> = {
	interview: {
		label: "Entretien",
		icon: BriefcaseIcon,
		description: "Clair, structuré et professionnel",
		color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
	},
	networking: {
		label: "Réseau",
		icon: UsersIcon,
		description: "Naturel, court et facile à retenir",
		color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
	},
	"cold-outreach": {
		label: "Candidature spontanée",
		icon: MegaphoneIcon,
		description: "Direct, concret et orienté demande",
		color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
	},
};

export const pitchSteps: PitchStep[] = [
	{
		id: "hook",
		title: "Accroche",
		description: "Commencez par une phrase simple qui donne envie d'écouter.",
		placeholder:
			"Ex. : Je suis étudiant en soins infirmiers et je veux contribuer à des soins plus organisés et plus humains.",
		tip: "Évitez les phrases trop longues. Dites votre objectif en une idée claire.",
		icon: TargetIcon,
	},
	{
		id: "who",
		title: "Profil",
		description: "Présentez votre formation, votre niveau et votre domaine.",
		placeholder: "Ex. : Je prépare un diplôme en maintenance industrielle à l'IMTA, avec une base solide en sécurité.",
		tip: "Le recruteur doit comprendre rapidement qui vous êtes et dans quel domaine vous cherchez.",
		icon: UserIcon,
	},
	{
		id: "what",
		title: "Compétence",
		description: "Mettez en avant une compétence utile pour le poste.",
		placeholder: "Ex. : Je suis à l'aise avec le diagnostic, la lecture de procédures et le travail en équipe.",
		tip: "Choisissez une compétence que vous pouvez expliquer avec un exemple réel.",
		icon: RocketLaunchIcon,
	},
	{
		id: "why",
		title: "Preuve",
		description: "Ajoutez un exemple concret de projet, stage, atelier ou situation.",
		placeholder:
			"Ex. : Lors d'un atelier, j'ai aidé à réduire les erreurs de contrôle en suivant une checklist claire.",
		tip: "Un bon exemple vaut mieux qu'une liste de qualités générales.",
		icon: StarIcon,
	},
	{
		id: "cta",
		title: "Demande",
		description: "Terminez avec la suite souhaitée.",
		placeholder: "Ex. : Je serais ravi d'échanger sur la façon dont je peux contribuer à votre équipe.",
		tip: "La dernière phrase doit ouvrir la conversation, pas simplement arrêter le pitch.",
		icon: ArrowRightIcon,
	},
];

export const industryTemplates: IndustryTemplate[] = [
	{
		industry: "healthcare",
		label: "Santé / Paramédical",
		icon: FirstAidKitIcon,
		color: "from-emerald-500/15 via-teal-500/10 to-transparent",
		templates: {
			"30s":
				"Je suis [Nom], étudiant en [formation santé]. Je suis motivé par la qualité des soins, l'écoute du patient et le travail rigoureux en équipe. Lors de ma formation, j'ai appris à respecter les protocoles et à rester calme dans les situations sensibles. J'aimerais contribuer à votre établissement et continuer à progresser sur le terrain.",
			"60s":
				"Bonjour, je m'appelle [Nom] et je suis étudiant en [formation santé] à l'IMTA. Ce qui me motive, c'est d'accompagner les patients avec sérieux, respect et organisation. Pendant ma formation, j'ai travaillé sur les protocoles, l'hygiène, la communication et la gestion des priorités. Je suis une personne ponctuelle, attentive et prête à apprendre rapidement. Aujourd'hui, je cherche une opportunité où je peux mettre mes compétences au service d'une équipe de soins et continuer à développer mon expérience professionnelle.",
			"2min":
				"Bonjour, je m'appelle [Nom] et je prépare une formation dans le domaine de la santé à l'IMTA. Mon objectif est de rejoindre une structure où je peux apprendre auprès de professionnels exigeants et contribuer à une prise en charge sérieuse des patients. Dans ma formation, j'ai travaillé les bases de l'hygiène, de l'organisation, de la communication avec les patients et du respect des consignes. J'ai aussi compris l'importance de la ponctualité, de la discrétion et de l'esprit d'équipe. Lors d'un projet pratique, j'ai participé à l'amélioration d'une checklist de suivi, ce qui m'a appris à être précis et méthodique. Je souhaite aujourd'hui mettre cette rigueur au service de votre établissement et progresser dans un environnement professionnel réel.",
		},
	},
	{
		industry: "technology",
		label: "Informatique / Digital",
		icon: TrendUpIcon,
		color: "from-blue-500/15 via-cyan-500/10 to-transparent",
		templates: {
			"30s":
				"Je suis [Nom], étudiant en [spécialité digitale]. J'aime transformer un besoin simple en solution claire et utile. J'ai travaillé sur [projet] où j'ai appris à organiser mon code, tester et améliorer l'expérience utilisateur. Je cherche une opportunité pour renforcer mes compétences dans une équipe sérieuse.",
			"60s":
				"Bonjour, je m'appelle [Nom] et je me forme dans le domaine [informatique/digital]. Je suis à l'aise avec [compétence 1], [compétence 2] et la résolution de problèmes. Lors d'un projet, j'ai créé [résultat concret], ce qui m'a appris à être autonome, précis et attentif aux besoins de l'utilisateur. Je cherche aujourd'hui un stage ou un premier poste où je peux contribuer à des solutions utiles tout en continuant à apprendre avec une équipe expérimentée.",
			"2min":
				"Bonjour, je m'appelle [Nom] et je suis étudiant en [spécialité digitale]. Ce qui m'intéresse dans ce domaine, c'est la possibilité de créer des outils concrets qui simplifient le travail des utilisateurs. Pendant ma formation, j'ai développé des bases en [technologies], en organisation de projet et en résolution de bugs. Mon projet le plus formateur a été [projet], où j'ai dû comprendre un besoin, proposer une solution et l'améliorer après test. Cette expérience m'a appris à communiquer, documenter mon travail et rester méthodique. Je souhaite rejoindre une entreprise où je peux apporter mon sérieux, ma curiosité et mon envie d'apprendre sur des projets réels.",
		},
	},
	{
		industry: "finance",
		label: "Commerce / Administration",
		icon: BriefcaseIcon,
		color: "from-sky-500/15 via-blue-500/10 to-transparent",
		templates: {
			"30s":
				"Je suis [Nom], étudiant en [commerce/administration]. Je suis organisé, à l'aise avec le suivi des dossiers et la relation client. Lors de ma formation, j'ai appris à travailler avec précision et à respecter les délais. Je cherche une opportunité pour contribuer à une équipe professionnelle.",
			"60s":
				"Bonjour, je m'appelle [Nom] et je me forme en [commerce/administration]. J'apprécie le contact avec les clients, l'organisation des informations et le suivi sérieux des tâches. Pendant ma formation, j'ai travaillé sur [projet ou situation], ce qui m'a appris à communiquer clairement, à vérifier les détails et à respecter les priorités. Je cherche aujourd'hui un stage ou un premier poste où je peux apporter mon sérieux et développer mon expérience.",
			"2min":
				"Bonjour, je m'appelle [Nom] et je prépare une formation en [commerce/administration]. Je suis attiré par les métiers où l'organisation, le service et la communication sont essentiels. Au cours de ma formation, j'ai appris à gérer des documents, suivre des demandes, utiliser des outils bureautiques et communiquer de manière professionnelle. Dans un projet récent, j'ai participé à [exemple], ce qui m'a montré l'importance de la précision et du respect des délais. Je suis une personne fiable, motivée et prête à apprendre. Je souhaite rejoindre une structure où je peux aider l'équipe au quotidien et progresser dans un environnement professionnel.",
		},
	},
	{
		industry: "marketing",
		label: "Communication / Vente",
		icon: MegaphoneIcon,
		color: "from-amber-500/15 via-orange-500/10 to-transparent",
		templates: {
			"30s":
				"Je suis [Nom], étudiant en [communication/vente]. J'aime comprendre les besoins des clients et présenter une solution de façon claire. Lors d'un projet, j'ai contribué à [résultat]. Je cherche une opportunité pour développer mon sens commercial et ma communication.",
			"60s":
				"Bonjour, je m'appelle [Nom] et je me forme en [communication/vente]. Ce qui me motive, c'est de créer une relation de confiance avec le client et de présenter les avantages d'une offre simplement. Pendant ma formation, j'ai travaillé sur [projet], où j'ai appris à préparer un argumentaire, écouter les besoins et adapter mon discours. Je cherche une expérience où je peux pratiquer davantage et contribuer aux objectifs de l'équipe.",
			"2min":
				"Bonjour, je m'appelle [Nom] et je suis étudiant en [communication/vente]. J'aime les métiers qui demandent de l'écoute, de la clarté et de l'énergie. Pendant ma formation, j'ai appris à préparer un argumentaire, analyser un besoin client et présenter une solution adaptée. Dans un projet, j'ai travaillé sur [exemple], ce qui m'a appris à être plus précis et plus convaincant. Je suis motivé, ponctuel et capable de travailler avec des objectifs. Je cherche une opportunité où je peux renforcer mes compétences commerciales et contribuer à une équipe orientée résultats.",
		},
	},
	{
		industry: "consulting",
		label: "HSE / Qualité",
		icon: SparkleIcon,
		color: "from-teal-500/15 via-emerald-500/10 to-transparent",
		templates: {
			"30s":
				"Je suis [Nom], étudiant en HSE/qualité. Je suis motivé par la prévention, la sécurité et l'amélioration continue. Lors de ma formation, j'ai appris à observer les risques, suivre les procédures et proposer des actions simples. Je souhaite contribuer à un environnement de travail plus sûr.",
			"60s":
				"Bonjour, je m'appelle [Nom] et je me forme en HSE/qualité. Mon objectif est d'aider les équipes à travailler dans de meilleures conditions, avec plus de sécurité et d'organisation. Pendant ma formation, j'ai appris à identifier les risques, lire des procédures, réaliser des contrôles et communiquer les consignes. Je suis rigoureux, observateur et à l'écoute. Je cherche aujourd'hui une opportunité pour appliquer ces compétences sur le terrain et continuer à apprendre auprès de professionnels.",
			"2min":
				"Bonjour, je m'appelle [Nom] et je prépare une formation en HSE/qualité. Ce domaine m'intéresse parce qu'il protège les personnes, améliore les méthodes de travail et renforce la performance de l'entreprise. Pendant ma formation, j'ai travaillé sur l'identification des risques, la lecture de procédures, les checklists de contrôle et la communication des consignes. Lors d'un exercice pratique, j'ai participé à [exemple], ce qui m'a appris à observer, noter les écarts et proposer des améliorations simples. Je suis rigoureux, ponctuel et motivé par le travail de terrain. Je souhaite rejoindre votre équipe pour contribuer à un environnement plus sûr et développer mes compétences professionnelles.",
		},
	},
	{
		industry: "education",
		label: "Logistique / Magasinage",
		icon: TruckIcon,
		color: "from-lime-500/15 via-emerald-500/10 to-transparent",
		templates: {
			"30s":
				"Je suis [Nom], étudiant en logistique. Je suis organisé, attentif aux détails et motivé par le travail de terrain. J'ai appris les bases du stockage, du suivi et de la sécurité. Je cherche une opportunité pour contribuer à une équipe fiable et efficace.",
			"60s":
				"Bonjour, je m'appelle [Nom] et je me forme en logistique/magasinage. J'aime les missions où l'organisation, la précision et la sécurité comptent. Pendant ma formation, j'ai travaillé sur le rangement, le suivi des stocks, la préparation et les consignes de sécurité. Je suis ponctuel, sérieux et capable de travailler en équipe. Je cherche une opportunité pour appliquer ces compétences dans un environnement professionnel réel.",
			"2min":
				"Bonjour, je m'appelle [Nom] et je prépare une formation en logistique/magasinage. Ce domaine m'intéresse parce qu'il demande de l'organisation, de la méthode et une bonne coordination avec les équipes. Pendant ma formation, j'ai appris les bases du stockage, de la préparation, du suivi des mouvements et du respect des consignes de sécurité. Lors d'un projet pratique, j'ai travaillé sur [exemple], ce qui m'a appris à être attentif aux détails et à vérifier chaque étape. Je suis motivé, fiable et prêt à apprendre sur le terrain. Je souhaite rejoindre une entreprise où je peux contribuer à un flux de travail clair et efficace.",
		},
	},
	{
		industry: "general",
		label: "Général",
		icon: WrenchIcon,
		color: "from-slate-500/15 via-gray-500/10 to-transparent",
		templates: {
			"30s":
				"Je suis [Nom], étudiant en [formation]. Je suis motivé par [domaine] et j'ai développé [compétence clé]. Lors de ma formation, j'ai travaillé sur [exemple concret]. Je cherche une opportunité pour apprendre, contribuer et gagner en expérience.",
			"60s":
				"Bonjour, je m'appelle [Nom] et je suis étudiant en [formation] à l'IMTA. Je m'intéresse particulièrement à [domaine] parce que [raison simple]. Pendant ma formation, j'ai développé [compétence 1] et [compétence 2], notamment à travers [exemple concret]. Je suis une personne sérieuse, ponctuelle et prête à apprendre. Aujourd'hui, je cherche une opportunité où je peux contribuer à votre équipe tout en renforçant mon expérience professionnelle.",
			"2min":
				"Bonjour, je m'appelle [Nom] et je prépare une formation en [domaine] à l'IMTA. Mon objectif est de trouver une opportunité qui me permette d'appliquer mes compétences dans un contexte professionnel réel. Pendant ma formation, j'ai développé des bases en [compétences] et j'ai travaillé sur [projet ou atelier]. Cette expérience m'a appris à être organisé, à respecter les consignes et à communiquer avec l'équipe. Je suis motivé, ponctuel et curieux d'apprendre. Ce que je peux apporter, c'est du sérieux, une bonne attitude et l'envie de progresser. J'aimerais échanger avec vous sur la façon dont je peux contribuer à votre équipe.",
		},
	},
];

export const deliveryTips: DeliveryTip[] = [
	{
		id: "pace",
		title: "Rythme",
		description: "Parlez à une vitesse régulière et laissez une courte pause après les phrases importantes.",
		icon: ClockIcon,
		category: "vocal",
	},
	{
		id: "tone",
		title: "Voix claire",
		description: "Articulez les mots clés : formation, compétence, exemple et objectif.",
		icon: SpeakerHighIcon,
		category: "vocal",
	},
	{
		id: "posture",
		title: "Posture ouverte",
		description: "Tenez-vous droit, regardez votre interlocuteur et gardez les mains calmes.",
		icon: UserIcon,
		category: "body",
	},
	{
		id: "eye-contact",
		title: "Contact visuel",
		description: "Regardez naturellement la personne sans lire votre texte mot à mot.",
		icon: MagnifyingGlassIcon,
		category: "body",
	},
	{
		id: "story",
		title: "Mini-histoire",
		description: "Structurez votre pitch : qui vous êtes, ce que vous savez faire, une preuve, puis votre demande.",
		icon: BookmarkSimpleIcon,
		category: "content",
	},
	{
		id: "specificity",
		title: "Exemple concret",
		description: "Remplacez les qualités générales par une situation vécue en atelier, stage ou projet.",
		icon: TargetIcon,
		category: "content",
	},
	{
		id: "breathe",
		title: "Respiration",
		description: "Respirez avant de commencer pour parler plus lentement et avec plus d'assurance.",
		icon: HeartIcon,
		category: "mental",
	},
	{
		id: "visualize",
		title: "Confiance",
		description: "Imaginez une conversation simple : votre objectif est d'être clair, pas parfait.",
		icon: LightbulbIcon,
		category: "mental",
	},
];

export const examplePitches: ExamplePitch[] = [
	{
		id: "healthcare-60s",
		title: "Étudiant santé",
		context: "interview",
		industry: "healthcare",
		length: "60s",
		content:
			"Bonjour, je m'appelle Sara et je suis étudiante en formation santé à l'IMTA. Ce qui me motive, c'est d'accompagner les patients avec sérieux, respect et organisation. Pendant ma formation, j'ai travaillé les protocoles, l'hygiène et la communication avec le patient. Lors d'un atelier, j'ai appris à rester calme et à suivre chaque étape avec précision. Je cherche aujourd'hui une opportunité où je peux contribuer à une équipe de soins tout en continuant à apprendre sur le terrain.",
		highlights: ["Objectif clair", "Compétences utiles", "Ton professionnel"],
	},
	{
		id: "hse-30s",
		title: "Profil HSE",
		context: "interview",
		industry: "consulting",
		length: "30s",
		content:
			"Je suis Youssef, étudiant en HSE. Je suis motivé par la prévention, la sécurité et l'amélioration continue. Pendant ma formation, j'ai appris à identifier les risques, suivre les procédures et proposer des actions simples. Je souhaite rejoindre une équipe où je peux contribuer à un environnement de travail plus sûr.",
		highlights: ["Court", "Adapté au domaine", "Demande claire"],
	},
	{
		id: "logistics-60s",
		title: "Stage logistique",
		context: "cold-outreach",
		industry: "education",
		length: "60s",
		content:
			"Bonjour, je m'appelle Imane et je me forme en logistique/magasinage. J'aime les missions où l'organisation, la précision et la sécurité comptent. J'ai travaillé sur le suivi des stocks, la préparation et le respect des consignes. Je suis ponctuelle, sérieuse et prête à apprendre rapidement. Je cherche un stage pour appliquer ces compétences dans un environnement réel. Seriez-vous disponible pour échanger sur les besoins de votre équipe ?",
		highlights: ["Concret", "Poli", "Orienté stage"],
	},
	{
		id: "industrial-60s",
		title: "Maintenance industrielle",
		context: "networking",
		industry: "general",
		length: "60s",
		content:
			"Bonjour, je suis Mehdi, étudiant en maintenance industrielle. J'aime comprendre comment fonctionne une machine, diagnostiquer une panne et appliquer une méthode claire. Pendant ma formation, j'ai travaillé sur des exercices de contrôle et de sécurité, ce qui m'a appris à être rigoureux et à vérifier chaque étape. Je cherche une première opportunité pour apprendre auprès d'une équipe expérimentée et contribuer avec sérieux.",
		highlights: ["Simple", "Technique", "Crédible"],
	},
];

export function countWords(text: string): number {
	return text.trim().split(/\s+/).filter(Boolean).length;
}

export function estimateTime(words: number): number {
	return Math.round((words / WORDS_PER_MINUTE) * 60);
}
