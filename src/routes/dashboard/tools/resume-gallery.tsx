import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import {
	ArrowLeftIcon,
	BookOpenIcon,
	CopyIcon,
	EyeIcon,
	GlobeIcon,
	MagnifyingGlassIcon,
	StarIcon,
	XIcon,
} from "@phosphor-icons/react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { ErrorComponent } from "@/components/error-component";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { orpc } from "@/integrations/orpc/client";
import { formatFieldName } from "../-components/display-utils";
import { DashboardHeader } from "../-components/header";

// biome-ignore lint/suspicious/noExplicitAny: Route path not in generated route tree
export const Route = createFileRoute("/dashboard/tools/resume-gallery" as any)({
	component: ResumeGalleryPage,
	errorComponent: ErrorComponent,
});

// ---- Helpers ----

function getExperienceLabel(years: number): string {
	if (years === 0) return t`Entry Level`;
	if (years <= 2) return t`Junior (1-2 years)`;
	if (years <= 5) return t`Mid-Level (3-5 years)`;
	if (years <= 10) return t`Senior (6-10 years)`;
	return t`Expert (10+ years)`;
}

function getScoreColor(score: number | null): string {
	if (!score) return "text-muted-foreground";
	if (score >= 80) return "text-emerald-600 dark:text-emerald-400";
	if (score >= 60) return "text-amber-600 dark:text-amber-400";
	return "text-red-600 dark:text-red-400";
}

function getScoreBadgeVariant(score: number | null): "default" | "secondary" | "destructive" | "outline" {
	if (!score) return "outline";
	if (score >= 80) return "default";
	if (score >= 60) return "secondary";
	return "destructive";
}

const LANGUAGE_LABELS: Record<string, string> = {
	fr: "Français",
	en: "English",
	ar: "العربية",
	es: "Español",
	de: "Deutsch",
};

// French labels for IMTA vocational programs (gallery subField values).
const PROGRAM_LABELS: Record<string, string> = {
	infirmier_polyvalent: "Infirmier Polyvalent",
	sage_femme: "Sage-Femme",
	aide_soignant: "Aide-Soignant",
	infirmier_auxiliaire: "Infirmier Auxiliaire",
	soudure: "Soudure",
	cariste: "Cariste",
	conducteur_engins: "Conducteur d'Engins",
	mecanique_engins: "Mécanique d'Engins",
	tourneur_industriel: "Tourneur Industriel",
	electromecanique: "Électromécanique",
	hse_specialist: "Technicien HSE",
};

function formatProgram(subField: string): string {
	return PROGRAM_LABELS[subField] || formatFieldName(subField);
}

// ---- Detail View ----

interface DetailViewProps {
	itemId: string;
	onBack: () => void;
}

