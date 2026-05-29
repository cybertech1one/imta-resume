import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import {
	ArrowRightIcon,
	BellIcon,
	CalendarIcon,
	CaretRightIcon,
	ChartLineUpIcon,
	CheckCircleIcon,
	ClockIcon,
	EyeIcon,
	FireIcon,
	FlagIcon,
	GlobeIcon,
	HandshakeIcon,
	LinkIcon,
	LockIcon,
	MedalIcon,
	ShareNetworkIcon,
	SparkleIcon,
	SpinnerIcon,
	TargetIcon,
	TrophyIcon,
	XIcon,
} from "@phosphor-icons/react";
import type { Variants } from "motion/react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/utils/style";

import {
	CATEGORY_CONFIG,
	calculateXpForLevel,
	calculateXpProgress,
	formatRelativeTime,
	formatTimeRemaining,
	getHighestTier,
	getIcon,
	getNextTier,
	getTierTarget,
	getTierXp,
	TIER_CONFIG,
} from "./achievements-config";
import type {
	AchievementCategory,
	AchievementDefinition,
	AchievementTier,
	Challenge,
	LeaderboardEntry,
	Milestone,
	Notification,
	Reward,
	UserAchievementWithDefinition,
} from "./achievements-types";

// =============================================================================
// XP PROGRESS BAR
// =============================================================================

function XpProgressBar({ currentXp, className }: { currentXp: number; className?: string }) {
	const { currentLevel, nextLevel, progress } = calculateXpProgress(currentXp);
	const currentLevelXp = calculateXpForLevel(currentLevel);
	const nextLevelXp = calculateXpForLevel(nextLevel);

	return (
		<div className={cn("space-y-2", className)}>
			<div className="flex items-center justify-between text-sm">
				<span className="font-medium">
					<Trans>Level</Trans> {currentLevel}
				</span>
				<span className="text-muted-foreground">
					{Math.max(0, currentXp - currentLevelXp)} / {nextLevelXp - currentLevelXp} XP
				</span>
			</div>
			<div className="relative h-3 overflow-hidden rounded-full bg-primary/20">
				<motion.div
					className="h-full bg-gradient-to-r from-primary via-purple-500 to-pink-500"
					initial={{ width: 0 }}
					animate={{ width: `${progress}%` }}
					transition={{ duration: 1, ease: "easeOut" }}
				/>
			</div>
			<p className="text-muted-foreground text-xs">
				<Trans>
					{Math.max(0, nextLevelXp - currentXp).toLocaleString()} XP to Level {nextLevel}
				</Trans>
			</p>
		</div>
	);
}

// =============================================================================
// ACHIEVEMENT BADGE
// =============================================================================

