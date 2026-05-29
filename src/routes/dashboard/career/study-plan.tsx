import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import {
	BookBookmarkIcon,
	BookOpenIcon,
	BrainIcon,
	CalendarIcon,
	ChartLineUpIcon,
	SparkleIcon,
	TargetIcon,
	TrophyIcon,
} from "@phosphor-icons/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";
import { useCallback, useMemo, useState } from "react";
import { ErrorComponent } from "@/components/error-component";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { authClient } from "@/integrations/auth/client";
import { orpc } from "@/integrations/orpc/client";
import { DashboardHeader } from "../-components/header";
import {
	AchievementsTab,
	FlashcardsTab,
	HeroSection,
	OverviewTab,
	ResourcesTab,
	ScheduleTab,
	SkillsGapTab,
} from "./-components/study-plan-components";
import type {
	CareerGoal,
	FlashcardFormState,
	GoalFormState,
	LearningResource,
	ResourceFormState,
	Skill,
	SkillFormState,
	SpacedRepetitionCard,
	StudyPlanData,
} from "./-components/study-plan-types";
import {
	formatDate,
	formatDuration,
	generateAIResources,
	generateAIRoadmap,
	generateId,
	generateWeeklySchedule,
	getDefaultStudyPlanData,
} from "./-components/study-plan-utils";

// biome-ignore lint/suspicious/noExplicitAny: Route path not in generated route tree
export const Route = createFileRoute("/dashboard/career/study-plan" as any)({
	component: StudyPlanGenerator,
	errorComponent: ErrorComponent,
});

