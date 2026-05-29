import { t } from "@lingui/core/macro";
import type { Icon } from "@phosphor-icons/react";
import {
	BookOpenIcon,
	BrainIcon,
	CodeIcon,
	CrownIcon,
	FireIcon,
	GraduationCapIcon,
	HeartIcon,
	LightningIcon,
	MedalIcon,
	RocketLaunchIcon,
	StarIcon,
	TrophyIcon,
	UsersIcon,
} from "@phosphor-icons/react";

import type { QuizBadge, QuizQuestion, SkillCategory, SkillLevel } from "./skills-quiz-types";

// Timer preference stored in localStorage (UI preference - acceptable)
export const TIMER_ENABLED_KEY = "imta-skills-quiz-timer";

function getCategoryConfig(): Record<SkillCategory, { label: string; icon: Icon; color: string; bgColor: string }> {
	return {
		technical: {
			label: t`Technical Skills`,
			icon: CodeIcon,
			color: "text-blue-600 dark:text-blue-400",
			bgColor: "bg-blue-100 dark:bg-blue-900/30",
		},
		soft_skills: {
			label: t`Soft Skills`,
			icon: UsersIcon,
			color: "text-purple-600 dark:text-purple-400",
			bgColor: "bg-purple-100 dark:bg-purple-900/30",
		},
		leadership: {
			label: t`Leadership`,
			icon: CrownIcon,
			color: "text-amber-600 dark:text-amber-400",
			bgColor: "bg-amber-100 dark:bg-amber-900/30",
		},
	};
}

export const CATEGORY_CONFIG: Record<SkillCategory, { label: string; icon: Icon; color: string; bgColor: string }> =
	new Proxy({} as Record<SkillCategory, { label: string; icon: Icon; color: string; bgColor: string }>, {
		get(_target, prop: string) {
			return getCategoryConfig()[prop as SkillCategory];
		},
		ownKeys() {
			return Object.keys(getCategoryConfig());
		},
		getOwnPropertyDescriptor(_target, prop) {
			const data = getCategoryConfig();
			if (prop in data) {
				return { configurable: true, enumerable: true, value: data[prop as SkillCategory] };
			}
			return undefined;
		},
	});

function getLevelConfig(): Record<SkillLevel, { label: string; minScore: number; color: string; icon: Icon }> {
	return {
		beginner: {
			label: t`Beginner`,
			minScore: 0,
			color: "text-gray-600 dark:text-gray-400",
			icon: BookOpenIcon,
		},
		intermediate: {
			label: t`Intermediate`,
			minScore: 40,
			color: "text-blue-600 dark:text-blue-400",
			icon: GraduationCapIcon,
		},
		advanced: {
			label: t`Advanced`,
			minScore: 70,
			color: "text-purple-600 dark:text-purple-400",
			icon: RocketLaunchIcon,
		},
		expert: {
			label: t`Expert`,
			minScore: 90,
			color: "text-amber-600 dark:text-amber-400",
			icon: CrownIcon,
		},
	};
}

export const LEVEL_CONFIG: Record<SkillLevel, { label: string; minScore: number; color: string; icon: Icon }> =
	new Proxy({} as Record<SkillLevel, { label: string; minScore: number; color: string; icon: Icon }>, {
		get(_target, prop: string) {
			return getLevelConfig()[prop as SkillLevel];
		},
		ownKeys() {
			return Object.keys(getLevelConfig());
		},
		getOwnPropertyDescriptor(_target, prop) {
			const data = getLevelConfig();
			if (prop in data) {
				return { configurable: true, enumerable: true, value: data[prop as SkillLevel] };
			}
			return undefined;
		},
	});

// =============================================================================
// MOCK QUESTIONS
// =============================================================================

