import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import {
	ArrowUpIcon,
	CameraIcon,
	CaretDownIcon,
	CaretUpIcon,
	CheckCircleIcon,
	ClockIcon,
	EyeIcon,
	GaugeIcon,
	HandIcon,
	HeartIcon,
	LightbulbIcon,
	MicrophoneIcon,
	PersonArmsSpreadIcon,
	SparkleIcon,
	SpeakerHighIcon,
	SpinnerIcon,
	UserIcon,
	VideoCameraIcon,
	WarningCircleIcon,
	WaveformIcon,
	XCircleIcon,
} from "@phosphor-icons/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { authClient } from "@/integrations/auth/client";
import type {
	VideoAnalysisCategoryScore,
	VideoAnalysisHighlight,
	VideoAnalysisVoiceMetrics,
} from "@/integrations/drizzle/schema";
import { orpc } from "@/integrations/orpc/client";
import { cn } from "@/utils/style";
import {
	type bodyLanguageTips,
	categoryBadgeColors,
	categoryColors,
	categoryIcons,
	categoryLabels,
	eyeContactGuidance,
	postureChecklistItems,
} from "./video-analysis-config";
import type { AnalysisResult } from "./video-analysis-types";

// Animated Score Ring Component
function ScoreRing({ score, size = 120, strokeWidth = 10 }: { score: number; size?: number; strokeWidth?: number }) {
	const radius = (size - strokeWidth) / 2;
	const circumference = radius * 2 * Math.PI;
	const offset = circumference - (score / 100) * circumference;

	const getScoreColor = (s: number) => {
		if (s >= 80) return "stroke-green-500";
		if (s >= 60) return "stroke-amber-500";
		return "stroke-red-500";
	};

	return (
		<div className="relative" style={{ width: size, height: size }}>
			<svg className="-rotate-90 transform" width={size} height={size}>
				<circle
					cx={size / 2}
					cy={size / 2}
					r={radius}
					fill="none"
					stroke="currentColor"
					strokeWidth={strokeWidth}
					className="text-muted/20"
				/>
				<motion.circle
					cx={size / 2}
					cy={size / 2}
					r={radius}
					fill="none"
					strokeWidth={strokeWidth}
					strokeLinecap="round"
					className={getScoreColor(score)}
					initial={{ strokeDashoffset: circumference }}
					animate={{ strokeDashoffset: offset }}
					transition={{ duration: 1.5, ease: "easeOut" }}
					style={{ strokeDasharray: circumference }}
				/>
			</svg>
			<div className="absolute inset-0 flex items-center justify-center">
				<motion.span
					className="font-bold text-3xl"
					initial={false}
					animate={{ opacity: 1, scale: 1 }}
					transition={{ delay: 0.5, duration: 0.5 }}
				>
					{score}%
				</motion.span>
			</div>
		</div>
	);
}

// Voice Modulation Visualization Component
export function VoiceModulationChart({ metrics }: { metrics: VideoAnalysisVoiceMetrics }) {
	const items = [
		{ ...metrics.tone, icon: WaveformIcon },
		{ ...metrics.pace, icon: GaugeIcon },
		{ ...metrics.clarity, icon: SpeakerHighIcon },
		{ ...metrics.volume, icon: MicrophoneIcon },
	];

	return (
		<div className="space-y-4">
			{items.map((item, index) => (
				<motion.div
					key={item.label}
					initial={false}
					animate={{ opacity: 1, x: 0 }}
					transition={{ delay: index * 0.1 }}
					className="space-y-2"
				>
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-2">
							<item.icon className="size-4 text-muted-foreground" />
							<span className="font-medium text-sm">{item.label}</span>
						</div>
						<Badge variant={item.score >= 75 ? "default" : item.score >= 50 ? "secondary" : "destructive"}>
							{item.score}%
						</Badge>
					</div>
					<Progress value={item.score} className="h-2" />
					<p className="text-muted-foreground text-xs">{item.description}</p>
				</motion.div>
			))}

			{/* Filler Words Section */}
			<div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-900/20">
				<div className="mb-2 flex items-center gap-2">
					<WarningCircleIcon className="size-5 text-amber-600" />
					<span className="font-semibold text-amber-700 dark:text-amber-400">
						<Trans>Filler Words Detected</Trans>: {metrics.fillerWords.count}
					</span>
				</div>
				<div className="flex flex-wrap gap-2">
					{metrics.fillerWords.examples.map((word, i) => (
						<Badge key={i} variant="outline" className="border-amber-300 text-amber-700 dark:text-amber-400">
							"{word}"
						</Badge>
					))}
				</div>
			</div>
		</div>
	);
}

