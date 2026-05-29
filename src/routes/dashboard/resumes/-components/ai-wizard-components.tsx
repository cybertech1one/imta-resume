import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import {
	ArrowLeftIcon,
	ArrowRightIcon,
	BriefcaseIcon,
	ChatCircleDotsIcon,
	CheckCircleIcon,
	ClipboardIcon,
	CopyIcon,
	MagnifyingGlassIcon,
	PaperPlaneTiltIcon,
	PencilSimpleIcon,
	RocketLaunchIcon,
	SparkleIcon,
	SpinnerGapIcon,
	TargetIcon,
	WarningCircleIcon,
	XCircleIcon,
} from "@phosphor-icons/react";
import { motion } from "motion/react";
import { useCallback, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/utils/style";
import type {
	AdaptResult,
	ChatMessage,
	GapAnalysisResult,
	GapSeverity,
	GenerateFormData,
	WizardMode,
	WizardStep,
} from "./ai-wizard-types";

// =============================================================================
// ANIMATION VARIANTS
// =============================================================================

export const containerVariants = {
	hidden: { opacity: 0 },
	visible: {
		opacity: 1,
		transition: { staggerChildren: 0.08 },
	},
};

export const itemVariants = {
	hidden: { opacity: 0, y: 16 },
	visible: { opacity: 1, y: 0 },
};

// =============================================================================
// LOADING SKELETON
// =============================================================================

export function WizardSkeleton() {
	return (
		<div className="space-y-6">
			<Skeleton className="h-10 w-64" />
			<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
				<Skeleton className="h-40" />
				<Skeleton className="h-40" />
				<Skeleton className="h-40" />
				<Skeleton className="h-40" />
			</div>
			<Skeleton className="h-64" />
		</div>
	);
}

// =============================================================================
// STEP INDICATOR
// =============================================================================

type StepIndicatorProps = {
	currentStep: WizardStep;
	mode: WizardMode | null;
};

export function StepIndicator({ currentStep, mode }: StepIndicatorProps) {
	// For "generate" mode, skip the resume selection step
	const isGenerateMode = mode === "generate";

	const steps: { key: WizardStep; label: () => string }[] = isGenerateMode
		? [
				{ key: "select-mode", label: () => t`Choisir le mode` },
				{ key: "execute", label: () => t`Generer` },
			]
		: [
				{ key: "select-mode", label: () => t`Choisir le mode` },
				{ key: "select-resume", label: () => t`Selectionner un CV` },
				{ key: "execute", label: () => t`Resultats` },
			];

	const currentIndex = steps.findIndex((s) => s.key === currentStep);

	return (
		<div className="flex items-center justify-center gap-2">
			{steps.map((step, i) => {
				const isActive = i === currentIndex;
				const isCompleted = i < currentIndex;
				return (
					<div key={step.key} className="flex items-center gap-2">
						{i > 0 && (
							<div
								className={cn(
									"h-px w-6 transition-colors duration-300 sm:w-10",
									isCompleted ? "bg-primary" : "bg-muted-foreground/20",
								)}
							/>
						)}
						<div className="flex items-center gap-1.5">
							<div
								className={cn(
									"flex size-7 items-center justify-center rounded-full font-semibold text-xs transition-all duration-300",
									isActive && "bg-primary text-primary-foreground shadow-md shadow-primary/25",
									isCompleted && "bg-primary/80 text-primary-foreground",
									!isActive && !isCompleted && "bg-muted text-muted-foreground",
								)}
							>
								{isCompleted ? <CheckCircleIcon weight="fill" className="size-4" /> : i + 1}
							</div>
							<span
								className={cn(
									"hidden font-medium text-xs sm:inline",
									isActive ? "text-foreground" : "text-muted-foreground",
								)}
							>
								{step.label()}
							</span>
						</div>
					</div>
				);
			})}
		</div>
	);
}

// =============================================================================
// RESUME SELECTOR
// =============================================================================

type Resume = { id: string; title: string; data?: unknown };

type ResumeSelectorProps = {
	resumes: Resume[];
	selectedResumeId: string | null;
	onSelect: (id: string) => void;
	onNext: () => void;
	onBack: () => void;
	isLoading: boolean;
};

export function ResumeSelector({
	resumes,
	selectedResumeId,
	onSelect,
	onNext,
	onBack,
	isLoading,
}: ResumeSelectorProps) {
	const [search, setSearch] = useState("");

	const filtered = resumes.filter((r) => r.title.toLowerCase().includes(search.toLowerCase()));

	if (isLoading) {
		return (
			<div className="space-y-4">
				<Skeleton className="h-10 w-full" />
				{Array.from({ length: 3 }).map((_, i) => (
					<Skeleton key={`resume-skeleton-${i}`} className="h-16 w-full" />
				))}
			</div>
		);
	}

	if (resumes.length === 0) {
		return (
			<Card className="border-dashed">
				<CardContent className="flex flex-col items-center justify-center py-12 text-center">
					<XCircleIcon className="mb-3 size-10 text-muted-foreground/50" />
					<p className="font-medium text-foreground">
						<Trans>Aucun CV trouve</Trans>
					</p>
					<p className="mt-1 text-muted-foreground text-sm">
						<Trans>Creez d'abord un CV pour utiliser cette fonctionnalite.</Trans>
					</p>
				</CardContent>
			</Card>
		);
	}

	return (
		<motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-4">
			<motion.div variants={itemVariants} className="relative">
				<MagnifyingGlassIcon className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
				<Input
					placeholder={t`Rechercher un CV...`}
					value={search}
					onChange={(e) => setSearch(e.target.value)}
					className="pl-9"
				/>
			</motion.div>

			<div className="grid gap-3">
				{filtered.map((resume) => (
					<motion.div key={resume.id} variants={itemVariants}>
						<Card
							className={cn(
								"cursor-pointer transition-all duration-200 hover:shadow-md",
								selectedResumeId === resume.id
									? "border-primary bg-primary/5 shadow-primary/10 shadow-sm"
									: "hover:border-primary/30",
							)}
							onClick={() => onSelect(resume.id)}
						>
							<CardContent className="flex items-center gap-3 py-4">
								<div
									className={cn(
										"flex size-9 items-center justify-center rounded-lg transition-colors",
										selectedResumeId === resume.id
											? "bg-primary text-primary-foreground"
											: "bg-muted text-muted-foreground",
									)}
								>
									<ClipboardIcon className="size-4" />
								</div>
								<div className="min-w-0 flex-1">
									<p className="truncate font-medium text-sm">{resume.title}</p>
								</div>
								{selectedResumeId === resume.id && <CheckCircleIcon weight="fill" className="size-5 text-primary" />}
							</CardContent>
						</Card>
					</motion.div>
				))}
			</div>

			{filtered.length === 0 && resumes.length > 0 && (
				<p className="py-4 text-center text-muted-foreground text-sm">
					<Trans>Aucun CV ne correspond a votre recherche.</Trans>
				</p>
			)}

			<div className="flex items-center justify-between pt-2">
				<Button variant="outline" onClick={onBack}>
					<ArrowLeftIcon className="mr-2 size-4" />
					<Trans>Retour</Trans>
				</Button>
				<Button onClick={onNext} disabled={!selectedResumeId}>
					<Trans>Continuer</Trans>
					<ArrowRightIcon className="ml-2 size-4" />
				</Button>
			</div>
		</motion.div>
	);
}

// =============================================================================
// MODE SELECTOR
// =============================================================================

type ModeSelectorProps = {
	selectedMode: WizardMode | null;
	onSelect: (mode: WizardMode) => void;
	onNext: () => void;
};

const MODE_ICONS = {
	sparkle: SparkleIcon,
	target: TargetIcon,
	briefcase: BriefcaseIcon,
	chat: ChatCircleDotsIcon,
} as const;

type ModeCardData = {
	id: WizardMode;
	icon: keyof typeof MODE_ICONS;
	label: () => string;
	description: () => string;
	gradient: string;
};

const MODES: ModeCardData[] = [
	{
		id: "generate",
		icon: "sparkle",
		label: () => t`Generer un CV`,
		description: () => t`Creez un CV complet a partir de vos informations de base`,
		gradient: "from-emerald-500/10 to-teal-500/10 dark:from-emerald-500/5 dark:to-teal-500/5",
	},
	{
		id: "gap-analysis",
		icon: "target",
		label: () => t`Analyse des lacunes`,
		description: () => t`Analysez votre CV pour identifier les points faibles`,
		gradient: "from-amber-500/10 to-orange-500/10 dark:from-amber-500/5 dark:to-orange-500/5",
	},
	{
		id: "adapt-to-job",
		icon: "briefcase",
		label: () => t`Adapter a une offre`,
		description: () => t`Adaptez votre CV a une offre d'emploi specifique`,
		gradient: "from-teal-500/10 to-cyan-500/10 dark:from-teal-500/5 dark:to-cyan-500/5",
	},
	{
		id: "ai-chat",
		icon: "chat",
		label: () => t`Chat IA`,
		description: () => t`Discutez avec l'IA pour ameliorer votre CV`,
		gradient: "from-violet-500/10 to-purple-500/10 dark:from-violet-500/5 dark:to-purple-500/5",
	},
];

export function ModeSelector({ selectedMode, onSelect, onNext }: ModeSelectorProps) {
	return (
		<motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
			<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
				{MODES.map((mode) => {
					const Icon = MODE_ICONS[mode.icon];
					const isSelected = selectedMode === mode.id;
					return (
						<motion.div key={mode.id} variants={itemVariants}>
							<Card
								className={cn(
									"cursor-pointer transition-all duration-200 hover:shadow-md",
									isSelected
										? "border-primary shadow-primary/10 shadow-sm ring-1 ring-primary/20"
										: "hover:border-primary/30",
								)}
								onClick={() => onSelect(mode.id)}
							>
								<CardContent className="flex flex-col items-center p-6 text-center">
									<div
										className={cn(
											"mb-4 flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br transition-transform duration-200",
											mode.gradient,
											isSelected && "scale-110",
										)}
									>
										<Icon className="size-7 text-foreground" weight={isSelected ? "fill" : "regular"} />
									</div>
									<p className="font-semibold text-sm">{mode.label()}</p>
									<p className="mt-1 text-muted-foreground text-xs">{mode.description()}</p>
									{isSelected && (
										<motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="mt-3">
											<Badge variant="default" className="text-xs">
												<Trans>Selectionne</Trans>
											</Badge>
										</motion.div>
									)}
								</CardContent>
							</Card>
						</motion.div>
					);
				})}
			</div>

			<div className="flex items-center justify-end pt-2">
				<Button onClick={onNext} disabled={!selectedMode}>
					<Trans>Commencer</Trans>
					<SparkleIcon className="ml-2 size-4" />
				</Button>
			</div>
		</motion.div>
	);
}

// =============================================================================
// GENERATE RESUME VIEW (NEW)
// =============================================================================

type GenerateResumeViewProps = {
	formData: GenerateFormData;
	onFormChange: (field: keyof GenerateFormData, value: string) => void;
	onGenerate: () => void;
	isPending: boolean;
	onBack: () => void;
};

export function GenerateResumeView({ formData, onFormChange, onGenerate, isPending, onBack }: GenerateResumeViewProps) {
	return (
		<motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
			<motion.div variants={itemVariants}>
				<Card>
					<CardContent className="space-y-5 p-6">
						<div className="mb-2">
							<h3 className="font-semibold text-lg">
								<Trans>Generer un nouveau CV</Trans>
							</h3>
							<p className="text-muted-foreground text-sm">
								<Trans>Remplissez vos informations et l'IA generera un CV professionnel complet.</Trans>
							</p>
						</div>

						<div className="grid gap-4 sm:grid-cols-2">
							<div className="space-y-2">
								<Label htmlFor="gen-name">
									<Trans>Nom complet</Trans> *
								</Label>
								<Input
									id="gen-name"
									placeholder={t`ex: Ahmed Bennani`}
									value={formData.fullName}
									onChange={(e) => onFormChange("fullName", e.target.value)}
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="gen-job">
									<Trans>Poste cible</Trans> *
								</Label>
								<Input
									id="gen-job"
									placeholder={t`ex: Technicien, Infirmier, Cariste, Agent HSE`}
									value={formData.targetJob}
									onChange={(e) => onFormChange("targetJob", e.target.value)}
								/>
							</div>
						</div>

						<div className="grid gap-4 sm:grid-cols-2">
							<div className="space-y-2">
								<Label htmlFor="gen-email">
									<Trans>Email</Trans>
								</Label>
								<Input
									id="gen-email"
									type="email"
									placeholder={t`ex: ahmed@email.com`}
									value={formData.email}
									onChange={(e) => onFormChange("email", e.target.value)}
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="gen-phone">
									<Trans>Telephone</Trans>
								</Label>
								<Input
									id="gen-phone"
									placeholder={t`ex: +212 600 000000`}
									value={formData.phone}
									onChange={(e) => onFormChange("phone", e.target.value)}
								/>
							</div>
						</div>

						<div className="grid gap-4 sm:grid-cols-2">
							<div className="space-y-2">
								<Label htmlFor="gen-years">
									<Trans>Annees d'experience</Trans>
								</Label>
								<Input
									id="gen-years"
									type="number"
									min="0"
									max="50"
									placeholder={t`ex: 3`}
									value={formData.yearsExperience}
									onChange={(e) => onFormChange("yearsExperience", e.target.value)}
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="gen-lang">
									<Trans>Langue du CV</Trans>
								</Label>
								<select
									id="gen-lang"
									value={formData.language}
									onChange={(e) => onFormChange("language", e.target.value)}
									className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
								>
									<option value="fr">Francais</option>
									<option value="en">English</option>
								</select>
							</div>
						</div>

						<div className="space-y-2">
							<Label htmlFor="gen-skills">
								<Trans>Competences cles (separees par des virgules)</Trans>
							</Label>
							<Input
								id="gen-skills"
								placeholder={t`ex: Soudure TIG/MIG, CACES R489, Soins infirmiers, Gestion de projet`}
								value={formData.skills}
								onChange={(e) => onFormChange("skills", e.target.value)}
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="gen-education">
								<Trans>Formation (resume)</Trans>
							</Label>
							<Textarea
								id="gen-education"
								placeholder={t`ex: Diplome IMTA, Formation professionnelle, Bac+2 Maintenance industrielle`}
								value={formData.education}
								onChange={(e) => onFormChange("education", e.target.value)}
								rows={2}
								className="resize-y"
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="gen-experience">
								<Trans>Experience professionnelle (resume)</Trans>
							</Label>
							<Textarea
								id="gen-experience"
								placeholder={t`ex: 2 ans chez OCP Group comme technicien, puis 1 an en maintenance industrielle...`}
								value={formData.experience}
								onChange={(e) => onFormChange("experience", e.target.value)}
								rows={3}
								className="resize-y"
							/>
						</div>

						<Button
							onClick={onGenerate}
							disabled={isPending || !formData.fullName.trim() || !formData.targetJob.trim()}
							className="w-full sm:w-auto"
						>
							{isPending ? (
								<>
									<SpinnerGapIcon className="mr-2 size-4 animate-spin" />
									<Trans>Generation en cours...</Trans>
								</>
							) : (
								<>
									<RocketLaunchIcon className="mr-2 size-4" />
									<Trans>Generer mon CV</Trans>
								</>
							)}
						</Button>
					</CardContent>
				</Card>
			</motion.div>

			<div className="flex justify-start pt-2">
				<Button variant="outline" onClick={onBack}>
					<ArrowLeftIcon className="mr-2 size-4" />
					<Trans>Retour</Trans>
				</Button>
			</div>
		</motion.div>
	);
}

// =============================================================================
// GAP ANALYSIS VIEW
// =============================================================================

type GapAnalysisViewProps = {
	result: GapAnalysisResult | null;
	targetRole: string;
	onTargetRoleChange: (value: string) => void;
	onAnalyze: () => void;
	onApplyFixes: () => void;
	isPending: boolean;
	isApplying: boolean;
	onBack: () => void;
	onOpenEditor: () => void;
	hasApplied: boolean;
};

function SeverityBadge({ severity }: { severity: GapSeverity }) {
	const config = {
		critical: { variant: "destructive" as const, label: () => t`Critique` },
		major: { variant: "default" as const, label: () => t`Majeur` },
		minor: { variant: "secondary" as const, label: () => t`Mineur` },
	};
	const c = config[severity];
	return <Badge variant={c.variant}>{c.label()}</Badge>;
}

function ScoreCircle({ score }: { score: number }) {
	const circumference = 2 * Math.PI * 40;
	const offset = circumference - (score / 100) * circumference;
	const color =
		score >= 80
			? "text-green-500 dark:text-green-400"
			: score >= 60
				? "text-amber-500 dark:text-amber-400"
				: "text-red-500 dark:text-red-400";

	return (
		<div className="relative flex items-center justify-center">
			<svg width="100" height="100" viewBox="0 0 100 100" className="-rotate-90">
				<circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="6" className="text-muted/30" />
				<motion.circle
					cx="50"
					cy="50"
					r="40"
					fill="none"
					stroke="currentColor"
					strokeWidth="6"
					strokeLinecap="round"
					strokeDasharray={circumference}
					initial={{ strokeDashoffset: circumference }}
					animate={{ strokeDashoffset: offset }}
					transition={{ duration: 1.2, ease: "easeOut" }}
					className={color}
				/>
			</svg>
			<div className="absolute inset-0 flex items-center justify-center">
				<span className={cn("font-bold text-2xl", color)}>{score}</span>
			</div>
		</div>
	);
}

export function GapAnalysisView({
	result,
	targetRole,
	onTargetRoleChange,
	onAnalyze,
	onApplyFixes,
	isPending,
	isApplying,
	onBack,
	onOpenEditor,
	hasApplied,
}: GapAnalysisViewProps) {
	return (
		<motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
			<motion.div variants={itemVariants}>
				<Card>
					<CardContent className="space-y-4 p-6">
						<div className="space-y-2">
							<Label htmlFor="target-role">
								<Trans>Poste cible (optionnel)</Trans>
							</Label>
							<Input
								id="target-role"
								placeholder={t`ex: Technicien senior, Infirmier chef, Chef d'equipe`}
								value={targetRole}
								onChange={(e) => onTargetRoleChange(e.target.value)}
							/>
						</div>
						<Button onClick={onAnalyze} disabled={isPending} className="w-full sm:w-auto">
							{isPending ? (
								<>
									<SpinnerGapIcon className="mr-2 size-4 animate-spin" />
									<Trans>Analyse en cours...</Trans>
								</>
							) : (
								<>
									<TargetIcon className="mr-2 size-4" />
									<Trans>Analyser le CV</Trans>
								</>
							)}
						</Button>
					</CardContent>
				</Card>
			</motion.div>

			{result && (
				<>
					<motion.div variants={itemVariants} className="flex flex-col items-center gap-4 sm:flex-row">
						<ScoreCircle score={result.overallScore} />
						<div>
							<p className="font-semibold text-lg">
								<Trans>Score global</Trans>
							</p>
							<p className="text-muted-foreground text-sm">
								{result.gaps.length === 0 ? (
									<Trans>Excellent ! Aucune lacune detectee.</Trans>
								) : (
									<Trans>{result.gaps.length} lacune(s) trouvee(s) dans votre CV.</Trans>
								)}
							</p>
						</div>
					</motion.div>

					{result.gaps.length > 0 && (
						<motion.div variants={itemVariants}>
							<h3 className="mb-3 font-semibold text-sm">
								<Trans>Lacunes trouvees</Trans>
							</h3>
							<div className="space-y-3">
								{result.gaps.map((gap, i) => (
									<Card key={`gap-${i}`}>
										<CardContent className="p-4">
											<div className="flex items-start justify-between gap-2">
												<div className="flex-1">
													<div className="flex items-center gap-2">
														<WarningCircleIcon
															className={cn(
																"size-4 shrink-0",
																gap.severity === "critical"
																	? "text-red-500"
																	: gap.severity === "major"
																		? "text-amber-500"
																		: "text-blue-500",
															)}
														/>
														<span className="font-medium text-sm">{gap.section}</span>
													</div>
													<p className="mt-1 text-muted-foreground text-sm">{gap.description}</p>
													<p className="mt-2 text-primary text-xs">{gap.suggestion}</p>
												</div>
												<SeverityBadge severity={gap.severity} />
											</div>
										</CardContent>
									</Card>
								))}
							</div>
						</motion.div>
					)}

					{result.strengths.length > 0 && (
						<motion.div variants={itemVariants}>
							<h3 className="mb-3 font-semibold text-sm">
								<Trans>Points forts</Trans>
							</h3>
							<div className="grid gap-2 sm:grid-cols-2">
								{result.strengths.map((s, i) => (
									<div key={`strength-${i}`} className="flex items-start gap-2 rounded-lg border p-3">
										<CheckCircleIcon weight="fill" className="mt-0.5 size-4 shrink-0 text-green-500" />
										<span className="text-sm">{s}</span>
									</div>
								))}
							</div>
						</motion.div>
					)}

					{result.recommendations.length > 0 && (
						<motion.div variants={itemVariants}>
							<h3 className="mb-3 font-semibold text-sm">
								<Trans>Recommandations</Trans>
							</h3>
							<ul className="space-y-2">
								{result.recommendations.map((rec, i) => (
									<li key={`rec-${i}`} className="flex items-start gap-2 text-sm">
										<SparkleIcon className="mt-0.5 size-4 shrink-0 text-primary" />
										<span>{rec}</span>
									</li>
								))}
							</ul>
						</motion.div>
					)}

					{/* Apply Fixes + Open Editor buttons */}
					<motion.div variants={itemVariants}>
						<Card className="border-primary/30 bg-primary/5">
							<CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
								<div>
									<p className="font-semibold text-sm">
										{hasApplied ? (
											<Trans>Corrections appliquees avec succes !</Trans>
										) : (
											<Trans>Appliquer les corrections automatiquement</Trans>
										)}
									</p>
									<p className="text-muted-foreground text-xs">
										{hasApplied ? (
											<Trans>Votre CV a ete mis a jour. Ouvrez l'editeur pour le consulter.</Trans>
										) : (
											<Trans>L'IA va corriger les lacunes identifiees directement dans votre CV.</Trans>
										)}
									</p>
								</div>
								<div className="flex gap-2">
									{!hasApplied && (
										<Button onClick={onApplyFixes} disabled={isApplying} size="sm">
											{isApplying ? (
												<>
													<SpinnerGapIcon className="mr-2 size-4 animate-spin" />
													<Trans>Application...</Trans>
												</>
											) : (
												<>
													<SparkleIcon className="mr-2 size-4" />
													<Trans>Appliquer les corrections</Trans>
												</>
											)}
										</Button>
									)}
									{hasApplied && (
										<Button onClick={onOpenEditor} size="sm" variant="default">
											<PencilSimpleIcon className="mr-2 size-4" />
											<Trans>Ouvrir dans l'editeur</Trans>
										</Button>
									)}
								</div>
							</CardContent>
						</Card>
					</motion.div>
				</>
			)}

			<div className="flex justify-start pt-2">
				<Button variant="outline" onClick={onBack}>
					<ArrowLeftIcon className="mr-2 size-4" />
					<Trans>Retour</Trans>
				</Button>
			</div>
		</motion.div>
	);
}

// =============================================================================
// ADAPT TO JOB VIEW
// =============================================================================

type AdaptToJobViewProps = {
	result: AdaptResult | null;
	jobDescription: string;
	onJobDescriptionChange: (value: string) => void;
	onAdapt: () => void;
	onApplyAdaptations: () => void;
	isPending: boolean;
	isApplying: boolean;
	onBack: () => void;
	onOpenEditor: () => void;
	hasApplied: boolean;
};

export function AdaptToJobView({
	result,
	jobDescription,
	onJobDescriptionChange,
	onAdapt,
	onApplyAdaptations,
	isPending,
	isApplying,
	onBack,
	onOpenEditor,
	hasApplied,
}: AdaptToJobViewProps) {
	const handleCopy = useCallback((text: string) => {
		navigator.clipboard.writeText(text);
	}, []);

	return (
		<motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
			<motion.div variants={itemVariants}>
				<Card>
					<CardContent className="space-y-4 p-6">
						<div className="space-y-2">
							<Label htmlFor="job-desc">
								<Trans>Description du poste</Trans>
							</Label>
							<Textarea
								id="job-desc"
								placeholder={t`Collez la description complete du poste ici...`}
								value={jobDescription}
								onChange={(e) => onJobDescriptionChange(e.target.value)}
								rows={8}
								className="resize-y"
							/>
						</div>
						<Button onClick={onAdapt} disabled={isPending || !jobDescription.trim()} className="w-full sm:w-auto">
							{isPending ? (
								<>
									<SpinnerGapIcon className="mr-2 size-4 animate-spin" />
									<Trans>Adaptation en cours...</Trans>
								</>
							) : (
								<>
									<BriefcaseIcon className="mr-2 size-4" />
									<Trans>Adapter le CV</Trans>
								</>
							)}
						</Button>
					</CardContent>
				</Card>
			</motion.div>

			{result && (
				<>
					<motion.div variants={itemVariants} className="grid gap-4 sm:grid-cols-3">
						<Card>
							<CardContent className="flex flex-col items-center p-6 text-center">
								<ScoreCircle score={result.matchScore} />
								<p className="mt-2 font-semibold text-sm">
									<Trans>Score de correspondance</Trans>
								</p>
							</CardContent>
						</Card>
						<Card>
							<CardContent className="p-6">
								<p className="mb-2 font-semibold text-green-600 text-sm dark:text-green-400">
									<Trans>Mots-cles trouves</Trans>
								</p>
								<div className="flex flex-wrap gap-1.5">
									{result.keywordsMatched.map((kw) => (
										<Badge key={kw} variant="secondary" className="text-xs">
											{kw}
										</Badge>
									))}
									{result.keywordsMatched.length === 0 && (
										<span className="text-muted-foreground text-xs">
											<Trans>Aucun</Trans>
										</span>
									)}
								</div>
							</CardContent>
						</Card>
						<Card>
							<CardContent className="p-6">
								<p className="mb-2 font-semibold text-amber-600 text-sm dark:text-amber-400">
									<Trans>Mots-cles manquants</Trans>
								</p>
								<div className="flex flex-wrap gap-1.5">
									{result.keywordsMissing.map((kw) => (
										<Badge key={kw} variant="outline" className="text-xs">
											{kw}
										</Badge>
									))}
									{result.keywordsMissing.length === 0 && (
										<span className="text-muted-foreground text-xs">
											<Trans>Aucun</Trans>
										</span>
									)}
								</div>
							</CardContent>
						</Card>
					</motion.div>

					{result.adaptedSections.length > 0 && (
						<motion.div variants={itemVariants}>
							<h3 className="mb-3 font-semibold text-sm">
								<Trans>Sections adaptees</Trans>
							</h3>
							<div className="space-y-4">
								{result.adaptedSections.map((section, i) => (
									<Card key={`section-${i}`}>
										<CardContent className="p-4">
											<div className="mb-3 flex items-center justify-between">
												<Badge variant="outline">{section.section}</Badge>
												<Button
													variant="ghost"
													size="sm"
													onClick={() => handleCopy(section.adapted)}
													className="h-7 text-xs"
												>
													<CopyIcon className="mr-1.5 size-3.5" />
													<Trans>Copier</Trans>
												</Button>
											</div>
											<div className="rounded-md border border-primary/20 bg-primary/5 p-3 text-sm">
												{section.adapted}
											</div>
										</CardContent>
									</Card>
								))}
							</div>
						</motion.div>
					)}

					{/* Apply Adaptations + Open Editor buttons */}
					<motion.div variants={itemVariants}>
						<Card className="border-primary/30 bg-primary/5">
							<CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
								<div>
									<p className="font-semibold text-sm">
										{hasApplied ? (
											<Trans>Adaptations appliquees avec succes !</Trans>
										) : (
											<Trans>Appliquer les adaptations a votre CV</Trans>
										)}
									</p>
									<p className="text-muted-foreground text-xs">
										{hasApplied ? (
											<Trans>Votre CV a ete adapte. Ouvrez l'editeur pour verifier.</Trans>
										) : (
											<Trans>Les sections adaptees seront fusionnees dans votre CV existant.</Trans>
										)}
									</p>
								</div>
								<div className="flex gap-2">
									{!hasApplied && (
										<Button onClick={onApplyAdaptations} disabled={isApplying} size="sm">
											{isApplying ? (
												<>
													<SpinnerGapIcon className="mr-2 size-4 animate-spin" />
													<Trans>Application...</Trans>
												</>
											) : (
												<>
													<SparkleIcon className="mr-2 size-4" />
													<Trans>Appliquer au CV</Trans>
												</>
											)}
										</Button>
									)}
									{hasApplied && (
										<Button onClick={onOpenEditor} size="sm" variant="default">
											<PencilSimpleIcon className="mr-2 size-4" />
											<Trans>Ouvrir dans l'editeur</Trans>
										</Button>
									)}
								</div>
							</CardContent>
						</Card>
					</motion.div>
				</>
			)}

			<div className="flex justify-start pt-2">
				<Button variant="outline" onClick={onBack}>
					<ArrowLeftIcon className="mr-2 size-4" />
					<Trans>Retour</Trans>
				</Button>
			</div>
		</motion.div>
	);
}

// =============================================================================
// AI CHAT VIEW
// =============================================================================

type AiChatViewProps = {
	messages: ChatMessage[];
	input: string;
	onInputChange: (value: string) => void;
	onSend: () => void;
	isPending: boolean;
	onBack: () => void;
	onApplySuggestion?: (suggestion: ChatMessage["suggestion"]) => void;
};

export function AiChatView({
	messages,
	input,
	onInputChange,
	onSend,
	isPending,
	onBack,
	onApplySuggestion,
}: AiChatViewProps) {
	const scrollRef = useRef<HTMLDivElement>(null);

	const handleKeyDown = useCallback(
		(e: React.KeyboardEvent) => {
			if (e.key === "Enter" && !e.shiftKey) {
				e.preventDefault();
				if (input.trim() && !isPending) onSend();
			}
		},
		[input, isPending, onSend],
	);

	return (
		<motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-4">
			<motion.div variants={itemVariants}>
				<Card className="flex flex-col" style={{ height: "min(500px, 60vh)" }}>
					<div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto p-4">
						{messages.length === 0 && (
							<div className="flex h-full flex-col items-center justify-center text-center">
								<ChatCircleDotsIcon className="mb-3 size-10 text-muted-foreground/40" />
								<p className="font-medium text-muted-foreground">
									<Trans>Demarrer une conversation</Trans>
								</p>
								<p className="mt-1 text-muted-foreground/60 text-xs">
									<Trans>Demandez a l'IA d'ameliorer des sections specifiques de votre CV.</Trans>
								</p>
							</div>
						)}

						{messages.map((msg) => (
							<div key={msg.id} className={cn("flex", msg.role === "user" ? "justify-end" : "justify-start")}>
								<div
									className={cn(
										"max-w-[85%] rounded-2xl px-4 py-2.5 text-sm",
										msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted",
									)}
								>
									<p className="whitespace-pre-wrap">{msg.content}</p>

									{msg.suggestion && (
										<div className="mt-3 rounded-lg border border-primary/20 bg-background/80 p-3">
											<div className="flex items-center justify-between">
												<Badge variant="outline" className="text-xs">
													{msg.suggestion.section}
												</Badge>
												{onApplySuggestion && (
													<Button
														variant="ghost"
														size="sm"
														onClick={() => onApplySuggestion(msg.suggestion)}
														className="h-6 text-xs"
													>
														<CopyIcon className="mr-1 size-3" />
														<Trans>Copier</Trans>
													</Button>
												)}
											</div>
											<div className="mt-2 space-y-1.5">
												<p className="text-muted-foreground text-xs line-through">{msg.suggestion.original}</p>
												<p className="text-primary text-xs">{msg.suggestion.improved}</p>
											</div>
										</div>
									)}
								</div>
							</div>
						))}

						{isPending && (
							<div className="flex justify-start">
								<div className="flex items-center gap-2 rounded-2xl bg-muted px-4 py-3">
									<SpinnerGapIcon className="size-4 animate-spin text-primary" />
									<span className="text-muted-foreground text-sm">
										<Trans>Reflexion...</Trans>
									</span>
								</div>
							</div>
						)}
					</div>

					<div className="border-t p-3">
						<div className="flex items-end gap-2">
							<Textarea
								placeholder={t`Posez une question sur votre CV...`}
								value={input}
								onChange={(e) => onInputChange(e.target.value)}
								onKeyDown={handleKeyDown}
								rows={1}
								className="max-h-[120px] min-h-[40px] resize-none"
							/>
							<Button size="sm" onClick={onSend} disabled={!input.trim() || isPending} className="shrink-0">
								<PaperPlaneTiltIcon className="size-4" />
							</Button>
						</div>
					</div>
				</Card>
			</motion.div>

			<div className="flex justify-start">
				<Button variant="outline" onClick={onBack}>
					<ArrowLeftIcon className="mr-2 size-4" />
					<Trans>Retour</Trans>
				</Button>
			</div>
		</motion.div>
	);
}
