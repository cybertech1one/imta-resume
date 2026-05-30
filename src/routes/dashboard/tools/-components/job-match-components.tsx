import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import {
	ArrowCounterClockwiseIcon,
	ArrowRightIcon,
	BookmarkSimpleIcon,
	BriefcaseIcon,
	CaretDownIcon,
	CaretUpIcon,
	CheckCircleIcon,
	ClockIcon,
	FileTextIcon,
	FloppyDiskIcon,
	GearIcon,
	LightbulbIcon,
	MagnifyingGlassIcon,
	PencilSimpleIcon,
	ReadCvLogoIcon,
	SparkleIcon,
	SpinnerIcon,
	StarIcon,
	TagIcon,
	TargetIcon,
	TrashIcon,
	TrendUpIcon,
	WarningCircleIcon,
	XCircleIcon,
} from "@phosphor-icons/react";
import { Link } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { JobMatchResult } from "@/integrations/drizzle/schema";
import { formatDate } from "@/utils/format-date";
import { cn } from "@/utils/style";
import { getScoreBgColor, getScoreColor, getScoreLabel } from "./job-match-config";

export function JobMatchHeroSection() {
	return (
		<motion.div
			className="relative mb-8 overflow-hidden rounded-2xl border bg-card p-6 shadow-sm md:p-8"
			initial={false}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.6, ease: "easeOut" }}
		>
			<div className="relative z-10">
				<motion.div
					className="mb-3 flex items-center gap-2"
					initial={false}
					animate={{ opacity: 1, x: 0 }}
					transition={{ delay: 0.2 }}
				>
					<SparkleIcon className="size-5 text-primary" weight="fill" />
					<span className="font-semibold text-primary text-sm uppercase tracking-wider">
						<Trans>Analyse intelligente</Trans>
					</span>
				</motion.div>

				<motion.h2
					className="mb-4 max-w-3xl font-bold text-2xl tracking-tight md:text-3xl"
					initial={false}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.3 }}
				>
					<Trans>Score de compatibilité entre ton CV et l'offre</Trans>
				</motion.h2>

				<motion.p
					className="mb-8 max-w-2xl text-muted-foreground text-sm md:text-base"
					initial={false}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.4 }}
				>
					<Trans>
						Colle une offre, choisis ton CV et repère immédiatement les mots-clés, compétences et expériences à
						renforcer avant de postuler.
					</Trans>
				</motion.p>

				<motion.div
					className="flex flex-wrap items-center gap-6"
					initial={false}
					animate={{ opacity: 1 }}
					transition={{ delay: 0.5 }}
				>
					<div className="flex items-center gap-2">
						<div className="flex size-10 items-center justify-center rounded-full bg-primary/10">
							<TargetIcon className="size-5 text-primary" weight="duotone" />
						</div>
						<div>
							<p className="font-bold text-xl">0-100</p>
							<p className="text-muted-foreground text-sm">
								<Trans>Score</Trans>
							</p>
						</div>
					</div>
					<div className="flex items-center gap-2">
						<div className="flex size-10 items-center justify-center rounded-full bg-green-500/10">
							<TagIcon className="size-5 text-green-500" weight="duotone" />
						</div>
						<div>
							<p className="font-bold text-xl">100+</p>
							<p className="text-muted-foreground text-sm">
								<Trans>Mots-clés analysés</Trans>
							</p>
						</div>
					</div>
					<div className="flex items-center gap-2">
						<div className="flex size-10 items-center justify-center rounded-full bg-amber-500/10">
							<LightbulbIcon className="size-5 text-amber-500" weight="duotone" />
						</div>
						<div>
							<p className="font-bold text-xl">5+</p>
							<p className="text-muted-foreground text-sm">
								<Trans>Suggestions</Trans>
							</p>
						</div>
					</div>
				</motion.div>
			</div>
		</motion.div>
	);
}

