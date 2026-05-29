import { createFileRoute, redirect } from "@tanstack/react-router";

// biome-ignore lint/suspicious/noExplicitAny: Route path not in generated route tree
export const Route = createFileRoute("/auth/sign-up" as any)({
	beforeLoad: () => {
		throw redirect({ to: "/auth/register", replace: true });
	},
});
