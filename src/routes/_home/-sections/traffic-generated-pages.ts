import type { Icon } from "@phosphor-icons/react";
import {
	BriefcaseIcon,
	ChartBarIcon,
	ChatsCircleIcon,
	CheckCircleIcon,
	FileTextIcon,
	GraduationCapIcon,
	LightbulbIcon,
	MagicWandIcon,
	MapPinIcon,
	ShieldCheckIcon,
	TargetIcon,
	UsersIcon,
} from "@phosphor-icons/react";
import type { TrafficLandingPageConfig } from "./traffic-landing";

type City = {
	name: string;
	slug: string;
	context: string;
	image: string;
};

type Domain = {
	name: string;
	slug: string;
	context: string;
	image: string;
	icon: Icon;
};

const cities: City[] = [
	{
		name: "Casablanca",
		slug: "casablanca",
		context: "banques, services, industrie, commerce et grands groupes",
		image: "/home/tool-job-offers.webp",
	},
	{
		name: "Rabat",
		slug: "rabat",
		context: "administration, santé, services, éducation et projets publics",
		image: "/home/tool-career-coaching.webp",
	},
	{
		name: "Tanger",
		slug: "tanger",
		context: "industrie, automobile, logistique, port et zones franches",
		image: "/home/tool-skills-assessment.webp",
	},
	{
		name: "Kénitra",
		slug: "kenitra",
		context: "automobile, industrie, câblage, logistique et maintenance",
		image: "/home/tool-skills-assessment.webp",
	},
	{
		name: "Marrakech",
		slug: "marrakech",
		context: "tourisme, hôtellerie, commerce, santé et services",
		image: "/home/tool-job-offers.webp",
	},
	{
		name: "Fès",
		slug: "fes",
		context: "artisanat, santé, industrie légère, commerce et services",
		image: "/home/tool-cv-intelligent.webp",
	},
	{
		name: "Meknès",
		slug: "meknes",
		context: "agroalimentaire, industrie, maintenance et commerce",
		image: "/home/tool-skills-assessment.webp",
	},
	{
		name: "Agadir",
		slug: "agadir",
		context: "tourisme, agroalimentaire, commerce et services",
		image: "/home/tool-job-offers.webp",
	},
	{
		name: "Oujda",
		slug: "oujda",
		context: "services, santé, commerce, industrie et projets régionaux",
		image: "/home/tool-career-coaching.webp",
	},
	{
		name: "Tétouan",
		slug: "tetouan",
		context: "tourisme, services, commerce et métiers techniques",
		image: "/home/tool-job-offers.webp",
	},
	{
		name: "Safi",
		slug: "safi",
		context: "industrie, maintenance, procédés, sécurité et production",
		image: "/home/tool-skills-assessment.webp",
	},
	{
		name: "Settat",
		slug: "settat",
		context: "industrie, logistique, commerce et proximité Casablanca",
		image: "/home/tool-job-offers.webp",
	},
	{
		name: "Nador",
		slug: "nador",
		context: "logistique, services, commerce et projets portuaires",
		image: "/home/tool-job-offers.webp",
	},
	{
		name: "El Jadida",
		slug: "el-jadida",
		context: "industrie, port, énergie, maintenance et tourisme",
		image: "/home/tool-skills-assessment.webp",
	},
	{
		name: "Béni Mellal",
		slug: "beni-mellal",
		context: "agriculture, agroalimentaire, santé, commerce et services",
		image: "/home/tool-career-coaching.webp",
	},
	{
		name: "Mohammedia",
		slug: "mohammedia",
		context: "industrie, énergie, logistique et proximité Casablanca",
		image: "/home/tool-skills-assessment.webp",
	},
	{
		name: "Dakhla",
		slug: "dakhla",
		context: "tourisme, logistique, commerce et nouveaux projets",
		image: "/home/tool-job-offers.webp",
	},
	{
		name: "Laâyoune",
		slug: "laayoune",
		context: "services, projets régionaux, logistique et commerce",
		image: "/home/tool-career-coaching.webp",
	},
];

