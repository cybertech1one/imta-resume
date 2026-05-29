import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import type { Icon } from "@phosphor-icons/react";
import {
	BookOpenIcon,
	BriefcaseIcon,
	CheckCircleIcon,
	GraduationCapIcon,
	LockSimpleIcon,
	ShieldCheckIcon,
	SparkleIcon,
	UsersIcon,
} from "@phosphor-icons/react";

const PAPER = "oklch(0.985 0.008 90)";

type Reason = {
	icon: Icon;
	title: string;
	description: string;
};

const getReasons = (): Reason[] => [
	{
		icon: BriefcaseIcon,
		title: t`Spécialisé métiers`,
		description: t`Des conseils adaptés aux filières, stages et compétences techniques.`,
	},
	{
		icon: SparkleIcon,
		title: t`Assistant IA intégré`,
		description: t`Des suggestions pour améliorer le CV et préparer les entretiens.`,
	},
	{
		icon: CheckCircleIcon,
		title: t`100% gratuit`,
		description: t`Toutes les fonctionnalités essentielles restent accessibles sans abonnement.`,
	},
	{
		icon: ShieldCheckIcon,
		title: t`Optimisé ATS`,
		description: t`Des formats lisibles par les recruteurs et les outils de tri automatique.`,
	},
	{
		icon: LockSimpleIcon,
		title: t`Données protégées`,
		description: t`Tes informations restent sous contrôle et ne sont pas revendues.`,
	},
	{
		icon: UsersIcon,
		title: t`Support étudiant`,
		description: t`Un parcours simple pour créer, corriger, exporter et partager son CV.`,
	},
];

function ReasonCard({ reason }: { reason: Reason }) {
	const ReasonIcon = reason.icon;

	return (
		<article className="rounded-lg border border-zinc-200 bg-white p-5">
			<div className="mb-5 flex size-11 items-center justify-center rounded-md bg-emerald-50 text-emerald-800">
				<ReasonIcon aria-hidden="true" className="size-6" weight="duotone" />
			</div>
			<h3 className="mb-2 font-semibold text-lg text-zinc-950">{reason.title}</h3>
			<p className="text-[15px] text-zinc-600 leading-6">{reason.description}</p>
		</article>
	);
}

export const DonationBanner = () => {
	const reasons = getReasons();

	return (
		<section id="why-imta" className="py-16 md:py-20" style={{ background: PAPER }}>
			<div className="mx-auto max-w-7xl px-6 lg:px-10">
				<div className="mx-auto mb-10 max-w-3xl text-center">
					<div className="mx-auto mb-6 flex size-12 items-center justify-center rounded-md bg-emerald-800 text-white">
						<GraduationCapIcon aria-hidden="true" className="size-7" weight="duotone" />
					</div>
					<p className="mb-4 font-semibold text-emerald-800 text-sm">
						<Trans>Pourquoi choisir IMTA Resume ?</Trans>
					</p>
					<h2 className="font-display text-4xl text-zinc-950 leading-tight md:text-5xl">
						<Trans>Un espace fait pour les étudiants et les métiers du terrain.</Trans>
					</h2>
					<p className="mx-auto mt-5 max-w-2xl text-zinc-600 leading-7">
						<Trans>
							IMTA Resume aide les étudiants et jeunes professionnels au Maroc à présenter leurs compétences avec un CV
							propre, clair et adapté aux recruteurs.
						</Trans>
					</p>
				</div>

				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{reasons.map((reason) => (
						<ReasonCard key={reason.title} reason={reason} />
					))}
				</div>

				<div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
					<a
						href="https://imta.ma"
						target="_blank"
						rel="noopener"
						className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-emerald-800 px-6 font-semibold text-white hover:bg-emerald-900"
					>
						<GraduationCapIcon aria-hidden="true" weight="fill" />
						<Trans>Visiter IMTA.ma</Trans>
						<span className="sr-only"> ({t`s'ouvre dans un nouvel onglet`})</span>
					</a>

					<a
						href="https://imta.ma/programs"
						target="_blank"
						rel="noopener"
						className="inline-flex h-12 items-center justify-center gap-2 rounded-md border border-zinc-300 bg-white px-6 font-semibold text-zinc-900 hover:border-emerald-800 hover:text-emerald-900"
					>
						<BookOpenIcon aria-hidden="true" weight="fill" />
						<Trans>Découvrir les programmes</Trans>
						<span className="sr-only"> ({t`s'ouvre dans un nouvel onglet`})</span>
					</a>
				</div>
			</div>
		</section>
	);
};
