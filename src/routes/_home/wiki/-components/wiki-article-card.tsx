import { useLingui } from "@lingui/react";
import { Trans } from "@lingui/react/macro";
import { ArrowRightIcon, ClockIcon } from "@phosphor-icons/react";
import { Link } from "@tanstack/react-router";
import type { WikiArticle } from "@/data/wiki";

type WikiArticleCardProps = {
	article: WikiArticle;
	categorySlug: string;
};

export function WikiArticleCard({ article, categorySlug }: WikiArticleCardProps) {
	const { i18n } = useLingui();

	return (
		<Link
			// biome-ignore lint/suspicious/noExplicitAny: TanStack Router dynamic route
			to={`/wiki/${categorySlug}/${article.slug}` as any}
			className="group block rounded-xl border bg-card p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md"
		>
			<h3 className="font-semibold text-foreground transition-colors group-hover:text-primary">
				{i18n._(article.titleKey)}
			</h3>
			<p className="mt-2 line-clamp-2 text-muted-foreground text-sm leading-relaxed">
				{i18n._(article.descriptionKey)}
			</p>
			<div className="mt-4 flex items-center justify-between">
				<span className="flex items-center gap-1.5 text-muted-foreground/70 text-xs">
					<ClockIcon aria-hidden="true" className="size-3.5" />
					<Trans>{article.readingTime} min read</Trans>
				</span>
				<span className="flex items-center gap-1 text-primary text-sm opacity-0 transition-opacity group-hover:opacity-100">
					<Trans>Read</Trans>
					<ArrowRightIcon aria-hidden="true" className="size-3.5" />
				</span>
			</div>
		</Link>
	);
}
