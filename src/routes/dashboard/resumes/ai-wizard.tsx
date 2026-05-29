import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { SparkleIcon, WarningIcon } from "@phosphor-icons/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { ErrorComponent } from "@/components/error-component";
import { authClient } from "@/integrations/auth/client";
import { orpc } from "@/integrations/orpc/client";
import type { ResumeData } from "@/schema/resume/data";
import { DashboardHeader } from "../-components/header";
import {
	AdaptToJobView,
	AiChatView,
	GapAnalysisView,
	GenerateResumeView,
	ModeSelector,
	ResumeSelector,
	StepIndicator,
} from "./-components/ai-wizard-components";
import type {
	AdaptResult,
	ChatMessage,
	GapAnalysisResult,
	GapSeverity,
	GenerateFormData,
	WizardMode,
	WizardStep,
} from "./-components/ai-wizard-types";

// biome-ignore lint/suspicious/noExplicitAny: Route path not in generated route tree
export const Route = createFileRoute("/dashboard/resumes/ai-wizard" as any)({
	component: AiWizardPage,
	errorComponent: ErrorComponent,
});

const SEVERITY_MAP: Record<string, GapSeverity> = {
	high: "critical",
	medium: "major",
	low: "minor",
};

/**
 * Merge adapted sections from the AI into existing ResumeData.
 * Only overwrites sections that the AI actually returned content for.
 */
function mergeAdaptations(
	existing: Record<string, unknown>,
	adapted: AdaptResult["rawAdaptedSections"],
): Record<string, unknown> {
	if (!adapted) return existing;

	const merged = structuredClone(existing) as Record<string, unknown>;
	const basics = (merged.basics ?? {}) as Record<string, unknown>;
	const summary = (merged.summary ?? {}) as Record<string, unknown>;
	const sections = (merged.sections ?? {}) as Record<string, unknown>;

	// Merge headline
	if (adapted.headline) {
		basics.headline = adapted.headline;
		merged.basics = basics;
	}

	// Merge summary
	if (adapted.summary) {
		summary.content = adapted.summary;
		merged.summary = summary;
	}

	// Merge skills — add new skill groups from AI
	if (adapted.skills && adapted.skills.length > 0) {
		const existingSkills = (sections.skills ?? {}) as Record<string, unknown>;
		const existingItems = (Array.isArray(existingSkills.items) ? existingSkills.items : []) as Record<
			string,
			unknown
		>[];

		const existingNames = new Set(existingItems.map((item) => String(item.name ?? "").toLowerCase()));

		const newItems = adapted.skills
			.filter((s) => !existingNames.has(s.name.toLowerCase()))
			.map((s) => ({
				id: crypto.randomUUID(),
				hidden: false,
				icon: "",
				name: s.name,
				proficiency: "",
				level: 0,
				keywords: s.keywords,
			}));

		sections.skills = {
			...existingSkills,
			items: [...existingItems, ...newItems],
		};
		merged.sections = sections;
	}

	// Merge experience highlights — append as description to existing experience items
	if (adapted.experienceHighlights && adapted.experienceHighlights.length > 0) {
		const existingExp = (sections.experience ?? {}) as Record<string, unknown>;
		const expItems = (Array.isArray(existingExp.items) ? existingExp.items : []) as Record<string, unknown>[];

		if (expItems.length > 0) {
			// Enhance the first experience item's description with highlights
			const firstItem = { ...expItems[0] };
			const currentDesc = String(firstItem.description ?? "");
			const highlightsHtml = "<ul>" + adapted.experienceHighlights.map((h) => `<li>${h}</li>`).join("") + "</ul>";
			firstItem.description = currentDesc ? `${currentDesc}\n${highlightsHtml}` : highlightsHtml;
			expItems[0] = firstItem;
		}

		sections.experience = {
			...existingExp,
			items: expItems,
		};
		merged.sections = sections;
	}

	return merged;
}

