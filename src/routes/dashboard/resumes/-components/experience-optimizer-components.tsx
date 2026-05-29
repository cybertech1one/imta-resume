// =============================================================================
// Experience Optimizer - Extracted Sub-Components
// =============================================================================

import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import {
	ArrowRightIcon,
	ArrowsClockwiseIcon,
	BookOpenIcon,
	CaretDownIcon,
	ChartBarIcon,
	CheckCircleIcon,
	ClipboardTextIcon,
	CopyIcon,
	EyeIcon,
	FactoryIcon,
	GraduationCapIcon,
	HandshakeIcon,
	HeartbeatIcon,
	LightbulbIcon,
	ListBulletsIcon,
	NumberCircleOneIcon,
	NumberCircleThreeIcon,
	NumberCircleTwoIcon,
	PresentationChartIcon,
	RocketLaunchIcon,
	SparkleIcon,
	StarIcon,
	TrendUpIcon,
	UsersIcon,
	WrenchIcon,
} from "@phosphor-icons/react";
import { AnimatePresence, motion, type Variants } from "motion/react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";

import {
	achievementTips,
	actionVerbsByCategory,
	bulletRefinementExamples,
	quantificationSuggestions,
} from "./experience-optimizer-config";
import type {
	ActionVerb,
	BeforeAfterExample,
	Industry,
	IndustryOptimization,
	VerbCategory,
} from "./experience-optimizer-types";

// =============================================================================
// ANIMATION VARIANTS
// =============================================================================

export const containerVariants: Variants = {
	hidden: { opacity: 0 },
	visible: {
		opacity: 1,
		transition: { staggerChildren: 0.1 },
	},
};

export const itemVariants: Variants = {
	hidden: { opacity: 0, y: 20 },
	visible: { opacity: 1, y: 0 },
};

// =============================================================================
// LOADING SKELETON
// =============================================================================

export function LoadingSkeleton() {
	return (
		<div className="space-y-8">
			<Skeleton className="h-48 w-full rounded-3xl" />
			<div className="flex gap-2">
				{[1, 2, 3, 4, 5, 6, 7].map((i) => (
					<Skeleton key={i} className="h-10 w-32 rounded-full" />
				))}
			</div>
			<Skeleton className="h-96 w-full rounded-xl" />
		</div>
	);
}

// =============================================================================
// HERO SECTION
// =============================================================================

interface HeroSectionProps {
	optimizationHistoryLength: number;
}

