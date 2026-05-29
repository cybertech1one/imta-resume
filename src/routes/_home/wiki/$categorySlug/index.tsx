import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_home/wiki/$categorySlug/")({
	component: () => null,
	beforeLoad: ({ params }) => {
		// biome-ignore lint/suspicious/noExplicitAny: Route path not in generated route tree
		throw redirect({ to: `/dashboard/wiki/${params.categorySlug}` as any, replace: true });
	},
});
