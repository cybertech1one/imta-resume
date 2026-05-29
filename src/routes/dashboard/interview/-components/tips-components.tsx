import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import {
	ArrowLeftIcon,
	BookOpenIcon,
	CaretDownIcon,
	CaretUpIcon,
	CheckCircleIcon,
	HeartIcon,
	LightbulbIcon,
	ListIcon,
	MagnifyingGlassIcon,
	PersonIcon,
	PrinterIcon,
	SparkleIcon,
	StarIcon,
} from "@phosphor-icons/react";
import type { UseMutationResult } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/utils/style";

import { categoryConfig, fieldConfig } from "./tips-config";
import { getExtendedContent } from "./tips-utils";

type Tip = {
	id: string;
	title: string;
	content: string;
	field?: string | null;
};

export function HeroSection({ favoriteTips, handlePrint }: { favoriteTips: Tip[]; handlePrint: () => void }) {
	return (
		<motion.div
			className="relative mb-8 overflow-hidden rounded-3xl border border-amber-500/20 p-8 md:p-12"
			style={{
				background:
					"linear-gradient(135deg, oklch(0.75 0.15 80 / 0.15) 0%, oklch(0.7 0.18 50 / 0.1) 50%, oklch(0.65 0.15 30 / 0.08) 100%)",
			}}
			initial={false}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.6, ease: "easeOut" }}
		>
			<div className="pointer-events-none absolute inset-0 overflow-hidden print:hidden">
				<motion.div
					className="absolute -top-32 -right-32 size-96 rounded-full bg-gradient-to-br from-amber-500/20 to-orange-500/10 blur-3xl"
					animate={{
						scale: [1, 1.2, 1],
						rotate: [0, 10, 0],
						opacity: [0.5, 0.3, 0.5],
					}}
					transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
				/>
				<motion.div
					className="absolute -bottom-32 -left-32 size-96 rounded-full bg-gradient-to-tr from-yellow-500/15 to-amber-500/10 blur-3xl"
					animate={{
						scale: [1.2, 1, 1.2],
						rotate: [0, -10, 0],
						opacity: [0.3, 0.5, 0.3],
					}}
					transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
				/>
			</div>

			<div className="relative z-10">
				<motion.div
					className="mb-3 flex items-center gap-2"
					initial={false}
					animate={{ opacity: 1, x: 0 }}
					transition={{ delay: 0.2 }}
				>
					<LightbulbIcon className="size-5 text-amber-600" weight="fill" />
					<span className="font-semibold text-amber-700 text-sm uppercase tracking-wider dark:text-amber-400">
						<Trans>Guide de réussite</Trans>
					</span>
				</motion.div>

				<motion.h2
					className="mb-4 bg-gradient-to-r from-amber-700 via-orange-600 to-amber-700 bg-clip-text font-bold text-3xl text-transparent tracking-tight md:text-4xl lg:text-5xl dark:from-amber-400 dark:via-orange-400 dark:to-amber-400"
					initial={false}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.3 }}
				>
					<Trans>Conseils pour réussir vos entretiens</Trans>
				</motion.h2>

				<motion.p
					className="mb-8 max-w-2xl text-lg text-muted-foreground"
					initial={false}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.4 }}
				>
					<Trans>
						Préparez chaque étape avec des conseils simples, concrets et adaptés aux entretiens des étudiants.
					</Trans>
				</motion.p>

				<motion.div
					className="flex flex-wrap items-center gap-4 print:hidden"
					initial={false}
					animate={{ opacity: 1 }}
					transition={{ delay: 0.5 }}
				>
					<Link to="/dashboard/interview">
						<Button variant="outline" className="gap-2">
							<ArrowLeftIcon className="size-4" />
							<Trans>Retour</Trans>
						</Button>
					</Link>
					<Button variant="outline" className="gap-2" onClick={handlePrint}>
						<PrinterIcon className="size-4" />
						<Trans>Imprimer</Trans>
					</Button>
					{favoriteTips.length > 0 && (
						<Badge variant="secondary" className="gap-1 px-3 py-1.5">
							<HeartIcon className="size-4 text-red-500" weight="fill" />
							{favoriteTips.length} <Trans>favoris</Trans>
						</Badge>
					)}
				</motion.div>
			</div>
		</motion.div>
	);
}

