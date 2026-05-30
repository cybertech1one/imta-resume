import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import {
	ArrowRightIcon,
	BookOpenIcon,
	BrainIcon,
	BriefcaseIcon,
	CalendarIcon,
	CaretLeftIcon,
	CaretRightIcon,
	ChartLineUpIcon,
	ChatsCircleIcon,
	CheckCircleIcon,
	ClockIcon,
	CompassIcon,
	GraduationCapIcon,
	LightbulbIcon,
	PlayIcon,
	PlusIcon,
	RobotIcon,
	SparkleIcon,
	SpinnerIcon,
	TargetIcon,
	TrashIcon,
	TrendUpIcon,
	TrophyIcon,
} from "@phosphor-icons/react";
import { Link } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { WikiLinkCard } from "@/components/shared/wiki-link-card";
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
	DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { ImtaProgram } from "@/schema/interview";
import { cn } from "@/utils/style";
import {
	difficultyLabels,
	fieldBadgeColors,
	fieldColors,
	fieldDescriptions,
	fieldIcons,
	fieldLabels,
	INTERVIEW_FIELDS,
	statusColors,
	statusLabels,
} from "./interview-index-config";
import type {
	BestPerformingArea,
	InterviewDifficulty,
	InterviewField,
	MappedInterviewTip,
} from "./interview-index-types";

interface HeroSectionProps {
	sessionsCount: number;
	completedCount: number;
	averageScore: number;
}

export function HeroSection({ sessionsCount, completedCount, averageScore }: HeroSectionProps) {
	return (
		<motion.section
			className="relative mb-8 overflow-hidden rounded-3xl border border-violet-500/20 p-8 md:p-12"
			style={{
				background:
					"linear-gradient(135deg, oklch(0.25 0.05 280 / 0.9) 0%, oklch(0.2 0.06 260 / 0.85) 50%, oklch(0.22 0.04 240 / 0.8) 100%)",
			}}
			initial={false}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.6, ease: "easeOut" }}
			aria-labelledby="interview-hero-heading"
		>
			<div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
				<motion.div
					className="absolute -top-32 -right-32 size-96 rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/10 blur-3xl"
					animate={{
						scale: [1, 1.2, 1],
						rotate: [0, 10, 0],
						opacity: [0.5, 0.3, 0.5],
					}}
					transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
				/>
				<motion.div
					className="absolute -bottom-32 -left-32 size-96 rounded-full bg-gradient-to-tr from-violet-500/15 to-indigo-500/10 blur-3xl"
					animate={{
						scale: [1.2, 1, 1.2],
						rotate: [0, -10, 0],
						opacity: [0.3, 0.5, 0.3],
					}}
					transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
				/>
				<motion.div
					className="absolute top-1/2 left-1/2 size-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-500/10 blur-3xl"
					animate={{
						scale: [1, 1.3, 1],
					}}
					transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
				/>
			</div>

			<div className="relative z-10">
				<motion.div
					className="mb-3 flex items-center gap-2"
					initial={false}
					animate={{ opacity: 1, x: 0 }}
					transition={{ delay: 0.2 }}
				>
					<ChatsCircleIcon className="size-5 text-violet-300" weight="fill" aria-hidden="true" />
					<span className="font-semibold text-sm text-violet-300 uppercase tracking-wider">
						<Trans>Formation IMTA</Trans>
					</span>
				</motion.div>

				<motion.h2
					id="interview-hero-heading"
					className="mb-4 bg-gradient-to-r from-white via-violet-200 to-white bg-clip-text font-bold text-3xl text-transparent tracking-tight md:text-4xl lg:text-5xl"
					initial={false}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.3 }}
				>
					<Trans>Préparation à l'entretien</Trans>
				</motion.h2>

				<motion.p
					className="mb-8 max-w-2xl text-lg text-slate-300"
					initial={false}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.4 }}
				>
					<Trans>
						Travaillez vos réponses avec des simulations IA, des questions concrètes et des conseils adaptés pour
						réussir votre prochain entretien.
					</Trans>
				</motion.p>

				<motion.div
					className="flex flex-wrap items-center gap-6"
					initial={false}
					animate={{ opacity: 1 }}
					transition={{ delay: 0.5 }}
					role="list"
					aria-label={t`Statistiques d'entretien`}
				>
					<div className="flex items-center gap-2" role="listitem">
						<div className="flex size-10 items-center justify-center rounded-full bg-violet-400/20" aria-hidden="true">
							<ChatsCircleIcon className="size-5 text-violet-300" weight="duotone" />
						</div>
						<div>
							<p className="font-bold text-white text-xl" aria-label={t`${sessionsCount} sessions au total`}>
								{sessionsCount}
							</p>
							<p className="text-slate-400 text-sm">
								<Trans>Sessions</Trans>
							</p>
						</div>
					</div>
					<div className="flex items-center gap-2" role="listitem">
						<div className="flex size-10 items-center justify-center rounded-full bg-emerald-400/20" aria-hidden="true">
							<TrophyIcon className="size-5 text-emerald-300" weight="duotone" />
						</div>
						<div>
							<p className="font-bold text-white text-xl" aria-label={t`${completedCount} sessions terminées`}>
								{completedCount}
							</p>
							<p className="text-slate-400 text-sm">
								<Trans>Terminées</Trans>
							</p>
						</div>
					</div>
					<div className="flex items-center gap-2" role="listitem">
						<div className="flex size-10 items-center justify-center rounded-full bg-amber-400/20" aria-hidden="true">
							<ChartLineUpIcon className="size-5 text-amber-300" weight="duotone" />
						</div>
						<div>
							<p className="font-bold text-white text-xl" aria-label={t`Score moyen ${averageScore} pour cent`}>
								{averageScore}%
							</p>
							<p className="text-slate-400 text-sm">
								<Trans>Score moyen</Trans>
							</p>
						</div>
					</div>
				</motion.div>
			</div>
		</motion.section>
	);
}

