export interface OnboardingState {
	step: number;
	field: string;
	currentLevel: string;
	biggestChallenge: string;
	learningStyle: string;
	preferredLanguage: string;
}

export interface MentorTemplate {
	id: string;
	name: string;
	nameFr: string;
	avatar: string | null;
	title: string;
	titleFr: string;
	specialization: string;
	personality: string;
	style: string;
	description: string;
	descriptionFr: string;
	expertise: string[] | null;
	languages: string[] | null;
	welcomeMessage: string | null;
	welcomeMessageFr: string | null;
	sampleQuestions: string[] | null;
	matchScore?: number;
}

export interface ConversationMessage {
	role: "user" | "assistant" | "system";
	content: string;
	timestamp: string;
}
