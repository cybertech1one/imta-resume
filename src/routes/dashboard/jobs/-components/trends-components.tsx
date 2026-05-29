import { Trans } from "@lingui/react/macro";
import {
	ArrowDownIcon,
	ArrowRightIcon,
	ArrowUpIcon,
	BookOpenIcon,
	CaretRightIcon,
	ChartBarIcon,
	ChartLineUpIcon,
	CheckCircleIcon,
	CurrencyCircleDollarIcon,
	GlobeIcon,
	GraduationCapIcon,
	LightbulbIcon,
	LightningIcon,
	MapPinIcon,
	RocketLaunchIcon,
	SparkleIcon,
	StarIcon,
	TrendUpIcon,
	UsersIcon,
	WarningCircleIcon,
} from "@phosphor-icons/react";
import { Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/utils/style";

import { fieldConfig, formatCurrency } from "./trends-config";
import type { Field, IndustryOutlook, RegionalData, SalaryTrend, SkillDemand, TrendData } from "./trends-types";

export function HeroSection({ marketOverview }: { marketOverview: TrendData[] }) {
	return (
		<motion.div
			className="relative mb-8 overflow-hidden rounded-3xl border border-primary/20 p-8 md:p-12"
			style={{
				background:
					"linear-gradient(135deg, oklch(0.65 0.18 260 / 0.15) 0%, oklch(0.6 0.2 220 / 0.1) 50%, oklch(0.7 0.15 180 / 0.08) 100%)",
			}}
			initial={false}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.6, ease: "easeOut" }}
		>
			<div className="pointer-events-none absolute inset-0 overflow-hidden">
				<motion.div
					className="absolute -top-32 -right-32 size-96 rounded-full bg-gradient-to-br from-purple-500/20 to-indigo-500/10 blur-3xl"
					animate={{
						scale: [1, 1.2, 1],
						rotate: [0, 10, 0],
						opacity: [0.5, 0.3, 0.5],
					}}
					transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
				/>
				<motion.div
					className="absolute -bottom-32 -left-32 size-96 rounded-full bg-gradient-to-tr from-blue-500/15 to-cyan-500/10 blur-3xl"
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
					<ChartLineUpIcon className="size-5 text-primary" weight="fill" />
					<span className="font-semibold text-primary text-sm uppercase tracking-wider">
						<Trans>Market Analysis</Trans>
					</span>
				</motion.div>

				<motion.h2
					className="mb-4 bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text font-bold text-3xl text-transparent tracking-tight md:text-4xl lg:text-5xl"
					initial={false}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.3 }}
				>
					<Trans>Job Market Trends</Trans>
				</motion.h2>

				<motion.p
					className="mb-8 max-w-2xl text-lg text-muted-foreground"
					initial={false}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.4 }}
				>
					<Trans>
						Decouvrez les dernieres tendances, competences recherchees et opportunites sur le marche de l'emploi
						marocain. Donnees actualisees pour guider vos choix de carriere.
					</Trans>
				</motion.p>

				<motion.div
					className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
					initial={false}
					animate={{ opacity: 1 }}
					transition={{ delay: 0.5 }}
				>
					{marketOverview.map((stat, index) => (
						<motion.div
							key={stat.label}
							initial={false}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.5 + index * 0.1 }}
						>
							<Card className="border-white/20 bg-white/50 backdrop-blur-sm dark:bg-black/20">
								<CardContent className="p-4">
									<p className="text-muted-foreground text-sm">{stat.label}</p>
									<div className="flex items-baseline gap-2">
										<p className="font-bold text-2xl">
											{stat.label.includes("DH") || stat.label.includes("median")
												? formatCurrency(stat.value)
												: stat.label.includes("Taux")
													? `${stat.value}%`
													: stat.value.toLocaleString()}
										</p>
										<Badge
											className={cn(
												"gap-1",
												stat.trend === "up" && "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
												stat.trend === "down" && "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
											)}
										>
											{stat.trend === "up" ? <ArrowUpIcon className="size-3" /> : <ArrowDownIcon className="size-3" />}
											{stat.change}%
										</Badge>
									</div>
								</CardContent>
							</Card>
						</motion.div>
					))}
				</motion.div>
			</div>
		</motion.div>
	);
}

