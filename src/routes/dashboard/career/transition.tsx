import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { ArrowsLeftRightIcon, CalendarIcon, ChartLineUpIcon, ListChecksIcon, TrendUpIcon } from "@phosphor-icons/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useMemo, useState } from "react";
import { ErrorComponent } from "@/components/error-component";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { authClient } from "@/integrations/auth/client";
import { orpc } from "@/integrations/orpc/client";
import { DashboardHeader } from "../-components/header";
import {
	ActionModal,
	ActionsTabContent,
	HeroSection,
	OverviewStats,
	OverviewTabContent,
	PhaseModal,
	SkillModal,
	SkillsTabContent,
	TimelineTabContent,
} from "./-components/transition-components";
import { getActionCategories, getPriorities, getSkillCategories } from "./-components/transition-config";
import type {
	ActionCategory,
	ActionFormState,
	PhaseFormState,
	Priority,
	SkillCategory,
	SkillFormState,
} from "./-components/transition-types";

// biome-ignore lint/suspicious/noExplicitAny: Route path not in generated route tree
export const Route = createFileRoute("/dashboard/career/transition" as any)({
	component: CareerTransitionPlanner,
	errorComponent: ErrorComponent,
});

function CareerTransitionPlanner() {
	const { data: session } = authClient.useSession();
	const queryClient = useQueryClient();
	const SKILL_CATEGORIES = getSkillCategories();
	const ACTION_CATEGORIES = getActionCategories();
	const PRIORITIES = getPriorities();
	const [activeTab, setActiveTab] = useState("overview");

	// Modal states
	const [showSkillModal, setShowSkillModal] = useState(false);
	const [showPhaseModal, setShowPhaseModal] = useState(false);
	const [showActionModal, setShowActionModal] = useState(false);
	const [editingSkill, setEditingSkill] = useState<string | null>(null);
	const [editingPhase, setEditingPhase] = useState<string | null>(null);
	const [editingAction, setEditingAction] = useState<string | null>(null);

	// Form states
	const [skillForm, setSkillForm] = useState<SkillFormState>({
		name: "",
		nameFr: "",
		category: "technical",
		currentLevel: 50,
		relevanceToTarget: 80,
		description: "",
	});
	const [phaseForm, setPhaseForm] = useState<PhaseFormState>({
		name: "",
		nameFr: "",
		duration: "",
		durationWeeks: 4,
		description: "",
		tasks: [],
		newTask: "",
	});
	const [actionForm, setActionForm] = useState<ActionFormState>({
		task: "",
		taskFr: "",
		category: "skill",
		priority: "medium",
		deadline: "",
		estimatedHours: 4,
	});

	// Fetch transition data
	const { data: overview, isLoading: overviewLoading } = useQuery({
		...orpc.careerTransition.getOverview.queryOptions({}),
		enabled: !!session?.user,
	});
	const { data: skills, isLoading: skillsLoading } = useQuery({
		...orpc.careerTransition.skillsList.queryOptions({}),
		enabled: !!session?.user,
	});
	const { data: timeline, isLoading: timelineLoading } = useQuery({
		...orpc.careerTransition.timelineList.queryOptions({}),
		enabled: !!session?.user,
	});
	const { data: actions, isLoading: actionsLoading } = useQuery({
		...orpc.careerTransition.actionsList.queryOptions({}),
		enabled: !!session?.user,
	});
	const { data: actionStats } = useQuery({
		...orpc.careerTransition.actionsGetStatistics.queryOptions({}),
		enabled: !!session?.user,
	});

	// Mutations
	const createSkillMutation = useMutation(
		orpc.careerTransition.skillsCreate.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries({ queryKey: ["careerTransition"] });
				setShowSkillModal(false);
				resetSkillForm();
			},
		}),
	);

	const updateSkillMutation = useMutation(
		orpc.careerTransition.skillsUpdate.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries({ queryKey: ["careerTransition"] });
				setShowSkillModal(false);
				setEditingSkill(null);
				resetSkillForm();
			},
		}),
	);

	const deleteSkillMutation = useMutation(
		orpc.careerTransition.skillsDelete.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries({ queryKey: ["careerTransition"] });
			},
		}),
	);

	const createPhaseMutation = useMutation(
		orpc.careerTransition.timelineCreate.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries({ queryKey: ["careerTransition"] });
				setShowPhaseModal(false);
				resetPhaseForm();
			},
		}),
	);

	const updatePhaseMutation = useMutation(
		orpc.careerTransition.timelineUpdate.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries({ queryKey: ["careerTransition"] });
				setShowPhaseModal(false);
				setEditingPhase(null);
				resetPhaseForm();
			},
		}),
	);

	const togglePhaseMutation = useMutation(
		orpc.careerTransition.timelineToggle.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries({ queryKey: ["careerTransition"] });
			},
		}),
	);

	const deletePhaseMutation = useMutation(
		orpc.careerTransition.timelineDelete.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries({ queryKey: ["careerTransition"] });
			},
		}),
	);

	const createActionMutation = useMutation(
		orpc.careerTransition.actionsCreate.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries({ queryKey: ["careerTransition"] });
				setShowActionModal(false);
				resetActionForm();
			},
		}),
	);

	const updateActionMutation = useMutation(
		orpc.careerTransition.actionsUpdate.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries({ queryKey: ["careerTransition"] });
				setShowActionModal(false);
				setEditingAction(null);
				resetActionForm();
			},
		}),
	);

	const toggleActionMutation = useMutation(
		orpc.careerTransition.actionsToggle.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries({ queryKey: ["careerTransition"] });
			},
		}),
	);

	const deleteActionMutation = useMutation(
		orpc.careerTransition.actionsDelete.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries({ queryKey: ["careerTransition"] });
			},
		}),
	);

	// Reset form functions
	const resetSkillForm = useCallback(() => {
		setSkillForm({
			name: "",
			nameFr: "",
			category: "technical",
			currentLevel: 50,
			relevanceToTarget: 80,
			description: "",
		});
	}, []);

	const resetPhaseForm = useCallback(() => {
		setPhaseForm({
			name: "",
			nameFr: "",
			duration: "",
			durationWeeks: 4,
			description: "",
			tasks: [],
			newTask: "",
		});
	}, []);

	const resetActionForm = useCallback(() => {
		setActionForm({
			task: "",
			taskFr: "",
			category: "skill",
			priority: "medium",
			deadline: "",
			estimatedHours: 4,
		});
	}, []);

	// Handle skill edit
	const handleEditSkill = useCallback(
		(skillId: string) => {
			const skill = skills?.find((s) => s.id === skillId);
			if (skill) {
				setSkillForm({
					name: skill.name,
					nameFr: skill.nameFr,
					category: skill.category as SkillCategory,
					currentLevel: skill.currentLevel,
					relevanceToTarget: skill.relevanceToTarget,
					description: skill.description || "",
				});
				setEditingSkill(skillId);
				setShowSkillModal(true);
			}
		},
		[skills],
	);

	// Handle phase edit
	const handleEditPhase = useCallback(
		(phaseId: string) => {
			const phase = timeline?.find((p) => p.id === phaseId);
			if (phase) {
				setPhaseForm({
					name: phase.name,
					nameFr: phase.nameFr,
					duration: phase.duration,
					durationWeeks: phase.durationWeeks,
					description: phase.description || "",
					tasks: (phase.tasks as string[]) || [],
					newTask: "",
				});
				setEditingPhase(phaseId);
				setShowPhaseModal(true);
			}
		},
		[timeline],
	);

	// Handle action edit
	const handleEditAction = useCallback(
		(actionId: string) => {
			const action = actions?.find((a) => a.id === actionId);
			if (action) {
				setActionForm({
					task: action.task,
					taskFr: action.taskFr,
					category: action.category as ActionCategory,
					priority: action.priority as Priority,
					deadline: action.deadline,
					estimatedHours: action.estimatedHours,
				});
				setEditingAction(actionId);
				setShowActionModal(true);
			}
		},
		[actions],
	);

	// Submit handlers
	const handleSkillSubmit = useCallback(() => {
		if (editingSkill) {
			updateSkillMutation.mutate({ id: editingSkill, ...skillForm });
		} else {
			createSkillMutation.mutate(skillForm);
		}
	}, [editingSkill, skillForm, createSkillMutation, updateSkillMutation]);

	const handlePhaseSubmit = useCallback(() => {
		const { newTask, ...phaseData } = phaseForm;
		if (editingPhase) {
			updatePhaseMutation.mutate({ id: editingPhase, ...phaseData });
		} else {
			createPhaseMutation.mutate(phaseData);
		}
	}, [editingPhase, phaseForm, createPhaseMutation, updatePhaseMutation]);

	const handleActionSubmit = useCallback(() => {
		const actionData = {
			...actionForm,
			deadline: new Date(actionForm.deadline),
		};
		if (editingAction) {
			updateActionMutation.mutate({ id: editingAction, ...actionData });
		} else {
			createActionMutation.mutate(actionData);
		}
	}, [editingAction, actionForm, createActionMutation, updateActionMutation]);

	// Group skills by category
	const skillsByCategory = useMemo((): Partial<Record<SkillCategory, typeof skills>> => {
		if (!skills) return {};
		return skills.reduce(
			(acc, skill) => {
				const cat = skill.category as SkillCategory;
				if (!acc[cat]) acc[cat] = [];
				acc[cat]?.push(skill);
				return acc;
			},
			{} as Partial<Record<SkillCategory, typeof skills>>,
		);
	}, [skills]);

	// Upcoming actions
	const upcomingActions = useMemo(() => {
		if (!actions) return [];
		const now = new Date();
		return actions
			.filter((a) => !a.completed && new Date(a.deadline) >= now)
			.sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
			.slice(0, 5);
	}, [actions]);

	const isLoading = overviewLoading || skillsLoading || timelineLoading || actionsLoading;

	return (
		<div className="space-y-8">
			<DashboardHeader icon={ArrowsLeftRightIcon} title={t`Transition Planner`} />

			<HeroSection
				onAddSkill={() => setShowSkillModal(true)}
				onAddPhase={() => setShowPhaseModal(true)}
				onAddAction={() => setShowActionModal(true)}
			/>

			<OverviewStats overview={overview} isLoading={isLoading} />

			{/* Main Tabs */}
			<Tabs value={activeTab} onValueChange={setActiveTab}>
				<TabsList className="mb-4">
					<TabsTrigger value="overview">
						<TrendUpIcon className="mr-2 size-4" />
						<Trans>Overview</Trans>
					</TabsTrigger>
					<TabsTrigger value="skills">
						<ChartLineUpIcon className="mr-2 size-4" />
						<Trans>Skills</Trans>
					</TabsTrigger>
					<TabsTrigger value="timeline">
						<CalendarIcon className="mr-2 size-4" />
						<Trans>Timeline</Trans>
					</TabsTrigger>
					<TabsTrigger value="actions">
						<ListChecksIcon className="mr-2 size-4" />
						<Trans>Actions</Trans>
					</TabsTrigger>
				</TabsList>

				<TabsContent value="overview">
					<OverviewTabContent
						skillCategories={SKILL_CATEGORIES}
						actionCategories={ACTION_CATEGORIES}
						priorities={PRIORITIES}
						skillsByCategory={skillsByCategory}
						upcomingActions={upcomingActions}
						timeline={timeline}
						onSetTab={setActiveTab}
						onAddAction={() => setShowActionModal(true)}
						onAddPhase={() => setShowPhaseModal(true)}
					/>
				</TabsContent>

				<TabsContent value="skills">
					<SkillsTabContent
						skillCategories={SKILL_CATEGORIES}
						skillsByCategory={skillsByCategory}
						skills={skills}
						skillsLoading={skillsLoading}
						onAddSkill={() => setShowSkillModal(true)}
						onEditSkill={handleEditSkill}
						onDeleteSkill={(id) => deleteSkillMutation.mutate({ id })}
					/>
				</TabsContent>

				<TabsContent value="timeline">
					<TimelineTabContent
						timeline={timeline}
						timelineLoading={timelineLoading}
						onAddPhase={() => setShowPhaseModal(true)}
						onEditPhase={handleEditPhase}
						onTogglePhase={(id) => togglePhaseMutation.mutate({ id })}
						onDeletePhase={(id) => deletePhaseMutation.mutate({ id })}
					/>
				</TabsContent>

				<TabsContent value="actions">
					<ActionsTabContent
						actionCategories={ACTION_CATEGORIES}
						priorities={PRIORITIES}
						actions={actions}
						actionsLoading={actionsLoading}
						actionStats={actionStats}
						onAddAction={() => setShowActionModal(true)}
						onEditAction={handleEditAction}
						onToggleAction={(id) => toggleActionMutation.mutate({ id })}
						onDeleteAction={(id) => deleteActionMutation.mutate({ id })}
					/>
				</TabsContent>
			</Tabs>

			<SkillModal
				open={showSkillModal}
				onOpenChange={(open) => {
					setShowSkillModal(open);
					if (!open) {
						setEditingSkill(null);
						resetSkillForm();
					}
				}}
				editing={!!editingSkill}
				form={skillForm}
				setForm={setSkillForm}
				skillCategories={SKILL_CATEGORIES}
				onSubmit={handleSkillSubmit}
				isPending={createSkillMutation.isPending || updateSkillMutation.isPending}
			/>

			<PhaseModal
				open={showPhaseModal}
				onOpenChange={(open) => {
					setShowPhaseModal(open);
					if (!open) {
						setEditingPhase(null);
						resetPhaseForm();
					}
				}}
				editing={!!editingPhase}
				form={phaseForm}
				setForm={setPhaseForm}
				onSubmit={handlePhaseSubmit}
				isPending={createPhaseMutation.isPending || updatePhaseMutation.isPending}
			/>

			<ActionModal
				open={showActionModal}
				onOpenChange={(open) => {
					setShowActionModal(open);
					if (!open) {
						setEditingAction(null);
						resetActionForm();
					}
				}}
				editing={!!editingAction}
				form={actionForm}
				setForm={setActionForm}
				actionCategories={ACTION_CATEGORIES}
				priorities={PRIORITIES}
				onSubmit={handleActionSubmit}
				isPending={createActionMutation.isPending || updateActionMutation.isPending}
			/>
		</div>
	);
}
