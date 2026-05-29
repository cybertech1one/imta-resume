import { i18n } from "@lingui/core";
import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import {
	ArrowRightIcon,
	BriefcaseIcon,
	CalendarIcon,
	ChatsCircleIcon,
	ClockIcon,
	FileTextIcon,
	LightbulbIcon,
	MegaphoneIcon,
	PlusCircleIcon,
	RocketLaunchIcon,
	SparkleIcon,
	StarIcon,
	TrophyIcon,
	UsersIcon,
} from "@phosphor-icons/react";
import { Link } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { memo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/utils/style";
import {
	APPLICATION_CHART_COLORS,
	activityIcons,
	activityLabels,
	quickActions,
	SKILLS_CHART_COLORS,
} from "./dashboard-index-config";
import type {
	AnimatedCounterProps,
	BarChartProps,
	ChartsSectionProps,
	DonutChartProps,
	FeatureTeaserProps,
	ProgressRingProps,
	QuickActionsSectionProps,
	RecentActivitySectionProps,
	StatCardProps,
	UpcomingItemsSectionProps,
	WelcomeBannerProps,
} from "./dashboard-index-types";
import { formatFutureDate, formatLocalizedDate, formatRelativeTime } from "./dashboard-index-utils";

const ProgressRing = memo(({ value, size = 140, strokeWidth = 8, label }: ProgressRingProps) => {
	const radius = (size - strokeWidth) / 2;
	const circumference = 2 * Math.PI * radius;
	const offset = circumference - (value / 100) * circumference;
	const center = size / 2;

	const getStrokeColor = (val: number) => {
		if (val >= 75) return "var(--imta-emerald)";
		if (val >= 50) return "var(--imta-teal)";
		if (val >= 25) return "var(--imta-blue)";
		return "var(--muted-foreground)";
	};

	return (
		<div className="relative inline-flex items-center justify-center">
			<svg
				width={size}
				height={size}
				viewBox={`0 0 ${size} ${size}`}
				className="-rotate-90"
				role="img"
				aria-label={`${label || "Progress"}: ${value}%`}
			>
				{/* Track */}
				<circle cx={center} cy={center} r={radius} className="progress-ring-track" strokeWidth={strokeWidth} />
				{/* Fill */}
				<motion.circle
					cx={center}
					cy={center}
					r={radius}
					className="progress-ring-fill"
					stroke={getStrokeColor(value)}
					strokeWidth={strokeWidth}
					strokeDasharray={circumference}
					initial={{ strokeDashoffset: circumference }}
					animate={{ strokeDashoffset: offset }}
					transition={{ duration: 1.5, ease: [0.4, 0, 0.2, 1], delay: 0.3 }}
					style={{ transform: "rotate(-90deg)", transformOrigin: "50% 50%" }}
				/>
			</svg>
			<div className="absolute inset-0 flex flex-col items-center justify-center">
				<motion.span
					className="font-bold text-3xl tracking-tight"
					initial={false}
					animate={{ opacity: 1, scale: 1 }}
					transition={{ delay: 0.6, duration: 0.4, type: "spring" }}
				>
					{value}%
				</motion.span>
				{label && (
					<motion.span
						className="text-muted-foreground text-xs"
						initial={false}
						animate={{ opacity: 1 }}
						transition={{ delay: 0.8 }}
					>
						{label}
					</motion.span>
				)}
			</div>
		</div>
	);
});
ProgressRing.displayName = "ProgressRing";

const AnimatedCounter = memo(({ value, className }: AnimatedCounterProps) => {
	return (
		<motion.span
			className={className}
			initial={false}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.5, type: "spring" }}
			key={value}
		>
			{value}
		</motion.span>
	);
});
AnimatedCounter.displayName = "AnimatedCounter";

