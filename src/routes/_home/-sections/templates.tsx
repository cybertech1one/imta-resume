import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { ArrowRightIcon, CheckCircleIcon, FileTextIcon, FirstAidKitIcon, ShieldCheckIcon } from "@phosphor-icons/react";
import { Link } from "@tanstack/react-router";
import type { TemplateMetadata } from "@/dialogs/resume/template/data";
import { templates } from "@/dialogs/resume/template/data";
import type { Template } from "@/schema/templates";

type TemplateShowcaseItem = {
	key: Template;
	metadata: TemplateMetadata;
	label: string;
	outcome: string;
	tags: string[];
};

const getTemplateShowcase = (): TemplateShowcaseItem[] => {
	const items = [
		{
			key: "settat",
			label: t`CV étudiant sans expérience`,
			outcome: t`Stage, alternance, premier emploi`,
			tags: [t`1 page`, t`ATS`, t`Débutant`],
		},
		{
			key: "casablanca",
			label: t`CV corporate`,
			outcome: t`Gestion, finance, commerce`,
			tags: [t`Pro`, t`Deux colonnes`, t`Recruteur`],
		},
		{
			key: "safi",
			label: t`CV technique`,
			outcome: t`BTS, maintenance, industrie`,
			tags: [t`Technique`, t`Dense`, t`Compétences`],
		},
		{
			key: "agadir",
			label: t`CV hôtellerie`,
			outcome: t`Tourisme, accueil, restauration`,
			tags: [t`Langues`, t`Service`, t`Certificats`],
		},
		{
			key: "tangier",
			label: t`CV ATS international`,
			outcome: t`Candidatures en ligne et multilingues`,
			tags: [t`ATS`, t`FR/AR`, t`Simple`],
		},
		{
			key: "rabat",
			label: t`CV administratif`,
			outcome: t`Bureau, dossiers, institutions`,
			tags: [t`Formel`, t`Maroc`, t`Clair`],
		},
		{
			key: "marrakech",
			label: t`CV créatif maîtrisé`,
			outcome: t`Marketing, communication, contenu`,
			tags: [t`Créatif`, t`Portfolio`, t`Moderne`],
		},
		{
			key: "nador",
			label: t`CV bilingue`,
			outcome: t`Français, arabe, international`,
			tags: [t`FR/AR`, t`Bilingue`, t`Pro`],
		},
		{
			key: "taza",
			label: t`CV compact ATS`,
			outcome: t`Maximum de contenu, lecture rapide`,
			tags: [t`Compact`, t`ATS`, t`Sobre`],
		},
		{
			key: "mohammedia",
			label: t`CV direction`,
			outcome: t`Senior, management, leadership`,
			tags: [t`Premium`, t`Senior`, t`Impact`],
		},
		{
			key: "ifrane",
			label: t`CV académique`,
			outcome: t`Recherche, master, enseignement`,
			tags: [t`Formation`, t`Recherche`, t`Élégant`],
		},
		{
			key: "jadida",
			label: t`CV polyvalent`,
			outcome: t`Un modèle sûr pour presque tout secteur`,
			tags: [t`Équilibré`, t`Pro`, t`Maroc`],
		},
	] satisfies Array<Omit<TemplateShowcaseItem, "metadata">>;

	return items.map((item) => ({
		...item,
		metadata: templates[item.key],
	}));
};

function TemplateItem({ item }: { item: TemplateShowcaseItem }) {
	return (
		<article className="group overflow-hidden rounded-2xl border border-emerald-950/10 bg-white shadow-[0_24px_64px_-50px_rgba(0,74,59,0.72)] transition-all duration-200 hover:-translate-y-1 hover:border-emerald-700/35 hover:shadow-[0_34px_74px_-52px_rgba(0,107,83,0.74)]">
			<div className="relative bg-[linear-gradient(180deg,#effaf7,#ffffff)] p-3">
				<div className="absolute top-4 left-4 z-10 rounded-full border border-white/80 bg-white/90 px-2.5 py-1 font-semibold text-[11px] text-emerald-900 shadow-sm backdrop-blur">
					{item.tags[0]}
				</div>
				<div className="overflow-hidden rounded-xl border border-emerald-950/10 bg-white">
					<img
						src={item.metadata.imageUrl}
						alt={item.metadata.name}
						loading="lazy"
						decoding="async"
						width={560}
						height={792}
						sizes="(min-width: 1280px) 20vw, (min-width: 768px) 30vw, 86vw"
						className="aspect-page w-full object-cover object-top transition-transform duration-300 group-hover:scale-[1.018]"
					/>
				</div>
			</div>
			<div className="space-y-3 p-4">
				<div>
					<p className="font-semibold text-zinc-950">{item.label}</p>
					<p className="mt-1 text-sm text-zinc-600">{item.outcome}</p>
				</div>
				<div className="flex flex-wrap gap-1.5">
					{item.tags.map((tag) => (
						<span key={tag} className="rounded-full bg-emerald-50 px-2 py-1 font-medium text-emerald-900 text-xs">
							{tag}
						</span>
					))}
				</div>
			</div>
		</article>
	);
}

