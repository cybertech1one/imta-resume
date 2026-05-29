import {
	ArrowRightIcon,
	BriefcaseIcon,
	ChartLineUpIcon,
	ChatsCircleIcon,
	CheckCircleIcon,
	EnvelopeSimpleIcon,
	FileTextIcon,
	FirstAidKitIcon,
	GraduationCapIcon,
	LinkedinLogoIcon,
	MagnifyingGlassIcon,
	ShieldCheckIcon,
	SparkleIcon,
	TargetIcon,
} from "@phosphor-icons/react";
import { Link } from "@tanstack/react-router";
import { Templates } from "./templates";
import { trafficLandingPages } from "./traffic-landing";

const HEALTH_HERO_IMAGE = "/home/healthtech-student-hero.png";

const objectives = [
	{
		title: "Créer mon CV",
		text: "Un CV professionnel qui met en valeur ton profil.",
		href: "/cv-etudiant",
		icon: FileTextIcon,
	},
	{
		title: "Trouver un stage",
		text: "Accède aux meilleurs réflexes de recherche au Maroc.",
		href: "/stage-maroc",
		icon: BriefcaseIcon,
	},
	{
		title: "Réussir mes entretiens",
		text: "Prépare ton pitch, tes réponses et tes exemples.",
		href: "/preparation-entretien",
		icon: ChatsCircleIcon,
	},
	{
		title: "Lettre de motivation",
		text: "Rédige une lettre claire pour chaque candidature.",
		href: "/lettre-motivation-stage",
		icon: EnvelopeSimpleIcon,
	},
	{
		title: "Booster LinkedIn",
		text: "Améliore ta présence et deviens visible.",
		href: "/linkedin-etudiant",
		icon: LinkedinLogoIcon,
	},
];

const productSignals = [
	{ label: "Score ATS", value: "92", icon: ShieldCheckIcon, text: "Lisibilité recruteur" },
	{ label: "CV Builder", value: "12/12", icon: FileTextIcon, text: "Sections complètes" },
	{ label: "Préparation", value: "8/10", icon: ChatsCircleIcon, text: "Réponses guidées" },
];

const clinicalWorkflow = [
	{
		title: "Diagnostic du profil",
		text: "On repère les forces, les manques et les sections qui doivent rassurer un recruteur.",
		value: "01",
		icon: FirstAidKitIcon,
	},
	{
		title: "Score ATS lisible",
		text: "Le CV est contrôlé comme un bilan : structure, mots-clés, clarté et densité utile.",
		value: "92",
		icon: ChartLineUpIcon,
	},
	{
		title: "Plan d'entretien",
		text: "L'étudiant transforme ses projets et stages en réponses courtes, solides et naturelles.",
		value: "8/10",
		icon: ChatsCircleIcon,
	},
	{
		title: "Route vers le stage",
		text: "Chaque objectif mène vers une action : modèle CV, guide, ville, métier ou préparation.",
		value: "04",
		icon: TargetIcon,
	},
];

const trustSignals = ["Conçu pour le marché marocain", "Approuvé recruteurs", "Optimisé ATS"];

const partners = ["Clinique carrière", "IMTA", "CHU Maroc", "Deloitte", "Sothema", "Managem", "OCP"];

const publicResources = [
	{
		title: "Exemples de CV",
		text: "+50 exemples métiers",
		href: "/metiers-techniques",
		icon: FileTextIcon,
	},
	{
		title: "Questions d'entretien",
		text: "Réponses prêtes à adapter",
		href: "/questions-entretien-stage",
		icon: ChatsCircleIcon,
	},
	{
		title: "Compétences utiles",
		text: "Par domaine et niveau",
		href: "/metiers-techniques",
		icon: FirstAidKitIcon,
	},
	{
		title: "Formations & certificats",
		text: "Pour renforcer ton profil",
		href: "/formation-professionnelle-maroc",
		icon: GraduationCapIcon,
	},
	{
		title: "Modèles de lettres",
		text: "Motivation, recommandation",
		href: "/lettre-motivation-stage",
		icon: EnvelopeSimpleIcon,
	},
];

