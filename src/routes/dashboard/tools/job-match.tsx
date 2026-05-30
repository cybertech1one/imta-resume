import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { BookmarkSimpleIcon, ClockIcon, TargetIcon } from "@phosphor-icons/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense, useCallback, useState } from "react";
import { toast } from "sonner";
import { ErrorComponent } from "@/components/error-component";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { authClient } from "@/integrations/auth/client";
import type { JobMatchResult } from "@/integrations/drizzle/schema";
import { orpc } from "@/integrations/orpc/client";
import { DashboardHeader } from "../-components/header";
import {
	CalculatorInputForm,
	DetailedAnalysis,
	HistoryTab,
	JobMatchHeroSection,
	JobMatchTipsSection,
	ResultsDisplay,
	SavedJobsTab,
} from "./-components/job-match-components";

const JobMatchCalculatorLazy = lazy(() => Promise.resolve({ default: JobMatchCalculator }));

// biome-ignore lint/suspicious/noExplicitAny: Route path not in generated route tree
export const Route = createFileRoute("/dashboard/tools/job-match" as any)({
	component: () => (
		<Suspense
			fallback={
				<div className="flex items-center justify-center p-8">
					<Trans>Chargement du calculateur de compatibilité...</Trans>
				</div>
			}
		>
			<JobMatchCalculatorLazy />
		</Suspense>
	),
	errorComponent: ErrorComponent,
});

