// Sub-components for the Review Prep feature

import { Trans } from "@lingui/react/macro";
import {
	ArrowRightIcon,
	CalendarIcon,
	ChartLineUpIcon,
	CheckCircleIcon,
	ClipboardTextIcon,
	ClockIcon,
	CurrencyCircleDollarIcon,
	DownloadSimpleIcon,
	LightbulbIcon,
	ListChecksIcon,
	PlusIcon,
	QuestionIcon,
	RocketLaunchIcon,
	SparkleIcon,
	StarIcon,
	TargetIcon,
	TrendUpIcon,
	TrophyIcon,
	UserIcon,
} from "@phosphor-icons/react";
import { AnimatePresence, motion } from "motion/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { formatDate } from "@/utils/format-date";
import { cn } from "@/utils/style";

import {
	CAREER_GROWTH_TOPICS,
	categoryColors,
	categoryLabels,
	formatCurrency,
	goalCategoryColors,
	goalCategoryLabels,
	MANAGER_QUESTIONS,
	PREPARATION_TIMELINE,
	questionCategoryLabels,
	SELF_ASSESSMENT_QUESTIONS,
	statusConfig,
	TALKING_POINTS,
} from "./review-prep-config";
import type { AccomplishmentEntry } from "./review-prep-types";

// ============================================================================
// Hero Section
// ============================================================================

interface HeroSectionProps {
	accomplishmentsCount: number;
	avgGoalsProgress: number;
	assessmentProgress: number;
}

export function HeroSection({ accomplishmentsCount, avgGoalsProgress, assessmentProgress }: HeroSectionProps) {
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
						<Trans>Performance Review</Trans>
					</span>
				</motion.div>

				<motion.h2
					className="mb-4 bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text font-bold text-3xl text-transparent tracking-tight md:text-4xl lg:text-5xl"
					initial={false}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.3 }}
				>
					<Trans>Prepare Your Annual Review</Trans>
				</motion.h2>

				<motion.p
					className="mb-8 max-w-2xl text-lg text-muted-foreground"
					initial={false}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.4 }}
				>
					<Trans>
						Organize your accomplishments, track your goals, and prepare for a productive discussion with your manager.
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
							<TrophyIcon className="size-5 text-primary" weight="duotone" />
						</div>
						<div>
							<p className="font-bold text-xl">{accomplishmentsCount}</p>
							<p className="text-muted-foreground text-sm">
								<Trans>Accomplishments</Trans>
							</p>
						</div>
					</div>
					<div className="flex items-center gap-2">
						<div className="flex size-10 items-center justify-center rounded-full bg-amber-500/10">
							<TargetIcon className="size-5 text-amber-500" weight="duotone" />
						</div>
						<div>
							<p className="font-bold text-xl">{Math.round(avgGoalsProgress)}%</p>
							<p className="text-muted-foreground text-sm">
								<Trans>Goal progress</Trans>
							</p>
						</div>
					</div>
					<div className="flex items-center gap-2">
						<div className="flex size-10 items-center justify-center rounded-full bg-green-500/10">
							<ListChecksIcon className="size-5 text-green-500" weight="duotone" />
						</div>
						<div>
							<p className="font-bold text-xl">{assessmentProgress}%</p>
							<p className="text-muted-foreground text-sm">
								<Trans>Self-assessment</Trans>
							</p>
						</div>
					</div>
				</motion.div>
			</div>
		</motion.div>
	);
}

// ============================================================================
// Accomplishments Tab
// ============================================================================

interface AccomplishmentsTabProps {
	accomplishmentsByMonth: Record<string, AccomplishmentEntry[]>;
}

