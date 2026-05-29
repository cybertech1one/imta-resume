import { Trans } from "@lingui/react/macro";
import type { Icon } from "@phosphor-icons/react";
import {
	ArrowRightIcon,
	BookOpenIcon,
	BriefcaseIcon,
	ChartBarIcon,
	ChatsCircleIcon,
	CheckCircleIcon,
	FileTextIcon,
	FirstAidKitIcon,
	GraduationCapIcon,
	LightbulbIcon,
	MagicWandIcon,
	ShieldCheckIcon,
	TargetIcon,
	UsersIcon,
} from "@phosphor-icons/react";
import { Link } from "@tanstack/react-router";
import {
	defaultSEO,
	generateCanonicalLink,
	generateFAQSchema,
	generateHowToSchema,
	generateMetaTags,
} from "@/utils/seo";
import { generatedTrafficLandingPages } from "./traffic-generated-pages";

const HERO_IMAGE = "/home/healthtech-student-hero.png";
const PAPER = "#f6fbfa";
const EMERALD = "#006b53";
const CYAN = "#00a8a6";

export type TrafficLandingPageConfig = {
	path: string;
	title: string;
	seoTitle: string;
	description: string;
	hero: string;
	heroTone: string;
	audience: string;
	image: string;
	imagePosition?: string;
	benefits: Array<{ icon: Icon; title: string; text: string }>;
	steps: Array<{ title: string; text: string }>;
	toolLinks: Array<{ title: string; text: string; href: string }>;
	testimonial: { quote: string; name: string; role: string };
	faqs: Array<{ question: string; answer: string }>;
	searchIntents?: string[];
	contentAngle?: string;
};

