import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import {
	ArrowSquareOutIcon,
	ArrowsOutCardinalIcon,
	ClipboardTextIcon,
	CloudArrowUpIcon,
	CodeIcon,
	DownloadSimpleIcon,
	EyeIcon,
	GlobeIcon,
	GridFourIcon,
	HeartIcon,
	ImageIcon,
	ListIcon,
	MagnifyingGlassIcon,
	PencilSimpleIcon,
	PlusIcon,
	ShareNetworkIcon,
	StarIcon,
	TagIcon,
	TrashIcon,
} from "@phosphor-icons/react";
import { AnimatePresence, motion, Reorder } from "motion/react";
import { CometCard } from "@/components/animation/comet-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardTitle } from "@/components/ui/card";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/utils/style";

import { PROJECT_CATEGORIES } from "./portfolio-config";
import type { Project, WorkSample } from "./portfolio-types";

// ─── Project Card ─────────────────────────────────────────────────────────

function ProjectCard({
	project,
	onView,
	onDelete,
	onToggleFeatured,
	featured = false,
}: {
	project: Project;
	onView: () => void;
	onDelete?: (id: string) => void;
	onToggleFeatured?: (id: string, featured: boolean) => void;
	featured?: boolean;
}) {
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
						<Badge
							variant={
								project.status === "completed" ? "default" : project.status === "in-progress" ? "secondary" : "outline"
							}
						>
							{project.status}
						</Badge>
					</div>
					<div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/60 opacity-0 transition-opacity group-hover:opacity-100">
						<Button size="sm" variant="secondary" onClick={onView}>
							<EyeIcon className="mr-1 size-4" />
							<Trans>View</Trans>
						</Button>
						{onToggleFeatured && (
							<Button size="sm" variant="secondary" onClick={() => onToggleFeatured(project.id, !project.featured)}>
								<StarIcon className="size-4" weight={project.featured ? "fill" : "regular"} />
							</Button>
						)}
						{onDelete && (
							<Button size="sm" variant="destructive" onClick={() => onDelete(project.id)}>
								<TrashIcon className="size-4" />
							</Button>
						)}
					</div>
				</div>
				<CardContent className="pt-4">
					<CardTitle className="mb-1 line-clamp-1 text-lg">{project.title}</CardTitle>
					<CardDescription className="mb-3 line-clamp-2">{project.description}</CardDescription>
					<div className="flex flex-wrap gap-1">
						{project.tags.slice(0, 3).map((tag) => (
							<Badge key={tag} variant="secondary" className="text-xs">
								{tag}
							</Badge>
						))}
						{project.tags.length > 3 && (
							<Badge variant="secondary" className="text-xs">
								+{project.tags.length - 3}
							</Badge>
						)}
					</div>
				</CardContent>
				{project.metrics && (
					<CardFooter className="border-t pt-3">
						<div className="flex w-full items-center justify-between text-muted-foreground text-xs">
							<div className="flex items-center gap-1">
								<EyeIcon className="size-3" />
								{project.metrics.views}
							</div>
							<div className="flex items-center gap-1">
								<HeartIcon className="size-3" />
								{project.metrics.likes}
							</div>
							<div className="flex items-center gap-1">
								<ShareNetworkIcon className="size-3" />
								{project.metrics.shares}
							</div>
						</div>
					</CardFooter>
				)}
			</Card>
		</CometCard>
	);
}

// ─── Project List Item ────────────────────────────────────────────────────