export function HeroSection({ optimizationHistoryLength }: HeroSectionProps) {
	return (
		<motion.div
			variants={itemVariants}
			className="relative overflow-hidden rounded-3xl border border-primary/20 p-8 md:p-10"
			style={{
				background:
					"linear-gradient(135deg, oklch(0.65 0.18 200 / 0.15) 0%, oklch(0.6 0.2 260 / 0.1) 35%, oklch(0.7 0.15 320 / 0.08) 70%, oklch(0.65 0.12 40 / 0.1) 100%)",
			}}
		>
			<div className="pointer-events-none absolute inset-0 overflow-hidden">
				<motion.div
					className="absolute -top-32 -right-32 size-96 rounded-full bg-gradient-to-br from-blue-500/20 to-indigo-500/10 blur-3xl"
					animate={{
						scale: [1, 1.2, 1],
						rotate: [0, 15, 0],
						opacity: [0.5, 0.3, 0.5],
					}}
					transition={{ duration: 12, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
				/>
				<motion.div
					className="absolute -bottom-32 -left-32 size-96 rounded-full bg-gradient-to-tr from-purple-500/15 to-pink-500/10 blur-3xl"
					animate={{
						scale: [1.2, 1, 1.2],
						rotate: [0, -15, 0],
						opacity: [0.3, 0.5, 0.3],
					}}
					transition={{ duration: 12, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
				/>
			</div>

			<div className="relative z-10">
				<motion.div
					className="mb-3 flex items-center gap-2"
					initial={false}
					animate={{ opacity: 1, x: 0 }}
					transition={{ delay: 0.2 }}
				>
					<SparkleIcon className="size-5 text-primary" weight="fill" />
					<span className="font-semibold text-primary text-sm uppercase tracking-wider">
						<Trans>Professional Optimization</Trans>
					</span>
				</motion.div>

				<motion.h2
					className="mb-4 bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text font-bold text-3xl text-transparent tracking-tight md:text-4xl"
					initial={false}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.3 }}
				>
					<Trans>Transform Your Experience Into Impact</Trans>
				</motion.h2>

				<motion.p
					className="mb-8 max-w-2xl text-lg text-muted-foreground"
					initial={false}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.4 }}
				>
					<Trans>
						Convert your responsibilities into impactful achievements. Use our tools to create powerful bullet points
						that catch recruiters' attention.
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
							<TrendUpIcon className="size-5 text-primary" weight="duotone" />
						</div>
						<div>
							<p className="font-bold text-xl">3x</p>
							<p className="text-muted-foreground text-sm">
								<Trans>More impact</Trans>
							</p>
						</div>
					</div>
					<div className="flex items-center gap-2">
						<div className="flex size-10 items-center justify-center rounded-full bg-green-500/10">
							<ChartBarIcon className="size-5 text-green-500" weight="duotone" />
						</div>
						<div>
							<p className="font-bold text-xl">50+</p>
							<p className="text-muted-foreground text-sm">
								<Trans>Action verbs</Trans>
							</p>
						</div>
					</div>
					<div className="flex items-center gap-2">
						<div className="flex size-10 items-center justify-center rounded-full bg-amber-500/10">
							<StarIcon className="size-5 text-amber-500" weight="duotone" />
						</div>
						<div>
							<p className="font-bold text-xl">7</p>
							<p className="text-muted-foreground text-sm">
								<Trans>Industries</Trans>
							</p>
						</div>
					</div>
					{optimizationHistoryLength > 0 && (
						<div className="flex items-center gap-2">
							<div className="flex size-10 items-center justify-center rounded-full bg-purple-500/10">
								<ClipboardTextIcon className="size-5 text-purple-500" weight="duotone" />
							</div>
							<div>
								<p className="font-bold text-xl">{optimizationHistoryLength}</p>
								<p className="text-muted-foreground text-sm">
									<Trans>Optimisations</Trans>
								</p>
							</div>
						</div>
					)}
				</motion.div>
			</div>
		</motion.div>
	);
}

// =============================================================================
// TAB DEFINITIONS
// =============================================================================

export const TAB_DEFINITIONS = [
	{ value: "impact-generator", icon: SparkleIcon, label: () => t`Impact Generator` },
	{ value: "action-verbs", icon: RocketLaunchIcon, label: () => t`Action Verbs` },
	{ value: "quantification", icon: ChartBarIcon, label: () => t`Quantification` },
	{ value: "refinement", icon: WrenchIcon, label: () => t`Refinement` },
	{ value: "achievements", icon: StarIcon, label: () => t`Tips` },
	{ value: "industry", icon: FactoryIcon, label: () => t`By Industry` },
	{ value: "preview", icon: EyeIcon, label: () => t`Preview` },
] as const;

// =============================================================================
// IMPACT GENERATOR TAB
// =============================================================================

interface ImpactGeneratorTabProps {
	allBeforeAfterExamples: BeforeAfterExample[];
	copyToClipboard: (text: string) => void;
	inputText: string;
	setInputText: (text: string) => void;
	optimizeText: () => void;
	isOptimizing: boolean;
	optimizedText: string;
}

