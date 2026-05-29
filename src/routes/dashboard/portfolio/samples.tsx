import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { FolderOpenIcon, WarningCircleIcon } from "@phosphor-icons/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useMemo, useState } from "react";
import { ErrorComponent } from "@/components/error-component";
import { Card } from "@/components/ui/card";
import { authClient } from "@/integrations/auth/client";
import { orpc } from "@/integrations/orpc/client";
import { DashboardHeader } from "../-components/header";
import {
	ActionsBar,
	AddProjectDialog,
	BeforeAfterTab,
	CaseStudiesTab,
	CaseStudyDetailDialog,
	GalleryTab,
	HeroSection,
	MainTabs,
	ProjectDetailDialog,
	ShowcaseTab,
	SkillsTab,
} from "./-components/samples-components";
import { getDefaultProjectForm } from "./-components/samples-config";
import type { CaseStudy, Project, ProjectType, SkillFilter } from "./-components/samples-types";

// biome-ignore lint/suspicious/noExplicitAny: Route path not in generated route tree
export const Route = createFileRoute("/dashboard/portfolio/samples" as any)({
	component: WorkSamplesPortfolio,
	errorComponent: ErrorComponent,
});

// Main Component
function WorkSamplesPortfolio() {
	const { data: session } = authClient.useSession();
	const queryClient = useQueryClient();
	const [activeTab, setActiveTab] = useState("showcase");
	const [selectedType, setSelectedType] = useState<ProjectType | "all">("all");
	const [selectedSkill, setSelectedSkill] = useState<string | null>(null);
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedProject, setSelectedProject] = useState<Project | null>(null);
	const [isProjectDialogOpen, setIsProjectDialogOpen] = useState(false);
	const [isAddProjectDialogOpen, setIsAddProjectDialogOpen] = useState(false);
	const [selectedCaseStudy, setSelectedCaseStudy] = useState<CaseStudy | null>(null);
	const [isCaseStudyDialogOpen, setIsCaseStudyDialogOpen] = useState(false);
	const [editingProject, setEditingProject] = useState<Project | null>(null);

	// Form state
	const [formData, setFormData] = useState(getDefaultProjectForm);

	// Fetch projects from database
	const {
		data: projects = [],
		isLoading,
		error,
	} = useQuery({
		...orpc.workSamples.listProjects.queryOptions({}),
		enabled: !!session?.user,
	});

	// Fetch case studies from database
	const { data: caseStudies = [] } = useQuery({
		...orpc.workSamples.listCaseStudies.queryOptions(),
		enabled: !!session?.user,
	});

	// Fetch statistics
	const { data: statistics } = useQuery({
		...orpc.workSamples.getStatistics.queryOptions(),
		enabled: !!session?.user,
	});

	// Create project mutation
	const createMutation = useMutation({
		...orpc.workSamples.createProject.mutationOptions(),
		onMutate: async (newProject) => {
			// Cancel outgoing refetches
			await queryClient.cancelQueries({ queryKey: ["workSamples"] });

			// Snapshot previous value
			const previousProjects = queryClient.getQueryData(orpc.workSamples.listProjects.key({}));

			// Optimistically update
			queryClient.setQueryData(orpc.workSamples.listProjects.key({}), (old: Project[] | undefined) => {
				if (!old) return old;
				const optimisticProject: Project = {
					id: `temp-${Date.now()}`,
					userId: "",
					title: newProject.title,
					description: newProject.description || "",
					longDescription: newProject.longDescription || "",
					role: newProject.role || "",
					type: newProject.type ?? "web",
					status: newProject.status ?? "completed",
					technologies: newProject.technologies || [],
					skills: newProject.skills || [],
					images: newProject.images || [],
					thumbnail: null,
					links: newProject.links || [],
					featured: newProject.featured || false,
					startDate: newProject.startDate || null,
					endDate: newProject.endDate || null,
					teamSize: newProject.teamSize || null,
					client: newProject.client || null,
					industry: newProject.industry || null,
					metrics: null,
					beforeAfter: null,
					createdAt: new Date(),
					updatedAt: new Date(),
				};
				return [optimisticProject, ...old];
			});

			// Close dialog immediately for better UX
			resetForm();
			setIsAddProjectDialogOpen(false);

			return { previousProjects };
		},
		onError: (_error, _newProject, context) => {
			// Rollback on error
			if (context?.previousProjects) {
				queryClient.setQueryData(orpc.workSamples.listProjects.key({}), context.previousProjects);
			}
		},
		onSettled: () => {
			// Always refetch after mutation
			queryClient.invalidateQueries({ queryKey: ["workSamples"] });
		},
	});

	// Update project mutation
	const updateMutation = useMutation(
		orpc.workSamples.updateProject.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries({ queryKey: ["workSamples"] });
				resetForm();
				setIsAddProjectDialogOpen(false);
			},
		}),
	);

	// Delete project mutation
	const deleteMutation = useMutation(
		orpc.workSamples.deleteProject.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries({ queryKey: ["workSamples"] });
			},
		}),
	);

	// Reset form
	const resetForm = useCallback(() => {
		setFormData(getDefaultProjectForm());
		setEditingProject(null);
	}, []);

	// Handle save project
	const handleSaveProject = useCallback(() => {
		if (!formData.title?.trim()) return;

		const projectData = {
			title: formData.title,
			description: formData.description || undefined,
			longDescription: formData.longDescription || undefined,
			role: formData.role || undefined,
			type: formData.type,
			status: formData.status,
			technologies: formData.technologies,
			skills: formData.skills,
			images: formData.images,
			links: formData.links,
			featured: formData.featured,
			startDate: formData.startDate || undefined,
			endDate: formData.endDate || undefined,
			teamSize: formData.teamSize,
			client: formData.client || undefined,
			industry: formData.industry || undefined,
		};

		if (editingProject) {
			updateMutation.mutate({
				id: editingProject.id,
				...projectData,
			});
		} else {
			createMutation.mutate(projectData);
		}
	}, [formData, editingProject, createMutation, updateMutation]);

	// Handle delete project
	const handleDeleteProject = useCallback(
		(projectId: string) => {
			deleteMutation.mutate({ id: projectId });
		},
		[deleteMutation],
	);

	// Handle edit project
	const handleEditProject = useCallback((project: Project) => {
		setEditingProject(project);
		setFormData({
			title: project.title,
			description: project.description,
			longDescription: project.longDescription,
			role: project.role,
			type: project.type,
			status: project.status,
			technologies: project.technologies,
			skills: project.skills,
			images: project.images,
			links: project.links,
			featured: project.featured,
			startDate: project.startDate || "",
			endDate: project.endDate || "",
			teamSize: project.teamSize ?? undefined,
			client: project.client || "",
			industry: project.industry || "",
		});
		setIsAddProjectDialogOpen(true);
	}, []);

	// Extract all unique skills for filtering
	const skillFilters = useMemo((): SkillFilter[] => {
		const skillMap = new Map<string, { count: number; category: string }>();

		projects.forEach((project) => {
			project.skills.forEach((skill) => {
				const existing = skillMap.get(skill);
				if (existing) {
					skillMap.set(skill, { ...existing, count: existing.count + 1 });
				} else {
					const tech = project.technologies.find((t) => t.name.toLowerCase() === skill.toLowerCase());
					skillMap.set(skill, {
						count: 1,
						category: tech?.category || "other",
					});
				}
			});
		});

		return Array.from(skillMap.entries())
			.map(([name, { count, category }]) => ({ name, count, category }))
			.sort((a, b) => b.count - a.count);
	}, [projects]);

	// Filter projects
	const filteredProjects = useMemo(() => {
		return projects.filter((project) => {
			const matchesType = selectedType === "all" || project.type === selectedType;
			const matchesSkill = !selectedSkill || project.skills.includes(selectedSkill);
			const matchesSearch =
				searchQuery === "" ||
				project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
				project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
				project.skills.some((skill) => skill.toLowerCase().includes(searchQuery.toLowerCase()));

			return matchesType && matchesSkill && matchesSearch;
		});
	}, [projects, selectedType, selectedSkill, searchQuery]);

	// Featured projects
	const featuredProjects = useMemo(() => projects.filter((p) => p.featured), [projects]);

	// Get case study for project
	const getCaseStudyForProject = useCallback(
		(projectId: string) => {
			return caseStudies.find((cs) => cs.projectId === projectId);
		},
		[caseStudies],
	);

	// Clear filters
	const clearFilters = useCallback(() => {
		setSelectedType("all");
		setSelectedSkill(null);
		setSearchQuery("");
	}, []);

	// Export portfolio as PDF (print dialog)
	const handleExportPDF = useCallback(() => {
		window.print();
	}, []);

	// Export portfolio as JSON
	const handleExportZip = useCallback(() => {
		const data = JSON.stringify(projects ?? [], null, 2);
		const blob = new Blob([data], { type: "application/json" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = "portfolio-export.json";
		a.click();
		URL.revokeObjectURL(url);
	}, [projects]);

	// Loading state
	if (isLoading) {
		return (
			<>
				<DashboardHeader icon={FolderOpenIcon} title={t`Work Samples`} />
				<Card className="p-12 text-center">
					<div className="animate-pulse">
						<div className="mx-auto mb-4 h-12 w-12 rounded-full bg-muted" />
						<div className="mx-auto h-4 w-32 rounded bg-muted" />
					</div>
				</Card>
			</>
		);
	}

	// Error state
	if (error) {
		return (
			<>
				<DashboardHeader icon={FolderOpenIcon} title={t`Work Samples`} />
				<Card className="p-12 text-center">
					<WarningCircleIcon className="mx-auto size-12 text-red-500" weight="duotone" />
					<h3 className="mt-4 font-semibold text-lg">
						<Trans>Loading error</Trans>
					</h3>
					<p className="mt-2 text-muted-foreground">
						<Trans>Unable to load projects</Trans>
					</p>
				</Card>
			</>
		);
	}

	return (
		<>
			<DashboardHeader icon={FolderOpenIcon} title={t`Work Samples`} />

			<HeroSection
				totalProjects={statistics?.total ?? projects.length}
				featuredCount={statistics?.featured ?? featuredProjects.length}
				skillsCount={statistics?.skillsCount ?? skillFilters.length}
			/>

			<ActionsBar
				onExportPDF={handleExportPDF}
				onExportZip={handleExportZip}
				addProjectDialog={
					<AddProjectDialog
						open={isAddProjectDialogOpen}
						onOpenChange={setIsAddProjectDialogOpen}
						editingProject={editingProject}
						formData={formData}
						setFormData={setFormData}
						onSave={handleSaveProject}
						onReset={resetForm}
						isSaving={createMutation.isPending || updateMutation.isPending}
					/>
				}
			/>

			<MainTabs activeTab={activeTab} onTabChange={setActiveTab}>
				<ShowcaseTab
					searchQuery={searchQuery}
					onSearchChange={setSearchQuery}
					selectedType={selectedType}
					onTypeChange={setSelectedType}
					selectedSkill={selectedSkill}
					onSkillChange={setSelectedSkill}
					skillFilters={skillFilters}
					filteredProjects={filteredProjects}
					featuredProjects={featuredProjects}
					allProjects={projects}
					onClearFilters={clearFilters}
					onViewProject={(project) => {
						setSelectedProject(project);
						setIsProjectDialogOpen(true);
					}}
					onEditProject={handleEditProject}
					onDeleteProject={handleDeleteProject}
					onAddProject={() => setIsAddProjectDialogOpen(true)}
				/>

				<GalleryTab
					projects={projects}
					onViewProject={(project) => {
						setSelectedProject(project);
						setIsProjectDialogOpen(true);
					}}
				/>

				<CaseStudiesTab
					caseStudies={caseStudies}
					projects={projects}
					onViewCaseStudy={(caseStudy) => {
						setSelectedCaseStudy(caseStudy);
						setIsCaseStudyDialogOpen(true);
					}}
					hasProjects={projects.length > 0}
				/>

				<BeforeAfterTab
					projects={projects}
					onViewProject={(project) => {
						setSelectedProject(project);
						setIsProjectDialogOpen(true);
					}}
				/>

				<SkillsTab
					skillFilters={skillFilters}
					selectedSkill={selectedSkill}
					onSkillSelect={setSelectedSkill}
					onSwitchToShowcase={() => setActiveTab("showcase")}
					totalProjects={projects.length}
				/>
			</MainTabs>

			<ProjectDetailDialog
				open={isProjectDialogOpen}
				onOpenChange={setIsProjectDialogOpen}
				project={selectedProject}
				onEdit={handleEditProject}
				getCaseStudyForProject={getCaseStudyForProject}
				onViewCaseStudy={(caseStudy) => {
					setSelectedCaseStudy(caseStudy);
					setIsCaseStudyDialogOpen(true);
				}}
			/>

			<CaseStudyDetailDialog
				open={isCaseStudyDialogOpen}
				onOpenChange={setIsCaseStudyDialogOpen}
				caseStudy={selectedCaseStudy}
			/>
		</>
	);
}