const domains: Domain[] = [
	{
		name: "maintenance industrielle",
		slug: "maintenance-industrielle",
		context: "machines, diagnostic, GMAO, sécurité et interventions terrain",
		image: "/home/tool-skills-assessment.webp",
		icon: ChartBarIcon,
	},
	{
		name: "HSE",
		slug: "hse",
		context: "sécurité, prévention, audits, risques et conformité",
		image: "/home/tool-career-coaching.webp",
		icon: ShieldCheckIcon,
	},
	{
		name: "santé",
		slug: "sante",
		context: "soins, hygiène, écoute patient, gestes techniques et responsabilité",
		image: "/home/tool-cv-intelligent.webp",
		icon: UsersIcon,
	},
	{
		name: "aide-soignant",
		slug: "aide-soignant",
		context: "soins de base, accompagnement patient, hygiène et observation",
		image: "/home/tool-cv-intelligent.webp",
		icon: UsersIcon,
	},
	{
		name: "infirmier",
		slug: "infirmier",
		context: "soins, protocoles, surveillance, urgence et relation patient",
		image: "/home/tool-cv-intelligent.webp",
		icon: UsersIcon,
	},
	{
		name: "BTP",
		slug: "btp",
		context: "chantier, sécurité, plans, engins, matériaux et coordination",
		image: "/home/tool-skills-assessment.webp",
		icon: BriefcaseIcon,
	},
	{
		name: "soudure",
		slug: "soudure",
		context: "procédés, lecture de plans, contrôle qualité et sécurité",
		image: "/home/tool-skills-assessment.webp",
		icon: ChartBarIcon,
	},
	{
		name: "électricité",
		slug: "electricite",
		context: "câblage, maintenance, habilitations, tableaux et diagnostic",
		image: "/home/tool-skills-assessment.webp",
		icon: MagicWandIcon,
	},
	{
		name: "mécanique",
		slug: "mecanique",
		context: "diagnostic, entretien, réparation, outillage et lecture technique",
		image: "/home/tool-skills-assessment.webp",
		icon: ChartBarIcon,
	},
	{
		name: "logistique",
		slug: "logistique",
		context: "stock, préparation, livraison, WMS, sécurité et organisation",
		image: "/home/tool-job-offers.webp",
		icon: BriefcaseIcon,
	},
	{
		name: "cariste",
		slug: "cariste",
		context: "conduite, chargement, sécurité, stockage et circulation",
		image: "/home/tool-job-offers.webp",
		icon: BriefcaseIcon,
	},
	{
		name: "informatique",
		slug: "informatique",
		context: "support, développement, réseaux, projets et résolution de problèmes",
		image: "/home/tool-interview-prep.webp",
		icon: MagicWandIcon,
	},
	{
		name: "gestion et commerce",
		slug: "gestion-commerce",
		context: "vente, relation client, gestion, facturation et communication",
		image: "/home/tool-job-offers.webp",
		icon: TargetIcon,
	},
	{
		name: "hôtellerie et tourisme",
		slug: "hotellerie-tourisme",
		context: "accueil, service, langues, réservation et expérience client",
		image: "/home/tool-job-offers.webp",
		icon: UsersIcon,
	},
	{
		name: "automobile",
		slug: "automobile",
		context: "diagnostic, production, qualité, maintenance et normes",
		image: "/home/tool-skills-assessment.webp",
		icon: ChartBarIcon,
	},
	{
		name: "agroalimentaire",
		slug: "agroalimentaire",
		context: "production, hygiène, qualité, traçabilité et sécurité",
		image: "/home/tool-skills-assessment.webp",
		icon: ShieldCheckIcon,
	},
];

