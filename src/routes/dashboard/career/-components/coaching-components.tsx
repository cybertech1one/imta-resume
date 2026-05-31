import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import {
	BookOpenIcon,
	CalendarCheckIcon,
	CheckCircleIcon,
	FireIcon,
	FloppyDiskIcon,
	HeartIcon,
	LightbulbIcon,
	PathIcon,
	PencilSimpleIcon,
	PlusIcon,
	RocketIcon,
	SparkleIcon,
	SpinnerIcon,
	StarIcon,
	TargetIcon,
	TrophyIcon,
} from "@phosphor-icons/react";
import type { UseMutationResult } from "@tanstack/react-query";
import { motion } from "motion/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/utils/style";
import { ENTRY_TYPES, GOAL_CATEGORIES, MOOD_EMOJIS } from "./coaching-config";
import type { GoalCategory, GoalStatus, JournalEntryType } from "./coaching-types";

const GOAL_CATEGORY_ICONS: Record<GoalCategory, React.ReactNode> = {
	applications: <PencilSimpleIcon className="size-4" />,
	networking: <HeartIcon className="size-4" />,
	skills: <BookOpenIcon className="size-4" />,
	interview_prep: <TargetIcon className="size-4" />,
	personal_branding: <StarIcon className="size-4" />,
	research: <LightbulbIcon className="size-4" />,
	other: <CalendarCheckIcon className="size-4" />,
};

export function DailyAffirmation({
	affirmation,
	onLike,
}: {
	affirmation: { id: string; content: string; contentFr?: string | null };
	onLike: (id: string) => void;
}) {
	return (
		<motion.div initial={false} animate={{ opacity: 1, y: 0 }}>
			<Card className="border-primary/20 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent">
				<CardContent className="pt-6">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-4">
							<div className="flex size-12 items-center justify-center rounded-xl bg-primary/20">
								<SparkleIcon className="size-6 text-primary" weight="fill" />
							</div>
							<div>
								<p className="font-medium text-primary text-sm">
									<Trans>Affirmation of the day</Trans>
								</p>
								<p className="mt-1 font-medium text-lg">{affirmation.content || affirmation.contentFr}</p>
							</div>
						</div>
						<Button size="icon" variant="ghost" onClick={() => onLike(affirmation.id)}>
							<HeartIcon className="size-5" />
						</Button>
					</div>
				</CardContent>
			</Card>
		</motion.div>
	);
}

