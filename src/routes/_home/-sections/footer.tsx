import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import type { Icon } from "@phosphor-icons/react";
import {
	EnvelopeIcon,
	FileTextIcon,
	GlobeIcon,
	InstagramLogoIcon,
	LinkedinLogoIcon,
	MapPinIcon,
	PhoneIcon,
} from "@phosphor-icons/react";

type FooterLinkItem = {
	url: string;
	label: string;
};

type FooterLinkGroupProps = {
	title: string;
	links: FooterLinkItem[];
};

type SocialLink = {
	url: string;
	label: string;
	icon: Icon;
};

const getProductLinks = (): FooterLinkItem[] => [
	{ url: "/dashboard", label: t`Créer un CV` },
	{ url: "/wiki", label: t`Guide d'utilisation` },
	{ url: "#features", label: t`Fonctionnalités` },
	{ url: "#templates", label: t`Modèles` },
	{ url: "#faq", label: t`FAQ` },
];

const getIMTALinks = (): FooterLinkItem[] => [
	{ url: "https://imta.ma", label: t`Site web IMTA` },
	{ url: "https://imta.ma/programs", label: t`Programmes` },
	{ url: "https://imta.ma/admissions", label: t`Admissions` },
	{ url: "https://imta.ma/contact", label: t`Contacter IMTA` },
];

const socialLinks: SocialLink[] = [
	{ url: "https://imta.ma", label: "Site web", icon: GlobeIcon },
	{ url: "https://linkedin.com/school/imta-ma", label: "LinkedIn", icon: LinkedinLogoIcon },
	{ url: "https://instagram.com/imta.ma", label: "Instagram", icon: InstagramLogoIcon },
];

export function Footer() {
	return (
		<footer id="footer" className="border-zinc-200 border-t bg-white py-12 md:py-16">
			<div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-6 sm:grid-cols-2 lg:grid-cols-4 lg:px-10">
				<div className="space-y-6 sm:col-span-2 lg:col-span-1">
					<div className="flex items-center gap-3">
						<div className="relative flex size-11 items-center justify-center rounded-md bg-emerald-800 text-white">
							<FileTextIcon aria-hidden="true" className="size-6" weight="fill" />
							<div className="absolute -top-0.5 -right-0.5 size-2.5 rounded-full bg-teal-400 ring-2 ring-white" />
						</div>
						<h2 className="font-bold font-display text-2xl text-zinc-950">
							IMTA<span className="text-emerald-800"> Resume</span>
						</h2>
					</div>

					<p className="max-w-xs text-zinc-600 leading-7">
						<Trans>Le créateur de CV gratuit pour les étudiants et professionnels de l'IMTA au Maroc.</Trans>
					</p>

					<div className="flex items-center gap-2 text-sm text-zinc-500">
						<MapPinIcon aria-hidden="true" className="size-4 text-emerald-800" />
						<span>
							<Trans>Maroc</Trans>
						</span>
					</div>

					<div className="flex items-center gap-2 pt-2">
						{socialLinks.map((social) => (
							<a
								key={social.label}
								href={social.url}
								target="_blank"
								rel="noopener"
								aria-label={`${social.label} (${t`s'ouvre dans un nouvel onglet`})`}
								className="inline-flex size-9 items-center justify-center rounded-md text-zinc-600 transition-colors hover:bg-emerald-50 hover:text-emerald-800"
							>
								<social.icon aria-hidden="true" size={20} />
							</a>
						))}
					</div>
				</div>

				<FooterLinkGroup title={t`Produit`} links={getProductLinks()} />
				<FooterLinkGroup title={t`IMTA`} links={getIMTALinks()} />

				<div className="space-y-6 sm:col-span-2 lg:col-span-1">
					<h2 className="font-semibold text-xs text-zinc-500 uppercase">
						<Trans>Contact</Trans>
					</h2>
					<div className="space-y-4">
						<a href="mailto:contact@imta.ma" className="flex items-center gap-3 text-zinc-600 hover:text-emerald-800">
							<EnvelopeIcon aria-hidden="true" className="size-4" />
							<span>contact@imta.ma</span>
						</a>
						<a href="tel:+212500000000" className="flex items-center gap-3 text-zinc-600 hover:text-emerald-800">
							<PhoneIcon aria-hidden="true" className="size-4" />
							<span>+212 5 00 00 00 00</span>
						</a>
						<a
							href="https://imta.ma"
							target="_blank"
							rel="noopener"
							className="flex items-center gap-3 text-zinc-600 hover:text-emerald-800"
						>
							<GlobeIcon aria-hidden="true" className="size-4" />
							<span>imta.ma</span>
						</a>
					</div>

					<div className="pt-6 text-xs text-zinc-500 leading-6">
						<p>&copy; {new Date().getFullYear()} IMTA Resume</p>
						<p>
							<Trans>Tous droits réservés.</Trans>
						</p>
					</div>
				</div>
			</div>
		</footer>
	);
}

function FooterLinkGroup({ title, links }: FooterLinkGroupProps) {
	return (
		<div className="space-y-5">
			<h2 className="font-semibold text-xs text-zinc-500 uppercase">{title}</h2>
			<ul className="space-y-3.5">
				{links.map((link) => (
					<FooterLink key={link.url} url={link.url} label={link.label} />
				))}
			</ul>
		</div>
	);
}

function FooterLink({ url, label }: FooterLinkItem) {
	const isExternal = url.startsWith("http");

	return (
		<li>
			<a
				href={url}
				target={isExternal ? "_blank" : undefined}
				rel={isExternal ? "noopener" : undefined}
				className="inline-flex items-center gap-1.5 text-zinc-600 underline-offset-4 transition-colors hover:text-emerald-800 hover:underline"
			>
				{label}
				{isExternal && <span className="sr-only"> ({t`s'ouvre dans un nouvel onglet`})</span>}
			</a>
		</li>
	);
}
