import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import {
	ArrowSquareOutIcon,
	BellIcon,
	BellRingingIcon,
	BellSimpleSlashIcon,
	BriefcaseIcon,
	BuildingsIcon,
	CalendarIcon,
	CaretRightIcon,
	ChartBarIcon,
	CheckCircleIcon,
	ClockIcon,
	CopyIcon,
	CurrencyCircleDollarIcon,
	EnvelopeIcon,
	EyeIcon,
	LightningIcon,
	MagnifyingGlassIcon,
	MapPinIcon,
	PauseIcon,
	PencilSimpleIcon,
	PlayIcon,
	PlusIcon,
	SparkleIcon,
	SpinnerIcon,
	StarIcon,
	TagIcon,
	TrashIcon,
	TrendUpIcon,
	WarningIcon,
} from "@phosphor-icons/react";
import { Link } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { TabsContent } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/utils/style";

import {
	COMPANY_SIZES,
	FREQUENCY_CONFIG,
	INDUSTRIES,
	LOCATIONS,
	MATCH_QUALITY_CONFIG,
	WORK_PREFERENCE_CONFIG,
} from "./alerts-config";
import type { AlertFormData, MatchQuality, NotificationFrequency, WorkPreference } from "./alerts-types";

// â”€â”€â”€ Utility Functions â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const formatDate = (dateString: string) => {
	const date = new Date(dateString);
	const today = new Date();
	const yesterday = new Date(today);
	yesterday.setDate(yesterday.getDate() - 1);

	if (dateString === today.toISOString().split("T")[0]) return t`Today`;
	if (dateString === yesterday.toISOString().split("T")[0]) return t`Yesterday`;

	return date.toLocaleDateString(undefined, {
		day: "numeric",
		month: "long",
	});
};

const formatTimestamp = (date: Date | null) => {
	if (!date) return null;
	return new Date(date).toISOString().split("T")[0];
};

// â”€â”€â”€ Type aliases for data from ORPC queries â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

type AlertData = {
	id: string;
	name: string;
	keywords: string[];
	locations: string[];
	salaryMin: number;
	salaryMax: number;
	industries: string[];
	companySizes: string[];
	workPreference: WorkPreference;
	frequency: NotificationFrequency;
	status: "active" | "paused";
	matchCount: number;
	viewedCount: number;
	appliedCount: number;
	lastTriggered: Date | null;
	createdAt: Date;
	updatedAt: Date;
	userId: string;
};

type MatchData = {
	id: string;
	alertId: string;
	jobTitle: string;
	company: string;
	location: string | null;
	salary: string | null;
	matchScore: number;
	matchQuality: MatchQuality;
	matchedKeywords: string[];
	matchedDate: string;
	isViewed: boolean;
	isApplied: boolean;
	isDuplicate: boolean;
};

type StatsData = {
	totalAlerts: number;
	activeAlerts: number;
	totalMatches: number;
	appliedFromAlerts: number;
	avgMatchScore: number;
	topPerformingAlert: string;
};

// â”€â”€â”€ Hero Section â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

interface HeroSectionProps {
	stats: StatsData;
}

export function HeroSection({ stats }: HeroSectionProps) {
	return (
		<motion.div
			className="relative mb-8 overflow-hidden rounded-3xl border border-primary/20 p-8 md:p-12"
			style={{
				background:
					"linear-gradient(135deg, oklch(0.65 0.18 45 / 0.15) 0%, oklch(0.6 0.2 30 / 0.1) 50%, oklch(0.7 0.15 60 / 0.08) 100%)",
			}}
			initial={false}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.6, ease: "easeOut" }}
		>
			{/* Animated background elements */}
			<div className="pointer-events-none absolute inset-0 overflow-hidden">
				<motion.div
					className="absolute -top-32 -right-32 size-96 rounded-full bg-gradient-to-br from-amber-500/20 to-orange-500/10 blur-3xl"
					animate={{
						scale: [1, 1.2, 1],
						rotate: [0, 10, 0],
						opacity: [0.5, 0.3, 0.5],
					}}
					transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
				/>
				<motion.div
					className="absolute -bottom-32 -left-32 size-96 rounded-full bg-gradient-to-tr from-yellow-500/15 to-amber-500/10 blur-3xl"
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
					<BellRingingIcon className="size-5 text-primary" weight="fill" />
					<span className="font-semibold text-primary text-sm uppercase tracking-wider">
						<Trans>Alert System</Trans>
					</span>
				</motion.div>

				<motion.h2
					className="mb-4 bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text font-bold text-3xl text-transparent tracking-tight md:text-4xl lg:text-5xl"
					initial={false}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.3 }}
				>
					<Trans>Job Alerts</Trans>
				</motion.h2>

				<motion.p
					className="mb-8 max-w-2xl text-lg text-muted-foreground"
					initial={false}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.4 }}
				>
					<Trans>
						Create personalized alerts and receive notifications for offers that perfectly match your criteria. Never
						miss an opportunity again.
					</Trans>
				</motion.p>

				{/* Quick Stats */}
				<motion.div
					className="grid grid-cols-2 gap-4 sm:grid-cols-4"
					initial={false}
					animate={{ opacity: 1 }}
					transition={{ delay: 0.5 }}
				>
					<div className="rounded-xl border border-white/20 bg-white/50 p-4 backdrop-blur-sm dark:bg-black/20">
						<div className="flex items-center gap-2">
							<BellIcon className="size-5 text-primary" weight="duotone" />
							<p className="font-bold text-2xl">{stats.totalAlerts}</p>
						</div>
						<p className="text-muted-foreground text-sm">
							<Trans>Alerts</Trans>
						</p>
					</div>
					<div className="rounded-xl border border-white/20 bg-white/50 p-4 backdrop-blur-sm dark:bg-black/20">
						<div className="flex items-center gap-2">
							<SparkleIcon className="size-5 text-green-500" weight="duotone" />
							<p className="font-bold text-2xl text-green-600 dark:text-green-400">{stats.activeAlerts}</p>
						</div>
						<p className="text-muted-foreground text-sm">
							<Trans>Active</Trans>
						</p>
					</div>
					<div className="rounded-xl border border-white/20 bg-white/50 p-4 backdrop-blur-sm dark:bg-black/20">
						<div className="flex items-center gap-2">
							<BriefcaseIcon className="size-5 text-blue-500" weight="duotone" />
							<p className="font-bold text-2xl text-blue-600 dark:text-blue-400">{stats.totalMatches}</p>
						</div>
						<p className="text-muted-foreground text-sm">
							<Trans>Matches</Trans>
						</p>
					</div>
					<div className="rounded-xl border border-white/20 bg-white/50 p-4 backdrop-blur-sm dark:bg-black/20">
						<div className="flex items-center gap-2">
							<TrendUpIcon className="size-5 text-amber-500" weight="duotone" />
							<p className="font-bold text-2xl text-amber-600 dark:text-amber-400">{stats.avgMatchScore}%</p>
						</div>
						<p className="text-muted-foreground text-sm">
							<Trans>Average score</Trans>
						</p>
					</div>
				</motion.div>
			</div>
		</motion.div>
	);
}