export const TECHNICAL_QUESTIONS: QuizQuestion[] = [
	{
		id: "tech-1",
		question: "Quelle est la meilleure pratique pour la gestion des erreurs dans un code professionnel?",
		category: "technical",
		skill: "Programmation",
		difficulty: 2,
		timeLimit: 45,
		explanation:
			"La gestion des exceptions avec des messages clairs permet de deboguer plus facilement et d'ameliorer la maintenance du code.",
		options: [
			{ id: "tech-1-a", text: "Ignorer les erreurs pour eviter les crashes", isCorrect: false },
			{ id: "tech-1-b", text: "Utiliser des blocs try-catch avec des messages d'erreur descriptifs", isCorrect: true },
			{ id: "tech-1-c", text: "Afficher toutes les erreurs a l'utilisateur final", isCorrect: false },
			{ id: "tech-1-d", text: "Utiliser des codes d'erreur numeriques sans description", isCorrect: false },
		],
	},
	{
		id: "tech-2",
		question:
			"Quel principe de conception logicielle recommande qu'une classe ne devrait avoir qu'une seule raison de changer?",
		category: "technical",
		skill: "Architecture",
		difficulty: 3,
		timeLimit: 45,
		explanation:
			"Le principe de responsabilite unique (SRP) est le 'S' de SOLID et favorise la maintenabilite du code.",
		options: [
			{ id: "tech-2-a", text: "Principe d'ouverture/fermeture", isCorrect: false },
			{ id: "tech-2-b", text: "Principe de substitution de Liskov", isCorrect: false },
			{ id: "tech-2-c", text: "Principe de responsabilite unique", isCorrect: true },
			{ id: "tech-2-d", text: "Principe d'inversion de dependance", isCorrect: false },
		],
	},
	{
		id: "tech-3",
		question: "Quelle commande Git permet de fusionner les modifications d'une branche dans une autre?",
		category: "technical",
		skill: "Git",
		difficulty: 1,
		timeLimit: 30,
		explanation: "git merge integre les changements d'une branche source dans la branche courante.",
		options: [
			{ id: "tech-3-a", text: "git push", isCorrect: false },
			{ id: "tech-3-b", text: "git merge", isCorrect: true },
			{ id: "tech-3-c", text: "git pull", isCorrect: false },
			{ id: "tech-3-d", text: "git fetch", isCorrect: false },
		],
	},
	{
		id: "tech-4",
		question: "Quelle est la complexite temporelle d'une recherche binaire dans un tableau trie?",
		category: "technical",
		skill: "Algorithmes",
		difficulty: 4,
		timeLimit: 60,
		explanation: "La recherche binaire divise l'espace de recherche par deux a chaque iteration, d'ou O(log n).",
		options: [
			{ id: "tech-4-a", text: "O(n)", isCorrect: false },
			{ id: "tech-4-b", text: "O(n^2)", isCorrect: false },
			{ id: "tech-4-c", text: "O(log n)", isCorrect: true },
			{ id: "tech-4-d", text: "O(1)", isCorrect: false },
		],
	},
	{
		id: "tech-5",
		question: "Quel protocole est utilise pour securiser les communications sur le web?",
		category: "technical",
		skill: "Securite",
		difficulty: 2,
		timeLimit: 30,
		explanation: "HTTPS utilise TLS/SSL pour chiffrer les communications entre le client et le serveur.",
		options: [
			{ id: "tech-5-a", text: "HTTP", isCorrect: false },
			{ id: "tech-5-b", text: "FTP", isCorrect: false },
			{ id: "tech-5-c", text: "HTTPS", isCorrect: true },
			{ id: "tech-5-d", text: "SMTP", isCorrect: false },
		],
	},
	{
		id: "tech-6",
		question: "Quelle est la difference principale entre SQL et NoSQL?",
		category: "technical",
		skill: "Bases de donnees",
		difficulty: 3,
		timeLimit: 45,
		explanation:
			"SQL utilise des schemas fixes et des relations, tandis que NoSQL offre plus de flexibilite dans la structure des donnees.",
		options: [
			{ id: "tech-6-a", text: "SQL est plus rapide que NoSQL", isCorrect: false },
			{ id: "tech-6-b", text: "NoSQL ne peut pas stocker de donnees", isCorrect: false },
			{ id: "tech-6-c", text: "SQL utilise des schemas structures, NoSQL est plus flexible", isCorrect: true },
			{ id: "tech-6-d", text: "Il n'y a pas de difference", isCorrect: false },
		],
	},
	{
		id: "tech-7",
		question: "Qu'est-ce qu'une API RESTful?",
		category: "technical",
		skill: "API",
		difficulty: 2,
		timeLimit: 45,
		explanation: "REST (Representational State Transfer) definit des conventions pour les APIs web utilisant HTTP.",
		options: [
			{ id: "tech-7-a", text: "Une base de donnees relationnelle", isCorrect: false },
			{ id: "tech-7-b", text: "Une interface de programmation suivant les principes REST", isCorrect: true },
			{ id: "tech-7-c", text: "Un langage de programmation", isCorrect: false },
			{ id: "tech-7-d", text: "Un systeme d'exploitation", isCorrect: false },
		],
	},
	{
		id: "tech-8",
		question: "Quel pattern de conception est utilise pour creer une seule instance d'une classe?",
		category: "technical",
		skill: "Design Patterns",
		difficulty: 3,
		timeLimit: 45,
		explanation: "Le pattern Singleton garantit qu'une classe n'a qu'une seule instance accessible globalement.",
		options: [
			{ id: "tech-8-a", text: "Factory", isCorrect: false },
			{ id: "tech-8-b", text: "Observer", isCorrect: false },
			{ id: "tech-8-c", text: "Singleton", isCorrect: true },
			{ id: "tech-8-d", text: "Strategy", isCorrect: false },
		],
	},
	{
		id: "tech-9",
		question: "Quelle est la fonction principale d'un load balancer?",
		category: "technical",
		skill: "Infrastructure",
		difficulty: 3,
		timeLimit: 45,
		explanation:
			"Un load balancer distribue le trafic entre plusieurs serveurs pour optimiser les performances et la disponibilite.",
		options: [
			{ id: "tech-9-a", text: "Stocker des donnees", isCorrect: false },
			{ id: "tech-9-b", text: "Distribuer le trafic entre plusieurs serveurs", isCorrect: true },
			{ id: "tech-9-c", text: "Compiler du code", isCorrect: false },
			{ id: "tech-9-d", text: "Gerer les utilisateurs", isCorrect: false },
		],
	},
	{
		id: "tech-10",
		question: "Qu'est-ce que le principe DRY en programmation?",
		category: "technical",
		skill: "Bonnes pratiques",
		difficulty: 2,
		timeLimit: 30,
		explanation:
			"DRY (Don't Repeat Yourself) encourage a eviter la duplication de code pour ameliorer la maintenabilite.",
		options: [
			{ id: "tech-10-a", text: "Documenter tout le code", isCorrect: false },
			{ id: "tech-10-b", text: "Ne pas repeter le code", isCorrect: true },
			{ id: "tech-10-c", text: "Toujours utiliser des variables globales", isCorrect: false },
			{ id: "tech-10-d", text: "Ecrire des tests unitaires", isCorrect: false },
		],
	},
];

