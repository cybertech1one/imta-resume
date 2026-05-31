import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import {
	ArrowRightIcon,
	BriefcaseIcon,
	BuildingsIcon,
	CaretLeftIcon,
	ChartLineUpIcon,
	ChatCircleDotsIcon,
	CheckCircleIcon,
	ClockIcon,
	CompassIcon,
	CurrencyCircleDollarIcon,
	FirstAidKitIcon,
	GearIcon,
	GraduationCapIcon,
	HardHatIcon,
	LightbulbIcon,
	MapPinIcon,
	MedalIcon,
	PathIcon,
	RocketLaunchIcon,
	SparkleIcon,
	StarIcon,
	TargetIcon,
	TrendUpIcon,
	TrophyIcon,
	UserIcon,
	WarningCircleIcon,
} from "@phosphor-icons/react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { WikiLinkCard } from "@/components/shared/wiki-link-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { orpc } from "@/integrations/orpc/client";
import { cn } from "@/utils/style";
import { fieldColors, fieldIcons } from "./career-index-config";
import type {
	CareerMatch,
	CareerStage,
	Employer,
	MarketInsight,
	ProgramData,
	QuizAnswer,
	QuizQuestion,
} from "./career-index-types";

// Loading Skeleton Component
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

// Error State Component
export function ErrorState({ onRetry }: { onRetry: () => void }) {
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
				<Button onClick={onRetry}>
					<Trans>Retry</Trans>
				</Button>
			</CardContent>
		</Card>
	);
}

// Hero Section Component
export function HeroSection() {
	return (
		<>
			<motion.section
				className="relative mb-8 overflow-hidden rounded-3xl border border-emerald-500/20 p-8 md:p-12"
				style={{
					background:
						"linear-gradient(135deg, oklch(0.7 0.15 160 / 0.12) 0%, oklch(0.65 0.12 180 / 0.1) 50%, oklch(0.7 0.1 200 / 0.08) 100%)",
				}}
				initial={false}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.6, ease: "easeOut" }}
				aria-labelledby="career-hero-heading"
			>
				{/* Animated background elements - career-specific emerald/teal theme */}
				<div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
					<motion.div
						className="absolute -top-32 -right-32 size-96 rounded-full bg-gradient-to-br from-emerald-500/20 to-teal-500/10 blur-3xl"
						animate={{
							scale: [1, 1.2, 1],
							rotate: [0, 10, 0],
							opacity: [0.5, 0.3, 0.5],
						}}
						transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
					/>
					<motion.div
						className="absolute -bottom-32 -left-32 size-96 rounded-full bg-gradient-to-tr from-amber-500/15 to-emerald-500/10 blur-3xl"
						animate={{
							scale: [1.2, 1, 1.2],
							rotate: [0, -10, 0],
							opacity: [0.3, 0.5, 0.3],
						}}
						transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
					/>
					<motion.div
						className="absolute top-1/2 left-1/2 size-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/5 blur-3xl"
						animate={{
							scale: [1, 1.3, 1],
						}}
						transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
					/>
				</div>

				<div className="relative z-10">
					<motion.div
						className="mb-3 flex items-center gap-2"
						initial={false}
						animate={{ opacity: 1, x: 0 }}
						transition={{ delay: 0.2 }}
					>
						<CompassIcon className="size-5 text-emerald-600 dark:text-emerald-400" weight="fill" aria-hidden="true" />
						<span className="font-semibold text-emerald-700 text-sm uppercase tracking-wider dark:text-emerald-400">
							<Trans>IMTA Career Guidance</Trans>
						</span>
					</motion.div>

					<motion.h2
						id="career-hero-heading"
						className="mb-4 bg-gradient-to-r from-emerald-700 via-teal-600 to-emerald-700 bg-clip-text font-bold text-3xl text-transparent tracking-tight md:text-4xl lg:text-5xl dark:from-emerald-400 dark:via-teal-300 dark:to-emerald-400"
						initial={false}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.3 }}
					>
						<Trans>Professional Career Guidance</Trans>
					</motion.h2>

					<motion.p
						className="mb-8 max-w-2xl text-lg text-muted-foreground"
						initial={false}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.4 }}
					>
						<Trans>
							Discover your ideal path through our personalized assessment. Analyze your skills, explore market
							opportunities, and chart your career path.
						</Trans>
					</motion.p>

					{/* Quick Stats */}
					<motion.div
						className="flex flex-wrap items-center gap-6"
						initial={false}
						animate={{ opacity: 1 }}
						transition={{ delay: 0.5 }}
						role="list"
						aria-label={t`Quick stats`}
					>
						<div className="flex items-center gap-2" role="listitem">
							<div
								className="flex size-10 items-center justify-center rounded-full bg-emerald-500/10"
								aria-hidden="true"
							>
								<ClockIcon className="size-5 text-emerald-600" weight="duotone" />
							</div>
							<div>
								<p className="font-bold text-xl" aria-label={t`5 minutes quick quiz`}>
									5 min
								</p>
								<p className="text-muted-foreground text-sm">
									<Trans>Quick quiz</Trans>
								</p>
							</div>
						</div>
						<div className="flex items-center gap-2" role="listitem">
							<div className="flex size-10 items-center justify-center rounded-full bg-amber-500/10" aria-hidden="true">
								<TargetIcon className="size-5 text-amber-500" weight="duotone" />
							</div>
							<div>
								<p className="font-bold text-xl" aria-label={t`11 or more programs`}>
									11+
								</p>
								<p className="text-muted-foreground text-sm">
									<Trans>Programs</Trans>
								</p>
							</div>
						</div>
						<div className="flex items-center gap-2" role="listitem">
							<div className="flex size-10 items-center justify-center rounded-full bg-green-500/10" aria-hidden="true">
								<TrophyIcon className="size-5 text-green-500" weight="duotone" />
							</div>
							<div>
								<p className="font-bold text-xl" aria-label={t`94 percent precision`}>
									94%
								</p>
								<p className="text-muted-foreground text-sm">
									<Trans>Precision</Trans>
								</p>
							</div>
						</div>
					</motion.div>
				</div>
			</motion.section>

			<div className="mb-8 space-y-3">
				<WikiLinkCard
					title={t`Career Transitions Guide`}
					description={t`How to successfully navigate career changes and pivot to new fields`}
					wikiPath="/dashboard/wiki/career-transitions"
				/>
				<WikiLinkCard
					title={t`Job Search Strategies`}
					description={t`Proven techniques to find and land your ideal role`}
					wikiPath="/dashboard/wiki/job-search-strategies"
				/>
			</div>
		</>
	);
}

