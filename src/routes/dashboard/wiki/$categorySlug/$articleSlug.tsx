import { t } from "@lingui/core/macro";
import { useLingui } from "@lingui/react";
import { Trans } from "@lingui/react/macro";
import { BookOpenIcon } from "@phosphor-icons/react";
import { createFileRoute, notFound } from "@tanstack/react-router";
import { motion } from "motion/react";
import { ErrorComponent } from "@/components/error-component";
import { getArticle } from "@/data/wiki";
import { DashboardHeader } from "../../-components/header";
import { WikiArticleHeader } from "../-components/wiki-article-header";
import { WikiBreadcrumbs } from "../-components/wiki-breadcrumbs";
import { WikiBannerCta, WikiInlineCta } from "../-components/wiki-cta";
import { WikiRelatedArticles } from "../-components/wiki-related-articles";
import { WikiSidebar } from "../-components/wiki-sidebar";
import { WikiTableOfContents } from "../-components/wiki-table-of-contents";

// biome-ignore lint/suspicious/noExplicitAny: Route path not in generated route tree
export const Route = createFileRoute("/dashboard/wiki/$categorySlug/$articleSlug" as any)({
	component: WikiArticlePage,
	errorComponent: ErrorComponent,
});

function WikiArticlePage() {
	const { i18n } = useLingui();
	// biome-ignore lint/suspicious/noExplicitAny: Route path not in generated route tree
	const { categorySlug, articleSlug } = (Route as any).useParams();
	const result = getArticle(categorySlug, articleSlug);

	if (!result) {
		throw notFound();
	}

	const { category, article } = result;

	return (
		<>
			<DashboardHeader icon={BookOpenIcon} title={t`Wiki - ${i18n._(article.titleKey)}`} />

			<div className="container mx-auto px-4 py-8 lg:px-12">
				<WikiBreadcrumbs
					items={[
						{ label: "Wiki", href: "/dashboard/wiki" },
						{ label: i18n._(category.titleKey), href: `/dashboard/wiki/${category.slug}` },
						{ label: i18n._(article.titleKey) },
					]}
				/>

				<div className="flex gap-8">
					<WikiSidebar activeCategorySlug={categorySlug} activeArticleSlug={articleSlug} />

					<div className="min-w-0 flex-1">
						<motion.article initial={false} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
							<WikiArticleHeader article={article} category={category} />

							{/* Article Body */}
							<div className="prose prose-lg max-w-none">
								{article.sections.map((section, index) => (
									<section key={i18n._(section.titleKey)} id={`section-${index}`} className="mb-10">
										<h2 className="font-bold font-display text-xl">{i18n._(section.titleKey)}</h2>
										<div className="mt-3 whitespace-pre-line text-muted-foreground leading-relaxed">
											{i18n._(section.contentKey)}
										</div>

										{/* Insert inline CTA after 3rd section */}
										{index === 2 && <WikiInlineCta />}
									</section>
								))}
							</div>

							{/* FAQ Section */}
							{article.faqItems && article.faqItems.length > 0 && (
								<section className="mt-12 rounded-xl border bg-card p-6">
									<h2 className="mb-6 font-bold font-display text-xl">
										<Trans>Frequently Asked Questions</Trans>
									</h2>
									<div className="space-y-6">
										{article.faqItems.map((faq) => (
											<div key={i18n._(faq.questionKey)}>
												<h3 className="font-semibold text-foreground">{i18n._(faq.questionKey)}</h3>
												<p className="mt-2 text-muted-foreground leading-relaxed">{i18n._(faq.answerKey)}</p>
											</div>
										))}
									</div>
								</section>
							)}

							<WikiBannerCta />

							<WikiRelatedArticles currentArticleSlug={articleSlug} category={category} />
						</motion.article>
					</div>

					<WikiTableOfContents sections={article.sections} />
				</div>
			</div>
		</>
	);
}