export function SessionModesSection() {
	return (
		<section className="mb-10" aria-labelledby="session-modes-heading">
			<h2 id="session-modes-heading" className="mb-6 flex items-center gap-2 font-semibold text-2xl">
				<SparkleIcon className="size-6 text-primary" weight="duotone" aria-hidden="true" />
				<Trans>Démarrer une session</Trans>
			</h2>

			<div className="grid gap-6 md:grid-cols-3" role="list" aria-label={t`Modes d'entraînement`}>
				<motion.div initial={false} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} role="listitem">
					<Card className="group h-full overflow-hidden border-2 transition-all duration-300 focus-within:ring-2 focus-within:ring-blue-500/50 hover:-translate-y-1 hover:border-blue-500/50 hover:shadow-xl">
						<CardHeader className="pb-3">
							<div className="mb-3 flex items-center justify-between">
								<div
									className="flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/10 transition-transform group-hover:scale-110"
									aria-hidden="true"
								>
									<SparkleIcon className="size-7 text-blue-600" weight="duotone" />
								</div>
								<Badge variant="secondary" className="font-medium text-xs">
									<ClockIcon className="mr-1 size-3" aria-hidden="true" />
									<span aria-label={t`Durée 5 minutes`}>5 min</span>
								</Badge>
							</div>
							<CardTitle className="text-xl">
								<Trans>Pratique rapide</Trans>
							</CardTitle>
							<CardDescription>
								<Trans>
									3 à 5 questions avec un retour immédiat après chaque réponse. Idéal pour s'entraîner vite.
								</Trans>
							</CardDescription>
						</CardHeader>
						<CardContent className="pt-0">
							<ul
								className="mb-4 space-y-1 text-muted-foreground text-sm"
								aria-label={t`Avantages de la pratique rapide`}
							>
								<li className="flex items-center gap-2">
									<CheckCircleIcon className="size-4 text-green-500" aria-hidden="true" />
									<Trans>Retour immédiat</Trans>
								</li>
								<li className="flex items-center gap-2">
									<CheckCircleIcon className="size-4 text-green-500" aria-hidden="true" />
									<Trans>Questions adaptées à votre niveau</Trans>
								</li>
							</ul>
						</CardContent>
						<CardFooter className="pt-0">
							<Link
								to="/dashboard/interview/chatbot"
								search={{ mode: "quick_practice" }}
								className="w-full"
								aria-label={t`Démarrer une pratique rapide de 5 minutes`}
							>
								<Button className="w-full gap-2" variant="default">
									<PlayIcon className="size-4" aria-hidden="true" />
									<Trans>Démarrer</Trans>
								</Button>
							</Link>
						</CardFooter>
					</Card>
				</motion.div>

				<motion.div initial={false} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} role="listitem">
					<Card className="group h-full overflow-hidden border-2 transition-all duration-300 focus-within:ring-2 focus-within:ring-purple-500/50 hover:-translate-y-1 hover:border-purple-500/50 hover:shadow-xl">
						<CardHeader className="pb-3">
							<div className="mb-3 flex items-center justify-between">
								<div
									className="flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/10 transition-transform group-hover:scale-110"
									aria-hidden="true"
								>
									<BrainIcon className="size-7 text-purple-600" weight="duotone" />
								</div>
								<Badge variant="secondary" className="font-medium text-xs">
									<ClockIcon className="mr-1 size-3" aria-hidden="true" />
									<span aria-label={t`Durée 20 minutes`}>20 min</span>
								</Badge>
							</div>
							<CardTitle className="text-xl">
								<Trans>Simulation complète</Trans>
							</CardTitle>
							<CardDescription>
								<Trans>
									Simulation de 8 à 10 questions avec une analyse détaillée à la fin, comme un vrai entretien.
								</Trans>
							</CardDescription>
						</CardHeader>
						<CardContent className="pt-0">
							<ul
								className="mb-4 space-y-1 text-muted-foreground text-sm"
								aria-label={t`Avantages de la simulation complète`}
							>
								<li className="flex items-center gap-2">
									<CheckCircleIcon className="size-4 text-green-500" aria-hidden="true" />
									<Trans>Expérience réaliste</Trans>
								</li>
								<li className="flex items-center gap-2">
									<CheckCircleIcon className="size-4 text-green-500" aria-hidden="true" />
									<Trans>Rapport de performance complet</Trans>
								</li>
							</ul>
						</CardContent>
						<CardFooter className="pt-0">
							<Link
								to="/dashboard/interview/chatbot"
								search={{ mode: "mock_interview" }}
								className="w-full"
								aria-label={t`Démarrer une simulation complète de 20 minutes`}
							>
								<Button className="w-full gap-2" variant="default">
									<PlayIcon className="size-4" aria-hidden="true" />
									<Trans>Démarrer</Trans>
								</Button>
							</Link>
						</CardFooter>
					</Card>
				</motion.div>

				<motion.div initial={false} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} role="listitem">
					<Card className="group h-full overflow-hidden border-2 transition-all duration-300 focus-within:ring-2 focus-within:ring-orange-500/50 hover:-translate-y-1 hover:border-orange-500/50 hover:shadow-xl">
						<CardHeader className="pb-3">
							<div className="mb-3 flex items-center justify-between">
								<div
									className="flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500/20 to-red-500/10 transition-transform group-hover:scale-110"
									aria-hidden="true"
								>
									<RobotIcon className="size-7 text-orange-600" weight="duotone" />
								</div>
								<Badge className="bg-gradient-to-r from-orange-500 to-red-500 font-medium text-white text-xs">
									<span aria-label={t`Propulsé par IA`}>IA</span>
								</Badge>
							</div>
							<CardTitle className="text-xl">
								<Trans>Chatbot IA</Trans>
							</CardTitle>
							<CardDescription>
								<Trans>
									Conversation libre avec le coach IA pour poser vos questions et recevoir des conseils personnalisés.
								</Trans>
							</CardDescription>
						</CardHeader>
						<CardContent className="pt-0">
							<ul className="mb-4 space-y-1 text-muted-foreground text-sm" aria-label={t`Avantages du chatbot IA`}>
								<li className="flex items-center gap-2">
									<CheckCircleIcon className="size-4 text-green-500" aria-hidden="true" />
									<Trans>Conseils personnalisés</Trans>
								</li>
								<li className="flex items-center gap-2">
									<CheckCircleIcon className="size-4 text-green-500" aria-hidden="true" />
									<Trans>Disponible 24h/24</Trans>
								</li>
							</ul>
						</CardContent>
						<CardFooter className="pt-0">
							<Link
								to="/dashboard/interview/chatbot"
								className="w-full"
								aria-label={t`Démarrer une conversation avec le chatbot IA`}
							>
								<Button className="w-full gap-2" variant="default">
									<RobotIcon className="size-4" aria-hidden="true" />
									<Trans>Démarrer</Trans>
								</Button>
							</Link>
						</CardFooter>
					</Card>
				</motion.div>
			</div>
		</section>
	);
}

