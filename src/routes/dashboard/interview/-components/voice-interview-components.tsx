import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import {
	ArrowLeftIcon,
	ArrowRightIcon,
	ChatCircleIcon,
	CheckCircleIcon,
	ClockIcon,
	DownloadIcon,
	GlobeIcon,
	MicrophoneIcon,
	MicrophoneSlashIcon,
	PhoneDisconnectIcon,
	PlayIcon,
	SparkleIcon,
	SpeakerHighIcon,
	StarIcon,
	TargetIcon,
	TrendUpIcon,
	UserCircleIcon,
	UsersFourIcon,
	UsersIcon,
	WarningCircleIcon,
	WaveformIcon,
} from "@phosphor-icons/react";
import { Link } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/utils/style";

import { LANGUAGES, PANEL_MEMBERS, VOICE_STYLE_ICONS } from "./voice-interview-config";
import type {
	Difficulty,
	FeedbackCategory,
	InterviewerFeedback,
	InterviewType,
	Language,
	PanelMember,
	TranscriptEntry,
} from "./voice-interview-types";

// ─── Setup Phase ────────────────────────────────────────────────────────────────

interface SetupPhaseProps {
	targetRole: string;
	setTargetRole: (value: string) => void;
	targetCompany: string;
	setTargetCompany: (value: string) => void;
	interviewType: InterviewType;
	setInterviewType: (value: InterviewType) => void;
	panelSize: number;
	setPanelSize: (value: number) => void;
	difficulty: Difficulty;
	setDifficulty: (value: Difficulty) => void;
	language: Language;
	setLanguage: (value: Language) => void;
	hasMicPermission: boolean | null;
	checkMicPermission: () => void;
	canStartInterview: boolean;
	startInterview: () => void;
}