function AchievementBadge({
	achievementWithDef,
	onShare,
}: {
	achievementWithDef: UserAchievementWithDefinition;
	onShare?: (definition: AchievementDefinition, tier: AchievementTier) => void;
}) {
	const [showDetails, setShowDetails] = useState(false);
	const { definition, progress } = achievementWithDef;
	const IconComponent = getIcon(definition.icon);

	const currentValue = progress?.currentValue ?? 0;
	const unlockedTiers = progress?.unlockedTiers ?? [];
	const highestTier = getHighestTier(unlockedTiers);
	const nextTier = getNextTier(unlockedTiers);
	const nextTarget = nextTier ? getTierTarget(definition, nextTier) : null;
	const progressPercent = nextTarget ? (currentValue / nextTarget) * 100 : 100;

	const tierConfig = highestTier ? TIER_CONFIG[highestTier] : null;
	const isLocked = !highestTier;
	const isNew = progress?.isNew ?? false;

	return (
		<>
			<Tooltip>
				<TooltipTrigger asChild>
					<motion.div
						className={cn(
							"relative cursor-pointer rounded-xl border-2 p-4 transition-all",
							isLocked
								? "border-muted-foreground/30 border-dashed bg-muted/30 opacity-60"
								: `${tierConfig?.borderColor} ${tierConfig?.bgColor}`,
							isNew && "ring-2 ring-primary ring-offset-2",
						)}
						whileHover={{ scale: 1.02 }}
						whileTap={{ scale: 0.98 }}
						onClick={() => setShowDetails(true)}
					>
						{isNew && (
							<motion.div
								className="absolute -top-2 -right-2 flex size-6 items-center justify-center rounded-full bg-primary text-white text-xs"
								initial={{ scale: 0 }}
								animate={{ scale: 1 }}
								transition={{ type: "spring" }}
							>
								!
							</motion.div>
						)}

						<div className="flex items-start gap-3">
							<div
								className={cn(
									"flex size-12 shrink-0 items-center justify-center rounded-xl",
									isLocked ? "bg-muted" : tierConfig?.bgColor,
								)}
							>
								{isLocked ? (
									<LockIcon className="size-6 text-muted-foreground" />
								) : (
									<IconComponent className={cn("size-6", tierConfig?.color)} weight="duotone" />
								)}
							</div>
							<div className="min-w-0 flex-1">
								<div className="mb-1 flex items-center gap-2">
									<h4 className={cn("font-medium text-sm", isLocked && "text-muted-foreground")}>{definition.title}</h4>
									{highestTier && (
										<Badge className={cn("text-xs", tierConfig?.bgColor, tierConfig?.color)}>{tierConfig?.label}</Badge>
									)}
								</div>
								<p className="mb-2 text-muted-foreground text-xs">{definition.description}</p>
								{nextTarget && (
									<div className="space-y-1">
										<Progress value={progressPercent} className="h-1.5" />
										<p className="text-muted-foreground text-xs">
											{currentValue} / {nextTarget} {definition.unit}
										</p>
									</div>
								)}
							</div>
						</div>
					</motion.div>
				</TooltipTrigger>
				<TooltipContent side="top">
					<p className="font-medium">{definition.title}</p>
					<p className="text-muted-foreground text-xs">{definition.description}</p>
					{highestTier && (
						<p className="mt-1 text-xs">
							<Trans>Click to view details and share</Trans>
						</p>
					)}
				</TooltipContent>
			</Tooltip>

			{/* Details Modal */}
			<AnimatePresence>
				{showDetails && (
					<motion.div
						className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						onClick={() => setShowDetails(false)}
					>
						<motion.div
							className="w-full max-w-md rounded-2xl bg-card p-6 shadow-xl"
							initial={{ scale: 0.9, opacity: 0 }}
							animate={{ scale: 1, opacity: 1 }}
							exit={{ scale: 0.9, opacity: 0 }}
							onClick={(e) => e.stopPropagation()}
						>
							<div className="mb-4 flex items-start justify-between">
								<div className="flex items-center gap-3">
									<div
										className={cn(
											"flex size-14 items-center justify-center rounded-xl",
											tierConfig?.bgColor ?? "bg-muted",
										)}
									>
										<IconComponent
											className={cn("size-8", tierConfig?.color ?? "text-muted-foreground")}
											weight="duotone"
										/>
									</div>
									<div>
										<h3 className="font-bold text-lg">{definition.title}</h3>
										<p className="text-muted-foreground text-sm">{definition.description}</p>
									</div>
								</div>
								<Button variant="ghost" size="icon" onClick={() => setShowDetails(false)}>
									<XIcon className="size-4" />
								</Button>
							</div>

							<div className="mb-6 space-y-3">
								<h4 className="font-medium text-sm">
									<Trans>Tier Progress</Trans>
								</h4>
								{(["bronze", "silver", "gold", "platinum"] as AchievementTier[]).map((tier) => {
									const tierTarget = getTierTarget(definition, tier);
									const tierXp = getTierXp(definition, tier);
									const isUnlocked = unlockedTiers.includes(tier);
									const config = TIER_CONFIG[tier];

									return (
										<div key={tier} className="flex items-center gap-3">
											<div
												className={cn(
													"flex size-8 items-center justify-center rounded-full",
													isUnlocked ? config.bgColor : "bg-muted",
												)}
											>
												{isUnlocked ? (
													<CheckCircleIcon className={cn("size-4", config.color)} weight="fill" />
												) : (
													<LockIcon className="size-4 text-muted-foreground" />
												)}
											</div>
											<div className="flex-1">
												<p className={cn("font-medium text-sm", isUnlocked ? config.color : "text-muted-foreground")}>
													{config.label}
												</p>
												<p className="text-muted-foreground text-xs">
													{tierTarget} {definition.unit} - {tierXp} XP
												</p>
											</div>
											{isUnlocked && onShare && (
												<Button variant="ghost" size="sm" className="gap-1" onClick={() => onShare(definition, tier)}>
													<ShareNetworkIcon className="size-4" />
													<Trans>Share</Trans>
												</Button>
											)}
										</div>
									);
								})}
							</div>

							<div className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
								<span className="text-muted-foreground text-sm">
									<Trans>Current Progress</Trans>
								</span>
								<span className="font-bold">
									{currentValue} {definition.unit}
								</span>
							</div>
						</motion.div>
					</motion.div>
				)}
			</AnimatePresence>
		</>
	);
}

// =============================================================================
// CHALLENGE CARD
// =============================================================================

function ChallengeCard({ challenge }: { challenge: Challenge }) {
	const progress = (challenge.current / challenge.target) * 100;
	const isComplete = challenge.current >= challenge.target;
	const categoryConfig = CATEGORY_CONFIG[challenge.type === "daily" ? "engagement" : "career"];
	const IconComponent = getIcon(challenge.icon);

	return (
		<motion.div
			className={cn(
				"rounded-xl border p-4 transition-all",
				isComplete ? "border-green-500/50 bg-green-50/50 dark:bg-green-950/20" : "bg-card",
			)}
			whileHover={{ scale: 1.01 }}
		>
			<div className="mb-3 flex items-start justify-between">
				<div className="flex items-center gap-3">
					<div
						className={cn(
							"flex size-10 items-center justify-center rounded-lg",
							isComplete ? "bg-green-100 dark:bg-green-900/30" : categoryConfig.bgColor,
						)}
					>
						{isComplete ? (
							<CheckCircleIcon className="size-5 text-green-600 dark:text-green-400" weight="fill" />
						) : (
							<IconComponent className={cn("size-5", categoryConfig.color)} weight="duotone" />
						)}
					</div>
					<div>
						<h4 className="font-medium">{challenge.title}</h4>
						<p className="text-muted-foreground text-xs">{challenge.description}</p>
					</div>
				</div>
				<Badge variant="outline" className={cn(challenge.type === "weekly" && "border-purple-500 text-purple-600")}>
					{challenge.type === "daily" ? t`Daily` : t`Weekly`}
				</Badge>
			</div>

			<div className="mb-2 space-y-1">
				<div className="flex items-center justify-between text-sm">
					<span className="text-muted-foreground">
						{challenge.current} / {challenge.target}
					</span>
					<span className={cn("font-medium", isComplete ? "text-green-600" : "text-primary")}>
						+{challenge.xpReward} XP
					</span>
				</div>
				<Progress value={progress} className={cn("h-2", isComplete && "[&>div]:bg-green-500")} />
			</div>

			<div className="flex items-center justify-between text-muted-foreground text-xs">
				<span className="flex items-center gap-1">
					<ClockIcon className="size-3" />
					{formatTimeRemaining(challenge.expiresAt)}
				</span>
				{isComplete && (
					<span className="flex items-center gap-1 text-green-600">
						<CheckCircleIcon className="size-3" weight="fill" />
						<Trans>Completed!</Trans>
					</span>
				)}
			</div>
		</motion.div>
	);
}