interface FieldSelectionSectionProps {
	isCreateDialogOpen: boolean;
	setIsCreateDialogOpen: (open: boolean) => void;
	selectedField: InterviewField;
	setSelectedField: (field: InterviewField) => void;
	selectedProgram: ImtaProgram | "";
	setSelectedProgram: (program: ImtaProgram | "") => void;
	selectedDifficulty: InterviewDifficulty;
	setSelectedDifficulty: (difficulty: InterviewDifficulty) => void;
	availablePrograms: Array<{
		id: string;
		name: string;
		nameFr: string;
		descriptionFr: string | null;
		description: string | null;
	}>;
	dbPrograms: Array<{ id: string; description: string | null; descriptionFr: string | null }> | undefined;
}

export function FieldSelectionSection({
	isCreateDialogOpen,
	setIsCreateDialogOpen,
	selectedField,
	setSelectedField,
	selectedProgram,
	setSelectedProgram,
	selectedDifficulty,
	setSelectedDifficulty,
	availablePrograms,
	dbPrograms,
}: FieldSelectionSectionProps) {
	return (
		<section className="mb-10" aria-labelledby="field-selection-heading">
			<div className="mb-6 flex items-center justify-between">
				<div>
					<h2 id="field-selection-heading" className="flex items-center gap-2 font-semibold text-2xl">
						<TargetIcon className="size-6 text-primary" weight="duotone" aria-hidden="true" />
						<Trans>Pratique par domaine</Trans>
					</h2>
					<p className="mt-1 text-muted-foreground">
						<Trans>Choisissez votre spécialité pour obtenir des questions ciblées</Trans>
					</p>
				</div>
				<Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
					<DialogTrigger asChild>
						<Button variant="outline" className="gap-2" aria-label={t`Créer une session personnalisée`}>
							<PlusIcon className="size-4" aria-hidden="true" />
							<Trans>Session personnalisée</Trans>
						</Button>
					</DialogTrigger>
					<DialogContent className="max-w-lg">
						<DialogHeader>
							<DialogTitle>
								<Trans>Nouvelle session de pratique</Trans>
							</DialogTitle>
							<DialogDescription>
								<Trans>Configurez une session adaptée à votre objectif</Trans>
							</DialogDescription>
						</DialogHeader>
						<div className="grid gap-4 py-4">
							<div className="grid gap-2">
								<Label>
									<Trans>Domaine / Filière</Trans>
								</Label>
								<Select
									value={selectedField}
									onValueChange={(v) => {
										setSelectedField(v as InterviewField);
										setSelectedProgram("");
									}}
								>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="healthcare">{fieldLabels.healthcare}</SelectItem>
										<SelectItem value="industrial">{fieldLabels.industrial}</SelectItem>
										<SelectItem value="hse">{fieldLabels.hse}</SelectItem>
										<SelectItem value="management">{fieldLabels.management}</SelectItem>
										<SelectItem value="technology">{fieldLabels.technology}</SelectItem>
										<SelectItem value="general">{fieldLabels.general}</SelectItem>
									</SelectContent>
								</Select>
							</div>
							<div className="grid gap-2">
								<Label>
									<Trans>Programme (optionnel)</Trans>
								</Label>
								<Select value={selectedProgram} onValueChange={(v) => setSelectedProgram(v as ImtaProgram)}>
									<SelectTrigger>
										<SelectValue placeholder={t`Sélectionner un programme...`} />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="">
											<Trans>Tous les programmes</Trans>
										</SelectItem>
										{availablePrograms.map((program) => (
											<SelectItem key={program.id} value={program.id}>
												{program.nameFr || program.name}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
								{selectedProgram && (
									<p className="text-muted-foreground text-xs">
										{(() => {
											const program = dbPrograms?.find((p) => p.id === selectedProgram);
											return program?.descriptionFr || program?.description;
										})()}
									</p>
								)}
							</div>
							<div className="grid gap-2">
								<Label>
									<Trans>Niveau de difficulté</Trans>
								</Label>
								<Select
									value={selectedDifficulty}
									onValueChange={(v) => setSelectedDifficulty(v as InterviewDifficulty)}
								>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="beginner">{difficultyLabels.beginner}</SelectItem>
										<SelectItem value="intermediate">{difficultyLabels.intermediate}</SelectItem>
										<SelectItem value="advanced">{difficultyLabels.advanced}</SelectItem>
									</SelectContent>
								</Select>
							</div>
						</div>
						<DialogFooter>
							<Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
								<Trans>Annuler</Trans>
							</Button>
							<Link
								to="/dashboard/interview/practice"
								search={{
									field: selectedField,
									difficulty: selectedDifficulty,
									...(selectedProgram && { program: selectedProgram }),
								}}
								onClick={() => setIsCreateDialogOpen(false)}
							>
								<Button>
									<PlayIcon className="mr-2 size-4" />
									<Trans>Démarrer la session</Trans>
								</Button>
							</Link>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			</div>

			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				{INTERVIEW_FIELDS.map((field, index) => {
					const FieldIcon = fieldIcons[field];
					return (
						<motion.div key={field} initial={false} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
							<Card
								className={cn(
									"group h-full overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg",
									"border-2 hover:border-primary/50",
									"bg-gradient-to-br",
									fieldColors[field],
								)}
							>
								<CardHeader className="pb-2">
									<div
										className={cn(
											"mb-3 flex size-12 items-center justify-center rounded-xl transition-transform group-hover:scale-110",
											fieldBadgeColors[field],
										)}
									>
										<FieldIcon className="size-6" weight="duotone" />
									</div>
									<CardTitle className="text-lg">{fieldLabels[field]}</CardTitle>
									<CardDescription className="line-clamp-2 text-sm">{fieldDescriptions[field]}</CardDescription>
								</CardHeader>
								<CardFooter className="pt-2">
									<Link to="/dashboard/interview/chatbot" search={{ field, mode: "quick_practice" }} className="w-full">
										<Button variant="outline" size="sm" className="w-full gap-2">
											<PlayIcon className="size-4" />
											<Trans>S'entraîner</Trans>
										</Button>
									</Link>
								</CardFooter>
							</Card>
						</motion.div>
					);
				})}
			</div>
		</section>
	);
}

interface StatisticsSectionProps {
	sessionsCount: number;
	averageScore: number;
	bestPerformingArea: BestPerformingArea | null;
	sessionsThisMonth: number;
}

export function StatisticsSection({
	sessionsCount,
	averageScore,
	bestPerformingArea,
	sessionsThisMonth,
}: StatisticsSectionProps) {
	return (
		<section className="mb-10" aria-labelledby="statistics-heading">
			<h2 id="statistics-heading" className="mb-6 flex items-center gap-2 font-semibold text-2xl">
				<ChartLineUpIcon className="size-6 text-primary" weight="duotone" aria-hidden="true" />
				<Trans>Vos statistiques</Trans>
			</h2>

			<div
				className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
				role="list"
				aria-label={t`Vos statistiques d'entretien`}
			>
				<motion.div initial={false} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }} role="listitem">
					<Card className="h-full transition-all duration-300 focus-within:ring-2 focus-within:ring-primary/50 hover:-translate-y-1 hover:shadow-lg">
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="font-medium text-muted-foreground text-sm">
								<Trans>Sessions totales</Trans>
							</CardTitle>
							<div className="flex size-10 items-center justify-center rounded-full bg-primary/10" aria-hidden="true">
								<ChatsCircleIcon className="size-5 text-primary" weight="duotone" />
							</div>
						</CardHeader>
						<CardContent>
							<div className="font-bold text-3xl" aria-label={t`${sessionsCount} sessions au total`}>
								{sessionsCount}
							</div>
							<p className="mt-1 text-muted-foreground text-xs">
								<Trans>depuis votre inscription</Trans>
							</p>
						</CardContent>
					</Card>
				</motion.div>

				<motion.div initial={false} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }} role="listitem">
					<Card className="h-full transition-all duration-300 focus-within:ring-2 focus-within:ring-amber-500/50 hover:-translate-y-1 hover:shadow-lg">
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="font-medium text-muted-foreground text-sm">
								<Trans>Score moyen</Trans>
							</CardTitle>
							<div className="flex size-10 items-center justify-center rounded-full bg-amber-500/10" aria-hidden="true">
								<GraduationCapIcon className="size-5 text-amber-500" weight="duotone" />
							</div>
						</CardHeader>
						<CardContent>
							<div className="font-bold text-3xl" aria-label={t`Score moyen ${averageScore} pour cent`}>
								{averageScore}%
							</div>
							<Progress
								value={averageScore}
								className="mt-2 h-2"
								aria-label={t`Progression du score moyen : ${averageScore}%`}
							/>
						</CardContent>
					</Card>
				</motion.div>

				<motion.div initial={false} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }} role="listitem">
					<Card className="h-full transition-all duration-300 focus-within:ring-2 focus-within:ring-green-500/50 hover:-translate-y-1 hover:shadow-lg">
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="font-medium text-muted-foreground text-sm">
								<Trans>Meilleur domaine</Trans>
							</CardTitle>
							<div className="flex size-10 items-center justify-center rounded-full bg-green-500/10" aria-hidden="true">
								<TrophyIcon className="size-5 text-green-500" weight="duotone" />
							</div>
						</CardHeader>
						<CardContent>
							{bestPerformingArea ? (
								<>
									<div
										className="font-bold text-xl"
										aria-label={t`Meilleur domaine : ${fieldLabels[bestPerformingArea.field as keyof typeof fieldLabels]}`}
									>
										{fieldLabels[bestPerformingArea.field as keyof typeof fieldLabels]}
									</div>
									<p className="mt-1 text-muted-foreground text-xs">
										{bestPerformingArea.score}% <Trans>en moyenne</Trans>
									</p>
								</>
							) : (
								<div className="text-muted-foreground" role="status">
									<Trans>Aucune donnée pour le moment</Trans>
								</div>
							)}
						</CardContent>
					</Card>
				</motion.div>

				<motion.div initial={false} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 }} role="listitem">
					<Card className="h-full transition-all duration-300 focus-within:ring-2 focus-within:ring-blue-500/50 hover:-translate-y-1 hover:shadow-lg">
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="font-medium text-muted-foreground text-sm">
								<Trans>Ce mois-ci</Trans>
							</CardTitle>
							<div className="flex size-10 items-center justify-center rounded-full bg-blue-500/10" aria-hidden="true">
								<CalendarIcon className="size-5 text-blue-500" weight="duotone" />
							</div>
						</CardHeader>
						<CardContent>
							<div className="font-bold text-3xl" aria-label={t`${sessionsThisMonth} sessions ce mois-ci`}>
								{sessionsThisMonth}
							</div>
							<p className="mt-1 text-muted-foreground text-xs">
								<Trans>sessions ce mois-ci</Trans>
							</p>
						</CardContent>
					</Card>
				</motion.div>
			</div>

			<div className="mt-6 flex justify-center">
				<Link to="/dashboard/interview/analytics">
					<Button variant="outline" className="gap-2">
						<ChartLineUpIcon className="size-5" weight="duotone" />
						<Trans>Voir l'analyse détaillée</Trans>
						<ArrowRightIcon className="size-4" />
					</Button>
				</Link>
			</div>
		</section>
	);
}