const coreTrafficLandingPages: TrafficLandingPageConfig[] = [
	{
		path: "/cv-etudiant",
		title: `CV étudiant gratuit`,
		seoTitle: `CV étudiant gratuit au Maroc | IMTA Resume`,
		description: `Crée un CV étudiant clair, professionnel et adapté aux stages même si tu as peu d'expérience.`,
		hero: `Ton premier stage commence avec un CV qui te représente.`,
		heroTone: `IMTA Resume transforme ta formation, tes stages, tes projets et tes compétences en un CV lisible pour les recruteurs.`,
		audience: `Pour les étudiants IMTA, stagiaires et jeunes diplômés`,
		image: "/home/tool-cv-intelligent.webp",
		benefits: [
			{
				icon: GraduationCapIcon,
				title: `Formation mise en avant`,
				text: `Présente ton diplôme, tes modules et tes projets avec des mots simples et professionnels.`,
			},
			{
				icon: BriefcaseIcon,
				title: `Stages mieux expliqués`,
				text: `Montre ce que tu as réellement appris pendant tes stages, même courts.`,
			},
			{
				icon: ShieldCheckIcon,
				title: `Format prêt recruteur`,
				text: `Utilise une structure propre, compatible ATS et facile à lire sur mobile ou PDF.`,
			},
		],
		steps: [
			{ title: `Choisis un modèle`, text: `Pars d'un modèle adapté à ton niveau et ton métier.` },
			{ title: `Ajoute ton parcours`, text: `Renseigne formation, stages, projets, langues et compétences.` },
			{ title: `Améliore avec l'IA`, text: `Reformule les phrases faibles et rends ton profil plus clair.` },
			{ title: `Télécharge ton PDF`, text: `Exporte ton CV et partage-le avec les entreprises.` },
		],
		toolLinks: [
			{ title: `Modèles CV`, text: `Des modèles propres pour étudiants et jeunes diplômés.`, href: "/#templates" },
			{ title: `Optimisation ATS`, text: `Des conseils pour passer les filtres de recrutement.`, href: "/dashboard" },
			{ title: `Guide CV`, text: `Des articles pour éviter les erreurs fréquentes.`, href: "/wiki" },
		],
		testimonial: {
			quote: `J'avais peu d'expérience, mais la plateforme m'a aidée à présenter mes stages et mes compétences proprement.`,
			name: "Amina R.",
			role: `Étudiante IMTA`,
		},
		faqs: [
			{
				question: `Que mettre dans un CV étudiant sans expérience ?`,
				answer: `Mets en avant ta formation, tes stages, tes projets, tes compétences techniques, tes langues et tes qualités professionnelles.`,
			},
			{
				question: `Puis-je exporter mon CV en PDF ?`,
				answer: `Oui, tu peux télécharger ton CV en PDF et l'envoyer directement aux recruteurs.`,
			},
			{
				question: `Les modèles sont-ils adaptés aux étudiants ?`,
				answer: `Oui, les modèles sont pensés pour présenter clairement un profil étudiant ou jeune diplômé.`,
			},
		],
	},
	{
		path: "/stage-maroc",
		title: `Stage au Maroc`,
		seoTitle: `Trouver un stage au Maroc | CV et préparation IMTA Resume`,
		description: `Prépare un dossier solide pour chercher un stage au Maroc avec un CV clair, des réponses d'entretien et des outils simples.`,
		hero: `Décroche ton stage avec une candidature prête à envoyer.`,
		heroTone: `Prépare ton CV, ton message de candidature et tes réponses d'entretien dans un même espace étudiant.`,
		audience: `Pour les étudiants qui cherchent leur premier stage`,
		image: "/home/tool-job-offers.webp",
		imagePosition: "object-[42%_center]",
		benefits: [
			{
				icon: TargetIcon,
				title: `Candidature ciblée`,
				text: `Adapte ton CV au stage visé et montre les compétences attendues par l'entreprise.`,
			},
			{
				icon: FileTextIcon,
				title: `Dossier plus clair`,
				text: `Structure ton parcours pour qu'un recruteur comprenne vite ton profil.`,
			},
			{
				icon: ChatsCircleIcon,
				title: `Entretien préparé`,
				text: `Travaille tes réponses avant l'appel ou l'entretien avec l'entreprise.`,
			},
		],
		steps: [
			{ title: `Définis le stage`, text: `Choisis le secteur, la ville et les compétences à montrer.` },
			{ title: `Prépare ton CV`, text: `Mets en avant formation, ateliers, projets et stages précédents.` },
			{ title: `Entraîne-toi`, text: `Prépare les questions courantes avant de rencontrer le recruteur.` },
			{ title: `Postule vite`, text: `Garde ton PDF prêt pour les offres et contacts d'entreprise.` },
		],
		toolLinks: [
			{ title: `CV intelligent`, text: `Crée un CV adapté au stage demandé.`, href: "/cv-etudiant" },
			{
				title: `Préparation entretien`,
				text: `Entraîne-toi aux questions de stage.`,
				href: "/preparation-entretien",
			},
			{ title: `Offres d'emploi`, text: `Organise ta recherche et tes candidatures.`, href: "/dashboard" },
		],
		testimonial: {
			quote: `J'ai envoyé un CV plus clair et j'ai su expliquer mon projet pendant l'entretien de stage.`,
			name: "Yassine E.",
			role: `Étudiant en maintenance`,
		},
		faqs: [
			{
				question: `Comment préparer une candidature de stage ?`,
				answer: `Prépare un CV ciblé, un court message de motivation et quelques réponses aux questions sur ta formation et ton projet.`,
			},
			{
				question: `Le CV doit-il tenir sur une page ?`,
				answer: `Pour un profil étudiant, une page claire suffit souvent. L'objectif est d'être lisible rapidement.`,
			},
			{
				question: `IMTA Resume aide-t-il pour l'entretien ?`,
				answer: `Oui, les outils d'entretien t'aident à structurer tes réponses et à gagner en confiance.`,
			},
		],
	},
	{
		path: "/preparation-entretien",
		title: `Préparation entretien`,
		seoTitle: `Préparation entretien stage et emploi | IMTA Resume`,
		description: `Prépare tes réponses d'entretien avec l'IA, gagne en confiance et montre clairement tes compétences.`,
		hero: `Arrive à l'entretien avec des réponses qui tiennent debout.`,
		heroTone: `Travaille les questions fréquentes, tes exemples concrets et ton pitch professionnel sans stress.`,
		audience: `Pour les entretiens de stage, alternance et premier emploi`,
		image: "/home/tool-interview-prep.webp",
		benefits: [
			{
				icon: ChatsCircleIcon,
				title: `Réponses structurées`,
				text: `Transforme tes idées en réponses courtes, claires et professionnelles.`,
			},
			{
				icon: LightbulbIcon,
				title: `Exemples concrets`,
				text: `Utilise tes ateliers, stages et projets pour prouver tes compétences.`,
			},
			{
				icon: CheckCircleIcon,
				title: `Plus de confiance`,
				text: `Répète avant l'entretien et arrive avec une meilleure préparation.`,
			},
		],
		steps: [
			{ title: `Choisis ton objectif`, text: `Stage, premier emploi ou entretien technique.` },
			{ title: `Prépare ton pitch`, text: `Explique qui tu es, ce que tu sais faire et ce que tu cherches.` },
			{ title: `Réponds aux questions`, text: `Travaille les questions fréquentes et les questions métier.` },
			{ title: `Corrige tes points faibles`, text: `Améliore les réponses trop longues ou trop vagues.` },
		],
		toolLinks: [
			{
				title: `Simulation entretien`,
				text: `Pratique avec des questions adaptées à ton profil.`,
				href: "/dashboard",
			},
			{ title: `Coaching carrière`, text: `Clarifie ton objectif avant l'entretien.`, href: "/metiers-techniques" },
			{ title: `CV étudiant`, text: `Aligne ton CV avec ce que tu vas dire.`, href: "/cv-etudiant" },
		],
		testimonial: {
			quote: `Je savais enfin comment parler de mes compétences sans réciter mon CV.`,
			name: "Nadia L.",
			role: "HSE",
		},
		faqs: [
			{
				question: `Quelles questions préparer pour un entretien de stage ?`,
				answer: `Prépare ton parcours, tes compétences techniques, tes motivations, tes disponibilités et un exemple de projet réalisé.`,
			},
			{
				question: `Comment répondre si je manque d'expérience ?`,
				answer: `Parle de tes ateliers, projets, stages d'observation, compétences pratiques et motivation à apprendre.`,
			},
			{
				question: `Puis-je m'entraîner plusieurs fois ?`,
				answer: `Oui, tu peux recommencer et améliorer tes réponses jusqu'à te sentir prêt.`,
			},
		],
	},
	{
		path: "/metiers-techniques",
		title: `Métiers techniques`,
		seoTitle: `CV pour métiers techniques au Maroc | IMTA Resume`,
		description: `Valorise tes compétences techniques, tes ateliers et tes certifications dans un CV clair pour les recruteurs.`,
		hero: `Montre ton vrai savoir-faire, pas seulement ton diplôme.`,
		heroTone: `Présente tes machines, outils, certifications, projets et expériences terrain avec une structure professionnelle.`,
		audience: `Pour maintenance, HSE, soudure, santé, BTP et métiers industriels`,
		image: "/home/tool-skills-assessment.webp",
		benefits: [
			{
				icon: ChartBarIcon,
				title: `Compétences visibles`,
				text: `Fais ressortir les outils, méthodes, normes et gestes professionnels que tu maîtrises.`,
			},
			{
				icon: ShieldCheckIcon,
				title: `Profil crédible`,
				text: `Ajoute certificats, ateliers, projets et preuves de pratique.`,
			},
			{
				icon: BriefcaseIcon,
				title: `Adapté aux offres`,
				text: `Réutilise les mots attendus dans les annonces de stage et d'emploi.`,
			},
		],
		steps: [
			{ title: `Liste tes compétences`, text: `Sépare compétences techniques, logiciels, sécurité et langues.` },
			{ title: `Ajoute des preuves`, text: `Relie chaque compétence à un projet, stage ou atelier.` },
			{ title: `Adapte le vocabulaire`, text: `Utilise des mots simples que les recruteurs reconnaissent.` },
			{ title: `Optimise le CV`, text: `Rends ton profil lisible pour les humains et les ATS.` },
		],
		toolLinks: [
			{ title: `Évaluation compétences`, text: `Identifie tes points forts et axes de progrès.`, href: "/dashboard" },
			{ title: `Optimisation ATS`, text: `Améliore les mots-clés de ton CV.`, href: "/dashboard" },
			{ title: `Trouver un stage`, text: `Prépare tes candidatures terrain.`, href: "/stage-maroc" },
		],
		testimonial: {
			quote: `L'outil m'a aidé à expliquer mes compétences techniques avec des mots compréhensibles par les entreprises.`,
			name: "Karim B.",
			role: `Soudure industrielle`,
		},
		faqs: [
			{
				question: `Comment présenter des compétences techniques ?`,
				answer: `Regroupe-les par familles : outils, méthodes, sécurité, logiciels, langues et expériences pratiques.`,
			},
			{
				question: `Dois-je mettre les certifications ?`,
				answer: `Oui, les certifications et attestations renforcent la crédibilité du profil technique.`,
			},
			{
				question: `Puis-je adapter mon CV à chaque métier ?`,
				answer: `Oui, tu peux ajuster les sections, les mots-clés et le modèle selon le poste visé.`,
			},
		],
	},
	{
		path: "/ecoles-formateurs",
		title: `Écoles et formateurs`,
		seoTitle: `Outil CV pour écoles et formateurs | IMTA Resume`,
		description: `Aidez les étudiants à préparer des CV professionnels, des entretiens et des candidatures cohérentes.`,
		hero: `Montrez aux étudiants que l'école les accompagne jusqu'à l'emploi.`,
		heroTone: `IMTA Resume donne aux formateurs un support simple pour accompagner les étudiants vers le stage et l'emploi.`,
		audience: `Pour écoles, centres de formation et formateurs métiers`,
		image: "/home/tool-career-coaching.webp",
		benefits: [
			{
				icon: UsersIcon,
				title: `Accompagnement clair`,
				text: `Un parcours simple pour guider les étudiants étape par étape.`,
			},
			{
				icon: BookOpenIcon,
				title: `Support pédagogique`,
				text: `Des pages et outils réutilisables en atelier CV ou préparation entretien.`,
			},
			{
				icon: TargetIcon,
				title: `Insertion renforcée`,
				text: `Des candidatures plus propres pour les stages et premiers emplois.`,
			},
		],
		steps: [
			{ title: `Présenter les outils`, text: `Montrez aux étudiants comment créer leur premier CV.` },
			{ title: `Organiser un atelier`, text: `Utilisez les modèles pour travailler chaque section du CV.` },
			{ title: `Préparer l'entretien`, text: `Entraînez les étudiants à expliquer leurs compétences.` },
			{ title: `Suivre les candidatures`, text: `Encouragez l'export PDF et la mise à jour régulière.` },
		],
		toolLinks: [
			{ title: `CV étudiant`, text: `Une page claire à partager avec les étudiants.`, href: "/cv-etudiant" },
			{
				title: `Préparation entretien`,
				text: `Un support pour travailler les réponses.`,
				href: "/preparation-entretien",
			},
			{
				title: `Métiers techniques`,
				text: `Une approche orientée compétences terrain.`,
				href: "/metiers-techniques",
			},
		],
		testimonial: {
			quote: `Les étudiants arrivent avec un CV plus propre et comprennent mieux comment parler de leur formation.`,
			name: "Équipe IMTA",
			role: `Accompagnement carrière`,
		},
		faqs: [
			{
				question: `Peut-on utiliser IMTA Resume en atelier ?`,
				answer: `Oui, les pages et outils peuvent servir de support pour des ateliers CV, entretien et recherche de stage.`,
			},
			{
				question: `Les étudiants peuvent-ils travailler seuls ?`,
				answer: `Oui, le parcours est simple et peut être utilisé en autonomie après une première présentation.`,
			},
			{
				question: `L'outil est-il gratuit ?`,
				answer: `Oui, IMTA Resume garde les fonctionnalités essentielles gratuites pour les étudiants.`,
			},
		],
	},
	{
		path: "/imta-etudiants",
		title: `IMTA pour les étudiants`,
		seoTitle: `Comment IMTA aide ses étudiants | IMTA Resume`,
		description: `Découvrez comment IMTA Resume accompagne les étudiants dans leur CV, leurs entretiens et leurs candidatures.`,
		hero: `Voici comment IMTA aide ses étudiants à passer à l'action.`,
		heroTone: `Le CV n'est pas seulement un document : c'est une étape concrète pour transformer la formation en opportunité.`,
		audience: `Pour futurs étudiants, familles et partenaires`,
		image: HERO_IMAGE,
		benefits: [
			{
				icon: GraduationCapIcon,
				title: `Formation valorisée`,
				text: `Chaque étudiant apprend à présenter son parcours et ses compétences clairement.`,
			},
			{
				icon: MagicWandIcon,
				title: `Outils modernes`,
				text: `L'IA aide à améliorer les formulations, préparer l'entretien et gagner du temps.`,
			},
			{
				icon: BriefcaseIcon,
				title: `Orientation emploi`,
				text: `Les étudiants préparent des documents directement utiles pour stages et emplois.`,
			},
		],
		steps: [
			{ title: `Créer son profil`, text: `L'étudiant renseigne formation, compétences et expériences.` },
			{ title: `Améliorer son CV`, text: `Les suggestions rendent le document plus clair et plus professionnel.` },
			{ title: `Préparer l'entretien`, text: `L'étudiant s'entraîne avant de rencontrer une entreprise.` },
			{ title: `Passer à l'action`, text: `Le CV est prêt à être envoyé ou partagé.` },
		],
		toolLinks: [
			{ title: `Pour étudiants`, text: `Créer un CV clair dès le début du parcours.`, href: "/cv-etudiant" },
			{ title: `Pour stages`, text: `Préparer les candidatures vers les entreprises.`, href: "/stage-maroc" },
			{ title: `Pour écoles`, text: `Découvrir l'approche pédagogique.`, href: "/ecoles-formateurs" },
		],
		testimonial: {
			quote: `IMTA Resume montre concrètement comment l'école aide les étudiants à se préparer au marché.`,
			name: "IMTA Resume",
			role: `Initiative étudiant`,
		},
		faqs: [
			{
				question: `Pourquoi IMTA propose un outil CV ?`,
				answer: `Parce que la réussite professionnelle commence par une candidature claire, lisible et adaptée au marché.`,
			},
			{
				question: `L'outil remplace-t-il l'accompagnement humain ?`,
				answer: `Non. Il complète le travail des formateurs et aide l'étudiant à progresser plus vite.`,
			},
			{
				question: `Les futurs étudiants peuvent-ils voir l'initiative ?`,
				answer: `Oui, ces pages montrent comment IMTA accompagne concrètement ses étudiants vers l'emploi.`,
			},
		],
	},
];

