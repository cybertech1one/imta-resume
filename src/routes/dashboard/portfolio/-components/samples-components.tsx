import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import {
	ArrowRightIcon,
	ArrowSquareOutIcon,
	ArrowsLeftRightIcon,
	CalendarIcon,
	CheckCircleIcon,
	CloudArrowDownIcon,
	CodeIcon,
	DownloadSimpleIcon,
	EyeIcon,
	FilePdfIcon,
	FileZipIcon,
	FunnelIcon,
	GithubLogoIcon,
	GlobeIcon,
	ImageIcon,
	ImagesSquareIcon,
	LightbulbIcon,
	LinkIcon,
	MagnifyingGlassIcon,
	PencilSimpleIcon,
	PlusIcon,
	RocketLaunchIcon,
	ShareNetworkIcon,
	SparkleIcon,
	StackIcon,
	StarIcon,
	TagIcon,
	TrashIcon,
	UserIcon,
	UsersIcon,
	WarningCircleIcon,
	XIcon,
} from "@phosphor-icons/react";
import { AnimatePresence, motion } from "motion/react";
import { CometCard } from "@/components/animation/comet-card";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/utils/style";
import { PROJECT_TYPE_CONFIG, STATUS_CONFIG } from "./samples-config";
import type { CaseStudy, Project, ProjectStatus, ProjectType, SkillFilter } from "./samples-types";

// ─── Hero Section ─────────────────────────────────────────────────────────────

interface HeroSectionProps {
	totalProjects: number;
	featuredCount: number;
	skillsCount: number;
}

export function HeroSection({ totalProjects, featuredCount, skillsCount }: HeroSectionProps) {
	return (
		<motion.div
			className="relative mb-8 overflow-hidden rounded-3xl border border-primary/20 p-8 md:p-12"
			style={{
				background:
					"linear-gradient(135deg, oklch(0.7 0.15 200 / 0.15) 0%, oklch(0.6 0.2 260 / 0.1) 50%, oklch(0.65 0.18 320 / 0.08) 100%)",
			}}
			initial={false}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.6, ease: "easeOut" }}
		>
			{/* Background elements */}
			<div className="pointer-events-none absolute inset-0 overflow-hidden">
				<motion.div
					className="absolute -top-32 -right-32 size-96 rounded-full bg-gradient-to-br from-cyan-500/20 to-purple-500/10 blur-3xl"
					animate={{ scale: [1, 1.2, 1], rotate: [0, 10, 0], opacity: [0.5, 0.3, 0.5] }}
					transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
				/>
				<motion.div
					className="absolute -bottom-32 -left-32 size-96 rounded-full bg-gradient-to-tr from-pink-500/15 to-orange-500/10 blur-3xl"
					animate={{ scale: [1.2, 1, 1.2], rotate: [0, -10, 0], opacity: [0.3, 0.5, 0.3] }}
					transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
				/>
			</div>

			<div className="relative z-10">
				<motion.div
					className="mb-3 flex items-center gap-2"
					initial={false}
					animate={{ opacity: 1, x: 0 }}
					transition={{ delay: 0.2 }}
				>
					<StackIcon className="size-5 text-primary" weight="fill" />
					<span className="font-semibold text-primary text-sm uppercase tracking-wider">
						<Trans>Professional Portfolio</Trans>
					</span>
				</motion.div>

				<motion.h2
					className="mb-4 bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text font-bold text-3xl text-transparent tracking-tight md:text-4xl lg:text-5xl"
					initial={false}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.3 }}
				>
					<Trans>Work Samples</Trans>
				</motion.h2>

				<motion.p
					className="mb-8 max-w-2xl text-lg text-muted-foreground"
					initial={false}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.4 }}
				>
					<Trans>
						Discover my most significant projects with details on the technologies used, my role, and the results
						achieved. Explore the case studies to understand my approach and methodology.
					</Trans>
				</motion.p>

				{/* Quick Stats */}
				<motion.div
					className="flex flex-wrap items-center gap-6"
					initial={false}
					animate={{ opacity: 1 }}
					transition={{ delay: 0.5 }}
				>
					<div className="flex items-center gap-2">
						<div className="flex size-10 items-center justify-center rounded-full bg-primary/10">
							<CodeIcon className="size-5 text-primary" weight="duotone" />
						</div>
						<div>
							<p className="font-bold text-xl">{totalProjects}</p>
							<p className="text-muted-foreground text-sm">
								<Trans>Projects</Trans>
							</p>
						</div>
					</div>
					<div className="flex items-center gap-2">
						<div className="flex size-10 items-center justify-center rounded-full bg-amber-500/10">
							<StarIcon className="size-5 text-amber-500" weight="duotone" />
						</div>
						<div>
							<p className="font-bold text-xl">{featuredCount}</p>
							<p className="text-muted-foreground text-sm">
								<Trans>Featured projects</Trans>
							</p>
						</div>
					</div>
					<div className="flex items-center gap-2">
						<div className="flex size-10 items-center justify-center rounded-full bg-green-500/10">
							<SparkleIcon className="size-5 text-green-500" weight="duotone" />
						</div>
						<div>
							<p className="font-bold text-xl">{skillsCount}</p>
							<p className="text-muted-foreground text-sm">
								<Trans>Skills</Trans>
							</p>
						</div>
					</div>
				</motion.div>
			</div>
		</motion.div>
	);
}

// ─── Add/Edit Project Dialog ──────────────────────────────────────────────────

interface AddProjectDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	editingProject: Project | null;
	formData: ReturnType<typeof import("./samples-config").getDefaultProjectForm>;
	setFormData: (data: AddProjectDialogProps["formData"]) => void;
	onSave: () => void;
	onReset: () => void;
	isSaving: boolean;
}

