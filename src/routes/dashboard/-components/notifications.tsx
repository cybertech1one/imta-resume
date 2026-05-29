import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import {
	BellIcon,
	BellSimpleIcon,
	BellSimpleRingingIcon,
	CalendarIcon,
	CheckCircleIcon,
	CheckIcon,
	GearSixIcon,
	LightbulbIcon,
	MegaphoneIcon,
	SparkleIcon,
	TrophyIcon,
	XIcon,
} from "@phosphor-icons/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { authClient } from "@/integrations/auth/client";
import { orpc } from "@/integrations/orpc/client";
import { cn } from "@/utils/style";

// Notification types
export type NotificationType = "tip" | "reminder" | "milestone" | "announcement";

// Local storage keys (only for UI state that doesn't need to persist across devices)
const LAST_TIP_INDEX_KEY = "last-tip-index";
const LAST_TIP_DATE_KEY = "last-tip-date";
const CREATED_ANNOUNCEMENTS_KEY = "created-announcements";

// Daily interview tips (rotating) - wrapped in function so t`` resolves with active locale
function getDailyTips() {
	return [
		{
			title: t`Arrive early`,
			description: t`Plan to arrive 10-15 minutes before your interview to settle in calmly.`,
		},
		{
			title: t`Prepare questions`,
			description: t`Always have 2-3 questions to ask the recruiter to show your interest.`,
		},
		{
			title: t`Master the STAR method`,
			description: t`Use Situation, Task, Action, Result to structure your answers.`,
		},
		{
			title: t`Mind your body language`,
			description: t`Maintain eye contact, smile, and adopt an open posture.`,
		},
		{
			title: t`Research the company`,
			description: t`Check the company's website and news before the interview.`,
		},
		{
			title: t`Listen carefully`,
			description: t`Never interrupt and take the time to fully understand the questions.`,
		},
		{
			title: t`Be authentic`,
			description: t`Be yourself while highlighting your skills and experiences.`,
		},
		{
			title: t`Prepare your introduction`,
			description: t`Practice introducing yourself in 2-3 minutes in a concise and impactful way.`,
		},
		{
			title: t`Dress professionally`,
			description: t`Choose an outfit suited to the industry and company culture.`,
		},
		{
			title: t`Bring your documents`,
			description: t`Have multiple copies of your resume, cover letter, and diplomas.`,
		},
		{
			title: t`Manage your stress`,
			description: t`Breathe deeply and remember that you are prepared.`,
		},
		{
			title: t`Send a thank-you after the interview`,
			description: t`Send a thank-you email within 24 hours after the interview.`,
		},
		{
			title: t`Prepare your references`,
			description: t`Have a list of people who can speak about your skills.`,
		},
		{
			title: t`Quantify your achievements`,
			description: t`Use concrete numbers to illustrate your accomplishments.`,
		},
	];
}

// Platform announcements - wrapped in function so t`` resolves with active locale
function getPlatformAnnouncements() {
	return [
		{
			id: "announce-ai-chatbot",
			title: t`New: AI Chatbot`,
			description: t`Practice your interviews with our AI assistant to prepare effectively.`,
			link: "/dashboard/interview/chatbot",
		},
		{
			id: "announce-career-quiz",
			title: t`Career Quiz`,
			description: t`Discover careers that match your personality with our new quiz.`,
			link: "/dashboard/career/quiz",
		},
	];
}

// Icon mapping for notification types
const notificationIcons: Record<NotificationType, typeof BellIcon> = {
	tip: LightbulbIcon,
	reminder: CalendarIcon,
	milestone: TrophyIcon,
	announcement: MegaphoneIcon,
};

// Color mapping for notification types
const notificationColors: Record<NotificationType, { bg: string; text: string; border: string }> = {
	tip: {
		bg: "bg-amber-100 dark:bg-amber-900/30",
		text: "text-amber-600 dark:text-amber-400",
		border: "border-amber-500/30",
	},
	reminder: {
		bg: "bg-blue-100 dark:bg-blue-900/30",
		text: "text-blue-600 dark:text-blue-400",
		border: "border-blue-500/30",
	},
	milestone: {
		bg: "bg-green-100 dark:bg-green-900/30",
		text: "text-green-600 dark:text-green-400",
		border: "border-green-500/30",
	},
	announcement: {
		bg: "bg-purple-100 dark:bg-purple-900/30",
		text: "text-purple-600 dark:text-purple-400",
		border: "border-purple-500/30",
	},
};