// â”€â”€â”€ Alerts Tab â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

interface AlertsTabProps {
	alerts: AlertData[];
	onToggleStatus: (id: string) => void;
	onEdit: (alert: AlertData) => void;
	onDelete: (id: string) => void;
	onCreateOpen: () => void;
	toggleStatusPending: boolean;
}

export function AlertsTab({
	alerts,
	onToggleStatus,
	onEdit,
	onDelete,
	onCreateOpen,
	toggleStatusPending,
}: AlertsTabProps) {
	return (
		<TabsContent value="alerts" className="space-y-6">
			{alerts.length > 0 ? (
				<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
					<AnimatePresence mode="popLayout">
						{alerts.map((alert, index) => {
							const WorkIcon = WORK_PREFERENCE_CONFIG[alert.workPreference].icon;
							const FreqIcon = FREQUENCY_CONFIG[alert.frequency].icon;

							return (
								<motion.div
									key={alert.id}
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									exit={{ opacity: 0, scale: 0.95 }}
									transition={{ delay: index * 0.05 }}
								>
									<Card
										className={cn(
											"group h-full transition-all duration-300 hover:-translate-y-1 hover:shadow-xl",
											alert.status === "paused" && "opacity-60",
										)}
									>
										<CardHeader className="pb-3">
											<div className="flex items-start justify-between">
												<div className="flex items-center gap-3">
													<div
														className={cn(
															"flex size-12 items-center justify-center rounded-xl",
															alert.status === "active"
																? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
																: "bg-gray-100 text-gray-600 dark:bg-gray-800/30 dark:text-gray-400",
														)}
													>
														{alert.status === "active" ? (
															<BellRingingIcon className="size-6" weight="duotone" />
														) : (
															<BellSimpleSlashIcon className="size-6" weight="duotone" />
														)}
													</div>
													<div>
														<CardTitle className="line-clamp-1 text-lg">{alert.name}</CardTitle>
														<CardDescription className="flex items-center gap-1">
															<FreqIcon className="size-3" />
															{FREQUENCY_CONFIG[alert.frequency].label}
														</CardDescription>
													</div>
												</div>
												<Tooltip>
													<TooltipTrigger asChild>
														<Button
															variant="ghost"
															size="sm"
															className="size-8 p-0"
															onClick={() => onToggleStatus(alert.id)}
															disabled={toggleStatusPending}
														>
															{alert.status === "active" ? (
																<PauseIcon className="size-4" />
															) : (
																<PlayIcon className="size-4" />
															)}
														</Button>
													</TooltipTrigger>
													<TooltipContent>{alert.status === "active" ? "Pause" : "Activate"}</TooltipContent>
												</Tooltip>
											</div>
										</CardHeader>

										<CardContent className="space-y-4">
											{/* Keywords */}
											<div className="flex flex-wrap gap-1.5">
												{alert.keywords.slice(0, 4).map((keyword) => (
													<Badge key={keyword} variant="secondary" className="text-xs">
														<TagIcon className="mr-1 size-3" />
														{keyword}
													</Badge>
												))}
												{alert.keywords.length > 4 && (
													<Badge variant="outline" className="text-xs">
														+{alert.keywords.length - 4}
													</Badge>
												)}
											</div>

											{/* Location & Work Preference */}
											<div className="flex flex-wrap gap-2 text-muted-foreground text-sm">
												<span className="flex items-center gap-1">
													<MapPinIcon className="size-4" />
													{alert.locations.slice(0, 2).join(", ")}
													{alert.locations.length > 2 && ` +${alert.locations.length - 2}`}
												</span>
												<span
													className={cn("flex items-center gap-1", WORK_PREFERENCE_CONFIG[alert.workPreference].color)}
												>
													<WorkIcon className="size-4" />
													{WORK_PREFERENCE_CONFIG[alert.workPreference].label}
												</span>
											</div>

											{/* Salary Range */}
											<div className="flex items-center gap-2 font-medium text-green-600 text-sm dark:text-green-400">
												<CurrencyCircleDollarIcon className="size-4" />
												{alert.salaryMin.toLocaleString()} - {alert.salaryMax.toLocaleString()} MAD
											</div>

											{/* Stats Row */}
											<div className="grid grid-cols-3 gap-2 rounded-lg bg-muted/50 p-3">
												<div className="text-center">
													<p className="font-bold text-lg">{alert.matchCount}</p>
													<p className="text-muted-foreground text-xs">Matches</p>
												</div>
												<div className="text-center">
													<p className="font-bold text-lg">{alert.viewedCount}</p>
													<p className="text-muted-foreground text-xs">Views</p>
												</div>
												<div className="text-center">
													<p className="font-bold text-lg text-primary">{alert.appliedCount}</p>
													<p className="text-muted-foreground text-xs">Applications</p>
												</div>
											</div>

											{/* Last Triggered */}
											{alert.lastTriggered && (
												<p className="flex items-center gap-1 text-muted-foreground text-xs">
													<ClockIcon className="size-3" />
													Last match: {formatDate(formatTimestamp(alert.lastTriggered) || "")}
												</p>
											)}
										</CardContent>

										<CardFooter className="gap-2 pt-2">
											<Button variant="outline" size="sm" className="flex-1 gap-1" onClick={() => onEdit(alert)}>
												<PencilSimpleIcon className="size-4" />
												<Trans>Edit</Trans>
											</Button>
											<Button
												variant="outline"
												size="sm"
												className="text-red-600 hover:bg-red-50 hover:text-red-700"
												onClick={() => onDelete(alert.id)}
											>
												<TrashIcon className="size-4" />
											</Button>
										</CardFooter>
									</Card>
								</motion.div>
							);
						})}
					</AnimatePresence>
				</div>
			) : (
				<Card className="border-dashed">
					<CardContent className="flex flex-col items-center justify-center py-16">
						<BellIcon className="mb-4 size-16 text-muted-foreground/50" weight="duotone" />
						<h3 className="mb-2 font-semibold text-lg">
							<Trans>No alerts</Trans>
						</h3>
						<p className="mb-4 text-center text-muted-foreground">
							<Trans>Create your first alert to receive personalized notifications</Trans>
						</p>
						<Button onClick={onCreateOpen}>
							<PlusIcon className="mr-2 size-4" />
							<Trans>Create an alert</Trans>
						</Button>
					</CardContent>
				</Card>
			)}

			{/* Quick Tips */}
			<Card className="border-primary/30 bg-primary/5">
				<CardContent className="p-6">
					<h3 className="mb-4 flex items-center gap-2 font-semibold text-lg">
						<SparkleIcon className="size-5 text-primary" weight="fill" />
						<Trans>Tips for better alerts</Trans>
					</h3>
					<div className="grid gap-4 md:grid-cols-3">
						<div className="flex gap-3">
							<div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
								<TagIcon className="size-5 text-primary" />
							</div>
							<div>
								<p className="font-medium">
									<Trans>Precise keywords</Trans>
								</p>
								<p className="text-muted-foreground text-sm">
									<Trans>Use terms specific to your profession</Trans>
								</p>
							</div>
						</div>
						<div className="flex gap-3">
							<div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
								<MapPinIcon className="size-5 text-primary" />
							</div>
							<div>
								<p className="font-medium">
									<Trans>Multiple locations</Trans>
								</p>
								<p className="text-muted-foreground text-sm">
									<Trans>Broaden your geographic search</Trans>
								</p>
							</div>
						</div>
						<div className="flex gap-3">
							<div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
								<LightningIcon className="size-5 text-primary" />
							</div>
							<div>
								<p className="font-medium">
									<Trans>Instant alerts</Trans>
								</p>
								<p className="text-muted-foreground text-sm">
									<Trans>For highly sought-after positions</Trans>
								</p>
							</div>
						</div>
					</div>
				</CardContent>
			</Card>
		</TabsContent>
	);
}

