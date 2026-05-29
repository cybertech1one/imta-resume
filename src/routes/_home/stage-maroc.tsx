import { createFileRoute } from "@tanstack/react-router";
import { getTrafficLandingPage, TrafficLandingPage, trafficLandingHead } from "./-sections/traffic-landing";

const page = getTrafficLandingPage("/stage-maroc");

export const Route = createFileRoute("/_home/stage-maroc")({
	component: () => <TrafficLandingPage page={page} />,
	head: () => trafficLandingHead(page),
});