const objectivePages: TrafficLandingPageConfig[] = [
	{
		path: "/cv-sans-experience",
		title: "CV sans expérience",
		seoTitle: "CV sans expérience pour étudiant | IMTA Resume",
		description:
			"Construis un CV sérieux même si tu n'as pas encore travaillé : formation, projets, stages, compétences et motivation.",
		hero: "Pas d'expérience ? Tu as quand même des choses à montrer.",
		heroTone:
			"IMTA Resume t'aide à transformer tes modules, ateliers, projets et qualités en un CV qui donne envie de te rencontrer.",
		audience: "Pour étudiants, stagiaires et jeunes diplômés",
		image: "/home/tool-cv-intelligent.webp",
		searchIntents: ["cv sans expérience", "premier cv étudiant", "quoi mettre dans un cv étudiant"],
		contentAngle: "Rassurer l'étudiant qui pense ne rien avoir à mettre dans son CV.",
		benefits: [
			{
				icon: GraduationCapIcon,
				title: "Formation utile",
				text: "Explique ce que tu apprends avec des mots concrets pour l'entreprise.",
			},
			{
				icon: LightbulbIcon,
				title: "Projets valorisés",
				text: "Présente les ateliers, mini-projets, travaux pratiques et réalisations.",
			},
			{
				icon: ShieldCheckIcon,
				title: "Profil crédible",
				text: "Montre ta motivation, tes langues, tes outils et tes qualités professionnelles.",
			},
		],
		steps: [
			{ title: "Commence par ta formation", text: "Diplôme, établissement, modules forts et compétences pratiques." },
			{ title: "Ajoute les projets", text: "Même un projet d'école peut prouver une compétence utile." },
			{ title: "Écris un profil court", text: "Dis ce que tu cherches et ce que tu peux apporter." },
			{ title: "Exporte un CV propre", text: "Un PDF lisible suffit pour commencer à postuler." },
		],
		toolLinks: [
			{ title: "CV étudiant", text: "La page complète pour créer ton premier CV.", href: "/cv-etudiant" },
			{
				title: "Lettre de motivation",
				text: "Ajoute un message clair à ta candidature.",
				href: "/lettre-motivation-stage",
			},
			{ title: "Stage au Maroc", text: "Prépare ton dossier avant de postuler.", href: "/stage-maroc" },
		],
		testimonial: {
			quote: "Je pensais que mon CV serait vide. En fait, mes projets et mes ateliers ont donné une vraie structure.",
			name: "Hajar M.",
			role: "Étudiante",
		},
		faqs: [
			{
				question: "Que mettre quand on n'a jamais travaillé ?",
				answer:
					"Formation, projets, stages d'observation, compétences techniques, langues, outils, bénévolat et motivation professionnelle.",
			},
			{
				question: "Faut-il inventer une expérience ?",
				answer: "Non. Il vaut mieux être honnête et transformer tes apprentissages en preuves concrètes.",
			},
			{
				question: "Un recruteur accepte-t-il un CV débutant ?",
				answer: "Oui, si le CV est clair, ciblé et montre ce que tu peux apprendre rapidement.",
			},
		],
	},
	{
		path: "/lettre-motivation-stage",
		title: "Lettre de motivation stage",
		seoTitle: "Lettre de motivation stage au Maroc | IMTA Resume",
		description:
			"Prépare une lettre ou un message de candidature simple pour demander un stage sans phrases génériques.",
		hero: "Écris une demande de stage qui ressemble à une vraie personne.",
		heroTone:
			"Objectif, formation, disponibilité et motivation : garde un message court, clair et adapté à l'entreprise.",
		audience: "Pour candidatures spontanées et réponses aux offres de stage",
		image: "/home/tool-ats-optimization.webp",
		searchIntents: ["lettre motivation stage", "demande de stage", "email candidature stage"],
		contentAngle: "Aider l'étudiant à écrire sans copier un modèle impersonnel.",
		benefits: [
			{
				icon: FileTextIcon,
				title: "Message clair",
				text: "Explique rapidement qui tu es, ce que tu cherches et pourquoi cette entreprise.",
			},
			{ icon: TargetIcon, title: "Ciblage entreprise", text: "Adapte la lettre selon le métier, la ville et l'offre." },
			{
				icon: CheckCircleIcon,
				title: "Ton professionnel",
				text: "Évite les phrases vides et garde une demande directe.",
			},
		],
		steps: [
			{ title: "Présente-toi", text: "Nom, formation, niveau et objectif de stage." },
			{ title: "Relie au métier", text: "Montre une compétence ou un projet lié à l'entreprise." },
			{ title: "Propose une disponibilité", text: "Dates, ville, durée et possibilité d'entretien." },
			{ title: "Ajoute ton CV", text: "Termine avec une formule simple et ton PDF." },
		],
		toolLinks: [
			{ title: "CV sans expérience", text: "Prépare le CV qui accompagne la lettre.", href: "/cv-sans-experience" },
			{ title: "Email candidature", text: "Version courte pour envoyer par mail.", href: "/email-candidature-stage" },
			{ title: "Stage au Maroc", text: "Structure ton dossier de stage.", href: "/stage-maroc" },
		],
		testimonial: {
			quote: "J'ai remplacé une lettre copiée par un message plus simple, et j'ai eu plus de réponses.",
			name: "Othmane S.",
			role: "Recherche de stage",
		},
		faqs: [
			{
				question: "La lettre doit-elle être longue ?",
				answer: "Non. Pour un stage, une page courte ou un email bien structuré suffit souvent.",
			},
			{
				question: "Que dire si je ne connais pas l'entreprise ?",
				answer: "Parle du métier, de ce que tu veux apprendre et de ce que ta formation t'apporte.",
			},
			{
				question: "Puis-je utiliser la même lettre partout ?",
				answer: "Garde une base, mais adapte au moins le métier, la ville et la raison de ta candidature.",
			},
		],
	},
	{
		path: "/email-candidature-stage",
		title: "Email candidature stage",
		seoTitle: "Email de candidature stage | IMTA Resume",
		description: "Prépare un email court et professionnel pour envoyer ton CV de stage à une entreprise.",
		hero: "Ton email doit donner envie d'ouvrir ton CV.",
		heroTone:
			"Un objet clair, un message court, une pièce jointe propre et une demande précise peuvent changer la réponse.",
		audience: "Pour envoyer une candidature spontanée ou répondre à une offre",
		image: "/home/tool-job-offers.webp",
		searchIntents: ["email candidature stage", "objet mail stage", "message pour demander un stage"],
		contentAngle: "Réduire la peur de contacter les entreprises.",
		benefits: [
			{
				icon: FileTextIcon,
				title: "Objet efficace",
				text: "Annonce le stage, le domaine et ta ville sans être vague.",
			},
			{ icon: BriefcaseIcon, title: "CV bien attaché", text: "Nom de fichier propre et PDF facile à lire." },
			{ icon: ChatsCircleIcon, title: "Demande directe", text: "Propose un échange sans écrire un roman." },
		],
		steps: [
			{ title: "Écris l'objet", text: "Exemple : Candidature stage maintenance - étudiant IMTA." },
			{ title: "Présente ton besoin", text: "Durée, dates, domaine et ville." },
			{ title: "Ajoute une preuve", text: "Une compétence, un projet ou une motivation concrète." },
			{ title: "Relis avant envoi", text: "Nom du fichier, politesse, téléphone et pièce jointe." },
		],
		toolLinks: [
			{
				title: "Lettre de motivation",
				text: "Version plus complète pour certains recruteurs.",
				href: "/lettre-motivation-stage",
			},
			{ title: "CV étudiant", text: "Prépare le PDF à joindre.", href: "/cv-etudiant" },
			{ title: "Relance candidature", text: "Relancer sans être lourd.", href: "/relance-candidature-stage" },
		],
		testimonial: {
			quote: "J'ai corrigé l'objet et le message. Les entreprises comprenaient enfin ma demande dès la première ligne.",
			name: "Salma K.",
			role: "Stage commerce",
		},
		faqs: [
			{
				question: "Quel objet mettre pour un stage ?",
				answer: "Indique candidature stage, le domaine, ton niveau et éventuellement la ville.",
			},
			{
				question: "Dois-je écrire tout mon parcours dans l'email ?",
				answer: "Non. Garde l'email court et laisse le CV présenter le détail.",
			},
			{ question: "Quand relancer ?", answer: "Après quelques jours ouvrés, avec un message poli et très court." },
		],
	},
	{
		path: "/linkedin-etudiant",
		title: "LinkedIn étudiant",
		seoTitle: "Profil LinkedIn étudiant au Maroc | IMTA Resume",
		description: "Prépare un profil LinkedIn simple pour être crédible quand une entreprise cherche ton nom.",
		hero: "Ton profil en ligne doit confirmer ce que ton CV promet.",
		heroTone:
			"Photo, titre, formation, compétences et projets : construis une présence professionnelle simple sans te survendre.",
		audience: "Pour étudiants, stagiaires et jeunes diplômés",
		image: "/home/tool-career-coaching.webp",
		searchIntents: ["linkedin étudiant", "profil linkedin stage", "titre linkedin étudiant"],
		contentAngle: "Aider l'étudiant à paraître professionnel en ligne.",
		benefits: [
			{
				icon: UsersIcon,
				title: "Profil cohérent",
				text: "Aligne ton titre LinkedIn avec ton CV et ton objectif de stage.",
			},
			{
				icon: TargetIcon,
				title: "Meilleure visibilité",
				text: "Utilise les bons mots-clés métier, ville et compétences.",
			},
			{
				icon: ShieldCheckIcon,
				title: "Image professionnelle",
				text: "Montre une présence sérieuse quand un recruteur vérifie ton profil.",
			},
		],
		steps: [
			{ title: "Écris ton titre", text: "Étudiant en..., recherche stage..., compétences principales." },
			{ title: "Ajoute la formation", text: "École, programme, modules et projets." },
			{ title: "Montre tes compétences", text: "Outils, langues, méthodes et qualités utiles." },
			{ title: "Connecte ton CV", text: "Garde la même logique entre CV, profil et candidature." },
		],
		toolLinks: [
			{ title: "CV étudiant", text: "Aligne ton profil avec ton CV.", href: "/cv-etudiant" },
			{ title: "Pitch entretien", text: "Savoir expliquer ton profil à l'oral.", href: "/pitch-entretien" },
			{ title: "Stage au Maroc", text: "Préparer les candidatures.", href: "/stage-maroc" },
		],
		testimonial: {
			quote:
				"Mon profil était vide. Maintenant, quand j'envoie mon CV, mon LinkedIn donne la même impression professionnelle.",
			name: "Anas T.",
			role: "Étudiant informatique",
		},
		faqs: [
			{
				question: "LinkedIn est-il utile pour un étudiant ?",
				answer: "Oui, surtout pour montrer ton sérieux, suivre les entreprises et rendre ton profil vérifiable.",
			},
			{
				question: "Que mettre dans le titre LinkedIn ?",
				answer: "Ta formation, ton objectif, ton métier cible et une ou deux compétences clés.",
			},
			{
				question: "Faut-il beaucoup publier ?",
				answer: "Non. Un profil propre et cohérent est déjà une bonne première étape.",
			},
		],
	},
	{
		path: "/questions-entretien-stage",
		title: "Questions entretien stage",
		seoTitle: "Questions d'entretien de stage | IMTA Resume",
		description:
			"Prépare les questions fréquentes d'un entretien de stage et entraîne-toi avec des réponses concrètes.",
		hero: "Les questions d'entretien se préparent avant le stress.",
		heroTone:
			"Parcours, motivation, compétences, projet professionnel : prépare des réponses simples au lieu d'improviser.",
		audience: "Pour entretiens de stage, premier emploi et alternance",
		image: "/home/tool-interview-prep.webp",
		searchIntents: ["questions entretien stage", "réponse entretien stage", "présentez-vous entretien"],
		contentAngle: "Donner un plan de préparation clair avant l'entretien.",
		benefits: [
			{
				icon: ChatsCircleIcon,
				title: "Réponses prêtes",
				text: "Prépare les questions qui reviennent presque toujours.",
			},
			{
				icon: LightbulbIcon,
				title: "Exemples concrets",
				text: "Utilise tes projets et ateliers au lieu de réponses générales.",
			},
			{ icon: CheckCircleIcon, title: "Plus de calme", text: "Arrive avec une structure et des mots simples." },
		],
		steps: [
			{ title: "Prépare ton pitch", text: "Qui tu es, ta formation, ton objectif et tes points forts." },
			{ title: "Liste tes exemples", text: "Projet, stage, problème résolu, travail en équipe." },
			{ title: "Travaille les questions métier", text: "Compétences techniques et situations concrètes." },
			{ title: "Répète à voix haute", text: "Corrige les réponses trop longues ou vagues." },
		],
		toolLinks: [
			{ title: "Préparation entretien", text: "La page complète pour s'entraîner.", href: "/preparation-entretien" },
			{ title: "Pitch entretien", text: "Construire une présentation courte.", href: "/pitch-entretien" },
			{ title: "CV étudiant", text: "Aligner le CV avec ce que tu vas dire.", href: "/cv-etudiant" },
		],
		testimonial: {
			quote: "Je n'ai pas appris des phrases par cœur. J'ai préparé des exemples, et ça m'a vraiment aidé.",
			name: "Ilyas P.",
			role: "Entretien de stage",
		},
		faqs: [
			{
				question: "Quelle est la question la plus fréquente ?",
				answer: "Présentez-vous : prépare une réponse courte qui relie formation, objectif et motivation.",
			},
			{
				question: "Comment répondre si je ne sais pas ?",
				answer: "Sois honnête, explique ta méthode de réflexion et montre que tu peux apprendre.",
			},
			{
				question: "Combien de temps préparer ?",
				answer: "Une ou deux sessions sérieuses suffisent mieux qu'une improvisation le jour même.",
			},
		],
	},
	{
		path: "/pitch-entretien",
		title: "Pitch entretien étudiant",
		seoTitle: "Pitch entretien pour étudiant | IMTA Resume",
		description: "Prépare une présentation courte pour répondre à la question présentez-vous en entretien.",
		hero: "Présente-toi en 45 secondes sans réciter ton CV.",
		heroTone: "Un bon pitch relie ta formation, ton objectif, une compétence forte et ce que tu veux apprendre.",
		audience: "Pour stage, alternance, premier emploi et oral professionnel",
		image: "/home/tool-interview-prep.webp",
		searchIntents: ["présentez-vous entretien", "pitch entretien étudiant", "présentation entretien stage"],
		contentAngle: "Créer une réponse mémorisable, naturelle et professionnelle.",
		benefits: [
			{ icon: ChatsCircleIcon, title: "Début plus fort", text: "Commence l'entretien avec une réponse claire." },
			{ icon: TargetIcon, title: "Objectif visible", text: "Montre ce que tu cherches et pourquoi." },
			{
				icon: CheckCircleIcon,
				title: "Moins d'hésitation",
				text: "Tu sais quoi dire sans apprendre un texte robotique.",
			},
		],
		steps: [
			{ title: "Dis ta formation", text: "Programme, niveau et spécialité." },
			{ title: "Ajoute une compétence", text: "Choisis un point fort utile pour le stage." },
			{ title: "Relie à l'entreprise", text: "Explique pourquoi ce domaine t'intéresse." },
			{ title: "Termine par l'objectif", text: "Ce que tu veux apprendre ou apporter pendant le stage." },
		],
		toolLinks: [
			{ title: "Questions entretien", text: "Préparer les réponses suivantes.", href: "/questions-entretien-stage" },
			{ title: "Préparation entretien", text: "S'entraîner avec l'outil complet.", href: "/preparation-entretien" },
			{ title: "LinkedIn étudiant", text: "Aligner ton profil public.", href: "/linkedin-etudiant" },
		],
		testimonial: {
			quote: "Avant je parlais trop vite et trop longtemps. Le pitch m'a aidée à commencer clairement.",
			name: "Rania D.",
			role: "Étudiante santé",
		},
		faqs: [
			{
				question: "Combien de temps doit durer le pitch ?",
				answer: "Environ 30 à 60 secondes, assez court pour donner envie de poser des questions.",
			},
			{
				question: "Faut-il parler de toute ma vie ?",
				answer: "Non. Garde formation, objectif, compétence clé et motivation.",
			},
			{
				question: "Puis-je utiliser le même pitch partout ?",
				answer: "Garde une base, puis adapte le dernier point à l'entreprise ou au métier.",
			},
		],
	},
	{
		path: "/relance-candidature-stage",
		title: "Relance candidature stage",
		seoTitle: "Relancer une candidature de stage | IMTA Resume",
		description: "Prépare une relance courte et professionnelle après avoir envoyé ton CV de stage.",
		hero: "Relancer peut montrer ton sérieux si tu le fais simplement.",
		heroTone: "Un message poli, court et précis rappelle ta candidature sans mettre de pression au recruteur.",
		audience: "Pour étudiants qui ont déjà envoyé un CV ou un email de stage",
		image: "/home/tool-job-offers.webp",
		searchIntents: ["relance candidature stage", "relancer recruteur stage", "pas de réponse candidature"],
		contentAngle: "Aider l'étudiant à relancer sans peur et sans maladresse.",
		benefits: [
			{ icon: ChatsCircleIcon, title: "Ton poli", text: "Relance sans paraître impatient ou insistant." },
			{ icon: BriefcaseIcon, title: "Dossier rappelé", text: "Remets ton CV et ton objectif de stage dans le fil." },
			{
				icon: CheckCircleIcon,
				title: "Action claire",
				text: "Demande simplement si la candidature a pu être étudiée.",
			},
		],
		steps: [
			{ title: "Attends quelques jours", text: "Laisse le temps de lire la candidature." },
			{ title: "Rappelle le contexte", text: "Stage demandé, date d'envoi et nom du CV." },
			{ title: "Reste court", text: "Deux ou trois phrases suffisent." },
			{ title: "Garde une trace", text: "Note les entreprises contactées et les réponses." },
		],
		toolLinks: [
			{ title: "Email candidature", text: "Corriger le message initial.", href: "/email-candidature-stage" },
			{ title: "Stage au Maroc", text: "Préparer plus de candidatures.", href: "/stage-maroc" },
			{ title: "Préparation entretien", text: "Être prêt si l'entreprise répond.", href: "/preparation-entretien" },
		],
		testimonial: {
			quote: "J'avais peur de déranger. Avec une relance courte, j'ai obtenu une réponse et un rendez-vous.",
			name: "Mehdi A.",
			role: "Recherche stage",
		},
		faqs: [
			{
				question: "Quand relancer une candidature ?",
				answer: "Après quelques jours ouvrés, sauf si l'offre indique un délai précis.",
			},
			{
				question: "Faut-il renvoyer le CV ?",
				answer: "Tu peux le joindre à nouveau si cela aide le recruteur à retrouver le dossier.",
			},
			{
				question: "Combien de fois relancer ?",
				answer: "Une relance polie suffit souvent. Ensuite, continue à postuler ailleurs.",
			},
		],
	},
];