// Category Analysis Card Component
export function CategoryAnalysisCard({ analysis }: { analysis: VideoAnalysisCategoryScore }) {
	const [isExpanded, setIsExpanded] = useState(false);
	const Icon = categoryIcons[analysis.category];

	const getScoreBadgeColor = (score: number) => {
		if (score >= 80) return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
		if (score >= 60) return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";
		return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
	};

	return (
		<motion.div
			initial={false}
			animate={{ opacity: 1, y: 0 }}
			className={cn("rounded-xl border bg-gradient-to-br transition-all", categoryColors[analysis.category])}
		>
			<button
				type="button"
				className="flex w-full items-center justify-between p-4 text-left"
				onClick={() => setIsExpanded(!isExpanded)}
			>
				<div className="flex items-center gap-3">
					<div
						className={cn(
							"flex size-10 items-center justify-center rounded-lg",
							categoryBadgeColors[analysis.category],
						)}
					>
						<Icon className="size-5" weight="duotone" />
					</div>
					<div>
						<h4 className="font-semibold">{categoryLabels[analysis.category]}</h4>
						<p className="line-clamp-1 text-muted-foreground text-sm">{analysis.feedback}</p>
					</div>
				</div>
				<div className="flex items-center gap-3">
					<Badge className={getScoreBadgeColor(analysis.score)}>{analysis.score}%</Badge>
					<motion.div animate={{ rotate: isExpanded ? 180 : 0 }}>
						<CaretDownIcon className="size-5 text-muted-foreground" />
					</motion.div>
				</div>
			</button>

			<AnimatePresence>
				{isExpanded && (
					<motion.div
						initial={{ height: 0, opacity: 0 }}
						animate={{ height: "auto", opacity: 1 }}
						exit={{ height: 0, opacity: 0 }}
						transition={{ duration: 0.2 }}
						className="overflow-hidden"
					>
						<div className="space-y-4 border-t p-4">
							<p className="text-sm">{analysis.feedback}</p>

							<div>
								<h5 className="mb-2 flex items-center gap-2 font-semibold text-sm">
									<LightbulbIcon className="size-4 text-amber-500" weight="fill" />
									<Trans>Improvement Suggestions</Trans>
								</h5>
								<ul className="space-y-2">
									{analysis.suggestions.map((suggestion, idx) => (
										<li key={idx} className="flex items-start gap-2 text-sm">
											<CheckCircleIcon className="mt-0.5 size-4 shrink-0 text-green-500" />
											<span>{suggestion}</span>
										</li>
									))}
								</ul>
							</div>
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</motion.div>
	);
}

// Body Language Tip Card Component
export function BodyLanguageTipCard({ tip }: { tip: (typeof bodyLanguageTips)[0] }) {
	return (
		<motion.div
			initial={false}
			animate={{ opacity: 1, scale: 1 }}
			whileHover={{ scale: 1.02 }}
			className="rounded-xl border bg-card p-4"
		>
			{/* Illustration Area */}
			<div className="mb-4 flex h-32 items-center justify-center rounded-lg bg-gradient-to-br from-primary/10 to-primary/5">
				{tip.illustration === "arms-open" && (
					<div className="relative">
						<PersonArmsSpreadIcon className="size-20 text-primary" weight="duotone" />
						<motion.div
							className="absolute -top-2 -right-2"
							animate={{ scale: [1, 1.2, 1] }}
							transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
						>
							<CheckCircleIcon className="size-6 text-green-500" weight="fill" />
						</motion.div>
					</div>
				)}
				{tip.illustration === "hand-gesture" && (
					<div className="relative">
						<HandIcon className="size-20 text-primary" weight="duotone" />
						<motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}>
							<SparkleIcon className="absolute top-0 -right-2 size-6 text-amber-500" weight="fill" />
						</motion.div>
					</div>
				)}
				{tip.illustration === "lean" && (
					<div className="relative flex items-center gap-4">
						<UserIcon className="size-16 text-primary" weight="duotone" />
						<motion.div animate={{ x: [0, 5, 0] }} transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}>
							<ArrowUpIcon className="size-8 rotate-45 text-green-500" />
						</motion.div>
					</div>
				)}
				{tip.illustration === "calm" && (
					<div className="relative">
						<UserIcon className="size-20 text-primary" weight="duotone" />
						<motion.div
							className="absolute -bottom-2 left-1/2 -translate-x-1/2"
							animate={{ opacity: [0.5, 1, 0.5] }}
							transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
						>
							<HeartIcon className="size-6 text-red-400" weight="fill" />
						</motion.div>
					</div>
				)}
			</div>

			<h4 className="mb-2 font-semibold">{tip.title}</h4>
			<p className="mb-4 text-muted-foreground text-sm">{tip.description}</p>

			<div className="grid grid-cols-2 gap-2 text-xs">
				<div className="flex items-start gap-2 rounded-lg bg-green-50 p-2 dark:bg-green-900/20">
					<CheckCircleIcon className="mt-0.5 size-4 shrink-0 text-green-600" />
					<span className="text-green-700 dark:text-green-400">{tip.do}</span>
				</div>
				<div className="flex items-start gap-2 rounded-lg bg-red-50 p-2 dark:bg-red-900/20">
					<XCircleIcon className="mt-0.5 size-4 shrink-0 text-red-600" />
					<span className="text-red-700 dark:text-red-400">{tip.dont}</span>
				</div>
			</div>
		</motion.div>
	);
}