// =============================================================================
// LEADERBOARD ROW
// =============================================================================

function LeaderboardRow({ entry, index }: { entry: LeaderboardEntry; index: number }) {
	const getRankIcon = (rank: number) => {
		switch (rank) {
			case 1:
				return <TrophyIcon className="size-5 text-yellow-500" weight="fill" />;
			case 2:
				return <MedalIcon className="size-5 text-slate-400" weight="fill" />;
			case 3:
				return <MedalIcon className="size-5 text-amber-600" weight="fill" />;
			default:
				return <span className="text-muted-foreground text-sm">{rank}</span>;
		}
	};

	return (
		<motion.div
			initial={false}
			animate={{ opacity: 1, x: 0 }}
			transition={{ delay: index * 0.05 }}
			className={cn(
				"flex items-center gap-4 rounded-lg p-3 transition-all",
				entry.isCurrentUser && "border-2 border-primary/50 bg-primary/5",
				!entry.isCurrentUser && "hover:bg-muted/50",
			)}
		>
			<div className="flex size-8 items-center justify-center">{getRankIcon(entry.rank)}</div>

			<Avatar className="size-10">
				<AvatarImage src={entry.avatarUrl ?? undefined} />
				<AvatarFallback>{entry.userName.charAt(0)}</AvatarFallback>
			</Avatar>

			<div className="min-w-0 flex-1">
				<p className={cn("font-medium", entry.isCurrentUser && "text-primary")}>
					{entry.userName}
					{entry.isCurrentUser && (
						<Badge className="ml-2 text-xs">
							<Trans>You</Trans>
						</Badge>
					)}
				</p>
				<p className="text-muted-foreground text-xs">
					<Trans>
						Level {entry.level} - {entry.achievementCount} achievements
					</Trans>
				</p>
			</div>

			<div className="text-right">
				<p className="font-bold">{entry.totalXp.toLocaleString()}</p>
				<p className="text-muted-foreground text-xs">XP</p>
			</div>
		</motion.div>
	);
}

// =============================================================================
// MILESTONE CARD
// =============================================================================

function MilestoneCard({ milestone, index }: { milestone: Milestone; index: number }) {
	const IconComponent = getIcon(milestone.icon);

	return (
		<motion.div
			initial={false}
			animate={{ opacity: 1, y: 0 }}
			transition={{ delay: index * 0.1 }}
			className={cn(
				"flex items-center gap-4 rounded-xl border p-4",
				milestone.isUnlocked ? "border-green-500/50 bg-green-50/50 dark:bg-green-950/20" : "bg-card",
			)}
		>
			<div
				className={cn(
					"flex size-12 items-center justify-center rounded-xl",
					milestone.isUnlocked ? "bg-green-100 dark:bg-green-900/30" : "bg-muted",
				)}
			>
				{milestone.isUnlocked ? (
					<CheckCircleIcon className="size-6 text-green-600 dark:text-green-400" weight="fill" />
				) : (
					<IconComponent className="size-6 text-muted-foreground" weight="duotone" />
				)}
			</div>

			<div className="min-w-0 flex-1">
				<h4 className="font-medium">{milestone.title}</h4>
				<p className="text-muted-foreground text-sm">{milestone.description}</p>
				<p className="mt-1 text-xs">
					<Trans>Reward:</Trans>{" "}
					<span className={cn(milestone.isUnlocked ? "text-green-600" : "text-primary")}>{milestone.reward}</span>
				</p>
			</div>

			<div className="text-right">
				<p className="font-bold">{(milestone.xpRequired / 1000).toFixed(0)}K</p>
				<p className="text-muted-foreground text-xs">XP</p>
			</div>
		</motion.div>
	);
}

// =============================================================================
// REWARD CARD
// =============================================================================

