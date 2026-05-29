import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import {
	ArrowLeftIcon,
	BookmarkSimpleIcon,
	BookOpenIcon,
	CaretDownIcon,
	CaretUpIcon,
	CheckCircleIcon,
	ClockIcon,
	FunnelIcon,
	HeartIcon,
	LightbulbIcon,
	ListIcon,
	MagnifyingGlassIcon,
	PauseIcon,
	PlayIcon,
	QuestionIcon,
	ShuffleIcon,
	SparkleIcon,
	StarIcon,
	StopIcon,
	TargetIcon,
	TimerIcon,
	TrendUpIcon,
	UsersIcon,
} from "@phosphor-icons/react";
import { Link } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import type { Dispatch, SetStateAction } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Spinner } from "@/components/ui/spinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/utils/style";
import { DashboardHeader } from "../../-components/header";
import { categoryConfig, difficultyConfig, industryConfig, starMethodSteps } from "./question-bank-config";
import type { DifficultyLevel, Industry, Question, QuestionCategory } from "./question-bank-types";
import { formatTime } from "./question-bank-utils";

// ---------- Practice Mode View ----------

interface PracticeModeViewProps {
	currentQuestion: Question;
	practiceQuestionIndex: number;
	filteredQuestionsLength: number;
	timerSeconds: number;
	timerDuration: number;
	timerRunning: boolean;
	expandedQuestions: Set<string>;
	favorites: Set<string>;
	exitPracticeMode: () => void;
	resetTimer: () => void;
	toggleTimer: () => void;
	setTimerDuration: Dispatch<SetStateAction<number>>;
	toggleExpand: (questionId: string) => void;
	toggleFavorite: (questionId: string) => void;
	previousPracticeQuestion: () => void;
	shuffleQuestions: () => void;
	nextPracticeQuestion: () => void;
}

