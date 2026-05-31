import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import {
	ArrowClockwiseIcon,
	ChartBarIcon,
	CheckCircleIcon,
	EyeIcon,
	HandIcon,
	LightbulbIcon,
	MicrophoneIcon,
	PersonArmsSpreadIcon,
	SmileyIcon,
	SparkleIcon,
	VideoCameraIcon,
} from "@phosphor-icons/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { ErrorComponent } from "@/components/error-component";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { authClient } from "@/integrations/auth/client";
import type { VideoAnalysisCategory, VideoAnalysisVoiceMetrics } from "@/integrations/drizzle/schema";
import { orpc } from "@/integrations/orpc/client";
import { cn } from "@/utils/style";
import { DashboardHeader } from "../-components/header";
import {
	AnalysisResultsDashboard,
	BodyLanguageTipCard,
	CategoryAnalysisCard,
	EyeContactGuidance,
	generateAnalysisResult,
	PostureChecklist,
	VideoUploadInterface,
	VoiceModulationChart,
} from "./-components/video-analysis-components";
import {
	bodyLanguageTips,
	categoryBadgeColors,
	categoryColors,
	categoryIcons,
	categoryLabels,
} from "./-components/video-analysis-config";
import type { AnalysisResult } from "./-components/video-analysis-types";

// biome-ignore lint/suspicious/noExplicitAny: Route path not in generated route tree
export const Route = createFileRoute("/dashboard/interview/video-analysis" as any)({
	component: VideoAnalysisPage,
	errorComponent: ErrorComponent,
});

