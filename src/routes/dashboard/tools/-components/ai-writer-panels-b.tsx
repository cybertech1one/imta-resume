import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import {
	ArrowCounterClockwiseIcon,
	ArrowLeftIcon,
	ArrowRightIcon,
	ArrowsClockwiseIcon,
	CheckCircleIcon,
	CopyIcon,
	EnvelopeIcon,
	FileTextIcon,
	GlobeIcon,
	LightbulbIcon,
	LinkedinLogoIcon,
	MagnifyingGlassIcon,
	SpinnerIcon,
	TagIcon,
	TextAaIcon,
} from "@phosphor-icons/react";
import { motion } from "motion/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { AiWriterTone } from "@/integrations/drizzle/schema";
import { cn } from "@/utils/style";

import { industries, toneOptions } from "./ai-writer-config";
import type {
	ComparisonViewPanelProps,
	CoverLetterPanelProps,
	GrammarCheckerPanelProps,
	IndustryLanguagePanelProps,
	LinkedInOptimizerPanelProps,
} from "./ai-writer-panels";

// ─── Cover Letter Panel ──────────────────────────────────────────────────

export function CoverLetterPanel({
	coverJobTitle,
	setCoverJobTitle,
	coverCompany,
	setCoverCompany,
	coverSkills,
	setCoverSkills,
	coverTone,
	setCoverTone,
	generatedCoverLetter,
	isPending,
	isProcessing,
	onGenerate,
	copyToClipboard,
}: CoverLetterPanelProps) {
	return (
		<Card className="border-2 border-rose-500/20">
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<EnvelopeIcon className="size-5 text-rose-600 dark:text-rose-400" weight="duotone" />
					<Trans>Cover Letter Generator</Trans>
				</CardTitle>
				<CardDescription>
					<Trans>Create a personalized and professional cover letter</Trans>
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-6">
				<div className="grid gap-6 lg:grid-cols-2">
					{/* Input Section */}
					<div className="space-y-4">
						<div className="space-y-2">
							<Label>
								<Trans>Target position *</Trans>
							</Label>
							<input
								type="text"
								className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none transition-[color,box-shadow] placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
								placeholder={t`E.g.: Full Stack Developer`}
								value={coverJobTitle}
								onChange={(e) => setCoverJobTitle(e.target.value)}
							/>
						</div>

						<div className="space-y-2">
							<Label>
								<Trans>Company *</Trans>
							</Label>
							<input
								type="text"
								className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none transition-[color,box-shadow] placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
								placeholder={t`E.g.: OCP, Renault Tanger, ONCF...`}
								value={coverCompany}
								onChange={(e) => setCoverCompany(e.target.value)}
							/>
						</div>

						<div className="space-y-2">
							<Label>
								<Trans>Your key skills (separated by commas)</Trans>
							</Label>
							<Textarea
								placeholder={t`E.g.: React, Node.js, Project Management...`}
								className="min-h-20 resize-none"
								value={coverSkills}
								onChange={(e) => setCoverSkills(e.target.value)}
							/>
						</div>

						<div className="space-y-2">
							<Label>
								<Trans>Ton</Trans>
							</Label>
							<Select value={coverTone} onValueChange={(v) => setCoverTone(v as AiWriterTone)}>
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									{toneOptions.map((tone) => (
										<SelectItem key={tone.value} value={tone.value}>
											{tone.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						<Button
							className="w-full gap-2"
							size="lg"
							onClick={onGenerate}
							disabled={isProcessing || !coverJobTitle.trim() || !coverCompany.trim()}
						>
							{isPending ? (
								<>
									<SpinnerIcon className="size-5 animate-spin" />
									<Trans>Generating...</Trans>
								</>
							) : (
								<>
									<EnvelopeIcon className="size-5" />
									<Trans>Generate Letter</Trans>
								</>
							)}
						</Button>
					</div>

					{/* Output Section */}
					<div className="space-y-4">
						<div className="flex items-center justify-between">
							<Label>
								<Trans>Generated Letter</Trans>
							</Label>
							{generatedCoverLetter && (
								<Button
									variant="ghost"
									size="sm"
									className="gap-1"
									onClick={() => copyToClipboard(generatedCoverLetter)}
								>
									<CopyIcon className="size-4" />
									<Trans>Copy</Trans>
								</Button>
							)}
						</div>
						{generatedCoverLetter ? (
							<motion.div
								initial={false}
								animate={{ opacity: 1, y: 0 }}
								className="rounded-lg border bg-gradient-to-br from-rose-500/10 to-transparent p-6"
							>
								<pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">{generatedCoverLetter}</pre>
							</motion.div>
						) : (
							<div className="flex flex-col items-center justify-center rounded-lg border-2 border-muted border-dashed p-8 text-center">
								<EnvelopeIcon className="mb-4 size-12 text-muted-foreground/50" weight="duotone" />
								<p className="text-muted-foreground">
									<Trans>Your cover letter will appear here</Trans>
								</p>
							</div>
						)}
					</div>
				</div>
			</CardContent>
		</Card>
	);
}

// ─── LinkedIn Optimizer Panel ────────────────────────────────────────────

export function LinkedInOptimizerPanel({
	linkedinInput,
	setLinkedinInput,
	linkedinOptimized,
	linkedinKeywords,
	isPending,
	isProcessing,
	onOptimize,
	copyToClipboard,
}: LinkedInOptimizerPanelProps) {
	return (
		<Card className="border-2 border-sky-500/20">
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<LinkedinLogoIcon className="size-5 text-sky-600 dark:text-sky-400" weight="duotone" />
					<Trans>LinkedIn Summary Optimizer</Trans>
				</CardTitle>
				<CardDescription>
					<Trans>Optimize your summary for LinkedIn SEO and attract more recruiters</Trans>
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-6">
				<div className="grid gap-6 lg:grid-cols-2">
					{/* Input Section */}
					<div className="space-y-4">
						<div className="space-y-2">
							<Label>
								<Trans>Your current LinkedIn summary</Trans>
							</Label>
							<Textarea
								placeholder={t`Paste your current LinkedIn summary or write a new one...`}
								className="min-h-48 resize-none"
								value={linkedinInput}
								onChange={(e) => setLinkedinInput(e.target.value)}
							/>
						</div>

						<div className="rounded-lg border bg-sky-50/50 p-4 dark:bg-sky-950/20">
							<h4 className="mb-2 flex items-center gap-2 font-semibold text-sky-800 dark:text-sky-300">
								<LightbulbIcon className="size-4" weight="fill" />
								<Trans>LinkedIn SEO Tips</Trans>
							</h4>
							<ul className="space-y-1 text-sky-700 text-sm dark:text-sky-400">
								<li>
									<Trans>Use keywords from your industry</Trans>
								</li>
								<li>
									<Trans>Include your target job title</Trans>
								</li>
								<li>
									<Trans>Mention your certifications</Trans>
								</li>
								<li>
									<Trans>Keep a professional but engaging tone</Trans>
								</li>
							</ul>
						</div>

						<Button
							className="w-full gap-2"
							size="lg"
							onClick={onOptimize}
							disabled={isProcessing || !linkedinInput.trim()}
						>
							{isPending ? (
								<>
									<SpinnerIcon className="size-5 animate-spin" />
									<Trans>Optimizing...</Trans>
								</>
							) : (
								<>
									<LinkedinLogoIcon className="size-5" />
									<Trans>Optimize my Summary</Trans>
								</>
							)}
						</Button>
					</div>

					{/* Output Section */}
					<div className="space-y-4">
						{linkedinOptimized ? (
							<motion.div initial={false} animate={{ opacity: 1, y: 0 }} className="space-y-4">
								<div className="flex items-center justify-between">
									<Label>
										<Trans>Optimized Summary</Trans>
									</Label>
									<Button
										variant="ghost"
										size="sm"
										className="gap-1"
										onClick={() => copyToClipboard(linkedinOptimized)}
									>
										<CopyIcon className="size-4" />
										<Trans>Copy</Trans>
									</Button>
								</div>
								<div className="rounded-lg border bg-gradient-to-br from-sky-500/10 to-transparent p-6">
									<pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">{linkedinOptimized}</pre>
								</div>

								{/* Keywords */}
								<div className="rounded-lg border bg-card p-4">
									<h4 className="mb-3 flex items-center gap-2 font-semibold">
										<TagIcon className="size-4 text-sky-500" />
										<Trans>Suggested SEO keywords</Trans>
									</h4>
									<div className="flex flex-wrap gap-2">
										{linkedinKeywords.map((keyword) => (
											<Badge
												key={keyword}
												className="cursor-pointer bg-sky-500 text-white hover:bg-sky-600"
												onClick={() => copyToClipboard(keyword)}
											>
												{keyword}
											</Badge>
										))}
									</div>
								</div>
							</motion.div>
						) : (
							<div className="flex flex-col items-center justify-center rounded-lg border-2 border-muted border-dashed p-8 text-center">
								<LinkedinLogoIcon className="mb-4 size-12 text-muted-foreground/50" weight="duotone" />
								<p className="text-muted-foreground">
									<Trans>Your optimized summary will appear here</Trans>
								</p>
							</div>
						)}
					</div>
				</div>
			</CardContent>
		</Card>
	);
}

// ─── Industry Language Panel ─────────────────────────────────────────────

export function IndustryLanguagePanel({
	selectedIndustry,
	setSelectedIndustry,
	currentIndustryTerms,
	copyToClipboard,
}: IndustryLanguagePanelProps) {
	return (
		<Card className="border-2 border-indigo-500/20">
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<GlobeIcon className="size-5 text-indigo-600 dark:text-indigo-400" weight="duotone" />
					<Trans>Industry Language</Trans>
				</CardTitle>
				<CardDescription>
					<Trans>Discover terms and expressions specific to your industry</Trans>
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-6">
				{/* Industry Selection */}
				<div className="space-y-2">
					<Label>
						<Trans>Select your sector</Trans>
					</Label>
					<div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
						{industries.map((industry) => (
							<div
								key={industry.value}
								className={cn(
									"flex cursor-pointer items-center justify-center rounded-lg border p-3 text-center transition-all hover:bg-muted/50",
									selectedIndustry === industry.value ? "border-indigo-500 bg-indigo-500/10" : "border-muted",
								)}
								onClick={() => setSelectedIndustry(industry.value)}
							>
								<span className="font-medium text-sm">{industry.label}</span>
							</div>
						))}
					</div>
				</div>

				{/* Industry Content */}
				<div className="grid gap-6 lg:grid-cols-2">
					{/* Keywords */}
					<motion.div
						key={`keywords-${selectedIndustry}`}
						initial={false}
						animate={{ opacity: 1, x: 0 }}
						className="rounded-lg border bg-card p-6"
					>
						<h4 className="mb-4 flex items-center gap-2 font-semibold">
							<TagIcon className="size-4 text-indigo-500" />
							<Trans>Industry Keywords</Trans>
						</h4>
						<div className="flex flex-wrap gap-2">
							{currentIndustryTerms.keywords.map((keyword) => (
								<Badge
									key={keyword}
									variant="outline"
									className="cursor-pointer transition-all hover:bg-indigo-500/20"
									onClick={() => copyToClipboard(keyword)}
								>
									{keyword}
								</Badge>
							))}
						</div>
					</motion.div>

					{/* Phrases */}
					<motion.div
						key={`phrases-${selectedIndustry}`}
						initial={false}
						animate={{ opacity: 1, x: 0 }}
						className="rounded-lg border bg-card p-6"
					>
						<h4 className="mb-4 flex items-center gap-2 font-semibold">
							<FileTextIcon className="size-4 text-indigo-500" />
							<Trans>Key Phrases</Trans>
						</h4>
						<div className="space-y-3">
							{currentIndustryTerms.phrases.map((phrase) => (
								<div
									key={phrase}
									className="group flex cursor-pointer items-center justify-between rounded-lg border bg-muted/30 p-3 transition-all hover:bg-indigo-500/10"
									onClick={() => copyToClipboard(phrase)}
								>
									<span className="text-sm">{phrase}</span>
									<CopyIcon className="size-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
								</div>
							))}
						</div>
					</motion.div>
				</div>
			</CardContent>
		</Card>
	);
}

// ─── Grammar Checker Panel ───────────────────────────────────────────────

export function GrammarCheckerPanel({
	grammarInput,
	setGrammarInput,
	grammarIssues,
	isPending,
	isProcessing,
	onCheck,
	copyToClipboard: _copyToClipboard,
}: GrammarCheckerPanelProps) {
	return (
		<Card className="border-2 border-red-500/20">
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<TextAaIcon className="size-5 text-red-600 dark:text-red-400" weight="duotone" />
					<Trans>Grammar and Style Checker</Trans>
				</CardTitle>
				<CardDescription>
					<Trans>Check grammar, improve clarity and style of your text</Trans>
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-6">
				<div className="grid gap-6 lg:grid-cols-2">
					{/* Input Section */}
					<div className="space-y-4">
						<div className="space-y-2">
							<Label>
								<Trans>Text to check</Trans>
							</Label>
							<Textarea
								placeholder={t`Paste or write your text here for verification...`}
								className="min-h-48 resize-none"
								value={grammarInput}
								onChange={(e) => setGrammarInput(e.target.value)}
							/>
						</div>

						<Button
							className="w-full gap-2"
							size="lg"
							onClick={onCheck}
							disabled={isProcessing || !grammarInput.trim()}
						>
							{isPending ? (
								<>
									<SpinnerIcon className="size-5 animate-spin" />
									<Trans>Checking...</Trans>
								</>
							) : (
								<>
									<MagnifyingGlassIcon className="size-5" />
									<Trans>Check my Text</Trans>
								</>
							)}
						</Button>
					</div>

					{/* Output Section */}
					<div className="space-y-4">
						<Label>
							<Trans>Check Results</Trans>
						</Label>
						{grammarIssues.length > 0 ? (
							<motion.div initial={false} animate={{ opacity: 1, y: 0 }} className="space-y-3">
								{grammarIssues.map((issue, index) => (
									<div
										key={index}
										className={cn(
											"rounded-lg border p-4",
											issue.type === "grammar" && "border-red-500/30 bg-red-50/50 dark:bg-red-950/20",
											issue.type === "clarity" && "border-amber-500/30 bg-amber-50/50 dark:bg-amber-950/20",
											issue.type === "style" && "border-blue-500/30 bg-blue-50/50 dark:bg-blue-950/20",
											issue.type === "spelling" && "border-purple-500/30 bg-purple-50/50 dark:bg-purple-950/20",
										)}
									>
										<div className="mb-2 flex items-center gap-2">
											<Badge
												variant="outline"
												className={cn(
													issue.type === "grammar" && "border-red-500 text-red-600",
													issue.type === "clarity" && "border-amber-500 text-amber-600",
													issue.type === "style" && "border-blue-500 text-blue-600",
													issue.type === "spelling" && "border-purple-500 text-purple-600",
												)}
											>
												{issue.type === "grammar" && <Trans>Grammar</Trans>}
												{issue.type === "clarity" && <Trans>Clarity</Trans>}
												{issue.type === "style" && <Trans>Style</Trans>}
												{issue.type === "spelling" && <Trans>Spelling</Trans>}
											</Badge>
											<span className="font-mono text-sm">"{issue.text}"</span>
										</div>
										<div className="flex items-start gap-2">
											<LightbulbIcon className="mt-0.5 size-4 shrink-0 text-amber-500" weight="fill" />
											<p className="text-sm">{issue.suggestion}</p>
										</div>
									</div>
								))}

								<div className="rounded-lg border bg-green-50/50 p-4 dark:bg-green-950/20">
									<div className="flex items-center gap-2">
										<CheckCircleIcon className="size-5 text-green-500" weight="fill" />
										<span className="font-medium text-green-700 dark:text-green-400">
											<Trans>{grammarIssues.length} suggestions found</Trans>
										</span>
									</div>
								</div>
							</motion.div>
						) : grammarInput && !isPending ? (
							<div className="flex flex-col items-center justify-center rounded-lg border-2 border-green-500/30 bg-green-50/50 p-8 text-center dark:bg-green-950/20">
								<CheckCircleIcon className="mb-4 size-12 text-green-500" weight="fill" />
								<p className="font-medium text-green-700 dark:text-green-400">
									<Trans>No issues detected!</Trans>
								</p>
							</div>
						) : (
							<div className="flex flex-col items-center justify-center rounded-lg border-2 border-muted border-dashed p-8 text-center">
								<TextAaIcon className="mb-4 size-12 text-muted-foreground/50" weight="duotone" />
								<p className="text-muted-foreground">
									<Trans>Results will appear here</Trans>
								</p>
							</div>
						)}
					</div>
				</div>
			</CardContent>
		</Card>
	);
}

// ─── Comparison View Panel ───────────────────────────────────────────────

export function ComparisonViewPanel({
	comparisonOriginal,
	setComparisonOriginal,
	comparisonImproved,
	setComparisonImproved,
	showComparison,
	setShowComparison,
	onCompare,
}: ComparisonViewPanelProps) {
	return (
		<Card className="border-2 border-slate-500/20">
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<ArrowsClockwiseIcon className="size-5 text-slate-600 dark:text-slate-400" weight="duotone" />
					<Trans>Before/After Comparison</Trans>
				</CardTitle>
				<CardDescription>
					<Trans>Visualize the improvements made to your text side by side</Trans>
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-6">
				{!showComparison ? (
					<div className="grid gap-6 lg:grid-cols-2">
						{/* Before */}
						<div className="space-y-2">
							<Label className="flex items-center gap-2">
								<ArrowLeftIcon className="size-4 text-red-500" />
								<Trans>Original Text (Before)</Trans>
							</Label>
							<Textarea
								placeholder={t`Paste your original text here...`}
								className="min-h-48 resize-none"
								value={comparisonOriginal}
								onChange={(e) => setComparisonOriginal(e.target.value)}
							/>
						</div>

						{/* After */}
						<div className="space-y-2">
							<Label className="flex items-center gap-2">
								<ArrowRightIcon className="size-4 text-green-500" />
								<Trans>Improved Text (After)</Trans>
							</Label>
							<Textarea
								placeholder={t`Paste your improved text here...`}
								className="min-h-48 resize-none"
								value={comparisonImproved}
								onChange={(e) => setComparisonImproved(e.target.value)}
							/>
						</div>

						<div className="lg:col-span-2">
							<Button
								className="w-full gap-2"
								size="lg"
								onClick={onCompare}
								disabled={!comparisonOriginal.trim() || !comparisonImproved.trim()}
							>
								<ArrowsClockwiseIcon className="size-5" />
								<Trans>Compare</Trans>
							</Button>
						</div>
					</div>
				) : (
					<motion.div initial={false} animate={{ opacity: 1 }} className="space-y-6">
						<div className="flex items-center justify-between">
							<h4 className="font-semibold">
								<Trans>Comparison Result</Trans>
							</h4>
							<Button variant="outline" size="sm" onClick={() => setShowComparison(false)} className="gap-1">
								<ArrowCounterClockwiseIcon className="size-4" />
								<Trans>Edit</Trans>
							</Button>
						</div>

						<div className="grid gap-6 lg:grid-cols-2">
							{/* Before Card */}
							<div className="rounded-lg border-2 border-red-500/30 bg-red-50/30 p-6 dark:bg-red-950/10">
								<div className="mb-4 flex items-center gap-2">
									<Badge className="gap-1 bg-red-500 text-white">
										<ArrowLeftIcon className="size-3" />
										<Trans>Before</Trans>
									</Badge>
								</div>
								<p className="leading-relaxed">{comparisonOriginal}</p>
							</div>

							{/* After Card */}
							<div className="rounded-lg border-2 border-green-500/30 bg-green-50/30 p-6 dark:bg-green-950/10">
								<div className="mb-4 flex items-center gap-2">
									<Badge className="gap-1 bg-green-500 text-white">
										<ArrowRightIcon className="size-3" />
										<Trans>After</Trans>
									</Badge>
								</div>
								<p className="leading-relaxed">{comparisonImproved}</p>
							</div>
						</div>

						{/* Improvement Stats */}
						<div className="grid grid-cols-3 gap-4">
							<div className="rounded-lg border bg-card p-4 text-center">
								<p className="font-bold text-2xl text-green-600 dark:text-green-400">
									+{Math.abs(comparisonImproved.length - comparisonOriginal.length)}
								</p>
								<p className="text-muted-foreground text-xs">
									<Trans>Characters added</Trans>
								</p>
							</div>
							<div className="rounded-lg border bg-card p-4 text-center">
								<p className="font-bold text-2xl text-blue-600 dark:text-blue-400">
									{comparisonImproved.split(" ").length}
								</p>
								<p className="text-muted-foreground text-xs">
									<Trans>Words (after)</Trans>
								</p>
							</div>
							<div className="rounded-lg border bg-card p-4 text-center">
								<p className="font-bold text-2xl text-purple-600 dark:text-purple-400">
									{Math.round(
										((comparisonImproved.length - comparisonOriginal.length) / Math.max(comparisonOriginal.length, 1)) *
											100,
									)}
									%
								</p>
								<p className="text-muted-foreground text-xs">
									<Trans>Improvement</Trans>
								</p>
							</div>
						</div>
					</motion.div>
				)}
			</CardContent>
		</Card>
	);
}