export function AccomplishmentsTab({ accomplishmentsByMonth }: AccomplishmentsTabProps) {
	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h3 className="font-semibold text-2xl">
						<Trans>Accomplishments Journal</Trans>
					</h3>
					<p className="text-muted-foreground">
						<Trans>Document your achievements throughout the year</Trans>
					</p>
				</div>
				<Button className="gap-2">
					<PlusIcon className="size-4" />
					<Trans>Add</Trans>
				</Button>
			</div>

			{/* Accomplishments by Month */}
			<div className="space-y-6">
				{Object.entries(accomplishmentsByMonth)
					.sort(([a], [b]) => b.localeCompare(a))
					.map(([monthKey, items]) => (
						<div key={monthKey}>
							<h4 className="mb-4 flex items-center gap-2 font-medium text-lg">
								<CalendarIcon className="size-5 text-primary" />
								{new Date(`${monthKey}-01`).toLocaleDateString(undefined, {
									month: "long",
									year: "numeric",
								})}
								<Badge variant="secondary">{items.length}</Badge>
							</h4>
							<div className="grid gap-4 md:grid-cols-2">
								{items.map((acc, index) => (
									<motion.div
										key={acc.id}
										initial={false}
										animate={{ opacity: 1, y: 0 }}
										transition={{ delay: index * 0.1 }}
									>
										<Card className="h-full transition-all hover:border-primary/50 hover:shadow-md">
											<CardHeader className="pb-2">
												<div className="flex items-start justify-between">
													<Badge className={cn("text-xs", categoryColors[acc.category])}>
														{categoryLabels[acc.category]}
													</Badge>
													<Badge
														variant={
															acc.impact === "high" ? "default" : acc.impact === "medium" ? "secondary" : "outline"
														}
														className={cn(acc.impact === "high" && "bg-green-500")}
													>
														{acc.impact === "high" && "High impact"}
														{acc.impact === "medium" && "Medium impact"}
														{acc.impact === "low" && "Low impact"}
													</Badge>
												</div>
												<CardTitle className="text-lg">{acc.title}</CardTitle>
												<CardDescription className="text-xs">{formatDate(acc.date)}</CardDescription>
											</CardHeader>
											<CardContent>
												<p className="mb-3 text-muted-foreground text-sm">{acc.description}</p>
												{acc.metrics && (
													<div className="flex items-center gap-2 rounded-lg bg-green-500/10 p-2 text-green-700 dark:text-green-400">
														<ChartLineUpIcon className="size-4" />
														<span className="font-medium text-sm">{acc.metrics}</span>
													</div>
												)}
											</CardContent>
										</Card>
									</motion.div>
								))}
							</div>
						</div>
					))}
			</div>
		</div>
	);
}

// ============================================================================
// Goals Tab
// ============================================================================

interface GoalsTabProps {
	goals: Array<{
		id: string;
		title: string;
		description: string;
		category: string;
		status: string;
		progress: number;
		targetDate: string;
		milestones: Array<{ title: string; completed: boolean }>;
	}>;
	goalsProgress: { total: number; completed: number; avgProgress: number };
	expandedGoal: string | null;
	toggleGoalExpand: (goalId: string) => void;
}

