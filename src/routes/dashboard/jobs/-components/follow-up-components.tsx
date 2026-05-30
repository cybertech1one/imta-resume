import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import {
	BellRingingIcon,
	BuildingsIcon,
	CalendarIcon,
	ChartBarIcon,
	CheckCircleIcon,
	ClockIcon,
	CopyIcon,
	EnvelopeIcon,
	EyeIcon,
	FunnelIcon,
	InfoIcon,
	LightbulbIcon,
	MagnifyingGlassIcon,
	PaperPlaneTiltIcon,
	SparkleIcon,
	SpinnerIcon,
	TargetIcon,
	TimerIcon,
	TrendUpIcon,
} from "@phosphor-icons/react";
import { AnimatePresence, motion } from "motion/react";
import {
	Area,
	AreaChart,
	Bar,
	BarChart,
	CartesianGrid,
	Cell,
	Legend,
	Line,
	LineChart,
	Pie,
	PieChart,
	Tooltip as RechartsTooltip,
	ResponsiveContainer,
	XAxis,
	YAxis,
} from "recharts";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { formatDate } from "@/utils/format-date";
import { cn } from "@/utils/style";

import { bestPracticesTips, followUpTypeConfig, statusConfig } from "./follow-up-config";
import type {
	EmailTemplate,
	FollowUpApplication,
	FollowUpScheduleItem,
	FollowUpStatus,
	FollowUpType,
	ReminderSettings,
} from "./follow-up-types";

// ── Helper functions ────────────────────────────────────────────────────────

export function getDaysSince(dateString: string | Date | null | undefined): number {
	if (!dateString) return 0;
	const date = typeof dateString === "string" ? new Date(dateString) : dateString;
	const today = new Date();
	return Math.floor((today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
}

export function getNextFollowUpDate(appliedDate: string | Date | null | undefined, followUpCount: number): string {
	if (!appliedDate) return new Date().toISOString().split("T")[0];
	const date = typeof appliedDate === "string" ? new Date(appliedDate) : new Date(appliedDate);
	const daysToAdd = followUpCount === 0 ? 7 : followUpCount === 1 ? 14 : 21;
	date.setDate(date.getDate() + daysToAdd);
	return date.toISOString().split("T")[0];
}

export function deriveFollowUpStatus(
	appStatus: string,
	followUpCount: number,
	daysSinceApplied: number,
): FollowUpStatus {
	if (["phone_screen", "interview", "offer", "accepted"].includes(appStatus)) {
		return "responded";
	}
	if (["rejected", "withdrawn"].includes(appStatus) && followUpCount > 0) {
		return "no_response";
	}
	if (followUpCount >= 3 && daysSinceApplied > 30) {
		return "no_response";
	}
	if (followUpCount > 0) {
		return "sent";
	}
	return "not_sent";
}

// ── Hero Section ────────────────────────────────────────────────────────────

interface HeroSectionProps {
	stats: {
		total: number;
		responseRate: number;
		pendingFollowUps: number;
		overdueFollowUps: number;
	};
}

export function HeroSection({ stats }: HeroSectionProps) {
	return (
		<motion.div
			className="relative mb-8 overflow-hidden rounded-3xl border border-primary/20 p-8 md:p-12"
			style={{
				background:
					"linear-gradient(135deg, oklch(0.65 0.18 220 / 0.15) 0%, oklch(0.6 0.2 200 / 0.1) 50%, oklch(0.7 0.15 180 / 0.08) 100%)",
			}}
			initial={false}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.6, ease: "easeOut" }}
		>
			<div className="pointer-events-none absolute inset-0 overflow-hidden">
				<motion.div
					className="absolute -top-32 -right-32 size-96 rounded-full bg-gradient-to-br from-blue-500/20 to-cyan-500/10 blur-3xl"
					animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.3, 0.5] }}
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
					<EnvelopeIcon className="size-5 text-primary" weight="fill" />
					<span className="font-semibold text-primary text-sm uppercase tracking-wider">
						<Trans>Follow-Up Management</Trans>
					</span>
				</motion.div>

				<motion.h2
					className="mb-4 bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text font-bold text-3xl text-transparent tracking-tight md:text-4xl lg:text-5xl"
					initial={false}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.3 }}
				>
					<Trans>Follow-Up Tracking</Trans>
				</motion.h2>

				<motion.p
					className="mb-8 max-w-2xl text-lg text-muted-foreground"
					initial={false}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.4 }}
				>
					<Trans>
						Optimize your response chances by tracking your application follow-ups. Optimal timing, email templates, and
						response statistics.
					</Trans>
				</motion.p>

				<motion.div
					className="grid grid-cols-2 gap-4 sm:grid-cols-4"
					initial={false}
					animate={{ opacity: 1 }}
					transition={{ delay: 0.5 }}
				>
					<div className="rounded-xl border border-white/20 bg-white/50 p-4 backdrop-blur-sm dark:bg-black/20">
						<p className="font-bold text-2xl">{stats.total}</p>
						<p className="text-muted-foreground text-sm">
							<Trans>Applications</Trans>
						</p>
					</div>
					<div className="rounded-xl border border-white/20 bg-white/50 p-4 backdrop-blur-sm dark:bg-black/20">
						<p className="font-bold text-2xl text-green-600 dark:text-green-400">{stats.responseRate}%</p>
						<p className="text-muted-foreground text-sm">
							<Trans>Response rate</Trans>
						</p>
					</div>
					<div className="rounded-xl border border-white/20 bg-white/50 p-4 backdrop-blur-sm dark:bg-black/20">
						<p className="font-bold text-2xl text-amber-600 dark:text-amber-400">{stats.pendingFollowUps}</p>
						<p className="text-muted-foreground text-sm">
							<Trans>Pending follow-ups</Trans>
						</p>
					</div>
					<div className="rounded-xl border border-white/20 bg-white/50 p-4 backdrop-blur-sm dark:bg-black/20">
						<p className="font-bold text-2xl text-red-600 dark:text-red-400">{stats.overdueFollowUps}</p>
						<p className="text-muted-foreground text-sm">
							<Trans>Overdue</Trans>
						</p>
					</div>
				</motion.div>
			</div>
		</motion.div>
	);
}

