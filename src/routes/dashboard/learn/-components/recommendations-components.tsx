import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import {
	ArrowRightIcon,
	BookOpenIcon,
	BrainIcon,
	CalendarIcon,
	CheckCircleIcon,
	ClockIcon,
	FireIcon,
	GraduationCapIcon,
	LightbulbIcon,
	PlayIcon,
	RocketLaunchIcon,
	SparkleIcon,
	StarIcon,
	TargetIcon,
	TrendUpIcon,
	TrophyIcon,
	UsersIcon,
} from "@phosphor-icons/react";
import { Link } from "@tanstack/react-router";
import { motion } from "motion/react";

import { StarRating } from "@/components/shared/star-rating";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/utils/style";

import { DIFFICULTY_CONFIG, RESOURCE_TYPE_CONFIG, STATUS_CONFIG } from "./recommendations-config";
import type { DifficultyLevel, LearningResource, ResourceCompletion, ResourceType } from "./recommendations-types";
import { formatDuration, getReasonIcon } from "./recommendations-utils";

export function LoadingSkeleton() {
	return (
		<div className="space-y-8">
			<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
				{[1, 2, 3, 4].map((i) => (
					<Card key={i}>
						<CardContent className="p-6">
							<Skeleton className="mb-4 h-10 w-10 rounded-xl" />
							<Skeleton className="mb-2 h-4 w-24" />
							<Skeleton className="h-2 w-full" />
						</CardContent>
					</Card>
				))}
			</div>
			<Card>
				<CardHeader>
					<Skeleton className="h-6 w-48" />
				</CardHeader>
				<CardContent>
					<div className="space-y-4">
						{[1, 2, 3].map((i) => (
							<Skeleton key={i} className="h-24 w-full" />
						))}
					</div>
				</CardContent>
			</Card>
		</div>
	);
}

function RadialProgressChart({
	progress,
	size = 100,
	strokeWidth = 8,
	label,
}: {
	progress: number;
	size?: number;
	strokeWidth?: number;
	label?: string;
}) {
	const radius = (size - strokeWidth) / 2;
	const circumference = 2 * Math.PI * radius;
	const offset = circumference - (progress / 100) * circumference;

	return (
		<div className="relative" style={{ width: size, height: size }}>
			<svg viewBox={`0 0 ${size} ${size}`} className="rotate-[-90deg]">
				<circle
					cx={size / 2}
					cy={size / 2}
					r={radius}
					fill="none"
					stroke="currentColor"
					strokeWidth={strokeWidth}
					className="text-muted/30"
				/>
				<motion.circle
					cx={size / 2}
					cy={size / 2}
					r={radius}
					fill="none"
					stroke="currentColor"
					strokeWidth={strokeWidth}
					strokeLinecap="round"
					strokeDasharray={circumference}
					initial={{ strokeDashoffset: circumference }}
					animate={{ strokeDashoffset: offset }}
					transition={{ duration: 1, ease: "easeOut" }}
					className="text-primary"
				/>
			</svg>
			<div className="absolute inset-0 flex flex-col items-center justify-center">
				<span className="font-bold text-xl">{progress}%</span>
				{label && <span className="text-muted-foreground text-xs">{label}</span>}
			</div>
		</div>
	);
}