export function OverviewStats({
	dashboardStats,
	goalCompletion,
}: {
	dashboardStats:
		| {
				weeklyGoals: { completed: number; total: number };
				journal: { streak: number; winCount: number };
				skillReadiness: number;
		  }
		| undefined;
	goalCompletion: number;
}) {
	return (
		<div className="grid gap-4 md:grid-cols-4">
			<Card>
				<CardContent className="pt-6">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-muted-foreground text-sm">
								<Trans>Weekly goals</Trans>
							</p>
							<p className="font-bold text-2xl">
								{dashboardStats?.weeklyGoals.completed || 0}/{dashboardStats?.weeklyGoals.total || 0}
							</p>
						</div>
						<div className="flex size-12 items-center justify-center rounded-full bg-blue-500/10">
							<TargetIcon className="size-6 text-blue-500" weight="fill" />
						</div>
					</div>
					<Progress value={goalCompletion} className="mt-3" />
				</CardContent>
			</Card>

			<Card>
				<CardContent className="pt-6">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-muted-foreground text-sm">
								<Trans>Journal series</Trans>
							</p>
							<div className="flex items-center gap-2">
								<p className="font-bold text-2xl">{dashboardStats?.journal.streak || 0}</p>
								<FireIcon className="size-5 text-orange-500" weight="fill" />
							</div>
						</div>
						<div className="flex size-12 items-center justify-center rounded-full bg-orange-500/10">
							<FireIcon className="size-6 text-orange-500" weight="fill" />
						</div>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardContent className="pt-6">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-muted-foreground text-sm">
								<Trans>Victories</Trans>
							</p>
							<p className="font-bold text-2xl">{dashboardStats?.journal.winCount || 0}</p>
						</div>
						<div className="flex size-12 items-center justify-center rounded-full bg-green-500/10">
							<TrophyIcon className="size-6 text-green-500" weight="fill" />
						</div>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardContent className="pt-6">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-muted-foreground text-sm">
								<Trans>Career preparation</Trans>
							</p>
							<p className="font-bold text-2xl">{dashboardStats?.skillReadiness || 0}%</p>
						</div>
						<div className="flex size-12 items-center justify-center rounded-full bg-purple-500/10">
							<RocketIcon className="size-6 text-purple-500" weight="fill" />
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}

export function DashboardTabContent({
	weeklyGoals,
	journalEntries,
	careerPath,
	onShowNewGoalDialog,
	onShowNewEntryDialog,
	updateGoalMutation,
}: {
	weeklyGoals: {
		id: string;
		title: string;
		status: string;
		category: string;
		targetValue?: number | null;
		currentValue?: number | null;
	}[];
	journalEntries: {
		id: string;
		title: string;
		entryType: string;
		entryDate: string;
		mood?: number | null;
		content: string;
		tags?: string[] | null;
	}[];
	careerPath:
		| {
				targetRole: string;
				overallProgress?: number | null;
				milestones?:
					| { id: string; title: string; status: string; description?: string | null; progress: number }[]
					| null;
		  }
		| undefined
		| null;
	onShowNewGoalDialog: () => void;
	onShowNewEntryDialog: () => void;
	updateGoalMutation: UseMutationResult<unknown, Error, { id: string; currentValue?: number; status?: GoalStatus }>;
}) {
	return (
		<div className="space-y-6">
			<div className="grid gap-6 lg:grid-cols-2">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between">
						<div>
							<CardTitle className="flex items-center gap-2">
								<TargetIcon className="size-5" />
								<Trans>Weekly goals</Trans>
							</CardTitle>
							<CardDescription>
								<Trans>Your goals for this week</Trans>
							</CardDescription>
						</div>
						<Button size="sm" onClick={onShowNewGoalDialog}>
							<PlusIcon className="mr-1 size-4" />
							<Trans>Add</Trans>
						</Button>
					</CardHeader>
					<CardContent>
						{weeklyGoals.length === 0 ? (
							<div className="flex flex-col items-center justify-center py-8">
								<TargetIcon className="size-12 text-muted-foreground" />
								<p className="mt-4 text-center text-muted-foreground text-sm">
									<Trans>No goals this week</Trans>
								</p>
								<Button className="mt-4" onClick={onShowNewGoalDialog}>
									<Trans>Create a goal</Trans>
								</Button>
							</div>
						) : (
							<div className="space-y-3">
								{weeklyGoals.slice(0, 5).map((goal) => (
									<div key={goal.id} className="flex items-center justify-between rounded-lg border p-3">
										<div className="flex items-center gap-3">
											<button
												type="button"
												onClick={() =>
													updateGoalMutation.mutate({
														id: goal.id,
														status: goal.status === "completed" ? "pending" : "completed",
													})
												}
												className={cn(
													"flex size-6 items-center justify-center rounded-full border-2 transition-colors",
													goal.status === "completed" ? "border-green-500 bg-green-500" : "border-muted-foreground",
												)}
											>
												{goal.status === "completed" && <CheckCircleIcon className="size-4 text-white" weight="fill" />}
											</button>
											<div>
												<p
													className={cn(
														"font-medium text-sm",
														goal.status === "completed" && "text-muted-foreground line-through",
													)}
												>
													{goal.title}
												</p>
												<div className="flex items-center gap-2">
													<Badge variant="outline" className="text-xs">
														{GOAL_CATEGORIES.find((c) => c.value === goal.category)?.label}
													</Badge>
													{goal.targetValue && goal.targetValue > 1 && (
														<span className="text-muted-foreground text-xs">
															{goal.currentValue || 0}/{goal.targetValue}
														</span>
													)}
												</div>
											</div>
										</div>
									</div>
								))}
							</div>
						)}
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between">
						<div>
							<CardTitle className="flex items-center gap-2">
								<PencilSimpleIcon className="size-5" />
								<Trans>Confidence Journal</Trans>
							</CardTitle>
							<CardDescription>
								<Trans>Your recent entries</Trans>
							</CardDescription>
						</div>
						<Button size="sm" onClick={onShowNewEntryDialog}>
							<PlusIcon className="mr-1 size-4" />
							<Trans>Add</Trans>
						</Button>
					</CardHeader>
					<CardContent>
						{journalEntries.length === 0 ? (
							<div className="flex flex-col items-center justify-center py-8">
								<PencilSimpleIcon className="size-12 text-muted-foreground" />
								<p className="mt-4 text-center text-muted-foreground text-sm">
									<Trans>No journal entries</Trans>
								</p>
								<Button className="mt-4" onClick={onShowNewEntryDialog}>
									<Trans>Add an entry</Trans>
								</Button>
							</div>
						) : (
							<div className="space-y-3">
								{journalEntries.slice(0, 5).map((entry) => {
									const typeConfig = ENTRY_TYPES.find((t) => t.value === entry.entryType);
									return (
										<div key={entry.id} className="rounded-lg border p-3">
											<div className="flex items-start justify-between">
												<div className="flex items-center gap-2">
													<span className="text-lg">{typeConfig?.emoji}</span>
													<div>
														<p className="font-medium text-sm">{entry.title}</p>
														<p className="text-muted-foreground text-xs">
															{new Date(entry.entryDate).toLocaleDateString("fr-FR")}
														</p>
													</div>
												</div>
												{entry.mood && <span className="text-lg">{MOOD_EMOJIS[entry.mood - 1]}</span>}
											</div>
										</div>
									);
								})}
							</div>
						)}
					</CardContent>
				</Card>
			</div>

			{careerPath && (
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<PathIcon className="size-5" />
							<Trans>Path to</Trans>: {careerPath.targetRole}
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="flex items-center gap-4">
							<Progress value={careerPath.overallProgress || 0} className="flex-1" />
							<span className="font-bold text-lg">{careerPath.overallProgress || 0}%</span>
						</div>
						{careerPath.milestones && careerPath.milestones.length > 0 && (
							<div className="mt-4">
								<p className="mb-2 text-muted-foreground text-sm">
									<Trans>Next steps</Trans>:
								</p>
								<div className="flex flex-wrap gap-2">
									{careerPath.milestones
										.filter((m) => m.status !== "completed")
										.slice(0, 3)
										.map((milestone) => (
											<Badge key={milestone.id} variant="outline">
												{milestone.title}
											</Badge>
										))}
								</div>
							</div>
						)}
					</CardContent>
				</Card>
			)}
		</div>
	);
}

export function GoalsTabContent({
	weeklyGoals,
	updateGoalMutation,
	onShowNewGoalDialog,
}: {
	weeklyGoals: { id: string; title: string; status: string; category: string }[];
	updateGoalMutation: UseMutationResult<unknown, Error, { id: string; currentValue?: number; status?: GoalStatus }>;
	onShowNewGoalDialog: () => void;
}) {
	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<h3 className="font-semibold text-lg">
					<Trans>This week's goals</Trans>
				</h3>
				<Button onClick={onShowNewGoalDialog}>
					<PlusIcon className="mr-2 size-4" />
					<Trans>New goal</Trans>
				</Button>
			</div>

			<div className="grid gap-4 md:grid-cols-2">
				{GOAL_CATEGORIES.map((category) => {
					const categoryGoals = weeklyGoals.filter((g) => g.category === category.value);
					return (
						<Card key={category.value}>
							<CardHeader className="pb-2">
								<CardTitle className="flex items-center gap-2 text-base">
									{GOAL_CATEGORY_ICONS[category.value]}
									{category.label}
								</CardTitle>
							</CardHeader>
							<CardContent>
								{categoryGoals.length === 0 ? (
									<p className="text-muted-foreground text-sm">
										<Trans>No goals</Trans>
									</p>
								) : (
									<div className="space-y-2">
										{categoryGoals.map((goal) => (
											<div key={goal.id} className="flex items-center justify-between rounded border p-2">
												<div className="flex items-center gap-2">
													<button
														type="button"
														onClick={() =>
															updateGoalMutation.mutate({
																id: goal.id,
																status: goal.status === "completed" ? "pending" : "completed",
															})
														}
														className={cn(
															"flex size-5 items-center justify-center rounded-full border-2",
															goal.status === "completed" ? "border-green-500 bg-green-500" : "border-muted-foreground",
														)}
													>
														{goal.status === "completed" && (
															<CheckCircleIcon className="size-3 text-white" weight="fill" />
														)}
													</button>
													<span className={cn("text-sm", goal.status === "completed" && "line-through")}>
														{goal.title}
													</span>
												</div>
											</div>
										))}
									</div>
								)}
							</CardContent>
						</Card>
					);
				})}
			</div>
		</div>
	);
}