function StudyPlanGenerator() {
	const { data: session } = authClient.useSession();
	const queryClient = useQueryClient();
	const [activeTab, setActiveTab] = useState("overview");
	const [isGoalDialogOpen, setIsGoalDialogOpen] = useState(false);
	const [isSkillDialogOpen, setIsSkillDialogOpen] = useState(false);
	const [isResourceDialogOpen, setIsResourceDialogOpen] = useState(false);
	const [isFlashcardDialogOpen, setIsFlashcardDialogOpen] = useState(false);
	const [isGenerating, setIsGenerating] = useState(false);
	const [currentFlashcardIndex, setCurrentFlashcardIndex] = useState(0);
	const [showFlashcardAnswer, setShowFlashcardAnswer] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");

	// Form states
	const [goalForm, setGoalForm] = useState<GoalFormState>({
		targetRole: "",
		industry: "",
		timeline: 6,
		description: "",
	});
	const [skillForm, setSkillForm] = useState<SkillFormState>({
		name: "",
		category: "technical",
		currentLevel: 1,
		targetLevel: 5,
		priority: "medium",
	});
	const [resourceForm, setResourceForm] = useState<ResourceFormState>({
		title: "",
		type: "course",
		platform: "",
		url: "",
		duration: "",
		skillId: "",
	});
	const [flashcardForm, setFlashcardForm] = useState<FlashcardFormState>({ skillId: "", question: "", answer: "" });

	// Load data from database
	const {
		data: studyPlanData,
		isLoading,
		error,
	} = useQuery({ ...orpc.career.studyPlan.get.queryOptions(), enabled: !!session?.user });

	// Use data from query or default
	const data: StudyPlanData = useMemo(() => {
		if (studyPlanData) {
			return studyPlanData as StudyPlanData;
		}
		return getDefaultStudyPlanData();
	}, [studyPlanData]);

	// Update mutation
	const updateMutation = useMutation(
		orpc.career.studyPlan.update.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries({ queryKey: ["career", "studyPlan"] });
			},
		}),
	);

	// Save data function that uses mutation
	const saveData = useCallback(
		(newData: StudyPlanData) => {
			const updated = { ...newData, lastUpdated: new Date().toISOString() };
			updateMutation.mutate(updated);
		},
		[updateMutation],
	);

	// Update streak
	const updateStreak = useCallback(() => {
		const today = new Date().toISOString().split("T")[0];
		const lastDate = data.streak.lastStudyDate?.split("T")[0];

		if (lastDate === today) return;

		const yesterday = new Date();
		yesterday.setDate(yesterday.getDate() - 1);
		const yesterdayStr = yesterday.toISOString().split("T")[0];

		const newStreak = lastDate === yesterdayStr ? data.streak.currentStreak + 1 : 1;

		saveData({
			...data,
			streak: {
				...data.streak,
				currentStreak: newStreak,
				longestStreak: Math.max(newStreak, data.streak.longestStreak),
				lastStudyDate: today,
				totalStudyDays: data.streak.totalStudyDays + 1,
			},
		});
	}, [data, saveData]);

	// Career Goal handlers
	const handleSaveGoal = useCallback(() => {
		if (!goalForm.targetRole || !goalForm.industry) return;

		const newGoal: CareerGoal = {
			id: generateId(),
			...goalForm,
			createdAt: new Date().toISOString(),
		};

		saveData({ ...data, careerGoal: newGoal });
		setIsGoalDialogOpen(false);
		setGoalForm({ targetRole: "", industry: "", timeline: 6, description: "" });
	}, [goalForm, data, saveData]);

	// Generate AI Roadmap
	const handleGenerateRoadmap = useCallback(async () => {
		if (!data.careerGoal) return;

		setIsGenerating(true);
		await new Promise((resolve) => setTimeout(resolve, 1500)); // Simulate AI processing

		const { skills, milestones } = generateAIRoadmap(data.careerGoal, data.skills);

		// Generate resources for each new skill
		const newResources: LearningResource[] = [];
		for (const skill of skills) {
			newResources.push(...generateAIResources(skill));
		}

		// Generate weekly schedule
		const allSkills = [...data.skills, ...skills];
		const allResources = [...data.resources, ...newResources];
		const newTasks = generateWeeklySchedule(allSkills, allResources, data.streak.weeklyGoal);

		saveData({
			...data,
			skills: allSkills,
			resources: allResources,
			milestones: [...data.milestones, ...milestones],
			tasks: [...data.tasks.filter((t) => t.completed), ...newTasks],
		});

		setIsGenerating(false);
	}, [data, saveData]);

	// Skill handlers
	const handleAddSkill = useCallback(() => {
		if (!skillForm.name) return;

		const newSkill: Skill = { id: generateId(), ...skillForm };
		const resources = generateAIResources(newSkill);

		saveData({
			...data,
			skills: [...data.skills, newSkill],
			resources: [...data.resources, ...resources],
		});

		setIsSkillDialogOpen(false);
		setSkillForm({ name: "", category: "technical", currentLevel: 1, targetLevel: 5, priority: "medium" });
	}, [skillForm, data, saveData]);

	const handleUpdateSkillLevel = useCallback(
		(skillId: string, currentLevel: number) => {
			saveData({
				...data,
				skills: data.skills.map((s) => (s.id === skillId ? { ...s, currentLevel } : s)),
			});
		},
		[data, saveData],
	);

	const handleDeleteSkill = useCallback(
		(skillId: string) => {
			saveData({
				...data,
				skills: data.skills.filter((s) => s.id !== skillId),
				resources: data.resources.filter((r) => r.skillId !== skillId),
				tasks: data.tasks.filter((t) => t.skillId !== skillId),
				flashcards: data.flashcards.filter((f) => f.skillId !== skillId),
			});
		},
		[data, saveData],
	);

	// Resource handlers
	const handleAddResource = useCallback(() => {
		if (!resourceForm.title || !resourceForm.skillId) return;

		const newResource: LearningResource = { id: generateId(), ...resourceForm, completed: false };
		saveData({ ...data, resources: [...data.resources, newResource] });

		setIsResourceDialogOpen(false);
		setResourceForm({ title: "", type: "course", platform: "", url: "", duration: "", skillId: "" });
	}, [resourceForm, data, saveData]);

	const handleToggleResource = useCallback(
		(resourceId: string) => {
			saveData({
				...data,
				resources: data.resources.map((r) => (r.id === resourceId ? { ...r, completed: !r.completed } : r)),
			});
			updateStreak();
		},
		[data, saveData, updateStreak],
	);

	// Task handlers
	const handleToggleTask = useCallback(
		(taskId: string) => {
			const task = data.tasks.find((t) => t.id === taskId);
			if (!task) return;

			const wasCompleted = task.completed;
			saveData({
				...data,
				tasks: data.tasks.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t)),
				streak: {
					...data.streak,
					totalStudyMinutes: data.streak.totalStudyMinutes + (wasCompleted ? -task.duration : task.duration),
				},
			});

			if (!wasCompleted) updateStreak();
		},
		[data, saveData, updateStreak],
	);

	// Milestone handlers
	const handleToggleMilestone = useCallback(
		(milestoneId: string) => {
			saveData({
				...data,
				milestones: data.milestones.map((m) =>
					m.id === milestoneId
						? { ...m, completed: !m.completed, completedDate: !m.completed ? new Date().toISOString() : undefined }
						: m,
				),
			});
		},
		[data, saveData],
	);

	// Flashcard handlers
	const handleAddFlashcard = useCallback(() => {
		if (!flashcardForm.question || !flashcardForm.answer || !flashcardForm.skillId) return;

		const newCard: SpacedRepetitionCard = {
			id: generateId(),
			...flashcardForm,
			nextReview: new Date().toISOString(),
			interval: 1,
			easeFactor: 2.5,
			repetitions: 0,
		};

		saveData({ ...data, flashcards: [...data.flashcards, newCard] });
		setIsFlashcardDialogOpen(false);
		setFlashcardForm({ skillId: "", question: "", answer: "" });
	}, [flashcardForm, data, saveData]);

	// Due flashcards - computed before handleReviewFlashcard which uses it
	const dueFlashcards = useMemo(() => {
		const now = new Date();
		return data.flashcards.filter((f) => new Date(f.nextReview) <= now);
	}, [data.flashcards]);

	const handleReviewFlashcard = useCallback(
		(quality: number) => {
			const card = dueFlashcards[currentFlashcardIndex];
			if (!card) return;

			// SM-2 algorithm
			let { interval, easeFactor, repetitions } = card;

			if (quality >= 3) {
				if (repetitions === 0) interval = 1;
				else if (repetitions === 1) interval = 6;
				else interval = Math.round(interval * easeFactor);
				repetitions++;
			} else {
				repetitions = 0;
				interval = 1;
			}

			easeFactor = Math.max(1.3, easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)));

			const nextReview = new Date();
			nextReview.setDate(nextReview.getDate() + interval);

			saveData({
				...data,
				flashcards: data.flashcards.map((f) =>
					f.id === card.id ? { ...f, interval, easeFactor, repetitions, nextReview: nextReview.toISOString() } : f,
				),
			});

			setShowFlashcardAnswer(false);
			if (currentFlashcardIndex < dueFlashcards.length - 1) {
				setCurrentFlashcardIndex(currentFlashcardIndex + 1);
			}
			updateStreak();
		},
		[data, saveData, currentFlashcardIndex, updateStreak, dueFlashcards.length, dueFlashcards[currentFlashcardIndex]],
	);

	// Export to PDF
	const handleExportPDF = useCallback(() => {
		const content = `
STUDY PLAN
Generated: ${formatDate(new Date(), { day: "numeric", month: "short", year: "numeric" })}

CAREER GOAL
Role: ${data.careerGoal?.targetRole || "Not set"}
Industry: ${data.careerGoal?.industry || "Not set"}
Timeline: ${data.careerGoal?.timeline || 0} months

SKILLS (${data.skills.length})
${data.skills.map((s) => `- ${s.name}: ${s.currentLevel}/${s.targetLevel} (${s.priority} priority)`).join("\n")}

MILESTONES (${data.milestones.length})
${data.milestones.map((m) => `- ${m.title}: ${formatDate(m.targetDate, { day: "numeric", month: "short", year: "numeric" })} ${m.completed ? "[COMPLETED]" : ""}`).join("\n")}

RESOURCES (${data.resources.length})
${data.resources.map((r) => `- ${r.title} (${r.platform}) ${r.completed ? "[COMPLETED]" : ""}`).join("\n")}

STUDY STREAK
Current: ${data.streak.currentStreak} days
Longest: ${data.streak.longestStreak} days
Total Study Time: ${formatDuration(data.streak.totalStudyMinutes)}
		`.trim();

		const blob = new Blob([content], { type: "text/plain" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = `study-plan-${new Date().toISOString().split("T")[0]}.txt`;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
	}, [data]);

	// Computed values
	const overallProgress = useMemo(() => {
		if (data.skills.length === 0) return 0;
		const total = data.skills.reduce((sum, s) => sum + ((s.currentLevel - 1) / (s.targetLevel - 1)) * 100, 0);
		return Math.round(total / data.skills.length);
	}, [data.skills]);

	const todayTasks = useMemo(() => {
		const today = new Date().toISOString().split("T")[0];
		return data.tasks.filter((t) => t.scheduledDate.split("T")[0] === today);
	}, [data.tasks]);

	const weekProgress = useMemo(() => {
		const weekStart = new Date();
		weekStart.setDate(weekStart.getDate() - weekStart.getDay());
		const weekTasks = data.tasks.filter(
			(t) => new Date(t.scheduledDate) >= weekStart && new Date(t.scheduledDate) <= new Date(),
		);
		const completedMinutes = weekTasks.filter((t) => t.completed).reduce((sum, t) => sum + t.duration, 0);
		return Math.min(100, Math.round((completedMinutes / data.streak.weeklyGoal) * 100));
	}, [data.tasks, data.streak.weeklyGoal]);

	const filteredResources = useMemo(() => {
		if (!searchQuery) return data.resources;
		const query = searchQuery.toLowerCase();
		return data.resources.filter(
			(r) =>
				r.title.toLowerCase().includes(query) ||
				r.platform.toLowerCase().includes(query) ||
				r.type.toLowerCase().includes(query),
		);
	}, [data.resources, searchQuery]);

	// Loading state
	if (isLoading) {
		return (
			<>
				<DashboardHeader icon={BookOpenIcon} title={t`Study Plan Generator`} />
				<div className="flex min-h-[400px] items-center justify-center">
					<div className="text-center">
						<motion.div
							animate={{ rotate: 360 }}
							transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
							className="mx-auto mb-4"
						>
							<SparkleIcon className="size-8 text-primary" />
						</motion.div>
						<p className="text-muted-foreground">
							<Trans>Loading your study plan...</Trans>
						</p>
					</div>
				</div>
			</>
		);
	}

	// Error state
	if (error) {
		return (
			<>
				<DashboardHeader icon={BookOpenIcon} title={t`Study Plan Generator`} />
				<Card className="border-destructive">
					<CardContent className="flex flex-col items-center py-12 text-center">
						<div className="mb-4 flex size-12 items-center justify-center rounded-full bg-destructive/10">
							<BookOpenIcon className="size-6 text-destructive" />
						</div>
						<h3 className="mb-2 font-medium">
							<Trans>Failed to load study plan</Trans>
						</h3>
						<p className="mb-4 text-muted-foreground text-sm">
							{error.message || <Trans>An error occurred while loading your study plan.</Trans>}
						</p>
						<Button onClick={() => queryClient.invalidateQueries({ queryKey: ["career", "studyPlan"] })}>
							<Trans>Try Again</Trans>
						</Button>
					</CardContent>
				</Card>
			</>
		);
	}

	return (
		<>
			<DashboardHeader icon={BookOpenIcon} title={t`Study Plan Generator`} />

			<HeroSection data={data} />

			{/* Main Tabs */}
			<Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
				<TabsList className="flex h-auto flex-wrap gap-2 bg-transparent p-0">
					{[
						{ value: "overview", icon: ChartLineUpIcon, label: t`Overview` },
						{ value: "skills", icon: TargetIcon, label: t`Skills Gap` },
						{ value: "schedule", icon: CalendarIcon, label: t`Schedule` },
						{ value: "resources", icon: BookBookmarkIcon, label: t`Resources` },
						{ value: "flashcards", icon: BrainIcon, label: t`Practice` },
						{ value: "achievements", icon: TrophyIcon, label: t`Achievements` },
					].map((tab) => (
						<TabsTrigger
							key={tab.value}
							value={tab.value}
							className="gap-2 rounded-full border border-transparent bg-muted/50 px-6 py-2.5 data-[state=active]:border-primary/30 data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
						>
							<tab.icon className="size-4" />
							{tab.label}
						</TabsTrigger>
					))}
				</TabsList>

				<TabsContent value="overview">
					<OverviewTab
						data={data}
						overallProgress={overallProgress}
						todayTasks={todayTasks}
						weekProgress={weekProgress}
						isGoalDialogOpen={isGoalDialogOpen}
						setIsGoalDialogOpen={setIsGoalDialogOpen}
						goalForm={goalForm}
						setGoalForm={setGoalForm}
						handleSaveGoal={handleSaveGoal}
						handleGenerateRoadmap={handleGenerateRoadmap}
						handleExportPDF={handleExportPDF}
						handleToggleTask={handleToggleTask}
						handleToggleMilestone={handleToggleMilestone}
						isGenerating={isGenerating}
						saveData={saveData}
					/>
				</TabsContent>

				<TabsContent value="skills">
					<SkillsGapTab
						data={data}
						isSkillDialogOpen={isSkillDialogOpen}
						setIsSkillDialogOpen={setIsSkillDialogOpen}
						skillForm={skillForm}
						setSkillForm={setSkillForm}
						handleAddSkill={handleAddSkill}
						handleUpdateSkillLevel={handleUpdateSkillLevel}
						handleDeleteSkill={handleDeleteSkill}
					/>
				</TabsContent>

				<TabsContent value="schedule">
					<ScheduleTab data={data} handleToggleTask={handleToggleTask} />
				</TabsContent>

				<TabsContent value="resources">
					<ResourcesTab
						data={data}
						filteredResources={filteredResources}
						searchQuery={searchQuery}
						setSearchQuery={setSearchQuery}
						isResourceDialogOpen={isResourceDialogOpen}
						setIsResourceDialogOpen={setIsResourceDialogOpen}
						resourceForm={resourceForm}
						setResourceForm={setResourceForm}
						handleAddResource={handleAddResource}
						handleToggleResource={handleToggleResource}
					/>
				</TabsContent>

				<TabsContent value="flashcards">
					<FlashcardsTab
						data={data}
						dueFlashcards={dueFlashcards}
						currentFlashcardIndex={currentFlashcardIndex}
						setCurrentFlashcardIndex={setCurrentFlashcardIndex}
						showFlashcardAnswer={showFlashcardAnswer}
						setShowFlashcardAnswer={setShowFlashcardAnswer}
						isFlashcardDialogOpen={isFlashcardDialogOpen}
						setIsFlashcardDialogOpen={setIsFlashcardDialogOpen}
						flashcardForm={flashcardForm}
						setFlashcardForm={setFlashcardForm}
						handleAddFlashcard={handleAddFlashcard}
						handleReviewFlashcard={handleReviewFlashcard}
					/>
				</TabsContent>

				<TabsContent value="achievements">
					<AchievementsTab data={data} weekProgress={weekProgress} saveData={saveData} />
				</TabsContent>
			</Tabs>
		</>
	);
}
