import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import {
	ArrowLeftIcon,
	ArrowRightIcon,
	BellIcon,
	BookOpenIcon,
	CalendarIcon,
	CaretDownIcon,
	CaretUpIcon,
	CheckCircleIcon,
	CheckSquareIcon,
	ClockIcon,
	LightbulbIcon,
	ListChecksIcon,
	PlayIcon,
	PrinterIcon,
	QuestionIcon,
	SparkleIcon,
	SpinnerIcon,
	SunIcon,
	WarningIcon,
} from "@phosphor-icons/react";
import type { QueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/utils/style";

import type { ChecklistItem, InterviewReminder } from "./checklist-types";

function ChecklistItemCard({
	item,
	index,
	isChecked,
	isExpanded,
	isToggling,
	onToggle,
	onExpand,
}: {
	item: ChecklistItem;
	index: number;
	isChecked: boolean;
	isExpanded: boolean;
	isToggling: boolean;
	onToggle: (id: string) => void;
	onExpand: (id: string) => void;
}) {
	const ItemIcon = item.icon;

	return (
		<motion.div key={item.id} initial={false} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
			<Card
				className={cn(
					"transition-all duration-300",
					isChecked && "border-green-500/50 bg-green-50/30 dark:bg-green-900/10",
				)}
			>
				<CardHeader className="pb-2">
					<div className="flex items-start gap-4">
						<button
							type="button"
							onClick={() => onToggle(item.id)}
							disabled={isToggling}
							className={cn(
								"mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-md border-2 transition-all duration-200",
								isChecked
									? "border-green-500 bg-green-500 text-white"
									: "border-muted-foreground/30 hover:border-primary",
								isToggling && "cursor-not-allowed opacity-50",
							)}
						>
							{isChecked && <CheckCircleIcon className="size-4" weight="bold" />}
						</button>

						<div className="flex-1">
							<div className="flex items-center gap-2">
								<div
									className={cn(
										"flex size-8 items-center justify-center rounded-lg",
										isChecked ? "bg-green-100 dark:bg-green-900/30" : "bg-primary/10",
									)}
								>
									<ItemIcon
										className={cn("size-4", isChecked ? "text-green-600 dark:text-green-400" : "text-primary")}
										weight="duotone"
									/>
								</div>
								<CardTitle
									className={cn(
										"text-base transition-all",
										isChecked && "text-green-700 line-through decoration-green-500 dark:text-green-400",
									)}
								>
									{item.title}
								</CardTitle>
							</div>
							<CardDescription className="mt-1 ml-10">{item.description}</CardDescription>
						</div>

						{(item.tips || item.link) && (
							<Button
								variant="ghost"
								size="icon"
								className="size-8 shrink-0 print:hidden"
								onClick={() => onExpand(item.id)}
							>
								{isExpanded ? <CaretUpIcon className="size-4" /> : <CaretDownIcon className="size-4" />}
							</Button>
						)}
					</div>
				</CardHeader>

				<AnimatePresence>
					{isExpanded && (item.tips || item.link) && (
						<motion.div
							initial={{ opacity: 0, height: 0 }}
							animate={{ opacity: 1, height: "auto" }}
							exit={{ opacity: 0, height: 0 }}
							transition={{ duration: 0.2 }}
						>
							<CardContent className="ml-10 space-y-3 border-t pt-4">
								{item.tips && (
									<div className="rounded-lg bg-muted/50 p-3">
										<h4 className="mb-2 flex items-center gap-2 font-medium text-sm">
											<LightbulbIcon className="size-4 text-amber-500" weight="fill" />
											<Trans>Conseils</Trans>
										</h4>
										<ul className="space-y-1.5">
											{item.tips.map((tip, tipIndex) => (
												<li key={tipIndex} className="flex items-start gap-2 text-muted-foreground text-sm">
													<CheckSquareIcon className="mt-0.5 size-4 shrink-0 text-primary" />
													<span>{tip}</span>
												</li>
											))}
										</ul>
									</div>
								)}
								{item.link && (
									<Link to={item.link.href as "/dashboard/resumes"} className="print:hidden">
										<Button variant="outline" size="sm" className="gap-2">
											<ArrowRightIcon className="size-4" />
											{item.link.text}
										</Button>
									</Link>
								)}
							</CardContent>
						</motion.div>
					)}
				</AnimatePresence>
			</Card>
		</motion.div>
	);
}

export function ChecklistLoadingState() {
	return (
		<div className="flex flex-col items-center justify-center py-12">
			<SpinnerIcon className="size-8 animate-spin text-primary" />
			<p className="mt-4 text-muted-foreground">
				<Trans>Chargement...</Trans>
			</p>
		</div>
	);
}

export function ChecklistErrorState({ queryClient }: { queryClient: QueryClient }) {
	return (
		<Card className="border-destructive/50 bg-destructive/5">
			<CardContent className="flex flex-col items-center justify-center py-12">
				<WarningIcon className="size-12 text-destructive" />
				<p className="mt-4 text-destructive">
					<Trans>Erreur de chargement de la liste</Trans>
				</p>
				<Button
					variant="outline"
					className="mt-4"
					onClick={() => queryClient.invalidateQueries({ queryKey: ["quickChecklist"] })}
				>
					<Trans>Reessayer</Trans>
				</Button>
			</CardContent>
		</Card>
	);
}

export function ChecklistHeroSection({
	handlePrint,
	resetChecklist,
	isResetting,
}: {
	handlePrint: () => void;
	resetChecklist: () => void;
	isResetting: boolean;
}) {
	return (
		<motion.div
			className="relative mb-8 overflow-hidden rounded-3xl border border-green-500/20 p-8 md:p-12"
			style={{
				background:
					"linear-gradient(135deg, oklch(0.75 0.15 150 / 0.15) 0%, oklch(0.7 0.18 120 / 0.1) 50%, oklch(0.65 0.15 180 / 0.08) 100%)",
			}}
			initial={false}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.6, ease: "easeOut" }}
		>
			<div className="pointer-events-none absolute inset-0 overflow-hidden print:hidden">
				<motion.div
					className="absolute -top-32 -right-32 size-96 rounded-full bg-gradient-to-br from-green-500/20 to-emerald-500/10 blur-3xl"
					animate={{
						scale: [1, 1.2, 1],
						rotate: [0, 10, 0],
						opacity: [0.5, 0.3, 0.5],
					}}
					transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
				/>
				<motion.div
					className="absolute -bottom-32 -left-32 size-96 rounded-full bg-gradient-to-tr from-teal-500/15 to-green-500/10 blur-3xl"
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
					<ListChecksIcon className="size-5 text-green-600 dark:text-green-400" weight="fill" />
					<span className="font-semibold text-green-700 text-sm uppercase tracking-wider dark:text-green-300">
						<Trans>Préparation terminée</Trans>
					</span>
				</motion.div>

				<motion.h2
					className="mb-4 bg-gradient-to-r from-green-700 via-emerald-600 to-teal-700 bg-clip-text font-bold text-3xl text-transparent tracking-tight md:text-4xl lg:text-5xl dark:from-green-400 dark:via-emerald-400 dark:to-teal-400"
					initial={false}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.3 }}
				>
					<Trans>Liste de preparation</Trans>
				</motion.h2>

				<motion.p
					className="mb-8 max-w-2xl text-lg text-muted-foreground"
					initial={false}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.4 }}
				>
					<Trans>
						Préparez votre entretien avec une liste claire et complète. Cochez chaque étape pour arriver prêt le jour J.
					</Trans>
				</motion.p>

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
					<Button variant="outline" className="gap-2" onClick={resetChecklist} disabled={isResetting}>
						{isResetting ? <SpinnerIcon className="size-4 animate-spin" /> : <WarningIcon className="size-4" />}
						<Trans>Reinitialiser</Trans>
					</Button>
				</motion.div>
			</div>
		</motion.div>
	);
}

