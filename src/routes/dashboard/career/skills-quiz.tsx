import { t } from "@lingui/core/macro";
import { BrainIcon, CalendarIcon, CertificateIcon, QuestionIcon } from "@phosphor-icons/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ErrorComponent } from "@/components/error-component";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { authClient } from "@/integrations/auth/client";
import { orpc } from "@/integrations/orpc/client";
import { generateId } from "@/utils/string";

import { DashboardHeader } from "../-components/header";
import {
	BadgesTab,
	CategorySelectionTab,
	HeroSection,
	HistoryTab,
	QuizTab,
	ResultsTab,
	SkillsQuizError,
	SkillsQuizLoading,
} from "./-components/skills-quiz-components";
import { TIMER_ENABLED_KEY } from "./-components/skills-quiz-config";
import type {
	ImprovementPlan,
	QuizAnswer,
	QuizQuestion,
	QuizResult,
	SkillCategory,
} from "./-components/skills-quiz-types";
import {
	calculateLevel,
	generateImprovementPlan,
	getEarnedBadges,
	getQuestionsForCategory,
	shuffleArray,
} from "./-components/skills-quiz-utils";

// biome-ignore lint/suspicious/noExplicitAny: Route path not in generated route tree
export const Route = createFileRoute("/dashboard/career/skills-quiz" as any)({
	component: SkillsQuiz,
	errorComponent: ErrorComponent,
});

