export interface CareerGoal {
	id: string;
	currentRole: string;
	targetRole: string;
	industry: string;
	yearsExperience: number;
	timeline: number; // months
	priorities: string[];
	constraints: string[];
	createdAt: string;
}

export interface RoadmapStep {
	id: string;
	order: number;
	title: string;
	description: string;
	type: "skill" | "experience" | "certification" | "networking" | "education" | "project";
	duration: number; // weeks
	skills: SkillRequirement[];
	milestones: Milestone[];
	resources: Resource[];
	estimatedSalary?: { min: number; max: number };
	completed: boolean;
	completedDate?: string;
	startDate?: string;
}

export interface SkillRequirement {
	id: string;
	name: string;
	category: "technical" | "soft" | "language" | "tool" | "certification";
	currentLevel: number; // 0-5
	requiredLevel: number; // 1-5
	priority: "critical" | "important" | "nice-to-have";
	resources: Resource[];
}

export interface Milestone {
	id: string;
	title: string;
	description: string;
	targetDate: string;
	completed: boolean;
	completedDate?: string;
	type: "checkpoint" | "achievement" | "certification" | "project";
}

export interface Resource {
	id: string;
	title: string;
	type: "course" | "book" | "video" | "article" | "certification" | "tool" | "community";
	platform: string;
	url: string;
	duration: string;
	cost: "free" | "paid" | "subscription";
	rating?: number;
	recommended: boolean;
}

export interface AlternativePath {
	id: string;
	name: string;
	description: string;
	duration: number; // weeks
	steps: RoadmapStep[];
	successProbability: number;
	advantages: string[];
	challenges: string[];
	estimatedCost: string;
	isSelected: boolean;
}

export interface RoadmapProgress {
	overallProgress: number;
	currentStepId: string | null;
	completedSteps: number;
	totalSteps: number;
	completedMilestones: number;
	totalMilestones: number;
	completedSkills: number;
	totalSkills: number;
	startDate: string;
	estimatedCompletionDate: string;
	actualProgress: number; // vs expected
	streakDays: number;
	lastActivityDate: string;
}

export interface SavedRoadmap {
	id: string;
	name: string;
	goal: CareerGoal;
	selectedPath: AlternativePath;
	progress: RoadmapProgress;
	createdAt: string;
	updatedAt: string;
	isShared: boolean;
	shareCode?: string;
}

// Database roadmap type
export interface DbRoadmap {
	id: string;
	userId: string;
	name: string;
	goal: CareerGoal;
	selectedPath: AlternativePath;
	progress: RoadmapProgress;
	isShared: boolean;
	shareCode: string | null;
	createdAt: Date;
	updatedAt: Date;
}

export interface IndustryOption {
	value: string;
	label: string;
	icon: string;
}

export interface PriorityOption {
	value: string;
	label: string;
}

export interface ConstraintOption {
	value: string;
	label: string;
}

export interface CreateTabContentProps {
	currentRole: string;
	setCurrentRole: (value: string) => void;
	targetRole: string;
	setTargetRole: (value: string) => void;
	industry: string;
	setIndustry: (value: string) => void;
	yearsExperience: number[];
	setYearsExperience: (value: number[]) => void;
	timeline: number[];
	setTimeline: (value: number[]) => void;
	selectedPriorities: string[];
	setSelectedPriorities: React.Dispatch<React.SetStateAction<string[]>>;
	selectedConstraints: string[];
	setSelectedConstraints: React.Dispatch<React.SetStateAction<string[]>>;
	industries: IndustryOption[];
	priorities: PriorityOption[];
	constraints: ConstraintOption[];
	isGenerating: boolean;
	onGenerate: () => void;
	onReset: () => void;
}

export interface CompareTabContentProps {
	generatedPaths: AlternativePath[];
	selectedPath: AlternativePath | undefined;
	expandedSteps: Set<string>;
	isSaveDialogOpen: boolean;
	setIsSaveDialogOpen: (open: boolean) => void;
	roadmapName: string;
	setRoadmapName: (value: string) => void;
	isSaving: boolean;
	onSelectPath: (pathId: string) => void;
	onToggleExpand: (stepId: string) => void;
	onSaveRoadmap: () => void;
}

export interface ProgressTabContentProps {
	currentRoadmap: SavedRoadmap;
	expandedSteps: Set<string>;
	isShareDialogOpen: boolean;
	setIsShareDialogOpen: (open: boolean) => void;
	shareCode: string;
	isSharing: boolean;
	onToggleStepComplete: (stepId: string) => void;
	onToggleExpand: (stepId: string) => void;
	onShareRoadmap: () => void;
	onExportRoadmap: () => void;
}

export interface SavedRoadmapsTabContentProps {
	savedRoadmaps: SavedRoadmap[];
	currentRoadmapId: string | undefined;
	isUpdating: boolean;
	isDeleting: boolean;
	onLoadRoadmap: (roadmapId: string) => void;
	onDeleteRoadmap: (roadmapId: string) => void;
	onCreateNew: () => void;
}
