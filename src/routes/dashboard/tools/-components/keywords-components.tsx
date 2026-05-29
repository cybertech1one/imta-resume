// =============================================================================
// KEYWORDS OPTIMIZER - SUB-COMPONENTS
// =============================================================================

import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import {
	ArrowCounterClockwiseIcon,
	ArrowRightIcon,
	ArrowsClockwiseIcon,
	CaretDownIcon,
	CaretUpIcon,
	CertificateIcon,
	ChartBarIcon,
	ChartPieIcon,
	CheckCircleIcon,
	ClipboardTextIcon,
	CopyIcon,
	FileTextIcon,
	GearIcon,
	GlobeIcon,
	HeartIcon,
	LightbulbIcon,
	ListBulletsIcon,
	ReadCvLogoIcon,
	SparkleIcon,
	SpinnerIcon,
	StarIcon,
	TagIcon,
	TargetIcon,
	TrendUpIcon,
	WarningCircleIcon,
	XCircleIcon,
} from "@phosphor-icons/react";
import { Link } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import {
	Bar,
	BarChart,
	Cell,
	Legend,
	Pie,
	PieChart,
	Tooltip as RechartsTooltip,
	ResponsiveContainer,
	XAxis,
	YAxis,
} from "recharts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/utils/style";

import { getCategoryColor, getDensityColor, getScoreBgColor, getScoreColor, getScoreLabel } from "./keywords-config";
import type { AnalysisResult, BeforeAfterComparison, Industry } from "./keywords-types";

// =============================================================================
// HERO SECTION
// =============================================================================

export function KeywordsHeroSection() {
	return (
		<motion.div
			className="relative mb-8 overflow-hidden rounded-3xl border border-primary/20 p-8 md:p-12"
			style={{
				background:
					"linear-gradient(135deg, oklch(0.7 0.18 200 / 0.15) 0%, oklch(0.6 0.2 240 / 0.1) 50%, oklch(0.65 0.15 280 / 0.08) 100%)",
			}}
			initial={false}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.6, ease: "easeOut" }}
		>
			<div className="pointer-events-none absolute inset-0 overflow-hidden">
				<motion.div
					className="absolute -top-32 -right-32 size-96 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-500/10 blur-3xl"
					animate={{
						scale: [1, 1.2, 1],
						rotate: [0, 10, 0],
						opacity: [0.5, 0.3, 0.5],
					}}
					transition={{ duration: 10, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
				/>
				<motion.div
					className="absolute -bottom-32 -left-32 size-96 rounded-full bg-gradient-to-tr from-purple-500/15 to-pink-500/10 blur-3xl"
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
					<SparkleIcon className="size-5 text-primary" weight="fill" />
					<span className="font-semibold text-primary text-sm uppercase tracking-wider">
						<Trans>ATS Analysis</Trans>
					</span>
				</motion.div>

				<motion.h2
					className="mb-4 bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text font-bold text-3xl text-transparent tracking-tight md:text-4xl lg:text-5xl"
					initial={false}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.3 }}
				>
					<Trans>Keyword Optimizer</Trans>
				</motion.h2>

				<motion.p
					className="mb-8 max-w-2xl text-lg text-muted-foreground"
					initial={false}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.4 }}
				>
					<Trans>
						Analyze your resume's compatibility with ATS systems. Identify missing keywords, optimize density, and
						increase your chances of being selected.
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
							<TargetIcon className="size-5 text-primary" weight="duotone" />
						</div>
						<div>
							<p className="font-bold text-xl">ATS</p>
							<p className="text-muted-foreground text-sm">
								<Trans>Compatible</Trans>
							</p>
						</div>
					</div>
					<div className="flex items-center gap-2">
						<div className="flex size-10 items-center justify-center rounded-full bg-green-500/10">
							<TagIcon className="size-5 text-green-500" weight="duotone" />
						</div>
						<div>
							<p className="font-bold text-xl">200+</p>
							<p className="text-muted-foreground text-sm">
								<Trans>Keywords</Trans>
							</p>
						</div>
					</div>
					<div className="flex items-center gap-2">
						<div className="flex size-10 items-center justify-center rounded-full bg-amber-500/10">
							<GlobeIcon className="size-5 text-amber-500" weight="duotone" />
						</div>
						<div>
							<p className="font-bold text-xl">8</p>
							<p className="text-muted-foreground text-sm">
								<Trans>Sectors</Trans>
							</p>
						</div>
					</div>
				</motion.div>
			</div>
		</motion.div>
	);
}

// =============================================================================
// ANALYZER INPUT FORM
// =============================================================================

