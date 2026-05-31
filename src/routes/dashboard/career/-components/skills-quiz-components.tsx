import { Trans } from "@lingui/react/macro";
import {
	ArrowClockwiseIcon,
	ArrowLeftIcon,
	ArrowRightIcon,
	BookOpenIcon,
	BrainIcon,
	CalendarIcon,
	CaretLeftIcon,
	CaretRightIcon,
	CertificateIcon,
	ChartPieIcon,
	CheckCircleIcon,
	ClockIcon,
	LightbulbIcon,
	ListChecksIcon,
	MedalIcon,
	PauseIcon,
	PlayIcon,
	ShieldCheckIcon,
	SparkleIcon,
	StarIcon,
	TargetIcon,
	TimerIcon,
	TrophyIcon,
	XCircleIcon,
} from "@phosphor-icons/react";
import { AnimatePresence, motion } from "motion/react";
import { PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, ResponsiveContainer } from "recharts";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/utils/style";

import { AVAILABLE_BADGES, CATEGORY_CONFIG, LEVEL_CONFIG, RARITY_COLORS } from "./skills-quiz-config";
import type { ImprovementPlan, QuizQuestion, QuizResult, SkillCategory } from "./skills-quiz-types";
import { formatTime } from "./skills-quiz-utils";

// =============================================================================
// LOADING STATE
// =============================================================================

export function SkillsQuizLoading() {
	return (
		<Card className="border-dashed">
			<CardContent className="flex flex-col items-center py-12 text-center">
				<motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
					<BrainIcon className="mb-4 size-12 text-primary" />
				</motion.div>
				<h3 className="mb-2 font-medium text-lg">
					<Trans>Loading...</Trans>
				</h3>
				<p className="text-muted-foreground">
					<Trans>Retrieving your quiz results</Trans>
				</p>
			</CardContent>
		</Card>
	);
}

// =============================================================================
// ERROR STATE
// =============================================================================

interface SkillsQuizErrorProps {
	onRetry: () => void;
}

export function SkillsQuizError({ onRetry }: SkillsQuizErrorProps) {
	return (
		<Card className="border-destructive">
			<CardContent className="flex flex-col items-center py-12 text-center">
				<XCircleIcon className="mb-4 size-12 text-destructive" />
				<h3 className="mb-2 font-medium text-lg">
					<Trans>Loading error</Trans>
				</h3>
				<p className="mb-4 text-muted-foreground">
					<Trans>Unable to load your quiz results. Please try again.</Trans>
				</p>
				<Button onClick={onRetry}>
					<Trans>Retry</Trans>
				</Button>
			</CardContent>
		</Card>
	);
}

// =============================================================================
// HERO SECTION
// =============================================================================

interface HeroSectionProps {
	quizResultsCount: number;
	allEarnedBadgesCount: number;
}

