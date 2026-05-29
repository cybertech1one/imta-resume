type InterviewTipCategory =
	| "preparation"
	| "during"
	| "after"
	| "common_questions"
	| "body_language"
	| "field_specific";

type InterviewField = "healthcare" | "industrial" | "hse" | "general";

export type InterviewTip = {
	id: string;
	title: string;
	content: string;
	category: InterviewTipCategory;
	field?: InterviewField;
};

const fallbackInterviewTips: InterviewTip[] = [
	{
		id: "prep-1",
		title: "Recherchez l'entreprise",
		content: "Renseignez-vous sur la mission, les valeurs, les services et l'actualité de l'entreprise.",
		category: "preparation",
	},
	{
		id: "prep-2",
		title: "Préparez vos documents",
		content: "Gardez votre CV, lettre, diplômes, attestations de stage et certificats dans un dossier propre.",
		category: "preparation",
	},
	{
		id: "prep-3",
		title: "Entraînez-vous aux questions courantes",
		content: "Préparez des réponses courtes avec la méthode STAR : situation, tâche, action, résultat.",
		category: "preparation",
	},
	{
		id: "prep-4",
		title: "Préparez vos exemples de stage",
		content: "Choisissez des situations concrètes qui montrent votre rigueur, votre communication et vos compétences.",
		category: "preparation",
	},
	{
		id: "prep-5",
		title: "Révisez vos compétences techniques",
		content: "Revoyez les protocoles, outils, machines, normes ou gestes professionnels liés au poste.",
		category: "preparation",
	},
	{
		id: "prep-6",
		title: "Préparez votre tenue",
		content: "Choisissez une tenue propre, sobre et adaptée au milieu de travail visé.",
		category: "preparation",
	},
	{
		id: "prep-7",
		title: "Analysez l'offre ligne par ligne",
		content: "Repérez les compétences demandées, les missions principales et les mots-clés à reprendre en entretien.",
		category: "preparation",
	},
	{
		id: "prep-8",
		title: "Préparez votre pitch de 60 secondes",
		content:
			"Résumez votre formation, votre meilleure expérience, votre force principale et votre objectif professionnel.",
		category: "preparation",
	},
	{
		id: "prep-9",
		title: "Listez vos preuves",
		content:
			"Associez chaque compétence importante à une preuve : stage, projet, module, résultat ou situation terrain.",
		category: "preparation",
	},
	{
		id: "prep-10",
		title: "Préparez vos questions au recruteur",
		content: "Ayez trois questions sur les missions, l'équipe, l'intégration, les horaires ou les attentes du poste.",
		category: "preparation",
	},
	{
		id: "prep-11",
		title: "Faites une simulation",
		content: "Répétez à voix haute avec un ami ou l'IA pour travailler le rythme, la clarté et les exemples.",
		category: "preparation",
	},
	{
		id: "prep-12",
		title: "Planifiez le trajet",
		content: "Vérifiez l'adresse, le temps de transport, le parking, le contact et une marge de sécurité.",
		category: "preparation",
	},
	{
		id: "prep-13",
		title: "Nettoyez votre présence en ligne",
		content: "Vérifiez vos profils publics et votre photo professionnelle si le recruteur cherche votre nom.",
		category: "preparation",
	},
	{
		id: "prep-14",
		title: "Préparez vos attentes",
		content: "Clarifiez vos disponibilités, salaire attendu, contraintes de transport et conditions importantes.",
		category: "preparation",
	},
	{
		id: "prep-15",
		title: "Anticipez les questions difficiles",
		content: "Préparez des réponses calmes sur les lacunes, les échecs, les retards ou le manque d'expérience.",
		category: "preparation",
	},
	{
		id: "prep-16",
		title: "Adaptez votre CV au poste",
		content: "Mettez en avant les expériences, compétences et mots-clés qui correspondent le mieux à l'offre.",
		category: "preparation",
	},
	{
		id: "prep-17",
		title: "Préparez un carnet de notes",
		content: "Notez le nom du recruteur, les points importants, vos questions et les informations à confirmer.",
		category: "preparation",
	},
	{
		id: "prep-18",
		title: "Dormez et arrivez prêt",
		content: "Préparez vos affaires la veille, évitez l'improvisation et gardez une routine simple le matin.",
		category: "preparation",
	},
	{
		id: "during-1",
		title: "Arrivez en avance",
		content: "Arrivez 10 à 15 minutes avant l'heure pour montrer votre sérieux et éviter le stress.",
		category: "during",
	},
	{
		id: "during-2",
		title: "Écoutez toute la question",
		content: "Laissez le recruteur terminer, puis demandez une précision si la question n'est pas claire.",
		category: "during",
	},
	{
		id: "during-3",
		title: "Utilisez des exemples concrets",
		content: "Appuyez chaque réponse importante avec un exemple de stage, de projet ou de formation.",
		category: "during",
	},
	{
		id: "during-4",
		title: "Montrez votre motivation",
		content: "Expliquez clairement pourquoi le poste vous intéresse et ce que vous pouvez apporter.",
		category: "during",
	},
	{
		id: "during-5",
		title: "Posez des questions utiles",
		content: "Préparez deux ou trois questions sur l'équipe, les missions, les horaires ou les attentes du poste.",
		category: "during",
	},
	{
		id: "during-6",
		title: "Restez calme sous pression",
		content: "Prenez quelques secondes pour réfléchir avant de répondre aux questions difficiles.",
		category: "during",
	},
	{
		id: "during-7",
		title: "Reformulez si nécessaire",
		content: "Avant de répondre, reformulez la question pour confirmer que vous avez bien compris.",
		category: "during",
	},
	{
		id: "during-8",
		title: "Parlez de résultats",
		content: "Quand c'est possible, ajoutez un chiffre, un délai, une amélioration ou un résultat observé.",
		category: "during",
	},
	{
		id: "during-9",
		title: "Soyez honnête sur vos limites",
		content: "Si vous ne savez pas, dites-le clairement puis expliquez comment vous chercheriez la solution.",
		category: "during",
	},
	{
		id: "during-10",
		title: "Reliez vos réponses au poste",
		content: "Terminez les réponses importantes en montrant le lien avec les missions de l'entreprise.",
		category: "during",
	},
	{
		id: "during-11",
		title: "Gardez une attitude professionnelle",
		content: "Restez positif sur vos anciens stages, formateurs et employeurs, même en parlant d'une difficulté.",
		category: "during",
	},
	{
		id: "during-12",
		title: "Terminez avec une synthèse",
		content: "À la fin, rappelez votre motivation, votre disponibilité et votre intérêt pour la prochaine étape.",
		category: "during",
	},
	{
		id: "after-1",
		title: "Envoyez un remerciement",
		content: "Envoyez un message court dans les 24 heures pour remercier et confirmer votre intérêt.",
		category: "after",
	},
	{
		id: "after-2",
		title: "Analysez votre entretien",
		content: "Notez les questions posées, vos réponses fortes et les points à améliorer.",
		category: "after",
	},
	{
		id: "after-3",
		title: "Relancez au bon moment",
		content: "Respectez le délai annoncé. Sans délai, relancez poliment après environ une semaine.",
		category: "after",
	},
	{
		id: "after-4",
		title: "Gardez les documents prêts",
		content: "Préparez les pièces demandées rapidement si le recruteur revient vers vous.",
		category: "after",
	},
	{
		id: "after-5",
		title: "Comparez l'offre avec vos objectifs",
		content: "Vérifiez les missions, horaires, conditions, apprentissages et possibilités d'évolution.",
		category: "after",
	},
	{
		id: "after-6",
		title: "Continuez à postuler",
		content: "Ne bloquez pas vos recherches tant que vous n'avez pas reçu une confirmation claire.",
		category: "after",
	},
	{
		id: "after-7",
		title: "Envoyez vite les pièces demandées",
		content: "Si l'entreprise demande un document, répondez rapidement avec un message court et professionnel.",
		category: "after",
	},
	{
		id: "after-8",
		title: "Mettez à jour votre suivi",
		content: "Notez la date, le nom du contact, le statut, la prochaine action et la date de relance.",
		category: "after",
	},
	{
		id: "after-9",
		title: "Préparez le deuxième entretien",
		content: "Relisez vos notes et approfondissez les sujets où le recruteur a montré le plus d'intérêt.",
		category: "after",
	},
	{
		id: "after-10",
		title: "Demandez un retour utile",
		content: "En cas de refus, demandez poliment un conseil pour améliorer votre prochaine candidature.",
		category: "after",
	},
	{
		id: "common-1",
		title: "Parlez-moi de vous",
		content: "Préparez une présentation de deux minutes : formation, stage, compétence forte et objectif.",
		category: "common_questions",
	},
	{
		id: "common-2",
		title: "Pourquoi ce poste ?",
		content: "Reliez vos compétences, votre formation et votre motivation aux besoins de l'entreprise.",
		category: "common_questions",
	},
	{
		id: "common-3",
		title: "Quels sont vos points forts ?",
		content: "Choisissez deux forces utiles pour le poste et prouvez-les avec des exemples.",
		category: "common_questions",
	},
	{
		id: "common-4",
		title: "Quel point voulez-vous améliorer ?",
		content: "Citez une vraie piste de progrès et montrez les actions que vous faites pour avancer.",
		category: "common_questions",
	},
	{
		id: "common-5",
		title: "Pourquoi devrions-nous vous choisir ?",
		content: "Résumez votre valeur : formation, expérience pratique, sérieux, motivation et adaptation.",
		category: "common_questions",
	},
	{
		id: "common-6",
		title: "Où vous voyez-vous dans quelques années ?",
		content: "Donnez une réponse ambitieuse mais réaliste, en lien avec le métier visé.",
		category: "common_questions",
	},
	{
		id: "common-7",
		title: "Comment gérez-vous le stress ?",
		content: "Expliquez votre méthode : prioriser, respirer, demander de l'aide et rester concentré sur la sécurité.",
		category: "common_questions",
	},
	{
		id: "common-8",
		title: "Parlez d'un conflit",
		content: "Choisissez un exemple professionnel et montrez l'écoute, le calme et la recherche de solution.",
		category: "common_questions",
	},
	{
		id: "common-9",
		title: "Donnez un exemple de travail en équipe",
		content: "Décrivez votre rôle, la coordination avec les autres et le résultat obtenu ensemble.",
		category: "common_questions",
	},
	{
		id: "common-10",
		title: "Quelle est votre disponibilité ?",
		content: "Répondez clairement sur la date de début, les horaires possibles et vos contraintes réelles.",
		category: "common_questions",
	},
	{
		id: "common-11",
		title: "Que savez-vous de notre entreprise ?",
		content: "Citez deux informations précises et expliquez pourquoi elles vous intéressent.",
		category: "common_questions",
	},
	{
		id: "common-12",
		title: "Avez-vous des questions ?",
		content: "Posez des questions sur les missions, l'équipe, l'intégration ou les critères de réussite.",
		category: "common_questions",
	},
	{
		id: "body-1",
		title: "Gardez un contact visuel naturel",
		content: "Regardez le recruteur quand vous parlez, sans fixer trop longtemps.",
		category: "body_language",
	},
	{
		id: "body-2",
		title: "Tenez-vous droit",
		content: "Une posture stable et ouverte montre votre attention et votre professionnalisme.",
		category: "body_language",
	},
	{
		id: "body-3",
		title: "Souriez naturellement",
		content: "Un sourire sincère au début et à la fin aide à créer un bon contact.",
		category: "body_language",
	},
	{
		id: "body-4",
		title: "Contrôlez vos gestes",
		content: "Gardez les mains calmes et évitez de jouer avec un stylo, un téléphone ou vos documents.",
		category: "body_language",
	},
	{
		id: "body-5",
		title: "Parlez clairement",
		content: "Utilisez un rythme calme, des phrases courtes et une voix suffisamment audible.",
		category: "body_language",
	},
	{
		id: "body-6",
		title: "Respectez l'espace du recruteur",
		content: "Adoptez une distance professionnelle et attendez l'invitation avant de vous asseoir.",
		category: "body_language",
	},
	{
		id: "body-7",
		title: "Controlez le rythme de votre voix",
		content: "Parlez assez lentement pour être compris, surtout quand vous expliquez une procédure technique.",
		category: "body_language",
	},
	{
		id: "body-8",
		title: "Soignez l'accueil",
		content: "Saluez clairement, présentez-vous avec assurance et remerciez la personne qui vous reçoit.",
		category: "body_language",
	},
	{
		id: "body-9",
		title: "Préparez l'entretien en visio",
		content: "Testez caméra, micro, lumière, arrière-plan et connexion avant l'heure du rendez-vous.",
		category: "body_language",
	},
	{
		id: "body-10",
		title: "Restez attentif jusqu'à la fin",
		content: "Gardez la même énergie pendant les questions finales, les explications et les salutations.",
		category: "body_language",
	},
	{
		id: "healthcare-1",
		title: "Mettez l'accent sur les soins aux patients",
		content: "Montrez que la sécurité, le confort et la dignité du patient sont vos priorités.",
		category: "field_specific",
		field: "healthcare",
	},
	{
		id: "healthcare-2",
		title: "Parlez d'empathie et d'écoute",
		content: "Donnez un exemple où vous avez rassuré, expliqué ou accompagné une personne.",
		category: "field_specific",
		field: "healthcare",
	},
	{
		id: "healthcare-3",
		title: "Maîtrisez les règles d'hygiène",
		content: "Soyez prêt à citer les précautions standard, le lavage des mains et les EPI.",
		category: "field_specific",
		field: "healthcare",
	},
	{
		id: "healthcare-4",
		title: "Valorisez le travail d'équipe",
		content: "Expliquez comment vous communiquez avec infirmiers, médecins, aides-soignants et familles.",
		category: "field_specific",
		field: "healthcare",
	},
	{
		id: "industrial-1",
		title: "Commencez par la sécurité",
		content: "Montrez que vous pensez aux EPI, à la consignation et à la zone de travail avant toute action.",
		category: "field_specific",
		field: "industrial",
	},
	{
		id: "industrial-2",
		title: "Expliquez votre methode de diagnostic",
		content: "Décrivez comment vous observez, testez, isolez la cause et documentez l'intervention.",
		category: "field_specific",
		field: "industrial",
	},
	{
		id: "industrial-3",
		title: "Citez les outils maîtrisés",
		content: "Mentionnez les machines, instruments de mesure, schémas et procédures que vous connaissez.",
		category: "field_specific",
		field: "industrial",
	},
	{
		id: "industrial-4",
		title: "Parlez de maintenance préventive",
		content: "Expliquez pourquoi les contrôles réguliers évitent les pannes et les arrêts de production.",
		category: "field_specific",
		field: "industrial",
	},
	{
		id: "hse-1",
		title: "Connaissez les bases réglementaires",
		content: "Préparez les notions de risque, prévention, EPI, consignes et normes utiles au poste.",
		category: "field_specific",
		field: "hse",
	},
	{
		id: "hse-2",
		title: "Structurez l'évaluation des risques",
		content: "Expliquez danger, exposition, probabilité, gravité, mesures de prévention et suivi.",
		category: "field_specific",
		field: "hse",
	},
	{
		id: "hse-3",
		title: "Insistez sur la sensibilisation",
		content: "Montrez que la sécurité dépend aussi de la formation, de la communication et des rappels terrain.",
		category: "field_specific",
		field: "hse",
	},
	{
		id: "hse-4",
		title: "Préparez les procédures d'urgence",
		content: "Soyez prêt à parler d'alerte, évacuation, point de rassemblement et rapport d'incident.",
		category: "field_specific",
		field: "hse",
	},
];

export function getFallbackInterviewTips(category?: string, field?: string): InterviewTip[] {
	let filtered = fallbackInterviewTips;

	if (field && field !== "general") {
		filtered = filtered.filter((tip) => !tip.field || tip.field === field);
	}

	if (category) {
		filtered = filtered.filter((tip) => tip.category === category);
	}

	return filtered;
}
