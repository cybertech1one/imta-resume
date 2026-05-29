import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import {
	CalendarIcon,
	CheckCircleIcon,
	HandshakeIcon,
	LightbulbIcon,
	MegaphoneIcon,
	ShareNetworkIcon,
	StarIcon,
	TargetIcon,
	TrendUpIcon,
	UsersIcon,
} from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";
import { ErrorComponent } from "@/components/error-component";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { authClient } from "@/integrations/auth/client";
import { orpc } from "@/integrations/orpc/client";
import { cn } from "@/utils/style";
import { DashboardHeader } from "../-components/header";

// biome-ignore lint/suspicious/noExplicitAny: Route path not in generated route tree
export const Route = createFileRoute("/dashboard/linkedin/strategies" as any)({
	component: LinkedInStrategies,
	errorComponent: ErrorComponent,
});

const PRIORITY_COLORS = {
	high: "bg-red-500/10 text-red-600 border-red-200",
	medium: "bg-amber-500/10 text-amber-600 border-amber-200",
	low: "bg-green-500/10 text-green-600 border-green-200",
};

const ENGAGEMENT_CATEGORIES = {
	posting: { label: "Publishing", icon: MegaphoneIcon, color: "text-blue-500" },
	commenting: { label: "Comments", icon: LightbulbIcon, color: "text-purple-500" },
	sharing: { label: "Sharing", icon: ShareNetworkIcon, color: "text-green-500" },
	networking: { label: "Networking", icon: UsersIcon, color: "text-amber-500" },
};

