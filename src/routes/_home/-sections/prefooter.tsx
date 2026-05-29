import { Trans } from "@lingui/react/macro";
import { ArrowRightIcon } from "@phosphor-icons/react";
import { Link } from "@tanstack/react-router";

const TERRACOTTA = "oklch(0.55 0.14 35)";
const EMERALD = "oklch(0.4 0.13 160)";
const EMERALD_DEEP = "oklch(0.3 0.1 162)";

function ZelligeBand() {
	return (
		<svg
			aria-hidden="true"
			className="pointer-events-none absolute inset-0 size-full opacity-[0.07]"
			xmlns="http://www.w3.org/2000/svg"
		>
			<defs>
				<pattern id="zellige-cta" x="0" y="0" width="90" height="90" patternUnits="userSpaceOnUse">
					<path
						d="M45 5 L56 28 L80 22 L66 44 L88 50 L66 56 L80 78 L56 72 L45 95 L34 72 L10 78 L24 56 L2 50 L24 44 L10 22 L34 28 Z"
						fill="none"
						stroke="white"
						strokeWidth="1"
					/>
				</pattern>
			</defs>
			<rect width="100%" height="100%" fill="url(#zellige-cta)" />
		</svg>
	);
}

export function Prefooter() {
	return (
		<section
			className="relative overflow-hidden py-20 md:py-24"
			style={{ background: `linear-gradient(135deg, ${EMERALD_DEEP}, ${EMERALD})` }}
		>
			<ZelligeBand />

			<div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
				<p className="mb-5 font-medium text-sm text-white/65">
					<Trans>Ton avenir commence maintenant</Trans>
				</p>
				<h2 className="font-display text-4xl text-white leading-tight md:text-6xl">
					<Trans>Prêt à décrocher ton stage</Trans>
					<br />
					<span style={{ color: TERRACOTTA }}>
						<Trans>ou ton premier emploi ?</Trans>
					</span>
				</h2>
				<p className="mx-auto mt-6 max-w-xl text-lg text-white/74 leading-8">
					<Trans>
						Prépare ton CV, tes entretiens et tes candidatures dans un espace gratuit pensé pour les étudiants IMTA.
					</Trans>
				</p>

				<div className="mt-10 flex justify-center">
					<Link
						to="/dashboard"
						className="inline-flex h-14 items-center justify-center gap-2 rounded-md bg-white px-8 font-semibold text-base shadow-[0_18px_42px_rgba(0,0,0,0.22)] hover:bg-white"
						style={{ color: EMERALD }}
					>
						<Trans>Créer mon CV gratuitement</Trans>
						<ArrowRightIcon className="size-5" aria-hidden="true" />
					</Link>
				</div>
			</div>
		</section>
	);
}
