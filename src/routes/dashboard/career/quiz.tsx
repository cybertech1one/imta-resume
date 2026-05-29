import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import type { Icon } from "@phosphor-icons/react";
import {
	ArrowRightIcon,
	BuildingsIcon,
	CaretLeftIcon,
	CheckCircleIcon,
	ClockIcon,
	CompassIcon,
	FirstAidKitIcon,
	GearIcon,
	GraduationCapIcon,
	HandshakeIcon,
	HardHatIcon,
	HeartIcon,
	LightbulbIcon,
	MedalIcon,
	RocketLaunchIcon,
	ShieldCheckIcon,
	SparkleIcon,
	StarIcon,
	TargetIcon,
	TrendUpIcon,
	TrophyIcon,
	UserIcon,
	UsersIcon,
	WrenchIcon,
} from "@phosphor-icons/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ErrorComponent } from "@/components/error-component";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { authClient } from "@/integrations/auth/client";
import { orpc } from "@/integrations/orpc/client";
import { cn } from "@/utils/style";
import { DashboardHeader } from "../-components/header";

// ============================================================================
// Icon Mapping (for database-driven questions)
// ============================================================================

const iconNameToComponent: Record<string, Icon> = {
	SparkleIcon,
	RocketLaunchIcon,
	UsersIcon,
	LightbulbIcon,
	HeartIcon,
	TargetIcon,
	WrenchIcon,
	MedalIcon,
	FirstAidKitIcon,
	GearIcon,
	ShieldCheckIcon,
	BuildingsIcon,
	HardHatIcon,
	UserIcon,
	HandshakeIcon,
	CompassIcon,
	TrendUpIcon,
	StarIcon,
	CheckCircleIcon,
	GraduationCapIcon,
	ArrowRightIcon,
	CaretLeftIcon,
	ClockIcon,
	TrophyIcon,
};

// Helper to get icon component from string name
function getIconFromName(iconName: string | null | undefined): Icon {
	if (!iconName) return CompassIcon;
	const normalizedName = iconName.endsWith("Icon") ? iconName : `${iconName}Icon`;
	return iconNameToComponent[normalizedName] || CompassIcon;
}

// Lazy load the career quiz component
const CareerQuizLazy = lazy(() => Promise.resolve({ default: CareerQuiz }));

// biome-ignore lint/suspicious/noExplicitAny: Route path not in generated route tree
export const Route = createFileRoute("/dashboard/career/quiz" as any)({
	component: () => (
		<Suspense
			fallback={
				<div className="flex items-center justify-center p-8">
					<Trans>Loading career quiz...</Trans>
				</div>
			}
		>
			<CareerQuizLazy />
		</Suspense>
	),
	errorComponent: ErrorComponent,
});

// Types
interface QuizQuestion {
	id: string;
	question: string;
	category: "environment" | "interests" | "stress" | "work_style" | "goals";
	trait: "teamwork" | "technical_aptitude" | "patient_care" | "safety_focus" | "leadership";
	options: {
		id: string;
		text: string;
		icon: Icon;
		scores: Record<string, number>;
	}[];
}

interface QuizAnswer {
	questionId: string;
	optionId: string;
}

interface CareerMatch {
	programId: string;
	name: string;
	nameFr: string;
	matchPercentage: number;
	field: string;
	reasons: string[];
	duration: string;
	salary: string;
	employmentRate?: number;
	icon?: Icon; // For UI display only
}

interface PersonalityProfile {
	teamwork: number;
	technical_aptitude: number;
	patient_care: number;
	safety_focus: number;
	leadership: number;
	analytical: number;
	communication: number;
	stress_tolerance: number;
	physical_endurance: number;
	attention_to_detail: number;
}

// Quiz questions are now loaded from the database via orpc.careerQuizQuestions.listWithOptions
// The hardcoded QUIZ_QUESTIONS array has been removed.

// Field icon mapping
const fieldIcons: Record<string, Icon> = {
	healthcare: FirstAidKitIcon,
	industrial: GearIcon,
	hse: HardHatIcon,
	general: CompassIcon,
};

