import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import {
	ArrowClockwiseIcon,
	ArrowRightIcon,
	CaretLeftIcon,
	CaretRightIcon,
	ChartLineUpIcon,
	ChatsCircleIcon,
	CheckCircleIcon,
	ClockIcon,
	CloudIcon,
	HouseLineIcon,
	LightbulbIcon,
	ListChecksIcon,
	RocketLaunchIcon,
	SpinnerGapIcon,
	StarIcon,
	TargetIcon,
	TimerIcon,
	TrendUpIcon,
	WarningIcon,
	XCircleIcon,
} from "@phosphor-icons/react";
import { AnimatePresence, motion } from "motion/react";
import { PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, ResponsiveContainer } from "recharts";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/utils/style";

import {
	CATEGORY_CONFIG,
	CHECKLIST_ITEMS,
	HOME_OFFICE_ITEMS,
	LEVEL_CONFIG,
	PRODUCTIVITY_TIPS,
	REMOTE_TOOLS,
} from "./remote-readiness-data";
import type { ImprovementTask, QuizQuestion, ReadinessResult, SkillCategory } from "./remote-readiness-types";

// =============================================================================
// HERO SECTION
// =============================================================================

interface HeroSectionProps {
	totalQuestions: number;
	resultsCount: number;
	isInitialLoading: boolean;
}

export function HeroSection({ totalQuestions, resultsCount, isInitialLoading }: HeroSectionProps) {
	return (
		<motion.div
			className="relative mb-8 overflow-hidden rounded-3xl border border-primary/20 p-8 md:p-12"
			style={{
				background:
					"linear-gradient(135deg, oklch(0.7 0.15 200 / 0.15) 0%, oklch(0.6 0.2 250 / 0.1) 50%, oklch(0.65 0.18 300 / 0.08) 100%)",
			}}
			initial={false}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.6 }}
		>
			<div className="pointer-events-none absolute inset-0 overflow-hidden">
				<motion.div
					className="absolute -top-32 -right-32 size-96 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/10 blur-3xl"
					animate={{ scale: [1, 1.2, 1], rotate: [0, 10, 0] }}
					transition={{ duration: 10, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
				/>
				<motion.div
					className="absolute -bottom-32 -left-32 size-96 rounded-full bg-gradient-to-tr from-green-500/15 to-cyan-500/10 blur-3xl"
					animate={{ scale: [1.2, 1, 1.2], rotate: [0, -10, 0] }}
					transition={{ duration: 10, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
				/>
			</div>

			<div className="relative z-10">
				<motion.div
					className="mb-3 flex items-center gap-2"
					initial={false}
					animate={{ opacity: 1, x: 0 }}
					transition={{ delay: 0.2 }}
				>
					<HouseLineIcon className="size-5 text-primary" weight="fill" />
					<span className="font-semibold text-primary text-sm uppercase tracking-wider">
						<Trans>Remote Work Assessment</Trans>
					</span>
				</motion.div>

				<motion.h2
					className="mb-4 font-bold text-3xl tracking-tight md:text-4xl"
					initial={false}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.3 }}
				>
					<Trans>Are You Ready for Remote Work?</Trans>
				</motion.h2>

				<motion.p
					className="mb-6 max-w-2xl text-muted-foreground"
					initial={false}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.4 }}
				>
					<Trans>
						Assess your skills in communication, time management, technical proficiency, self-discipline, and workspace
						setup. Get personalized recommendations.
					</Trans>
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
							<ListChecksIcon className="size-5 text-primary" weight="duotone" />
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
							<TargetIcon className="size-5 text-green-500" weight="duotone" />
						</div>
						<div>
							<p className="font-bold text-xl">5</p>
							<p className="text-muted-foreground text-sm">
								<Trans>Categories</Trans>
							</p>
						</div>
					</div>
					<div className="flex items-center gap-2">
						<div className="flex size-10 items-center justify-center rounded-full bg-amber-500/10">
							<TargetIcon className="size-5 text-amber-500" weight="duotone" />
						</div>
						<div suppressHydrationWarning>
							{isInitialLoading ? (
								<Skeleton className="h-7 w-8" />
							) : (
								<p className="font-bold text-xl">{resultsCount}</p>
							)}
							<p className="text-muted-foreground text-sm">
								<Trans>Assessments</Trans>
							</p>
						</div>
					</div>
				</motion.div>
			</div>
		</motion.div>
	);
}

// =============================================================================
// QUIZ START CARD
// =============================================================================

interface QuizStartCardProps {
	totalQuestions: number;
	onStart: () => void;
}

