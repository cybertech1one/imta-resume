import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import type { Icon } from "@phosphor-icons/react";
import {
	ArrowRightIcon,
	BookOpenIcon,
	CaretRightIcon,
	ChartBarIcon,
	ChatCircleDotsIcon,
	CheckCircleIcon,
	CheckSquareIcon,
	ClockIcon,
	CoinIcon,
	CopyIcon,
	CurrencyCircleDollarIcon,
	FireIcon,
	FlagIcon,
	GiftIcon,
	GlobeIcon,
	GraduationCapIcon,
	HandshakeIcon,
	InfoIcon,
	LightbulbIcon,
	MagnifyingGlassIcon,
	MicrophoneIcon,
	PencilIcon,
	PlayIcon,
	ScalesIcon,
	ShieldCheckIcon,
	SparkleIcon,
	StarIcon,
	TargetIcon,
	TrendUpIcon,
	UsersIcon,
	WarningCircleIcon,
	WarningIcon,
} from "@phosphor-icons/react";
import { Link } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/utils/style";
import {
	benefitCategories,
	employerQuestions,
	experienceLevelTips,
	industryBenchmarks,
	negotiationScripts,
	redFlags,
	rolePlayScenarios,
	successStories,
	timingStrategies,
} from "./negotiation-data";
import type {
	BenefitItem,
	ExperienceLevel,
	IndustryBenchmark,
	NegotiationScript,
	RolePlayScenario,
} from "./negotiation-types";

// Shared currency formatter
const formatCurrency = (amount: number) => `${amount.toLocaleString()} DH`;

// ─── Hero Section ──────────────────────────────────────────────────────────────

export function HeroSection() {
	return (
		<motion.div
			className="relative mb-8 overflow-hidden rounded-3xl border border-primary/20 p-8 md:p-12"
			style={{
				background:
					"linear-gradient(135deg, oklch(0.6 0.15 280 / 0.15) 0%, oklch(0.65 0.18 320 / 0.1) 50%, oklch(0.7 0.12 260 / 0.08) 100%)",
			}}
			initial={false}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.6, ease: "easeOut" }}
		>
			{/* Animated background elements */}
			<div className="pointer-events-none absolute inset-0 overflow-hidden">
				<motion.div
					className="absolute -top-32 -right-32 size-96 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/10 blur-3xl"
					animate={{
						scale: [1, 1.2, 1],
						rotate: [0, 10, 0],
						opacity: [0.5, 0.3, 0.5],
					}}
					transition={{ duration: 10, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
				/>
				<motion.div
					className="absolute -bottom-32 -left-32 size-96 rounded-full bg-gradient-to-tr from-blue-500/15 to-cyan-500/10 blur-3xl"
					animate={{
						scale: [1.2, 1, 1.2],
						rotate: [0, -10, 0],
						opacity: [0.3, 0.5, 0.3],
					}}
					transition={{ duration: 10, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
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
						<Trans>Career Tools</Trans>
					</span>
				</motion.div>

				<motion.h2
					className="mb-4 bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text font-bold text-3xl text-transparent tracking-tight md:text-4xl lg:text-5xl"
					initial={false}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.3 }}
				>
					<Trans>Salary Negotiation Guide</Trans>
				</motion.h2>

				<motion.p
					className="mb-8 max-w-2xl text-lg text-muted-foreground"
					initial={false}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.4 }}
				>
					<Trans>
						Master the art of negotiation with professional scripts, calculation tools, and proven strategies to get the
						compensation you deserve.
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
							<BookOpenIcon className="size-5 text-primary" weight="duotone" />
						</div>
						<div>
							<p className="font-bold text-xl">{negotiationScripts.length}</p>
							<p className="text-muted-foreground text-sm">
								<Trans>Pro Scripts</Trans>
							</p>
						</div>
					</div>
					<div className="flex items-center gap-2">
						<div className="flex size-10 items-center justify-center rounded-full bg-green-500/10">
							<MicrophoneIcon className="size-5 text-green-500" weight="duotone" />
						</div>
						<div>
							<p className="font-bold text-xl">{rolePlayScenarios.length}</p>
							<p className="text-muted-foreground text-sm">
								<Trans>Practice Scenarios</Trans>
							</p>
						</div>
					</div>
					<div className="flex items-center gap-2">
						<div className="flex size-10 items-center justify-center rounded-full bg-amber-500/10">
							<ChartBarIcon className="size-5 text-amber-500" weight="duotone" />
						</div>
						<div>
							<p className="font-bold text-xl">{industryBenchmarks.length}</p>
							<p className="text-muted-foreground text-sm">
								<Trans>Industries</Trans>
							</p>
						</div>
					</div>
				</motion.div>
			</div>
		</motion.div>
	);
}

// ─── Scripts Tab ───────────────────────────────────────────────────────────────

interface ScriptsTabProps {
	selectedScript: NegotiationScript | null;
	setSelectedScript: (script: NegotiationScript | null) => void;
	copiedScript: boolean;
	onCopyScript: (script: string) => void;
}