const StatCardSkeleton = memo(() => (
	<div className="stat-card">
		<div className="mb-4 flex items-center justify-between">
			<Skeleton className="size-12 rounded-xl" />
			<Skeleton className="h-5 w-16 rounded-full" />
		</div>
		<Skeleton className="mb-2 h-8 w-16" />
		<Skeleton className="h-4 w-24" />
	</div>
));
StatCardSkeleton.displayName = "StatCardSkeleton";

const ActivityItemSkeleton = memo(() => (
	<div className="flex items-start gap-4 p-3">
		<Skeleton className="size-10 shrink-0 rounded-full" />
		<div className="min-w-0 flex-1">
			<Skeleton className="mb-2 h-4 w-32" />
			<Skeleton className="h-3 w-48" />
		</div>
		<Skeleton className="h-3 w-20 shrink-0" />
	</div>
));
ActivityItemSkeleton.displayName = "ActivityItemSkeleton";

const UpcomingItemSkeleton = memo(() => (
	<div className="flex items-center gap-4 rounded-lg border p-4">
		<Skeleton className="size-10 shrink-0 rounded-xl" />
		<div className="min-w-0 flex-1">
			<Skeleton className="mb-2 h-4 w-40" />
			<Skeleton className="h-3 w-32" />
		</div>
		<Skeleton className="h-6 w-20 rounded-full" />
	</div>
));
UpcomingItemSkeleton.displayName = "UpcomingItemSkeleton";

export const StatCard = memo(
	({ icon: IconComponent, count, label, badge, accentColor, href, isLoading, index = 0 }: StatCardProps) => {
		if (isLoading) {
			return <StatCardSkeleton />;
		}

		const cardContent = (
			<motion.div
				initial={false}
				animate={{ opacity: 1, y: 0 }}
				transition={{ delay: 0.08 * index, duration: 0.4, type: "spring", stiffness: 300 }}
				whileHover={{ y: -4, transition: { duration: 0.2 } }}
				className="stat-card group cursor-pointer"
			>
				{/* Decorative corner accent */}
				<div
					className="pointer-events-none absolute -top-6 -right-6 size-24 rounded-full opacity-[0.07] blur-2xl transition-opacity group-hover:opacity-[0.14]"
					style={{ background: accentColor }}
				/>
				<div className="relative z-10">
					<div className="mb-3 flex items-center justify-between sm:mb-4">
						<div
							className="flex size-11 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110 sm:size-12"
							style={{ background: `color-mix(in oklch, ${accentColor} 15%, transparent)` }}
						>
							<IconComponent className="size-5 sm:size-6" weight="duotone" style={{ color: accentColor }} />
						</div>
						{badge && (
							<Badge
								variant="outline"
								className="hidden gap-1 border-green-500/50 bg-green-500/10 text-green-600 sm:flex"
							>
								<badge.icon className="size-3" />
								{badge.text}
							</Badge>
						)}
					</div>
					<AnimatedCounter value={count} className="block font-bold text-2xl tracking-tight sm:text-3xl" />
					<p className="mt-0.5 text-muted-foreground text-xs sm:text-sm">{label}</p>
				</div>
			</motion.div>
		);

		if (href) {
			return <Link to={href as "/dashboard/resumes"}>{cardContent}</Link>;
		}

		return cardContent;
	},
);
StatCard.displayName = "StatCard";

