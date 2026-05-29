import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import {
	BriefcaseIcon,
	ChatsCircleIcon,
	CheckCircleIcon,
	CompassIcon,
	GraduationCapIcon,
	ReadCvLogoIcon,
	RocketLaunchIcon,
} from "@phosphor-icons/react";
import { Link } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/utils/style";

const TOTAL_STEPS = 4;

const IMTA_PROGRAMS = [
	{ id: "infirmier_polyvalent", label: "Infirmier Polyvalent", emoji: "🏥" },
	{ id: "sage_femme", label: "Sage-Femme", emoji: "👶" },
	{ id: "aide_soignant", label: "Aide-Soignant(e)", emoji: "💊" },
	{ id: "soudure", label: "Soudure Industrielle", emoji: "🔥" },
	{ id: "cariste", label: "Cariste / Magasinier", emoji: "🏗️" },
	{ id: "electromecanique", label: "Electromecanique", emoji: "⚡" },
	{ id: "mecanique_engins", label: "Mecanique d'Engins", emoji: "⚙️" },
	{ id: "hse_specialist", label: "HSE - Securite", emoji: "🦺" },
	{ id: "conducteur_engins", label: "Conducteur d'Engins", emoji: "🚜" },
	{ id: "tourneur_industriel", label: "Tourneur Industriel", emoji: "🔧" },
] as const;

const FEATURES = [
	{
		icon: ReadCvLogoIcon,
		color: "var(--imta-emerald)",
		titleKey: "create-cv" as const,
		descKey: "create-cv-desc" as const,
	},
	{
		icon: ChatsCircleIcon,
		color: "var(--imta-blue)",
		titleKey: "practice-interviews" as const,
		descKey: "practice-interviews-desc" as const,
	},
	{
		icon: CompassIcon,
		color: "var(--imta-teal)",
		titleKey: "career-assessment" as const,
		descKey: "career-assessment-desc" as const,
	},
	{
		icon: BriefcaseIcon,
		color: "var(--imta-terracotta)",
		titleKey: "job-resources" as const,
		descKey: "job-resources-desc" as const,
	},
] as const;

type OnboardingDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onComplete?: () => void;
};

const slideVariants = {
	enter: (direction: number) => ({
		x: direction > 0 ? 80 : -80,
		opacity: 0,
	}),
	center: {
		x: 0,
		opacity: 1,
	},
	exit: (direction: number) => ({
		x: direction > 0 ? -80 : 80,
		opacity: 0,
	}),
};

function StepIndicator({ currentStep, totalSteps }: { currentStep: number; totalSteps: number }) {
	return (
		<div className="flex items-center justify-center gap-2" role="tablist" aria-label={t`Onboarding steps`}>
			{Array.from({ length: totalSteps }, (_, i) => (
				<motion.button
					key={i}
					type="button"
					role="tab"
					aria-selected={i === currentStep}
					aria-label={t`Step ${i + 1}`}
					className={cn(
						"h-2 rounded-full transition-all duration-300",
						i === currentStep ? "w-8 bg-primary" : "w-2 bg-muted-foreground/30",
					)}
					animate={{
						width: i === currentStep ? 32 : 8,
						backgroundColor: i === currentStep ? "var(--color-primary)" : "var(--color-muted-foreground)",
						opacity: i === currentStep ? 1 : 0.3,
					}}
					transition={{ duration: 0.3, ease: "easeInOut" }}
					onClick={() => {}}
				/>
			))}
		</div>
	);
}

function WelcomeStep() {
	return (
		<div className="flex flex-col items-center gap-6 py-4 text-center">
			<motion.div
				initial={false}
				animate={{ scale: 1, opacity: 1 }}
				transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
				className="flex size-20 items-center justify-center rounded-2xl shadow-lg"
				style={{ backgroundColor: "var(--imta-emerald)" }}
			>
				<GraduationCapIcon className="size-10 text-white" weight="fill" />
			</motion.div>

			<div className="space-y-3">
				<motion.h2
					initial={false}
					animate={{ y: 0, opacity: 1 }}
					transition={{ delay: 0.15, duration: 0.4 }}
					className="font-bold text-2xl tracking-tight"
				>
					<Trans>Bienvenue sur votre plateforme carriere !</Trans>
				</motion.h2>

				<motion.p
					initial={false}
					animate={{ y: 0, opacity: 1 }}
					transition={{ delay: 0.25, duration: 0.4 }}
					className="mx-auto max-w-md text-muted-foreground leading-relaxed"
				>
					<Trans>
						En tant qu'etudiant IMTA, cette plateforme vous aide a preparer votre avenir professionnel. Creez votre CV,
						entrainez-vous aux entretiens et explorez les opportunites de carriere.
					</Trans>
				</motion.p>
			</div>

			<motion.div
				initial={false}
				animate={{ y: 0, opacity: 1 }}
				transition={{ delay: 0.35, duration: 0.4 }}
				className="flex items-center gap-2 rounded-full border bg-muted/50 px-4 py-2 text-muted-foreground text-sm"
			>
				<RocketLaunchIcon className="size-4" weight="fill" style={{ color: "var(--imta-teal)" }} />
				<Trans>Pret a booster votre carriere ?</Trans>
			</motion.div>
		</div>
	);
}