export function GoalsTab({ goals, goalsProgress, expandedGoal, toggleGoalExpand }: GoalsTabProps) {
	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h3 className="font-semibold text-2xl">
						<Trans>Goal Tracking</Trans>
					</h3>
					<p className="text-muted-foreground">
						<Trans>Track your progress toward your annual goals</Trans>
					</p>
				</div>
				<Button className="gap-2">
					<PlusIcon className="size-4" />
					<Trans>New goal</Trans>
				</Button>
			</div>

			{/* Progress Overview */}
			<Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
				<CardContent className="py-6">
					<div className="grid gap-6 md:grid-cols-3">
						<div className="text-center">
							<p className="font-bold text-4xl text-primary">{goalsProgress.total}</p>
							<p className="text-muted-foreground">
								<Trans>Total goals</Trans>
							</p>
						</div>
						<div className="text-center">
							<p className="font-bold text-4xl text-green-500">{goalsProgress.completed}</p>
							<p className="text-muted-foreground">
								<Trans>Completed</Trans>
							</p>
						</div>
						<div className="text-center">
							<p className="font-bold text-4xl text-amber-500">{Math.round(goalsProgress.avgProgress)}%</p>
							<p className="text-muted-foreground">
								<Trans>Average progress</Trans>
							</p>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Goals List */}
			<div className="space-y-4">
				{goals.map((goal, index) => {
					const status = statusConfig[goal.status];
					const StatusIcon = status.icon;
					const isExpanded = expandedGoal === goal.id;

					return (
						<motion.div
							key={goal.id}
							initial={false}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: index * 0.1 }}
						>
							<Card className={cn("transition-all", isExpanded && "border-primary/50 shadow-md")}>
								<CardHeader className="pb-2">
									<div className="flex items-start justify-between">
										<div className="flex items-center gap-3">
											<Badge className={cn("text-xs", goalCategoryColors[goal.category])}>
												{goalCategoryLabels[goal.category]}
											</Badge>
											<div className={cn("flex items-center gap-1", status.color)}>
												<StatusIcon className="size-4" weight="fill" />
												<span className="text-sm">{status.label}</span>
											</div>
										</div>
										<Button variant="ghost" size="icon-sm" onClick={() => toggleGoalExpand(goal.id)}>
											{isExpanded ? (
												<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 256 256">
													<path
														fill="currentColor"
														d="M213.66,165.66a8,8,0,0,1-11.32,0L128,91.31,53.66,165.66a8,8,0,0,1-11.32-11.32l80-80a8,8,0,0,1,11.32,0l80,80A8,8,0,0,1,213.66,165.66Z"
													/>
												</svg>
											) : (
												<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 256 256">
													<path
														fill="currentColor"
														d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z"
													/>
												</svg>
											)}
										</Button>
									</div>
									<CardTitle className="text-lg">{goal.title}</CardTitle>
									<CardDescription>{goal.description}</CardDescription>
								</CardHeader>
								<CardContent className="space-y-4">
									<div className="space-y-2">
										<div className="flex items-center justify-between text-sm">
											<span className="text-muted-foreground">
												<Trans>Progress</Trans>
											</span>
											<span className="font-bold">{goal.progress}%</span>
										</div>
										<Progress value={goal.progress} className="h-3" />
									</div>

									<div className="flex items-center gap-2 text-muted-foreground text-sm">
										<CalendarIcon className="size-4" />
										<span>
											<Trans>Deadline:</Trans> {formatDate(goal.targetDate)}
										</span>
									</div>

									<AnimatePresence>
										{isExpanded && (
											<motion.div
												initial={{ opacity: 0, height: 0 }}
												animate={{ opacity: 1, height: "auto" }}
												exit={{ opacity: 0, height: 0 }}
												className="space-y-3 border-t pt-4"
											>
												<h5 className="font-medium">
													<Trans>Milestones</Trans>
												</h5>
												<div className="space-y-2">
													{goal.milestones.map((milestone, i) => (
														<div key={i} className="flex items-center gap-3">
															<CheckCircleIcon
																className={cn(
																	"size-5",
																	milestone.completed ? "text-green-500" : "text-muted-foreground",
																)}
																weight={milestone.completed ? "fill" : "regular"}
															/>
															<span
																className={cn("text-sm", milestone.completed && "text-muted-foreground line-through")}
															>
																{milestone.title}
															</span>
														</div>
													))}
												</div>
											</motion.div>
										)}
									</AnimatePresence>
								</CardContent>
							</Card>
						</motion.div>
					);
				})}
			</div>
		</div>
	);
}

// ============================================================================
// Self Assessment Tab
// ============================================================================

interface SelfAssessmentTabProps {
	selectedAssessmentCategory: string;
	setSelectedAssessmentCategory: (cat: string) => void;
	assessmentResponses: Record<string, string>;
	assessmentProgress: number;
	assessmentQuestions: Array<{ id: string; category: string; question: string; placeholder: string }>;
	handleAssessmentChange: (id: string, value: string) => void;
}

