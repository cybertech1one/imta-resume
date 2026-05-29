import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import {
	ArrowLeftIcon,
	BrainIcon,
	CalendarCheckIcon,
	CheckCircleIcon,
	ClockIcon,
	EyeIcon,
	FireIcon,
	FlowerLotusIcon,
	HandFistIcon,
	HeartIcon,
	LightbulbIcon,
	ListChecksIcon,
	MountainsIcon,
	PauseIcon,
	PersonArmsSpreadIcon,
	PlayIcon,
	PlusIcon,
	SparkleIcon,
	StarIcon,
	SunIcon,
	TimerIcon,
	TrophyIcon,
	WindIcon,
	XIcon,
} from "@phosphor-icons/react";
import { Link } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/utils/style";

import {
	affirmations,
	anxietyTips,
	breathingExercises,
	meditationDurations,
	powerPoses,
	visualizationExercises,
} from "./confidence-config";
import type { Exercise, ExerciseCategory, ExerciseStats } from "./confidence-types";
import { getExerciseById } from "./confidence-utils";

// ---------------------------------------------------------------------------
// Prop types
// ---------------------------------------------------------------------------

interface BreathingTimerProps {
	exercise: Exercise;
	onComplete: () => void;
}

interface MeditationTimerProps {
	duration: number;
	onComplete: () => void;
}

interface HeroSectionProps {
	currentStats: ExerciseStats;
}

interface ProgressOverviewProps {
	currentStats: ExerciseStats;
}

interface BreathingTabProps {
	isCompletedToday: (id: string) => boolean;
	addToRoutine: (id: string) => void;
	addToRoutinePending: boolean;
	onSelectExercise: (exercise: Exercise) => void;
}

interface AffirmationsTabProps {
	currentAffirmationIndex: number;
	setCurrentAffirmationIndex: (index: number) => void;
	nextAffirmation: () => void;
	prevAffirmation: () => void;
	completeExercise: (id: string, category: ExerciseCategory) => void;
	completeExercisePending: boolean;
}

interface PowerPosesTabProps {
	isCompletedToday: (id: string) => boolean;
	addToRoutine: (id: string) => void;
	addToRoutinePending: boolean;
	onSelectExercise: (exercise: Exercise) => void;
}

interface VisualizationTabProps {
	isCompletedToday: (id: string) => boolean;
	addToRoutine: (id: string) => void;
	addToRoutinePending: boolean;
	onSelectExercise: (exercise: Exercise) => void;
}

interface AnxietyTabProps {
	completeExercise: (id: string, category: ExerciseCategory) => void;
	completeExercisePending: boolean;
}

interface RoutineTabProps {
	dailyRoutine: Array<{ id: string; exerciseId: string; completed: boolean }>;
	routineProgress: number;
	clearRoutinePending: boolean;
	removeFromRoutinePending: boolean;
	onClearRoutine: () => void;
	onRemoveFromRoutine: (id: string) => void;
	onSelectExercise: (exercise: Exercise) => void;
	setActiveTab: (tab: string) => void;
}

interface MeditationTabProps {
	meditationDuration: number;
	setMeditationDuration: (duration: number) => void;
	onStartMeditation: () => void;
}

interface ExerciseDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	selectedExercise: Exercise | null;
	completeExercise: (id: string, category: ExerciseCategory) => void;
}

interface MeditationDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	meditationDuration: number;
	onComplete: () => void;
}

// ---------------------------------------------------------------------------
// BreathingTimer
// ---------------------------------------------------------------------------

