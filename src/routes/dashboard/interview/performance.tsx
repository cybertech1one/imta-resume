import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import {
	CaretDownIcon,
	CaretUpIcon,
	ChartBarIcon,
	LightbulbIcon,
	PlusIcon,
	SpinnerIcon,
	TargetIcon,
} from "@phosphor-icons/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { ErrorComponent } from "@/components/error-component";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { authClient } from "@/integrations/auth/client";
import { orpc } from "@/integrations/orpc/client";
import { DashboardHeader } from "../-components/header";
import { GoalsTab, HeroSection, LoadingSkeleton, OverviewTab, TipsTab } from "./-components/performance-components";

// biome-ignore lint/suspicious/noExplicitAny: Route path not in generated route tree
export const Route = createFileRoute("/dashboard/interview/performance" as any)({
	component: InterviewPerformance,
	errorComponent: ErrorComponent,
});

function InterviewPerformance() {
	const queryClient = useQueryClient();
	const { data: session } = authClient.useSession();
	const [activeTab, setActiveTab] = useState("overview");
	const [isAddGoalOpen, setIsAddGoalOpen] = useState(false);
	const [newGoal, setNewGoal] = useState({
		targetRole: "",
		targetCompany: "",
		interviewDate: "",
		targetPracticeCount: 10,
		notes: "",
	});

	const { data: summary, isLoading } = useQuery({
		...orpc.interviewTracking.ai.getSummary.queryOptions(),
		enabled: !!session?.user,
	});

	const { data: goals, isLoading: isLoadingGoals } = useQuery({
		...orpc.interviewTracking.goals.list.queryOptions({ completed: false }),
		enabled: !!session?.user,
	});

	const { data: completedGoals } = useQuery({
		...orpc.interviewTracking.goals.list.queryOptions({ completed: true, limit: 5 }),
		enabled: !!session?.user,
	});

	const { data: tips } = useQuery({ ...orpc.interviewTracking.ai.getTips.queryOptions(), enabled: !!session?.user });

	const createGoalMutation = useMutation(
		orpc.interviewTracking.goals.create.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries({ queryKey: ["interviewTracking"] });
				setIsAddGoalOpen(false);
				setNewGoal({
					targetRole: "",
					targetCompany: "",
					interviewDate: "",
					targetPracticeCount: 10,
					notes: "",
				});
				toast.success(t`Goal created successfully`);
			},
			onError: () => {
				toast.error(t`Error creating goal`);
			},
		}),
	);

	const incrementPracticeMutation = useMutation(
		orpc.interviewTracking.goals.incrementPractice.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries({ queryKey: ["interviewTracking"] });
				toast.success(t`Practice recorded!`);
			},
		}),
	);

	const updateGoalMutation = useMutation(
		orpc.interviewTracking.goals.update.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries({ queryKey: ["interviewTracking"] });
				toast.success(t`Goal updated`);
			},
		}),
	);

	const handleCreateGoal = useCallback(() => {
		createGoalMutation.mutate({
			targetRole: newGoal.targetRole || undefined,
			targetCompany: newGoal.targetCompany || undefined,
			interviewDate: newGoal.interviewDate ? new Date(newGoal.interviewDate) : undefined,
			targetPracticeCount: newGoal.targetPracticeCount,
			notes: newGoal.notes || undefined,
		});
	}, [newGoal, createGoalMutation]);

	const handlePractice = useCallback(
		(goalId: string) => {
			incrementPracticeMutation.mutate({ id: goalId });
		},
		[incrementPracticeMutation],
	);

	const handleCompleteGoal = useCallback(
		(goalId: string) => {
			updateGoalMutation.mutate({ id: goalId, completed: true });
		},
		[updateGoalMutation],
	);

	const stats = summary?.statistics;
	const scoreBreakdown = summary?.scoreBreakdown ?? {
		confidence: 0,
		clarity: 0,
		relevance: 0,
		technical: 0,
		communication: 0,
	};
	const trends = summary?.trends ?? [];
	const strengths = summary?.strengths ?? [];
	const improvements = summary?.improvements ?? [];
	const recommendations = tips ?? [];

	const trendDirection = stats?.recentTrend ?? "stable";
	const trendIcon =
		trendDirection === "improving" ? CaretUpIcon : trendDirection === "declining" ? CaretDownIcon : null;
	const trendColor =
		trendDirection === "improving"
			? "text-green-600"
			: trendDirection === "declining"
				? "text-red-600"
				: "text-muted-foreground";

	if (isLoading) {
		return (
			<>
				<DashboardHeader icon={ChartBarIcon} title={t`Interview Performance`} />
				<LoadingSkeleton />
			</>
		);
	}

	return (
		<>
			<DashboardHeader icon={ChartBarIcon} title={t`Interview Performance`} />

			<HeroSection stats={stats} trendDirection={trendDirection} trendIcon={trendIcon} trendColor={trendColor} />

			<Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
				<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
					<TabsList>
						<TabsTrigger value="overview">
							<ChartBarIcon className="mr-2 size-4" />
							<Trans>Overview</Trans>
						</TabsTrigger>
						<TabsTrigger value="goals">
							<TargetIcon className="mr-2 size-4" />
							<Trans>Goals</Trans>
						</TabsTrigger>
						<TabsTrigger value="tips">
							<LightbulbIcon className="mr-2 size-4" />
							<Trans>AI Tips</Trans>
						</TabsTrigger>
					</TabsList>

					<Dialog open={isAddGoalOpen} onOpenChange={setIsAddGoalOpen}>
						<DialogTrigger asChild>
							<Button>
								<PlusIcon className="mr-2 size-4" />
								<Trans>New goal</Trans>
							</Button>
						</DialogTrigger>
						<DialogContent>
							<DialogHeader>
								<DialogTitle>
									<Trans>Create an interview goal</Trans>
								</DialogTitle>
								<DialogDescription>
									<Trans>Set your next interview goal to track your preparation.</Trans>
								</DialogDescription>
							</DialogHeader>
							<div className="grid gap-4 py-4">
								<div className="grid gap-2">
									<Label>
										<Trans>Target position</Trans>
									</Label>
									<Input
										placeholder={t`Ex: Full Stack Developer`}
										value={newGoal.targetRole}
										onChange={(e) => setNewGoal((prev) => ({ ...prev, targetRole: e.target.value }))}
									/>
								</div>
								<div className="grid gap-2">
									<Label>
										<Trans>Company</Trans>
									</Label>
									<Input
										placeholder={t`Ex: Google`}
										value={newGoal.targetCompany}
										onChange={(e) => setNewGoal((prev) => ({ ...prev, targetCompany: e.target.value }))}
									/>
								</div>
								<div className="grid gap-2">
									<Label>
										<Trans>Interview date</Trans>
									</Label>
									<Input
										type="date"
										value={newGoal.interviewDate}
										onChange={(e) => setNewGoal((prev) => ({ ...prev, interviewDate: e.target.value }))}
									/>
								</div>
								<div className="grid gap-2">
									<Label>
										<Trans>Target practice count</Trans>
									</Label>
									<Select
										value={String(newGoal.targetPracticeCount)}
										onValueChange={(v) => setNewGoal((prev) => ({ ...prev, targetPracticeCount: Number(v) }))}
									>
										<SelectTrigger>
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="5">5 practices</SelectItem>
											<SelectItem value="10">10 practices</SelectItem>
											<SelectItem value="15">15 practices</SelectItem>
											<SelectItem value="20">20 practices</SelectItem>
										</SelectContent>
									</Select>
								</div>
								<div className="grid gap-2">
									<Label>
										<Trans>Notes</Trans>
									</Label>
									<Textarea
										placeholder={t`Interview notes...`}
										value={newGoal.notes}
										onChange={(e) => setNewGoal((prev) => ({ ...prev, notes: e.target.value }))}
									/>
								</div>
							</div>
							<DialogFooter>
								<Button variant="outline" onClick={() => setIsAddGoalOpen(false)}>
									<Trans>Cancel</Trans>
								</Button>
								<Button onClick={handleCreateGoal} disabled={createGoalMutation.isPending}>
									{createGoalMutation.isPending && <SpinnerIcon className="mr-2 size-4 animate-spin" />}
									<Trans>Create</Trans>
								</Button>
							</DialogFooter>
						</DialogContent>
					</Dialog>
				</div>

				<TabsContent value="overview">
					<OverviewTab
						scoreBreakdown={scoreBreakdown}
						trends={trends}
						strengths={strengths}
						improvements={improvements}
					/>
				</TabsContent>

				<TabsContent value="goals">
					<GoalsTab
						summary={summary}
						goals={goals}
						completedGoals={completedGoals}
						isLoadingGoals={isLoadingGoals}
						isPracticing={incrementPracticeMutation.isPending}
						onPractice={handlePractice}
						onComplete={handleCompleteGoal}
						onOpenAddGoal={() => setIsAddGoalOpen(true)}
					/>
				</TabsContent>

				<TabsContent value="tips">
					<TipsTab recommendations={recommendations} />
				</TabsContent>
			</Tabs>
		</>
	);
}