// Empty Quiz State
export function EmptyQuizState() {
	return (
		<Card className="border-dashed">
			<CardContent className="flex flex-col items-center py-12 text-center">
				<CompassIcon className="mb-4 size-12 text-muted-foreground/50" />
				<h3 className="mb-2 font-semibold text-lg">
					<Trans>Loading questions</Trans>
				</h3>
				<p className="text-muted-foreground">
					<Trans>
						Quiz questions are not yet available. Please contact the administrator to configure the assessment
						questions.
					</Trans>
				</p>
			</CardContent>
		</Card>
	);
}

// Quiz Progress Bar
export function QuizProgressBar({
	currentQuestion,
	totalQuestions,
	progress,
}: {
	currentQuestion: number;
	totalQuestions: number;
	progress: number;
}) {
	return (
		<div className="space-y-4" role="region" aria-label={t`Quiz progress`}>
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-2">
					<Badge variant="outline" className="gap-1 text-sm">
						<SparkleIcon className="size-4" aria-hidden="true" />
						<span aria-live="polite">
							<Trans>
								Question {currentQuestion + 1}/{totalQuestions}
							</Trans>
						</span>
					</Badge>
				</div>
				<span className="font-medium text-muted-foreground text-sm" aria-live="polite">
					<Trans>{Math.round(progress)}% complete</Trans>
				</span>
			</div>
			<Progress value={progress} className="h-2" aria-label={t`Quiz progress: ${Math.round(progress)}% complete`} />
		</div>
	);
}