function SkillsQuiz() {
	const { data: session } = authClient.useSession();
	const queryClient = useQueryClient();

	// State
	const [activeTab, setActiveTab] = useState("selection");
	const [selectedCategory, setSelectedCategory] = useState<SkillCategory | null>(null);
	const [questions, setQuestions] = useState<QuizQuestion[]>([]);
	const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
	const [answers, setAnswers] = useState<QuizAnswer[]>([]);
	const [selectedOption, setSelectedOption] = useState<string | null>(null);
	const [showExplanation, setShowExplanation] = useState(false);
	const [currentResult, setCurrentResult] = useState<QuizResult | null>(null);
	const [improvementPlans, setImprovementPlans] = useState<ImprovementPlan[]>([]);

	// Timer state
	const [timerEnabled, setTimerEnabled] = useState(true);
	const [timeRemaining, setTimeRemaining] = useState(0);
	const [questionStartTime, setQuestionStartTime] = useState(0);
	const [isPaused, setIsPaused] = useState(false);
	const [totalTimeSpent, setTotalTimeSpent] = useState(0);

	// Fetch quiz results from database
	const {
		data: quizResultsData = [],
		isLoading,
		error,
	} = useQuery({ ...orpc.career.skillsQuiz.list.queryOptions({}), enabled: !!session?.user });

	// Map database results to QuizResult type
	const quizResults: QuizResult[] = useMemo(() => {
		return quizResultsData.map((r) => ({
			id: r.id,
			category: r.category,
			date: r.createdAt.toISOString(),
			totalQuestions: r.totalQuestions,
			correctAnswers: r.correctAnswers,
			score: r.score,
			level: r.level,
			timeSpent: r.timeSpent,
			skillBreakdown: r.skillBreakdown,
			badges: r.badges,
		}));
	}, [quizResultsData]);

	// Create mutation to save quiz results
	const createResultMutation = useMutation(
		orpc.career.skillsQuiz.create.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries({ queryKey: ["career", "skillsQuiz"] });
			},
		}),
	);

	// Load timer preference from localStorage (UI preference - acceptable)
	useEffect(() => {
		const savedTimerPref = localStorage.getItem(TIMER_ENABLED_KEY);
		if (savedTimerPref !== null) {
			setTimerEnabled(savedTimerPref === "true");
		}
	}, []);

	// Timer effect
	// biome-ignore lint/correctness/useExhaustiveDependencies: handleTimeUp is stable, avoid circular deps
	useEffect(() => {
		if (!timerEnabled || isPaused || timeRemaining <= 0 || showExplanation) return;

		const timer = setInterval(() => {
			setTimeRemaining((prev) => {
				if (prev <= 1) {
					handleTimeUp();
					return 0;
				}
				return prev - 1;
			});
		}, 1000);

		return () => clearInterval(timer);
	}, [timerEnabled, isPaused, timeRemaining, showExplanation]);

	// Computed values
	const currentQuestion = useMemo(() => questions[currentQuestionIndex], [questions, currentQuestionIndex]);
	const progress = useMemo(
		() => ((currentQuestionIndex + 1) / questions.length) * 100,
		[currentQuestionIndex, questions.length],
	);

	// Radar chart data
	const radarData = useMemo(() => {
		if (!currentResult) return [];

		return Object.entries(currentResult.skillBreakdown).map(([skill, data]) => ({
			skill: skill.length > 15 ? `${skill.substring(0, 12)}...` : skill,
			score: Math.round((data.correct / data.total) * 100),
			fullMark: 100,
		}));
	}, [currentResult]);

	// History radar data for comparison
	const historyRadarData = useMemo(() => {
		const categoryResults = quizResults.filter((r) => selectedCategory && r.category === selectedCategory);
		if (categoryResults.length === 0) return [];

		const skillScores: Record<string, { total: number; count: number }> = {};

		for (const result of categoryResults) {
			for (const [skill, data] of Object.entries(result.skillBreakdown)) {
				if (!skillScores[skill]) {
					skillScores[skill] = { total: 0, count: 0 };
				}
				skillScores[skill].total += (data.correct / data.total) * 100;
				skillScores[skill].count += 1;
			}
		}

		return Object.entries(skillScores).map(([skill, data]) => ({
			skill: skill.length > 15 ? `${skill.substring(0, 12)}...` : skill,
			score: Math.round(data.total / data.count),
			fullMark: 100,
		}));
	}, [quizResults, selectedCategory]);

	// Best result per category
	const bestResults = useMemo(() => {
		const best: Record<SkillCategory, QuizResult | null> = {
			technical: null,
			soft_skills: null,
			leadership: null,
		};

		for (const result of quizResults) {
			if (!best[result.category] || result.score > (best[result.category]?.score ?? 0)) {
				best[result.category] = result;
			}
		}

		return best;
	}, [quizResults]);

	// All earned badges
	const allEarnedBadges = useMemo(() => {
		const badges = new Set<string>();
		for (const result of quizResults) {
			for (const badge of result.badges) {
				badges.add(badge);
			}
		}
		return Array.from(badges);
	}, [quizResults]);

	// Handlers
	const startQuiz = useCallback((category: SkillCategory) => {
		const categoryQuestions = getQuestionsForCategory(category);
		const shuffled = shuffleArray(categoryQuestions).slice(0, 10);

		setSelectedCategory(category);
		setQuestions(shuffled);
		setCurrentQuestionIndex(0);
		setAnswers([]);
		setSelectedOption(null);
		setShowExplanation(false);
		setCurrentResult(null);
		setTotalTimeSpent(0);
		setTimeRemaining(shuffled[0].timeLimit);
		setQuestionStartTime(Date.now());
		setIsPaused(false);
		setActiveTab("quiz");
	}, []);

	const handleTimeUp = useCallback(() => {
		if (!currentQuestion || showExplanation) return;

		const timeSpent = Math.round((Date.now() - questionStartTime) / 1000);
		setTotalTimeSpent((prev) => prev + timeSpent);

		const answer: QuizAnswer = {
			questionId: currentQuestion.id,
			selectedOptionId: "",
			isCorrect: false,
			timeSpent,
		};

		setAnswers((prev) => [...prev, answer]);
		setShowExplanation(true);
	}, [currentQuestion, questionStartTime, showExplanation]);

	const handleSelectOption = useCallback(
		(optionId: string) => {
			if (showExplanation) return;
			setSelectedOption(optionId);
		},
		[showExplanation],
	);

	const handleSubmitAnswer = useCallback(() => {
		if (!selectedOption || !currentQuestion) return;

		const timeSpent = Math.round((Date.now() - questionStartTime) / 1000);
		setTotalTimeSpent((prev) => prev + timeSpent);

		const isCorrect = currentQuestion.options.find((o) => o.id === selectedOption)?.isCorrect ?? false;

		const answer: QuizAnswer = {
			questionId: currentQuestion.id,
			selectedOptionId: selectedOption,
			isCorrect,
			timeSpent,
		};

		setAnswers((prev) => [...prev, answer]);
		setShowExplanation(true);
	}, [selectedOption, currentQuestion, questionStartTime]);

	const finishQuiz = useCallback(() => {
		if (!selectedCategory) return;

		const correctAnswersCount = answers.filter((a) => a.isCorrect).length;
		const score = Math.round((correctAnswersCount / questions.length) * 100);
		const level = calculateLevel(score);

		const skillBreakdown: Record<string, { correct: number; total: number }> = {};
		for (let i = 0; i < questions.length; i++) {
			const q = questions[i];
			const a = answers[i];
			if (!skillBreakdown[q.skill]) {
				skillBreakdown[q.skill] = { correct: 0, total: 0 };
			}
			skillBreakdown[q.skill].total += 1;
			if (a?.isCorrect) {
				skillBreakdown[q.skill].correct += 1;
			}
		}

		// Create a temporary result for display while saving
		const tempResult: QuizResult = {
			id: generateId(),
			category: selectedCategory,
			date: new Date().toISOString(),
			totalQuestions: questions.length,
			correctAnswers: correctAnswersCount,
			score,
			level,
			timeSpent: totalTimeSpent,
			skillBreakdown,
			badges: [],
		};

		// Calculate earned badges including the new result
		const earnedBadges = getEarnedBadges(tempResult, [...quizResults, tempResult]);
		tempResult.badges = earnedBadges;

		// Set current result for display
		setCurrentResult(tempResult);
		setImprovementPlans(generateImprovementPlan(tempResult));

		// Save to database via oRPC
		createResultMutation.mutate({
			category: selectedCategory,
			totalQuestions: questions.length,
			correctAnswers: correctAnswersCount,
			score,
			level,
			timeSpent: totalTimeSpent,
			skillBreakdown,
			badges: earnedBadges,
		});

		setActiveTab("results");
	}, [selectedCategory, answers, questions, totalTimeSpent, quizResults, createResultMutation]);

	const handleNextQuestion = useCallback(() => {
		if (currentQuestionIndex < questions.length - 1) {
			setCurrentQuestionIndex((prev) => prev + 1);
			setSelectedOption(null);
			setShowExplanation(false);
			setTimeRemaining(questions[currentQuestionIndex + 1].timeLimit);
			setQuestionStartTime(Date.now());
		} else {
			finishQuiz();
		}
	}, [currentQuestionIndex, questions, finishQuiz]);

	const toggleTimer = useCallback(() => {
		const newValue = !timerEnabled;
		setTimerEnabled(newValue);
		localStorage.setItem(TIMER_ENABLED_KEY, String(newValue));
	}, [timerEnabled]);

	const retakeQuiz = useCallback(() => {
		if (selectedCategory) {
			startQuiz(selectedCategory);
		}
	}, [selectedCategory, startQuiz]);

	const goToSelection = useCallback(() => {
		setActiveTab("selection");
		setSelectedCategory(null);
		setQuestions([]);
		setCurrentQuestionIndex(0);
		setAnswers([]);
		setCurrentResult(null);
	}, []);

	if (!session?.user || isLoading) {
		return (
			<>
				<DashboardHeader icon={BrainIcon} title={t`Skills Assessment Quiz`} />
				<SkillsQuizLoading />
			</>
		);
	}

	if (error) {
		return (
			<>
				<DashboardHeader icon={BrainIcon} title={t`Skills Assessment Quiz`} />
				<SkillsQuizError onRetry={() => queryClient.invalidateQueries({ queryKey: ["career", "skillsQuiz"] })} />
			</>
		);
	}

	return (
		<>
			<DashboardHeader icon={BrainIcon} title={t`Skills Assessment Quiz`} />

			<HeroSection quizResultsCount={quizResults.length} allEarnedBadgesCount={allEarnedBadges.length} />

			<Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
				<TabsList className="flex h-auto flex-wrap gap-2 bg-transparent p-0">
					{[
						{ value: "selection", icon: QuestionIcon, label: t`New Quiz` },
						{ value: "history", icon: CalendarIcon, label: t`History` },
						{ value: "badges", icon: CertificateIcon, label: t`Badges` },
					].map((tab) => (
						<TabsTrigger
							key={tab.value}
							value={tab.value}
							disabled={tab.value === "quiz" || tab.value === "results"}
							className="gap-2 rounded-full border border-transparent bg-muted/50 px-6 py-2.5 data-[state=active]:border-primary/30 data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
						>
							<tab.icon className="size-4" />
							{tab.label}
						</TabsTrigger>
					))}
				</TabsList>

				<TabsContent value="selection" className="space-y-8">
					<CategorySelectionTab
						bestResults={bestResults}
						timerEnabled={timerEnabled}
						onStartQuiz={startQuiz}
						onToggleTimer={toggleTimer}
					/>
				</TabsContent>

				<TabsContent value="quiz" className="space-y-6">
					{currentQuestion && (
						<QuizTab
							currentQuestion={currentQuestion}
							currentQuestionIndex={currentQuestionIndex}
							questionsLength={questions.length}
							selectedCategory={selectedCategory}
							selectedOption={selectedOption}
							showExplanation={showExplanation}
							timerEnabled={timerEnabled}
							timeRemaining={timeRemaining}
							isPaused={isPaused}
							progress={progress}
							onSelectOption={handleSelectOption}
							onSubmitAnswer={handleSubmitAnswer}
							onNextQuestion={handleNextQuestion}
							onGoToSelection={goToSelection}
							onTogglePause={() => setIsPaused(!isPaused)}
						/>
					)}
				</TabsContent>

				<TabsContent value="results" className="space-y-8">
					{currentResult && (
						<ResultsTab
							currentResult={currentResult}
							radarData={radarData}
							improvementPlans={improvementPlans}
							onGoToSelection={goToSelection}
							onRetakeQuiz={retakeQuiz}
						/>
					)}
				</TabsContent>

				<TabsContent value="history" className="space-y-8">
					<HistoryTab quizResults={quizResults} historyRadarData={historyRadarData} onSetActiveTab={setActiveTab} />
				</TabsContent>

				<TabsContent value="badges" className="space-y-8">
					<BadgesTab allEarnedBadges={allEarnedBadges} />
				</TabsContent>
			</Tabs>
		</>
	);
}
