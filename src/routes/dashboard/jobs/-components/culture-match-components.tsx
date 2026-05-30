import { Trans } from "@lingui/react/macro";
import {
	ArrowLeftIcon,
	ArrowRightIcon,
	BriefcaseIcon,
	BuildingsIcon,
	CaretDownIcon,
	CaretRightIcon,
	CaretUpIcon,
	ChartBarIcon,
	ChatCircleIcon,
	CheckCircleIcon,
	ClockIcon,
	CoffeeIcon,
	GlobeIcon,
	HandshakeIcon,
	HeartIcon,
	HouseIcon,
	LightbulbIcon,
	MedalIcon,
	QuestionIcon,
	RocketLaunchIcon,
	ScalesIcon,
	ShieldCheckIcon,
	SparkleIcon,
	SpinnerGapIcon,
	StarIcon,
	TargetIcon,
	TrendUpIcon,
	TrophyIcon,
	UserCircleIcon,
	UsersIcon,
	WarningCircleIcon,
	XCircleIcon,
} from "@phosphor-icons/react";
import { AnimatePresence, motion } from "motion/react";
import {
	Legend,
	PolarAngleAxis,
	PolarGrid,
	PolarRadiusAxis,
	Radar,
	RadarChart,
	Tooltip as RechartsTooltip,
	ResponsiveContainer,
} from "recharts";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/utils/style";

import {
	COMPANY_PROFILES,
	CULTURE_QUESTIONS,
	RED_FLAGS,
	VALUES_QUESTIONS,
	WORK_STYLE_QUESTIONS,
} from "./culture-match-data";
import type { PersonalCultureProfile } from "./culture-match-types";

// =============================================================================
// LOADING STATE
// =============================================================================

export function CultureMatchLoading() {
	return (
		<div className="space-y-6">
			<Skeleton className="h-64 w-full rounded-2xl" />
			<div className="flex gap-2">
				{Array.from({ length: 8 }).map((_, i) => (
					<Skeleton key={i} className="h-10 w-32 rounded-full" />
				))}
			</div>
			<Skeleton className="h-96 w-full rounded-xl" />
		</div>
	);
}

// =============================================================================
// ERROR STATE
// =============================================================================

interface ErrorStateProps {
	onRetry: () => void;
}

export function CultureMatchError({ onRetry }: ErrorStateProps) {
	return (
		<Card className="border-destructive">
			<CardContent className="flex flex-col items-center justify-center py-16">
				<WarningCircleIcon className="mb-4 size-16 text-destructive" weight="duotone" />
				<h3 className="mb-2 font-semibold text-lg">
					<Trans>Erreur de chargement</Trans>
				</h3>
				<p className="mb-6 text-center text-muted-foreground">
					<Trans>Impossible de charger ton évaluation. Réessaie.</Trans>
				</p>
				<Button onClick={onRetry}>
					<Trans>Réessayer</Trans>
				</Button>
			</CardContent>
		</Card>
	);
}

// =============================================================================
// HERO SECTION
// =============================================================================

interface HeroSectionProps {
	overallProgress: number;
}

export function HeroSection({ overallProgress }: HeroSectionProps) {
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
					<HeartIcon className="size-5 text-primary" weight="fill" />
					<span className="font-semibold text-primary text-sm uppercase tracking-wider">
						<Trans>Compatibilité culturelle</Trans>
					</span>
				</motion.div>

				<motion.h2
					className="mb-4 max-w-4xl font-bold text-3xl tracking-tight md:text-4xl"
					initial={false}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.3 }}
				>
					<Trans>Trouve l'entreprise qui te correspond</Trans>
				</motion.h2>

				<motion.p
					className="mb-8 max-w-2xl text-lg text-muted-foreground"
					initial={false}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.4 }}
				>
					<Trans>
						Compare tes valeurs, ton style de travail et les attentes des employeurs pour cibler les environnements où
						tu peux vraiment réussir.
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
							<TargetIcon className="size-5 text-primary" weight="duotone" />
						</div>
						<div>
							<p className="font-bold text-xl">{Math.round(overallProgress)}%</p>
							<p className="text-muted-foreground text-sm">
								<Trans>Progress</Trans>
							</p>
						</div>
					</div>
					<div className="flex items-center gap-2">
						<div className="flex size-10 items-center justify-center rounded-full bg-amber-500/10">
							<BuildingsIcon className="size-5 text-amber-500" weight="duotone" />
						</div>
						<div>
							<p className="font-bold text-xl">{COMPANY_PROFILES.length}</p>
							<p className="text-muted-foreground text-sm">
								<Trans>Entreprises</Trans>
							</p>
						</div>
					</div>
					<div className="flex items-center gap-2">
						<div className="flex size-10 items-center justify-center rounded-full bg-green-500/10">
							<CheckCircleIcon className="size-5 text-green-500" weight="duotone" />
						</div>
						<div>
							<p className="font-bold text-xl">{CULTURE_QUESTIONS.length}</p>
							<p className="text-muted-foreground text-sm">
								<Trans>Questions à poser</Trans>
							</p>
						</div>
					</div>
				</motion.div>
			</div>
		</motion.div>
	);
}

