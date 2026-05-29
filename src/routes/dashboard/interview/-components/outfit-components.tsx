import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import {
	ArrowLeftIcon,
	BriefcaseIcon,
	CaretDownIcon,
	CaretUpIcon,
	CheckCircleIcon,
	ClockIcon,
	LightbulbIcon,
	ListChecksIcon,
	PaletteIcon,
	PrinterIcon,
	ProhibitIcon,
	SparkleIcon,
	SpinnerGapIcon,
	TShirtIcon,
	UsersIcon,
	VideoIcon,
	WarningIcon,
	XCircleIcon,
} from "@phosphor-icons/react";
import type { UseMutationResult } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/utils/style";
import {
	accessoryCategories,
	cultureQuestions,
	dontsList,
	dosList,
	industryConfigs,
	preparationChecklist,
	seasonConfigs,
	virtualInterviewTips,
} from "./outfit-config";
import type { CultureQuestion, IndustryConfig, SeasonConfig } from "./outfit-types";

// ─── Hero Section ────────────────────────────────────────────────────────────

export function OutfitHeroSection() {
	const handlePrint = () => {
		window.print();
	};

	return (
		<motion.div
			className="relative mb-8 overflow-hidden rounded-3xl border border-pink-500/20 p-8 md:p-12"
			style={{
				background:
					"linear-gradient(135deg, oklch(0.75 0.15 330 / 0.15) 0%, oklch(0.7 0.18 300 / 0.1) 50%, oklch(0.65 0.15 270 / 0.08) 100%)",
			}}
			initial={false}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.6, ease: "easeOut" }}
		>
			{/* Animated background elements */}
			<div className="pointer-events-none absolute inset-0 overflow-hidden print:hidden">
				<motion.div
					className="absolute -top-32 -right-32 size-96 rounded-full bg-gradient-to-br from-pink-500/20 to-purple-500/10 blur-3xl"
					animate={{
						scale: [1, 1.2, 1],
						rotate: [0, 10, 0],
						opacity: [0.5, 0.3, 0.5],
					}}
					transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
				/>
				<motion.div
					className="absolute -bottom-32 -left-32 size-96 rounded-full bg-gradient-to-tr from-violet-500/15 to-pink-500/10 blur-3xl"
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
					<TShirtIcon className="size-5 text-pink-600" weight="fill" />
					<span className="font-semibold text-pink-700 text-sm uppercase tracking-wider dark:text-pink-400">
						<Trans>Guide de tenue</Trans>
					</span>
				</motion.div>

				<motion.h2
					className="mb-4 bg-gradient-to-r from-pink-700 via-purple-600 to-violet-700 bg-clip-text font-bold text-3xl text-transparent tracking-tight md:text-4xl lg:text-5xl dark:from-pink-400 dark:via-purple-400 dark:to-violet-400"
					initial={false}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.3 }}
				>
					<Trans>Conseils de tenue pour l'entretien</Trans>
				</motion.h2>

				<motion.p
					className="mb-8 max-w-2xl text-lg text-muted-foreground"
					initial={false}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.4 }}
				>
					<Trans>
						Découvrez comment vous habiller pour faire une bonne première impression. Les conseils sont adaptés à chaque
						secteur.
					</Trans>
				</motion.p>

				{/* Quick actions */}
				<motion.div
					className="flex flex-wrap items-center gap-4 print:hidden"
					initial={false}
					animate={{ opacity: 1 }}
					transition={{ delay: 0.5 }}
				>
					<Link to="/dashboard/interview">
						<Button variant="outline" className="gap-2">
							<ArrowLeftIcon className="size-4" />
							<Trans>Retour</Trans>
						</Button>
					</Link>
					<Button variant="outline" className="gap-2" onClick={handlePrint}>
						<PrinterIcon className="size-4" />
						<Trans>Imprimer</Trans>
					</Button>
				</motion.div>
			</div>
		</motion.div>
	);
}

// ─── Industry Tab Content ────────────────────────────────────────────────────

type IndustryTabProps = {
	selectedIndustry: string;
	setSelectedIndustry: (id: string) => void;
	selectedIndustryConfig: IndustryConfig | undefined;
};

