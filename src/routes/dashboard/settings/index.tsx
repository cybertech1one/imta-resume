import { createFileRoute, redirect } from "@tanstack/react-router";

// biome-ignore lint/suspicious/noExplicitAny: Route path not in generated route tree
export const Route = createFileRoute("/dashboard/settings/" as any)({
	beforeLoad: () => {
		throw redirect({ to: "/dashboard/settings/profile", replace: true });
	},
});