interface RecentSessionsSectionProps {
	recentSessions: Array<{
		id: string;
		title: string;
		field: string;
		difficulty: string;
		status: string;
		overallScore: number | null;
		createdAt: Date;
	}>;
	deleteSession: (input: { sessionId: string }) => void;
	isDeletingSession: boolean;
	deletingSessionId: { sessionId: string } | undefined;
}

export function RecentSessionsSection({
	recentSessions,
	deleteSession,
	isDeletingSession,
	deletingSessionId,
}: RecentSessionsSectionProps) {
	return (
		<section className="mb-10" aria-labelledby="recent-sessions-heading">
			<div className="mb-6 flex items-center justify-between">
				<h2 id="recent-sessions-heading" className="flex items-center gap-2 font-semibold text-2xl">
					<ClockIcon className="size-6 text-primary" weight="duotone" aria-hidden="true" />
					<Trans>Sessions récentes</Trans>
				</h2>
			</div>

			{recentSessions.length > 0 ? (
				<div className="grid gap-4" role="list" aria-label={t`Sessions récentes`}>
					{recentSessions.map((session, index) => (
						<motion.article
							key={session.id}
							initial={false}
							animate={{ opacity: 1, x: 0 }}
							transition={{ delay: index * 0.05 }}
							role="listitem"
							aria-label={`${session.title} - ${fieldLabels[session.field as keyof typeof fieldLabels]} - ${statusLabels[session.status as keyof typeof statusLabels]}`}
						>
							<Card className="transition-shadow focus-within:ring-2 focus-within:ring-primary/50 hover:shadow-md">
								<CardContent className="flex items-center justify-between p-4">
									<div className="flex items-center gap-4">
										<div
											className={cn(
												"flex size-10 items-center justify-center rounded-lg",
												fieldBadgeColors[session.field as keyof typeof fieldBadgeColors],
											)}
											aria-hidden="true"
										>
											{(() => {
												const FieldIcon = fieldIcons[session.field as string] || BriefcaseIcon;
												return <FieldIcon className="size-5" weight="duotone" />;
											})()}
										</div>
										<div>
											<h3 className="font-medium">{session.title}</h3>
											<div className="flex items-center gap-2 text-muted-foreground text-sm">
												<span>{fieldLabels[session.field as keyof typeof fieldLabels]}</span>
												<span aria-hidden="true">-</span>
												<span>{difficultyLabels[session.difficulty as keyof typeof difficultyLabels]}</span>
												<span aria-hidden="true">-</span>
												<time dateTime={new Date(session.createdAt).toISOString()}>
													{new Date(session.createdAt).toLocaleDateString()}
												</time>
											</div>
										</div>
									</div>
									<div className="flex items-center gap-4">
										<div className="text-right">
											{session.overallScore !== null && session.overallScore !== undefined && (
												<div
													className="font-semibold text-lg text-primary"
													aria-label={t`Score: ${session.overallScore}%`}
												>
													{session.overallScore}%
												</div>
											)}
											<Badge className={statusColors[session.status as keyof typeof statusColors]}>
												{statusLabels[session.status as keyof typeof statusLabels]}
											</Badge>
										</div>
										<div className="flex gap-2" role="group" aria-label={t`Actions de session`}>
											{session.status === "completed" ? (
												<Link
													to="/dashboard/interview/results/$sessionId"
													params={{ sessionId: session.id }}
													aria-label={t`Voir les résultats de ${session.title}`}
												>
													<Button size="sm" variant="outline" className="gap-1">
														<TrophyIcon className="size-4" aria-hidden="true" />
														<Trans>Voir les résultats</Trans>
													</Button>
												</Link>
											) : (
												<Link
													to="/dashboard/interview/session/$sessionId"
													params={{ sessionId: session.id }}
													aria-label={t`Reprendre la session ${session.title}`}
												>
													<Button size="sm" variant="outline" className="gap-1">
														<PlayIcon className="size-4" aria-hidden="true" />
														<Trans>Reprendre</Trans>
													</Button>
												</Link>
											)}
											<Button
												size="sm"
												variant="ghost"
												className="text-destructive"
												onClick={() => deleteSession({ sessionId: session.id })}
												disabled={isDeletingSession && deletingSessionId?.sessionId === session.id}
												aria-label={t`Supprimer la session ${session.title}`}
											>
												{isDeletingSession && deletingSessionId?.sessionId === session.id ? (
													<SpinnerIcon className="size-4 animate-spin" aria-label={t`Suppression...`} />
												) : (
													<TrashIcon className="size-4" aria-hidden="true" />
												)}
											</Button>
										</div>
									</div>
								</CardContent>
							</Card>
						</motion.article>
					))}
				</div>
			) : (
				<motion.div
					initial={false}
					animate={{ opacity: 1, y: 0 }}
					className="flex flex-col items-center justify-center py-16 text-center"
					role="status"
				>
					<ChatsCircleIcon className="mb-4 size-12 text-muted-foreground/50" weight="duotone" aria-hidden="true" />
					<h3 className="mb-2 font-semibold text-lg">
						<Trans>Prêt à vous entraîner ?</Trans>
					</h3>
					<p className="mb-6 max-w-sm text-muted-foreground text-sm">
						<Trans>Démarrez une première simulation pour gagner en confiance avant le vrai entretien.</Trans>
					</p>
					<Link
						to="/dashboard/interview/chatbot"
						search={{ mode: "quick_practice" }}
						aria-label={t`Démarrer votre première session de pratique`}
					>
						<Button>
							<PlayIcon className="mr-2 size-4" aria-hidden="true" />
							<Trans>Commencer l'entraînement</Trans>
						</Button>
					</Link>
				</motion.div>
			)}
		</section>
	);
}

