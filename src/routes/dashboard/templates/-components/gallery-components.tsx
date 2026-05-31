import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import {
	ArrowsLeftRightIcon,
	CheckCircleIcon,
	CrownIcon,
	DownloadSimpleIcon,
	EyeIcon,
	FunnelIcon,
	HeartIcon,
	MagnifyingGlassIcon,
	PaletteIcon,
	SparkleIcon,
	StarIcon,
	TrendUpIcon,
	UserIcon,
	UsersIcon,
	XIcon,
} from "@phosphor-icons/react";
import { AnimatePresence, motion } from "motion/react";
import type React from "react";
import { useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/utils/style";
import {
	experienceLevelColors,
	getExperienceLevelLabels,
	getIndustryLabels,
	getStyleLabels,
	resumeTemplates,
	sampleReviews,
	styleColors,
	styleIcons,
} from "./gallery-config";
import type {
	ExperienceLevel,
	IndustryCategory,
	ResumeTemplate,
	StyleCategory,
	TemplateCardProps,
} from "./gallery-types";

export function useRenderStars() {
	return useCallback((rating: number, size: "sm" | "md" = "sm") => {
		const fullStars = Math.floor(rating);
		const hasHalfStar = rating % 1 >= 0.5;
		const iconSize = size === "sm" ? "size-4" : "size-5";

		return (
			<div className="flex items-center gap-0.5">
				{[...Array(5)].map((_, i) => (
					<StarIcon
						key={i}
						className={cn(
							iconSize,
							i < fullStars
								? "text-amber-500"
								: i === fullStars && hasHalfStar
									? "text-amber-500"
									: "text-gray-300 dark:text-gray-600",
						)}
						weight={i < fullStars || (i === fullStars && hasHalfStar) ? "fill" : "regular"}
					/>
				))}
			</div>
		);
	}, []);
}

export function useTemplateReviews() {
	return useCallback((templateId: string) => {
		return sampleReviews.filter((r) => r.templateId === templateId);
	}, []);
}

interface HeroSectionProps {
	searchQuery: string;
	onSearchChange: (value: string) => void;
	trendingCount: number;
}

export function HeroSection({ searchQuery, onSearchChange, trendingCount }: HeroSectionProps) {
	return (
		<motion.div
			className="mb-8 overflow-hidden rounded-2xl border bg-background shadow-sm"
			initial={false}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.35, ease: "easeOut" }}
		>
			<div className="grid gap-6 p-6 lg:grid-cols-[1fr_22rem] lg:p-8">
				<div className="min-w-0">
					<div className="mb-3 flex items-center gap-2 text-primary">
						<PaletteIcon className="size-5" weight="duotone" />
						<span className="font-semibold text-sm uppercase tracking-wider">
							<Trans>Galerie de modèles</Trans>
						</span>
					</div>

					<h2 className="max-w-3xl font-bold text-3xl tracking-tight md:text-4xl">
						<Trans>Choisis un CV professionnel qui passe vraiment auprès des recruteurs.</Trans>
					</h2>
					<p className="mt-3 max-w-2xl text-muted-foreground leading-7">
						<Trans>
							Des modèles réalistes pour étudiants, stages, profils techniques et jeunes diplômés au Maroc. Chaque
							aperçu montre le vrai design exporté en PDF.
						</Trans>
					</p>

					<div className="mt-6 grid gap-3 md:grid-cols-[minmax(0,1fr)_auto]">
						<div className="relative">
							<MagnifyingGlassIcon className="absolute top-1/2 left-4 size-5 -translate-y-1/2 text-muted-foreground" />
							<Input
								type="search"
								placeholder={t`Rechercher par métier, ville, ATS, stage...`}
								value={searchQuery}
								onChange={(e) => onSearchChange(e.target.value)}
								className="h-12 rounded-lg border-border bg-background pr-4 pl-12"
							/>
						</div>
						<div className="flex flex-wrap gap-2">
							{["Étudiant", "Stage", "Technique", "ATS", "FR/AR"].map((label) => (
								<span key={label} className="rounded-full border bg-muted/40 px-3 py-2 font-medium text-xs">
									{label}
								</span>
							))}
						</div>
					</div>
				</div>

				<div className="grid grid-cols-2 gap-3 rounded-xl border bg-muted/25 p-3">
					<div className="rounded-lg bg-background p-4">
						<PaletteIcon className="mb-3 size-5 text-primary" weight="duotone" />
						<p className="font-bold text-2xl">{resumeTemplates.length}</p>
						<p className="text-muted-foreground text-sm">
							<Trans>modèles CV</Trans>
						</p>
					</div>
					<div className="rounded-lg bg-background p-4">
						<TrendUpIcon className="mb-3 size-5 text-amber-500" weight="duotone" />
						<p className="font-bold text-2xl">{trendingCount}</p>
						<p className="text-muted-foreground text-sm">
							<Trans>populaires</Trans>
						</p>
					</div>
					<div className="rounded-lg bg-background p-4">
						<UsersIcon className="mb-3 size-5 text-emerald-600" weight="duotone" />
						<p className="font-bold text-2xl">FR</p>
						<p className="text-muted-foreground text-sm">
							<Trans>CV français</Trans>
						</p>
					</div>
					<div className="rounded-lg bg-background p-4">
						<CheckCircleIcon className="mb-3 size-5 text-emerald-600" weight="fill" />
						<p className="font-bold text-2xl">PDF</p>
						<p className="text-muted-foreground text-sm">
							<Trans>export propre</Trans>
						</p>
					</div>
				</div>
			</div>
		</motion.div>
	);
}