export function ImpactGeneratorTab({
	allBeforeAfterExamples,
	copyToClipboard,
	inputText,
	setInputText,
	optimizeText,
	isOptimizing,
	optimizedText,
}: ImpactGeneratorTabProps) {
	return (
		<motion.div variants={itemVariants}>
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<SparkleIcon className="size-5 text-primary" weight="duotone" />
						<Trans>Impact Statement Generator</Trans>
					</CardTitle>
					<CardDescription>
						<Trans>Transform your job descriptions into impactful achievements with before/after examples</Trans>
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-6">
					{/* Before/After Examples */}
					<div className="space-y-4">
						<h3 className="flex items-center gap-2 font-semibold">
							<ArrowsClockwiseIcon className="size-4 text-primary" />
							<Trans>Transformation Examples</Trans>
						</h3>
						<ScrollArea className="h-96">
							<div className="space-y-4 pr-4">
								{allBeforeAfterExamples.map((example, index) => (
									<motion.div
										key={example.id}
										initial={false}
										animate={{ opacity: 1, y: 0 }}
										transition={{ delay: index * 0.1 }}
									>
										<Card className="overflow-hidden">
											<CardContent className="p-0">
												<div className="grid md:grid-cols-2">
													{/* Before */}
													<div className="border-r border-b bg-red-50/50 p-4 md:border-b-0 dark:bg-red-950/20">
														<div className="mb-2 flex items-center gap-2">
															<Badge className="bg-red-500 text-white">
																<Trans>Before</Trans>
															</Badge>
															<Badge variant="outline" className="capitalize">
																{example.category}
															</Badge>
														</div>
														<p className="text-muted-foreground text-sm">{example.before}</p>
													</div>
													{/* After */}
													<div className="bg-green-50/50 p-4 dark:bg-green-950/20">
														<div className="mb-2 flex items-center gap-2">
															<Badge className="bg-green-500 text-white">
																<Trans>After</Trans>
															</Badge>
															<Button
																variant="ghost"
																size="sm"
																className="ml-auto size-8 p-0"
																onClick={() => copyToClipboard(example.after)}
															>
																<CopyIcon className="size-4" />
															</Button>
														</div>
														<p className="mb-2 font-medium text-green-700 text-sm dark:text-green-400">
															{example.after}
														</p>
														<div className="flex items-center gap-2">
															<LightbulbIcon className="size-4 shrink-0 text-amber-500" weight="fill" />
															<span className="text-muted-foreground text-xs">{example.improvement}</span>
														</div>
													</div>
												</div>
											</CardContent>
										</Card>
									</motion.div>
								))}
							</div>
						</ScrollArea>
					</div>

					<Separator />

					{/* Interactive Optimizer */}
					<div className="grid gap-6 lg:grid-cols-2">
						<div className="space-y-4">
							<Label>
								<Trans>Your text to optimize</Trans>
							</Label>
							<Textarea
								placeholder={t`Enter your job description or responsibility...`}
								className="min-h-32 resize-none"
								value={inputText}
								onChange={(e) => setInputText(e.target.value)}
							/>
							<Button
								className="w-full gap-2"
								size="lg"
								onClick={optimizeText}
								disabled={isOptimizing || !inputText.trim()}
							>
								{isOptimizing ? (
									<>
										<motion.div
											animate={{ rotate: 360 }}
											transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
										>
											<SparkleIcon className="size-5" />
										</motion.div>
										<Trans>Optimizing...</Trans>
									</>
								) : (
									<>
										<SparkleIcon className="size-5" weight="fill" />
										<Trans>Optimize my text</Trans>
									</>
								)}
							</Button>
						</div>

						<div className="space-y-4">
							<div className="flex items-center justify-between">
								<Label>
									<Trans>Optimized result</Trans>
								</Label>
								{optimizedText && (
									<Button variant="ghost" size="sm" className="gap-1" onClick={() => copyToClipboard(optimizedText)}>
										<CopyIcon className="size-4" />
										<Trans>Copy</Trans>
									</Button>
								)}
							</div>
							{optimizedText ? (
								<motion.div
									initial={false}
									animate={{ opacity: 1, y: 0 }}
									className="rounded-lg border-2 border-green-500/30 bg-green-50/50 p-4 dark:bg-green-950/20"
								>
									<p className="font-medium text-green-700 dark:text-green-400">{optimizedText}</p>
								</motion.div>
							) : (
								<div className="flex flex-col items-center justify-center rounded-lg border-2 border-muted border-dashed p-8 text-center">
									<SparkleIcon className="mb-4 size-12 text-muted-foreground/50" weight="duotone" />
									<p className="text-muted-foreground">
										<Trans>Your optimized text will appear here</Trans>
									</p>
								</div>
							)}
						</div>
					</div>
				</CardContent>
			</Card>
		</motion.div>
	);
}

