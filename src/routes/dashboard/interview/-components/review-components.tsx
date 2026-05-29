import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import {
	ArrowClockwiseIcon,
	ArrowRightIcon,
	ArrowUpIcon,
	CalendarIcon,
	CaretDownIcon,
	CaretUpIcon,
	ChartBarIcon,
	CheckCircleIcon,
	ClockIcon,
	CloudArrowUpIcon,
	EyeIcon,
	FilmStripIcon,
	GaugeIcon,
	LightbulbIcon,
	ListChecksIcon,
	MagnifyingGlassIcon,
	MicrophoneIcon,
	PersonArmsSpreadIcon,
	PlayIcon,
	SealCheckIcon,
	SparkleIcon,
	SpeakerHighIcon,
	SpinnerIcon,
	TargetIcon,
	TextAaIcon,
	TrashIcon,
	TrendUpIcon,
	TrophyIcon,
	UploadSimpleIcon,
	VideoCameraIcon,
	VideoIcon,
	WarningCircleIcon,
	WaveformIcon,
	XCircleIcon,
} from "@phosphor-icons/react";
import type { UseMutationResult } from "@tanstack/react-query";
import { AnimatePresence, motion } from "motion/react";
import type { Dispatch, SetStateAction } from "react";
import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/utils/style";

import { DashboardHeader } from "../../-components/header";
import {
	bodyLanguageCategoryColors,
	bodyLanguageCategoryLabels,
	fieldLabels,
	fillerWordTips,
	recordingTips,
	severityColors,
	statusColors,
	statusLabels,
} from "./review-config";
import type { AnswerSegment, FillerWord, ProgressData, Recording } from "./review-types";

// Helper Components
function AnimatedScore({ value, duration = 1500 }: { value: number; duration?: number }) {
	const [displayValue, setDisplayValue] = useState(0);

	useEffect(() => {
		let startTime: number;
		let animationFrame: number;

		const animate = (timestamp: number) => {
			if (!startTime) startTime = timestamp;
			const progress = Math.min((timestamp - startTime) / duration, 1);
			const easeOutQuart = 1 - (1 - progress) ** 4;
			setDisplayValue(Math.round(easeOutQuart * value));

			if (progress < 1) {
				animationFrame = requestAnimationFrame(animate);
			}
		};

		animationFrame = requestAnimationFrame(animate);
		return () => cancelAnimationFrame(animationFrame);
	}, [value, duration]);

	return <span>{displayValue}</span>;
}

function CircularProgress({
	value,
	size = 120,
	strokeWidth = 8,
	color = "hsl(var(--primary))",
}: {
	value: number;
	size?: number;
	strokeWidth?: number;
	color?: string;
}) {
	const radius = (size - strokeWidth) / 2;
	const circumference = radius * 2 * Math.PI;
	const offset = circumference - (value / 100) * circumference;

	return (
		<div className="relative" style={{ width: size, height: size }}>
			<svg className="rotate-[-90deg]" width={size} height={size}>
				<circle
					className="text-muted/30"
					strokeWidth={strokeWidth}
					stroke="currentColor"
					fill="transparent"
					r={radius}
					cx={size / 2}
					cy={size / 2}
				/>
				<motion.circle
					stroke={color}
					strokeWidth={strokeWidth}
					strokeLinecap="round"
					fill="transparent"
					r={radius}
					cx={size / 2}
					cy={size / 2}
					style={{
						strokeDasharray: circumference,
						strokeDashoffset: circumference,
					}}
					animate={{ strokeDashoffset: offset }}
					transition={{ duration: 1.5, ease: "easeOut" }}
				/>
			</svg>
			<div className="absolute inset-0 flex flex-col items-center justify-center">
				<span className="font-bold text-2xl">
					<AnimatedScore value={value} />%
				</span>
			</div>
		</div>
	);
}

function ProgressChart({ data }: { data: ProgressData[] }) {
	if (data.length === 0) {
		return (
			<div className="flex h-[180px] items-center justify-center text-muted-foreground">
				<Trans>No progress data yet</Trans>
			</div>
		);
	}

	const chartHeight = 180;
	const chartWidth = 100;
	const values = data.map((d) => d.overallScore);
	const minVal = Math.min(...values) - 10;
	const maxVal = Math.max(...values) + 10;
	const range = maxVal - minVal || 1;

	const getY = (value: number) => chartHeight - ((value - minVal) / range) * (chartHeight - 40);

	const pathData = values
		.map((value, index) => {
			const x = (index / (values.length - 1 || 1)) * chartWidth;
			const y = getY(value);
			return `${index === 0 ? "M" : "L"} ${x} ${y}`;
		})
		.join(" ");

	const areaPath = `${pathData} L ${chartWidth} ${chartHeight} L 0 ${chartHeight} Z`;

	return (
		<div className="relative h-[180px] w-full">
			<svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} preserveAspectRatio="none" className="h-full w-full">
				<defs>
					<linearGradient id="progressGradient" x1="0%" y1="0%" x2="0%" y2="100%">
						<stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.3" />
						<stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
					</linearGradient>
				</defs>
				<motion.path
					d={areaPath}
					fill="url(#progressGradient)"
					initial={false}
					animate={{ opacity: 1 }}
					transition={{ duration: 1 }}
				/>
				<motion.path
					d={pathData}
					fill="none"
					stroke="hsl(var(--primary))"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
					initial={{ pathLength: 0 }}
					animate={{ pathLength: 1 }}
					transition={{ duration: 2, ease: "easeOut" }}
				/>
				{values.map((value, index) => (
					<motion.circle
						key={index}
						cx={(index / (values.length - 1 || 1)) * chartWidth}
						cy={getY(value)}
						r="3"
						fill="hsl(var(--background))"
						stroke="hsl(var(--primary))"
						strokeWidth="2"
						initial={{ scale: 0 }}
						animate={{ scale: 1 }}
						transition={{ delay: 0.5 + index * 0.1 }}
					/>
				))}
			</svg>
			<div className="absolute right-0 bottom-0 left-0 flex justify-between text-muted-foreground text-xs">
				{data.map((d, i) => (
					<span key={i} className={i === 0 || i === data.length - 1 ? "" : "hidden md:block"}>
						{new Date(d.date).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
					</span>
				))}
			</div>
		</div>
	);
}

