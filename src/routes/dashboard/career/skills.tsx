import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import type { Icon } from "@phosphor-icons/react";
import {
	ChartBarIcon,
	GearIcon,
	HeartIcon,
	LightbulbIcon,
	ListChecksIcon,
	PlusCircleIcon,
	ShieldCheckIcon,
	StarIcon,
	TargetIcon,
	WrenchIcon,
} from "@phosphor-icons/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense, useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import { ErrorComponent } from "@/components/error-component";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { authClient } from "@/integrations/auth/client";
import { orpc } from "@/integrations/orpc/client";
import { DashboardHeader } from "../-components/header";
import {
	DashboardTab,
	GoalsTab,
	HeroSection,
	RecommendationsTab,
	SkillsErrorState,
	SkillsLoadingSkeleton,
	SkillsTab,
} from "./-components/skills-components";
import { calculateOverallProgress, getSkillGapAnalysis } from "./-components/skills-config";
import type { CareerPath, DbSkill, SkillCategory } from "./-components/skills-types";

// Lazy load the skills tracker component
const SkillsTrackerLazy = lazy(() => Promise.resolve({ default: SkillsTracker }));

// biome-ignore lint/suspicious/noExplicitAny: Route path not in generated route tree
export const Route = createFileRoute("/dashboard/career/skills" as any)({
	component: () => (
		<Suspense
			fallback={
				<div className="flex items-center justify-center p-8">
					<Trans>Loading skills tracker...</Trans>
				</div>
			}
		>
			<SkillsTrackerLazy />
		</Suspense>
	),
	errorComponent: ErrorComponent,
});

// No hardcoded recommended skills - data comes from database via orpc.skillLibrary.list
// No hardcoded career paths - data comes from database via orpc.careerRole.list + orpc.careerRole.getRoleWithSkills

