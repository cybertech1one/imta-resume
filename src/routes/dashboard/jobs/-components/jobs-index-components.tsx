import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import {
	ArrowRightIcon,
	BriefcaseIcon,
	BuildingsIcon,
	CalendarIcon,
	ChartLineUpIcon,
	CheckCircleIcon,
	CurrencyCircleDollarIcon,
	EnvelopeIcon,
	FactoryIcon,
	FirstAidKitIcon,
	FunnelIcon,
	GearIcon,
	HardHatIcon,
	HospitalIcon,
	LightningIcon,
	MagnifyingGlassIcon,
	MapPinIcon,
	NoteIcon,
	NotePencilIcon,
	PencilSimpleIcon,
	SparkleIcon,
	StarIcon,
	TrendUpIcon,
	TrophyIcon,
	UserCircleIcon,
	XIcon,
} from "@phosphor-icons/react";
import { AnimatePresence, motion } from "motion/react";
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
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/utils/style";

import { getApplicationStatusConfig, getExperienceLevels, getFieldConfig, regions } from "./jobs-index-config";
import type { Application, Employer, Job, MarketInsight } from "./jobs-index-types";

// ---------------------------------------------------------------------------
// HeroSection
// ---------------------------------------------------------------------------
export function HeroSection({
	allJobsCount,
	employerCount,
	featuredJobsCount,
}: {
	allJobsCount: number;
	employerCount: number;
	featuredJobsCount: number;
}) {
	return (
		<motion.section
			className="relative mb-8 overflow-hidden rounded-2xl border bg-card p-6 shadow-sm md:p-8"
			initial={false}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.6, ease: "easeOut" }}
			aria-labelledby="jobs-hero-heading"
		>
			<div className="relative z-10">
				<motion.div
					className="mb-3 flex items-center gap-2"
					initial={false}
					animate={{ opacity: 1, x: 0 }}
					transition={{ delay: 0.2 }}
				>
					<BriefcaseIcon className="size-5 text-primary" weight="fill" aria-hidden="true" />
					<span className="font-semibold text-primary text-sm uppercase tracking-wider">
						<Trans>Marché marocain de l'emploi</Trans>
					</span>
				</motion.div>

				<motion.h2
					id="jobs-hero-heading"
					className="mb-4 max-w-4xl font-bold text-3xl tracking-tight md:text-4xl"
					initial={false}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.3 }}
				>
					<Trans>Offres de stage et emploi</Trans>
				</motion.h2>

				<motion.p
					className="mb-8 max-w-2xl text-lg text-muted-foreground"
					initial={false}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.4 }}
				>
					<Trans>
						Consulte les offres publiées par nos partenaires au Maroc dans la santé, l'industrie, le HSE et les métiers
						opérationnels. Filtre par domaine, région et niveau pour trouver une opportunité adaptée à ton profil.
					</Trans>
				</motion.p>

				{/* Quick Stats in Hero */}
				<motion.div
					className="flex flex-wrap items-center gap-6"
					initial={false}
					animate={{ opacity: 1 }}
					transition={{ delay: 0.5 }}
					role="list"
					aria-label={t`Statistiques rapides`}
				>
					<div className="flex items-center gap-2" role="listitem">
						<div className="flex size-10 items-center justify-center rounded-full bg-primary/10" aria-hidden="true">
							<BriefcaseIcon className="size-5 text-primary" weight="duotone" />
						</div>
						<div>
							<p className="font-bold text-xl" aria-label={t`${allJobsCount} offres actives`}>
								{allJobsCount}
							</p>
							<p className="text-muted-foreground text-sm">
								<Trans>Offres actives</Trans>
							</p>
						</div>
					</div>
					<div className="flex items-center gap-2" role="listitem">
						<div className="flex size-10 items-center justify-center rounded-full bg-green-500/10" aria-hidden="true">
							<BuildingsIcon className="size-5 text-green-500" weight="duotone" />
						</div>
						<div>
							<p className="font-bold text-xl" aria-label={t`${employerCount} employeurs`}>
								{employerCount}
							</p>
							<p className="text-muted-foreground text-sm">
								<Trans>Employeurs</Trans>
							</p>
						</div>
					</div>
					<div className="flex items-center gap-2" role="listitem">
						<div className="flex size-10 items-center justify-center rounded-full bg-amber-500/10" aria-hidden="true">
							<StarIcon className="size-5 text-amber-500" weight="duotone" />
						</div>
						<div>
							<p className="font-bold text-xl" aria-label={t`${featuredJobsCount} offres à la une`}>
								{featuredJobsCount}
							</p>
							<p className="text-muted-foreground text-sm">
								<Trans>À la une</Trans>
							</p>
						</div>
					</div>
				</motion.div>
			</div>
		</motion.section>
	);
}

