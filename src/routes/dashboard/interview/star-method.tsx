import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import {
	ArrowLeftIcon,
	ArrowRightIcon,
	BookOpenIcon,
	CheckCircleIcon,
	ClockCounterClockwiseIcon,
	LightbulbIcon,
	SpinnerIcon,
	StarIcon,
	TargetIcon,
} from "@phosphor-icons/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { ErrorComponent } from "@/components/error-component";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { authClient } from "@/integrations/auth/client";
import { client, orpc } from "@/integrations/orpc/client";
import { StarEvaluationResults, StarExamplesTab, StarHistoryTab } from "./-components/star-method-components";
import {
	CATEGORY_LABELS,
	STAR_COMPONENT_BORDER_COLORS,
	STAR_COMPONENT_COLORS,
	STAR_EDUCATION,
	STAR_SCENARIOS,
	STAR_STEPS,
} from "./-components/star-method-config";
import type {
	ActiveTab,
	ScenarioCategory,
	StarEvaluation,
	StarHistoryEntry,
	StarResponse,
	TrainerPhase,
} from "./-components/star-method-types";

// biome-ignore lint/suspicious/noExplicitAny: Route path not in generated route tree
export const Route = createFileRoute("/dashboard/interview/star-method" as any)({
	component: StarMethodPage,
	errorComponent: ErrorComponent,
});

