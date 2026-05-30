import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import {
	ArrowClockwiseIcon,
	CheckCircleIcon,
	FlagIcon,
	GaugeIcon,
	LightbulbIcon,
	MagnifyingGlassIcon,
	ShieldCheckIcon,
	TagIcon,
	WarningCircleIcon,
	WarningIcon,
	XCircleIcon,
} from "@phosphor-icons/react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import { ErrorComponent } from "@/components/error-component";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { authClient } from "@/integrations/auth/client";
import { orpc } from "@/integrations/orpc/client";
import { DashboardHeader } from "../-components/header";

// biome-ignore lint/suspicious/noExplicitAny: Route path not in generated route tree
export const Route = createFileRoute("/dashboard/tools/ats-checker" as any)({
	component: AtsChecker,
	errorComponent: ErrorComponent,
});

// ---- Types ----

interface SectionScore {
	name: string;
	score: number;
	issues: string[];
	suggestions: string[];
}

interface AtsResult {
	overallScore: number;
	sections: SectionScore[];
	keywords: {
		found: string[];
		missing: string[];
		matchRate: number;
	};
	formatting: {
		score: number;
		issues: string[];
		suggestions: string[];
	};
	moroccanSpecific: {
		score: number;
		tips: string[];
	};
}

// ---- Score color helpers ----

function getScoreColor(score: number): string {
	if (score >= 80) return "text-emerald-600 dark:text-emerald-400";
	if (score >= 50) return "text-amber-600 dark:text-amber-400";
	return "text-red-600 dark:text-red-400";
}

function getScoreBg(score: number): string {
	if (score >= 80) return "bg-emerald-100 dark:bg-emerald-900/30";
	if (score >= 50) return "bg-amber-100 dark:bg-amber-900/30";
	return "bg-red-100 dark:bg-red-900/30";
}

function getScoreLabel(score: number): string {
	if (score >= 80) return t`Excellent`;
	if (score >= 60) return t`Bon`;
	if (score >= 40) return t`À améliorer`;
	return t`Faible`;
}

function getScoreRingColor(score: number): string {
	if (score >= 80) return "stroke-emerald-500";
	if (score >= 50) return "stroke-amber-500";
	return "stroke-red-500";
}

function getProgressColor(score: number): string {
	if (score >= 80) return "[&_[data-slot=progress-indicator]]:bg-emerald-500";
	if (score >= 50) return "[&_[data-slot=progress-indicator]]:bg-amber-500";
	return "[&_[data-slot=progress-indicator]]:bg-red-500";
}

// ---- Circular Score Gauge ----

function ScoreGauge({ score }: { score: number }) {
	const radius = 60;
	const circumference = 2 * Math.PI * radius;
	const offset = circumference - (score / 100) * circumference;

	return (
		<div className="relative inline-flex items-center justify-center">
			<svg className="size-40 -rotate-90" viewBox="0 0 140 140">
				<circle cx="70" cy="70" r={radius} fill="none" strokeWidth="8" className="stroke-muted" />
				<circle
					cx="70"
					cy="70"
					r={radius}
					fill="none"
					strokeWidth="8"
					strokeLinecap="round"
					strokeDasharray={circumference}
					strokeDashoffset={offset}
					className={`${getScoreRingColor(score)} transition-all duration-700 ease-out`}
				/>
			</svg>
			<div className="absolute flex flex-col items-center">
				<span className={`font-bold text-3xl ${getScoreColor(score)}`}>{score}</span>
				<span className="text-muted-foreground text-xs">/100</span>
			</div>
		</div>
	);
}

// ---- Section Score Card ----

function SectionScoreCard({ section }: { section: SectionScore }) {
	return (
		<Card>
			<CardHeader className="pb-3">
				<div className="flex items-center justify-between">
					<CardTitle className="text-sm">{section.name}</CardTitle>
					<Badge variant={section.score >= 80 ? "default" : section.score >= 50 ? "secondary" : "destructive"}>
						{section.score}/100
					</Badge>
				</div>
				<Progress value={section.score} className={getProgressColor(section.score)} />
			</CardHeader>
			{(section.issues.length > 0 || section.suggestions.length > 0) && (
				<CardContent className="space-y-2">
					{section.issues.map((issue) => (
						<div key={issue} className="flex items-start gap-2 text-sm">
							<XCircleIcon className="mt-0.5 size-4 shrink-0 text-red-500" weight="fill" />
							<span className="text-muted-foreground">{issue}</span>
						</div>
					))}
					{section.suggestions.map((suggestion) => (
						<div key={suggestion} className="flex items-start gap-2 text-sm">
							<LightbulbIcon className="mt-0.5 size-4 shrink-0 text-amber-500" weight="fill" />
							<span className="text-muted-foreground">{suggestion}</span>
						</div>
					))}
				</CardContent>
			)}
		</Card>
	);
}

