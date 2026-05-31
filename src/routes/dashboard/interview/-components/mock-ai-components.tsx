import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import {
	ArrowLeftIcon,
	ArrowRightIcon,
	BrainIcon,
	ChatCircleDotsIcon,
	CheckCircleIcon,
	ClockIcon,
	GearIcon,
	LightbulbIcon,
	PaperPlaneIcon,
	PlayIcon,
	RobotIcon,
	SparkleIcon,
	SpinnerIcon,
	StarIcon,
	TargetIcon,
	TrophyIcon,
	UserIcon,
	XCircleIcon,
} from "@phosphor-icons/react";
import { Link } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import type { RefObject } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/utils/style";
import { DashboardHeader } from "../../-components/header";

import type {
	Difficulty,
	DifficultyConfig,
	Field,
	FieldConfig,
	InterviewSession,
	InterviewTip,
	SessionHistory,
} from "./mock-ai-types";

// ========================================
// LOADING SKELETON
// ========================================

export function MockAILoadingSkeleton() {
	return (
		<>
			<DashboardHeader icon={RobotIcon} title={t`AI Interview Simulation`} />
			<div className="mx-auto max-w-4xl space-y-6">
				<Skeleton className="h-48 w-full rounded-2xl" />
				<div className="grid gap-4 md:grid-cols-3">
					<Skeleton className="h-24" />
					<Skeleton className="h-24" />
					<Skeleton className="h-24" />
				</div>
				<Skeleton className="h-96" />
			</div>
		</>
	);
}

// ========================================
// SETUP PHASE
// ========================================

type SetupPhaseProps = {
	selectedField: Field;
	setSelectedField: (f: Field) => void;
	selectedProgram: string;
	setSelectedProgram: (p: string) => void;
	selectedDifficulty: Difficulty;
	setSelectedDifficulty: (d: Difficulty) => void;
	fieldConfigMap: Record<Field, FieldConfig>;
	difficultyConfigMap: Record<Difficulty, DifficultyConfig>;
	availablePrograms: Array<{ id: string; name: string }>;
	interviewTips: InterviewTip[] | undefined;
	history: SessionHistory[];
	allPrograms: Record<string, Array<{ id: string; name: string }>> | undefined;
	statsData: { totalSessions: number; passedSessions: number; averageScore: number } | undefined;
	averageHistoryScore: number;
	startInterview: () => void;
	createSessionMutation: { isPending: boolean };
};