export function PracticeModeView({
	currentQuestion,
	practiceQuestionIndex,
	filteredQuestionsLength,
	timerSeconds,
	timerDuration,
	timerRunning,
	expandedQuestions,
	favorites,
	exitPracticeMode,
	resetTimer,
	toggleTimer,
	setTimerDuration,
	toggleExpand,
	toggleFavorite,
	previousPracticeQuestion,
	shuffleQuestions,
	nextPracticeQuestion,
}: PracticeModeViewProps) {
	const timerProgress = (timerSeconds / timerDuration) * 100;

	return (
		<>
			<DashboardHeader icon={TimerIcon} title={t`Practice Mode`} />

			<motion.div
				className="mx-auto max-w-4xl space-y-6"
				initial={false}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5 }}
			>
				{/* Practice Header */}
				<Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
					<CardContent className="p-6">
						<div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
							<div className="flex items-center gap-4">
								<div className="flex size-16 items-center justify-center rounded-2xl bg-primary/10">
									<TimerIcon className="size-8 text-primary" weight="duotone" />
								</div>
								<div>
									<h2 className="font-semibold text-lg">
										<Trans>Question</Trans> {practiceQuestionIndex + 1} / {filteredQuestionsLength}
									</h2>
									<p className="text-muted-foreground text-sm">
										<Trans>Take time to think before answering</Trans>
									</p>
								</div>
							</div>
							<Button variant="outline" onClick={exitPracticeMode}>
								<StopIcon className="mr-2 size-4" />
								<Trans>Exit practice</Trans>
							</Button>
						</div>
					</CardContent>
				</Card>

				{/* Timer Card */}
				<Card>
					<CardContent className="p-6">
						<div className="flex flex-col items-center gap-4">
							<div className="text-center">
								<div className="font-bold font-mono text-5xl text-primary">{formatTime(timerSeconds)}</div>
								<p className="mt-1 text-muted-foreground text-sm">
									<Trans>Recommended answer time:</Trans> {formatTime(timerDuration)}
								</p>
							</div>
							<Progress value={timerProgress} className="h-2 w-full max-w-md" />
							<div className="flex items-center gap-3">
								<Button variant="outline" size="sm" onClick={resetTimer}>
									<StopIcon className="mr-1 size-4" />
									<Trans>Reset</Trans>
								</Button>
								<Button onClick={toggleTimer} className="gap-2">
									{timerRunning ? (
										<>
											<PauseIcon className="size-4" />
											<Trans>Pause</Trans>
										</>
									) : (
										<>
											<PlayIcon className="size-4" />
											<Trans>Start</Trans>
										</>
									)}
								</Button>
								<div className="flex items-center gap-2">
									<span className="text-muted-foreground text-sm">
										<Trans>Duration:</Trans>
									</span>
									{[60, 120, 180, 300].map((duration) => (
										<Button
											key={duration}
											variant={timerDuration === duration ? "default" : "outline"}
											size="sm"
											onClick={() => {
												setTimerDuration(duration);
												resetTimer();
											}}
										>
											{duration / 60}m
										</Button>
									))}
								</div>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Question Card */}
				<Card className="overflow-hidden">
					<CardHeader className="border-b bg-muted/30">
						<div className="flex flex-wrap items-center gap-2">
							<Badge
								className={cn(
									"text-xs",
									categoryConfig[currentQuestion.category].bgColor,
									categoryConfig[currentQuestion.category].color,
								)}
							>
								{(() => {
									const CategoryIcon = categoryConfig[currentQuestion.category].icon;
									return <CategoryIcon className="mr-1 size-3" />;
								})()}
								{categoryConfig[currentQuestion.category].label}
							</Badge>
							<Badge
								variant="outline"
								className={cn(
									"text-xs",
									difficultyConfig[currentQuestion.difficulty].bgColor,
									difficultyConfig[currentQuestion.difficulty].color,
								)}
							>
								{difficultyConfig[currentQuestion.difficulty].label}
							</Badge>
							<Badge
								variant="outline"
								className={cn(
									"text-xs",
									industryConfig[currentQuestion.industry].bgColor,
									industryConfig[currentQuestion.industry].color,
								)}
							>
								{(() => {
									const IndustryIcon = industryConfig[currentQuestion.industry].icon;
									return <IndustryIcon className="mr-1 size-3" />;
								})()}
								{industryConfig[currentQuestion.industry].label}
							</Badge>
						</div>
					</CardHeader>
					<CardContent className="p-6">
						<h3 className="mb-6 font-semibold text-xl leading-relaxed">{currentQuestion.question}</h3>

						{/* STAR Method Guide */}
						<div className="mb-6 rounded-lg bg-gradient-to-br from-blue-50/80 to-indigo-50/50 p-4 dark:from-blue-900/20 dark:to-indigo-900/10">
							<h4 className="mb-3 flex items-center gap-2 font-semibold text-blue-700 dark:text-blue-400">
								<LightbulbIcon className="size-5" weight="fill" />
								<Trans>Structure your answer with the STAR method</Trans>
							</h4>
							<div className="grid gap-2 md:grid-cols-4">
								{starMethodSteps.map((step) => (
									<div key={step.letter} className="flex items-start gap-2">
										<div
											className={cn(
												"flex size-8 shrink-0 items-center justify-center rounded-lg font-bold",
												step.bgColor,
												step.color,
											)}
										>
											{step.letter}
										</div>
										<div>
											<p className="font-medium text-sm">{step.title || step.titleFr}</p>
											<p className="text-muted-foreground text-xs">{step.description}</p>
										</div>
									</div>
								))}
							</div>
						</div>

						{/* Tips */}
						<div className="rounded-lg bg-gradient-to-br from-amber-50/80 to-orange-50/50 p-4 dark:from-amber-900/20 dark:to-orange-900/10">
							<h4 className="mb-2 flex items-center gap-2 font-semibold text-amber-700 dark:text-amber-400">
								<StarIcon className="size-5" weight="fill" />
								<Trans>Tips</Trans>
							</h4>
							<ul className="space-y-1">
								{currentQuestion.tips.map((tip, index) => (
									<li key={index} className="flex items-start gap-2 text-muted-foreground text-sm">
										<CheckCircleIcon className="mt-0.5 size-4 shrink-0 text-amber-500" weight="fill" />
										<span>{tip}</span>
									</li>
								))}
							</ul>
						</div>
					</CardContent>
					<CardFooter className="flex justify-between border-t bg-muted/30 p-4">
						<div className="flex items-center gap-2">
							<Button variant="outline" size="sm" onClick={previousPracticeQuestion}>
								<Trans>Previous</Trans>
							</Button>
							<Button variant="outline" size="sm" onClick={shuffleQuestions}>
								<ShuffleIcon className="mr-1 size-4" />
								<Trans>Random</Trans>
							</Button>
						</div>
						<div className="flex items-center gap-2">
							<Button
								variant="ghost"
								size="icon"
								className={cn("size-9", favorites.has(currentQuestion.id) && "text-amber-500")}
								onClick={() => toggleFavorite(currentQuestion.id)}
							>
								<BookmarkSimpleIcon
									className="size-5"
									weight={favorites.has(currentQuestion.id) ? "fill" : "regular"}
								/>
							</Button>
							<Button onClick={nextPracticeQuestion}>
								<Trans>Next</Trans>
							</Button>
						</div>
					</CardFooter>
				</Card>

				{/* Sample Answer (Hidden by default) */}
				<Card>
					<CardHeader className="cursor-pointer" onClick={() => toggleExpand(`practice-${currentQuestion.id}`)}>
						<div className="flex items-center justify-between">
							<CardTitle className="flex items-center gap-2 text-lg">
								<CheckCircleIcon className="size-5 text-green-600" weight="duotone" />
								<Trans>View model answer</Trans>
							</CardTitle>
							{expandedQuestions.has(`practice-${currentQuestion.id}`) ? (
								<CaretUpIcon className="size-5" />
							) : (
								<CaretDownIcon className="size-5" />
							)}
						</div>
					</CardHeader>
					<AnimatePresence>
						{expandedQuestions.has(`practice-${currentQuestion.id}`) && (
							<motion.div
								initial={{ opacity: 0, height: 0 }}
								animate={{ opacity: 1, height: "auto" }}
								exit={{ opacity: 0, height: 0 }}
								transition={{ duration: 0.2 }}
							>
								<CardContent className="space-y-4 border-t pt-4">
									<div className="rounded-lg bg-gradient-to-br from-green-50/80 to-emerald-50/50 p-4 dark:from-green-900/20 dark:to-emerald-900/10">
										<h4 className="mb-2 flex items-center gap-2 font-semibold text-green-700 dark:text-green-400">
											<CheckCircleIcon className="size-5" weight="duotone" />
											<Trans>Model Answer</Trans>
										</h4>
										<p className="text-muted-foreground text-sm leading-relaxed">{currentQuestion.sampleAnswer}</p>
									</div>

									{/* STAR Example */}
									<div className="space-y-3">
										<h4 className="font-semibold">
											<Trans>Detailed STAR example</Trans>
										</h4>
										<div className="grid gap-3 md:grid-cols-2">
											{starMethodSteps.map((step) => (
												<div key={step.letter} className={cn("rounded-lg p-3", step.bgColor)}>
													<div className="flex items-center gap-2">
														<div
															className={cn(
																"flex size-7 items-center justify-center rounded-lg font-bold text-sm",
																"bg-white/50 dark:bg-black/20",
																step.color,
															)}
														>
															{step.letter}
														</div>
														<span className={cn("font-semibold text-sm", step.color)}>
															{step.title || step.titleFr}
														</span>
													</div>
													<p className="mt-2 text-muted-foreground text-sm">
														{
															currentQuestion.starExample[
																step.title.toLowerCase() as keyof typeof currentQuestion.starExample
															]
														}
													</p>
												</div>
											))}
										</div>
									</div>
								</CardContent>
							</motion.div>
						)}
					</AnimatePresence>
				</Card>
			</motion.div>
		</>
	);
}

