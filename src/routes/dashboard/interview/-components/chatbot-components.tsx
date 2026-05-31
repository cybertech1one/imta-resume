import { t } from "@lingui/core/macro";
import { useLingui } from "@lingui/react";
import {
	ArrowLeftIcon,
	ArrowsInIcon,
	ArrowsOutIcon,
	BellIcon,
	CaretDownIcon,
	CaretUpIcon,
	ChatCircleDotsIcon,
	CheckCircleIcon,
	CopyIcon,
	DownloadIcon,
	GearIcon,
	GlobeIcon,
	LightbulbIcon,
	PaperPlaneIcon,
	RobotIcon,
	SparkleIcon,
	SpinnerIcon,
	StarIcon,
	StopIcon,
	TargetIcon,
	TrendUpIcon,
	UserIcon,
	WarningIcon,
	WifiSlashIcon,
	XIcon,
} from "@phosphor-icons/react";
import { Link } from "@tanstack/react-router";
import { memo, Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/utils/style";
import { DashboardHeader } from "../../-components/header";

import { fieldConfig, languageConfig, modeConfig, readinessConfig } from "./chatbot-config";
import type {
	AINotConfiguredViewProps,
	ChatbotField,
	ChatbotLanguage,
	ChatbotMode,
	LoadingSummaryViewProps,
	MainChatViewProps,
	Message,
	SessionConfigViewProps,
	SessionSummaryViewProps,
} from "./chatbot-types";

// Icon fallback for lazy loading
const IconFallback = () => <div className="size-5 animate-pulse rounded bg-white/30" />;

// Loading skeleton for messages
const MessageSkeleton = memo(function MessageSkeleton({ isUser }: { isUser?: boolean }) {
	return (
		<div className={cn("flex gap-3", isUser ? "flex-row-reverse" : "flex-row")}>
			<div
				className={cn(
					"flex size-10 shrink-0 animate-pulse items-center justify-center rounded-full",
					isUser ? "bg-indigo-200" : "bg-emerald-200",
				)}
			/>
			<div
				className={cn(
					"max-w-[85%] animate-pulse space-y-2 rounded-2xl px-4 py-3 md:max-w-[75%]",
					isUser ? "bg-indigo-100" : "bg-gray-100",
				)}
			>
				<div className={cn("h-4 rounded", isUser ? "w-32 bg-indigo-200" : "w-48 bg-gray-200")} />
				<div className={cn("h-4 rounded", isUser ? "w-24 bg-indigo-200" : "w-36 bg-gray-200")} />
			</div>
		</div>
	);
});

// Memoized message component for performance
const ChatMessage = memo(function ChatMessage({
	message,
	language,
	onLongPress,
	isMobile,
}: {
	message: Message;
	language: ChatbotLanguage;
	onLongPress: (message: Message, e: React.TouchEvent | React.MouseEvent) => void;
	isMobile: boolean;
}) {
	const longPressTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const [isLongPressing, setIsLongPressing] = useState(false);

	const handleTouchStart = (e: React.TouchEvent) => {
		if (!isMobile) return;
		longPressTimeoutRef.current = setTimeout(() => {
			setIsLongPressing(true);
			// Haptic feedback simulation - visual pulse
			const element = e.currentTarget as HTMLElement;
			element.classList.add("scale-[0.98]", "transition-transform");
			setTimeout(() => {
				element.classList.remove("scale-[0.98]");
				onLongPress(message, e);
			}, 100);
		}, 500);
	};

	const handleTouchEnd = () => {
		if (longPressTimeoutRef.current) {
			clearTimeout(longPressTimeoutRef.current);
		}
		setIsLongPressing(false);
	};

	const handleContextMenu = (e: React.MouseEvent) => {
		if (!isMobile) {
			e.preventDefault();
			onLongPress(message, e);
		}
	};

	return (
		<div
			className={cn(
				"fade-in slide-in-from-bottom-2 flex animate-in gap-3",
				message.role === "user" ? "flex-row-reverse" : "flex-row",
				isLongPressing && "opacity-70",
			)}
			onTouchStart={handleTouchStart}
			onTouchEnd={handleTouchEnd}
			onTouchCancel={handleTouchEnd}
			onContextMenu={handleContextMenu}
			role="article"
			aria-label={`${message.role === "user" ? t`Your message` : t`AI response`}: ${message.content.slice(0, 50)}...`}
		>
			{/* Avatar */}
			<div
				className={cn(
					"flex size-10 shrink-0 items-center justify-center rounded-full shadow-sm md:size-10",
					"min-h-[44px] min-w-[44px]", // Touch-friendly minimum size
					message.role === "user"
						? "bg-gradient-to-br from-indigo-500 to-purple-600 text-white"
						: "bg-gradient-to-br from-emerald-500 to-teal-600 text-white",
				)}
			>
				{message.role === "user" ? (
					<UserIcon className="size-5" weight="bold" aria-hidden="true" />
				) : (
					<RobotIcon className="size-5" weight="bold" aria-hidden="true" />
				)}
			</div>

			{/* Message Bubble */}
			<div
				className={cn(
					"max-w-[85%] rounded-2xl px-4 py-3 shadow-sm md:max-w-[75%]",
					message.role === "user"
						? "bg-gradient-to-br from-indigo-500 to-purple-600 text-white"
						: "border bg-white dark:bg-muted",
				)}
			>
				<div className="whitespace-pre-wrap text-sm leading-relaxed">
					{message.content || (
						<span className="flex items-center gap-2 text-white/80">
							<SpinnerIcon className="size-4 animate-spin" />
							{language === "fr" ? "Reflexion en cours..." : "Thinking..."}
						</span>
					)}
				</div>
				<div
					className={cn(
						"mt-2 flex items-center gap-2 text-[10px]",
						message.role === "user" ? "text-white/60" : "text-muted-foreground",
					)}
				>
					{message.role === "assistant" && (
						<span className="inline-flex items-center gap-0.5 rounded-full bg-primary/10 px-1.5 py-0.5 text-[9px] text-primary">
							<SparkleIcon className="size-2.5" weight="fill" />
							AI
						</span>
					)}
					<span>
						{message.timestamp.toLocaleTimeString("fr-FR", {
							hour: "2-digit",
							minute: "2-digit",
						})}
					</span>
					{message.status === "offline-queued" && (
						<span className="flex items-center gap-1">
							<WifiSlashIcon className="size-3" />
							{t`Queued`}
						</span>
					)}
				</div>
			</div>
		</div>
	);
});

// Message options popup for long-press actions
const MessageOptionsPopup = memo(function MessageOptionsPopup({
	message,
	position,
	onClose,
	onCopy,
	language,
}: {
	message: Message;
	position: { x: number; y: number };
	onClose: () => void;
	onCopy: (content: string) => void;
	language: ChatbotLanguage;
}) {
	const popupRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const handleClickOutside = (e: MouseEvent | TouchEvent) => {
			if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
				onClose();
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		document.addEventListener("touchstart", handleClickOutside);

		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
			document.removeEventListener("touchstart", handleClickOutside);
		};
	}, [onClose]);

	// Adjust position to stay within viewport
	const adjustedPosition = useMemo(() => {
		const viewportWidth = typeof window !== "undefined" ? window.innerWidth : 0;
		const viewportHeight = typeof window !== "undefined" ? window.innerHeight : 0;
		const popupWidth = 150;
		const popupHeight = 100;

		return {
			x: Math.min(position.x, viewportWidth - popupWidth - 16),
			y: Math.min(position.y, viewportHeight - popupHeight - 16),
		};
	}, [position]);

	return (
		<div
			ref={popupRef}
			className="fade-in zoom-in-95 fixed z-50 animate-in rounded-xl border bg-white p-2 shadow-lg dark:bg-muted"
			style={{ left: adjustedPosition.x, top: adjustedPosition.y }}
			role="menu"
			aria-label={t`Message options`}
		>
			<button
				type="button"
				className="flex min-h-[44px] w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm hover:bg-muted"
				onClick={() => {
					onCopy(message.content);
					onClose();
				}}
				role="menuitem"
			>
				<CopyIcon className="size-4" />
				{language === "fr" ? "Copier" : "Copy"}
			</button>
		</div>
	);
});