const DonutChart = memo(({ data, colors }: DonutChartProps) => {
	const total = data.reduce((sum, item) => sum + item.value, 0);
	if (total === 0) {
		return (
			<div className="flex size-40 items-center justify-center rounded-full bg-muted/50">
				<p className="text-muted-foreground text-sm">
					<Trans>No data</Trans>
				</p>
			</div>
		);
	}

	let cumulativePercentage = 0;
	const segments = data.map((item, index) => {
		const percentage = (item.value / total) * 100;
		const startAngle = cumulativePercentage * 3.6;
		cumulativePercentage += percentage;
		return {
			...item,
			percentage,
			startAngle,
			color: colors[index % colors.length],
		};
	});

	const gradientStops = segments.map((segment, index) => {
		const prevPercentage = index === 0 ? 0 : segments.slice(0, index).reduce((sum, s) => sum + s.percentage, 0);
		return `${segment.color} ${prevPercentage}% ${prevPercentage + segment.percentage}%`;
	});

	return (
		<motion.div
			className="relative flex size-40 items-center justify-center"
			initial={false}
			animate={{ scale: 1, opacity: 1 }}
			transition={{ duration: 0.5, type: "spring" }}
		>
			<div
				className="absolute inset-0 rounded-full shadow-inner"
				style={{
					background: `conic-gradient(${gradientStops.join(", ")})`,
				}}
			/>
			<div className="z-10 flex size-24 flex-col items-center justify-center rounded-full bg-background shadow-sm">
				<span className="font-bold text-2xl">{total}</span>
				<span className="text-muted-foreground text-xs">
					<Trans>Total</Trans>
				</span>
			</div>
		</motion.div>
	);
});
DonutChart.displayName = "DonutChart";

const BarChart = memo(({ data, colors }: BarChartProps) => {
	const maxValue = Math.max(...data.map((d) => d.value), 1);

	if (data.length === 0) {
		return (
			<div className="flex h-40 items-center justify-center">
				<p className="text-muted-foreground text-sm">
					<Trans>No data</Trans>
				</p>
			</div>
		);
	}

	return (
		<div className="flex h-40 items-end gap-2">
			{data.map((item, index) => (
				<div key={item.label} className="flex flex-1 flex-col items-center gap-1">
					<span className="text-muted-foreground text-xs">{item.value}</span>
					<motion.div
						className="w-full rounded-t-lg"
						style={{ backgroundColor: colors[index % colors.length] }}
						initial={{ height: 0 }}
						animate={{ height: `${(item.value / maxValue) * 100}%` }}
						transition={{ duration: 0.6, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
					/>
					<span className="max-w-full truncate text-muted-foreground text-xs" title={item.label}>
						{item.label.slice(0, 8)}
					</span>
				</div>
			))}
		</div>
	);
});
BarChart.displayName = "BarChart";

export const WelcomeBanner = memo(
	({ itemVariants, currentDate, greeting, userName, dailyMotivation, progressScore }: WelcomeBannerProps) => (
		<motion.section
			variants={itemVariants}
			className="glass-card relative overflow-hidden p-8 md:p-10"
			aria-labelledby="welcome-heading"
		>
			<div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
				<motion.div
					className="absolute -top-20 -right-20 size-80 rounded-full blur-3xl"
					style={{ background: "oklch(from var(--imta-emerald) l c h / 0.08)" }}
					animate={{
						scale: [1, 1.3, 1],
						rotate: [0, 20, 0],
						opacity: [0.4, 0.15, 0.4],
					}}
					transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
				/>
				<motion.div
					className="absolute -bottom-20 -left-20 size-80 rounded-full blur-3xl"
					style={{ background: "oklch(from var(--imta-teal) l c h / 0.08)" }}
					animate={{
						scale: [1.2, 1, 1.2],
						rotate: [0, -15, 0],
						opacity: [0.15, 0.4, 0.15],
					}}
					transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
				/>
				<motion.div
					className="absolute top-1/2 right-1/3 size-48 rounded-full blur-3xl"
					style={{ background: "oklch(from var(--imta-blue) l c h / 0.05)" }}
					animate={{
						scale: [1, 1.15, 1],
						opacity: [0.2, 0.35, 0.2],
					}}
					transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
				/>
			</div>

			<div className="relative z-10 flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
				<div className="flex-1 space-y-4">
					<motion.div
						className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-background/60 px-4 py-1.5 backdrop-blur-sm"
						initial={false}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.2 }}
					>
						<CalendarIcon className="size-4 text-primary" weight="duotone" aria-hidden="true" />
						<time
							suppressHydrationWarning
							dateTime={currentDate.toISOString()}
							className="text-muted-foreground text-sm capitalize"
						>
							{formatLocalizedDate(currentDate)}
						</time>
					</motion.div>

					<motion.h2
						id="welcome-heading"
						suppressHydrationWarning
						className="shimmer-text font-bold text-3xl tracking-tight md:text-4xl lg:text-5xl"
						initial={false}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.3 }}
					>
						{greeting}, {userName}!
					</motion.h2>

					<motion.div
						className="flex items-start gap-3"
						initial={false}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.4 }}
					>
						<div
							className="flex size-8 shrink-0 items-center justify-center rounded-full"
							style={{ background: "oklch(from var(--imta-teal) l c h / 0.2)" }}
						>
							<LightbulbIcon
								className="size-4"
								weight="fill"
								style={{ color: "var(--imta-teal)" }}
								aria-hidden="true"
							/>
						</div>
						<p className="max-w-lg text-lg text-muted-foreground italic leading-relaxed">{dailyMotivation}</p>
					</motion.div>

					<motion.div
						className="flex items-center gap-4"
						initial={false}
						animate={{ opacity: 1 }}
						transition={{ delay: 0.5 }}
					>
						<div className="flex items-center gap-2">
							<TrophyIcon
								className="size-5"
								weight="duotone"
								style={{ color: "var(--imta-teal)" }}
								aria-hidden="true"
							/>
							<span className="font-medium text-sm">
								<Trans>Overall Progress</Trans>
							</span>
						</div>
						<div className="flex flex-1 items-center gap-3">
							<Progress value={progressScore} className="h-2.5 max-w-xs" />
							<span className="font-bold text-sm" style={{ color: "var(--imta-emerald)" }}>
								{progressScore}%
							</span>
						</div>
					</motion.div>
				</div>

				<motion.div
					className="hidden lg:flex lg:flex-col lg:items-center lg:gap-2"
					initial={false}
					animate={{ opacity: 1, scale: 1 }}
					transition={{ delay: 0.5, type: "spring" }}
				>
					<ProgressRing value={progressScore} label={t`Completion`} />
				</motion.div>
			</div>
		</motion.section>
	),
);
WelcomeBanner.displayName = "WelcomeBanner";

