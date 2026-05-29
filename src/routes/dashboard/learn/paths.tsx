import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import {
	CheckCircleIcon,
	ClockIcon,
	LockSimpleIcon,
	PathIcon,
	PlayIcon,
	PlusIcon,
	SparkleIcon,
	WarningCircleIcon,
} from "@phosphor-icons/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";
import { lazy, Suspense, useState } from "react";
import { toast } from "sonner";
import { ErrorComponent } from "@/components/error-component";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { authClient } from "@/integrations/auth/client";
import { orpc } from "@/integrations/orpc/client";
import { DashboardHeader } from "../-components/header";

const LearningPathsLazy = lazy(() => Promise.resolve({ default: LearningPaths }));

// biome-ignore lint/suspicious/noExplicitAny: Route path not in generated route tree
export const Route = createFileRoute("/dashboard/learn/paths" as any)({
	component: () => (
		<Suspense
			fallback={
				<div className="flex items-center justify-center p-8">
					<Trans>Loading learning paths...</Trans>
				</div>
			}
		>
			<LearningPathsLazy />
		</Suspense>
	),
	errorComponent: ErrorComponent,
});

type PathStatus = "not_started" | "in_progress" | "paused" | "completed" | "abandoned";
type SkillLevel = "novice" | "beginner" | "intermediate" | "advanced" | "expert";

const STATUS_LABELS: Record<PathStatus, string> = {
	not_started: t`Not Started`,
	in_progress: t`In Progress`,
	paused: t`Paused`,
	completed: t`Completed`,
	abandoned: t`Abandoned`,
};

const STATUS_VARIANTS: Record<PathStatus, "default" | "secondary" | "outline" | "destructive"> = {
	in_progress: "default",
	completed: "secondary",
	not_started: "outline",
	paused: "outline",
	abandoned: "destructive",
};

const MILESTONE_STATUS_ICONS: Record<string, typeof CheckCircleIcon> = {
	completed: CheckCircleIcon,
	in_progress: PlayIcon,
	unlocked: PlayIcon,
	locked: LockSimpleIcon,
	skipped: CheckCircleIcon,
};

function LoadingSkeleton() {
	return (
		<div className="space-y-4">
			{["sk-path-1", "sk-path-2", "sk-path-3"].map((k) => (
				<Skeleton key={k} className="h-40 rounded-xl" />
			))}
		</div>
	);
}

interface LearningPath {
	id: string;
	title: string;
	titleFr?: string | null;
	description?: string | null;
	field: string;
	targetRole?: string | null;
	status: PathStatus;
	completionPercentage?: number;
	totalModules?: number;
	completedModules?: number;
	estimatedHours?: number | null;
	targetLevel?: SkillLevel | null;
	isPrimary?: boolean;
	isActive?: boolean;
}

interface Milestone {
	id: string;
	title: string;
	order: number;
	status: string;
	progress?: number;
	xpReward?: number | null;
}

function MilestoneList({ pathId }: { pathId: string }) {
	const { data: session } = authClient.useSession();

	const { data: milestones = [], isLoading } = useQuery({
		queryKey: ["adaptiveLearning", "milestones", pathId],
		queryFn: () => orpc.adaptiveLearning.milestones.listByPath.call({ pathId }),
		enabled: !!session?.user,
	});

	if (isLoading) {
		return (
			<div className="space-y-2 pt-2">
				{["sk-ms-1", "sk-ms-2", "sk-ms-3"].map((k) => (
					<Skeleton key={k} className="h-8 rounded-md" />
				))}
			</div>
		);
	}

	if (milestones.length === 0) {
		return (
			<p className="pt-2 text-muted-foreground text-xs">
				<Trans>No milestones defined for this path.</Trans>
			</p>
		);
	}

	return (
		<div className="space-y-1 pt-2">
			{(milestones as Milestone[]).map((milestone) => {
				const StatusIcon = MILESTONE_STATUS_ICONS[milestone.status] ?? LockSimpleIcon;
				const isDone = milestone.status === "completed";
				return (
					<div key={milestone.id} className="flex items-center gap-2 rounded px-2 py-1.5 text-sm">
						<StatusIcon className={`size-4 shrink-0 ${isDone ? "text-emerald-500" : "text-muted-foreground"}`} />
						<span className={`flex-1 truncate text-xs ${isDone ? "text-muted-foreground line-through" : ""}`}>
							{milestone.title}
						</span>
						{milestone.xpReward && <span className="text-amber-500 text-xs">+{milestone.xpReward} XP</span>}
					</div>
				);
			})}
		</div>
	);
}