function FeaturesStep() {
	const featureTitles: Record<string, React.ReactNode> = {
		"create-cv": <Trans>Creer votre CV</Trans>,
		"practice-interviews": <Trans>S'entrainer aux entretiens</Trans>,
		"career-assessment": <Trans>Bilan de competences</Trans>,
		"job-resources": <Trans>Ressources emploi</Trans>,
	};

	const featureDescs: Record<string, React.ReactNode> = {
		"create-cv-desc": <Trans>Concevez des CV professionnels avec des modeles adaptes a votre domaine.</Trans>,
		"practice-interviews-desc": <Trans>Simulez des entretiens avec l'IA et recevez des retours personnalises.</Trans>,
		"career-assessment-desc": <Trans>Evaluez vos competences et decouvrez les metiers qui vous correspondent.</Trans>,
		"job-resources-desc": <Trans>Accedez aux offres d'emploi, aux employeurs et aux tendances du marche.</Trans>,
	};

	return (
		<div className="space-y-5 py-2">
			<div className="text-center">
				<h2 className="font-bold text-xl tracking-tight">
					<Trans>Tout ce dont vous avez besoin</Trans>
				</h2>
				<p className="mt-1 text-muted-foreground text-sm">
					<Trans>Des outils puissants pour preparer votre avenir professionnel</Trans>
				</p>
			</div>

			<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
				{FEATURES.map((feature, index) => {
					const Icon = feature.icon;
					return (
						<motion.div
							key={feature.titleKey}
							initial={false}
							animate={{ y: 0, opacity: 1 }}
							transition={{ delay: index * 0.1, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
						>
							<Card className="h-full border p-4 transition-all duration-200 hover:border-primary/30 hover:shadow-md">
								<div className="flex items-start gap-3">
									<div
										className="flex size-10 shrink-0 items-center justify-center rounded-lg"
										style={{ backgroundColor: `color-mix(in oklch, ${feature.color} 15%, transparent)` }}
									>
										<Icon className="size-5" weight="duotone" style={{ color: feature.color }} />
									</div>
									<div className="min-w-0">
										<h3 className="font-semibold text-sm">{featureTitles[feature.titleKey]}</h3>
										<p className="mt-0.5 text-muted-foreground text-xs leading-relaxed">
											{featureDescs[feature.descKey]}
										</p>
									</div>
								</div>
							</Card>
						</motion.div>
					);
				})}
			</div>
		</div>
	);
}

function FieldSelectionStep({
	selectedField,
	onFieldSelect,
}: {
	selectedField: string | null;
	onFieldSelect: (field: string) => void;
}) {
	return (
		<div className="space-y-5 py-2">
			<div className="text-center">
				<h2 className="font-bold text-xl tracking-tight">
					<Trans>Choisissez votre filiere</Trans>
				</h2>
				<p className="mt-1 text-muted-foreground text-sm">
					<Trans>Nous adapterons les recommandations a votre domaine d'expertise</Trans>
				</p>
			</div>

			<div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
				{IMTA_PROGRAMS.map((field, index) => (
					<motion.button
						key={field.id}
						type="button"
						initial={false}
						animate={{ y: 0, opacity: 1 }}
						transition={{ delay: index * 0.05, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
						className={cn(
							"flex items-center gap-3 rounded-xl border p-3 text-left transition-all duration-200",
							selectedField === field.id
								? "border-primary bg-primary/5 shadow-md ring-1 ring-primary/30"
								: "border-border hover:border-primary/30 hover:bg-muted/50",
						)}
						onClick={() => onFieldSelect(field.id)}
					>
						<span className="text-xl" role="img" aria-hidden="true">
							{field.emoji}
						</span>
						<span className={cn("font-medium text-sm", selectedField === field.id && "text-primary")}>
							{field.label}
						</span>
						{selectedField === field.id && (
							<motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="ml-auto">
								<CheckCircleIcon className="size-5" weight="fill" style={{ color: "var(--imta-emerald)" }} />
							</motion.div>
						)}
					</motion.button>
				))}
			</div>
		</div>
	);
}

function GetStartedStep() {
	const actions = [
		{
			icon: ReadCvLogoIcon,
			color: "var(--imta-emerald)",
			href: "/dashboard/resumes",
			labelNode: <Trans>Creer mon premier CV</Trans>,
		},
		{
			icon: CompassIcon,
			color: "var(--imta-teal)",
			href: "/dashboard/career/assessment",
			labelNode: <Trans>Passer le bilan carriere</Trans>,
		},
		{
			icon: BriefcaseIcon,
			color: "var(--imta-blue)",
			href: "/dashboard/jobs",
			labelNode: <Trans>Explorer les offres</Trans>,
		},
	];

	return (
		<div className="flex flex-col items-center gap-6 py-4 text-center">
			<motion.div
				initial={false}
				animate={{ scale: 1, opacity: 1 }}
				transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
				className="flex size-20 items-center justify-center rounded-2xl shadow-lg"
				style={{ backgroundColor: "var(--imta-teal)" }}
			>
				<RocketLaunchIcon className="size-10 text-white" weight="fill" />
			</motion.div>

			<div className="space-y-2">
				<motion.h2
					initial={false}
					animate={{ y: 0, opacity: 1 }}
					transition={{ delay: 0.15, duration: 0.4 }}
					className="font-bold text-2xl tracking-tight"
				>
					<Trans>Vous etes pret !</Trans>
				</motion.h2>
				<motion.p
					initial={false}
					animate={{ y: 0, opacity: 1 }}
					transition={{ delay: 0.25, duration: 0.4 }}
					className="text-muted-foreground"
				>
					<Trans>Commencez par l'une de ces actions</Trans>
				</motion.p>
			</div>

			<div className="flex w-full flex-col gap-3">
				{actions.map((action, index) => {
					const Icon = action.icon;
					return (
						<motion.div
							key={action.href}
							initial={false}
							animate={{ y: 0, opacity: 1 }}
							transition={{ delay: 0.3 + index * 0.1, duration: 0.4 }}
						>
							<Link to={action.href as any} className="block">
								<Card className="flex items-center gap-4 border p-4 transition-all duration-200 hover:border-primary/30 hover:shadow-md">
									<div
										className="flex size-10 shrink-0 items-center justify-center rounded-lg"
										style={{
											backgroundColor: `color-mix(in oklch, ${action.color} 15%, transparent)`,
										}}
									>
										<Icon className="size-5" weight="duotone" style={{ color: action.color }} />
									</div>
									<span className="font-medium text-sm">{action.labelNode}</span>
								</Card>
							</Link>
						</motion.div>
					);
				})}
			</div>
		</div>
	);
}

export function OnboardingDialog({ open, onOpenChange, onComplete }: OnboardingDialogProps) {
	const [step, setStep] = useState(0);
	const [direction, setDirection] = useState(1);
	const [selectedField, setSelectedField] = useState<string | null>(null);

	const handleNext = useCallback(() => {
		if (step < TOTAL_STEPS - 1) {
			setDirection(1);
			setStep((prev) => prev + 1);
		}
	}, [step]);

	const handlePrev = useCallback(() => {
		if (step > 0) {
			setDirection(-1);
			setStep((prev) => prev - 1);
		}
	}, [step]);

	const handleComplete = useCallback(() => {
		try {
			localStorage.setItem("onboarding-completed", "true");
			if (selectedField) {
				localStorage.setItem("onboarding-field", selectedField);
			}
		} catch {
			// localStorage may not be available
		}
		onComplete?.();
		onOpenChange(false);
	}, [onOpenChange, onComplete, selectedField]);

	const handleSkip = useCallback(() => {
		try {
			localStorage.setItem("onboarding-completed", "true");
		} catch {
			// localStorage may not be available
		}
		onComplete?.();
		onOpenChange(false);
	}, [onOpenChange, onComplete]);

	const isLastStep = step === TOTAL_STEPS - 1;

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-lg 2xl:max-w-lg" showCloseButton={false}>
				<DialogHeader className="sr-only">
					<DialogTitle>
						<Trans>Bienvenue</Trans>
					</DialogTitle>
					<DialogDescription>
						<Trans>Decouvrez votre plateforme carriere</Trans>
					</DialogDescription>
				</DialogHeader>

				<div className="min-h-[360px] overflow-hidden">
					<AnimatePresence mode="wait" custom={direction}>
						<motion.div
							key={step}
							custom={direction}
							variants={slideVariants}
							initial="enter"
							animate="center"
							exit="exit"
							transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
						>
							{step === 0 && <WelcomeStep />}
							{step === 1 && <FeaturesStep />}
							{step === 2 && <FieldSelectionStep selectedField={selectedField} onFieldSelect={setSelectedField} />}
							{step === 3 && <GetStartedStep />}
						</motion.div>
					</AnimatePresence>
				</div>

				<div className="space-y-4">
					<StepIndicator currentStep={step} totalSteps={TOTAL_STEPS} />

					<DialogFooter className="flex-row items-center justify-between sm:justify-between">
						<Button variant="ghost" size="sm" onClick={handleSkip} className="text-muted-foreground">
							<Trans>Passer</Trans>
						</Button>

						<div className="flex items-center gap-2">
							{step > 0 && (
								<Button variant="outline" size="sm" onClick={handlePrev}>
									<Trans>Retour</Trans>
								</Button>
							)}

							{isLastStep ? (
								<Button size="sm" onClick={handleComplete}>
									<RocketLaunchIcon className="size-4" weight="fill" />
									<Trans>C'est parti !</Trans>
								</Button>
							) : (
								<Button size="sm" onClick={handleNext}>
									<Trans>Suivant</Trans>
								</Button>
							)}
						</div>
					</DialogFooter>
				</div>
			</DialogContent>
		</Dialog>
	);
}