export const QuickActionsSection = memo(({ itemVariants }: QuickActionsSectionProps) => (
	<motion.section variants={itemVariants} aria-labelledby="quick-actions-heading">
		<h2 id="quick-actions-heading" className="mb-4 flex items-center gap-2 font-semibold text-lg">
			<RocketLaunchIcon
				className="size-5"
				weight="duotone"
				style={{ color: "var(--imta-emerald)" }}
				aria-hidden="true"
			/>
			<Trans>Quick Actions</Trans>
		</h2>
		<div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
			{quickActions.map((action, index) => (
				<motion.div
					key={action.id}
					initial={false}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.08 * index, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
				>
					<Link to={action.href as "/dashboard/resumes"}>
						<div className="quick-action-card group hover-lift h-full cursor-pointer border border-border/50 bg-card p-4 sm:p-6">
							<div className="relative z-10">
								<div className="mb-3 flex items-center justify-between sm:mb-4">
									<div
										className="flex size-11 items-center justify-center rounded-xl transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg sm:size-14 sm:rounded-2xl"
										style={{
											background: `color-mix(in oklch, ${action.accentColor} 12%, transparent)`,
											boxShadow: `0 0 0 0 color-mix(in oklch, ${action.accentColor} 0%, transparent)`,
										}}
									>
										<action.icon className="size-5 sm:size-7" weight="duotone" style={{ color: action.accentColor }} />
									</div>
									{action.shortcut && (
										<span className="hidden rounded-md border border-border/50 bg-muted/50 px-2 py-0.5 font-mono text-[10px] text-muted-foreground sm:inline-block">
											{action.shortcut}
										</span>
									)}
								</div>
								<h3 className="mb-1 font-semibold text-base transition-colors group-hover:text-primary sm:text-lg">
									{i18n.t(action.title)}
								</h3>
								<p className="mb-3 line-clamp-2 text-muted-foreground text-xs sm:mb-4 sm:text-sm">
									{i18n.t(action.description)}
								</p>
								<div
									className="flex items-center gap-1 font-medium text-xs sm:text-sm"
									style={{ color: action.accentColor }}
								>
									<Trans>Get Started</Trans>
									<ArrowRightIcon className="size-3 transition-transform duration-300 group-hover:translate-x-1.5 sm:size-4" />
								</div>
							</div>
						</div>
					</Link>
				</motion.div>
			))}
		</div>
	</motion.section>
));
QuickActionsSection.displayName = "QuickActionsSection";