export function CalculatorInputForm({
	jobTitle,
	setJobTitle,
	company,
	setCompany,
	jobDescription,
	setJobDescription,
	selectedResumeId,
	setSelectedResumeId,
	resumes,
	isLoadingResumes,
	isAnalyzing,
	isSaving,
	handleAnalyze,
	handleSaveJob,
	handleReset,
}: {
	jobTitle: string;
	setJobTitle: (v: string) => void;
	company: string;
	setCompany: (v: string) => void;
	jobDescription: string;
	setJobDescription: (v: string) => void;
	selectedResumeId: string;
	setSelectedResumeId: (v: string) => void;
	resumes: Array<{ id: string; name: string }> | undefined;
	isLoadingResumes: boolean;
	isAnalyzing: boolean;
	isSaving: boolean;
	handleAnalyze: () => void;
	handleSaveJob: () => void;
	handleReset: () => void;
}) {
	return (
		<Card className="border-2 border-primary/20">
			<CardHeader>
				<CardTitle className="flex items-center gap-2 text-xl">
					<FileTextIcon className="size-5 text-primary" weight="duotone" />
					<Trans>Description du poste</Trans>
				</CardTitle>
				<CardDescription>
					<Trans>Colle l'offre pour comparer ses attentes avec ton CV</Trans>
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-6">
				<div className="grid gap-4 sm:grid-cols-2">
					<div className="space-y-2">
						<Label>
							<Trans>Intitulé du poste</Trans>
						</Label>
						<input
							type="text"
							className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none transition-[color,box-shadow] placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
							placeholder={t`Ex. : Technicien maintenance, infirmier, assistant RH`}
							value={jobTitle}
							onChange={(e) => setJobTitle(e.target.value)}
						/>
					</div>
					<div className="space-y-2">
						<Label>
							<Trans>Entreprise</Trans>
						</Label>
						<input
							type="text"
							className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none transition-[color,box-shadow] placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
							placeholder={t`Ex. : OCP, Renault Tanger, clinique privée...`}
							value={company}
							onChange={(e) => setCompany(e.target.value)}
						/>
					</div>
				</div>

				<div className="space-y-2">
					<Label>
						<Trans>Description du poste *</Trans>
					</Label>
					<Textarea
						placeholder={t`Colle ici la description complète de l'offre...`}
						className="min-h-48 resize-none"
						value={jobDescription}
						onChange={(e) => setJobDescription(e.target.value)}
					/>
					<p className="text-muted-foreground text-xs">
						{jobDescription.length} <Trans>caractères</Trans>
					</p>
				</div>

				<div className="space-y-2">
					<Label>
						<Trans>Sélectionner ton CV *</Trans>
					</Label>
					<Select value={selectedResumeId} onValueChange={setSelectedResumeId}>
						<SelectTrigger className="h-12">
							<SelectValue placeholder={t`Choisir un CV à comparer`} />
						</SelectTrigger>
						<SelectContent>
							{isLoadingResumes ? (
								<SelectItem value="loading" disabled>
									<Trans>Chargement...</Trans>
								</SelectItem>
							) : resumes && resumes.length > 0 ? (
								resumes.map((resume) => (
									<SelectItem key={resume.id} value={resume.id}>
										<div className="flex items-center gap-2">
											<ReadCvLogoIcon className="size-4" />
											{resume.name}
										</div>
									</SelectItem>
								))
							) : (
								<SelectItem value="none" disabled>
									<Trans>Aucun CV disponible</Trans>
								</SelectItem>
							)}
						</SelectContent>
					</Select>
					{(!resumes || resumes.length === 0) && !isLoadingResumes && (
						<p className="text-amber-600 text-xs">
							<Trans>
								Tu n'as pas encore de CV.{" "}
								<Link to="/dashboard/resumes" className="underline">
									Créer un CV
								</Link>
							</Trans>
						</p>
					)}
				</div>

				<div className="flex flex-wrap gap-3 pt-4">
					<Button
						className="flex-1 gap-2"
						size="lg"
						onClick={handleAnalyze}
						disabled={isAnalyzing || !jobDescription.trim() || !selectedResumeId}
					>
						{isAnalyzing ? (
							<>
								<SpinnerIcon className="size-5 animate-spin" />
								<Trans>Analyse en cours...</Trans>
							</>
						) : (
							<>
								<SparkleIcon className="size-5" weight="fill" />
								<Trans>Analyser la compatibilité</Trans>
							</>
						)}
					</Button>
					<Tooltip>
						<TooltipTrigger asChild>
							<Button variant="outline" size="lg" onClick={handleSaveJob} disabled={!jobDescription.trim() || isSaving}>
								{isSaving ? <SpinnerIcon className="size-5 animate-spin" /> : <FloppyDiskIcon className="size-5" />}
							</Button>
						</TooltipTrigger>
						<TooltipContent>
							<Trans>Enregistrer cette offre</Trans>
						</TooltipContent>
					</Tooltip>
					<Tooltip>
						<TooltipTrigger asChild>
							<Button variant="outline" size="lg" onClick={handleReset}>
								<ArrowCounterClockwiseIcon className="size-5" />
							</Button>
						</TooltipTrigger>
						<TooltipContent>
							<Trans>Réinitialiser</Trans>
						</TooltipContent>
					</Tooltip>
				</div>
			</CardContent>
		</Card>
	);
}