interface AnalyzerInputFormProps {
	selectedIndustry: Industry;
	setSelectedIndustry: (v: Industry) => void;
	industries: { value: Industry; label: string }[];
	jobDescription: string;
	setJobDescription: (v: string) => void;
	selectedResumeId: string;
	setSelectedResumeId: (v: string) => void;
	isLoadingResumes: boolean;
	resumes: { id: string; name: string }[] | undefined;
	resumeContent: string;
	setResumeContent: (v: string) => void;
	isAnalyzing: boolean;
	effectiveResumeContent: string;
	handleAnalyze: () => void;
	handleReset: () => void;
}

export function AnalyzerInputForm({
	selectedIndustry,
	setSelectedIndustry,
	industries,
	jobDescription,
	setJobDescription,
	selectedResumeId,
	setSelectedResumeId,
	isLoadingResumes,
	resumes,
	resumeContent,
	setResumeContent,
	isAnalyzing,
	effectiveResumeContent,
	handleAnalyze,
	handleReset,
}: AnalyzerInputFormProps) {
	return (
		<Card className="border-2 border-primary/20">
			<CardHeader>
				<CardTitle className="flex items-center gap-2 text-xl">
					<FileTextIcon className="size-5 text-primary" weight="duotone" />
					<Trans>ATS Analysis</Trans>
				</CardTitle>
				<CardDescription>
					<Trans>Compare your resume with a job listing</Trans>
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-6">
				{/* Industry Selection */}
				<div className="space-y-2">
					<Label>
						<Trans>Industry sector</Trans>
					</Label>
					<Select value={selectedIndustry} onValueChange={(v) => setSelectedIndustry(v as Industry)}>
						<SelectTrigger className="h-12">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							{industries.map((ind) => (
								<SelectItem key={ind.value} value={ind.value}>
									<div className="flex items-center gap-2">
										<GlobeIcon className="size-4" />
										{ind.label}
									</div>
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>

				{/* Job Description */}
				<div className="space-y-2">
					<Label>
						<Trans>Job description *</Trans>
					</Label>
					<Textarea
						placeholder={t`Paste the job description here...`}
						className="min-h-40 resize-none"
						value={jobDescription}
						onChange={(e) => setJobDescription(e.target.value)}
					/>
					<p className="text-muted-foreground text-xs">
						{jobDescription.length} <Trans>characters</Trans>
					</p>
				</div>

				{/* Resume Selection or Input */}
				<div className="space-y-2">
					<Label>
						<Trans>Your Resume</Trans>
					</Label>
					<Select value={selectedResumeId} onValueChange={setSelectedResumeId}>
						<SelectTrigger className="h-12">
							<SelectValue placeholder={t`Select an existing resume...`} />
						</SelectTrigger>
						<SelectContent>
							{isLoadingResumes ? (
								<SelectItem value="loading" disabled>
									<Trans>Loading...</Trans>
								</SelectItem>
							) : resumes && resumes.length > 0 ? (
								resumes.map((resume) => (
									<SelectItem key={resume.id} value={resume.id}>
										<div className="flex items-center gap-2">
											<ReadCvLogoIcon className="size-4" />
											{resume.name}
										</div>
									</SelectItem>
								))
							) : (
								<SelectItem value="none" disabled>
									<Trans>No resume available</Trans>
								</SelectItem>
							)}
						</SelectContent>
					</Select>
				</div>

				<div className="relative">
					<div className="absolute inset-0 flex items-center">
						<span className="w-full border-t" />
					</div>
					<div className="relative flex justify-center text-xs uppercase">
						<span className="bg-background px-2 text-muted-foreground">
							<Trans>or</Trans>
						</span>
					</div>
				</div>

				<div className="space-y-2">
					<Label>
						<Trans>Paste your resume content</Trans>
					</Label>
					<Textarea
						placeholder={t`Paste your resume text here...`}
						className="min-h-32 resize-none"
						value={resumeContent}
						onChange={(e) => setResumeContent(e.target.value)}
					/>
				</div>

				{/* Action Buttons */}
				<div className="flex gap-3 pt-4">
					<Button
						className="flex-1 gap-2"
						size="lg"
						onClick={handleAnalyze}
						disabled={isAnalyzing || !jobDescription.trim() || !effectiveResumeContent.trim()}
					>
						{isAnalyzing ? (
							<>
								<SpinnerIcon className="size-5 animate-spin" />
								<Trans>Analyzing...</Trans>
							</>
						) : (
							<>
								<SparkleIcon className="size-5" weight="fill" />
								<Trans>Analyze keywords</Trans>
							</>
						)}
					</Button>
					<Tooltip>
						<TooltipTrigger asChild>
							<Button variant="outline" size="lg" onClick={handleReset}>
								<ArrowCounterClockwiseIcon className="size-5" />
							</Button>
						</TooltipTrigger>
						<TooltipContent>
							<Trans>Reset</Trans>
						</TooltipContent>
					</Tooltip>
				</div>
			</CardContent>
		</Card>
	);
}

// =============================================================================
// ANALYSIS RESULTS PANEL
// =============================================================================

interface AnalysisResultsPanelProps {
	analysisResult: AnalysisResult;
	scoreChartData: { name: string; value: number; fill: string }[];
}

export function AnalysisResultsPanel({ analysisResult, scoreChartData }: AnalysisResultsPanelProps) {
	return (
		<motion.div
			key="results"
			initial={false}
			animate={{ opacity: 1, x: 0 }}
			exit={{ opacity: 0, x: -20 }}
			transition={{ duration: 0.4 }}
			className="space-y-6"
		>
			{/* Overall Score Card */}
			<Card className="overflow-hidden border-2 border-primary/30">
				<CardHeader className="pb-2">
					<CardTitle className="flex items-center justify-between">
						<span className="flex items-center gap-2 text-lg">
							<StarIcon className="size-5 text-amber-500" weight="fill" />
							<Trans>Score ATS</Trans>
						</span>
						<Badge className={cn("text-white", getScoreBgColor(analysisResult.matchPercentage))}>
							{getScoreLabel(analysisResult.matchPercentage)}
						</Badge>
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-6">
					{/* Main Score */}
					<div className="text-center">
						<motion.div
							className={cn("font-bold text-7xl", getScoreColor(analysisResult.matchPercentage))}
							initial={{ scale: 0 }}
							animate={{ scale: 1 }}
							transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
						>
							{analysisResult.matchPercentage}%
						</motion.div>
						<p className="text-muted-foreground">
							<Trans>match rate</Trans>
						</p>
					</div>

					{/* Score Breakdown */}
					<div className="space-y-4">
						<div className="space-y-2">
							<div className="flex items-center justify-between text-sm">
								<span className="flex items-center gap-2">
									<GearIcon className="size-4 text-blue-500" />
									<Trans>Technical skills</Trans>
								</span>
								<span className="font-semibold">{analysisResult.scoreBreakdown.technicalSkills}%</span>
							</div>
							<Progress value={analysisResult.scoreBreakdown.technicalSkills} className="h-2" />
						</div>

						<div className="space-y-2">
							<div className="flex items-center justify-between text-sm">
								<span className="flex items-center gap-2">
									<HeartIcon className="size-4 text-purple-500" />
									<Trans>Soft skills</Trans>
								</span>
								<span className="font-semibold">{analysisResult.scoreBreakdown.softSkills}%</span>
							</div>
							<Progress value={analysisResult.scoreBreakdown.softSkills} className="h-2" />
						</div>

						<div className="space-y-2">
							<div className="flex items-center justify-between text-sm">
								<span className="flex items-center gap-2">
									<CertificateIcon className="size-4 text-green-500" />
									<Trans>Certifications</Trans>
								</span>
								<span className="font-semibold">{analysisResult.scoreBreakdown.certifications}%</span>
							</div>
							<Progress value={analysisResult.scoreBreakdown.certifications} className="h-2" />
						</div>
					</div>

					{/* Quick Stats */}
					<div className="grid grid-cols-3 gap-3 text-center">
						<div className="rounded-lg border bg-green-50/50 p-3 dark:bg-green-950/20">
							<p className="font-bold text-2xl text-green-600 dark:text-green-400">
								{analysisResult.matchedKeywords.length}
							</p>
							<p className="text-muted-foreground text-xs">
								<Trans>Found</Trans>
							</p>
						</div>
						<div className="rounded-lg border bg-red-50/50 p-3 dark:bg-red-950/20">
							<p className="font-bold text-2xl text-red-600 dark:text-red-400">
								{analysisResult.missingKeywords.length}
							</p>
							<p className="text-muted-foreground text-xs">
								<Trans>Missing</Trans>
							</p>
						</div>
						<div className="rounded-lg border bg-blue-50/50 p-3 dark:bg-blue-950/20">
							<p className="font-bold text-2xl text-blue-600 dark:text-blue-400">{analysisResult.suggestions.length}</p>
							<p className="text-muted-foreground text-xs">
								<Trans>Suggestions</Trans>
							</p>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Charts */}
			<Card>
				<CardHeader className="pb-3">
					<CardTitle className="flex items-center gap-2 text-lg">
						<ChartPieIcon className="size-5 text-primary" weight="duotone" />
						<Trans>Score distribution</Trans>
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="h-64">
						<ResponsiveContainer width="100%" height="100%">
							<PieChart>
								<Pie
									data={scoreChartData}
									cx="50%"
									cy="50%"
									innerRadius={60}
									outerRadius={90}
									paddingAngle={2}
									dataKey="value"
								>
									{scoreChartData.map((entry, index) => (
										<Cell key={`cell-${index}`} fill={entry.fill} />
									))}
								</Pie>
								<RechartsTooltip
									formatter={(value: number | undefined) => [`${value ?? 0}%`, ""]}
									contentStyle={{
										backgroundColor: "hsl(var(--background))",
										border: "1px solid hsl(var(--border))",
										borderRadius: "8px",
									}}
								/>
								<Legend />
							</PieChart>
						</ResponsiveContainer>
					</div>
				</CardContent>
			</Card>
		</motion.div>
	);
}

// =============================================================================
// ANALYSIS PLACEHOLDER
// =============================================================================

export function AnalysisPlaceholder() {
	return (
		<motion.div
			key="placeholder"
			initial={false}
			animate={{ opacity: 1 }}
			exit={{ opacity: 0 }}
			className="flex h-full flex-col items-center justify-center rounded-xl border-2 border-muted-foreground/30 border-dashed p-8 text-center"
		>
			<TargetIcon className="mb-4 size-16 text-muted-foreground/50" weight="duotone" />
			<h3 className="mb-2 font-semibold text-lg">
				<Trans>Your results will appear here</Trans>
			</h3>
			<p className="text-muted-foreground text-sm">
				<Trans>Enter a job description and your resume to start the analysis</Trans>
			</p>
		</motion.div>
	);
}

// =============================================================================
// DETAILED ANALYSIS SECTIONS
// =============================================================================

interface DetailedAnalysisSectionsProps {
	analysisResult: AnalysisResult;
	copyKeywords: (keywords: string[]) => void;
}

export function DetailedAnalysisSections({ analysisResult, copyKeywords }: DetailedAnalysisSectionsProps) {
	return (
		<motion.div initial={false} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="space-y-8">
			<Separator />

			{/* Missing Keywords Section */}
			<section>
				<h3 className="mb-6 flex items-center gap-2 font-semibold text-xl">
					<WarningCircleIcon className="size-5 text-red-500" weight="fill" />
					<Trans>Missing keywords</Trans>
					<Badge variant="outline" className="ml-2">
						{analysisResult.missingKeywords.length}
					</Badge>
				</h3>

				<Card className="border-red-500/20">
					<CardContent className="p-6">
						<div className="flex flex-wrap gap-2">
							{analysisResult.missingKeywords.map((keyword, index) => (
								<motion.div
									key={keyword.keyword}
									initial={false}
									animate={{ opacity: 1, scale: 1 }}
									transition={{ delay: index * 0.02 }}
								>
									<Badge variant="outline" className={cn("gap-1", getCategoryColor(keyword.category))}>
										<XCircleIcon className="size-3" />
										{keyword.keyword}
									</Badge>
								</motion.div>
							))}
						</div>
						<div className="mt-4 flex items-center gap-2">
							<Button
								variant="outline"
								size="sm"
								className="gap-1"
								onClick={() => copyKeywords(analysisResult.missingKeywords.map((k) => k.keyword))}
							>
								<CopyIcon className="size-4" />
								<Trans>Copy all keywords</Trans>
							</Button>
						</div>
					</CardContent>
				</Card>
			</section>

			{/* Suggestions Section */}
			<section>
				<h3 className="mb-6 flex items-center gap-2 font-semibold text-xl">
					<LightbulbIcon className="size-5 text-amber-500" weight="fill" />
					<Trans>Improvement suggestions</Trans>
				</h3>

				<div className="grid gap-4 md:grid-cols-2">
					{analysisResult.suggestions.map((suggestion, index) => (
						<motion.div key={index} initial={false} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
							<Card className="h-full">
								<CardContent className="flex items-start gap-4 p-4">
									<div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
										<LightbulbIcon className="size-5" weight="duotone" />
									</div>
									<p className="text-sm">{suggestion}</p>
								</CardContent>
							</Card>
						</motion.div>
					))}
				</div>
			</section>

			{/* Industry Keywords Section */}
			<section>
				<h3 className="mb-6 flex items-center gap-2 font-semibold text-xl">
					<GlobeIcon className="size-5 text-primary" weight="duotone" />
					<Trans>Recommended keywords for your sector</Trans>
				</h3>

				<Card>
					<CardContent className="p-6">
						<div className="flex flex-wrap gap-2">
							{analysisResult.industryKeywords.map((keyword, index) => (
								<motion.div
									key={keyword}
									initial={false}
									animate={{ opacity: 1, scale: 1 }}
									transition={{ delay: index * 0.03 }}
								>
									<Badge
										variant="secondary"
										className="cursor-pointer transition-all hover:bg-primary/20"
										onClick={() => copyKeywords([keyword])}
									>
										{keyword}
									</Badge>
								</motion.div>
							))}
						</div>
					</CardContent>
				</Card>
			</section>
		</motion.div>
	);
}

// =============================================================================
// DENSITY TAB CONTENT
// =============================================================================

interface DensityTabContentProps {
	analysisResult: AnalysisResult | null;
	setActiveTab: (tab: string) => void;
}

export function DensityTabContent({ analysisResult, setActiveTab }: DensityTabContentProps) {
	if (!analysisResult) {
		return (
			<Card className="border-dashed">
				<CardContent className="flex flex-col items-center justify-center py-16">
					<ChartBarIcon className="mb-4 size-16 text-muted-foreground/50" weight="duotone" />
					<h3 className="mb-2 font-semibold text-lg">
						<Trans>No analysis available</Trans>
					</h3>
					<p className="mb-4 text-center text-muted-foreground">
						<Trans>Run an analysis to see keyword density</Trans>
					</p>
					<Button onClick={() => setActiveTab("analyzer")}>
						<ArrowRightIcon className="mr-2 size-4" />
						<Trans>Go to analyzer</Trans>
					</Button>
				</CardContent>
			</Card>
		);
	}

	return (
		<>
			<section>
				<h3 className="mb-6 flex items-center gap-2 font-semibold text-xl">
					<ChartBarIcon className="size-5 text-primary" weight="duotone" />
					<Trans>Keyword density</Trans>
				</h3>

				<Card>
					<CardContent className="p-6">
						<div className="mb-6 h-80">
							<ResponsiveContainer width="100%" height="100%">
								<BarChart data={analysisResult.keywordDensity} layout="vertical">
									<XAxis type="number" domain={[0, "dataMax"]} unit="%" />
									<YAxis type="category" dataKey="keyword" width={120} tick={{ fontSize: 12 }} />
									<RechartsTooltip
										formatter={(value: number | undefined) => [`${value ?? 0}%`, t`Density`]}
										contentStyle={{
											backgroundColor: "hsl(var(--background))",
											border: "1px solid hsl(var(--border))",
											borderRadius: "8px",
										}}
									/>
									<Bar dataKey="density" radius={[0, 4, 4, 0]}>
										{analysisResult.keywordDensity.map((entry, index) => (
											<Cell key={`cell-${index}`} fill={getDensityColor(entry.status)} />
										))}
									</Bar>
								</BarChart>
							</ResponsiveContainer>
						</div>

						{/* Legend */}
						<div className="flex flex-wrap justify-center gap-4">
							<div className="flex items-center gap-2">
								<div className="size-3 rounded-full bg-green-500" />
								<span className="text-sm">
									<Trans>Optimal (0.5-3%)</Trans>
								</span>
							</div>
							<div className="flex items-center gap-2">
								<div className="size-3 rounded-full bg-amber-500" />
								<span className="text-sm">
									<Trans>Low (&lt;0.5%)</Trans>
								</span>
							</div>
							<div className="flex items-center gap-2">
								<div className="size-3 rounded-full bg-red-500" />
								<span className="text-sm">
									<Trans>Too high (&gt;3%)</Trans>
								</span>
							</div>
						</div>
					</CardContent>
				</Card>
			</section>

			{/* Density Details */}
			<section>
				<h3 className="mb-6 flex items-center gap-2 font-semibold text-xl">
					<ListBulletsIcon className="size-5 text-primary" weight="duotone" />
					<Trans>Density details</Trans>
				</h3>

				<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
					{analysisResult.keywordDensity.map((item, index) => (
						<motion.div
							key={item.keyword}
							initial={false}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: index * 0.05 }}
						>
							<Card
								className={cn(
									"h-full",
									item.status === "optimal" && "border-green-500/30",
									item.status === "low" && "border-amber-500/30",
									item.status === "high" && "border-red-500/30",
								)}
							>
								<CardContent className="p-4">
									<div className="mb-2 flex items-center justify-between">
										<span className="font-medium">{item.keyword}</span>
										<Badge
											className={cn(
												"text-white",
												item.status === "optimal" && "bg-green-500",
												item.status === "low" && "bg-amber-500",
												item.status === "high" && "bg-red-500",
											)}
										>
											{item.density}%
										</Badge>
									</div>
									<div className="mb-2 flex items-center justify-between text-muted-foreground text-sm">
										<span>
											<Trans>Occurrences:</Trans> {item.count}
										</span>
										<span>
											{item.status === "optimal" && <Trans>Optimal</Trans>}
											{item.status === "low" && <Trans>To increase</Trans>}
											{item.status === "high" && <Trans>To reduce</Trans>}
										</span>
									</div>
									<Progress
										value={Math.min(100, item.density * 33)}
										className={cn(
											"h-2",
											item.status === "optimal" && "[&>div]:bg-green-500",
											item.status === "low" && "[&>div]:bg-amber-500",
											item.status === "high" && "[&>div]:bg-red-500",
										)}
									/>
								</CardContent>
							</Card>
						</motion.div>
					))}
				</div>
			</section>
		</>
	);
}