export function ProgressRingSection({
	progressPercentage,
	completedItems,
	totalItems,
	preInterviewCompleted,
	preInterviewTotal,
	preInterviewProgress,
	dayOfCompleted,
	dayOfTotal,
	dayOfProgress,
}: {
	progressPercentage: number;
	completedItems: number;
	totalItems: number;
	preInterviewCompleted: number;
	preInterviewTotal: number;
	preInterviewProgress: number;
	dayOfCompleted: number;
	dayOfTotal: number;
	dayOfProgress: number;
}) {
	return (
		<section className="mb-8">
			<div className="grid gap-6 md:grid-cols-3">
				<Card className="overflow-hidden">
					<CardHeader className="pb-2">
						<CardTitle className="flex items-center gap-2 text-lg">
							<CheckCircleIcon className="size-5 text-primary" weight="duotone" />
							<Trans>Progression globale</Trans>
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="flex items-center gap-6">
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
										stroke="url(#progress-gradient)"
										strokeWidth="10"
										strokeLinecap="round"
										strokeDasharray={`${progressPercentage * 2.51} 251`}
										className="transition-all duration-500"
									/>
									<defs>
										<linearGradient id="progress-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
											<stop offset="0%" stopColor="#22c55e" />
											<stop offset="100%" stopColor="#10b981" />
										</linearGradient>
									</defs>
								</svg>
								<div className="absolute inset-0 flex flex-col items-center justify-center">
									<span className="font-bold text-2xl text-green-600 dark:text-green-400">{progressPercentage}%</span>
								</div>
							</div>
							<div>
								<p className="font-semibold text-2xl">
									{completedItems}/{totalItems}
								</p>
								<p className="text-muted-foreground text-sm">
									<Trans>étapes terminées</Trans>
								</p>
							</div>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="flex items-center gap-2 text-lg">
							<BookOpenIcon className="size-5 text-blue-500" weight="duotone" />
							<Trans>Avant l'entretien</Trans>
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="space-y-2">
							<div className="flex items-center justify-between">
								<span className="text-muted-foreground text-sm">
									{preInterviewCompleted}/{preInterviewTotal}
								</span>
								<span className="font-semibold text-blue-600 dark:text-blue-400">{preInterviewProgress}%</span>
							</div>
							<Progress value={preInterviewProgress} className="h-3" />
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="flex items-center gap-2 text-lg">
							<SunIcon className="size-5 text-amber-500" weight="duotone" />
							<Trans>Jour de l'entretien</Trans>
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="space-y-2">
							<div className="flex items-center justify-between">
								<span className="text-muted-foreground text-sm">
									{dayOfCompleted}/{dayOfTotal}
								</span>
								<span className="font-semibold text-amber-600 dark:text-amber-400">{dayOfProgress}%</span>
							</div>
							<Progress value={dayOfProgress} className="h-3" />
						</div>
					</CardContent>
				</Card>
			</div>
		</section>
	);
}