function ScoreBar({
	label,
	value,
	icon: Icon,
	color = "primary",
}: {
	label: string;
	value: number;
	icon: React.ElementType;
	color?: string;
}) {
	const colorClasses: Record<string, string> = {
		primary: "[&>[data-slot=progress-indicator]]:bg-primary",
		green: "[&>[data-slot=progress-indicator]]:bg-green-500",
		blue: "[&>[data-slot=progress-indicator]]:bg-blue-500",
		amber: "[&>[data-slot=progress-indicator]]:bg-amber-500",
		purple: "[&>[data-slot=progress-indicator]]:bg-purple-500",
		red: "[&>[data-slot=progress-indicator]]:bg-red-500",
	};

	return (
		<div className="space-y-2">
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-2">
					<Icon className="size-4 text-muted-foreground" />
					<span className="text-sm">{label}</span>
				</div>
				<span className="font-semibold text-sm">{value}%</span>
			</div>
			<Progress value={value} className={cn("h-2", colorClasses[color])} />
		</div>
	);
}

function FillerWordBadge({ word, count }: { word: string; count: number }) {
	const severity = count > 10 ? "high" : count > 5 ? "medium" : "low";
	const colors = {
		high: "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800",
		medium:
			"bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800",
		low: "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800",
	};

	return (
		<div className={cn("flex items-center gap-2 rounded-full border px-3 py-1", colors[severity])}>
			<span className="font-medium">"{word}"</span>
			<Badge variant="secondary" className="size-6 rounded-full p-0 text-xs">
				{count}
			</Badge>
		</div>
	);
}

function SegmentCard({
	segment,
	isExpanded,
	onToggle,
}: {
	segment: AnswerSegment;
	isExpanded: boolean;
	onToggle: () => void;
}) {
	const formatTime = (seconds: number) => {
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return `${mins}:${secs.toString().padStart(2, "0")}`;
	};

	const paceStatus = segment.speakingPace < 120 ? "slow" : segment.speakingPace > 160 ? "fast" : "optimal";
	const paceColors = {
		slow: "text-blue-600",
		optimal: "text-green-600",
		fast: "text-amber-600",
	};
	const paceLabels = {
		slow: "Too slow",
		optimal: "Optimal",
		fast: "Too fast",
	};

	return (
		<motion.div layout className="overflow-hidden rounded-xl border">
			<Collapsible open={isExpanded} onOpenChange={onToggle}>
				<CollapsibleTrigger asChild>
					<button className="flex w-full items-center justify-between p-4 text-left transition-colors hover:bg-muted/50">
						<div className="flex items-center gap-4">
							<div
								className={cn(
									"flex size-12 items-center justify-center rounded-xl",
									segment.score >= 80
										? "bg-green-100 dark:bg-green-900/30"
										: segment.score >= 60
											? "bg-amber-100 dark:bg-amber-900/30"
											: "bg-red-100 dark:bg-red-900/30",
								)}
							>
								<span
									className={cn(
										"font-bold text-lg",
										segment.score >= 80 ? "text-green-600" : segment.score >= 60 ? "text-amber-600" : "text-red-600",
									)}
								>
									{segment.score}
								</span>
							</div>
							<div>
								<h4 className="mb-1 line-clamp-1 font-medium">{segment.question}</h4>
								<div className="flex items-center gap-3 text-muted-foreground text-xs">
									<span className="flex items-center gap-1">
										<ClockIcon className="size-3" />
										{formatTime(segment.startTime)} - {formatTime(segment.endTime)}
									</span>
									<span className={cn("flex items-center gap-1", paceColors[paceStatus])}>
										<GaugeIcon className="size-3" />
										{segment.speakingPace} words/min ({paceLabels[paceStatus]})
									</span>
								</div>
							</div>
						</div>
						<motion.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
							<CaretDownIcon className="size-5 text-muted-foreground" />
						</motion.div>
					</button>
				</CollapsibleTrigger>

				<CollapsibleContent>
					<div className="space-y-4 border-t p-4">
						{/* Metrics Row */}
						<div className="grid gap-3 md:grid-cols-4">
							<div className="rounded-lg bg-muted/50 p-3 text-center">
								<GaugeIcon className="mx-auto mb-1 size-5 text-blue-500" />
								<p className="font-bold text-lg">{segment.speakingPace}</p>
								<p className="text-muted-foreground text-xs">Words/min</p>
							</div>
							<div className="rounded-lg bg-muted/50 p-3 text-center">
								<SpeakerHighIcon className="mx-auto mb-1 size-5 text-purple-500" />
								<p className="font-bold text-lg">{segment.clarity}%</p>
								<p className="text-muted-foreground text-xs">Clarity</p>
							</div>
							<div className="rounded-lg bg-muted/50 p-3 text-center">
								<TextAaIcon className="mx-auto mb-1 size-5 text-amber-500" />
								<p className="font-bold text-lg">{segment.fillerWords.reduce((acc, fw) => acc + fw.count, 0)}</p>
								<p className="text-muted-foreground text-xs">
									<Trans>Filler words</Trans>
								</p>
							</div>
							<div className="rounded-lg bg-muted/50 p-3 text-center">
								<ListChecksIcon className="mx-auto mb-1 size-5 text-green-500" />
								<p className="font-bold text-lg">{Object.values(segment.structure).filter(Boolean).length}/4</p>
								<p className="text-muted-foreground text-xs">
									<Trans>Structure</Trans>
								</p>
							</div>
						</div>

						{/* Structure Checklist */}
						<div className="rounded-lg border p-3">
							<h5 className="mb-2 flex items-center gap-2 font-semibold text-sm">
								<ListChecksIcon className="size-4" />
								Answer structure
							</h5>
							<div className="grid gap-2 md:grid-cols-4">
								{[
									{ key: "hasIntro", label: "Introduction" },
									{ key: "hasBody", label: "Answer body" },
									{ key: "hasConclusion", label: "Conclusion" },
									{ key: "usesSTAR", label: "STAR Method" },
								].map((item) => (
									<div key={item.key} className="flex items-center gap-2">
										{segment.structure[item.key as keyof typeof segment.structure] ? (
											<CheckCircleIcon className="size-4 text-green-500" weight="fill" />
										) : (
											<XCircleIcon className="size-4 text-red-400" />
										)}
										<span className="text-sm">{item.label}</span>
									</div>
								))}
							</div>
						</div>

						{/* Transcript */}
						<div className="rounded-lg bg-muted/30 p-4">
							<h5 className="mb-2 flex items-center gap-2 font-semibold text-sm">
								<MicrophoneIcon className="size-4" />
								Transcription
							</h5>
							<p className="text-sm italic leading-relaxed">{segment.transcript}</p>
						</div>

						{/* Filler Words */}
						{segment.fillerWords.length > 0 && (
							<div>
								<h5 className="mb-2 flex items-center gap-2 font-semibold text-sm">
									<WarningCircleIcon className="size-4 text-amber-500" />
									Filler words detected
								</h5>
								<div className="flex flex-wrap gap-2">
									{segment.fillerWords.map((fw) => (
										<FillerWordBadge key={fw.word} word={fw.word} count={fw.count} />
									))}
								</div>
							</div>
						)}

						{/* Feedback */}
						<div className="rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-900 dark:bg-blue-900/20">
							<h5 className="mb-2 flex items-center gap-2 font-semibold text-blue-700 text-sm dark:text-blue-400">
								<LightbulbIcon className="size-4" weight="fill" />
								Feedback
							</h5>
							<ul className="space-y-1">
								{segment.feedback.map((fb, idx) => (
									<li key={idx} className="flex items-start gap-2 text-blue-700 text-sm dark:text-blue-300">
										<ArrowRightIcon className="mt-0.5 size-3 shrink-0" />
										{fb}
									</li>
								))}
							</ul>
						</div>

						{/* Ideal Answer Comparison */}
						{segment.idealAnswer && (
							<div className="rounded-lg border border-green-200 bg-green-50 p-3 dark:border-green-900 dark:bg-green-900/20">
								<h5 className="mb-2 flex items-center gap-2 font-semibold text-green-700 text-sm dark:text-green-400">
									<SealCheckIcon className="size-4" weight="fill" />
									Ideal answer (example)
								</h5>
								<p className="text-green-700 text-sm leading-relaxed dark:text-green-300">{segment.idealAnswer}</p>
							</div>
						)}
					</div>
				</CollapsibleContent>
			</Collapsible>
		</motion.div>
	);
}

