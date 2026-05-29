import { createFileRoute } from "@tanstack/react-router";
import { getTrafficLandingPage, TrafficLandingPage, trafficLandingHead } from "./-sections/traffic-landing";

const page = getTrafficLandingPage("/preparation-entretien");

export const Route = createFileRoute("/_home/preparation-entretien")({
	component: () => <TrafficLandingPage page={page} />,
	head: () => trafficLandingHead(page),
});
