import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import {
	ChartBarIcon,
	ClipboardTextIcon,
	CodeIcon,
	FolderIcon,
	ImagesSquareIcon,
	MedalIcon,
	PaletteIcon,
	QuotesIcon,
	SparkleIcon,
} from "@phosphor-icons/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense, useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import { ErrorComponent } from "@/components/error-component";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { authClient } from "@/integrations/auth/client";
import { orpc } from "@/integrations/orpc/client";
import { DashboardHeader } from "../-components/header";
import {
	AnalyticsTabContent,
	CaseStudiesTabContent,
	CaseStudyDetailDialog,
	CertificationsTabContent,
	GalleryTabContent,
	PortfolioHero,
	PortfolioUrlBar,
	ProjectDetailDialog,
	ProjectsTabContent,
	SkillsTabContent,
	TestimonialsTabContent,
	ThemesTabContent,
} from "./-components/portfolio-components";
import { PORTFOLIO_THEMES } from "./-components/portfolio-config";
import { mapBackendCaseStudyToFrontend, mapBackendProjectToFrontend } from "./-components/portfolio-mappers";
import type { CaseStudy, PortfolioTheme, Project, WorkSample } from "./-components/portfolio-types";

// Lazy load the portfolio page component
const PortfolioPageLazy = lazy(() => Promise.resolve({ default: PortfolioPage }));

// biome-ignore lint/suspicious/noExplicitAny: Route path not in generated route tree
export const Route = createFileRoute("/dashboard/portfolio/" as any)({
	component: () => (
		<Suspense
			fallback={
				<div className="flex items-center justify-center p-8">
					<Trans>Loading portfolio...</Trans>
				</div>
			}
		>
			<PortfolioPageLazy />
		</Suspense>
	),
	errorComponent: ErrorComponent,
});