export function SetupPhase({
	selectedField,
	setSelectedField,
	selectedProgram,
	setSelectedProgram,
	selectedDifficulty,
	setSelectedDifficulty,
	fieldConfigMap,
	difficultyConfigMap,
	availablePrograms,
	interviewTips,
	history,
	allPrograms,
	statsData,
	averageHistoryScore,
	startInterview,
	createSessionMutation,
}: SetupPhaseProps) {
	return (
		<>
			<DashboardHeader icon={RobotIcon} title={t`AI Interview Simulation`} />

			<div className="mx-auto max-w-4xl space-y-6">
				{/* Hero Section */}
				<motion.div
					className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 p-6 text-white md:p-8"
					initial={false}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5 }}
				>
					<div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />
					<div className="relative flex flex-col items-start gap-4 md:flex-row md:items-center">
						<div className="flex size-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
							<RobotIcon className="size-8" weight="fill" />
						</div>
						<div>
							<h1 className="mb-2 font-bold text-2xl md:text-3xl">
								<Trans>AI Interview Simulation</Trans>
							</h1>
							<p className="text-white/90">
								<Trans>
									Practice with an intelligent virtual recruiter. Receive immediate feedback on each response and
									improve your interview skills.
								</Trans>
							</p>
						</div>
					</div>
				</motion.div>

				{/* Statistics Cards */}
				{(statsData?.totalSessions ?? 0) > 0 && (
					<motion.div
						className="grid gap-4 md:grid-cols-3"
						initial={false}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5, delay: 0.1 }}
					>
						<Card className="border-violet-200 bg-gradient-to-br from-violet-50 to-purple-50 dark:border-violet-800 dark:from-violet-950/50 dark:to-purple-950/50">
							<CardContent className="flex items-center gap-4 p-4">
								<div className="flex size-12 items-center justify-center rounded-xl bg-violet-100 dark:bg-violet-900/50">
									<TrophyIcon className="size-6 text-violet-600" weight="fill" />
								</div>
								<div>
									<p className="font-bold text-2xl text-violet-700 dark:text-violet-400">{averageHistoryScore}%</p>
									<p className="text-muted-foreground text-sm">
										<Trans>Average score</Trans>
									</p>
								</div>
							</CardContent>
						</Card>

						<Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 dark:border-blue-800 dark:from-blue-950/50 dark:to-indigo-950/50">
							<CardContent className="flex items-center gap-4 p-4">
								<div className="flex size-12 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/50">
									<ChatCircleDotsIcon className="size-6 text-blue-600" weight="fill" />
								</div>
								<div>
									<p className="font-bold text-2xl text-blue-700 dark:text-blue-400">{statsData?.totalSessions ?? 0}</p>
									<p className="text-muted-foreground text-sm">
										<Trans>Interviews completed</Trans>
									</p>
								</div>
							</CardContent>
						</Card>

						<Card className="border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 dark:border-green-800 dark:from-green-950/50 dark:to-emerald-950/50">
							<CardContent className="flex items-center gap-4 p-4">
								<div className="flex size-12 items-center justify-center rounded-xl bg-green-100 dark:bg-green-900/50">
									<CheckCircleIcon className="size-6 text-green-600" weight="fill" />
								</div>
								<div>
									<p className="font-bold text-2xl text-green-700 dark:text-green-400">
										{statsData?.passedSessions ?? 0}
									</p>
									<p className="text-muted-foreground text-sm">
										<Trans>Passed (+70%)</Trans>
									</p>
								</div>
							</CardContent>
						</Card>
					</motion.div>
				)}

				{/* Configuration Card */}
				<motion.div initial={false} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
					<Card className="border-2">
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<GearIcon className="size-5 text-primary" weight="fill" />
								<Trans>Interview Configuration</Trans>
							</CardTitle>
							<CardDescription>
								<Trans>Choose your field, program, and difficulty level</Trans>
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-6">
							{/* Field Selection */}
							<div className="space-y-3">
								<Label className="flex items-center gap-2 font-semibold">
									<TargetIcon className="size-4" />
									<Trans>Professional field</Trans>
								</Label>
								<div className="grid gap-3 md:grid-cols-3">
									{(Object.keys(fieldConfigMap) as Field[]).map((field) => {
										const config = fieldConfigMap[field];
										const IconComponent = config.icon;
										return (
											<motion.button
												key={field}
												type="button"
												onClick={() => setSelectedField(field)}
												className={cn(
													"group relative flex flex-col items-center gap-3 rounded-xl border-2 p-4 transition-all hover:shadow-md",
													selectedField === field ? "border-primary ring-2 ring-primary/20" : "hover:border-primary/50",
												)}
												whileHover={{ scale: 1.02 }}
												whileTap={{ scale: 0.98 }}
											>
												<div
													className={cn(
														"flex size-12 items-center justify-center rounded-xl transition-transform group-hover:scale-110",
														config.bgColor,
													)}
												>
													<IconComponent className={cn("size-6", config.color)} weight="duotone" />
												</div>
												<span className="font-medium text-sm">{config.label}</span>
												{selectedField === field && (
													<motion.div
														className="absolute -top-1 -right-1 flex size-6 items-center justify-center rounded-full bg-primary text-white"
														initial={{ scale: 0 }}
														animate={{ scale: 1 }}
													>
														<CheckCircleIcon className="size-4" weight="fill" />
													</motion.div>
												)}
											</motion.button>
										);
									})}
								</div>
							</div>

							{/* Program Selection */}
							<div className="space-y-3">
								<Label className="flex items-center gap-2 font-semibold">
									<BrainIcon className="size-4" />
									<Trans>Program / Specialty</Trans>
								</Label>
								<Select value={selectedProgram} onValueChange={setSelectedProgram}>
									<SelectTrigger className="h-12">
										<SelectValue placeholder={t`Select a program`} />
									</SelectTrigger>
									<SelectContent>
										{availablePrograms.map((program) => (
											<SelectItem key={program.id} value={program.id} className="py-3">
												{program.name}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>

							{/* Difficulty Selection */}
							<div className="space-y-3">
								<Label className="flex items-center gap-2 font-semibold">
									<SparkleIcon className="size-4" />
									<Trans>Difficulty level</Trans>
								</Label>
								<div className="grid gap-3 md:grid-cols-3">
									{(Object.keys(difficultyConfigMap) as Difficulty[]).map((difficulty) => {
										const config = difficultyConfigMap[difficulty];
										return (
											<motion.button
												key={difficulty}
												type="button"
												onClick={() => setSelectedDifficulty(difficulty)}
												className={cn(
													"flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all hover:shadow-md",
													selectedDifficulty === difficulty
														? "border-primary ring-2 ring-primary/20"
														: "hover:border-primary/50",
												)}
												whileHover={{ scale: 1.02 }}
												whileTap={{ scale: 0.98 }}
											>
												<span className={cn("font-semibold", config.color)}>{config.label}</span>
												<span className="text-muted-foreground text-xs">{config.questionsCount} questions</span>
											</motion.button>
										);
									})}
								</div>
							</div>
						</CardContent>
						<CardFooter className="flex flex-col gap-3 border-t bg-muted/30 pt-6 sm:flex-row sm:justify-between">
							<Link to="/dashboard/interview" className="w-full sm:w-auto">
								<Button variant="outline" size="lg" className="w-full">
									<ArrowLeftIcon className="mr-2 size-4" />
									<Trans>Back</Trans>
								</Button>
							</Link>
							<Button
								onClick={startInterview}
								size="lg"
								className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 sm:w-auto"
								disabled={createSessionMutation.isPending || !selectedProgram}
							>
								{createSessionMutation.isPending ? (
									<SpinnerIcon className="mr-2 size-5 animate-spin" />
								) : (
									<PlayIcon className="mr-2 size-5" weight="fill" />
								)}
								<Trans>Start Interview</Trans>
							</Button>
						</CardFooter>
					</Card>
				</motion.div>

				{/* Tips Card */}
				{interviewTips && interviewTips.length > 0 && (
					<motion.div initial={false} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}>
						<Card className="border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 dark:border-amber-800 dark:from-amber-950/50 dark:to-orange-950/50">
							<CardHeader>
								<CardTitle className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
									<LightbulbIcon className="size-5" weight="fill" />
									<Trans>Tips for success</Trans>
								</CardTitle>
							</CardHeader>
							<CardContent>
								<ul className="grid gap-3 md:grid-cols-2">
									{interviewTips.slice(0, 4).map((tip) => (
										<li key={tip.id} className="flex items-start gap-2 text-amber-800 text-sm dark:text-amber-300">
											<CheckCircleIcon className="mt-0.5 size-4 shrink-0 text-amber-600" weight="fill" />
											<span>
												<strong>{tip.title}:</strong> {tip.content}
											</span>
										</li>
									))}
								</ul>
							</CardContent>
						</Card>
					</motion.div>
				)}

				{/* Recent History */}
				{history.length > 0 && (
					<motion.div initial={false} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }}>
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<ClockIcon className="size-5 text-primary" weight="fill" />
									<Trans>Recent history</Trans>
								</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="space-y-3">
									{history.slice(0, 5).map((entry) => {
										const fieldCfg = fieldConfigMap[entry.field];
										const FieldIcon = fieldCfg.icon;
										const programName =
											allPrograms?.[entry.field]?.find((p) => p.id === entry.program)?.name || entry.program;
										return (
											<div key={entry.id} className="flex items-center justify-between rounded-lg border p-3">
												<div className="flex items-center gap-3">
													<div className={cn("flex size-10 items-center justify-center rounded-lg", fieldCfg.bgColor)}>
														<FieldIcon className={cn("size-5", fieldCfg.color)} weight="duotone" />
													</div>
													<div>
														<p className="font-medium text-sm">{programName}</p>
														<p className="text-muted-foreground text-xs">
															{difficultyConfigMap[entry.difficulty].label} -{" "}
															{entry.completedAt.toLocaleDateString("fr-FR")}
														</p>
													</div>
												</div>
												<Badge
													variant={entry.overallScore >= 70 ? "default" : "secondary"}
													className={cn(
														entry.overallScore >= 80
															? "bg-green-500"
															: entry.overallScore >= 70
																? "bg-blue-500"
																: entry.overallScore >= 50
																	? "bg-yellow-500"
																	: "bg-red-500",
													)}
												>
													{entry.overallScore}%
												</Badge>
											</div>
										);
									})}
								</div>
							</CardContent>
						</Card>
					</motion.div>
				)}
			</div>
		</>
	);
}

