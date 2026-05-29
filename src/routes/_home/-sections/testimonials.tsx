import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { QuotesIcon } from "@phosphor-icons/react";

type Testimonial = {
	text: string;
	name: string;
	program: string;
};

const getTestimonials = (): Testimonial[] => [
	{
		text: t`Grâce à IMTA Resume, j'ai pu créer un CV professionnel en moins de 30 minutes. Mon maître de stage a été impressionné par la qualité.`,
		name: "Fatima Z.",
		program: t`Soins infirmiers`,
	},
	{
		text: t`L'IA m'a aidé à formuler mes compétences techniques d'une manière claire pour les recruteurs.`,
		name: "Karim B.",
		program: t`Soudure industrielle`,
	},
	{
		text: t`La préparation d'entretien m'a aidée à répondre avec plus de calme et de structure.`,
		name: "Nadia L.",
		program: "HSE",
	},
	{
		text: t`Le coaching carrière m'a donné une liste claire des prochaines étapes pour trouver mon stage.`,
		name: "Hassan M.",
		program: t`Conduite d'engins`,
	},
	{
		text: t`C'est la première fois que j'ai un CV dont je suis vraiment fière. Les modèles sont beaux et professionnels.`,
		name: "Amina R.",
		program: t`Soins infirmiers`,
	},
	{
		text: t`L'optimisation ATS m'a aidé à rendre mon CV plus clair avant de l'envoyer aux entreprises.`,
		name: "Youssef E.",
		program: t`Maintenance industrielle`,
	},
];

function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
	return (
		<article className="relative rounded-lg border border-zinc-200 bg-white p-6 shadow-[0_16px_46px_-38px_rgba(18,43,30,0.55)]">
			<QuotesIcon aria-hidden="true" weight="fill" className="absolute top-5 right-5 size-7 text-emerald-700/12" />
			<p className="relative min-h-28 text-[15px] text-zinc-700 leading-7">"{testimonial.text}"</p>
			<div className="mt-5 flex items-center gap-3 border-zinc-100 border-t pt-4">
				<div className="flex size-9 items-center justify-center rounded-md bg-emerald-800 font-bold text-white text-xs">
					{testimonial.name.charAt(0)}
				</div>
				<div>
					<p className="font-semibold text-sm text-zinc-950">{testimonial.name}</p>
					<p className="text-sm text-zinc-500">{testimonial.program}</p>
				</div>
			</div>
		</article>
	);
}

export function Testimonials() {
	const testimonials = getTestimonials();

	return (
		<section id="testimonials" className="bg-white py-16 md:py-20">
			<div className="mx-auto max-w-7xl px-6 lg:px-10">
				<div className="mx-auto mb-10 max-w-3xl text-center">
					<p className="mb-4 font-semibold text-emerald-800 text-sm">
						<Trans>Retours étudiants</Trans>
					</p>
					<h2 className="font-display text-4xl text-zinc-950 leading-tight md:text-5xl">
						<Trans>Des étudiants qui avancent plus vite.</Trans>
					</h2>
					<p className="mx-auto mt-4 max-w-2xl text-zinc-600 leading-7">
						<Trans>Des exemples concrets d'utilisation pour créer un CV, se préparer et candidater.</Trans>
					</p>
				</div>

				<div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
					{testimonials.map((testimonial) => (
						<TestimonialCard key={`${testimonial.name}-${testimonial.program}`} testimonial={testimonial} />
					))}
				</div>
			</div>
		</section>
	);
}
