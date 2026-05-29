import { t } from "@lingui/core/macro";
import { ChartLineUpIcon, ClockIcon, CompassIcon, PathIcon, SparkleIcon } from "@phosphor-icons/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createLazyFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { ErrorComponent } from "@/components/error-component";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { authClient } from "@/integrations/auth/client";
import { orpc } from "@/integrations/orpc/client";
import { DashboardHeader } from "../-components/header";
import {
	AiCareerToolsSection,
	AllMatchesCard,
	AssessmentSkeleton,
	CallToActionCard,
	CareerCoachDialog,
	CareerPathDialog,
	CareerTimelineCard,
	CongratulationsBanner,
	EmptyQuizState,
	ErrorState,
	GrowthProjectionsCard,
	HeroSection,
	MarketTrendsSection,
	PathwaySelector,
	PersonalityProfileCard,
	QuizProgressBar,
	QuizQuestionCard,
	SalaryComparisonCard,
	SkillGapDialog,
	TopEmployersCard,
	TopProgramsCard,
} from "./-components/career-index-components";
import {
	calculateCareerMatches,
	calculatePersonalityProfile,
	fieldIcons,
	getIconFromName,
	toExtendedProfile,
	toStorageMatch,
} from "./-components/career-index-config";
import type {
	CareerMatch,
	CareerStage,
	Employer,
	ExtendedPersonalityProfile,
	MarketInsight,
	PersonalityProfile,
	ProgramData,
	QuizAnswer,
	QuizQuestion,
} from "./-components/career-index-types";

// biome-ignore lint/suspicious/noExplicitAny: Route path not in generated route tree
export const Route = createLazyFileRoute("/dashboard/career/" as any)({
	component: CareerGuidance,
	errorComponent: ErrorComponent,
});

// No hardcoded market insights - data comes from database via orpc.marketInsights.list
// No hardcoded employers - data comes from database via orpc.employers.list
// No hardcoded career pathways - data comes from database via orpc.careerRole.list