// =============================================================================
// ACTION VERBS TAB
// =============================================================================

interface ActionVerbsTabProps {
	selectedVerbCategory: VerbCategory;
	setSelectedVerbCategory: (category: VerbCategory) => void;
	copyToClipboard: (text: string) => void;
	handleSaveActionVerb: (verb: ActionVerb, category: VerbCategory) => void;
	userActionVerbs: { id: string; verb: string }[];
}

export function ActionVerbsTab({
	selectedVerbCategory,
	setSelectedVerbCategory,
	copyToClipboard,
	handleSaveActionVerb,
	userActionVerbs,
}: ActionVerbsTabProps) {
	return (
		<motion.div variants={itemVariants}>
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<RocketLaunchIcon className="size-5 text-primary" weight="duotone" />
						<Trans>Action Verbs by Category</Trans>
					</CardTitle>
					<CardDescription>
						<Trans>Select a category to discover powerful action verbs with examples</Trans>
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-6">
					{/* Category Selection */}
					<div className="flex flex-wrap gap-3">
						{[
							{ value: "leadership" as VerbCategory, icon: UsersIcon, label: t`Leadership` },
							{ value: "technical" as VerbCategory, icon: WrenchIcon, label: t`Technical` },
							{ value: "communication" as VerbCategory, icon: HandshakeIcon, label: t`Communication` },
						].map((category) => (
							<Button
								key={category.value}
								variant={selectedVerbCategory === category.value ? "default" : "outline"}
								className="gap-2"
								onClick={() => setSelectedVerbCategory(category.value)}
							>
								<category.icon className="size-4" />
								{category.label}
							</Button>
						))}
					</div>

					{/* Verbs Grid */}
					<AnimatePresence mode="wait">
						<motion.div
							key={selectedVerbCategory}
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -20 }}
							className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
						>
							{actionVerbsByCategory[selectedVerbCategory].map((verb, index) => (
								<motion.div
									key={verb.verb}
									initial={{ opacity: 0, scale: 0.95 }}
									animate={{ opacity: 1, scale: 1 }}
									transition={{ delay: index * 0.05 }}
								>
									<Card
										className="group cursor-pointer transition-all hover:border-primary/50 hover:shadow-md"
										onClick={() => copyToClipboard(verb.verb)}
									>
										<CardContent className="p-4">
											<div className="mb-2 flex items-center justify-between">
												<span className="font-bold text-lg text-primary">{verb.verb}</span>
												<div className="flex gap-1">
													<Button
														variant="ghost"
														size="sm"
														className="size-8 p-0 opacity-0 transition-opacity group-hover:opacity-100"
														onClick={(e) => {
															e.stopPropagation();
															handleSaveActionVerb(verb, selectedVerbCategory);
														}}
													>
														<StarIcon className="size-4" />
													</Button>
													<CopyIcon className="size-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
												</div>
											</div>
											<p className="mb-2 text-muted-foreground text-xs">{verb.description}</p>
											<p className="rounded bg-muted/50 p-2 text-xs italic">{verb.example}</p>
										</CardContent>
									</Card>
								</motion.div>
							))}
						</motion.div>
					</AnimatePresence>

					{/* User's Saved Verbs */}
					{userActionVerbs.length > 0 && (
						<div className="mt-8 space-y-4">
							<h3 className="flex items-center gap-2 font-semibold">
								<StarIcon className="size-4 text-amber-500" weight="fill" />
								<Trans>My favorite verbs</Trans>
							</h3>
							<div className="flex flex-wrap gap-2">
								{userActionVerbs.map((verb) => (
									<Badge
										key={verb.id}
										variant="secondary"
										className="cursor-pointer gap-1 px-3 py-1"
										onClick={() => copyToClipboard(verb.verb)}
									>
										{verb.verb}
										<CopyIcon className="size-3" />
									</Badge>
								))}
							</div>
						</div>
					)}
				</CardContent>
			</Card>
		</motion.div>
	);
}

