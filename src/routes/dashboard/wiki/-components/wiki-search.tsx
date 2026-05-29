import { t } from "@lingui/core/macro";
import { useLingui } from "@lingui/react";
import { Trans } from "@lingui/react/macro";
import { MagnifyingGlassIcon, XIcon } from "@phosphor-icons/react";
import { Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { getAllArticles } from "@/data/wiki";

export function WikiSearch() {
	const { i18n } = useLingui();
	const [query, setQuery] = useState("");

	const allArticles = useMemo(() => getAllArticles(), []);

	const results = useMemo(() => {
		if (query.length < 2) return [];
		const lower = query.toLowerCase();
		return allArticles
			.filter((item) => {
				const title = i18n._(item.article.titleKey).toLowerCase();
				const description = i18n._(item.article.descriptionKey).toLowerCase();
				const keywords = item.article.keywords.join(" ").toLowerCase();
				return title.includes(lower) || description.includes(lower) || keywords.includes(lower);
			})
			.slice(0, 8);
	}, [query, allArticles, i18n]);

	return (
		<div className="relative w-full max-w-xl">
			<div className="relative">
				<MagnifyingGlassIcon
					aria-hidden="true"
					className="pointer-events-none absolute top-1/2 left-3 size-5 -translate-y-1/2 text-muted-foreground"
				/>
				<Input
					type="search"
					value={query}
					onChange={(e) => setQuery(e.target.value)}
					placeholder={t`Search articles, topics, keywords...`}
					className="rounded-xl border-border/50 bg-card pr-10 pl-10 shadow-sm"
					aria-label={t`Search wiki articles`}
				/>
				{query && (
					<button
						type="button"
						onClick={() => setQuery("")}
						className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
						aria-label={t`Clear search`}
					>
						<XIcon aria-hidden="true" className="size-4" />
					</button>
				)}
			</div>

			{results.length > 0 && (
				<div className="absolute top-full z-50 mt-2 w-full rounded-xl border bg-card p-2 shadow-lg">
					{results.map((item) => (
						<Link
							key={`${item.category.slug}/${item.article.slug}`}
							// biome-ignore lint/suspicious/noExplicitAny: TanStack Router dynamic route
							to={`/dashboard/wiki/${item.category.slug}/${item.article.slug}` as any}
							className="block rounded-lg px-3 py-2.5 transition-colors hover:bg-muted"
							onClick={() => setQuery("")}
						>
							<p className="font-medium text-foreground text-sm">{i18n._(item.article.titleKey)}</p>
							<p className="mt-0.5 text-muted-foreground text-xs">{i18n._(item.category.titleKey)}</p>
						</Link>
					))}
				</div>
			)}

			{query.length >= 2 && results.length === 0 && (
				<div className="absolute top-full z-50 mt-2 w-full rounded-xl border bg-card p-4 text-center shadow-lg">
					<p className="text-muted-foreground text-sm">
						<Trans>No articles found for "{query}"</Trans>
					</p>
				</div>
			)}
		</div>
	);
}