function RecordingCard({
	recording,
	onSelect,
	onDelete,
	isDeleting,
}: {
	recording: Recording;
	onSelect: () => void;
	onDelete: () => void;
	isDeleting?: boolean;
}) {
	const formatDuration = (seconds: number) => {
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return `${mins}:${secs.toString().padStart(2, "0")}`;
	};

	return (
		<motion.div
			initial={false}
			animate={{ opacity: 1, y: 0 }}
			className="group overflow-hidden rounded-xl border transition-all hover:shadow-lg"
		>
			{/* Thumbnail Area */}
			<div className="relative aspect-video bg-gradient-to-br from-primary/10 to-primary/5">
				<div className="absolute inset-0 flex items-center justify-center">
					<VideoCameraIcon className="size-16 text-primary/30" weight="duotone" />
				</div>
				<div className="absolute right-2 bottom-2 rounded bg-black/70 px-2 py-1 text-white text-xs">
					{formatDuration(recording.duration)}
				</div>
				<div className="absolute top-2 left-2">
					<Badge className={statusColors[recording.status]}>{statusLabels[recording.status]}</Badge>
				</div>
				{recording.status === "analyzed" && (
					<div className="absolute top-2 right-2">
						<div
							className={cn(
								"flex size-10 items-center justify-center rounded-full font-bold text-white",
								recording.overallScore >= 80
									? "bg-green-500"
									: recording.overallScore >= 60
										? "bg-amber-500"
										: "bg-red-500",
							)}
						>
							{recording.overallScore}
						</div>
					</div>
				)}
				<button
					type="button"
					onClick={onSelect}
					className="absolute inset-0 flex items-center justify-center bg-black/0 transition-all group-hover:bg-black/30"
				>
					<div className="flex size-14 scale-0 items-center justify-center rounded-full bg-white/90 transition-transform group-hover:scale-100">
						<PlayIcon className="size-6 text-primary" weight="fill" />
					</div>
				</button>
			</div>

			{/* Info */}
			<div className="p-4">
				<h4 className="mb-1 line-clamp-1 font-semibold">{recording.title}</h4>
				<div className="mb-3 flex items-center gap-2 text-muted-foreground text-sm">
					<CalendarIcon className="size-4" />
					{new Date(recording.date).toLocaleDateString(undefined)}
					<span className="text-muted-foreground/50">|</span>
					<Badge variant="outline" className="text-xs">
						{fieldLabels[recording.field] || recording.field}
					</Badge>
				</div>

				{recording.status === "analyzed" && (
					<div className="mb-3 grid grid-cols-3 gap-2 text-center">
						<div>
							<p className="font-semibold text-lg text-primary">{recording.speakingPaceScore}%</p>
							<p className="text-muted-foreground text-xs">Pace</p>
						</div>
						<div>
							<p className="font-semibold text-lg text-primary">{recording.clarityScore}%</p>
							<p className="text-muted-foreground text-xs">Clarte</p>
						</div>
						<div>
							<p className="font-semibold text-lg text-primary">{recording.contentQualityScore}%</p>
							<p className="text-muted-foreground text-xs">Content</p>
						</div>
					</div>
				)}

				<div className="flex gap-2">
					<Button variant="default" className="flex-1 gap-2" onClick={onSelect}>
						<EyeIcon className="size-4" />
						<Trans>View analysis</Trans>
					</Button>
					<Button variant="ghost" size="icon" className="text-destructive" onClick={onDelete} disabled={isDeleting}>
						{isDeleting ? <SpinnerIcon className="size-4 animate-spin" /> : <TrashIcon className="size-4" />}
					</Button>
				</div>
			</div>
		</motion.div>
	);
}

