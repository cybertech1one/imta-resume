import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import {
	ChartBarIcon,
	CheckCircleIcon,
	ClipboardTextIcon,
	CopyIcon,
	GearIcon,
	LightbulbIcon,
	ListBulletsIcon,
	MagnifyingGlassIcon,
	RocketLaunchIcon,
	SparkleIcon,
	SpinnerIcon,
	StarIcon,
	TagIcon,
	TargetIcon,
	TrendUpIcon,
	UserIcon,
} from "@phosphor-icons/react";
import { motion } from "motion/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type {
	AiWriterBulletPoint,
	AiWriterGrammarIssue,
	AiWriterIndustry,
	AiWriterSkillExtraction,
	AiWriterTone,
} from "@/integrations/drizzle/schema";
import { cn } from "@/utils/style";

import { actionVerbs, toneOptions } from "./ai-writer-config";
import type { IndustryTerms } from "./ai-writer-types";

// ─── Prop Types ──────────────────────────────────────────────────────────

export interface BulletGeneratorPanelProps {
	bulletInput: string;
	setBulletInput: (value: string) => void;
	bulletTone: AiWriterTone;
	setBulletTone: (value: AiWriterTone) => void;
	generatedBullets: AiWriterBulletPoint[];
	isPending: boolean;
	isProcessing: boolean;
	onGenerate: () => void;
	copyToClipboard: (text: string) => void;
}

export interface SummaryWriterPanelProps {
	summaryInput: string;
	setSummaryInput: (value: string) => void;
	summaryTone: AiWriterTone;
	setSummaryTone: (value: AiWriterTone) => void;
	summaryExperience: number[];
	setSummaryExperience: (value: number[]) => void;
	generatedSummary: string;
	isPending: boolean;
	isProcessing: boolean;
	onGenerate: () => void;
	copyToClipboard: (text: string) => void;
}

export interface AchievementQuantifierPanelProps {
	achievementInput: string;
	setAchievementInput: (value: string) => void;
	quantifiedAchievement: string;
	isPending: boolean;
	isProcessing: boolean;
	onQuantify: () => void;
	copyToClipboard: (text: string) => void;
}

export interface ActionVerbsPanelProps {
	selectedVerbCategory: string;
	setSelectedVerbCategory: (value: string) => void;
	copyToClipboard: (text: string) => void;
}

export interface SkillsExtractorPanelProps {
	jobPostingInput: string;
	setJobPostingInput: (value: string) => void;
	extractedSkills: AiWriterSkillExtraction | null;
	isPending: boolean;
	isProcessing: boolean;
	onExtract: () => void;
	copyToClipboard: (text: string) => void;
}

export interface CoverLetterPanelProps {
	coverJobTitle: string;
	setCoverJobTitle: (value: string) => void;
	coverCompany: string;
	setCoverCompany: (value: string) => void;
	coverSkills: string;
	setCoverSkills: (value: string) => void;
	coverTone: AiWriterTone;
	setCoverTone: (value: AiWriterTone) => void;
	generatedCoverLetter: string;
	isPending: boolean;
	isProcessing: boolean;
	onGenerate: () => void;
	copyToClipboard: (text: string) => void;
}

export interface LinkedInOptimizerPanelProps {
	linkedinInput: string;
	setLinkedinInput: (value: string) => void;
	linkedinOptimized: string;
	linkedinKeywords: string[];
	isPending: boolean;
	isProcessing: boolean;
	onOptimize: () => void;
	copyToClipboard: (text: string) => void;
}

export interface IndustryLanguagePanelProps {
	selectedIndustry: AiWriterIndustry;
	setSelectedIndustry: (value: AiWriterIndustry) => void;
	currentIndustryTerms: IndustryTerms;
	copyToClipboard: (text: string) => void;
}

export interface GrammarCheckerPanelProps {
	grammarInput: string;
	setGrammarInput: (value: string) => void;
	grammarIssues: AiWriterGrammarIssue[];
	isPending: boolean;
	isProcessing: boolean;
	onCheck: () => void;
	copyToClipboard: (text: string) => void;
}