interface CompareBarProps {
	compareTemplates: ResumeTemplate[];
	onRemove: (templateId: string) => void;
	onCompare: () => void;
	onClear: () => void;
}

export function CompareBar({ compareTemplates, onRemove, onCompare, onClear }: CompareBarProps) {
	return (
		<AnimatePresence>
			{compareTemplates.length > 0 && (
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					exit={{ opacity: 0, y: 20 }}
					className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2"
				>
					<Card className="flex items-center gap-4 border-primary/30 bg-background/95 px-6 py-3 shadow-2xl backdrop-blur-lg">
						<div className="flex items-center gap-2">
							<ArrowsLeftRightIcon className="size-5 text-primary" />
							<span className="font-medium">
								<Trans>Comparaison {compareTemplates.length}/3 modèles</Trans>
							</span>
						</div>
						<div className="flex items-center gap-2">
							{compareTemplates.map((template) => (
								<Badge key={template.id} variant="secondary" className="gap-1 pr-1">
									{template.name}
									<button onClick={() => onRemove(template.id)} className="ml-1 rounded-full p-0.5 hover:bg-muted">
										<XIcon className="size-3" />
									</button>
								</Badge>
							))}
						</div>
						<Button size="sm" onClick={onCompare} disabled={compareTemplates.length < 2}>
							<Trans>Comparer</Trans>
						</Button>
						<Button size="sm" variant="ghost" onClick={onClear}>
							<Trans>Effacer</Trans>
						</Button>
					</Card>
				</motion.div>
			)}
		</AnimatePresence>
	);
}

interface TemplateFiltersProps {
	selectedStyle: StyleCategory | "all";
	selectedIndustry: IndustryCategory | "all";
	selectedExperience: ExperienceLevel | "all";
	sortBy: "popular" | "rating" | "newest";
	hasActiveFilters: boolean;
	onStyleChange: (value: StyleCategory | "all") => void;
	onIndustryChange: (value: IndustryCategory | "all") => void;
	onExperienceChange: (value: ExperienceLevel | "all") => void;
	onSortChange: (value: "popular" | "rating" | "newest") => void;
	onClearFilters: () => void;
}