// ---------------------------------------------------------------------------
// FeaturedJobsSection
// ---------------------------------------------------------------------------
export function FeaturedJobsSection({
	featuredJobs,
	onJobClick,
}: {
	featuredJobs: Job[];
	onJobClick: (job: Job) => void;
}) {
	return (
		<section>
			<h3 className="mb-6 flex items-center gap-2 font-semibold text-2xl">
				<StarIcon className="size-6 text-amber-500" weight="fill" />
				<Trans>Offres à la une</Trans>
			</h3>

			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
				{featuredJobs.map((job, index) => {
					const field = getFieldConfig()[job.field];
					const FieldIcon = field.icon;

					return (
						<motion.div key={job.id} initial={false} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
							<Card
								className={cn(
									"group h-full overflow-hidden border-2 transition-[border-color,box-shadow] duration-200 hover:border-primary/50 hover:shadow-lg",
									"bg-gradient-to-br",
									field.gradient,
									job.urgent && "border-red-500/50",
								)}
							>
								<CardHeader className="pb-3">
									<div className="mb-2 flex items-start justify-between">
										<div className={cn("flex size-12 items-center justify-center rounded-xl", field.color)}>
											<FieldIcon className="size-6" weight="duotone" />
										</div>
										<div className="flex gap-2">
											{job.urgent && (
												<Badge className="gap-1 bg-red-500 text-white">
													<LightningIcon className="size-3" weight="fill" />
													<Trans>Urgent</Trans>
												</Badge>
											)}
											<Badge variant="secondary" className={field.color}>
												{field.label}
											</Badge>
										</div>
									</div>
									<CardTitle className="line-clamp-1 text-lg transition-colors group-hover:text-primary">
										{job.title}
									</CardTitle>
									<CardDescription className="flex items-center gap-2">
										<BuildingsIcon className="size-4" />
										{job.company}
									</CardDescription>
								</CardHeader>
								<CardContent className="space-y-3 pt-0">
									<div className="flex items-center gap-2 text-muted-foreground text-sm">
										<MapPinIcon className="size-4" />
										{job.location}
									</div>
									{job.salaryMin && job.salaryMax && (
										<div className="flex items-center gap-2 font-medium text-green-600 text-sm dark:text-green-400">
											<CurrencyCircleDollarIcon className="size-4" />
											{job.salaryMin.toLocaleString("fr-FR")} - {job.salaryMax.toLocaleString("fr-FR")} {job.currency}
										</div>
									)}
									<div className="flex items-center gap-2 text-muted-foreground text-xs">
										<CalendarIcon className="size-4" />
										<Trans>Publié le</Trans> {new Date(job.postedDate).toLocaleDateString("fr-FR")}
									</div>
								</CardContent>
								<CardFooter className="pt-2">
									<Button variant="outline" className="w-full gap-2" size="sm" onClick={() => onJobClick(job)}>
										<Trans>Voir les détails</Trans>
										<ArrowRightIcon className="size-4" />
									</Button>
								</CardFooter>
							</Card>
						</motion.div>
					);
				})}
			</div>
		</section>
	);
}