export const trafficLandingPages: TrafficLandingPageConfig[] = [
	...coreTrafficLandingPages,
	...generatedTrafficLandingPages,
];

export const trafficLandingPageMap = Object.fromEntries(trafficLandingPages.map((page) => [page.path, page]));

export function getTrafficLandingPage(path: string) {
	const page = trafficLandingPageMap[path];
	if (!page) throw new Error(`Unknown landing page: ${path}`);
	return page;
}

export function findTrafficLandingPage(path: string) {
	return trafficLandingPageMap[path];
}

export const featuredTrafficLandingPages = [
	"/orientation-apres-bac",
	"/formation-professionnelle-maroc",
	"/cv-sans-experience",
	"/lettre-motivation-stage",
	"/email-candidature-stage",
	"/linkedin-etudiant",
	"/stage-fin-etudes",
	"/questions-entretien-stage",
	"/stage-casablanca",
	"/stage-tanger",
	"/cv-hse",
	"/stage-maintenance-industrielle",
	"/entretien-sante",
	"/stage-hse-casablanca",
	"/stage-logistique-tanger",
	"/parents-etudiants-imta",
	"/atelier-cv-etudiants",
]
	.map((path) => findTrafficLandingPage(path))
	.filter(Boolean) as TrafficLandingPageConfig[];