function BreathingTimer({ exercise, onComplete }: BreathingTimerProps) {
	const [phase, setPhase] = useState<"ready" | "inhale" | "hold" | "exhale" | "rest" | "complete">("ready");
	const [timeLeft, setTimeLeft] = useState(exercise.duration);
	const [cycleTime, setCycleTime] = useState(0);
	const [isActive, setIsActive] = useState(false);
	const [cycles, setCycles] = useState(0);

	// Get breathing pattern based on exercise
	const pattern = useMemo(() => {
		if (exercise.id === "breath-4-7-8") {
			return { inhale: 4, hold: 7, exhale: 8, rest: 0 };
		}
		if (exercise.id === "breath-box") {
			return { inhale: 4, hold: 4, exhale: 4, rest: 4 };
		}
		if (exercise.id === "breath-belly") {
			return { inhale: 4, hold: 2, exhale: 6, rest: 2 };
		}
		return { inhale: 3, hold: 0, exhale: 3, rest: 1 };
	}, [exercise.id]);

	useEffect(() => {
		let interval: NodeJS.Timeout | null = null;

		if (isActive && phase !== "complete") {
			interval = setInterval(() => {
				setTimeLeft((prev) => {
					if (prev <= 1) {
						setPhase("complete");
						setIsActive(false);
						onComplete();
						return 0;
					}
					return prev - 1;
				});

				setCycleTime((prev) => {
					const totalCycle = pattern.inhale + pattern.hold + pattern.exhale + pattern.rest;
					const newTime = (prev + 1) % totalCycle;

					// Determine phase
					if (newTime < pattern.inhale) {
						setPhase("inhale");
					} else if (newTime < pattern.inhale + pattern.hold) {
						setPhase("hold");
					} else if (newTime < pattern.inhale + pattern.hold + pattern.exhale) {
						setPhase("exhale");
					} else {
						setPhase("rest");
					}

					if (newTime === 0) {
						setCycles((c) => c + 1);
					}

					return newTime;
				});
			}, 1000);
		}

		return () => {
			if (interval) clearInterval(interval);
		};
	}, [isActive, phase, pattern, onComplete]);

	const phaseLabels: Record<string, string> = {
		ready: t`Prêt`,
		inhale: t`Inspirez`,
		hold: t`Retenez`,
		exhale: t`Expirez`,
		rest: t`Repos`,
		complete: t`Terminé`,
	};

	const phaseColors: Record<string, string> = {
		ready: "text-gray-500",
		inhale: "text-blue-500",
		hold: "text-purple-500",
		exhale: "text-green-500",
		rest: "text-amber-500",
		complete: "text-emerald-500",
	};

	const getPhaseProgress = () => {
		if (phase === "inhale") return (cycleTime / pattern.inhale) * 100;
		if (phase === "hold") return ((cycleTime - pattern.inhale) / pattern.hold) * 100;
		if (phase === "exhale") return ((cycleTime - pattern.inhale - pattern.hold) / pattern.exhale) * 100;
		if (phase === "rest") return ((cycleTime - pattern.inhale - pattern.hold - pattern.exhale) / pattern.rest) * 100;
		return 0;
	};

	return (
		<div className="flex flex-col items-center gap-6 py-8">
			{/* Main circle animation */}
			<motion.div
				className={cn(
					"relative flex size-48 items-center justify-center rounded-full border-4",
					phase === "inhale" && "border-blue-500 bg-blue-500/10",
					phase === "hold" && "border-purple-500 bg-purple-500/10",
					phase === "exhale" && "border-green-500 bg-green-500/10",
					phase === "rest" && "border-amber-500 bg-amber-500/10",
					(phase === "ready" || phase === "complete") &&
						"border-gray-300 bg-gray-100 dark:border-gray-600 dark:bg-gray-800",
				)}
				animate={{
					scale: phase === "inhale" ? 1.2 : phase === "exhale" ? 0.9 : 1,
				}}
				transition={{ duration: 1, ease: "easeInOut" }}
			>
				<div className="text-center">
					<p className={cn("font-bold text-4xl", phaseColors[phase])}>{phaseLabels[phase]}</p>
					{isActive && phase !== "complete" && (
						<p className="mt-2 text-muted-foreground text-sm">
							{t`Cycle`} {cycles + 1}
						</p>
					)}
				</div>
			</motion.div>

			{/* Phase progress */}
			{isActive && phase !== "ready" && phase !== "complete" && (
				<div className="w-full max-w-xs">
					<Progress value={getPhaseProgress()} className="h-2" />
				</div>
			)}

			{/* Time remaining */}
			<div className="text-center">
				<p className="font-medium text-2xl">
					{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, "0")}
				</p>
				<p className="text-muted-foreground text-sm">
					<Trans>temps restant</Trans>
				</p>
			</div>

			{/* Controls */}
			<div className="flex gap-4">
				{!isActive && phase !== "complete" && (
					<Button onClick={() => setIsActive(true)} className="gap-2">
						<PlayIcon className="size-4" />
						<Trans>Demarrer</Trans>
					</Button>
				)}
				{isActive && (
					<Button variant="outline" onClick={() => setIsActive(false)} className="gap-2">
						<PauseIcon className="size-4" />
						<Trans>Pause</Trans>
					</Button>
				)}
				{phase === "complete" && (
					<Badge className="bg-green-500 px-4 py-2 text-white">
						<CheckCircleIcon className="mr-2 size-4" />
						<Trans>Exercice termine !</Trans>
					</Badge>
				)}
			</div>
		</div>
	);
}

// ---------------------------------------------------------------------------
// MeditationTimer
// ---------------------------------------------------------------------------

function MeditationTimer({ duration, onComplete }: MeditationTimerProps) {
	const [timeLeft, setTimeLeft] = useState(duration);
	const [isActive, setIsActive] = useState(false);
	const [isComplete, setIsComplete] = useState(false);

	useEffect(() => {
		let interval: NodeJS.Timeout | null = null;

		if (isActive && timeLeft > 0) {
			interval = setInterval(() => {
				setTimeLeft((prev) => {
					if (prev <= 1) {
						setIsActive(false);
						setIsComplete(true);
						onComplete();
						return 0;
					}
					return prev - 1;
				});
			}, 1000);
		}

		return () => {
			if (interval) clearInterval(interval);
		};
	}, [isActive, timeLeft, onComplete]);

	const progress = ((duration - timeLeft) / duration) * 100;

	return (
		<div className="flex flex-col items-center gap-6 py-8">
			{/* Animated circle */}
			<div className="relative">
				<motion.div
					className="flex size-56 items-center justify-center rounded-full border-4 border-primary/20"
					animate={
						isActive
							? {
									boxShadow: ["0 0 0 0 rgba(var(--primary), 0.4)", "0 0 0 20px rgba(var(--primary), 0)"],
								}
							: {}
					}
					transition={{ duration: 2, repeat: Infinity }}
				>
					<svg className="absolute inset-0 size-full -rotate-90">
						<circle
							cx="50%"
							cy="50%"
							r="48%"
							fill="none"
							stroke="currentColor"
							strokeWidth="4"
							className="text-primary"
							strokeDasharray={`${progress * 3.14 * 1.12}, 1000`}
							strokeLinecap="round"
						/>
					</svg>
					<div className="text-center">
						<p className="font-bold text-5xl">
							{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, "0")}
						</p>
						{isComplete && (
							<Badge className="mt-2 bg-green-500 text-white">
								<Trans>Terminé !</Trans>
							</Badge>
						)}
					</div>
				</motion.div>
			</div>

			{/* Controls */}
			<div className="flex gap-4">
				{!isActive && !isComplete && (
					<Button onClick={() => setIsActive(true)} className="gap-2">
						<PlayIcon className="size-4" />
						<Trans>Demarrer</Trans>
					</Button>
				)}
				{isActive && (
					<Button variant="outline" onClick={() => setIsActive(false)} className="gap-2">
						<PauseIcon className="size-4" />
						<Trans>Pause</Trans>
					</Button>
				)}
				{(isActive || timeLeft < duration) && !isComplete && (
					<Button
						variant="ghost"
						onClick={() => {
							setTimeLeft(duration);
							setIsActive(false);
						}}
					>
						<Trans>Reinitialiser</Trans>
					</Button>
				)}
			</div>
		</div>
	);
}

