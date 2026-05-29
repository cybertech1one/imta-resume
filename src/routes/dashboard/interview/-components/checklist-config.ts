import { t } from "@lingui/core/macro";
import type { Icon } from "@phosphor-icons/react";
import {
	BookOpenIcon,
	ClockIcon,
	LightbulbIcon,
	ListChecksIcon,
	MoonIcon,
	NotePencilIcon,
	QuestionIcon,
	SparkleIcon,
	SunIcon,
	TShirtIcon,
	UserIcon,
} from "@phosphor-icons/react";

import type { ChecklistItem } from "./checklist-types";

export const iconMap: Record<string, Icon> = {
	BookOpenIcon,
	NotePencilIcon,
	ListChecksIcon,
	QuestionIcon,
	TShirtIcon,
	ClockIcon,
	UserIcon,
	SunIcon,
	SparkleIcon,
	MoonIcon,
	LightbulbIcon,
};

export function getFallbackPreInterviewChecklist(): ChecklistItem[] {
	return [
		{
			id: "pre-1",
			title: t`Rechercher l'entreprise`,
			description: t`Renseignez-vous sur la mission, les valeurs, l'actualite et la culture de l'entreprise.`,
			tips: [
				t`Visitez le site officiel de l'entreprise`,
				t`Consultez ses reseaux sociaux (LinkedIn, Facebook)`,
				t`Cherchez des articles de presse recents`,
				t`Notez 2-3 questions precises a poser sur l'entreprise`,
			],
			icon: BookOpenIcon,
		},
		{
			id: "pre-2",
			title: t`Relire l'offre d'emploi`,
			description: t`Analysez attentivement les compétences et qualifications demandées.`,
			tips: [
				t`Surlignez les mots-cles importants`,
				t`Préparez des exemples pour chaque compétence demandée`,
				t`Identifiez comment votre expérience correspond au poste`,
			],
			icon: NotePencilIcon,
		},
		{
			id: "pre-3",
			title: t`Preparer votre CV`,
			description: t`Assurez-vous que votre CV est a jour et adapte au poste.`,
			tips: [
				t`Imprimez plusieurs copies de votre CV`,
				t`Verifiez les fautes d'orthographe`,
				t`Adaptez-le si necessaire au poste vise`,
			],
			link: {
				text: t`Creer un CV`,
				href: "/dashboard/resumes",
			},
			icon: ListChecksIcon,
		},
		{
			id: "pre-4",
			title: t`Preparer des questions a poser`,
			description: t`Ayez une liste de questions pertinentes a poser au recruteur.`,
			tips: [
				t`A quoi ressemble une journee type ?`,
				t`Quels sont les défis actuels de l'équipe ?`,
				t`Quelles qualites recherchez-vous ?`,
				t`Quelles sont les possibilités d'évolution ?`,
			],
			link: {
				text: t`Voir les questions fréquentes`,
				href: "/dashboard/interview/questions",
			},
			icon: QuestionIcon,
		},
		{
			id: "pre-5",
			title: t`Choisir votre tenue`,
			description: t`Selectionnez une tenue professionnelle et adaptee.`,
			tips: [
				t`Choisissez des vêtements propres et repassés`,
				t`Adaptez votre tenue au secteur (sante, industrie, etc.)`,
				t`Evitez les parfums forts et les bijoux excessifs`,
				t`Préparez votre tenue la veille`,
			],
			icon: TShirtIcon,
		},
		{
			id: "pre-6",
			title: t`Verifier le trajet et l'heure`,
			description: t`Planifiez votre trajet pour arriver a l'heure.`,
			tips: [
				t`Verifiez l'adresse exacte du lieu d'entretien`,
				t`Testez le trajet a l'avance si possible`,
				t`Prevoyez du temps en plus pour les imprevus`,
				t`Notez le nom de votre personne de contact`,
			],
			icon: ClockIcon,
		},
		{
			id: "pre-7",
			title: t`Preparer vos documents`,
			description: t`Rassemblez tous les documents necessaires dans un dossier.`,
			tips: [
				t`CV (plusieurs copies)`,
				t`Lettre de motivation`,
				t`Diplomes et certificats`,
				t`Carte d'identite`,
				t`Attestations de stage`,
			],
			icon: NotePencilIcon,
		},
		{
			id: "pre-8",
			title: t`S'entraîner aux questions fréquentes`,
			description: t`Travaillez vos réponses aux questions d'entretien les plus courantes.`,
			tips: [
				t`Utilisez la méthode STAR (Situation, Tâche, Action, Résultat)`,
				t`Préparez votre présentation personnelle (2-3 minutes)`,
				t`Entrainez-vous a voix haute`,
			],
			link: {
				text: t`S'entraîner avec l'IA`,
				href: "/dashboard/interview/chatbot",
			},
			icon: UserIcon,
		},
	];
}

