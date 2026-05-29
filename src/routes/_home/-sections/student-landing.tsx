import {
	ArrowRightIcon,
	BriefcaseIcon,
	ChatsCircleIcon,
	CheckIcon,
	EnvelopeSimpleIcon,
	FileTextIcon,
	GraduationCapIcon,
	LinkedinLogoIcon,
	MagnifyingGlassIcon,
} from "@phosphor-icons/react";
import { Link } from "@tanstack/react-router";
import { trafficLandingPages } from "./traffic-landing";

const objectives = [
	{
		title: "CV sans expérience",
		text: "Un CV clair et convaincant même sans expérience professionnelle.",
		href: "/cv-sans-experience",
		icon: FileTextIcon,
	},
	{
		title: "Trouver un stage",
		text: "Accède aux meilleurs réflexes pour chercher un stage au Maroc.",
		href: "/stage-maroc",
		icon: BriefcaseIcon,
		accent: true,
	},
	{
		title: "Réussir l'entretien",
		text: "Prépare-toi aux questions fréquentes et gagne en confiance.",
		href: "/preparation-entretien",
		icon: ChatsCircleIcon,
	},
	{
		title: "Lettre de motivation",
		text: "Rédige une lettre percutante adaptée à chaque candidature.",
		href: "/lettre-motivation-stage",
		icon: EnvelopeSimpleIcon,
	},
	{
		title: "LinkedIn étudiant",
		text: "Optimise ton profil et rends-toi visible auprès des recruteurs.",
		href: "/linkedin-etudiant",
		icon: LinkedinLogoIcon,
	},
];

const studentPaths = [
	{
		title: "Étudiant en BTS / DUT",
		text: "Valorise tes projets, stages et compétences techniques.",
		image: "/home/tool-skills-assessment.webp",
		href: "/metiers-techniques",
		checks: ["CV adapté aux recruteurs", "Mise en avant des compétences", "Exemples de CV inclus"],
	},
	{
		title: "Étudiant en licence / école",
		text: "Démarque-toi avec un CV moderne et des expériences valorisées.",
		image: "/home/tool-career-coaching.webp",
		href: "/cv-etudiant",
		checks: ["Structure professionnelle", "Projets académiques", "Conseils d'experts"],
	},
	{
		title: "Jeune diplômé",
		text: "Ton premier emploi commence par un CV solide.",
		image: "/home/tool-interview-prep.webp",
		href: "/cv-sans-experience",
		checks: ["CV percutant", "Lettre de motivation", "Préparation entretien"],
	},
	{
		title: "En reconversion",
		text: "Mets en avant tes compétences transférables et ton potentiel.",
		image: "/home/public-pages-morocco-hub.webp",
		href: "/pitch-entretien",
		checks: ["CV ciblé", "Nouveau projet pro", "Accompagnement pas à pas"],
	},
];

const cities = [
	{ name: "Casablanca", count: "1 250+ offres", image: "/home/city-casablanca.webp", href: "/stage-casablanca" },
	{ name: "Rabat", count: "980+ offres", image: "/home/city-rabat.webp", href: "/stage-rabat" },
	{ name: "Marrakech", count: "870+ offres", image: "/home/city-marrakech.webp", href: "/stage-marrakech" },
	{ name: "Fès", count: "760+ offres", image: "/home/city-fes.webp", href: "/stage-fes" },
	{ name: "Tanger", count: "650+ offres", image: "/home/city-tanger.webp", href: "/stage-tanger" },
	{ name: "Agadir", count: "540+ offres", image: "/home/city-agadir.webp", href: "/stage-agadir" },
];

const questions = [
	{ text: "Comment faire un CV sans expérience ?", href: "/cv-sans-experience" },
	{ text: "Quels sont les meilleurs sites pour trouver un stage au Maroc ?", href: "/stage-maroc" },
	{ text: "Comment réussir un entretien d'embauche ?", href: "/questions-entretien-stage" },
	{ text: "Quel modèle de CV choisir selon ma formation ?", href: "/cv-etudiant" },
	{ text: "Faut-il mettre une photo sur son CV au Maroc ?", href: "/cv-etudiant" },
	{ text: "Comment améliorer mon profil LinkedIn étudiant ?", href: "/linkedin-etudiant" },
];

