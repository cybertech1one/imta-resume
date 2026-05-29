import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { ClipboardTextIcon, CompassIcon } from "@phosphor-icons/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { ErrorComponent } from "@/components/error-component";

import { authClient } from "@/integrations/auth/client";
import { orpc } from "@/integrations/orpc/client";

import { DashboardHeader } from "../-components/header";
import {
	AssessmentErrorState,
	AssessmentSkeleton,
	HeroSection,
	QuizSection,
	type RadarDataPoint,
	ResultsSection,
} from "./-components/assessment-components";
import { fieldIcons, getCategoryLabels, getIconFromName } from "./-components/assessment-config";
import type {
	CareerMatch,
	PersonalityProfile,
	QuestionType,
	QuizAnswer,
	QuizQuestion,
} from "./-components/assessment-types";
import {
	calculateCareerMatches,
	calculatePersonalityProfile,
	getNextSteps,
	getTrainingRecommendations,
} from "./-components/assessment-utils";

// Lazy load the career assessment component
const CareerAssessmentLazy = lazy(() => Promise.resolve({ default: CareerAssessment }));

// biome-ignore lint/suspicious/noExplicitAny: Route path not in generated route tree
export const Route = createFileRoute("/dashboard/career/assessment" as any)({
	component: () => (
		<Suspense
			fallback={
				<div className="flex items-center justify-center p-8">
					<Trans>Loading career assessment...</Trans>
				</div>
			}
		>
			<CareerAssessmentLazy />
		</Suspense>
	),
	errorComponent: ErrorComponent,
});

// ============================================================================
// Main Component
// ============================================================================

