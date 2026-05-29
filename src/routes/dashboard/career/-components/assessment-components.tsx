import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import {
	ArrowLeftIcon,
	ArrowRightIcon,
	BookOpenIcon,
	BriefcaseIcon,
	CaretLeftIcon,
	CaretRightIcon,
	CertificateIcon,
	ChartLineUpIcon,
	CheckCircleIcon,
	ClipboardTextIcon,
	ClockIcon,
	CompassIcon,
	CurrencyCircleDollarIcon,
	DownloadSimpleIcon,
	GearIcon,
	GraduationCapIcon,
	HeartIcon,
	InfoIcon,
	LightbulbIcon,
	ListChecksIcon,
	MedalIcon,
	PathIcon,
	RocketLaunchIcon,
	ShieldCheckIcon,
	SparkleIcon,
	StarIcon,
	TrophyIcon,
	UserIcon,
	UsersIcon,
	WarningCircleIcon,
} from "@phosphor-icons/react";

import { Link } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/utils/style";

import { categoryColors, fieldColors, fieldIcons } from "./assessment-config";
import type {
	CareerMatch,
	NextStep,
	PersonalityProfile,
	ProgramData,
	QuizAnswer,
	QuizQuestion,
	TrainingRecommendation,
} from "./assessment-types";

// ============================================================================
// Loading Skeleton Component
// ============================================================================

export function AssessmentSkeleton() {
	return (
		<div className="space-y-6">
			<Card>
				<CardContent className="py-4">
					<div className="mb-4 flex items-center justify-between">
						<Skeleton className="h-6 w-32" />
						<Skeleton className="h-6 w-12" />
					</div>
					<Skeleton className="h-3 w-full" />
				</CardContent>
			</Card>
			<Card>
				<CardHeader>
					<Skeleton className="h-8 w-3/4" />
					<Skeleton className="mt-2 h-4 w-1/2" />
				</CardHeader>
				<CardContent className="space-y-4">
					{[1, 2, 3, 4].map((i) => (
						<Skeleton key={i} className="h-16 w-full rounded-xl" />
					))}
				</CardContent>
			</Card>
		</div>
	);
}

// ============================================================================
// Error State Component
// ============================================================================

export function AssessmentErrorState() {
	return (
		<Card className="border-destructive/50">
			<CardContent className="flex flex-col items-center py-8 text-center">
				<WarningCircleIcon className="mb-4 size-12 text-destructive" />
				<h3 className="mb-2 font-semibold text-lg">
					<Trans>Loading error</Trans>
				</h3>
				<p className="mb-4 text-muted-foreground">
					<Trans>Unable to load your evaluation. Please try again.</Trans>
				</p>
				<Button onClick={() => window.location.reload()}>
					<Trans>Reload the page</Trans>
				</Button>
			</CardContent>
		</Card>
	);
}

// ============================================================================
// Hero Section Component
// ============================================================================

interface HeroSectionProps {
	quizCompleted: boolean;
	totalQuestions: number;
}

export function HeroSection({ quizCompleted, totalQuestions }: HeroSectionProps) {
	return (
		<motion.div
			className="relative mb-8 overflow-hidden rounded-3xl border border-primary/20 p-8 md:p-12"
			style={{
				background:
					"linear-gradient(135deg, oklch(0.7 0.15 280 / 0.15) 0%, oklch(0.6 0.2 200 / 0.1) 50%, oklch(0.65 0.18 150 / 0.08) 100%)",
			}}
			initial={false}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.6, ease: "easeOut" }}
		>
			{/* Animated background elements */}
			<div className="pointer-events-none absolute inset-0 overflow-hidden">
				<motion.div
					className="absolute -top-32 -right-32 size-96 rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/10 blur-3xl"
					animate={{
						scale: [1, 1.2, 1],
						rotate: [0, 10, 0],
						opacity: [0.5, 0.3, 0.5],
					}}
					transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
				/>
				<motion.div
					className="absolute -bottom-32 -left-32 size-96 rounded-full bg-gradient-to-tr from-amber-500/15 to-green-500/10 blur-3xl"
					animate={{
						scale: [1.2, 1, 1.2],
						rotate: [0, -10, 0],
						opacity: [0.3, 0.5, 0.3],
					}}
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
					<ClipboardTextIcon className="size-5 text-primary" weight="fill" />
					<span className="font-semibold text-primary text-sm uppercase tracking-wider">
						<Trans>Complete IMTA Assessment</Trans>
					</span>
				</motion.div>

				<motion.h2
					className="mb-4 bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text font-bold text-3xl text-transparent tracking-tight md:text-4xl lg:text-5xl"
					initial={false}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.3 }}
				>
					{!quizCompleted ? <Trans>Discover Your Ideal Career</Trans> : <Trans>Your Personalized Results</Trans>}
				</motion.h2>

				<motion.p
					className="mb-8 max-w-2xl text-lg text-muted-foreground"
					initial={false}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.4 }}
				>
					{!quizCompleted ? (
						<Trans>
							Answer {totalQuestions} questions to identify the training programs and careers that best match your
							personality, skills, and aspirations in the Moroccan job market.
						</Trans>
					) : (
						<Trans>
							Based on your answers, here are the careers and IMTA programs that best match your unique profile unique.
						</Trans>
					)}
				</motion.p>

				{/* Quick Stats */}
				<motion.div
					className="flex flex-wrap items-center gap-6"
					initial={false}
					animate={{ opacity: 1 }}
					transition={{ delay: 0.5 }}
				>
					<div className="flex items-center gap-2">
						<div className="flex size-10 items-center justify-center rounded-full bg-primary/10">
							<ClockIcon className="size-5 text-primary" weight="duotone" />
						</div>
						<div>
							<p className="font-bold text-xl">10-15 min</p>
							<p className="text-muted-foreground text-sm">
								<Trans>Estimated duration</Trans>
							</p>
						</div>
					</div>
					<div className="flex items-center gap-2">
						<div className="flex size-10 items-center justify-center rounded-full bg-amber-500/10">
							<ListChecksIcon className="size-5 text-amber-500" weight="duotone" />
						</div>
						<div>
							<p className="font-bold text-xl">{totalQuestions}</p>
							<p className="text-muted-foreground text-sm">
								<Trans>Questions</Trans>
							</p>
						</div>
					</div>
					<div className="flex items-center gap-2">
						<div className="flex size-10 items-center justify-center rounded-full bg-green-500/10">
							<GraduationCapIcon className="size-5 text-green-500" weight="duotone" />
						</div>
						<div>
							<p className="font-bold text-xl">11</p>
							<p className="text-muted-foreground text-sm">
								<Trans>IMTA Programs</Trans>
							</p>
						</div>
					</div>
				</motion.div>
			</div>
		</motion.div>
	);
}

