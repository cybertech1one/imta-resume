import { createFileRoute } from "@tanstack/react-router";
import { getTrafficLandingPage, TrafficLandingPage, trafficLandingHead } from "./-sections/traffic-landing";

const page = getTrafficLandingPage("/ecoles-formateurs");

export const Route = createFileRoute("/_home/ecoles-formateurs")({
	component: () => <TrafficLandingPage page={page} />,
	head: () => trafficLandingHead(page),
});
