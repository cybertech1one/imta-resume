import { t } from "@lingui/core/macro";
import { useLingui } from "@lingui/react";
import { BookOpenIcon } from "@phosphor-icons/react";
import { createFileRoute, notFound } from "@tanstack/react-router";
import { motion } from "motion/react";
import { ErrorComponent } from "@/components/error-component";
import { getCategory } from "@/data/wiki";
import { DashboardHeader } from "../../-components/header";
import { WikiArticleCard } from "../-components/wiki-article-card";
import { WikiBreadcrumbs } from "../-components/wiki-breadcrumbs";
import { WikiSidebar } from "../-components/wiki-sidebar";

// biome-ignore lint/suspicious/noExplicitAny: Route path not in generated route tree
export const Route = createFileRoute("/dashboard/wiki/$categorySlug/" as any)({
	component: WikiCategoryPage,
	errorComponent: ErrorComponent,
});

function WikiCategoryPage() {
	const { i18n } = useLingui();
	// biome-ignore lint/suspicious/noExplicitAny: Route path not in generated route tree
	const { categorySlug } = (Route as any).useParams();
	const category = getCategory(categorySlug);

	if (!category) {
		throw notFound();
	}

	return (
		<>
			<DashboardHeader icon={BookOpenIcon} title={t`Wiki - ${i18n._(category.titleKey)}`} />

			<div className="container mx-auto px-4 py-8 lg:px-12">
				<WikiBreadcrumbs items={[{ label: "Wiki", href: "/dashboard/wiki" }, { label: i18n._(category.titleKey) }]} />

				<div className="flex gap-8">
					<WikiSidebar activeCategorySlug={categorySlug} />

					<div className="min-w-0 flex-1">
						<motion.div initial={false} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
							<h1 className="font-bold font-display text-3xl md:text-4xl">{i18n._(category.titleKey)}</h1>
							<p className="mt-3 max-w-2xl text-lg text-muted-foreground leading-relaxed">
								{i18n._(category.descriptionKey)}
							</p>

							<div className="mt-8 grid gap-4 sm:grid-cols-2">
								{category.articles.map((article, index) => (
									<motion.div
										key={article.slug}
										initial={false}
										animate={{ opacity: 1, y: 0 }}
										transition={{ duration: 0.4, delay: 0.05 * index }}
									>
										<WikiArticleCard article={article} categorySlug={categorySlug} />
									</motion.div>
								))}
							</div>
						</motion.div>
					</div>
				</div>
			</div>
		</>
	);
}