function ProjectListItem({ project, onView }: { project: Project; onView: () => void }) {
	return (
		<Card className="group transition-all hover:shadow-md">
			<CardContent className="flex items-center gap-4 p-4">
				<div className="relative aspect-video w-40 shrink-0 overflow-hidden rounded-lg bg-muted">
					<div className="flex h-full items-center justify-center">
						<ImageIcon className="size-8 text-muted-foreground" weight="duotone" />
					</div>
				</div>
				<div className="flex-1">
					<div className="mb-1 flex items-center gap-2">
						<h4 className="font-semibold">{project.title}</h4>
						{project.featured && <StarIcon className="size-4 text-amber-500" weight="fill" />}
						<Badge
							variant={
								project.status === "completed" ? "default" : project.status === "in-progress" ? "secondary" : "outline"
							}
							className="ml-auto"
						>
							{project.status}
						</Badge>
					</div>
					<p className="mb-2 line-clamp-1 text-muted-foreground text-sm">{project.description}</p>
					<div className="flex flex-wrap gap-1">
						{project.tags.slice(0, 5).map((tag) => (
							<Badge key={tag} variant="secondary" className="text-xs">
								{tag}
							</Badge>
						))}
					</div>
				</div>
				<div className="flex items-center gap-2">
					{project.metrics && (
						<div className="text-right text-muted-foreground text-xs">
							<div className="flex items-center gap-1">
								<EyeIcon className="size-3" />
								{project.metrics.views}
							</div>
						</div>
					)}
					<Button variant="ghost" size="icon" onClick={onView}>
						<EyeIcon className="size-4" />
					</Button>
					<Button variant="ghost" size="icon">
						<PencilSimpleIcon className="size-4" />
					</Button>
				</div>
			</CardContent>
		</Card>
	);
}

// ─── Work Sample Card ─────────────────────────────────────────────────────

function WorkSampleCard({ sample }: { sample: WorkSample }) {
	const typeIcons = {
		image: ImageIcon,
		document: ClipboardTextIcon,
		video: EyeIcon,
		code: CodeIcon,
	};
	const TypeIcon = typeIcons[sample.type];

	return (
		<Card className="group overflow-hidden transition-all hover:shadow-lg">
			<div className="relative aspect-video overflow-hidden bg-muted">
				<div className="flex h-full items-center justify-center">
					<TypeIcon className="size-12 text-muted-foreground" weight="duotone" />
				</div>
				<div className="absolute top-2 right-2">
					<Badge variant="secondary" className="capitalize">
						{sample.type}
					</Badge>
				</div>
				<div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/60 opacity-0 transition-opacity group-hover:opacity-100">
					<Button size="icon" variant="secondary" aria-label={t`Expand`}>
						<ArrowsOutCardinalIcon className="size-4" />
					</Button>
					<Button size="icon" variant="secondary" aria-label={t`Download`}>
						<DownloadSimpleIcon className="size-4" />
					</Button>
					<Button size="icon" variant="destructive" aria-label={t`Delete`}>
						<TrashIcon className="size-4" />
					</Button>
				</div>
			</div>
			<CardContent className="pt-4">
				<CardTitle className="line-clamp-1 text-base">{sample.title}</CardTitle>
				<CardDescription className="line-clamp-2 text-sm">{sample.description}</CardDescription>
				<div className="mt-2 flex flex-wrap gap-1">
					{sample.tags.map((tag) => (
						<Badge key={tag} variant="outline" className="text-xs">
							{tag}
						</Badge>
					))}
				</div>
			</CardContent>
		</Card>
	);
}

// ─── Projects Tab Content ─────────────────────────────────────────────────