// Eye Contact Guidance Component
export function EyeContactGuidance() {
	return (
		<div className="space-y-6">
			{/* Visual Indicator */}
			<div className="relative mx-auto aspect-video max-w-md overflow-hidden rounded-xl border bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900">
				{/* Camera Icon in Center */}
				<div className="absolute top-4 left-1/2 -translate-x-1/2">
					<motion.div
						animate={{ scale: [1, 1.1, 1] }}
						transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
						className="flex size-12 items-center justify-center rounded-full bg-green-500"
					>
						<CameraIcon className="size-6 text-white" weight="fill" />
					</motion.div>
					<p className="mt-1 text-center font-medium text-green-600 text-xs">
						<Trans>Main Zone</Trans>
					</p>
				</div>

				{/* User Silhouette */}
				<div className="absolute bottom-0 left-1/2 -translate-x-1/2">
					<UserIcon className="size-32 text-slate-400" weight="light" />
				</div>

				{/* Eye Direction Arrows */}
				<motion.div
					className="absolute top-20 left-1/2 -translate-x-1/2"
					animate={{ y: [0, -5, 0] }}
					transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
				>
					<ArrowUpIcon className="size-8 text-green-500" />
				</motion.div>

				{/* Side Zones */}
				<div className="absolute top-1/2 left-4 -translate-y-1/2">
					<div className="flex size-8 items-center justify-center rounded-full bg-amber-500/50">
						<EyeIcon className="size-4 text-amber-700" />
					</div>
				</div>
				<div className="absolute top-1/2 right-4 -translate-y-1/2">
					<div className="flex size-8 items-center justify-center rounded-full bg-amber-500/50">
						<EyeIcon className="size-4 text-amber-700" />
					</div>
				</div>
			</div>

			{/* Zone Breakdown */}
			<div className="grid gap-3">
				{eyeContactGuidance.map((zone, index) => (
					<motion.div
						key={zone.zone}
						initial={false}
						animate={{ opacity: 1, x: 0 }}
						transition={{ delay: index * 0.1 }}
						className="flex items-center gap-4 rounded-lg border p-3"
					>
						<div className={cn("h-full w-2 rounded-full", zone.color)} style={{ minHeight: 40 }} />
						<div className="flex-1">
							<div className="flex items-center justify-between">
								<h5 className="font-medium">{zone.label}</h5>
								<Badge variant="outline">{zone.percentage}%</Badge>
							</div>
							<p className="text-muted-foreground text-sm">{zone.description}</p>
						</div>
					</motion.div>
				))}
			</div>
		</div>
	);
}