// =============================================================================
// KEYWORD CLOUD TAB CONTENT
// =============================================================================

interface KeywordCloudTabContentProps {
	analysisResult: AnalysisResult | null;
	keywordCategoryData: { name: string; matched: number; missing: number; fill: string }[];
	expandedCategories: Set<string>;
	toggleCategory: (category: string) => void;
	copyKeywords: (keywords: string[]) => void;
	setActiveTab: (tab: string) => void;
}

export function KeywordCloudTabContent({
	analysisResult,
	keywordCategoryData,
	expandedCategories,
	toggleCategory,
	copyKeywords,
	setActiveTab,
}: KeywordCloudTabContentProps) {
	if (!analysisResult) {
		return (
			<Card className="border-dashed">
				<CardContent className="flex flex-col items-center justify-center py-16">
					<TagIcon className="mb-4 size-16 text-muted-foreground/50" weight="duotone" />
					<h3 className="mb-2 font-semibold text-lg">
						<Trans>No word cloud available</Trans>
					</h3>
					<p className="mb-4 text-center text-muted-foreground">
						<Trans>Run an analysis to see the keyword cloud</Trans>
					</p>
					<Button onClick={() => setActiveTab("analyzer")}>
						<ArrowRightIcon className="mr-2 size-4" />
						<Trans>Go to analyzer</Trans>
					</Button>
				</CardContent>
			</Card>
		);
	}

	return (
		<>
			{/* Matched Keywords Cloud */}
			<section>
				<h3 className="mb-6 flex items-center gap-2 font-semibold text-xl">
					<CheckCircleIcon className="size-5 text-green-500" weight="fill" />
					<Trans>Keywords found</Trans>
				</h3>

				<Card className="border-green-500/20">
					<CardContent className="p-6">
						<div className="flex flex-wrap gap-3">
							{analysisResult.matchedKeywords.map((keyword, index) => {
								const size =
									keyword.importance === "high" ? "text-lg" : keyword.importance === "medium" ? "text-base" : "text-sm";
								return (
									<motion.div
										key={keyword.keyword}
										initial={false}
										animate={{ opacity: 1, scale: 1 }}
										transition={{ delay: index * 0.02, type: "spring" }}
										whileHover={{ scale: 1.1 }}
									>
										<Badge
											variant="outline"
											className={cn("cursor-pointer transition-all", size, getCategoryColor(keyword.category))}
											onClick={() => copyKeywords([keyword.keyword])}
										>
											{keyword.keyword}
											{keyword.count > 1 && <span className="ml-1 text-xs opacity-70">x{keyword.count}</span>}
										</Badge>
									</motion.div>
								);
							})}
						</div>
					</CardContent>
				</Card>
			</section>

			{/* Category Breakdown */}
			<section>
				<h3 className="mb-6 flex items-center gap-2 font-semibold text-xl">
					<ClipboardTextIcon className="size-5 text-primary" weight="duotone" />
					<Trans>By category</Trans>
				</h3>

				<div className="grid gap-6 md:grid-cols-2">
					{/* Bar Chart */}
					<Card>
						<CardHeader className="pb-3">
							<CardTitle className="text-base">
								<Trans>Keywords by category</Trans>
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="h-64">
								<ResponsiveContainer width="100%" height="100%">
									<BarChart data={keywordCategoryData}>
										<XAxis dataKey="name" tick={{ fontSize: 12 }} />
										<YAxis />
										<RechartsTooltip
											contentStyle={{
												backgroundColor: "hsl(var(--background))",
												border: "1px solid hsl(var(--border))",
												borderRadius: "8px",
											}}
										/>
										<Bar dataKey="matched" name={t`Found`} fill="#10b981" radius={[4, 4, 0, 0]} />
										<Bar dataKey="missing" name={t`Missing`} fill="#ef4444" radius={[4, 4, 0, 0]} />
										<Legend />
									</BarChart>
								</ResponsiveContainer>
							</div>
						</CardContent>
					</Card>

					{/* Category Cards */}
					<div className="space-y-4">
						{(["technical", "soft", "certification"] as const).map((category) => {
							const matched = analysisResult.matchedKeywords.filter((k) => k.category === category);
							const missing = analysisResult.missingKeywords.filter((k) => k.category === category);
							const isExpanded = expandedCategories.has(category);

							return (
								<Card key={category} className="overflow-hidden">
									<button
										type="button"
										className="flex w-full items-center justify-between p-4 text-left transition-colors hover:bg-muted/50"
										onClick={() => toggleCategory(category)}
									>
										<div className="flex items-center gap-3">
											{category === "technical" && <GearIcon className="size-5 text-blue-500" weight="duotone" />}
											{category === "soft" && <HeartIcon className="size-5 text-purple-500" weight="duotone" />}
											{category === "certification" && (
												<CertificateIcon className="size-5 text-green-500" weight="duotone" />
											)}
											<span className="font-medium">
												{category === "technical" && <Trans>Technical skills</Trans>}
												{category === "soft" && <Trans>Soft skills</Trans>}
												{category === "certification" && <Trans>Certifications</Trans>}
											</span>
										</div>
										<div className="flex items-center gap-2">
											<Badge variant="secondary">
												{matched.length}/{matched.length + missing.length}
											</Badge>
											{isExpanded ? (
												<CaretUpIcon className="size-4 text-muted-foreground" />
											) : (
												<CaretDownIcon className="size-4 text-muted-foreground" />
											)}
										</div>
									</button>
									<AnimatePresence>
										{isExpanded && (
											<motion.div
												initial={{ height: 0, opacity: 0 }}
												animate={{ height: "auto", opacity: 1 }}
												exit={{ height: 0, opacity: 0 }}
												className="overflow-hidden border-t"
											>
												<div className="p-4">
													<div className="flex flex-wrap gap-2">
														{matched.map((k) => (
															<Badge
																key={k.keyword}
																variant="outline"
																className="gap-1 border-green-500/50 bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400"
															>
																<CheckCircleIcon className="size-3" />
																{k.keyword}
															</Badge>
														))}
														{missing.map((k) => (
															<Badge
																key={k.keyword}
																variant="outline"
																className="gap-1 border-red-500/50 bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400"
															>
																<XCircleIcon className="size-3" />
																{k.keyword}
															</Badge>
														))}
													</div>
												</div>
											</motion.div>
										)}
									</AnimatePresence>
								</Card>
							);
						})}
					</div>
				</div>
			</section>
		</>
	);
}