export function ProjectsTabContent({
	searchQuery,
	setSearchQuery,
	selectedCategory,
	setSelectedCategory,
	viewMode,
	setViewMode,
	isNewProjectDialogOpen,
	setIsNewProjectDialogOpen,
	newProject,
	setNewProject,
	featuredProjects,
	filteredProjects,
	onViewProject,
	onDeleteProject,
	onToggleFeatured,
	onCreateProject,
	isCreating,
}: {
	searchQuery: string;
	setSearchQuery: (v: string) => void;
	selectedCategory: string;
	setSelectedCategory: (v: string) => void;
	viewMode: "grid" | "list";
	setViewMode: (v: "grid" | "list") => void;
	isNewProjectDialogOpen: boolean;
	setIsNewProjectDialogOpen: (v: boolean) => void;
	newProject: Partial<Project>;
	setNewProject: (v: Partial<Project>) => void;
	featuredProjects: Project[];
	filteredProjects: Project[];
	onViewProject: (project: Project) => void;
	onDeleteProject?: (id: string) => void;
	onToggleFeatured?: (id: string, featured: boolean) => void;
	onCreateProject?: () => void;
	isCreating?: boolean;
}) {
	return (
		<TabsContent value="projects" className="space-y-8">
			{/* Filters & Actions */}
			<div className="flex flex-wrap items-center justify-between gap-4">
				<div className="flex flex-1 flex-wrap items-center gap-4">
					{/* Search */}
					<div className="relative max-w-md flex-1">
						<MagnifyingGlassIcon className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
						<Input
							placeholder={t`Search projects...`}
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="pl-9"
						/>
					</div>

					{/* Category Filter */}
					<Select value={selectedCategory} onValueChange={setSelectedCategory}>
						<SelectTrigger className="w-48">
							<TagIcon className="mr-2 size-4" />
							<SelectValue placeholder={t`Category`} />
						</SelectTrigger>
						<SelectContent>
							{PROJECT_CATEGORIES.map((category) => (
								<SelectItem key={category} value={category}>
									{category}
								</SelectItem>
							))}
						</SelectContent>
					</Select>

					{/* View Mode */}
					<Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "grid" | "list")}>
						<TabsList>
							<TabsTrigger value="grid" className="rounded-r-none">
								<GridFourIcon />
							</TabsTrigger>
							<TabsTrigger value="list" className="rounded-l-none">
								<ListIcon />
							</TabsTrigger>
						</TabsList>
					</Tabs>
				</div>

				{/* Add Project Button */}
				<Dialog open={isNewProjectDialogOpen} onOpenChange={setIsNewProjectDialogOpen}>
					<DialogTrigger asChild>
						<Button className="gap-2">
							<PlusIcon className="size-4" />
							<Trans>Add Project</Trans>
						</Button>
					</DialogTrigger>
					<DialogContent className="max-w-2xl">
						<DialogHeader>
							<DialogTitle>
								<Trans>Add New Project</Trans>
							</DialogTitle>
							<DialogDescription>
								<Trans>Showcase your latest work by adding a new project to your portfolio.</Trans>
							</DialogDescription>
						</DialogHeader>
						<div className="grid gap-4 py-4">
							<div className="grid gap-2">
								<Label htmlFor="title">
									<Trans>Project Title</Trans>
								</Label>
								<Input
									id="title"
									placeholder={t`Enter project title`}
									value={newProject.title}
									onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
								/>
							</div>
							<div className="grid gap-2">
								<Label htmlFor="description">
									<Trans>Description</Trans>
								</Label>
								<Textarea
									id="description"
									placeholder={t`Describe your project...`}
									value={newProject.description}
									onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
								/>
							</div>
							<div className="grid grid-cols-2 gap-4">
								<div className="grid gap-2">
									<Label htmlFor="category">
										<Trans>Category</Trans>
									</Label>
									<Select
										value={newProject.category}
										onValueChange={(v) => setNewProject({ ...newProject, category: v })}
									>
										<SelectTrigger>
											<SelectValue placeholder={t`Select category`} />
										</SelectTrigger>
										<SelectContent>
											{PROJECT_CATEGORIES.filter((c) => c !== "All").map((category) => (
												<SelectItem key={category} value={category}>
													{category}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
								<div className="grid gap-2">
									<Label htmlFor="status">
										<Trans>Status</Trans>
									</Label>
									<Select
										value={newProject.status}
										onValueChange={(v) => setNewProject({ ...newProject, status: v as Project["status"] })}
									>
										<SelectTrigger>
											<SelectValue placeholder={t`Select status`} />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="completed">
												<Trans>Completed</Trans>
											</SelectItem>
											<SelectItem value="in-progress">
												<Trans>In Progress</Trans>
											</SelectItem>
											<SelectItem value="archived">
												<Trans>Archived</Trans>
											</SelectItem>
										</SelectContent>
									</Select>
								</div>
							</div>
							<div className="grid gap-2">
								<Label>
									<Trans>Project Images</Trans>
								</Label>
								<div className="flex h-32 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed transition-colors hover:border-primary/50 hover:bg-primary/5">
									<div className="text-center">
										<CloudArrowUpIcon className="mx-auto size-8 text-muted-foreground" />
										<p className="mt-2 text-muted-foreground text-sm">
											<Trans>Click or drag images to upload</Trans>
										</p>
									</div>
								</div>
							</div>
							<div className="flex items-center gap-2">
								<Switch
									checked={newProject.featured}
									onCheckedChange={(checked) => setNewProject({ ...newProject, featured: checked })}
								/>
								<Label>
									<Trans>Feature this project</Trans>
								</Label>
							</div>
						</div>
						<DialogFooter>
							<DialogClose asChild>
								<Button variant="outline">
									<Trans>Cancel</Trans>
								</Button>
							</DialogClose>
							<Button onClick={onCreateProject} disabled={isCreating}>
								{isCreating ? <Trans>Creating...</Trans> : <Trans>Add Project</Trans>}
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			</div>

			{/* Featured Projects */}
			{featuredProjects.length > 0 && (
				<div className="space-y-4">
					<div className="flex items-center gap-2">
						<StarIcon className="size-5 text-amber-500" weight="fill" />
						<h3 className="font-semibold text-xl">
							<Trans>Featured Projects</Trans>
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
									onDelete={onDeleteProject}
									onToggleFeatured={onToggleFeatured}
									featured
								/>
							</motion.div>
						))}
					</div>
				</div>
			)}

			{/* All Projects */}
			<div className="space-y-4">
				<div className="flex items-center justify-between">
					<h3 className="font-semibold text-xl">
						<Trans>All Projects</Trans>
						<span className="ml-2 text-muted-foreground">({filteredProjects.length})</span>
					</h3>
				</div>

				{viewMode === "grid" ? (
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
										onDelete={onDeleteProject}
										onToggleFeatured={onToggleFeatured}
									/>
								</motion.div>
							))}
						</AnimatePresence>
					</div>
				) : (
					<div className="space-y-4">
						<AnimatePresence>
							{filteredProjects.map((project, index) => (
								<motion.div
									key={project.id}
									layout
									initial={{ opacity: 0, x: -20 }}
									animate={{ opacity: 1, x: 0 }}
									exit={{ opacity: 0, x: -20 }}
									transition={{ delay: index * 0.05 }}
								>
									<ProjectListItem project={project} onView={() => onViewProject(project)} />
								</motion.div>
							))}
						</AnimatePresence>
					</div>
				)}
			</div>
		</TabsContent>
	);
}