function cityStagePage(city: City): TrafficLandingPageConfig {
	return {
		path: `/stage-${city.slug}`,
		title: `Stage à ${city.name}`,
		seoTitle: `Trouver un stage à ${city.name} | IMTA Resume`,
		description: `Prépare ton CV, ton email de candidature et ton entretien pour chercher un stage à ${city.name}.`,
		hero: `Cherche ton stage à ${city.name} avec un dossier prêt à envoyer.`,
		heroTone: `Dans une ville orientée ${city.context}, un CV clair et ciblé aide les entreprises à comprendre ton profil rapidement.`,
		audience: `Pour étudiants qui cherchent un stage à ${city.name}`,
		image: city.image,
		searchIntents: [`stage ${city.name}`, `cv stage ${city.name}`, `candidature stage ${city.name}`],
		contentAngle: `Page locale pour étudiants qui veulent chercher un stage à ${city.name}.`,
		benefits: [
			{ icon: MapPinIcon, title: "Cible locale", text: `Adapte ton CV aux secteurs présents à ${city.name}.` },
			{
				icon: FileTextIcon,
				title: "Dossier complet",
				text: "Prépare CV, email court et disponibilité avant de contacter les entreprises.",
			},
			{
				icon: ChatsCircleIcon,
				title: "Entretien prêt",
				text: "Prépare ton pitch pour répondre vite si une entreprise t'appelle.",
			},
		],
		steps: [
			{ title: "Choisis le secteur", text: `Repère les entreprises liées à ${city.context}.` },
			{ title: "Adapte ton CV", text: "Mets en avant les modules, projets et compétences utiles." },
			{ title: "Envoie proprement", text: "Email court, CV PDF et objet clair." },
			{ title: "Prépare la réponse", text: "Disponibilités, motivation et questions d'entretien." },
		],
		toolLinks: [
			{ title: "CV étudiant", text: "Créer le CV à envoyer.", href: "/cv-etudiant" },
			{ title: "Email candidature", text: "Préparer le message de contact.", href: "/email-candidature-stage" },
			{ title: "Questions entretien", text: "Être prêt si l'entreprise répond.", href: "/questions-entretien-stage" },
		],
		testimonial: {
			quote: `J'ai mieux ciblé les entreprises de ${city.name} et mon CV était plus clair dès le premier envoi.`,
			name: "Étudiant IMTA",
			role: `Recherche stage ${city.name}`,
		},
		faqs: [
			{
				question: `Comment trouver un stage à ${city.name} ?`,
				answer: `Prépare un CV ciblé, contacte les entreprises du secteur, relance poliment et garde ton dossier à jour.`,
			},
			{
				question: "Faut-il adapter le CV à chaque ville ?",
				answer: "Oui, surtout si les secteurs dominants et les entreprises changent.",
			},
			{
				question: "Que préparer avant un appel ?",
				answer: "Ton pitch, tes disponibilités, ton objectif de stage et deux exemples de compétences.",
			},
		],
	};
}

