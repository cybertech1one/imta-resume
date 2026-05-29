import { Trans } from "@lingui/react/macro";
import {
	ArrowRightIcon,
	CheckCircleIcon,
	ClockIcon,
	LightbulbIcon,
	ListChecksIcon,
	PathIcon,
	PlayIcon,
	SparkleIcon,
	SpinnerIcon,
	TrashIcon,
	TrophyIcon,
} from "@phosphor-icons/react";
import { motion } from "motion/react";
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
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/utils/style";
import type { TargetRole } from "./gap-analysis-types";

// ─── Learning Path Type ──────────────────────────────────────────────────────────

interface LearningPath {
	id: string;
	title: string;
	titleFr?: string | null;
	description?: string | null;
	descriptionFr?: string | null;
	aiGenerated?: boolean | null;
	progress?: number | null;
	status: string | null;
	priority?: string | null;
	estimatedDuration?: string | null;
	skills?: unknown[] | null;
	milestones?: { id: string; title: string; titleFr?: string; completed?: boolean }[] | null;
	aiAnalysis?: string | null;
}

// ─── Learning Paths Tab ─────────────────────────────────────────────────────────

interface LearningPathsContentProps {
	selectedRole: TargetRole | undefined;
	learningPaths: LearningPath[] | undefined;
	learningPathsLoading: boolean;
	weeklyHours: number;
	onWeeklyHoursChange: (hours: number) => void;
	onGenerateLearningPath: () => void;
	isGeneratingPath: boolean;
	onStartLearningPath: (pathId: string) => void;
	onCompleteMilestone: (pathId: string, milestoneId: string) => void;
	onDeleteLearningPath: (pathId: string) => void;
}