export function ResultsDisplay({ matchResult }: { matchResult: JobMatchResult | null }) {
	return (
		<AnimatePresence mode="wait">
			{matchResult ? (
				<motion.div
					key="results"
					initial={{ opacity: 0, x: 20 }}
					animate={{ opacity: 1, x: 0 }}
					exit={{ opacity: 0, x: -20 }}
					transition={{ duration: 0.4 }}
					className="space-y-6"
				>
					<Card className="overflow-hidden border-2 border-primary/30">
						<CardHeader className="pb-2">
							<CardTitle className="flex items-center justify-between">
								<span className="flex items-center gap-2 text-lg">
									<StarIcon className="size-5 text-amber-500" weight="fill" />
									<Trans>Score de compatibilité</Trans>
								</span>
								<Badge className={cn("text-white", getScoreBgColor(matchResult.overallScore))}>
									{getScoreLabel(matchResult.overallScore)}
								</Badge>
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-6">
							<div className="text-center">
								<motion.div
									className={cn("font-bold text-7xl", getScoreColor(matchResult.overallScore))}
									initial={{ scale: 0 }}
									animate={{ scale: 1 }}
									transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
								>
									{matchResult.overallScore}
								</motion.div>
								<p className="text-muted-foreground">
									<Trans>sur 100</Trans>
								</p>
							</div>

							<div className="space-y-4">
								<div className="space-y-2">
									<div className="flex items-center justify-between text-sm">
										<span className="flex items-center gap-2">
											<TagIcon className="size-4 text-blue-500" />
											<Trans>Mots-clés</Trans>
										</span>
										<span className="font-semibold">{matchResult.keywordMatch.score}%</span>
									</div>
									<Progress value={matchResult.keywordMatch.score} className="h-2" />
								</div>

								<div className="space-y-2">
									<div className="flex items-center justify-between text-sm">
										<span className="flex items-center gap-2">
											<GearIcon className="size-4 text-purple-500" />
											<Trans>Compétences</Trans>
										</span>
										<span className="font-semibold">{matchResult.skillsAlignment.score}%</span>
									</div>
									<Progress value={matchResult.skillsAlignment.score} className="h-2" />
								</div>

								<div className="space-y-2">
									<div className="flex items-center justify-between text-sm">
										<span className="flex items-center gap-2">
											<BriefcaseIcon className="size-4 text-green-500" />
											<Trans>Expérience</Trans>
										</span>
										<span className="font-semibold">{matchResult.experienceComparison.score}%</span>
									</div>
									<Progress value={matchResult.experienceComparison.score} className="h-2" />
								</div>
							</div>

							<div className="grid grid-cols-3 gap-3 text-center">
								<div className="rounded-lg border bg-green-50/50 p-3 dark:bg-green-950/20">
									<p className="font-bold text-2xl text-green-600 dark:text-green-400">
										{matchResult.keywordMatch.matched.length}
									</p>
									<p className="text-muted-foreground text-xs">
										<Trans>Correspondances</Trans>
									</p>
								</div>
								<div className="rounded-lg border bg-amber-50/50 p-3 dark:bg-amber-950/20">
									<p className="font-bold text-2xl text-amber-600 dark:text-amber-400">
										{matchResult.keywordMatch.partial.length}
									</p>
									<p className="text-muted-foreground text-xs">
										<Trans>Partielles</Trans>
									</p>
								</div>
								<div className="rounded-lg border bg-red-50/50 p-3 dark:bg-red-950/20">
									<p className="font-bold text-2xl text-red-600 dark:text-red-400">
										{matchResult.missingRequirements.length}
									</p>
									<p className="text-muted-foreground text-xs">
										<Trans>Manquants</Trans>
									</p>
								</div>
							</div>
						</CardContent>
					</Card>

					{matchResult.missingRequirements.length > 0 && (
						<Card className="border-red-500/20">
							<CardHeader className="pb-3">
								<CardTitle className="flex items-center gap-2 text-lg">
									<WarningCircleIcon className="size-5 text-red-500" weight="fill" />
									<Trans>Éléments manquants</Trans>
								</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="flex flex-wrap gap-2">
									{matchResult.missingRequirements.map((req, index) => (
										<Badge
											key={index}
											variant="outline"
											className="gap-1 border-red-500/50 text-red-600 dark:text-red-400"
										>
											<XCircleIcon className="size-3" />
											{req}
										</Badge>
									))}
								</div>
							</CardContent>
						</Card>
					)}
				</motion.div>
			) : (
				<motion.div
					key="placeholder"
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					className="flex h-full flex-col items-center justify-center rounded-xl border-2 border-muted-foreground/30 border-dashed p-8 text-center"
				>
					<TargetIcon className="mb-4 size-16 text-muted-foreground/50" weight="duotone" />
					<h3 className="mb-2 font-semibold text-lg">
						<Trans>Les résultats apparaîtront ici</Trans>
					</h3>
					<p className="text-muted-foreground text-sm">
						<Trans>Colle une offre et sélectionne un CV pour lancer l'analyse</Trans>
					</p>
				</motion.div>
			)}
		</AnimatePresence>
	);
}

