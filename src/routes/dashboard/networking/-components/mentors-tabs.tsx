import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import {
	ArrowLeftIcon,
	BookOpenIcon,
	BriefcaseIcon,
	CalendarIcon,
	ChartLineUpIcon,
	ChatCircleDotsIcon,
	CheckCircleIcon,
	ClockIcon,
	EnvelopeIcon,
	FunnelIcon,
	LightbulbIcon,
	MagnifyingGlassIcon,
	NoteIcon,
	NotePencilIcon,
	PaperPlaneRightIcon,
	PencilSimpleIcon,
	PlusIcon,
	RocketLaunchIcon,
	TargetIcon,
	UsersIcon,
	VideoIcon,
	XIcon,
} from "@phosphor-icons/react";
import { AnimatePresence, motion } from "motion/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/utils/style";
import { MentorCard, type MentorData, type SessionData, StarRating } from "./mentors-components";
import { getGoalStatusConfig, getRequestStatusConfig, getSessionTypeConfig, getStatusConfig } from "./mentors-config";
import type { GoalStatus, RequestStatus } from "./mentors-types";
import { formatDate, formatDateTime, getInitials } from "./mentors-utils";

// ========================
// QuickStats
// ========================

interface QuickStatsProps {
	statistics:
		| { totalMentors?: number; completedSessions?: number; upcomingSessions?: number; activeGoals?: number }
		| undefined;
	mentorsCount: number;
	pastSessionsCount: number;
	upcomingSessionsCount: number;
	activeGoalsCount: number;
}

export function QuickStats({
	statistics,
	mentorsCount,
	pastSessionsCount,
	upcomingSessionsCount,
	activeGoalsCount,
}: QuickStatsProps) {
	return (
		<div className="grid gap-4 md:grid-cols-4">
			<Card>
				<CardContent className="flex items-center gap-4 p-4">
					<div className="flex size-12 items-center justify-center rounded-full bg-primary/10">
						<UsersIcon className="size-6 text-primary" />
					</div>
					<div>
						<p className="font-semibold text-2xl">{statistics?.totalMentors ?? mentorsCount}</p>
						<p className="text-muted-foreground text-sm">
							<Trans>Available Mentors</Trans>
						</p>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardContent className="flex items-center gap-4 p-4">
					<div className="flex size-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
						<CheckCircleIcon className="size-6 text-green-600 dark:text-green-400" />
					</div>
					<div>
						<p className="font-semibold text-2xl">{statistics?.completedSessions ?? pastSessionsCount}</p>
						<p className="text-muted-foreground text-sm">
							<Trans>Completed Sessions</Trans>
						</p>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardContent className="flex items-center gap-4 p-4">
					<div className="flex size-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
						<CalendarIcon className="size-6 text-blue-600 dark:text-blue-400" />
					</div>
					<div>
						<p className="font-semibold text-2xl">{statistics?.upcomingSessions ?? upcomingSessionsCount}</p>
						<p className="text-muted-foreground text-sm">
							<Trans>Upcoming Sessions</Trans>
						</p>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardContent className="flex items-center gap-4 p-4">
					<div className="flex size-12 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
						<TargetIcon className="size-6 text-amber-600 dark:text-amber-400" />
					</div>
					<div>
						<p className="font-semibold text-2xl">{statistics?.activeGoals ?? activeGoalsCount}</p>
						<p className="text-muted-foreground text-sm">
							<Trans>Active Goals</Trans>
						</p>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}

// ========================
// DiscoverTabContent
// ========================

interface DiscoverTabContentProps {
	searchQuery: string;
	onSearchQueryChange: (value: string) => void;
	expertiseFilter: string;
	onExpertiseFilterChange: (value: string) => void;
	industryFilter: string;
	onIndustryFilterChange: (value: string) => void;
	availabilityFilter: string;
	onAvailabilityFilterChange: (value: string) => void;
	allExpertise: string[];
	allIndustries: string[];
	filteredMentors: (MentorData & { matchScore?: number })[];
	onViewMentor: (mentor: MentorData) => void;
	onRequestMentorship: (mentor: MentorData) => void;
	onEditProfile: () => void;
}

export function DiscoverTabContent({
	searchQuery,
	onSearchQueryChange,
	expertiseFilter,
	onExpertiseFilterChange,
	industryFilter,
	onIndustryFilterChange,
	availabilityFilter,
	onAvailabilityFilterChange,
	allExpertise,
	allIndustries,
	filteredMentors,
	onViewMentor,
	onRequestMentorship,
	onEditProfile,
}: DiscoverTabContentProps) {
	const statusConfig = getStatusConfig();

	return (
		<div className="space-y-6">
			{/* Search and Filters */}
			<Card>
				<CardContent className="p-4">
					<div className="flex flex-col gap-4 lg:flex-row lg:items-center">
						<div className="relative flex-1">
							<MagnifyingGlassIcon className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
							<Input
								placeholder={t`Search mentors by name, title, or skills...`}
								value={searchQuery}
								onChange={(e) => onSearchQueryChange(e.target.value)}
								className="pl-10"
							/>
						</div>

						<div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
							<Select value={expertiseFilter} onValueChange={onExpertiseFilterChange}>
								<SelectTrigger className="w-full sm:w-[180px]">
									<SelectValue placeholder={t`Expertise`} />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">
										<Trans>All Expertise</Trans>
									</SelectItem>
									{allExpertise.map((exp) => (
										<SelectItem key={exp} value={exp}>
											{exp}
										</SelectItem>
									))}
								</SelectContent>
							</Select>

							<Select value={industryFilter} onValueChange={onIndustryFilterChange}>
								<SelectTrigger className="w-full sm:w-[180px]">
									<SelectValue placeholder={t`Industry`} />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">
										<Trans>All Industries</Trans>
									</SelectItem>
									{allIndustries.map((ind) => (
										<SelectItem key={ind} value={ind}>
											{ind}
										</SelectItem>
									))}
								</SelectContent>
							</Select>

							<Select value={availabilityFilter} onValueChange={onAvailabilityFilterChange}>
								<SelectTrigger className="w-full sm:w-[150px]">
									<SelectValue placeholder={t`Availability`} />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">
										<Trans>All Status</Trans>
									</SelectItem>
									<SelectItem value="available">
										<Trans>Available</Trans>
									</SelectItem>
									<SelectItem value="busy">
										<Trans>Busy</Trans>
									</SelectItem>
								</SelectContent>
							</Select>

							<Button variant="outline" size="icon" onClick={onEditProfile}>
								<Tooltip>
									<TooltipTrigger asChild>
										<FunnelIcon className="size-4" />
									</TooltipTrigger>
									<TooltipContent>
										<Trans>Edit Matching Preferences</Trans>
									</TooltipContent>
								</Tooltip>
							</Button>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Mentors Grid */}
			<div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
				<AnimatePresence mode="popLayout">
					{filteredMentors.map((mentor) => (
						<MentorCard
							key={mentor.id}
							mentor={mentor}
							statusConfig={statusConfig}
							onViewMentor={onViewMentor}
							onRequestMentorship={onRequestMentorship}
						/>
					))}
				</AnimatePresence>
			</div>

			{filteredMentors.length === 0 && (
				<Card className="p-12 text-center">
					<div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-muted">
						<MagnifyingGlassIcon className="size-8 text-muted-foreground" />
					</div>
					<h3 className="mb-2 font-semibold text-lg">
						<Trans>No Mentors Found</Trans>
					</h3>
					<p className="text-muted-foreground">
						<Trans>Try adjusting your search filters to find more mentors</Trans>
					</p>
				</Card>
			)}
		</div>
	);
}