function domainCvPage(domain: Domain): TrafficLandingPageConfig {
	return {
		path: `/cv-${domain.slug}`,
		title: `CV ${domain.name}`,
		seoTitle: `CV ${domain.name} étudiant | IMTA Resume`,
		description: `Crée un CV clair pour ${domain.name} avec les bonnes compétences, projets et preuves pratiques.`,
		hero: `Ton CV ${domain.name} doit montrer ce que tu sais faire sur le terrain.`,
		heroTone: `Mets en avant ${domain.context} avec une structure lisible pour les recruteurs et responsables de stage.`,
		audience: `Pour étudiants et jeunes diplômés en ${domain.name}`,
		image: domain.image,
		searchIntents: [`cv ${domain.name}`, `compétences ${domain.name} cv`, `stage ${domain.name}`],
		contentAngle: `Page métier pour transformer les compétences ${domain.name} en CV lisible.`,
		benefits: [
			{
				icon: domain.icon,
				title: "Compétences ciblées",
				text: `Présente les compétences ${domain.name} que l'entreprise cherche vraiment.`,
			},
			{
				icon: ShieldCheckIcon,
				title: "Preuves concrètes",
				text: "Relie chaque compétence à un atelier, projet, stage ou certification.",
			},
			{
				icon: TargetIcon,
				title: "Mots-clés utiles",
				text: "Utilise le vocabulaire métier sans remplir le CV de phrases vagues.",
			},
		],
		steps: [
			{ title: "Liste les outils", text: `Note les outils, méthodes et situations liés à ${domain.name}.` },
			{ title: "Ajoute tes preuves", text: "Projet, stage, atelier, certificat ou exercice pratique." },
			{ title: "Classe les compétences", text: "Technique, sécurité, logiciel, langues et qualités." },
			{ title: "Cible l'offre", text: "Adapte le CV à l'annonce ou au type d'entreprise." },
		],
		toolLinks: [
			{
				title: `Stage ${domain.name}`,
				text: "Préparer les candidatures dans ce domaine.",
				href: `/stage-${domain.slug}`,
			},
			{ title: `Entretien ${domain.name}`, text: "Préparer les questions métier.", href: `/entretien-${domain.slug}` },
			{
				title: "CV sans expérience",
				text: "Trouver quoi mettre même en début de parcours.",
				href: "/cv-sans-experience",
			},
		],
		testimonial: {
			quote: `J'ai arrêté d'écrire un CV trop général. Mes compétences en ${domain.name} sont devenues visibles.`,
			name: "Étudiant IMTA",
			role: domain.name,
		},
		faqs: [
			{
				question: `Quelles compétences mettre sur un CV ${domain.name} ?`,
				answer: `Commence par les compétences techniques, les outils, la sécurité, les projets, les stages et les qualités utiles au métier.`,
			},
			{
				question: "Dois-je ajouter les ateliers de formation ?",
				answer: "Oui, surtout quand tu as peu d'expérience professionnelle.",
			},
			{
				question: "Comment rendre le CV moins général ?",
				answer:
					"Utilise les mots du métier, donne des preuves et enlève les phrases qui pourraient convenir à n'importe quel poste.",
			},
		],
	};
}