function canonicalUrl(path: string) {
	const appUrl = (typeof process !== "undefined" ? process.env.APP_URL : undefined) ?? "https://imta.ma/";
	return new URL(path, appUrl).toString();
}

export function trafficLandingHead(page: TrafficLandingPageConfig) {
	const url = canonicalUrl(page.path);

	return {
		links: [generateCanonicalLink(url)],
		meta: generateMetaTags({
			title: page.seoTitle,
			description: page.description,
			image: `${new URL("/", url).toString()}opengraph/banner.jpg`,
			url,
			type: "article",
			siteName: defaultSEO.appName,
		}),
		scripts: [
			{
				type: "application/ld+json",
				children: JSON.stringify(generateFAQSchema(page.faqs)),
			},
			{
				type: "application/ld+json",
				children: JSON.stringify(
					generateHowToSchema({
						name: page.hero,
						description: page.description,
						steps: page.steps.map((step) => ({ name: step.title, text: step.text })),
					}),
				),
			},
		],
	};
}

const campaignHooks = [
	{
		title: `Je veux un CV qui donne envie de m'appeler`,
		text: `Transforme ta formation, tes stages et tes projets en un CV clair.`,
		image: "/home/tool-cv-intelligent.webp",
		href: "/cv-etudiant",
		icon: FileTextIcon,
	},
	{
		title: `Je cherche un stage et je veux être prêt`,
		text: `Prépare un dossier propre avant d'envoyer tes candidatures.`,
		image: "/home/tool-job-offers.webp",
		href: "/stage-maroc",
		icon: BriefcaseIcon,
	},
	{
		title: `Je dois réussir mon entretien`,
		text: `Entraîne-toi à parler de tes compétences avec plus de confiance.`,
		image: "/home/tool-interview-prep.webp",
		href: "/preparation-entretien",
		icon: ChatsCircleIcon,
	},
	{
		title: `Je choisis mon orientation après le bac`,
		text: `Compare les formations, les métiers et les stages avant de t'engager.`,
		image: "/home/student-career-workshop.webp",
		href: "/orientation-apres-bac",
		icon: GraduationCapIcon,
	},
];

const studentObjectives = [
	{ title: `Orientation après bac`, href: "/orientation-apres-bac", image: "/home/student-career-workshop.webp" },
	{ title: `CV étudiant`, href: "/cv-etudiant", image: "/home/tool-cv-intelligent.webp" },
	{ title: `Trouver un stage`, href: "/stage-maroc", image: "/home/tool-job-offers.webp" },
	{ title: `Préparer l'entretien`, href: "/preparation-entretien", image: "/home/tool-interview-prep.webp" },
	{ title: `Métiers techniques`, href: "/metiers-techniques", image: "/home/tool-skills-assessment.webp" },
	{ title: `Écoles & formateurs`, href: "/ecoles-formateurs", image: "/home/tool-career-coaching.webp" },
	{ title: `IMTA aide ses étudiants`, href: "/imta-etudiants", image: HERO_IMAGE },
];

const heroSignals = [`CV prêt recruteur`, `Entretien guidé`, `Marché marocain`];
const heroMetrics = [
	{ label: `Score ATS`, value: `92`, text: `Lisibilité forte`, icon: ShieldCheckIcon },
	{ label: `Plan entretien`, value: `8/10`, text: `Réponses prêtes`, icon: ChatsCircleIcon },
	{ label: `Parcours`, value: `4 étapes`, text: `Action claire`, icon: TargetIcon },
];