export function FieldFilter({
	selectedField,
	setSelectedField,
}: {
	selectedField: Field | "all";
	setSelectedField: (field: Field | "all") => void;
}) {
	return (
		<div className="mb-6 flex flex-wrap gap-2">
			<Button
				variant={selectedField === "all" ? "default" : "outline"}
				size="sm"
				onClick={() => setSelectedField("all")}
				className="gap-2"
			>
				<GlobeIcon className="size-4" />
				<Trans>All sectors</Trans>
			</Button>
			{(Object.entries(fieldConfig) as [Field, (typeof fieldConfig)[Field]][]).map(([key, config]) => {
				const FieldIcon = config.icon;
				return (
					<Button
						key={key}
						variant={selectedField === key ? "default" : "outline"}
						size="sm"
						onClick={() => setSelectedField(key)}
						className="gap-2"
					>
						<FieldIcon className="size-4" />
						{config.label}
					</Button>
				);
			})}
		</div>
	);
}

export function TrendsTabsList() {
	return (
		<TabsList className="flex h-auto flex-wrap gap-2 bg-transparent p-0">
			{[
				{ value: "overview", icon: ChartBarIcon, label: "Overview" },
				{ value: "skills", icon: StarIcon, label: "Skills" },
				{ value: "salaries", icon: CurrencyCircleDollarIcon, label: "Salaries" },
				{ value: "regions", icon: MapPinIcon, label: "Regions" },
				{ value: "outlook", icon: RocketLaunchIcon, label: "Outlook" },
			].map((tab) => (
				<TabsTrigger
					key={tab.value}
					value={tab.value}
					className="gap-2 rounded-full border border-transparent bg-muted/50 px-6 py-2.5 data-[state=active]:border-primary/30 data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
				>
					<tab.icon className="size-4" />
					{tab.label}
				</TabsTrigger>
			))}
		</TabsList>
	);
}

export function OverviewTab({
	industryOutlook,
	emergingJobs,
}: {
	industryOutlook: IndustryOutlook[];
	emergingJobs: { title: string; field: Field; growth: number; description: string }[];
}) {
	return (
		<TabsContent value="overview" className="space-y-8">
			<section>
				<h3 className="mb-6 flex items-center gap-2 font-semibold text-2xl">
					<TrendUpIcon className="size-6 text-primary" weight="duotone" />
					<Trans>Industry Outlook</Trans>
				</h3>

				<div className="grid gap-6 md:grid-cols-3">
					{industryOutlook.map((industry, index) => {
						const config = fieldConfig[industry.field];
						const Icon = config.icon;
						return (
							<motion.div
								key={industry.field}
								initial={false}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: index * 0.1 }}
							>
								<Card className="h-full">
									<CardHeader>
										<div className="flex items-center justify-between">
											<div className="flex items-center gap-3">
												<div className={cn("flex size-12 items-center justify-center rounded-xl", config.color)}>
													<Icon className="size-6" weight="duotone" />
												</div>
												<div>
													<CardTitle className="text-lg">{config.label}</CardTitle>
													<CardDescription>
														<Trans>Growth</Trans>: +{industry.growthRate}%
													</CardDescription>
												</div>
											</div>
											<Badge
												className={cn(
													industry.outlook === "positive" &&
														"bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
													industry.outlook === "stable" &&
														"bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
													industry.outlook === "challenging" &&
														"bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
												)}
											>
												{industry.outlook === "positive" && <Trans>Positive</Trans>}
												{industry.outlook === "stable" && <Trans>Stable</Trans>}
												{industry.outlook === "challenging" && <Trans>Challenging</Trans>}
											</Badge>
										</div>
									</CardHeader>
									<CardContent className="space-y-4">
										<div>
											<p className="mb-2 font-medium text-sm">
												<Trans>Growth Drivers</Trans>
											</p>
											<ul className="space-y-1">
												{industry.keyDrivers.slice(0, 2).map((driver) => (
													<li key={driver} className="flex items-start gap-2 text-muted-foreground text-sm">
														<CheckCircleIcon className="mt-0.5 size-4 shrink-0 text-green-500" />
														{driver}
													</li>
												))}
											</ul>
										</div>

										<div>
											<p className="mb-2 font-medium text-sm">
												<Trans>Opportunities</Trans>
											</p>
											<div className="flex flex-wrap gap-1">
												{industry.opportunities.map((opp) => (
													<Badge key={opp} variant="outline" className="text-xs">
														{opp}
													</Badge>
												))}
											</div>
										</div>
									</CardContent>
								</Card>
							</motion.div>
						);
					})}
				</div>
			</section>

			<section>
				<h3 className="mb-6 flex items-center gap-2 font-semibold text-2xl">
					<SparkleIcon className="size-6 text-amber-500" weight="fill" />
					<Trans>Emerging Jobs</Trans>
				</h3>

				<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
					{emergingJobs.map((job, index) => {
						const config = fieldConfig[job.field];
						const Icon = config.icon;
						return (
							<motion.div
								key={job.title}
								initial={false}
								animate={{ opacity: 1, scale: 1 }}
								transition={{ delay: index * 0.05 }}
							>
								<Card className="group h-full transition-all hover:shadow-md">
									<CardContent className="p-4">
										<div className="mb-3 flex items-center justify-between">
											<Badge className={config.color}>
												<Icon className="mr-1 size-3" />
												{config.label}
											</Badge>
											<Badge className="gap-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
												<TrendUpIcon className="size-3" />+{job.growth}%
											</Badge>
										</div>
										<h4 className="mb-2 font-semibold">{job.title}</h4>
										<p className="text-muted-foreground text-sm">{job.description}</p>
									</CardContent>
								</Card>
							</motion.div>
						);
					})}
				</div>
			</section>
		</TabsContent>
	);
}

