import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import {
	CheckCircleIcon,
	ClockIcon,
	CopyIcon,
	FunnelIcon,
	HeartIcon,
	MagnifyingGlassIcon,
	SparkleIcon,
	TrashIcon,
	TrendUpIcon,
} from "@phosphor-icons/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { ErrorComponent } from "@/components/error-component";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { authClient } from "@/integrations/auth/client";
import type { AiContentSource, AiWriterContentItem } from "@/integrations/drizzle/schema";
import { orpc } from "@/integrations/orpc/client";
import { DashboardHeader } from "../-components/header";

// biome-ignore lint/suspicious/noExplicitAny: Route path not in generated route tree
export const Route = createFileRoute("/dashboard/tools/ai-history" as any)({
	component: AIHistoryPage,
	errorComponent: ErrorComponent,
});

const SOURCE_LABELS: Record<string, { label: string; color: string }> = {
	improve_content: { label: t`Amélioration`, color: "blue" },
	generate_summary: { label: t`Résumé`, color: "green" },
	fix_grammar: { label: t`Correction`, color: "purple" },
	suggest_skills: { label: t`Compétences`, color: "orange" },
	generate_headline: { label: t`Titre`, color: "pink" },
	analyze_resume: { label: t`Analyse`, color: "red" },
	parse_pdf: { label: t`Import PDF`, color: "cyan" },
	parse_docx: { label: t`Import DOCX`, color: "cyan" },
	ai_writer_bullet_point: { label: t`Phrases d'impact`, color: "indigo" },
	ai_writer_summary: { label: t`CV Pro`, color: "teal" },
	ai_writer_achievement: { label: t`Réussite`, color: "amber" },
	ai_writer_cover_letter: { label: t`Lettre`, color: "violet" },
	ai_writer_linkedin_summary: { label: t`LinkedIn`, color: "sky" },
	ai_writer_skill_extraction: { label: t`Extraction`, color: "lime" },
	interview_questions: { label: t`Questions`, color: "rose" },
	interview_evaluation: { label: t`Évaluation`, color: "fuchsia" },
	interview_chat: { label: t`Chat IA`, color: "emerald" },
	interview_analysis: { label: t`Analyse d'entretien`, color: "slate" },
	interview_coach: { label: t`Coach entretien`, color: "cyan" },
	interview_improve: { label: t`Réponse améliorée`, color: "teal" },
	career_prediction: { label: t`Projection carrière`, color: "amber" },
	job_match: { label: t`Compatibilité offre`, color: "green" },
	career_trajectory: { label: t`Trajectoire carrière`, color: "blue" },
	transferable_skills: { label: t`Compétences transférables`, color: "purple" },
	success_factors: { label: t`Facteurs de réussite`, color: "orange" },
	ai_mentor_chat: { label: t`Mentor Chat`, color: "violet" },
	learning_path_generate: { label: t`Parcours d'apprentissage`, color: "indigo" },
	learning_path_recommend: { label: t`Recommandation parcours`, color: "sky" },
	voice_interview: { label: t`Entretien vocal`, color: "rose" },
	adaptive_quiz: { label: t`Quiz adaptatif`, color: "lime" },
	resume_gap_analysis: { label: t`Écarts du CV`, color: "emerald" },
	resume_adapt_job: { label: t`Adaptation à l'offre`, color: "blue" },
	resume_wizard_chat: { label: t`Assistant CV`, color: "violet" },
	generate_resume: { label: t`Génération CV`, color: "green" },
	apply_gap_fixes: { label: t`Correction des écarts`, color: "emerald" },
};

