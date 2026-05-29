import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import {
	BookOpenIcon,
	BriefcaseIcon,
	ChartBarIcon,
	ChartPieSliceIcon,
	ListChecksIcon,
	PathIcon,
	TargetIcon,
	TrendUpIcon,
	WarningCircleIcon,
} from "@phosphor-icons/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useMemo, useState } from "react";
import { ErrorComponent } from "@/components/error-component";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { authClient } from "@/integrations/auth/client";
import { orpc } from "@/integrations/orpc/client";
import { DashboardHeader } from "../-components/header";
import {
	AddSkillDialog,
	GapSummaryCategories,
	HeroSection,
	IndustryBenchmarks,
	LearningPathsContent,
	MetricsCards,
	PrioritySkills,
	ProgressTabContent,
	QuickActions,
	QuickAddSkills,
	ResourcesDialog,
	ResourcesTabContent,
	SearchFilterBar,
	SkillsGrid,
	SkillsRadarSection,
	StudyPlanCTA,
	TargetRoleSelection,
} from "./-components/gap-analysis-components";
import {
	calculateGapSize,
	calculatePriority,
	estimateTimeToClose,
	getDefaultGapAnalysisData,
	getResourcesForSkill,
} from "./-components/gap-analysis-config";
import type { GapAnalysisData, SkillCategory, SkillGap, TargetRole } from "./-components/gap-analysis-types";

// biome-ignore lint/suspicious/noExplicitAny: Route path not in generated route tree
export const Route = createFileRoute("/dashboard/career/gap-analysis" as any)({
	component: SkillsGapAnalyzer,
	errorComponent: ErrorComponent,
});

