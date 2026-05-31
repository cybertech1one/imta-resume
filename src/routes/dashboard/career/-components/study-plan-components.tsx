import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import type { Icon } from "@phosphor-icons/react";
import {
	ArrowRightIcon,
	BookBookmarkIcon,
	BookOpenIcon,
	BrainIcon,
	CalendarIcon,
	CaretLeftIcon,
	CaretRightIcon,
	ChartLineUpIcon,
	CheckCircleIcon,
	ClockIcon,
	DownloadSimpleIcon,
	FireIcon,
	FlagIcon,
	ListChecksIcon,
	MagnifyingGlassIcon,
	PencilSimpleIcon,
	PlusCircleIcon,
	PlusIcon,
	RocketLaunchIcon,
	SparkleIcon,
	StarIcon,
	TargetIcon,
	TrashIcon,
	TrophyIcon,
} from "@phosphor-icons/react";
import { AnimatePresence, motion } from "motion/react";
import { StarRating } from "@/components/shared/star-rating";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/utils/style";
import { GAMIFICATION_BADGES, INDUSTRIES, PLATFORMS, RESOURCE_TYPES, SKILL_CATEGORIES } from "./study-plan-config";
import type {
	AchievementsTabProps,
	FlashcardsTabProps,
	HeroSectionProps,
	LearningResource,
	OverviewTabProps,
	ResourcesTabProps,
	ScheduleTabProps,
	Skill,
	SkillsGapTabProps,
} from "./study-plan-types";
import { formatDate, formatDuration, getDaysUntil, isOverdue, isToday } from "./study-plan-utils";

function RadialProgress({
	progress,
	size = 120,
	strokeWidth = 10,
	label,
	sublabel,
}: {
	progress: number;
	size?: number;
	strokeWidth?: number;
	label?: string;
	sublabel?: string;
}) {
	const radius = (size - strokeWidth) / 2;
	const circumference = 2 * Math.PI * radius;
	const offset = circumference - (progress / 100) * circumference;

	return (
		<div className="relative" style={{ width: size, height: size }}>
			<svg viewBox={`0 0 ${size} ${size}`} className="rotate-[-90deg]">
				<circle
					cx={size / 2}
					cy={size / 2}
					r={radius}
					fill="none"
					stroke="currentColor"
					strokeWidth={strokeWidth}
					className="text-muted/30"
				/>
				<motion.circle
					cx={size / 2}
					cy={size / 2}
					r={radius}
					fill="none"
					stroke="currentColor"
					strokeWidth={strokeWidth}
					strokeLinecap="round"
					strokeDasharray={circumference}
					initial={{ strokeDashoffset: circumference }}
					animate={{ strokeDashoffset: offset }}
					transition={{ duration: 1, ease: "easeOut" }}
					className="text-primary"
				/>
			</svg>
			<div className="absolute inset-0 flex flex-col items-center justify-center">
				<span className="font-bold text-2xl">{Math.round(progress)}%</span>
				{label && <span className="text-muted-foreground text-xs">{label}</span>}
				{sublabel && <span className="text-[10px] text-muted-foreground">{sublabel}</span>}
			</div>
		</div>
	);
}

// --- Hero Section ---

export function HeroSection({ data }: HeroSectionProps) {
	return (
		<motion.div
			className="relative mb-8 overflow-hidden rounded-3xl border border-primary/20 p-8 md:p-12"
			style={{
				background:
					"linear-gradient(135deg, oklch(0.7 0.15 200 / 0.15) 0%, oklch(0.6 0.2 260 / 0.1) 50%, oklch(0.65 0.18 320 / 0.08) 100%)",
			}}
			initial={false}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.6, ease: "easeOut" }}
		>
			<div className="pointer-events-none absolute inset-0 overflow-hidden">
				<motion.div
					className="absolute -top-32 -right-32 size-96 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/10 blur-3xl"
					animate={{ scale: [1, 1.2, 1], rotate: [0, 10, 0], opacity: [0.5, 0.3, 0.5] }}
					transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
				/>
				<motion.div
					className="absolute -bottom-32 -left-32 size-96 rounded-full bg-gradient-to-tr from-blue-500/15 to-cyan-500/10 blur-3xl"
					animate={{ scale: [1.2, 1, 1.2], rotate: [0, -10, 0], opacity: [0.3, 0.5, 0.3] }}
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
					<SparkleIcon className="size-5 text-primary" weight="fill" />
					<span className="font-semibold text-primary text-sm uppercase tracking-wider">
						<Trans>AI-Powered Learning</Trans>
					</span>
				</motion.div>

				<motion.h2
					className="mb-4 bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text font-bold text-3xl text-transparent tracking-tight md:text-4xl lg:text-5xl"
					initial={false}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.3 }}
				>
					<Trans>Study Plan Generator</Trans>
				</motion.h2>

				<motion.p
					className="mb-8 max-w-2xl text-lg text-muted-foreground"
					initial={false}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.4 }}
				>
					<Trans>
						Create personalized learning roadmaps with AI assistance. Track your progress, manage resources, and achieve
						your career goals with smart study scheduling.
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
							<FireIcon className="size-5 text-primary" weight="duotone" />
						</div>
						<div>
							<p className="font-bold text-xl">{data.streak.currentStreak}</p>
							<p className="text-muted-foreground text-sm">
								<Trans>Day Streak</Trans>
							</p>
						</div>
					</div>
					<div className="flex items-center gap-2">
						<div className="flex size-10 items-center justify-center rounded-full bg-amber-500/10">
							<ListChecksIcon className="size-5 text-amber-500" weight="duotone" />
						</div>
						<div>
							<p className="font-bold text-xl">{data.skills.length}</p>
							<p className="text-muted-foreground text-sm">
								<Trans>Skills</Trans>
							</p>
						</div>
					</div>
					<div className="flex items-center gap-2">
						<div className="flex size-10 items-center justify-center rounded-full bg-green-500/10">
							<TrophyIcon className="size-5 text-green-500" weight="duotone" />
						</div>
						<div>
							<p className="font-bold text-xl">{data.milestones.filter((m) => m.completed).length}</p>
							<p className="text-muted-foreground text-sm">
								<Trans>Milestones</Trans>
							</p>
						</div>
					</div>
					<div className="flex items-center gap-2">
						<div className="flex size-10 items-center justify-center rounded-full bg-purple-500/10">
							<ClockIcon className="size-5 text-purple-500" weight="duotone" />
						</div>
						<div>
							<p className="font-bold text-xl">{formatDuration(data.streak.totalStudyMinutes)}</p>
							<p className="text-muted-foreground text-sm">
								<Trans>Study Time</Trans>
							</p>
						</div>
					</div>
				</motion.div>
			</div>
		</motion.div>
	);
}