export function TemplateFilters({
	selectedStyle,
	selectedIndustry,
	selectedExperience,
	sortBy,
	hasActiveFilters,
	onStyleChange,
	onIndustryChange,
	onExperienceChange,
	onSortChange,
	onClearFilters,
}: TemplateFiltersProps) {
	const styleLabels = getStyleLabels();
	const industryLabels = getIndustryLabels();
	const experienceLevelLabels = getExperienceLevelLabels();

	return (
		<div className="flex flex-wrap items-center gap-4">
			<div className="flex items-center gap-2">
				<FunnelIcon className="size-4 text-muted-foreground" />
				<span className="font-medium text-muted-foreground text-sm">
					<Trans>Filtres :</Trans>
				</span>
			</div>

			<Select value={selectedStyle} onValueChange={(v) => onStyleChange(v as StyleCategory | "all")}>
				<SelectTrigger className="w-36">
					<SelectValue placeholder={t`Style`} />
				</SelectTrigger>
				<SelectContent>
					<SelectItem value="all">
						<Trans>Tous les styles</Trans>
					</SelectItem>
					{(Object.keys(styleLabels) as StyleCategory[]).map((style) => (
						<SelectItem key={style} value={style}>
							{styleLabels[style]}
						</SelectItem>
					))}
				</SelectContent>
			</Select>

			<Select value={selectedIndustry} onValueChange={(v) => onIndustryChange(v as IndustryCategory | "all")}>
				<SelectTrigger className="w-36">
					<SelectValue placeholder={t`Industry`} />
				</SelectTrigger>
				<SelectContent>
					<SelectItem value="all">
						<Trans>Tous les secteurs</Trans>
					</SelectItem>
					{(Object.keys(industryLabels) as IndustryCategory[]).map((industry) => (
						<SelectItem key={industry} value={industry}>
							{industryLabels[industry]}
						</SelectItem>
					))}
				</SelectContent>
			</Select>

			<Select value={selectedExperience} onValueChange={(v) => onExperienceChange(v as ExperienceLevel | "all")}>
				<SelectTrigger className="w-36">
					<SelectValue placeholder={t`Experience`} />
				</SelectTrigger>
				<SelectContent>
					<SelectItem value="all">
						<Trans>Tous les niveaux</Trans>
					</SelectItem>
					{(Object.keys(experienceLevelLabels) as ExperienceLevel[]).map((level) => (
						<SelectItem key={level} value={level}>
							{experienceLevelLabels[level]}
						</SelectItem>
					))}
				</SelectContent>
			</Select>

			<Select value={sortBy} onValueChange={(v) => onSortChange(v as "popular" | "rating" | "newest")}>
				<SelectTrigger className="w-36">
					<SelectValue placeholder={t`Trier par`} />
				</SelectTrigger>
				<SelectContent>
					<SelectItem value="popular">
						<Trans>Les plus utilisés</Trans>
					</SelectItem>
					<SelectItem value="rating">
						<Trans>Les mieux notés</Trans>
					</SelectItem>
					<SelectItem value="newest">
						<Trans>Nouveautés</Trans>
					</SelectItem>
				</SelectContent>
			</Select>

			{hasActiveFilters && (
				<Button variant="ghost" size="sm" className="gap-1" onClick={onClearFilters}>
					<XIcon className="size-4" />
					<Trans>Réinitialiser</Trans>
				</Button>
			)}
		</div>
	);
}

interface TemplatePreviewDialogProps {
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
	template: ResumeTemplate | null;
	favorites: Set<string>;
	renderStars: (rating: number, size?: "sm" | "md") => React.ReactElement;
	getTemplateReviews: (templateId: string) => ReturnType<typeof sampleReviews.filter>;
	onToggleFavorite: (templateId: string) => void;
	onApplyTemplate: (template: ResumeTemplate) => void;
}

