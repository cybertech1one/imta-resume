import type { Icon } from "@phosphor-icons/react";
import {
	ArrowRightIcon,
	BriefcaseIcon,
	BuildingsIcon,
	CalendarCheckIcon,
	ChatCircleDotsIcon,
	CheckCircleIcon,
	ClipboardTextIcon,
	EnvelopeSimpleIcon,
	FileTextIcon,
	FirstAidKitIcon,
	GraduationCapIcon,
	HandshakeIcon,
	MagnifyingGlassIcon,
	ShieldCheckIcon,
	StarIcon,
	UsersIcon,
} from "@phosphor-icons/react";
import { generateCanonicalLink, generateFAQSchema, generateMetaTags, generateOrganizationSchema } from "@/utils/seo";
import { Footer } from "./footer";

const PARTNER_HERO_IMAGE = "/home/partner-recruitment-hero.png";

type PartnerLandingPageConfig = {
	path: string;
	seoTitle: string;
	description: string;
	heroTitle: string;
	heroText: string;
	primaryCta: string;
	secondaryCta: string;
	audience: string;
	focus: string;
	faqs: Array<{ question: string; answer: string }>;
};

export const partnerLandingPages: PartnerLandingPageConfig[] = [
	{
		path: "/partenaires",
		seoTitle: "Partenaires recrutement IMTA Resume | Publier offres et recruter des talents",
		description:
			"Un espace partenaire pour publier des stages et emplois, suivre les candidatures et recruter des talents formes au Maroc.",
		heroTitle: "Recrutez des talents formes, prets pour le terrain.",
		heroText:
			"IMTA Resume connecte les entreprises, cliniques, cabinets et centres partenaires avec des etudiants motives, des CV mieux prepares et un suivi de recrutement clair.",
		primaryCta: "Devenir partenaire",
		secondaryCta: "Voir l'espace partenaire",
		audience: "Pour entreprises, cliniques, recruteurs et ecoles partenaires",
		focus: "Partenariat complet",
		faqs: [
			{
				question: "Que peut faire une entreprise partenaire sur IMTA Resume ?",
				answer:
					"Elle peut publier des offres, suivre les candidatures, consulter les CV rattaches, contacter les candidats et organiser son pipeline de recrutement.",
			},
			{
				question: "Les offres peuvent-elles etre des stages ?",
				answer:
					"Oui. Le portail accepte les stages, alternances, CDI, CDD et autres besoins selon le profil recherche.",
			},
			{
				question: "Comment commencer un partenariat ?",
				answer:
					"Une entreprise peut creer son espace partenaire, publier une premiere offre et echanger avec IMTA pour cadrer ses besoins de recrutement.",
			},
		],
	},
	{
		path: "/entreprises",
		seoTitle: "Recrutement etudiants au Maroc pour entreprises | IMTA Resume",
		description:
			"Une page pour les entreprises qui veulent recruter des stagiaires, jeunes diplomes et profils operationnels formes au Maroc.",
		heroTitle: "Trouvez des profils etudiants qui savent deja se presenter.",
		heroText:
			"Publiez vos besoins, recevez des candidatures plus lisibles et avancez de la preselection a l'entretien depuis un espace concu pour les recruteurs.",
		primaryCta: "Publier une offre",
		secondaryCta: "Decouvrir le portail",
		audience: "Pour PME, groupes, services RH et responsables operationnels",
		focus: "Recrutement entreprise",
		faqs: [
			{
				question: "Pourquoi recruter via IMTA Resume ?",
				answer:
					"Les candidats travaillent leur CV, leurs competences et leur preparation entretien avant de postuler, ce qui rend la preselection plus simple.",
			},
			{
				question: "Peut-on suivre les statuts des candidatures ?",
				answer:
					"Oui. Les candidatures peuvent etre revues, preselectionnees, planifiees en entretien, refusees ou marquees comme embauchees.",
			},
			{
				question: "Est-ce adapte aux besoins terrain ?",
				answer:
					"Oui. La page met en avant les profils techniques, sante, HSE, support, maintenance, commerce et fonctions operationnelles.",
			},
		],
	},
	{
		path: "/recruteurs",
		seoTitle: "Espace recruteur IMTA Resume | Candidatures, CV et pipeline",
		description:
			"Un espace recruteur pour gerer les offres, les CV, les candidatures et les echanges avec les talents IMTA Resume.",
		heroTitle: "Centralisez vos recrutements et vos echanges candidats.",
		heroText:
			"Unifiez publication d'offres, candidatures, CV, messages, preselection et suivi d'entretien dans une interface claire.",
		primaryCta: "Acceder au portail",
		secondaryCta: "Publier une offre",
		audience: "Pour recruteurs internes, cabinets et responsables RH",
		focus: "Espace recruteur",
		faqs: [
			{
				question: "Le recruteur peut-il contacter un candidat ?",
				answer: "Oui. Le portail permet d'ouvrir une conversation directe avec un candidat depuis une candidature.",
			},
			{
				question: "Peut-on filtrer les candidatures par offre ?",
				answer:
					"Oui. L'espace applications permet de relier les candidatures aux offres publiees et de suivre leur avancement.",
			},
			{
				question: "Les CV sont-ils rattaches aux candidatures ?",
				answer:
					"Lorsqu'un candidat joint son CV, le recruteur voit que le CV est attache et peut traiter la candidature avec plus de contexte.",
			},
		],
	},
	{
		path: "/publier-offre-stage",
		seoTitle: "Publier une offre de stage au Maroc | IMTA Resume partenaires",
		description:
			"Publiez une offre de stage ou d'emploi au Maroc et recevez des candidatures d'etudiants prepares avec IMTA Resume.",
		heroTitle: "Publiez une offre de stage et recevez des candidatures mieux preparees.",
		heroText:
			"Decrivez le poste, la ville, le domaine, les competences attendues et la date limite. Les candidats peuvent ensuite postuler avec un dossier plus clair.",
		primaryCta: "Publier une offre",
		secondaryCta: "Voir les etapes",
		audience: "Pour stages, alternance, premier emploi et besoins operationnels",
		focus: "Publication d'offre",
		faqs: [
			{
				question: "Quelles informations faut-il pour publier une offre ?",
				answer:
					"Titre, description, ville, region, type de contrat, domaine, competences, salaire optionnel, avantages et date limite si necessaire.",
			},
			{
				question: "Une offre est-elle publiee directement ?",
				answer:
					"Les offres peuvent etre enregistrees en brouillon puis soumises pour publication selon le flux partenaire.",
			},
			{
				question: "Peut-on fermer une offre ?",
				answer: "Oui. Les partenaires peuvent gerer leurs offres et fermer celles qui ne sont plus ouvertes.",
			},
		],
	},
	{
		path: "/recrutement-sante-maroc",
		seoTitle: "Recruter des profils sante au Maroc | IMTA Resume partenaires",
		description:
			"Une page pour cliniques et etablissements de sante qui veulent recruter des profils formes, serieux et mieux prepares.",
		heroTitle: "Recrutez des profils sante prepares aux exigences du terrain.",
		heroText:
			"Identifiez des candidats qui savent presenter leurs gestes professionnels, leur hygiene, leur relation patient et leur disponibilite.",
		primaryCta: "Trouver des profils sante",
		secondaryCta: "Publier une offre",
		audience: "Pour cliniques, cabinets, centres de soins et structures medico-sociales",
		focus: "Sante & soin",
		faqs: [
			{
				question: "Quels profils sante peuvent etre valorises ?",
				answer:
					"Aide-soignants, infirmiers debutants, techniciens de laboratoire, assistants et profils medico-sociaux selon les formations disponibles.",
			},
			{
				question: "Les candidats peuvent-ils montrer leurs competences pratiques ?",
				answer:
					"Oui. Les CV peuvent mettre en avant stages, protocoles, hygiene, relation patient, langues et certifications.",
			},
			{
				question: "Le portail convient-il aux petites cliniques ?",
				answer:
					"Oui. Le flux reste simple : publier une offre, recevoir des candidatures, preselectionner et contacter les profils pertinents.",
			},
		],
	},
];