// ---------- Loading State ----------

export function LoadingState() {
	return (
		<>
			<DashboardHeader icon={BookOpenIcon} title={t`Interview Question Bank`} />
			<div className="flex min-h-[400px] items-center justify-center">
				<div className="flex flex-col items-center gap-4">
					<Spinner className="size-8" />
					<p className="text-muted-foreground">
						<Trans>Loading questions...</Trans>
					</p>
				</div>
			</div>
		</>
	);
}

// ---------- Error State ----------

interface ErrorStateProps {
	onRetry: () => void;
}

export function ErrorState({ onRetry }: ErrorStateProps) {
	return (
		<>
			<DashboardHeader icon={BookOpenIcon} title={t`Interview Question Bank`} />
			<Card className="border-destructive/50">
				<CardContent className="flex flex-col items-center justify-center py-12">
					<QuestionIcon className="mb-4 size-12 text-destructive" />
					<p className="mb-2 font-semibold text-destructive">
						<Trans>Error loading</Trans>
					</p>
					<p className="text-muted-foreground text-sm">
						<Trans>An error occurred while loading your favorites. Please try again.</Trans>
					</p>
					<Button variant="outline" className="mt-4" onClick={onRetry}>
						<Trans>Retry</Trans>
					</Button>
				</CardContent>
			</Card>
		</>
	);
}

// ---------- Hero Section ----------

interface HeroSectionProps {
	filteredQuestionsLength: number;
	favoritesSize: number;
	showStarGuide: boolean;
	setShowStarGuide: Dispatch<SetStateAction<boolean>>;
	startPracticeMode: () => void;
}