export function SearchAndFilters({
	searchQuery,
	setSearchQuery,
	selectedField,
	handleFieldChange,
}: {
	searchQuery: string;
	setSearchQuery: (query: string) => void;
	selectedField: string | undefined;
	handleFieldChange: (field: string | undefined) => void;
}) {
	return (
		<div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between print:hidden">
			<div className="relative flex-1 md:max-w-md">
				<MagnifyingGlassIcon className="absolute top-1/2 left-3 size-5 -translate-y-1/2 text-muted-foreground" />
				<Input
					placeholder={t`Rechercher un conseil...`}
					value={searchQuery}
					onChange={(e) => setSearchQuery(e.target.value)}
					className="pl-10"
				/>
			</div>

			<div className="flex flex-wrap items-center gap-2">
				<span className="text-muted-foreground text-sm">
					<Trans>Filtrer par domaine :</Trans>
				</span>
				{Object.entries(fieldConfig).map(([key, config]) => {
					const FieldIcon = config.icon;
					return (
						<Button
							key={key}
							variant={selectedField === key ? "default" : "outline"}
							size="sm"
							className={cn("gap-1.5", selectedField === key && config.bgColor)}
							onClick={() => handleFieldChange(key)}
						>
							<FieldIcon className="size-4" />
							{config.label}
						</Button>
					);
				})}
			</div>
		</div>
	);
}

export function TipsTabContent({
	selectedCategory,
	handleCategoryChange,
	isLoading,
	favoritesError: favoritesErr,
	filteredTips,
	expandedTips,
	favorites,
	toggleFavorite,
	toggleExpand,
	addFavoriteMutation,
	removeFavoriteMutation,
}: {
	selectedCategory: string;
	handleCategoryChange: (category: string) => void;
	isLoading: boolean;
	favoritesError: Error | null;
	filteredTips: Tip[];
	expandedTips: Set<string>;
	favorites: Set<string>;
	toggleFavorite: (tipId: string) => void;
	toggleExpand: (tipId: string) => void;
	addFavoriteMutation: UseMutationResult<unknown, Error, { tipId: string }, unknown>;
	removeFavoriteMutation: UseMutationResult<unknown, Error, { tipId: string }, unknown>;
}) {
	return (
		<Tabs value={selectedCategory} onValueChange={handleCategoryChange} className="space-y-6">
			<TabsList className="!grid !h-auto !w-full sm:!flex grid-cols-2 gap-2 bg-transparent p-0 sm:flex-wrap sm:justify-start print:hidden">
				{Object.entries(categoryConfig).map(([key, config]) => {
					const CategoryIcon = config.icon;
					return (
						<TabsTrigger
							key={key}
							value={key}
							className={cn(
								"flex min-h-11 min-w-0 items-center justify-start gap-2 whitespace-normal rounded-lg border bg-card px-3 py-2.5 text-left data-[state=active]:border-primary data-[state=active]:bg-primary/5 sm:min-h-0 sm:flex-none sm:px-4",
							)}
							onClick={() => handleCategoryChange(key)}
						>
							<CategoryIcon className={cn("size-4", config.color)} weight="duotone" />
							<span className="min-w-0 leading-tight">{config.label}</span>
						</TabsTrigger>
					);
				})}
			</TabsList>

			{Object.keys(categoryConfig).map((categoryKey) => (
				<TabsContent key={categoryKey} value={categoryKey} className="mt-0">
					<motion.div initial={false} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
						<div className="mb-6">
							<h3 className="flex items-center gap-2 font-semibold text-xl">
								{(() => {
									const CategoryIcon = categoryConfig[categoryKey].icon;
									return <CategoryIcon className={cn("size-6", categoryConfig[categoryKey].color)} weight="duotone" />;
								})()}
								{categoryConfig[categoryKey].label}
								<Badge variant="secondary" className="ml-2">
									{filteredTips.length} <Trans>conseils</Trans>
								</Badge>
							</h3>
							<p className="text-muted-foreground">{categoryConfig[categoryKey].description}</p>
						</div>

						{isLoading && filteredTips.length === 0 ? (
							<div className="flex items-center justify-center py-12">
								<div className="animate-pulse text-muted-foreground">
									<Trans>Chargement des conseils...</Trans>
								</div>
							</div>
						) : favoritesErr ? (
							<Card className="border-red-500/50 border-dashed">
								<CardContent className="flex flex-col items-center justify-center py-12">
									<ListIcon className="mb-4 size-12 text-red-500" />
									<p className="text-red-500">
										<Trans>Erreur de chargement des favoris</Trans>
									</p>
								</CardContent>
							</Card>
						) : filteredTips.length === 0 ? (
							<Card className="border-dashed">
								<CardContent className="flex flex-col items-center justify-center py-12">
									<ListIcon className="mb-4 size-12 text-muted-foreground" />
									<p className="text-muted-foreground">
										<Trans>Aucun conseil trouvé</Trans>
									</p>
								</CardContent>
							</Card>
						) : (
							<TipsGrid
								tips={filteredTips}
								categoryKey={categoryKey}
								expandedTips={expandedTips}
								favorites={favorites}
								toggleFavorite={toggleFavorite}
								toggleExpand={toggleExpand}
								addFavoriteMutation={addFavoriteMutation}
								removeFavoriteMutation={removeFavoriteMutation}
							/>
						)}
					</motion.div>
				</TabsContent>
			))}
		</Tabs>
	);
}

