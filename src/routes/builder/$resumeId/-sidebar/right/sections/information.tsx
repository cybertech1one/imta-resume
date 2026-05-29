import { Trans } from "@lingui/react/macro";
import { SectionBase } from "../shared/section-base";

export function InformationSectionBuilder() {
	return (
		<SectionBase type="information" className="space-y-4">
			<div className="space-y-2 rounded-md border bg-sky-600 p-5 text-white dark:bg-sky-700">
				<h4 className="font-medium tracking-tight">
					<Trans>IMTA Resume</Trans>
				</h4>

				<div className="space-y-2 text-xs leading-normal">
					<Trans>
						<p>
							Bienvenue sur IMTA Resume, votre outil de création de CV professionnel. Construisez un CV qui met en
							valeur vos compétences et votre parcours pour décrocher le poste de vos rêves.
						</p>
					</Trans>
				</div>
			</div>
		</SectionBase>
	);
}
