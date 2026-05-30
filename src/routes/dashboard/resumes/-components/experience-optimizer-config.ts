// =============================================================================
// Données statiques de l'optimiseur d'expérience
// =============================================================================

import type {
	AchievementTip,
	ActionVerb,
	BeforeAfterExample,
	BulletRefinement,
	Industry,
	IndustryOptimization,
	QuantificationSuggestion,
	VerbCategory,
} from "./experience-optimizer-types";

export const defaultBeforeAfterExamples: BeforeAfterExample[] = [
	{
		id: "1",
		before: "J'étais responsable de l'accueil des visiteurs",
		after:
			"Accueilli et orienté 40+ visiteurs par jour avec un suivi rigoureux des demandes, améliorant la satisfaction à l'accueil de 20 %",
		improvement: "Ajout d'un volume, d'un résultat et d'un verbe d'action clair",
		category: "communication",
	},
	{
		id: "2",
		before: "J'ai travaillé sur des dossiers administratifs",
		after:
			"Classé et vérifié 120 dossiers administratifs en 3 semaines, réduisant les erreurs de saisie et accélérant le traitement des demandes",
		improvement: "Mission transformée en résultat mesurable",
		category: "technical",
	},
	{
		id: "3",
		before: "J'aidais l'équipe pendant mon stage",
		after:
			"Appuyé une équipe de 6 personnes pendant un stage de 2 mois en préparant les documents, tableaux de suivi et comptes rendus hebdomadaires",
		improvement: "Contexte, durée et contribution concrète ajoutés",
		category: "leadership",
	},
	{
		id: "4",
		before: "Je répondais aux clients",
		after:
			"Répondu à 25+ demandes clients par jour par téléphone et email, avec un suivi précis jusqu'à résolution et une meilleure qualité de service",
		improvement: "Volume quotidien et impact client rendus visibles",
		category: "communication",
	},
	{
		id: "5",
		before: "J'ai participé à l'amélioration d'un processus",
		after:
			"Proposé une nouvelle fiche de contrôle réduisant les oublis lors des vérifications et faisant gagner 30 minutes par journée de travail",
		improvement: "Action personnelle et gain de temps clarifiés",
		category: "technical",
	},
	{
		id: "6",
		before: "Je formais les nouveaux arrivants",
		after:
			"Accompagné 5 nouveaux stagiaires sur les outils internes, les procédures et les bonnes pratiques, réduisant leur temps d'adaptation d'une semaine",
		improvement: "Nombre de personnes formées et résultat concret ajoutés",
		category: "leadership",
	},
];

