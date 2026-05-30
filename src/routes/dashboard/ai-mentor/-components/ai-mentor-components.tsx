import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import {
	ArrowRightIcon,
	BrainIcon,
	ChatCircleDotsIcon,
	CheckCircleIcon,
	GraduationCapIcon,
	HardHatIcon,
	HeartbeatIcon,
	LightbulbIcon,
	MagicWandIcon,
	PaperPlaneRightIcon,
	PlusIcon,
	RocketLaunchIcon,
	ShieldCheckIcon,
	SparkleIcon,
	TargetIcon,
	UsersIcon,
} from "@phosphor-icons/react";
import { useMutation } from "@tanstack/react-query";
import { AnimatePresence, motion } from "motion/react";
import type { RefObject } from "react";
import { useState } from "react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { orpc } from "@/integrations/orpc/client";
import { cn } from "@/utils/style";
import { translateExpertiseTag } from "../../-components/display-utils";
import { DashboardHeader } from "../../-components/header";
import { avatarColors, specializationIcons } from "./ai-mentor-config";
import type { ConversationMessage, MentorTemplate, OnboardingState } from "./ai-mentor-types";

export function CustomMentorBuilder({ onSuccess }: { onSuccess: () => void }) {
	const [step, setStep] = useState(1);
	const [mentorData, setMentorData] = useState({
		name: "",
		personality: "supportive",
		style: "conversational",
		specialization: "general",
		focusAreas: [] as string[],
		language: "fr",
	});
	const [focusInput, setFocusInput] = useState("");

	const createMentorMutation = useMutation({
		mutationFn: (data: typeof mentorData) =>
			orpc.aiMentor.user.createCustom.call({
				customName: data.name,
				customPersonality: data.personality as
					| "motivational"
					| "analytical"
					| "supportive"
					| "challenging"
					| "balanced",
				customStyle: data.style as "professional" | "formal" | "friendly" | "casual",
				customSpecializations: [data.specialization],
				customFocusAreas: data.focusAreas,
				customLanguages: [data.language],
			}),
		onSuccess,
	});

	const handleAddFocus = () => {
		if (focusInput.trim() && !mentorData.focusAreas.includes(focusInput.trim())) {
			setMentorData((prev) => ({
				...prev,
				focusAreas: [...prev.focusAreas, focusInput.trim()],
			}));
			setFocusInput("");
		}
	};

	const handleRemoveFocus = (focus: string) => {
		setMentorData((prev) => ({
			...prev,
			focusAreas: prev.focusAreas.filter((f) => f !== focus),
		}));
	};

	const handleCreate = () => {
		if (mentorData.name.trim()) {
			createMentorMutation.mutate(mentorData);
		}
	};

	return (
		<Card className="border-2">
			<CardHeader className="text-center">
				<div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/10">
					<MagicWandIcon className="h-8 w-8 text-primary" />
				</div>
				<CardTitle className="text-2xl">
					<Trans>Créez votre mentor IA</Trans>
				</CardTitle>
				<CardDescription>
					<Trans>Concevez un mentor personnalisé adapté à vos besoins</Trans>
				</CardDescription>
				<div className="mt-4">
					<Progress value={(step / 4) * 100} className="h-2" />
					<p className="mt-2 text-muted-foreground text-sm">
						<Trans>Étape {step} sur 4</Trans>
					</p>
				</div>
			</CardHeader>

			<CardContent className="space-y-6">
				<AnimatePresence mode="wait">
					<motion.div
						key={step}
						initial={{ opacity: 0, x: 20 }}
						animate={{ opacity: 1, x: 0 }}
						exit={{ opacity: 0, x: -20 }}
						transition={{ duration: 0.3 }}
					>
						{step === 1 && (
							<div className="space-y-4">
								<Label className="font-medium text-lg">
									<Trans>Donnez un nom à votre mentor</Trans>
								</Label>
								<Input
									placeholder={t`ex. Sarah, Coach Ali, Dr. Expert`}
									value={mentorData.name}
									onChange={(e) => setMentorData((prev) => ({ ...prev, name: e.target.value }))}
									className="text-lg"
								/>
								<p className="text-muted-foreground text-sm">
									<Trans>Choisissez un nom qui vous convient. C'est votre coach personnel.</Trans>
								</p>
							</div>
						)}

						{step === 2 && (
							<div className="space-y-4">
								<Label className="font-medium text-lg">
									<Trans>Quelle personnalité pour votre mentor ?</Trans>
								</Label>
								<RadioGroup
									value={mentorData.personality}
									onValueChange={(value) => setMentorData((prev) => ({ ...prev, personality: value }))}
									className="grid grid-cols-2 gap-3"
								>
									{[
										{ value: "supportive", label: t`Bienveillant`, desc: t`Encourageant et patient`, icon: "💚" },
										{ value: "analytical", label: t`Analytique`, desc: t`Axé sur les données et précis`, icon: "🔬" },
										{ value: "challenging", label: t`Stimulant`, desc: t`Vous pousse à progresser`, icon: "💪" },
										{ value: "motivational", label: t`Motivant`, desc: t`Inspirant et énergique`, icon: "🌟" },
									].map((option) => (
										<Label
											key={option.value}
											className={cn(
												"flex cursor-pointer flex-col gap-1 rounded-lg border-2 p-4 text-center transition-all",
												mentorData.personality === option.value
													? "border-primary bg-primary/5 shadow-md"
													: "border-border hover:border-primary/50",
											)}
										>
											<RadioGroupItem value={option.value} className="sr-only" />
											<span className="text-2xl">{option.icon}</span>
											<span className="font-medium">{option.label}</span>
											<span className="text-muted-foreground text-xs">{option.desc}</span>
										</Label>
									))}
								</RadioGroup>
							</div>
						)}

						{step === 3 && (
							<div className="space-y-4">
								<Label className="font-medium text-lg">
									<Trans>Sur quoi votre mentor doit-il se concentrer ?</Trans>
								</Label>
								<RadioGroup
									value={mentorData.specialization}
									onValueChange={(value) => setMentorData((prev) => ({ ...prev, specialization: value }))}
									className="grid grid-cols-2 gap-3"
								>
									{[
										{ value: "career_strategy", label: t`Stratégie de carrière`, icon: RocketLaunchIcon },
										{ value: "interview", label: t`Préparation entretien`, icon: UsersIcon },
										{ value: "skills_development", label: t`Développement des compétences`, icon: GraduationCapIcon },
										{ value: "job_search", label: t`Recherche d'emploi`, icon: TargetIcon },
										{ value: "networking", label: t`Réseautage`, icon: UsersIcon },
										{ value: "general", label: t`Coach général`, icon: BrainIcon },
									].map((option) => (
										<Label
											key={option.value}
											className={cn(
												"flex cursor-pointer items-center gap-3 rounded-lg border-2 p-4 transition-all",
												mentorData.specialization === option.value
													? "border-primary bg-primary/5 shadow-md"
													: "border-border hover:border-primary/50",
											)}
										>
											<RadioGroupItem value={option.value} className="sr-only" />
											<option.icon className="h-6 w-6 text-primary" />
											<span className="font-medium">{option.label}</span>
										</Label>
									))}
								</RadioGroup>

								<div className="space-y-2 pt-4">
									<Label>
										<Trans>Ajouter des domaines spécifiques (optionnel)</Trans>
									</Label>
									<div className="flex gap-2">
										<Input
											placeholder={t`ex. Rédaction de CV, Négociation salariale`}
											value={focusInput}
											onChange={(e) => setFocusInput(e.target.value)}
											onKeyDown={(e) => e.key === "Enter" && handleAddFocus()}
										/>
										<Button type="button" variant="outline" onClick={handleAddFocus}>
											<PlusIcon className="h-4 w-4" />
										</Button>
									</div>
									{mentorData.focusAreas.length > 0 && (
										<div className="mt-2 flex flex-wrap gap-2">
											{mentorData.focusAreas.map((focus) => (
												<Badge
													key={focus}
													variant="secondary"
													className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
													onClick={() => handleRemoveFocus(focus)}
												>
													{focus} ×
												</Badge>
											))}
										</div>
									)}
								</div>
							</div>
						)}

						{step === 4 && (
							<div className="space-y-6">
								<Label className="font-medium text-lg">
									<Trans>Vérifiez votre mentor</Trans>
								</Label>

								<Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
									<CardContent className="pt-6">
										<div className="flex items-center gap-4">
											<Avatar className="h-16 w-16 bg-primary">
												<AvatarFallback className="text-white text-xl">
													{mentorData.name.charAt(0) || "M"}
												</AvatarFallback>
											</Avatar>
											<div>
												<h3 className="font-bold text-xl">{mentorData.name || t`Votre mentor`}</h3>
												<p className="text-muted-foreground text-sm">
													{mentorData.personality.charAt(0).toUpperCase() + mentorData.personality.slice(1)} •{" "}
													{mentorData.specialization.replace("_", " ")}
												</p>
											</div>
										</div>

										<div className="mt-6 space-y-3">
											<div className="flex items-center gap-2">
												<CheckCircleIcon className="h-5 w-5 text-green-500" />
												<span>
													<Trans>Personnalité :</Trans> <strong>{mentorData.personality}</strong>
												</span>
											</div>
											<div className="flex items-center gap-2">
												<CheckCircleIcon className="h-5 w-5 text-green-500" />
												<span>
													<Trans>Spécialisation :</Trans> <strong>{mentorData.specialization.replace("_", " ")}</strong>
												</span>
											</div>
											{mentorData.focusAreas.length > 0 && (
												<div className="flex items-center gap-2">
													<CheckCircleIcon className="h-5 w-5 text-green-500" />
													<span>
														<Trans>Sujets :</Trans> <strong>{mentorData.focusAreas.join(", ")}</strong>
													</span>
												</div>
											)}
											<div className="flex items-center gap-2">
												<CheckCircleIcon className="h-5 w-5 text-green-500" />
												<span>
													<Trans>Langue :</Trans>{" "}
													<strong>{mentorData.language === "fr" ? "Français" : mentorData.language}</strong>
												</span>
											</div>
										</div>
									</CardContent>
								</Card>

								<div className="rounded-lg bg-muted/50 p-4">
									<p className="text-muted-foreground text-sm">
										<LightbulbIcon className="mr-2 mb-1 inline h-4 w-4" />
										<Trans>
											Votre mentor sera créé avec des capacités d'intelligence artificielle. Vous pourrez toujours le
											personnaliser plus tard.
										</Trans>
									</p>
								</div>
							</div>
						)}
					</motion.div>
				</AnimatePresence>
			</CardContent>

			<CardFooter className="flex justify-between">
				<Button variant="outline" onClick={() => setStep((prev) => Math.max(1, prev - 1))} disabled={step === 1}>
					<Trans>Retour</Trans>
				</Button>
				{step < 4 ? (
					<Button onClick={() => setStep((prev) => prev + 1)} disabled={step === 1 && !mentorData.name.trim()}>
						<Trans>Continuer</Trans>
						<ArrowRightIcon className="ml-2 h-4 w-4" />
					</Button>
				) : (
					<Button
						onClick={handleCreate}
						disabled={createMentorMutation.isPending}
						className="bg-gradient-to-r from-primary to-primary/80"
					>
						{createMentorMutation.isPending ? (
							<Trans>Création en cours...</Trans>
						) : (
							<>
								<SparkleIcon className="mr-2 h-4 w-4" />
								<Trans>Créer mon mentor</Trans>
							</>
						)}
					</Button>
				)}
			</CardFooter>
		</Card>
	);
}