// =============================================================================
// TAB DEFINITIONS
// =============================================================================

export const TAB_ITEMS = [
	{ value: "work-style", icon: BriefcaseIcon, label: "Style de travail" },
	{ value: "values", icon: StarIcon, label: "Valeurs" },
	{ value: "companies", icon: BuildingsIcon, label: "Entreprises" },
	{ value: "compatibility", icon: ChartBarIcon, label: "Compatibilité" },
	{ value: "red-flags", icon: WarningCircleIcon, label: "Alertes" },
	{ value: "questions", icon: ChatCircleIcon, label: "Questions" },
	{ value: "compare", icon: ScalesIcon, label: "Comparer" },
	{ value: "profile", icon: UserCircleIcon, label: "Mon profil" },
] as const;

// =============================================================================
// WORK STYLE TAB
// =============================================================================

interface WorkStyleTabProps {
	currentWorkStyleQuestion: number;
	workStyleProgress: number;
	workStyleAnswers: Record<string, string>;
	isPending: boolean;
	onAnswer: (questionId: string, optionId: string) => void;
	onNavigate: (index: number) => void;
}

export function WorkStyleTab({
	currentWorkStyleQuestion,
	workStyleProgress,
	workStyleAnswers,
	isPending,
	onAnswer,
	onNavigate,
}: WorkStyleTabProps) {
	const currentQ = WORK_STYLE_QUESTIONS[currentWorkStyleQuestion];

	return (
		<div className="space-y-6">
			{/* Progress */}
			<Card>
				<CardContent className="p-4">
					<div className="mb-2 flex items-center justify-between">
						<span className="font-medium text-sm">
							<Trans>
								Question {currentWorkStyleQuestion + 1} sur {WORK_STYLE_QUESTIONS.length}
							</Trans>
						</span>
						<span className="text-muted-foreground text-sm">{Math.round(workStyleProgress)}%</span>
					</div>
					<Progress value={workStyleProgress} className="h-2" />
				</CardContent>
			</Card>

			{/* Current Question */}
			<AnimatePresence mode="wait">
				<motion.div
					key={currentQ.id}
					initial={{ opacity: 0, x: 50 }}
					animate={{ opacity: 1, x: 0 }}
					exit={{ opacity: 0, x: -50 }}
					transition={{ duration: 0.3 }}
				>
					<Card className="border-2 border-primary/20">
						<CardHeader>
							<Badge className="mb-2 w-fit" variant="secondary">
								{currentQ.category === "environment" && "Environnement"}
								{currentQ.category === "collaboration" && "Collaboration"}
								{currentQ.category === "structure" && "Structure"}
								{currentQ.category === "communication" && "Communication"}
								{currentQ.category === "growth" && "Croissance"}
							</Badge>
							<CardTitle className="text-2xl">{currentQ.question}</CardTitle>
						</CardHeader>
						<CardContent className="space-y-3">
							{currentQ.options.map((option, index) => {
								const isSelected = workStyleAnswers[currentQ.id] === option.id;

								return (
									<motion.button
										key={option.id}
										type="button"
										initial={{ opacity: 0, y: 20 }}
										animate={{ opacity: 1, y: 0 }}
										transition={{ delay: index * 0.1 }}
										onClick={() => onAnswer(currentQ.id, option.id)}
										disabled={isPending}
										className={cn(
											"flex w-full items-center gap-4 rounded-xl border-2 p-4 text-left transition-all duration-200",
											isSelected
												? "border-primary bg-primary/10 shadow-lg shadow-primary/20"
												: "border-border bg-card hover:border-primary/50 hover:bg-primary/5",
											isPending && "cursor-not-allowed opacity-50",
										)}
									>
										<div
											className={cn(
												"flex size-10 shrink-0 items-center justify-center rounded-full transition-colors",
												isSelected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
											)}
										>
											{String.fromCharCode(65 + index)}
										</div>
										<span className="font-medium">{option.text}</span>
										{isSelected && <CheckCircleIcon className="ml-auto size-5 text-primary" weight="fill" />}
									</motion.button>
								);
							})}
						</CardContent>
					</Card>
				</motion.div>
			</AnimatePresence>

			{/* Navigation */}
			<div className="flex items-center justify-between">
				<Button
					variant="outline"
					disabled={currentWorkStyleQuestion === 0}
					onClick={() => onNavigate(Math.max(0, currentWorkStyleQuestion - 1))}
					className="gap-2"
				>
					<ArrowLeftIcon className="size-4" />
					<Trans>Previous</Trans>
				</Button>
				<div className="flex gap-1">
					{WORK_STYLE_QUESTIONS.map((_, idx) => (
						<button
							key={idx}
							type="button"
							onClick={() => onNavigate(idx)}
							className={cn(
								"size-3 rounded-full transition-colors",
								idx === currentWorkStyleQuestion
									? "bg-primary"
									: workStyleAnswers[WORK_STYLE_QUESTIONS[idx].id]
										? "bg-primary/50"
										: "bg-muted",
							)}
						/>
					))}
				</div>
				<Button
					variant="outline"
					disabled={currentWorkStyleQuestion === WORK_STYLE_QUESTIONS.length - 1}
					onClick={() => onNavigate(Math.min(WORK_STYLE_QUESTIONS.length - 1, currentWorkStyleQuestion + 1))}
					className="gap-2"
				>
					<Trans>Next</Trans>
					<ArrowRightIcon className="size-4" />
				</Button>
			</div>
		</div>
	);
}

