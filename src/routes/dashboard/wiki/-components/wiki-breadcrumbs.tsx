import { t } from "@lingui/core/macro";
import { CaretRightIcon, HouseIcon } from "@phosphor-icons/react";
import { Link } from "@tanstack/react-router";

type BreadcrumbItem = {
	label: string;
	href?: string;
};

type WikiBreadcrumbsProps = {
	items: BreadcrumbItem[];
};

export function WikiBreadcrumbs({ items }: WikiBreadcrumbsProps) {
	return (
		<nav aria-label={t`Breadcrumb`} className="mb-6">
			<ol className="flex flex-wrap items-center gap-1.5 text-muted-foreground text-sm">
				<li>
					<Link to="/dashboard" className="flex items-center gap-1 transition-colors hover:text-primary">
						<HouseIcon aria-hidden="true" className="size-4" />
						<span className="sr-only">{t`Dashboard`}</span>
					</Link>
				</li>
				{items.map((item) => (
					<li key={item.label} className="flex items-center gap-1.5">
						<CaretRightIcon aria-hidden="true" className="size-3 text-muted-foreground/50" />
						{item.href ? (
							<Link
								// biome-ignore lint/suspicious/noExplicitAny: TanStack Router dynamic route
								to={item.href as any}
								className="transition-colors hover:text-primary"
							>
								{item.label}
							</Link>
						) : (
							<span className="font-medium text-foreground">{item.label}</span>
						)}
					</li>
				))}
			</ol>
		</nav>
	);
}
