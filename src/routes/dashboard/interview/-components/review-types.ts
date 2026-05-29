// Types for Interview Recording Review (matching schema types)

export type RecordingStatus = "pending" | "processing" | "analyzed" | "failed";
type BodyLanguageCategory = "posture" | "eye_contact" | "gestures" | "facial" | "movement";
type BodyLanguageSeverity = "minor" | "moderate" | "major";

export type FillerWord = {
	word: string;
	count: number;
	timestamps: number[];
};

export type AnswerStructure = {
	hasIntro: boolean;
	hasBody: boolean;
	hasConclusion: boolean;
	usesSTAR: boolean;
};

export type AnswerSegment = {
	id: string;
	question: string;
	startTime: number;
	endTime: number;
	transcript: string;
	score: number;
	feedback: string[];
	idealAnswer?: string;
	fillerWords: FillerWord[];
	speakingPace: number;
	clarity: number;
	structure: AnswerStructure;
};

export type BodyLanguageTip = {
	id: string;
	category: BodyLanguageCategory;
	issue: string;
	suggestion: string;
	timestamp?: number;
	severity: BodyLanguageSeverity;
};

export type Recording = {
	id: string;
	title: string;
	date: string;
	duration: number;
	status: RecordingStatus;
	thumbnailUrl?: string | null;
	videoUrl?: string | null;
	field: string;
	program?: string | null;
	overallScore: number;
	speakingPaceScore: number;
	clarityScore: number;
	contentQualityScore: number;
	bodyLanguageScore: number;
	answerStructureScore: number;
	fillerWordCount: number;
	segments: AnswerSegment[];
	bodyLanguageTips: BodyLanguageTip[];
	improvementSuggestions: string[];
	strengths: string[];
	areasToImprove: string[];
};

export type ProgressData = {
	date: string;
	overallScore: number;
	speakingPace: number;
	clarity: number;
	contentQuality: number;
	bodyLanguage: number;
	fillerWords: number;
};