// =============================================================================
// VALUES TAB
// =============================================================================

interface ValuesTabProps {
	valuesScores: Record<string, number>;
	valuesProgress: number;
	overallProgress: number;
	isPending: boolean;
	isSaving: boolean;
	onScore: (questionId: string, score: number) => void;
	onGenerateProfile: () => void;
}

export function ValuesTab({
	valuesScores,
	valuesProgress,
	overallProgress,
	isPending,
	isSaving,
	onScore,
	onGenerateProfile,
}: ValuesTabProps) {
	return (
		<div className="space-y-6">
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<StarIcon className="size-5 text-amber-500" weight="fill" />
						<Trans>Alignement des valeurs</Trans>
					</CardTitle>
					<CardDescription>
						<Trans>Rate each statement from 1 (strongly disagree) to 5 (strongly agree)</Trans>
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="space-y-6">
						{VALUES_QUESTIONS.map((question, index) => (
							<motion.div
								key={question.id}
								initial={false}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: index * 0.05 }}
								className="space-y-3"
							>
								<div className="flex items-start justify-between gap-4">
									<p className="font-medium">{question.statement}</p>
									<Badge variant="outline" className="shrink-0">
										{question.category}
									</Badge>
								</div>
								<div className="flex items-center gap-2">
									<span className="w-20 text-muted-foreground text-sm">
										<Trans>Disagree</Trans>
									</span>
									<div className="flex flex-1 justify-center gap-2">
										{[1, 2, 3, 4, 5].map((score) => (
											<button
												key={score}
												type="button"
												onClick={() => onScore(question.id, score)}
												disabled={isPending}
												className={cn(
													"size-10 rounded-full border-2 font-medium transition-all",
													valuesScores[question.id] === score
														? "scale-110 border-primary bg-primary text-primary-foreground"
														: "border-muted hover:border-primary/50 hover:bg-primary/5",
													isPending && "cursor-not-allowed opacity-50",
												)}
											>
												{score}
											</button>
										))}
									</div>
									<span className="w-20 text-right text-muted-foreground text-sm">
										<Trans>Agree</Trans>
									</span>
								</div>
							</motion.div>
						))}
					</div>

					<div className="mt-6 border-t pt-6">
						<div className="flex items-center justify-between">
							<span className="text-muted-foreground text-sm">
								{Object.keys(valuesScores).length} / {VALUES_QUESTIONS.length} <Trans>answers</Trans>
							</span>
							<Progress value={valuesProgress} className="h-2 w-32" />
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Generate Profile Button */}
			{overallProgress >= 80 && (
				<motion.div initial={false} animate={{ opacity: 1, y: 0 }} className="flex justify-center">
					<Button size="lg" onClick={onGenerateProfile} disabled={isSaving} className="gap-2">
						{isSaving ? (
							<SpinnerGapIcon className="size-5 animate-spin" />
						) : (
							<SparkleIcon className="size-5" weight="fill" />
						)}
						<Trans>Generate my cultural profile</Trans>
					</Button>
				</motion.div>
			)}
		</div>
	);
}

// =============================================================================
// COMPANIES TAB
// =============================================================================

export function CompaniesTab() {
	return (
		<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
			{COMPANY_PROFILES.map((company, index) => (
				<motion.div key={company.id} initial={false} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
					<Card className="h-full transition-shadow hover:shadow-lg">
						<CardHeader>
							<div className="flex items-start justify-between">
								<div>
									<CardTitle>{company.name}</CardTitle>
									<CardDescription className="mt-1 flex items-center gap-1">
										<BuildingsIcon className="size-3" />
										{company.industry}
									</CardDescription>
								</div>
								<Badge variant="outline">{company.size}</Badge>
							</div>
						</CardHeader>
						<CardContent className="space-y-4">
							<p className="text-muted-foreground text-sm">{company.description}</p>

							<div className="flex items-center gap-2 text-sm">
								<GlobeIcon className="size-4" />
								{company.location}
							</div>

							<div>
								<p className="mb-2 font-medium text-muted-foreground text-xs">
									<Trans>Valeurs</Trans>
								</p>
								<div className="flex flex-wrap gap-1">
									{company.values.map((value) => (
										<Badge key={value} variant="secondary" className="text-xs">
											{value}
										</Badge>
									))}
								</div>
							</div>

							<div>
								<p className="mb-2 font-medium text-muted-foreground text-xs">
									<Trans>Avantages</Trans>
								</p>
								<div className="flex flex-wrap gap-1">
									{company.perks.slice(0, 3).map((perk) => (
										<Badge key={perk} variant="outline" className="text-xs">
											{perk}
										</Badge>
									))}
									{company.perks.length > 3 && (
										<Badge variant="outline" className="text-xs">
											+{company.perks.length - 3}
										</Badge>
									)}
								</div>
							</div>

							<div className="border-t pt-4">
								<div className="grid grid-cols-2 gap-2 text-xs">
									<div className="flex items-center gap-1">
										<HouseIcon className="size-3" />
										{company.remotePolicy}
									</div>
									<div className="flex items-center gap-1">
										<ClockIcon className="size-3" />
										{company.workStyle.split(" ")[0]}
									</div>
								</div>
							</div>
						</CardContent>
					</Card>
				</motion.div>
			))}
		</div>
	);
}