// Field color mapping
const fieldColors: Record<string, string> = {
	healthcare: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
	industrial: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
	hse: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
	general: "bg-gray-100 text-gray-700 dark:bg-gray-800/30 dark:text-gray-400",
};

// Helper functions
function calculatePersonalityProfile(answers: QuizAnswer[], questions: QuizQuestion[]): PersonalityProfile {
	const profile: PersonalityProfile = {
		teamwork: 0,
		technical_aptitude: 0,
		patient_care: 0,
		safety_focus: 0,
		leadership: 0,
		analytical: 0,
		communication: 0,
		stress_tolerance: 0,
		physical_endurance: 0,
		attention_to_detail: 0,
	};

	for (const answer of answers) {
		const question = questions.find((q) => q.id === answer.questionId);
		if (!question) continue;

		const option = question.options.find((o) => o.id === answer.optionId);
		if (!option) continue;

		for (const [trait, score] of Object.entries(option.scores)) {
			if (trait in profile) {
				profile[trait as keyof PersonalityProfile] += score;
			}
		}
	}

	// Normalize to 0-100
	const maxPossible = questions.length * 3;
	for (const key of Object.keys(profile) as (keyof PersonalityProfile)[]) {
		profile[key] = Math.round((profile[key] / maxPossible) * 100);
	}

	return profile;
}

interface ProgramData {
	id: string;
	name: string;
	nameFr: string;
	field: string;
	durationFr?: string;
	avgSalary?: string | number | null;
	employmentRate?: number | null;
	descriptionFr?: string;
}

function calculateCareerMatches(profile: PersonalityProfile, programsList: ProgramData[]): CareerMatch[] {
	const matches: CareerMatch[] = [];

	for (const program of programsList) {
		if (program.id === "other") continue;

		let score = 0;
		const reasons: string[] = [];

		// Calculate match based on field and traits
		if (program.field === "healthcare") {
			score += profile.patient_care * 0.4;
			score += profile.teamwork * 0.3;
			score += profile.safety_focus * 0.2;
			score += profile.leadership * 0.1;
			if (profile.patient_care > 60) reasons.push(t`Strong interest in patient care`);
			if (profile.teamwork > 50) reasons.push(t`Good team spirit`);
		} else if (program.field === "industrial") {
			score += profile.technical_aptitude * 0.4;
			score += profile.safety_focus * 0.25;
			score += profile.leadership * 0.2;
			score += profile.teamwork * 0.15;
			if (profile.technical_aptitude > 60) reasons.push(t`Strong technical aptitude`);
			if (profile.safety_focus > 50) reasons.push(t`Sense of safety`);
		} else if (program.field === "hse") {
			score += profile.safety_focus * 0.35;
			score += profile.leadership * 0.3;
			score += profile.technical_aptitude * 0.2;
			score += profile.teamwork * 0.15;
			if (profile.safety_focus > 60) reasons.push(t`Excellent sense of prevention`);
			if (profile.leadership > 50) reasons.push(t`Leadership capabilities`);
		}

		const FieldIcon = fieldIcons[program.field] || CompassIcon;

		matches.push({
			programId: program.id,
			name: program.name,
			nameFr: program.nameFr,
			matchPercentage: Math.min(100, Math.round(score)),
			field: program.field,
			reasons: reasons.slice(0, 3),
			duration: program.durationFr ?? "",
			salary: String(program.avgSalary ?? "Not specified"),
			employmentRate: program.employmentRate ?? undefined,
			icon: FieldIcon,
		});
	}

	return matches.sort((a, b) => b.matchPercentage - a.matchPercentage);
}