function TipsGrid({
	tips,
	categoryKey,
	expandedTips,
	favorites,
	toggleFavorite,
	toggleExpand,
	addFavoriteMutation,
	removeFavoriteMutation,
}: {
	tips: Tip[];
	categoryKey: string;
	expandedTips: Set<string>;
	favorites: Set<string>;
	toggleFavorite: (tipId: string) => void;
	toggleExpand: (tipId: string) => void;
	addFavoriteMutation: UseMutationResult<unknown, Error, { tipId: string }, unknown>;
	removeFavoriteMutation: UseMutationResult<unknown, Error, { tipId: string }, unknown>;
}) {
	return (
		<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 print:grid-cols-1">
			{tips.map((tip, index) => {
				const isExpanded = expandedTips.has(tip.id);
				const isFavorite = favorites.has(tip.id);
				const extendedContent = getExtendedContent(tip.id);
				const TipFieldConfig = tip.field ? fieldConfig[tip.field] : null;

				return (
					<motion.div key={tip.id} initial={false} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
						<Card
							className={cn(
								"group h-full transition-all duration-300 hover:shadow-lg print:shadow-none",
								isFavorite && "border-amber-500/50 ring-1 ring-amber-500/20",
							)}
						>
							<CardHeader className="pb-3">
								<div className="flex items-start justify-between gap-2">
									<div
										className={cn(
											"flex size-10 items-center justify-center rounded-xl bg-gradient-to-br transition-transform group-hover:scale-110 print:group-hover:scale-100",
											categoryConfig[categoryKey]?.bgColor || "from-gray-500/20 to-slate-500/10",
										)}
									>
										<LightbulbIcon
											className={cn("size-5", categoryConfig[categoryKey]?.color || "text-gray-600")}
											weight="duotone"
										/>
									</div>
									<Button
										variant="ghost"
										size="icon"
										className={cn("size-8 print:hidden", isFavorite && "text-amber-500 hover:text-amber-600")}
										onClick={() => toggleFavorite(tip.id)}
										disabled={addFavoriteMutation.isPending || removeFavoriteMutation.isPending}
									>
										<HeartIcon className="size-5" weight={isFavorite ? "fill" : "regular"} />
									</Button>
								</div>
								<CardTitle className="text-lg">{tip.title}</CardTitle>
								<div className="flex flex-wrap gap-2">
									{TipFieldConfig && (
										<Badge className={cn("text-xs", TipFieldConfig.bgColor, TipFieldConfig.color)}>
											{TipFieldConfig.label}
										</Badge>
									)}
								</div>
							</CardHeader>
							<CardContent>
								<p className="text-muted-foreground text-sm">{tip.content}</p>

								{extendedContent && (
									<>
										<AnimatePresence>
											{isExpanded && (
												<motion.div
													initial={{ opacity: 0, height: 0 }}
													animate={{ opacity: 1, height: "auto" }}
													exit={{ opacity: 0, height: 0 }}
													transition={{ duration: 0.2 }}
													className="mt-4 overflow-hidden"
												>
													<div className="rounded-lg bg-muted/50 p-3">
														<p className="text-sm leading-relaxed">{extendedContent}</p>
													</div>
												</motion.div>
											)}
										</AnimatePresence>
										<Button
											variant="ghost"
											size="sm"
											className="mt-3 w-full gap-1 print:hidden"
											onClick={() => toggleExpand(tip.id)}
										>
											{isExpanded ? (
												<>
													<CaretUpIcon className="size-4" />
													<Trans>Voir moins</Trans>
												</>
											) : (
												<>
													<CaretDownIcon className="size-4" />
													<Trans>Voir plus</Trans>
												</>
											)}
										</Button>
									</>
								)}
							</CardContent>
						</Card>
					</motion.div>
				);
			})}
		</div>
	);
}