function JobMatchCalculator() {
	const { data: session } = authClient.useSession();
	const queryClient = useQueryClient();
	const [activeTab, setActiveTab] = useState("calculator");
	const [jobDescription, setJobDescription] = useState("");
	const [jobTitle, setJobTitle] = useState("");
	const [company, setCompany] = useState("");
	const [selectedResumeId, setSelectedResumeId] = useState<string>("");
	const [matchResult, setMatchResult] = useState<JobMatchResult | null>(null);
	const [expandedSuggestions, setExpandedSuggestions] = useState<Set<string>>(new Set());

	const { data: resumes, isLoading: isLoadingResumes } = useQuery({
		...orpc.resume.list.queryOptions({ input: { tags: [], sort: "lastUpdatedAt" } }),
		enabled: !!session?.user,
	});

	const { data: savedJobs, isLoading: isLoadingSavedJobs } = useQuery({
		...orpc.jobMatch.listSavedJobs.queryOptions({ input: {} }),
		enabled: !!session?.user,
	});

	const { data: analysisHistory, isLoading: isLoadingHistory } = useQuery({
		...orpc.jobMatch.listAnalysisHistory.queryOptions({ input: {} }),
		enabled: !!session?.user,
	});

	const { data: fullResumeData } = useQuery({
		...orpc.resume.getById.queryOptions({ input: { id: selectedResumeId } }),
		enabled: !!session?.user && !!selectedResumeId,
	});

	const analyzeMutation = useMutation({
		...orpc.jobMatch.analyzeJobMatch.mutationOptions(),
		onSuccess: (data) => {
			setMatchResult(data.result);
			queryClient.invalidateQueries({ queryKey: orpc.jobMatch.listAnalysisHistory.key() });
			queryClient.invalidateQueries({ queryKey: orpc.jobMatch.listSavedJobs.key() });
			toast.success(t`Analyse terminée`);
		},
		onError: () => {
			toast.error(t`Erreur pendant l'analyse`);
		},
	});

	const saveJobMutation = useMutation({
		...orpc.jobMatch.createSavedJob.mutationOptions(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: orpc.jobMatch.listSavedJobs.key() });
			toast.success(t`Offre enregistrée`);
		},
		onError: () => {
			toast.error(t`Erreur pendant l'enregistrement`);
		},
	});

	const deleteSavedJobMutation = useMutation({
		...orpc.jobMatch.deleteSavedJob.mutationOptions(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: orpc.jobMatch.listSavedJobs.key() });
			toast.success(t`Description supprimée`);
		},
		onError: () => {
			toast.error(t`Erreur pendant la suppression`);
		},
	});

	const clearHistoryMutation = useMutation({
		...orpc.jobMatch.clearAnalysisHistory.mutationOptions(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: orpc.jobMatch.listAnalysisHistory.key() });
			toast.success(t`Historique effacé`);
		},
		onError: () => {
			toast.error(t`Erreur pendant l'effacement de l'historique`);
		},
	});

	const handleAnalyze = useCallback(async () => {
		if (!jobDescription.trim() || !selectedResumeId || !fullResumeData) {
			toast.error(t`Ajoute la description du poste et sélectionne un CV`);
			return;
		}

		analyzeMutation.mutate({
			resumeId: selectedResumeId,
			jobTitle: jobTitle || "Poste non précisé",
			company: company || "Entreprise non précisée",
			jobDescription,
		});
	}, [jobDescription, selectedResumeId, fullResumeData, jobTitle, company, analyzeMutation]);

	const handleSaveJob = useCallback(() => {
		if (!jobDescription.trim()) {
			toast.error(t`Ajoute une description de poste`);
			return;
		}

		saveJobMutation.mutate({
			title: jobTitle || "Poste sans titre",
			company: company || "Entreprise non précisée",
			description: jobDescription,
		});
	}, [jobDescription, jobTitle, company, saveJobMutation]);

	const handleLoadJob = useCallback((job: { title: string; company: string; description: string }) => {
		setJobTitle(job.title);
		setCompany(job.company);
		setJobDescription(job.description);
		setMatchResult(null);
		setActiveTab("calculator");
		toast.success(t`Description chargée`);
	}, []);

	const handleDeleteJob = useCallback(
		(jobId: string) => {
			deleteSavedJobMutation.mutate({ id: jobId });
		},
		[deleteSavedJobMutation],
	);

	const handleClearHistory = useCallback(() => {
		clearHistoryMutation.mutate();
	}, [clearHistoryMutation]);

	const toggleSuggestion = useCallback((id: string) => {
		setExpandedSuggestions((prev) => {
			const newSet = new Set(prev);
			if (newSet.has(id)) {
				newSet.delete(id);
			} else {
				newSet.add(id);
			}
			return newSet;
		});
	}, []);

	const handleReset = useCallback(() => {
		setJobDescription("");
		setJobTitle("");
		setCompany("");
		setSelectedResumeId("");
		setMatchResult(null);
	}, []);

	const isAnalyzing = analyzeMutation.isPending;

	return (
		<>
			<DashboardHeader icon={TargetIcon} title={t`Compatibilité offre-CV`} />

			<JobMatchHeroSection />

			<Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
				<TabsList className="flex h-auto flex-wrap gap-2 bg-transparent p-0">
					{[
						{ value: "calculator", icon: TargetIcon, label: t`Calculateur` },
						{
							value: "saved",
							icon: BookmarkSimpleIcon,
							label: t`Enregistrées (${isLoadingSavedJobs ? "..." : (savedJobs?.length ?? 0)})`,
						},
						{
							value: "history",
							icon: ClockIcon,
							label: t`Historique (${isLoadingHistory ? "..." : (analysisHistory?.length ?? 0)})`,
						},
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

				<TabsContent value="calculator" className="space-y-8">
					<div className="grid gap-8 lg:grid-cols-2">
						<CalculatorInputForm
							jobTitle={jobTitle}
							setJobTitle={setJobTitle}
							company={company}
							setCompany={setCompany}
							jobDescription={jobDescription}
							setJobDescription={setJobDescription}
							selectedResumeId={selectedResumeId}
							setSelectedResumeId={setSelectedResumeId}
							resumes={resumes}
							isLoadingResumes={isLoadingResumes}
							isAnalyzing={isAnalyzing}
							isSaving={saveJobMutation.isPending}
							handleAnalyze={handleAnalyze}
							handleSaveJob={handleSaveJob}
							handleReset={handleReset}
						/>

						<ResultsDisplay matchResult={matchResult} />
					</div>

					{matchResult && (
						<DetailedAnalysis
							matchResult={matchResult}
							selectedResumeId={selectedResumeId}
							expandedSuggestions={expandedSuggestions}
							toggleSuggestion={toggleSuggestion}
						/>
					)}
				</TabsContent>

				<TabsContent value="saved" className="space-y-8">
					<SavedJobsTab
						isLoadingSavedJobs={isLoadingSavedJobs}
						savedJobs={savedJobs}
						handleLoadJob={handleLoadJob}
						handleDeleteJob={handleDeleteJob}
						isDeleting={deleteSavedJobMutation.isPending}
						setActiveTab={setActiveTab}
					/>
				</TabsContent>

				<TabsContent value="history" className="space-y-8">
					<HistoryTab
						isLoadingHistory={isLoadingHistory}
						analysisHistory={analysisHistory}
						handleClearHistory={handleClearHistory}
						isClearing={clearHistoryMutation.isPending}
						setActiveTab={setActiveTab}
					/>
				</TabsContent>
			</Tabs>

			<JobMatchTipsSection />
		</>
	);
}
