import { t } from "@lingui/core/macro";
import { ArrowRightIcon, FileTextIcon, ListIcon } from "@phosphor-icons/react";
import { Link } from "@tanstack/react-router";

export function Header() {
	return (
		<header className="fixed inset-x-0 top-0 z-50 border-emerald-950/10 border-b bg-white/88 text-zinc-950 shadow-[0_10px_40px_-30px_rgba(0,56,44,0.5)] backdrop-blur-xl">
			<nav
				aria-label={t`Navigation principale`}
				className="mx-auto flex max-w-7xl items-center gap-x-4 px-4 py-3 lg:px-10"
			>
				<Link
					to="/"
					className="group flex items-center gap-3 transition-opacity hover:opacity-90"
					aria-label={t`IMTA Resume - Accueil`}
				>
					<div className="relative flex size-11 items-center justify-center rounded-xl bg-[linear-gradient(135deg,#006b53,#00a88a)] text-white shadow-[0_14px_28px_-18px_rgba(0,107,83,0.9)]">
						<FileTextIcon aria-hidden="true" className="size-5" weight="fill" />
						<div className="absolute -top-0.5 -right-0.5 size-3 rounded-full bg-cyan-300 ring-2 ring-white" />
					</div>
					<span className="hidden font-bold font-display text-xl sm:block">
						IMTA<span className="text-emerald-800"> Resume</span>
					</span>
				</Link>

				<div className="ml-8 hidden items-center gap-6 lg:flex">
					<a href="#objectifs" className="font-medium text-sm text-zinc-700 transition-colors hover:text-emerald-800">
						Fonctionnalités
					</a>
					<a href="#guides" className="font-medium text-sm text-zinc-700 transition-colors hover:text-emerald-800">
						Guides
					</a>
					<a href="#stages" className="font-medium text-sm text-zinc-700 transition-colors hover:text-emerald-800">
						Stages & Emplois
					</a>
					<a
						href="/ressources-etudiants-maroc"
						className="font-medium text-sm text-zinc-700 transition-colors hover:text-emerald-800"
					>
						Ressources
					</a>
					<a
						href="https://imta.ma"
						target="_blank"
						rel="noopener"
						className="font-medium text-sm text-zinc-700 transition-colors hover:text-emerald-800"
					>
						À propos d'IMTA
					</a>
				</div>

				<div className="ml-auto flex items-center gap-x-2 sm:gap-x-3">
					<Link
						to="/dashboard"
						className="hidden h-11 items-center gap-2 rounded-xl bg-[linear-gradient(135deg,#006b53,#009d86)] px-6 font-semibold text-white shadow-[0_16px_32px_-20px_rgba(0,107,83,0.85)] transition-transform hover:-translate-y-0.5 sm:inline-flex"
						aria-label={t`Aller au tableau de bord`}
					>
						Commencer maintenant
						<ArrowRightIcon aria-hidden="true" className="size-4" />
					</Link>

					<details className="relative lg:hidden">
						<summary
							className="inline-flex size-10 cursor-pointer list-none items-center justify-center rounded-md text-zinc-700 transition-colors hover:bg-emerald-50 hover:text-emerald-800 [&::-webkit-details-marker]:hidden"
							aria-label={t`Menu`}
						>
							<ListIcon aria-hidden="true" />
						</summary>
						<div className="absolute top-12 right-0 w-[min(22rem,calc(100vw-2rem))] rounded-lg border border-zinc-200 bg-white p-4 shadow-xl">
							<div className="flex flex-col gap-3">
								<a href="#objectifs" className="py-2 font-medium text-sm text-zinc-700">
									Fonctionnalités
								</a>
								<a href="#guides" className="py-2 font-medium text-sm text-zinc-700">
									Guides
								</a>
								<a href="#stages" className="py-2 font-medium text-sm text-zinc-700">
									Stages & Emplois
								</a>
								<a href="/ressources-etudiants-maroc" className="py-2 font-medium text-sm text-zinc-700">
									Ressources
								</a>
								<a
									href="https://imta.ma"
									target="_blank"
									rel="noopener"
									className="py-2 font-medium text-sm text-zinc-700"
								>
									À propos d'IMTA
								</a>
								<div className="mt-2 border-zinc-200 border-t pt-3">
									<Link
										to="/dashboard"
										className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-emerald-800 px-5 font-semibold text-white hover:bg-emerald-900"
									>
										Commencer gratuitement
									</Link>
								</div>
							</div>
						</div>
					</details>
				</div>
			</nav>
		</header>
	);
}
