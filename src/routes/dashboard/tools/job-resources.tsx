import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import {
	ArrowSquareOutIcon,
	BriefcaseIcon,
	EnvelopeIcon,
	GlobeIcon,
	MagnifyingGlassIcon,
	MapPinIcon,
	PhoneIcon,
	StarIcon,
	XIcon,
} from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useState } from "react";
import { ErrorComponent } from "@/components/error-component";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { orpc } from "@/integrations/orpc/client";
import { formatFieldName } from "../-components/display-utils";
import { DashboardHeader } from "../-components/header";

// biome-ignore lint/suspicious/noExplicitAny: Route path not in generated route tree
export const Route = createFileRoute("/dashboard/tools/job-resources" as any)({
	component: JobResourcesPage,
	errorComponent: ErrorComponent,
});

// ---- Helpers ----

function renderRating(rating: string | null): React.ReactNode {
	if (!rating) return null;
	const numRating = Number.parseFloat(rating);
	if (Number.isNaN(numRating)) return null;

	const fullStars = Math.floor(numRating);
	const hasHalf = numRating - fullStars >= 0.5;

	return (
		<span className="flex items-center gap-0.5">
			{Array.from({ length: fullStars }).map((_, i) => (
				<StarIcon key={`full-${i}`} className="size-3.5 text-amber-500" weight="fill" />
			))}
			{hasHalf && <StarIcon className="size-3.5 text-amber-500" weight="duotone" />}
			<span className="ml-1 text-muted-foreground text-xs">{numRating.toFixed(1)}</span>
		</span>
	);
}

const CATEGORY_LABELS: Record<string, string> = {
	job_board: "Offres d'emploi",
	recruitment_agency: "Agences de recrutement",
	career_center: "Centres de carrière",
	training: "Formation & Certification",
	networking: "Réseautage",
	government: "Ressources gouvernementales",
	startup: "Startups & Entrepreneuriat",
	freelance: "Plateformes freelance",
	mentorship: "Mentorat",
	scholarship: "Bourses & Subventions",
};

// ---- Main Page ----