// ── Timeline Tab ────────────────────────────────────────────────────────────

interface TimelineTabProps {
	followUpSchedule: FollowUpScheduleItem[];
	applications: FollowUpApplication[];
	setSelectedApplication: (app: FollowUpApplication | null) => void;
	setIsTemplateDialogOpen: (open: boolean) => void;
}

export function TimelineTab({
	followUpSchedule,
	applications,
	setSelectedApplication,
	setIsTemplateDialogOpen,
}: TimelineTabProps) {
	return (
		<div className="space-y-6">
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<CalendarIcon className="size-5 text-primary" weight="duotone" />
						<Trans>Follow-Up Calendar</Trans>
					</CardTitle>
					<CardDescription>
						<Trans>Plan your follow-ups to maximize your response chances</Trans>
					</CardDescription>
				</CardHeader>
				<CardContent>
					{followUpSchedule.length > 0 ? (
						<div className="space-y-4">
							{followUpSchedule.map((item, index) => {
								const typeConfig = followUpTypeConfig[item.type];
								return (
									<motion.div
										key={`${item.applicationId}-${item.type}`}
										initial={false}
										animate={{ opacity: 1, x: 0 }}
										transition={{ delay: index * 0.05 }}
										className={cn(
											"flex items-center gap-4 rounded-lg border p-4 transition-all hover:shadow-md",
											item.isOverdue && "border-red-300 bg-red-50/50 dark:border-red-900 dark:bg-red-950/20",
											item.daysUntilDue <= 3 &&
												!item.isOverdue &&
												"border-amber-300 bg-amber-50/50 dark:border-amber-900 dark:bg-amber-950/20",
										)}
									>
										<div className="flex flex-col items-center">
											<div className={cn("size-3 rounded-full", typeConfig.color)} />
											{index < followUpSchedule.length - 1 && <div className="h-8 w-0.5 bg-muted" />}
										</div>

										<div className="flex-1">
											<div className="flex flex-wrap items-center gap-2">
												<h4 className="font-semibold">{item.jobTitle}</h4>
												<Badge variant="outline" className="text-xs">
													{item.company}
												</Badge>
												<Badge className={cn("text-white text-xs", typeConfig.color)}>{typeConfig.label}</Badge>
											</div>
											<p className="mt-1 text-muted-foreground text-sm">
												{item.isOverdue ? (
													<span className="font-medium text-red-600 dark:text-red-400">
														{Math.abs(item.daysUntilDue)} days overdue
													</span>
												) : item.daysUntilDue === 0 ? (
													<span className="font-medium text-amber-600 dark:text-amber-400">Due today</span>
												) : item.daysUntilDue <= 3 ? (
													<span className="text-amber-600 dark:text-amber-400">
														In {item.daysUntilDue} days - {formatDate(item.dueDate)}
													</span>
												) : (
													<span>
														In {item.daysUntilDue} days - {formatDate(item.dueDate)}
													</span>
												)}
											</p>
										</div>

										<div className="flex items-center gap-2">
											<Button
												size="sm"
												variant={item.isOverdue ? "destructive" : "default"}
												className="gap-1"
												onClick={() => {
													const app = applications.find((a) => a.id === item.applicationId);
													if (app) {
														setSelectedApplication(app);
														setIsTemplateDialogOpen(true);
													}
												}}
											>
												<PaperPlaneTiltIcon className="size-4" />
												<Trans>Send</Trans>
											</Button>
										</div>
									</motion.div>
								);
							})}
						</div>
					) : (
						<div className="flex flex-col items-center justify-center py-12 text-center">
							<CheckCircleIcon className="mb-4 size-12 text-green-500" weight="duotone" />
							<h3 className="font-semibold text-lg">
								<Trans>No follow-ups scheduled</Trans>
							</h3>
							<p className="text-muted-foreground">
								<Trans>All your follow-ups are up to date!</Trans>
							</p>
						</div>
					)}
				</CardContent>
			</Card>

			{/* Timing suggestions */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<TimerIcon className="size-5 text-primary" weight="duotone" />
						<Trans>Optimal Timing</Trans>
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="grid gap-4 md:grid-cols-3">
						{Object.entries(followUpTypeConfig).map(([key, config]) => (
							<div key={key} className="rounded-lg border p-4 transition-all hover:shadow-md">
								<div className="mb-2 flex items-center gap-2">
									<div className={cn("size-3 rounded-full", config.color)} />
									<span className="font-medium">{config.label}</span>
								</div>
								<p className="text-muted-foreground text-sm">
									<Trans>Recommended after</Trans> <span className="font-bold text-foreground">{config.days} days</span>
								</p>
							</div>
						))}
					</div>
				</CardContent>
			</Card>
		</div>
	);
}

// ── Applications Tab ────────────────────────────────────────────────────────

interface ApplicationsTabProps {
	filteredApplications: FollowUpApplication[];
	searchQuery: string;
	setSearchQuery: (query: string) => void;
	statusFilter: FollowUpStatus | "all";
	setStatusFilter: (filter: FollowUpStatus | "all") => void;
	selectedApplicationIds: string[];
	toggleApplicationSelection: (appId: string) => void;
	selectAllApplications: () => void;
	clearSelection: () => void;
	handleBulkMarkAsSent: () => Promise<void>;
	handleStatusChange: (appId: string, newStatus: FollowUpStatus) => Promise<void>;
	setSelectedApplication: (app: FollowUpApplication | null) => void;
	setIsTemplateDialogOpen: (open: boolean) => void;
	addActivityMutationIsPending: boolean;
}

export function ApplicationsTab({
	filteredApplications,
	searchQuery,
	setSearchQuery,
	statusFilter,
	setStatusFilter,
	selectedApplicationIds,
	toggleApplicationSelection,
	selectAllApplications,
	clearSelection,
	handleBulkMarkAsSent,
	handleStatusChange,
	setSelectedApplication,
	setIsTemplateDialogOpen,
	addActivityMutationIsPending,
}: ApplicationsTabProps) {
	return (
		<div className="space-y-6">
			{/* Filters and bulk actions */}
			<Card>
				<CardContent className="p-4">
					<div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
						<div className="flex flex-1 flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center">
							<div className="relative w-full min-w-[200px] sm:flex-1 lg:max-w-xs">
								<MagnifyingGlassIcon className="absolute top-1/2 left-3 size-5 -translate-y-1/2 text-muted-foreground" />
								<Input
									placeholder={t`Search...`}
									value={searchQuery}
									onChange={(e) => setSearchQuery(e.target.value)}
									className="pl-10"
								/>
							</div>

							<Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as FollowUpStatus | "all")}>
								<SelectTrigger className="w-full sm:w-[180px]">
									<FunnelIcon className="mr-2 size-4" />
									<SelectValue placeholder={t`Filter by status`} />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">
										<Trans>All statuses</Trans>
									</SelectItem>
									{(Object.entries(statusConfig) as [FollowUpStatus, (typeof statusConfig)[FollowUpStatus]][]).map(
										([key, config]) => {
											const StatusIcon = config.icon;
											return (
												<SelectItem key={key} value={key}>
													<div className="flex items-center gap-2">
														<StatusIcon className="size-4" />
														{config.label}
													</div>
												</SelectItem>
											);
										},
									)}
								</SelectContent>
							</Select>
						</div>

						{selectedApplicationIds.length > 0 && (
							<div className="flex items-center gap-2">
								<Badge variant="secondary">{selectedApplicationIds.length} selected</Badge>
								<Button
									size="sm"
									className="gap-1"
									onClick={handleBulkMarkAsSent}
									disabled={addActivityMutationIsPending}
								>
									{addActivityMutationIsPending ? (
										<SpinnerIcon className="size-4 animate-spin" />
									) : (
										<PaperPlaneTiltIcon className="size-4" />
									)}
									<Trans>Mark as sent</Trans>
								</Button>
								<Button size="sm" variant="ghost" onClick={clearSelection}>
									<Trans>Cancel</Trans>
								</Button>
							</div>
						)}

						{selectedApplicationIds.length === 0 && (
							<Button variant="outline" size="sm" onClick={selectAllApplications}>
								<Trans>Select all</Trans>
							</Button>
						)}
					</div>
				</CardContent>
			</Card>

			{/* Applications list */}
			<AnimatePresence mode="popLayout">
				{filteredApplications.length > 0 ? (
					<div className="space-y-4">
						{filteredApplications.map((app, index) => {
							const status = statusConfig[app.followUpStatus];
							const StatusIcon = status.icon;
							const daysSinceApplied = getDaysSince(app.appliedDate);
							const isSelected = selectedApplicationIds.includes(app.id);

							return (
								<motion.div
									key={app.id}
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									exit={{ opacity: 0, scale: 0.95 }}
									transition={{ delay: index * 0.05 }}
								>
									<Card className={cn("transition-all hover:shadow-md", isSelected && "ring-2 ring-primary")}>
										<CardContent className="p-4 md:p-6">
											<div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
												<div className="flex items-start gap-4">
													{app.followUpStatus !== "responded" && app.followUpStatus !== "no_response" && (
														<Checkbox
															checked={isSelected}
															onCheckedChange={() => toggleApplicationSelection(app.id)}
															className="mt-1"
														/>
													)}
													<div className="space-y-2">
														<div className="flex flex-wrap items-center gap-2">
															<h3 className="font-semibold text-lg">{app.jobTitle}</h3>
															<Badge className={cn(status.bgColor, status.color)}>
																<StatusIcon className="mr-1 size-3" />
																{status.label}
															</Badge>
														</div>
														<div className="flex flex-wrap items-center gap-4 text-muted-foreground text-sm">
															<span className="flex items-center gap-1">
																<BuildingsIcon className="size-4" />
																{app.company}
															</span>
															<span className="flex items-center gap-1">
																<CalendarIcon className="size-4" />
																<Trans>Applied {daysSinceApplied} days ago</Trans>
															</span>
															{app.followUpCount > 0 && (
																<span className="flex items-center gap-1">
																	<EnvelopeIcon className="size-4" />
																	<Trans>{app.followUpCount} follow-up(s)</Trans>
																</span>
															)}
														</div>
														{app.contactEmail && (
															<p className="text-muted-foreground text-sm">
																{app.contactName && `${app.contactName} - `}
																{app.contactEmail}
															</p>
														)}
														{app.notes && (
															<p className="line-clamp-2 text-muted-foreground text-sm italic">{app.notes}</p>
														)}
													</div>
												</div>

												<div className="flex items-center gap-2">
													<Select
														value={app.followUpStatus}
														onValueChange={(v) => handleStatusChange(app.id, v as FollowUpStatus)}
													>
														<SelectTrigger className="w-[160px]">
															<SelectValue />
														</SelectTrigger>
														<SelectContent>
															{(
																Object.entries(statusConfig) as [
																	FollowUpStatus,
																	(typeof statusConfig)[FollowUpStatus],
																][]
															).map(([key, config]) => {
																const Icon = config.icon;
																return (
																	<SelectItem key={key} value={key}>
																		<div className="flex items-center gap-2">
																			<Icon className="size-4" />
																			{config.label}
																		</div>
																	</SelectItem>
																);
															})}
														</SelectContent>
													</Select>
													<Button
														variant="outline"
														size="sm"
														onClick={() => {
															setSelectedApplication(app);
															setIsTemplateDialogOpen(true);
														}}
													>
														<PaperPlaneTiltIcon className="size-4" />
													</Button>
												</div>
											</div>
										</CardContent>
									</Card>
								</motion.div>
							);
						})}
					</div>
				) : (
					<Card className="border-dashed">
						<CardContent className="flex flex-col items-center justify-center py-16">
							<EnvelopeIcon className="mb-4 size-16 text-muted-foreground/50" weight="duotone" />
							<h3 className="mb-2 font-semibold text-lg">
								<Trans>No applications found</Trans>
							</h3>
							<p className="text-muted-foreground">
								{searchQuery || statusFilter !== "all" ? (
									<Trans>Try changing your filters</Trans>
								) : (
									<Trans>No applications to follow up on. Add applications in the "My Applications" section.</Trans>
								)}
							</p>
						</CardContent>
					</Card>
				)}
			</AnimatePresence>
		</div>
	);
}