function domainStagePage(domain: Domain): TrafficLandingPageConfig {
	return {
		path: `/stage-${domain.slug}`,
		title: `Stage ${domain.name}`,
		seoTitle: `Trouver un stage ${domain.name} | IMTA Resume`,
		description: `Prépare ton CV et ton message pour chercher un stage en ${domain.name}.`,
		hero: `Trouve un stage ${domain.name} avec une candidature plus claire.`,
		heroTone: `Présente ${domain.context} dans un dossier simple à comprendre pour l'entreprise.`,
		audience: `Pour étudiants en ${domain.name}`,
		image: domain.image,
		searchIntents: [`stage ${domain.name}`, `demande stage ${domain.name}`, `cv stage ${domain.name}`],
		contentAngle: "Page de stage par domaine pour rendre la candidature plus ciblée.",
		benefits: [
			{
				icon: BriefcaseIcon,
				title: "Candidature métier",
				text: `Un dossier aligné avec les missions de stage en ${domain.name}.`,
			},
			{ icon: FileTextIcon, title: "CV plus précis", text: "Des compétences et projets présentés dans le bon ordre." },
			{ icon: ChatsCircleIcon, title: "Appel préparé", text: "Un pitch clair si l'entreprise propose un entretien." },
		],
		steps: [
			{ title: "Définis le stage", text: `Missions possibles en ${domain.name}, durée et disponibilité.` },
			{ title: "Prépare le CV", text: "Compétences, projets, ateliers et outils pertinents." },
			{ title: "Écris le message", text: "Court, poli, ciblé et attaché au CV." },
			{ title: "Relance proprement", text: "Note les entreprises contactées et relance sans pression." },
		],
		toolLinks: [
			{ title: `CV ${domain.name}`, text: "Créer un CV ciblé pour ce domaine.", href: `/cv-${domain.slug}` },
			{ title: "Email candidature", text: "Préparer le message à envoyer.", href: "/email-candidature-stage" },
			{ title: "Relance candidature", text: "Relancer après l'envoi.", href: "/relance-candidature-stage" },
		],
		testimonial: {
			quote: `Mon message de stage en ${domain.name} était plus précis et plus professionnel.`,
			name: "Étudiant IMTA",
			role: `Stage ${domain.name}`,
		},
		faqs: [
			{
				question: `Comment demander un stage en ${domain.name} ?`,
				answer: "Prépare un CV ciblé, un email court, tes dates de disponibilité et un objectif clair.",
			},
			{
				question: "Que mettre si je n'ai pas encore fait de stage ?",
				answer: "Mets tes projets, ateliers, outils, modules et qualités liées au métier.",
			},
			{
				question: "Faut-il une lettre de motivation ?",
				answer: "Parfois oui. Un email propre peut suffire pour une première prise de contact.",
			},
		],
	};
}