export function DetailedAnalysis({
	matchResult,
	selectedResumeId,
	expandedSuggestions,
	toggleSuggestion,
}: {
	matchResult: JobMatchResult;
	selectedResumeId: string;
	expandedSuggestions: Set<string>;
	toggleSuggestion: (id: string) => void;
}) {
	return (
		<motion.div initial={false} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="space-y-8">
			<Separator />

			<KeywordAnalysisSection matchResult={matchResult} />
			<SkillsAlignmentSection matchResult={matchResult} />
			<ExperienceComparisonSection matchResult={matchResult} />
			<SuggestionsSection
				matchResult={matchResult}
				expandedSuggestions={expandedSuggestions}
				toggleSuggestion={toggleSuggestion}
			/>
			<ActionCTA selectedResumeId={selectedResumeId} />
		</motion.div>
	);
}

function KeywordAnalysisSection({ matchResult }: { matchResult: JobMatchResult }) {
	return (
		<section>
			<h3 className="mb-6 flex items-center gap-2 font-semibold text-xl">
				<TagIcon className="size-5 text-primary" weight="duotone" />
				<Trans>Analyse des mots-clés</Trans>
			</h3>

			<div className="grid gap-6 md:grid-cols-3">
				<Card className="border-green-500/20">
					<CardHeader className="pb-3">
						<CardTitle className="flex items-center gap-2 text-base">
							<CheckCircleIcon className="size-4 text-green-500" weight="fill" />
							<Trans>Correspondances</Trans>
							<Badge className="ml-auto bg-green-500 text-white">{matchResult.keywordMatch.matched.length}</Badge>
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="flex flex-wrap gap-2">
							{matchResult.keywordMatch.matched.length > 0 ? (
								matchResult.keywordMatch.matched.map((keyword, index) => (
									<Badge
										key={index}
										variant="outline"
										className="border-green-500/50 bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400"
									>
										{keyword}
									</Badge>
								))
							) : (
								<p className="text-muted-foreground text-sm">
									<Trans>Aucune correspondance directe</Trans>
								</p>
							)}
						</div>
					</CardContent>
				</Card>

				<Card className="border-amber-500/20">
					<CardHeader className="pb-3">
						<CardTitle className="flex items-center gap-2 text-base">
							<WarningCircleIcon className="size-4 text-amber-500" weight="fill" />
							<Trans>Correspondances partielles</Trans>
							<Badge className="ml-auto bg-amber-500 text-white">{matchResult.keywordMatch.partial.length}</Badge>
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="flex flex-wrap gap-2">
							{matchResult.keywordMatch.partial.length > 0 ? (
								matchResult.keywordMatch.partial.map((keyword, index) => (
									<Badge
										key={index}
										variant="outline"
										className="border-amber-500/50 bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400"
									>
										{keyword}
									</Badge>
								))
							) : (
								<p className="text-muted-foreground text-sm">
									<Trans>Aucune correspondance partielle</Trans>
								</p>
							)}
						</div>
					</CardContent>
				</Card>

				<Card className="border-red-500/20">
					<CardHeader className="pb-3">
						<CardTitle className="flex items-center gap-2 text-base">
							<XCircleIcon className="size-4 text-red-500" weight="fill" />
							<Trans>Manquants</Trans>
							<Badge className="ml-auto bg-red-500 text-white">{matchResult.keywordMatch.missing.length}</Badge>
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="flex flex-wrap gap-2">
							{matchResult.keywordMatch.missing.length > 0 ? (
								matchResult.keywordMatch.missing.slice(0, 10).map((keyword, index) => (
									<Badge
										key={index}
										variant="outline"
										className="border-red-500/50 bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400"
									>
										{keyword}
									</Badge>
								))
							) : (
								<p className="text-muted-foreground text-sm">
									<Trans>Tous les mots-clés sont présents</Trans>
								</p>
							)}
							{matchResult.keywordMatch.missing.length > 10 && (
								<Badge variant="secondary">+{matchResult.keywordMatch.missing.length - 10}</Badge>
							)}
						</div>
					</CardContent>
				</Card>
			</div>
		</section>
	);
}

