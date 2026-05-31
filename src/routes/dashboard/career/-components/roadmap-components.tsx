import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import {
	ArrowRightIcon,
	ArrowsSplitIcon,
	BookOpenIcon,
	BrainIcon,
	CalendarIcon,
	CaretDownIcon,
	CaretUpIcon,
	ChartLineUpIcon,
	CheckCircleIcon,
	ClockIcon,
	CopyIcon,
	CurrencyCircleDollarIcon,
	DownloadSimpleIcon,
	FlagIcon,
	FloppyDiskIcon,
	LightbulbIcon,
	MagicWandIcon,
	PathIcon,
	PlusCircleIcon,
	ShareNetworkIcon,
	SparkleIcon,
	TargetIcon,
	TrashIcon,
	TrendUpIcon,
	WarningCircleIcon,
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
import { Slider } from "@/components/ui/slider";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/utils/style";
import {
	formatDate,
	formatWeeks,
	getSkillCategoryConfig,
	getStepTypeConfig,
	RESOURCE_TYPE_CONFIG,
} from "./roadmap-config";
import type {
	AlternativePath,
	CompareTabContentProps,
	CreateTabContentProps,
	DbRoadmap,
	ProgressTabContentProps,
	RoadmapProgress,
	RoadmapStep,
	SavedRoadmap,
	SavedRoadmapsTabContentProps,
} from "./roadmap-types";

function SuccessProbabilityGauge({ probability }: { probability: number }) {
	const getColor = (prob: number) => {
		if (prob >= 75) return "text-green-500";
		if (prob >= 50) return "text-amber-500";
		return "text-red-500";
	};

	const getBgColor = (prob: number) => {
		if (prob >= 75) return "bg-green-500";
		if (prob >= 50) return "bg-amber-500";
		return "bg-red-500";
	};

	return (
		<div className="relative flex flex-col items-center">
			<div className="relative size-32">
				<svg viewBox="0 0 100 100" className="size-full -rotate-90">
					{/* Background circle */}
					<circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="8" className="text-muted/30" />
					{/* Progress circle */}
					<motion.circle
						cx="50"
						cy="50"
						r="40"
						fill="none"
						stroke="currentColor"
						strokeWidth="8"
						strokeLinecap="round"
						className={getColor(probability)}
						initial={{ strokeDasharray: "0, 251.2" }}
						animate={{ strokeDasharray: `${probability * 2.512}, 251.2` }}
						transition={{ duration: 1.5, ease: "easeOut" }}
					/>
				</svg>
				<div className="absolute inset-0 flex flex-col items-center justify-center">
					<motion.span
						className={cn("font-bold text-3xl", getColor(probability))}
						initial={false}
						animate={{ opacity: 1, scale: 1 }}
						transition={{ delay: 0.5 }}
					>
						{probability}%
					</motion.span>
					<span className="text-muted-foreground text-xs">
						<Trans>Success Rate</Trans>
					</span>
				</div>
			</div>
			<div className="mt-2 flex items-center gap-2">
				<div className={cn("size-2 rounded-full", getBgColor(probability))} />
				<span className="text-muted-foreground text-sm">
					{probability >= 75 ? t`High` : probability >= 50 ? t`Medium` : t`Low`} {t`Probability`}
				</span>
			</div>
		</div>
	);
}

function SkillLevelBar({
	currentLevel,
	requiredLevel,
	showLabels = false,
}: {
	currentLevel: number;
	requiredLevel: number;
	showLabels?: boolean;
}) {
	return (
		<div className="space-y-1">
			{showLabels && (
				<div className="flex justify-between text-muted-foreground text-xs">
					<span>
						<Trans>Current: {currentLevel}/5</Trans>
					</span>
					<span>
						<Trans>Required: {requiredLevel}/5</Trans>
					</span>
				</div>
			)}
			<div className="flex gap-1">
				{[1, 2, 3, 4, 5].map((level) => (
					<div
						key={level}
						className={cn(
							"h-2 flex-1 rounded-full transition-all",
							level <= currentLevel ? "bg-green-500" : level <= requiredLevel ? "bg-amber-500/30" : "bg-muted",
						)}
					/>
				))}
			</div>
		</div>
	);
}

function RoadmapStepCard({
	step,
	isActive,
	onToggleComplete,
	onExpand,
	isExpanded,
}: {
	step: RoadmapStep;
	isActive: boolean;
	onToggleComplete: () => void;
	onExpand: () => void;
	isExpanded: boolean;
}) {
	const stepTypeConfig = getStepTypeConfig();
	const skillCategoryConfig = getSkillCategoryConfig();
	const config = stepTypeConfig[step.type];
	const StepIcon = config.icon;
	const completedMilestones = step.milestones.filter((m) => m.completed).length;
	const completedSkills = step.skills.filter((s) => s.currentLevel >= s.requiredLevel).length;

	return (
		<motion.div initial={false} animate={{ opacity: 1, y: 0 }} transition={{ delay: step.order * 0.1 }}>
			<Card
				className={cn(
					"relative overflow-hidden transition-all duration-300",
					isActive && "border-primary shadow-lg",
					step.completed && "border-green-500/50 bg-green-50/50 dark:bg-green-900/10",
				)}
			>
				{/* Progress indicator */}
				{isActive && !step.completed && (
					<div className="absolute top-0 right-0 left-0 h-1 bg-primary/20">
						<motion.div
							className="h-full bg-primary"
							initial={{ width: 0 }}
							animate={{
								width: `${((completedMilestones + completedSkills) / (step.milestones.length + step.skills.length)) * 100}%`,
							}}
							transition={{ duration: 0.5 }}
						/>
					</div>
				)}

				<CardHeader className="pb-2">
					<div className="flex items-start justify-between">
						<div className="flex items-center gap-3">
							<div
								className={cn(
									"flex size-12 items-center justify-center rounded-xl transition-colors",
									config.color,
									step.completed && "bg-green-100 text-green-700 dark:bg-green-900/30",
								)}
							>
								{step.completed ? (
									<CheckCircleIcon className="size-6" weight="fill" />
								) : (
									<StepIcon className="size-6" weight="duotone" />
								)}
							</div>
							<div>
								<div className="flex items-center gap-2">
									<Badge variant="outline" className="text-xs">
										<Trans>Step {step.order}</Trans>
									</Badge>
									<Badge className={config.color}>{config.label}</Badge>
									{step.completed && (
										<Badge className="bg-green-500">
											<CheckCircleIcon className="mr-1 size-3" weight="fill" />
											<Trans>Complete</Trans>
										</Badge>
									)}
								</div>
								<CardTitle className="mt-1 text-lg">{step.title}</CardTitle>
							</div>
						</div>
						<div className="flex items-center gap-2">
							{!step.completed && (
								<Tooltip>
									<TooltipTrigger asChild>
										<Button variant="ghost" size="icon-sm" onClick={onToggleComplete}>
											<CheckCircleIcon className="size-4 text-green-500" />
										</Button>
									</TooltipTrigger>
									<TooltipContent>
										<Trans>Mark as complete</Trans>
									</TooltipContent>
								</Tooltip>
							)}
							<Button variant="ghost" size="icon-sm" onClick={onExpand}>
								{isExpanded ? <CaretUpIcon className="size-4" /> : <CaretDownIcon className="size-4" />}
							</Button>
						</div>
					</div>
				</CardHeader>

				<CardContent className="space-y-4">
					<p className="text-muted-foreground text-sm">{step.description}</p>

					{/* Quick stats */}
					<div className="flex flex-wrap gap-4 text-sm">
						<div className="flex items-center gap-1 text-muted-foreground">
							<ClockIcon className="size-4" />
							<span>{formatWeeks(step.duration)}</span>
						</div>
						<div className="flex items-center gap-1 text-muted-foreground">
							<TargetIcon className="size-4" />
							<span>
								<Trans>
									{completedMilestones}/{step.milestones.length} milestones
								</Trans>
							</span>
						</div>
						<div className="flex items-center gap-1 text-muted-foreground">
							<LightbulbIcon className="size-4" />
							<span>
								<Trans>
									{completedSkills}/{step.skills.length} skills
								</Trans>
							</span>
						</div>
						{step.estimatedSalary && (
							<div className="flex items-center gap-1 text-green-600">
								<CurrencyCircleDollarIcon className="size-4" />
								<span>
									{step.estimatedSalary.min.toLocaleString("fr-FR")} -{" "}
									{step.estimatedSalary.max.toLocaleString("fr-FR")} DH
								</span>
							</div>
						)}
					</div>

					{/* Expanded content */}
					<AnimatePresence>
						{isExpanded && (
							<motion.div
								initial={{ opacity: 0, height: 0 }}
								animate={{ opacity: 1, height: "auto" }}
								exit={{ opacity: 0, height: 0 }}
								transition={{ duration: 0.3 }}
								className="space-y-4 pt-4"
							>
								{/* Skills */}
								{step.skills.length > 0 && (
									<div>
										<h4 className="mb-3 flex items-center gap-2 font-medium text-sm">
											<LightbulbIcon className="size-4 text-primary" />
											<Trans>Required Skills</Trans>
										</h4>
										<div className="space-y-3">
											{step.skills.map((skill) => (
												<div key={skill.id} className="rounded-lg border p-3">
													<div className="mb-2 flex items-center justify-between">
														<div className="flex items-center gap-2">
															<Badge
																variant="outline"
																className={cn(
																	"text-xs",
																	skill.priority === "critical" && "border-red-500 text-red-600",
																	skill.priority === "important" && "border-amber-500 text-amber-600",
																)}
															>
																{skill.priority}
															</Badge>
															<span className="font-medium">{skill.name}</span>
														</div>
														<Badge className={cn("text-xs", skillCategoryConfig[skill.category].color)}>
															{skillCategoryConfig[skill.category].label}
														</Badge>
													</div>
													<SkillLevelBar
														currentLevel={skill.currentLevel}
														requiredLevel={skill.requiredLevel}
														showLabels
													/>
												</div>
											))}
										</div>
									</div>
								)}

								{/* Milestones */}
								{step.milestones.length > 0 && (
									<div>
										<h4 className="mb-3 flex items-center gap-2 font-medium text-sm">
											<FlagIcon className="size-4 text-primary" />
											<Trans>Milestones</Trans>
										</h4>
										<div className="space-y-2">
											{step.milestones.map((milestone) => (
												<div
													key={milestone.id}
													className={cn(
														"flex items-center gap-3 rounded-lg border p-3",
														milestone.completed && "border-green-500/50 bg-green-50/50",
													)}
												>
													<div
														className={cn(
															"flex size-8 items-center justify-center rounded-full",
															milestone.completed ? "bg-green-500" : "bg-muted",
														)}
													>
														{milestone.completed ? (
															<CheckCircleIcon className="size-4 text-white" weight="fill" />
														) : (
															<FlagIcon className="size-4 text-muted-foreground" />
														)}
													</div>
													<div className="flex-1">
														<p className="font-medium text-sm">{milestone.title}</p>
														<p className="text-muted-foreground text-xs">{milestone.description}</p>
													</div>
													<Badge variant="outline" className="text-xs">
														{formatDate(milestone.targetDate, { day: "numeric", month: "short", year: "numeric" })}
													</Badge>
												</div>
											))}
										</div>
									</div>
								)}

								{/* Resources */}
								{step.resources.length > 0 && (
									<div>
										<h4 className="mb-3 flex items-center gap-2 font-medium text-sm">
											<BookOpenIcon className="size-4 text-primary" />
											<Trans>Recommended Resources</Trans>
										</h4>
										<div className="grid gap-2 md:grid-cols-2">
											{step.resources.slice(0, 4).map((resource) => {
												const ResourceIcon = RESOURCE_TYPE_CONFIG[resource.type].icon;
												return (
													<a
														key={resource.id}
														href={resource.url}
														target="_blank"
														rel="noopener noreferrer"
														className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:border-primary/50 hover:bg-muted/50"
													>
														<ResourceIcon
															className={cn("size-5", RESOURCE_TYPE_CONFIG[resource.type].color)}
															weight="duotone"
														/>
														<div className="min-w-0 flex-1">
															<p className="truncate font-medium text-sm">{resource.title}</p>
															<div className="flex items-center gap-2 text-muted-foreground text-xs">
																<span>{resource.platform}</span>
																<span>-</span>
																<span>{resource.duration}</span>
																{resource.rating && <StarRating rating={resource.rating} size="small" />}
															</div>
														</div>
														{resource.recommended && (
															<Badge className="shrink-0 bg-primary/10 text-primary text-xs">
																<SparkleIcon className="mr-1 size-3" />
																<Trans>Recommended</Trans>
															</Badge>
														)}
													</a>
												);
											})}
										</div>
									</div>
								)}
							</motion.div>
						)}
					</AnimatePresence>
				</CardContent>
			</Card>
		</motion.div>
	);
}

function PathComparisonCard({
	path,
	isSelected,
	onSelect,
}: {
	path: AlternativePath;
	isSelected: boolean;
	onSelect: () => void;
}) {
	return (
		<motion.div
			initial={false}
			animate={{ opacity: 1, scale: 1 }}
			whileHover={{ scale: 1.02 }}
			transition={{ duration: 0.2 }}
		>
			<Card
				className={cn(
					"relative h-full cursor-pointer transition-all duration-300",
					isSelected && "border-2 border-primary shadow-lg",
				)}
				onClick={onSelect}
			>
				{isSelected && (
					<div className="absolute -top-3 left-1/2 -translate-x-1/2">
						<Badge className="gap-1 bg-primary shadow-md">
							<CheckCircleIcon className="size-3" weight="fill" />
							<Trans>Selected</Trans>
						</Badge>
					</div>
				)}

				<CardHeader className="pb-4">
					<div className="flex items-start justify-between">
						<div>
							<CardTitle className="text-xl">{path.name}</CardTitle>
							<CardDescription className="mt-1">{path.description}</CardDescription>
						</div>
						<SuccessProbabilityGauge probability={path.successProbability} />
					</div>
				</CardHeader>

				<CardContent className="space-y-4">
					{/* Key metrics */}
					<div className="grid grid-cols-3 gap-4 rounded-lg bg-muted/50 p-4">
						<div className="text-center">
							<p className="font-bold text-2xl text-primary">{formatWeeks(path.duration)}</p>
							<p className="text-muted-foreground text-xs">
								<Trans>Duration</Trans>
							</p>
						</div>
						<div className="text-center">
							<p className="font-bold text-2xl">{path.steps.length}</p>
							<p className="text-muted-foreground text-xs">
								<Trans>Steps</Trans>
							</p>
						</div>
						<div className="text-center">
							<p className="font-bold text-green-600 text-lg">{path.estimatedCost}</p>
							<p className="text-muted-foreground text-xs">
								<Trans>Est. Cost</Trans>
							</p>
						</div>
					</div>

					{/* Advantages */}
					<div>
						<h4 className="mb-2 flex items-center gap-1 font-medium text-green-600 text-sm">
							<CheckCircleIcon className="size-4" weight="fill" />
							<Trans>Advantages</Trans>
						</h4>
						<ul className="space-y-1">
							{path.advantages.map((adv, i) => (
								<li key={i} className="flex items-start gap-2 text-sm">
									<ArrowRightIcon className="mt-1 size-3 shrink-0 text-green-500" />
									<span>{adv}</span>
								</li>
							))}
						</ul>
					</div>

					{/* Challenges */}
					<div>
						<h4 className="mb-2 flex items-center gap-1 font-medium text-amber-600 text-sm">
							<WarningCircleIcon className="size-4" weight="fill" />
							<Trans>Challenges</Trans>
						</h4>
						<ul className="space-y-1">
							{path.challenges.map((challenge, i) => (
								<li key={i} className="flex items-start gap-2 text-sm">
									<ArrowRightIcon className="mt-1 size-3 shrink-0 text-amber-500" />
									<span>{challenge}</span>
								</li>
							))}
						</ul>
					</div>
				</CardContent>

				<CardFooter>
					<Button
						className="w-full gap-2"
						variant={isSelected ? "default" : "outline"}
						onClick={(e) => {
							e.stopPropagation();
							onSelect();
						}}
					>
						{isSelected ? (
							<>
								<CheckCircleIcon className="size-4" weight="fill" />
								<Trans>Currently Selected</Trans>
							</>
						) : (
							<>
								<TargetIcon className="size-4" />
								<Trans>Select This Path</Trans>
							</>
						)}
					</Button>
				</CardFooter>
			</Card>
		</motion.div>
	);
}

function ProgressOverview({ progress, roadmap }: { progress: RoadmapProgress; roadmap: SavedRoadmap }) {
	const daysRemaining = Math.max(
		0,
		Math.ceil((new Date(progress.estimatedCompletionDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
	);

	return (
		<Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
			<CardHeader>
				<div className="flex items-center justify-between">
					<div>
						<CardTitle className="flex items-center gap-2 text-xl">
							<ChartLineUpIcon className="size-6 text-primary" weight="duotone" />
							<Trans>Your Progress</Trans>
						</CardTitle>
						<CardDescription>
							<Trans>Track your journey to {roadmap.goal.targetRole}</Trans>
						</CardDescription>
					</div>
					<div className="text-right">
						<p className="font-bold text-3xl text-primary">{progress.overallProgress}%</p>
						<p className="text-muted-foreground text-sm">
							<Trans>Overall Progress</Trans>
						</p>
					</div>
				</div>
			</CardHeader>
			<CardContent className="space-y-6">
				{/* Progress bar */}
				<div className="space-y-2">
					<Progress value={progress.overallProgress} className="h-4" />
					<div className="flex justify-between text-muted-foreground text-sm">
						<span>
							<Trans>
								Début : {formatDate(progress.startDate, { day: "numeric", month: "short", year: "numeric" })}
							</Trans>
						</span>
						<span>
							<Trans>
								Objectif :{" "}
								{formatDate(progress.estimatedCompletionDate, { day: "numeric", month: "short", year: "numeric" })}
							</Trans>
						</span>
					</div>
				</div>

				{/* Stats grid */}
				<div className="grid grid-cols-2 gap-4 md:grid-cols-4">
					<div className="rounded-lg bg-muted/50 p-4 text-center">
						<p className="font-bold text-2xl">
							{progress.completedSteps}/{progress.totalSteps}
						</p>
						<p className="text-muted-foreground text-sm">
							<Trans>Steps</Trans>
						</p>
					</div>
					<div className="rounded-lg bg-muted/50 p-4 text-center">
						<p className="font-bold text-2xl">
							{progress.completedMilestones}/{progress.totalMilestones}
						</p>
						<p className="text-muted-foreground text-sm">
							<Trans>Milestones</Trans>
						</p>
					</div>
					<div className="rounded-lg bg-muted/50 p-4 text-center">
						<p className="font-bold text-2xl">
							{progress.completedSkills}/{progress.totalSkills}
						</p>
						<p className="text-muted-foreground text-sm">
							<Trans>Skills</Trans>
						</p>
					</div>
					<div className="rounded-lg bg-muted/50 p-4 text-center">
						<p className="font-bold text-2xl">{daysRemaining}</p>
						<p className="text-muted-foreground text-sm">
							<Trans>Days Left</Trans>
						</p>
					</div>
				</div>

				{/* Activity streak */}
				<div className="flex items-center justify-between rounded-lg border p-4">
					<div className="flex items-center gap-3">
						<div className="flex size-12 items-center justify-center rounded-full bg-amber-500/20">
							<FireIcon className="size-6 text-amber-500" weight="fill" />
						</div>
						<div>
							<p className="font-bold text-lg">
								<Trans>{progress.streakDays} Day Streak</Trans>
							</p>
							<p className="text-muted-foreground text-sm">
								<Trans>Keep up the momentum!</Trans>
							</p>
						</div>
					</div>
					<div
						className={cn(
							"rounded-full px-3 py-1 font-medium text-sm",
							progress.actualProgress >= 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700",
						)}
					>
						{progress.actualProgress >= 0 ? (
							<span className="flex items-center gap-1">
								<TrendUpIcon className="size-4" />
								<Trans>{progress.actualProgress}% ahead</Trans>
							</span>
						) : (
							<span className="flex items-center gap-1">
								<WarningCircleIcon className="size-4" />
								<Trans>{Math.abs(progress.actualProgress)}% behind</Trans>
							</span>
						)}
					</div>
				</div>
			</CardContent>
		</Card>
	);
}

function FireIcon(props: { className?: string; weight?: string }) {
	return (
		<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" className={props.className} fill="currentColor">
			<path d="M143.38,17.85a8,8,0,0,0-12.63,3.41l-22,60.41L84.59,58.26a8,8,0,0,0-11.93.89C51,87.53,40,116.08,40,144a88,88,0,0,0,176,0C216,84.55,165.21,36,143.38,17.85ZM128,216a72.08,72.08,0,0,1-72-72c0-22,8.09-44.79,24.06-67.84l26.37,25.58a8,8,0,0,0,13.09-3.87l23.4-64.2C168.11,58.21,200,91.79,200,144A72.08,72.08,0,0,1,128,216Zm40-72a40,40,0,1,1-80,0c0-16.08,9.28-31.84,16-40.9V136a24,24,0,0,0,48,0V103.1C158.72,112.16,168,127.92,168,144Z" />
		</svg>
	);
}

// Convert database roadmap to SavedRoadmap format
export function dbRoadmapToSavedRoadmap(dbRoadmap: DbRoadmap): SavedRoadmap {
	return {
		id: dbRoadmap.id,
		name: dbRoadmap.name,
		goal: dbRoadmap.goal,
		selectedPath: dbRoadmap.selectedPath,
		progress: dbRoadmap.progress,
		createdAt: dbRoadmap.createdAt.toISOString(),
		updatedAt: dbRoadmap.updatedAt.toISOString(),
		isShared: dbRoadmap.isShared,
		shareCode: dbRoadmap.shareCode ?? undefined,
	};
}

export function HeroSection() {
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
					<MagicWandIcon className="size-5 text-primary" weight="fill" />
					<span className="font-semibold text-primary text-sm uppercase tracking-wider">
						<Trans>AI-Powered Career Planning</Trans>
					</span>
				</motion.div>

				<motion.h2
					className="mb-4 bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text font-bold text-3xl text-transparent tracking-tight md:text-4xl lg:text-5xl"
					initial={false}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.3 }}
				>
					<Trans>Career Roadmap Generator</Trans>
				</motion.h2>

				<motion.p
					className="mb-8 max-w-2xl text-lg text-muted-foreground"
					initial={false}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.4 }}
				>
					<Trans>
						Generate personalized career roadmaps powered by AI. Compare alternative paths, track your progress, and
						achieve your career goals with actionable steps and resources.
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
							<BrainIcon className="size-5 text-primary" weight="duotone" />
						</div>
						<div>
							<p className="font-bold text-xl">AI</p>
							<p className="text-muted-foreground text-sm">
								<Trans>Powered</Trans>
							</p>
						</div>
					</div>
					<div className="flex items-center gap-2">
						<div className="flex size-10 items-center justify-center rounded-full bg-amber-500/10">
							<ArrowsSplitIcon className="size-5 text-amber-500" weight="duotone" />
						</div>
						<div>
							<p className="font-bold text-xl">3+</p>
							<p className="text-muted-foreground text-sm">
								<Trans>Alternative Paths</Trans>
							</p>
						</div>
					</div>
					<div className="flex items-center gap-2">
						<div className="flex size-10 items-center justify-center rounded-full bg-green-500/10">
							<TargetIcon className="size-5 text-green-500" weight="duotone" />
						</div>
						<div>
							<p className="font-bold text-xl">100%</p>
							<p className="text-muted-foreground text-sm">
								<Trans>Personalized</Trans>
							</p>
						</div>
					</div>
				</motion.div>
			</div>
		</motion.div>
	);
}