function domainInterviewPage(domain: Domain): TrafficLandingPageConfig {
	return {
		path: `/entretien-${domain.slug}`,
		title: `Entretien ${domain.name}`,
		seoTitle: `Préparer un entretien ${domain.name} | IMTA Resume`,
		description: `Prépare les questions d'entretien pour un stage ou emploi en ${domain.name}.`,
		hero: `Réponds aux questions ${domain.name} avec des exemples concrets.`,
		heroTone: `Travaille ton pitch, tes projets et les situations liées à ${domain.context}.`,
		audience: `Pour entretiens de stage et premier emploi en ${domain.name}`,
		image: "/home/tool-interview-prep.webp",
		searchIntents: [
			`entretien ${domain.name}`,
			`questions entretien ${domain.name}`,
			`présentation stage ${domain.name}`,
		],
		contentAngle: "Page entretien métier pour préparer les questions techniques et motivationnelles.",
		benefits: [
			{
				icon: ChatsCircleIcon,
				title: "Questions métier",
				text: `Prépare les questions liées à ${domain.name}, pas seulement les questions générales.`,
			},
			{
				icon: LightbulbIcon,
				title: "Exemples préparés",
				text: "Utilise projets, stages, ateliers et situations réelles.",
			},
			{ icon: CheckCircleIcon, title: "Réponses courtes", text: "Garde une structure claire pour ne pas te perdre." },
		],
		steps: [
			{ title: "Prépare ton pitch", text: `Explique ton intérêt pour ${domain.name}.` },
			{ title: "Révise les bases", text: `Outils, sécurité, méthodes et situations liées à ${domain.context}.` },
			{ title: "Choisis trois exemples", text: "Projet, difficulté, travail d'équipe ou apprentissage." },
			{ title: "Répète à voix haute", text: "Corrige les réponses trop longues." },
		],
		toolLinks: [
			{ title: `CV ${domain.name}`, text: "Aligner le CV avec l'entretien.", href: `/cv-${domain.slug}` },
			{ title: `Stage ${domain.name}`, text: "Préparer les candidatures.", href: `/stage-${domain.slug}` },
			{ title: "Questions entretien", text: "Préparer les questions fréquentes.", href: "/questions-entretien-stage" },
		],
		testimonial: {
			quote: `J'ai préparé des exemples liés à ${domain.name}, pas seulement des réponses générales.`,
			name: "Étudiant IMTA",
			role: `Entretien ${domain.name}`,
		},
		faqs: [
			{
				question: `Quelles questions préparer pour ${domain.name} ?`,
				answer: `Ton parcours, tes outils, les règles de sécurité, un projet concret, une difficulté et ta motivation pour ce métier.`,
			},
			{
				question: "Comment parler d'un projet d'école ?",
				answer: "Décris le contexte, ton rôle, l'action réalisée et ce que tu as appris.",
			},
			{
				question: "Faut-il apprendre les réponses par cœur ?",
				answer: "Non. Prépare une structure et des exemples, puis parle naturellement.",
			},
		],
	};
}