// ─── Gallery Tab Content ──────────────────────────────────────────────────

export function GalleryTabContent({
	isDragging,
	handleDrop,
	handleDragOver,
	handleDragLeave,
	workSamples,
	handleReorderSamples,
}: {
	isDragging: boolean;
	handleDrop: (e: React.DragEvent) => void;
	handleDragOver: (e: React.DragEvent) => void;
	handleDragLeave: () => void;
	workSamples: WorkSample[];
	handleReorderSamples: (newOrder: WorkSample[]) => void;
}) {
	return (
		<TabsContent value="gallery" className="space-y-8">
			<div className="flex items-center justify-between">
				<div>
					<h3 className="font-semibold text-2xl">
						<Trans>Work Samples Gallery</Trans>
					</h3>
					<p className="text-muted-foreground">
						<Trans>Upload and organize your best work samples</Trans>
					</p>
				</div>
			</div>

			{/* Drop Zone */}
			<div
				className={cn(
					"flex h-48 cursor-pointer items-center justify-center rounded-2xl border-2 border-dashed transition-all duration-300",
					isDragging
						? "scale-[1.02] border-primary bg-primary/10"
						: "border-border hover:border-primary/50 hover:bg-primary/5",
				)}
				onDrop={handleDrop}
				onDragOver={handleDragOver}
				onDragLeave={handleDragLeave}
			>
				<div className="text-center">
					<motion.div animate={{ y: isDragging ? -10 : 0 }} transition={{ type: "spring", stiffness: 300 }}>
						<CloudArrowUpIcon
							className={cn("mx-auto size-16 transition-colors", isDragging ? "text-primary" : "text-muted-foreground")}
							weight="duotone"
						/>
					</motion.div>
					<p className="mt-4 font-medium text-lg">
						<Trans>Drag and drop your files here</Trans>
					</p>
					<p className="mt-1 text-muted-foreground text-sm">
						<Trans>or click to browse from your computer</Trans>
					</p>
					<p className="mt-2 text-muted-foreground text-xs">
						<Trans>Supports: Images, PDFs, Documents (Max 10MB)</Trans>
					</p>
				</div>
			</div>

			{/* Reorderable Gallery */}
			<Reorder.Group
				axis="x"
				values={workSamples}
				onReorder={handleReorderSamples}
				className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
			>
				<AnimatePresence>
					{workSamples.map((sample, index) => (
						<Reorder.Item key={sample.id} value={sample}>
							<motion.div
								initial={{ opacity: 0, scale: 0.95 }}
								animate={{ opacity: 1, scale: 1 }}
								exit={{ opacity: 0, scale: 0.95 }}
								transition={{ delay: index * 0.05 }}
								className="cursor-grab active:cursor-grabbing"
							>
								<WorkSampleCard sample={sample} />
							</motion.div>
						</Reorder.Item>
					))}
				</AnimatePresence>
			</Reorder.Group>
		</TabsContent>
	);
}