export function SetupPhase({
	targetRole,
	setTargetRole,
	targetCompany,
	setTargetCompany,
	interviewType,
	setInterviewType,
	panelSize,
	setPanelSize,
	difficulty,
	setDifficulty,
	language,
	setLanguage,
	hasMicPermission,
	checkMicPermission,
	canStartInterview,
	startInterview,
}: SetupPhaseProps) {
	return (
		<motion.div
			key="setup"
			initial={false}
			animate={{ opacity: 1, y: 0 }}
			exit={{ opacity: 0, y: -20 }}
			transition={{ duration: 0.4 }}
		>
			{/* Hero Section */}
			<motion.div
				className="relative mb-8 overflow-hidden rounded-3xl border border-primary/20 p-8 md:p-12"
				style={{
					background:
						"linear-gradient(135deg, oklch(0.7 0.15 280 / 0.15) 0%, oklch(0.65 0.18 250 / 0.1) 50%, oklch(0.6 0.15 220 / 0.08) 100%)",
				}}
			>
				{/* Animated background */}
				<div className="pointer-events-none absolute inset-0 overflow-hidden">
					<motion.div
						className="absolute -top-32 -right-32 size-96 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/10 blur-3xl"
						animate={{
							scale: [1, 1.2, 1],
							rotate: [0, 10, 0],
						}}
						transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
					/>
					<motion.div
						className="absolute -bottom-32 -left-32 size-96 rounded-full bg-gradient-to-tr from-blue-500/15 to-indigo-500/10 blur-3xl"
						animate={{
							scale: [1.2, 1, 1.2],
							rotate: [0, -10, 0],
						}}
						transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
					/>
				</div>

				<div className="relative z-10">
					<motion.div
						className="mb-4 flex items-center gap-2"
						initial={false}
						animate={{ opacity: 1, x: 0 }}
						transition={{ delay: 0.2 }}
					>
						<MicrophoneIcon className="size-5 text-purple-600 dark:text-purple-400" weight="fill" />
						<span className="font-semibold text-purple-700 text-sm uppercase tracking-wider dark:text-purple-300">
							<Trans>Voice Simulation</Trans>
						</span>
					</motion.div>

					<motion.h2
						className="mb-4 bg-gradient-to-r from-purple-700 via-pink-600 to-blue-700 bg-clip-text font-bold text-3xl text-transparent tracking-tight md:text-4xl dark:from-purple-400 dark:via-pink-400 dark:to-blue-400"
						initial={false}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.3 }}
					>
						<Trans>AI Voice Interview</Trans>
					</motion.h2>

					<motion.p
						className="mb-6 max-w-2xl text-lg text-muted-foreground"
						initial={false}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.4 }}
					>
						<Trans>
							Practice your interviews in real conditions with our voice AI. Choose between an individual interview or a
							panel of interviewers to best prepare yourself.
						</Trans>
					</motion.p>

					<motion.div
						className="flex flex-wrap gap-3"
						initial={false}
						animate={{ opacity: 1 }}
						transition={{ delay: 0.5 }}
					>
						<Badge variant="secondary" className="gap-1.5 px-3 py-1.5">
							<WaveformIcon className="size-4" />
							<Trans>Real-time audio</Trans>
						</Badge>
						<Badge variant="secondary" className="gap-1.5 px-3 py-1.5">
							<UsersIcon className="size-4" />
							<Trans>Panel up to 4 people</Trans>
						</Badge>
						<Badge variant="secondary" className="gap-1.5 px-3 py-1.5">
							<GlobeIcon className="size-4" />
							<Trans>4 languages available</Trans>
						</Badge>
					</motion.div>
				</div>
			</motion.div>

			{/* Setup Form */}
			<div className="grid gap-6 lg:grid-cols-2">
				{/* Left Column - Interview Details */}
				<Card className="border-2 border-primary/20 border-dashed">
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<TargetIcon className="size-5 text-primary" weight="duotone" />
							<Trans>Interview Details</Trans>
						</CardTitle>
						<CardDescription>
							<Trans>Configure your simulation settings</Trans>
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-6">
						{/* Target Role */}
						<div className="space-y-2">
							<Label htmlFor="role">
								<Trans>Target position</Trans> *
							</Label>
							<Input
								id="role"
								placeholder={t`E.g.: Nurse, Maintenance Technician...`}
								value={targetRole}
								onChange={(e) => setTargetRole(e.target.value)}
							/>
						</div>

						{/* Target Company */}
						<div className="space-y-2">
							<Label htmlFor="company">
								<Trans>Target company</Trans>
							</Label>
							<Input
								id="company"
								placeholder={t`Ex: CHU Mohammed VI, OCP...`}
								value={targetCompany}
								onChange={(e) => setTargetCompany(e.target.value)}
							/>
						</div>

						{/* Interview Type */}
						<div className="space-y-3">
							<Label>
								<Trans>Interview type</Trans>
							</Label>
							<div className="grid grid-cols-2 gap-3">
								<Button
									type="button"
									variant={interviewType === "single" ? "default" : "outline"}
									className="h-auto flex-col gap-2 py-4"
									onClick={() => setInterviewType("single")}
								>
									<UserCircleIcon className="size-8" weight="duotone" />
									<span className="font-medium">
										<Trans>Individual</Trans>
									</span>
									<span className="text-muted-foreground text-xs">
										<Trans>1 interviewer</Trans>
									</span>
								</Button>
								<Button
									type="button"
									variant={interviewType === "panel" ? "default" : "outline"}
									className="h-auto flex-col gap-2 py-4"
									onClick={() => setInterviewType("panel")}
								>
									<UsersFourIcon className="size-8" weight="duotone" />
									<span className="font-medium">
										<Trans>Panel</Trans>
									</span>
									<span className="text-muted-foreground text-xs">
										<Trans>2-4 interviewers</Trans>
									</span>
								</Button>
							</div>
						</div>

						{/* Panel Size */}
						<AnimatePresence>
							{interviewType === "panel" && (
								<motion.div
									initial={{ opacity: 0, height: 0 }}
									animate={{ opacity: 1, height: "auto" }}
									exit={{ opacity: 0, height: 0 }}
									className="space-y-3"
								>
									<Label>
										<Trans>Number of interviewers</Trans>
									</Label>
									<div className="flex gap-2">
										{[2, 3, 4].map((size) => (
											<Button
												key={size}
												type="button"
												variant={panelSize === size ? "default" : "outline"}
												size="lg"
												className="flex-1"
												onClick={() => setPanelSize(size)}
											>
												{size}
											</Button>
										))}
									</div>
								</motion.div>
							)}
						</AnimatePresence>

						{/* Difficulty */}
						<div className="space-y-3">
							<Label>
								<Trans>Difficulty level</Trans>
							</Label>
							<Select value={difficulty} onValueChange={(v: Difficulty) => setDifficulty(v)}>
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="easy">
										<span className="flex items-center gap-2">
											<span className="size-2 rounded-full bg-green-500" />
											<Trans>Easy</Trans> - <Trans>Beginner</Trans>
										</span>
									</SelectItem>
									<SelectItem value="medium">
										<span className="flex items-center gap-2">
											<span className="size-2 rounded-full bg-amber-500" />
											<Trans>Medium</Trans> - <Trans>Standard</Trans>
										</span>
									</SelectItem>
									<SelectItem value="hard">
										<span className="flex items-center gap-2">
											<span className="size-2 rounded-full bg-red-500" />
											<Trans>Hard</Trans> - <Trans>Challenging</Trans>
										</span>
									</SelectItem>
								</SelectContent>
							</Select>
						</div>

						{/* Language */}
						<div className="space-y-3">
							<Label>
								<Trans>Interview language</Trans>
							</Label>
							<Select value={language} onValueChange={(v: Language) => setLanguage(v)}>
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									{Object.entries(LANGUAGES).map(([key, { label }]) => (
										<SelectItem key={key} value={key}>
											{label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
					</CardContent>
				</Card>

				{/* Right Column - Microphone & Panel Preview */}
				<div className="space-y-6">
					{/* Microphone Check */}
					<MicrophoneCheckCard hasMicPermission={hasMicPermission} checkMicPermission={checkMicPermission} />

					{/* Panel Preview */}
					<PanelPreviewCard interviewType={interviewType} panelSize={panelSize} />

					{/* Start Button */}
					<Button
						size="lg"
						className="w-full gap-2 bg-gradient-to-r from-purple-600 to-pink-600 py-6 text-lg hover:from-purple-700 hover:to-pink-700"
						disabled={!canStartInterview}
						onClick={startInterview}
					>
						<PlayIcon className="size-5" weight="fill" />
						<Trans>Start Interview</Trans>
					</Button>

					{!canStartInterview && (
						<p className="text-center text-muted-foreground text-sm">
							{!targetRole.trim() && <Trans>Please enter the target position</Trans>}
							{targetRole.trim() && hasMicPermission !== true && <Trans>Please allow microphone access</Trans>}
						</p>
					)}
				</div>
			</div>
		</motion.div>
	);
}

// ─── Microphone Check Card ──────────────────────────────────────────────────────

interface MicrophoneCheckCardProps {
	hasMicPermission: boolean | null;
	checkMicPermission: () => void;
}

function MicrophoneCheckCard({ hasMicPermission, checkMicPermission }: MicrophoneCheckCardProps) {
	return (
		<Card
			className={cn(
				"transition-colors",
				hasMicPermission === true && "border-green-500/50 bg-green-50/30 dark:bg-green-900/10",
				hasMicPermission === false && "border-red-500/50 bg-red-50/30 dark:bg-red-900/10",
			)}
		>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<MicrophoneIcon
						className={cn(
							"size-5",
							hasMicPermission === true && "text-green-500",
							hasMicPermission === false && "text-red-500",
							hasMicPermission === null && "text-muted-foreground",
						)}
						weight="duotone"
					/>
					<Trans>Microphone Check</Trans>
				</CardTitle>
			</CardHeader>
			<CardContent>
				{hasMicPermission === null && (
					<div className="flex items-center gap-3 text-muted-foreground">
						<div className="size-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
						<Trans>Checking...</Trans>
					</div>
				)}
				{hasMicPermission === true && (
					<div className="flex items-center gap-3 text-green-600 dark:text-green-400">
						<CheckCircleIcon className="size-5" weight="fill" />
						<Trans>Microphone detected and ready</Trans>
					</div>
				)}
				{hasMicPermission === false && (
					<div className="space-y-3">
						<div className="flex items-center gap-3 text-red-600 dark:text-red-400">
							<WarningCircleIcon className="size-5" weight="fill" />
							<Trans>Microphone access denied</Trans>
						</div>
						<Button variant="outline" size="sm" onClick={checkMicPermission}>
							<Trans>Retry</Trans>
						</Button>
					</div>
				)}
			</CardContent>
		</Card>
	);
}

// ─── Panel Preview Card ─────────────────────────────────────────────────────────

interface PanelPreviewCardProps {
	interviewType: InterviewType;
	panelSize: number;
}

function PanelPreviewCard({ interviewType, panelSize }: PanelPreviewCardProps) {
	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<UsersIcon className="size-5 text-primary" weight="duotone" />
					<Trans>Your Panel</Trans>
				</CardTitle>
				<CardDescription>
					{interviewType === "single" ? (
						<Trans>Your interviewer for this session</Trans>
					) : (
						<Trans>The {panelSize} members of your panel</Trans>
					)}
				</CardDescription>
			</CardHeader>
			<CardContent>
				<div className={cn("grid gap-4", interviewType === "panel" && panelSize > 2 ? "grid-cols-2" : "grid-cols-1")}>
					{(interviewType === "single" ? [PANEL_MEMBERS[0]] : PANEL_MEMBERS.slice(0, panelSize)).map((member) => (
						<motion.div
							key={member.id}
							initial={false}
							animate={{ opacity: 1, scale: 1 }}
							className="group relative overflow-hidden rounded-xl border bg-card p-4"
						>
							{/* Gradient Background */}
							<div
								className={cn(
									"absolute inset-0 bg-gradient-to-br opacity-5 transition-opacity group-hover:opacity-10",
									member.color,
								)}
							/>

							<div className="relative flex items-center gap-3">
								<Avatar size="lg" className="ring-2 ring-primary/20">
									<AvatarImage src={member.avatar} alt={member.name} />
									<AvatarFallback className={cn("bg-gradient-to-br text-white", member.color)}>
										{member.name
											.split(" ")
											.map((n) => n[0])
											.join("")}
									</AvatarFallback>
								</Avatar>
								<div className="min-w-0 flex-1">
									<p className="truncate font-semibold">{member.name}</p>
									<p className="truncate text-muted-foreground text-sm">{member.role}</p>
									<div className="mt-1 flex items-center gap-1.5">
										{(() => {
											const style = VOICE_STYLE_ICONS[member.voiceStyle];
											const StyleIcon = style.icon;
											return (
												<Badge variant="secondary" className="gap-1 text-xs">
													<StyleIcon className="size-3" />
													{style.label}
												</Badge>
											);
										})()}
									</div>
								</div>
							</div>
						</motion.div>
					))}
				</div>
			</CardContent>
		</Card>
	);
}

// ─── Interview Phase ────────────────────────────────────────────────────────────

interface InterviewPhaseProps {
	panelMembers: PanelMember[];
	activeSpeaker: string | null;
	transcript: TranscriptEntry[];
	interviewDuration: number;
	isUserSpeaking: boolean;
	isMuted: boolean;
	audioLevel: number;
	targetRole: string;
	targetCompany: string;
	difficulty: Difficulty;
	formatDuration: (seconds: number) => string;
	toggleMute: () => void;
	endInterview: () => void;
	transcriptEndRef: React.RefObject<HTMLDivElement | null>;
}

export function InterviewPhaseView({
	panelMembers,
	activeSpeaker,
	transcript,
	interviewDuration,
	isUserSpeaking,
	isMuted,
	audioLevel,
	targetRole,
	targetCompany,
	difficulty,
	formatDuration,
	toggleMute,
	endInterview,
	transcriptEndRef,
}: InterviewPhaseProps) {
	return (
		<motion.div
			key="interview"
			initial={false}
			animate={{ opacity: 1, y: 0 }}
			exit={{ opacity: 0, y: -20 }}
			transition={{ duration: 0.4 }}
			className="flex h-[calc(100vh-12rem)] flex-col"
		>
			{/* Panel Members */}
			<div className="mb-6">
				<div className="flex items-center justify-center gap-4 overflow-x-auto pb-2">
					{panelMembers.map((member) => (
						<motion.div
							key={member.id}
							className={cn(
								"relative flex flex-col items-center gap-2 rounded-2xl border-2 bg-card p-4 transition-all",
								activeSpeaker === member.id
									? "scale-105 border-primary shadow-lg shadow-primary/20"
									: "border-transparent opacity-70",
							)}
							animate={
								activeSpeaker === member.id
									? {
											boxShadow: [
												"0 0 0 0 rgba(var(--primary), 0.4)",
												"0 0 20px 8px rgba(var(--primary), 0.1)",
												"0 0 0 0 rgba(var(--primary), 0.4)",
											],
										}
									: {}
							}
							transition={{ duration: 2, repeat: Infinity }}
						>
							{/* Speaking indicator ring */}
							{activeSpeaker === member.id && (
								<motion.div
									className="absolute inset-0 rounded-2xl border-2 border-primary"
									animate={{
										scale: [1, 1.05, 1],
										opacity: [1, 0.5, 1],
									}}
									transition={{ duration: 1.5, repeat: Infinity }}
								/>
							)}

							<div className="relative">
								<Avatar
									size="lg"
									className={cn("ring-4", activeSpeaker === member.id ? "ring-primary" : "ring-transparent")}
								>
									<AvatarImage src={member.avatar} alt={member.name} />
									<AvatarFallback className={cn("bg-gradient-to-br text-white", member.color)}>
										{member.name
											.split(" ")
											.map((n) => n[0])
											.join("")}
									</AvatarFallback>
								</Avatar>
								{activeSpeaker === member.id && (
									<motion.div
										className="absolute -right-1 -bottom-1 rounded-full bg-primary p-1"
										animate={{ scale: [1, 1.2, 1] }}
										transition={{ duration: 0.8, repeat: Infinity }}
									>
										<SpeakerHighIcon className="size-4 text-primary-foreground" weight="fill" />
									</motion.div>
								)}
							</div>

							<div className="text-center">
								<p className="font-semibold text-sm">{member.name}</p>
								<p className="text-muted-foreground text-xs">{member.role}</p>
							</div>
						</motion.div>
					))}
				</div>
			</div>

			{/* Main Interview Area */}
			<div className="flex flex-1 gap-6 overflow-hidden">
				{/* Transcript Panel */}
				<TranscriptPanel
					transcript={transcript}
					panelMembers={panelMembers}
					interviewDuration={interviewDuration}
					formatDuration={formatDuration}
					transcriptEndRef={transcriptEndRef}
				/>

				{/* Controls Panel */}
				<div className="flex w-80 shrink-0 flex-col gap-4">
					{/* User Status */}
					<UserStatusCard
						isUserSpeaking={isUserSpeaking}
						isMuted={isMuted}
						audioLevel={audioLevel}
						toggleMute={toggleMute}
					/>

					{/* Interview Info */}
					<InterviewInfoCard targetRole={targetRole} targetCompany={targetCompany} difficulty={difficulty} />

					{/* End Interview Button */}
					<Button variant="destructive" size="lg" className="mt-auto gap-2" onClick={endInterview}>
						<PhoneDisconnectIcon className="size-5" weight="fill" />
						<Trans>End Interview</Trans>
					</Button>
				</div>
			</div>
		</motion.div>
	);
}

// ─── Transcript Panel ───────────────────────────────────────────────────────────

interface TranscriptPanelProps {
	transcript: TranscriptEntry[];
	panelMembers: PanelMember[];
	interviewDuration: number;
	formatDuration: (seconds: number) => string;
	transcriptEndRef: React.RefObject<HTMLDivElement | null>;
}

function TranscriptPanel({
	transcript,
	panelMembers,
	interviewDuration,
	formatDuration,
	transcriptEndRef,
}: TranscriptPanelProps) {
	return (
		<Card className="flex flex-1 flex-col">
			<CardHeader className="shrink-0 border-b pb-4">
				<div className="flex items-center justify-between">
					<CardTitle className="flex items-center gap-2">
						<ChatCircleIcon className="size-5 text-primary" weight="duotone" />
						<Trans>Live Transcription</Trans>
					</CardTitle>
					<Badge variant="outline" className="gap-1.5">
						<ClockIcon className="size-3.5" />
						{formatDuration(interviewDuration)}
					</Badge>
				</div>
			</CardHeader>
			<CardContent className="flex-1 overflow-hidden p-0">
				<ScrollArea className="h-full p-4">
					<div className="space-y-4">
						<AnimatePresence>
							{transcript.map((entry) => {
								const speaker = panelMembers.find((m) => m.id === entry.speakerId);
								return (
									<motion.div
										key={entry.id}
										initial={{ opacity: 0, y: 10 }}
										animate={{ opacity: 1, y: 0 }}
										className={cn("flex gap-3", entry.isUser && "flex-row-reverse")}
									>
										<Avatar size="sm">
											{entry.isUser ? (
												<AvatarFallback className="bg-primary text-primary-foreground">V</AvatarFallback>
											) : (
												<>
													<AvatarImage src={speaker?.avatar} />
													<AvatarFallback className={cn("bg-gradient-to-br text-white text-xs", speaker?.color)}>
														{entry.speaker
															.split(" ")
															.map((n) => n[0])
															.join("")}
													</AvatarFallback>
												</>
											)}
										</Avatar>
										<div className={cn("max-w-[75%] space-y-1", entry.isUser && "text-right")}>
											<p className="font-medium text-sm">{entry.speaker}</p>
											<div
												className={cn(
													"rounded-2xl px-4 py-2",
													entry.isUser
														? "rounded-tr-none bg-primary text-primary-foreground"
														: "rounded-tl-none bg-muted",
												)}
											>
												<p className="text-sm">{entry.text}</p>
											</div>
											<p className="text-muted-foreground text-xs">
												{new Date(entry.timestamp).toLocaleTimeString("fr-FR")}
											</p>
										</div>
									</motion.div>
								);
							})}
						</AnimatePresence>
						<div ref={transcriptEndRef} />
					</div>
				</ScrollArea>
			</CardContent>
		</Card>
	);
}

// ─── User Status Card ───────────────────────────────────────────────────────────

interface UserStatusCardProps {
	isUserSpeaking: boolean;
	isMuted: boolean;
	audioLevel: number;
	toggleMute: () => void;
}

function UserStatusCard({ isUserSpeaking, isMuted, audioLevel, toggleMute }: UserStatusCardProps) {
	return (
		<Card className="border-2 border-primary/30 border-dashed">
			<CardContent className="p-6">
				<div className="flex flex-col items-center gap-4">
					{/* User Avatar with speaking indicator */}
					<div className="relative">
						<motion.div
							className={cn(
								"flex size-24 items-center justify-center rounded-full border-4",
								isUserSpeaking ? "border-primary" : "border-muted",
							)}
							animate={
								isUserSpeaking
									? {
											boxShadow: [
												"0 0 0 0 rgba(var(--primary), 0.4)",
												"0 0 20px 10px rgba(var(--primary), 0.2)",
												"0 0 0 0 rgba(var(--primary), 0.4)",
											],
										}
									: {}
							}
							transition={{ duration: 1, repeat: Infinity }}
						>
							<Avatar className="size-20">
								<AvatarFallback className="bg-gradient-to-br from-primary to-purple-600 font-bold text-2xl text-white">
									V
								</AvatarFallback>
							</Avatar>
						</motion.div>

						{/* Audio level indicator */}
						<div className="absolute -bottom-1 left-1/2 flex -translate-x-1/2 gap-0.5">
							{[0.2, 0.4, 0.6, 0.8, 1].map((threshold, i) => (
								<motion.div
									key={i}
									className={cn(
										"w-1.5 rounded-full transition-all",
										audioLevel > threshold ? "bg-primary" : "bg-muted",
									)}
									animate={{
										height: audioLevel > threshold ? 8 + i * 4 : 4,
									}}
								/>
							))}
						</div>
					</div>

					<div className="text-center">
						<p className="font-semibold">
							<Trans>You</Trans>
						</p>
						<p className={cn("text-sm", isUserSpeaking ? "text-primary" : "text-muted-foreground")}>
							{isUserSpeaking ? <Trans>Speaking...</Trans> : <Trans>Listening</Trans>}
						</p>
					</div>

					{/* Mute Toggle */}
					<Button variant={isMuted ? "destructive" : "outline"} size="lg" className="w-full gap-2" onClick={toggleMute}>
						{isMuted ? (
							<>
								<MicrophoneSlashIcon className="size-5" weight="fill" />
								<Trans>Microphone muted</Trans>
							</>
						) : (
							<>
								<MicrophoneIcon className="size-5" weight="fill" />
								<Trans>Microphone active</Trans>
							</>
						)}
					</Button>
				</div>
			</CardContent>
		</Card>
	);
}

// ─── Interview Info Card ────────────────────────────────────────────────────────

interface InterviewInfoCardProps {
	targetRole: string;
	targetCompany: string;
	difficulty: Difficulty;
}

function InterviewInfoCard({ targetRole, targetCompany, difficulty }: InterviewInfoCardProps) {
	return (
		<Card>
			<CardContent className="space-y-4 p-4">
				<div className="space-y-2">
					<p className="text-muted-foreground text-sm">
						<Trans>Position</Trans>
					</p>
					<p className="font-medium">{targetRole}</p>
				</div>
				{targetCompany && (
					<div className="space-y-2">
						<p className="text-muted-foreground text-sm">
							<Trans>Company</Trans>
						</p>
						<p className="font-medium">{targetCompany}</p>
					</div>
				)}
				<div className="space-y-2">
					<p className="text-muted-foreground text-sm">
						<Trans>Difficulty</Trans>
					</p>
					<Badge
						variant="secondary"
						className={cn(
							difficulty === "easy" && "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
							difficulty === "medium" && "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
							difficulty === "hard" && "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
						)}
					>
						{difficulty === "easy" && <Trans>Easy</Trans>}
						{difficulty === "medium" && <Trans>Medium</Trans>}
						{difficulty === "hard" && <Trans>Hard</Trans>}
					</Badge>
				</div>
			</CardContent>
		</Card>
	);
}

// ─── Feedback Phase ─────────────────────────────────────────────────────────────

interface FeedbackPhaseProps {
	overallScore: number;
	animatedScore: number;
	interviewDuration: number;
	targetRole: string;
	transcript: TranscriptEntry[];
	feedbackCategories: FeedbackCategory[];
	strengths: string[];
	improvements: string[];
	recommendations: string[];
	interviewType: InterviewType;
	interviewerFeedback: InterviewerFeedback[];
	formatDuration: (seconds: number) => string;
	downloadTranscript: () => void;
	practiceAgain: () => void;
}

export function FeedbackPhaseView({
	overallScore,
	animatedScore,
	interviewDuration,
	targetRole,
	transcript,
	feedbackCategories,
	strengths,
	improvements,
	recommendations,
	interviewType,
	interviewerFeedback,
	formatDuration,
	downloadTranscript,
	practiceAgain,
}: FeedbackPhaseProps) {
	return (
		<motion.div
			key="feedback"
			initial={false}
			animate={{ opacity: 1, y: 0 }}
			exit={{ opacity: 0, y: -20 }}
			transition={{ duration: 0.4 }}
		>
			{/* Overall Score Hero */}
			<ScoreHero
				overallScore={overallScore}
				animatedScore={animatedScore}
				interviewDuration={interviewDuration}
				targetRole={targetRole}
				transcript={transcript}
				formatDuration={formatDuration}
			/>

			{/* Score Breakdown */}
			<ScoreBreakdown feedbackCategories={feedbackCategories} />

			{/* Feedback Details */}
			<div className="mb-8 grid gap-6 lg:grid-cols-2">
				{/* Strengths */}
				<motion.div initial={false} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}>
					<Card className="h-full border-green-500/30 bg-green-50/30 dark:bg-green-900/10">
						<CardHeader>
							<CardTitle className="flex items-center gap-2 text-green-600 dark:text-green-400">
								<StarIcon className="size-5" weight="fill" />
								<Trans>Your Strengths</Trans>
							</CardTitle>
						</CardHeader>
						<CardContent>
							<ul className="space-y-3">
								{strengths.map((strength, index) => (
									<motion.li
										key={index}
										initial={false}
										animate={{ opacity: 1, x: 0 }}
										transition={{ delay: 0.6 + index * 0.1 }}
										className="flex items-start gap-3"
									>
										<CheckCircleIcon className="mt-0.5 size-5 shrink-0 text-green-500" weight="fill" />
										<span className="text-sm">{strength}</span>
									</motion.li>
								))}
							</ul>
						</CardContent>
					</Card>
				</motion.div>

				{/* Improvements */}
				<motion.div initial={false} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}>
					<Card className="h-full border-amber-500/30 bg-amber-50/30 dark:bg-amber-900/10">
						<CardHeader>
							<CardTitle className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
								<TrendUpIcon className="size-5" weight="fill" />
								<Trans>Areas for Improvement</Trans>
							</CardTitle>
						</CardHeader>
						<CardContent>
							<ul className="space-y-3">
								{improvements.map((improvement, index) => (
									<motion.li
										key={index}
										initial={false}
										animate={{ opacity: 1, x: 0 }}
										transition={{ delay: 0.6 + index * 0.1 }}
										className="flex items-start gap-3"
									>
										<ArrowRightIcon className="mt-0.5 size-5 shrink-0 text-amber-500" weight="bold" />
										<span className="text-sm">{improvement}</span>
									</motion.li>
								))}
							</ul>
						</CardContent>
					</Card>
				</motion.div>
			</div>

			{/* Recommendations */}
			<RecommendationsCard recommendations={recommendations} />

			{/* Interviewer Specific Feedback */}
			{interviewType === "panel" && interviewerFeedback.length > 1 && (
				<InterviewerFeedbackSection interviewerFeedback={interviewerFeedback} />
			)}

			{/* Action Buttons */}
			<motion.div
				initial={false}
				animate={{ opacity: 1 }}
				transition={{ delay: 1.2 }}
				className="flex flex-wrap justify-center gap-4"
			>
				<Button variant="outline" size="lg" className="gap-2" onClick={downloadTranscript}>
					<DownloadIcon className="size-5" />
					<Trans>Download Transcript</Trans>
				</Button>
				<Button
					size="lg"
					className="gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
					onClick={practiceAgain}
				>
					<PlayIcon className="size-5" weight="fill" />
					<Trans>New Interview</Trans>
				</Button>
				<Link to="/dashboard/interview">
					<Button variant="ghost" size="lg" className="gap-2">
						<ArrowLeftIcon className="size-5" />
						<Trans>Back to Hub</Trans>
					</Button>
				</Link>
			</motion.div>
		</motion.div>
	);
}