// Main component
function SkillsTracker() {
	const { data: session } = authClient.useSession();
	const queryClient = useQueryClient();
	const [activeTab, setActiveTab] = useState("dashboard");
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedCategory, setSelectedCategory] = useState<SkillCategory | "all">("all");
	const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
	const [selectedField, setSelectedField] = useState<string>("healthcare");

	// New skill form state
	const [newSkillName, setNewSkillName] = useState("");
	const [newSkillNameFr, setNewSkillNameFr] = useState("");
	const [newSkillCategory, setNewSkillCategory] = useState<SkillCategory>("technical");
	const [newSkillRating, setNewSkillRating] = useState(1);
	const [newSkillTarget, setNewSkillTarget] = useState(5);

	// Fetch skills from database
	const {
		data: skills = [],
		isLoading: isLoadingSkills,
		error: skillsError,
	} = useQuery({ ...orpc.career.userSkills.list.queryOptions({}), enabled: !!session?.user });

	// Fetch skills data (career path)
	const { data: skillsData } = useQuery({
		...orpc.career.userSkills.getSkillsData.queryOptions(),
		enabled: !!session?.user,
	});

	// Fetch statistics
	const { data: statistics } = useQuery({
		...orpc.career.userSkills.getStatistics.queryOptions(),
		enabled: !!session?.user,
	});

	// Fetch recommended skills from database
	const { data: dbSkillLibrary } = useQuery({
		...orpc.skillLibrary.list.queryOptions({
			input: { field: selectedField, activeOnly: true, recommendedOnly: true },
		}),
		enabled: !!session?.user,
	});

	// Fetch career roles from database for career path analysis
	const { data: dbCareerRoles } = useQuery({
		...orpc.careerRole.list.queryOptions({ input: { activeOnly: true } }),
		enabled: !!session?.user,
	});

	// Transform database career roles into CareerPath objects
	const careerPaths = useMemo((): CareerPath[] => {
		if (!dbCareerRoles || dbCareerRoles.length === 0) return [];
		const fieldIconMap: Record<string, Icon> = {
			healthcare: HeartIcon,
			industrial: WrenchIcon,
			hse: ShieldCheckIcon,
		};
		return dbCareerRoles.map((role) => ({
			id: role.id,
			name: role.role,
			nameFr: role.roleFr || role.role,
			field: role.field as CareerPath["field"],
			icon: fieldIconMap[role.field] || GearIcon,
			requiredSkills: [], // Skills loaded on demand via getRoleWithSkills
		}));
	}, [dbCareerRoles]);

	// Mutations
	const createMutation = useMutation({
		...orpc.career.userSkills.create.mutationOptions(),
		onMutate: async (newSkill) => {
			await queryClient.cancelQueries({ queryKey: ["career", "userSkills"] });
			const previousSkills = queryClient.getQueryData(orpc.career.userSkills.list.key({}));

			queryClient.setQueryData(orpc.career.userSkills.list.key({}), (old: DbSkill[] | undefined) => {
				if (!old) return old;
				const optimisticSkill: DbSkill = {
					id: `temp-${Date.now()}`,
					userId: "",
					name: newSkill.name,
					nameFr: newSkill.nameFr,
					category: newSkill.category,
					rating: newSkill.rating ?? 0,
					targetRating: newSkill.targetRating ?? 0,
					progress: [],
					createdAt: new Date(),
					updatedAt: new Date(),
				};
				return [optimisticSkill, ...old];
			});

			setIsAddDialogOpen(false);
			return { previousSkills };
		},
		onSuccess: () => {
			toast.success(t`Skill added successfully`);
		},
		onError: (error, _newSkill, context) => {
			if (context?.previousSkills) {
				queryClient.setQueryData(orpc.career.userSkills.list.key({}), context.previousSkills);
			}
			toast.error(error.message || t`Failed to add skill`);
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: ["career", "userSkills"] });
		},
	});

	const updateRatingMutation = useMutation(
		orpc.career.userSkills.updateRating.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries({ queryKey: ["career", "userSkills"] });
				toast.success(t`Skill rating updated`);
			},
			onError: (error) => {
				toast.error(error.message || t`Failed to update rating`);
			},
		}),
	);

	const updateTargetMutation = useMutation(
		orpc.career.userSkills.updateTarget.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries({ queryKey: ["career", "userSkills"] });
				toast.success(t`Target updated successfully`);
			},
			onError: (error) => {
				toast.error(error.message || t`Failed to update target`);
			},
		}),
	);

	const deleteMutation = useMutation(
		orpc.career.userSkills.delete.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries({ queryKey: ["career", "userSkills"] });
				toast.success(t`Skill deleted successfully`);
			},
			onError: (error) => {
				toast.error(error.message || t`Failed to delete skill`);
			},
		}),
	);

	const updateCareerPathMutation = useMutation(
		orpc.career.userSkills.updateCareerPath.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries({ queryKey: ["career", "userSkills"] });
				toast.success(t`Career path updated successfully`);
			},
			onError: (error) => {
				toast.error(error.message || t`Failed to update career path`);
			},
		}),
	);

	// Callbacks
	const handleAddSkill = useCallback(() => {
		if (!newSkillName.trim()) return;

		createMutation.mutate({
			name: newSkillName.trim(),
			nameFr: newSkillNameFr.trim() || newSkillName.trim(),
			category: newSkillCategory,
			rating: newSkillRating,
			targetRating: newSkillTarget,
		});

		setNewSkillName("");
		setNewSkillNameFr("");
		setNewSkillCategory("technical");
		setNewSkillRating(1);
		setNewSkillTarget(5);
		setIsAddDialogOpen(false);
	}, [newSkillName, newSkillNameFr, newSkillCategory, newSkillRating, newSkillTarget, createMutation]);

	const handleUpdateRating = useCallback(
		(skillId: string, newRating: number) => {
			updateRatingMutation.mutate({ id: skillId, rating: newRating });
		},
		[updateRatingMutation],
	);

	const handleUpdateTarget = useCallback(
		(skillId: string, newTarget: number) => {
			updateTargetMutation.mutate({ id: skillId, targetRating: newTarget });
		},
		[updateTargetMutation],
	);

	const handleDeleteSkill = useCallback(
		(skillId: string) => {
			deleteMutation.mutate({ id: skillId });
		},
		[deleteMutation],
	);

	const handleAddRecommendedSkill = useCallback(
		(skill: { name: string; nameFr: string; category: SkillCategory }) => {
			const exists = skills.some(
				(s) =>
					s.name.toLowerCase() === skill.name.toLowerCase() || s.nameFr.toLowerCase() === skill.nameFr.toLowerCase(),
			);
			if (exists) return;

			createMutation.mutate({
				name: skill.name,
				nameFr: skill.nameFr,
				category: skill.category,
				rating: 1,
				targetRating: 5,
			});
		},
		[skills, createMutation],
	);

	const handleSetCareerPath = useCallback(
		(pathId: string) => {
			updateCareerPathMutation.mutate({ careerPathId: pathId });
		},
		[updateCareerPathMutation],
	);

	const handleExportSkills = useCallback(() => {
		const exportData = {
			skills: skills.map((s) => ({
				name: s.name,
				nameFr: s.nameFr,
				level: s.rating,
				category: s.category,
			})),
			exportedAt: new Date().toISOString(),
		};

		const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = "imta-skills-export.json";
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
	}, [skills]);

	// Computed values
	const filteredSkills = useMemo(() => {
		return skills.filter((skill) => {
			const matchesSearch =
				skill.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
				skill.nameFr.toLowerCase().includes(searchQuery.toLowerCase());
			const matchesCategory = selectedCategory === "all" || skill.category === selectedCategory;
			return matchesSearch && matchesCategory;
		});
	}, [skills, searchQuery, selectedCategory]);

	const skillsByCategory = useMemo(() => {
		const result: Record<SkillCategory, DbSkill[]> = {
			technical: [],
			soft: [],
			languages: [],
			certifications: [],
		};
		for (const skill of filteredSkills) {
			result[skill.category].push(skill);
		}
		return result;
	}, [filteredSkills]);

	const overallProgress = useMemo(
		() => statistics?.overallProgress ?? calculateOverallProgress(skills),
		[skills, statistics],
	);

	const selectedCareerPath = skillsData?.selectedCareerPath ?? null;
	const careerPathAnalysis = useMemo(() => {
		if (!selectedCareerPath) return null;
		const path = careerPaths.find((p) => p.id === selectedCareerPath);
		if (!path) return null;
		return { path, analysis: getSkillGapAnalysis(skills, path) };
	}, [skills, selectedCareerPath, careerPaths.find]);

	const recommendedSkillsForField = useMemo(() => {
		if (!dbSkillLibrary || dbSkillLibrary.length === 0) return [];
		const recommendations = dbSkillLibrary.map((s) => ({
			name: s.name,
			nameFr: s.nameFr,
			category: s.category as SkillCategory,
		}));
		return recommendations.filter(
			(rec) =>
				!skills.some(
					(s) => s.name.toLowerCase() === rec.name.toLowerCase() || s.nameFr.toLowerCase() === rec.nameFr.toLowerCase(),
				),
		);
	}, [skills, dbSkillLibrary]);

	const goalsReached = statistics?.goalsReached ?? skills.filter((s) => s.rating >= s.targetRating).length;

	// Loading state
	if (isLoadingSkills) {
		return (
			<>
				<DashboardHeader icon={ChartBarIcon} title={t`Skills Tracking`} />
				<SkillsLoadingSkeleton />
			</>
		);
	}

	// Error state
	if (skillsError) {
		return (
			<>
				<DashboardHeader icon={ChartBarIcon} title={t`Skills Tracking`} />
				<SkillsErrorState />
			</>
		);
	}

	return (
		<>
			<DashboardHeader icon={ChartBarIcon} title={t`Skills Tracking`} />

			{/* Empty state when user has zero skills */}
			{skills.length === 0 && (
				<Card className="mb-8 border-dashed">
					<CardContent className="flex flex-col items-center py-16 text-center">
						<StarIcon className="mb-4 size-14 text-amber-500" weight="duotone" />
						<h3 className="mb-2 font-semibold text-xl">
							<Trans>Start tracking your skills</Trans>
						</h3>
						<p className="mb-6 max-w-md text-muted-foreground">
							<Trans>
								Track your technical and soft skills, set improvement goals, and visualize your growth over time. Add
								your first skill to get started!
							</Trans>
						</p>
						<Button onClick={() => setIsAddDialogOpen(true)} className="gap-2">
							<PlusCircleIcon className="size-4" />
							<Trans>Add your first skill</Trans>
						</Button>
					</CardContent>
				</Card>
			)}

			<HeroSection skillsCount={skills.length} overallProgress={overallProgress} goalsReached={goalsReached} />

			<Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
				<TabsList className="flex h-auto flex-wrap gap-2 bg-transparent p-0">
					{[
						{ value: "dashboard", icon: ChartBarIcon, label: t`Dashboard` },
						{ value: "skills", icon: ListChecksIcon, label: t`My Skills` },
						{ value: "goals", icon: TargetIcon, label: t`Goals` },
						{ value: "recommendations", icon: LightbulbIcon, label: t`Recommendations` },
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

				<TabsContent value="dashboard">
					<DashboardTab
						skills={skills}
						overallProgress={overallProgress}
						statistics={statistics}
						careerPaths={careerPaths}
						selectedCareerPath={selectedCareerPath}
						careerPathAnalysis={careerPathAnalysis}
						onSetCareerPath={handleSetCareerPath}
						onAddRecommendedSkill={handleAddRecommendedSkill}
					/>
				</TabsContent>

				<TabsContent value="skills">
					<SkillsTab
						filteredSkills={filteredSkills}
						skillsByCategory={skillsByCategory}
						searchQuery={searchQuery}
						selectedCategory={selectedCategory}
						isAddDialogOpen={isAddDialogOpen}
						newSkillName={newSkillName}
						newSkillNameFr={newSkillNameFr}
						newSkillCategory={newSkillCategory}
						newSkillRating={newSkillRating}
						newSkillTarget={newSkillTarget}
						createMutationPending={createMutation.isPending}
						onSearchChange={setSearchQuery}
						onCategoryChange={setSelectedCategory}
						onAddDialogOpenChange={setIsAddDialogOpen}
						onNewSkillNameChange={setNewSkillName}
						onNewSkillNameFrChange={setNewSkillNameFr}
						onNewSkillCategoryChange={setNewSkillCategory}
						onNewSkillRatingChange={setNewSkillRating}
						onNewSkillTargetChange={setNewSkillTarget}
						onAddSkill={handleAddSkill}
						onUpdateRating={handleUpdateRating}
						onUpdateTarget={handleUpdateTarget}
						onDeleteSkill={handleDeleteSkill}
						onExportSkills={handleExportSkills}
					/>
				</TabsContent>

				<TabsContent value="goals">
					<GoalsTab skills={skills} overallProgress={overallProgress} statistics={statistics} />
				</TabsContent>

				<TabsContent value="recommendations">
					<RecommendationsTab
						skills={skills}
						selectedField={selectedField}
						recommendedSkillsForField={recommendedSkillsForField}
						careerPaths={careerPaths}
						selectedCareerPath={selectedCareerPath}
						onFieldChange={setSelectedField}
						onAddRecommendedSkill={handleAddRecommendedSkill}
						onSetCareerPath={handleSetCareerPath}
					/>
				</TabsContent>
			</Tabs>
		</>
	);
}
