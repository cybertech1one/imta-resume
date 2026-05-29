import { Trans } from "@lingui/react/macro";
import { ArrowClockwiseIcon, WarningCircleIcon } from "@phosphor-icons/react";
import { Button } from "./ui/button";

type ErrorComponentProps = {
	error: Error;
	reset: () => void;
};

export function ErrorComponent({ error, reset }: ErrorComponentProps) {
	if (import.meta.env.DEV) {
		console.error("[ErrorComponent]", error);
	}

	return (
		<div className="flex flex-col items-center justify-center rounded-xl border bg-background p-8">
			<WarningCircleIcon className="size-12 text-destructive" />
			<p className="mt-4 font-medium text-foreground">
				<Trans>Une erreur est survenue</Trans>
			</p>
			<p className="mt-2 text-center text-muted-foreground text-sm">
				<Trans>Veuillez réessayer. Si le problème persiste, contactez le support.</Trans>
			</p>
			<Button onClick={reset} className="mt-4">
				<ArrowClockwiseIcon />
				<Trans>Réessayer</Trans>
			</Button>
		</div>
	);
}
