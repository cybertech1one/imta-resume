import { t } from "@lingui/core/macro";
import { FirstAidKitIcon, GearIcon, HardHatIcon, TargetIcon } from "@phosphor-icons/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import z from "zod";
import { ErrorComponent } from "@/components/error-component";
import { authClient } from "@/integrations/auth/client";
import { client, orpc } from "@/integrations/orpc/client";
import { generateId } from "@/utils/string";

import {
	CompletedPhase,
	FallbackSpinner,
	InterviewPhase,
	MockAILoadingSkeleton,
	SetupPhase,
} from "./-components/mock-ai-components";
import {
	apiSessionToLocal,
	calculateScore,
	generateFeedbackFromTemplates,
	iconMap,
} from "./-components/mock-ai-config";
import type {
	Difficulty,
	DifficultyConfig,
	Field,
	FieldConfig,
	InterviewSession,
	InterviewTip,
	Message,
	MessageFeedback,
	SessionHistory,
} from "./-components/mock-ai-types";

// Search params schema
const searchSchema = z.object({
	field: z.enum(["healthcare", "industrial", "hse"]).optional(),
	difficulty: z.enum(["debutant", "intermediaire", "avance"]).optional(),
	program: z.string().optional(),
});

export const Route = createFileRoute("/dashboard/interview/mock-ai")({
	component: MockAIInterview,
	errorComponent: ErrorComponent,
	validateSearch: searchSchema,
});