export interface ComparisonViewPanelProps {
	comparisonOriginal: string;
	setComparisonOriginal: (value: string) => void;
	comparisonImproved: string;
	setComparisonImproved: (value: string) => void;
	showComparison: boolean;
	setShowComparison: (value: boolean) => void;
	onCompare: () => void;
}

// ─── Bullet Generator Panel ─────────────────────────────────────────────

export function BulletGeneratorPanel({
	bulletInput,
	setBulletInput,
	bulletTone,
	setBulletTone,
	generatedBullets,
	isPending,
	isProcessing,
	onGenerate,
	copyToClipboard,
}: BulletGeneratorPanelProps) {
	return (
		<Card className="border-2 border-blue-500/20">
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<ListBulletsIcon className="size-5 text-blue-600 dark:text-blue-400" weight="duotone" />
					<Trans>Bullet Point Generator</Trans>
				</CardTitle>
				<CardDescription>
					<Trans>Transform your responsibilities into quantified and impactful achievements</Trans>
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-6">
				<div className="grid gap-6 lg:grid-cols-2">
					{/* Input Section */}
					<div className="space-y-4">
						<div className="space-y-2">
							<Label>
								<Trans>Job description/responsibilities</Trans>
							</Label>
							<Textarea
								placeholder={t`Describe your current responsibilities or paste a job description...`}
								className="min-h-40 resize-none"
								value={bulletInput}
								onChange={(e) => setBulletInput(e.target.value)}
							/>
						</div>

						<div className="space-y-2">
							<Label>
								<Trans>Writing tone</Trans>
							</Label>
							<div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
								{toneOptions.map((tone) => (
									<div
										key={tone.value}
										className={cn(
											"flex cursor-pointer items-center gap-2 rounded-lg border p-3 transition-all hover:bg-muted/50",
											bulletTone === tone.value ? "border-primary bg-primary/10" : "border-muted",
										)}
										onClick={() => setBulletTone(tone.value)}
									>
										<tone.icon
											className={cn("size-4", bulletTone === tone.value ? "text-primary" : "text-muted-foreground")}
											weight={bulletTone === tone.value ? "fill" : "regular"}
										/>
										<div>
											<p className="font-medium text-xs">{tone.label}</p>
										</div>
									</div>
								))}
							</div>
						</div>

						<Button
							className="w-full gap-2"
							size="lg"
							onClick={onGenerate}
							disabled={isProcessing || !bulletInput.trim()}
						>
							{isPending ? (
								<>
									<SpinnerIcon className="size-5 animate-spin" />
									<Trans>Generating...</Trans>
								</>
							) : (
								<>
									<SparkleIcon className="size-5" weight="fill" />
									<Trans>Generate Bullet Points</Trans>
								</>
							)}
						</Button>
					</div>

					{/* Output Section */}
					<div className="space-y-4">
						<Label>
							<Trans>Generated Bullet Points</Trans>
						</Label>
						{generatedBullets.length > 0 ? (
							<div className="space-y-3">
								{generatedBullets.map((bullet, index) => (
									<motion.div
										key={bullet.id}
										initial={false}
										animate={{ opacity: 1, x: 0 }}
										transition={{ delay: index * 0.1 }}
										className="group rounded-lg border bg-card p-4"
									>
										<div className="mb-2 flex items-start justify-between gap-2">
											<p className="text-muted-foreground text-sm line-through">{bullet.original}</p>
											<Tooltip>
												<TooltipTrigger asChild>
													<Button
														variant="ghost"
														size="sm"
														className="size-8 p-0 opacity-0 transition-opacity group-hover:opacity-100"
														onClick={() => copyToClipboard(bullet.enhanced)}
													>
														<CopyIcon className="size-4" />
													</Button>
												</TooltipTrigger>
												<TooltipContent>
													<Trans>Copy</Trans>
												</TooltipContent>
											</Tooltip>
										</div>
										<p className="mb-2 font-medium text-green-600 dark:text-green-400">{bullet.enhanced}</p>
										{bullet.metrics && (
											<Badge variant="outline" className="gap-1">
												<ChartBarIcon className="size-3" />
												{bullet.metrics}
											</Badge>
										)}
									</motion.div>
								))}
							</div>
						) : (
							<div className="flex flex-col items-center justify-center rounded-lg border-2 border-muted border-dashed p-8 text-center">
								<ListBulletsIcon className="mb-4 size-12 text-muted-foreground/50" weight="duotone" />
								<p className="text-muted-foreground">
									<Trans>Your bullet points will appear here</Trans>
								</p>
							</div>
						)}
					</div>
				</div>
			</CardContent>
		</Card>
	);
}

