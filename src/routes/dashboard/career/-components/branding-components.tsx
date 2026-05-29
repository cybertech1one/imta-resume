import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import {
	CaretLeftIcon,
	CaretRightIcon,
	CheckCircleIcon,
	CheckIcon,
	CircleIcon,
	ClipboardTextIcon,
	CopyIcon,
	DiamondIcon,
	EyeIcon,
	GlobeIcon,
	ImageIcon,
	InstagramLogoIcon,
	LightbulbIcon,
	LinkedinLogoIcon,
	MegaphoneIcon,
	PaletteIcon,
	PencilSimpleIcon,
	ShareNetworkIcon,
	SparkleIcon,
	StarIcon,
	TrophyIcon,
	TwitterLogoIcon,
	UserCircleIcon,
	XCircleIcon,
} from "@phosphor-icons/react";
import { AnimatePresence, motion } from "motion/react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/utils/style";

import { getBrandWizardSteps } from "./branding-config";
import type { BrandingHookReturn } from "./branding-utils";

// ─── Hero Section ────────────────────────────────────────────────────────────

export function HeroSection({ overallBrandScore }: { overallBrandScore: number }) {
	return (
		<motion.div
			className="relative mb-8 overflow-hidden rounded-3xl border border-primary/20 p-8 md:p-12"
			style={{
				background:
					"linear-gradient(135deg, oklch(0.7 0.15 280 / 0.15) 0%, oklch(0.6 0.2 200 / 0.1) 50%, oklch(0.65 0.18 150 / 0.08) 100%)",
			}}
			initial={false}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.6, ease: "easeOut" }}
		>
			<div className="pointer-events-none absolute inset-0 overflow-hidden">
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
					className="absolute -bottom-32 -left-32 size-96 rounded-full bg-gradient-to-tr from-amber-500/15 to-green-500/10 blur-3xl"
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
					<SparkleIcon className="size-5 text-primary" weight="fill" />
					<span className="font-semibold text-primary text-sm uppercase tracking-wider">
						<Trans>Personal Branding</Trans>
					</span>
				</motion.div>

				<motion.h2
					className="mb-4 bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text font-bold text-3xl text-transparent tracking-tight md:text-4xl lg:text-5xl"
					initial={false}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.3 }}
				>
					<Trans>Build Your Personal Brand</Trans>
				</motion.h2>

				<motion.p
					className="mb-8 max-w-2xl text-lg text-muted-foreground"
					initial={false}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.4 }}
				>
					<Trans>
						Create a unique and memorable professional identity. From your brand statement to your online presence,
						become a reference in your field.
					</Trans>
				</motion.p>

				{/* Brand Audit Score */}
				<motion.div
					className="flex flex-wrap items-center gap-6"
					initial={false}
					animate={{ opacity: 1 }}
					transition={{ delay: 0.5 }}
				>
					<div className="flex items-center gap-4 rounded-2xl border border-primary/20 bg-card/50 p-4 backdrop-blur-sm">
						<div className="flex size-16 items-center justify-center rounded-full bg-primary/10">
							<span className="font-bold text-2xl text-primary">{overallBrandScore}%</span>
						</div>
						<div>
							<p className="font-semibold text-lg">
								<Trans>Brand Score</Trans>
							</p>
							<p className="text-muted-foreground text-sm">
								{overallBrandScore < 30 && <Trans>Beginner - Start building</Trans>}
								{overallBrandScore >= 30 && overallBrandScore < 60 && <Trans>In progress - Keep going!</Trans>}
								{overallBrandScore >= 60 && overallBrandScore < 80 && <Trans>Advanced - Very good!</Trans>}
								{overallBrandScore >= 80 && <Trans>Expert - Excellent brand!</Trans>}
							</p>
						</div>
					</div>
				</motion.div>
			</div>
		</motion.div>
	);
}

// ─── Tab Navigation ──────────────────────────────────────────────────────────

export function BrandingTabsList() {
	return (
		<TabsList className="flex h-auto flex-wrap gap-2 bg-transparent p-0">
			{[
				{ value: "statement", icon: UserCircleIcon, label: t`Statement` },
				{ value: "uvp", icon: DiamondIcon, label: t`Value Proposition` },
				{ value: "visual", icon: PaletteIcon, label: t`Visual Identity` },
				{ value: "voice", icon: MegaphoneIcon, label: t`Voice and Tone` },
				{ value: "social", icon: ShareNetworkIcon, label: t`Social Media` },
				{ value: "website", icon: GlobeIcon, label: t`Website` },
				{ value: "audit", icon: ClipboardTextIcon, label: t`Audit` },
			].map((tab) => (
				<TabsTrigger
					key={tab.value}
					value={tab.value}
					className="gap-2 rounded-full border border-transparent bg-muted/50 px-4 py-2 data-[state=active]:border-primary/30 data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
				>
					<tab.icon className="size-4" />
					<span className="hidden sm:inline">{tab.label}</span>
				</TabsTrigger>
			))}
		</TabsList>
	);
}

// ─── Brand Statement Tab ─────────────────────────────────────────────────────