function LinkedInStrategies() {
	const { data: session } = authClient.useSession();

	// Fetch connection strategies
	const { data: connectionStrategies = [], isLoading: isLoadingStrategies } = useQuery({
		...orpc.linkedin.getConnectionStrategies.queryOptions(),
		enabled: !!session?.user,
		staleTime: 10 * 60 * 1000,
	});

	// Fetch engagement tips
	const { data: engagementTips = [], isLoading: isLoadingTips } = useQuery({
		...orpc.linkedin.getEngagementTips.queryOptions(),
		enabled: !!session?.user,
		staleTime: 10 * 60 * 1000,
	});

	// Group engagement tips by category
	const tipsByCategory = engagementTips.reduce(
		(acc, tip) => {
			const category = tip.category as keyof typeof ENGAGEMENT_CATEGORIES;
			if (!acc[category]) acc[category] = [];
			acc[category].push(tip);
			return acc;
		},
		{} as Record<string, typeof engagementTips>,
	);

	return (
		<div className="space-y-6">
			<DashboardHeader icon={TargetIcon} title={t`Connection Strategies`} />

			{/* Overview Cards */}
			<div className="grid gap-4 md:grid-cols-3">
				<Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5">
					<CardContent className="pt-6">
						<div className="flex items-center gap-4">
							<div className="flex size-12 items-center justify-center rounded-xl bg-blue-500/20">
								<TrendUpIcon className="size-6 text-blue-600" weight="fill" />
							</div>
							<div>
								<p className="font-semibold">
									<Trans>Network Growth</Trans>
								</p>
								<p className="text-muted-foreground text-sm">
									<Trans>Increase your quality connections</Trans>
								</p>
							</div>
						</div>
					</CardContent>
				</Card>

				<Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5">
					<CardContent className="pt-6">
						<div className="flex items-center gap-4">
							<div className="flex size-12 items-center justify-center rounded-xl bg-purple-500/20">
								<HandshakeIcon className="size-6 text-purple-600" weight="fill" />
							</div>
							<div>
								<p className="font-semibold">
									<Trans>Authentic Engagement</Trans>
								</p>
								<p className="text-muted-foreground text-sm">
									<Trans>Build lasting relationships</Trans>
								</p>
							</div>
						</div>
					</CardContent>
				</Card>

				<Card className="bg-gradient-to-br from-green-500/10 to-green-600/5">
					<CardContent className="pt-6">
						<div className="flex items-center gap-4">
							<div className="flex size-12 items-center justify-center rounded-xl bg-green-500/20">
								<StarIcon className="size-6 text-green-600" weight="fill" />
							</div>
							<div>
								<p className="font-semibold">
									<Trans>Increased Visibility</Trans>
								</p>
								<p className="text-muted-foreground text-sm">
									<Trans>Become visible to recruiters</Trans>
								</p>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>

			<Tabs defaultValue="strategies" className="space-y-6">
				<TabsList>
					<TabsTrigger value="strategies">
						<Trans>Connection Strategies</Trans>
					</TabsTrigger>
					<TabsTrigger value="engagement">
						<Trans>Engagement Tips</Trans>
					</TabsTrigger>
					<TabsTrigger value="calendar">
						<Trans>Optimal Schedule</Trans>
					</TabsTrigger>
				</TabsList>

				<TabsContent value="strategies" className="space-y-4">
					{isLoadingStrategies ? (
						<div className="grid gap-4 md:grid-cols-2">
							{[1, 2, 3, 4].map((i) => (
								<Card key={i} className="h-full">
									<CardHeader>
										<div className="flex items-start justify-between">
											<div className="flex items-center gap-2">
												<Skeleton className="size-8 rounded-lg" />
												<Skeleton className="h-5 w-40" />
											</div>
											<Skeleton className="h-5 w-24" />
										</div>
										<Skeleton className="mt-2 h-4 w-full" />
									</CardHeader>
									<CardContent>
										<Skeleton className="mb-2 h-4 w-24" />
										<div className="space-y-2">
											<div className="flex items-start gap-2">
												<Skeleton className="size-4" />
												<Skeleton className="h-4 w-full" />
											</div>
											<div className="flex items-start gap-2">
												<Skeleton className="size-4" />
												<Skeleton className="h-4 w-3/4" />
											</div>
											<div className="flex items-start gap-2">
												<Skeleton className="size-4" />
												<Skeleton className="h-4 w-5/6" />
											</div>
										</div>
									</CardContent>
								</Card>
							))}
						</div>
					) : (
						<div className="grid gap-4 md:grid-cols-2">
							{connectionStrategies.map((strategy, index) => (
								<motion.div
									key={strategy.id}
									initial={false}
									animate={{ opacity: 1, y: 0 }}
									transition={{ delay: index * 0.1 }}
								>
									<Card className="h-full">
										<CardHeader>
											<div className="flex items-start justify-between">
												<CardTitle className="flex items-center gap-2 text-lg">
													<div className="flex size-8 items-center justify-center rounded-lg bg-primary/10">
														<UsersIcon className="size-4 text-primary" />
													</div>
													{strategy.title}
												</CardTitle>
												<Badge
													variant="outline"
													className={cn("text-xs", PRIORITY_COLORS[strategy.priority as keyof typeof PRIORITY_COLORS])}
												>
													{strategy.priority === "high"
														? t`High priority`
														: strategy.priority === "medium"
															? t`Medium priority`
															: t`Low priority`}
												</Badge>
											</div>
											<CardDescription>{strategy.description}</CardDescription>
										</CardHeader>
										<CardContent>
											<h4 className="mb-2 font-medium text-sm">
												<Trans>Key tips:</Trans>
											</h4>
											<ul className="space-y-2">
												{strategy.tips.map((tip, tipIndex) => (
													<li key={tipIndex} className="flex items-start gap-2 text-sm">
														<CheckCircleIcon className="mt-0.5 size-4 shrink-0 text-green-500" />
														<span className="text-muted-foreground">{tip}</span>
													</li>
												))}
											</ul>
										</CardContent>
									</Card>
								</motion.div>
							))}
						</div>
					)}
				</TabsContent>

				<TabsContent value="engagement" className="space-y-6">
					{isLoadingTips ? (
						<div className="space-y-6">
							{[1, 2, 3].map((i) => (
								<Card key={i}>
									<CardHeader>
										<div className="flex items-center gap-2">
											<Skeleton className="size-5" />
											<Skeleton className="h-5 w-32" />
										</div>
									</CardHeader>
									<CardContent>
										<div className="grid gap-4 md:grid-cols-2">
											{[1, 2].map((j) => (
												<div key={j} className="flex items-start gap-3 rounded-lg border p-4">
													<Skeleton className="size-10 shrink-0 rounded-lg" />
													<div className="flex-1 space-y-2">
														<Skeleton className="h-4 w-40" />
														<Skeleton className="h-3 w-full" />
														<Skeleton className="h-5 w-20" />
													</div>
												</div>
											))}
										</div>
									</CardContent>
								</Card>
							))}
						</div>
					) : (
						Object.entries(tipsByCategory).map(([category, tips]) => {
							const categoryConfig = ENGAGEMENT_CATEGORIES[category as keyof typeof ENGAGEMENT_CATEGORIES];
							if (!categoryConfig) return null;

							return (
								<Card key={category}>
									<CardHeader>
										<CardTitle className="flex items-center gap-2">
											<categoryConfig.icon className={cn("size-5", categoryConfig.color)} />
											{categoryConfig.label}
										</CardTitle>
									</CardHeader>
									<CardContent>
										<div className="grid gap-4 md:grid-cols-2">
											{tips.map((tip) => (
												<div key={tip.id} className="flex items-start gap-3 rounded-lg border p-4">
													<div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted">
														<LightbulbIcon className="size-5 text-muted-foreground" />
													</div>
													<div>
														<p className="font-medium text-sm">{tip.title}</p>
														<p className="mt-1 text-muted-foreground text-xs">{tip.description}</p>
														<Badge variant="outline" className="mt-2 text-xs">
															{tip.frequency}
														</Badge>
													</div>
												</div>
											))}
										</div>
									</CardContent>
								</Card>
							);
						})
					)}
				</TabsContent>

				<TabsContent value="calendar" className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<CalendarIcon className="size-5" />
								<Trans>Best times to publish</Trans>
							</CardTitle>
							<CardDescription>
								<Trans>Optimize your visibility by publishing at peak hours for the Moroccan market</Trans>
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-6">
							{/* Weekdays */}
							<div>
								<h4 className="mb-4 font-medium">
									<Trans>Weekdays</Trans>
								</h4>
								<div className="grid gap-3">
									{[
										{ day: t`Monday`, morning: 85, noon: 70, evening: 60 },
										{ day: t`Tuesday`, morning: 90, noon: 75, evening: 65 },
										{ day: t`Wednesday`, morning: 85, noon: 80, evening: 55 },
										{ day: t`Thursday`, morning: 90, noon: 75, evening: 70 },
										{ day: t`Friday`, morning: 70, noon: 60, evening: 40 },
									].map((item) => (
										<div key={item.day} className="flex items-center gap-4">
											<span className="w-24 font-medium text-sm">{item.day}</span>
											<div className="flex flex-1 items-center gap-2">
												<div className="flex-1">
													<div className="mb-1 flex items-center justify-between">
														<span className="text-muted-foreground text-xs">8am-10am</span>
														<span className="text-xs">{item.morning}%</span>
													</div>
													<Progress value={item.morning} className="h-2" />
												</div>
												<div className="flex-1">
													<div className="mb-1 flex items-center justify-between">
														<span className="text-muted-foreground text-xs">12pm-2pm</span>
														<span className="text-xs">{item.noon}%</span>
													</div>
													<Progress value={item.noon} className="h-2" />
												</div>
												<div className="flex-1">
													<div className="mb-1 flex items-center justify-between">
														<span className="text-muted-foreground text-xs">5pm-7pm</span>
														<span className="text-xs">{item.evening}%</span>
													</div>
													<Progress value={item.evening} className="h-2" />
												</div>
											</div>
										</div>
									))}
								</div>
							</div>

							<Separator />

							{/* Best practices */}
							<div>
								<h4 className="mb-4 font-medium">
									<Trans>Best practices</Trans>
								</h4>
								<div className="grid gap-3 sm:grid-cols-2">
									<div className="flex items-start gap-3 rounded-lg border p-4">
										<CheckCircleIcon className="size-5 shrink-0 text-green-500" />
										<div>
											<p className="font-medium text-sm">
												<Trans>Publish at the beginning of the week</Trans>
											</p>
											<p className="text-muted-foreground text-xs">
												<Trans>Tuesday and Wednesday are the best days</Trans>
											</p>
										</div>
									</div>
									<div className="flex items-start gap-3 rounded-lg border p-4">
										<CheckCircleIcon className="size-5 shrink-0 text-green-500" />
										<div>
											<p className="font-medium text-sm">
												<Trans>Respond quickly</Trans>
											</p>
											<p className="text-muted-foreground text-xs">
												<Trans>Reply to comments within the hour</Trans>
											</p>
										</div>
									</div>
									<div className="flex items-start gap-3 rounded-lg border p-4">
										<CheckCircleIcon className="size-5 shrink-0 text-green-500" />
										<div>
											<p className="font-medium text-sm">
												<Trans>Avoid Friday afternoon</Trans>
											</p>
											<p className="text-muted-foreground text-xs">
												<Trans>Engagement drops significantly</Trans>
											</p>
										</div>
									</div>
									<div className="flex items-start gap-3 rounded-lg border p-4">
										<CheckCircleIcon className="size-5 shrink-0 text-green-500" />
										<div>
											<p className="font-medium text-sm">
												<Trans>Post in the morning</Trans>
											</p>
											<p className="text-muted-foreground text-xs">
												<Trans>Between 8am and 10am for the Moroccan market</Trans>
											</p>
										</div>
									</div>
								</div>
							</div>
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>
		</div>
	);
}