function SkillsAlignmentSection({ matchResult }: { matchResult: JobMatchResult }) {
	return (
		<section>
			<h3 className="mb-6 flex items-center gap-2 font-semibold text-xl">
				<GearIcon className="size-5 text-primary" weight="duotone" />
				<Trans>Alignement des compétences</Trans>
			</h3>

			<div className="grid gap-6 md:grid-cols-2">
				<Card>
					<CardHeader className="pb-3">
						<CardTitle className="flex items-center gap-2 text-base">
							<CheckCircleIcon className="size-4 text-green-500" weight="fill" />
							<Trans>Compétences alignées</Trans>
						</CardTitle>
					</CardHeader>
					<CardContent>
						{matchResult.skillsAlignment.matched.length > 0 ? (
							<div className="space-y-3">
								{matchResult.skillsAlignment.matched.map((skill, index) => (
									<div key={index} className="flex items-center justify-between rounded-lg border bg-muted/30 p-3">
										<span className="font-medium">{skill.skill}</span>
										<div className="flex items-center gap-2">
											<div className="flex gap-0.5">
												{[1, 2, 3, 4, 5].map((level) => (
													<div
														key={level}
														className={cn(
															"size-2 rounded-full",
															level <= skill.resumeLevel ? "bg-green-500" : "bg-muted",
														)}
													/>
												))}
											</div>
											<Badge variant="outline" className="border-green-500/50 text-green-600">
												<Trans>Correspondance</Trans>
											</Badge>
										</div>
									</div>
								))}
							</div>
						) : (
							<p className="text-muted-foreground text-sm">
								<Trans>Aucune compétence directement alignée</Trans>
							</p>
						)}
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="pb-3">
						<CardTitle className="flex items-center gap-2 text-base">
							<TrendUpIcon className="size-4 text-amber-500" weight="fill" />
							<Trans>Compétences à développer</Trans>
						</CardTitle>
					</CardHeader>
					<CardContent>
						{matchResult.skillsAlignment.missing.length > 0 ? (
							<div className="space-y-3">
								{matchResult.skillsAlignment.missing.map((skill, index) => (
									<div
										key={index}
										className="flex items-center justify-between rounded-lg border border-amber-500/20 bg-amber-50/50 p-3 dark:bg-amber-950/20"
									>
										<span className="font-medium">{skill}</span>
										<Badge variant="outline" className="border-amber-500/50 text-amber-600">
											<Trans>À acquérir</Trans>
										</Badge>
									</div>
								))}
							</div>
						) : (
							<p className="text-muted-foreground text-sm">
								<Trans>Toutes les compétences demandées sont présentes</Trans>
							</p>
						)}
					</CardContent>
				</Card>
			</div>
		</section>
	);
}

function ExperienceComparisonSection({ matchResult }: { matchResult: JobMatchResult }) {
	return (
		<section>
			<h3 className="mb-6 flex items-center gap-2 font-semibold text-xl">
				<BriefcaseIcon className="size-5 text-primary" weight="duotone" />
				<Trans>Comparaison de l'expérience</Trans>
			</h3>

			<Card>
				<CardContent className="p-6">
					<div className="grid gap-6 md:grid-cols-3">
						<div className="text-center">
							<p className="mb-2 text-muted-foreground text-sm">
								<Trans>Expérience demandée</Trans>
							</p>
							<p className="font-bold text-3xl text-primary">{matchResult.experienceComparison.requiredYears}+</p>
							<p className="text-muted-foreground text-sm">
								<Trans>ans</Trans>
							</p>
						</div>
						<div className="flex items-center justify-center">
							<div
								className={cn(
									"flex size-16 items-center justify-center rounded-full",
									matchResult.experienceComparison.candidateYears >= matchResult.experienceComparison.requiredYears
										? "bg-green-100 text-green-600 dark:bg-green-900/30"
										: "bg-amber-100 text-amber-600 dark:bg-amber-900/30",
								)}
							>
								{matchResult.experienceComparison.candidateYears >= matchResult.experienceComparison.requiredYears ? (
									<CheckCircleIcon className="size-8" weight="fill" />
								) : (
									<WarningCircleIcon className="size-8" weight="fill" />
								)}
							</div>
						</div>
						<div className="text-center">
							<p className="mb-2 text-muted-foreground text-sm">
								<Trans>Ton expérience</Trans>
							</p>
							<p className="font-bold text-3xl text-primary">~{matchResult.experienceComparison.candidateYears}</p>
							<p className="text-muted-foreground text-sm">
								<Trans>ans estimés</Trans>
							</p>
						</div>
					</div>

					{matchResult.experienceComparison.relevantExperience.length > 0 && (
						<div className="mt-6">
							<p className="mb-3 font-medium text-sm">
								<Trans>Expérience pertinente trouvée :</Trans>
							</p>
							<div className="flex flex-wrap gap-2">
								{matchResult.experienceComparison.relevantExperience.map((exp, index) => (
									<Badge key={index} variant="secondary" className="gap-1">
										<CheckCircleIcon className="size-3 text-green-500" />
										{exp}
									</Badge>
								))}
							</div>
						</div>
					)}

					{matchResult.experienceComparison.gaps.length > 0 && (
						<div className="mt-4 rounded-lg border border-amber-500/30 bg-amber-50/50 p-4 dark:bg-amber-950/20">
							<p className="mb-2 flex items-center gap-2 font-medium text-amber-800 text-sm dark:text-amber-300">
								<WarningCircleIcon className="size-4" weight="fill" />
								<Trans>Points d'attention :</Trans>
							</p>
							<ul className="space-y-1 text-amber-700 text-sm dark:text-amber-400">
								{matchResult.experienceComparison.gaps.map((gap, index) => (
									<li key={index}>- {gap}</li>
								))}
							</ul>
						</div>
					)}
				</CardContent>
			</Card>
		</section>
	);
}