function LandingHero({ page }: { page: TrafficLandingPageConfig }) {
	const secondaryHref = page.path === "/preparation-entretien" ? "#plan" : "/preparation-entretien";

	return (
		<section className="relative isolate overflow-hidden bg-[#f7fbfa] pt-20">
			<div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_18%_18%,rgba(0,168,166,0.13),transparent_30%),radial-gradient(circle_at_78%_12%,rgba(0,107,83,0.1),transparent_26%),linear-gradient(180deg,#ffffff_0%,#f6fbfa_70%,#ffffff_100%)]" />
			<div
				aria-hidden="true"
				className="absolute inset-x-0 top-20 -z-10 h-px bg-gradient-to-r from-transparent via-emerald-700/20 to-transparent"
			/>

			<div className="mx-auto grid min-h-[690px] max-w-7xl gap-10 px-6 py-14 lg:grid-cols-[0.92fr_1.08fr] lg:px-10 lg:py-20">
				<div className="flex items-center">
					<div className="max-w-3xl">
						<div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-950/10 bg-white px-4 py-2 font-semibold text-emerald-950 text-sm shadow-sm">
							<FirstAidKitIcon aria-hidden="true" className="size-4 text-cyan-600" weight="duotone" />
							<span>{page.audience}</span>
						</div>
						<h1 className="font-display text-5xl text-zinc-950 leading-[0.98] sm:text-6xl lg:text-[5.35rem]">
							{page.hero}
						</h1>
						<p className="mt-7 max-w-2xl text-lg text-zinc-600 leading-8 md:text-xl">{page.heroTone}</p>

						<div className="mt-7 flex flex-wrap gap-2.5">
							{heroSignals.map((signal) => (
								<span
									key={signal}
									className="inline-flex items-center gap-2 rounded-full border border-emerald-950/10 bg-white px-3 py-2 font-medium text-emerald-950 text-sm"
								>
									<CheckCircleIcon aria-hidden="true" className="size-4 text-cyan-600" weight="fill" />
									{signal}
								</span>
							))}
						</div>

						<div className="mt-10 flex flex-col gap-4 sm:flex-row">
							<Link
								to="/dashboard"
								className="inline-flex h-14 items-center justify-center gap-2 rounded-xl bg-[linear-gradient(135deg,#006b53,#00a88a)] px-7 font-semibold text-base text-white shadow-[0_22px_44px_-26px_rgba(0,107,83,0.95)] transition-transform hover:-translate-y-0.5"
							>
								<Trans>Créer mon CV</Trans>
								<ArrowRightIcon className="size-5" aria-hidden="true" />
							</Link>

							<a
								href={secondaryHref}
								className="inline-flex h-14 items-center justify-center rounded-xl border border-emerald-950/15 bg-white px-7 font-semibold text-base text-zinc-900 shadow-sm transition-colors hover:border-emerald-700 hover:text-emerald-800"
							>
								<Trans>Préparer mon entretien</Trans>
							</a>
						</div>
					</div>
				</div>

				<div className="relative min-h-[520px]">
					<img
						src={HERO_IMAGE}
						alt=""
						aria-hidden="true"
						className="absolute inset-0 size-full rounded-[2rem] object-cover object-center shadow-[0_34px_90px_-58px_rgba(0,56,44,0.8)]"
						fetchPriority="high"
						decoding="async"
						width={1792}
						height={1024}
					/>
					<div
						aria-hidden="true"
						className="absolute inset-y-0 left-0 w-2/5 rounded-l-[2rem] bg-gradient-to-r from-[#f7fbfa] via-[#f7fbfa]/74 to-transparent"
					/>
					<div className="absolute top-5 left-5 max-w-[18rem] rounded-2xl border border-white/75 bg-white/90 p-4 shadow-[0_20px_56px_-34px_rgba(0,42,35,0.72)] backdrop-blur-xl">
						<div className="mb-3 flex items-center justify-between gap-4">
							<p className="font-semibold text-zinc-950">
								<Trans>Career health score</Trans>
							</p>
							<span className="rounded-full bg-cyan-50 px-2 py-1 font-semibold text-[11px] text-cyan-700">
								<Trans>Live</Trans>
							</span>
						</div>
						<div className="flex items-end gap-3">
							<p className="font-display text-5xl text-emerald-800 leading-none">94</p>
							<p className="pb-1 text-sm text-zinc-500 leading-5">
								<Trans>Dossier clair, ciblé et prêt à envoyer.</Trans>
							</p>
						</div>
						<div className="mt-4 h-2 rounded-full bg-emerald-50">
							<div className="h-2 w-[84%] rounded-full bg-[linear-gradient(90deg,#006b53,#00a8a6)]" />
						</div>
					</div>
					<div className="absolute right-5 bottom-5 hidden w-[min(30rem,calc(100%-2.5rem))] gap-3 sm:grid sm:grid-cols-3">
						{heroMetrics.map((metric) => {
							const MetricIcon = metric.icon;

							return (
								<div
									key={metric.label}
									className="rounded-2xl border border-white/70 bg-white/88 p-4 shadow-[0_18px_50px_-30px_rgba(0,42,35,0.7)] backdrop-blur-xl"
								>
									<MetricIcon aria-hidden="true" className="mb-3 size-5 text-emerald-800" weight="duotone" />
									<p className="font-bold text-2xl text-zinc-950">{metric.value}</p>
									<p className="font-semibold text-emerald-900 text-xs">{metric.label}</p>
									<p className="mt-1 text-[11px] text-zinc-500">{metric.text}</p>
								</div>
							);
						})}
					</div>
				</div>
			</div>
		</section>
	);
}

