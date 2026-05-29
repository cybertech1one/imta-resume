import { createFileRoute } from "@tanstack/react-router";
import {
	defaultSEO,
	generateCanonicalLink,
	generateFAQSchema,
	generateHowToSchema,
	generateMetaTags,
} from "@/utils/seo";
import { StudentLanding } from "./-sections/student-landing";

// FAQ data for structured data - plain text versions for SEO (French for default locale)
const faqDataForSchema = [
	{
		question: "IMTA Resume est-il vraiment gratuit ?",
		answer:
			"Oui ! IMTA Resume est entièrement gratuit, sans coûts cachés, abonnements premium ni frais d'inscription. Il est open-source et restera toujours gratuit.",
	},
	{
		question: "Comment mes données sont-elles protégées ?",
		answer:
			"Vos données sont stockées de manière sécurisée et ne sont jamais partagées avec des tiers. Vous avez un contrôle total sur vos informations personnelles.",
	},
	{
		question: "Puis-je exporter mon CV en PDF ?",
		answer:
			"Absolument ! Vous pouvez exporter votre CV en PDF en un seul clic. Le PDF exporte conserve parfaitement toute votre mise en forme et votre style.",
	},
	{
		question: "IMTA Resume est-il disponible en plusieurs langues ?",
		answer:
			"Oui, IMTA Resume est disponible en plusieurs langues, notamment le français, l'anglais et l'arabe. Vous pouvez choisir votre langue préférée dans les paramètres.",
	},
	{
		question: "Qu'est-ce qui différencie IMTA Resume des autres créateurs de CV ?",
		answer:
			"IMTA Resume est open-source, respectueux de la vie privée et entièrement gratuit. Contrairement aux autres créateurs de CV, il n'affiche pas de publicités, ne suit pas vos données et ne limite pas les fonctionnalités derrière un paywall.",
	},
	{
		question: "Puis-je personnaliser les modèles ?",
		answer:
			"Oui ! Chaque modèle est entièrement personnalisable. Vous pouvez modifier les couleurs, les polices, l'espacement et même écrire du CSS personnalisé pour un contrôle total de l'apparence de votre CV.",
	},
	{
		question: "Comment partager mon CV ?",
		answer:
			"Vous pouvez partager votre CV via une URL publique unique, le protéger avec un mot de passe ou le télécharger en PDF pour le partager directement. Le choix vous appartient !",
	},
];

// How-to steps for structured data
const howToSteps = [
	{
		name: "Créer un compte",
		text: "Inscrivez-vous gratuitement avec votre email ou via Google/GitHub.",
	},
	{
		name: "Commencer un nouveau CV",
		text: "Cliquez sur 'Créer un CV' dans votre tableau de bord et donnez-lui un nom.",
	},
	{
		name: "Ajouter vos informations",
		text: "Remplissez vos coordonnées, formation, expérience professionnelle et compétences avec l'éditeur intuitif.",
	},
	{
		name: "Choisir un modèle",
		text: "Sélectionnez parmi plus de 35 modèles professionnels optimisés pour les ATS.",
	},
	{
		name: "Exporter et partager",
		text: "Téléchargez votre CV en PDF ou partagez-le via une URL publique unique.",
	},
];

export const Route = createFileRoute("/_home/")({
	component: RouteComponent,
	head: () => {
		const appUrl = (typeof process !== "undefined" ? process.env.APP_URL : undefined) ?? "https://rxresu.me/";

		return {
			links: [
				generateCanonicalLink(appUrl),
				{
					rel: "preload",
					href: "/home/home-hero-students-career.webp",
					as: "image",
					fetchPriority: "high",
				},
			],
			meta: generateMetaTags({
				title: defaultSEO.title,
				description: defaultSEO.description,
				image: `${appUrl}opengraph/banner.jpg`,
				url: appUrl,
				type: "website",
				siteName: defaultSEO.appName,
			}),
			scripts: [
				// JSON-LD FAQPage schema for rich snippets
				{
					type: "application/ld+json",
					children: JSON.stringify(generateFAQSchema(faqDataForSchema)),
				},
				// JSON-LD HowTo schema for process steps
				{
					type: "application/ld+json",
					children: JSON.stringify(
						generateHowToSchema({
							name: "Comment créer un CV professionnel avec IMTA Resume",
							description: "Guide étape par étape pour créer un CV professionnel et optimisé ATS avec IMTA Resume.",
							steps: howToSteps,
						}),
					),
				},
			],
		};
	},
});

function RouteComponent() {
	return (
		<main id="main-content" className="relative bg-background">
			<StudentLanding />
		</main>
	);
}
