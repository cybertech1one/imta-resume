import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import type { Icon } from "@phosphor-icons/react";
import {
	ArrowDownIcon,
	ArrowRightIcon,
	ArrowUpIcon,
	BookOpenIcon,
	BriefcaseIcon,
	BuildingsIcon,
	CaretRightIcon,
	ChartBarIcon,
	ChartLineUpIcon,
	CheckCircleIcon,
	CurrencyCircleDollarIcon,
	FireIcon,
	GlobeIcon,
	GraduationCapIcon,
	InfoIcon,
	LightbulbIcon,
	LightningIcon,
	ListBulletsIcon,
	MapPinIcon,
	MedalIcon,
	RocketLaunchIcon,
	SparkleIcon,
	StarIcon,
	TargetIcon,
	TrendUpIcon,
	UserIcon,
	UsersIcon,
	WarningIcon,
} from "@phosphor-icons/react";
import { Link } from "@tanstack/react-router";
import { motion } from "motion/react";

import { CountUp } from "@/components/animation/count-up";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/utils/style";

import { formatFieldName } from "../../-components/display-utils";
import { EXPERIENCE_LEVELS, FIELDS, formatCurrency, getHotnessColor, REGIONS, statCardColors } from "./insights-config";
import type {
	CareerProgressionStepProps,
	InsightCardProps,
	OverviewTabProps,
	PersonalizedTabProps,
	RegionalJobCardProps,
	RegionsTabProps,
	SalaryTabProps,
	SkillDemandBarProps,
	SkillsTabProps,
	StatCardProps,
	TrendNewsCardProps,
} from "./insights-types";

// =============================================================================
// STAT CARD
// =============================================================================

export function StatCard({
	title,
	value,
	suffix = "",
	icon: IconComponent,
	trend,
	changePercent,
	color,
	delay = 0,
}: StatCardProps) {
	const colors = statCardColors[color];

	return (
		<motion.div
			initial={false}
			animate={{ opacity: 1, y: 0 }}
			transition={{ delay, duration: 0.4 }}
			whileHover={{ scale: 1.02, y: -2 }}
		>
			<Card className={cn("relative overflow-hidden", colors.bg, colors.border)}>
				<CardContent className="p-5">
					<div className="flex items-start justify-between">
						<div className="flex-1">
							<p className="mb-1 font-medium text-muted-foreground text-sm">{title}</p>
							<p className={cn("font-bold text-2xl", colors.value)}>
								{typeof value === "number" ? <CountUp to={value} duration={1.5} separator="," /> : value}
								{suffix}
							</p>
							{trend && changePercent !== undefined && (
								<div className="mt-2 flex items-center gap-1">
									<Badge
										variant="secondary"
										className={cn(
											"text-xs",
											trend === "up" && "bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-400",
											trend === "down" && "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-400",
											trend === "stable" && "bg-gray-100 text-gray-700 dark:bg-gray-900/50 dark:text-gray-400",
										)}
									>
										{trend === "up" && <ArrowUpIcon className="mr-1 size-3" />}
										{trend === "down" && <ArrowDownIcon className="mr-1 size-3" />}
										{changePercent > 0 ? "+" : ""}
										{changePercent}%
									</Badge>
								</div>
							)}
						</div>
						<div className={cn("flex size-12 items-center justify-center rounded-xl", colors.icon)}>
							<IconComponent className="size-6" weight="duotone" />
						</div>
					</div>
				</CardContent>
			</Card>
		</motion.div>
	);
}

// =============================================================================
// SKILL DEMAND BAR
// =============================================================================

function SkillDemandBar({ skill, score, growth, salaryBoost }: SkillDemandBarProps) {
	return (
		<motion.div initial={false} animate={{ opacity: 1, x: 0 }} className="space-y-2">
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-2">
					<span className="font-medium text-sm">{skill}</span>
					{growth && growth > 10 && (
						<Badge variant="secondary" className="bg-green-100 text-green-700 text-xs">
							<TrendUpIcon className="mr-1 size-3" />+{growth}%
						</Badge>
					)}
				</div>
				<div className="flex items-center gap-2">
					{salaryBoost && salaryBoost > 0 && (
						<span className="text-muted-foreground text-xs">+{formatCurrency(salaryBoost)}</span>
					)}
					<span className={cn("font-semibold text-sm", getHotnessColor(score))}>{score}/100</span>
				</div>
			</div>
			<Progress value={score} className="h-2" />
		</motion.div>
	);
}