export function HeroSection({
	filteredQuestionsLength,
	favoritesSize,
	showStarGuide,
	setShowStarGuide,
	startPracticeMode,
}: HeroSectionProps) {
	return (
		<motion.div
			className="relative mb-8 overflow-hidden rounded-3xl border border-indigo-500/20 p-8 md:p-12"
			style={{
				background:
					"linear-gradient(135deg, oklch(0.7 0.15 270 / 0.15) 0%, oklch(0.65 0.18 240 / 0.1) 50%, oklch(0.6 0.15 210 / 0.08) 100%)",
			}}
			initial={false}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.6, ease: "easeOut" }}
		>
			{/* Animated background elements */}
			<div className="pointer-events-none absolute inset-0 overflow-hidden">
				<motion.div
					className="absolute -top-32 -right-32 size-96 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/10 blur-3xl"
					animate={{
						scale: [1, 1.2, 1],
						rotate: [0, 10, 0],
						opacity: [0.5, 0.3, 0.5],
					}}
					transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
				/>
				<motion.div
					className="absolute -bottom-32 -left-32 size-96 rounded-full bg-gradient-to-tr from-blue-500/15 to-indigo-500/10 blur-3xl"
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
					<BookOpenIcon className="size-5 text-indigo-600 dark:text-indigo-400" weight="fill" />
					<span className="font-semibold text-indigo-700 text-sm uppercase tracking-wider dark:text-indigo-300">
						<Trans>Question Bank</Trans>
					</span>
				</motion.div>

				<motion.h2
					className="mb-4 bg-gradient-to-r from-indigo-700 via-purple-600 to-indigo-700 bg-clip-text font-bold text-3xl text-transparent tracking-tight md:text-4xl lg:text-5xl dark:from-indigo-400 dark:via-purple-400 dark:to-indigo-400"
					initial={false}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.3 }}
				>
					<Trans>Prepare with our Question Bank</Trans>
				</motion.h2>

				<motion.p
					className="mb-8 max-w-2xl text-lg text-muted-foreground"
					initial={false}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.4 }}
				>
					<Trans>
						Explore our complete collection of interview questions categorized by type, difficulty, and industry. Each
						question includes a model answer and a detailed STAR example.
					</Trans>
				</motion.p>

				{/* Quick actions */}
				<motion.div
					className="flex flex-wrap items-center gap-4"
					initial={false}
					animate={{ opacity: 1 }}
					transition={{ delay: 0.5 }}
				>
					<Link to="/dashboard/interview">
						<Button variant="outline" className="gap-2">
							<ArrowLeftIcon className="size-4" />
							<Trans>Back</Trans>
						</Button>
					</Link>
					<Button
						onClick={startPracticeMode}
						className="gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
					>
						<PlayIcon className="size-4" weight="fill" />
						<Trans>Practice Mode</Trans>
					</Button>
					<Button variant="outline" className="gap-2" onClick={() => setShowStarGuide(!showStarGuide)}>
						<LightbulbIcon className="size-4" />
						<Trans>STAR Guide</Trans>
					</Button>
					<Badge variant="secondary" className="px-3 py-1.5">
						<QuestionIcon className="mr-1.5 size-4" />
						{filteredQuestionsLength} <Trans>questions</Trans>
					</Badge>
					{favoritesSize > 0 && (
						<Badge
							variant="secondary"
							className="gap-1.5 bg-amber-100 px-3 py-1.5 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
						>
							<BookmarkSimpleIcon className="size-4" weight="fill" />
							{favoritesSize} <Trans>favorites</Trans>
						</Badge>
					)}
				</motion.div>
			</div>
		</motion.div>
	);
}

// ---------- STAR Method Guide ----------

interface StarMethodGuideProps {
	showStarGuide: boolean;
}

export function StarMethodGuide({ showStarGuide }: StarMethodGuideProps) {
	return (
		<AnimatePresence>
			{showStarGuide && (
				<motion.div
					initial={{ opacity: 0, height: 0 }}
					animate={{ opacity: 1, height: "auto" }}
					exit={{ opacity: 0, height: 0 }}
					transition={{ duration: 0.3 }}
					className="mb-8 overflow-hidden"
				>
					<Card className="border-blue-500/20 bg-gradient-to-br from-blue-50/50 to-indigo-50/30 dark:from-blue-900/10 dark:to-indigo-900/5">
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<SparkleIcon className="size-6 text-blue-600 dark:text-blue-400" weight="duotone" />
								<Trans>The STAR Method - Your Key to Structured Answers</Trans>
							</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="mb-6 text-muted-foreground">
								<Trans>
									The STAR method is a structured communication technique for answering behavioral questions. It helps
									you give clear, concise, and impactful answers.
								</Trans>
							</p>
							<div className="grid gap-4 md:grid-cols-4">
								{starMethodSteps.map((step, index) => (
									<motion.div
										key={step.letter}
										initial={{ opacity: 0, y: 20 }}
										animate={{ opacity: 1, y: 0 }}
										transition={{ delay: index * 0.1 }}
										className="rounded-xl border bg-card p-4"
									>
										<div
											className={cn(
												"mb-3 flex size-12 items-center justify-center rounded-xl font-bold text-xl",
												step.bgColor,
												step.color,
											)}
										>
											{step.letter}
										</div>
										<h4 className={cn("mb-2 font-semibold", step.color)}>{step.title || step.titleFr}</h4>
										<p className="text-muted-foreground text-sm">{step.description}</p>
									</motion.div>
								))}
							</div>
							<div className="mt-6 rounded-lg bg-amber-50 p-4 dark:bg-amber-900/20">
								<h4 className="mb-2 flex items-center gap-2 font-semibold text-amber-700 dark:text-amber-400">
									<LightbulbIcon className="size-5" weight="fill" />
									<Trans>Tips for using STAR effectively</Trans>
								</h4>
								<ul className="space-y-2 text-muted-foreground text-sm">
									<li className="flex items-start gap-2">
										<CheckCircleIcon className="mt-0.5 size-4 shrink-0 text-amber-500" weight="fill" />
										<Trans>Prepare 5-6 STAR stories that you can adapt to different questions</Trans>
									</li>
									<li className="flex items-start gap-2">
										<CheckCircleIcon className="mt-0.5 size-4 shrink-0 text-amber-500" weight="fill" />
										<Trans>Keep each part short: 1-2 sentences for S and T, 2-3 for A, 1-2 for R</Trans>
									</li>
									<li className="flex items-start gap-2">
										<CheckCircleIcon className="mt-0.5 size-4 shrink-0 text-amber-500" weight="fill" />
										<Trans>Quantify your results when possible (%, time, money)</Trans>
									</li>
									<li className="flex items-start gap-2">
										<CheckCircleIcon className="mt-0.5 size-4 shrink-0 text-amber-500" weight="fill" />
										<Trans>Practice out loud so your answers feel natural</Trans>
									</li>
								</ul>
							</div>
						</CardContent>
					</Card>
				</motion.div>
			)}
		</AnimatePresence>
	);
}