// â”€â”€â”€ Matches Tab â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

interface MatchesTabProps {
	alerts: AlertData[];
	matches: MatchData[];
	filteredMatches: MatchData[];
	groupedMatches: [string, MatchData[]][];
	isLoadingMatches: boolean;
	searchQuery: string;
	selectedMatchFilter: string;
	matchQualityFilter: MatchQuality | "all";
	showDuplicates: boolean;
	onSearchChange: (query: string) => void;
	onMatchFilterChange: (value: string) => void;
	onQualityFilterChange: (value: MatchQuality | "all") => void;
	onShowDuplicatesChange: (value: boolean) => void;
	onMarkViewed: (matchId: string, alertId: string) => void;
	onQuickApply: (matchId: string, alertId: string) => void;
	onCreateOpen: () => void;
	markViewedPending: boolean;
	markAppliedPending: boolean;
}

export function MatchesTab({
	alerts,
	filteredMatches,
	groupedMatches,
	isLoadingMatches,
	searchQuery,
	selectedMatchFilter,
	matchQualityFilter,
	showDuplicates,
	onSearchChange,
	onMatchFilterChange,
	onQualityFilterChange,
	onShowDuplicatesChange,
	onMarkViewed,
	onQuickApply,
	onCreateOpen,
	markViewedPending,
	markAppliedPending,
}: MatchesTabProps) {
	return (
		<TabsContent value="matches" className="space-y-6">
			{/* Filters */}
			<Card>
				<CardContent className="p-4">
					<div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center">
						{/* Search */}
						<div className="relative w-full min-w-[200px] sm:flex-1 lg:max-w-xs">
							<MagnifyingGlassIcon className="absolute top-1/2 left-3 size-5 -translate-y-1/2 text-muted-foreground" />
							<Input
								placeholder={t`Search...`}
								value={searchQuery}
								onChange={(e) => onSearchChange(e.target.value)}
								className="pl-10"
							/>
						</div>

						{/* Alert Filter */}
						<Select value={selectedMatchFilter} onValueChange={onMatchFilterChange}>
							<SelectTrigger className="w-full sm:w-[180px]">
								<BellIcon className="mr-2 size-4" />
								<SelectValue placeholder={t`Filter by alert`} />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">
									<Trans>All alerts</Trans>
								</SelectItem>
								{alerts.map((alert) => (
									<SelectItem key={alert.id} value={alert.id}>
										{alert.name}
									</SelectItem>
								))}
							</SelectContent>
						</Select>

						{/* Quality Filter */}
						<Select value={matchQualityFilter} onValueChange={(v) => onQualityFilterChange(v as MatchQuality | "all")}>
							<SelectTrigger className="w-full sm:w-[160px]">
								<StarIcon className="mr-2 size-4" />
								<SelectValue placeholder={t`Quality`} />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">
									<Trans>Any quality</Trans>
								</SelectItem>
								{Object.entries(MATCH_QUALITY_CONFIG).map(([key, config]) => (
									<SelectItem key={key} value={key}>
										<span className={config.color}>{config.label}</span>
									</SelectItem>
								))}
							</SelectContent>
						</Select>

						{/* Show Duplicates Toggle */}
						<div className="flex items-center gap-2">
							<Switch checked={showDuplicates} onCheckedChange={onShowDuplicatesChange} />
							<Label className="cursor-pointer text-sm">
								<Trans>Show duplicates</Trans>
							</Label>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Loading state for matches */}
			{isLoadingMatches && (
				<div className="flex min-h-[200px] items-center justify-center">
					<SpinnerIcon className="size-8 animate-spin text-primary" />
				</div>
			)}

			{/* Matches List */}
			{!isLoadingMatches && filteredMatches.length > 0 ? (
				<div className="space-y-6">
					{groupedMatches.map(([date, dateMatches]) => (
						<div key={date}>
							<h3 className="mb-4 flex items-center gap-2 font-semibold text-muted-foreground">
								<CalendarIcon className="size-4" />
								{formatDate(date)}
								<Badge variant="outline">{dateMatches.length}</Badge>
							</h3>

							<div className="space-y-3">
								{dateMatches.map((match, index) => {
									const quality = MATCH_QUALITY_CONFIG[match.matchQuality];
									const alert = alerts.find((a) => a.id === match.alertId);

									return (
										<motion.div
											key={match.id}
											initial={false}
											animate={{ opacity: 1, x: 0 }}
											transition={{ delay: index * 0.03 }}
										>
											<Card
												className={cn(
													"group transition-all hover:shadow-md",
													!match.isViewed && "border-primary/50 bg-primary/5",
													match.isDuplicate && "border-dashed opacity-70",
												)}
											>
												<CardContent className="p-4">
													<div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
														{/* Main Info */}
														<div className="flex-1 space-y-2">
															<div className="flex flex-wrap items-center gap-2">
																<h4 className="font-semibold text-lg">{match.jobTitle}</h4>
																{!match.isViewed && (
																	<Badge className="bg-primary text-primary-foreground">
																		<SparkleIcon className="mr-1 size-3" weight="fill" />
																		New
																	</Badge>
																)}
																{match.isDuplicate && (
																	<Tooltip>
																		<TooltipTrigger>
																			<Badge variant="outline" className="gap-1 text-amber-600">
																				<CopyIcon className="size-3" />
																				Duplicate
																			</Badge>
																		</TooltipTrigger>
																		<TooltipContent>This offer matches multiple alerts</TooltipContent>
																	</Tooltip>
																)}
																{match.isApplied && (
																	<Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
																		<CheckCircleIcon className="mr-1 size-3" weight="fill" />
																		Application sent
																	</Badge>
																)}
															</div>

															<div className="flex flex-wrap items-center gap-4 text-muted-foreground text-sm">
																<span className="flex items-center gap-1">
																	<BuildingsIcon className="size-4" />
																	{match.company}
																</span>
																{match.location && (
																	<span className="flex items-center gap-1">
																		<MapPinIcon className="size-4" />
																		{match.location}
																	</span>
																)}
																{match.salary && (
																	<span className="flex items-center gap-1 font-medium text-green-600 dark:text-green-400">
																		<CurrencyCircleDollarIcon className="size-4" />
																		{match.salary}
																	</span>
																)}
															</div>

															{/* Matched Keywords */}
															<div className="flex flex-wrap items-center gap-2">
																<span className="text-muted-foreground text-xs">Matches:</span>
																{match.matchedKeywords.map((keyword) => (
																	<Badge key={keyword} variant="outline" className="text-xs">
																		{keyword}
																	</Badge>
																))}
															</div>

															{/* Alert Name */}
															{alert && (
																<p className="flex items-center gap-1 text-muted-foreground text-xs">
																	<BellIcon className="size-3" />
																	Alert: {alert.name}
																</p>
															)}
														</div>

														{/* Match Score & Actions */}
														<div className="flex flex-col items-end gap-3">
															{/* Match Score */}
															<div className="text-center">
																<div className={cn("mb-1 font-bold text-3xl", quality.color)}>{match.matchScore}%</div>
																<Badge className={cn(quality.bgColor, quality.color)}>{quality.label}</Badge>
															</div>

															{/* Actions */}
															<div className="flex gap-2">
																<Tooltip>
																	<TooltipTrigger asChild>
																		<Button
																			variant="outline"
																			size="sm"
																			onClick={() => onMarkViewed(match.id, match.alertId)}
																			disabled={markViewedPending}
																		>
																			<EyeIcon className="size-4" />
																		</Button>
																	</TooltipTrigger>
																	<TooltipContent>Mark as viewed</TooltipContent>
																</Tooltip>

																{!match.isApplied && (
																	<Button
																		size="sm"
																		className="gap-1"
																		onClick={() => onQuickApply(match.id, match.alertId)}
																		disabled={markAppliedPending}
																	>
																		<EnvelopeIcon className="size-4" />
																		<Trans>Apply</Trans>
																	</Button>
																)}

																{/* biome-ignore lint/suspicious/noExplicitAny: Route path not in generated route tree */}
																<Link to={"/dashboard/jobs" as any}>
																	<Button variant="outline" size="sm">
																		<ArrowSquareOutIcon className="size-4" />
																	</Button>
																</Link>
															</div>
														</div>
													</div>
												</CardContent>
											</Card>
										</motion.div>
									);
								})}
							</div>
						</div>
					))}
				</div>
			) : !isLoadingMatches ? (
				<Card className="border-dashed">
					<CardContent className="flex flex-col items-center justify-center py-16">
						<BriefcaseIcon className="mb-4 size-16 text-muted-foreground/50" weight="duotone" />
						<h3 className="mb-2 font-semibold text-lg">
							<Trans>No matches</Trans>
						</h3>
						<p className="mb-4 text-center text-muted-foreground">
							{alerts.length === 0 ? (
								<Trans>Create an alert to start receiving matches</Trans>
							) : (
								<Trans>No offers match your current criteria</Trans>
							)}
						</p>
						{alerts.length === 0 && (
							<Button onClick={onCreateOpen}>
								<PlusIcon className="mr-2 size-4" />
								<Trans>Create an alert</Trans>
							</Button>
						)}
					</CardContent>
				</Card>
			) : null}
		</TabsContent>
	);
}