// ─── Project Detail Dialog ────────────────────────────────────────────────

export function ProjectDetailDialog({
	open,
	onOpenChange,
	project,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	project: Project | null;
}) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-4xl">
				{project && (
					<>
						<DialogHeader>
							<div className="flex items-start justify-between">
								<div>
									<DialogTitle className="text-2xl">{project.title}</DialogTitle>
									<DialogDescription>{project.description}</DialogDescription>
								</div>
								<Badge
									variant={
										project.status === "completed"
											? "default"
											: project.status === "in-progress"
												? "secondary"
												: "outline"
									}
								>
									{project.status}
								</Badge>
							</div>
						</DialogHeader>
						<ScrollArea className="max-h-[60vh]">
							<div className="space-y-6 pr-4">
								{/* Images */}
								<div className="aspect-video overflow-hidden rounded-lg bg-muted">
									<div className="flex h-full items-center justify-center">
										<ImageIcon className="size-16 text-muted-foreground" weight="duotone" />
									</div>
								</div>

								{/* Long Description */}
								{project.longDescription && (
									<div>
										<h4 className="mb-2 font-semibold">
											<Trans>About this Project</Trans>
										</h4>
										<p className="text-muted-foreground">{project.longDescription}</p>
									</div>
								)}

								{/* Tags */}
								<div>
									<h4 className="mb-2 font-semibold">
										<Trans>Technologies Used</Trans>
									</h4>
									<div className="flex flex-wrap gap-2">
										{project.tags.map((tag) => (
											<Badge key={tag} variant="secondary">
												{tag}
											</Badge>
										))}
									</div>
								</div>

								{/* Links */}
								<div>
									<h4 className="mb-2 font-semibold">
										<Trans>Project Links</Trans>
									</h4>
									<div className="flex flex-wrap gap-2">
										{project.links.live && (
											<Button variant="outline" size="sm" asChild>
												<a href={project.links.live} target="_blank" rel="noopener noreferrer">
													<GlobeIcon className="mr-2 size-4" />
													<Trans>Live Site</Trans>
												</a>
											</Button>
										)}
										{project.links.github && (
											<Button variant="outline" size="sm" asChild>
												<a href={project.links.github} target="_blank" rel="noopener noreferrer">
													<CodeIcon className="mr-2 size-4" />
													<Trans>GitHub</Trans>
												</a>
											</Button>
										)}
										{project.links.demo && (
											<Button variant="outline" size="sm" asChild>
												<a href={project.links.demo} target="_blank" rel="noopener noreferrer">
													<EyeIcon className="mr-2 size-4" />
													<Trans>Demo</Trans>
												</a>
											</Button>
										)}
									</div>
								</div>

								{/* Metrics */}
								{project.metrics && (
									<div>
										<h4 className="mb-2 font-semibold">
											<Trans>Engagement</Trans>
										</h4>
										<div className="flex gap-6">
											<div className="flex items-center gap-2">
												<EyeIcon className="size-5 text-muted-foreground" />
												<span>{project.metrics.views} views</span>
											</div>
											<div className="flex items-center gap-2">
												<HeartIcon className="size-5 text-muted-foreground" />
												<span>{project.metrics.likes} likes</span>
											</div>
											<div className="flex items-center gap-2">
												<ShareNetworkIcon className="size-5 text-muted-foreground" />
												<span>{project.metrics.shares} shares</span>
											</div>
										</div>
									</div>
								)}
							</div>
						</ScrollArea>
						<DialogFooter>
							<Button variant="outline" className="gap-2">
								<PencilSimpleIcon className="size-4" />
								<Trans>Edit Project</Trans>
							</Button>
							<Button className="gap-2">
								<ArrowSquareOutIcon className="size-4" />
								<Trans>View Public Page</Trans>
							</Button>
						</DialogFooter>
					</>
				)}
			</DialogContent>
		</Dialog>
	);
}
