import type { Icon } from "@phosphor-icons/react";
import {
	ArrowRightIcon,
	BookOpenIcon,
	BriefcaseIcon,
	ChatsCircleIcon,
	FileTextIcon,
	GraduationCapIcon,
	MapPinIcon,
	TargetIcon,
	UsersIcon,
} from "@phosphor-icons/react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { defaultSEO, generateCanonicalLink, generateMetaTags } from "@/utils/seo";
import {
	findTrafficLandingPage,
	type TrafficLandingPageConfig,
	trafficLandingPages,
} from "./-sections/traffic-landing";

const pagePath = "/ressources-etudiants-maroc";

const priorityPaths = [
	"/cv-sans-experience",
	"/cv-etudiant",
	"/stage-maroc",
	"/preparation-entretien",
	"/lettre-motivation-stage",
	"/linkedin-etudiant",
	"/orientation-apres-bac",
	"/formation-professionnelle-maroc",
	"/atelier-cv-etudiants",
	"/parents-etudiants-imta",
	"/stage-casablanca",
	"/stage-hse-casablanca",
];

const priorityPages = priorityPaths
	.map((path) => findTrafficLandingPage(path))
	.filter(Boolean) as TrafficLandingPageConfig[];

const pageGroups = [
	{
		title: "CV et dossier étudiant",
		description: "Pages pour transformer une formation, des stages courts et des projets en candidature crédible.",
		icon: FileTextIcon,
		pages: trafficLandingPages.filter((page) => page.path.startsWith("/cv-")),
	},
	{
		title: "Stages au Maroc",
		description: "Pages locales et métiers pour capter les recherches de stage par ville, domaine et intention.",
		icon: MapPinIcon,
		pages: trafficLandingPages.filter((page) => page.path.startsWith("/stage-")),
	},
	{
		title: "Entretiens et confiance",
		description: "Pages pour préparer les questions fréquentes, le pitch et les exemples avant l'entretien.",
		icon: ChatsCircleIcon,
		pages: trafficLandingPages.filter((page) => page.path.startsWith("/entretien-")),
	},
	{
		title: "Objectifs rapides",
		description: "Pages crochets pour les besoins immédiats des étudiants: lettre, email, LinkedIn, relance.",
		icon: TargetIcon,
		pages: trafficLandingPages.filter((page) =>
			[
				"/lettre-motivation-stage",
				"/email-candidature-stage",
				"/linkedin-etudiant",
				"/questions-entretien-stage",
				"/pitch-entretien",
				"/relance-candidature-stage",
			].includes(page.path),
		),
	},
	{
		title: "Orientation, IMTA et insertion",
		description:
			"Pages pour attirer les futurs etudiants, rassurer les familles et montrer l'accompagnement vers le stage.",
		icon: GraduationCapIcon,
		pages: trafficLandingPages.filter(
			(page) =>
				page.path.startsWith("/orientation-") ||
				page.path.startsWith("/formation-") ||
				[
					"/choisir-metier-technique",
					"/stage-fin-etudes",
					"/atelier-cv-etudiants",
					"/parents-etudiants-imta",
					"/ecole-qui-aide-a-trouver-stage",
					"/inscription-formation-avec-stage",
					"/imta-carriere-etudiants",
					"/imta-etudiants",
					"/ecoles-formateurs",
					"/premier-emploi-jeune-diplome",
				].includes(page.path),
		),
	},
] satisfies Array<{
	title: string;
	description: string;
	icon: Icon;
	pages: TrafficLandingPageConfig[];
}>;

