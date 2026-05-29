import { useLingui } from "@lingui/react";
import { Trans } from "@lingui/react/macro";
import { CalendarIcon, ClockIcon, TagIcon } from "@phosphor-icons/react";
import { Badge } from "@/components/ui/badge";
import type { WikiArticle, WikiCategory } from "@/data/wiki";

type WikiArticleHeaderProps = {
	article: WikiArticle;
	category: WikiCategory;
};

export function WikiArticleHeader({ article, category }: WikiArticleHeaderProps) {
	const { i18n } = useLingui();

	return (
		<header className="mb-8">
			<Badge variant="outline" className="mb-4 text-primary">
				{i18n._(category.titleKey)}
			</Badge>
			<h1 className="font-bold font-display text-3xl leading-tight md:text-4xl">{i18n._(article.titleKey)}</h1>
			<p className="mt-3 text-lg text-muted-foreground leading-relaxed">{i18n._(article.descriptionKey)}</p>
			<div className="mt-4 flex flex-wrap items-center gap-4 text-muted-foreground text-sm">
				<span className="flex items-center gap-1.5">
					<ClockIcon aria-hidden="true" className="size-4" />
					<Trans>{article.readingTime} min read</Trans>
				</span>
				<span className="flex items-center gap-1.5">
					<CalendarIcon aria-hidden="true" className="size-4" />
					<Trans>Updated {article.dateModified}</Trans>
				</span>
			</div>
			{article.keywords.length > 0 && (
				<div className="mt-4 flex flex-wrap items-center gap-2">
					<TagIcon aria-hidden="true" className="size-4 text-muted-foreground/60" />
					{article.keywords.slice(0, 5).map((keyword) => (
						<Badge key={keyword} variant="secondary" className="text-xs">
							{keyword}
						</Badge>
					))}
				</div>
			)}
		</header>
	);
}