function RewardCard({
	reward,
	index,
	currentLevel,
	onActivate,
	isActivating,
}: {
	reward: Reward;
	index: number;
	currentLevel: number;
	onActivate: (rewardId: string) => void;
	isActivating: boolean;
}) {
	const IconComponent = getIcon(reward.icon);
	const typeColors = {
		theme: { bg: "bg-purple-100 dark:bg-purple-900/30", text: "text-purple-600 dark:text-purple-400" },
		badge: { bg: "bg-amber-100 dark:bg-amber-900/30", text: "text-amber-600 dark:text-amber-400" },
		feature: { bg: "bg-blue-100 dark:bg-blue-900/30", text: "text-blue-600 dark:text-blue-400" },
		template: { bg: "bg-green-100 dark:bg-green-900/30", text: "text-green-600 dark:text-green-400" },
	};

	const colors = typeColors[reward.type];

	return (
		<motion.div
			initial={false}
			animate={{ opacity: 1, scale: 1 }}
			transition={{ delay: index * 0.1 }}
			className={cn(
				"rounded-xl border p-4 transition-all",
				reward.isUnlocked ? "border-primary/50 bg-primary/5" : "bg-card opacity-75",
			)}
		>
			<div className="mb-3 flex items-start justify-between">
				<div className={cn("flex size-10 items-center justify-center rounded-lg", colors.bg)}>
					<IconComponent className={cn("size-5", colors.text)} weight="duotone" />
				</div>
				{reward.isUnlocked ? (
					<Badge variant="outline" className="border-green-500 text-green-600">
						<CheckCircleIcon className="mr-1 size-3" weight="fill" />
						<Trans>Unlocked</Trans>
					</Badge>
				) : (
					<Badge variant="outline">
						<LockIcon className="mr-1 size-3" />
						<Trans>Lvl {reward.requiredLevel}</Trans>
					</Badge>
				)}
			</div>

			<h4 className="mb-1 font-medium">{reward.title}</h4>
			<p className="mb-3 text-muted-foreground text-sm">{reward.description}</p>

			{!reward.isUnlocked && (
				<div className="space-y-1">
					<Progress value={(currentLevel / reward.requiredLevel) * 100} className="h-1.5" />
					<p className="text-muted-foreground text-xs">
						<Trans>{reward.requiredLevel - currentLevel} levels to unlock</Trans>
					</p>
				</div>
			)}

			{reward.isUnlocked && (
				<Button
					variant="outline"
					className="w-full gap-2"
					size="sm"
					onClick={() => onActivate(reward.id)}
					disabled={isActivating || reward.isActive}
				>
					{isActivating ? (
						<SpinnerIcon className="size-4 animate-spin" />
					) : reward.isActive ? (
						<Trans>Active</Trans>
					) : (
						<>
							<Trans>Activate</Trans>
							<CaretRightIcon className="size-4" />
						</>
					)}
				</Button>
			)}
		</motion.div>
	);
}

// =============================================================================
// NOTIFICATION ITEM
// =============================================================================

function NotificationItem({
	notification,
	onMarkRead,
	isMarking,
}: {
	notification: Notification;
	onMarkRead: (id: string) => void;
	isMarking: boolean;
}) {
	const IconComponent = getIcon(notification.icon);
	const typeConfig: Record<string, { bg: string; text: string }> = {
		achievement: { bg: "bg-amber-100 dark:bg-amber-900/30", text: "text-amber-600 dark:text-amber-400" },
		level_up: { bg: "bg-purple-100 dark:bg-purple-900/30", text: "text-purple-600 dark:text-purple-400" },
		streak: { bg: "bg-orange-100 dark:bg-orange-900/30", text: "text-orange-600 dark:text-orange-400" },
		challenge: { bg: "bg-green-100 dark:bg-green-900/30", text: "text-green-600 dark:text-green-400" },
		reward: { bg: "bg-blue-100 dark:bg-blue-900/30", text: "text-blue-600 dark:text-blue-400" },
	};

	const config = typeConfig[notification.type] ?? typeConfig.achievement;

	return (
		<motion.div
			initial={false}
			animate={{ opacity: 1, y: 0 }}
			className={cn(
				"flex gap-3 rounded-lg p-3 transition-all hover:bg-muted/50",
				!notification.isRead && "bg-primary/5",
			)}
		>
			<div className={cn("flex size-10 shrink-0 items-center justify-center rounded-lg", config.bg)}>
				<IconComponent className={cn("size-5", config.text)} weight="fill" />
			</div>
			<div className="min-w-0 flex-1">
				<div className="flex items-start justify-between gap-2">
					<div>
						<h4 className={cn("font-medium text-sm", !notification.isRead && "text-primary")}>{notification.title}</h4>
						<p className="text-muted-foreground text-xs">{notification.description}</p>
					</div>
					{!notification.isRead && (
						<Button variant="ghost" size="icon-sm" onClick={() => onMarkRead(notification.id)} disabled={isMarking}>
							{isMarking ? <SpinnerIcon className="size-4 animate-spin" /> : <CheckCircleIcon className="size-4" />}
						</Button>
					)}
				</div>
				<p className="mt-1 text-muted-foreground text-xs">{formatRelativeTime(notification.createdAt)}</p>
			</div>
		</motion.div>
	);
}

// =============================================================================
// SHARE ACHIEVEMENT MODAL
// =============================================================================