export function ScriptsTab({ selectedScript, setSelectedScript, copiedScript, onCopyScript }: ScriptsTabProps) {
	return (
		<section>
			<h3 className="mb-2 font-semibold text-2xl">
				<Trans>Professional Negotiation Scripts</Trans>
			</h3>
			<p className="mb-6 text-muted-foreground">
				<Trans>Proven phrase templates for every stage of your negotiation. Customize them to your situation.</Trans>
			</p>

			<div className="grid gap-6 lg:grid-cols-2">
				{/* Script List */}
				<div className="space-y-4">
					{negotiationScripts.map((script, index) => (
						<motion.div
							key={script.id}
							initial={false}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: index * 0.05 }}
						>
							<Card
								className={cn(
									"cursor-pointer transition-all hover:shadow-md",
									selectedScript?.id === script.id && "border-2 border-primary ring-2 ring-primary/20",
								)}
								onClick={() => setSelectedScript(script)}
							>
								<CardContent className="p-4">
									<div className="flex items-start justify-between">
										<div className="flex items-start gap-3">
											<div
												className={cn(
													"flex size-10 shrink-0 items-center justify-center rounded-lg",
													script.stage === "initial" &&
														"bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
													script.stage === "counter" &&
														"bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400",
													script.stage === "final" &&
														"bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400",
												)}
											>
												{script.stage === "initial" && <PlayIcon className="size-5" weight="duotone" />}
												{script.stage === "counter" && <ArrowRightIcon className="size-5" weight="duotone" />}
												{script.stage === "final" && <CheckCircleIcon className="size-5" weight="duotone" />}
											</div>
											<div>
												<h4 className="font-medium">{script.title}</h4>
												<p className="mt-1 text-muted-foreground text-sm">{script.description}</p>
											</div>
										</div>
										<Badge
											variant="outline"
											className={cn(
												"shrink-0",
												script.stage === "initial" && "border-blue-500 text-blue-600",
												script.stage === "counter" && "border-amber-500 text-amber-600",
												script.stage === "final" && "border-green-500 text-green-600",
											)}
										>
											{script.stage === "initial" && <Trans>Initial</Trans>}
											{script.stage === "counter" && <Trans>Counter</Trans>}
											{script.stage === "final" && <Trans>Final</Trans>}
										</Badge>
									</div>
								</CardContent>
							</Card>
						</motion.div>
					))}
				</div>

				{/* Selected Script Detail */}
				<AnimatePresence mode="wait">
					{selectedScript ? (
						<motion.div
							key={selectedScript.id}
							initial={{ opacity: 0, x: 20 }}
							animate={{ opacity: 1, x: 0 }}
							exit={{ opacity: 0, x: -20 }}
							className="space-y-4"
						>
							<Card className="border-2 border-primary/30">
								<CardHeader>
									<CardTitle className="flex items-center gap-2">
										<ChatCircleDotsIcon className="size-5 text-primary" weight="duotone" />
										{selectedScript.title}
									</CardTitle>
									<CardDescription>{selectedScript.description}</CardDescription>
								</CardHeader>
								<CardContent className="space-y-4">
									<div className="relative rounded-lg border bg-muted/50 p-4">
										<p className="whitespace-pre-wrap font-mono text-sm">{selectedScript.script}</p>
										<Button
											size="sm"
											variant="outline"
											className="absolute top-2 right-2 gap-1"
											onClick={() => onCopyScript(selectedScript.script)}
										>
											{copiedScript ? (
												<>
													<CheckCircleIcon className="size-4 text-green-500" />
													<Trans>Copied!</Trans>
												</>
											) : (
												<>
													<CopyIcon className="size-4" />
													<Trans>Copy</Trans>
												</>
											)}
										</Button>
									</div>

									<div>
										<h5 className="mb-2 flex items-center gap-2 font-medium">
											<LightbulbIcon className="size-4 text-amber-500" />
											<Trans>Key Tips</Trans>
										</h5>
										<ul className="space-y-2">
											{selectedScript.tips.map((tip, i) => (
												<li key={i} className="flex items-start gap-2 text-sm">
													<CheckCircleIcon className="mt-0.5 size-4 shrink-0 text-green-500" />
													{tip}
												</li>
											))}
										</ul>
									</div>
								</CardContent>
							</Card>

							<Card className="border-amber-500/30 bg-amber-50/50 dark:bg-amber-950/20">
								<CardContent className="flex items-start gap-3 p-4">
									<PencilIcon className="mt-0.5 size-5 shrink-0 text-amber-600" />
									<div className="text-sm">
										<p className="font-medium text-amber-800 dark:text-amber-300">
											<Trans>Customize this script</Trans>
										</p>
										<p className="text-amber-700 dark:text-amber-400">
											<Trans>
												Replace the elements in [brackets] with your specific information for maximum impact.
											</Trans>
										</p>
									</div>
								</CardContent>
							</Card>
						</motion.div>
					) : (
						<motion.div
							key="placeholder"
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							className="flex h-full flex-col items-center justify-center rounded-xl border-2 border-muted-foreground/30 border-dashed p-8 text-center"
						>
							<BookOpenIcon className="mb-4 size-16 text-muted-foreground/50" weight="duotone" />
							<h3 className="mb-2 font-semibold text-lg">
								<Trans>Select a script</Trans>
							</h3>
							<p className="text-muted-foreground text-sm">
								<Trans>Click a script on the left to see details and copy it</Trans>
							</p>
						</motion.div>
					)}
				</AnimatePresence>
			</div>
		</section>
	);
}

// ─── Calculator Tab ────────────────────────────────────────────────────────────

interface CounterOfferResult {
	recommendedMin: number;
	recommendedMax: number;
	anchor: number;
	increasePercent: number;
	marketComparison: string | null;
}

interface CalculatorTabProps {
	currentSalary: string;
	setCurrentSalary: (v: string) => void;
	desiredSalary: string;
	setDesiredSalary: (v: string) => void;
	marketRate: string;
	setMarketRate: (v: string) => void;
	hasCompetingOffer: boolean;
	setHasCompetingOffer: (v: boolean) => void;
	competingOffer: string;
	setCompetingOffer: (v: string) => void;
	counterOfferCalculation: CounterOfferResult | null;
}