export function SelfAssessmentTab({
	selectedAssessmentCategory,
	setSelectedAssessmentCategory,
	assessmentResponses,
	assessmentProgress,
	assessmentQuestions,
	handleAssessmentChange,
}: SelfAssessmentTabProps) {
	return (
		<div className="space-y-6">
			<div>
				<h3 className="font-semibold text-2xl">
					<Trans>Self-Assessment Templates</Trans>
				</h3>
				<p className="text-muted-foreground">
					<Trans>Reflect on your performance and prepare your answers</Trans>
				</p>
			</div>

			{/* Progress Bar */}
			<Card>
				<CardContent className="py-4">
					<div className="flex items-center justify-between">
						<span className="font-medium">
							<Trans>Self-assessment progress</Trans>
						</span>
						<span className="font-bold text-primary">{assessmentProgress}%</span>
					</div>
					<Progress value={assessmentProgress} className="mt-2 h-2" />
				</CardContent>
			</Card>

			{/* Category Tabs */}
			<div className="flex flex-wrap gap-2">
				{Object.keys(SELF_ASSESSMENT_QUESTIONS).map((cat) => (
					<Button
						key={cat}
						variant={selectedAssessmentCategory === cat ? "default" : "outline"}
						onClick={() => setSelectedAssessmentCategory(cat)}
						className="capitalize"
					>
						{cat === "performance" && "Performance"}
						{cat === "competences" && "Skills"}
						{cat === "collaboration" && "Collaboration"}
						{cat === "leadership" && "Leadership"}
					</Button>
				))}
			</div>

			{/* Questions */}
			<div className="space-y-6">
				{assessmentQuestions.map((question, index) => (
					<motion.div
						key={question.id}
						initial={false}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: index * 0.1 }}
					>
						<Card>
							<CardHeader>
								<div className="flex items-center gap-2">
									<Badge variant="outline">{question.category}</Badge>
									{assessmentResponses[question.id]?.trim() && (
										<CheckCircleIcon className="size-4 text-green-500" weight="fill" />
									)}
								</div>
								<CardTitle className="text-lg">{question.question}</CardTitle>
							</CardHeader>
							<CardContent>
								<textarea
									className="min-h-32 w-full resize-none rounded-lg border bg-background p-4 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
									placeholder={question.placeholder}
									value={assessmentResponses[question.id] || ""}
									onChange={(e) => handleAssessmentChange(question.id, e.target.value)}
								/>
							</CardContent>
						</Card>
					</motion.div>
				))}
			</div>
		</div>
	);
}

// ============================================================================
// Talking Points Tab
// ============================================================================

export function TalkingPointsTab() {
	return (
		<div className="space-y-6">
			<div>
				<h3 className="font-semibold text-2xl">
					<Trans>Discussion Points Generator</Trans>
				</h3>
				<p className="text-muted-foreground">
					<Trans>Prepare your key arguments for the review meeting</Trans>
				</p>
			</div>

			<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
				{TALKING_POINTS.map((point, index) => {
					const PointIcon = point.icon;
					return (
						<motion.div
							key={point.id}
							initial={false}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: index * 0.1 }}
						>
							<Card className="h-full transition-all hover:border-primary/50 hover:shadow-md">
								<CardHeader>
									<div className="mb-2 flex size-12 items-center justify-center rounded-xl bg-primary/10">
										<PointIcon className="size-6 text-primary" weight="duotone" />
									</div>
									<Badge variant="outline" className="w-fit">
										{point.category}
									</Badge>
									<CardTitle className="text-lg">{point.title}</CardTitle>
									<CardDescription>{point.description}</CardDescription>
								</CardHeader>
								<CardContent>
									<ul className="space-y-2">
										{point.tips.map((tip, i) => (
											<li key={i} className="flex items-start gap-2 text-sm">
												<LightbulbIcon className="mt-0.5 size-4 shrink-0 text-amber-500" />
												<span>{tip}</span>
											</li>
										))}
									</ul>
								</CardContent>
							</Card>
						</motion.div>
					);
				})}
			</div>
		</div>
	);
}

// ============================================================================
// Questions Tab
// ============================================================================

export function QuestionsTab() {
	return (
		<div className="space-y-6">
			<div>
				<h3 className="font-semibold text-2xl">
					<Trans>Questions to Ask Your Manager</Trans>
				</h3>
				<p className="text-muted-foreground">
					<Trans>Prepare relevant questions to maximize the meeting</Trans>
				</p>
			</div>

			{/* Group by Category */}
			{(["career", "feedback", "development", "expectations", "support"] as const).map((category) => {
				const questions = MANAGER_QUESTIONS.filter((q) => q.category === category);
				return (
					<Card key={category}>
						<CardHeader>
							<CardTitle className="flex items-center gap-2 text-lg">
								<QuestionIcon className="size-5 text-primary" />
								{questionCategoryLabels[category]}
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="space-y-4">
								{questions.map((q) => (
									<div key={q.id} className="rounded-lg border bg-muted/30 p-4">
										<p className="mb-2 font-medium">{q.question}</p>
										<p className="flex items-center gap-2 text-muted-foreground text-sm">
											<SparkleIcon className="size-4 text-primary" />
											{q.purpose}
										</p>
									</div>
								))}
							</div>
						</CardContent>
					</Card>
				);
			})}
		</div>
	);
}

