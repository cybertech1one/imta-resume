import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import {
	ArrowRightIcon,
	ArrowsClockwiseIcon,
	BriefcaseIcon,
	CameraIcon,
	CaretDownIcon,
	CaretUpIcon,
	CheckCircleIcon,
	CheckSquareIcon,
	ClipboardTextIcon,
	CopyIcon,
	DownloadSimpleIcon,
	GlobeIcon,
	HandshakeIcon,
	HashIcon,
	LightbulbIcon,
	ListBulletsIcon,
	MagnifyingGlassIcon,
	MegaphoneIcon,
	PencilSimpleIcon,
	SparkleIcon,
	SpinnerIcon,
	StarIcon,
	TargetIcon,
	TrendUpIcon,
	UserIcon,
	UsersIcon,
	WarningCircleIcon,
} from "@phosphor-icons/react";
import { AnimatePresence, motion } from "motion/react";
import {
	Cell,
	Legend,
	Pie,
	PieChart,
	RadialBar,
	RadialBarChart,
	Tooltip as RechartsTooltip,
	ResponsiveContainer,
} from "recharts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/utils/style";
import { getScoreBg, getScoreColor, iconMap } from "./linkedin-config";
import type {
	ChecklistItem,
	ConnectionStrategy,
	EngagementTip,
	HeadlineSuggestion,
	Industry,
	IndustryOption,
	KeywordOptimization,
	PhotoTip,
	ProfileScore,
	RecommendedSkill,
	SummarySuggestion,
} from "./linkedin-types";

// --- Hero Section ---

export function HeroSection() {
	return (
		<motion.div
			className="relative mb-8 overflow-hidden rounded-3xl border border-primary/20 p-8 md:p-12"
			style={{
				background:
					"linear-gradient(135deg, oklch(0.6 0.18 220 / 0.15) 0%, oklch(0.5 0.2 240 / 0.1) 50%, oklch(0.55 0.15 200 / 0.08) 100%)",
			}}
			initial={false}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.6, ease: "easeOut" }}
		>
			{/* Animated background */}
			<div className="pointer-events-none absolute inset-0 overflow-hidden">
				<motion.div
					className="absolute -top-32 -right-32 size-96 rounded-full bg-gradient-to-br from-blue-500/20 to-cyan-500/10 blur-3xl"
					animate={{ scale: [1, 1.2, 1], rotate: [0, 10, 0], opacity: [0.5, 0.3, 0.5] }}
					transition={{ duration: 10, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
				/>
				<motion.div
					className="absolute -bottom-32 -left-32 size-96 rounded-full bg-gradient-to-tr from-sky-500/15 to-indigo-500/10 blur-3xl"
					animate={{ scale: [1.2, 1, 1.2], rotate: [0, -10, 0], opacity: [0.3, 0.5, 0.3] }}
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
						<Trans>AI Optimization</Trans>
					</span>
				</motion.div>

				<motion.h2
					className="mb-4 bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text font-bold text-3xl text-transparent tracking-tight md:text-4xl lg:text-5xl"
					initial={false}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.3 }}
				>
					<Trans>LinkedIn Profile Optimizer</Trans>
				</motion.h2>

				<motion.p
					className="mb-8 max-w-2xl text-lg text-muted-foreground"
					initial={false}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.4 }}
				>
					<Trans>
						Maximize your LinkedIn visibility. Get a completeness score, headline and summary suggestions, and
						personalized tips to attract recruiters.
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
						<div className="flex size-10 items-center justify-center rounded-full bg-blue-500/10">
							<TargetIcon className="size-5 text-blue-500" weight="duotone" />
						</div>
						<div>
							<p className="font-bold text-xl">0-100</p>
							<p className="text-muted-foreground text-sm">
								<Trans>Profile Score</Trans>
							</p>
						</div>
					</div>
					<div className="flex items-center gap-2">
						<div className="flex size-10 items-center justify-center rounded-full bg-green-500/10">
							<TrendUpIcon className="size-5 text-green-500" weight="duotone" />
						</div>
						<div>
							<p className="font-bold text-xl">40x</p>
							<p className="text-muted-foreground text-sm">
								<Trans>More views</Trans>
							</p>
						</div>
					</div>
					<div className="flex items-center gap-2">
						<div className="flex size-10 items-center justify-center rounded-full bg-purple-500/10">
							<UsersIcon className="size-5 text-purple-500" weight="duotone" />
						</div>
						<div>
							<p className="font-bold text-xl">500+</p>
							<p className="text-muted-foreground text-sm">
								<Trans>Ideal connections</Trans>
							</p>
						</div>
					</div>
				</motion.div>
			</div>
		</motion.div>
	);
}

// --- Industry Selector ---

interface IndustrySelectorProps {
	selectedIndustry: Industry;
	industries: IndustryOption[];
	onUpdateField: (field: string, value: string | number | boolean) => void;
}

