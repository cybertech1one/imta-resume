import { breathingExercises, powerPoses, visualizationExercises } from "./confidence-config";
import type { Exercise } from "./confidence-types";

/**
 * Finds an exercise by its ID across all exercise categories (breathing, power poses, visualization).
 * Returns null if no matching exercise is found.
 */
export const getExerciseById = (id: string): Exercise | null => {
	const allExercises = [...breathingExercises, ...powerPoses, ...visualizationExercises];
	return allExercises.find((e) => e.id === id) || null;
};