function ResourceCard({
	resource,
	completion,
	onStart,
	onContinue,
	isRecommendation = false,
	score,
	reason,
}: {
	resource: LearningResource;
	completion?: ResourceCompletion;
	onStart: () => void;
	onContinue: () => void;
	isRecommendation?: boolean;
	score?: number;
	reason?: string;
}) {
	const typeConfig = RESOURCE_TYPE_CONFIG[resource.resourceType];
	const difficultyConfig = DIFFICULTY_CONFIG[resource.difficulty];
	const TypeIcon = typeConfig.icon;
	const ReasonIcon = reason ? getReasonIcon(reason) : LightbulbIcon;

	const status = completion?.status ?? "not_started";
	const progress = completion?.progress ?? 0;
	const statusConfig = STATUS_CONFIG[status];

	return (
		<motion.div initial={false} animate={{ opacity: 1, y: 0 }} className="group">
			<Card
				className={cn(
					"h-full transition-all duration-300 hover:-translate-y-1 hover:shadow-lg",
					status === "completed" && "border-green-500/50",
					isRecommendation && "border-primary/30",
				)}
			>
				<CardContent className="p-5">
					<div className="mb-4 flex items-start justify-between gap-3">
						<div className={cn("rounded-xl p-2.5", typeConfig.color)}>
							<TypeIcon className="size-5" weight="duotone" />
						</div>
						<div className="flex flex-wrap gap-1.5">
							{resource.isFeatured && (
								<Badge variant="secondary" className="gap-1">
									<SparkleIcon className="size-3" weight="fill" />
									<Trans>Featured</Trans>
								</Badge>
							)}
							{isRecommendation && score && (
								<Tooltip>
									<TooltipTrigger>
										<Badge className="gap-1 bg-primary/10 text-primary">
											<ReasonIcon className="size-3" />
											{Math.round(score * 100)}%
										</Badge>
									</TooltipTrigger>
									<TooltipContent>
										<Trans>Match score based on your skill gaps</Trans>
									</TooltipContent>
								</Tooltip>
							)}
						</div>
					</div>

					<h4 className="mb-1 line-clamp-2 font-semibold group-hover:text-primary">{resource.title}</h4>
					{resource.description ? (
						<p className="mb-3 line-clamp-2 text-muted-foreground text-sm">{resource.description}</p>
					) : null}

					<div className="mb-4 flex flex-wrap items-center gap-2">
						<Badge variant="outline" className={cn("text-xs", difficultyConfig.color)}>
							{difficultyConfig.label}
						</Badge>
						{resource.durationMinutes && (
							<span className="flex items-center gap-1 text-muted-foreground text-xs">
								<ClockIcon className="size-3" />
								{formatDuration(resource.durationMinutes)}
							</span>
						)}
						{resource.provider && <span className="text-muted-foreground text-xs">{resource.provider}</span>}
					</div>

					{resource.rating && (
						<div className="mb-4 flex items-center gap-2">
							<StarRating rating={resource.rating} size="small" />
							<span className="text-muted-foreground text-xs">({resource.totalRatings ?? 0} reviews)</span>
						</div>
					)}

					{status !== "not_started" && (
						<div className="mb-4 space-y-1.5">
							<div className="flex items-center justify-between text-xs">
								<span className={cn("flex items-center gap-1", statusConfig.color)}>
									<statusConfig.icon className="size-3" />
									{statusConfig.label}
								</span>
								<span className="font-medium">{progress}%</span>
							</div>
							<Progress value={progress} className="h-1.5" />
						</div>
					)}

					<div className="flex gap-2">
						{status === "not_started" ? (
							<Button onClick={onStart} className="w-full gap-2" size="sm">
								<PlayIcon className="size-4" />
								<Trans>Start</Trans>
							</Button>
						) : status === "in_progress" ? (
							<Button onClick={onContinue} className="w-full gap-2" size="sm">
								<ArrowRightIcon className="size-4" />
								<Trans>Continue</Trans>
							</Button>
						) : (
							<Button variant="outline" className="w-full gap-2" size="sm" disabled>
								<CheckCircleIcon className="size-4" />
								<Trans>Completed</Trans>
							</Button>
						)}
					</div>
				</CardContent>
			</Card>
		</motion.div>
	);
}