// Swipeable mode selector for mobile
const SwipeableModeSelector = memo(function SwipeableModeSelector({
	selectedMode,
	onSelectMode,
	language,
}: {
	selectedMode: ChatbotMode;
	onSelectMode: (mode: ChatbotMode) => void;
	language: ChatbotLanguage;
}) {
	const { i18n } = useLingui();
	const containerRef = useRef<HTMLDivElement>(null);
	const [startX, setStartX] = useState(0);
	const [currentX, setCurrentX] = useState(0);
	const [isDragging, setIsDragging] = useState(false);

	const modes: ChatbotMode[] = ["quick_practice", "mock_interview", "topic_focus"];
	const currentIndex = modes.indexOf(selectedMode);

	const handleTouchStart = (e: React.TouchEvent) => {
		setStartX(e.touches[0].clientX);
		setIsDragging(true);
	};

	const handleTouchMove = (e: React.TouchEvent) => {
		if (!isDragging) return;
		setCurrentX(e.touches[0].clientX - startX);
	};

	const handleTouchEnd = () => {
		if (!isDragging) return;

		const threshold = 50;
		if (currentX > threshold && currentIndex > 0) {
			onSelectMode(modes[currentIndex - 1]);
		} else if (currentX < -threshold && currentIndex < modes.length - 1) {
			onSelectMode(modes[currentIndex + 1]);
		}

		setCurrentX(0);
		setIsDragging(false);
	};

	return (
		<div className="relative overflow-hidden" ref={containerRef}>
			<div
				className="flex touch-pan-y transition-transform duration-300"
				style={{
					transform: `translateX(calc(-${currentIndex * 100}% + ${isDragging ? currentX : 0}px))`,
				}}
				onTouchStart={handleTouchStart}
				onTouchMove={handleTouchMove}
				onTouchEnd={handleTouchEnd}
			>
				{modes.map((mode) => {
					const config = modeConfig[mode];
					const IconComponent = config.icon;
					return (
						<div key={mode} className="w-full shrink-0 px-2">
							<button
								type="button"
								onClick={() => onSelectMode(mode)}
								className={cn(
									"group relative flex min-h-[120px] w-full flex-col items-center overflow-hidden rounded-xl border-2 p-4 text-center transition-all hover:border-primary/50 hover:shadow-md",
									selectedMode === mode && "border-primary ring-2 ring-primary/20",
								)}
							>
								<div
									className={cn(
										"absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity group-hover:opacity-5",
										config.color,
									)}
								/>
								<div
									className={cn(
										"mb-3 flex size-12 items-center justify-center rounded-lg bg-gradient-to-br text-white",
										config.color,
									)}
								>
									<Suspense fallback={<IconFallback />}>
										<IconComponent className="size-6" weight="bold" />
									</Suspense>
								</div>
								<span className="font-semibold">{language === "fr" ? config.labelFr : i18n._(config.label)}</span>
								<span className="mt-1 text-muted-foreground text-xs leading-relaxed">
									{language === "fr" ? config.descriptionFr : i18n._(config.description)}
								</span>
							</button>
						</div>
					);
				})}
			</div>

			{/* Pagination dots */}
			<div className="mt-4 flex justify-center gap-2">
				{modes.map((mode, index) => (
					<button
						key={mode}
						type="button"
						onClick={() => onSelectMode(mode)}
						className={cn(
							"flex size-2 min-h-[44px] min-w-[44px] items-center justify-center rounded-full transition-all",
						)}
						aria-label={`Select ${i18n._(modeConfig[mode].label)}`}
					>
						<span
							className={cn(
								"size-2 rounded-full transition-all",
								index === currentIndex ? "w-6 bg-primary" : "bg-muted-foreground/30",
							)}
						/>
					</button>
				))}
			</div>

			{/* Swipe hint */}
			<p className="mt-2 text-center text-muted-foreground text-xs">
				{language === "fr" ? "Balayez pour changer de mode" : "Swipe to change mode"}
			</p>
		</div>
	);
});

