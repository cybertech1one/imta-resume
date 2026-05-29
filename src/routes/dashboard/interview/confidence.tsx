import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { FlowerLotusIcon } from "@phosphor-icons/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import { ErrorComponent } from "@/components/error-component";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList } from "@/components/ui/tabs";
import { authClient } from "@/integrations/auth/client";
import { orpc } from "@/integrations/orpc/client";

import { DashboardHeader } from "../-components/header";
import {
	AffirmationsTab,
	AnxietyTab,
	BreathingTab,
	ConfidenceTabsList,
	ExerciseDialog,
	HeroSection,
	MeditationDialog,
	MeditationTab,
	PowerPosesTab,
	ProgressOverview,
	RoutineTab,
	VisualizationTab,
} from "./-components/confidence-components";
import { affirmations, defaultExerciseStats } from "./-components/confidence-config";
import type { Exercise, ExerciseCategory, ExerciseStats } from "./-components/confidence-types";

// biome-ignore lint/suspicious/noExplicitAny: Route path not in generated route tree
export const Route = createFileRoute("/dashboard/interview/confidence" as any)({
	component: ConfidenceExercisesPage,
	errorComponent: ErrorComponent,
});

function ConfidenceExercisesPage() {
	const queryClient = useQueryClient();
	const { data: session } = authClient.useSession();

	// State
	const [activeTab, setActiveTab] = useState<string>("breathing");
	const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
	const [isExerciseDialogOpen, setIsExerciseDialogOpen] = useState(false);
	const [meditationDuration, setMeditationDuration] = useState(300);
	const [isMeditationDialogOpen, setIsMeditationDialogOpen] = useState(false);
	const [currentAffirmationIndex, setCurrentAffirmationIndex] = useState(0);

	// Query for stats
	const {
		data: stats,
		isLoading: isLoadingStats,
		error: statsError,
	} = useQuery({ ...orpc.confidenceExercises.getStats.queryOptions(), enabled: !!session?.user });

	// Query for completed today
	const { data: completedToday = [], isLoading: isLoadingCompleted } = useQuery({
		...orpc.confidenceExercises.getCompletedToday.queryOptions(),
		enabled: !!session?.user,
	});

	// Query for daily routine
	const { data: dailyRoutine = [], isLoading: isLoadingRoutine } = useQuery({
		...orpc.confidenceExercises.getDailyRoutine.queryOptions(),
		enabled: !!session?.user,
	});

	// Mutation for completing exercise
	const completeExerciseMutation = useMutation(
		orpc.confidenceExercises.completeExercise.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries({ queryKey: ["confidenceExercises"] });
				toast.success(t`Exercice termine ! Bravo !`);
			},
			onError: () => {
				toast.error(t`Erreur lors de la validation de l'exercice`);
			},
		}),
	);

	// Mutation for adding to routine
	const addToRoutineMutation = useMutation(
		orpc.confidenceExercises.addToRoutine.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries({ queryKey: ["confidenceExercises"] });
				toast.success(t`Ajoute a votre routine quotidienne`);
			},
			onError: (error) => {
				if (error.message?.includes("already")) {
					toast.error(t`Cet exercice est déjà dans votre routine`);
				} else {
					toast.error(t`Erreur lors de l'ajout a la routine`);
				}
			},
		}),
	);

	// Mutation for removing from routine
	const removeFromRoutineMutation = useMutation(
		orpc.confidenceExercises.removeFromRoutine.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries({ queryKey: ["confidenceExercises"] });
				toast.success(t`Retire de votre routine`);
			},
			onError: () => {
				toast.error(t`Erreur pendant la suppression`);
			},
		}),
	);

	// Mutation for clearing routine
	const clearRoutineMutation = useMutation(
		orpc.confidenceExercises.clearRoutine.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries({ queryKey: ["confidenceExercises"] });
			},
		}),
	);

	// Mark exercise as complete
	const completeExercise = useCallback(
		(exerciseId: string, category: ExerciseCategory) => {
			completeExerciseMutation.mutate({ exerciseId, category });
		},
		[completeExerciseMutation],
	);

	// Add to daily routine
	const addToRoutine = useCallback(
		(exerciseId: string) => {
			addToRoutineMutation.mutate({ exerciseId });
		},
		[addToRoutineMutation],
	);

	// Remove from routine
	const removeFromRoutine = useCallback(
		(exerciseId: string) => {
			removeFromRoutineMutation.mutate({ exerciseId });
		},
		[removeFromRoutineMutation],
	);

	// Routine progress
	const routineProgress = useMemo(() => {
		if (dailyRoutine.length === 0) return 0;
		const completed = dailyRoutine.filter((item) => item.completed).length;
		return Math.round((completed / dailyRoutine.length) * 100);
	}, [dailyRoutine]);

	// Next affirmation
	const nextAffirmation = useCallback(() => {
		setCurrentAffirmationIndex((prev) => (prev + 1) % affirmations.length);
	}, []);

	// Previous affirmation
	const prevAffirmation = useCallback(() => {
		setCurrentAffirmationIndex((prev) => (prev - 1 + affirmations.length) % affirmations.length);
	}, []);

	// Check if exercise was completed today
	const isCompletedToday = useCallback(
		(exerciseId: string) => {
			return completedToday.includes(exerciseId);
		},
		[completedToday],
	);

	// Handler to open exercise dialog
	const openExerciseDialog = useCallback((exercise: Exercise) => {
		setSelectedExercise(exercise);
		setIsExerciseDialogOpen(true);
	}, []);

	// Default stats
	const currentStats: ExerciseStats = stats ?? defaultExerciseStats;

	const isLoading = isLoadingStats || isLoadingCompleted || isLoadingRoutine;

	// Error state
	if (statsError && !isLoading) {
		return (
			<>
				<DashboardHeader icon={FlowerLotusIcon} title={t`Exercices de confiance`} />
				<Card className="border-destructive">
					<CardContent className="pt-6">
						<p className="text-center text-destructive">
							<Trans>Erreur de chargement des données</Trans>
						</p>
					</CardContent>
				</Card>
			</>
		);
	}

	return (
		<>
			<DashboardHeader icon={FlowerLotusIcon} title={t`Exercices de confiance`} />

			<HeroSection currentStats={currentStats} />

			<ProgressOverview currentStats={currentStats} />

			{/* Main Content Tabs */}
			<Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
				<TabsList className="flex h-auto flex-wrap justify-start gap-2 bg-transparent p-0">
					<ConfidenceTabsList />
				</TabsList>

				<TabsContent value="breathing" className="mt-0">
					<BreathingTab
						isCompletedToday={isCompletedToday}
						addToRoutine={addToRoutine}
						addToRoutinePending={addToRoutineMutation.isPending}
						onSelectExercise={openExerciseDialog}
					/>
				</TabsContent>

				<TabsContent value="affirmations" className="mt-0">
					<AffirmationsTab
						currentAffirmationIndex={currentAffirmationIndex}
						setCurrentAffirmationIndex={setCurrentAffirmationIndex}
						nextAffirmation={nextAffirmation}
						prevAffirmation={prevAffirmation}
						completeExercise={completeExercise}
						completeExercisePending={completeExerciseMutation.isPending}
					/>
				</TabsContent>

				<TabsContent value="power_poses" className="mt-0">
					<PowerPosesTab
						isCompletedToday={isCompletedToday}
						addToRoutine={addToRoutine}
						addToRoutinePending={addToRoutineMutation.isPending}
						onSelectExercise={openExerciseDialog}
					/>
				</TabsContent>

				<TabsContent value="visualization" className="mt-0">
					<VisualizationTab
						isCompletedToday={isCompletedToday}
						addToRoutine={addToRoutine}
						addToRoutinePending={addToRoutineMutation.isPending}
						onSelectExercise={openExerciseDialog}
					/>
				</TabsContent>

				<TabsContent value="anxiety" className="mt-0">
					<AnxietyTab
						completeExercise={completeExercise}
						completeExercisePending={completeExerciseMutation.isPending}
					/>
				</TabsContent>

				<TabsContent value="routine" className="mt-0">
					<RoutineTab
						dailyRoutine={dailyRoutine}
						routineProgress={routineProgress}
						clearRoutinePending={clearRoutineMutation.isPending}
						removeFromRoutinePending={removeFromRoutineMutation.isPending}
						onClearRoutine={() => clearRoutineMutation.mutate({})}
						onRemoveFromRoutine={removeFromRoutine}
						onSelectExercise={openExerciseDialog}
						setActiveTab={setActiveTab}
					/>
				</TabsContent>

				<TabsContent value="meditation" className="mt-0">
					<MeditationTab
						meditationDuration={meditationDuration}
						setMeditationDuration={setMeditationDuration}
						onStartMeditation={() => setIsMeditationDialogOpen(true)}
					/>
				</TabsContent>
			</Tabs>

			<ExerciseDialog
				open={isExerciseDialogOpen}
				onOpenChange={setIsExerciseDialogOpen}
				selectedExercise={selectedExercise}
				completeExercise={completeExercise}
			/>

			<MeditationDialog
				open={isMeditationDialogOpen}
				onOpenChange={setIsMeditationDialogOpen}
				meditationDuration={meditationDuration}
				onComplete={() => {
					completeExercise("meditation", "breathing");
					toast.success(t`Meditation terminee ! Bravo !`);
				}}
			/>
		</>
	);
}
