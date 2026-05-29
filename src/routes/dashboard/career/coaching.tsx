import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { ArrowClockwiseIcon, HeartIcon } from "@phosphor-icons/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import { ErrorComponent } from "@/components/error-component";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { authClient } from "@/integrations/auth/client";
import { orpc } from "@/integrations/orpc/client";
import { DashboardHeader } from "../-components/header";
import {
	DailyAffirmation,
	DashboardTabContent,
	GoalsTabContent,
	JournalTabContent,
	NewCareerPathDialog,
	NewEntryDialog,
	NewGoalDialog,
	OverviewStats,
	PathTabContent,
} from "./-components/coaching-components";
import type { GoalCategory, GoalStatus, JournalEntryType } from "./-components/coaching-types";

// biome-ignore lint/suspicious/noExplicitAny: Route path not in generated route tree
export const Route = createFileRoute("/dashboard/career/coaching" as any)({
	component: CareerCoaching,
	errorComponent: ErrorComponent,
});

function CareerCoaching() {
	const { data: session } = authClient.useSession();
	const queryClient = useQueryClient();
	const [activeTab, setActiveTab] = useState("dashboard");
	const [showNewGoalDialog, setShowNewGoalDialog] = useState(false);
	const [showNewEntryDialog, setShowNewEntryDialog] = useState(false);
	const [showNewPathDialog, setShowNewPathDialog] = useState(false);
	const [pathCurrentRole, setPathCurrentRole] = useState("");
	const [pathTargetRole, setPathTargetRole] = useState("");

	const [goalCategory, setGoalCategory] = useState<GoalCategory>("applications");
	const [goalTitle, setGoalTitle] = useState("");
	const [goalDescription, setGoalDescription] = useState("");
	const [goalTarget, setGoalTarget] = useState(1);

	const [entryType, setEntryType] = useState<JournalEntryType>("win");
	const [entryTitle, setEntryTitle] = useState("");
	const [entryContent, setEntryContent] = useState("");
	const [entryMood, setEntryMood] = useState(3);

	const {
		data: dashboardStats,
		isError: isErrorStats,
		refetch: refetchStats,
	} = useQuery({
		...orpc.careerCoaching.getDashboardStats.queryOptions(),
		staleTime: 2 * 60 * 1000,
		enabled: !!session?.user,
		retry: 1,
	});

	const {
		data: weeklyGoals = [],
		isError: isErrorGoals,
		refetch: refetchGoals,
	} = useQuery({
		...orpc.careerCoaching.getCurrentWeekGoals.queryOptions(),
		staleTime: 2 * 60 * 1000,
		enabled: !!session?.user,
		retry: 1,
	});

	const { data: journalEntries = [] } = useQuery({
		...orpc.careerCoaching.getJournalEntries.queryOptions({ input: { limit: 10 } }),
		staleTime: 2 * 60 * 1000,
		enabled: !!session?.user,
	});

	const { data: todaysAffirmation } = useQuery({
		...orpc.careerCoaching.getTodaysAffirmation.queryOptions(),
		staleTime: 60 * 60 * 1000,
		enabled: !!session?.user,
	});

	const { data: careerPath } = useQuery({
		...orpc.careerCoaching.getActiveCareerPath.queryOptions(),
		staleTime: 5 * 60 * 1000,
		enabled: !!session?.user,
	});

	const getWeekStartDate = useCallback(() => {
		const today = new Date();
		const dayOfWeek = today.getDay();
		const monday = new Date(today);
		monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
		return monday.toISOString().split("T")[0];
	}, []);

	const createGoalMutation = useMutation({
		mutationFn: async (input: {
			weekStartDate: string;
			category: GoalCategory;
			title: string;
			description?: string;
			targetValue?: number;
		}) => {
			return orpc.careerCoaching.createWeeklyGoal.call(input);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["careerCoaching", "getCurrentWeekGoals"] });
			queryClient.invalidateQueries({ queryKey: ["careerCoaching", "getDashboardStats"] });
			toast.success(t`Goal created successfully`);
			resetGoalForm();
			setShowNewGoalDialog(false);
		},
		onError: () => {
			toast.error(t`Error creating goal`);
		},
	});

	const updateGoalMutation = useMutation({
		mutationFn: async (input: { id: string; currentValue?: number; status?: GoalStatus }) => {
			return orpc.careerCoaching.updateWeeklyGoal.call(input);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["careerCoaching", "getCurrentWeekGoals"] });
			queryClient.invalidateQueries({ queryKey: ["careerCoaching", "getDashboardStats"] });
		},
	});

	const createEntryMutation = useMutation({
		mutationFn: async (input: {
			entryType: JournalEntryType;
			entryDate: string;
			title: string;
			content: string;
			mood?: number;
		}) => {
			return orpc.careerCoaching.createJournalEntry.call(input);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["careerCoaching", "getJournalEntries"] });
			queryClient.invalidateQueries({ queryKey: ["careerCoaching", "getDashboardStats"] });
			toast.success(t`Entry added successfully`);
			resetEntryForm();
			setShowNewEntryDialog(false);
		},
		onError: () => {
			toast.error(t`Error adding entry`);
		},
	});

	const likeAffirmationMutation = useMutation({
		mutationFn: async (id: string) => {
			return orpc.careerCoaching.likeAffirmation.call({ id });
		},
		onSuccess: () => {
			toast.success(t`Affirmation liked`);
		},
	});

	const createPathMutation = useMutation({
		mutationFn: async (input: { currentRole?: string; targetRole: string }) => {
			return orpc.careerCoaching.createCareerPath.call(input);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["careerCoaching", "getActiveCareerPath"] });
			toast.success(t`Career path created successfully`);
			setPathCurrentRole("");
			setPathTargetRole("");
			setShowNewPathDialog(false);
		},
		onError: () => {
			toast.error(t`Error creating career path`);
		},
	});

	const resetGoalForm = useCallback(() => {
		setGoalCategory("applications");
		setGoalTitle("");
		setGoalDescription("");
		setGoalTarget(1);
	}, []);

	const resetEntryForm = useCallback(() => {
		setEntryType("win");
		setEntryTitle("");
		setEntryContent("");
		setEntryMood(3);
	}, []);

	const goalCompletion = useMemo(() => {
		if (weeklyGoals.length === 0) return 0;
		const completed = weeklyGoals.filter((g) => g.status === "completed").length;
		return Math.round((completed / weeklyGoals.length) * 100);
	}, [weeklyGoals]);

	if (isErrorStats || isErrorGoals) {
		return (
			<div className="space-y-6">
				<DashboardHeader icon={HeartIcon} title={t`Career Coaching`} />
				<div className="flex flex-col items-center justify-center rounded-lg border bg-card p-12">
					<p className="mb-2 font-medium text-destructive">
						<Trans>Loading error</Trans>
					</p>
					<p className="mb-4 text-muted-foreground text-sm">
						<Trans>Unable to load coaching data. Please try again.</Trans>
					</p>
					<Button
						onClick={() => {
							refetchStats();
							refetchGoals();
						}}
						variant="outline"
						className="gap-2"
					>
						<ArrowClockwiseIcon className="size-4" />
						<Trans>Retry</Trans>
					</Button>
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<DashboardHeader icon={HeartIcon} title={t`Career Coaching`} />

			{todaysAffirmation && (
				<DailyAffirmation affirmation={todaysAffirmation} onLike={(id) => likeAffirmationMutation.mutate(id)} />
			)}

			<OverviewStats dashboardStats={dashboardStats} goalCompletion={goalCompletion} />

			<Tabs value={activeTab} onValueChange={setActiveTab}>
				<TabsList>
					<TabsTrigger value="dashboard">
						<Trans>Dashboard</Trans>
					</TabsTrigger>
					<TabsTrigger value="goals">
						<Trans>Goals</Trans>
					</TabsTrigger>
					<TabsTrigger value="journal">
						<Trans>Journal</Trans>
					</TabsTrigger>
					<TabsTrigger value="path">
						<Trans>Career Path</Trans>
					</TabsTrigger>
				</TabsList>

				<TabsContent value="dashboard" className="space-y-6">
					<DashboardTabContent
						weeklyGoals={weeklyGoals}
						journalEntries={journalEntries}
						careerPath={careerPath}
						onShowNewGoalDialog={() => setShowNewGoalDialog(true)}
						onShowNewEntryDialog={() => setShowNewEntryDialog(true)}
						updateGoalMutation={updateGoalMutation}
					/>
				</TabsContent>

				<TabsContent value="goals" className="space-y-4">
					<GoalsTabContent
						weeklyGoals={weeklyGoals}
						updateGoalMutation={updateGoalMutation}
						onShowNewGoalDialog={() => setShowNewGoalDialog(true)}
					/>
				</TabsContent>

				<TabsContent value="journal" className="space-y-4">
					<JournalTabContent journalEntries={journalEntries} onShowNewEntryDialog={() => setShowNewEntryDialog(true)} />
				</TabsContent>

				<TabsContent value="path" className="space-y-4">
					<PathTabContent careerPath={careerPath} onCreatePath={() => setShowNewPathDialog(true)} />
				</TabsContent>
			</Tabs>

			<NewGoalDialog
				open={showNewGoalDialog}
				onOpenChange={setShowNewGoalDialog}
				goalCategory={goalCategory}
				setGoalCategory={setGoalCategory}
				goalTitle={goalTitle}
				setGoalTitle={setGoalTitle}
				goalDescription={goalDescription}
				setGoalDescription={setGoalDescription}
				goalTarget={goalTarget}
				setGoalTarget={setGoalTarget}
				onSubmit={() =>
					createGoalMutation.mutate({
						weekStartDate: getWeekStartDate(),
						category: goalCategory,
						title: goalTitle,
						description: goalDescription || undefined,
						targetValue: goalTarget,
					})
				}
				isPending={createGoalMutation.isPending}
			/>

			<NewEntryDialog
				open={showNewEntryDialog}
				onOpenChange={setShowNewEntryDialog}
				entryType={entryType}
				setEntryType={setEntryType}
				entryTitle={entryTitle}
				setEntryTitle={setEntryTitle}
				entryContent={entryContent}
				setEntryContent={setEntryContent}
				entryMood={entryMood}
				setEntryMood={setEntryMood}
				onSubmit={() =>
					createEntryMutation.mutate({
						entryType,
						entryDate: new Date().toISOString().split("T")[0],
						title: entryTitle,
						content: entryContent,
						mood: entryMood,
					})
				}
				isPending={createEntryMutation.isPending}
			/>

			<NewCareerPathDialog
				open={showNewPathDialog}
				onOpenChange={setShowNewPathDialog}
				currentRole={pathCurrentRole}
				setCurrentRole={setPathCurrentRole}
				targetRole={pathTargetRole}
				setTargetRole={setPathTargetRole}
				onSubmit={() =>
					createPathMutation.mutate({
						currentRole: pathCurrentRole || undefined,
						targetRole: pathTargetRole,
					})
				}
				isPending={createPathMutation.isPending}
			/>
		</div>
	);
}