// Posture Checklist Component (Database-driven)
export function PostureChecklist() {
	const queryClient = useQueryClient();
	const { data: session } = authClient.useSession();

	// Fetch checklist state from database
	const { data: checklistState, isLoading } = useQuery({
		...orpc.videoAnalysis.postureChecklist.get.queryOptions(),
		enabled: !!session?.user,
	});

	// Toggle item mutation
	const toggleItemMutation = useMutation(
		orpc.videoAnalysis.postureChecklist.toggleItem.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries({ queryKey: ["videoAnalysis"] });
			},
			onError: () => {
				toast.error(t`Error during update`);
			},
		}),
	);

	const checkedItems = useMemo(() => checklistState?.checkedItems ?? [], [checklistState]);

	const handleToggle = useCallback(
		(id: string) => {
			toggleItemMutation.mutate({ itemId: id });
		},
		[toggleItemMutation],
	);

	const completedCount = checkedItems.length;
	const progress = (completedCount / postureChecklistItems.length) * 100;

	if (isLoading) {
		return (
			<div className="flex items-center justify-center py-8">
				<SpinnerIcon className="size-6 animate-spin text-muted-foreground" />
			</div>
		);
	}

	return (
		<div className="space-y-4">
			{/* Progress Header */}
			<div className="flex items-center justify-between">
				<div>
					<h4 className="font-semibold">
						<Trans>Posture Checklist</Trans>
					</h4>
					<p className="text-muted-foreground text-sm">
						{completedCount}/{postureChecklistItems.length} <Trans>items checked</Trans>
					</p>
				</div>
				<ScoreRing score={Math.round(progress)} size={60} strokeWidth={6} />
			</div>

			<Progress value={progress} className="h-2" />

			{/* Checklist Items */}
			<div className="space-y-2">
				{postureChecklistItems.map((item, index) => {
					const isChecked = checkedItems.includes(item.id);
					return (
						<motion.button
							key={item.id}
							type="button"
							initial={false}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: index * 0.05 }}
							className={cn(
								"flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-all",
								isChecked
									? "border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-900/20"
									: "hover:bg-muted/50",
							)}
							onClick={() => handleToggle(item.id)}
							disabled={toggleItemMutation.isPending}
						>
							<div
								className={cn(
									"flex size-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
									isChecked ? "border-green-500 bg-green-500 text-white" : "border-muted-foreground/30",
								)}
							>
								{isChecked && <CheckCircleIcon className="size-4" weight="bold" />}
							</div>
							<span className={cn(isChecked && "text-green-700 dark:text-green-400")}>{item.label}</span>
						</motion.button>
					);
				})}
			</div>
		</div>
	);
}