// ---------- Filters Section ----------

interface FiltersSectionProps {
	searchQuery: string;
	setSearchQuery: Dispatch<SetStateAction<string>>;
	selectedCategory: QuestionCategory | "all";
	setSelectedCategory: Dispatch<SetStateAction<QuestionCategory | "all">>;
	selectedDifficulty: DifficultyLevel | "all";
	setSelectedDifficulty: Dispatch<SetStateAction<DifficultyLevel | "all">>;
	selectedIndustry: Industry | "all";
	setSelectedIndustry: Dispatch<SetStateAction<Industry | "all">>;
}

export function FiltersSection({
	searchQuery,
	setSearchQuery,
	selectedCategory,
	setSelectedCategory,
	selectedDifficulty,
	setSelectedDifficulty,
	selectedIndustry,
	setSelectedIndustry,
}: FiltersSectionProps) {
	return (
		<div className="mb-6 space-y-4">
			{/* Search */}
			<div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
				<div className="relative flex-1 md:max-w-md">
					<MagnifyingGlassIcon className="absolute top-1/2 left-3 size-5 -translate-y-1/2 text-muted-foreground" />
					<Input
						placeholder={t`Search for a question...`}
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className="pl-10"
					/>
				</div>
				<div className="flex items-center gap-2">
					<FunnelIcon className="size-5 text-muted-foreground" />
					<span className="text-muted-foreground text-sm">
						<Trans>Active filters:</Trans>
					</span>
					{selectedCategory !== "all" && (
						<Badge variant="secondary" className="cursor-pointer" onClick={() => setSelectedCategory("all")}>
							{categoryConfig[selectedCategory].label} x
						</Badge>
					)}
					{selectedDifficulty !== "all" && (
						<Badge variant="secondary" className="cursor-pointer" onClick={() => setSelectedDifficulty("all")}>
							{difficultyConfig[selectedDifficulty].label} x
						</Badge>
					)}
					{selectedIndustry !== "all" && (
						<Badge variant="secondary" className="cursor-pointer" onClick={() => setSelectedIndustry("all")}>
							{industryConfig[selectedIndustry].label} x
						</Badge>
					)}
				</div>
			</div>

			{/* Industry Filter */}
			<div className="flex flex-wrap items-center gap-2">
				<span className="text-muted-foreground text-sm">
					<Trans>Industry:</Trans>
				</span>
				<Button
					variant={selectedIndustry === "all" ? "default" : "outline"}
					size="sm"
					onClick={() => setSelectedIndustry("all")}
				>
					<Trans>All</Trans>
				</Button>
				{Object.entries(industryConfig).map(([key, config]) => {
					const IndustryIcon = config.icon;
					return (
						<Button
							key={key}
							variant={selectedIndustry === key ? "default" : "outline"}
							size="sm"
							className={cn("gap-1.5", selectedIndustry === key && config.bgColor)}
							onClick={() => setSelectedIndustry(key as Industry)}
						>
							<IndustryIcon className="size-4" />
							{config.label}
						</Button>
					);
				})}
			</div>

			{/* Difficulty Filter */}
			<div className="flex flex-wrap items-center gap-2">
				<span className="text-muted-foreground text-sm">
					<Trans>Difficulty:</Trans>
				</span>
				<Button
					variant={selectedDifficulty === "all" ? "default" : "outline"}
					size="sm"
					onClick={() => setSelectedDifficulty("all")}
				>
					<Trans>All</Trans>
				</Button>
				{Object.entries(difficultyConfig).map(([key, config]) => (
					<Button
						key={key}
						variant={selectedDifficulty === key ? "default" : "outline"}
						size="sm"
						className={cn("gap-1.5", selectedDifficulty === key && config.bgColor)}
						onClick={() => setSelectedDifficulty(key as DifficultyLevel)}
					>
						{config.label}
					</Button>
				))}
			</div>
		</div>
	);
}

// ---------- Question Card (single item in list) ----------

interface QuestionCardProps {
	question: Question;
	index: number;
	isExpanded: boolean;
	isFavorite: boolean;
	toggleExpand: (questionId: string) => void;
	toggleFavorite: (questionId: string) => void;
	onPractice: (questionId: string) => void;
}