export function CalculatorTab({
	currentSalary,
	setCurrentSalary,
	desiredSalary,
	setDesiredSalary,
	marketRate,
	setMarketRate,
	hasCompetingOffer,
	setHasCompetingOffer,
	competingOffer,
	setCompetingOffer,
	counterOfferCalculation,
}: CalculatorTabProps) {
	return (
		<section>
			<h3 className="mb-2 font-semibold text-2xl">
				<Trans>Counter-Offer Calculator</Trans>
			</h3>
			<p className="mb-6 text-muted-foreground">
				<Trans>Determine your optimal negotiation range based on your situation and the market.</Trans>
			</p>

			<div className="grid gap-8 lg:grid-cols-2">
				{/* Input Form */}
				<Card className="border-2 border-primary/20">
					<CardHeader>
						<CardTitle className="flex items-center gap-2 text-xl">
							<ScalesIcon className="size-5 text-primary" weight="duotone" />
							<Trans>Your Data</Trans>
						</CardTitle>
						<CardDescription>
							<Trans>Enter your information to calculate your strategy</Trans>
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-6">
						<div className="space-y-2">
							<Label>
								<Trans>Current Salary (DH/month)</Trans>
							</Label>
							<Input
								type="number"
								placeholder={t`Ex: 12000`}
								value={currentSalary}
								onChange={(e) => setCurrentSalary(e.target.value)}
							/>
							<p className="text-muted-foreground text-xs">
								<Trans>Optional - to calculate the percentage increase</Trans>
							</p>
						</div>

						<div className="space-y-2">
							<Label>
								<Trans>Desired Salary (DH/month)</Trans>
							</Label>
							<Input
								type="number"
								placeholder={t`Ex: 15000`}
								value={desiredSalary}
								onChange={(e) => setDesiredSalary(e.target.value)}
							/>
						</div>

						<div className="space-y-2">
							<Label>
								<Trans>Market Rate (DH/month)</Trans>
							</Label>
							<Input
								type="number"
								placeholder={t`Ex: 14000`}
								value={marketRate}
								onChange={(e) => setMarketRate(e.target.value)}
							/>
							<p className="text-muted-foreground text-xs">
								<Trans>Check benchmarks for your industry</Trans>
							</p>
						</div>

						<div className="flex items-center justify-between rounded-lg border bg-muted/30 p-4">
							<div className="flex items-center gap-3">
								<TargetIcon className="size-5 text-primary" weight="duotone" />
								<div>
									<Label className="font-medium">
										<Trans>Competing Offer?</Trans>
									</Label>
									<p className="text-muted-foreground text-sm">
										<Trans>Do you have another offer?</Trans>
									</p>
								</div>
							</div>
							<Switch checked={hasCompetingOffer} onCheckedChange={setHasCompetingOffer} />
						</div>

						{hasCompetingOffer && (
							<motion.div
								initial={false}
								animate={{ opacity: 1, height: "auto" }}
								exit={{ opacity: 0, height: 0 }}
								className="space-y-2"
							>
								<Label>
									<Trans>Competing Offer Amount (DH/month)</Trans>
								</Label>
								<Input
									type="number"
									placeholder={t`Ex: 16000`}
									value={competingOffer}
									onChange={(e) => setCompetingOffer(e.target.value)}
								/>
							</motion.div>
						)}
					</CardContent>
				</Card>

				{/* Results */}
				<AnimatePresence mode="wait">
					{counterOfferCalculation ? (
						<motion.div
							key="results"
							initial={{ opacity: 0, x: 20 }}
							animate={{ opacity: 1, x: 0 }}
							exit={{ opacity: 0, x: -20 }}
							className="space-y-6"
						>
							{/* Main Recommendation */}
							<Card className="overflow-hidden border-2 border-green-500/30 bg-gradient-to-br from-green-500/10 to-emerald-500/5">
								<CardHeader className="pb-2">
									<CardTitle className="flex items-center gap-2 text-lg">
										<TargetIcon className="size-5 text-green-600" weight="fill" />
										<Trans>Recommended Strategy</Trans>
									</CardTitle>
								</CardHeader>
								<CardContent className="space-y-4">
									<div className="text-center">
										<p className="text-muted-foreground text-sm">
											<Trans>Start by asking</Trans>
										</p>
										<p className="font-bold text-4xl text-green-600 dark:text-green-400">
											{formatCurrency(counterOfferCalculation.anchor)}
										</p>
										<p className="mt-1 text-muted-foreground text-sm">
											<Trans>(High anchor for negotiation)</Trans>
										</p>
									</div>

									<div className="rounded-lg border bg-card p-4">
										<p className="mb-2 text-muted-foreground text-sm">
											<Trans>Acceptable range</Trans>
										</p>
										<div className="flex items-center justify-between">
											<span className="font-semibold">{formatCurrency(counterOfferCalculation.recommendedMin)}</span>
											<div className="mx-4 h-2 flex-1 rounded-full bg-gradient-to-r from-amber-500 via-green-500 to-green-600" />
											<span className="font-semibold">{formatCurrency(counterOfferCalculation.recommendedMax)}</span>
										</div>
									</div>

									{counterOfferCalculation.increasePercent > 0 && (
										<div className="flex items-center justify-center gap-2">
											<Badge className="gap-1 bg-green-500 text-white">
												<TrendUpIcon className="size-3" />+{counterOfferCalculation.increasePercent}%
											</Badge>
											<span className="text-muted-foreground text-sm">
												<Trans>vs current salary</Trans>
											</span>
										</div>
									)}

									{counterOfferCalculation.marketComparison && (
										<div className="flex items-center justify-center gap-2 text-sm">
											<GlobeIcon className="size-4 text-muted-foreground" />
											<span>
												{Number(counterOfferCalculation.marketComparison) >= 0 ? "+" : ""}
												{counterOfferCalculation.marketComparison}% <Trans>compared to market</Trans>
											</span>
										</div>
									)}
								</CardContent>
							</Card>

							{/* Strategy Tips */}
							<Card>
								<CardHeader className="pb-3">
									<CardTitle className="flex items-center gap-2 text-lg">
										<LightbulbIcon className="size-5 text-amber-500" weight="duotone" />
										<Trans>Negotiation Tactics</Trans>
									</CardTitle>
								</CardHeader>
								<CardContent className="space-y-3">
									{[
										{
											icon: TargetIcon,
											title: "High Anchor",
											text: `Start at ${formatCurrency(counterOfferCalculation.anchor)} to leave room for negotiation`,
										},
										{
											icon: ArrowRightIcon,
											title: "Gradual Concession",
											text: "Never go directly to your minimum",
										},
										{
											icon: HandshakeIcon,
											title: "Win-Win",
											text: "Propose alternatives if salary is blocked",
										},
									].map((tip, i) => (
										<div key={i} className="flex items-start gap-3 rounded-lg border bg-muted/30 p-3">
											<div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
												<tip.icon className="size-4" weight="duotone" />
											</div>
											<div>
												<p className="font-medium text-sm">{tip.title}</p>
												<p className="text-muted-foreground text-xs">{tip.text}</p>
											</div>
										</div>
									))}
								</CardContent>
							</Card>
						</motion.div>
					) : (
						<motion.div
							key="placeholder"
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							className="flex h-full flex-col items-center justify-center rounded-xl border-2 border-muted-foreground/30 border-dashed p-8 text-center"
						>
							<ScalesIcon className="mb-4 size-16 text-muted-foreground/50" weight="duotone" />
							<h3 className="mb-2 font-semibold text-lg">
								<Trans>Enter your desired salary</Trans>
							</h3>
							<p className="text-muted-foreground text-sm">
								<Trans>Fill in the form to see your recommendations</Trans>
							</p>
						</motion.div>
					)}
				</AnimatePresence>
			</div>
		</section>
	);
}