function StarMethodPage() {
	const { data: session } = authClient.useSession();
	const queryClient = useQueryClient();

	const { data: aiStatus } = useQuery(orpc.aiConfig.status.check.queryOptions());

	const { data: historyData } = useQuery({
		...orpc.starMethod.list.queryOptions({ input: {} }),
		enabled: !!session?.user,
	});

	const history: StarHistoryEntry[] = (historyData ?? []).map((row) => ({
		id: row.id,
		scenarioId: row.scenarioId,
		questionFr: row.questionFr,
		category: row.category as ScenarioCategory,
		response: { situation: row.situation, task: row.task, action: row.action, result: row.result },
		evaluation: row.evaluation as StarEvaluation | undefined,
		completedAt: typeof row.completedAt === "string" ? row.completedAt : new Date(row.completedAt).toISOString(),
	}));

	const saveHistoryMutation = useMutation({
		mutationFn: (entry: {
			scenarioId: string;
			questionFr: string;
			category: string;
			situation: string;
			task: string;
			action: string;
			result: string;
			overallScore?: number;
			evaluation?: Record<string, unknown>;
		}) => client.starMethod.create(entry),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: orpc.starMethod.list.queryOptions({ input: {} }).queryKey });
		},
	});

	const [activeTab, setActiveTab] = useState<ActiveTab>("trainer");
	const [trainerPhase, setTrainerPhase] = useState<TrainerPhase>("select");
	const [selectedCategory, setSelectedCategory] = useState<ScenarioCategory | null>(null);
	const [currentStep, setCurrentStep] = useState(0);
	const [starResponse, setStarResponse] = useState<StarResponse>({ situation: "", task: "", action: "", result: "" });
	const [evaluation, setEvaluation] = useState<StarEvaluation | null>(null);

	const selectedScenario = selectedCategory
		? (STAR_SCENARIOS.find((s) => s.category === selectedCategory) ?? null)
		: null;
	const currentStepConfig = STAR_STEPS[currentStep];
	const currentKey = currentStepConfig?.key;
	const currentValue = currentKey ? starResponse[currentKey] : "";
	const isCurrentStepValid = currentValue.trim().length >= (currentStepConfig?.minLength ?? 0);
	const totalProgress = ((currentStep + 1) / STAR_STEPS.length) * 100;

	const evaluateMutation = useMutation({
		mutationFn: async () => {
			// biome-ignore lint/suspicious/noExplicitAny: aiStatus type narrowing
			if (!(aiStatus as any)?.available) throw new Error(t`AI not configured`);
			if (!selectedScenario) throw new Error(t`No scenario selected`);

			const formattedResponse = `STAR Method Response:
Situation: ${starResponse.situation}
Task: ${starResponse.task}
Action: ${starResponse.action}
Result: ${starResponse.result}`;

			const question = {
				id: selectedScenario.id,
				question: selectedScenario.questionEn,
				questionFr: selectedScenario.questionFr,
				type: "behavioral" as const,
				field: "general" as const,
				difficulty: "intermediate" as const,
				order: 1,
			};

			return await client.interview.evaluateResponse({
				question,
				response: formattedResponse,
				language: "fr",
				field: "general",
			});
		},
		onSuccess: (data) => {
			// The AI evaluates the STAR response as a whole and returns a single
			// `data.score`. We previously jittered each component score with
			// Math.random(), which fabricated per-component precision that the AI
			// never measured. Instead we show the real, deterministic overall
			// score for each component so the same answer always yields the same
			// numbers and we never present an invented measurement.
			const evalResult: StarEvaluation = {
				overallScore: data.score,
				componentScores: [
					{ component: "situation", score: data.score, feedback: data.strengths[0] ?? "" },
					{ component: "task", score: data.score, feedback: data.strengths[1] ?? "" },
					{ component: "action", score: data.score, feedback: data.areasForImprovement[0] ?? "" },
					{ component: "result", score: data.score, feedback: data.areasForImprovement[1] ?? "" },
				],
				strengths: data.strengths,
				improvements: data.areasForImprovement,
				modelAnswer: data.sampleAnswer ?? "",
				overallFeedback: data.overallFeedback,
			};
			setEvaluation(evalResult);
			setTrainerPhase("evaluation");

			if (selectedScenario) {
				saveHistoryMutation.mutate({
					scenarioId: selectedScenario.id,
					questionFr: selectedScenario.questionFr,
					category: selectedScenario.category,
					situation: starResponse.situation,
					task: starResponse.task,
					action: starResponse.action,
					result: starResponse.result,
					overallScore: evalResult.overallScore,
					evaluation: evalResult as unknown as Record<string, unknown>,
				});
			}
		},
		onError: (error) => {
			toast.error(error.message);
		},
	});

	const handleStartExercise = (category: ScenarioCategory) => {
		setSelectedCategory(category);
		setCurrentStep(0);
		setStarResponse({ situation: "", task: "", action: "", result: "" });
		setEvaluation(null);
		setTrainerPhase("exercise");
	};

	const handleStepChange = (value: string) => {
		if (!currentKey) return;
		setStarResponse((prev) => ({ ...prev, [currentKey]: value }));
	};

	const handleNextStep = () => {
		if (currentStep < STAR_STEPS.length - 1) {
			setCurrentStep((prev) => prev + 1);
		} else {
			evaluateMutation.mutate();
		}
	};

	const handleReset = () => {
		setTrainerPhase("select");
		setSelectedCategory(null);
		setCurrentStep(0);
		setStarResponse({ situation: "", task: "", action: "", result: "" });
		setEvaluation(null);
	};

	return (
		<div className="mx-auto max-w-4xl space-y-6 p-4">
			{/* Header */}
			<div className="flex items-center gap-3">
				<Link to="/dashboard/interview/practice">
					<Button variant="ghost" size="sm">
						<ArrowLeftIcon className="mr-2 size-4" />
						<Trans>Back</Trans>
					</Button>
				</Link>
				<div className="flex-1">
					<h1 className="flex items-center gap-2 font-bold text-2xl">
						<StarIcon className="size-7 text-emerald-600" weight="fill" />
						<Trans>STAR Method</Trans>
					</h1>
					<p className="text-muted-foreground text-sm">
						<Trans>Structured training for behavioral questions</Trans>
					</p>
				</div>
			</div>

			{/* Main Tabs */}
			<Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as ActiveTab)}>
				<TabsList className="grid w-full grid-cols-3">
					<TabsTrigger value="trainer" className="flex items-center gap-2">
						<TargetIcon className="size-4" />
						<Trans>Training</Trans>
					</TabsTrigger>
					<TabsTrigger value="examples" className="flex items-center gap-2">
						<BookOpenIcon className="size-4" />
						<Trans>Examples</Trans>
					</TabsTrigger>
					<TabsTrigger value="history" className="flex items-center gap-2">
						<ClockCounterClockwiseIcon className="size-4" />
						<Trans>History</Trans>
						{history.length > 0 && (
							<Badge variant="secondary" className="ml-1 h-5 min-w-5 px-1 text-xs">
								{history.length}
							</Badge>
						)}
					</TabsTrigger>
				</TabsList>

				{/* === TRAINER TAB === */}
				<TabsContent value="trainer" className="mt-4 space-y-6">
					{/* Educational intro */}
					<Card className="border-emerald-200 bg-emerald-50/50 dark:border-emerald-900 dark:bg-emerald-950/20">
						<CardHeader className="pb-3">
							<CardTitle className="text-emerald-800 text-lg dark:text-emerald-200">
								<Trans>What is the STAR Method?</Trans>
							</CardTitle>
							<CardDescription>{STAR_EDUCATION.description}</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
								{STAR_EDUCATION.components.map((comp) => (
									<div
										key={comp.letter}
										className={`rounded-lg border-2 p-3 text-center ${STAR_COMPONENT_BORDER_COLORS[comp.letter]}`}
									>
										<div
											className={`mx-auto mb-1 flex size-10 items-center justify-center rounded-full font-bold text-white text-xl ${STAR_COMPONENT_COLORS[comp.letter]}`}
										>
											{comp.letter}
										</div>
										<div className="font-semibold text-sm">{comp.label}</div>
										<p className="mt-1 text-muted-foreground text-xs">{comp.description}</p>
									</div>
								))}
							</div>
						</CardContent>
					</Card>

					{/* Trainer phases */}
					<AnimatePresence mode="wait">
						{trainerPhase === "select" && (
							<motion.div
								key="select"
								initial={{ opacity: 0, y: 16 }}
								animate={{ opacity: 1, y: 0 }}
								exit={{ opacity: 0, y: -16 }}
								transition={{ duration: 0.2 }}
								className="space-y-4"
							>
								<h2 className="font-semibold text-lg">
									<Trans>Choose a scenario</Trans>
								</h2>
								<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
									{STAR_SCENARIOS.map((scenario) => (
										<Card
											key={scenario.id}
											className="cursor-pointer transition-all hover:border-emerald-400 hover:shadow-md"
											onClick={() => handleStartExercise(scenario.category)}
										>
											<CardHeader className="pb-2">
												<Badge variant="outline" className="w-fit text-xs">
													{CATEGORY_LABELS[scenario.category]}
												</Badge>
												<CardTitle className="text-sm leading-relaxed">{scenario.questionFr}</CardTitle>
											</CardHeader>
											<CardContent className="pt-0">
												<Button size="sm" variant="outline" className="w-full">
													<Trans>Start</Trans>
													<ArrowRightIcon className="ml-2 size-3" />
												</Button>
											</CardContent>
										</Card>
									))}
								</div>
							</motion.div>
						)}

						{trainerPhase === "exercise" && selectedScenario && (
							<motion.div
								key="exercise"
								initial={{ opacity: 0, y: 16 }}
								animate={{ opacity: 1, y: 0 }}
								exit={{ opacity: 0, y: -16 }}
								transition={{ duration: 0.2 }}
								className="space-y-4"
							>
								<Card className="border-emerald-200">
									<CardHeader className="pb-2">
										<Badge variant="outline" className="w-fit">
											{CATEGORY_LABELS[selectedScenario.category]}
										</Badge>
										<CardTitle className="text-base leading-relaxed">{selectedScenario.questionFr}</CardTitle>
									</CardHeader>
								</Card>

								{/* Progress stepper */}
								<div className="space-y-2">
									<div className="flex items-center justify-between text-sm">
										<span className="text-muted-foreground">
											<Trans>
												Etape {currentStep + 1} sur {STAR_STEPS.length}
											</Trans>
										</span>
										<span className="font-medium">{STAR_STEPS[currentStep]?.label}</span>
									</div>
									<Progress value={totalProgress} className="h-2" />
									<div className="flex justify-between">
										{STAR_STEPS.map((step, idx) => (
											<div key={step.key} className="flex flex-col items-center gap-1">
												<div
													className={`flex size-8 items-center justify-center rounded-full font-bold text-sm text-white transition-all ${
														idx < currentStep
															? "bg-emerald-500"
															: idx === currentStep
																? STAR_COMPONENT_COLORS[step.letter]
																: "bg-muted text-muted-foreground"
													}`}
												>
													{idx < currentStep ? <CheckCircleIcon className="size-5" /> : step.letter}
												</div>
												<span className="hidden text-muted-foreground text-xs sm:block">{step.label}</span>
											</div>
										))}
									</div>
								</div>

								{/* Current step input */}
								<AnimatePresence mode="wait">
									<motion.div
										key={currentStep}
										initial={{ opacity: 0, x: 20 }}
										animate={{ opacity: 1, x: 0 }}
										exit={{ opacity: 0, x: -20 }}
										transition={{ duration: 0.18 }}
									>
										<Card className={`border-2 ${STAR_COMPONENT_BORDER_COLORS[currentStepConfig?.letter ?? "S"]}`}>
											<CardHeader className="pb-3">
												<div className="flex items-center gap-3">
													<div
														className={`flex size-10 items-center justify-center rounded-full font-bold text-lg text-white ${STAR_COMPONENT_COLORS[currentStepConfig?.letter ?? "S"]}`}
													>
														{currentStepConfig?.letter}
													</div>
													<div>
														<CardTitle className="text-lg">{currentStepConfig?.label}</CardTitle>
														{currentStepConfig && (
															<CardDescription className="mt-0.5 text-xs">{currentStepConfig.guidance}</CardDescription>
														)}
													</div>
												</div>
											</CardHeader>
											<CardContent className="space-y-3">
												<Textarea
													placeholder={currentStepConfig?.placeholder ?? ""}
													value={currentValue}
													onChange={(e) => handleStepChange(e.target.value)}
													className="min-h-[140px] resize-y"
												/>
												{currentStepConfig && selectedScenario && (
													<div className="rounded-md bg-amber-50 p-3 dark:bg-amber-950/20">
														<div className="flex items-start gap-2">
															<LightbulbIcon className="mt-0.5 size-4 text-amber-600" />
															<p className="text-amber-800 text-xs dark:text-amber-200">
																{selectedScenario.hints[currentStepConfig.key]}
															</p>
														</div>
													</div>
												)}
												<div className="flex items-center justify-between text-muted-foreground text-xs">
													<span>
														{currentValue.trim().length} / {currentStepConfig?.minLength ?? 0}{" "}
														<Trans>minimum characters</Trans>
													</span>
													{isCurrentStepValid && (
														<span className="text-emerald-600">
															<CheckCircleIcon className="mr-1 inline size-3" />
															<Trans>Minimum reached</Trans>
														</span>
													)}
												</div>
											</CardContent>
										</Card>
									</motion.div>
								</AnimatePresence>

								{/* Navigation */}
								<div className="flex justify-between">
									<Button
										variant="outline"
										onClick={currentStep === 0 ? handleReset : () => setCurrentStep((p) => p - 1)}
									>
										<ArrowLeftIcon className="mr-2 size-4" />
										{currentStep === 0 ? <Trans>Change scenario</Trans> : <Trans>Previous</Trans>}
									</Button>
									<Button
										onClick={handleNextStep}
										disabled={!isCurrentStepValid || evaluateMutation.isPending}
										className="bg-emerald-600 hover:bg-emerald-700"
									>
										{evaluateMutation.isPending ? (
											<>
												<SpinnerIcon className="mr-2 size-4 animate-spin" />
												<Trans>Evaluation in progress...</Trans>
											</>
										) : currentStep === STAR_STEPS.length - 1 ? (
											<>
												<Trans>Get AI evaluation</Trans>
												<StarIcon className="ml-2 size-4" />
											</>
										) : (
											<>
												<Trans>Next</Trans>
												<ArrowRightIcon className="ml-2 size-4" />
											</>
										)}
									</Button>
								</div>
							</motion.div>
						)}

						{trainerPhase === "evaluation" && evaluation && (
							<motion.div
								key="evaluation"
								initial={{ opacity: 0, y: 16 }}
								animate={{ opacity: 1, y: 0 }}
								exit={{ opacity: 0, y: -16 }}
								transition={{ duration: 0.2 }}
							>
								<StarEvaluationResults evaluation={evaluation} onReset={handleReset} onSetTab={setActiveTab} />
							</motion.div>
						)}
					</AnimatePresence>
				</TabsContent>

				{/* === EXAMPLES TAB === */}
				<TabsContent value="examples" className="mt-4">
					<StarExamplesTab />
				</TabsContent>

				{/* === HISTORY TAB === */}
				<TabsContent value="history" className="mt-4">
					<StarHistoryTab history={history} onStartExercise={() => setActiveTab("trainer")} />
				</TabsContent>
			</Tabs>
		</div>
	);
}