// ============================================================================
// Salary Research Tab
// ============================================================================

interface SalaryTabProps {
	salaryExpectation: number[];
	setSalaryExpectation: (value: number[]) => void;
	salaryData: Array<{
		role: string;
		level: string;
		avgSalary: number;
		minSalary: number;
		maxSalary: number;
		marketTrend: string;
		source: string;
		lastUpdated: string;
	}>;
}

export function SalaryTab({ salaryExpectation, setSalaryExpectation, salaryData }: SalaryTabProps) {
	return (
		<div className="space-y-6">
			<div>
				<h3 className="font-semibold text-2xl">
					<Trans>Salary Research</Trans>
				</h3>
				<p className="text-muted-foreground">
					<Trans>Research market salaries for your role</Trans>
				</p>
			</div>

			{/* Salary Expectation Slider */}
			<Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<CurrencyCircleDollarIcon className="size-5 text-primary" />
						<Trans>Your Salary Expectation</Trans>
					</CardTitle>
					<CardDescription>
						<Trans>Set your target salary range</Trans>
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-6">
					<div className="text-center">
						<p className="font-bold text-4xl text-primary">{formatCurrency(salaryExpectation[0])}</p>
						<p className="text-muted-foreground">
							<Trans>per year</Trans>
						</p>
					</div>
					<Slider
						value={salaryExpectation}
						onValueChange={setSalaryExpectation}
						min={30000}
						max={120000}
						step={1000}
						className="py-4"
					/>
					<div className="flex justify-between text-muted-foreground text-sm">
						<span>{formatCurrency(30000)}</span>
						<span>{formatCurrency(120000)}</span>
					</div>
				</CardContent>
			</Card>

			{/* Market Data */}
			<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
				{salaryData.map((data, index) => (
					<motion.div
						key={data.role}
						initial={false}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: index * 0.1 }}
					>
						<Card className="h-full">
							<CardHeader>
								<div className="flex items-center justify-between">
									<Badge variant="outline">{data.level}</Badge>
									{data.marketTrend === "up" && (
										<Badge className="gap-1 bg-green-500">
											<TrendUpIcon className="size-3" />
											<Trans>Rising</Trans>
										</Badge>
									)}
									{data.marketTrend === "stable" && (
										<Badge variant="secondary">
											<Trans>Stable</Trans>
										</Badge>
									)}
								</div>
								<CardTitle className="text-lg">{data.role}</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="text-center">
									<p className="font-bold text-3xl text-primary">{formatCurrency(data.avgSalary)}</p>
									<p className="text-muted-foreground text-sm">
										<Trans>Average salary</Trans>
									</p>
								</div>
								<div className="flex justify-between text-sm">
									<div>
										<p className="text-muted-foreground">Min</p>
										<p className="font-medium">{formatCurrency(data.minSalary)}</p>
									</div>
									<div className="text-right">
										<p className="text-muted-foreground">Max</p>
										<p className="font-medium">{formatCurrency(data.maxSalary)}</p>
									</div>
								</div>
								<div className="border-t pt-3 text-muted-foreground text-xs">
									<p>
										Source: {data.source} ({data.lastUpdated})
									</p>
								</div>
							</CardContent>
						</Card>
					</motion.div>
				))}
			</div>

			{/* Tips */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<LightbulbIcon className="size-5 text-amber-500" />
						<Trans>Negotiation Tips</Trans>
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="grid gap-4 md:grid-cols-2">
						{[
							"Base yourself on objective market data",
							"Highlight your accomplishments and their impact",
							"Be prepared to negotiate on other benefits",
							"Choose the right time to bring up the topic",
							"Prepare multiple scenarios (optimistic, realistic, minimum)",
							"Listen to the counter-offer before responding",
						].map((tip, i) => (
							<div key={i} className="flex items-start gap-2">
								<CheckCircleIcon className="mt-0.5 size-4 shrink-0 text-green-500" />
								<span className="text-sm">{tip}</span>
							</div>
						))}
					</div>
				</CardContent>
			</Card>
		</div>
	);
}