// Collapsible settings panel for mobile
const CollapsibleSettings = memo(function CollapsibleSettings({
	isOpen,
	onToggle,
	children,
	title,
}: {
	isOpen: boolean;
	onToggle: () => void;
	children: React.ReactNode;
	title: string;
}) {
	return (
		<div className="rounded-xl border bg-muted/30">
			<button
				type="button"
				onClick={onToggle}
				className="flex min-h-[44px] w-full items-center justify-between p-4"
				aria-expanded={isOpen}
				aria-controls="collapsible-settings-content"
			>
				<span className="flex items-center gap-2 font-semibold">
					<GearIcon className="size-4" aria-hidden="true" />
					{title}
				</span>
				{isOpen ? (
					<CaretUpIcon className="size-4" aria-hidden="true" />
				) : (
					<CaretDownIcon className="size-4" aria-hidden="true" />
				)}
			</button>
			<div
				id="collapsible-settings-content"
				className={cn(
					"overflow-hidden transition-all duration-300",
					isOpen ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0",
				)}
				role="region"
				aria-label={title}
			>
				<div className="border-t p-4">{children}</div>
			</div>
		</div>
	);
});

// ============================================================================
// View Components (extracted from route file)
// ============================================================================

// AI not configured view
export const AINotConfiguredView = memo(function AINotConfiguredView({
	Announcer,
	navigate,
}: AINotConfiguredViewProps) {
	return (
		<>
			<DashboardHeader icon={ChatCircleDotsIcon} title={t`AI Interview Coach`} />
			{Announcer}
			<div className="flex min-h-[60vh] items-center justify-center p-4">
				<Card className="max-w-md border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50">
					<CardHeader className="text-center">
						<div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-orange-100">
							<WarningIcon className="size-8 text-orange-600" />
						</div>
						<CardTitle className="text-xl">{t`AI Not Available`}</CardTitle>
						<CardDescription className="text-orange-700">
							{t`AI features are not currently available. Please contact your administrator.`}
						</CardDescription>
					</CardHeader>
					<CardFooter className="flex flex-col gap-3 sm:flex-row sm:justify-center">
						<Button
							variant="outline"
							onClick={() => navigate({ to: "/dashboard/interview" })}
							className="min-h-[44px] w-full sm:w-auto"
						>
							<ArrowLeftIcon className="mr-2 size-4" />
							{t`Back`}
						</Button>
						<Button
							onClick={() => navigate({ to: "/dashboard/settings/ai" })}
							className="min-h-[44px] w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 sm:w-auto"
						>
							<GearIcon className="mr-2 size-4" />
							{t`View AI Status`}
						</Button>
					</CardFooter>
				</Card>
			</div>
		</>
	);
});

