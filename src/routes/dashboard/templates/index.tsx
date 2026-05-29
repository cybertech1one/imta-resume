import { createFileRoute, redirect } from "@tanstack/react-router";

// biome-ignore lint/suspicious/noExplicitAny: Route path not in generated route tree
export const Route = createFileRoute("/dashboard/templates/" as any)({
	beforeLoad: () => {
		throw redirect({ to: "/dashboard/templates/gallery", replace: true });
	},
});