// Quiz Question Card
export function QuizQuestionCard({
	currentQ,
	currentAnswer,
	isAnimating,
	isResetting,
	currentQuestion,
	handleAnswer,
	goToPrevious,
	resetQuiz,
}: {
	currentQ: QuizQuestion;
	currentAnswer: QuizAnswer | undefined;
	isAnimating: boolean;
	isResetting: boolean;
	currentQuestion: number;
	handleAnswer: (optionId: string) => void;
	goToPrevious: () => void;
	resetQuiz: () => void;
}) {
	return (
		<AnimatePresence mode="wait">
			<motion.div
				key={currentQ.id}
				initial={{ opacity: 0, x: 50 }}
				animate={{ opacity: 1, x: 0 }}
				exit={{ opacity: 0, x: -50 }}
				transition={{ duration: 0.3 }}
			>
				<Card
					className="border-2 border-primary/20 bg-gradient-to-br from-card to-primary/5"
					role="form"
					aria-labelledby="quiz-question-title"
				>
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
						<CardTitle id="quiz-question-title" className="text-2xl leading-relaxed">
							{currentQ.question}
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-3" role="radiogroup" aria-labelledby="quiz-question-title">
						{currentQ.options.map((option, index) => {
							const isSelected = currentAnswer?.optionId === option.id;
							const OptionIcon = option.icon;

							return (
								<motion.button
									key={option.id}
									type="button"
									role="radio"
									aria-checked={isSelected}
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ delay: index * 0.1 }}
									onClick={() => handleAnswer(option.id)}
									disabled={isAnimating}
									className={cn(
										"flex w-full items-center gap-4 rounded-xl border-2 p-4 text-left transition-all duration-200 focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2",
										isSelected
											? "border-primary bg-primary/10 shadow-lg shadow-primary/20"
											: "border-border bg-card hover:border-primary/50 hover:bg-primary/5",
										isAnimating && "pointer-events-none opacity-50",
									)}
									aria-label={option.text}
								>
									<div
										className={cn(
											"flex size-12 shrink-0 items-center justify-center rounded-xl transition-colors",
											isSelected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
										)}
										aria-hidden="true"
									>
										<OptionIcon className="size-6" weight={isSelected ? "fill" : "regular"} />
									</div>
									<span className="font-medium text-lg">{option.text}</span>
									{isSelected && (
										<CheckCircleIcon className="ml-auto size-6 text-primary" weight="fill" aria-hidden="true" />
									)}
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
							aria-label={t`Go to previous question`}
						>
							<CaretLeftIcon className="size-4" aria-hidden="true" />
							<Trans>Previous</Trans>
						</Button>
						<Button
							variant="ghost"
							onClick={resetQuiz}
							disabled={isResetting}
							className="text-muted-foreground"
							aria-label={t`Restart the quiz`}
						>
							<Trans>Restart</Trans>
						</Button>
					</CardFooter>
				</Card>
			</motion.div>
		</AnimatePresence>
	);
}

// Congratulations Banner
export function CongratulationsBanner({ resetQuiz, isResetting }: { resetQuiz: () => void; isResetting: boolean }) {
	return (
		<Card
			className="border-2 border-green-500/30 bg-gradient-to-br from-green-500/10 to-emerald-500/5"
			role="alert"
			aria-live="polite"
		>
			<CardContent className="flex flex-col items-center py-8 text-center md:flex-row md:py-6 md:text-left">
				<div
					className="mb-4 flex size-20 items-center justify-center rounded-full bg-green-500/20 md:mr-6 md:mb-0"
					aria-hidden="true"
				>
					<TrophyIcon className="size-10 text-green-500" weight="fill" />
				</div>
				<div className="flex-1">
					<h2 className="mb-2 font-bold text-2xl text-green-700 dark:text-green-400">
						<Trans>Assessment Complete!</Trans>
					</h2>
					<p className="text-muted-foreground">
						<Trans>Discover your personalized results and the programs that best match your profile.</Trans>
					</p>
				</div>
				<Button
					onClick={resetQuiz}
					variant="outline"
					disabled={isResetting}
					className="mt-4 md:mt-0"
					aria-label={t`Retake the assessment`}
				>
					<Trans>Retake the test</Trans>
				</Button>
			</CardContent>
		</Card>
	);
}

// Personality Profile Card with Radar Chart
export function PersonalityProfileCard({
	radarData,
}: {
	radarData: { key: string; label: string; value: number }[] | null;
}) {
	return (
		<Card className="overflow-hidden">
			<CardHeader className="border-b bg-gradient-to-r from-primary/5 to-transparent">
				<CardTitle id="personality-profile-heading" className="flex items-center gap-2 text-xl">
					<UserIcon className="size-5 text-primary" weight="duotone" aria-hidden="true" />
					<Trans>Your Personality Profile</Trans>
				</CardTitle>
				<CardDescription>
					<Trans>Based on your answers, here are your dominant traits</Trans>
				</CardDescription>
			</CardHeader>
			<CardContent className="p-6" aria-labelledby="personality-profile-heading">
				{/* Visual Personality Radar Chart */}
				<div
					className="relative mx-auto mb-6 aspect-square max-w-xs"
					role="img"
					aria-label={t`Personality radar chart showing your traits`}
				>
					<svg viewBox="0 0 200 200" className="size-full" aria-hidden="true">
						{/* Pentagon background layers */}
						<polygon
							points="100,15 185,65 165,165 35,165 15,65"
							fill="none"
							stroke="currentColor"
							strokeOpacity="0.1"
							strokeWidth="1"
						/>
						<polygon
							points="100,40 160,75 145,145 55,145 40,75"
							fill="none"
							stroke="currentColor"
							strokeOpacity="0.1"
							strokeWidth="1"
						/>
						<polygon
							points="100,65 135,85 125,125 75,125 65,85"
							fill="none"
							stroke="currentColor"
							strokeOpacity="0.1"
							strokeWidth="1"
						/>

						{/* Data polygon */}
						{radarData && (
							<motion.polygon
								initial={false}
								animate={{ opacity: 1, scale: 1 }}
								transition={{ duration: 0.8, delay: 0.3 }}
								points={radarData
									.map((trait, i) => {
										const angle = (i * 72 - 90) * (Math.PI / 180);
										const radius = 15 + (trait.value / 100) * 70;
										const x = 100 + radius * Math.cos(angle);
										const y = 100 + radius * Math.sin(angle);
										return `${x},${y}`;
									})
									.join(" ")}
								fill="oklch(0.7 0.15 250 / 0.3)"
								stroke="oklch(0.6 0.2 250)"
								strokeWidth="2"
							/>
						)}

						{/* Labels positioned outside the pentagon */}
						{radarData?.map((trait, i) => {
							const angle = (i * 72 - 90) * (Math.PI / 180);
							const labelRadius = 95;
							const x = 100 + labelRadius * Math.cos(angle);
							const y = 100 + labelRadius * Math.sin(angle);
							return (
								<text
									key={trait.key}
									x={x}
									y={y}
									textAnchor="middle"
									dominantBaseline="middle"
									className="fill-current font-medium text-[7px]"
								>
									{trait.label}
								</text>
							);
						})}
					</svg>
				</div>

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
	);
}

// Top Programs Recommendations Card
export function TopProgramsCard({ topPrograms, programs }: { topPrograms: CareerMatch[]; programs: ProgramData[] }) {
	return (
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
						const MatchIcon = match.icon;
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
											{(program?.description || program?.descriptionFr)?.substring(0, 100)}...
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
	);
}

// All Career Matches Grid
export function AllMatchesCard({ careerMatches }: { careerMatches: CareerMatch[] }) {
	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<GraduationCapIcon className="size-5 text-primary" weight="duotone" />
					<Trans>All Matching Programs</Trans>
				</CardTitle>
				<CardDescription>
					<Trans>Explore all programs ranked by compatibility</Trans>
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
											<div className="flex-1">
												<h4 className="font-medium">{match.name}</h4>
												<p className="text-muted-foreground text-xs capitalize">
													{match.field === "healthcare" && t`Health`}
													{match.field === "industrial" && t`Industry`}
													{match.field === "hse" && t`HSE`}
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

// Market Trends Section
export function MarketTrendsSection({ marketInsights }: { marketInsights: MarketInsight[] }) {
	return (
		<div>
			<h3 className="mb-6 flex items-center gap-2 font-semibold text-2xl">
				<TrendUpIcon className="size-6 text-primary" weight="duotone" />
				<Trans>Job Market Trends</Trans>
			</h3>
			<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
				{marketInsights.length === 0 ? (
					<div className="col-span-4 py-8 text-center">
						<ChartLineUpIcon className="mx-auto mb-3 size-10 text-muted-foreground/40" />
						<p className="text-muted-foreground text-sm">
							<Trans>No market data available</Trans>
						</p>
					</div>
				) : (
					marketInsights.map((insight, index) => {
						const InsightIcon = insight.icon;
						return (
							<motion.div
								key={insight.id}
								initial={false}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: index * 0.1 }}
							>
								<Card className="h-full transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
									<CardContent className="p-6">
										<div className="mb-4 flex items-center justify-between">
											<div
												className={cn(
													"flex size-12 items-center justify-center rounded-xl",
													insight.trend === "up" && "bg-green-100 text-green-600 dark:bg-green-900/30",
													insight.trend === "down" && "bg-red-100 text-red-600 dark:bg-red-900/30",
													insight.trend === "stable" && "bg-blue-100 text-blue-600 dark:bg-blue-900/30",
												)}
											>
												<InsightIcon className="size-6" weight="duotone" />
											</div>
											{insight.trend === "up" && (
												<Badge className="gap-1 bg-green-500">
													<TrendUpIcon className="size-3" />
													<Trans>Rising</Trans>
												</Badge>
											)}
											{insight.trend === "stable" && (
												<Badge variant="secondary" className="gap-1">
													<Trans>Stable</Trans>
												</Badge>
											)}
										</div>
										<h4 className="mb-1 font-medium text-muted-foreground">{insight.title}</h4>
										<p className="mb-2 font-bold text-3xl">{insight.value}</p>
										<p className="text-muted-foreground text-sm">{insight.description}</p>
									</CardContent>
								</Card>
							</motion.div>
						);
					})
				)}
			</div>
		</div>
	);
}

// Salary Comparison Card
export function SalaryComparisonCard() {
	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<CurrencyCircleDollarIcon className="size-5 text-primary" weight="duotone" />
					<Trans>Salary Comparison by Field</Trans>
				</CardTitle>
				<CardDescription>
					<Trans>Average monthly salaries for beginners in Morocco</Trans>
				</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="space-y-6">
					{[
						{
							field: t`Health`,
							min: 3500,
							max: 7000,
							avg: 5000,
							color: "bg-red-500",
							icon: FirstAidKitIcon,
						},
						{
							field: t`Industry`,
							min: 4000,
							max: 9000,
							avg: 6000,
							color: "bg-blue-500",
							icon: GearIcon,
						},
						{ field: t`HSE`, min: 5000, max: 10000, avg: 7500, color: "bg-amber-500", icon: HardHatIcon },
					].map((sector, index) => {
						const SectorIcon = sector.icon;
						const percentage = ((sector.avg - 3000) / 7000) * 100;

						return (
							<motion.div
								key={sector.field}
								initial={false}
								animate={{ opacity: 1, x: 0 }}
								transition={{ delay: index * 0.1 }}
								className="space-y-2"
							>
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-2">
										<SectorIcon className="size-5 text-muted-foreground" />
										<span className="font-medium">{sector.field}</span>
									</div>
									<span className="font-bold">
										{sector.min.toLocaleString("fr-FR")} - {sector.max.toLocaleString("fr-FR")} DH
									</span>
								</div>
								<div className="relative h-3 overflow-hidden rounded-full bg-muted">
									<motion.div
										initial={{ width: 0 }}
										animate={{ width: `${percentage}%` }}
										transition={{ duration: 0.8, delay: 0.3 + index * 0.1 }}
										className={cn("h-full rounded-full", sector.color)}
									/>
									<div className="absolute top-0 h-full w-1 bg-white shadow-sm" style={{ left: `${percentage}%` }} />
								</div>
								<p className="text-muted-foreground text-sm">
									<Trans>Average:</Trans>{" "}
									<span className="font-medium">
										{sector.avg.toLocaleString("fr-FR")} DH/<Trans>month</Trans>
									</span>
								</p>
							</motion.div>
						);
					})}
				</div>
			</CardContent>
		</Card>
	);
}

