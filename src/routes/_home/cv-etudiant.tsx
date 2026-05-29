import { createFileRoute } from "@tanstack/react-router";
import { getTrafficLandingPage, TrafficLandingPage, trafficLandingHead } from "./-sections/traffic-landing";

const page = getTrafficLandingPage("/cv-etudiant");

export const Route = createFileRoute("/_home/cv-etudiant")({
	component: () => <TrafficLandingPage page={page} />,
	head: () => trafficLandingHead(page),
});
