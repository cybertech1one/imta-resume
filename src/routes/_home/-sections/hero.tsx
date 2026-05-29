import { Trans } from "@lingui/react/macro";
import { ArrowRightIcon } from "@phosphor-icons/react";
import { Link } from "@tanstack/react-router";

const HERO_IMAGE = "/home/home-hero-students-career.webp";
const EMERALD = "oklch(0.42 0.13 160)";
const PAPER = "oklch(0.985 0.008 90)";

export function Hero() {
	return (
		<section
			id="hero"
			className="relative min-h-[610px] overflow-hidden bg-zinc-950 text-white sm:min-h-[650px] lg:min-h-[690px]"
		>
			<img
				src={HERO_IMAGE}
				alt=""
				aria-hidden="true"
				className="absolute inset-0 size-full object-cover object-[66%_center] md:object-[58%_center]"
				fetchPriority="high"
				decoding="async"
				width={1672}
				height={941}
			/>
			<div
				aria-hidden="true"
				className="absolute inset-0 bg-[linear-gradient(90deg,rgba(5,19,14,0.94)_0%,rgba(5,24,17,0.78)_35%,rgba(5,24,17,0.34)_68%,rgba(5,24,17,0.04)_100%)]"
			/>
			<div
				aria-hidden="true"
				className="absolute inset-x-0 bottom-0 h-32"
				style={{ background: `linear-gradient(180deg, transparent, ${PAPER})` }}
			/>

			<div className="relative z-10 mx-auto flex min-h-[610px] max-w-7xl items-center px-6 pt-28 pb-16 sm:min-h-[650px] lg:min-h-[690px] lg:px-10">
				<div className="max-w-3xl">
					<h1 className="max-w-3xl font-display text-5xl text-white leading-[0.98] sm:text-6xl md:text-7xl lg:text-[5.5rem]">
						<Trans>Ton métier mérite un</Trans>{" "}
						<span style={{ color: "oklch(0.78 0.15 160)" }}>
							<Trans>CV à sa hauteur.</Trans>
						</span>
					</h1>

					<p className="mt-7 max-w-xl text-lg text-white/84 leading-8 md:text-xl">
						<Trans>
							Crée un CV professionnel, prépare tes entretiens avec l'IA et décroche ton stage avec les outils IMTA.
						</Trans>
					</p>

					<div className="mt-10 flex flex-col gap-4 sm:flex-row">
						<Link
							to="/dashboard"
							className="inline-flex h-14 items-center justify-center gap-2 rounded-md px-7 font-semibold text-base text-white shadow-[0_16px_36px_rgba(0,0,0,0.22)] transition-transform hover:-translate-y-0.5"
							style={{ backgroundColor: EMERALD }}
						>
							<Trans>Créer mon CV</Trans>
							<ArrowRightIcon className="size-5" aria-hidden="true" />
						</Link>

						<a
							href="#templates"
							className="inline-flex h-14 items-center justify-center rounded-md border border-white/60 bg-white/8 px-7 font-semibold text-base text-white backdrop-blur-sm transition-colors hover:bg-white hover:text-zinc-950"
						>
							<Trans>Explorer les modèles</Trans>
						</a>
					</div>
				</div>
			</div>
		</section>
	);
}