const guides = [
	{ title: "Exemples de CV par domaine", image: "/home/tool-cv-intelligent.webp", href: "/metiers-techniques" },
	{
		title: "Réussir son entretien : les bons réflexes",
		image: "/home/tool-interview-prep.webp",
		href: "/questions-entretien-stage",
	},
	{
		title: "Rédiger une lettre de motivation efficace",
		image: "/home/tool-ats-optimization.webp",
		href: "/lettre-motivation-stage",
	},
	{
		title: "Booster son profil LinkedIn étudiant",
		image: "/home/tool-career-coaching.webp",
		href: "/linkedin-etudiant",
	},
];

const publicPageHighlights = [
	{ title: "CV sans expérience", href: "/cv-sans-experience", image: "/home/tool-cv-intelligent.webp" },
	{ title: "Stage à Casablanca", href: "/stage-casablanca", image: "/home/city-casablanca.webp" },
	{ title: "Orientation après bac", href: "/orientation-apres-bac", image: "/home/student-career-workshop.webp" },
	{ title: "Parents IMTA", href: "/parents-etudiants-imta", image: "/home/home-hero-students-career.webp" },
];

const popularSearchClusters = [
	{
		title: "Orientation",
		text: "Pour les futurs étudiants qui comparent les formations.",
		icon: GraduationCapIcon,
		links: [
			{ label: "Orientation après bac", href: "/orientation-apres-bac" },
			{ label: "Formation professionnelle", href: "/formation-professionnelle-maroc" },
			{ label: "Choisir un métier technique", href: "/choisir-metier-technique" },
		],
	},
	{
		title: "Premier CV",
		text: "Pour transformer une formation en candidature claire.",
		icon: FileTextIcon,
		links: [
			{ label: "CV sans expérience", href: "/cv-sans-experience" },
			{ label: "CV BTS / DUT", href: "/cv-bts-dut" },
			{ label: "CV formation professionnelle", href: "/cv-formation-professionnelle" },
		],
	},
	{
		title: "Stage local",
		text: "Pour chercher par ville, niveau ou domaine.",
		icon: BriefcaseIcon,
		links: [
			{ label: "Stage Casablanca", href: "/stage-casablanca" },
			{ label: "Stage fin d'études", href: "/stage-fin-etudes" },
			{ label: "Stage HSE Casablanca", href: "/stage-hse-casablanca" },
		],
	},
	{
		title: "Confiance",
		text: "Pour préparer l'appel et l'entretien.",
		icon: ChatsCircleIcon,
		links: [
			{ label: "Questions entretien", href: "/questions-entretien-stage" },
			{ label: "Pitch entretien", href: "/pitch-entretien" },
			{ label: "Questions pièges", href: "/questions-piege-entretien" },
		],
	},
];