const trustItems = [
	{ title: "Stages", text: "Publiez des opportunites de stage claires.", icon: BriefcaseIcon },
	{ title: "Emplois", text: "Presentez vos postes aux jeunes talents.", icon: BuildingsIcon },
	{ title: "Entretiens", text: "Organisez la suite du recrutement.", icon: CalendarCheckIcon },
	{ title: "Suivi candidat", text: "Gardez chaque statut visible.", icon: ClipboardTextIcon },
];

const partnerFeatures = [
	{
		title: "Publier vos offres",
		text: "Stage, alternance, CDI, CDD ou mission selon votre besoin.",
		icon: BriefcaseIcon,
	},
	{
		title: "Gerer les candidatures",
		text: "Centralisez les profils recus et traitez-les par statut.",
		icon: ClipboardTextIcon,
	},
	{
		title: "Consulter les CV",
		text: "Reperez vite les parcours, competences et pieces jointes.",
		icon: FileTextIcon,
	},
	{
		title: "Suivre le pipeline",
		text: "Revus, preselectionnes, en entretien, embauches ou refuses.",
		icon: StarIcon,
	},
	{
		title: "Echanger avec les candidats",
		text: "Contactez un candidat directement depuis sa candidature.",
		icon: ChatCircleDotsIcon,
	},
	{
		title: "Valoriser votre marque",
		text: "Montrez votre activite et vos besoins aux talents formes.",
		icon: ShieldCheckIcon,
	},
];