export function HeroSection({
	statistics,
}: {
	statistics:
		| {
				totalResourcesStarted?: number;
				completedResources?: number;
				currentStreak?: number;
				totalTimeSpentMinutes?: number;
		  }
		| undefined;
}) {
	return (
		<motion.div
			className="relative mb-8 overflow-hidden rounded-3xl border border-primary/20 p-8 md:p-12"
			style={{
				background:
					"linear-gradient(135deg, oklch(0.7 0.15 280 / 0.15) 0%, oklch(0.6 0.2 240 / 0.1) 50%, oklch(0.65 0.18 200 / 0.08) 100%)",
			}}
			initial={false}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.6 }}
		>
			<div className="pointer-events-none absolute inset-0 overflow-hidden">
				<motion.div
					className="absolute -top-32 -right-32 size-96 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/10 blur-3xl"
					animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.3, 0.5] }}
					transition={{ duration: 10, repeat: Infinity }}
				/>
				<motion.div
					className="absolute -bottom-32 -left-32 size-96 rounded-full bg-gradient-to-tr from-blue-500/15 to-cyan-500/10 blur-3xl"
					animate={{ scale: [1.2, 1, 1.2], opacity: [0.3, 0.5, 0.3] }}
					transition={{ duration: 10, repeat: Infinity }}
				/>
			</div>

			<div className="relative z-10">
				<motion.div
					className="mb-3 flex items-center gap-2"
					initial={false}
					animate={{ opacity: 1, x: 0 }}
					transition={{ delay: 0.2 }}
				>
					<BrainIcon className="size-5 text-primary" weight="fill" />
					<span className="font-semibold text-primary text-sm uppercase tracking-wider">
						<Trans>AI-Powered Learning</Trans>
					</span>
				</motion.div>

				<motion.h2
					className="mb-4 bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text font-bold text-3xl text-transparent tracking-tight md:text-4xl lg:text-5xl"
					initial={false}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.3 }}
				>
					<Trans>Personalized Learning Path</Trans>
				</motion.h2>

				<motion.p
					className="mb-8 max-w-2xl text-lg text-muted-foreground"
					initial={false}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.4 }}
				>
					<Trans>
						Discover courses, tutorials, and certifications tailored to your skill gaps and career goals. Our AI
						analyzes your profile to recommend the most relevant learning resources.
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
							<BookOpenIcon className="size-5 text-primary" weight="duotone" />
						</div>
						<div>
							<p className="font-bold text-xl">{statistics?.totalResourcesStarted ?? 0}</p>
							<p className="text-muted-foreground text-sm">
								<Trans>Resources</Trans>
							</p>
						</div>
					</div>
					<div className="flex items-center gap-2">
						<div className="flex size-10 items-center justify-center rounded-full bg-green-500/10">
							<CheckCircleIcon className="size-5 text-green-500" weight="duotone" />
						</div>
						<div>
							<p className="font-bold text-xl">{statistics?.completedResources ?? 0}</p>
							<p className="text-muted-foreground text-sm">
								<Trans>Completed</Trans>
							</p>
						</div>
					</div>
					<div className="flex items-center gap-2">
						<div className="flex size-10 items-center justify-center rounded-full bg-amber-500/10">
							<FireIcon className="size-5 text-amber-500" weight="duotone" />
						</div>
						<div>
							<p className="font-bold text-xl">{statistics?.currentStreak ?? 0}</p>
							<p className="text-muted-foreground text-sm">
								<Trans>Day Streak</Trans>
							</p>
						</div>
					</div>
					<div className="flex items-center gap-2">
						<div className="flex size-10 items-center justify-center rounded-full bg-purple-500/10">
							<ClockIcon className="size-5 text-purple-500" weight="duotone" />
						</div>
						<div>
							<p className="font-bold text-xl">{formatDuration(statistics?.totalTimeSpentMinutes ?? 0)}</p>
							<p className="text-muted-foreground text-sm">
								<Trans>Time Invested</Trans>
							</p>
						</div>
					</div>
				</motion.div>
			</div>
		</motion.div>
	);
}

export function ContinueLearningSection({
	inProgressResources,
	onStart,
	onContinue,
}: {
	inProgressResources: ResourceCompletion[];
	onStart: (resourceId: string) => void;
	onContinue: (resourceId: string, url?: string | null) => void;
}) {
	if (inProgressResources.length === 0) return null;

	return (
		<section className="mb-8">
			<div className="mb-4 flex items-center justify-between">
				<h3 className="flex items-center gap-2 font-semibold text-xl">
					<RocketLaunchIcon className="size-5 text-primary" weight="duotone" />
					<Trans>Continue Learning</Trans>
				</h3>
			</div>
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
				{inProgressResources.slice(0, 3).map((completion) => (
					<ResourceCard
						key={completion.id}
						resource={completion.resource}
						completion={completion}
						onStart={() => onStart(completion.resourceId)}
						onContinue={() => onContinue(completion.resourceId, completion.resource.url)}
					/>
				))}
			</div>
		</section>
	);
}