// ─── Score Hero ──────────────────────────────────────────────────────────────────

interface ScoreHeroProps {
	overallScore: number;
	animatedScore: number;
	interviewDuration: number;
	targetRole: string;
	transcript: TranscriptEntry[];
	formatDuration: (seconds: number) => string;
}

function ScoreHero({
	overallScore,
	animatedScore,
	interviewDuration,
	targetRole,
	transcript,
	formatDuration,
}: ScoreHeroProps) {
	return (
		<motion.div
			className="relative mb-8 overflow-hidden rounded-3xl border border-green-500/20 p-8 md:p-12"
			style={{
				background:
					"linear-gradient(135deg, oklch(0.7 0.15 150 / 0.15) 0%, oklch(0.65 0.18 180 / 0.1) 50%, oklch(0.6 0.15 200 / 0.08) 100%)",
			}}
		>
			<div className="pointer-events-none absolute inset-0 overflow-hidden">
				<motion.div
					className="absolute -top-32 -right-32 size-96 rounded-full bg-gradient-to-br from-green-500/20 to-emerald-500/10 blur-3xl"
					animate={{
						scale: [1, 1.2, 1],
						opacity: [0.5, 0.3, 0.5],
					}}
					transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
				/>
			</div>

			<div className="relative z-10 flex flex-col items-center gap-6 text-center md:flex-row md:text-left">
				{/* Animated Score */}
				<motion.div
					className="relative flex size-40 items-center justify-center"
					initial={{ scale: 0, rotate: -180 }}
					animate={{ scale: 1, rotate: 0 }}
					transition={{ type: "spring", duration: 1, delay: 0.2 }}
				>
					<svg className="absolute size-full -rotate-90">
						<circle
							cx="80"
							cy="80"
							r="70"
							fill="none"
							stroke="currentColor"
							strokeWidth="8"
							className="text-muted/30"
						/>
						<motion.circle
							cx="80"
							cy="80"
							r="70"
							fill="none"
							stroke="url(#scoreGradient)"
							strokeWidth="8"
							strokeLinecap="round"
							initial={{ strokeDasharray: "0 440" }}
							animate={{ strokeDasharray: `${(overallScore / 100) * 440} 440` }}
							transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }}
						/>
						<defs>
							<linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
								<stop offset="0%" stopColor="#22c55e" />
								<stop offset="100%" stopColor="#10b981" />
							</linearGradient>
						</defs>
					</svg>
					<div className="text-center">
						<span className="font-bold text-5xl">{animatedScore}</span>
						<span className="font-semibold text-2xl text-muted-foreground">/100</span>
					</div>
				</motion.div>

				<div className="flex-1">
					<motion.h2
						className="mb-2 font-bold text-3xl"
						initial={false}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.3 }}
					>
						<Trans>Excellent work!</Trans>
					</motion.h2>
					<motion.p
						className="mb-4 text-lg text-muted-foreground"
						initial={false}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.4 }}
					>
						<Trans>
							You completed a {formatDuration(interviewDuration)} interview for the position of {targetRole}.
						</Trans>
					</motion.p>
					<motion.div
						className="flex flex-wrap justify-center gap-3 md:justify-start"
						initial={false}
						animate={{ opacity: 1 }}
						transition={{ delay: 0.5 }}
					>
						<Badge className="gap-1.5 bg-green-500/10 px-3 py-1.5 text-green-600 hover:bg-green-500/20 dark:text-green-400">
							<CheckCircleIcon className="size-4" weight="fill" />
							<Trans>Interview complete</Trans>
						</Badge>
						<Badge variant="secondary" className="gap-1.5 px-3 py-1.5">
							<ClockIcon className="size-4" />
							{formatDuration(interviewDuration)}
						</Badge>
						<Badge variant="secondary" className="gap-1.5 px-3 py-1.5">
							<ChatCircleIcon className="size-4" />
							{transcript.length} <Trans>exchanges</Trans>
						</Badge>
					</motion.div>
				</div>
			</div>
		</motion.div>
	);
}

