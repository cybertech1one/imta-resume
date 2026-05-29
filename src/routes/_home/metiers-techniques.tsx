import { createFileRoute } from "@tanstack/react-router";
import { getTrafficLandingPage, TrafficLandingPage, trafficLandingHead } from "./-sections/traffic-landing";

const page = getTrafficLandingPage("/metiers-techniques");

export const Route = createFileRoute("/_home/metiers-techniques")({
	component: () => <TrafficLandingPage page={page} />,
	head: () => trafficLandingHead(page),
});