// ─── Checklist Tab ─────────────────────────────────────────────────────────────

interface ChecklistTabProps {
	benefits: BenefitItem[];
	filteredBenefits: BenefitItem[];
	checkedBenefitsCount: number;
	benefitCategory: string;
	setBenefitCategory: (v: string) => void;
	onBenefitToggle: (id: string) => void;
	onResetBenefits: () => void;
}

export function ChecklistTab({
	benefits,
	filteredBenefits,
	checkedBenefitsCount,
	benefitCategory,
	setBenefitCategory,
	onBenefitToggle,
	onResetBenefits,
}: ChecklistTabProps) {
	return (
		<section>
			<div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h3 className="font-semibold text-2xl">
						<Trans>Benefits Checklist</Trans>
					</h3>
					<p className="text-muted-foreground">
						<Trans>Don't leave anything on the table - check what you want to negotiate</Trans>
					</p>
				</div>
				<div className="flex items-center gap-3">
					<Badge variant="outline" className="gap-1">
						<CheckSquareIcon className="size-4" />
						{checkedBenefitsCount} / {benefits.length}
					</Badge>
					<Button variant="outline" size="sm" onClick={onResetBenefits}>
						<Trans>Reset</Trans>
					</Button>
				</div>
			</div>

			{/* Category Filter */}
			<div className="mb-6 flex flex-wrap gap-2">
				{benefitCategories.map((cat) => (
					<Button
						key={cat.id}
						variant={benefitCategory === cat.id ? "default" : "outline"}
						size="sm"
						onClick={() => setBenefitCategory(cat.id)}
					>
						{cat.label}
					</Button>
				))}
			</div>

			{/* Progress */}
			<Card className="mb-6">
				<CardContent className="py-4">
					<div className="flex items-center justify-between text-sm">
						<span className="text-muted-foreground">
							<Trans>Your checklist progress</Trans>
						</span>
						<span className="font-medium">{Math.round((checkedBenefitsCount / benefits.length) * 100)}%</span>
					</div>
					<Progress value={(checkedBenefitsCount / benefits.length) * 100} className="mt-2" />
				</CardContent>
			</Card>

			{/* Benefits Grid */}
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
				{filteredBenefits.map((benefit, index) => (
					<motion.div
						key={benefit.id}
						initial={false}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: index * 0.03 }}
					>
						<Card
							className={cn(
								"cursor-pointer transition-all hover:shadow-md",
								benefit.checked && "border-green-500 bg-green-50/50 dark:bg-green-950/20",
							)}
							onClick={() => onBenefitToggle(benefit.id)}
						>
							<CardContent className="p-4">
								<div className="flex items-start gap-3">
									<div
										className={cn(
											"flex size-8 shrink-0 items-center justify-center rounded-lg transition-colors",
											benefit.checked ? "bg-green-500 text-white" : "border-2 border-muted-foreground/30 bg-muted/50",
										)}
									>
										{benefit.checked && <CheckCircleIcon className="size-5" weight="fill" />}
									</div>
									<div className="flex-1">
										<div className="flex items-start justify-between">
											<h4 className="font-medium">{benefit.name}</h4>
											{benefit.negotiable && (
												<Badge variant="outline" className="shrink-0 text-xs">
													<Trans>Negotiable</Trans>
												</Badge>
											)}
										</div>
										<p className="mt-1 text-muted-foreground text-sm">{benefit.description}</p>
										<p className="mt-2 text-primary text-xs">
											<Trans>Typical value:</Trans> {benefit.typicalValue}
										</p>
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

// ─── RolePlay Tab ──────────────────────────────────────────────────────────────

interface RolePlayTabProps {
	activeScenario: RolePlayScenario | null;
	setActiveScenario: (v: RolePlayScenario | null) => void;
	showIdealResponse: boolean;
	setShowIdealResponse: (v: boolean) => void;
	userResponse: string;
	setUserResponse: (v: string) => void;
	onStartScenario: (scenario: RolePlayScenario) => void;
}

export function RolePlayTab({
	activeScenario,
	setActiveScenario,
	showIdealResponse,
	setShowIdealResponse,
	userResponse,
	setUserResponse,
	onStartScenario,
}: RolePlayTabProps) {
	return (
		<section>
			<h3 className="mb-2 font-semibold text-2xl">
				<Trans>Practice Scenarios</Trans>
			</h3>
			<p className="mb-6 text-muted-foreground">
				<Trans>Practice responding to difficult negotiation situations</Trans>
			</p>

			{!activeScenario ? (
				<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
					{rolePlayScenarios.map((scenario, index) => (
						<motion.div
							key={scenario.id}
							initial={false}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: index * 0.05 }}
						>
							<Card className="h-full cursor-pointer transition-all hover:shadow-lg">
								<CardHeader>
									<div className="flex items-start justify-between">
										<Badge
											variant="outline"
											className={cn(
												scenario.difficulty === "easy" && "border-green-500 text-green-600",
												scenario.difficulty === "medium" && "border-amber-500 text-amber-600",
												scenario.difficulty === "hard" && "border-red-500 text-red-600",
											)}
										>
											{scenario.difficulty === "easy" && <Trans>Easy</Trans>}
											{scenario.difficulty === "medium" && <Trans>Medium</Trans>}
											{scenario.difficulty === "hard" && <Trans>Hard</Trans>}
										</Badge>
									</div>
									<CardTitle className="text-lg">{scenario.title}</CardTitle>
									<CardDescription>{scenario.description}</CardDescription>
								</CardHeader>
								<CardContent>
									<Button className="w-full gap-2" onClick={() => onStartScenario(scenario)}>
										<PlayIcon className="size-4" />
										<Trans>Start</Trans>
									</Button>
								</CardContent>
							</Card>
						</motion.div>
					))}
				</div>
			) : (
				<motion.div initial={false} animate={{ opacity: 1 }} className="space-y-6">
					<Button variant="outline" onClick={() => setActiveScenario(null)} className="gap-2">
						<ArrowRightIcon className="size-4 rotate-180" />
						<Trans>Back to scenarios</Trans>
					</Button>

					<Card className="border-2 border-primary/30">
						<CardHeader>
							<div className="flex items-center gap-2">
								<Badge
									variant="outline"
									className={cn(
										activeScenario.difficulty === "easy" && "border-green-500 text-green-600",
										activeScenario.difficulty === "medium" && "border-amber-500 text-amber-600",
										activeScenario.difficulty === "hard" && "border-red-500 text-red-600",
									)}
								>
									{activeScenario.difficulty === "easy" && <Trans>Easy</Trans>}
									{activeScenario.difficulty === "medium" && <Trans>Medium</Trans>}
									{activeScenario.difficulty === "hard" && <Trans>Hard</Trans>}
								</Badge>
							</div>
							<CardTitle>{activeScenario.title}</CardTitle>
							<CardDescription>{activeScenario.description}</CardDescription>
						</CardHeader>
						<CardContent className="space-y-6">
							{/* Employer Response */}
							<div className="rounded-lg border-2 border-red-500/30 bg-red-50/50 p-4 dark:bg-red-950/20">
								<div className="mb-2 flex items-center gap-2">
									<UsersIcon className="size-5 text-red-600" />
									<span className="font-medium text-red-700 dark:text-red-400">
										<Trans>The employer says:</Trans>
									</span>
								</div>
								<p className="font-medium text-lg">"{activeScenario.employerResponse}"</p>
							</div>

							{/* Your Response */}
							<div className="space-y-2">
								<Label>
									<Trans>Your response:</Trans>
								</Label>
								<Textarea
									placeholder={t`Type your response here...`}
									value={userResponse}
									onChange={(e) => setUserResponse(e.target.value)}
									className="min-h-[120px]"
								/>
							</div>

							{/* Show Ideal Response */}
							<div className="flex gap-4">
								<Button
									variant={showIdealResponse ? "secondary" : "default"}
									onClick={() => setShowIdealResponse(!showIdealResponse)}
									className="gap-2"
								>
									{showIdealResponse ? (
										<>
											<CheckCircleIcon className="size-4" />
											<Trans>Hide ideal answer</Trans>
										</>
									) : (
										<>
											<LightbulbIcon className="size-4" />
											<Trans>Show ideal answer</Trans>
										</>
									)}
								</Button>
							</div>

							{/* Ideal Response */}
							<AnimatePresence>
								{showIdealResponse && (
									<motion.div
										initial={{ opacity: 0, height: 0 }}
										animate={{ opacity: 1, height: "auto" }}
										exit={{ opacity: 0, height: 0 }}
										className="space-y-4"
									>
										<div className="rounded-lg border-2 border-green-500/30 bg-green-50/50 p-4 dark:bg-green-950/20">
											<div className="mb-2 flex items-center gap-2">
												<CheckCircleIcon className="size-5 text-green-600" weight="fill" />
												<span className="font-medium text-green-700 dark:text-green-400">
													<Trans>Ideal answer:</Trans>
												</span>
											</div>
											<p className="text-sm">"{activeScenario.idealResponse}"</p>
										</div>

										<div>
											<h5 className="mb-2 flex items-center gap-2 font-medium">
												<SparkleIcon className="size-4 text-amber-500" weight="fill" />
												<Trans>Key takeaways</Trans>
											</h5>
											<ul className="space-y-2">
												{activeScenario.tips.map((tip, i) => (
													<li key={i} className="flex items-start gap-2 text-sm">
														<CheckCircleIcon className="mt-0.5 size-4 shrink-0 text-green-500" />
														{tip}
													</li>
												))}
											</ul>
										</div>
									</motion.div>
								)}
							</AnimatePresence>
						</CardContent>
					</Card>
				</motion.div>
			)}
		</section>
	);
}

// ─── Benchmarks Tab ────────────────────────────────────────────────────────────

interface BenchmarksTabProps {
	selectedIndustry: IndustryBenchmark | null;
	setSelectedIndustry: (v: IndustryBenchmark | null) => void;
}

export function BenchmarksTab({ selectedIndustry, setSelectedIndustry }: BenchmarksTabProps) {
	return (
		<section>
			<h3 className="mb-2 font-semibold text-2xl">
				<Trans>Salary Benchmarks by Industry</Trans>
			</h3>
			<p className="mb-6 text-muted-foreground">
				<Trans>Typical salary ranges in Morocco to help you calibrate your expectations</Trans>
			</p>

			<div className="grid gap-6 lg:grid-cols-3">
				{/* Industry List */}
				<div className="space-y-3 lg:col-span-1">
					{industryBenchmarks.map((industry, index) => {
						const IndustryIcon = industry.icon;
						return (
							<motion.div
								key={industry.industry}
								initial={false}
								animate={{ opacity: 1, x: 0 }}
								transition={{ delay: index * 0.05 }}
							>
								<Card
									className={cn(
										"cursor-pointer transition-all hover:shadow-md",
										selectedIndustry?.industry === industry.industry && "border-2 border-primary",
									)}
									onClick={() => setSelectedIndustry(industry)}
								>
									<CardContent className="flex items-center gap-3 p-4">
										<div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
											<IndustryIcon className="size-5" weight="duotone" />
										</div>
										<div className="flex-1">
											<h4 className="font-medium">{industry.industry}</h4>
											<div className="flex items-center gap-2">
												<Badge
													variant="outline"
													className={cn(
														"text-xs",
														industry.demandLevel === "high" && "border-green-500 text-green-600",
														industry.demandLevel === "medium" && "border-amber-500 text-amber-600",
														industry.demandLevel === "low" && "border-red-500 text-red-600",
													)}
												>
													{industry.demandLevel === "high" && <Trans>High demand</Trans>}
													{industry.demandLevel === "medium" && <Trans>Medium demand</Trans>}
													{industry.demandLevel === "low" && <Trans>Low demand</Trans>}
												</Badge>
											</div>
										</div>
										<CaretRightIcon className="size-5 text-muted-foreground" />
									</CardContent>
								</Card>
							</motion.div>
						);
					})}
				</div>

				{/* Selected Industry Detail */}
				<div className="lg:col-span-2">
					<AnimatePresence mode="wait">
						{selectedIndustry ? (
							<motion.div
								key={selectedIndustry.industry}
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								exit={{ opacity: 0, y: -20 }}
								className="space-y-6"
							>
								<Card className="border-2 border-primary/30">
									<CardHeader>
										<CardTitle className="flex items-center gap-2">
											<selectedIndustry.icon className="size-5 text-primary" weight="duotone" />
											{selectedIndustry.industry}
										</CardTitle>
										<CardDescription>
											<Trans>Monthly salary ranges in DH</Trans>
										</CardDescription>
									</CardHeader>
									<CardContent className="space-y-6">
										{/* Salary Ranges by Level */}
										{[
											{
												level: "Entry Level",
												range: selectedIndustry.entryRange,
												color: "bg-blue-500",
											},
											{
												level: "Mid-Level",
												range: selectedIndustry.midRange,
												color: "bg-green-500",
											},
											{
												level: "Senior",
												range: selectedIndustry.seniorRange,
												color: "bg-amber-500",
											},
											{
												level: "Executive",
												range: selectedIndustry.executiveRange,
												color: "bg-purple-500",
											},
										].map((item) => (
											<div key={item.level} className="space-y-2">
												<div className="flex items-center justify-between">
													<span className="font-medium">{item.level}</span>
													<span className="text-muted-foreground text-sm">
														{formatCurrency(item.range.min)} - {formatCurrency(item.range.max)}
													</span>
												</div>
												<div className="relative h-3 overflow-hidden rounded-full bg-muted">
													<motion.div
														initial={{ width: 0 }}
														animate={{
															width: `${(item.range.max / selectedIndustry.executiveRange.max) * 100}%`,
														}}
														transition={{ duration: 0.8 }}
														className={cn("h-full rounded-full", item.color)}
													/>
												</div>
											</div>
										))}

										{/* Growth Rate */}
										<div className="flex items-center justify-between rounded-lg border bg-muted/30 p-4">
											<div className="flex items-center gap-3">
												<TrendUpIcon className="size-5 text-green-500" weight="duotone" />
												<span>
													<Trans>Average annual growth</Trans>
												</span>
											</div>
											<Badge className="bg-green-500 text-white">+{selectedIndustry.growthRate}%</Badge>
										</div>
									</CardContent>
								</Card>
							</motion.div>
						) : (
							<motion.div
								key="placeholder"
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								className="flex h-full flex-col items-center justify-center rounded-xl border-2 border-muted-foreground/30 border-dashed p-8 text-center"
							>
								<ChartBarIcon className="mb-4 size-16 text-muted-foreground/50" weight="duotone" />
								<h3 className="mb-2 font-semibold text-lg">
									<Trans>Select an industry</Trans>
								</h3>
								<p className="text-muted-foreground text-sm">
									<Trans>Click an industry to see detailed benchmarks</Trans>
								</p>
							</motion.div>
						)}
					</AnimatePresence>
				</div>
			</div>
		</section>
	);
}

// ─── Tips Tab ──────────────────────────────────────────────────────────────────

interface TipsTabProps {
	experienceLevel: ExperienceLevel;
	setExperienceLevel: (v: ExperienceLevel) => void;
}

export function TipsTab({ experienceLevel, setExperienceLevel }: TipsTabProps) {
	return (
		<section>
			<h3 className="mb-2 font-semibold text-2xl">
				<Trans>Tips by Experience Level</Trans>
			</h3>
			<p className="mb-6 text-muted-foreground">
				<Trans>Negotiation strategies adapted to your career stage</Trans>
			</p>

			{/* Experience Level Selector */}
			<div className="mb-8 flex flex-wrap gap-3">
				{(
					Object.entries(experienceLevelTips) as [ExperienceLevel, (typeof experienceLevelTips)[ExperienceLevel]][]
				).map(([level, config]) => {
					const LevelIcon = config.icon;
					return (
						<Button
							key={level}
							variant={experienceLevel === level ? "default" : "outline"}
							className="gap-2"
							onClick={() => setExperienceLevel(level)}
						>
							<LevelIcon className="size-4" />
							{config.label}
						</Button>
					);
				})}
			</div>

			{/* Selected Level Content */}
			<AnimatePresence mode="wait">
				<motion.div
					key={experienceLevel}
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					exit={{ opacity: 0, y: -20 }}
					className="grid gap-6 lg:grid-cols-3"
				>
					{/* Tips */}
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2 text-lg">
								<LightbulbIcon className="size-5 text-amber-500" weight="duotone" />
								<Trans>Key Tips</Trans>
							</CardTitle>
						</CardHeader>
						<CardContent>
							<ul className="space-y-3">
								{experienceLevelTips[experienceLevel].tips.map((tip, i) => (
									<li key={i} className="flex items-start gap-2 text-sm">
										<CheckCircleIcon className="mt-0.5 size-4 shrink-0 text-green-500" />
										{tip}
									</li>
								))}
							</ul>
						</CardContent>
					</Card>

					{/* Leverage Points */}
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2 text-lg">
								<TargetIcon className="size-5 text-blue-500" weight="duotone" />
								<Trans>Your Strengths</Trans>
							</CardTitle>
						</CardHeader>
						<CardContent>
							<ul className="space-y-3">
								{experienceLevelTips[experienceLevel].leverage.map((item, i) => (
									<li key={i} className="flex items-start gap-2 text-sm">
										<StarIcon className="mt-0.5 size-4 shrink-0 text-amber-500" weight="fill" />
										{item}
									</li>
								))}
							</ul>
						</CardContent>
					</Card>

					{/* Pitfalls to Avoid */}
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2 text-lg">
								<WarningCircleIcon className="size-5 text-red-500" weight="duotone" />
								<Trans>Pitfalls to Avoid</Trans>
							</CardTitle>
						</CardHeader>
						<CardContent>
							<ul className="space-y-3">
								{experienceLevelTips[experienceLevel].pitfalls.map((item, i) => (
									<li key={i} className="flex items-start gap-2 text-sm">
										<WarningIcon className="mt-0.5 size-4 shrink-0 text-red-500" />
										{item}
									</li>
								))}
							</ul>
						</CardContent>
					</Card>
				</motion.div>
			</AnimatePresence>
		</section>
	);
}

// ─── Red Flags Tab ─────────────────────────────────────────────────────────────

export function RedFlagsTab() {
	return (
		<section>
			<h3 className="mb-2 font-semibold text-2xl">
				<Trans>Red Flags to Watch</Trans>
			</h3>
			<p className="mb-6 text-muted-foreground">
				<Trans>Warning signs during a negotiation that deserve your attention</Trans>
			</p>

			<div className="grid gap-4 md:grid-cols-2">
				{redFlags.map((flag, index) => (
					<motion.div key={flag.id} initial={false} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
						<Card
							className={cn(
								"h-full",
								flag.severity === "danger" && "border-red-500/50",
								flag.severity === "warning" && "border-amber-500/50",
							)}
						>
							<CardHeader className="pb-2">
								<div className="flex items-start gap-3">
									<div
										className={cn(
											"flex size-10 shrink-0 items-center justify-center rounded-lg",
											flag.severity === "danger" && "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
											flag.severity === "warning" &&
												"bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400",
										)}
									>
										{flag.severity === "danger" ? (
											<FireIcon className="size-5" weight="fill" />
										) : (
											<WarningCircleIcon className="size-5" weight="fill" />
										)}
									</div>
									<div>
										<CardTitle className="text-base">{flag.title}</CardTitle>
										<Badge
											variant="outline"
											className={cn(
												"mt-1",
												flag.severity === "danger" && "border-red-500 text-red-600",
												flag.severity === "warning" && "border-amber-500 text-amber-600",
											)}
										>
											{flag.severity === "danger" ? <Trans>High alert</Trans> : <Trans>To watch</Trans>}
										</Badge>
									</div>
								</div>
							</CardHeader>
							<CardContent className="space-y-3">
								<p className="text-muted-foreground text-sm">{flag.description}</p>
								<div className="rounded-lg border bg-muted/50 p-3">
									<div className="mb-1 flex items-center gap-1 font-medium text-sm">
										<ShieldCheckIcon className="size-4 text-green-500" />
										<Trans>Recommended action:</Trans>
									</div>
									<p className="text-sm">{flag.action}</p>
								</div>
							</CardContent>
						</Card>
					</motion.div>
				))}
			</div>
		</section>
	);
}

// ─── Questions Tab ─────────────────────────────────────────────────────────────

export function QuestionsTab() {
	return (
		<section>
			<h3 className="mb-2 font-semibold text-2xl">
				<Trans>Questions to Ask Employers</Trans>
			</h3>
			<p className="mb-6 text-muted-foreground">
				<Trans>Strategic questions to get the information you need</Trans>
			</p>

			<Accordion type="multiple" className="space-y-4">
				{["compensation", "benefits", "growth", "expectations", "culture"].map((category) => {
					const categoryQuestions = employerQuestions.filter((q) => q.category === category);
					const categoryLabels: Record<string, { label: string; icon: Icon }> = {
						compensation: { label: "Compensation", icon: CoinIcon },
						benefits: { label: "Benefits", icon: GiftIcon },
						growth: { label: "Growth", icon: TrendUpIcon },
						expectations: { label: "Expectations", icon: TargetIcon },
						culture: { label: "Culture", icon: UsersIcon },
					};
					const CategoryIcon = categoryLabels[category].icon;

					return (
						<AccordionItem key={category} value={category}>
							<Card>
								<AccordionTrigger className="px-6 hover:no-underline">
									<div className="flex items-center gap-3">
										<div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
											<CategoryIcon className="size-5" weight="duotone" />
										</div>
										<div className="text-left">
											<h4 className="font-semibold">{categoryLabels[category].label}</h4>
											<p className="text-muted-foreground text-sm">
												{categoryQuestions.length} <Trans>questions</Trans>
											</p>
										</div>
									</div>
									<CaretRightIcon className="size-5 shrink-0 text-muted-foreground transition-transform duration-200" />
								</AccordionTrigger>
								<AccordionContent>
									<div className="space-y-4 px-6 pb-4">
										{categoryQuestions.map((q, i) => (
											<motion.div
												key={q.id}
												initial={false}
												animate={{ opacity: 1, y: 0 }}
												transition={{ delay: i * 0.05 }}
												className="rounded-lg border bg-muted/30 p-4"
											>
												<p className="mb-2 font-medium">{q.question}</p>
												<div className="mb-2 flex items-center gap-2 text-primary text-sm">
													<MagnifyingGlassIcon className="size-4" />
													<span>
														<Trans>Goal:</Trans> {q.purpose}
													</span>
												</div>
												<div className="flex items-center gap-2 text-muted-foreground text-sm">
													<ClockIcon className="size-4" />
													<span>
														<Trans>When:</Trans> {q.whenToAsk}
													</span>
												</div>
											</motion.div>
										))}
									</div>
								</AccordionContent>
							</Card>
						</AccordionItem>
					);
				})}
			</Accordion>
		</section>
	);
}

// ─── Timing Tab ────────────────────────────────────────────────────────────────

export function TimingTab() {
	return (
		<section>
			<h3 className="mb-2 font-semibold text-2xl">
				<Trans>Timing Strategies</Trans>
			</h3>
			<p className="mb-6 text-muted-foreground">
				<Trans>The right timing can make all the difference in a negotiation</Trans>
			</p>

			<div className="grid gap-6 md:grid-cols-2">
				{timingStrategies.map((strategy, index) => (
					<motion.div
						key={strategy.id}
						initial={false}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: index * 0.05 }}
					>
						<Card className="h-full">
							<CardHeader>
								<CardTitle className="flex items-center gap-2 text-lg">
									<ClockIcon className="size-5 text-primary" weight="duotone" />
									{strategy.title}
								</CardTitle>
								<CardDescription>{strategy.description}</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="rounded-lg border-green-500/30 bg-green-50/50 p-3 dark:bg-green-950/20">
									<div className="mb-1 flex items-center gap-2 font-medium text-green-700 text-sm dark:text-green-400">
										<CheckCircleIcon className="size-4" />
										<Trans>Best timing</Trans>
									</div>
									<p className="text-green-600 text-sm dark:text-green-300">{strategy.bestTime}</p>
								</div>

								<div className="rounded-lg border-red-500/30 bg-red-50/50 p-3 dark:bg-red-950/20">
									<div className="mb-1 flex items-center gap-2 font-medium text-red-700 text-sm dark:text-red-400">
										<WarningIcon className="size-4" />
										<Trans>To avoid</Trans>
									</div>
									<p className="text-red-600 text-sm dark:text-red-300">{strategy.avoidTime}</p>
								</div>

								<ul className="space-y-2">
									{strategy.tips.map((tip, i) => (
										<li key={i} className="flex items-start gap-2 text-sm">
											<LightbulbIcon className="mt-0.5 size-4 shrink-0 text-amber-500" />
											{tip}
										</li>
									))}
								</ul>
							</CardContent>
						</Card>
					</motion.div>
				))}
			</div>
		</section>
	);
}

