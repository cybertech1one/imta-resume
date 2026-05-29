import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_home/wiki/$categorySlug/$articleSlug")({
	component: () => null,
	beforeLoad: ({ params }) => {
		throw redirect({
			// biome-ignore lint/suspicious/noExplicitAny: Route path not in generated route tree
			to: `/dashboard/wiki/${params.categorySlug}/${params.articleSlug}` as any,
			replace: true,
		});
	},
});