export function QuizStartCard({ totalQuestions, onStart }: QuizStartCardProps) {
	return (
		<Card className="border-2 border-primary/20">
			<CardContent className="flex flex-col items-center py-12 text-center">
				<div className="mb-6 flex size-20 items-center justify-center rounded-2xl bg-primary/10">
					<RocketLaunchIcon className="size-10 text-primary" weight="duotone" />
				</div>
				<h3 className="mb-2 font-bold text-2xl">
					<Trans>Assess Your Remote Work Readiness</Trans>
				</h3>
				<p className="mb-6 max-w-md text-muted-foreground">
					<Trans>This {totalQuestions}-question quiz will assess your skills across 5 key areas of remote work.</Trans>
				</p>
				<div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-5">
					{(Object.entries(CATEGORY_CONFIG) as [SkillCategory, (typeof CATEGORY_CONFIG)[SkillCategory]][]).map(
						([category, config]) => {
							const CategoryIcon = config.icon;
							return (
								<div key={category} className="flex flex-col items-center gap-2 rounded-xl border bg-muted/30 p-4">
									<div className={cn("flex size-10 items-center justify-center rounded-lg", config.bgColor)}>
										<CategoryIcon className={cn("size-5", config.color)} weight="duotone" />
									</div>
									<span className="text-center text-xs">{config.label}</span>
								</div>
							);
						},
					)}
				</div>
				<Button size="lg" onClick={onStart} className="gap-2">
					<RocketLaunchIcon className="size-5" />
					<Trans>Start Assessment</Trans>
				</Button>
			</CardContent>
		</Card>
	);
}

// =============================================================================
// QUIZ ACTIVE (PROGRESS + QUESTION)
// =============================================================================

interface QuizActiveProps {
	currentQuestion: QuizQuestion;
	currentQuestionIndex: number;
	totalQuestions: number;
	progress: number;
	selectedOption: string | null;
	isSaving: boolean;
	onSelectOption: (optionId: string) => void;
	onNext: () => void;
	onReset: () => void;
}

export function QuizActive({
	currentQuestion,
	currentQuestionIndex,
	totalQuestions,
	progress,
	selectedOption,
	isSaving,
	onSelectOption,
	onNext,
	onReset,
}: QuizActiveProps) {
	return (
		<>
			{/* Progress */}
			<Card>
				<CardContent className="py-4">
					<div className="mb-4 flex items-center justify-between">
						<Badge
							className={cn(
								CATEGORY_CONFIG[currentQuestion.category].bgColor,
								CATEGORY_CONFIG[currentQuestion.category].color,
							)}
						>
							{CATEGORY_CONFIG[currentQuestion.category].label}
						</Badge>
						<span className="text-muted-foreground text-sm">
							Question {currentQuestionIndex + 1}/{totalQuestions}
						</span>
					</div>
					<Progress value={progress} className="h-2" />
				</CardContent>
			</Card>

			{/* Question */}
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
							<CardTitle className="text-xl leading-relaxed">{currentQuestion.question}</CardTitle>
						</CardHeader>
						<CardContent className="space-y-3">
							{currentQuestion.options.map((option, index) => {
								const isSelected = selectedOption === option.id;

								return (
									<motion.button
										key={option.id}
										type="button"
										initial={{ opacity: 0, y: 10 }}
										animate={{ opacity: 1, y: 0 }}
										transition={{ delay: index * 0.1 }}
										onClick={() => onSelectOption(option.id)}
										className={cn(
											"flex w-full items-center gap-4 rounded-xl border-2 p-4 text-left transition-all",
											isSelected && "border-primary bg-primary/10",
											!isSelected && "border-border hover:border-primary/50",
										)}
									>
										<div
											className={cn(
												"flex size-10 shrink-0 items-center justify-center rounded-lg font-bold",
												isSelected ? "bg-primary text-primary-foreground" : "bg-muted",
											)}
										>
											{String.fromCharCode(65 + index)}
										</div>
										<span className="flex-1">{option.text}</span>
										{isSelected && <CheckCircleIcon className="size-5 text-primary" weight="fill" />}
									</motion.button>
								);
							})}
						</CardContent>
						<CardFooter className="flex justify-between">
							<Button variant="outline" onClick={onReset} className="gap-2">
								<XCircleIcon className="size-4" />
								<Trans>Cancel</Trans>
							</Button>
							<Button onClick={onNext} disabled={!selectedOption || isSaving} className="gap-2">
								{isSaving ? (
									<>
										<SpinnerGapIcon className="size-4 animate-spin" />
										<Trans>Saving...</Trans>
									</>
								) : currentQuestionIndex < totalQuestions - 1 ? (
									<>
										<Trans>Next</Trans>
										<CaretRightIcon className="size-4" />
									</>
								) : (
									<>
										<Trans>View Results</Trans>
										<ChartLineUpIcon className="size-4" />
									</>
								)}
							</Button>
						</CardFooter>
					</Card>
				</motion.div>
			</AnimatePresence>
		</>
	);
}