function PathCard({
	path,
	onStart,
	isStarting,
}: {
	path: LearningPath;
	onStart: (id: string) => void;
	isStarting: boolean;
}) {
	const [expanded, setExpanded] = useState(false);

	return (
		<motion.div
			initial={false}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
		>
			<Card className={path.isPrimary ? "border-primary/40 shadow-sm" : ""}>
				<CardContent className="pt-5">
					<div className="flex flex-col gap-4 sm:flex-row sm:items-start">
						<div className="min-w-0 flex-1 space-y-2">
							<div className="flex flex-wrap items-center gap-2">
								<h3 className="font-semibold text-sm leading-tight">{path.title}</h3>
								{path.isPrimary && (
									<Badge variant="default" className="text-xs">
										<Trans>Primary</Trans>
									</Badge>
								)}
								<Badge variant={STATUS_VARIANTS[path.status]}>{STATUS_LABELS[path.status]}</Badge>
							</div>

							{path.description && <p className="line-clamp-2 text-muted-foreground text-xs">{path.description}</p>}

							<div className="flex flex-wrap gap-3 text-muted-foreground text-xs">
								{path.field && (
									<span className="flex items-center gap-1">
										<PathIcon className="size-3" />
										<span className="capitalize">{path.field}</span>
									</span>
								)}
								{path.estimatedHours != null && (
									<span className="flex items-center gap-1">
										<ClockIcon className="size-3" />
										{path.estimatedHours}h
									</span>
								)}
								{path.targetLevel && (
									<span className="flex items-center gap-1 capitalize">
										<SparkleIcon className="size-3" />
										{path.targetLevel}
									</span>
								)}
							</div>

							{/* Progress bar */}
							<div className="space-y-1">
								<div className="flex justify-between text-muted-foreground text-xs">
									<span>
										<Trans>Progress</Trans>
									</span>
									<span>
										{path.completedModules ?? 0}/{path.totalModules ?? "?"} <Trans>modules</Trans> &bull;{" "}
										{path.completionPercentage ?? 0}%
									</span>
								</div>
								<Progress value={path.completionPercentage ?? 0} className="h-2" />
							</div>
						</div>

						<div className="flex shrink-0 flex-col gap-2 sm:items-end">
							{path.status === "not_started" && (
								<Button size="sm" onClick={() => onStart(path.id)} disabled={isStarting} className="gap-2">
									<PlayIcon className="size-4" />
									<Trans>Start</Trans>
								</Button>
							)}
							<Button size="sm" variant="ghost" onClick={() => setExpanded((v) => !v)} className="text-xs">
								{expanded ? <Trans>Hide Milestones</Trans> : <Trans>Show Milestones</Trans>}
							</Button>
						</div>
					</div>

					{expanded && <MilestoneList pathId={path.id} />}
				</CardContent>
			</Card>
		</motion.div>
	);
}

