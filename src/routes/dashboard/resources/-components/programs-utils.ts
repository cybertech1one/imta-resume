import type { DbTrainingInterest, ProgramField } from "./programs-types";

// Helper function to map field to category
export const fieldToCategory = (field: ProgramField): DbTrainingInterest["category"] => {
	const mapping: Record<ProgramField, DbTrainingInterest["category"]> = {
		healthcare: "healthcare",
		industrial: "industrial",
		hse: "hse",
		business: "business",
	};
	return mapping[field];
};

// Helper function to map category to field
export const categoryToField = (category: string): ProgramField => {
	const mapping: Record<string, ProgramField> = {
		healthcare: "healthcare",
		industrial: "industrial",
		hse: "hse",
		business: "business",
		technology: "business", // Default fallback
		other: "business", // Default fallback
	};
	return mapping[category] || "business";
};