// ============================================================================
// Progress Section Component
// ============================================================================

interface ProgressSectionProps {
	currentQ: QuizQuestion;
	currentQuestion: number;
	totalQuestions: number;
	progress: number;
	categoryLabels: Record<string, string>;
}

function ProgressSection({
	currentQ,
	currentQuestion,
	totalQuestions,
	progress,
	categoryLabels,
}: ProgressSectionProps) {
	return (
		<Card className="border-primary/20">
			<CardContent className="py-4">
				<div className="mb-4 flex items-center justify-between">
					<div className="flex items-center gap-3">
						<Badge variant="outline" className={cn("gap-1 text-sm", categoryColors[currentQ.category])}>
							{categoryLabels[currentQ.category]}
						</Badge>
						<span className="font-medium text-muted-foreground text-sm">
							<Trans>
								Question {currentQuestion + 1} / {totalQuestions}
							</Trans>
						</span>
					</div>
					<span className="font-bold text-primary">{Math.round(progress)}%</span>
				</div>
				<Progress value={progress} className="h-3" />
			</CardContent>
		</Card>
	);
}

// ============================================================================
// Question Card Component
// ============================================================================

interface QuestionCardProps {
	currentQ: QuizQuestion;
	currentAnswer: QuizAnswer | undefined;
	currentQuestion: number;
	totalQuestions: number;
	currentScaleValue: number;
	isAnimating: boolean;
	isResetting: boolean;
	handleAnswer: (optionId: string) => void;
	handleScaleAnswer: (value: number[]) => void;
	goToPrevious: () => void;
	goToNext: () => void;
	resetQuiz: () => void;
}

function QuestionCard({
	currentQ,
	currentAnswer,
	currentQuestion,
	totalQuestions,
	currentScaleValue,
	isAnimating,
	isResetting,
	handleAnswer,
	handleScaleAnswer,
	goToPrevious,
	goToNext,
	resetQuiz,
}: QuestionCardProps) {
	return (
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
						<CardTitle className="text-2xl leading-relaxed">{currentQ.question}</CardTitle>
						{currentQ.description && (
							<CardDescription className="flex items-center gap-2 pt-2 text-base">
								<InfoIcon className="size-4 shrink-0" />
								{currentQ.description}
							</CardDescription>
						)}
					</CardHeader>
					<CardContent className="space-y-4">
						{currentQ.type === "multiple_choice" &&
							currentQ.options?.map((option, index) => {
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
										<span className="flex-1 font-medium text-lg">{option.text}</span>
										{isSelected && <CheckCircleIcon className="size-6 shrink-0 text-primary" weight="fill" />}
									</motion.button>
								);
							})}

						{currentQ.type === "scale" && (
							<div className="space-y-6 py-4">
								<div className="px-4">
									<Slider
										value={[currentScaleValue]}
										onValueChange={handleScaleAnswer}
										min={0}
										max={100}
										step={5}
										className="py-4"
									/>
								</div>
								<div className="flex items-center justify-between px-2 text-sm">
									<span className="max-w-[40%] text-left text-muted-foreground">{currentQ.scaleLabels?.min}</span>
									<Badge variant="outline" className="font-bold text-lg">
										{currentScaleValue}%
									</Badge>
									<span className="max-w-[40%] text-right text-muted-foreground">{currentQ.scaleLabels?.max}</span>
								</div>
							</div>
						)}
					</CardContent>
					<CardFooter className="flex justify-between gap-4 pt-4">
						<Button
							variant="outline"
							onClick={goToPrevious}
							disabled={currentQuestion === 0 || isAnimating}
							className="gap-2"
						>
							<CaretLeftIcon className="size-4" />
							<Trans>Previous</Trans>
						</Button>

						<div className="flex items-center gap-2">
							<Button variant="ghost" onClick={resetQuiz} disabled={isResetting} className="text-muted-foreground">
								<Trans>Start over</Trans>
							</Button>

							{currentQ.type === "scale" && (
								<Button onClick={goToNext} disabled={!currentAnswer && currentScaleValue === 50} className="gap-2">
									{currentQuestion === totalQuestions - 1 ? <Trans>Finish</Trans> : <Trans>Next</Trans>}
									<CaretRightIcon className="size-4" />
								</Button>
							)}
						</div>
					</CardFooter>
				</Card>
			</motion.div>
		</AnimatePresence>
	);
}