function LandingSearchIntent({ page }: { page: TrafficLandingPageConfig }) {
	const intents = page.searchIntents ?? [
		"cv étudiant",
		"stage au maroc",
		"préparation entretien",
		"lettre de motivation",
	];

	return (
		<section className="border-emerald-950/10 border-y bg-white/90 py-8 backdrop-blur">
			<div className="mx-auto grid max-w-7xl gap-6 px-6 lg:grid-cols-[0.86fr_1.14fr] lg:items-center lg:px-10">
				<div>
					<p className="font-semibold text-emerald-900 text-sm">
						<Trans>Ce que les étudiants cherchent vraiment</Trans>
					</p>
					<p className="mt-2 max-w-xl text-zinc-600 leading-7">
						{page.contentAngle ?? (
							<Trans>Une page pensée pour une recherche précise, avec un chemin clair vers le CV.</Trans>
						)}
					</p>
				</div>
				<div className="flex flex-wrap gap-3">
					{intents.map((intent) => (
						<span
							key={intent}
							className="inline-flex min-h-11 items-center rounded-full border border-emerald-900/12 bg-[#f3faf8] px-4 font-semibold text-emerald-950 text-sm shadow-sm"
						>
							<span className="mr-2 size-1.5 rounded-full" style={{ backgroundColor: CYAN }} />
							{intent}
						</span>
					))}
				</div>
			</div>
		</section>
	);
}

function HookCards() {
	return (
		<section className="relative overflow-hidden py-16 md:py-20" style={{ background: PAPER }}>
			<div
				aria-hidden="true"
				className="pointer-events-none absolute inset-y-0 left-0 w-40 opacity-[0.04]"
				style={{
					backgroundImage:
						"linear-gradient(45deg, transparent 46%, currentColor 47%, currentColor 53%, transparent 54%)",
					backgroundSize: "28px 28px",
					color: EMERALD,
				}}
			/>
			<div className="relative mx-auto max-w-7xl px-6 lg:px-10">
				<div className="mb-10 max-w-3xl">
					<h2 className="font-display text-4xl text-zinc-950 leading-tight md:text-5xl">
						<Trans>Choisis ton objectif. On t'aide à passer à l'action.</Trans>
					</h2>
					<p className="mt-4 text-zinc-600 leading-7">
						<Trans>Ces pages sont faites pour accrocher les étudiants au bon moment : CV, stage ou entretien.</Trans>
					</p>
				</div>

				<div className="grid gap-5 lg:grid-cols-3">
					{campaignHooks.map((hook) => {
						const HookIcon = hook.icon;

						return (
							<a
								key={hook.href}
								href={hook.href}
								className="group overflow-hidden rounded-2xl border border-emerald-950/10 bg-white shadow-[0_24px_64px_-52px_rgba(0,74,59,0.74)] transition-all hover:-translate-y-1 hover:border-emerald-700/35"
							>
								<div className="aspect-[16/10] overflow-hidden bg-zinc-100">
									<img
										src={hook.image}
										alt=""
										aria-hidden="true"
										loading="lazy"
										decoding="async"
										width={980}
										height={612}
										className="size-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
									/>
								</div>
								<div className="p-5">
									<div className="mb-4 flex size-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-800">
										<HookIcon aria-hidden="true" className="size-5" weight="duotone" />
									</div>
									<h3 className="font-semibold text-xl text-zinc-950">{hook.title}</h3>
									<p className="mt-3 text-[15px] text-zinc-600 leading-6">{hook.text}</p>
									<span className="mt-5 inline-flex items-center gap-2 font-semibold text-emerald-800">
										<Trans>Commencer</Trans>
										<ArrowRightIcon aria-hidden="true" className="size-4" />
									</span>
								</div>
							</a>
						);
					})}
				</div>
			</div>
		</section>
	);
}