// =============================================================================
// REGIONAL JOB CARD
// =============================================================================

function RegionalJobCard({ region, jobs, growth, salary }: RegionalJobCardProps) {
	return (
		<motion.div
			initial={false}
			animate={{ opacity: 1, scale: 1 }}
			whileHover={{ scale: 1.02 }}
			className="rounded-lg border bg-card p-4 transition-shadow hover:shadow-md"
		>
			<div className="mb-3 flex items-center gap-3">
				<div className="flex size-10 items-center justify-center rounded-full bg-primary/10">
					<MapPinIcon className="size-5 text-primary" />
				</div>
				<div>
					<p className="font-semibold">{region}</p>
					<p className="text-muted-foreground text-xs">
						{jobs.toLocaleString("fr-FR")} <Trans>jobs</Trans>
					</p>
				</div>
			</div>
			<div className="grid grid-cols-2 gap-2 text-sm">
				<div>
					<p className="text-muted-foreground text-xs">
						<Trans>Growth</Trans>
					</p>
					<p className={cn("font-medium", growth > 0 ? "text-green-600" : "text-red-600")}>
						{growth > 0 ? "+" : ""}
						{growth}%
					</p>
				</div>
				<div>
					<p className="text-muted-foreground text-xs">
						<Trans>Avg Salary</Trans>
					</p>
					<p className="font-medium">{formatCurrency(salary)}</p>
				</div>
			</div>
		</motion.div>
	);
}

// =============================================================================
// CAREER PROGRESSION STEP
// =============================================================================

function CareerProgressionStep({ stage, salary, isActive }: CareerProgressionStepProps) {
	return (
		<motion.div
			initial={false}
			animate={{ opacity: 1, y: 0 }}
			className={cn(
				"relative flex items-center gap-4 rounded-lg border p-4 transition-all",
				isActive ? "border-primary bg-primary/5" : "border-border hover:border-primary/50",
			)}
		>
			<div
				className={cn(
					"flex size-12 shrink-0 items-center justify-center rounded-full",
					isActive ? "bg-primary text-primary-foreground" : "bg-muted",
				)}
			>
				{stage.level === "entry" && <GraduationCapIcon className="size-6" />}
				{stage.level === "mid" && <BriefcaseIcon className="size-6" />}
				{stage.level === "senior" && <StarIcon className="size-6" />}
				{stage.level === "lead" && <RocketLaunchIcon className="size-6" />}
			</div>
			<div className="flex-1">
				<p className="font-semibold">{stage.title}</p>
				<p className="text-muted-foreground text-sm">{stage.years}</p>
			</div>
			{salary && (
				<div className="text-right">
					<p className="font-bold text-primary">{formatCurrency(salary.median || 0)}</p>
					<p className="text-muted-foreground text-xs">
						{formatCurrency(salary.min || 0)} - {formatCurrency(salary.max || 0)}
					</p>
				</div>
			)}
		</motion.div>
	);
}

// =============================================================================
// INSIGHT CARD
// =============================================================================

function InsightCard({ icon: IconComponent, title, description, type }: InsightCardProps) {
	const bgColor =
		type === "positive"
			? "bg-green-50 dark:bg-green-950/30"
			: type === "negative"
				? "bg-red-50 dark:bg-red-950/30"
				: "bg-blue-50 dark:bg-blue-950/30";
	const iconColor = type === "positive" ? "text-green-600" : type === "negative" ? "text-red-600" : "text-blue-600";

	return (
		<motion.div
			initial={false}
			animate={{ opacity: 1, x: 0 }}
			className={cn("flex items-start gap-3 rounded-lg p-4", bgColor)}
		>
			<IconComponent className={cn("mt-0.5 size-5 shrink-0", iconColor)} weight="duotone" />
			<div>
				<p className="font-medium text-sm">{title}</p>
				<p className="mt-1 text-muted-foreground text-xs">{description}</p>
			</div>
		</motion.div>
	);
}

// =============================================================================
// TREND NEWS CARD
// =============================================================================