// =============================================================================
// RESULTS TAB CONTENT
// =============================================================================

interface ResultsTabProps {
	currentResult: ReadinessResult | null;
	radarData: Array<{ skill: string; score: number; fullMark: number }>;
	improvements: ImprovementTask[];
	resultsLoading: boolean;
	resultsError: boolean;
	onSetActiveTab: (tab: string) => void;
}

export function ResultsTabContent({
	currentResult,
	radarData,
	improvements,
	resultsLoading,
	resultsError,
	onSetActiveTab,
}: ResultsTabProps) {
	if (resultsLoading) {
		return (
			<Card>
				<CardContent className="py-12">
					<div className="flex flex-col items-center gap-4">
						<SpinnerGapIcon className="size-8 animate-spin text-primary" />
						<p className="text-muted-foreground">
							<Trans>Loading results...</Trans>
						</p>
					</div>
				</CardContent>
			</Card>
		);
	}

	if (resultsError) {
		return (
			<Card className="border-destructive/50">
				<CardContent className="flex items-center justify-center gap-2 p-8 text-destructive">
					<WarningIcon className="size-5" />
					<span>
						<Trans>Unable to load results. Please try again.</Trans>
					</span>
				</CardContent>
			</Card>
		);
	}

	if (!currentResult) {
		return (
			<Card className="border-dashed">
				<CardContent className="flex flex-col items-center py-12 text-center">
					<ChartLineUpIcon className="mb-4 size-12 text-muted-foreground/50" />
					<h3 className="mb-2 font-medium text-lg">
						<Trans>No results</Trans>
					</h3>
					<p className="mb-4 text-muted-foreground">
						<Trans>Complete the quiz to see your results.</Trans>
					</p>
					<Button onClick={() => onSetActiveTab("quiz")} className="gap-2">
						<RocketLaunchIcon className="size-4" />
						<Trans>Start Quiz</Trans>
					</Button>
				</CardContent>
			</Card>
		);
	}

	return (
		<>
			{/* Score Overview */}
			<Card className="border-2 border-primary/30 bg-gradient-to-br from-primary/10 to-transparent">
				<CardContent className="py-8 text-center">
					<motion.div
						initial={{ scale: 0 }}
						animate={{ scale: 1 }}
						transition={{ type: "spring", bounce: 0.5 }}
						className="mx-auto mb-4 flex size-24 items-center justify-center rounded-full bg-primary/20"
					>
						<StarIcon className="size-12 text-primary" weight="fill" />
					</motion.div>
					<h2 className="mb-2 font-bold text-5xl">{currentResult.percentage}%</h2>
					<Badge className={cn("mb-4 text-lg", LEVEL_CONFIG[currentResult.level].color)}>
						{LEVEL_CONFIG[currentResult.level].label}
					</Badge>
					<p className="mx-auto max-w-md text-muted-foreground">{LEVEL_CONFIG[currentResult.level].description}</p>
				</CardContent>
			</Card>

			{/* Radar Chart + Category Breakdown */}
			<div className="grid gap-6 lg:grid-cols-2">
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<ChartLineUpIcon className="size-5 text-primary" />
							<Trans>Analysis by Skill</Trans>
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="h-80">
							<ResponsiveContainer width="100%" height="100%">
								<RadarChart data={radarData}>
									<PolarGrid stroke="currentColor" strokeOpacity={0.2} />
									<PolarAngleAxis dataKey="skill" tick={{ fill: "currentColor", fontSize: 11 }} />
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
							<TargetIcon className="size-5 text-primary" />
							<Trans>Detail by Category</Trans>
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						{(Object.entries(currentResult.categoryScores) as [SkillCategory, { percentage: number }][]).map(
							([category, data]) => {
								const config = CATEGORY_CONFIG[category];
								const CategoryIcon = config.icon;

								return (
									<div key={category} className="space-y-2">
										<div className="flex items-center justify-between">
											<div className="flex items-center gap-2">
												<CategoryIcon className={cn("size-4", config.color)} />
												<span className="text-sm">{config.label}</span>
											</div>
											<span className="font-bold">{data.percentage}%</span>
										</div>
										<Progress value={data.percentage} className="h-2" />
									</div>
								);
							},
						)}
					</CardContent>
				</Card>
			</div>

			{/* Weak Areas */}
			{improvements.length > 0 && (
				<Card className="border-amber-500/30">
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<LightbulbIcon className="size-5 text-amber-500" />
							<Trans>Identified Improvement Areas</Trans>
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="space-y-4">
							{improvements
								.filter((i) => !i.completed)
								.slice(0, 3)
								.map((improvement) => {
									const config = CATEGORY_CONFIG[improvement.category];
									const ImpIcon = config.icon;

									return (
										<div key={improvement.id} className="flex items-start gap-4 rounded-xl border bg-muted/30 p-4">
											<div
												className={cn("flex size-10 shrink-0 items-center justify-center rounded-lg", config.bgColor)}
											>
												<ImpIcon className={cn("size-5", config.color)} weight="duotone" />
											</div>
											<div className="flex-1">
												<div className="flex items-center gap-2">
													<h4 className="font-medium">{improvement.title}</h4>
													<PriorityBadge priority={improvement.priority} />
												</div>
												<p className="mt-1 text-muted-foreground text-sm">{improvement.description}</p>
											</div>
										</div>
									);
								})}
						</div>
					</CardContent>
				</Card>
			)}

			{/* Actions */}
			<div className="flex flex-wrap justify-center gap-4">
				<Button variant="outline" onClick={() => onSetActiveTab("quiz")} className="gap-2">
					<ArrowClockwiseIcon className="size-4" />
					<Trans>Retake Quiz</Trans>
				</Button>
				<Button onClick={() => onSetActiveTab("checklist")} className="gap-2">
					<CheckCircleIcon className="size-4" />
					<Trans>View Checklist</Trans>
				</Button>
			</div>
		</>
	);
}