// Main component
function SkillsGapAnalyzer() {
	const { data: session } = authClient.useSession();
	const queryClient = useQueryClient();
	const [activeTab, setActiveTab] = useState("overview");
	const [isAddSkillDialogOpen, setIsAddSkillDialogOpen] = useState(false);
	const [selectedGap, setSelectedGap] = useState<SkillGap | null>(null);
	const [isResourcesDialogOpen, setIsResourcesDialogOpen] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");
	const [filterCategory, setFilterCategory] = useState<SkillCategory | "all">("all");

	// New skill form state
	const [newSkillName, setNewSkillName] = useState("");
	const [newSkillNameFr, setNewSkillNameFr] = useState("");
	const [newSkillCategory, setNewSkillCategory] = useState<SkillCategory>("technical");
	const [newSkillLevel, setNewSkillLevel] = useState(1);
	const [newSkillYears, setNewSkillYears] = useState(0);
	const [newSkillNotes, setNewSkillNotes] = useState("");

	// Load data from database
	const {
		data: dbData,
		isLoading,
		error,
	} = useQuery({ ...orpc.career.gapAnalysis.get.queryOptions(), enabled: !!session?.user });

	// Mutations for updating data
	const addSkillMutation = useMutation(
		orpc.career.gapAnalysis.addSkill.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries({ queryKey: ["career", "gapAnalysis"] });
			},
		}),
	);

	const updateSkillLevelMutation = useMutation(
		orpc.career.gapAnalysis.updateSkillLevel.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries({ queryKey: ["career", "gapAnalysis"] });
			},
		}),
	);

	const deleteSkillMutation = useMutation(
		orpc.career.gapAnalysis.deleteSkill.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries({ queryKey: ["career", "gapAnalysis"] });
			},
		}),
	);

	const selectRoleMutation = useMutation(
		orpc.career.gapAnalysis.selectRole.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries({ queryKey: ["career", "gapAnalysis"] });
			},
		}),
	);

	const recordExportMutation = useMutation(
		orpc.career.gapAnalysis.recordExport.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries({ queryKey: ["career", "gapAnalysis"] });
			},
		}),
	);

	// Learning path queries and mutations
	const { data: learningPaths, isLoading: learningPathsLoading } = useQuery({
		...orpc.learningPath.list.queryOptions(),
		enabled: !!session?.user,
	});

	const generateLearningPathMutation = useMutation(
		orpc.learningPath.generate.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries({ queryKey: ["learningPath"] });
			},
		}),
	);

	const startLearningPathMutation = useMutation(
		orpc.learningPath.start.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries({ queryKey: ["learningPath"] });
			},
		}),
	);

	const completeMilestoneMutation = useMutation(
		orpc.learningPath.completeMilestone.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries({ queryKey: ["learningPath"] });
			},
		}),
	);

	const deleteLearningPathMutation = useMutation(
		orpc.learningPath.delete.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries({ queryKey: ["learningPath"] });
			},
		}),
	);

	// State for AI generation
	const [isGeneratingPath, setIsGeneratingPath] = useState(false);
	const [weeklyHours, setWeeklyHours] = useState(10);

	// Convert database data to local format
	const gapData: GapAnalysisData = useMemo(() => {
		if (!dbData) {
			return getDefaultGapAnalysisData();
		}
		return {
			currentSkills: dbData.currentSkills,
			selectedRoleId: dbData.selectedRoleId,
			progressRecords: dbData.progressRecords,
			weeklyGoalHours: dbData.weeklyGoalHours,
			lastAnalysisDate: dbData.lastAnalysisDate.toISOString(),
			exportHistory: dbData.exportHistory,
		};
	}, [dbData]);

	// Load target roles from database
	const { data: dbRoles, isLoading: rolesLoading } = useQuery({
		...orpc.careerRole.listWithSkillCount.queryOptions({ input: { activeOnly: true } }),
		enabled: !!session?.user,
	});

	// Load selected role with skills from database
	const { data: selectedRoleData } = useQuery({
		...orpc.careerRole.getRoleWithSkills.queryOptions({ input: { roleId: gapData.selectedRoleId ?? "" } }),
		enabled: !!session?.user && !!gapData.selectedRoleId,
	});

	// Convert database roles to TargetRole format for the UI
	const targetRoles: TargetRole[] = useMemo(() => {
		if (!dbRoles) return [];
		return dbRoles.map((role) => ({
			id: role.id,
			name: role.role,
			nameFr: role.roleFr ?? role.role,
			industry: (role.field as TargetRole["industry"]) || "general",
			description: role.description ?? "",
			salaryRange: { min: role.salaryMin ?? 0, max: role.salaryMax ?? 0 },
			demandLevel: (role.demandLevel as "high" | "medium" | "low") ?? "medium",
			requiredSkills: [], // Skills loaded separately when role is selected
		}));
	}, [dbRoles]);

	// Get selected role with full skills data
	const selectedRole: TargetRole | undefined = useMemo(() => {
		if (!selectedRoleData) return undefined;
		return {
			id: selectedRoleData.id,
			name: selectedRoleData.role,
			nameFr: selectedRoleData.roleFr ?? selectedRoleData.role,
			industry: (selectedRoleData.field as TargetRole["industry"]) || "general",
			description: selectedRoleData.description ?? "",
			salaryRange: { min: selectedRoleData.salaryMin ?? 0, max: selectedRoleData.salaryMax ?? 0 },
			demandLevel: (selectedRoleData.demandLevel as "high" | "medium" | "low") ?? "medium",
			requiredSkills: selectedRoleData.skills.map((skill) => ({
				name: skill.skillName,
				nameFr: skill.skillNameFr ?? skill.skillName,
				category: (skill.category as SkillCategory) ?? "technical",
				requiredLevel: skill.requiredLevel ?? 3,
				importance: (skill.importance as "critical" | "important" | "nice-to-have") ?? "important",
				industryBenchmark: Number.parseFloat(skill.industryBenchmark ?? "3.0"),
			})),
		};
	}, [selectedRoleData]);

	// Calculate skill gaps
	const skillGaps = useMemo((): SkillGap[] => {
		if (!selectedRole) return [];

		return selectedRole.requiredSkills
			.map((required) => {
				const currentSkill = gapData.currentSkills.find(
					(s) =>
						s.name.toLowerCase() === required.name.toLowerCase() ||
						s.nameFr.toLowerCase() === required.nameFr.toLowerCase(),
				);

				const currentLevel = currentSkill?.currentLevel || 0;
				const gapSize = calculateGapSize(currentLevel, required.requiredLevel);
				const priority = calculatePriority(gapSize, required.importance);
				const timeToClose = estimateTimeToClose(gapSize, required.category);
				const resources = getResourcesForSkill(required.name);

				return {
					skillName: required.name,
					skillNameFr: required.nameFr,
					category: required.category,
					currentLevel,
					requiredLevel: required.requiredLevel,
					industryBenchmark: required.industryBenchmark,
					gapSize,
					priority,
					importance: required.importance,
					timeToClose,
					learningResources: resources,
				};
			})
			.sort((a, b) => b.priority - a.priority);
	}, [selectedRole, gapData.currentSkills]);

	// Filter gaps
	const filteredGaps = useMemo(() => {
		return skillGaps.filter((gap) => {
			const matchesSearch =
				gap.skillNameFr.toLowerCase().includes(searchQuery.toLowerCase()) ||
				gap.skillName.toLowerCase().includes(searchQuery.toLowerCase());
			const matchesCategory = filterCategory === "all" || gap.category === filterCategory;
			return matchesSearch && matchesCategory;
		});
	}, [skillGaps, searchQuery, filterCategory]);

	// Calculate overall metrics
	const overallMetrics = useMemo(() => {
		if (skillGaps.length === 0) {
			return { readinessScore: 0, totalGaps: 0, criticalGaps: 0, estimatedWeeks: 0, skillsCovered: 0 };
		}

		const totalRequired = skillGaps.reduce((sum, g) => sum + g.requiredLevel, 0);
		const totalCurrent = skillGaps.reduce((sum, g) => sum + g.currentLevel, 0);
		const readinessScore = Math.round((totalCurrent / totalRequired) * 100);
		const totalGaps = skillGaps.filter((g) => g.gapSize > 0).length;
		const criticalGaps = skillGaps.filter((g) => g.gapSize > 0 && g.importance === "critical").length;
		const estimatedWeeks = Math.max(...skillGaps.map((g) => g.timeToClose), 0);
		const skillsCovered = skillGaps.filter((g) => g.currentLevel >= g.requiredLevel).length;

		return { readinessScore, totalGaps, criticalGaps, estimatedWeeks, skillsCovered };
	}, [skillGaps]);

	// Add new skill
	const handleAddSkill = useCallback(() => {
		if (!newSkillName.trim()) return;

		addSkillMutation.mutate({
			name: newSkillName.trim(),
			nameFr: newSkillNameFr.trim() || newSkillName.trim(),
			category: newSkillCategory,
			currentLevel: newSkillLevel,
			yearsExperience: newSkillYears,
			notes: newSkillNotes,
		});

		// Reset form
		setNewSkillName("");
		setNewSkillNameFr("");
		setNewSkillCategory("technical");
		setNewSkillLevel(1);
		setNewSkillYears(0);
		setNewSkillNotes("");
		setIsAddSkillDialogOpen(false);
	}, [newSkillName, newSkillNameFr, newSkillCategory, newSkillLevel, newSkillYears, newSkillNotes, addSkillMutation]);

	// Update skill level
	const handleUpdateSkillLevel = useCallback(
		(skillId: string, newLevel: number) => {
			updateSkillLevelMutation.mutate({
				skillId,
				newLevel,
			});
		},
		[updateSkillLevelMutation],
	);

	// Delete skill
	const handleDeleteSkill = useCallback(
		(skillId: string) => {
			deleteSkillMutation.mutate({ skillId });
		},
		[deleteSkillMutation],
	);

	// Select target role
	const handleSelectRole = useCallback(
		(roleId: string) => {
			selectRoleMutation.mutate({ roleId });
		},
		[selectRoleMutation],
	);

	// Export gap analysis report
	const handleExportReport = useCallback(() => {
		if (!selectedRole) return;

		const report = {
			generatedAt: new Date().toISOString(),
			targetRole: {
				name: selectedRole.name,
				nameFr: selectedRole.nameFr,
				industry: selectedRole.industry,
			},
			overallMetrics,
			skillGaps: skillGaps.map((g) => ({
				skill: g.skillNameFr,
				currentLevel: g.currentLevel,
				requiredLevel: g.requiredLevel,
				gap: g.gapSize,
				importance: g.importance,
				estimatedWeeks: g.timeToClose,
			})),
			currentSkills: gapData.currentSkills.map((s) => ({
				name: s.nameFr,
				category: s.category,
				level: s.currentLevel,
			})),
			recommendations: skillGaps
				.filter((g) => g.gapSize > 0)
				.slice(0, 5)
				.map((g) => ({
					skill: g.skillNameFr,
					resources: g.learningResources.slice(0, 2).map((r) => r.titleFr),
				})),
		};

		const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = `gap-analysis-${selectedRole.id}-${new Date().toISOString().split("T")[0]}.json`;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);

		// Record the export in the database
		recordExportMutation.mutate({ format: "json" });
	}, [selectedRole, overallMetrics, skillGaps, gapData.currentSkills, recordExportMutation]);

	// Generate AI learning path
	const handleGenerateLearningPath = useCallback(async () => {
		if (!gapData.selectedRoleId) return;

		setIsGeneratingPath(true);
		try {
			await generateLearningPathMutation.mutateAsync({
				targetRoleId: gapData.selectedRoleId,
				weeklyHours: weeklyHours,
			});
			setActiveTab("learningPaths");
		} catch (error) {
			console.error("Failed to generate learning path:", error);
		} finally {
			setIsGeneratingPath(false);
		}
	}, [gapData.selectedRoleId, weeklyHours, generateLearningPathMutation]);

	// Start learning path
	const handleStartLearningPath = useCallback(
		(pathId: string) => {
			startLearningPathMutation.mutate({ id: pathId });
		},
		[startLearningPathMutation],
	);

	// Complete milestone
	const handleCompleteMilestone = useCallback(
		(pathId: string, milestoneId: string) => {
			completeMilestoneMutation.mutate({ pathId, milestoneId });
		},
		[completeMilestoneMutation],
	);

	// Delete learning path
	const handleDeleteLearningPath = useCallback(
		(pathId: string) => {
			deleteLearningPathMutation.mutate({ id: pathId });
		},
		[deleteLearningPathMutation],
	);

	// Add required skill from gap
	const handleAddRequiredSkill = useCallback(
		(gap: SkillGap) => {
			const exists = gapData.currentSkills.some(
				(s) =>
					s.name.toLowerCase() === gap.skillName.toLowerCase() ||
					s.nameFr.toLowerCase() === gap.skillNameFr.toLowerCase(),
			);

			if (exists) return;

			addSkillMutation.mutate({
				name: gap.skillName,
				nameFr: gap.skillNameFr,
				category: gap.category,
				currentLevel: 1,
				yearsExperience: 0,
				notes: "",
			});
		},
		[gapData.currentSkills, addSkillMutation],
	);

	// Show loading state
	if (isLoading) {
		return (
			<>
				<DashboardHeader icon={ChartPieSliceIcon} title={t`Skills Gap Analysis`} />
				<div className="flex items-center justify-center py-20">
					<div className="flex flex-col items-center gap-4">
						<div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
						<p className="text-muted-foreground">
							<Trans>Loading analysis...</Trans>
						</p>
					</div>
				</div>
			</>
		);
	}

	// Show error state
	if (error) {
		return (
			<>
				<DashboardHeader icon={ChartPieSliceIcon} title={t`Skills Gap Analysis`} />
				<div className="flex items-center justify-center py-20">
					<Card className="max-w-md">
						<CardHeader>
							<CardTitle className="flex items-center gap-2 text-destructive">
								<WarningCircleIcon className="size-5" />
								<Trans>Loading error</Trans>
							</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="text-muted-foreground">
								<Trans>An error occurred while loading your data. Please refresh the page or try again later.</Trans>
							</p>
						</CardContent>
						<CardFooter>
							<Button onClick={() => window.location.reload()}>
								<Trans>Refresh</Trans>
							</Button>
						</CardFooter>
					</Card>
				</div>
			</>
		);
	}

	return (
		<>
			<DashboardHeader icon={ChartPieSliceIcon} title={t`Skills Gap Analysis`} />

			{/* Hero Section */}
			<HeroSection overallMetrics={overallMetrics} />

			{/* Main Tabs */}
			<Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
				<TabsList className="flex h-auto flex-wrap gap-2 bg-transparent p-0">
					{[
						{ value: "overview", icon: ChartBarIcon, label: t`Overview` },
						{ value: "skills", icon: ListChecksIcon, label: t`My Skills` },
						{ value: "gaps", icon: TargetIcon, label: t`Gap Analysis` },
						{ value: "learningPaths", icon: PathIcon, label: t`AI Paths` },
						{ value: "resources", icon: BookOpenIcon, label: t`Resources` },
						{ value: "progress", icon: TrendUpIcon, label: t`Progress` },
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

				{/* Overview Tab */}
				<TabsContent value="overview" className="space-y-8">
					<TargetRoleSelection
						targetRoles={targetRoles}
						rolesLoading={rolesLoading}
						selectedRoleId={gapData.selectedRoleId}
						dbRoles={dbRoles}
						onSelectRole={handleSelectRole}
					/>

					{selectedRole && (
						<>
							<MetricsCards overallMetrics={overallMetrics} skillGapsLength={skillGaps.length} />

							<div className="grid gap-6 lg:grid-cols-2">
								<SkillsRadarSection skillGaps={skillGaps} />
								<PrioritySkills
									skillGaps={skillGaps}
									onViewResources={(gap) => {
										setSelectedGap(gap);
										setIsResourcesDialogOpen(true);
									}}
									onViewAllGaps={() => setActiveTab("gaps")}
								/>
							</div>

							{/* Quick Actions */}
							<QuickActions
								weeklyHours={weeklyHours}
								onWeeklyHoursChange={setWeeklyHours}
								onGenerateLearningPath={handleGenerateLearningPath}
								onExportReport={handleExportReport}
								isGeneratingPath={isGeneratingPath}
								hasSelectedRole={!!gapData.selectedRoleId}
							/>
						</>
					)}

					{!selectedRole && (
						<Card className="border-dashed">
							<CardContent className="flex flex-col items-center py-12 text-center">
								<BriefcaseIcon className="mb-4 size-12 text-muted-foreground/50" />
								<h3 className="mb-2 font-medium text-lg">
									<Trans>Select a Target Role</Trans>
								</h3>
								<p className="max-w-sm text-muted-foreground">
									<Trans>Choose the position you are targeting above to start the skills gap analysis.</Trans>
								</p>
							</CardContent>
						</Card>
					)}
				</TabsContent>

				{/* Skills Inventory Tab */}
				<TabsContent value="skills" className="space-y-8">
					<div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
						<SearchFilterBar
							searchQuery={searchQuery}
							onSearchQueryChange={setSearchQuery}
							filterCategory={filterCategory}
							onFilterCategoryChange={setFilterCategory}
						/>

						<AddSkillDialog
							isOpen={isAddSkillDialogOpen}
							onOpenChange={setIsAddSkillDialogOpen}
							newSkillName={newSkillName}
							onNewSkillNameChange={setNewSkillName}
							newSkillNameFr={newSkillNameFr}
							onNewSkillNameFrChange={setNewSkillNameFr}
							newSkillCategory={newSkillCategory}
							onNewSkillCategoryChange={setNewSkillCategory}
							newSkillLevel={newSkillLevel}
							onNewSkillLevelChange={setNewSkillLevel}
							newSkillYears={newSkillYears}
							onNewSkillYearsChange={setNewSkillYears}
							newSkillNotes={newSkillNotes}
							onNewSkillNotesChange={setNewSkillNotes}
							onSubmit={handleAddSkill}
						/>
					</div>

					<SkillsGrid
						currentSkills={gapData.currentSkills}
						searchQuery={searchQuery}
						filterCategory={filterCategory}
						onUpdateSkillLevel={handleUpdateSkillLevel}
						onDeleteSkill={handleDeleteSkill}
						onOpenAddDialog={() => setIsAddSkillDialogOpen(true)}
					/>

					{selectedRole && (
						<QuickAddSkills
							selectedRole={selectedRole}
							currentSkills={gapData.currentSkills}
							onAddRequiredSkill={handleAddRequiredSkill}
						/>
					)}
				</TabsContent>

				{/* Gap Analysis Tab */}
				<TabsContent value="gaps" className="space-y-8">
					{selectedRole ? (
						<>
							<IndustryBenchmarks
								filteredGaps={filteredGaps}
								onViewResources={(gap) => {
									setSelectedGap(gap);
									setIsResourcesDialogOpen(true);
								}}
							/>
							<GapSummaryCategories skillGaps={skillGaps} />
						</>
					) : (
						<Card className="border-dashed">
							<CardContent className="flex flex-col items-center py-12 text-center">
								<TargetIcon className="mb-4 size-12 text-muted-foreground/50" />
								<h3 className="mb-2 font-medium text-lg">
									<Trans>Select a Target Role</Trans>
								</h3>
								<p className="max-w-sm text-muted-foreground">
									<Trans>Go to the Overview tab to select a role and see the gap analysis.</Trans>
								</p>
							</CardContent>
						</Card>
					)}
				</TabsContent>

				{/* AI Learning Paths Tab */}
				<TabsContent value="learningPaths" className="space-y-8">
					<LearningPathsContent
						selectedRole={selectedRole}
						learningPaths={learningPaths}
						learningPathsLoading={learningPathsLoading}
						weeklyHours={weeklyHours}
						onWeeklyHoursChange={setWeeklyHours}
						onGenerateLearningPath={handleGenerateLearningPath}
						isGeneratingPath={isGeneratingPath}
						onStartLearningPath={handleStartLearningPath}
						onCompleteMilestone={handleCompleteMilestone}
						onDeleteLearningPath={handleDeleteLearningPath}
					/>
				</TabsContent>

				{/* Resources Tab */}
				<TabsContent value="resources" className="space-y-8">
					<ResourcesTabContent selectedRole={selectedRole} skillGaps={skillGaps} />
				</TabsContent>

				{/* Progress Tab */}
				<TabsContent value="progress" className="space-y-8">
					<ProgressTabContent gapData={gapData} />
					<StudyPlanCTA />
				</TabsContent>
			</Tabs>

			{/* Resources Dialog */}
			<ResourcesDialog
				isOpen={isResourcesDialogOpen}
				onOpenChange={setIsResourcesDialogOpen}
				selectedGap={selectedGap}
			/>
		</>
	);
}