// ============================================================================
// Congratulations Banner Component
// ============================================================================

interface CongratulationsBannerProps {
	resetQuiz: () => void;
	isResetting: boolean;
}

function CongratulationsBanner({ resetQuiz, isResetting }: CongratulationsBannerProps) {
	return (
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
						<Trans>
							Congratulations! Discover below the careers and IMTA programs that best match your unique profile.
						</Trans>
					</p>
				</div>
				<Button onClick={resetQuiz} variant="outline" disabled={isResetting} className="mt-4 gap-2 md:mt-0">
					<ArrowLeftIcon className="size-4" />
					<Trans>Retake the test</Trans>
				</Button>
			</CardContent>
		</Card>
	);
}

// ============================================================================
// Career Match Card (Top 3)
// ============================================================================

interface CareerMatchCardProps {
	match: CareerMatch;
	index: number;
	programs: ProgramData[];
}

function CareerMatchCard({ match, index, programs }: CareerMatchCardProps) {
	const MatchIcon = match.icon;
	const program = programs.find((p) => p.id === match.programId);
	const medals = [
		{ color: "text-amber-500", bg: "bg-amber-500/20" },
		{ color: "text-gray-400", bg: "bg-gray-400/20" },
		{ color: "text-orange-600", bg: "bg-orange-600/20" },
	];

	return (
		<motion.div
			key={match.programId}
			initial={false}
			animate={{ opacity: 1, y: 0 }}
			transition={{ delay: index * 0.15 }}
		>
			<Card
				className={cn(
					"relative h-full overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl",
					index === 0 && "border-2 border-amber-500/50",
				)}
			>
				{/* Rank Badge */}
				<div
					className={cn(
						"absolute top-4 right-4 flex size-10 items-center justify-center rounded-full",
						medals[index].bg,
					)}
				>
					<MedalIcon className={cn("size-6", medals[index].color)} weight="fill" />
				</div>

				<CardHeader className="pb-2">
					<div className={cn("mb-4 flex size-16 items-center justify-center rounded-2xl", fieldColors[match.field])}>
						<MatchIcon className="size-8" weight="duotone" />
					</div>
					<CardTitle className="text-xl">{match.name}</CardTitle>
					<CardDescription>{program?.description}</CardDescription>
				</CardHeader>

				<CardContent className="space-y-4">
					{/* Match Score */}
					<div className="space-y-2">
						<div className="flex items-center justify-between">
							<span className="font-medium text-sm">
								<Trans>Compatibility</Trans>
							</span>
							<Badge
								className={cn(
									match.matchPercentage >= 80 && "bg-green-500",
									match.matchPercentage >= 60 && match.matchPercentage < 80 && "bg-amber-500",
									match.matchPercentage < 60 && "bg-gray-500",
								)}
							>
								{match.matchPercentage}%
							</Badge>
						</div>
						<Progress value={match.matchPercentage} className="h-2" />
					</div>

					{/* Quick Info */}
					<div className="grid grid-cols-2 gap-3 text-sm">
						<div className="flex items-center gap-2">
							<ClockIcon className="size-4 text-muted-foreground" />
							<span>{match.duration}</span>
						</div>
						<div className="flex items-center gap-2">
							<CurrencyCircleDollarIcon className="size-4 text-muted-foreground" />
							<span>{match.salary}</span>
						</div>
						{match.employmentRate && (
							<div className="col-span-2 flex items-center gap-2">
								<ChartLineUpIcon className="size-4 text-green-500" />
								<span>
									<Trans>Employment rate: {match.employmentRate}%</Trans>
								</span>
							</div>
						)}
					</div>

					{/* Match Reasons */}
					{match.reasons.length > 0 && (
						<div className="space-y-2">
							<span className="font-medium text-sm">
								<Trans>Why this match:</Trans>
							</span>
							<div className="flex flex-wrap gap-1">
								{match.reasons.map((reason, i) => (
									<Badge key={i} variant="outline" className="text-xs">
										<CheckCircleIcon className="mr-1 size-3 text-green-500" />
										{reason}
									</Badge>
								))}
							</div>
						</div>
					)}
				</CardContent>

				<CardFooter className="pt-4">
					<Link
						to="/dashboard/resources/programs/$programId"
						params={{ programId: match.programId }}
						className="w-full"
					>
						<Button className="w-full gap-2">
							<Trans>Discover this program</Trans>
							<ArrowRightIcon className="size-4" />
						</Button>
					</Link>
				</CardFooter>
			</Card>
		</motion.div>
	);
}