export const actionVerbsByCategory: Record<VerbCategory, ActionVerb[]> = {
	leadership: [
		{
			verb: "Coordonné",
			description: "Organiser le travail de plusieurs personnes ou étapes",
			example: "Coordonné une équipe de 4 stagiaires sur un projet de fin de formation",
		},
		{
			verb: "Supervisé",
			description: "Assurer le suivi et la qualité d'une activité",
			example: "Supervisé les contrôles quotidiens d'un atelier pendant 6 semaines",
		},
		{
			verb: "Organisé",
			description: "Préparer, planifier et structurer une action",
			example: "Organisé le planning de rendez-vous pour 80 candidats",
		},
		{
			verb: "Piloté",
			description: "Conduire une initiative avec des objectifs précis",
			example: "Piloté une action d'amélioration réduisant les retards de traitement de 18 %",
		},
		{
			verb: "Mobilisé",
			description: "Faire avancer un groupe autour d'un objectif commun",
			example: "Mobilisé 12 étudiants pour préparer une journée portes ouvertes",
		},
		{
			verb: "Encadré",
			description: "Guider une personne ou un petit groupe",
			example: "Encadré 3 nouveaux membres sur les procédures de sécurité",
		},
		{
			verb: "Formé",
			description: "Transmettre une méthode ou une compétence",
			example: "Formé 10 utilisateurs à un nouvel outil de suivi",
		},
		{
			verb: "Accompagné",
			description: "Aider quelqu'un à progresser dans une tâche",
			example: "Accompagné des apprenants dans la préparation de leurs dossiers de stage",
		},
	],
	technical: [
		{
			verb: "Développé",
			description: "Créer une solution, un document ou un outil",
			example: "Développé un tableau de suivi automatisé pour 150 dossiers",
		},
		{
			verb: "Mis en place",
			description: "Installer ou lancer une méthode opérationnelle",
			example: "Mis en place une checklist réduisant les oublis de contrôle de 30 %",
		},
		{
			verb: "Amélioré",
			description: "Rendre un processus plus fiable ou plus rapide",
			example: "Amélioré le classement des dossiers, divisant le temps de recherche par deux",
		},
		{
			verb: "Automatisé",
			description: "Réduire les tâches répétitives avec un outil",
			example: "Automatisé la consolidation de données hebdomadaires dans Excel",
		},
		{
			verb: "Configuré",
			description: "Paramétrer correctement un outil ou un équipement",
			example: "Configuré 25 postes de travail et comptes utilisateurs",
		},
		{
			verb: "Déployé",
			description: "Mettre une solution à disposition des utilisateurs",
			example: "Déployé une procédure de suivi qualité dans 3 services",
		},
		{
			verb: "Intégré",
			description: "Connecter des informations, outils ou équipes",
			example: "Intégré les retours clients dans un tableau de priorisation",
		},
		{
			verb: "Diagnostiqué",
			description: "Identifier une cause ou une panne",
			example: "Diagnostiqué 40 incidents techniques et documenté les solutions",
		},
	],
	communication: [
		{
			verb: "Négocié",
			description: "Obtenir un accord ou une solution acceptable",
			example: "Négocié des délais fournisseurs plus courts pour 3 commandes urgentes",
		},
		{
			verb: "Présenté",
			description: "Expliquer clairement une idée ou un résultat",
			example: "Présenté les résultats d'un projet devant 30 étudiants et formateurs",
		},
		{
			verb: "Conseillé",
			description: "Orienter un client, patient, apprenant ou collègue",
			example: "Conseillé 20+ clients par jour sur les documents à fournir",
		},
		{
			verb: "Collaboré",
			description: "Travailler efficacement avec d'autres personnes",
			example: "Collaboré avec 4 services pour finaliser un dossier commun",
		},
		{
			verb: "Rédigé",
			description: "Produire un document clair et utile",
			example: "Rédigé 15 comptes rendus et procédures internes",
		},
		{
			verb: "Animé",
			description: "Conduire une réunion, formation ou atelier",
			example: "Animé un atelier CV pour 25 étudiants en recherche de stage",
		},
		{
			verb: "Sensibilisé",
			description: "Faire comprendre un risque, une règle ou une bonne pratique",
			example: "Sensibilisé une équipe aux consignes HSE avant intervention",
		},
		{
			verb: "Résolu",
			description: "Traiter une demande ou un problème jusqu'à sa solution",
			example: "Résolu 90 % des demandes de premier niveau sans escalade",
		},
	],
};

export const quantificationSuggestions: QuantificationSuggestion[] = [
	{
		metric: "Pourcentages",
		example: "+25 % de productivité, -15 % d'erreurs, 95 % de satisfaction",
		tip: "Utilise les pourcentages pour montrer une progression visible.",
	},
	{
		metric: "Montants",
		example: "Budget de 20 000 MAD, économie de 5 000 MAD, panier moyen de 350 MAD",
		tip: "Quand c'est pertinent, indique l'impact financier ou le budget suivi.",
	},
	{
		metric: "Volumes",
		example: "80 dossiers, 30 clients/jour, 12 projets, 250 produits contrôlés",
		tip: "Les volumes aident le recruteur à comprendre la taille réelle de ton travail.",
	},
	{
		metric: "Délais",
		example: "Livré 1 semaine en avance, délai réduit de 3 jours, traitement en 24 h",
		tip: "Les délais montrent ton efficacité et ta capacité à respecter les priorités.",
	},
	{
		metric: "Taux",
		example: "Taux de conformité de 98 %, absentéisme réduit de 10 %, NPS de 72",
		tip: "Les taux sont utiles pour la qualité, la satisfaction et la performance.",
	},
	{
		metric: "Classements",
		example: "Top 10 de la promotion, meilleur score qualité du mois, 2e équipe",
		tip: "Un classement crédible peut renforcer ton niveau par rapport à un groupe.",
	},
];

export const bulletRefinementExamples: BulletRefinement[] = [
	{
		original: "Responsable de la gestion des ventes",
		refined:
			"Suivi 35 prospects B2B et préparé les devis commerciaux, contribuant à 120 000 MAD de nouvelles opportunités en 2 mois",
		changes: ["Verbe d'action", "Volume précis", "Contexte B2B", "Impact commercial"],
	},
	{
		original: "Participation aux réunions d'équipe",
		refined:
			"Préparé les comptes rendus de réunions hebdomadaires pour 12 participants, clarifiant les actions à suivre et réduisant les relances",
		changes: ["Rôle actif", "Nombre de participants", "Résultat opérationnel"],
	},
	{
		original: "Travail sur l'amélioration qualité",
		refined:
			"Mis en place une fiche de contrôle qualité réduisant les non-conformités de 5 % à 1,2 % sur une période de 6 semaines",
		changes: ["Méthode précise", "Avant/après chiffré", "Durée indiquée"],
	},
];

