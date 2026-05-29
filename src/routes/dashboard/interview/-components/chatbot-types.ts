export type Message = {
	id: string;
	role: "user" | "assistant";
	content: string;
	timestamp: Date;
	status?: "sending" | "sent" | "offline-queued";
};

export type ChatbotMode = "quick_practice" | "mock_interview" | "topic_focus";
export type ChatbotField = "healthcare" | "industrial" | "hse" | "general";
export type ChatbotLanguage = "fr" | "en" | "ar";

export type SessionSummary = {
	overallScore: number;
	strengths: string[];
	areasForImprovement: string[];
	recommendations: string[];
	questionsSummary: Array<{
		question: string;
		performanceNote: string;
		score: number;
	}>;
	overallFeedback: string;
	readinessLevel: "not_ready" | "needs_practice" | "almost_ready" | "interview_ready";
};

/** Props for the AI-not-configured view */
export type AINotConfiguredViewProps = {
	Announcer: React.ReactNode;
	navigate: (opts: { to: string }) => void;
};

/** Props for the session configuration view (before starting) */
export type SessionConfigViewProps = {
	Announcer: React.ReactNode;
	isOnline: boolean;
	isInstallable: boolean;
	promptInstall: () => void;
	isMobile: boolean;
	selectedMode: ChatbotMode;
	setSelectedMode: (mode: ChatbotMode) => void;
	selectedField: ChatbotField;
	setSelectedField: (field: ChatbotField) => void;
	selectedLanguage: ChatbotLanguage;
	setSelectedLanguage: (lang: ChatbotLanguage) => void;
	topic: string;
	setTopic: (topic: string) => void;
	settingsOpen: boolean;
	setSettingsOpen: (open: boolean) => void;
	notificationsEnabled: boolean;
	handleEnableNotifications: () => void;
	handleModeKeyDown: (e: React.KeyboardEvent, mode: ChatbotMode) => void;
	startSession: () => void;
};

/** Props for the session summary view (after ending) */
export type SessionSummaryViewProps = {
	Announcer: React.ReactNode;
	summary: SessionSummary;
	selectedLanguage: ChatbotLanguage;
	resetSession: () => void;
};

/** Props for the loading summary view */
export type LoadingSummaryViewProps = {
	Announcer: React.ReactNode;
};

/** Props for the main chat interface */
export type MainChatViewProps = {
	Announcer: React.ReactNode;
	isFullScreen: boolean;
	toggleFullScreen: () => void;
	isMobile: boolean;
	isOnline: boolean;
	isStreaming: boolean;
	isLoadingMessages: boolean;
	selectedMode: ChatbotMode;
	selectedField: ChatbotField;
	selectedLanguage: ChatbotLanguage;
	questionCount: number;
	messages: Message[];
	input: string;
	setInput: (input: string) => void;
	sendMessage: () => void;
	endSession: () => void;
	stopStreaming: () => void;
	handleKeyPress: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
	handleTouchStartPull: (e: React.TouchEvent) => void;
	handleTouchMovePull: (e: React.TouchEvent) => void;
	handleTouchEndPull: () => void;
	handleMessageLongPress: (message: Message, e: React.TouchEvent | React.MouseEvent) => void;
	pullDistance: number;
	isPullingToRefresh: boolean;
	selectedMessageForOptions: { message: Message; position: { x: number; y: number } } | null;
	setSelectedMessageForOptions: (opts: { message: Message; position: { x: number; y: number } } | null) => void;
	handleCopyMessage: (content: string) => void;
	scrollRef: React.RefObject<HTMLDivElement | null>;
	inputRef: React.RefObject<HTMLTextAreaElement | null>;
	chatContainerRef: React.RefObject<HTMLDivElement | null>;
};
