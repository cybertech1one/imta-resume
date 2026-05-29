import {
	ArrowRightIcon,
	BriefcaseIcon,
	CalendarIcon,
	ChartLineUpIcon,
	ChatsCircleIcon,
	FileTextIcon,
	GraduationCapIcon,
	LinkIcon,
	MapPinIcon,
	UsersIcon,
} from "@phosphor-icons/react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { defaultSEO, generateCanonicalLink, generateMetaTags } from "@/utils/seo";
import { findTrafficLandingPage, trafficLandingPages } from "./-sections/traffic-landing";

const pagePath = "/plan-marketing-etudiants";

const launchWeeks = [
	{
		week: "Semaine 1",
		title: "Faire connaître le CV gratuit",
		text: "Lancer les messages simples: CV sans expérience, premier CV, CV BTS/DUT et atelier CV.",
		icon: FileTextIcon,
		links: ["/cv-sans-experience", "/cv-etudiant", "/cv-bts-dut", "/atelier-cv-etudiants"],
	},
	{
		week: "Semaine 2",
		title: "Pousser les stages par ville",
		text: "Partager les pages locales pour capter les recherches immédiates par ville et domaine.",
		icon: MapPinIcon,
		links: ["/stage-casablanca", "/stage-rabat", "/stage-tanger", "/stage-fin-etudes-casablanca"],
	},
	{
		week: "Semaine 3",
		title: "Créer la confiance entretien",
		text: "Mettre en avant les questions fréquentes, pitch, questions pièges et préparation technique.",
		icon: ChatsCircleIcon,
		links: ["/preparation-entretien", "/questions-entretien-stage", "/pitch-entretien", "/questions-piege-entretien"],
	},
	{
		week: "Semaine 4",
		title: "Attirer futurs étudiants et familles",
		text: "Montrer l'accompagnement IMTA: orientation, formation, stage, parents et insertion.",
		icon: GraduationCapIcon,
		links: [
			"/orientation-apres-bac",
			"/formation-professionnelle-maroc",
			"/parents-etudiants-imta",
			"/inscription-formation-avec-stage",
		],
	},
];

const channelPlans = [
	{
		channel: "WhatsApp",
		action: "Partager un lien court dans les groupes de classe avec une phrase directe et un seul objectif.",
		cadence: "3 messages par semaine",
		icon: UsersIcon,
	},
	{
		channel: "Instagram",
		action: "Transformer chaque page en story: question, mini-réponse, bouton vers le CV ou la page stage.",
		cadence: "4 stories + 2 posts",
		icon: ChartLineUpIcon,
	},
	{
		channel: "LinkedIn",
		action: "Publier la preuve d'accompagnement pour écoles, recruteurs, partenaires et anciens étudiants.",
		cadence: "2 posts par semaine",
		icon: BriefcaseIcon,
	},
	{
		channel: "Campus",
		action: "Utiliser affiches, QR codes et ateliers CV pour ramener vers les pages publiques.",
		cadence: "1 activation par filière",
		icon: GraduationCapIcon,
	},
	{
		channel: "Formateurs",
		action: "Donner des packs de liens par classe: CV, stage, entretien, orientation et domaine métier.",
		cadence: "1 pack par groupe",
		icon: FileTextIcon,
	},
	{
		channel: "Parents",
		action: "Partager les pages qui expliquent comment IMTA accompagne l'étudiant vers le stage.",
		cadence: "1 message d'information",
		icon: UsersIcon,
	},
];

const dailyActions = [
	{ day: "Jour 1", task: "Publier le message CV sans expérience", href: "/cv-sans-experience" },
	{ day: "Jour 2", task: "Partager le pack stage Casablanca/Rabat/Tanger", href: "/campagnes-etudiants" },
	{ day: "Jour 3", task: "Story Instagram: préparer son entretien", href: "/preparation-entretien" },
	{ day: "Jour 4", task: "Post LinkedIn sur l'accompagnement IMTA", href: "/imta-carriere-etudiants" },
	{ day: "Jour 5", task: "Message parents: orientation et stage", href: "/parents-etudiants-imta" },
	{ day: "Jour 6", task: "Atelier CV en classe ou campus", href: "/atelier-cv-etudiants" },
	{ day: "Jour 7", task: "Relancer avec les pages métier HSE/maintenance/logistique", href: "/metiers-techniques" },
	{ day: "Jour 8", task: "Publier stage de fin d'études", href: "/stage-fin-etudes" },
	{ day: "Jour 9", task: "Mettre en avant LinkedIn étudiant", href: "/linkedin-etudiant" },
	{ day: "Jour 10", task: "Diriger vers le catalogue complet", href: "/ressources-etudiants-maroc" },
];