function QuestionCard({
	question,
	index,
	isExpanded,
	isFavorite,
	toggleExpand,
	toggleFavorite,
	onPractice,
}: QuestionCardProps) {
	const catConfig = categoryConfig[question.category];
	const diffConfig = difficultyConfig[question.difficulty];
	const indConfig = industryConfig[question.industry];
	const CategoryIcon = catConfig.icon;
	const IndustryIcon = indConfig.icon;

	return (
		<motion.div key={question.id} initial={false} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.03 }}>
			<Card
				className={cn(
					"group overflow-hidden transition-all duration-300",
					isExpanded && "ring-2 ring-primary/20",
					isFavorite && "border-amber-500/30",
				)}
			>
				<CardHeader
					className="cursor-pointer transition-colors hover:bg-muted/30"
					onClick={() => toggleExpand(question.id)}
				>
					<div className="flex items-start justify-between gap-4">
						<div className="flex-1">
							<div className="mb-2 flex flex-wrap items-center gap-2">
								<Badge className={cn("text-xs", catConfig.bgColor, catConfig.color)}>
									<CategoryIcon className="mr-1 size-3" />
									{catConfig.label}
								</Badge>
								<Badge variant="outline" className={cn("text-xs", diffConfig.bgColor, diffConfig.color)}>
									{diffConfig.label}
								</Badge>
								<Badge variant="outline" className={cn("text-xs", indConfig.bgColor, indConfig.color)}>
									<IndustryIcon className="mr-1 size-3" />
									{indConfig.label}
								</Badge>
								{isFavorite && (
									<Badge
										variant="secondary"
										className="bg-amber-100 text-amber-700 text-xs dark:bg-amber-900/30 dark:text-amber-400"
									>
										<BookmarkSimpleIcon className="mr-1 size-3" weight="fill" />
										<Trans>Favorite</Trans>
									</Badge>
								)}
							</div>
							<CardTitle className="text-lg leading-relaxed">{question.question}</CardTitle>
						</div>
						<div className="flex items-center gap-2">
							<Button
								variant="ghost"
								size="icon"
								className={cn("size-8 shrink-0", isFavorite && "text-amber-500 hover:text-amber-600")}
								onClick={(e) => {
									e.stopPropagation();
									toggleFavorite(question.id);
								}}
							>
								<BookmarkSimpleIcon className="size-5" weight={isFavorite ? "fill" : "regular"} />
							</Button>
							<Button
								variant="ghost"
								size="icon"
								className="size-8 shrink-0"
								onClick={(e) => {
									e.stopPropagation();
									toggleExpand(question.id);
								}}
							>
								{isExpanded ? <CaretUpIcon className="size-5" /> : <CaretDownIcon className="size-5" />}
							</Button>
						</div>
					</div>
				</CardHeader>

				<AnimatePresence>
					{isExpanded && (
						<motion.div
							initial={{ opacity: 0, height: 0 }}
							animate={{ opacity: 1, height: "auto" }}
							exit={{ opacity: 0, height: 0 }}
							transition={{ duration: 0.2 }}
						>
							<CardContent className="space-y-4 border-t pt-4">
								{/* Sample Answer */}
								<div className="rounded-lg bg-gradient-to-br from-green-50/80 to-emerald-50/50 p-4 dark:from-green-900/20 dark:to-emerald-900/10">
									<h4 className="mb-2 flex items-center gap-2 font-semibold text-green-700 dark:text-green-400">
										<CheckCircleIcon className="size-5" weight="duotone" />
										<Trans>Model Answer</Trans>
									</h4>
									<p className="text-muted-foreground text-sm leading-relaxed">{question.sampleAnswer}</p>
								</div>

								{/* STAR Example */}
								<div className="space-y-3">
									<h4 className="flex items-center gap-2 font-semibold">
										<SparkleIcon className="size-5 text-blue-600" weight="duotone" />
										<Trans>Detailed STAR example</Trans>
									</h4>
									<div className="grid gap-3 md:grid-cols-2">
										{starMethodSteps.map((step) => (
											<div key={step.letter} className={cn("rounded-lg p-3", step.bgColor)}>
												<div className="flex items-center gap-2">
													<div
														className={cn(
															"flex size-7 items-center justify-center rounded-lg font-bold text-sm",
															"bg-white/50 dark:bg-black/20",
															step.color,
														)}
													>
														{step.letter}
													</div>
													<span className={cn("font-semibold text-sm", step.color)}>{step.title || step.titleFr}</span>
												</div>
												<p className="mt-2 text-muted-foreground text-sm">
													{question.starExample[step.title.toLowerCase() as keyof typeof question.starExample]}
												</p>
											</div>
										))}
									</div>
								</div>

								{/* Tips */}
								<div className="rounded-lg bg-gradient-to-br from-amber-50/80 to-orange-50/50 p-4 dark:from-amber-900/20 dark:to-orange-900/10">
									<h4 className="mb-2 flex items-center gap-2 font-semibold text-amber-700 dark:text-amber-400">
										<LightbulbIcon className="size-5" weight="fill" />
										<Trans>Tips for Answering</Trans>
									</h4>
									<ul className="space-y-2">
										{question.tips.map((tip, tipIndex) => (
											<li key={tipIndex} className="flex items-start gap-2 text-muted-foreground text-sm">
												<StarIcon className="mt-0.5 size-4 shrink-0 text-amber-500" weight="fill" />
												<span>{tip}</span>
											</li>
										))}
									</ul>
								</div>

								{/* Keywords */}
								<div>
									<h4 className="mb-2 flex items-center gap-2 font-semibold text-sm">
										<TargetIcon className="size-4 text-primary" />
										<Trans>Keywords to use</Trans>
									</h4>
									<div className="flex flex-wrap gap-2">
										{question.keywords.map((keyword, keyIndex) => (
											<Badge key={keyIndex} variant="outline" className="text-xs">
												{keyword}
											</Badge>
										))}
									</div>
								</div>
							</CardContent>
							<CardFooter className="flex justify-between border-t bg-muted/30 pt-4">
								<div className="flex items-center gap-2 text-muted-foreground text-sm">
									<TrendUpIcon className="size-4" />
									<span>
										<Trans>Recommended practice</Trans>
									</span>
								</div>
								<div className="flex items-center gap-2">
									<Button variant="outline" size="sm" className="gap-2" onClick={() => onPractice(question.id)}>
										<PlayIcon className="size-4" />
										<Trans>Practice</Trans>
									</Button>
								</div>
							</CardFooter>
						</motion.div>
					)}
				</AnimatePresence>
			</Card>
		</motion.div>
	);
}