const processSteps = [
	{ title: "Offre publiee", text: "Votre besoin est decrit en quelques champs.", icon: EnvelopeSimpleIcon },
	{ title: "Candidatures recues", text: "Les profils interesses postulent en ligne.", icon: UsersIcon },
	{ title: "Preselection", text: "Vous marquez les profils a prioriser.", icon: MagnifyingGlassIcon },
	{ title: "Entretien", text: "Vous planifiez et suivez les etapes.", icon: CalendarCheckIcon },
	{ title: "Embauche", text: "Le statut final reste trace dans le portail.", icon: CheckCircleIcon },
];

const sectorCards = [
	{
		title: "Entreprises & employeurs",
		text: "Recrutez pour vos equipes operationnelles, techniques et support.",
		image: "/home/tool-job-offers.webp",
		icon: BuildingsIcon,
	},
	{
		title: "Cliniques & sante",
		text: "Trouvez des profils motives pour vos etablissements de soin.",
		image: "/home/tool-cv-intelligent.webp",
		icon: FirstAidKitIcon,
	},
	{
		title: "Ecoles & centres",
		text: "Creez des passerelles entre formation, stages et emploi.",
		image: "/home/student-career-workshop.webp",
		icon: GraduationCapIcon,
	},
	{
		title: "Cabinets de recrutement",
		text: "Accedez a un vivier de talents formes et mieux prepares.",
		image: "/home/tool-career-coaching.webp",
		icon: HandshakeIcon,
	},
];

export function findPartnerLandingPage(path: string) {
	return partnerLandingPages.find((page) => page.path === path);
}

