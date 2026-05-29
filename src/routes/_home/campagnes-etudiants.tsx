import {
	ArrowRightIcon,
	BriefcaseIcon,
	ChatsCircleIcon,
	FileTextIcon,
	GraduationCapIcon,
	LinkIcon,
	MapPinIcon,
} from "@phosphor-icons/react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { defaultSEO, generateCanonicalLink, generateMetaTags } from "@/utils/seo";
import { findTrafficLandingPage, trafficLandingPages } from "./-sections/traffic-landing";

const pagePath = "/campagnes-etudiants";

const campaignTracks = [
	{
		title: "Semaine CV étudiant",
		text: "Une campagne courte pour pousser les étudiants à créer un CV propre avant les stages.",
		image: "/home/tool-cv-intelligent.webp",
		icon: FileTextIcon,
		links: ["/cv-sans-experience", "/cv-etudiant", "/cv-bts-dut", "/cv-technicien-specialise"],
	},
	{
		title: "Stages par ville",
		text: "Une campagne locale pour capter les étudiants qui cherchent près de chez eux.",
		image: "/home/city-casablanca.webp",
		icon: MapPinIcon,
		links: ["/stage-casablanca", "/stage-rabat", "/stage-tanger", "/stage-agadir"],
	},
	{
		title: "Préparation entretien",
		text: "Une campagne de confiance avant les appels, stages de fin d'études et premiers emplois.",
		image: "/home/tool-interview-prep.webp",
		icon: ChatsCircleIcon,
		links: ["/questions-entretien-stage", "/pitch-entretien", "/entretien-hse", "/entretien-bts-dut"],
	},
	{
		title: "Métiers techniques",
		text: "Une campagne pour les filières HSE, maintenance, logistique, santé et industrie.",
		image: "/home/tool-skills-assessment.webp",
		icon: BriefcaseIcon,
		links: ["/cv-hse", "/stage-maintenance-industrielle", "/cv-logistique-casablanca", "/entretien-sante"],
	},
	{
		title: "Orientation & inscriptions",
		text: "Une campagne pour capter les futurs etudiants avant le choix de formation.",
		image: "/home/student-career-workshop.webp",
		icon: GraduationCapIcon,
		links: [
			"/orientation-apres-bac",
			"/formation-professionnelle-maroc",
			"/parents-etudiants-imta",
			"/inscription-formation-avec-stage",
		],
	},
];

const copyBlocks = [
	{
		label: "WhatsApp",
		title: "Message groupe étudiants",
		text: "Tu cherches un stage ou tu dois refaire ton CV ? IMTA Resume te donne un CV propre, des pages par ville et des conseils d'entretien adaptés aux étudiants au Maroc.",
	},
	{
		label: "Instagram",
		title: "Caption courte",
		text: "Ton futur stage commence par un CV clair. Crée ton CV gratuitement, prépare ton entretien et trouve les bonnes ressources selon ta ville ou ton métier.",
	},
	{
		label: "LinkedIn",
		title: "Post école / partenaire",
		text: "Nous accompagnons les étudiants marocains avec des ressources publiques pour le CV, les stages, les entretiens, les lettres de motivation et les profils LinkedIn.",
	},
	{
		label: "Campus",
		title: "Phrase QR code",
		text: "Scanne, crée ton CV gratuitement et prépare ton prochain stage avec les guides IMTA Resume.",
	},
	{
		label: "Email",
		title: "Message formateur",
		text: "Voici une ressource pratique à partager avec les étudiants: CV, stage, entretien, lettre de motivation, LinkedIn et pages par ville ou métier.",
	},
	{
		label: "Partenaire",
		title: "Phrase institutionnelle",
		text: "IMTA Resume relie l'accompagnement pédagogique à l'insertion professionnelle avec des ressources simples, publiques et orientées action.",
	},
];

const pageBundles = [
	{
		title: "Pack premier CV",
		links: ["/cv-sans-experience", "/cv-etudiant", "/cv-debutant", "/linkedin-etudiant"],
	},
	{
		title: "Pack stage Casablanca",
		links: ["/stage-casablanca", "/cv-hse-casablanca", "/stage-logistique-casablanca", "/email-candidature-stage"],
	},
	{
		title: "Pack BTS / DUT",
		links: ["/cv-bts-dut", "/stage-bts-dut", "/entretien-bts-dut", "/questions-entretien-stage"],
	},
	{
		title: "Pack entretien",
		links: [
			"/preparation-entretien",
			"/questions-entretien-stage",
			"/pitch-entretien",
			"/entretien-maintenance-industrielle",
		],
	},
	{
		title: "Pack orientation IMTA",
		links: [
			"/orientation-apres-bac",
			"/choisir-metier-technique",
			"/formation-professionnelle-maroc",
			"/imta-carriere-etudiants",
		],
	},
	{
		title: "Pack familles",
		links: [
			"/parents-etudiants-imta",
			"/ecole-qui-aide-a-trouver-stage",
			"/inscription-formation-avec-stage",
			"/atelier-cv-etudiants",
		],
	},
];