export const SOFT_SKILLS_QUESTIONS: QuizQuestion[] = [
	{
		id: "soft-1",
		question: "Lors d'un conflit avec un collegue, quelle est la meilleure approche initiale?",
		category: "soft_skills",
		skill: "Resolution de conflits",
		difficulty: 2,
		timeLimit: 45,
		explanation: "L'ecoute active permet de comprendre le point de vue de l'autre et de desamorcer les tensions.",
		options: [
			{ id: "soft-1-a", text: "Eviter la personne jusqu'a ce que le conflit se resolve seul", isCorrect: false },
			{ id: "soft-1-b", text: "Impliquer immediatement la direction", isCorrect: false },
			{ id: "soft-1-c", text: "Ecouter activement et chercher a comprendre son point de vue", isCorrect: true },
			{ id: "soft-1-d", text: "Defendre fermement votre position des le depart", isCorrect: false },
		],
	},
	{
		id: "soft-2",
		question: "Qu'est-ce que l'intelligence emotionnelle implique principalement?",
		category: "soft_skills",
		skill: "Intelligence emotionnelle",
		difficulty: 2,
		timeLimit: 45,
		explanation:
			"L'intelligence emotionnelle combine la conscience de soi, la gestion des emotions, l'empathie et les competences sociales.",
		options: [
			{ id: "soft-2-a", text: "Avoir un QI eleve", isCorrect: false },
			{ id: "soft-2-b", text: "Reconnaitre et gerer ses emotions et celles des autres", isCorrect: true },
			{ id: "soft-2-c", text: "Eviter les situations emotionnelles", isCorrect: false },
			{ id: "soft-2-d", text: "Toujours rester neutre", isCorrect: false },
		],
	},
	{
		id: "soft-3",
		question: "Comment donner un feedback constructif a un collegue?",
		category: "soft_skills",
		skill: "Communication",
		difficulty: 2,
		timeLimit: 45,
		explanation: "Un feedback constructif est specifique, base sur des faits, et propose des pistes d'amelioration.",
		options: [
			{ id: "soft-3-a", text: "Critiquer devant toute l'equipe pour montrer l'exemple", isCorrect: false },
			{ id: "soft-3-b", text: "Etre specifique, factuel et proposer des solutions", isCorrect: true },
			{ id: "soft-3-c", text: "Attendre l'evaluation annuelle", isCorrect: false },
			{ id: "soft-3-d", text: "Envoyer un email anonyme", isCorrect: false },
		],
	},
	{
		id: "soft-4",
		question: "Quelle technique aide a mieux gerer son temps au travail?",
		category: "soft_skills",
		skill: "Gestion du temps",
		difficulty: 1,
		timeLimit: 30,
		explanation: "La matrice d'Eisenhower aide a prioriser les taches selon leur urgence et importance.",
		options: [
			{ id: "soft-4-a", text: "Faire toutes les taches en meme temps", isCorrect: false },
			{ id: "soft-4-b", text: "Prioriser avec la matrice urgence/importance", isCorrect: true },
			{ id: "soft-4-c", text: "Toujours dire oui a toutes les demandes", isCorrect: false },
			{ id: "soft-4-d", text: "Travailler sans pause pour finir plus vite", isCorrect: false },
		],
	},
	{
		id: "soft-5",
		question: "Qu'est-ce qui caracterise une equipe performante?",
		category: "soft_skills",
		skill: "Travail d'equipe",
		difficulty: 2,
		timeLimit: 45,
		explanation:
			"Les equipes performantes ont des objectifs clairs, une communication ouverte et une confiance mutuelle.",
		options: [
			{ id: "soft-5-a", text: "Une hierarchie stricte sans remise en question", isCorrect: false },
			{ id: "soft-5-b", text: "Des objectifs clairs, communication ouverte et confiance", isCorrect: true },
			{ id: "soft-5-c", text: "Une competition interne forte", isCorrect: false },
			{ id: "soft-5-d", text: "Des reunions quotidiennes de 2 heures", isCorrect: false },
		],
	},
	{
		id: "soft-6",
		question: "Comment gerer efficacement le stress au travail?",
		category: "soft_skills",
		skill: "Gestion du stress",
		difficulty: 2,
		timeLimit: 45,
		explanation: "Une approche proactive incluant organisation, pauses et limites claires aide a gerer le stress.",
		options: [
			{ id: "soft-6-a", text: "Ignorer le stress et continuer a travailler", isCorrect: false },
			{ id: "soft-6-b", text: "Se plaindre regulierement a ses collegues", isCorrect: false },
			{ id: "soft-6-c", text: "Identifier les sources, prendre des pauses et fixer des limites", isCorrect: true },
			{ id: "soft-6-d", text: "Eviter toutes les situations stressantes", isCorrect: false },
		],
	},
	{
		id: "soft-7",
		question: "Quelle est la meilleure facon de s'adapter au changement?",
		category: "soft_skills",
		skill: "Adaptabilite",
		difficulty: 2,
		timeLimit: 45,
		explanation: "L'adaptabilite requiert ouverture d'esprit, apprentissage continu et flexibilite mentale.",
		options: [
			{ id: "soft-7-a", text: "Resister jusqu'a ce que le changement soit annule", isCorrect: false },
			{ id: "soft-7-b", text: "Accepter passivement sans comprendre", isCorrect: false },
			{ id: "soft-7-c", text: "Etre ouvert, chercher a comprendre et s'ajuster proactivement", isCorrect: true },
			{ id: "soft-7-d", text: "Attendre que les autres s'adaptent d'abord", isCorrect: false },
		],
	},
	{
		id: "soft-8",
		question: "Qu'est-ce que l'ecoute active implique?",
		category: "soft_skills",
		skill: "Communication",
		difficulty: 1,
		timeLimit: 30,
		explanation:
			"L'ecoute active demande une attention complete, de la reformulation et des questions de clarification.",
		options: [
			{ id: "soft-8-a", text: "Preparer sa reponse pendant que l'autre parle", isCorrect: false },
			{ id: "soft-8-b", text: "Etre attentif, reformuler et poser des questions", isCorrect: true },
			{ id: "soft-8-c", text: "Interrompre pour montrer son interet", isCorrect: false },
			{ id: "soft-8-d", text: "Hocher la tete sans vraiment ecouter", isCorrect: false },
		],
	},
	{
		id: "soft-9",
		question: "Comment developper sa creativite au travail?",
		category: "soft_skills",
		skill: "Creativite",
		difficulty: 3,
		timeLimit: 45,
		explanation:
			"La creativite se developpe par la curiosite, l'exposition a diverses idees et la pratique du brainstorming.",
		options: [
			{ id: "soft-9-a", text: "Suivre toujours les memes methodes eprouvees", isCorrect: false },
			{ id: "soft-9-b", text: "Etre curieux, explorer et pratiquer le brainstorming", isCorrect: true },
			{ id: "soft-9-c", text: "Attendre l'inspiration", isCorrect: false },
			{ id: "soft-9-d", text: "Copier ce que font les autres", isCorrect: false },
		],
	},
	{
		id: "soft-10",
		question: "Quelle attitude favorise l'apprentissage continu?",
		category: "soft_skills",
		skill: "Apprentissage",
		difficulty: 1,
		timeLimit: 30,
		explanation: "Une mentalite de croissance voit les defis comme des opportunites d'apprentissage.",
		options: [
			{ id: "soft-10-a", text: "Penser que les competences sont fixes", isCorrect: false },
			{ id: "soft-10-b", text: "Eviter les situations ou on pourrait echouer", isCorrect: false },
			{
				id: "soft-10-c",
				text: "Adopter une mentalite de croissance et voir les erreurs comme des opportunites",
				isCorrect: true,
			},
			{ id: "soft-10-d", text: "Se concentrer uniquement sur ses forces existantes", isCorrect: false },
		],
	},
];

