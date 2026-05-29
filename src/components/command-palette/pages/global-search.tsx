import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import {
	AddressBookIcon,
	BriefcaseIcon,
	ClockIcon,
	MagnifyingGlassIcon,
	NavigationArrowIcon,
	ReadCvLogoIcon,
	TargetIcon,
	XIcon,
} from "@phosphor-icons/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useRouteContext } from "@tanstack/react-router";
import { CommandLoading } from "cmdk";
import { AnimatePresence, motion } from "motion/react";
import { useDeferredValue } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { CommandGroup, CommandItem, CommandSeparator, CommandShortcut } from "@/components/ui/command";
import { Kbd } from "@/components/ui/kbd";
import type { SearchResultType } from "@/integrations/drizzle/schema";
import { orpc } from "@/integrations/orpc/client";
import { useCommandPaletteStore } from "../store";

// Get icon component for result type
function getIconForType(type: SearchResultType) {
	switch (type) {
		case "resume":
			return ReadCvLogoIcon;
		case "job_application":
			return BriefcaseIcon;
		case "contact":
			return AddressBookIcon;
		case "skill":
			return TargetIcon;
		case "route":
			return NavigationArrowIcon;
		default:
			return MagnifyingGlassIcon;
	}
}

// Get label for result type
function getLabelForType(type: SearchResultType): string {
	switch (type) {
		case "resume":
			return t`Resume`;
		case "job_application":
			return t`Job Application`;
		case "contact":
			return t`Contact`;
		case "skill":
			return t`Skill`;
		case "route":
			return t`Page`;
		default:
			return t`Result`;
	}
}

export function GlobalSearchResults() {
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const { session } = useRouteContext({ strict: false });
	const search = useCommandPaletteStore((state) => state.search);
	const reset = useCommandPaletteStore((state) => state.reset);
	const pages = useCommandPaletteStore((state) => state.pages);

	// Debounce the search query
	const deferredSearch = useDeferredValue(search);

	// Only show global search on the main page (no sub-pages)
	const isMainPage = pages.length === 0;

	// Search query
	const { data: results, isLoading } = useQuery({
		...orpc.search.global.queryOptions({ input: { query: deferredSearch, limit: 15 } }),
		enabled: !!session && isMainPage && deferredSearch.trim().length >= 2,
		staleTime: 30000, // Cache results for 30 seconds
	});

	// Save recent search mutation
	const saveRecentMutation = useMutation({
		...orpc.search.saveRecent.mutationOptions(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: orpc.search.getRecent.key() });
		},
	});

	// Handle result selection
	const handleSelect = (result: NonNullable<typeof results>[number]) => {
		if (result.path) {
			// Save to recent searches
			saveRecentMutation.mutate({
				query: search,
				resultType: result.type,
				resultId: result.id,
				resultTitle: result.title,
				resultPath: result.path,
			});

			navigate({ to: result.path });
			reset();
		}
	};

	if (!session || !isMainPage) return null;

	// Show nothing if search is too short
	if (deferredSearch.trim().length < 2) return null;

	return (
		<CommandGroup heading={<Trans>Search Results</Trans>}>
			{isLoading ? (
				<CommandLoading>
					<div className="flex items-center gap-2 px-2 py-3 text-muted-foreground text-sm">
						<MagnifyingGlassIcon className="size-4 animate-pulse" />
						<Trans>Searching...</Trans>
					</div>
				</CommandLoading>
			) : results && results.length > 0 ? (
				<AnimatePresence mode="popLayout">
					{results.map((result, index) => {
						const Icon = getIconForType(result.type);
						return (
							<motion.div
								key={result.id}
								initial={{ opacity: 0, y: -10 }}
								animate={{ opacity: 1, y: 0 }}
								exit={{ opacity: 0, y: 10 }}
								transition={{ delay: index * 0.03 }}
							>
								<CommandItem
									value={`search-${result.id}`}
									keywords={[result.title, result.subtitle || "", getLabelForType(result.type)]}
									onSelect={() => handleSelect(result)}
								>
									<Icon className="text-muted-foreground" />
									<div className="flex flex-1 flex-col">
										<span>{result.title}</span>
										{result.subtitle && <span className="text-muted-foreground text-xs">{result.subtitle}</span>}
									</div>
									<span className="text-muted-foreground text-xs">{getLabelForType(result.type)}</span>
									<CommandShortcut className="opacity-0 transition-opacity group-data-[selected=true]/command-item:opacity-100">
										<Kbd>Enter</Kbd>
									</CommandShortcut>
								</CommandItem>
							</motion.div>
						);
					})}
				</AnimatePresence>
			) : (
				<div className="px-2 py-6 text-center text-muted-foreground text-sm">
					<Trans>No results found for "{deferredSearch}"</Trans>
				</div>
			)}
		</CommandGroup>
	);
}