// ── Templates Tab ───────────────────────────────────────────────────────────

interface TemplatesTabProps {
	emailTemplates: EmailTemplate[];
	handleCopyTemplate: (template: EmailTemplate) => void;
	setSelectedTemplate: (template: EmailTemplate | null) => void;
}

export function TemplatesTab({ emailTemplates, handleCopyTemplate, setSelectedTemplate }: TemplatesTabProps) {
	return (
		<div className="grid gap-6 lg:grid-cols-3">
			{(["initial", "second", "final"] as FollowUpType[]).map((type) => {
				const typeConfig = followUpTypeConfig[type];
				const templates = emailTemplates.filter((t) => t.type === type);

				return (
					<div key={type} className="space-y-4">
						<div className="flex items-center gap-2">
							<div className={cn("size-3 rounded-full", typeConfig.color)} />
							<h3 className="font-semibold">{typeConfig.label}</h3>
						</div>

						{templates.map((template) => (
							<motion.div key={template.id} initial={false} animate={{ opacity: 1, y: 0 }}>
								<Card className="transition-all hover:shadow-md">
									<CardHeader className="pb-2">
										<CardTitle className="text-base">{template.name}</CardTitle>
										<CardDescription className="text-xs">Subject: {template.subject}</CardDescription>
									</CardHeader>
									<CardContent className="space-y-3">
										<p className="line-clamp-4 whitespace-pre-wrap text-muted-foreground text-sm">{template.body}</p>
										<div className="flex gap-2">
											<Button
												size="sm"
												variant="outline"
												className="flex-1 gap-1"
												onClick={() => handleCopyTemplate(template)}
											>
												<CopyIcon className="size-4" />
												<Trans>Copy</Trans>
											</Button>
											<Button
												size="sm"
												variant="outline"
												className="gap-1"
												onClick={() => {
													setSelectedTemplate(template);
												}}
											>
												<EyeIcon className="size-4" />
											</Button>
										</div>
									</CardContent>
								</Card>
							</motion.div>
						))}
					</div>
				);
			})}
		</div>
	);
}