export const LEADERSHIP_QUESTIONS: QuizQuestion[] = [
	{
		id: "lead-1",
		question: "Quel style de leadership est le plus adapte pour une equipe experimente et autonome?",
		category: "leadership",
		skill: "Styles de leadership",
		difficulty: 3,
		timeLimit: 45,
		explanation:
			"Le leadership delegatif fonctionne bien avec des equipes competentes qui n'ont pas besoin de supervision constante.",
		options: [
			{ id: "lead-1-a", text: "Autoritaire avec controle strict", isCorrect: false },
			{ id: "lead-1-b", text: "Delegatif avec grande autonomie", isCorrect: true },
			{ id: "lead-1-c", text: "Micromanagement detaille", isCorrect: false },
			{ id: "lead-1-d", text: "Laisser-faire total sans objectifs", isCorrect: false },
		],
	},
	{
		id: "lead-2",
		question: "Comment un leader devrait-il communiquer une vision?",
		category: "leadership",
		skill: "Vision",
		difficulty: 2,
		timeLimit: 45,
		explanation: "Une vision efficace est claire, inspirante et montre le chemin vers l'objectif commun.",
		options: [
			{ id: "lead-2-a", text: "Par email technique detaille", isCorrect: false },
			{ id: "lead-2-b", text: "De maniere claire, inspirante et en montrant le chemin", isCorrect: true },
			{ id: "lead-2-c", text: "Uniquement aux managers", isCorrect: false },
			{ id: "lead-2-d", text: "Une seule fois en debut d'annee", isCorrect: false },
		],
	},
	{
		id: "lead-3",
		question: "Qu'est-ce qui differencie un leader d'un manager?",
		category: "leadership",
		skill: "Leadership vs Management",
		difficulty: 2,
		timeLimit: 45,
		explanation: "Les leaders inspirent et transforment, les managers organisent et controlent.",
		options: [
			{ id: "lead-3-a", text: "Un leader a plus de pouvoir hierarchique", isCorrect: false },
			{ id: "lead-3-b", text: "Un leader inspire et transforme, un manager organise et controle", isCorrect: true },
			{ id: "lead-3-c", text: "Il n'y a pas de difference", isCorrect: false },
			{ id: "lead-3-d", text: "Un manager gagne plus d'argent", isCorrect: false },
		],
	},
	{
		id: "lead-4",
		question: "Comment developper les talents dans son equipe?",
		category: "leadership",
		skill: "Developpement",
		difficulty: 3,
		timeLimit: 45,
		explanation: "Le coaching, les feedbacks reguliers et les opportunites de croissance developpent les talents.",
		options: [
			{ id: "lead-4-a", text: "Assigner uniquement des taches dans leur zone de confort", isCorrect: false },
			{
				id: "lead-4-b",
				text: "Coacher, donner des feedbacks et offrir des opportunites de croissance",
				isCorrect: true,
			},
			{ id: "lead-4-c", text: "Les laisser se debrouiller seuls", isCorrect: false },
			{ id: "lead-4-d", text: "Les former uniquement via des cours en ligne", isCorrect: false },
		],
	},
	{
		id: "lead-5",
		question: "Quelle est la meilleure approche pour prendre des decisions difficiles?",
		category: "leadership",
		skill: "Prise de decision",
		difficulty: 3,
		timeLimit: 45,
		explanation: "Les bonnes decisions combinent analyse des donnees, consultation et alignement avec les valeurs.",
		options: [
			{ id: "lead-5-a", text: "Decider seul et rapidement", isCorrect: false },
			{ id: "lead-5-b", text: "Reporter indefiniment pour eviter les erreurs", isCorrect: false },
			{ id: "lead-5-c", text: "Analyser les donnees, consulter et aligner avec les valeurs", isCorrect: true },
			{ id: "lead-5-d", text: "Suivre toujours ce que fait la concurrence", isCorrect: false },
		],
	},
	{
		id: "lead-6",
		question: "Comment maintenir la motivation de son equipe sur le long terme?",
		category: "leadership",
		skill: "Motivation",
		difficulty: 3,
		timeLimit: 45,
		explanation:
			"La reconnaissance, le sens du travail et les opportunites de developpement maintiennent la motivation.",
		options: [
			{ id: "lead-6-a", text: "Augmenter les salaires regulierement", isCorrect: false },
			{ id: "lead-6-b", text: "Reconnaitre, donner du sens et offrir des opportunites", isCorrect: true },
			{ id: "lead-6-c", text: "Mettre la pression constamment", isCorrect: false },
			{ id: "lead-6-d", text: "Organiser des fetes frequentes", isCorrect: false },
		],
	},
	{
		id: "lead-7",
		question: "Qu'est-ce que le leadership serviteur?",
		category: "leadership",
		skill: "Philosophie du leadership",
		difficulty: 4,
		timeLimit: 60,
		explanation: "Le leadership serviteur met l'accent sur le service aux autres et le developpement de l'equipe.",
		options: [
			{ id: "lead-7-a", text: "Un leader qui fait tout le travail lui-meme", isCorrect: false },
			{ id: "lead-7-b", text: "Un style ou le leader sert et developpe son equipe", isCorrect: true },
			{ id: "lead-7-c", text: "Un leader qui obeit a toutes les demandes", isCorrect: false },
			{ id: "lead-7-d", text: "Un style de leadership faible", isCorrect: false },
		],
	},
	{
		id: "lead-8",
		question: "Comment gerer une crise en tant que leader?",
		category: "leadership",
		skill: "Gestion de crise",
		difficulty: 4,
		timeLimit: 60,
		explanation:
			"En crise, il faut rester calme, communiquer clairement et prendre des decisions rapides mais reflechies.",
		options: [
			{ id: "lead-8-a", text: "Paniquer pour montrer l'urgence", isCorrect: false },
			{ id: "lead-8-b", text: "Deleguer entierement et s'effacer", isCorrect: false },
			{ id: "lead-8-c", text: "Rester calme, communiquer et decider rapidement", isCorrect: true },
			{ id: "lead-8-d", text: "Attendre que la crise passe", isCorrect: false },
		],
	},
	{
		id: "lead-9",
		question: "Qu'est-ce qui caracterise un leader ethique?",
		category: "leadership",
		skill: "Ethique",
		difficulty: 2,
		timeLimit: 45,
		explanation: "Un leader ethique est integre, transparent et prend des decisions justes.",
		options: [
			{ id: "lead-9-a", text: "Maximiser les profits a tout prix", isCorrect: false },
			{ id: "lead-9-b", text: "Etre integre, transparent et juste", isCorrect: true },
			{ id: "lead-9-c", text: "Suivre les regles sans reflexion", isCorrect: false },
			{ id: "lead-9-d", text: "Satisfaire uniquement les actionnaires", isCorrect: false },
		],
	},
	{
		id: "lead-10",
		question: "Comment construire une culture d'innovation?",
		category: "leadership",
		skill: "Innovation",
		difficulty: 4,
		timeLimit: 60,
		explanation:
			"L'innovation prospere avec la securite psychologique, la tolerance a l'echec et la diversite des idees.",
		options: [
			{ id: "lead-10-a", text: "Punir les erreurs pour encourager la prudence", isCorrect: false },
			{ id: "lead-10-b", text: "Creer la securite psychologique et tolerer les echecs", isCorrect: true },
			{ id: "lead-10-c", text: "Copier les innovations des concurrents", isCorrect: false },
			{ id: "lead-10-d", text: "Avoir un departement R&D isole", isCorrect: false },
		],
	},
];