// ---------------------------------------------------------------------------
// LoadingSkeleton
// ---------------------------------------------------------------------------

export function LoadingSkeleton() {
	return (
		<div className="space-y-8">
			<Skeleton className="h-48 w-full rounded-3xl" />
			<div className="grid gap-4 md:grid-cols-4">
				{[1, 2, 3, 4].map((i) => (
					<Card key={i}>
						<CardContent className="pt-6">
							<Skeleton className="mb-4 h-12 w-12 rounded-xl" />
							<Skeleton className="mb-2 h-6 w-16" />
							<Skeleton className="h-4 w-24" />
						</CardContent>
					</Card>
				))}
			</div>
		</div>
	);
}

// ---------------------------------------------------------------------------
// HeroSection
// ---------------------------------------------------------------------------

export function HeroSection({ currentStats }: HeroSectionProps) {
	return (
		<motion.div
			className="relative mb-8 overflow-hidden rounded-3xl border border-emerald-500/20 p-8 md:p-12"
			style={{
				background:
					"linear-gradient(135deg, oklch(0.75 0.12 160 / 0.15) 0%, oklch(0.7 0.15 200 / 0.1) 50%, oklch(0.65 0.1 250 / 0.08) 100%)",
			}}
			initial={false}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.6, ease: "easeOut" }}
		>
			{/* Animated background */}
			<div className="pointer-events-none absolute inset-0 overflow-hidden">
				<motion.div
					className="absolute -top-32 -right-32 size-96 rounded-full bg-gradient-to-br from-emerald-500/20 to-teal-500/10 blur-3xl"
					animate={{
						scale: [1, 1.2, 1],
						rotate: [0, 10, 0],
						opacity: [0.5, 0.3, 0.5],
					}}
					transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
				/>
				<motion.div
					className="absolute -bottom-32 -left-32 size-96 rounded-full bg-gradient-to-tr from-cyan-500/15 to-blue-500/10 blur-3xl"
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
					<FlowerLotusIcon className="size-5 text-emerald-600" weight="fill" />
					<span className="font-semibold text-emerald-700 text-sm uppercase tracking-wider dark:text-emerald-400">
						<Trans>Bien-etre mental</Trans>
					</span>
				</motion.div>

				<motion.h2
					className="mb-4 bg-gradient-to-r from-emerald-700 via-teal-600 to-emerald-700 bg-clip-text font-bold text-3xl text-transparent tracking-tight md:text-4xl lg:text-5xl dark:from-emerald-400 dark:via-teal-400 dark:to-emerald-400"
					initial={false}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.3 }}
				>
					<Trans>Exercices de confiance en soi</Trans>
				</motion.h2>

				<motion.p
					className="mb-8 max-w-2xl text-lg text-muted-foreground"
					initial={false}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.4 }}
				>
					<Trans>
						Préparez votre mental pour l'entretien avec respiration guidée, affirmations positives, postures de
						confiance et visualisation.
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
						<div className="flex size-10 items-center justify-center rounded-full bg-emerald-500/10">
							<TrophyIcon className="size-5 text-emerald-500" weight="duotone" />
						</div>
						<div>
							<p className="font-bold text-xl">{currentStats.totalCompleted}</p>
							<p className="text-muted-foreground text-sm">
								<Trans>Exercices</Trans>
							</p>
						</div>
					</div>
					<div className="flex items-center gap-2">
						<div className="flex size-10 items-center justify-center rounded-full bg-orange-500/10">
							<FireIcon className="size-5 text-orange-500" weight="duotone" />
						</div>
						<div>
							<p className="font-bold text-xl">{currentStats.streak}</p>
							<p className="text-muted-foreground text-sm">
								<Trans>Jours consecutifs</Trans>
							</p>
						</div>
					</div>
					<Link to="/dashboard/interview">
						<Button variant="outline" className="gap-2">
							<ArrowLeftIcon className="size-4" />
							<Trans>Retour</Trans>
						</Button>
					</Link>
				</motion.div>
			</div>
		</motion.div>
	);
}

// ---------------------------------------------------------------------------
// ProgressOverview
// ---------------------------------------------------------------------------

export function ProgressOverview({ currentStats }: ProgressOverviewProps) {
	return (
		<section className="mb-8">
			<div className="grid gap-4 md:grid-cols-4">
				{(["breathing", "affirmations", "power_poses", "visualization"] as const).map((category, index) => {
					const icons = {
						breathing: WindIcon,
						affirmations: SparkleIcon,
						power_poses: HandFistIcon,
						visualization: EyeIcon,
					};
					const labels = {
						breathing: t`Respiration`,
						affirmations: t`Affirmations`,
						power_poses: t`Postures`,
						visualization: t`Visualisation`,
					};
					const colors = {
						breathing: "text-blue-500 bg-blue-500/10",
						affirmations: "text-purple-500 bg-purple-500/10",
						power_poses: "text-orange-500 bg-orange-500/10",
						visualization: "text-cyan-500 bg-cyan-500/10",
					};
					const Icon = icons[category];
					return (
						<motion.div
							key={category}
							initial={false}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: index * 0.1 }}
						>
							<Card className="transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
								<CardContent className="pt-6">
									<div className="flex items-center justify-between">
										<div className={cn("flex size-12 items-center justify-center rounded-xl", colors[category])}>
											<Icon className="size-6" weight="duotone" />
										</div>
										<p className="font-bold text-2xl">{currentStats.categoryProgress[category]}</p>
									</div>
									<p className="mt-3 font-medium">{labels[category]}</p>
								</CardContent>
							</Card>
						</motion.div>
					);
				})}
			</div>
		</section>
	);
}