// ─── Summary Writer Panel ────────────────────────────────────────────────

export function SummaryWriterPanel({
	summaryInput,
	setSummaryInput,
	summaryTone,
	setSummaryTone,
	summaryExperience,
	setSummaryExperience,
	generatedSummary,
	isPending,
	isProcessing,
	onGenerate,
	copyToClipboard,
}: SummaryWriterPanelProps) {
	return (
		<Card className="border-2 border-purple-500/20">
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<UserIcon className="size-5 text-purple-600 dark:text-purple-400" weight="duotone" />
					<Trans>Professional Summary Writer</Trans>
				</CardTitle>
				<CardDescription>
					<Trans>Create a compelling summary that immediately captures recruiters' attention</Trans>
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-6">
				<div className="grid gap-6 lg:grid-cols-2">
					{/* Input Section */}
					<div className="space-y-4">
						<div className="space-y-2">
							<Label>
								<Trans>Your area of expertise</Trans>
							</Label>
							<Textarea
								placeholder={t`E.g.: IT project management, software development, digital marketing...`}
								className="min-h-24 resize-none"
								value={summaryInput}
								onChange={(e) => setSummaryInput(e.target.value)}
							/>
						</div>

						<div className="space-y-2">
							<Label>
								<Trans>Years of experience: {summaryExperience[0]} years</Trans>
							</Label>
							<Slider
								value={summaryExperience}
								onValueChange={setSummaryExperience}
								min={0}
								max={30}
								className="py-2"
							/>
						</div>

						<div className="space-y-2">
							<Label>
								<Trans>Desired tone</Trans>
							</Label>
							<Select value={summaryTone} onValueChange={(v) => setSummaryTone(v as AiWriterTone)}>
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									{toneOptions.map((tone) => (
										<SelectItem key={tone.value} value={tone.value}>
											<div className="flex items-center gap-2">
												<tone.icon className="size-4" />
												<span>{tone.label}</span>
												<span className="text-muted-foreground text-xs">- {tone.description}</span>
											</div>
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						<Button
							className="w-full gap-2"
							size="lg"
							onClick={onGenerate}
							disabled={isProcessing || !summaryInput.trim()}
						>
							{isPending ? (
								<>
									<SpinnerIcon className="size-5 animate-spin" />
									<Trans>Generating...</Trans>
								</>
							) : (
								<>
									<SparkleIcon className="size-5" weight="fill" />
									<Trans>Generate Summary</Trans>
								</>
							)}
						</Button>
					</div>

					{/* Output Section */}
					<div className="space-y-4">
						<div className="flex items-center justify-between">
							<Label>
								<Trans>Generated Summary</Trans>
							</Label>
							{generatedSummary && (
								<Button variant="ghost" size="sm" className="gap-1" onClick={() => copyToClipboard(generatedSummary)}>
									<CopyIcon className="size-4" />
									<Trans>Copy</Trans>
								</Button>
							)}
						</div>
						{generatedSummary ? (
							<motion.div
								initial={false}
								animate={{ opacity: 1, y: 0 }}
								className="rounded-lg border bg-gradient-to-br from-purple-500/10 to-transparent p-6"
							>
								<p className="text-foreground leading-relaxed">{generatedSummary}</p>
								<div className="mt-4 flex items-center gap-2">
									<Badge variant="outline" className="gap-1">
										<CheckCircleIcon className="size-3 text-green-500" weight="fill" />
										{toneOptions.find((t) => t.value === summaryTone)?.label}
									</Badge>
									<Badge variant="outline" className="gap-1">
										<TargetIcon className="size-3" />
										{summaryExperience[0]}+ years of experience
									</Badge>
								</div>
							</motion.div>
						) : (
							<div className="flex flex-col items-center justify-center rounded-lg border-2 border-muted border-dashed p-8 text-center">
								<UserIcon className="mb-4 size-12 text-muted-foreground/50" weight="duotone" />
								<p className="text-muted-foreground">
									<Trans>Your summary will appear here</Trans>
								</p>
							</div>
						)}
					</div>
				</div>
			</CardContent>
		</Card>
	);
}

// ─── Achievement Quantifier Panel ────────────────────────────────────────

export function AchievementQuantifierPanel({
	achievementInput,
	setAchievementInput,
	quantifiedAchievement,
	isPending,
	isProcessing,
	onQuantify,
	copyToClipboard,
}: AchievementQuantifierPanelProps) {
	return (
		<Card className="border-2 border-green-500/20">
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<ChartBarIcon className="size-5 text-green-600 dark:text-green-400" weight="duotone" />
					<Trans>Achievement Quantifier</Trans>
				</CardTitle>
				<CardDescription>
					<Trans>Add metrics and concrete numbers to your accomplishments</Trans>
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-6">
				<div className="grid gap-6 lg:grid-cols-2">
					{/* Input Section */}
					<div className="space-y-4">
						<div className="space-y-2">
							<Label>
								<Trans>Your accomplishment (without metrics)</Trans>
							</Label>
							<Textarea
								placeholder={t`E.g.: Improved team processes...`}
								className="min-h-32 resize-none"
								value={achievementInput}
								onChange={(e) => setAchievementInput(e.target.value)}
							/>
						</div>

						<div className="rounded-lg border bg-muted/30 p-4">
							<h4 className="mb-2 flex items-center gap-2 font-medium">
								<LightbulbIcon className="size-4 text-amber-500" weight="fill" />
								<Trans>Tips</Trans>
							</h4>
							<ul className="space-y-1 text-muted-foreground text-sm">
								<li>
									<Trans>Think about percentages (improvement, reduction)</Trans>
								</li>
								<li>
									<Trans>Include amounts (revenue, savings)</Trans>
								</li>
								<li>
									<Trans>Mention timelines (in X months, time reduction)</Trans>
								</li>
								<li>
									<Trans>Specify volumes (number of projects, clients, users)</Trans>
								</li>
							</ul>
						</div>

						<Button
							className="w-full gap-2"
							size="lg"
							onClick={onQuantify}
							disabled={isProcessing || !achievementInput.trim()}
						>
							{isPending ? (
								<>
									<SpinnerIcon className="size-5 animate-spin" />
									<Trans>Quantifying...</Trans>
								</>
							) : (
								<>
									<ChartBarIcon className="size-5" weight="fill" />
									<Trans>Quantify my Achievement</Trans>
								</>
							)}
						</Button>
					</div>

					{/* Output Section */}
					<div className="space-y-4">
						<div className="flex items-center justify-between">
							<Label>
								<Trans>Quantified Achievement</Trans>
							</Label>
							{quantifiedAchievement && (
								<Button
									variant="ghost"
									size="sm"
									className="gap-1"
									onClick={() => copyToClipboard(quantifiedAchievement)}
								>
									<CopyIcon className="size-4" />
									<Trans>Copy</Trans>
								</Button>
							)}
						</div>
						{quantifiedAchievement ? (
							<motion.div initial={false} animate={{ opacity: 1, y: 0 }} className="space-y-4">
								<div className="rounded-lg border bg-gradient-to-br from-green-500/10 to-transparent p-6">
									<div className="mb-3 flex items-center gap-2">
										<Badge className="gap-1 bg-green-500 text-white">
											<TrendUpIcon className="size-3" />
											<Trans>Quantified</Trans>
										</Badge>
									</div>
									<p className="text-foreground leading-relaxed">{quantifiedAchievement}</p>
								</div>

								{/* Metrics highlights */}
								<div className="grid grid-cols-2 gap-3">
									<div className="rounded-lg border bg-card p-3 text-center">
										<p className="font-bold text-2xl text-green-600 dark:text-green-400">+25%</p>
										<p className="text-muted-foreground text-xs">
											<Trans>Productivity</Trans>
										</p>
									</div>
									<div className="rounded-lg border bg-card p-3 text-center">
										<p className="font-bold text-2xl text-blue-600 dark:text-blue-400">-15%</p>
										<p className="text-muted-foreground text-xs">
											<Trans>Costs</Trans>
										</p>
									</div>
								</div>
							</motion.div>
						) : (
							<div className="flex flex-col items-center justify-center rounded-lg border-2 border-muted border-dashed p-8 text-center">
								<ChartBarIcon className="mb-4 size-12 text-muted-foreground/50" weight="duotone" />
								<p className="text-muted-foreground">
									<Trans>Your quantified accomplishment will appear here</Trans>
								</p>
							</div>
						)}
					</div>
				</div>
			</CardContent>
		</Card>
	);
}

// ─── Action Verbs Panel ──────────────────────────────────────────────────

export function ActionVerbsPanel({
	selectedVerbCategory,
	setSelectedVerbCategory,
	copyToClipboard,
}: ActionVerbsPanelProps) {
	return (
		<Card className="border-2 border-amber-500/20">
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<RocketLaunchIcon className="size-5 text-amber-600 dark:text-amber-400" weight="duotone" />
					<Trans>Powerful Action Verbs</Trans>
				</CardTitle>
				<CardDescription>
					<Trans>Replace weak verbs with impactful action verbs</Trans>
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-6">
				{/* Category Selection */}
				<div className="space-y-2">
					<Label>
						<Trans>Category</Trans>
					</Label>
					<div className="flex flex-wrap gap-2">
						{Object.keys(actionVerbs).map((category) => (
							<Badge
								key={category}
								variant={selectedVerbCategory === category ? "default" : "outline"}
								className="cursor-pointer capitalize transition-all hover:bg-primary/20"
								onClick={() => setSelectedVerbCategory(category)}
							>
								{category}
							</Badge>
						))}
					</div>
				</div>

				{/* Verbs Grid */}
				<div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
					{actionVerbs[selectedVerbCategory]?.map((verb, index) => (
						<motion.div
							key={verb}
							initial={false}
							animate={{ opacity: 1, scale: 1 }}
							transition={{ delay: index * 0.05 }}
							whileHover={{ scale: 1.05 }}
							className="group"
						>
							<Card
								className="cursor-pointer border-2 border-transparent transition-all hover:border-amber-500/50 hover:shadow-md"
								onClick={() => copyToClipboard(verb)}
							>
								<CardContent className="flex items-center justify-between p-4">
									<span className="font-semibold text-lg">{verb}</span>
									<CopyIcon className="size-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
								</CardContent>
							</Card>
						</motion.div>
					))}
				</div>

				{/* Usage Tips */}
				<div className="rounded-lg border bg-amber-50/50 p-4 dark:bg-amber-950/20">
					<h4 className="mb-2 flex items-center gap-2 font-semibold text-amber-800 dark:text-amber-300">
						<LightbulbIcon className="size-4" weight="fill" />
						<Trans>How to use action verbs</Trans>
					</h4>
					<ul className="space-y-1 text-amber-700 text-sm dark:text-amber-400">
						<li>
							<Trans>Start each bullet point with an action verb</Trans>
						</li>
						<li>
							<Trans>Avoid passive phrasing ("was responsible for")</Trans>
						</li>
						<li>
							<Trans>Vary verbs to avoid repetition</Trans>
						</li>
						<li>
							<Trans>Choose verbs suited to your level of responsibility</Trans>
						</li>
					</ul>
				</div>
			</CardContent>
		</Card>
	);
}

// ─── Skills Extractor Panel ──────────────────────────────────────────────

export function SkillsExtractorPanel({
	jobPostingInput,
	setJobPostingInput,
	extractedSkills,
	isPending,
	isProcessing,
	onExtract,
	copyToClipboard,
}: SkillsExtractorPanelProps) {
	return (
		<Card className="border-2 border-cyan-500/20">
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<TagIcon className="size-5 text-cyan-600 dark:text-cyan-400" weight="duotone" />
					<Trans>Skills Extractor</Trans>
				</CardTitle>
				<CardDescription>
					<Trans>Automatically extract key skills from a job posting</Trans>
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-6">
				<div className="grid gap-6 lg:grid-cols-2">
					{/* Input Section */}
					<div className="space-y-4">
						<div className="space-y-2">
							<Label>
								<Trans>Paste the job posting</Trans>
							</Label>
							<Textarea
								placeholder={t`Paste the full text of the job posting here...`}
								className="min-h-64 resize-none"
								value={jobPostingInput}
								onChange={(e) => setJobPostingInput(e.target.value)}
							/>
						</div>

						<Button
							className="w-full gap-2"
							size="lg"
							onClick={onExtract}
							disabled={isProcessing || !jobPostingInput.trim()}
						>
							{isPending ? (
								<>
									<SpinnerIcon className="size-5 animate-spin" />
									<Trans>Extracting...</Trans>
								</>
							) : (
								<>
									<MagnifyingGlassIcon className="size-5" />
									<Trans>Extract Skills</Trans>
								</>
							)}
						</Button>
					</div>

					{/* Output Section */}
					<div className="space-y-4">
						{extractedSkills ? (
							<motion.div initial={false} animate={{ opacity: 1, y: 0 }} className="space-y-4">
								{/* Hard Skills */}
								<div className="rounded-lg border bg-card p-4">
									<h4 className="mb-3 flex items-center gap-2 font-semibold">
										<GearIcon className="size-4 text-blue-500" />
										<Trans>Technical Skills</Trans>
									</h4>
									<div className="flex flex-wrap gap-2">
										{extractedSkills.hardSkills.map((skill) => (
											<Badge
												key={skill}
												variant="outline"
												className="cursor-pointer transition-all hover:bg-blue-500/20"
												onClick={() => copyToClipboard(skill)}
											>
												{skill}
											</Badge>
										))}
									</div>
								</div>

								{/* Soft Skills */}
								<div className="rounded-lg border bg-card p-4">
									<h4 className="mb-3 flex items-center gap-2 font-semibold">
										<UserIcon className="size-4 text-purple-500" />
										<Trans>Soft Skills</Trans>
									</h4>
									<div className="flex flex-wrap gap-2">
										{extractedSkills.softSkills.map((skill) => (
											<Badge
												key={skill}
												variant="outline"
												className="cursor-pointer transition-all hover:bg-purple-500/20"
												onClick={() => copyToClipboard(skill)}
											>
												{skill}
											</Badge>
										))}
									</div>
								</div>

								{/* Tools */}
								<div className="rounded-lg border bg-card p-4">
									<h4 className="mb-3 flex items-center gap-2 font-semibold">
										<ClipboardTextIcon className="size-4 text-green-500" />
										<Trans>Tools & Technologies</Trans>
									</h4>
									<div className="flex flex-wrap gap-2">
										{extractedSkills.tools.map((tool) => (
											<Badge
												key={tool}
												variant="outline"
												className="cursor-pointer transition-all hover:bg-green-500/20"
												onClick={() => copyToClipboard(tool)}
											>
												{tool}
											</Badge>
										))}
									</div>
								</div>

								{/* Certifications */}
								<div className="rounded-lg border bg-card p-4">
									<h4 className="mb-3 flex items-center gap-2 font-semibold">
										<StarIcon className="size-4 text-amber-500" />
										<Trans>Mentioned Certifications</Trans>
									</h4>
									<div className="flex flex-wrap gap-2">
										{extractedSkills.certifications.map((cert) => (
											<Badge
												key={cert}
												variant="outline"
												className="cursor-pointer transition-all hover:bg-amber-500/20"
												onClick={() => copyToClipboard(cert)}
											>
												{cert}
											</Badge>
										))}
									</div>
								</div>
							</motion.div>
						) : (
							<div className="flex flex-col items-center justify-center rounded-lg border-2 border-muted border-dashed p-8 text-center">
								<TagIcon className="mb-4 size-12 text-muted-foreground/50" weight="duotone" />
								<p className="text-muted-foreground">
									<Trans>Extracted skills will appear here</Trans>
								</p>
							</div>
						)}
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