const marketingMessages = [
	{
		label: "WhatsApp étudiants",
		title: "Message court à partager",
		text: "Tu cherches un stage ou tu dois refaire ton CV ? IMTA Resume t'aide à créer un CV propre, préparer ton entretien et trouver les bonnes pages selon ta ville et ton métier.",
		icon: UsersIcon,
	},
	{
		label: "Post LinkedIn",
		title: "Accroche pour recruteurs et écoles",
		text: "Nous aidons les étudiants marocains à passer d'un parcours scolaire à une candidature professionnelle: CV, stage, entretien, lettre de motivation et profil LinkedIn.",
		icon: BriefcaseIcon,
	},
	{
		label: "Affiche campus",
		title: "Phrase simple pour QR code",
		text: "Scanne, crée ton CV gratuitement et prépare ton prochain stage avec des guides adaptés aux étudiants au Maroc.",
		icon: GraduationCapIcon,
	},
	{
		label: "Email formateur",
		title: "Message pour accompagner une classe",
		text: "Voici une ressource pratique pour aider les étudiants à structurer leur CV, préparer leurs réponses d'entretien et cibler les stages par ville ou par domaine.",
		icon: BookOpenIcon,
	},
];

export const Route = createFileRoute("/_home/ressources-etudiants-maroc")({
	component: RouteComponent,
	head: () => {
		const appUrl = (typeof process !== "undefined" ? process.env.APP_URL : undefined) ?? "https://imta.ma/";
		const url = new URL(pagePath, appUrl).toString();

		return {
			links: [generateCanonicalLink(url)],
			meta: generateMetaTags({
				title: `Ressources étudiants Maroc | ${trafficLandingPages.length} pages CV, stage et entretien`,
				description:
					"Explore les pages publiques IMTA Resume pour créer un CV, trouver un stage au Maroc, préparer un entretien, une lettre de motivation et un profil LinkedIn étudiant.",
				image: `${new URL("/", url).toString()}opengraph/banner.jpg`,
				url,
				type: "website",
				siteName: defaultSEO.appName,
			}),
		};
	},
});