function CareerAssessment() {
	const { data: session } = authClient.useSession();
	const queryClient = useQueryClient();
	const categoryLabels = getCategoryLabels();

	// State
	const [currentQuestion, setCurrentQuestion] = useState(0);
	const [answers, setAnswers] = useState<QuizAnswer[]>([]);
	const [quizCompleted, setQuizCompleted] = useState(false);
	const [personalityProfile, setPersonalityProfile] = useState<PersonalityProfile | null>(null);
	const [careerMatches, setCareerMatches] = useState<CareerMatch[]>([]);
	const [isAnimating, setIsAnimating] = useState(false);
	const [activeResultsTab, setActiveResultsTab] = useState("careers");
	const [isInitialized, setIsInitialized] = useState(false);

	// Fetch quiz questions from database
	const { data: dbQuestions, isLoading: isLoadingQuestions } = useQuery({
		...orpc.careerQuizQuestions.listWithOptions.queryOptions({
			input: { quizType: "career_assessment", activeOnly: true },
		}),
		enabled: !!session?.user,
	});

	// Transform database questions to match QuizQuestion interface (no hardcoded fallback)
	const quizQuestions = useMemo((): QuizQuestion[] => {
		if (!dbQuestions || dbQuestions.length === 0) return [];

		return dbQuestions.map((q) => ({
			id: q.id,
			question: q.question,
			description: q.description ?? undefined,
			category: q.category as QuizQuestion["category"],
			type: q.type as QuestionType,
			trait: q.trait ?? "",
			scaleLabels: q.scaleMin && q.scaleMax ? { min: q.scaleMin, max: q.scaleMax } : undefined,
			options: q.options?.map((opt) => ({
				id: opt.id,
				text: opt.text,
				icon: getIconFromName(opt.icon),
				scores: (opt.scores as Record<string, number>) || {},
			})),
		}));
	}, [dbQuestions]);

	// Dynamic total questions based on data source
	const totalQuestions = quizQuestions.length;

	// Fetch IMTA programs from database
	const { data: dbPrograms } = useQuery({
		...orpc.imtaPrograms.list.queryOptions({ input: { activeOnly: true } }),
		enabled: !!session?.user,
	});

	// Programs array for career matching
	const programs = useMemo(() => dbPrograms || [], [dbPrograms]);

	// Fetch existing assessment from database
	const {
		data: savedAssessment,
		isLoading,
		error,
	} = useQuery({ ...orpc.career.assessment.get.queryOptions(), enabled: !!session?.user });

	// Save progress mutation
	const { mutate: saveProgress } = useMutation(
		orpc.career.assessment.saveProgress.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries({ queryKey: ["career", "assessment"] });
			},
		}),
	);

	// Complete assessment mutation
	const { mutate: completeAssessment } = useMutation(
		orpc.career.assessment.complete.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries({ queryKey: ["career", "assessment"] });
			},
		}),
	);

	// Reset assessment mutation
	const { mutate: resetAssessmentMutation, isPending: isResetting } = useMutation(
		orpc.career.assessment.reset.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries({ queryKey: ["career", "assessment"] });
				setAnswers([]);
				setCurrentQuestion(0);
				setQuizCompleted(false);
				setPersonalityProfile(null);
				setCareerMatches([]);
			},
		}),
	);

	// Current question data
	const currentQ = useMemo(() => quizQuestions[currentQuestion], [quizQuestions, currentQuestion]);
	const currentAnswer = useMemo(() => answers.find((a) => a.questionId === currentQ?.id), [answers, currentQ?.id]);
	const progress = useMemo(() => ((currentQuestion + 1) / totalQuestions) * 100, [currentQuestion, totalQuestions]);

	// Top recommendations
	const topPrograms = useMemo(() => careerMatches.slice(0, 3), [careerMatches]);
	const trainingRecommendations = useMemo(
		() => (personalityProfile ? getTrainingRecommendations(careerMatches, personalityProfile, programs) : []),
		[careerMatches, personalityProfile, programs],
	);
	const nextSteps = useMemo(
		() => (topPrograms[0] && personalityProfile ? getNextSteps(topPrograms[0], personalityProfile) : []),
		[topPrograms, personalityProfile],
	);

	// Radar chart data
	const radarData = useMemo((): RadarDataPoint[] | null => {
		if (!personalityProfile) return null;

		return [
			{ key: "patient_care", label: t`Patient Care`, value: personalityProfile.patient_care },
			{
				key: "technical_aptitude",
				label: t`Technical Aptitude`,
				value: personalityProfile.technical_aptitude,
			},
			{ key: "safety_focus", label: t`Safety Focus`, value: personalityProfile.safety_focus },
			{ key: "leadership", label: t`Leadership`, value: personalityProfile.leadership },
			{ key: "teamwork", label: t`Teamwork`, value: personalityProfile.teamwork },
			{ key: "communication", label: t`Communication`, value: personalityProfile.communication },
			{
				key: "stress_tolerance",
				label: t`Stress Management`,
				value: personalityProfile.stress_tolerance,
			},
		];
	}, [personalityProfile]);

	// Load saved assessment on mount
	useEffect(() => {
		if (savedAssessment && !isInitialized) {
			setIsInitialized(true);
			setAnswers(savedAssessment.answers as QuizAnswer[]);

			if (savedAssessment.status === "completed") {
				setQuizCompleted(true);
				if (savedAssessment.personalityProfile) {
					setPersonalityProfile(savedAssessment.personalityProfile as PersonalityProfile);
				}
				if (savedAssessment.careerMatches) {
					// Add icon to career matches from saved data
					const matchesWithIcons = (savedAssessment.careerMatches as CareerMatch[]).map((match) => ({
						...match,
						icon: fieldIcons[match.field] || CompassIcon,
					}));
					setCareerMatches(matchesWithIcons);
				}
			} else {
				setCurrentQuestion(savedAssessment.currentQuestion || 0);
			}
		} else if (!savedAssessment && !isLoading && !isInitialized) {
			setIsInitialized(true);
		}
	}, [savedAssessment, isLoading, isInitialized]);

	// Save progress to database
	const saveProgressToDb = useCallback(
		(newAnswers: QuizAnswer[], question: number) => {
			saveProgress({
				currentQuestion: question,
				answers: newAnswers,
			});
		},
		[saveProgress],
	);

	// Complete quiz - must be declared before handleAnswer which uses it
	const completeQuiz = useCallback(
		(finalAnswers: QuizAnswer[]) => {
			const profile = calculatePersonalityProfile(finalAnswers, quizQuestions);
			const matches = calculateCareerMatches(profile, programs);

			setPersonalityProfile(profile);
			setCareerMatches(matches);
			setQuizCompleted(true);

			// Save to database - strip icons for storage
			const matchesForStorage = matches.map(({ icon, ...rest }) => rest);
			completeAssessment({
				answers: finalAnswers,
				personalityProfile: profile,
				careerMatches: matchesForStorage,
			});
		},
		[completeAssessment, quizQuestions, programs],
	);

	// Handle multiple choice answer
	const handleAnswer = useCallback(
		(optionId: string) => {
			if (isAnimating) return;

			const questionId = currentQ.id;
			const newAnswers = [...answers.filter((a) => a.questionId !== questionId), { questionId, optionId }];
			setAnswers(newAnswers);
			setIsAnimating(true);

			setTimeout(() => {
				if (currentQuestion < totalQuestions - 1) {
					setCurrentQuestion((prev) => prev + 1);
					saveProgressToDb(newAnswers, currentQuestion + 1);
				} else {
					completeQuiz(newAnswers);
				}
				setIsAnimating(false);
			}, 400);
		},
		[currentQ, currentQuestion, answers, isAnimating, saveProgressToDb, completeQuiz, totalQuestions],
	);

	// Handle scale answer
	const handleScaleAnswer = useCallback(
		(value: number[]) => {
			const questionId = currentQ.id;
			const scaleValue = value[0];
			const newAnswers = [...answers.filter((a) => a.questionId !== questionId), { questionId, scaleValue }];
			setAnswers(newAnswers);
			saveProgressToDb(newAnswers, currentQuestion);
		},
		[currentQ, currentQuestion, answers, saveProgressToDb],
	);

	// Navigation
	const goToPrevious = useCallback(() => {
		if (currentQuestion > 0 && !isAnimating) {
			setIsAnimating(true);
			setTimeout(() => {
				setCurrentQuestion((prev) => prev - 1);
				setIsAnimating(false);
			}, 200);
		}
	}, [currentQuestion, isAnimating]);

	const goToNext = useCallback(() => {
		if (currentQuestion < totalQuestions - 1 && currentAnswer && !isAnimating) {
			setIsAnimating(true);
			setTimeout(() => {
				setCurrentQuestion((prev) => prev + 1);
				setIsAnimating(false);
			}, 200);
		} else if (currentQuestion === totalQuestions - 1 && currentAnswer) {
			completeQuiz(answers);
		}
	}, [currentQuestion, currentAnswer, isAnimating, answers, completeQuiz, totalQuestions]);

	// Reset quiz
	const resetQuiz = useCallback(() => {
		resetAssessmentMutation({});
	}, [resetAssessmentMutation]);

	// Get current scale value
	const currentScaleValue = useMemo(() => {
		if (currentQ?.type !== "scale") return 50;
		const answer = answers.find((a) => a.questionId === currentQ.id);
		return answer?.scaleValue ?? 50;
	}, [currentQ, answers]);

	// Show loading state
	if (isLoading || isLoadingQuestions) {
		return (
			<>
				<DashboardHeader icon={ClipboardTextIcon} title={t`Career Assessment`} />
				<AssessmentSkeleton />
			</>
		);
	}

	// Show error state
	if (error) {
		return (
			<>
				<DashboardHeader icon={ClipboardTextIcon} title={t`Career Assessment`} />
				<AssessmentErrorState />
			</>
		);
	}

	// Show empty state when no quiz questions are available
	if (!isLoading && totalQuestions === 0 && !quizCompleted) {
		return (
			<>
				<DashboardHeader icon={ClipboardTextIcon} title={t`Career Assessment`} />
				<div className="mx-auto max-w-2xl px-4 py-12 text-center">
					<ClipboardTextIcon className="mx-auto mb-4 size-12 text-muted-foreground" />
					<h3 className="mb-2 font-semibold text-lg">
						<Trans>Career assessment coming soon</Trans>
					</h3>
					<p className="text-muted-foreground">
						<Trans>
							We are preparing the assessment questions. Check back later to discover the careers that best match your
							profile!
						</Trans>
					</p>
				</div>
			</>
		);
	}

	return (
		<>
			<DashboardHeader icon={ClipboardTextIcon} title={t`Career Assessment`} />

			<HeroSection quizCompleted={quizCompleted} totalQuestions={totalQuestions} />

			{!quizCompleted && currentQ ? (
				<QuizSection
					currentQ={currentQ}
					currentAnswer={currentAnswer}
					currentQuestion={currentQuestion}
					totalQuestions={totalQuestions}
					progress={progress}
					currentScaleValue={currentScaleValue}
					isAnimating={isAnimating}
					isResetting={isResetting}
					categoryLabels={categoryLabels}
					handleAnswer={handleAnswer}
					handleScaleAnswer={handleScaleAnswer}
					goToPrevious={goToPrevious}
					goToNext={goToNext}
					resetQuiz={resetQuiz}
				/>
			) : (
				<ResultsSection
					activeResultsTab={activeResultsTab}
					setActiveResultsTab={setActiveResultsTab}
					topPrograms={topPrograms}
					careerMatches={careerMatches}
					programs={programs}
					radarData={radarData}
					personalityProfile={personalityProfile}
					trainingRecommendations={trainingRecommendations}
					nextSteps={nextSteps}
					resetQuiz={resetQuiz}
					isResetting={isResetting}
				/>
			)}
		</>
	);
}