export function HeroSection({ quizResultsCount, allEarnedBadgesCount }: HeroSectionProps) {
	return (
		<motion.div
			className="relative mb-8 overflow-hidden rounded-3xl border border-primary/20 p-8 md:p-12"
			style={{
				background:
					"linear-gradient(135deg, oklch(0.7 0.15 280 / 0.15) 0%, oklch(0.6 0.2 200 / 0.1) 50%, oklch(0.65 0.18 150 / 0.08) 100%)",
			}}
			initial={false}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.6 }}
		>
			<div className="pointer-events-none absolute inset-0 overflow-hidden">
				<motion.div
					className="absolute -top-32 -right-32 size-96 rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/10 blur-3xl"
					animate={{ scale: [1, 1.2, 1], rotate: [0, 10, 0] }}
					transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
				/>
			</div>

			<div className="relative z-10">
				<motion.div
					className="mb-3 flex items-center gap-2"
					initial={false}
					animate={{ opacity: 1, x: 0 }}
					transition={{ delay: 0.2 }}
				>
					<BrainIcon className="size-5 text-primary" weight="fill" />
					<span className="font-semibold text-primary text-sm uppercase tracking-wider">
						<Trans>Skills Assessment</Trans>
					</span>
				</motion.div>

				<motion.h2
					className="mb-4 font-bold text-3xl tracking-tight md:text-4xl"
					initial={false}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.3 }}
				>
					<Trans>Test and Develop Your Skills</Trans>
				</motion.h2>

				<motion.p
					className="mb-6 max-w-2xl text-muted-foreground"
					initial={false}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.4 }}
				>
					<Trans>
						Assess your technical, interpersonal, and leadership skills. Get a personalized improvement plan and track
						your progress.
					</Trans>
				</motion.p>

				<motion.div
					className="flex flex-wrap items-center gap-6"
					initial={false}
					animate={{ opacity: 1 }}
					transition={{ delay: 0.5 }}
				>
					<div className="flex items-center gap-2">
						<div className="flex size-10 items-center justify-center rounded-full bg-primary/10">
							<ListChecksIcon className="size-5 text-primary" weight="duotone" />
						</div>
						<div>
							<p className="font-bold text-xl">{quizResultsCount}</p>
							<p className="text-muted-foreground text-sm">
								<Trans>Quizzes completed</Trans>
							</p>
						</div>
					</div>
					<div className="flex items-center gap-2">
						<div className="flex size-10 items-center justify-center rounded-full bg-amber-500/10">
							<MedalIcon className="size-5 text-amber-500" weight="duotone" />
						</div>
						<div>
							<p className="font-bold text-xl">{allEarnedBadgesCount}</p>
							<p className="text-muted-foreground text-sm">
								<Trans>Badges earned</Trans>
							</p>
						</div>
					</div>
					<div className="flex items-center gap-2">
						<div className="flex size-10 items-center justify-center rounded-full bg-green-500/10">
							<TargetIcon className="size-5 text-green-500" weight="duotone" />
						</div>
						<div>
							<p className="font-bold text-xl">3</p>
							<p className="text-muted-foreground text-sm">
								<Trans>Categories</Trans>
							</p>
						</div>
					</div>
				</motion.div>
			</div>
		</motion.div>
	);
}

// =============================================================================
// CATEGORY SELECTION TAB
// =============================================================================

interface CategorySelectionTabProps {
	bestResults: Record<SkillCategory, QuizResult | null>;
	timerEnabled: boolean;
	onStartQuiz: (category: SkillCategory) => void;
	onToggleTimer: () => void;
}

export function CategorySelectionTab({
	bestResults,
	timerEnabled,
	onStartQuiz,
	onToggleTimer,
}: CategorySelectionTabProps) {
	return (
		<div className="space-y-8">
			<div className="grid gap-6 md:grid-cols-3">
				{(Object.entries(CATEGORY_CONFIG) as [SkillCategory, (typeof CATEGORY_CONFIG)[SkillCategory]][]).map(
					([category, config]) => {
						const CategoryIcon = config.icon;
						const bestResult = bestResults[category];

						return (
							<motion.div key={category} initial={false} animate={{ opacity: 1, y: 0 }} whileHover={{ y: -4 }}>
								<Card
									className="h-full cursor-pointer transition-all hover:border-primary/50 hover:shadow-lg"
									onClick={() => onStartQuiz(category)}
								>
									<CardHeader>
										<div className={cn("mb-4 flex size-14 items-center justify-center rounded-2xl", config.bgColor)}>
											<CategoryIcon className={cn("size-7", config.color)} weight="duotone" />
										</div>
										<CardTitle>{config.label}</CardTitle>
										<CardDescription>
											{category === "technical" && <Trans>Programming, architecture, tools, and best practices</Trans>}
											{category === "soft_skills" && <Trans>Communication, teamwork, time management</Trans>}
											{category === "leadership" && <Trans>Vision, decision-making, team motivation</Trans>}
										</CardDescription>
									</CardHeader>
									<CardContent>
										{bestResult ? (
											<div className="space-y-3">
												<div className="flex items-center justify-between">
													<span className="text-muted-foreground text-sm">
														<Trans>Best score</Trans>
													</span>
													<Badge className={LEVEL_CONFIG[bestResult.level].color}>{bestResult.score}%</Badge>
												</div>
												<div className="flex items-center justify-between">
													<span className="text-muted-foreground text-sm">
														<Trans>Level</Trans>
													</span>
													<Badge variant="outline">{LEVEL_CONFIG[bestResult.level].label}</Badge>
												</div>
											</div>
										) : (
											<p className="text-muted-foreground text-sm">
												<Trans>No quiz completed yet</Trans>
											</p>
										)}
									</CardContent>
									<CardFooter>
										<Button className="w-full gap-2">
											<PlayIcon className="size-4" />
											<Trans>Start Quiz</Trans>
										</Button>
									</CardFooter>
								</Card>
							</motion.div>
						);
					},
				)}
			</div>

			<Card>
				<CardContent className="flex items-center justify-between p-6">
					<div className="flex items-center gap-4">
						<div className="flex size-12 items-center justify-center rounded-xl bg-primary/10">
							<TimerIcon className="size-6 text-primary" />
						</div>
						<div>
							<h4 className="font-medium">
								<Trans>Timer per Question</Trans>
							</h4>
							<p className="text-muted-foreground text-sm">
								<Trans>Enables a countdown timer for each question</Trans>
							</p>
						</div>
					</div>
					<Button variant={timerEnabled ? "default" : "outline"} onClick={onToggleTimer} className="gap-2">
						{timerEnabled ? <ClockIcon className="size-4" /> : <XCircleIcon className="size-4" />}
						{timerEnabled ? <Trans>Active</Trans> : <Trans>Disabled</Trans>}
					</Button>
				</CardContent>
			</Card>
		</div>
	);
}