export const fallbackPreInterviewChecklist: ChecklistItem[] = new Proxy([] as ChecklistItem[], {
	get(_target, prop) {
		const data = getFallbackPreInterviewChecklist();
		if (prop === Symbol.iterator) return () => data[Symbol.iterator]();
		return (data as unknown as Record<string | symbol, unknown>)[prop];
	},
});

export function getFallbackDayOfChecklist(): ChecklistItem[] {
	return [
		{
			id: "day-1",
			title: t`Se réveiller tôt et se préparer`,
			description: t`Donnez-vous assez de temps pour vous préparer calmement.`,
			tips: [
				t`Réglez votre réveil avec une marge de sécurité`,
				t`Prenez une douche et soignez votre apparence`,
				t`Mettez la tenue preparee`,
			],
			icon: SunIcon,
		},
		{
			id: "day-2",
			title: t`Prendre un petit-dejeuner equilibre`,
			description: t`Mangez correctement pour avoir l'energie necessaire.`,
			tips: [t`Evitez les aliments lourds`, t`Restez bien hydrate`, t`Evitez l'exces de cafeine`],
			icon: SparkleIcon,
		},
		{
			id: "day-3",
			title: t`Verifier tous les documents`,
			description: t`Assurez-vous que tous vos documents sont prêts.`,
			tips: [
				t`Verifiez que tout est dans votre dossier`,
				t`N'oubliez pas votre telephone (pour les urgences)`,
				t`Prenez de quoi ecrire`,
			],
			icon: ListChecksIcon,
		},
		{
			id: "day-4",
			title: t`Arriver 15 minutes en avance`,
			description: t`Arrivez en avance pour vous installer et vous calmer.`,
			tips: [
				t`Utilisez ce temps pour vous detendre`,
				t`Relisez vos notes une derniere fois`,
				t`Observez l'environnement de l'entreprise`,
			],
			icon: ClockIcon,
		},
		{
			id: "day-5",
			title: t`Eteindre votre telephone`,
			description: t`Mettez votre telephone en silencieux ou eteignez-le.`,
			tips: [t`Evitez toute distraction pendant l'entretien`, t`Montrez du respect au recruteur`],
			icon: MoonIcon,
		},
		{
			id: "day-6",
			title: t`Respirer et se detendre`,
			description: t`Prenez quelques instants pour vous calmer avant l'entretien.`,
			tips: [
				t`Prenez quelques respirations profondes`,
				t`Pensez positivement`,
				t`Souriez, cela aide a vous sentir confiant`,
				t`Rappelez-vous : vous etes prepare !`,
			],
			icon: LightbulbIcon,
		},
	];
}

export const fallbackDayOfChecklist: ChecklistItem[] = new Proxy([] as ChecklistItem[], {
	get(_target, prop) {
		const data = getFallbackDayOfChecklist();
		if (prop === Symbol.iterator) return () => data[Symbol.iterator]();
		return (data as unknown as Record<string | symbol, unknown>)[prop];
	},
});
