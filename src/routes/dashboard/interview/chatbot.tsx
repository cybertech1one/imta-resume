import { t } from "@lingui/core/macro";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import z from "zod";
import { ErrorComponent } from "@/components/error-component";
import { client, orpc } from "@/integrations/orpc/client";
import {
	AINotConfiguredView,
	LoadingSummaryView,
	MainChatView,
	SessionConfigView,
	SessionSummaryView,
	useOfflineQueue,
	useOnlineStatus,
	usePWAInstallPrompt,
	useResponsive,
	useScreenReaderAnnouncer,
} from "./-components/chatbot-components";
import type { ChatbotField, ChatbotLanguage, ChatbotMode, Message, SessionSummary } from "./-components/chatbot-types";

const searchSchema = z.object({
	mode: z.enum(["quick_practice", "mock_interview", "topic_focus"]).optional(),
	field: z.enum(["healthcare", "industrial", "hse", "technology", "management", "general"]).optional(),
	language: z.enum(["fr", "en", "ar"]).optional(),
});

export const Route = createFileRoute("/dashboard/interview/chatbot")({
	component: InterviewChatbot,
	errorComponent: ErrorComponent,
	validateSearch: searchSchema,
});

function InterviewChatbot() {
	const navigate = useNavigate();
	const searchParams = Route.useSearch();
	const queryClient = useQueryClient();
	// AI status is a public endpoint - no auth guard needed, fires immediately
	const { data: aiStatus, isPending: isAiStatusPending } = useQuery(orpc.aiConfig.status.check.queryOptions());
	const { isMobile } = useResponsive();
	const isOnline = useOnlineStatus();
	const { isInstallable, promptInstall } = usePWAInstallPrompt();
	const { announce, Announcer } = useScreenReaderAnnouncer();
	const { queue: offlineQueue, addToQueue, processQueue } = useOfflineQueue();

	// Session configuration
	const [selectedMode, setSelectedMode] = useState<ChatbotMode>(searchParams.mode || "quick_practice");
	const [selectedField, setSelectedField] = useState<ChatbotField>(searchParams.field || "general");
	const [selectedLanguage, setSelectedLanguage] = useState<ChatbotLanguage>(searchParams.language || "fr");
	const [topic, setTopic] = useState("");

	// Chat state
	const [messages, setMessages] = useState<Message[]>([]);
	const [input, setInput] = useState("");
	const [isStreaming, setIsStreaming] = useState(false);
	const [sessionStarted, setSessionStarted] = useState(false);
	const [sessionEnded, setSessionEnded] = useState(false);
	const [summary, setSummary] = useState<SessionSummary | null>(null);
	const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
	const [questionCount, setQuestionCount] = useState(0);

	// Mobile-specific state
	const [isFullScreen, setIsFullScreen] = useState(false);
	const [settingsOpen, setSettingsOpen] = useState(!isMobile);
	const [selectedMessageForOptions, setSelectedMessageForOptions] = useState<{
		message: Message;
		position: { x: number; y: number };
	} | null>(null);
	const [isPullingToRefresh, setIsPullingToRefresh] = useState(false);
	const [pullDistance, setPullDistance] = useState(0);
	const [isLoadingMessages, setIsLoadingMessages] = useState(false);

	// PWA notification state (placeholder)
	const [notificationsEnabled, setNotificationsEnabled] = useState(false);

	// Refs
	const scrollRef = useRef<HTMLDivElement>(null);
	const inputRef = useRef<HTMLTextAreaElement>(null);
	const abortControllerRef = useRef<AbortController | null>(null);
	const isMountedRef = useRef(true);
	const chatContainerRef = useRef<HTMLDivElement>(null);
	const pullStartRef = useRef(0);

	// Cleanup abort controller and track mount state on unmount
	useEffect(() => {
		isMountedRef.current = true;
		return () => {
			isMountedRef.current = false;
			if (abortControllerRef.current) {
				abortControllerRef.current.abort();
				abortControllerRef.current = null;
			}
		};
	}, []);

	// Process offline queue when coming back online
	useEffect(() => {
		if (isOnline && offlineQueue.length > 0) {
			processQueue(async (_content) => {
				toast.success(t`Queued messages sent`);
			});
		}
	}, [isOnline, offlineQueue.length, processQueue]);

	// Auto-scroll to bottom when messages change
	// biome-ignore lint/correctness/useExhaustiveDependencies: Need to scroll when messages change
	useEffect(() => {
		if (scrollRef.current) {
			const viewport = scrollRef.current.querySelector("[data-slot='scroll-area-viewport']");
			if (viewport) {
				viewport.scrollTop = viewport.scrollHeight;
			}
		}
	}, [messages]);

	// Announce new messages to screen readers
	useEffect(() => {
		if (messages.length > 0) {
			const lastMessage = messages[messages.length - 1];
			if (lastMessage.role === "assistant" && lastMessage.content) {
				announce(`${t`New AI response`}: ${lastMessage.content.slice(0, 100)}...`);
			}
		}
	}, [messages, announce]);

	// Focus input after message is sent
	useEffect(() => {
		if (!isStreaming && sessionStarted && !sessionEnded && inputRef.current) {
			inputRef.current.focus();
		}
	}, [isStreaming, sessionStarted, sessionEnded]);

	// Count questions in messages
	useEffect(() => {
		const assistantMessages = messages.filter((m) => m.role === "assistant");
		setQuestionCount(assistantMessages.length);
	}, [messages]);

	// Update settings panel state when switching between mobile and desktop
	useEffect(() => {
		setSettingsOpen(!isMobile);
	}, [isMobile]);

	// Reset session
	const resetSession = useCallback(() => {
		setMessages([]);
		setSessionStarted(false);
		setSessionEnded(false);
		setSummary(null);
		setInput("");
		setQuestionCount(0);
		setIsFullScreen(false);
	}, []);

	// Handle pull-to-refresh for mobile
	const handleTouchStartPull = useCallback(
		(e: React.TouchEvent) => {
			if (!isMobile || !sessionStarted) return;
			const viewport = scrollRef.current?.querySelector("[data-slot='scroll-area-viewport']");
			if (viewport && viewport.scrollTop === 0) {
				pullStartRef.current = e.touches[0].clientY;
			}
		},
		[isMobile, sessionStarted],
	);

	const handleTouchMovePull = useCallback(
		(e: React.TouchEvent) => {
			if (!isMobile || !sessionStarted || pullStartRef.current === 0) return;
			const currentY = e.touches[0].clientY;
			const distance = currentY - pullStartRef.current;

			if (distance > 0 && distance < 150) {
				setPullDistance(distance);
				setIsPullingToRefresh(distance > 60);
			}
		},
		[isMobile, sessionStarted],
	);

	const handleTouchEndPull = useCallback(() => {
		if (isPullingToRefresh) {
			resetSession();
			toast.success(t`New conversation`);
		}
		setPullDistance(0);
		setIsPullingToRefresh(false);
		pullStartRef.current = 0;
	}, [isPullingToRefresh, resetSession]);

	// Handle long-press on messages
	const handleMessageLongPress = useCallback((message: Message, e: React.TouchEvent | React.MouseEvent) => {
		let position: { x: number; y: number };

		if ("touches" in e) {
			position = { x: e.touches[0]?.clientX || 0, y: e.touches[0]?.clientY || 0 };
		} else {
			position = { x: e.clientX, y: e.clientY };
		}

		setSelectedMessageForOptions({ message, position });
	}, []);

	// Copy message content
	const handleCopyMessage = useCallback((content: string) => {
		navigator.clipboard.writeText(content);
		toast.success(t`Copied to clipboard`);
	}, []);

	// Enable notifications (placeholder)
	const handleEnableNotifications = useCallback(async () => {
		if ("Notification" in window) {
			const permission = await Notification.requestPermission();
			if (permission === "granted") {
				setNotificationsEnabled(true);
				toast.success(t`Notifications enabled`);
			}
		}
	}, []);

	// Save session to DB
	const saveSessionMutation = useMutation({
		mutationFn: (data: {
			mode: string;
			field: string;
			language: string;
			topic?: string;
			messages: { role: string; content: string; timestamp?: string }[];
			questionCount: number;
			overallScore?: number;
			summary?: Record<string, unknown>;
		}) => client.chatbotSession.create(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: orpc.chatbotSession.list.queryOptions({ input: {} }).queryKey });
		},
	});

	// Generate summary mutation
	const generateSummaryMutation = useMutation({
		mutationFn: async () => {
			if (!aiStatus?.available) {
				throw new Error("AI is not configured");
			}

			return await client.interview.generateChatbotSummary({
				messages: messages.map((m) => ({ role: m.role, content: m.content })),
				field: selectedField,
				mode: selectedMode,
				language: selectedLanguage,
			});
		},
		onSuccess: (data) => {
			if (!isMountedRef.current) return;

			try {
				if (!data || typeof data.overallScore !== "number") {
					throw new Error("Invalid summary data");
				}
				const validatedSummary: SessionSummary = {
					overallScore: data.overallScore,
					strengths: Array.isArray(data.strengths) ? data.strengths : [],
					areasForImprovement: Array.isArray(data.areasForImprovement) ? data.areasForImprovement : [],
					recommendations: Array.isArray(data.recommendations) ? data.recommendations : [],
					questionsSummary: Array.isArray(data.questionsSummary) ? data.questionsSummary : [],
					overallFeedback: data.overallFeedback || "",
					readinessLevel: data.readinessLevel || "needs_practice",
				};
				setSummary(validatedSummary);

				saveSessionMutation.mutate({
					mode: selectedMode,
					field: selectedField,
					language: selectedLanguage,
					topic: topic || undefined,
					messages: messages.map((m) => ({
						role: m.role,
						content: m.content,
						timestamp: m.timestamp?.toISOString(),
					})),
					questionCount,
					overallScore: validatedSummary.overallScore,
					summary: validatedSummary as unknown as Record<string, unknown>,
				});
			} catch {
				toast.error(t`Invalid summary data received`);
				setSummary(null);
				setSessionEnded(false);
			}
			setIsGeneratingSummary(false);
		},
		onError: (error) => {
			if (!isMountedRef.current) return;
			toast.error(error.message || t`Error generating summary`);
			setIsGeneratingSummary(false);
		},
	});

	// Start interview session
	const startSession = useCallback(async () => {
		if (!aiStatus?.available) {
			toast.error(t`AI is not available. Please contact your administrator.`);
			return;
		}

		setSessionStarted(true);
		setIsStreaming(true);
		setIsLoadingMessages(true);

		const assistantMessageId = crypto.randomUUID();
		setMessages([
			{
				id: assistantMessageId,
				role: "assistant",
				content: "",
				timestamp: new Date(),
			},
		]);

		if (abortControllerRef.current) {
			abortControllerRef.current.abort();
		}
		abortControllerRef.current = new AbortController();
		const currentAbortController = abortControllerRef.current;
		const timeoutId = setTimeout(() => currentAbortController.abort(), 60_000);

		try {
			const stream = await client.interview.chatWithInterviewer({
				messages: [],
				mode: selectedMode,
				field: selectedField,
				topic: topic || undefined,
				language: selectedLanguage,
				isFirstMessage: true,
				requestSummary: false,
			});

			setIsLoadingMessages(false);
			let fullContent = "";
			for await (const chunk of stream) {
				if (currentAbortController.signal.aborted || !isMountedRef.current) break;
				if (typeof chunk === "string") fullContent += chunk;
				if (isMountedRef.current) {
					setMessages((prev) => prev.map((m) => (m.id === assistantMessageId ? { ...m, content: fullContent } : m)));
				}
			}
		} catch (error) {
			if (error instanceof Error && error.name === "AbortError") {
				if (isMountedRef.current) {
					toast.error(t`Connection timed out. Please retry.`);
					setMessages([]);
					setSessionStarted(false);
				}
				return;
			}
			if (isMountedRef.current) {
				toast.error(t`AI connection error`);
				setMessages([]);
				setSessionStarted(false);
			}
		} finally {
			clearTimeout(timeoutId);
			if (isMountedRef.current) {
				setIsStreaming(false);
				setIsLoadingMessages(false);
			}
			if (abortControllerRef.current === currentAbortController) {
				abortControllerRef.current = null;
			}
		}
	}, [aiStatus, selectedMode, selectedField, selectedLanguage, topic]);

	// Send message
	const sendMessage = useCallback(async () => {
		if (!input.trim() || isStreaming || !aiStatus?.available) return;

		// Handle offline state
		if (!isOnline) {
			const offlineMessage: Message = {
				id: crypto.randomUUID(),
				role: "user",
				content: input.trim(),
				timestamp: new Date(),
				status: "offline-queued",
			};
			addToQueue(offlineMessage);
			setMessages((prev) => [...prev, offlineMessage]);
			setInput("");
			toast.info(t`Message queued (offline)`);
			return;
		}

		const userMessage: Message = {
			id: crypto.randomUUID(),
			role: "user",
			content: input.trim(),
			timestamp: new Date(),
			status: "sending",
		};

		const assistantMessageId = crypto.randomUUID();
		const assistantMessage: Message = {
			id: assistantMessageId,
			role: "assistant",
			content: "",
			timestamp: new Date(),
		};

		setMessages((prev) => [...prev, userMessage, assistantMessage]);
		setInput("");
		setIsStreaming(true);

		if (abortControllerRef.current) {
			abortControllerRef.current.abort();
		}
		abortControllerRef.current = new AbortController();
		const currentAbortController = abortControllerRef.current;
		const timeoutId = setTimeout(() => currentAbortController.abort(), 60_000);

		try {
			const conversationHistory = [...messages, userMessage].map((m) => ({
				role: m.role,
				content: m.content,
			}));

			const stream = await client.interview.chatWithInterviewer({
				messages: conversationHistory,
				mode: selectedMode,
				field: selectedField,
				topic: topic || undefined,
				language: selectedLanguage,
				isFirstMessage: false,
				requestSummary: false,
			});

			let fullContent = "";
			for await (const chunk of stream) {
				if (currentAbortController.signal.aborted || !isMountedRef.current) break;
				if (typeof chunk === "string") fullContent += chunk;
				if (isMountedRef.current) {
					setMessages((prev) => prev.map((m) => (m.id === assistantMessageId ? { ...m, content: fullContent } : m)));
				}
			}

			if (isMountedRef.current) {
				setMessages((prev) => prev.map((m) => (m.id === userMessage.id ? { ...m, status: "sent" } : m)));
			}
		} catch (error) {
			if (error instanceof Error && error.name === "AbortError") {
				if (isMountedRef.current) {
					toast.error(t`Connection timed out. Please retry.`);
					setMessages((prev) => prev.filter((m) => m.id !== assistantMessageId));
				}
				return;
			}
			if (isMountedRef.current) {
				toast.error(t`AI connection error`);
				setMessages((prev) => prev.filter((m) => m.id !== assistantMessageId));
			}
		} finally {
			clearTimeout(timeoutId);
			if (isMountedRef.current) {
				setIsStreaming(false);
			}
			if (abortControllerRef.current === currentAbortController) {
				abortControllerRef.current = null;
			}
		}
	}, [
		input,
		isStreaming,
		aiStatus,
		messages,
		selectedMode,
		selectedField,
		selectedLanguage,
		topic,
		isOnline,
		addToQueue,
	]);

	// End session and generate summary
	const endSession = useCallback(async () => {
		if (messages.length < 2) {
			toast.error(t`You must have at least one exchange before ending`);
			return;
		}

		setSessionEnded(true);
		setIsGeneratingSummary(true);
		generateSummaryMutation.mutate();
	}, [messages, generateSummaryMutation]);

	// Stop streaming
	const stopStreaming = useCallback(() => {
		if (abortControllerRef.current) {
			abortControllerRef.current.abort();
		}
	}, []);

	// Handle key press
	const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			sendMessage();
		}
	};

	// Toggle full screen mode
	const toggleFullScreen = useCallback(() => {
		setIsFullScreen((prev) => !prev);
	}, []);

	// Keyboard navigation for mode selection
	const handleModeKeyDown = useCallback((e: React.KeyboardEvent, mode: ChatbotMode) => {
		const modes: ChatbotMode[] = ["quick_practice", "mock_interview", "topic_focus"];
		const currentIndex = modes.indexOf(mode);

		if (e.key === "ArrowRight" || e.key === "ArrowDown") {
			e.preventDefault();
			const nextIndex = (currentIndex + 1) % modes.length;
			setSelectedMode(modes[nextIndex]);
		} else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
			e.preventDefault();
			const prevIndex = (currentIndex - 1 + modes.length) % modes.length;
			setSelectedMode(modes[prevIndex]);
		} else if (e.key === "Enter" || e.key === " ") {
			e.preventDefault();
			setSelectedMode(mode);
		}
	}, []);

	// Show loading state while checking AI status (avoid flash of "not configured" during query loading)
	if (isAiStatusPending) {
		return (
			<div className="flex min-h-[60vh] items-center justify-center">
				<div className="flex flex-col items-center gap-3">
					<div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
					<p className="text-muted-foreground text-sm">{t`Loading...`}</p>
				</div>
			</div>
		);
	}

	// AI not configured view (only shown after status check completes and returns unavailable)
	if (!aiStatus?.available) {
		return <AINotConfiguredView Announcer={Announcer} navigate={navigate} />;
	}

	// Session configuration view (before starting)
	if (!sessionStarted) {
		return (
			<SessionConfigView
				Announcer={Announcer}
				isOnline={isOnline}
				isInstallable={isInstallable}
				promptInstall={promptInstall}
				isMobile={isMobile}
				selectedMode={selectedMode}
				setSelectedMode={setSelectedMode}
				selectedField={selectedField}
				setSelectedField={setSelectedField}
				selectedLanguage={selectedLanguage}
				setSelectedLanguage={setSelectedLanguage}
				topic={topic}
				setTopic={setTopic}
				settingsOpen={settingsOpen}
				setSettingsOpen={setSettingsOpen}
				notificationsEnabled={notificationsEnabled}
				handleEnableNotifications={handleEnableNotifications}
				handleModeKeyDown={handleModeKeyDown}
				startSession={startSession}
			/>
		);
	}

	// Session ended - show summary
	if (sessionEnded && summary) {
		return (
			<SessionSummaryView
				Announcer={Announcer}
				summary={summary}
				selectedLanguage={selectedLanguage}
				resetSession={resetSession}
			/>
		);
	}

	// Loading summary view
	if (sessionEnded && isGeneratingSummary) {
		return <LoadingSummaryView Announcer={Announcer} />;
	}

	// Main chat interface
	return (
		<MainChatView
			Announcer={Announcer}
			isFullScreen={isFullScreen}
			toggleFullScreen={toggleFullScreen}
			isMobile={isMobile}
			isOnline={isOnline}
			isStreaming={isStreaming}
			isLoadingMessages={isLoadingMessages}
			selectedMode={selectedMode}
			selectedField={selectedField}
			selectedLanguage={selectedLanguage}
			questionCount={questionCount}
			messages={messages}
			input={input}
			setInput={setInput}
			sendMessage={sendMessage}
			endSession={endSession}
			stopStreaming={stopStreaming}
			handleKeyPress={handleKeyPress}
			handleTouchStartPull={handleTouchStartPull}
			handleTouchMovePull={handleTouchMovePull}
			handleTouchEndPull={handleTouchEndPull}
			handleMessageLongPress={handleMessageLongPress}
			pullDistance={pullDistance}
			isPullingToRefresh={isPullingToRefresh}
			selectedMessageForOptions={selectedMessageForOptions}
			setSelectedMessageForOptions={setSelectedMessageForOptions}
			handleCopyMessage={handleCopyMessage}
			scrollRef={scrollRef}
			inputRef={inputRef}
			chatContainerRef={chatContainerRef}
		/>
	);
}