// ---------------------------------------------------------------------------
// BreathingTab
// ---------------------------------------------------------------------------

export function BreathingTab({
	isCompletedToday,
	addToRoutine,
	addToRoutinePending,
	onSelectExercise,
}: BreathingTabProps) {
	return (
		<motion.div initial={false} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
			<div className="mb-6">
				<h3 className="flex items-center gap-2 font-semibold text-xl">
					<WindIcon className="size-6 text-blue-500" weight="duotone" />
					<Trans>Exercices de respiration</Trans>
				</h3>
				<p className="text-muted-foreground">
					<Trans>Techniques de respiration pour calmer le stress et l'anxiété</Trans>
				</p>
			</div>

			<div className="grid gap-4 md:grid-cols-2">
				{breathingExercises.map((exercise, index) => (
					<motion.div
						key={exercise.id}
						initial={false}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: index * 0.1 }}
					>
						<Card
							className={cn(
								"group h-full cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-lg",
								isCompletedToday(exercise.id) && "border-green-500/50 ring-1 ring-green-500/20",
							)}
							onClick={() => onSelectExercise(exercise)}
						>
							<CardHeader className="pb-3">
								<div className="flex items-center justify-between">
									<div className="flex size-12 items-center justify-center rounded-xl bg-blue-500/10 transition-transform group-hover:scale-110">
										<WindIcon className="size-6 text-blue-500" weight="duotone" />
									</div>
									<div className="flex items-center gap-2">
										{isCompletedToday(exercise.id) && (
											<Badge className="bg-green-500 text-white">
												<CheckCircleIcon className="mr-1 size-3" />
												<Trans>Fait</Trans>
											</Badge>
										)}
										<Badge variant="outline">
											<ClockIcon className="mr-1 size-3" />
											{Math.floor(exercise.duration / 60)} min
										</Badge>
									</div>
								</div>
								<CardTitle className="text-lg">{exercise.titleFr}</CardTitle>
								<CardDescription>{exercise.descriptionFr}</CardDescription>
							</CardHeader>
							<CardFooter className="flex justify-between gap-2">
								<Button
									size="sm"
									variant="outline"
									disabled={addToRoutinePending}
									onClick={(e) => {
										e.stopPropagation();
										addToRoutine(exercise.id);
									}}
								>
									<PlusIcon className="mr-1 size-4" />
									<Trans>Routine</Trans>
								</Button>
								<Button size="sm" className="gap-2">
									<PlayIcon className="size-4" />
									<Trans>Demarrer</Trans>
								</Button>
							</CardFooter>
						</Card>
					</motion.div>
				))}
			</div>
		</motion.div>
	);
}

// ---------------------------------------------------------------------------
// AffirmationsTab
// ---------------------------------------------------------------------------

export function AffirmationsTab({
	currentAffirmationIndex,
	setCurrentAffirmationIndex,
	nextAffirmation,
	prevAffirmation,
	completeExercise,
	completeExercisePending,
}: AffirmationsTabProps) {
	return (
		<motion.div initial={false} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
			<div className="mb-6">
				<h3 className="flex items-center gap-2 font-semibold text-xl">
					<SparkleIcon className="size-6 text-purple-500" weight="duotone" />
					<Trans>Affirmations positives</Trans>
				</h3>
				<p className="text-muted-foreground">
					<Trans>Renforcez votre confiance avec des affirmations puissantes</Trans>
				</p>
			</div>

			{/* Featured Affirmation */}
			<Card className="mb-6 overflow-hidden bg-gradient-to-br from-purple-500/10 via-pink-500/5 to-transparent">
				<CardContent className="relative py-12">
					<div className="absolute top-0 right-0 size-64 rounded-full bg-purple-500/10 blur-3xl" />

					<AnimatePresence mode="wait">
						<motion.div
							key={currentAffirmationIndex}
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -20 }}
							className="relative text-center"
						>
							<StarIcon className="mx-auto mb-4 size-12 text-purple-500" weight="fill" />
							<p className="mx-auto max-w-2xl font-medium text-2xl md:text-3xl">
								"{affirmations[currentAffirmationIndex].text}"
							</p>
							<Badge className="mt-4 bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
								{affirmations[currentAffirmationIndex].category}
							</Badge>
						</motion.div>
					</AnimatePresence>

					<div className="mt-8 flex justify-center gap-4">
						<Button variant="outline" size="icon" onClick={prevAffirmation} aria-label={t`Affirmation precedente`}>
							<ArrowLeftIcon className="size-4" />
						</Button>
						<Button
							disabled={completeExercisePending}
							onClick={() => {
								completeExercise(`aff-${currentAffirmationIndex}`, "affirmations");
								nextAffirmation();
							}}
						>
							<Trans>Suivante</Trans>
						</Button>
						<Button variant="outline" size="icon" onClick={nextAffirmation} aria-label={t`Affirmation suivante`}>
							<ArrowLeftIcon className="size-4 rotate-180" />
						</Button>
					</div>

					{/* Indicator dots */}
					<div className="mt-6 flex justify-center gap-1" role="tablist" aria-label={t`Affirmations`}>
						{affirmations.map((_, idx) => (
							<button
								key={idx}
								type="button"
								role="tab"
								aria-selected={idx === currentAffirmationIndex}
								aria-label={`Affirmation ${idx + 1}`}
								className={cn(
									"size-2 rounded-full transition-all",
									idx === currentAffirmationIndex ? "w-6 bg-purple-500" : "bg-purple-500/30",
								)}
								onClick={() => setCurrentAffirmationIndex(idx)}
							/>
						))}
					</div>
				</CardContent>
			</Card>

			{/* All Affirmations Grid */}
			<h4 className="mb-4 font-medium text-lg">
				<Trans>Bibliotheque d'affirmations</Trans>
			</h4>
			<div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
				{affirmations.map((aff, index) => (
					<motion.div
						key={aff.id}
						initial={false}
						animate={{ opacity: 1, scale: 1 }}
						transition={{ delay: index * 0.03 }}
					>
						<Card
							className={cn(
								"cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-md",
								index === currentAffirmationIndex && "border-purple-500 ring-1 ring-purple-500/20",
							)}
							onClick={() => setCurrentAffirmationIndex(index)}
						>
							<CardContent className="p-4">
								<p className="text-sm">"{aff.text}"</p>
								<Badge variant="outline" className="mt-2 text-xs">
									{aff.category}
								</Badge>
							</CardContent>
						</Card>
					</motion.div>
				))}
			</div>
		</motion.div>
	);
}

