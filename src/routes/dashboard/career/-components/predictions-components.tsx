// Sub-components for the Career Predictions feature

import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import {
	ArrowRightIcon,
	ArrowsSplitIcon,
	BookmarkSimpleIcon,
	BriefcaseIcon,
	CaretDownIcon,
	CaretUpIcon,
	ChartLineUpIcon,
	CheckCircleIcon,
	ClockIcon,
	CurrencyCircleDollarIcon,
	LightbulbIcon,
	MagicWandIcon,
	MapPinIcon,
	RocketLaunchIcon,
	SparkleIcon,
	StackIcon,
	StarIcon,
	TargetIcon,
	TrendUpIcon,
	WarningCircleIcon,
	XCircleIcon,
} from "@phosphor-icons/react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/utils/style";

import {
	EDUCATION_LEVELS,
	FIELDS,
	formatMonths,
	formatSalary,
	getConfidenceColor,
	getGrowthBadgeColor,
	getMatchColor,
} from "./predictions-config";
import type {
	JobMatchData,
	PredictedCareerPath,
	SimulateInput,
	StatisticsData,
	TrajectoryData,
} from "./predictions-types";

// SuccessProbabilityGauge
function SuccessProbabilityGauge({
	probability,
	size = "default",
}: {
	probability: number;
	size?: "small" | "default";
}) {
	const getColor = (prob: number) => {
		if (prob >= 75) return "text-green-500";
		if (prob >= 50) return "text-amber-500";
		return "text-red-500";
	};

	const sizeClasses = {
		small: { container: "size-20", text: "text-lg", subtext: "text-[10px]" },
		default: { container: "size-28", text: "text-2xl", subtext: "text-xs" },
	};

	const classes = sizeClasses[size];

	return (
		<div className="flex flex-col items-center">
			<div className={cn("relative", classes.container)}>
				<svg viewBox="0 0 100 100" className="size-full -rotate-90">
					<circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="8" className="text-muted/30" />
					<motion.circle
						cx="50"
						cy="50"
						r="40"
						fill="none"
						stroke="currentColor"
						strokeWidth="8"
						strokeLinecap="round"
						className={getColor(probability)}
						initial={{ strokeDasharray: "0, 251.2" }}
						animate={{ strokeDasharray: `${probability * 2.512}, 251.2` }}
						transition={{ duration: 1.5, ease: "easeOut" }}
					/>
				</svg>
				<div className="absolute inset-0 flex flex-col items-center justify-center">
					<motion.span
						className={cn("font-bold", classes.text, getColor(probability))}
						initial={false}
						animate={{ opacity: 1, scale: 1 }}
						transition={{ delay: 0.5 }}
					>
						{probability}%
					</motion.span>
					<span className={cn("text-muted-foreground", classes.subtext)}>Match</span>
				</div>
			</div>
		</div>
	);
}

// SalaryProgressionChart
function SalaryProgressionChart({ projection }: { projection: PredictedCareerPath["salaryProjection"] }) {
	const maxSalary = projection.year5;
	const points = [
		{ label: "Current", value: projection.current },
		{ label: "Year 1", value: projection.year1 },
		{ label: "Year 3", value: projection.year3 },
		{ label: "Year 5", value: projection.year5 },
	];

	const growthPercent = Math.round(((projection.year5 - projection.current) / projection.current) * 100);

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<h4 className="flex items-center gap-2 font-medium text-sm">
					<CurrencyCircleDollarIcon className="size-4 text-green-600" />
					<Trans>Salary Projection</Trans>
				</h4>
				<Badge className="bg-green-500">
					<TrendUpIcon className="mr-1 size-3" />+{growthPercent}%
				</Badge>
			</div>
			<div className="relative h-32 rounded-lg bg-muted/50 p-4">
				{/* Chart area */}
				<div className="flex h-full items-end justify-between gap-2">
					{points.map((point, index) => {
						const height = (point.value / maxSalary) * 100;
						return (
							<motion.div
								key={point.label}
								className="flex flex-1 flex-col items-center gap-1"
								initial={false}
								animate={{ height: "auto", opacity: 1 }}
								transition={{ delay: index * 0.15 }}
							>
								<div className="relative w-full">
									<motion.div
										className={cn(
											"w-full rounded-t-sm",
											index === 0 ? "bg-muted-foreground/50" : "bg-gradient-to-t from-primary/60 to-primary",
										)}
										style={{ height: `${height}px` }}
										initial={{ height: 0 }}
										animate={{ height: `${height}px` }}
										transition={{ duration: 0.5, delay: index * 0.15 }}
									/>
								</div>
								<span className="text-[10px] text-muted-foreground">{point.label}</span>
								<span className="font-medium text-xs">{formatSalary(point.value, projection.currency)}</span>
							</motion.div>
						);
					})}
				</div>
			</div>
		</div>
	);
}