function RouteComponent() {
	return (
		<main id="main-content" className="bg-white pt-20">
			<section className="grid overflow-hidden bg-[#f7fbfa] lg:min-h-[660px] lg:grid-cols-[0.92fr_1.08fr]">
				<div className="flex items-center px-6 py-16 md:px-10 lg:px-14">
					<div className="max-w-2xl">
						<p className="inline-flex items-center rounded-full border border-emerald-900/10 bg-white px-3 py-1.5 font-semibold text-emerald-900 text-sm shadow-sm">
							Ressources publiques IMTA Resume
						</p>
						<h1 className="mt-5 font-display text-5xl text-zinc-950 leading-[1.02] md:text-6xl">
							Des pages qui attirent les étudiants au bon moment.
						</h1>
						<p className="mt-7 max-w-xl text-lg text-zinc-600 leading-8">
							CV sans expérience, stage par ville, entretien par métier, lettre de motivation, email de candidature et
							LinkedIn étudiant: chaque page répond à une recherche concrète.
						</p>
						<div className="mt-9 grid gap-4 sm:grid-cols-2">
							<Link
								to="/dashboard"
								className="inline-flex h-14 items-center justify-center rounded-xl bg-[linear-gradient(135deg,#006b53,#00a88a)] px-7 font-semibold text-white shadow-[0_22px_44px_-26px_rgba(0,107,83,0.95)] transition-transform hover:-translate-y-0.5"
							>
								Créer mon CV gratuitement
							</Link>
							<a
								href="#catalogue"
								className="inline-flex h-14 items-center justify-center rounded-xl border border-emerald-950/15 bg-white px-7 font-semibold text-zinc-900 shadow-sm transition-colors hover:border-emerald-800 hover:text-emerald-800"
							>
								Explorer les pages
							</a>
							<a
								href="/campagnes-etudiants"
								className="inline-flex h-14 items-center justify-center rounded-xl border border-emerald-950/15 bg-white px-7 font-semibold text-zinc-900 shadow-sm transition-colors hover:border-emerald-800 hover:text-emerald-800"
							>
								Voir les campagnes
							</a>
							<a
								href="/plan-marketing-etudiants"
								className="inline-flex h-14 items-center justify-center rounded-xl border border-emerald-950/15 bg-white px-7 font-semibold text-zinc-900 shadow-sm transition-colors hover:border-emerald-800 hover:text-emerald-800"
							>
								Plan 30 jours
							</a>
						</div>
						<div className="mt-10 grid grid-cols-3 gap-4">
							<HeroStat value={`${trafficLandingPages.length}+`} label="pages publiques" />
							<HeroStat value="18" label="villes ciblées" />
							<HeroStat value="16" label="domaines métiers" />
						</div>
					</div>
				</div>
				<div className="relative min-h-[430px] overflow-hidden lg:min-h-full">
					<img
						src="/home/healthtech-student-hero.png"
						alt=""
						aria-hidden="true"
						fetchPriority="high"
						decoding="async"
						width={1440}
						height={810}
						className="absolute inset-0 size-full object-cover object-[54%_center]"
					/>
					<div
						aria-hidden="true"
						className="absolute inset-y-0 left-0 hidden w-1/4 bg-gradient-to-r from-white to-transparent lg:block"
					/>
				</div>
			</section>

			<section className="bg-white py-16 md:py-20">
				<div className="mx-auto max-w-7xl px-6 lg:px-10">
					<div className="grid gap-8 lg:grid-cols-[0.78fr_1.22fr] lg:items-end">
						<div>
							<h2 className="font-display text-4xl text-zinc-950 leading-tight md:text-5xl">
								Les meilleurs crochets pour commencer.
							</h2>
							<p className="mt-4 text-zinc-600 leading-7">
								Ces pages servent de portes d'entrée pour les étudiants qui savent déjà ce qu'ils cherchent.
							</p>
						</div>
						<div className="grid gap-4 sm:grid-cols-2">
							{priorityPages.map((page) => (
								<FeaturedPageLink key={page.path} page={page} />
							))}
						</div>
					</div>
				</div>
			</section>

			<section id="catalogue" className="bg-[linear-gradient(135deg,#063b32,#008d78)] py-16 text-white md:py-20">
				<div className="mx-auto max-w-7xl px-6 lg:px-10">
					<div className="mx-auto max-w-3xl text-center">
						<h2 className="font-display text-4xl leading-tight md:text-5xl">
							Un catalogue public construit pour la recherche.
						</h2>
						<p className="mt-4 text-white/70 leading-7">
							Chaque lien mène vers une page utile, lisible, indexable et reliée aux outils IMTA Resume.
						</p>
					</div>

					<div className="mt-12 space-y-8">
						{pageGroups.map((group) => (
							<PageGroup key={group.title} group={group} />
						))}
					</div>
				</div>
			</section>

			<section className="bg-white py-16 md:py-20">
				<div className="mx-auto max-w-7xl px-6 lg:px-10">
					<div className="grid gap-8 lg:grid-cols-[0.82fr_1.18fr]">
						<div>
							<h2 className="font-display text-4xl text-zinc-950 leading-tight md:text-5xl">
								Messages prêts à partager.
							</h2>
							<p className="mt-4 text-zinc-600 leading-7">
								Des accroches simples pour promouvoir IMTA Resume auprès des étudiants, formateurs, écoles et
								partenaires.
							</p>
						</div>
						<div className="grid gap-4 md:grid-cols-2">
							{marketingMessages.map((message) => {
								const Icon = message.icon;

								return (
									<article key={message.label} className="rounded-lg border border-zinc-200 bg-white p-5">
										<div className="mb-4 flex items-center gap-3">
											<div className="flex size-10 items-center justify-center rounded-md bg-emerald-50 text-emerald-800">
												<Icon aria-hidden="true" className="size-5" weight="duotone" />
											</div>
											<div>
												<p className="font-semibold text-emerald-800 text-sm">{message.label}</p>
												<h3 className="font-semibold text-zinc-950">{message.title}</h3>
											</div>
										</div>
										<p className="text-[15px] text-zinc-600 leading-7">{message.text}</p>
									</article>
								);
							})}
						</div>
					</div>
				</div>
			</section>

			<section className="grid overflow-hidden bg-[linear-gradient(135deg,#063b32,#008d78)] text-white lg:grid-cols-[0.95fr_1.05fr]">
				<div className="flex items-center px-6 py-14 md:px-10 lg:px-14">
					<div className="max-w-xl">
						<h2 className="font-display text-4xl leading-tight md:text-5xl">
							Le trafic doit mener vers une action claire.
						</h2>
						<p className="mt-4 text-white/74 leading-7">
							Chaque page publique ramène l'étudiant vers un CV, une candidature ou une préparation concrète.
						</p>
						<Link
							to="/dashboard"
							className="mt-8 inline-flex h-13 items-center gap-3 rounded-md bg-white px-7 font-semibold text-emerald-950"
						>
							Commencer gratuitement
							<ArrowRightIcon aria-hidden="true" className="size-4" />
						</Link>
					</div>
				</div>
				<img
					src="/home/healthtech-student-hero.png"
					alt=""
					aria-hidden="true"
					loading="lazy"
					decoding="async"
					width={1672}
					height={941}
					className="h-full min-h-[340px] w-full object-cover object-[58%_center]"
				/>
			</section>
		</main>
	);
}