const visualPreviews = [
	{
		type: "Affiche campus",
		title: "Ton CV ouvre les bonnes portes.",
		text: "Crée ton CV gratuitement et prépare ton prochain stage avec IMTA Resume.",
		shape: "poster",
	},
	{
		type: "Story Instagram",
		title: "Stage bientôt ? Prépare ton CV aujourd'hui.",
		text: "CV, entretien, lettre de motivation et pages par ville.",
		shape: "story",
	},
	{
		type: "Post LinkedIn",
		title: "Ressources concrètes.",
		text: "Plus de pages publiques pour aider chaque étudiant à passer à l'action.",
		shape: "post",
	},
];

export const Route = createFileRoute("/_home/campagnes-etudiants")({
	component: RouteComponent,
	head: () => {
		const appUrl = (typeof process !== "undefined" ? process.env.APP_URL : undefined) ?? "https://imta.ma/";
		const url = new URL(pagePath, appUrl).toString();

		return {
			links: [generateCanonicalLink(url)],
			meta: generateMetaTags({
				title: "Campagnes étudiants | IMTA Resume",
				description:
					"Messages, packs de pages et campagnes publiques pour promouvoir IMTA Resume auprès des étudiants au Maroc.",
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
			<section className="grid overflow-hidden bg-[#f7fbfa] lg:min-h-[650px] lg:grid-cols-[0.9fr_1.1fr]">
				<div className="flex items-center px-6 py-16 md:px-10 lg:px-14">
					<div className="max-w-2xl">
						<p className="inline-flex items-center rounded-full border border-emerald-900/10 bg-white px-3 py-1.5 font-semibold text-emerald-900 text-sm shadow-sm">
							Campagnes publiques
						</p>
						<h1 className="mt-5 font-display text-5xl text-zinc-950 leading-[1.02] md:text-6xl">
							Des hooks prêts à partager pour attirer plus d'étudiants.
						</h1>
						<p className="mt-7 max-w-xl text-lg text-zinc-600 leading-8">
							Utilise les pages IMTA Resume comme des campagnes: CV, stage, entretien, métiers techniques, villes et
							parcours étudiants.
						</p>
						<div className="mt-9 flex flex-col gap-4 sm:flex-row">
							<Link
								to="/dashboard"
								className="inline-flex h-14 items-center justify-center rounded-xl bg-[linear-gradient(135deg,#006b53,#00a88a)] px-7 font-semibold text-white shadow-[0_22px_44px_-26px_rgba(0,107,83,0.95)] transition-transform hover:-translate-y-0.5"
							>
								Créer mon CV
							</Link>
							<a
								href="/ressources-etudiants-maroc"
								className="inline-flex h-14 items-center justify-center rounded-xl border border-emerald-950/15 bg-white px-7 font-semibold text-zinc-900 shadow-sm transition-colors hover:border-emerald-800 hover:text-emerald-800"
							>
								Ressources
							</a>
							<a
								href="/plan-marketing-etudiants"
								className="inline-flex h-14 items-center justify-center rounded-xl border border-emerald-950/15 bg-white px-7 font-semibold text-zinc-900 shadow-sm transition-colors hover:border-emerald-800 hover:text-emerald-800"
							>
								Plan marketing
							</a>
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
					<div className="mb-10 grid gap-6 rounded-2xl border border-emerald-900/15 bg-[#f3faf8] p-6 shadow-[0_18px_56px_-50px_rgba(0,74,59,0.66)] lg:grid-cols-[0.82fr_1.18fr] lg:items-center">
						<div>
							<p className="font-semibold text-emerald-800 text-sm">Plan de diffusion</p>
							<h2 className="mt-3 font-display text-4xl text-zinc-950 leading-tight">
								Un calendrier public pour publier sans improviser.
							</h2>
						</div>
						<div className="flex flex-col gap-4 sm:flex-row lg:justify-end">
							<a
								href="/plan-marketing-etudiants"
								className="inline-flex h-13 items-center justify-center gap-3 rounded-xl bg-[linear-gradient(135deg,#006b53,#00a88a)] px-6 font-semibold text-white shadow-[0_18px_38px_-24px_rgba(0,107,83,0.9)] transition-transform hover:-translate-y-0.5"
							>
								Ouvrir le plan marketing
								<ArrowRightIcon aria-hidden="true" className="size-4" />
							</a>
							<a
								href="/ressources-etudiants-maroc"
								className="inline-flex h-13 items-center justify-center gap-3 rounded-xl border border-emerald-950/15 bg-white px-6 font-semibold text-zinc-900 shadow-sm transition-colors hover:border-emerald-800 hover:text-emerald-800"
							>
								Catalogue des pages
								<ArrowRightIcon aria-hidden="true" className="size-4" />
							</a>
						</div>
					</div>
					<div className="mx-auto max-w-3xl text-center">
						<h2 className="font-display text-4xl text-zinc-950 leading-tight md:text-5xl">
							Cinq campagnes à lancer rapidement.
						</h2>
						<p className="mt-4 text-zinc-600 leading-7">
							Chaque campagne pointe vers des pages publiques déjà prêtes, avec une intention claire pour l'étudiant.
						</p>
					</div>
					<div className="mt-10 grid gap-5 md:grid-cols-2">
						{campaignTracks.map((track) => (
							<CampaignTrack key={track.title} track={track} />
						))}
					</div>
				</div>
			</section>

			<section className="bg-[linear-gradient(135deg,#063b32,#008d78)] py-16 text-white md:py-20">
				<div className="mx-auto max-w-7xl px-6 lg:px-10">
					<div className="grid gap-8 lg:grid-cols-[0.78fr_1.22fr]">
						<div>
							<h2 className="font-display text-4xl leading-tight md:text-5xl">Copies prêtes à publier.</h2>
							<p className="mt-4 text-white/65 leading-7">
								Des messages courts pour WhatsApp, Instagram, LinkedIn, email, campus et partenaires.
							</p>
						</div>
						<div className="grid gap-4 md:grid-cols-2">
							{copyBlocks.map((block) => (
								<article key={block.label} className="rounded-lg border border-white/12 bg-white/[0.06] p-5">
									<p className="font-semibold text-emerald-300 text-sm">{block.label}</p>
									<h3 className="mt-2 font-semibold text-white">{block.title}</h3>
									<p className="mt-3 text-[15px] text-white/68 leading-7">{block.text}</p>
								</article>
							))}
						</div>
					</div>
				</div>
			</section>

			<section className="bg-white py-16 md:py-20">
				<div className="mx-auto max-w-7xl px-6 lg:px-10">
					<div className="grid gap-8 lg:grid-cols-[0.72fr_1.28fr] lg:items-start">
						<div>
							<p className="font-semibold text-emerald-800 text-sm">Visuels de campagne</p>
							<h2 className="mt-4 font-display text-4xl text-zinc-950 leading-tight md:text-5xl">
								Des formats prêts à reprendre pour le public.
							</h2>
							<p className="mt-4 text-zinc-600 leading-7">
								Affiche campus, story et post LinkedIn utilisent le même message: un CV clair, puis une action rapide.
							</p>
						</div>
						<div className="grid gap-5 md:grid-cols-3">
							{visualPreviews.map((visual) => (
								<VisualPreview key={visual.type} visual={visual} />
							))}
						</div>
					</div>
				</div>
			</section>

			<section className="bg-white py-16 md:py-20">
				<div className="mx-auto max-w-7xl px-6 lg:px-10">
					<div className="grid gap-8 lg:grid-cols-[0.82fr_1.18fr]">
						<div>
							<p className="font-semibold text-emerald-800 text-sm">{trafficLandingPages.length}+ pages publiques</p>
							<h2 className="mt-4 font-display text-4xl text-zinc-950 leading-tight md:text-5xl">
								Packs de pages pour des campagnes ciblées.
							</h2>
							<p className="mt-4 text-zinc-600 leading-7">
								Regroupe les bons liens selon le moment: premier CV, stage local, filière, entretien ou visibilité.
							</p>
						</div>
						<div className="grid gap-4 md:grid-cols-2">
							{pageBundles.map((bundle) => (
								<PageBundle key={bundle.title} bundle={bundle} />
							))}
						</div>
					</div>
				</div>
			</section>

			<section className="grid overflow-hidden bg-[linear-gradient(135deg,#063b32,#008d78)] text-white lg:grid-cols-[0.95fr_1.05fr]">
				<div className="flex items-center px-6 py-14 md:px-10 lg:px-14">
					<div className="max-w-xl">
						<h2 className="font-display text-4xl leading-tight md:text-5xl">
							Chaque campagne doit ramener vers une action.
						</h2>
						<p className="mt-4 text-white/74 leading-7">
							Les étudiants doivent pouvoir lire, cliquer, créer un CV et préparer la prochaine étape sans friction.
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

function VisualPreview({ visual }: { visual: { type: string; title: string; text: string; shape: string } }) {
	const isPost = visual.shape === "post";

	return (
		<article className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
			<div
				className={
					isPost
						? "aspect-[4/3] overflow-hidden rounded-md bg-emerald-950 p-4 text-white"
						: "aspect-[3/4] overflow-hidden rounded-md bg-emerald-950 p-5 text-white"
				}
			>
				<div className="flex items-center gap-2">
					<div className="flex size-8 items-center justify-center rounded-md bg-white text-emerald-900">
						<FileTextIcon aria-hidden="true" className="size-4" weight="fill" />
					</div>
					<p className="font-semibold text-sm">IMTA Resume</p>
				</div>
				<div className={isPost ? "mt-5" : "mt-8"}>
					<p className="font-semibold text-emerald-200 text-xs">{visual.type}</p>
					<h3
						className={isPost ? "mt-2 font-display text-2xl leading-tight" : "mt-3 font-display text-3xl leading-tight"}
					>
						{visual.title}
					</h3>
					<p className={isPost ? "mt-3 text-white/72 text-xs leading-5" : "mt-4 text-sm text-white/72 leading-6"}>
						{visual.text}
					</p>
				</div>
				<div
					className={isPost ? "mt-4 flex items-end justify-between gap-3" : "mt-7 flex items-end justify-between gap-4"}
				>
					<span className="rounded-md bg-white px-3 py-2 font-semibold text-emerald-950 text-xs">Créer mon CV</span>
					<span
						className={
							isPost
								? "grid size-12 place-items-center rounded-md bg-white/92 text-[9px] text-emerald-950 leading-tight"
								: "grid size-16 place-items-center rounded-md bg-white/92 text-[10px] text-emerald-950 leading-tight"
						}
					>
						QR
						<br />
						IMTA
					</span>
				</div>
			</div>
			<p className="mt-3 font-semibold text-sm text-zinc-950">{visual.type}</p>
			<p className="mt-1 text-xs text-zinc-500">Texte code-native, facile à adapter.</p>
		</article>
	);
}

function CampaignTrack({
	track,
}: {
	track: {
		title: string;
		text: string;
		image: string;
		icon: typeof FileTextIcon;
		links: string[];
	};
}) {
	const Icon = track.icon;

	return (
		<article className="grid overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-[0_18px_48px_-42px_rgba(20,40,30,0.4)] sm:grid-cols-[12rem_1fr]">
			<img
				src={track.image}
				alt=""
				aria-hidden="true"
				loading="lazy"
				decoding="async"
				width={420}
				height={360}
				className="h-full min-h-52 w-full object-cover"
			/>
			<div className="p-5">
				<div className="mb-4 flex size-11 items-center justify-center rounded-md bg-emerald-50 text-emerald-800">
					<Icon aria-hidden="true" className="size-6" weight="duotone" />
				</div>
				<h3 className="font-display text-2xl text-zinc-950 leading-tight">{track.title}</h3>
				<p className="mt-3 text-[15px] text-zinc-600 leading-7">{track.text}</p>
				<div className="mt-5 grid gap-2">
					{track.links.map((href) => (
						<PageMiniLink key={href} href={href} />
					))}
				</div>
			</div>
		</article>
	);
}

function PageBundle({ bundle }: { bundle: { title: string; links: string[] } }) {
	return (
		<article className="rounded-lg border border-zinc-200 bg-white p-5">
			<h3 className="font-semibold text-zinc-950">{bundle.title}</h3>
			<div className="mt-4 grid gap-2">
				{bundle.links.map((href) => (
					<PageMiniLink key={href} href={href} />
				))}
			</div>
		</article>
	);
}

function PageMiniLink({ href }: { href: string }) {
	const page = findTrafficLandingPage(href);
	const label = page?.title ?? href.replace("/", "");

	return (
		<a
			href={href}
			className="flex min-h-10 items-center justify-between gap-3 rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-700 transition-colors hover:border-emerald-800/35 hover:bg-emerald-50 hover:text-emerald-900"
		>
			<span className="line-clamp-1">{label}</span>
			<LinkIcon aria-hidden="true" className="size-3.5 shrink-0 text-emerald-800" />
		</a>
	);
}