// ─── Stories Tab ───────────────────────────────────────────────────────────────

export function StoriesTab() {
	return (
		<section>
			<h3 className="mb-2 font-semibold text-2xl">
				<Trans>Success Stories</Trans>
			</h3>
			<p className="mb-6 text-muted-foreground">
				<Trans>Get inspired by these real examples of successful negotiations</Trans>
			</p>

			<div className="grid gap-6 md:grid-cols-2">
				{successStories.map((story, index) => {
					const increasePercent = Math.round(((story.finalOffer - story.originalOffer) / story.originalOffer) * 100);
					return (
						<motion.div
							key={story.id}
							initial={false}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: index * 0.1 }}
						>
							<Card className="h-full overflow-hidden">
								<div className="bg-gradient-to-r from-green-500/20 to-emerald-500/10 p-4">
									<div className="flex items-start justify-between">
										<div className="flex items-center gap-3">
											<div className="flex size-12 items-center justify-center rounded-full bg-white/80 font-bold text-green-600 text-lg shadow-sm dark:bg-gray-800">
												{story.name.charAt(0)}
											</div>
											<div>
												<h4 className="font-semibold">{story.name}</h4>
												<p className="text-muted-foreground text-sm">
													{story.role} - {story.industry}
												</p>
											</div>
										</div>
										<Badge className="gap-1 bg-green-500 text-white">
											<TrendUpIcon className="size-3" />+{increasePercent}%
										</Badge>
									</div>
								</div>

								<CardContent className="space-y-4 pt-4">
									{/* Before/After */}
									<div className="flex items-center justify-around rounded-lg border bg-muted/30 p-3">
										<div className="text-center">
											<p className="text-muted-foreground text-xs">
												<Trans>Initial offer</Trans>
											</p>
											<p className="font-semibold text-lg">{formatCurrency(story.originalOffer)}</p>
										</div>
										<ArrowRightIcon className="size-5 text-green-500" />
										<div className="text-center">
											<p className="text-muted-foreground text-xs">
												<Trans>Final offer</Trans>
											</p>
											<p className="font-bold text-green-600 text-lg">{formatCurrency(story.finalOffer)}</p>
										</div>
									</div>

									{/* Strategy Badge */}
									<div className="flex items-center gap-2">
										<FlagIcon className="size-4 text-primary" />
										<span className="text-sm">
											<Trans>Strategy:</Trans> {story.strategy}
										</span>
									</div>

									{/* Quote */}
									<blockquote className="border-primary/30 border-l-2 pl-4 text-muted-foreground text-sm italic">
										"{story.quote}"
									</blockquote>

									{/* Tips */}
									<div>
										<h5 className="mb-2 flex items-center gap-1 font-medium text-sm">
											<SparkleIcon className="size-4 text-amber-500" />
											<Trans>What worked:</Trans>
										</h5>
										<ul className="space-y-1">
											{story.tips.map((tip, i) => (
												<li key={i} className="flex items-start gap-2 text-sm">
													<CheckCircleIcon className="mt-0.5 size-3 shrink-0 text-green-500" />
													{tip}
												</li>
											))}
										</ul>
									</div>
								</CardContent>
							</Card>
						</motion.div>
					);
				})}
			</div>
		</section>
	);
}

