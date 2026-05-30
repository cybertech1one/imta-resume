import { t } from "@lingui/core/macro";
import {
	BookmarkSimpleIcon,
	LightbulbIcon,
	ListBulletsIcon,
	MicrophoneIcon,
	PencilSimpleIcon,
	StarIcon,
} from "@phosphor-icons/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { ErrorComponent } from "@/components/error-component";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { authClient } from "@/integrations/auth/client";
import { orpc } from "@/integrations/orpc/client";

import { DashboardHeader } from "../-components/header";
import {
	BuilderTab,
	ExamplesTab,
	HeroSection,
	PracticeTab,
	SavedPitchesTab,
	TemplatesTab,
	TipsTab,
} from "./-components/elevator-pitch-components";
import {
	countWords,
	estimateTime,
	industryTemplates,
	pitchLengthConfig,
	pitchSteps,
} from "./-components/elevator-pitch-config";
import type { ContextType, Industry, PitchLength, SavedPitch } from "./-components/elevator-pitch-types";

// biome-ignore lint/suspicious/noExplicitAny: Route path not in generated route tree
export const Route = createFileRoute("/dashboard/tools/elevator-pitch" as any)({
	component: ElevatorPitchGenerator,
	errorComponent: ErrorComponent,
});

function ElevatorPitchGenerator() {
	const [activeTab, setActiveTab] = useState("builder");

	// Builder State
	const [currentStep, setCurrentStep] = useState(0);
	const [stepContents, setStepContents] = useState<Record<string, string>>({});
	const [selectedLength, setSelectedLength] = useState<PitchLength>("60s");
	const [selectedContext, setSelectedContext] = useState<ContextType>("interview");
	const [selectedIndustry, setSelectedIndustry] = useState<Industry>("general");

	// Recording State
	const [isRecording, setIsRecording] = useState(false);
	const [recordingTime, setRecordingTime] = useState(0);
	const [isPaused, setIsPaused] = useState(false);

	// Saved Pitches State (DB-backed)
	const [editingPitch, setEditingPitch] = useState<SavedPitch | null>(null);
	const [pitchName, setPitchName] = useState("");

	const { data: session } = authClient.useSession();
	const queryClient = useQueryClient();

	// Fetch saved pitches from DB
	const { data: dbPitches = [] } = useQuery({
		...orpc.elevatorPitch.list.queryOptions({ input: {} }),
		staleTime: 5 * 60 * 1000,
		enabled: !!session?.user,
	});

	// Convert DB pitches to the SavedPitch format
	const savedPitches = useMemo(
		() =>
			dbPitches.map((p) => ({
				id: p.id,
				name: p.name,
				content: p.content,
				length: p.length as PitchLength,
				context: p.context as ContextType,
				industry: p.industry as Industry,
				createdAt: new Date(p.createdAt),
				wordCount: p.wordCount ?? 0,
				estimatedTime: p.estimatedTime ?? 0,
			})),
		[dbPitches],
	);

	const createPitchMutation = useMutation({
		...orpc.elevatorPitch.create.mutationOptions(),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: orpc.elevatorPitch.list.queryOptions({ input: {} }).queryKey,
			});
			toast.success(t`Pitch enregistré`);
		},
		onError: () => toast.error(t`Impossible d'enregistrer le pitch`),
	});

	const updatePitchMutation = useMutation({
		...orpc.elevatorPitch.update.mutationOptions(),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: orpc.elevatorPitch.list.queryOptions({ input: {} }).queryKey,
			});
			toast.success(t`Pitch mis à jour`);
		},
		onError: () => toast.error(t`Impossible de mettre à jour le pitch`),
	});

	const deletePitchMutation = useMutation({
		...orpc.elevatorPitch.delete.mutationOptions(),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: orpc.elevatorPitch.list.queryOptions({ input: {} }).queryKey,
			});
			toast.success(t`Pitch supprimé`);
		},
		onError: () => toast.error(t`Impossible de supprimer le pitch`),
	});

	// Timer effect for recording
	useEffect(() => {
		let interval: ReturnType<typeof setInterval> | null = null;
		if (isRecording && !isPaused) {
			interval = setInterval(() => {
				setRecordingTime((prev) => prev + 1);
			}, 1000);
		}
		return () => {
			if (interval) clearInterval(interval);
		};
	}, [isRecording, isPaused]);

	// Computed values
	const generatedPitch = useMemo(() => {
		const guidedPitch = pitchSteps
			.map((step) => stepContents[step.id] || "")
			.filter(Boolean)
			.join(" ");
		return guidedPitch || stepContents.custom || "";
	}, [stepContents]);

	const wordCount = useMemo(() => countWords(generatedPitch), [generatedPitch]);
	const estimatedSeconds = useMemo(() => estimateTime(wordCount), [wordCount]);
	const targetWords = pitchLengthConfig[selectedLength].words;
	const targetSeconds = pitchLengthConfig[selectedLength].seconds;
	const progressPercent = Math.min((wordCount / targetWords) * 100, 100);

	const isOverLimit = wordCount > targetWords * 1.2;
	const isUnderLimit = wordCount < targetWords * 0.5 && wordCount > 0;

	// Handlers
	const handleStepChange = useCallback((stepId: string, content: string) => {
		setStepContents((prev) => ({
			...prev,
			custom: "",
			[stepId]: content,
		}));
	}, []);

	const handleNextStep = useCallback(() => {
		if (currentStep < pitchSteps.length - 1) {
			setCurrentStep((prev) => prev + 1);
		}
	}, [currentStep]);

	const handlePrevStep = useCallback(() => {
		if (currentStep > 0) {
			setCurrentStep((prev) => prev - 1);
		}
	}, [currentStep]);

	const handleApplyTemplate = useCallback(() => {
		const template = industryTemplates.find((t) => t.industry === selectedIndustry);
		if (template) {
			const templateContent = template.templates[selectedLength];
			// Parse template into steps (simplified - you could make this smarter)
			setStepContents({
				hook: "",
				who: `${templateContent.split(".")[0]}.`,
				what: templateContent.split(".").slice(1, 3).join("."),
				why: templateContent.split(".").slice(3, 4).join("."),
				cta: templateContent.split(".").slice(-1)[0],
			});
			toast.success(t`Modèle appliqué`);
		}
	}, [selectedIndustry, selectedLength]);

	const handleSavePitch = useCallback(() => {
		if (!generatedPitch.trim()) {
			toast.error(t`Créez un pitch avant de l'enregistrer`);
			return;
		}

		if (editingPitch) {
			updatePitchMutation.mutate({
				id: editingPitch.id,
				name: pitchName || `Pitch ${new Date().toLocaleDateString("fr-FR")}`,
				content: generatedPitch,
				length: selectedLength,
				context: selectedContext,
				industry: selectedIndustry,
				wordCount,
				estimatedTime: estimatedSeconds,
			});
		} else {
			createPitchMutation.mutate({
				name: pitchName || `Pitch ${new Date().toLocaleDateString("fr-FR")}`,
				content: generatedPitch,
				length: selectedLength,
				context: selectedContext,
				industry: selectedIndustry,
				wordCount,
				estimatedTime: estimatedSeconds,
			});
		}

		setPitchName("");
		setEditingPitch(null);
	}, [
		generatedPitch,
		pitchName,
		selectedLength,
		selectedContext,
		selectedIndustry,
		wordCount,
		estimatedSeconds,
		editingPitch,
		createPitchMutation,
		updatePitchMutation,
	]);

	const handleLoadPitch = useCallback((pitch: SavedPitch) => {
		setEditingPitch(pitch);
		setPitchName(pitch.name);
		setSelectedLength(pitch.length);
		setSelectedContext(pitch.context);
		setSelectedIndustry(pitch.industry);
		// Simple content loading - could be improved with proper parsing
		setStepContents({ custom: pitch.content });
		setActiveTab("builder");
		toast.info(t`Pitch chargé pour modification`);
	}, []);

	const handleDeletePitch = useCallback(
		(pitchId: string) => {
			deletePitchMutation.mutate({ id: pitchId });
		},
		[deletePitchMutation],
	);

	const handleCopyPitch = useCallback(() => {
		navigator.clipboard.writeText(generatedPitch);
		toast.success(t`Pitch copié`);
	}, [generatedPitch]);

	const handleStartRecording = useCallback(() => {
		setIsRecording(true);
		setRecordingTime(0);
		setIsPaused(false);
	}, []);

	const handleStopRecording = useCallback(() => {
		setIsRecording(false);
		setIsPaused(false);
		const targetTime = pitchLengthConfig[selectedLength].seconds;
		if (recordingTime < targetTime * 0.8) {
			toast.info(t`Vous avez terminé en ${recordingTime}s. Parlez un peu plus lentement.`);
		} else if (recordingTime > targetTime * 1.2) {
			toast.info(t`Vous avez pris ${recordingTime}s. Essayez de raccourcir le pitch.`);
		} else {
			toast.success(t`Très bon timing : ${recordingTime}s pour un objectif de ${targetTime}s`);
		}
	}, [recordingTime, selectedLength]);

	const handlePauseRecording = useCallback(() => {
		setIsPaused((prev) => !prev);
	}, []);

	const formatTime = useCallback((seconds: number): string => {
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return `${mins}:${secs.toString().padStart(2, "0")}`;
	}, []);

	return (
		<>
			<DashboardHeader icon={MicrophoneIcon} title={t`Pitch entretien`} />

			<HeroSection />

			{/* Main Tabs */}
			<Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
				<TabsList className="flex h-auto flex-wrap gap-2 bg-transparent p-0">
					{[
						{ value: "builder", icon: PencilSimpleIcon, label: t`Créer` },
						{ value: "templates", icon: ListBulletsIcon, label: t`Modèles` },
						{ value: "practice", icon: MicrophoneIcon, label: t`S'entraîner` },
						{ value: "tips", icon: LightbulbIcon, label: t`Conseils` },
						{ value: "examples", icon: StarIcon, label: t`Exemples` },
						{ value: "saved", icon: BookmarkSimpleIcon, label: t`Enregistrés` },
					].map((tab) => (
						<TabsTrigger
							key={tab.value}
							value={tab.value}
							className="gap-2 rounded-full border border-transparent bg-muted/50 px-6 py-2.5 data-[state=active]:border-primary/30 data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
						>
							<tab.icon className="size-4" />
							{tab.label}
						</TabsTrigger>
					))}
				</TabsList>

				{/* Builder Tab */}
				<TabsContent value="builder" className="space-y-8">
					<BuilderTab
						currentStep={currentStep}
						setCurrentStep={setCurrentStep}
						stepContents={stepContents}
						selectedLength={selectedLength}
						setSelectedLength={setSelectedLength}
						selectedContext={selectedContext}
						setSelectedContext={setSelectedContext}
						selectedIndustry={selectedIndustry}
						setSelectedIndustry={setSelectedIndustry}
						generatedPitch={generatedPitch}
						wordCount={wordCount}
						estimatedSeconds={estimatedSeconds}
						targetWords={targetWords}
						targetSeconds={targetSeconds}
						progressPercent={progressPercent}
						isOverLimit={isOverLimit}
						isUnderLimit={isUnderLimit}
						pitchName={pitchName}
						setPitchName={setPitchName}
						editingPitch={editingPitch}
						onStepChange={handleStepChange}
						onNextStep={handleNextStep}
						onPrevStep={handlePrevStep}
						onApplyTemplate={handleApplyTemplate}
						onCopyPitch={handleCopyPitch}
						onSavePitch={handleSavePitch}
					/>
				</TabsContent>

				{/* Templates Tab */}
				<TabsContent value="templates" className="space-y-8">
					<TemplatesTab />
				</TabsContent>

				{/* Practice Tab */}
				<TabsContent value="practice" className="space-y-8">
					<PracticeTab
						isRecording={isRecording}
						recordingTime={recordingTime}
						isPaused={isPaused}
						selectedLength={selectedLength}
						generatedPitch={generatedPitch}
						wordCount={wordCount}
						estimatedSeconds={estimatedSeconds}
						formatTime={formatTime}
						onStartRecording={handleStartRecording}
						onStopRecording={handleStopRecording}
						onPauseRecording={handlePauseRecording}
						onGoToBuilder={() => setActiveTab("builder")}
					/>
				</TabsContent>

				{/* Tips Tab */}
				<TabsContent value="tips" className="space-y-8">
					<TipsTab />
				</TabsContent>

				{/* Examples Tab */}
				<TabsContent value="examples" className="space-y-8">
					<ExamplesTab />
				</TabsContent>

				{/* Saved Pitches Tab */}
				<TabsContent value="saved" className="space-y-8">
					<SavedPitchesTab
						savedPitches={savedPitches}
						onLoadPitch={handleLoadPitch}
						onDeletePitch={handleDeletePitch}
						onGoToBuilder={() => setActiveTab("builder")}
					/>
				</TabsContent>
			</Tabs>
		</>
	);
}