// ---- Main Component ----

function AtsChecker() {
	const { data: session } = authClient.useSession();
	const [selectedResumeId, setSelectedResumeId] = useState<string>("");
	const [jobDescription, setJobDescription] = useState("");
	const [result, setResult] = useState<AtsResult | null>(null);

	// Fetch user's resumes
	const { data: resumes, isLoading: isLoadingResumes } = useQuery({
		...orpc.resume.list.queryOptions({ input: { tags: [], sort: "lastUpdatedAt" } }),
		enabled: !!session?.user,
	});

	// Fetch selected resume data
	const { data: selectedResumeData } = useQuery({
		...orpc.resume.getById.queryOptions({ input: { id: selectedResumeId } }),
		enabled: !!session?.user && !!selectedResumeId,
	});

	// Mutation for ATS check
	const checkMutation = useMutation({
		...orpc.atsChecker.checkAtsScore.mutationOptions(),
		onSuccess: (data) => {
			setResult(data);
			toast.success(t`Analyse ATS terminée`);
		},
		onError: (error) => {
			toast.error(error.message || t`Impossible d'analyser ce CV`);
		},
	});

	const handleAnalyze = useCallback(() => {
		if (!selectedResumeData?.data) {
			toast.error(t`Sélectionne d'abord un CV`);
			return;
		}

		checkMutation.mutate({
			resumeData: selectedResumeData.data,
			jobDescription: jobDescription.trim() || undefined,
		});
	}, [selectedResumeData, jobDescription, checkMutation]);

	// Count total issues and suggestions
	const issueCount = useMemo(() => {
		if (!result) return 0;
		let count = 0;
		for (const section of result.sections) {
			count += section.issues.length;
		}
		count += result.formatting.issues.length;
		return count;
	}, [result]);

	const suggestionCount = useMemo(() => {
		if (!result) return 0;
		let count = 0;
		for (const section of result.sections) {
			count += section.suggestions.length;
		}
		count += result.formatting.suggestions.length;
		count += result.moroccanSpecific.tips.length;
		return count;
	}, [result]);

	return (
		<div className="space-y-6">
			<DashboardHeader title={t`Score ATS du CV`} icon={ShieldCheckIcon} />

			{/* Hero Section */}
			<Card>
				<CardHeader>
					<CardTitle>
						<Trans>Vérifie si ton CV passe les filtres ATS</Trans>
					</CardTitle>
					<CardDescription>
						<Trans>
							Analyse la structure, les mots-clés et les points attendus par les recruteurs marocains avant d'envoyer ta
							candidature.
						</Trans>
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					{/* Resume selector */}
					<div className="space-y-2">
						<label className="font-medium text-sm">
							<Trans>Sélectionner un CV</Trans>
						</label>
						<Select value={selectedResumeId} onValueChange={setSelectedResumeId}>
							<SelectTrigger>
								<SelectValue placeholder={t`Choisir un CV à analyser...`} />
							</SelectTrigger>
							<SelectContent>
								{isLoadingResumes ? (
									<SelectItem value="loading" disabled>
										<Trans>Chargement des CV...</Trans>
									</SelectItem>
								) : resumes && resumes.length > 0 ? (
									resumes.map((resume) => (
										<SelectItem key={resume.id} value={resume.id}>
											{resume.name}
										</SelectItem>
									))
								) : (
									<SelectItem value="none" disabled>
										<Trans>Aucun CV trouvé. Crée d'abord un CV.</Trans>
									</SelectItem>
								)}
							</SelectContent>
						</Select>
					</div>

					{/* Job description (optional) */}
					<div className="space-y-2">
						<label className="font-medium text-sm">
							<Trans>Description du poste</Trans>
							<span className="ml-1 text-muted-foreground">
								(<Trans>facultatif - pour comparer les mots-clés</Trans>)
							</span>
						</label>
						<Textarea
							placeholder={t`Colle la description du poste ici pour vérifier les mots-clés...`}
							value={jobDescription}
							onChange={(e) => setJobDescription(e.target.value)}
							rows={5}
						/>
					</div>

					{/* Analyze button */}
					<Button
						onClick={handleAnalyze}
						disabled={!selectedResumeId || !selectedResumeData || checkMutation.isPending}
						className="w-full sm:w-auto"
					>
						{checkMutation.isPending ? (
							<>
								<ArrowClockwiseIcon className="animate-spin" />
								<Trans>Analyse en cours...</Trans>
							</>
						) : (
							<>
								<MagnifyingGlassIcon />
								<Trans>Vérifier le score ATS</Trans>
							</>
						)}
					</Button>
				</CardContent>
			</Card>

			{/* Results */}
			{result && (
				<div className="space-y-6">
					{/* Overall Score Card */}
					<Card>
						<CardContent className="flex flex-col items-center gap-4 py-8 md:flex-row md:justify-around">
							<div className="flex flex-col items-center gap-2">
								<ScoreGauge score={result.overallScore} />
								<div className="text-center">
									<p className={`font-semibold text-lg ${getScoreColor(result.overallScore)}`}>
										{getScoreLabel(result.overallScore)}
									</p>
									<p className="text-muted-foreground text-sm">
										<Trans>Score ATS global</Trans>
									</p>
								</div>
							</div>

							<div className="grid grid-cols-3 gap-6 text-center">
								<div>
									<div
										className={`flex items-center justify-center gap-1 font-bold text-2xl ${getScoreColor(result.formatting.score)}`}
									>
										<GaugeIcon className="size-5" weight="fill" />
										{result.formatting.score}
									</div>
									<p className="text-muted-foreground text-xs">
										<Trans>Mise en forme</Trans>
									</p>
								</div>
								<div>
									<div className="flex items-center justify-center gap-1 font-bold text-2xl text-red-600 dark:text-red-400">
										<WarningCircleIcon className="size-5" weight="fill" />
										{issueCount}
									</div>
									<p className="text-muted-foreground text-xs">
										<Trans>Problèmes</Trans>
									</p>
								</div>
								<div>
									<div className="flex items-center justify-center gap-1 font-bold text-2xl text-amber-600 dark:text-amber-400">
										<LightbulbIcon className="size-5" weight="fill" />
										{suggestionCount}
									</div>
									<p className="text-muted-foreground text-xs">
										<Trans>Suggestions</Trans>
									</p>
								</div>
							</div>
						</CardContent>
					</Card>

					{/* Section-by-Section Breakdown */}
					<div>
						<h3 className="mb-3 font-semibold text-lg">
							<Trans>Analyse par section</Trans>
						</h3>
						<div className="grid gap-4 md:grid-cols-2">
							{result.sections.map((section) => (
								<SectionScoreCard key={section.name} section={section} />
							))}
						</div>
					</div>

					{/* Keyword Match Analysis */}
					{jobDescription.trim() && (
						<Card>
							<CardHeader>
								<div className="flex items-center gap-2">
									<TagIcon className="size-5" weight="fill" />
									<CardTitle>
										<Trans>Analyse des mots-clés</Trans>
									</CardTitle>
								</div>
								<div className="flex items-center gap-3">
									<Progress
										value={result.keywords.matchRate}
										className={`flex-1 ${getProgressColor(result.keywords.matchRate)}`}
									/>
									<Badge
										variant={
											result.keywords.matchRate >= 70
												? "default"
												: result.keywords.matchRate >= 40
													? "secondary"
													: "destructive"
										}
									>
										{result.keywords.matchRate}%
									</Badge>
								</div>
							</CardHeader>
							<CardContent className="space-y-4">
								{/* Found keywords */}
								{result.keywords.found.length > 0 && (
									<div>
										<p className="mb-2 flex items-center gap-1 font-medium text-sm">
											<CheckCircleIcon className="size-4 text-emerald-500" weight="fill" />
											<Trans>Mots-clés trouvés ({result.keywords.found.length})</Trans>
										</p>
										<div className="flex flex-wrap gap-1.5">
											{result.keywords.found.map((keyword) => (
												<Badge
													key={keyword}
													variant="outline"
													className="border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400"
												>
													{keyword}
												</Badge>
											))}
										</div>
									</div>
								)}

								{/* Missing keywords */}
								{result.keywords.missing.length > 0 && (
									<div>
										<p className="mb-2 flex items-center gap-1 font-medium text-sm">
											<WarningIcon className="size-4 text-amber-500" weight="fill" />
											<Trans>Mots-clés manquants ({result.keywords.missing.length})</Trans>
										</p>
										<div className="flex flex-wrap gap-1.5">
											{result.keywords.missing.slice(0, 25).map((keyword) => (
												<Badge
													key={keyword}
													variant="outline"
													className="border-red-300 bg-red-50 text-red-700 dark:border-red-700 dark:bg-red-900/20 dark:text-red-400"
												>
													{keyword}
												</Badge>
											))}
											{result.keywords.missing.length > 25 && (
												<Badge variant="outline">
													+{result.keywords.missing.length - 25} <Trans>autres</Trans>
												</Badge>
											)}
										</div>
									</div>
								)}
							</CardContent>
						</Card>
					)}

					{/* Formatting Issues */}
					{(result.formatting.issues.length > 0 || result.formatting.suggestions.length > 0) && (
						<Card>
							<CardHeader>
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-2">
										<GaugeIcon className="size-5" weight="fill" />
										<CardTitle>
											<Trans>Mise en forme et structure</Trans>
										</CardTitle>
									</div>
									<Badge
										variant={
											result.formatting.score >= 80
												? "default"
												: result.formatting.score >= 50
													? "secondary"
													: "destructive"
										}
									>
										{result.formatting.score}/100
									</Badge>
								</div>
							</CardHeader>
							<CardContent className="space-y-2">
								{result.formatting.issues.map((issue) => (
									<div key={issue} className="flex items-start gap-2 text-sm">
										<XCircleIcon className="mt-0.5 size-4 shrink-0 text-red-500" weight="fill" />
										<span className="text-muted-foreground">{issue}</span>
									</div>
								))}
								{result.formatting.suggestions.map((suggestion) => (
									<div key={suggestion} className="flex items-start gap-2 text-sm">
										<LightbulbIcon className="mt-0.5 size-4 shrink-0 text-amber-500" weight="fill" />
										<span className="text-muted-foreground">{suggestion}</span>
									</div>
								))}
							</CardContent>
						</Card>
					)}

					{/* Morocco-Specific Tips */}
					{result.moroccanSpecific.tips.length > 0 && (
						<Card>
							<CardHeader>
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-2">
										<FlagIcon className="size-5" weight="fill" />
										<CardTitle>
											<Trans>Conseils adaptés au marché marocain</Trans>
										</CardTitle>
									</div>
									<Badge
										variant={
											result.moroccanSpecific.score >= 80
												? "default"
												: result.moroccanSpecific.score >= 50
													? "secondary"
													: "destructive"
										}
									>
										{result.moroccanSpecific.score}/100
									</Badge>
								</div>
								<CardDescription>
									<Trans>Conseils liés aux attentes des recruteurs et écoles au Maroc.</Trans>
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-2">
								{result.moroccanSpecific.tips.map((tip) => (
									<div key={tip} className="flex items-start gap-2 text-sm">
										<FlagIcon className="mt-0.5 size-4 shrink-0 text-blue-500" weight="fill" />
										<span className="text-muted-foreground">{tip}</span>
									</div>
								))}
							</CardContent>
						</Card>
					)}
				</div>
			)}

			{/* Tips Section (shown when no result) */}
			{!result && (
				<Card>
					<CardHeader>
						<CardTitle>
							<Trans>Conseils ATS pour les candidats au Maroc</Trans>
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="grid gap-4 md:grid-cols-2">
							<div className={`rounded-lg p-4 ${getScoreBg(80)}`}>
								<h4 className="mb-2 font-medium text-sm">
									<Trans>Utilise des titres de sections standards</Trans>
								</h4>
								<p className="text-muted-foreground text-xs">
									<Trans>
										Garde des intitulés clairs comme "Expérience", "Formation" et "Compétences". Les systèmes ATS
										comprennent mal les titres trop créatifs.
									</Trans>
								</p>
							</div>
							<div className={`rounded-lg p-4 ${getScoreBg(80)}`}>
								<h4 className="mb-2 font-medium text-sm">
									<Trans>Ajoute les bons mots-clés en français</Trans>
								</h4>
								<p className="text-muted-foreground text-xs">
									<Trans>
										Reprends les mots importants de l'offre : métier, outils, certifications, région et type de contrat.
									</Trans>
								</p>
							</div>
							<div className={`rounded-lg p-4 ${getScoreBg(80)}`}>
								<h4 className="mb-2 font-medium text-sm">
									<Trans>Chiffre tes réalisations</Trans>
								</h4>
								<p className="text-muted-foreground text-xs">
									<Trans>
										Ajoute des nombres, volumes, délais ou résultats. Une phrase concrète sera mieux comprise qu'une
										formulation générale.
									</Trans>
								</p>
							</div>
							<div className={`rounded-lg p-4 ${getScoreBg(80)}`}>
								<h4 className="mb-2 font-medium text-sm">
									<Trans>Mets en avant tes stages</Trans>
								</h4>
								<p className="text-muted-foreground text-xs">
									<Trans>
										Pour les étudiants et diplômés IMTA, les stages sont essentiels. Précise les missions, outils et
										compétences validées.
									</Trans>
								</p>
							</div>
						</div>
					</CardContent>
				</Card>
			)}
		</div>
	);
}
