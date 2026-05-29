import { t } from "@lingui/core/macro";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { ErrorComponent } from "@/components/error-component";
import { authClient } from "@/integrations/auth/client";
import { orpc } from "@/integrations/orpc/client";
import {
	CategoryTabs,
	CtaCard,
	ErrorState,
	FavoritesSection,
	FiltersSection,
	HeroSection,
	LoadingState,
	PracticeModeView,
	QuickLinksSection,
	StarMethodGuide,
} from "./-components/question-bank-components";
import { categoryConfig, INTERVIEW_QUESTIONS } from "./-components/question-bank-config";
import type { DifficultyLevel, Industry, QuestionCategory } from "./-components/question-bank-types";

// biome-ignore lint/suspicious/noExplicitAny: Route path not in generated route tree
export const Route = createFileRoute("/dashboard/interview/question-bank" as any)({
	loader: () => {
		throw redirect({
			to: "/dashboard/interview/questions" as string,
			search: { field: "general" },
			replace: true,
		});
	},
	component: QuestionBankPage,
	errorComponent: ErrorComponent,
});

function QuestionBankPage() {
	const queryClient = useQueryClient();
	const { data: session } = authClient.useSession();

	// State
	const [selectedCategory, setSelectedCategory] = useState<QuestionCategory | "all">("all");
	const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyLevel | "all">("all");
	const [selectedIndustry, setSelectedIndustry] = useState<Industry | "all">("all");
	const [searchQuery, setSearchQuery] = useState("");
	const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(new Set());
	const [showStarGuide, setShowStarGuide] = useState(false);

	// Practice mode state
	const [practiceMode, setPracticeMode] = useState(false);
	const [practiceQuestionIndex, setPracticeQuestionIndex] = useState(0);
	const [timerSeconds, setTimerSeconds] = useState(0);
	const [timerRunning, setTimerRunning] = useState(false);
	const [timerDuration, setTimerDuration] = useState(120); // 2 minutes default

	// Fetch favorites from database
	const {
		data: favoritesData,
		isLoading: favoritesLoading,
		error: favoritesError,
	} = useQuery({ ...orpc.interview.getQuestionBankFavorites.queryOptions(), enabled: !!session?.user });

	// Convert favorites array to Set for O(1) lookups
	const favorites = useMemo(() => new Set(favoritesData ?? []), [favoritesData]);

	// Add favorite mutation
	const addFavoriteMutation = useMutation({
		...orpc.interview.addQuestionBankFavorite.mutationOptions(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: orpc.interview.getQuestionBankFavorites.key() });
		},
	});

	// Remove favorite mutation
	const removeFavoriteMutation = useMutation({
		...orpc.interview.removeQuestionBankFavorite.mutationOptions(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: orpc.interview.getQuestionBankFavorites.key() });
		},
	});

	// Timer effect
	useEffect(() => {
		let interval: NodeJS.Timeout | null = null;
		if (timerRunning && timerSeconds < timerDuration) {
			interval = setInterval(() => {
				setTimerSeconds((prev) => {
					if (prev >= timerDuration - 1) {
						setTimerRunning(false);
						toast.info(t`Time's up!`);
						return timerDuration;
					}
					return prev + 1;
				});
			}, 1000);
		}
		return () => {
			if (interval) clearInterval(interval);
		};
	}, [timerRunning, timerSeconds, timerDuration]);

	// Toggle favorite
	const toggleFavorite = useCallback(
		(questionId: string) => {
			if (favorites.has(questionId)) {
				removeFavoriteMutation.mutate(
					{ questionId },
					{
						onSuccess: () => {
							toast.success(t`Removed from favorites`);
						},
						onError: () => {
							toast.error(t`Error removing favorite`);
						},
					},
				);
			} else {
				addFavoriteMutation.mutate(
					{ questionId },
					{
						onSuccess: () => {
							toast.success(t`Added to favorites`);
						},
						onError: () => {
							toast.error(t`Error adding to favorites`);
						},
					},
				);
			}
		},
		[favorites, addFavoriteMutation, removeFavoriteMutation],
	);

	// Toggle expand
	const toggleExpand = useCallback((questionId: string) => {
		setExpandedQuestions((prev) => {
			const newSet = new Set(prev);
			if (newSet.has(questionId)) {
				newSet.delete(questionId);
			} else {
				newSet.add(questionId);
			}
			return newSet;
		});
	}, []);

	// Filter questions
	const filteredQuestions = useMemo(() => {
		let filtered = INTERVIEW_QUESTIONS;

		// Filter by category
		if (selectedCategory !== "all") {
			filtered = filtered.filter((q) => q.category === selectedCategory);
		}

		// Filter by difficulty
		if (selectedDifficulty !== "all") {
			filtered = filtered.filter((q) => q.difficulty === selectedDifficulty);
		}

		// Filter by industry
		if (selectedIndustry !== "all") {
			filtered = filtered.filter((q) => q.industry === selectedIndustry || q.industry === "general");
		}

		// Filter by search query
		if (searchQuery.trim()) {
			const query = searchQuery.toLowerCase();
			filtered = filtered.filter(
				(q) =>
					q.question.toLowerCase().includes(query) ||
					q.sampleAnswer.toLowerCase().includes(query) ||
					q.keywords.some((k) => k.toLowerCase().includes(query)),
			);
		}

		return filtered;
	}, [selectedCategory, selectedDifficulty, selectedIndustry, searchQuery]);

	// Question counts per category
	const questionCounts = useMemo(() => {
		const counts: Record<string, number> = { all: INTERVIEW_QUESTIONS.length };
		for (const cat of Object.keys(categoryConfig)) {
			counts[cat] = INTERVIEW_QUESTIONS.filter((q) => q.category === cat).length;
		}
		return counts;
	}, []);

	// Favorite questions
	const favoriteQuestions = useMemo(() => {
		return INTERVIEW_QUESTIONS.filter((q) => favorites.has(q.id));
	}, [favorites]);

	// Practice mode functions
	const startPracticeMode = useCallback(() => {
		if (filteredQuestions.length === 0) {
			toast.error(t`No questions available for practice`);
			return;
		}
		setPracticeMode(true);
		setPracticeQuestionIndex(0);
		setTimerSeconds(0);
		setTimerRunning(false);
	}, [filteredQuestions.length]);

	const shuffleQuestions = useCallback(() => {
		const randomIndex = Math.floor(Math.random() * filteredQuestions.length);
		setPracticeQuestionIndex(randomIndex);
		setTimerSeconds(0);
		setTimerRunning(false);
	}, [filteredQuestions.length]);

	const nextPracticeQuestion = useCallback(() => {
		setPracticeQuestionIndex((prev) => (prev + 1) % filteredQuestions.length);
		setTimerSeconds(0);
		setTimerRunning(false);
	}, [filteredQuestions.length]);

	const previousPracticeQuestion = useCallback(() => {
		setPracticeQuestionIndex((prev) => (prev - 1 + filteredQuestions.length) % filteredQuestions.length);
		setTimerSeconds(0);
		setTimerRunning(false);
	}, [filteredQuestions.length]);

	const toggleTimer = useCallback(() => {
		setTimerRunning((prev) => !prev);
	}, []);

	const resetTimer = useCallback(() => {
		setTimerSeconds(0);
		setTimerRunning(false);
	}, []);

	const exitPracticeMode = useCallback(() => {
		setPracticeMode(false);
		setTimerRunning(false);
		setTimerSeconds(0);
	}, []);

	const handlePracticeQuestion = useCallback(
		(questionId: string) => {
			const index = filteredQuestions.findIndex((q) => q.id === questionId);
			if (index !== -1) {
				setPracticeMode(true);
				setPracticeQuestionIndex(index);
				setTimerSeconds(0);
				setTimerRunning(false);
			}
		},
		[filteredQuestions],
	);

	// Render practice mode
	if (practiceMode && filteredQuestions.length > 0) {
		return (
			<PracticeModeView
				currentQuestion={filteredQuestions[practiceQuestionIndex]}
				practiceQuestionIndex={practiceQuestionIndex}
				filteredQuestionsLength={filteredQuestions.length}
				timerSeconds={timerSeconds}
				timerDuration={timerDuration}
				timerRunning={timerRunning}
				expandedQuestions={expandedQuestions}
				favorites={favorites}
				exitPracticeMode={exitPracticeMode}
				resetTimer={resetTimer}
				toggleTimer={toggleTimer}
				setTimerDuration={setTimerDuration}
				toggleExpand={toggleExpand}
				toggleFavorite={toggleFavorite}
				previousPracticeQuestion={previousPracticeQuestion}
				shuffleQuestions={shuffleQuestions}
				nextPracticeQuestion={nextPracticeQuestion}
			/>
		);
	}

	// Loading state
	if (favoritesLoading) {
		return <LoadingState />;
	}

	// Error state
	if (favoritesError) {
		return (
			<ErrorState
				onRetry={() => queryClient.invalidateQueries({ queryKey: orpc.interview.getQuestionBankFavorites.key() })}
			/>
		);
	}

	return (
		<>
			<HeroSection
				filteredQuestionsLength={filteredQuestions.length}
				favoritesSize={favorites.size}
				showStarGuide={showStarGuide}
				setShowStarGuide={setShowStarGuide}
				startPracticeMode={startPracticeMode}
			/>

			<StarMethodGuide showStarGuide={showStarGuide} />

			<FiltersSection
				searchQuery={searchQuery}
				setSearchQuery={setSearchQuery}
				selectedCategory={selectedCategory}
				setSelectedCategory={setSelectedCategory}
				selectedDifficulty={selectedDifficulty}
				setSelectedDifficulty={setSelectedDifficulty}
				selectedIndustry={selectedIndustry}
				setSelectedIndustry={setSelectedIndustry}
			/>

			<CategoryTabs
				selectedCategory={selectedCategory}
				setSelectedCategory={setSelectedCategory}
				filteredQuestions={filteredQuestions}
				questionCounts={questionCounts}
				expandedQuestions={expandedQuestions}
				favorites={favorites}
				toggleExpand={toggleExpand}
				toggleFavorite={toggleFavorite}
				onPracticeQuestion={handlePracticeQuestion}
			/>

			<FavoritesSection
				favoriteQuestions={favoriteQuestions}
				favorites={favorites}
				toggleExpand={toggleExpand}
				toggleFavorite={toggleFavorite}
			/>

			<QuickLinksSection />

			<CtaCard startPracticeMode={startPracticeMode} />
		</>
	);
}