function AIHistoryPage() {
	const { data: session } = authClient.useSession();
	const queryClient = useQueryClient();
	const [search, setSearch] = useState("");
	const [sourceFilter, setSourceFilter] = useState<string>("all");
	const [favoritesOnly, setFavoritesOnly] = useState(false);

	// Fetch AI history
	const historyInput: {
		search?: string;
		source?: AiContentSource;
		isFavorite?: boolean;
		limit: number;
	} = {
		search: search || undefined,
		source: sourceFilter !== "all" ? (sourceFilter as AiContentSource) : undefined,
		isFavorite: favoritesOnly || undefined,
		limit: 100,
	};
	const { data: history, isLoading } = useQuery({
		...orpc.aiHistory.list.queryOptions({ input: historyInput }),
		enabled: !!session?.user,
	});

	// Fetch statistics
	const { data: stats } = useQuery({
		...orpc.aiHistory.getStats.queryOptions({ input: {} }),
		enabled: !!session?.user,
	});

	// Mutations
	const toggleFavoriteMutation = useMutation({
		mutationFn: (id: string) => orpc.aiHistory.toggleFavorite.call({ id }),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["aiHistory"] });
			toast.success(t`Favori mis à jour`);
		},
	});

	const markAppliedMutation = useMutation({
		mutationFn: (id: string) => orpc.aiHistory.markApplied.call({ id }),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["aiHistory"] });
			toast.success(t`Marqué comme appliqué`);
		},
	});

	const deleteMutation = useMutation({
		mutationFn: (id: string) => orpc.aiHistory.delete.call({ id }),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["aiHistory"] });
			toast.success(t`Supprimé`);
		},
	});

	const copyToClipboard = (text: string) => {
		navigator.clipboard.writeText(text);
		toast.success(t`Copié dans le presse-papiers`);
	};

	return (
		<div className="space-y-6">
			<DashboardHeader icon={SparkleIcon} title={t`Historique IA`} />

			{/* Statistics Cards */}
			<div className="grid gap-4 md:grid-cols-4">
				<Card>
					<CardHeader className="pb-2">
						<CardDescription className="flex items-center gap-2">
							<SparkleIcon className="size-4" />
							<Trans>Total</Trans>
						</CardDescription>
						<CardTitle className="text-3xl">{stats?.total ?? 0}</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-muted-foreground text-xs">
							<Trans>contenus générés</Trans>
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="pb-2">
						<CardDescription className="flex items-center gap-2">
							<HeartIcon className="size-4" />
							<Trans>Favoris</Trans>
						</CardDescription>
						<CardTitle className="text-3xl">{stats?.favorites ?? 0}</CardTitle>
					</CardHeader>
				</Card>

				<Card>
					<CardHeader className="pb-2">
						<CardDescription className="flex items-center gap-2">
							<CheckCircleIcon className="size-4" />
							<Trans>Appliqués</Trans>
						</CardDescription>
						<CardTitle className="text-3xl">{stats?.applied ?? 0}</CardTitle>
					</CardHeader>
				</Card>

				<Card>
					<CardHeader className="pb-2">
						<CardDescription className="flex items-center gap-2">
							<TrendUpIcon className="size-4" />
							<Trans>Cette semaine</Trans>
						</CardDescription>
						<CardTitle className="text-3xl">{stats?.lastWeek ?? 0}</CardTitle>
					</CardHeader>
				</Card>
			</div>

			{/* Filters */}
			<Card className="p-4">
				<div className="flex flex-wrap items-center gap-4">
					<div className="relative min-w-[200px] flex-1">
						<MagnifyingGlassIcon className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
						<Input
							placeholder={t`Rechercher...`}
							value={search}
							onChange={(e) => setSearch(e.target.value)}
							className="pl-10"
						/>
					</div>

					<Select value={sourceFilter} onValueChange={setSourceFilter}>
						<SelectTrigger className="w-[180px]">
							<FunnelIcon className="mr-2 size-4" />
							<SelectValue placeholder={t`Type`} />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">
								<Trans>Tous les types</Trans>
							</SelectItem>
							{Object.entries(SOURCE_LABELS).map(([key, { label }]) => (
								<SelectItem key={key} value={key}>
									{label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>

					<Button
						variant={favoritesOnly ? "default" : "outline"}
						onClick={() => setFavoritesOnly(!favoritesOnly)}
						className="gap-2"
					>
						<HeartIcon className={favoritesOnly ? "fill-current" : ""} />
						<Trans>Favoris</Trans>
					</Button>
				</div>
			</Card>

			{/* Content List */}
			<div className="space-y-4">
				{isLoading ? (
					<div className="space-y-4">
						{[1, 2, 3].map((i) => (
							<Card key={i}>
								<CardHeader>
									<Skeleton className="h-5 w-48" />
									<Skeleton className="h-4 w-32" />
								</CardHeader>
								<CardContent>
									<Skeleton className="h-20 w-full" />
								</CardContent>
							</Card>
						))}
					</div>
				) : !history || history.length === 0 ? (
					<Card className="flex flex-col items-center justify-center p-12">
						<SparkleIcon className="mb-4 size-16 text-muted-foreground/50" />
						<h3 className="font-semibold text-xl">
							<Trans>Aucun historique</Trans>
						</h3>
						<p className="mt-2 text-center text-muted-foreground">
							<Trans>Utilise les outils IA pour générer du contenu.</Trans>
						</p>
					</Card>
				) : (
					<ScrollArea className="h-[600px]">
						<div className="space-y-4 pr-4">
							{history.map((item: AiWriterContentItem) => {
								const sourceInfo = item.contentSource
									? SOURCE_LABELS[item.contentSource] || {
											label: item.contentSource,
											color: "gray",
										}
									: { label: t`Contenu`, color: "gray" };

								return (
									<motion.div
										key={item.id}
										initial={false}
										animate={{ opacity: 1, y: 0 }}
										transition={{ duration: 0.2 }}
									>
										<Card className="transition-shadow hover:shadow-lg">
											<CardHeader className="pb-3">
												<div className="flex items-start justify-between">
													<div className="space-y-1">
														<div className="flex items-center gap-2">
															<CardTitle className="text-lg">{item.name}</CardTitle>
															{item.contentSource && <Badge variant="secondary">{sourceInfo.label}</Badge>}
															{item.appliedAt && (
																<Badge variant="default" className="gap-1">
																	<CheckCircleIcon className="size-3" />
																	<Trans>Appliqué</Trans>
																</Badge>
															)}
														</div>
														<CardDescription className="flex items-center gap-2">
															<ClockIcon className="size-3" />
															{formatDistanceToNow(new Date(item.createdAt), {
																addSuffix: true,
																locale: fr,
															})}
															{item.expiresAt && (
																<span className="text-xs">
																	· <Trans>Expire le {new Date(item.expiresAt).toLocaleDateString("fr-FR")}</Trans>
																</span>
															)}
														</CardDescription>
													</div>

													<div className="flex items-center gap-1">
														<Button
															variant="ghost"
															size="icon"
															onClick={() => toggleFavoriteMutation.mutate(item.id)}
															disabled={toggleFavoriteMutation.isPending}
														>
															<HeartIcon className={`size-4 ${item.isFavorite ? "fill-red-500 text-red-500" : ""}`} />
														</Button>
														<Button
															variant="ghost"
															size="icon"
															onClick={() => copyToClipboard(item.generatedContent || "")}
														>
															<CopyIcon className="size-4" />
														</Button>
														{!item.appliedAt && (
															<Button
																variant="ghost"
																size="icon"
																onClick={() => markAppliedMutation.mutate(item.id)}
																disabled={markAppliedMutation.isPending}
															>
																<CheckCircleIcon className="size-4" />
															</Button>
														)}
														<Button
															variant="ghost"
															size="icon"
															onClick={() => {
																if (confirm(t`Supprimer cet élément ?`)) {
																	deleteMutation.mutate(item.id);
																}
															}}
															disabled={deleteMutation.isPending}
														>
															<TrashIcon className="size-4" />
														</Button>
													</div>
												</div>
											</CardHeader>
											<CardContent>
												{item.generatedContent && (
													<div className="rounded-lg bg-muted/50 p-4">
														<p className="line-clamp-4 whitespace-pre-wrap text-sm">{item.generatedContent}</p>
														<p className="mt-2 flex items-center gap-1 text-muted-foreground/60 text-xs">
															<SparkleIcon className="size-3" weight="fill" />
															{t`Contenu généré par IA`}
														</p>
													</div>
												)}
												{item.tags && item.tags.length > 0 && (
													<div className="mt-3 flex flex-wrap gap-2">
														{item.tags.map((tag: string) => (
															<Badge key={tag} variant="outline">
																{tag}
															</Badge>
														))}
													</div>
												)}
											</CardContent>
										</Card>
									</motion.div>
								);
							})}
						</div>
					</ScrollArea>
				)}
			</div>
		</div>
	);
}