// Top Employers Card
export function TopEmployersCard({ topEmployers }: { topEmployers: Employer[] }) {
	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<BuildingsIcon className="size-5 text-primary" weight="duotone" />
					<Trans>Top Employers in Morocco</Trans>
				</CardTitle>
				<CardDescription>
					<Trans>Partner companies that hire our graduates</Trans>
				</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
					{topEmployers.length === 0 ? (
						<div className="col-span-3 py-8 text-center">
							<BuildingsIcon className="mx-auto mb-3 size-10 text-muted-foreground/40" />
							<p className="text-muted-foreground text-sm">
								<Trans>No employers registered</Trans>
							</p>
						</div>
					) : (
						topEmployers.map((employer, index) => (
							<motion.div
								key={employer.id}
								initial={false}
								animate={{ opacity: 1, scale: 1 }}
								transition={{ delay: index * 0.05 }}
							>
								<Card className="group h-full overflow-hidden border transition-all duration-300 hover:-translate-y-1 hover:border-emerald-500/30 hover:shadow-lg">
									<div className="h-1.5 bg-gradient-to-r from-emerald-500/60 via-teal-500/40 to-emerald-500/60" />
									<CardContent className="p-5">
										<div className="mb-4 flex items-start gap-3">
											<div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-slate-100 to-slate-50 font-bold text-lg text-slate-600 shadow-sm dark:from-slate-800 dark:to-slate-700 dark:text-slate-300">
												{employer.name.charAt(0)}
											</div>
											<div className="min-w-0 flex-1">
												<h4 className="font-bold leading-tight">{employer.name}</h4>
												<p className="text-muted-foreground text-sm">{employer.sector}</p>
											</div>
										</div>
										<div className="flex items-center justify-between">
											<div className="flex items-center gap-1.5 text-muted-foreground text-sm">
												<MapPinIcon className="size-4" />
												<span>{employer.location}</span>
											</div>
											<Badge
												variant="secondary"
												className="gap-1 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
											>
												<BriefcaseIcon className="size-3" />
												{employer.openPositions}
											</Badge>
										</div>
									</CardContent>
								</Card>
							</motion.div>
						))
					)}
				</div>
			</CardContent>
		</Card>
	);
}

// Growth Projections Card
export function GrowthProjectionsCard() {
	return (
		<Card className="overflow-hidden">
			<CardHeader className="bg-gradient-to-r from-green-500/10 to-transparent">
				<CardTitle className="flex items-center gap-2">
					<RocketLaunchIcon className="size-5 text-green-500" weight="duotone" />
					<Trans>Growth Projections 2024-2028</Trans>
				</CardTitle>
				<CardDescription>
					<Trans>Expected demand evolution by sector</Trans>
				</CardDescription>
			</CardHeader>
			<CardContent className="p-6">
				<div className="grid gap-6 md:grid-cols-3">
					{[
						{
							sector: t`Health`,
							growth: "+45%",
							jobs: "15,000+",
							description: t`Healthcare infrastructure expansion`,
							icon: FirstAidKitIcon,
							color: "text-red-500",
						},
						{
							sector: t`Industry`,
							growth: "+35%",
							jobs: "25,000+",
							description: t`Accelerated industrial development`,
							icon: GearIcon,
							color: "text-blue-500",
						},
						{
							sector: t`HSE`,
							growth: "+55%",
							jobs: "8,000+",
							description: t`Strengthening safety standards`,
							icon: HardHatIcon,
							color: "text-amber-500",
						},
					].map((proj, index) => {
						const ProjIcon = proj.icon;
						return (
							<motion.div
								key={proj.sector}
								initial={false}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: index * 0.15 }}
								className="rounded-xl border bg-gradient-to-br from-card to-muted/30 p-6 text-center"
							>
								<div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-muted">
									<ProjIcon className={cn("size-8", proj.color)} weight="duotone" />
								</div>
								<h4 className="mb-1 font-bold text-xl">{proj.sector}</h4>
								<p className="mb-2 font-bold text-3xl text-green-500">{proj.growth}</p>
								<p className="mb-1 font-medium">
									{proj.jobs} <Trans>jobs</Trans>
								</p>
								<p className="text-muted-foreground text-sm">{proj.description}</p>
							</motion.div>
						);
					})}
				</div>
			</CardContent>
		</Card>
	);
}

// Career Pathway Selector
export function PathwaySelector({
	selectedPathway,
	onSelect,
}: {
	selectedPathway: "healthcare" | "industrial" | "hse";
	onSelect: (path: "healthcare" | "industrial" | "hse") => void;
}) {
	return (
		<div>
			<h3 className="mb-2 font-semibold text-2xl">
				<Trans>Career Path Visualization</Trans>
			</h3>
			<p className="mb-6 text-muted-foreground">
				<Trans>Explore the different progression stages in your field, from beginner to leader.</Trans>
			</p>

			<div className="mb-8 flex flex-wrap gap-2">
				{(["healthcare", "industrial", "hse"] as const).map((path) => {
					const PathIcon = fieldIcons[path];
					return (
						<Button
							key={path}
							variant={selectedPathway === path ? "default" : "outline"}
							className={cn("gap-2 rounded-full", selectedPathway === path && "shadow-md")}
							onClick={() => onSelect(path)}
							aria-pressed={selectedPathway === path}
						>
							<PathIcon className="size-4" aria-hidden="true" />
							{path === "healthcare" && t`Health`}
							{path === "industrial" && t`Industry`}
							{path === "hse" && t`HSE`}
						</Button>
					);
				})}
			</div>
		</div>
	);
}

