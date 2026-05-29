import { t } from "@lingui/core/macro";
import {
	CalendarIcon,
	ChatCircleDotsIcon,
	ClipboardTextIcon,
	CurrencyCircleDollarIcon,
	QuestionIcon,
	TargetIcon,
	TrendUpIcon,
	TrophyIcon,
	UserIcon,
} from "@phosphor-icons/react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ErrorComponent } from "@/components/error-component";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { authClient } from "@/integrations/auth/client";
import { orpc } from "@/integrations/orpc/client";

import { DashboardHeader } from "../-components/header";
import {
	AccomplishmentsTab,
	CareerGrowthTab,
	GoalsTab,
	HeroSection,
	QuestionsTab,
	SalaryTab,
	SelfAssessmentTab,
	TalkingPointsTab,
	TimelineTab,
} from "./-components/review-prep-components";
import { PREPARATION_TIMELINE, SELF_ASSESSMENT_QUESTIONS } from "./-components/review-prep-config";
import type { AccomplishmentEntry } from "./-components/review-prep-types";

// biome-ignore lint/suspicious/noExplicitAny: Route path not in generated route tree
export const Route = createFileRoute("/dashboard/career/review-prep" as any)({
	component: ReviewPrep,
	errorComponent: ErrorComponent,
});