function SuggestionsSection({
	matchResult,
	expandedSuggestions,
	toggleSuggestion,
}: {
	matchResult: JobMatchResult;
	expandedSuggestions: Set<string>;
	toggleSuggestion: (id: string) => void;
}) {
	return (
		<section>
			<h3 className="mb-6 flex items-center gap-2 font-semibold text-xl">
				<LightbulbIcon className="size-5 text-amber-500" weight="fill" />
				<Trans>Suggestions d'amélioration</Trans>
			</h3>

			<div className="space-y-4">
				{matchResult.suggestions.map((suggestion) => (
					<motion.div key={suggestion.id} initial={false} animate={{ opacity: 1, y: 0 }}>
						<Card
							className={cn(
								"cursor-pointer transition-shadow hover:shadow-md",
								suggestion.priority === "high" && "border-red-500/30",
								suggestion.priority === "medium" && "border-amber-500/30",
								suggestion.priority === "low" && "border-green-500/30",
							)}
							onClick={() => toggleSuggestion(suggestion.id)}
						>
							<CardContent className="p-4">
								<div className="flex items-start gap-4">
									<div
										className={cn(
											"flex size-10 shrink-0 items-center justify-center rounded-xl",
											suggestion.priority === "high" && "bg-red-100 text-red-600 dark:bg-red-900/30",
											suggestion.priority === "medium" && "bg-amber-100 text-amber-600 dark:bg-amber-900/30",
											suggestion.priority === "low" && "bg-green-100 text-green-600 dark:bg-green-900/30",
										)}
									>
										{suggestion.category === "keyword" && <TagIcon className="size-5" weight="duotone" />}
										{suggestion.category === "skill" && <GearIcon className="size-5" weight="duotone" />}
										{suggestion.category === "experience" && <BriefcaseIcon className="size-5" weight="duotone" />}
										{suggestion.category === "content" && <PencilSimpleIcon className="size-5" weight="duotone" />}
									</div>
									<div className="min-w-0 flex-1">
										<div className="mb-1 flex items-center gap-2">
											<h4 className="font-semibold">{suggestion.title}</h4>
											<Badge
												variant="outline"
												className={cn(
													"text-xs",
													suggestion.priority === "high" && "border-red-500 text-red-600",
													suggestion.priority === "medium" && "border-amber-500 text-amber-600",
													suggestion.priority === "low" && "border-green-500 text-green-600",
												)}
											>
												{suggestion.priority === "high" && <Trans>Prioritaire</Trans>}
												{suggestion.priority === "medium" && <Trans>Recommandé</Trans>}
												{suggestion.priority === "low" && <Trans>Optionnel</Trans>}
											</Badge>
										</div>
										<AnimatePresence>
											{expandedSuggestions.has(suggestion.id) && (
												<motion.p
													initial={{ opacity: 0, height: 0 }}
													animate={{ opacity: 1, height: "auto" }}
													exit={{ opacity: 0, height: 0 }}
													className="text-muted-foreground text-sm"
												>
													{suggestion.description}
												</motion.p>
											)}
										</AnimatePresence>
									</div>
									<div className="shrink-0">
										{expandedSuggestions.has(suggestion.id) ? (
											<CaretUpIcon className="size-5 text-muted-foreground" />
										) : (
											<CaretDownIcon className="size-5 text-muted-foreground" />
										)}
									</div>
								</div>
							</CardContent>
						</Card>
					</motion.div>
				))}
			</div>
		</section>
	);
}