export const ChartsSection = memo(
	({ itemVariants, statsLoading, applicationChartData, skillsChartData }: ChartsSectionProps) => (
		<motion.section variants={itemVariants} className="grid gap-6 lg:grid-cols-2" aria-label={t`Graphiques`}>
			<Card hover="subtle" className="overflow-hidden">
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<BriefcaseIcon
							className="size-5"
							weight="duotone"
							style={{ color: "var(--imta-emerald)" }}
							aria-hidden="true"
						/>
						<Trans>Application Breakdown</Trans>
					</CardTitle>
					<CardDescription>
						<Trans>Statut de vos candidatures par catégorie</Trans>
					</CardDescription>
				</CardHeader>
				<CardContent>
					{statsLoading ? (
						<div className="flex h-40 items-center justify-center">
							<Skeleton className="size-40 rounded-full" />
						</div>
					) : (
						<div className="flex flex-col items-center gap-4">
							<DonutChart data={applicationChartData} colors={APPLICATION_CHART_COLORS} />
							<div className="flex flex-wrap justify-center gap-3">
								{applicationChartData.map((item, index) => (
									<div key={item.label} className="flex items-center gap-1.5">
										<div
											className="size-3 rounded-full"
											style={{
												backgroundColor: APPLICATION_CHART_COLORS[index % APPLICATION_CHART_COLORS.length],
											}}
										/>
										<span className="text-muted-foreground text-xs">
											{item.label} ({item.value})
										</span>
									</div>
								))}
							</div>
						</div>
					)}
				</CardContent>
			</Card>

			<Card hover="subtle" className="overflow-hidden">
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<StarIcon className="size-5" weight="duotone" style={{ color: "var(--imta-teal)" }} aria-hidden="true" />
						<Trans>Skills by Category</Trans>
					</CardTitle>
					<CardDescription>
						<Trans>Vos compétences par type</Trans>
					</CardDescription>
				</CardHeader>
				<CardContent>
					{statsLoading ? (
						<div className="flex h-40 items-end gap-2">
							{[1, 2, 3, 4].map((i) => (
								<Skeleton key={i} className="flex-1" style={{ height: `${Math.random() * 80 + 20}%` }} />
							))}
						</div>
					) : (
						<BarChart data={skillsChartData} colors={SKILLS_CHART_COLORS} />
					)}
				</CardContent>
			</Card>
		</motion.section>
	),
);
ChartsSection.displayName = "ChartsSection";