// Career Timeline Card
export function CareerTimelineCard({
	selectedPathway,
	careerPathwayStages,
}: {
	selectedPathway: "healthcare" | "industrial" | "hse";
	careerPathwayStages: CareerStage[];
}) {
	return (
		<Card className="overflow-hidden">
			<CardHeader className="border-b bg-gradient-to-r from-primary/5 to-transparent">
				<CardTitle className="flex items-center gap-2">
					<PathIcon className="size-5 text-primary" weight="duotone" />
					<Trans>Career Progression</Trans>
					<Badge className={fieldColors[selectedPathway]}>
						{selectedPathway === "healthcare" && t`Health`}
						{selectedPathway === "industrial" && t`Industry`}
						{selectedPathway === "hse" && t`HSE`}
					</Badge>
				</CardTitle>
			</CardHeader>
			<CardContent className="p-8">
				<div className="relative">
					{/* Timeline Line */}
					<div className="absolute top-8 right-0 left-0 hidden h-1 bg-gradient-to-r from-primary/20 via-primary to-primary/20 md:block" />

					{/* Stages */}
					<div className="grid gap-8 md:grid-cols-4">
						{careerPathwayStages.length > 0 ? (
							careerPathwayStages.map((stage, index) => (
								<motion.div
									key={stage.id}
									initial={false}
									animate={{ opacity: 1, y: 0 }}
									transition={{ delay: index * 0.15 }}
									className="relative"
								>
									{/* Timeline Node */}
									<div className="relative z-10 mb-4 hidden md:flex md:justify-center">
										<motion.div
											className={cn(
												"flex size-16 items-center justify-center rounded-full border-4 border-background shadow-lg",
												index === 0 && "bg-green-500",
												index === 1 && "bg-blue-500",
												index === 2 && "bg-purple-500",
												index === 3 && "bg-amber-500",
											)}
											whileHover={{ scale: 1.1 }}
											transition={{ type: "spring", stiffness: 300 }}
										>
											{index === 0 && <RocketLaunchIcon className="size-7 text-white" weight="fill" />}
											{index === 1 && <TrendUpIcon className="size-7 text-white" weight="fill" />}
											{index === 2 && <StarIcon className="size-7 text-white" weight="fill" />}
											{index === 3 && <TrophyIcon className="size-7 text-white" weight="fill" />}
										</motion.div>
									</div>

									{/* Stage Card */}
									<Card
										className={cn(
											"h-full transition-all duration-300 hover:-translate-y-2 hover:shadow-xl",
											index === 0 && "border-green-500/30 hover:border-green-500",
											index === 1 && "border-blue-500/30 hover:border-blue-500",
											index === 2 && "border-purple-500/30 hover:border-purple-500",
											index === 3 && "border-amber-500/30 hover:border-amber-500",
										)}
									>
										<CardHeader className="pb-2">
											<div className="flex items-center justify-between">
												<Badge variant="outline">{stage.years}</Badge>
												<span
													className={cn(
														"font-bold text-sm",
														index === 0 && "text-green-500",
														index === 1 && "text-blue-500",
														index === 2 && "text-purple-500",
														index === 3 && "text-amber-500",
													)}
												>
													{stage.salary}
												</span>
											</div>
											<CardTitle className="text-lg">{stage.title}</CardTitle>
										</CardHeader>
										<CardContent className="space-y-3">
											<p className="text-muted-foreground text-sm">{stage.description}</p>
											<div className="flex flex-wrap gap-1">
												{stage.skills.map((skill, i) => (
													<Badge key={i} variant="secondary" className="text-xs">
														{skill}
													</Badge>
												))}
											</div>
										</CardContent>
									</Card>
								</motion.div>
							))
						) : (
							<div className="col-span-4 py-12 text-center">
								<CompassIcon className="mx-auto mb-4 size-12 text-muted-foreground/50" />
								<p className="text-muted-foreground">
									<Trans>
										No career path data available for this field. Contact the administrator to configure career roles.
									</Trans>
								</p>
							</div>
						)}
					</div>
				</div>
			</CardContent>
		</Card>
	);
}

// Call to Action Section
export function CallToActionCard({
	isResetting,
	resetQuiz,
	setActiveTab,
}: {
	isResetting: boolean;
	resetQuiz: () => void;
	setActiveTab: (tab: string) => void;
}) {
	return (
		<Card className="border-2 border-primary/30 bg-gradient-to-br from-primary/10 to-transparent">
			<CardContent className="flex flex-col items-center py-8 text-center">
				<div className="mb-4 flex size-16 items-center justify-center rounded-full bg-primary/20">
					<CompassIcon className="size-8 text-primary" weight="duotone" />
				</div>
				<h3 className="mb-2 font-bold text-2xl">
					<Trans>Ready to Start Your Journey?</Trans>
				</h3>
				<p className="mb-6 max-w-md text-muted-foreground">
					<Trans>Explore our training programs and take the first step toward your dream career.</Trans>
				</p>
				<div className="flex flex-wrap justify-center gap-4">
					<Link to="/dashboard/resources">
						<Button size="lg" className="gap-2">
							<GraduationCapIcon className="size-5" />
							<Trans>Explore Programs</Trans>
						</Button>
					</Link>
					<Button
						size="lg"
						variant="outline"
						className="gap-2"
						disabled={isResetting}
						onClick={() => {
							resetQuiz();
							setActiveTab("assessment");
						}}
					>
						<ClockIcon className="size-5" />
						<Trans>Retake Assessment</Trans>
					</Button>
				</div>
			</CardContent>
		</Card>
	);
}

// AI Career Tools Section
const AI_CAREER_TOOLS = [
	{
		id: "skill-gap",
		icon: TargetIcon,
		gradient: "from-emerald-500/15 via-emerald-400/10 to-teal-500/5",
		borderColor: "border-emerald-500/30",
		iconBg: "bg-emerald-500/20",
		iconColor: "text-emerald-600 dark:text-emerald-400",
		accentColor: "text-emerald-600 dark:text-emerald-400",
	},
	{
		id: "career-paths",
		icon: CompassIcon,
		gradient: "from-blue-500/15 via-blue-400/10 to-indigo-500/5",
		borderColor: "border-blue-500/30",
		iconBg: "bg-blue-500/20",
		iconColor: "text-blue-600 dark:text-blue-400",
		accentColor: "text-blue-600 dark:text-blue-400",
	},
	{
		id: "career-coach",
		icon: ChatCircleDotsIcon,
		gradient: "from-amber-500/15 via-amber-400/10 to-orange-500/5",
		borderColor: "border-amber-500/30",
		iconBg: "bg-amber-500/20",
		iconColor: "text-amber-600 dark:text-amber-400",
		accentColor: "text-amber-600 dark:text-amber-400",
	},
] as const;

// ---- AI Tool Dialogs ----

interface SkillGapResult {
	missingSkills: Array<{ skill: string; priority: string; learningTime: string }>;
	matchPercentage: number;
	recommendations: string[];
	strengths: string[];
}