// ========================
// RecommendedTabContent
// ========================

interface RecommendedTabContentProps {
	userGoals: { targetRole: string; skills: string[]; industries: string[]; timeline: string };
	recommendedMentors: (MentorData & { matchScore?: number })[];
	onViewMentor: (mentor: MentorData) => void;
	onRequestMentorship: (mentor: MentorData) => void;
	onEditProfile: () => void;
}

export function RecommendedTabContent({
	userGoals,
	recommendedMentors,
	onViewMentor,
	onRequestMentorship,
	onEditProfile,
}: RecommendedTabContentProps) {
	const statusConfig = getStatusConfig();

	return (
		<div className="space-y-6">
			{/* User Goals Summary */}
			<Card>
				<CardHeader>
					<div className="flex items-center justify-between">
						<div>
							<CardTitle>
								<Trans>Your Career Goals</Trans>
							</CardTitle>
							<CardDescription>
								<Trans>Mentor recommendations are based on your profile</Trans>
							</CardDescription>
						</div>
						<Button variant="outline" onClick={onEditProfile}>
							<PencilSimpleIcon className="mr-2 size-4" />
							<Trans>Edit Profile</Trans>
						</Button>
					</div>
				</CardHeader>
				<CardContent>
					<div className="grid gap-4 md:grid-cols-4">
						<div>
							<Label className="text-muted-foreground text-xs">
								<Trans>Target Role</Trans>
							</Label>
							<p className="font-medium">{userGoals.targetRole || t`Not set`}</p>
						</div>
						<div>
							<Label className="text-muted-foreground text-xs">
								<Trans>Key Skills</Trans>
							</Label>
							<div className="mt-1 flex flex-wrap gap-1">
								{userGoals.skills.length > 0 ? (
									userGoals.skills.map((skill) => (
										<Badge key={skill} variant="secondary" className="text-xs">
											{skill}
										</Badge>
									))
								) : (
									<span className="text-muted-foreground text-sm">
										<Trans>Not set</Trans>
									</span>
								)}
							</div>
						</div>
						<div>
							<Label className="text-muted-foreground text-xs">
								<Trans>Target Industries</Trans>
							</Label>
							<div className="mt-1 flex flex-wrap gap-1">
								{userGoals.industries.length > 0 ? (
									userGoals.industries.map((ind) => (
										<Badge key={ind} variant="outline" className="text-xs">
											{ind}
										</Badge>
									))
								) : (
									<span className="text-muted-foreground text-sm">
										<Trans>Not set</Trans>
									</span>
								)}
							</div>
						</div>
						<div>
							<Label className="text-muted-foreground text-xs">
								<Trans>Timeline</Trans>
							</Label>
							<p className="font-medium">{userGoals.timeline}</p>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Top Recommendations */}
			<div>
				<h2 className="mb-4 font-semibold text-lg">
					<Trans>Top Mentor Recommendations</Trans>
				</h2>
				<div className="grid gap-6 md:grid-cols-3">
					<AnimatePresence mode="popLayout">
						{recommendedMentors.map((mentor) => (
							<MentorCard
								key={mentor.id}
								mentor={mentor}
								statusConfig={statusConfig}
								onViewMentor={onViewMentor}
								onRequestMentorship={onRequestMentorship}
							/>
						))}
					</AnimatePresence>
				</div>
			</div>

			{/* Why These Mentors */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<LightbulbIcon className="size-5 text-amber-500" />
						<Trans>Why These Mentors?</Trans>
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="grid gap-4 md:grid-cols-3">
						<div className="flex items-start gap-3">
							<div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
								<ChartLineUpIcon className="size-4 text-blue-600 dark:text-blue-400" />
							</div>
							<div>
								<h4 className="font-medium">
									<Trans>Skills Alignment</Trans>
								</h4>
								<p className="text-muted-foreground text-sm">
									<Trans>Mentors with expertise in your target skills</Trans>
								</p>
							</div>
						</div>
						<div className="flex items-start gap-3">
							<div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
								<BriefcaseIcon className="size-4 text-green-600 dark:text-green-400" />
							</div>
							<div>
								<h4 className="font-medium">
									<Trans>Industry Experience</Trans>
								</h4>
								<p className="text-muted-foreground text-sm">
									<Trans>Professionals from your target industries</Trans>
								</p>
							</div>
						</div>
						<div className="flex items-start gap-3">
							<div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/30">
								<RocketLaunchIcon className="size-4 text-purple-600 dark:text-purple-400" />
							</div>
							<div>
								<h4 className="font-medium">
									<Trans>Career Path Match</Trans>
								</h4>
								<p className="text-muted-foreground text-sm">
									<Trans>Mentors who have achieved your target role</Trans>
								</p>
							</div>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}

// ========================
// SessionsTabContent
// ========================

interface SessionsTabContentProps {
	activeMentorship:
		| { mentorId: string; mentorName: string; respondedAt: string | Date | null; createdAt: string | Date }
		| undefined;
	mentors: MentorData[];
	upcomingSessions: Array<{
		id: string;
		topic: string;
		mentorName: string;
		mentorAvatar?: string | null;
		scheduledAt: string | Date;
		duration: number;
		type: string;
		status: string;
		notes: string;
		rating?: number | null;
		feedback?: string | null;
	}>;
	pastSessions: Array<{
		id: string;
		topic: string;
		mentorName: string;
		mentorAvatar?: string | null;
		scheduledAt: string | Date;
		duration: number;
		type: string;
		status: string;
		notes: string;
		rating?: number | null;
		feedback?: string | null;
	}>;
	onBookSession: (mentor: MentorData) => void;
	onViewSessionNotes: (session: SessionData) => void;
}

export function SessionsTabContent({
	activeMentorship,
	mentors,
	upcomingSessions,
	pastSessions,
	onBookSession,
	onViewSessionNotes,
}: SessionsTabContentProps) {
	const sessionTypeConfig = getSessionTypeConfig();

	return (
		<div className="space-y-6">
			{/* Book New Session */}
			{activeMentorship && (
				<Card>
					<CardContent className="flex items-center justify-between p-4">
						<div className="flex items-center gap-4">
							<Avatar size="lg">
								<AvatarImage
									src={mentors.find((m) => m.id === activeMentorship.mentorId)?.avatar ?? undefined}
									alt={activeMentorship.mentorName}
								/>
								<AvatarFallback>
									{getInitials(
										activeMentorship.mentorName.split(" ")[0],
										activeMentorship.mentorName.split(" ")[1] || "",
									)}
								</AvatarFallback>
							</Avatar>
							<div>
								<p className="font-medium">
									<Trans>Active Mentorship with {activeMentorship.mentorName}</Trans>
								</p>
								<p className="text-muted-foreground text-sm">
									<Trans>
										Since{" "}
										{formatDate(activeMentorship.respondedAt || activeMentorship.createdAt, {
											day: "numeric",
											month: "short",
											year: "numeric",
										})}
									</Trans>
								</p>
							</div>
						</div>
						<Button
							onClick={() => {
								const mentor = mentors.find((m) => m.id === activeMentorship.mentorId);
								if (mentor) onBookSession(mentor as MentorData);
							}}
						>
							<CalendarIcon className="mr-2 size-4" />
							<Trans>Book Session</Trans>
						</Button>
					</CardContent>
				</Card>
			)}

			{/* Upcoming Sessions */}
			<div>
				<h2 className="mb-4 font-semibold text-lg">
					<Trans>Upcoming Sessions</Trans>
				</h2>
				{upcomingSessions.length > 0 ? (
					<div className="space-y-4">
						{upcomingSessions.map((session) => {
							const SessionIcon = sessionTypeConfig[session.type as keyof typeof sessionTypeConfig].icon;
							return (
								<motion.div key={session.id} initial={false} animate={{ opacity: 1, y: 0 }}>
									<Card>
										<CardContent className="flex items-center justify-between p-4">
											<div className="flex items-center gap-4">
												<Avatar>
													{session.mentorAvatar ? (
														<AvatarImage src={session.mentorAvatar} alt={session.mentorName} />
													) : null}
													<AvatarFallback>
														{getInitials(session.mentorName.split(" ")[0], session.mentorName.split(" ")[1] || "")}
													</AvatarFallback>
												</Avatar>
												<div>
													<p className="font-medium">{session.topic}</p>
													<div className="mt-1 flex items-center gap-3 text-muted-foreground text-sm">
														<span className="flex items-center gap-1">
															<CalendarIcon className="size-3.5" />
															{formatDateTime(session.scheduledAt)}
														</span>
														<span className="flex items-center gap-1">
															<ClockIcon className="size-3.5" />
															{session.duration} min
														</span>
														<span className="flex items-center gap-1">
															<SessionIcon className="size-3.5" />
															{sessionTypeConfig[session.type as keyof typeof sessionTypeConfig].label}
														</span>
													</div>
												</div>
											</div>
											<div className="flex items-center gap-2">
												<Button variant="outline" size="sm">
													<VideoIcon className="mr-2 size-4" />
													<Trans>Join</Trans>
												</Button>
												<DropdownMenu>
													<DropdownMenuTrigger asChild>
														<Button variant="ghost" size="icon">
															<NotePencilIcon className="size-4" />
														</Button>
													</DropdownMenuTrigger>
													<DropdownMenuContent align="end">
														<DropdownMenuItem onClick={() => onViewSessionNotes(session)}>
															<NoteIcon className="mr-2 size-4" />
															<Trans>Add Notes</Trans>
														</DropdownMenuItem>
														<DropdownMenuSeparator />
														<DropdownMenuItem className="text-destructive">
															<XIcon className="mr-2 size-4" />
															<Trans>Cancel Session</Trans>
														</DropdownMenuItem>
													</DropdownMenuContent>
												</DropdownMenu>
											</div>
										</CardContent>
									</Card>
								</motion.div>
							);
						})}
					</div>
				) : (
					<Card className="p-8 text-center">
						<CalendarIcon className="mx-auto mb-4 size-12 text-muted-foreground" />
						<h3 className="mb-2 font-semibold">
							<Trans>No Upcoming Sessions</Trans>
						</h3>
						<p className="mb-4 text-muted-foreground">
							<Trans>Book a session with your mentor to get started</Trans>
						</p>
					</Card>
				)}
			</div>

			{/* Session History */}
			<div>
				<h2 className="mb-4 font-semibold text-lg">
					<Trans>Session History</Trans>
				</h2>
				{pastSessions.length > 0 ? (
					<div className="space-y-4">
						{pastSessions.map((session) => (
							<motion.div key={session.id} initial={false} animate={{ opacity: 1, y: 0 }}>
								<Card>
									<CardContent className="p-4">
										<div className="flex items-start justify-between">
											<div className="flex items-start gap-4">
												<Avatar>
													{session.mentorAvatar ? (
														<AvatarImage src={session.mentorAvatar} alt={session.mentorName} />
													) : null}
													<AvatarFallback>
														{getInitials(session.mentorName.split(" ")[0], session.mentorName.split(" ")[1] || "")}
													</AvatarFallback>
												</Avatar>
												<div>
													<p className="font-medium">{session.topic}</p>
													<p className="text-muted-foreground text-sm">
														with {session.mentorName} on{" "}
														{formatDate(session.scheduledAt, { day: "numeric", month: "short", year: "numeric" })}
													</p>
													{session.notes && <p className="mt-2 line-clamp-2 text-sm">{session.notes}</p>}
													{session.rating && (
														<div className="mt-2 flex items-center gap-2">
															<StarRating rating={session.rating} />
															{session.feedback && (
																<span className="text-muted-foreground text-sm">&ldquo;{session.feedback}&rdquo;</span>
															)}
														</div>
													)}
												</div>
											</div>
											<Button variant="ghost" size="sm" onClick={() => onViewSessionNotes(session)}>
												<NoteIcon className="mr-2 size-4" />
												<Trans>View Notes</Trans>
											</Button>
										</div>
									</CardContent>
								</Card>
							</motion.div>
						))}
					</div>
				) : (
					<Card className="p-8 text-center">
						<BookOpenIcon className="mx-auto mb-4 size-12 text-muted-foreground" />
						<h3 className="mb-2 font-semibold">
							<Trans>No Past Sessions</Trans>
						</h3>
						<p className="text-muted-foreground">
							<Trans>Your completed sessions will appear here</Trans>
						</p>
					</Card>
				)}
			</div>
		</div>
	);
}

// ========================
// GoalsTabContent
// ========================

interface GoalsTabContentProps {
	goals: Array<{
		id: string;
		title: string;
		description: string;
		status: string;
		progress: number;
		targetDate: string | Date;
		milestones: Array<{
			id: string;
			title: string;
			completed: boolean;
			completedAt?: string | Date | null;
		}>;
	}>;
	onShowGoalDialog: () => void;
	onToggleMilestone: (goalId: string, milestoneId: string) => void;
}

export function GoalsTabContent({ goals, onShowGoalDialog, onToggleMilestone }: GoalsTabContentProps) {
	const goalStatusConfig = getGoalStatusConfig();

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h2 className="font-semibold text-lg">
						<Trans>Mentorship Goals</Trans>
					</h2>
					<p className="text-muted-foreground text-sm">
						<Trans>Track your progress with your mentor</Trans>
					</p>
				</div>
				<Button onClick={onShowGoalDialog}>
					<PlusIcon className="mr-2 size-4" />
					<Trans>Add Goal</Trans>
				</Button>
			</div>

			{goals.length > 0 ? (
				<div className="space-y-4">
					{goals.map((goal) => (
						<motion.div key={goal.id} initial={false} animate={{ opacity: 1, y: 0 }}>
							<Card>
								<CardHeader className="pb-3">
									<div className="flex items-start justify-between">
										<div>
											<div className="flex items-center gap-2">
												<CardTitle className="text-base">{goal.title}</CardTitle>
												<Badge className={goalStatusConfig[goal.status as GoalStatus].color}>
													{goalStatusConfig[goal.status as GoalStatus].label}
												</Badge>
											</div>
											<CardDescription className="mt-1">{goal.description}</CardDescription>
										</div>
										<div className="text-right">
											<p className="font-semibold text-2xl">{goal.progress}%</p>
											<p className="text-muted-foreground text-xs">
												<Trans>
													Target: {formatDate(goal.targetDate, { day: "numeric", month: "short", year: "numeric" })}
												</Trans>
											</p>
										</div>
									</div>
								</CardHeader>
								<CardContent className="space-y-4">
									<Progress value={goal.progress} />

									{goal.milestones.length > 0 && (
										<div className="space-y-2">
											<Label className="text-muted-foreground text-xs">
												<Trans>Milestones</Trans>
											</Label>
											<div className="space-y-2">
												{goal.milestones.map((milestone) => (
													<div key={milestone.id} className="flex items-center gap-3 rounded-lg border p-3">
														<button
															type="button"
															onClick={() => onToggleMilestone(goal.id, milestone.id)}
															className={cn(
																"flex size-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
																milestone.completed
																	? "border-green-500 bg-green-500 text-white"
																	: "border-muted-foreground/30 hover:border-primary",
															)}
														>
															{milestone.completed && <CheckCircleIcon className="size-3" />}
														</button>
														<div className="flex-1">
															<p className={cn("text-sm", milestone.completed && "text-muted-foreground line-through")}>
																{milestone.title}
															</p>
															{milestone.completedAt && (
																<p className="text-muted-foreground text-xs">
																	<Trans>
																		Completed{" "}
																		{formatDate(milestone.completedAt, {
																			day: "numeric",
																			month: "short",
																			year: "numeric",
																		})}
																	</Trans>
																</p>
															)}
														</div>
													</div>
												))}
											</div>
										</div>
									)}
								</CardContent>
							</Card>
						</motion.div>
					))}
				</div>
			) : (
				<Card className="p-12 text-center">
					<TargetIcon className="mx-auto mb-4 size-12 text-muted-foreground" />
					<h3 className="mb-2 font-semibold text-lg">
						<Trans>No Goals Yet</Trans>
					</h3>
					<p className="mb-4 text-muted-foreground">
						<Trans>Set goals with your mentor to track your progress</Trans>
					</p>
					<Button onClick={onShowGoalDialog}>
						<PlusIcon className="mr-2 size-4" />
						<Trans>Add Your First Goal</Trans>
					</Button>
				</Card>
			)}
		</div>
	);
}

