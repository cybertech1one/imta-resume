import { createFileRoute, redirect } from "@tanstack/react-router";

// biome-ignore lint/suspicious/noExplicitAny: Route path not in generated route tree
export const Route = createFileRoute("/dashboard/tools/" as any)({
	beforeLoad: () => {
		throw redirect({ to: "/dashboard/tools/salary-calculator", replace: true });
	},
});