export function ReminderSection({
	reminder,
	countdown,
	reminderDate,
	reminderTime,
	reminderCompany,
	setReminderDate,
	setReminderTime,
	setReminderCompany,
	saveReminder,
	clearReminder,
	isSettingReminder,
	isClearingReminder,
}: {
	reminder: InterviewReminder | null;
	countdown: { days: number; hours: number; minutes: number; passed: boolean } | null;
	reminderDate: string;
	reminderTime: string;
	reminderCompany: string;
	setReminderDate: (v: string) => void;
	setReminderTime: (v: string) => void;
	setReminderCompany: (v: string) => void;
	saveReminder: () => void;
	clearReminder: () => void;
	isSettingReminder: boolean;
	isClearingReminder: boolean;
}) {
	return (
		<section className="mb-8 print:hidden">
			<Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<CalendarIcon className="size-5 text-primary" weight="duotone" />
						<Trans>Rappel d'entretien</Trans>
					</CardTitle>
					<CardDescription>
						<Trans>Définissez la date de votre entretien pour recevoir un rappel</Trans>
					</CardDescription>
				</CardHeader>
				<CardContent>
					{reminder ? (
						<div className="space-y-4">
							{countdown && !countdown.passed ? (
								<div className="flex flex-wrap items-center gap-4 rounded-lg bg-primary/10 p-4">
									<div className="flex items-center gap-2">
										<ClockIcon className="size-6 text-primary" weight="duotone" />
										<span className="font-medium">
											<Trans>Temps restant :</Trans>
										</span>
									</div>
									<div className="flex gap-4">
										<div className="text-center">
											<p className="font-bold text-2xl text-primary">{countdown.days}</p>
											<p className="text-muted-foreground text-xs">
												<Trans>jours</Trans>
											</p>
										</div>
										<div className="text-center">
											<p className="font-bold text-2xl text-primary">{countdown.hours}</p>
											<p className="text-muted-foreground text-xs">
												<Trans>heures</Trans>
											</p>
										</div>
										<div className="text-center">
											<p className="font-bold text-2xl text-primary">{countdown.minutes}</p>
											<p className="text-muted-foreground text-xs">
												<Trans>min</Trans>
											</p>
										</div>
									</div>
								</div>
							) : countdown?.passed ? (
								<div className="flex items-center gap-2 rounded-lg bg-amber-100 p-4 dark:bg-amber-900/30">
									<WarningIcon className="size-5 text-amber-600 dark:text-amber-400" />
									<span className="text-amber-700 dark:text-amber-300">
										<Trans>L'entretien est passé !</Trans>
									</span>
								</div>
							) : null}

							<div className="flex flex-wrap items-center gap-4">
								<Badge variant="secondary" className="gap-1.5 px-3 py-1.5">
									<CalendarIcon className="size-4" />
									{new Date(`${reminder.date}T${reminder.time}`).toLocaleDateString("fr-FR", {
										weekday: "long",
										year: "numeric",
										month: "long",
										day: "numeric",
									})}
								</Badge>
								<Badge variant="secondary" className="gap-1.5 px-3 py-1.5">
									<ClockIcon className="size-4" />
									{reminder.time}
								</Badge>
								{reminder.company && (
									<Badge variant="secondary" className="gap-1.5 px-3 py-1.5">
										{reminder.company}
									</Badge>
								)}
								{reminder.notificationScheduled && (
									<Badge className="gap-1.5 bg-green-100 px-3 py-1.5 text-green-700 dark:bg-green-900/30 dark:text-green-400">
										<BellIcon className="size-4" />
										<Trans>Rappel actif</Trans>
									</Badge>
								)}
							</div>

							<Button variant="outline" size="sm" onClick={clearReminder} disabled={isClearingReminder}>
								{isClearingReminder ? <SpinnerIcon className="mr-2 size-4 animate-spin" /> : null}
								<Trans>Supprimer le rappel</Trans>
							</Button>
						</div>
					) : (
						<div className="grid gap-4 md:grid-cols-4">
							<div className="space-y-2">
								<Label>
									<Trans>Date</Trans>
								</Label>
								<Input
									type="date"
									value={reminderDate}
									onChange={(e) => setReminderDate(e.target.value)}
									min={new Date().toISOString().split("T")[0]}
								/>
							</div>
							<div className="space-y-2">
								<Label>
									<Trans>Heure</Trans>
								</Label>
								<Input type="time" value={reminderTime} onChange={(e) => setReminderTime(e.target.value)} />
							</div>
							<div className="space-y-2">
								<Label>
									<Trans>Entreprise (facultatif)</Trans>
								</Label>
								<Input
									placeholder={t`Nom de l'entreprise`}
									value={reminderCompany}
									onChange={(e) => setReminderCompany(e.target.value)}
								/>
							</div>
							<div className="flex items-end">
								<Button onClick={saveReminder} className="w-full gap-2" disabled={isSettingReminder}>
									{isSettingReminder ? (
										<SpinnerIcon className="size-4 animate-spin" />
									) : (
										<BellIcon className="size-4" />
									)}
									<Trans>Definir le rappel</Trans>
								</Button>
							</div>
						</div>
					)}
				</CardContent>
			</Card>
		</section>
	);
}

