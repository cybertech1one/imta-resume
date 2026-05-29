import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import {
	ArrowCounterClockwiseIcon,
	CalendarIcon,
	CheckCircleIcon,
	ClockIcon,
	CopyIcon,
	DownloadIcon,
	EnvelopeIcon,
	EnvelopeSimpleOpenIcon,
	HandshakeIcon,
	InfoIcon,
	LightbulbIcon,
	MagicWandIcon,
	NotePencilIcon,
	PaperPlaneTiltIcon,
	PlusIcon,
	SparkleIcon,
	SpinnerIcon,
	StarIcon,
	TrashIcon,
	UserIcon,
	WarningCircleIcon,
} from "@phosphor-icons/react";
import type { UseMutationResult } from "@tanstack/react-query";
import { AnimatePresence, motion } from "motion/react";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/utils/style";
import { DashboardHeader } from "../../-components/header";

import { interviewTypes, sendMethods, templateConfig } from "./thank-you-config";
import type { InterviewType, SendMethod, TemplateStyle, TimingRecommendation } from "./thank-you-types";

// ---------------------------------------------------------------------------
// Loading State
// ---------------------------------------------------------------------------
export function ThankYouLoadingState() {
	return (
		<>
			<DashboardHeader icon={HandshakeIcon} title={t`Thank You Letter Generator`} />
			<div className="flex items-center justify-center py-12">
				<div className="flex flex-col items-center gap-4">
					<div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
					<p className="text-muted-foreground">
						<Trans>Loading...</Trans>
					</p>
				</div>
			</div>
		</>
	);
}

// ---------------------------------------------------------------------------
// Error State
// ---------------------------------------------------------------------------
export function ThankYouErrorState() {
	return (
		<>
			<DashboardHeader icon={HandshakeIcon} title={t`Thank You Letter Generator`} />
			<Card className="border-destructive">
				<CardContent className="flex flex-col items-center py-12 text-center">
					<WarningCircleIcon className="mb-4 size-12 text-destructive" />
					<h3 className="mb-2 font-medium text-lg">
						<Trans>Loading error</Trans>
					</h3>
					<p className="max-w-sm text-muted-foreground">
						<Trans>Unable to load your thank you letters. Please try again.</Trans>
					</p>
				</CardContent>
			</Card>
		</>
	);
}

// ---------------------------------------------------------------------------
// Hero Section
// ---------------------------------------------------------------------------
export function ThankYouHeroSection({
	statistics,
}: {
	statistics: { totalLetters: number; totalSent: number } | undefined;
}) {
	return (
		<motion.div
			className="relative mb-8 overflow-hidden rounded-3xl border border-primary/20 p-8 md:p-12"
			style={{
				background:
					"linear-gradient(135deg, oklch(0.7 0.15 180 / 0.15) 0%, oklch(0.6 0.18 220 / 0.1) 50%, oklch(0.65 0.12 160 / 0.08) 100%)",
			}}
			initial={false}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.6, ease: "easeOut" }}
		>
			{/* Animated background elements */}
			<div className="pointer-events-none absolute inset-0 overflow-hidden">
				<motion.div
					className="absolute -top-32 -right-32 size-96 rounded-full bg-gradient-to-br from-teal-500/20 to-emerald-500/10 blur-3xl"
					animate={{
						scale: [1, 1.2, 1],
						rotate: [0, 10, 0],
						opacity: [0.5, 0.3, 0.5],
					}}
					transition={{ duration: 10, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
				/>
				<motion.div
					className="absolute -bottom-32 -left-32 size-96 rounded-full bg-gradient-to-tr from-cyan-500/15 to-teal-500/10 blur-3xl"
					animate={{
						scale: [1.2, 1, 1.2],
						rotate: [0, -10, 0],
						opacity: [0.3, 0.5, 0.3],
					}}
					transition={{ duration: 10, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
				/>
				<motion.div
					className="absolute top-1/2 left-1/2 size-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/5 blur-3xl"
					animate={{
						scale: [1, 1.3, 1],
					}}
					transition={{ duration: 6, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
				/>
			</div>

			<div className="relative z-10">
				<motion.div
					className="mb-3 flex items-center gap-2"
					initial={false}
					animate={{ opacity: 1, x: 0 }}
					transition={{ delay: 0.2 }}
				>
					<HandshakeIcon className="size-5 text-primary" weight="fill" />
					<span className="font-semibold text-primary text-sm uppercase tracking-wider">
						<Trans>Follow-up Tools</Trans>
					</span>
				</motion.div>

				<motion.h2
					className="mb-4 bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text font-bold text-3xl text-transparent tracking-tight md:text-4xl lg:text-5xl"
					initial={false}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.3 }}
				>
					<Trans>Thank You Letter</Trans>
				</motion.h2>

				<motion.p
					className="mb-8 max-w-2xl text-lg text-muted-foreground"
					initial={false}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.4 }}
				>
					<Trans>
						Create a personalized thank you letter after your interview. A professional gesture that can make the
						difference in your application.
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
							<ClockIcon className="size-5 text-primary" weight="duotone" />
						</div>
						<div>
							<p className="font-bold text-xl">24-48h</p>
							<p className="text-muted-foreground text-sm">
								<Trans>Ideal timing</Trans>
							</p>
						</div>
					</div>
					<div className="flex items-center gap-2">
						<div className="flex size-10 items-center justify-center rounded-full bg-green-500/10">
							<CheckCircleIcon className="size-5 text-green-500" weight="duotone" />
						</div>
						<div>
							<p className="font-bold text-xl">{statistics?.totalLetters ?? 0}</p>
							<p className="text-muted-foreground text-sm">
								<Trans>Letters created</Trans>
							</p>
						</div>
					</div>
					<div className="flex items-center gap-2">
						<div className="flex size-10 items-center justify-center rounded-full bg-amber-500/10">
							<SparkleIcon className="size-5 text-amber-500" weight="duotone" />
						</div>
						<div>
							<p className="font-bold text-xl">{statistics?.totalSent ?? 0}</p>
							<p className="text-muted-foreground text-sm">
								<Trans>Sent</Trans>
							</p>
						</div>
					</div>
				</motion.div>
			</div>
		</motion.div>
	);
}