// ============================================================================
// All Matches Grid Component
// ============================================================================

interface AllMatchesGridProps {
	careerMatches: CareerMatch[];
}

function AllMatchesGrid({ careerMatches }: AllMatchesGridProps) {
	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<GraduationCapIcon className="size-5 text-primary" />
					<Trans>All Ranked Programs</Trans>
				</CardTitle>
				<CardDescription>
					<Trans>Here are all IMTA programs ranked by compatibility with your profile.</Trans>
				</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
					{careerMatches.slice(3).map((match, index) => {
						const MatchIcon = match.icon;

						return (
							<motion.div
								key={match.programId}
								initial={false}
								animate={{ opacity: 1, scale: 1 }}
								transition={{ delay: index * 0.05 }}
							>
								<Card className="h-full transition-all hover:border-primary/50 hover:shadow-md">
									<CardContent className="p-4">
										<div className="mb-3 flex items-center gap-3">
											<div
												className={cn("flex size-10 items-center justify-center rounded-lg", fieldColors[match.field])}
											>
												<MatchIcon className="size-5" weight="duotone" />
											</div>
											<div className="min-w-0 flex-1">
												<h4 className="truncate font-medium">{match.name}</h4>
												<p className="text-muted-foreground text-xs capitalize">
													{match.field === "healthcare" && <Trans>Health</Trans>}
													{match.field === "industrial" && <Trans>Industry</Trans>}
													{match.field === "hse" && <Trans>HSE</Trans>}
												</p>
											</div>
											<Badge variant="outline">{match.matchPercentage}%</Badge>
										</div>
										<Progress value={match.matchPercentage} className="h-1.5" />
									</CardContent>
								</Card>
							</motion.div>
						);
					})}
				</div>
			</CardContent>
		</Card>
	);
}

// ============================================================================
// Radar Chart Data Type
// ============================================================================

export interface RadarDataPoint {
	key: string;
	label: string;
	value: number;
}

// ============================================================================
// Profile Tab - Personality Analysis
// ============================================================================

interface ProfileTabProps {
	radarData: RadarDataPoint[] | null;
	personalityProfile: PersonalityProfile | null;
}