export function SkillsTab({ filteredSkills }: { filteredSkills: SkillDemand[] }) {
	return (
		<TabsContent value="skills" className="space-y-8">
			<section>
				<h3 className="mb-6 flex items-center gap-2 font-semibold text-2xl">
					<StarIcon className="size-6 text-amber-500" weight="fill" />
					<Trans>Most In-Demand Skills</Trans>
				</h3>

				<Card>
					<CardContent className="p-6">
						<div className="space-y-4">
							{filteredSkills.map((skill, index) => {
								const config = fieldConfig[skill.field];
								return (
									<motion.div
										key={skill.skill}
										initial={false}
										animate={{ opacity: 1, x: 0 }}
										transition={{ delay: index * 0.05 }}
										className="space-y-2"
									>
										<div className="flex items-center justify-between">
											<div className="flex items-center gap-3">
												<span className="font-medium text-muted-foreground text-sm">{index + 1}</span>
												<span className="font-medium">{skill.skill}</span>
												<Badge className={cn("text-xs", config.color)}>{config.label}</Badge>
											</div>
											<div className="flex items-center gap-4">
												<Badge variant="outline" className="gap-1 text-green-600 dark:text-green-400">
													<TrendUpIcon className="size-3" />+{skill.growth}%
												</Badge>
												<span className="w-12 text-right font-semibold">{skill.demand}%</span>
											</div>
										</div>
										<Progress value={skill.demand} className="h-2" />
									</motion.div>
								);
							})}
						</div>
					</CardContent>
				</Card>

				<Card className="mt-6 border-primary/30 bg-primary/5">
					<CardContent className="flex items-start gap-4 p-6">
						<div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary/10">
							<LightbulbIcon className="size-6 text-primary" weight="fill" />
						</div>
						<div>
							<h4 className="mb-2 font-semibold">
								<Trans>Advice for developing your skills</Trans>
							</h4>
							<p className="text-muted-foreground text-sm">
								<Trans>
									Focus on skills with strong growth (+15% or more). These skills will be even more in-demand in the
									coming years. Combine technical and soft skills to maximize your employability.
								</Trans>
							</p>
							{/* biome-ignore lint/suspicious/noExplicitAny: Route path not in generated route tree */}
							<Link to={"/dashboard/resources" as any}>
								<Button variant="link" className="mt-2 gap-1 p-0">
									<Trans>View available programs</Trans>
									<CaretRightIcon className="size-4" />
								</Button>
							</Link>
						</div>
					</CardContent>
				</Card>
			</section>
		</TabsContent>
	);
}