interface BrandStatementTabProps {
	wizardStep: BrandingHookReturn["wizardStep"];
	brandData: BrandingHookReturn["brandData"];
	generatedStatement: BrandingHookReturn["generatedStatement"];
	isStepValid: BrandingHookReturn["isStepValid"];
	nextStep: BrandingHookReturn["nextStep"];
	prevStep: BrandingHookReturn["prevStep"];
	updateMutation: BrandingHookReturn["updateMutation"];
	copyToClipboard: BrandingHookReturn["copyToClipboard"];
	PROFESSION_EXAMPLES: BrandingHookReturn["PROFESSION_EXAMPLES"];
	AUDIENCE_EXAMPLES: BrandingHookReturn["AUDIENCE_EXAMPLES"];
	STRENGTH_EXAMPLES: BrandingHookReturn["STRENGTH_EXAMPLES"];
	VALUE_EXAMPLES: BrandingHookReturn["VALUE_EXAMPLES"];
	PERSONALITY_TRAITS: BrandingHookReturn["PERSONALITY_TRAITS"];
}

export function BrandStatementTab({
	wizardStep,
	brandData,
	generatedStatement,
	isStepValid,
	nextStep,
	prevStep,
	updateMutation,
	copyToClipboard,
	PROFESSION_EXAMPLES,
	AUDIENCE_EXAMPLES,
	STRENGTH_EXAMPLES,
	VALUE_EXAMPLES,
	PERSONALITY_TRAITS,
}: BrandStatementTabProps) {
	return (
		<TabsContent value="statement" className="space-y-8">
			<Card className="overflow-hidden">
				<CardHeader className="border-b bg-gradient-to-r from-primary/5 to-transparent">
					<CardTitle className="flex items-center gap-2 text-xl">
						<PencilSimpleIcon className="size-5 text-primary" weight="duotone" />
						<Trans>Brand Statement Generator</Trans>
					</CardTitle>
					<CardDescription>
						<Trans>Follow these 5 steps to create your unique personal brand statement</Trans>
					</CardDescription>
				</CardHeader>

				<CardContent className="p-6">
					{/* Progress Steps */}
					<div className="mb-8">
						<div className="mb-4 flex items-center justify-between">
							{getBrandWizardSteps().map((step, index) => {
								const StepIcon = step.icon;
								const isActive = step.id === wizardStep;
								const isCompleted = step.id < wizardStep;

								return (
									<div key={step.id} className="flex flex-1 items-center">
										<motion.div
											className={cn(
												"flex size-10 items-center justify-center rounded-full border-2 transition-all",
												isActive && "border-primary bg-primary text-primary-foreground",
												isCompleted && "border-green-500 bg-green-500 text-white",
												!isActive && !isCompleted && "border-muted bg-muted text-muted-foreground",
											)}
											whileHover={{ scale: 1.1 }}
										>
											{isCompleted ? <CheckIcon className="size-5" /> : <StepIcon className="size-5" />}
										</motion.div>
										{index < getBrandWizardSteps().length - 1 && (
											<div
												className={cn(
													"mx-2 h-1 flex-1 rounded-full transition-all",
													isCompleted ? "bg-green-500" : "bg-muted",
												)}
											/>
										)}
									</div>
								);
							})}
						</div>
						<p className="text-center font-medium">
							<Trans>Step {wizardStep}</Trans>: {getBrandWizardSteps()[wizardStep - 1].title}
						</p>
					</div>

					{/* Wizard Content */}
					<AnimatePresence mode="wait">
						<motion.div
							key={wizardStep}
							initial={{ opacity: 0, x: 20 }}
							animate={{ opacity: 1, x: 0 }}
							exit={{ opacity: 0, x: -20 }}
							transition={{ duration: 0.3 }}
							className="space-y-4"
						>
							{wizardStep === 1 && (
								<div className="space-y-4">
									<Label className="text-lg">
										<Trans>What is your profession or expertise?</Trans>
									</Label>
									<Input
										placeholder={t`E.g.: Full Stack Web Developer`}
										value={brandData.profession}
										onChange={(e) => updateMutation.mutate({ profession: e.target.value })}
										className="text-lg"
									/>
									<div className="flex flex-wrap gap-2">
										<span className="text-muted-foreground text-sm">
											<Trans>Suggestions:</Trans>
										</span>
										{PROFESSION_EXAMPLES.map((ex) => (
											<Badge
												key={ex}
												variant="outline"
												className="cursor-pointer hover:bg-primary/10"
												onClick={() => updateMutation.mutate({ profession: ex })}
											>
												{ex}
											</Badge>
										))}
									</div>
								</div>
							)}

							{wizardStep === 2 && (
								<div className="space-y-4">
									<Label className="text-lg">
										<Trans>Who is your target audience?</Trans>
									</Label>
									<Input
										placeholder={t`E.g.: Growth-stage startups`}
										value={brandData.targetAudience}
										onChange={(e) => updateMutation.mutate({ targetAudience: e.target.value })}
										className="text-lg"
									/>
									<div className="flex flex-wrap gap-2">
										<span className="text-muted-foreground text-sm">
											<Trans>Suggestions:</Trans>
										</span>
										{AUDIENCE_EXAMPLES.map((ex) => (
											<Badge
												key={ex}
												variant="outline"
												className="cursor-pointer hover:bg-primary/10"
												onClick={() => updateMutation.mutate({ targetAudience: ex })}
											>
												{ex}
											</Badge>
										))}
									</div>
								</div>
							)}

							{wizardStep === 3 && (
								<div className="space-y-4">
									<Label className="text-lg">
										<Trans>What is your unique strength?</Trans>
									</Label>
									<Input
										placeholder={t`E.g.: Complex problem solving`}
										value={brandData.uniqueStrength}
										onChange={(e) => updateMutation.mutate({ uniqueStrength: e.target.value })}
										className="text-lg"
									/>
									<div className="flex flex-wrap gap-2">
										<span className="text-muted-foreground text-sm">
											<Trans>Suggestions:</Trans>
										</span>
										{STRENGTH_EXAMPLES.map((ex) => (
											<Badge
												key={ex}
												variant="outline"
												className="cursor-pointer hover:bg-primary/10"
												onClick={() => updateMutation.mutate({ uniqueStrength: ex })}
											>
												{ex}
											</Badge>
										))}
									</div>
								</div>
							)}

							{wizardStep === 4 && (
								<div className="space-y-4">
									<Label className="text-lg">
										<Trans>What value do you bring to your clients?</Trans>
									</Label>
									<Input
										placeholder={t`E.g.: Increase their revenue`}
										value={brandData.valueProvided}
										onChange={(e) => updateMutation.mutate({ valueProvided: e.target.value })}
										className="text-lg"
									/>
									<div className="flex flex-wrap gap-2">
										<span className="text-muted-foreground text-sm">
											<Trans>Suggestions:</Trans>
										</span>
										{VALUE_EXAMPLES.map((ex) => (
											<Badge
												key={ex}
												variant="outline"
												className="cursor-pointer hover:bg-primary/10"
												onClick={() => updateMutation.mutate({ valueProvided: ex })}
											>
												{ex}
											</Badge>
										))}
									</div>
								</div>
							)}

							{wizardStep === 5 && (
								<div className="space-y-4">
									<Label className="text-lg">
										<Trans>What personality trait defines you?</Trans>
									</Label>
									<Select
										value={brandData.personality}
										onValueChange={(value) => updateMutation.mutate({ personality: value })}
									>
										<SelectTrigger className="text-lg">
											<SelectValue placeholder={t`Select a trait`} />
										</SelectTrigger>
										<SelectContent>
											{PERSONALITY_TRAITS.map((trait) => (
												<SelectItem key={trait} value={trait}>
													{trait}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
							)}
						</motion.div>
					</AnimatePresence>
				</CardContent>

				<CardFooter className="flex justify-between border-t bg-muted/30 p-4">
					<Button variant="outline" onClick={prevStep} disabled={wizardStep === 1} className="gap-2">
						<CaretLeftIcon className="size-4" />
						<Trans>Previous</Trans>
					</Button>
					<Button onClick={nextStep} disabled={!isStepValid} className="gap-2">
						{wizardStep === 5 ? <Trans>Generate</Trans> : <Trans>Next</Trans>}
						<CaretRightIcon className="size-4" />
					</Button>
				</CardFooter>
			</Card>

			{/* Generated Statement */}
			{generatedStatement && (
				<motion.div initial={false} animate={{ opacity: 1, y: 0 }}>
					<Card className="border-2 border-green-500/30 bg-gradient-to-br from-green-500/10 to-emerald-500/5">
						<CardHeader>
							<CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-400">
								<TrophyIcon className="size-5" weight="fill" />
								<Trans>Your Brand Statement</Trans>
							</CardTitle>
						</CardHeader>
						<CardContent>
							<blockquote className="border-green-500 border-l-4 pl-4 text-lg italic">{generatedStatement}</blockquote>
						</CardContent>
						<CardFooter>
							<Button variant="outline" className="gap-2" onClick={() => copyToClipboard(generatedStatement)}>
								<CopyIcon className="size-4" />
								<Trans>Copy</Trans>
							</Button>
						</CardFooter>
					</Card>
				</motion.div>
			)}
		</TabsContent>
	);
}

// ─── UVP Tab ─────────────────────────────────────────────────────────────────

interface UVPTabProps {
	uvpData: BrandingHookReturn["uvpData"];
	generatedUVP: BrandingHookReturn["generatedUVP"];
	updateMutation: BrandingHookReturn["updateMutation"];
	copyToClipboard: BrandingHookReturn["copyToClipboard"];
}

export function UVPTab({ uvpData, generatedUVP, updateMutation, copyToClipboard }: UVPTabProps) {
	return (
		<TabsContent value="uvp" className="space-y-8">
			<Card>
				<CardHeader className="border-b bg-gradient-to-r from-amber-500/10 to-transparent">
					<CardTitle className="flex items-center gap-2 text-xl">
						<DiamondIcon className="size-5 text-amber-500" weight="duotone" />
						<Trans>Unique Value Proposition Builder</Trans>
					</CardTitle>
					<CardDescription>
						<Trans>Define what makes you unique and irreplaceable in the market</Trans>
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-6 p-6">
					<div className="grid gap-6 md:grid-cols-2">
						<div className="space-y-2">
							<Label>
								<Trans>For whom? (Problem/Need)</Trans>
							</Label>
							<Textarea
								placeholder={t`E.g.: Companies struggling with their digital transformation`}
								value={uvpData.problem}
								onChange={(e) => updateMutation.mutate({ uvpProblem: e.target.value })}
								rows={3}
							/>
						</div>
						<div className="space-y-2">
							<Label>
								<Trans>Your Solution</Trans>
							</Label>
							<Textarea
								placeholder={t`E.g.: Personalized and pragmatic coaching`}
								value={uvpData.solution}
								onChange={(e) => updateMutation.mutate({ uvpSolution: e.target.value })}
								rows={3}
							/>
						</div>
						<div className="space-y-2">
							<Label>
								<Trans>Main Benefit</Trans>
							</Label>
							<Textarea
								placeholder={t`E.g.: Reduce operational costs by 30%`}
								value={uvpData.benefit}
								onChange={(e) => updateMutation.mutate({ uvpBenefit: e.target.value })}
								rows={3}
							/>
						</div>
						<div className="space-y-2">
							<Label>
								<Trans>What sets you apart</Trans>
							</Label>
							<Textarea
								placeholder={t`E.g.: My 10 years of hands-on industry experience`}
								value={uvpData.differentiator}
								onChange={(e) => updateMutation.mutate({ uvpDifferentiator: e.target.value })}
								rows={3}
							/>
						</div>
					</div>

					{generatedUVP && (
						<motion.div
							initial={false}
							animate={{ opacity: 1, y: 0 }}
							className="rounded-xl border-2 border-amber-500/30 bg-amber-500/10 p-6"
						>
							<h4 className="mb-3 flex items-center gap-2 font-semibold text-amber-700 dark:text-amber-400">
								<StarIcon className="size-5" weight="fill" />
								<Trans>Your Unique Value Proposition</Trans>
							</h4>
							<p className="text-lg">{generatedUVP}</p>
							<Button variant="outline" className="mt-4 gap-2" onClick={() => copyToClipboard(generatedUVP)}>
								<CopyIcon className="size-4" />
								<Trans>Copy</Trans>
							</Button>
						</motion.div>
					)}
				</CardContent>
			</Card>
		</TabsContent>
	);
}

// ─── Visual Identity Tab ─────────────────────────────────────────────────────

interface VisualIdentityTabProps {
	LOGO_CONCEPTS: BrandingHookReturn["LOGO_CONCEPTS"];
	COLOR_PALETTES: BrandingHookReturn["COLOR_PALETTES"];
	selectedLogo: BrandingHookReturn["selectedLogo"];
	selectedPalette: BrandingHookReturn["selectedPalette"];
	updateMutation: BrandingHookReturn["updateMutation"];
}

export function VisualIdentityTab({
	LOGO_CONCEPTS,
	COLOR_PALETTES,
	selectedLogo,
	selectedPalette,
	updateMutation,
}: VisualIdentityTabProps) {
	return (
		<TabsContent value="visual" className="space-y-8">
			{/* Logo Concepts */}
			<Card>
				<CardHeader className="border-b bg-gradient-to-r from-purple-500/10 to-transparent">
					<CardTitle className="flex items-center gap-2 text-xl">
						<ImageIcon className="size-5 text-purple-500" weight="duotone" />
						<Trans>Personal Logo Concepts</Trans>
					</CardTitle>
					<CardDescription>
						<Trans>Choose a logo style that represents your professional identity</Trans>
					</CardDescription>
				</CardHeader>
				<CardContent className="p-6">
					<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
						{LOGO_CONCEPTS.map((concept, index) => (
							<motion.div
								key={concept.id}
								initial={false}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: index * 0.1 }}
							>
								<Card
									className={cn(
										"cursor-pointer transition-all hover:-translate-y-1 hover:shadow-lg",
										selectedLogo === concept.id && "border-2 border-primary ring-2 ring-primary/20",
									)}
									onClick={() => updateMutation.mutate({ selectedLogo: concept.id })}
								>
									<CardContent className="p-4">
										<div
											className="mx-auto mb-4 flex size-20 items-center justify-center rounded-2xl"
											style={{
												background: `linear-gradient(135deg, ${concept.colors[0]}, ${concept.colors[1]})`,
											}}
										>
											<span className="font-bold text-2xl text-white">
												{concept.symbolType === "initiales" ? "AB" : concept.symbolType === "typographie" ? "Nom" : ""}
											</span>
											{concept.symbolType === "geometrique" && (
												<div className="size-10 rotate-45 rounded-lg border-4 border-white" />
											)}
											{concept.symbolType === "iconique" && <StarIcon className="size-10 text-white" weight="fill" />}
											{concept.symbolType === "embleme" && (
												<div className="flex size-12 items-center justify-center rounded-full border-4 border-white">
													<DiamondIcon className="size-6 text-white" weight="fill" />
												</div>
											)}
										</div>
										<h4 className="mb-1 text-center font-semibold">{concept.name}</h4>
										<p className="text-center text-muted-foreground text-sm">{concept.description}</p>
										<div className="mt-3 flex justify-center gap-2">
											<Badge variant="outline">{concept.style}</Badge>
										</div>
										{selectedLogo === concept.id && (
											<div className="mt-3 flex justify-center">
												<Badge className="bg-primary">
													<CheckCircleIcon className="mr-1 size-3" />
													<Trans>Selected</Trans>
												</Badge>
											</div>
										)}
									</CardContent>
								</Card>
							</motion.div>
						))}
					</div>
				</CardContent>
			</Card>

			{/* Color Palettes */}
			<Card>
				<CardHeader className="border-b bg-gradient-to-r from-pink-500/10 to-transparent">
					<CardTitle className="flex items-center gap-2 text-xl">
						<PaletteIcon className="size-5 text-pink-500" weight="duotone" />
						<Trans>Color Palettes</Trans>
					</CardTitle>
					<CardDescription>
						<Trans>Select a palette that matches your professional personality</Trans>
					</CardDescription>
				</CardHeader>
				<CardContent className="p-6">
					<div className="grid gap-6 lg:grid-cols-2">
						{COLOR_PALETTES.map((palette, index) => (
							<motion.div
								key={palette.id}
								initial={false}
								animate={{ opacity: 1, scale: 1 }}
								transition={{ delay: index * 0.1 }}
							>
								<Card
									className={cn(
										"cursor-pointer transition-all hover:shadow-lg",
										selectedPalette === palette.id && "border-2 border-primary ring-2 ring-primary/20",
									)}
									onClick={() => updateMutation.mutate({ selectedPalette: palette.id })}
								>
									<CardContent className="p-4">
										<div className="mb-4 flex items-start justify-between">
											<div>
												<h4 className="font-semibold">{palette.name}</h4>
												<p className="text-muted-foreground text-sm">{palette.description}</p>
											</div>
											{selectedPalette === palette.id && (
												<Badge className="bg-primary">
													<CheckCircleIcon className="mr-1 size-3" />
												</Badge>
											)}
										</div>

										{/* Color Swatches */}
										<div className="mb-4 flex gap-2">
											{palette.colors.map((color) => (
												<div key={color.name} className="flex-1">
													<div
														className="mb-1 h-12 w-full rounded-lg shadow-inner"
														style={{ backgroundColor: color.hex }}
														title={`${color.name}: ${color.hex}`}
													/>
													<p className="text-center text-muted-foreground text-xs">{color.name}</p>
												</div>
											))}
										</div>

										{/* Preview Card */}
										<div
											className="mb-3 rounded-lg p-4"
											style={{ backgroundColor: palette.colors[2]?.hex || "#f4f4f5" }}
										>
											<h5 className="mb-1 font-semibold" style={{ color: palette.colors[0]?.hex }}>
												<Trans>Style Preview</Trans>
											</h5>
											<p className="text-sm" style={{ color: palette.colors[3]?.hex }}>
												<Trans>Sample text with this palette</Trans>
											</p>
											<button
												type="button"
												className="mt-2 rounded-md px-3 py-1 text-sm text-white"
												style={{ backgroundColor: palette.colors[1]?.hex }}
											>
												<Trans>Button</Trans>
											</button>
										</div>

										<div className="flex flex-wrap gap-1">
											<Badge variant="outline" className="text-xs">
												{palette.mood}
											</Badge>
											{palette.industries.map((industry) => (
												<Badge key={industry} variant="secondary" className="text-xs">
													{industry}
												</Badge>
											))}
										</div>
									</CardContent>
								</Card>
							</motion.div>
						))}
					</div>
				</CardContent>
			</Card>
		</TabsContent>
	);
}

// ─── Voice & Tone Tab ────────────────────────────────────────────────────────

interface VoiceToneTabProps {
	VOICE_TONES: BrandingHookReturn["VOICE_TONES"];
	selectedVoice: BrandingHookReturn["selectedVoice"];
	updateMutation: BrandingHookReturn["updateMutation"];
}

export function VoiceToneTab({ VOICE_TONES, selectedVoice, updateMutation }: VoiceToneTabProps) {
	return (
		<TabsContent value="voice" className="space-y-8">
			<Card>
				<CardHeader className="border-b bg-gradient-to-r from-cyan-500/10 to-transparent">
					<CardTitle className="flex items-center gap-2 text-xl">
						<MegaphoneIcon className="size-5 text-cyan-500" weight="duotone" />
						<Trans>Voice and Tone Guide</Trans>
					</CardTitle>
					<CardDescription>
						<Trans>Define how you communicate with your audience</Trans>
					</CardDescription>
				</CardHeader>
				<CardContent className="p-6">
					<div className="grid gap-6 lg:grid-cols-2">
						{VOICE_TONES.map((voice, index) => (
							<motion.div
								key={voice.id}
								initial={false}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: index * 0.1 }}
							>
								<Card
									className={cn(
										"h-full cursor-pointer transition-all hover:shadow-lg",
										selectedVoice === voice.id && "border-2 border-primary ring-2 ring-primary/20",
									)}
									onClick={() => updateMutation.mutate({ selectedVoice: voice.id })}
								>
									<CardContent className="p-5">
										<div className="mb-4 flex items-start justify-between">
											<div>
												<h4 className="font-bold text-lg">{voice.name}</h4>
												<p className="text-muted-foreground text-sm">{voice.description}</p>
											</div>
											{selectedVoice === voice.id && (
												<Badge className="bg-primary">
													<CheckCircleIcon className="mr-1 size-3" />
												</Badge>
											)}
										</div>

										{/* Characteristics */}
										<div className="mb-4 flex flex-wrap gap-2">
											{voice.characteristics.map((char) => (
												<Badge key={char} variant="outline">
													{char}
												</Badge>
											))}
										</div>

										{/* Examples */}
										<div className="space-y-3 rounded-lg bg-muted/50 p-4">
											<div>
												<p className="mb-1 font-medium text-muted-foreground text-xs uppercase tracking-wider">
													<Trans>Headline example:</Trans>
												</p>
												<p className="font-medium italic">"{voice.examples.headline}"</p>
											</div>
											<div>
												<p className="mb-1 font-medium text-muted-foreground text-xs uppercase tracking-wider">
													<Trans>Bio example:</Trans>
												</p>
												<p className="text-sm italic">"{voice.examples.bio}"</p>
											</div>
										</div>

										{/* Best For */}
										<div className="mt-4">
											<p className="mb-2 text-muted-foreground text-sm">
												<Trans>Ideal for:</Trans>
											</p>
											<div className="flex flex-wrap gap-1">
												{voice.bestFor.map((industry) => (
													<Badge key={industry} variant="secondary" className="text-xs">
														{industry}
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
		</TabsContent>
	);
}

// ─── Social Media Tab ────────────────────────────────────────────────────────

interface SocialMediaTabProps {
	SOCIAL_MEDIA_CHECKLIST: BrandingHookReturn["SOCIAL_MEDIA_CHECKLIST"];
	socialChecked: BrandingHookReturn["socialChecked"];
	socialScore: BrandingHookReturn["socialScore"];
	toggleSocialMutation: BrandingHookReturn["toggleSocialMutation"];
}

export function SocialMediaTab({
	SOCIAL_MEDIA_CHECKLIST,
	socialChecked,
	socialScore,
	toggleSocialMutation,
}: SocialMediaTabProps) {
	return (
		<TabsContent value="social" className="space-y-8">
			<Card>
				<CardHeader className="border-b bg-gradient-to-r from-blue-500/10 to-transparent">
					<CardTitle className="flex items-center gap-2 text-xl">
						<ShareNetworkIcon className="size-5 text-blue-500" weight="duotone" />
						<Trans>Social Media Checklist</Trans>
					</CardTitle>
					<CardDescription className="flex items-center justify-between">
						<span>
							<Trans>Ensure brand consistency across all platforms</Trans>
						</span>
						<Badge variant={socialScore >= 80 ? "default" : "secondary"} className="text-lg">
							{socialScore}%
						</Badge>
					</CardDescription>
				</CardHeader>
				<CardContent className="p-6">
					<Progress value={socialScore} className="mb-6 h-3" />

					{/* Group by category */}
					{["LinkedIn", "Twitter/X", "Instagram", "General"].map((category) => (
						<div key={category} className="mb-6">
							<h4 className="mb-3 flex items-center gap-2 font-semibold text-lg">
								{category === "LinkedIn" && <LinkedinLogoIcon className="size-5 text-[#0077B5]" />}
								{category === "Twitter/X" && <TwitterLogoIcon className="size-5 text-[#1DA1F2]" />}
								{category === "Instagram" && <InstagramLogoIcon className="size-5 text-[#E4405F]" />}
								{category === "General" && <GlobeIcon className="size-5 text-muted-foreground" />}
								{category}
							</h4>
							<div className="space-y-3">
								{SOCIAL_MEDIA_CHECKLIST.filter((item) => item.category === category).map((item) => (
									<motion.div
										key={item.id}
										className={cn(
											"flex items-start gap-3 rounded-lg border p-4 transition-all",
											socialChecked[item.id] && "border-green-500/50 bg-green-500/5",
										)}
										whileHover={{ scale: 1.01 }}
									>
										<button
											type="button"
											onClick={() => toggleSocialMutation.mutate({ itemId: item.id })}
											className={cn(
												"flex size-6 shrink-0 items-center justify-center rounded-full border-2 transition-all",
												socialChecked[item.id]
													? "border-green-500 bg-green-500 text-white"
													: "border-muted-foreground/30",
											)}
										>
											{socialChecked[item.id] && <CheckIcon className="size-4" />}
										</button>
										<div className="flex-1">
											<div className="flex items-center gap-2">
												<span className={cn("font-medium", socialChecked[item.id] && "line-through opacity-60")}>
													{item.label}
												</span>
												<Badge
													variant="outline"
													className={cn(
														"text-xs",
														item.importance === "critical" && "border-red-500 text-red-500",
														item.importance === "important" && "border-amber-500 text-amber-500",
														item.importance === "nice-to-have" && "border-blue-500 text-blue-500",
													)}
												>
													{item.importance === "critical" && <Trans>Critical</Trans>}
													{item.importance === "important" && <Trans>Important</Trans>}
													{item.importance === "nice-to-have" && <Trans>Bonus</Trans>}
												</Badge>
											</div>
											<p className="text-muted-foreground text-sm">{item.description}</p>
										</div>
									</motion.div>
								))}
							</div>
						</div>
					))}
				</CardContent>
			</Card>
		</TabsContent>
	);
}

// ─── Website Tab ─────────────────────────────────────────────────────────────

interface WebsiteTabProps {
	WEBSITE_CHECKLIST: BrandingHookReturn["WEBSITE_CHECKLIST"];
	websiteChecked: BrandingHookReturn["websiteChecked"];
	websiteScore: BrandingHookReturn["websiteScore"];
	toggleWebsiteMutation: BrandingHookReturn["toggleWebsiteMutation"];
}

export function WebsiteTab({
	WEBSITE_CHECKLIST,
	websiteChecked,
	websiteScore,
	toggleWebsiteMutation,
}: WebsiteTabProps) {
	return (
		<TabsContent value="website" className="space-y-8">
			<Card>
				<CardHeader className="border-b bg-gradient-to-r from-green-500/10 to-transparent">
					<CardTitle className="flex items-center gap-2 text-xl">
						<GlobeIcon className="size-5 text-green-500" weight="duotone" />
						<Trans>Personal Website Checklist</Trans>
					</CardTitle>
					<CardDescription className="flex items-center justify-between">
						<span>
							<Trans>Essential elements for an effective professional website</Trans>
						</span>
						<Badge variant={websiteScore >= 80 ? "default" : "secondary"} className="text-lg">
							{websiteScore}%
						</Badge>
					</CardDescription>
				</CardHeader>
				<CardContent className="p-6">
					<Progress value={websiteScore} className="mb-6 h-3" />

					{/* Group by category */}
					{[t`Home Page`, t`About`, t`Portfolio`, t`Testimonials`, t`Contact`, t`Technical`, "SEO"].map((category) => {
						const items = WEBSITE_CHECKLIST.filter((item) => item.category === category);
						if (items.length === 0) return null;

						return (
							<div key={category} className="mb-6">
								<h4 className="mb-3 font-semibold text-lg">{category}</h4>
								<div className="space-y-3">
									{items.map((item) => (
										<motion.div
											key={item.id}
											className={cn(
												"flex items-start gap-3 rounded-lg border p-4 transition-all",
												websiteChecked[item.id] && "border-green-500/50 bg-green-500/5",
											)}
											whileHover={{ scale: 1.01 }}
										>
											<button
												type="button"
												onClick={() => toggleWebsiteMutation.mutate({ itemId: item.id })}
												className={cn(
													"flex size-6 shrink-0 items-center justify-center rounded-full border-2 transition-all",
													websiteChecked[item.id]
														? "border-green-500 bg-green-500 text-white"
														: "border-muted-foreground/30",
												)}
											>
												{websiteChecked[item.id] && <CheckIcon className="size-4" />}
											</button>
											<div className="flex-1">
												<div className="flex items-center gap-2">
													<span className={cn("font-medium", websiteChecked[item.id] && "line-through opacity-60")}>
														{item.label}
													</span>
													<Badge
														variant="outline"
														className={cn(
															"text-xs",
															item.importance === "critical" && "border-red-500 text-red-500",
															item.importance === "important" && "border-amber-500 text-amber-500",
															item.importance === "nice-to-have" && "border-blue-500 text-blue-500",
														)}
													>
														{item.importance === "critical" && <Trans>Critical</Trans>}
														{item.importance === "important" && <Trans>Important</Trans>}
														{item.importance === "nice-to-have" && <Trans>Bonus</Trans>}
													</Badge>
												</div>
												<p className="text-muted-foreground text-sm">{item.description}</p>
											</div>
										</motion.div>
									))}
								</div>
							</div>
						);
					})}
				</CardContent>
			</Card>
		</TabsContent>
	);
}

// ─── Audit Tab ───────────────────────────────────────────────────────────────

interface AuditTabProps {
	overallBrandScore: BrandingHookReturn["overallBrandScore"];
	generatedStatement: BrandingHookReturn["generatedStatement"];
	generatedUVP: BrandingHookReturn["generatedUVP"];
	selectedLogo: BrandingHookReturn["selectedLogo"];
	selectedPalette: BrandingHookReturn["selectedPalette"];
	selectedVoice: BrandingHookReturn["selectedVoice"];
	socialScore: BrandingHookReturn["socialScore"];
	websiteScore: BrandingHookReturn["websiteScore"];
}

export function AuditTab({
	overallBrandScore,
	generatedStatement,
	generatedUVP,
	selectedLogo,
	selectedPalette,
	selectedVoice,
	socialScore,
	websiteScore,
}: AuditTabProps) {
	return (
		<TabsContent value="audit" className="space-y-8">
			<Card className="overflow-hidden">
				<CardHeader className="border-b bg-gradient-to-r from-primary/10 to-transparent">
					<CardTitle className="flex items-center gap-2 text-xl">
						<ClipboardTextIcon className="size-5 text-primary" weight="duotone" />
						<Trans>Personal Brand Audit</Trans>
					</CardTitle>
					<CardDescription>
						<Trans>Evaluate the strength and consistency of your personal brand</Trans>
					</CardDescription>
				</CardHeader>
				<CardContent className="p-6">
					{/* Overall Score */}
					<div className="mb-8 flex flex-col items-center justify-center rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 p-8">
						<div className="mb-4 flex size-32 items-center justify-center rounded-full border-8 border-primary/20 bg-card">
							<span className="font-bold text-4xl text-primary">{overallBrandScore}%</span>
						</div>
						<h3 className="mb-2 font-bold text-2xl">
							{overallBrandScore < 30 && <Trans>Beginner</Trans>}
							{overallBrandScore >= 30 && overallBrandScore < 60 && <Trans>In Progress</Trans>}
							{overallBrandScore >= 60 && overallBrandScore < 80 && <Trans>Advanced</Trans>}
							{overallBrandScore >= 80 && <Trans>Expert</Trans>}
						</h3>
						<p className="max-w-md text-center text-muted-foreground">
							{overallBrandScore < 30 && (
								<Trans>You are starting your personal branding journey. Complete the sections above!</Trans>
							)}
							{overallBrandScore >= 30 && overallBrandScore < 60 && (
								<Trans>Good start! Keep developing your brand for more impact.</Trans>
							)}
							{overallBrandScore >= 60 && overallBrandScore < 80 && (
								<Trans>Excellent progress! Your brand is taking shape and becoming consistent.</Trans>
							)}
							{overallBrandScore >= 80 && (
								<Trans>Congratulations! Your personal brand is solid and well-defined.</Trans>
							)}
						</p>
					</div>

					{/* Score Breakdown */}
					<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
						{[
							{
								label: t`Brand Statement`,
								score: generatedStatement ? 100 : 0,
								max: 25,
								icon: UserCircleIcon,
							},
							{
								label: t`Value Proposition`,
								score: generatedUVP ? 100 : 0,
								max: 20,
								icon: DiamondIcon,
							},
							{
								label: t`Logo Concept`,
								score: selectedLogo ? 100 : 0,
								max: 15,
								icon: ImageIcon,
							},
							{
								label: t`Color Palette`,
								score: selectedPalette ? 100 : 0,
								max: 15,
								icon: PaletteIcon,
							},
							{
								label: t`Voice and Tone`,
								score: selectedVoice ? 100 : 0,
								max: 10,
								icon: MegaphoneIcon,
							},
							{
								label: t`Social Media`,
								score: socialScore,
								max: 10,
								icon: ShareNetworkIcon,
							},
							{
								label: t`Website`,
								score: websiteScore,
								max: 5,
								icon: GlobeIcon,
							},
						].map((item) => {
							const ItemIcon = item.icon;
							const isComplete = item.score === 100;

							return (
								<Card key={item.label} className={cn("transition-all", isComplete && "border-green-500/50")}>
									<CardContent className="p-4">
										<div className="mb-3 flex items-center justify-between">
											<div className="flex items-center gap-2">
												<ItemIcon className="size-5 text-muted-foreground" />
												<span className="font-medium">{item.label}</span>
											</div>
											{isComplete ? (
												<CheckCircleIcon className="size-5 text-green-500" weight="fill" />
											) : (
												<CircleIcon className="size-5 text-muted-foreground" />
											)}
										</div>
										<Progress value={item.score} className="h-2" />
										<div className="mt-2 flex justify-between text-sm">
											<span className="text-muted-foreground">{item.max} pts max</span>
											<span className={cn("font-medium", isComplete ? "text-green-500" : "text-muted-foreground")}>
												{Math.round((item.score / 100) * item.max)} pts
											</span>
										</div>
									</CardContent>
								</Card>
							);
						})}
					</div>

					{/* Recommendations */}
					<AuditRecommendations
						generatedStatement={generatedStatement}
						generatedUVP={generatedUVP}
						selectedLogo={selectedLogo}
						selectedPalette={selectedPalette}
						socialScore={socialScore}
						overallBrandScore={overallBrandScore}
					/>
				</CardContent>
			</Card>
		</TabsContent>
	);
}

// ─── Audit Recommendations (sub-component) ──────────────────────────────────

interface AuditRecommendationsProps {
	generatedStatement: string;
	generatedUVP: string;
	selectedLogo: string | null;
	selectedPalette: string | null;
	socialScore: number;
	overallBrandScore: number;
}

function AuditRecommendations({
	generatedStatement,
	generatedUVP,
	selectedLogo,
	selectedPalette,
	socialScore,
	overallBrandScore,
}: AuditRecommendationsProps) {
	return (
		<div className="mt-8">
			<h4 className="mb-4 flex items-center gap-2 font-semibold text-lg">
				<LightbulbIcon className="size-5 text-amber-500" />
				<Trans>Recommendations</Trans>
			</h4>
			<div className="space-y-3">
				{!generatedStatement && (
					<div className="flex items-start gap-3 rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
						<XCircleIcon className="size-5 shrink-0 text-amber-500" />
						<div>
							<p className="font-medium">
								<Trans>Create your brand statement</Trans>
							</p>
							<p className="text-muted-foreground text-sm">
								<Trans>Complete the 5-step wizard in the "Statement" tab</Trans>
							</p>
						</div>
					</div>
				)}
				{!generatedUVP && (
					<div className="flex items-start gap-3 rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
						<XCircleIcon className="size-5 shrink-0 text-amber-500" />
						<div>
							<p className="font-medium">
								<Trans>Define your unique value proposition</Trans>
							</p>
							<p className="text-muted-foreground text-sm">
								<Trans>Go to the "Value Proposition" tab to stand out</Trans>
							</p>
						</div>
					</div>
				)}
				{!selectedLogo && (
					<div className="flex items-start gap-3 rounded-lg border border-blue-500/30 bg-blue-500/5 p-4">
						<EyeIcon className="size-5 shrink-0 text-blue-500" />
						<div>
							<p className="font-medium">
								<Trans>Choose a logo concept</Trans>
							</p>
							<p className="text-muted-foreground text-sm">
								<Trans>Explore the concepts in the "Visual Identity" tab</Trans>
							</p>
						</div>
					</div>
				)}
				{!selectedPalette && (
					<div className="flex items-start gap-3 rounded-lg border border-blue-500/30 bg-blue-500/5 p-4">
						<PaletteIcon className="size-5 shrink-0 text-blue-500" />
						<div>
							<p className="font-medium">
								<Trans>Select a color palette</Trans>
							</p>
							<p className="text-muted-foreground text-sm">
								<Trans>Colors communicate your professional personality</Trans>
							</p>
						</div>
					</div>
				)}
				{socialScore < 50 && (
					<div className="flex items-start gap-3 rounded-lg border border-purple-500/30 bg-purple-500/5 p-4">
						<ShareNetworkIcon className="size-5 shrink-0 text-purple-500" />
						<div>
							<p className="font-medium">
								<Trans>Optimize your social media presence</Trans>
							</p>
							<p className="text-muted-foreground text-sm">
								<Trans>Complete the checklist in the "Social Media" tab</Trans>
							</p>
						</div>
					</div>
				)}
				{overallBrandScore >= 80 && (
					<div className="flex items-start gap-3 rounded-lg border border-green-500/30 bg-green-500/5 p-4">
						<TrophyIcon className="size-5 shrink-0 text-green-500" weight="fill" />
						<div>
							<p className="font-medium">
								<Trans>Excellent work!</Trans>
							</p>
							<p className="text-muted-foreground text-sm">
								<Trans>
									Your personal brand is well established. Keep evolving it and creating consistent content.
								</Trans>
							</p>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