// ========================
// RequestsTabContent
// ========================

interface RequestsTabContentProps {
	requests: Array<{
		id: string;
		mentorId: string;
		mentorName: string;
		status: string;
		message: string;
		goals?: string[] | null;
		createdAt: string | Date;
		respondedAt?: string | Date | null;
	}>;
	mentors: MentorData[];
	onBookSession: (mentor: MentorData) => void;
	onSetActiveTab: (tab: string) => void;
}

export function RequestsTabContent({ requests, mentors, onBookSession, onSetActiveTab }: RequestsTabContentProps) {
	const requestStatusConfig = getRequestStatusConfig();

	return (
		<div className="space-y-6">
			<h2 className="font-semibold text-lg">
				<Trans>Mentorship Requests</Trans>
			</h2>

			{requests.length > 0 ? (
				<div className="space-y-4">
					{requests.map((request) => {
						const StatusIcon = requestStatusConfig[request.status as RequestStatus].icon;
						const mentor = mentors.find((m) => m.id === request.mentorId);

						return (
							<motion.div key={request.id} initial={false} animate={{ opacity: 1, y: 0 }}>
								<Card>
									<CardContent className="p-4">
										<div className="flex items-start gap-4">
											<Avatar size="lg">
												{mentor?.avatar ? <AvatarImage src={mentor.avatar} alt={request.mentorName} /> : null}
												<AvatarFallback>
													{getInitials(request.mentorName.split(" ")[0], request.mentorName.split(" ")[1] || "")}
												</AvatarFallback>
											</Avatar>

											<div className="flex-1">
												<div className="flex items-center gap-2">
													<h3 className="font-medium">{request.mentorName}</h3>
													<Badge className={requestStatusConfig[request.status as RequestStatus].color}>
														<StatusIcon className="mr-1 size-3" />
														{requestStatusConfig[request.status as RequestStatus].label}
													</Badge>
												</div>
												<p className="mt-1 text-muted-foreground text-sm">
													<Trans>
														{mentor?.title} at {mentor?.company}
													</Trans>
												</p>

												<div className="mt-3 rounded-lg bg-muted/50 p-3">
													<p className="text-sm">{request.message}</p>
												</div>

												{(request.goals ?? []).length > 0 && (
													<div className="mt-3">
														<Label className="text-muted-foreground text-xs">
															<Trans>Goals</Trans>
														</Label>
														<div className="mt-1 flex flex-wrap gap-1.5">
															{(request.goals ?? []).map((goal, index) => (
																<Badge key={index} variant="outline" className="text-xs">
																	{goal}
																</Badge>
															))}
														</div>
													</div>
												)}

												<p className="mt-3 text-muted-foreground text-xs">
													<Trans>
														Sent on {formatDate(request.createdAt, { day: "numeric", month: "short", year: "numeric" })}
													</Trans>
													{request.respondedAt && (
														<>
															{" "}
															&middot;{" "}
															<Trans>
																Responded on{" "}
																{formatDate(request.respondedAt, {
																	day: "numeric",
																	month: "short",
																	year: "numeric",
																})}
															</Trans>
														</>
													)}
												</p>
											</div>

											{request.status === "accepted" && mentor && (
												<Button onClick={() => onBookSession(mentor as MentorData)}>
													<CalendarIcon className="mr-2 size-4" />
													<Trans>Book Session</Trans>
												</Button>
											)}
										</div>
									</CardContent>
								</Card>
							</motion.div>
						);
					})}
				</div>
			) : (
				<Card className="p-12 text-center">
					<EnvelopeIcon className="mx-auto mb-4 size-12 text-muted-foreground" />
					<h3 className="mb-2 font-semibold text-lg">
						<Trans>No Requests Yet</Trans>
					</h3>
					<p className="mb-4 text-muted-foreground">
						<Trans>Browse mentors and send a request to get started</Trans>
					</p>
					<Button onClick={() => onSetActiveTab("discover")}>
						<MagnifyingGlassIcon className="mr-2 size-4" />
						<Trans>Find Mentors</Trans>
					</Button>
				</Card>
			)}
		</div>
	);
}