export function SalariesTab({ filteredSalaryTrends }: { filteredSalaryTrends: SalaryTrend[] }) {
	return (
		<TabsContent value="salaries" className="space-y-8">
			<section>
				<h3 className="mb-6 flex items-center gap-2 font-semibold text-2xl">
					<CurrencyCircleDollarIcon className="size-6 text-green-500" weight="duotone" />
					<Trans>Salary Trends</Trans>
				</h3>

				<div className="grid gap-4 lg:grid-cols-2">
					{filteredSalaryTrends.map((salary, index) => {
						const config = fieldConfig[salary.field];
						const Icon = config.icon;
						return (
							<motion.div
								key={salary.position}
								initial={false}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: index * 0.05 }}
							>
								<Card className="h-full transition-all hover:shadow-md">
									<CardContent className="p-4">
										<div className="mb-3 flex items-center justify-between">
											<Badge className={config.color}>
												<Icon className="mr-1 size-3" />
												{config.label}
											</Badge>
											<Badge
												className={cn(
													"gap-1",
													salary.changeFromLastYear > 0
														? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
														: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
												)}
											>
												{salary.changeFromLastYear > 0 ? (
													<ArrowUpIcon className="size-3" />
												) : (
													<ArrowDownIcon className="size-3" />
												)}
												{salary.changeFromLastYear}% vs 2024
											</Badge>
										</div>
										<h4 className="mb-3 font-semibold">{salary.position}</h4>
										<div className="space-y-2">
											<div className="flex items-center justify-between text-sm">
												<span className="text-muted-foreground">
													<Trans>Range</Trans>
												</span>
												<span>
													{formatCurrency(salary.salaryMin)} - {formatCurrency(salary.salaryMax)}
												</span>
											</div>
											<div className="flex items-center justify-between">
												<span className="text-muted-foreground text-sm">
													<Trans>Median</Trans>
												</span>
												<span className="font-bold text-green-600 text-lg dark:text-green-400">
													{formatCurrency(salary.salaryMedian)}
												</span>
											</div>
											<div className="relative mt-2 h-3 overflow-hidden rounded-full bg-muted">
												<div
													className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-green-400/50 to-green-500/50"
													style={{ width: "100%" }}
												/>
												<div
													className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-green-400 to-green-500"
													style={{
														width: `${((salary.salaryMedian - salary.salaryMin) / (salary.salaryMax - salary.salaryMin)) * 100}%`,
													}}
												/>
											</div>
										</div>
									</CardContent>
								</Card>
							</motion.div>
						);
					})}
				</div>

				<Card className="mt-6 border-2 border-green-500/30 bg-gradient-to-br from-green-500/10 to-emerald-500/5">
					<CardContent className="flex flex-col items-center py-8 text-center sm:flex-row sm:text-left">
						<div className="mb-4 flex size-16 shrink-0 items-center justify-center rounded-full bg-green-500/20 sm:mr-6 sm:mb-0">
							<CurrencyCircleDollarIcon className="size-8 text-green-500" weight="duotone" />
						</div>
						<div className="flex-1">
							<h3 className="mb-2 font-bold text-xl">
								<Trans>Calculate your potential salary</Trans>
							</h3>
							<p className="text-muted-foreground">
								<Trans>
									Utilisez notre calculateur pour estimer votre salaire selon votre experience, region et domaine.
								</Trans>
							</p>
						</div>
						{/* biome-ignore lint/suspicious/noExplicitAny: Route path not in generated route tree */}
						<Link to={"/dashboard/tools/salary-calculator" as any}>
							<Button size="lg" className="mt-4 gap-2 sm:mt-0 sm:ml-6">
								<Trans>Calculate</Trans>
								<ArrowRightIcon className="size-4" />
							</Button>
						</Link>
					</CardContent>
				</Card>
			</section>
		</TabsContent>
	);
}

