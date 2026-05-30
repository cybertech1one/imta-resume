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
			className="mb-6 overflow-hidden rounded-lg border bg-card"
			initial={false}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.25, ease: "easeOut" }}
		>
			<div className="grid gap-0 md:grid-cols-[1.25fr_0.75fr]">
				<div className="space-y-4 p-5 md:p-6">
					<div className="flex items-center gap-3">
						<div className="flex size-11 items-center justify-center rounded-lg bg-primary/10">
							<MicrophoneIcon className="size-5 text-primary" weight="duotone" />
						</div>
						<div>
							<h2 className="font-semibold text-xl tracking-tight md:text-2xl">
								<Trans>Construisez un pitch clair pour l'entretien</Trans>
							</h2>
							<p className="text-muted-foreground text-sm">
								<Trans>
									Une présentation courte, concrète et adaptée aux stages, emplois et candidatures spontanées.
								</Trans>
							</p>
						</div>
					</div>
					<div className="grid gap-3 sm:grid-cols-3">
						{[
							{ icon: ClockIcon, value: "30s / 60s / 2min", label: <Trans>Durée maîtrisée</Trans> },
							{ icon: TargetIcon, value: "5", label: <Trans>Étapes simples</Trans> },
							{ icon: BuildingsIcon, value: "IMTA", label: <Trans>Domaines métiers</Trans> },
						].map((item) => (
							<div key={item.value} className="rounded-lg border bg-muted/20 p-3">
								<item.icon className="mb-2 size-4 text-primary" weight="duotone" />
								<p className="font-semibold text-sm">{item.value}</p>
								<p className="text-muted-foreground text-xs">{item.label}</p>
							</div>
						))}
					</div>
				</div>
				<div className="border-t bg-primary/5 p-5 md:border-t-0 md:border-l md:p-6">
					<p className="mb-3 font-medium text-sm">
						<Trans>Structure recommandée</Trans>
					</p>
					<ol className="space-y-2 text-sm">
						{["Accroche", "Profil", "Compétence", "Preuve", "Demande"].map((step, index) => (
							<li key={step} className="flex items-center gap-2">
								<span className="flex size-6 items-center justify-center rounded-full bg-background font-semibold text-primary text-xs">
									{index + 1}
								</span>
								<span>{step}</span>
							</li>
						))}
					</ol>
				</div>
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
							<Trans>Durée du pitch</Trans>
						</CardTitle>
						<CardDescription>
							<Trans>Choisissez un format adapté à la situation</Trans>
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
										<Badge variant="outline">~{config.words} mots</Badge>
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
							<Trans>Contexte</Trans>
						</CardTitle>
						<CardDescription>
							<Trans>Adaptez le ton à votre objectif</Trans>
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
							<Trans>Domaine</Trans>
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
							<Trans>Appliquer un modèle</Trans>
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
								<Trans>Construction guidée</Trans>
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
								<Trans>Précédent</Trans>
							</Button>
							<Button onClick={onNextStep} disabled={currentStep === pitchSteps.length - 1} className="gap-2">
								<Trans>Suivant</Trans>
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
								<Trans>Mon pitch</Trans>
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
											<Trans>mots (objectif : {targetWords})</Trans>
										</p>
									</div>
									<div className="rounded-lg border bg-card p-3 text-center">
										<p className="font-bold text-2xl text-blue-600 dark:text-blue-400">~{estimatedSeconds}s</p>
										<p className="text-muted-foreground text-xs">
											<Trans>estimé (objectif : {targetSeconds}s)</Trans>
										</p>
									</div>
								</div>

								{/* Progress Bar */}
								<div className="space-y-2">
									<div className="flex justify-between text-sm">
										<span className="text-muted-foreground">
											<Trans>Progression</Trans>
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
											<Trans>Votre pitch est trop long. Raccourcissez les phrases les moins utiles.</Trans>
										</p>
									</div>
								)}
								{isUnderLimit && (
									<div className="rounded-lg border border-amber-500/30 bg-amber-50/50 p-3 dark:bg-amber-950/20">
										<p className="flex items-center gap-2 text-amber-700 text-sm dark:text-amber-400">
											<CaretRightIcon className="size-4" />
											<Trans>Votre pitch est un peu court. Ajoutez un exemple concret.</Trans>
										</p>
									</div>
								)}
							</>
						) : (
							<div className="flex flex-col items-center justify-center py-8 text-center">
								<MicrophoneIcon className="mb-4 size-12 text-muted-foreground/50" weight="duotone" />
								<p className="text-muted-foreground">
									<Trans>Votre pitch apparaîtra ici</Trans>
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
							<Trans>Enregistrer</Trans>
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-3">
						<div className="space-y-2">
							<Label>
								<Trans>Nom du pitch</Trans>
							</Label>
							<Input
								placeholder={t`Ex. : Entretien stage clinique`}
								value={pitchName}
								onChange={(e) => setPitchName(e.target.value)}
							/>
						</div>
						<Button className="w-full gap-2" onClick={onSavePitch} disabled={!generatedPitch.trim()}>
							<FloppyDiskIcon className="size-4" />
							{editingPitch ? <Trans>Mettre à jour</Trans> : <Trans>Enregistrer</Trans>}
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
													toast.success(t`Modèle copié`);
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
						<Trans>Entraînement chronométré</Trans>
					</CardTitle>
					<CardDescription>
						<Trans>Testez votre rythme avant un entretien réel</Trans>
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
							<Trans>Objectif : {formatTime(pitchLengthConfig[selectedLength].seconds)}</Trans>
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
									<Trans>Démarrer</Trans>
								</Button>
							) : (
								<>
									<Button size="lg" variant="outline" className="gap-2" onClick={onPauseRecording}>
										{isPaused ? (
											<>
												<PlayIcon className="size-5" weight="fill" />
												<Trans>Reprendre</Trans>
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
										<Trans>Arrêter</Trans>
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
								<Trans>Pendant votre pitch</Trans>
							</h4>
							<ul className="space-y-1 text-muted-foreground text-sm">
								<li>
									<Trans>Respirez calmement et articulez</Trans>
								</li>
								<li>
									<Trans>Gardez un contact visuel naturel</Trans>
								</li>
								<li>
									<Trans>Variez légèrement l'intonation</Trans>
								</li>
								<li>
									<Trans>Souriez pour transmettre de l'énergie</Trans>
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
						<Trans>Votre pitch</Trans>
					</CardTitle>
					<CardDescription>
						<Trans>Lisez-le au début, puis entraînez-vous sans le regarder</Trans>
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
									<span>{wordCount} mots</span>
									<span>~{estimatedSeconds}s</span>
								</div>
							</div>
						</ScrollArea>
					) : (
						<div className="flex flex-col items-center justify-center py-16 text-center">
							<PencilSimpleIcon className="mb-4 size-12 text-muted-foreground/50" weight="duotone" />
							<p className="mb-4 text-muted-foreground">
								<Trans>Créez d'abord un pitch dans l'onglet Créer</Trans>
							</p>
							<Button variant="outline" onClick={onGoToBuilder}>
								<CaretRightIcon className="mr-2 size-4" />
								<Trans>Aller à la création</Trans>
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
						vocal: { title: t`Voix et diction`, color: "border-blue-500/30 bg-blue-50/50 dark:bg-blue-950/20" },
						body: {
							title: t`Langage corporel`,
							color: "border-purple-500/30 bg-purple-50/50 dark:bg-purple-950/20",
						},
						content: { title: t`Contenu`, color: "border-green-500/30 bg-green-50/50 dark:bg-green-950/20" },
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
							<Trans>La règle d'or</Trans>
						</h3>
						<p className="text-muted-foreground text-sm">
							<Trans>
								Répétez votre pitch plusieurs fois avant une situation importante. L'objectif est de parler
								naturellement, sans réciter mot à mot.
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
										<Trans>Points forts</Trans>
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
										toast.success(t`Exemple copié`);
									}}
								>
									<CopyIcon className="size-4" />
									<Trans>Copier cet exemple</Trans>
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
										{new Date(pitch.createdAt).toLocaleDateString("fr-FR", {
											day: "numeric",
											month: "long",
											year: "numeric",
										})}
									</CardDescription>
								</CardHeader>
								<CardContent className="space-y-4">
									<p className="line-clamp-3 text-muted-foreground text-sm">{pitch.content}</p>

									<div className="flex items-center gap-4 text-muted-foreground text-sm">
										<span>{pitch.wordCount} mots</span>
										<span>~{pitch.estimatedTime}s</span>
									</div>

									<div className="flex gap-2">
										<Button variant="outline" size="sm" className="flex-1 gap-1" onClick={() => onLoadPitch(pitch)}>
											<PencilSimpleIcon className="size-4" />
											<Trans>Modifier</Trans>
										</Button>
										<Button
											variant="outline"
											size="sm"
											className="gap-1"
											onClick={() => {
												navigator.clipboard.writeText(pitch.content);
												toast.success(t`Pitch copié`);
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
					<Trans>Aucun pitch enregistré</Trans>
				</h3>
				<p className="mb-4 text-center text-muted-foreground">
					<Trans>Créez et enregistrez vos pitchs pour les retrouver ici</Trans>
				</p>
				<Button onClick={onGoToBuilder}>
					<PlusIcon className="mr-2 size-4" />
					<Trans>Créer un pitch</Trans>
				</Button>
			</CardContent>
		</Card>
	);
}