export function TemplatePreviewDialog({
	isOpen,
	onOpenChange,
	template,
	favorites,
	renderStars,
	getTemplateReviews,
	onToggleFavorite,
	onApplyTemplate,
}: TemplatePreviewDialogProps) {
	const styleLabels = getStyleLabels();
	const industryLabels = getIndustryLabels();
	const experienceLevelLabels = getExperienceLevelLabels();

	return (
		<Dialog open={isOpen} onOpenChange={onOpenChange}>
			<DialogContent className="max-h-[90vh] max-w-5xl overflow-hidden">
				{template && (
					<>
						<DialogHeader>
							<DialogTitle className="flex items-center gap-3">
								<div className={cn("flex size-10 items-center justify-center rounded-lg", styleColors[template.style])}>
									{(() => {
										const StyleIcon = styleIcons[template.style];
										return <StyleIcon className="size-5" weight="duotone" />;
									})()}
								</div>
								<div className="flex flex-1 items-center justify-between">
									<span>{template.name}</span>
									<div className="flex items-center gap-2">
										{template.isNew && (
											<Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
												<Trans>Nouveau</Trans>
											</Badge>
										)}
										{template.isPremium && (
											<Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
												<CrownIcon className="mr-1 size-3" />
												<Trans>Premium</Trans>
											</Badge>
										)}
									</div>
								</div>
							</DialogTitle>
							<DialogDescription className="flex flex-wrap items-center gap-2">
								<Badge className={styleColors[template.style]}>{styleLabels[template.style]}</Badge>
								{template.industries.slice(0, 3).map((industry) => (
									<Badge key={industry} variant="outline">
										{industryLabels[industry]}
									</Badge>
								))}
							</DialogDescription>
						</DialogHeader>

						<div className="grid gap-6 md:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
							<div className="relative overflow-hidden rounded-xl border bg-zinc-100 p-3 dark:bg-zinc-900">
								<img
									src={template.previewImage}
									alt={template.name}
									loading="lazy"
									decoding="async"
									className="mx-auto aspect-page max-h-[64vh] w-full rounded-md bg-white object-contain object-top shadow-xl"
								/>
								<div className="absolute bottom-3 left-3 flex gap-1">
									{template.colors.map((color) => (
										<div
											key={color}
											className="size-6 rounded-full border-2 border-white shadow-lg"
											style={{ backgroundColor: color }}
										/>
									))}
								</div>
							</div>

							<ScrollArea className="max-h-[50vh]">
								<div className="space-y-6 pr-4">
									<div>
										<p className="text-muted-foreground">{template.description}</p>
									</div>

									<div className="flex items-center gap-3">
										{renderStars(template.rating, "md")}
										<span className="font-semibold">{template.rating}</span>
										<span className="text-muted-foreground text-sm">
											({template.reviewCount} <Trans>avis</Trans>)
										</span>
									</div>

									<div className="flex gap-6">
										<div>
											<p className="font-bold text-2xl">{template.downloadCount.toLocaleString("fr-FR")}</p>
											<p className="text-muted-foreground text-sm">
												<Trans>Utilisations</Trans>
											</p>
										</div>
									</div>

									<div>
										<h4 className="mb-3 font-semibold">
											<Trans>Points forts</Trans>
										</h4>
										<div className="space-y-2">
											{template.features.map((feature) => (
												<div key={feature} className="flex items-center gap-2">
													<CheckCircleIcon className="size-4 text-green-500" weight="fill" />
													<span className="text-sm">{feature}</span>
												</div>
											))}
										</div>
									</div>

									<div>
										<h4 className="mb-3 font-semibold">
											<Trans>Idéal pour</Trans>
										</h4>
										<div className="flex flex-wrap gap-2">
											{template.experienceLevel.map((level) => (
												<Badge key={level} className={experienceLevelColors[level]}>
													{experienceLevelLabels[level]}
												</Badge>
											))}
										</div>
									</div>

									<div>
										<h4 className="mb-3 font-semibold">
											<Trans>Tags</Trans>
										</h4>
										<div className="flex flex-wrap gap-2">
											{template.tags.map((tag) => (
												<Badge key={tag} variant="secondary">
													{tag}
												</Badge>
											))}
										</div>
									</div>

									<div>
										<h4 className="mb-3 font-semibold">
											<Trans>Avis récents</Trans>
										</h4>
										<div className="space-y-4">
											{getTemplateReviews(template.id)
												.slice(0, 2)
												.map((review) => (
													<div key={review.id} className="rounded-lg border p-4">
														<div className="mb-2 flex items-center justify-between">
															<div className="flex items-center gap-2">
																<div className="flex size-8 items-center justify-center rounded-full bg-primary/10">
																	<UserIcon className="size-4 text-primary" />
																</div>
																<span className="font-medium">{review.userName}</span>
															</div>
															{renderStars(review.rating)}
														</div>
														<p className="text-muted-foreground text-sm">{review.comment}</p>
													</div>
												))}
											{getTemplateReviews(template.id).length === 0 && (
												<p className="text-muted-foreground text-sm">
													<Trans>Aucun avis pour le moment.</Trans>
												</p>
											)}
										</div>
									</div>
								</div>
							</ScrollArea>
						</div>

						<DialogFooter className="gap-2 sm:gap-0">
							<DialogClose asChild>
								<Button variant="outline">
									<Trans>Fermer</Trans>
								</Button>
							</DialogClose>
							<Button variant="outline" className="gap-2" onClick={() => onToggleFavorite(template.id)}>
								<HeartIcon
									className={cn("size-4", favorites.has(template.id) && "text-red-500")}
									weight={favorites.has(template.id) ? "fill" : "regular"}
								/>
								{favorites.has(template.id) ? <Trans>Enregistré</Trans> : <Trans>Enregistrer</Trans>}
							</Button>
							<Button className="gap-2" onClick={() => onApplyTemplate(template)}>
								<CheckCircleIcon className="size-4" />
								<Trans>Utiliser ce modèle</Trans>
							</Button>
						</DialogFooter>
					</>
				)}
			</DialogContent>
		</Dialog>
	);
}

interface CompareDialogProps {
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
	compareTemplates: ResumeTemplate[];
	renderStars: (rating: number, size?: "sm" | "md") => React.ReactElement;
	onRemove: (templateId: string) => void;
	onApplyTemplate: (template: ResumeTemplate) => void;
}