// =============================================================================
// CHECKLIST TAB CONTENT
// =============================================================================

interface ChecklistTabProps {
	checklistCheckedItems: string[];
	checklistProgress: number;
	checklistLoading: boolean;
	checklistError: boolean;
	isToggling: boolean;
	togglingItemId: string | undefined;
	onToggle: (itemId: string) => void;
}

export function ChecklistTabContent({
	checklistCheckedItems,
	checklistProgress,
	checklistLoading,
	checklistError,
	isToggling,
	togglingItemId,
	onToggle,
}: ChecklistTabProps) {
	return (
		<Card>
			<CardHeader>
				<div className="flex items-center justify-between">
					<CardTitle className="flex items-center gap-2">
						<CheckCircleIcon className="size-5 text-primary" />
						<Trans>Skills Checklist</Trans>
					</CardTitle>
					{checklistLoading ? (
						<Skeleton className="h-6 w-24" />
					) : (
						<Badge variant="outline" className="gap-1">
							{checklistProgress}% <Trans>complete</Trans>
						</Badge>
					)}
				</div>
				{checklistLoading ? (
					<Skeleton className="mt-2 h-2 w-full" />
				) : (
					<Progress value={checklistProgress} className="mt-2 h-2" />
				)}
			</CardHeader>
			<CardContent className="space-y-6">
				{checklistLoading ? (
					<div className="space-y-4">
						{Array.from({ length: 3 }).map((_, i) => (
							<div key={i} className="space-y-3">
								<Skeleton className="h-5 w-32" />
								<div className="space-y-2 pl-6">
									<Skeleton className="h-12 w-full" />
									<Skeleton className="h-12 w-full" />
								</div>
							</div>
						))}
					</div>
				) : checklistError ? (
					<div className="flex items-center gap-2 text-destructive">
						<WarningIcon className="size-4" />
						<span className="text-sm">
							<Trans>Error loading checklist</Trans>
						</span>
					</div>
				) : (
					(Object.entries(CATEGORY_CONFIG) as [SkillCategory, (typeof CATEGORY_CONFIG)[SkillCategory]][]).map(
						([category, config]) => {
							const categoryItems = CHECKLIST_ITEMS.filter((item) => item.category === category);
							const CategoryIcon = config.icon;

							return (
								<div key={category} className="space-y-3">
									<h4 className="flex items-center gap-2 font-medium">
										<CategoryIcon className={cn("size-4", config.color)} />
										{config.label}
									</h4>
									<div className="space-y-2 pl-6">
										{categoryItems.map((item) => {
											const isChecked = checklistCheckedItems.includes(item.id);
											const isItemToggling = isToggling && togglingItemId === item.id;

											return (
												<button
													key={item.id}
													type="button"
													onClick={() => onToggle(item.id)}
													disabled={isItemToggling}
													className={cn(
														"flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-all",
														isChecked
															? "border-green-500/30 bg-green-50/50 dark:bg-green-950/20"
															: "border-border hover:border-primary/50",
														isItemToggling && "opacity-70",
													)}
												>
													<div
														className={cn(
															"flex size-6 shrink-0 items-center justify-center rounded-full border-2",
															isChecked ? "border-green-500 bg-green-500" : "border-muted-foreground/30",
														)}
													>
														{isItemToggling ? (
															<SpinnerGapIcon className="size-4 animate-spin text-white" />
														) : isChecked ? (
															<CheckCircleIcon className="size-4 text-white" weight="fill" />
														) : null}
													</div>
													<span className={cn("flex-1 text-sm", isChecked && "text-muted-foreground line-through")}>
														{item.text}
													</span>
												</button>
											);
										})}
									</div>
								</div>
							);
						},
					)
				)}
			</CardContent>
		</Card>
	);
}