// =============================================================================
// QUIZ TAB
// =============================================================================

interface QuizTabProps {
	currentQuestion: QuizQuestion;
	currentQuestionIndex: number;
	questionsLength: number;
	selectedCategory: SkillCategory | null;
	selectedOption: string | null;
	showExplanation: boolean;
	timerEnabled: boolean;
	timeRemaining: number;
	isPaused: boolean;
	progress: number;
	onSelectOption: (optionId: string) => void;
	onSubmitAnswer: () => void;
	onNextQuestion: () => void;
	onGoToSelection: () => void;
	onTogglePause: () => void;
}

export function QuizTab({
	currentQuestion,
	currentQuestionIndex,
	questionsLength,
	selectedCategory,
	selectedOption,
	showExplanation,
	timerEnabled,
	timeRemaining,
	isPaused,
	progress,
	onSelectOption,
	onSubmitAnswer,
	onNextQuestion,
	onGoToSelection,
	onTogglePause,
}: QuizTabProps) {
	return (
		<>
			<Card>
				<CardContent className="py-4">
					<div className="mb-4 flex items-center justify-between">
						<div className="flex items-center gap-3">
							{selectedCategory && (
								<Badge
									className={cn(CATEGORY_CONFIG[selectedCategory].bgColor, CATEGORY_CONFIG[selectedCategory].color)}
								>
									{CATEGORY_CONFIG[selectedCategory].label}
								</Badge>
							)}
							<span className="text-muted-foreground text-sm">
								Question {currentQuestionIndex + 1}/{questionsLength}
							</span>
						</div>
						<div className="flex items-center gap-4">
							{timerEnabled && (
								<div className="flex items-center gap-2">
									<Button variant="ghost" size="icon-sm" onClick={onTogglePause}>
										{isPaused ? <PlayIcon className="size-4" /> : <PauseIcon className="size-4" />}
									</Button>
									<Badge variant={timeRemaining < 10 ? "destructive" : "secondary"} className="gap-1">
										<ClockIcon className="size-3" />
										{formatTime(timeRemaining)}
									</Badge>
								</div>
							)}
							<span className="font-bold text-primary">{Math.round(progress)}%</span>
						</div>
					</div>
					<Progress value={progress} className="h-2" />
				</CardContent>
			</Card>

			<AnimatePresence mode="wait">
				<motion.div
					key={currentQuestion.id}
					initial={{ opacity: 0, x: 50 }}
					animate={{ opacity: 1, x: 0 }}
					exit={{ opacity: 0, x: -50 }}
					transition={{ duration: 0.3 }}
				>
					<Card className="border-2 border-primary/20">
						<CardHeader>
							<div className="mb-2 flex items-center gap-2">
								<Badge variant="outline">{currentQuestion.skill}</Badge>
								<Badge variant="outline" className="gap-1">
									{Array.from({ length: currentQuestion.difficulty }).map((_, i) => (
										<StarIcon key={i} className="size-3 text-amber-500" weight="fill" />
									))}
								</Badge>
							</div>
							<CardTitle className="text-xl leading-relaxed">{currentQuestion.question}</CardTitle>
						</CardHeader>
						<CardContent className="space-y-3">
							{currentQuestion.options.map((option, index) => {
								const isSelected = selectedOption === option.id;
								const isCorrect = option.isCorrect;
								const showResult = showExplanation;

								return (
									<motion.button
										key={option.id}
										type="button"
										initial={{ opacity: 0, y: 10 }}
										animate={{ opacity: 1, y: 0 }}
										transition={{ delay: index * 0.1 }}
										onClick={() => onSelectOption(option.id)}
										disabled={showExplanation}
										className={cn(
											"flex w-full items-center gap-4 rounded-xl border-2 p-4 text-left transition-all",
											!showResult && isSelected && "border-primary bg-primary/10",
											!showResult && !isSelected && "border-border hover:border-primary/50",
											showResult && isCorrect && "border-green-500 bg-green-500/10",
											showResult && isSelected && !isCorrect && "border-red-500 bg-red-500/10",
											showExplanation && "cursor-default",
										)}
									>
										<div
											className={cn(
												"flex size-10 shrink-0 items-center justify-center rounded-lg font-bold",
												!showResult && isSelected && "bg-primary text-primary-foreground",
												!showResult && !isSelected && "bg-muted",
												showResult && isCorrect && "bg-green-500 text-white",
												showResult && isSelected && !isCorrect && "bg-red-500 text-white",
											)}
										>
											{String.fromCharCode(65 + index)}
										</div>
										<span className="flex-1">{option.text}</span>
										{showResult && isCorrect && <CheckCircleIcon className="size-6 text-green-500" weight="fill" />}
										{showResult && isSelected && !isCorrect && (
											<XCircleIcon className="size-6 text-red-500" weight="fill" />
										)}
									</motion.button>
								);
							})}

							<AnimatePresence>
								{showExplanation && (
									<motion.div
										initial={{ opacity: 0, height: 0 }}
										animate={{ opacity: 1, height: "auto" }}
										exit={{ opacity: 0, height: 0 }}
										className="mt-4 rounded-xl border border-blue-500/30 bg-blue-500/10 p-4"
									>
										<div className="flex items-start gap-3">
											<LightbulbIcon className="size-6 shrink-0 text-blue-500" weight="fill" />
											<div>
												<h4 className="mb-1 font-medium text-blue-700 dark:text-blue-400">
													<Trans>Explanation</Trans>
												</h4>
												<p className="text-sm">{currentQuestion.explanation}</p>
											</div>
										</div>
									</motion.div>
								)}
							</AnimatePresence>
						</CardContent>
						<CardFooter className="flex justify-between">
							<Button variant="outline" onClick={onGoToSelection} className="gap-2">
								<CaretLeftIcon className="size-4" />
								<Trans>Quit</Trans>
							</Button>
							{!showExplanation ? (
								<Button onClick={onSubmitAnswer} disabled={!selectedOption} className="gap-2">
									<CheckCircleIcon className="size-4" />
									<Trans>Validate</Trans>
								</Button>
							) : (
								<Button onClick={onNextQuestion} className="gap-2">
									{currentQuestionIndex < questionsLength - 1 ? (
										<>
											<Trans>Next</Trans>
											<CaretRightIcon className="size-4" />
										</>
									) : (
										<>
											<Trans>View Results</Trans>
											<ChartPieIcon className="size-4" />
										</>
									)}
								</Button>
							)}
						</CardFooter>
					</Card>
				</motion.div>
			</AnimatePresence>
		</>
	);
}