function CareerGuidance() {
	const { data: session } = authClient.useSession();
	const queryClient = useQueryClient();
	const [activeTab, setActiveTab] = useState("assessment");
	const [currentQuestion, setCurrentQuestion] = useState(0);
	const [answers, setAnswers] = useState<QuizAnswer[]>([]);
	const [quizCompleted, setQuizCompleted] = useState(false);
	const [personalityProfile, setPersonalityProfile] = useState<PersonalityProfile | null>(null);
	const [careerMatches, setCareerMatches] = useState<CareerMatch[]>([]);
	const [selectedPathway, setSelectedPathway] = useState<"healthcare" | "industrial" | "hse">("healthcare");
	const [isAnimating, setIsAnimating] = useState(false);
	const [isInitialized, setIsInitialized] = useState(false);
	const [skillGapOpen, setSkillGapOpen] = useState(false);
	const [careerPathOpen, setCareerPathOpen] = useState(false);
	const [careerCoachOpen, setCareerCoachOpen] = useState(false);

	// Fetch existing assessment from database
	const {
		data: savedAssessment,
		isLoading,
		error,
		refetch,
	} = useQuery({ ...orpc.career.assessment.get.queryOptions(), staleTime: 5 * 60 * 1000, enabled: !!session?.user });

	// Fetch IMTA programs from database (reference data - cache for 1 hour)
	const { data: dbPrograms } = useQuery({
		...orpc.imtaPrograms.list.queryOptions({ input: { activeOnly: true } }),
		staleTime: 60 * 60 * 1000,
		enabled: !!session?.user,
	});

	// Fetch quiz questions from database (reference data - cache for 1 hour)
	const { data: dbQuestions, isLoading: isLoadingQuestions } = useQuery({
		...orpc.careerQuizQuestions.listWithOptions.queryOptions({
			input: { quizType: "career_quiz", activeOnly: true },
		}),
		staleTime: 60 * 60 * 1000,
		enabled: !!session?.user,
	});

	// Transform database questions to QuizQuestion interface
	const quizQuestions = useMemo((): QuizQuestion[] => {
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

	// Map programs to ProgramData interface for career matching
	const programs = useMemo((): ProgramData[] => {
		if (!dbPrograms || dbPrograms.length === 0) return [];
		return dbPrograms.map((p) => ({
			id: p.id,
			name: p.name,
			nameFr: p.nameFr,
			field: p.field,
			durationFr: p.durationFr,
			avgSalary: p.avgSalary,
			employmentRate: p.employmentRate,
			descriptionFr: p.descriptionFr,
			description: p.description,
		}));
	}, [dbPrograms]);

	// Fetch market insights from database
	const { data: dbMarketInsights } = useQuery({
		...orpc.marketInsights.list.queryOptions({ input: { activeOnly: true } }),
		enabled: !!session?.user,
	});

	// Fetch employers from database
	const { data: dbEmployers } = useQuery({
		...orpc.employers.list.queryOptions({ input: { activeOnly: true } }),
		enabled: !!session?.user,
	});

	// Map database insights to include icons (empty array if no data)
	const marketInsights = useMemo((): MarketInsight[] => {
		if (!dbMarketInsights || dbMarketInsights.length === 0) return [];
		return dbMarketInsights.map((insight) => ({
			id: insight.id,
			title: insight.titleFr,
			value: insight.value,
			trend: "up" as const,
			description: insight.description || insight.descriptionFr || "",
			icon: getIconFromName(insight.icon) || CompassIcon,
		}));
	}, [dbMarketInsights]);

	// Map database employers (empty array if no data)
	const topEmployers = useMemo((): Employer[] => {
		if (!dbEmployers || dbEmployers.length === 0) return [];
		return dbEmployers.map((emp) => ({
			id: emp.id,
			name: emp.name,
			sector: emp.sectorFr,
			location: emp.locationFr || emp.location,
			openPositions: emp.openPositions || 0,
		}));
	}, [dbEmployers]);

	// Fetch career roles for pathway visualization
	const { data: dbCareerRoles } = useQuery({
		...orpc.careerRole.list.queryOptions({
			input: { field: selectedPathway, activeOnly: true },
		}),
		enabled: !!session?.user,
	});

	// Transform career roles into pathway stages grouped by experience level
	const careerPathwayStages = useMemo((): CareerStage[] => {
		if (!dbCareerRoles || dbCareerRoles.length === 0) return [];

		const levelOrder: Record<string, number> = { entry: 0, junior: 1, mid: 2, senior: 3, leadership: 4 };
		const levelLabels: Record<string, { title: string; titleFr: string; years: string }> = {
			entry: { title: t`Entry Level`, titleFr: "Debutant", years: t`0-2 yrs` },
			junior: { title: t`Junior`, titleFr: "Junior", years: t`1-3 yrs` },
			mid: { title: t`Intermediate`, titleFr: "Confirme", years: t`2-5 yrs` },
			senior: { title: t`Senior`, titleFr: "Senior", years: t`5-10 yrs` },
			leadership: { title: t`Leadership`, titleFr: "Direction", years: t`10+ yrs` },
		};

		return dbCareerRoles
			.sort((a, b) => (levelOrder[a.experienceLevel || "entry"] || 0) - (levelOrder[b.experienceLevel || "entry"] || 0))
			.map((role) => {
				const level = role.experienceLevel || "entry";
				const labels = levelLabels[level] || levelLabels.entry;
				const salaryStr =
					role.salaryMin && role.salaryMax
						? `${(role.salaryMin / 1000).toFixed(0)}K - ${(role.salaryMax / 1000).toFixed(0)}K DH`
						: t`Variable`;

				return {
					id: role.id,
					title: labels.title,
					titleFr: role.roleFr || labels.titleFr,
					years: labels.years,
					salary: salaryStr,
					description: role.description || role.descriptionFr || "",
					skills: [],
				};
			})
			.slice(0, 4);
	}, [dbCareerRoles]);

	// Save progress mutation
	const { mutate: saveProgressMutation } = useMutation(
		orpc.career.assessment.saveProgress.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries({ queryKey: ["career", "assessment"] });
			},
			onError: () => toast.error(t`Failed to save assessment progress. Please try again.`),
		}),
	);

	// Complete assessment mutation
	const { mutate: completeAssessment } = useMutation(
		orpc.career.assessment.complete.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries({ queryKey: ["career", "assessment"] });
			},
			onError: () => toast.error(t`Failed to complete assessment. Please try again.`),
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
			onError: () => toast.error(t`Failed to reset assessment. Please try again.`),
		}),
	);

	// Load saved assessment on mount
	useEffect(() => {
		if (savedAssessment && !isInitialized) {
			setIsInitialized(true);
			const loadedAnswers = savedAssessment.answers as QuizAnswer[];
			setAnswers(loadedAnswers);

			if (savedAssessment.status === "completed") {
				setQuizCompleted(true);
				if (savedAssessment.personalityProfile) {
					const dbProfile = savedAssessment.personalityProfile as ExtendedPersonalityProfile;
					const localProfile: PersonalityProfile = {
						teamwork: dbProfile.teamwork,
						technical_aptitude: dbProfile.technical_aptitude,
						patient_care: dbProfile.patient_care,
						safety_focus: dbProfile.safety_focus,
						leadership: dbProfile.leadership,
					};
					setPersonalityProfile(localProfile);
				}
				if (savedAssessment.careerMatches) {
					const matchesWithIcons = (savedAssessment.careerMatches as Array<Omit<CareerMatch, "icon">>).map((match) => ({
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
	const saveProgress = useCallback(
		(newAnswers: QuizAnswer[], _completed: boolean, question: number) => {
			saveProgressMutation({
				currentQuestion: question,
				answers: newAnswers,
			});
		},
		[saveProgressMutation],
	);

	// Handle answer selection
	const handleAnswer = useCallback(
		(optionId: string) => {
			if (isAnimating || quizQuestions.length === 0) return;

			const questionId = quizQuestions[currentQuestion].id;
			const newAnswers = [...answers.filter((a) => a.questionId !== questionId), { questionId, optionId }];
			setAnswers(newAnswers);

			setIsAnimating(true);

			setTimeout(() => {
				if (currentQuestion < quizQuestions.length - 1) {
					setCurrentQuestion((prev) => prev + 1);
					saveProgress(newAnswers, false, currentQuestion + 1);
				} else {
					const profile = calculatePersonalityProfile(newAnswers, quizQuestions);
					const matches = calculateCareerMatches(profile, programs);
					setPersonalityProfile(profile);
					setCareerMatches(matches);
					setQuizCompleted(true);

					completeAssessment({
						answers: newAnswers,
						personalityProfile: toExtendedProfile(profile),
						careerMatches: matches.map((m) => toStorageMatch(m, programs)),
					});
				}
				setIsAnimating(false);
			}, 300);
		},
		[currentQuestion, answers, isAnimating, saveProgress, completeAssessment, quizQuestions, programs],
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

	// Reset quiz
	const resetQuiz = useCallback(() => {
		resetAssessmentMutation({});
	}, [resetAssessmentMutation]);

	// Personality radar chart data
	const radarData = useMemo(() => {
		if (!personalityProfile) return null;

		return [
			{ key: "teamwork", label: t`Teamwork`, value: personalityProfile.teamwork },
			{ key: "technical_aptitude", label: t`Technical Aptitude`, value: personalityProfile.technical_aptitude },
			{ key: "patient_care", label: t`Patient Care`, value: personalityProfile.patient_care },
			{ key: "safety_focus", label: t`Safety Focus`, value: personalityProfile.safety_focus },
			{ key: "leadership", label: t`Leadership`, value: personalityProfile.leadership },
		];
	}, [personalityProfile]);

	// Top 3 recommended programs
	const topPrograms = useMemo(() => careerMatches.slice(0, 3), [careerMatches]);

	// Current question data
	const currentQ = useMemo(() => quizQuestions[currentQuestion], [currentQuestion, quizQuestions]);

	// Find user's answer for the current question
	const currentAnswer = useMemo(() => answers.find((a) => a.questionId === currentQ?.id), [answers, currentQ?.id]);

	// Quiz progress percentage
	const progress = useMemo(
		() => (quizQuestions.length > 0 ? ((currentQuestion + 1) / quizQuestions.length) * 100 : 0),
		[currentQuestion, quizQuestions.length],
	);

	// Show loading state
	if (isLoading) {
		return (
			<>
				<DashboardHeader icon={CompassIcon} title={t`Career Guidance`} />
				<AssessmentSkeleton />
			</>
		);
	}

	// Show error state
	if (error) {
		return (
			<>
				<DashboardHeader icon={CompassIcon} title={t`Career Guidance`} />
				<ErrorState onRetry={() => refetch()} />
			</>
		);
	}

	return (
		<main role="main" aria-label={t`Career guidance main content`}>
			<DashboardHeader
				icon={CompassIcon}
				title={t`Career Guidance`}
				subtitle={t`Discover your ideal path with personalized assessment and market insights`}
				accentColor="#10b981"
				gradient="linear-gradient(135deg, oklch(0.97 0.02 160) 0%, oklch(0.95 0.03 180) 50%, oklch(0.96 0.02 200) 100%)"
			/>

			<HeroSection />

			{/* Main Tabs */}
			<Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
				<TabsList
					className="flex h-auto flex-wrap gap-2 rounded-xl border border-emerald-500/10 bg-emerald-500/5 p-1.5 backdrop-blur-sm"
					aria-label={t`Career guidance sections`}
				>
					{[
						{ value: "assessment", icon: ClockIcon, label: t`Assessment` },
						{ value: "market", icon: ChartLineUpIcon, label: t`Market` },
						{ value: "pathways", icon: PathIcon, label: t`Pathways` },
						{ value: "ai-tools", icon: SparkleIcon, label: t`AI Tools` },
					].map((tab) => (
						<TabsTrigger
							key={tab.value}
							value={tab.value}
							className="gap-2 rounded-lg border border-transparent px-6 py-2.5 font-medium transition-all focus-visible:ring-2 focus-visible:ring-emerald-500/50 focus-visible:ring-offset-2 data-[state=active]:border-emerald-500/30 data-[state=active]:bg-white data-[state=active]:text-emerald-700 data-[state=active]:shadow-sm dark:data-[state=active]:bg-emerald-500/15 dark:data-[state=active]:text-emerald-400"
							aria-label={tab.label}
						>
							<tab.icon className="size-4" aria-hidden="true" />
							{tab.label}
						</TabsTrigger>
					))}
				</TabsList>

				{/* Assessment Tab */}
				<TabsContent value="assessment" className="space-y-8">
					{!quizCompleted ? (
						isLoadingQuestions ? (
							<div className="flex items-center justify-center py-12">
								<div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
							</div>
						) : quizQuestions.length === 0 ? (
							<EmptyQuizState />
						) : (
							<>
								<QuizProgressBar
									currentQuestion={currentQuestion}
									totalQuestions={quizQuestions.length}
									progress={progress}
								/>
								<QuizQuestionCard
									currentQ={currentQ}
									currentAnswer={currentAnswer}
									isAnimating={isAnimating}
									isResetting={isResetting}
									currentQuestion={currentQuestion}
									handleAnswer={handleAnswer}
									goToPrevious={goToPrevious}
									resetQuiz={resetQuiz}
								/>
							</>
						)
					) : (
						<motion.div
							initial={false}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.5 }}
							className="space-y-8"
						>
							<CongratulationsBanner resetQuiz={resetQuiz} isResetting={isResetting} />

							<div className="grid gap-8 lg:grid-cols-2">
								<PersonalityProfileCard radarData={radarData} />
								<TopProgramsCard topPrograms={topPrograms} programs={programs} />
							</div>

							<AllMatchesCard careerMatches={careerMatches} />
						</motion.div>
					)}
				</TabsContent>

				{/* Market Insights Tab */}
				<TabsContent value="market" className="space-y-8">
					<MarketTrendsSection marketInsights={marketInsights} />
					<SalaryComparisonCard />
					<TopEmployersCard topEmployers={topEmployers} />
					<GrowthProjectionsCard />
				</TabsContent>

				{/* Career Pathways Tab */}
				<TabsContent value="pathways" className="space-y-8">
					<PathwaySelector selectedPathway={selectedPathway} onSelect={setSelectedPathway} />
					<CareerTimelineCard selectedPathway={selectedPathway} careerPathwayStages={careerPathwayStages} />
					<CallToActionCard isResetting={isResetting} resetQuiz={resetQuiz} setActiveTab={setActiveTab} />
				</TabsContent>

				{/* AI Career Tools Tab */}
				<TabsContent value="ai-tools" className="space-y-8">
					<AiCareerToolsSection
						onToolSelect={(toolId) => {
							if (toolId === "skill-gap") setSkillGapOpen(true);
							else if (toolId === "career-paths") setCareerPathOpen(true);
							else setCareerCoachOpen(true);
						}}
					/>
				</TabsContent>
			</Tabs>

			<SkillGapDialog open={skillGapOpen} onOpenChange={setSkillGapOpen} />
			<CareerPathDialog open={careerPathOpen} onOpenChange={setCareerPathOpen} />
			<CareerCoachDialog open={careerCoachOpen} onOpenChange={setCareerCoachOpen} />
		</main>
	);
}
