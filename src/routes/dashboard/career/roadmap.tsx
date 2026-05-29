import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import {
	ArrowsSplitIcon,
	ChartLineUpIcon,
	FloppyDiskIcon,
	MagicWandIcon,
	PathIcon,
	WarningCircleIcon,
} from "@phosphor-icons/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";
import { lazy, Suspense, useCallback, useMemo, useState } from "react";
import { ErrorComponent } from "@/components/error-component";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { authClient } from "@/integrations/auth/client";
import { orpc } from "@/integrations/orpc/client";
import { DashboardHeader } from "../-components/header";
import {
	CompareTabContent,
	CreateTabContent,
	dbRoadmapToSavedRoadmap,
	HeroSection,
	ProgressTabContent,
	SavedRoadmapsTabContent,
} from "./-components/roadmap-components";
import { generateId, getConstraints, getIndustries, getRoadmapPriorities } from "./-components/roadmap-config";
import { generateAIRoadmaps } from "./-components/roadmap-generator";
import type { AlternativePath, CareerGoal, DbRoadmap, RoadmapProgress } from "./-components/roadmap-types";

const CareerRoadmapGeneratorLazy = lazy(() => Promise.resolve({ default: CareerRoadmapGenerator }));

// biome-ignore lint/suspicious/noExplicitAny: Route path not in generated route tree
export const Route = createFileRoute("/dashboard/career/roadmap" as any)({
	component: () => (
		<Suspense
			fallback={
				<div className="flex items-center justify-center p-8">
					<Trans>Loading career roadmap...</Trans>
				</div>
			}
		>
			<CareerRoadmapGeneratorLazy />
		</Suspense>
	),
	errorComponent: ErrorComponent,
});