// ---------- Category Tabs with Question List ----------

interface CategoryTabsProps {
	selectedCategory: QuestionCategory | "all";
	setSelectedCategory: Dispatch<SetStateAction<QuestionCategory | "all">>;
	filteredQuestions: Question[];
	questionCounts: Record<string, number>;
	expandedQuestions: Set<string>;
	favorites: Set<string>;
	toggleExpand: (questionId: string) => void;
	toggleFavorite: (questionId: string) => void;
	onPracticeQuestion: (questionId: string) => void;
}

export function CategoryTabs({
	selectedCategory,
	setSelectedCategory,
	filteredQuestions,
	questionCounts,
	expandedQuestions,
	favorites,
	toggleExpand,
	toggleFavorite,
	onPracticeQuestion,
}: CategoryTabsProps) {
	return (
		<Tabs
			value={selectedCategory}
			onValueChange={(val) => setSelectedCategory(val as QuestionCategory | "all")}
			className="space-y-6"
		>
			<TabsList className="flex h-auto flex-wrap justify-start gap-2 bg-transparent p-0">
				<TabsTrigger
					value="all"
					className="flex items-center gap-2 rounded-lg border bg-card px-4 py-2.5 data-[state=active]:border-primary data-[state=active]:bg-primary/5"
				>
					<ListIcon className="size-4" />
					<Trans>All</Trans>
					<Badge variant="secondary" className="ml-1">
						{questionCounts.all}
					</Badge>
				</TabsTrigger>
				{Object.entries(categoryConfig).map(([key, config]) => {
					const CategoryIcon = config.icon;
					return (
						<TabsTrigger
							key={key}
							value={key}
							className="flex items-center gap-2 rounded-lg border bg-card px-4 py-2.5 data-[state=active]:border-primary data-[state=active]:bg-primary/5"
						>
							<CategoryIcon className={cn("size-4", config.color)} weight="duotone" />
							<span>{config.label}</span>
							<Badge variant="secondary" className="ml-1">
								{questionCounts[key]}
							</Badge>
						</TabsTrigger>
					);
				})}
			</TabsList>

			<TabsContent value={selectedCategory} className="mt-0">
				<motion.div initial={false} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
					{filteredQuestions.length === 0 ? (
						<Card className="border-dashed">
							<CardContent className="flex flex-col items-center justify-center py-12">
								<QuestionIcon className="mb-4 size-12 text-muted-foreground" />
								<p className="text-muted-foreground">
									<Trans>No questions found with these filters</Trans>
								</p>
							</CardContent>
						</Card>
					) : (
						<ScrollArea className="h-auto">
							<div className="space-y-4">
								{filteredQuestions.map((question, index) => (
									<QuestionCard
										key={question.id}
										question={question}
										index={index}
										isExpanded={expandedQuestions.has(question.id)}
										isFavorite={favorites.has(question.id)}
										toggleExpand={toggleExpand}
										toggleFavorite={toggleFavorite}
										onPractice={onPracticeQuestion}
									/>
								))}
							</div>
						</ScrollArea>
					)}
				</motion.div>
			</TabsContent>
		</Tabs>
	);
}

// ---------- Favorites Section ----------

interface FavoritesSectionProps {
	favoriteQuestions: Question[];
	favorites: Set<string>;
	toggleExpand: (questionId: string) => void;
	toggleFavorite: (questionId: string) => void;
}