function cityDomainStagePage(city: City, domain: Domain): TrafficLandingPageConfig {
	return {
		...domainStagePage(domain),
		path: `/stage-${domain.slug}-${city.slug}`,
		title: `Stage ${domain.name} à ${city.name}`,
		seoTitle: `Stage ${domain.name} à ${city.name} | IMTA Resume`,
		description: `Prépare une candidature ciblée pour chercher un stage ${domain.name} à ${city.name}.`,
		hero: `Cherche un stage ${domain.name} à ${city.name} avec un CV plus ciblé.`,
		heroTone: `Relie tes compétences en ${domain.name} aux besoins des entreprises de ${city.name}, notamment ${city.context}.`,
		audience: `Pour étudiants en ${domain.name} à ${city.name}`,
		searchIntents: [
			`stage ${domain.name} ${city.name}`,
			`cv stage ${domain.name} ${city.name}`,
			`candidature ${domain.name} ${city.name}`,
		],
		contentAngle: "Page locale et métier pour une intention de recherche très précise.",
		toolLinks: [
			{ title: `CV ${domain.name}`, text: "Créer un CV métier plus précis.", href: `/cv-${domain.slug}` },
			{ title: `Stage à ${city.name}`, text: "Voir la page stage locale.", href: `/stage-${city.slug}` },
			{ title: "Email candidature", text: "Préparer le message à envoyer.", href: "/email-candidature-stage" },
		],
		faqs: [
			{
				question: `Comment trouver un stage ${domain.name} à ${city.name} ?`,
				answer: `Prépare un CV ciblé, repère les entreprises liées à ${city.context}, contacte-les avec un email court et relance poliment.`,
			},
			{
				question: "Le CV doit-il mentionner la ville ?",
				answer: "Oui si ta disponibilité locale est un avantage pour l'entreprise.",
			},
			{
				question: "Comment se différencier ?",
				answer: `Donne des preuves concrètes liées à ${domain.context} et montre ta motivation pour apprendre sur le terrain.`,
			},
		],
	};
}

const priorityDomains = domains.slice(0, 10);

export const generatedTrafficLandingPages: TrafficLandingPageConfig[] = [
	...objectivePages,
	...cities.map(cityStagePage),
	...domains.map(domainCvPage),
	...domains.map(domainStagePage),
	...domains.map(domainInterviewPage),
	...cities.flatMap((city) => priorityDomains.map((domain) => cityDomainStagePage(city, domain))),
];