// =============================================================================
// RESULTS TAB
// =============================================================================

interface ResultsTabProps {
	currentResult: QuizResult;
	radarData: { skill: string; score: number; fullMark: number }[];
	improvementPlans: ImprovementPlan[];
	onGoToSelection: () => void;
	onRetakeQuiz: () => void;
}

export function ResultsTab({
	currentResult,
	radarData,
	improvementPlans,
	onGoToSelection,
	onRetakeQuiz,
}: ResultsTabProps) {
	return (
		<>
			<Card className="border-2 border-primary/30 bg-gradient-to-br from-primary/10 to-transparent">
				<CardContent className="py-8 text-center">
					<motion.div
						initial={{ scale: 0 }}
						animate={{ scale: 1 }}
						transition={{ type: "spring", bounce: 0.5 }}
						className="mx-auto mb-4 flex size-24 items-center justify-center rounded-full bg-primary/20"
					>
						<TrophyIcon className="size-12 text-primary" weight="fill" />
					</motion.div>
					<h2 className="mb-2 font-bold text-4xl">{currentResult.score}%</h2>
					<p className="mb-4 text-muted-foreground">
						{currentResult.correctAnswers}/{currentResult.totalQuestions} <Trans>correct answers</Trans>
					</p>
					<Badge className={cn("text-lg", LEVEL_CONFIG[currentResult.level].color)}>
						{LEVEL_CONFIG[currentResult.level].label}
					</Badge>
				</CardContent>
			</Card>

			<div className="grid gap-6 lg:grid-cols-2">
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<ChartPieIcon className="size-5 text-primary" />
							<Trans>Analysis by Skill</Trans>
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="h-80">
							<ResponsiveContainer width="100%" height="100%">
								<RadarChart data={radarData}>
									<PolarGrid stroke="currentColor" strokeOpacity={0.2} />
									<PolarAngleAxis dataKey="skill" tick={{ fill: "currentColor", fontSize: 12 }} />
									<PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: "currentColor", fontSize: 10 }} />
									<Radar
										name="Score"
										dataKey="score"
										stroke="oklch(0.6 0.2 250)"
										fill="oklch(0.6 0.2 250)"
										fillOpacity={0.4}
									/>
								</RadarChart>
							</ResponsiveContainer>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<CertificateIcon className="size-5 text-amber-500" />
							<Trans>Badges Earned</Trans>
						</CardTitle>
					</CardHeader>
					<CardContent>
						{currentResult.badges.length > 0 ? (
							<div className="grid gap-4 sm:grid-cols-2">
								{currentResult.badges.map((badgeId) => {
									const badge = AVAILABLE_BADGES.find((b) => b.id === badgeId);
									if (!badge) return null;
									const BadgeIcon = badge.icon;

									return (
										<motion.div
											key={badge.id}
											initial={{ scale: 0, rotate: -180 }}
											animate={{ scale: 1, rotate: 0 }}
											transition={{ type: "spring", delay: 0.2 }}
											className={cn("flex items-center gap-3 rounded-xl border-2 p-4", RARITY_COLORS[badge.rarity])}
										>
											<BadgeIcon className="size-8 text-amber-500" weight="fill" />
											<div>
												<h4 className="font-medium">{badge.name}</h4>
												<p className="text-muted-foreground text-xs">{badge.description}</p>
											</div>
										</motion.div>
									);
								})}
							</div>
						) : (
							<p className="text-center text-muted-foreground">
								<Trans>Keep going to unlock badges!</Trans>
							</p>
						)}
					</CardContent>
				</Card>
			</div>

			{improvementPlans.length > 0 && (
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<SparkleIcon className="size-5 text-primary" />
							<Trans>Personalized Improvement Plan</Trans>
						</CardTitle>
						<CardDescription>
							<Trans>Recommendations based on your results</Trans>
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="space-y-6">
							{improvementPlans.map((plan, index) => (
								<motion.div
									key={plan.skill}
									initial={false}
									animate={{ opacity: 1, x: 0 }}
									transition={{ delay: index * 0.1 }}
									className="rounded-xl border p-4"
								>
									<div className="mb-3 flex items-center justify-between">
										<h4 className="font-medium">{plan.skill}</h4>
										<div className="flex items-center gap-2">
											<Badge variant="outline">{LEVEL_CONFIG[plan.currentLevel].label}</Badge>
											<ArrowRightIcon className="size-4 text-muted-foreground" />
											<Badge>{LEVEL_CONFIG[plan.targetLevel].label}</Badge>
										</div>
									</div>
									<div className="space-y-3">
										<div>
											<h5 className="mb-2 font-medium text-sm">
												<Trans>Recommendations:</Trans>
											</h5>
											<ul className="space-y-1">
												{plan.recommendations.map((rec, i) => (
													<li key={i} className="flex items-start gap-2 text-sm">
														<CheckCircleIcon className="size-4 shrink-0 text-green-500" />
														{rec}
													</li>
												))}
											</ul>
										</div>
										<div>
											<h5 className="mb-2 font-medium text-sm">
												<Trans>Resources:</Trans>
											</h5>
											<div className="flex flex-wrap gap-2">
												{plan.resources.map((res, i) => (
													<Badge key={i} variant="secondary" className="gap-1">
														<BookOpenIcon className="size-3" />
														{res.title}
													</Badge>
												))}
											</div>
										</div>
									</div>
								</motion.div>
							))}
						</div>
					</CardContent>
				</Card>
			)}

			<div className="flex flex-wrap justify-center gap-4">
				<Button variant="outline" onClick={onGoToSelection} className="gap-2">
					<ArrowLeftIcon className="size-4" />
					<Trans>Choose another category</Trans>
				</Button>
				<Button onClick={onRetakeQuiz} className="gap-2">
					<ArrowClockwiseIcon className="size-4" />
					<Trans>Retake this quiz</Trans>
				</Button>
			</div>
		</>
	);
}