// =============================================================================
// QUANTIFICATION TAB
// =============================================================================

export function QuantificationTab() {
	return (
		<motion.div variants={itemVariants}>
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<ChartBarIcon className="size-5 text-primary" weight="duotone" />
						<Trans>Quantification Help</Trans>
					</CardTitle>
					<CardDescription>
						<Trans>Learn to quantify your achievements with numbers, percentages, and metrics</Trans>
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
						{quantificationSuggestions.map((suggestion, index) => (
							<motion.div
								key={suggestion.metric}
								initial={false}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: index * 0.1 }}
							>
								<Card className="h-full transition-all hover:shadow-md">
									<CardHeader className="pb-2">
										<CardTitle className="flex items-center gap-2 text-base">
											{index === 0 && <NumberCircleOneIcon className="size-5 text-blue-500" weight="fill" />}
											{index === 1 && <NumberCircleTwoIcon className="size-5 text-green-500" weight="fill" />}
											{index === 2 && <NumberCircleThreeIcon className="size-5 text-amber-500" weight="fill" />}
											{index > 2 && <ChartBarIcon className="size-5 text-primary" weight="fill" />}
											{suggestion.metric}
										</CardTitle>
									</CardHeader>
									<CardContent className="space-y-3">
										<div className="rounded-lg bg-muted/50 p-3">
											<p className="font-medium text-sm">{suggestion.example}</p>
										</div>
										<div className="flex items-start gap-2">
											<LightbulbIcon className="mt-0.5 size-4 shrink-0 text-amber-500" weight="fill" />
											<p className="text-muted-foreground text-xs">{suggestion.tip}</p>
										</div>
									</CardContent>
								</Card>
							</motion.div>
						))}
					</div>
				</CardContent>
			</Card>
		</motion.div>
	);
}

// =============================================================================
// REFINEMENT TAB
// =============================================================================

interface RefinementTabProps {
	copyToClipboard: (text: string) => void;
}

export function RefinementTab({ copyToClipboard }: RefinementTabProps) {
	return (
		<motion.div variants={itemVariants}>
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<WrenchIcon className="size-5 text-primary" weight="duotone" />
						<Trans>Bullet Point Refinement</Trans>
					</CardTitle>
					<CardDescription>
						<Trans>Detailed transformation examples with changes explained step by step</Trans>
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="space-y-6">
						{bulletRefinementExamples.map((refinement, index) => (
							<motion.div
								key={index}
								initial={false}
								animate={{ opacity: 1, x: 0 }}
								transition={{ delay: index * 0.15 }}
							>
								<Card>
									<CardContent className="p-6">
										<div className="mb-4 grid gap-4 md:grid-cols-2">
											{/* Original */}
											<div className="space-y-2">
												<Badge variant="outline" className="gap-1">
													<ClipboardTextIcon className="size-3" />
													<Trans>Original</Trans>
												</Badge>
												<p className="rounded-lg bg-muted/50 p-3 text-muted-foreground text-sm">
													{refinement.original}
												</p>
											</div>
											{/* Refined */}
											<div className="space-y-2">
												<div className="flex items-center gap-2">
													<Badge className="gap-1 bg-green-500 text-white">
														<CheckCircleIcon className="size-3" />
														<Trans>Optimized</Trans>
													</Badge>
													<Button
														variant="ghost"
														size="sm"
														className="ml-auto size-8 p-0"
														onClick={() => copyToClipboard(refinement.refined)}
													>
														<CopyIcon className="size-4" />
													</Button>
												</div>
												<p className="rounded-lg bg-green-50 p-3 font-medium text-green-700 text-sm dark:bg-green-950/30 dark:text-green-400">
													{refinement.refined}
												</p>
											</div>
										</div>
										{/* Changes */}
										<div className="space-y-2">
											<h4 className="flex items-center gap-2 font-medium text-sm">
												<ArrowRightIcon className="size-4 text-primary" />
												<Trans>Improvements made:</Trans>
											</h4>
											<div className="flex flex-wrap gap-2">
												{refinement.changes.map((change, i) => (
													<Badge key={i} variant="outline" className="gap-1">
														<CheckCircleIcon className="size-3 text-green-500" />
														{change}
													</Badge>
												))}
											</div>
										</div>
									</CardContent>
								</Card>
							</motion.div>
						))}
					</div>
				</CardContent>
			</Card>
		</motion.div>
	);
}