export const achievementTips: AchievementTip[] = [
	{
		id: "1",
		title: "Utilise la méthode CAR",
		description: "Contexte - Action - Résultat : explique la situation, ce que tu as fait, puis le résultat obtenu.",
		example:
			"Face à un retard dans le traitement des dossiers, j'ai créé un tableau de suivi partagé, réduisant les délais de 4 à 2 jours.",
	},
	{
		id: "2",
		title: "Ajoute un chiffre dès que possible",
		description: "Un bon CV indique au moins un volume, un délai, un pourcentage, un budget ou une fréquence.",
		example:
			"Transforme 'J'ai amélioré le classement' en 'Classé 150 dossiers et réduit le temps de recherche de 50 %'.",
	},
	{
		id: "3",
		title: "Montre l'impact métier",
		description:
			"Relie ton action à ce qui intéresse l'employeur : qualité, rapidité, satisfaction, sécurité ou ventes.",
		example:
			"Au lieu de 'Gestion de projet', écris 'Suivi 8 tâches projet et livré le reporting hebdomadaire sans retard'.",
	},
	{
		id: "4",
		title: "Évite la simple liste de missions",
		description: "Ne décris pas seulement ce qu'on t'a demandé. Montre ce que tu as réellement produit.",
		example:
			"Remplace 'Répondre aux clients' par 'Répondu à 25+ demandes clients/jour avec un suivi jusqu'à résolution'.",
	},
	{
		id: "5",
		title: "Varie les verbes d'action",
		description: "Commence chaque puce par un verbe différent pour éviter un CV répétitif.",
		example: "Alterne entre : coordonné, préparé, analysé, amélioré, conseillé, suivi, organisé.",
	},
	{
		id: "6",
		title: "Reste précis et honnête",
		description: "Évite les mots vagues comme 'plusieurs', 'beaucoup' ou 'divers'. Donne un détail vérifiable.",
		example: "Au lieu de 'Gestion de plusieurs dossiers', écris 'Suivi 60 dossiers administratifs sur 4 semaines'.",
	},
];