export function OnboardingWizard({
	onboarding,
	setOnboarding,
	onNext,
}: {
	onboarding: OnboardingState;
	setOnboarding: React.Dispatch<React.SetStateAction<OnboardingState>>;
	onNext: () => Promise<void>;
}) {
	return (
		<div className="min-h-screen bg-gradient-to-br from-background to-muted/30">
			<DashboardHeader icon={SparkleIcon} title={t`Configuration du mentor IA`} />

			<div className="container mx-auto max-w-2xl px-4 py-8">
				<Card className="border-2">
					<CardHeader className="text-center">
						<div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
							<MagicWandIcon className="h-8 w-8 text-primary" />
						</div>
						<CardTitle className="text-2xl">
							<Trans>Découvrez votre mentor IA</Trans>
						</CardTitle>
						<CardDescription>
							<Trans>Répondez à quelques questions pour obtenir des recommandations personnalisées</Trans>
						</CardDescription>

						<div className="mt-6">
							<Progress value={(onboarding.step / 5) * 100} className="h-2" />
							<p className="mt-2 text-muted-foreground text-sm">
								<Trans>Étape {onboarding.step} sur 5</Trans>
							</p>
						</div>
					</CardHeader>

					<CardContent className="space-y-6">
						<AnimatePresence mode="wait">
							<motion.div
								key={onboarding.step}
								initial={{ opacity: 0, x: 20 }}
								animate={{ opacity: 1, x: 0 }}
								exit={{ opacity: 0, x: -20 }}
								transition={{ duration: 0.3 }}
							>
								{onboarding.step === 1 && (
									<div className="space-y-4">
										<Label className="font-medium text-lg">
											<Trans>Quel est votre domaine ?</Trans>
										</Label>
										<RadioGroup
											value={onboarding.field}
											onValueChange={(value) => setOnboarding((prev) => ({ ...prev, field: value }))}
											className="grid grid-cols-1 gap-3"
										>
											{[
												{ value: "healthcare", label: t`Santé`, icon: HeartbeatIcon },
												{ value: "industrial", label: t`Industriel`, icon: HardHatIcon },
												{ value: "hse", label: t`HSE / Sécurité`, icon: ShieldCheckIcon },
												{ value: "general", label: t`Autre`, icon: BrainIcon },
											].map((option) => (
												<Label
													key={option.value}
													className={cn(
														"flex cursor-pointer items-center gap-4 rounded-lg border-2 p-4 transition-colors",
														onboarding.field === option.value
															? "border-primary bg-primary/5"
															: "border-border hover:border-primary/50",
													)}
												>
													<RadioGroupItem value={option.value} className="sr-only" />
													<option.icon className="h-6 w-6 text-primary" />
													<span className="font-medium">{option.label}</span>
												</Label>
											))}
										</RadioGroup>
									</div>
								)}

								{onboarding.step === 2 && (
									<div className="space-y-4">
										<Label className="font-medium text-lg">
											<Trans>Quel est votre niveau actuel ?</Trans>
										</Label>
										<RadioGroup
											value={onboarding.currentLevel}
											onValueChange={(value) => setOnboarding((prev) => ({ ...prev, currentLevel: value }))}
											className="grid grid-cols-1 gap-3"
										>
											{[
												{ value: "student", label: t`Étudiant`, desc: t`En cours d'études` },
												{ value: "graduate", label: t`Jeune diplômé`, desc: t`Moins de 2 ans` },
												{ value: "working", label: t`En poste`, desc: t`Actuellement en emploi` },
												{ value: "experienced", label: t`Expérimenté`, desc: t`5+ ans d'expérience` },
											].map((option) => (
												<Label
													key={option.value}
													className={cn(
														"flex cursor-pointer flex-col gap-1 rounded-lg border-2 p-4 transition-colors",
														onboarding.currentLevel === option.value
															? "border-primary bg-primary/5"
															: "border-border hover:border-primary/50",
													)}
												>
													<RadioGroupItem value={option.value} className="sr-only" />
													<span className="font-medium">{option.label}</span>
													<span className="text-muted-foreground text-sm">{option.desc}</span>
												</Label>
											))}
										</RadioGroup>
									</div>
								)}

								{onboarding.step === 3 && (
									<div className="space-y-4">
										<Label className="font-medium text-lg">
											<Trans>Quel est votre plus grand défi ?</Trans>
										</Label>
										<RadioGroup
											value={onboarding.biggestChallenge}
											onValueChange={(value) => setOnboarding((prev) => ({ ...prev, biggestChallenge: value }))}
											className="grid grid-cols-1 gap-3"
										>
											{[
												{ value: "job_search", label: t`Trouver un emploi`, icon: TargetIcon },
												{
													value: "skills",
													label: t`Développer mes compétences`,
													icon: GraduationCapIcon,
												},
												{
													value: "interviews",
													label: t`Préparer les entretiens`,
													icon: UsersIcon,
												},
												{
													value: "career_change",
													label: t`Changement de carrière`,
													icon: RocketLaunchIcon,
												},
											].map((option) => (
												<Label
													key={option.value}
													className={cn(
														"flex cursor-pointer items-center gap-4 rounded-lg border-2 p-4 transition-colors",
														onboarding.biggestChallenge === option.value
															? "border-primary bg-primary/5"
															: "border-border hover:border-primary/50",
													)}
												>
													<RadioGroupItem value={option.value} className="sr-only" />
													<option.icon className="h-6 w-6 text-primary" />
													<span className="font-medium">{option.label}</span>
												</Label>
											))}
										</RadioGroup>
									</div>
								)}

								{onboarding.step === 4 && (
									<div className="space-y-4">
										<Label className="font-medium text-lg">
											<Trans>Comment préférez-vous apprendre ?</Trans>
										</Label>
										<RadioGroup
											value={onboarding.learningStyle}
											onValueChange={(value) => setOnboarding((prev) => ({ ...prev, learningStyle: value }))}
											className="grid grid-cols-2 gap-3"
										>
											{[
												{ value: "visual", label: t`Visuel`, desc: t`Vidéos, diagrammes` },
												{ value: "hands_on", label: t`Pratique`, desc: t`Exercices, mises en situation` },
												{ value: "reading", label: t`Lecture`, desc: t`Articles, livres` },
												{ value: "discussion", label: t`Discussion`, desc: t`Conversations, questions-réponses` },
											].map((option) => (
												<Label
													key={option.value}
													className={cn(
														"flex cursor-pointer flex-col gap-1 rounded-lg border-2 p-4 text-center transition-colors",
														onboarding.learningStyle === option.value
															? "border-primary bg-primary/5"
															: "border-border hover:border-primary/50",
													)}
												>
													<RadioGroupItem value={option.value} className="sr-only" />
													<span className="font-medium">{option.label}</span>
													<span className="text-muted-foreground text-xs">{option.desc}</span>
												</Label>
											))}
										</RadioGroup>
									</div>
								)}

								{onboarding.step === 5 && (
									<div className="space-y-4">
										<Label className="font-medium text-lg">
											<Trans>Langue préférée ?</Trans>
										</Label>
										<RadioGroup
											value={onboarding.preferredLanguage}
											onValueChange={(value) => setOnboarding((prev) => ({ ...prev, preferredLanguage: value }))}
											className="grid grid-cols-2 gap-3"
										>
											{[
												{ value: "fr", label: "Français", flag: "🇫🇷" },
												{ value: "ar", label: "العربية", flag: "🇲🇦" },
												{ value: "en", label: "English", flag: "🇬🇧" },
												{ value: "darija", label: "Darija", flag: "🇲🇦" },
											].map((option) => (
												<Label
													key={option.value}
													className={cn(
														"flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 p-4 transition-colors",
														onboarding.preferredLanguage === option.value
															? "border-primary bg-primary/5"
															: "border-border hover:border-primary/50",
													)}
												>
													<RadioGroupItem value={option.value} className="sr-only" />
													<span className="text-2xl">{option.flag}</span>
													<span className="font-medium">{option.label}</span>
												</Label>
											))}
										</RadioGroup>
									</div>
								)}
							</motion.div>
						</AnimatePresence>
					</CardContent>

					<CardFooter className="flex justify-between">
						<Button
							variant="outline"
							onClick={() => setOnboarding((prev) => ({ ...prev, step: Math.max(1, prev.step - 1) }))}
							disabled={onboarding.step === 1}
						>
							<Trans>Retour</Trans>
						</Button>
						<Button
							onClick={onNext}
							disabled={
								(onboarding.step === 1 && !onboarding.field) ||
								(onboarding.step === 2 && !onboarding.currentLevel) ||
								(onboarding.step === 3 && !onboarding.biggestChallenge) ||
								(onboarding.step === 4 && !onboarding.learningStyle)
							}
						>
							{onboarding.step === 5 ? <Trans>Trouver mon mentor</Trans> : <Trans>Continuer</Trans>}
							<ArrowRightIcon className="ml-2 h-4 w-4" />
						</Button>
					</CardFooter>
				</Card>
			</div>
		</div>
	);
}

