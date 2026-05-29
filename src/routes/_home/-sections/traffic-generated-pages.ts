import type { Icon } from "@phosphor-icons/react";
import {
	BookOpenIcon,
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

type StudentSegment = {
	name: string;
	slug: string;
	context: string;
	image: string;
};

type StudentIntent = {
	title: string;
	slug: string;
	problem: string;
	outcome: string;
	image: string;
	icon: Icon;
};

const cities: City[] = [
	{
		name: "Casablanca",
		slug: "casablanca",
		context: "banques, services, industrie, commerce et grands groupes",
		image: "/home/city-casablanca.webp",
	},
	{
		name: "Rabat",
		slug: "rabat",
		context: "administration, santé, services, éducation et projets publics",
		image: "/home/city-rabat.webp",
	},
	{
		name: "Tanger",
		slug: "tanger",
		context: "industrie, automobile, logistique, port et zones franches",
		image: "/home/city-tanger.webp",
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
		image: "/home/city-marrakech.webp",
	},
	{
		name: "Fès",
		slug: "fes",
		context: "artisanat, santé, industrie légère, commerce et services",
		image: "/home/city-fes.webp",
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
		image: "/home/city-agadir.webp",
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

const studentSegments: StudentSegment[] = [
	{
		name: "BTS / DUT",
		slug: "bts-dut",
		context: "projets pratiques, ateliers, stages courts, compétences techniques et recherche d'un premier terrain",
		image: "/home/tool-skills-assessment.webp",
	},
	{
		name: "licence / école",
		slug: "licence-ecole",
		context: "formation académique, projets, stages, mémoire, langues et premiers objectifs professionnels",
		image: "/home/tool-career-coaching.webp",
	},
	{
		name: "jeune diplômé",
		slug: "jeune-diplome",
		context: "premier emploi, stage de fin d'études, projet professionnel et compétences transférables",
		image: "/home/tool-interview-prep.webp",
	},
	{
		name: "reconversion",
		slug: "reconversion",
		context: "nouveau projet, compétences transférables, motivation et preuve d'apprentissage",
		image: "/home/public-pages-morocco-hub.webp",
	},
	{
		name: "alternance",
		slug: "alternance",
		context: "rythme école-entreprise, missions terrain, disponibilité et progression sur la durée",
		image: "/home/tool-job-offers.webp",
	},
	{
		name: "technicien spécialisé",
		slug: "technicien-specialise",
		context: "gestes métier, normes, outils, sécurité, maintenance et pratique terrain",
		image: "/home/tool-skills-assessment.webp",
	},
	{
		name: "formation professionnelle",
		slug: "formation-professionnelle",
		context: "certification, pratique, ateliers, stage obligatoire et insertion rapide",
		image: "/home/tool-cv-intelligent.webp",
	},
	{
		name: "débutant",
		slug: "debutant",
		context: "premier CV, manque d'expérience, motivation, formation et preuves simples",
		image: "/home/tool-cv-intelligent.webp",
	},
];

const studentIntents: StudentIntent[] = [
	{
		title: "Photo CV au Maroc",
		slug: "photo-cv-maroc",
		problem: "savoir si une photo aide ou pénalise une candidature",
		outcome: "choisir une photo professionnelle ou construire un CV solide sans photo",
		image: "/home/tool-cv-intelligent.webp",
		icon: FileTextIcon,
	},
	{
		title: "Objet mail de stage",
		slug: "objet-mail-stage",
		problem: "écrire un objet clair pour que le recruteur ouvre le message",
		outcome: "envoyer un email court avec un objet précis et un CV bien nommé",
		image: "/home/tool-job-offers.webp",
		icon: BriefcaseIcon,
	},
	{
		title: "Compétences CV étudiant",
		slug: "competences-cv-etudiant",
		problem: "trouver quelles compétences mettre sans inventer d'expérience",
		outcome: "classer compétences techniques, outils, langues et qualités professionnelles",
		image: "/home/tool-skills-assessment.webp",
		icon: ChartBarIcon,
	},
	{
		title: "Profil CV étudiant",
		slug: "profil-cv-etudiant",
		problem: "écrire un résumé court sans phrase générique",
		outcome: "présenter formation, objectif et point fort en quelques lignes",
		image: "/home/tool-cv-intelligent.webp",
		icon: GraduationCapIcon,
	},
	{
		title: "CV ATS Maroc",
		slug: "cv-ats-maroc",
		problem: "rendre le CV lisible pour les logiciels et les recruteurs",
		outcome: "utiliser une structure propre, des mots-clés métier et un PDF clair",
		image: "/home/tool-ats-optimization.webp",
		icon: ShieldCheckIcon,
	},
	{
		title: "Stage sans expérience",
		slug: "stage-sans-experience",
		problem: "demander un stage quand le CV paraît trop vide",
		outcome: "mettre en avant projets, ateliers, modules, motivation et disponibilité",
		image: "/home/tool-job-offers.webp",
		icon: TargetIcon,
	},
	{
		title: "Entretien téléphonique stage",
		slug: "entretien-telephonique-stage",
		problem: "répondre clairement quand une entreprise appelle",
		outcome: "préparer un pitch court, les dates, la ville et deux exemples",
		image: "/home/tool-interview-prep.webp",
		icon: ChatsCircleIcon,
	},
	{
		title: "Questions pièges entretien",
		slug: "questions-piege-entretien",
		problem: "ne pas paniquer devant une question difficile",
		outcome: "répondre avec honnêteté, méthode et exemple concret",
		image: "/home/tool-interview-prep.webp",
		icon: LightbulbIcon,
	},
	{
		title: "CV français arabe",
		slug: "cv-francais-arabe",
		problem: "préparer un CV cohérent pour un contexte bilingue",
		outcome: "garder une structure claire et adapter la langue au recruteur",
		image: "/home/tool-cv-intelligent.webp",
		icon: FileTextIcon,
	},
	{
		title: "Portfolio étudiant",
		slug: "portfolio-etudiant",
		problem: "montrer des preuves quand l'expérience professionnelle manque",
		outcome: "présenter projets, captures, documents et résultats de formation",
		image: "/home/public-pages-morocco-hub.webp",
		icon: MagicWandIcon,
	},
	{
		title: "Message LinkedIn recruteur",
		slug: "message-linkedin-recruteur",
		problem: "contacter un recruteur sans paraître vague ou insistant",
		outcome: "envoyer un message court avec objectif, profil et lien vers le CV",
		image: "/home/tool-career-coaching.webp",
		icon: UsersIcon,
	},
	{
		title: "Erreurs CV étudiant",
		slug: "erreurs-cv-etudiant",
		problem: "éviter les détails qui rendent un CV moins professionnel",
		outcome: "corriger fautes, phrases vagues, mise en page faible et fichier mal nommé",
		image: "/home/tool-ats-optimization.webp",
		icon: CheckCircleIcon,
	},
];

const funnelPages: TrafficLandingPageConfig[] = [
	{
		path: "/orientation-apres-bac",
		title: "Orientation après bac",
		seoTitle: "Orientation après bac au Maroc | IMTA Resume",
		description:
			"Compare les pistes après le bac, comprends les métiers techniques et prépare un CV simple pour commencer ton parcours.",
		hero: "Après le bac, choisis une direction qui mène à une vraie action.",
		heroTone:
			"IMTA Resume aide les futurs étudiants à relier formation, compétences, stage et premier CV sans rester bloqués devant les choix.",
		audience: "Pour lycéens, nouveaux étudiants et familles au Maroc",
		image: "/home/student-career-workshop.webp",
		searchIntents: ["orientation après bac Maroc", "choisir formation professionnelle", "métier technique après bac"],
		contentAngle: "Page d'entrée pour les étudiants qui cherchent une orientation avant même de penser au CV.",
		benefits: [
			{
				icon: GraduationCapIcon,
				title: "Choix plus clair",
				text: "Relie tes matières fortes, ton style de travail et les métiers possibles.",
			},
			{
				icon: BriefcaseIcon,
				title: "Stage en tete",
				text: "Comprends comment une formation peut mener vers des stages et premieres missions.",
			},
			{
				icon: FileTextIcon,
				title: "Premier CV",
				text: "Prepare deja les preuves a mettre dans ton futur CV: projets, ateliers, langues et outils.",
			},
		],
		steps: [
			{
				title: "Liste tes forces",
				text: "Matiere, pratique, communication, technique, organisation ou relation client.",
			},
			{ title: "Observe les métiers", text: "Regarde les missions réelles, pas seulement le nom de la formation." },
			{ title: "Prepare un dossier", text: "Garde tes projets, attestations, notes fortes et activites utiles." },
			{ title: "Teste par l'action", text: "Atelier, stage, visite, discussion avec un formateur ou CV de depart." },
		],
		toolLinks: [
			{ title: "Métiers techniques", text: "Explorer les domaines qui recrutent.", href: "/metiers-techniques" },
			{ title: "CV etudiant", text: "Creer un premier CV simple.", href: "/cv-etudiant" },
			{ title: "IMTA étudiants", text: "Voir l'accompagnement vers l'emploi.", href: "/imta-etudiants" },
		],
		testimonial: {
			quote: "J'ai compris que l'orientation devait aussi preparer mon premier stage et mon CV.",
			name: "Etudiant IMTA",
			role: "Orientation après bac",
		},
		faqs: [
			{
				question: "Comment choisir une formation après le bac ?",
				answer:
					"Compare tes forces, les missions réelles du métier, les stages possibles, la ville et le niveau d'accompagnement.",
			},
			{
				question: "Faut-il deja penser au CV ?",
				answer: "Oui. Un bon parcours commence par des preuves simples que tu pourras mettre dans ton CV plus tard.",
			},
			{
				question: "Comment eviter un mauvais choix ?",
				answer:
					"Parle avec des formateurs, regarde les missions terrain et teste ton interet avec un projet ou une visite.",
			},
		],
	},
	{
		path: "/formation-professionnelle-maroc",
		title: "Formation professionnelle au Maroc",
		seoTitle: "Formation professionnelle au Maroc | CV, stage et insertion",
		description:
			"Comprends comment transformer une formation professionnelle en CV, stage, entretien et première opportunité.",
		hero: "Une formation professionnelle doit devenir une candidature concrète.",
		heroTone:
			"Ateliers, gestes métier, outils, normes et stages: IMTA Resume aide à montrer ce que l'étudiant sait faire vraiment.",
		audience: "Pour étudiants en formation professionnelle et centres de formation",
		image: "/home/student-career-workshop.webp",
		searchIntents: [
			"formation professionnelle maroc",
			"cv formation professionnelle",
			"stage formation professionnelle",
		],
		contentAngle: "Page pour relier la formation à l'insertion professionnelle, avec un angle CV et stage.",
		benefits: [
			{
				icon: ChartBarIcon,
				title: "Compétences visibles",
				text: "Transforme les ateliers en compétences que les entreprises comprennent.",
			},
			{
				icon: ShieldCheckIcon,
				title: "Profil crédible",
				text: "Ajoute certificats, sécurité, outils, stages et situations pratiques.",
			},
			{
				icon: TargetIcon,
				title: "Insertion plus nette",
				text: "Relie la formation au stage, au CV et à l'entretien.",
			},
		],
		steps: [
			{ title: "Identifie les gestes métier", text: "Machines, outils, procédures, relation client ou sécurité." },
			{ title: "Classe les preuves", text: "Ateliers, projets, stages, certificats, rapports et réalisations." },
			{ title: "Écris le CV", text: "Un titre clair, des compétences lisibles et un profil honnête." },
			{ title: "Prépare l'entretien", text: "Explique ce que tu sais faire avec des exemples courts." },
		],
		toolLinks: [
			{
				title: "CV formation professionnelle",
				text: "Page dédiée aux profils pratiques.",
				href: "/cv-formation-professionnelle",
			},
			{
				title: "Stage formation professionnelle",
				text: "Préparer une demande de stage.",
				href: "/stage-formation-professionnelle",
			},
			{ title: "Préparation entretien", text: "Construire des réponses simples.", href: "/preparation-entretien" },
		],
		testimonial: {
			quote: "Mes ateliers sont devenus des preuves utiles dans mon CV.",
			name: "Étudiant IMTA",
			role: "Formation professionnelle",
		},
		faqs: [
			{
				question: "Que mettre dans un CV de formation professionnelle ?",
				answer:
					"Formation, ateliers, outils, gestes métier, stages, certificats, langues et qualités professionnelles.",
			},
			{
				question: "Comment parler d'un atelier ?",
				answer: "Décris l'objectif, l'outil utilisé, ton rôle, la règle de sécurité et le résultat obtenu.",
			},
			{
				question: "La formation suffit-elle pour trouver un stage ?",
				answer: "Elle aide, mais le CV, l'email, la disponibilité et la relance rendent la candidature plus forte.",
			},
		],
	},
	{
		path: "/choisir-metier-technique",
		title: "Choisir un métier technique",
		seoTitle: "Choisir un métier technique au Maroc | IMTA Resume",
		description:
			"Découvre comment comparer maintenance, HSE, logistique, santé, BTP, électricité, automobile et autres métiers techniques.",
		hero: "Le bon métier technique se choisit avec des missions, pas avec un nom.",
		heroTone:
			"Regarde les gestes, les outils, les conditions, les stages et les compétences à prouver avant de choisir une voie.",
		audience: "Pour étudiants qui hésitent entre plusieurs filières techniques",
		image: "/home/tool-skills-assessment.webp",
		searchIntents: ["choisir métier technique", "meilleur métier technique maroc", "orientation métiers techniques"],
		contentAngle: "Page crochet pour aider l'étudiant à choisir un domaine puis à préparer son CV.",
		benefits: [
			{ icon: TargetIcon, title: "Comparaison utile", text: "Compare missions, rythme, outils et stages possibles." },
			{
				icon: BriefcaseIcon,
				title: "Vision terrain",
				text: "Comprends ce que fait vraiment une personne dans le métier.",
			},
			{ icon: FileTextIcon, title: "CV anticipé", text: "Sais quelles preuves collecter pendant la formation." },
		],
		steps: [
			{ title: "Regarde les missions", text: "Maintenance, prévention, support, soins, chantier, stock ou client." },
			{ title: "Repere les outils", text: "Logiciels, machines, EPI, methodes, protocoles ou documents." },
			{ title: "Evalue ton style", text: "Terrain, analyse, relation, precision, urgence ou organisation." },
			{ title: "Prepare ton parcours", text: "Choisis les projets et stages qui prouveront ton choix." },
		],
		toolLinks: [
			{ title: "Métiers techniques", text: "Voir les pages par domaine.", href: "/metiers-techniques" },
			{ title: "CV HSE", text: "Exemple de page métier.", href: "/cv-hse" },
			{ title: "Stage maintenance", text: "Preparer un stage technique.", href: "/stage-maintenance-industrielle" },
		],
		testimonial: {
			quote: "J'ai compare les missions avant de choisir mon domaine.",
			name: "Étudiant IMTA",
			role: "Orientation métier",
		},
		faqs: [
			{
				question: "Quel métier technique choisir ?",
				answer:
					"Celui qui correspond a tes forces, aux missions qui t'interessent et aux stages accessibles dans ta ville.",
			},
			{
				question: "Comment savoir si un métier me convient ?",
				answer: "Observe les missions, parle avec des formateurs et teste par un projet ou une visite terrain.",
			},
			{
				question: "Dois-je adapter mon CV selon le métier ?",
				answer: "Oui. Un CV technique doit montrer les outils, gestes, normes et projets liés au métier cible.",
			},
		],
	},
	{
		path: "/stage-fin-etudes",
		title: "Stage de fin d'études",
		seoTitle: "Stage de fin d'études au Maroc | CV et candidature",
		description:
			"Prépare ton CV, ton email, ton pitch et tes relances pour trouver un stage de fin d'études plus sereinement.",
		hero: "Ton stage de fin d'études mérite une candidature plus solide.",
		heroTone:
			"Un bon dossier explique ton domaine, ton projet, tes dates, tes compétences et ce que tu veux apprendre sur le terrain.",
		audience: "Pour étudiants en dernière année, BTS, DUT, licence, école et formation professionnelle",
		image: "/home/tool-job-offers.webp",
		searchIntents: ["stage fin d'etudes maroc", "demande stage fin d'etudes", "cv stage pfe"],
		contentAngle: "Page dediee au moment le plus important du parcours etudiant: le stage final.",
		benefits: [
			{ icon: BriefcaseIcon, title: "Objectif clair", text: "Explique le type de mission recherche et tes dates." },
			{
				icon: FileTextIcon,
				title: "CV aligne",
				text: "Relie formation, projet de fin d'études et compétences utiles.",
			},
			{ icon: ChatsCircleIcon, title: "Entretien prepare", text: "Prevois ton pitch et deux exemples concrets." },
		],
		steps: [
			{ title: "Fixe les dates", text: "Debut, duree, disponibilite et ville." },
			{ title: "Clarifie le sujet", text: "Domaine, projet, mission souhaitée et contraintes de l'école." },
			{ title: "Prépare le CV", text: "Titre, compétences, projet, stages et outils." },
			{ title: "Relance proprement", text: "Message court, poli et utile après quelques jours." },
		],
		toolLinks: [
			{ title: "Email candidature", text: "Ecrire le message d'envoi.", href: "/email-candidature-stage" },
			{ title: "Objet mail stage", text: "Trouver un objet clair.", href: "/objet-mail-stage" },
			{ title: "Relance stage", text: "Relancer sans insister.", href: "/relance-candidature-stage" },
		],
		testimonial: {
			quote: "J'ai enfin envoye un dossier clair pour mon stage final.",
			name: "Etudiant IMTA",
			role: "Stage de fin d'études",
		},
		faqs: [
			{
				question: "Quand chercher un stage de fin d'études ?",
				answer:
					"Le plus tot possible: prepare CV, dates, ville, objectif et liste d'entreprises avant la periode officielle.",
			},
			{
				question: "Que mettre dans l'email ?",
				answer: "Formation, objectif de stage, dates, ville, compétence principale et CV en PDF.",
			},
			{
				question: "Comment se démarquer sans expérience ?",
				answer: "Montre tes projets, outils, ateliers, modules forts et motivation pour apprendre sur le terrain.",
			},
		],
	},
	{
		path: "/atelier-cv-etudiants",
		title: "Atelier CV étudiants",
		seoTitle: "Atelier CV pour étudiants | IMTA Resume",
		description:
			"Organise un atelier CV simple pour aider une classe a transformer formation, projets et stages en CV professionnel.",
		hero: "Un atelier CV doit faire repartir chaque étudiant avec une action concrète.",
		heroTone:
			"IMTA Resume donne une structure simple pour corriger le profil, les compétences, les stages, les projets et l'export PDF.",
		audience: "Pour formateurs, écoles, associations et classes étudiantes",
		image: "/home/student-career-workshop.webp",
		searchIntents: ["atelier cv etudiants", "atelier insertion professionnelle", "support atelier cv"],
		contentAngle: "Page utile pour transformer le produit en support pedagogique et en preuve d'accompagnement.",
		benefits: [
			{ icon: UsersIcon, title: "Classe guidée", text: "Tous les étudiants avancent avec la même structure." },
			{
				icon: BookOpenIcon,
				title: "Support pedagogique",
				text: "Des pages publiques à partager avant et après l'atelier.",
			},
			{
				icon: CheckCircleIcon,
				title: "Resultat visible",
				text: "CV exporte, profil corrige et prochaines actions notees.",
			},
		],
		steps: [
			{ title: "Demarrer par l'objectif", text: "Stage, alternance, premier emploi ou candidature spontanee." },
			{ title: "Corriger le profil", text: "Titre, résumé, formation et compétences." },
			{ title: "Ajouter les preuves", text: "Projet, atelier, stage, outil, certificat ou resultat." },
			{ title: "Exporter et relire", text: "PDF, nom de fichier, email et prochaine candidature." },
		],
		toolLinks: [
			{ title: "Écoles et formateurs", text: "Page dédiée à l'accompagnement.", href: "/ecoles-formateurs" },
			{ title: "CV sans expérience", text: "Support pour profils débutants.", href: "/cv-sans-experience" },
			{ title: "Campagnes étudiants", text: "Messages et packs à partager.", href: "/campagnes-etudiants" },
		],
		testimonial: {
			quote: "L'atelier devient plus concret quand chaque etudiant sort avec son CV et une prochaine action.",
			name: "Equipe IMTA",
			role: "Atelier CV",
		},
		faqs: [
			{
				question: "Combien de temps dure un atelier CV ?",
				answer:
					"Un format utile peut durer 60 a 90 minutes: objectif, structure, correction, export et prochaines actions.",
			},
			{
				question: "Que preparer avant l'atelier ?",
				answer:
					"Formation, stages, projets, certificats, photo si besoin, langues, compétences et email professionnel.",
			},
			{
				question: "Peut-on l'utiliser avec une classe debutante ?",
				answer:
					"Oui. Les pages CV sans expérience et formation professionnelle sont faites pour les profils avec peu d'expérience.",
			},
		],
	},
	{
		path: "/parents-etudiants-imta",
		title: "Parents d'étudiants IMTA",
		seoTitle: "Parents d'étudiants IMTA | Accompagnement CV et stage",
		description:
			"Montrez aux familles comment IMTA accompagne les étudiants vers le CV, le stage, l'entretien et les premières opportunités.",
		hero: "Les familles veulent voir un chemin clair vers l'avenir professionnel.",
		heroTone:
			"IMTA Resume montre de manière concrète comment l'étudiant apprend à présenter son parcours, chercher un stage et préparer ses entretiens.",
		audience: "Pour parents, familles et futurs étudiants",
		image: "/home/home-hero-students-career.webp",
		searchIntents: ["imta parents etudiants", "ecole aide stage cv", "accompagnement etudiants maroc"],
		contentAngle: "Page de confiance pour montrer aux familles que l'accompagnement va au-dela du cours.",
		benefits: [
			{
				icon: GraduationCapIcon,
				title: "Formation valorisee",
				text: "Le parcours devient lisible pour les entreprises.",
			},
			{ icon: BriefcaseIcon, title: "Stage prepare", text: "L'etudiant apprend a envoyer une candidature propre." },
			{ icon: ChatsCircleIcon, title: "Confiance entretien", text: "Il s'entraîne à expliquer ses compétences." },
		],
		steps: [
			{ title: "Construire le profil", text: "Formation, compétences, stages, projets et langues." },
			{ title: "Creer le CV", text: "Un document clair pour postuler." },
			{ title: "Preparer la parole", text: "Pitch, questions et exemples concrets." },
			{ title: "Passer a l'action", text: "Stage, candidature, relance et suivi." },
		],
		toolLinks: [
			{ title: "IMTA étudiants", text: "Voir l'initiative complète.", href: "/imta-etudiants" },
			{ title: "Orientation après bac", text: "Aider au choix du parcours.", href: "/orientation-apres-bac" },
			{ title: "CV etudiant", text: "Voir le parcours CV.", href: "/cv-etudiant" },
		],
		testimonial: {
			quote: "On voit mieux comment l'étudiant passe de la formation à une candidature concrète.",
			name: "Famille d'etudiant",
			role: "Accompagnement IMTA",
		},
		faqs: [
			{
				question: "IMTA Resume remplace-t-il les formateurs ?",
				answer: "Non. Il complète l'accompagnement et donne aux étudiants un support pratique pour avancer.",
			},
			{
				question: "Pourquoi le CV est important pendant la formation ?",
				answer: "Parce qu'il aide l'étudiant à reconnaître ses compétences et à préparer ses stages progressivement.",
			},
			{
				question: "Les étudiants débutants peuvent-ils l'utiliser ?",
				answer: "Oui. Les pages sont pensées pour les étudiants avec peu d'expérience professionnelle.",
			},
		],
	},
	{
		path: "/ecole-qui-aide-a-trouver-stage",
		title: "Ecole qui aide a trouver un stage",
		seoTitle: "Ecole qui aide a trouver un stage | IMTA Resume",
		description:
			"Decouvrez comment une ecole peut aider les etudiants a preparer CV, candidature, entretien et recherche de stage.",
		hero: "Une ecole utile aide l'etudiant a passer du cours a la candidature.",
		heroTone:
			"IMTA Resume rend visible l'accompagnement: pages publiques, atelier CV, preparation entretien et dossier de stage.",
		audience: "Pour futurs etudiants, familles, ecoles et partenaires",
		image: "/home/student-career-workshop.webp",
		searchIntents: [
			"ecole qui aide trouver stage",
			"aide stage etudiant maroc",
			"accompagnement insertion professionnelle",
		],
		contentAngle: "Page commerciale douce pour montrer la valeur d'IMTA a travers le soutien aux etudiants.",
		benefits: [
			{ icon: UsersIcon, title: "Accompagnement visible", text: "Les etudiants voient les etapes a suivre." },
			{ icon: FileTextIcon, title: "CV plus propre", text: "La candidature devient plus professionnelle." },
			{ icon: TargetIcon, title: "Stage mieux cible", text: "Ville, domaine, niveau et objectif sont plus clairs." },
		],
		steps: [
			{ title: "Former", text: "Donner les bases metier et les gestes pratiques." },
			{ title: "Structurer", text: "Transformer les acquis en CV et portfolio simple." },
			{ title: "Entrainer", text: "Preparer pitch, questions et relances." },
			{ title: "Connecter", text: "Aider l'etudiant a postuler avec un dossier propre." },
		],
		toolLinks: [
			{ title: "Ecoles et formateurs", text: "Accompagnement pedagogique.", href: "/ecoles-formateurs" },
			{ title: "Atelier CV", text: "Format pret pour une classe.", href: "/atelier-cv-etudiants" },
			{ title: "Stage au Maroc", text: "Guides de recherche de stage.", href: "/stage-maroc" },
		],
		testimonial: {
			quote: "L'accompagnement devient concret quand l'etudiant sait quoi envoyer et quoi dire.",
			name: "Equipe IMTA",
			role: "Insertion et stage",
		},
		faqs: [
			{
				question: "Une ecole peut-elle garantir un stage ?",
				answer:
					"Elle peut surtout mieux preparer l'etudiant: CV clair, candidature ciblee, entretien et bonnes pratiques de recherche.",
			},
			{
				question: "Qu'est-ce qui aide vraiment a trouver un stage ?",
				answer: "Un CV adapte, une demande claire, des relances propres et une bonne preparation avant l'appel.",
			},
			{
				question: "Pourquoi creer des pages publiques ?",
				answer: "Elles repondent aux questions des etudiants et les dirigent vers une action concrete.",
			},
		],
	},
	{
		path: "/premier-emploi-jeune-diplome",
		title: "Premier emploi jeune diplome",
		seoTitle: "Premier emploi jeune diplome au Maroc | CV et entretien",
		description: "Prepare un CV, un pitch et une strategie simple pour chercher un premier emploi apres la formation.",
		hero: "Ton premier emploi commence par un profil que l'on comprend vite.",
		heroTone:
			"Formation, stage, projet, competences et motivation: construis un dossier honnete, clair et pret pour les recruteurs.",
		audience: "Pour jeunes diplomes au Maroc",
		image: "/home/public-pages-morocco-hub.webp",
		searchIntents: ["premier emploi jeune diplome maroc", "cv jeune diplome", "entretien premier emploi"],
		contentAngle: "Page pour garder les jeunes diplomes dans le parcours apres le stage.",
		benefits: [
			{ icon: FileTextIcon, title: "CV cible", text: "Adapte le titre, le profil et les competences au poste." },
			{ icon: BriefcaseIcon, title: "Stage valorise", text: "Transforme ton stage en preuve d'experience." },
			{ icon: ChatsCircleIcon, title: "Pitch pret", text: "Explique ton projet professionnel sans phrases vagues." },
		],
		steps: [
			{ title: "Choisis une cible", text: "Poste, domaine, ville et type d'entreprise." },
			{ title: "Reprends le CV", text: "Stage, projet final, outils, resultats et competences." },
			{ title: "Prepare le pitch", text: "Qui tu es, ce que tu sais faire et ce que tu cherches." },
			{ title: "Postule avec suivi", text: "Liste d'entreprises, relances et ajustements." },
		],
		toolLinks: [
			{ title: "CV jeune diplome", text: "Page dediee aux profils recents.", href: "/cv-jeune-diplome" },
			{ title: "Entretien jeune diplome", text: "Preparer les questions.", href: "/entretien-jeune-diplome" },
			{ title: "LinkedIn etudiant", text: "Rendre le profil visible.", href: "/linkedin-etudiant" },
		],
		testimonial: {
			quote: "J'ai mieux presente mon stage et mon projet final dans mon premier CV.",
			name: "Jeune diplome",
			role: "Premier emploi",
		},
		faqs: [
			{
				question: "Comment chercher un premier emploi sans grande experience ?",
				answer: "Cible des postes realistes et valorise stage, projet, outils, apprentissage et motivation.",
			},
			{
				question: "Faut-il garder le CV sur une page ?",
				answer: "Pour un jeune diplome, une page claire suffit souvent si les informations sont bien choisies.",
			},
			{
				question: "Que dire en entretien ?",
				answer: "Prepare ton parcours, ton stage, un projet, une difficulte geree et ton objectif professionnel.",
			},
		],
	},
	{
		path: "/inscription-formation-avec-stage",
		title: "Formation avec stage",
		seoTitle: "Formation avec stage au Maroc | Preparer CV et insertion",
		description:
			"Comprends pourquoi le stage, le CV et l'entretien doivent faire partie du choix d'une formation professionnelle.",
		hero: "Choisis une formation qui prepare aussi la suite.",
		heroTone:
			"Le bon parcours aide l'etudiant a apprendre, prouver ses competences, chercher un stage et se presenter aux entreprises.",
		audience: "Pour futurs etudiants qui comparent les formations",
		image: "/home/student-career-workshop.webp",
		searchIntents: ["formation avec stage maroc", "choisir ecole avec stage", "formation insertion professionnelle"],
		contentAngle: "Page d'acquisition pour futurs etudiants qui comparent les ecoles et la valeur du stage.",
		benefits: [
			{ icon: GraduationCapIcon, title: "Parcours lisible", text: "Cours, ateliers, stage et CV se renforcent." },
			{ icon: BriefcaseIcon, title: "Stage prepare", text: "L'etudiant arrive avec dossier et objectif." },
			{ icon: ShieldCheckIcon, title: "Confiance famille", text: "Le chemin vers l'insertion est plus concret." },
		],
		steps: [
			{ title: "Comparer les formations", text: "Metier, pratique, stage, ville, accompagnement et outils." },
			{ title: "Regarder les preuves", text: "Ateliers, projets, certificats et exemples de candidatures." },
			{ title: "Preparer le CV tot", text: "Collecter les preuves pendant la formation." },
			{ title: "Avancer vers le stage", text: "Candidature, email, entretien et relance." },
		],
		toolLinks: [
			{ title: "Orientation apres bac", text: "Choisir une direction.", href: "/orientation-apres-bac" },
			{ title: "Parents IMTA", text: "Voir l'accompagnement pour les familles.", href: "/parents-etudiants-imta" },
			{
				title: "Formation professionnelle",
				text: "Relier formation et insertion.",
				href: "/formation-professionnelle-maroc",
			},
		],
		testimonial: {
			quote: "Le stage et le CV m'ont aide a comprendre pourquoi la formation devait etre pratique.",
			name: "Etudiant IMTA",
			role: "Formation avec stage",
		},
		faqs: [
			{
				question: "Pourquoi choisir une formation avec stage ?",
				answer: "Le stage donne une preuve terrain et aide l'etudiant a comprendre le metier en situation reelle.",
			},
			{
				question: "Le CV doit-il commencer avant le stage ?",
				answer: "Oui. Il faut construire le CV progressivement avec projets, ateliers et competences.",
			},
			{
				question: "Comment une ecole peut accompagner ?",
				answer: "Avec des ateliers CV, preparation entretien, pages ressources et suivi des candidatures.",
			},
		],
	},
	{
		path: "/imta-carriere-etudiants",
		title: "IMTA carriere etudiants",
		seoTitle: "IMTA carriere etudiants | CV, stage et entretien",
		description:
			"Une page publique pour montrer comment IMTA Resume aide les etudiants a creer leur CV, preparer un stage et reussir l'entretien.",
		hero: "IMTA accompagne les etudiants jusque dans leurs candidatures.",
		heroTone:
			"Le CV, le stage et l'entretien deviennent des etapes visibles du parcours, pas des choses a improviser a la derniere minute.",
		audience: "Pour etudiants, familles, partenaires et futurs inscrits",
		image: "/home/student-career-workshop.webp",
		searchIntents: ["imta carriere etudiants", "imta resume", "imta cv stage entretien"],
		contentAngle: "Page de marque pour relier IMTA Resume a la promesse d'accompagnement des etudiants.",
		benefits: [
			{ icon: GraduationCapIcon, title: "Formation presentee", text: "L'etudiant apprend a expliquer son parcours." },
			{
				icon: MagicWandIcon,
				title: "Outils modernes",
				text: "L'IA aide a reformuler et structurer sans remplacer l'etudiant.",
			},
			{ icon: BriefcaseIcon, title: "Action emploi", text: "Chaque ressource pousse vers CV, stage ou entretien." },
		],
		steps: [
			{ title: "Creer le CV", text: "Rassembler formation, projets, stages et competences." },
			{ title: "Cibler le stage", text: "Ville, metier, niveau et disponibilites." },
			{ title: "Preparer l'entretien", text: "Pitch, questions, exemples et confiance." },
			{ title: "Continuer a progresser", text: "Mettre a jour le CV apres chaque projet ou stage." },
		],
		toolLinks: [
			{ title: "Ressources etudiants", text: "Explorer le catalogue public.", href: "/ressources-etudiants-maroc" },
			{ title: "Campagnes etudiants", text: "Voir les hooks a partager.", href: "/campagnes-etudiants" },
			{ title: "IMTA etudiants", text: "Page d'initiative principale.", href: "/imta-etudiants" },
		],
		testimonial: {
			quote: "IMTA Resume rend l'accompagnement plus visible et plus facile a partager.",
			name: "IMTA Resume",
			role: "Carriere etudiants",
		},
		faqs: [
			{
				question: "A quoi sert IMTA Resume ?",
				answer:
					"A aider les etudiants a creer un CV, preparer les candidatures, travailler l'entretien et avancer vers le stage.",
			},
			{
				question: "Cette page est-elle publique ?",
				answer: "Oui. Elle sert a montrer l'accompagnement et a guider les etudiants vers les bons outils.",
			},
			{
				question: "Peut-on partager ces ressources ?",
				answer: "Oui. Les pages publiques sont faites pour etre partagees avec les etudiants, familles et partenaires.",
			},
		],
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

function cityDomainCvPage(city: City, domain: Domain): TrafficLandingPageConfig {
	return {
		...domainCvPage(domain),
		path: `/cv-${domain.slug}-${city.slug}`,
		title: `CV ${domain.name} à ${city.name}`,
		seoTitle: `CV ${domain.name} à ${city.name} | IMTA Resume`,
		description: `Prépare un CV ${domain.name} adapté aux recruteurs et entreprises de ${city.name}.`,
		hero: `Construis un CV ${domain.name} crédible pour postuler à ${city.name}.`,
		heroTone: `Relie tes compétences en ${domain.name} aux besoins des entreprises de ${city.name}, notamment ${city.context}.`,
		audience: `Pour étudiants en ${domain.name} qui postulent à ${city.name}`,
		image: city.image,
		searchIntents: [
			`cv ${domain.name} ${city.name}`,
			`compétences ${domain.name} ${city.name}`,
			`stage ${domain.name} ${city.name}`,
		],
		contentAngle: "Page locale et métier pour transformer une recherche CV en candidature prête.",
		toolLinks: [
			{
				title: `Stage ${domain.name} à ${city.name}`,
				text: "Préparer la candidature locale.",
				href: `/stage-${domain.slug}-${city.slug}`,
			},
			{
				title: `Entretien ${domain.name} à ${city.name}`,
				text: "Préparer les questions locales.",
				href: `/entretien-${domain.slug}-${city.slug}`,
			},
			{ title: `CV ${domain.name}`, text: "Voir le guide métier complet.", href: `/cv-${domain.slug}` },
		],
		faqs: [
			{
				question: `Comment adapter un CV ${domain.name} pour ${city.name} ?`,
				answer: `Mets en avant les compétences liées à ${domain.context}, puis relie-les aux secteurs présents à ${city.name}: ${city.context}.`,
			},
			{
				question: "Dois-je mentionner ma disponibilité locale ?",
				answer:
					"Oui, si tu peux te déplacer ou commencer rapidement dans la ville, c'est un avantage à rendre visible.",
			},
			{
				question: "Que faire si je n'ai pas encore d'expérience dans la ville ?",
				answer: "Utilise tes projets, ateliers, modules, stages courts et outils métier pour montrer ton potentiel.",
			},
		],
	};
}

function cityDomainInterviewPage(city: City, domain: Domain): TrafficLandingPageConfig {
	return {
		...domainInterviewPage(domain),
		path: `/entretien-${domain.slug}-${city.slug}`,
		title: `Entretien ${domain.name} à ${city.name}`,
		seoTitle: `Entretien ${domain.name} à ${city.name} | IMTA Resume`,
		description: `Prépare les questions d'entretien pour un stage ou premier emploi ${domain.name} à ${city.name}.`,
		hero: `Prépare ton entretien ${domain.name} à ${city.name} avec des exemples concrets.`,
		heroTone: `Travaille ton pitch, tes projets et les situations liées à ${domain.context}, puis adapte tes réponses au contexte de ${city.name}.`,
		audience: `Pour entretiens de stage et premier emploi en ${domain.name} à ${city.name}`,
		image: "/home/tool-interview-prep.webp",
		searchIntents: [
			`entretien ${domain.name} ${city.name}`,
			`questions entretien ${domain.name} ${city.name}`,
			`stage ${domain.name} ${city.name}`,
		],
		contentAngle: "Page locale et métier pour préparer les questions avant un appel recruteur.",
		toolLinks: [
			{
				title: `CV ${domain.name} à ${city.name}`,
				text: "Aligner le CV avec l'entretien.",
				href: `/cv-${domain.slug}-${city.slug}`,
			},
			{
				title: `Stage ${domain.name} à ${city.name}`,
				text: "Préparer les candidatures locales.",
				href: `/stage-${domain.slug}-${city.slug}`,
			},
			{ title: "Pitch entretien", text: "Construire une présentation courte.", href: "/pitch-entretien" },
		],
		faqs: [
			{
				question: `Quelles questions préparer pour ${domain.name} à ${city.name} ?`,
				answer: `Prépare ton parcours, tes outils, tes règles de sécurité, un projet concret et une réponse sur ton intérêt pour les entreprises de ${city.name}.`,
			},
			{
				question: "Comment parler de ma ville pendant l'entretien ?",
				answer:
					"Mentionne ta disponibilité, ta compréhension du tissu local et les secteurs qui recrutent dans la région.",
			},
			{
				question: "Faut-il préparer des questions à poser au recruteur ?",
				answer:
					"Oui. Prépare une question sur les missions, l'équipe, les outils utilisés et les compétences attendues.",
			},
		],
	};
}

function segmentCvPage(segment: StudentSegment): TrafficLandingPageConfig {
	return {
		path: `/cv-${segment.slug}`,
		title: `CV ${segment.name}`,
		seoTitle: `CV ${segment.name} | IMTA Resume`,
		description: `Prépare un CV clair pour un profil ${segment.name} avec formation, projets, stages et compétences.`,
		hero: `Ton CV ${segment.name} peut être professionnel même avec peu d'expérience.`,
		heroTone: `Mets en avant ${segment.context} dans une structure simple à comprendre pour les recruteurs.`,
		audience: `Pour étudiants ${segment.name}`,
		image: segment.image,
		searchIntents: [`cv ${segment.name}`, `exemple cv ${segment.name}`, `cv étudiant ${segment.name}`],
		contentAngle: "Page par niveau étudiant pour transformer un parcours scolaire en candidature crédible.",
		benefits: [
			{
				icon: GraduationCapIcon,
				title: "Parcours valorisé",
				text: "Présente la formation, les modules et les projets avec des mots concrets.",
			},
			{
				icon: FileTextIcon,
				title: "CV plus clair",
				text: "Organise les informations dans l'ordre attendu par une entreprise.",
			},
			{
				icon: ShieldCheckIcon,
				title: "Profil crédible",
				text: "Montre ce que tu sais déjà faire et ce que tu peux apprendre vite.",
			},
		],
		steps: [
			{ title: "Choisis l'objectif", text: "Stage, alternance, premier emploi ou candidature spontanée." },
			{ title: "Liste les preuves", text: "Projets, ateliers, stages, certificats et compétences." },
			{ title: "Écris un profil court", text: "Deux ou trois lignes pour expliquer ton objectif." },
			{ title: "Télécharge le PDF", text: "Garde une version propre à envoyer rapidement." },
		],
		toolLinks: [
			{
				title: `Stage ${segment.name}`,
				text: "Préparer les candidatures liées à ton niveau.",
				href: `/stage-${segment.slug}`,
			},
			{
				title: `Entretien ${segment.name}`,
				text: "Préparer les questions avant l'appel.",
				href: `/entretien-${segment.slug}`,
			},
			{ title: "CV sans expérience", text: "Trouver quoi mettre si ton CV paraît vide.", href: "/cv-sans-experience" },
		],
		testimonial: {
			quote: `J'ai mieux présenté mon parcours ${segment.name} et mon CV paraît beaucoup plus professionnel.`,
			name: "Étudiant IMTA",
			role: segment.name,
		},
		faqs: [
			{
				question: `Que mettre dans un CV ${segment.name} ?`,
				answer: `Mets ta formation, tes projets, tes stages, tes compétences, tes langues, tes outils et les preuves liées à ${segment.context}.`,
			},
			{
				question: "Le CV doit-il être très long ?",
				answer: "Non. Pour un profil étudiant, une page claire et ciblée est souvent plus efficace.",
			},
			{
				question: "Comment se démarquer sans beaucoup d'expérience ?",
				answer: "Montre des projets, des ateliers, une compétence utile et une motivation précise.",
			},
		],
	};
}

function segmentStagePage(segment: StudentSegment): TrafficLandingPageConfig {
	return {
		path: `/stage-${segment.slug}`,
		title: `Stage ${segment.name}`,
		seoTitle: `Stage ${segment.name} | IMTA Resume`,
		description: `Prépare une candidature de stage adaptée à ton profil ${segment.name}.`,
		hero: `Trouve un stage ${segment.name} avec un dossier prêt à envoyer.`,
		heroTone: `Transforme ${segment.context} en CV, email et pitch simples pour contacter les entreprises.`,
		audience: `Pour étudiants ${segment.name} qui cherchent un stage`,
		image: segment.image,
		searchIntents: [`stage ${segment.name}`, `demande stage ${segment.name}`, `cv stage ${segment.name}`],
		contentAngle: "Page par profil étudiant pour passer de la recherche de stage à une candidature complète.",
		benefits: [
			{
				icon: BriefcaseIcon,
				title: "Recherche ciblée",
				text: "Choisis les entreprises et missions adaptées à ton niveau.",
			},
			{
				icon: FileTextIcon,
				title: "Dossier complet",
				text: "Prépare CV, email, disponibilité et objectif de stage.",
			},
			{
				icon: ChatsCircleIcon,
				title: "Réponse préparée",
				text: "Prépare ton pitch si une entreprise te contacte.",
			},
		],
		steps: [
			{ title: "Définis ton stage", text: "Domaine, durée, ville et compétences à pratiquer." },
			{ title: "Adapte le CV", text: "Mets en avant les projets et modules utiles." },
			{ title: "Écris l'email", text: "Un message court, poli et clair." },
			{ title: "Relance proprement", text: "Garde une trace des entreprises contactées." },
		],
		toolLinks: [
			{ title: `CV ${segment.name}`, text: "Créer le CV à envoyer.", href: `/cv-${segment.slug}` },
			{ title: "Email candidature", text: "Préparer le message de contact.", href: "/email-candidature-stage" },
			{ title: "Stage au Maroc", text: "Voir la page stage principale.", href: "/stage-maroc" },
		],
		testimonial: {
			quote: `J'ai compris comment présenter mon profil ${segment.name} pour demander un stage plus clairement.`,
			name: "Étudiant IMTA",
			role: `Stage ${segment.name}`,
		},
		faqs: [
			{
				question: `Comment trouver un stage ${segment.name} ?`,
				answer:
					"Prépare un CV ciblé, contacte les entreprises pertinentes, explique tes disponibilités et relance poliment.",
			},
			{
				question: "Faut-il une lettre de motivation ?",
				answer: "Parfois oui. Un email clair peut suffire pour une première prise de contact.",
			},
			{
				question: "Comment choisir les entreprises ?",
				answer:
					"Commence par celles qui correspondent à ton domaine, ta ville, ton niveau et tes compétences actuelles.",
			},
		],
	};
}

function segmentInterviewPage(segment: StudentSegment): TrafficLandingPageConfig {
	return {
		path: `/entretien-${segment.slug}`,
		title: `Entretien ${segment.name}`,
		seoTitle: `Entretien ${segment.name} | IMTA Resume`,
		description: `Prépare les questions d'entretien adaptées à ton profil ${segment.name}.`,
		hero: `Présente ton parcours ${segment.name} avec plus de confiance.`,
		heroTone: `Prépare un pitch court, des exemples concrets et des réponses liées à ${segment.context}.`,
		audience: `Pour entretiens de stage, alternance et premier emploi ${segment.name}`,
		image: "/home/tool-interview-prep.webp",
		searchIntents: [
			`entretien ${segment.name}`,
			`questions entretien ${segment.name}`,
			`présentez-vous ${segment.name}`,
		],
		contentAngle: "Page par profil étudiant pour préparer les réponses avant un entretien.",
		benefits: [
			{
				icon: ChatsCircleIcon,
				title: "Pitch clair",
				text: "Explique ton niveau, ton objectif et tes forces sans réciter ton CV.",
			},
			{
				icon: LightbulbIcon,
				title: "Exemples prêts",
				text: "Choisis des projets, stages ou ateliers à raconter simplement.",
			},
			{
				icon: CheckCircleIcon,
				title: "Moins de stress",
				text: "Arrive avec une structure de réponse et des mots simples.",
			},
		],
		steps: [
			{ title: "Prépare le pitch", text: "Formation, objectif et point fort." },
			{ title: "Choisis trois exemples", text: "Projet, travail d'équipe, problème ou apprentissage." },
			{ title: "Révise les bases", text: "Outils, méthodes, sécurité, langues ou contexte métier." },
			{ title: "Répète à voix haute", text: "Rends tes réponses plus courtes et naturelles." },
		],
		toolLinks: [
			{ title: `CV ${segment.name}`, text: "Aligner le CV avec ce que tu vas dire.", href: `/cv-${segment.slug}` },
			{ title: "Questions entretien", text: "Préparer les questions fréquentes.", href: "/questions-entretien-stage" },
			{ title: "Pitch entretien", text: "Construire une présentation courte.", href: "/pitch-entretien" },
		],
		testimonial: {
			quote: `Je savais quoi dire sur mon parcours ${segment.name} sans me perdre dans les détails.`,
			name: "Étudiant IMTA",
			role: `Entretien ${segment.name}`,
		},
		faqs: [
			{
				question: `Quelles questions préparer pour un entretien ${segment.name} ?`,
				answer:
					"Ton parcours, ton objectif, tes compétences, un projet concret, tes disponibilités et pourquoi ce stage ou poste t'intéresse.",
			},
			{
				question: "Comment répondre si je manque d'expérience ?",
				answer:
					"Parle de tes projets, ateliers, modules, qualités professionnelles et capacité à apprendre rapidement.",
			},
			{
				question: "Faut-il apprendre les réponses par coeur ?",
				answer: "Non. Prépare une structure et des exemples, puis réponds naturellement.",
			},
		],
	};
}

function studentIntentPage(intent: StudentIntent): TrafficLandingPageConfig {
	return {
		path: `/${intent.slug}`,
		title: intent.title,
		seoTitle: `${intent.title} | IMTA Resume`,
		description: `Guide pratique pour ${intent.problem} et ${intent.outcome}.`,
		hero: `${intent.title}: une réponse claire avant de postuler.`,
		heroTone: `Cette page aide à ${intent.problem}, puis à ${intent.outcome}.`,
		audience: "Pour étudiants, stagiaires et jeunes diplômés au Maroc",
		image: intent.image,
		searchIntents: [intent.title.toLowerCase(), intent.problem, intent.outcome],
		contentAngle: "Page de micro-intention pour répondre vite à une question fréquente d'étudiant.",
		benefits: [
			{
				icon: intent.icon,
				title: "Réponse directe",
				text: `Comprends comment ${intent.problem} sans perdre du temps.`,
			},
			{
				icon: CheckCircleIcon,
				title: "Action concrète",
				text: `Passe à l'étape suivante: ${intent.outcome}.`,
			},
			{
				icon: TargetIcon,
				title: "Candidature alignée",
				text: "Relie ce conseil à ton CV, ton email, ton stage ou ton entretien.",
			},
		],
		steps: [
			{ title: "Clarifie la situation", text: intent.problem },
			{ title: "Choisis la bonne option", text: "Garde ce qui aide le recruteur à comprendre ton profil." },
			{ title: "Applique au CV", text: "Corrige le CV, l'email ou le pitch avec une action précise." },
			{ title: "Prépare la suite", text: intent.outcome },
		],
		toolLinks: [
			{ title: "CV étudiant", text: "Appliquer le conseil dans ton CV.", href: "/cv-etudiant" },
			{ title: "Stage au Maroc", text: "Préparer ton dossier de stage.", href: "/stage-maroc" },
			{
				title: "Préparation entretien",
				text: "Transformer le conseil en réponse orale.",
				href: "/preparation-entretien",
			},
		],
		testimonial: {
			quote: "J'avais une question précise et j'ai pu corriger mon dossier avant d'envoyer ma candidature.",
			name: "Étudiant IMTA",
			role: "Candidature étudiant",
		},
		faqs: [
			{
				question: `Pourquoi ${intent.title.toLowerCase()} est important ?`,
				answer: `Parce que cela aide à ${intent.problem} et rend la candidature plus claire pour l'entreprise.`,
			},
			{
				question: "Est-ce que ce conseil remplace un CV complet ?",
				answer: "Non. C'est une amélioration ciblée qui doit rester cohérente avec le CV, l'email et l'entretien.",
			},
			{
				question: "Quelle est la prochaine étape ?",
				answer: `La prochaine étape est de ${intent.outcome}, puis d'envoyer une candidature propre.`,
			},
		],
	};
}

function domainSegmentCvPage(domain: Domain, segment: StudentSegment): TrafficLandingPageConfig {
	return {
		path: `/cv-${domain.slug}-${segment.slug}`,
		title: `CV ${domain.name} ${segment.name}`,
		seoTitle: `CV ${domain.name} ${segment.name} | IMTA Resume`,
		description: `Crée un CV ${domain.name} adapté à un profil ${segment.name}, même avec peu d'expérience.`,
		hero: `Un CV ${domain.name} ${segment.name} doit montrer des preuves, pas seulement un diplôme.`,
		heroTone: `Relie ${domain.context} avec ton parcours ${segment.name}: ${segment.context}.`,
		audience: `Pour profils ${segment.name} en ${domain.name}`,
		image: domain.image,
		searchIntents: [
			`cv ${domain.name} ${segment.name}`,
			`exemple cv ${domain.name} ${segment.name}`,
			`compétences ${domain.name} cv`,
		],
		contentAngle: "Page croisée métier + niveau pour créer un CV plus ciblé et moins générique.",
		benefits: [
			{
				icon: domain.icon,
				title: "Métier visible",
				text: `Fais ressortir les compétences liées à ${domain.name}.`,
			},
			{
				icon: GraduationCapIcon,
				title: "Niveau assumé",
				text: `Présente ton parcours ${segment.name} sans chercher à paraître plus expérimenté.`,
			},
			{
				icon: ShieldCheckIcon,
				title: "Preuves concrètes",
				text: "Ajoute projets, ateliers, stages, outils et certificats liés au métier.",
			},
		],
		steps: [
			{ title: "Choisis le poste cible", text: `Stage, alternance ou premier emploi en ${domain.name}.` },
			{ title: "Liste les preuves", text: "Projet, atelier, outil, stage, certificat ou situation pratique." },
			{ title: "Classe les compétences", text: "Technique, sécurité, méthode, logiciels, langues et qualités." },
			{ title: "Adapte le titre", text: `Un titre simple: ${domain.name}, ${segment.name}, objectif clair.` },
		],
		toolLinks: [
			{
				title: `Stage ${domain.name} ${segment.name}`,
				text: "Préparer une candidature ciblée.",
				href: `/stage-${domain.slug}-${segment.slug}`,
			},
			{
				title: `Entretien ${domain.name} ${segment.name}`,
				text: "Préparer les questions.",
				href: `/entretien-${domain.slug}-${segment.slug}`,
			},
			{ title: `CV ${domain.name}`, text: "Voir la page métier complète.", href: `/cv-${domain.slug}` },
		],
		testimonial: {
			quote: `J'ai mieux relié mon niveau ${segment.name} aux compétences attendues en ${domain.name}.`,
			name: "Étudiant IMTA",
			role: `${domain.name} ${segment.name}`,
		},
		faqs: [
			{
				question: `Que mettre dans un CV ${domain.name} ${segment.name} ?`,
				answer: `Mets ta formation, tes projets, tes stages, les outils liés à ${domain.context}, et les preuves adaptées à ton niveau ${segment.name}.`,
			},
			{
				question: "Comment éviter un CV trop général ?",
				answer:
					"Supprime les phrases vagues et remplace-les par des outils, gestes, méthodes, projets ou résultats observables.",
			},
			{
				question: "Faut-il mentionner que je débute ?",
				answer: "Oui, mais formule-le positivement: objectif clair, capacité d'apprentissage et preuves de pratique.",
			},
		],
	};
}

function domainSegmentStagePage(domain: Domain, segment: StudentSegment): TrafficLandingPageConfig {
	return {
		path: `/stage-${domain.slug}-${segment.slug}`,
		title: `Stage ${domain.name} ${segment.name}`,
		seoTitle: `Stage ${domain.name} ${segment.name} | IMTA Resume`,
		description: `Prépare une candidature de stage ${domain.name} adaptée à ton profil ${segment.name}.`,
		hero: `Cherche un stage ${domain.name} ${segment.name} avec une candidature plus claire.`,
		heroTone: `Transforme ton parcours ${segment.name} en CV, email et pitch orientés ${domain.name}.`,
		audience: `Pour profils ${segment.name} qui cherchent un stage en ${domain.name}`,
		image: domain.image,
		searchIntents: [
			`stage ${domain.name} ${segment.name}`,
			`demande stage ${domain.name} ${segment.name}`,
			`cv stage ${domain.name}`,
		],
		contentAngle: "Page croisée métier + niveau pour préparer une demande de stage plus précise.",
		benefits: [
			{
				icon: BriefcaseIcon,
				title: "Stage mieux ciblé",
				text: `Repère les missions réalistes pour un profil ${segment.name} en ${domain.name}.`,
			},
			{
				icon: FileTextIcon,
				title: "Dossier prêt",
				text: "Prépare CV, email, disponibilités et objectifs avant de contacter l'entreprise.",
			},
			{
				icon: ChatsCircleIcon,
				title: "Pitch simple",
				text: "Explique ce que tu veux apprendre et ce que tu sais déjà faire.",
			},
		],
		steps: [
			{ title: "Définis le stage", text: `Missions possibles en ${domain.name}, durée et disponibilité.` },
			{ title: "Adapte le CV", text: `Relie ${segment.context} aux attentes du métier.` },
			{ title: "Écris l'email", text: "Court, poli, ciblé et attaché au CV PDF." },
			{ title: "Prépare l'appel", text: "Pitch, dates, ville, objectif et exemples." },
		],
		toolLinks: [
			{
				title: `CV ${domain.name} ${segment.name}`,
				text: "Créer le CV à envoyer.",
				href: `/cv-${domain.slug}-${segment.slug}`,
			},
			{ title: "Email candidature", text: "Préparer le message de stage.", href: "/email-candidature-stage" },
			{ title: `Stage ${domain.name}`, text: "Voir le guide métier.", href: `/stage-${domain.slug}` },
		],
		testimonial: {
			quote: `Ma demande de stage ${domain.name} était plus claire parce qu'elle expliquait mon niveau ${segment.name}.`,
			name: "Étudiant IMTA",
			role: `Stage ${domain.name}`,
		},
		faqs: [
			{
				question: `Comment demander un stage ${domain.name} quand on est ${segment.name} ?`,
				answer:
					"Prépare un CV ciblé, explique ton objectif de stage, donne tes disponibilités et montre une preuve concrète de pratique.",
			},
			{
				question: "Que faire si je manque d'expérience ?",
				answer: "Mets tes ateliers, projets, modules, outils utilisés et motivation à apprendre sur le terrain.",
			},
			{
				question: "Faut-il envoyer la même candidature partout ?",
				answer: "Non. Garde une base, puis adapte le domaine, l'entreprise, la ville et les compétences principales.",
			},
		],
	};
}

function domainSegmentInterviewPage(domain: Domain, segment: StudentSegment): TrafficLandingPageConfig {
	return {
		path: `/entretien-${domain.slug}-${segment.slug}`,
		title: `Entretien ${domain.name} ${segment.name}`,
		seoTitle: `Entretien ${domain.name} ${segment.name} | IMTA Resume`,
		description: `Prépare les questions d'entretien ${domain.name} pour un profil ${segment.name}.`,
		hero: `Réponds aux questions ${domain.name} ${segment.name} avec des exemples concrets.`,
		heroTone: `Prépare ton pitch, tes projets et les situations liées à ${domain.context}, avec un discours adapté à ton niveau ${segment.name}.`,
		audience: `Pour entretiens de stage et premier emploi ${domain.name} ${segment.name}`,
		image: "/home/tool-interview-prep.webp",
		searchIntents: [
			`entretien ${domain.name} ${segment.name}`,
			`questions entretien ${domain.name}`,
			`présentez-vous ${domain.name}`,
		],
		contentAngle: "Page croisée métier + niveau pour préparer des réponses adaptées au profil réel de l'étudiant.",
		benefits: [
			{
				icon: ChatsCircleIcon,
				title: "Questions ciblées",
				text: `Prépare les questions liées à ${domain.name}, pas seulement les questions générales.`,
			},
			{
				icon: LightbulbIcon,
				title: "Exemples adaptés",
				text: `Utilise ton parcours ${segment.name} comme preuve, même sans longue expérience.`,
			},
			{
				icon: CheckCircleIcon,
				title: "Réponses plus courtes",
				text: "Garde une structure claire pour répondre sans te perdre.",
			},
		],
		steps: [
			{ title: "Prépare ton pitch", text: `Formation, objectif et intérêt pour ${domain.name}.` },
			{ title: "Choisis trois preuves", text: "Projet, atelier, stage, problème ou apprentissage." },
			{ title: "Révise les bases", text: `Outils, sécurité, méthodes et vocabulaire liés à ${domain.context}.` },
			{ title: "Répète naturellement", text: "Corrige les réponses trop longues et trop scolaires." },
		],
		toolLinks: [
			{
				title: `CV ${domain.name} ${segment.name}`,
				text: "Aligner le CV avec l'entretien.",
				href: `/cv-${domain.slug}-${segment.slug}`,
			},
			{
				title: `Stage ${domain.name} ${segment.name}`,
				text: "Préparer les candidatures.",
				href: `/stage-${domain.slug}-${segment.slug}`,
			},
			{ title: "Pitch entretien", text: "Construire une présentation courte.", href: "/pitch-entretien" },
		],
		testimonial: {
			quote: `J'ai su expliquer mon niveau ${segment.name} et donner des exemples liés à ${domain.name}.`,
			name: "Étudiant IMTA",
			role: `Entretien ${domain.name}`,
		},
		faqs: [
			{
				question: `Quelles questions préparer pour un entretien ${domain.name} ${segment.name} ?`,
				answer:
					"Ton parcours, ton objectif, tes outils, un projet concret, une difficulté, une règle de sécurité et ta motivation pour ce métier.",
			},
			{
				question: "Comment parler d'un projet d'école ?",
				answer: "Décris le contexte, ton rôle, l'action réalisée, l'outil utilisé et ce que tu as appris.",
			},
			{
				question: "Faut-il apprendre les réponses par coeur ?",
				answer: "Non. Prépare une structure et des exemples, puis réponds naturellement.",
			},
		],
	};
}

function citySegmentCvPage(city: City, segment: StudentSegment): TrafficLandingPageConfig {
	return {
		...segmentCvPage(segment),
		path: `/cv-${segment.slug}-${city.slug}`,
		title: `CV ${segment.name} à ${city.name}`,
		seoTitle: `CV ${segment.name} à ${city.name} | IMTA Resume`,
		description: `Prépare un CV ${segment.name} adapté aux entreprises et stages de ${city.name}.`,
		hero: `Un CV ${segment.name} à ${city.name} doit montrer ton potentiel local.`,
		heroTone: `Relie ton parcours ${segment.name} aux secteurs présents à ${city.name}: ${city.context}.`,
		audience: `Pour profils ${segment.name} qui postulent à ${city.name}`,
		image: city.image,
		searchIntents: [
			`cv ${segment.name} ${city.name}`,
			`stage ${segment.name} ${city.name}`,
			`emploi ${segment.name} ${city.name}`,
		],
		contentAngle: "Page locale + niveau étudiant pour rendre un CV plus adapté au marché de la ville.",
		toolLinks: [
			{
				title: `Stage ${segment.name} à ${city.name}`,
				text: "Préparer une demande de stage locale.",
				href: `/stage-${segment.slug}-${city.slug}`,
			},
			{
				title: `Entretien ${segment.name} à ${city.name}`,
				text: "Préparer l'appel recruteur.",
				href: `/entretien-${segment.slug}-${city.slug}`,
			},
			{ title: `Stage à ${city.name}`, text: "Voir les conseils locaux.", href: `/stage-${city.slug}` },
		],
		faqs: [
			{
				question: `Comment adapter un CV ${segment.name} pour ${city.name} ?`,
				answer: `Mets en avant tes projets, stages, disponibilités et compétences liées aux secteurs de ${city.name}: ${city.context}.`,
			},
			{
				question: "Faut-il mentionner la ville dans le CV ?",
				answer: "Oui si ta disponibilité locale, ton adresse ou ta mobilité rassure l'entreprise.",
			},
			{
				question: "Comment rendre le CV plus crédible ?",
				answer:
					"Ajoute des preuves concrètes: ateliers, projets, outils, stages courts, certificats et résultats observables.",
			},
		],
	};
}

function citySegmentStagePage(city: City, segment: StudentSegment): TrafficLandingPageConfig {
	return {
		...segmentStagePage(segment),
		path: `/stage-${segment.slug}-${city.slug}`,
		title: `Stage ${segment.name} à ${city.name}`,
		seoTitle: `Stage ${segment.name} à ${city.name} | IMTA Resume`,
		description: `Prépare une candidature ciblée pour chercher un stage ${segment.name} à ${city.name}.`,
		hero: `Cherche un stage ${segment.name} à ${city.name} avec un dossier prêt.`,
		heroTone: `Transforme ton parcours ${segment.name} en CV, email et pitch adaptés aux entreprises de ${city.name}.`,
		audience: `Pour profils ${segment.name} qui cherchent un stage à ${city.name}`,
		image: city.image,
		searchIntents: [
			`stage ${segment.name} ${city.name}`,
			`demande stage ${segment.name} ${city.name}`,
			`cv stage ${city.name}`,
		],
		contentAngle: "Page locale + niveau pour transformer une recherche de stage en action claire.",
		toolLinks: [
			{
				title: `CV ${segment.name} à ${city.name}`,
				text: "Créer le CV à envoyer.",
				href: `/cv-${segment.slug}-${city.slug}`,
			},
			{ title: "Email candidature", text: "Préparer le message de stage.", href: "/email-candidature-stage" },
			{ title: `Stage à ${city.name}`, text: "Voir la page locale.", href: `/stage-${city.slug}` },
		],
		faqs: [
			{
				question: `Comment trouver un stage ${segment.name} à ${city.name} ?`,
				answer: `Prépare un CV ciblé, repère les entreprises liées à ${city.context}, contacte-les avec un email court et relance poliment.`,
			},
			{
				question: "Comment choisir les entreprises locales ?",
				answer: "Commence par celles qui correspondent à ton domaine, ta mobilité, ton niveau et tes disponibilités.",
			},
			{
				question: "Que préparer avant d'envoyer le CV ?",
				answer: "Un PDF propre, un objet de mail clair, tes dates de stage et une phrase sur ton objectif.",
			},
		],
	};
}

function citySegmentInterviewPage(city: City, segment: StudentSegment): TrafficLandingPageConfig {
	return {
		...segmentInterviewPage(segment),
		path: `/entretien-${segment.slug}-${city.slug}`,
		title: `Entretien ${segment.name} à ${city.name}`,
		seoTitle: `Entretien ${segment.name} à ${city.name} | IMTA Resume`,
		description: `Prépare ton entretien de stage ou premier emploi ${segment.name} à ${city.name}.`,
		hero: `Présente ton parcours ${segment.name} à ${city.name} avec plus de confiance.`,
		heroTone: `Travaille ton pitch, tes exemples et ta disponibilité locale pour les entreprises de ${city.name}.`,
		audience: `Pour entretiens ${segment.name} à ${city.name}`,
		image: "/home/tool-interview-prep.webp",
		searchIntents: [
			`entretien ${segment.name} ${city.name}`,
			`questions entretien stage ${city.name}`,
			`présentez-vous ${segment.name}`,
		],
		contentAngle: "Page locale + niveau pour préparer les réponses avant un entretien.",
		toolLinks: [
			{
				title: `CV ${segment.name} à ${city.name}`,
				text: "Aligner le CV avec l'entretien.",
				href: `/cv-${segment.slug}-${city.slug}`,
			},
			{
				title: `Stage ${segment.name} à ${city.name}`,
				text: "Préparer les candidatures.",
				href: `/stage-${segment.slug}-${city.slug}`,
			},
			{ title: "Pitch entretien", text: "Construire une présentation courte.", href: "/pitch-entretien" },
		],
		faqs: [
			{
				question: `Quelles questions préparer pour un entretien ${segment.name} à ${city.name} ?`,
				answer:
					"Ton parcours, ton objectif, tes disponibilités, tes projets, ton intérêt pour la ville et deux exemples concrets.",
			},
			{
				question: "Comment parler de ma disponibilité locale ?",
				answer: "Dis clairement quand tu peux commencer, où tu peux te déplacer et combien de temps dure ton stage.",
			},
			{
				question: "Comment répondre si je manque d'expérience ?",
				answer: "Utilise tes projets, ateliers, modules, qualités professionnelles et capacité à apprendre rapidement.",
			},
		],
	};
}

function cityOrientationPage(city: City): TrafficLandingPageConfig {
	return {
		path: `/orientation-apres-bac-${city.slug}`,
		title: `Orientation après bac à ${city.name}`,
		seoTitle: `Orientation après bac à ${city.name} | IMTA Resume`,
		description: `Compare les formations, métiers, stages et opportunités à ${city.name} pour choisir une direction après le bac.`,
		hero: `Après le bac à ${city.name}, choisis une voie qui peut mener au stage.`,
		heroTone: `Relie ton choix de formation aux secteurs présents à ${city.name}: ${city.context}.`,
		audience: `Pour lycéens, nouveaux étudiants et familles à ${city.name}`,
		image: city.image,
		searchIntents: [
			`orientation apres bac ${city.name}`,
			`formation professionnelle ${city.name}`,
			`stage étudiant ${city.name}`,
		],
		contentAngle: "Page locale d'orientation pour capter les recherches avant la candidature.",
		benefits: [
			{
				icon: MapPinIcon,
				title: "Ville prise en compte",
				text: `Observe les secteurs et entreprises présents à ${city.name}.`,
			},
			{
				icon: GraduationCapIcon,
				title: "Formation plus lisible",
				text: "Compare les domaines avec les compétences que tu veux construire.",
			},
			{
				icon: BriefcaseIcon,
				title: "Stage anticipé",
				text: "Pense déjà aux stages, projets et preuves à mettre dans le CV.",
			},
		],
		steps: [
			{ title: "Repère les secteurs", text: `${city.name}: ${city.context}.` },
			{ title: "Choisis un domaine", text: "Compare missions, outils, rythme et débouchés." },
			{ title: "Prépare ton dossier", text: "Formation, projets, langues, activités et premières compétences." },
			{ title: "Passe au CV", text: "Construis un CV de départ avant les premières candidatures." },
		],
		toolLinks: [
			{ title: `Stage à ${city.name}`, text: "Préparer une recherche locale.", href: `/stage-${city.slug}` },
			{ title: "Orientation après bac", text: "Voir la page générale.", href: "/orientation-apres-bac" },
			{ title: "CV étudiant", text: "Créer un premier CV.", href: "/cv-etudiant" },
		],
		testimonial: {
			quote: `J'ai relié mon choix de formation aux opportunités de ${city.name}.`,
			name: "Étudiant IMTA",
			role: `Orientation à ${city.name}`,
		},
		faqs: [
			{
				question: `Comment choisir une formation après le bac à ${city.name} ?`,
				answer: `Regarde tes forces, les secteurs de ${city.name}, les stages possibles et le niveau d'accompagnement vers le CV et l'entretien.`,
			},
			{
				question: "Faut-il tenir compte de la ville ?",
				answer: "Oui. La ville influence les stages, les entreprises à contacter et les compétences les plus visibles.",
			},
			{
				question: "Quelle est la prochaine action ?",
				answer: "Choisir un domaine, préparer un premier CV et collecter des preuves pendant la formation.",
			},
		],
	};
}

function cityFormationPage(city: City): TrafficLandingPageConfig {
	return {
		path: `/formation-professionnelle-${city.slug}`,
		title: `Formation professionnelle à ${city.name}`,
		seoTitle: `Formation professionnelle à ${city.name} | IMTA Resume`,
		description: `Prépare un CV, un stage et un entretien à partir d'une formation professionnelle à ${city.name}.`,
		hero: `Une formation professionnelle à ${city.name} doit se transformer en dossier concret.`,
		heroTone: `Ateliers, certificats, gestes métier et stage deviennent des preuves pour les entreprises de ${city.name}.`,
		audience: `Pour étudiants en formation professionnelle à ${city.name}`,
		image: city.image,
		searchIntents: [
			`formation professionnelle ${city.name}`,
			`cv formation professionnelle ${city.name}`,
			`stage formation professionnelle ${city.name}`,
		],
		contentAngle: "Page locale pour relier formation professionnelle, CV et insertion.",
		benefits: [
			{
				icon: ChartBarIcon,
				title: "Compétences métier",
				text: "Classe les outils, gestes, normes, logiciels et situations pratiques.",
			},
			{
				icon: FileTextIcon,
				title: "CV local",
				text: `Adapte le CV aux secteurs présents à ${city.name}.`,
			},
			{
				icon: ChatsCircleIcon,
				title: "Entretien plus simple",
				text: "Prépare des exemples liés aux ateliers et aux stages.",
			},
		],
		steps: [
			{ title: "Lister les ateliers", text: "Ce que tu as fait, avec quels outils et quelles règles." },
			{
				title: "Relier à la ville",
				text: `${city.context}: choisis les mots qui correspondent aux entreprises locales.`,
			},
			{ title: "Construire le CV", text: "Titre, profil, compétences, formation, stages et projets." },
			{ title: "Préparer la candidature", text: "Email, objet, CV PDF, dates et relance." },
		],
		toolLinks: [
			{ title: `Stage à ${city.name}`, text: "Voir les conseils locaux.", href: `/stage-${city.slug}` },
			{ title: "Formation professionnelle", text: "Voir le guide général.", href: "/formation-professionnelle-maroc" },
			{ title: "CV formation professionnelle", text: "Construire le CV.", href: "/cv-formation-professionnelle" },
		],
		testimonial: {
			quote: `Mon CV parle mieux des compétences attendues à ${city.name}.`,
			name: "Étudiant IMTA",
			role: `Formation professionnelle à ${city.name}`,
		},
		faqs: [
			{
				question: `Que mettre dans un CV après une formation professionnelle à ${city.name} ?`,
				answer: `Formation, ateliers, outils, stages, certificats, disponibilité et compétences utiles aux secteurs de ${city.name}.`,
			},
			{
				question: "Comment rendre le profil moins scolaire ?",
				answer: "Ajoute des preuves pratiques: outil utilisé, tâche réalisée, sécurité, résultat et apprentissage.",
			},
			{
				question: "Comment contacter une entreprise locale ?",
				answer:
					"Envoie un email court avec ton CV PDF, ton objectif de stage, tes dates et une phrase adaptée au domaine.",
			},
		],
	};
}

function cityStageFinEtudesPage(city: City): TrafficLandingPageConfig {
	return {
		path: `/stage-fin-etudes-${city.slug}`,
		title: `Stage de fin d'études à ${city.name}`,
		seoTitle: `Stage de fin d'études à ${city.name} | IMTA Resume`,
		description: `Prépare une candidature de stage de fin d'études à ${city.name}: CV, email, objet, pitch et relance.`,
		hero: `Cherche ton stage de fin d'études à ${city.name} avec un dossier prêt.`,
		heroTone: `Ton CV, ton projet, tes dates et ton pitch doivent parler clairement aux entreprises de ${city.name}.`,
		audience: `Pour étudiants en dernière année à ${city.name}`,
		image: city.image,
		searchIntents: [`stage fin d'etudes ${city.name}`, `pfe ${city.name}`, `demande stage fin d'etudes ${city.name}`],
		contentAngle: "Page locale pour les recherches de stage final et PFE.",
		benefits: [
			{ icon: BriefcaseIcon, title: "Recherche locale", text: `Cible les entreprises liées à ${city.context}.` },
			{ icon: FileTextIcon, title: "CV PFE", text: "Mets en avant projet, outils, stage et compétences." },
			{ icon: TargetIcon, title: "Message clair", text: "Annonce dates, durée, domaine et objectif." },
		],
		steps: [
			{ title: "Définir le PFE", text: "Sujet, domaine, dates, durée et ville." },
			{ title: "Adapter le CV", text: `Relie ton projet aux besoins présents à ${city.name}.` },
			{ title: "Écrire l'email", text: "Objet précis, message court, CV PDF." },
			{ title: "Relancer", text: "Relance polie avec rappel du domaine et des dates." },
		],
		toolLinks: [
			{ title: "Stage de fin d'études", text: "Voir le guide général.", href: "/stage-fin-etudes" },
			{ title: "Objet mail stage", text: "Soigner l'objet.", href: "/objet-mail-stage" },
			{ title: `Stage à ${city.name}`, text: "Page locale stage.", href: `/stage-${city.slug}` },
		],
		testimonial: {
			quote: `J'ai préparé mon CV et mes dates avant d'envoyer mes demandes à ${city.name}.`,
			name: "Étudiant IMTA",
			role: `Stage final à ${city.name}`,
		},
		faqs: [
			{
				question: `Comment trouver un stage de fin d'études à ${city.name} ?`,
				answer: `Prépare un CV ciblé, une liste d'entreprises de ${city.name}, un email court, tes dates et une relance propre.`,
			},
			{
				question: "Que dire si le sujet PFE n'est pas encore fixe ?",
				answer: "Explique ton domaine, tes compétences, tes dates et le type de mission que tu veux découvrir.",
			},
			{
				question: "Le CV doit-il mentionner le projet final ?",
				answer: "Oui si le projet montre des compétences utiles pour le stage visé.",
			},
		],
	};
}

function domainOrientationPage(domain: Domain): TrafficLandingPageConfig {
	return {
		path: `/orientation-${domain.slug}`,
		title: `Orientation ${domain.name}`,
		seoTitle: `Orientation ${domain.name} | IMTA Resume`,
		description: `Comprends les missions, compétences, stages et preuves à construire pour t'orienter vers ${domain.name}.`,
		hero: `Choisir ${domain.name}, c'est comprendre les missions avant le diplôme.`,
		heroTone: `Observe ${domain.context}, puis prépare les preuves qui rendront ton CV crédible.`,
		audience: `Pour étudiants qui envisagent ${domain.name}`,
		image: domain.image,
		searchIntents: [`orientation ${domain.name}`, `formation ${domain.name}`, `metier ${domain.name} maroc`],
		contentAngle: "Page d'orientation par domaine pour guider l'étudiant avant le CV.",
		benefits: [
			{ icon: domain.icon, title: "Métier compris", text: `Découvre les attentes liées à ${domain.name}.` },
			{ icon: GraduationCapIcon, title: "Formation utile", text: "Relie modules, ateliers et projets au domaine." },
			{ icon: BriefcaseIcon, title: "Stage anticipé", text: "Prépare les preuves que les recruteurs chercheront." },
		],
		steps: [
			{ title: "Comprendre les missions", text: domain.context },
			{ title: "Identifier les compétences", text: "Outils, méthodes, sécurité, relation ou organisation." },
			{ title: "Choisir les preuves", text: "Projet, atelier, stage, certificat ou réalisation." },
			{ title: "Préparer le CV", text: `Titre et compétences orientés ${domain.name}.` },
		],
		toolLinks: [
			{ title: `CV ${domain.name}`, text: "Construire le CV métier.", href: `/cv-${domain.slug}` },
			{ title: `Stage ${domain.name}`, text: "Préparer une demande de stage.", href: `/stage-${domain.slug}` },
			{ title: `Entretien ${domain.name}`, text: "Préparer les questions.", href: `/entretien-${domain.slug}` },
		],
		testimonial: {
			quote: `J'ai compris quelles preuves préparer avant de choisir ${domain.name}.`,
			name: "Étudiant IMTA",
			role: `Orientation ${domain.name}`,
		},
		faqs: [
			{
				question: `Comment savoir si ${domain.name} me convient ?`,
				answer: `Compare tes forces avec les missions liées à ${domain.context}, puis teste avec un projet ou un stage.`,
			},
			{
				question: `Quelles compétences préparer pour ${domain.name} ?`,
				answer: "Des compétences techniques, méthodes, outils, sécurité, communication et preuves de pratique.",
			},
			{
				question: "Quand commencer le CV ?",
				answer: "Dès le début de la formation, pour collecter projets, ateliers, stages et certificats.",
			},
		],
	};
}

function domainFormationPage(domain: Domain): TrafficLandingPageConfig {
	return {
		path: `/formation-${domain.slug}`,
		title: `Formation ${domain.name}`,
		seoTitle: `Formation ${domain.name} au Maroc | CV et stage`,
		description: `Prépare une formation ${domain.name} avec une logique CV, stage, compétences et entretien.`,
		hero: `Une formation ${domain.name} doit produire des preuves visibles.`,
		heroTone: `Relie les modules, ateliers, outils et stages à ${domain.context} pour construire un CV plus fort.`,
		audience: `Pour étudiants en formation ${domain.name}`,
		image: domain.image,
		searchIntents: [`formation ${domain.name}`, `cv formation ${domain.name}`, `stage formation ${domain.name}`],
		contentAngle: "Page formation par domaine pour capter les recherches d'étudiants et futurs inscrits.",
		benefits: [
			{ icon: domain.icon, title: "Domaine visible", text: `Montre les acquis liés à ${domain.name}.` },
			{ icon: FileTextIcon, title: "CV structuré", text: "Classe formation, compétences, projets et stages." },
			{ icon: ChatsCircleIcon, title: "Entretien préparé", text: "Explique les apprentissages avec des exemples." },
		],
		steps: [
			{ title: "Suivre les modules", text: `Note les notions importantes en ${domain.name}.` },
			{ title: "Garder les preuves", text: "Projet, atelier, outil, certificat, rapport ou photo de réalisation." },
			{ title: "Rédiger le CV", text: "Titre métier, profil, compétences et formation." },
			{ title: "Chercher le stage", text: "Email, CV PDF, disponibilités et relance." },
		],
		toolLinks: [
			{ title: `Orientation ${domain.name}`, text: "Comprendre le domaine.", href: `/orientation-${domain.slug}` },
			{ title: `CV ${domain.name}`, text: "Creer le CV metier.", href: `/cv-${domain.slug}` },
			{ title: `Stage ${domain.name}`, text: "Preparer la candidature.", href: `/stage-${domain.slug}` },
		],
		testimonial: {
			quote: `J'ai transforme ma formation ${domain.name} en competences visibles dans mon CV.`,
			name: "Etudiant IMTA",
			role: `Formation ${domain.name}`,
		},
		faqs: [
			{
				question: `Comment valoriser une formation ${domain.name} ?`,
				answer: `Ajoute les modules, outils, projets, stages et competences lies a ${domain.context}.`,
			},
			{
				question: "Que faire si je n'ai pas encore de stage ?",
				answer: "Valorise les ateliers, projets, outils, certificats et ta motivation a apprendre sur le terrain.",
			},
			{
				question: "Comment preparer l'entretien ?",
				answer: "Prepare ton pitch, deux projets, une difficulte et les bases techniques du domaine.",
			},
		],
	};
}

function cityDomainOrientationPage(city: City, domain: Domain): TrafficLandingPageConfig {
	return {
		path: `/orientation-${domain.slug}-${city.slug}`,
		title: `Orientation ${domain.name} à ${city.name}`,
		seoTitle: `Orientation ${domain.name} à ${city.name} | IMTA Resume`,
		description: `Comprends les missions, formations, stages et preuves à préparer pour t'orienter vers ${domain.name} à ${city.name}.`,
		hero: `Choisir ${domain.name} à ${city.name}, c'est relier ton projet aux opportunités locales.`,
		heroTone: `Combine les attentes de ${domain.name} avec les secteurs présents à ${city.name}: ${city.context}.`,
		audience: `Pour futurs étudiants intéressés par ${domain.name} à ${city.name}`,
		image: city.image,
		searchIntents: [
			`orientation ${domain.name} ${city.name}`,
			`formation ${domain.name} ${city.name}`,
			`stage ${domain.name} ${city.name}`,
		],
		contentAngle: "Page locale métier pour capter les recherches d'orientation avant l'inscription ou le stage.",
		benefits: [
			{
				icon: domain.icon,
				title: "Métier compris",
				text: `Découvre les missions liées à ${domain.name}: ${domain.context}.`,
			},
			{
				icon: MapPinIcon,
				title: "Ville prise en compte",
				text: `Adapte ton choix aux opportunités de ${city.name}.`,
			},
			{
				icon: FileTextIcon,
				title: "CV anticipé",
				text: "Sais quelles preuves collecter pendant la formation pour ton futur CV.",
			},
		],
		steps: [
			{ title: "Comprends le métier", text: domain.context },
			{ title: "Observe la ville", text: `${city.name}: ${city.context}.` },
			{ title: "Choisis les preuves", text: "Projet, atelier, stage, certificat, outil ou situation pratique." },
			{ title: "Prépare le CV", text: `Titre, compétences et objectif orientés ${domain.name}.` },
		],
		toolLinks: [
			{
				title: `Formation ${domain.name} à ${city.name}`,
				text: "Voir le parcours formation.",
				href: `/formation-${domain.slug}-${city.slug}`,
			},
			{
				title: `Stage ${domain.name} à ${city.name}`,
				text: "Préparer une demande locale.",
				href: `/stage-${domain.slug}-${city.slug}`,
			},
			{ title: `CV ${domain.name}`, text: "Construire un CV métier.", href: `/cv-${domain.slug}` },
		],
		testimonial: {
			quote: `J'ai compris comment relier ${domain.name} aux opportunités de ${city.name}.`,
			name: "Étudiant IMTA",
			role: `Orientation ${domain.name} ${city.name}`,
		},
		faqs: [
			{
				question: `Comment choisir ${domain.name} à ${city.name} ?`,
				answer: `Compare tes forces avec les missions de ${domain.name}, puis regarde les stages et entreprises liés à ${city.context}.`,
			},
			{
				question: "Faut-il déjà préparer un CV ?",
				answer:
					"Oui. Même avant le stage, un CV de départ aide à organiser formation, projets, langues et compétences.",
			},
			{
				question: "Quelle est la prochaine étape ?",
				answer: "Choisir un domaine, collecter des preuves et préparer une candidature adaptée à la ville.",
			},
		],
	};
}

function cityDomainFormationPage(city: City, domain: Domain): TrafficLandingPageConfig {
	return {
		path: `/formation-${domain.slug}-${city.slug}`,
		title: `Formation ${domain.name} à ${city.name}`,
		seoTitle: `Formation ${domain.name} à ${city.name} | CV, stage et insertion`,
		description: `Prépare une formation ${domain.name} à ${city.name} avec une logique CV, stage, compétences et entretien.`,
		hero: `Une formation ${domain.name} à ${city.name} doit produire des preuves visibles.`,
		heroTone: `Relie les modules, ateliers et stages à ${domain.context}, puis adapte ton dossier aux opportunités de ${city.name}.`,
		audience: `Pour étudiants en formation ${domain.name} à ${city.name}`,
		image: domain.image,
		searchIntents: [
			`formation ${domain.name} ${city.name}`,
			`cv ${domain.name} ${city.name}`,
			`stage ${domain.name} ${city.name}`,
		],
		contentAngle: "Page formation locale par métier pour attirer les futurs étudiants et les guider vers le CV.",
		benefits: [
			{
				icon: domain.icon,
				title: "Domaine visible",
				text: `Montre les acquis liés à ${domain.name}.`,
			},
			{
				icon: MapPinIcon,
				title: "Contexte local",
				text: `Relie ton dossier aux secteurs de ${city.name}: ${city.context}.`,
			},
			{
				icon: ChatsCircleIcon,
				title: "Entretien préparé",
				text: "Explique tes apprentissages avec des exemples courts et concrets.",
			},
		],
		steps: [
			{ title: "Suivre les modules", text: `Note les notions importantes en ${domain.name}.` },
			{ title: "Garder les preuves", text: "Projet, atelier, outil, certificat, rapport ou réalisation." },
			{ title: "Adapter à la ville", text: `Mets en avant les compétences utiles aux entreprises de ${city.name}.` },
			{ title: "Chercher le stage", text: "CV PDF, email court, disponibilités et relance." },
		],
		toolLinks: [
			{
				title: `Orientation ${domain.name} à ${city.name}`,
				text: "Comprendre le choix métier.",
				href: `/orientation-${domain.slug}-${city.slug}`,
			},
			{
				title: `Stage final ${domain.name} à ${city.name}`,
				text: "Préparer le PFE ou stage final.",
				href: `/stage-fin-etudes-${domain.slug}-${city.slug}`,
			},
			{
				title: `CV ${domain.name} à ${city.name}`,
				text: "Construire le CV local.",
				href: `/cv-${domain.slug}-${city.slug}`,
			},
		],
		testimonial: {
			quote: `Ma formation ${domain.name} est devenue plus claire quand je l'ai reliée aux entreprises de ${city.name}.`,
			name: "Étudiant IMTA",
			role: `Formation ${domain.name} ${city.name}`,
		},
		faqs: [
			{
				question: `Comment valoriser une formation ${domain.name} à ${city.name} ?`,
				answer: `Ajoute les modules, outils, projets, stages et compétences liés à ${domain.context}, puis adapte les exemples à ${city.name}.`,
			},
			{
				question: "Que faire si je n'ai pas encore de stage ?",
				answer: "Valorise les ateliers, projets, outils, certificats et ta motivation à apprendre sur le terrain.",
			},
			{
				question: "Comment préparer l'entretien ?",
				answer: "Prépare ton pitch, deux projets, une difficulté et les bases techniques du domaine.",
			},
		],
	};
}

function cityDomainStageFinEtudesPage(city: City, domain: Domain): TrafficLandingPageConfig {
	return {
		path: `/stage-fin-etudes-${domain.slug}-${city.slug}`,
		title: `Stage de fin d'études ${domain.name} à ${city.name}`,
		seoTitle: `Stage de fin d'études ${domain.name} à ${city.name} | IMTA Resume`,
		description: `Prépare une candidature de stage de fin d'études ${domain.name} à ${city.name}: CV, email, pitch et relance.`,
		hero: `Cherche ton stage final ${domain.name} à ${city.name} avec un dossier prêt.`,
		heroTone: `Ton CV doit relier ton projet, tes dates, tes compétences en ${domain.name} et les besoins des entreprises de ${city.name}.`,
		audience: `Pour étudiants en dernière année ${domain.name} à ${city.name}`,
		image: city.image,
		searchIntents: [
			`stage fin d'études ${domain.name} ${city.name}`,
			`pfe ${domain.name} ${city.name}`,
			`demande stage ${domain.name} ${city.name}`,
		],
		contentAngle: "Page locale métier pour capter les recherches de PFE et stage final.",
		benefits: [
			{
				icon: BriefcaseIcon,
				title: "Recherche ciblée",
				text: `Cible les entreprises de ${city.name} liées à ${domain.context}.`,
			},
			{
				icon: FileTextIcon,
				title: "CV final plus fort",
				text: "Mets en avant projet, outils, stages, compétences et disponibilités.",
			},
			{
				icon: TargetIcon,
				title: "Message clair",
				text: "Annonce dates, durée, domaine, ville et objectif de stage.",
			},
		],
		steps: [
			{ title: "Définir le stage", text: `Mission possible en ${domain.name}, dates, durée et ville.` },
			{ title: "Adapter le CV", text: `Relie ${domain.context} aux besoins de ${city.name}.` },
			{ title: "Écrire l'email", text: "Objet précis, message court, CV PDF et disponibilité." },
			{ title: "Relancer proprement", text: "Relance polie avec rappel du domaine et des dates." },
		],
		toolLinks: [
			{
				title: `CV ${domain.name} à ${city.name}`,
				text: "Aligner le CV avec le stage.",
				href: `/cv-${domain.slug}-${city.slug}`,
			},
			{
				title: `Stage ${domain.name} à ${city.name}`,
				text: "Voir la page stage locale.",
				href: `/stage-${domain.slug}-${city.slug}`,
			},
			{ title: "Objet mail stage", text: "Soigner l'objet d'envoi.", href: "/objet-mail-stage" },
		],
		testimonial: {
			quote: `J'ai préparé mon dossier ${domain.name} avant de contacter les entreprises de ${city.name}.`,
			name: "Étudiant IMTA",
			role: `Stage final ${domain.name} ${city.name}`,
		},
		faqs: [
			{
				question: `Comment trouver un stage final ${domain.name} à ${city.name} ?`,
				answer: `Prépare un CV ciblé, une liste d'entreprises de ${city.name}, un email court, tes dates et une relance propre.`,
			},
			{
				question: "Que dire si mon sujet n'est pas encore fixé ?",
				answer: "Explique ton domaine, tes compétences, tes dates et le type de mission que tu veux découvrir.",
			},
			{
				question: "Comment se démarquer ?",
				answer: "Montre un projet, un outil, une règle de sécurité, une méthode ou un résultat lié au domaine.",
			},
		],
	};
}

const priorityDomains = domains.slice(0, 10);

export const generatedTrafficLandingPages: TrafficLandingPageConfig[] = [
	...funnelPages,
	...objectivePages,
	...studentIntents.map(studentIntentPage),
	...cities.map(cityOrientationPage),
	...cities.map(cityFormationPage),
	...cities.map(cityStageFinEtudesPage),
	...domains.map(domainOrientationPage),
	...domains.map(domainFormationPage),
	...studentSegments.map(segmentCvPage),
	...studentSegments.map(segmentStagePage),
	...studentSegments.map(segmentInterviewPage),
	...cities.map(cityStagePage),
	...domains.map(domainCvPage),
	...domains.map(domainStagePage),
	...domains.map(domainInterviewPage),
	...cities.flatMap((city) => domains.map((domain) => cityDomainOrientationPage(city, domain))),
	...cities.flatMap((city) => domains.map((domain) => cityDomainFormationPage(city, domain))),
	...cities.flatMap((city) => domains.map((domain) => cityDomainStageFinEtudesPage(city, domain))),
	...domains.flatMap((domain) => studentSegments.map((segment) => domainSegmentCvPage(domain, segment))),
	...domains.flatMap((domain) => studentSegments.map((segment) => domainSegmentStagePage(domain, segment))),
	...domains.flatMap((domain) => studentSegments.map((segment) => domainSegmentInterviewPage(domain, segment))),
	...cities.flatMap((city) => studentSegments.map((segment) => citySegmentCvPage(city, segment))),
	...cities.flatMap((city) => studentSegments.map((segment) => citySegmentStagePage(city, segment))),
	...cities.flatMap((city) => studentSegments.map((segment) => citySegmentInterviewPage(city, segment))),
	...cities.flatMap((city) => priorityDomains.map((domain) => cityDomainCvPage(city, domain))),
	...cities.flatMap((city) => priorityDomains.map((domain) => cityDomainStagePage(city, domain))),
	...cities.flatMap((city) => priorityDomains.map((domain) => cityDomainInterviewPage(city, domain))),
];