function ProfileTab({ radarData, personalityProfile }: ProfileTabProps) {
	return (
		<TabsContent value="profile" className="space-y-6">
			<div className="grid gap-6 lg:grid-cols-2">
				{/* Radar Chart Card */}
				<Card className="overflow-hidden">
					<CardHeader className="border-b bg-gradient-to-r from-primary/5 to-transparent">
						<CardTitle className="flex items-center gap-2 text-xl">
							<UserIcon className="size-5 text-primary" weight="duotone" />
							<Trans>Your Personality Profile</Trans>
						</CardTitle>
						<CardDescription>
							<Trans>Visualization of your dominant traits</Trans>
						</CardDescription>
					</CardHeader>
					<CardContent className="p-6">
						{/* SVG Radar Chart */}
						<div className="relative mx-auto mb-6 aspect-square max-w-xs">
							<svg viewBox="0 0 200 200" className="size-full">
								{/* Background hexagon layers */}
								{[100, 66, 33].map((scale, i) => (
									<polygon
										key={scale}
										points={[0, 1, 2, 3, 4, 5, 6]
											.map((_, idx) => {
												const angle = (idx * 51.4 - 90) * (Math.PI / 180);
												const r = (scale / 100) * 80;
												return `${100 + r * Math.cos(angle)},${100 + r * Math.sin(angle)}`;
											})
											.join(" ")}
										fill="none"
										stroke="currentColor"
										strokeOpacity={0.1 + i * 0.05}
										strokeWidth="1"
									/>
								))}

								{/* Data polygon */}
								{radarData && (
									<motion.polygon
										initial={false}
										animate={{ opacity: 1, scale: 1 }}
										transition={{ duration: 0.8, delay: 0.3 }}
										points={radarData
											.map((trait, i) => {
												const angle = (i * 51.4 - 90) * (Math.PI / 180);
												const r = (trait.value / 100) * 80;
												return `${100 + r * Math.cos(angle)},${100 + r * Math.sin(angle)}`;
											})
											.join(" ")}
										fill="oklch(0.7 0.15 250 / 0.3)"
										stroke="oklch(0.6 0.2 250)"
										strokeWidth="2"
									/>
								)}

								{/* Labels */}
								{radarData?.map((trait, i) => {
									const angle = (i * 51.4 - 90) * (Math.PI / 180);
									const r = 95;
									const x = 100 + r * Math.cos(angle);
									const y = 100 + r * Math.sin(angle);
									return (
										<text
											key={trait.key}
											x={x}
											y={y}
											textAnchor="middle"
											dominantBaseline="middle"
											className="fill-current font-medium text-[6px]"
										>
											{trait.label}
										</text>
									);
								})}
							</svg>
						</div>
					</CardContent>
				</Card>

				{/* Trait Bars Card */}
				<Card className="overflow-hidden">
					<CardHeader className="border-b bg-gradient-to-r from-amber-500/10 to-transparent">
						<CardTitle className="flex items-center gap-2 text-xl">
							<ChartLineUpIcon className="size-5 text-amber-500" weight="duotone" />
							<Trans>Skill Details</Trans>
						</CardTitle>
						<CardDescription>
							<Trans>Detailed scores by category</Trans>
						</CardDescription>
					</CardHeader>
					<CardContent className="p-6">
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
											className={cn(
												"h-full rounded-full",
												trait.value >= 70 && "bg-green-500",
												trait.value >= 50 && trait.value < 70 && "bg-amber-500",
												trait.value < 50 && "bg-gray-400",
											)}
										/>
									</div>
								</motion.div>
							))}
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Personality Insights */}
			<PersonalityInsights personalityProfile={personalityProfile} />
		</TabsContent>
	);
}

// ============================================================================
// Personality Insights Component
// ============================================================================

interface PersonalityInsightsProps {
	personalityProfile: PersonalityProfile | null;
}

function PersonalityInsights({ personalityProfile }: PersonalityInsightsProps) {
	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<LightbulbIcon className="size-5 text-primary" />
					<Trans>Your Profile Analysis</Trans>
				</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
					{personalityProfile && (
						<>
							{personalityProfile.patient_care > 60 && (
								<div className="flex items-start gap-3 rounded-lg border p-4">
									<HeartIcon className="size-6 shrink-0 text-red-500" />
									<div>
										<h4 className="font-medium">
											<Trans>Care-oriented</Trans>
										</h4>
										<p className="text-muted-foreground text-sm">
											<Trans>You have strong empathy and enjoy helping others.</Trans>
										</p>
									</div>
								</div>
							)}
							{personalityProfile.technical_aptitude > 60 && (
								<div className="flex items-start gap-3 rounded-lg border p-4">
									<GearIcon className="size-6 shrink-0 text-blue-500" />
									<div>
										<h4 className="font-medium">
											<Trans>Technical aptitude</Trans>
										</h4>
										<p className="text-muted-foreground text-sm">
											<Trans>You excel at solving technical problems.</Trans>
										</p>
									</div>
								</div>
							)}
							{personalityProfile.safety_focus > 60 && (
								<div className="flex items-start gap-3 rounded-lg border p-4">
									<ShieldCheckIcon className="size-6 shrink-0 text-amber-500" />
									<div>
										<h4 className="font-medium">
											<Trans>Safety focus</Trans>
										</h4>
										<p className="text-muted-foreground text-sm">
											<Trans>Risk prevention is a priority for you.</Trans>
										</p>
									</div>
								</div>
							)}
							{personalityProfile.leadership > 60 && (
								<div className="flex items-start gap-3 rounded-lg border p-4">
									<MedalIcon className="size-6 shrink-0 text-purple-500" />
									<div>
										<h4 className="font-medium">
											<Trans>Leadership potential</Trans>
										</h4>
										<p className="text-muted-foreground text-sm">
											<Trans>You have natural abilities to lead teams.</Trans>
										</p>
									</div>
								</div>
							)}
							{personalityProfile.communication > 60 && (
								<div className="flex items-start gap-3 rounded-lg border p-4">
									<UsersIcon className="size-6 shrink-0 text-green-500" />
									<div>
										<h4 className="font-medium">
											<Trans>Excellent communicator</Trans>
										</h4>
										<p className="text-muted-foreground text-sm">
											<Trans>You know how to convey your ideas and listen to others.</Trans>
										</p>
									</div>
								</div>
							)}
							{personalityProfile.stress_tolerance > 60 && (
								<div className="flex items-start gap-3 rounded-lg border p-4">
									<SparkleIcon className="size-6 shrink-0 text-cyan-500" />
									<div>
										<h4 className="font-medium">
											<Trans>Stress resilience</Trans>
										</h4>
										<p className="text-muted-foreground text-sm">
											<Trans>You stay calm in difficult situations.</Trans>
										</p>
									</div>
								</div>
							)}
						</>
					)}
				</div>
			</CardContent>
		</Card>
	);
}