export function MentorsTab({
	recommendations,
	templates,
	templatesLoading,
	onSelectMentor,
	onStartChat,
}: {
	recommendations: MentorTemplate[] | undefined;
	templates: MentorTemplate[] | undefined;
	templatesLoading: boolean;
	onSelectMentor: (templateId: string) => Promise<void>;
	onStartChat: (mentorId: string) => Promise<void>;
}) {
	return (
		<div className="space-y-6">
			{recommendations && recommendations.length > 0 && (
				<div className="space-y-4">
					<h2 className="font-semibold text-xl">
						<Trans>Recommandé pour vous</Trans>
					</h2>
					<div className="grid gap-4 md:grid-cols-3">
						{recommendations.map((mentor: MentorTemplate) => (
							<Card
								key={mentor.id}
								className="relative overflow-hidden border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent"
							>
								<div className="absolute top-2 right-2">
									<Badge variant="secondary" className="bg-primary/10 text-primary">
										{mentor.matchScore}% <Trans>compatible</Trans>
									</Badge>
								</div>
								<CardHeader className="pb-2">
									<div className="flex items-center gap-4">
										<Avatar className={cn("h-14 w-14", avatarColors[mentor.avatar || "default"] || "bg-primary")}>
											<AvatarFallback className="text-lg text-white">{mentor.name.charAt(0)}</AvatarFallback>
										</Avatar>
										<div>
											<CardTitle className="text-lg">{mentor.name}</CardTitle>
											<CardDescription>{mentor.titleFr || mentor.title}</CardDescription>
										</div>
									</div>
								</CardHeader>
								<CardContent className="pb-2">
									<p className="line-clamp-2 text-muted-foreground text-sm">
										{mentor.descriptionFr || mentor.description}
									</p>
								</CardContent>
								<CardFooter>
									<Button className="w-full" onClick={() => onSelectMentor(mentor.id)}>
										<Trans>Choisir ce mentor</Trans>
									</Button>
								</CardFooter>
							</Card>
						))}
					</div>
				</div>
			)}

			<div className="space-y-4">
				<h2 className="font-semibold text-xl">
					<Trans>Mentors experts</Trans>
				</h2>
				{templatesLoading || !templates ? (
					<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
						{[1, 2, 3].map((i) => (
							<Card key={i}>
								<CardHeader>
									<Skeleton className="h-14 w-14 rounded-full" />
									<Skeleton className="mt-2 h-6 w-32" />
								</CardHeader>
								<CardContent>
									<Skeleton className="h-16 w-full" />
								</CardContent>
							</Card>
						))}
					</div>
				) : (
					<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
						{templates?.map((mentor) => {
							const Icon = specializationIcons[mentor.specialization] || BrainIcon;
							return (
								<Card key={mentor.id} className="group transition-shadow hover:shadow-lg">
									<CardHeader className="pb-2">
										<div className="flex items-center gap-4">
											<Avatar
												className={cn(
													"h-14 w-14 transition-transform group-hover:scale-105",
													avatarColors[mentor.avatar || "default"] || "bg-primary",
												)}
											>
												<AvatarFallback className="text-lg text-white">{mentor.name.charAt(0)}</AvatarFallback>
											</Avatar>
											<div className="flex-1">
												<CardTitle className="flex items-center gap-2 text-lg">
													{mentor.name}
													<Icon className="h-4 w-4 text-muted-foreground" />
												</CardTitle>
												<CardDescription>{mentor.titleFr || mentor.title}</CardDescription>
											</div>
										</div>
									</CardHeader>
									<CardContent className="space-y-3 pb-2">
										<p className="line-clamp-2 text-muted-foreground text-sm">
											{mentor.descriptionFr || mentor.description}
										</p>
										<div className="flex flex-wrap gap-1">
											{(mentor.expertise as string[]).slice(0, 3).map((skill) => (
												<Badge key={skill} variant="outline" className="text-xs">
													{translateExpertiseTag(skill)}
												</Badge>
											))}
										</div>
									</CardContent>
									<CardFooter className="gap-2">
										<Button variant="outline" className="flex-1" onClick={() => onStartChat(mentor.id)}>
											<ChatCircleDotsIcon className="mr-2 h-4 w-4" />
											<Trans>Discuter</Trans>
										</Button>
										<Button className="flex-1" onClick={() => onSelectMentor(mentor.id)}>
											<Trans>Sélectionner</Trans>
										</Button>
									</CardFooter>
								</Card>
							);
						})}
					</div>
				)}
			</div>
		</div>
	);
}