export function AddProjectDialog({
	open,
	onOpenChange,
	editingProject,
	formData,
	setFormData,
	onSave,
	onReset,
	isSaving,
}: AddProjectDialogProps) {
	return (
		<Dialog
			open={open}
			onOpenChange={(isOpen) => {
				onOpenChange(isOpen);
				if (!isOpen) onReset();
			}}
		>
			<DialogTrigger asChild>
				<Button className="gap-2">
					<PlusIcon className="size-4" />
					<Trans>Add a project</Trans>
				</Button>
			</DialogTrigger>
			<DialogContent className="max-w-3xl">
				<DialogHeader>
					<DialogTitle>{editingProject ? <Trans>Edit project</Trans> : <Trans>Add a new project</Trans>}</DialogTitle>
					<DialogDescription>
						<Trans>Add a new project to your portfolio to showcase your work.</Trans>
					</DialogDescription>
				</DialogHeader>
				<ScrollArea className="max-h-[60vh]">
					<div className="grid gap-4 py-4 pr-4">
						<div className="grid grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label htmlFor="project-title">
									<Trans>Project title</Trans>
								</Label>
								<Input
									id="project-title"
									placeholder={t`E.g.: E-commerce Application`}
									value={formData.title}
									onChange={(e) => setFormData({ ...formData, title: e.target.value })}
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="project-role">
									<Trans>Your role</Trans>
								</Label>
								<Input
									id="project-role"
									placeholder={t`E.g.: Full-Stack Developer`}
									value={formData.role}
									onChange={(e) => setFormData({ ...formData, role: e.target.value })}
								/>
							</div>
						</div>

						<div className="space-y-2">
							<Label htmlFor="project-description">
								<Trans>Short description</Trans>
							</Label>
							<Textarea
								id="project-description"
								placeholder={t`Briefly describe the project...`}
								value={formData.description}
								onChange={(e) => setFormData({ ...formData, description: e.target.value })}
								rows={2}
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="project-long-description">
								<Trans>Detailed description</Trans>
							</Label>
							<Textarea
								id="project-long-description"
								placeholder={t`Explain in detail the context, challenges, and solutions...`}
								value={formData.longDescription}
								onChange={(e) => setFormData({ ...formData, longDescription: e.target.value })}
								rows={4}
							/>
						</div>

						<div className="grid grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label htmlFor="project-type">
									<Trans>Project type</Trans>
								</Label>
								<Select
									value={formData.type}
									onValueChange={(v) => setFormData({ ...formData, type: v as ProjectType })}
								>
									<SelectTrigger>
										<SelectValue placeholder={t`Select a type`} />
									</SelectTrigger>
									<SelectContent>
										{(Object.keys(PROJECT_TYPE_CONFIG) as ProjectType[]).map((type) => (
											<SelectItem key={type} value={type}>
												{PROJECT_TYPE_CONFIG[type].label}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
							<div className="space-y-2">
								<Label htmlFor="project-status">
									<Trans>Status</Trans>
								</Label>
								<Select
									value={formData.status}
									onValueChange={(v) => setFormData({ ...formData, status: v as ProjectStatus })}
								>
									<SelectTrigger>
										<SelectValue placeholder={t`Select a status`} />
									</SelectTrigger>
									<SelectContent>
										{(Object.keys(STATUS_CONFIG) as ProjectStatus[]).map((status) => (
											<SelectItem key={status} value={status}>
												{STATUS_CONFIG[status].label}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
						</div>

						<div className="grid grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label htmlFor="project-start-date">
									<Trans>Start date</Trans>
								</Label>
								<Input
									id="project-start-date"
									type="month"
									value={formData.startDate}
									onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="project-end-date">
									<Trans>End date</Trans>
								</Label>
								<Input
									id="project-end-date"
									type="month"
									value={formData.endDate || ""}
									onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
								/>
							</div>
						</div>

						<div className="grid grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label htmlFor="project-client">
									<Trans>Client</Trans>
								</Label>
								<Input
									id="project-client"
									placeholder={t`E.g.: Company XYZ`}
									value={formData.client}
									onChange={(e) => setFormData({ ...formData, client: e.target.value })}
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="project-industry">
									<Trans>Sector</Trans>
								</Label>
								<Input
									id="project-industry"
									placeholder={t`Ex: E-commerce`}
									value={formData.industry}
									onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
								/>
							</div>
						</div>

						<div className="space-y-2">
							<Label>
								<Trans>Project images</Trans>
							</Label>
							<div className="flex h-32 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed transition-colors hover:border-primary/50 hover:bg-primary/5">
								<div className="text-center">
									<CloudArrowDownIcon className="mx-auto size-8 text-muted-foreground" />
									<p className="mt-2 text-muted-foreground text-sm">
										<Trans>Click or drag images here</Trans>
									</p>
								</div>
							</div>
						</div>

						<div className="flex items-center gap-2 rounded-lg border p-4">
							<Switch
								checked={formData.featured}
								onCheckedChange={(checked) => setFormData({ ...formData, featured: checked })}
							/>
							<div>
								<Label className="cursor-pointer">
									<Trans>Feature this project</Trans>
								</Label>
								<p className="text-muted-foreground text-sm">
									<Trans>Featured projects appear first</Trans>
								</p>
							</div>
						</div>
					</div>
				</ScrollArea>
				<DialogFooter>
					<DialogClose asChild>
						<Button variant="outline">
							<Trans>Cancel</Trans>
						</Button>
					</DialogClose>
					<Button onClick={onSave} disabled={isSaving}>
						{isSaving ? <Trans>Saving...</Trans> : editingProject ? <Trans>Update</Trans> : <Trans>Add project</Trans>}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

// ─── Actions Bar ──────────────────────────────────────────────────────────────

interface ActionsBarProps {
	onExportPDF: () => void;
	onExportZip: () => void;
	addProjectDialog: React.ReactNode;
}

export function ActionsBar({ onExportPDF, onExportZip, addProjectDialog }: ActionsBarProps) {
	return (
		<Card className="mb-8">
			<CardContent className="flex flex-wrap items-center justify-between gap-4 p-4">
				<div className="flex flex-1 items-center gap-4">
					<span className="font-medium text-muted-foreground text-sm">
						<Trans>Export options:</Trans>
					</span>
					<div className="flex items-center gap-2">
						<Button variant="outline" className="gap-2" onClick={onExportPDF}>
							<FilePdfIcon className="size-4" />
							<Trans>Export PDF</Trans>
						</Button>
						<Button variant="outline" className="gap-2" onClick={onExportZip}>
							<FileZipIcon className="size-4" />
							<Trans>Download ZIP</Trans>
						</Button>
					</div>
				</div>
				<div className="flex items-center gap-2">
					<Button variant="outline" className="gap-2">
						<ShareNetworkIcon className="size-4" />
						<Trans>Share</Trans>
					</Button>
					{addProjectDialog}
				</div>
			</CardContent>
		</Card>
	);
}

// ─── Main Tabs Container ──────────────────────────────────────────────────────

interface MainTabsProps {
	activeTab: string;
	onTabChange: (tab: string) => void;
	children: React.ReactNode;
}

export function MainTabs({ activeTab, onTabChange, children }: MainTabsProps) {
	return (
		<Tabs value={activeTab} onValueChange={onTabChange} className="space-y-8">
			<TabsList className="flex h-auto flex-wrap gap-2 bg-transparent p-0">
				{[
					{ value: "showcase", icon: ImagesSquareIcon, label: t`Showcase` },
					{ value: "gallery", icon: ImageIcon, label: t`Visual Gallery` },
					{ value: "case-studies", icon: LightbulbIcon, label: t`Case Studies` },
					{ value: "before-after", icon: ArrowsLeftRightIcon, label: t`Before/After` },
					{ value: "skills", icon: SparkleIcon, label: t`Skills` },
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
			{children}
		</Tabs>
	);
}

// ─── Showcase Tab ─────────────────────────────────────────────────────────────

interface ShowcaseTabProps {
	searchQuery: string;
	onSearchChange: (query: string) => void;
	selectedType: ProjectType | "all";
	onTypeChange: (type: ProjectType | "all") => void;
	selectedSkill: string | null;
	onSkillChange: (skill: string | null) => void;
	skillFilters: SkillFilter[];
	filteredProjects: Project[];
	featuredProjects: Project[];
	allProjects: Project[];
	onClearFilters: () => void;
	onViewProject: (project: Project) => void;
	onEditProject: (project: Project) => void;
	onDeleteProject: (projectId: string) => void;
	onAddProject: () => void;
}

export function ShowcaseTab({
	searchQuery,
	onSearchChange,
	selectedType,
	onTypeChange,
	selectedSkill,
	onSkillChange,
	skillFilters,
	filteredProjects,
	featuredProjects,
	allProjects,
	onClearFilters,
	onViewProject,
	onEditProject,
	onDeleteProject,
	onAddProject,
}: ShowcaseTabProps) {
	const hasFilters = selectedType !== "all" || selectedSkill !== null || searchQuery !== "";

	return (
		<TabsContent value="showcase" className="space-y-8">
			{/* Filters */}
			<div className="flex flex-wrap items-center justify-between gap-4">
				<div className="flex flex-1 flex-wrap items-center gap-4">
					{/* Search */}
					<div className="relative max-w-md flex-1">
						<MagnifyingGlassIcon className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
						<Input
							placeholder={t`Search for projects...`}
							value={searchQuery}
							onChange={(e) => onSearchChange(e.target.value)}
							className="pl-9"
						/>
					</div>

					{/* Type Filter */}
					<Select value={selectedType} onValueChange={(v) => onTypeChange(v as ProjectType | "all")}>
						<SelectTrigger className="w-48">
							<FunnelIcon className="mr-2 size-4" />
							<SelectValue placeholder={t`Project type`} />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">
								<Trans>All types</Trans>
							</SelectItem>
							{(Object.keys(PROJECT_TYPE_CONFIG) as ProjectType[]).map((type) => (
								<SelectItem key={type} value={type}>
									{PROJECT_TYPE_CONFIG[type].label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>

					{/* Skill Filter */}
					<Select value={selectedSkill || "all"} onValueChange={(v) => onSkillChange(v === "all" ? null : v)}>
						<SelectTrigger className="w-48">
							<TagIcon className="mr-2 size-4" />
							<SelectValue placeholder={t`Skill`} />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">
								<Trans>All skills</Trans>
							</SelectItem>
							{skillFilters.slice(0, 15).map((skill) => (
								<SelectItem key={skill.name} value={skill.name}>
									{skill.name} ({skill.count})
								</SelectItem>
							))}
						</SelectContent>
					</Select>

					{/* Clear filters */}
					{hasFilters && (
						<Button variant="ghost" size="sm" className="gap-1" onClick={onClearFilters}>
							<XIcon className="size-4" />
							<Trans>Clear</Trans>
						</Button>
					)}
				</div>
			</div>

			{/* Featured Projects */}
			{featuredProjects.length > 0 && !hasFilters && (
				<div className="space-y-4">
					<div className="flex items-center gap-2">
						<StarIcon className="size-5 text-amber-500" weight="fill" />
						<h3 className="font-semibold text-xl">
							<Trans>Featured projects</Trans>
						</h3>
					</div>
					<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
						{featuredProjects.map((project, index) => (
							<motion.div
								key={project.id}
								initial={false}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: index * 0.1 }}
							>
								<ProjectCard
									project={project}
									onView={() => onViewProject(project)}
									onEdit={() => onEditProject(project)}
									onDelete={() => onDeleteProject(project.id)}
									featured
								/>
							</motion.div>
						))}
					</div>
				</div>
			)}

			{/* All Projects Grid */}
			<div className="space-y-4">
				<div className="flex items-center justify-between">
					<h3 className="font-semibold text-xl">
						{!hasFilters ? <Trans>All projects</Trans> : <Trans>Search results</Trans>}
						<span className="ml-2 text-muted-foreground">({filteredProjects.length})</span>
					</h3>
				</div>

				<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
					<AnimatePresence>
						{filteredProjects.map((project, index) => (
							<motion.div
								key={project.id}
								layout
								initial={{ opacity: 0, scale: 0.95 }}
								animate={{ opacity: 1, scale: 1 }}
								exit={{ opacity: 0, scale: 0.95 }}
								transition={{ delay: index * 0.05 }}
							>
								<ProjectCard
									project={project}
									onView={() => onViewProject(project)}
									onEdit={() => onEditProject(project)}
									onDelete={() => onDeleteProject(project.id)}
								/>
							</motion.div>
						))}
					</AnimatePresence>
				</div>

				{filteredProjects.length === 0 && (
					<Card className="p-12 text-center">
						<WarningCircleIcon className="mx-auto size-12 text-muted-foreground" weight="duotone" />
						<h3 className="mt-4 font-semibold text-lg">
							<Trans>No projects found</Trans>
						</h3>
						<p className="mt-2 text-muted-foreground">
							{allProjects.length === 0 ? (
								<Trans>Add your first project to get started</Trans>
							) : (
								<Trans>Try changing your search criteria</Trans>
							)}
						</p>
						{allProjects.length === 0 ? (
							<Button className="mt-4 gap-2" onClick={onAddProject}>
								<PlusIcon className="size-4" />
								<Trans>Add a project</Trans>
							</Button>
						) : (
							<Button variant="outline" className="mt-4" onClick={onClearFilters}>
								<Trans>Clear filters</Trans>
							</Button>
						)}
					</Card>
				)}
			</div>
		</TabsContent>
	);
}

// ─── Gallery Tab ──────────────────────────────────────────────────────────────

interface GalleryTabProps {
	projects: Project[];
	onViewProject: (project: Project) => void;
}

export function GalleryTab({ projects, onViewProject }: GalleryTabProps) {
	return (
		<TabsContent value="gallery" className="space-y-8">
			<div>
				<h3 className="mb-2 font-semibold text-2xl">
					<Trans>Visual Gallery</Trans>
				</h3>
				<p className="text-muted-foreground">
					<Trans>Browse screenshots and visuals from all projects</Trans>
				</p>
			</div>

			{projects.length > 0 ? (
				<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
					{projects.flatMap((project) =>
						project.images.length > 0
							? project.images.map((_image, imgIndex) => (
									<motion.div
										key={`${project.id}-img-${imgIndex}`}
										initial={false}
										animate={{ opacity: 1, scale: 1 }}
										transition={{ delay: imgIndex * 0.05 }}
									>
										<Card className="group overflow-hidden">
											<div className="relative aspect-video overflow-hidden bg-muted">
												<div className="flex h-full items-center justify-center">
													<ImageIcon className="size-12 text-muted-foreground" weight="duotone" />
												</div>
												<div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 transition-opacity group-hover:opacity-100">
													<div className="text-center">
														<Button size="sm" variant="secondary" onClick={() => onViewProject(project)}>
															<EyeIcon className="mr-1 size-4" />
															<Trans>View project</Trans>
														</Button>
													</div>
												</div>
											</div>
											<CardContent className="p-3">
												<p className="truncate font-medium text-sm">{project.title}</p>
												<p className="truncate text-muted-foreground text-xs">{project.role}</p>
											</CardContent>
										</Card>
									</motion.div>
								))
							: [
									<motion.div key={`${project.id}-placeholder`} initial={false} animate={{ opacity: 1, scale: 1 }}>
										<Card className="group overflow-hidden">
											<div className="relative aspect-video overflow-hidden bg-muted">
												<div className="flex h-full items-center justify-center">
													<ImageIcon className="size-12 text-muted-foreground" weight="duotone" />
												</div>
											</div>
											<CardContent className="p-3">
												<p className="truncate font-medium text-sm">{project.title}</p>
												<p className="truncate text-muted-foreground text-xs">{project.role}</p>
											</CardContent>
										</Card>
									</motion.div>,
								],
					)}
				</div>
			) : (
				<Card className="p-12 text-center">
					<ImageIcon className="mx-auto size-12 text-muted-foreground" weight="duotone" />
					<h3 className="mt-4 font-semibold text-lg">
						<Trans>No images</Trans>
					</h3>
					<p className="mt-2 text-muted-foreground">
						<Trans>Add projects with images to see them here</Trans>
					</p>
				</Card>
			)}
		</TabsContent>
	);
}

// ─── Case Studies Tab ─────────────────────────────────────────────────────────

interface CaseStudiesTabProps {
	caseStudies: CaseStudy[];
	projects: Project[];
	onViewCaseStudy: (caseStudy: CaseStudy) => void;
	hasProjects: boolean;
}

export function CaseStudiesTab({ caseStudies, projects, onViewCaseStudy, hasProjects }: CaseStudiesTabProps) {
	return (
		<TabsContent value="case-studies" className="space-y-8">
			<div className="flex items-center justify-between">
				<div>
					<h3 className="font-semibold text-2xl">
						<Trans>Case Studies</Trans>
					</h3>
					<p className="text-muted-foreground">
						<Trans>Explore projects in depth with methodology and results</Trans>
					</p>
				</div>
			</div>

			{caseStudies.length > 0 ? (
				<div className="grid gap-6 lg:grid-cols-2">
					{caseStudies.map((caseStudy, index) => {
						const project = projects.find((p) => p.id === caseStudy.projectId);

						return (
							<motion.div
								key={caseStudy.id}
								initial={false}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: index * 0.15 }}
							>
								<Card className="h-full overflow-hidden transition-all hover:shadow-lg">
									<CardHeader className="bg-gradient-to-r from-primary/10 to-transparent">
										<div className="flex items-start justify-between">
											<div>
												{project && (
													<Badge
														className={cn(
															PROJECT_TYPE_CONFIG[project.type].bgColor,
															PROJECT_TYPE_CONFIG[project.type].color,
														)}
													>
														{PROJECT_TYPE_CONFIG[project.type].label}
													</Badge>
												)}
												<CardTitle className="mt-2 text-xl">{caseStudy.title}</CardTitle>
												{project && (
													<CardDescription>
														{project.client} - {project.industry}
													</CardDescription>
												)}
											</div>
											<LightbulbIcon className="size-8 text-amber-500" weight="duotone" />
										</div>
									</CardHeader>
									<CardContent className="pt-4">
										<p className="mb-4 line-clamp-3 text-muted-foreground">{caseStudy.overview}</p>

										<div className="mb-4 flex items-center gap-4">
											<div className="flex items-center gap-1 text-muted-foreground text-sm">
												<CalendarIcon className="size-4" />
												<span>{caseStudy.timeline.length} phases</span>
											</div>
											<div className="flex items-center gap-1 text-muted-foreground text-sm">
												<CheckCircleIcon className="size-4" />
												<span>{caseStudy.keyFeatures.length} key features</span>
											</div>
										</div>

										<div className="flex flex-wrap gap-2">
											{caseStudy.keyFeatures.slice(0, 3).map((feature) => (
												<Badge key={feature} variant="outline" className="text-xs">
													{feature}
												</Badge>
											))}
											{caseStudy.keyFeatures.length > 3 && (
												<Badge variant="outline" className="text-xs">
													+{caseStudy.keyFeatures.length - 3}
												</Badge>
											)}
										</div>
									</CardContent>
									<CardFooter className="justify-between border-t pt-4">
										{project?.teamSize && (
											<div className="flex items-center gap-2 text-muted-foreground text-sm">
												<UsersIcon className="size-4" />
												<span>Team of {project.teamSize}</span>
											</div>
										)}
										<Button variant="ghost" className="gap-2" onClick={() => onViewCaseStudy(caseStudy)}>
											<Trans>Read the study</Trans>
											<ArrowRightIcon className="size-4" />
										</Button>
									</CardFooter>
								</Card>
							</motion.div>
						);
					})}
				</div>
			) : (
				<Card className="p-12 text-center">
					<LightbulbIcon className="mx-auto size-12 text-muted-foreground" weight="duotone" />
					<h3 className="mt-4 font-semibold text-lg">
						<Trans>No case studies</Trans>
					</h3>
					<p className="mx-auto mt-2 max-w-md text-muted-foreground">
						<Trans>Case studies are linked to projects. Add projects first, then create detailed case studies.</Trans>
					</p>
				</Card>
			)}

			{/* Case Study Template Preview */}
			<Card className="border-2 border-dashed">
				<CardContent className="flex items-center justify-center p-12">
					<div className="text-center">
						<LightbulbIcon className="mx-auto size-12 text-muted-foreground" weight="duotone" />
						<h3 className="mt-4 font-semibold text-lg">
							<Trans>Create a new case study</Trans>
						</h3>
						<p className="mt-2 max-w-md text-muted-foreground">
							<Trans>Document your most impactful projects with our structured case study template</Trans>
						</p>
						<Button className="mt-4 gap-2" disabled={!hasProjects}>
							<PlusIcon className="size-4" />
							<Trans>Create a case study</Trans>
						</Button>
					</div>
				</CardContent>
			</Card>
		</TabsContent>
	);
}

// ─── Before/After Tab ─────────────────────────────────────────────────────────

interface BeforeAfterTabProps {
	projects: Project[];
	onViewProject: (project: Project) => void;
}

export function BeforeAfterTab({ projects, onViewProject }: BeforeAfterTabProps) {
	const projectsWithComparisons = projects.filter((p) => p.beforeAfter && p.beforeAfter.length > 0);

	return (
		<TabsContent value="before-after" className="space-y-8">
			<div>
				<h3 className="mb-2 font-semibold text-2xl">
					<Trans>Before/After Comparisons</Trans>
				</h3>
				<p className="text-muted-foreground">
					<Trans>Visualize the impact of my work on projects</Trans>
				</p>
			</div>

			{projectsWithComparisons.length > 0 ? (
				<div className="grid gap-8 lg:grid-cols-2">
					{projectsWithComparisons.map((project) => (
						<Card key={project.id} className="overflow-hidden">
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<ArrowsLeftRightIcon className="size-5 text-primary" weight="duotone" />
									{project.title}
								</CardTitle>
								<CardDescription>{project.description}</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								{project.beforeAfter?.map((comparison, idx) => (
									<div key={idx} className="space-y-2">
										<p className="font-medium text-sm">{comparison.label}</p>
										<div className="grid grid-cols-2 gap-4">
											<div className="space-y-1">
												<div className="aspect-video overflow-hidden rounded-lg bg-muted">
													<div className="flex h-full items-center justify-center">
														<ImageIcon className="size-8 text-muted-foreground" weight="duotone" />
													</div>
												</div>
												<Badge variant="outline" className="text-xs">
													<Trans>Before</Trans>
												</Badge>
											</div>
											<div className="space-y-1">
												<div className="aspect-video overflow-hidden rounded-lg bg-muted">
													<div className="flex h-full items-center justify-center">
														<ImageIcon className="size-8 text-muted-foreground" weight="duotone" />
													</div>
												</div>
												<Badge className="bg-green-500/20 text-green-600 text-xs">
													<Trans>After</Trans>
												</Badge>
											</div>
										</div>
									</div>
								))}
							</CardContent>
							<CardFooter className="border-t pt-4">
								<Button variant="outline" className="w-full gap-2" onClick={() => onViewProject(project)}>
									<EyeIcon className="size-4" />
									<Trans>View full project</Trans>
								</Button>
							</CardFooter>
						</Card>
					))}
				</div>
			) : (
				<Card className="p-12 text-center">
					<ArrowsLeftRightIcon className="mx-auto size-12 text-muted-foreground" weight="duotone" />
					<h3 className="mt-4 font-semibold text-lg">
						<Trans>No comparisons available</Trans>
					</h3>
					<p className="mt-2 text-muted-foreground">
						<Trans>Add before/after screenshots to your projects to display them here</Trans>
					</p>
				</Card>
			)}
		</TabsContent>
	);
}

// ─── Skills Tab ───────────────────────────────────────────────────────────────

interface SkillsTabProps {
	skillFilters: SkillFilter[];
	selectedSkill: string | null;
	onSkillSelect: (skill: string | null) => void;
	onSwitchToShowcase: () => void;
	totalProjects: number;
}

export function SkillsTab({
	skillFilters,
	selectedSkill,
	onSkillSelect,
	onSwitchToShowcase,
	totalProjects,
}: SkillsTabProps) {
	return (
		<TabsContent value="skills" className="space-y-8">
			<div>
				<h3 className="mb-2 font-semibold text-2xl">
					<Trans>Skills by project</Trans>
				</h3>
				<p className="text-muted-foreground">
					<Trans>Visualize my skills across completed projects</Trans>
				</p>
			</div>

			{/* Skills Tag Cloud */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<TagIcon className="size-5 text-primary" weight="duotone" />
						<Trans>All skills</Trans>
					</CardTitle>
					<CardDescription>
						<Trans>Click on a skill to filter projects</Trans>
					</CardDescription>
				</CardHeader>
				<CardContent>
					{skillFilters.length > 0 ? (
						<div className="flex flex-wrap gap-2">
							{skillFilters.map((skill) => (
								<Badge
									key={skill.name}
									variant={selectedSkill === skill.name ? "default" : "secondary"}
									className={cn(
										"cursor-pointer transition-all hover:scale-105",
										skill.count >= 3 && selectedSkill !== skill.name && "bg-primary/20 text-primary",
									)}
									onClick={() => {
										onSkillSelect(selectedSkill === skill.name ? null : skill.name);
										onSwitchToShowcase();
									}}
								>
									{skill.name}
									<span className="ml-1 text-muted-foreground">({skill.count})</span>
								</Badge>
							))}
						</div>
					) : (
						<p className="py-8 text-center text-muted-foreground">
							<Trans>Add skills to your projects to see them here</Trans>
						</p>
					)}
				</CardContent>
			</Card>

			{/* Skills by Category */}
			{skillFilters.length > 0 && (
				<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
					{["frontend", "backend", "database", "cloud", "design", "other"].map((category) => {
						const categorySkills = skillFilters.filter((s) => s.category === category);
						if (categorySkills.length === 0) return null;

						const categoryLabels: Record<string, string> = {
							frontend: "Frontend",
							backend: "Backend",
							database: "Database",
							cloud: "Cloud & DevOps",
							design: "Design",
							other: "Other",
						};

						return (
							<motion.div key={category} initial={false} animate={{ opacity: 1, y: 0 }}>
								<Card className="h-full">
									<CardHeader>
										<CardTitle className="flex items-center gap-2 text-lg">
											<SparkleIcon className="size-5 text-primary" weight="duotone" />
											{categoryLabels[category]}
										</CardTitle>
									</CardHeader>
									<CardContent className="space-y-3">
										{categorySkills.slice(0, 6).map((skill) => (
											<div key={skill.name} className="space-y-1">
												<div className="flex items-center justify-between text-sm">
													<span>{skill.name}</span>
													<span className="text-muted-foreground">
														{skill.count} {skill.count === 1 ? "project" : "projects"}
													</span>
												</div>
												<Progress value={(skill.count / totalProjects) * 100} className="h-1.5" />
											</div>
										))}
									</CardContent>
								</Card>
							</motion.div>
						);
					})}
				</div>
			)}
		</TabsContent>
	);
}

// ─── Project Detail Dialog ────────────────────────────────────────────────────

interface ProjectDetailDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	project: Project | null;
	onEdit: (project: Project) => void;
	getCaseStudyForProject: (projectId: string) => CaseStudy | undefined;
	onViewCaseStudy: (caseStudy: CaseStudy) => void;
}

export function ProjectDetailDialog({
	open,
	onOpenChange,
	project,
	onEdit,
	getCaseStudyForProject,
	onViewCaseStudy,
}: ProjectDetailDialogProps) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-4xl">
				{project && (
					<>
						<DialogHeader>
							<div className="flex items-start justify-between gap-4">
								<div>
									<div className="mb-2 flex flex-wrap gap-2">
										<Badge
											className={cn(PROJECT_TYPE_CONFIG[project.type].bgColor, PROJECT_TYPE_CONFIG[project.type].color)}
										>
											{PROJECT_TYPE_CONFIG[project.type].label}
										</Badge>
										<Badge className={cn(STATUS_CONFIG[project.status].bgColor, STATUS_CONFIG[project.status].color)}>
											{STATUS_CONFIG[project.status].label}
										</Badge>
										{project.featured && (
											<Badge className="gap-1 bg-amber-500/20 text-amber-600">
												<StarIcon className="size-3" weight="fill" />
												<Trans>Featured</Trans>
											</Badge>
										)}
									</div>
									<DialogTitle className="text-2xl">{project.title}</DialogTitle>
									<DialogDescription className="mt-1">
										<span className="font-medium">{project.role}</span>
										{project.client && (
											<>
												{" - "}
												{project.client}
											</>
										)}
									</DialogDescription>
								</div>
							</div>
						</DialogHeader>
						<ScrollArea className="max-h-[60vh]">
							<div className="space-y-6 pr-4">
								{/* Main Image */}
								<div className="aspect-video overflow-hidden rounded-lg bg-muted">
									<div className="flex h-full items-center justify-center">
										<ImageIcon className="size-16 text-muted-foreground" weight="duotone" />
									</div>
								</div>

								{/* Description */}
								<div>
									<h4 className="mb-2 font-semibold">
										<Trans>Project description</Trans>
									</h4>
									<p className="text-muted-foreground">{project.longDescription || project.description}</p>
								</div>

								{/* Project Info */}
								<div className="grid gap-4 md:grid-cols-2">
									<div className="rounded-lg border p-4">
										<h4 className="mb-2 font-semibold text-sm">
											<Trans>Information</Trans>
										</h4>
										<div className="space-y-2 text-sm">
											<div className="flex justify-between">
												<span className="text-muted-foreground">
													<Trans>Period</Trans>
												</span>
												<span>
													{project.startDate}
													{project.endDate && ` - ${project.endDate}`}
												</span>
											</div>
											{project.teamSize && (
												<div className="flex justify-between">
													<span className="text-muted-foreground">
														<Trans>Team size</Trans>
													</span>
													<span>{project.teamSize} people</span>
												</div>
											)}
											{project.industry && (
												<div className="flex justify-between">
													<span className="text-muted-foreground">
														<Trans>Sector</Trans>
													</span>
													<span>{project.industry}</span>
												</div>
											)}
										</div>
									</div>

									{project.metrics && project.metrics.length > 0 && (
										<div className="rounded-lg border p-4">
											<h4 className="mb-2 font-semibold text-sm">
												<Trans>Results</Trans>
											</h4>
											<div className="space-y-2 text-sm">
												{project.metrics.map((metric, idx) => (
													<div key={idx} className="flex items-center justify-between">
														<span className="text-muted-foreground">{metric.label}</span>
														<div className="flex items-center gap-2">
															<span className="font-medium">{metric.value}</span>
															{metric.change && (
																<Badge variant="outline" className="bg-green-500/10 text-green-600 text-xs">
																	{metric.change}
																</Badge>
															)}
														</div>
													</div>
												))}
											</div>
										</div>
									)}
								</div>

								{/* Technologies */}
								{project.technologies.length > 0 && (
									<div>
										<h4 className="mb-2 font-semibold">
											<Trans>Technologies used</Trans>
										</h4>
										<div className="flex flex-wrap gap-2">
											{project.technologies.map((tech) => (
												<Badge key={tech.name} variant="secondary">
													{tech.name}
												</Badge>
											))}
										</div>
									</div>
								)}

								{/* Skills */}
								{project.skills.length > 0 && (
									<div>
										<h4 className="mb-2 font-semibold">
											<Trans>Applied skills</Trans>
										</h4>
										<div className="flex flex-wrap gap-2">
											{project.skills.map((skill) => (
												<Badge key={skill} variant="outline">
													{skill}
												</Badge>
											))}
										</div>
									</div>
								)}

								{/* Links */}
								{project.links.length > 0 && (
									<div>
										<h4 className="mb-2 font-semibold">
											<Trans>Project links</Trans>
										</h4>
										<div className="flex flex-wrap gap-2">
											{project.links.map((link) => {
												const linkIcons = {
													live: GlobeIcon,
													github: GithubLogoIcon,
													demo: RocketLaunchIcon,
													documentation: LinkIcon,
													figma: ImageIcon,
													video: EyeIcon,
												};
												const LinkIconComponent = linkIcons[link.type];

												return (
													<Button key={link.url} variant="outline" size="sm" asChild>
														<a href={link.url} target="_blank" rel="noopener noreferrer">
															<LinkIconComponent className="mr-2 size-4" />
															{link.label}
														</a>
													</Button>
												);
											})}
										</div>
									</div>
								)}

								{/* Case Study Link */}
								{getCaseStudyForProject(project.id) && (
									<Card className="border-primary/30 bg-primary/5">
										<CardContent className="flex items-center justify-between p-4">
											<div className="flex items-center gap-3">
												<LightbulbIcon className="size-6 text-primary" weight="duotone" />
												<div>
													<p className="font-medium">
														<Trans>Case study available</Trans>
													</p>
													<p className="text-muted-foreground text-sm">
														<Trans>Discover the methodology and detailed results</Trans>
													</p>
												</div>
											</div>
											<Button
												variant="outline"
												className="gap-2"
												onClick={() => {
													const cs = getCaseStudyForProject(project.id);
													if (cs) {
														onViewCaseStudy(cs);
														onOpenChange(false);
													}
												}}
											>
												<Trans>Read the study</Trans>
												<ArrowRightIcon className="size-4" />
											</Button>
										</CardContent>
									</Card>
								)}
							</div>
						</ScrollArea>
						<DialogFooter>
							<Button variant="outline" className="gap-2" onClick={() => onEdit(project)}>
								<PencilSimpleIcon className="size-4" />
								<Trans>Edit</Trans>
							</Button>
							<Button className="gap-2">
								<ArrowSquareOutIcon className="size-4" />
								<Trans>View fullscreen</Trans>
							</Button>
						</DialogFooter>
					</>
				)}
			</DialogContent>
		</Dialog>
	);
}

// ─── Case Study Detail Dialog ─────────────────────────────────────────────────

interface CaseStudyDetailDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	caseStudy: CaseStudy | null;
}

export function CaseStudyDetailDialog({ open, onOpenChange, caseStudy }: CaseStudyDetailDialogProps) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-4xl">
				{caseStudy && (
					<>
						<DialogHeader>
							<DialogTitle className="text-2xl">{caseStudy.title}</DialogTitle>
							<DialogDescription>{caseStudy.overview}</DialogDescription>
						</DialogHeader>
						<ScrollArea className="max-h-[60vh]">
							<div className="space-y-6 pr-4">
								{/* Challenge */}
								{caseStudy.challenge && (
									<div className="rounded-lg border p-4">
										<h4 className="mb-2 flex items-center gap-2 font-semibold">
											<WarningCircleIcon className="size-5 text-red-500" weight="duotone" />
											<Trans>The challenge</Trans>
										</h4>
										<p className="text-muted-foreground">{caseStudy.challenge}</p>
									</div>
								)}

								{/* Approach */}
								{caseStudy.approach && (
									<div className="rounded-lg border p-4">
										<h4 className="mb-2 flex items-center gap-2 font-semibold">
											<LightbulbIcon className="size-5 text-amber-500" weight="duotone" />
											<Trans>The approach</Trans>
										</h4>
										<p className="text-muted-foreground">{caseStudy.approach}</p>
									</div>
								)}

								{/* Solution */}
								{caseStudy.solution && (
									<div className="rounded-lg border p-4">
										<h4 className="mb-2 flex items-center gap-2 font-semibold">
											<CodeIcon className="size-5 text-blue-500" weight="duotone" />
											<Trans>The solution</Trans>
										</h4>
										<p className="text-muted-foreground">{caseStudy.solution}</p>
									</div>
								)}

								{/* Timeline */}
								{caseStudy.timeline.length > 0 && (
									<div>
										<h4 className="mb-4 font-semibold">
											<Trans>Project timeline</Trans>
										</h4>
										<div className="space-y-4">
											{caseStudy.timeline.map((phase, index) => (
												<div key={index} className="flex gap-4">
													<div className="flex flex-col items-center">
														<div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 font-bold text-primary text-sm">
															{index + 1}
														</div>
														{index < caseStudy.timeline.length - 1 && <div className="mt-2 h-full w-0.5 bg-border" />}
													</div>
													<div className="pb-4">
														<div className="flex items-center gap-2">
															<p className="font-semibold">{phase.phase}</p>
															<Badge variant="outline" className="text-xs">
																{phase.duration}
															</Badge>
														</div>
														<p className="mt-1 text-muted-foreground text-sm">{phase.description}</p>
													</div>
												</div>
											))}
										</div>
									</div>
								)}

								{/* Key Features */}
								{caseStudy.keyFeatures.length > 0 && (
									<div>
										<h4 className="mb-2 font-semibold">
											<Trans>Key features</Trans>
										</h4>
										<div className="grid gap-2 md:grid-cols-2">
											{caseStudy.keyFeatures.map((feature, idx) => (
												<div key={idx} className="flex items-center gap-2">
													<CheckCircleIcon className="size-4 shrink-0 text-green-500" weight="fill" />
													<span className="text-sm">{feature}</span>
												</div>
											))}
										</div>
									</div>
								)}

								{/* Results */}
								{caseStudy.results && (
									<div className="rounded-lg border border-green-500/30 bg-green-500/5 p-4">
										<h4 className="mb-2 flex items-center gap-2 font-semibold text-green-600 dark:text-green-400">
											<CheckCircleIcon className="size-5" weight="fill" />
											<Trans>Results achieved</Trans>
										</h4>
										<p className="text-muted-foreground">{caseStudy.results}</p>
									</div>
								)}

								{/* Learnings */}
								{caseStudy.learnings && (
									<div className="rounded-lg border p-4">
										<h4 className="mb-2 flex items-center gap-2 font-semibold">
											<SparkleIcon className="size-5 text-purple-500" weight="duotone" />
											<Trans>Lessons learned</Trans>
										</h4>
										<p className="text-muted-foreground">{caseStudy.learnings}</p>
									</div>
								)}
							</div>
						</ScrollArea>
						<DialogFooter>
							<DialogClose asChild>
								<Button variant="outline">
									<Trans>Close</Trans>
								</Button>
							</DialogClose>
							<Button className="gap-2">
								<DownloadSimpleIcon className="size-4" />
								<Trans>Export PDF</Trans>
							</Button>
						</DialogFooter>
					</>
				)}
			</DialogContent>
		</Dialog>
	);
}

// ─── Project Card ─────────────────────────────────────────────────────────────

interface ProjectCardProps {
	project: Project;
	onView: () => void;
	onEdit: () => void;
	onDelete: () => void;
	featured?: boolean;
}

function ProjectCard({ project, onView, onEdit, onDelete, featured = false }: ProjectCardProps) {
	return (
		<CometCard translateDepth={3} rotateDepth={6}>
			<Card
				className={cn(
					"group h-full overflow-hidden transition-all hover:shadow-xl",
					featured && "border-amber-500/30 bg-gradient-to-br from-amber-500/5 to-transparent",
				)}
			>
				<div className="relative aspect-video overflow-hidden bg-muted">
					<div className="flex h-full items-center justify-center">
						<ImageIcon className="size-12 text-muted-foreground" weight="duotone" />
					</div>
					{featured && (
						<div className="absolute top-2 left-2">
							<Badge className="gap-1 bg-amber-500 text-white">
								<StarIcon className="size-3" weight="fill" />
								<Trans>Featured</Trans>
							</Badge>
						</div>
					)}
					<div className="absolute top-2 right-2">
						<Badge className={cn(STATUS_CONFIG[project.status].bgColor, STATUS_CONFIG[project.status].color)}>
							{STATUS_CONFIG[project.status].label}
						</Badge>
					</div>
					<div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/60 opacity-0 transition-opacity group-hover:opacity-100">
						<Button size="sm" variant="secondary" onClick={onView}>
							<EyeIcon className="mr-1 size-4" />
							<Trans>Details</Trans>
						</Button>
						{project.links.find((l) => l.type === "live") && (
							<Button size="sm" variant="secondary" asChild>
								<a href={project.links.find((l) => l.type === "live")?.url} target="_blank" rel="noopener noreferrer">
									<ArrowSquareOutIcon className="size-4" />
								</a>
							</Button>
						)}
					</div>
				</div>
				<CardContent className="pt-4">
					<Badge
						className={cn("mb-2", PROJECT_TYPE_CONFIG[project.type].bgColor, PROJECT_TYPE_CONFIG[project.type].color)}
					>
						{PROJECT_TYPE_CONFIG[project.type].label}
					</Badge>
					<CardTitle className="mb-1 line-clamp-1 text-lg">{project.title}</CardTitle>
					<CardDescription className="mb-2 line-clamp-2">{project.description}</CardDescription>
					<p className="mb-3 text-muted-foreground text-sm">
						<UserIcon className="mr-1 inline size-3" />
						{project.role}
					</p>
					<div className="flex flex-wrap gap-1">
						{project.skills.slice(0, 3).map((skill) => (
							<Badge key={skill} variant="secondary" className="text-xs">
								{skill}
							</Badge>
						))}
						{project.skills.length > 3 && (
							<Badge variant="secondary" className="text-xs">
								+{project.skills.length - 3}
							</Badge>
						)}
					</div>
				</CardContent>
				{project.metrics && project.metrics.length > 0 && (
					<CardFooter className="justify-between border-t pt-3">
						<div className="flex w-full items-center justify-between text-muted-foreground text-xs">
							{project.metrics.slice(0, 2).map((metric, idx) => (
								<div key={idx} className="text-center">
									<p className="font-semibold text-foreground">{metric.value}</p>
									<p className="truncate">{metric.label}</p>
								</div>
							))}
						</div>
					</CardFooter>
				)}
				{/* Action buttons */}
				<CardFooter className="justify-end gap-2 border-t pt-3">
					<Button variant="ghost" size="sm" onClick={onEdit}>
						<PencilSimpleIcon className="size-4" />
					</Button>
					<AlertDialog>
						<AlertDialogTrigger asChild>
							<Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
								<TrashIcon className="size-4" />
							</Button>
						</AlertDialogTrigger>
						<AlertDialogContent>
							<AlertDialogHeader>
								<AlertDialogTitle>
									<Trans>Delete this project?</Trans>
								</AlertDialogTitle>
								<AlertDialogDescription>
									<Trans>This action is irreversible. The project will be permanently deleted.</Trans>
								</AlertDialogDescription>
							</AlertDialogHeader>
							<AlertDialogFooter>
								<AlertDialogCancel>
									<Trans>Cancel</Trans>
								</AlertDialogCancel>
								<AlertDialogAction onClick={onDelete}>
									<Trans>Delete</Trans>
								</AlertDialogAction>
							</AlertDialogFooter>
						</AlertDialogContent>
					</AlertDialog>
				</CardFooter>
			</Card>
		</CometCard>
	);
}
