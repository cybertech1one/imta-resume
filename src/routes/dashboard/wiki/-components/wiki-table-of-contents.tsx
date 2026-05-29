import { t } from "@lingui/core/macro";
import { useLingui } from "@lingui/react";
import { ListIcon } from "@phosphor-icons/react";
import type { WikiSection } from "@/data/wiki";
import { cn } from "@/utils/style";

type WikiTableOfContentsProps = {
	sections: WikiSection[];
	activeIndex?: number;
};

export function WikiTableOfContents({ sections, activeIndex }: WikiTableOfContentsProps) {
	const { i18n } = useLingui();

	return (
		<aside className="hidden w-56 shrink-0 xl:block">
			<nav className="sticky top-24 rounded-xl border bg-card p-4" aria-label={t`Table of contents`}>
				<h2 className="mb-3 flex items-center gap-2 font-semibold text-foreground text-xs uppercase tracking-wider">
					<ListIcon aria-hidden="true" className="size-4" />
					{t`On this page`}
				</h2>
				<ol className="space-y-1">
					{sections.map((section, index) => (
						<li key={i18n._(section.titleKey)}>
							<a
								href={`#section-${index}`}
								className={cn(
									"block rounded-md px-2.5 py-1.5 text-xs transition-colors",
									index === activeIndex
										? "bg-primary/10 font-medium text-primary"
										: "text-muted-foreground hover:text-foreground",
								)}
							>
								{i18n._(section.titleKey)}
							</a>
						</li>
					))}
				</ol>
			</nav>
		</aside>
	);
}