function GalleryDetailView({ itemId, onBack }: DetailViewProps) {
	const navigate = useNavigate();

	const { data: item, isLoading } = useQuery(orpc.resumeGallery.getById.queryOptions({ input: { id: itemId } }));

	const viewMutation = useMutation(orpc.resumeGallery.incrementViewCount.mutationOptions());

	const useMutation_ = useMutation(orpc.resumeGallery.incrementUseCount.mutationOptions());

	// Track view once per item; mutate identity is stable in TanStack Query
	// biome-ignore lint/correctness/useExhaustiveDependencies: intentional fire-on-itemId-change
	useEffect(() => {
		viewMutation.mutate({ id: itemId });
	}, [itemId]);

	const handleUseAsTemplate = useCallback(() => {
		if (!item) return;
		useMutation_.mutate({ id: itemId });
		toast.success(t`Resume template copied! Creating new resume...`);
		navigate({ to: "/dashboard/resumes" as any });
	}, [item, itemId, useMutation_, navigate]);

	if (isLoading) {
		return (
			<div className="space-y-4">
				<Skeleton className="h-8 w-48" />
				<Skeleton className="h-64 w-full" />
			</div>
		);
	}

	if (!item) {
		return (
			<div className="py-12 text-center text-muted-foreground">
				<Trans>Resume not found</Trans>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<div className="flex items-center gap-3">
				<Button variant="ghost" size="sm" onClick={onBack}>
					<ArrowLeftIcon className="mr-2 size-4" />
					<Trans>Back to Gallery</Trans>
				</Button>
			</div>

			<div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
				{/* Info Column */}
				<div className="space-y-4 lg:col-span-1">
					<Card>
						<CardHeader>
							<CardTitle className="text-xl">{item.nameFr || item.name}</CardTitle>
							<CardDescription>{item.descriptionFr || item.description}</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="flex flex-wrap gap-2">
								<Badge variant="secondary">{formatFieldName(item.field)}</Badge>
								{item.subField && <Badge variant="outline">{formatProgram(item.subField)}</Badge>}
								<Badge variant="outline">{LANGUAGE_LABELS[item.language] || item.language}</Badge>
							</div>

							<div className="space-y-2 text-sm">
								<div className="flex items-center justify-between">
									<span className="text-muted-foreground">
										<Trans>Experience</Trans>
									</span>
									<span className="font-medium">{getExperienceLabel(item.experienceYears)}</span>
								</div>
								<div className="flex items-center justify-between">
									<span className="text-muted-foreground">
										<Trans>Template</Trans>
									</span>
									<span className="font-medium">{item.templateName}</span>
								</div>
								{item.atsScore != null && (
									<div className="flex items-center justify-between">
										<span className="text-muted-foreground">
											<Trans>ATS Score</Trans>
										</span>
										<span className={`font-bold ${getScoreColor(item.atsScore)}`}>{item.atsScore}/100</span>
									</div>
								)}
								<div className="flex items-center justify-between">
									<span className="text-muted-foreground">
										<Trans>Views</Trans>
									</span>
									<span>{item.viewCount}</span>
								</div>
								<div className="flex items-center justify-between">
									<span className="text-muted-foreground">
										<Trans>Used</Trans>
									</span>
									<span>
										{item.useCount} <Trans>times</Trans>
									</span>
								</div>
							</div>

							{item.tags && item.tags.length > 0 && (
								<div className="flex flex-wrap gap-1">
									{item.tags.map((tag) => (
										<Badge key={tag} variant="outline" className="text-xs">
											{tag}
										</Badge>
									))}
								</div>
							)}

							<Button className="w-full" onClick={handleUseAsTemplate}>
								<CopyIcon className="mr-2 size-4" />
								<Trans>Use as Template</Trans>
							</Button>
						</CardContent>
					</Card>
				</div>

				{/* Resume Preview Column */}
				<div className="lg:col-span-2">
					<Card>
						<CardHeader>
							<CardTitle>
								<Trans>Resume Preview</Trans>
							</CardTitle>
						</CardHeader>
						<CardContent>
							{item.resumeData ? (
								<div className="rounded-lg border bg-white p-6 dark:bg-zinc-900">
									<pre className="max-h-[600px] overflow-auto whitespace-pre-wrap text-xs">
										{JSON.stringify(item.resumeData, null, 2)}
									</pre>
								</div>
							) : (
								<div className="flex h-64 items-center justify-center rounded-lg border bg-muted/50">
									<p className="text-muted-foreground">
										<Trans>No preview available</Trans>
									</p>
								</div>
							)}
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}

// ---- Main Page ----

function ResumeGalleryPage() {
	const [selectedId, setSelectedId] = useState<string | null>(null);
	const [search, setSearch] = useState("");
	const [fieldFilter, setFieldFilter] = useState<string>("");
	const [subFieldFilter, setSubFieldFilter] = useState<string>("");
	const [languageFilter, setLanguageFilter] = useState<string>("");
	const [templateFilter, setTemplateFilter] = useState<string>("");
	const [experienceFilter, setExperienceFilter] = useState<string>("");
	const [page, setPage] = useState(1);

	const experienceRange = useMemo(() => {
		if (!experienceFilter) return {};
		switch (experienceFilter) {
			case "entry":
				return { experienceMin: 0, experienceMax: 0 };
			case "junior":
				return { experienceMin: 1, experienceMax: 2 };
			case "mid":
				return { experienceMin: 3, experienceMax: 5 };
			case "senior":
				return { experienceMin: 6, experienceMax: 10 };
			case "expert":
				return { experienceMin: 11 };
			default:
				return {};
		}
	}, [experienceFilter]);

	const { data, isLoading } = useQuery(
		orpc.resumeGallery.list.queryOptions({
			input: {
				field: fieldFilter || undefined,
				subField: subFieldFilter || undefined,
				language: languageFilter || undefined,
				templateName: templateFilter || undefined,
				search: search || undefined,
				page,
				pageSize: 12,
				...experienceRange,
			},
		}),
	);

	const { data: subFields } = useQuery({
		...orpc.resumeGallery.getSubFields.queryOptions({ input: { field: fieldFilter || undefined } }),
		staleTime: 60 * 60 * 1000,
	});

	const { data: fields } = useQuery({
		...orpc.resumeGallery.getFields.queryOptions(),
		staleTime: 60 * 60 * 1000,
	});
	const { data: templates } = useQuery({
		...orpc.resumeGallery.getTemplates.queryOptions(),
		staleTime: 60 * 60 * 1000,
	});
	const { data: languages } = useQuery({
		...orpc.resumeGallery.getLanguages.queryOptions(),
		staleTime: 60 * 60 * 1000,
	});
	const { data: featured } = useQuery({
		...orpc.resumeGallery.getFeatured.queryOptions(),
		staleTime: 30 * 60 * 1000,
	});

	const hasFilters = search || fieldFilter || subFieldFilter || languageFilter || templateFilter || experienceFilter;

	const clearFilters = useCallback(() => {
		setSearch("");
		setFieldFilter("");
		setSubFieldFilter("");
		setLanguageFilter("");
		setTemplateFilter("");
		setExperienceFilter("");
		setPage(1);
	}, []);

	if (selectedId) {
		return (
			<div className="min-h-full p-4 md:p-6">
				<GalleryDetailView itemId={selectedId} onBack={() => setSelectedId(null)} />
			</div>
		);
	}

	return (
		<div className="min-h-full p-4 md:p-6">
			<DashboardHeader title={t`Resume Gallery`} icon={BookOpenIcon} />

			<p className="mb-6 text-muted-foreground">
				<Trans>
					Browse professional resume examples from various fields and experience levels. Use them as templates for your
					own resume.
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
									placeholder={t`Search resumes...`}
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
							value={fieldFilter}
							onValueChange={(v) => {
								setFieldFilter(v === "all" ? "" : v);
								setSubFieldFilter(""); // reset program when the field (sector) changes
								setPage(1);
							}}
						>
							<SelectTrigger className="w-full md:w-[160px]">
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
							value={subFieldFilter}
							onValueChange={(v) => {
								setSubFieldFilter(v === "all" ? "" : v);
								setPage(1);
							}}
						>
							<SelectTrigger className="w-full md:w-[200px]">
								<SelectValue placeholder={t`All Programs`} />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">
									<Trans>All Programs</Trans>
								</SelectItem>
								{subFields?.map((sf) => (
									<SelectItem key={sf} value={sf}>
										{formatProgram(sf)}
									</SelectItem>
								))}
							</SelectContent>
						</Select>

						<Select
							value={experienceFilter}
							onValueChange={(v) => {
								setExperienceFilter(v === "all" ? "" : v);
								setPage(1);
							}}
						>
							<SelectTrigger className="w-full md:w-[180px]">
								<SelectValue placeholder={t`All Levels`} />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">
									<Trans>All Levels</Trans>
								</SelectItem>
								<SelectItem value="entry">
									<Trans>Entry Level</Trans>
								</SelectItem>
								<SelectItem value="junior">
									<Trans>Junior (1-2 years)</Trans>
								</SelectItem>
								<SelectItem value="mid">
									<Trans>Mid-Level (3-5 years)</Trans>
								</SelectItem>
								<SelectItem value="senior">
									<Trans>Senior (6-10 years)</Trans>
								</SelectItem>
								<SelectItem value="expert">
									<Trans>Expert (10+ years)</Trans>
								</SelectItem>
							</SelectContent>
						</Select>

						<Select
							value={languageFilter}
							onValueChange={(v) => {
								setLanguageFilter(v === "all" ? "" : v);
								setPage(1);
							}}
						>
							<SelectTrigger className="w-full md:w-[160px]">
								<SelectValue placeholder={t`All Languages`} />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">
									<Trans>All Languages</Trans>
								</SelectItem>
								{languages?.map((lang) => (
									<SelectItem key={lang} value={lang}>
										{LANGUAGE_LABELS[lang] || lang}
									</SelectItem>
								))}
							</SelectContent>
						</Select>

						<Select
							value={templateFilter}
							onValueChange={(v) => {
								setTemplateFilter(v === "all" ? "" : v);
								setPage(1);
							}}
						>
							<SelectTrigger className="w-full md:w-[160px]">
								<SelectValue placeholder={t`All Templates`} />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">
									<Trans>All Templates</Trans>
								</SelectItem>
								{templates?.map((tmpl) => (
									<SelectItem key={tmpl} value={tmpl}>
										{tmpl}
									</SelectItem>
								))}
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

			{/* Featured Section */}
			{!hasFilters && featured && featured.length > 0 && (
				<div className="mb-8">
					<h2 className="mb-4 flex items-center gap-2 font-semibold text-lg">
						<StarIcon className="size-5 text-amber-500" weight="fill" />
						<Trans>Featured Resumes</Trans>
					</h2>
					<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
						{featured.slice(0, 4).map((item) => (
							<GalleryCard key={item.id} item={item} onClick={() => setSelectedId(item.id)} />
						))}
					</div>
				</div>
			)}

			{/* Results */}
			{isLoading ? (
				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
					{Array.from({ length: 8 }).map((_, i) => (
						<Card key={i}>
							<CardContent className="space-y-3 pt-6">
								<Skeleton className="h-5 w-3/4" />
								<Skeleton className="h-4 w-full" />
								<div className="flex gap-2">
									<Skeleton className="h-5 w-16" />
									<Skeleton className="h-5 w-12" />
								</div>
								<Skeleton className="h-4 w-1/2" />
							</CardContent>
						</Card>
					))}
				</div>
			) : data && data.items.length > 0 ? (
				<>
					<div className="mb-4 flex items-center justify-between">
						<p className="text-muted-foreground text-sm">
							{data.pagination.total} <Trans>resumes found</Trans>
						</p>
					</div>

					<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
						{data.items.map((item) => (
							<GalleryCard key={item.id} item={item} onClick={() => setSelectedId(item.id)} />
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
					<BookOpenIcon className="mx-auto mb-4 size-12 text-muted-foreground/50" />
					<h3 className="mb-2 font-medium text-lg">
						<Trans>No resumes found</Trans>
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

// ---- Gallery Card Component ----

interface GalleryCardProps {
	item: {
		id: string;
		name: string;
		nameFr: string | null;
		field: string;
		subField: string | null;
		experienceYears: number;
		templateName: string;
		language: string;
		description: string | null;
		descriptionFr: string | null;
		tags: string[] | null;
		atsScore: number | null;
		isFeatured: boolean;
		viewCount: number;
		useCount: number;
	};
	onClick: () => void;
}

function GalleryCard({ item, onClick }: GalleryCardProps) {
	return (
		<Card
			className="cursor-pointer transition-all hover:shadow-md hover:ring-1 hover:ring-primary/20"
			onClick={onClick}
		>
			<CardContent className="space-y-3 pt-6">
				<div className="flex items-start justify-between">
					<h3 className="line-clamp-1 font-semibold text-sm">{item.nameFr || item.name}</h3>
					{item.isFeatured && <StarIcon className="size-4 shrink-0 text-amber-500" weight="fill" />}
				</div>

				<p className="line-clamp-2 text-muted-foreground text-xs">
					{item.descriptionFr || item.description || item.field}
				</p>

				<div className="flex flex-wrap gap-1.5">
					<Badge variant="secondary" className="text-xs">
						{formatFieldName(item.field)}
					</Badge>
					<Badge variant="outline" className="text-xs">
						<GlobeIcon className="mr-1 size-3" />
						{LANGUAGE_LABELS[item.language] || item.language}
					</Badge>
				</div>

				<div className="flex items-center justify-between text-muted-foreground text-xs">
					<span>{getExperienceLabel(item.experienceYears)}</span>
					{item.atsScore != null && (
						<Badge variant={getScoreBadgeVariant(item.atsScore)} className="text-xs">
							ATS {item.atsScore}%
						</Badge>
					)}
				</div>

				<div className="flex items-center justify-between border-t pt-2 text-muted-foreground text-xs">
					<span className="flex items-center gap-1">
						<EyeIcon className="size-3" />
						{item.viewCount}
					</span>
					<span className="flex items-center gap-1">
						<CopyIcon className="size-3" />
						{item.useCount}
					</span>
					<span className="capitalize">{item.templateName}</span>
				</div>
			</CardContent>
		</Card>
	);
}
