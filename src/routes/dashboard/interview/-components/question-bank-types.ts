export type QuestionCategory = "behavioral" | "technical" | "situational" | "competency";
export type DifficultyLevel = "easy" | "medium" | "hard";
export type Industry = "healthcare" | "technology" | "industrial" | "finance" | "general";

export interface Question {
	id: string;
	question: string;
	category: QuestionCategory;
	difficulty: DifficultyLevel;
	industry: Industry;
	sampleAnswer: string;
	starExample: {
		situation: string;
		task: string;
		action: string;
		result: string;
	};
	tips: string[];
	keywords: string[];
}
