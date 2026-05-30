import { Trans } from "@lingui/react/macro";
import { ArrowLeftIcon, WarningIcon } from "@phosphor-icons/react";
import { Link, type NotFoundRouteProps } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { BrandIcon } from "../ui/brand-icon";

export function NotFoundScreen(_props: NotFoundRouteProps) {
	return (
		<div className="mx-auto flex h-svh max-w-md flex-col items-center justify-center gap-y-4">
			<BrandIcon variant="logo" className="size-12" />

			<Alert>
				<WarningIcon />
				<AlertTitle>
					<Trans>Page introuvable</Trans>
				</AlertTitle>
				<AlertDescription>
					<Trans>La page que vous recherchez n'existe pas ou a été déplacée.</Trans>
				</AlertDescription>
			</Alert>

			<Button asChild>
				<Link to="/dashboard">
					<ArrowLeftIcon />
					<Trans>Aller au tableau de bord</Trans>
				</Link>
			</Button>
		</div>
	);
}
