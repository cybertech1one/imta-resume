import { useLingui } from "@lingui/react";
import { Link } from "@tanstack/react-router";
import { wikiCategories } from "@/data/wiki";
import { cn } from "@/utils/style";

type WikiSidebarProps = {
	activeCategorySlug?: string;
	activeArticleSlug?: string;
};

export function WikiSidebar({ activeCategorySlug, activeArticleSlug }: WikiSidebarProps) {
	const { i18n } = useLingui();

	return (
		<aside className="hidden w-64 shrink-0 lg:block">
			<nav className="sticky top-24 space-y-1 rounded-xl border bg-card p-4">
				<h2 className="mb-3 font-semibold text-foreground text-sm uppercase tracking-wider">
					{i18n._({ id: "wiki.sidebar.categories", message: "Categories" })}
				</h2>
				{wikiCategories.map((category) => {
					const isActive = category.slug === activeCategorySlug;
					return (
						<div key={category.slug}>
							<Link
								// biome-ignore lint/suspicious/noExplicitAny: TanStack Router dynamic route
								to={`/wiki/${category.slug}` as any}
								className={cn(
									"block rounded-lg px-3 py-2 text-sm transition-colors",
									isActive
										? "bg-primary/10 font-medium text-primary"
										: "text-muted-foreground hover:bg-muted hover:text-foreground",
								)}
							>
								{i18n._(category.titleKey)}
							</Link>
							{isActive && (
								<div className="mt-1 ml-3 space-y-0.5 border-primary/20 border-l-2 pl-3">
									{category.articles.map((article) => (
										<Link
											key={article.slug}
											// biome-ignore lint/suspicious/noExplicitAny: TanStack Router dynamic route
											to={`/wiki/${category.slug}/${article.slug}` as any}
											className={cn(
												"block rounded-md px-2 py-1.5 text-xs transition-colors",
												article.slug === activeArticleSlug
													? "font-medium text-primary"
													: "text-muted-foreground hover:text-foreground",
											)}
										>
											{i18n._(article.titleKey)}
										</Link>
									))}
								</div>
							)}
						</div>
					);
				})}
			</nav>
		</aside>
	);
}
