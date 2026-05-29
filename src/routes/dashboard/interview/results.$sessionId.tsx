import { t } from "@lingui/core/macro";
import {
	ArrowLeftIcon,
	ArrowRightIcon,
	BrainIcon,
	CaretDownIcon,
	ChartBarIcon,
	CheckCircleIcon,
	ClockIcon,
	LightbulbIcon,
	PlusIcon,
	ShareNetworkIcon,
	SpinnerIcon,
	StarIcon,
	TargetIcon,
	TrophyIcon,
	WarningCircleIcon,
} from "@phosphor-icons/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "motion/react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { ErrorComponent } from "@/components/error-component";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { authClient } from "@/integrations/auth/client";
import { client, orpc } from "@/integrations/orpc/client";

export const Route = createFileRoute("/dashboard/interview/results/$sessionId")({
	component: ResultsPage,
	errorComponent: ErrorComponent,
});

const getFieldLabels = (): Record<string, string> => ({
	healthcare: t`Healthcare / Nursing`,
	industrial: t`Industrial Maintenance`,
	hse: t`HSE / Safety`,
	general: t`Général`,
});

const getDifficultyLabels = (): Record<string, string> => ({
	beginner: t`Beginner`,
	intermediate: t`Intermediate`,
	advanced: t`Advanced`,
});

const getTypeLabels = (): Record<string, string> => ({
	behavioral: t`Behavioral`,
	technical: t`Technical`,
	situational: t`Situational`,
	motivational: t`Motivational`,
	general: t`Général`,
});

const getReadinessConfig = (): Record<
	string,
	{ label: string; color: string; bgColor: string; description: string }
> => ({
	not_ready: {
		label: t`Not ready`,
		color: "text-red-600",
		bgColor: "bg-gradient-to-r from-red-500 to-rose-500",
		description: t`You need more practice before a real interview.`,
	},
	needs_practice: {
		label: t`Needs practice`,
		color: "text-orange-600",
		bgColor: "bg-gradient-to-r from-orange-500 to-amber-500",
		description: t`Keep practicing to strengthen your skills.`,
	},
	almost_ready: {
		label: t`Almost ready`,
		color: "text-blue-600",
		bgColor: "bg-gradient-to-r from-blue-500 to-cyan-500",
		description: t`You are almost ready! A few more practice sessions will help.`,
	},
	interview_ready: {
		label: t`Interview ready`,
		color: "text-emerald-600",
		bgColor: "bg-gradient-to-r from-emerald-500 to-teal-500",
		description: t`Exceptional performance! You are ready for a real interview.`,
	},
});

type QuestionData = { id: string; question: string; questionFr?: string; type: string };
type ResponseData = { questionId: string; response: string };
type EvaluationData = {
	questionId: string;
	score: number;
	overallFeedback: string;
	strengths?: string[];
	areasForImprovement?: string[];
	sampleAnswer?: string;
};