// Session configuration view (before starting)
export const SessionConfigView = memo(function SessionConfigView({
	Announcer,
	isOnline,
	isInstallable,
	promptInstall,
	isMobile,
	selectedMode,
	setSelectedMode,
	selectedField,
	setSelectedField,
	selectedLanguage,
	setSelectedLanguage,
	topic,
	setTopic,
	settingsOpen,
	setSettingsOpen,
	notificationsEnabled,
	handleEnableNotifications,
	handleModeKeyDown,
	startSession,
}: SessionConfigViewProps) {
	const { i18n } = useLingui();
	return (
		<>
			<DashboardHeader icon={ChatCircleDotsIcon} title={t`AI Interview Coach`} />
			{Announcer}

			<div className="mx-auto max-w-4xl space-y-4 p-2 sm:space-y-6 md:p-0">
				{/* Offline indicator */}
				{!isOnline && (
					<div className="flex items-center gap-2 rounded-lg bg-yellow-100 p-3 text-yellow-800">
						<WifiSlashIcon className="size-5" />
						<span className="text-sm">{t`You are offline`}</span>
					</div>
				)}

				{/* PWA Install prompt */}
				{isInstallable && (
					<div className="flex flex-col items-center justify-between gap-3 rounded-lg bg-indigo-100 p-4 sm:flex-row">
						<div className="flex items-center gap-3">
							<DownloadIcon className="size-6 text-indigo-600" />
							<span className="text-indigo-800 text-sm">{t`Install the app for quick access`}</span>
						</div>
						<Button
							onClick={promptInstall}
							size="sm"
							className="min-h-[44px] w-full bg-indigo-600 hover:bg-indigo-700 sm:w-auto"
						>
							{t`Install`}
						</Button>
					</div>
				)}

				{/* Hero Section */}
				<div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 p-4 text-white sm:p-6 md:p-8">
					<div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />
					<div className="relative">
						<div className="mb-4 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
							<div className="flex size-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
								<RobotIcon className="size-7" weight="fill" />
							</div>
							<div>
								<h1 className="font-bold text-xl sm:text-2xl md:text-3xl">{t`AI Interview Coach`}</h1>
								<p className="text-sm text-white/80 sm:text-base">
									{t`Practice with an intelligent virtual recruiter`}
								</p>
							</div>
						</div>
						<p className="max-w-2xl text-sm text-white/90 sm:text-base">
							{t`Prepare for your job interviews with our AI coach. Get personalized feedback and improve your professional communication skills.`}
						</p>
					</div>
				</div>

				{/* Configuration Card */}
				<Card className="border-2 shadow-lg">
					<CardHeader className="pb-3 sm:pb-6">
						<CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
							<GearIcon className="size-5 text-primary" />
							{t`Session Configuration`}
						</CardTitle>
						<CardDescription>{t`Customize your training session`}</CardDescription>
					</CardHeader>
					<CardContent className="space-y-6">
						{/* Language Selection */}
						<div className="space-y-3">
							<Label className="flex items-center gap-2 font-semibold text-base">
								<GlobeIcon className="size-4" />
								{t`Interview Language`}
							</Label>
							<div className="grid grid-cols-3 gap-2 sm:gap-3">
								{(Object.keys(languageConfig) as ChatbotLanguage[]).map((lang) => (
									<button
										key={lang}
										type="button"
										onClick={() => setSelectedLanguage(lang)}
										className={cn(
											"flex flex-col items-center justify-center gap-1 rounded-xl border-2 p-3 transition-all hover:border-primary/50 hover:bg-muted/50 sm:gap-2 sm:p-4",
											"min-h-[80px] sm:min-h-[100px]",
											selectedLanguage === lang && "border-primary bg-primary/5 ring-2 ring-primary/20",
										)}
										aria-pressed={selectedLanguage === lang}
									>
										<span className="text-xl sm:text-2xl">{languageConfig[lang].flag}</span>
										<span className="font-medium text-xs sm:text-sm">{languageConfig[lang].nativeLabel}</span>
									</button>
								))}
							</div>
						</div>

						{/* Mode Selection - Swipeable on mobile */}
						<div className="space-y-3">
							<Label className="flex items-center gap-2 font-semibold text-base">
								<SparkleIcon className="size-4" />
								{t`Interview Mode`}
							</Label>

							{isMobile ? (
								<SwipeableModeSelector
									selectedMode={selectedMode}
									onSelectMode={setSelectedMode}
									language={selectedLanguage}
								/>
							) : (
								<div
									className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
									role="radiogroup"
									aria-label={t`Interview mode`}
								>
									{(Object.keys(modeConfig) as ChatbotMode[]).map((mode) => {
										const config = modeConfig[mode];
										const IconComponent = config.icon;
										return (
											<button
												key={mode}
												type="button"
												onClick={() => setSelectedMode(mode)}
												onKeyDown={(e) => handleModeKeyDown(e, mode)}
												className={cn(
													"group relative flex flex-col items-start overflow-hidden rounded-xl border-2 p-4 text-left transition-all hover:border-primary/50 hover:shadow-md",
													"min-h-[120px]",
													selectedMode === mode && "border-primary ring-2 ring-primary/20",
												)}
												role="radio"
												aria-checked={selectedMode === mode}
												tabIndex={selectedMode === mode ? 0 : -1}
											>
												<div
													className={cn(
														"absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity group-hover:opacity-5",
														config.color,
													)}
												/>
												<div
													className={cn(
														"mb-3 flex size-10 items-center justify-center rounded-lg bg-gradient-to-br text-white",
														config.color,
													)}
												>
													<Suspense fallback={<IconFallback />}>
														<IconComponent className="size-5" weight="bold" />
													</Suspense>
												</div>
												<span className="font-semibold">
													{selectedLanguage === "fr" ? config.labelFr : i18n._(config.label)}
												</span>
												<span className="mt-1 text-muted-foreground text-xs leading-relaxed">
													{selectedLanguage === "fr" ? config.descriptionFr : i18n._(config.description)}
												</span>
											</button>
										);
									})}
								</div>
							)}
						</div>

						{/* Collapsible advanced settings on mobile */}
						{isMobile ? (
							<CollapsibleSettings
								isOpen={settingsOpen}
								onToggle={() => setSettingsOpen(!settingsOpen)}
								title={t`Advanced Settings`}
							>
								{/* Field Selection */}
								<div className="space-y-3">
									<Label className="flex items-center gap-2 font-semibold text-base">
										<TargetIcon className="size-4" />
										{t`Professional Field`}
									</Label>
									<Select value={selectedField} onValueChange={(v) => setSelectedField(v as ChatbotField)}>
										<SelectTrigger className="min-h-[44px]">
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											{(Object.keys(fieldConfig) as ChatbotField[]).map((field) => (
												<SelectItem key={field} value={field} className="min-h-[44px] py-3">
													<span className="flex items-center gap-2">
														<span>{fieldConfig[field].emoji}</span>
														<span>
															{selectedLanguage === "fr"
																? fieldConfig[field].labelFr
																: i18n._(fieldConfig[field].label)}
														</span>
													</span>
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>

								{/* Topic Input (for topic_focus mode) */}
								{selectedMode === "topic_focus" && (
									<div className="fade-in slide-in-from-top-2 mt-4 animate-in space-y-3">
										<Label className="flex items-center gap-2 font-semibold text-base">
											<LightbulbIcon className="size-4" />
											{t`Specific Topic`}
										</Label>
										<Input
											placeholder={t`Ex: Stress management, Patient communication...`}
											value={topic}
											onChange={(e) => setTopic(e.target.value)}
											className="min-h-[44px]"
										/>
									</div>
								)}

								{/* Notification toggle (PWA) */}
								<div className="mt-4 flex items-center justify-between rounded-lg bg-muted/50 p-3">
									<div className="flex items-center gap-2">
										<BellIcon className="size-4" />
										<span className="text-sm">{t`Notifications`}</span>
									</div>
									<Button
										variant={notificationsEnabled ? "secondary" : "outline"}
										size="sm"
										onClick={handleEnableNotifications}
										className="min-h-[44px]"
										disabled={notificationsEnabled}
									>
										{notificationsEnabled ? t`Enabled` : t`Enable`}
									</Button>
								</div>
							</CollapsibleSettings>
						) : (
							<>
								{/* Field Selection */}
								<div className="space-y-3">
									<Label className="flex items-center gap-2 font-semibold text-base">
										<TargetIcon className="size-4" />
										{t`Professional Field`}
									</Label>
									<Select value={selectedField} onValueChange={(v) => setSelectedField(v as ChatbotField)}>
										<SelectTrigger className="h-12">
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											{(Object.keys(fieldConfig) as ChatbotField[]).map((field) => (
												<SelectItem key={field} value={field} className="py-3">
													<span className="flex items-center gap-2">
														<span>{fieldConfig[field].emoji}</span>
														<span>
															{selectedLanguage === "fr"
																? fieldConfig[field].labelFr
																: i18n._(fieldConfig[field].label)}
														</span>
													</span>
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>

								{/* Topic Input (for topic_focus mode) */}
								{selectedMode === "topic_focus" && (
									<div className="fade-in slide-in-from-top-2 animate-in space-y-3">
										<Label className="flex items-center gap-2 font-semibold text-base">
											<LightbulbIcon className="size-4" />
											{t`Specific Topic`}
										</Label>
										<Input
											placeholder={t`Ex: Stress management, Patient communication, Preventive maintenance...`}
											value={topic}
											onChange={(e) => setTopic(e.target.value)}
											className="h-12"
										/>
										<p className="text-muted-foreground text-xs">{t`Specify the topic you want to focus on`}</p>
									</div>
								)}
							</>
						)}
					</CardContent>
					<CardFooter className="flex flex-col gap-3 border-t bg-muted/30 pt-6 sm:flex-row sm:justify-between">
						<Link to="/dashboard/interview" className="w-full sm:w-auto">
							<Button variant="outline" size="lg" className="min-h-[44px] w-full">
								<ArrowLeftIcon className="mr-2 size-4" />
								{t`Back`}
							</Button>
						</Link>
						<Button
							onClick={startSession}
							size="lg"
							className="min-h-[44px] w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 sm:w-auto"
							disabled={!isOnline}
						>
							<ChatCircleDotsIcon className="mr-2 size-5" />
							{t`Start Interview`}
						</Button>
					</CardFooter>
				</Card>

				{/* Tips Card */}
				<Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
					<CardHeader className="pb-3">
						<CardTitle className="flex items-center gap-2 text-base text-blue-800 sm:text-lg">
							<LightbulbIcon className="size-5" weight="fill" />
							{t`Tips for Your Practice`}
						</CardTitle>
					</CardHeader>
					<CardContent>
						<ul className="grid gap-2 sm:gap-3 md:grid-cols-2">
							{[
								{
									fr: "Répondez comme dans un vrai entretien - soyez naturel et spécifique",
									en: "Answer as in a real interview - be natural and specific",
								},
								{
									fr: "Utilisez des exemples concrets de vos stages ou etudes",
									en: "Use concrete examples from your internships or studies",
								},
								{ fr: "Prenez le temps de réfléchir avant de répondre", en: "Take time to think before responding" },
								{ fr: "N'hesitez pas a demander des clarifications", en: "Don't hesitate to ask for clarifications" },
							].map((tip, idx) => (
								<li key={idx} className="flex items-start gap-2 text-blue-700 text-xs sm:text-sm">
									<CheckCircleIcon className="mt-0.5 size-4 shrink-0 text-blue-500" weight="fill" />
									<span>{selectedLanguage === "fr" ? tip.fr : tip.en}</span>
								</li>
							))}
						</ul>
					</CardContent>
				</Card>
			</div>
		</>
	);
});

// Session summary view (after ending)
export const SessionSummaryView = memo(function SessionSummaryView({
	Announcer,
	summary,
	selectedLanguage,
	resetSession,
}: SessionSummaryViewProps) {
	const { i18n } = useLingui();
	const scoreGradient =
		summary.overallScore >= 80
			? "from-green-500 to-emerald-500"
			: summary.overallScore >= 60
				? "from-yellow-500 to-amber-500"
				: "from-orange-500 to-red-500";

	return (
		<>
			<DashboardHeader icon={CheckCircleIcon} title={t`Session Summary`} />
			{Announcer}

			<div className="mx-auto max-w-4xl space-y-4 p-2 sm:space-y-6 md:p-0">
				{/* Score Hero */}
				<div
					className={cn(
						"relative overflow-hidden rounded-2xl bg-gradient-to-br p-4 text-white sm:p-6 md:p-8",
						scoreGradient,
					)}
				>
					<div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />
					<div className="relative text-center">
						<div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm sm:size-20">
							<span className="font-bold text-3xl sm:text-4xl">{summary.overallScore}%</span>
						</div>
						<h2 className="mb-2 font-bold text-xl sm:text-2xl">{t`Interview Complete!`}</h2>
						<p className="mb-4 text-sm text-white/90 sm:text-base">{t`Here is your performance analysis`}</p>
						<Badge
							className={cn(
								"border-0 px-4 py-2 font-semibold text-xs sm:text-sm",
								readinessConfig[summary.readinessLevel].bgColor,
								readinessConfig[summary.readinessLevel].color,
							)}
						>
							{selectedLanguage === "fr"
								? readinessConfig[summary.readinessLevel].labelFr
								: i18n._(readinessConfig[summary.readinessLevel].label)}
						</Badge>
					</div>
				</div>

				{/* Detailed Results */}
				<Tabs defaultValue="overview" className="space-y-4">
					<TabsList className="grid w-full grid-cols-3">
						<TabsTrigger value="overview" className="min-h-[44px] text-xs sm:text-sm">
							{t`Overview`}
						</TabsTrigger>
						<TabsTrigger value="details" className="min-h-[44px] text-xs sm:text-sm">
							{t`Détails`}
						</TabsTrigger>
						<TabsTrigger value="recommendations" className="min-h-[44px] text-xs sm:text-sm">
							{t`Advice`}
						</TabsTrigger>
					</TabsList>

					<TabsContent value="overview" className="space-y-4">
						<div className="grid gap-4 md:grid-cols-2">
							{/* Strengths */}
							{summary.strengths.length > 0 && (
								<Card className="border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
									<CardHeader className="pb-3">
										<CardTitle className="flex items-center gap-2 text-base text-green-700 sm:text-lg">
											<StarIcon className="size-5" weight="fill" />
											{t`Strengths`}
										</CardTitle>
									</CardHeader>
									<CardContent>
										<ul className="space-y-2">
											{summary.strengths.map((strength, i) => (
												<li key={i} className="flex items-start gap-2 text-green-700 text-xs sm:text-sm">
													<CheckCircleIcon className="mt-0.5 size-4 shrink-0" weight="fill" />
													<span>{strength}</span>
												</li>
											))}
										</ul>
									</CardContent>
								</Card>
							)}

							{/* Areas to Improve */}
							{summary.areasForImprovement.length > 0 && (
								<Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50">
									<CardHeader className="pb-3">
										<CardTitle className="flex items-center gap-2 text-base text-orange-700 sm:text-lg">
											<TrendUpIcon className="size-5" weight="fill" />
											{t`Areas to Improve`}
										</CardTitle>
									</CardHeader>
									<CardContent>
										<ul className="space-y-2">
											{summary.areasForImprovement.map((area, i) => (
												<li key={i} className="flex items-start gap-2 text-orange-700 text-xs sm:text-sm">
													<TargetIcon className="mt-0.5 size-4 shrink-0" weight="fill" />
													<span>{area}</span>
												</li>
											))}
										</ul>
									</CardContent>
								</Card>
							)}
						</div>

						{/* Overall Feedback */}
						<Card>
							<CardContent className="pt-6">
								<p className="text-muted-foreground text-sm leading-relaxed sm:text-base">{summary.overallFeedback}</p>
							</CardContent>
						</Card>
					</TabsContent>

					<TabsContent value="details" className="space-y-4">
						{summary.questionsSummary.length > 0 && (
							<div className="space-y-3">
								{summary.questionsSummary.map((q, i) => (
									<Card key={i} className="overflow-hidden">
										<div className="flex flex-col items-stretch sm:flex-row">
											<div
												className={cn(
													"flex w-full shrink-0 flex-row items-center justify-center gap-2 bg-gradient-to-r p-3 text-white sm:w-16 sm:flex-col sm:bg-gradient-to-b",
													q.score >= 80
														? "from-green-500 to-emerald-600"
														: q.score >= 60
															? "from-yellow-500 to-amber-600"
															: "from-orange-500 to-red-500",
												)}
											>
												<span className="font-bold text-xl">{q.score}</span>
												<span className="text-[10px] opacity-80">%</span>
											</div>
											<div className="flex-1 p-4">
												<p className="mb-1 font-medium text-xs sm:text-sm">
													Q{i + 1}: {q.question}
												</p>
												<p className="text-muted-foreground text-xs">{q.performanceNote}</p>
											</div>
										</div>
									</Card>
								))}
							</div>
						)}
					</TabsContent>

					<TabsContent value="recommendations" className="space-y-4">
						{summary.recommendations.length > 0 && (
							<Card className="border-indigo-200 bg-gradient-to-br from-indigo-50 to-purple-50">
								<CardHeader>
									<CardTitle className="flex items-center gap-2 text-base text-indigo-700 sm:text-lg">
										<LightbulbIcon className="size-5" weight="fill" />
										{t`Recommendations`}
									</CardTitle>
								</CardHeader>
								<CardContent>
									<ul className="space-y-3">
										{summary.recommendations.map((rec, i) => (
											<li
												key={i}
												className="flex items-start gap-3 rounded-lg bg-white/50 p-3 text-indigo-700 text-xs sm:text-sm"
											>
												<span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-indigo-200 font-semibold text-indigo-700 text-xs">
													{i + 1}
												</span>
												<span>{rec}</span>
											</li>
										))}
									</ul>
								</CardContent>
							</Card>
						)}
					</TabsContent>
				</Tabs>

				{/* Actions */}
				<div className="flex flex-col justify-center gap-3 sm:flex-row sm:gap-4">
					<Button variant="outline" size="lg" onClick={resetSession} className="min-h-[44px] w-full sm:w-auto">
						<SparkleIcon className="mr-2 size-4" />
						{t`New Session`}
					</Button>
					<Link to="/dashboard/interview" className="w-full sm:w-auto">
						<Button
							size="lg"
							className="min-h-[44px] w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
						>
							{t`Back to Dashboard`}
						</Button>
					</Link>
				</div>
			</div>
		</>
	);
});

// Loading summary view
export const LoadingSummaryView = memo(function LoadingSummaryView({ Announcer }: LoadingSummaryViewProps) {
	return (
		<>
			<DashboardHeader icon={ChatCircleDotsIcon} title={t`Analyzing...`} />
			{Announcer}
			<div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 p-4">
				<div className="relative">
					<div className="absolute inset-0 animate-ping rounded-full bg-primary/20" />
					<div className="relative flex size-20 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 sm:size-24">
						<SpinnerIcon className="size-10 animate-spin text-white sm:size-12" weight="bold" />
					</div>
				</div>
				<div className="text-center">
					<h2 className="mb-2 font-bold text-lg sm:text-xl">{t`Analyzing your performance...`}</h2>
					<p className="text-muted-foreground text-sm">{t`This may take a few seconds`}</p>
				</div>
				<div className="w-48 sm:w-64">
					<Progress value={66} className="h-2" />
				</div>
			</div>
		</>
	);
});

// Main chat interface
export const MainChatView = memo(function MainChatView({
	Announcer,
	isFullScreen,
	toggleFullScreen,
	isMobile,
	isOnline,
	isStreaming,
	isLoadingMessages,
	selectedMode,
	selectedField,
	selectedLanguage,
	questionCount,
	messages,
	input,
	setInput,
	sendMessage,
	endSession,
	stopStreaming,
	handleKeyPress,
	handleTouchStartPull,
	handleTouchMovePull,
	handleTouchEndPull,
	handleMessageLongPress,
	pullDistance,
	isPullingToRefresh,
	selectedMessageForOptions,
	setSelectedMessageForOptions,
	handleCopyMessage,
	scrollRef,
	inputRef,
	chatContainerRef,
}: MainChatViewProps) {
	const { i18n } = useLingui();
	return (
		<>
			{!isFullScreen && <DashboardHeader icon={ChatCircleDotsIcon} title={t`AI Interview Coach`} />}
			{Announcer}

			{/* Message options popup */}
			{selectedMessageForOptions && (
				<MessageOptionsPopup
					message={selectedMessageForOptions.message}
					position={selectedMessageForOptions.position}
					onClose={() => setSelectedMessageForOptions(null)}
					onCopy={handleCopyMessage}
					language={selectedLanguage}
				/>
			)}

			<div
				ref={chatContainerRef}
				className={cn(
					"mx-auto flex max-w-4xl flex-col gap-3 p-2 sm:gap-4 md:p-0",
					isFullScreen
						? "fixed inset-0 z-50 max-w-none bg-background"
						: "h-[calc(100vh-10rem)] md:h-[calc(100vh-8rem)]",
				)}
			>
				{/* Full screen close button */}
				{isFullScreen && (
					<div className="flex items-center justify-between p-4 pb-0">
						<h2 className="font-semibold">{t`AI Interview Coach`}</h2>
						<Button
							variant="ghost"
							size="icon"
							onClick={toggleFullScreen}
							className="min-h-[44px] min-w-[44px]"
							aria-label={t`Close full screen`}
						>
							<XIcon className="size-5" aria-hidden="true" />
						</Button>
					</div>
				)}

				{/* Session Info Bar */}
				<div
					className={cn(
						"flex flex-wrap items-center justify-between gap-2 rounded-xl border bg-gradient-to-r from-muted/50 to-muted/30 p-2 sm:gap-3 sm:p-3 md:p-4",
						isFullScreen && "mx-4",
					)}
				>
					<div className="flex flex-wrap items-center gap-1 sm:gap-2">
						<Badge variant="outline" className="border-primary/30 bg-primary/5 text-[10px] sm:text-xs">
							{languageConfig[selectedLanguage].flag} {languageConfig[selectedLanguage].nativeLabel}
						</Badge>
						<Badge
							variant="outline"
							className={cn(
								"border-0 text-[10px] text-white sm:text-xs",
								`bg-gradient-to-r ${modeConfig[selectedMode].color}`,
							)}
						>
							{selectedLanguage === "fr" ? modeConfig[selectedMode].labelFr : i18n._(modeConfig[selectedMode].label)}
						</Badge>
						{!isMobile && (
							<Badge variant="outline" className="text-[10px] sm:text-xs">
								{fieldConfig[selectedField].emoji}{" "}
								{selectedLanguage === "fr"
									? fieldConfig[selectedField].labelFr
									: i18n._(fieldConfig[selectedField].label)}
							</Badge>
						)}
					</div>
					<div className="flex items-center gap-2 sm:gap-3">
						{!isOnline && (
							<Badge variant="outline" className="border-yellow-300 bg-yellow-50 text-yellow-700">
								<WifiSlashIcon className="mr-1 size-3" />
								{t`Offline`}
							</Badge>
						)}
						<span className="text-[10px] text-muted-foreground sm:text-sm">{t`${questionCount} exchange(s)`}</span>
						{isMobile && (
							<Button
								variant="ghost"
								size="icon"
								onClick={toggleFullScreen}
								className="min-h-[44px] min-w-[44px]"
								aria-label={isFullScreen ? t`Exit full screen` : t`Full screen`}
							>
								{isFullScreen ? <ArrowsInIcon className="size-4" /> : <ArrowsOutIcon className="size-4" />}
							</Button>
						)}
						<Button
							variant="outline"
							size="sm"
							onClick={endSession}
							disabled={isStreaming || messages.length < 2}
							className="min-h-[44px] border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
							aria-label={t`End session and get feedback`}
						>
							<StopIcon className="size-4 sm:mr-2" aria-hidden="true" />
							<span className="hidden sm:inline">{t`End & Feedback`}</span>
						</Button>
					</div>
				</div>

				{/* Chat Messages */}
				<Card
					className={cn(
						"flex flex-1 flex-col overflow-hidden border-2",
						isFullScreen && "mx-4 mb-0 rounded-b-none border-b-0",
					)}
				>
					{/* Pull to refresh indicator */}
					{isMobile && pullDistance > 0 && (
						<div
							className="flex items-center justify-center bg-muted/50 transition-all"
							style={{ height: pullDistance }}
						>
							<div
								className={cn(
									"flex items-center gap-2 text-sm",
									isPullingToRefresh ? "text-primary" : "text-muted-foreground",
								)}
							>
								<SpinnerIcon className={cn("size-4", isPullingToRefresh && "animate-spin")} />
								{isPullingToRefresh ? t`Release for new conversation` : t`Pull for new conversation`}
							</div>
						</div>
					)}

					<ScrollArea
						className="flex-1"
						ref={scrollRef}
						onTouchStart={handleTouchStartPull}
						onTouchMove={handleTouchMovePull}
						onTouchEnd={handleTouchEndPull}
					>
						<div className="space-y-4 p-3 sm:p-4">
							{isLoadingMessages && (
								<>
									<MessageSkeleton />
									<MessageSkeleton isUser />
									<MessageSkeleton />
								</>
							)}
							{messages.map((message) => (
								<ChatMessage
									key={message.id}
									message={message}
									language={selectedLanguage}
									onLongPress={handleMessageLongPress}
									isMobile={isMobile}
								/>
							))}
						</div>
					</ScrollArea>

					{/* Input Area - Bottom anchored on mobile */}
					<div className={cn("border-t bg-muted/30 p-3 sm:p-4", isFullScreen && "pb-safe")}>
						<div className="flex gap-2 sm:gap-3">
							<Textarea
								ref={inputRef}
								placeholder={t`Type your response...`}
								value={input}
								onChange={(e) => setInput(e.target.value)}
								onKeyDown={handleKeyPress}
								disabled={isStreaming}
								className="min-h-[44px] resize-none border-2 bg-white focus-visible:border-primary sm:min-h-[60px] dark:bg-background"
								rows={isMobile ? 1 : 2}
								aria-label={t`Your response`}
							/>
							<div className="flex flex-col gap-2">
								{isStreaming ? (
									<Button
										variant="outline"
										size="icon"
										onClick={stopStreaming}
										className="size-[44px] border-red-200 text-red-600 hover:bg-red-50 sm:size-[60px]"
										aria-label={t`Stop`}
									>
										<StopIcon className="size-5 sm:size-6" weight="bold" />
									</Button>
								) : (
									<Button
										size="icon"
										onClick={sendMessage}
										disabled={!input.trim()}
										className="size-[44px] bg-gradient-to-br from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 sm:size-[60px]"
										aria-label={t`Send`}
									>
										<PaperPlaneIcon className="size-5 sm:size-6" weight="fill" />
									</Button>
								)}
							</div>
						</div>
						<div className="mt-2 flex items-center justify-between">
							<p className="hidden text-muted-foreground text-xs sm:block">
								{t`Press Enter to send, Shift+Enter for new line`}
							</p>
							{isMobile && <p className="text-[10px] text-muted-foreground">{t`Long-press for options`}</p>}
							{isStreaming && (
								<span className="flex items-center gap-1 text-primary text-xs">
									<SpinnerIcon className="size-3 animate-spin" />
									{t`AI is responding...`}
								</span>
							)}
						</div>
					</div>
				</Card>
			</div>
		</>
	);
});

// ============================================================================
// Custom Hooks
// ============================================================================

// Custom hook for responsive breakpoints
export function useResponsive() {
	const [isMobile, setIsMobile] = useState(false);
	const [isTablet, setIsTablet] = useState(false);

	useEffect(() => {
		const checkBreakpoint = () => {
			setIsMobile(window.innerWidth < 640);
			setIsTablet(window.innerWidth >= 640 && window.innerWidth < 1024);
		};

		checkBreakpoint();
		window.addEventListener("resize", checkBreakpoint);
		return () => window.removeEventListener("resize", checkBreakpoint);
	}, []);

	return { isMobile, isTablet, isDesktop: !isMobile && !isTablet };
}

// Custom hook for online/offline status
export function useOnlineStatus() {
	const [isOnline, setIsOnline] = useState(typeof navigator !== "undefined" ? navigator.onLine : true);

	useEffect(() => {
		const handleOnline = () => setIsOnline(true);
		const handleOffline = () => setIsOnline(false);

		window.addEventListener("online", handleOnline);
		window.addEventListener("offline", handleOffline);

		return () => {
			window.removeEventListener("online", handleOnline);
			window.removeEventListener("offline", handleOffline);
		};
	}, []);

	return isOnline;
}

// Custom hook for PWA install prompt
export function usePWAInstallPrompt() {
	const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
	const [isInstallable, setIsInstallable] = useState(false);

	useEffect(() => {
		const handleBeforeInstallPrompt = (e: Event) => {
			e.preventDefault();
			setDeferredPrompt(e as BeforeInstallPromptEvent);
			setIsInstallable(true);
		};

		window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
		return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
	}, []);

	const promptInstall = async () => {
		if (deferredPrompt) {
			await deferredPrompt.prompt();
			const { outcome } = await deferredPrompt.userChoice;
			if (outcome === "accepted") {
				setIsInstallable(false);
			}
			setDeferredPrompt(null);
		}
	};

	return { isInstallable, promptInstall };
}

// Extend Window interface for BeforeInstallPromptEvent
interface BeforeInstallPromptEvent extends Event {
	prompt: () => Promise<void>;
	userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

// Screen reader announcer for accessibility
export function useScreenReaderAnnouncer() {
	const [announcement, setAnnouncement] = useState("");

	const announce = useCallback((message: string) => {
		setAnnouncement("");
		// Small delay to ensure the screen reader picks up the change
		setTimeout(() => setAnnouncement(message), 100);
	}, []);

	const Announcer = useMemo(
		() => (
			<div aria-live="polite" aria-atomic="true" className="sr-only">
				{announcement}
			</div>
		),
		[announcement],
	);

	return { announce, Announcer };
}

// Offline message queue
export function useOfflineQueue() {
	const [queue, setQueue] = useState<Message[]>([]);

	const addToQueue = useCallback((message: Message) => {
		setQueue((prev) => [...prev, { ...message, status: "offline-queued" }]);
	}, []);

	const processQueue = useCallback(
		async (sendFn: (content: string) => Promise<void>) => {
			const currentQueue = [...queue];
			setQueue([]);

			for (const message of currentQueue) {
				try {
					await sendFn(message.content);
				} catch {
					// Re-add to queue if sending fails
					setQueue((prev) => [...prev, message]);
				}
			}
		},
		[queue],
	);

	const clearQueue = useCallback(() => setQueue([]), []);

	return { queue, addToQueue, processQueue, clearQueue };
}
