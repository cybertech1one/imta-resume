import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import type { Icon } from "@phosphor-icons/react";
import {
	ArrowRightIcon,
	BriefcaseIcon,
	ChartBarIcon,
	ChatsCircleIcon,
	FileTextIcon,
	MagicWandIcon,
	ShieldCheckIcon,
} from "@phosphor-icons/react";

const EMERALD = "oklch(0.42 0.13 160)";
const PAPER = "oklch(0.985 0.008 90)";

type Feature = {
	icon: Icon;
	image: string;
	title: string;
	description: string;
};

const getFeatures = (): Feature[] => [
	{
		icon: FileTextIcon,
		image: "/home/tool-cv-intelligent.webp",
		title: t`CV intelligent`,
		description: t`Crée un CV professionnel adapté à ton métier et prêt pour les recruteurs.`,
	},
	{
		icon: ChatsCircleIcon,
		image: "/home/tool-interview-prep.webp",
		title: t`Préparation entretien`,
		description: t`Entraîne-toi avec l'IA, améliore tes réponses et gagne en confiance.`,
	},
	{
		icon: MagicWandIcon,
		image: "/home/tool-career-coaching.webp",
		title: t`Coaching carrière`,
		description: t`Clarifie ton objectif, ton plan d'action et les prochaines étapes.`,
	},
	{
		icon: BriefcaseIcon,
		image: "/home/tool-job-offers.webp",
		title: t`Offres d'emploi`,
		description: t`Trouve des stages et emplois alignés avec ton profil et ton secteur.`,
	},
	{
		icon: ChartBarIcon,
		image: "/home/tool-skills-assessment.webp",
		title: t`Évaluation compétences`,
		description: t`Teste tes points forts et repère les axes à développer rapidement.`,
	},
	{
		icon: ShieldCheckIcon,
		image: "/home/tool-ats-optimization.webp",
		title: t`Optimisation ATS`,
		description: t`Optimise ton CV pour les filtres de recrutement et augmente tes chances.`,
	},
];

function FeatureCard({ feature }: { feature: Feature }) {
	const FeatureIcon = feature.icon;

	return (
		<article className="group overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-[0_18px_48px_-40px_rgba(18,43,30,0.55)] transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:border-emerald-800/25 hover:shadow-[0_24px_54px_-40px_rgba(18,43,30,0.7)]">
			<div className="aspect-[4/3] overflow-hidden bg-zinc-100">
				<img
					src={feature.image}
					alt=""
					aria-hidden="true"
					loading="lazy"
					decoding="async"
					width={980}
					height={735}
					sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 92vw"
					className="size-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
				/>
			</div>

			<div className="p-5">
				<div className="mb-3 flex items-center gap-3">
					<div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-emerald-50 text-emerald-700">
						<FeatureIcon className="size-5" weight="duotone" aria-hidden="true" />
					</div>
					<h3 className="font-semibold text-lg text-zinc-950">{feature.title}</h3>
				</div>
				<p className="min-h-14 text-[15px] text-zinc-600 leading-6">{feature.description}</p>
				<div className="mt-5 flex items-center text-emerald-700">
					<ArrowRightIcon className="size-5 transition-transform group-hover:translate-x-1" aria-hidden="true" />
				</div>
			</div>
		</article>
	);
}

export function Features() {
	const features = getFeatures();

	return (
		<section id="features" className="relative py-16 md:py-20" style={{ background: PAPER }}>
			<div
				aria-hidden="true"
				className="pointer-events-none absolute inset-y-0 left-0 w-36 opacity-[0.05]"
				style={{
					backgroundImage:
						"linear-gradient(45deg, transparent 46%, currentColor 47%, currentColor 53%, transparent 54%)",
					backgroundSize: "28px 28px",
					color: EMERALD,
				}}
			/>
			<div className="relative mx-auto max-w-7xl px-6 lg:px-10">
				<div className="mb-10 flex max-w-4xl flex-col gap-4 md:flex-row md:items-end md:justify-between">
					<div>
						<h2 className="font-display text-4xl text-zinc-950 leading-tight md:text-5xl">
							<Trans>Des outils pensés pour ta réussite</Trans>
						</h2>
						<p className="mt-4 max-w-2xl text-zinc-600 leading-7">
							<Trans>Tout ce qu'il faut pour construire ton avenir professionnel, sans perdre de temps.</Trans>
						</p>
					</div>
					<a
						href="#templates"
						className="inline-flex items-center gap-2 font-semibold text-emerald-800 hover:text-emerald-950"
					>
						<Trans>Voir les modèles</Trans>
						<ArrowRightIcon className="size-4" aria-hidden="true" />
					</a>
				</div>

				<div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
					{features.map((feature) => (
						<FeatureCard key={feature.title} feature={feature} />
					))}
				</div>
			</div>
		</section>
	);
}