export function JournalTabContent({
	journalEntries,
	onShowNewEntryDialog,
}: {
	journalEntries: {
		id: string;
		title: string;
		entryType: string;
		entryDate: string;
		mood?: number | null;
		content: string;
		tags?: string[] | null;
	}[];
	onShowNewEntryDialog: () => void;
}) {
	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<h3 className="font-semibold text-lg">
					<Trans>Confidence Journal</Trans>
				</h3>
				<Button onClick={onShowNewEntryDialog}>
					<PlusIcon className="mr-2 size-4" />
					<Trans>New entry</Trans>
				</Button>
			</div>

			<div className="grid gap-4">
				{journalEntries.map((entry) => {
					const typeConfig = ENTRY_TYPES.find((t) => t.value === entry.entryType);
					return (
						<motion.div key={entry.id} initial={false} animate={{ opacity: 1, y: 0 }}>
							<Card>
								<CardContent className="pt-6">
									<div className="flex items-start gap-4">
										<div className={cn("flex size-12 items-center justify-center rounded-xl", typeConfig?.color)}>
											<span className="text-2xl">{typeConfig?.emoji}</span>
										</div>
										<div className="flex-1">
											<div className="flex items-start justify-between">
												<div>
													<h4 className="font-medium">{entry.title}</h4>
													<p className="text-muted-foreground text-xs">
														{new Date(entry.entryDate).toLocaleDateString("fr-FR")}
													</p>
												</div>
												{entry.mood && <span className="text-2xl">{MOOD_EMOJIS[entry.mood - 1]}</span>}
											</div>
											<p className="mt-2 whitespace-pre-wrap text-sm">{entry.content}</p>
											{entry.tags && entry.tags.length > 0 && (
												<div className="mt-2 flex flex-wrap gap-1">
													{entry.tags.map((tag) => (
														<Badge key={tag} variant="outline" className="text-xs">
															{tag}
														</Badge>
													))}
												</div>
											)}
										</div>
									</div>
								</CardContent>
							</Card>
						</motion.div>
					);
				})}
			</div>
		</div>
	);
}