function TrendNewsCard({ category, title, items }: TrendNewsCardProps) {
	const iconMap: Record<string, Icon> = {
		skills: SparkleIcon,
		regions: MapPinIcon,
		employers: BuildingsIcon,
	};
	const IconComponent = iconMap[category] || ChartLineUpIcon;

	return (
		<Card>
			<CardHeader className="pb-3">
				<CardTitle className="flex items-center gap-2 text-base">
					<IconComponent className="size-5 text-primary" />
					{title}
				</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="space-y-3">
					{items.slice(0, 5).map((item, idx) => (
						<motion.div
							key={item.name}
							initial={false}
							animate={{ opacity: 1, x: 0 }}
							transition={{ delay: idx * 0.05 }}
							className="flex items-center justify-between text-sm"
						>
							<span className="font-medium">{item.name}</span>
							<div className="flex items-center gap-2">
								{item.growth && (
									<Badge variant="secondary" className="bg-green-100 text-green-700 text-xs">
										{item.growth}
									</Badge>
								)}
								{item.openPositions && (
									<Badge variant="outline" className="text-xs">
										{item.openPositions} <Trans>jobs</Trans>
									</Badge>
								)}
							</div>
						</motion.div>
					))}
				</div>
			</CardContent>
		</Card>
	);
}

// =============================================================================
// OVERVIEW TAB CONTENT
// =============================================================================

