import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import {
	ArrowLeftIcon,
	ArrowRightIcon,
	BookmarkSimpleIcon,
	BuildingsIcon,
	CaretRightIcon,
	CheckCircleIcon,
	ClipboardTextIcon,
	ClockIcon,
	CopyIcon,
	FloppyDiskIcon,
	LightbulbIcon,
	ListBulletsIcon,
	MagnifyingGlassIcon,
	MicrophoneIcon,
	PauseIcon,
	PencilSimpleIcon,
	PlayIcon,
	PlusIcon,
	SparkleIcon,
	StopIcon,
	TargetIcon,
	TrashIcon,
} from "@phosphor-icons/react";
import { AnimatePresence, motion } from "motion/react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/utils/style";

import {
	contextConfig,
	deliveryTips,
	examplePitches,
	industryTemplates,
	pitchLengthConfig,
	pitchSteps,
} from "./elevator-pitch-config";
import type { ContextType, Industry, PitchLength, SavedPitch } from "./elevator-pitch-types";

// --- Hero Section ---

export function HeroSection() {
	return (
		<motion.div
			className="relative mb-8 overflow-hidden rounded-3xl border border-primary/20 p-8 md:p-12"
			style={{
				background:
					"linear-gradient(135deg, oklch(0.7 0.18 200 / 0.15) 0%, oklch(0.6 0.2 280 / 0.1) 50%, oklch(0.65 0.15 320 / 0.08) 100%)",
			}}
			initial={false}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.6, ease: "easeOut" }}
		>
			{/* Animated background elements */}
			<div className="pointer-events-none absolute inset-0 overflow-hidden">
				<motion.div
					className="absolute -top-32 -right-32 size-96 rounded-full bg-gradient-to-br from-blue-500/20 to-cyan-500/10 blur-3xl"
					animate={{
						scale: [1, 1.2, 1],
						rotate: [0, 10, 0],
						opacity: [0.5, 0.3, 0.5],
					}}
					transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
				/>
				<motion.div
					className="absolute -bottom-32 -left-32 size-96 rounded-full bg-gradient-to-tr from-purple-500/15 to-pink-500/10 blur-3xl"
					animate={{
						scale: [1.2, 1, 1.2],
						rotate: [0, -10, 0],
						opacity: [0.3, 0.5, 0.3],
					}}
					transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
				/>
			</div>

			<div className="relative z-10">
				<motion.div
					className="mb-3 flex items-center gap-2"
					initial={false}
					animate={{ opacity: 1, x: 0 }}
					transition={{ delay: 0.2 }}
				>
					<SparkleIcon className="size-5 text-primary" weight="fill" />
					<span className="font-semibold text-primary text-sm uppercase tracking-wider">
						<Trans>Perfect Presentation</Trans>
					</span>
				</motion.div>

				<motion.h2
					className="mb-4 bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text font-bold text-3xl text-transparent tracking-tight md:text-4xl lg:text-5xl"
					initial={false}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.3 }}
				>
					<Trans>Elevator Pitch Generator</Trans>
				</motion.h2>

				<motion.p
					className="mb-8 max-w-2xl text-lg text-muted-foreground"
					initial={false}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.4 }}
				>
					<Trans>
						Create a compelling pitch in a few steps. Choose your duration, adapt to the context, and practice until
						perfection.
					</Trans>
				</motion.p>

				{/* Quick Stats */}
				<motion.div
					className="flex flex-wrap items-center gap-6"
					initial={false}
					animate={{ opacity: 1 }}
					transition={{ delay: 0.5 }}
				>
					<div className="flex items-center gap-2">
						<div className="flex size-10 items-center justify-center rounded-full bg-primary/10">
							<ClockIcon className="size-5 text-primary" weight="duotone" />
						</div>
						<div>
							<p className="font-bold text-xl">3</p>
							<p className="text-muted-foreground text-sm">
								<Trans>Durations</Trans>
							</p>
						</div>
					</div>
					<div className="flex items-center gap-2">
						<div className="flex size-10 items-center justify-center rounded-full bg-purple-500/10">
							<BuildingsIcon className="size-5 text-purple-500" weight="duotone" />
						</div>
						<div>
							<p className="font-bold text-xl">7</p>
							<p className="text-muted-foreground text-sm">
								<Trans>Industries</Trans>
							</p>
						</div>
					</div>
					<div className="flex items-center gap-2">
						<div className="flex size-10 items-center justify-center rounded-full bg-green-500/10">
							<TargetIcon className="size-5 text-green-500" weight="duotone" />
						</div>
						<div>
							<p className="font-bold text-xl">5</p>
							<p className="text-muted-foreground text-sm">
								<Trans>Steps</Trans>
							</p>
						</div>
					</div>
				</motion.div>
			</div>
		</motion.div>
	);
}