// Loading skeleton for recordings
function RecordingCardSkeleton() {
	return (
		<div className="overflow-hidden rounded-xl border">
			<Skeleton className="aspect-video" />
			<div className="space-y-3 p-4">
				<Skeleton className="h-5 w-3/4" />
				<Skeleton className="h-4 w-1/2" />
				<div className="flex gap-2">
					<Skeleton className="h-9 flex-1" />
					<Skeleton className="size-9" />
				</div>
			</div>
		</div>
	);
}

// ============================================
// View Components (extracted from main route)
// ============================================

export type RecordingDetailViewProps = {
	selectedRecording: Recording;
	selectedRecordingLoading: boolean;
	activeTab: string;
	setActiveTab: (tab: string) => void;
	expandedSegment: string | null;
	setExpandedSegment: (id: string | null) => void;
	aggregateFillerWords: FillerWord[];
	onBack: () => void;
};

export function RecordingDetailView({
	selectedRecording,
	selectedRecordingLoading,
	activeTab,
	setActiveTab,
	expandedSegment,
	setExpandedSegment,
	aggregateFillerWords,
	onBack,
}: RecordingDetailViewProps) {
	return (
		<>
			<DashboardHeader icon={FilmStripIcon} title={t`Recording Analysis`} />

			{/* Back Button & Title */}
			<div className="mb-6 flex items-center gap-4">
				<Button variant="outline" onClick={onBack}>
					<ArrowRightIcon className="mr-2 size-4 rotate-180" />
					<Trans>Back</Trans>
				</Button>
				<div>
					<h2 className="font-semibold text-xl">{selectedRecording.title}</h2>
					<p className="text-muted-foreground text-sm">
						{new Date(selectedRecording.date).toLocaleDateString(undefined)} - {fieldLabels[selectedRecording.field]}
					</p>
				</div>
			</div>

			{selectedRecordingLoading ? (
				<div className="flex items-center justify-center py-12">
					<SpinnerIcon className="size-8 animate-spin text-primary" />
				</div>
			) : (
				<>
					{/* Score Overview */}
					<motion.div
						className="mb-8 overflow-hidden rounded-2xl border bg-gradient-to-br from-primary/5 to-transparent p-6 md:p-8"
						initial={false}
						animate={{ opacity: 1, y: 0 }}
					>
						<div className="grid gap-8 md:grid-cols-[auto,1fr]">
							{/* Main Score Circle */}
							<div className="flex flex-col items-center justify-center">
								<CircularProgress
									value={selectedRecording.overallScore}
									size={150}
									color={
										selectedRecording.overallScore >= 80
											? "hsl(142, 76%, 36%)"
											: selectedRecording.overallScore >= 60
												? "hsl(38, 92%, 50%)"
												: "hsl(0, 72%, 51%)"
									}
								/>
								<p className="mt-2 font-medium text-muted-foreground">
									<Trans>Overall Score</Trans>
								</p>
							</div>

							{/* Score Breakdown */}
							<div className="grid gap-4 md:grid-cols-2">
								<ScoreBar
									label={t`Speaking pace`}
									value={selectedRecording.speakingPaceScore}
									icon={GaugeIcon}
									color="blue"
								/>
								<ScoreBar
									label={t`Clarity`}
									value={selectedRecording.clarityScore}
									icon={SpeakerHighIcon}
									color="purple"
								/>
								<ScoreBar
									label={t`Content quality`}
									value={selectedRecording.contentQualityScore}
									icon={TargetIcon}
									color="green"
								/>
								<ScoreBar
									label={t`Body language`}
									value={selectedRecording.bodyLanguageScore}
									icon={PersonArmsSpreadIcon}
									color="amber"
								/>
								<ScoreBar
									label={t`Answer structure`}
									value={selectedRecording.answerStructureScore}
									icon={ListChecksIcon}
									color="primary"
								/>
								<div className="space-y-2">
									<div className="flex items-center justify-between">
										<div className="flex items-center gap-2">
											<TextAaIcon className="size-4 text-muted-foreground" />
											<span className="text-sm">
												<Trans>Filler words</Trans>
											</span>
										</div>
										<span
											className={cn(
												"font-semibold text-sm",
												selectedRecording.fillerWordCount > 30
													? "text-red-600"
													: selectedRecording.fillerWordCount > 15
														? "text-amber-600"
														: "text-green-600",
											)}
										>
											{selectedRecording.fillerWordCount}
										</span>
									</div>
									<Progress
										value={Math.max(0, 100 - selectedRecording.fillerWordCount * 2)}
										className={cn(
											"h-2",
											selectedRecording.fillerWordCount > 30
												? "[&>[data-slot=progress-indicator]]:bg-red-500"
												: selectedRecording.fillerWordCount > 15
													? "[&>[data-slot=progress-indicator]]:bg-amber-500"
													: "[&>[data-slot=progress-indicator]]:bg-green-500",
										)}
									/>
								</div>
							</div>
						</div>
					</motion.div>

					{/* Tabs for Details */}
					<Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
						<TabsList className="grid w-full grid-cols-4">
							<TabsTrigger value="segments">
								<WaveformIcon className="mr-2 size-4" />
								<Trans>Segments</Trans>
							</TabsTrigger>
							<TabsTrigger value="filler">
								<TextAaIcon className="mr-2 size-4" />
								<Trans>Filler words</Trans>
							</TabsTrigger>
							<TabsTrigger value="body">
								<PersonArmsSpreadIcon className="mr-2 size-4" />
								<Trans>Body language</Trans>
							</TabsTrigger>
							<TabsTrigger value="suggestions">
								<LightbulbIcon className="mr-2 size-4" />
								<Trans>Suggestions</Trans>
							</TabsTrigger>
						</TabsList>

						{/* Segments Tab */}
						<TabsContent value="segments" className="space-y-4">
							<div className="flex items-center justify-between">
								<h3 className="font-semibold text-lg">
									<Trans>Analysis by question ({selectedRecording.segments.length} segments)</Trans>
								</h3>
								<Button variant="outline" size="sm" onClick={() => setExpandedSegment(null)}>
									<ArrowClockwiseIcon className="mr-2 size-4" />
									<Trans>Collapse all</Trans>
								</Button>
							</div>

							<div className="space-y-4">
								<AnimatePresence>
									{selectedRecording.segments.map((segment) => (
										<SegmentCard
											key={segment.id}
											segment={segment}
											isExpanded={expandedSegment === segment.id}
											onToggle={() => setExpandedSegment(expandedSegment === segment.id ? null : segment.id)}
										/>
									))}
								</AnimatePresence>
							</div>

							{selectedRecording.segments.length === 0 && (
								<Card className="border-dashed">
									<CardContent className="flex flex-col items-center justify-center py-12">
										<WaveformIcon className="mb-4 size-12 text-muted-foreground" />
										<p className="text-muted-foreground">
											<Trans>No analyzed segments available</Trans>
										</p>
									</CardContent>
								</Card>
							)}
						</TabsContent>

						{/* Filler Words Tab */}
						<TabsContent value="filler" className="space-y-6">
							<Card>
								<CardHeader>
									<CardTitle className="flex items-center gap-2">
										<WarningCircleIcon className="size-5 text-amber-500" />
										<Trans>Filler word detection</Trans>
									</CardTitle>
									<CardDescription>
										<Trans>Filler words like "uh", "so", "actually" can diminish the impact of your answers.</Trans>
									</CardDescription>
								</CardHeader>
								<CardContent>
									{/* Summary */}
									<div className="mb-6 grid gap-4 md:grid-cols-3">
										<div className="rounded-lg bg-muted/50 p-4 text-center">
											<p className="mb-1 font-bold text-3xl text-primary">{selectedRecording.fillerWordCount}</p>
											<p className="text-muted-foreground text-sm">
												<Trans>Total detected</Trans>
											</p>
										</div>
										<div className="rounded-lg bg-muted/50 p-4 text-center">
											<p className="mb-1 font-bold text-3xl text-amber-600">
												{Math.round((selectedRecording.fillerWordCount / (selectedRecording.duration / 60)) * 10) / 10}
											</p>
											<p className="text-muted-foreground text-sm">
												<Trans>Per minute</Trans>
											</p>
										</div>
										<div className="rounded-lg bg-muted/50 p-4 text-center">
											<p
												className={cn(
													"mb-1 font-bold text-3xl",
													selectedRecording.fillerWordCount > 30
														? "text-red-600"
														: selectedRecording.fillerWordCount > 15
															? "text-amber-600"
															: "text-green-600",
												)}
											>
												{selectedRecording.fillerWordCount > 30
													? "High"
													: selectedRecording.fillerWordCount > 15
														? "Moderate"
														: "Low"}
											</p>
											<p className="text-muted-foreground text-sm">
												<Trans>Level</Trans>
											</p>
										</div>
									</div>

									{/* Word List */}
									<div className="mb-6">
										<h4 className="mb-3 font-semibold">
											<Trans>Words detected</Trans>
										</h4>
										<div className="flex flex-wrap gap-3">
											{aggregateFillerWords.map((fw) => (
												<FillerWordBadge key={fw.word} word={fw.word} count={fw.count} />
											))}
										</div>
									</div>

									{/* Tips - Static content */}
									<div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-900/20">
										<h4 className="mb-3 flex items-center gap-2 font-semibold text-blue-700 dark:text-blue-400">
											<LightbulbIcon className="size-5" weight="fill" />
											<Trans>Tips for reducing filler words</Trans>
										</h4>
										<ul className="space-y-2">
											{fillerWordTips.map((tip) => (
												<li key={tip.key} className="flex items-start gap-2 text-blue-700 text-sm dark:text-blue-300">
													<ArrowRightIcon className="mt-0.5 size-4 shrink-0" />
													<Trans id={tip.key}>{tip.text}</Trans>
												</li>
											))}
										</ul>
									</div>
								</CardContent>
							</Card>
						</TabsContent>

						{/* Body Language Tab */}
						<TabsContent value="body" className="space-y-6">
							<Card>
								<CardHeader>
									<CardTitle className="flex items-center gap-2">
										<PersonArmsSpreadIcon className="size-5 text-purple-500" />
										<Trans>Body language analysis</Trans>
									</CardTitle>
									<CardDescription>
										<Trans>Tips based on video analysis to improve your presence and confidence.</Trans>
									</CardDescription>
								</CardHeader>
								<CardContent>
									<div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-900/20">
										<div className="flex items-center gap-3">
											<VideoIcon className="size-8 text-amber-600" weight="duotone" />
											<div>
												<p className="font-medium text-amber-800 dark:text-amber-300">
													<Trans>Video analysis (placeholder)</Trans>
												</p>
												<p className="text-amber-700 text-sm dark:text-amber-400">
													<Trans>Full video analysis will be available in a future update.</Trans>
												</p>
											</div>
										</div>
									</div>

									<div className="space-y-4">
										{selectedRecording.bodyLanguageTips.map((tip) => (
											<motion.div
												key={tip.id}
												initial={false}
												animate={{ opacity: 1, y: 0 }}
												className="rounded-lg border p-4"
											>
												<div className="mb-2 flex items-start justify-between">
													<div className="flex items-center gap-2">
														<Badge className={bodyLanguageCategoryColors[tip.category]}>
															{bodyLanguageCategoryLabels[tip.category]}
														</Badge>
														<span className={cn("font-medium text-sm", severityColors[tip.severity])}>
															{tip.severity === "major"
																? "Priority"
																: tip.severity === "moderate"
																	? "To improve"
																	: "Minor"}
														</span>
													</div>
													{tip.timestamp && (
														<span className="text-muted-foreground text-xs">
															@ {Math.floor(tip.timestamp / 60)}:{(tip.timestamp % 60).toString().padStart(2, "0")}
														</span>
													)}
												</div>
												<h4 className="mb-2 font-semibold">{tip.issue}</h4>
												<p className="text-muted-foreground text-sm">{tip.suggestion}</p>
											</motion.div>
										))}
									</div>

									{selectedRecording.bodyLanguageTips.length === 0 && (
										<div className="py-8 text-center">
											<PersonArmsSpreadIcon className="mx-auto mb-4 size-12 text-muted-foreground" />
											<p className="text-muted-foreground">
												<Trans>No body language observations available</Trans>
											</p>
										</div>
									)}
								</CardContent>
							</Card>
						</TabsContent>

						{/* Suggestions Tab */}
						<TabsContent value="suggestions" className="space-y-6">
							<div className="grid gap-6 md:grid-cols-2">
								{/* Strengths */}
								<Card className="border-green-200 bg-gradient-to-br from-green-50/50 to-transparent dark:border-green-900 dark:from-green-900/10">
									<CardHeader>
										<CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-400">
											<TrophyIcon className="size-5" weight="fill" />
											<Trans>Strengths</Trans>
										</CardTitle>
									</CardHeader>
									<CardContent>
										<ul className="space-y-3">
											{selectedRecording.strengths.map((strength, idx) => (
												<motion.li
													key={idx}
													initial={false}
													animate={{ opacity: 1, x: 0 }}
													transition={{ delay: idx * 0.1 }}
													className="flex items-start gap-2"
												>
													<CheckCircleIcon className="mt-0.5 size-5 shrink-0 text-green-500" weight="fill" />
													<span className="text-green-800 dark:text-green-300">{strength}</span>
												</motion.li>
											))}
										</ul>
									</CardContent>
								</Card>

								{/* Areas to Improve */}
								<Card className="border-amber-200 bg-gradient-to-br from-amber-50/50 to-transparent dark:border-amber-900 dark:from-amber-900/10">
									<CardHeader>
										<CardTitle className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
											<TargetIcon className="size-5" weight="fill" />
											<Trans>Areas for improvement</Trans>
										</CardTitle>
									</CardHeader>
									<CardContent>
										<ul className="space-y-3">
											{selectedRecording.areasToImprove.map((area, idx) => (
												<motion.li
													key={idx}
													initial={false}
													animate={{ opacity: 1, x: 0 }}
													transition={{ delay: idx * 0.1 }}
													className="flex items-start gap-2"
												>
													<ArrowUpIcon className="mt-0.5 size-5 shrink-0 text-amber-500" weight="bold" />
													<span className="text-amber-800 dark:text-amber-300">{area}</span>
												</motion.li>
											))}
										</ul>
									</CardContent>
								</Card>
							</div>

							{/* Improvement Suggestions */}
							<Card>
								<CardHeader>
									<CardTitle className="flex items-center gap-2">
										<SparkleIcon className="size-5 text-primary" weight="fill" />
										<Trans>Improvement suggestions</Trans>
									</CardTitle>
									<CardDescription>
										<Trans>Personalized recommendations based on your performance</Trans>
									</CardDescription>
								</CardHeader>
								<CardContent>
									<div className="space-y-3">
										{selectedRecording.improvementSuggestions.map((suggestion, idx) => (
											<motion.div
												key={idx}
												initial={false}
												animate={{ opacity: 1, y: 0 }}
												transition={{ delay: idx * 0.1 }}
												className="flex items-start gap-3 rounded-lg bg-muted/50 p-3"
											>
												<div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary font-semibold text-primary-foreground text-xs">
													{idx + 1}
												</div>
												<span className="text-sm">{suggestion}</span>
											</motion.div>
										))}
									</div>
								</CardContent>
							</Card>
						</TabsContent>
					</Tabs>
				</>
			)}
		</>
	);
}