// SkillGapVisualization
function SkillGapVisualization({
	skills,
}: {
	skills: Array<{ name: string; currentLevel: number; requiredLevel: number }>;
}) {
	if (!skills || skills.length === 0) return null;

	return (
		<div className="space-y-4">
			<h4 className="flex items-center gap-2 font-medium text-sm">
				<LightbulbIcon className="size-4 text-amber-600" />
				<Trans>Skill Gap Analysis</Trans>
			</h4>
			<div className="space-y-3">
				{skills.slice(0, 5).map((skill) => {
					const gap = skill.requiredLevel - skill.currentLevel;
					const currentPercent = (skill.currentLevel / 5) * 100;
					const requiredPercent = (skill.requiredLevel / 5) * 100;

					return (
						<div key={skill.name} className="space-y-1">
							<div className="flex items-center justify-between text-sm">
								<span className="font-medium">{skill.name}</span>
								<span className="text-muted-foreground">
									{skill.currentLevel}/5 → {skill.requiredLevel}/5
								</span>
							</div>
							<div className="relative h-2 rounded-full bg-muted">
								<motion.div
									className="absolute h-full rounded-full bg-green-500"
									initial={{ width: 0 }}
									animate={{ width: `${currentPercent}%` }}
									transition={{ duration: 0.5 }}
								/>
								<motion.div
									className="absolute h-full rounded-full bg-amber-500/30"
									initial={{ width: 0 }}
									animate={{ width: `${requiredPercent}%` }}
									transition={{ duration: 0.5 }}
								/>
								{gap > 0 && <Badge className="absolute -top-1 right-0 bg-amber-500 px-1 text-[10px]">+{gap}</Badge>}
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
}

// CareerPathCard
function CareerPathCard({
	path,
	isExpanded,
	onToggleExpand,
	isTopRecommendation,
}: {
	path: PredictedCareerPath;
	isExpanded: boolean;
	onToggleExpand: () => void;
	isTopRecommendation: boolean;
}) {
	return (
		<motion.div initial={false} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
			<Card
				className={cn(
					"relative overflow-hidden transition-all duration-300 hover:shadow-lg",
					isTopRecommendation && "border-2 border-primary",
				)}
			>
				{isTopRecommendation && (
					<div className="absolute -top-3 left-1/2 z-10 -translate-x-1/2">
						<Badge className="gap-1 bg-primary shadow-md">
							<StarIcon className="size-3" weight="fill" />
							<Trans>Top Match</Trans>
						</Badge>
					</div>
				)}

				<CardHeader className="pb-4">
					<div className="flex items-start justify-between">
						<div className="flex-1">
							<div className="mb-2 flex flex-wrap items-center gap-2">
								<Badge variant="outline" className="text-xs">
									{FIELDS.find((f) => f.value === path.field)?.label || path.field}
								</Badge>
								<Badge className={getGrowthBadgeColor(path.growthPotential)}>
									<TrendUpIcon className="mr-1 size-3" />
									{path.growthPotential === "high"
										? "High Growth"
										: path.growthPotential === "medium"
											? "Medium Growth"
											: "Stable"}
								</Badge>
								<Badge className={getConfidenceColor(path.confidence)}>
									{path.confidence === "high" ? "High Confidence" : path.confidence === "medium" ? "Medium" : "Low"}
								</Badge>
							</div>
							<CardTitle className="text-lg leading-tight">{path.title}</CardTitle>
							{path.title && <p className="mt-1 text-muted-foreground text-sm">{path.title}</p>}
						</div>
						<SuccessProbabilityGauge probability={path.matchPercentage} size="small" />
					</div>
				</CardHeader>

				<CardContent className="space-y-4">
					<p className="text-muted-foreground text-sm">{path.description}</p>

					{/* Quick stats */}
					<div className="flex flex-wrap gap-4 text-sm">
						<div className="flex items-center gap-1 text-muted-foreground">
							<ClockIcon className="size-4" />
							<span>{formatMonths(path.estimatedTimeToAchieve)}</span>
						</div>
						<div className="flex items-center gap-1 text-green-600">
							<CurrencyCircleDollarIcon className="size-4" />
							<span>{formatSalary(path.salaryProjection.year5, path.salaryProjection.currency)}/yr</span>
						</div>
					</div>

					{/* Expanded content */}
					<AnimatePresence>
						{isExpanded && (
							<motion.div
								initial={{ opacity: 0, height: 0 }}
								animate={{ opacity: 1, height: "auto" }}
								exit={{ opacity: 0, height: 0 }}
								transition={{ duration: 0.3 }}
								className="space-y-6 border-t pt-4"
							>
								{/* Salary Progression */}
								<SalaryProgressionChart projection={path.salaryProjection} />

								{/* Skills */}
								{path.requiredSkills && <SkillGapVisualization skills={path.requiredSkills} />}

								{/* Milestones */}
								{path.milestones && path.milestones.length > 0 && (
									<div className="space-y-2">
										<h4 className="flex items-center gap-2 font-medium text-sm">
											<TargetIcon className="size-4 text-primary" />
											<Trans>Key Milestones</Trans>
										</h4>
										<ul className="space-y-1">
											{path.milestones.map((milestone, i) => (
												<li key={i} className="flex items-start gap-2 text-sm">
													<CheckCircleIcon className="mt-1 size-3 shrink-0 text-green-500" weight="fill" />
													<span>{milestone}</span>
												</li>
											))}
										</ul>
									</div>
								)}

								{/* Success Factors */}
								{path.successFactors && path.successFactors.length > 0 && (
									<div className="space-y-2">
										<h4 className="flex items-center gap-2 font-medium text-sm">
											<RocketLaunchIcon className="size-4 text-green-600" />
											<Trans>Success Factors</Trans>
										</h4>
										<ul className="space-y-1">
											{path.successFactors.map((factor, i) => (
												<li key={i} className="flex items-start gap-2 text-sm">
													<ArrowRightIcon className="mt-1 size-3 shrink-0 text-green-500" />
													<span>{factor}</span>
												</li>
											))}
										</ul>
									</div>
								)}

								{/* Challenges */}
								{path.challenges && path.challenges.length > 0 && (
									<div className="space-y-2">
										<h4 className="flex items-center gap-2 font-medium text-sm">
											<WarningCircleIcon className="size-4 text-amber-600" />
											<Trans>Potential Challenges</Trans>
										</h4>
										<ul className="space-y-1">
											{path.challenges.map((challenge, i) => (
												<li key={i} className="flex items-start gap-2 text-sm">
													<ArrowRightIcon className="mt-1 size-3 shrink-0 text-amber-500" />
													<span>{challenge}</span>
												</li>
											))}
										</ul>
									</div>
								)}
							</motion.div>
						)}
					</AnimatePresence>
				</CardContent>

				<CardFooter className="pt-4">
					<Button variant="ghost" onClick={onToggleExpand} className="w-full gap-2">
						{isExpanded ? (
							<>
								<CaretUpIcon className="size-4" />
								<Trans>Show Less</Trans>
							</>
						) : (
							<>
								<CaretDownIcon className="size-4" />
								<Trans>Show More Details</Trans>
							</>
						)}
					</Button>
				</CardFooter>
			</Card>
		</motion.div>
	);
}

// TrajectoryCard
function TrajectoryCard({
	trajectory,
	onSelect,
	isSelected,
}: {
	trajectory: TrajectoryData;
	onSelect: () => void;
	isSelected: boolean;
}) {
	return (
		<Card className={cn("relative transition-all hover:shadow-md", isSelected && "border-2 border-primary")}>
			{isSelected && (
				<Badge className="absolute -top-2 right-2 bg-primary">
					<CheckCircleIcon className="mr-1 size-3" weight="fill" />
					Selected
				</Badge>
			)}

			<CardHeader className="pb-2">
				<CardTitle className="text-lg">{trajectory.pathName}</CardTitle>
				<CardDescription>
					<Trans>Target:</Trans> {trajectory.targetRole}
				</CardDescription>
			</CardHeader>

			<CardContent className="space-y-4">
				<div className="flex flex-wrap gap-4 text-sm">
					{trajectory.estimatedYearsToTarget && (
						<div className="flex items-center gap-1 text-muted-foreground">
							<ClockIcon className="size-4" />
							<span>{trajectory.estimatedYearsToTarget} years</span>
						</div>
					)}
					{trajectory.successProbability && (
						<div className="flex items-center gap-1">
							<TargetIcon className="size-4 text-green-600" />
							<span className="text-green-600">{trajectory.successProbability}% success</span>
						</div>
					)}
					{trajectory.marketDemand && <Badge variant="outline">{trajectory.marketDemand} demand</Badge>}
				</div>

				{/* Mini trajectory visualization */}
				{trajectory.trajectoryPoints && trajectory.trajectoryPoints.length > 0 && (
					<div className="space-y-2">
						<div className="flex items-center justify-between">
							{trajectory.trajectoryPoints.slice(0, 4).map((point, i) => (
								<div key={point.year} className="flex flex-col items-center">
									<div
										className={cn(
											"flex size-8 items-center justify-center rounded-full font-medium text-xs",
											i === 0 ? "bg-muted text-muted-foreground" : "bg-primary/10 text-primary",
										)}
									>
										Y{point.year}
									</div>
									<span className="mt-1 text-[10px] text-muted-foreground">{point.role.split(" ")[0]}</span>
								</div>
							))}
						</div>
						<Progress value={trajectory.successProbability || 0} className="h-1" />
					</div>
				)}
			</CardContent>

			<CardFooter>
				<Button variant={isSelected ? "default" : "outline"} size="sm" className="w-full" onClick={onSelect}>
					{isSelected ? <Trans>Currently Selected</Trans> : <Trans>Select This Path</Trans>}
				</Button>
			</CardFooter>
		</Card>
	);
}

// JobMatchCard
function JobMatchCard({
	match,
	onBookmark,
	onDismiss,
}: {
	match: JobMatchData;
	onBookmark: () => void;
	onDismiss: () => void;
}) {
	if (match.isDismissed) return null;

	return (
		<Card className="transition-all hover:shadow-md">
			<CardHeader className="pb-2">
				<div className="flex items-start justify-between">
					<div>
						<CardTitle className="text-base">{match.jobTitle}</CardTitle>
						<CardDescription>
							{match.company && <span>{match.company}</span>}
							{match.company && match.location && <span> - </span>}
							{match.location && (
								<span className="flex items-center gap-1">
									<MapPinIcon className="size-3" />
									{match.location}
								</span>
							)}
						</CardDescription>
					</div>
					<div className="flex items-center gap-2">
						<Button
							variant="ghost"
							size="icon-sm"
							onClick={onBookmark}
							className={match.isBookmarked ? "text-amber-500" : ""}
						>
							<BookmarkSimpleIcon className="size-4" weight={match.isBookmarked ? "fill" : "regular"} />
						</Button>
						<Button variant="ghost" size="icon-sm" onClick={onDismiss}>
							<XCircleIcon className="size-4 text-muted-foreground" />
						</Button>
					</div>
				</div>
			</CardHeader>

			<CardContent>
				<div className="flex items-center justify-between">
					<div className="space-y-2">
						<div className="flex items-center gap-2">
							<span className={cn("font-bold text-2xl", getMatchColor(match.overallScore))}>{match.overallScore}%</span>
							<span className="text-muted-foreground text-sm">match</span>
						</div>
						{match.skillMatchScore && <Progress value={match.skillMatchScore} className="h-1.5 w-32" />}
					</div>

					<div className="flex flex-wrap gap-1">
						{match.matchedSkills?.slice(0, 3).map((skill) => (
							<Badge key={skill} variant="outline" className="bg-green-50 text-green-700 text-xs dark:bg-green-900/20">
								{skill}
							</Badge>
						))}
						{match.missingSkills && match.missingSkills.length > 0 && (
							<Badge variant="outline" className="bg-amber-50 text-amber-700 text-xs dark:bg-amber-900/20">
								+{match.missingSkills.length} to learn
							</Badge>
						)}
					</div>
				</div>
			</CardContent>
		</Card>
	);
}

// WhatIfSimulator
export function WhatIfSimulator({
	onSimulate,
	isSimulating,
}: {
	onSimulate: (input: SimulateInput) => void;
	isSimulating: boolean;
}) {
	const [pathName, setPathName] = useState("");
	const [targetRole, setTargetRole] = useState("");
	const [targetField, setTargetField] = useState("");
	const [yearsExperience, setYearsExperience] = useState([3]);
	const [skillsInput, setSkillsInput] = useState("");

	const handleSubmit = () => {
		if (!pathName.trim() || !targetRole.trim()) return;

		const skills = skillsInput
			.split(",")
			.map((s) => s.trim())
			.filter(Boolean);

		onSimulate({
			pathName: pathName.trim(),
			targetRole: targetRole.trim(),
			targetField: targetField || undefined,
			currentSkills: skills.length > 0 ? skills : undefined,
			yearsExperience: yearsExperience[0],
		});
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2 text-xl">
					<ArrowsSplitIcon className="size-6 text-purple-600" weight="duotone" />
					<Trans>What-If Scenario Simulator</Trans>
				</CardTitle>
				<CardDescription>
					<Trans>Explore different career paths and see how they might unfold based on your profile.</Trans>
				</CardDescription>
			</CardHeader>

			<CardContent className="space-y-6">
				<div className="grid gap-4 md:grid-cols-2">
					<div className="space-y-2">
						<Label>
							<Trans>Scenario Name</Trans>
						</Label>
						<Input
							value={pathName}
							onChange={(e) => setPathName(e.target.value)}
							placeholder={t`Ex: Path to Senior Developer`}
						/>
					</div>
					<div className="space-y-2">
						<Label>
							<Trans>Target Role</Trans>
						</Label>
						<Input
							value={targetRole}
							onChange={(e) => setTargetRole(e.target.value)}
							placeholder={t`Ex: HSE Manager, Data Scientist`}
						/>
					</div>
				</div>

				<div className="space-y-2">
					<Label>
						<Trans>Target Field</Trans>
					</Label>
					<Select value={targetField} onValueChange={setTargetField}>
						<SelectTrigger>
							<SelectValue placeholder={t`Select target field`} />
						</SelectTrigger>
						<SelectContent>
							{FIELDS.map((field) => (
								<SelectItem key={field.value} value={field.value}>
									{field.label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>

				<div className="space-y-4">
					<div className="flex items-center justify-between">
						<Label>
							<Trans>Your Years of Experience</Trans>
						</Label>
						<Badge variant="outline">{yearsExperience[0]} years</Badge>
					</div>
					<Slider value={yearsExperience} onValueChange={setYearsExperience} min={0} max={20} step={1} />
				</div>

				<div className="space-y-2">
					<Label>
						<Trans>Your Current Skills (comma-separated)</Trans>
					</Label>
					<Textarea
						value={skillsInput}
						onChange={(e) => setSkillsInput(e.target.value)}
						placeholder={t`Ex: Project Management, Python, Leadership, Communication`}
						rows={3}
					/>
				</div>
			</CardContent>

			<CardFooter>
				<Button
					onClick={handleSubmit}
					disabled={!pathName.trim() || !targetRole.trim() || isSimulating}
					className="w-full gap-2"
				>
					{isSimulating ? (
						<>
							<motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
								<SparkleIcon className="size-4" />
							</motion.div>
							<Trans>Simulating...</Trans>
						</>
					) : (
						<>
							<MagicWandIcon className="size-4" />
							<Trans>Run Simulation</Trans>
						</>
					)}
				</Button>
			</CardFooter>
		</Card>
	);
}

// StatisticsOverview
function StatisticsOverview({ stats }: { stats: StatisticsData | undefined }) {
	if (!stats) return null;
	return (
		<div className="grid gap-4 md:grid-cols-4">
			<Card>
				<CardContent className="flex items-center gap-4 pt-6">
					<div className="flex size-12 items-center justify-center rounded-full bg-primary/10">
						<ChartLineUpIcon className="size-6 text-primary" weight="duotone" />
					</div>
					<div>
						<p className="font-bold text-2xl">{stats.completedPredictions}</p>
						<p className="text-muted-foreground text-sm">
							<Trans>Predictions</Trans>
						</p>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardContent className="flex items-center gap-4 pt-6">
					<div className="flex size-12 items-center justify-center rounded-full bg-green-500/10">
						<BriefcaseIcon className="size-6 text-green-600" weight="duotone" />
					</div>
					<div>
						<p className="font-bold text-2xl">{stats.totalJobMatches}</p>
						<p className="text-muted-foreground text-sm">
							<Trans>Jobs Matched</Trans>
						</p>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardContent className="flex items-center gap-4 pt-6">
					<div className="flex size-12 items-center justify-center rounded-full bg-amber-500/10">
						<TargetIcon className="size-6 text-amber-600" weight="duotone" />
					</div>
					<div>
						<p className="font-bold text-2xl">{stats.averageMatchScore}%</p>
						<p className="text-muted-foreground text-sm">
							<Trans>Avg Match Score</Trans>
						</p>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardContent className="flex items-center gap-4 pt-6">
					<div className="flex size-12 items-center justify-center rounded-full bg-purple-500/10">
						<ArrowsSplitIcon className="size-6 text-purple-600" weight="duotone" />
					</div>
					<div>
						<p className="font-bold text-2xl">{stats.totalTrajectories}</p>
						<p className="text-muted-foreground text-sm">
							<Trans>Trajectories</Trans>
						</p>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}

// ===== Section-level components for main page layout =====

// HeroSection
export function HeroSection({ statistics }: { statistics: StatisticsData | undefined }) {
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
						<Trans>AI-Powered Career Intelligence</Trans>
					</span>
				</motion.div>

				<motion.h2
					className="mb-4 bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text font-bold text-3xl text-transparent tracking-tight md:text-4xl lg:text-5xl"
					initial={false}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.3 }}
				>
					<Trans>Predictive Career Matcher</Trans>
				</motion.h2>

				<motion.p
					className="mb-8 max-w-2xl text-lg text-muted-foreground"
					initial={false}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.4 }}
				>
					<Trans>
						Discover optimal career paths with AI-powered predictions. Get personalized salary projections, skill gap
						analysis, and success probability indicators.
					</Trans>
				</motion.p>

				<StatisticsOverview stats={statistics} />
			</div>
		</motion.div>
	);
}

// PredictionFormCard
export function PredictionFormCard({
	currentRole,
	setCurrentRole,
	currentField,
	setCurrentField,
	yearsExperience,
	setYearsExperience,
	educationLevel,
	setEducationLevel,
	skillsInput,
	setSkillsInput,
	isGenerating,
	onGenerate,
}: {
	currentRole: string;
	setCurrentRole: (v: string) => void;
	currentField: string;
	setCurrentField: (v: string) => void;
	yearsExperience: number[];
	setYearsExperience: (v: number[]) => void;
	educationLevel: string;
	setEducationLevel: (v: string) => void;
	skillsInput: string;
	setSkillsInput: (v: string) => void;
	isGenerating: boolean;
	onGenerate: () => void;
}) {
	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2 text-xl">
					<MagicWandIcon className="size-6 text-primary" weight="duotone" />
					<Trans>Generate New Career Prediction</Trans>
				</CardTitle>
				<CardDescription>
					<Trans>Tell us about your background and we'll predict optimal career paths for you.</Trans>
				</CardDescription>
			</CardHeader>

			<CardContent className="space-y-6">
				<div className="grid gap-4 md:grid-cols-2">
					<div className="space-y-2">
						<Label>
							<Trans>Current Role</Trans>
						</Label>
						<Input
							value={currentRole}
							onChange={(e) => setCurrentRole(e.target.value)}
							placeholder={t`Ex: Junior Developer, HSE Technician`}
						/>
					</div>
					<div className="space-y-2">
						<Label>
							<Trans>Current Field</Trans>
						</Label>
						<Select value={currentField} onValueChange={setCurrentField}>
							<SelectTrigger>
								<SelectValue placeholder={t`Select your field`} />
							</SelectTrigger>
							<SelectContent>
								{FIELDS.map((field) => (
									<SelectItem key={field.value} value={field.value}>
										{field.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				</div>

				<div className="grid gap-4 md:grid-cols-2">
					<div className="space-y-4">
						<div className="flex items-center justify-between">
							<Label>
								<Trans>Years of Experience</Trans>
							</Label>
							<Badge variant="outline">{yearsExperience[0]} years</Badge>
						</div>
						<Slider value={yearsExperience} onValueChange={setYearsExperience} min={0} max={30} step={1} />
					</div>
					<div className="space-y-2">
						<Label>
							<Trans>Education Level</Trans>
						</Label>
						<Select value={educationLevel} onValueChange={setEducationLevel}>
							<SelectTrigger>
								<SelectValue placeholder={t`Select education level`} />
							</SelectTrigger>
							<SelectContent>
								{EDUCATION_LEVELS.map((level) => (
									<SelectItem key={level.value} value={level.value}>
										{level.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				</div>

				<div className="space-y-2">
					<Label>
						<Trans>Your Skills (comma-separated)</Trans>
					</Label>
					<Textarea
						value={skillsInput}
						onChange={(e) => setSkillsInput(e.target.value)}
						placeholder={t`Ex: Project Management, Python, Safety Auditing, Communication`}
						rows={3}
					/>
				</div>
			</CardContent>

			<CardFooter>
				<Button onClick={onGenerate} disabled={isGenerating} className="w-full gap-2">
					{isGenerating ? (
						<>
							<motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
								<SparkleIcon className="size-4" />
							</motion.div>
							<Trans>Analyzing Your Profile...</Trans>
						</>
					) : (
						<>
							<MagicWandIcon className="size-4" />
							<Trans>Generate Career Predictions</Trans>
						</>
					)}
				</Button>
			</CardFooter>
		</Card>
	);
}

// PredictedPathsList
export function PredictedPathsList({
	predictedPaths,
	expandedPaths,
	onToggleExpand,
	topRecommendation,
	aiAnalysis,
}: {
	predictedPaths: PredictedCareerPath[];
	expandedPaths: Set<string>;
	onToggleExpand: (pathId: string) => void;
	topRecommendation: string | undefined | null;
	aiAnalysis: string | undefined | null;
}) {
	if (predictedPaths.length === 0) return null;

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<h3 className="flex items-center gap-2 font-semibold text-xl">
					<TargetIcon className="size-6 text-primary" weight="duotone" />
					<Trans>Your Predicted Career Paths</Trans>
				</h3>
				{aiAnalysis && (
					<Dialog>
						<DialogTrigger asChild>
							<Button variant="outline" size="sm">
								<Trans>View AI Analysis</Trans>
							</Button>
						</DialogTrigger>
						<DialogContent className="max-w-2xl">
							<DialogHeader>
								<DialogTitle>
									<Trans>AI Career Analysis</Trans>
								</DialogTitle>
							</DialogHeader>
							<div className="prose prose-sm dark:prose-invert max-h-[60vh] overflow-y-auto">
								<p>{aiAnalysis}</p>
							</div>
						</DialogContent>
					</Dialog>
				)}
			</div>

			<div className="grid gap-6 lg:grid-cols-2">
				{predictedPaths.map((path) => (
					<CareerPathCard
						key={path.id}
						path={path}
						isExpanded={expandedPaths.has(path.id)}
						onToggleExpand={() => onToggleExpand(path.id)}
						isTopRecommendation={path.id === topRecommendation}
					/>
				))}
			</div>
		</div>
	);
}

// PredictionsEmptyState
export function PredictionsEmptyState() {
	return (
		<Card className="border-dashed">
			<CardContent className="flex flex-col items-center py-12 text-center">
				<ChartLineUpIcon className="mb-4 size-12 text-muted-foreground/50" />
				<h4 className="mb-2 font-medium text-lg">
					<Trans>No Predictions Yet</Trans>
				</h4>
				<p className="mb-4 max-w-sm text-muted-foreground">
					<Trans>Fill in your profile above and generate your first career prediction.</Trans>
				</p>
			</CardContent>
		</Card>
	);
}

// JobMatchFormCard
export function JobMatchFormCard({
	jobTitle,
	setJobTitle,
	company,
	setCompany,
	industry,
	setIndustry,
	location,
	setLocation,
	jobDescription,
	setJobDescription,
	requiredSkillsInput,
	setRequiredSkillsInput,
	isPending,
	onMatch,
}: {
	jobTitle: string;
	setJobTitle: (v: string) => void;
	company: string;
	setCompany: (v: string) => void;
	industry: string;
	setIndustry: (v: string) => void;
	location: string;
	setLocation: (v: string) => void;
	jobDescription: string;
	setJobDescription: (v: string) => void;
	requiredSkillsInput: string;
	setRequiredSkillsInput: (v: string) => void;
	isPending: boolean;
	onMatch: () => void;
}) {
	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2 text-xl">
					<BriefcaseIcon className="size-6 text-green-600" weight="duotone" />
					<Trans>Match to a Specific Job</Trans>
				</CardTitle>
				<CardDescription>
					<Trans>Enter job details to see how well you match and what skills you need.</Trans>
				</CardDescription>
			</CardHeader>

			<CardContent className="space-y-6">
				<div className="grid gap-4 md:grid-cols-2">
					<div className="space-y-2">
						<Label>
							<Trans>Job Title</Trans> *
						</Label>
						<Input
							value={jobTitle}
							onChange={(e) => setJobTitle(e.target.value)}
							placeholder={t`Ex: Senior HSE Manager`}
						/>
					</div>
					<div className="space-y-2">
						<Label>
							<Trans>Company</Trans>
						</Label>
						<Input value={company} onChange={(e) => setCompany(e.target.value)} placeholder={t`Ex: OCP Group`} />
					</div>
				</div>

				<div className="grid gap-4 md:grid-cols-2">
					<div className="space-y-2">
						<Label>
							<Trans>Industry</Trans>
						</Label>
						<Select value={industry} onValueChange={setIndustry}>
							<SelectTrigger>
								<SelectValue placeholder={t`Select industry`} />
							</SelectTrigger>
							<SelectContent>
								{FIELDS.map((field) => (
									<SelectItem key={field.value} value={field.value}>
										{field.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
					<div className="space-y-2">
						<Label>
							<Trans>Location</Trans>
						</Label>
						<Input
							value={location}
							onChange={(e) => setLocation(e.target.value)}
							placeholder={t`Ex: Casablanca, Maroc`}
						/>
					</div>
				</div>

				<div className="space-y-2">
					<Label>
						<Trans>Required Skills (comma-separated)</Trans>
					</Label>
					<Textarea
						value={requiredSkillsInput}
						onChange={(e) => setRequiredSkillsInput(e.target.value)}
						placeholder={t`Ex: ISO 45001, Risk Assessment, Team Leadership`}
						rows={2}
					/>
				</div>

				<div className="space-y-2">
					<Label>
						<Trans>Job Description (optional)</Trans>
					</Label>
					<Textarea
						value={jobDescription}
						onChange={(e) => setJobDescription(e.target.value)}
						placeholder={t`Paste job description here for better matching...`}
						rows={4}
					/>
				</div>
			</CardContent>

			<CardFooter>
				<Button onClick={onMatch} disabled={!jobTitle.trim() || isPending} className="w-full gap-2">
					{isPending ? (
						<>
							<motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
								<SparkleIcon className="size-4" />
							</motion.div>
							<Trans>Analyzing Match...</Trans>
						</>
					) : (
						<>
							<TargetIcon className="size-4" />
							<Trans>Calculate Match Score</Trans>
						</>
					)}
				</Button>
			</CardFooter>
		</Card>
	);
}

// JobMatchesList
export function JobMatchesList({
	jobMatches,
	onBookmark,
	onDismiss,
}: {
	jobMatches: Array<{
		id: string;
		jobTitle: string;
		company?: string | null;
		location?: string | null;
		overallScore: number;
		skillMatchScore?: number | null;
		isBookmarked?: boolean | null;
		isDismissed?: boolean | null;
	}>;
	onBookmark: (id: string, current: boolean | null | undefined) => void;
	onDismiss: (id: string) => void;
}) {
	if (jobMatches.length === 0) {
		return (
			<Card className="border-dashed">
				<CardContent className="flex flex-col items-center py-12 text-center">
					<BriefcaseIcon className="mb-4 size-12 text-muted-foreground/50" />
					<h4 className="mb-2 font-medium text-lg">
						<Trans>No Job Matches Yet</Trans>
					</h4>
					<p className="mb-4 max-w-sm text-muted-foreground">
						<Trans>Enter job details above to see how well you match.</Trans>
					</p>
				</CardContent>
			</Card>
		);
	}

	return (
		<div className="space-y-4">
			<h3 className="flex items-center gap-2 font-semibold text-xl">
				<StackIcon className="size-6 text-primary" weight="duotone" />
				<Trans>Your Job Matches</Trans>
			</h3>

			<div className="grid gap-4 md:grid-cols-2">
				{jobMatches.map((match) => (
					<JobMatchCard
						key={match.id}
						match={{
							...match,
							isBookmarked: match.isBookmarked ?? undefined,
							isDismissed: match.isDismissed ?? undefined,
							matchedSkills: [],
							missingSkills: [],
						}}
						onBookmark={() => onBookmark(match.id, match.isBookmarked)}
						onDismiss={() => onDismiss(match.id)}
					/>
				))}
			</div>
		</div>
	);
}

// Helper to avoid `unknown && JSX` pattern with TS strict mode
function SuccessFactorsAndChallenges({
	successFactors,
	potentialChallenges,
}: {
	successFactors: unknown;
	potentialChallenges: unknown;
}) {
	const factors = Array.isArray(successFactors) ? (successFactors as string[]) : [];
	const challenges = Array.isArray(potentialChallenges) ? (potentialChallenges as string[]) : [];

	if (factors.length === 0 && challenges.length === 0) return null;

	return (
		<div className="grid gap-6 md:grid-cols-2">
			{factors.length > 0 && (
				<div className="space-y-2">
					<h4 className="flex items-center gap-2 font-medium text-sm">
						<CheckCircleIcon className="size-4 text-green-600" weight="fill" />
						<Trans>Success Factors</Trans>
					</h4>
					<ul className="space-y-1">
						{factors.map((factor, i) => (
							<li key={i} className="flex items-start gap-2 text-sm">
								<ArrowRightIcon className="mt-1 size-3 shrink-0 text-green-500" />
								<span>{factor}</span>
							</li>
						))}
					</ul>
				</div>
			)}

			{challenges.length > 0 && (
				<div className="space-y-2">
					<h4 className="flex items-center gap-2 font-medium text-sm">
						<WarningCircleIcon className="size-4 text-amber-600" />
						<Trans>Potential Challenges</Trans>
					</h4>
					<ul className="space-y-1">
						{challenges.map((challenge, i) => (
							<li key={i} className="flex items-start gap-2 text-sm">
								<ArrowRightIcon className="mt-1 size-3 shrink-0 text-amber-500" />
								<span>{challenge}</span>
							</li>
						))}
					</ul>
				</div>
			)}
		</div>
	);
}

// SelectedTrajectoryDetail
export function SelectedTrajectoryDetail({
	selectedTrajectory,
	onOpenSimulator,
}: {
	selectedTrajectory:
		| {
				id: string;
				pathName: string;
				targetRole: string;
				successProbability?: number | null;
				startingSalary?: number | null;
				projectedSalaryYear1?: number | null;
				projectedSalaryYear3?: number | null;
				projectedSalaryYear5?: number | null;
				salaryCurrency?: string | null;
				trajectoryPoints?: unknown;
				successFactors?: unknown;
				potentialChallenges?: unknown;
				aiInsights?: string | null;
		  }
		| null
		| undefined;
	onOpenSimulator: () => void;
}) {
	if (!selectedTrajectory) {
		return (
			<Card className="border-dashed">
				<CardContent className="flex flex-col items-center py-12 text-center">
					<RocketLaunchIcon className="mb-4 size-12 text-muted-foreground/50" />
					<h4 className="mb-2 font-medium text-lg">
						<Trans>No Trajectory Selected</Trans>
					</h4>
					<p className="mb-4 max-w-sm text-muted-foreground">
						<Trans>Use the What-If Simulator to create career trajectories, then select one to track.</Trans>
					</p>
					<Button onClick={onOpenSimulator} className="gap-2">
						<ArrowsSplitIcon className="size-4" />
						<Trans>Open Simulator</Trans>
					</Button>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card className="border-2 border-primary/20">
			<CardHeader>
				<div className="flex items-center justify-between">
					<div>
						<Badge className="mb-2 bg-primary">
							<CheckCircleIcon className="mr-1 size-3" weight="fill" />
							<Trans>Selected Path</Trans>
						</Badge>
						<CardTitle className="text-2xl">{selectedTrajectory.pathName}</CardTitle>
						<CardDescription>
							<Trans>Target:</Trans> {selectedTrajectory.targetRole}
						</CardDescription>
					</div>
					{selectedTrajectory.successProbability && (
						<SuccessProbabilityGauge probability={selectedTrajectory.successProbability} />
					)}
				</div>
			</CardHeader>

			<CardContent className="space-y-6">
				{/* Salary Progression */}
				{selectedTrajectory.projectedSalaryYear1 && (
					<SalaryProgressionChart
						projection={{
							current: selectedTrajectory.startingSalary || 0,
							year1: selectedTrajectory.projectedSalaryYear1,
							year3: selectedTrajectory.projectedSalaryYear3 || 0,
							year5: selectedTrajectory.projectedSalaryYear5 || 0,
							currency: selectedTrajectory.salaryCurrency || "MAD",
						}}
					/>
				)}

				{/* Timeline */}
				{(
					selectedTrajectory.trajectoryPoints as Array<{
						year: number;
						role: string;
						salary: number;
						skills: string[];
						probability: number;
						milestones: string[];
					}> | null
				)?.map((point, index) => (
					<div key={point.year} className="flex items-start gap-4">
						<div className="flex flex-col items-center">
							<div
								className={cn(
									"flex size-10 items-center justify-center rounded-full font-medium",
									index === 0 ? "bg-muted text-muted-foreground" : "bg-primary/10 text-primary",
								)}
							>
								Y{point.year}
							</div>
							{index < ((selectedTrajectory.trajectoryPoints as unknown[])?.length || 0) - 1 && (
								<div className="h-12 w-0.5 bg-border" />
							)}
						</div>
						<div className="flex-1 pb-8">
							<h4 className="font-medium">{point.role}</h4>
							<p className="text-muted-foreground text-sm">
								{formatSalary(point.salary)} - {point.probability}% probability
							</p>
							{point.skills && point.skills.length > 0 && (
								<div className="mt-2 flex flex-wrap gap-1">
									{point.skills.map((skill: string) => (
										<Badge key={skill} variant="outline" className="text-xs">
											{skill}
										</Badge>
									))}
								</div>
							)}
						</div>
					</div>
				))}

				{/* Success Factors & Challenges */}
				<SuccessFactorsAndChallenges
					successFactors={selectedTrajectory.successFactors}
					potentialChallenges={selectedTrajectory.potentialChallenges}
				/>

				{/* AI Insights */}
				{selectedTrajectory.aiInsights && (
					<div className="rounded-lg bg-primary/5 p-4">
						<h4 className="mb-2 flex items-center gap-2 font-medium text-sm">
							<SparkleIcon className="size-4 text-primary" />
							<Trans>AI Insights</Trans>
						</h4>
						<p className="text-muted-foreground text-sm">{selectedTrajectory.aiInsights}</p>
					</div>
				)}
			</CardContent>
		</Card>
	);
}

// TrajectoryGrid
export function TrajectoryGrid({
	trajectories,
	selectedTrajectoryId,
	onSelect,
	title,
}: {
	trajectories: Array<{
		id: string;
		pathName: string;
		targetRole: string;
		targetField?: string | null;
		estimatedYearsToTarget?: number | null;
		successProbability?: number | null;
		marketDemand?: string | null;
		projectedSalaryYear5?: number | null;
	}>;
	selectedTrajectoryId: string | undefined;
	onSelect: (id: string) => void;
	title: "simulated" | "all";
}) {
	if (trajectories.length === 0) return null;

	return (
		<div className="space-y-4">
			<h3 className="flex items-center gap-2 font-semibold text-xl">
				{title === "simulated" ? (
					<RocketLaunchIcon className="size-6 text-purple-600" weight="duotone" />
				) : (
					<StackIcon className="size-6 text-primary" weight="duotone" />
				)}
				{title === "simulated" ? <Trans>Your Simulated Trajectories</Trans> : <Trans>All Trajectories</Trans>}
			</h3>

			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
				{trajectories.map((trajectory) => (
					<TrajectoryCard
						key={trajectory.id}
						trajectory={
							trajectory as typeof trajectory & {
								trajectoryPoints?: Array<{ year: number; role: string; salary: number; probability: number }>;
							}
						}
						isSelected={selectedTrajectoryId === trajectory.id}
						onSelect={() => onSelect(trajectory.id)}
					/>
				))}
			</div>
		</div>
	);
}