// ─── CTA Section ───────────────────────────────────────────────────────────────

export function CtaSection() {
	return (
		<Card className="mt-8 border-2 border-primary/30 bg-gradient-to-br from-primary/10 to-transparent">
			<CardContent className="flex flex-col items-center py-8 text-center">
				<div className="mb-4 flex size-16 items-center justify-center rounded-full bg-primary/20">
					<CurrencyCircleDollarIcon className="size-8 text-primary" weight="duotone" />
				</div>
				<h3 className="mb-2 font-bold text-2xl">
					<Trans>Calculate Your Market Value</Trans>
				</h3>
				<p className="mb-6 max-w-md text-muted-foreground">
					<Trans>
						Use our salary calculator to get an accurate estimate of your value based on your experience and region.
					</Trans>
				</p>
				{/* biome-ignore lint/suspicious/noExplicitAny: Route path not in generated route tree */}
				<Link to={"/dashboard/tools/salary-calculator" as any}>
					<Button size="lg" className="gap-2">
						<Trans>Salary Calculator</Trans>
						<CaretRightIcon className="size-5" />
					</Button>
				</Link>
			</CardContent>
		</Card>
	);
}

// ─── Disclaimer Section ────────────────────────────────────────────────────────

export function DisclaimerSection() {
	return (
		<Card className="mt-8 border-amber-500/30 bg-amber-50/50 dark:bg-amber-950/20">
			<CardContent className="flex items-start gap-4 p-4">
				<div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
					<InfoIcon className="size-5" weight="fill" />
				</div>
				<div>
					<h4 className="mb-1 font-semibold text-amber-800 dark:text-amber-300">
						<Trans>About this guide</Trans>
					</h4>
					<p className="text-amber-700 text-sm dark:text-amber-400">
						<Trans>
							These tips and scripts are general recommendations. Each negotiation situation is unique. Adapt these
							strategies to your specific context, company culture, and local market. The important thing is to remain
							professional, respectful, and well-prepared.
						</Trans>
					</p>
					<div className="mt-3 flex flex-wrap gap-2">
						{/* biome-ignore lint/suspicious/noExplicitAny: Route path not in generated route tree */}
						<Link to={"/dashboard/interview" as any}>
							<Button variant="outline" size="sm" className="gap-1">
								<MicrophoneIcon className="size-4" />
								<Trans>Interview Preparation</Trans>
							</Button>
						</Link>
						{/* biome-ignore lint/suspicious/noExplicitAny: Route path not in generated route tree */}
						<Link to={"/dashboard/career" as any}>
							<Button variant="outline" size="sm" className="gap-1">
								<GraduationCapIcon className="size-4" />
								<Trans>Career Guidance</Trans>
							</Button>
						</Link>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
