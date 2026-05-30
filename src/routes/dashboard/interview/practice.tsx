import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import {
	ArrowCounterClockwiseIcon,
	ArrowLeftIcon,
	ArrowRightIcon,
	BrainIcon,
	CheckCircleIcon,
	LightbulbIcon,
	PaperPlaneIcon,
	SparkleIcon,
	SpinnerIcon,
	WarningCircleIcon,
} from "@phosphor-icons/react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import z from "zod";
import { ErrorComponent } from "@/components/error-component";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { authClient } from "@/integrations/auth/client";
import { client, orpc } from "@/integrations/orpc/client";
import { imtaProgramSchema } from "@/schema/interview";

const searchSchema = z.object({
	field: z.enum(["healthcare", "industrial", "hse", "general"]).default("general"),
	difficulty: z.enum(["beginner", "intermediate", "advanced"]).default("intermediate"),
	program: imtaProgramSchema.optional(),
});

export const Route = createFileRoute("/dashboard/interview/practice")({
	component: PracticeSession,
	errorComponent: ErrorComponent,
	validateSearch: searchSchema,
});

function getTypeLabels() {
	return {
		behavioral: t`Behavioral`,
		technical: t`Technical`,
		situational: t`Situational`,
		motivational: t`Motivational`,
		general: t`Général`,
	};
}

const typeLabels = new Proxy({} as Record<string, string>, {
	get(_target, prop: string) {
		return getTypeLabels()[prop as keyof ReturnType<typeof getTypeLabels>] ?? prop;
	},
});

function getDifficultyLabels() {
	return {
		beginner: t`Beginner`,
		intermediate: t`Intermediate`,
		advanced: t`Advanced`,
	};
}

const difficultyLabels = new Proxy({} as Record<string, string>, {
	get(_target, prop: string) {
		return getDifficultyLabels()[prop as keyof ReturnType<typeof getDifficultyLabels>] ?? prop;
	},
});

function getFieldLabels() {
	return {
		healthcare: t`Healthcare / Nursing`,
		industrial: t`Industrial Maintenance`,
		hse: t`HSE / Safety`,
		general: t`Général`,
	};
}

const fieldLabels = new Proxy({} as Record<string, string>, {
	get(_target, prop: string) {
		return getFieldLabels()[prop as keyof ReturnType<typeof getFieldLabels>] ?? prop;
	},
});