// ---------------------------------------------------------------------------
// PowerPosesTab
// ---------------------------------------------------------------------------

export function PowerPosesTab({
	isCompletedToday,
	addToRoutine,
	addToRoutinePending,
	onSelectExercise,
}: PowerPosesTabProps) {
	return (
		<motion.div initial={false} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
			<div className="mb-6">
				<h3 className="flex items-center gap-2 font-semibold text-xl">
					<HandFistIcon className="size-6 text-orange-500" weight="duotone" />
					<Trans>Postures de confiance</Trans>
				</h3>
				<p className="text-muted-foreground">
					<Trans>
						Postures qui augmentent la confiance et reduisent le stress. Gardez chaque posture pendant 2 minutes.
					</Trans>
				</p>
			</div>

			<div className="grid gap-4 md:grid-cols-2">
				{powerPoses.map((pose, index) => (
					<motion.div key={pose.id} initial={false} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
						<Card
							className={cn(
								"group h-full cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-lg",
								isCompletedToday(pose.id) && "border-green-500/50 ring-1 ring-green-500/20",
							)}
							onClick={() => onSelectExercise(pose)}
						>
							<CardHeader className="pb-3">
								<div className="flex items-center justify-between">
									<div className="flex size-12 items-center justify-center rounded-xl bg-orange-500/10 transition-transform group-hover:scale-110">
										<PersonArmsSpreadIcon className="size-6 text-orange-500" weight="duotone" />
									</div>
									{isCompletedToday(pose.id) && (
										<Badge className="bg-green-500 text-white">
											<CheckCircleIcon className="mr-1 size-3" />
											<Trans>Fait</Trans>
										</Badge>
									)}
								</div>
								<CardTitle className="text-lg">{pose.titleFr}</CardTitle>
								<CardDescription>{pose.descriptionFr}</CardDescription>
							</CardHeader>
							<CardContent className="pt-0">
								<ScrollArea className="h-24">
									<ol className="space-y-1 text-muted-foreground text-sm">
										{pose.stepsFr?.map((step, i) => (
											<li key={i} className="flex gap-2">
												<span className="font-medium text-orange-500">{i + 1}.</span>
												{step}
											</li>
										))}
									</ol>
								</ScrollArea>
							</CardContent>
							<CardFooter className="flex justify-between gap-2">
								<Button
									size="sm"
									variant="outline"
									disabled={addToRoutinePending}
									onClick={(e) => {
										e.stopPropagation();
										addToRoutine(pose.id);
									}}
								>
									<PlusIcon className="mr-1 size-4" />
									<Trans>Routine</Trans>
								</Button>
								<Button size="sm" className="gap-2">
									<PlayIcon className="size-4" />
									<Trans>Demarrer</Trans>
								</Button>
							</CardFooter>
						</Card>
					</motion.div>
				))}
			</div>
		</motion.div>
	);
}

// ---------------------------------------------------------------------------
// VisualizationTab
// ---------------------------------------------------------------------------