// Format relative time
function formatRelativeTime(date: Date): string {
	const now = new Date();
	const diffMs = now.getTime() - date.getTime();
	const diffMins = Math.floor(diffMs / (1000 * 60));
	const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
	const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

	if (diffMins < 1) {
		return t`Just now`;
	}
	if (diffMins < 60) {
		return t`${diffMins} min ago`;
	}
	if (diffHours < 24) {
		return t`${diffHours}h ago`;
	}
	if (diffDays === 1) {
		return t`Yesterday`;
	}
	if (diffDays < 7) {
		return t`${diffDays}d ago`;
	}
	return date.toLocaleDateString(undefined, { day: "numeric", month: "short" });
}

// Get today's tip based on day of year
function getDailyTipIndex(): number {
	const now = new Date();
	const start = new Date(now.getFullYear(), 0, 0);
	const diff = now.getTime() - start.getTime();
	const oneDay = 1000 * 60 * 60 * 24;
	const dayOfYear = Math.floor(diff / oneDay);
	return dayOfYear % getDailyTips().length;
}

// Check if it's a new day
function isNewDay(lastDate: string | null): boolean {
	if (!lastDate) return true;
	const last = new Date(lastDate);
	const now = new Date();
	return last.toDateString() !== now.toDateString();
}

export function NotificationCenter() {
	const { data: session } = authClient.useSession();
	const queryClient = useQueryClient();
	const [isOpen, setIsOpen] = useState(false);
	const [showSettings, setShowSettings] = useState(false);

	// Fetch notifications from database
	const { data: notifications = [] } = useQuery({
		...orpc.notification.list.queryOptions({
			input: { dismissed: false },
		}),
		enabled: !!session?.user,
	});

	// Fetch preferences from database
	const { data: preferences } = useQuery({
		...orpc.notification.preferences.get.queryOptions(),
		enabled: !!session?.user,
	});

	// Create notification mutation
	const createNotificationMutation = useMutation({
		...orpc.notification.create.mutationOptions(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: orpc.notification.list.key() });
		},
	});

	// Update notification mutation (mark as read/dismissed)
	const updateNotificationMutation = useMutation({
		...orpc.notification.update.mutationOptions(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: orpc.notification.list.key() });
		},
	});

	// Mark all as read mutation
	const markAllAsReadMutation = useMutation({
		...orpc.notification.markAllAsRead.mutationOptions(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: orpc.notification.list.key() });
		},
	});

	// Update preferences mutation
	const updatePreferencesMutation = useMutation({
		...orpc.notification.preferences.update.mutationOptions(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: orpc.notification.preferences.get.key() });
		},
	});

	// Check and create daily tip, announcements, and reminders on mount
	// biome-ignore lint/correctness/useExhaustiveDependencies: Intentionally run only on mount to avoid duplicate notifications
	useEffect(() => {
		const checkAndCreateNotifications = async () => {
			try {
				// Check for daily tip
				const lastTipDate = localStorage.getItem(LAST_TIP_DATE_KEY);
				if (isNewDay(lastTipDate)) {
					const tips = getDailyTips();
					const tipIndex = getDailyTipIndex();
					const tip = tips[tipIndex];

					await createNotificationMutation.mutateAsync({
						type: "tip",
						title: tip.title,
						description: tip.description,
					});

					localStorage.setItem(LAST_TIP_DATE_KEY, new Date().toISOString());
					localStorage.setItem(LAST_TIP_INDEX_KEY, tipIndex.toString());
				}

				// Check for announcements - track created ones in localStorage to avoid duplicates
				const createdAnnouncements: string[] = JSON.parse(localStorage.getItem(CREATED_ANNOUNCEMENTS_KEY) || "[]");
				for (const announcement of getPlatformAnnouncements()) {
					if (!createdAnnouncements.includes(announcement.id)) {
						await createNotificationMutation.mutateAsync({
							type: "announcement",
							title: announcement.title,
							description: announcement.description,
							link: announcement.link,
							metadata: { announcementId: announcement.id },
						});
						createdAnnouncements.push(announcement.id);
					}
				}
				localStorage.setItem(CREATED_ANNOUNCEMENTS_KEY, JSON.stringify(createdAnnouncements));

				// Check for interview reminders from checklist localStorage
				const reminderData = localStorage.getItem("interview-reminder");
				if (reminderData) {
					const reminder = JSON.parse(reminderData);
					if (reminder.date && reminder.time) {
						const interviewDate = new Date(`${reminder.date}T${reminder.time}`);
						const now = new Date();
						const hoursDiff = (interviewDate.getTime() - now.getTime()) / (1000 * 60 * 60);

						// Add reminder if interview is within 48 hours
						if (hoursDiff > 0 && hoursDiff <= 48) {
							const reminderExists = notifications.find(
								(n) => n.type === "reminder" && n.metadata?.interviewDate === reminder.date,
							);

							if (!reminderExists) {
								const timeLabel = hoursDiff <= 24 ? t`tomorrow` : t`in 2 days`;
								await createNotificationMutation.mutateAsync({
									type: "reminder",
									title: t`Upcoming interview`,
									description: reminder.company
										? t`Your interview at ${reminder.company} is ${timeLabel}!`
										: t`Your interview is ${timeLabel}!`,
									link: "/dashboard/interview/checklist",
									metadata: { interviewDate: reminder.date },
								});
							}
						}
					}
				}
			} catch {
				// Ignore errors
			}
		};

		checkAndCreateNotifications();
	}, []); // Only run once on mount

	// Filter notifications by preferences
	const filteredNotifications = useMemo(() => {
		if (!preferences) return notifications;

		return notifications.filter((n) => {
			switch (n.type) {
				case "tip":
					return preferences.tips;
				case "reminder":
					return preferences.reminders;
				case "milestone":
					return preferences.milestones;
				case "announcement":
					return preferences.announcements;
				default:
					return true;
			}
		});
	}, [notifications, preferences]);

	// Unread count
	const unreadCount = useMemo(() => {
		return filteredNotifications.filter((n) => !n.read).length;
	}, [filteredNotifications]);

	// Mark notification as read
	const markAsRead = useCallback(
		(id: string) => {
			updateNotificationMutation.mutate({ id, read: true });
		},
		[updateNotificationMutation],
	);

	// Mark notification as unread
	const markAsUnread = useCallback(
		(id: string) => {
			updateNotificationMutation.mutate({ id, read: false });
		},
		[updateNotificationMutation],
	);

	// Dismiss notification
	const dismissNotification = useCallback(
		(id: string) => {
			updateNotificationMutation.mutate({ id, dismissed: true });
		},
		[updateNotificationMutation],
	);

	// Mark all as read
	const markAllAsRead = useCallback(() => {
		markAllAsReadMutation.mutate({});
	}, [markAllAsReadMutation]);

	// Toggle preference
	const togglePreference = useCallback(
		(key: "tips" | "reminders" | "milestones" | "announcements") => {
			if (preferences) {
				updatePreferencesMutation.mutate({ [key]: !preferences[key] });
			}
		},
		[preferences, updatePreferencesMutation],
	);

	return (
		<Popover open={isOpen} onOpenChange={setIsOpen}>
			<PopoverTrigger asChild>
				<Button
					variant="ghost"
					size="icon"
					className="relative size-9 rounded-full transition-all hover:bg-primary/10"
					aria-label={t`Notifications`}
				>
					<motion.div
						animate={unreadCount > 0 ? { rotate: [0, -10, 10, -10, 10, 0] } : {}}
						transition={{ duration: 0.5, repeat: unreadCount > 0 ? Infinity : 0, repeatDelay: 5 }}
					>
						{unreadCount > 0 ? (
							<BellSimpleRingingIcon className="size-5 text-primary" weight="duotone" />
						) : (
							<BellSimpleIcon className="size-5 text-muted-foreground" weight="duotone" />
						)}
					</motion.div>

					{/* Badge count */}
					<AnimatePresence>
						{unreadCount > 0 && (
							<motion.div
								initial={{ scale: 0, opacity: 0 }}
								animate={{ scale: 1, opacity: 1 }}
								exit={{ scale: 0, opacity: 0 }}
								className="absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full bg-red-500 font-bold text-[10px] text-white"
							>
								{unreadCount > 9 ? "9+" : unreadCount}
							</motion.div>
						)}
					</AnimatePresence>
				</Button>
			</PopoverTrigger>

			<PopoverContent
				align="end"
				sideOffset={8}
				className="w-[380px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border-primary/10 p-0 shadow-xl"
			>
				{/* Header */}
				<div className="flex items-center justify-between border-b bg-gradient-to-r from-primary/5 to-transparent p-4">
					<div className="flex items-center gap-2">
						<div className="flex size-8 items-center justify-center rounded-full bg-primary/10">
							<BellIcon className="size-4 text-primary" weight="duotone" />
						</div>
						<div>
							<h3 className="font-semibold text-sm">
								<Trans>Notifications</Trans>
							</h3>
							{unreadCount > 0 && (
								<p className="text-muted-foreground text-xs">
									{unreadCount} <Trans>unread</Trans>
								</p>
							)}
						</div>
					</div>
					<div className="flex items-center gap-1">
						{unreadCount > 0 && (
							<Button
								variant="ghost"
								size="sm"
								className="h-8 gap-1 px-2 text-xs hover:bg-primary/10"
								onClick={markAllAsRead}
							>
								<CheckIcon className="size-3" />
								<Trans>Mark all as read</Trans>
							</Button>
						)}
						<Button
							variant="ghost"
							size="icon"
							className={cn("size-8 hover:bg-primary/10", showSettings && "bg-primary/10")}
							onClick={() => setShowSettings(!showSettings)}
						>
							<GearSixIcon className="size-4" />
						</Button>
					</div>
				</div>

				{/* Settings Panel */}
				<AnimatePresence>
					{showSettings && preferences && (
						<motion.div
							initial={{ height: 0, opacity: 0 }}
							animate={{ height: "auto", opacity: 1 }}
							exit={{ height: 0, opacity: 0 }}
							transition={{ duration: 0.2 }}
							className="overflow-hidden border-b"
						>
							<div className="space-y-3 bg-muted/30 p-4">
								<p className="font-medium text-sm">
									<Trans>Notification preferences</Trans>
								</p>
								<div className="space-y-2">
									{[
										{
											prefKey: "tips" as const,
											colorKey: "tip" as NotificationType,
											label: t`Daily tips`,
											icon: LightbulbIcon,
										},
										{
											prefKey: "reminders" as const,
											colorKey: "reminder" as NotificationType,
											label: t`Interview reminders`,
											icon: CalendarIcon,
										},
										{
											prefKey: "milestones" as const,
											colorKey: "milestone" as NotificationType,
											label: t`Achievements`,
											icon: TrophyIcon,
										},
										{
											prefKey: "announcements" as const,
											colorKey: "announcement" as NotificationType,
											label: t`What's new`,
											icon: MegaphoneIcon,
										},
									].map(({ prefKey, colorKey, label, icon: Icon }) => (
										<div
											key={prefKey}
											className="flex items-center justify-between rounded-lg bg-background/50 p-2 transition-colors hover:bg-background"
										>
											<div className="flex items-center gap-2">
												<Icon className={cn("size-4", notificationColors[colorKey].text)} weight="duotone" />
												<span className="text-sm">{label}</span>
											</div>
											<Switch checked={preferences[prefKey]} onCheckedChange={() => togglePreference(prefKey)} />
										</div>
									))}
								</div>
							</div>
						</motion.div>
					)}
				</AnimatePresence>

				{/* Notifications List */}
				<ScrollArea className="max-h-[400px]">
					{filteredNotifications.length === 0 ? (
						<div className="flex flex-col items-center justify-center py-12 text-center">
							<div className="mb-4 flex size-16 items-center justify-center rounded-full bg-muted">
								<SparkleIcon className="size-8 text-muted-foreground" weight="duotone" />
							</div>
							<p className="font-medium text-muted-foreground">
								<Trans>No notifications</Trans>
							</p>
							<p className="mt-1 text-muted-foreground/70 text-xs">
								<Trans>You're all caught up!</Trans>
							</p>
						</div>
					) : (
						<div className="divide-y">
							{filteredNotifications.map((notification, index) => {
								const Icon = notificationIcons[notification.type];
								const colors = notificationColors[notification.type];

								return (
									<motion.div
										key={notification.id}
										initial={false}
										animate={{ opacity: 1, x: 0 }}
										transition={{ delay: index * 0.05 }}
										className={cn(
											"group relative p-4 transition-all duration-200 hover:bg-muted/50",
											!notification.read && "bg-primary/5",
										)}
									>
										{/* Unread indicator */}
										{!notification.read && (
											<motion.div
												className="absolute top-4 left-0 h-full w-1 rounded-r-full bg-primary"
												initial={{ scaleY: 0 }}
												animate={{ scaleY: 1 }}
												transition={{ duration: 0.3 }}
											/>
										)}

										<div className="flex gap-3">
											{/* Icon */}
											<div
												className={cn(
													"flex size-10 shrink-0 items-center justify-center rounded-xl transition-transform group-hover:scale-110",
													colors.bg,
												)}
											>
												<Icon className={cn("size-5", colors.text)} weight="duotone" />
											</div>

											{/* Content */}
											<div className="min-w-0 flex-1">
												<div className="flex items-start justify-between gap-2">
													<div className="min-w-0 flex-1">
														<p className={cn("font-medium text-sm", !notification.read && "text-foreground")}>
															{notification.title}
														</p>
														<p className="mt-0.5 line-clamp-2 text-muted-foreground text-xs">
															{notification.description}
														</p>
													</div>
													<span className="shrink-0 text-[10px] text-muted-foreground">
														{formatRelativeTime(new Date(notification.createdAt))}
													</span>
												</div>

												{/* Actions */}
												<div className="mt-2 flex items-center gap-2">
													{notification.link && (
														<Link
															to={notification.link as "/dashboard"}
															onClick={() => {
																markAsRead(notification.id);
																setIsOpen(false);
															}}
														>
															<Badge
																variant="secondary"
																className="cursor-pointer gap-1 px-2 py-0.5 text-[10px] hover:bg-secondary/80"
															>
																<Trans>View</Trans>
															</Badge>
														</Link>
													)}

													<div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
														<Button
															variant="ghost"
															size="icon"
															className="size-6 hover:bg-background"
															onClick={() =>
																notification.read ? markAsUnread(notification.id) : markAsRead(notification.id)
															}
															title={notification.read ? t`Mark as unread` : t`Mark as read`}
														>
															<CheckCircleIcon
																className={cn(
																	"size-3.5",
																	notification.read ? "text-green-500" : "text-muted-foreground",
																)}
																weight={notification.read ? "fill" : "regular"}
															/>
														</Button>
														<Button
															variant="ghost"
															size="icon"
															className="size-6 hover:bg-destructive/10 hover:text-destructive"
															onClick={() => dismissNotification(notification.id)}
															title={t`Delete`}
														>
															<XIcon className="size-3.5" />
														</Button>
													</div>
												</div>
											</div>
										</div>
									</motion.div>
								);
							})}
						</div>
					)}
				</ScrollArea>

				{/* Footer */}
				<div className="border-t bg-muted/30 p-3">
					<Link to="/dashboard/settings/preferences" onClick={() => setIsOpen(false)}>
						<Button variant="ghost" size="sm" className="w-full gap-2 text-xs hover:bg-background">
							<GearSixIcon className="size-4" />
							<Trans>Manage preferences</Trans>
						</Button>
					</Link>
				</div>
			</PopoverContent>
		</Popover>
	);
}
