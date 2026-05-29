import { StandardRPCJsonSerializer } from "@orpc/client/standard";
import { MutationCache, QueryClient } from "@tanstack/react-query";

const serializer = new StandardRPCJsonSerializer();

export const getQueryClient = () => {
	const queryClient = new QueryClient({
		defaultOptions: {
			queries: {
				gcTime: 10 * 60 * 1000,
				staleTime: 5 * 60 * 1000,
				// Reduce retries to avoid long waits on slow 3G connections
				retry: 1,
				retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 8000),
				// Don't refetch aggressively - users on mobile lose data/battery
				refetchOnWindowFocus: false,
				queryKeyHashFn(queryKey) {
					const [json, meta] = serializer.serialize(queryKey);
					return JSON.stringify({ json, meta });
				},
			},
			dehydrate: {
				serializeData(data) {
					const [json, meta] = serializer.serialize(data);
					return { json, meta };
				},
			},
			hydrate: {
				deserializeData(data) {
					return serializer.deserialize(data.json, data.meta);
				},
			},
		},
		mutationCache: new MutationCache({
			onSettled: (_1, _2, _3, _4, _5, context) => {
				if (context?.meta?.noInvalidate) return;
				const tags = (context?.meta as Record<string, unknown>)?.invalidateTags as string[] | undefined;
				if (tags?.length) {
					for (const tag of tags) {
						queryClient.invalidateQueries({ queryKey: [tag] });
					}
				}
			},
		}),
	});

	return queryClient;
};
