import { Trans } from "@lingui/react/macro";
import { ArrowSquareOutIcon, BookOpenIcon, type Icon } from "@phosphor-icons/react";
import { Link } from "@tanstack/react-router";
import { Card, CardContent } from "@/components/ui/card";

interface WikiLinkCardProps {
	title: string;
	description: string;
	wikiPath: string;
	icon?: Icon;
}

export function WikiLinkCard({ title, description, wikiPath, icon: IconComponent = BookOpenIcon }: WikiLinkCardProps) {
	return (
		<Card className="border border-primary/15 bg-primary/5 transition-all duration-200 hover:border-primary/30 hover:shadow-sm">
			<CardContent className="flex items-center gap-4 p-4">
				<div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10" aria-hidden="true">
					<IconComponent className="size-5 text-primary" weight="duotone" />
				</div>
				<div className="min-w-0 flex-1">
					<p className="font-medium text-foreground text-sm">{title}</p>
					<p className="text-muted-foreground text-xs">{description}</p>
				</div>
				<Link
					// biome-ignore lint/suspicious/noExplicitAny: Wiki paths are not in the generated route tree
					to={wikiPath as any}
					target="_blank"
					rel="noopener noreferrer"
					className="flex shrink-0 items-center gap-1 rounded-md px-3 py-1.5 font-medium text-primary text-xs transition-colors hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
					aria-label={title}
				>
					<Trans>Learn More</Trans>
					<ArrowSquareOutIcon className="size-3.5" aria-hidden="true" />
				</Link>
			</CardContent>
		</Card>
	);
}