function ActionCTA({ selectedResumeId }: { selectedResumeId: string }) {
	return (
		<Card className="border-2 border-primary/20 bg-card">
			<CardContent className="flex flex-col items-center gap-4 p-8 text-center md:flex-row md:text-left">
				<div className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-primary/20">
					<PencilSimpleIcon className="size-8 text-primary" weight="duotone" />
				</div>
				<div className="flex-1">
					<h3 className="mb-1 font-bold text-xl">
						<Trans>Améliore ton CV maintenant</Trans>
					</h3>
					<p className="text-muted-foreground">
						<Trans>Utilise ces pistes pour adapter ton CV et augmenter tes chances d'être sélectionné.</Trans>
					</p>
				</div>
				{selectedResumeId && (
					<Link to="/builder/$resumeId" params={{ resumeId: selectedResumeId }}>
						<Button size="lg" className="gap-2">
							<Trans>Modifier mon CV</Trans>
							<ArrowRightIcon className="size-4" />
						</Button>
					</Link>
				)}
			</CardContent>
		</Card>
	);
}

export function SavedJobsTab({
	isLoadingSavedJobs,
	savedJobs,
	handleLoadJob,
	handleDeleteJob,
	isDeleting,
	setActiveTab,
}: {
	isLoadingSavedJobs: boolean;
	savedJobs:
		| Array<{
				id: string;
				title: string;
				company: string;
				description: string;
				lastScore: number | null;
				lastAnalyzedAt: Date | null;
				createdAt: Date;
		  }>
		| undefined;
	handleLoadJob: (job: { title: string; company: string; description: string }) => void;
	handleDeleteJob: (jobId: string) => void;
	isDeleting: boolean;
	setActiveTab: (tab: string) => void;
}) {
	if (isLoadingSavedJobs) {
		return (
			<div className="flex items-center justify-center py-16">
				<SpinnerIcon className="size-8 animate-spin text-muted-foreground" />
			</div>
		);
	}

	if (savedJobs && savedJobs.length > 0) {
		return (
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
				{savedJobs.map((job, index) => (
					<motion.div key={job.id} initial={false} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
						<Card className="h-full transition-shadow hover:shadow-md">
							<CardHeader className="pb-3">
								<div className="flex items-start justify-between gap-2">
									<div className="min-w-0 flex-1">
										<CardTitle className="line-clamp-1 text-base">{job.title}</CardTitle>
										<CardDescription className="line-clamp-1">{job.company}</CardDescription>
									</div>
									{job.lastScore !== null && (
										<Badge className={cn("shrink-0 text-white", getScoreBgColor(job.lastScore))}>
											{job.lastScore}%
										</Badge>
									)}
								</div>
							</CardHeader>
							<CardContent className="space-y-4">
								<p className="line-clamp-3 text-muted-foreground text-sm">{job.description.substring(0, 150)}...</p>
								<div className="flex items-center justify-between text-muted-foreground text-xs">
									<span className="flex items-center gap-1">
										<ClockIcon className="size-3" />
										{formatDate(job.createdAt, {
											day: "numeric",
											month: "short",
											year: "numeric",
											hour: "2-digit",
											minute: "2-digit",
										})}
									</span>
									{job.lastAnalyzedAt && (
										<span>
											<Trans>Analysée :</Trans>{" "}
											{formatDate(job.lastAnalyzedAt, {
												day: "numeric",
												month: "short",
												year: "numeric",
												hour: "2-digit",
												minute: "2-digit",
											})}
										</span>
									)}
								</div>
								<div className="flex gap-2">
									<Button variant="outline" size="sm" className="flex-1 gap-1" onClick={() => handleLoadJob(job)}>
										<MagnifyingGlassIcon className="size-4" />
										<Trans>Analyser</Trans>
									</Button>
									<Tooltip>
										<TooltipTrigger asChild>
											<Button variant="ghost" size="sm" onClick={() => handleDeleteJob(job.id)} disabled={isDeleting}>
												{isDeleting ? (
													<SpinnerIcon className="size-4 animate-spin" />
												) : (
													<TrashIcon className="size-4 text-red-500" />
												)}
											</Button>
										</TooltipTrigger>
										<TooltipContent>
											<Trans>Supprimer</Trans>
										</TooltipContent>
									</Tooltip>
								</div>
							</CardContent>
						</Card>
					</motion.div>
				))}
			</div>
		);
	}

	return (
		<Card className="border-dashed">
			<CardContent className="flex flex-col items-center justify-center py-16">
				<BookmarkSimpleIcon className="mb-4 size-16 text-muted-foreground/50" weight="duotone" />
				<h3 className="mb-2 font-semibold text-lg">
					<Trans>Aucune offre enregistrée</Trans>
				</h3>
				<p className="mb-4 text-center text-muted-foreground">
					<Trans>Enregistre des descriptions de poste pour les analyser plus tard.</Trans>
				</p>
				<Button onClick={() => setActiveTab("calculator")}>
					<ArrowRightIcon className="mr-2 size-4" />
					<Trans>Aller au calculateur</Trans>
				</Button>
			</CardContent>
		</Card>
	);
}