export type RecordingListViewProps = {
	stats: { total: number; avgScore: number; trend: number; analyzed: number } | undefined;
	chartProgressData: ProgressData[];
	filteredRecordings: Recording[];
	recordingsLoading: boolean;
	recordingsError: Error | null;
	searchQuery: string;
	setSearchQuery: Dispatch<SetStateAction<string>>;
	filterField: string;
	setFilterField: Dispatch<SetStateAction<string>>;
	isUploadDialogOpen: boolean;
	setIsUploadDialogOpen: Dispatch<SetStateAction<boolean>>;
	uploadForm: { title: string; field: "healthcare" | "industrial" | "hse" | "general"; program: string };
	setUploadForm: Dispatch<
		SetStateAction<{ title: string; field: "healthcare" | "industrial" | "hse" | "general"; program: string }>
	>;
	isUploading: boolean;
	// biome-ignore lint/suspicious/noExplicitAny: mutation types vary
	analyzeMutation: UseMutationResult<any, Error, any>;
	deletingId: string | null;
	onUpload: () => void;
	onDelete: (id: string) => void;
	onSelectRecording: (id: string) => void;
	onRetry: () => void;
};

export function RecordingListView({
	stats,
	chartProgressData,
	filteredRecordings,
	recordingsLoading,
	recordingsError,
	searchQuery,
	setSearchQuery,
	filterField,
	setFilterField,
	isUploadDialogOpen,
	setIsUploadDialogOpen,
	uploadForm,
	setUploadForm,
	isUploading,
	analyzeMutation,
	deletingId,
	onUpload,
	onDelete,
	onSelectRecording,
	onRetry,
}: RecordingListViewProps) {
	return (
		<>
			<DashboardHeader icon={FilmStripIcon} title={t`Recording Review`} />

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
						<Trans>Interview Recording Review</Trans>
					</motion.h2>

					<motion.p
						className="mb-8 max-w-2xl text-lg text-muted-foreground"
						initial={false}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.4 }}
					>
						<Trans>
							Analyze your interview recordings with our AI. Receive detailed feedback on your speaking pace, clarity,
							content, and body language.
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
								<VideoIcon className="size-5 text-primary" weight="duotone" />
							</div>
							<div>
								<p className="font-bold text-xl">{stats?.total ?? 0}</p>
								<p className="text-muted-foreground text-sm">
									<Trans>Recordings</Trans>
								</p>
							</div>
						</div>
						<div className="flex items-center gap-2">
							<div className="flex size-10 items-center justify-center rounded-full bg-green-500/10">
								<ChartBarIcon className="size-5 text-green-500" weight="duotone" />
							</div>
							<div>
								<p className="font-bold text-xl">{stats?.avgScore ?? 0}%</p>
								<p className="text-muted-foreground text-sm">
									<Trans>Average Score</Trans>
								</p>
							</div>
						</div>
						<div className="flex items-center gap-2">
							<div
								className={cn(
									"flex size-10 items-center justify-center rounded-full",
									(stats?.trend ?? 0) >= 0 ? "bg-green-500/10" : "bg-red-500/10",
								)}
							>
								{(stats?.trend ?? 0) >= 0 ? (
									<CaretUpIcon className="size-5 text-green-500" weight="fill" />
								) : (
									<CaretDownIcon className="size-5 text-red-500" weight="fill" />
								)}
							</div>
							<div>
								<p className="font-bold text-xl">
									{(stats?.trend ?? 0) >= 0 ? "+" : ""}
									{stats?.trend ?? 0}%
								</p>
								<p className="text-muted-foreground text-sm">
									<Trans>Progress</Trans>
								</p>
							</div>
						</div>
					</motion.div>
				</div>
			</motion.div>

			{/* Upload Button & Filters */}
			<div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div className="flex flex-1 items-center gap-4">
					<div className="relative max-w-sm flex-1">
						<MagnifyingGlassIcon className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
						<Input
							placeholder={t`Search...`}
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="pl-9"
						/>
					</div>
					<Select value={filterField} onValueChange={setFilterField}>
						<SelectTrigger className="w-[180px]">
							<SelectValue placeholder={t`Field`} />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">
								<Trans>All fields</Trans>
							</SelectItem>
							<SelectItem value="healthcare">{fieldLabels.healthcare}</SelectItem>
							<SelectItem value="industrial">{fieldLabels.industrial}</SelectItem>
							<SelectItem value="hse">{fieldLabels.hse}</SelectItem>
							<SelectItem value="general">{fieldLabels.general}</SelectItem>
						</SelectContent>
					</Select>
				</div>

				<Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
					<DialogTrigger asChild>
						<Button className="gap-2">
							<CloudArrowUpIcon className="size-5" />
							<Trans>Upload a recording</Trans>
						</Button>
					</DialogTrigger>
					<DialogContent className="max-w-lg">
						<DialogHeader>
							<DialogTitle>
								<Trans>Upload a recording</Trans>
							</DialogTitle>
							<DialogDescription>
								<Trans>Upload your interview recording for a detailed AI analysis.</Trans>
							</DialogDescription>
						</DialogHeader>

						{isUploading ? (
							<div className="space-y-6 py-8">
								<div className="flex flex-col items-center justify-center gap-4">
									{analyzeMutation.isPending ? (
										<>
											<motion.div
												animate={{ rotate: 360 }}
												transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
											>
												<SparkleIcon className="size-16 text-primary" weight="duotone" />
											</motion.div>
											<p className="font-medium text-lg">
												<Trans>AI analysis in progress...</Trans>
											</p>
											<p className="text-center text-muted-foreground text-sm">
												<Trans>Our AI is analyzing your recording to provide detailed feedback.</Trans>
											</p>
										</>
									) : (
										<>
											<SpinnerIcon className="size-16 animate-spin text-primary" />
											<p className="font-medium text-lg">
												<Trans>Downloading...</Trans>
											</p>
										</>
									)}
								</div>
							</div>
						) : (
							<>
								<div className="grid gap-4 py-4">
									<div className="grid gap-2">
										<Label>
											<Trans>Title</Trans>
										</Label>
										<Input
											placeholder={t`E.g.: Mock Interview - Nurse`}
											value={uploadForm.title}
											onChange={(e) => setUploadForm((prev) => ({ ...prev, title: e.target.value }))}
										/>
									</div>
									<div className="grid gap-2">
										<Label>
											<Trans>Domain</Trans>
										</Label>
										<Select
											value={uploadForm.field}
											onValueChange={(v) =>
												setUploadForm((prev) => ({
													...prev,
													field: v as "healthcare" | "industrial" | "hse" | "general",
												}))
											}
										>
											<SelectTrigger>
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="healthcare">{fieldLabels.healthcare}</SelectItem>
												<SelectItem value="industrial">{fieldLabels.industrial}</SelectItem>
												<SelectItem value="hse">{fieldLabels.hse}</SelectItem>
												<SelectItem value="general">{fieldLabels.general}</SelectItem>
											</SelectContent>
										</Select>
									</div>
									<div className="grid gap-2">
										<Label>
											<Trans>Program (optional)</Trans>
										</Label>
										<Input
											placeholder={t`E.g.: General Nurse`}
											value={uploadForm.program}
											onChange={(e) => setUploadForm((prev) => ({ ...prev, program: e.target.value }))}
										/>
									</div>
									<div className="grid gap-2">
										<Label>
											<Trans>Video file</Trans>
										</Label>
										<div className="flex flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed p-8 transition-colors hover:bg-muted/50">
											<UploadSimpleIcon className="size-12 text-muted-foreground" />
											<div className="text-center">
												<p className="font-medium">
													<Trans>Drag your file here or click to browse</Trans>
												</p>
												<p className="text-muted-foreground text-sm">
													<Trans>MP4, MOV, WebM (max 500MB)</Trans>
												</p>
											</div>
											<Button variant="outline" type="button">
												<Trans>Browse</Trans>
											</Button>
										</div>
									</div>
								</div>
								<DialogFooter>
									<Button variant="outline" onClick={() => setIsUploadDialogOpen(false)}>
										<Trans>Cancel</Trans>
									</Button>
									<Button onClick={onUpload} disabled={!uploadForm.title}>
										<CloudArrowUpIcon className="mr-2 size-4" />
										<Trans>Upload and analyze</Trans>
									</Button>
								</DialogFooter>
							</>
						)}
					</DialogContent>
				</Dialog>
			</div>

			{/* Progress Tracking Section */}
			{(stats?.analyzed ?? 0) > 1 && (
				<motion.section className="mb-8" initial={false} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<TrendUpIcon className="size-5 text-primary" />
								<Trans>Progress over time</Trans>
							</CardTitle>
							<CardDescription>
								<Trans>Evolution of your scores over recent weeks</Trans>
							</CardDescription>
						</CardHeader>
						<CardContent>
							<ProgressChart data={chartProgressData} />
						</CardContent>
					</Card>
				</motion.section>
			)}

			{/* Recordings Grid */}
			<section>
				<h3 className="mb-4 flex items-center gap-2 font-semibold text-lg">
					<VideoIcon className="size-5 text-primary" />
					<Trans>Your recordings</Trans>
					<Badge variant="secondary">{filteredRecordings.length}</Badge>
				</h3>

				{recordingsLoading ? (
					<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
						{[1, 2, 3].map((i) => (
							<RecordingCardSkeleton key={i} />
						))}
					</div>
				) : recordingsError ? (
					<Card className="border-dashed">
						<CardContent className="flex flex-col items-center justify-center py-12">
							<WarningCircleIcon className="mb-4 size-16 text-destructive" weight="duotone" />
							<h4 className="mb-2 font-semibold text-xl">
								<Trans>Loading error</Trans>
							</h4>
							<p className="mb-6 max-w-md text-center text-muted-foreground">
								<Trans>An error occurred while loading recordings.</Trans>
							</p>
							<Button onClick={onRetry}>
								<ArrowClockwiseIcon className="mr-2 size-4" />
								<Trans>Retry</Trans>
							</Button>
						</CardContent>
					</Card>
				) : filteredRecordings.length > 0 ? (
					<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
						{filteredRecordings.map((recording, index) => (
							<motion.div
								key={recording.id}
								initial={false}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: index * 0.1 }}
							>
								<RecordingCard
									recording={recording}
									onSelect={() => onSelectRecording(recording.id)}
									onDelete={() => onDelete(recording.id)}
									isDeleting={deletingId === recording.id}
								/>
							</motion.div>
						))}
					</div>
				) : (
					<Card className="border-dashed">
						<CardContent className="flex flex-col items-center justify-center py-12">
							<VideoCameraIcon className="mb-4 size-16 text-muted-foreground" weight="duotone" />
							<h4 className="mb-2 font-semibold text-xl">
								<Trans>No recordings</Trans>
							</h4>
							<p className="mb-6 max-w-md text-center text-muted-foreground">
								<Trans>Upload your first interview recording to receive a detailed analysis by our AI.</Trans>
							</p>
							<Button onClick={() => setIsUploadDialogOpen(true)} className="gap-2">
								<CloudArrowUpIcon className="size-5" />
								<Trans>Upload a recording</Trans>
							</Button>
						</CardContent>
					</Card>
				)}
			</section>

			{/* Tips Section - Static content */}
			<motion.section className="mt-10" initial={false} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
				<Card className="border-amber-200 bg-gradient-to-br from-amber-50/50 to-transparent dark:border-amber-900 dark:from-amber-900/10">
					<CardHeader>
						<CardTitle className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
							<LightbulbIcon className="size-5" weight="fill" />
							<Trans>Tips for better recordings</Trans>
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
							{recordingTips.map((tip, idx) => (
								<div key={idx} className="flex items-start gap-3">
									<div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
										<tip.icon className="size-5 text-amber-600 dark:text-amber-400" weight="duotone" />
									</div>
									<div>
										<h5 className="font-semibold text-amber-800 text-sm dark:text-amber-300">{tip.title}</h5>
										<p className="text-amber-700 text-xs dark:text-amber-400">{tip.desc}</p>
									</div>
								</div>
							))}
						</div>
					</CardContent>
				</Card>
			</motion.section>
		</>
	);
}