// =============================================================================
// OFFICE TAB CONTENT
// =============================================================================

interface OfficeTabProps {
	officeCheckedItems: string[];
	officeProgress: number;
	officeLoading: boolean;
	officeError: boolean;
	isToggling: boolean;
	togglingItemId: string | undefined;
	onToggle: (itemId: string) => void;
}

export function OfficeTabContent({
	officeCheckedItems,
	officeProgress,
	officeLoading,
	officeError,
	isToggling,
	togglingItemId,
	onToggle,
}: OfficeTabProps) {
	return (
		<Card>
			<CardHeader>
				<div className="flex items-center justify-between">
					<CardTitle className="flex items-center gap-2">
						<HouseLineIcon className="size-5 text-primary" />
						<Trans>Home Office Equipment Guide</Trans>
					</CardTitle>
					{officeLoading ? (
						<Skeleton className="h-6 w-24" />
					) : (
						<Badge variant="outline" className="gap-1">
							{officeProgress}% <Trans>equipped</Trans>
						</Badge>
					)}
				</div>
				{officeLoading ? (
					<Skeleton className="mt-2 h-2 w-full" />
				) : (
					<Progress value={officeProgress} className="mt-2 h-2" />
				)}
			</CardHeader>
			<CardContent className="space-y-8">
				{officeLoading ? (
					<div className="space-y-6">
						{Array.from({ length: 3 }).map((_, i) => (
							<div key={i} className="space-y-4">
								<Skeleton className="h-5 w-24" />
								<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
									{Array.from({ length: 3 }).map((_, j) => (
										<Skeleton key={j} className="h-24 w-full" />
									))}
								</div>
							</div>
						))}
					</div>
				) : officeError ? (
					<div className="flex items-center gap-2 text-destructive">
						<WarningIcon className="size-4" />
						<span className="text-sm">
							<Trans>Error loading equipment</Trans>
						</span>
					</div>
				) : (
					[
						{
							key: "essential",
							label: "Essential",
							color: "text-red-600",
							bgColor: "bg-red-100 dark:bg-red-900/30",
						},
						{
							key: "recommended",
							label: "Recommended",
							color: "text-amber-600",
							bgColor: "bg-amber-100 dark:bg-amber-900/30",
						},
						{
							key: "nice_to_have",
							label: "Nice to Have",
							color: "text-green-600",
							bgColor: "bg-green-100 dark:bg-green-900/30",
						},
					].map((tier) => {
						const tierItems = HOME_OFFICE_ITEMS.filter((item) => item.category === tier.key);

						return (
							<div key={tier.key} className="space-y-4">
								<h4 className={cn("font-semibold", tier.color)}>{tier.label}</h4>
								<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
									{tierItems.map((item) => {
										const ItemIcon = item.icon;
										const isChecked = officeCheckedItems.includes(item.id);
										const isItemToggling = isToggling && togglingItemId === item.id;

										return (
											<motion.div
												key={item.id}
												whileHover={{ y: -2 }}
												className={cn(
													"cursor-pointer rounded-xl border p-4 transition-all",
													isChecked
														? "border-green-500/50 bg-green-50/50 dark:bg-green-950/20"
														: "border-border hover:border-primary/50",
													isItemToggling && "opacity-70",
												)}
												onClick={() => !isItemToggling && onToggle(item.id)}
											>
												<div className="flex items-start gap-3">
													<div
														className={cn("flex size-10 shrink-0 items-center justify-center rounded-lg", tier.bgColor)}
													>
														<ItemIcon className={cn("size-5", tier.color)} weight="duotone" />
													</div>
													<div className="flex-1">
														<div className="flex items-center gap-2">
															<h5 className="font-medium text-sm">{item.name}</h5>
															{isItemToggling ? (
																<SpinnerGapIcon className="size-4 animate-spin text-green-500" />
															) : isChecked ? (
																<CheckCircleIcon className="size-4 text-green-500" weight="fill" />
															) : null}
														</div>
														<p className="mt-1 text-muted-foreground text-xs">{item.description}</p>
													</div>
												</div>
											</motion.div>
										);
									})}
								</div>
							</div>
						);
					})
				)}
			</CardContent>
		</Card>
	);
}