function HeroStat({ value, label }: { value: string; label: string }) {
	return (
		<div className="border-zinc-200 border-l pl-4">
			<p className="font-display text-3xl text-emerald-800">{value}</p>
			<p className="mt-1 text-sm text-zinc-500">{label}</p>
		</div>
	);
}

function FeaturedPageLink({ page }: { page: TrafficLandingPageConfig }) {
	return (
		<a
			href={page.path}
			className="group grid grid-cols-[6.5rem_1fr] overflow-hidden rounded-lg border border-zinc-200 bg-white transition-colors hover:border-emerald-800/40"
		>
			<img
				src={page.image}
				alt=""
				aria-hidden="true"
				loading="lazy"
				decoding="async"
				width={220}
				height={170}
				className="h-full min-h-28 w-full object-cover"
			/>
			<div className="flex items-center justify-between gap-3 p-4">
				<div>
					<h3 className="font-semibold text-zinc-950">{page.title}</h3>
					<p className="mt-1 line-clamp-2 text-sm text-zinc-500">{page.audience}</p>
				</div>
				<ArrowRightIcon
					aria-hidden="true"
					className="size-4 shrink-0 text-emerald-800 transition-transform group-hover:translate-x-1"
				/>
			</div>
		</a>
	);
}

function PageGroup({
	group,
}: {
	group: {
		title: string;
		description: string;
		icon: Icon;
		pages: TrafficLandingPageConfig[];
	};
}) {
	const Icon = group.icon;
	const visiblePages = group.pages.slice(0, 72);
	const hiddenCount = Math.max(group.pages.length - visiblePages.length, 0);

	return (
		<section className="rounded-lg border border-white/12 bg-white/[0.06] p-5 md:p-6">
			<div className="mb-5 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
				<div className="flex gap-4">
					<div className="flex size-11 shrink-0 items-center justify-center rounded-md bg-emerald-300/12 text-emerald-200">
						<Icon aria-hidden="true" className="size-6" weight="duotone" />
					</div>
					<div>
						<h3 className="font-display text-3xl leading-tight">{group.title}</h3>
						<p className="mt-2 max-w-2xl text-sm text-white/65 leading-6">{group.description}</p>
					</div>
				</div>
				<p className="font-semibold text-emerald-200 text-sm">{group.pages.length} pages</p>
			</div>
			<div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
				{visiblePages.map((page) => (
					<a
						key={page.path}
						href={page.path}
						className="flex min-h-12 items-center justify-between gap-3 rounded-md border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white/82 transition-colors hover:border-emerald-200/35 hover:bg-emerald-200/10 hover:text-white"
					>
						<span className="line-clamp-2">{page.title}</span>
						<ArrowRightIcon aria-hidden="true" className="size-3.5 shrink-0 text-emerald-200" />
					</a>
				))}
				{hiddenCount > 0 ? (
					<a
						href="/campagnes-etudiants"
						className="flex min-h-12 items-center justify-between gap-3 rounded-md border border-emerald-200/20 bg-emerald-200/10 px-3 py-2 font-semibold text-emerald-100 text-sm transition-colors hover:bg-emerald-200/16"
					>
						<span>+{hiddenCount} autres pages dans le sitemap public</span>
						<ArrowRightIcon aria-hidden="true" className="size-3.5 shrink-0 text-emerald-200" />
					</a>
				) : null}
			</div>
		</section>
	);
}
