import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { CaretRightIcon } from "@phosphor-icons/react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

type FAQItemData = {
	question: string;
	answer: React.ReactNode;
};

const getFaqItems = (): FAQItemData[] => [
	{
		question: t`IMTA Resume est-il vraiment gratuit ?`,
		answer: t`Oui ! IMTA Resume est entièrement gratuit, sans coûts cachés, abonnements premium ni frais d'inscription.`,
	},
	{
		question: t`Comment mes données sont-elles protégées ?`,
		answer: t`Vos données sont stockées de manière sécurisée et ne sont jamais partagées avec des tiers. Vous avez un contrôle total sur vos informations personnelles.`,
	},
	{
		question: t`Puis-je exporter mon CV en PDF ?`,
		answer: t`Oui. Vous pouvez exporter votre CV en PDF en un seul clic, avec une mise en forme conservée.`,
	},
	{
		question: t`IMTA Resume est-il disponible en plusieurs langues ?`,
		answer: t`Oui, IMTA Resume est disponible en plusieurs langues, notamment le français, l'anglais et l'arabe. Vous pouvez choisir votre langue préférée dans les paramètres.`,
	},
	{
		question: t`Qu'est-ce qui différencie IMTA Resume des autres créateurs de CV ?`,
		answer: t`IMTA Resume est gratuit, respectueux de la vie privée et pensé pour aider les étudiants à avancer rapidement dans leurs candidatures.`,
	},
	{
		question: t`Puis-je personnaliser les modèles ?`,
		answer: t`Oui. Chaque modèle peut être personnalisé avec les couleurs, les polices, l'espacement et les sections dont vous avez besoin.`,
	},
	{
		question: t`Comment partager mon CV ?`,
		answer: t`Vous pouvez partager votre CV via une URL publique unique, le protéger avec un mot de passe ou le télécharger en PDF.`,
	},
];

export function FAQ() {
	const faqItems = getFaqItems();
	const midpoint = Math.ceil(faqItems.length / 2);
	const columns = [faqItems.slice(0, midpoint), faqItems.slice(midpoint)];

	return (
		<section id="faq" className="bg-white py-16 md:py-20">
			<div className="mx-auto max-w-7xl px-6 lg:px-10">
				<div className="mb-10 max-w-3xl">
					<p className="mb-4 font-semibold text-emerald-800 text-sm">
						<Trans>Des questions ?</Trans>
					</p>
					<h2 className="font-display text-4xl text-zinc-950 leading-tight md:text-5xl">
						<Trans>Questions fréquentes</Trans>
					</h2>
				</div>

				<div className="grid gap-4 lg:grid-cols-2">
					{columns.map((column, index) => (
						<Accordion
							key={`faq-column-${index}`}
							type="multiple"
							className="rounded-lg border border-zinc-200 bg-white px-5"
						>
							{column.map((item) => (
								<FAQItemComponent key={item.question} item={item} />
							))}
						</Accordion>
					))}
				</div>
			</div>
		</section>
	);
}

type FAQItemComponentProps = {
	item: FAQItemData;
};

function FAQItemComponent({ item }: FAQItemComponentProps) {
	return (
		<AccordionItem value={item.question} className="group border-zinc-200 border-t last:border-b">
			<AccordionTrigger className="py-6 text-left font-medium transition-colors hover:text-emerald-800">
				{item.question}
				<CaretRightIcon aria-hidden="true" className="shrink-0 text-emerald-700/60 transition-transform duration-200" />
			</AccordionTrigger>
			<AccordionContent className="pb-6 text-zinc-600 leading-7">{item.answer}</AccordionContent>
		</AccordionItem>
	);
}