// =============================================================================
// COMPATIBILITY TAB
// =============================================================================

interface CompatibilityTabProps {
	personalProfile: PersonalCultureProfile | null;
	radarData: { dimension: string; value: number; fullMark: number }[];
	companyCompatibility: ((typeof COMPANY_PROFILES)[number] & { compatibility: number })[];
	onSwitchTab: (tab: string) => void;
}

export function CompatibilityTab({
	personalProfile,
	radarData,
	companyCompatibility,
	onSwitchTab,
}: CompatibilityTabProps) {
	if (!personalProfile) {
		return (
			<Card className="border-dashed">
				<CardContent className="flex flex-col items-center justify-center py-16">
					<ChartBarIcon className="mb-4 size-16 text-muted-foreground/50" weight="duotone" />
					<h3 className="mb-2 font-semibold text-lg">
						<Trans>Complète ton évaluation</Trans>
					</h3>
					<p className="mb-6 max-w-md text-center text-muted-foreground">
						<Trans>
							Réponds aux questions sur ton style de travail et tes valeurs pour voir les entreprises les plus
							compatibles.
						</Trans>
					</p>
					<div className="flex gap-4">
						<Button onClick={() => onSwitchTab("work-style")} variant="outline">
							<Trans>Style de travail</Trans>
						</Button>
						<Button onClick={() => onSwitchTab("values")}>
							<Trans>Valeurs</Trans>
						</Button>
					</div>
				</CardContent>
			</Card>
		);
	}

	return (
		<div className="space-y-6">
			{/* Radar Chart */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<ChartBarIcon className="size-5 text-primary" />
						<Trans>Ton profil culturel</Trans>
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="h-80">
						<ResponsiveContainer width="100%" height="100%">
							<RadarChart data={radarData}>
								<PolarGrid />
								<PolarAngleAxis dataKey="dimension" tick={{ fontSize: 12 }} />
								<PolarRadiusAxis angle={30} domain={[0, 100]} />
								<Radar
									name="Ton profil"
									dataKey="value"
									stroke="hsl(var(--primary))"
									fill="hsl(var(--primary))"
									fillOpacity={0.3}
								/>
								<Legend />
								<RechartsTooltip />
							</RadarChart>
						</ResponsiveContainer>
					</div>
				</CardContent>
			</Card>

			{/* Company Matches */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<TrophyIcon className="size-5 text-amber-500" weight="fill" />
						<Trans>Entreprises compatibles</Trans>
					</CardTitle>
					<CardDescription>
						<Trans>Classées selon leur compatibilité avec ton profil</Trans>
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					{companyCompatibility.map((company, index) => (
						<motion.div
							key={company.id}
							initial={false}
							animate={{ opacity: 1, x: 0 }}
							transition={{ delay: index * 0.1 }}
							className={cn(
								"flex items-center gap-4 rounded-xl border p-4",
								index === 0 && "border-amber-500/50 bg-amber-500/5",
							)}
						>
							{index === 0 && <MedalIcon className="size-8 shrink-0 text-amber-500" weight="fill" />}
							{index === 1 && <MedalIcon className="size-8 shrink-0 text-gray-400" weight="fill" />}
							{index === 2 && <MedalIcon className="size-8 shrink-0 text-amber-700" weight="fill" />}
							{index > 2 && (
								<div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted font-medium">
									{index + 1}
								</div>
							)}
							<div className="min-w-0 flex-1">
								<h4 className="font-semibold">{company.name}</h4>
								<p className="truncate text-muted-foreground text-sm">
									{company.industry} | {company.location}
								</p>
							</div>
							<div className="text-right">
								<p
									className={cn(
										"font-bold text-2xl",
										company.compatibility >= 80
											? "text-green-500"
											: company.compatibility >= 60
												? "text-amber-500"
												: "text-red-500",
									)}
								>
									{company.compatibility}%
								</p>
								<p className="text-muted-foreground text-xs">
									<Trans>compatibilité</Trans>
								</p>
							</div>
						</motion.div>
					))}
				</CardContent>
			</Card>
		</div>
	);
}

// =============================================================================
// RED FLAGS TAB
// =============================================================================

interface RedFlagsTabProps {
	redFlagsChecked: string[];
	isPending: boolean;
	onToggle: (flagId: string) => void;
}

export function RedFlagsTab({ redFlagsChecked, isPending, onToggle }: RedFlagsTabProps) {
	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<WarningCircleIcon className="size-5 text-red-500" weight="fill" />
					<Trans>Détecteur d'alertes</Trans>
				</CardTitle>
				<CardDescription>
					<Trans>Coche les signaux d'alerte observés pendant tes entretiens ou tes recherches</Trans>
				</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="space-y-6">
					{["Recrutement", "Management", "Compensation", "Culture", "Conditions", "Transparence"].map((category) => {
						const categoryFlags = RED_FLAGS.filter((f) => f.category === category);
						const checkedCount = categoryFlags.filter((f) => redFlagsChecked.includes(f.id)).length;

						return (
							<div key={category} className="space-y-3">
								<div className="flex items-center justify-between">
									<h4 className="font-semibold">{category}</h4>
									{checkedCount > 0 && <Badge variant="destructive">{checkedCount} alert(s)</Badge>}
								</div>
								<div className="space-y-2">
									{categoryFlags.map((flag) => (
										<div
											key={flag.id}
											className={cn(
												"flex items-start gap-3 rounded-lg border p-3 transition-colors",
												redFlagsChecked.includes(flag.id) && "border-red-500/50 bg-red-500/5",
											)}
										>
											<Checkbox
												id={flag.id}
												checked={redFlagsChecked.includes(flag.id)}
												onCheckedChange={() => onToggle(flag.id)}
												disabled={isPending}
												className="mt-0.5"
											/>
											<div className="min-w-0 flex-1">
												<label htmlFor={flag.id} className="flex cursor-pointer items-center gap-2 font-medium">
													{flag.flag}
													<Badge
														variant="outline"
														className={cn(
															"text-xs",
															flag.severity === "high" && "border-red-500 text-red-500",
															flag.severity === "medium" && "border-amber-500 text-amber-500",
															flag.severity === "low" && "border-blue-500 text-blue-500",
														)}
													>
														{flag.severity === "high" && "Critique"}
														{flag.severity === "medium" && "Moyen"}
														{flag.severity === "low" && "Faible"}
													</Badge>
												</label>
												<p className="mt-1 text-muted-foreground text-sm">{flag.explanation}</p>
											</div>
										</div>
									))}
								</div>
							</div>
						);
					})}
				</div>

				{/* Summary */}
				{redFlagsChecked.length > 0 && (
					<div className="mt-6 border-t pt-6">
						<div className="flex items-center gap-4 rounded-lg border border-red-500/30 bg-red-500/10 p-4">
							<XCircleIcon className="size-8 shrink-0 text-red-500" weight="fill" />
							<div>
								<h4 className="font-semibold text-red-700 dark:text-red-400">
									{redFlagsChecked.length} signal(aux) d'alerte détecté(s)
								</h4>
								<p className="text-muted-foreground text-sm">
									<Trans>Sois prudent et pose des questions supplémentaires avant de décider.</Trans>
								</p>
							</div>
						</div>
					</div>
				)}
			</CardContent>
		</Card>
	);
}

// =============================================================================
// QUESTIONS TAB
// =============================================================================

interface QuestionsTabProps {
	expandedQuestion: string | null;
	onToggleExpand: (questionId: string | null) => void;
}

export function QuestionsTab({ expandedQuestion, onToggleExpand }: QuestionsTabProps) {
	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<QuestionIcon className="size-5 text-primary" />
					<Trans>Questions à poser aux employeurs</Trans>
				</CardTitle>
				<CardDescription>
					<Trans>Questions utiles pour évaluer la culture d'entreprise pendant tes entretiens</Trans>
				</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="space-y-4">
					{CULTURE_QUESTIONS.map((question, index) => {
						const isExpanded = expandedQuestion === question.id;

						return (
							<motion.div
								key={question.id}
								initial={false}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: index * 0.05 }}
								className="overflow-hidden rounded-lg border"
							>
								<button
									type="button"
									onClick={() => onToggleExpand(isExpanded ? null : question.id)}
									className="flex w-full items-center justify-between p-4 text-left transition-colors hover:bg-muted/50"
								>
									<div className="flex items-center gap-3">
										<Badge variant="secondary">{question.category}</Badge>
										<span className="font-medium">{question.question}</span>
									</div>
									{isExpanded ? (
										<CaretUpIcon className="size-5 shrink-0 text-muted-foreground" />
									) : (
										<CaretDownIcon className="size-5 shrink-0 text-muted-foreground" />
									)}
								</button>

								<AnimatePresence>
									{isExpanded && (
										<motion.div
											initial={{ height: 0, opacity: 0 }}
											animate={{ height: "auto", opacity: 1 }}
											exit={{ height: 0, opacity: 0 }}
											className="overflow-hidden"
										>
											<div className="space-y-4 border-t bg-muted/30 p-4 pt-0">
												<div>
													<p className="mb-1 font-medium text-muted-foreground text-sm">
														<Trans>Pourquoi poser cette question ?</Trans>
													</p>
													<p className="text-sm">{question.whyAsk}</p>
												</div>

												<div className="grid gap-4 md:grid-cols-2">
													<div className="rounded-lg border border-green-500/30 bg-green-500/10 p-3">
														<p className="mb-2 flex items-center gap-1 font-medium text-green-700 text-sm dark:text-green-400">
															<CheckCircleIcon className="size-4" weight="fill" />
															<Trans>Bons signaux</Trans>
														</p>
														<ul className="space-y-1">
															{question.greenFlags.map((flag) => (
																<li key={flag} className="flex items-center gap-2 text-sm">
																	<CaretRightIcon className="size-3 text-green-500" />
																	{flag}
																</li>
															))}
														</ul>
													</div>

													<div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3">
														<p className="mb-2 flex items-center gap-1 font-medium text-red-700 text-sm dark:text-red-400">
															<XCircleIcon className="size-4" weight="fill" />
															<Trans>Signaux d'alerte</Trans>
														</p>
														<ul className="space-y-1">
															{question.redFlags.map((flag) => (
																<li key={flag} className="flex items-center gap-2 text-sm">
																	<CaretRightIcon className="size-3 text-red-500" />
																	{flag}
																</li>
															))}
														</ul>
													</div>
												</div>
											</div>
										</motion.div>
									)}
								</AnimatePresence>
							</motion.div>
						);
					})}
				</div>
			</CardContent>
		</Card>
	);
}