// --- Builder Tab ---

interface BuilderTabProps {
	currentStep: number;
	setCurrentStep: (step: number) => void;
	stepContents: Record<string, string>;
	selectedLength: PitchLength;
	setSelectedLength: (length: PitchLength) => void;
	selectedContext: ContextType;
	setSelectedContext: (context: ContextType) => void;
	selectedIndustry: Industry;
	setSelectedIndustry: (industry: Industry) => void;
	generatedPitch: string;
	wordCount: number;
	estimatedSeconds: number;
	targetWords: number;
	targetSeconds: number;
	progressPercent: number;
	isOverLimit: boolean;
	isUnderLimit: boolean;
	pitchName: string;
	setPitchName: (name: string) => void;
	editingPitch: SavedPitch | null;
	onStepChange: (stepId: string, content: string) => void;
	onNextStep: () => void;
	onPrevStep: () => void;
	onApplyTemplate: () => void;
	onCopyPitch: () => void;
	onSavePitch: () => void;
}

export function BuilderTab({
	currentStep,
	setCurrentStep,
	stepContents,
	selectedLength,
	setSelectedLength,
	selectedContext,
	setSelectedContext,
	selectedIndustry,
	setSelectedIndustry,
	generatedPitch,
	wordCount,
	estimatedSeconds,
	targetWords,
	targetSeconds,
	progressPercent,
	isOverLimit,
	isUnderLimit,
	pitchName,
	setPitchName,
	editingPitch,
	onStepChange,
	onNextStep,
	onPrevStep,
	onApplyTemplate,
	onCopyPitch,
	onSavePitch,
}: BuilderTabProps) {
	return (
		<div className="grid gap-8 lg:grid-cols-3">
			{/* Left Column - Configuration */}
			<div className="space-y-6">
				{/* Pitch Length Selection */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2 text-lg">
							<ClockIcon className="size-5 text-primary" weight="duotone" />
							<Trans>Pitch Duration</Trans>
						</CardTitle>
						<CardDescription>
							<Trans>Choose the length adapted to your context</Trans>
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-3">
						{(Object.entries(pitchLengthConfig) as [PitchLength, (typeof pitchLengthConfig)[PitchLength]][]).map(
							([key, config]) => (
								<motion.div key={key} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
									<div
										className={cn(
											"flex cursor-pointer items-center justify-between rounded-lg border p-4 transition-all",
											selectedLength === key ? "border-primary bg-primary/10" : "border-muted hover:border-primary/30",
										)}
										onClick={() => setSelectedLength(key)}
									>
										<div className="flex items-center gap-3">
											<div
												className={cn(
													"flex size-10 items-center justify-center rounded-full",
													selectedLength === key ? "bg-primary/20" : "bg-muted",
												)}
											>
												<span className="font-semibold text-sm">{config.seconds}s</span>
											</div>
											<div>
												<p className="font-medium">{config.label}</p>
												<p className="text-muted-foreground text-xs">{config.description}</p>
											</div>
										</div>
										<Badge variant="outline">~{config.words} words</Badge>
									</div>
								</motion.div>
							),
						)}
					</CardContent>
				</Card>

				{/* Context Selection */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2 text-lg">
							<TargetIcon className="size-5 text-primary" weight="duotone" />
							<Trans>Context</Trans>
						</CardTitle>
						<CardDescription>
							<Trans>Adapt the tone to the situation</Trans>
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-2">
						{(Object.entries(contextConfig) as [ContextType, (typeof contextConfig)[ContextType]][]).map(
							([key, config]) => {
								const ContextIcon = config.icon;
								return (
									<div
										key={key}
										className={cn(
											"flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-all",
											selectedContext === key ? "border-primary bg-primary/10" : "border-muted hover:border-primary/30",
										)}
										onClick={() => setSelectedContext(key)}
									>
										<div className={cn("flex size-8 items-center justify-center rounded-lg", config.color)}>
											<ContextIcon className="size-4" weight="duotone" />
										</div>
										<div>
											<p className="font-medium text-sm">{config.label}</p>
											<p className="text-muted-foreground text-xs">{config.description}</p>
										</div>
										{selectedContext === key && (
											<CheckCircleIcon className="ml-auto size-4 text-primary" weight="fill" />
										)}
									</div>
								);
							},
						)}
					</CardContent>
				</Card>

				{/* Industry Selection */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2 text-lg">
							<BuildingsIcon className="size-5 text-primary" weight="duotone" />
							<Trans>Sector</Trans>
						</CardTitle>
					</CardHeader>
					<CardContent>
						<Select value={selectedIndustry} onValueChange={(v) => setSelectedIndustry(v as Industry)}>
							<SelectTrigger>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{industryTemplates.map((template) => {
									const IndustryIcon = template.icon;
									return (
										<SelectItem key={template.industry} value={template.industry}>
											<div className="flex items-center gap-2">
												<IndustryIcon className="size-4" />
												<span>{template.label}</span>
											</div>
										</SelectItem>
									);
								})}
							</SelectContent>
						</Select>
						<Button variant="outline" size="sm" className="mt-3 w-full gap-2" onClick={onApplyTemplate}>
							<SparkleIcon className="size-4" />
							<Trans>Apply a template</Trans>
						</Button>
					</CardContent>
				</Card>
			</div>

			{/* Middle Column - Step Builder */}
			<div className="space-y-6">
				<Card className="border-2 border-primary/20">
					<CardHeader>
						<CardTitle className="flex items-center justify-between">
							<span className="flex items-center gap-2">
								<ListBulletsIcon className="size-5 text-primary" weight="duotone" />
								<Trans>Step-by-Step Construction</Trans>
							</span>
							<Badge variant="outline">
								{currentStep + 1} / {pitchSteps.length}
							</Badge>
						</CardTitle>
						<Progress value={((currentStep + 1) / pitchSteps.length) * 100} className="h-2" />
					</CardHeader>
					<CardContent className="space-y-6">
						<AnimatePresence mode="wait">
							<motion.div
								key={currentStep}
								initial={{ opacity: 0, x: 20 }}
								animate={{ opacity: 1, x: 0 }}
								exit={{ opacity: 0, x: -20 }}
								transition={{ duration: 0.2 }}
							>
								{pitchSteps.map((step, index) => {
									if (index !== currentStep) return null;
									const StepIcon = step.icon;
									return (
										<div key={step.id} className="space-y-4">
											<div className="flex items-center gap-3">
												<div className="flex size-12 items-center justify-center rounded-xl bg-primary/10">
													<StepIcon className="size-6 text-primary" weight="duotone" />
												</div>
												<div>
													<h3 className="font-semibold text-lg">{step.title}</h3>
													<p className="text-muted-foreground text-sm">{step.description}</p>
												</div>
											</div>

											<Textarea
												placeholder={step.placeholder}
												className="min-h-32 resize-none"
												value={stepContents[step.id] || ""}
												onChange={(e) => onStepChange(step.id, e.target.value)}
											/>

											<div className="rounded-lg border bg-amber-50/50 p-3 dark:bg-amber-950/20">
												<div className="flex items-start gap-2">
													<LightbulbIcon
														className="mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-400"
														weight="fill"
													/>
													<p className="text-amber-700 text-sm dark:text-amber-400">{step.tip}</p>
												</div>
											</div>
										</div>
									);
								})}
							</motion.div>
						</AnimatePresence>

						{/* Navigation Buttons */}
						<div className="flex items-center justify-between pt-4">
							<Button variant="outline" onClick={onPrevStep} disabled={currentStep === 0} className="gap-2">
								<ArrowLeftIcon className="size-4" />
								<Trans>Previous</Trans>
							</Button>
							<Button onClick={onNextStep} disabled={currentStep === pitchSteps.length - 1} className="gap-2">
								<Trans>Next</Trans>
								<ArrowRightIcon className="size-4" />
							</Button>
						</div>

						{/* Step Indicators */}
						<div className="flex justify-center gap-2">
							{pitchSteps.map((step, index) => (
								<button
									type="button"
									key={step.id}
									className={cn(
										"size-3 rounded-full transition-all",
										index === currentStep
											? "scale-125 bg-primary"
											: stepContents[step.id]
												? "bg-green-500"
												: "bg-muted-foreground/30",
									)}
									onClick={() => setCurrentStep(index)}
								/>
							))}
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Right Column - Preview */}
			<div className="space-y-6">
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center justify-between">
							<span className="flex items-center gap-2">
								<MagnifyingGlassIcon className="size-5 text-primary" weight="duotone" />
								<Trans>Preview</Trans>
							</span>
							<div className="flex gap-2">
								<Button variant="ghost" size="sm" onClick={onCopyPitch} className="size-8 p-0">
									<CopyIcon className="size-4" />
								</Button>
							</div>
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						{generatedPitch ? (
							<>
								<div className="rounded-lg border bg-muted/30 p-4">
									<p className="whitespace-pre-wrap leading-relaxed">{generatedPitch}</p>
								</div>

								{/* Stats */}
								<div className="grid grid-cols-2 gap-3">
									<div
										className={cn(
											"rounded-lg border p-3 text-center",
											isOverLimit
												? "border-red-500/50 bg-red-50/50 dark:bg-red-950/20"
												: isUnderLimit
													? "border-amber-500/50 bg-amber-50/50 dark:bg-amber-950/20"
													: "border-green-500/50 bg-green-50/50 dark:bg-green-950/20",
										)}
									>
										<p
											className={cn(
												"font-bold text-2xl",
												isOverLimit
													? "text-red-600 dark:text-red-400"
													: isUnderLimit
														? "text-amber-600 dark:text-amber-400"
														: "text-green-600 dark:text-green-400",
											)}
										>
											{wordCount}
										</p>
										<p className="text-muted-foreground text-xs">
											<Trans>words (target: {targetWords})</Trans>
										</p>
									</div>
									<div className="rounded-lg border bg-card p-3 text-center">
										<p className="font-bold text-2xl text-blue-600 dark:text-blue-400">~{estimatedSeconds}s</p>
										<p className="text-muted-foreground text-xs">
											<Trans>estimated (target: {targetSeconds}s)</Trans>
										</p>
									</div>
								</div>

								{/* Progress Bar */}
								<div className="space-y-2">
									<div className="flex justify-between text-sm">
										<span className="text-muted-foreground">
											<Trans>Progress</Trans>
										</span>
										<span
											className={cn(isOverLimit ? "text-red-600" : isUnderLimit ? "text-amber-600" : "text-green-600")}
										>
											{Math.round(progressPercent)}%
										</span>
									</div>
									<Progress
										value={progressPercent}
										className={cn("h-2", isOverLimit && "[&>div]:bg-red-500", isUnderLimit && "[&>div]:bg-amber-500")}
									/>
								</div>

								{/* Warnings */}
								{isOverLimit && (
									<div className="rounded-lg border border-red-500/30 bg-red-50/50 p-3 dark:bg-red-950/20">
										<p className="flex items-center gap-2 text-red-700 text-sm dark:text-red-400">
											<CaretRightIcon className="size-4" />
											<Trans>Your pitch is too long. Try to shorten it.</Trans>
										</p>
									</div>
								)}
								{isUnderLimit && (
									<div className="rounded-lg border border-amber-500/30 bg-amber-50/50 p-3 dark:bg-amber-950/20">
										<p className="flex items-center gap-2 text-amber-700 text-sm dark:text-amber-400">
											<CaretRightIcon className="size-4" />
											<Trans>Your pitch is a bit short. Add more details.</Trans>
										</p>
									</div>
								)}
							</>
						) : (
							<div className="flex flex-col items-center justify-center py-8 text-center">
								<MicrophoneIcon className="mb-4 size-12 text-muted-foreground/50" weight="duotone" />
								<p className="text-muted-foreground">
									<Trans>Your pitch will appear here</Trans>
								</p>
							</div>
						)}
					</CardContent>
				</Card>

				{/* Save Section */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2 text-lg">
							<FloppyDiskIcon className="size-5 text-primary" weight="duotone" />
							<Trans>Save</Trans>
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-3">
						<div className="space-y-2">
							<Label>
								<Trans>Pitch name</Trans>
							</Label>
							<Input
								placeholder={t`E.g.: Google interview pitch`}
								value={pitchName}
								onChange={(e) => setPitchName(e.target.value)}
							/>
						</div>
						<Button className="w-full gap-2" onClick={onSavePitch} disabled={!generatedPitch.trim()}>
							<FloppyDiskIcon className="size-4" />
							{editingPitch ? <Trans>Update</Trans> : <Trans>Save</Trans>}
						</Button>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}

// --- Templates Tab ---

export function TemplatesTab() {
	return (
		<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
			{industryTemplates.map((template) => {
				const IndustryIcon = template.icon;
				return (
					<motion.div key={template.industry} initial={false} animate={{ opacity: 1, y: 0 }} whileHover={{ y: -5 }}>
						<Card className={cn("overflow-hidden bg-gradient-to-br", template.color)}>
							<CardHeader>
								<CardTitle className="flex items-center gap-3">
									<div className="flex size-10 items-center justify-center rounded-xl bg-background/50">
										<IndustryIcon className="size-5" weight="duotone" />
									</div>
									{template.label}
								</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								{(Object.entries(template.templates) as [PitchLength, string][]).map(([length, content]) => (
									<div key={length} className="space-y-2">
										<div className="flex items-center justify-between">
											<Badge variant="outline">{pitchLengthConfig[length].label}</Badge>
											<Button
												variant="ghost"
												size="sm"
												onClick={() => {
													navigator.clipboard.writeText(content);
													toast.success(t`Template copied`);
												}}
											>
												<CopyIcon className="size-4" />
											</Button>
										</div>
										<p className="line-clamp-3 text-muted-foreground text-sm">{content}</p>
									</div>
								))}
							</CardContent>
						</Card>
					</motion.div>
				);
			})}
		</div>
	);
}

// --- Practice Tab ---

interface PracticeTabProps {
	isRecording: boolean;
	recordingTime: number;
	isPaused: boolean;
	selectedLength: PitchLength;
	generatedPitch: string;
	wordCount: number;
	estimatedSeconds: number;
	formatTime: (seconds: number) => string;
	onStartRecording: () => void;
	onStopRecording: () => void;
	onPauseRecording: () => void;
	onGoToBuilder: () => void;
}

export function PracticeTab({
	isRecording,
	recordingTime,
	isPaused,
	selectedLength,
	generatedPitch,
	wordCount,
	estimatedSeconds,
	formatTime,
	onStartRecording,
	onStopRecording,
	onPauseRecording,
	onGoToBuilder,
}: PracticeTabProps) {
	return (
		<div className="grid gap-8 lg:grid-cols-2">
			{/* Recording Section */}
			<Card className="border-2 border-primary/20">
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<MicrophoneIcon className="size-5 text-primary" weight="duotone" />
						<Trans>Recording Simulator</Trans>
					</CardTitle>
					<CardDescription>
						<Trans>Practice your timing with this stopwatch</Trans>
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-6">
					{/* Timer Display */}
					<div className="flex flex-col items-center justify-center py-8">
						<div
							className={cn(
								"mb-6 flex size-40 items-center justify-center rounded-full border-4 transition-colors",
								isRecording
									? recordingTime > pitchLengthConfig[selectedLength].seconds
										? "border-red-500 bg-red-50 dark:bg-red-950/20"
										: "border-green-500 bg-green-50 dark:bg-green-950/20"
									: "border-muted bg-muted/30",
							)}
						>
							<span
								className={cn(
									"font-bold text-5xl",
									isRecording && recordingTime > pitchLengthConfig[selectedLength].seconds && "text-red-500",
								)}
							>
								{formatTime(recordingTime)}
							</span>
						</div>

						<p className="mb-4 text-muted-foreground">
							<Trans>Target: {formatTime(pitchLengthConfig[selectedLength].seconds)}</Trans>
						</p>

						{/* Progress */}
						<div className="mb-6 w-full max-w-xs">
							<Progress
								value={Math.min((recordingTime / pitchLengthConfig[selectedLength].seconds) * 100, 100)}
								className={cn("h-3", recordingTime > pitchLengthConfig[selectedLength].seconds && "[&>div]:bg-red-500")}
							/>
						</div>

						{/* Controls */}
						<div className="flex gap-3">
							{!isRecording ? (
								<Button size="lg" className="gap-2" onClick={onStartRecording}>
									<PlayIcon className="size-5" weight="fill" />
									<Trans>Start</Trans>
								</Button>
							) : (
								<>
									<Button size="lg" variant="outline" className="gap-2" onClick={onPauseRecording}>
										{isPaused ? (
											<>
												<PlayIcon className="size-5" weight="fill" />
												<Trans>Resume</Trans>
											</>
										) : (
											<>
												<PauseIcon className="size-5" weight="fill" />
												<Trans>Pause</Trans>
											</>
										)}
									</Button>
									<Button size="lg" variant="destructive" className="gap-2" onClick={onStopRecording}>
										<StopIcon className="size-5" weight="fill" />
										<Trans>Stop</Trans>
									</Button>
								</>
							)}
						</div>
					</div>

					{/* Tips during recording */}
					{isRecording && (
						<motion.div initial={false} animate={{ opacity: 1, y: 0 }} className="rounded-lg border bg-muted/30 p-4">
							<h4 className="mb-2 flex items-center gap-2 font-medium">
								<LightbulbIcon className="size-4 text-amber-500" weight="fill" />
								<Trans>During your pitch</Trans>
							</h4>
							<ul className="space-y-1 text-muted-foreground text-sm">
								<li>
									<Trans>Breathe calmly and speak clearly</Trans>
								</li>
								<li>
									<Trans>Maintain imaginary eye contact</Trans>
								</li>
								<li>
									<Trans>Vary your intonation</Trans>
								</li>
								<li>
									<Trans>Smile to project energy</Trans>
								</li>
							</ul>
						</motion.div>
					)}
				</CardContent>
			</Card>

			{/* Pitch to Practice */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<ClipboardTextIcon className="size-5 text-primary" weight="duotone" />
						<Trans>Your Pitch</Trans>
					</CardTitle>
					<CardDescription>
						<Trans>Read your pitch during practice</Trans>
					</CardDescription>
				</CardHeader>
				<CardContent>
					{generatedPitch ? (
						<ScrollArea className="h-80">
							<div className="space-y-4 pr-4">
								<div className="rounded-lg border bg-card p-4">
									<p className="whitespace-pre-wrap text-lg leading-relaxed">{generatedPitch}</p>
								</div>
								<div className="flex items-center justify-between text-muted-foreground text-sm">
									<span>{wordCount} words</span>
									<span>~{estimatedSeconds}s</span>
								</div>
							</div>
						</ScrollArea>
					) : (
						<div className="flex flex-col items-center justify-center py-16 text-center">
							<PencilSimpleIcon className="mb-4 size-12 text-muted-foreground/50" weight="duotone" />
							<p className="mb-4 text-muted-foreground">
								<Trans>Create a pitch first in the Builder tab</Trans>
							</p>
							<Button variant="outline" onClick={onGoToBuilder}>
								<CaretRightIcon className="mr-2 size-4" />
								<Trans>Go to builder</Trans>
							</Button>
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}

// --- Tips Tab ---

export function TipsTab() {
	return (
		<>
			<div className="grid gap-6 md:grid-cols-2">
				{(["vocal", "body", "content", "mental"] as const).map((category) => {
					const categoryTips = deliveryTips.filter((tip) => tip.category === category);
					const categoryConfig = {
						vocal: { title: t`Voice and Diction`, color: "border-blue-500/30 bg-blue-50/50 dark:bg-blue-950/20" },
						body: {
							title: t`Body Language`,
							color: "border-purple-500/30 bg-purple-50/50 dark:bg-purple-950/20",
						},
						content: { title: t`Content`, color: "border-green-500/30 bg-green-50/50 dark:bg-green-950/20" },
						mental: { title: t`Mental`, color: "border-amber-500/30 bg-amber-50/50 dark:bg-amber-950/20" },
					};

					return (
						<Card key={category} className={cn("border-2", categoryConfig[category].color)}>
							<CardHeader>
								<CardTitle>{categoryConfig[category].title}</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								{categoryTips.map((tip) => {
									const TipIcon = tip.icon;
									return (
										<motion.div
											key={tip.id}
											initial={false}
											animate={{ opacity: 1, x: 0 }}
											className="flex gap-3 rounded-lg border bg-card p-3"
										>
											<div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
												<TipIcon className="size-5 text-primary" weight="duotone" />
											</div>
											<div>
												<h4 className="font-medium">{tip.title}</h4>
												<p className="text-muted-foreground text-sm">{tip.description}</p>
											</div>
										</motion.div>
									);
								})}
							</CardContent>
						</Card>
					);
				})}
			</div>

			{/* General Tips Card */}
			<Card className="border-primary/30 bg-gradient-to-br from-primary/10 to-transparent">
				<CardContent className="flex flex-col items-center gap-4 p-6 md:flex-row">
					<div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-primary/20">
						<LightbulbIcon className="size-7 text-primary" weight="fill" />
					</div>
					<div className="flex-1 text-center md:text-left">
						<h3 className="mb-1 font-semibold text-lg">
							<Trans>The Golden Rule</Trans>
						</h3>
						<p className="text-muted-foreground text-sm">
							<Trans>
								Practice your pitch at least 20 times before an important situation. Repetition builds confidence and
								allows you to deliver a natural and authentic message.
							</Trans>
						</p>
					</div>
				</CardContent>
			</Card>
		</>
	);
}

// --- Examples Tab ---

export function ExamplesTab() {
	return (
		<div className="grid gap-6 lg:grid-cols-2">
			{examplePitches.map((example, index) => {
				const ContextIcon = contextConfig[example.context].icon;
				const industryTemplate = industryTemplates.find((t) => t.industry === example.industry);

				return (
					<motion.div
						key={example.id}
						initial={false}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: index * 0.1 }}
					>
						<Card>
							<CardHeader>
								<div className="flex items-start justify-between">
									<CardTitle className="flex items-center gap-2 text-lg">{example.title}</CardTitle>
									<div className="flex gap-2">
										<Badge className={contextConfig[example.context].color}>
											<ContextIcon className="mr-1 size-3" />
											{contextConfig[example.context].label}
										</Badge>
										<Badge variant="outline">{pitchLengthConfig[example.length].label}</Badge>
									</div>
								</div>
								<CardDescription>{industryTemplate?.label}</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="rounded-lg border bg-muted/30 p-4">
									<p className="whitespace-pre-wrap text-sm leading-relaxed">{example.content}</p>
								</div>

								<div>
									<h4 className="mb-2 flex items-center gap-2 font-medium text-sm">
										<CheckCircleIcon className="size-4 text-green-500" weight="fill" />
										<Trans>Strengths</Trans>
									</h4>
									<div className="flex flex-wrap gap-2">
										{example.highlights.map((highlight) => (
											<Badge key={highlight} variant="outline" className="text-xs">
												{highlight}
											</Badge>
										))}
									</div>
								</div>

								<Button
									variant="outline"
									size="sm"
									className="w-full gap-2"
									onClick={() => {
										navigator.clipboard.writeText(example.content);
										toast.success(t`Example copied`);
									}}
								>
									<CopyIcon className="size-4" />
									<Trans>Copy this example</Trans>
								</Button>
							</CardContent>
						</Card>
					</motion.div>
				);
			})}
		</div>
	);
}

// --- Saved Pitches Tab ---

interface SavedPitchesTabProps {
	savedPitches: SavedPitch[];
	onLoadPitch: (pitch: SavedPitch) => void;
	onDeletePitch: (pitchId: string) => void;
	onGoToBuilder: () => void;
}

export function SavedPitchesTab({ savedPitches, onLoadPitch, onDeletePitch, onGoToBuilder }: SavedPitchesTabProps) {
	if (savedPitches.length > 0) {
		return (
			<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
				{savedPitches.map((pitch, index) => {
					const ContextIcon = contextConfig[pitch.context].icon;
					return (
						<motion.div
							key={pitch.id}
							initial={false}
							animate={{ opacity: 1, scale: 1 }}
							transition={{ delay: index * 0.05 }}
						>
							<Card>
								<CardHeader>
									<div className="flex items-start justify-between">
										<CardTitle className="text-lg">{pitch.name}</CardTitle>
										<Badge className={contextConfig[pitch.context].color}>
											<ContextIcon className="mr-1 size-3" />
											{pitchLengthConfig[pitch.length].label}
										</Badge>
									</div>
									<CardDescription>
										{new Date(pitch.createdAt).toLocaleDateString(undefined, {
											day: "numeric",
											month: "long",
											year: "numeric",
										})}
									</CardDescription>
								</CardHeader>
								<CardContent className="space-y-4">
									<p className="line-clamp-3 text-muted-foreground text-sm">{pitch.content}</p>

									<div className="flex items-center gap-4 text-muted-foreground text-sm">
										<span>{pitch.wordCount} words</span>
										<span>~{pitch.estimatedTime}s</span>
									</div>

									<div className="flex gap-2">
										<Button variant="outline" size="sm" className="flex-1 gap-1" onClick={() => onLoadPitch(pitch)}>
											<PencilSimpleIcon className="size-4" />
											<Trans>Edit</Trans>
										</Button>
										<Button
											variant="outline"
											size="sm"
											className="gap-1"
											onClick={() => {
												navigator.clipboard.writeText(pitch.content);
												toast.success(t`Pitch copied`);
											}}
										>
											<CopyIcon className="size-4" />
										</Button>
										<Button
											variant="outline"
											size="sm"
											className="gap-1 text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/20"
											onClick={() => onDeletePitch(pitch.id)}
										>
											<TrashIcon className="size-4" />
										</Button>
									</div>
								</CardContent>
							</Card>
						</motion.div>
					);
				})}
			</div>
		);
	}

	return (
		<Card className="border-dashed">
			<CardContent className="flex flex-col items-center justify-center py-16">
				<BookmarkSimpleIcon className="mb-4 size-16 text-muted-foreground/50" weight="duotone" />
				<h3 className="mb-2 font-semibold text-lg">
					<Trans>No saved pitches</Trans>
				</h3>
				<p className="mb-4 text-center text-muted-foreground">
					<Trans>Create and save your pitches to find them here</Trans>
				</p>
				<Button onClick={onGoToBuilder}>
					<PlusIcon className="mr-2 size-4" />
					<Trans>Create a pitch</Trans>
				</Button>
			</CardContent>
		</Card>
	);
}