export const RecentActivitySection = memo(
	({ itemVariants, activityLoading, recentActivity }: RecentActivitySectionProps) => (
		<motion.section variants={itemVariants}>
			<Card hover="subtle" className="h-full overflow-hidden">
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<ClockIcon className="size-5" weight="duotone" style={{ color: "var(--imta-blue)" }} aria-hidden="true" />
						<Trans>Recent Activity</Trans>
					</CardTitle>
					<CardDescription>
						<Trans>Vos dernières actions sur la plateforme</Trans>
					</CardDescription>
				</CardHeader>
				<CardContent>
					{activityLoading ? (
						<div className="space-y-4">
							{[1, 2, 3, 4, 5].map((i) => (
								<ActivityItemSkeleton key={i} />
							))}
						</div>
					) : recentActivity && recentActivity.length > 0 ? (
						<ul className="space-y-1">
							<AnimatePresence mode="popLayout">
								{recentActivity.map((activity, index) => {
									const ActivityIcon = activityIcons[activity.activityType] || FileTextIcon;
									const activityDescriptor = activityLabels[activity.activityType];
									const activityLabel = activityDescriptor ? i18n.t(activityDescriptor) : activity.activityType;
									return (
										<motion.li
											key={activity.id}
											initial={false}
											animate={{ opacity: 1, x: 0 }}
											exit={{ opacity: 0, x: 20 }}
											transition={{ delay: index * 0.04 }}
											className="activity-item group flex items-start gap-4 rounded-lg p-3 transition-colors hover:bg-muted/50"
										>
											<div
												className="flex size-10 shrink-0 items-center justify-center rounded-full transition-transform duration-200 group-hover:scale-110"
												style={{ background: "oklch(from var(--imta-emerald) l c h / 0.1)" }}
											>
												<ActivityIcon className="size-5" weight="duotone" style={{ color: "var(--imta-emerald)" }} />
											</div>
											<div className="min-w-0 flex-1">
												<p className="font-medium text-sm">{activityLabel}</p>
												<p className="truncate text-muted-foreground text-xs">
													{activity.category || activity.resourceType}
												</p>
											</div>
											<time className="shrink-0 text-muted-foreground text-xs">
												{formatRelativeTime(new Date(activity.createdAt))}
											</time>
										</motion.li>
									);
								})}
							</AnimatePresence>
						</ul>
					) : (
						<div className="flex flex-col items-center justify-center py-8 text-center">
							<div
								className="mb-4 flex size-16 items-center justify-center rounded-full"
								style={{ background: "oklch(from var(--muted) l c h / 0.5)" }}
							>
								<ClockIcon className="size-8 text-muted-foreground/50" weight="duotone" aria-hidden="true" />
							</div>
							<p className="font-medium text-muted-foreground">
								<Trans>Aucune activité récente</Trans>
							</p>
							<p className="text-muted-foreground text-sm">
								<Trans>Vos actions apparaîtront ici</Trans>
							</p>
						</div>
					)}
				</CardContent>
			</Card>
		</motion.section>
	),
);
RecentActivitySection.displayName = "RecentActivitySection";