// ─── Score Breakdown ────────────────────────────────────────────────────────────

interface ScoreBreakdownProps {
	feedbackCategories: FeedbackCategory[];
}

function ScoreBreakdown({ feedbackCategories }: ScoreBreakdownProps) {
	return (
		<div className="mb-8 grid gap-4 md:grid-cols-4">
			{feedbackCategories.map((category, index) => {
				const CategoryIcon = category.icon;
				return (
					<motion.div
						key={category.name}
						initial={false}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.1 * index }}
					>
						<Card className="h-full">
							<CardContent className="p-6">
								<div className="mb-4 flex items-center justify-between">
									<div className={cn("flex size-12 items-center justify-center rounded-xl bg-muted")}>
										<CategoryIcon className={cn("size-6", category.color)} weight="duotone" />
									</div>
									<span className="font-bold text-2xl">{category.score}</span>
								</div>
								<p className="mb-2 font-medium">{category.name}</p>
								<Progress value={category.score} className="h-2" />
							</CardContent>
						</Card>
					</motion.div>
				);
			})}
		</div>
	);
}

// ─── Recommendations Card ───────────────────────────────────────────────────────

interface RecommendationsCardProps {
	recommendations: string[];
}

function RecommendationsCard({ recommendations }: RecommendationsCardProps) {
	return (
		<motion.div initial={false} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} className="mb-8">
			<Card className="border-blue-500/30 bg-blue-50/30 dark:bg-blue-900/10">
				<CardHeader>
					<CardTitle className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
						<SparkleIcon className="size-5" weight="fill" />
						<Trans>Personalized Recommendations</Trans>
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="grid gap-4 md:grid-cols-2">
						{recommendations.map((rec, index) => (
							<motion.div
								key={index}
								initial={false}
								animate={{ opacity: 1, scale: 1 }}
								transition={{ delay: 0.8 + index * 0.1 }}
								className="flex items-start gap-3 rounded-lg border bg-background/50 p-4"
							>
								<div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
									<span className="font-semibold text-blue-600 text-sm dark:text-blue-400">{index + 1}</span>
								</div>
								<p className="text-sm">{rec}</p>
							</motion.div>
						))}
					</div>
				</CardContent>
			</Card>
		</motion.div>
	);
}