export function FavoritesSection({ favoriteQuestions, toggleExpand, toggleFavorite }: FavoritesSectionProps) {
	if (favoriteQuestions.length === 0) return null;

	return (
		<section className="mt-12">
			<h3 className="mb-6 flex items-center gap-2 font-semibold text-2xl">
				<HeartIcon className="size-6 text-amber-500" weight="fill" />
				<Trans>My Favorite Questions</Trans>
				<Badge variant="secondary" className="ml-2">
					{favoriteQuestions.length}
				</Badge>
			</h3>

			<div className="grid gap-4 md:grid-cols-2">
				{favoriteQuestions.slice(0, 4).map((question, index) => {
					const catConfig = categoryConfig[question.category];
					const CategoryIcon = catConfig.icon;

					return (
						<motion.div
							key={question.id}
							initial={false}
							animate={{ opacity: 1, scale: 1 }}
							transition={{ delay: index * 0.05 }}
						>
							<Card
								className="h-full cursor-pointer border-amber-500/30 bg-gradient-to-br from-amber-50/50 to-orange-50/30 transition-all hover:-translate-y-1 hover:shadow-lg dark:from-amber-900/10 dark:to-orange-900/5"
								onClick={() => toggleExpand(question.id)}
							>
								<CardHeader className="pb-2">
									<div className="flex items-center justify-between">
										<Badge className={cn("text-xs", catConfig.bgColor, catConfig.color)}>
											<CategoryIcon className="mr-1 size-3" />
											{catConfig.label}
										</Badge>
										<Button
											variant="ghost"
											size="icon"
											className="size-8 text-amber-500"
											onClick={(e) => {
												e.stopPropagation();
												toggleFavorite(question.id);
											}}
										>
											<BookmarkSimpleIcon className="size-5" weight="fill" />
										</Button>
									</div>
									<CardTitle className="text-base leading-relaxed">{question.question}</CardTitle>
								</CardHeader>
							</Card>
						</motion.div>
					);
				})}
			</div>
		</section>
	);
}

// ---------- Quick Links Section ----------

export function QuickLinksSection() {
	return (
		<section className="mt-12">
			<h3 className="mb-6 flex items-center gap-2 font-semibold text-2xl">
				<SparkleIcon className="size-6 text-primary" weight="duotone" />
				<Trans>Continue your Preparation</Trans>
			</h3>

			<div className="grid gap-4 md:grid-cols-3">
				<Link to={"/dashboard/interview/tips" as string}>
					<Card className="group h-full cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
						<CardContent className="flex items-center gap-4 p-6">
							<div className="flex size-14 items-center justify-center rounded-xl bg-amber-100 transition-transform group-hover:scale-110 dark:bg-amber-900/30">
								<LightbulbIcon className="size-7 text-amber-600 dark:text-amber-400" weight="fill" />
							</div>
							<div className="flex-1">
								<h4 className="font-semibold">
									<Trans>Interview Tips</Trans>
								</h4>
								<p className="text-muted-foreground text-sm">
									<Trans>Tips for success</Trans>
								</p>
							</div>
						</CardContent>
					</Card>
				</Link>

				<Link to="/dashboard/interview/chatbot">
					<Card className="group h-full cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
						<CardContent className="flex items-center gap-4 p-6">
							<div className="flex size-14 items-center justify-center rounded-xl bg-purple-100 transition-transform group-hover:scale-110 dark:bg-purple-900/30">
								<UsersIcon className="size-7 text-purple-600 dark:text-purple-400" weight="duotone" />
							</div>
							<div className="flex-1">
								<h4 className="font-semibold">
									<Trans>AI Mock Interview</Trans>
								</h4>
								<p className="text-muted-foreground text-sm">
									<Trans>Practice with AI</Trans>
								</p>
							</div>
						</CardContent>
					</Card>
				</Link>

				<Link to="/dashboard/interview">
					<Card className="group h-full cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
						<CardContent className="flex items-center gap-4 p-6">
							<div className="flex size-14 items-center justify-center rounded-xl bg-green-100 transition-transform group-hover:scale-110 dark:bg-green-900/30">
								<CheckCircleIcon className="size-7 text-green-600 dark:text-green-400" weight="duotone" />
							</div>
							<div className="flex-1">
								<h4 className="font-semibold">
									<Trans>Interview Hub</Trans>
								</h4>
								<p className="text-muted-foreground text-sm">
									<Trans>All tools</Trans>
								</p>
							</div>
						</CardContent>
					</Card>
				</Link>
			</div>
		</section>
	);
}

// ---------- CTA Card Section ----------

interface CtaCardProps {
	startPracticeMode: () => void;
}

export function CtaCard({ startPracticeMode }: CtaCardProps) {
	return (
		<section className="mt-8">
			<Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
				<CardContent className="flex flex-col items-center justify-between gap-6 p-6 md:flex-row">
					<div className="flex items-center gap-4">
						<div className="flex size-16 items-center justify-center rounded-2xl bg-primary/10">
							<ClockIcon className="size-8 text-primary" weight="duotone" />
						</div>
						<div>
							<h4 className="font-semibold text-lg">
								<Trans>Ready to practice?</Trans>
							</h4>
							<p className="text-muted-foreground">
								<Trans>Launch practice mode with a timer to simulate a real interview</Trans>
							</p>
						</div>
					</div>
					<Button
						size="lg"
						className="gap-2 bg-gradient-to-r from-primary to-indigo-600 hover:from-primary/90 hover:to-indigo-600/90"
						onClick={startPracticeMode}
					>
						<PlayIcon className="size-5" weight="fill" />
						<Trans>Start Practice</Trans>
					</Button>
				</CardContent>
			</Card>
		</section>
	);
}