export function StudentLanding() {
	return (
		<>
			<section className="grid min-h-[690px] bg-white pt-16 lg:grid-cols-[0.94fr_1.06fr]">
				<div className="flex items-center px-6 py-14 md:px-10 lg:px-14">
					<div className="max-w-2xl">
						<h1 className="font-display text-5xl text-zinc-950 leading-[1.02] md:text-6xl lg:text-[5.4rem]">
							Ton avenir commence ici.
							<span className="mt-1 block text-emerald-800">Ton CV ouvre les bonnes portes.</span>
						</h1>
						<p className="mt-7 max-w-xl text-lg text-zinc-600 leading-8">
							IMTA Resume aide les étudiants et jeunes diplômés au Maroc à créer un CV percutant, trouver un stage et
							réussir leurs entretiens.
						</p>
						<div className="mt-9 flex flex-col gap-4 sm:flex-row">
							<Link
								to="/dashboard"
								className="inline-flex h-14 items-center justify-center rounded-md bg-emerald-800 px-7 font-semibold text-white transition-colors hover:bg-emerald-900"
							>
								Créer mon CV gratuitement
							</Link>
							<a
								href="/preparation-entretien"
								className="inline-flex h-14 items-center justify-center rounded-md border border-zinc-200 bg-white px-7 font-semibold text-zinc-900 transition-colors hover:border-emerald-800 hover:text-emerald-800"
							>
								Préparer mon entretien
							</a>
						</div>
						<div className="mt-8 flex items-center gap-3">
							<div className="flex -space-x-2">
								{["A", "M", "Y", "S"].map((name) => (
									<span
										key={name}
										className="flex size-9 items-center justify-center rounded-full border-2 border-white bg-emerald-50 font-semibold text-emerald-900 text-xs"
									>
										{name}
									</span>
								))}
							</div>
							<p className="font-medium text-sm text-zinc-600">+50 000 étudiants nous font déjà confiance</p>
						</div>
					</div>
				</div>
				<div className="relative min-h-[460px] overflow-hidden lg:min-h-full">
					<img
						src="/home/home-hero-students-career.webp"
						alt=""
						aria-hidden="true"
						fetchPriority="high"
						decoding="async"
						width={1672}
						height={941}
						className="absolute inset-0 size-full object-cover object-[58%_center]"
					/>
					<div
						aria-hidden="true"
						className="absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-white to-transparent"
					/>
				</div>
			</section>

			<section id="objectifs" className="bg-white py-16 md:py-20">
				<div className="mx-auto max-w-7xl px-6 lg:px-10">
					<SectionTitle title="Choisis ton objectif" />
					<div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
						{objectives.map((objective) => {
							const Icon = objective.icon;

							return (
								<a
									key={objective.href}
									href={objective.href}
									className="group flex min-h-64 flex-col items-center rounded-lg border border-zinc-200 bg-white p-6 text-center shadow-[0_18px_48px_-44px_rgba(20,40,30,0.45)] transition-colors hover:border-emerald-800/40"
								>
									<div className={objective.accent ? "text-orange-600" : "text-emerald-800"}>
										<Icon aria-hidden="true" className="size-14" weight="duotone" />
									</div>
									<h3 className="mt-7 font-semibold text-lg text-zinc-950">{objective.title}</h3>
									<p className="mt-3 text-[15px] text-zinc-600 leading-6">{objective.text}</p>
									<ArrowRightIcon
										aria-hidden="true"
										className="mt-auto size-5 text-emerald-800 transition-transform group-hover:translate-x-1"
									/>
								</a>
							);
						})}
					</div>
				</div>
			</section>

			<section id="recherches-populaires" className="bg-zinc-50 py-16 md:py-20">
				<div className="mx-auto max-w-7xl px-6 lg:px-10">
					<div className="grid gap-8 lg:grid-cols-[0.82fr_1.18fr] lg:items-stretch">
						<a
							href="/orientation-apres-bac"
							className="group relative min-h-[420px] overflow-hidden rounded-lg bg-emerald-950 text-white"
						>
							<img
								src="/home/student-career-workshop.webp"
								alt=""
								aria-hidden="true"
								loading="eager"
								decoding="async"
								width={1440}
								height={810}
								className="absolute inset-0 size-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
							/>
							<div
								aria-hidden="true"
								className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,26,19,0.08)_0%,rgba(5,26,19,0.92)_100%)]"
							/>
							<div className="relative flex min-h-[420px] flex-col justify-end p-6 md:p-8">
								<p className="font-semibold text-emerald-100 text-sm">{trafficLandingPages.length}+ pages publiques</p>
								<h2 className="mt-3 max-w-xl font-display text-4xl leading-tight md:text-5xl">
									Des recherches étudiantes transformées en parcours clairs.
								</h2>
								<p className="mt-4 max-w-lg text-white/74 leading-7">
									Orientation, CV, stage et entretien: chaque porte d'entrée mène vers une action utile.
								</p>
								<span className="mt-7 inline-flex items-center gap-2 font-semibold text-emerald-100">
									Voir l'orientation après bac
									<ArrowRightIcon aria-hidden="true" className="size-4" />
								</span>
							</div>
						</a>

						<div className="grid gap-4 sm:grid-cols-2">
							{popularSearchClusters.map((cluster) => {
								const Icon = cluster.icon;

								return (
									<article key={cluster.title} className="rounded-lg border border-zinc-200 bg-white p-5">
										<div className="mb-4 flex items-start gap-3">
											<div className="flex size-11 shrink-0 items-center justify-center rounded-md bg-emerald-50 text-emerald-800">
												<Icon aria-hidden="true" className="size-6" weight="duotone" />
											</div>
											<div>
												<h3 className="font-semibold text-lg text-zinc-950">{cluster.title}</h3>
												<p className="mt-1 text-sm text-zinc-500 leading-6">{cluster.text}</p>
											</div>
										</div>
										<div className="grid gap-2">
											{cluster.links.map((link) => (
												<a
													key={link.href}
													href={link.href}
													className="flex min-h-11 items-center justify-between gap-3 rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-700 transition-colors hover:border-emerald-800/35 hover:bg-emerald-50 hover:text-emerald-900"
												>
													<span className="line-clamp-1">{link.label}</span>
													<ArrowRightIcon aria-hidden="true" className="size-3.5 shrink-0 text-emerald-800" />
												</a>
											))}
										</div>
									</article>
								);
							})}
						</div>
					</div>
				</div>
			</section>

			<section id="parcours" className="bg-white py-12 md:py-16">
				<div className="mx-auto max-w-7xl px-6 lg:px-10">
					<div className="mx-auto max-w-3xl text-center">
						<h2 className="font-display text-4xl text-zinc-950 leading-tight md:text-5xl">
							Des parcours pensés pour les étudiants marocains
						</h2>
						<p className="mt-3 text-zinc-600">Quel que soit ton niveau ou ton domaine, on t'accompagne de A à Z.</p>
					</div>
					<div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
						{studentPaths.map((path) => (
							<a
								key={path.href}
								href={path.href}
								className="group overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-[0_18px_48px_-42px_rgba(20,40,30,0.4)]"
							>
								<img
									src={path.image}
									alt=""
									aria-hidden="true"
									loading="lazy"
									decoding="async"
									width={720}
									height={430}
									className="aspect-[4/3] w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
								/>
								<div className="p-5">
									<h3 className="font-semibold text-lg text-zinc-950">{path.title}</h3>
									<p className="mt-2 text-[15px] text-zinc-600 leading-6">{path.text}</p>
									<ul className="mt-4 space-y-2">
										{path.checks.map((check) => (
											<li key={check} className="flex items-center gap-2 text-[14px] text-zinc-700">
												<CheckIcon aria-hidden="true" className="size-4 shrink-0 text-emerald-700" weight="bold" />
												{check}
											</li>
										))}
									</ul>
									<span className="mt-6 inline-flex items-center gap-2 font-semibold text-emerald-800 text-sm">
										Voir comment faire
										<ArrowRightIcon aria-hidden="true" className="size-4" />
									</span>
								</div>
							</a>
						))}
					</div>
				</div>
			</section>

			<section id="stages" className="bg-white py-14 md:py-20">
				<div className="mx-auto max-w-7xl px-6 lg:px-10">
					<div className="mx-auto max-w-3xl text-center">
						<h2 className="font-display text-4xl text-zinc-950 leading-tight md:text-5xl">
							Trouve des stages et opportunités près de chez toi
						</h2>
						<div className="mt-8 flex justify-center gap-8 border-zinc-200 border-b">
							<span className="border-emerald-800 border-b-2 px-4 pb-3 font-semibold text-emerald-950">Par ville</span>
							<a href="/metiers-techniques" className="px-4 pb-3 font-semibold text-zinc-500 hover:text-emerald-800">
								Par domaine
							</a>
						</div>
					</div>
					<div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-6">
						{cities.map((city) => (
							<a
								key={city.href}
								href={city.href}
								className="overflow-hidden rounded-lg border border-zinc-200 bg-white transition-colors hover:border-emerald-800/40"
							>
								<img
									src={city.image}
									alt=""
									aria-hidden="true"
									loading="eager"
									decoding="async"
									width={360}
									height={220}
									className="aspect-[4/3] w-full object-cover"
								/>
								<div className="p-4">
									<h3 className="font-semibold text-zinc-950">{city.name}</h3>
									<p className="mt-1 text-sm text-zinc-500">{city.count}</p>
								</div>
							</a>
						))}
					</div>
					<div className="mt-9 text-center">
						<a href="/stage-maroc" className="inline-flex items-center gap-2 font-semibold text-emerald-800">
							Voir toutes les villes
							<ArrowRightIcon aria-hidden="true" className="size-4" />
						</a>
					</div>
				</div>
			</section>

			<section id="questions" className="bg-white py-12 md:py-16">
				<div className="mx-auto max-w-7xl px-6 lg:px-10">
					<div className="mx-auto max-w-3xl text-center">
						<h2 className="font-display text-4xl text-zinc-950 leading-tight md:text-5xl">
							Questions fréquentes des étudiants
						</h2>
						<p className="mt-3 text-zinc-600">Trouve rapidement des réponses claires à vos questions.</p>
					</div>
					<div className="mt-8 grid gap-4 lg:grid-cols-3">
						{questions.map((question) => (
							<a
								key={`${question.href}-${question.text}`}
								href={question.href}
								className="flex min-h-12 items-center gap-3 rounded-md border border-zinc-200 bg-white px-4 text-left text-sm text-zinc-700 transition-colors hover:border-emerald-800/40 hover:text-emerald-900"
							>
								<MagnifyingGlassIcon aria-hidden="true" className="size-4 shrink-0 text-zinc-400" />
								<span className="flex-1">{question.text}</span>
								<ArrowRightIcon aria-hidden="true" className="size-4 shrink-0" />
							</a>
						))}
					</div>
					<div className="mt-8 text-center">
						<a
							href="/questions-entretien-stage"
							className="inline-flex items-center gap-2 font-semibold text-emerald-800"
						>
							Voir toutes les questions
							<ArrowRightIcon aria-hidden="true" className="size-4" />
						</a>
					</div>
				</div>
			</section>

			<section id="guides" className="bg-white py-12 md:py-16">
				<div className="mx-auto max-w-7xl px-6 lg:px-10">
					<div className="grid gap-6 rounded-lg border border-emerald-900/20 bg-emerald-50/35 p-6 lg:grid-cols-[0.78fr_1.22fr] lg:p-8">
						<div className="flex flex-col justify-center">
							<h2 className="font-display text-4xl text-zinc-950 leading-tight">
								Guides et conseils pour avancer plus loin
							</h2>
							<p className="mt-4 text-zinc-600 leading-7">
								Des ressources pratiques pour t'aider à chaque étape de ton parcours.
							</p>
							<a href="/wiki" className="mt-6 inline-flex items-center gap-2 font-semibold text-emerald-800">
								Voir tous les guides
								<ArrowRightIcon aria-hidden="true" className="size-4" />
							</a>
						</div>
						<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
							{guides.map((guide) => (
								<a key={guide.href} href={guide.href} className="overflow-hidden rounded-md bg-white shadow-sm">
									<img
										src={guide.image}
										alt=""
										aria-hidden="true"
										loading="lazy"
										decoding="async"
										width={360}
										height={260}
										className="aspect-[4/3] w-full object-cover"
									/>
									<p className="p-3 font-semibold text-[13px] text-zinc-950 leading-5">{guide.title}</p>
								</a>
							))}
						</div>
					</div>
				</div>
			</section>

			<section id="ressources-publiques" className="bg-zinc-950 py-16 text-white md:py-20">
				<div className="mx-auto max-w-7xl px-6 lg:px-10">
					<div className="grid gap-8 lg:grid-cols-[0.84fr_1.16fr] lg:items-end">
						<div>
							<p className="font-semibold text-emerald-300 text-sm">Ressources publiques</p>
							<h2 className="mt-4 font-display text-4xl leading-tight md:text-5xl">
								{trafficLandingPages.length}+ pages pour répondre aux recherches des étudiants.
							</h2>
							<p className="mt-5 text-white/70 leading-7">
								Des pages par objectif, ville, métier et entretien pour attirer les étudiants puis les guider vers un CV
								ou une candidature prête à envoyer.
							</p>
							<a
								href="/ressources-etudiants-maroc"
								className="mt-8 inline-flex h-13 items-center gap-3 rounded-md bg-white px-6 font-semibold text-emerald-950"
							>
								Explorer les ressources
								<ArrowRightIcon aria-hidden="true" className="size-4" />
							</a>
							<a
								href="/campagnes-etudiants"
								className="mt-3 inline-flex h-13 items-center gap-3 rounded-md border border-white/15 px-6 font-semibold text-white transition-colors hover:bg-white/8"
							>
								Voir les campagnes
								<ArrowRightIcon aria-hidden="true" className="size-4" />
							</a>
							<a
								href="/plan-marketing-etudiants"
								className="mt-3 inline-flex h-13 items-center gap-3 rounded-md border border-white/15 px-6 font-semibold text-white transition-colors hover:bg-white/8"
							>
								Plan 30 jours
								<ArrowRightIcon aria-hidden="true" className="size-4" />
							</a>
						</div>
						<div className="grid gap-3 sm:grid-cols-2">
							{publicPageHighlights.map((page) => (
								<a
									key={page.href}
									href={page.href}
									className="group grid grid-cols-[5.8rem_1fr] overflow-hidden rounded-lg border border-white/12 bg-white/[0.06] transition-colors hover:bg-white/[0.1]"
								>
									<img
										src={page.image}
										alt=""
										aria-hidden="true"
										loading="lazy"
										decoding="async"
										width={180}
										height={140}
										className="h-full min-h-24 w-full object-cover"
									/>
									<div className="flex items-center justify-between gap-3 p-4">
										<p className="font-semibold text-white">{page.title}</p>
										<ArrowRightIcon
											aria-hidden="true"
											className="size-4 shrink-0 text-emerald-300 transition-transform group-hover:translate-x-1"
										/>
									</div>
								</a>
							))}
						</div>
					</div>
				</div>
			</section>

			<section className="grid overflow-hidden bg-emerald-950 text-white lg:grid-cols-[0.95fr_1.05fr]">
				<div className="flex items-center px-6 py-14 md:px-10 lg:px-14">
					<div className="max-w-xl">
						<h2 className="font-display text-4xl leading-tight md:text-5xl">
							Prêt à décrocher ton stage ou ton premier emploi ?
						</h2>
						<p className="mt-4 text-white/74 leading-7">
							Crée ton CV gratuitement et accède aux meilleures opportunités près de chez toi.
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
					src="/home/public-pages-morocco-hub.webp"
					alt=""
					aria-hidden="true"
					loading="lazy"
					decoding="async"
					width={1440}
					height={810}
					className="h-full min-h-[340px] w-full object-cover"
				/>
			</section>

			<StudentFooter />
		</>
	);
}