// Video Upload/Record Interface Component
//
// HONESTY NOTE: There is no real video-analysis backend (no computer-vision or
// audio model wired to these uploads). Previously this component fabricated an
// analysis with Math.random() and presented it as real measurements, which is
// dishonest. Until a real analysis pipeline exists, we show a clear
// "coming soon" state instead of fake scores. The `onAnalyze` / `isAnalyzing`
// props are kept for API compatibility with the parent route but are no longer
// invoked.
export function VideoUploadInterface({
	onAnalyze: _onAnalyze,
	isAnalyzing: _isAnalyzing,
}: {
	onAnalyze: (duration: number) => void;
	isAnalyzing: boolean;
}) {
	return (
		<Card className="overflow-hidden">
			<CardHeader className="bg-gradient-to-r from-primary/10 to-transparent">
				<CardTitle className="flex items-center gap-2">
					<VideoCameraIcon className="size-5 text-primary" weight="duotone" />
					<Trans>AI Video Analysis</Trans>
				</CardTitle>
				<CardDescription>
					<Trans>Automatic analysis of your body language, eye contact, and voice.</Trans>
				</CardDescription>
			</CardHeader>
			<CardContent className="p-6">
				<div className="relative aspect-video overflow-hidden rounded-xl border-2 border-dashed bg-muted/30">
					<motion.div
						initial={false}
						animate={{ opacity: 1 }}
						className="flex h-full flex-col items-center justify-center gap-4 p-6 text-center"
					>
						<div className="flex size-20 items-center justify-center rounded-full bg-primary/10">
							<SparkleIcon className="size-10 text-primary" weight="duotone" />
						</div>
						<div className="space-y-1">
							<Badge variant="secondary" className="mb-1">
								<ClockIcon className="mr-1 size-3" />
								<Trans>Coming soon</Trans>
							</Badge>
							<h4 className="font-semibold text-lg">
								<Trans>AI video analysis — coming soon</Trans>
							</h4>
							<p className="mx-auto max-w-md text-muted-foreground text-sm">
								<Trans>
									Automatic scoring of your video (body language, eye contact, voice, confidence) is under development.
									In the meantime, use the tips above to prepare. We will not show you a score that has not been truly
									measured.
								</Trans>
							</p>
						</div>
					</motion.div>
				</div>
			</CardContent>
		</Card>
	);
}

