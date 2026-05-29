export type ExerciseCategory = "breathing" | "affirmations" | "power_poses" | "visualization" | "anxiety_management";
export type ExerciseId = string;

export interface Exercise {
	id: ExerciseId;
	category: ExerciseCategory;
	title: string;
	titleFr: string;
	description: string;
	descriptionFr: string;
	duration: number; // in seconds
	steps?: string[];
	stepsFr?: string[];
}

export interface ExerciseStats {
	totalCompleted: number;
	streak: number;
	lastCompletedDate: string | null;
	categoryProgress: Record<ExerciseCategory, number>;
}