export function Templates() {
	const showcase = getTemplateShowcase();

	return (
		<section
			id="templates"
			className="scroll-mt-24 overflow-hidden bg-[linear-gradient(180deg,#ffffff_0%,#f4fbf9_48%,#ffffff_100%)] py-16 md:py-24"
		>
			<div className="mx-auto max-w-7xl px-6 lg:px-10">
				<div className="mb-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_24rem] lg:items-end">
					<div>
						<p className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-900/10 bg-white px-3 py-1.5 font-semibold text-emerald-900 text-sm shadow-sm">
							<FirstAidKitIcon aria-hidden="true" className="size-4 text-cyan-600" weight="duotone" />
							<Trans>Galerie de modèles CV</Trans>
						</p>
						<h2 className="max-w-3xl font-display text-4xl text-zinc-950 leading-tight md:text-5xl">
							<Trans>Des modèles crédibles, propres, et prêts pour les recruteurs.</Trans>
						</h2>
						<p className="mt-4 max-w-2xl text-zinc-600 leading-7">
							<Trans>
								Chaque modèle ressemble à un vrai CV professionnel : hiérarchie claire, sections utiles, contenu dense
								mais lisible, et rendu PDF propre pour les candidatures au Maroc.
							</Trans>
						</p>
					</div>

					<div className="rounded-2xl border border-emerald-950/10 bg-white p-4 shadow-[0_24px_70px_-56px_rgba(0,74,59,0.72)]">
						<div className="mb-4 flex items-center gap-3">
							<div className="flex size-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-800">
								<ShieldCheckIcon aria-hidden="true" className="size-6" weight="duotone" />
							</div>
							<div>
								<p className="font-semibold text-zinc-950">
									<Trans>Diagnostic galerie</Trans>
								</p>
								<p className="text-sm text-zinc-500">
									<Trans>Choix rapide, rendu fiable.</Trans>
								</p>
							</div>
						</div>
						<div className="grid grid-cols-2 gap-3">
							{[t`35 modèles`, t`Export PDF`, t`CV français`, t`ATS ready`].map((item) => (
								<div
									key={item}
									className="flex items-center gap-2 rounded-xl bg-[#f3faf8] px-3 py-2 text-sm text-zinc-800"
								>
									<CheckCircleIcon aria-hidden="true" className="size-4 shrink-0 text-emerald-800" weight="fill" />
									<span className="font-medium">{item}</span>
								</div>
							))}
						</div>
					</div>
				</div>

				<div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
					{showcase.map((item) => (
						<TemplateItem key={item.key} item={item} />
					))}
				</div>

				<div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
					<Link
						to="/dashboard/templates/gallery"
						className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[linear-gradient(135deg,#006b53,#00a88a)] px-6 font-semibold text-white shadow-[0_18px_38px_-24px_rgba(0,107,83,0.9)] transition-transform hover:-translate-y-0.5"
					>
						<Trans>Voir la galerie complète</Trans>
						<ArrowRightIcon aria-hidden="true" className="size-4" />
					</Link>
					<span className="inline-flex items-center gap-2 text-sm text-zinc-500">
						<FileTextIcon aria-hidden="true" className="size-4 text-cyan-600" weight="duotone" />
						<Trans>Modèles adaptés aux stages, écoles, santé, industrie et premier emploi.</Trans>
					</span>
				</div>
			</div>
		</section>
	);
}