function JobResourcesPage() {
	const [search, setSearch] = useState("");
	const [locationFilter, setLocationFilter] = useState<string>("");
	const [fieldFilter, setFieldFilter] = useState<string>("");
	const [freeFilter, setFreeFilter] = useState<string>("");
	const [activeCategory, setActiveCategory] = useState<string>("all");
	const [page, setPage] = useState(1);

	const { data: categories, isLoading: catsLoading } = useQuery({
		...orpc.jobResources.getCategories.queryOptions(),
		staleTime: 60 * 60 * 1000,
	});
	const { data: locations } = useQuery({
		...orpc.jobResources.getLocations.queryOptions(),
		staleTime: 60 * 60 * 1000,
	});
	const { data: fields } = useQuery({
		...orpc.jobResources.getFields.queryOptions(),
		staleTime: 60 * 60 * 1000,
	});

	const { data, isLoading } = useQuery(
		orpc.jobResources.list.queryOptions({
			input: {
				category: activeCategory !== "all" ? activeCategory : undefined,
				location: locationFilter || undefined,
				field: fieldFilter || undefined,
				isFree: freeFilter === "free" ? true : freeFilter === "paid" ? false : undefined,
				search: search || undefined,
				page,
				pageSize: 20,
			},
		}),
	);

	const hasFilters = search || locationFilter || fieldFilter || freeFilter;

	const clearFilters = useCallback(() => {
		setSearch("");
		setLocationFilter("");
		setFieldFilter("");
		setFreeFilter("");
		setPage(1);
	}, []);

	return (
		<div className="min-h-full p-4 md:p-6">
			<DashboardHeader title={t`Job Resources`} icon={BriefcaseIcon} />

			<p className="mb-6 text-muted-foreground">
				<Trans>
					Discover job boards, recruitment agencies, career centers, and other resources to help you find your next
					opportunity.
				</Trans>
			</p>

			{/* Filters */}
			<Card className="mb-6">
				<CardContent className="pt-6">
					<div className="flex flex-col gap-4 md:flex-row md:items-end">
						<div className="flex-1">
							<div className="relative">
								<MagnifyingGlassIcon className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
								<Input
									placeholder={t`Search resources...`}
									value={search}
									onChange={(e) => {
										setSearch(e.target.value);
										setPage(1);
									}}
									className="pl-9"
								/>
							</div>
						</div>

						<Select
							value={locationFilter}
							onValueChange={(v) => {
								setLocationFilter(v === "all" ? "" : v);
								setPage(1);
							}}
						>
							<SelectTrigger className="w-full md:w-[180px]">
								<SelectValue placeholder={t`All Locations`} />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">
									<Trans>All Locations</Trans>
								</SelectItem>
								{locations?.map((loc) => (
									<SelectItem key={loc} value={loc}>
										{loc}
									</SelectItem>
								))}
							</SelectContent>
						</Select>

						<Select
							value={fieldFilter}
							onValueChange={(v) => {
								setFieldFilter(v === "all" ? "" : v);
								setPage(1);
							}}
						>
							<SelectTrigger className="w-full md:w-[180px]">
								<SelectValue placeholder={t`All Fields`} />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">
									<Trans>All Fields</Trans>
								</SelectItem>
								{fields?.map((f) => (
									<SelectItem key={f} value={f}>
										{formatFieldName(f)}
									</SelectItem>
								))}
							</SelectContent>
						</Select>

						<Select
							value={freeFilter}
							onValueChange={(v) => {
								setFreeFilter(v === "all" ? "" : v);
								setPage(1);
							}}
						>
							<SelectTrigger className="w-full md:w-[140px]">
								<SelectValue placeholder={t`All Pricing`} />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">
									<Trans>All Pricing</Trans>
								</SelectItem>
								<SelectItem value="free">
									<Trans>Free</Trans>
								</SelectItem>
								<SelectItem value="paid">
									<Trans>Paid</Trans>
								</SelectItem>
							</SelectContent>
						</Select>

						{hasFilters && (
							<Button variant="ghost" size="sm" onClick={clearFilters}>
								<XIcon className="mr-1 size-4" />
								<Trans>Clear</Trans>
							</Button>
						)}
					</div>
				</CardContent>
			</Card>

			{/* Category Tabs */}
			{catsLoading ? (
				<div className="mb-6 flex gap-2 overflow-x-auto">
					{Array.from({ length: 5 }).map((_, i) => (
						<Skeleton key={i} className="h-9 w-24 rounded-full" />
					))}
				</div>
			) : categories && categories.length > 0 ? (
				<Tabs
					value={activeCategory}
					onValueChange={(v) => {
						setActiveCategory(v);
						setPage(1);
					}}
					className="mb-6"
				>
					<TabsList className="flex-wrap">
						<TabsTrigger value="all">
							<Trans>All</Trans>
						</TabsTrigger>
						{categories.map((cat) => (
							<TabsTrigger key={cat} value={cat}>
								{CATEGORY_LABELS[cat] || cat}
							</TabsTrigger>
						))}
					</TabsList>
				</Tabs>
			) : null}

			{/* Results */}
			{isLoading ? (
				<div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
					{Array.from({ length: 6 }).map((_, i) => (
						<Card key={i}>
							<CardContent className="space-y-3 pt-6">
								<Skeleton className="h-5 w-3/4" />
								<Skeleton className="h-4 w-full" />
								<Skeleton className="h-4 w-2/3" />
								<div className="flex gap-2">
									<Skeleton className="h-5 w-16" />
									<Skeleton className="h-5 w-12" />
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			) : data && data.items.length > 0 ? (
				<>
					<p className="mb-4 text-muted-foreground text-sm">
						{data.pagination.total} <Trans>resources found</Trans>
					</p>

					<div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
						{data.items.map((resource) => (
							<ResourceCard key={resource.id} resource={resource} />
						))}
					</div>

					{/* Pagination */}
					{data.pagination.totalPages > 1 && (
						<div className="mt-6 flex items-center justify-center gap-2">
							<Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
								<Trans>Previous</Trans>
							</Button>
							<span className="text-muted-foreground text-sm">
								{page} / {data.pagination.totalPages}
							</span>
							<Button
								variant="outline"
								size="sm"
								disabled={page >= data.pagination.totalPages}
								onClick={() => setPage((p) => p + 1)}
							>
								<Trans>Next</Trans>
							</Button>
						</div>
					)}
				</>
			) : (
				<div className="py-16 text-center">
					<BriefcaseIcon className="mx-auto mb-4 size-12 text-muted-foreground/50" />
					<h3 className="mb-2 font-medium text-lg">
						<Trans>No resources found</Trans>
					</h3>
					<p className="text-muted-foreground">
						<Trans>Try adjusting your filters or search term</Trans>
					</p>
					{hasFilters && (
						<Button variant="outline" className="mt-4" onClick={clearFilters}>
							<Trans>Clear all filters</Trans>
						</Button>
					)}
				</div>
			)}
		</div>
	);
}

// ---- Resource Card ----

interface ResourceCardProps {
	resource: {
		id: string;
		name: string;
		nameFr: string | null;
		category: string;
		subCategory: string | null;
		description: string | null;
		descriptionFr: string | null;
		website: string | null;
		contactEmail: string | null;
		contactPhone: string | null;
		location: string | null;
		fields: string[] | null;
		tags: string[] | null;
		isFree: boolean;
		rating: string | null;
	};
}

function ResourceCard({ resource }: ResourceCardProps) {
	return (
		<Card className="flex flex-col">
			<CardHeader className="pb-3">
				<div className="flex items-start justify-between gap-2">
					<CardTitle className="line-clamp-1 text-base">{resource.nameFr || resource.name}</CardTitle>
					<Badge variant={resource.isFree ? "default" : "secondary"} className="shrink-0 text-xs">
						{resource.isFree ? t`Free` : t`Paid`}
					</Badge>
				</div>
				<CardDescription className="line-clamp-2">{resource.descriptionFr || resource.description}</CardDescription>
			</CardHeader>

			<CardContent className="flex flex-1 flex-col justify-between space-y-3">
				{/* Category & Rating */}
				<div className="flex items-center justify-between">
					<Badge variant="outline" className="text-xs">
						{CATEGORY_LABELS[resource.category] || resource.category}
					</Badge>
					{renderRating(resource.rating)}
				</div>

				{/* Location */}
				{resource.location && (
					<div className="flex items-center gap-1.5 text-muted-foreground text-sm">
						<MapPinIcon className="size-3.5 shrink-0" />
						<span className="line-clamp-1">{resource.location}</span>
					</div>
				)}

				{/* Fields */}
				{resource.fields && resource.fields.length > 0 && (
					<div className="flex flex-wrap gap-1">
						{resource.fields.slice(0, 3).map((field) => (
							<Badge key={field} variant="outline" className="text-xs">
								{formatFieldName(field)}
							</Badge>
						))}
						{resource.fields.length > 3 && (
							<Badge variant="outline" className="text-xs">
								+{resource.fields.length - 3}
							</Badge>
						)}
					</div>
				)}

				{/* Tags */}
				{resource.tags && resource.tags.length > 0 && (
					<div className="flex flex-wrap gap-1">
						{resource.tags.slice(0, 4).map((tag) => (
							<span key={tag} className="rounded-sm bg-muted px-1.5 py-0.5 text-muted-foreground text-xs">
								{tag}
							</span>
						))}
					</div>
				)}

				{/* Actions */}
				<div className="flex flex-wrap items-center gap-2 border-t pt-3">
					{resource.website && (
						<Button variant="outline" size="sm" asChild>
							<a href={resource.website} target="_blank" rel="noopener noreferrer">
								<GlobeIcon className="mr-1.5 size-3.5" />
								<Trans>Website</Trans>
								<ArrowSquareOutIcon className="ml-1 size-3" />
							</a>
						</Button>
					)}
					{resource.contactEmail && (
						<Button variant="ghost" size="sm" asChild>
							<a href={`mailto:${resource.contactEmail}`}>
								<EnvelopeIcon className="mr-1.5 size-3.5" />
								<Trans>Email</Trans>
							</a>
						</Button>
					)}
					{resource.contactPhone && (
						<Button variant="ghost" size="sm" asChild>
							<a href={`tel:${resource.contactPhone}`}>
								<PhoneIcon className="mr-1.5 size-3.5" />
								<Trans>Call</Trans>
							</a>
						</Button>
					)}
				</div>
			</CardContent>
		</Card>
	);
}
