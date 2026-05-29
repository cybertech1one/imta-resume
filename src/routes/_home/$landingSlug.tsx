import { createFileRoute, notFound } from "@tanstack/react-router";
import { findPartnerLandingPage, PartnerLandingPage, partnerLandingHead } from "./-sections/partner-landing";
import { findTrafficLandingPage, TrafficLandingPage, trafficLandingHead } from "./-sections/traffic-landing";

export const Route = createFileRoute("/_home/$landingSlug")({
	loader: ({ params }) => {
		const path = `/${params.landingSlug}`;
		const page = findPartnerLandingPage(path) ?? findTrafficLandingPage(path);
		if (!page) throw notFound();

		return { path };
	},
	head: ({ loaderData }) => {
		const partnerPage = loaderData ? findPartnerLandingPage(loaderData.path) : undefined;
		if (partnerPage) return partnerLandingHead(partnerPage);

		const page = loaderData ? findTrafficLandingPage(loaderData.path) : undefined;

		return page ? trafficLandingHead(page) : {};
	},
	component: RouteComponent,
});

function RouteComponent() {
	const { path } = Route.useLoaderData();
	const partnerPage = findPartnerLandingPage(path);
	if (partnerPage) return <PartnerLandingPage page={partnerPage} />;

	const page = findTrafficLandingPage(path);
	if (!page) throw notFound();

	return <TrafficLandingPage page={page} />;
}
