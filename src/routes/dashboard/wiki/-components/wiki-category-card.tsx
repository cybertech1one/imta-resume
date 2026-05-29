import { useLingui } from "@lingui/react";
import { Trans } from "@lingui/react/macro";
import {
	ArrowRightIcon,
	ArrowsClockwiseIcon,
	BookOpenIcon,
	BriefcaseIcon,
	ChatCircleIcon,
	CompassIcon,
	CurrencyDollarIcon,
	EnvelopeIcon,
	FileTextIcon,
	HouseIcon,
	LayoutIcon,
	LinkedinLogoIcon,
	ListIcon,
	MagnifyingGlassIcon,
} from "@phosphor-icons/react";
import { Link } from "@tanstack/react-router";
import type { WikiCategory } from "@/data/wiki";

const iconMap: Record<string, React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>> = {
	FileTextIcon,
	LayoutIcon,
	ListIcon,
	BriefcaseIcon,
	MagnifyingGlassIcon,
	EnvelopeIcon,
	ArrowsClockwiseIcon,
	ChatCircleIcon,
	LinkedinLogoIcon,
	CurrencyDollarIcon,
	CompassIcon,
	HouseIcon,
	BookOpenIcon,
};

type WikiCategoryCardProps = {
	category: WikiCategory;
};

export function WikiCategoryCard({ category }: WikiCategoryCardProps) {
	const { i18n } = useLingui();
	const IconComponent = iconMap[category.iconName] ?? FileTextIcon;

	return (
		<Link
			// biome-ignore lint/suspicious/noExplicitAny: TanStack Router dynamic route
			to={`/dashboard/wiki/${category.slug}` as any}
			className="group relative flex flex-col overflow-hidden rounded-xl border bg-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg"
		>
			<div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 transition-transform duration-300 group-hover:scale-110">
				<IconComponent aria-hidden className="size-6 text-primary" />
			</div>
			<h3 className="font-semibold text-foreground text-lg transition-colors group-hover:text-primary">
				{i18n._(category.titleKey)}
			</h3>
			<p className="mt-2 flex-1 text-muted-foreground text-sm leading-relaxed">{i18n._(category.descriptionKey)}</p>
			<div className="mt-4 flex items-center justify-between">
				<span className="text-muted-foreground/70 text-xs">
					<Trans>{category.articles.length} articles</Trans>
				</span>
				<span className="flex items-center gap-1 text-primary text-sm opacity-0 transition-opacity group-hover:opacity-100">
					<Trans>Explore</Trans>
					<ArrowRightIcon aria-hidden="true" className="size-3.5" />
				</span>
			</div>
		</Link>
	);
}