function CareerRoadmapGenerator() {
	const { data: session } = authClient.useSession();
	const queryClient = useQueryClient();
	const INDUSTRIES = getIndustries();
	const PRIORITIES = getRoadmapPriorities();
	const CONSTRAINTS = getConstraints();
	const [activeTab, setActiveTab] = useState("create");
	const [isGenerating, setIsGenerating] = useState(false);
	const [generatedPaths, setGeneratedPaths] = useState<AlternativePath[]>([]);
	const [expandedSteps, setExpandedSteps] = useState<Set<string>>(new Set());

	const [currentRole, setCurrentRole] = useState("");
	const [targetRole, setTargetRole] = useState("");
	const [industry, setIndustry] = useState("");
	const [yearsExperience, setYearsExperience] = useState([3]);
	const [timeline, setTimeline] = useState([12]);
	const [selectedPriorities, setSelectedPriorities] = useState<string[]>([]);
	const [selectedConstraints, setSelectedConstraints] = useState<string[]>([]);

	const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
	const [roadmapName, setRoadmapName] = useState("");

	const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
	const [shareCode, setShareCode] = useState("");

	const {
		data: savedRoadmaps = [],
		isLoading: isLoadingRoadmaps,
		error: roadmapsError,
		refetch: refetchRoadmaps,
	} = useQuery({ ...orpc.career.roadmaps.list.queryOptions(), enabled: !!session?.user });

	const { data: currentRoadmapData, isLoading: isLoadingCurrent } = useQuery({
		...orpc.career.roadmaps.getCurrent.queryOptions(),
		enabled: !!session?.user,
	});

	const roadmapData = useMemo(() => {
		const roadmaps = (savedRoadmaps as DbRoadmap[]).map(dbRoadmapToSavedRoadmap);
		const current = currentRoadmapData ? dbRoadmapToSavedRoadmap(currentRoadmapData as DbRoadmap) : null;
		return {
			savedRoadmaps: roadmaps,
			currentRoadmap: current,
		};
	}, [savedRoadmaps, currentRoadmapData]);

	useMemo(() => {
		if (roadmapData.currentRoadmap && activeTab === "create" && !isGenerating && generatedPaths.length === 0) {
			setActiveTab("progress");
		}
	}, [roadmapData.currentRoadmap, activeTab, isGenerating, generatedPaths.length]);

	const createMutation = useMutation(
		orpc.career.roadmaps.create.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries({ queryKey: ["career", "roadmaps"] });
				setIsSaveDialogOpen(false);
				setRoadmapName("");
				setActiveTab("progress");
			},
		}),
	);

	const updateMutation = useMutation(
		orpc.career.roadmaps.update.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries({ queryKey: ["career", "roadmaps"] });
			},
		}),
	);

	const toggleStepMutation = useMutation(
		orpc.career.roadmaps.toggleStepComplete.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries({ queryKey: ["career", "roadmaps"] });
			},
		}),
	);

	const shareMutation = useMutation(
		orpc.career.roadmaps.share.mutationOptions({
			onSuccess: (code) => {
				setShareCode(code);
				setIsShareDialogOpen(true);
				queryClient.invalidateQueries({ queryKey: ["career", "roadmaps"] });
			},
		}),
	);

	const deleteMutation = useMutation(
		orpc.career.roadmaps.delete.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries({ queryKey: ["career", "roadmaps"] });
				if (roadmapData.savedRoadmaps.length <= 1) {
					setActiveTab("create");
				}
			},
		}),
	);

	const handleGenerateRoadmap = useCallback(() => {
		if (!currentRole.trim() || !targetRole.trim() || !industry) return;

		setIsGenerating(true);

		setTimeout(() => {
			const goal: CareerGoal = {
				id: generateId(),
				currentRole: currentRole.trim(),
				targetRole: targetRole.trim(),
				industry,
				yearsExperience: yearsExperience[0],
				timeline: timeline[0],
				priorities: selectedPriorities,
				constraints: selectedConstraints,
				createdAt: new Date().toISOString(),
			};

			const paths = generateAIRoadmaps(goal);
			setGeneratedPaths(paths);
			setIsGenerating(false);
			setActiveTab("compare");
		}, 2000);
	}, [currentRole, targetRole, industry, yearsExperience, timeline, selectedPriorities, selectedConstraints]);

	const handleSelectPath = useCallback((pathId: string) => {
		setGeneratedPaths((prev) =>
			prev.map((p) => ({
				...p,
				isSelected: p.id === pathId,
			})),
		);
	}, []);

	const handleSaveRoadmap = useCallback(() => {
		if (!roadmapName.trim()) return;

		const selectedPath = generatedPaths.find((p) => p.isSelected);
		if (!selectedPath) return;

		const goal: CareerGoal = {
			id: generateId(),
			currentRole,
			targetRole,
			industry,
			yearsExperience: yearsExperience[0],
			timeline: timeline[0],
			priorities: selectedPriorities,
			constraints: selectedConstraints,
			createdAt: new Date().toISOString(),
		};

		const totalMilestones = selectedPath.steps.reduce((acc, s) => acc + s.milestones.length, 0);
		const totalSkills = selectedPath.steps.reduce((acc, s) => acc + s.skills.length, 0);

		const progress: RoadmapProgress = {
			overallProgress: 0,
			currentStepId: selectedPath.steps[0]?.id || null,
			completedSteps: 0,
			totalSteps: selectedPath.steps.length,
			completedMilestones: 0,
			totalMilestones,
			completedSkills: 0,
			totalSkills,
			startDate: new Date().toISOString(),
			estimatedCompletionDate: new Date(Date.now() + selectedPath.duration * 7 * 24 * 60 * 60 * 1000).toISOString(),
			actualProgress: 0,
			streakDays: 0,
			lastActivityDate: new Date().toISOString(),
		};

		createMutation.mutate({
			name: roadmapName.trim(),
			goal,
			selectedPath,
			progress,
			isShared: false,
		});
	}, [
		roadmapName,
		generatedPaths,
		currentRole,
		targetRole,
		industry,
		yearsExperience,
		timeline,
		selectedPriorities,
		selectedConstraints,
		createMutation,
	]);

	const handleToggleStepComplete = useCallback(
		(stepId: string) => {
			if (!roadmapData.currentRoadmap) return;

			toggleStepMutation.mutate({
				id: roadmapData.currentRoadmap.id,
				stepId,
			});
		},
		[roadmapData.currentRoadmap, toggleStepMutation],
	);

	const handleToggleExpand = useCallback((stepId: string) => {
		setExpandedSteps((prev) => {
			const newSet = new Set(prev);
			if (newSet.has(stepId)) {
				newSet.delete(stepId);
			} else {
				newSet.add(stepId);
			}
			return newSet;
		});
	}, []);

	const handleShareRoadmap = useCallback(() => {
		if (!roadmapData.currentRoadmap) return;

		shareMutation.mutate({ id: roadmapData.currentRoadmap.id });
	}, [roadmapData.currentRoadmap, shareMutation]);

	const handleExportRoadmap = useCallback(() => {
		if (!roadmapData.currentRoadmap) return;

		const blob = new Blob([JSON.stringify(roadmapData.currentRoadmap, null, 2)], {
			type: "application/json",
		});
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = `career-roadmap-${roadmapData.currentRoadmap.name.toLowerCase().replace(/\s+/g, "-")}.json`;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
	}, [roadmapData.currentRoadmap]);

	const handleLoadRoadmap = useCallback(
		(roadmapId: string) => {
			const roadmap = roadmapData.savedRoadmaps.find((r) => r.id === roadmapId);
			if (roadmap) {
				updateMutation.mutate({
					id: roadmapId,
					name: roadmap.name,
				});
				setActiveTab("progress");
			}
		},
		[roadmapData.savedRoadmaps, updateMutation],
	);

	const handleDeleteRoadmap = useCallback(
		(roadmapId: string) => {
			deleteMutation.mutate({ id: roadmapId });
		},
		[deleteMutation],
	);

	const handleResetForm = useCallback(() => {
		setCurrentRole("");
		setTargetRole("");
		setIndustry("");
		setYearsExperience([3]);
		setTimeline([12]);
		setSelectedPriorities([]);
		setSelectedConstraints([]);
		setGeneratedPaths([]);
	}, []);

	const selectedPath = useMemo(() => generatedPaths.find((p) => p.isSelected), [generatedPaths]);

	if (isLoadingRoadmaps || isLoadingCurrent) {
		return (
			<>
				<DashboardHeader icon={PathIcon} title={t`Career Roadmap Generator`} />
				<div className="flex items-center justify-center py-12">
					<motion.div
						animate={{ rotate: 360 }}
						transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
						className="size-8 rounded-full border-2 border-primary border-t-transparent"
					/>
				</div>
			</>
		);
	}

	if (roadmapsError) {
		return (
			<>
				<DashboardHeader icon={PathIcon} title={t`Career Roadmap Generator`} />
				<Card className="border-destructive">
					<CardContent className="flex flex-col items-center py-12 text-center">
						<WarningCircleIcon className="mb-4 size-12 text-destructive" />
						<h4 className="mb-2 font-medium text-lg">
							<Trans>Error Loading Roadmaps</Trans>
						</h4>
						<p className="mb-4 text-muted-foreground">
							<Trans>There was an error loading your roadmaps. Please try again later.</Trans>
						</p>
						<Button onClick={() => refetchRoadmaps()} variant="outline">
							<Trans>Retry</Trans>
						</Button>
					</CardContent>
				</Card>
			</>
		);
	}

	return (
		<>
			<DashboardHeader icon={PathIcon} title={t`Career Roadmap Generator`} />

			<HeroSection />

			<Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
				<TabsList className="flex h-auto flex-wrap gap-2 bg-transparent p-0">
					{[
						{ value: "create", icon: MagicWandIcon, label: t`Create Roadmap` },
						{ value: "compare", icon: ArrowsSplitIcon, label: t`Compare Paths`, disabled: generatedPaths.length === 0 },
						{ value: "progress", icon: ChartLineUpIcon, label: t`Progress`, disabled: !roadmapData.currentRoadmap },
						{ value: "saved", icon: FloppyDiskIcon, label: t`Saved Roadmaps` },
					].map((tab) => (
						<TabsTrigger
							key={tab.value}
							value={tab.value}
							disabled={tab.disabled}
							className="gap-2 rounded-full border border-transparent bg-muted/50 px-6 py-2.5 disabled:opacity-50 data-[state=active]:border-primary/30 data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
						>
							<tab.icon className="size-4" />
							{tab.label}
						</TabsTrigger>
					))}
				</TabsList>

				<TabsContent value="create" className="space-y-8">
					<CreateTabContent
						currentRole={currentRole}
						setCurrentRole={setCurrentRole}
						targetRole={targetRole}
						setTargetRole={setTargetRole}
						industry={industry}
						setIndustry={setIndustry}
						yearsExperience={yearsExperience}
						setYearsExperience={setYearsExperience}
						timeline={timeline}
						setTimeline={setTimeline}
						selectedPriorities={selectedPriorities}
						setSelectedPriorities={setSelectedPriorities}
						selectedConstraints={selectedConstraints}
						setSelectedConstraints={setSelectedConstraints}
						industries={INDUSTRIES}
						priorities={PRIORITIES}
						constraints={CONSTRAINTS}
						isGenerating={isGenerating}
						onGenerate={handleGenerateRoadmap}
						onReset={handleResetForm}
					/>
				</TabsContent>

				<TabsContent value="compare" className="space-y-8">
					<CompareTabContent
						generatedPaths={generatedPaths}
						selectedPath={selectedPath}
						expandedSteps={expandedSteps}
						isSaveDialogOpen={isSaveDialogOpen}
						setIsSaveDialogOpen={setIsSaveDialogOpen}
						roadmapName={roadmapName}
						setRoadmapName={setRoadmapName}
						isSaving={createMutation.isPending}
						onSelectPath={handleSelectPath}
						onToggleExpand={handleToggleExpand}
						onSaveRoadmap={handleSaveRoadmap}
					/>
				</TabsContent>

				<TabsContent value="progress" className="space-y-8">
					{roadmapData.currentRoadmap && (
						<ProgressTabContent
							currentRoadmap={roadmapData.currentRoadmap}
							expandedSteps={expandedSteps}
							isShareDialogOpen={isShareDialogOpen}
							setIsShareDialogOpen={setIsShareDialogOpen}
							shareCode={shareCode}
							isSharing={shareMutation.isPending}
							onToggleStepComplete={handleToggleStepComplete}
							onToggleExpand={handleToggleExpand}
							onShareRoadmap={handleShareRoadmap}
							onExportRoadmap={handleExportRoadmap}
						/>
					)}
				</TabsContent>

				<TabsContent value="saved" className="space-y-8">
					<SavedRoadmapsTabContent
						savedRoadmaps={roadmapData.savedRoadmaps}
						currentRoadmapId={roadmapData.currentRoadmap?.id}
						isUpdating={updateMutation.isPending}
						isDeleting={deleteMutation.isPending}
						onLoadRoadmap={handleLoadRoadmap}
						onDeleteRoadmap={handleDeleteRoadmap}
						onCreateNew={() => setActiveTab("create")}
					/>
				</TabsContent>
			</Tabs>
		</>
	);
}