// =============================================================================
// ACHIEVEMENTS TAB
// =============================================================================

interface AchievementsTabProps {
	expandedTips: string[];
	handleToggleTip: (tipId: string) => void;
}

export function AchievementsTab({ expandedTips, handleToggleTip }: AchievementsTabProps) {
	return (
		<motion.div variants={itemVariants}>
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<StarIcon className="size-5 text-primary" weight="duotone" />
						<Trans>Tips for Highlighting Your Achievements</Trans>
					</CardTitle>
					<CardDescription>
						<Trans>Proven techniques to transform your experiences into remarkable accomplishments</Trans>
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="space-y-4">
						{achievementTips.map((tip, index) => (
							<motion.div
								key={tip.id}
								initial={false}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: index * 0.1 }}
							>
								<Collapsible open={expandedTips.includes(tip.id)}>
									<Card className="overflow-hidden">
										<CollapsibleTrigger className="w-full" onClick={() => handleToggleTip(tip.id)}>
											<CardHeader className="cursor-pointer transition-colors hover:bg-muted/50">
												<div className="flex items-center justify-between">
													<div className="flex items-center gap-3">
														<div className="flex size-8 items-center justify-center rounded-full bg-primary/10">
															<span className="font-bold text-primary text-sm">{index + 1}</span>
														</div>
														<CardTitle className="text-left text-base">{tip.title}</CardTitle>
													</div>
													<motion.div
														animate={{ rotate: expandedTips.includes(tip.id) ? 180 : 0 }}
														transition={{ duration: 0.2 }}
													>
														<CaretDownIcon className="size-5 text-muted-foreground" />
													</motion.div>
												</div>
											</CardHeader>
										</CollapsibleTrigger>
										<CollapsibleContent>
											<CardContent className="border-t pt-4">
												<p className="mb-4 text-muted-foreground">{tip.description}</p>
												<div className="rounded-lg bg-primary/5 p-4">
													<div className="mb-2 flex items-center gap-2">
														<LightbulbIcon className="size-4 text-amber-500" weight="fill" />
														<span className="font-medium text-sm">
															<Trans>Example:</Trans>
														</span>
													</div>
													<p className="text-sm">{tip.example}</p>
												</div>
											</CardContent>
										</CollapsibleContent>
									</Card>
								</Collapsible>
							</motion.div>
						))}
					</div>
				</CardContent>
			</Card>
		</motion.div>
	);
}

// =============================================================================
// INDUSTRY TAB
// =============================================================================

interface IndustryTabProps {
	selectedIndustry: Industry;
	handleIndustryChange: (value: Industry) => void;
	currentIndustry: IndustryOptimization;
	copyToClipboard: (text: string) => void;
	handleSaveKeyword: (keyword: string) => void;
	handleSavePhrase: (phrase: string) => void;
	industryPreference: { favoriteKeywords?: string[] } | null | undefined;
}