// --- Overview Tab ---

export function OverviewTab({
	data,
	overallProgress,
	todayTasks,
	weekProgress,
	isGoalDialogOpen,
	setIsGoalDialogOpen,
	goalForm,
	setGoalForm,
	handleSaveGoal,
	handleGenerateRoadmap,
	handleExportPDF,
	handleToggleTask,
	handleToggleMilestone,
	isGenerating,
}: OverviewTabProps) {
	return (
		<div className="space-y-8">
			{/* Career Goal Card */}
			<Card className="overflow-hidden">
				<CardHeader className="border-b bg-gradient-to-r from-primary/5 to-transparent">
					<div className="flex items-center justify-between">
						<div>
							<CardTitle className="flex items-center gap-2">
								<RocketLaunchIcon className="size-5 text-primary" weight="duotone" />
								<Trans>Career Goal</Trans>
							</CardTitle>
							<CardDescription>
								<Trans>Define your target role and timeline</Trans>
							</CardDescription>
						</div>
						<Dialog open={isGoalDialogOpen} onOpenChange={setIsGoalDialogOpen}>
							<DialogTrigger asChild>
								<Button variant={data.careerGoal ? "outline" : "default"} size="sm" className="gap-2">
									{data.careerGoal ? <PencilSimpleIcon className="size-4" /> : <PlusIcon className="size-4" />}
									{data.careerGoal ? <Trans>Edit Goal</Trans> : <Trans>Set Goal</Trans>}
								</Button>
							</DialogTrigger>
							<DialogContent>
								<DialogHeader>
									<DialogTitle>
										<Trans>Set Career Goal</Trans>
									</DialogTitle>
									<DialogDescription>
										<Trans>Define your target role to generate a personalized learning path</Trans>
									</DialogDescription>
								</DialogHeader>
								<div className="space-y-4 py-4">
									<div className="space-y-2">
										<label className="font-medium text-sm">
											<Trans>Target Role</Trans>
										</label>
										<Input
											value={goalForm.targetRole}
											onChange={(e) => setGoalForm({ ...goalForm, targetRole: e.target.value })}
											placeholder={t`e.g., HSE Coordinator, Nurse, Technician`}
										/>
									</div>
									<div className="space-y-2">
										<label className="font-medium text-sm">
											<Trans>Industry</Trans>
										</label>
										<Select value={goalForm.industry} onValueChange={(v) => setGoalForm({ ...goalForm, industry: v })}>
											<SelectTrigger>
												<SelectValue placeholder={t`Select industry`} />
											</SelectTrigger>
											<SelectContent>
												{INDUSTRIES.map((ind) => (
													<SelectItem key={ind.value} value={ind.value}>
														{ind.label}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									</div>
									<div className="space-y-2">
										<label className="font-medium text-sm">
											<Trans>Timeline (months)</Trans>
										</label>
										<Select
											value={goalForm.timeline.toString()}
											onValueChange={(v) => setGoalForm({ ...goalForm, timeline: parseInt(v, 10) })}
										>
											<SelectTrigger>
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												{[3, 6, 9, 12, 18, 24].map((m) => (
													<SelectItem key={m} value={m.toString()}>
														{m} <Trans>months</Trans>
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									</div>
									<div className="space-y-2">
										<label className="font-medium text-sm">
											<Trans>Description (optional)</Trans>
										</label>
										<Textarea
											value={goalForm.description}
											onChange={(e) => setGoalForm({ ...goalForm, description: e.target.value })}
											placeholder={t`Describe your career aspirations...`}
											rows={3}
										/>
									</div>
								</div>
								<DialogFooter>
									<DialogClose asChild>
										<Button variant="outline">
											<Trans>Cancel</Trans>
										</Button>
									</DialogClose>
									<Button onClick={handleSaveGoal} disabled={!goalForm.targetRole || !goalForm.industry}>
										<Trans>Save Goal</Trans>
									</Button>
								</DialogFooter>
							</DialogContent>
						</Dialog>
					</div>
				</CardHeader>
				<CardContent className="p-6">
					{data.careerGoal ? (
						<div className="grid gap-6 md:grid-cols-2">
							<div className="space-y-4">
								<div className="flex items-center gap-3">
									<div className="flex size-12 items-center justify-center rounded-xl bg-primary/10">
										<TargetIcon className="size-6 text-primary" weight="duotone" />
									</div>
									<div>
										<p className="font-bold text-xl">{data.careerGoal.targetRole}</p>
										<p className="text-muted-foreground">
											{INDUSTRIES.find((i) => i.value === data.careerGoal?.industry)?.label}
										</p>
									</div>
								</div>
								<div className="flex items-center gap-4 text-sm">
									<Badge variant="outline" className="gap-1">
										<CalendarIcon className="size-3" />
										{data.careerGoal.timeline} <Trans>months</Trans>
									</Badge>
									<Badge variant="outline" className="gap-1">
										<ClockIcon className="size-3" />
										<Trans>Started</Trans>{" "}
										{formatDate(data.careerGoal.createdAt, { day: "numeric", month: "short", year: "numeric" })}
									</Badge>
								</div>
								{data.careerGoal.description && (
									<p className="text-muted-foreground text-sm">{data.careerGoal.description}</p>
								)}
							</div>
							<div className="flex items-center justify-center">
								<RadialProgress progress={overallProgress} label={t`Progress`} sublabel={t`Overall`} />
							</div>
						</div>
					) : (
						<div className="rounded-xl border border-dashed p-8 text-center">
							<TargetIcon className="mx-auto mb-4 size-12 text-muted-foreground/50" />
							<h3 className="mb-2 font-medium">
								<Trans>No Career Goal Set</Trans>
							</h3>
							<p className="mb-4 text-muted-foreground text-sm">
								<Trans>Set your career goal to get a personalized AI-generated study plan</Trans>
							</p>
						</div>
					)}
				</CardContent>
				{data.careerGoal && (
					<CardFooter className="border-t bg-muted/30 p-4">
						<Button onClick={handleGenerateRoadmap} disabled={isGenerating} className="gap-2">
							{isGenerating ? (
								<>
									<motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
										<SparkleIcon className="size-4" />
									</motion.div>
									<Trans>Generating...</Trans>
								</>
							) : (
								<>
									<SparkleIcon className="size-4" weight="fill" />
									<Trans>Generate AI Roadmap</Trans>
								</>
							)}
						</Button>
						<Button variant="outline" onClick={handleExportPDF} className="ml-2 gap-2">
							<DownloadSimpleIcon className="size-4" />
							<Trans>Export Plan</Trans>
						</Button>
					</CardFooter>
				)}
			</Card>

			{/* Today's Tasks & Progress */}
			<div className="grid gap-6 md:grid-cols-2">
				{/* Today's Tasks */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<CalendarIcon className="size-5 text-primary" weight="duotone" />
							<Trans>Today's Tasks</Trans>
							<Badge variant="secondary">{todayTasks.length}</Badge>
						</CardTitle>
					</CardHeader>
					<CardContent>
						{todayTasks.length === 0 ? (
							<div className="rounded-lg border border-dashed p-6 text-center">
								<CheckCircleIcon className="mx-auto mb-2 size-8 text-green-500" weight="fill" />
								<p className="text-muted-foreground text-sm">
									<Trans>No tasks for today. Great job staying on track!</Trans>
								</p>
							</div>
						) : (
							<div className="space-y-3">
								{todayTasks.map((task) => {
									const skill = data.skills.find((s) => s.id === task.skillId);
									return (
										<motion.div
											key={task.id}
											initial={false}
											animate={{ opacity: 1, x: 0 }}
											className={cn(
												"flex items-center gap-3 rounded-lg border p-3 transition-all",
												task.completed && "border-green-500/50 bg-green-500/5",
											)}
										>
											<button
												type="button"
												onClick={() => handleToggleTask(task.id)}
												className={cn(
													"flex size-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
													task.completed
														? "border-green-500 bg-green-500 text-white"
														: "border-muted-foreground/30 hover:border-primary",
												)}
											>
												{task.completed && <CheckCircleIcon className="size-4" weight="fill" />}
											</button>
											<div className="min-w-0 flex-1">
												<p className={cn("font-medium", task.completed && "text-muted-foreground line-through")}>
													{task.title}
												</p>
												<div className="flex items-center gap-2 text-muted-foreground text-xs">
													{skill && <span>{skill.name}</span>}
													<span>-</span>
													<span>{formatDuration(task.duration)}</span>
												</div>
											</div>
											<Badge variant="outline" className="shrink-0 text-xs">
												{task.type}
											</Badge>
										</motion.div>
									);
								})}
							</div>
						)}
					</CardContent>
				</Card>

				{/* Weekly Progress */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<ChartLineUpIcon className="size-5 text-primary" weight="duotone" />
							<Trans>Weekly Progress</Trans>
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-6">
						<div className="flex items-center justify-center">
							<RadialProgress
								progress={weekProgress}
								label={t`of goal`}
								sublabel={`${formatDuration(data.streak.weeklyGoal)}/week`}
							/>
						</div>
						<div className="space-y-3">
							<div className="flex items-center justify-between text-sm">
								<span className="text-muted-foreground">
									<Trans>Study Streak</Trans>
								</span>
								<div className="flex items-center gap-1">
									<FireIcon className="size-4 text-orange-500" weight="fill" />
									<span className="font-bold">{data.streak.currentStreak} days</span>
								</div>
							</div>
							<div className="flex items-center justify-between text-sm">
								<span className="text-muted-foreground">
									<Trans>Longest Streak</Trans>
								</span>
								<span className="font-medium">{data.streak.longestStreak} days</span>
							</div>
							<div className="flex items-center justify-between text-sm">
								<span className="text-muted-foreground">
									<Trans>Total Study Days</Trans>
								</span>
								<span className="font-medium">{data.streak.totalStudyDays} days</span>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Milestones Timeline */}
			{data.milestones.length > 0 && (
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<FlagIcon className="size-5 text-primary" weight="duotone" />
							<Trans>Milestones</Trans>
						</CardTitle>
						<CardDescription>
							<Trans>Track your progress through key achievements</Trans>
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="relative">
							<div className="absolute top-0 bottom-0 left-6 w-0.5 bg-border md:left-1/2" />
							<div className="space-y-8">
								{data.milestones.map((milestone, index) => {
									const daysUntil = getDaysUntil(milestone.targetDate);
									const isOverdueItem = !milestone.completed && daysUntil < 0;

									return (
										<motion.div
											key={milestone.id}
											initial={false}
											animate={{ opacity: 1, y: 0 }}
											transition={{ delay: index * 0.1 }}
											className={cn(
												"relative flex gap-4 md:gap-8",
												index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse",
											)}
										>
											<div className="hidden flex-1 md:block" />
											<div
												className={cn(
													"absolute left-6 z-10 flex size-3 -translate-x-1/2 items-center justify-center rounded-full md:left-1/2",
													milestone.completed ? "bg-green-500" : isOverdueItem ? "bg-red-500" : "bg-primary",
												)}
											/>
											<Card
												className={cn(
													"ml-10 flex-1 transition-all md:ml-0",
													milestone.completed && "border-green-500/50",
													isOverdueItem && "border-red-500/50",
												)}
											>
												<CardContent className="p-4">
													<div className="mb-2 flex items-start justify-between">
														<div>
															<h4 className="font-medium">{milestone.title}</h4>
															<p className="text-muted-foreground text-sm">{milestone.description}</p>
														</div>
														<button
															type="button"
															onClick={() => handleToggleMilestone(milestone.id)}
															className={cn(
																"flex size-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
																milestone.completed
																	? "border-green-500 bg-green-500 text-white"
																	: "border-muted-foreground/30 hover:border-primary",
															)}
														>
															{milestone.completed && <CheckCircleIcon className="size-4" weight="fill" />}
														</button>
													</div>
													<div className="flex items-center gap-2">
														<Badge
															variant={milestone.completed ? "default" : isOverdueItem ? "destructive" : "secondary"}
															className="text-xs"
														>
															{milestone.completed ? (
																<>
																	<CheckCircleIcon className="mr-1 size-3" />
																	<Trans>Completed</Trans>
																</>
															) : isOverdueItem ? (
																<Trans>Overdue</Trans>
															) : (
																<>
																	{daysUntil} <Trans>days left</Trans>
																</>
															)}
														</Badge>
														<span className="text-muted-foreground text-xs">
															{formatDate(milestone.targetDate, {
																day: "numeric",
																month: "short",
																year: "numeric",
															})}
														</span>
													</div>
												</CardContent>
											</Card>
										</motion.div>
									);
								})}
							</div>
						</div>
					</CardContent>
				</Card>
			)}
		</div>
	);
}

// --- Skills Gap Tab ---

export function SkillsGapTab({
	data,
	isSkillDialogOpen,
	setIsSkillDialogOpen,
	skillForm,
	setSkillForm,
	handleAddSkill,
	handleUpdateSkillLevel,
	handleDeleteSkill,
}: SkillsGapTabProps) {
	return (
		<div className="space-y-8">
			<div className="flex items-center justify-between">
				<div>
					<h3 className="font-semibold text-xl">
						<Trans>Skills Gap Analysis</Trans>
					</h3>
					<p className="text-muted-foreground text-sm">
						<Trans>Track your current vs target skill levels</Trans>
					</p>
				</div>
				<Dialog open={isSkillDialogOpen} onOpenChange={setIsSkillDialogOpen}>
					<DialogTrigger asChild>
						<Button className="gap-2">
							<PlusCircleIcon className="size-4" />
							<Trans>Add Skill</Trans>
						</Button>
					</DialogTrigger>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>
								<Trans>Add New Skill</Trans>
							</DialogTitle>
						</DialogHeader>
						<div className="space-y-4 py-4">
							<div className="space-y-2">
								<label className="font-medium text-sm">
									<Trans>Skill Name</Trans>
								</label>
								<Input
									value={skillForm.name}
									onChange={(e) => setSkillForm({ ...skillForm, name: e.target.value })}
									placeholder={t`e.g., Python, Leadership, French`}
								/>
							</div>
							<div className="space-y-2">
								<label className="font-medium text-sm">
									<Trans>Category</Trans>
								</label>
								<Select
									value={skillForm.category}
									onValueChange={(v) => setSkillForm({ ...skillForm, category: v as Skill["category"] })}
								>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										{Object.entries(SKILL_CATEGORIES).map(([key, val]) => (
											<SelectItem key={key} value={key}>
												{val.label}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
							<div className="space-y-2">
								<label className="font-medium text-sm">
									<Trans>Current Level</Trans>
								</label>
								<StarRating
									rating={skillForm.currentLevel}
									onRatingChange={(r) => setSkillForm({ ...skillForm, currentLevel: r })}
									size="large"
								/>
							</div>
							<div className="space-y-2">
								<label className="font-medium text-sm">
									<Trans>Target Level</Trans>
								</label>
								<StarRating
									rating={skillForm.targetLevel}
									onRatingChange={(r) => setSkillForm({ ...skillForm, targetLevel: r })}
									size="large"
								/>
							</div>
							<div className="space-y-2">
								<label className="font-medium text-sm">
									<Trans>Priority</Trans>
								</label>
								<Select
									value={skillForm.priority}
									onValueChange={(v) => setSkillForm({ ...skillForm, priority: v as Skill["priority"] })}
								>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="high">High</SelectItem>
										<SelectItem value="medium">Medium</SelectItem>
										<SelectItem value="low">Low</SelectItem>
									</SelectContent>
								</Select>
							</div>
						</div>
						<DialogFooter>
							<DialogClose asChild>
								<Button variant="outline">
									<Trans>Cancel</Trans>
								</Button>
							</DialogClose>
							<Button onClick={handleAddSkill} disabled={!skillForm.name}>
								<Trans>Add Skill</Trans>
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			</div>

			{data.skills.length === 0 ? (
				<Card className="border-dashed">
					<CardContent className="flex flex-col items-center py-12 text-center">
						<TargetIcon className="mb-4 size-12 text-muted-foreground/50" />
						<h3 className="mb-2 font-medium">
							<Trans>No Skills Added</Trans>
						</h3>
						<p className="mb-4 max-w-sm text-muted-foreground text-sm">
							<Trans>Add skills to track your progress or generate an AI roadmap from your career goal.</Trans>
						</p>
					</CardContent>
				</Card>
			) : (
				<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
					{data.skills.map((skill, index) => {
						const category = SKILL_CATEGORIES[skill.category];
						const CategoryIcon = category.icon;
						const progress = ((skill.currentLevel - 1) / (skill.targetLevel - 1)) * 100;
						const isComplete = skill.currentLevel >= skill.targetLevel;

						return (
							<motion.div
								key={skill.id}
								initial={false}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: index * 0.05 }}
							>
								<Card className={cn("h-full transition-all hover:shadow-lg", isComplete && "border-green-500/50")}>
									<CardContent className="p-4">
										<div className="mb-3 flex items-start justify-between">
											<div className="flex items-center gap-3">
												<div className={cn("rounded-lg p-2", category.color)}>
													<CategoryIcon className="size-5" weight="duotone" />
												</div>
												<div>
													<h4 className="font-medium">{skill.name}</h4>
													<Badge
														variant={
															skill.priority === "high"
																? "destructive"
																: skill.priority === "medium"
																	? "default"
																	: "secondary"
														}
														className="mt-1 text-xs"
													>
														{skill.priority}
													</Badge>
												</div>
											</div>
											<AlertDialog>
												<AlertDialogTrigger asChild>
													<Button variant="ghost" size="icon-sm">
														<TrashIcon className="size-4 text-destructive" />
													</Button>
												</AlertDialogTrigger>
												<AlertDialogContent>
													<AlertDialogHeader>
														<AlertDialogTitle>
															<Trans>Delete Skill?</Trans>
														</AlertDialogTitle>
														<AlertDialogDescription>
															<Trans>This will also remove all associated resources and tasks.</Trans>
														</AlertDialogDescription>
													</AlertDialogHeader>
													<AlertDialogFooter>
														<AlertDialogCancel>
															<Trans>Cancel</Trans>
														</AlertDialogCancel>
														<AlertDialogAction onClick={() => handleDeleteSkill(skill.id)}>
															<Trans>Delete</Trans>
														</AlertDialogAction>
													</AlertDialogFooter>
												</AlertDialogContent>
											</AlertDialog>
										</div>

										<div className="space-y-3">
											<div>
												<div className="mb-1 flex items-center justify-between text-sm">
													<span className="text-muted-foreground">
														<Trans>Current Level</Trans>
													</span>
												</div>
												<StarRating
													rating={skill.currentLevel}
													onRatingChange={(r) => handleUpdateSkillLevel(skill.id, r)}
												/>
											</div>
											<div>
												<div className="mb-1 flex items-center justify-between text-sm">
													<span className="text-muted-foreground">
														<Trans>Target Level</Trans>
													</span>
												</div>
												<StarRating rating={skill.targetLevel} readonly />
											</div>
											<div className="space-y-1">
												<div className="flex items-center justify-between text-xs">
													<span className="text-muted-foreground">
														<Trans>Progress</Trans>
													</span>
													<span className="font-medium">{Math.round(progress)}%</span>
												</div>
												<Progress value={progress} className="h-1.5" />
											</div>
										</div>

										{isComplete && (
											<Badge className="mt-3 w-full justify-center gap-1 bg-green-500">
												<CheckCircleIcon className="size-3" weight="fill" />
												<Trans>Goal Reached!</Trans>
											</Badge>
										)}
									</CardContent>
								</Card>
							</motion.div>
						);
					})}
				</div>
			)}
		</div>
	);
}

// --- Schedule Tab ---

export function ScheduleTab({ data, handleToggleTask }: ScheduleTabProps) {
	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<CalendarIcon className="size-5 text-primary" weight="duotone" />
					<Trans>Weekly Study Schedule</Trans>
				</CardTitle>
				<CardDescription>
					<Trans>Your AI-generated study plan for this week</Trans>
				</CardDescription>
			</CardHeader>
			<CardContent>
				{data.tasks.length === 0 ? (
					<div className="rounded-xl border border-dashed p-8 text-center">
						<CalendarIcon className="mx-auto mb-4 size-12 text-muted-foreground/50" />
						<h3 className="mb-2 font-medium">
							<Trans>No Schedule Yet</Trans>
						</h3>
						<p className="text-muted-foreground text-sm">
							<Trans>Generate an AI roadmap to create your personalized study schedule.</Trans>
						</p>
					</div>
				) : (
					<div className="space-y-4">
						{Array.from(new Set(data.tasks.map((t) => t.scheduledDate.split("T")[0])))
							.sort()
							.slice(0, 7)
							.map((date) => {
								const dayTasks = data.tasks.filter((t) => t.scheduledDate.split("T")[0] === date);
								const isTodays = isToday(date);
								const isPast = isOverdue(date);
								const dayName = new Date(date).toLocaleDateString("fr-FR", { weekday: "long" });

								return (
									<div key={date} className={cn("rounded-lg border p-4", isTodays && "border-primary bg-primary/5")}>
										<div className="mb-3 flex items-center justify-between">
											<div className="flex items-center gap-2">
												<h4 className="font-medium">{dayName}</h4>
												{isTodays && (
													<Badge className="bg-primary">
														<Trans>Today</Trans>
													</Badge>
												)}
											</div>
											<span className="text-muted-foreground text-sm">
												{formatDate(date, { day: "numeric", month: "short", year: "numeric" })}
											</span>
										</div>
										<div className="space-y-2">
											{dayTasks.map((task) => {
												const skill = data.skills.find((s) => s.id === task.skillId);
												return (
													<div
														key={task.id}
														className={cn(
															"flex items-center gap-3 rounded-md bg-muted/50 p-2",
															task.completed && "opacity-60",
														)}
													>
														<button
															type="button"
															onClick={() => handleToggleTask(task.id)}
															disabled={isPast && !task.completed}
															className={cn(
																"flex size-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
																task.completed
																	? "border-green-500 bg-green-500 text-white"
																	: "border-muted-foreground/30 hover:border-primary",
															)}
														>
															{task.completed && <CheckCircleIcon className="size-3" weight="fill" />}
														</button>
														<div className="min-w-0 flex-1">
															<p className={cn("text-sm", task.completed && "line-through")}>{task.title}</p>
															{skill && <p className="text-muted-foreground text-xs">{skill.name}</p>}
														</div>
														<div className="flex items-center gap-2 text-muted-foreground text-xs">
															<ClockIcon className="size-3" />
															{formatDuration(task.duration)}
														</div>
													</div>
												);
											})}
										</div>
									</div>
								);
							})}
					</div>
				)}
			</CardContent>
		</Card>
	);
}

// --- Resources Tab ---

export function ResourcesTab({
	data,
	filteredResources,
	searchQuery,
	setSearchQuery,
	isResourceDialogOpen,
	setIsResourceDialogOpen,
	resourceForm,
	setResourceForm,
	handleAddResource,
	handleToggleResource,
}: ResourcesTabProps) {
	return (
		<div className="space-y-8">
			<div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
				<div className="relative flex-1 md:max-w-sm">
					<MagnifyingGlassIcon className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
					<Input
						placeholder={t`Search resources...`}
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className="pl-9"
					/>
				</div>
				<Dialog open={isResourceDialogOpen} onOpenChange={setIsResourceDialogOpen}>
					<DialogTrigger asChild>
						<Button className="gap-2">
							<PlusCircleIcon className="size-4" />
							<Trans>Add Resource</Trans>
						</Button>
					</DialogTrigger>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>
								<Trans>Add Learning Resource</Trans>
							</DialogTitle>
						</DialogHeader>
						<div className="space-y-4 py-4">
							<div className="space-y-2">
								<label className="font-medium text-sm">
									<Trans>Title</Trans>
								</label>
								<Input
									value={resourceForm.title}
									onChange={(e) => setResourceForm({ ...resourceForm, title: e.target.value })}
									placeholder={t`Resource title`}
								/>
							</div>
							<div className="grid grid-cols-2 gap-4">
								<div className="space-y-2">
									<label className="font-medium text-sm">
										<Trans>Type</Trans>
									</label>
									<Select
										value={resourceForm.type}
										onValueChange={(v) => setResourceForm({ ...resourceForm, type: v as LearningResource["type"] })}
									>
										<SelectTrigger>
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											{Object.entries(RESOURCE_TYPES).map(([key, val]) => (
												<SelectItem key={key} value={key}>
													{val.label}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
								<div className="space-y-2">
									<label className="font-medium text-sm">
										<Trans>Platform</Trans>
									</label>
									<Select
										value={resourceForm.platform}
										onValueChange={(v) => setResourceForm({ ...resourceForm, platform: v })}
									>
										<SelectTrigger>
											<SelectValue placeholder={t`Select`} />
										</SelectTrigger>
										<SelectContent>
											{PLATFORMS.map((p) => (
												<SelectItem key={p} value={p}>
													{p}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
							</div>
							<div className="space-y-2">
								<label className="font-medium text-sm">
									<Trans>Related Skill</Trans>
								</label>
								<Select
									value={resourceForm.skillId}
									onValueChange={(v) => setResourceForm({ ...resourceForm, skillId: v })}
								>
									<SelectTrigger>
										<SelectValue placeholder={t`Select skill`} />
									</SelectTrigger>
									<SelectContent>
										{data.skills.map((s) => (
											<SelectItem key={s.id} value={s.id}>
												{s.name}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
							<div className="grid grid-cols-2 gap-4">
								<div className="space-y-2">
									<label className="font-medium text-sm">URL</label>
									<Input
										value={resourceForm.url}
										onChange={(e) => setResourceForm({ ...resourceForm, url: e.target.value })}
										placeholder="https://..."
									/>
								</div>
								<div className="space-y-2">
									<label className="font-medium text-sm">
										<Trans>Duration</Trans>
									</label>
									<Input
										value={resourceForm.duration}
										onChange={(e) => setResourceForm({ ...resourceForm, duration: e.target.value })}
										placeholder={t`e.g., 10 hours`}
									/>
								</div>
							</div>
						</div>
						<DialogFooter>
							<DialogClose asChild>
								<Button variant="outline">
									<Trans>Cancel</Trans>
								</Button>
							</DialogClose>
							<Button onClick={handleAddResource} disabled={!resourceForm.title || !resourceForm.skillId}>
								<Trans>Add Resource</Trans>
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			</div>

			{filteredResources.length === 0 ? (
				<Card className="border-dashed">
					<CardContent className="flex flex-col items-center py-12 text-center">
						<BookBookmarkIcon className="mb-4 size-12 text-muted-foreground/50" />
						<h3 className="mb-2 font-medium">
							<Trans>No Resources Found</Trans>
						</h3>
						<p className="text-muted-foreground text-sm">
							{searchQuery ? (
								<Trans>No resources match your search.</Trans>
							) : (
								<Trans>Add resources to build your learning library.</Trans>
							)}
						</p>
					</CardContent>
				</Card>
			) : (
				<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
					{filteredResources.map((resource, index) => {
						const typeConfig = RESOURCE_TYPES[resource.type];
						const TypeIcon = typeConfig.icon;
						const skill = data.skills.find((s) => s.id === resource.skillId);

						return (
							<motion.div
								key={resource.id}
								initial={false}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: index * 0.03 }}
							>
								<Card
									className={cn("h-full transition-all hover:shadow-lg", resource.completed && "border-green-500/50")}
								>
									<CardContent className="p-4">
										<div className="mb-3 flex items-start justify-between">
											<div className={cn("rounded-lg p-2", typeConfig.color)}>
												<TypeIcon className="size-5" weight="duotone" />
											</div>
											<button
												type="button"
												onClick={() => handleToggleResource(resource.id)}
												className={cn(
													"flex size-6 items-center justify-center rounded-full border-2 transition-colors",
													resource.completed
														? "border-green-500 bg-green-500 text-white"
														: "border-muted-foreground/30 hover:border-primary",
												)}
											>
												{resource.completed && <CheckCircleIcon className="size-4" weight="fill" />}
											</button>
										</div>
										<h4 className={cn("mb-1 font-medium", resource.completed && "text-muted-foreground line-through")}>
											{resource.title}
										</h4>
										<div className="mb-3 flex flex-wrap items-center gap-2 text-muted-foreground text-xs">
											<span>{resource.platform}</span>
											<span>-</span>
											<span>{resource.duration}</span>
										</div>
										{skill && (
											<Badge variant="outline" className="text-xs">
												{skill.name}
											</Badge>
										)}
										{resource.url && resource.url !== "#" && (
											<a
												href={resource.url}
												target="_blank"
												rel="noopener noreferrer"
												className="mt-3 flex items-center gap-1 text-primary text-xs hover:underline"
											>
												<Trans>Open Resource</Trans>
												<ArrowRightIcon className="size-3" />
											</a>
										)}
									</CardContent>
								</Card>
							</motion.div>
						);
					})}
				</div>
			)}
		</div>
	);
}

// --- Flashcards Tab ---

export function FlashcardsTab({
	data,
	dueFlashcards,
	currentFlashcardIndex,
	setCurrentFlashcardIndex,
	showFlashcardAnswer,
	setShowFlashcardAnswer,
	isFlashcardDialogOpen,
	setIsFlashcardDialogOpen,
	flashcardForm,
	setFlashcardForm,
	handleAddFlashcard,
	handleReviewFlashcard,
}: FlashcardsTabProps) {
	return (
		<div className="space-y-8">
			<div className="flex items-center justify-between">
				<div>
					<h3 className="font-semibold text-xl">
						<Trans>Spaced Repetition Practice</Trans>
					</h3>
					<p className="text-muted-foreground text-sm">
						<Trans>Review flashcards to reinforce your learning</Trans>
					</p>
				</div>
				<Dialog open={isFlashcardDialogOpen} onOpenChange={setIsFlashcardDialogOpen}>
					<DialogTrigger asChild>
						<Button className="gap-2">
							<PlusCircleIcon className="size-4" />
							<Trans>Add Flashcard</Trans>
						</Button>
					</DialogTrigger>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>
								<Trans>Create Flashcard</Trans>
							</DialogTitle>
						</DialogHeader>
						<div className="space-y-4 py-4">
							<div className="space-y-2">
								<label className="font-medium text-sm">
									<Trans>Related Skill</Trans>
								</label>
								<Select
									value={flashcardForm.skillId}
									onValueChange={(v) => setFlashcardForm({ ...flashcardForm, skillId: v })}
								>
									<SelectTrigger>
										<SelectValue placeholder={t`Select skill`} />
									</SelectTrigger>
									<SelectContent>
										{data.skills.map((s) => (
											<SelectItem key={s.id} value={s.id}>
												{s.name}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
							<div className="space-y-2">
								<label className="font-medium text-sm">
									<Trans>Question</Trans>
								</label>
								<Textarea
									value={flashcardForm.question}
									onChange={(e) => setFlashcardForm({ ...flashcardForm, question: e.target.value })}
									placeholder={t`Enter your question...`}
									rows={3}
								/>
							</div>
							<div className="space-y-2">
								<label className="font-medium text-sm">
									<Trans>Answer</Trans>
								</label>
								<Textarea
									value={flashcardForm.answer}
									onChange={(e) => setFlashcardForm({ ...flashcardForm, answer: e.target.value })}
									placeholder={t`Enter the answer...`}
									rows={3}
								/>
							</div>
						</div>
						<DialogFooter>
							<DialogClose asChild>
								<Button variant="outline">
									<Trans>Cancel</Trans>
								</Button>
							</DialogClose>
							<Button
								onClick={handleAddFlashcard}
								disabled={!flashcardForm.question || !flashcardForm.answer || !flashcardForm.skillId}
							>
								<Trans>Create Card</Trans>
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			</div>

			{/* Due Cards Review */}
			{dueFlashcards.length > 0 && (
				<Card className="overflow-hidden">
					<CardHeader className="border-b bg-gradient-to-r from-purple-500/10 to-transparent">
						<CardTitle className="flex items-center gap-2">
							<BrainIcon className="size-5 text-purple-500" weight="duotone" />
							<Trans>Cards Due for Review</Trans>
							<Badge>{dueFlashcards.length}</Badge>
						</CardTitle>
					</CardHeader>
					<CardContent className="p-6">
						<AnimatePresence mode="wait">
							<motion.div
								key={currentFlashcardIndex}
								initial={{ opacity: 0, x: 50 }}
								animate={{ opacity: 1, x: 0 }}
								exit={{ opacity: 0, x: -50 }}
								className="space-y-4"
							>
								{dueFlashcards[currentFlashcardIndex] && (
									<>
										<div className="mb-4 flex items-center justify-between text-sm">
											<span className="text-muted-foreground">
												Card {currentFlashcardIndex + 1} of {dueFlashcards.length}
											</span>
											<Badge variant="outline">
												{data.skills.find((s) => s.id === dueFlashcards[currentFlashcardIndex].skillId)?.name}
											</Badge>
										</div>

										<Card className="min-h-[200px]">
											<CardContent className="flex flex-col items-center justify-center p-8 text-center">
												<p className="mb-4 font-medium text-lg">{dueFlashcards[currentFlashcardIndex].question}</p>
												{showFlashcardAnswer ? (
													<motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="w-full">
														<div className="mb-4 rounded-lg bg-green-500/10 p-4">
															<p className="text-green-700 dark:text-green-400">
																{dueFlashcards[currentFlashcardIndex].answer}
															</p>
														</div>
													</motion.div>
												) : (
													<Button onClick={() => setShowFlashcardAnswer(true)} variant="outline">
														<Trans>Show Answer</Trans>
													</Button>
												)}
											</CardContent>
										</Card>

										{showFlashcardAnswer && (
											<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
												<p className="text-center text-muted-foreground text-sm">
													<Trans>How well did you know this?</Trans>
												</p>
												<div className="flex justify-center gap-2">
													{[
														{ quality: 1, label: "Again", color: "destructive" },
														{ quality: 3, label: "Hard", color: "secondary" },
														{ quality: 4, label: "Good", color: "default" },
														{ quality: 5, label: "Easy", color: "default" },
													].map((btn) => (
														<Button
															key={btn.quality}
															variant={btn.color as "destructive" | "secondary" | "default"}
															size="sm"
															onClick={() => handleReviewFlashcard(btn.quality)}
														>
															{btn.label}
														</Button>
													))}
												</div>
											</motion.div>
										)}

										<div className="flex justify-between">
											<Button
												variant="ghost"
												size="sm"
												onClick={() => {
													setCurrentFlashcardIndex(Math.max(0, currentFlashcardIndex - 1));
													setShowFlashcardAnswer(false);
												}}
												disabled={currentFlashcardIndex === 0}
											>
												<CaretLeftIcon className="size-4" />
												<Trans>Previous</Trans>
											</Button>
											<Button
												variant="ghost"
												size="sm"
												onClick={() => {
													setCurrentFlashcardIndex(Math.min(dueFlashcards.length - 1, currentFlashcardIndex + 1));
													setShowFlashcardAnswer(false);
												}}
												disabled={currentFlashcardIndex >= dueFlashcards.length - 1}
											>
												<Trans>Next</Trans>
												<CaretRightIcon className="size-4" />
											</Button>
										</div>
									</>
								)}
							</motion.div>
						</AnimatePresence>
					</CardContent>
				</Card>
			)}

			{/* All Flashcards */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<ListChecksIcon className="size-5 text-primary" weight="duotone" />
						<Trans>All Flashcards</Trans>
						<Badge variant="secondary">{data.flashcards.length}</Badge>
					</CardTitle>
				</CardHeader>
				<CardContent>
					{data.flashcards.length === 0 ? (
						<div className="rounded-xl border border-dashed p-8 text-center">
							<BrainIcon className="mx-auto mb-4 size-12 text-muted-foreground/50" />
							<h3 className="mb-2 font-medium">
								<Trans>No Flashcards Yet</Trans>
							</h3>
							<p className="text-muted-foreground text-sm">
								<Trans>Create flashcards to practice and reinforce your learning.</Trans>
							</p>
						</div>
					) : (
						<div className="grid gap-3 md:grid-cols-2">
							{data.flashcards.map((card) => {
								const skill = data.skills.find((s) => s.id === card.skillId);
								const isDue = new Date(card.nextReview) <= new Date();

								return (
									<Card key={card.id} className={cn("transition-all", isDue && "border-purple-500/50")}>
										<CardContent className="p-4">
											<div className="mb-2 flex items-start justify-between">
												<p className="line-clamp-2 font-medium text-sm">{card.question}</p>
												{isDue && (
													<Badge className="shrink-0 bg-purple-500">
														<Trans>Due</Trans>
													</Badge>
												)}
											</div>
											<div className="flex items-center justify-between text-muted-foreground text-xs">
												{skill && <span>{skill.name}</span>}
												<span>
													<Trans>Next:</Trans>{" "}
													{formatDate(card.nextReview, { day: "numeric", month: "short", year: "numeric" })}
												</span>
											</div>
										</CardContent>
									</Card>
								);
							})}
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}

// --- Achievements Tab ---

export function AchievementsTab({ data, weekProgress, saveData }: AchievementsTabProps) {
	return (
		<div className="space-y-8">
			{/* Streak Card */}
			<Card className="overflow-hidden">
				<CardHeader className="border-b bg-gradient-to-r from-orange-500/10 to-amber-500/5">
					<CardTitle className="flex items-center gap-2">
						<FireIcon className="size-5 text-orange-500" weight="fill" />
						<Trans>Study Streak</Trans>
					</CardTitle>
				</CardHeader>
				<CardContent className="p-6">
					<div className="grid gap-6 md:grid-cols-4">
						<div className="text-center">
							<div className="mb-2 flex items-center justify-center">
								<FireIcon className="size-10 text-orange-500" weight="fill" />
							</div>
							<p className="font-bold text-4xl text-orange-500">{data.streak.currentStreak}</p>
							<p className="text-muted-foreground text-sm">
								<Trans>Current Streak</Trans>
							</p>
						</div>
						<div className="text-center">
							<div className="mb-2 flex items-center justify-center">
								<TrophyIcon className="size-10 text-amber-500" weight="fill" />
							</div>
							<p className="font-bold text-4xl text-amber-500">{data.streak.longestStreak}</p>
							<p className="text-muted-foreground text-sm">
								<Trans>Longest Streak</Trans>
							</p>
						</div>
						<div className="text-center">
							<div className="mb-2 flex items-center justify-center">
								<CalendarIcon className="size-10 text-blue-500" weight="fill" />
							</div>
							<p className="font-bold text-4xl text-blue-500">{data.streak.totalStudyDays}</p>
							<p className="text-muted-foreground text-sm">
								<Trans>Total Days</Trans>
							</p>
						</div>
						<div className="text-center">
							<div className="mb-2 flex items-center justify-center">
								<ClockIcon className="size-10 text-purple-500" weight="fill" />
							</div>
							<p className="font-bold text-4xl text-purple-500">{formatDuration(data.streak.totalStudyMinutes)}</p>
							<p className="text-muted-foreground text-sm">
								<Trans>Total Time</Trans>
							</p>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Badges */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<StarIcon className="size-5 text-primary" weight="fill" />
						<Trans>Badges & Achievements</Trans>
					</CardTitle>
					<CardDescription>
						<Trans>Unlock badges by reaching study milestones</Trans>
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
						{GAMIFICATION_BADGES.map((badge) => {
							const earned = data.streak.badges.find((b) => b.id === badge.id);
							const iconMap: Record<string, Icon> = {
								rocket: RocketLaunchIcon,
								fire: FireIcon,
								trophy: TrophyIcon,
								star: StarIcon,
								book: BookOpenIcon,
								flag: FlagIcon,
								brain: BrainIcon,
								sun: SparkleIcon,
								moon: SparkleIcon,
								check: CheckCircleIcon,
							};
							const BadgeIcon = iconMap[badge.icon] || StarIcon;

							return (
								<Tooltip key={badge.id}>
									<TooltipTrigger asChild>
										<Card
											className={cn(
												"cursor-default transition-all",
												earned ? "border-amber-500/50 bg-amber-500/5" : "opacity-50 grayscale",
											)}
										>
											<CardContent className="flex flex-col items-center p-4 text-center">
												<div
													className={cn(
														"mb-2 flex size-12 items-center justify-center rounded-full",
														earned ? "bg-amber-500/20 text-amber-500" : "bg-muted text-muted-foreground",
													)}
												>
													<BadgeIcon className="size-6" weight={earned ? "fill" : "regular"} />
												</div>
												<p className="font-medium text-sm">{badge.name}</p>
												{earned && (
													<p className="text-muted-foreground text-xs">
														{formatDate(earned.earnedDate, { day: "numeric", month: "short", year: "numeric" })}
													</p>
												)}
											</CardContent>
										</Card>
									</TooltipTrigger>
									<TooltipContent>
										<p>{badge.description}</p>
									</TooltipContent>
								</Tooltip>
							);
						})}
					</div>
				</CardContent>
			</Card>

			{/* Weekly Goal Settings */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<TargetIcon className="size-5 text-primary" weight="duotone" />
						<Trans>Weekly Goal</Trans>
					</CardTitle>
					<CardDescription>
						<Trans>Set your weekly study time target</Trans>
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="flex items-center gap-4">
						<Select
							value={data.streak.weeklyGoal.toString()}
							onValueChange={(v) => saveData({ ...data, streak: { ...data.streak, weeklyGoal: parseInt(v, 10) } })}
						>
							<SelectTrigger className="w-48">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{[60, 120, 180, 240, 300, 420, 600].map((mins) => (
									<SelectItem key={mins} value={mins.toString()}>
										{formatDuration(mins)} / <Trans>week</Trans>
									</SelectItem>
								))}
							</SelectContent>
						</Select>
						<div className="flex-1">
							<Progress value={weekProgress} className="h-3" />
						</div>
						<span className="font-medium">{weekProgress}%</span>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