function ReviewPrep() {
	const { data: session } = authClient.useSession();
	const [activeTab, setActiveTab] = useState("accomplishments");
	const [selectedAssessmentCategory, setSelectedAssessmentCategory] = useState("performance");
	const [assessmentResponses, setAssessmentResponses] = useState<Record<string, string>>({});
	const [expandedGoal, setExpandedGoal] = useState<string | null>(null);
	const [salaryExpectation, setSalaryExpectation] = useState<number[]>([55000]);
	const [timelineProgress, setTimelineProgress] = useState<Record<string, boolean[]>>({});

	// Fetch accomplishments
	const { data: accomplishments = [] } = useQuery({
		...orpc.reviewPrep.getAccomplishments.queryOptions({ input: {} }),
		staleTime: 5 * 60 * 1000,
		enabled: !!session?.user,
	});

	// Fetch goals
	const { data: goals = [] } = useQuery({
		...orpc.reviewPrep.getGoals.queryOptions({ input: {} }),
		staleTime: 5 * 60 * 1000,
		enabled: !!session?.user,
	});

	// Fetch salary research data
	const { data: salaryData = [] } = useQuery({
		...orpc.reviewPrep.getSalaryResearches.queryOptions({ input: {} }),
		staleTime: 5 * 60 * 1000,
		enabled: !!session?.user,
	});

	// Fetch persisted assessment data
	const { data: savedAssessmentData } = useQuery({
		...orpc.reviewPrep.getAssessmentData.queryOptions({ input: {} }),
		staleTime: 5 * 60 * 1000,
		enabled: !!session?.user,
	});

	// Fetch persisted timeline data
	const { data: savedTimelineData } = useQuery({
		...orpc.reviewPrep.getTimelineData.queryOptions({ input: {} }),
		staleTime: 5 * 60 * 1000,
		enabled: !!session?.user,
	});

	// Fetch persisted salary expectation
	const { data: savedSalaryData } = useQuery({
		...orpc.reviewPrep.getSalaryExpectation.queryOptions({ input: {} }),
		staleTime: 5 * 60 * 1000,
		enabled: !!session?.user,
	});

	// Sync DB data into local state when loaded
	useEffect(() => {
		if (savedAssessmentData?.responses) {
			setAssessmentResponses(savedAssessmentData.responses);
		}
	}, [savedAssessmentData]);

	useEffect(() => {
		if (savedTimelineData?.progress) {
			setTimelineProgress(savedTimelineData.progress);
		}
	}, [savedTimelineData]);

	useEffect(() => {
		if (savedSalaryData?.value) {
			setSalaryExpectation(savedSalaryData.value);
		}
	}, [savedSalaryData]);

	// Save mutations
	const saveAssessmentMutation = useMutation({
		...orpc.reviewPrep.saveAssessmentData.mutationOptions(),
	});

	const saveTimelineMutation = useMutation({
		...orpc.reviewPrep.saveTimelineData.mutationOptions(),
	});

	const saveSalaryMutation = useMutation({
		...orpc.reviewPrep.saveSalaryExpectation.mutationOptions(),
	});

	// Computed values
	const accomplishmentsByMonth = useMemo(() => {
		const grouped: Record<string, AccomplishmentEntry[]> = {};
		for (const acc of accomplishments) {
			const monthKey = acc.date.substring(0, 7);
			if (!grouped[monthKey]) grouped[monthKey] = [];
			grouped[monthKey].push(acc);
		}
		return grouped;
	}, [accomplishments]);

	const goalsProgress = useMemo(() => {
		const total = goals.length;
		const completed = goals.filter((g) => g.status === "completed").length;
		const avgProgress = goals.reduce((sum, g) => sum + g.progress, 0) / total;
		return { total, completed, avgProgress };
	}, [goals]);

	const assessmentQuestions = useMemo(
		() => SELF_ASSESSMENT_QUESTIONS[selectedAssessmentCategory] || [],
		[selectedAssessmentCategory],
	);

	const assessmentProgress = useMemo(() => {
		const allQuestions = Object.values(SELF_ASSESSMENT_QUESTIONS).flat();
		const answered = allQuestions.filter((q) => assessmentResponses[q.id]?.trim()).length;
		return Math.round((answered / allQuestions.length) * 100);
	}, [assessmentResponses]);

	// Handlers
	const handleAssessmentChange = useCallback(
		(id: string, value: string) => {
			setAssessmentResponses((prev) => {
				const updated = { ...prev, [id]: value };
				saveAssessmentMutation.mutate({ responses: updated });
				return updated;
			});
		},
		[saveAssessmentMutation],
	);

	const toggleGoalExpand = useCallback((goalId: string) => {
		setExpandedGoal((prev) => (prev === goalId ? null : goalId));
	}, []);

	const toggleTimelineTask = useCallback(
		(phaseId: string, taskIndex: number) => {
			setTimelineProgress((prev) => {
				const current =
					prev[phaseId] || PREPARATION_TIMELINE.find((p) => p.id === phaseId)?.tasks.map(() => false) || [];
				const updated = [...current];
				updated[taskIndex] = !updated[taskIndex];
				const newProgress = { ...prev, [phaseId]: updated };
				saveTimelineMutation.mutate({ progress: newProgress });
				return newProgress;
			});
		},
		[saveTimelineMutation],
	);

	const handleSalaryChange = useCallback(
		(value: number[]) => {
			setSalaryExpectation(value);
			saveSalaryMutation.mutate({ value });
		},
		[saveSalaryMutation],
	);

	const getPhaseProgress = useCallback(
		(phaseId: string) => {
			const phase = PREPARATION_TIMELINE.find((p) => p.id === phaseId);
			if (!phase) return 0;
			const tasks = timelineProgress[phaseId] || phase.tasks.map(() => false);
			const completed = tasks.filter(Boolean).length;
			return Math.round((completed / phase.tasks.length) * 100);
		},
		[timelineProgress],
	);

	return (
		<>
			<DashboardHeader icon={ClipboardTextIcon} title={t`Performance Review Preparation`} />

			<HeroSection
				accomplishmentsCount={accomplishments.length}
				avgGoalsProgress={goalsProgress.avgProgress}
				assessmentProgress={assessmentProgress}
			/>

			<Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
				<TabsList className="flex h-auto flex-wrap gap-2 bg-transparent p-0">
					{[
						{ value: "accomplishments", icon: TrophyIcon, label: "Accomplishments" },
						{ value: "goals", icon: TargetIcon, label: "Goals" },
						{ value: "assessment", icon: UserIcon, label: "Self-Assessment" },
						{ value: "talking-points", icon: ChatCircleDotsIcon, label: "Key Points" },
						{ value: "questions", icon: QuestionIcon, label: "Questions" },
						{ value: "salary", icon: CurrencyCircleDollarIcon, label: "Salary" },
						{ value: "growth", icon: TrendUpIcon, label: "Growth" },
						{ value: "timeline", icon: CalendarIcon, label: "Timeline" },
					].map((tab) => (
						<TabsTrigger
							key={tab.value}
							value={tab.value}
							className="gap-2 rounded-full border border-transparent bg-muted/50 px-4 py-2 text-sm data-[state=active]:border-primary/30 data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
						>
							<tab.icon className="size-4" />
							{tab.label}
						</TabsTrigger>
					))}
				</TabsList>

				<TabsContent value="accomplishments" className="space-y-6">
					<AccomplishmentsTab accomplishmentsByMonth={accomplishmentsByMonth} />
				</TabsContent>

				<TabsContent value="goals" className="space-y-6">
					<GoalsTab
						goals={goals}
						goalsProgress={goalsProgress}
						expandedGoal={expandedGoal}
						toggleGoalExpand={toggleGoalExpand}
					/>
				</TabsContent>

				<TabsContent value="assessment" className="space-y-6">
					<SelfAssessmentTab
						selectedAssessmentCategory={selectedAssessmentCategory}
						setSelectedAssessmentCategory={setSelectedAssessmentCategory}
						assessmentResponses={assessmentResponses}
						assessmentProgress={assessmentProgress}
						assessmentQuestions={assessmentQuestions}
						handleAssessmentChange={handleAssessmentChange}
					/>
				</TabsContent>

				<TabsContent value="talking-points" className="space-y-6">
					<TalkingPointsTab />
				</TabsContent>

				<TabsContent value="questions" className="space-y-6">
					<QuestionsTab />
				</TabsContent>

				<TabsContent value="salary" className="space-y-6">
					<SalaryTab
						salaryExpectation={salaryExpectation}
						setSalaryExpectation={handleSalaryChange}
						salaryData={salaryData}
					/>
				</TabsContent>

				<TabsContent value="growth" className="space-y-6">
					<CareerGrowthTab />
				</TabsContent>

				<TabsContent value="timeline" className="space-y-6">
					<TimelineTab
						timelineProgress={timelineProgress}
						toggleTimelineTask={toggleTimelineTask}
						getPhaseProgress={getPhaseProgress}
						accomplishmentsCount={accomplishments.length}
						goalsCount={goals.length}
						assessmentProgress={assessmentProgress}
					/>
				</TabsContent>
			</Tabs>
		</>
	);
}
