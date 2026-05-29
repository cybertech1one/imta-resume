import { Trans } from "@lingui/react/macro";
import type { WikiCategory } from "@/data/wiki";
import { WikiArticleCard } from "./wiki-article-card";

type WikiRelatedArticlesProps = {
	currentArticleSlug: string;
	category: WikiCategory;
};

export function WikiRelatedArticles({ currentArticleSlug, category }: WikiRelatedArticlesProps) {
	const related = category.articles.filter((a) => a.slug !== currentArticleSlug).slice(0, 3);

	if (related.length === 0) return null;

	return (
		<section className="mt-12">
			<h2 className="mb-6 font-bold font-display text-xl">
				<Trans>Related Articles</Trans>
			</h2>
			<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
				{related.map((article) => (
					<WikiArticleCard key={article.slug} article={article} categorySlug={category.slug} />
				))}
			</div>
		</section>
	);
}
