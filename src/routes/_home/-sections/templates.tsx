import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { ArrowRightIcon } from "@phosphor-icons/react";
import { Link } from "@tanstack/react-router";
import type { TemplateMetadata } from "@/dialogs/resume/template/data";
import { templates } from "@/dialogs/resume/template/data";

type TemplateShowcaseItem = {
	key: string;
	metadata: TemplateMetadata;
	label: string;
};

const getTemplateShowcase = (): TemplateShowcaseItem[] => {
	const labels = [
		t`Électromécanique`,
		t`BTP`,
		t`Informatique`,
		t`Gestion & commerce`,
		t`Santé`,
		t`Hôtellerie & tourisme`,
	];

	return Object.entries(templates)
		.slice(0, 6)
		.map(([key, metadata], index) => ({
			key,
			metadata,
			label: labels[index] ?? metadata.name,
		}));
};

function TemplateItem({ item }: { item: TemplateShowcaseItem }) {
	return (
		<article className="group">
			<div className="relative aspect-page overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-[0_18px_46px_-36px_rgba(18,43,30,0.55)] transition-transform duration-200 group-hover:-translate-y-1">
				<img
					src={item.metadata.imageUrl}
					alt={item.metadata.name}
					loading="lazy"
					decoding="async"
					width={560}
					height={792}
					sizes="(min-width: 1280px) 14vw, (min-width: 768px) 22vw, 45vw"
					className="size-full object-cover"
				/>
			</div>
			<div className="mt-3 rounded-md border border-zinc-200 bg-white px-3 py-2 text-center">
				<p className="truncate font-semibold text-sm text-zinc-800">{item.label}</p>
			</div>
		</article>
	);
}

export function Templates() {
	const showcase = getTemplateShowcase();

	return (
		<section id="templates" className="bg-white py-16 md:py-20">
			<div className="mx-auto max-w-7xl px-6 lg:px-10">
				<div className="mx-auto mb-10 max-w-3xl text-center">
					<p className="mb-4 font-semibold text-emerald-800 text-sm">
						<Trans>Modèles CV</Trans>
					</p>
					<h2 className="font-display text-4xl text-zinc-950 leading-tight md:text-5xl">
						<Trans>Des modèles professionnels pour chaque métier.</Trans>
					</h2>
					<p className="mx-auto mt-4 max-w-2xl text-zinc-600 leading-7">
						<Trans>Conçus pour les étudiants et jeunes professionnels au Maroc, prêts à adapter et exporter.</Trans>
					</p>
				</div>

				<div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6 lg:gap-5">
					{showcase.map((item) => (
						<TemplateItem key={item.key} item={item} />
					))}
				</div>

				<div className="mt-10 flex justify-center">
					<Link
						to="/dashboard"
						className="inline-flex h-12 items-center justify-center gap-2 rounded-md border border-emerald-800 px-6 font-semibold text-emerald-900 transition-colors hover:bg-emerald-50"
					>
						<Trans>Voir tous les modèles</Trans>
						<ArrowRightIcon aria-hidden="true" className="size-4" />
					</Link>
				</div>
			</div>
		</section>
	);
}