export function PathTabContent({
	careerPath,
	onCreatePath,
}: {
	onCreatePath?: () => void;
	careerPath:
		| {
				targetRole: string;
				currentRole?: string | null;
				overallProgress?: number | null;
				milestones?:
					| { id: string; title: string; status: string; description?: string | null; progress: number }[]
					| null;
		  }
		| undefined
		| null;
}) {
	if (careerPath) {
		return (
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<PathIcon className="size-5" />
						<Trans>My career path</Trans>
					</CardTitle>
					<CardDescription>
						<Trans>From</Trans> {careerPath.currentRole || "Current"} <Trans>to</Trans> {careerPath.targetRole}
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-6">
					<div>
						<div className="mb-2 flex items-center justify-between">
							<span className="font-medium">
								<Trans>Overall progress</Trans>
							</span>
							<span className="font-bold">{careerPath.overallProgress || 0}%</span>
						</div>
						<Progress value={careerPath.overallProgress || 0} className="h-3" />
					</div>

					{careerPath.milestones && careerPath.milestones.length > 0 && (
						<div className="space-y-4">
							<h4 className="font-medium">
								<Trans>Steps</Trans>
							</h4>
							{careerPath.milestones.map((milestone, index) => (
								<div key={milestone.id} className="flex items-start gap-4 rounded-lg border p-4">
									<div
										className={cn(
											"flex size-8 items-center justify-center rounded-full",
											milestone.status === "completed"
												? "bg-green-500"
												: milestone.status === "in_progress"
													? "bg-blue-500"
													: "bg-muted",
										)}
									>
										{milestone.status === "completed" ? (
											<CheckCircleIcon className="size-4 text-white" weight="fill" />
										) : (
											<span className="font-medium text-sm text-white">{index + 1}</span>
										)}
									</div>
									<div className="flex-1">
										<div className="flex items-center justify-between">
											<h5 className="font-medium">{milestone.title}</h5>
											<Badge variant={milestone.status === "completed" ? "default" : "outline"}>
												{milestone.status === "completed"
													? "Completed"
													: milestone.status === "in_progress"
														? "In progress"
														: "To do"}
											</Badge>
										</div>
										{milestone.description && (
											<p className="mt-1 text-muted-foreground text-sm">{milestone.description}</p>
										)}
										<Progress value={milestone.progress} className="mt-2 h-1" />
									</div>
								</div>
							))}
						</div>
					)}
				</CardContent>
			</Card>
		);
	}

	return (
		<Card>
			<CardContent className="flex flex-col items-center justify-center py-12">
				<PathIcon className="size-12 text-muted-foreground" />
				<p className="mt-4 text-center text-muted-foreground">
					<Trans>No career path defined</Trans>
				</p>
				<Button className="mt-4" onClick={onCreatePath}>
					<PlusIcon className="mr-2 size-4" />
					<Trans>Create my path</Trans>
				</Button>
			</CardContent>
		</Card>
	);
}