// =============================================================================
// COMPARE TAB
// =============================================================================

interface CompareTabProps {
	personalProfile: PersonalCultureProfile | null;
	selectedCompanies: string[];
	companyCompatibility: ((typeof COMPANY_PROFILES)[number] & { compatibility: number })[];
	comparisonRadarData: Record<string, string | number>[];
	onToggleCompany: (companyId: string) => void;
	onSwitchTab: (tab: string) => void;
}

export function CompareTab({
	personalProfile,
	selectedCompanies,
	companyCompatibility,
	comparisonRadarData,
	onToggleCompany,
	onSwitchTab,
}: CompareTabProps) {
	if (!personalProfile) {
		return (
			<Card className="border-dashed">
				<CardContent className="flex flex-col items-center justify-center py-16">
					<ScalesIcon className="mb-4 size-16 text-muted-foreground/50" weight="duotone" />
					<h3 className="mb-2 font-semibold text-lg">
						<Trans>Profil requis</Trans>
					</h3>
					<p className="mb-6 max-w-md text-center text-muted-foreground">
						<Trans>Complète d'abord ton évaluation pour comparer les entreprises.</Trans>
					</p>
					<Button onClick={() => onSwitchTab("work-style")}>
						<Trans>Commencer l'évaluation</Trans>
					</Button>
				</CardContent>
			</Card>
		);
	}

	return (
		<div className="space-y-6">
			{/* Company Selection */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<ScalesIcon className="size-5 text-primary" />
						<Trans>Comparer les entreprises</Trans>
					</CardTitle>
					<CardDescription>
						<Trans>Sélectionne jusqu'à 2 entreprises à comparer avec ton profil</Trans>
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
						{COMPANY_PROFILES.map((company) => {
							const isSelected = selectedCompanies.includes(company.id);
							const compatibility = companyCompatibility.find((c) => c.id === company.id)?.compatibility || 0;

							return (
								<button
									key={company.id}
									type="button"
									onClick={() => onToggleCompany(company.id)}
									className={cn(
										"flex items-center gap-3 rounded-lg border p-3 text-left transition-all",
										isSelected ? "border-primary bg-primary/10" : "hover:border-primary/50 hover:bg-muted/50",
									)}
								>
									<div
										className={cn(
											"flex size-6 shrink-0 items-center justify-center rounded-full border-2",
											isSelected ? "border-primary bg-primary" : "border-muted-foreground/30",
										)}
									>
										{isSelected && <CheckCircleIcon className="size-4 text-primary-foreground" weight="fill" />}
									</div>
									<div className="min-w-0 flex-1">
										<p className="truncate font-medium">{company.name}</p>
										<p className="text-muted-foreground text-xs">{compatibility}% compatible</p>
									</div>
								</button>
							);
						})}
					</div>
				</CardContent>
			</Card>

			{/* Comparison Chart */}
			{selectedCompanies.length > 0 && (
				<Card>
					<CardHeader>
						<CardTitle>
							<Trans>Visual Comparison</Trans>
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="h-96">
							<ResponsiveContainer width="100%" height="100%">
								<RadarChart data={comparisonRadarData}>
									<PolarGrid />
									<PolarAngleAxis dataKey="dimension" tick={{ fontSize: 11 }} />
									<PolarRadiusAxis angle={30} domain={[0, 100]} />
									<Radar
										name="Your profile"
										dataKey="Your profile"
										stroke="hsl(var(--primary))"
										fill="hsl(var(--primary))"
										fillOpacity={0.2}
									/>
									{selectedCompanies.map((companyId, idx) => {
										const company = COMPANY_PROFILES.find((c) => c.id === companyId);
										if (!company) return null;
										const colors = ["#10b981", "#f59e0b"];
										return (
											<Radar
												key={companyId}
												name={company.name}
												dataKey={company.name}
												stroke={colors[idx]}
												fill={colors[idx]}
												fillOpacity={0.2}
											/>
										);
									})}
									<Legend />
									<RechartsTooltip />
								</RadarChart>
							</ResponsiveContainer>
						</div>
					</CardContent>
				</Card>
			)}

			{/* Side by Side Comparison */}
			{selectedCompanies.length === 2 && (
				<Card>
					<CardHeader>
						<CardTitle>
							<Trans>Detailed Comparison</Trans>
						</CardTitle>
					</CardHeader>
					<CardContent>
						<ScrollArea className="h-96">
							<div className="space-y-4">
								{[
									{ key: "workLifeBalance", label: "Work-life balance" },
									{ key: "innovation", label: "Innovation" },
									{ key: "collaboration", label: "Collaboration" },
									{ key: "growth", label: "Growth" },
									{ key: "diversity", label: "Diversity" },
									{ key: "transparency", label: "Transparency" },
								].map(({ key, label }) => {
									const companies = selectedCompanies
										.map((id) => COMPANY_PROFILES.find((c) => c.id === id))
										.filter((c): c is (typeof COMPANY_PROFILES)[number] => c !== undefined);
									const userScore = personalProfile[key as keyof PersonalCultureProfile];

									return (
										<div key={key} className="space-y-2">
											<div className="flex items-center justify-between">
												<span className="font-medium text-sm">{label}</span>
												<span className="text-muted-foreground text-xs">Your preference: {userScore}</span>
											</div>
											<div className="grid grid-cols-2 gap-4">
												{companies.map((company) => {
													const score = company.cultureScores[key as keyof typeof company.cultureScores];
													const diff = Math.abs(score - userScore);
													const isGoodMatch = diff <= 20;

													return (
														<div key={company.id} className="space-y-1">
															<div className="flex items-center justify-between text-xs">
																<span className="truncate">{company.name}</span>
																<span className={cn("font-medium", isGoodMatch ? "text-green-500" : "text-amber-500")}>
																	{score}
																</span>
															</div>
															<Progress value={score} className="h-2" />
														</div>
													);
												})}
											</div>
										</div>
									);
								})}
							</div>
						</ScrollArea>
					</CardContent>
				</Card>
			)}
		</div>
	);
}

// =============================================================================
// PROFILE TAB
// =============================================================================

interface ProfileTabProps {
	personalProfile: PersonalCultureProfile | null;
	radarData: { dimension: string; value: number; fullMark: number }[];
	companyCompatibility: ((typeof COMPANY_PROFILES)[number] & { compatibility: number })[];
	workStyleProgress: number;
	valuesProgress: number;
	isResetting: boolean;
	onReset: () => void;
	onSwitchTab: (tab: string) => void;
}

export function ProfileTab({
	personalProfile,
	radarData,
	companyCompatibility,
	workStyleProgress,
	valuesProgress,
	isResetting,
	onReset,
	onSwitchTab,
}: ProfileTabProps) {
	if (!personalProfile) {
		return (
			<Card className="border-dashed">
				<CardContent className="flex flex-col items-center justify-center py-16">
					<UserCircleIcon className="mb-4 size-16 text-muted-foreground/50" weight="duotone" />
					<h3 className="mb-2 font-semibold text-lg">
						<Trans>Profil non complété</Trans>
					</h3>
					<p className="mb-6 max-w-md text-center text-muted-foreground">
						<Trans>
							Complète les questionnaires sur ton style de travail et tes valeurs pour générer ton profil culturel
							personnalisé.
						</Trans>
					</p>
					<div className="mb-6 flex items-center gap-4">
						<div className="text-center">
							<p className="font-bold text-2xl">{Math.round(workStyleProgress)}%</p>
							<p className="text-muted-foreground text-xs">Style de travail</p>
						</div>
						<div className="h-8 w-px bg-border" />
						<div className="text-center">
							<p className="font-bold text-2xl">{Math.round(valuesProgress)}%</p>
							<p className="text-muted-foreground text-xs">Valeurs</p>
						</div>
					</div>
					<Button onClick={() => onSwitchTab("work-style")} className="gap-2">
						<RocketLaunchIcon className="size-4" />
						<Trans>Commencer l'évaluation</Trans>
					</Button>
				</CardContent>
			</Card>
		);
	}

	return (
		<div className="space-y-6">
			{/* Profile Summary */}
			<Card className="border-2 border-primary/30 bg-gradient-to-br from-primary/10 to-transparent">
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<UserCircleIcon className="size-6 text-primary" weight="duotone" />
						<Trans>Mon profil culturel</Trans>
					</CardTitle>
					<CardDescription>
						<Trans>Résumé de tes préférences professionnelles et de tes valeurs</Trans>
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-6">
					{/* Radar Chart */}
					<div className="h-72">
						<ResponsiveContainer width="100%" height="100%">
							<RadarChart data={radarData}>
								<PolarGrid />
								<PolarAngleAxis dataKey="dimension" tick={{ fontSize: 12 }} />
								<PolarRadiusAxis angle={30} domain={[0, 100]} />
								<Radar
									name="Your profile"
									dataKey="value"
									stroke="hsl(var(--primary))"
									fill="hsl(var(--primary))"
									fillOpacity={0.3}
								/>
								<RechartsTooltip />
							</RadarChart>
						</ResponsiveContainer>
					</div>

					{/* Dimension Details */}
					<div className="grid gap-4 md:grid-cols-2">
						{[
							{
								key: "workLifeBalance",
								label: "Work-life balance",
								icon: CoffeeIcon,
								description: "Importance of separating work and personal life",
							},
							{
								key: "innovation",
								label: "Innovation",
								icon: LightbulbIcon,
								description: "Attraction to innovative projects",
							},
							{
								key: "collaboration",
								label: "Collaboration",
								icon: UsersIcon,
								description: "Preference for teamwork",
							},
							{
								key: "growth",
								label: "Growth",
								icon: TrendUpIcon,
								description: "Desire for growth and learning",
							},
							{
								key: "diversity",
								label: "Diversity",
								icon: HandshakeIcon,
								description: "Importance of inclusion",
							},
							{
								key: "transparency",
								label: "Transparency",
								icon: ShieldCheckIcon,
								description: "Need for open communication",
							},
						].map(({ key, label, icon: Icon, description }) => {
							const score = personalProfile[key as keyof PersonalCultureProfile];

							return (
								<div key={key} className="flex items-center gap-4 rounded-lg border bg-background p-4">
									<div
										className={cn(
											"flex size-12 shrink-0 items-center justify-center rounded-xl",
											score >= 70
												? "bg-green-500/20 text-green-600"
												: score >= 40
													? "bg-amber-500/20 text-amber-600"
													: "bg-blue-500/20 text-blue-600",
										)}
									>
										<Icon className="size-6" weight="duotone" />
									</div>
									<div className="min-w-0 flex-1">
										<div className="mb-1 flex items-center justify-between">
											<span className="font-medium">{label}</span>
											<span className="font-bold">{score}</span>
										</div>
										<Progress value={score} className="mb-1 h-2" />
										<p className="text-muted-foreground text-xs">{description}</p>
									</div>
								</div>
							);
						})}
					</div>
				</CardContent>
			</Card>

			{/* Insights */}
			<ProfileInsights personalProfile={personalProfile} companyCompatibility={companyCompatibility} />

			{/* Actions */}
			<div className="flex flex-wrap justify-center gap-4">
				<Button variant="outline" onClick={onReset} disabled={isResetting} className="gap-2">
					{isResetting ? <SpinnerGapIcon className="size-4 animate-spin" /> : <ArrowLeftIcon className="size-4" />}
					<Trans>Recommencer l'évaluation</Trans>
				</Button>
				<Button onClick={() => onSwitchTab("compatibility")} className="gap-2">
					<Trans>View compatible companies</Trans>
					<ArrowRightIcon className="size-4" />
				</Button>
			</div>
		</div>
	);
}

// =============================================================================
// PROFILE INSIGHTS (sub-component of ProfileTab)
// =============================================================================

interface ProfileInsightsProps {
	personalProfile: PersonalCultureProfile;
	companyCompatibility: ((typeof COMPANY_PROFILES)[number] & { compatibility: number })[];
}

function ProfileInsights({ personalProfile, companyCompatibility }: ProfileInsightsProps) {
	const sortedTraits = Object.entries(personalProfile).sort(([, a], [, b]) => b - a);
	const topTrait = sortedTraits[0];
	const lowTrait = sortedTraits[sortedTraits.length - 1];

	const traitLabels: Record<string, string> = {
		workLifeBalance: "work-life balance",
		innovation: "innovation",
		collaboration: "collaboration",
		growth: "professional growth",
		diversity: "diversity",
		transparency: "transparency",
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<SparkleIcon className="size-5 text-amber-500" weight="fill" />
					<Trans>Insights</Trans>
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="flex items-start gap-3 rounded-lg border border-green-500/30 bg-green-500/10 p-4">
					<CheckCircleIcon className="mt-0.5 size-5 shrink-0 text-green-500" weight="fill" />
					<div>
						<p className="font-medium text-green-700 dark:text-green-400">
							<Trans>Strength: {traitLabels[topTrait[0]]}</Trans>
						</p>
						<p className="text-muted-foreground text-sm">
							<Trans>
								You place great importance on this criterion ({topTrait[1]}/100). Look for companies that also value
								this.
							</Trans>
						</p>
					</div>
				</div>

				<div className="flex items-start gap-3 rounded-lg border border-blue-500/30 bg-blue-500/10 p-4">
					<LightbulbIcon className="mt-0.5 size-5 shrink-0 text-blue-500" weight="fill" />
					<div>
						<p className="font-medium text-blue-700 dark:text-blue-400">
							<Trans>Less priority: {traitLabels[lowTrait[0]]}</Trans>
						</p>
						<p className="text-muted-foreground text-sm">
							<Trans>
								This criterion is less important to you ({lowTrait[1]}/100). You can be more flexible on this point.
							</Trans>
						</p>
					</div>
				</div>

				{/* Best match */}
				{companyCompatibility.length > 0 && (
					<div className="flex items-start gap-3 rounded-lg border border-amber-500/30 bg-amber-500/10 p-4">
						<TrophyIcon className="mt-0.5 size-5 shrink-0 text-amber-500" weight="fill" />
						<div>
							<p className="font-medium text-amber-700 dark:text-amber-400">
								<Trans>Meilleure compatibilité : {companyCompatibility[0].name}</Trans>
							</p>
							<p className="text-muted-foreground text-sm">
								<Trans>
									This company matches {companyCompatibility[0].compatibility}% of your cultural preferences.
								</Trans>
							</p>
						</div>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