export function ShareAchievementModal({
	definition,
	tier,
	onClose,
}: {
	definition: AchievementDefinition;
	tier: AchievementTier;
	onClose: () => void;
}) {
	const tierConfig = TIER_CONFIG[tier];
	const IconComponent = getIcon(definition.icon);
	const shareText = `I just earned the ${definition.title} (${tierConfig.label}) badge on Resume Maker! #CareerGoals #Achievement`;

	const handleShare = (platform: string) => {
		const urls: Record<string, string> = {
			twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`,
			linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}&title=${encodeURIComponent(shareText)}`,
			copy: shareText,
		};

		if (platform === "copy") {
			navigator.clipboard.writeText(shareText);
			toast.success(t`Copied to clipboard!`);
		} else {
			window.open(urls[platform], "_blank", "width=600,height=400");
		}
	};

	return (
		<motion.div
			className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
			initial={false}
			animate={{ opacity: 1 }}
			exit={{ opacity: 0 }}
			onClick={onClose}
		>
			<motion.div
				className="w-full max-w-sm rounded-2xl bg-card p-6 shadow-xl"
				initial={false}
				animate={{ scale: 1, opacity: 1 }}
				exit={{ scale: 0.9, opacity: 0 }}
				onClick={(e) => e.stopPropagation()}
			>
				<div className="mb-4 flex items-center justify-between">
					<h3 className="font-bold text-lg">
						<Trans>Share Achievement</Trans>
					</h3>
					<Button variant="ghost" size="icon" onClick={onClose}>
						<XIcon className="size-4" />
					</Button>
				</div>

				<div className={cn("mb-6 flex items-center gap-4 rounded-xl p-4", tierConfig.bgColor)}>
					<div className={cn("flex size-14 items-center justify-center rounded-xl", tierConfig.bgColor)}>
						<IconComponent className={cn("size-8", tierConfig.color)} weight="duotone" />
					</div>
					<div>
						<h4 className="font-bold">{definition.title}</h4>
						<Badge className={cn(tierConfig.bgColor, tierConfig.color)}>{tierConfig.label}</Badge>
					</div>
				</div>

				<div className="grid grid-cols-3 gap-3">
					<Button variant="outline" className="flex-col gap-2 py-4" onClick={() => handleShare("twitter")}>
						<GlobeIcon className="size-5" />
						<span className="text-xs">Twitter</span>
					</Button>
					<Button variant="outline" className="flex-col gap-2 py-4" onClick={() => handleShare("linkedin")}>
						<HandshakeIcon className="size-5" />
						<span className="text-xs">LinkedIn</span>
					</Button>
					<Button variant="outline" className="flex-col gap-2 py-4" onClick={() => handleShare("copy")}>
						<LinkIcon className="size-5" />
						<span className="text-xs">
							<Trans>Copy Link</Trans>
						</span>
					</Button>
				</div>
			</motion.div>
		</motion.div>
	);
}

// =============================================================================
// HERO SECTION
// =============================================================================

