import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import type { Icon } from "@phosphor-icons/react";
import { BriefcaseIcon, ChatsCircleIcon, FileTextIcon, UserPlusIcon } from "@phosphor-icons/react";

const EMERALD = "oklch(0.42 0.13 160)";

type Step = {
	icon: Icon;
	number: string;
	title: string;
	description: string;
};

const getSteps = (): Step[] => [
	{
		icon: UserPlusIcon,
		number: "01",
		title: t`Crée ton compte`,
		description: t`Inscris-toi gratuitement en quelques secondes. Aucune carte de crédit requise.`,
	},
	{
		icon: FileTextIcon,
		number: "02",
		title: t`Choisis un modèle`,
		description: t`Parcours les modèles professionnels et sélectionne celui qui correspond à ton métier.`,
	},
	{
		icon: ChatsCircleIcon,
		number: "03",
		title: t`Prépare-toi avec l'IA`,
		description: t`Utilise l'IA pour améliorer ton CV, t'entraîner et mieux présenter tes compétences.`,
	},
	{
		icon: BriefcaseIcon,
		number: "04",
		title: t`Postule avec confiance`,
		description: t`Télécharge ton CV optimisé et prépare tes candidatures pour les stages et emplois.`,
	},
];

export function Process() {
	const steps = getSteps();

	return (
		<section id="process" className="bg-white py-16 md:py-20">
			<div className="mx-auto max-w-7xl px-6 lg:px-10">
				<div className="mb-10 max-w-3xl">
					<p className="mb-4 font-semibold text-emerald-800 text-sm">
						<Trans>Le parcours</Trans>
					</p>
					<h2 className="font-display text-4xl text-zinc-950 leading-tight md:text-5xl">
						<Trans>Quatre étapes pour avancer sans confusion.</Trans>
					</h2>
				</div>

				<div className="grid grid-cols-1 gap-5 md:grid-cols-4">
					{steps.map((step) => (
						<article key={step.number} className="rounded-lg border border-zinc-200 bg-white p-5">
							<div className="mb-6 flex items-start justify-between gap-4">
								<div
									className="flex size-11 items-center justify-center rounded-md bg-emerald-50"
									style={{ color: EMERALD }}
								>
									<step.icon className="size-6" weight="duotone" aria-hidden="true" />
								</div>
								<span className="font-display text-4xl text-zinc-200 leading-none">{step.number}</span>
							</div>
							<h3 className="mb-3 font-semibold text-lg text-zinc-950">{step.title}</h3>
							<p className="text-[15px] text-zinc-600 leading-6">{step.description}</p>
						</article>
					))}
				</div>
			</div>
		</section>
	);
}