function CareerQuiz() {
	const { data: session } = authClient.useSession();
	const queryClient = useQueryClient();
	const [currentQuestion, setCurrentQuestion] = useState(0);
	const [answers, setAnswers] = useState<QuizAnswer[]>([]);
	const [quizCompleted, setQuizCompleted] = useState(false);
	const [personalityProfile, setPersonalityProfile] = useState<PersonalityProfile | null>(null);
	const [careerMatches, setCareerMatches] = useState<CareerMatch[]>([]);
	const [isAnimating, setIsAnimating] = useState(false);
	const [quizMode, setQuizMode] = useState<"standard" | "ai">("standard");
	const [aiQuestions, setAiQuestions] = useState<QuizQuestion[]>([]);
	const [aiError, setAiError] = useState<string | null>(null);
	const aiGenerated = useRef(false);

	// AI quiz generation mutation
	const generateAiQuizMutation = useMutation({
		mutationFn: async (params: {
			field: string;
			experienceYears: number;
			skills: string[];
			language: "fr" | "en" | "ar";
			quizType: "career_orientation" | "field_discovery" | "self_assessment" | "technical_aptitude";
			numberOfQuestions: number;
		}) => {
			const res = await fetch("/api/rpc/careerQuizAdaptive/generate", {
				method: "POST",
				headers: { "Content-Type": "application/json", Origin: window.location.origin },
				body: JSON.stringify({ json: params }),
			});
			if (!res.ok) throw new Error(`AI quiz generation failed: ${res.status}`);
			const data = await res.json();
			return data.json ?? data;
		},
		onSuccess: (data) => {
			const questions: QuizQuestion[] = (data.questions || []).map(
				(q: {
					id: string;
					question: string;
					questionFr: string;
					category: string;
					options: { id: string; text: string; textFr: string; scores: Record<string, number> }[];
				}) => ({
					id: q.id,
					question: q.questionFr || q.question,
					category: (q.category || "interests") as QuizQuestion["category"],
					trait: "technical_aptitude" as QuizQuestion["trait"],
					options: q.options.map((opt) => ({
						id: opt.id,
						text: opt.textFr || opt.text,
						icon: SparkleIcon,
						scores: opt.scores || {},
					})),
				}),
			);
			setAiQuestions(questions);
			setAiError(null);
			aiGenerated.current = true;
		},
		onError: (error) => {
			setAiError(error instanceof Error ? error.message : t`Failed to generate AI quiz`);
		},
	});

	// Fetch quiz questions from database
	const { data: dbQuestions, isFetched: questionsFetched } = useQuery({
		...orpc.careerQuizQuestions.listWithOptions.queryOptions({
			input: { quizType: "career_quiz", activeOnly: true },
		}),
		enabled: !!session?.user,
	});

	// Transform database questions to match QuizQuestion interface
	const dbQuizQuestions = useMemo((): QuizQuestion[] => {
		if (!dbQuestions || dbQuestions.length === 0) return [];

		return dbQuestions.map((q) => ({
			id: q.id,
			question: q.question,
			category: q.category as QuizQuestion["category"],
			trait: (q.trait ?? "technical_aptitude") as QuizQuestion["trait"],
			options: (q.options ?? []).map((opt) => ({
				id: opt.id,
				text: opt.text,
				icon: getIconFromName(opt.icon),
				scores: (opt.scores as Record<string, number>) || {},
			})),
		}));
	}, [dbQuestions]);

	const quizQuestions = quizMode === "ai" && aiQuestions.length > 0 ? aiQuestions : dbQuizQuestions;

	// Dynamic total questions
	const totalQuestions = quizQuestions.length;

	// Fetch IMTA programs from database
	const { data: dbPrograms } = useQuery({
		...orpc.imtaPrograms.list.queryOptions({ input: { activeOnly: true } }),
		enabled: !!session?.user,
	});
	const programs = useMemo(() => dbPrograms || [], [dbPrograms]);

	// Fetch current assessment from database
	const { data: savedAssessment } = useQuery({
		...orpc.career.assessment.get.queryOptions(),
		enabled: !!session?.user,
	});

	// Load saved assessment when data is available
	useEffect(() => {
		if (savedAssessment) {
			const assessmentAnswers = savedAssessment.answers.map((a) => ({
				questionId: a.questionId,
				optionId: a.optionId || "",
			}));

			setAnswers(assessmentAnswers);

			if (savedAssessment.status === "completed" && savedAssessment.personalityProfile) {
				setQuizCompleted(true);
				setPersonalityProfile(savedAssessment.personalityProfile);
				if (savedAssessment.careerMatches) {
					setCareerMatches(savedAssessment.careerMatches);
				}
			} else {
				setCurrentQuestion(savedAssessment.currentQuestion || 0);
			}
		}
	}, [savedAssessment]);

	// Save progress mutation
	const saveProgressMutation = useMutation({
		...orpc.career.assessment.saveProgress.mutationOptions(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: orpc.career.assessment.get.key() });
		},
	});

	// Complete assessment mutation
	const completeAssessmentMutation = useMutation({
		...orpc.career.assessment.complete.mutationOptions(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: orpc.career.assessment.get.key() });
		},
	});

	// Handle answer selection
	const handleAnswer = useCallback(
		(optionId: string) => {
			if (isAnimating) return;

			const questionId = quizQuestions[currentQuestion].id;
			const newAnswers = [...answers.filter((a) => a.questionId !== questionId), { questionId, optionId }];
			setAnswers(newAnswers);

			setIsAnimating(true);

			setTimeout(() => {
				if (currentQuestion < totalQuestions - 1) {
					// Save progress to database
					setCurrentQuestion((prev) => prev + 1);
					saveProgressMutation.mutate({
						currentQuestion: currentQuestion + 1,
						answers: newAnswers,
					});
				} else {
					// Quiz completed - calculate results and save
					const profile = calculatePersonalityProfile(newAnswers, quizQuestions);
					setPersonalityProfile(profile);
					const matches = calculateCareerMatches(profile, programs);
					setCareerMatches(matches);
					setQuizCompleted(true);

					// Save completed assessment to database
					completeAssessmentMutation.mutate({
						answers: newAnswers,
						personalityProfile: profile,
						careerMatches: matches,
					});
				}
				setIsAnimating(false);
			}, 300);
		},
		[
			currentQuestion,
			answers,
			isAnimating,
			saveProgressMutation,
			completeAssessmentMutation,
			quizQuestions,
			totalQuestions,
			programs,
		],
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

	// Reset assessment mutation
	const resetAssessmentMutation = useMutation({
		...orpc.career.assessment.reset.mutationOptions(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: orpc.career.assessment.get.key() });
			// Clear local state
			setAnswers([]);
			setCurrentQuestion(0);
			setQuizCompleted(false);
			setPersonalityProfile(null);
			setCareerMatches([]);
		},
	});

	// Reset quiz
	const resetQuiz = useCallback(() => {
		resetAssessmentMutation.mutate({});
	}, [resetAssessmentMutation]);

	// Personality radar chart data
	const radarData = useMemo(() => {
		if (!personalityProfile) return null;

		const traits = [
			{ key: "teamwork", label: t`Teamwork`, value: personalityProfile.teamwork },
			{ key: "technical_aptitude", label: t`Technical Aptitude`, value: personalityProfile.technical_aptitude },
			{ key: "patient_care", label: t`Patient Care`, value: personalityProfile.patient_care },
			{ key: "safety_focus", label: t`Safety Focus`, value: personalityProfile.safety_focus },
			{ key: "leadership", label: t`Leadership`, value: personalityProfile.leadership },
		];

		return traits;
	}, [personalityProfile]);

	// Top 3 recommended programs
	const topPrograms = useMemo(() => careerMatches.slice(0, 3), [careerMatches]);

	const currentQ = quizQuestions[currentQuestion];
	const currentAnswer = answers.find((a) => a.questionId === currentQ?.id);
	const progress = totalQuestions > 0 ? ((currentQuestion + 1) / totalQuestions) * 100 : 0;

	// Show loading state while quiz questions are being fetched from the database
	if (!quizCompleted && !quizQuestions.length && !questionsFetched) {
		return (
			<>
				<DashboardHeader icon={TargetIcon} title={t`Personality Quiz`} />
				<div className="flex flex-col items-center justify-center gap-4 p-12">
					<SparkleIcon className="size-10 animate-pulse text-primary" weight="duotone" />
					<p className="font-medium text-lg text-muted-foreground">
						<Trans>Loading questions...</Trans>
					</p>
				</div>
			</>
		);
	}

	// Show empty state when no quiz questions exist in the database
	if (!quizCompleted && !quizQuestions.length && questionsFetched && !generateAiQuizMutation.isPending) {
		return (
			<>
				<DashboardHeader icon={TargetIcon} title={t`Personality Quiz`} />
				<div className="flex flex-col items-center justify-center gap-6 rounded-lg border bg-card p-12">
					<TargetIcon className="size-12 text-muted-foreground" weight="duotone" />
					<h3 className="font-semibold text-xl">
						<Trans>Quiz not available yet</Trans>
					</h3>
					<p className="max-w-md text-center text-muted-foreground">
						<Trans>
							Standard quiz questions haven't been configured yet. Try the AI-powered quiz for personalized questions
							based on your profile!
						</Trans>
					</p>
					<div className="flex gap-3">
						<Button
							onClick={() => {
								setQuizMode("ai");
								generateAiQuizMutation.mutate({
									field: "général",
									experienceYears: 0,
									skills: [],
									language: "fr",
									quizType: "career_orientation",
									numberOfQuestions: 10,
								});
							}}
							className="gap-2"
						>
							<SparkleIcon className="size-5" />
							<Trans>Generate AI Quiz</Trans>
						</Button>
						<Link to="/dashboard/career">
							<Button variant="outline" className="gap-2">
								<CaretLeftIcon className="size-4" />
								<Trans>Back to Career</Trans>
							</Button>
						</Link>
					</div>
				</div>
			</>
		);
	}

	if (!quizCompleted && !currentQ && generateAiQuizMutation.isPending) {
		return (
			<>
				<DashboardHeader icon={TargetIcon} title={t`Personality Quiz`} />
				<div className="flex flex-col items-center justify-center gap-4 p-12">
					<SparkleIcon className="size-10 animate-pulse text-primary" weight="duotone" />
					<p className="font-medium text-lg text-muted-foreground">
						<Trans>AI is generating personalized questions based on your profile...</Trans>
					</p>
				</div>
			</>
		);
	}

	if (!quizCompleted && !currentQ) {
		return null;
	}

	return (
		<>
			<DashboardHeader icon={TargetIcon} title={t`Personality Quiz`} />

			{/* Hero Section */}
			<motion.div
				className="relative mb-8 overflow-hidden rounded-3xl border border-primary/20 p-8"
				style={{
					background:
						"linear-gradient(135deg, oklch(0.7 0.15 280 / 0.15) 0%, oklch(0.6 0.2 200 / 0.1) 50%, oklch(0.65 0.18 150 / 0.08) 100%)",
				}}
				initial={false}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.6 }}
			>
				<div className="relative z-10">
					<div className="mb-3 flex items-center gap-2">
						<TargetIcon className="size-5 text-primary" weight="fill" />
						<span className="font-semibold text-primary text-sm uppercase tracking-wider">
							<Trans>IMTA Assessment</Trans>
						</span>
					</div>

					<h2 className="mb-4 font-bold text-2xl tracking-tight md:text-3xl">
						<Trans>Discover Your Career Profile</Trans>
					</h2>

					<p className="mb-4 max-w-2xl text-muted-foreground">
						<Trans>
							Answer questions to discover the programs that best match your personality and professional aspirations.
						</Trans>
					</p>

					{/* AI Mode Toggle */}
					{!quizCompleted && (
						<div className="mb-4 flex items-center gap-3">
							<Button
								size="sm"
								variant={quizMode === "standard" ? "default" : "outline"}
								onClick={() => {
									setQuizMode("standard");
									setCurrentQuestion(0);
									setAnswers([]);
								}}
								className="gap-2"
							>
								<TargetIcon className="size-4" />
								<Trans>Standard Quiz</Trans>
							</Button>
							<Button
								size="sm"
								variant={quizMode === "ai" ? "default" : "outline"}
								disabled={generateAiQuizMutation.isPending}
								onClick={() => {
									setQuizMode("ai");
									setCurrentQuestion(0);
									setAnswers([]);
									if (!aiGenerated.current) {
										generateAiQuizMutation.mutate({
											field: "général",
											experienceYears: 0,
											skills: [],
											language: "fr",
											quizType: "career_orientation",
											numberOfQuestions: 10,
										});
									}
								}}
								className="gap-2"
							>
								<SparkleIcon className="size-4" />
								{generateAiQuizMutation.isPending ? <Trans>Generating...</Trans> : <Trans>AI Personalized</Trans>}
							</Button>
							{aiError && <span className="text-destructive text-sm">{aiError}</span>}
						</div>
					)}

					{/* Quick Stats */}
					<div className="flex flex-wrap items-center gap-6">
						<div className="flex items-center gap-2">
							<div className="flex size-10 items-center justify-center rounded-full bg-primary/10">
								<ClockIcon className="size-5 text-primary" weight="duotone" />
							</div>
							<div>
								<p className="font-bold text-xl">5 min</p>
								<p className="text-muted-foreground text-sm">
									<Trans>Quick quiz</Trans>
								</p>
							</div>
						</div>
						<div className="flex items-center gap-2">
							<div className="flex size-10 items-center justify-center rounded-full bg-amber-500/10">
								<TargetIcon className="size-5 text-amber-500" weight="duotone" />
							</div>
							<div>
								<p className="font-bold text-xl">11+</p>
								<p className="text-muted-foreground text-sm">
									<Trans>Programs</Trans>
								</p>
							</div>
						</div>
						<div className="flex items-center gap-2">
							<div className="flex size-10 items-center justify-center rounded-full bg-green-500/10">
								<TrophyIcon className="size-5 text-green-500" weight="duotone" />
							</div>
							<div>
								<p className="font-bold text-xl">94%</p>
								<p className="text-muted-foreground text-sm">
									<Trans>Accuracy</Trans>
								</p>
							</div>
						</div>
					</div>
				</div>
			</motion.div>

			{!quizCompleted ? (
				<>
					{/* Quiz Progress */}
					<div className="mb-6 space-y-4">
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-2">
								<Badge variant="outline" className="gap-1 text-sm">
									<SparkleIcon className="size-4" />
									<Trans>
										Question {currentQuestion + 1}/{totalQuestions}
									</Trans>
								</Badge>
							</div>
							<span className="font-medium text-muted-foreground text-sm">
								<Trans>{Math.round(progress)}% complete</Trans>
							</span>
						</div>
						<Progress value={progress} className="h-2" />
					</div>

					{/* Quiz Question */}
					<AnimatePresence mode="wait">
						<motion.div
							key={currentQ.id}
							initial={{ opacity: 0, x: 50 }}
							animate={{ opacity: 1, x: 0 }}
							exit={{ opacity: 0, x: -50 }}
							transition={{ duration: 0.3 }}
						>
							<Card className="border-2 border-primary/20 bg-gradient-to-br from-card to-primary/5">
								<CardHeader className="pb-4">
									<div className="mb-2 flex items-center gap-2">
										<Badge className={fieldColors[currentQ.category] || fieldColors.general}>
											{currentQ.category === "environment" && t`Environment`}
											{currentQ.category === "interests" && t`Interests`}
											{currentQ.category === "stress" && t`Stress Management`}
											{currentQ.category === "work_style" && t`Work Style`}
											{currentQ.category === "goals" && t`Goals`}
										</Badge>
									</div>
									<CardTitle className="text-2xl leading-relaxed">{currentQ.question}</CardTitle>
								</CardHeader>
								<CardContent className="space-y-3">
									{currentQ.options.map((option, index) => {
										const isSelected = currentAnswer?.optionId === option.id;
										const OptionIcon = option.icon;

										return (
											<motion.button
												key={option.id}
												type="button"
												initial={{ opacity: 0, y: 20 }}
												animate={{ opacity: 1, y: 0 }}
												transition={{ delay: index * 0.1 }}
												onClick={() => handleAnswer(option.id)}
												disabled={isAnimating}
												className={cn(
													"flex w-full items-center gap-4 rounded-xl border-2 p-4 text-left transition-all duration-200",
													isSelected
														? "border-primary bg-primary/10 shadow-lg shadow-primary/20"
														: "border-border bg-card hover:border-primary/50 hover:bg-primary/5",
													isAnimating && "pointer-events-none opacity-50",
												)}
											>
												<div
													className={cn(
														"flex size-12 shrink-0 items-center justify-center rounded-xl transition-colors",
														isSelected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
													)}
												>
													<OptionIcon className="size-6" weight={isSelected ? "fill" : "regular"} />
												</div>
												<span className="font-medium text-lg">{option.text}</span>
												{isSelected && <CheckCircleIcon className="ml-auto size-6 text-primary" weight="fill" />}
											</motion.button>
										);
									})}
								</CardContent>
								<CardFooter className="flex justify-between pt-4">
									<Button
										variant="outline"
										onClick={goToPrevious}
										disabled={currentQuestion === 0 || isAnimating}
										className="gap-2"
									>
										<CaretLeftIcon className="size-4" />
										<Trans>Previous</Trans>
									</Button>
									<Button variant="ghost" onClick={resetQuiz} className="text-muted-foreground">
										<Trans>Start over</Trans>
									</Button>
								</CardFooter>
							</Card>
						</motion.div>
					</AnimatePresence>
				</>
			) : (
				/* Results Section */
				<motion.div initial={false} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="space-y-8">
					{/* Congratulations Banner */}
					<Card className="border-2 border-green-500/30 bg-gradient-to-br from-green-500/10 to-emerald-500/5">
						<CardContent className="flex flex-col items-center py-8 text-center md:flex-row md:py-6 md:text-left">
							<div className="mb-4 flex size-20 items-center justify-center rounded-full bg-green-500/20 md:mr-6 md:mb-0">
								<TrophyIcon className="size-10 text-green-500" weight="fill" />
							</div>
							<div className="flex-1">
								<h3 className="mb-2 font-bold text-2xl text-green-700 dark:text-green-400">
									<Trans>Assessment Complete!</Trans>
								</h3>
								<p className="text-muted-foreground">
									<Trans>Discover your personalized results and the programs that best match your profile.</Trans>
								</p>
							</div>
							<Button onClick={resetQuiz} variant="outline" className="mt-4 md:mt-0">
								<Trans>Retake the test</Trans>
							</Button>
						</CardContent>
					</Card>

					{/* Personality Profile */}
					<div className="grid gap-8 lg:grid-cols-2">
						<Card className="overflow-hidden">
							<CardHeader className="border-b bg-gradient-to-r from-primary/5 to-transparent">
								<CardTitle className="flex items-center gap-2 text-xl">
									<UserIcon className="size-5 text-primary" weight="duotone" />
									<Trans>Your Personality Profile</Trans>
								</CardTitle>
								<CardDescription>
									<Trans>Based on your answers, here are your dominant traits</Trans>
								</CardDescription>
							</CardHeader>
							<CardContent className="p-6">
								{/* Trait Bars */}
								<div className="space-y-4">
									{radarData?.map((trait, index) => (
										<motion.div
											key={trait.key}
											initial={false}
											animate={{ opacity: 1, x: 0 }}
											transition={{ delay: 0.1 * index }}
											className="space-y-1"
										>
											<div className="flex items-center justify-between text-sm">
												<span className="font-medium">{trait.label}</span>
												<span className="text-muted-foreground">{trait.value}%</span>
											</div>
											<div className="h-2 overflow-hidden rounded-full bg-primary/10">
												<motion.div
													initial={{ width: 0 }}
													animate={{ width: `${trait.value}%` }}
													transition={{ duration: 0.8, delay: 0.2 + index * 0.1 }}
													className="h-full rounded-full bg-gradient-to-r from-primary to-primary/70"
												/>
											</div>
										</motion.div>
									))}
								</div>
							</CardContent>
						</Card>

						{/* Top 3 Recommendations */}
						<Card className="overflow-hidden">
							<CardHeader className="border-b bg-gradient-to-r from-amber-500/10 to-transparent">
								<CardTitle className="flex items-center gap-2 text-xl">
									<StarIcon className="size-5 text-amber-500" weight="fill" />
									<Trans>Top 3 Recommended Programs</Trans>
								</CardTitle>
								<CardDescription>
									<Trans>The IMTA programs that best match your profile</Trans>
								</CardDescription>
							</CardHeader>
							<CardContent className="p-6">
								<div className="space-y-4">
									{topPrograms.map((match, index) => {
										const MatchIcon = match.icon || fieldIcons[match.field] || CompassIcon;
										const program = programs.find((p) => p.id === match.programId);

										return (
											<motion.div
												key={match.programId}
												initial={false}
												animate={{ opacity: 1, y: 0 }}
												transition={{ delay: 0.2 + index * 0.15 }}
												className={cn(
													"relative overflow-hidden rounded-xl border-2 p-4 transition-all hover:shadow-lg",
													index === 0
														? "border-amber-500/50 bg-gradient-to-r from-amber-500/10 to-transparent"
														: "border-border",
												)}
											>
												{index === 0 && (
													<div className="absolute top-0 right-0">
														<Badge className="rounded-tl-none rounded-tr-lg rounded-br-none rounded-bl-lg bg-amber-500 text-white">
															<MedalIcon className="mr-1 size-3" weight="fill" />
															<Trans>Best Match</Trans>
														</Badge>
													</div>
												)}
												<div className="flex items-start gap-4">
													<div
														className={cn(
															"flex size-14 shrink-0 items-center justify-center rounded-xl",
															fieldColors[match.field],
														)}
													>
														<MatchIcon className="size-7" weight="duotone" />
													</div>
													<div className="flex-1">
														<div className="mb-1 flex items-center gap-2">
															<h4 className="font-bold text-lg">{match.name}</h4>
															<Badge
																variant={match.matchPercentage >= 80 ? "default" : "secondary"}
																className={cn(match.matchPercentage >= 80 && "bg-green-500")}
															>
																{match.matchPercentage}%
															</Badge>
														</div>
														<p className="mb-2 text-muted-foreground text-sm">
															{program?.description?.substring(0, 100)}...
														</p>
														{match.reasons.length > 0 && (
															<div className="flex flex-wrap gap-1">
																{match.reasons.map((reason, i) => (
																	<Badge key={i} variant="outline" className="text-xs">
																		<CheckCircleIcon className="mr-1 size-3 text-green-500" />
																		{reason}
																	</Badge>
																))}
															</div>
														)}
													</div>
												</div>
												<div className="mt-4 flex justify-end">
													<Link to="/dashboard/resources/programs/$programId" params={{ programId: match.programId }}>
														<Button size="sm" className="gap-2">
															<Trans>Discover this program</Trans>
															<ArrowRightIcon className="size-4" />
														</Button>
													</Link>
												</div>
											</motion.div>
										);
									})}
								</div>
							</CardContent>
						</Card>
					</div>

					{/* Quick Links */}
					<div className="flex flex-wrap justify-center gap-4">
						<Link to={"/dashboard/career" as string}>
							<Button variant="outline" className="gap-2">
								<CompassIcon className="size-5" />
								<Trans>View all career guidance</Trans>
							</Button>
						</Link>
						<Link to="/dashboard/resources">
							<Button className="gap-2">
								<GraduationCapIcon className="size-5" />
								<Trans>Explore Programs</Trans>
							</Button>
						</Link>
					</div>
				</motion.div>
			)}
		</>
	);
}