export function ChatTab({
	selectedMentor,
	currentConversation,
	isTyping,
	chatInput,
	setChatInput,
	onSendMessage,
	onBrowseMentors,
	chatEndRef,
}: {
	selectedMentor: string | null;
	currentConversation: { id: string; messages: ConversationMessage[] } | null;
	isTyping: boolean;
	chatInput: string;
	setChatInput: (value: string) => void;
	onSendMessage: () => Promise<void>;
	onBrowseMentors: () => void;
	chatEndRef: RefObject<HTMLDivElement | null>;
}) {
	if (selectedMentor && currentConversation) {
		return (
			<Card className="flex h-[600px] flex-col">
				<CardHeader className="flex-shrink-0 border-b">
					<div className="flex items-center gap-4">
						<Avatar className="h-10 w-10 bg-primary">
							<AvatarFallback className="text-white">AI</AvatarFallback>
						</Avatar>
						<div>
							<CardTitle className="text-lg">
								<Trans>Chat avec votre mentor IA</Trans>
							</CardTitle>
							<CardDescription>
								<Trans>Posez vos questions sur votre carrière</Trans>
							</CardDescription>
						</div>
					</div>
				</CardHeader>
				<CardContent className="flex-1 overflow-hidden p-0">
					<ScrollArea className="h-full p-4">
						<div className="space-y-4">
							{currentConversation.messages.map((msg, idx) => (
								<motion.div
									key={idx}
									initial={false}
									animate={{ opacity: 1, y: 0 }}
									className={cn("flex", msg.role === "user" ? "justify-end" : "justify-start")}
								>
									<div
										className={cn(
											"max-w-[80%] rounded-lg p-3",
											msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted",
										)}
									>
										<p className="whitespace-pre-wrap text-sm">{msg.content}</p>
										{msg.role === "assistant" && (
											<p className="mt-1.5 flex items-center gap-1 text-[10px] text-muted-foreground/60">
												<SparkleIcon className="size-2.5" weight="fill" />
												AI
											</p>
										)}
									</div>
								</motion.div>
							))}
							{isTyping && (
								<div className="flex justify-start">
									<div className="flex items-center gap-2 rounded-lg bg-muted p-3">
										<div className="flex gap-1">
											<span className="h-2 w-2 animate-bounce rounded-full bg-primary [animation-delay:-0.3s]" />
											<span className="h-2 w-2 animate-bounce rounded-full bg-primary [animation-delay:-0.15s]" />
											<span className="h-2 w-2 animate-bounce rounded-full bg-primary" />
										</div>
									</div>
								</div>
							)}
							<div ref={chatEndRef} />
						</div>
					</ScrollArea>
				</CardContent>
				<CardFooter className="flex-shrink-0 border-t p-4">
					<form
						className="flex w-full gap-2"
						onSubmit={(e) => {
							e.preventDefault();
							onSendMessage();
						}}
					>
						<Input
							placeholder={t`Tapez votre message...`}
							value={chatInput}
							onChange={(e) => setChatInput(e.target.value)}
							disabled={isTyping}
							className="flex-1"
						/>
						<Button type="submit" disabled={!chatInput.trim() || isTyping}>
							<PaperPlaneRightIcon className="h-4 w-4" />
						</Button>
					</form>
				</CardFooter>
			</Card>
		);
	}

	return (
		<Card className="flex h-[400px] flex-col items-center justify-center">
			<ChatCircleDotsIcon className="mb-4 h-16 w-16 text-muted-foreground/50" />
			<h3 className="font-medium text-lg">
				<Trans>Aucun chat actif</Trans>
			</h3>
			<p className="mb-4 text-muted-foreground text-sm">
				<Trans>Sélectionnez un mentor pour commencer</Trans>
			</p>
			<Button onClick={onBrowseMentors}>
				<Trans>Parcourir les mentors</Trans>
			</Button>
		</Card>
	);
}