// =============================================================================
// HISTORY TAB
// =============================================================================

interface HistoryTabProps {
	quizResults: QuizResult[];
	historyRadarData: { skill: string; score: number; fullMark: number }[];
	onSetActiveTab: (tab: string) => void;
}

export function HistoryTab({ quizResults, historyRadarData, onSetActiveTab }: HistoryTabProps) {
	if (quizResults.length === 0) {
		return (
			<Card className="border-dashed">
				<CardContent className="flex flex-col items-center py-12 text-center">
					<CalendarIcon className="mb-4 size-12 text-muted-foreground/50" />
					<h3 className="mb-2 font-medium text-lg">
						<Trans>No history</Trans>
					</h3>
					<p className="mb-4 text-muted-foreground">
						<Trans>Complete your first quiz to see your history here.</Trans>
					</p>
					<Button onClick={() => onSetActiveTab("selection")} className="gap-2">
						<PlayIcon className="size-4" />
						<Trans>Start a Quiz</Trans>
					</Button>
				</CardContent>
			</Card>
		);
	}

	return (
		<>
			<div className="grid gap-6 md:grid-cols-3">
				{(Object.entries(CATEGORY_CONFIG) as [SkillCategory, (typeof CATEGORY_CONFIG)[SkillCategory]][]).map(
					([category, config]) => {
						const categoryResults = quizResults.filter((r) => r.category === category);
						const CategoryIcon = config.icon;
						const avgScore =
							categoryResults.length > 0
								? Math.round(categoryResults.reduce((sum, r) => sum + r.score, 0) / categoryResults.length)
								: 0;
						const bestScore = categoryResults.length > 0 ? Math.max(...categoryResults.map((r) => r.score)) : 0;

						return (
							<Card key={category} className="transition-all hover:shadow-md">
								<CardContent className="p-6">
									<div className="mb-4 flex items-center justify-between">
										<div className={cn("flex size-12 items-center justify-center rounded-xl", config.bgColor)}>
											<CategoryIcon className={cn("size-6", config.color)} weight="duotone" />
										</div>
										<Badge variant="secondary">{categoryResults.length} quiz</Badge>
									</div>
									<h4 className="mb-2 font-medium">{config.label}</h4>
									<div className="space-y-2 text-sm">
										<div className="flex justify-between">
											<span className="text-muted-foreground">
												<Trans>Average score</Trans>
											</span>
											<span className="font-bold">{avgScore}%</span>
										</div>
										<div className="flex justify-between">
											<span className="text-muted-foreground">
												<Trans>Best score</Trans>
											</span>
											<span className="font-bold text-green-600">{bestScore}%</span>
										</div>
									</div>
								</CardContent>
							</Card>
						);
					},
				)}
			</div>

			{historyRadarData.length > 0 && (
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<ChartPieIcon className="size-5 text-primary" />
							<Trans>Skills Overview</Trans>
						</CardTitle>
						<CardDescription>
							<Trans>Average of all your quizzes</Trans>
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="h-80">
							<ResponsiveContainer width="100%" height="100%">
								<RadarChart data={historyRadarData}>
									<PolarGrid stroke="currentColor" strokeOpacity={0.2} />
									<PolarAngleAxis dataKey="skill" tick={{ fill: "currentColor", fontSize: 12 }} />
									<PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: "currentColor", fontSize: 10 }} />
									<Radar
										name="Score moyen"
										dataKey="score"
										stroke="oklch(0.6 0.2 250)"
										fill="oklch(0.6 0.2 250)"
										fillOpacity={0.4}
									/>
								</RadarChart>
							</ResponsiveContainer>
						</div>
					</CardContent>
				</Card>
			)}

			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<CalendarIcon className="size-5 text-primary" />
						<Trans>Complete History</Trans>
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="space-y-4">
						{quizResults
							.slice()
							.reverse()
							.map((result, index) => {
								const config = CATEGORY_CONFIG[result.category];
								const CategoryIcon = config.icon;

								return (
									<motion.div
										key={result.id}
										initial={false}
										animate={{ opacity: 1, y: 0 }}
										transition={{ delay: index * 0.05 }}
										className="flex items-center gap-4 rounded-xl border p-4"
									>
										<div className={cn("flex size-12 items-center justify-center rounded-xl", config.bgColor)}>
											<CategoryIcon className={cn("size-6", config.color)} weight="duotone" />
										</div>
										<div className="flex-1">
											<div className="flex items-center gap-2">
												<span className="font-medium">{config.label}</span>
												<Badge variant="outline">{LEVEL_CONFIG[result.level].label}</Badge>
											</div>
											<p className="text-muted-foreground text-sm">
												{new Date(result.date).toLocaleDateString("fr-FR", {
													day: "numeric",
													month: "long",
													year: "numeric",
													hour: "2-digit",
													minute: "2-digit",
												})}
											</p>
										</div>
										<div className="text-right">
											<p className="font-bold text-2xl">{result.score}%</p>
											<p className="text-muted-foreground text-xs">
												{result.correctAnswers}/{result.totalQuestions}
											</p>
										</div>
									</motion.div>
								);
							})}
					</div>
				</CardContent>
			</Card>
		</>
	);
}

