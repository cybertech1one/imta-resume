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
	improve_content: { label: t`Improvement`, color: "blue" },
	generate_summary: { label: t`Summary`, color: "green" },
	fix_grammar: { label: t`Grammar Fix`, color: "purple" },
	suggest_skills: { label: t`Skills`, color: "orange" },
	generate_headline: { label: t`Headline`, color: "pink" },
	analyze_resume: { label: t`Analysis`, color: "red" },
	parse_pdf: { label: t`Import PDF`, color: "cyan" },
	parse_docx: { label: t`Import DOCX`, color: "cyan" },
	ai_writer_bullet_point: { label: t`Bullet Points`, color: "indigo" },
	ai_writer_summary: { label: t`Resume Pro`, color: "teal" },
	ai_writer_achievement: { label: t`Achievement`, color: "amber" },
	ai_writer_cover_letter: { label: t`Letter`, color: "violet" },
	ai_writer_linkedin_summary: { label: t`LinkedIn`, color: "sky" },
	ai_writer_skill_extraction: { label: t`Extraction`, color: "lime" },
	interview_questions: { label: t`Questions`, color: "rose" },
	interview_evaluation: { label: t`Evaluation`, color: "fuchsia" },
	interview_chat: { label: t`AI Chat`, color: "emerald" },
	interview_analysis: { label: t`Session Analysis`, color: "slate" },
	interview_coach: { label: t`Interview Coach`, color: "cyan" },
	interview_improve: { label: t`Answer Improvement`, color: "teal" },
	career_prediction: { label: t`Career Prediction`, color: "amber" },
	job_match: { label: t`Job Match`, color: "green" },
	career_trajectory: { label: t`Career Trajectory`, color: "blue" },
	transferable_skills: { label: t`Transferable Skills`, color: "purple" },
	success_factors: { label: t`Success Factors`, color: "orange" },
	ai_mentor_chat: { label: t`Mentor Chat`, color: "violet" },
	learning_path_generate: { label: t`Learning Path`, color: "indigo" },
	learning_path_recommend: { label: t`Path Recommendation`, color: "sky" },
	voice_interview: { label: t`Voice Interview`, color: "rose" },
	adaptive_quiz: { label: t`Adaptive Quiz`, color: "lime" },
	resume_gap_analysis: { label: t`Resume Gap Analysis`, color: "emerald" },
	resume_adapt_job: { label: t`Job Adaptation`, color: "blue" },
	resume_wizard_chat: { label: t`Resume Wizard`, color: "violet" },
	generate_resume: { label: t`Resume Generation`, color: "green" },
	apply_gap_fixes: { label: t`Gap Fix Application`, color: "emerald" },
};

function AIHistoryPage() {
	const { data: session } = authClient.useSession();
	const queryClient = useQueryClient();
	const [search, setSearch] = useState("");
	const [sourceFilter, setSourceFilter] = useState<string>("all");
	const [favoritesOnly, setFavoritesOnly] = useState(false);

	// Fetch AI history
	const historyInput = {
		search: search || undefined,
		source: sourceFilter !== "all" ? (sourceFilter as AiContentSource) : undefined,
		isFavorite: favoritesOnly || undefined,
		limit: 100,
	};
	const { data: history, isLoading } = useQuery({
		// eslint-disable-next-line @typescript-eslint/no-explicit-any -- ORPC type inference quirk with pgEnum-derived union
		...orpc.aiHistory.list.queryOptions({ input: historyInput as any }),
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
			toast.success(t`Favorite updated`);
		},
	});

	const markAppliedMutation = useMutation({
		mutationFn: (id: string) => orpc.aiHistory.markApplied.call({ id }),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["aiHistory"] });
			toast.success(t`Marked as applied`);
		},
	});

	const deleteMutation = useMutation({
		mutationFn: (id: string) => orpc.aiHistory.delete.call({ id }),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["aiHistory"] });
			toast.success(t`Deleted`);
		},
	});

	const copyToClipboard = (text: string) => {
		navigator.clipboard.writeText(text);
		toast.success(t`Copied to clipboard`);
	};

	return (
		<div className="space-y-6">
			<DashboardHeader icon={SparkleIcon} title={t`AI History`} />

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
							<Trans>contents generated</Trans>
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="pb-2">
						<CardDescription className="flex items-center gap-2">
							<HeartIcon className="size-4" />
							<Trans>Favorites</Trans>
						</CardDescription>
						<CardTitle className="text-3xl">{stats?.favorites ?? 0}</CardTitle>
					</CardHeader>
				</Card>

				<Card>
					<CardHeader className="pb-2">
						<CardDescription className="flex items-center gap-2">
							<CheckCircleIcon className="size-4" />
							<Trans>Applied</Trans>
						</CardDescription>
						<CardTitle className="text-3xl">{stats?.applied ?? 0}</CardTitle>
					</CardHeader>
				</Card>

				<Card>
					<CardHeader className="pb-2">
						<CardDescription className="flex items-center gap-2">
							<TrendUpIcon className="size-4" />
							<Trans>This week</Trans>
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
							placeholder={t`Search...`}
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
								<Trans>All types</Trans>
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
						<Trans>Favorites</Trans>
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
							<Trans>No history</Trans>
						</h3>
						<p className="mt-2 text-center text-muted-foreground">
							<Trans>Use AI features to generate content</Trans>
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
									: { label: t`Content`, color: "gray" };

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
																	<Trans>Applied</Trans>
																</Badge>
															)}
														</div>
														<CardDescription className="flex items-center gap-2">
															<ClockIcon className="size-3" />
															{formatDistanceToNow(new Date(item.createdAt), {
																addSuffix: true,
															})}
															{item.expiresAt && (
																<span className="text-xs">
																	· <Trans>Expires on {new Date(item.expiresAt).toLocaleDateString()}</Trans>
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
																if (confirm(t`Delete this item?`)) {
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
															{t`AI-generated content`}
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