export const UpcomingItemsSection = memo(
	({ itemVariants, upcomingLoading, upcomingItems }: UpcomingItemsSectionProps) => (
		<motion.section variants={itemVariants}>
			<Card hover="subtle" className="h-full overflow-hidden">
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<CalendarIcon
							className="size-5"
							weight="duotone"
							style={{ color: "var(--imta-teal)" }}
							aria-hidden="true"
						/>
						<Trans>Upcoming</Trans>
					</CardTitle>
					<CardDescription>
						<Trans>Entretiens, échéances et suivis à venir</Trans>
					</CardDescription>
				</CardHeader>
				<CardContent>
					{upcomingLoading ? (
						<div className="space-y-4">
							{[1, 2, 3].map((i) => (
								<UpcomingItemSkeleton key={i} />
							))}
						</div>
					) : upcomingItems && upcomingItems.length > 0 ? (
						<div className="space-y-3">
							{upcomingItems.map((item, index) => {
								const ItemIcon =
									item.type === "interview" ? ChatsCircleIcon : item.type === "deadline" ? CalendarIcon : UsersIcon;

								const typeColors: Record<string, string> = {
									interview: "var(--imta-blue)",
									deadline: "var(--imta-emerald)",
									follow_up: "var(--imta-teal)",
								};
								const accentColor = typeColors[item.type] || "var(--imta-emerald)";

								const priorityColors = {
									high: "bg-red-100 text-red-600 border-red-200 dark:bg-red-900/30 dark:text-red-400",
									medium: "bg-amber-100 text-amber-600 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400",
									low: "bg-green-100 text-green-600 border-green-200 dark:bg-green-900/30 dark:text-green-400",
								};

								return (
									<motion.div
										key={item.id}
										initial={false}
										animate={{ opacity: 1, y: 0 }}
										transition={{ delay: index * 0.08 }}
										className="flex items-center gap-4 rounded-xl border p-4 transition-all duration-200 hover:border-primary/30 hover:shadow-md"
									>
										<div
											className="flex size-10 shrink-0 items-center justify-center rounded-xl"
											style={{ background: `color-mix(in oklch, ${accentColor} 12%, transparent)` }}
										>
											<ItemIcon className="size-5" weight="duotone" style={{ color: accentColor }} />
										</div>
										<div className="min-w-0 flex-1">
											<p className="font-medium text-sm">{item.title}</p>
											<p className="truncate text-muted-foreground text-xs">{item.subtitle}</p>
										</div>
										<div className="flex flex-col items-end gap-1">
											<Badge
												variant="outline"
												className={cn("text-xs", item.priority && priorityColors[item.priority])}
											>
												{formatFutureDate(new Date(item.date))}
											</Badge>
											{item.priority && (
												<span className="text-muted-foreground text-xs capitalize">
													{item.priority === "high"
														? t`High priority`
														: item.priority === "medium"
															? t`Medium priority`
															: t`Low priority`}
												</span>
											)}
										</div>
									</motion.div>
								);
							})}
						</div>
					) : (
						<div className="flex flex-col items-center justify-center py-8 text-center">
							<div
								className="mb-4 flex size-16 items-center justify-center rounded-full"
								style={{ background: "oklch(from var(--muted) l c h / 0.5)" }}
							>
								<CalendarIcon className="size-8 text-muted-foreground/50" weight="duotone" aria-hidden="true" />
							</div>
							<p className="font-medium text-muted-foreground">
								<Trans>Rien de prévu</Trans>
							</p>
							<p className="mb-4 text-muted-foreground text-sm">
								<Trans>Planifiez vos prochaines étapes</Trans>
							</p>
							<Link to="/dashboard/interview">
								<Button variant="outline" size="sm">
									<PlusCircleIcon className="mr-2 size-4" />
									<Trans>Schedule an Interview</Trans>
								</Button>
							</Link>
						</div>
					)}
				</CardContent>
			</Card>
		</motion.section>
	),
);
UpcomingItemsSection.displayName = "UpcomingItemsSection";

export const FeatureTeaser = memo(({ itemVariants }: FeatureTeaserProps) => (
	<motion.aside variants={itemVariants}>
		<div className="gradient-border">
			<Card className="overflow-hidden border-0 bg-gradient-to-r from-primary/5 via-primary/8 to-primary/5">
				<CardContent className="flex flex-col items-center gap-4 p-6 md:flex-row">
					<div
						className="flex size-14 shrink-0 items-center justify-center rounded-2xl"
						style={{ background: "oklch(from var(--imta-emerald) l c h / 0.15)" }}
					>
						<MegaphoneIcon
							className="size-7"
							weight="duotone"
							style={{ color: "var(--imta-emerald)" }}
							aria-hidden="true"
						/>
					</div>
					<div className="flex-1 text-center md:text-left">
						<div className="mb-1 flex items-center justify-center gap-2 md:justify-start">
							<Badge variant="outline" className="border-primary/50 bg-primary/10 text-primary">
								<SparkleIcon className="mr-1 size-3" weight="fill" />
								<Trans>Coming Soon</Trans>
							</Badge>
						</div>
						<h2 className="mb-1 font-semibold text-lg">
							<Trans>Job Board Integration</Trans>
						</h2>
						<p className="text-muted-foreground text-sm">
							<Trans>Soon, access job listings matching your profile directly and apply with one click!</Trans>
						</p>
					</div>
					<Button variant="outline" className="shrink-0 gap-2" disabled>
						<Trans>Learn More</Trans>
						<ArrowRightIcon className="size-4" />
					</Button>
				</CardContent>
			</Card>
		</div>
	</motion.aside>
));
FeatureTeaser.displayName = "FeatureTeaser";
