import { GithubLogoIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";

export function GithubStarsButton() {
	return (
		<Button variant="outline" disabled aria-hidden="true">
			<GithubLogoIcon aria-hidden="true" />
		</Button>
	);
}