// =============================================================================
// COMPARISON TAB CONTENT
// =============================================================================

interface ComparisonTabContentProps {
	comparison: BeforeAfterComparison | null;
	analysisResult: AnalysisResult | null;
	selectedResumeId: string;
	setActiveTab: (tab: string) => void;
}

export function ComparisonTabContent({
	comparison,
	analysisResult,
	selectedResumeId,
	setActiveTab,
}: ComparisonTabContentProps) {
	if (!comparison || !analysisResult) {
		return (
			<Card className="border-dashed">
				<CardContent className="flex flex-col items-center justify-center py-16">
					<ArrowsClockwiseIcon className="mb-4 size-16 text-muted-foreground/50" weight="duotone" />
					<h3 className="mb-2 font-semibold text-lg">
						<Trans>No comparisons available</Trans>
					</h3>
					<p className="mb-4 text-center text-muted-foreground">
						<Trans>Run an analysis to see the before/after comparison</Trans>
					</p>
					<Button onClick={() => setActiveTab("analyzer")}>
						<ArrowRightIcon className="mr-2 size-4" />
						<Trans>Go to analyzer</Trans>
					</Button>
				</CardContent>
			</Card>
		);
	}

	return (
		<>
			<section>
				<h3 className="mb-6 flex items-center gap-2 font-semibold text-xl">
					<ArrowsClockwiseIcon className="size-5 text-primary" weight="duotone" />
					<Trans>Before/After Optimization Comparison</Trans>
				</h3>

				<div className="grid gap-6 lg:grid-cols-2">
					{/* Before Card */}
					<Card className="border-2 border-red-500/30">
						<CardHeader className="pb-3">
							<CardTitle className="flex items-center gap-2 text-lg text-red-600 dark:text-red-400">
								<XCircleIcon className="size-5" weight="fill" />
								<Trans>Before optimization</Trans>
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="text-center">
								<p className="font-bold text-5xl text-red-600 dark:text-red-400">{comparison.before.score}%</p>
								<p className="text-muted-foreground text-sm">
									<Trans>Estimated ATS score</Trans>
								</p>
							</div>
							<div className="grid grid-cols-2 gap-4 text-center">
								<div className="rounded-lg border bg-muted/30 p-3">
									<p className="font-bold text-xl">{comparison.before.matchedCount}</p>
									<p className="text-muted-foreground text-xs">
										<Trans>Keywords found</Trans>
									</p>
								</div>
								<div className="rounded-lg border bg-muted/30 p-3">
									<p className="font-bold text-xl">
										{analysisResult.matchedKeywords.length +
											analysisResult.missingKeywords.length -
											comparison.before.matchedCount}
									</p>
									<p className="text-muted-foreground text-xs">
										<Trans>Missing keywords</Trans>
									</p>
								</div>
							</div>
						</CardContent>
					</Card>

					{/* After Card */}
					<Card className="border-2 border-green-500/30">
						<CardHeader className="pb-3">
							<CardTitle className="flex items-center gap-2 text-green-600 text-lg dark:text-green-400">
								<CheckCircleIcon className="size-5" weight="fill" />
								<Trans>After optimization</Trans>
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="text-center">
								<p className="font-bold text-5xl text-green-600 dark:text-green-400">{comparison.after.score}%</p>
								<p className="text-muted-foreground text-sm">
									<Trans>Current ATS score</Trans>
								</p>
							</div>
							<div className="grid grid-cols-2 gap-4 text-center">
								<div className="rounded-lg border bg-muted/30 p-3">
									<p className="font-bold text-xl">{comparison.after.matchedCount}</p>
									<p className="text-muted-foreground text-xs">
										<Trans>Keywords found</Trans>
									</p>
								</div>
								<div className="rounded-lg border bg-muted/30 p-3">
									<p className="font-bold text-xl">{analysisResult.missingKeywords.length}</p>
									<p className="text-muted-foreground text-xs">
										<Trans>Missing keywords</Trans>
									</p>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>

				{/* Improvement Summary */}
				<Card className="mt-6 border-2 border-primary/30 bg-gradient-to-br from-primary/10 to-transparent">
					<CardContent className="p-6">
						<div className="grid gap-6 text-center md:grid-cols-3">
							<div>
								<div className="flex items-center justify-center gap-2">
									<TrendUpIcon className="size-6 text-green-500" weight="fill" />
									<p className="font-bold text-3xl text-green-600 dark:text-green-400">
										+{comparison.after.score - comparison.before.score}%
									</p>
								</div>
								<p className="text-muted-foreground text-sm">
									<Trans>Score improvement</Trans>
								</p>
							</div>
							<div>
								<p className="font-bold text-3xl text-primary">
									+{comparison.after.matchedCount - comparison.before.matchedCount}
								</p>
								<p className="text-muted-foreground text-sm">
									<Trans>New keywords</Trans>
								</p>
							</div>
							<div>
								<p className="font-bold text-3xl text-amber-600 dark:text-amber-400">
									{analysisResult.suggestions.length}
								</p>
								<p className="text-muted-foreground text-sm">
									<Trans>Remaining suggestions</Trans>
								</p>
							</div>
						</div>
					</CardContent>
				</Card>
			</section>

			{/* CTA */}
			<Card className="border-2 border-primary/30 bg-gradient-to-br from-primary/10 to-transparent">
				<CardContent className="flex flex-col items-center gap-4 p-8 text-center md:flex-row md:text-left">
					<div className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-primary/20">
						<SparkleIcon className="size-8 text-primary" weight="fill" />
					</div>
					<div className="flex-1">
						<h3 className="mb-1 font-bold text-xl">
							<Trans>Optimize your resume now</Trans>
						</h3>
						<p className="text-muted-foreground">
							<Trans>
								Use the suggestions above to improve your resume and increase your chances of passing ATS filters.
							</Trans>
						</p>
					</div>
					{selectedResumeId && (
						// biome-ignore lint/suspicious/noExplicitAny: Dynamic route params
						<Link to={"/builder/$resumeId" as any} params={{ resumeId: selectedResumeId } as any}>
							<Button size="lg" className="gap-2">
								<Trans>Edit my resume</Trans>
								<ArrowRightIcon className="size-4" />
							</Button>
						</Link>
					)}
				</CardContent>
			</Card>
		</>
	);
}

// =============================================================================
// TIPS SECTION
// =============================================================================

export function KeywordsTipsSection() {
	return (
		<motion.div className="mt-8" initial={false} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}>
			<Card className="border-primary/30 border-dashed bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5">
				<CardContent className="flex flex-col items-center gap-4 p-6 md:flex-row">
					<div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-primary/20">
						<LightbulbIcon className="size-7 text-primary" weight="fill" />
					</div>
					<div className="flex-1 text-center md:text-left">
						<h3 className="mb-1 font-semibold text-lg">
							<Trans>Tips for optimizing your keywords</Trans>
						</h3>
						<p className="text-muted-foreground text-sm">
							<Trans>
								Use the same terms as the job listing. Avoid over-optimization (density above 3%). Include variations of
								important keywords. Place the most important keywords in the summary and section titles. Aim for an ATS
								score of at least 70% to maximize your chances.
							</Trans>
						</p>
					</div>
				</CardContent>
			</Card>
		</motion.div>
	);
}