export function RegionsTab({ regionalData }: { regionalData: RegionalData[] }) {
	return (
		<TabsContent value="regions" className="space-y-8">
			<section>
				<h3 className="mb-6 flex items-center gap-2 font-semibold text-2xl">
					<MapPinIcon className="size-6 text-primary" weight="duotone" />
					<Trans>Job Market by Region</Trans>
				</h3>

				<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
					{regionalData
						.sort((a, b) => b.jobs - a.jobs)
						.map((region, index) => {
							const topFieldConfig = fieldConfig[region.topField];
							const TopFieldIcon = topFieldConfig.icon;
							return (
								<motion.div
									key={region.region}
									initial={false}
									animate={{ opacity: 1, scale: 1 }}
									transition={{ delay: index * 0.05 }}
								>
									<Card
										className={cn(
											"h-full transition-all hover:shadow-md",
											index === 0 && "border-2 border-amber-500/30",
										)}
									>
										<CardContent className="p-4">
											<div className="mb-3 flex items-center justify-between">
												<div className="flex items-center gap-2">
													<MapPinIcon className="size-4 text-muted-foreground" />
													<span className="font-semibold">{region.region}</span>
												</div>
												{index === 0 && (
													<Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
														#1
													</Badge>
												)}
											</div>

											<div className="space-y-3">
												<div className="flex items-center justify-between">
													<span className="text-muted-foreground text-sm">
														<Trans>Offers</Trans>
													</span>
													<span className="font-bold text-lg">{region.jobs}</span>
												</div>
												<div className="flex items-center justify-between">
													<span className="text-muted-foreground text-sm">
														<Trans>Growth</Trans>
													</span>
													<Badge className="gap-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
														<TrendUpIcon className="size-3" />+{region.growth}%
													</Badge>
												</div>
												<div className="flex items-center justify-between">
													<span className="text-muted-foreground text-sm">
														<Trans>Average salary</Trans>
													</span>
													<span className="font-medium">{formatCurrency(region.avgSalary)}</span>
												</div>
												<div className="flex items-center justify-between">
													<span className="text-muted-foreground text-sm">
														<Trans>Leading sector</Trans>
													</span>
													<Badge className={topFieldConfig.color}>
														<TopFieldIcon className="mr-1 size-3" />
														{topFieldConfig.label}
													</Badge>
												</div>
											</div>
										</CardContent>
									</Card>
								</motion.div>
							);
						})}
				</div>

				<Card className="mt-6 border-blue-500/30 bg-blue-50/50 dark:bg-blue-950/20">
					<CardContent className="p-6">
						<div className="flex items-start gap-4">
							<div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
								<LightbulbIcon className="size-6" weight="fill" />
							</div>
							<div>
								<h4 className="mb-2 font-semibold text-blue-800 dark:text-blue-300">
									<Trans>Regional Insights</Trans>
								</h4>
								<ul className="space-y-2 text-blue-700 text-sm dark:text-blue-400">
									<li className="flex items-start gap-2">
										<CheckCircleIcon className="mt-0.5 size-4 shrink-0" weight="fill" />
										<Trans>
											Casablanca reste le hub economique avec le plus grand nombre d'opportunites, mais la concurrence y
											est aussi plus forte.
										</Trans>
									</li>
									<li className="flex items-start gap-2">
										<CheckCircleIcon className="mt-0.5 size-4 shrink-0" weight="fill" />
										<Trans>
											Tanger affiche la plus forte croissance (+22%) grace aux zones franches et a l'industrie
											automobile.
										</Trans>
									</li>
									<li className="flex items-start gap-2">
										<CheckCircleIcon className="mt-0.5 size-4 shrink-0" weight="fill" />
										<Trans>Southern regions (Laayoune, Dakhla) offer attractive remoteness bonuses.</Trans>
									</li>
								</ul>
							</div>
						</div>
					</CardContent>
				</Card>
			</section>
		</TabsContent>
	);
}