export function IndustrySelector({ selectedIndustry, industries, onUpdateField }: IndustrySelectorProps) {
	return (
		<motion.div className="mb-8" initial={false} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
			<Card>
				<CardContent className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
					<div>
						<h3 className="font-semibold text-lg">
							<Trans>Your industry</Trans>
						</h3>
						<p className="text-muted-foreground text-sm">
							<Trans>Select your industry for personalized recommendations</Trans>
						</p>
					</div>
					<Select value={selectedIndustry} onValueChange={(v) => onUpdateField("industry", v as Industry)}>
						<SelectTrigger className="w-full md:w-72">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							{industries.map((industry) => (
								<SelectItem key={industry.value} value={industry.value}>
									{industry.label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</CardContent>
			</Card>
		</motion.div>
	);
}

// --- Score Tab ---

interface ScoreTabProps {
	profileScore: ProfileScore;
	scoreChartData: Array<{ name: string; value: number; fill: string }>;
	detailedScoreData: Array<{ name: string; value: number; fill: string }>;
	currentRole: string;
	currentHeadline: string;
	currentSummary: string;
	yearsExperience: string;
	skillsCount: string;
	experienceCount: string;
	connectionsCount: string;
	hasProfilePhoto: boolean;
	onUpdateField: (field: string, value: string | number | boolean) => void;
}

export function ScoreTab({
	profileScore,
	scoreChartData,
	detailedScoreData,
	currentRole,
	currentHeadline,
	currentSummary,
	yearsExperience,
	skillsCount,
	experienceCount,
	connectionsCount,
	hasProfilePhoto,
	onUpdateField,
}: ScoreTabProps) {
	return (
		<div className="grid gap-8 lg:grid-cols-2">
			{/* Profile Input Form */}
			<Card className="border-2 border-primary/20">
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<UserIcon className="size-5 text-primary" weight="duotone" />
						<Trans>Profile Information</Trans>
					</CardTitle>
					<CardDescription>
						<Trans>Enter your current information to calculate your score</Trans>
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-6">
					<div className="space-y-2">
						<Label>
							<Trans>Current position</Trans>
						</Label>
						<input
							type="text"
							className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none transition-[color,box-shadow] placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
							placeholder={t`E.g.: Digital Project Manager`}
							value={currentRole}
							onChange={(e) => onUpdateField("currentRole", e.target.value)}
						/>
					</div>

					<div className="space-y-2">
						<Label>
							<Trans>Current LinkedIn headline</Trans>
						</Label>
						<Textarea
							placeholder={t`Your current LinkedIn headline...`}
							className="min-h-20 resize-none"
							value={currentHeadline}
							onChange={(e) => onUpdateField("currentHeadline", e.target.value)}
						/>
						<p className="text-muted-foreground text-xs">
							{currentHeadline.length}/120 <Trans>characters</Trans>
						</p>
					</div>

					<div className="space-y-2">
						<Label>
							<Trans>Current LinkedIn summary</Trans>
						</Label>
						<Textarea
							placeholder={t`Your current summary/About section...`}
							className="min-h-32 resize-none"
							value={currentSummary}
							onChange={(e) => onUpdateField("currentSummary", e.target.value)}
						/>
						<p className="text-muted-foreground text-xs">
							{currentSummary.length}/2600 <Trans>caracteres</Trans>
						</p>
					</div>

					<div className="grid grid-cols-2 gap-4">
						<div className="space-y-2">
							<Label>
								<Trans>Years of experience</Trans>
							</Label>
							<Select
								value={yearsExperience}
								onValueChange={(v) => onUpdateField("yearsExperience", Number.parseInt(v, 10))}
							>
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									{[1, 2, 3, 5, 7, 10, 15, 20].map((year) => (
										<SelectItem key={year} value={year.toString()}>
											{year}+ ans
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
						<div className="space-y-2">
							<Label>
								<Trans>Number of skills</Trans>
							</Label>
							<input
								type="number"
								className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none transition-[color,box-shadow] placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
								value={skillsCount}
								onChange={(e) => onUpdateField("skillsCount", Number.parseInt(e.target.value, 10) || 0)}
								min="0"
								max="50"
							/>
						</div>
					</div>

					<div className="grid grid-cols-2 gap-4">
						<div className="space-y-2">
							<Label>
								<Trans>Listed experiences</Trans>
							</Label>
							<input
								type="number"
								className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none transition-[color,box-shadow] placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
								value={experienceCount}
								onChange={(e) => onUpdateField("experienceCount", Number.parseInt(e.target.value, 10) || 0)}
								min="0"
							/>
						</div>
						<div className="space-y-2">
							<Label>
								<Trans>Number of connections</Trans>
							</Label>
							<input
								type="number"
								className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none transition-[color,box-shadow] placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
								value={connectionsCount}
								onChange={(e) => onUpdateField("connectionsCount", Number.parseInt(e.target.value, 10) || 0)}
								min="0"
							/>
						</div>
					</div>

					<div className="flex items-center justify-between rounded-lg border p-4">
						<div className="flex items-center gap-3">
							<CameraIcon className="size-5 text-muted-foreground" />
							<div>
								<Label>
									<Trans>Profile photo</Trans>
								</Label>
								<p className="text-muted-foreground text-xs">
									<Trans>Do you have a professional photo?</Trans>
								</p>
							</div>
						</div>
						<Switch checked={hasProfilePhoto} onCheckedChange={(v) => onUpdateField("hasProfilePhoto", v)} />
					</div>
				</CardContent>
			</Card>

			{/* Score Display */}
			<div className="space-y-6">
				{/* Overall Score Card */}
				<Card className="overflow-hidden border-2 border-primary/30">
					<CardHeader className="pb-2">
						<CardTitle className="flex items-center justify-between">
							<span className="flex items-center gap-2">
								<TargetIcon className="size-5 text-primary" weight="fill" />
								<Trans>Completeness Score</Trans>
							</span>
							<Badge className={cn("text-white", getScoreBg(profileScore.overall))}>
								{profileScore.overall >= 80 ? "Excellent" : profileScore.overall >= 60 ? "Good" : "Needs improvement"}
							</Badge>
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="flex items-center justify-center py-4">
							<ResponsiveContainer width={200} height={200}>
								<RadialBarChart
									cx="50%"
									cy="50%"
									innerRadius="70%"
									outerRadius="100%"
									data={scoreChartData}
									startAngle={90}
									endAngle={-270}
								>
									<RadialBar dataKey="value" cornerRadius={10} background={{ fill: "hsl(var(--muted))" }} />
								</RadialBarChart>
							</ResponsiveContainer>
							<div className="absolute flex flex-col items-center">
								<span className={cn("font-bold text-5xl", getScoreColor(profileScore.overall))}>
									{profileScore.overall}
								</span>
								<span className="text-muted-foreground text-sm">/100</span>
							</div>
						</div>

						{profileScore.overall < 80 && (
							<div className="mt-4 rounded-lg border border-amber-500/30 bg-amber-50/50 p-4 dark:bg-amber-950/20">
								<div className="flex items-start gap-2">
									<WarningCircleIcon className="mt-0.5 size-5 shrink-0 text-amber-500" weight="fill" />
									<div>
										<p className="font-medium text-amber-800 text-sm dark:text-amber-300">
											<Trans>Your profile can be improved</Trans>
										</p>
										<p className="text-amber-700 text-xs dark:text-amber-400">
											<Trans>A score of 80+ increases your chances of appearing in recruiter searches by 40x.</Trans>
										</p>
									</div>
								</div>
							</div>
						)}
					</CardContent>
				</Card>

				{/* Detailed Scores */}
				<Card>
					<CardHeader>
						<CardTitle className="text-lg">
							<Trans>Score Details</Trans>
						</CardTitle>
					</CardHeader>
					<CardContent>
						<ResponsiveContainer width="100%" height={250}>
							<PieChart>
								<Pie
									data={detailedScoreData}
									cx="50%"
									cy="50%"
									innerRadius={50}
									outerRadius={80}
									paddingAngle={3}
									dataKey="value"
								>
									{detailedScoreData.map((entry, index) => (
										<Cell key={`cell-${index}`} fill={entry.fill} />
									))}
								</Pie>
								<RechartsTooltip formatter={(value: number | undefined) => `${value ?? 0}%`} />
								<Legend />
							</PieChart>
						</ResponsiveContainer>

						<div className="mt-4 space-y-3">
							{detailedScoreData.map((item) => (
								<div key={item.name} className="space-y-1">
									<div className="flex items-center justify-between text-sm">
										<span>{item.name}</span>
										<span className="font-medium">{item.value}%</span>
									</div>
									<Progress value={item.value} className="h-2" />
								</div>
							))}
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}

// --- Headline Tab ---

interface HeadlineTabProps {
	headlineSuggestions: HeadlineSuggestion[];
	isProcessing: boolean;
	isPending: boolean;
	onGenerate: () => void;
	onCopy: (text: string) => void;
}

export function HeadlineTab({ headlineSuggestions, isProcessing, isPending, onGenerate, onCopy }: HeadlineTabProps) {
	return (
		<Card className="border-2 border-purple-500/20">
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<PencilSimpleIcon className="size-5 text-purple-600 dark:text-purple-400" weight="duotone" />
					<Trans>LinkedIn Headline Generator</Trans>
				</CardTitle>
				<CardDescription>
					<Trans>Your headline is the first thing recruiters see. Optimize it with strategic keywords.</Trans>
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-6">
				<div className="rounded-lg border bg-muted/30 p-4">
					<h4 className="mb-2 flex items-center gap-2 font-medium">
						<LightbulbIcon className="size-4 text-amber-500" weight="fill" />
						<Trans>Tips for an effective headline</Trans>
					</h4>
					<ul className="space-y-1 text-muted-foreground text-sm">
						<li>
							<Trans>Use a maximum of 120 characters (fully visible)</Trans>
						</li>
						<li>
							<Trans>Include your current role + specialty + added value</Trans>
						</li>
						<li>
							<Trans>Add keywords that recruiters search for</Trans>
						</li>
						<li>
							<Trans>Avoid "Looking for a job" - it reduces opportunities</Trans>
						</li>
					</ul>
				</div>

				<Button className="w-full gap-2" size="lg" onClick={onGenerate} disabled={isProcessing}>
					{isPending ? (
						<>
							<SpinnerIcon className="size-5 animate-spin" />
							<Trans>Generating...</Trans>
						</>
					) : (
						<>
							<SparkleIcon className="size-5" weight="fill" />
							<Trans>Generate headline suggestions</Trans>
						</>
					)}
				</Button>

				{headlineSuggestions.length > 0 && (
					<div className="space-y-4">
						<h4 className="font-semibold">
							<Trans>Generated suggestions</Trans>
						</h4>
						{headlineSuggestions.map((suggestion) => (
							<motion.div
								key={suggestion.id}
								initial={false}
								animate={{ opacity: 1, y: 0 }}
								className="group rounded-lg border bg-card p-4"
							>
								<div className="mb-2 flex items-start justify-between gap-2">
									<Badge
										variant="outline"
										className={cn(
											suggestion.tone === "professional" && "border-blue-500 text-blue-600",
											suggestion.tone === "creative" && "border-purple-500 text-purple-600",
											suggestion.tone === "executive" && "border-amber-500 text-amber-600",
										)}
									>
										{suggestion.tone === "professional" && <Trans>Professional</Trans>}
										{suggestion.tone === "creative" && <Trans>Creative</Trans>}
										{suggestion.tone === "executive" && <Trans>Executive</Trans>}
									</Badge>
									<Tooltip>
										<TooltipTrigger asChild>
											<Button
												variant="ghost"
												size="sm"
												className="size-8 p-0 opacity-0 transition-opacity group-hover:opacity-100"
												onClick={() => onCopy(suggestion.headline)}
											>
												<CopyIcon className="size-4" />
											</Button>
										</TooltipTrigger>
										<TooltipContent>
											<Trans>Copy</Trans>
										</TooltipContent>
									</Tooltip>
								</div>
								<p className="mb-3 font-medium">{suggestion.headline}</p>
								<div className="flex flex-wrap gap-1">
									{suggestion.keywords.map((keyword, idx) => (
										<Badge key={idx} variant="secondary" className="text-xs">
											{keyword}
										</Badge>
									))}
								</div>
							</motion.div>
						))}
					</div>
				)}
			</CardContent>
		</Card>
	);
}

// --- Summary Tab ---

interface SummaryTabProps {
	summarySuggestions: SummarySuggestion[];
	isProcessing: boolean;
	isPending: boolean;
	onGenerate: () => void;
	onCopy: (text: string) => void;
}

export function SummaryTab({ summarySuggestions, isProcessing, isPending, onGenerate, onCopy }: SummaryTabProps) {
	return (
		<Card className="border-2 border-cyan-500/20">
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<ClipboardTextIcon className="size-5 text-cyan-600 dark:text-cyan-400" weight="duotone" />
					<Trans>LinkedIn Summary Generator</Trans>
				</CardTitle>
				<CardDescription>
					<Trans>Your "About" section is your elevator pitch. Tell your professional story in an engaging way.</Trans>
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-6">
				<div className="rounded-lg border bg-muted/30 p-4">
					<h4 className="mb-2 flex items-center gap-2 font-medium">
						<LightbulbIcon className="size-4 text-amber-500" weight="fill" />
						<Trans>Recommended structure</Trans>
					</h4>
					<ol className="space-y-1 text-muted-foreground text-sm">
						<li>
							1. <Trans>Hook with an impact statement or quote</Trans>
						</li>
						<li>
							2. <Trans>Present your background and expertise (2-3 paragraphs)</Trans>
						</li>
						<li>
							3. <Trans>List your specialties with keywords</Trans>
						</li>
						<li>
							4. <Trans>End with a call to action (contact, exchange)</Trans>
						</li>
					</ol>
				</div>

				<Button className="w-full gap-2" size="lg" onClick={onGenerate} disabled={isProcessing}>
					{isPending ? (
						<>
							<SpinnerIcon className="size-5 animate-spin" />
							<Trans>Generating...</Trans>
						</>
					) : (
						<>
							<SparkleIcon className="size-5" weight="fill" />
							<Trans>Generate summary suggestions</Trans>
						</>
					)}
				</Button>

				{summarySuggestions.length > 0 && (
					<div className="space-y-4">
						<h4 className="font-semibold">
							<Trans>Generated suggestions</Trans>
						</h4>
						{summarySuggestions.map((suggestion) => (
							<motion.div
								key={suggestion.id}
								initial={false}
								animate={{ opacity: 1, y: 0 }}
								className="group rounded-lg border bg-card p-4"
							>
								<div className="mb-3 flex items-center justify-between">
									<Badge variant="secondary">{suggestion.wordCount} words</Badge>
									<Button
										variant="ghost"
										size="sm"
										className="gap-1 opacity-0 transition-opacity group-hover:opacity-100"
										onClick={() => onCopy(suggestion.summary)}
									>
										<CopyIcon className="size-4" />
										<Trans>Copy</Trans>
									</Button>
								</div>
								<pre className="mb-4 whitespace-pre-wrap font-sans text-sm leading-relaxed">{suggestion.summary}</pre>
								<div className="flex flex-wrap gap-1">
									<span className="mr-2 text-muted-foreground text-xs">
										<Trans>Keywords included:</Trans>
									</span>
									{suggestion.keywords.map((keyword, idx) => (
										<Badge key={idx} variant="outline" className="text-xs">
											{keyword}
										</Badge>
									))}
								</div>
							</motion.div>
						))}
					</div>
				)}
			</CardContent>
		</Card>
	);
}

// --- Skills Tab ---

interface SkillsTabProps {
	recommendedSkills: RecommendedSkill[];
	selectedIndustryLabel: string;
}

export function SkillsTab({ recommendedSkills, selectedIndustryLabel }: SkillsTabProps) {
	return (
		<Card className="border-2 border-amber-500/20">
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<StarIcon className="size-5 text-amber-600 dark:text-amber-400" weight="fill" />
					<Trans>Recommended Skills - {selectedIndustryLabel}</Trans>
				</CardTitle>
				<CardDescription>
					<Trans>Add these skills to your profile to improve your visibility with recruiters</Trans>
				</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="grid gap-4 md:grid-cols-3">
					{/* Technical Skills */}
					<div className="rounded-lg border bg-card p-4">
						<h4 className="mb-4 flex items-center gap-2 font-semibold">
							<GlobeIcon className="size-4 text-blue-500" />
							<Trans>Technical Skills</Trans>
						</h4>
						<div className="space-y-2">
							{recommendedSkills
								.filter((s) => s.category === "technical")
								.map((skill) => (
									<div
										key={skill.skill}
										className="flex items-center justify-between rounded-lg border bg-muted/30 p-2"
									>
										<span className="text-sm">{skill.skill}</span>
										<div className="flex items-center gap-1">
											{skill.inDemand && (
												<Badge className="bg-green-500 text-white text-xs">
													<Trans>In demand</Trans>
												</Badge>
											)}
											<Badge
												variant="outline"
												className={cn(
													"text-xs",
													skill.relevance === "high" && "border-green-500 text-green-600",
													skill.relevance === "medium" && "border-amber-500 text-amber-600",
													skill.relevance === "low" && "border-muted text-muted-foreground",
												)}
											>
												{skill.relevance === "high" && <Trans>High</Trans>}
												{skill.relevance === "medium" && <Trans>Medium</Trans>}
												{skill.relevance === "low" && <Trans>Low</Trans>}
											</Badge>
										</div>
									</div>
								))}
						</div>
					</div>

					{/* Soft Skills */}
					<div className="rounded-lg border bg-card p-4">
						<h4 className="mb-4 flex items-center gap-2 font-semibold">
							<UsersIcon className="size-4 text-purple-500" />
							<Trans>Soft Skills</Trans>
						</h4>
						<div className="space-y-2">
							{recommendedSkills
								.filter((s) => s.category === "soft")
								.map((skill) => (
									<div
										key={skill.skill}
										className="flex items-center justify-between rounded-lg border bg-muted/30 p-2"
									>
										<span className="text-sm">{skill.skill}</span>
										<Badge
											variant="outline"
											className={cn(
												"text-xs",
												skill.relevance === "high" && "border-green-500 text-green-600",
												skill.relevance === "medium" && "border-amber-500 text-amber-600",
											)}
										>
											{skill.relevance === "high" && <Trans>High</Trans>}
											{skill.relevance === "medium" && <Trans>Medium</Trans>}
										</Badge>
									</div>
								))}
						</div>
					</div>

					{/* Industry Skills */}
					<div className="rounded-lg border bg-card p-4">
						<h4 className="mb-4 flex items-center gap-2 font-semibold">
							<BriefcaseIcon className="size-4 text-green-500" />
							<Trans>Industry Skills</Trans>
						</h4>
						<div className="space-y-2">
							{recommendedSkills
								.filter((s) => s.category === "industry")
								.map((skill) => (
									<div
										key={skill.skill}
										className="flex items-center justify-between rounded-lg border bg-muted/30 p-2"
									>
										<span className="text-sm">{skill.skill}</span>
										<div className="flex items-center gap-1">
											{skill.inDemand && (
												<Badge className="bg-green-500 text-white text-xs">
													<Trans>En demande</Trans>
												</Badge>
											)}
										</div>
									</div>
								))}
						</div>
					</div>
				</div>

				<div className="mt-6 rounded-lg border border-blue-500/30 bg-blue-50/50 p-4 dark:bg-blue-950/20">
					<div className="flex items-start gap-2">
						<LightbulbIcon className="mt-0.5 size-5 shrink-0 text-blue-500" weight="fill" />
						<div>
							<p className="font-medium text-blue-800 text-sm dark:text-blue-300">
								<Trans>Tip: Aim for 50 skills</Trans>
							</p>
							<p className="text-blue-700 text-xs dark:text-blue-400">
								<Trans>
									Profiles with 50+ skills receive 17x more views. Ask for endorsements on your top 5 skills.
								</Trans>
							</p>
						</div>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}

// --- Photo Tab ---

interface PhotoTabProps {
	photoTips: PhotoTip[];
	onToggleTip: (tipId: string) => void;
}

export function PhotoTab({ photoTips, onToggleTip }: PhotoTabProps) {
	return (
		<Card className="border-2 border-pink-500/20">
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<CameraIcon className="size-5 text-pink-600 dark:text-pink-400" weight="duotone" />
					<Trans>Profile Photo Checklist</Trans>
				</CardTitle>
				<CardDescription>
					<Trans>
						A professional photo increases your chances of being contacted by 14x. Check these essential points.
					</Trans>
				</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="grid gap-4 md:grid-cols-2">
					{photoTips.map((tip) => {
						const TipIcon = iconMap[tip.iconName] || CameraIcon;
						return (
							<motion.div
								key={tip.id}
								whileHover={{ scale: 1.02 }}
								className={cn(
									"cursor-pointer rounded-lg border p-4 transition-all",
									tip.checked
										? "border-green-500/50 bg-green-50/50 dark:bg-green-950/20"
										: "bg-card hover:border-primary/30",
								)}
								onClick={() => onToggleTip(tip.id)}
							>
								<div className="flex items-start gap-3">
									<div
										className={cn(
											"flex size-10 shrink-0 items-center justify-center rounded-xl",
											tip.checked
												? "bg-green-100 text-green-600 dark:bg-green-900/30"
												: "bg-muted text-muted-foreground",
										)}
									>
										{tip.checked ? (
											<CheckCircleIcon className="size-5" weight="fill" />
										) : (
											<TipIcon className="size-5" />
										)}
									</div>
									<div className="flex-1">
										<h4 className="mb-1 font-medium">{tip.title}</h4>
										<p className="text-muted-foreground text-sm">{tip.description}</p>
									</div>
								</div>
							</motion.div>
						);
					})}
				</div>

				<div className="mt-6">
					<div className="flex items-center justify-between">
						<span className="text-muted-foreground text-sm">
							<Trans>Progress</Trans>
						</span>
						<span className="font-semibold">
							{photoTips.filter((t) => t.checked).length}/{photoTips.length}
						</span>
					</div>
					<Progress value={(photoTips.filter((t) => t.checked).length / photoTips.length) * 100} className="mt-2 h-3" />
				</div>
			</CardContent>
		</Card>
	);
}

// --- Connections Tab ---

interface ConnectionsTabProps {
	connectionStrategies: ConnectionStrategy[];
}

export function ConnectionsTab({ connectionStrategies }: ConnectionsTabProps) {
	return (
		<Card className="border-2 border-indigo-500/20">
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<HandshakeIcon className="size-5 text-indigo-600 dark:text-indigo-400" weight="duotone" />
					<Trans>Connection Strategies</Trans>
				</CardTitle>
				<CardDescription>
					<Trans>Build your network strategically. The goal: 500+ connections to maximize your visibility.</Trans>
				</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="space-y-4">
					{connectionStrategies.map((strategy, index) => (
						<motion.div
							key={strategy.id}
							initial={false}
							animate={{ opacity: 1, x: 0 }}
							transition={{ delay: index * 0.1 }}
						>
							<Card className="border-l-4 border-l-indigo-500">
								<CardContent className="p-4">
									<div className="flex items-start gap-4">
										<div
											className={cn(
												"flex size-10 shrink-0 items-center justify-center rounded-xl",
												strategy.priority === "high" && "bg-red-100 text-red-600 dark:bg-red-900/30",
												strategy.priority === "medium" && "bg-amber-100 text-amber-600 dark:bg-amber-900/30",
												strategy.priority === "low" && "bg-green-100 text-green-600 dark:bg-green-900/30",
											)}
										>
											<UsersIcon className="size-5" weight="duotone" />
										</div>
										<div className="flex-1">
											<div className="mb-2 flex items-center gap-2">
												<h4 className="font-semibold">{strategy.title}</h4>
												<Badge
													variant="outline"
													className={cn(
														"text-xs",
														strategy.priority === "high" && "border-red-500 text-red-600",
														strategy.priority === "medium" && "border-amber-500 text-amber-600",
														strategy.priority === "low" && "border-green-500 text-green-600",
													)}
												>
													{strategy.priority === "high" && <Trans>Priority</Trans>}
													{strategy.priority === "medium" && <Trans>Recommended</Trans>}
													{strategy.priority === "low" && <Trans>Optional</Trans>}
												</Badge>
											</div>
											<p className="mb-3 text-muted-foreground text-sm">{strategy.description}</p>
											<div className="space-y-1">
												{strategy.tips.map((tip, tipIdx) => (
													<div key={tipIdx} className="flex items-start gap-2 text-sm">
														<CaretDownIcon className="mt-0.5 size-3 shrink-0 text-indigo-500" />
														<span>{tip}</span>
													</div>
												))}
											</div>
										</div>
									</div>
								</CardContent>
							</Card>
						</motion.div>
					))}
				</div>
			</CardContent>
		</Card>
	);
}

// --- Engagement Tab ---

interface EngagementTabProps {
	engagementTips: EngagementTip[];
}

export function EngagementTab({ engagementTips }: EngagementTabProps) {
	return (
		<Card className="border-2 border-green-500/20">
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<MegaphoneIcon className="size-5 text-green-600 dark:text-green-400" weight="duotone" />
					<Trans>Engagement Tips</Trans>
				</CardTitle>
				<CardDescription>
					<Trans>Active engagement multiplies your LinkedIn visibility by 5.</Trans>
				</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="grid gap-4 md:grid-cols-2">
					{engagementTips.map((tip, index) => {
						const TipIcon = iconMap[tip.iconName] || LightbulbIcon;
						return (
							<motion.div
								key={tip.id}
								initial={false}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: index * 0.05 }}
							>
								<Card
									className={cn(
										"h-full border-l-4",
										tip.category === "posting" && "border-l-blue-500",
										tip.category === "commenting" && "border-l-purple-500",
										tip.category === "sharing" && "border-l-amber-500",
										tip.category === "networking" && "border-l-green-500",
									)}
								>
									<CardContent className="p-4">
										<div className="mb-3 flex items-center gap-3">
											<div
												className={cn(
													"flex size-10 items-center justify-center rounded-xl",
													tip.category === "posting" && "bg-blue-100 text-blue-600 dark:bg-blue-900/30",
													tip.category === "commenting" && "bg-purple-100 text-purple-600 dark:bg-purple-900/30",
													tip.category === "sharing" && "bg-amber-100 text-amber-600 dark:bg-amber-900/30",
													tip.category === "networking" && "bg-green-100 text-green-600 dark:bg-green-900/30",
												)}
											>
												<TipIcon className="size-5" weight="duotone" />
											</div>
											<div className="flex-1">
												<h4 className="font-semibold">{tip.title}</h4>
												<Badge variant="secondary" className="text-xs">
													{tip.frequency}
												</Badge>
											</div>
										</div>
										<p className="text-muted-foreground text-sm">{tip.description}</p>
									</CardContent>
								</Card>
							</motion.div>
						);
					})}
				</div>
			</CardContent>
		</Card>
	);
}

// --- Keywords Tab ---

interface KeywordsTabProps {
	keywordOptimizations: KeywordOptimization[];
	selectedIndustryLabel: string;
}

export function KeywordsTab({ keywordOptimizations, selectedIndustryLabel }: KeywordsTabProps) {
	return (
		<Card className="border-2 border-sky-500/20">
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<MagnifyingGlassIcon className="size-5 text-sky-600 dark:text-sky-400" weight="duotone" />
					<Trans>Keyword Optimization - {selectedIndustryLabel}</Trans>
				</CardTitle>
				<CardDescription>
					<Trans>Recruiters use these keywords to find candidates. Integrate them into your profile.</Trans>
				</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="grid gap-4 md:grid-cols-2">
					{keywordOptimizations.map((keyword, index) => (
						<motion.div
							key={keyword.keyword}
							initial={false}
							animate={{ opacity: 1, x: 0 }}
							transition={{ delay: index * 0.05 }}
							className={cn(
								"flex items-center justify-between rounded-lg border p-4",
								keyword.recommended ? "bg-card" : "bg-muted/30",
							)}
						>
							<div className="flex items-center gap-3">
								<div
									className={cn(
										"flex size-8 items-center justify-center rounded-lg",
										keyword.recommended ? "bg-sky-100 text-sky-600 dark:bg-sky-900/30" : "bg-muted",
									)}
								>
									<HashIcon className="size-4" />
								</div>
								<div>
									<p className="font-medium">{keyword.keyword}</p>
									<div className="flex gap-2 text-xs">
										<span
											className={cn(
												keyword.searchVolume === "high" && "text-green-600",
												keyword.searchVolume === "medium" && "text-amber-600",
												keyword.searchVolume === "low" && "text-muted-foreground",
											)}
										>
											Volume:{" "}
											{keyword.searchVolume === "high" ? "High" : keyword.searchVolume === "medium" ? "Medium" : "Low"}
										</span>
										<span>|</span>
										<span
											className={cn(
												keyword.competition === "high" && "text-red-600",
												keyword.competition === "medium" && "text-amber-600",
												keyword.competition === "low" && "text-green-600",
											)}
										>
											Competition:{" "}
											{keyword.competition === "high" ? "High" : keyword.competition === "medium" ? "Medium" : "Low"}
										</span>
									</div>
								</div>
							</div>
							{keyword.recommended ? (
								<Badge className="bg-sky-500 text-white">
									<Trans>Recommended</Trans>
								</Badge>
							) : (
								<Badge variant="outline" className="text-muted-foreground">
									<Trans>Optional</Trans>
								</Badge>
							)}
						</motion.div>
					))}
				</div>

				<div className="mt-6 rounded-lg border border-sky-500/30 bg-sky-50/50 p-4 dark:bg-sky-950/20">
					<h4 className="mb-2 flex items-center gap-2 font-medium text-sky-800 dark:text-sky-300">
						<LightbulbIcon className="size-4" weight="fill" />
						<Trans>Where to place these keywords?</Trans>
					</h4>
					<ul className="space-y-1 text-sky-700 text-sm dark:text-sky-400">
						<li>
							<Trans>In your professional headline</Trans>
						</li>
						<li>
							<Trans>In your summary/About section</Trans>
						</li>
						<li>
							<Trans>In experience descriptions</Trans>
						</li>
						<li>
							<Trans>In the skills section</Trans>
						</li>
					</ul>
				</div>
			</CardContent>
		</Card>
	);
}

// --- Comparison Tab ---

interface ComparisonTabProps {
	currentHeadline: string;
	currentSummary: string;
	skillsCount: string;
	profileScore: ProfileScore;
	headlineSuggestions: HeadlineSuggestion[];
	summarySuggestions: SummarySuggestion[];
	recommendedSkills: RecommendedSkill[];
}

export function ComparisonTab({
	currentHeadline,
	currentSummary,
	skillsCount,
	profileScore,
	headlineSuggestions,
	summarySuggestions,
	recommendedSkills,
}: ComparisonTabProps) {
	return (
		<Card className="border-2 border-slate-500/20">
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<ArrowsClockwiseIcon className="size-5 text-slate-600 dark:text-slate-400" weight="duotone" />
					<Trans>Before/After Comparison</Trans>
				</CardTitle>
				<CardDescription>
					<Trans>Visualize the impact of optimizations on your profile</Trans>
				</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="grid gap-6 lg:grid-cols-2">
					{/* Before - Current Profile */}
					<div className="rounded-lg border-2 border-red-500/30 bg-red-50/30 p-6 dark:bg-red-950/10">
						<div className="mb-4 flex items-center gap-2">
							<Badge className="gap-1 bg-red-500 text-white">
								<CaretUpIcon className="size-3" />
								<Trans>Current</Trans>
							</Badge>
						</div>
						<div className="space-y-4">
							<div>
								<Label className="text-muted-foreground text-xs">
									<Trans>Title</Trans>
								</Label>
								<p className="font-medium">{currentHeadline || t`No headline defined`}</p>
							</div>
							<div>
								<Label className="text-muted-foreground text-xs">
									<Trans>Resume</Trans>
								</Label>
								<p className="text-sm">{currentSummary || t`No summary defined`}</p>
							</div>
							<div>
								<Label className="text-muted-foreground text-xs">
									<Trans>Skills</Trans>
								</Label>
								<div className="mt-1 flex flex-wrap gap-1">
									<Badge variant="secondary">
										{skillsCount} <Trans>skills</Trans>
									</Badge>
								</div>
							</div>
						</div>
						<div className="mt-4 flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-100/50 p-3 dark:bg-red-900/30">
							<WarningCircleIcon className="size-5 text-red-500" weight="fill" />
							<span className="text-red-700 text-sm dark:text-red-300">
								<Trans>Current score:</Trans> {profileScore.overall}/100
							</span>
						</div>
					</div>

					{/* After */}
					<div className="rounded-lg border-2 border-green-500/30 bg-green-50/30 p-6 dark:bg-green-950/10">
						<div className="mb-4 flex items-center gap-2">
							<Badge className="gap-1 bg-green-500 text-white">
								<CaretDownIcon className="size-3" />
								<Trans>After</Trans>
							</Badge>
						</div>
						<div className="space-y-4">
							<div>
								<Label className="text-muted-foreground text-xs">
									<Trans>Title</Trans>
								</Label>
								<p className="font-medium">
									{headlineSuggestions[0]?.headline ||
										"Senior Manager | Digital Transformation Expert | 10+ years of experience"}
								</p>
							</div>
							<div>
								<Label className="text-muted-foreground text-xs">
									<Trans>Resume</Trans>
								</Label>
								<p className="line-clamp-4 text-sm">
									{summarySuggestions[0]?.summary ||
										"Passionate professional with expertise in management and transformation. I help companies evolve..."}
								</p>
							</div>
							<div>
								<Label className="text-muted-foreground text-xs">
									<Trans>Skills</Trans>
								</Label>
								<div className="mt-1 flex flex-wrap gap-1">
									{recommendedSkills.slice(0, 5).map((skill) => (
										<Badge key={skill.skill} variant="secondary">
											{skill.skill}
										</Badge>
									))}
									<Badge variant="outline">+45</Badge>
								</div>
							</div>
						</div>
						<div className="mt-4 flex items-center gap-2 rounded-lg border border-green-500/30 bg-green-100/50 p-3 dark:bg-green-900/30">
							<CheckCircleIcon className="size-5 text-green-500" weight="fill" />
							<span className="text-green-700 text-sm dark:text-green-300">
								<Trans>Estimated score: 85/100</Trans>
							</span>
						</div>
					</div>
				</div>

				{/* Impact Stats */}
				<div className="mt-6 grid grid-cols-3 gap-4">
					<div className="rounded-lg border bg-card p-4 text-center">
						<p className="font-bold text-2xl text-green-600 dark:text-green-400">+40x</p>
						<p className="text-muted-foreground text-xs">
							<Trans>Search appearances</Trans>
						</p>
					</div>
					<div className="rounded-lg border bg-card p-4 text-center">
						<p className="font-bold text-2xl text-blue-600 dark:text-blue-400">+14x</p>
						<p className="text-muted-foreground text-xs">
							<Trans>Profile views</Trans>
						</p>
					</div>
					<div className="rounded-lg border bg-card p-4 text-center">
						<p className="font-bold text-2xl text-purple-600 dark:text-purple-400">+9x</p>
						<p className="text-muted-foreground text-xs">
							<Trans>Recruiter messages</Trans>
						</p>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}

// --- Export Tab ---

interface ExportTabProps {
	checklist: ChecklistItem[];
	isPending: boolean;
	onGenerateChecklist: () => void;
	onExportChecklist: () => void;
}

export function ExportTab({ checklist, isPending, onGenerateChecklist, onExportChecklist }: ExportTabProps) {
	return (
		<Card className="border-2 border-emerald-500/20">
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<ListBulletsIcon className="size-5 text-emerald-600 dark:text-emerald-400" weight="duotone" />
					<Trans>Export Checklist</Trans>
				</CardTitle>
				<CardDescription>
					<Trans>Generate and export a complete checklist to optimize your profile</Trans>
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-6">
				<Button className="w-full gap-2" size="lg" onClick={onGenerateChecklist}>
					{isPending ? (
						<>
							<SpinnerIcon className="size-5 animate-spin" />
							<Trans>Generating...</Trans>
						</>
					) : (
						<>
							<CheckSquareIcon className="size-5" />
							<Trans>Generate my personalized checklist</Trans>
						</>
					)}
				</Button>

				{checklist.length > 0 && (
					<AnimatePresence>
						<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
							{[...new Set(checklist.map((item) => item.category))].map((category) => (
								<div key={category} className="rounded-lg border bg-card p-4">
									<h4 className="mb-3 font-semibold">{category}</h4>
									<div className="space-y-2">
										{checklist
											.filter((item) => item.category === category)
											.map((item) => (
												<div
													key={item.id}
													className={cn(
														"flex items-center justify-between rounded-lg border p-3",
														item.completed ? "bg-green-50/50 dark:bg-green-950/20" : "bg-muted/30",
													)}
												>
													<div className="flex items-center gap-3">
														{item.completed ? (
															<CheckCircleIcon className="size-5 text-green-500" weight="fill" />
														) : (
															<div className="size-5 rounded-full border-2 border-muted-foreground/30" />
														)}
														<span className={cn("text-sm", item.completed && "text-muted-foreground line-through")}>
															{item.item}
														</span>
													</div>
													<Badge
														variant="outline"
														className={cn(
															"text-xs",
															item.priority === "high" && "border-red-500 text-red-600",
															item.priority === "medium" && "border-amber-500 text-amber-600",
															item.priority === "low" && "border-green-500 text-green-600",
														)}
													>
														{item.priority === "high" && <Trans>Prioritaire</Trans>}
														{item.priority === "medium" && <Trans>Recommended</Trans>}
														{item.priority === "low" && <Trans>Optional</Trans>}
													</Badge>
												</div>
											))}
									</div>
								</div>
							))}

							<div className="flex items-center justify-between rounded-lg border bg-muted/30 p-4">
								<div>
									<p className="font-medium">
										<Trans>Total progress</Trans>
									</p>
									<p className="text-muted-foreground text-sm">
										{checklist.filter((i) => i.completed).length}/{checklist.length} <Trans>items completed</Trans>
									</p>
								</div>
								<Button className="gap-2" onClick={onExportChecklist}>
									<DownloadSimpleIcon className="size-4" />
									<Trans>Download</Trans>
								</Button>
							</div>
						</motion.div>
					</AnimatePresence>
				)}
			</CardContent>
		</Card>
	);
}

// --- Tips Footer ---

interface TipsFooterProps {
	onViewScore: () => void;
}

export function TipsFooter({ onViewScore }: TipsFooterProps) {
	return (
		<motion.div className="mt-8" initial={false} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}>
			<Card className="border-primary/30 border-dashed bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5">
				<CardContent className="flex flex-col items-center gap-4 p-6 md:flex-row">
					<div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-primary/20">
						<LightbulbIcon className="size-7 text-primary" weight="fill" />
					</div>
					<div className="flex-1 text-center md:text-left">
						<h3 className="mb-1 font-semibold text-lg">
							<Trans>Did you know?</Trans>
						</h3>
						<p className="text-muted-foreground text-sm">
							<Trans>
								Complete LinkedIn profiles receive 40x more views than incomplete ones. Recruiters spend an average of 6
								seconds scanning a profile - optimize every element to make a good impression immediately.
							</Trans>
						</p>
					</div>
					<Button variant="outline" className="gap-2" onClick={onViewScore}>
						<ArrowRightIcon className="size-4" />
						<Trans>View my score</Trans>
					</Button>
				</CardContent>
			</Card>
		</motion.div>
	);
}