export function VisualizationTab({
	isCompletedToday,
	addToRoutine,
	addToRoutinePending,
	onSelectExercise,
}: VisualizationTabProps) {
	return (
		<motion.div initial={false} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
			<div className="mb-6">
				<h3 className="flex items-center gap-2 font-semibold text-xl">
					<EyeIcon className="size-6 text-cyan-500" weight="duotone" />
					<Trans>Techniques de visualisation</Trans>
				</h3>
				<p className="text-muted-foreground">
					<Trans>Utilisez la force de votre imagination pour vous préparer à réussir</Trans>
				</p>
			</div>

			<div className="grid gap-4 md:grid-cols-3">
				{visualizationExercises.map((viz, index) => (
					<motion.div key={viz.id} initial={false} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
						<Card
							className={cn(
								"group h-full cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-lg",
								isCompletedToday(viz.id) && "border-green-500/50 ring-1 ring-green-500/20",
							)}
							onClick={() => onSelectExercise(viz)}
						>
							<CardHeader className="pb-3">
								<div className="flex items-center justify-between">
									<div className="flex size-12 items-center justify-center rounded-xl bg-cyan-500/10 transition-transform group-hover:scale-110">
										{viz.id === "viz-success" && <MountainsIcon className="size-6 text-cyan-500" weight="duotone" />}
										{viz.id === "viz-calm-place" && <SunIcon className="size-6 text-cyan-500" weight="duotone" />}
										{viz.id === "viz-future-self" && <BrainIcon className="size-6 text-cyan-500" weight="duotone" />}
									</div>
									<div className="flex items-center gap-2">
										{isCompletedToday(viz.id) && (
											<Badge className="bg-green-500 text-white">
												<CheckCircleIcon className="mr-1 size-3" />
												<Trans>Fait</Trans>
											</Badge>
										)}
										<Badge variant="outline">
											<ClockIcon className="mr-1 size-3" />
											{Math.floor(viz.duration / 60)} min
										</Badge>
									</div>
								</div>
								<CardTitle className="text-lg">{viz.titleFr}</CardTitle>
								<CardDescription>{viz.descriptionFr}</CardDescription>
							</CardHeader>
							<CardContent className="pt-0">
								<ScrollArea className="h-32">
									<ol className="space-y-2 text-muted-foreground text-sm">
										{viz.stepsFr?.map((step, i) => (
											<li key={i} className="flex gap-2">
												<span className="font-medium text-cyan-500">{i + 1}.</span>
												{step}
											</li>
										))}
									</ol>
								</ScrollArea>
							</CardContent>
							<CardFooter className="flex justify-between gap-2">
								<Button
									size="sm"
									variant="outline"
									disabled={addToRoutinePending}
									onClick={(e) => {
										e.stopPropagation();
										addToRoutine(viz.id);
									}}
								>
									<PlusIcon className="mr-1 size-4" />
									<Trans>Routine</Trans>
								</Button>
								<Button size="sm" className="gap-2">
									<PlayIcon className="size-4" />
									<Trans>Demarrer</Trans>
								</Button>
							</CardFooter>
						</Card>
					</motion.div>
				))}
			</div>
		</motion.div>
	);
}

// ---------------------------------------------------------------------------
// AnxietyTab
// ---------------------------------------------------------------------------

export function AnxietyTab({ completeExercise, completeExercisePending }: AnxietyTabProps) {
	return (
		<motion.div initial={false} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
			<div className="mb-6">
				<h3 className="flex items-center gap-2 font-semibold text-xl">
					<HeartIcon className="size-6 text-red-500" weight="duotone" />
					<Trans>Gestion du stress</Trans>
				</h3>
				<p className="text-muted-foreground">
					<Trans>Stratégies pratiques pour gérer le stress et l'anxiété avant un entretien</Trans>
				</p>
			</div>

			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
				{anxietyTips.map((tip, index) => (
					<motion.div key={tip.id} initial={false} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
						<Card className="group h-full transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
							<CardHeader className="pb-3">
								<div className="flex size-12 items-center justify-center rounded-xl bg-red-500/10 transition-transform group-hover:scale-110">
									<LightbulbIcon className="size-6 text-red-500" weight="duotone" />
								</div>
								<CardTitle className="text-lg">{tip.titleFr}</CardTitle>
								<CardDescription>{tip.descriptionFr}</CardDescription>
							</CardHeader>
							<CardContent className="pt-0">
								<ol className="space-y-2 text-sm">
									{tip.stepsFr.map((step, i) => (
										<li key={i} className="flex gap-2">
											<CheckCircleIcon className="mt-0.5 size-4 shrink-0 text-green-500" />
											<span>{step}</span>
										</li>
									))}
								</ol>
							</CardContent>
							<CardFooter>
								<Button
									size="sm"
									variant="outline"
									className="w-full"
									disabled={completeExercisePending}
									onClick={() => completeExercise(tip.id, "anxiety_management")}
								>
									<CheckCircleIcon className="mr-2 size-4" />
									<Trans>Marquer comme fait</Trans>
								</Button>
							</CardFooter>
						</Card>
					</motion.div>
				))}
			</div>
		</motion.div>
	);
}

// ---------------------------------------------------------------------------
// RoutineTab
// ---------------------------------------------------------------------------