export function ChecklistSection({
	title,
	icon: SectionIcon,
	iconColor,
	completed,
	total,
	items,
	checkedItems,
	expandedItems,
	isToggling,
	onToggle,
	onExpand,
}: {
	title: string;
	icon: typeof BookOpenIcon;
	iconColor: string;
	completed: number;
	total: number;
	items: ChecklistItem[];
	checkedItems: Set<string>;
	expandedItems: Set<string>;
	isToggling: boolean;
	onToggle: (id: string) => void;
	onExpand: (id: string) => void;
}) {
	return (
		<section className="mb-8">
			<h3 className="mb-6 flex items-center gap-2 font-semibold text-2xl">
				<SectionIcon className={cn("size-6", iconColor)} weight="duotone" />
				{title}
				<Badge variant="secondary" className="ml-2">
					{completed}/{total}
				</Badge>
			</h3>
			<div className="space-y-4">
				{items.map((item, index) => (
					<ChecklistItemCard
						key={item.id}
						item={item}
						index={index}
						isChecked={checkedItems.has(item.id)}
						isExpanded={expandedItems.has(item.id)}
						isToggling={isToggling}
						onToggle={onToggle}
						onExpand={onExpand}
					/>
				))}
			</div>
		</section>
	);
}

export function QuickLinksSection() {
	return (
		<section className="print:hidden">
			<h3 className="mb-6 flex items-center gap-2 font-semibold text-2xl">
				<SparkleIcon className="size-6 text-primary" weight="duotone" />
				<Trans>Ressources utiles</Trans>
			</h3>

			<div className="grid gap-4 md:grid-cols-3">
				<Link to="/dashboard/interview/chatbot" search={{ mode: "quick_practice" }}>
					<Card className="group h-full cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
						<CardContent className="flex items-center gap-4 p-6">
							<div className="flex size-14 items-center justify-center rounded-xl bg-purple-100 transition-transform group-hover:scale-110 dark:bg-purple-900/30">
								<PlayIcon className="size-7 text-purple-600 dark:text-purple-400" weight="duotone" />
							</div>
							<div className="flex-1">
								<h4 className="font-semibold">
									<Trans>S'entraîner avec l'IA</Trans>
								</h4>
								<p className="text-muted-foreground text-sm">
									<Trans>Simuler un entretien</Trans>
								</p>
							</div>
							<ArrowRightIcon className="size-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
						</CardContent>
					</Card>
				</Link>

				<Link to={"/dashboard/interview/questions" as string}>
					<Card className="group h-full cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
						<CardContent className="flex items-center gap-4 p-6">
							<div className="flex size-14 items-center justify-center rounded-xl bg-blue-100 transition-transform group-hover:scale-110 dark:bg-blue-900/30">
								<QuestionIcon className="size-7 text-blue-600 dark:text-blue-400" weight="duotone" />
							</div>
							<div className="flex-1">
								<h4 className="font-semibold">
									<Trans>Questions fréquentes</Trans>
								</h4>
								<p className="text-muted-foreground text-sm">
									<Trans>Préparez vos réponses</Trans>
								</p>
							</div>
							<ArrowRightIcon className="size-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
						</CardContent>
					</Card>
				</Link>

				<Link to={"/dashboard/interview/tips" as string}>
					<Card className="group h-full cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
						<CardContent className="flex items-center gap-4 p-6">
							<div className="flex size-14 items-center justify-center rounded-xl bg-amber-100 transition-transform group-hover:scale-110 dark:bg-amber-900/30">
								<LightbulbIcon className="size-7 text-amber-600 dark:text-amber-400" weight="fill" />
							</div>
							<div className="flex-1">
								<h4 className="font-semibold">
									<Trans>Conseils d'entretien</Trans>
								</h4>
								<p className="text-muted-foreground text-sm">
									<Trans>Conseils pour réussir</Trans>
								</p>
							</div>
							<ArrowRightIcon className="size-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
						</CardContent>
					</Card>
				</Link>
			</div>
		</section>
	);
}

