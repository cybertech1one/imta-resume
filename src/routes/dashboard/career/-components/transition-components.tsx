// Sub-components for the Career Transition Planner feature

import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import {
	ArrowRightIcon,
	ArrowsLeftRightIcon,
	BookOpenIcon,
	CalendarIcon,
	ChartLineUpIcon,
	CheckCircleIcon,
	CircleIcon,
	ClockIcon,
	ListChecksIcon,
	PencilSimpleIcon,
	PlusIcon,
	RocketLaunchIcon,
	SparkleIcon,
	TargetIcon,
	TrashIcon,
	UsersIcon,
	XIcon,
} from "@phosphor-icons/react";
import { Link } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/utils/style";

import type {
	ActionCategory,
	ActionCategoryConfig,
	ActionFormState,
	PhaseFormState,
	Priority,
	PriorityConfig,
	SkillCategory,
	SkillCategoryConfig,
	SkillFormState,
} from "./transition-types";

// ---------- Hero Section ----------

export function HeroSection({
	onAddSkill,
	onAddPhase,
	onAddAction,
}: {
	onAddSkill: () => void;
	onAddPhase: () => void;
	onAddAction: () => void;
}) {
	return (
		<motion.div
			initial={false}
			animate={{ opacity: 1, y: 0 }}
			className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-6 md:p-8"
		>
			<div className="relative z-10">
				<div className="mb-2 flex items-center gap-2">
					<ArrowsLeftRightIcon className="size-5 text-primary" weight="duotone" />
					<span className="font-semibold text-primary text-sm uppercase tracking-wider">
						<Trans>Career Transition</Trans>
					</span>
				</div>
				<h2 className="mb-3 font-bold text-2xl md:text-3xl">
					<Trans>Plan Your Professional Growth</Trans>
				</h2>
				<p className="mb-6 max-w-2xl text-muted-foreground">
					<Trans>
						Identify your transferable skills, define your goals, and create a structured action plan to succeed in your
						career transition.
					</Trans>
				</p>
				<div className="flex flex-wrap gap-4">
					<Button onClick={onAddSkill} className="gap-2">
						<PlusIcon className="size-4" />
						<Trans>Add a Skill</Trans>
					</Button>
					<Button onClick={onAddPhase} variant="outline" className="gap-2">
						<CalendarIcon className="size-4" />
						<Trans>New Phase</Trans>
					</Button>
					<Button onClick={onAddAction} variant="outline" className="gap-2">
						<ListChecksIcon className="size-4" />
						<Trans>New Action</Trans>
					</Button>
				</div>
			</div>
			{/* Decorative background */}
			<div className="pointer-events-none absolute -top-20 -right-20 size-64 rounded-full bg-primary/10 blur-3xl" />
		</motion.div>
	);
}

// ---------- Overview Stats ----------

type OverviewData =
	| {
			overallReadiness?: number;
			skills?: { total?: number };
			timeline?: { completed?: number; total?: number; completionRate?: number };
			actions?: { completed?: number; total?: number; completionRate?: number };
	  }
	| null
	| undefined;

export function OverviewStats({ overview, isLoading }: { overview: OverviewData; isLoading: boolean }) {
	if (isLoading) {
		return (
			<div className="grid gap-4 md:grid-cols-4">
				{[1, 2, 3, 4].map((i) => (
					<Skeleton key={i} className="h-28" />
				))}
			</div>
		);
	}

	return (
		<div className="grid gap-4 md:grid-cols-4">
			<Card>
				<CardHeader className="pb-2">
					<CardDescription className="flex items-center gap-2">
						<TargetIcon className="size-4" />
						<Trans>Readiness Score</Trans>
					</CardDescription>
					<CardTitle className="text-3xl">{overview?.overallReadiness ?? 0}%</CardTitle>
				</CardHeader>
				<CardContent>
					<Progress value={overview?.overallReadiness ?? 0} className="h-2" />
				</CardContent>
			</Card>

			<Card>
				<CardHeader className="pb-2">
					<CardDescription className="flex items-center gap-2">
						<ChartLineUpIcon className="size-4" />
						<Trans>Skills</Trans>
					</CardDescription>
					<CardTitle className="text-3xl">{overview?.skills?.total ?? 0}</CardTitle>
				</CardHeader>
				<CardContent>
					<p className="text-muted-foreground text-xs">
						<Trans>Transferable skills</Trans>
					</p>
				</CardContent>
			</Card>

			<Card>
				<CardHeader className="pb-2">
					<CardDescription className="flex items-center gap-2">
						<CalendarIcon className="size-4" />
						<Trans>Timeline</Trans>
					</CardDescription>
					<CardTitle className="text-3xl">
						{overview?.timeline?.completed ?? 0}/{overview?.timeline?.total ?? 0}
					</CardTitle>
				</CardHeader>
				<CardContent>
					<Progress value={overview?.timeline?.completionRate ?? 0} className="h-2" />
				</CardContent>
			</Card>

			<Card>
				<CardHeader className="pb-2">
					<CardDescription className="flex items-center gap-2">
						<ListChecksIcon className="size-4" />
						<Trans>Actions</Trans>
					</CardDescription>
					<CardTitle className="text-3xl">
						{overview?.actions?.completed ?? 0}/{overview?.actions?.total ?? 0}
					</CardTitle>
				</CardHeader>
				<CardContent>
					<Progress value={overview?.actions?.completionRate ?? 0} className="h-2" />
				</CardContent>
			</Card>
		</div>
	);
}