export function HistoryTab({
	isLoadingHistory,
	analysisHistory,
	handleClearHistory,
	isClearing,
	setActiveTab,
}: {
	isLoadingHistory: boolean;
	analysisHistory:
		| Array<{
				id: string;
				jobTitle: string;
				company: string;
				resumeName: string;
				score: number;
				createdAt: Date;
		  }>
		| undefined;
	handleClearHistory: () => void;
	isClearing: boolean;
	setActiveTab: (tab: string) => void;
}) {
	if (isLoadingHistory) {
		return (
			<div className="flex items-center justify-center py-16">
				<SpinnerIcon className="size-8 animate-spin text-muted-foreground" />
			</div>
		);
	}

	if (analysisHistory && analysisHistory.length > 0) {
		return (
			<>
				<div className="flex items-center justify-between">
					<h3 className="font-semibold text-lg">
						<Trans>Historique des analyses</Trans>
					</h3>
					<Button variant="outline" size="sm" onClick={handleClearHistory} disabled={isClearing}>
						{isClearing ? <SpinnerIcon className="mr-2 size-4 animate-spin" /> : <TrashIcon className="mr-2 size-4" />}
						<Trans>Effacer l'historique</Trans>
					</Button>
				</div>

				<div className="space-y-4">
					{analysisHistory.map((entry, index) => (
						<motion.div
							key={entry.id}
							initial={false}
							animate={{ opacity: 1, x: 0 }}
							transition={{ delay: index * 0.05 }}
						>
							<Card className="transition-shadow hover:shadow-md">
								<CardContent className="flex items-center gap-4 p-4">
									<div
										className={cn(
											"flex size-14 shrink-0 items-center justify-center rounded-xl",
											entry.score >= 80
												? "bg-green-100 dark:bg-green-900/30"
												: entry.score >= 60
													? "bg-amber-100 dark:bg-amber-900/30"
													: "bg-red-100 dark:bg-red-900/30",
										)}
									>
										<span className={cn("font-bold text-xl", getScoreColor(entry.score))}>{entry.score}</span>
									</div>
									<div className="min-w-0 flex-1">
										<h4 className="font-semibold">{entry.jobTitle}</h4>
										<p className="text-muted-foreground text-sm">{entry.company}</p>
										<div className="mt-1 flex items-center gap-2 text-muted-foreground text-xs">
											<Badge variant="outline" className="gap-1">
												<ReadCvLogoIcon className="size-3" />
												{entry.resumeName}
											</Badge>
											<span>-</span>
											<span>
												{formatDate(entry.createdAt, {
													day: "numeric",
													month: "short",
													year: "numeric",
													hour: "2-digit",
													minute: "2-digit",
												})}
											</span>
										</div>
									</div>
									<Badge className={cn("shrink-0 text-white", getScoreBgColor(entry.score))}>
										{getScoreLabel(entry.score)}
									</Badge>
								</CardContent>
							</Card>
						</motion.div>
					))}
				</div>
			</>
		);
	}

	return (
		<Card className="border-dashed">
			<CardContent className="flex flex-col items-center justify-center py-16">
				<ClockIcon className="mb-4 size-16 text-muted-foreground/50" weight="duotone" />
				<h3 className="mb-2 font-semibold text-lg">
					<Trans>Aucun historique</Trans>
				</h3>
				<p className="mb-4 text-center text-muted-foreground">
					<Trans>Tes analyses précédentes apparaîtront ici.</Trans>
				</p>
				<Button onClick={() => setActiveTab("calculator")}>
					<ArrowRightIcon className="mr-2 size-4" />
					<Trans>Lancer une analyse</Trans>
				</Button>
			</CardContent>
		</Card>
	);
}

export function JobMatchTipsSection() {
	return (
		<motion.div className="mt-8" initial={false} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}>
			<Card className="border-primary/30 border-dashed bg-card">
				<CardContent className="flex flex-col items-center gap-4 p-6 md:flex-row">
					<div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-primary/20">
						<LightbulbIcon className="size-7 text-primary" weight="fill" />
					</div>
					<div className="flex-1 text-center md:text-left">
						<h3 className="mb-1 font-semibold text-lg">
							<Trans>Conseils pour améliorer le score</Trans>
						</h3>
						<p className="text-muted-foreground text-sm">
							<Trans>
								Reprends les mêmes termes que l'offre dans ton CV. Chiffre tes réalisations avec des résultats concrets.
								Adapte ton résumé professionnel à chaque candidature. Un score de 70% ou plus augmente nettement tes
								chances d'être contacté.
							</Trans>
						</p>
					</div>
				</CardContent>
			</Card>
		</motion.div>
	);
}