const studentPaths = [
	{
		title: "BTS / DUT technique",
		text: "Valorise tes ateliers, stages, certificats et compétences terrain.",
		image: "/home/tool-skills-assessment.webp",
		href: "/cv-bts-dut",
		checks: ["Compétences lisibles", "Projets techniques", "CV ATS"],
	},
	{
		title: "Santé & social",
		text: "Présente protocoles, relation patient, hygiène et certifications.",
		image: "/home/tool-cv-intelligent.webp",
		href: "/cv-sante",
		checks: ["Toucher médical", "Langues visibles", "Profil rassurant"],
	},
	{
		title: "Jeune diplômé",
		text: "Transforme une formation en candidature prête à envoyer.",
		image: "/home/tool-interview-prep.webp",
		href: "/premier-emploi-jeune-diplome",
		checks: ["CV une page", "Pitch entretien", "Lettre claire"],
	},
	{
		title: "En reconversion",
		text: "Mets en avant tes compétences transférables et ton nouveau projet.",
		image: "/home/public-pages-morocco-hub.webp",
		href: "/pitch-entretien",
		checks: ["Projet cohérent", "Preuves concrètes", "Plan d'action"],
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
	{ text: "Quel modèle choisir selon ma formation ?", href: "/cv-etudiant" },
	{ text: "Comment réussir un entretien de stage ?", href: "/questions-entretien-stage" },
	{ text: "Comment parler de mes compétences santé ou HSE ?", href: "/entretien-sante" },
	{ text: "Faut-il mettre une photo sur son CV ?", href: "/cv-etudiant" },
	{ text: "Comment améliorer mon LinkedIn étudiant ?", href: "/linkedin-etudiant" },
];

const guides = [
	{
		title: "Comment rédiger un CV efficace",
		image: "/home/tool-ats-optimization.webp",
		href: "/cv-etudiant",
	},
	{
		title: "Réussir son entretien d'embauche",
		image: "/home/tool-interview-prep.webp",
		href: "/questions-entretien-stage",
	},
	{
		title: "Rédiger une lettre de motivation",
		image: "/home/tool-cv-intelligent.webp",
		href: "/lettre-motivation-stage",
	},
	{
		title: "Optimiser son profil LinkedIn",
		image: "/home/tool-career-coaching.webp",
		href: "/linkedin-etudiant",
	},
	{
		title: "Trouver un stage au Maroc",
		image: "/home/tool-job-offers.webp",
		href: "/stage-maroc",
	},
];

const popularSearchClusters = [
	{
		title: "Orientation",
		text: "Comparer les formations et choisir un métier.",
		icon: GraduationCapIcon,
		links: [
			{ label: "Orientation après bac", href: "/orientation-apres-bac" },
			{ label: "Formation professionnelle", href: "/formation-professionnelle-maroc" },
			{ label: "Choisir un métier technique", href: "/choisir-metier-technique" },
		],
	},
	{
		title: "Premier CV",
		text: "Transformer une formation en candidature claire.",
		icon: FileTextIcon,
		links: [
			{ label: "CV sans expérience", href: "/cv-sans-experience" },
			{ label: "CV santé", href: "/cv-sante" },
			{ label: "CV BTS / DUT", href: "/cv-bts-dut" },
		],
	},
	{
		title: "Stage local",
		text: "Chercher par ville, domaine ou niveau.",
		icon: BriefcaseIcon,
		links: [
			{ label: "Stage Casablanca", href: "/stage-casablanca" },
			{ label: "Stage santé", href: "/stage-sante" },
			{ label: "Stage HSE Casablanca", href: "/stage-hse-casablanca" },
		],
	},
	{
		title: "Confiance",
		text: "Préparer l'appel, le pitch et l'entretien.",
		icon: ChatsCircleIcon,
		links: [
			{ label: "Questions entretien", href: "/questions-entretien-stage" },
			{ label: "Pitch entretien", href: "/pitch-entretien" },
			{ label: "Entretien santé", href: "/entretien-sante" },
		],
	},
];

export function StudentLanding() {
	return (
		<>
			<section className="relative isolate min-h-[760px] overflow-hidden bg-[#f7fbfa] pt-20">
				<div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_18%_18%,rgba(0,199,170,0.12),transparent_28%),linear-gradient(180deg,#ffffff_0%,#f6fbfa_72%,#ffffff_100%)]" />
				<div className="mx-auto grid max-w-7xl gap-10 px-6 py-16 lg:grid-cols-[0.9fr_1.1fr] lg:px-10 lg:py-20">
					<div className="flex items-center">
						<div className="max-w-3xl">
							<div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-900/10 bg-white px-4 py-2 font-semibold text-emerald-900 text-sm shadow-sm">
								<SparkleIcon aria-hidden="true" className="size-4 text-cyan-600" weight="fill" />
								La plateforme carrière nouvelle génération pour les étudiants
							</div>
							<h1 className="font-display text-5xl text-zinc-950 leading-[0.98] md:text-6xl lg:text-[5.5rem]">
								Ton CV ouvre
								<span className="block text-emerald-800">les bonnes portes.</span>
							</h1>
							<p className="mt-7 max-w-2xl text-lg text-zinc-600 leading-8">
								IMTA Resume aide les étudiants et jeunes diplômés au Maroc à créer un CV professionnel, préparer leurs
								entretiens et transformer leur formation en opportunité concrète.
							</p>
							<div className="mt-7 flex flex-wrap gap-2.5">
								{trustSignals.map((signal) => (
									<span
										key={signal}
										className="inline-flex items-center gap-2 rounded-full border border-emerald-900/10 bg-white px-3 py-2 font-medium text-emerald-900 text-sm"
									>
										<CheckCircleIcon aria-hidden="true" className="size-4 text-cyan-600" weight="fill" />
										{signal}
									</span>
								))}
							</div>
							<div className="mt-9 flex flex-col gap-4 sm:flex-row">
								<Link
									to="/dashboard"
									className="inline-flex h-14 items-center justify-center gap-2 rounded-xl bg-[linear-gradient(135deg,#006b53,#00a88a)] px-7 font-semibold text-white shadow-[0_22px_44px_-26px_rgba(0,107,83,0.95)] transition-transform hover:-translate-y-0.5"
								>
									Créer mon CV gratuitement
									<ArrowRightIcon aria-hidden="true" className="size-4" />
								</Link>
								<a
									href="/preparation-entretien"
									className="inline-flex h-14 items-center justify-center rounded-xl border border-emerald-950/15 bg-white px-7 font-semibold text-zinc-900 shadow-sm transition-colors hover:border-emerald-700 hover:text-emerald-800"
								>
									Préparer mon entretien
								</a>
							</div>
							<div className="mt-8 flex items-center gap-3">
								<div className="flex -space-x-2">
									{["A", "M", "Y", "S"].map((name) => (
										<span
											key={name}
											className="flex size-9 items-center justify-center rounded-full border-2 border-white bg-emerald-50 font-semibold text-emerald-900 text-xs shadow-sm"
										>
											{name}
										</span>
									))}
								</div>
								<p className="font-medium text-sm text-zinc-600">+50 000 étudiants nous font déjà confiance</p>
							</div>
						</div>
					</div>

					<div className="relative min-h-[560px]">
						<img
							src={HEALTH_HERO_IMAGE}
							alt=""
							aria-hidden="true"
							fetchPriority="high"
							decoding="async"
							width={1792}
							height={1024}
							className="absolute inset-0 size-full rounded-[2rem] object-cover object-center shadow-[0_34px_90px_-58px_rgba(0,56,44,0.8)]"
						/>
						<div
							aria-hidden="true"
							className="absolute inset-y-0 left-0 w-2/5 rounded-l-[2rem] bg-gradient-to-r from-[#f7fbfa] via-[#f7fbfa]/74 to-transparent"
						/>
						<div className="absolute right-5 bottom-5 grid w-[min(28rem,calc(100%-2.5rem))] gap-3 sm:grid-cols-3">
							{productSignals.map((signal) => {
								const Icon = signal.icon;

								return (
									<div
										key={signal.label}
										className="rounded-2xl border border-white/70 bg-white/88 p-4 shadow-[0_18px_50px_-30px_rgba(0,42,35,0.7)] backdrop-blur-xl"
									>
										<Icon aria-hidden="true" className="mb-3 size-5 text-emerald-800" weight="duotone" />
										<p className="font-bold text-2xl text-zinc-950">{signal.value}</p>
										<p className="font-semibold text-emerald-900 text-xs">{signal.label}</p>
										<p className="mt-1 text-[11px] text-zinc-500">{signal.text}</p>
									</div>
								);
							})}
						</div>
					</div>
				</div>

				<div className="border-emerald-950/10 border-y bg-white/82 backdrop-blur">
					<div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-12 gap-y-4 px-6 py-6 text-sm text-zinc-400 lg:px-10">
						<span className="font-medium text-zinc-500">Ils recrutent nos talents</span>
						{partners.map((partner) => (
							<span key={partner} className="font-semibold">
								{partner}
							</span>
						))}
					</div>
				</div>
			</section>

			<section className="bg-white py-14 md:py-20">
				<div className="mx-auto max-w-7xl px-6 lg:px-10">
					<div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr] lg:items-stretch">
						<div className="rounded-[2rem] bg-[linear-gradient(135deg,#063b32,#008d78)] p-7 text-white shadow-[0_28px_88px_-58px_rgba(0,56,44,0.9)] md:p-8">
							<p className="font-semibold text-cyan-100 text-sm">Career health system</p>
							<h2 className="mt-4 font-display text-4xl leading-tight md:text-5xl">
								Un tableau de bord carrière qui ressemble à un produit premium.
							</h2>
							<p className="mt-5 max-w-xl text-white/76 leading-7">
								Le design garde une touche médicale : diagnostic, score, suivi et plan d'action. Mais le ressenti reste
								startup, rapide et clair pour les étudiants.
							</p>
						</div>

						<div className="grid gap-4 sm:grid-cols-2">
							{clinicalWorkflow.map((item) => {
								const Icon = item.icon;

								return (
									<article
										key={item.title}
										className="rounded-2xl border border-emerald-950/10 bg-[#f6fbfa] p-5 shadow-[0_18px_56px_-50px_rgba(0,74,59,0.66)]"
									>
										<div className="mb-6 flex items-start justify-between gap-4">
											<div className="flex size-11 items-center justify-center rounded-xl bg-white text-emerald-800 shadow-sm">
												<Icon aria-hidden="true" className="size-6" weight="duotone" />
											</div>
											<span className="font-display text-3xl text-emerald-900/20 leading-none">{item.value}</span>
										</div>
										<h3 className="font-semibold text-lg text-zinc-950">{item.title}</h3>
										<p className="mt-3 text-[15px] text-zinc-600 leading-6">{item.text}</p>
									</article>
								);
							})}
						</div>
					</div>
				</div>
			</section>

			<section id="objectifs" className="bg-white py-16 md:py-20">
				<div className="mx-auto max-w-7xl px-6 lg:px-10">
					<SectionTitle
						label="Choisis ton objectif"
						title="Un parcours clair pour passer de l'idée à la candidature."
					/>
					<div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
						{objectives.map((objective) => {
							const Icon = objective.icon;

							return (
								<a
									key={objective.href}
									href={objective.href}
									className="group flex min-h-56 flex-col rounded-2xl border border-zinc-200 bg-white p-5 shadow-[0_18px_48px_-44px_rgba(20,40,30,0.45)] transition-all hover:-translate-y-1 hover:border-emerald-700/35 hover:shadow-[0_28px_60px_-44px_rgba(0,107,83,0.65)]"
								>
									<div className="mb-7 flex size-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-800">
										<Icon aria-hidden="true" className="size-6" weight="duotone" />
									</div>
									<h3 className="font-semibold text-lg text-zinc-950">{objective.title}</h3>
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

			<Templates />

			<section id="ressources" className="bg-[#f7fbfa] py-16 md:py-20">
				<div className="mx-auto max-w-7xl px-6 lg:px-10">
					<div className="mb-7 flex items-end justify-between gap-5">
						<SectionTitle
							align="left"
							label="Ressources publiques"
							title="Des points d'entrée utiles pour attirer les étudiants."
						/>
						<a
							href="/ressources-etudiants-maroc"
							className="hidden items-center gap-2 font-semibold text-emerald-800 md:flex"
						>
							Voir toutes les ressources
							<ArrowRightIcon aria-hidden="true" className="size-4" />
						</a>
					</div>
					<div className="grid gap-4 md:grid-cols-5">
						{publicResources.map((resource) => {
							const Icon = resource.icon;

							return (
								<a
									key={resource.href}
									href={resource.href}
									className="rounded-2xl border border-emerald-950/10 bg-white p-5 shadow-[0_18px_48px_-46px_rgba(0,42,35,0.65)] transition-all hover:-translate-y-1 hover:border-emerald-700/35"
								>
									<div className="mb-5 flex size-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-800">
										<Icon aria-hidden="true" className="size-6" weight="duotone" />
									</div>
									<h3 className="font-semibold text-zinc-950">{resource.title}</h3>
									<p className="mt-2 text-sm text-zinc-500">{resource.text}</p>
								</a>
							);
						})}
					</div>
				</div>
			</section>

			<section id="recherches-populaires" className="bg-white py-16 md:py-20">
				<div className="mx-auto max-w-7xl px-6 lg:px-10">
					<div className="grid gap-8 lg:grid-cols-[0.84fr_1.16fr] lg:items-stretch">
						<a
							href="/orientation-apres-bac"
							className="group relative min-h-[460px] overflow-hidden rounded-[2rem] bg-emerald-950 text-white shadow-[0_26px_80px_-56px_rgba(0,56,44,0.75)]"
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
								className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,26,19,0.02)_0%,rgba(5,26,19,0.92)_100%)]"
							/>
							<div className="relative flex min-h-[460px] flex-col justify-end p-7 md:p-8">
								<p className="font-semibold text-cyan-100 text-sm">{trafficLandingPages.length}+ pages publiques</p>
								<h2 className="mt-3 max-w-xl font-display text-4xl leading-tight md:text-5xl">
									Des recherches étudiantes transformées en parcours clairs.
								</h2>
								<p className="mt-4 max-w-lg text-white/74 leading-7">
									Orientation, CV, stage et entretien : chaque porte d'entrée mène vers une action utile.
								</p>
								<span className="mt-7 inline-flex items-center gap-2 font-semibold text-cyan-100">
									Voir l'orientation après bac
									<ArrowRightIcon aria-hidden="true" className="size-4" />
								</span>
							</div>
						</a>

						<div className="grid gap-4 sm:grid-cols-2">
							{popularSearchClusters.map((cluster) => {
								const Icon = cluster.icon;

								return (
									<article key={cluster.title} className="rounded-2xl border border-zinc-200 bg-white p-5">
										<div className="mb-4 flex items-start gap-3">
											<div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-800">
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
													className="flex min-h-11 items-center justify-between gap-3 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-700 transition-colors hover:border-emerald-800/35 hover:bg-emerald-50 hover:text-emerald-900"
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

			<section id="parcours" className="bg-[#f7fbfa] py-16 md:py-20">
				<div className="mx-auto max-w-7xl px-6 lg:px-10">
					<SectionTitle label="Parcours étudiants" title="Une expérience adaptée au domaine, au niveau et au métier." />
					<div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
						{studentPaths.map((path) => (
							<a
								key={path.href}
								href={path.href}
								className="group overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-[0_18px_48px_-42px_rgba(20,40,30,0.4)]"
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
												<CheckCircleIcon
													aria-hidden="true"
													className="size-4 shrink-0 text-emerald-700"
													weight="fill"
												/>
												{check}
											</li>
										))}
									</ul>
								</div>
							</a>
						))}
					</div>
				</div>
			</section>

			<section id="stages" className="bg-white py-16 md:py-20">
				<div className="mx-auto max-w-7xl rounded-[2rem] border border-zinc-200 bg-white px-6 py-10 shadow-[0_22px_70px_-60px_rgba(0,42,35,0.55)] lg:px-10">
					<SectionTitle label="Stages & opportunités" title="Trouve des stages et opportunités près de chez toi." />
					<div className="mt-8 flex justify-center gap-8 border-zinc-200 border-b">
						<span className="border-emerald-800 border-b-2 px-4 pb-3 font-semibold text-emerald-950">Par ville</span>
						<a href="/metiers-techniques" className="px-4 pb-3 font-semibold text-zinc-500 hover:text-emerald-800">
							Par domaine
						</a>
					</div>
					<div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-6">
						{cities.map((city) => (
							<a
								key={city.href}
								href={city.href}
								className="overflow-hidden rounded-2xl border border-zinc-200 bg-white transition-colors hover:border-emerald-800/40"
							>
								<img
									src={city.image}
									alt=""
									aria-hidden="true"
									loading="lazy"
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

			<section id="questions" className="bg-white py-16 md:py-20">
				<div className="mx-auto max-w-7xl px-6 lg:px-10">
					<SectionTitle label="Questions fréquentes" title="Réponds aux doutes avant d'envoyer ta candidature." />
					<div className="mt-8 grid gap-4 lg:grid-cols-3">
						{questions.map((question) => (
							<a
								key={`${question.href}-${question.text}`}
								href={question.href}
								className="flex min-h-14 items-center gap-3 rounded-xl border border-zinc-200 bg-white px-4 text-left text-sm text-zinc-700 transition-colors hover:border-emerald-800/40 hover:text-emerald-900"
							>
								<MagnifyingGlassIcon aria-hidden="true" className="size-4 shrink-0 text-cyan-600" />
								<span className="flex-1">{question.text}</span>
								<ArrowRightIcon aria-hidden="true" className="size-4 shrink-0" />
							</a>
						))}
					</div>
				</div>
			</section>

			<section id="guides" className="bg-[#f7fbfa] py-16 md:py-20">
				<div className="mx-auto max-w-7xl px-6 lg:px-10">
					<div className="mb-7 flex items-end justify-between gap-5">
						<SectionTitle align="left" label="Guides" title="Guides pour avancer plus loin." />
						<a href="/wiki" className="hidden items-center gap-2 font-semibold text-emerald-800 md:flex">
							Voir tous les guides
							<ArrowRightIcon aria-hidden="true" className="size-4" />
						</a>
					</div>
					<div className="grid gap-5 md:grid-cols-5">
						{guides.map((guide) => (
							<a
								key={guide.href}
								href={guide.href}
								className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition-transform hover:-translate-y-1"
							>
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
								<p className="p-4 font-semibold text-[14px] text-zinc-950 leading-5">{guide.title}</p>
							</a>
						))}
					</div>
				</div>
			</section>

			<section className="bg-white px-6 py-16 lg:px-10">
				<div className="mx-auto grid max-w-7xl overflow-hidden rounded-[2rem] bg-[linear-gradient(135deg,#005b47,#008c78)] text-white shadow-[0_28px_88px_-58px_rgba(0,56,44,0.9)] lg:grid-cols-[0.95fr_1.05fr]">
					<div className="p-8 md:p-10">
						<p className="font-semibold text-cyan-100 text-sm">Prêt à passer ta carrière au niveau supérieur ?</p>
						<h2 className="mt-4 font-display text-4xl leading-tight md:text-5xl">
							Crée ton CV, prépare ton entretien et postule avec confiance.
						</h2>
						<Link
							to="/dashboard"
							className="mt-8 inline-flex h-13 items-center gap-3 rounded-xl bg-white px-7 font-semibold text-emerald-950"
						>
							Créer mon CV gratuitement
							<ArrowRightIcon aria-hidden="true" className="size-4" />
						</Link>
					</div>
					<div className="grid grid-cols-2 gap-3 p-6 sm:grid-cols-4 lg:p-8">
						<CTAStat value="50 000+" label="Étudiants accompagnés" />
						<CTAStat value="35" label="Modèles professionnels" />
						<CTAStat value="92%" label="Taux de satisfaction" />
						<CTAStat value="4.8/5" label="Note moyenne" />
					</div>
				</div>
			</section>

			<StudentFooter />
		</>
	);
}

function SectionTitle({ label, title, align = "center" }: { label: string; title: string; align?: "left" | "center" }) {
	return (
		<div className={align === "center" ? "mx-auto max-w-3xl text-center" : "max-w-3xl"}>
			<p className="mb-4 inline-flex items-center gap-2 font-semibold text-emerald-800 text-sm">
				<span className="h-px w-7 bg-cyan-400" />
				{label}
				<span className="h-px w-7 bg-cyan-400" />
			</p>
			<h2 className="font-display text-4xl text-zinc-950 leading-tight md:text-5xl">{title}</h2>
		</div>
	);
}

function CTAStat({ value, label }: { value: string; label: string }) {
	return (
		<div className="rounded-2xl border border-white/14 bg-white/10 p-4 backdrop-blur">
			<p className="font-bold text-2xl">{value}</p>
			<p className="mt-2 text-white/72 text-xs leading-5">{label}</p>
		</div>
	);
}

function StudentFooter() {
	return (
		<footer className="bg-white py-10">
			<div className="mx-auto grid max-w-7xl gap-8 px-6 md:grid-cols-[1.2fr_0.8fr_0.8fr_0.8fr] lg:px-10">
				<div>
					<div className="flex items-center gap-3">
						<div className="flex size-11 items-center justify-center rounded-xl bg-[linear-gradient(135deg,#006b53,#00a88a)] text-white">
							<FileTextIcon aria-hidden="true" className="size-5" weight="fill" />
						</div>
						<div>
							<p className="font-bold font-display text-xl text-zinc-950">IMTA Resume</p>
							<p className="text-sm text-zinc-500">Ton avenir commence ici.</p>
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
						{ label: "Modèles CV", href: "/#templates" },
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
					title="Entreprise"
					links={[
						{ label: "À propos d'IMTA", href: "https://imta.ma" },
						{ label: "Contact", href: "https://imta.ma/contact" },
						{ label: "Carrières", href: "https://imta.ma" },
					]}
				/>
			</div>
			<p className="mt-8 text-center text-sm text-zinc-500">© 2026 IMTA Resume. Tous droits réservés.</p>
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