interface TipsCarouselSectionProps {
	interviewTips: MappedInterviewTip[];
	currentTipIndex: number;
	setCurrentTipIndex: (index: number) => void;
	nextTip: () => void;
	prevTip: () => void;
}

export function TipsCarouselSection({
	interviewTips,
	currentTipIndex,
	setCurrentTipIndex,
	nextTip,
	prevTip,
}: TipsCarouselSectionProps) {
	return (
		<section className="mb-10" aria-labelledby="tips-carousel-heading" aria-roledescription="carousel">
			<div className="mb-6 flex items-center justify-between">
				<h2 id="tips-carousel-heading" className="flex items-center gap-2 font-semibold text-2xl">
					<LightbulbIcon className="size-6 text-amber-500" weight="fill" aria-hidden="true" />
					<Trans>Conseils d'entretien</Trans>
				</h2>
				<div className="flex items-center gap-2" role="group" aria-label={t`Navigation du carrousel`}>
					<Button
						variant="outline"
						size="icon"
						className="size-8 rounded-full focus-visible:ring-2 focus-visible:ring-amber-500/50"
						onClick={prevTip}
						aria-label={t`Conseil précédent`}
					>
						<CaretLeftIcon className="size-4" aria-hidden="true" />
					</Button>
					<Button
						variant="outline"
						size="icon"
						className="size-8 rounded-full focus-visible:ring-2 focus-visible:ring-amber-500/50"
						onClick={nextTip}
						aria-label={t`Conseil suivant`}
					>
						<CaretRightIcon className="size-4" aria-hidden="true" />
					</Button>
				</div>
			</div>

			<Card className="relative overflow-hidden bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-transparent">
				<div className="absolute top-0 right-0 size-64 rounded-full bg-amber-500/10 blur-3xl" aria-hidden="true" />

				<CardContent className="relative p-8">
					<AnimatePresence mode="wait">
						{interviewTips[currentTipIndex] && (
							<motion.div
								key={currentTipIndex}
								initial={{ opacity: 0, x: 50 }}
								animate={{ opacity: 1, x: 0 }}
								exit={{ opacity: 0, x: -50 }}
								transition={{ duration: 0.3 }}
								className="flex items-start gap-6"
								role="group"
								aria-roledescription="slide"
								aria-label={t`Conseil ${currentTipIndex + 1} sur ${interviewTips.length} : ${interviewTips[currentTipIndex].title}`}
							>
								<div
									className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-amber-100 dark:bg-amber-900/30"
									aria-hidden="true"
								>
									{(() => {
										const TipIcon = interviewTips[currentTipIndex].icon;
										return <TipIcon className="size-8 text-amber-600 dark:text-amber-400" weight="duotone" />;
									})()}
								</div>
								<div>
									<Badge className="mb-2 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
										{interviewTips[currentTipIndex].categoryFr}
									</Badge>
									<h3 className="mb-2 font-semibold text-xl">{interviewTips[currentTipIndex].title}</h3>
									<p className="text-lg text-muted-foreground">{interviewTips[currentTipIndex].content}</p>
								</div>
							</motion.div>
						)}
					</AnimatePresence>

					<div className="mt-6 flex justify-center gap-2" role="tablist" aria-label={t`Indicateurs des conseils`}>
						{interviewTips.map((tip, idx) => (
							<button
								type="button"
								key={idx}
								role="tab"
								aria-selected={idx === currentTipIndex}
								aria-label={t`Aller au conseil ${idx + 1} : ${tip.title}`}
								className={cn(
									"size-2 rounded-full transition-all focus-visible:ring-2 focus-visible:ring-amber-500/50 focus-visible:ring-offset-2",
									idx === currentTipIndex ? "w-6 bg-amber-500" : "bg-amber-500/30",
								)}
								onClick={() => setCurrentTipIndex(idx)}
							/>
						))}
					</div>
				</CardContent>
			</Card>
		</section>
	);
}