export function SkillGapDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
	const [targetRole, setTargetRole] = useState("");
	const [field, setField] = useState("industrial");
	const [skills, setSkills] = useState("");
	const [result, setResult] = useState<SkillGapResult | null>(null);

	// AI status is a public endpoint - no auth guard needed, fires immediately
	const { data: aiStatus } = useQuery(orpc.aiConfig.status.check.queryOptions());
	const aiAvailable = !!aiStatus?.available;

	const mutation = useMutation(orpc.career.analyzeSkillGap.mutationOptions());

	const handleSubmit = useCallback(async () => {
		if (!aiAvailable) return;
		const skillList = skills
			.split(",")
			.map((s) => s.trim())
			.filter(Boolean);
		if (!targetRole || skillList.length === 0) {
			toast.error(t`Veuillez remplir tous les champs`);
			return;
		}
		try {
			const res = await mutation.mutateAsync({ targetRole, field, currentSkills: skillList });
			setResult(res as SkillGapResult);
		} catch {
			toast.error(t`L'analyse a échoué. Veuillez réessayer.`);
		}
	}, [aiAvailable, targetRole, field, skills, mutation]);

	const priorityColors: Record<string, string> = {
		high: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
		medium: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
		low: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<TargetIcon className="size-5 text-emerald-600" weight="duotone" />
						<Trans>Skill Gap Analysis</Trans>
					</DialogTitle>
					<DialogDescription>
						<Trans>Identify gaps between your skills and your target role</Trans>
					</DialogDescription>
				</DialogHeader>

				{!result ? (
					<div className="space-y-4">
						<div>
							<Label>
								<Trans>Target Role</Trans>
							</Label>
							<Input
								value={targetRole}
								onChange={(e) => setTargetRole(e.target.value)}
								placeholder={t`Ex: Ingénieur DevOps, Chef de projet, Data Scientist`}
							/>
						</div>
						<div>
							<Label>
								<Trans>Field</Trans>
							</Label>
							<Select value={field} onValueChange={setField}>
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="industrial">
										<Trans>Industrial</Trans>
									</SelectItem>
									<SelectItem value="healthcare">
										<Trans>Healthcare</Trans>
									</SelectItem>
									<SelectItem value="hse">
										<Trans>HSE</Trans>
									</SelectItem>
									<SelectItem value="it">
										<Trans>IT / Digital</Trans>
									</SelectItem>
									<SelectItem value="engineering">
										<Trans>Engineering</Trans>
									</SelectItem>
								</SelectContent>
							</Select>
						</div>
						<div>
							<Label>
								<Trans>Your Current Skills (comma-separated)</Trans>
							</Label>
							<Textarea
								value={skills}
								onChange={(e) => setSkills(e.target.value)}
								placeholder={t`Ex: Python, Docker, SQL, Lean Manufacturing, AutoCAD`}
								rows={3}
							/>
						</div>
						<Button onClick={handleSubmit} disabled={mutation.isPending || !aiAvailable} className="w-full gap-2">
							<SparkleIcon className="size-4" weight="fill" />
							{mutation.isPending ? t`Analyse en cours...` : t`Analyser`}
						</Button>
						{!aiAvailable && (
							<p className="text-center text-muted-foreground text-xs">
								<Trans>L'IA n'est pas configurée</Trans>
							</p>
						)}
					</div>
				) : (
					<div className="space-y-6">
						<div className="flex items-center gap-4 rounded-xl bg-muted/50 p-4">
							<div className="relative size-16">
								<svg viewBox="0 0 36 36" className="size-16 -rotate-90">
									<path
										className="stroke-muted"
										d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
										fill="none"
										strokeWidth="3"
									/>
									<path
										className="stroke-emerald-500"
										d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
										fill="none"
										strokeWidth="3"
										strokeDasharray={`${result.matchPercentage}, 100`}
										strokeLinecap="round"
									/>
								</svg>
								<span className="absolute inset-0 flex items-center justify-center font-bold text-sm">
									{result.matchPercentage}%
								</span>
							</div>
							<div>
								<p className="font-semibold">
									<Trans>Match Score</Trans>
								</p>
								<p className="text-muted-foreground text-sm">{targetRole}</p>
							</div>
						</div>

						{result.strengths.length > 0 && (
							<div>
								<h4 className="mb-2 flex items-center gap-1.5 font-medium text-sm">
									<CheckCircleIcon className="size-4 text-green-500" weight="fill" />
									<Trans>Strengths</Trans>
								</h4>
								<div className="flex flex-wrap gap-2">
									{result.strengths.map((s) => (
										<Badge key={s} variant="secondary">
											{s}
										</Badge>
									))}
								</div>
							</div>
						)}

						{result.missingSkills.length > 0 && (
							<div>
								<h4 className="mb-2 flex items-center gap-1.5 font-medium text-sm">
									<WarningCircleIcon className="size-4 text-amber-500" weight="fill" />
									<Trans>Missing Skills</Trans>
								</h4>
								<div className="space-y-2">
									{result.missingSkills.map((ms) => (
										<div key={ms.skill} className="flex items-center justify-between rounded-lg bg-muted/30 px-3 py-2">
											<span className="text-sm">{ms.skill}</span>
											<div className="flex items-center gap-2">
												<span className="text-muted-foreground text-xs">{ms.learningTime}</span>
												<Badge className={priorityColors[ms.priority] || ""} variant="outline">
													{ms.priority}
												</Badge>
											</div>
										</div>
									))}
								</div>
							</div>
						)}

						{result.recommendations.length > 0 && (
							<div>
								<h4 className="mb-2 flex items-center gap-1.5 font-medium text-sm">
									<LightbulbIcon className="size-4 text-blue-500" weight="fill" />
									<Trans>Recommendations</Trans>
								</h4>
								<ul className="space-y-1.5">
									{result.recommendations.map((r, i) => (
										<li key={i} className="flex items-start gap-2 text-sm">
											<ArrowRightIcon className="mt-0.5 size-3.5 shrink-0 text-primary" />
											<span>{r}</span>
										</li>
									))}
								</ul>
							</div>
						)}

						<Button
							variant="outline"
							onClick={() => {
								setResult(null);
								setTargetRole("");
								setSkills("");
							}}
							className="w-full"
						>
							<Trans>New Analysis</Trans>
						</Button>
					</div>
				)}
			</DialogContent>
		</Dialog>
	);
}

interface CareerPathResult {
	paths: Array<{
		title: string;
		description: string;
		requiredSkills: string[];
		salaryRange: { min: number; max: number; currency: string };
		growthOutlook: string;
		relevanceScore: number;
	}>;
}