export function RecentSearchesGroup() {
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const { session } = useRouteContext({ strict: false });
	const search = useCommandPaletteStore((state) => state.search);
	const reset = useCommandPaletteStore((state) => state.reset);
	const pages = useCommandPaletteStore((state) => state.pages);

	// Only show recent searches on the main page when search is empty
	const isMainPage = pages.length === 0;
	const shouldShow = isMainPage && search.trim().length === 0;

	// Get recent searches
	const { data: recentSearches } = useQuery({
		...orpc.search.getRecent.queryOptions({ input: { limit: 5 } }),
		enabled: !!session && shouldShow,
	});

	// Clear recent searches mutation
	const clearRecentMutation = useMutation({
		...orpc.search.clearRecent.mutationOptions(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: orpc.search.getRecent.key() });
			toast.success(t`Recent searches cleared`);
		},
	});

	// Delete single recent search mutation
	const deleteRecentMutation = useMutation({
		...orpc.search.deleteRecent.mutationOptions(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: orpc.search.getRecent.key() });
		},
	});

	// Handle result selection
	const handleSelect = (result: NonNullable<typeof recentSearches>[number]) => {
		if (result.path) {
			navigate({ to: result.path });
			reset();
		}
	};

	if (!session || !shouldShow || !recentSearches || recentSearches.length === 0) return null;

	return (
		<>
			<CommandGroup
				heading={
					<div className="flex items-center justify-between">
						<span className="flex items-center gap-1.5">
							<ClockIcon className="size-3.5" />
							<Trans>Recent</Trans>
						</span>
						<Button
							size="sm"
							variant="ghost"
							className="h-5 px-1.5 text-xs"
							onClick={(e) => {
								e.stopPropagation();
								clearRecentMutation.mutate({});
							}}
						>
							<Trans>Clear</Trans>
						</Button>
					</div>
				}
			>
				<AnimatePresence mode="popLayout">
					{recentSearches.map((result, index) => {
						const Icon = getIconForType(result.type);
						return (
							<motion.div
								key={result.id}
								initial={{ opacity: 0, x: -10 }}
								animate={{ opacity: 1, x: 0 }}
								exit={{ opacity: 0, x: 10 }}
								transition={{ delay: index * 0.02 }}
							>
								<CommandItem
									value={`recent-${result.id}`}
									keywords={[result.title]}
									onSelect={() => handleSelect(result)}
								>
									<Icon className="text-muted-foreground" />
									<span className="flex-1">{result.title}</span>
									<button
										type="button"
										className="opacity-0 transition-opacity group-data-[selected=true]/command-item:opacity-100"
										onClick={(e) => {
											e.stopPropagation();
											deleteRecentMutation.mutate({ id: result.id });
										}}
									>
										<XIcon className="size-3.5 text-muted-foreground hover:text-foreground" />
									</button>
								</CommandItem>
							</motion.div>
						);
					})}
				</AnimatePresence>
			</CommandGroup>
			<CommandSeparator />
		</>
	);
}
