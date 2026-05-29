import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_home/wiki/")({
	component: () => null,
	beforeLoad: () => {
		// biome-ignore lint/suspicious/noExplicitAny: Route path not in generated route tree
		throw redirect({ to: "/dashboard/wiki" as any, replace: true });
	},
});