export function CareerPathDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
	const [field, setField] = useState("industrial");
	const [skills, setSkills] = useState("");
	const [interests, setInterests] = useState("");
	const [level, setLevel] = useState("junior");
	const [result, setResult] = useState<CareerPathResult | null>(null);

	// AI status is a public endpoint - no auth guard needed, fires immediately
	const { data: aiStatus } = useQuery(orpc.aiConfig.status.check.queryOptions());
	const aiAvailable = !!aiStatus?.available;

	const mutation = useMutation(orpc.career.recommendCareerPaths.mutationOptions());

	const handleSubmit = useCallback(async () => {
		if (!aiAvailable) return;
		const skillList = skills
			.split(",")
			.map((s) => s.trim())
			.filter(Boolean);
		if (skillList.length === 0) {
			toast.error(t`Veuillez entrer vos compétences`);
			return;
		}
		const interestList = interests
			.split(",")
			.map((s) => s.trim())
			.filter(Boolean);
		try {
			const res = await mutation.mutateAsync({
				field,
				skills: skillList,
				interests: interestList.length > 0 ? interestList : undefined,
				experienceLevel: level,
			});
			setResult(res as CareerPathResult);
		} catch {
			toast.error(t`La recherche a échoué. Veuillez réessayer.`);
		}
	}, [aiAvailable, field, skills, interests, level, mutation]);

	const formatSalary = (n: number) => {
		if (n >= 1000) return `${Math.round(n / 1000)}K`;
		return String(n);
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<CompassIcon className="size-5 text-blue-600" weight="duotone" />
						<Trans>Career Path Finder</Trans>
					</DialogTitle>
					<DialogDescription>
						<Trans>Discover career paths matching your IMTA profile</Trans>
					</DialogDescription>
				</DialogHeader>

				{!result ? (
					<div className="space-y-4">
						<div className="grid gap-4 sm:grid-cols-2">
							<div>
								<Label>
									<Trans>Field</Trans>
								</Label>
								<Select value={field} onValueChange={setField}>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="industrial">
											<Trans>Industrial</Trans>
										</SelectItem>
										<SelectItem value="healthcare">
											<Trans>Healthcare</Trans>
										</SelectItem>
										<SelectItem value="hse">
											<Trans>HSE</Trans>
										</SelectItem>
										<SelectItem value="it">
											<Trans>IT / Digital</Trans>
										</SelectItem>
										<SelectItem value="engineering">
											<Trans>Engineering</Trans>
										</SelectItem>
									</SelectContent>
								</Select>
							</div>
							<div>
								<Label>
									<Trans>Experience Level</Trans>
								</Label>
								<Select value={level} onValueChange={setLevel}>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="student">
											<Trans>Student</Trans>
										</SelectItem>
										<SelectItem value="junior">
											<Trans>Junior (0-2 years)</Trans>
										</SelectItem>
										<SelectItem value="mid">
											<Trans>Mid (2-5 years)</Trans>
										</SelectItem>
										<SelectItem value="senior">
											<Trans>Senior (5+ years)</Trans>
										</SelectItem>
									</SelectContent>
								</Select>
							</div>
						</div>
						<div>
							<Label>
								<Trans>Skills (comma-separated)</Trans>
							</Label>
							<Textarea
								value={skills}
								onChange={(e) => setSkills(e.target.value)}
								placeholder={t`Ex: Python, Lean Manufacturing, SolidWorks`}
								rows={2}
							/>
						</div>
						<div>
							<Label>
								<Trans>Interests (optional, comma-separated)</Trans>
							</Label>
							<Input
								value={interests}
								onChange={(e) => setInterests(e.target.value)}
								placeholder={t`Ex: Energies renouvelables, IA, Automobile`}
							/>
						</div>
						<Button onClick={handleSubmit} disabled={mutation.isPending || !aiAvailable} className="w-full gap-2">
							<SparkleIcon className="size-4" weight="fill" />
							{mutation.isPending ? t`Recherche en cours...` : t`Découvrir mes parcours`}
						</Button>
						{!aiAvailable && (
							<p className="text-center text-muted-foreground text-xs">
								<Trans>L'IA n'est pas configurée</Trans>
							</p>
						)}
					</div>
				) : (
					<div className="space-y-4">
						{result.paths.map((path, i) => (
							<Card key={i} className="overflow-hidden">
								<CardHeader className="pb-2">
									<div className="flex items-start justify-between">
										<CardTitle className="text-base">{path.title}</CardTitle>
										<Badge variant="secondary" className="shrink-0">
											{path.relevanceScore}%
										</Badge>
									</div>
								</CardHeader>
								<CardContent className="space-y-3 pt-0 text-sm">
									<p className="text-muted-foreground">{path.description}</p>
									<div className="flex items-center gap-2">
										<CurrencyCircleDollarIcon className="size-4 text-green-500" />
										<span>
											{formatSalary(path.salaryRange.min)} - {formatSalary(path.salaryRange.max)}{" "}
											{path.salaryRange.currency}
										</span>
									</div>
									<div className="flex items-center gap-2">
										<TrendUpIcon className="size-4 text-blue-500" />
										<span className="text-muted-foreground">{path.growthOutlook}</span>
									</div>
									<div className="flex flex-wrap gap-1.5">
										{path.requiredSkills.map((s) => (
											<Badge key={s} variant="outline" className="text-xs">
												{s}
											</Badge>
										))}
									</div>
								</CardContent>
							</Card>
						))}
						<Button
							variant="outline"
							onClick={() => {
								setResult(null);
								setSkills("");
								setInterests("");
							}}
							className="w-full"
						>
							<Trans>New Search</Trans>
						</Button>
					</div>
				)}
			</DialogContent>
		</Dialog>
	);
}

interface CoachMessage {
	role: "user" | "assistant";
	content: string;
}