// ========================================
// INTERVIEW PHASE
// ========================================

type InterviewPhaseProps = {
	session: InterviewSession;
	currentProgramName: string;
	fieldConfigMap: Record<Field, FieldConfig>;
	difficultyConfigMap: Record<Difficulty, DifficultyConfig>;
	progressPercent: number;
	showTip: boolean;
	currentTip: InterviewTip | null;
	isTyping: boolean;
	userInput: string;
	setUserInput: (v: string) => void;
	submitResponse: () => void;
	handleKeyPress: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
	resetToSetup: () => void;
	scrollRef: RefObject<HTMLDivElement | null>;
	inputRef: RefObject<HTMLTextAreaElement | null>;
};

export function InterviewPhase({
	session,
	currentProgramName,
	fieldConfigMap,
	difficultyConfigMap,
	progressPercent,
	showTip,
	currentTip,
	isTyping,
	userInput,
	setUserInput,
	submitResponse,
	handleKeyPress,
	resetToSetup,
	scrollRef,
	inputRef,
}: InterviewPhaseProps) {
	const fieldCfg = fieldConfigMap[session.field];
	const FieldIcon = fieldCfg.icon;

	return (
		<>
			<DashboardHeader icon={RobotIcon} title={t`Interview in progress`} />

			<div className="mx-auto flex max-w-4xl flex-col gap-4">
				{/* Progress Bar */}
				<motion.div className="space-y-2" initial={false} animate={{ opacity: 1, y: 0 }}>
					<div className="flex items-center justify-between text-sm">
						<div className="flex items-center gap-2">
							<div className={cn("flex size-8 items-center justify-center rounded-lg", fieldCfg.bgColor)}>
								<FieldIcon className={cn("size-4", fieldCfg.color)} weight="duotone" />
							</div>
							<span className="font-medium">{currentProgramName}</span>
							<Badge variant="outline" className={difficultyConfigMap[session.difficulty].color}>
								{difficultyConfigMap[session.difficulty].label}
							</Badge>
						</div>
						<span className="text-muted-foreground">
							Question {session.currentQuestionIndex + 1} / {session.totalQuestions}
						</span>
					</div>
					<Progress value={progressPercent} className="h-2" />
				</motion.div>

				{/* Chat Area */}
				<Card className="flex h-[calc(100vh-16rem)] flex-col overflow-hidden border-2 md:h-[calc(100vh-14rem)]">
					{/* Tip Overlay */}
					<AnimatePresence>
						{showTip && currentTip && (
							<motion.div
								className="absolute inset-0 z-10 flex items-center justify-center bg-background/80 backdrop-blur-sm"
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								exit={{ opacity: 0 }}
							>
								<motion.div
									className="mx-4 max-w-md rounded-2xl border-2 border-amber-300 bg-gradient-to-br from-amber-50 to-orange-50 p-6 shadow-xl dark:border-amber-700 dark:from-amber-950/80 dark:to-orange-950/80"
									initial={{ scale: 0.8, opacity: 0 }}
									animate={{ scale: 1, opacity: 1 }}
									exit={{ scale: 0.8, opacity: 0 }}
								>
									<div className="flex items-center gap-3">
										<div className="flex size-12 items-center justify-center rounded-xl bg-amber-200 dark:bg-amber-800">
											<LightbulbIcon className="size-6 text-amber-600 dark:text-amber-400" weight="fill" />
										</div>
										<div>
											<h4 className="font-semibold text-amber-800 dark:text-amber-200">{currentTip.title}</h4>
											<p className="text-amber-700 text-sm dark:text-amber-300">{currentTip.content}</p>
										</div>
									</div>
								</motion.div>
							</motion.div>
						)}
					</AnimatePresence>

					{/* Messages */}
					<ScrollArea className="flex-1" ref={scrollRef}>
						<div className="space-y-4 p-4">
							{session.messages.map((message, index) => (
								<motion.div
									key={message.id}
									className={cn("flex gap-3", message.role === "user" ? "flex-row-reverse" : "flex-row")}
									initial={false}
									animate={{ opacity: 1, y: 0 }}
									transition={{ delay: index * 0.1 }}
								>
									{/* Avatar */}
									<div
										className={cn(
											"flex size-10 shrink-0 items-center justify-center rounded-full shadow-sm",
											message.role === "user"
												? "bg-gradient-to-br from-indigo-500 to-purple-600 text-white"
												: "bg-gradient-to-br from-violet-500 to-purple-600 text-white",
										)}
									>
										{message.role === "user" ? (
											<UserIcon className="size-5" weight="bold" />
										) : (
											<RobotIcon className="size-5" weight="bold" />
										)}
									</div>

									{/* Message Content */}
									<div className="max-w-[80%] space-y-2">
										<div
											className={cn(
												"rounded-2xl px-4 py-3 shadow-sm",
												message.role === "user"
													? "bg-gradient-to-br from-indigo-500 to-purple-600 text-white"
													: "border bg-white dark:bg-muted",
											)}
										>
											<p className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</p>
											<p
												className={cn(
													"mt-2 text-[10px]",
													message.role === "user" ? "text-white/60" : "text-muted-foreground",
												)}
											>
												{message.timestamp.toLocaleTimeString("fr-FR", {
													hour: "2-digit",
													minute: "2-digit",
												})}
											</p>
										</div>

										{/* Feedback (for user messages) */}
										{message.feedback && (
											<motion.div
												className="space-y-2 rounded-xl border bg-muted/30 p-3"
												initial={false}
												animate={{ opacity: 1, height: "auto" }}
											>
												<div className="flex items-center justify-between">
													<span className="font-medium text-sm">
														<Trans>Evaluation</Trans>
													</span>
													<Badge
														className={cn(
															message.feedback.score >= 80
																? "bg-green-500"
																: message.feedback.score >= 60
																	? "bg-blue-500"
																	: message.feedback.score >= 40
																		? "bg-yellow-500"
																		: "bg-red-500",
														)}
													>
														{message.feedback.score}%
													</Badge>
												</div>

												{message.feedback.strengths.length > 0 && (
													<div>
														<p className="mb-1 font-medium text-green-600 text-xs">
															<Trans>Strengths</Trans>:
														</p>
														<ul className="list-inside list-disc text-xs">
															{message.feedback.strengths.map((s, i) => (
																<li key={i}>{s}</li>
															))}
														</ul>
													</div>
												)}

												{message.feedback.improvements.length > 0 && (
													<div>
														<p className="mb-1 font-medium text-orange-600 text-xs">
															<Trans>To improve</Trans>:
														</p>
														<ul className="list-inside list-disc text-xs">
															{message.feedback.improvements.map((s, i) => (
																<li key={i}>{s}</li>
															))}
														</ul>
													</div>
												)}

												{message.feedback.tip && (
													<div className="mt-2 rounded-lg bg-amber-50 p-2 dark:bg-amber-900/30">
														<p className="flex items-start gap-1 text-amber-700 text-xs dark:text-amber-300">
															<LightbulbIcon className="mt-0.5 size-3 shrink-0" weight="fill" />
															{message.feedback.tip}
														</p>
													</div>
												)}
											</motion.div>
										)}
									</div>
								</motion.div>
							))}

							{/* Typing indicator */}
							{isTyping && (
								<motion.div className="flex items-center gap-3" initial={false} animate={{ opacity: 1 }}>
									<div className="flex size-10 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-sm">
										<RobotIcon className="size-5" weight="bold" />
									</div>
									<div className="flex items-center gap-2 rounded-2xl border bg-white px-4 py-3 shadow-sm dark:bg-muted">
										<SpinnerIcon className="size-4 animate-spin text-primary" />
										<span className="text-muted-foreground text-sm">
											<Trans>The recruiter is thinking...</Trans>
										</span>
									</div>
								</motion.div>
							)}
						</div>
					</ScrollArea>

					{/* Input Area */}
					<div className="border-t bg-muted/30 p-4">
						<div className="flex gap-3">
							<Textarea
								ref={inputRef}
								placeholder={t`Write your answer...`}
								value={userInput}
								onChange={(e) => setUserInput(e.target.value)}
								onKeyDown={handleKeyPress}
								disabled={isTyping}
								className="min-h-[60px] resize-none border-2 bg-white focus-visible:border-primary dark:bg-background"
								rows={2}
							/>
							<div className="flex flex-col gap-2">
								<Button
									onClick={submitResponse}
									disabled={!userInput.trim() || isTyping}
									className="h-full bg-gradient-to-br from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700"
								>
									<PaperPlaneIcon className="size-5" weight="fill" />
								</Button>
							</div>
						</div>
						<div className="mt-2 flex items-center justify-between">
							<p className="text-muted-foreground text-xs">
								<Trans>Press Enter to send</Trans>
							</p>
							<Button
								variant="ghost"
								size="sm"
								onClick={resetToSetup}
								className="text-destructive hover:text-destructive"
							>
								<XCircleIcon className="mr-1 size-4" />
								<Trans>Quit</Trans>
							</Button>
						</div>
					</div>
				</Card>
			</div>
		</>
	);
}