// ============================================================================
// Career Growth Tab
// ============================================================================

export function CareerGrowthTab() {
	return (
		<div className="space-y-6">
			<div>
				<h3 className="font-semibold text-2xl">
					<Trans>Growth Discussion Guide</Trans>
				</h3>
				<p className="text-muted-foreground">
					<Trans>Prepare your career growth discussions</Trans>
				</p>
			</div>

			<div className="grid gap-6 md:grid-cols-2">
				{CAREER_GROWTH_TOPICS.map((topic, index) => {
					const TopicIcon = topic.icon;
					return (
						<motion.div
							key={topic.id}
							initial={false}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: index * 0.1 }}
						>
							<Card className="h-full">
								<CardHeader>
									<div className="mb-2 flex size-14 items-center justify-center rounded-2xl bg-primary/10">
										<TopicIcon className="size-7 text-primary" weight="duotone" />
									</div>
									<CardTitle className="text-xl">{topic.title}</CardTitle>
									<CardDescription>{topic.description}</CardDescription>
								</CardHeader>
								<CardContent>
									<h5 className="mb-3 font-medium">
										<Trans>Questions to address:</Trans>
									</h5>
									<ul className="space-y-2">
										{topic.questions.map((q, i) => (
											<li key={i} className="flex items-start gap-2 text-sm">
												<ArrowRightIcon className="mt-1 size-3 shrink-0 text-primary" />
												<span>{q}</span>
											</li>
										))}
									</ul>
								</CardContent>
							</Card>
						</motion.div>
					);
				})}
			</div>

			{/* Career Path Visualization */}
			<Card className="overflow-hidden">
				<CardHeader className="border-b bg-gradient-to-r from-primary/10 to-transparent">
					<CardTitle className="flex items-center gap-2">
						<RocketLaunchIcon className="size-5 text-primary" />
						<Trans>Your Career Trajectory</Trans>
					</CardTitle>
				</CardHeader>
				<CardContent className="p-6">
					<div className="relative">
						<div className="absolute top-1/2 right-0 left-0 h-1 -translate-y-1/2 bg-gradient-to-r from-primary/20 via-primary to-primary/20" />
						<div className="relative grid grid-cols-4 gap-4">
							{[
								{ level: "Junior", years: "0-2 ans", current: false },
								{ level: "Confirme", years: "2-5 ans", current: true },
								{ level: "Senior", years: "5-8 ans", current: false },
								{ level: "Lead/Manager", years: "8+ ans", current: false },
							].map((stage, i) => (
								<div key={i} className="text-center">
									<div
										className={cn(
											"mx-auto mb-3 flex size-12 items-center justify-center rounded-full border-4 border-background",
											stage.current
												? "bg-primary text-primary-foreground shadow-lg shadow-primary/30"
												: "bg-muted text-muted-foreground",
										)}
									>
										{stage.current ? (
											<StarIcon className="size-5" weight="fill" />
										) : (
											<span className="font-bold text-sm">{i + 1}</span>
										)}
									</div>
									<p className={cn("font-medium", stage.current && "text-primary")}>{stage.level}</p>
									<p className="text-muted-foreground text-xs">{stage.years}</p>
								</div>
							))}
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}

// ============================================================================
// Timeline Tab
// ============================================================================

interface TimelineTabProps {
	timelineProgress: Record<string, boolean[]>;
	toggleTimelineTask: (phaseId: string, taskIndex: number) => void;
	getPhaseProgress: (phaseId: string) => number;
	accomplishmentsCount: number;
	goalsCount: number;
	assessmentProgress: number;
}