// =============================================================================
// BADGES TAB
// =============================================================================

interface BadgesTabProps {
	allEarnedBadges: string[];
}

export function BadgesTab({ allEarnedBadges }: BadgesTabProps) {
	return (
		<>
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<CertificateIcon className="size-5 text-amber-500" />
						<Trans>Badge Collection</Trans>
					</CardTitle>
					<CardDescription>
						<Trans>Unlock badges by completing challenges</Trans>
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
						{AVAILABLE_BADGES.map((badge, index) => {
							const BadgeIcon = badge.icon;
							const isUnlocked = allEarnedBadges.includes(badge.id);

							return (
								<motion.div
									key={badge.id}
									initial={false}
									animate={{ opacity: 1, scale: 1 }}
									transition={{ delay: index * 0.05 }}
									className={cn(
										"relative flex items-center gap-4 rounded-xl border-2 p-4 transition-all",
										isUnlocked
											? RARITY_COLORS[badge.rarity]
											: "border-muted-foreground/30 border-dashed bg-muted/20 opacity-60",
									)}
								>
									<div
										className={cn(
											"flex size-14 items-center justify-center rounded-xl",
											isUnlocked ? "bg-white/50 dark:bg-black/20" : "bg-muted",
										)}
									>
										<BadgeIcon
											className={cn("size-8", isUnlocked ? "text-amber-500" : "text-muted-foreground")}
											weight={isUnlocked ? "fill" : "regular"}
										/>
									</div>
									<div className="flex-1">
										<div className="flex items-center gap-2">
											<h4 className="font-medium">{badge.name}</h4>
											{isUnlocked && <CheckCircleIcon className="size-4 text-green-500" weight="fill" />}
										</div>
										<p className="text-muted-foreground text-xs">{badge.description}</p>
										<Badge variant="outline" className="mt-1 text-xs capitalize">
											{badge.rarity}
										</Badge>
									</div>
									{!isUnlocked && (
										<div className="absolute inset-0 flex items-center justify-center rounded-xl bg-background/50">
											<ShieldCheckIcon className="size-8 text-muted-foreground/50" />
										</div>
									)}
								</motion.div>
							);
						})}
					</div>
				</CardContent>
			</Card>

			<Card className="border-primary/30 bg-gradient-to-br from-primary/10 to-transparent">
				<CardContent className="py-8 text-center">
					<h3 className="mb-4 font-bold text-2xl">
						{allEarnedBadges.length}/{AVAILABLE_BADGES.length} <Trans>Badges Unlocked</Trans>
					</h3>
					<Progress value={(allEarnedBadges.length / AVAILABLE_BADGES.length) * 100} className="mx-auto h-3 max-w-md" />
					<p className="mt-4 text-muted-foreground">
						<Trans>Keep completing quizzes to unlock all badges!</Trans>
					</p>
				</CardContent>
			</Card>
		</>
	);
}