function GeneratePathDialog({
	open,
	onOpenChange,
	onGenerate,
	isGenerating,
}: {
	open: boolean;
	onOpenChange: (v: boolean) => void;
	onGenerate: (data: { field: string; targetRole: string; targetLevel: SkillLevel }) => void;
	isGenerating: boolean;
}) {
	const [field, setField] = useState("");
	const [targetRole, setTargetRole] = useState("");
	const [targetLevel, setTargetLevel] = useState<SkillLevel>("intermediate");

	const handleSubmit = () => {
		if (!field.trim() || !targetRole.trim()) {
			toast.error(t`Please fill in all required fields`);
			return;
		}
		onGenerate({ field: field.trim(), targetRole: targetRole.trim(), targetLevel });
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<SparkleIcon className="size-5 text-amber-500" />
						<Trans>Generate AI Learning Path</Trans>
					</DialogTitle>
				</DialogHeader>

				<div className="space-y-4">
					<div className="space-y-1.5">
						<Label htmlFor="field">
							<Trans>Field / Domain</Trans>
						</Label>
						<Input
							id="field"
							placeholder={t`e.g. healthcare, industrial engineering`}
							value={field}
							onChange={(e) => setField(e.target.value)}
						/>
					</div>

					<div className="space-y-1.5">
						<Label htmlFor="targetRole">
							<Trans>Target Role</Trans>
						</Label>
						<Input
							id="targetRole"
							placeholder={t`e.g. Safety Engineer, Project Manager`}
							value={targetRole}
							onChange={(e) => setTargetRole(e.target.value)}
						/>
					</div>

					<div className="space-y-1.5">
						<Label htmlFor="level">
							<Trans>Target Level</Trans>
						</Label>
						<Select value={targetLevel} onValueChange={(v) => setTargetLevel(v as SkillLevel)}>
							<SelectTrigger id="level">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{(["novice", "beginner", "intermediate", "advanced", "expert"] as SkillLevel[]).map((level) => (
									<SelectItem key={level} value={level} className="capitalize">
										{level}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				</div>

				<DialogFooter>
					<Button variant="outline" onClick={() => onOpenChange(false)}>
						<Trans>Cancel</Trans>
					</Button>
					<Button onClick={handleSubmit} disabled={isGenerating} className="gap-2">
						<SparkleIcon className="size-4" />
						{isGenerating ? <Trans>Generating...</Trans> : <Trans>Generate Path</Trans>}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

function LearningPaths() {
	const { data: session } = authClient.useSession();
	const queryClient = useQueryClient();
	const [activeTab, setActiveTab] = useState<"all" | PathStatus>("all");
	const [generateOpen, setGenerateOpen] = useState(false);

	const {
		data: paths = [],
		isLoading,
		error,
	} = useQuery({
		queryKey: ["adaptiveLearning", "paths", "all"],
		queryFn: () => orpc.adaptiveLearning.paths.list.call({}),
		enabled: !!session?.user,
	});

	const startMutation = useMutation({
		mutationFn: (input: { id: string }) => orpc.adaptiveLearning.paths.start.call(input),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["adaptiveLearning"] });
			toast.success(t`Learning path started!`);
		},
		onError: (err: Error) => {
			toast.error(err.message || t`Failed to start path`);
		},
	});

	const generateMutation = useMutation({
		mutationFn: (input: { field: string; targetRole: string; targetLevel: SkillLevel }) =>
			orpc.adaptiveLearning.paths.generate.call(input),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["adaptiveLearning"] });
			toast.success(t`Learning path generated successfully!`);
			setGenerateOpen(false);
		},
		onError: (err: Error) => {
			toast.error(err.message || t`Failed to generate learning path`);
		},
	});

	const typedPaths = paths as LearningPath[];

	const filteredPaths = activeTab === "all" ? typedPaths : typedPaths.filter((p) => p.status === activeTab);

	const tabs: Array<{ value: "all" | PathStatus; label: string }> = [
		{ value: "all", label: t`All` },
		{ value: "in_progress", label: t`In Progress` },
		{ value: "completed", label: t`Completed` },
		{ value: "not_started", label: t`Not Started` },
		{ value: "paused", label: t`Paused` },
	];

	if (isLoading) {
		return (
			<>
				<DashboardHeader icon={PathIcon} title={t`Learning Paths`} />
				<LoadingSkeleton />
			</>
		);
	}

	if (error) {
		return (
			<>
				<DashboardHeader icon={PathIcon} title={t`Learning Paths`} />
				<Card className="border-destructive">
					<CardContent className="flex flex-col items-center py-12 text-center">
						<WarningCircleIcon className="mb-4 size-12 text-destructive" />
						<h3 className="mb-2 font-medium text-lg">
							<Trans>Error loading learning paths</Trans>
						</h3>
						<p className="text-muted-foreground text-sm">
							<Trans>Please try again later.</Trans>
						</p>
					</CardContent>
				</Card>
			</>
		);
	}

	return (
		<>
			<DashboardHeader icon={PathIcon} title={t`Learning Paths`} />

			<GeneratePathDialog
				open={generateOpen}
				onOpenChange={setGenerateOpen}
				onGenerate={(data) => generateMutation.mutate(data)}
				isGenerating={generateMutation.isPending}
			/>

			<div className="mb-6 flex items-center justify-between gap-4">
				<div>
					<p className="text-muted-foreground text-sm">
						<Trans>{typedPaths.length} paths total</Trans>
					</p>
				</div>
				<Button onClick={() => setGenerateOpen(true)} disabled={generateMutation.isPending} className="gap-2">
					<PlusIcon className="size-4" />
					<SparkleIcon className="size-4" />
					<Trans>Generate New Path</Trans>
				</Button>
			</div>

			<Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "all" | PathStatus)} className="space-y-6">
				<TabsList className="flex h-auto flex-wrap gap-2 bg-transparent p-0">
					{tabs.map((tab) => {
						const count =
							tab.value === "all" ? typedPaths.length : typedPaths.filter((p) => p.status === tab.value).length;
						return (
							<TabsTrigger
								key={tab.value}
								value={tab.value}
								className="gap-2 rounded-full border border-transparent bg-muted/50 px-5 py-2 data-[state=active]:border-primary/30 data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
							>
								{tab.label}
								{count > 0 && <span className="ml-1 rounded-full bg-muted px-1.5 text-xs tabular-nums">{count}</span>}
							</TabsTrigger>
						);
					})}
				</TabsList>

				{tabs.map((tab) => (
					<TabsContent key={tab.value} value={tab.value} className="space-y-4">
						{filteredPaths.length === 0 ? (
							<Card>
								<CardContent className="flex flex-col items-center py-12 text-center">
									<PathIcon className="mb-3 size-10 text-muted-foreground/40" />
									<p className="font-medium text-sm">
										{tab.value === "all" ? (
											<Trans>No learning paths yet</Trans>
										) : (
											<Trans>No paths with this status</Trans>
										)}
									</p>
									<p className="text-muted-foreground text-xs">
										{tab.value === "all" ? (
											<Trans>Generate your first AI-powered learning path to get started.</Trans>
										) : (
											<Trans>Try a different filter or generate a new path.</Trans>
										)}
									</p>
									{tab.value === "all" && (
										<Button size="sm" className="mt-4 gap-2" onClick={() => setGenerateOpen(true)}>
											<SparkleIcon className="size-4" />
											<Trans>Generate Path</Trans>
										</Button>
									)}
								</CardContent>
							</Card>
						) : (
							filteredPaths.map((path) => (
								<PathCard
									key={path.id}
									path={path}
									onStart={(id) => startMutation.mutate({ id })}
									isStarting={startMutation.isPending}
								/>
							))
						)}
					</TabsContent>
				))}
			</Tabs>
		</>
	);
}
