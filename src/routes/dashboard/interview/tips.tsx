import { t } from "@lingui/core/macro";
import { LightbulbIcon } from "@phosphor-icons/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import { ErrorComponent } from "@/components/error-component";
import { authClient } from "@/integrations/auth/client";
import { orpc } from "@/integrations/orpc/client";
import { DashboardHeader } from "../-components/header";
import { polishFrenchText } from "./-components/french-text";
import {
	FavoritesSection,
	HeroSection,
	PrintStyles,
	QuickLinksSection,
	SearchAndFilters,
	TipsTabContent,
} from "./-components/tips-components";
import { searchSchema } from "./-components/tips-config";
import { getFallbackInterviewTips } from "./-components/tips-fallback";
import type { SearchParams } from "./-components/tips-types";

// biome-ignore lint/suspicious/noExplicitAny: Route path not in generated route tree
export const Route = createFileRoute("/dashboard/interview/tips" as any)({
	component: InterviewTipsPage,
	errorComponent: ErrorComponent,
	validateSearch: searchSchema,
});

function InterviewTipsPage() {
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const { data: session } = authClient.useSession();
	const { category, field } = Route.useSearch() as SearchParams;

	const [selectedCategory, setSelectedCategory] = useState<string>(category || "preparation");
	const [selectedField, setSelectedField] = useState<string | undefined>(field);
	const [expandedTips, setExpandedTips] = useState<Set<string>>(new Set());
	const [searchQuery, setSearchQuery] = useState("");

	const { data: favoritesData = [], error: favoritesError } = useQuery({
		...orpc.interview.getTipFavorites.queryOptions(),
		enabled: !!session?.user,
	});

	const favorites = useMemo(() => new Set(favoritesData), [favoritesData]);

	const addFavoriteMutation = useMutation({
		...orpc.interview.addTipFavorite.mutationOptions(),
		onMutate: async ({ tipId }) => {
			await queryClient.cancelQueries({ queryKey: orpc.interview.getTipFavorites.key() });
			const previousFavorites = queryClient.getQueryData<string[]>(orpc.interview.getTipFavorites.key());
			queryClient.setQueryData<string[]>(orpc.interview.getTipFavorites.key(), (old = []) => [...old, tipId]);
			return { previousFavorites };
		},
		onError: (_err, _variables, context) => {
			if (context?.previousFavorites) {
				queryClient.setQueryData(orpc.interview.getTipFavorites.key(), context.previousFavorites);
			}
			toast.error(t`Erreur lors de l'ajout aux favoris`);
		},
		onSuccess: () => {
			toast.success(t`Ajouté aux favoris`);
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: orpc.interview.getTipFavorites.key() });
		},
	});

	const removeFavoriteMutation = useMutation({
		...orpc.interview.removeTipFavorite.mutationOptions(),
		onMutate: async ({ tipId }) => {
			await queryClient.cancelQueries({ queryKey: orpc.interview.getTipFavorites.key() });
			const previousFavorites = queryClient.getQueryData<string[]>(orpc.interview.getTipFavorites.key());
			queryClient.setQueryData<string[]>(orpc.interview.getTipFavorites.key(), (old = []) =>
				old.filter((id) => id !== tipId),
			);
			return { previousFavorites };
		},
		onError: (_err, _variables, context) => {
			if (context?.previousFavorites) {
				queryClient.setQueryData(orpc.interview.getTipFavorites.key(), context.previousFavorites);
			}
			toast.error(t`Erreur lors du retrait des favoris`);
		},
		onSuccess: () => {
			toast.success(t`Retiré des favoris`);
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: orpc.interview.getTipFavorites.key() });
		},
	});

	const toggleFavorite = useCallback(
		(tipId: string) => {
			if (!session?.user) {
				toast.info(t`Connectez-vous pour enregistrer vos favoris`);
				return;
			}

			if (favorites.has(tipId)) {
				removeFavoriteMutation.mutate({ tipId });
			} else {
				addFavoriteMutation.mutate({ tipId });
			}
		},
		[session?.user, favorites, addFavoriteMutation, removeFavoriteMutation],
	);

	const toggleExpand = useCallback((tipId: string) => {
		setExpandedTips((prev) => {
			const newSet = new Set(prev);
			if (newSet.has(tipId)) {
				newSet.delete(tipId);
			} else {
				newSet.add(tipId);
			}
			return newSet;
		});
	}, []);

	const { data: tips = [], isLoading } = useQuery({
		...orpc.interview.getTips.queryOptions({
			input: {
				category: selectedCategory as
					| "preparation"
					| "during"
					| "after"
					| "common_questions"
					| "body_language"
					| "field_specific"
					| undefined,
				field: selectedField as
					| "healthcare"
					| "industrial"
					| "hse"
					| "technology"
					| "management"
					| "general"
					| undefined,
				language: "fr",
			},
		}),
		enabled: !!session?.user,
	});

	const displayTips = useMemo(() => {
		const fallbackTips = getFallbackInterviewTips(selectedCategory, selectedField);
		if (tips.length === 0) return fallbackTips;

		const tipIds = new Set(tips.map((tip) => tip.id));
		const missingFallbackTips = fallbackTips.filter((tip) => !tipIds.has(tip.id));

		return [...tips, ...missingFallbackTips].map((tip) => ({
			...tip,
			title: polishFrenchText(tip.title),
			content: polishFrenchText(tip.content),
		}));
	}, [tips, selectedCategory, selectedField]);

	const filteredTips = useMemo(() => {
		if (!searchQuery.trim()) return displayTips;
		const query = searchQuery.toLowerCase();
		return displayTips.filter(
			(tip) => tip.title.toLowerCase().includes(query) || tip.content.toLowerCase().includes(query),
		);
	}, [displayTips, searchQuery]);

	const favoriteTips = useMemo(() => {
		return displayTips.filter((tip) => favorites.has(tip.id));
	}, [displayTips, favorites]);

	const handleCategoryChange = (newCategory: string) => {
		setSelectedCategory(newCategory);
		navigate({
			to: "/dashboard/interview/tips" as string,
			search: { category: newCategory, field: selectedField },
			replace: true,
		} as unknown as Parameters<typeof navigate>[0]);
	};

	const handleFieldChange = (newField: string | undefined) => {
		setSelectedField(newField === selectedField ? undefined : newField);
		navigate({
			to: "/dashboard/interview/tips" as string,
			search: {
				category: selectedCategory,
				field: newField === selectedField ? undefined : newField,
			},
			replace: true,
		} as unknown as Parameters<typeof navigate>[0]);
	};

	const handlePrint = () => {
		window.print();
	};

	return (
		<>
			<DashboardHeader icon={LightbulbIcon} title={t`Conseils pour réussir l'entretien`} />

			<HeroSection favoriteTips={favoriteTips} handlePrint={handlePrint} />

			<SearchAndFilters
				searchQuery={searchQuery}
				setSearchQuery={setSearchQuery}
				selectedField={selectedField}
				handleFieldChange={handleFieldChange}
			/>

			<TipsTabContent
				selectedCategory={selectedCategory}
				handleCategoryChange={handleCategoryChange}
				isLoading={isLoading}
				favoritesError={favoritesError}
				filteredTips={filteredTips}
				expandedTips={expandedTips}
				favorites={favorites}
				toggleFavorite={toggleFavorite}
				toggleExpand={toggleExpand}
				addFavoriteMutation={addFavoriteMutation}
				removeFavoriteMutation={removeFavoriteMutation}
			/>

			<FavoritesSection
				favoriteTips={favoriteTips}
				toggleFavorite={toggleFavorite}
				addFavoriteMutation={addFavoriteMutation}
				removeFavoriteMutation={removeFavoriteMutation}
			/>

			<QuickLinksSection />

			<PrintStyles />
		</>
	);
}
