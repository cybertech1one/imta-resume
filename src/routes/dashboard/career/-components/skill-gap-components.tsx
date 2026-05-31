import { Trans } from "@lingui/react/macro";
import type { Icon } from "@phosphor-icons/react";
import {
	ArrowSquareOutIcon,
	BookOpenIcon,
	CaretDownIcon,
	CaretUpIcon,
	CertificateIcon,
	ChartBarIcon,
	ClockIcon,
	FireIcon,
	FlameIcon,
	GearIcon,
	GraduationCapIcon,
	LightbulbIcon,
	RocketLaunchIcon,
	SparkleIcon,
	SpinnerIcon,
	StarIcon,
	TrendUpIcon,
	UsersIcon,
} from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "motion/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { authClient } from "@/integrations/auth/client";
import { orpc } from "@/integrations/orpc/client";
import { cn } from "@/utils/style";
import { CATEGORY_CONFIG, INDUSTRY_CONFIG } from "./skill-gap-config";
import type { IndustryBenchmark, MarketDemandSkill, PrioritySkill, RadarChartGap } from "./skill-gap-types";

export function SkillsRadarChart({ gaps, size = 350 }: { gaps: Array<RadarChartGap>; size?: number }) {
	const centerX = size / 2;
	const centerY = size / 2;
	const maxRadius = size / 2 - 50;

	const displayGaps = gaps.slice(0, 8);
	const angleStep = (2 * Math.PI) / displayGaps.length;

	if (displayGaps.length === 0) {
		return (
			<div className="flex h-[350px] items-center justify-center text-muted-foreground">
				<Trans>No skills to display</Trans>
			</div>
		);
	}

	const currentPoints = displayGaps.map((gap, i) => {
		const angle = i * angleStep - Math.PI / 2;
		const radius = (gap.currentLevel / 5) * maxRadius;
		return {
			x: centerX + radius * Math.cos(angle),
			y: centerY + radius * Math.sin(angle),
		};
	});

	const requiredPoints = displayGaps.map((gap, i) => {
		const angle = i * angleStep - Math.PI / 2;
		const radius = (gap.requiredLevel / 5) * maxRadius;
		return {
			x: centerX + radius * Math.cos(angle),
			y: centerY + radius * Math.sin(angle),
		};
	});

	const benchmarkPoints = displayGaps.map((gap, i) => {
		const angle = i * angleStep - Math.PI / 2;
		const radius = (gap.industryBenchmark / 5) * maxRadius;
		return {
			x: centerX + radius * Math.cos(angle),
			y: centerY + radius * Math.sin(angle),
		};
	});

	const currentPath = `${currentPoints.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x},${p.y}`).join(" ")} Z`;
	const requiredPath = `${requiredPoints.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x},${p.y}`).join(" ")} Z`;
	const benchmarkPath = `${benchmarkPoints.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x},${p.y}`).join(" ")} Z`;

	return (
		<div className="relative">
			<svg viewBox={`0 0 ${size} ${size}`} className="size-full max-h-[350px]">
				{/* Background circles */}
				{[1, 2, 3, 4, 5].map((level) => (
					<circle
						key={level}
						cx={centerX}
						cy={centerY}
						r={(level / 5) * maxRadius}
						fill="none"
						stroke="currentColor"
						strokeOpacity="0.1"
						strokeWidth="1"
					/>
				))}

				{/* Level labels */}
				{[1, 2, 3, 4, 5].map((level) => (
					<text
						key={level}
						x={centerX + 5}
						y={centerY - (level / 5) * maxRadius + 3}
						className="fill-muted-foreground text-[10px]"
					>
						{level}
					</text>
				))}

				{/* Axis lines and labels */}
				{displayGaps.map((gap, i) => {
					const angle = i * angleStep - Math.PI / 2;
					const endX = centerX + maxRadius * Math.cos(angle);
					const endY = centerY + maxRadius * Math.sin(angle);
					const labelX = centerX + (maxRadius + 30) * Math.cos(angle);
					const labelY = centerY + (maxRadius + 30) * Math.sin(angle);
					const skillLabel = gap.skillName || gap.skillNameFr || "";

					return (
						<g key={gap.skillName}>
							<line
								x1={centerX}
								y1={centerY}
								x2={endX}
								y2={endY}
								stroke="currentColor"
								strokeOpacity="0.15"
								strokeWidth="1"
							/>
							<text
								x={labelX}
								y={labelY}
								textAnchor="middle"
								dominantBaseline="middle"
								className="fill-current font-medium text-[9px]"
							>
								{skillLabel.length > 14 ? `${skillLabel.slice(0, 14)}...` : skillLabel}
							</text>
						</g>
					);
				})}

				{/* Industry benchmark area */}
				<motion.path
					d={benchmarkPath}
					fill="oklch(0.7 0.1 200 / 0.1)"
					stroke="oklch(0.6 0.15 200)"
					strokeWidth="1"
					strokeDasharray="4 2"
					initial={false}
					animate={{ opacity: 1 }}
					transition={{ duration: 0.5, delay: 0.2 }}
				/>

				{/* Required level area */}
				<motion.path
					d={requiredPath}
					fill="oklch(0.7 0.15 30 / 0.15)"
					stroke="oklch(0.6 0.2 30)"
					strokeWidth="2"
					initial={false}
					animate={{ opacity: 1, scale: 1 }}
					transition={{ duration: 0.6, delay: 0.3 }}
				/>

				{/* Current level area */}
				<motion.path
					d={currentPath}
					fill="oklch(0.7 0.2 145 / 0.3)"
					stroke="oklch(0.5 0.25 145)"
					strokeWidth="2"
					initial={false}
					animate={{ opacity: 1, scale: 1 }}
					transition={{ duration: 0.8, delay: 0.4 }}
				/>

				{/* Current level points */}
				{currentPoints.map((point, i) => (
					<motion.circle
						key={i}
						cx={point.x}
						cy={point.y}
						r="5"
						fill="oklch(0.5 0.25 145)"
						stroke="white"
						strokeWidth="2"
						initial={false}
						animate={{ opacity: 1, scale: 1 }}
						transition={{ duration: 0.3, delay: 0.5 + i * 0.05 }}
					/>
				))}
			</svg>

			{/* Legend */}
			<div className="mt-4 flex flex-wrap justify-center gap-4 text-xs">
				<div className="flex items-center gap-2">
					<div className="size-3 rounded-full bg-green-500" />
					<span>
						<Trans>Current Level</Trans>
					</span>
				</div>
				<div className="flex items-center gap-2">
					<div className="size-3 rounded-full bg-orange-500" />
					<span>
						<Trans>Required Level</Trans>
					</span>
				</div>
				<div className="flex items-center gap-2">
					<div className="size-3 rounded-full border-2 border-sky-500 border-dashed bg-transparent" />
					<span>
						<Trans>Industry Benchmark</Trans>
					</span>
				</div>
			</div>
		</div>
	);
}

export function PrioritySkillCard({
	skill,
	onViewResources,
}: {
	skill: PrioritySkill;
	onViewResources: (skillId: string) => void;
}) {
	const CategoryIcon = CATEGORY_CONFIG[skill.category]?.icon || GearIcon;
	const impactColors = {
		high: "text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400",
		medium: "text-amber-600 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400",
		low: "text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400",
	};

	return (
		<motion.div initial={false} animate={{ opacity: 1, y: 0 }} transition={{ delay: skill.priorityRank * 0.05 }}>
			<Card className="transition-shadow hover:shadow-md">
				<CardHeader className="pb-2">
					<div className="flex items-start justify-between">
						<div className="flex items-center gap-3">
							<div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
								<span className="font-bold text-lg">#{skill.priorityRank}</span>
							</div>
							<div>
								<CardTitle className="text-base">{skill.skillName || skill.skillNameFr}</CardTitle>
								<div className="mt-1 flex items-center gap-2">
									<Badge variant="outline" className={CATEGORY_CONFIG[skill.category]?.color}>
										<CategoryIcon className="mr-1 size-3" />
										{CATEGORY_CONFIG[skill.category]?.label}
									</Badge>
									<Badge className={impactColors[skill.impactOnEmployability]}>
										{skill.impactOnEmployability === "high" ? (
											<Trans>High impact</Trans>
										) : skill.impactOnEmployability === "medium" ? (
											<Trans>Medium impact</Trans>
										) : (
											<Trans>Low impact</Trans>
										)}
									</Badge>
								</div>
							</div>
						</div>
					</div>
				</CardHeader>
				<CardContent className="space-y-4">
					{/* Progress */}
					<div className="space-y-2">
						<div className="flex justify-between text-sm">
							<span className="text-muted-foreground">
								<Trans>Progress</Trans>
							</span>
							<span className="font-medium">
								{skill.currentLevel}/{skill.targetLevel}
							</span>
						</div>
						<Progress value={(skill.currentLevel / skill.targetLevel) * 100} className="h-2" />
					</div>

					{/* Stats Grid */}
					<div className="grid grid-cols-3 gap-2 text-center">
						<div className="rounded-lg bg-muted/50 p-2">
							<div className="font-semibold text-lg">{skill.marketDemand}%</div>
							<div className="text-muted-foreground text-xs">
								<Trans>Demand</Trans>
							</div>
						</div>
						<div className="rounded-lg bg-muted/50 p-2">
							<div className="font-semibold text-lg">{skill.timeToAcquire}</div>
							<div className="text-muted-foreground text-xs">
								<Trans>Weeks</Trans>
							</div>
						</div>
						<div className="rounded-lg bg-muted/50 p-2">
							<div className="font-semibold text-lg">{skill.priorityScore}</div>
							<div className="text-muted-foreground text-xs">
								<Trans>Score</Trans>
							</div>
						</div>
					</div>

					{/* Reasons */}
					{skill.reasons.length > 0 && (
						<div className="space-y-1">
							{skill.reasons.slice(0, 2).map((reason, i) => (
								<div key={i} className="flex items-center gap-2 text-muted-foreground text-xs">
									<LightbulbIcon className="size-3 shrink-0 text-amber-500" />
									<span>{reason}</span>
								</div>
							))}
						</div>
					)}

					{/* Action */}
					<Button variant="outline" size="sm" className="w-full" onClick={() => onViewResources(skill.skillId)}>
						<BookOpenIcon className="mr-2 size-4" />
						<Trans>View resources</Trans>
					</Button>
				</CardContent>
			</Card>
		</motion.div>
	);
}

export function MarketDemandCard({ skill }: { skill: MarketDemandSkill }) {
	const hotnessConfig = {
		fire: { icon: FlameIcon, label: "On fire", color: "text-red-500" },
		hot: { icon: FireIcon, label: "Trending", color: "text-orange-500" },
		warm: { icon: TrendUpIcon, label: "In demand", color: "text-amber-500" },
		cold: { icon: ChartBarIcon, label: "Stable", color: "text-blue-500" },
	};

	const HotnessIcon = hotnessConfig[skill.hotness].icon;
	const trendIcon = skill.trend === "rising" ? CaretUpIcon : skill.trend === "declining" ? CaretDownIcon : null;

	return (
		<Card className="overflow-hidden">
			<CardHeader className="pb-2">
				<div className="flex items-start justify-between">
					<CardTitle className="text-base">{skill.skillName}</CardTitle>
					<div className={cn("flex items-center gap-1", hotnessConfig[skill.hotness].color)}>
						<HotnessIcon className="size-5" weight="fill" />
						<span className="font-medium text-xs">{hotnessConfig[skill.hotness].label}</span>
					</div>
				</div>
			</CardHeader>
			<CardContent>
				<div className="space-y-3">
					{/* Demand Score Bar */}
					<div className="space-y-1">
						<div className="flex justify-between text-sm">
							<span className="text-muted-foreground">
								<Trans>Demand score</Trans>
							</span>
							<span className="font-semibold">{skill.demandScore}%</span>
						</div>
						<div className="h-2 overflow-hidden rounded-full bg-muted">
							<motion.div
								className={cn(
									"h-full rounded-full",
									skill.demandScore > 80 ? "bg-red-500" : skill.demandScore > 60 ? "bg-orange-500" : "bg-blue-500",
								)}
								initial={{ width: 0 }}
								animate={{ width: `${skill.demandScore}%` }}
								transition={{ duration: 0.8, ease: "easeOut" }}
							/>
						</div>
					</div>

					{/* Stats */}
					<div className="grid grid-cols-2 gap-2 text-sm">
						<div className="flex items-center gap-2">
							{trendIcon && (
								<span className={skill.trend === "rising" ? "text-green-500" : "text-red-500"}>
									{trendIcon({ className: "size-4" })}
								</span>
							)}
							<span className="text-muted-foreground">
								<Trans>Growth:</Trans>
							</span>
							<span className="font-medium">+{skill.growthRate}%</span>
						</div>
						<div>
							<span className="text-muted-foreground">
								<Trans>Listings:</Trans>
							</span>{" "}
							<span className="font-medium">{skill.totalJobs.toLocaleString("fr-FR")}</span>
						</div>
						<div className="col-span-2">
							<span className="text-muted-foreground">
								<Trans>Salary premium:</Trans>
							</span>{" "}
							<span className="font-medium text-green-600">+{skill.avgSalaryPremium}%</span>
						</div>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}

export function IndustryBenchmarkCard({
	benchmark,
	isSelected,
	onSelect,
}: {
	benchmark: IndustryBenchmark;
	isSelected: boolean;
	onSelect: () => void;
}) {
	const industryConfig = INDUSTRY_CONFIG[benchmark.industry] || INDUSTRY_CONFIG.services;
	const IndustryIcon = industryConfig.icon;

	const competitionColors = {
		low: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
		medium: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
		high: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
	};

	return (
		<Card
			className={cn("cursor-pointer transition-all hover:shadow-md", isSelected && "ring-2 ring-primary")}
			onClick={onSelect}
		>
			<CardHeader className="pb-2">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-3">
						<div className={cn("flex size-10 items-center justify-center rounded-lg", industryConfig.color)}>
							<IndustryIcon className="size-5" />
						</div>
						<div>
							<CardTitle className="text-base">{benchmark.industryFr || benchmark.industry}</CardTitle>
							<CardDescription>{benchmark.totalPositions.toLocaleString("fr-FR")} positions</CardDescription>
						</div>
					</div>
					<Badge className={competitionColors[benchmark.competitionLevel]}>
						{benchmark.competitionLevel === "high" ? (
							<Trans>High competition</Trans>
						) : benchmark.competitionLevel === "medium" ? (
							<Trans>Medium competition</Trans>
						) : (
							<Trans>Low competition</Trans>
						)}
					</Badge>
				</div>
			</CardHeader>
			<CardContent>
				<div className="flex items-center gap-2 text-muted-foreground text-sm">
					<TrendUpIcon className="size-4 text-green-500" />
					<span>
						<Trans>Growth:</Trans> +{benchmark.growthRate}%
					</span>
				</div>
				<div className="mt-3">
					<div className="mb-2 font-medium text-sm">
						<Trans>Top skills:</Trans>
					</div>
					<div className="flex flex-wrap gap-1">
						{benchmark.topSkills.slice(0, 4).map((skill) => (
							<Badge key={skill.name} variant="secondary" className="text-xs">
								{skill.name}
							</Badge>
						))}
					</div>
				</div>
			</CardContent>
		</Card>
	);
}

export function ResourcesDialog({
	open,
	onOpenChange,
	skillId,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	skillId: string | null;
}) {
	const { data: session } = authClient.useSession();
	const { data: resources, isLoading } = useQuery({
		...orpc.skillGap.suggestResources.queryOptions({ input: { skillId: skillId || "" } }),
		enabled: !!session?.user && !!skillId && open,
	});

	const resourceTypeIcons: Record<string, Icon> = {
		course: GraduationCapIcon,
		certification: CertificateIcon,
		book: BookOpenIcon,
		tutorial: LightbulbIcon,
		practice: RocketLaunchIcon,
		mentorship: UsersIcon,
		video: SparkleIcon,
		article: BookOpenIcon,
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-2xl">
				<DialogHeader>
					<DialogTitle>
						<Trans>Learning resources</Trans>
					</DialogTitle>
					<DialogDescription>
						<Trans>Recommended resources to develop this skill</Trans>
					</DialogDescription>
				</DialogHeader>

				{isLoading ? (
					<div className="flex items-center justify-center py-8">
						<SpinnerIcon className="size-6 animate-spin" />
					</div>
				) : resources && resources.length > 0 ? (
					<div className="space-y-3">
						{resources.map((resource) => {
							const ResourceIcon = resourceTypeIcons[resource.type] || BookOpenIcon;
							return (
								<Card key={resource.id}>
									<CardContent className="flex items-start gap-4 p-4">
										<div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
											<ResourceIcon className="size-5 text-primary" />
										</div>
										<div className="min-w-0 flex-1">
											<div className="flex items-start justify-between gap-2">
												<div>
													<h4 className="font-medium">{resource.title || resource.titleFr}</h4>
													<p className="text-muted-foreground text-sm">{resource.platform}</p>
												</div>
												<div className="flex items-center gap-2">
													{resource.rating && (
														<div className="flex items-center gap-1 text-amber-500">
															<StarIcon className="size-4" weight="fill" />
															<span className="text-sm">{resource.rating}</span>
														</div>
													)}
													<Badge variant={resource.cost === "free" ? "default" : "secondary"} className="shrink-0">
														{resource.cost === "free" ? (
															<Trans>Free</Trans>
														) : resource.cost === "subscription" ? (
															<Trans>Subscription</Trans>
														) : (
															<Trans>Paid</Trans>
														)}
													</Badge>
												</div>
											</div>
											<div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
												{resource.duration && (
													<span className="flex items-center gap-1 text-muted-foreground">
														<ClockIcon className="size-3" />
														{resource.duration}
													</span>
												)}
												<Badge variant="outline" className="text-xs">
													{resource.difficulty === "beginner" ? (
														<Trans>Beginner</Trans>
													) : resource.difficulty === "intermediate" ? (
														<Trans>Intermediate</Trans>
													) : (
														<Trans>Advanced</Trans>
													)}
												</Badge>
												<span className="text-muted-foreground">
													<Trans>Relevance:</Trans> {resource.relevanceScore}%
												</span>
											</div>
											{resource.url && (
												<Button variant="link" size="sm" className="mt-2 h-auto p-0" asChild>
													<a href={resource.url} target="_blank" rel="noopener noreferrer">
														<Trans>View resource</Trans>
														<ArrowSquareOutIcon className="ml-1 size-3" />
													</a>
												</Button>
											)}
										</div>
									</CardContent>
								</Card>
							);
						})}
					</div>
				) : (
					<div className="py-8 text-center text-muted-foreground">
						<BookOpenIcon className="mx-auto size-12 opacity-50" />
						<p className="mt-2">
							<Trans>No resources available</Trans>
						</p>
					</div>
				)}
			</DialogContent>
		</Dialog>
	);
}