// ========================================
// COMPLETED PHASE
// ========================================

type CompletedPhaseProps = {
	session: InterviewSession;
	currentProgramName: string;
	fieldConfigMap: Record<Field, FieldConfig>;
	difficultyConfigMap: Record<Difficulty, DifficultyConfig>;
	resetToSetup: () => void;
};

export function CompletedPhase({
	session,
	currentProgramName,
	fieldConfigMap,
	difficultyConfigMap,
	resetToSetup,
}: CompletedPhaseProps) {
	const fieldCfg = fieldConfigMap[session.field];
	const FieldIcon = fieldCfg.icon;
	const score = session.overallScore || 0;

	const scoreGradient =
		score >= 80
			? "from-green-500 to-emerald-500"
			: score >= 60
				? "from-blue-500 to-indigo-500"
				: score >= 40
					? "from-yellow-500 to-amber-500"
					: "from-red-500 to-orange-500";

	const readinessLabel =
		score >= 80
			? t`Ready for the interview`
			: score >= 60
				? t`Almost ready`
				: score >= 40
					? t`Needs practice`
					: t`Keep practicing`;

	return (
		<>
			<DashboardHeader icon={TrophyIcon} title={t`Interview Completed`} />

			<div className="mx-auto max-w-4xl space-y-6">
				{/* Score Hero */}
				<motion.div
					className={cn("relative overflow-hidden rounded-2xl bg-gradient-to-br p-6 text-white md:p-8", scoreGradient)}
					initial={false}
					animate={{ opacity: 1, scale: 1 }}
					transition={{ duration: 0.5 }}
				>
					<div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />
					<div className="relative text-center">
						<motion.div
							className="mx-auto mb-4 flex size-24 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm"
							initial={{ scale: 0 }}
							animate={{ scale: 1 }}
							transition={{ delay: 0.2, type: "spring" }}
						>
							<span className="font-bold text-4xl">{score}%</span>
						</motion.div>
						<h2 className="mb-2 font-bold text-2xl">
							<Trans>Interview Completed!</Trans>
						</h2>
						<p className="mb-4 text-white/90">
							<Trans>Here is your performance analysis</Trans>
						</p>
						<Badge className="bg-white/20 px-4 py-2 font-semibold text-white">{readinessLabel}</Badge>
					</div>
				</motion.div>

				{/* Session Details */}
				<motion.div initial={false} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<TargetIcon className="size-5 text-primary" weight="fill" />
								<Trans>Session details</Trans>
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="flex items-center gap-4">
								<div className={cn("flex size-12 items-center justify-center rounded-xl", fieldCfg.bgColor)}>
									<FieldIcon className={cn("size-6", fieldCfg.color)} weight="duotone" />
								</div>
								<div>
									<p className="font-semibold">{currentProgramName}</p>
									<p className="text-muted-foreground text-sm">
										{fieldCfg.label} - {difficultyConfigMap[session.difficulty].label}
									</p>
								</div>
							</div>

							<div className="grid gap-4 md:grid-cols-3">
								<div className="rounded-lg border p-4 text-center">
									<p className="mb-1 font-bold text-2xl text-primary">{session.totalQuestions}</p>
									<p className="text-muted-foreground text-sm">
										<Trans>Questions asked</Trans>
									</p>
								</div>
								<div className="rounded-lg border p-4 text-center">
									<p className="mb-1 font-bold text-2xl text-primary">
										{session.completedAt
											? Math.round((session.completedAt.getTime() - session.startedAt.getTime()) / 60000)
											: 0}{" "}
										min
									</p>
									<p className="text-muted-foreground text-sm">
										<Trans>Total duration</Trans>
									</p>
								</div>
								<div className="rounded-lg border p-4 text-center">
									<p className="mb-1 font-bold text-2xl text-primary">{session.scores.filter((s) => s >= 70).length}</p>
									<p className="text-muted-foreground text-sm">
										<Trans>Good answers</Trans>
									</p>
								</div>
							</div>

							{/* Score breakdown */}
							<div className="space-y-3">
								<h4 className="font-semibold">
									<Trans>Scores by question</Trans>
								</h4>
								<div className="space-y-2">
									{session.scores.map((questionScore, index) => (
										<div key={index} className="flex items-center gap-3">
											<span className="w-24 text-muted-foreground text-sm">Question {index + 1}</span>
											<div className="flex-1">
												<Progress
													value={questionScore}
													className={cn(
														"h-2",
														questionScore >= 70
															? "[&>[data-slot=progress-indicator]]:bg-green-500"
															: questionScore >= 50
																? "[&>[data-slot=progress-indicator]]:bg-yellow-500"
																: "[&>[data-slot=progress-indicator]]:bg-red-500",
													)}
												/>
											</div>
											<Badge
												variant="outline"
												className={cn(
													"w-14 justify-center",
													questionScore >= 70
														? "text-green-600"
														: questionScore >= 50
															? "text-yellow-600"
															: "text-red-600",
												)}
											>
												{questionScore}%
											</Badge>
										</div>
									))}
								</div>
							</div>
						</CardContent>
					</Card>
				</motion.div>

				{/* Recommendations */}
				<motion.div initial={false} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
					<Card className="border-indigo-200 bg-gradient-to-br from-indigo-50 to-purple-50 dark:border-indigo-800 dark:from-indigo-950/50 dark:to-purple-950/50">
						<CardHeader>
							<CardTitle className="flex items-center gap-2 text-indigo-700 dark:text-indigo-400">
								<StarIcon className="size-5" weight="fill" />
								<Trans>Recommendations</Trans>
							</CardTitle>
						</CardHeader>
						<CardContent>
							<ul className="space-y-3">
								{score < 70 && (
									<li className="flex items-start gap-3 rounded-lg bg-white/50 p-3 text-indigo-700 dark:text-indigo-300">
										<span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-indigo-200 font-semibold text-indigo-700 text-xs dark:bg-indigo-800">
											1
										</span>
										<span>
											<Trans>Prepare concrete examples from your internship experiences</Trans>
										</span>
									</li>
								)}
								<li className="flex items-start gap-3 rounded-lg bg-white/50 p-3 text-indigo-700 dark:text-indigo-300">
									<span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-indigo-200 font-semibold text-indigo-700 text-xs dark:bg-indigo-800">
										{score < 70 ? "2" : "1"}
									</span>
									<span>
										<Trans>Use the STAR method to structure your answers</Trans>
									</span>
								</li>
								<li className="flex items-start gap-3 rounded-lg bg-white/50 p-3 text-indigo-700 dark:text-indigo-300">
									<span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-indigo-200 font-semibold text-indigo-700 text-xs dark:bg-indigo-800">
										{score < 70 ? "3" : "2"}
									</span>
									<span>
										<Trans>Practice regularly to improve your speaking confidence</Trans>
									</span>
								</li>
								{score >= 80 && (
									<li className="flex items-start gap-3 rounded-lg bg-white/50 p-3 text-indigo-700 dark:text-indigo-300">
										<span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-indigo-200 font-semibold text-indigo-700 text-xs dark:bg-indigo-800">
											3
										</span>
										<span>
											<Trans>Excellent work! Try the advanced level to challenge yourself</Trans>
										</span>
									</li>
								)}
							</ul>
						</CardContent>
					</Card>
				</motion.div>

				{/* Actions */}
				<motion.div
					className="flex flex-col justify-center gap-3 sm:flex-row sm:gap-4"
					initial={false}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.5 }}
				>
					<Button variant="outline" size="lg" onClick={resetToSetup} className="w-full sm:w-auto">
						<SparkleIcon className="mr-2 size-4" weight="fill" />
						<Trans>New Session</Trans>
					</Button>
					<Link to="/dashboard/interview" className="w-full sm:w-auto">
						<Button
							size="lg"
							className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700"
						>
							<ArrowRightIcon className="mr-2 size-4" />
							<Trans>Back to Dashboard</Trans>
						</Button>
					</Link>
				</motion.div>
			</div>
		</>
	);
}

// ========================================
// FALLBACK LOADING SPINNER
// ========================================

export function FallbackSpinner() {
	return (
		<div className="flex min-h-[60vh] items-center justify-center">
			<SpinnerIcon className="size-8 animate-spin text-primary" />
		</div>
	);
}