export function RoutineTab({
	dailyRoutine,
	routineProgress,
	clearRoutinePending,
	removeFromRoutinePending,
	onClearRoutine,
	onRemoveFromRoutine,
	onSelectExercise,
	setActiveTab,
}: RoutineTabProps) {
	return (
		<motion.div initial={false} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
			<div className="mb-6 flex items-center justify-between">
				<div>
					<h3 className="flex items-center gap-2 font-semibold text-xl">
						<CalendarCheckIcon className="size-6 text-green-500" weight="duotone" />
						<Trans>Ma routine quotidienne</Trans>
					</h3>
					<p className="text-muted-foreground">
						<Trans>Construisez une routine quotidienne pour maintenir votre confiance</Trans>
					</p>
				</div>
				{dailyRoutine.length > 0 && (
					<Button variant="outline" size="sm" disabled={clearRoutinePending} onClick={onClearRoutine}>
						<Trans>Reinitialiser</Trans>
					</Button>
				)}
			</div>

			{/* Progress Card */}
			<Card className="mb-6 bg-gradient-to-br from-green-500/10 to-emerald-500/5">
				<CardContent className="py-6">
					<div className="flex items-center justify-between">
						<div>
							<p className="font-medium text-lg">
								<Trans>Progression du jour</Trans>
							</p>
							<p className="text-muted-foreground text-sm">
								{dailyRoutine.filter((i) => i.completed).length} / {dailyRoutine.length}{" "}
								<Trans>exercices termines</Trans>
							</p>
						</div>
						<div className="flex size-20 items-center justify-center rounded-full border-4 border-green-500 bg-green-500/10">
							<span className="font-bold text-2xl text-green-600">{routineProgress}%</span>
						</div>
					</div>
					<Progress value={routineProgress} className="mt-4 h-3" />
				</CardContent>
			</Card>

			{/* Routine Items */}
			{dailyRoutine.length > 0 ? (
				<div className="space-y-3">
					{dailyRoutine.map((item, index) => {
						const exercise = getExerciseById(item.exerciseId);
						if (!exercise) return null;

						return (
							<motion.div
								key={item.id}
								initial={false}
								animate={{ opacity: 1, x: 0 }}
								transition={{ delay: index * 0.05 }}
							>
								<Card
									className={cn("transition-all duration-300", item.completed && "border-green-500/50 bg-green-500/5")}
								>
									<CardContent className="flex items-center justify-between p-4">
										<div className="flex items-center gap-4">
											<div
												className={cn(
													"flex size-10 items-center justify-center rounded-lg",
													item.completed ? "bg-green-500/20" : "bg-muted",
												)}
											>
												{item.completed ? (
													<CheckCircleIcon className="size-5 text-green-500" weight="fill" />
												) : (
													<ListChecksIcon className="size-5 text-muted-foreground" />
												)}
											</div>
											<div>
												<h4 className={cn("font-medium", item.completed && "line-through opacity-70")}>
													{exercise.titleFr}
												</h4>
												<p className="text-muted-foreground text-sm">
													{Math.floor(exercise.duration / 60)} <Trans>minutes</Trans>
												</p>
											</div>
										</div>
										<div className="flex items-center gap-2">
											{!item.completed && (
												<Button size="sm" onClick={() => onSelectExercise(exercise)}>
													<PlayIcon className="mr-1 size-4" />
													<Trans>Faire</Trans>
												</Button>
											)}
											<Button
												size="sm"
												variant="ghost"
												className="text-destructive"
												disabled={removeFromRoutinePending}
												onClick={() => onRemoveFromRoutine(item.exerciseId)}
											>
												<XIcon className="size-4" />
											</Button>
										</div>
									</CardContent>
								</Card>
							</motion.div>
						);
					})}
				</div>
			) : (
				<Card className="border-dashed">
					<CardContent className="flex flex-col items-center justify-center py-12">
						<CalendarCheckIcon className="mb-4 size-12 text-muted-foreground" />
						<h4 className="mb-2 font-semibold text-lg">
							<Trans>Aucun exercice dans votre routine</Trans>
						</h4>
						<p className="mb-4 text-center text-muted-foreground">
							<Trans>Ajoutez des exercices depuis les autres onglets pour créer votre routine quotidienne</Trans>
						</p>
						<Button onClick={() => setActiveTab("breathing")}>
							<PlusIcon className="mr-2 size-4" />
							<Trans>Ajouter des exercices</Trans>
						</Button>
					</CardContent>
				</Card>
			)}
		</motion.div>
	);
}

// ---------------------------------------------------------------------------
// MeditationTab
// ---------------------------------------------------------------------------

export function MeditationTab({ meditationDuration, setMeditationDuration, onStartMeditation }: MeditationTabProps) {
	return (
		<motion.div initial={false} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
			<div className="mb-6">
				<h3 className="flex items-center gap-2 font-semibold text-xl">
					<TimerIcon className="size-6 text-indigo-500" weight="duotone" />
					<Trans>Minuteur de meditation</Trans>
				</h3>
				<p className="text-muted-foreground">
					<Trans>Un minuteur simple pour vos seances de meditation ou de respiration libre</Trans>
				</p>
			</div>

			<div className="grid gap-6 md:grid-cols-2">
				{/* Duration Selection */}
				<Card>
					<CardHeader>
						<CardTitle className="text-lg">
							<Trans>Choisir la duree</Trans>
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="grid grid-cols-3 gap-3">
							{meditationDurations.map((seconds) => (
								<Button
									key={seconds}
									variant={meditationDuration === seconds ? "default" : "outline"}
									onClick={() => setMeditationDuration(seconds)}
									className="h-16"
								>
									<div className="text-center">
										<p className="font-bold text-lg">{Math.floor(seconds / 60)}</p>
										<p className="text-xs">min</p>
									</div>
								</Button>
							))}
						</div>
					</CardContent>
					<CardFooter>
						<Button className="w-full gap-2" onClick={onStartMeditation}>
							<PlayIcon className="size-4" />
							<Trans>Demarrer la meditation</Trans>
						</Button>
					</CardFooter>
				</Card>

				{/* Tips */}
				<Card className="bg-gradient-to-br from-indigo-500/10 to-purple-500/5">
					<CardHeader>
						<CardTitle className="text-lg">
							<Trans>Conseils pour mediter</Trans>
						</CardTitle>
					</CardHeader>
					<CardContent>
						<ul className="space-y-3 text-sm">
							<li className="flex gap-2">
								<CheckCircleIcon className="mt-0.5 size-4 shrink-0 text-green-500" />
								<span>
									<Trans>Trouvez un endroit calme et confortable</Trans>
								</span>
							</li>
							<li className="flex gap-2">
								<CheckCircleIcon className="mt-0.5 size-4 shrink-0 text-green-500" />
								<span>
									<Trans>Asseyez-vous ou allongez-vous confortablement</Trans>
								</span>
							</li>
							<li className="flex gap-2">
								<CheckCircleIcon className="mt-0.5 size-4 shrink-0 text-green-500" />
								<span>
									<Trans>Fermez les yeux et concentrez-vous sur votre respiration</Trans>
								</span>
							</li>
							<li className="flex gap-2">
								<CheckCircleIcon className="mt-0.5 size-4 shrink-0 text-green-500" />
								<span>
									<Trans>Laissez passer les pensées sans les juger</Trans>
								</span>
							</li>
							<li className="flex gap-2">
								<CheckCircleIcon className="mt-0.5 size-4 shrink-0 text-green-500" />
								<span>
									<Trans>Revenez doucement a votre respiration si votre esprit s'egare</Trans>
								</span>
							</li>
						</ul>
					</CardContent>
				</Card>
			</div>
		</motion.div>
	);
}