// Main Component
function VideoAnalysisPage() {
	const queryClient = useQueryClient();
	const { data: session } = authClient.useSession();
	const [activeTab, setActiveTab] = useState("tips");
	const [isAnalyzing, setIsAnalyzing] = useState(false);
	const analyzeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

	// Cleanup timeout on unmount
	useEffect(() => {
		return () => {
			if (analyzeTimeoutRef.current) {
				clearTimeout(analyzeTimeoutRef.current);
				analyzeTimeoutRef.current = null;
			}
		};
	}, []);

	// Fetch latest analysis result
	const { data: latestResult } = useQuery({
		...orpc.videoAnalysis.results.getLatest.queryOptions(),
		enabled: !!session?.user,
	});

	// Fetch statistics
	const { data: statistics } = useQuery({
		...orpc.videoAnalysis.results.getStatistics.queryOptions(),
		enabled: !!session?.user,
	});

	// Fetch all results (used for display in results tab)
	const { data: _resultsData } = useQuery({
		...orpc.videoAnalysis.results.list.queryOptions({}),
		enabled: !!session?.user,
	});

	// Create analysis mutation
	const createAnalysisMutation = useMutation(
		orpc.videoAnalysis.results.create.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries({ queryKey: ["videoAnalysis"] });
				setActiveTab("results");
				toast.success(t`Analysis completed successfully`);
			},
			onError: () => {
				toast.error(t`Error during analysis`);
			},
		}),
	);

	const handleAnalyze = useCallback(
		(duration: number) => {
			setIsAnalyzing(true);
			// Simulate analysis time
			analyzeTimeoutRef.current = setTimeout(() => {
				const result = generateAnalysisResult(duration);
				createAnalysisMutation.mutate({
					title: `Analysis of ${new Date().toLocaleDateString("fr-FR")}`,
					...result,
				});
				setIsAnalyzing(false);
				analyzeTimeoutRef.current = null;
			}, 3000);
		},
		[createAnalysisMutation],
	);

	const handleReset = useCallback(() => {
		setActiveTab("tips");
	}, []);

	// Convert latest result to analysis result format
	const analysisResult: AnalysisResult | null = useMemo(() => {
		if (!latestResult) return null;
		return {
			id: latestResult.id,
			overallScore: latestResult.overallScore,
			duration: latestResult.duration,
			timestamp: latestResult.createdAt.toISOString(),
			categories: latestResult.categories,
			voiceMetrics: latestResult.voiceMetrics,
			highlights: latestResult.highlights,
			recommendations: latestResult.recommendations,
		};
	}, [latestResult]);

	// Default voice metrics for tips section
	const defaultVoiceMetrics: VideoAnalysisVoiceMetrics = {
		tone: { label: t`Tone`, score: 75, description: t`Overall positive tone with appropriate variations` },
		pace: { label: t`Pace`, score: 68, description: t`Average rate of 145 words/min - slightly fast` },
		clarity: { label: t`Clarity`, score: 82, description: t`Clear and understandable articulation` },
		volume: { label: t`Volume`, score: 78, description: t`Adequate volume with some variations` },
		fillerWords: { count: 12, examples: ["um", "so", "like", "actually"] },
	};

	return (
		<>
			<DashboardHeader icon={VideoCameraIcon} title={t`Interview Video Analysis`} />

			{/* Hero Section */}
			<motion.div
				className="relative mb-8 overflow-hidden rounded-3xl border border-primary/20 p-8 md:p-12"
				style={{
					background:
						"linear-gradient(135deg, oklch(0.7 0.15 280 / 0.15) 0%, oklch(0.6 0.2 200 / 0.1) 50%, oklch(0.65 0.18 150 / 0.08) 100%)",
				}}
				initial={false}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.6, ease: "easeOut" }}
			>
				<div className="pointer-events-none absolute inset-0 overflow-hidden">
					<motion.div
						className="absolute -top-32 -right-32 size-96 rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/10 blur-3xl"
						animate={{ scale: [1, 1.2, 1], rotate: [0, 10, 0], opacity: [0.5, 0.3, 0.5] }}
						transition={{ duration: 10, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
					/>
					<motion.div
						className="absolute -bottom-32 -left-32 size-96 rounded-full bg-gradient-to-tr from-amber-500/15 to-green-500/10 blur-3xl"
						animate={{ scale: [1.2, 1, 1.2], rotate: [0, -10, 0], opacity: [0.3, 0.5, 0.3] }}
						transition={{ duration: 10, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
					/>
				</div>

				<div className="relative z-10">
					<motion.div
						className="mb-3 flex items-center gap-2"
						initial={false}
						animate={{ opacity: 1, x: 0 }}
						transition={{ delay: 0.2 }}
					>
						<VideoCameraIcon className="size-5 text-primary" weight="fill" />
						<span className="font-semibold text-primary text-sm uppercase tracking-wider">
							<Trans>AI Video Analysis</Trans>
						</span>
					</motion.div>

					<motion.h2
						className="mb-4 bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text font-bold text-3xl text-transparent tracking-tight md:text-4xl"
						initial={false}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.3 }}
					>
						<Trans>Perfect Your Video Presence</Trans>
					</motion.h2>

					<motion.p
						className="mb-8 max-w-2xl text-lg text-muted-foreground"
						initial={false}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.4 }}
					>
						<Trans>
							Analyze your body language, eye contact, voice, and confidence. Get personalized feedback to shine during
							your video interviews.
						</Trans>
					</motion.p>

					{/* Quick Stats */}
					<motion.div
						className="flex flex-wrap items-center gap-6"
						initial={false}
						animate={{ opacity: 1 }}
						transition={{ delay: 0.5 }}
					>
						<div className="flex items-center gap-2">
							<div className="flex size-10 items-center justify-center rounded-full bg-primary/10">
								<ChartBarIcon className="size-5 text-primary" weight="duotone" />
							</div>
							<div>
								<p className="font-bold text-xl">{statistics?.totalAnalyses ?? 0}</p>
								<p className="text-muted-foreground text-sm">
									<Trans>Analyses</Trans>
								</p>
							</div>
						</div>
						<div className="flex items-center gap-2">
							<div className="flex size-10 items-center justify-center rounded-full bg-green-500/10">
								<SparkleIcon className="size-5 text-green-500" weight="duotone" />
							</div>
							<div>
								<p className="font-bold text-xl">{statistics?.averageScore ?? 0}%</p>
								<p className="text-muted-foreground text-sm">
									<Trans>Average Score</Trans>
								</p>
							</div>
						</div>
						<div className="flex items-center gap-2">
							<div className="flex size-10 items-center justify-center rounded-full bg-amber-500/10">
								<LightbulbIcon className="size-5 text-amber-500" weight="fill" />
							</div>
							<div>
								<p className="font-bold text-xl">12+</p>
								<p className="text-muted-foreground text-sm">
									<Trans>Tips</Trans>
								</p>
							</div>
						</div>
					</motion.div>
				</div>
			</motion.div>

			{/* Main Content Tabs */}
			<Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
				<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
					<TabsList>
						<TabsTrigger value="tips" className="gap-2">
							<LightbulbIcon className="size-4" />
							<Trans>Tips</Trans>
						</TabsTrigger>
						<TabsTrigger value="upload" className="gap-2">
							<VideoCameraIcon className="size-4" />
							<Trans>Analyze</Trans>
						</TabsTrigger>
						<TabsTrigger value="results" className="gap-2" disabled={!analysisResult}>
							<ChartBarIcon className="size-4" />
							<Trans>Results</Trans>
						</TabsTrigger>
					</TabsList>

					{analysisResult && (
						<Button variant="outline" onClick={handleReset}>
							<ArrowClockwiseIcon className="mr-2 size-4" />
							<Trans>New Analysis</Trans>
						</Button>
					)}
				</div>

				{/* Tips Tab */}
				<TabsContent value="tips" className="space-y-8">
					{/* Body Language Tips */}
					<section>
						<h3 className="mb-4 flex items-center gap-2 font-semibold text-xl">
							<HandIcon className="size-5 text-blue-500" weight="duotone" />
							<Trans>Body Language</Trans>
						</h3>
						<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
							{bodyLanguageTips.map((tip) => (
								<BodyLanguageTipCard key={tip.id} tip={tip} />
							))}
						</div>
					</section>

					{/* Eye Contact Guidance */}
					<section>
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<EyeIcon className="size-5 text-purple-500" weight="duotone" />
									<Trans>Eye Contact Guide</Trans>
								</CardTitle>
								<CardDescription>
									<Trans>Where to look during a video interview to project confidence and engagement</Trans>
								</CardDescription>
							</CardHeader>
							<CardContent>
								<EyeContactGuidance />
							</CardContent>
						</Card>
					</section>

					{/* Voice Modulation Section */}
					<section className="grid gap-6 lg:grid-cols-2">
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<MicrophoneIcon className="size-5 text-green-500" weight="duotone" />
									<Trans>Voice Modulation</Trans>
								</CardTitle>
								<CardDescription>
									<Trans>Analyze and improve your tone, pace, and clarity</Trans>
								</CardDescription>
							</CardHeader>
							<CardContent>
								<VoiceModulationChart metrics={analysisResult?.voiceMetrics ?? defaultVoiceMetrics} />
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<PersonArmsSpreadIcon className="size-5 text-red-500" weight="duotone" />
									<Trans>Posture Check</Trans>
								</CardTitle>
								<CardDescription>
									<Trans>Check your setup before the interview</Trans>
								</CardDescription>
							</CardHeader>
							<CardContent>
								<PostureChecklist />
							</CardContent>
						</Card>
					</section>

					{/* Confidence and Facial Expression Tips */}
					<section className="grid gap-6 lg:grid-cols-2">
						{/* Confidence Indicators */}
						<Card className="bg-gradient-to-br from-amber-500/10 to-transparent">
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<SparkleIcon className="size-5 text-amber-500" weight="fill" />
									<Trans>Confidence Indicators</Trans>
								</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								{[
									{ label: t`Straight and open posture`, score: 85 },
									{ label: t`Maintained eye contact`, score: 70 },
									{ label: t`Clear and confident voice`, score: 75 },
									{ label: t`Calm and composed gestures`, score: 80 },
								].map((item, index) => (
									<motion.div
										key={item.label}
										initial={false}
										animate={{ opacity: 1, x: 0 }}
										transition={{ delay: index * 0.1 }}
										className="flex items-center gap-3"
									>
										<CheckCircleIcon
											className={cn("size-5", item.score >= 75 ? "text-green-500" : "text-amber-500")}
											weight="fill"
										/>
										<div className="flex-1">
											<div className="flex justify-between text-sm">
												<span>{item.label}</span>
												<span className="font-semibold">{item.score}%</span>
											</div>
											<Progress value={item.score} className="mt-1 h-1.5" />
										</div>
									</motion.div>
								))}
							</CardContent>
						</Card>

						{/* Facial Expression Feedback */}
						<Card className="bg-gradient-to-br from-cyan-500/10 to-transparent">
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<SmileyIcon className="size-5 text-cyan-500" weight="duotone" />
									<Trans>Facial Expressions</Trans>
								</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="grid grid-cols-3 gap-3 text-center">
									{[
										{ emoji: "neutral", label: t`Neutral`, percentage: "45%" },
										{ emoji: "smile", label: t`Smile`, percentage: "35%" },
										{ emoji: "focused", label: t`Focused`, percentage: "20%" },
									].map((expression, index) => (
										<motion.div
											key={expression.label}
											initial={false}
											animate={{ opacity: 1, y: 0 }}
											transition={{ delay: index * 0.1 }}
											className="rounded-lg border bg-card p-3"
										>
											<div className="mb-2 text-3xl">
												{expression.emoji === "neutral" && <SmileyIcon className="mx-auto size-10 text-slate-500" />}
												{expression.emoji === "smile" && (
													<SmileyIcon className="mx-auto size-10 text-green-500" weight="fill" />
												)}
												{expression.emoji === "focused" && (
													<EyeIcon className="mx-auto size-10 text-blue-500" weight="duotone" />
												)}
											</div>
											<p className="font-medium text-sm">{expression.label}</p>
											<p className="text-muted-foreground text-xs">{expression.percentage}</p>
										</motion.div>
									))}
								</div>
								<div className="rounded-lg bg-muted/50 p-3">
									<p className="text-sm">
										<Trans>
											Tip: Smile more at the beginning and end of the interview. A natural smile projects confidence and
											approachability.
										</Trans>
									</p>
								</div>
							</CardContent>
						</Card>
					</section>
				</TabsContent>

				{/* Upload Tab */}
				<TabsContent value="upload" className="space-y-6">
					<VideoUploadInterface onAnalyze={handleAnalyze} isAnalyzing={isAnalyzing} />

					{/* Category Analysis Preview */}
					<Card>
						<CardHeader>
							<CardTitle>
								<Trans>Analysis Categories</Trans>
							</CardTitle>
							<CardDescription>
								<Trans>Here is what will be analyzed in your video</Trans>
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
								{(Object.entries(categoryLabels) as [VideoAnalysisCategory, string][]).map(([key, label]) => {
									const Icon = categoryIcons[key];
									return (
										<motion.div
											key={key}
											initial={false}
											animate={{ opacity: 1, scale: 1 }}
											whileHover={{ scale: 1.02 }}
											className={cn(
												"flex items-center gap-3 rounded-xl border bg-gradient-to-br p-4",
												categoryColors[key],
											)}
										>
											<div
												className={cn("flex size-10 items-center justify-center rounded-lg", categoryBadgeColors[key])}
											>
												<Icon className="size-5" weight="duotone" />
											</div>
											<div>
												<h4 className="font-semibold">{label}</h4>
												<p className="text-muted-foreground text-xs">
													<Trans>Complete analysis</Trans>
												</p>
											</div>
										</motion.div>
									);
								})}
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				{/* Results Tab */}
				<TabsContent value="results" className="space-y-6">
					{analysisResult ? (
						<>
							<AnalysisResultsDashboard result={analysisResult} />

							{/* Detailed Category Analysis */}
							<Card>
								<CardHeader>
									<CardTitle>
										<Trans>Detailed Analysis by Category</Trans>
									</CardTitle>
									<CardDescription>
										<Trans>Click on each category to see details and suggestions</Trans>
									</CardDescription>
								</CardHeader>
								<CardContent className="space-y-3">
									{analysisResult.categories.map((cat) => (
										<CategoryAnalysisCard key={cat.category} analysis={cat} />
									))}
								</CardContent>
							</Card>

							{/* Voice Analysis Details */}
							<Card>
								<CardHeader>
									<CardTitle className="flex items-center gap-2">
										<MicrophoneIcon className="size-5 text-green-500" />
										<Trans>Detailed Voice Analysis</Trans>
									</CardTitle>
								</CardHeader>
								<CardContent>
									<VoiceModulationChart metrics={analysisResult.voiceMetrics} />
								</CardContent>
							</Card>
						</>
					) : (
						<div className="py-12 text-center">
							<VideoCameraIcon className="mx-auto mb-4 size-16 text-muted-foreground" />
							<h3 className="mb-2 font-semibold text-xl">
								<Trans>No analysis available</Trans>
							</h3>
							<p className="mb-4 text-muted-foreground">
								<Trans>Upload or record a video to get a complete analysis.</Trans>
							</p>
							<Button onClick={() => setActiveTab("upload")}>
								<VideoCameraIcon className="mr-2 size-4" />
								<Trans>Analyze a Video</Trans>
							</Button>
						</div>
					)}
				</TabsContent>
			</Tabs>
		</>
	);
}
