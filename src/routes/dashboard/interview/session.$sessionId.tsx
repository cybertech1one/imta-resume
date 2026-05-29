import { t } from "@lingui/core/macro";
import {
	ArrowLeftIcon,
	ArrowRightIcon,
	BrainIcon,
	CaretDownIcon,
	CaretUpIcon,
	CheckCircleIcon,
	ClockIcon,
	FlagIcon,
	LightbulbIcon,
	PaperPlaneIcon,
	SpinnerIcon,
	WarningCircleIcon,
	XCircleIcon,
} from "@phosphor-icons/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { ErrorComponent } from "@/components/error-component";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { authClient } from "@/integrations/auth/client";
import { client, orpc } from "@/integrations/orpc/client";

export const Route = createFileRoute("/dashboard/interview/session/$sessionId")({
	component: SessionPage,
	errorComponent: ErrorComponent,
});

const getTypeLabels = (): Record<string, string> => ({
	behavioral: t`Behavioral`,
	technical: t`Technical`,
	situational: t`Situational`,
	motivational: t`Motivational`,
	general: t`Général`,
});

const difficultyColors: Record<string, string> = {
	beginner: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
	intermediate: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
	advanced: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

const typeColors: Record<string, string> = {
	behavioral: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
	technical: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
	situational: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400",
	motivational: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400",
	general: "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400",
};

type InterviewQuestion = {
	id: string;
	question: string;
	questionFr?: string;
	type: "behavioral" | "technical" | "situational" | "motivational" | "general";
	field: "healthcare" | "industrial" | "hse" | "general";
	difficulty: "beginner" | "intermediate" | "advanced";
	expectedPoints?: string[];
	tips?: string;
	order: number;
};

type ResponseEvaluation = {
	questionId: string;
	score: number;
	strengths: string[];
	areasForImprovement: string[];
	suggestions: string[];
	sampleAnswer?: string;
	keyPointsCovered: string[];
	keyPointsMissed: string[];
	overallFeedback: string;
};

// Timer component
function Timer({ startTime }: { startTime: number | null }) {
	const [elapsed, setElapsed] = useState(0);

	useEffect(() => {
		if (!startTime) return;

		const interval = setInterval(() => {
			setElapsed(Math.floor((Date.now() - startTime) / 1000));
		}, 1000);

		return () => clearInterval(interval);
	}, [startTime]);

	const minutes = Math.floor(elapsed / 60);
	const seconds = elapsed % 60;

	return (
		<div className="flex items-center gap-2 text-muted-foreground">
			<ClockIcon className="size-4" />
			<span className="font-mono tabular-nums">
				{String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
			</span>
		</div>
	);
}

// Score badge with animation
function ScoreBadge({ score }: { score: number }) {
	const getScoreColor = useCallback((s: number) => {
		if (s >= 80) return "bg-gradient-to-r from-green-500 to-emerald-500 text-white";
		if (s >= 60) return "bg-gradient-to-r from-amber-500 to-yellow-500 text-white";
		return "bg-gradient-to-r from-orange-500 to-red-500 text-white";
	}, []);

	return (
		<motion.div
			initial={{ scale: 0, rotate: -180 }}
			animate={{ scale: 1, rotate: 0 }}
			transition={{ type: "spring", stiffness: 200, damping: 15 }}
			className={`flex items-center justify-center rounded-full px-4 py-2 font-bold text-xl ${getScoreColor(score)}`}
		>
			{score}%
		</motion.div>
	);
}

function SessionPage() {
	const { sessionId } = Route.useParams();
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const { data: authSession } = authClient.useSession();
	// AI status is a public endpoint - no auth guard needed, fires immediately
	const { data: aiStatus, isPending: isAiStatusPending } = useQuery(orpc.aiConfig.status.check.queryOptions());
	const textareaRef = useRef<HTMLTextAreaElement>(null);
	const isMountedRef = useRef(true);

	const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
	const [answer, setAnswer] = useState("");
	const [responses, setResponses] = useState<Record<string, string>>({});
	const [evaluations, setEvaluations] = useState<Record<string, ResponseEvaluation>>({});
	const [isEvaluating, setIsEvaluating] = useState(false);
	const [startTime, setStartTime] = useState<number | null>(null);
	const [showSampleAnswer, setShowSampleAnswer] = useState(false);
	const [direction, setDirection] = useState(0);

	// Track mount state for async operations
	useEffect(() => {
		isMountedRef.current = true;
		return () => {
			isMountedRef.current = false;
		};
	}, []);

	const { data: session, isLoading } = useQuery({
		...orpc.interview.getSession.queryOptions({ input: { sessionId } }),
		enabled: !!authSession?.user,
	});

	// Initialize state from session data with error handling for malformed data
	useEffect(() => {
		if (session) {
			try {
				// Safely parse responses with validation
				const sessionResponses = Array.isArray(session.responses)
					? (session.responses as Array<{ questionId: string; response: string }>).filter(
							(r) => r && typeof r.questionId === "string" && typeof r.response === "string",
						)
					: [];

				// Safely parse evaluations with validation
				const sessionEvaluations = Array.isArray(session.evaluations)
					? (session.evaluations as ResponseEvaluation[]).filter(
							(e) => e && typeof e.questionId === "string" && typeof e.score === "number",
						)
					: [];

				const responsesMap: Record<string, string> = {};
				sessionResponses.forEach((r) => {
					responsesMap[r.questionId] = r.response;
				});
				setResponses(responsesMap);

				const evalMap: Record<string, ResponseEvaluation> = {};
				sessionEvaluations.forEach((e) => {
					evalMap[e.questionId] = e;
				});
				setEvaluations(evalMap);

				// Safely parse questions with validation
				const questions = Array.isArray(session.questions)
					? (session.questions as InterviewQuestion[]).filter((q) => q && typeof q.id === "string")
					: [];

				// Find first unanswered question
				const firstUnansweredIndex = questions.findIndex((q) => !responsesMap[q.id]);
				if (firstUnansweredIndex !== -1) {
					setCurrentQuestionIndex(firstUnansweredIndex);
				}

				setStartTime(Date.now());
			} catch (error) {
				console.error("Error parsing session data:", error);
				toast.error(t`Error loading session data`);
			}
		}
	}, [session]);

	// Get questions from session
	const questions = (session?.questions || []) as InterviewQuestion[];

	// Focus textarea when question changes
	useEffect(() => {
		if (textareaRef.current && session && !evaluations[questions[currentQuestionIndex]?.id]) {
			textareaRef.current.focus();
		}
	}, [currentQuestionIndex, session, evaluations, questions]);

	// Evaluate response mutation
	const evaluateMutation = useMutation({
		mutationFn: async ({ question, response }: { question: InterviewQuestion; response: string }) => {
			if (!aiStatus?.available) {
				throw new Error("AI is not configured");
			}

			return await client.interview.evaluateResponse({
				question,
				response,
				language: "fr",
				field: session?.field || "general",
			});
		},
	});

	// Submit response mutation
	const submitResponseMutation = useMutation({
		mutationFn: async ({
			questionId,
			response,
			responseTime,
		}: {
			questionId: string;
			response: string;
			responseTime?: number;
		}) => {
			return await client.interview.submitResponse({
				sessionId,
				questionId,
				response,
				responseTime,
			});
		},
	});

	// Save evaluation mutation
	const saveEvaluationMutation = useMutation({
		mutationFn: async (evaluation: ResponseEvaluation) => {
			return await client.interview.saveEvaluation({
				sessionId,
				evaluation,
			});
		},
	});

	if (isLoading) {
		return (
			<div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
				<motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
					<SpinnerIcon className="size-12 text-primary" />
				</motion.div>
				<p className="text-muted-foreground">{t`Loading session...`}</p>
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
				<p className="text-muted-foreground">{t`This session does not exist or has been deleted.`}</p>
				<Button onClick={() => navigate({ to: "/dashboard/interview" })}>
					<ArrowLeftIcon className="mr-2 size-4" />
					{t`Back to dashboard`}
				</Button>
			</div>
		);
	}

	if (isAiStatusPending) {
		return (
			<div className="flex min-h-[60vh] items-center justify-center p-4">
				<div className="flex flex-col items-center gap-3">
					<SpinnerIcon className="size-8 animate-spin text-primary" />
					<p className="text-muted-foreground text-sm">{t`Loading...`}</p>
				</div>
			</div>
		);
	}

	if (!aiStatus?.available) {
		return (
			<div className="flex min-h-[60vh] items-center justify-center p-4">
				<motion.div initial={false} animate={{ opacity: 1, y: 0 }}>
					<Card className="max-w-md">
						<CardHeader className="text-center">
							<div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600">
								<BrainIcon className="size-8 text-white" />
							</div>
							<CardTitle>{t`AI unavailable`}</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="text-center text-muted-foreground">
								{t`AI features are not currently available. Please contact your administrator.`}
							</p>
						</CardContent>
						<CardFooter className="justify-center">
							<Button onClick={() => navigate({ to: "/dashboard/settings/ai" })}>{t`View AI status`}</Button>
						</CardFooter>
					</Card>
				</motion.div>
			</div>
		);
	}

	const currentQuestion = questions[currentQuestionIndex];
	const progress = questions.length > 0 ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0;
	const currentEvaluation = currentQuestion ? evaluations[currentQuestion.id] : null;
	const answeredCount = Object.keys(evaluations).length;

	const handleSubmitAnswer = async () => {
		if (!currentQuestion || !answer.trim()) return;

		setIsEvaluating(true);
		const responseTime = startTime ? Math.round((Date.now() - startTime) / 1000) : undefined;

		// Save response
		setResponses((prev) => ({ ...prev, [currentQuestion.id]: answer }));

		try {
			// Submit to database
			await submitResponseMutation.mutateAsync({
				questionId: currentQuestion.id,
				response: answer,
				responseTime,
			});

			// Check if still mounted before continuing
			if (!isMountedRef.current) return;

			// Evaluate response
			const evaluation = await evaluateMutation.mutateAsync({
				question: currentQuestion,
				response: answer,
			});

			// Check if still mounted before updating state
			if (!isMountedRef.current) return;

			setEvaluations((prev) => ({ ...prev, [currentQuestion.id]: evaluation }));

			// Save evaluation to database
			await saveEvaluationMutation.mutateAsync(evaluation);

			// Check if still mounted before final updates
			if (!isMountedRef.current) return;

			queryClient.invalidateQueries({ queryKey: ["interview", "getSession"] });
			toast.success(t`Response evaluated successfully!`);
		} catch {
			// Only show error if still mounted
			if (isMountedRef.current) {
				toast.error(t`Error evaluating response`);
			}
		} finally {
			// Only update state if still mounted
			if (isMountedRef.current) {
				setIsEvaluating(false);
			}
		}
	};

	const handleNextQuestion = () => {
		if (currentQuestionIndex < questions.length - 1) {
			setDirection(1);
			setCurrentQuestionIndex((prev) => prev + 1);
			setAnswer(responses[questions[currentQuestionIndex + 1]?.id] || "");
			setStartTime(Date.now());
			setShowSampleAnswer(false);
		} else {
			// Session complete - go to results
			navigate({ to: "/dashboard/interview/results/$sessionId", params: { sessionId } });
		}
	};

	const handlePreviousQuestion = () => {
		if (currentQuestionIndex > 0) {
			setDirection(-1);
			setCurrentQuestionIndex((prev) => prev - 1);
			setAnswer(responses[questions[currentQuestionIndex - 1]?.id] || "");
			setShowSampleAnswer(false);
		}
	};

	const handleEndSession = () => {
		navigate({ to: "/dashboard/interview/results/$sessionId", params: { sessionId } });
	};

	// Animation variants
	const slideVariants = {
		enter: (dir: number) => ({
			x: dir > 0 ? 300 : -300,
			opacity: 0,
		}),
		center: {
			x: 0,
			opacity: 1,
		},
		exit: (dir: number) => ({
			x: dir < 0 ? 300 : -300,
			opacity: 0,
		}),
	};

	return (
		<div className="mx-auto max-w-4xl space-y-6 p-4">
			{/* Header with gradient */}
			<motion.div
				initial={false}
				animate={{ opacity: 1, y: 0 }}
				className="rounded-xl bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 p-6 text-white shadow-lg"
			>
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-4">
						<Link
							to="/dashboard/interview"
							className="flex items-center gap-2 rounded-lg bg-white/20 px-3 py-2 backdrop-blur-sm transition-colors hover:bg-white/30"
						>
							<ArrowLeftIcon className="size-4" />
							<span className="hidden sm:inline">{t`Back`}</span>
						</Link>
						<div>
							<h1 className="font-bold text-lg sm:text-xl">{session.title}</h1>
							<p className="text-sm opacity-80">
								{answeredCount} / {questions.length} {t`questions answered`}
							</p>
						</div>
					</div>
					<Timer startTime={startTime} />
				</div>
			</motion.div>

			{/* Progress section */}
			<motion.div initial={false} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-3">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-3">
						<span className="rounded-full bg-primary/10 px-4 py-1.5 font-semibold text-primary text-sm">
							Question {currentQuestionIndex + 1} / {questions.length}
						</span>
						{currentQuestion && (
							<Badge className={typeColors[currentQuestion.type] || "bg-gray-100"}>
								{getTypeLabels()[currentQuestion.type]}
							</Badge>
						)}
					</div>
					<Button
						variant="outline"
						size="sm"
						onClick={handleEndSession}
						className="text-orange-600 hover:bg-orange-50 hover:text-orange-700"
					>
						<FlagIcon className="mr-2 size-4" />
						{t`End interview`}
					</Button>
				</div>
				<div className="relative">
					<Progress value={progress} className="h-3" />
					<div className="mt-2 flex justify-between">
						{questions.map((_, idx) => (
							<motion.button
								key={idx}
								onClick={() => {
									// Prevent navigation during evaluation
									if (isEvaluating) return;
									setDirection(idx > currentQuestionIndex ? 1 : -1);
									setCurrentQuestionIndex(idx);
									setAnswer(responses[questions[idx]?.id] || "");
									setShowSampleAnswer(false);
								}}
								disabled={isEvaluating}
								className={`relative size-3 rounded-full transition-all ${
									idx === currentQuestionIndex
										? "scale-125 bg-primary ring-2 ring-primary/30"
										: evaluations[questions[idx]?.id]
											? "bg-green-500"
											: responses[questions[idx]?.id]
												? "bg-amber-500"
												: "bg-gray-300 dark:bg-gray-600"
								} ${isEvaluating ? "cursor-not-allowed opacity-50" : ""}`}
								whileHover={isEvaluating ? {} : { scale: 1.3 }}
								whileTap={isEvaluating ? {} : { scale: 0.9 }}
							/>
						))}
					</div>
				</div>
			</motion.div>

			{/* Question Card with Animation */}
			<AnimatePresence mode="wait" custom={direction}>
				<motion.div
					key={currentQuestionIndex}
					custom={direction}
					variants={slideVariants}
					initial="enter"
					animate="center"
					exit="exit"
					transition={{ type: "spring", stiffness: 300, damping: 30 }}
				>
					<Card className="overflow-hidden border-0 shadow-xl">
						{/* Question Header */}
						<CardHeader className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
							<div className="flex flex-wrap items-center gap-2">
								{currentQuestion?.difficulty && (
									<Badge className={difficultyColors[currentQuestion.difficulty]}>
										{currentQuestion.difficulty === "beginner"
											? t`Beginner`
											: currentQuestion.difficulty === "intermediate"
												? t`Intermediate`
												: t`Advanced`}
									</Badge>
								)}
								{currentQuestion?.tips && (
									<Badge variant="outline" className="border-blue-200 bg-blue-50 text-blue-700">
										<LightbulbIcon className="mr-1 size-3" />
										{t`Tip available`}
									</Badge>
								)}
							</div>
							<CardTitle className="mt-4 text-xl leading-relaxed sm:text-2xl">
								{currentQuestion?.questionFr || currentQuestion?.question}
							</CardTitle>
							{currentQuestion?.tips && !currentEvaluation && (
								<motion.p
									initial={{ opacity: 0, height: 0 }}
									animate={{ opacity: 1, height: "auto" }}
									className="mt-3 flex items-start gap-2 rounded-lg bg-blue-50 p-3 text-blue-700 text-sm dark:bg-blue-900/20 dark:text-blue-300"
								>
									<LightbulbIcon className="mt-0.5 size-4 shrink-0" />
									{currentQuestion.tips}
								</motion.p>
							)}
						</CardHeader>

						<CardContent className="space-y-6 p-6">
							{/* Answer Input */}
							<div className="space-y-2">
								<label className="font-medium text-sm">{t`Your response`}</label>
								<Textarea
									ref={textareaRef}
									placeholder={t`Write your response here... Take time to structure your ideas.`}
									value={answer}
									onChange={(e) => setAnswer(e.target.value)}
									className="min-h-[180px] resize-y transition-all focus:ring-2 focus:ring-primary/20"
									disabled={isEvaluating || !!currentEvaluation}
								/>
								<div className="flex items-center justify-between text-muted-foreground text-xs">
									<span>
										{answer.length} {t`characters`}
									</span>
									{!currentEvaluation && <span>{t`Press Enter for a line break`}</span>}
								</div>
							</div>

							{/* Evaluation Results */}
							{currentEvaluation && (
								<motion.div
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ duration: 0.5 }}
									className="space-y-6"
								>
									{/* Score and Overall Feedback */}
									<div className="flex items-start gap-4 rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 p-6 dark:from-slate-900/50 dark:to-slate-800/50">
										<ScoreBadge score={currentEvaluation.score} />
										<div className="flex-1">
											<h4 className="mb-2 font-semibold">{t`Evaluation`}</h4>
											<p className="text-muted-foreground text-sm leading-relaxed">
												{currentEvaluation.overallFeedback}
											</p>
										</div>
									</div>

									{/* Strengths */}
									{currentEvaluation.strengths.length > 0 && (
										<motion.div
											initial={{ opacity: 0, x: -20 }}
											animate={{ opacity: 1, x: 0 }}
											transition={{ delay: 0.1 }}
											className="rounded-xl border border-green-200 bg-green-50 p-4 dark:border-green-900 dark:bg-green-900/20"
										>
											<h5 className="mb-3 flex items-center gap-2 font-semibold text-green-700 dark:text-green-400">
												<CheckCircleIcon className="size-5" />
												{t`Strengths`}
											</h5>
											<ul className="space-y-2">
												{currentEvaluation.strengths.map((s, i) => (
													<motion.li
														key={i}
														initial={{ opacity: 0, x: -10 }}
														animate={{ opacity: 1, x: 0 }}
														transition={{ delay: 0.1 + i * 0.05 }}
														className="flex items-start gap-2 text-green-700 text-sm dark:text-green-300"
													>
														<CheckCircleIcon className="mt-0.5 size-4 shrink-0" />
														{s}
													</motion.li>
												))}
											</ul>
										</motion.div>
									)}

									{/* Areas to Improve */}
									{currentEvaluation.areasForImprovement.length > 0 && (
										<motion.div
											initial={{ opacity: 0, x: -20 }}
											animate={{ opacity: 1, x: 0 }}
											transition={{ delay: 0.2 }}
											className="rounded-xl border border-orange-200 bg-orange-50 p-4 dark:border-orange-900 dark:bg-orange-900/20"
										>
											<h5 className="mb-3 flex items-center gap-2 font-semibold text-orange-700 dark:text-orange-400">
												<WarningCircleIcon className="size-5" />
												{t`Areas to improve`}
											</h5>
											<ul className="space-y-2">
												{currentEvaluation.areasForImprovement.map((a, i) => (
													<motion.li
														key={i}
														initial={{ opacity: 0, x: -10 }}
														animate={{ opacity: 1, x: 0 }}
														transition={{ delay: 0.2 + i * 0.05 }}
														className="flex items-start gap-2 text-orange-700 text-sm dark:text-orange-300"
													>
														<XCircleIcon className="mt-0.5 size-4 shrink-0" />
														{a}
													</motion.li>
												))}
											</ul>
										</motion.div>
									)}

									{/* Sample Answer Collapsible */}
									{currentEvaluation.sampleAnswer && (
										<Collapsible open={showSampleAnswer} onOpenChange={setShowSampleAnswer}>
											<CollapsibleTrigger asChild>
												<Button
													variant="outline"
													className="w-full justify-between border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 dark:border-blue-900 dark:bg-blue-900/20 dark:text-blue-300 dark:hover:bg-blue-900/40"
												>
													<span className="flex items-center gap-2">
														<BrainIcon className="size-4" />
														{t`View a sample answer`}
													</span>
													{showSampleAnswer ? <CaretUpIcon className="size-4" /> : <CaretDownIcon className="size-4" />}
												</Button>
											</CollapsibleTrigger>
											<CollapsibleContent>
												<motion.div
													initial={{ opacity: 0 }}
													animate={{ opacity: 1 }}
													className="mt-3 rounded-xl border border-blue-200 bg-blue-50/50 p-4 dark:border-blue-900 dark:bg-blue-900/10"
												>
													<p className="text-blue-800 text-sm leading-relaxed dark:text-blue-200">
														{currentEvaluation.sampleAnswer}
													</p>
												</motion.div>
											</CollapsibleContent>
										</Collapsible>
									)}
								</motion.div>
							)}
						</CardContent>

						{/* Footer with Navigation */}
						<CardFooter className="flex flex-col gap-4 border-t bg-slate-50/50 p-6 sm:flex-row sm:justify-between dark:bg-slate-900/50">
							<Button
								variant="outline"
								onClick={handlePreviousQuestion}
								disabled={currentQuestionIndex === 0}
								className="w-full sm:w-auto"
							>
								<ArrowLeftIcon className="mr-2 size-4" />
								{t`Previous question`}
							</Button>

							<div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
								{!currentEvaluation && (
									<Button
										onClick={handleSubmitAnswer}
										disabled={!answer.trim() || isEvaluating}
										className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 sm:w-auto"
									>
										{isEvaluating ? (
											<>
												<SpinnerIcon className="mr-2 size-4 animate-spin" />
												{t`Evaluating...`}
											</>
										) : (
											<>
												<PaperPlaneIcon className="mr-2 size-4" />
												{t`Submit response`}
											</>
										)}
									</Button>
								)}

								{currentEvaluation && (
									<Button
										onClick={handleNextQuestion}
										className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 sm:w-auto"
									>
										{currentQuestionIndex === questions.length - 1 ? (
											<>
												<CheckCircleIcon className="mr-2 size-4" />
												{t`End interview`}
											</>
										) : (
											<>
												{t`Next question`}
												<ArrowRightIcon className="ml-2 size-4" />
											</>
										)}
									</Button>
								)}
							</div>
						</CardFooter>
					</Card>
				</motion.div>
			</AnimatePresence>

			{/* Quick Navigation Hint */}
			<motion.div
				initial={false}
				animate={{ opacity: 1 }}
				transition={{ delay: 0.5 }}
				className="text-center text-muted-foreground text-sm"
			>
				<p>{t`Click on the progress dots to navigate between questions`}</p>
			</motion.div>
		</div>
	);
}