export function ForYouTabContent({
	recommendations,
	getCompletion,
	onStart,
	onContinue,
	onGenerate,
}: {
	recommendations: {
		recommendation: { id: string; resourceId: string; score: number; reason: string };
		resource: LearningResource;
	}[];
	getCompletion: (resourceId: string) => ResourceCompletion | undefined;
	onStart: (resourceId: string) => void;
	onContinue: (resourceId: string, url?: string | null) => void;
	onGenerate: () => void;
}) {
	if (recommendations.length === 0) {
		return (
			<Card className="border-dashed">
				<CardContent className="flex flex-col items-center py-12 text-center">
					<LightbulbIcon className="mb-4 size-12 text-muted-foreground/50" />
					<h3 className="mb-2 font-medium text-lg">
						<Trans>No Recommendations Yet</Trans>
					</h3>
					<p className="mb-4 max-w-sm text-muted-foreground">
						<Trans>Add skills to your profile and we'll recommend personalized learning resources.</Trans>
					</p>
					<Button onClick={onGenerate} className="gap-2">
						<SparkleIcon className="size-4" />
						<Trans>Generate Recommendations</Trans>
					</Button>
				</CardContent>
			</Card>
		);
	}

	return (
		<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
			{recommendations.map((item) => (
				<ResourceCard
					key={item.recommendation.id}
					resource={item.resource as LearningResource}
					completion={getCompletion(item.recommendation.resourceId)}
					onStart={() => onStart(item.recommendation.resourceId)}
					onContinue={() => onContinue(item.recommendation.resourceId, item.resource.url)}
					isRecommendation
					score={item.recommendation.score}
					reason={item.recommendation.reason}
				/>
			))}
		</div>
	);
}