export function HeroSection({
	currentLevel,
	userXp,
	totalAchievements,
	currentStreak,
	completedChallenges,
	totalChallenges,
	challenges,
	challengesLoading,
	setActiveTab,
	itemVariants,
}: {
	currentLevel: number;
	userXp: number;
	totalAchievements: number;
	currentStreak: number;
	completedChallenges: number;
	totalChallenges: number;
	challenges: Challenge[];
	challengesLoading: boolean;
	setActiveTab: (tab: string) => void;
	itemVariants: Variants;
}) {
	return (
		<motion.div
			variants={itemVariants}
			className="relative overflow-hidden rounded-3xl border border-primary/20 p-6 md:p-8"
			style={{
				background:
					"linear-gradient(135deg, oklch(0.65 0.18 280 / 0.15) 0%, oklch(0.6 0.2 220 / 0.1) 35%, oklch(0.7 0.15 160 / 0.08) 70%, oklch(0.65 0.12 40 / 0.1) 100%)",
			}}
		>
			{/* Animated background elements */}
			<div className="pointer-events-none absolute inset-0 overflow-hidden">
				<motion.div
					className="absolute -top-20 -right-20 size-64 rounded-full bg-gradient-to-br from-yellow-500/20 to-amber-500/10 blur-3xl"
					animate={{
						scale: [1, 1.2, 1],
						opacity: [0.3, 0.5, 0.3],
					}}
					transition={{ duration: 8, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
				/>
				<motion.div
					className="absolute -bottom-20 -left-20 size-64 rounded-full bg-gradient-to-tr from-purple-500/20 to-pink-500/10 blur-3xl"
					animate={{
						scale: [1.2, 1, 1.2],
						opacity: [0.3, 0.5, 0.3],
					}}
					transition={{ duration: 8, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
				/>
			</div>

			<div className="relative z-10">
				<div className="grid gap-6 md:grid-cols-[1fr,auto]">
					{/* User Level & Progress */}
					<div className="space-y-4">
						<div className="flex items-center gap-4">
							<motion.div
								className="relative flex size-20 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/30 to-purple-500/30"
								initial={{ scale: 0 }}
								animate={{ scale: 1 }}
								transition={{ type: "spring", delay: 0.2 }}
							>
								<TrophyIcon className="size-10 text-primary" weight="fill" />
								<div className="absolute -right-2 -bottom-2 flex size-8 items-center justify-center rounded-full bg-primary font-bold text-primary-foreground text-sm">
									{currentLevel}
								</div>
							</motion.div>
							<div>
								<h2 className="font-bold text-2xl md:text-3xl">
									<Trans>Level</Trans> {currentLevel}
								</h2>
								<p className="text-muted-foreground">
									{userXp.toLocaleString()} <Trans>Total XP</Trans>
								</p>
							</div>
						</div>

						<XpProgressBar currentXp={userXp} />

						{/* Quick Stats */}
						<div className="grid grid-cols-3 gap-3">
							<div className="rounded-xl bg-card/50 p-3 text-center backdrop-blur-sm">
								<p className="font-bold text-2xl text-amber-600">{totalAchievements}</p>
								<p className="text-muted-foreground text-xs">
									<Trans>Achievements</Trans>
								</p>
							</div>
							<div className="rounded-xl bg-card/50 p-3 text-center backdrop-blur-sm">
								<div className="flex items-center justify-center gap-1">
									<FireIcon className="size-5 text-orange-500" weight="fill" />
									<p className="font-bold text-2xl text-orange-600">{currentStreak}</p>
								</div>
								<p className="text-muted-foreground text-xs">
									<Trans>Day Streak</Trans>
								</p>
							</div>
							<div className="rounded-xl bg-card/50 p-3 text-center backdrop-blur-sm">
								<p className="font-bold text-2xl text-green-600">
									{completedChallenges}/{totalChallenges}
								</p>
								<p className="text-muted-foreground text-xs">
									<Trans>Challenges</Trans>
								</p>
							</div>
						</div>
					</div>

					{/* Daily Challenges Preview */}
					<Card className="w-full max-w-sm border-primary/20 bg-card/80 backdrop-blur-sm md:w-80">
						<CardHeader className="pb-2">
							<CardTitle className="flex items-center gap-2 text-base">
								<TargetIcon className="size-4 text-primary" weight="fill" />
								<Trans>Today's Challenges</Trans>
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-2">
							{challengesLoading ? (
								<div className="flex justify-center py-4">
									<SpinnerIcon className="size-6 animate-spin" />
								</div>
							) : (
								<>
									{challenges
										.filter((c) => c.type === "daily")
										.slice(0, 2)
										.map((challenge) => {
											const IconComponent = getIcon(challenge.icon);
											return (
												<div key={challenge.id} className="flex items-center gap-3">
													<div
														className={cn(
															"flex size-8 items-center justify-center rounded-lg",
															challenge.current >= challenge.target
																? "bg-green-100 dark:bg-green-900/30"
																: "bg-primary/10",
														)}
													>
														{challenge.current >= challenge.target ? (
															<CheckCircleIcon className="size-4 text-green-600" weight="fill" />
														) : (
															<IconComponent className="size-4 text-primary" />
														)}
													</div>
													<div className="min-w-0 flex-1">
														<p className="truncate text-sm">{challenge.title}</p>
														<Progress
															value={(challenge.current / challenge.target) * 100}
															className={cn("h-1", challenge.current >= challenge.target && "[&>div]:bg-green-500")}
														/>
													</div>
													<span className="text-primary text-xs">+{challenge.xpReward}</span>
												</div>
											);
										})}
									<Button variant="ghost" size="sm" className="w-full gap-1" onClick={() => setActiveTab("challenges")}>
										<Trans>View All</Trans>
										<ArrowRightIcon className="size-3" />
									</Button>
								</>
							)}
						</CardContent>
					</Card>
				</div>
			</div>
		</motion.div>
	);
}

// =============================================================================
// ACHIEVEMENTS TAB CONTENT
// =============================================================================

export function AchievementsTabContent({
	categoryFilter,
	setCategoryFilter,
	achievementsWithDefs,
	filteredAchievements,
	achievementsLoading,
	onShare,
	itemVariants,
}: {
	categoryFilter: "all" | AchievementCategory;
	setCategoryFilter: (filter: "all" | AchievementCategory) => void;
	achievementsWithDefs: UserAchievementWithDefinition[];
	filteredAchievements: UserAchievementWithDefinition[];
	achievementsLoading: boolean;
	onShare: (definition: AchievementDefinition, tier: AchievementTier) => void;
	itemVariants: Variants;
}) {
	return (
		<motion.div variants={itemVariants}>
			<Card>
				<CardHeader>
					<div className="flex flex-wrap items-center justify-between gap-4">
						<div>
							<CardTitle className="flex items-center gap-2">
								<MedalIcon className="size-5 text-amber-500" weight="duotone" />
								<Trans>All Achievements</Trans>
							</CardTitle>
							<CardDescription>
								<Trans>Earn achievements by completing various activities</Trans>
							</CardDescription>
						</div>
						<Select value={categoryFilter} onValueChange={(v) => setCategoryFilter(v as typeof categoryFilter)}>
							<SelectTrigger className="w-40">
								<SelectValue placeholder={t`All Categories`} />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">{t`All Categories`}</SelectItem>
								{Object.entries(CATEGORY_CONFIG).map(([key, config]) => (
									<SelectItem key={key} value={key}>
										<div className="flex items-center gap-2">
											<config.icon className={cn("size-4", config.color)} />
											{config.label}
										</div>
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				</CardHeader>
				<CardContent>
					{/* Category Filters */}
					<div className="mb-6 flex flex-wrap gap-2">
						{Object.entries(CATEGORY_CONFIG).map(([key, config]) => {
							const categoryAchievements = achievementsWithDefs.filter((a) => a.definition.category === key);
							const unlockedInCategory = categoryAchievements.filter(
								(a) => a.progress && (a.progress.unlockedTiers as string[]).length > 0,
							).length;

							return (
								<Badge
									key={key}
									variant={categoryFilter === key ? "default" : "outline"}
									className={cn(
										"cursor-pointer transition-all",
										categoryFilter === key && config.bgColor,
										categoryFilter === key && config.color,
									)}
									onClick={() => setCategoryFilter(categoryFilter === key ? "all" : (key as AchievementCategory))}
								>
									<config.icon className="mr-1 size-3" />
									{config.label} ({unlockedInCategory}/{categoryAchievements.length})
								</Badge>
							);
						})}
					</div>

					{/* Achievements Grid */}
					{achievementsLoading ? (
						<div className="flex justify-center py-12">
							<SpinnerIcon className="size-8 animate-spin" />
						</div>
					) : (
						<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
							{filteredAchievements.map((achievementWithDef) => (
								<AchievementBadge
									key={achievementWithDef.definition.id}
									achievementWithDef={achievementWithDef}
									onShare={onShare}
								/>
							))}
						</div>
					)}
				</CardContent>
			</Card>
		</motion.div>
	);
}

// =============================================================================
// CHALLENGES TAB CONTENT
// =============================================================================

export function ChallengesTabContent({
	challenges,
	challengesLoading,
	currentStreak,
	itemVariants,
}: {
	challenges: Challenge[];
	challengesLoading: boolean;
	currentStreak: number;
	itemVariants: Variants;
}) {
	return (
		<>
			<motion.div variants={itemVariants} className="grid gap-6 lg:grid-cols-2">
				{/* Daily Challenges */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<CalendarIcon className="size-5 text-blue-500" weight="duotone" />
							<Trans>Daily Challenges</Trans>
						</CardTitle>
						<CardDescription>
							<Trans>Complete these before midnight to earn bonus XP</Trans>
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-3">
						{challengesLoading ? (
							<div className="flex justify-center py-8">
								<SpinnerIcon className="size-6 animate-spin" />
							</div>
						) : (
							challenges
								.filter((c) => c.type === "daily")
								.map((challenge) => <ChallengeCard key={challenge.id} challenge={challenge} />)
						)}
					</CardContent>
				</Card>

				{/* Weekly Challenges */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<FlagIcon className="size-5 text-purple-500" weight="duotone" />
							<Trans>Weekly Challenges</Trans>
						</CardTitle>
						<CardDescription>
							<Trans>Bigger challenges for bigger rewards</Trans>
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-3">
						{challengesLoading ? (
							<div className="flex justify-center py-8">
								<SpinnerIcon className="size-6 animate-spin" />
							</div>
						) : (
							challenges
								.filter((c) => c.type === "weekly")
								.map((challenge) => <ChallengeCard key={challenge.id} challenge={challenge} />)
						)}
					</CardContent>
				</Card>
			</motion.div>

			{/* Streak Section */}
			<motion.div variants={itemVariants}>
				<Card className="border-orange-500/30 bg-gradient-to-br from-orange-500/10 via-red-500/5 to-transparent">
					<CardContent className="flex flex-col items-center gap-4 p-6 md:flex-row">
						<div className="flex size-20 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500/30 to-red-500/30">
							<FireIcon className="size-10 text-orange-500" weight="fill" />
						</div>
						<div className="flex-1 text-center md:text-left">
							<h3 className="font-bold text-2xl">
								{currentStreak} <Trans>Day Streak!</Trans>
							</h3>
							<p className="text-muted-foreground">
								<Trans>Keep logging in daily to maintain your streak and earn bonus XP</Trans>
							</p>
							<div className="mt-3 flex items-center justify-center gap-1 md:justify-start">
								{Array.from({ length: 7 }).map((_, i) => (
									<div
										key={i}
										className={cn(
											"size-8 rounded-md",
											i < currentStreak % 7
												? "bg-gradient-to-br from-orange-500 to-red-500"
												: "border-2 border-orange-500/30 border-dashed",
										)}
									/>
								))}
							</div>
						</div>
						<div className="text-center">
							<p className="font-bold text-3xl text-orange-500">+{Math.floor(currentStreak / 7) * 50 + 10}</p>
							<p className="text-muted-foreground text-sm">
								<Trans>Daily Bonus XP</Trans>
							</p>
						</div>
					</CardContent>
				</Card>
			</motion.div>
		</>
	);
}

// =============================================================================
// LEADERBOARD TAB CONTENT
// =============================================================================

export function LeaderboardTabContent({
	showLeaderboard,
	leaderboard,
	leaderboardLoading,
	isTogglingLeaderboard,
	onToggleLeaderboard,
	itemVariants,
}: {
	showLeaderboard: boolean;
	leaderboard: LeaderboardEntry[];
	leaderboardLoading: boolean;
	isTogglingLeaderboard: boolean;
	onToggleLeaderboard: (show: boolean) => void;
	itemVariants: Variants;
}) {
	return (
		<motion.div variants={itemVariants}>
			<Card>
				<CardHeader>
					<div className="flex flex-wrap items-center justify-between gap-4">
						<div>
							<CardTitle className="flex items-center gap-2">
								<ChartLineUpIcon className="size-5 text-primary" weight="duotone" />
								<Trans>Global Leaderboard</Trans>
							</CardTitle>
							<CardDescription>
								<Trans>See how you rank against other users</Trans>
							</CardDescription>
						</div>
						<div className="flex items-center gap-2">
							<span className="text-muted-foreground text-sm">
								<Trans>Show my position</Trans>
							</span>
							<Switch
								checked={showLeaderboard}
								onCheckedChange={onToggleLeaderboard}
								disabled={isTogglingLeaderboard}
							/>
						</div>
					</div>
				</CardHeader>
				<CardContent>
					{showLeaderboard ? (
						leaderboardLoading ? (
							<div className="flex justify-center py-12">
								<SpinnerIcon className="size-8 animate-spin" />
							</div>
						) : (
							<ScrollArea className="h-[500px]">
								<div className="space-y-2">
									{leaderboard.map((entry, index) => (
										<LeaderboardRow key={entry.odataUserId} entry={entry} index={index} />
									))}
								</div>
							</ScrollArea>
						)
					) : (
						<div className="flex flex-col items-center justify-center py-12 text-center">
							<EyeIcon className="mb-4 size-16 text-muted-foreground/30" />
							<h3 className="mb-2 font-semibold text-lg">
								<Trans>Leaderboard Hidden</Trans>
							</h3>
							<p className="max-w-sm text-muted-foreground">
								<Trans>You've opted out of the leaderboard. Toggle the switch above to see your ranking.</Trans>
							</p>
						</div>
					)}
				</CardContent>
			</Card>
		</motion.div>
	);
}

// =============================================================================
// MILESTONES TAB CONTENT
// =============================================================================

export function MilestonesTabContent({
	milestones,
	milestonesLoading,
	itemVariants,
}: {
	milestones: Milestone[];
	milestonesLoading: boolean;
	itemVariants: Variants;
}) {
	return (
		<motion.div variants={itemVariants}>
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<FlagIcon className="size-5 text-primary" weight="duotone" />
						<Trans>Progress Milestones</Trans>
					</CardTitle>
					<CardDescription>
						<Trans>Major achievements that unlock special rewards</Trans>
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					{milestonesLoading ? (
						<div className="flex justify-center py-12">
							<SpinnerIcon className="size-8 animate-spin" />
						</div>
					) : (
						milestones.map((milestone, index) => (
							<MilestoneCard key={milestone.id} milestone={milestone} index={index} />
						))
					)}
				</CardContent>
			</Card>
		</motion.div>
	);
}

// =============================================================================
// REWARDS TAB CONTENT
// =============================================================================

export function RewardsTabContent({
	rewards,
	rewardsLoading,
	currentLevel,
	onActivate,
	isActivating,
	itemVariants,
}: {
	rewards: Reward[];
	rewardsLoading: boolean;
	currentLevel: number;
	onActivate: (rewardId: string) => void;
	isActivating: boolean;
	itemVariants: Variants;
}) {
	return (
		<motion.div variants={itemVariants}>
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<SparkleIcon className="size-5 text-amber-500" weight="fill" />
						<Trans>Unlockable Rewards</Trans>
					</CardTitle>
					<CardDescription>
						<Trans>Level up to unlock exclusive rewards and features</Trans>
					</CardDescription>
				</CardHeader>
				<CardContent>
					{rewardsLoading ? (
						<div className="flex justify-center py-12">
							<SpinnerIcon className="size-8 animate-spin" />
						</div>
					) : (
						<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
							{rewards.map((reward, index) => (
								<RewardCard
									key={reward.id}
									reward={reward}
									index={index}
									currentLevel={currentLevel}
									onActivate={onActivate}
									isActivating={isActivating}
								/>
							))}
						</div>
					)}
				</CardContent>
			</Card>
		</motion.div>
	);
}

// =============================================================================
// NOTIFICATIONS TAB CONTENT
// =============================================================================

export function NotificationsTabContent({
	notifications,
	notificationsLoading,
	unreadNotifications,
	markingNotificationId,
	isMarkingAllRead,
	notificationPrefs,
	onMarkRead,
	onMarkAllRead,
	onUpdatePref,
	itemVariants,
}: {
	notifications: Notification[];
	notificationsLoading: boolean;
	unreadNotifications: number;
	markingNotificationId: string | null;
	isMarkingAllRead: boolean;
	notificationPrefs: Record<string, unknown> | undefined;
	onMarkRead: (id: string) => void;
	onMarkAllRead: () => void;
	onUpdatePref: (key: string, value: boolean) => void;
	itemVariants: Variants;
}) {
	return (
		<>
			<motion.div variants={itemVariants}>
				<Card>
					<CardHeader>
						<div className="flex items-center justify-between">
							<div>
								<CardTitle className="flex items-center gap-2">
									<BellIcon className="size-5 text-primary" weight="duotone" />
									<Trans>Progress Notifications</Trans>
									{unreadNotifications > 0 && (
										<Badge className="ml-2">
											<Trans>{unreadNotifications} new</Trans>
										</Badge>
									)}
								</CardTitle>
								<CardDescription>
									<Trans>Stay updated on your achievements and progress</Trans>
								</CardDescription>
							</div>
							{unreadNotifications > 0 && (
								<Button variant="outline" size="sm" onClick={onMarkAllRead} disabled={isMarkingAllRead}>
									{isMarkingAllRead ? <SpinnerIcon className="mr-2 size-4 animate-spin" /> : null}
									<Trans>Mark All Read</Trans>
								</Button>
							)}
						</div>
					</CardHeader>
					<CardContent>
						{notificationsLoading ? (
							<div className="flex justify-center py-12">
								<SpinnerIcon className="size-8 animate-spin" />
							</div>
						) : (
							<ScrollArea className="h-[400px]">
								<div className="space-y-2">
									{notifications.map((notification) => (
										<NotificationItem
											key={notification.id}
											notification={notification}
											onMarkRead={onMarkRead}
											isMarking={markingNotificationId === notification.id}
										/>
									))}
								</div>
							</ScrollArea>
						)}
					</CardContent>
				</Card>
			</motion.div>

			{/* Notification Settings */}
			<motion.div variants={itemVariants}>
				<Card>
					<CardHeader>
						<CardTitle className="text-base">
							<Trans>Notification Preferences</Trans>
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						{[
							{ id: "achievements", label: t`Achievement Unlocks`, key: "achievements" },
							{ id: "level_ups", label: t`Level Up Notifications`, key: "levelUps" },
							{ id: "streaks", label: t`Streak Reminders`, key: "streaks" },
							{ id: "challenges", label: t`Challenge Updates`, key: "challenges" },
							{ id: "leaderboard", label: t`Leaderboard Changes`, key: "leaderboard" },
						].map((setting) => (
							<div key={setting.id} className="flex items-center justify-between">
								<span className="text-sm">{setting.label}</span>
								<Switch
									checked={(notificationPrefs?.[setting.key as keyof typeof notificationPrefs] as boolean) ?? false}
									onCheckedChange={(checked) => onUpdatePref(setting.key, checked)}
								/>
							</div>
						))}
					</CardContent>
				</Card>
			</motion.div>
		</>
	);
}