export function CompareDialog({
	isOpen,
	onOpenChange,
	compareTemplates,
	renderStars,
	onRemove,
	onApplyTemplate,
}: CompareDialogProps) {
	const styleLabels = getStyleLabels();
	const industryLabels = getIndustryLabels();

	return (
		<Dialog open={isOpen} onOpenChange={onOpenChange}>
			<DialogContent className="max-h-[90vh] max-w-5xl overflow-hidden">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<ArrowsLeftRightIcon className="size-5" />
						<Trans>Comparer les modèles</Trans>
					</DialogTitle>
					<DialogDescription>
						<Trans>Compare jusqu'à 3 modèles pour choisir le plus adapté à ta candidature.</Trans>
					</DialogDescription>
				</DialogHeader>

				<ScrollArea className="max-h-[60vh]">
					<div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${compareTemplates.length}, 1fr)` }}>
						{compareTemplates.map((template) => (
							<div key={template.id} className="space-y-4">
								<div className="rounded-lg border p-4">
									<div className="mb-3 flex items-center justify-between">
										<h4 className="font-semibold">{template.name}</h4>
										<Button variant="ghost" size="sm" onClick={() => onRemove(template.id)}>
											<XIcon className="size-4" />
										</Button>
									</div>
									<img
										src={template.previewImage}
										alt={template.name}
										loading="lazy"
										decoding="async"
										className="aspect-page w-full rounded-lg border bg-white object-cover object-top"
									/>
								</div>

								<div className="rounded-lg border p-4">
									<p className="mb-2 font-medium text-muted-foreground text-sm">
										<Trans>Note</Trans>
									</p>
									<div className="flex items-center gap-2">
										{renderStars(template.rating)}
										<span className="font-semibold">{template.rating}</span>
									</div>
								</div>

								<div className="rounded-lg border p-4">
									<p className="mb-2 font-medium text-muted-foreground text-sm">
										<Trans>Utilisations</Trans>
									</p>
									<p className="font-semibold">{template.downloadCount.toLocaleString("fr-FR")}</p>
								</div>

								<div className="rounded-lg border p-4">
									<p className="mb-2 font-medium text-muted-foreground text-sm">
										<Trans>Style</Trans>
									</p>
									<Badge className={styleColors[template.style]}>{styleLabels[template.style]}</Badge>
								</div>

								<div className="rounded-lg border p-4">
									<p className="mb-2 font-medium text-muted-foreground text-sm">
										<Trans>Secteurs</Trans>
									</p>
									<div className="flex flex-wrap gap-1">
										{template.industries.map((industry) => (
											<Badge key={industry} variant="outline" className="text-xs">
												{industryLabels[industry]}
											</Badge>
										))}
									</div>
								</div>

								<div className="rounded-lg border p-4">
									<p className="mb-2 font-medium text-muted-foreground text-sm">
										<Trans>Points forts</Trans>
									</p>
									<div className="space-y-1">
										{template.features.map((feature) => (
											<div key={feature} className="flex items-center gap-1 text-xs">
												<CheckCircleIcon className="size-3 text-green-500" weight="fill" />
												{feature}
											</div>
										))}
									</div>
								</div>

								<Button className="w-full gap-2" onClick={() => onApplyTemplate(template)}>
									<Trans>Utiliser ce modèle</Trans>
								</Button>
							</div>
						))}
					</div>
				</ScrollArea>

				<DialogFooter>
					<DialogClose asChild>
						<Button variant="outline">
							<Trans>Fermer</Trans>
						</Button>
					</DialogClose>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

export function TemplateCard({
	template,
	index,
	isFavorite,
	isInCompare,
	onPreview,
	onUse,
	onToggleFavorite,
	onAddToCompare,
	renderStars,
	showTrendingBadge,
}: TemplateCardProps) {
	const styleLabels = getStyleLabels();
	const StyleIcon = styleIcons[template.style];

	return (
		<motion.div
			initial={false}
			animate={{ opacity: 1, scale: 1 }}
			exit={{ opacity: 0, scale: 0.95 }}
			transition={{ delay: index * 0.05 }}
			layout
		>
			<Card className="group h-full overflow-hidden border bg-background transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl">
				<div className="relative bg-zinc-100 p-3 dark:bg-zinc-900">
					<div className="overflow-hidden rounded-lg border bg-white shadow-sm">
						<img
							src={template.previewImage}
							alt={template.name}
							loading="lazy"
							decoding="async"
							className="aspect-page w-full object-cover object-top transition-transform duration-300 group-hover:scale-[1.025]"
						/>
					</div>

					<div className="absolute inset-3 flex items-center justify-center gap-2 rounded-lg bg-black/50 opacity-0 backdrop-blur-[2px] transition-opacity group-hover:opacity-100">
						<Button size="sm" variant="secondary" className="gap-1" onClick={onPreview}>
							<EyeIcon className="size-4" />
							<Trans>Aperçu</Trans>
						</Button>
					</div>

					<div className="absolute top-3 left-3 flex flex-col gap-2">
						{(template.isTrending || showTrendingBadge) && (
							<Badge className="bg-amber-500 text-white">
								<TrendUpIcon className="mr-1 size-3" />
								<Trans>Populaire</Trans>
							</Badge>
						)}
						{template.isNew && (
							<Badge className="bg-green-500 text-white">
								<SparkleIcon className="mr-1 size-3" />
								<Trans>Nouveau</Trans>
							</Badge>
						)}
						{template.isPremium && (
							<Badge className="bg-amber-600 text-white">
								<CrownIcon className="mr-1 size-3" />
								<Trans>Premium</Trans>
							</Badge>
						)}
					</div>

					<Tooltip>
						<TooltipTrigger asChild>
							<button
								onClick={(e) => {
									e.stopPropagation();
									onToggleFavorite();
								}}
								className="absolute top-3 right-3 flex size-8 items-center justify-center rounded-full bg-white/90 shadow-lg transition-all hover:scale-110 dark:bg-gray-800/90"
							>
								<HeartIcon
									className={cn("size-4", isFavorite ? "text-red-500" : "text-gray-600 dark:text-gray-300")}
									weight={isFavorite ? "fill" : "regular"}
								/>
							</button>
						</TooltipTrigger>
						<TooltipContent>
							{isFavorite ? <Trans>Retirer des favoris</Trans> : <Trans>Ajouter aux favoris</Trans>}
						</TooltipContent>
					</Tooltip>

					<div className="absolute bottom-3 left-3 flex gap-1">
						{template.colors.slice(0, 3).map((color) => (
							<div
								key={color}
								className="size-5 rounded-full border-2 border-white shadow-md"
								style={{ backgroundColor: color }}
							/>
						))}
					</div>
				</div>

				<CardHeader className="pb-2">
					<div className="mb-1 flex min-w-0 items-start justify-between gap-3">
						<div className="min-w-0">
							<CardTitle className="truncate text-lg transition-colors group-hover:text-primary">
								{template.name}
							</CardTitle>
							<div className="mt-1 flex items-center gap-1.5 text-muted-foreground text-xs">
								<StyleIcon className="size-3.5" weight="duotone" />
								<span>{styleLabels[template.style]}</span>
							</div>
						</div>
						<Badge className={cn("shrink-0", styleColors[template.style])}>CV</Badge>
					</div>
					<CardDescription className="line-clamp-2">{template.description}</CardDescription>
				</CardHeader>

				<CardContent className="pt-0">
					<div className="mb-3 flex items-center justify-between">
						<div className="flex items-center gap-2">
							{renderStars(template.rating)}
							<span className="font-medium text-sm">{template.rating}</span>
							<span className="text-muted-foreground text-xs">({template.reviewCount})</span>
						</div>
						<div className="flex items-center gap-1 text-muted-foreground text-xs">
							<DownloadSimpleIcon className="size-3" />
							{template.downloadCount.toLocaleString("fr-FR")}
						</div>
					</div>

					<div className="flex flex-wrap gap-1">
						{template.tags.slice(0, 3).map((tag) => (
							<Badge key={tag} variant="secondary" className="text-xs">
								{tag}
							</Badge>
						))}
					</div>
				</CardContent>

				<CardFooter className="gap-2 pt-0">
					<Button variant="outline" size="sm" className="flex-1 gap-1" onClick={onAddToCompare} disabled={isInCompare}>
						<ArrowsLeftRightIcon className="size-4" />
						{isInCompare ? <Trans>Ajouté</Trans> : <Trans>Comparer</Trans>}
					</Button>
					<Button size="sm" className="flex-1 gap-1" onClick={onUse}>
						<CheckCircleIcon className="size-4" />
						<Trans>Utiliser</Trans>
					</Button>
				</CardFooter>
			</Card>
		</motion.div>
	);
}