export function TimelineTab({
	timelineProgress,
	toggleTimelineTask,
	getPhaseProgress,
	accomplishmentsCount,
	goalsCount,
	assessmentProgress,
}: TimelineTabProps) {
	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h3 className="font-semibold text-2xl">
						<Trans>Preparation Schedule</Trans>
					</h3>
					<p className="text-muted-foreground">
						<Trans>Follow this timeline for optimal preparation</Trans>
					</p>
				</div>
				<Button variant="outline" className="gap-2">
					<DownloadSimpleIcon className="size-4" />
					<Trans>Export</Trans>
				</Button>
			</div>

			{/* Timeline */}
			<div className="space-y-6">
				{PREPARATION_TIMELINE.map((phase, index) => {
					const PhaseIcon = phase.icon;
					const progress = getPhaseProgress(phase.id);
					const tasks = timelineProgress[phase.id] || phase.tasks.map(() => false);

					return (
						<motion.div
							key={phase.id}
							initial={false}
							animate={{ opacity: 1, x: 0 }}
							transition={{ delay: index * 0.15 }}
						>
							<Card className={cn("transition-all", progress === 100 && "border-green-500/50")}>
								<CardHeader>
									<div className="flex items-start justify-between">
										<div className="flex items-center gap-4">
											<div
												className={cn(
													"flex size-14 items-center justify-center rounded-2xl",
													progress === 100 ? "bg-green-500/20" : "bg-primary/10",
												)}
											>
												<PhaseIcon
													className={cn("size-7", progress === 100 ? "text-green-500" : "text-primary")}
													weight="duotone"
												/>
											</div>
											<div>
												<CardTitle className="text-lg">{phase.title}</CardTitle>
												<CardDescription>{phase.description}</CardDescription>
											</div>
										</div>
										<Badge
											variant={progress === 100 ? "default" : "secondary"}
											className={cn(progress === 100 && "bg-green-500")}
										>
											{progress}%
										</Badge>
									</div>
								</CardHeader>
								<CardContent className="space-y-4">
									<div className="flex items-center gap-2 text-muted-foreground text-sm">
										<ClockIcon className="size-4" />
										<span>{phase.dueDate}</span>
									</div>
									<div className="space-y-2">
										{phase.tasks.map((task, taskIndex) => (
											<button
												key={taskIndex}
												type="button"
												onClick={() => toggleTimelineTask(phase.id, taskIndex)}
												className={cn(
													"flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-all",
													tasks[taskIndex]
														? "border-green-500/50 bg-green-500/10"
														: "hover:border-primary/50 hover:bg-primary/5",
												)}
											>
												<CheckCircleIcon
													className={cn("size-5", tasks[taskIndex] ? "text-green-500" : "text-muted-foreground")}
													weight={tasks[taskIndex] ? "fill" : "regular"}
												/>
												<span className={cn("text-sm", tasks[taskIndex] && "text-muted-foreground line-through")}>
													{task.title}
												</span>
											</button>
										))}
									</div>
								</CardContent>
							</Card>
						</motion.div>
					);
				})}
			</div>

			{/* Export Summary */}
			<Card className="border-2 border-primary/30 border-dashed">
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<DownloadSimpleIcon className="size-5 text-primary" />
						<Trans>Export Preparation Summary</Trans>
					</CardTitle>
					<CardDescription>
						<Trans>Generate a PDF document with all your preparation materials</Trans>
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="grid gap-4 md:grid-cols-3">
						<div className="rounded-lg border p-4 text-center">
							<TrophyIcon className="mx-auto mb-2 size-8 text-primary" weight="duotone" />
							<p className="font-medium">
								<Trans>Accomplishments</Trans>
							</p>
							<p className="text-muted-foreground text-sm">{accomplishmentsCount} entries</p>
						</div>
						<div className="rounded-lg border p-4 text-center">
							<TargetIcon className="mx-auto mb-2 size-8 text-primary" weight="duotone" />
							<p className="font-medium">
								<Trans>Goals</Trans>
							</p>
							<p className="text-muted-foreground text-sm">
								<Trans>{goalsCount} goals</Trans>
							</p>
						</div>
						<div className="rounded-lg border p-4 text-center">
							<UserIcon className="mx-auto mb-2 size-8 text-primary" weight="duotone" />
							<p className="font-medium">
								<Trans>Self-assessment</Trans>
							</p>
							<p className="text-muted-foreground text-sm">
								<Trans>{assessmentProgress}% complete</Trans>
							</p>
						</div>
					</div>
				</CardContent>
				<CardFooter>
					<Button className="w-full gap-2">
						<DownloadSimpleIcon className="size-4" />
						<Trans>Download PDF Summary</Trans>
					</Button>
				</CardFooter>
			</Card>
		</div>
	);
}
