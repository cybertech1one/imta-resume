import { Trans } from "@lingui/react/macro";

const organizations = [
	{ name: "OFPPT", detail: "Formation professionnelle" },
	{ name: "ANAPEC", detail: "Emploi & insertion" },
	{ name: "Maroc Telecom", detail: "Télécom" },
	{ name: "Attijariwafa Bank", detail: "Finance" },
	{ name: "CIH Bank", detail: "Banque" },
	{ name: "LabelVie", detail: "Distribution" },
];

export function Partners() {
	return (
		<section id="partners" className="border-zinc-200 border-y bg-zinc-50 py-12 md:py-14">
			<div className="mx-auto max-w-7xl px-6 lg:px-10">
				<div className="mb-8 text-center">
					<p className="mb-3 font-semibold text-emerald-800 text-sm">
						<Trans>Opportunités au Maroc</Trans>
					</p>
					<h2 className="font-display text-3xl text-zinc-950 leading-tight md:text-4xl">
						<Trans>Prépare un dossier lisible pour les acteurs du marché.</Trans>
					</h2>
				</div>

				<div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
					{organizations.map((organization) => (
						<div
							key={organization.name}
							className="flex min-h-24 flex-col items-center justify-center rounded-lg border border-zinc-200 bg-white p-4 text-center"
						>
							<span className="block font-black font-display text-emerald-900 text-xl">{organization.name}</span>
							<span className="mt-2 block text-xs text-zinc-500">{organization.detail}</span>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}