// ========================
// MessagesTabContent
// ========================

interface MessagesTabContentProps {
	conversations: Array<{
		otherUserId: string;
		otherUserName: string;
		otherUserAvatar?: string | null;
		lastMessage: string;
		lastMessageAt: string | Date;
		unreadCount: number;
		isLastMessageFromMe: boolean;
	}>;
	conversationMessages: Array<{
		id: string;
		senderId: string;
		subject?: string | null;
		content: string;
		createdAt: string | Date;
	}>;
	selectedConversation: string | null;
	onSelectConversation: (otherUserId: string) => void;
	onClearConversation: () => void;
	isLoadingConversations: boolean;
	isLoadingMessages: boolean;
	unreadCount: number;
	replyMessage: string;
	onReplyMessageChange: (value: string) => void;
	onSendReply: () => void;
	isSendingMessage: boolean;
	onShowComposeDialog: () => void;
	activeMentorship: { mentorId: string; mentorName: string } | undefined;
	mentors: MentorData[];
	onStartConversationWithMentor: (mentorUserId: string) => void;
	onBookSession: (mentor: MentorData) => void;
}

export function MessagesTabContent({
	conversations,
	conversationMessages,
	selectedConversation,
	onSelectConversation,
	onClearConversation,
	isLoadingConversations,
	isLoadingMessages,
	unreadCount,
	replyMessage,
	onReplyMessageChange,
	onSendReply,
	isSendingMessage,
	onShowComposeDialog,
	activeMentorship,
	mentors,
	onStartConversationWithMentor,
	onBookSession,
}: MessagesTabContentProps) {
	return (
		<div className="space-y-6">
			{/* Header with compose button */}
			<div className="flex items-center justify-between">
				<div>
					<h2 className="font-semibold text-lg">
						<Trans>Messages</Trans>
					</h2>
					<p className="text-muted-foreground text-sm">
						<Trans>Communicate with your mentors</Trans>
					</p>
				</div>
				<Button onClick={onShowComposeDialog}>
					<PlusIcon className="mr-2 size-4" />
					<Trans>New Message</Trans>
				</Button>
			</div>

			<div className="grid gap-6 lg:grid-cols-3">
				{/* Conversations List */}
				<Card className="lg:col-span-1">
					<CardHeader className="pb-3">
						<CardTitle className="flex items-center gap-2 text-base">
							<Trans>Conversations</Trans>
							{unreadCount > 0 && (
								<Badge variant="destructive" className="ml-auto text-xs">
									{unreadCount}
								</Badge>
							)}
						</CardTitle>
					</CardHeader>
					<CardContent className="p-0">
						{isLoadingConversations ? (
							<div className="space-y-3 p-4">
								{[1, 2, 3].map((i) => (
									<div key={i} className="flex items-center gap-3">
										<Skeleton className="size-10 rounded-full" />
										<div className="flex-1 space-y-2">
											<Skeleton className="h-4 w-24" />
											<Skeleton className="h-3 w-full" />
										</div>
									</div>
								))}
							</div>
						) : conversations.length > 0 ? (
							<div className="max-h-[400px] overflow-y-auto">
								{conversations.map((conv) => (
									<button
										key={conv.otherUserId}
										type="button"
										onClick={() => onSelectConversation(conv.otherUserId)}
										className={cn(
											"flex w-full items-center gap-3 p-4 text-left transition-colors hover:bg-muted/50",
											selectedConversation === conv.otherUserId && "bg-muted",
										)}
									>
										<Avatar>
											{conv.otherUserAvatar ? (
												<AvatarImage src={conv.otherUserAvatar} alt={conv.otherUserName} />
											) : null}
											<AvatarFallback>{conv.otherUserName.charAt(0)}</AvatarFallback>
										</Avatar>
										<div className="min-w-0 flex-1">
											<div className="flex items-center justify-between gap-2">
												<span className="truncate font-medium text-sm">{conv.otherUserName}</span>
												{conv.unreadCount > 0 && (
													<Badge variant="destructive" className="text-xs">
														{conv.unreadCount}
													</Badge>
												)}
											</div>
											<p className="line-clamp-1 text-muted-foreground text-xs">
												{conv.isLastMessageFromMe && (
													<span className="text-primary">
														<Trans>You: </Trans>
													</span>
												)}
												{conv.lastMessage}
											</p>
											<p className="mt-0.5 text-muted-foreground text-xs">
												{formatDate(conv.lastMessageAt, { day: "numeric", month: "short", year: "numeric" })}
											</p>
										</div>
									</button>
								))}
							</div>
						) : (
							<div className="p-8 text-center">
								<ChatCircleDotsIcon className="mx-auto mb-3 size-10 text-muted-foreground" />
								<p className="text-muted-foreground text-sm">
									<Trans>No conversations yet</Trans>
								</p>
								<Button variant="link" size="sm" onClick={onShowComposeDialog} className="mt-2">
									<Trans>Start a conversation</Trans>
								</Button>
							</div>
						)}
					</CardContent>
				</Card>

				{/* Message Thread */}
				<Card className="lg:col-span-2">
					{selectedConversation ? (
						<>
							<CardHeader className="border-b pb-3">
								<div className="flex items-center gap-3">
									<Button variant="ghost" size="icon" onClick={onClearConversation} className="lg:hidden">
										<ArrowLeftIcon className="size-4" />
									</Button>
									<Avatar>
										{conversations.find((c) => c.otherUserId === selectedConversation)?.otherUserAvatar ? (
											<AvatarImage
												src={conversations.find((c) => c.otherUserId === selectedConversation)?.otherUserAvatar ?? ""}
												alt={conversations.find((c) => c.otherUserId === selectedConversation)?.otherUserName ?? ""}
											/>
										) : null}
										<AvatarFallback>
											{conversations.find((c) => c.otherUserId === selectedConversation)?.otherUserName?.charAt(0) ??
												"?"}
										</AvatarFallback>
									</Avatar>
									<div>
										<CardTitle className="text-base">
											{conversations.find((c) => c.otherUserId === selectedConversation)?.otherUserName}
										</CardTitle>
									</div>
								</div>
							</CardHeader>
							<CardContent className="flex h-[400px] flex-col p-0">
								{/* Messages */}
								<div className="flex-1 overflow-y-auto p-4">
									{isLoadingMessages ? (
										<div className="space-y-4">
											{[1, 2, 3].map((i) => (
												<div key={i} className={cn("flex", i % 2 === 0 ? "justify-end" : "justify-start")}>
													<Skeleton className="h-16 w-48 rounded-lg" />
												</div>
											))}
										</div>
									) : conversationMessages.length > 0 ? (
										<div className="space-y-4">
											{conversationMessages.map((msg) => {
												const isFromMe = msg.senderId !== selectedConversation;
												return (
													<motion.div
														key={msg.id}
														initial={false}
														animate={{ opacity: 1, y: 0 }}
														className={cn("flex", isFromMe ? "justify-end" : "justify-start")}
													>
														<div
															className={cn(
																"max-w-[75%] rounded-lg px-4 py-2",
																isFromMe ? "bg-primary text-primary-foreground" : "bg-muted",
															)}
														>
															{msg.subject && (
																<p
																	className={cn(
																		"mb-1 font-medium text-xs",
																		isFromMe ? "text-primary-foreground/80" : "text-muted-foreground",
																	)}
																>
																	{msg.subject}
																</p>
															)}
															<p className="whitespace-pre-wrap text-sm">{msg.content}</p>
															<p
																className={cn(
																	"mt-1 text-right text-xs",
																	isFromMe ? "text-primary-foreground/70" : "text-muted-foreground",
																)}
															>
																{formatDateTime(msg.createdAt)}
															</p>
														</div>
													</motion.div>
												);
											})}
										</div>
									) : (
										<div className="flex h-full items-center justify-center">
											<p className="text-muted-foreground text-sm">
												<Trans>No messages yet. Start the conversation!</Trans>
											</p>
										</div>
									)}
								</div>

								{/* Reply Input */}
								<div className="border-t p-4">
									<div className="flex items-end gap-2">
										<Textarea
											placeholder={t`Type your message...`}
											value={replyMessage}
											onChange={(e) => onReplyMessageChange(e.target.value)}
											className="min-h-[60px] resize-none"
											onKeyDown={(e) => {
												if (e.key === "Enter" && !e.shiftKey) {
													e.preventDefault();
													onSendReply();
												}
											}}
										/>
										<Button onClick={onSendReply} disabled={!replyMessage.trim() || isSendingMessage}>
											<PaperPlaneRightIcon className="size-4" />
										</Button>
									</div>
								</div>
							</CardContent>
						</>
					) : (
						<CardContent className="flex h-[500px] flex-col items-center justify-center">
							<ChatCircleDotsIcon className="mb-4 size-16 text-muted-foreground" />
							<h3 className="mb-2 font-semibold text-lg">
								<Trans>Select a Conversation</Trans>
							</h3>
							<p className="mb-4 text-center text-muted-foreground">
								<Trans>Choose a conversation from the list or start a new one</Trans>
							</p>
							<Button onClick={onShowComposeDialog}>
								<PlusIcon className="mr-2 size-4" />
								<Trans>New Message</Trans>
							</Button>
						</CardContent>
					)}
				</Card>
			</div>

			{/* Quick Actions */}
			{activeMentorship && (
				<Card>
					<CardContent className="flex items-center justify-between p-4">
						<div className="flex items-center gap-4">
							<Avatar>
								<AvatarImage
									src={mentors.find((m) => m.id === activeMentorship.mentorId)?.avatar ?? undefined}
									alt={activeMentorship.mentorName}
								/>
								<AvatarFallback>
									{getInitials(
										activeMentorship.mentorName.split(" ")[0],
										activeMentorship.mentorName.split(" ")[1] || "",
									)}
								</AvatarFallback>
							</Avatar>
							<div>
								<p className="font-medium">
									<Trans>Active Mentorship with {activeMentorship.mentorName}</Trans>
								</p>
								<p className="text-muted-foreground text-sm">
									<Trans>Send them a quick message or book a session</Trans>
								</p>
							</div>
						</div>
						<div className="flex gap-2">
							<Button
								variant="outline"
								onClick={() => {
									const mentor = mentors.find((m) => m.id === activeMentorship.mentorId);
									if (mentor) {
										onStartConversationWithMentor(mentor.userId);
									}
								}}
							>
								<ChatCircleDotsIcon className="mr-2 size-4" />
								<Trans>Message</Trans>
							</Button>
							<Button
								onClick={() => {
									const mentor = mentors.find((m) => m.id === activeMentorship.mentorId);
									if (mentor) onBookSession(mentor as MentorData);
								}}
							>
								<VideoIcon className="mr-2 size-4" />
								<Trans>Book Session</Trans>
							</Button>
						</div>
					</CardContent>
				</Card>
			)}
		</div>
	);
}