type InterviewQuestion = {
	id: string;
	question: string;
	questionFr?: string;
	type: "behavioral" | "technical" | "situational" | "motivational" | "general";
	field: "healthcare" | "industrial" | "hse" | "general" | "technology" | "management";
	difficulty: "beginner" | "intermediate" | "advanced";
	expectedPoints?: string[];
	followUpQuestions?: string[];
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

function PracticeSession() {
	const navigate = useNavigate();
	const { field, difficulty, program } = Route.useSearch();
	const { data: session } = authClient.useSession();
	// AI status is a public endpoint - no auth guard needed, fires immediately
	const {
		data: aiStatus,
		isPending: isAiStatusPending,
		isError: isAiStatusError,
	} = useQuery({
		...orpc.aiConfig.status.check.queryOptions(),
		retry: 2,
		retryDelay: 1000,
	});

	// Get program info from database
	const { data: dbPrograms } = useQuery({
		...orpc.imtaPrograms.list.queryOptions({ input: { activeOnly: true } }),
		enabled: !!session?.user,
	});
	const selectedProgram = program && dbPrograms ? dbPrograms.find((p) => p.id === program) : null;
	// displayName could be used for UI display
	const _displayName = selectedProgram ? selectedProgram.name : fieldLabels[field as keyof typeof fieldLabels];
	void _displayName; // Mark as intentionally unused for now

	const [sessionId, setSessionId] = useState<string | null>(null);
	const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
	const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
	const [answer, setAnswer] = useState("");
	const [responses, setResponses] = useState<Record<string, string>>({});
	const [evaluations, setEvaluations] = useState<Record<string, ResponseEvaluation>>({});
	const [isEvaluating, setIsEvaluating] = useState(false);
	const [startTime, setStartTime] = useState<number | null>(null);
	const [phase, setPhase] = useState<"generating" | "practicing" | "completed" | "error">("generating");
	const [generationError, setGenerationError] = useState<string | null>(null);
	const [coachResults, setCoachResults] = useState<
		Record<string, { score: number; strengths: string[]; weaknesses: string[]; improvedAnswer: string; tips: string[] }>
	>({});
	const [improveResults, setImproveResults] = useState<
		Record<string, { improvedAnswer: string; explanation: string; changesSummary: string[]; methodUsed: string }>
	>({});

	// Generate questions mutation
	const generateMutation = useMutation({
		mutationFn: async () => {
			if (!aiStatus?.available) {
				throw new Error("AI is not configured. Please configure AI settings first.");
			}

			return await client.interview.generateQuestions({
				field,
				program,
				difficulty,
				types: ["behavioral", "technical", "situational", "motivational"],
				numberOfQuestions: 5,
				language: "fr",
				// Include program-specific context if available
				...(selectedProgram && {
					jobPosition: selectedProgram.name,
				}),
			});
		},
		onSuccess: (data) => {
			setQuestions(data);
			setPhase("practicing");
			setStartTime(Date.now());
			setGenerationError(null);
		},
		onError: (error) => {
			const errorMessage =
				error.message === "Internal server error" || error.message === "Output validation failed"
					? t`Failed to generate interview questions. The AI service may be temporarily unavailable.`
					: error.message;
			setGenerationError(errorMessage);
			setPhase("error");
			toast.error(errorMessage);
		},
	});

	// Create session mutation
	const createSessionMutation = useMutation({
		mutationFn: async (qs: InterviewQuestion[]) => {
			const sessionTitle = selectedProgram
				? `Interview ${selectedProgram.name} - ${new Date().toLocaleDateString()}`
				: `Interview ${fieldLabels[field as keyof typeof fieldLabels]} - ${new Date().toLocaleDateString()}`;

			return await client.interview.createSession({
				title: sessionTitle,
				field,
				difficulty,
				types: ["behavioral", "technical", "situational", "motivational"],
				language: "fr",
				questions: qs,
			});
		},
		onSuccess: (session) => {
			setSessionId(session.id);
		},
	});

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
				field,
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
			if (!sessionId) return null;
			return await client.interview.submitResponse({
				sessionId,
				questionId,
				response,
				responseTime,
			});
		},
	});

	// Coach answer mutation
	const coachMutation = useMutation(orpc.interview.coachAnswer.mutationOptions());

	// Improve answer mutation
	const improveMutation = useMutation(orpc.interview.improveAnswer.mutationOptions());

	// Save evaluation mutation
	const saveEvaluationMutation = useMutation({
		mutationFn: async (evaluation: ResponseEvaluation) => {
			if (!sessionId) return null;
			return await client.interview.saveEvaluation({
				sessionId,
				evaluation,
			});
		},
	});

	// Generate questions on mount
	// biome-ignore lint/correctness/useExhaustiveDependencies: Only run on mount
	useEffect(() => {
		if (aiStatus?.available) {
			generateMutation.mutate();
		}
	}, [aiStatus?.available]);

	// Create session when questions are ready
	// biome-ignore lint/correctness/useExhaustiveDependencies: Only run when questions change
	useEffect(() => {
		if (questions.length > 0 && !sessionId) {
			createSessionMutation.mutate(questions);
		}
	}, [questions, sessionId]);

	const currentQuestion = questions[currentQuestionIndex];
	const progress = questions.length > 0 ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0;

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

			// Evaluate response
			const evaluation = await evaluateMutation.mutateAsync({
				question: currentQuestion,
				response: answer,
			});

			setEvaluations((prev) => ({ ...prev, [currentQuestion.id]: evaluation }));

			// Save evaluation to database
			await saveEvaluationMutation.mutateAsync(evaluation);

			toast.success(t`Answer evaluated!`);
		} catch {
			toast.error(t`Error during evaluation`);
		} finally {
			setIsEvaluating(false);
		}
	};

	const handleNextQuestion = () => {
		if (currentQuestionIndex < questions.length - 1) {
			setCurrentQuestionIndex((prev) => prev + 1);
			setAnswer(responses[questions[currentQuestionIndex + 1]?.id] || "");
			setStartTime(Date.now());
		} else {
			setPhase("completed");
		}
	};

	const handlePreviousQuestion = () => {
		if (currentQuestionIndex > 0) {
			setCurrentQuestionIndex((prev) => prev - 1);
			setAnswer(responses[questions[currentQuestionIndex - 1]?.id] || "");
		}
	};

	const currentEvaluation = currentQuestion ? evaluations[currentQuestion.id] : null;

	if (isAiStatusPending) {
		return (
			<div className="flex min-h-[60vh] items-center justify-center">
				<div className="flex flex-col items-center gap-3">
					<SpinnerIcon className="size-8 animate-spin text-primary" />
					<p className="text-muted-foreground text-sm">
						<Trans>Loading...</Trans>
					</p>
				</div>
			</div>
		);
	}

	if (isAiStatusError || !aiStatus?.available) {
		return (
			<div className="flex min-h-[60vh] items-center justify-center">
				<Card className="max-w-md">
					<CardHeader>
						<CardTitle>
							<Trans>AI Not Available</Trans>
						</CardTitle>
						<CardDescription>
							{isAiStatusError ? (
								<Trans>Could not connect to the AI service. Please check your connection and try again.</Trans>
							) : (
								<Trans>AI features are not currently available. Please contact your administrator.</Trans>
							)}
						</CardDescription>
					</CardHeader>
					<CardFooter className="flex gap-2">
						<Button variant="outline" onClick={() => navigate({ to: "/dashboard/interview" })}>
							<Trans>Back to Interview</Trans>
						</Button>
						<Button onClick={() => navigate({ to: "/dashboard/settings/ai" })}>
							<Trans>View AI Status</Trans>
						</Button>
					</CardFooter>
				</Card>
			</div>
		);
	}

	if (phase === "error") {
		return (
			<div className="flex min-h-[60vh] items-center justify-center">
				<Card className="max-w-md">
					<CardHeader className="text-center">
						<WarningCircleIcon className="mx-auto mb-2 size-12 text-destructive" />
						<CardTitle>
							<Trans>Question Generation Failed</Trans>
						</CardTitle>
						<CardDescription>
							{generationError || (
								<Trans>An error occurred while generating interview questions. Please try again.</Trans>
							)}
						</CardDescription>
					</CardHeader>
					<CardFooter className="flex justify-center gap-2">
						<Button variant="outline" onClick={() => navigate({ to: "/dashboard/interview" })}>
							<ArrowLeftIcon className="mr-2 size-4" />
							<Trans>Back to Interview</Trans>
						</Button>
						<Button
							onClick={() => {
								setPhase("generating");
								setGenerationError(null);
								generateMutation.mutate();
							}}
						>
							<ArrowCounterClockwiseIcon className="mr-2 size-4" />
							<Trans>Retry</Trans>
						</Button>
					</CardFooter>
				</Card>
			</div>
		);
	}

	if (phase === "generating" || generateMutation.isPending) {
		return (
			<div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
				<SpinnerIcon className="size-12 animate-spin text-primary" />
				<h2 className="font-semibold text-xl">
					<Trans>Generating interview questions...</Trans>
				</h2>
				<p className="text-muted-foreground">
					<Trans>
						AI is creating personalized questions for your {fieldLabels[field as keyof typeof fieldLabels]} interview
					</Trans>
				</p>
			</div>
		);
	}

	if (phase === "completed") {
		const totalScore =
			Object.values(evaluations).length > 0
				? Math.round(
						Object.values(evaluations).reduce((acc, e) => acc + e.score, 0) / Object.values(evaluations).length,
					)
				: 0;

		return (
			<div className="mx-auto max-w-2xl space-y-6">
				<Card>
					<CardHeader className="text-center">
						<CheckCircleIcon className="mx-auto mb-4 size-16 text-green-500" />
						<CardTitle className="text-2xl">
							<Trans>Session Complete!</Trans>
						</CardTitle>
						<CardDescription>
							<Trans>You've answered all {questions.length} questions</Trans>
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-6">
						<div className="text-center">
							<div className="font-bold text-4xl text-primary">{totalScore}%</div>
							<p className="text-muted-foreground">
								<Trans>Average Score</Trans>
							</p>
						</div>

						<div className="grid gap-2">
							{questions.map((q, idx) => {
								const evaluation = evaluations[q.id];
								return (
									<div key={q.id} className="flex items-center justify-between rounded-lg border p-3">
										<span className="text-sm">
											<Trans>
												Q{idx + 1}: {typeLabels[q.type as keyof typeof typeLabels]}
											</Trans>
										</span>
										<Badge variant={evaluation?.score >= 70 ? "default" : "secondary"}>{evaluation?.score || 0}%</Badge>
									</div>
								);
							})}
						</div>
					</CardContent>
					<CardFooter className="flex justify-center gap-4">
						{sessionId && (
							<Button
								onClick={() => navigate({ to: "/dashboard/interview/results/$sessionId", params: { sessionId } })}
							>
								<Trans>View Detailed Results</Trans>
							</Button>
						)}
						<Button variant="outline" onClick={() => navigate({ to: "/dashboard/interview" })}>
							<Trans>Back to Dashboard</Trans>
						</Button>
					</CardFooter>
				</Card>
			</div>
		);
	}

	return (
		<div className="mx-auto max-w-3xl space-y-6">
			{/* Progress Header */}
			<div className="space-y-2">
				<div className="flex items-center justify-between text-sm">
					<span className="text-muted-foreground">
						<Trans>
							Question {currentQuestionIndex + 1} of {questions.length}
						</Trans>
					</span>
					<Badge variant="outline">
						{difficultyLabels[difficulty as keyof typeof difficultyLabels]} •{" "}
						{fieldLabels[field as keyof typeof fieldLabels]}
					</Badge>
				</div>
				<Progress value={progress} />
			</div>

			{/* Question Card */}
			<Card>
				<CardHeader>
					<div className="flex items-center gap-2">
						<Badge>{typeLabels[currentQuestion?.type as keyof typeof typeLabels] || currentQuestion?.type}</Badge>
						{currentQuestion?.tips && (
							<Badge variant="outline" className="text-xs">
								<BrainIcon className="mr-1 size-3" />
								<Trans>Tip available</Trans>
							</Badge>
						)}
					</div>
					<CardTitle className="text-xl leading-relaxed">{currentQuestion?.question}</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					{/* Answer Input */}
					<div className="space-y-2">
						<Textarea
							placeholder={t`Write your answer here...`}
							value={answer}
							onChange={(e) => setAnswer(e.target.value)}
							className="min-h-[150px] resize-y"
							disabled={isEvaluating || !!currentEvaluation}
						/>
						{currentQuestion?.tips && !currentEvaluation && (
							<p className="text-muted-foreground text-xs">
								<strong>
									<Trans>Tip</Trans>:
								</strong>{" "}
								{currentQuestion.tips}
							</p>
						)}
					</div>

					{/* Evaluation Results */}
					{currentEvaluation && (
						<div className="space-y-4 rounded-lg border bg-muted/30 p-4">
							<div className="flex items-center justify-between">
								<h4 className="font-semibold">
									<Trans>Evaluation</Trans>
								</h4>
								<Badge variant={currentEvaluation.score >= 70 ? "default" : "secondary"} className="text-lg">
									{currentEvaluation.score}%
								</Badge>
							</div>

							<p className="text-sm">{currentEvaluation.overallFeedback}</p>

							{currentEvaluation.strengths.length > 0 && (
								<div>
									<h5 className="mb-1 font-medium text-green-600 text-sm">
										<Trans>Strengths</Trans>:
									</h5>
									<ul className="list-inside list-disc text-sm">
										{currentEvaluation.strengths.map((s, i) => (
											<li key={i}>{s}</li>
										))}
									</ul>
								</div>
							)}

							{currentEvaluation.areasForImprovement.length > 0 && (
								<div>
									<h5 className="mb-1 font-medium text-orange-600 text-sm">
										<Trans>Areas for improvement</Trans>:
									</h5>
									<ul className="list-inside list-disc text-sm">
										{currentEvaluation.areasForImprovement.map((a, i) => (
											<li key={i}>{a}</li>
										))}
									</ul>
								</div>
							)}

							{currentEvaluation.sampleAnswer && (
								<div>
									<h5 className="mb-1 font-medium text-sm">
										<Trans>Sample answer</Trans>:
									</h5>
									<p className="text-muted-foreground text-sm">{currentEvaluation.sampleAnswer}</p>
								</div>
							)}

							{/* AI Coach & Improve buttons */}
							<div className="flex flex-wrap gap-2 border-t pt-3">
								{!coachResults[currentQuestion.id] && (
									<Button
										variant="outline"
										size="sm"
										disabled={coachMutation.isPending}
										onClick={async () => {
											try {
												const res = await coachMutation.mutateAsync({
													question: currentQuestion.question,
													userAnswer: responses[currentQuestion.id] || answer,
													field: field as "healthcare" | "industrial" | "hse" | "general",
													difficulty: difficulty as "beginner" | "intermediate" | "advanced",
													language: "fr",
												});
												setCoachResults((prev) => ({
													...prev,
													[currentQuestion.id]: res as (typeof coachResults)[string],
												}));
											} catch {
												toast.error(t`Coaching failed`);
											}
										}}
									>
										{coachMutation.isPending ? (
											<SpinnerIcon className="mr-1.5 size-3.5 animate-spin" />
										) : (
											<LightbulbIcon className="mr-1.5 size-3.5" weight="duotone" />
										)}
										<Trans>AI Coach Feedback</Trans>
									</Button>
								)}
								{!improveResults[currentQuestion.id] && (
									<Button
										variant="outline"
										size="sm"
										disabled={improveMutation.isPending}
										onClick={async () => {
											try {
												const res = await improveMutation.mutateAsync({
													question: currentQuestion.question,
													draftAnswer: responses[currentQuestion.id] || answer,
													field: field as "healthcare" | "industrial" | "hse" | "general",
													language: "fr",
												});
												setImproveResults((prev) => ({
													...prev,
													[currentQuestion.id]: res as (typeof improveResults)[string],
												}));
											} catch {
												toast.error(t`Improvement failed`);
											}
										}}
									>
										{improveMutation.isPending ? (
											<SpinnerIcon className="mr-1.5 size-3.5 animate-spin" />
										) : (
											<SparkleIcon className="mr-1.5 size-3.5" weight="duotone" />
										)}
										<Trans>Improve My Answer</Trans>
									</Button>
								)}
							</div>

							{/* Coach results */}
							{coachResults[currentQuestion.id] && (
								<div className="space-y-2 rounded-lg border border-blue-200 bg-blue-50/50 p-3 dark:border-blue-800 dark:bg-blue-900/20">
									<div className="flex items-center gap-2">
										<LightbulbIcon className="size-4 text-blue-600" weight="fill" />
										<h5 className="font-medium text-blue-800 text-sm dark:text-blue-300">
											<Trans>Coach Feedback</Trans>
										</h5>
										<Badge variant="outline" className="ml-auto">
											{coachResults[currentQuestion.id].score}/10
										</Badge>
									</div>
									{coachResults[currentQuestion.id].tips.length > 0 && (
										<ul className="list-inside list-disc text-sm">
											{coachResults[currentQuestion.id].tips.map((tip, i) => (
												<li key={i}>{tip}</li>
											))}
										</ul>
									)}
									{coachResults[currentQuestion.id].improvedAnswer && (
										<div className="mt-2">
											<h6 className="font-medium text-xs">
												<Trans>Suggested Answer:</Trans>
											</h6>
											<p className="text-muted-foreground text-sm">{coachResults[currentQuestion.id].improvedAnswer}</p>
										</div>
									)}
								</div>
							)}

							{/* Improve results */}
							{improveResults[currentQuestion.id] && (
								<div className="space-y-2 rounded-lg border border-emerald-200 bg-emerald-50/50 p-3 dark:border-emerald-800 dark:bg-emerald-900/20">
									<div className="flex items-center gap-2">
										<SparkleIcon className="size-4 text-emerald-600" weight="fill" />
										<h5 className="font-medium text-emerald-800 text-sm dark:text-emerald-300">
											<Trans>Improved Answer</Trans>
										</h5>
										<Badge variant="outline" className="ml-auto">
											{improveResults[currentQuestion.id].methodUsed}
										</Badge>
									</div>
									<p className="text-sm">{improveResults[currentQuestion.id].improvedAnswer}</p>
									<p className="text-muted-foreground text-xs">{improveResults[currentQuestion.id].explanation}</p>
									{improveResults[currentQuestion.id].changesSummary.length > 0 && (
										<ul className="list-inside list-disc text-muted-foreground text-xs">
											{improveResults[currentQuestion.id].changesSummary.map((c, i) => (
												<li key={i}>{c}</li>
											))}
										</ul>
									)}
								</div>
							)}
						</div>
					)}
				</CardContent>
				<CardFooter className="flex justify-between">
					<Button variant="outline" onClick={handlePreviousQuestion} disabled={currentQuestionIndex === 0}>
						<ArrowLeftIcon className="mr-2 size-4" />
						<Trans>Previous</Trans>
					</Button>

					<div className="flex gap-2">
						{!currentEvaluation && (
							<Button onClick={handleSubmitAnswer} disabled={!answer.trim() || isEvaluating}>
								{isEvaluating ? (
									<>
										<SpinnerIcon className="mr-2 size-4 animate-spin" />
										<Trans>Evaluating...</Trans>
									</>
								) : (
									<>
										<PaperPlaneIcon className="mr-2 size-4" />
										<Trans>Submit Answer</Trans>
									</>
								)}
							</Button>
						)}

						{currentEvaluation && (
							<Button onClick={handleNextQuestion}>
								{currentQuestionIndex === questions.length - 1 ? (
									<Trans>Finish Session</Trans>
								) : (
									<>
										<Trans>Next Question</Trans>
										<ArrowRightIcon className="ml-2 size-4" />
									</>
								)}
							</Button>
						)}
					</div>
				</CardFooter>
			</Card>
		</div>
	);
}