export function ResourcesSection() {
	return (
		<section aria-labelledby="resources-heading">
			<h2 id="resources-heading" className="mb-6 flex items-center gap-2 font-semibold text-2xl">
				<CompassIcon className="size-6 text-primary" weight="duotone" aria-hidden="true" />
				<Trans>Ressources utiles</Trans>
			</h2>

			<nav className="grid gap-4 md:grid-cols-3" aria-label={t`Ressources utiles`}>
				<motion.div initial={false} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
					<Card className="group h-full transition-all duration-300 focus-within:ring-2 focus-within:ring-blue-500/50 hover:-translate-y-1 hover:shadow-lg">
						<CardContent className="flex items-center gap-4 p-6">
							<div
								className="flex size-14 items-center justify-center rounded-xl bg-blue-100 transition-transform group-hover:scale-110 dark:bg-blue-900/30"
								aria-hidden="true"
							>
								<BookOpenIcon className="size-7 text-blue-600 dark:text-blue-400" weight="duotone" />
							</div>
							<div className="flex-1">
								<h3 className="font-semibold">
									<Trans>Questions fréquentes</Trans>
								</h3>
								<p className="text-muted-foreground text-sm">
									<Trans>Questions types par domaine</Trans>
								</p>
							</div>
							<Link to="/dashboard/interview/questions" aria-label={t`Voir les questions fréquentes par domaine`}>
								<Button variant="ghost" size="icon">
									<ArrowRightIcon className="size-5" aria-hidden="true" />
									<span className="sr-only">
										<Trans>Voir les questions fréquentes</Trans>
									</span>
								</Button>
							</Link>
						</CardContent>
					</Card>
				</motion.div>

				<motion.div initial={false} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
					<Card className="group h-full transition-all duration-300 focus-within:ring-2 focus-within:ring-amber-500/50 hover:-translate-y-1 hover:shadow-lg">
						<CardContent className="flex items-center gap-4 p-6">
							<div
								className="flex size-14 items-center justify-center rounded-xl bg-amber-100 transition-transform group-hover:scale-110 dark:bg-amber-900/30"
								aria-hidden="true"
							>
								<LightbulbIcon className="size-7 text-amber-600 dark:text-amber-400" weight="fill" />
							</div>
							<div className="flex-1">
								<h3 className="font-semibold">
									<Trans>Guide de préparation</Trans>
								</h3>
								<p className="text-muted-foreground text-sm">
									<Trans>Conseils pour réussir</Trans>
								</p>
							</div>
							<Link
								to="/dashboard/interview/tips"
								search={{ category: "preparation" }}
								aria-label={t`Voir le guide de préparation`}
							>
								<Button variant="ghost" size="icon">
									<ArrowRightIcon className="size-5" aria-hidden="true" />
									<span className="sr-only">
										<Trans>Voir le guide de préparation</Trans>
									</span>
								</Button>
							</Link>
						</CardContent>
					</Card>
				</motion.div>

				<motion.div initial={false} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
					<Card className="group h-full transition-all duration-300 focus-within:ring-2 focus-within:ring-green-500/50 hover:-translate-y-1 hover:shadow-lg">
						<CardContent className="flex items-center gap-4 p-6">
							<div
								className="flex size-14 items-center justify-center rounded-xl bg-green-100 transition-transform group-hover:scale-110 dark:bg-green-900/30"
								aria-hidden="true"
							>
								<TrendUpIcon className="size-7 text-green-600 dark:text-green-400" weight="duotone" />
							</div>
							<div className="flex-1">
								<h3 className="font-semibold">
									<Trans>Orientation carrière</Trans>
								</h3>
								<p className="text-muted-foreground text-sm">
									<Trans>Trouver votre voie</Trans>
								</p>
							</div>
							<Link to={"/dashboard/career" as "/dashboard/resumes"} aria-label={t`Explorer l'orientation carrière`}>
								<Button variant="ghost" size="icon">
									<ArrowRightIcon className="size-5" aria-hidden="true" />
									<span className="sr-only">
										<Trans>Voir l'orientation carrière</Trans>
									</span>
								</Button>
							</Link>
						</CardContent>
					</Card>
				</motion.div>
			</nav>

			<div className="mt-6">
				<WikiLinkCard
					title={t`Guide de préparation à l'entretien`}
					description={t`Conseils, stratégies et techniques pour mieux réussir votre prochain entretien`}
					wikiPath="/dashboard/wiki/interview-preparation"
				/>
			</div>
		</section>
	);
}