const copyAngles = [
	{
		title: "Hook étudiant",
		text: "Tu cherches un stage ? Commence par un CV clair, puis prépare ton email et ton entretien avec les pages IMTA Resume.",
	},
	{
		title: "Hook parent",
		text: "IMTA accompagne les étudiants au-delà des cours: CV, stage, entretien, orientation et premiers pas professionnels.",
	},
	{
		title: "Hook formateur",
		text: "Voici un pack simple pour aider la classe à passer de la formation à une candidature prête à envoyer.",
	},
	{
		title: "Hook partenaire",
		text: "Les pages publiques IMTA Resume rendent l'insertion plus visible: chaque recherche mène vers une action concrète.",
	},
];

const priorityLinks = [
	"/orientation-apres-bac",
	"/formation-professionnelle-maroc",
	"/stage-fin-etudes",
	"/cv-sans-experience",
	"/preparation-entretien",
	"/parents-etudiants-imta",
];

export const Route = createFileRoute("/_home/plan-marketing-etudiants")({
	component: RouteComponent,
	head: () => {
		const appUrl = (typeof process !== "undefined" ? process.env.APP_URL : undefined) ?? "https://imta.ma/";
		const url = new URL(pagePath, appUrl).toString();

		return {
			links: [generateCanonicalLink(url)],
			meta: generateMetaTags({
				title: "Plan marketing étudiants | IMTA Resume",
				description:
					"Plan public de 30 jours pour promouvoir IMTA Resume auprès des étudiants: CV, stages, entretiens, orientation, familles et campus.",
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
			<section className="grid overflow-hidden bg-[#f7fbfa] lg:min-h-[660px] lg:grid-cols-[0.9fr_1.1fr]">
				<div className="flex items-center px-6 py-16 md:px-10 lg:px-14">
					<div className="max-w-2xl">
						<p className="inline-flex items-center rounded-full border border-emerald-900/10 bg-white px-3 py-1.5 font-semibold text-emerald-900 text-sm shadow-sm">
							Plan marketing public
						</p>
						<h1 className="mt-5 font-display text-5xl text-zinc-950 leading-[1.02] md:text-6xl">
							30 jours pour transformer les pages IMTA en inscriptions et actions.
						</h1>
						<p className="mt-7 max-w-xl text-lg text-zinc-600 leading-8">
							Un plan concret pour diffuser les pages CV, stage, entretien, orientation et familles sur les bons canaux,
							avec les bons messages.
						</p>
						<div className="mt-9 flex flex-col gap-4 sm:flex-row">
							<Link
								to="/dashboard"
								className="inline-flex h-14 items-center justify-center rounded-xl bg-[linear-gradient(135deg,#006b53,#00a88a)] px-7 font-semibold text-white shadow-[0_22px_44px_-26px_rgba(0,107,83,0.95)] transition-transform hover:-translate-y-0.5"
							>
								Créer mon CV gratuitement
							</Link>
							<a
								href="/campagnes-etudiants"
								className="inline-flex h-14 items-center justify-center rounded-xl border border-emerald-950/15 bg-white px-7 font-semibold text-zinc-900 shadow-sm transition-colors hover:border-emerald-800 hover:text-emerald-800"
							>
								Voir les campagnes
							</a>
						</div>
						<div className="mt-10 grid grid-cols-3 gap-4">
							<HeroStat value="30" label="jours d'actions" />
							<HeroStat value="6" label="canaux" />
							<HeroStat value={`${trafficLandingPages.length}+`} label="pages publiques" />
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
						className="absolute inset-0 size-full object-cover object-[56%_center]"
					/>
					<div
						aria-hidden="true"
						className="absolute inset-y-0 left-0 hidden w-1/4 bg-gradient-to-r from-white to-transparent lg:block"
					/>
				</div>
			</section>

			<section className="bg-white py-16 md:py-20">
				<div className="mx-auto max-w-7xl px-6 lg:px-10">
					<div className="mx-auto max-w-3xl text-center">
						<h2 className="font-display text-4xl text-zinc-950 leading-tight md:text-5xl">
							Le calendrier de lancement.
						</h2>
						<p className="mt-4 text-zinc-600 leading-7">
							Chaque semaine pousse une intention forte et renvoie vers un pack de pages publiques.
						</p>
					</div>
					<div className="mt-10 grid gap-5 md:grid-cols-2">
						{launchWeeks.map((week) => (
							<LaunchWeek key={week.week} week={week} />
						))}
					</div>
				</div>
			</section>

			<section className="bg-[linear-gradient(135deg,#063b32,#008d78)] py-16 text-white md:py-20">
				<div className="mx-auto max-w-7xl px-6 lg:px-10">
					<div className="grid gap-8 lg:grid-cols-[0.78fr_1.22fr]">
						<div>
							<p className="font-semibold text-emerald-300 text-sm">Distribution</p>
							<h2 className="mt-4 font-display text-4xl leading-tight md:text-5xl">
								Les bons canaux pour toucher les étudiants.
							</h2>
							<p className="mt-4 text-white/65 leading-7">
								Le plan évite de publier au hasard: chaque canal a un rôle, une cadence et un message.
							</p>
						</div>
						<div className="grid gap-4 md:grid-cols-2">
							{channelPlans.map((channel) => {
								const Icon = channel.icon;

								return (
									<article key={channel.channel} className="rounded-lg border border-white/12 bg-white/[0.06] p-5">
										<div className="mb-4 flex items-center gap-3">
											<div className="flex size-10 items-center justify-center rounded-md bg-emerald-300/12 text-emerald-200">
												<Icon aria-hidden="true" className="size-5" weight="duotone" />
											</div>
											<div>
												<h3 className="font-semibold text-white">{channel.channel}</h3>
												<p className="text-emerald-200 text-xs">{channel.cadence}</p>
											</div>
										</div>
										<p className="text-[15px] text-white/68 leading-7">{channel.action}</p>
									</article>
								);
							})}
						</div>
					</div>
				</div>
			</section>

			<section className="bg-white py-16 md:py-20">
				<div className="mx-auto max-w-7xl px-6 lg:px-10">
					<div className="grid gap-8 lg:grid-cols-[0.72fr_1.28fr]">
						<div>
							<p className="font-semibold text-emerald-800 text-sm">Premiers jours</p>
							<h2 className="mt-4 font-display text-4xl text-zinc-950 leading-tight md:text-5xl">
								10 actions pour démarrer sans attendre.
							</h2>
							<p className="mt-4 text-zinc-600 leading-7">
								Cette séquence peut être relancée chaque mois avec une ville, un domaine ou une classe différente.
							</p>
						</div>
						<div className="grid gap-3">
							{dailyActions.map((action) => (
								<a
									key={action.day}
									href={action.href}
									className="grid gap-3 rounded-lg border border-zinc-200 bg-white p-4 transition-colors hover:border-emerald-800/35 sm:grid-cols-[6rem_1fr_auto] sm:items-center"
								>
									<span className="font-display text-2xl text-emerald-800">{action.day}</span>
									<span className="font-semibold text-zinc-950">{action.task}</span>
									<ArrowRightIcon aria-hidden="true" className="size-4 text-emerald-800" />
								</a>
							))}
						</div>
					</div>
				</div>
			</section>

			<section className="bg-emerald-50/40 py-16 md:py-20">
				<div className="mx-auto max-w-7xl px-6 lg:px-10">
					<div className="grid gap-8 lg:grid-cols-[0.82fr_1.18fr]">
						<div>
							<h2 className="font-display text-4xl text-zinc-950 leading-tight md:text-5xl">
								Copies prêtes pour parler aux bons publics.
							</h2>
							<p className="mt-4 text-zinc-600 leading-7">
								Chaque angle peut devenir un post, une story, un message WhatsApp ou une phrase sous QR code.
							</p>
						</div>
						<div className="grid gap-4 md:grid-cols-2">
							{copyAngles.map((copy) => (
								<article key={copy.title} className="rounded-lg border border-emerald-900/15 bg-white p-5">
									<h3 className="font-semibold text-emerald-900">{copy.title}</h3>
									<p className="mt-3 text-[15px] text-zinc-600 leading-7">{copy.text}</p>
								</article>
							))}
						</div>
					</div>
				</div>
			</section>

			<section className="bg-white py-16 md:py-20">
				<div className="mx-auto max-w-7xl px-6 lg:px-10">
					<div className="mx-auto max-w-3xl text-center">
						<h2 className="font-display text-4xl text-zinc-950 leading-tight md:text-5xl">
							Les liens à garder sous la main.
						</h2>
						<p className="mt-4 text-zinc-600 leading-7">
							Ce sont les pages à mettre dans les QR codes, messages d'accueil, groupes de classe et posts partenaires.
						</p>
					</div>
					<div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
						{priorityLinks.map((href) => (
							<PriorityLink key={href} href={href} />
						))}
					</div>
				</div>
			</section>

			<section className="grid overflow-hidden bg-[linear-gradient(135deg,#063b32,#008d78)] text-white lg:grid-cols-[0.95fr_1.05fr]">
				<div className="flex items-center px-6 py-14 md:px-10 lg:px-14">
					<div className="max-w-xl">
						<h2 className="font-display text-4xl leading-tight md:text-5xl">
							Le marketing doit ramener vers une action utile.
						</h2>
						<p className="mt-4 text-white/74 leading-7">
							Chaque message doit proposer un lien, une prochaine étape et un résultat simple pour l'étudiant.
						</p>
						<Link
							to="/dashboard"
							className="mt-8 inline-flex h-13 items-center gap-3 rounded-md bg-white px-7 font-semibold text-emerald-950"
						>
							Créer mon CV gratuitement
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

function LaunchWeek({
	week,
}: {
	week: {
		week: string;
		title: string;
		text: string;
		icon: typeof FileTextIcon;
		links: string[];
	};
}) {
	const Icon = week.icon;

	return (
		<article className="rounded-lg border border-zinc-200 bg-white p-5 shadow-[0_18px_48px_-42px_rgba(20,40,30,0.4)]">
			<div className="mb-4 flex items-center gap-3">
				<div className="flex size-11 items-center justify-center rounded-md bg-emerald-50 text-emerald-800">
					<Icon aria-hidden="true" className="size-6" weight="duotone" />
				</div>
				<div>
					<p className="font-semibold text-emerald-800 text-sm">{week.week}</p>
					<h3 className="font-display text-2xl text-zinc-950 leading-tight">{week.title}</h3>
				</div>
			</div>
			<p className="text-[15px] text-zinc-600 leading-7">{week.text}</p>
			<div className="mt-5 grid gap-2">
				{week.links.map((href) => (
					<PriorityLink key={href} href={href} compact />
				))}
			</div>
		</article>
	);
}

function PriorityLink({ href, compact = false }: { href: string; compact?: boolean }) {
	const page = findTrafficLandingPage(href);
	const label = page?.title ?? href.replace("/", "");
	const description = page?.audience ?? "Page publique IMTA Resume";

	return (
		<a
			href={href}
			className={
				compact
					? "flex min-h-10 items-center justify-between gap-3 rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-700 transition-colors hover:border-emerald-800/35 hover:bg-emerald-50 hover:text-emerald-900"
					: "group rounded-lg border border-zinc-200 bg-white p-5 transition-colors hover:border-emerald-800/35"
			}
		>
			{compact ? (
				<>
					<span className="line-clamp-1">{label}</span>
					<LinkIcon aria-hidden="true" className="size-3.5 shrink-0 text-emerald-800" />
				</>
			) : (
				<>
					<div className="mb-4 flex size-10 items-center justify-center rounded-md bg-emerald-50 text-emerald-800">
						<CalendarIcon aria-hidden="true" className="size-5" weight="duotone" />
					</div>
					<h3 className="font-semibold text-zinc-950">{label}</h3>
					<p className="mt-2 line-clamp-2 text-sm text-zinc-500 leading-6">{description}</p>
					<span className="mt-5 inline-flex items-center gap-2 font-semibold text-emerald-800 text-sm">
						Ouvrir
						<ArrowRightIcon aria-hidden="true" className="size-4 transition-transform group-hover:translate-x-1" />
					</span>
				</>
			)}
		</a>
	);
}