export const industryOptimizations: Record<Industry, IndustryOptimization> = {
	technology: {
		industry: "Technologie / IT",
		keywords: [
			"Support IT",
			"Réseaux",
			"Helpdesk",
			"Excel avancé",
			"API",
			"Base de données",
			"Cloud",
			"Cybersécurité",
			"Maintenance",
			"Automatisation",
		],
		phrases: [
			"Profil technique orienté résolution de problèmes et support utilisateur",
			"Capable de documenter, diagnostiquer et améliorer les processus IT",
			"À l'aise avec les outils numériques, la donnée et les environnements collaboratifs",
			"Motivé par l'automatisation, la fiabilité et l'amélioration continue",
		],
		tips: [
			"Mentionne les outils, langages, systèmes ou logiciels utilisés.",
			"Quantifie les tickets, incidents, postes configurés ou utilisateurs accompagnés.",
			"Ajoute les méthodes connues : Agile, Scrum, Kanban, support N1/N2.",
			"Valorise les projets de migration, maintenance, documentation ou automatisation.",
		],
	},
	healthcare: {
		industry: "Santé / Médical",
		keywords: [
			"Soins",
			"Hygiène",
			"Dossier patient",
			"Accueil patient",
			"Prise de constantes",
			"Stérilisation",
			"Confidentialité",
			"Traçabilité",
			"Prévention",
			"Éducation sanitaire",
		],
		phrases: [
			"Profil attentif à la qualité des soins, à l'hygiène et à la sécurité du patient",
			"Capable de suivre les protocoles et de communiquer avec calme en environnement sensible",
			"Orienté accueil, écoute et accompagnement des patients et familles",
			"Sérieux dans la traçabilité, la confidentialité et le respect des procédures",
		],
		tips: [
			"Utilise les termes professionnels exacts appris en formation ou en stage.",
			"Mets en avant l'hygiène, la sécurité, la confidentialité et la qualité de prise en charge.",
			"Quantifie les patients accompagnés, dossiers suivis ou actes observés quand c'est autorisé.",
			"Ne donne jamais d'information sensible sur un patient ou un établissement.",
		],
	},
	finance: {
		industry: "Finance / Banque",
		keywords: [
			"Analyse financière",
			"Reporting",
			"Budget",
			"Rapprochement",
			"Facturation",
			"Conformité",
			"KYC",
			"Tableaux de bord",
			"Excel",
			"Contrôle",
		],
		phrases: [
			"Profil rigoureux orienté contrôle, reporting et fiabilité des données",
			"Capable d'analyser les écarts, préparer les tableaux de bord et suivre les indicateurs",
			"À l'aise avec les chiffres, les procédures et la confidentialité financière",
			"Motivé par la précision, l'organisation et l'amélioration du suivi administratif",
		],
		tips: [
			"Quantifie les montants, factures, dossiers ou tableaux suivis.",
			"Mentionne les outils maîtrisés : Excel, ERP, CRM, logiciels comptables.",
			"Valorise la rigueur, la confidentialité et le respect des procédures.",
			"Ajoute les contrôles réalisés : rapprochement, vérification, classement, reporting.",
		],
	},
	marketing: {
		industry: "Marketing / Communication",
		keywords: [
			"Réseaux sociaux",
			"Contenu",
			"Canva",
			"CRM",
			"SEO",
			"Campagne",
			"Prospection",
			"Conversion",
			"Communauté",
			"Reporting",
		],
		phrases: [
			"Profil créatif capable de produire du contenu clair et orienté résultats",
			"À l'aise avec les réseaux sociaux, la relation client et le suivi des performances",
			"Capable de transformer les retours clients en actions marketing concrètes",
			"Motivé par la croissance, l'image de marque et l'expérience utilisateur",
		],
		tips: [
			"Quantifie les vues, leads, publications, taux d'engagement ou conversions.",
			"Mentionne les plateformes et outils utilisés.",
			"Ajoute le rôle exact : création, planification, prospection, reporting ou analyse.",
			"Montre l'impact sur la visibilité, la relation client ou les ventes.",
		],
	},
	engineering: {
		industry: "Ingénierie / Industrie",
		keywords: [
			"Lean",
			"Six Sigma",
			"HSE",
			"Maintenance",
			"Qualité",
			"Production",
			"5S",
			"Contrôle",
			"Supply chain",
			"Amélioration continue",
		],
		phrases: [
			"Profil terrain orienté qualité, sécurité et amélioration continue",
			"Capable d'analyser les causes, suivre les indicateurs et proposer des actions correctives",
			"À l'aise avec les procédures, la maintenance et l'organisation industrielle",
			"Motivé par la performance opérationnelle et la sécurité des équipes",
		],
		tips: [
			"Mentionne les méthodes : 5S, Lean, Kaizen, HSE, ISO, contrôle qualité.",
			"Quantifie les pièces contrôlées, pannes traitées, gains de temps ou non-conformités.",
			"Valorise les interventions terrain et les actions de prévention.",
			"Ajoute les outils, machines ou logiciels techniques utilisés.",
		],
	},
	education: {
		industry: "Éducation / Formation",
		keywords: [
			"Pédagogie",
			"Accompagnement",
			"Évaluation",
			"E-learning",
			"Atelier",
			"Orientation",
			"Tutorat",
			"Inclusion",
			"Suivi apprenant",
			"Supports de cours",
		],
		phrases: [
			"Profil patient et structuré, orienté progression des apprenants",
			"Capable de préparer des supports clairs et d'accompagner différents niveaux",
			"À l'aise avec l'animation d'ateliers, le suivi et l'évaluation",
			"Motivé par la transmission, l'inclusion et la réussite des étudiants",
		],
		tips: [
			"Quantifie les apprenants accompagnés, ateliers animés ou supports créés.",
			"Mentionne les méthodes pédagogiques et outils numériques utilisés.",
			"Ajoute les résultats : progression, présence, satisfaction ou réussite.",
			"Valorise les partenariats, projets associatifs ou accompagnements individuels.",
		],
	},
	general: {
		industry: "Général / Multi-secteur",
		keywords: [
			"Organisation",
			"Communication",
			"Rigueur",
			"Esprit d'équipe",
			"Adaptabilité",
			"Service client",
			"Gestion de projet",
			"Analyse",
			"Initiative",
			"Fiabilité",
		],
		phrases: [
			"Profil organisé, fiable et orienté résultats concrets",
			"Capable de s'adapter rapidement à un nouvel environnement professionnel",
			"Bon communicant avec une approche sérieuse du suivi et de la qualité",
			"Motivé par l'apprentissage, la contribution d'équipe et l'amélioration continue",
		],
		tips: [
			"Adapte le vocabulaire au secteur de l'offre ou de l'entreprise.",
			"Mets en avant les compétences transférables : organisation, communication, rigueur.",
			"Ajoute au moins un chiffre pour rendre chaque expérience plus crédible.",
			"Explique ce que tu as produit, pas seulement les tâches confiées.",
		],
	},
};