export function IndustryTabContent({
	selectedIndustry,
	setSelectedIndustry,
	selectedIndustryConfig,
}: IndustryTabProps) {
	return (
		<motion.div initial={false} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
			{/* Industry Selector */}
			<div className="mb-6 flex flex-wrap gap-3">
				{industryConfigs.map((industry) => {
					const IndustryIcon = industry.icon;
					return (
						<Button
							key={industry.id}
							variant={selectedIndustry === industry.id ? "default" : "outline"}
							className={cn("gap-2", selectedIndustry === industry.id && "ring-2 ring-primary/50")}
							onClick={() => setSelectedIndustry(industry.id)}
						>
							<IndustryIcon className="size-4" weight="duotone" />
							{industry.label}
						</Button>
					);
				})}
			</div>

			{/* Selected Industry Details */}
			{selectedIndustryConfig && <IndustryDetails config={selectedIndustryConfig} />}
		</motion.div>
	);
}

function IndustryDetails({ config }: { config: IndustryConfig }) {
	return (
		<div className="grid gap-6 lg:grid-cols-2">
			{/* Overview Card */}
			<Card className="lg:col-span-2">
				<CardHeader>
					<div className="flex items-center gap-3">
						<div className={cn("flex size-12 items-center justify-center rounded-xl", config.bgColor)}>
							{(() => {
								const IndustryIcon = config.icon;
								return <IndustryIcon className={cn("size-6", config.color)} weight="duotone" />;
							})()}
						</div>
						<div>
							<CardTitle className="text-xl">{config.label}</CardTitle>
							<CardDescription>{config.description}</CardDescription>
						</div>
					</div>
				</CardHeader>
				<CardContent>
					<div className="mb-4 flex flex-wrap gap-2">
						<Badge variant="secondary" className="gap-1">
							<Trans>Niveau de formalite :</Trans>
							<span className="font-semibold">
								{
									{
										formal: t`Formel`,
										professional: t`Professionnel`,
										casual: t`Decontracte`,
										variable: t`Variable`,
									}[config.formalityLevel]
								}
							</span>
						</Badge>
					</div>
					<p className="text-muted-foreground">{config.dressCode}</p>
				</CardContent>
			</Card>

			{/* Men's Outfit */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<div className="flex size-8 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
							<TShirtIcon className="size-4 text-blue-600" weight="duotone" />
						</div>
						<Trans>Tenue homme</Trans>
					</CardTitle>
				</CardHeader>
				<CardContent>
					<ul className="space-y-2">
						{config.menOutfit.map((item, index) => (
							<li key={index} className="flex items-start gap-2 text-sm">
								<CheckCircleIcon className="mt-0.5 size-4 shrink-0 text-green-500" weight="fill" />
								<span>{item}</span>
							</li>
						))}
					</ul>
				</CardContent>
			</Card>

			{/* Women's Outfit */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<div className="flex size-8 items-center justify-center rounded-lg bg-pink-100 dark:bg-pink-900/30">
							<TShirtIcon className="size-4 text-pink-600" weight="duotone" />
						</div>
						<Trans>Tenue femme</Trans>
					</CardTitle>
				</CardHeader>
				<CardContent>
					<ul className="space-y-2">
						{config.womenOutfit.map((item, index) => (
							<li key={index} className="flex items-start gap-2 text-sm">
								<CheckCircleIcon className="mt-0.5 size-4 shrink-0 text-green-500" weight="fill" />
								<span>{item}</span>
							</li>
						))}
					</ul>
				</CardContent>
			</Card>

			{/* Colors */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<div className="flex size-8 items-center justify-center rounded-lg bg-violet-100 dark:bg-violet-900/30">
							<PaletteIcon className="size-4 text-violet-600" weight="duotone" />
						</div>
						<Trans>Couleurs recommandees</Trans>
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="flex flex-wrap gap-2">
						{config.colors.map((color, index) => (
							<Badge key={index} variant="secondary">
								{color}
							</Badge>
						))}
					</div>
				</CardContent>
			</Card>

			{/* Avoid */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<div className="flex size-8 items-center justify-center rounded-lg bg-red-100 dark:bg-red-900/30">
							<ProhibitIcon className="size-4 text-red-600" weight="duotone" />
						</div>
						<Trans>À éviter</Trans>
					</CardTitle>
				</CardHeader>
				<CardContent>
					<ul className="space-y-2">
						{config.avoid.map((item, index) => (
							<li key={index} className="flex items-start gap-2 text-sm">
								<XCircleIcon className="mt-0.5 size-4 shrink-0 text-red-500" weight="fill" />
								<span>{item}</span>
							</li>
						))}
					</ul>
				</CardContent>
			</Card>

			{/* Tips */}
			<Card className="lg:col-span-2">
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<div className="flex size-8 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/30">
							<LightbulbIcon className="size-4 text-amber-600" weight="fill" />
						</div>
						<Trans>Conseils supplementaires</Trans>
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="grid gap-3 md:grid-cols-2">
						{config.tips.map((tip, index) => (
							<div key={index} className="flex items-start gap-2 rounded-lg bg-amber-50/50 p-3 dark:bg-amber-900/10">
								<SparkleIcon className="mt-0.5 size-4 shrink-0 text-amber-500" weight="fill" />
								<span className="text-sm">{tip}</span>
							</div>
						))}
					</div>
				</CardContent>
			</Card>
		</div>
	);
}

// ─── Culture Assessment Tab Content ──────────────────────────────────────────

type CultureTabProps = {
	cultureAnswers: Record<string, string>;
	setCultureAnswers: React.Dispatch<React.SetStateAction<Record<string, string>>>;
	showCultureResult: boolean;
	setShowCultureResult: (show: boolean) => void;
	calculateFormalityScore: () => number;
	getFormalityRecommendation: () => { level: string; description: string; color: string };
};

export function CultureTabContent({
	cultureAnswers,
	setCultureAnswers,
	showCultureResult,
	setShowCultureResult,
	calculateFormalityScore,
	getFormalityRecommendation,
}: CultureTabProps) {
	return (
		<motion.div initial={false} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
			<Card className="mb-6">
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<UsersIcon className="size-5 text-purple-600" weight="duotone" />
						<Trans>Evaluation de la culture d'entreprise</Trans>
					</CardTitle>
					<CardDescription>
						<Trans>Repondez a ces questions pour obtenir une recommandation de tenue personnalisee</Trans>
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-6">
					{cultureQuestions.map((question, qIndex) => (
						<CultureQuestionBlock
							key={question.id}
							question={question}
							qIndex={qIndex}
							cultureAnswers={cultureAnswers}
							setCultureAnswers={setCultureAnswers}
							setShowCultureResult={setShowCultureResult}
						/>
					))}

					<Button
						onClick={() => setShowCultureResult(true)}
						disabled={Object.keys(cultureAnswers).length < cultureQuestions.length}
						className="w-full gap-2"
					>
						<SparkleIcon className="size-4" />
						<Trans>Obtenir ma recommandation</Trans>
					</Button>
				</CardContent>
			</Card>

			{/* Result */}
			<AnimatePresence>
				{showCultureResult && Object.keys(cultureAnswers).length === cultureQuestions.length && (
					<CultureResultCard
						calculateFormalityScore={calculateFormalityScore}
						getFormalityRecommendation={getFormalityRecommendation}
					/>
				)}
			</AnimatePresence>
		</motion.div>
	);
}

function CultureQuestionBlock({
	question,
	qIndex,
	cultureAnswers,
	setCultureAnswers,
	setShowCultureResult,
}: {
	question: CultureQuestion;
	qIndex: number;
	cultureAnswers: Record<string, string>;
	setCultureAnswers: React.Dispatch<React.SetStateAction<Record<string, string>>>;
	setShowCultureResult: (show: boolean) => void;
}) {
	return (
		<div className="space-y-3">
			<Label className="font-medium text-base">
				{qIndex + 1}. {question.question}
			</Label>
			<RadioGroup
				value={cultureAnswers[question.id] || ""}
				onValueChange={(value) => {
					setCultureAnswers((prev) => ({ ...prev, [question.id]: value }));
					setShowCultureResult(false);
				}}
				className="grid gap-2 md:grid-cols-2"
			>
				{question.options.map((option) => (
					<div key={option.value} className="flex items-center space-x-2">
						<RadioGroupItem value={option.value} id={`${question.id}-${option.value}`} />
						<Label htmlFor={`${question.id}-${option.value}`} className="cursor-pointer text-sm">
							{option.label}
						</Label>
					</div>
				))}
			</RadioGroup>
		</div>
	);
}

function CultureResultCard({
	calculateFormalityScore,
	getFormalityRecommendation,
}: {
	calculateFormalityScore: () => number;
	getFormalityRecommendation: () => { level: string; description: string; color: string };
}) {
	return (
		<motion.div initial={false} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
			<Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-transparent">
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<CheckCircleIcon className="size-5 text-primary" weight="fill" />
						<Trans>Votre recommandation</Trans>
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="flex items-center gap-4">
						<div className="relative size-24">
							<svg className="size-24 -rotate-90" viewBox="0 0 100 100">
								<circle
									cx="50"
									cy="50"
									r="40"
									fill="none"
									stroke="currentColor"
									strokeWidth="10"
									className="text-muted/30"
								/>
								<circle
									cx="50"
									cy="50"
									r="40"
									fill="none"
									stroke="url(#formality-gradient)"
									strokeWidth="10"
									strokeLinecap="round"
									strokeDasharray={`${calculateFormalityScore() * 2.51} 251`}
									className="transition-all duration-500"
								/>
								<defs>
									<linearGradient id="formality-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
										<stop offset="0%" stopColor="#8b5cf6" />
										<stop offset="100%" stopColor="#ec4899" />
									</linearGradient>
								</defs>
							</svg>
							<div className="absolute inset-0 flex flex-col items-center justify-center">
								<span className="font-bold text-2xl text-primary">{calculateFormalityScore()}%</span>
							</div>
						</div>
						<div>
							<p className={cn("font-semibold text-xl", getFormalityRecommendation().color)}>
								{getFormalityRecommendation().level}
							</p>
							<p className="text-muted-foreground text-sm">{getFormalityRecommendation().description}</p>
						</div>
					</div>
				</CardContent>
			</Card>
		</motion.div>
	);
}

// ─── Seasonal Tab Content ────────────────────────────────────────────────────

type SeasonalTabProps = {
	expandedSection: string | null;
	toggleSection: (sectionId: string) => void;
};

export function SeasonalTabContent({ expandedSection, toggleSection }: SeasonalTabProps) {
	return (
		<motion.div initial={false} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
			<div className="grid gap-6 lg:grid-cols-3">
				{seasonConfigs.map((season) => (
					<SeasonCard
						key={season.id}
						season={season}
						isExpanded={expandedSection === season.id}
						onToggle={() => toggleSection(season.id)}
					/>
				))}
			</div>
		</motion.div>
	);
}

function SeasonCard({
	season,
	isExpanded,
	onToggle,
}: {
	season: SeasonConfig;
	isExpanded: boolean;
	onToggle: () => void;
}) {
	const SeasonIcon = season.icon;

	return (
		<Card className="overflow-hidden">
			<CardHeader className="cursor-pointer" onClick={onToggle}>
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-3">
						<div
							className={cn(
								"flex size-12 items-center justify-center rounded-xl",
								season.id === "summer" && "bg-amber-100 dark:bg-amber-900/30",
								season.id === "winter" && "bg-blue-100 dark:bg-blue-900/30",
								season.id === "transition" && "bg-teal-100 dark:bg-teal-900/30",
							)}
						>
							<SeasonIcon className={cn("size-6", season.color)} weight="duotone" />
						</div>
						<CardTitle>{season.label}</CardTitle>
					</div>
					<Button variant="ghost" size="icon" className="size-8 print:hidden">
						{isExpanded ? <CaretUpIcon className="size-4" /> : <CaretDownIcon className="size-4" />}
					</Button>
				</div>
			</CardHeader>
			<AnimatePresence>
				{isExpanded && (
					<motion.div
						initial={{ opacity: 0, height: 0 }}
						animate={{ opacity: 1, height: "auto" }}
						exit={{ opacity: 0, height: 0 }}
						transition={{ duration: 0.2 }}
					>
						<CardContent className="border-t pt-4">
							<ul className="space-y-2">
								{season.tips.map((tip, index) => (
									<li key={index} className="flex items-start gap-2 text-sm">
										<CheckCircleIcon className="mt-0.5 size-4 shrink-0 text-green-500" weight="fill" />
										<span>{tip}</span>
									</li>
								))}
							</ul>
						</CardContent>
					</motion.div>
				)}
			</AnimatePresence>
		</Card>
	);
}

// ─── Virtual Interview Tab Content ───────────────────────────────────────────

export function VirtualInterviewTabContent() {
	return (
		<motion.div initial={false} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
			<div className="grid gap-6 md:grid-cols-2">
				{virtualInterviewTips.map((tip) => {
					const TipIcon = tip.icon;

					return (
						<Card key={tip.id}>
							<CardHeader>
								<div className="flex items-center gap-3">
									<div className="flex size-12 items-center justify-center rounded-xl bg-green-100 dark:bg-green-900/30">
										<TipIcon className="size-6 text-green-600" weight="duotone" />
									</div>
									<div>
										<CardTitle>{tip.title}</CardTitle>
										<CardDescription>{tip.description}</CardDescription>
									</div>
								</div>
							</CardHeader>
							<CardContent>
								<ul className="space-y-2">
									{tip.tips.map((item, index) => (
										<li key={index} className="flex items-start gap-2 text-sm">
											<CheckCircleIcon className="mt-0.5 size-4 shrink-0 text-green-500" weight="fill" />
											<span>{item}</span>
										</li>
									))}
								</ul>
							</CardContent>
						</Card>
					);
				})}
			</div>

			{/* Quick Virtual Interview Checklist */}
			<Card className="mt-6 border-green-500/30 bg-gradient-to-br from-green-50/50 to-emerald-50/30 dark:from-green-900/10 dark:to-emerald-900/5">
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<VideoIcon className="size-5 text-green-600" weight="duotone" />
						<Trans>Liste rapide - Entretien en visio</Trans>
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="grid gap-3 md:grid-cols-2">
						{[
							t`Tester la connexion internet`,
							t`Verifier la camera et le micro`,
							t`Preparer l'arriere-plan`,
							t`Ajuster l'éclairage`,
							t`Bien se positionner`,
							t`Garder un verre d'eau a proximite`,
							t`Fermer les applications inutiles`,
							t`Prevenir les personnes autour de vous`,
						].map((item, index) => (
							<div key={index} className="flex items-center gap-2 rounded-lg bg-white/50 p-2 dark:bg-white/5">
								<CheckCircleIcon className="size-4 shrink-0 text-green-500" weight="duotone" />
								<span className="text-sm">{item}</span>
							</div>
						))}
					</div>
				</CardContent>
			</Card>
		</motion.div>
	);
}

// ─── Do's and Don'ts Tab Content ─────────────────────────────────────────────

export function DosDontsTabContent() {
	return (
		<motion.div initial={false} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
			<div className="grid gap-6 md:grid-cols-2">
				{/* Do's */}
				<Card className="border-green-500/30">
					<CardHeader className="bg-green-50/50 dark:bg-green-900/10">
						<CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-400">
							<CheckCircleIcon className="size-6" weight="fill" />
							<Trans>A faire</Trans>
						</CardTitle>
					</CardHeader>
					<CardContent className="pt-4">
						<div className="space-y-3">
							{dosList.map((item, index) => (
								<div key={index} className="flex items-start gap-3">
									<CheckCircleIcon className="mt-0.5 size-5 shrink-0 text-green-500" weight="fill" />
									<div>
										<p className="text-sm">{item.text}</p>
										{item.category !== "general" && (
											<Badge variant="outline" className="mt-1 text-xs">
												{item.category === "men" ? t`Hommes` : t`Femmes`}
											</Badge>
										)}
									</div>
								</div>
							))}
						</div>
					</CardContent>
				</Card>

				{/* Don'ts */}
				<Card className="border-red-500/30">
					<CardHeader className="bg-red-50/50 dark:bg-red-900/10">
						<CardTitle className="flex items-center gap-2 text-red-700 dark:text-red-400">
							<XCircleIcon className="size-6" weight="fill" />
							<Trans>À éviter</Trans>
						</CardTitle>
					</CardHeader>
					<CardContent className="pt-4">
						<div className="space-y-3">
							{dontsList.map((item, index) => (
								<div key={index} className="flex items-start gap-3">
									<XCircleIcon className="mt-0.5 size-5 shrink-0 text-red-500" weight="fill" />
									<div>
										<p className="text-sm">{item.text}</p>
										{item.category !== "general" && (
											<Badge variant="outline" className="mt-1 text-xs">
												{item.category === "men" ? t`Hommes` : t`Femmes`}
											</Badge>
										)}
									</div>
								</div>
							))}
						</div>
					</CardContent>
				</Card>
			</div>
		</motion.div>
	);
}

// ─── Accessories Tab Content ─────────────────────────────────────────────────

export function AccessoriesTabContent() {
	return (
		<motion.div initial={false} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
			<div className="grid gap-6 md:grid-cols-2">
				{accessoryCategories.map((category) => {
					const CategoryIcon = category.icon;

					return (
						<Card key={category.id}>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<div className="flex size-10 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-900/30">
										<CategoryIcon className="size-5 text-indigo-600" weight="duotone" />
									</div>
									{category.title}
								</CardTitle>
							</CardHeader>
							<CardContent>
								<ul className="space-y-2">
									{category.items.map((item, index) => (
										<li key={index} className="flex items-start gap-2 text-sm">
											<SparkleIcon className="mt-0.5 size-4 shrink-0 text-indigo-500" weight="fill" />
											<span>{item}</span>
										</li>
									))}
								</ul>
							</CardContent>
						</Card>
					);
				})}
			</div>
		</motion.div>
	);
}

// ─── Checklist Tab Content ───────────────────────────────────────────────────

type ChecklistTabProps = {
	checkedItems: Set<string>;
	checklistProgress: number;
	isLoading: boolean;
	isError: boolean;
	toggleChecklistItem: (itemId: string) => void;
	toggleMutation: UseMutationResult<unknown, Error, string, { previousItems: string[] | undefined }>;
};

export function ChecklistTabContent({
	checkedItems,
	checklistProgress,
	isLoading,
	isError,
	toggleChecklistItem,
	toggleMutation,
}: ChecklistTabProps) {
	return (
		<motion.div initial={false} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
			{/* Progress Card */}
			<Card className="mb-6">
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<ListChecksIcon className="size-5 text-teal-600" weight="duotone" />
						<Trans>Progression de preparation</Trans>
					</CardTitle>
				</CardHeader>
				<CardContent>
					{isLoading ? (
						<div className="space-y-2">
							<Skeleton className="h-4 w-48" />
							<Skeleton className="h-3 w-full" />
						</div>
					) : isError ? (
						<div className="flex items-center gap-2 text-destructive">
							<WarningIcon className="size-4" />
							<span className="text-sm">
								<Trans>Erreur de chargement des données</Trans>
							</span>
						</div>
					) : (
						<div className="space-y-2">
							<div className="flex items-center justify-between">
								<span className="text-muted-foreground text-sm">
									{checkedItems.size}/{preparationChecklist.length} <Trans>étapes terminées</Trans>
								</span>
								<span className="font-semibold text-teal-600">{checklistProgress}%</span>
							</div>
							<Progress value={checklistProgress} className="h-3" />
						</div>
					)}
				</CardContent>
			</Card>

			{/* Checklist Items */}
			<div className="space-y-3">
				{isLoading ? (
					// Loading skeletons
					Array.from({ length: 4 }).map((_, index) => (
						<Card key={index}>
							<CardContent className="flex items-start gap-4 p-4">
								<Skeleton className="size-6 shrink-0 rounded-md" />
								<div className="flex-1 space-y-2">
									<Skeleton className="h-5 w-3/4" />
									<Skeleton className="h-4 w-full" />
								</div>
							</CardContent>
						</Card>
					))
				) : isError ? (
					<Card className="border-destructive/50">
						<CardContent className="flex items-center justify-center gap-2 p-8 text-destructive">
							<WarningIcon className="size-5" />
							<span>
								<Trans>Impossible de charger la liste. Veuillez reessayer.</Trans>
							</span>
						</CardContent>
					</Card>
				) : (
					preparationChecklist.map((item, index) => {
						const isChecked = checkedItems.has(item.id);
						const isToggling = toggleMutation.isPending && toggleMutation.variables === item.id;

						return (
							<motion.div
								key={item.id}
								initial={false}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: index * 0.05 }}
							>
								<Card
									className={cn(
										"cursor-pointer transition-all duration-300",
										isChecked && "border-green-500/50 bg-green-50/30 dark:bg-green-900/10",
										isToggling && "opacity-70",
									)}
									onClick={() => !isToggling && toggleChecklistItem(item.id)}
								>
									<CardContent className="flex items-start gap-4 p-4">
										<button
											type="button"
											disabled={isToggling}
											className={cn(
												"mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-md border-2 transition-all duration-200",
												isChecked
													? "border-green-500 bg-green-500 text-white"
													: "border-muted-foreground/30 hover:border-primary",
											)}
										>
											{isToggling ? (
												<SpinnerGapIcon className="size-4 animate-spin" />
											) : isChecked ? (
												<CheckCircleIcon className="size-4" weight="bold" />
											) : null}
										</button>
										<div>
											<h4
												className={cn(
													"font-medium transition-all",
													isChecked && "text-green-700 line-through decoration-green-500 dark:text-green-400",
												)}
											>
												{item.title}
											</h4>
											<p className="text-muted-foreground text-sm">{item.description}</p>
										</div>
										<div className="ml-auto flex items-center gap-2">
											<Badge variant="outline" className="text-xs">
												<ClockIcon className="mr-1 size-3" />
												{index + 1}/{preparationChecklist.length}
											</Badge>
										</div>
									</CardContent>
								</Card>
							</motion.div>
						);
					})
				)}
			</div>

			{/* Completion Card */}
			{!isLoading && !isError && checklistProgress === 100 && (
				<motion.div initial={false} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}>
					<Card className="mt-6 border-green-500/30 bg-gradient-to-br from-green-50 to-emerald-50/50 dark:from-green-900/20 dark:to-emerald-900/10">
						<CardContent className="flex flex-col items-center justify-center p-8 text-center">
							<div className="mb-4 flex size-20 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
								<CheckCircleIcon className="size-10 text-green-600 dark:text-green-400" weight="fill" />
							</div>
							<h3 className="mb-2 font-bold text-2xl text-green-700 dark:text-green-400">
								<Trans>Parfait !</Trans>
							</h3>
							<p className="max-w-md text-muted-foreground">
								<Trans>Votre tenue est prête ! Vous avez terminé toutes les étapes de préparation.</Trans>
							</p>
						</CardContent>
					</Card>
				</motion.div>
			)}
		</motion.div>
	);
}

// ─── Quick Links Section ─────────────────────────────────────────────────────

export function QuickLinksSection() {
	return (
		<section className="mt-12 print:hidden">
			<h3 className="mb-6 flex items-center gap-2 font-semibold text-2xl">
				<SparkleIcon className="size-6 text-primary" weight="duotone" />
				<Trans>Ressources supplementaires</Trans>
			</h3>

			<div className="grid gap-4 md:grid-cols-3">
				<Link to={"/dashboard/interview/checklist" as string}>
					<Card className="group h-full cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
						<CardContent className="flex items-center gap-4 p-6">
							<div className="flex size-14 items-center justify-center rounded-xl bg-green-100 transition-transform group-hover:scale-110 dark:bg-green-900/30">
								<ListChecksIcon className="size-7 text-green-600 dark:text-green-400" weight="duotone" />
							</div>
							<div>
								<h4 className="font-semibold">
									<Trans>Liste de preparation</Trans>
								</h4>
								<p className="text-muted-foreground text-sm">
									<Trans>Liste complète pour le jour J</Trans>
								</p>
							</div>
						</CardContent>
					</Card>
				</Link>

				<Link to={"/dashboard/interview/tips" as string}>
					<Card className="group h-full cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
						<CardContent className="flex items-center gap-4 p-6">
							<div className="flex size-14 items-center justify-center rounded-xl bg-amber-100 transition-transform group-hover:scale-110 dark:bg-amber-900/30">
								<LightbulbIcon className="size-7 text-amber-600 dark:text-amber-400" weight="fill" />
							</div>
							<div>
								<h4 className="font-semibold">
									<Trans>Conseils d'entretien</Trans>
								</h4>
								<p className="text-muted-foreground text-sm">
									<Trans>Conseils pour réussir</Trans>
								</p>
							</div>
						</CardContent>
					</Card>
				</Link>

				<Link to="/dashboard/interview">
					<Card className="group h-full cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
						<CardContent className="flex items-center gap-4 p-6">
							<div className="flex size-14 items-center justify-center rounded-xl bg-blue-100 transition-transform group-hover:scale-110 dark:bg-blue-900/30">
								<BriefcaseIcon className="size-7 text-blue-600 dark:text-blue-400" weight="duotone" />
							</div>
							<div>
								<h4 className="font-semibold">
									<Trans>Espace entretien</Trans>
								</h4>
								<p className="text-muted-foreground text-sm">
									<Trans>Tous les outils de preparation</Trans>
								</p>
							</div>
						</CardContent>
					</Card>
				</Link>
			</div>
		</section>
	);
}

// ─── Print Styles ────────────────────────────────────────────────────────────

export function OutfitPrintStyles() {
	return (
		<style>{`
			@media print {
				body {
					font-size: 11pt;
				}
				.print\\:hidden {
					display: none !important;
				}
			}
		`}</style>
	);
}
