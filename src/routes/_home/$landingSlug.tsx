import { createFileRoute, notFound } from "@tanstack/react-router";
import { findTrafficLandingPage, TrafficLandingPage, trafficLandingHead } from "./-sections/traffic-landing";

export const Route = createFileRoute("/_home/$landingSlug")({
	loader: ({ params }) => {
		const path = `/${params.landingSlug}`;
		const page = findTrafficLandingPage(path);
		if (!page) throw notFound();

		return { path };
	},
	head: ({ loaderData }) => {
		const page = loaderData ? findTrafficLandingPage(loaderData.path) : undefined;

		return page ? trafficLandingHead(page) : {};
	},
	component: RouteComponent,
});

function RouteComponent() {
	const { path } = Route.useLoaderData();
	const page = findTrafficLandingPage(path);
	if (!page) throw notFound();

	return <TrafficLandingPage page={page} />;
}