// =============================================================================
// BADGES
// =============================================================================

export const AVAILABLE_BADGES: QuizBadge[] = [
	{
		id: "first-quiz",
		name: "First Steps",
		nameFr: "Premiers Pas",
		description: "Complete your first quiz",
		icon: RocketLaunchIcon,
		condition: () => true,
		rarity: "common",
	},
	{
		id: "perfect-score",
		name: "Perfect Score",
		nameFr: "Score Parfait",
		description: "Get 100% on a quiz",
		icon: TrophyIcon,
		condition: (result) => result.score === 100,
		rarity: "rare",
	},
	{
		id: "speed-demon",
		name: "Speed Demon",
		nameFr: "Éclair",
		description: "Complete a quiz in under 3 minutes",
		icon: LightningIcon,
		condition: (result) => result.timeSpent < 180,
		rarity: "uncommon",
	},
	{
		id: "technical-master",
		name: "Technical Master",
		nameFr: "Maître Technique",
		description: "Reach Expert level in technical skills",
		icon: CodeIcon,
		condition: (result) => result.category === "technical" && result.level === "expert",
		rarity: "epic",
	},
	{
		id: "people-person",
		name: "People Person",
		nameFr: "Expert Relationnel",
		description: "Reach Expert level in soft skills",
		icon: HeartIcon,
		condition: (result) => result.category === "soft_skills" && result.level === "expert",
		rarity: "epic",
	},
	{
		id: "born-leader",
		name: "Born Leader",
		nameFr: "Leader Né",
		description: "Reach Expert level in leadership",
		icon: CrownIcon,
		condition: (result) => result.category === "leadership" && result.level === "expert",
		rarity: "epic",
	},
	{
		id: "consistent",
		name: "Consistent",
		nameFr: "Régulier",
		description: "Complete 5 quizzes total",
		icon: FireIcon,
		condition: () => false,
		rarity: "uncommon",
	},
	{
		id: "polyvalent",
		name: "Polyvalent",
		nameFr: "Polyvalent",
		description: "Complete a quiz in each category",
		icon: StarIcon,
		condition: () => false,
		rarity: "rare",
	},
	{
		id: "advanced-thinker",
		name: "Advanced Thinker",
		nameFr: "Penseur Avancé",
		description: "Score over 80% on a difficult quiz",
		icon: BrainIcon,
		condition: (result) => result.score >= 80,
		rarity: "uncommon",
	},
	{
		id: "legendary-achiever",
		name: "Legendary Achiever",
		nameFr: "Accomplissement Légendaire",
		description: "Reach Expert level in all 3 categories",
		icon: MedalIcon,
		condition: () => false,
		rarity: "legendary",
	},
];

export const RARITY_COLORS: Record<string, string> = {
	common: "border-gray-400 bg-gray-100 dark:bg-gray-800",
	uncommon: "border-green-400 bg-green-100 dark:bg-green-900/30",
	rare: "border-blue-400 bg-blue-100 dark:bg-blue-900/30",
	epic: "border-purple-400 bg-purple-100 dark:bg-purple-900/30",
	legendary:
		"border-amber-400 bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30",
};