export function OverviewTabContent({
	marketOverview,
	overviewLoading,
	industryTrends,
	trendsLoading,
	itemVariants,
}: OverviewTabProps) {
	return (
		<>
			<motion.div variants={itemVariants} className="grid gap-6 lg:grid-cols-3">
				{/* Rising Skills */}
				<Card className="lg:col-span-2">
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<TrendUpIcon className="size-5 text-green-500" />
							<Trans>Rising Skills</Trans>
						</CardTitle>
						<CardDescription>
							<Trans>Skills with fastest growing demand in Morocco</Trans>
						</CardDescription>
					</CardHeader>
					<CardContent>
						{overviewLoading ? (
							<div className="space-y-4">
								{[1, 2, 3, 4, 5].map((i) => (
									<Skeleton key={i} className="h-10 w-full" />
								))}
							</div>
						) : (
							<div className="space-y-4">
								{(marketOverview?.risingSkills || []).map((skill: any) => (
									<SkillDemandBar
										key={skill.skill}
										skill={skill.skillFr || skill.skill}
										score={skill.demandScore || 0}
										growth={skill.growthPercent || undefined}
										salaryBoost={skill.salaryBoost || undefined}
									/>
								))}
							</div>
						)}
					</CardContent>
				</Card>

				{/* Top Employers */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<BuildingsIcon className="size-5 text-blue-500" />
							<Trans>Top Employers</Trans>
						</CardTitle>
						<CardDescription>
							<Trans>Companies actively hiring</Trans>
						</CardDescription>
					</CardHeader>
					<CardContent>
						{overviewLoading ? (
							<div className="space-y-3">
								{[1, 2, 3, 4, 5].map((i) => (
									<Skeleton key={i} className="h-12 w-full" />
								))}
							</div>
						) : (
							<div className="space-y-3">
								{(marketOverview?.topEmployers || []).map((employer: any, idx: number) => (
									<motion.div
										key={employer.name}
										initial={false}
										animate={{ opacity: 1, x: 0 }}
										transition={{ delay: idx * 0.05 }}
										className="flex items-center justify-between rounded-lg border p-3"
									>
										<div>
											<p className="font-medium text-sm">{employer.name}</p>
											<p className="text-muted-foreground text-xs">{employer.industry}</p>
										</div>
										<Badge variant="secondary">
											{employer.openPositions} <Trans>jobs</Trans>
										</Badge>
									</motion.div>
								))}
							</div>
						)}
					</CardContent>
					<CardFooter>
						<Button variant="ghost" className="w-full" asChild>
							<Link to="/dashboard/jobs">
								<Trans>View All Employers</Trans>
								<CaretRightIcon className="ml-2 size-4" />
							</Link>
						</Button>
					</CardFooter>
				</Card>
			</motion.div>

			{/* Industry Trends */}
			<motion.div variants={itemVariants}>
				<h2 className="mb-4 flex items-center gap-2 font-semibold text-lg">
					<FireIcon className="size-5 text-orange-500" />
					<Trans>Industry Trends</Trans>
				</h2>
				{trendsLoading ? (
					<div className="grid gap-4 md:grid-cols-3">
						{[1, 2, 3].map((i) => (
							<Skeleton key={i} className="h-48 w-full" />
						))}
					</div>
				) : (
					<div className="grid gap-4 md:grid-cols-3">
						{(industryTrends || []).map((trend: any) => (
							<TrendNewsCard key={trend.category} category={trend.category} title={trend.title} items={trend.items} />
						))}
					</div>
				)}
			</motion.div>
		</>
	);
}

// =============================================================================
// SALARY TAB CONTENT
// =============================================================================

export function SalaryTabContent({
	profileForm,
	setProfileForm,
	salaryComparison,
	salaryLoading,
	itemVariants,
}: SalaryTabProps) {
	return (
		<>
			<motion.div variants={itemVariants} className="grid gap-6 lg:grid-cols-2">
				{/* Field Filter */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<ListBulletsIcon className="size-5" />
							<Trans>Filter by Field</Trans>
						</CardTitle>
					</CardHeader>
					<CardContent>
						<Select value={profileForm.field} onValueChange={(v) => setProfileForm((p) => ({ ...p, field: v }))}>
							<SelectTrigger>
								<SelectValue placeholder={t`Select a field`} />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="">
									<Trans>All Fields</Trans>
								</SelectItem>
								{FIELDS.map((f) => (
									<SelectItem key={f.value} value={f.value}>
										{f.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</CardContent>
				</Card>

				{/* Salary Distribution */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<ChartBarIcon className="size-5 text-green-500" />
							<Trans>Salary by Field</Trans>
						</CardTitle>
					</CardHeader>
					<CardContent>
						{salaryLoading ? (
							<div className="space-y-3">
								{[1, 2, 3, 4].map((i) => (
									<Skeleton key={i} className="h-8 w-full" />
								))}
							</div>
						) : (
							<div className="space-y-4">
								{(salaryComparison?.averageByField || []).map((item: any, idx: number) => (
									<motion.div
										key={item.field}
										initial={false}
										animate={{ opacity: 1, x: 0 }}
										transition={{ delay: idx * 0.05 }}
										className="flex items-center justify-between"
									>
										<span className="font-medium">{formatFieldName(item.field)}</span>
										<span className="font-bold text-primary">{formatCurrency(item.averageSalary)}</span>
									</motion.div>
								))}
							</div>
						)}
					</CardContent>
				</Card>
			</motion.div>

			{/* Salary Benchmarks Table */}
			<motion.div variants={itemVariants}>
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<CurrencyCircleDollarIcon className="size-5 text-primary" />
							<Trans>Salary Benchmarks by Role</Trans>
						</CardTitle>
						<CardDescription>
							<Trans>Annual salary ranges in MAD</Trans>
						</CardDescription>
					</CardHeader>
					<CardContent>
						{salaryLoading ? (
							<div className="space-y-2">
								{[1, 2, 3, 4, 5].map((i) => (
									<Skeleton key={i} className="h-12 w-full" />
								))}
							</div>
						) : (
							<div className="overflow-x-auto">
								<table className="w-full text-sm">
									<thead>
										<tr className="border-b text-left">
											<th className="pb-3 font-medium">
												<Trans>Role</Trans>
											</th>
											<th className="pb-3 font-medium">
												<Trans>Field</Trans>
											</th>
											<th className="pb-3 text-right font-medium">
												<Trans>Entry</Trans>
											</th>
											<th className="pb-3 text-right font-medium">
												<Trans>Mid</Trans>
											</th>
											<th className="pb-3 text-right font-medium">
												<Trans>Senior</Trans>
											</th>
										</tr>
									</thead>
									<tbody>
										{(salaryComparison?.roles || []).slice(0, 10).map((role: any, idx: number) => (
											<motion.tr
												key={role.role}
												initial={false}
												animate={{ opacity: 1 }}
												transition={{ delay: idx * 0.03 }}
												className="border-b last:border-0"
											>
												<td className="py-3 font-medium">{role.roleFr || role.role}</td>
												<td className="py-3">
													<Badge variant="outline">{formatFieldName(role.field)}</Badge>
												</td>
												<td className="py-3 text-right">
													{role.levels.entry?.median ? formatCurrency(role.levels.entry.median) : "-"}
												</td>
												<td className="py-3 text-right">
													{role.levels.mid?.median ? formatCurrency(role.levels.mid.median) : "-"}
												</td>
												<td className="py-3 text-right font-semibold text-primary">
													{role.levels.senior?.median ? formatCurrency(role.levels.senior.median) : "-"}
												</td>
											</motion.tr>
										))}
									</tbody>
								</table>
							</div>
						)}
					</CardContent>
				</Card>
			</motion.div>
		</>
	);
}

// =============================================================================
// SKILLS TAB CONTENT
// =============================================================================

export function SkillsTabContent({ topSkills, skillsLoading, itemVariants }: SkillsTabProps) {
	return (
		<motion.div variants={itemVariants} className="grid gap-6 lg:grid-cols-2">
			{/* Top In-Demand Skills */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<StarIcon className="size-5 text-amber-500" />
						<Trans>Top In-Demand Skills</Trans>
					</CardTitle>
					<CardDescription>
						<Trans>Skills employers are actively seeking</Trans>
					</CardDescription>
				</CardHeader>
				<CardContent>
					{skillsLoading ? (
						<div className="space-y-4">
							{[1, 2, 3, 4, 5].map((i) => (
								<Skeleton key={i} className="h-10 w-full" />
							))}
						</div>
					) : (
						<div className="space-y-4">
							{(topSkills || []).slice(0, 8).map((skill: any) => (
								<SkillDemandBar
									key={skill.id}
									skill={skill.skillFr || skill.skill}
									score={skill.demandScore || 0}
									growth={skill.growthPercent || undefined}
									salaryBoost={skill.averageSalaryBoost || undefined}
								/>
							))}
						</div>
					)}
				</CardContent>
			</Card>

			{/* Skills by Category */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<BookOpenIcon className="size-5 text-blue-500" />
						<Trans>Skills by Category</Trans>
					</CardTitle>
				</CardHeader>
				<CardContent>
					{skillsLoading ? (
						<div className="space-y-4">
							{[1, 2, 3, 4].map((i) => (
								<Skeleton key={i} className="h-20 w-full" />
							))}
						</div>
					) : (
						<div className="space-y-6">
							{["technical", "certification", "soft", "language"].map((category) => {
								const categorySkills = (topSkills || []).filter((s: any) => s.category === category);
								if (categorySkills.length === 0) return null;

								return (
									<div key={category}>
										<h4 className="mb-2 flex items-center gap-2 font-medium text-sm capitalize">
											{category === "technical" && <LightningIcon className="size-4 text-blue-500" />}
											{category === "certification" && <MedalIcon className="size-4 text-purple-500" />}
											{category === "soft" && <UsersIcon className="size-4 text-green-500" />}
											{category === "language" && <GlobeIcon className="size-4 text-orange-500" />}
											{category === "technical"
												? t`Technical Skills`
												: category === "certification"
													? t`Certifications`
													: category === "soft"
														? t`Soft Skills`
														: t`Languages`}
										</h4>
										<div className="flex flex-wrap gap-2">
											{categorySkills.slice(0, 5).map((skill: any) => (
												<Badge key={skill.id} variant="secondary">
													{skill.skillFr || skill.skill}
												</Badge>
											))}
										</div>
									</div>
								);
							})}
						</div>
					)}
				</CardContent>
			</Card>
		</motion.div>
	);
}

// =============================================================================
// REGIONS TAB CONTENT
// =============================================================================

export function RegionsTabContent({ regions, regionsLoading, itemVariants }: RegionsTabProps) {
	return (
		<>
			<motion.div variants={itemVariants}>
				<Card className="mb-6">
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<MapPinIcon className="size-5 text-primary" />
							<Trans>Job Market by Region</Trans>
						</CardTitle>
						<CardDescription>
							<Trans>Employment opportunities across Morocco</Trans>
						</CardDescription>
					</CardHeader>
					<CardContent>
						{regionsLoading ? (
							<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
								{[1, 2, 3, 4, 5, 6].map((i) => (
									<Skeleton key={i} className="h-32 w-full" />
								))}
							</div>
						) : (
							<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
								{(regions || []).map((region: any) => (
									<RegionalJobCard
										key={region.id}
										region={region.regionFr || region.region}
										jobs={region.totalJobs || 0}
										growth={region.jobGrowth || 0}
										salary={region.averageSalary || 0}
									/>
								))}
							</div>
						)}
					</CardContent>
				</Card>
			</motion.div>

			{/* Regional Comparison Table */}
			<motion.div variants={itemVariants}>
				<Card>
					<CardHeader>
						<CardTitle>
							<Trans>Regional Comparison</Trans>
						</CardTitle>
					</CardHeader>
					<CardContent>
						{regionsLoading ? (
							<Skeleton className="h-64 w-full" />
						) : (
							<div className="overflow-x-auto">
								<table className="w-full text-sm">
									<thead>
										<tr className="border-b text-left">
											<th className="pb-3 font-medium">
												<Trans>Region</Trans>
											</th>
											<th className="pb-3 text-right font-medium">
												<Trans>Jobs</Trans>
											</th>
											<th className="pb-3 text-right font-medium">
												<Trans>Growth</Trans>
											</th>
											<th className="pb-3 text-right font-medium">
												<Trans>Avg Salary</Trans>
											</th>
											<th className="pb-3 text-right font-medium">
												<Trans>Cost of Living</Trans>
											</th>
										</tr>
									</thead>
									<tbody>
										{(regions || []).map((region: any, idx: number) => (
											<motion.tr
												key={region.id}
												initial={false}
												animate={{ opacity: 1 }}
												transition={{ delay: idx * 0.05 }}
												className="border-b last:border-0"
											>
												<td className="py-3 font-medium">{region.regionFr || region.region}</td>
												<td className="py-3 text-right">{(region.totalJobs || 0).toLocaleString("fr-FR")}</td>
												<td className="py-3 text-right">
													<Badge
														variant="secondary"
														className={cn(
															"text-xs",
															(region.jobGrowth || 0) > 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700",
														)}
													>
														{(region.jobGrowth || 0) > 0 ? "+" : ""}
														{region.jobGrowth}%
													</Badge>
												</td>
												<td className="py-3 text-right font-semibold">{formatCurrency(region.averageSalary || 0)}</td>
												<td className="py-3 text-right capitalize">{region.costOfLiving || "-"}</td>
											</motion.tr>
										))}
									</tbody>
								</table>
							</div>
						)}
					</CardContent>
				</Card>
			</motion.div>
		</>
	);
}

// =============================================================================
// PERSONALIZED TAB CONTENT
// =============================================================================

export function PersonalizedTabContent({
	profileForm,
	setProfileForm,
	skillInput,
	setSkillInput,
	handleAddSkill,
	handleRemoveSkill,
	handleGetPersonalizedInsights,
	personalizedInsights,
	careerProgression,
	progressionLoading,
	itemVariants,
}: PersonalizedTabProps) {
	return (
		<>
			<motion.div variants={itemVariants} className="grid gap-6 lg:grid-cols-3">
				{/* Profile Form */}
				<Card className="lg:col-span-1">
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<UserIcon className="size-5" />
							<Trans>Your Profile</Trans>
						</CardTitle>
						<CardDescription>
							<Trans>Tell us about yourself for personalized insights</Trans>
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="space-y-2">
							<Label>
								<Trans>Field</Trans>
							</Label>
							<Select value={profileForm.field} onValueChange={(v) => setProfileForm((p) => ({ ...p, field: v }))}>
								<SelectTrigger>
									<SelectValue placeholder={t`Select field`} />
								</SelectTrigger>
								<SelectContent>
									{FIELDS.map((f) => (
										<SelectItem key={f.value} value={f.value}>
											{f.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						<div className="space-y-2">
							<Label>
								<Trans>Experience Level</Trans>
							</Label>
							<Select
								value={profileForm.experienceLevel}
								onValueChange={(v) => setProfileForm((p) => ({ ...p, experienceLevel: v }))}
							>
								<SelectTrigger>
									<SelectValue placeholder={t`Select level`} />
								</SelectTrigger>
								<SelectContent>
									{EXPERIENCE_LEVELS.map((l) => (
										<SelectItem key={l.value} value={l.value}>
											{l.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						<div className="space-y-2">
							<Label>
								<Trans>Region</Trans>
							</Label>
							<Select value={profileForm.region} onValueChange={(v) => setProfileForm((p) => ({ ...p, region: v }))}>
								<SelectTrigger>
									<SelectValue placeholder={t`Select region`} />
								</SelectTrigger>
								<SelectContent>
									{REGIONS.map((r) => (
										<SelectItem key={r.value} value={r.value}>
											{r.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						<div className="space-y-2">
							<Label>
								<Trans>Target Salary (MAD/year)</Trans>
							</Label>
							<Input
								type="number"
								placeholder="e.g., 100000"
								value={profileForm.targetSalary || ""}
								onChange={(e) => setProfileForm((p) => ({ ...p, targetSalary: Number(e.target.value) }))}
							/>
						</div>

						<div className="space-y-2">
							<Label>
								<Trans>Your Skills</Trans>
							</Label>
							<div className="flex gap-2">
								<Input
									placeholder={t`Add a skill`}
									value={skillInput}
									onChange={(e) => setSkillInput(e.target.value)}
									onKeyDown={(e) => e.key === "Enter" && handleAddSkill()}
								/>
								<Button type="button" variant="outline" onClick={handleAddSkill}>
									<Trans>Add</Trans>
								</Button>
							</div>
							{profileForm.skills.length > 0 && (
								<div className="mt-2 flex flex-wrap gap-2">
									{profileForm.skills.map((skill) => (
										<Badge
											key={skill}
											variant="secondary"
											className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
											onClick={() => handleRemoveSkill(skill)}
										>
											{skill} x
										</Badge>
									))}
								</div>
							)}
						</div>
					</CardContent>
					<CardFooter>
						<Button
							className="w-full"
							onClick={handleGetPersonalizedInsights}
							disabled={personalizedInsights.isPending || (!profileForm.skills.length && !profileForm.field)}
						>
							{personalizedInsights.isPending ? (
								<Trans>Analyzing...</Trans>
							) : (
								<>
									<SparkleIcon className="mr-2 size-4" />
									<Trans>Get Personalized Insights</Trans>
								</>
							)}
						</Button>
					</CardFooter>
				</Card>

				{/* Insights Results */}
				<Card className="lg:col-span-2">
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<LightbulbIcon className="size-5 text-amber-500" />
							<Trans>Your Career Insights</Trans>
						</CardTitle>
					</CardHeader>
					<CardContent>
						{personalizedInsights.data ? (
							<div className="space-y-6">
								{/* Salary Position */}
								{personalizedInsights.data.salaryPosition.marketMedian > 0 && (
									<div>
										<h3 className="mb-3 flex items-center gap-2 font-semibold">
											<CurrencyCircleDollarIcon className="size-5 text-green-500" />
											<Trans>Salary Position</Trans>
										</h3>
										<div className="rounded-lg border p-4">
											<div className="mb-4 flex items-center justify-between">
												<div>
													<p className="text-muted-foreground text-sm">
														<Trans>Your Target</Trans>
													</p>
													<p className="font-bold text-xl">
														{formatCurrency(personalizedInsights.data.salaryPosition.userTarget)}
													</p>
												</div>
												<div className="text-right">
													<p className="text-muted-foreground text-sm">
														<Trans>Market Median</Trans>
													</p>
													<p className="font-bold text-primary text-xl">
														{formatCurrency(personalizedInsights.data.salaryPosition.marketMedian)}
													</p>
												</div>
											</div>
											<Badge
												variant="secondary"
												className={cn(
													"text-sm",
													personalizedInsights.data.salaryPosition.position === "above"
														? "bg-green-100 text-green-700"
														: personalizedInsights.data.salaryPosition.position === "below"
															? "bg-orange-100 text-orange-700"
															: "bg-blue-100 text-blue-700",
												)}
											>
												{personalizedInsights.data.salaryPosition.position === "above"
													? t`Above Market (+${formatCurrency(personalizedInsights.data.salaryPosition.difference)})`
													: personalizedInsights.data.salaryPosition.position === "below"
														? t`Below Market (${formatCurrency(personalizedInsights.data.salaryPosition.difference)})`
														: t`At Market Rate`}
											</Badge>
										</div>
									</div>
								)}

								{/* Skill Gaps */}
								{personalizedInsights.data.skillGaps.length > 0 && (
									<div>
										<h3 className="mb-3 flex items-center gap-2 font-semibold">
											<WarningIcon className="size-5 text-orange-500" />
											<Trans>Skills to Develop</Trans>
										</h3>
										<div className="space-y-2">
											{personalizedInsights.data.skillGaps.map((gap: any) => (
												<InsightCard
													key={gap.skill}
													icon={SparkleIcon}
													title={gap.skill}
													description={t`Demand score: ${gap.demandScore}/100 | Potential salary boost: +${formatCurrency(gap.salaryBoost)}`}
													type="neutral"
												/>
											))}
										</div>
									</div>
								)}

								{/* Recommended Skills */}
								{personalizedInsights.data.recommendedSkills.length > 0 && (
									<div>
										<h3 className="mb-3 flex items-center gap-2 font-semibold">
											<CheckCircleIcon className="size-5 text-green-500" />
											<Trans>Recommended Skills</Trans>
										</h3>
										<div className="space-y-2">
											{personalizedInsights.data.recommendedSkills.map((rec: any) => (
												<InsightCard
													key={rec.skill}
													icon={TrendUpIcon}
													title={rec.skillFr || rec.skill}
													description={`${rec.reason} | +${formatCurrency(rec.salaryBoost)}`}
													type="positive"
												/>
											))}
										</div>
									</div>
								)}

								{/* Career Advice */}
								{personalizedInsights.data.careerAdvice.length > 0 && (
									<div>
										<h3 className="mb-3 flex items-center gap-2 font-semibold">
											<LightbulbIcon className="size-5 text-amber-500" />
											<Trans>Career Advice</Trans>
										</h3>
										<div className="space-y-2">
											{personalizedInsights.data.careerAdvice.map((advice: any, idx: number) => (
												<InsightCard
													key={idx}
													icon={InfoIcon}
													title={t`Recommendation ${idx + 1}`}
													description={advice}
													type="neutral"
												/>
											))}
										</div>
									</div>
								)}

								{/* Market Trends */}
								{personalizedInsights.data.marketTrends.length > 0 && (
									<div>
										<h3 className="mb-3 flex items-center gap-2 font-semibold">
											<ChartLineUpIcon className="size-5 text-blue-500" />
											<Trans>Market Trends</Trans>
										</h3>
										<div className="space-y-2">
											{personalizedInsights.data.marketTrends.map((trend: any, idx: number) => (
												<InsightCard
													key={idx}
													icon={
														trend.impact === "positive"
															? ArrowUpIcon
															: trend.impact === "negative"
																? ArrowDownIcon
																: ArrowRightIcon
													}
													title={trend.trend}
													description=""
													type={trend.impact}
												/>
											))}
										</div>
									</div>
								)}
							</div>
						) : (
							<div className="flex flex-col items-center justify-center py-12 text-center">
								<TargetIcon className="mb-4 size-16 text-muted-foreground/30" />
								<p className="font-medium text-muted-foreground">
									<Trans>Fill in your profile to get personalized insights</Trans>
								</p>
								<p className="mt-1 text-muted-foreground/70 text-sm">
									<Trans>We'll analyze your skills against market demand and provide tailored recommendations</Trans>
								</p>
							</div>
						)}
					</CardContent>
				</Card>
			</motion.div>

			{/* Career Progression */}
			{profileForm.field && (
				<motion.div variants={itemVariants}>
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<RocketLaunchIcon className="size-5 text-purple-500" />
								<Trans>Career Progression Timeline</Trans>
							</CardTitle>
							<CardDescription>
								<Trans>Typical career path and salary progression in your field</Trans>
							</CardDescription>
						</CardHeader>
						<CardContent>
							{progressionLoading ? (
								<div className="space-y-4">
									{[1, 2, 3, 4].map((i) => (
										<Skeleton key={i} className="h-20 w-full" />
									))}
								</div>
							) : (
								<div className="space-y-4">
									{(careerProgression?.progression || []).map((stage: any) => (
										<CareerProgressionStep
											key={stage.level}
											stage={stage}
											salary={stage.salary}
											isActive={stage.level === profileForm.experienceLevel}
										/>
									))}
								</div>
							)}
						</CardContent>
					</Card>
				</motion.div>
			)}
		</>
	);
}