export function OutlookTab({
	selectedField,
	industryOutlook,
}: {
	selectedField: Field | "all";
	industryOutlook: IndustryOutlook[];
}) {
	return (
		<TabsContent value="outlook" className="space-y-8">
			{industryOutlook
				.filter((industry) => selectedField === "all" || industry.field === selectedField)
				.map((industry, index) => {
					const config = fieldConfig[industry.field];
					const Icon = config.icon;
					return (
						<motion.section
							key={industry.field}
							initial={false}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: index * 0.1 }}
						>
							<Card className="overflow-hidden">
								<div className={cn("h-2 w-full bg-gradient-to-r", config.gradient)} />
								<CardHeader>
									<div className="flex flex-wrap items-center justify-between gap-4">
										<div className="flex items-center gap-4">
											<div className={cn("flex size-14 items-center justify-center rounded-xl", config.color)}>
												<Icon className="size-7" weight="duotone" />
											</div>
											<div>
												<CardTitle className="text-xl">
													<Trans>{config.label} Sector</Trans>
												</CardTitle>
												<CardDescription className="flex items-center gap-2">
													<Trans>2025-2026 Outlook</Trans>
													<Badge
														className={cn(
															industry.outlook === "positive" &&
																"bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
															industry.outlook === "stable" &&
																"bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
														)}
													>
														{industry.outlook === "positive" ? <Trans>Very favorable</Trans> : <Trans>Stable</Trans>}
													</Badge>
												</CardDescription>
											</div>
										</div>
										<div className="text-center">
											<p className="font-bold text-3xl text-green-600 dark:text-green-400">+{industry.growthRate}%</p>
											<p className="text-muted-foreground text-sm">
												<Trans>Expected growth</Trans>
											</p>
										</div>
									</div>
								</CardHeader>
								<CardContent className="grid gap-6 md:grid-cols-3">
									<div>
										<h4 className="mb-3 flex items-center gap-2 font-semibold">
											<TrendUpIcon className="size-5 text-green-500" weight="fill" />
											<Trans>Growth Drivers</Trans>
										</h4>
										<ul className="space-y-2">
											{industry.keyDrivers.map((driver) => (
												<li key={driver} className="flex items-start gap-2 text-sm">
													<CheckCircleIcon className="mt-0.5 size-4 shrink-0 text-green-500" />
													{driver}
												</li>
											))}
										</ul>
									</div>

									<div>
										<h4 className="mb-3 flex items-center gap-2 font-semibold">
											<WarningCircleIcon className="size-5 text-amber-500" weight="fill" />
											<Trans>Challenges ahead</Trans>
										</h4>
										<ul className="space-y-2">
											{industry.challenges.map((challenge) => (
												<li key={challenge} className="flex items-start gap-2 text-sm">
													<WarningCircleIcon className="mt-0.5 size-4 shrink-0 text-amber-500" />
													{challenge}
												</li>
											))}
										</ul>
									</div>

									<div>
										<h4 className="mb-3 flex items-center gap-2 font-semibold">
											<LightningIcon className="size-5 text-primary" weight="fill" />
											<Trans>Opportunities</Trans>
										</h4>
										<ul className="space-y-2">
											{industry.opportunities.map((opp) => (
												<li key={opp} className="flex items-start gap-2 text-sm">
													<SparkleIcon className="mt-0.5 size-4 shrink-0 text-primary" />
													{opp}
												</li>
											))}
										</ul>
									</div>
								</CardContent>
							</Card>
						</motion.section>
					);
				})}

			<Card className="border-2 border-primary/30 bg-gradient-to-br from-primary/10 to-transparent">
				<CardContent className="p-8 text-center">
					<div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-primary/20">
						<GraduationCapIcon className="size-8 text-primary" weight="duotone" />
					</div>
					<h3 className="mb-2 font-bold text-2xl">
						<Trans>Prepare Your Future</Trans>
					</h3>
					<p className="mx-auto mb-6 max-w-lg text-muted-foreground">
						<Trans>
							Les tendances montrent une forte demande dans les trois secteurs. Investissez dans votre formation
							maintenant pour saisir les meilleures opportunites.
						</Trans>
					</p>
					<div className="flex flex-wrap justify-center gap-4">
						{/* biome-ignore lint/suspicious/noExplicitAny: Route path not in generated route tree */}
						<Link to={"/dashboard/resources" as any}>
							<Button size="lg" className="gap-2">
								<BookOpenIcon className="size-5" />
								<Trans>Explore programs</Trans>
							</Button>
						</Link>
						{/* biome-ignore lint/suspicious/noExplicitAny: Route path not in generated route tree */}
						<Link to={"/dashboard/career" as any}>
							<Button size="lg" variant="outline" className="gap-2">
								<UsersIcon className="size-5" />
								<Trans>Career assessment</Trans>
							</Button>
						</Link>
					</div>
				</CardContent>
			</Card>
		</TabsContent>
	);
}