export function FavoritesSection({
	favoriteTips,
	toggleFavorite,
	addFavoriteMutation,
	removeFavoriteMutation,
}: {
	favoriteTips: Tip[];
	toggleFavorite: (tipId: string) => void;
	addFavoriteMutation: UseMutationResult<unknown, Error, { tipId: string }, unknown>;
	removeFavoriteMutation: UseMutationResult<unknown, Error, { tipId: string }, unknown>;
}) {
	if (favoriteTips.length === 0) return null;

	return (
		<section className="mt-12 print:hidden">
			<h3 className="mb-6 flex items-center gap-2 font-semibold text-2xl">
				<StarIcon className="size-6 text-amber-500" weight="fill" />
				<Trans>Mes conseils favoris</Trans>
			</h3>

			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
				{favoriteTips.map((tip, index) => (
					<motion.div
						key={tip.id}
						initial={false}
						animate={{ opacity: 1, scale: 1 }}
						transition={{ delay: index * 0.05 }}
					>
						<Card className="h-full border-amber-500/30 bg-gradient-to-br from-amber-50/50 to-orange-50/30 dark:from-amber-900/10 dark:to-orange-900/5">
							<CardHeader className="pb-2">
								<div className="flex items-center justify-between">
									<Badge variant="secondary" className="bg-amber-100 text-amber-700 dark:bg-amber-900/30">
										<HeartIcon className="mr-1 size-3" weight="fill" />
										Favori
									</Badge>
									<Button
										variant="ghost"
										size="icon"
										className="size-8"
										onClick={() => toggleFavorite(tip.id)}
										disabled={addFavoriteMutation.isPending || removeFavoriteMutation.isPending}
									>
										<HeartIcon className="size-5 text-amber-500" weight="fill" />
									</Button>
								</div>
								<CardTitle className="text-base">{tip.title}</CardTitle>
							</CardHeader>
							<CardContent>
								<p className="text-muted-foreground text-sm">{tip.content}</p>
							</CardContent>
						</Card>
					</motion.div>
				))}
			</div>
		</section>
	);
}

export function QuickLinksSection() {
	return (
		<section className="mt-12 print:hidden">
			<h3 className="mb-6 flex items-center gap-2 font-semibold text-2xl">
				<SparkleIcon className="size-6 text-primary" weight="duotone" />
				<Trans>Ressources complémentaires</Trans>
			</h3>

			<div className="grid gap-4 md:grid-cols-3">
				<Link to={"/dashboard/interview/questions" as string}>
					<Card className="group h-full cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
						<CardContent className="flex items-center gap-4 p-6">
							<div className="flex size-14 items-center justify-center rounded-xl bg-blue-100 transition-transform group-hover:scale-110 dark:bg-blue-900/30">
								<BookOpenIcon className="size-7 text-blue-600 dark:text-blue-400" weight="duotone" />
							</div>
							<div>
								<h4 className="font-semibold">
									<Trans>Questions fréquentes</Trans>
								</h4>
								<p className="text-muted-foreground text-sm">
									<Trans>Préparez les réponses importantes</Trans>
								</p>
							</div>
						</CardContent>
					</Card>
				</Link>

				<Link to="/dashboard/interview/chatbot">
					<Card className="group h-full cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
						<CardContent className="flex items-center gap-4 p-6">
							<div className="flex size-14 items-center justify-center rounded-xl bg-purple-100 transition-transform group-hover:scale-110 dark:bg-purple-900/30">
								<PersonIcon className="size-7 text-purple-600 dark:text-purple-400" weight="duotone" />
							</div>
							<div>
								<h4 className="font-semibold">
									<Trans>S'entraîner avec l'IA</Trans>
								</h4>
								<p className="text-muted-foreground text-sm">
									<Trans>Simuler un vrai entretien</Trans>
								</p>
							</div>
						</CardContent>
					</Card>
				</Link>

				<Link to="/dashboard/interview">
					<Card className="group h-full cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
						<CardContent className="flex items-center gap-4 p-6">
							<div className="flex size-14 items-center justify-center rounded-xl bg-green-100 transition-transform group-hover:scale-110 dark:bg-green-900/30">
								<CheckCircleIcon className="size-7 text-green-600 dark:text-green-400" weight="duotone" />
							</div>
							<div>
								<h4 className="font-semibold">
									<Trans>Espace entretien</Trans>
								</h4>
								<p className="text-muted-foreground text-sm">
									<Trans>Tous les outils de préparation</Trans>
								</p>
							</div>
						</CardContent>
					</Card>
				</Link>
			</div>
		</section>
	);
}

export function PrintStyles() {
	return (
		<style>{`
			@media print {
				body {
					font-size: 12pt;
				}
				.print\\:hidden {
					display: none !important;
				}
				.print\\:grid-cols-1 {
					grid-template-columns: 1fr !important;
				}
				.print\\:shadow-none {
					box-shadow: none !important;
				}
				.print\\:group-hover\\:scale-100 {
					transform: scale(1) !important;
				}
			}
		`}</style>
	);
}