function AiWizardPage() {
	const { data: session } = authClient.useSession();
	const navigate = useNavigate();
	const queryClient = useQueryClient();

	const [step, setStep] = useState<WizardStep>("select-mode");
	const [selectedResumeId, setSelectedResumeId] = useState<string | null>(null);
	const [selectedMode, setSelectedMode] = useState<WizardMode | null>(null);

	// Gap analysis state
	const [targetRole, setTargetRole] = useState("");
	const [gapResult, setGapResult] = useState<GapAnalysisResult | null>(null);
	const [hasAppliedGapFixes, setHasAppliedGapFixes] = useState(false);

	// Adapt to job state
	const [jobDescription, setJobDescription] = useState("");
	const [adaptResult, setAdaptResult] = useState<AdaptResult | null>(null);
	const [hasAppliedAdaptations, setHasAppliedAdaptations] = useState(false);

	// Chat state
	const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
	const [chatInput, setChatInput] = useState("");

	// Generate state
	const [generateForm, setGenerateForm] = useState<GenerateFormData>({
		fullName: "",
		email: "",
		phone: "",
		targetJob: "",
		yearsExperience: "",
		skills: "",
		education: "",
		experience: "",
		language: "fr",
	});

	// Queries
	const { data: resumes = [], isPending: isLoadingResumes } = useQuery({
		...orpc.resume.list.queryOptions({ input: { tags: [], sort: "lastUpdatedAt" } }),
		staleTime: 3 * 60 * 1000,
		gcTime: 10 * 60 * 1000,
		enabled: !!session?.user,
	});

	const { data: aiStatus } = useQuery(orpc.aiConfig.status.check.queryOptions());

	const { data: selectedResume } = useQuery({
		...orpc.resume.getById.queryOptions({ input: { id: selectedResumeId! } }),
		enabled: !!session?.user && !!selectedResumeId,
	});

	const getSelectedResumeData = useCallback(() => {
		return selectedResume?.data as Record<string, unknown> | undefined;
	}, [selectedResume]);

	// =========================================================================
	// MUTATIONS
	// =========================================================================

	// Resume import (for generate mode)
	const importResumeMutation = useMutation(
		orpc.resume.import.mutationOptions({
			onSuccess: (newId: string) => {
				queryClient.invalidateQueries({ queryKey: ["resume"] });
				toast.success(t`CV genere avec succes !`);
				navigate({ to: "/builder/$resumeId" as string, params: { resumeId: newId } } as any);
			},
			onError: () => {
				toast.error(t`Erreur lors de la creation du CV.`);
			},
		}),
	);

	// Resume update (for apply fixes / apply adaptations)
	const updateResumeMutation = useMutation(
		orpc.resume.update.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries({ queryKey: ["resume"] });
			},
			onError: () => {
				toast.error(t`Erreur lors de la mise a jour du CV.`);
			},
		}),
	);

	// Generate resume AI endpoint
	const generateResumeMutation = useMutation(
		orpc.ai.generateResume.mutationOptions({
			// biome-ignore lint/suspicious/noExplicitAny: ORPC inferred types need mapping
			onSuccess: (data: any) => {
				const resumeData = data.resumeData as ResumeData;
				importResumeMutation.mutate({ data: resumeData } as any);
			},
			onError: () => {
				toast.error(t`Erreur lors de la generation du CV. Verifiez la configuration IA.`);
			},
		}),
	);

	// Gap analysis mutation
	const gapAnalysisMutation = useMutation(
		orpc.ai.resumeGapAnalysis.mutationOptions({
			// biome-ignore lint/suspicious/noExplicitAny: ORPC inferred types need mapping
			onSuccess: (data: any) => {
				const mapped: GapAnalysisResult = {
					overallScore: data.overallScore ?? 0,
					// biome-ignore lint/suspicious/noExplicitAny: mapping backend gap items
					gaps: (data.gaps ?? []).map((g: any) => ({
						section: g.section,
						description: g.issue ?? g.description ?? "",
						severity: SEVERITY_MAP[g.severity] ?? "minor",
						suggestion: g.suggestion,
					})),
					strengths: data.strengths ?? [],
					recommendations: data.recommendations ?? [],
				};
				setGapResult(mapped);
				setHasAppliedGapFixes(false);
				toast.success(t`Analyse terminee`);
			},
			onError: () => {
				toast.error(t`L'analyse a echoue. Verifiez la configuration IA.`);
			},
		}),
	);

	// Apply gap fixes mutation
	const applyGapFixesMutation = useMutation(
		orpc.ai.applyGapFixes.mutationOptions({
			// biome-ignore lint/suspicious/noExplicitAny: ORPC inferred types need mapping
			onSuccess: (data: any) => {
				if (!selectedResumeId) return;
				const fixedData = data.resumeData as ResumeData;
				updateResumeMutation.mutate({ id: selectedResumeId, data: fixedData } as any, {
					onSuccess: () => {
						setHasAppliedGapFixes(true);
						toast.success(t`Corrections appliquees a votre CV !`);
					},
				});
			},
			onError: () => {
				toast.error(t`Erreur lors de l'application des corrections.`);
			},
		}),
	);

	// Adapt to job mutation
	const adaptMutation = useMutation(
		orpc.ai.adaptResumeToJob.mutationOptions({
			// biome-ignore lint/suspicious/noExplicitAny: ORPC inferred types need mapping
			onSuccess: (data: any) => {
				const adaptedSections: AdaptResult["adaptedSections"] = [];
				const sections = data.adaptedSections ?? {};
				if (sections.summary) {
					adaptedSections.push({ section: "Resume", original: "", adapted: sections.summary });
				}
				if (sections.headline) {
					adaptedSections.push({ section: "Titre", original: "", adapted: sections.headline });
				}
				if (sections.experienceHighlights?.length) {
					adaptedSections.push({
						section: "Experience",
						original: "",
						adapted: sections.experienceHighlights.join("\n"),
					});
				}
				if (sections.skills?.length) {
					// biome-ignore lint/suspicious/noExplicitAny: mapping backend skill items
					const skillText = sections.skills.map((s: any) => `${s.name}: ${s.keywords?.join(", ") ?? ""}`).join("\n");
					adaptedSections.push({ section: "Competences", original: "", adapted: skillText });
				}

				const mapped: AdaptResult = {
					matchScore: data.matchScore ?? 0,
					keywordsMatched: data.keywordsMatched ?? [],
					keywordsMissing: data.keywordsToAdd ?? [],
					adaptedSections,
					rawAdaptedSections: sections,
				};
				setAdaptResult(mapped);
				setHasAppliedAdaptations(false);
				toast.success(t`CV adapte avec succes`);
			},
			onError: () => {
				toast.error(t`L'adaptation a echoue. Verifiez la configuration IA.`);
			},
		}),
	);

	// Chat mutation
	const chatMutation = useMutation(
		orpc.ai.resumeWizardChat.mutationOptions({
			// biome-ignore lint/suspicious/noExplicitAny: ORPC inferred types need mapping
			onSuccess: (data: any) => {
				const assistantMsg: ChatMessage = {
					id: crypto.randomUUID(),
					role: "assistant",
					content: data.response ?? "",
					timestamp: new Date(),
				};
				setChatMessages((prev) => [...prev, assistantMsg]);
			},
			onError: () => {
				toast.error(t`Erreur de l'IA`);
			},
		}),
	);

	// =========================================================================
	// HANDLERS
	// =========================================================================

	const handleResumeSelect = useCallback((id: string) => {
		setSelectedResumeId(id);
	}, []);

	const handleModeSelect = useCallback((mode: WizardMode) => {
		setSelectedMode(mode);
	}, []);

	const goToStep = useCallback((newStep: WizardStep) => {
		setStep(newStep);
	}, []);

	const handleModeNext = useCallback(() => {
		if (!selectedMode) return;
		// Generate mode skips resume selection
		if (selectedMode === "generate") {
			goToStep("execute");
		} else {
			goToStep("select-resume");
		}
	}, [selectedMode, goToStep]);

	const handleGenerateFormChange = useCallback((field: keyof GenerateFormData, value: string) => {
		setGenerateForm((prev) => ({ ...prev, [field]: value }));
	}, []);

	const handleGenerate = useCallback(() => {
		const skills = generateForm.skills
			.split(",")
			.map((s) => s.trim())
			.filter(Boolean);

		generateResumeMutation.mutate({
			fullName: generateForm.fullName.trim(),
			email: generateForm.email.trim() || undefined,
			phone: generateForm.phone.trim() || undefined,
			targetJob: generateForm.targetJob.trim(),
			yearsExperience: generateForm.yearsExperience ? Number(generateForm.yearsExperience) : undefined,
			skills,
			education: generateForm.education.trim() || undefined,
			experience: generateForm.experience.trim() || undefined,
			language: generateForm.language,
		} as any);
	}, [generateForm, generateResumeMutation]);

	const handleApplyGapFixes = useCallback(() => {
		if (!gapResult || !selectedResumeId) return;
		const resumeData = getSelectedResumeData();
		if (!resumeData) return toast.error(t`Donnees du CV introuvables`);

		applyGapFixesMutation.mutate({
			resumeData,
			gaps: gapResult.gaps.map((g) => ({
				section: g.section,
				issue: g.description,
				severity: g.severity === "critical" ? "high" : g.severity === "major" ? "medium" : "low",
				suggestion: g.suggestion,
			})),
			recommendations: gapResult.recommendations,
			targetRole: targetRole || undefined,
		} as any);
	}, [gapResult, selectedResumeId, getSelectedResumeData, applyGapFixesMutation, targetRole]);

	const handleApplyAdaptations = useCallback(() => {
		if (!adaptResult?.rawAdaptedSections || !selectedResumeId) return;
		const resumeData = getSelectedResumeData();
		if (!resumeData) return toast.error(t`Donnees du CV introuvables`);

		const mergedData = mergeAdaptations(resumeData, adaptResult.rawAdaptedSections);

		updateResumeMutation.mutate({ id: selectedResumeId, data: mergedData as ResumeData } as any, {
			onSuccess: () => {
				setHasAppliedAdaptations(true);
				toast.success(t`Adaptations appliquees a votre CV !`);
			},
		});
	}, [adaptResult, selectedResumeId, getSelectedResumeData, updateResumeMutation]);

	const handleOpenEditor = useCallback(() => {
		if (!selectedResumeId) return;
		navigate({ to: "/builder/$resumeId" as string, params: { resumeId: selectedResumeId } } as any);
	}, [selectedResumeId, navigate]);

	const handleSendChat = useCallback(() => {
		if (!chatInput.trim()) return;
		const userMsg: ChatMessage = {
			id: crypto.randomUUID(),
			role: "user",
			content: chatInput.trim(),
			timestamp: new Date(),
		};
		setChatMessages((prev) => [...prev, userMsg]);
		const resumeData = getSelectedResumeData();
		const chatContext = chatMessages.map((m) => `${m.role}: ${m.content}`).join("\n");
		chatMutation.mutate({
			resumeData: resumeData ?? undefined,
			message: chatInput.trim(),
			context: chatContext || undefined,
		} as any);
		setChatInput("");
	}, [chatInput, chatMutation, chatMessages, getSelectedResumeData]);

	const handleApplySuggestion = useCallback((suggestion: ChatMessage["suggestion"]) => {
		if (suggestion) {
			navigator.clipboard.writeText(suggestion.improved);
			toast.success(t`Suggestion copiee dans le presse-papiers`);
		}
	}, []);

	const resumeItems = resumes.map((r) => ({ id: r.id, title: r.name }));

	const isGenerating = generateResumeMutation.isPending || importResumeMutation.isPending;
	const isApplyingGapFixes = applyGapFixesMutation.isPending || updateResumeMutation.isPending;
	const isApplyingAdaptations = updateResumeMutation.isPending;

	return (
		<div className="space-y-6">
			<DashboardHeader
				title={t`Assistant CV IA`}
				icon={SparkleIcon}
				subtitle={t`Generez et ameliorez vos CV avec l'intelligence artificielle`}
			/>

			<div className="mx-auto w-full max-w-4xl px-4 pb-12 sm:px-6">
				{aiStatus && !aiStatus.available && (
					<div className="mb-6 flex items-center gap-3 rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 text-sm">
						<WarningIcon className="size-5 shrink-0 text-amber-600 dark:text-amber-400" />
						<p className="text-amber-800 dark:text-amber-200">
							<Trans>
								Les fonctionnalites IA ne sont pas configurees. Demandez a un administrateur de configurer un
								fournisseur IA.
							</Trans>
						</p>
					</div>
				)}

				<div className="mb-8">
					<StepIndicator currentStep={step} mode={selectedMode} />
				</div>

				{/* Step 1: Mode Selection (first for all modes) */}
				{step === "select-mode" && (
					<ModeSelector selectedMode={selectedMode} onSelect={handleModeSelect} onNext={handleModeNext} />
				)}

				{/* Step 2: Resume Selection (skipped for generate mode) */}
				{step === "select-resume" && (
					<ResumeSelector
						resumes={resumeItems}
						selectedResumeId={selectedResumeId}
						onSelect={handleResumeSelect}
						onNext={() => goToStep("execute")}
						onBack={() => goToStep("select-mode")}
						isLoading={isLoadingResumes}
					/>
				)}

				{/* Step 3: Execute — Generate Resume */}
				{step === "execute" && selectedMode === "generate" && (
					<GenerateResumeView
						formData={generateForm}
						onFormChange={handleGenerateFormChange}
						onGenerate={handleGenerate}
						isPending={isGenerating}
						onBack={() => goToStep("select-mode")}
					/>
				)}

				{/* Step 3: Execute — Gap Analysis */}
				{step === "execute" && selectedMode === "gap-analysis" && (
					<GapAnalysisView
						result={gapResult}
						targetRole={targetRole}
						onTargetRoleChange={setTargetRole}
						onAnalyze={() => {
							const resumeData = getSelectedResumeData();
							if (!resumeData) return toast.error(t`Donnees du CV introuvables`);
							gapAnalysisMutation.mutate({
								resumeData,
								targetRole: targetRole || undefined,
							} as any);
						}}
						onApplyFixes={handleApplyGapFixes}
						isPending={gapAnalysisMutation.isPending}
						isApplying={isApplyingGapFixes}
						onBack={() => goToStep("select-resume")}
						onOpenEditor={handleOpenEditor}
						hasApplied={hasAppliedGapFixes}
					/>
				)}

				{/* Step 3: Execute — Adapt to Job */}
				{step === "execute" && selectedMode === "adapt-to-job" && (
					<AdaptToJobView
						result={adaptResult}
						jobDescription={jobDescription}
						onJobDescriptionChange={setJobDescription}
						onAdapt={() => {
							const resumeData = getSelectedResumeData();
							if (!resumeData) return toast.error(t`Donnees du CV introuvables`);
							adaptMutation.mutate({
								resumeData,
								jobDescription,
								language: "fr",
							} as any);
						}}
						onApplyAdaptations={handleApplyAdaptations}
						isPending={adaptMutation.isPending}
						isApplying={isApplyingAdaptations}
						onBack={() => goToStep("select-resume")}
						onOpenEditor={handleOpenEditor}
						hasApplied={hasAppliedAdaptations}
					/>
				)}

				{/* Step 3: Execute — AI Chat */}
				{step === "execute" && selectedMode === "ai-chat" && (
					<AiChatView
						messages={chatMessages}
						input={chatInput}
						onInputChange={setChatInput}
						onSend={handleSendChat}
						isPending={chatMutation.isPending}
						onBack={() => goToStep("select-resume")}
						onApplySuggestion={handleApplySuggestion}
					/>
				)}
			</div>
		</div>
	);
}
