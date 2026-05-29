import { createFileRoute } from "@tanstack/react-router";
import { getTrafficLandingPage, TrafficLandingPage, trafficLandingHead } from "./-sections/traffic-landing";

const page = getTrafficLandingPage("/imta-etudiants");

export const Route = createFileRoute("/_home/imta-etudiants")({
	component: () => <TrafficLandingPage page={page} />,
	head: () => trafficLandingHead(page),
});