// =============================================================================
// TIPS TAB CONTENT
// =============================================================================

interface TipsTabProps {
	currentTipIndex: number;
	onNextTip: () => void;
	onPrevTip: () => void;
	onSetTipIndex: (index: number) => void;
}

export function TipsTabContent({ currentTipIndex, onNextTip, onPrevTip, onSetTipIndex }: TipsTabProps) {
	const currentTip = PRODUCTIVITY_TIPS[currentTipIndex];

	return (
		<>
			<Card className="overflow-hidden">
				<CardContent className="p-0">
					<div className="relative bg-gradient-to-br from-primary/10 to-transparent p-8">
						<AnimatePresence mode="wait">
							<motion.div
								key={currentTip.id}
								initial={{ opacity: 0, x: 50 }}
								animate={{ opacity: 1, x: 0 }}
								exit={{ opacity: 0, x: -50 }}
								transition={{ duration: 0.3 }}
								className="text-center"
							>
								<div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-2xl bg-primary/20">
									<currentTip.icon className="size-8 text-primary" weight="duotone" />
								</div>
								<Badge variant="outline" className="mb-4">
									{currentTip.category}
								</Badge>
								<h3 className="mb-3 font-bold text-2xl">{currentTip.title}</h3>
								<p className="mx-auto max-w-xl text-muted-foreground">{currentTip.description}</p>
							</motion.div>
						</AnimatePresence>

						<div className="mt-8 flex items-center justify-center gap-4">
							<Button variant="outline" size="icon" onClick={onPrevTip} aria-label={t`Previous tip`}>
								<CaretLeftIcon className="size-5" />
							</Button>
							<div className="flex gap-1" role="tablist" aria-label={t`Productivity tips`}>
								{PRODUCTIVITY_TIPS.map((_, index) => (
									<button
										key={index}
										type="button"
										role="tab"
										aria-selected={index === currentTipIndex}
										aria-label={t`Tip ${index + 1}`}
										onClick={() => onSetTipIndex(index)}
										className={cn(
											"size-2 rounded-full transition-all",
											index === currentTipIndex ? "w-6 bg-primary" : "bg-muted-foreground/30",
										)}
									/>
								))}
							</div>
							<Button variant="outline" size="icon" onClick={onNextTip} aria-label={t`Next tip`}>
								<CaretRightIcon className="size-5" />
							</Button>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* All Tips Grid */}
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
				{PRODUCTIVITY_TIPS.map((tip, index) => {
					const TipIcon = tip.icon;

					return (
						<motion.div
							key={tip.id}
							initial={false}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: index * 0.05 }}
						>
							<Card className="h-full transition-all hover:shadow-md">
								<CardContent className="p-6">
									<div className="mb-3 flex items-center gap-3">
										<div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
											<TipIcon className="size-5 text-primary" weight="duotone" />
										</div>
										<Badge variant="secondary" className="text-xs">
											{tip.category}
										</Badge>
									</div>
									<h4 className="mb-2 font-semibold">{tip.title}</h4>
									<p className="text-muted-foreground text-sm">{tip.description}</p>
								</CardContent>
							</Card>
						</motion.div>
					);
				})}
			</div>
		</>
	);
}

// =============================================================================
// TOOLS TAB CONTENT
// =============================================================================

export function ToolsTabContent() {
	return (
		<>
			{[
				{ key: "communication", label: "Communication", icon: ChatsCircleIcon },
				{ key: "project_management", label: "Project Management", icon: ListChecksIcon },
				{ key: "time_tracking", label: "Time Tracking", icon: TimerIcon },
				{ key: "file_sharing", label: "File Sharing", icon: CloudIcon },
				{ key: "focus", label: "Focus", icon: TargetIcon },
			].map((category) => {
				const categoryTools = REMOTE_TOOLS.filter((tool) => tool.category === category.key);
				const CategoryIcon = category.icon;

				return (
					<Card key={category.key}>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<CategoryIcon className="size-5 text-primary" />
								{category.label}
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="grid gap-4 md:grid-cols-3">
								{categoryTools.map((tool) => {
									const ToolIcon = tool.icon;

									return (
										<div
											key={tool.id}
											className="rounded-xl border bg-muted/30 p-4 transition-all hover:border-primary/50"
										>
											<div className="flex items-center gap-3">
												<div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
													<ToolIcon className="size-5 text-primary" weight="duotone" />
												</div>
												<div>
													<h4 className="font-medium">{tool.name}</h4>
													<p className="text-muted-foreground text-xs">{tool.description}</p>
												</div>
											</div>
										</div>
									);
								})}
							</div>
						</CardContent>
					</Card>
				);
			})}
		</>
	);
}