export function CreateTabContent({
	currentRole,
	setCurrentRole,
	targetRole,
	setTargetRole,
	industry,
	setIndustry,
	yearsExperience,
	setYearsExperience,
	timeline,
	setTimeline,
	selectedPriorities,
	setSelectedPriorities,
	selectedConstraints,
	setSelectedConstraints,
	industries,
	priorities,
	constraints,
	isGenerating,
	onGenerate,
	onReset,
}: CreateTabContentProps) {
	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2 text-xl">
					<TargetIcon className="size-6 text-primary" weight="duotone" />
					<Trans>Define Your Career Goal</Trans>
				</CardTitle>
				<CardDescription>
					<Trans>Tell us about your current situation and where you want to be.</Trans>
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-6">
				<div className="grid gap-6 md:grid-cols-2">
					<div className="space-y-2">
						<label className="font-medium text-sm">
							<Trans>Current Role</Trans>
						</label>
						<Input
							value={currentRole}
							onChange={(e) => setCurrentRole(e.target.value)}
							placeholder={t`Ex: Junior Developer, Student, etc.`}
						/>
					</div>
					<div className="space-y-2">
						<label className="font-medium text-sm">
							<Trans>Target Role</Trans>
						</label>
						<Input
							value={targetRole}
							onChange={(e) => setTargetRole(e.target.value)}
							placeholder={t`Ex: Senior Developer, HSE Manager, etc.`}
						/>
					</div>
				</div>

				<div className="space-y-2">
					<label className="font-medium text-sm">
						<Trans>Industry</Trans>
					</label>
					<Select value={industry} onValueChange={setIndustry}>
						<SelectTrigger>
							<SelectValue placeholder={t`Select your target industry`} />
						</SelectTrigger>
						<SelectContent>
							{industries.map((ind) => (
								<SelectItem key={ind.value} value={ind.value}>
									{ind.label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>

				<div className="grid gap-6 md:grid-cols-2">
					<div className="space-y-4">
						<div className="flex items-center justify-between">
							<label className="font-medium text-sm">
								<Trans>Years of Experience</Trans>
							</label>
							<Badge variant="outline">
								<Trans>{yearsExperience[0]} years</Trans>
							</Badge>
						</div>
						<Slider value={yearsExperience} onValueChange={setYearsExperience} min={0} max={20} step={1} />
						<div className="flex justify-between text-muted-foreground text-xs">
							<span>
								<Trans>0 years</Trans>
							</span>
							<span>
								<Trans>20+ years</Trans>
							</span>
						</div>
					</div>
					<div className="space-y-4">
						<div className="flex items-center justify-between">
							<label className="font-medium text-sm">
								<Trans>Timeline to Achieve Goal</Trans>
							</label>
							<Badge variant="outline">
								<Trans>{timeline[0]} months</Trans>
							</Badge>
						</div>
						<Slider value={timeline} onValueChange={setTimeline} min={3} max={36} step={3} />
						<div className="flex justify-between text-muted-foreground text-xs">
							<span>
								<Trans>3 months</Trans>
							</span>
							<span>
								<Trans>36 months</Trans>
							</span>
						</div>
					</div>
				</div>

				<div className="space-y-3">
					<label className="font-medium text-sm">
						<Trans>Priorities (select up to 3)</Trans>
					</label>
					<div className="flex flex-wrap gap-2">
						{priorities.map((priority) => (
							<Badge
								key={priority.value}
								variant={selectedPriorities.includes(priority.value) ? "default" : "outline"}
								className={cn(
									"cursor-pointer transition-all",
									selectedPriorities.includes(priority.value) && "bg-primary",
								)}
								onClick={() => {
									if (selectedPriorities.includes(priority.value)) {
										setSelectedPriorities((prev) => prev.filter((p) => p !== priority.value));
									} else if (selectedPriorities.length < 3) {
										setSelectedPriorities((prev) => [...prev, priority.value]);
									}
								}}
							>
								{priority.label}
							</Badge>
						))}
					</div>
				</div>

				<div className="space-y-3">
					<label className="font-medium text-sm">
						<Trans>Constraints (select all that apply)</Trans>
					</label>
					<div className="flex flex-wrap gap-2">
						{constraints.map((constraint) => (
							<Badge
								key={constraint.value}
								variant={selectedConstraints.includes(constraint.value) ? "default" : "outline"}
								className={cn(
									"cursor-pointer transition-all",
									selectedConstraints.includes(constraint.value) && "bg-amber-500",
								)}
								onClick={() => {
									if (selectedConstraints.includes(constraint.value)) {
										setSelectedConstraints((prev) => prev.filter((c) => c !== constraint.value));
									} else {
										setSelectedConstraints((prev) => [...prev, constraint.value]);
									}
								}}
							>
								{constraint.label}
							</Badge>
						))}
					</div>
				</div>
			</CardContent>
			<CardFooter className="flex justify-between">
				<Button variant="outline" onClick={onReset}>
					<Trans>Reset</Trans>
				</Button>
				<Button
					onClick={onGenerate}
					disabled={!currentRole.trim() || !targetRole.trim() || !industry || isGenerating}
					className="gap-2"
				>
					{isGenerating ? (
						<>
							<motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
								<SparkleIcon className="size-4" />
							</motion.div>
							<Trans>Generating...</Trans>
						</>
					) : (
						<>
							<MagicWandIcon className="size-4" />
							<Trans>Generate Roadmap</Trans>
						</>
					)}
				</Button>
			</CardFooter>
		</Card>
	);
}

export function CompareTabContent({
	generatedPaths,
	selectedPath,
	expandedSteps,
	isSaveDialogOpen,
	setIsSaveDialogOpen,
	roadmapName,
	setRoadmapName,
	isSaving,
	onSelectPath,
	onToggleExpand,
	onSaveRoadmap,
}: CompareTabContentProps) {
	if (generatedPaths.length === 0) return null;

	return (
		<>
			<div>
				<h3 className="mb-4 flex items-center gap-2 font-semibold text-xl">
					<ArrowsSplitIcon className="size-6 text-primary" weight="duotone" />
					<Trans>Compare Alternative Paths</Trans>
				</h3>
				<div className="grid gap-6 lg:grid-cols-3">
					{generatedPaths.map((path) => (
						<PathComparisonCard
							key={path.id}
							path={path}
							isSelected={path.isSelected}
							onSelect={() => onSelectPath(path.id)}
						/>
					))}
				</div>
			</div>

			{selectedPath && (
				<Card>
					<CardHeader>
						<div className="flex items-center justify-between">
							<div>
								<CardTitle className="flex items-center gap-2 text-xl">
									<PathIcon className="size-6 text-primary" weight="duotone" />
									<Trans>{selectedPath.name} - Detailed Steps</Trans>
								</CardTitle>
								<CardDescription>
									<Trans>
										{selectedPath.steps.length} steps over {formatWeeks(selectedPath.duration)}
									</Trans>
								</CardDescription>
							</div>
							<Dialog open={isSaveDialogOpen} onOpenChange={setIsSaveDialogOpen}>
								<DialogTrigger asChild>
									<Button className="gap-2" disabled={isSaving}>
										<FloppyDiskIcon className="size-4" />
										<Trans>Save Roadmap</Trans>
									</Button>
								</DialogTrigger>
								<DialogContent>
									<DialogHeader>
										<DialogTitle>
											<Trans>Save Your Roadmap</Trans>
										</DialogTitle>
										<DialogDescription>
											<Trans>Give your roadmap a name to save it for later.</Trans>
										</DialogDescription>
									</DialogHeader>
									<div className="py-4">
										<Input
											value={roadmapName}
											onChange={(e) => setRoadmapName(e.target.value)}
											placeholder={t`Ex: My Path to Senior Developer`}
										/>
									</div>
									<DialogFooter>
										<DialogClose asChild>
											<Button variant="outline">
												<Trans>Cancel</Trans>
											</Button>
										</DialogClose>
										<Button onClick={onSaveRoadmap} disabled={!roadmapName.trim() || isSaving}>
											{isSaving ? <Trans>Saving...</Trans> : <Trans>Save</Trans>}
										</Button>
									</DialogFooter>
								</DialogContent>
							</Dialog>
						</div>
					</CardHeader>
					<CardContent className="space-y-4">
						{selectedPath.steps.map((step, index) => (
							<div key={step.id} className="relative">
								{index < selectedPath.steps.length - 1 && (
									<div className="absolute top-16 bottom-0 left-6 w-0.5 bg-gradient-to-b from-primary/50 to-primary/10" />
								)}
								<RoadmapStepCard
									step={step}
									isActive={index === 0}
									onToggleComplete={() => {}}
									onExpand={() => onToggleExpand(step.id)}
									isExpanded={expandedSteps.has(step.id)}
								/>
							</div>
						))}
					</CardContent>
				</Card>
			)}
		</>
	);
}

export function ProgressTabContent({
	currentRoadmap,
	expandedSteps,
	isShareDialogOpen,
	setIsShareDialogOpen,
	shareCode,
	isSharing,
	onToggleStepComplete,
	onToggleExpand,
	onShareRoadmap,
	onExportRoadmap,
}: ProgressTabContentProps) {
	return (
		<>
			<ProgressOverview progress={currentRoadmap.progress} roadmap={currentRoadmap} />

			<div className="flex flex-wrap gap-4">
				<Button variant="outline" onClick={onShareRoadmap} className="gap-2" disabled={isSharing}>
					<ShareNetworkIcon className="size-4" />
					{isSharing ? <Trans>Sharing...</Trans> : <Trans>Share Roadmap</Trans>}
				</Button>
				<Button variant="outline" onClick={onExportRoadmap} className="gap-2">
					<DownloadSimpleIcon className="size-4" />
					<Trans>Export</Trans>
				</Button>
			</div>

			<Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>
							<Trans>Share Your Roadmap</Trans>
						</DialogTitle>
						<DialogDescription>
							<Trans>Share your roadmap with others using this code.</Trans>
						</DialogDescription>
					</DialogHeader>
					<div className="py-4">
						<div className="flex items-center gap-2">
							<Input value={shareCode} readOnly className="font-mono text-lg tracking-widest" />
							<Button variant="outline" size="icon" onClick={() => navigator.clipboard.writeText(shareCode)}>
								<CopyIcon className="size-4" />
							</Button>
						</div>
					</div>
					<DialogFooter>
						<Button onClick={() => setIsShareDialogOpen(false)}>
							<Trans>Done</Trans>
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2 text-xl">
						<PathIcon className="size-6 text-primary" weight="duotone" />
						<Trans>Your Roadmap Steps</Trans>
					</CardTitle>
					<CardDescription>
						<Trans>Track your progress through each step of your career roadmap.</Trans>
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					{currentRoadmap.selectedPath.steps.map((step, index) => {
						const isActive = currentRoadmap.progress.currentStepId === step.id;
						return (
							<div key={step.id} className="relative">
								{index < currentRoadmap.selectedPath.steps.length - 1 && (
									<div
										className={cn(
											"absolute top-16 bottom-0 left-6 w-0.5",
											step.completed ? "bg-green-500" : "bg-gradient-to-b from-primary/50 to-primary/10",
										)}
									/>
								)}
								<RoadmapStepCard
									step={step}
									isActive={isActive}
									onToggleComplete={() => onToggleStepComplete(step.id)}
									onExpand={() => onToggleExpand(step.id)}
									isExpanded={expandedSteps.has(step.id)}
								/>
							</div>
						);
					})}
				</CardContent>
			</Card>
		</>
	);
}

export function SavedRoadmapsTabContent({
	savedRoadmaps,
	currentRoadmapId,
	isUpdating,
	isDeleting,
	onLoadRoadmap,
	onDeleteRoadmap,
	onCreateNew,
}: SavedRoadmapsTabContentProps) {
	return (
		<div>
			<h3 className="mb-4 flex items-center gap-2 font-semibold text-xl">
				<FloppyDiskIcon className="size-6 text-primary" weight="duotone" />
				<Trans>Your Saved Roadmaps</Trans>
			</h3>

			{savedRoadmaps.length === 0 ? (
				<Card className="border-dashed">
					<CardContent className="flex flex-col items-center py-12 text-center">
						<PathIcon className="mb-4 size-12 text-muted-foreground/50" />
						<h4 className="mb-2 font-medium text-lg">
							<Trans>No Saved Roadmaps</Trans>
						</h4>
						<p className="mb-4 max-w-sm text-muted-foreground">
							<Trans>Create your first career roadmap to start planning your path to success.</Trans>
						</p>
						<Button onClick={onCreateNew} className="gap-2">
							<PlusCircleIcon className="size-4" />
							<Trans>Create Roadmap</Trans>
						</Button>
					</CardContent>
				</Card>
			) : (
				<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
					{savedRoadmaps.map((roadmap) => (
						<motion.div key={roadmap.id} initial={false} animate={{ opacity: 1, scale: 1 }}>
							<Card
								className={cn(
									"h-full transition-all hover:shadow-lg",
									currentRoadmapId === roadmap.id && "border-primary",
								)}
							>
								<CardHeader className="pb-2">
									<div className="flex items-start justify-between">
										<div>
											<CardTitle className="text-lg">{roadmap.name}</CardTitle>
											<CardDescription>
												{roadmap.goal.currentRole} → {roadmap.goal.targetRole}
											</CardDescription>
										</div>
										{currentRoadmapId === roadmap.id && (
											<Badge className="bg-primary">
												<Trans>Active</Trans>
											</Badge>
										)}
									</div>
								</CardHeader>
								<CardContent className="space-y-3">
									<div className="space-y-1">
										<div className="flex items-center justify-between text-sm">
											<span className="text-muted-foreground">
												<Trans>Progress</Trans>
											</span>
											<span className="font-medium">{roadmap.progress.overallProgress}%</span>
										</div>
										<Progress value={roadmap.progress.overallProgress} className="h-2" />
									</div>
									<div className="flex flex-wrap gap-2 text-muted-foreground text-xs">
										<span className="flex items-center gap-1">
											<PathIcon className="size-3" />
											<Trans>{roadmap.selectedPath.steps.length} steps</Trans>
										</span>
										<span className="flex items-center gap-1">
											<CalendarIcon className="size-3" />
											{formatDate(roadmap.createdAt, { day: "numeric", month: "short", year: "numeric" })}
										</span>
										{roadmap.isShared && (
											<span className="flex items-center gap-1 text-green-600">
												<ShareNetworkIcon className="size-3" />
												<Trans>Shared</Trans>
											</span>
										)}
									</div>
								</CardContent>
								<CardFooter className="flex gap-2">
									<Button
										variant="outline"
										size="sm"
										className="flex-1"
										onClick={() => onLoadRoadmap(roadmap.id)}
										disabled={isUpdating}
									>
										<Trans>Load</Trans>
									</Button>
									<AlertDialog>
										<AlertDialogTrigger asChild>
											<Button variant="ghost" size="icon-sm" disabled={isDeleting}>
												<TrashIcon className="size-4 text-destructive" />
											</Button>
										</AlertDialogTrigger>
										<AlertDialogContent>
											<AlertDialogHeader>
												<AlertDialogTitle>
													<Trans>Delete Roadmap?</Trans>
												</AlertDialogTitle>
												<AlertDialogDescription>
													<Trans>
														This action cannot be undone. Your roadmap "{roadmap.name}" will be permanently deleted.
													</Trans>
												</AlertDialogDescription>
											</AlertDialogHeader>
											<AlertDialogFooter>
												<AlertDialogCancel>
													<Trans>Cancel</Trans>
												</AlertDialogCancel>
												<AlertDialogAction onClick={() => onDeleteRoadmap(roadmap.id)}>
													<Trans>Delete</Trans>
												</AlertDialogAction>
											</AlertDialogFooter>
										</AlertDialogContent>
									</AlertDialog>
								</CardFooter>
							</Card>
						</motion.div>
					))}
				</div>
			)}
		</div>
	);
}