// ── Analytics Tab ───────────────────────────────────────────────────────────

interface AnalyticsTabProps {
	stats: {
		responseRate: number;
		responded: number;
		sent: number;
		notSent: number;
		noResponse: number;
	};
	applications: FollowUpApplication[];
	statisticsData: { responseRate?: number } | undefined;
	responseRateData: Array<{ month: string; sent: number; responded: number; rate: number }>;
	timingEffectivenessData: Array<{ timing: string; rate: number; count: number }>;
	statusDistributionData: Array<{ name: string; value: number; color: string }>;
}

export function AnalyticsTab({
	stats,
	applications,
	statisticsData,
	responseRateData,
	timingEffectivenessData,
	statusDistributionData,
}: AnalyticsTabProps) {
	const metricsCards = [
		{
			label: "Overall response rate",
			value: `${stats.responseRate}%`,
			icon: TargetIcon,
			color: "text-green-600 dark:text-green-400",
			bgColor: "bg-green-100 dark:bg-green-900/30",
		},
		{
			label: "Follow-ups sent",
			value: applications.reduce((sum, a) => sum + a.followUpCount, 0).toString(),
			icon: PaperPlaneTiltIcon,
			color: "text-blue-600 dark:text-blue-400",
			bgColor: "bg-blue-100 dark:bg-blue-900/30",
		},
		{
			label: "Responses received",
			value: stats.responded.toString(),
			icon: CheckCircleIcon,
			color: "text-emerald-600 dark:text-emerald-400",
			bgColor: "bg-emerald-100 dark:bg-emerald-900/30",
		},
		{
			label: "Rate this week",
			value: `${statisticsData?.responseRate ?? 0}%`,
			icon: ClockIcon,
			color: "text-purple-600 dark:text-purple-400",
			bgColor: "bg-purple-100 dark:bg-purple-900/30",
		},
	];

	return (
		<div className="space-y-6">
			{/* Success metrics */}
			<div className="grid gap-4 md:grid-cols-4">
				{metricsCards.map((metric, index) => {
					const MetricIcon = metric.icon;
					return (
						<motion.div
							key={metric.label}
							initial={false}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: index * 0.1 }}
						>
							<Card className="transition-all hover:shadow-md">
								<CardContent className="flex items-center gap-4 p-6">
									<div className={cn("flex size-12 items-center justify-center rounded-xl", metric.bgColor)}>
										<MetricIcon className={cn("size-6", metric.color)} weight="duotone" />
									</div>
									<div>
										<p className="font-bold text-2xl">{metric.value}</p>
										<p className="text-muted-foreground text-sm">{metric.label}</p>
									</div>
								</CardContent>
							</Card>
						</motion.div>
					);
				})}
			</div>

			{/* Charts */}
			<div className="grid gap-6 lg:grid-cols-2">
				{/* Response rate over time */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<TrendUpIcon className="size-5 text-primary" weight="duotone" />
							<Trans>Response Rate Trends</Trans>
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="h-[300px]">
							<ResponsiveContainer width="100%" height="100%">
								<AreaChart data={responseRateData}>
									<CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
									<XAxis dataKey="month" className="text-xs" />
									<YAxis className="text-xs" />
									<RechartsTooltip
										contentStyle={{
											backgroundColor: "hsl(var(--background))",
											border: "1px solid hsl(var(--border))",
											borderRadius: "8px",
										}}
									/>
									<Area
										type="monotone"
										dataKey="rate"
										stroke="hsl(var(--primary))"
										fill="hsl(var(--primary) / 0.2)"
										name="Response rate (%)"
									/>
								</AreaChart>
							</ResponsiveContainer>
						</div>
					</CardContent>
				</Card>

				{/* Timing effectiveness */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<TimerIcon className="size-5 text-primary" weight="duotone" />
							<Trans>Effectiveness by Follow-Up Delay</Trans>
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="h-[300px]">
							<ResponsiveContainer width="100%" height="100%">
								<BarChart data={timingEffectivenessData}>
									<CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
									<XAxis dataKey="timing" className="text-xs" />
									<YAxis className="text-xs" />
									<RechartsTooltip
										contentStyle={{
											backgroundColor: "hsl(var(--background))",
											border: "1px solid hsl(var(--border))",
											borderRadius: "8px",
										}}
									/>
									<Bar dataKey="rate" fill="hsl(var(--primary))" name="Response rate (%)" radius={[4, 4, 0, 0]} />
								</BarChart>
							</ResponsiveContainer>
						</div>
					</CardContent>
				</Card>

				{/* Status distribution */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<ChartBarIcon className="size-5 text-primary" weight="duotone" />
							<Trans>Status Distribution</Trans>
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="h-[300px]">
							{statusDistributionData.length > 0 ? (
								<ResponsiveContainer width="100%" height="100%">
									<PieChart>
										<Pie
											data={statusDistributionData}
											cx="50%"
											cy="50%"
											outerRadius={100}
											dataKey="value"
											label={({ name, value }) => `${name}: ${value}`}
										>
											{statusDistributionData.map((entry, index) => (
												<Cell key={`cell-${index}`} fill={entry.color} />
											))}
										</Pie>
										<RechartsTooltip
											contentStyle={{
												backgroundColor: "hsl(var(--background))",
												border: "1px solid hsl(var(--border))",
												borderRadius: "8px",
											}}
										/>
										<Legend />
									</PieChart>
								</ResponsiveContainer>
							) : (
								<div className="flex h-full items-center justify-center text-muted-foreground">
									<Trans>No data available</Trans>
								</div>
							)}
						</div>
					</CardContent>
				</Card>

				{/* Follow-up count vs response */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<EnvelopeIcon className="size-5 text-primary" weight="duotone" />
							<Trans>Follow-Ups Sent vs Responses</Trans>
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="h-[300px]">
							<ResponsiveContainer width="100%" height="100%">
								<LineChart data={responseRateData}>
									<CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
									<XAxis dataKey="month" className="text-xs" />
									<YAxis className="text-xs" />
									<RechartsTooltip
										contentStyle={{
											backgroundColor: "hsl(var(--background))",
											border: "1px solid hsl(var(--border))",
											borderRadius: "8px",
										}}
									/>
									<Legend />
									<Line
										type="monotone"
										dataKey="sent"
										stroke="#3b82f6"
										name="Follow-ups sent"
										strokeWidth={2}
										dot={{ r: 4 }}
									/>
									<Line
										type="monotone"
										dataKey="responded"
										stroke="#22c55e"
										name="Responses received"
										strokeWidth={2}
										dot={{ r: 4 }}
									/>
								</LineChart>
							</ResponsiveContainer>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}

// ── Tips Tab ────────────────────────────────────────────────────────────────

export function TipsTab() {
	return (
		<div className="space-y-6">
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<LightbulbIcon className="size-5 text-amber-500" weight="fill" />
						<Trans>Follow-Up Best Practices</Trans>
					</CardTitle>
					<CardDescription>
						<Trans>Follow these tips to maximize your response chances</Trans>
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
						{bestPracticesTips.map((tip, index) => {
							const TipIcon = tip.icon;
							return (
								<motion.div
									key={tip.id}
									initial={false}
									animate={{ opacity: 1, y: 0 }}
									transition={{ delay: index * 0.1 }}
								>
									<Card className="h-full transition-all hover:shadow-md">
										<CardContent className="p-6">
											<div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-primary/10">
												<TipIcon className="size-6 text-primary" weight="duotone" />
											</div>
											<h4 className="mb-2 font-semibold">{tip.title}</h4>
											<p className="text-muted-foreground text-sm">{tip.description}</p>
										</CardContent>
									</Card>
								</motion.div>
							);
						})}
					</div>
				</CardContent>
			</Card>

			{/* Pro tip section */}
			<Card className="border-2 border-amber-200 bg-amber-50/50 dark:border-amber-900 dark:bg-amber-950/20">
				<CardContent className="p-6">
					<div className="flex items-start gap-4">
						<div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-900/50">
							<SparkleIcon className="size-6 text-amber-600 dark:text-amber-400" weight="fill" />
						</div>
						<div>
							<h3 className="mb-2 font-semibold text-lg">
								<Trans>Pro Tip</Trans>
							</h3>
							<p className="text-muted-foreground">
								<Trans>
									Applications followed up with regular follow-ups are 3 times more likely to get a response. The ideal
									timing for the first follow-up is 7 days after sending your application. Don't forget to personalize
									each message!
								</Trans>
							</p>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}

// ── Template Send Dialog ────────────────────────────────────────────────────

interface TemplateSendDialogProps {
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
	selectedApplication: FollowUpApplication | null;
	selectedTemplate: EmailTemplate | null;
	setSelectedTemplate: (template: EmailTemplate | null) => void;
	emailTemplates: EmailTemplate[];
	handleCopyTemplate: (template: EmailTemplate) => void;
	handleStatusChange: (appId: string, newStatus: FollowUpStatus) => Promise<void>;
	setSelectedApplication: (app: FollowUpApplication | null) => void;
	addActivityMutationIsPending: boolean;
}

export function TemplateSendDialog({
	isOpen,
	onOpenChange,
	selectedApplication,
	selectedTemplate,
	setSelectedTemplate,
	emailTemplates,
	handleCopyTemplate,
	handleStatusChange,
	setSelectedApplication,
	addActivityMutationIsPending,
}: TemplateSendDialogProps) {
	return (
		<Dialog open={isOpen} onOpenChange={onOpenChange}>
			<DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<EnvelopeIcon className="size-5 text-primary" />
						<Trans>Send a Follow-Up</Trans>
					</DialogTitle>
					<DialogDescription>
						{selectedApplication && (
							<span>
								{selectedApplication.jobTitle} - {selectedApplication.company}
							</span>
						)}
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-4 py-4">
					<div className="space-y-2">
						<Label>
							<Trans>Choose a template</Trans>
						</Label>
						<Select
							value={selectedTemplate?.id || ""}
							onValueChange={(v) => {
								const template = emailTemplates.find((t) => t.id === v);
								setSelectedTemplate(template || null);
							}}
						>
							<SelectTrigger>
								<SelectValue placeholder={t`Select a template`} />
							</SelectTrigger>
							<SelectContent>
								{emailTemplates.map((template) => (
									<SelectItem key={template.id} value={template.id}>
										<div className="flex items-center gap-2">
											<div className={cn("size-2 rounded-full", followUpTypeConfig[template.type].color)} />
											{template.name}
										</div>
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					{selectedTemplate && (
						<>
							<div className="space-y-2">
								<Label>
									<Trans>Subject</Trans>
								</Label>
								<Input value={selectedTemplate.subject} readOnly className="bg-muted" />
							</div>

							<div className="space-y-2">
								<Label>
									<Trans>Message body</Trans>
								</Label>
								<Textarea value={selectedTemplate.body} readOnly className="min-h-[200px] bg-muted" />
							</div>

							<div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-950/20">
								<p className="flex items-center gap-2 text-blue-700 text-sm dark:text-blue-400">
									<InfoIcon className="size-4" />
									<Trans>
										Replace the placeholders [Position], [Recruiter name], [Date] and [Your name] before sending.
									</Trans>
								</p>
							</div>
						</>
					)}
				</div>

				<DialogFooter>
					<DialogClose asChild>
						<Button variant="outline">
							<Trans>Cancel</Trans>
						</Button>
					</DialogClose>
					<Button
						className="gap-2"
						onClick={async () => {
							if (selectedTemplate) {
								handleCopyTemplate(selectedTemplate);
							}
							if (selectedApplication) {
								await handleStatusChange(selectedApplication.id, "sent");
							}
							onOpenChange(false);
							setSelectedTemplate(null);
							setSelectedApplication(null);
						}}
						disabled={!selectedTemplate || addActivityMutationIsPending}
					>
						{addActivityMutationIsPending ? (
							<SpinnerIcon className="size-4 animate-spin" />
						) : (
							<CopyIcon className="size-4" />
						)}
						<Trans>Copy and Mark as Sent</Trans>
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

// ── Reminder Settings Dialog ────────────────────────────────────────────────

interface ReminderSettingsDialogProps {
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
	reminderSettings: ReminderSettings;
	setReminderSettings: (settings: ReminderSettings) => void;
}

export function ReminderSettingsDialog({
	isOpen,
	onOpenChange,
	reminderSettings,
	setReminderSettings,
}: ReminderSettingsDialogProps) {
	return (
		<Dialog open={isOpen} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<BellRingingIcon className="size-5 text-primary" />
						<Trans>Reminder Settings</Trans>
					</DialogTitle>
					<DialogDescription>
						<Trans>Configure reminders for your application follow-ups</Trans>
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-6 py-4">
					<div className="flex items-center justify-between">
						<div className="space-y-0.5">
							<Label>
								<Trans>Enable reminders</Trans>
							</Label>
							<p className="text-muted-foreground text-sm">
								<Trans>Receive notifications for your follow-ups</Trans>
							</p>
						</div>
						<Switch
							checked={reminderSettings.enabled}
							onCheckedChange={(checked) => setReminderSettings({ ...reminderSettings, enabled: checked })}
						/>
					</div>

					<div className="space-y-4">
						<h4 className="font-medium">
							<Trans>Reminder delays (days)</Trans>
						</h4>

						<div className="grid gap-4">
							<div className="flex items-center justify-between">
								<Label className="flex items-center gap-2">
									<div className="size-2 rounded-full bg-blue-500" />
									<Trans>First follow-up</Trans>
								</Label>
								<Input
									type="number"
									value={reminderSettings.firstFollowUp}
									onChange={(e) =>
										setReminderSettings({
											...reminderSettings,
											firstFollowUp: Number.parseInt(e.target.value, 10) || 7,
										})
									}
									className="w-20"
									min={1}
									max={30}
								/>
							</div>

							<div className="flex items-center justify-between">
								<Label className="flex items-center gap-2">
									<div className="size-2 rounded-full bg-amber-500" />
									<Trans>Second follow-up</Trans>
								</Label>
								<Input
									type="number"
									value={reminderSettings.secondFollowUp}
									onChange={(e) =>
										setReminderSettings({
											...reminderSettings,
											secondFollowUp: Number.parseInt(e.target.value, 10) || 14,
										})
									}
									className="w-20"
									min={1}
									max={30}
								/>
							</div>

							<div className="flex items-center justify-between">
								<Label className="flex items-center gap-2">
									<div className="size-2 rounded-full bg-red-500" />
									<Trans>Final follow-up</Trans>
								</Label>
								<Input
									type="number"
									value={reminderSettings.finalFollowUp}
									onChange={(e) =>
										setReminderSettings({
											...reminderSettings,
											finalFollowUp: Number.parseInt(e.target.value, 10) || 21,
										})
									}
									className="w-20"
									min={1}
									max={30}
								/>
							</div>
						</div>
					</div>

					<div className="space-y-4">
						<h4 className="font-medium">
							<Trans>Notification type</Trans>
						</h4>

						<div className="flex items-center justify-between">
							<Label>
								<Trans>Email notifications</Trans>
							</Label>
							<Switch
								checked={reminderSettings.emailNotifications}
								onCheckedChange={(checked) => setReminderSettings({ ...reminderSettings, emailNotifications: checked })}
							/>
						</div>

						<div className="flex items-center justify-between">
							<Label>
								<Trans>Browser notifications</Trans>
							</Label>
							<Switch
								checked={reminderSettings.browserNotifications}
								onCheckedChange={(checked) =>
									setReminderSettings({ ...reminderSettings, browserNotifications: checked })
								}
							/>
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
						onClick={() => {
							toast.success(t`Settings saved`);
							onOpenChange(false);
						}}
					>
						<Trans>Save</Trans>
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