// =============================================================================
// PROGRESS TAB CONTENT
// =============================================================================

interface ProgressTabProps {
	checklistProgress: number;
	officeProgress: number;
	improvementProgress: number;
	improvements: ImprovementTask[];
	results: Array<{ id: string; date: string; percentage: number; level: string }>;
	checklistLoading: boolean;
	officeLoading: boolean;
	improvementsLoading: boolean;
	improvementsError: boolean;
	resultsLoading: boolean;
	isImprovementToggling: boolean;
	improvementTogglingId: string | undefined;
	onImprovementToggle: (id: string) => void;
	onViewResult: (result: { id: string; date: string; percentage: number; level: string }) => void;
	onSetActiveTab: (tab: string) => void;
}

export function ProgressTabContent({
	checklistProgress,
	officeProgress,
	improvementProgress,
	improvements,
	results,
	checklistLoading,
	officeLoading,
	improvementsLoading,
	improvementsError,
	resultsLoading,
	isImprovementToggling,
	improvementTogglingId,
	onImprovementToggle,
	onViewResult,
	onSetActiveTab,
}: ProgressTabProps) {
	return (
		<>
			{/* Overall Progress */}
			<div className="grid gap-6 md:grid-cols-3">
				<Card>
					<CardContent className="p-6 text-center">
						{checklistLoading ? (
							<Skeleton className="mx-auto mb-2 h-10 w-16" />
						) : (
							<div className="mb-2 font-bold text-4xl text-primary">{checklistProgress}%</div>
						)}
						<p className="text-muted-foreground text-sm">
							<Trans>Checklist Complete</Trans>
						</p>
						{checklistLoading ? (
							<Skeleton className="mt-4 h-2 w-full" />
						) : (
							<Progress value={checklistProgress} className="mt-4 h-2" />
						)}
					</CardContent>
				</Card>
				<Card>
					<CardContent className="p-6 text-center">
						{officeLoading ? (
							<Skeleton className="mx-auto mb-2 h-10 w-16" />
						) : (
							<div className="mb-2 font-bold text-4xl text-green-600">{officeProgress}%</div>
						)}
						<p className="text-muted-foreground text-sm">
							<Trans>Office Equipped</Trans>
						</p>
						{officeLoading ? (
							<Skeleton className="mt-4 h-2 w-full" />
						) : (
							<Progress value={officeProgress} className="mt-4 h-2" />
						)}
					</CardContent>
				</Card>
				<Card>
					<CardContent className="p-6 text-center">
						{improvementsLoading ? (
							<Skeleton className="mx-auto mb-2 h-10 w-16" />
						) : (
							<div className="mb-2 font-bold text-4xl text-amber-600">{improvementProgress}%</div>
						)}
						<p className="text-muted-foreground text-sm">
							<Trans>Improvements Completed</Trans>
						</p>
						{improvementsLoading ? (
							<Skeleton className="mt-4 h-2 w-full" />
						) : (
							<Progress value={improvementProgress} className="mt-4 h-2" />
						)}
					</CardContent>
				</Card>
			</div>

			{/* Improvement Tasks */}
			{improvementsLoading ? (
				<Card>
					<CardHeader>
						<Skeleton className="h-6 w-48" />
					</CardHeader>
					<CardContent>
						<div className="space-y-4">
							{Array.from({ length: 3 }).map((_, i) => (
								<Skeleton key={i} className="h-20 w-full" />
							))}
						</div>
					</CardContent>
				</Card>
			) : improvementsError ? (
				<Card className="border-destructive/50">
					<CardContent className="flex items-center justify-center gap-2 p-8 text-destructive">
						<WarningIcon className="size-5" />
						<span>
							<Trans>Unable to load improvements. Please try again.</Trans>
						</span>
					</CardContent>
				</Card>
			) : improvements.length > 0 ? (
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<TrendUpIcon className="size-5 text-primary" />
							<Trans>Improvement Tasks</Trans>
						</CardTitle>
						<CardDescription>
							<Trans>Track your progress in areas that need improvement</Trans>
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="space-y-4">
							{improvements.map((task) => {
								const config = CATEGORY_CONFIG[task.category];
								const TaskIcon = config.icon;
								const isTaskToggling = isImprovementToggling && improvementTogglingId === task.id;

								return (
									<button
										key={task.id}
										type="button"
										onClick={() => onImprovementToggle(task.id)}
										disabled={isTaskToggling}
										className={cn(
											"flex w-full items-center gap-4 rounded-xl border p-4 text-left transition-all",
											task.completed
												? "border-green-500/30 bg-green-50/50 dark:bg-green-950/20"
												: "border-border hover:border-primary/50",
											isTaskToggling && "opacity-70",
										)}
									>
										<div
											className={cn(
												"flex size-6 shrink-0 items-center justify-center rounded-full border-2",
												task.completed ? "border-green-500 bg-green-500" : "border-muted-foreground/30",
											)}
										>
											{isTaskToggling ? (
												<SpinnerGapIcon className="size-4 animate-spin text-white" />
											) : task.completed ? (
												<CheckCircleIcon className="size-4 text-white" weight="fill" />
											) : null}
										</div>
										<div className={cn("flex size-10 shrink-0 items-center justify-center rounded-lg", config.bgColor)}>
											<TaskIcon className={cn("size-5", config.color)} weight="duotone" />
										</div>
										<div className="flex-1">
											<div className="flex items-center gap-2">
												<span className={cn("font-medium", task.completed && "text-muted-foreground line-through")}>
													{task.title}
												</span>
												<PriorityBadge priority={task.priority} />
											</div>
											<p className="mt-1 text-muted-foreground text-sm">{task.description}</p>
										</div>
									</button>
								);
							})}
						</div>
					</CardContent>
				</Card>
			) : null}

			{/* History */}
			{resultsLoading ? (
				<Card>
					<CardHeader>
						<Skeleton className="h-6 w-48" />
					</CardHeader>
					<CardContent>
						<div className="space-y-4">
							{Array.from({ length: 3 }).map((_, i) => (
								<Skeleton key={i} className="h-20 w-full" />
							))}
						</div>
					</CardContent>
				</Card>
			) : results.length > 0 ? (
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<ClockIcon className="size-5 text-primary" />
							<Trans>Assessment History</Trans>
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="space-y-4">
							{results
								.slice()
								.reverse()
								.map((result, index) => (
									<motion.div
										key={result.id}
										initial={false}
										animate={{ opacity: 1, x: 0 }}
										transition={{ delay: index * 0.05 }}
										className="flex items-center gap-4 rounded-xl border p-4"
									>
										<div
											className={cn(
												"flex size-14 items-center justify-center rounded-xl",
												result.percentage >= 75
													? "bg-green-100 dark:bg-green-900/30"
													: result.percentage >= 50
														? "bg-amber-100 dark:bg-amber-900/30"
														: "bg-red-100 dark:bg-red-900/30",
											)}
										>
											<span
												className={cn(
													"font-bold text-xl",
													LEVEL_CONFIG[result.level as keyof typeof LEVEL_CONFIG].color,
												)}
											>
												{result.percentage}%
											</span>
										</div>
										<div className="flex-1">
											<div className="flex items-center gap-2">
												<Badge variant="outline">{LEVEL_CONFIG[result.level as keyof typeof LEVEL_CONFIG].label}</Badge>
											</div>
											<p className="mt-1 text-muted-foreground text-sm">
												{new Date(result.date).toLocaleDateString(undefined, {
													day: "numeric",
													month: "long",
													year: "numeric",
													hour: "2-digit",
													minute: "2-digit",
												})}
											</p>
										</div>
										<Button variant="ghost" size="sm" onClick={() => onViewResult(result)}>
											<ArrowRightIcon className="size-4" />
										</Button>
									</motion.div>
								))}
						</div>
					</CardContent>
				</Card>
			) : null}

			{!improvementsLoading && !resultsLoading && improvements.length === 0 && results.length === 0 && (
				<Card className="border-dashed">
					<CardContent className="flex flex-col items-center py-12 text-center">
						<TrendUpIcon className="mb-4 size-12 text-muted-foreground/50" />
						<h3 className="mb-2 font-medium text-lg">
							<Trans>No progress to display</Trans>
						</h3>
						<p className="mb-4 text-muted-foreground">
							<Trans>Complete the quiz to start tracking your progress.</Trans>
						</p>
						<Button onClick={() => onSetActiveTab("quiz")} className="gap-2">
							<RocketLaunchIcon className="size-4" />
							<Trans>Start Quiz</Trans>
						</Button>
					</CardContent>
				</Card>
			)}
		</>
	);
}

// =============================================================================
// SHARED: PRIORITY BADGE
// =============================================================================

function PriorityBadge({ priority }: { priority: "high" | "medium" | "low" }) {
	return (
		<Badge
			variant="outline"
			className={cn(
				priority === "high" && "border-red-500 text-red-500",
				priority === "medium" && "border-amber-500 text-amber-500",
				priority === "low" && "border-green-500 text-green-500",
			)}
		>
			{priority === "high" && <Trans>Priority</Trans>}
			{priority === "medium" && <Trans>Recommended</Trans>}
			{priority === "low" && <Trans>Optional</Trans>}
		</Badge>
	);
}
