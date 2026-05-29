import { t } from "@lingui/core/macro";
import {
	BookmarkSimpleIcon,
	BookOpenIcon,
	GraduationCapIcon,
	PathIcon,
	SparkleIcon,
	StarIcon,
} from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ErrorComponent } from "@/components/error-component";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { authClient } from "@/integrations/auth/client";
import { orpc } from "@/integrations/orpc/client";
import { DashboardHeader } from "../-components/header";
import {
	HeroSection,
	LearningPathsTab,
	MyTrainingsTab,
	OverviewTab,
	ProgramsTab,
	ResourcesLibraryTab,
	ResourcesLoadingSkeleton,
	SuccessStoriesTab,
} from "./-components/resources-components";
import type { TrainingInterest } from "./-components/resources-types";

export const Route = createFileRoute("/dashboard/resources/")({
	component: ResourcesHub,
	errorComponent: ErrorComponent,
});

function ResourcesHub() {
	const { data: session } = authClient.useSession();
	const [searchQuery, setSearchQuery] = useState("");
	const [activeTab, setActiveTab] = useState("overview");
	const [programCategory, setProgramCategory] = useState<"all" | "healthcare" | "industrial" | "hse">("all");
	const [resourceTypeFilter, setResourceTypeFilter] = useState<string>("all");
	const [resourceCategoryFilter, setResourceCategoryFilter] = useState<string>("all");
	const [successStoryIndex, setSuccessStoryIndex] = useState(0);
	const [isAddTrainingDialogOpen, setIsAddTrainingDialogOpen] = useState(false);
	const [selectedProgramForTracking, setSelectedProgramForTracking] = useState<string>("");
	const [trainingNotes, setTrainingNotes] = useState("");

	const [myTrainings, setMyTrainings] = useState<TrainingInterest[]>([]);

	const [pathProgress] = useState<Record<string, number>>({});

	// Fetch data
	const { data: programs, isLoading: programsLoading } = useQuery({
		...orpc.resources.getPrograms.queryOptions({ input: { language: "fr" } }),
		enabled: !!session?.user,
	});

	const { data: resources, isLoading: resourcesLoading } = useQuery({
		...orpc.resources.getResources.queryOptions({ input: { language: "fr" } }),
		enabled: !!session?.user,
	});

	const { data: learningPaths, isLoading: pathsLoading } = useQuery({
		...orpc.resources.getLearningPaths.queryOptions({ input: { language: "fr" } }),
		enabled: !!session?.user,
	});

	const { data: successStories, isLoading: storiesLoading } = useQuery({
		...orpc.resources.getSuccessStories.queryOptions({ input: { language: "fr", limit: 10 } }),
		enabled: !!session?.user,
	});

	const isLoading = programsLoading || resourcesLoading || pathsLoading || storiesLoading;

	// Filter programs by category
	const filteredPrograms = useMemo(() => {
		if (!programs) return [];
		if (programCategory === "all") return programs;
		return programs.filter((p) => p.category === programCategory);
	}, [programs, programCategory]);

	// Filter resources by search, type, and category
	const filteredResources = useMemo(() => {
		if (!resources) return [];
		let filtered = resources;

		if (searchQuery.trim()) {
			const query = searchQuery.toLowerCase();
			filtered = filtered.filter(
				(r) =>
					r.title.toLowerCase().includes(query) ||
					r.description.toLowerCase().includes(query) ||
					r.tags.some((tag) => tag.toLowerCase().includes(query)),
			);
		}

		if (resourceTypeFilter !== "all") {
			filtered = filtered.filter((r) => r.type === resourceTypeFilter);
		}

		if (resourceCategoryFilter !== "all") {
			filtered = filtered.filter((r) => r.category === resourceCategoryFilter);
		}

		return filtered;
	}, [resources, searchQuery, resourceTypeFilter, resourceCategoryFilter]);

	// Group resources by type for quick access
	const guides = resources?.filter((r) => r.type === "guide") ?? [];
	const videos = resources?.filter((r) => r.type === "video") ?? [];
	const templates = resources?.filter((r) => r.type === "template") ?? [];
	const articles = resources?.filter((r) => r.type === "article") ?? [];

	// Auto-rotate success stories carousel
	useEffect(() => {
		if (!successStories || successStories.length === 0) return;
		const interval = setInterval(() => {
			setSuccessStoryIndex((prev) => (prev + 1) % successStories.length);
		}, 6000);
		return () => clearInterval(interval);
	}, [successStories]);

	const nextStory = useCallback(() => {
		if (!successStories) return;
		setSuccessStoryIndex((prev) => (prev + 1) % successStories.length);
	}, [successStories]);

	const prevStory = useCallback(() => {
		if (!successStories) return;
		setSuccessStoryIndex((prev) => (prev - 1 + successStories.length) % successStories.length);
	}, [successStories]);

	// Add training interest handler
	const handleAddTraining = () => {
		if (!selectedProgramForTracking || !programs) return;
		const program = programs.find((p) => p.id === selectedProgramForTracking);
		if (!program) return;

		const newInterest: TrainingInterest = {
			id: Date.now().toString(),
			programId: program.id,
			programName: program.name,
			category: program.category,
			addedAt: new Date().toISOString(),
			progress: 0,
			notes: trainingNotes,
		};

		setMyTrainings((prev) => [...prev, newInterest]);
		setSelectedProgramForTracking("");
		setTrainingNotes("");
		setIsAddTrainingDialogOpen(false);
	};

	// Remove training interest
	const handleRemoveTraining = (id: string) => {
		setMyTrainings((prev) => prev.filter((t) => t.id !== id));
	};

	if (isLoading) {
		return <ResourcesLoadingSkeleton />;
	}

	return (
		<>
			<DashboardHeader icon={GraduationCapIcon} title={t`Training Center & Resources`} />

			<HeroSection
				searchQuery={searchQuery}
				setSearchQuery={setSearchQuery}
				programsCount={programs?.length ?? 0}
				resourcesCount={resources?.length ?? 0}
			/>

			{/* Main Navigation Tabs */}
			<Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
				<TabsList className="flex h-auto flex-wrap gap-2 bg-transparent p-0">
					{[
						{ value: "overview", icon: SparkleIcon, label: "Overview" },
						{ value: "programs", icon: GraduationCapIcon, label: "Programs" },
						{ value: "learning-paths", icon: PathIcon, label: "Pathways" },
						{ value: "resources", icon: BookOpenIcon, label: "Library" },
						{ value: "success-stories", icon: StarIcon, label: "Success Stories" },
						{ value: "my-trainings", icon: BookmarkSimpleIcon, label: "My Training" },
					].map((tab) => (
						<TabsTrigger
							key={tab.value}
							value={tab.value}
							className="gap-2 rounded-full border border-transparent bg-muted/50 px-4 py-2 data-[state=active]:border-primary/30 data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
						>
							<tab.icon className="size-4" />
							{tab.label}
						</TabsTrigger>
					))}
				</TabsList>

				<OverviewTab
					programs={programs ?? []}
					filteredPrograms={filteredPrograms}
					programCategory={programCategory}
					setProgramCategory={setProgramCategory}
					learningPaths={learningPaths}
					pathProgress={pathProgress}
					successStories={successStories}
					successStoryIndex={successStoryIndex}
					setSuccessStoryIndex={setSuccessStoryIndex}
					nextStory={nextStory}
					prevStory={prevStory}
					guides={guides}
					videos={videos}
					templates={templates}
					articles={articles}
					setActiveTab={setActiveTab}
				/>

				<ProgramsTab
					programs={programs}
					filteredPrograms={filteredPrograms}
					programCategory={programCategory}
					setProgramCategory={setProgramCategory}
				/>

				<LearningPathsTab learningPaths={learningPaths} pathProgress={pathProgress} />

				<ResourcesLibraryTab
					filteredResources={filteredResources}
					searchQuery={searchQuery}
					setSearchQuery={setSearchQuery}
					resourceTypeFilter={resourceTypeFilter}
					setResourceTypeFilter={setResourceTypeFilter}
					resourceCategoryFilter={resourceCategoryFilter}
					setResourceCategoryFilter={setResourceCategoryFilter}
				/>

				<SuccessStoriesTab successStories={successStories} />

				<MyTrainingsTab
					myTrainings={myTrainings}
					programs={programs}
					isAddTrainingDialogOpen={isAddTrainingDialogOpen}
					setIsAddTrainingDialogOpen={setIsAddTrainingDialogOpen}
					selectedProgramForTracking={selectedProgramForTracking}
					setSelectedProgramForTracking={setSelectedProgramForTracking}
					trainingNotes={trainingNotes}
					setTrainingNotes={setTrainingNotes}
					handleAddTraining={handleAddTraining}
					handleRemoveTraining={handleRemoveTraining}
				/>
			</Tabs>
		</>
	);
}