export function LearningPathsContent({
	selectedRole,
	learningPaths,
	learningPathsLoading,
	weeklyHours,
	onWeeklyHoursChange,
	onGenerateLearningPath,
	isGeneratingPath,
	onStartLearningPath,
	onCompleteMilestone,
	onDeleteLearningPath,
}: LearningPathsContentProps) {
	return (
		<>
			{/* Generate Learning Path Card */}
			{selectedRole && (
				<Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-transparent">
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<SparkleIcon className="size-5 text-primary" weight="fill" />
							<Trans>Generate an AI Learning Path</Trans>
						</CardTitle>
						<CardDescription>
							<Trans>
								Our AI will analyze your skill gaps and generate a personalized learning path to reach your target role:{" "}
								{selectedRole.name}
							</Trans>
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="flex flex-wrap items-center gap-4">
							<div className="flex items-center gap-2">
								<label className="text-muted-foreground text-sm">
									<Trans>Available hours per week:</Trans>
								</label>
								<Select value={weeklyHours.toString()} onValueChange={(v) => onWeeklyHoursChange(Number(v))}>
									<SelectTrigger className="w-24">
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="5">5h</SelectItem>
										<SelectItem value="10">10h</SelectItem>
										<SelectItem value="15">15h</SelectItem>
										<SelectItem value="20">20h</SelectItem>
										<SelectItem value="30">30h</SelectItem>
									</SelectContent>
								</Select>
							</div>
							<Button className="gap-2" onClick={onGenerateLearningPath} disabled={isGeneratingPath}>
								{isGeneratingPath ? (
									<>
										<SpinnerIcon className="size-4 animate-spin" />
										<Trans>Generating...</Trans>
									</>
								) : (
									<>
										<SparkleIcon className="size-4" weight="fill" />
										<Trans>Generate a Path</Trans>
									</>
								)}
							</Button>
						</div>
					</CardContent>
				</Card>
			)}

			{!selectedRole && (
				<Card className="border-dashed">
					<CardContent className="flex flex-col items-center py-12 text-center">
						<PathIcon className="mb-4 size-12 text-muted-foreground/50" />
						<h3 className="mb-2 font-medium text-lg">
							<Trans>Select a Target Role</Trans>
						</h3>
						<p className="max-w-sm text-muted-foreground">
							<Trans>Go to the Overview tab to select a role before generating a path.</Trans>
						</p>
					</CardContent>
				</Card>
			)}

			{/* Existing Learning Paths */}
			{learningPathsLoading ? (
				<div className="flex items-center justify-center py-12">
					<div className="flex flex-col items-center gap-4">
						<SpinnerIcon className="size-8 animate-spin text-primary" />
						<p className="text-muted-foreground">
							<Trans>Loading paths...</Trans>
						</p>
					</div>
				</div>
			) : learningPaths && learningPaths.length > 0 ? (
				<div className="space-y-6">
					<div className="flex items-center justify-between">
						<h3 className="font-semibold text-lg">
							<Trans>Your Learning Paths</Trans>
						</h3>
						<Badge variant="secondary">{learningPaths.length} paths</Badge>
					</div>

					<div className="grid gap-6 md:grid-cols-2">
						{learningPaths.map((path, index) => (
							<motion.div
								key={path.id}
								initial={false}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: index * 0.1 }}
							>
								<Card className="h-full">
									<CardHeader>
										<div className="flex items-start justify-between">
											<div className="space-y-1">
												<CardTitle className="flex items-center gap-2">
													{path.aiGenerated && <SparkleIcon className="size-4 text-primary" weight="fill" />}
													{path.title || path.titleFr}
												</CardTitle>
												<CardDescription>{path.description || path.descriptionFr}</CardDescription>
											</div>
											<AlertDialog>
												<AlertDialogTrigger asChild>
													<Button variant="ghost" size="icon" className="size-8">
														<TrashIcon className="size-4 text-destructive" />
													</Button>
												</AlertDialogTrigger>
												<AlertDialogContent>
													<AlertDialogHeader>
														<AlertDialogTitle>
															<Trans>Delete this path?</Trans>
														</AlertDialogTitle>
														<AlertDialogDescription>
															<Trans>This action is irreversible. The path will be permanently deleted.</Trans>
														</AlertDialogDescription>
													</AlertDialogHeader>
													<AlertDialogFooter>
														<AlertDialogCancel>
															<Trans>Cancel</Trans>
														</AlertDialogCancel>
														<AlertDialogAction onClick={() => onDeleteLearningPath(path.id)}>
															<Trans>Delete</Trans>
														</AlertDialogAction>
													</AlertDialogFooter>
												</AlertDialogContent>
											</AlertDialog>
										</div>
									</CardHeader>
									<CardContent className="space-y-4">
										{/* Progress */}
										<div>
											<div className="mb-2 flex items-center justify-between text-sm">
												<span className="text-muted-foreground">
													<Trans>Progress</Trans>
												</span>
												<span className="font-medium">{path.progress ?? 0}%</span>
											</div>
											<Progress value={path.progress ?? 0} className="h-2" />
										</div>

										{/* Status Badge */}
										<div className="flex items-center gap-2">
											<Badge
												className={cn(
													path.status === "not_started" && "bg-gray-500",
													path.status === "in_progress" && "bg-blue-500",
													path.status === "completed" && "bg-green-500",
												)}
											>
												{path.status === "not_started" && "Not started"}
												{path.status === "in_progress" && "In progress"}
												{path.status === "completed" && "Completed"}
											</Badge>
											{path.priority && (
												<Badge
													variant="outline"
													className={cn(
														path.priority === "critical" && "border-red-500 text-red-500",
														path.priority === "high" && "border-amber-500 text-amber-500",
														path.priority === "medium" && "border-blue-500 text-blue-500",
														path.priority === "low" && "border-gray-500 text-gray-500",
													)}
												>
													{path.priority === "critical" && "Critical"}
													{path.priority === "high" && "High"}
													{path.priority === "medium" && "Medium"}
													{path.priority === "low" && "Low"}
												</Badge>
											)}
										</div>

										{/* Duration */}
										{path.estimatedDuration && (
											<div className="flex items-center gap-2 text-muted-foreground text-sm">
												<ClockIcon className="size-4" />
												<span>{path.estimatedDuration}</span>
											</div>
										)}

										{/* Skills Count */}
										{path.skills && Array.isArray(path.skills) && path.skills.length > 0 && (
											<div className="flex items-center gap-2 text-muted-foreground text-sm">
												<ListChecksIcon className="size-4" />
												<span>{path.skills.length} skill(s) to develop</span>
											</div>
										)}

										{/* Milestones Preview */}
										{path.milestones && Array.isArray(path.milestones) && path.milestones.length > 0 && (
											<div className="space-y-2">
												<p className="font-medium text-sm">
													<Trans>
														Milestones ({path.milestones.filter((m: { completed?: boolean }) => m.completed).length}/
														{path.milestones.length})
													</Trans>
												</p>
												<div className="space-y-1">
													{path.milestones
														.slice(0, 3)
														.map((milestone: { id: string; title: string; titleFr?: string; completed?: boolean }) => (
															<div key={milestone.id} className="flex items-center gap-2 text-sm">
																{milestone.completed ? (
																	<CheckCircleIcon className="size-4 text-green-500" weight="fill" />
																) : (
																	<div className="size-4 rounded-full border-2 border-muted-foreground/30" />
																)}
																<span className={cn(milestone.completed && "text-muted-foreground line-through")}>
																	{milestone.title || milestone.titleFr}
																</span>
																{!milestone.completed && (
																	<Button
																		variant="ghost"
																		size="icon"
																		className="ml-auto size-6"
																		onClick={() => onCompleteMilestone(path.id, milestone.id)}
																	>
																		<CheckCircleIcon className="size-4" />
																	</Button>
																)}
															</div>
														))}
													{path.milestones.length > 3 && (
														<p className="text-muted-foreground text-xs">
															+{path.milestones.length - 3} more milestone(s)
														</p>
													)}
												</div>
											</div>
										)}
									</CardContent>
									<CardFooter>
										{path.status === "not_started" ? (
											<Button className="w-full gap-2" onClick={() => onStartLearningPath(path.id)}>
												<PlayIcon className="size-4" />
												<Trans>Start</Trans>
											</Button>
										) : path.status === "in_progress" ? (
											<Button variant="outline" className="w-full gap-2">
												<ArrowRightIcon className="size-4" />
												<Trans>Continue</Trans>
											</Button>
										) : (
											<Button variant="secondary" className="w-full gap-2" disabled>
												<TrophyIcon className="size-4" />
												<Trans>Completed</Trans>
											</Button>
										)}
									</CardFooter>
								</Card>
							</motion.div>
						))}
					</div>
				</div>
			) : selectedRole ? (
				<Card className="border-dashed">
					<CardContent className="flex flex-col items-center py-12 text-center">
						<PathIcon className="mb-4 size-12 text-muted-foreground/50" />
						<h3 className="mb-2 font-medium text-lg">
							<Trans>No Learning Paths</Trans>
						</h3>
						<p className="mb-4 max-w-sm text-muted-foreground">
							<Trans>
								You don't have any learning paths yet. Generate one with AI to start developing your skills.
							</Trans>
						</p>
						<Button className="gap-2" onClick={onGenerateLearningPath} disabled={isGeneratingPath}>
							{isGeneratingPath ? (
								<>
									<SpinnerIcon className="size-4 animate-spin" />
									<Trans>Generating...</Trans>
								</>
							) : (
								<>
									<SparkleIcon className="size-4" weight="fill" />
									<Trans>Generate AI Path</Trans>
								</>
							)}
						</Button>
					</CardContent>
				</Card>
			) : null}

			{/* AI Analysis Section */}
			{learningPaths?.some((p) => p.aiAnalysis) && (
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<LightbulbIcon className="size-5 text-amber-500" weight="fill" />
							<Trans>AI Recommendations</Trans>
						</CardTitle>
						<CardDescription>
							<Trans>Personalized advice generated by artificial intelligence</Trans>
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="prose prose-sm dark:prose-invert max-w-none">
							{learningPaths
								.filter((p) => p.aiAnalysis)
								.slice(0, 1)
								.map((p) => (
									<p key={p.id} className="whitespace-pre-wrap text-muted-foreground">
										{p.aiAnalysis}
									</p>
								))}
						</div>
					</CardContent>
				</Card>
			)}
		</>
	);
}