// ---------- Overview Tab Content ----------

type SkillsArray = Array<{
	id: string;
	name: string;
	nameFr: string;
	category: string;
	currentLevel: number;
	relevanceToTarget: number;
	description: string | null;
}>;
type TimelineArray = Array<{
	id: string;
	name: string;
	nameFr: string;
	duration: string;
	durationWeeks: number;
	description: string | null;
	// biome-ignore lint/suspicious/noExplicitAny: tasks field comes from JSONB column with varying shape
	tasks: any;
	completed: boolean;
}>;
type ActionsArray = Array<{
	id: string;
	task: string;
	taskFr: string;
	category: string;
	priority: string;
	deadline: string;
	estimatedHours: number;
	completed: boolean;
}>;

export function OverviewTabContent({
	skillCategories,
	actionCategories,
	priorities,
	skillsByCategory,
	upcomingActions,
	timeline,
	onSetTab,
	onAddAction,
	onAddPhase,
}: {
	skillCategories: Record<SkillCategory, SkillCategoryConfig>;
	actionCategories: Record<ActionCategory, ActionCategoryConfig>;
	priorities: Record<Priority, PriorityConfig>;
	skillsByCategory: Partial<Record<SkillCategory, SkillsArray>>;
	upcomingActions: ActionsArray;
	timeline: TimelineArray | undefined;
	onSetTab: (tab: string) => void;
	onAddAction: () => void;
	onAddPhase: () => void;
}) {
	return (
		<div className="space-y-6">
			<div className="grid gap-6 lg:grid-cols-2">
				{/* Skills Summary */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<SparkleIcon className="size-5" />
							<Trans>Skills by Category</Trans>
						</CardTitle>
						<CardDescription>
							<Trans>Distribution of your transferable skills</Trans>
						</CardDescription>
					</CardHeader>
					<CardContent>
						{Object.entries(skillCategories).map(([key, category]) => {
							const count = skillsByCategory[key as SkillCategory]?.length ?? 0;
							const CategoryIcon = category.icon;
							return (
								<div key={key} className="mb-4 flex items-center justify-between last:mb-0">
									<div className="flex items-center gap-3">
										<div className={cn("flex size-10 items-center justify-center rounded-lg", category.bgColor)}>
											<CategoryIcon className={cn("size-5", category.color)} weight="duotone" />
										</div>
										<span className="font-medium">{category.name}</span>
									</div>
									<Badge variant="secondary">{count}</Badge>
								</div>
							);
						})}
					</CardContent>
					<CardFooter>
						<Button variant="outline" className="w-full" onClick={() => onSetTab("skills")}>
							<Trans>View all skills</Trans>
							<ArrowRightIcon className="ml-2 size-4" />
						</Button>
					</CardFooter>
				</Card>

				{/* Upcoming Actions */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<ClockIcon className="size-5" />
							<Trans>Upcoming Actions</Trans>
						</CardTitle>
						<CardDescription>
							<Trans>Your next steps</Trans>
						</CardDescription>
					</CardHeader>
					<CardContent>
						{upcomingActions.length > 0 ? (
							<div className="space-y-3">
								{upcomingActions.map((action) => {
									const category = actionCategories[action.category as ActionCategory];
									const CategoryIcon = category?.icon ?? ListChecksIcon;
									const daysUntil = Math.ceil(
										(new Date(action.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
									);
									return (
										<div key={action.id} className="flex items-center gap-3 rounded-lg border p-3">
											<CategoryIcon className={cn("size-5", category?.color)} />
											<div className="min-w-0 flex-1">
												<p className="truncate font-medium text-sm">{action.task}</p>
												<p className="text-muted-foreground text-xs">
													{daysUntil > 0 ? (
														<Trans>In {daysUntil} day(s)</Trans>
													) : daysUntil === 0 ? (
														<Trans>Today</Trans>
													) : (
														<Trans>Overdue</Trans>
													)}
												</p>
											</div>
											<Badge className={priorities[action.priority as Priority]?.color}>
												{priorities[action.priority as Priority]?.name}
											</Badge>
										</div>
									);
								})}
							</div>
						) : (
							<div className="flex flex-col items-center gap-4 py-8 text-center">
								<CheckCircleIcon className="size-12 text-green-500" />
								<p className="text-muted-foreground">
									<Trans>No upcoming actions. Add one!</Trans>
								</p>
								<Button onClick={onAddAction} size="sm">
									<PlusIcon className="mr-2 size-4" />
									<Trans>Add an action</Trans>
								</Button>
							</div>
						)}
					</CardContent>
					{upcomingActions.length > 0 && (
						<CardFooter>
							<Button variant="outline" className="w-full" onClick={() => onSetTab("actions")}>
								<Trans>View all actions</Trans>
								<ArrowRightIcon className="ml-2 size-4" />
							</Button>
						</CardFooter>
					)}
				</Card>
			</div>

			{/* Timeline Preview */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<RocketLaunchIcon className="size-5" />
						<Trans>Your Transition Path</Trans>
					</CardTitle>
					<CardDescription>
						<Trans>The key phases of your professional transition</Trans>
					</CardDescription>
				</CardHeader>
				<CardContent>
					{timeline && timeline.length > 0 ? (
						<div className="relative">
							{/* Timeline line */}
							<div className="absolute top-5 left-5 h-[calc(100%-40px)] w-0.5 bg-border" />

							<div className="space-y-6">
								{timeline.slice(0, 4).map((phase, index) => (
									<motion.div
										key={phase.id}
										initial={false}
										animate={{ opacity: 1, x: 0 }}
										transition={{ delay: index * 0.1 }}
										className="relative flex gap-4 pl-2"
									>
										<div
											className={cn(
												"relative z-10 flex size-10 shrink-0 items-center justify-center rounded-full border-2",
												phase.completed
													? "border-green-500 bg-green-100 dark:bg-green-900/30"
													: "border-muted-foreground/30 bg-background",
											)}
										>
											{phase.completed ? (
												<CheckCircleIcon className="size-5 text-green-500" weight="fill" />
											) : (
												<span className="font-medium text-muted-foreground text-sm">{index + 1}</span>
											)}
										</div>
										<div className="flex-1 pb-2">
											<div className="flex items-center gap-2">
												<h4 className="font-medium">{phase.name}</h4>
												<Badge variant="outline">{phase.duration}</Badge>
											</div>
											{phase.description && <p className="mt-1 text-muted-foreground text-sm">{phase.description}</p>}
										</div>
									</motion.div>
								))}
							</div>
						</div>
					) : (
						<div className="flex flex-col items-center gap-4 py-8 text-center">
							<CalendarIcon className="size-12 text-muted-foreground" />
							<p className="text-muted-foreground">
								<Trans>Create your first transition phase</Trans>
							</p>
							<Button onClick={onAddPhase} size="sm">
								<PlusIcon className="mr-2 size-4" />
								<Trans>Create a phase</Trans>
							</Button>
						</div>
					)}
				</CardContent>
				{timeline && timeline.length > 4 && (
					<CardFooter>
						<Button variant="outline" className="w-full" onClick={() => onSetTab("timeline")}>
							<Trans>View the full path</Trans>
							<ArrowRightIcon className="ml-2 size-4" />
						</Button>
					</CardFooter>
				)}
			</Card>

			{/* Quick Links */}
			<Card>
				<CardHeader>
					<CardTitle>
						<Trans>Useful Resources</Trans>
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="grid gap-3 md:grid-cols-3">
						<Button asChild variant="outline" className="h-auto justify-start py-3">
							<Link to="/dashboard/career/skills">
								<ChartLineUpIcon className="mr-3 size-5 text-blue-500" />
								<div className="text-left">
									<p className="font-medium">
										<Trans>Skills Management</Trans>
									</p>
									<p className="text-muted-foreground text-xs">
										<Trans>Assess your skills</Trans>
									</p>
								</div>
							</Link>
						</Button>
						<Button asChild variant="outline" className="h-auto justify-start py-3">
							<Link to="/dashboard/networking/mentors">
								<UsersIcon className="mr-3 size-5 text-green-500" />
								<div className="text-left">
									<p className="font-medium">
										<Trans>Find a Mentor</Trans>
									</p>
									<p className="text-muted-foreground text-xs">
										<Trans>Get advice</Trans>
									</p>
								</div>
							</Link>
						</Button>
						<Button asChild variant="outline" className="h-auto justify-start py-3">
							<Link to="/dashboard/interview">
								<RocketLaunchIcon className="mr-3 size-5 text-purple-500" />
								<div className="text-left">
									<p className="font-medium">
										<Trans>Interview Preparation</Trans>
									</p>
									<p className="text-muted-foreground text-xs">
										<Trans>Practice</Trans>
									</p>
								</div>
							</Link>
						</Button>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}

// ---------- Skills Tab Content ----------

export function SkillsTabContent({
	skillCategories,
	skillsByCategory,
	skills,
	skillsLoading,
	onAddSkill,
	onEditSkill,
	onDeleteSkill,
}: {
	skillCategories: Record<SkillCategory, SkillCategoryConfig>;
	skillsByCategory: Partial<Record<SkillCategory, SkillsArray>>;
	skills: SkillsArray | undefined;
	skillsLoading: boolean;
	onAddSkill: () => void;
	onEditSkill: (id: string) => void;
	onDeleteSkill: (id: string) => void;
}) {
	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h3 className="font-semibold text-lg">
						<Trans>Transferable Skills</Trans>
					</h3>
					<p className="text-muted-foreground text-sm">
						<Trans>Manage your skills for the transition</Trans>
					</p>
				</div>
				<Button onClick={onAddSkill}>
					<PlusIcon className="mr-2 size-4" />
					<Trans>Add</Trans>
				</Button>
			</div>

			{skillsLoading ? (
				<div className="grid gap-4 md:grid-cols-2">
					{[1, 2, 3, 4].map((i) => (
						<Skeleton key={i} className="h-40" />
					))}
				</div>
			) : skills && skills.length > 0 ? (
				<div className="grid gap-4 md:grid-cols-2">
					{Object.entries(skillCategories).map(([key, category]) => {
						const categorySkills = skillsByCategory[key as SkillCategory] || [];
						const CategoryIcon = category.icon;

						return (
							<Card key={key}>
								<CardHeader className="pb-3">
									<div className="flex items-center gap-3">
										<div className={cn("flex size-10 items-center justify-center rounded-full", category.bgColor)}>
											<CategoryIcon className={cn("size-5", category.color)} weight="duotone" />
										</div>
										<div>
											<CardTitle className="text-base">{category.name}</CardTitle>
											<CardDescription>
												<Trans>{categorySkills.length} skill(s)</Trans>
											</CardDescription>
										</div>
									</div>
								</CardHeader>
								<CardContent>
									{categorySkills.length > 0 ? (
										<div className="space-y-3">
											{categorySkills.map((skill) => (
												<div key={skill.id} className="group flex items-center justify-between rounded-lg border p-3">
													<div className="min-w-0 flex-1">
														<p className="truncate font-medium text-sm">{skill.name}</p>
														<div className="mt-1 flex items-center gap-2">
															<div className="h-1.5 w-16 rounded-full bg-muted">
																<div
																	className="h-full rounded-full bg-primary"
																	style={{ width: `${skill.currentLevel}%` }}
																/>
															</div>
															<span className="text-muted-foreground text-xs">{skill.currentLevel}%</span>
														</div>
													</div>
													<div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
														<Button
															variant="ghost"
															size="icon"
															className="size-8"
															onClick={() => onEditSkill(skill.id)}
														>
															<PencilSimpleIcon className="size-4" />
														</Button>
														<Button
															variant="ghost"
															size="icon"
															className="size-8 text-destructive"
															onClick={() => onDeleteSkill(skill.id)}
														>
															<TrashIcon className="size-4" />
														</Button>
													</div>
												</div>
											))}
										</div>
									) : (
										<p className="text-muted-foreground text-sm">
											<Trans>No skills in this category</Trans>
										</p>
									)}
								</CardContent>
							</Card>
						);
					})}
				</div>
			) : (
				<Card>
					<CardContent className="flex flex-col items-center gap-4 py-12 text-center">
						<BookOpenIcon className="size-16 text-muted-foreground" />
						<div>
							<h3 className="font-semibold text-lg">
								<Trans>No skills recorded</Trans>
							</h3>
							<p className="text-muted-foreground">
								<Trans>Start by adding your transferable skills</Trans>
							</p>
						</div>
						<Button onClick={onAddSkill}>
							<PlusIcon className="mr-2 size-4" />
							<Trans>Add a skill</Trans>
						</Button>
					</CardContent>
				</Card>
			)}
		</div>
	);
}

// ---------- Timeline Tab Content ----------

export function TimelineTabContent({
	timeline,
	timelineLoading,
	onAddPhase,
	onEditPhase,
	onTogglePhase,
	onDeletePhase,
}: {
	timeline: TimelineArray | undefined;
	timelineLoading: boolean;
	onAddPhase: () => void;
	onEditPhase: (id: string) => void;
	onTogglePhase: (id: string) => void;
	onDeletePhase: (id: string) => void;
}) {
	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h3 className="font-semibold text-lg">
						<Trans>Transition Timeline</Trans>
					</h3>
					<p className="text-muted-foreground text-sm">
						<Trans>Define the key phases of your path</Trans>
					</p>
				</div>
				<Button onClick={onAddPhase}>
					<PlusIcon className="mr-2 size-4" />
					<Trans>New Phase</Trans>
				</Button>
			</div>

			{timelineLoading ? (
				<div className="space-y-4">
					{[1, 2, 3].map((i) => (
						<Skeleton key={i} className="h-32" />
					))}
				</div>
			) : timeline && timeline.length > 0 ? (
				<div className="relative space-y-4">
					{/* Timeline line */}
					<div className="absolute top-6 left-6 h-[calc(100%-48px)] w-0.5 bg-border" />

					<AnimatePresence>
						{timeline.map((phase, index) => (
							<motion.div
								key={phase.id}
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								exit={{ opacity: 0, y: -20 }}
								transition={{ delay: index * 0.05 }}
							>
								<Card className="relative ml-12">
									{/* Timeline node */}
									<div
										className={cn(
											"absolute top-6 -left-12 flex size-12 items-center justify-center rounded-full border-4 border-background",
											phase.completed ? "bg-green-500 text-white" : "bg-muted text-muted-foreground",
										)}
									>
										{phase.completed ? (
											<CheckCircleIcon className="size-6" weight="fill" />
										) : (
											<span className="font-bold">{index + 1}</span>
										)}
									</div>

									<CardHeader>
										<div className="flex items-start justify-between">
											<div>
												<CardTitle className="text-lg">{phase.name}</CardTitle>
												<CardDescription className="flex items-center gap-2">
													<ClockIcon className="size-4" />
													<Trans>
														{phase.duration} ({phase.durationWeeks} weeks)
													</Trans>
												</CardDescription>
											</div>
											<div className="flex gap-2">
												<Button variant="outline" size="sm" onClick={() => onTogglePhase(phase.id)}>
													{phase.completed ? (
														<>
															<CircleIcon className="mr-1 size-4" />
															<Trans>Cancel</Trans>
														</>
													) : (
														<>
															<CheckCircleIcon className="mr-1 size-4" />
															<Trans>Finish</Trans>
														</>
													)}
												</Button>
												<Button variant="ghost" size="icon" onClick={() => onEditPhase(phase.id)}>
													<PencilSimpleIcon className="size-4" />
												</Button>
												<Button
													variant="ghost"
													size="icon"
													className="text-destructive"
													onClick={() => onDeletePhase(phase.id)}
												>
													<TrashIcon className="size-4" />
												</Button>
											</div>
										</div>
									</CardHeader>
									{phase.description && (
										<CardContent className="pt-0">
											<p className="text-muted-foreground text-sm">{phase.description}</p>
											{phase.tasks && (phase.tasks as string[]).length > 0 && (
												<div className="mt-3 flex flex-wrap gap-1">
													{(phase.tasks as string[]).map((task, i) => (
														<Badge key={i} variant="secondary" className="text-xs">
															{task}
														</Badge>
													))}
												</div>
											)}
										</CardContent>
									)}
								</Card>
							</motion.div>
						))}
					</AnimatePresence>
				</div>
			) : (
				<Card>
					<CardContent className="flex flex-col items-center gap-4 py-12 text-center">
						<CalendarIcon className="size-16 text-muted-foreground" />
						<div>
							<h3 className="font-semibold text-lg">
								<Trans>No phases defined</Trans>
							</h3>
							<p className="text-muted-foreground">
								<Trans>Create the key phases of your transition</Trans>
							</p>
						</div>
						<Button onClick={onAddPhase}>
							<PlusIcon className="mr-2 size-4" />
							<Trans>Create a phase</Trans>
						</Button>
					</CardContent>
				</Card>
			)}
		</div>
	);
}

// ---------- Actions Tab Content ----------

type ActionStatsData =
	| {
			total: number;
			completed: number;
			urgentIncomplete: number;
			completionRate: number;
	  }
	| null
	| undefined;

export function ActionsTabContent({
	actionCategories,
	priorities,
	actions,
	actionsLoading,
	actionStats,
	onAddAction,
	onEditAction,
	onToggleAction,
	onDeleteAction,
}: {
	actionCategories: Record<ActionCategory, ActionCategoryConfig>;
	priorities: Record<Priority, PriorityConfig>;
	actions: ActionsArray | undefined;
	actionsLoading: boolean;
	actionStats: ActionStatsData;
	onAddAction: () => void;
	onEditAction: (id: string) => void;
	onToggleAction: (id: string) => void;
	onDeleteAction: (id: string) => void;
}) {
	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h3 className="font-semibold text-lg">
						<Trans>Action Plan</Trans>
					</h3>
					<p className="text-muted-foreground text-sm">
						<Trans>Track your tasks and goals</Trans>
					</p>
				</div>
				<Button onClick={onAddAction}>
					<PlusIcon className="mr-2 size-4" />
					<Trans>New Action</Trans>
				</Button>
			</div>

			{/* Action Stats */}
			{actionStats && (
				<div className="grid gap-4 md:grid-cols-4">
					<Card>
						<CardContent className="pt-6">
							<div className="text-center">
								<p className="font-bold text-3xl">{actionStats.total}</p>
								<p className="text-muted-foreground text-sm">
									<Trans>Total</Trans>
								</p>
							</div>
						</CardContent>
					</Card>
					<Card>
						<CardContent className="pt-6">
							<div className="text-center">
								<p className="font-bold text-3xl text-green-500">{actionStats.completed}</p>
								<p className="text-muted-foreground text-sm">
									<Trans>Completed</Trans>
								</p>
							</div>
						</CardContent>
					</Card>
					<Card>
						<CardContent className="pt-6">
							<div className="text-center">
								<p className="font-bold text-3xl text-red-500">{actionStats.urgentIncomplete}</p>
								<p className="text-muted-foreground text-sm">
									<Trans>Urgent</Trans>
								</p>
							</div>
						</CardContent>
					</Card>
					<Card>
						<CardContent className="pt-6">
							<div className="text-center">
								<p className="font-bold text-3xl">{actionStats.completionRate}%</p>
								<p className="text-muted-foreground text-sm">
									<Trans>Progress</Trans>
								</p>
							</div>
						</CardContent>
					</Card>
				</div>
			)}

			{actionsLoading ? (
				<div className="space-y-3">
					{[1, 2, 3, 4].map((i) => (
						<Skeleton key={i} className="h-20" />
					))}
				</div>
			) : actions && actions.length > 0 ? (
				<div className="space-y-3">
					{actions.map((action, index) => {
						const category = actionCategories[action.category as ActionCategory];
						const CategoryIcon = category?.icon ?? ListChecksIcon;
						const priority = priorities[action.priority as Priority];
						const isOverdue = !action.completed && new Date(action.deadline) < new Date();

						return (
							<motion.div
								key={action.id}
								initial={false}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: index * 0.03 }}
							>
								<Card className={cn(action.completed && "opacity-60", isOverdue && "border-red-500/50")}>
									<CardContent className="flex items-center gap-4 py-4">
										<Button
											variant="ghost"
											size="icon"
											className="size-10 shrink-0"
											onClick={() => onToggleAction(action.id)}
										>
											{action.completed ? (
												<CheckCircleIcon className="size-6 text-green-500" weight="fill" />
											) : (
												<CircleIcon className="size-6 text-muted-foreground" />
											)}
										</Button>

										<div className="min-w-0 flex-1">
											<div className="flex items-center gap-2">
												<CategoryIcon className={cn("size-4", category?.color)} />
												<p className={cn("truncate font-medium", action.completed && "line-through")}>{action.task}</p>
											</div>
											<div className="mt-1 flex items-center gap-2">
												<Badge className={priority?.color} variant="secondary">
													{priority?.name}
												</Badge>
												<span className="text-muted-foreground text-xs">
													<ClockIcon className="mr-1 inline size-3" />
													{new Date(action.deadline).toLocaleDateString()}
												</span>
												<span className="text-muted-foreground text-xs">{action.estimatedHours}h</span>
											</div>
										</div>

										<div className="flex gap-1">
											<Button variant="ghost" size="icon" className="size-8" onClick={() => onEditAction(action.id)}>
												<PencilSimpleIcon className="size-4" />
											</Button>
											<Button
												variant="ghost"
												size="icon"
												className="size-8 text-destructive"
												onClick={() => onDeleteAction(action.id)}
											>
												<TrashIcon className="size-4" />
											</Button>
										</div>
									</CardContent>
								</Card>
							</motion.div>
						);
					})}
				</div>
			) : (
				<Card>
					<CardContent className="flex flex-col items-center gap-4 py-12 text-center">
						<ListChecksIcon className="size-16 text-muted-foreground" />
						<div>
							<h3 className="font-semibold text-lg">
								<Trans>No actions defined</Trans>
							</h3>
							<p className="text-muted-foreground">
								<Trans>Create your first actions to move forward</Trans>
							</p>
						</div>
						<Button onClick={onAddAction}>
							<PlusIcon className="mr-2 size-4" />
							<Trans>Create an action</Trans>
						</Button>
					</CardContent>
				</Card>
			)}
		</div>
	);
}

// ---------- Skill Modal ----------

export function SkillModal({
	open,
	onOpenChange,
	editing,
	form,
	setForm,
	skillCategories,
	onSubmit,
	isPending,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	editing: boolean;
	form: SkillFormState;
	setForm: (form: SkillFormState) => void;
	skillCategories: Record<SkillCategory, SkillCategoryConfig>;
	onSubmit: () => void;
	isPending: boolean;
}) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>{editing ? <Trans>Edit Skill</Trans> : <Trans>Add a Skill</Trans>}</DialogTitle>
					<DialogDescription>
						<Trans>Record a transferable skill for your transition</Trans>
					</DialogDescription>
				</DialogHeader>
				<div className="space-y-4">
					<div className="grid gap-4 md:grid-cols-2">
						<div className="space-y-2">
							<Label>
								<Trans>Name (English)</Trans>
							</Label>
							<Input
								value={form.name}
								onChange={(e) => setForm({ ...form, name: e.target.value })}
								placeholder={t`Project Management`}
							/>
						</div>
						<div className="space-y-2">
							<Label>
								<Trans>Name (French)</Trans>
							</Label>
							<Input
								value={form.nameFr}
								onChange={(e) => setForm({ ...form, nameFr: e.target.value })}
								placeholder={t`Project Management`}
							/>
						</div>
					</div>
					<div className="space-y-2">
						<Label>
							<Trans>Category</Trans>
						</Label>
						<Select
							value={form.category}
							onValueChange={(value) => setForm({ ...form, category: value as SkillCategory })}
						>
							<SelectTrigger>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{Object.entries(skillCategories).map(([key, cat]) => (
									<SelectItem key={key} value={key}>
										{cat.name}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
					<div className="space-y-2">
						<Label>
							<Trans>Current Level: {form.currentLevel}%</Trans>
						</Label>
						<Slider
							value={[form.currentLevel]}
							onValueChange={([value]) => setForm({ ...form, currentLevel: value })}
							max={100}
							step={5}
						/>
					</div>
					<div className="space-y-2">
						<Label>
							<Trans>Relevance to Target: {form.relevanceToTarget}%</Trans>
						</Label>
						<Slider
							value={[form.relevanceToTarget]}
							onValueChange={([value]) => setForm({ ...form, relevanceToTarget: value })}
							max={100}
							step={5}
						/>
					</div>
					<div className="space-y-2">
						<Label>
							<Trans>Description (optional)</Trans>
						</Label>
						<Textarea
							value={form.description}
							onChange={(e) => setForm({ ...form, description: e.target.value })}
							placeholder={t`Skill description...`}
							rows={3}
						/>
					</div>
				</div>
				<DialogFooter>
					<Button variant="outline" onClick={() => onOpenChange(false)}>
						<Trans>Cancel</Trans>
					</Button>
					<Button onClick={onSubmit} disabled={!form.name || !form.nameFr || isPending}>
						{editing ? <Trans>Edit</Trans> : <Trans>Add</Trans>}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

// ---------- Phase Modal ----------

export function PhaseModal({
	open,
	onOpenChange,
	editing,
	form,
	setForm,
	onSubmit,
	isPending,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	editing: boolean;
	form: PhaseFormState;
	setForm: (form: PhaseFormState) => void;
	onSubmit: () => void;
	isPending: boolean;
}) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-lg">
				<DialogHeader>
					<DialogTitle>{editing ? <Trans>Edit Phase</Trans> : <Trans>New Phase</Trans>}</DialogTitle>
					<DialogDescription>
						<Trans>Define a key step of your transition</Trans>
					</DialogDescription>
				</DialogHeader>
				<div className="space-y-4">
					<div className="grid gap-4 md:grid-cols-2">
						<div className="space-y-2">
							<Label>
								<Trans>Name (English)</Trans>
							</Label>
							<Input
								value={form.name}
								onChange={(e) => setForm({ ...form, name: e.target.value })}
								placeholder={t`Skill Assessment`}
							/>
						</div>
						<div className="space-y-2">
							<Label>
								<Trans>Name (French)</Trans>
							</Label>
							<Input
								value={form.nameFr}
								onChange={(e) => setForm({ ...form, nameFr: e.target.value })}
								placeholder={t`Skills Assessment`}
							/>
						</div>
					</div>
					<div className="grid gap-4 md:grid-cols-2">
						<div className="space-y-2">
							<Label>
								<Trans>Duration</Trans>
							</Label>
							<Input
								value={form.duration}
								onChange={(e) => setForm({ ...form, duration: e.target.value })}
								placeholder={t`1-2 months`}
							/>
						</div>
						<div className="space-y-2">
							<Label>
								<Trans>Weeks</Trans>
							</Label>
							<Input
								type="number"
								value={form.durationWeeks}
								onChange={(e) => setForm({ ...form, durationWeeks: Number(e.target.value) })}
								min={1}
							/>
						</div>
					</div>
					<div className="space-y-2">
						<Label>
							<Trans>Description</Trans>
						</Label>
						<Textarea
							value={form.description}
							onChange={(e) => setForm({ ...form, description: e.target.value })}
							placeholder={t`Phase description...`}
							rows={3}
						/>
					</div>
					<div className="space-y-2">
						<Label>
							<Trans>Tasks</Trans>
						</Label>
						<div className="flex gap-2">
							<Input
								value={form.newTask}
								onChange={(e) => setForm({ ...form, newTask: e.target.value })}
								placeholder={t`Add a task...`}
								onKeyDown={(e) => {
									if (e.key === "Enter" && form.newTask.trim()) {
										e.preventDefault();
										setForm({
											...form,
											tasks: [...form.tasks, form.newTask.trim()],
											newTask: "",
										});
									}
								}}
							/>
							<Button
								type="button"
								variant="outline"
								size="icon"
								onClick={() => {
									if (form.newTask.trim()) {
										setForm({
											...form,
											tasks: [...form.tasks, form.newTask.trim()],
											newTask: "",
										});
									}
								}}
							>
								<PlusIcon className="size-4" />
							</Button>
						</div>
						{form.tasks.length > 0 && (
							<div className="mt-2 flex flex-wrap gap-1">
								{form.tasks.map((task, i) => (
									<Badge key={i} variant="secondary" className="gap-1">
										{task}
										<button
											type="button"
											className="ml-1 hover:text-destructive"
											onClick={() =>
												setForm({
													...form,
													tasks: form.tasks.filter((_, idx) => idx !== i),
												})
											}
										>
											<XIcon className="size-3" />
										</button>
									</Badge>
								))}
							</div>
						)}
					</div>
				</div>
				<DialogFooter>
					<Button variant="outline" onClick={() => onOpenChange(false)}>
						<Trans>Cancel</Trans>
					</Button>
					<Button onClick={onSubmit} disabled={!form.name || !form.nameFr || !form.duration || isPending}>
						{editing ? <Trans>Edit</Trans> : <Trans>Create</Trans>}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

// ---------- Action Modal ----------

export function ActionModal({
	open,
	onOpenChange,
	editing,
	form,
	setForm,
	actionCategories,
	priorities,
	onSubmit,
	isPending,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	editing: boolean;
	form: ActionFormState;
	setForm: (form: ActionFormState) => void;
	actionCategories: Record<ActionCategory, ActionCategoryConfig>;
	priorities: Record<Priority, PriorityConfig>;
	onSubmit: () => void;
	isPending: boolean;
}) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>{editing ? <Trans>Edit Action</Trans> : <Trans>New Action</Trans>}</DialogTitle>
					<DialogDescription>
						<Trans>Define a concrete action for your transition</Trans>
					</DialogDescription>
				</DialogHeader>
				<div className="space-y-4">
					<div className="grid gap-4 md:grid-cols-2">
						<div className="space-y-2">
							<Label>
								<Trans>Task (English)</Trans>
							</Label>
							<Input
								value={form.task}
								onChange={(e) => setForm({ ...form, task: e.target.value })}
								placeholder={t`Complete online course`}
							/>
						</div>
						<div className="space-y-2">
							<Label>
								<Trans>Task (French)</Trans>
							</Label>
							<Input
								value={form.taskFr}
								onChange={(e) => setForm({ ...form, taskFr: e.target.value })}
								placeholder={t`Complete online course`}
							/>
						</div>
					</div>
					<div className="grid gap-4 md:grid-cols-2">
						<div className="space-y-2">
							<Label>
								<Trans>Category</Trans>
							</Label>
							<Select
								value={form.category}
								onValueChange={(value) => setForm({ ...form, category: value as ActionCategory })}
							>
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									{Object.entries(actionCategories).map(([key, cat]) => (
										<SelectItem key={key} value={key}>
											{cat.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
						<div className="space-y-2">
							<Label>
								<Trans>Priority</Trans>
							</Label>
							<Select
								value={form.priority}
								onValueChange={(value) => setForm({ ...form, priority: value as Priority })}
							>
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									{Object.entries(priorities).map(([key, p]) => (
										<SelectItem key={key} value={key}>
											{p.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
					</div>
					<div className="grid gap-4 md:grid-cols-2">
						<div className="space-y-2">
							<Label>
								<Trans>Deadline</Trans>
							</Label>
							<Input
								type="date"
								value={form.deadline}
								onChange={(e) => setForm({ ...form, deadline: e.target.value })}
							/>
						</div>
						<div className="space-y-2">
							<Label>
								<Trans>Estimated Hours</Trans>
							</Label>
							<Input
								type="number"
								value={form.estimatedHours}
								onChange={(e) => setForm({ ...form, estimatedHours: Number(e.target.value) })}
								min={1}
							/>
						</div>
					</div>
				</div>
				<DialogFooter>
					<Button variant="outline" onClick={() => onOpenChange(false)}>
						<Trans>Cancel</Trans>
					</Button>
					<Button onClick={onSubmit} disabled={!form.task || !form.taskFr || !form.deadline || isPending}>
						{editing ? <Trans>Edit</Trans> : <Trans>Create</Trans>}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