function SectionTitle({ title }: { title: string }) {
	return (
		<div className="mx-auto max-w-3xl text-center">
			<h2 className="font-display text-4xl text-zinc-950 leading-tight md:text-5xl">{title}</h2>
			<div className="mx-auto mt-4 h-1 w-16 bg-emerald-800" />
		</div>
	);
}

function StudentFooter() {
	return (
		<footer className="bg-white py-10">
			<div className="mx-auto grid max-w-7xl gap-8 px-6 md:grid-cols-[1.2fr_0.8fr_0.8fr_0.8fr] lg:px-10">
				<div>
					<div className="flex items-center gap-3">
						<div className="flex size-10 items-center justify-center rounded-md bg-emerald-800 text-white">
							<FileTextIcon aria-hidden="true" className="size-5" weight="fill" />
						</div>
						<div>
							<p className="font-bold font-display text-xl text-zinc-950">IMTA Resume</p>
							<p className="text-sm text-zinc-500">Ton parcours, notre mission.</p>
						</div>
					</div>
					<div className="mt-6 flex gap-3 text-zinc-500">
						<span className="size-3 rounded-full bg-zinc-900" />
						<span className="size-3 rounded-full bg-zinc-900" />
						<span className="size-3 rounded-full bg-zinc-900" />
						<span className="size-3 rounded-full bg-zinc-900" />
					</div>
				</div>
				<FooterLinks
					title="Produit"
					links={[
						{ label: "Fonctionnalités", href: "/#objectifs" },
						{ label: "Modèles CV", href: "/cv-etudiant" },
						{ label: "Orientation", href: "/orientation-apres-bac" },
						{ label: "Stages & Emplois", href: "/stage-maroc" },
						{ label: "Préparation entretien", href: "/preparation-entretien" },
					]}
				/>
				<FooterLinks
					title="Ressources"
					links={[
						{ label: "Guides", href: "/wiki" },
						{ label: "Ressources étudiants", href: "/ressources-etudiants-maroc" },
						{ label: "Campagnes étudiants", href: "/campagnes-etudiants" },
						{ label: "FAQ", href: "/questions-entretien-stage" },
					]}
				/>
				<FooterLinks
					title="À propos"
					links={[
						{ label: "À propos d'IMTA", href: "https://imta.ma" },
						{ label: "Contact", href: "https://imta.ma/contact" },
						{ label: "Presse", href: "https://imta.ma" },
					]}
				/>
			</div>
			<p className="mt-8 text-center text-sm text-zinc-500">© 2024 IMTA Resume. Tous droits réservés.</p>
		</footer>
	);
}

function FooterLinks({ title, links }: { title: string; links: Array<{ label: string; href: string }> }) {
	return (
		<div>
			<h3 className="font-semibold text-emerald-900 text-sm">{title}</h3>
			<ul className="mt-3 space-y-2">
				{links.map((link) => (
					<li key={link.label}>
						<a href={link.href} className="text-sm text-zinc-600 hover:text-emerald-800">
							{link.label}
						</a>
					</li>
				))}
			</ul>
		</div>
	);
}