// Animated counter component
function AnimatedScore({ value, duration = 2000 }: { value: number; duration?: number }) {
	const [displayValue, setDisplayValue] = useState(0);

	useEffect(() => {
		let startTime: number;
		let animationFrame: number;

		const animate = (timestamp: number) => {
			if (!startTime) startTime = timestamp;
			const progress = Math.min((timestamp - startTime) / duration, 1);

			// Easing function for smooth animation
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

// Circular progress component
function CircularProgress({
	value,
	size = 200,
	strokeWidth = 12,
}: {
	value: number;
	size?: number;
	strokeWidth?: number;
}) {
	const radius = (size - strokeWidth) / 2;
	const circumference = radius * 2 * Math.PI;
	const offset = circumference - (value / 100) * circumference;

	const getColor = useCallback((score: number) => {
		if (score >= 80) return { stroke: "#10b981", bg: "#d1fae5" };
		if (score >= 60) return { stroke: "#f59e0b", bg: "#fef3c7" };
		return { stroke: "#ef4444", bg: "#fee2e2" };
	}, []);

	const colors = getColor(value);

	return (
		<div className="relative" style={{ width: size, height: size }}>
			<svg width={size} height={size} className="-rotate-90">
				{/* Background circle */}
				<circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={colors.bg} strokeWidth={strokeWidth} />
				{/* Progress circle */}
				<motion.circle
					cx={size / 2}
					cy={size / 2}
					r={radius}
					fill="none"
					stroke={colors.stroke}
					strokeWidth={strokeWidth}
					strokeLinecap="round"
					strokeDasharray={circumference}
					initial={{ strokeDashoffset: circumference }}
					animate={{ strokeDashoffset: offset }}
					transition={{ duration: 2, ease: "easeOut" }}
				/>
			</svg>
			<div className="absolute inset-0 flex flex-col items-center justify-center">
				<span className="font-bold text-5xl" style={{ color: colors.stroke }}>
					<AnimatedScore value={value} />
				</span>
				<span className="text-muted-foreground text-sm">{t`out of 100`}</span>
			</div>
		</div>
	);
}

// Bar chart component for score breakdown
function ScoreBarChart({ breakdown }: { breakdown: Record<string, number> }) {
	const entries = Object.entries(breakdown).filter(([_, value]) => value !== undefined);

	return (
		<div className="space-y-3">
			{entries.map(([key, value], index) => (
				<motion.div
					key={key}
					initial={false}
					animate={{ opacity: 1, x: 0 }}
					transition={{ delay: index * 0.1 }}
					className="space-y-1"
				>
					<div className="flex items-center justify-between text-sm">
						<span className="font-medium">{getTypeLabels()[key] || key}</span>
						<span className="text-muted-foreground tabular-nums">{value}%</span>
					</div>
					<div className="h-3 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
						<motion.div
							initial={{ width: 0 }}
							animate={{ width: `${value}%` }}
							transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
							className={`h-full rounded-full ${
								value >= 80
									? "bg-gradient-to-r from-green-500 to-emerald-500"
									: value >= 60
										? "bg-gradient-to-r from-amber-500 to-yellow-500"
										: "bg-gradient-to-r from-orange-500 to-red-500"
							}`}
						/>
					</div>
				</motion.div>
			))}
		</div>
	);
}

// Question detail card with expandable content
function QuestionDetailCard({
	question,
	response,
	evaluation,
	index,
}: {
	question: QuestionData;
	response?: ResponseData;
	evaluation?: EvaluationData;
	index: number;
}) {
	const [isOpen, setIsOpen] = useState(false);

	return (
		<motion.div initial={false} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
			<Collapsible open={isOpen} onOpenChange={setIsOpen}>
				<div className="rounded-xl border bg-card transition-shadow hover:shadow-md">
					<CollapsibleTrigger asChild>
						<button className="flex w-full items-center justify-between p-4 text-left">
							<div className="flex items-center gap-3">
								<div
									className={`flex size-10 items-center justify-center rounded-full font-semibold text-white ${
										evaluation && evaluation.score >= 70
											? "bg-gradient-to-br from-green-500 to-emerald-600"
											: evaluation
												? "bg-gradient-to-br from-orange-500 to-amber-600"
												: "bg-gray-400"
									}`}
								>
									Q{index + 1}
								</div>
								<div className="flex-1">
									<div className="mb-1 flex flex-wrap items-center gap-2">
										<Badge variant="outline" className="text-xs">
											{getTypeLabels()[question.type] || question.type}
										</Badge>
										{evaluation && (
											<Badge
												variant={evaluation.score >= 70 ? "default" : "secondary"}
												className={
													evaluation.score >= 70
														? "bg-green-100 text-green-700 dark:bg-green-900/30"
														: "bg-orange-100 text-orange-700 dark:bg-orange-900/30"
												}
											>
												{evaluation.score}%
											</Badge>
										)}
									</div>
									<p className="line-clamp-1 font-medium text-sm">{question.questionFr || question.question}</p>
								</div>
							</div>
							<motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
								<CaretDownIcon className="size-5 text-muted-foreground" />
							</motion.div>
						</button>
					</CollapsibleTrigger>

					<CollapsibleContent>
						<div className="space-y-4 border-t p-4">
							{/* Full Question */}
							<div>
								<h4 className="mb-2 font-semibold text-muted-foreground text-sm">Question</h4>
								<p className="text-sm">{question.questionFr || question.question}</p>
							</div>

							{/* User Response */}
							{response && (
								<div className="rounded-lg bg-blue-50 p-3 dark:bg-blue-900/20">
									<h4 className="mb-2 flex items-center gap-2 font-semibold text-blue-700 text-sm dark:text-blue-300">
										<TargetIcon className="size-4" />
										{t`Your response`}
									</h4>
									<p className="text-blue-800 text-sm dark:text-blue-200">{response.response}</p>
								</div>
							)}

							{/* Evaluation Feedback */}
							{evaluation && (
								<>
									<div>
										<h4 className="mb-2 font-semibold text-muted-foreground text-sm">Evaluation</h4>
										<p className="text-sm">{evaluation.overallFeedback}</p>
									</div>

									{/* Strengths */}
									{evaluation.strengths && evaluation.strengths.length > 0 && (
										<div className="rounded-lg border border-green-200 bg-green-50 p-3 dark:border-green-900 dark:bg-green-900/20">
											<h5 className="mb-2 flex items-center gap-2 font-semibold text-green-700 text-xs dark:text-green-400">
												<CheckCircleIcon className="size-4" />
												{t`Strengths`}
											</h5>
											<ul className="space-y-1">
												{evaluation.strengths.map((s, i) => (
													<li key={i} className="text-green-700 text-xs dark:text-green-300">
														{s}
													</li>
												))}
											</ul>
										</div>
									)}

									{/* Areas to improve */}
									{evaluation.areasForImprovement && evaluation.areasForImprovement.length > 0 && (
										<div className="rounded-lg border border-orange-200 bg-orange-50 p-3 dark:border-orange-900 dark:bg-orange-900/20">
											<h5 className="mb-2 flex items-center gap-2 font-semibold text-orange-700 text-xs dark:text-orange-400">
												<WarningCircleIcon className="size-4" />
												{t`Areas to improve`}
											</h5>
											<ul className="space-y-1">
												{evaluation.areasForImprovement.map((a, i) => (
													<li key={i} className="text-orange-700 text-xs dark:text-orange-300">
														{a}
													</li>
												))}
											</ul>
										</div>
									)}

									{/* Sample Answer */}
									{evaluation.sampleAnswer && (
										<div className="rounded-lg border border-purple-200 bg-purple-50 p-3 dark:border-purple-900 dark:bg-purple-900/20">
											<h5 className="mb-2 flex items-center gap-2 font-semibold text-purple-700 text-xs dark:text-purple-400">
												<BrainIcon className="size-4" />
												{t`Ideal sample answer`}
											</h5>
											<p className="text-purple-700 text-xs dark:text-purple-300">{evaluation.sampleAnswer}</p>
										</div>
									)}
								</>
							)}
						</div>
					</CollapsibleContent>
				</div>
			</Collapsible>
		</motion.div>
	);
}

function ResultsPage() {
	const { sessionId } = Route.useParams();
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const { data: authSession } = authClient.useSession();
	// AI status is a public endpoint - no auth guard needed, fires immediately
	const { data: aiStatus } = useQuery(orpc.aiConfig.status.check.queryOptions());

	const { data: session, isLoading } = useQuery({
		...orpc.interview.getSession.queryOptions({ input: { sessionId } }),
		enabled: !!authSession?.user,
	});

	const analyzeMutation = useMutation({
		mutationFn: async () => {
			if (!aiStatus?.available) {
				throw new Error("AI is not configured");
			}

			return await client.interview.analyzeSession({
				sessionId,
				language: "fr",
			});
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["interview", "getSession"] });
			toast.success(t`Analyse terminée !`);
		},
		onError: (error) => {
			toast.error(error.message);
		},
	});

	if (isLoading) {
		return (
			<div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
				<motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
					<SpinnerIcon className="size-12 text-primary" />
				</motion.div>
				<p className="text-muted-foreground">{t`Loading results...`}</p>
			</div>
		);
	}

	if (!session) {
		return (
			<div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
				<motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }}>
					<WarningCircleIcon className="size-16 text-muted-foreground" />
				</motion.div>
				<h2 className="font-semibold text-xl">{t`Session not found`}</h2>
				<Button onClick={() => navigate({ to: "/dashboard/interview" })}>
					<ArrowLeftIcon className="mr-2 size-4" />
					{t`Back to dashboard`}
				</Button>
			</div>
		);
	}

	const questions = session.questions as QuestionData[];
	const responses = session.responses as ResponseData[];
	const evaluations = session.evaluations as EvaluationData[];
	const analysis = session.analysis;

	const averageScore =
		evaluations.length > 0
			? Math.round(evaluations.reduce((acc: number, e: EvaluationData) => acc + e.score, 0) / evaluations.length)
			: 0;

	const finalScore = analysis?.overallScore || averageScore;
	const readinessConfig = getReadinessConfig();
	const readiness = analysis?.readinessLevel
		? readinessConfig[analysis.readinessLevel]
		: finalScore >= 80
			? readinessConfig.interview_ready
			: finalScore >= 60
				? readinessConfig.almost_ready
				: finalScore >= 40
					? readinessConfig.needs_practice
					: readinessConfig.not_ready;

	const handleShare = async () => {
		const shareUrl = window.location.href;
		const shareText = t`J'ai terminé ma session d'entretien avec un score de ${finalScore}% !`;

		if (navigator.share) {
			try {
				await navigator.share({
					title: t`Interview Results`,
					text: shareText,
					url: shareUrl,
				});
			} catch (error) {
				// Only show error toast for actual errors, not user cancellation
				// AbortError occurs when user cancels the share dialog
				if (error instanceof Error && error.name !== "AbortError") {
					toast.error(t`Error sharing. Please try again.`);
				}
			}
		} else {
			// Fallback: copy to clipboard
			try {
				await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
				toast.success(t`Link copied to clipboard!`);
			} catch {
				toast.error(t`Error copying. Please copy the link manually.`);
			}
		}
	};

	return (
		<div className="mx-auto max-w-5xl space-y-8 p-4 pb-16">
			{/* Hero Header with Score */}
			<motion.div
				initial={false}
				animate={{ opacity: 1, y: 0 }}
				className="overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 p-1"
			>
				<div className="rounded-xl bg-white/95 p-6 backdrop-blur-sm sm:p-8 dark:bg-slate-900/95">
					{/* Back link and actions */}
					<div className="mb-6 flex flex-wrap items-center justify-between gap-4">
						<Link
							to="/dashboard/interview"
							className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
						>
							<ArrowLeftIcon className="size-4" />
							<span>{t`Back to dashboard`}</span>
						</Link>
						<div className="flex gap-2">
							<Button variant="outline" size="sm" onClick={handleShare}>
								<ShareNetworkIcon className="mr-2 size-4" />
								{t`Share`}
							</Button>
							{!analysis && aiStatus?.available && (
								<Button
									size="sm"
									onClick={() => analyzeMutation.mutate()}
									disabled={analyzeMutation.isPending}
									className="bg-gradient-to-r from-purple-600 to-pink-600 text-white"
								>
									{analyzeMutation.isPending ? (
										<>
											<SpinnerIcon className="mr-2 size-4 animate-spin" />
											{t`Analyzing...`}
										</>
									) : (
										<>
											<BrainIcon className="mr-2 size-4" />
											{t`Generate AI analysis`}
										</>
									)}
								</Button>
							)}
						</div>
					</div>

					{/* Title and metadata */}
					<div className="mb-8 text-center">
						<motion.h1
							initial={false}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.1 }}
							className="mb-2 font-bold text-2xl sm:text-3xl"
						>
							{session.title}
						</motion.h1>
						<motion.div
							initial={false}
							animate={{ opacity: 1 }}
							transition={{ delay: 0.2 }}
							className="flex flex-wrap items-center justify-center gap-2 text-muted-foreground text-sm"
						>
							<Badge variant="outline">{getFieldLabels()[session.field as string] ?? session.field}</Badge>
							<span>|</span>
							<Badge variant="outline">
								{getDifficultyLabels()[session.difficulty as string] ?? session.difficulty}
							</Badge>
							<span>|</span>
							<span className="flex items-center gap-1">
								<ClockIcon className="size-4" />
								{new Date(session.createdAt).toLocaleDateString()}
							</span>
						</motion.div>
					</div>

					{/* Main Score Display */}
					<motion.div
						initial={false}
						animate={{ scale: 1, opacity: 1 }}
						transition={{ delay: 0.3, type: "spring" }}
						className="flex flex-col items-center"
					>
						<CircularProgress value={finalScore} />

						{/* Readiness Badge */}
						<motion.div
							initial={false}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.8 }}
							className="mt-6 text-center"
						>
							<div
								className={`inline-flex items-center gap-2 rounded-full px-6 py-2 font-semibold text-white ${readiness.bgColor}`}
							>
								<TrophyIcon className="size-5" />
								{readiness.label}
							</div>
							<p className="mt-2 text-muted-foreground text-sm">{readiness.description}</p>
						</motion.div>
					</motion.div>
				</div>
			</motion.div>

			{/* Stats Cards */}
			<motion.div
				initial={false}
				animate={{ opacity: 1, y: 0 }}
				transition={{ delay: 0.4 }}
				className="grid gap-4 sm:grid-cols-3"
			>
				<Card className="border-0 bg-gradient-to-br from-blue-50 to-blue-100 shadow-md dark:from-blue-900/20 dark:to-blue-800/20">
					<CardContent className="flex items-center gap-4 p-4">
						<div className="flex size-12 items-center justify-center rounded-xl bg-blue-500 text-white">
							<TargetIcon className="size-6" />
						</div>
						<div>
							<p className="font-bold text-2xl text-blue-700 dark:text-blue-300">
								{session.completedQuestions}/{session.totalQuestions}
							</p>
							<p className="text-blue-600 text-sm dark:text-blue-400">{t`Questions answered`}</p>
						</div>
					</CardContent>
				</Card>

				<Card className="border-0 bg-gradient-to-br from-green-50 to-green-100 shadow-md dark:from-green-900/20 dark:to-green-800/20">
					<CardContent className="flex items-center gap-4 p-4">
						<div className="flex size-12 items-center justify-center rounded-xl bg-green-500 text-white">
							<CheckCircleIcon className="size-6" />
						</div>
						<div>
							<p className="font-bold text-2xl text-green-700 dark:text-green-300">
								{evaluations.filter((e) => e.score >= 70).length}
							</p>
							<p className="text-green-600 text-sm dark:text-green-400">{t`Good answers (70%+)`}</p>
						</div>
					</CardContent>
				</Card>

				<Card className="border-0 bg-gradient-to-br from-purple-50 to-purple-100 shadow-md dark:from-purple-900/20 dark:to-purple-800/20">
					<CardContent className="flex items-center gap-4 p-4">
						<div className="flex size-12 items-center justify-center rounded-xl bg-purple-500 text-white">
							<StarIcon className="size-6" />
						</div>
						<div>
							<p className="font-bold text-2xl text-purple-700 dark:text-purple-300">
								{Math.max(...evaluations.map((e) => e.score), 0)}%
							</p>
							<p className="text-purple-600 text-sm dark:text-purple-400">{t`Best score`}</p>
						</div>
					</CardContent>
				</Card>
			</motion.div>

			{/* Analysis Section */}
			{analysis && (
				<motion.div initial={false} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
					<Card className="overflow-hidden border-0 shadow-xl">
						<CardHeader className="bg-gradient-to-r from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-900">
							<CardTitle className="flex items-center gap-2">
								<BrainIcon className="size-5" />
								{t`Detailed AI analysis`}
							</CardTitle>
							<CardDescription>{analysis.summary}</CardDescription>
						</CardHeader>
						<CardContent className="grid gap-6 p-6 lg:grid-cols-2">
							{/* Score Breakdown Chart */}
							{analysis.scoreBreakdown && Object.keys(analysis.scoreBreakdown).length > 0 && (
								<div>
									<h4 className="mb-4 flex items-center gap-2 font-semibold">
										<ChartBarIcon className="size-5 text-primary" />
										{t`Score by category`}
									</h4>
									<ScoreBarChart breakdown={analysis.scoreBreakdown} />
								</div>
							)}

							{/* Top Strengths */}
							{analysis.topStrengths && analysis.topStrengths.length > 0 && (
								<div className="rounded-xl border border-green-200 bg-green-50 p-4 dark:border-green-900 dark:bg-green-900/20">
									<h4 className="mb-3 flex items-center gap-2 font-semibold text-green-700 dark:text-green-400">
										<CheckCircleIcon className="size-5" />
										{t`Identified strengths`}
									</h4>
									<ul className="space-y-2">
										{analysis.topStrengths.map((strength: string, i: number) => (
											<motion.li
												key={i}
												initial={false}
												animate={{ opacity: 1, x: 0 }}
												transition={{ delay: 0.6 + i * 0.1 }}
												className="flex items-start gap-2 text-green-700 text-sm dark:text-green-300"
											>
												<CheckCircleIcon className="mt-0.5 size-4 shrink-0" />
												{strength}
											</motion.li>
										))}
									</ul>
								</div>
							)}

							{/* Areas for Improvement */}
							{analysis.topWeaknesses && analysis.topWeaknesses.length > 0 && (
								<div className="rounded-xl border border-orange-200 bg-orange-50 p-4 dark:border-orange-900 dark:bg-orange-900/20">
									<h4 className="mb-3 flex items-center gap-2 font-semibold text-orange-700 dark:text-orange-400">
										<WarningCircleIcon className="size-5" />
										{t`Areas to improve`}
									</h4>
									<ul className="space-y-2">
										{analysis.topWeaknesses.map((weakness: string, i: number) => (
											<motion.li
												key={i}
												initial={false}
												animate={{ opacity: 1, x: 0 }}
												transition={{ delay: 0.7 + i * 0.1 }}
												className="flex items-start gap-2 text-orange-700 text-sm dark:text-orange-300"
											>
												<WarningCircleIcon className="mt-0.5 size-4 shrink-0" />
												{weakness}
											</motion.li>
										))}
									</ul>
								</div>
							)}

							{/* Recommendations */}
							{analysis.recommendations && analysis.recommendations.length > 0 && (
								<div className="rounded-xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-900/20">
									<h4 className="mb-3 flex items-center gap-2 font-semibold text-blue-700 dark:text-blue-400">
										<LightbulbIcon className="size-5" />
										{t`Recommendations`}
									</h4>
									<ul className="space-y-2">
										{analysis.recommendations.map((rec: string, i: number) => (
											<motion.li
												key={i}
												initial={false}
												animate={{ opacity: 1, x: 0 }}
												transition={{ delay: 0.8 + i * 0.1 }}
												className="flex items-start gap-2 text-blue-700 text-sm dark:text-blue-300"
											>
												<LightbulbIcon className="mt-0.5 size-4 shrink-0" />
												{rec}
											</motion.li>
										))}
									</ul>
								</div>
							)}

							{/* Next Steps */}
							{analysis.nextSteps && analysis.nextSteps.length > 0 && (
								<div className="rounded-xl border border-purple-200 bg-purple-50 p-4 dark:border-purple-900 dark:bg-purple-900/20">
									<h4 className="mb-3 flex items-center gap-2 font-semibold text-purple-700 dark:text-purple-400">
										<ArrowRightIcon className="size-5" />
										{t`Next steps`}
									</h4>
									<ol className="space-y-2">
										{analysis.nextSteps.map((step: string, i: number) => (
											<motion.li
												key={i}
												initial={false}
												animate={{ opacity: 1, x: 0 }}
												transition={{ delay: 0.9 + i * 0.1 }}
												className="flex items-start gap-2 text-purple-700 text-sm dark:text-purple-300"
											>
												<span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-purple-200 font-semibold text-purple-700 text-xs dark:bg-purple-800 dark:text-purple-300">
													{i + 1}
												</span>
												{step}
											</motion.li>
										))}
									</ol>
								</div>
							)}
						</CardContent>
					</Card>
				</motion.div>
			)}

			{/* Question by Question Review */}
			<motion.div initial={false} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
				<Card className="border-0 shadow-xl">
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<TargetIcon className="size-5" />
							{t`Question review`}
						</CardTitle>
						<CardDescription>{t`Click on each question to see your response details and evaluation`}</CardDescription>
					</CardHeader>
					<CardContent className="space-y-3">
						{questions.map((question: QuestionData, idx: number) => {
							const response = responses.find((r: ResponseData) => r.questionId === question.id);
							const evaluation = evaluations.find((e: EvaluationData) => e.questionId === question.id);

							return (
								<QuestionDetailCard
									key={question.id}
									question={question}
									response={response}
									evaluation={evaluation}
									index={idx}
								/>
							);
						})}
					</CardContent>
				</Card>
			</motion.div>

			{/* Action Buttons */}
			<motion.div
				initial={false}
				animate={{ opacity: 1, y: 0 }}
				transition={{ delay: 0.7 }}
				className="flex flex-col items-center justify-center gap-4 sm:flex-row"
			>
				<Button
					onClick={() => navigate({ to: "/dashboard/interview" })}
					variant="outline"
					size="lg"
					className="w-full sm:w-auto"
				>
					<ArrowLeftIcon className="mr-2 size-4" />
					{t`Back to dashboard`}
				</Button>
				<Button
					onClick={() =>
						navigate({
							to: "/dashboard/interview/practice",
							// biome-ignore lint/suspicious/noExplicitAny: Dynamic search params
							search: { field: session.field, difficulty: session.difficulty } as any,
						})
					}
					size="lg"
					className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 sm:w-auto"
				>
					<PlusIcon className="mr-2 size-4" />
					{t`New interview`}
				</Button>
			</motion.div>
		</div>
	);
}
