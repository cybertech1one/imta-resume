import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import {
	BriefcaseIcon,
	HeartIcon,
	MagnifyingGlassIcon,
	PaletteIcon,
	SparkleIcon,
	TrendUpIcon,
} from "@phosphor-icons/react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AnimatePresence } from "motion/react";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import { ErrorComponent } from "@/components/error-component";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/utils/style";
import { DashboardHeader } from "../-components/header";
import {
	CompareBar,
	CompareDialog,
	HeroSection,
	TemplateCard,
	TemplateFilters,
	TemplatePreviewDialog,
	useRenderStars,
	useTemplateReviews,
} from "./-components/gallery-components";
import {
	getIndustryLabels,
	getStyleLabels,
	industryIcons,
	resumeTemplates,
	styleColors,
	styleIcons,
} from "./-components/gallery-config";
import type { ExperienceLevel, IndustryCategory, ResumeTemplate, StyleCategory } from "./-components/gallery-types";

// biome-ignore lint/suspicious/noExplicitAny: Route path not in generated route tree
export const Route = createFileRoute("/dashboard/templates/gallery" as any)({
	component: TemplateGalleryPage,
	errorComponent: ErrorComponent,
});

function TemplateGalleryPage() {
	const navigate = useNavigate();
	const styleLabels = getStyleLabels();
	const industryLabels = getIndustryLabels();
	const renderStars = useRenderStars();
	const getTemplateReviews = useTemplateReviews();
	const [searchQuery, setSearchQuery] = useState("");
	const [activeTab, setActiveTab] = useState("all");
	const [selectedStyle, setSelectedStyle] = useState<StyleCategory | "all">("all");
	const [selectedIndustry, setSelectedIndustry] = useState<IndustryCategory | "all">("all");
	const [selectedExperience, setSelectedExperience] = useState<ExperienceLevel | "all">("all");
	const [sortBy, setSortBy] = useState<"popular" | "rating" | "newest">("popular");
	const [selectedTemplate, setSelectedTemplate] = useState<ResumeTemplate | null>(null);
	const [isPreviewOpen, setIsPreviewOpen] = useState(false);
	const [compareTemplates, setCompareTemplates] = useState<ResumeTemplate[]>([]);
	const [isCompareOpen, setIsCompareOpen] = useState(false);
	const [favorites, setFavorites] = useState<Set<string>>(new Set());
	const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

	const filteredTemplates = useMemo(() => {
		let filtered = resumeTemplates.filter((template) => {
			const matchesSearch =
				searchQuery === "" ||
				template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
				template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
				template.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));

			const matchesStyle = selectedStyle === "all" || template.style === selectedStyle;
			const matchesIndustry = selectedIndustry === "all" || template.industries.includes(selectedIndustry);
			const matchesExperience = selectedExperience === "all" || template.experienceLevel.includes(selectedExperience);
			const matchesFavorites = !showFavoritesOnly || favorites.has(template.id);

			return matchesSearch && matchesStyle && matchesIndustry && matchesExperience && matchesFavorites;
		});

		switch (sortBy) {
			case "rating":
				filtered = filtered.sort((a, b) => b.rating - a.rating);
				break;
			case "newest":
				filtered = filtered.sort((a, b) => (a.isNew === b.isNew ? 0 : a.isNew ? -1 : 1));
				break;
			default:
				filtered = filtered.sort((a, b) => b.downloadCount - a.downloadCount);
				break;
		}

		return filtered;
	}, [searchQuery, selectedStyle, selectedIndustry, selectedExperience, sortBy, showFavoritesOnly, favorites]);

	const trendingTemplates = useMemo(() => {
		return resumeTemplates.filter((t) => t.isTrending).slice(0, 4);
	}, []);

	const toggleFavorite = useCallback((templateId: string) => {
		setFavorites((prev) => {
			const newFavorites = new Set(prev);
			if (newFavorites.has(templateId)) {
				newFavorites.delete(templateId);
				toast.success(t`Modèle retiré des favoris`);
			} else {
				newFavorites.add(templateId);
				toast.success(t`Modèle ajouté aux favoris`);
			}
			return newFavorites;
		});
	}, []);

	const addToCompare = useCallback(
		(template: ResumeTemplate) => {
			if (compareTemplates.length >= 3) {
				toast.error(t`Tu peux comparer jusqu'à 3 modèles`);
				return;
			}
			if (compareTemplates.find((t) => t.id === template.id)) {
				toast.error(t`Ce modèle est déjà dans la comparaison`);
				return;
			}
			setCompareTemplates((prev) => [...prev, template]);
			toast.success(t`Modèle ajouté à la comparaison`);
		},
		[compareTemplates],
	);

	const removeFromCompare = useCallback((templateId: string) => {
		setCompareTemplates((prev) => prev.filter((t) => t.id !== templateId));
	}, []);

	const applyTemplate = useCallback(
		(template: ResumeTemplate) => {
			toast.success(t`Modèle "${template.name}" sélectionné. Crée un CV pour l'utiliser.`);
			navigate({ to: "/dashboard/resumes" });
		},
		[navigate],
	);

	const openPreview = useCallback((template: ResumeTemplate) => {
		setSelectedTemplate(template);
		setIsPreviewOpen(true);
	}, []);

	const clearFilters = useCallback(() => {
		setSelectedStyle("all");
		setSelectedIndustry("all");
		setSelectedExperience("all");
		setSearchQuery("");
		setShowFavoritesOnly(false);
	}, []);

	const hasActiveFilters =
		selectedStyle !== "all" ||
		selectedIndustry !== "all" ||
		selectedExperience !== "all" ||
		searchQuery !== "" ||
		showFavoritesOnly;

	return (
		<>
			<DashboardHeader icon={PaletteIcon} title={t`Galerie de modèles CV`} />

			<HeroSection searchQuery={searchQuery} onSearchChange={setSearchQuery} trendingCount={trendingTemplates.length} />

			<CompareBar
				compareTemplates={compareTemplates}
				onRemove={removeFromCompare}
				onCompare={() => setIsCompareOpen(true)}
				onClear={() => setCompareTemplates([])}
			/>

			<Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
				<TabsList className="flex h-auto flex-wrap gap-2 bg-transparent p-0">
					<TabsTrigger
						value="all"
						className="gap-2 rounded-full border border-transparent bg-muted/50 px-4 py-2 data-[state=active]:border-primary/30 data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
					>
						<SparkleIcon className="size-4" />
						<Trans>Tous les modèles</Trans>
					</TabsTrigger>
					<TabsTrigger
						value="trending"
						className="gap-2 rounded-full border border-transparent bg-muted/50 px-4 py-2 data-[state=active]:border-primary/30 data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
					>
						<TrendUpIcon className="size-4" />
						<Trans>Populaires</Trans>
					</TabsTrigger>
					<TabsTrigger
						value="by-style"
						className="gap-2 rounded-full border border-transparent bg-muted/50 px-4 py-2 data-[state=active]:border-primary/30 data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
					>
						<PaletteIcon className="size-4" />
						<Trans>Par style</Trans>
					</TabsTrigger>
					<TabsTrigger
						value="by-industry"
						className="gap-2 rounded-full border border-transparent bg-muted/50 px-4 py-2 data-[state=active]:border-primary/30 data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
					>
						<BriefcaseIcon className="size-4" />
						<Trans>Par secteur</Trans>
					</TabsTrigger>
					<TabsTrigger
						value="favorites"
						className="gap-2 rounded-full border border-transparent bg-muted/50 px-4 py-2 data-[state=active]:border-primary/30 data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
					>
						<HeartIcon className="size-4" />
						<Trans>Favoris</Trans>
						{favorites.size > 0 && (
							<Badge variant="secondary" className="ml-1 px-1.5 py-0 text-xs">
								{favorites.size}
							</Badge>
						)}
					</TabsTrigger>
				</TabsList>

				<TabsContent value="all" className="space-y-6">
					<TemplateFilters
						selectedStyle={selectedStyle}
						selectedIndustry={selectedIndustry}
						selectedExperience={selectedExperience}
						sortBy={sortBy}
						hasActiveFilters={hasActiveFilters}
						onStyleChange={setSelectedStyle}
						onIndustryChange={setSelectedIndustry}
						onExperienceChange={setSelectedExperience}
						onSortChange={setSortBy}
						onClearFilters={clearFilters}
					/>

					<p className="text-muted-foreground text-sm">
						{filteredTemplates.length} <Trans>modèle(s) trouvé(s)</Trans>
					</p>

					<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
						<AnimatePresence mode="popLayout">
							{filteredTemplates.map((template, index) => (
								<TemplateCard
									key={template.id}
									template={template}
									index={index}
									isFavorite={favorites.has(template.id)}
									onPreview={() => openPreview(template)}
									onUse={() => applyTemplate(template)}
									onToggleFavorite={() => toggleFavorite(template.id)}
									onAddToCompare={() => addToCompare(template)}
									renderStars={renderStars}
									isInCompare={compareTemplates.some((t) => t.id === template.id)}
								/>
							))}
						</AnimatePresence>
					</div>

					{filteredTemplates.length === 0 && (
						<div className="flex flex-col items-center justify-center py-12 text-center">
							<MagnifyingGlassIcon className="mb-4 size-12 text-muted-foreground" />
							<h3 className="mb-2 font-semibold text-lg">
								<Trans>Aucun modèle trouvé</Trans>
							</h3>
							<p className="text-muted-foreground">
								<Trans>Essaie de modifier la recherche ou les filtres.</Trans>
							</p>
						</div>
					)}
				</TabsContent>

				<TabsContent value="trending" className="space-y-8">
					<div className="mb-6">
						<h3 className="mb-2 font-semibold text-xl">
							<Trans>Les plus demandés en ce moment</Trans>
						</h3>
						<p className="text-muted-foreground">
							<Trans>Les modèles les plus utilisés par les étudiants et jeunes diplômés cette semaine.</Trans>
						</p>
					</div>

					<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
						{trendingTemplates.map((template, index) => (
							<TemplateCard
								key={template.id}
								template={template}
								index={index}
								isFavorite={favorites.has(template.id)}
								onPreview={() => openPreview(template)}
								onUse={() => applyTemplate(template)}
								onToggleFavorite={() => toggleFavorite(template.id)}
								onAddToCompare={() => addToCompare(template)}
								renderStars={renderStars}
								isInCompare={compareTemplates.some((t) => t.id === template.id)}
								showTrendingBadge
							/>
						))}
					</div>
				</TabsContent>

				<TabsContent value="by-style" className="space-y-10">
					{(Object.keys(styleLabels) as StyleCategory[]).map((style) => {
						const StyleIcon = styleIcons[style];
						const styleTemplates = resumeTemplates.filter((t) => t.style === style);

						if (styleTemplates.length === 0) return null;

						return (
							<section key={style}>
								<div className="mb-6 flex items-center gap-3">
									<div className={cn("flex size-12 items-center justify-center rounded-xl", styleColors[style])}>
										<StyleIcon className="size-6" weight="duotone" />
									</div>
									<div>
										<h3 className="font-semibold text-xl">{styleLabels[style]}</h3>
										<p className="text-muted-foreground text-sm">
											{styleTemplates.length} <Trans>modèle(s)</Trans>
										</p>
									</div>
								</div>

								<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
									{styleTemplates.slice(0, 4).map((template, index) => (
										<TemplateCard
											key={template.id}
											template={template}
											index={index}
											isFavorite={favorites.has(template.id)}
											onPreview={() => openPreview(template)}
											onUse={() => applyTemplate(template)}
											onToggleFavorite={() => toggleFavorite(template.id)}
											onAddToCompare={() => addToCompare(template)}
											renderStars={renderStars}
											isInCompare={compareTemplates.some((t) => t.id === template.id)}
										/>
									))}
								</div>
							</section>
						);
					})}
				</TabsContent>

				<TabsContent value="by-industry" className="space-y-10">
					{(Object.keys(industryLabels) as IndustryCategory[]).map((industry) => {
						const IndustryIcon = industryIcons[industry];
						const industryTemplates = resumeTemplates.filter((t) => t.industries.includes(industry));

						if (industryTemplates.length === 0) return null;

						return (
							<section key={industry}>
								<div className="mb-6 flex items-center gap-3">
									<div className="flex size-12 items-center justify-center rounded-xl bg-primary/10">
										<IndustryIcon className="size-6 text-primary" weight="duotone" />
									</div>
									<div>
										<h3 className="font-semibold text-xl">{industryLabels[industry]}</h3>
										<p className="text-muted-foreground text-sm">
											{industryTemplates.length} <Trans>modèle(s)</Trans>
										</p>
									</div>
								</div>

								<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
									{industryTemplates.slice(0, 4).map((template, index) => (
										<TemplateCard
											key={template.id}
											template={template}
											index={index}
											isFavorite={favorites.has(template.id)}
											onPreview={() => openPreview(template)}
											onUse={() => applyTemplate(template)}
											onToggleFavorite={() => toggleFavorite(template.id)}
											onAddToCompare={() => addToCompare(template)}
											renderStars={renderStars}
											isInCompare={compareTemplates.some((t) => t.id === template.id)}
										/>
									))}
								</div>
							</section>
						);
					})}
				</TabsContent>

				<TabsContent value="favorites" className="space-y-6">
					{favorites.size === 0 ? (
						<div className="flex flex-col items-center justify-center py-12 text-center">
							<HeartIcon className="mb-4 size-12 text-muted-foreground" />
							<h3 className="mb-2 font-semibold text-lg">
								<Trans>Aucun favori pour le moment</Trans>
							</h3>
							<p className="mb-4 text-muted-foreground">
								<Trans>Parcours la galerie et clique sur le coeur pour garder tes modèles préférés.</Trans>
							</p>
							<Button onClick={() => setActiveTab("all")}>
								<Trans>Voir les modèles</Trans>
							</Button>
						</div>
					) : (
						<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
							{resumeTemplates
								.filter((t) => favorites.has(t.id))
								.map((template, index) => (
									<TemplateCard
										key={template.id}
										template={template}
										index={index}
										isFavorite
										onPreview={() => openPreview(template)}
										onUse={() => applyTemplate(template)}
										onToggleFavorite={() => toggleFavorite(template.id)}
										onAddToCompare={() => addToCompare(template)}
										renderStars={renderStars}
										isInCompare={compareTemplates.some((t) => t.id === template.id)}
									/>
								))}
						</div>
					)}
				</TabsContent>
			</Tabs>

			<TemplatePreviewDialog
				isOpen={isPreviewOpen}
				onOpenChange={setIsPreviewOpen}
				template={selectedTemplate}
				favorites={favorites}
				renderStars={renderStars}
				getTemplateReviews={getTemplateReviews}
				onToggleFavorite={toggleFavorite}
				onApplyTemplate={applyTemplate}
			/>

			<CompareDialog
				isOpen={isCompareOpen}
				onOpenChange={setIsCompareOpen}
				compareTemplates={compareTemplates}
				renderStars={renderStars}
				onRemove={removeFromCompare}
				onApplyTemplate={applyTemplate}
			/>
		</>
	);
}