export function ExploreTabContent({
	selectedType,
	setSelectedType,
	selectedDifficulty,
	setSelectedDifficulty,
	filteredResources,
	getCompletion,
	onStart,
	onContinue,
}: {
	selectedType: ResourceType | "all";
	setSelectedType: (v: ResourceType | "all") => void;
	selectedDifficulty: DifficultyLevel | "all";
	setSelectedDifficulty: (v: DifficultyLevel | "all") => void;
	filteredResources: LearningResource[];
	getCompletion: (resourceId: string) => ResourceCompletion | undefined;
	onStart: (resourceId: string) => void;
	onContinue: (resourceId: string, url?: string | null) => void;
}) {
	return (
		<div className="space-y-8">
			<div className="flex flex-wrap gap-4">
				<Select value={selectedType} onValueChange={(v) => setSelectedType(v as ResourceType | "all")}>
					<SelectTrigger className="w-48">
						<SelectValue placeholder={t`Resource Type`} />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">
							<Trans>All Types</Trans>
						</SelectItem>
						{(Object.keys(RESOURCE_TYPE_CONFIG) as ResourceType[]).map((type) => {
							const config = RESOURCE_TYPE_CONFIG[type];
							const TypeIcon = config.icon;
							return (
								<SelectItem key={type} value={type}>
									<div className="flex items-center gap-2">
										<TypeIcon className="size-4" />
										{config.label}
									</div>
								</SelectItem>
							);
						})}
					</SelectContent>
				</Select>

				<Select value={selectedDifficulty} onValueChange={(v) => setSelectedDifficulty(v as DifficultyLevel | "all")}>
					<SelectTrigger className="w-48">
						<SelectValue placeholder={t`Difficulty`} />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">
							<Trans>All Levels</Trans>
						</SelectItem>
						{(Object.keys(DIFFICULTY_CONFIG) as DifficultyLevel[]).map((level) => (
							<SelectItem key={level} value={level}>
								{DIFFICULTY_CONFIG[level].label}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

			{filteredResources.length === 0 ? (
				<Card className="border-dashed">
					<CardContent className="flex flex-col items-center py-12 text-center">
						<BookOpenIcon className="mb-4 size-12 text-muted-foreground/50" />
						<h3 className="mb-2 font-medium text-lg">
							<Trans>No Resources Found</Trans>
						</h3>
						<p className="text-muted-foreground">
							<Trans>Try adjusting your filters to find learning resources.</Trans>
						</p>
					</CardContent>
				</Card>
			) : (
				<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
					{filteredResources.map((resource) => (
						<ResourceCard
							key={resource.id}
							resource={resource}
							completion={getCompletion(resource.id)}
							onStart={() => onStart(resource.id)}
							onContinue={() => onContinue(resource.id, resource.url)}
						/>
					))}
				</div>
			)}
		</div>
	);
}

export function ProgressTabContent({
	overallProgress,
	statistics,
	completions,
}: {
	overallProgress: number;
	statistics:
		| {
				completedResources?: number;
				inProgressResources?: number;
				currentStreak?: number;
		  }
		| undefined;
	completions: {
		completion: {
			id: string;
			status: string;
			completedAt: Date | null;
			timeSpentMinutes: number;
		};
		resource: {
			resourceType: ResourceType;
			titleFr: string | null;
			title: string;
		};
	}[];
}) {
	return (
		<div className="space-y-8">
			<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
				<Card className="col-span-full md:col-span-2 lg:col-span-1">
					<CardHeader className="pb-2">
						<CardTitle className="flex items-center gap-2 text-base">
							<TrendUpIcon className="size-4 text-primary" />
							<Trans>Overall Progress</Trans>
						</CardTitle>
					</CardHeader>
					<CardContent className="flex items-center justify-center py-4">
						<RadialProgressChart progress={overallProgress} label={t`Complete`} />
					</CardContent>
				</Card>

				<Card className="border-green-500/30 bg-gradient-to-br from-green-500/10 to-transparent">
					<CardContent className="p-6">
						<div className="mb-4 flex items-center justify-between">
							<div className="flex size-12 items-center justify-center rounded-full bg-green-500/20">
								<TrophyIcon className="size-6 text-green-500" weight="fill" />
							</div>
							<Badge className="bg-green-500">
								<Trans>Completed</Trans>
							</Badge>
						</div>
						<p className="mb-1 font-bold text-4xl text-green-600 dark:text-green-400">
							{statistics?.completedResources ?? 0}
						</p>
						<p className="text-muted-foreground text-sm">
							<Trans>Resources completed</Trans>
						</p>
					</CardContent>
				</Card>

				<Card className="border-blue-500/30 bg-gradient-to-br from-blue-500/10 to-transparent">
					<CardContent className="p-6">
						<div className="mb-4 flex items-center justify-between">
							<div className="flex size-12 items-center justify-center rounded-full bg-blue-500/20">
								<RocketLaunchIcon className="size-6 text-blue-500" weight="fill" />
							</div>
							<Badge variant="secondary">
								<Trans>In Progress</Trans>
							</Badge>
						</div>
						<p className="mb-1 font-bold text-4xl text-blue-600 dark:text-blue-400">
							{statistics?.inProgressResources ?? 0}
						</p>
						<p className="text-muted-foreground text-sm">
							<Trans>Currently learning</Trans>
						</p>
					</CardContent>
				</Card>

				<Card className="border-amber-500/30 bg-gradient-to-br from-amber-500/10 to-transparent">
					<CardContent className="p-6">
						<div className="mb-4 flex items-center justify-between">
							<div className="flex size-12 items-center justify-center rounded-full bg-amber-500/20">
								<FireIcon className="size-6 text-amber-500" weight="fill" />
							</div>
							<Badge className="bg-amber-500">
								<Trans>Streak</Trans>
							</Badge>
						</div>
						<p className="mb-1 font-bold text-4xl text-amber-600 dark:text-amber-400">
							{statistics?.currentStreak ?? 0}
						</p>
						<p className="text-muted-foreground text-sm">
							<Trans>Day learning streak</Trans>
						</p>
					</CardContent>
				</Card>
			</div>

			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<CheckCircleIcon className="size-5 text-green-500" weight="duotone" />
						<Trans>Completed Resources</Trans>
					</CardTitle>
					<CardDescription>
						<Trans>Track your learning achievements</Trans>
					</CardDescription>
				</CardHeader>
				<CardContent>
					{completions.filter((c) => c.completion.status === "completed").length === 0 ? (
						<div className="rounded-xl border border-dashed p-8 text-center">
							<TrophyIcon className="mx-auto mb-4 size-12 text-muted-foreground/50" />
							<p className="text-muted-foreground">
								<Trans>Complete your first resource to see it here!</Trans>
							</p>
						</div>
					) : (
						<div className="space-y-4">
							{completions
								.filter((c) => c.completion.status === "completed")
								.map((item) => {
									const typeConfig = RESOURCE_TYPE_CONFIG[item.resource.resourceType as ResourceType];
									const TypeIcon = typeConfig?.icon;
									return (
										<div
											key={item.completion.id}
											className="flex items-center gap-4 rounded-lg border border-green-500/30 bg-green-500/5 p-4"
										>
											<div className={cn("rounded-lg p-2", typeConfig?.color)}>
												{TypeIcon && <TypeIcon className="size-5" />}
											</div>
											<div className="min-w-0 flex-1">
												<h4 className="truncate font-medium">{item.resource.title}</h4>
												<p className="text-muted-foreground text-sm">
													{item.completion.completedAt
														? new Date(item.completion.completedAt).toLocaleDateString()
														: ""}
													{item.completion.timeSpentMinutes > 0 &&
														` - ${formatDuration(item.completion.timeSpentMinutes)}`}
												</p>
											</div>
											<CheckCircleIcon className="size-6 text-green-500" weight="fill" />
										</div>
									);
								})}
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}

export function GoalsTabContent({
	goals,
}: {
	goals: {
		id: string;
		title: string;
		titleFr: string | null;
		description: string | null;
		status: string;
		endDate: string;
		currentValue: number;
		targetValue: number;
	}[];
}) {
	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<TargetIcon className="size-5 text-primary" weight="duotone" />
					<Trans>Learning Goals</Trans>
				</CardTitle>
				<CardDescription>
					<Trans>Set and track your learning objectives</Trans>
				</CardDescription>
			</CardHeader>
			<CardContent>
				{goals.length === 0 ? (
					<div className="rounded-xl border border-dashed p-8 text-center">
						<TargetIcon className="mx-auto mb-4 size-12 text-muted-foreground/50" />
						<h3 className="mb-2 font-medium text-lg">
							<Trans>No Goals Set</Trans>
						</h3>
						<p className="mb-4 text-muted-foreground">
							<Trans>Set learning goals to stay motivated and track your progress.</Trans>
						</p>
						<Link to="/dashboard/career/skills">
							<Button className="gap-2">
								<TargetIcon className="size-4" />
								<Trans>Set Your First Goal</Trans>
							</Button>
						</Link>
					</div>
				) : (
					<div className="space-y-4">
						{goals.map((goal) => {
							const isCompleted = goal.status === "completed";
							return (
								<div
									key={goal.id}
									className={cn(
										"rounded-lg border p-4 transition-all",
										isCompleted && "border-green-500/50 bg-green-500/5",
									)}
								>
									<div className="flex items-center gap-4">
										<div
											className={cn(
												"flex size-10 shrink-0 items-center justify-center rounded-full",
												isCompleted ? "bg-green-500/20 text-green-500" : "bg-primary/20 text-primary",
											)}
										>
											{isCompleted ? (
												<CheckCircleIcon className="size-5" weight="fill" />
											) : (
												<TargetIcon className="size-5" weight="duotone" />
											)}
										</div>
										<div className="min-w-0 flex-1">
											<h4 className="font-medium">{goal.title}</h4>
											{goal.description && <p className="text-muted-foreground text-sm">{goal.description}</p>}
											{goal.endDate && (
												<p className="mt-1 flex items-center gap-1 text-muted-foreground text-xs">
													<CalendarIcon className="size-3" />
													{new Date(goal.endDate).toLocaleDateString()}
												</p>
											)}
										</div>
										{isCompleted ? (
											<Badge className="bg-green-500">
												<Trans>Completed</Trans>
											</Badge>
										) : (
											<Badge variant="outline">
												{goal.currentValue} / {goal.targetValue}
											</Badge>
										)}
									</div>
								</div>
							);
						})}
					</div>
				)}
			</CardContent>
		</Card>
	);
}

export function MentorsTabContent({
	mentorMatches,
}: {
	mentorMatches: {
		id: string;
		firstName: string;
		lastName: string;
		avatar: string | null;
		title: string;
		bio: string;
		rating: number;
	}[];
}) {
	return (
		<div className="space-y-8">
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<UsersIcon className="size-5 text-primary" weight="duotone" />
						<Trans>Mentor Matches</Trans>
					</CardTitle>
					<CardDescription>
						<Trans>Connect with mentors who can help you develop your skills</Trans>
					</CardDescription>
				</CardHeader>
				<CardContent>
					{mentorMatches.length === 0 ? (
						<div className="rounded-xl border border-dashed p-8 text-center">
							<UsersIcon className="mx-auto mb-4 size-12 text-muted-foreground/50" />
							<h3 className="mb-2 font-medium text-lg">
								<Trans>No Mentor Matches</Trans>
							</h3>
							<p className="mb-4 text-muted-foreground">
								<Trans>Add skills to your profile to be matched with relevant mentors.</Trans>
							</p>
							<Link to="/dashboard/networking/mentors">
								<Button className="gap-2">
									<UsersIcon className="size-4" />
									<Trans>Browse Mentors</Trans>
								</Button>
							</Link>
						</div>
					) : (
						<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
							{mentorMatches.map((mentor) => (
								<Card key={mentor.id} className="transition-all hover:shadow-lg">
									<CardContent className="p-4">
										<div className="mb-4 flex items-center gap-3">
											{mentor.avatar ? (
												<img
													src={mentor.avatar}
													alt={`${mentor.firstName} ${mentor.lastName}`}
													className="size-12 rounded-full object-cover"
												/>
											) : (
												<div className="flex size-12 items-center justify-center rounded-full bg-primary/10">
													<UsersIcon className="size-6 text-primary" />
												</div>
											)}
											<div className="min-w-0 flex-1">
												<h4 className="truncate font-medium">
													{mentor.firstName} {mentor.lastName}
												</h4>
												{mentor.title && <p className="truncate text-muted-foreground text-sm">{mentor.title}</p>}
											</div>
										</div>
										{mentor.bio && <p className="mb-4 line-clamp-2 text-muted-foreground text-sm">{mentor.bio}</p>}
										<div className="flex items-center justify-between">
											<Badge variant="outline" className="gap-1">
												<StarIcon className="size-3" />
												{mentor.rating.toFixed(1)}
											</Badge>
											<Button size="sm" variant="outline" className="gap-1">
												<ArrowRightIcon className="size-4" />
												<Trans>Connect</Trans>
											</Button>
										</div>
									</CardContent>
								</Card>
							))}
						</div>
					)}
				</CardContent>
			</Card>

			<Card className="border-primary/30 bg-gradient-to-br from-primary/10 to-transparent">
				<CardContent className="flex flex-col items-center py-8 text-center">
					<div className="mb-4 flex size-16 items-center justify-center rounded-full bg-primary/20">
						<GraduationCapIcon className="size-8 text-primary" weight="duotone" />
					</div>
					<h3 className="mb-2 font-bold text-2xl">
						<Trans>Ready to Learn?</Trans>
					</h3>
					<p className="mb-6 max-w-md text-muted-foreground">
						<Trans>Explore our full catalog of courses, tutorials, and certifications to advance your career.</Trans>
					</p>
					<div className="flex flex-wrap justify-center gap-4">
						<Link to="/dashboard/resources">
							<Button size="lg" className="gap-2">
								<GraduationCapIcon className="size-5" />
								<Trans>Browse Resources</Trans>
							</Button>
						</Link>
						<Link to={"/dashboard/career/skills" as string}>
							<Button size="lg" variant="outline" className="gap-2">
								<TargetIcon className="size-5" />
								<Trans>Track Skills</Trans>
							</Button>
						</Link>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