// ---------------------------------------------------------------------------
// ExerciseDialog
// ---------------------------------------------------------------------------

export function ExerciseDialog({ open, onOpenChange, selectedExercise, completeExercise }: ExerciseDialogProps) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-lg">
				<DialogHeader>
					<DialogTitle>{selectedExercise?.titleFr}</DialogTitle>
					<DialogDescription>{selectedExercise?.descriptionFr}</DialogDescription>
				</DialogHeader>

				{selectedExercise?.category === "breathing" && (
					<BreathingTimer
						exercise={selectedExercise}
						onComplete={() => {
							completeExercise(selectedExercise.id, selectedExercise.category);
						}}
					/>
				)}

				{(selectedExercise?.category === "power_poses" || selectedExercise?.category === "visualization") && (
					<div className="py-4">
						<h4 className="mb-4 font-medium">
							<Trans>Étapes à suivre :</Trans>
						</h4>
						<ol className="space-y-3">
							{selectedExercise?.stepsFr?.map((step, i) => (
								<li key={i} className="flex gap-3">
									<div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 font-medium text-primary text-sm">
										{i + 1}
									</div>
									<span>{step}</span>
								</li>
							))}
						</ol>

						<MeditationTimer
							duration={selectedExercise?.duration || 120}
							onComplete={() => {
								if (selectedExercise) {
									completeExercise(selectedExercise.id, selectedExercise.category);
								}
							}}
						/>
					</div>
				)}

				<DialogFooter>
					<Button variant="outline" onClick={() => onOpenChange(false)}>
						<Trans>Fermer</Trans>
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

// ---------------------------------------------------------------------------
// MeditationDialog
// ---------------------------------------------------------------------------

export function MeditationDialog({ open, onOpenChange, meditationDuration, onComplete }: MeditationDialogProps) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-md">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<FlowerLotusIcon className="size-5 text-indigo-500" />
						<Trans>Seance de meditation</Trans>
					</DialogTitle>
					<DialogDescription>
						<Trans>Detendez-vous et concentrez-vous sur votre respiration</Trans>
					</DialogDescription>
				</DialogHeader>

				<MeditationTimer duration={meditationDuration} onComplete={onComplete} />

				<DialogFooter>
					<Button variant="outline" onClick={() => onOpenChange(false)}>
						<Trans>Fermer</Trans>
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

// ---------------------------------------------------------------------------
// TabsHeader (the TabsList with all triggers)
// ---------------------------------------------------------------------------

export function ConfidenceTabsList() {
	return (
		<>
			<TabsTrigger
				value="breathing"
				className="flex items-center gap-2 rounded-lg border bg-card px-4 py-2.5 data-[state=active]:border-primary data-[state=active]:bg-primary/5"
			>
				<WindIcon className="size-4 text-blue-500" weight="duotone" />
				<Trans>Respiration</Trans>
			</TabsTrigger>
			<TabsTrigger
				value="affirmations"
				className="flex items-center gap-2 rounded-lg border bg-card px-4 py-2.5 data-[state=active]:border-primary data-[state=active]:bg-primary/5"
			>
				<SparkleIcon className="size-4 text-purple-500" weight="duotone" />
				<Trans>Affirmations</Trans>
			</TabsTrigger>
			<TabsTrigger
				value="power_poses"
				className="flex items-center gap-2 rounded-lg border bg-card px-4 py-2.5 data-[state=active]:border-primary data-[state=active]:bg-primary/5"
			>
				<HandFistIcon className="size-4 text-orange-500" weight="duotone" />
				<Trans>Postures</Trans>
			</TabsTrigger>
			<TabsTrigger
				value="visualization"
				className="flex items-center gap-2 rounded-lg border bg-card px-4 py-2.5 data-[state=active]:border-primary data-[state=active]:bg-primary/5"
			>
				<EyeIcon className="size-4 text-cyan-500" weight="duotone" />
				<Trans>Visualisation</Trans>
			</TabsTrigger>
			<TabsTrigger
				value="anxiety"
				className="flex items-center gap-2 rounded-lg border bg-card px-4 py-2.5 data-[state=active]:border-primary data-[state=active]:bg-primary/5"
			>
				<HeartIcon className="size-4 text-red-500" weight="duotone" />
				<Trans>Gestion du stress</Trans>
			</TabsTrigger>
			<TabsTrigger
				value="routine"
				className="flex items-center gap-2 rounded-lg border bg-card px-4 py-2.5 data-[state=active]:border-primary data-[state=active]:bg-primary/5"
			>
				<CalendarCheckIcon className="size-4 text-green-500" weight="duotone" />
				<Trans>Ma routine</Trans>
			</TabsTrigger>
			<TabsTrigger
				value="meditation"
				className="flex items-center gap-2 rounded-lg border bg-card px-4 py-2.5 data-[state=active]:border-primary data-[state=active]:bg-primary/5"
			>
				<TimerIcon className="size-4 text-indigo-500" weight="duotone" />
				<Trans>Meditation</Trans>
			</TabsTrigger>
		</>
	);
}