// ---------------------------------------------------------------------------
// JobFiltersSection
// ---------------------------------------------------------------------------
export function JobFiltersSection({
	searchQuery,
	onSearchChange,
	fieldFilter,
	onFieldFilterChange,
	regionFilter,
	onRegionFilterChange,
	experienceFilter,
	onExperienceFilterChange,
	hasActiveFilters,
	onClearFilters,
}: {
	searchQuery: string;
	onSearchChange: (value: string) => void;
	fieldFilter: string;
	onFieldFilterChange: (value: string) => void;
	regionFilter: string;
	onRegionFilterChange: (value: string) => void;
	experienceFilter: string;
	onExperienceFilterChange: (value: string) => void;
	hasActiveFilters: boolean;
	onClearFilters: () => void;
}) {
	return (
		<section className="rounded-xl border bg-muted/30 p-4" aria-labelledby="filters-heading">
			<h3 id="filters-heading" className="sr-only">
				<Trans>Filtres des offres</Trans>
			</h3>
			<div className="flex flex-col gap-4 md:flex-row md:items-center">
				<div className="flex items-center gap-2">
					<FunnelIcon className="size-5 text-muted-foreground" aria-hidden="true" />
					<span className="font-medium text-sm">
						<Trans>Filtrer :</Trans>
					</span>
				</div>

				<div className="flex flex-1 flex-col gap-3 md:flex-row" role="search">
					{/* Search */}
					<div className="relative flex-1">
						<MagnifyingGlassIcon
							className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
							aria-hidden="true"
						/>
						<Input
							placeholder={t`Rechercher un poste ou une entreprise`}
							value={searchQuery}
							onChange={(e) => onSearchChange(e.target.value)}
							className="pl-10"
							aria-label={t`Rechercher une offre ou une entreprise`}
						/>
					</div>

					{/* Field Filter */}
					<Select value={fieldFilter} onValueChange={onFieldFilterChange}>
						<SelectTrigger className="w-full md:w-40">
							<SelectValue placeholder={t`Domaine`} />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">
								<Trans>Tous les domaines</Trans>
							</SelectItem>
							<SelectItem value="healthcare">
								<div className="flex items-center gap-2">
									<FirstAidKitIcon className="size-4" />
									<Trans>Santé</Trans>
								</div>
							</SelectItem>
							<SelectItem value="industrial">
								<div className="flex items-center gap-2">
									<GearIcon className="size-4" />
									<Trans>Industrie</Trans>
								</div>
							</SelectItem>
							<SelectItem value="hse">
								<div className="flex items-center gap-2">
									<HardHatIcon className="size-4" />
									<Trans>HSE</Trans>
								</div>
							</SelectItem>
							<SelectItem value="general">
								<div className="flex items-center gap-2">
									<BriefcaseIcon className="size-4" />
									<Trans>Général</Trans>
								</div>
							</SelectItem>
						</SelectContent>
					</Select>

					{/* Region Filter */}
					<Select value={regionFilter} onValueChange={onRegionFilterChange}>
						<SelectTrigger className="w-full md:w-40">
							<SelectValue placeholder={t`Région`} />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">
								<Trans>Toutes les régions</Trans>
							</SelectItem>
							{regions.map((region) => (
								<SelectItem key={region} value={region}>
									<div className="flex items-center gap-2">
										<MapPinIcon className="size-4" />
										{region}
									</div>
								</SelectItem>
							))}
						</SelectContent>
					</Select>

					{/* Experience Filter */}
					<Select value={experienceFilter} onValueChange={onExperienceFilterChange}>
						<SelectTrigger className="w-full md:w-40">
							<SelectValue placeholder={t`Expérience`} />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">
								<Trans>Tous les niveaux</Trans>
							</SelectItem>
							{Object.entries(getExperienceLevels()).map(([key, { label }]) => (
								<SelectItem key={key} value={key}>
									{label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>

				{hasActiveFilters && (
					<Button
						variant="ghost"
						size="sm"
						className="gap-1"
						onClick={onClearFilters}
						aria-label={t`Effacer tous les filtres`}
					>
						<XIcon className="size-4" aria-hidden="true" />
						<Trans>Effacer</Trans>
					</Button>
				)}
			</div>
		</section>
	);
}

// ---------------------------------------------------------------------------
// JobListingsGrid
// ---------------------------------------------------------------------------
export function JobListingsGrid({
	filteredJobs,
	applications,
	onJobClick,
	onApply,
	onClearFilters,
}: {
	filteredJobs: Job[];
	applications: Application[];
	onJobClick: (job: Job) => void;
	onApply: (job: Job) => void;
	onClearFilters: () => void;
}) {
	return (
		<>
			{/* Results count */}
			<p className="text-muted-foreground text-sm" aria-live="polite" aria-atomic="true">
				{filteredJobs.length} <Trans>offres trouvées</Trans>
			</p>

			{/* Job Listings Grid */}
			<div className="grid gap-4 md:grid-cols-2" role="list" aria-label={t`Liste des offres`}>
				<AnimatePresence mode="popLayout">
					{filteredJobs.map((job, index) => {
						const field = getFieldConfig()[job.field];
						const FieldIcon = field.icon;
						const isApplied = applications.some((app) => app.jobId === job.id);

						return (
							<motion.article
								key={job.id}
								initial={{ opacity: 0, scale: 0.95 }}
								animate={{ opacity: 1, scale: 1 }}
								exit={{ opacity: 0, scale: 0.95 }}
								transition={{ delay: index * 0.02 }}
								layout
								role="listitem"
							>
								<Card
									className={cn(
										"group h-full transition-[border-color,box-shadow] duration-200 hover:border-primary/50 hover:shadow-lg",
										job.urgent && "border-red-500/30",
									)}
								>
									<CardContent className="p-4">
										<div className="flex gap-4">
											<div
												className={cn("flex size-14 shrink-0 items-center justify-center rounded-xl", field.color)}
												aria-hidden="true"
											>
												<FieldIcon className="size-7" weight="duotone" />
											</div>
											<div className="min-w-0 flex-1">
												<div className="mb-1 flex flex-wrap items-start justify-between gap-2">
													<h3 className="line-clamp-1 font-semibold text-lg transition-colors group-hover:text-primary">
														{job.title}
													</h3>
													<div className="flex gap-1">
														{job.urgent && (
															<Badge className="gap-1 bg-red-500 text-white text-xs">
																<LightningIcon className="size-3" weight="fill" />
																<Trans>Urgent</Trans>
															</Badge>
														)}
														<Badge className={cn("text-xs", field.color)}>{field.label}</Badge>
													</div>
												</div>
												<p className="mb-2 flex items-center gap-1 text-muted-foreground text-sm">
													<BuildingsIcon className="size-4 shrink-0" />
													{job.company}
												</p>
												<div className="flex flex-wrap gap-3 text-sm">
													<span className="flex items-center gap-1 text-muted-foreground">
														<MapPinIcon className="size-4" />
														{job.location}
													</span>
													<span className="flex items-center gap-1 text-muted-foreground">
														<UserCircleIcon className="size-4" />
														{getExperienceLevels()[job.experienceLevel].label}
													</span>
													{job.salaryMin && job.salaryMax && (
														<span className="flex items-center gap-1 font-medium text-green-600 dark:text-green-400">
															<CurrencyCircleDollarIcon className="size-4" />
															{job.salaryMin.toLocaleString("fr-FR")} - {job.salaryMax.toLocaleString("fr-FR")}{" "}
															{job.currency}
														</span>
													)}
												</div>
											</div>
										</div>
										<div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
											<span className="text-muted-foreground text-xs">
												<CalendarIcon className="mr-1 inline size-3" />
												{new Date(job.postedDate).toLocaleDateString("fr-FR")}
											</span>
											<div className="flex flex-wrap items-center gap-2">
												<Button size="sm" variant="outline" className="gap-1" onClick={() => onJobClick(job)}>
													<Trans>Détails</Trans>
												</Button>
												{isApplied ? (
													<Badge variant="outline" className="gap-1 text-green-600">
														<CheckCircleIcon className="size-3" weight="fill" />
														<Trans>Candidature envoyée</Trans>
													</Badge>
												) : (
													<Button
														size="sm"
														variant="default"
														className="gap-1"
														onClick={() => {
															onApply(job);
														}}
													>
														<EnvelopeIcon className="size-4" />
														<Trans>Postuler</Trans>
													</Button>
												)}
											</div>
										</div>
									</CardContent>
								</Card>
							</motion.article>
						);
					})}
				</AnimatePresence>
			</div>

			{filteredJobs.length === 0 && (
				<Card className="border-dashed">
					<CardContent className="flex flex-col items-center justify-center py-12">
						<MagnifyingGlassIcon className="mb-4 size-12 text-muted-foreground" />
						<h3 className="mb-2 font-semibold text-lg">
							<Trans>Aucune offre trouvée</Trans>
						</h3>
						<p className="text-muted-foreground">
							<Trans>Essaie de modifier les filtres ou la recherche.</Trans>
						</p>
						<Button variant="outline" className="mt-4" onClick={onClearFilters}>
							<Trans>Effacer les filtres</Trans>
						</Button>
					</CardContent>
				</Card>
			)}
		</>
	);
}

// ---------------------------------------------------------------------------
// EmployersTab
// ---------------------------------------------------------------------------
export function EmployersTab({
	featuredEmployers,
	onViewEmployerJobs,
}: {
	featuredEmployers: Employer[];
	onViewEmployerJobs: (employerName: string) => void;
}) {
	return (
		<>
			<section>
				<h3 className="mb-2 font-semibold text-2xl">
					<Trans>Employeurs partenaires</Trans>
				</h3>
				<p className="mb-6 text-muted-foreground">
					<Trans>
						Découvre les entreprises partenaires au Maroc qui recrutent dans la santé, l'industrie, le HSE et les
						métiers opérationnels.
					</Trans>
				</p>

				<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
					{featuredEmployers.map((employer, index) => (
						<motion.div
							key={employer.id}
							initial={false}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: index * 0.05 }}
						>
							<Card
								className={cn(
									"group h-full transition-[border-color,box-shadow] duration-200 hover:border-primary/40 hover:shadow-lg",
									employer.featured && "border-2 border-primary/30",
								)}
							>
								<CardHeader className="pb-3">
									<div className="mb-3 flex items-center justify-between">
										<div className="flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5">
											{employer.industry.toLowerCase().includes("healthcare") ||
											employer.industry.toLowerCase().includes("sante") ||
											employer.industry.toLowerCase().includes("santé") ? (
												<HospitalIcon className="size-8 text-red-500" weight="duotone" />
											) : employer.industry.includes("HSE") ? (
												<HardHatIcon className="size-8 text-amber-500" weight="duotone" />
											) : employer.industry.includes("Automotive") || employer.industry.includes("Automobile") ? (
												<GearIcon className="size-8 text-blue-500" weight="duotone" />
											) : (
												<FactoryIcon className="size-8 text-primary" weight="duotone" />
											)}
										</div>
										{employer.featured && (
											<Badge className="gap-1 bg-amber-500 text-white">
												<StarIcon className="size-3" weight="fill" />
												<Trans>Mis en avant</Trans>
											</Badge>
										)}
									</div>
									<CardTitle className="text-xl">{employer.name}</CardTitle>
									<CardDescription>{employer.industry}</CardDescription>
								</CardHeader>
								<CardContent className="space-y-3 pt-0">
									<p className="line-clamp-2 text-muted-foreground text-sm">{employer.description}</p>
									<div className="flex items-center gap-2 text-muted-foreground text-sm">
										<MapPinIcon className="size-4" />
										{employer.location}
									</div>
									<div className="flex items-center gap-2 font-medium text-green-600 dark:text-green-400">
										<BriefcaseIcon className="size-4" />
										{employer.openPositions} <Trans>postes ouverts</Trans>
									</div>
								</CardContent>
								<CardFooter className="pt-2">
									<Button variant="outline" className="w-full gap-2" onClick={() => onViewEmployerJobs(employer.name)}>
										<Trans>Voir les offres</Trans>
										<ArrowRightIcon className="size-4" />
									</Button>
								</CardFooter>
							</Card>
						</motion.div>
					))}
				</div>
			</section>

			{/* Industry breakdown - derived from employer data */}
			<section>
				<h3 className="mb-6 flex items-center gap-2 font-semibold text-xl">
					<ChartLineUpIcon className="size-5 text-primary" weight="duotone" />
					<Trans>Répartition par secteur</Trans>
				</h3>

				<div className="grid gap-4 md:grid-cols-3">
					{(["healthcare", "industrial", "hse"] as const).map((fieldKey) => {
						const config = getFieldConfig()[fieldKey];
						const SectorIcon = config.icon;
						const employerCount = featuredEmployers.filter((e) =>
							e.industry?.toLowerCase().includes(config.label.toLowerCase()),
						).length;

						return (
							<Card key={fieldKey} className="transition-shadow hover:shadow-md">
								<CardContent className="flex items-center gap-4 p-6">
									<div className={cn("flex size-14 items-center justify-center rounded-xl", config.color)}>
										<SectorIcon className="size-7" weight="duotone" />
									</div>
									<div className="flex-1">
										<h4 className="font-semibold text-lg">{config.label}</h4>
										<p className="text-muted-foreground text-sm">
											{employerCount} <Trans>employeurs partenaires</Trans>
										</p>
									</div>
								</CardContent>
							</Card>
						);
					})}
				</div>
			</section>
		</>
	);
}

// ---------------------------------------------------------------------------
// ApplicationsTab
// ---------------------------------------------------------------------------
export function ApplicationsTab({
	applications,
	editingNotes,
	notesText,
	onSetEditingNotes,
	onSetNotesText,
	onUpdateStatus,
	onSaveNotes,
	onGoToJobs,
}: {
	applications: Application[];
	editingNotes: string | null;
	notesText: string;
	onSetEditingNotes: (id: string | null) => void;
	onSetNotesText: (text: string) => void;
	onUpdateStatus: (appId: string, status: Application["status"]) => void;
	onSaveNotes: (appId: string) => void;
	onGoToJobs: () => void;
}) {
	return (
		<section>
			<div className="mb-6 flex items-center justify-between">
				<div>
					<h3 className="flex items-center gap-2 font-semibold text-2xl">
						<NoteIcon className="size-6 text-primary" weight="duotone" />
						<Trans>Mes candidatures</Trans>
					</h3>
					<p className="mt-1 text-muted-foreground">
						<Trans>Suis le statut de tes candidatures et garde tes notes au même endroit.</Trans>
					</p>
				</div>
			</div>

			{/* Application Stats */}
			<div className="mb-6 grid gap-4 md:grid-cols-4">
				{Object.entries(getApplicationStatusConfig()).map(([status, config]) => {
					const count = applications.filter((a) => a.status === status).length;
					const StatusIcon = config.icon;

					return (
						<Card key={status} className="transition-shadow hover:shadow-md">
							<CardContent className="flex items-center gap-3 p-4">
								<div className={cn("flex size-10 items-center justify-center rounded-lg", config.color)}>
									<StatusIcon className="size-5" weight="duotone" />
								</div>
								<div>
									<p className="font-bold text-2xl">{count}</p>
									<p className="text-muted-foreground text-sm">{config.label}</p>
								</div>
							</CardContent>
						</Card>
					);
				})}
			</div>

			{/* Applications List */}
			{applications.length > 0 ? (
				<div className="space-y-4">
					{applications.map((app, index) => {
						const statusConfig = getApplicationStatusConfig()[app.status];
						const StatusIcon = statusConfig.icon;

						return (
							<motion.div
								key={app.id}
								initial={false}
								animate={{ opacity: 1, x: 0 }}
								transition={{ delay: index * 0.05 }}
							>
								<Card className="transition-shadow hover:shadow-md">
									<CardContent className="p-4">
										<div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
											<div className="flex items-start gap-4">
												<div className={cn("flex size-12 items-center justify-center rounded-xl", statusConfig.color)}>
													<StatusIcon className="size-6" weight="duotone" />
												</div>
												<div>
													<h4 className="font-semibold text-lg">{app.jobTitle}</h4>
													<p className="text-muted-foreground">{app.company}</p>
													<p className="mt-1 text-muted-foreground text-sm">
														<CalendarIcon className="mr-1 inline size-3" />
														<Trans>Envoyée le</Trans> {new Date(app.appliedDate).toLocaleDateString("fr-FR")}
													</p>
												</div>
											</div>

											<div className="flex flex-col items-end gap-2">
												<Select
													value={app.status}
													onValueChange={(v) => onUpdateStatus(app.id, v as Application["status"])}
												>
													<SelectTrigger className="w-40">
														<SelectValue />
													</SelectTrigger>
													<SelectContent>
														{Object.entries(getApplicationStatusConfig()).map(([key, { label }]) => (
															<SelectItem key={key} value={key}>
																{label}
															</SelectItem>
														))}
													</SelectContent>
												</Select>
											</div>
										</div>

										{/* Notes section */}
										<div className="mt-4 rounded-lg bg-muted/50 p-3">
											{editingNotes === app.id ? (
												<div className="space-y-2">
													<Textarea
														placeholder={t`Ajouter une note : date d'entretien, contact, relance...`}
														value={notesText}
														onChange={(e) => onSetNotesText(e.target.value)}
														rows={2}
													/>
													<div className="flex gap-2">
														<Button size="sm" onClick={() => onSaveNotes(app.id)}>
															<CheckCircleIcon className="mr-1 size-4" />
															<Trans>Enregistrer</Trans>
														</Button>
														<Button
															size="sm"
															variant="ghost"
															onClick={() => {
																onSetEditingNotes(null);
																onSetNotesText("");
															}}
														>
															<Trans>Annuler</Trans>
														</Button>
													</div>
												</div>
											) : (
												<div className="flex items-start justify-between">
													<div>
														<Label className="flex items-center gap-1 text-muted-foreground text-xs">
															<NotePencilIcon className="size-3" />
															<Trans>Notes</Trans>
														</Label>
														<p className="mt-1 text-sm">
															{app.notes || (
																<span className="text-muted-foreground italic">
																	<Trans>Aucune note</Trans>
																</span>
															)}
														</p>
													</div>
													<Button
														size="sm"
														variant="ghost"
														onClick={() => {
															onSetEditingNotes(app.id);
															onSetNotesText(app.notes);
														}}
														aria-label={t`Modifier la note`}
													>
														<PencilSimpleIcon className="size-4" />
													</Button>
												</div>
											)}
										</div>
									</CardContent>
								</Card>
							</motion.div>
						);
					})}
				</div>
			) : (
				<motion.div
					initial={false}
					animate={{ opacity: 1, y: 0 }}
					className="flex flex-col items-center justify-center py-16 text-center"
				>
					<BriefcaseIcon className="mb-4 size-12 text-muted-foreground/50" weight="duotone" />
					<h3 className="mb-2 font-semibold text-lg">
						<Trans>Aucune candidature pour le moment</Trans>
					</h3>
					<p className="mb-6 max-w-sm text-muted-foreground text-sm">
						<Trans>Ajoute tes candidatures ici pour suivre les relances, les entretiens et les réponses.</Trans>
					</p>
					<Button onClick={onGoToJobs}>
						<BriefcaseIcon className="mr-2 size-4" />
						<Trans>Voir les offres</Trans>
					</Button>
				</motion.div>
			)}
		</section>
	);
}

// ---------------------------------------------------------------------------
// InsightsTab
// ---------------------------------------------------------------------------
export function InsightsTab({
	marketInsights,
	allJobs,
	featuredEmployers,
}: {
	marketInsights: MarketInsight[];
	allJobs: Job[];
	featuredEmployers: Employer[];
}) {
	return (
		<>
			<section>
				<h3 className="mb-2 font-semibold text-2xl">
					<Trans>Tendances du marché</Trans>
				</h3>
				<p className="mb-6 text-muted-foreground">
					<Trans>Vue d'ensemble des secteurs qui recrutent pour les profils étudiants et jeunes diplômés.</Trans>
				</p>

				{/* Key Metrics */}
				<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
					{marketInsights.map((insight, index) => {
						const InsightIcon = insight.icon;

						return (
							<motion.div
								key={insight.id}
								initial={false}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: index * 0.1 }}
							>
								<Card className="h-full transition-shadow duration-200 hover:shadow-lg">
									<CardContent className="p-6">
										<div className="mb-4 flex items-center justify-between">
											<div
												className={cn(
													"flex size-12 items-center justify-center rounded-xl",
													insight.trend === "up" && "bg-green-100 text-green-600 dark:bg-green-900/30",
													insight.trend === "down" && "bg-red-100 text-red-600 dark:bg-red-900/30",
													insight.trend === "stable" && "bg-blue-100 text-blue-600 dark:bg-blue-900/30",
												)}
											>
												<InsightIcon className="size-6" weight="duotone" />
											</div>
											{insight.change && (
												<Badge
													className={cn(
														insight.trend === "up" && "bg-green-500 text-white",
														insight.trend === "down" && "bg-red-500 text-white",
														insight.trend === "stable" && "bg-blue-500 text-white",
													)}
												>
													{insight.change}
												</Badge>
											)}
										</div>
										<h4 className="mb-1 font-medium text-muted-foreground">{insight.title}</h4>
										<p className="mb-2 font-bold text-3xl">{insight.value}</p>
										<p className="text-muted-foreground text-sm">{insight.description}</p>
									</CardContent>
								</Card>
							</motion.div>
						);
					})}
				</div>
			</section>

			{/* Salary Trends - links to detailed insights page */}
			<section>
				<h3 className="mb-6 flex items-center gap-2 font-semibold text-xl">
					<CurrencyCircleDollarIcon className="size-5 text-primary" weight="duotone" />
					<Trans>Tendances salariales par secteur</Trans>
				</h3>

				<Card>
					<CardContent className="flex flex-col items-center justify-center py-8">
						<CurrencyCircleDollarIcon className="mb-4 size-12 text-muted-foreground" />
						<h4 className="mb-2 font-semibold text-lg">
							<Trans>Analyse salariale détaillée</Trans>
						</h4>
						<p className="mb-4 text-center text-muted-foreground">
							<Trans>Consulte la page d'analyse pour comparer les données par secteur et région.</Trans>
						</p>
						<Button variant="outline" onClick={() => window.location.assign("/dashboard/jobs/insights")}>
							<ChartLineUpIcon className="mr-2 size-4" />
							<Trans>Voir l'analyse</Trans>
						</Button>
					</CardContent>
				</Card>
			</section>

			{/* Top Hiring Companies */}
			<section>
				<h3 className="mb-6 flex items-center gap-2 font-semibold text-xl">
					<TrophyIcon className="size-5 text-amber-500" weight="fill" />
					<Trans>Employeurs mis en avant</Trans>
				</h3>

				<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
					{featuredEmployers
						.filter((e) => e.featured)
						.slice(0, 4)
						.map((employer, index) => (
							<motion.div
								key={employer.id}
								initial={false}
								animate={{ opacity: 1, scale: 1 }}
								transition={{ delay: index * 0.1 }}
							>
								<Card className="h-full transition-shadow hover:shadow-md">
									<CardContent className="p-4">
										<div className="mb-3 flex items-center justify-between">
											<Badge variant="outline" className="gap-1">
												#{index + 1}
											</Badge>
											<TrendUpIcon className="size-4 text-green-500" weight="bold" />
										</div>
										<h4 className="font-semibold">{employer.name}</h4>
										<p className="text-muted-foreground text-sm">{employer.industry}</p>
										<p className="mt-2 font-medium text-green-600 dark:text-green-400">
											{employer.openPositions} <Trans>postes ouverts</Trans>
										</p>
									</CardContent>
								</Card>
							</motion.div>
						))}
				</div>
			</section>

			{/* Most In-Demand Fields - derived from market insights */}
			<section>
				<h3 className="mb-6 flex items-center gap-2 font-semibold text-xl">
					<SparkleIcon className="size-5 text-primary" weight="fill" />
					<Trans>Domaines les plus demandés</Trans>
				</h3>

				<div className="grid gap-4 md:grid-cols-3">
					{(["hse", "healthcare", "industrial"] as const).map((fieldKey, index) => {
						const config = getFieldConfig()[fieldKey];
						const SectorIcon = config.icon;
						const jobCount = allJobs.filter((j) => j.field === fieldKey).length;

						return (
							<motion.div
								key={fieldKey}
								initial={false}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: index * 0.1 }}
							>
								<Card className={cn("h-full bg-gradient-to-br", config.gradient)}>
									<CardContent className="p-6">
										<div className="mb-4 flex items-center justify-between">
											<div className={cn("flex size-12 items-center justify-center rounded-xl", config.color)}>
												<SectorIcon className="size-6" weight="duotone" />
											</div>
											<Badge variant="secondary">
												{jobCount} <Trans>offres</Trans>
											</Badge>
										</div>
										<h4 className="mb-2 font-semibold text-lg">{config.label}</h4>
										<p className="text-muted-foreground text-sm">
											{
												featuredEmployers.filter((e) => e.industry?.toLowerCase().includes(config.label.toLowerCase()))
													.length
											}{" "}
											<Trans>employeurs</Trans>
										</p>
									</CardContent>
								</Card>
							</motion.div>
						);
					})}
				</div>
			</section>
		</>
	);
}

