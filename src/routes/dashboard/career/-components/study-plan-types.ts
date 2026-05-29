export interface CareerGoal {
	id: string;
	targetRole: string;
	industry: string;
	timeline: number; // months
	description: string;
	createdAt: string;
}

export interface Skill {
	id: string;
	name: string;
	category: "technical" | "soft" | "language" | "certification";
	currentLevel: number; // 1-5
	targetLevel: number; // 1-5
	priority: "high" | "medium" | "low";
}

export interface LearningResource {
	id: string;
	title: string;
	type: "course" | "book" | "tutorial" | "certification" | "video";
	platform: string;
	url: string;
	duration: string;
	skillId: string;
	completed: boolean;
	rating?: number;
}

export interface StudyTask {
	id: string;
	title: string;
	description: string;
	skillId: string;
	resourceId?: string;
	scheduledDate: string;
	duration: number; // minutes
	completed: boolean;
	type: "study" | "practice" | "review" | "assessment";
}

export interface Milestone {
	id: string;
	title: string;
	description: string;
	targetDate: string;
	completed: boolean;
	completedDate?: string;
	skillIds: string[];
}

export interface SpacedRepetitionCard {
	id: string;
	skillId: string;
	question: string;
	answer: string;
	nextReview: string;
	interval: number; // days
	easeFactor: number;
	repetitions: number;
}

export interface StudyStreak {
	currentStreak: number;
	longestStreak: number;
	lastStudyDate: string;
	totalStudyDays: number;
	totalStudyMinutes: number;
	weeklyGoal: number; // minutes per week
	badges: StudyBadge[];
}

export interface StudyBadge {
	id: string;
	name: string;
	description: string;
	icon: string;
	earnedDate: string;
}

export interface StudyPlanData {
	careerGoal: CareerGoal | null;
	skills: Skill[];
	resources: LearningResource[];
	tasks: StudyTask[];
	milestones: Milestone[];
	flashcards: SpacedRepetitionCard[];
	streak: StudyStreak;
	lastUpdated: string;
}

// Form state types
export interface GoalFormState {
	targetRole: string;
	industry: string;
	timeline: number;
	description: string;
}

export interface SkillFormState {
	name: string;
	category: Skill["category"];
	currentLevel: number;
	targetLevel: number;
	priority: Skill["priority"];
}

export interface ResourceFormState {
	title: string;
	type: LearningResource["type"];
	platform: string;
	url: string;
	duration: string;
	skillId: string;
}

export interface FlashcardFormState {
	skillId: string;
	question: string;
	answer: string;
}

// Component prop types
export interface HeroSectionProps {
	data: StudyPlanData;
}

export interface OverviewTabProps {
	data: StudyPlanData;
	overallProgress: number;
	todayTasks: StudyTask[];
	weekProgress: number;
	isGoalDialogOpen: boolean;
	setIsGoalDialogOpen: (open: boolean) => void;
	goalForm: GoalFormState;
	setGoalForm: (form: GoalFormState) => void;
	handleSaveGoal: () => void;
	handleGenerateRoadmap: () => Promise<void>;
	handleExportPDF: () => void;
	handleToggleTask: (taskId: string) => void;
	handleToggleMilestone: (milestoneId: string) => void;
	isGenerating: boolean;
	saveData: (data: StudyPlanData) => void;
}

export interface SkillsGapTabProps {
	data: StudyPlanData;
	isSkillDialogOpen: boolean;
	setIsSkillDialogOpen: (open: boolean) => void;
	skillForm: SkillFormState;
	setSkillForm: (form: SkillFormState) => void;
	handleAddSkill: () => void;
	handleUpdateSkillLevel: (skillId: string, level: number) => void;
	handleDeleteSkill: (skillId: string) => void;
}

export interface ScheduleTabProps {
	data: StudyPlanData;
	handleToggleTask: (taskId: string) => void;
}

export interface ResourcesTabProps {
	data: StudyPlanData;
	filteredResources: LearningResource[];
	searchQuery: string;
	setSearchQuery: (query: string) => void;
	isResourceDialogOpen: boolean;
	setIsResourceDialogOpen: (open: boolean) => void;
	resourceForm: ResourceFormState;
	setResourceForm: (form: ResourceFormState) => void;
	handleAddResource: () => void;
	handleToggleResource: (resourceId: string) => void;
}

export interface FlashcardsTabProps {
	data: StudyPlanData;
	dueFlashcards: SpacedRepetitionCard[];
	currentFlashcardIndex: number;
	setCurrentFlashcardIndex: (index: number) => void;
	showFlashcardAnswer: boolean;
	setShowFlashcardAnswer: (show: boolean) => void;
	isFlashcardDialogOpen: boolean;
	setIsFlashcardDialogOpen: (open: boolean) => void;
	flashcardForm: FlashcardFormState;
	setFlashcardForm: (form: FlashcardFormState) => void;
	handleAddFlashcard: () => void;
	handleReviewFlashcard: (quality: number) => void;
}

export interface AchievementsTabProps {
	data: StudyPlanData;
	weekProgress: number;
	saveData: (data: StudyPlanData) => void;
}
