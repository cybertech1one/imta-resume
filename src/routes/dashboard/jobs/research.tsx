import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { BuildingsIcon, SpinnerIcon, XIcon } from "@phosphor-icons/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { ErrorComponent } from "@/components/error-component";
import { Card, CardContent } from "@/components/ui/card";
import { authClient } from "@/integrations/auth/client";
import type { CompanyIndustry } from "@/integrations/drizzle/schema";
import { orpc } from "@/integrations/orpc/client";
import { DashboardHeader } from "../-components/header";
import {
	CompaniesGrid,
	CompanyDetailView,
	CompareDialog,
	CtaSection,
	FavoritesSection,
	HeroSection,
	SearchAndFilters,
} from "./-components/research-components";
import { DEFAULT_COMPANIES_DATA } from "./-components/research-data";
import type { Company } from "./-components/research-types";

// biome-ignore lint/suspicious/noExplicitAny: Route path not in generated route tree
export const Route = createFileRoute("/dashboard/jobs/research" as any)({
	component: CompanyResearchPage,
	errorComponent: ErrorComponent,
});

function CompanyResearchPage() {
	const { data: session } = authClient.useSession();
	const queryClient = useQueryClient();
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedIndustry, setSelectedIndustry] = useState<CompanyIndustry | "all">("all");
	const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
	const [activeTab, setActiveTab] = useState("overview");
	const [compareMode, setCompareMode] = useState(false);
	const [compareCompanies, setCompareCompanies] = useState<string[]>([]);
	const [showCompareDialog, setShowCompareDialog] = useState(false);
	const [expandedQuestions, setExpandedQuestions] = useState<string[]>([]);
	const [hasSeeded, setHasSeeded] = useState(false);

	// Fetch companies from database
	const {
		data: companies = [],
		isLoading,
		isError,
	} = useQuery({
		...orpc.companyResearch.list.queryOptions({
			input: {
				industry: selectedIndustry !== "all" ? selectedIndustry : undefined,
				search: searchQuery || undefined,
				sort: "createdAt",
				sortOrder: "desc",
			},
		}),
		enabled: !!session?.user,
	});

	// Fetch favorite company IDs
	const { data: favoriteIds = [] } = useQuery({
		...orpc.companyResearch.favorites.listIds.queryOptions(),
		enabled: !!session?.user,
	});

	// Fetch statistics
	const { data: statistics } = useQuery({
		...orpc.companyResearch.getStatistics.queryOptions(),
		enabled: !!session?.user,
	});

	// Create company mutation (for seeding)
	const createMutation = useMutation({
		...orpc.companyResearch.create.mutationOptions(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["companyResearch"] });
		},
	});

	// Toggle favorite mutation
	const toggleFavoriteMutation = useMutation({
		...orpc.companyResearch.favorites.toggle.mutationOptions(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["companyResearch", "favorites"] });
		},
		onError: (error) => {
			toast.error(error.message || t`Erreur lors de la mise à jour des favoris`);
		},
	});

	// Seed default data only when the user has zero companies in the DB.
	// We gate on the server-confirmed unfiltered count (statistics.totalCompanies)
	// rather than the filtered `companies` list — otherwise filtering to an empty
	// result (or a remount) could re-insert duplicate rows.
	useEffect(() => {
		if (statistics && statistics.totalCompanies === 0 && !hasSeeded && !createMutation.isPending) {
			setHasSeeded(true);
			// Seed default companies
			for (const companyData of DEFAULT_COMPANIES_DATA) {
				createMutation.mutate(companyData);
			}
		}
	}, [statistics, hasSeeded, createMutation]);

	// Filter companies based on search
	const filteredCompanies = useMemo(() => {
		return companies.filter((company) => {
			if (
				searchQuery &&
				!company.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
				!company.description.toLowerCase().includes(searchQuery.toLowerCase())
			) {
				return false;
			}
			if (selectedIndustry !== "all" && company.industry !== selectedIndustry) {
				return false;
			}
			return true;
		});
	}, [companies, searchQuery, selectedIndustry]);

	// Favorite companies
	const favoriteCompanies = useMemo(() => {
		return companies.filter((c) => favoriteIds.includes(c.id));
	}, [companies, favoriteIds]);

	// Compare companies data
	const companiesForComparison = useMemo(() => {
		return companies.filter((c) => compareCompanies.includes(c.id));
	}, [companies, compareCompanies]);

	// Handlers
	const toggleFavorite = useCallback(
		(companyId: string) => {
			toggleFavoriteMutation.mutate({ companyId });
		},
		[toggleFavoriteMutation],
	);

	const toggleCompare = useCallback((companyId: string) => {
		setCompareCompanies((prev) => {
			if (prev.includes(companyId)) {
				return prev.filter((id) => id !== companyId);
			}
			if (prev.length >= 3) {
				toast.error(t`Maximum 3 entreprises à comparer`);
				return prev;
			}
			return [...prev, companyId];
		});
	}, []);

	const toggleQuestion = useCallback((questionId: string) => {
		setExpandedQuestions((prev) =>
			prev.includes(questionId) ? prev.filter((id) => id !== questionId) : [...prev, questionId],
		);
	}, []);

	// Loading state
	if (isLoading) {
		return (
			<>
				<DashboardHeader icon={BuildingsIcon} title={t`Recherche d'entreprise`} />
				<div className="flex h-64 items-center justify-center">
					<SpinnerIcon className="size-8 animate-spin text-primary" />
				</div>
			</>
		);
	}

	// Error state
	if (isError) {
		return (
			<>
				<DashboardHeader icon={BuildingsIcon} title={t`Recherche d'entreprise`} />
				<Card className="border-destructive">
					<CardContent className="flex flex-col items-center justify-center py-16">
						<XIcon className="mb-4 size-16 text-destructive" weight="duotone" />
						<h3 className="mb-2 font-semibold text-lg">
							<Trans>Erreur de chargement</Trans>
						</h3>
						<p className="text-muted-foreground">
							<Trans>Impossible de charger les entreprises</Trans>
						</p>
					</CardContent>
				</Card>
			</>
		);
	}

	// Company detail view
	if (selectedCompany) {
		return (
			<>
				<DashboardHeader icon={BuildingsIcon} title={t`Recherche d'entreprise`} />
				<CompanyDetailView
					company={selectedCompany}
					favoriteIds={favoriteIds}
					activeTab={activeTab}
					setActiveTab={setActiveTab}
					expandedQuestions={expandedQuestions}
					toggleQuestion={toggleQuestion}
					toggleFavorite={toggleFavorite}
					toggleFavoritePending={toggleFavoriteMutation.isPending}
					onBack={() => {
						setSelectedCompany(null);
						setActiveTab("overview");
					}}
				/>
			</>
		);
	}

	// Main listing view
	return (
		<>
			<DashboardHeader icon={BuildingsIcon} title={t`Recherche d'entreprise`} />

			<HeroSection statistics={statistics} companiesCount={companies.length} favoriteIdsCount={favoriteIds.length} />

			<SearchAndFilters
				searchQuery={searchQuery}
				setSearchQuery={setSearchQuery}
				selectedIndustry={selectedIndustry}
				setSelectedIndustry={setSelectedIndustry}
				compareMode={compareMode}
				setCompareMode={setCompareMode}
				compareCompanies={compareCompanies}
				setCompareCompanies={setCompareCompanies}
				setShowCompareDialog={setShowCompareDialog}
				filteredCount={filteredCompanies.length}
			/>

			{favoriteCompanies.length > 0 && !searchQuery && selectedIndustry === "all" && (
				<FavoritesSection favoriteCompanies={favoriteCompanies} onSelectCompany={setSelectedCompany} />
			)}

			<CompaniesGrid
				filteredCompanies={filteredCompanies}
				favoriteIds={favoriteIds}
				compareMode={compareMode}
				compareCompanies={compareCompanies}
				toggleFavorite={toggleFavorite}
				toggleFavoritePending={toggleFavoriteMutation.isPending}
				toggleCompare={toggleCompare}
				onSelectCompany={setSelectedCompany}
				onResetSearch={() => {
					setSearchQuery("");
					setSelectedIndustry("all");
				}}
			/>

			<CtaSection />

			<CompareDialog
				open={showCompareDialog}
				onOpenChange={setShowCompareDialog}
				companiesForComparison={companiesForComparison}
			/>
		</>
	);
}