// Main Component
function MockAIInterview() {
	const searchParams = Route.useSearch();
	const queryClient = useQueryClient();
	const { data: authSession } = authClient.useSession();

	// State
	const [phase, setPhase] = useState<"setup" | "interview" | "completed">("setup");
	const [selectedField, setSelectedField] = useState<Field>(searchParams.field || "healthcare");
	const [selectedProgram, setSelectedProgram] = useState<string>(searchParams.program || "");
	const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>(searchParams.difficulty || "debutant");
	const [session, setSession] = useState<InterviewSession | null>(null);
	const [userInput, setUserInput] = useState("");
	const [isTyping, setIsTyping] = useState(false);
	const [showTip, setShowTip] = useState(false);
	const [currentTip, setCurrentTip] = useState<InterviewTip | null>(null);

	const scrollRef = useRef<HTMLDivElement>(null);
	const inputRef = useRef<HTMLTextAreaElement>(null);

	// ========================================
	// DATA QUERIES
	// ========================================

	const { data: fieldConfigs, isLoading: isLoadingFieldConfigs } = useQuery({
		...orpc.mockAi.getFieldConfigs.queryOptions(),
		staleTime: 5 * 60 * 1000,
		enabled: !!authSession?.user,
	});

	const { data: allPrograms, isLoading: isLoadingPrograms } = useQuery({
		...orpc.mockAi.getAllPrograms.queryOptions(),
		staleTime: 5 * 60 * 1000,
		enabled: !!authSession?.user,
	});

	const { data: difficultyConfigs, isLoading: isLoadingDifficultyConfigs } = useQuery({
		...orpc.mockAi.getDifficultyConfigs.queryOptions(),
		staleTime: 5 * 60 * 1000,
		enabled: !!authSession?.user,
	});

	const { data: feedbackTemplates, isLoading: isLoadingFeedbackTemplates } = useQuery({
		...orpc.mockAi.getFeedbackTemplates.queryOptions(),
		staleTime: 5 * 60 * 1000,
		enabled: !!authSession?.user,
	});

	const { data: interviewTips, isLoading: isLoadingTips } = useQuery({
		...orpc.mockAi.getInterviewTips.queryOptions(),
		staleTime: 5 * 60 * 1000,
		enabled: !!authSession?.user,
	});

	const { data: currentSessionData, isLoading: isLoadingCurrentSession } = useQuery({
		...orpc.mockAi.getCurrentSession.queryOptions(),
		staleTime: 5 * 60 * 1000,
		enabled: !!authSession?.user,
	});

	const { data: historyData, isLoading: isLoadingHistory } = useQuery({
		...orpc.mockAi.getHistory.queryOptions({ limit: 20 }),
		staleTime: 5 * 60 * 1000,
		enabled: !!authSession?.user,
	});

	const { data: statsData } = useQuery({
		...orpc.mockAi.getStatistics.queryOptions(),
		staleTime: 5 * 60 * 1000,
		enabled: !!authSession?.user,
	});

	// ========================================
	// MUTATIONS
	// ========================================

	const createSessionMutation = useMutation({
		mutationFn: async (data: {
			field: Field;
			program: string;
			difficulty: Difficulty;
			totalQuestions: number;
			initialMessage: {
				id: string;
				role: "user" | "assistant";
				content: string;
				timestamp: string;
			};
		}) => {
			return await client.mockAi.createSession(data);
		},
		onSuccess: (data) => {
			setSession(apiSessionToLocal(data));
			setPhase("interview");
			queryClient.invalidateQueries({ queryKey: orpc.mockAi.getCurrentSession.key() });
		},
		onError: (error) => {
			toast.error(t`Error creating session`);
			console.error(error);
		},
	});

	const updateSessionMutation = useMutation({
		mutationFn: async (data: {
			sessionId: string;
			messages?: Array<{
				id: string;
				role: "user" | "assistant";
				content: string;
				timestamp: string;
				feedback?: MessageFeedback;
			}>;
			currentQuestionIndex?: number;
			scores?: number[];
			overallScore?: number;
			completedAt?: string;
		}) => {
			return await client.mockAi.updateSession(data);
		},
		onError: (error) => {
			toast.error(t`Error saving`);
			console.error(error);
		},
	});

	const deleteSessionMutation = useMutation({
		mutationFn: async (sessionId: string) => {
			return await client.mockAi.deleteSession({ sessionId });
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: orpc.mockAi.getCurrentSession.key() });
			queryClient.invalidateQueries({ queryKey: orpc.mockAi.getHistory.key() });
		},
	});

	// ========================================
	// DERIVED DATA
	// ========================================

	const fieldConfigMap = useMemo(() => {
		const map: Record<Field, FieldConfig> = {
			healthcare: {
				label: t`Healthcare / Nursing`,
				icon: FirstAidKitIcon,
				color: "text-red-600",
				bgColor: "bg-red-100 dark:bg-red-900/30",
			},
			industrial: {
				label: t`Industrial Maintenance`,
				icon: GearIcon,
				color: "text-blue-600",
				bgColor: "bg-blue-100 dark:bg-blue-900/30",
			},
			hse: {
				label: t`HSE / Safety`,
				icon: HardHatIcon,
				color: "text-amber-600",
				bgColor: "bg-amber-100 dark:bg-amber-900/30",
			},
		};

		if (fieldConfigs) {
			for (const config of fieldConfigs) {
				map[config.field] = {
					label: config.label,
					icon: iconMap[config.icon] || TargetIcon,
					color: config.color,
					bgColor: config.bgColor,
				};
			}
		}

		return map;
	}, [fieldConfigs]);

	const difficultyConfigMap = useMemo(() => {
		const map: Record<Difficulty, DifficultyConfig> = {
			debutant: { label: t`Beginner`, color: "text-green-600", questionsCount: 5 },
			intermediaire: { label: t`Intermediate`, color: "text-yellow-600", questionsCount: 7 },
			avance: { label: t`Advanced`, color: "text-red-600", questionsCount: 10 },
		};

		if (difficultyConfigs) {
			for (const config of difficultyConfigs) {
				map[config.difficulty] = {
					label: config.label,
					color: config.color,
					questionsCount: config.questionsCount,
				};
			}
		}

		return map;
	}, [difficultyConfigs]);

	const availablePrograms = useMemo(() => {
		if (!allPrograms) return [];
		return allPrograms[selectedField] || [];
	}, [allPrograms, selectedField]);

	const currentProgramName = useMemo(() => {
		const program = availablePrograms.find((p) => p.id === selectedProgram);
		return program?.name || "";
	}, [availablePrograms, selectedProgram]);

	const history: SessionHistory[] = useMemo(() => {
		if (!historyData) return [];
		return historyData.map((h) => ({
			...h,
			completedAt: new Date(h.completedAt),
		}));
	}, [historyData]);

	const progressPercent = useMemo(() => {
		if (!session) return 0;
		return Math.round((session.currentQuestionIndex / session.totalQuestions) * 100);
	}, [session]);

	const averageHistoryScore = useMemo(() => {
		return statsData?.averageScore ?? 0;
	}, [statsData]);

	// ========================================
	// EFFECTS
	// ========================================

	useEffect(() => {
		if (availablePrograms.length > 0) {
			const isValidProgram = availablePrograms.some((p) => p.id === selectedProgram);
			if (!isValidProgram) {
				setSelectedProgram(availablePrograms[0].id);
			}
		}
	}, [availablePrograms, selectedProgram]);

	useEffect(() => {
		if (currentSessionData && !currentSessionData.completedAt) {
			setSession(apiSessionToLocal(currentSessionData));
			setPhase("interview");
		}
	}, [currentSessionData]);

	const messagesLength = session?.messages.length ?? 0;
	// biome-ignore lint/correctness/useExhaustiveDependencies: Need to scroll when messages change
	useEffect(() => {
		if (scrollRef.current) {
			const viewport = scrollRef.current.querySelector("[data-slot='scroll-area-viewport']");
			if (viewport) {
				viewport.scrollTop = viewport.scrollHeight;
			}
		}
	}, [messagesLength]);

	useEffect(() => {
		if (!isTyping && inputRef.current && phase === "interview") {
			inputRef.current.focus();
		}
	}, [isTyping, phase]);

	// ========================================
	// HANDLERS
	// ========================================

	const generateFeedback = useCallback(
		(score: number) => generateFeedbackFromTemplates(score, feedbackTemplates, interviewTips),
		[feedbackTemplates, interviewTips],
	);

	const startInterview = useCallback(async () => {
		try {
			const questions = await client.mockAi.getQuestions({
				field: selectedField,
				program: selectedProgram,
				difficulty: selectedDifficulty,
			});

			if (!questions || questions.length === 0) {
				toast.error(t`No questions available for this configuration`);
				return;
			}

			const questionsCount = Math.min(difficultyConfigMap[selectedDifficulty].questionsCount, questions.length);

			const firstQuestion = questions[0];
			const welcomeMessage = {
				id: generateId(),
				role: "assistant" as const,
				content: t`Hello and welcome to this interview for the ${currentProgramName} position. I am your virtual recruiter and I will ask you a few questions to get to know you better.\n\nLet's start with the first question:\n\n${firstQuestion}`,
				timestamp: new Date().toISOString(),
			};

			createSessionMutation.mutate({
				field: selectedField,
				program: selectedProgram,
				difficulty: selectedDifficulty,
				totalQuestions: questionsCount,
				initialMessage: welcomeMessage,
			});

			setShowTip(false);
		} catch (error) {
			toast.error(t`Error loading questions`);
			console.error(error);
		}
	}, [
		selectedField,
		selectedProgram,
		selectedDifficulty,
		currentProgramName,
		difficultyConfigMap,
		createSessionMutation,
	]);

	const submitResponse = useCallback(async () => {
		if (!session || !userInput.trim() || isTyping) return;

		const userMessage: Message = {
			id: generateId(),
			role: "user",
			content: userInput.trim(),
			timestamp: new Date(),
		};

		const updatedMessages = [...session.messages, userMessage];
		setSession((prev) => (prev ? { ...prev, messages: updatedMessages } : null));
		setUserInput("");
		setIsTyping(true);

		setTimeout(async () => {
			const score = calculateScore(userInput);
			const feedback = generateFeedback(score);
			const newScores = [...session.scores, feedback.score];
			const nextQuestionIndex = session.currentQuestionIndex + 1;

			const messagesWithFeedback = updatedMessages.map((m) => (m.id === userMessage.id ? { ...m, feedback } : m));

			if (nextQuestionIndex >= session.totalQuestions) {
				const overallScore = Math.round(newScores.reduce((a, b) => a + b, 0) / newScores.length);

				const finalMessage: Message = {
					id: generateId(),
					role: "assistant",
					content: t`Thank you very much for your answers. The interview is now complete.\n\nYour overall score is ${overallScore}%.\n\n${
						overallScore >= 80
							? t`Excellent work! You are well prepared for a real interview.`
							: overallScore >= 60
								? t`Good work! Keep practicing to improve your answers.`
								: t`Keep practicing. Practice makes perfect!`
					}`,
					timestamp: new Date(),
				};

				const completedSession: InterviewSession = {
					...session,
					messages: [...messagesWithFeedback, finalMessage],
					currentQuestionIndex: nextQuestionIndex,
					scores: newScores,
					overallScore,
					completedAt: new Date(),
				};

				setSession(completedSession);

				updateSessionMutation.mutate({
					sessionId: session.id,
					messages: completedSession.messages.map((m) => ({
						...m,
						timestamp: m.timestamp.toISOString(),
					})),
					currentQuestionIndex: nextQuestionIndex,
					scores: newScores,
					overallScore,
					completedAt: new Date().toISOString(),
				});

				queryClient.invalidateQueries({ queryKey: orpc.mockAi.getHistory.key() });
				queryClient.invalidateQueries({ queryKey: orpc.mockAi.getStatistics.key() });

				setPhase("completed");
				setIsTyping(false);
			} else {
				try {
					const questions = await client.mockAi.getQuestions({
						field: session.field,
						program: session.program,
						difficulty: session.difficulty,
					});

					const nextQuestion = questions[nextQuestionIndex];

					if (interviewTips && interviewTips.length > 0) {
						setCurrentTip(interviewTips[Math.floor(Math.random() * interviewTips.length)]);
						setShowTip(true);
					}

					setTimeout(() => {
						setShowTip(false);

						const nextQuestionMessage: Message = {
							id: generateId(),
							role: "assistant",
							content: t`Very good. Let's move on to the next question:\n\n${nextQuestion}`,
							timestamp: new Date(),
						};

						const sessionWithNextQuestion: InterviewSession = {
							...session,
							messages: [...messagesWithFeedback, nextQuestionMessage],
							currentQuestionIndex: nextQuestionIndex,
							scores: newScores,
						};

						setSession(sessionWithNextQuestion);

						updateSessionMutation.mutate({
							sessionId: session.id,
							messages: sessionWithNextQuestion.messages.map((m) => ({
								...m,
								timestamp: m.timestamp.toISOString(),
							})),
							currentQuestionIndex: nextQuestionIndex,
							scores: newScores,
						});

						setIsTyping(false);
					}, 3000);
				} catch (error) {
					console.error("Error fetching next question:", error);
					setIsTyping(false);
				}
			}
		}, 1500);
	}, [session, userInput, isTyping, generateFeedback, interviewTips, updateSessionMutation, queryClient]);

	const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			submitResponse();
		}
	};

	const resetToSetup = useCallback(() => {
		if (session) {
			deleteSessionMutation.mutate(session.id);
		}
		setSession(null);
		setPhase("setup");
		setUserInput("");
		setShowTip(false);
	}, [session, deleteSessionMutation]);

	// ========================================
	// RENDER
	// ========================================

	const isLoading =
		isLoadingCurrentSession ||
		isLoadingHistory ||
		isLoadingFieldConfigs ||
		isLoadingPrograms ||
		isLoadingDifficultyConfigs ||
		isLoadingFeedbackTemplates ||
		isLoadingTips;

	if (isLoading) {
		return <MockAILoadingSkeleton />;
	}

	if (phase === "setup") {
		return (
			<SetupPhase
				selectedField={selectedField}
				setSelectedField={setSelectedField}
				selectedProgram={selectedProgram}
				setSelectedProgram={setSelectedProgram}
				selectedDifficulty={selectedDifficulty}
				setSelectedDifficulty={setSelectedDifficulty}
				fieldConfigMap={fieldConfigMap}
				difficultyConfigMap={difficultyConfigMap}
				availablePrograms={availablePrograms}
				interviewTips={interviewTips}
				history={history}
				allPrograms={allPrograms}
				statsData={statsData}
				averageHistoryScore={averageHistoryScore}
				startInterview={startInterview}
				createSessionMutation={createSessionMutation}
			/>
		);
	}

	if (phase === "interview" && session) {
		return (
			<InterviewPhase
				session={session}
				currentProgramName={currentProgramName}
				fieldConfigMap={fieldConfigMap}
				difficultyConfigMap={difficultyConfigMap}
				progressPercent={progressPercent}
				showTip={showTip}
				currentTip={currentTip}
				isTyping={isTyping}
				userInput={userInput}
				setUserInput={setUserInput}
				submitResponse={submitResponse}
				handleKeyPress={handleKeyPress}
				resetToSetup={resetToSetup}
				scrollRef={scrollRef}
				inputRef={inputRef}
			/>
		);
	}

	if (phase === "completed" && session) {
		return (
			<CompletedPhase
				session={session}
				currentProgramName={currentProgramName}
				fieldConfigMap={fieldConfigMap}
				difficultyConfigMap={difficultyConfigMap}
				resetToSetup={resetToSetup}
			/>
		);
	}

	return <FallbackSpinner />;
}