export function NewGoalDialog({
	open,
	onOpenChange,
	goalCategory,
	setGoalCategory,
	goalTitle,
	setGoalTitle,
	goalDescription,
	setGoalDescription,
	goalTarget,
	setGoalTarget,
	onSubmit,
	isPending,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	goalCategory: GoalCategory;
	setGoalCategory: (v: GoalCategory) => void;
	goalTitle: string;
	setGoalTitle: (v: string) => void;
	goalDescription: string;
	setGoalDescription: (v: string) => void;
	goalTarget: number;
	setGoalTarget: (v: number) => void;
	onSubmit: () => void;
	isPending: boolean;
}) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>
						<Trans>New goal</Trans>
					</DialogTitle>
					<DialogDescription>
						<Trans>Set a goal for this week</Trans>
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-4">
					<div className="space-y-2">
						<Label>
							<Trans>Category</Trans>
						</Label>
						<Select value={goalCategory} onValueChange={(v) => setGoalCategory(v as GoalCategory)}>
							<SelectTrigger>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{GOAL_CATEGORIES.map((cat) => (
									<SelectItem key={cat.value} value={cat.value}>
										<span className="flex items-center gap-2">
											{GOAL_CATEGORY_ICONS[cat.value]}
											{cat.label}
										</span>
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					<div className="space-y-2">
						<Label>
							<Trans>Title</Trans>
						</Label>
						<Input
							value={goalTitle}
							onChange={(e) => setGoalTitle(e.target.value)}
							placeholder={t`E.g.: Apply to 5 job listings`}
						/>
					</div>

					<div className="space-y-2">
						<Label>
							<Trans>Description (optional)</Trans>
						</Label>
						<Textarea
							value={goalDescription}
							onChange={(e) => setGoalDescription(e.target.value)}
							placeholder={t`Additional details...`}
						/>
					</div>

					<div className="space-y-2">
						<Label>
							<Trans>Quantified goal (optional)</Trans>
						</Label>
						<Input type="number" value={goalTarget} onChange={(e) => setGoalTarget(Number(e.target.value))} min={1} />
					</div>
				</div>

				<DialogFooter>
					<Button variant="outline" onClick={() => onOpenChange(false)}>
						<Trans>Cancel</Trans>
					</Button>
					<Button onClick={onSubmit} disabled={!goalTitle || isPending}>
						{isPending ? (
							<SpinnerIcon className="mr-2 size-4 animate-spin" />
						) : (
							<FloppyDiskIcon className="mr-2 size-4" />
						)}
						<Trans>Create</Trans>
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

export function NewEntryDialog({
	open,
	onOpenChange,
	entryType,
	setEntryType,
	entryTitle,
	setEntryTitle,
	entryContent,
	setEntryContent,
	entryMood,
	setEntryMood,
	onSubmit,
	isPending,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	entryType: JournalEntryType;
	setEntryType: (v: JournalEntryType) => void;
	entryTitle: string;
	setEntryTitle: (v: string) => void;
	entryContent: string;
	setEntryContent: (v: string) => void;
	entryMood: number;
	setEntryMood: (v: number) => void;
	onSubmit: () => void;
	isPending: boolean;
}) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>
						<Trans>New entry</Trans>
					</DialogTitle>
					<DialogDescription>
						<Trans>Add an entry to your confidence journal</Trans>
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-4">
					<div className="space-y-2">
						<Label>
							<Trans>Type</Trans>
						</Label>
						<div className="grid grid-cols-4 gap-2">
							{ENTRY_TYPES.map((type) => (
								<button
									key={type.value}
									type="button"
									onClick={() => setEntryType(type.value)}
									className={cn(
										"flex flex-col items-center gap-1 rounded-lg border p-3 transition-colors",
										entryType === type.value ? "border-primary bg-primary/10" : "hover:bg-accent/50",
									)}
								>
									<span className="text-xl">{type.emoji}</span>
									<span className="text-xs">{type.label}</span>
								</button>
							))}
						</div>
					</div>

					<div className="space-y-2">
						<Label>
							<Trans>Title</Trans>
						</Label>
						<Input
							value={entryTitle}
							onChange={(e) => setEntryTitle(e.target.value)}
							placeholder={t`E.g.: I aced my interview!`}
						/>
					</div>

					<div className="space-y-2">
						<Label>
							<Trans>Content</Trans>
						</Label>
						<Textarea
							value={entryContent}
							onChange={(e) => setEntryContent(e.target.value)}
							placeholder={t`Describe your experience...`}
							className="min-h-[100px]"
						/>
					</div>

					<div className="space-y-2">
						<Label>
							<Trans>Mood</Trans>
						</Label>
						<div className="flex justify-around">
							{MOOD_EMOJIS.map((emoji, index) => (
								<button
									key={index}
									type="button"
									onClick={() => setEntryMood(index + 1)}
									className={cn(
										"text-3xl transition-transform",
										entryMood === index + 1 ? "scale-125" : "opacity-50 hover:opacity-100",
									)}
								>
									{emoji}
								</button>
							))}
						</div>
					</div>
				</div>

				<DialogFooter>
					<Button variant="outline" onClick={() => onOpenChange(false)}>
						<Trans>Cancel</Trans>
					</Button>
					<Button onClick={onSubmit} disabled={!entryTitle || !entryContent || isPending}>
						{isPending ? (
							<SpinnerIcon className="mr-2 size-4 animate-spin" />
						) : (
							<FloppyDiskIcon className="mr-2 size-4" />
						)}
						<Trans>Add</Trans>
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

export function NewCareerPathDialog({
	open,
	onOpenChange,
	currentRole,
	setCurrentRole,
	targetRole,
	setTargetRole,
	onSubmit,
	isPending,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	currentRole: string;
	setCurrentRole: (v: string) => void;
	targetRole: string;
	setTargetRole: (v: string) => void;
	onSubmit: () => void;
	isPending: boolean;
}) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>
						<Trans>New career path</Trans>
					</DialogTitle>
					<DialogDescription>
						<Trans>Define your career goal to create a personalized path.</Trans>
					</DialogDescription>
				</DialogHeader>
				<div className="space-y-4 py-4">
					<div className="space-y-2">
						<Label>
							<Trans>Current role</Trans>
						</Label>
						<Input
							value={currentRole}
							onChange={(e) => setCurrentRole(e.target.value)}
							placeholder={t`E.g.: Student, Technician...`}
						/>
					</div>
					<div className="space-y-2">
						<Label>
							<Trans>Target role</Trans> *
						</Label>
						<Input
							value={targetRole}
							onChange={(e) => setTargetRole(e.target.value)}
							placeholder={t`E.g.: DevOps Engineer, Project Manager...`}
						/>
					</div>
				</div>
				<DialogFooter>
					<Button disabled={!targetRole.trim() || isPending} onClick={onSubmit}>
						{isPending ? <SpinnerIcon className="mr-2 size-4 animate-spin" /> : <RocketIcon className="mr-2 size-4" />}
						<Trans>Create path</Trans>
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