export function CompletionCard() {
	return (
		<motion.section className="mt-8" initial={false} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}>
			<Card className="overflow-hidden border-green-500/30 bg-gradient-to-br from-green-50 to-emerald-50/50 dark:from-green-900/20 dark:to-emerald-900/10">
				<CardContent className="flex flex-col items-center justify-center p-8 text-center">
					<div className="mb-4 flex size-20 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
						<CheckCircleIcon className="size-10 text-green-600 dark:text-green-400" weight="fill" />
					</div>
					<h3 className="mb-2 font-bold text-2xl text-green-700 dark:text-green-400">
						<Trans>Felicitations !</Trans>
					</h3>
					<p className="mb-4 max-w-md text-muted-foreground">
						<Trans>Vous avez terminé toute la liste de préparation. Vous êtes prêt pour votre entretien !</Trans>
					</p>
					<div className="flex flex-wrap gap-4">
						<Link to="/dashboard/interview/chatbot" search={{ mode: "mock_interview" }}>
							<Button className="gap-2">
								<PlayIcon className="size-4" />
								<Trans>Faire une derniere simulation</Trans>
							</Button>
						</Link>
					</div>
				</CardContent>
			</Card>
		</motion.section>
	);
}

export const PRINT_STYLES = `
	@media print {
		body {
			font-size: 11pt;
		}
		.print\\:hidden {
			display: none !important;
		}
	}
`;