// â”€â”€â”€ History Tab â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

interface HistoryTabProps {
	alerts: AlertData[];
	matches: MatchData[];
	alertHistory: { date: string; count: number }[];
	stats: StatsData;
}

export function HistoryTab({ alerts, matches, alertHistory, stats }: HistoryTabProps) {
	return (
		<TabsContent value="history" className="space-y-6">
			{/* Chart-like visualization */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<ChartBarIcon className="size-5 text-primary" weight="duotone" />
						<Trans>Activity of the last 7 days</Trans>
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="flex h-48 items-end justify-between gap-2">
						{alertHistory.map((day, index) => {
							const maxCount = Math.max(...alertHistory.map((d) => d.count), 1);
							const height = (day.count / maxCount) * 100;

							return (
								<Tooltip key={day.date}>
									<TooltipTrigger asChild>
										<motion.div
											className="flex flex-1 flex-col items-center gap-2"
											initial={false}
											animate={{ opacity: 1, y: 0 }}
											transition={{ delay: index * 0.05 }}
										>
											<div
												className={cn("w-full rounded-t-lg transition-all", day.count > 0 ? "bg-primary" : "bg-muted")}
												style={{ height: `${Math.max(height, 10)}%` }}
											/>
											<span className="text-muted-foreground text-xs">
												{new Date(day.date).toLocaleDateString(undefined, { weekday: "short" })}
											</span>
										</motion.div>
									</TooltipTrigger>
									<TooltipContent>
										{day.count} match{day.count !== 1 ? "es" : ""} on {formatDate(day.date)}
									</TooltipContent>
								</Tooltip>
							);
						})}
					</div>
				</CardContent>
			</Card>

			{/* Statistics Grid */}
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				<Card>
					<CardContent className="p-6">
						<div className="flex items-center justify-between">
							<div className="flex size-12 items-center justify-center rounded-xl bg-primary/10">
								<BriefcaseIcon className="size-6 text-primary" weight="duotone" />
							</div>
							<TrendUpIcon className="size-5 text-green-500" />
						</div>
						<p className="mt-4 font-bold text-3xl">{stats.totalMatches}</p>
						<p className="text-muted-foreground">
							<Trans>Total matches</Trans>
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardContent className="p-6">
						<div className="flex items-center justify-between">
							<div className="flex size-12 items-center justify-center rounded-xl bg-green-100 dark:bg-green-900/30">
								<CheckCircleIcon className="size-6 text-green-600" weight="duotone" />
							</div>
							<span className="font-bold text-green-600">
								{stats.totalMatches > 0 ? Math.round((stats.appliedFromAlerts / stats.totalMatches) * 100) : 0}%
							</span>
						</div>
						<p className="mt-4 font-bold text-3xl">{stats.appliedFromAlerts}</p>
						<p className="text-muted-foreground">
							<Trans>Applications sent</Trans>
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardContent className="p-6">
						<div className="flex items-center justify-between">
							<div className="flex size-12 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-900/30">
								<StarIcon className="size-6 text-amber-600" weight="fill" />
							</div>
						</div>
						<p className="mt-4 font-bold text-3xl">{stats.avgMatchScore}%</p>
						<p className="text-muted-foreground">
							<Trans>Average score</Trans>
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardContent className="p-6">
						<div className="flex items-center justify-between">
							<div className="flex size-12 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/30">
								<BellRingingIcon className="size-6 text-blue-600" weight="duotone" />
							</div>
						</div>
						<p className="mt-4 line-clamp-1 font-bold text-lg">{stats.topPerformingAlert}</p>
						<p className="text-muted-foreground">
							<Trans>Most active alert</Trans>
						</p>
					</CardContent>
				</Card>
			</div>

			{/* Alert Performance Breakdown */}
			<Card>
				<CardHeader>
					<CardTitle>
						<Trans>Performance by alert</Trans>
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="space-y-4">
						{alerts.map((alert) => {
							const alertMatches = matches.filter((m) => m.alertId === alert.id);
							const avgScore =
								alertMatches.length > 0
									? Math.round(alertMatches.reduce((sum, m) => sum + m.matchScore, 0) / alertMatches.length)
									: 0;
							const appliedCount = alertMatches.filter((m) => m.isApplied).length;

							return (
								<div key={alert.id} className="space-y-2">
									<div className="flex items-center justify-between">
										<div className="flex items-center gap-2">
											{alert.status === "active" ? (
												<BellRingingIcon className="size-4 text-green-500" />
											) : (
												<BellSimpleSlashIcon className="size-4 text-gray-400" />
											)}
											<span className="font-medium">{alert.name}</span>
										</div>
										<div className="flex items-center gap-4 text-sm">
											<span className="text-muted-foreground">
												{alertMatches.length} match{alertMatches.length !== 1 ? "es" : ""}
											</span>
											<span className="text-green-600">
												{appliedCount} application{appliedCount !== 1 ? "s" : ""}
											</span>
											<Badge variant="outline">{avgScore}% avg score</Badge>
										</div>
									</div>
									<Progress value={avgScore} className="h-2" />
								</div>
							);
						})}
					</div>
				</CardContent>
			</Card>

			{/* Recent Activity */}
			<Card>
				<CardHeader>
					<CardTitle>
						<Trans>Recent activity</Trans>
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="space-y-4">
						{matches
							.sort((a, b) => b.matchedDate.localeCompare(a.matchedDate))
							.slice(0, 10)
							.map((match, index) => {
								const alert = alerts.find((a) => a.id === match.alertId);

								return (
									<motion.div
										key={match.id}
										initial={false}
										animate={{ opacity: 1, x: 0 }}
										transition={{ delay: index * 0.03 }}
										className="flex items-center justify-between rounded-lg border p-3"
									>
										<div className="flex items-center gap-3">
											<div
												className={cn(
													"flex size-10 items-center justify-center rounded-lg",
													MATCH_QUALITY_CONFIG[match.matchQuality].bgColor,
												)}
											>
												<BriefcaseIcon
													className={cn("size-5", MATCH_QUALITY_CONFIG[match.matchQuality].color)}
													weight="duotone"
												/>
											</div>
											<div>
												<p className="font-medium">{match.jobTitle}</p>
												<p className="text-muted-foreground text-sm">
													{match.company} - {alert?.name}
												</p>
											</div>
										</div>
										<div className="flex items-center gap-3">
											<Badge
												className={cn(
													MATCH_QUALITY_CONFIG[match.matchQuality].bgColor,
													MATCH_QUALITY_CONFIG[match.matchQuality].color,
												)}
											>
												{match.matchScore}%
											</Badge>
											<span className="text-muted-foreground text-xs">{formatDate(match.matchedDate)}</span>
										</div>
									</motion.div>
								);
							})}
					</div>
				</CardContent>
			</Card>
		</TabsContent>
	);
}

// â”€â”€â”€ Alert Form Dialog â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

interface AlertFormDialogProps {
	isOpen: boolean;
	editingAlertId: string | null;
	formData: AlertFormData;
	onFormDataChange: (data: AlertFormData) => void;
	onClose: () => void;
	onCreate: () => void;
	onUpdate: () => void;
	createPending: boolean;
	updatePending: boolean;
}

export function AlertFormDialog({
	isOpen,
	editingAlertId,
	formData,
	onFormDataChange,
	onClose,
	onCreate,
	onUpdate,
	createPending,
	updatePending,
}: AlertFormDialogProps) {
	const toggleLocationSelection = (location: string) => {
		onFormDataChange({
			...formData,
			locations: formData.locations.includes(location)
				? formData.locations.filter((l) => l !== location)
				: [...formData.locations, location],
		});
	};

	const toggleIndustrySelection = (industry: string) => {
		onFormDataChange({
			...formData,
			industries: formData.industries.includes(industry)
				? formData.industries.filter((i) => i !== industry)
				: [...formData.industries, industry],
		});
	};

	const toggleCompanySizeSelection = (size: string) => {
		onFormDataChange({
			...formData,
			companySizes: formData.companySizes.includes(size)
				? formData.companySizes.filter((s) => s !== size)
				: [...formData.companySizes, size],
		});
	};

	return (
		<Dialog
			open={isOpen || !!editingAlertId}
			onOpenChange={(open) => {
				if (!open) onClose();
			}}
		>
			<DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
				<DialogHeader>
					<DialogTitle>{editingAlertId ? <Trans>Edit alert</Trans> : <Trans>New job alert</Trans>}</DialogTitle>
					<DialogDescription>
						{editingAlertId ? (
							<Trans>Modify the criteria for your alert</Trans>
						) : (
							<Trans>Define your criteria to receive personalized offers</Trans>
						)}
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-6 py-4">
					{/* Alert Name */}
					<div className="space-y-2">
						<Label>
							<Trans>Alert name</Trans>
						</Label>
						<Input
							placeholder={t`E.g.: Nurse positions Casablanca`}
							value={formData.name}
							onChange={(e) => onFormDataChange({ ...formData, name: e.target.value })}
						/>
					</div>

					{/* Keywords */}
					<div className="space-y-2">
						<Label>
							<Trans>Keywords</Trans>
						</Label>
						<Textarea
							placeholder={t`Nurse, RN, care, operating room (separated by commas)`}
							value={formData.keywords}
							onChange={(e) => onFormDataChange({ ...formData, keywords: e.target.value })}
							rows={2}
						/>
						<p className="text-muted-foreground text-xs">
							<Trans>Separate keywords with commas</Trans>
						</p>
					</div>

					{/* Locations */}
					<div className="space-y-2">
						<Label>
							<Trans>Locations</Trans>
						</Label>
						<div className="flex flex-wrap gap-2">
							{LOCATIONS.map((location) => (
								<Badge
									key={location}
									variant={formData.locations.includes(location) ? "default" : "outline"}
									className="cursor-pointer transition-all hover:scale-105"
									onClick={() => toggleLocationSelection(location)}
								>
									{formData.locations.includes(location) && <CheckCircleIcon className="mr-1 size-3" />}
									{location}
								</Badge>
							))}
						</div>
					</div>

					{/* Salary Range */}
					<div className="space-y-4">
						<Label>
							<Trans>Salary range</Trans>
						</Label>
						<div className="flex items-center gap-4">
							<span className="w-24 text-sm">{formData.salaryMin.toLocaleString()} MAD</span>
							<Slider
								value={[formData.salaryMin, formData.salaryMax]}
								min={2000}
								max={30000}
								step={500}
								onValueChange={(values) =>
									onFormDataChange({ ...formData, salaryMin: values[0], salaryMax: values[1] })
								}
								className="flex-1"
							/>
							<span className="w-24 text-right text-sm">{formData.salaryMax.toLocaleString()} MAD</span>
						</div>
					</div>

					{/* Industries */}
					<div className="space-y-2">
						<Label>
							<Trans>Industries</Trans>
						</Label>
						<div className="flex flex-wrap gap-2">
							{INDUSTRIES.map((industry) => (
								<Badge
									key={industry.value}
									variant={formData.industries.includes(industry.value) ? "default" : "outline"}
									className="cursor-pointer transition-all hover:scale-105"
									onClick={() => toggleIndustrySelection(industry.value)}
								>
									{formData.industries.includes(industry.value) && <CheckCircleIcon className="mr-1 size-3" />}
									{industry.label}
								</Badge>
							))}
						</div>
					</div>

					{/* Company Sizes */}
					<div className="space-y-2">
						<Label>
							<Trans>Company size</Trans>
						</Label>
						<div className="flex flex-wrap gap-2">
							{COMPANY_SIZES.map((size) => (
								<Badge
									key={size.value}
									variant={formData.companySizes.includes(size.value) ? "default" : "outline"}
									className="cursor-pointer transition-all hover:scale-105"
									onClick={() => toggleCompanySizeSelection(size.value)}
								>
									{formData.companySizes.includes(size.value) && <CheckCircleIcon className="mr-1 size-3" />}
									{size.label}
								</Badge>
							))}
						</div>
					</div>

					{/* Work Preference */}
					<div className="space-y-2">
						<Label>
							<Trans>Work preference</Trans>
						</Label>
						<div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
							{(
								Object.entries(WORK_PREFERENCE_CONFIG) as [
									WorkPreference,
									(typeof WORK_PREFERENCE_CONFIG)[WorkPreference],
								][]
							).map(([key, config]) => {
								const PrefIcon = config.icon;
								return (
									<Button
										key={key}
										type="button"
										variant={formData.workPreference === key ? "default" : "outline"}
										className="h-auto flex-col gap-1 py-3"
										onClick={() => onFormDataChange({ ...formData, workPreference: key })}
									>
										<PrefIcon className="size-5" weight="duotone" />
										<span className="text-xs">{config.label}</span>
									</Button>
								);
							})}
						</div>
					</div>

					{/* Notification Frequency */}
					<div className="space-y-2">
						<Label>
							<Trans>Notification frequency</Trans>
						</Label>
						<div className="grid gap-2 sm:grid-cols-3">
							{(
								Object.entries(FREQUENCY_CONFIG) as [
									NotificationFrequency,
									(typeof FREQUENCY_CONFIG)[NotificationFrequency],
								][]
							).map(([key, config]) => {
								const FreqIcon = config.icon;
								return (
									<Card
										key={key}
										className={cn(
											"cursor-pointer transition-all hover:border-primary",
											formData.frequency === key && "border-primary bg-primary/5",
										)}
										onClick={() => onFormDataChange({ ...formData, frequency: key })}
									>
										<CardContent className="flex items-center gap-3 p-3">
											<FreqIcon
												className={cn("size-5", formData.frequency === key ? "text-primary" : "text-muted-foreground")}
												weight="duotone"
											/>
											<div>
												<p className="font-medium text-sm">{config.label}</p>
												<p className="text-muted-foreground text-xs">{config.description}</p>
											</div>
										</CardContent>
									</Card>
								);
							})}
						</div>
					</div>
				</div>

				<DialogFooter>
					<DialogClose asChild>
						<Button variant="outline">
							<Trans>Cancel</Trans>
						</Button>
					</DialogClose>
					<Button
						onClick={editingAlertId ? onUpdate : onCreate}
						disabled={!formData.keywords.trim() || createPending || updatePending}
					>
						{(createPending || updatePending) && <SpinnerIcon className="mr-2 size-4 animate-spin" />}
						{editingAlertId ? <Trans>Update</Trans> : <Trans>Create alert</Trans>}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

// â”€â”€â”€ Delete Confirm Dialog â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

interface DeleteConfirmDialogProps {
	deleteConfirmId: string | null;
	onClose: () => void;
	onConfirm: (id: string) => void;
	isPending: boolean;
}

export function DeleteConfirmDialog({ deleteConfirmId, onClose, onConfirm, isPending }: DeleteConfirmDialogProps) {
	return (
		<Dialog open={!!deleteConfirmId} onOpenChange={() => onClose()}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<WarningIcon className="size-5 text-red-500" />
						<Trans>Delete this alert?</Trans>
					</DialogTitle>
					<DialogDescription>
						<Trans>This action is irreversible. The alert and all its matches will be permanently deleted.</Trans>
					</DialogDescription>
				</DialogHeader>
				<DialogFooter>
					<DialogClose asChild>
						<Button variant="outline">
							<Trans>Cancel</Trans>
						</Button>
					</DialogClose>
					<Button
						variant="destructive"
						onClick={() => deleteConfirmId && onConfirm(deleteConfirmId)}
						disabled={isPending}
					>
						{isPending && <SpinnerIcon className="mr-2 size-4 animate-spin" />}
						<TrashIcon className="mr-2 size-4" />
						<Trans>Delete</Trans>
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

// â”€â”€â”€ CTA Section â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export function CtaSection() {
	return (
		<Card className="mt-8 border-2 border-primary/30 bg-gradient-to-br from-primary/10 to-transparent">
			<CardContent className="flex flex-col items-center py-8 text-center">
				<div className="mb-4 flex size-16 items-center justify-center rounded-full bg-primary/20">
					<BriefcaseIcon className="size-8 text-primary" weight="duotone" />
				</div>
				<h3 className="mb-2 font-bold text-2xl">
					<Trans>Explore available offers</Trans>
				</h3>
				<p className="mb-6 max-w-md text-muted-foreground">
					<Trans>Browse all job offers and find the one that matches your profile.</Trans>
				</p>
				{/* biome-ignore lint/suspicious/noExplicitAny: Route path not in generated route tree */}
				<Link to={"/dashboard/jobs" as any}>
					<Button size="lg" className="gap-2">
						<Trans>View offers</Trans>
						<CaretRightIcon className="size-5" />
					</Button>
				</Link>
			</CardContent>
		</Card>
	);
}