// Main Component
function PortfolioPage() {
	const [activeTab, setActiveTab] = useState("projects");
	const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
	const [selectedCategory, setSelectedCategory] = useState("All");
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedProject, setSelectedProject] = useState<Project | null>(null);
	const [selectedCaseStudy, setSelectedCaseStudy] = useState<CaseStudy | null>(null);
	const [isProjectDialogOpen, setIsProjectDialogOpen] = useState(false);
	const [isCaseStudyDialogOpen, setIsCaseStudyDialogOpen] = useState(false);
	const [isNewProjectDialogOpen, setIsNewProjectDialogOpen] = useState(false);
	const [selectedTheme, setSelectedTheme] = useState<PortfolioTheme>(PORTFOLIO_THEMES[0]);
	const [portfolioPublic, setPortfolioPublic] = useState(true);
	const [portfolioUrl] = useState("portfolio.imta.ma/john-doe");
	const [isDragging, setIsDragging] = useState(false);
	// Local work samples state (file uploads not yet backed by workSamples gallery endpoint)
	const [workSamples, setWorkSamples] = useState<WorkSample[]>([]);

	const { data: session } = authClient.useSession();
	const queryClient = useQueryClient();

	// ── Queries ──────────────────────────────────────────────────────────────
	const { data: backendProjects = [] } = useQuery({
		...orpc.workSamples.listProjects.queryOptions({ input: {} }),
		staleTime: 5 * 60 * 1000,
		enabled: !!session?.user,
	});

	const { data: backendCaseStudies = [] } = useQuery({
		...orpc.workSamples.listCaseStudies.queryOptions({}),
		staleTime: 5 * 60 * 1000,
		enabled: !!session?.user,
	});

	// Map backend data to frontend types
	const projects = useMemo(() => backendProjects.map(mapBackendProjectToFrontend), [backendProjects]);

	const caseStudies = useMemo(() => backendCaseStudies.map(mapBackendCaseStudyToFrontend), [backendCaseStudies]);

	// ── Mutations ────────────────────────────────────────────────────────────
	const invalidateProjects = () => {
		queryClient.invalidateQueries({
			queryKey: orpc.workSamples.listProjects.queryOptions({ input: {} }).queryKey,
		});
	};

	const createProjectMutation = useMutation({
		...orpc.workSamples.createProject.mutationOptions(),
		onSuccess: () => {
			invalidateProjects();
			toast.success(t`Project created successfully`);
			setIsNewProjectDialogOpen(false);
			setNewProject({
				title: "",
				description: "",
				tags: [],
				category: "",
				status: "in-progress",
				featured: false,
				images: [],
				links: {},
			});
		},
		onError: () => {
			toast.error(t`Failed to create project`);
		},
	});

	const deleteProjectMutation = useMutation({
		...orpc.workSamples.deleteProject.mutationOptions(),
		onSuccess: () => {
			invalidateProjects();
			toast.success(t`Project deleted`);
		},
		onError: () => {
			toast.error(t`Failed to delete project`);
		},
	});

	const toggleFeaturedMutation = useMutation({
		...orpc.workSamples.toggleFeatured.mutationOptions(),
		onSuccess: () => {
			invalidateProjects();
		},
		onError: () => {
			toast.error(t`Failed to update project`);
		},
	});

	const handleDeleteProject = useCallback(
		(id: string) => {
			deleteProjectMutation.mutate({ id });
		},
		[deleteProjectMutation],
	);

	const handleToggleFeatured = useCallback(
		(id: string, featured: boolean) => {
			toggleFeaturedMutation.mutate({ id, featured });
		},
		[toggleFeaturedMutation],
	);

	// Form state for new project
	const [newProject, setNewProject] = useState<Partial<Project>>({
		title: "",
		description: "",
		tags: [],
		category: "",
		status: "in-progress",
		featured: false,
		images: [],
		links: {},
	});

	// Handle creating a new project via mutation
	const handleCreateProject = useCallback(() => {
		if (!newProject.title) {
			toast.error(t`Project title is required`);
			return;
		}
		createProjectMutation.mutate({
			title: newProject.title,
			description: newProject.description,
			status: newProject.status as "completed" | "in-progress" | "archived" | undefined,
			featured: newProject.featured,
			skills: newProject.tags,
			type: "web",
		});
	}, [newProject, createProjectMutation]);

	// Filter projects
	const filteredProjects = useMemo(() => {
		return projects.filter((project) => {
			const matchesCategory = selectedCategory === "All" || project.category === selectedCategory;
			const matchesSearch =
				searchQuery === "" ||
				project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
				project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
				project.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));
			return matchesCategory && matchesSearch;
		});
	}, [projects, selectedCategory, searchQuery]);

	// Featured projects
	const featuredProjects = useMemo(() => projects.filter((p) => p.featured), [projects]);

	// Handle file drop for work samples
	const handleDrop = useCallback((e: React.DragEvent) => {
		e.preventDefault();
		setIsDragging(false);
		const files = Array.from(e.dataTransfer.files);
		if (files.length === 0) return;
		const validTypes = ["image/png", "image/jpeg", "image/webp", "application/pdf"];
		const validFiles = files.filter((f) => validTypes.includes(f.type));
		if (validFiles.length === 0) {
			toast.error(t`Unsupported format. Use PNG, JPEG, WebP or PDF.`);
			return;
		}
		toast.success(t`${validFiles.length} file(s) ready to add`);
	}, []);

	const handleDragOver = useCallback((e: React.DragEvent) => {
		e.preventDefault();
		setIsDragging(true);
	}, []);

	const handleDragLeave = useCallback(() => {
		setIsDragging(false);
	}, []);

	// Copy portfolio URL
	const copyPortfolioUrl = useCallback(() => {
		navigator.clipboard.writeText(`https://${portfolioUrl}`);
	}, [portfolioUrl]);

	// Generate PDF
	const exportToPDF = useCallback(() => {
		window.print();
	}, []);

	// Reorder work samples
	const handleReorderSamples = useCallback((newOrder: WorkSample[]) => {
		setWorkSamples(newOrder);
	}, []);

	const handleViewProject = useCallback((project: Project) => {
		setSelectedProject(project);
		setIsProjectDialogOpen(true);
	}, []);

	const handleViewCaseStudy = useCallback((caseStudy: CaseStudy) => {
		setSelectedCaseStudy(caseStudy);
		setIsCaseStudyDialogOpen(true);
	}, []);

	return (
		<>
			<DashboardHeader icon={FolderIcon} title={t`Portfolio`} />

			<PortfolioHero projectCount={projects.length} />

			<PortfolioUrlBar
				portfolioPublic={portfolioPublic}
				setPortfolioPublic={setPortfolioPublic}
				portfolioUrl={portfolioUrl}
				copyPortfolioUrl={copyPortfolioUrl}
				exportToPDF={exportToPDF}
			/>

			{/* Main Tabs */}
			<Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
				<TabsList className="flex h-auto flex-wrap gap-2 bg-transparent p-0">
					{[
						{ value: "projects", icon: CodeIcon, label: "Projects" },
						{ value: "case-studies", icon: ClipboardTextIcon, label: "Case Studies" },
						{ value: "gallery", icon: ImagesSquareIcon, label: "Work Samples" },
						{ value: "skills", icon: SparkleIcon, label: "Skills" },
						{ value: "certifications", icon: MedalIcon, label: "Certifications" },
						{ value: "testimonials", icon: QuotesIcon, label: "Testimonials" },
						{ value: "analytics", icon: ChartBarIcon, label: "Analytics" },
						{ value: "themes", icon: PaletteIcon, label: "Themes" },
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

				<ProjectsTabContent
					searchQuery={searchQuery}
					setSearchQuery={setSearchQuery}
					selectedCategory={selectedCategory}
					setSelectedCategory={setSelectedCategory}
					viewMode={viewMode}
					setViewMode={setViewMode}
					isNewProjectDialogOpen={isNewProjectDialogOpen}
					setIsNewProjectDialogOpen={setIsNewProjectDialogOpen}
					newProject={newProject}
					setNewProject={setNewProject}
					featuredProjects={featuredProjects}
					filteredProjects={filteredProjects}
					onViewProject={handleViewProject}
					onDeleteProject={handleDeleteProject}
					onToggleFeatured={handleToggleFeatured}
					onCreateProject={handleCreateProject}
					isCreating={createProjectMutation.isPending}
				/>

				<CaseStudiesTabContent caseStudies={caseStudies} onViewCaseStudy={handleViewCaseStudy} />

				<GalleryTabContent
					isDragging={isDragging}
					handleDrop={handleDrop}
					handleDragOver={handleDragOver}
					handleDragLeave={handleDragLeave}
					workSamples={workSamples}
					handleReorderSamples={handleReorderSamples}
				/>

				<SkillsTabContent projects={projects} />

				<CertificationsTabContent />

				<TestimonialsTabContent />

				<AnalyticsTabContent />

				<ThemesTabContent selectedTheme={selectedTheme} setSelectedTheme={setSelectedTheme} />
			</Tabs>

			<ProjectDetailDialog open={isProjectDialogOpen} onOpenChange={setIsProjectDialogOpen} project={selectedProject} />

			<CaseStudyDetailDialog
				open={isCaseStudyDialogOpen}
				onOpenChange={setIsCaseStudyDialogOpen}
				caseStudy={selectedCaseStudy}
			/>
		</>
	);
}