// ─── Interviewer Feedback Section ───────────────────────────────────────────────

interface InterviewerFeedbackSectionProps {
	interviewerFeedback: InterviewerFeedback[];
}

function InterviewerFeedbackSection({ interviewerFeedback }: InterviewerFeedbackSectionProps) {
	return (
		<motion.div initial={false} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }} className="mb-8">
			<h3 className="mb-4 flex items-center gap-2 font-semibold text-xl">
				<UsersIcon className="size-6 text-primary" weight="duotone" />
				<Trans>Interviewer Feedback</Trans>
			</h3>
			<div className="grid gap-4 md:grid-cols-2">
				{interviewerFeedback.map((feedback, index) => (
					<motion.div
						key={feedback.interviewerId}
						initial={false}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 1 + index * 0.1 }}
					>
						<Card className="h-full">
							<CardHeader className="pb-4">
								<div className="flex items-center gap-3">
									<Avatar
										className={cn(
											"ring-2 ring-offset-2",
											`ring-${feedback.interviewer.color.split(" ")[0].replace("from-", "")}`,
										)}
									>
										<AvatarImage src={feedback.interviewer.avatar} />
										<AvatarFallback className={cn("bg-gradient-to-br text-sm text-white", feedback.interviewer.color)}>
											{feedback.interviewer.name
												.split(" ")
												.map((n) => n[0])
												.join("")}
										</AvatarFallback>
									</Avatar>
									<div className="flex-1">
										<p className="font-semibold">{feedback.interviewer.name}</p>
										<p className="text-muted-foreground text-sm">{feedback.interviewer.role}</p>
									</div>
									<Badge variant="secondary" className="font-bold">
										{feedback.score}/100
									</Badge>
								</div>
							</CardHeader>
							<CardContent>
								<p className="mb-4 text-muted-foreground text-sm">{feedback.impression}</p>
								<div className="flex flex-wrap gap-2">
									{feedback.keyPoints.map((point, i) => (
										<Badge key={i} variant="outline" className="text-xs">
											{point}
										</Badge>
									))}
								</div>
							</CardContent>
						</Card>
					</motion.div>
				))}
			</div>
		</motion.div>
	);
}