// Analysis Results Dashboard Component
export function AnalysisResultsDashboard({ result }: { result: AnalysisResult }) {
	return (
		<div className="space-y-6">
			{/* Overall Score Card */}
			<motion.div initial={false} animate={{ opacity: 1, y: 0 }}>
				<Card className="overflow-hidden">
					<CardContent className="p-0">
						<div className="flex flex-col items-center gap-6 bg-gradient-to-r from-primary/10 via-purple-500/10 to-blue-500/10 p-8 md:flex-row md:justify-between">
							<div className="text-center md:text-left">
								<h3 className="mb-2 font-bold text-2xl">
									<Trans>Overall Analysis Score</Trans>
								</h3>
								<p className="text-muted-foreground">
									<Trans>Based on analysis of</Trans> {Math.floor(result.duration / 60)}:
									{String(result.duration % 60).padStart(2, "0")} <Trans>of video</Trans>
								</p>
							</div>
							<ScoreRing score={result.overallScore} size={140} strokeWidth={12} />
						</div>

						{/* Category Scores Grid */}
						<div className="grid gap-4 p-6 md:grid-cols-3">
							{result.categories.map((cat, index) => {
								const Icon = categoryIcons[cat.category];
								return (
									<motion.div
										key={cat.category}
										initial={false}
										animate={{ opacity: 1, scale: 1 }}
										transition={{ delay: index * 0.1 }}
										className="flex items-center gap-3 rounded-lg border p-3"
									>
										<div
											className={cn(
												"flex size-10 items-center justify-center rounded-lg",
												categoryBadgeColors[cat.category],
											)}
										>
											<Icon className="size-5" weight="duotone" />
										</div>
										<div className="flex-1">
											<p className="font-medium text-sm">{categoryLabels[cat.category]}</p>
											<div className="flex items-center gap-2">
												<Progress value={cat.score} className="h-1.5 flex-1" />
												<span className="font-semibold text-sm">{cat.score}%</span>
											</div>
										</div>
									</motion.div>
								);
							})}
						</div>
					</CardContent>
				</Card>
			</motion.div>

			{/* Highlights Timeline */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<ClockIcon className="size-5" />
						<Trans>Key Moments</Trans>
					</CardTitle>
					<CardDescription>
						<Trans>Strengths and areas for improvement detected during the video</Trans>
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="space-y-3">
						{result.highlights.map((highlight, index) => (
							<motion.div
								key={index}
								initial={false}
								animate={{ opacity: 1, x: 0 }}
								transition={{ delay: index * 0.05 }}
								className={cn(
									"flex items-start gap-3 rounded-lg border p-3",
									highlight.type === "positive"
										? "border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-900/20"
										: "border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-900/20",
								)}
							>
								<div
									className={cn(
										"flex size-8 shrink-0 items-center justify-center rounded-full",
										highlight.type === "positive" ? "bg-green-500 text-white" : "bg-red-500 text-white",
									)}
								>
									{highlight.type === "positive" ? (
										<CaretUpIcon className="size-4" weight="bold" />
									) : (
										<CaretDownIcon className="size-4" weight="bold" />
									)}
								</div>
								<div className="flex-1">
									<div className="flex items-center justify-between">
										<Badge variant="outline" className="font-mono">
											{highlight.time}
										</Badge>
									</div>
									<p className="mt-1 text-sm">{highlight.description}</p>
								</div>
							</motion.div>
						))}
					</div>
				</CardContent>
			</Card>

			{/* Recommendations */}
			<Card>
				<CardHeader className="bg-gradient-to-r from-amber-500/10 to-transparent">
					<CardTitle className="flex items-center gap-2">
						<LightbulbIcon className="size-5 text-amber-500" weight="fill" />
						<Trans>Personalized Recommendations</Trans>
					</CardTitle>
				</CardHeader>
				<CardContent className="p-6">
					<div className="grid gap-3 md:grid-cols-2">
						{result.recommendations.map((rec, index) => (
							<motion.div
								key={index}
								initial={false}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: index * 0.1 }}
								className="flex items-start gap-3 rounded-lg border bg-card p-3"
							>
								<div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary text-xs">
									{index + 1}
								</div>
								<p className="text-sm">{rec}</p>
							</motion.div>
						))}
					</div>
				</CardContent>
			</Card>
		</div>
	);
}

// DEPRECATED — DO NOT USE FOR USER-FACING SCORES.
//
// This previously fabricated an "analysis" with Math.random() and presented it
// as a real measurement. That is dishonest, so the upload flow no longer calls
// this. It is retained only so the parent route keeps compiling, and it now
// returns an empty, deterministic, clearly-empty result (no random values).
// When a real video-analysis backend exists, replace this with a call to that
// service and remove this note.
export function generateAnalysisResult(duration: number): Omit<AnalysisResult, "id"> {
	const emptyVoiceMetrics: VideoAnalysisVoiceMetrics = {
		tone: { label: t`Tone`, score: 0, description: "" },
		pace: { label: t`Pace`, score: 0, description: "" },
		clarity: { label: t`Clarity`, score: 0, description: "" },
		volume: { label: t`Volume`, score: 0, description: "" },
		fillerWords: { count: 0, examples: [] },
	};

	return {
		overallScore: 0,
		duration,
		timestamp: new Date().toISOString(),
		categories: [] as VideoAnalysisCategoryScore[],
		voiceMetrics: emptyVoiceMetrics,
		highlights: [] as VideoAnalysisHighlight[],
		recommendations: [] as string[],
	};
}