export function partnerLandingHead(page: PartnerLandingPageConfig) {
	const appUrl = ((typeof process !== "undefined" ? process.env.APP_URL : undefined) ?? "https://imta.ma").replace(
		/\/$/,
		"",
	);
	const canonicalUrl = `${appUrl}${page.path}`;

	return {
		links: [
			generateCanonicalLink(canonicalUrl),
			{
				rel: "preload",
				href: PARTNER_HERO_IMAGE,
				as: "image",
				fetchPriority: "high",
			},
		],
		meta: generateMetaTags({
			title: page.seoTitle,
			description: page.description,
			image: `${appUrl}${PARTNER_HERO_IMAGE}`,
			url: canonicalUrl,
			type: "website",
			siteName: "IMTA Resume",
		}),
		scripts: [
			{
				type: "application/ld+json",
				children: JSON.stringify(
					generateOrganizationSchema({
						name: "IMTA Resume",
						url: appUrl,
						logo: `${appUrl}/opengraph/logo.svg`,
						description: page.description,
						sameAs: ["https://imta.ma"],
					}),
				),
			},
			{
				type: "application/ld+json",
				children: JSON.stringify(generateFAQSchema(page.faqs)),
			},
		],
	};
}

export function PartnerLandingPage({ page }: { page: PartnerLandingPageConfig }) {
	return (
		<main id="main-content" className="bg-white text-zinc-950">
			<HeroSection page={page} />
			<TrustStrip />
			<FeatureSection />
			<ProcessSection />
			<PortalPreviewSection />
			<SectorSection />
			<FaqSection faqs={page.faqs} />
			<FinalCta page={page} />
			<Footer />
		</main>
	);
}