export function IndustryTab({
	selectedIndustry,
	handleIndustryChange,
	currentIndustry,
	copyToClipboard,
	handleSaveKeyword,
	handleSavePhrase,
	industryPreference,
}: IndustryTabProps) {
	return (
		<motion.div variants={itemVariants}>
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<FactoryIcon className="size-5 text-primary" weight="duotone" />
						<Trans>Optimization by Industry</Trans>
					</CardTitle>
					<CardDescription>
						<Trans>Keywords, phrases, and tips specific to your industry</Trans>
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-6">
					{/* Industry Selection */}
					<div className="space-y-2">
						<Label>
							<Trans>Select your industry</Trans>
						</Label>
						<Select value={selectedIndustry} onValueChange={(v) => handleIndustryChange(v as Industry)}>
							<SelectTrigger className="w-full md:w-80">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{[
									{ value: "technology", icon: WrenchIcon, label: t`Technology / IT` },
									{ value: "healthcare", icon: HeartbeatIcon, label: t`Healthcare / Medical` },
									{ value: "finance", icon: ChartBarIcon, label: t`Finance / Banking` },
									{ value: "marketing", icon: PresentationChartIcon, label: t`Marketing / Communication` },
									{ value: "engineering", icon: FactoryIcon, label: t`Engineering / Industry` },
									{ value: "education", icon: GraduationCapIcon, label: t`Education / Training` },
									{ value: "general", icon: BookOpenIcon, label: t`General / Multi-sector` },
								].map((industry) => (
									<SelectItem key={industry.value} value={industry.value}>
										<div className="flex items-center gap-2">
											<industry.icon className="size-4" />
											{industry.label}
										</div>
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					<AnimatePresence mode="wait">
						<motion.div
							key={selectedIndustry}
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -20 }}
							className="space-y-6"
						>
							{/* Keywords */}
							<div className="space-y-3">
								<h3 className="flex items-center gap-2 font-semibold">
									<ListBulletsIcon className="size-4 text-primary" />
									<Trans>Industry keywords</Trans>
								</h3>
								<div className="flex flex-wrap gap-2">
									{currentIndustry.keywords.map((keyword) => (
										<Badge
											key={keyword}
											variant="outline"
											className="cursor-pointer transition-all hover:bg-primary/10"
											onClick={() => {
												copyToClipboard(keyword);
												handleSaveKeyword(keyword);
											}}
										>
											{keyword}
										</Badge>
									))}
								</div>
							</div>

							{/* User's Saved Keywords */}
							{industryPreference?.favoriteKeywords && industryPreference.favoriteKeywords.length > 0 && (
								<div className="space-y-3">
									<h3 className="flex items-center gap-2 font-semibold">
										<StarIcon className="size-4 text-amber-500" weight="fill" />
										<Trans>My favorite keywords</Trans>
									</h3>
									<div className="flex flex-wrap gap-2">
										{industryPreference.favoriteKeywords.map((keyword) => (
											<Badge
												key={keyword}
												variant="secondary"
												className="cursor-pointer gap-1"
												onClick={() => copyToClipboard(keyword)}
											>
												{keyword}
												<CopyIcon className="size-3" />
											</Badge>
										))}
									</div>
								</div>
							)}

							{/* Phrases */}
							<div className="space-y-3">
								<h3 className="flex items-center gap-2 font-semibold">
									<SparkleIcon className="size-4 text-primary" />
									<Trans>Key phrases</Trans>
								</h3>
								<div className="grid gap-2 md:grid-cols-2">
									{currentIndustry.phrases.map((phrase, index) => (
										<motion.div
											key={phrase}
											initial={{ opacity: 0, x: -10 }}
											animate={{ opacity: 1, x: 0 }}
											transition={{ delay: index * 0.1 }}
											className="group flex cursor-pointer items-center justify-between rounded-lg border bg-card p-3 transition-all hover:bg-muted/50"
											onClick={() => {
												copyToClipboard(phrase);
												handleSavePhrase(phrase);
											}}
										>
											<span className="text-sm">{phrase}</span>
											<CopyIcon className="size-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
										</motion.div>
									))}
								</div>
							</div>

							{/* Tips */}
							<div className="space-y-3">
								<h3 className="flex items-center gap-2 font-semibold">
									<LightbulbIcon className="size-4 text-amber-500" weight="fill" />
									<Trans>Specific tips</Trans>
								</h3>
								<Card className="border-amber-500/30 bg-amber-50/50 dark:bg-amber-950/20">
									<CardContent className="p-4">
										<ul className="space-y-2">
											{currentIndustry.tips.map((tip, index) => (
												<li key={index} className="flex items-start gap-2">
													<CheckCircleIcon className="mt-0.5 size-4 shrink-0 text-amber-600" weight="fill" />
													<span className="text-amber-800 text-sm dark:text-amber-300">{tip}</span>
												</li>
											))}
										</ul>
									</CardContent>
								</Card>
							</div>
						</motion.div>
					</AnimatePresence>
				</CardContent>
			</Card>
		</motion.div>
	);
}

// =============================================================================
// PREVIEW TAB
// =============================================================================

interface PreviewTabProps {
	allBeforeAfterExamples: BeforeAfterExample[];
	copyToClipboard: (text: string) => void;
}

export function PreviewTab({ allBeforeAfterExamples, copyToClipboard }: PreviewTabProps) {
	return (
		<motion.div variants={itemVariants}>
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<EyeIcon className="size-5 text-primary" weight="duotone" />
						<Trans>Optimized Content Preview</Trans>
					</CardTitle>
					<CardDescription>
						<Trans>View and copy your optimized bullet points</Trans>
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-6">
					{/* Sample Optimized Bullets */}
					<div className="space-y-4">
						<h3 className="flex items-center gap-2 font-semibold">
							<ListBulletsIcon className="size-4 text-primary" />
							<Trans>Optimized Bullet Point Examples</Trans>
						</h3>
						<div className="space-y-3">
							{allBeforeAfterExamples.slice(0, 4).map((example, index) => (
								<motion.div
									key={example.id}
									initial={false}
									animate={{ opacity: 1, x: 0 }}
									transition={{ delay: index * 0.1 }}
									className="group rounded-lg border bg-card p-4 transition-all hover:shadow-md"
								>
									<div className="flex items-start justify-between gap-4">
										<div className="flex-1">
											<div className="mb-2 flex items-center gap-2">
												<Badge variant="outline" className="capitalize">
													{example.category}
												</Badge>
											</div>
											<p className="font-medium text-green-700 dark:text-green-400">{example.after}</p>
										</div>
										<Button
											variant="ghost"
											size="sm"
											className="shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
											onClick={() => copyToClipboard(example.after)}
										>
											<CopyIcon className="size-4" />
										</Button>
									</div>
								</motion.div>
							))}
						</div>
					</div>

					<Separator />

					{/* Copy All Button */}
					<div className="flex flex-col items-center gap-4 rounded-lg border-2 border-primary/30 border-dashed bg-primary/5 p-6">
						<div className="flex size-14 items-center justify-center rounded-full bg-primary/20">
							<ClipboardTextIcon className="size-7 text-primary" weight="duotone" />
						</div>
						<div className="text-center">
							<h3 className="mb-1 font-semibold">
								<Trans>Copy all examples</Trans>
							</h3>
							<p className="mb-4 text-muted-foreground text-sm">
								<Trans>Copy all optimized bullet points to use in your resume</Trans>
							</p>
							<Button
								className="gap-2"
								onClick={() => {
									const allBullets = allBeforeAfterExamples.map((e) => `- ${e.after}`).join("\n");
									copyToClipboard(allBullets);
								}}
							>
								<CopyIcon className="size-4" />
								<Trans>Copy all examples</Trans>
							</Button>
						</div>
					</div>
				</CardContent>
			</Card>
		</motion.div>
	);
}

// =============================================================================
// PRO TIPS SECTION
// =============================================================================

export function ProTipsSection() {
	return (
		<motion.div variants={itemVariants}>
			<Card className="border-primary/30 border-dashed bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5">
				<CardContent className="flex flex-col items-center gap-4 p-6 md:flex-row">
					<div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-primary/20">
						<LightbulbIcon className="size-7 text-primary" weight="fill" />
					</div>
					<div className="flex-1 text-center md:text-left">
						<h3 className="mb-1 font-semibold text-lg">
							<Trans>Pro Tip for Professional Experience</Trans>
						</h3>
						<p className="text-muted-foreground text-sm">
							<Trans>
								The golden rule: every bullet point should start with a powerful action verb and include at least one
								quantifiable metric. Transform your responsibilities into achievements using the CAR method (Challenge,
								Action, Result).
							</Trans>
						</p>
					</div>
				</CardContent>
			</Card>
		</motion.div>
	);
}
