// TypeScript types for the STAR method interview trainer

export type StarComponent = "situation" | "task" | "action" | "result";

export type ScenarioCategory =
	| "conflict"
	| "leadership"
	| "teamwork"
	| "problem-solving"
	| "stress"
	| "communication"
	| "adaptability"
	| "customer-service"
	| "time-management"
	| "innovation";

export type StarResponse = {
	situation: string;
	task: string;
	action: string;
	result: string;
};

export type StarScenario = {
	id: string;
	category: ScenarioCategory;
	questionFr: string;
	questionEn: string;
	hints: {
		situation: string;
		task: string;
		action: string;
		result: string;
	};
};

export type StarComponentScore = {
	component: StarComponent;
	score: number;
	feedback: string;
};

export type StarEvaluation = {
	overallScore: number;
	componentScores: StarComponentScore[];
	strengths: string[];
	improvements: string[];
	modelAnswer: string;
	overallFeedback: string;
};

export type StarHistoryEntry = {
	id: string;
	scenarioId: string;
	questionFr: string;
	category: ScenarioCategory;
	response: StarResponse;
	evaluation?: StarEvaluation;
	completedAt: string;
};

export type StarExample = {
	id: string;
	category: ScenarioCategory;
	questionFr: string;
	situation: string;
	task: string;
	action: string;
	result: string;
	keyPoints: string[];
};

export type ActiveTab = "trainer" | "examples" | "history";
export type TrainerPhase = "select" | "exercise" | "evaluation";