// ---------------------------------------------------------------------------
// JobDetailDialog
// ---------------------------------------------------------------------------
export function JobDetailDialog({
	isOpen,
	onOpenChange,
	selectedJob,
	onSelectJob,
	applications,
	onApply,
	getSimilarJobs,
}: {
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
	selectedJob: Job | null;
	onSelectJob: (job: Job) => void;
	applications: Application[];
	onApply: (job: Job) => void;
	getSimilarJobs: (job: Job) => Job[];
}) {
	return (
		<Dialog open={isOpen} onOpenChange={onOpenChange}>
			<DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
				{selectedJob && (
					<>
						<DialogHeader>
							<div className="mb-4 flex items-start justify-between">
								<div className="flex items-center gap-4">
									<div
										className={cn(
											"flex size-16 items-center justify-center rounded-2xl",
											getFieldConfig()[selectedJob.field].color,
										)}
									>
										{(() => {
											const FieldIcon = getFieldConfig()[selectedJob.field].icon;
											return <FieldIcon className="size-8" weight="duotone" />;
										})()}
									</div>
									<div>
										<DialogTitle className="text-2xl">{selectedJob.title}</DialogTitle>
										<DialogDescription className="flex items-center gap-2 text-base">
											<BuildingsIcon className="size-4" />
											{selectedJob.company}
										</DialogDescription>
									</div>
								</div>
							</div>

							<div className="flex flex-wrap gap-2">
								<Badge className={getFieldConfig()[selectedJob.field].color}>
									{getFieldConfig()[selectedJob.field].label}
								</Badge>
								<Badge variant="outline" className="gap-1">
									<MapPinIcon className="size-3" />
									{selectedJob.location}
								</Badge>
								<Badge variant="outline" className="gap-1">
									<UserCircleIcon className="size-3" />
									{getExperienceLevels()[selectedJob.experienceLevel].label}
								</Badge>
								{selectedJob.salaryMin && selectedJob.salaryMax && (
									<Badge className="gap-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
										<CurrencyCircleDollarIcon className="size-3" />
										{selectedJob.salaryMin.toLocaleString("fr-FR")} - {selectedJob.salaryMax.toLocaleString("fr-FR")}{" "}
										{selectedJob.currency}
									</Badge>
								)}
								{selectedJob.urgent && (
									<Badge className="gap-1 bg-red-500 text-white">
										<LightningIcon className="size-3" weight="fill" />
										<Trans>Urgent</Trans>
									</Badge>
								)}
							</div>
						</DialogHeader>

						<div className="space-y-6 py-4">
							{/* Description */}
							<div>
								<h4 className="mb-2 font-semibold">
									<Trans>Description du poste</Trans>
								</h4>
								<p className="text-muted-foreground">{selectedJob.description}</p>
							</div>

							{/* Requirements */}
							<div>
								<h4 className="mb-2 font-semibold">
									<Trans>Prérequis</Trans>
								</h4>
								<ul className="space-y-2">
									{selectedJob.requirements.map((req, i) => (
										<li key={i} className="flex items-start gap-2 text-muted-foreground">
											<CheckCircleIcon className="mt-0.5 size-4 shrink-0 text-green-500" weight="fill" />
											{req}
										</li>
									))}
								</ul>
							</div>

							{/* Skills */}
							<div>
								<h4 className="mb-2 font-semibold">
									<Trans>Compétences demandées</Trans>
								</h4>
								<div className="flex flex-wrap gap-2">
									{selectedJob.skills.map((skill, i) => (
										<Badge key={i} variant="secondary">
											{skill}
										</Badge>
									))}
								</div>
							</div>

							{/* How to Apply */}
							<div className="rounded-lg border bg-muted/30 p-4">
								<h4 className="mb-2 flex items-center gap-2 font-semibold">
									<EnvelopeIcon className="size-4" />
									<Trans>Comment postuler</Trans>
								</h4>
								<p className="text-muted-foreground">{selectedJob.howToApply}</p>
							</div>

							{/* Similar Jobs */}
							{getSimilarJobs(selectedJob).length > 0 && (
								<div>
									<h4 className="mb-3 font-semibold">
										<Trans>Offres similaires</Trans>
									</h4>
									<div className="grid gap-3">
										{getSimilarJobs(selectedJob).map((job) => (
											<Card
												key={job.id}
												className="cursor-pointer transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2"
												onClick={() => onSelectJob(job)}
												role="button"
												tabIndex={0}
												onKeyDown={(e) => {
													if (e.key === "Enter" || e.key === " ") {
														e.preventDefault();
														onSelectJob(job);
													}
												}}
											>
												<CardContent className="flex items-center justify-between p-3">
													<div>
														<h5 className="font-medium">{job.title}</h5>
														<p className="text-muted-foreground text-sm">{job.company}</p>
													</div>
													<Badge className={getFieldConfig()[job.field].color}>
														{getFieldConfig()[job.field].label}
													</Badge>
												</CardContent>
											</Card>
										))}
									</div>
								</div>
							)}
						</div>

						<DialogFooter>
							<DialogClose asChild>
								<Button variant="outline">
									<Trans>Fermer</Trans>
								</Button>
							</DialogClose>
							{!applications.some((a) => a.jobId === selectedJob.id) ? (
								<Button
									className="gap-2"
									onClick={() => {
										onApply(selectedJob);
										onOpenChange(false);
									}}
								>
									<EnvelopeIcon className="size-4" />
									<Trans>Postuler</Trans>
								</Button>
							) : (
								<Button variant="secondary" disabled className="gap-2">
									<CheckCircleIcon className="size-4" weight="fill" />
									<Trans>Candidature envoyée</Trans>
								</Button>
							)}
						</DialogFooter>
					</>
				)}
			</DialogContent>
		</Dialog>
	);
}