// ============================================================================
// Training Tab - IMTA Programs
// ============================================================================

interface TrainingTabProps {
	trainingRecommendations: TrainingRecommendation[];
	topPrograms: CareerMatch[];
	programs: ProgramData[];
}

function TrainingTab({ trainingRecommendations, topPrograms, programs }: TrainingTabProps) {
	return (
		<TabsContent value="training" className="space-y-6">
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<GraduationCapIcon className="size-5 text-primary" />
						<Trans>Recommended IMTA Programs</Trans>
					</CardTitle>
					<CardDescription>
						<Trans>Training programs suited to your profile with full details</Trans>
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="space-y-4">
						{trainingRecommendations.map((rec, index) => {
							const program = programs.find((p) => p.id === rec.programId);
							const FieldIcon = fieldIcons[program?.field || "general"];

							return (
								<motion.div
									key={rec.programId}
									initial={false}
									animate={{ opacity: 1, y: 0 }}
									transition={{ delay: index * 0.1 }}
									className="rounded-xl border p-6"
								>
									<div className="flex flex-col gap-4 lg:flex-row lg:items-start">
										<div
											className={cn(
												"flex size-14 shrink-0 items-center justify-center rounded-xl",
												fieldColors[program?.field || "general"],
											)}
										>
											<FieldIcon className="size-7" weight="duotone" />
										</div>

										<div className="flex-1 space-y-3">
											<div className="flex flex-wrap items-center gap-3">
												<h4 className="font-bold text-lg">{rec.name}</h4>
												<Badge
													className={cn(
														rec.matchScore >= 80 && "bg-green-500",
														rec.matchScore >= 60 && rec.matchScore < 80 && "bg-amber-500",
													)}
												>
													<Trans>{rec.matchScore}% match</Trans>
												</Badge>
											</div>

											<p className="text-muted-foreground">{rec.description}</p>

											<div className="grid gap-3 text-sm md:grid-cols-3">
												<div className="flex items-center gap-2">
													<ClockIcon className="size-4 text-muted-foreground" />
													<span>
														<Trans>
															<strong>Duration:</strong> {rec.duration}
														</Trans>
													</span>
												</div>
												<div className="flex items-center gap-2">
													<CertificateIcon className="size-4 text-muted-foreground" />
													<span>
														<Trans>
															<strong>Prerequisites:</strong> {rec.requirements}
														</Trans>
													</span>
												</div>
												<div className="flex items-center gap-2">
													<CurrencyCircleDollarIcon className="size-4 text-muted-foreground" />
													<span>
														<Trans>
															<strong>Salary:</strong> {program?.avgSalary || t`Variable`}
														</Trans>
													</span>
												</div>
											</div>

											{rec.skills.length > 0 && (
												<div className="flex flex-wrap gap-2">
													{rec.skills.slice(0, 6).map((skill, i) => (
														<Badge key={i} variant="outline" className="text-xs">
															{skill}
														</Badge>
													))}
												</div>
											)}
										</div>

										<Link
											to="/dashboard/resources/programs/$programId"
											params={{ programId: rec.programId }}
											className="shrink-0"
										>
											<Button variant="outline" className="gap-2">
												<Trans>Details</Trans>
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

			{/* Certifications */}
			<CertificationsCard topPrograms={topPrograms} programs={programs} />
		</TabsContent>
	);
}

// ============================================================================
// Certifications Card Component
// ============================================================================

interface CertificationsCardProps {
	topPrograms: CareerMatch[];
	programs: ProgramData[];
}

function CertificationsCard({ topPrograms, programs }: CertificationsCardProps) {
	return (
		<Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<CertificateIcon className="size-5 text-primary" />
					<Trans>Available Certifications</Trans>
				</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
					{topPrograms.flatMap((match) => {
						const program = programs.find((p) => p.id === match.programId);
						return (program?.certifications || []).map((cert, i) => (
							<div key={`${match.programId}-${i}`} className="flex items-center gap-3 rounded-lg border bg-card p-3">
								<StarIcon className="size-5 text-amber-500" weight="fill" />
								<span className="font-medium text-sm">{cert}</span>
							</div>
						));
					})}
				</div>
			</CardContent>
		</Card>
	);
}

// ============================================================================
// Next Steps Tab
// ============================================================================

interface NextStepsTabProps {
	nextSteps: NextStep[];
}

function NextStepsTab({ nextSteps }: NextStepsTabProps) {
	return (
		<TabsContent value="next-steps" className="space-y-6">
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<PathIcon className="size-5 text-primary" />
						<Trans>Your Next Steps</Trans>
					</CardTitle>
					<CardDescription>
						<Trans>Follow this action plan to achieve your professional goals</Trans>
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="space-y-4">
						{nextSteps.map((step, index) => {
							const StepIcon = step.icon;
							const priorityColors = {
								high: "border-green-500 bg-green-500/10",
								medium: "border-amber-500 bg-amber-500/10",
								low: "border-gray-400 bg-gray-400/10",
							};

							return (
								<motion.div
									key={step.id}
									initial={false}
									animate={{ opacity: 1, x: 0 }}
									transition={{ delay: index * 0.1 }}
									className={cn("flex items-start gap-4 rounded-xl border-l-4 p-4", priorityColors[step.priority])}
								>
									<div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-card">
										<span className="font-bold text-lg text-primary">{index + 1}</span>
									</div>
									<div className="flex-1">
										<div className="mb-1 flex items-center gap-2">
											<StepIcon className="size-5 text-primary" />
											<h4 className="font-bold">{step.title}</h4>
											<Badge
												variant="outline"
												className={cn(
													"text-xs",
													step.priority === "high" && "border-green-500 text-green-600",
													step.priority === "medium" && "border-amber-500 text-amber-600",
												)}
											>
												{step.priority === "high" && <Trans>Priority</Trans>}
												{step.priority === "medium" && <Trans>Important</Trans>}
												{step.priority === "low" && <Trans>Recommended</Trans>}
											</Badge>
										</div>
										<p className="text-muted-foreground">{step.description}</p>
									</div>
									{step.link && (
										<Link to={step.link as string} className="shrink-0">
											<Button variant="outline" size="sm" className="gap-2">
												<Trans>Go there</Trans>
												<ArrowRightIcon className="size-4" />
											</Button>
										</Link>
									)}
								</motion.div>
							);
						})}
					</div>
				</CardContent>
			</Card>

			{/* Resources */}
			<ResourcesSection />

			{/* CTA */}
			<CallToActionCard />
		</TabsContent>
	);
}

// ============================================================================
// Resources Section Component
// ============================================================================

function ResourcesSection() {
	return (
		<div className="grid gap-6 md:grid-cols-2">
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2 text-lg">
						<BookOpenIcon className="size-5 text-primary" />
						<Trans>Useful Resources</Trans>
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-3">
					<Link to={"/dashboard/career" as string}>
						<Button variant="outline" className="w-full justify-start gap-2">
							<CompassIcon className="size-4" />
							<Trans>Complete Career Center</Trans>
						</Button>
					</Link>
					<Link to="/dashboard/interview/tips">
						<Button variant="outline" className="w-full justify-start gap-2">
							<LightbulbIcon className="size-4" />
							<Trans>Interview Tips</Trans>
						</Button>
					</Link>
					<Link to="/dashboard/resources">
						<Button variant="outline" className="w-full justify-start gap-2">
							<GraduationCapIcon className="size-4" />
							<Trans>All IMTA Programs</Trans>
						</Button>
					</Link>
				</CardContent>
			</Card>

			<Card className="border-primary/30 bg-gradient-to-br from-primary/10 to-transparent">
				<CardHeader>
					<CardTitle className="flex items-center gap-2 text-lg">
						<DownloadSimpleIcon className="size-5 text-primary" />
						<Trans>Save Your Results</Trans>
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<p className="text-muted-foreground text-sm">
						<Trans>Your results are automatically saved to your account. Come back anytime to review them.</Trans>
					</p>
					<div className="flex items-center gap-2 rounded-lg bg-green-500/10 p-3 text-green-700 dark:text-green-400">
						<CheckCircleIcon className="size-5" weight="fill" />
						<span className="font-medium text-sm">
							<Trans>Results saved to your account</Trans>
						</span>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}

// ============================================================================
// Call To Action Card Component
// ============================================================================

function CallToActionCard() {
	return (
		<Card className="border-2 border-primary/30 bg-gradient-to-br from-primary/10 to-transparent">
			<CardContent className="flex flex-col items-center py-8 text-center">
				<div className="mb-4 flex size-16 items-center justify-center rounded-full bg-primary/20">
					<RocketLaunchIcon className="size-8 text-primary" weight="duotone" />
				</div>
				<h3 className="mb-2 font-bold text-2xl">
					<Trans>Ready to Start?</Trans>
				</h3>
				<p className="mb-6 max-w-md text-muted-foreground">
					<Trans>Your professional future starts now. Explore IMTA programs and get started!</Trans>
				</p>
				<div className="flex flex-wrap justify-center gap-4">
					<Link to="/dashboard/resources">
						<Button size="lg" className="gap-2">
							<GraduationCapIcon className="size-5" />
							<Trans>Explore Programs</Trans>
						</Button>
					</Link>
					<Link to="/dashboard/resumes">
						<Button size="lg" variant="outline" className="gap-2">
							<ClipboardTextIcon className="size-5" />
							<Trans>Create My Resume</Trans>
						</Button>
					</Link>
				</div>
			</CardContent>
		</Card>
	);
}

// ============================================================================
// Careers Tab Content
// ============================================================================

interface CareersTabProps {
	topPrograms: CareerMatch[];
	careerMatches: CareerMatch[];
	programs: ProgramData[];
}

function CareersTab({ topPrograms, careerMatches, programs }: CareersTabProps) {
	return (
		<TabsContent value="careers" className="space-y-6">
			<div className="grid gap-6 lg:grid-cols-3">
				{topPrograms.map((match, index) => (
					<CareerMatchCard key={match.programId} match={match} index={index} programs={programs} />
				))}
			</div>
			<AllMatchesGrid careerMatches={careerMatches} />
		</TabsContent>
	);
}

// ============================================================================
// Results Section Component (wraps all tabs)
// ============================================================================

interface ResultsSectionProps {
	activeResultsTab: string;
	setActiveResultsTab: (value: string) => void;
	topPrograms: CareerMatch[];
	careerMatches: CareerMatch[];
	programs: ProgramData[];
	radarData: RadarDataPoint[] | null;
	personalityProfile: PersonalityProfile | null;
	trainingRecommendations: TrainingRecommendation[];
	nextSteps: NextStep[];
	resetQuiz: () => void;
	isResetting: boolean;
}

export function ResultsSection({
	activeResultsTab,
	setActiveResultsTab,
	topPrograms,
	careerMatches,
	programs,
	radarData,
	personalityProfile,
	trainingRecommendations,
	nextSteps,
	resetQuiz,
	isResetting,
}: ResultsSectionProps) {
	return (
		<motion.div initial={false} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="space-y-8">
			{/* Congratulations Banner */}
			<CongratulationsBanner resetQuiz={resetQuiz} isResetting={isResetting} />

			{/* Results Tabs */}
			<Tabs value={activeResultsTab} onValueChange={setActiveResultsTab} className="space-y-6">
				<ResultsTabsList />
				<CareersTab topPrograms={topPrograms} careerMatches={careerMatches} programs={programs} />
				<ProfileTab radarData={radarData} personalityProfile={personalityProfile} />
				<TrainingTab trainingRecommendations={trainingRecommendations} topPrograms={topPrograms} programs={programs} />
				<NextStepsTab nextSteps={nextSteps} />
			</Tabs>
		</motion.div>
	);
}

// ============================================================================
// Results Tabs List Component
// ============================================================================

function ResultsTabsList() {
	return (
		<TabsList className="flex h-auto flex-wrap gap-2 bg-transparent p-0">
			{[
				{ value: "careers", icon: BriefcaseIcon, label: t`Careers` },
				{ value: "profile", icon: UserIcon, label: t`Profile` },
				{ value: "training", icon: GraduationCapIcon, label: t`Programs` },
				{ value: "next-steps", icon: PathIcon, label: t`Next Steps` },
			].map((tab) => (
				<TabsTrigger
					key={tab.value}
					value={tab.value}
					className="gap-2 rounded-full border border-transparent bg-muted/50 px-6 py-2.5 data-[state=active]:border-primary/30 data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
				>
					<tab.icon className="size-4" />
					{tab.label}
				</TabsTrigger>
			))}
		</TabsList>
	);
}

// ============================================================================
// Quiz Section Component (progress + question card)
// ============================================================================

interface QuizSectionProps {
	currentQ: QuizQuestion;
	currentAnswer: QuizAnswer | undefined;
	currentQuestion: number;
	totalQuestions: number;
	progress: number;
	currentScaleValue: number;
	isAnimating: boolean;
	isResetting: boolean;
	categoryLabels: Record<string, string>;
	handleAnswer: (optionId: string) => void;
	handleScaleAnswer: (value: number[]) => void;
	goToPrevious: () => void;
	goToNext: () => void;
	resetQuiz: () => void;
}

export function QuizSection({
	currentQ,
	currentAnswer,
	currentQuestion,
	totalQuestions,
	progress,
	currentScaleValue,
	isAnimating,
	isResetting,
	categoryLabels,
	handleAnswer,
	handleScaleAnswer,
	goToPrevious,
	goToNext,
	resetQuiz,
}: QuizSectionProps) {
	return (
		<div className="space-y-6">
			<ProgressSection
				currentQ={currentQ}
				currentQuestion={currentQuestion}
				totalQuestions={totalQuestions}
				progress={progress}
				categoryLabels={categoryLabels}
			/>
			<QuestionCard
				currentQ={currentQ}
				currentAnswer={currentAnswer}
				currentQuestion={currentQuestion}
				totalQuestions={totalQuestions}
				currentScaleValue={currentScaleValue}
				isAnimating={isAnimating}
				isResetting={isResetting}
				handleAnswer={handleAnswer}
				handleScaleAnswer={handleScaleAnswer}
				goToPrevious={goToPrevious}
				goToNext={goToNext}
				resetQuiz={resetQuiz}
			/>
		</div>
	);
}