export function CareerCoachDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
	const [message, setMessage] = useState("");
	const [messages, setMessages] = useState<CoachMessage[]>([]);
	const [field, setField] = useState("general");

	// AI status is a public endpoint - no auth guard needed, fires immediately
	const { data: aiStatus } = useQuery(orpc.aiConfig.status.check.queryOptions());
	const aiAvailable = !!aiStatus?.available;

	const mutation = useMutation(orpc.career.careerCoach.mutationOptions());

	const handleSend = useCallback(async () => {
		if (!aiAvailable) return;
		if (!message.trim()) return;
		const userMsg = message.trim();
		setMessages((prev) => [...prev, { role: "user", content: userMsg }]);
		setMessage("");

		try {
			const history = messages.map((m) => `${m.role === "user" ? "Étudiant" : "Coach"}: ${m.content}`).join("\n");
			const res = (await mutation.mutateAsync({
				message: userMsg,
				field: field !== "general" ? field : undefined,
				context: history || undefined,
			})) as { response: string };
			setMessages((prev) => [...prev, { role: "assistant", content: res.response }]);
		} catch {
			setMessages((prev) => [
				...prev,
				{ role: "assistant", content: "Désolé, une erreur s'est produite. Veuillez réessayer." },
			]);
		}
	}, [aiAvailable, message, messages, field, mutation]);

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="flex max-h-[85vh] max-w-2xl flex-col">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<ChatCircleDotsIcon className="size-5 text-amber-600" weight="duotone" />
						<Trans>AI Career Coach</Trans>
					</DialogTitle>
					<DialogDescription>
						<Trans>Ask anything about your career, the Moroccan job market, or IMTA programs</Trans>
					</DialogDescription>
				</DialogHeader>

				<div className="mb-3">
					<Select value={field} onValueChange={setField}>
						<SelectTrigger className="w-auto">
							<SelectValue placeholder={t`Domaine`} />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="general">
								<Trans>General</Trans>
							</SelectItem>
							<SelectItem value="industrial">
								<Trans>Industrial</Trans>
							</SelectItem>
							<SelectItem value="healthcare">
								<Trans>Healthcare</Trans>
							</SelectItem>
							<SelectItem value="hse">
								<Trans>HSE</Trans>
							</SelectItem>
							<SelectItem value="it">
								<Trans>IT / Digital</Trans>
							</SelectItem>
						</SelectContent>
					</Select>
				</div>

				<div className="min-h-[300px] flex-1 space-y-3 overflow-y-auto rounded-lg bg-muted/30 p-4">
					{messages.length === 0 && (
						<div className="flex h-full flex-col items-center justify-center gap-2 text-center text-muted-foreground">
							<ChatCircleDotsIcon className="size-10 opacity-30" />
							<p className="text-sm">
								<Trans>Posez votre première question au coach carrière IA</Trans>
							</p>
							<div className="mt-2 flex flex-wrap justify-center gap-2">
								{[
									t`Quels secteurs recrutent au Maroc ?`,
									t`Comment préparer mon premier entretien ?`,
									t`Salaire moyen d'un ingénieur IMTA ?`,
								].map((q) => (
									<Button
										key={q}
										variant="outline"
										size="sm"
										className="text-xs"
										onClick={() => {
											setMessage(q);
										}}
									>
										{q}
									</Button>
								))}
							</div>
						</div>
					)}
					{messages.map((m, i) => (
						<div key={i} className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}>
							<div
								className={cn(
									"max-w-[80%] rounded-xl px-4 py-2.5 text-sm",
									m.role === "user" ? "bg-primary text-primary-foreground" : "bg-background shadow-sm",
								)}
							>
								{m.content}
							</div>
						</div>
					))}
					{mutation.isPending && (
						<div className="flex justify-start">
							<div className="rounded-xl bg-background px-4 py-2.5 shadow-sm">
								<div className="flex gap-1">
									<div className="size-2 animate-bounce rounded-full bg-muted-foreground/40" />
									<div className="size-2 animate-bounce rounded-full bg-muted-foreground/40 [animation-delay:0.1s]" />
									<div className="size-2 animate-bounce rounded-full bg-muted-foreground/40 [animation-delay:0.2s]" />
								</div>
							</div>
						</div>
					)}
				</div>

				<div className="flex gap-2">
					<Input
						value={message}
						onChange={(e) => setMessage(e.target.value)}
						onKeyDown={(e) => {
							if (e.key === "Enter" && !e.shiftKey) {
								e.preventDefault();
								handleSend();
							}
						}}
						placeholder={t`Posez votre question...`}
						disabled={mutation.isPending || !aiAvailable}
					/>
					<Button onClick={handleSend} disabled={mutation.isPending || !message.trim() || !aiAvailable} size="icon">
						<ArrowRightIcon className="size-4" />
					</Button>
				</div>
				{!aiAvailable && (
					<p className="text-center text-muted-foreground text-xs">
						<Trans>L'IA n'est pas configurée</Trans>
					</p>
				)}
			</DialogContent>
		</Dialog>
	);
}

export function AiCareerToolsSection({ onToolSelect }: { onToolSelect: (toolId: string) => void }) {
	const tools = [
		{
			...AI_CAREER_TOOLS[0],
			title: t`Skill Gap Analysis`,
			description: t`Identify the gap between your current skills and your target role requirements. Get personalized recommendations to boost your employability.`,
			cta: t`Analyze My Skills`,
		},
		{
			...AI_CAREER_TOOLS[1],
			title: t`Career Path Finder`,
			description: t`Discover personalized career paths based on your IMTA profile, skills, and interests. Explore opportunities in Morocco and internationally.`,
			cta: t`Find My Path`,
		},
		{
			...AI_CAREER_TOOLS[2],
			title: t`AI Career Coach`,
			description: t`Chat with an AI career coach specialized in the Moroccan job market, IMTA programs, and engineering careers. Ask anything about your professional future.`,
			cta: t`Start Coaching`,
		},
	];

	return (
		<div className="space-y-6">
			<div className="flex items-center gap-3">
				<div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/5">
					<LightbulbIcon className="size-5 text-primary" weight="duotone" />
				</div>
				<div>
					<h2 className="font-bold text-xl tracking-tight">
						<Trans>AI Career Tools</Trans>
					</h2>
					<p className="text-muted-foreground text-sm">
						<Trans>Powered by AI to help IMTA graduates succeed</Trans>
					</p>
				</div>
			</div>

			<div className="grid gap-6 md:grid-cols-3">
				{tools.map((tool) => (
					<Card
						key={tool.id}
						className={cn(
							"group relative overflow-hidden border-2 transition-all duration-300 hover:shadow-lg",
							`bg-gradient-to-br ${tool.gradient}`,
							tool.borderColor,
							"hover:scale-[1.02]",
						)}
					>
						<CardHeader className="pb-3">
							<div
								className={cn(
									"mb-3 flex size-12 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110",
									tool.iconBg,
								)}
							>
								<tool.icon className={cn("size-6", tool.iconColor)} weight="duotone" />
							</div>
							<CardTitle className="text-lg">{tool.title}</CardTitle>
						</CardHeader>
						<CardContent className="pt-0">
							<CardDescription className="mb-4 min-h-[3.5rem] leading-relaxed">{tool.description}</CardDescription>
							<Button
								variant="outline"
								className={cn("w-full gap-2 transition-all duration-200", "hover:bg-background/80")}
								onClick={() => onToolSelect(tool.id)}
							>
								<SparkleIcon className="size-4" weight="fill" />
								{tool.cta}
								<ArrowRightIcon className="size-4 transition-transform duration-200 group-hover:translate-x-1" />
							</Button>
						</CardContent>
					</Card>
				))}
			</div>
		</div>
	);
}