// ---------------------------------------------------------------------------
// Recipient Details Card
// ---------------------------------------------------------------------------
export function RecipientDetailsCard({
	recipientName,
	setRecipientName,
	recipientPosition,
	setRecipientPosition,
	recipientCompany,
	setRecipientCompany,
	recipientEmail,
	setRecipientEmail,
}: {
	recipientName: string;
	setRecipientName: (v: string) => void;
	recipientPosition: string;
	setRecipientPosition: (v: string) => void;
	recipientCompany: string;
	setRecipientCompany: (v: string) => void;
	recipientEmail: string;
	setRecipientEmail: (v: string) => void;
}) {
	return (
		<Card className="border-2 border-primary/20">
			<CardHeader>
				<CardTitle className="flex items-center gap-2 text-xl">
					<UserIcon className="size-5 text-primary" weight="duotone" />
					<Trans>Recipient</Trans>
				</CardTitle>
				<CardDescription>
					<Trans>Information about the person who interviewed you</Trans>
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="grid gap-4 sm:grid-cols-2">
					<div className="space-y-2">
						<Label>
							<Trans>Name *</Trans>
						</Label>
						<input
							type="text"
							className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none transition-[color,box-shadow] placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
							placeholder={t`E.g.: Jane Smith`}
							value={recipientName}
							onChange={(e) => setRecipientName(e.target.value)}
						/>
					</div>
					<div className="space-y-2">
						<Label>
							<Trans>Position</Trans>
						</Label>
						<input
							type="text"
							className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none transition-[color,box-shadow] placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
							placeholder={t`E.g.: HR Director`}
							value={recipientPosition}
							onChange={(e) => setRecipientPosition(e.target.value)}
						/>
					</div>
				</div>
				<div className="grid gap-4 sm:grid-cols-2">
					<div className="space-y-2">
						<Label>
							<Trans>Company *</Trans>
						</Label>
						<input
							type="text"
							className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none transition-[color,box-shadow] placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
							placeholder={t`E.g.: TechVision Morocco`}
							value={recipientCompany}
							onChange={(e) => setRecipientCompany(e.target.value)}
						/>
					</div>
					<div className="space-y-2">
						<Label>
							<Trans>Email</Trans>
						</Label>
						<input
							type="email"
							className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none transition-[color,box-shadow] placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
							placeholder={t`E.g.: jane@techvision.ma`}
							value={recipientEmail}
							onChange={(e) => setRecipientEmail(e.target.value)}
						/>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}

// ---------------------------------------------------------------------------
// Interview Details Card
// ---------------------------------------------------------------------------
export function InterviewDetailsCard({
	interviewDate,
	setInterviewDate,
	interviewType,
	setInterviewType,
	jobPosition,
	setJobPosition,
	discussionPoints,
	setDiscussionPoints,
	timingRecommendation,
}: {
	interviewDate: string;
	setInterviewDate: (v: string) => void;
	interviewType: InterviewType;
	setInterviewType: (v: InterviewType) => void;
	jobPosition: string;
	setJobPosition: (v: string) => void;
	discussionPoints: string;
	setDiscussionPoints: (v: string) => void;
	timingRecommendation: TimingRecommendation;
}) {
	return (
		<Card className="border-2 border-primary/20">
			<CardHeader>
				<CardTitle className="flex items-center gap-2 text-xl">
					<CalendarIcon className="size-5 text-primary" weight="duotone" />
					<Trans>Interview Details</Trans>
				</CardTitle>
				<CardDescription>
					<Trans>Information about the interview you had</Trans>
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="grid gap-4 sm:grid-cols-2">
					<div className="space-y-2">
						<Label>
							<Trans>Interview date *</Trans>
						</Label>
						<input
							type="date"
							className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none transition-[color,box-shadow] placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
							value={interviewDate}
							onChange={(e) => setInterviewDate(e.target.value)}
						/>
					</div>
					<div className="space-y-2">
						<Label>
							<Trans>Interview type</Trans>
						</Label>
						<Select value={interviewType} onValueChange={(v) => setInterviewType(v as InterviewType)}>
							<SelectTrigger className="h-10">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{Object.entries(interviewTypes).map(([key, config]) => (
									<SelectItem key={key} value={key}>
										{config.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				</div>

				<div className="space-y-2">
					<Label>
						<Trans>Target position *</Trans>
					</Label>
					<input
						type="text"
						className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none transition-[color,box-shadow] placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
						placeholder={t`E.g.: Digital Project Manager`}
						value={jobPosition}
						onChange={(e) => setJobPosition(e.target.value)}
					/>
				</div>

				<div className="space-y-2">
					<Label>
						<Trans>Key discussion points</Trans>
					</Label>
					<Textarea
						placeholder={t`One point per line:\n- Digital transformation projects\n- Company culture\n- Growth opportunities`}
						className="min-h-24 resize-none"
						value={discussionPoints}
						onChange={(e) => setDiscussionPoints(e.target.value)}
					/>
					<p className="text-muted-foreground text-xs">
						<Trans>Enter one discussion point per line to include in the letter</Trans>
					</p>
				</div>

				{/* Timing Recommendation */}
				{interviewDate && (
					<motion.div
						initial={false}
						animate={{ opacity: 1, y: 0 }}
						className={cn(
							"flex items-center gap-3 rounded-lg border p-4",
							timingRecommendation.status === "optimal" && "border-green-500/30 bg-green-50/50 dark:bg-green-950/20",
							timingRecommendation.status === "acceptable" && "border-amber-500/30 bg-amber-50/50 dark:bg-amber-950/20",
							timingRecommendation.status === "late" && "border-red-500/30 bg-red-50/50 dark:bg-red-950/20",
						)}
					>
						<ClockIcon
							className={cn(
								"size-5",
								timingRecommendation.status === "optimal" && "text-green-600 dark:text-green-400",
								timingRecommendation.status === "acceptable" && "text-amber-600 dark:text-amber-400",
								timingRecommendation.status === "late" && "text-red-600 dark:text-red-400",
							)}
							weight="fill"
						/>
						<div>
							<p
								className={cn(
									"font-medium text-sm",
									timingRecommendation.status === "optimal" && "text-green-700 dark:text-green-300",
									timingRecommendation.status === "acceptable" && "text-amber-700 dark:text-amber-300",
									timingRecommendation.status === "late" && "text-red-700 dark:text-red-300",
								)}
							>
								{timingRecommendation.message}
							</p>
						</div>
					</motion.div>
				)}
			</CardContent>
		</Card>
	);
}

// ---------------------------------------------------------------------------
// Template Selection Card
// ---------------------------------------------------------------------------
export function TemplateSelectionCard({
	selectedTemplate,
	setSelectedTemplate,
}: {
	selectedTemplate: TemplateStyle;
	setSelectedTemplate: (v: TemplateStyle) => void;
}) {
	return (
		<Card className="border-2 border-primary/20">
			<CardHeader>
				<CardTitle className="flex items-center gap-2 text-xl">
					<StarIcon className="size-5 text-primary" weight="duotone" />
					<Trans>Letter Style</Trans>
				</CardTitle>
				<CardDescription>
					<Trans>Choose the tone that matches your personality and context</Trans>
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="grid gap-3">
					{(Object.entries(templateConfig) as [TemplateStyle, (typeof templateConfig)[TemplateStyle]][]).map(
						([key, config]) => {
							const IconComponent = config.icon;
							return (
								<motion.div
									key={key}
									whileHover={{ scale: 1.02 }}
									whileTap={{ scale: 0.98 }}
									className={cn(
										"flex cursor-pointer items-center gap-4 rounded-lg border-2 p-4 transition-all",
										selectedTemplate === key ? "border-primary bg-primary/10" : "border-muted hover:border-primary/30",
									)}
									onClick={() => setSelectedTemplate(key)}
								>
									<div
										className={cn(
											"flex size-12 items-center justify-center rounded-xl",
											selectedTemplate === key ? "bg-primary/20" : "bg-muted",
										)}
									>
										<IconComponent className={cn("size-6", config.color)} weight="duotone" />
									</div>
									<div className="flex-1">
										<h4 className="font-semibold">{config.label}</h4>
										<p className="text-muted-foreground text-sm">{config.description}</p>
									</div>
									{selectedTemplate === key && <CheckCircleIcon className="size-6 text-primary" weight="fill" />}
								</motion.div>
							);
						},
					)}
				</div>
			</CardContent>
		</Card>
	);
}

// ---------------------------------------------------------------------------
// AI Personalization Card
// ---------------------------------------------------------------------------
export function AIPersonalizationCard({
	includePersonalization,
	setIncludePersonalization,
	selectedLetterId,
	suggestions,
	handleLoadAISuggestions,
	handleToggleSuggestion,
	isLoadingSuggestions,
}: {
	includePersonalization: boolean;
	setIncludePersonalization: (v: boolean) => void;
	selectedLetterId: string | null;
	suggestions: { id: string; category: string; text: string; applied: boolean }[];
	handleLoadAISuggestions: () => void;
	handleToggleSuggestion: (id: string) => void;
	isLoadingSuggestions: boolean;
}) {
	return (
		<Card className="border-2 border-amber-500/20">
			<CardHeader>
				<CardTitle className="flex items-center justify-between">
					<span className="flex items-center gap-2 text-xl">
						<SparkleIcon className="size-5 text-amber-500" weight="fill" />
						<Trans>AI Personalization</Trans>
					</span>
					<Switch checked={includePersonalization} onCheckedChange={setIncludePersonalization} />
				</CardTitle>
				<CardDescription>
					<Trans>Smart suggestions to personalize your letter</Trans>
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				{includePersonalization && (
					<>
						<Button
							variant="outline"
							className="w-full gap-2"
							onClick={handleLoadAISuggestions}
							disabled={!selectedLetterId || isLoadingSuggestions}
						>
							{isLoadingSuggestions ? (
								<>
									<SpinnerIcon className="size-4 animate-spin" />
									<Trans>Loading...</Trans>
								</>
							) : (
								<>
									<SparkleIcon className="size-4" />
									<Trans>Generate new suggestions</Trans>
								</>
							)}
						</Button>

						<div className="space-y-3">
							{suggestions.map((suggestion) => (
								<motion.div
									key={suggestion.id}
									initial={false}
									animate={{ opacity: 1, y: 0 }}
									className={cn(
										"flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-all",
										suggestion.applied
											? "border-green-500/50 bg-green-50/50 dark:bg-green-950/20"
											: "hover:bg-muted/50",
									)}
									onClick={() => handleToggleSuggestion(suggestion.id)}
								>
									<div
										className={cn(
											"mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
											suggestion.applied ? "border-green-500 bg-green-500" : "border-muted-foreground/30",
										)}
									>
										{suggestion.applied && <CheckCircleIcon className="size-3 text-white" weight="bold" />}
									</div>
									<div className="flex-1">
										<Badge variant="outline" className="mb-1 text-xs capitalize">
											{suggestion.category === "opening" && <Trans>Opening</Trans>}
											{suggestion.category === "body" && <Trans>Body</Trans>}
											{suggestion.category === "closing" && <Trans>Closing</Trans>}
											{suggestion.category === "personalization" && <Trans>Personalization</Trans>}
										</Badge>
										<p className="text-sm">{suggestion.text}</p>
									</div>
								</motion.div>
							))}
						</div>

						{suggestions.length === 0 && selectedLetterId && (
							<p className="text-center text-muted-foreground text-sm">
								<Trans>Click the button above to generate suggestions</Trans>
							</p>
						)}

						{!selectedLetterId && (
							<p className="text-center text-muted-foreground text-sm">
								<Trans>Generate a letter first to get suggestions</Trans>
							</p>
						)}
					</>
				)}

				{!includePersonalization && (
					<p className="text-center text-muted-foreground text-sm">
						<Trans>Enable AI personalization to see suggestions</Trans>
					</p>
				)}
			</CardContent>
		</Card>
	);
}

// ---------------------------------------------------------------------------
// Generator Action Buttons
// ---------------------------------------------------------------------------
export function GeneratorActionButtons({
	isGenerating,
	isFormValid,
	isSaving,
	handleGenerateLetter,
	handleReset,
}: {
	isGenerating: boolean;
	isFormValid: boolean;
	isSaving: boolean;
	handleGenerateLetter: () => void;
	handleReset: () => void;
}) {
	return (
		<div className="flex gap-3">
			<Button
				className="flex-1 gap-2"
				size="lg"
				onClick={handleGenerateLetter}
				disabled={isGenerating || !isFormValid || isSaving}
			>
				{isGenerating || isSaving ? (
					<>
						<SpinnerIcon className="size-5 animate-spin" />
						<Trans>Generating...</Trans>
					</>
				) : (
					<>
						<NotePencilIcon className="size-5" />
						<Trans>Generate Letter</Trans>
					</>
				)}
			</Button>
			<Button variant="outline" size="lg" onClick={handleReset}>
				<ArrowCounterClockwiseIcon className="size-5" />
			</Button>
		</div>
	);
}

// ---------------------------------------------------------------------------
// Saved Letters Tab Content
// ---------------------------------------------------------------------------
export type SavedLetter = {
	id: string;
	userId: string;
	template: TemplateStyle;
	recipientName: string;
	recipientCompany: string;
	recipientPosition: string | null;
	recipientEmail: string | null;
	jobPosition: string;
	content: string;
	interviewDate: string;
	interviewType: InterviewType;
	discussionPoints: string[];
	createdAt: Date;
	updatedAt: Date;
};

export function SavedLettersTabContent({
	savedLetters,
	setActiveTab,
	handleLoadSavedLetter,
	handleDeleteLetter,
}: {
	savedLetters: SavedLetter[];
	setActiveTab: (v: string) => void;
	handleLoadSavedLetter: (letter: SavedLetter) => void;
	handleDeleteLetter: (id: string) => void;
}) {
	if (savedLetters.length === 0) {
		return (
			<Card className="border-dashed">
				<CardContent className="flex flex-col items-center py-12 text-center">
					<EnvelopeSimpleOpenIcon className="mb-4 size-12 text-muted-foreground/50" />
					<h3 className="mb-2 font-medium text-lg">
						<Trans>No saved letters</Trans>
					</h3>
					<p className="mb-4 max-w-sm text-muted-foreground">
						<Trans>Generate and save your thank you letters to find them here.</Trans>
					</p>
					<Button onClick={() => setActiveTab("generator")}>
						<PlusIcon className="mr-2 size-4" />
						<Trans>Create a letter</Trans>
					</Button>
				</CardContent>
			</Card>
		);
	}

	return (
		<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
			{savedLetters.map((letter, index) => (
				<motion.div key={letter.id} initial={false} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
					<Card className="h-full transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
						<CardHeader className="pb-2">
							<div className="flex items-start justify-between">
								<div className="flex items-center gap-2">
									<div
										className={cn("rounded-lg p-2", templateConfig[letter.template]?.color ? "bg-muted" : "bg-muted")}
									>
										<EnvelopeIcon className="size-4" weight="duotone" />
									</div>
									<Badge variant="outline" className="text-xs">
										{templateConfig[letter.template]?.label || letter.template}
									</Badge>
								</div>
								<AlertDialog>
									<AlertDialogTrigger asChild>
										<Button variant="ghost" size="icon-sm">
											<TrashIcon className="size-4 text-destructive" />
										</Button>
									</AlertDialogTrigger>
									<AlertDialogContent>
										<AlertDialogHeader>
											<AlertDialogTitle>
												<Trans>Delete this letter?</Trans>
											</AlertDialogTitle>
											<AlertDialogDescription>
												<Trans>
													This action is irreversible. The letter for {letter.recipientCompany} will be permanently
													deleted.
												</Trans>
											</AlertDialogDescription>
										</AlertDialogHeader>
										<AlertDialogFooter>
											<AlertDialogCancel>
												<Trans>Cancel</Trans>
											</AlertDialogCancel>
											<AlertDialogAction onClick={() => handleDeleteLetter(letter.id)}>
												<Trans>Delete</Trans>
											</AlertDialogAction>
										</AlertDialogFooter>
									</AlertDialogContent>
								</AlertDialog>
							</div>
							<CardTitle className="mt-2 text-base leading-tight">
								{letter.jobPosition} - {letter.recipientCompany}
							</CardTitle>
							<CardDescription className="text-xs">
								<Trans>For:</Trans> {letter.recipientName}
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-3">
							<p className="line-clamp-3 text-muted-foreground text-sm">{letter.content.substring(0, 150)}...</p>

							<p className="text-muted-foreground text-xs">
								{letter.createdAt.toLocaleDateString(undefined, {
									year: "numeric",
									month: "long",
									day: "numeric",
								})}
							</p>

							<Button
								variant="outline"
								size="sm"
								className="w-full gap-1"
								onClick={() => handleLoadSavedLetter(letter)}
							>
								<MagicWandIcon className="size-4" />
								<Trans>Load</Trans>
							</Button>
						</CardContent>
					</Card>
				</motion.div>
			))}
		</div>
	);
}

// ---------------------------------------------------------------------------
// Preview Tab Content
// ---------------------------------------------------------------------------
export function PreviewTabContent({
	generatedContent,
	selectedTemplate,
	handleCopyToClipboard,
	handleExportLetter,
	setActiveTab,
}: {
	generatedContent: string | null;
	selectedTemplate: TemplateStyle;
	handleCopyToClipboard: (text: string) => void;
	handleExportLetter: () => void;
	setActiveTab: (v: string) => void;
}) {
	return (
		<AnimatePresence mode="wait">
			{generatedContent ? (
				<motion.div
					key="letter"
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					exit={{ opacity: 0, y: -20 }}
					className="space-y-6"
				>
					{/* Letter Preview Card */}
					<Card className="border-2 border-primary/20">
						<CardHeader>
							<div className="flex items-center justify-between">
								<div>
									<CardTitle className="flex items-center gap-2">
										<EnvelopeSimpleOpenIcon className="size-5 text-primary" weight="duotone" />
										<Trans>Letter Preview</Trans>
									</CardTitle>
									<CardDescription>
										<Trans>Template:</Trans> {templateConfig[selectedTemplate].label}
									</CardDescription>
								</div>
								<Badge className={cn(templateConfig[selectedTemplate].color, "gap-1 bg-muted")}>
									{(() => {
										const IconComponent = templateConfig[selectedTemplate].icon;
										return <IconComponent className="size-3" weight="fill" />;
									})()}
									{templateConfig[selectedTemplate].label}
								</Badge>
							</div>
						</CardHeader>
						<CardContent>
							<div className="rounded-lg border bg-card p-6 shadow-sm">
								<pre className="whitespace-pre-wrap font-sans leading-relaxed">{generatedContent}</pre>
							</div>
						</CardContent>
					</Card>

					{/* Action Buttons */}
					<div className="flex flex-wrap gap-3">
						<Button className="gap-2" onClick={() => handleCopyToClipboard(generatedContent)}>
							<CopyIcon className="size-4" />
							<Trans>Copy</Trans>
						</Button>
						<Button variant="outline" className="gap-2" onClick={handleExportLetter}>
							<DownloadIcon className="size-4" />
							<Trans>Export (.txt)</Trans>
						</Button>
						<Button variant="outline" className="gap-2" onClick={() => setActiveTab("tracking")}>
							<PaperPlaneTiltIcon className="size-4" />
							<Trans>Record delivery</Trans>
						</Button>
						<Button variant="ghost" className="gap-2" onClick={() => setActiveTab("generator")}>
							<NotePencilIcon className="size-4" />
							<Trans>Edit</Trans>
						</Button>
					</div>

					{/* Tips Section */}
					<Card className="border-amber-500/30 bg-amber-50/50 dark:bg-amber-950/20">
						<CardContent className="flex items-start gap-4 p-4">
							<div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
								<LightbulbIcon className="size-5" weight="fill" />
							</div>
							<div>
								<h4 className="mb-1 font-semibold text-amber-800 dark:text-amber-300">
									<Trans>Sending tips</Trans>
								</h4>
								<ul className="space-y-1 text-amber-700 text-sm dark:text-amber-400">
									<li>
										<Trans>Read carefully before sending</Trans>
									</li>
									<li>
										<Trans>Replace "[Your name]" with your actual signature</Trans>
									</li>
									<li>
										<Trans>Preferably send by email for faster follow-up</Trans>
									</li>
									<li>
										<Trans>Keep a tone consistent with the interview</Trans>
									</li>
								</ul>
							</div>
						</CardContent>
					</Card>
				</motion.div>
			) : (
				<motion.div
					key="empty"
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					className="flex flex-col items-center justify-center rounded-xl border-2 border-muted-foreground/30 border-dashed p-16 text-center"
				>
					<EnvelopeSimpleOpenIcon className="mb-4 size-16 text-muted-foreground/50" weight="duotone" />
					<h3 className="mb-2 font-semibold text-lg">
						<Trans>No letters generated</Trans>
					</h3>
					<p className="mb-4 text-muted-foreground">
						<Trans>Fill in the form and generate your thank you letter</Trans>
					</p>
					<Button onClick={() => setActiveTab("generator")}>
						<NotePencilIcon className="mr-2 size-4" />
						<Trans>Go to generator</Trans>
					</Button>
				</motion.div>
			)}
		</AnimatePresence>
	);
}

// ---------------------------------------------------------------------------
// Track Send Card
// ---------------------------------------------------------------------------
export function TrackSendCard({
	selectedLetterId,
	sentDate,
	setSentDate,
	sendMethod,
	setSendMethod,
	trackingNotes,
	setTrackingNotes,
	handleTrackSend,
	isTrackingPending,
}: {
	selectedLetterId: string | null;
	sentDate: string;
	setSentDate: (v: string) => void;
	sendMethod: SendMethod;
	setSendMethod: (v: SendMethod) => void;
	trackingNotes: string;
	setTrackingNotes: (v: string) => void;
	handleTrackSend: () => void;
	isTrackingPending: boolean;
}) {
	return (
		<Card className="border-2 border-primary/20">
			<CardHeader>
				<CardTitle className="flex items-center gap-2 text-xl">
					<PaperPlaneTiltIcon className="size-5 text-primary" weight="duotone" />
					<Trans>Record a Delivery</Trans>
				</CardTitle>
				<CardDescription>
					<Trans>Track your sent thank you letters</Trans>
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				{!selectedLetterId && (
					<div className="rounded-lg border border-amber-500/30 bg-amber-50/50 p-3 dark:bg-amber-950/20">
						<p className="text-amber-700 text-sm dark:text-amber-400">
							<Trans>Select or generate a letter first to record a delivery</Trans>
						</p>
					</div>
				)}

				<div className="grid gap-4 sm:grid-cols-2">
					<div className="space-y-2">
						<Label>
							<Trans>Send date *</Trans>
						</Label>
						<input
							type="date"
							className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none transition-[color,box-shadow] placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
							value={sentDate}
							onChange={(e) => setSentDate(e.target.value)}
						/>
					</div>
					<div className="space-y-2">
						<Label>
							<Trans>Send method</Trans>
						</Label>
						<Select value={sendMethod} onValueChange={(v) => setSendMethod(v as SendMethod)}>
							<SelectTrigger className="h-10">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{Object.entries(sendMethods).map(([key, config]) => {
									const IconComponent = config.icon;
									return (
										<SelectItem key={key} value={key}>
											<div className="flex items-center gap-2">
												<IconComponent className="size-4" />
												{config.label}
											</div>
										</SelectItem>
									);
								})}
							</SelectContent>
						</Select>
					</div>
				</div>

				<div className="space-y-2">
					<Label>
						<Trans>Notes</Trans>
					</Label>
					<Textarea
						placeholder={t`E.g.: Sent to jane@techvision.ma, awaiting response...`}
						className="min-h-20 resize-none"
						value={trackingNotes}
						onChange={(e) => setTrackingNotes(e.target.value)}
					/>
				</div>

				<Button className="w-full gap-2" onClick={handleTrackSend} disabled={!selectedLetterId || isTrackingPending}>
					{isTrackingPending ? <SpinnerIcon className="size-4 animate-spin" /> : <CheckCircleIcon className="size-4" />}
					<Trans>Record delivery</Trans>
				</Button>
			</CardContent>
		</Card>
	);
}

// ---------------------------------------------------------------------------
// Timing Recommendations Card
// ---------------------------------------------------------------------------
export function TimingRecommendationsCard() {
	return (
		<Card className="border-2 border-green-500/20 bg-gradient-to-br from-green-500/10 to-transparent">
			<CardHeader>
				<CardTitle className="flex items-center gap-2 text-xl">
					<ClockIcon className="size-5 text-green-600 dark:text-green-400" weight="duotone" />
					<Trans>Timing Recommendations</Trans>
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="space-y-4">
					{[
						{
							time: "0-24h",
							label: "Optimal",
							description: "The best time to send your letter",
							color: "bg-green-500",
						},
						{
							time: "24-48h",
							label: "Acceptable",
							description: "Still within the recommended timeframe",
							color: "bg-amber-500",
						},
						{
							time: "48h+",
							label: "Late",
							description: "Better late than never, but act quickly",
							color: "bg-red-500",
						},
					].map((item, index) => (
						<motion.div
							key={item.time}
							initial={false}
							animate={{ opacity: 1, x: 0 }}
							transition={{ delay: index * 0.1 }}
							className="flex items-center gap-4 rounded-lg border bg-card p-4"
						>
							<div className={cn("size-3 rounded-full", item.color)} />
							<div className="flex-1">
								<div className="flex items-center gap-2">
									<span className="font-semibold">{item.time}</span>
									<Badge variant="outline">{item.label}</Badge>
								</div>
								<p className="text-muted-foreground text-sm">{item.description}</p>
							</div>
						</motion.div>
					))}
				</div>

				<Separator />

				<div className="rounded-lg border bg-muted/30 p-4">
					<h4 className="mb-2 flex items-center gap-2 font-semibold">
						<InfoIcon className="size-4 text-primary" />
						<Trans>Why 24-48 hours?</Trans>
					</h4>
					<p className="text-muted-foreground text-sm">
						<Trans>
							Sending your letter within 24-48 hours shows your seriousness and interest in the position. It also helps
							you stay fresh in the recruiter's mind while taking time to write a thoughtful message.
						</Trans>
					</p>
				</div>
			</CardContent>
		</Card>
	);
}

// ---------------------------------------------------------------------------
// Tracking History Section
// ---------------------------------------------------------------------------
export function TrackingHistorySection({
	trackingHistory,
	deleteTrackingMutation,
}: {
	trackingHistory: {
		tracking: {
			id: string;
			method: string;
			sentDate: string;
			followUpDate?: string | null;
			notes?: string | null;
		};
		letter: {
			jobPosition: string;
			recipientCompany: string;
			recipientName: string;
		};
	}[];
	deleteTrackingMutation: UseMutationResult<unknown, Error, { id: string }, unknown>;
}) {
	return (
		<section>
			<h3 className="mb-6 flex items-center gap-2 font-semibold text-xl">
				<CalendarIcon className="size-5 text-primary" weight="duotone" />
				<Trans>Delivery History</Trans>
			</h3>

			{trackingHistory.length > 0 ? (
				<div className="space-y-4">
					{trackingHistory.map((entry, index) => {
						const MethodIcon = sendMethods[entry.tracking.method as SendMethod]?.icon || EnvelopeIcon;
						return (
							<motion.div
								key={entry.tracking.id}
								initial={false}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: index * 0.05 }}
							>
								<Card className="transition-all hover:shadow-md">
									<CardContent className="flex items-center gap-4 p-4">
										<div className="flex size-12 items-center justify-center rounded-xl bg-primary/10">
											<MethodIcon className="size-6 text-primary" weight="duotone" />
										</div>
										<div className="min-w-0 flex-1">
											<div className="flex items-center gap-2">
												<span className="font-semibold">
													{entry.letter.jobPosition} - {entry.letter.recipientCompany}
												</span>
												<Badge variant="outline">
													{sendMethods[entry.tracking.method as SendMethod]?.label || entry.tracking.method}
												</Badge>
											</div>
											<p className="text-muted-foreground text-sm">
												<Trans>For:</Trans> {entry.letter.recipientName}
											</p>
											{entry.tracking.notes && <p className="text-muted-foreground text-sm">{entry.tracking.notes}</p>}
											<div className="mt-1 flex items-center gap-4 text-muted-foreground text-xs">
												<span>
													<Trans>Sent:</Trans> {new Date(entry.tracking.sentDate).toLocaleDateString(undefined)}
												</span>
												{entry.tracking.followUpDate && (
													<span>
														<Trans>Follow-up:</Trans>{" "}
														{new Date(entry.tracking.followUpDate).toLocaleDateString(undefined)}
													</span>
												)}
											</div>
										</div>
										<div className="flex items-center gap-2">
											<CheckCircleIcon className="size-6 text-green-500" weight="fill" />
											<AlertDialog>
												<AlertDialogTrigger asChild>
													<Button variant="ghost" size="icon-sm">
														<TrashIcon className="size-4 text-destructive" />
													</Button>
												</AlertDialogTrigger>
												<AlertDialogContent>
													<AlertDialogHeader>
														<AlertDialogTitle>
															<Trans>Delete this delivery?</Trans>
														</AlertDialogTitle>
														<AlertDialogDescription>
															<Trans>This action is irreversible.</Trans>
														</AlertDialogDescription>
													</AlertDialogHeader>
													<AlertDialogFooter>
														<AlertDialogCancel>
															<Trans>Cancel</Trans>
														</AlertDialogCancel>
														<AlertDialogAction onClick={() => deleteTrackingMutation.mutate({ id: entry.tracking.id })}>
															<Trans>Delete</Trans>
														</AlertDialogAction>
													</AlertDialogFooter>
												</AlertDialogContent>
											</AlertDialog>
										</div>
									</CardContent>
								</Card>
							</motion.div>
						);
					})}
				</div>
			) : (
				<Card className="border-dashed">
					<CardContent className="flex flex-col items-center justify-center py-12">
						<PaperPlaneTiltIcon className="mb-4 size-12 text-muted-foreground/50" weight="duotone" />
						<h3 className="mb-2 font-semibold">
							<Trans>No deliveries recorded</Trans>
						</h3>
						<p className="text-muted-foreground text-sm">
							<Trans>Your thank you letter deliveries will appear here</Trans>
						</p>
					</CardContent>
				</Card>
			)}
		</section>
	);
}

// ---------------------------------------------------------------------------
// Footer Tips Section
// ---------------------------------------------------------------------------
export function ThankYouFooterTips() {
	return (
		<motion.div className="mt-8" initial={false} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}>
			<Card className="border-primary/30 border-dashed bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5">
				<CardContent className="flex flex-col items-center gap-4 p-6 md:flex-row">
					<div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-primary/20">
						<LightbulbIcon className="size-7 text-primary" weight="fill" />
					</div>
					<div className="flex-1 text-center md:text-left">
						<h3 className="mb-1 font-semibold text-lg">
							<Trans>The importance of the thank you letter</Trans>
						</h3>
						<p className="text-muted-foreground text-sm">
							<Trans>
								A well-written thank you letter can make the difference between two equally qualified candidates. It
								demonstrates your professionalism, motivation, and ability to communicate effectively. Remember to
								personalize each letter based on the specific interview.
							</Trans>
						</p>
					</div>
				</CardContent>
			</Card>
		</motion.div>
	);
}