function HeroSection({ page }: { page: PartnerLandingPageConfig }) {
	return (
		<section className="relative isolate overflow-hidden bg-[#f7fbfa] pt-20">
			<div
				aria-hidden="true"
				className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_14%_22%,rgba(0,168,138,0.12),transparent_30%),linear-gradient(180deg,#ffffff_0%,#f7fbfa_72%,#ffffff_100%)]"
			/>
			<div className="mx-auto grid max-w-7xl items-center gap-8 px-6 py-9 sm:py-12 lg:grid-cols-[0.95fr_1.05fr] lg:gap-10 lg:px-10 lg:py-20">
				<div className="max-w-3xl">
					<p className="mb-3 font-semibold text-emerald-800 text-sm sm:mb-4">{page.audience}</p>
					<h1 className="font-display text-[2.35rem] leading-[1.02] sm:text-6xl sm:leading-[0.96] lg:text-[4.45rem]">
						{page.heroTitle}
					</h1>
					<p className="mt-5 max-w-2xl text-base text-zinc-600 leading-7 sm:mt-6 sm:text-lg sm:leading-8">
						{page.heroText}
					</p>

					<div className="mt-7 flex flex-col gap-3 sm:mt-8 sm:flex-row">
						<a
							href="/dashboard/partner/post-job"
							className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-[linear-gradient(135deg,#006b53,#009d86)] px-7 font-semibold text-white shadow-[0_22px_44px_-26px_rgba(0,107,83,0.95)] transition-transform hover:-translate-y-0.5 sm:h-14"
						>
							{page.primaryCta}
							<ArrowRightIcon aria-hidden="true" className="size-4" />
						</a>
						<a
							href="/dashboard/partner"
							className="inline-flex h-12 items-center justify-center rounded-lg border border-emerald-950/15 bg-white px-7 font-semibold text-zinc-900 shadow-sm transition-colors hover:border-emerald-700 hover:text-emerald-800 sm:h-14"
						>
							{page.secondaryCta}
						</a>
					</div>

					<div className="mt-8 hidden flex-wrap gap-3 text-sm text-zinc-600 sm:flex">
						<ProofPoint icon={ShieldCheckIcon} label="Plateforme marocaine" />
						<ProofPoint icon={FileTextIcon} label="CV et dossiers candidats" />
						<ProofPoint icon={ChatCircleDotsIcon} label="Messagerie candidat" />
					</div>
				</div>

				<div className="relative min-h-[270px] sm:min-h-[520px] lg:min-h-[650px]">
					<img
						src={PARTNER_HERO_IMAGE}
						alt="Responsables recrutement marocains consultant des candidatures et CV sur IMTA Resume"
						fetchPriority="high"
						decoding="async"
						width={1792}
						height={1024}
						className="absolute inset-0 size-full rounded-[1.6rem] object-cover object-[58%_center] shadow-[0_34px_90px_-58px_rgba(0,56,44,0.8)] lg:rounded-[2rem]"
					/>
					<div
						aria-hidden="true"
						className="absolute inset-y-0 left-0 hidden w-2/5 rounded-l-[2rem] bg-gradient-to-r from-[#f7fbfa] via-[#f7fbfa]/72 to-transparent lg:block"
					/>
					<div className="absolute right-4 bottom-4 left-4 rounded-lg border border-white/70 bg-white/92 p-4 shadow-[0_22px_60px_-35px_rgba(0,42,35,0.7)] backdrop-blur-xl sm:right-6 sm:bottom-6 sm:left-auto sm:w-80">
						<div className="mb-3 flex items-center justify-between">
							<div>
								<p className="font-semibold text-zinc-950">Apercu partenaire</p>
								<p className="text-xs text-zinc-500">{page.focus}</p>
							</div>
							<div className="flex size-10 items-center justify-center rounded-md bg-emerald-50 text-emerald-800">
								<BuildingsIcon aria-hidden="true" weight="duotone" className="size-5" />
							</div>
						</div>
						<div className="space-y-2.5">
							<PreviewRow title="Offre stage sante" status="A publier" />
							<PreviewRow title="Technicien maintenance" status="Candidats" />
							<PreviewRow title="Assistant RH junior" status="Entretien" />
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}

function ProofPoint({ icon: Icon, label }: { icon: Icon; label: string }) {
	return (
		<span className="inline-flex items-center gap-2 rounded-full border border-emerald-900/10 bg-white px-3 py-2 font-medium shadow-sm">
			<Icon aria-hidden="true" className="size-4 text-emerald-800" weight="duotone" />
			{label}
		</span>
	);
}

function PreviewRow({ title, status }: { title: string; status: string }) {
	return (
		<div className="flex items-center justify-between gap-3 rounded-md border border-emerald-950/10 bg-white px-3 py-2">
			<div className="min-w-0">
				<p className="truncate font-medium text-sm text-zinc-900">{title}</p>
				<p className="text-xs text-zinc-500">Dossier candidat</p>
			</div>
			<span className="rounded-full bg-emerald-50 px-2.5 py-1 font-semibold text-[11px] text-emerald-800">
				{status}
			</span>
		</div>
	);
}

function TrustStrip() {
	return (
		<section className="border-emerald-950/10 border-y bg-white">
			<div className="mx-auto grid max-w-7xl gap-0 px-6 py-6 sm:grid-cols-2 lg:grid-cols-4 lg:px-10">
				{trustItems.map((item, index) => (
					<div
						key={item.title}
						className={`flex items-start gap-4 py-4 lg:px-7 ${index > 0 ? "lg:border-emerald-950/10 lg:border-l" : ""}`}
					>
						<div className="flex size-11 shrink-0 items-center justify-center rounded-lg border border-emerald-800/15 bg-emerald-50 text-emerald-800">
							<item.icon aria-hidden="true" className="size-5" />
						</div>
						<div>
							<h2 className="font-semibold text-zinc-950">{item.title}</h2>
							<p className="mt-1 text-sm text-zinc-600 leading-6">{item.text}</p>
						</div>
					</div>
				))}
			</div>
		</section>
	);
}

function FeatureSection() {
	return (
		<section id="objectifs" className="bg-white py-16 md:py-24">
			<div className="mx-auto max-w-7xl px-6 lg:px-10">
				<div className="mx-auto max-w-3xl text-center">
					<h2 className="font-display text-3xl text-zinc-950 sm:text-4xl">
						Tout ce dont vous avez besoin pour recruter efficacement
					</h2>
					<p className="mt-4 text-zinc-600 leading-7">
						La page publique attire les entreprises. L'espace partenaire transforme cet interet en offres, candidatures
						et suivi concret.
					</p>
				</div>
				<div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{partnerFeatures.map((feature) => (
						<FeatureCard key={feature.title} {...feature} />
					))}
				</div>
			</div>
		</section>
	);
}

function FeatureCard({ title, text, icon: Icon }: { title: string; text: string; icon: Icon }) {
	return (
		<article className="group rounded-lg border border-emerald-950/10 bg-white p-6 shadow-[0_20px_60px_-45px_rgba(0,56,44,0.45)] transition-all hover:-translate-y-1 hover:border-emerald-800/30 hover:shadow-[0_26px_70px_-46px_rgba(0,56,44,0.65)]">
			<div className="mb-6 flex size-12 items-center justify-center rounded-lg bg-emerald-50 text-emerald-800 transition-colors group-hover:bg-emerald-800 group-hover:text-white">
				<Icon aria-hidden="true" className="size-6" />
			</div>
			<h3 className="font-semibold text-lg text-zinc-950">{title}</h3>
			<p className="mt-3 text-sm text-zinc-600 leading-6">{text}</p>
		</article>
	);
}

function ProcessSection() {
	return (
		<section id="stages" className="bg-[#f7fbfa] py-16 md:py-24">
			<div className="mx-auto max-w-7xl px-6 lg:px-10">
				<div className="mx-auto max-w-3xl text-center">
					<h2 className="font-display text-3xl text-zinc-950 sm:text-4xl">
						Un processus de recrutement simple et fluide
					</h2>
					<p className="mt-4 text-zinc-600 leading-7">
						Le parcours reprend les actions deja presentes dans le tableau de bord partenaire, sans promesse floue ni
						tableau fictif.
					</p>
				</div>
				<div className="mt-12 grid gap-4 lg:grid-cols-5">
					{processSteps.map((step, index) => (
						<article key={step.title} className="relative rounded-lg border border-emerald-950/10 bg-white p-5">
							<div className="mb-5 flex items-center gap-3">
								<span className="flex size-8 items-center justify-center rounded-full bg-emerald-800 font-bold text-sm text-white">
									{index + 1}
								</span>
								<step.icon aria-hidden="true" className="size-5 text-emerald-800" />
							</div>
							<h3 className="font-semibold text-zinc-950">{step.title}</h3>
							<p className="mt-2 text-sm text-zinc-600 leading-6">{step.text}</p>
						</article>
					))}
				</div>
			</div>
		</section>
	);
}

function PortalPreviewSection() {
	return (
		<section className="bg-white py-16 md:py-24">
			<div className="mx-auto grid max-w-7xl items-center gap-10 px-6 lg:grid-cols-[0.78fr_1.22fr] lg:px-10">
				<div>
					<h2 className="font-display text-3xl text-zinc-950 sm:text-4xl">Un espace partenaire pense pour vous</h2>
					<p className="mt-5 text-zinc-600 leading-7">
						Le portail n'est pas une page vitrine. Il sert aux vraies operations RH : offres, candidatures, messages,
						statuts et decisions.
					</p>
					<ul className="mt-7 space-y-3 text-zinc-700">
						{[
							"Vue d'ensemble de vos offres",
							"Suivi des candidatures par statut",
							"Contact direct avec les candidats",
							"Evenements et actions partenaires",
						].map((item) => (
							<li key={item} className="flex items-center gap-3">
								<CheckCircleIcon aria-hidden="true" className="size-5 text-emerald-800" weight="fill" />
								<span>{item}</span>
							</li>
						))}
					</ul>
					<a
						href="/dashboard/partner"
						className="mt-8 inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-emerald-900/20 bg-white px-6 font-semibold text-emerald-900 shadow-sm hover:border-emerald-700"
					>
						Voir l'espace partenaire
						<ArrowRightIcon aria-hidden="true" className="size-4" />
					</a>
				</div>

				<div className="overflow-hidden rounded-lg border border-emerald-900/20 bg-white shadow-[0_38px_95px_-60px_rgba(0,56,44,0.9)]">
					<div className="grid min-h-[430px] lg:grid-cols-[210px_1fr]">
						<aside className="hidden bg-emerald-950 p-5 text-white lg:block">
							<div className="flex items-center gap-3">
								<div className="flex size-9 items-center justify-center rounded-md bg-white/12">
									<BuildingsIcon aria-hidden="true" className="size-5" />
								</div>
								<div>
									<p className="font-semibold">IMTA Resume</p>
									<p className="text-emerald-100/70 text-xs">Partners</p>
								</div>
							</div>
							<nav className="mt-9 space-y-2 text-sm">
								{["Tableau de bord", "Offres", "Candidatures", "Messagerie", "Entretiens"].map((item, index) => (
									<div
										key={item}
										className={`rounded-md px-3 py-2 ${index === 0 ? "bg-white text-emerald-950" : "text-emerald-50/75"}`}
									>
										{item}
									</div>
								))}
							</nav>
						</aside>
						<div className="p-5 sm:p-7">
							<div className="flex flex-col gap-4 border-emerald-950/10 border-b pb-5 sm:flex-row sm:items-center sm:justify-between">
								<div>
									<p className="font-semibold text-xl text-zinc-950">Tableau de bord</p>
									<p className="text-sm text-zinc-500">Donnees reliees a vos offres reelles</p>
								</div>
								<span className="w-fit rounded-full bg-emerald-50 px-3 py-1 font-semibold text-emerald-800 text-xs">
									Partenaire actif
								</span>
							</div>
							<div className="mt-5 grid gap-3 sm:grid-cols-4">
								{["Offres", "Candidatures", "Entretiens", "Embauches"].map((label) => (
									<div key={label} className="rounded-lg border border-zinc-200 bg-zinc-50 p-3">
										<p className="text-xs text-zinc-500">{label}</p>
										<div className="mt-3 h-2 w-14 rounded-full bg-emerald-800/20" />
									</div>
								))}
							</div>
							<div className="mt-5 grid gap-4 lg:grid-cols-2">
								<PreviewPanel
									title="Offres recentes"
									rows={[
										["Stage aide-soignant", "Soumis"],
										["Technicien HSE", "Publie"],
										["Assistant administratif", "Brouillon"],
									]}
								/>
								<PreviewPanel
									title="Candidatures recentes"
									rows={[
										["Profil sante", "Nouveau"],
										["Profil maintenance", "A revoir"],
										["Profil support", "Entretien"],
									]}
								/>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}

function PreviewPanel({ title, rows }: { title: string; rows: Array<[string, string]> }) {
	return (
		<div className="rounded-lg border border-zinc-200 bg-white p-4">
			<h3 className="font-semibold text-sm text-zinc-950">{title}</h3>
			<div className="mt-4 space-y-3">
				{rows.map(([label, status]) => (
					<div key={`${label}-${status}`} className="flex items-center justify-between gap-3 text-sm">
						<span className="min-w-0 truncate text-zinc-700">{label}</span>
						<span className="rounded-full bg-zinc-100 px-2.5 py-1 font-semibold text-[11px] text-zinc-600">
							{status}
						</span>
					</div>
				))}
			</div>
		</div>
	);
}

function SectorSection() {
	return (
		<section id="guides" className="bg-[#f7fbfa] py-16 md:py-24">
			<div className="mx-auto max-w-7xl px-6 lg:px-10">
				<div className="mx-auto max-w-3xl text-center">
					<h2 className="font-display text-3xl text-zinc-950 sm:text-4xl">Des partenariats adaptes a votre secteur</h2>
					<p className="mt-4 text-zinc-600 leading-7">
						Chaque structure arrive avec un besoin different. La landing page oriente, le portail partenaire organise.
					</p>
				</div>
				<div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
					{sectorCards.map((sector) => (
						<article key={sector.title} className="overflow-hidden rounded-lg border border-emerald-950/10 bg-white">
							<div className="relative aspect-[1.5] overflow-hidden">
								<img src={sector.image} alt="" aria-hidden="true" className="size-full object-cover" loading="lazy" />
								<div className="absolute right-3 bottom-3 flex size-11 items-center justify-center rounded-lg border border-white/70 bg-white/90 text-emerald-800 shadow-sm backdrop-blur">
									<sector.icon aria-hidden="true" className="size-5" />
								</div>
							</div>
							<div className="p-5 text-center">
								<h3 className="font-semibold text-zinc-950">{sector.title}</h3>
								<p className="mt-3 text-sm text-zinc-600 leading-6">{sector.text}</p>
							</div>
						</article>
					))}
				</div>
			</div>
		</section>
	);
}

function FaqSection({ faqs }: { faqs: PartnerLandingPageConfig["faqs"] }) {
	return (
		<section className="bg-white py-16 md:py-24">
			<div className="mx-auto max-w-5xl px-6 lg:px-10">
				<div className="mx-auto max-w-2xl text-center">
					<h2 className="font-display text-3xl text-zinc-950 sm:text-4xl">Questions des partenaires</h2>
					<p className="mt-4 text-zinc-600 leading-7">
						Les reponses restent concretes et reliees aux actions deja disponibles dans le produit.
					</p>
				</div>
				<div className="mt-9 grid gap-4 md:grid-cols-3">
					{faqs.map((faq) => (
						<article key={faq.question} className="rounded-lg border border-emerald-950/10 bg-white p-5">
							<h3 className="font-semibold text-zinc-950">{faq.question}</h3>
							<p className="mt-3 text-sm text-zinc-600 leading-6">{faq.answer}</p>
						</article>
					))}
				</div>
			</div>
		</section>
	);
}

function FinalCta({ page }: { page: PartnerLandingPageConfig }) {
	return (
		<section className="overflow-hidden bg-emerald-950 text-white">
			<div className="mx-auto grid max-w-7xl items-center gap-8 px-6 py-12 lg:grid-cols-[0.85fr_1.15fr] lg:px-10">
				<div className="relative min-h-[240px] overflow-hidden rounded-lg">
					<img
						src="/home/healthtech-student-hero.png"
						alt=""
						aria-hidden="true"
						className="absolute inset-0 size-full object-cover object-[58%_center]"
						loading="lazy"
					/>
					<div className="absolute inset-0 bg-gradient-to-r from-emerald-950/20 to-emerald-950/60" />
				</div>
				<div>
					<h2 className="font-display text-3xl leading-tight sm:text-5xl">Pret a rencontrer vos prochains talents ?</h2>
					<p className="mt-5 max-w-2xl text-emerald-50/82 leading-7">
						Rejoignez le reseau des partenaires IMTA Resume et donnez a vos offres un chemin clair vers les etudiants et
						jeunes diplomes qui se preparent serieusement.
					</p>
					<div className="mt-7 flex flex-col gap-3 sm:flex-row">
						<a
							href="/dashboard/partner/post-job"
							className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-white px-6 font-semibold text-emerald-950 transition-transform hover:-translate-y-0.5"
						>
							{page.primaryCta}
							<ArrowRightIcon aria-hidden="true" className="size-4" />
						</a>
						<a
							href="mailto:partenaires@imta.ma"
							className="inline-flex h-12 items-center justify-center rounded-lg border border-white/35 px-6 font-semibold text-white hover:bg-white/10"
						>
							Contacter l'equipe
						</a>
					</div>
				</div>
			</div>
		</section>
	);
}