function LandingJourney({ page }: { page: TrafficLandingPageConfig }) {
	return (
		<section id="plan" className="bg-white py-16 md:py-20">
			<div className="mx-auto max-w-7xl px-6 lg:px-10">
				<div className="mb-10 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
					<div className="max-w-3xl">
						<p className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-900/10 bg-[#f3faf8] px-3 py-1.5 font-semibold text-emerald-900 text-sm">
							<FirstAidKitIcon aria-hidden="true" className="size-4 text-cyan-600" weight="duotone" />
							{page.audience}
						</p>
						<h2 className="font-display text-4xl text-zinc-950 leading-tight md:text-5xl">
							<Trans>De la formation à la candidature, sans rester bloqué.</Trans>
						</h2>
					</div>
					<p className="max-w-md text-zinc-600 leading-7">{page.description}</p>
				</div>

				<div className="grid gap-5 md:grid-cols-4">
					{page.steps.map((step, index) => (
						<article
							key={step.title}
							className="rounded-2xl border border-emerald-950/10 bg-white p-5 shadow-[0_18px_56px_-50px_rgba(0,74,59,0.66)]"
						>
							<div className="mb-6 flex items-start justify-between gap-4">
								<div className="flex size-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-800">
									<CheckCircleIcon aria-hidden="true" className="size-6" weight="duotone" />
								</div>
								<span className="font-display text-4xl text-zinc-200 leading-none">
									{String(index + 1).padStart(2, "0")}
								</span>
							</div>
							<h3 className="mb-3 font-semibold text-lg text-zinc-950">{step.title}</h3>
							<p className="text-[15px] text-zinc-600 leading-6">{step.text}</p>
						</article>
					))}
				</div>
			</div>
		</section>
	);
}

function LandingBenefits({ page }: { page: TrafficLandingPageConfig }) {
	return (
		<section className="bg-[linear-gradient(135deg,#063b32,#007963)] py-16 text-white md:py-20">
			<div className="mx-auto max-w-7xl px-6 lg:px-10">
				<div className="mb-10 max-w-3xl">
					<p className="mb-4 font-semibold text-cyan-100 text-sm">
						<Trans>Ce que l'étudiant gagne</Trans>
					</p>
					<h2 className="font-display text-4xl leading-tight md:text-5xl">
						<Trans>Un déclic concret, pas seulement une page de plus.</Trans>
					</h2>
				</div>

				<div className="grid gap-5 md:grid-cols-3">
					{page.benefits.map((benefit) => {
						const BenefitIcon = benefit.icon;

						return (
							<article
								key={benefit.title}
								className="rounded-2xl border border-white/16 bg-white/10 p-6 shadow-[0_24px_70px_-50px_rgba(0,0,0,0.55)] backdrop-blur"
							>
								<div className="mb-5 flex size-11 items-center justify-center rounded-xl bg-white/12 text-cyan-100">
									<BenefitIcon aria-hidden="true" className="size-6" weight="duotone" />
								</div>
								<h3 className="mb-3 font-semibold text-lg text-white">{benefit.title}</h3>
								<p className="text-[15px] text-white/70 leading-6">{benefit.text}</p>
							</article>
						);
					})}
				</div>
			</div>
		</section>
	);
}

export function StudentHookLinks() {
	return (
		<section id="student-hooks" className="bg-white py-16 md:py-20">
			<div className="mx-auto max-w-7xl px-6 lg:px-10">
				<div className="mx-auto mb-10 max-w-3xl text-center">
					<p className="mb-4 font-semibold text-emerald-900 text-sm">
						<Trans>Choisis ton objectif</Trans>
					</p>
					<h2 className="font-display text-4xl text-zinc-950 leading-tight md:text-5xl">
						<Trans>Une porte d'entrée pour chaque étape de ton parcours.</Trans>
					</h2>
				</div>

				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{studentObjectives.map((objective) => (
						<a
							key={objective.href}
							href={objective.href}
							className="group grid grid-cols-[7rem_1fr] overflow-hidden rounded-2xl border border-emerald-950/10 bg-white shadow-[0_16px_52px_-48px_rgba(0,74,59,0.62)] transition-all hover:-translate-y-0.5 hover:border-emerald-800/35"
						>
							<img
								src={objective.image}
								alt=""
								aria-hidden="true"
								loading="lazy"
								decoding="async"
								width={280}
								height={220}
								className="h-full min-h-28 w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
							/>
							<div className="flex items-center justify-between gap-3 p-4">
								<p className="font-semibold text-zinc-950">{objective.title}</p>
								<ArrowRightIcon
									aria-hidden="true"
									className="size-4 shrink-0 text-emerald-800 transition-transform group-hover:translate-x-1"
								/>
							</div>
						</a>
					))}
				</div>
			</div>
		</section>
	);
}

export function PublicPageDiscovery() {
	return (
		<section className="bg-[#f6fbfa] py-16 md:py-20">
			<div className="mx-auto max-w-7xl px-6 lg:px-10">
				<div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
					<div>
						<p className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-900/10 bg-white px-3 py-1.5 font-semibold text-emerald-900 text-sm shadow-sm">
							<MagicWandIcon aria-hidden="true" className="size-4 text-cyan-600" weight="duotone" />
							<Trans>Pages publiques pour attirer les étudiants</Trans>
						</p>
						<h2 className="font-display text-4xl text-zinc-950 leading-tight md:text-5xl">
							<Trans>Des portes d'entrée pour chaque recherche importante.</Trans>
						</h2>
						<p className="mt-5 text-zinc-600 leading-7">
							<Trans>
								CV sans expérience, stage par ville, entretien par métier, lettre de motivation et profil LinkedIn :
								chaque page répond à une intention concrète.
							</Trans>
						</p>
						<div className="mt-8 overflow-hidden rounded-2xl border border-emerald-950/10 bg-white shadow-[0_24px_64px_-52px_rgba(0,74,59,0.72)]">
							<img
								src="/home/public-pages-morocco-hub.webp"
								alt=""
								aria-hidden="true"
								loading="lazy"
								decoding="async"
								width={1440}
								height={810}
								className="aspect-[16/10] size-full object-cover"
							/>
						</div>
					</div>

					<div className="grid gap-3 sm:grid-cols-2">
						{featuredTrafficLandingPages.map((page) => (
							<a
								key={page.path}
								href={page.path}
								className="group grid grid-cols-[4.75rem_1fr] overflow-hidden rounded-2xl border border-emerald-950/10 bg-white shadow-[0_16px_52px_-48px_rgba(0,74,59,0.62)] transition-all hover:-translate-y-0.5 hover:border-emerald-700/35"
							>
								<img
									src={page.image}
									alt=""
									aria-hidden="true"
									loading="lazy"
									decoding="async"
									width={160}
									height={130}
									className="h-full min-h-20 w-full object-cover"
								/>
								<div className="flex items-center justify-between gap-3 p-4">
									<div>
										<p className="font-semibold text-zinc-950">{page.title}</p>
										<p className="mt-1 line-clamp-1 text-xs text-zinc-500">{page.audience}</p>
									</div>
									<ArrowRightIcon
										aria-hidden="true"
										className="size-4 shrink-0 text-emerald-800 transition-transform group-hover:translate-x-1"
									/>
								</div>
							</a>
						))}
					</div>
				</div>

				<div className="mt-9 rounded-2xl border border-emerald-950/10 bg-white p-5 text-sm text-zinc-600 leading-6 shadow-[0_16px_52px_-48px_rgba(0,74,59,0.62)]">
					Le système regroupe {trafficLandingPages.length}+ pages utiles sans copier-coller: pages par objectif, ville,
					métier, orientation, entretien et stage local.
				</div>
			</div>
		</section>
	);
}

function LandingProof({ page }: { page: TrafficLandingPageConfig }) {
	return (
		<section className="bg-white py-16 md:py-20">
			<div className="mx-auto grid max-w-7xl gap-8 px-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:px-10">
				<div className="overflow-hidden rounded-[2rem] border border-emerald-950/10 bg-zinc-100 shadow-[0_28px_78px_-58px_rgba(0,74,59,0.72)]">
					<img
						src={page.image}
						alt=""
						aria-hidden="true"
						loading="lazy"
						decoding="async"
						width={980}
						height={735}
						className={`aspect-[4/3] size-full object-cover ${page.imagePosition ?? ""}`}
					/>
				</div>
				<div>
					<p className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-900/10 bg-[#f3faf8] px-3 py-1.5 font-semibold text-emerald-900 text-sm">
						<ShieldCheckIcon aria-hidden="true" className="size-4 text-cyan-600" weight="duotone" />
						<Trans>La preuve IMTA</Trans>
					</p>
					<h2 className="font-display text-4xl text-zinc-950 leading-tight md:text-5xl">
						<Trans>On montre aux étudiants que l'école les aide vraiment à avancer.</Trans>
					</h2>
					<blockquote className="mt-8 rounded-2xl border border-emerald-950/10 bg-[#f6fbfa] p-6">
						<p className="text-lg text-zinc-700 leading-8">"{page.testimonial.quote}"</p>
						<footer className="mt-5 border-emerald-950/10 border-t pt-4">
							<p className="font-semibold text-zinc-950">{page.testimonial.name}</p>
							<p className="text-sm text-zinc-500">{page.testimonial.role}</p>
						</footer>
					</blockquote>
				</div>
			</div>
		</section>
	);
}

function LandingTools({ page }: { page: TrafficLandingPageConfig }) {
	return (
		<section className="py-16 md:py-20" style={{ background: PAPER }}>
			<div className="mx-auto max-w-7xl px-6 lg:px-10">
				<div className="mb-10 max-w-3xl">
					<p className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-900/10 bg-white px-3 py-1.5 font-semibold text-emerald-900 text-sm shadow-sm">
						<MagicWandIcon aria-hidden="true" className="size-4 text-cyan-600" weight="duotone" />
						<Trans>Outils liés</Trans>
					</p>
					<h2 className="font-display text-4xl text-zinc-950 leading-tight md:text-5xl">
						<Trans>Continue avec les bons outils IMTA Resume.</Trans>
					</h2>
				</div>

				<div className="grid gap-5 md:grid-cols-3">
					{page.toolLinks.map((tool) => (
						<a
							key={tool.title}
							href={tool.href}
							className="rounded-2xl border border-emerald-950/10 bg-white p-6 shadow-[0_18px_56px_-50px_rgba(0,74,59,0.66)] transition-all hover:-translate-y-1 hover:border-emerald-800/35"
						>
							<h3 className="mb-3 font-semibold text-lg text-zinc-950">{tool.title}</h3>
							<p className="text-[15px] text-zinc-600 leading-6">{tool.text}</p>
							<span className="mt-6 inline-flex items-center gap-2 font-semibold text-emerald-800">
								<Trans>Ouvrir</Trans>
								<ArrowRightIcon aria-hidden="true" className="size-4" />
							</span>
						</a>
					))}
				</div>
			</div>
		</section>
	);
}

function LandingFAQ({ page }: { page: TrafficLandingPageConfig }) {
	return (
		<section className="bg-white py-16 md:py-20">
			<div className="mx-auto max-w-7xl px-6 lg:px-10">
				<div className="mb-10 max-w-3xl">
					<p className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-900/10 bg-[#f3faf8] px-3 py-1.5 font-semibold text-emerald-900 text-sm">
						<LightbulbIcon aria-hidden="true" className="size-4 text-cyan-600" weight="duotone" />
						<Trans>Questions fréquentes</Trans>
					</p>
					<h2 className="font-display text-4xl text-zinc-950 leading-tight md:text-5xl">
						<Trans>Les réponses avant de commencer.</Trans>
					</h2>
				</div>

				<div className="grid gap-4 lg:grid-cols-3">
					{page.faqs.map((faq) => (
						<article
							key={faq.question}
							className="rounded-2xl border border-emerald-950/10 bg-white p-5 shadow-[0_16px_52px_-48px_rgba(0,74,59,0.62)]"
						>
							<h3 className="mb-3 font-semibold text-zinc-950">{faq.question}</h3>
							<p className="text-[15px] text-zinc-600 leading-6">{faq.answer}</p>
						</article>
					))}
				</div>
			</div>
		</section>
	);
}

function LandingCTA() {
	return (
		<section className="bg-white px-6 py-16 lg:px-10">
			<div className="mx-auto grid max-w-7xl overflow-hidden rounded-[2rem] bg-[linear-gradient(135deg,#063b32,#008d78)] text-white shadow-[0_28px_88px_-58px_rgba(0,56,44,0.9)] lg:grid-cols-[0.92fr_1.08fr]">
				<div className="p-8 md:p-10">
					<p className="font-semibold text-cyan-100 text-sm">
						<Trans>Prêt à envoyer une candidature plus forte ?</Trans>
					</p>
					<h2 className="mt-4 font-display text-4xl leading-tight md:text-5xl">
						<Trans>Ton prochain entretien peut commencer par ce CV.</Trans>
					</h2>
					<p className="mt-5 max-w-2xl text-lg text-white/76 leading-8">
						<Trans>Crée ton CV, prépare tes réponses et montre ce que ta formation t'a déjà appris.</Trans>
					</p>
					<Link
						to="/dashboard"
						className="mt-8 inline-flex h-14 items-center justify-center gap-2 rounded-xl bg-white px-8 font-semibold text-base text-emerald-950 shadow-[0_18px_42px_rgba(0,0,0,0.22)]"
					>
						<Trans>Créer mon CV gratuitement</Trans>
						<ArrowRightIcon aria-hidden="true" className="size-5" />
					</Link>
				</div>
				<div className="grid grid-cols-2 gap-3 p-6 sm:grid-cols-4 lg:p-8">
					{[
						[`50k+`, `étudiants`],
						[`35`, `modèles CV`],
						[`92`, `score ATS`],
						[`4.8/5`, `expérience`],
					].map(([value, label]) => (
						<div key={value} className="rounded-2xl border border-white/14 bg-white/10 p-4 backdrop-blur">
							<p className="font-bold text-2xl">{value}</p>
							<p className="mt-2 text-white/72 text-xs leading-5">{label}</p>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}

export function TrafficLandingPage({ page }: { page: TrafficLandingPageConfig }) {
	return (
		<main id="main-content" className="bg-white">
			<LandingHero page={page} />
			<LandingSearchIntent page={page} />
			<HookCards />
			<LandingJourney page={page} />
			<LandingBenefits page={page} />
			<StudentHookLinks />
			<LandingProof page={page} />
			<LandingTools page={page} />
			<LandingFAQ page={page} />
			<LandingCTA />
		</main>
	);
}
