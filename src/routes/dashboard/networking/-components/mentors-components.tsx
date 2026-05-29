import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import {
	ArrowRightIcon,
	CalendarIcon,
	CheckCircleIcon,
	EnvelopeIcon,
	LinkedinLogoIcon,
	MapPinIcon,
	PaperPlaneRightIcon,
	PlusIcon,
	StarIcon,
	TrashIcon,
	UserPlusIcon,
} from "@phosphor-icons/react";
import { motion } from "motion/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/utils/style";
import { daysOfWeek, getExpertiseLevelConfig, getSessionTypeConfig, getStatusConfig } from "./mentors-config";
import type { AvailabilitySlot, MentorStatus, SessionType, Skill } from "./mentors-types";
import { formatDate, getInitials } from "./mentors-utils";

// ========================
// Shared types for component props
// ========================

export interface MentorData {
	id: string;
	userId: string;
	firstName: string;
	lastName: string;
	email: string;
	avatar?: string | null;
	title: string;
	company: string;
	location: string;
	bio: string;
	expertise?: string[] | null;
	skills?: Skill[] | null;
	yearsOfExperience: number;
	industries?: string[] | null;
	languages?: string[] | null;
	status: MentorStatus;
	rating: number;
	totalReviews: number;
	totalSessions: number;
	totalMentees: number;
	hourlyRate?: number | null;
	isFree: boolean;
	linkedinUrl?: string | null;
	availability?: AvailabilitySlot[] | null;
	careerPath?: string[] | null;
	achievements?: string[] | null;
	matchScore?: number;
}

export interface SessionData {
	id: string;
	topic: string;
	notes: string;
	status: string;
	rating?: number | null;
	feedback?: string | null;
}

// ========================
// StarRating
// ========================

export function StarRating({ rating, size = "size-4" }: { rating: number; size?: string }) {
	return (
		<div className="flex items-center gap-0.5">
			{[1, 2, 3, 4, 5].map((star) => (
				<StarIcon
					key={star}
					weight={star <= rating ? "fill" : "regular"}
					className={cn(size, star <= rating ? "text-amber-500" : "text-muted-foreground/30")}
				/>
			))}
		</div>
	);
}

// ========================
// MentorCard
// ========================

interface MentorCardProps {
	mentor: MentorData & { matchScore?: number };
	showMatchScore?: boolean;
	statusConfig: ReturnType<typeof getStatusConfig>;
	onViewMentor: (mentor: MentorData) => void;
	onRequestMentorship: (mentor: MentorData) => void;
}

export function MentorCard({
	mentor,
	showMatchScore = true,
	statusConfig,
	onViewMentor,
	onRequestMentorship,
}: MentorCardProps) {
	return (
		<motion.div
			key={mentor.id}
			initial={false}
			animate={{ opacity: 1, y: 0 }}
			exit={{ opacity: 0, y: -20 }}
			transition={{ duration: 0.2 }}
		>
			<Card className="group relative overflow-hidden transition-all hover:shadow-lg">
				{showMatchScore && mentor.matchScore !== undefined && (
					<div className="absolute top-3 right-3 z-10">
						<Badge
							className={cn(
								"font-semibold",
								mentor.matchScore >= 80
									? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
									: mentor.matchScore >= 60
										? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
										: "bg-gray-100 text-gray-700 dark:bg-gray-800/30 dark:text-gray-400",
							)}
						>
							<Trans>{mentor.matchScore}% Match</Trans>
						</Badge>
					</div>
				)}

				<CardHeader className="pb-3">
					<div className="flex items-start gap-4">
						<Avatar size="lg">
							{mentor.avatar ? (
								<AvatarImage src={mentor.avatar} alt={`${mentor.firstName} ${mentor.lastName}`} />
							) : null}
							<AvatarFallback>{getInitials(mentor.firstName, mentor.lastName)}</AvatarFallback>
						</Avatar>

						<div className="min-w-0 flex-1">
							<div className="flex items-center gap-2">
								<CardTitle className="truncate text-lg">
									{mentor.firstName} {mentor.lastName}
								</CardTitle>
								<Badge className={cn("text-xs", statusConfig[mentor.status].color)}>
									{statusConfig[mentor.status].label}
								</Badge>
							</div>
							<CardDescription className="mt-1 line-clamp-1">
								<Trans>
									{mentor.title} at {mentor.company}
								</Trans>
							</CardDescription>
							<div className="mt-2 flex items-center gap-4 text-muted-foreground text-sm">
								<div className="flex items-center gap-1">
									<MapPinIcon className="size-3.5" />
									<span className="truncate">{mentor.location}</span>
								</div>
								<div className="flex items-center gap-1">
									<StarRating rating={Math.round(mentor.rating)} size="size-3.5" />
									<span>({mentor.totalReviews})</span>
								</div>
							</div>
						</div>
					</div>
				</CardHeader>

				<CardContent className="space-y-4">
					<p className="line-clamp-2 text-muted-foreground text-sm">{mentor.bio}</p>

					<div className="flex flex-wrap gap-1.5">
						{(mentor.expertise ?? []).slice(0, 4).map((exp) => (
							<Badge key={exp} variant="secondary" className="text-xs">
								{exp}
							</Badge>
						))}
						{(mentor.expertise ?? []).length > 4 && (
							<Badge variant="outline" className="text-xs">
								<Trans>+{(mentor.expertise ?? []).length - 4} more</Trans>
							</Badge>
						)}
					</div>

					<div className="flex items-center justify-between text-muted-foreground text-sm">
						<div className="flex items-center gap-4">
							<span>
								<Trans>{mentor.yearsOfExperience}+ years exp.</Trans>
							</span>
							<span>
								<Trans>{mentor.totalSessions} sessions</Trans>
							</span>
						</div>
						{mentor.isFree ? (
							<Badge variant="outline" className="bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400">
								<Trans>Free</Trans>
							</Badge>
						) : (
							<span className="font-medium">${mentor.hourlyRate}/hr</span>
						)}
					</div>
				</CardContent>

				<CardFooter className="gap-2 border-t pt-4">
					<Button variant="outline" className="flex-1" onClick={() => onViewMentor(mentor)}>
						<Trans>View Profile</Trans>
					</Button>
					<Button
						className="flex-1"
						onClick={() => onRequestMentorship(mentor)}
						disabled={mentor.status === "on_vacation"}
					>
						<UserPlusIcon className="mr-2 size-4" />
						<Trans>Connect</Trans>
					</Button>
				</CardFooter>
			</Card>
		</motion.div>
	);
}

// ========================
// LoadingSkeleton
// ========================

export function MentorsLoadingSkeleton() {
	return (
		<div className="space-y-6">
			<div className="grid gap-4 md:grid-cols-4">
				{[1, 2, 3, 4].map((i) => (
					<Card key={i}>
						<CardContent className="flex items-center gap-4 p-4">
							<Skeleton className="size-12 rounded-full" />
							<div className="space-y-2">
								<Skeleton className="h-6 w-16" />
								<Skeleton className="h-4 w-24" />
							</div>
						</CardContent>
					</Card>
				))}
			</div>
			<div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
				{[1, 2, 3].map((i) => (
					<Card key={i}>
						<CardHeader>
							<div className="flex items-start gap-4">
								<Skeleton className="size-16 rounded-full" />
								<div className="space-y-2">
									<Skeleton className="h-5 w-32" />
									<Skeleton className="h-4 w-48" />
								</div>
							</div>
						</CardHeader>
						<CardContent className="space-y-4">
							<Skeleton className="h-16 w-full" />
							<div className="flex gap-2">
								<Skeleton className="h-6 w-20" />
								<Skeleton className="h-6 w-20" />
							</div>
						</CardContent>
					</Card>
				))}
			</div>
		</div>
	);
}

// ========================
// MentorDetailDialog
// ========================

interface MentorDetailDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	mentor: MentorData | null;
	mentorReviews: Array<{
		id: string;
		menteeName: string;
		menteeAvatar?: string | null;
		rating: number;
		comment: string;
		createdAt: string | Date;
	}>;
	onRequestMentorship: (mentor: MentorData) => void;
}

export function MentorDetailDialog({
	open,
	onOpenChange,
	mentor,
	mentorReviews,
	onRequestMentorship,
}: MentorDetailDialogProps) {
	const statusConfig = getStatusConfig();
	const expertiseLevelConfig = getExpertiseLevelConfig();

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-h-[90vh] w-[calc(100vw-2rem)] max-w-3xl overflow-y-auto">
				{mentor && (
					<>
						<DialogHeader>
							<div className="flex items-start gap-4">
								<Avatar size="lg">
									{mentor.avatar ? (
										<AvatarImage src={mentor.avatar} alt={`${mentor.firstName} ${mentor.lastName}`} />
									) : null}
									<AvatarFallback>{getInitials(mentor.firstName, mentor.lastName)}</AvatarFallback>
								</Avatar>
								<div className="flex-1">
									<div className="flex items-center gap-2">
										<DialogTitle>
											{mentor.firstName} {mentor.lastName}
										</DialogTitle>
										<Badge className={statusConfig[mentor.status].color}>{statusConfig[mentor.status].label}</Badge>
									</div>
									<DialogDescription>
										<Trans>
											{mentor.title} at {mentor.company}
										</Trans>
									</DialogDescription>
									<div className="mt-2 flex items-center gap-4 text-sm">
										<div className="flex items-center gap-1">
											<MapPinIcon className="size-4 text-muted-foreground" />
											{mentor.location}
										</div>
										<div className="flex items-center gap-1">
											<StarRating rating={Math.round(mentor.rating)} />
											<span className="text-muted-foreground">
												<Trans>({mentor.totalReviews} reviews)</Trans>
											</span>
										</div>
									</div>
								</div>
							</div>
						</DialogHeader>

						<div className="space-y-6 py-4">
							{/* Bio */}
							<div>
								<h3 className="mb-2 font-semibold">
									<Trans>About</Trans>
								</h3>
								<p className="text-muted-foreground text-sm">{mentor.bio}</p>
							</div>

							{/* Stats */}
							<div className="grid grid-cols-4 gap-4">
								<Card>
									<CardContent className="p-4 text-center">
										<p className="font-bold text-2xl">{mentor.yearsOfExperience}+</p>
										<p className="text-muted-foreground text-xs">
											<Trans>Years Exp.</Trans>
										</p>
									</CardContent>
								</Card>
								<Card>
									<CardContent className="p-4 text-center">
										<p className="font-bold text-2xl">{mentor.totalSessions}</p>
										<p className="text-muted-foreground text-xs">
											<Trans>Sessions</Trans>
										</p>
									</CardContent>
								</Card>
								<Card>
									<CardContent className="p-4 text-center">
										<p className="font-bold text-2xl">{mentor.totalMentees}</p>
										<p className="text-muted-foreground text-xs">
											<Trans>Mentees</Trans>
										</p>
									</CardContent>
								</Card>
								<Card>
									<CardContent className="p-4 text-center">
										<p className="font-bold text-2xl">{mentor.rating.toFixed(1)}</p>
										<p className="text-muted-foreground text-xs">
											<Trans>Rating</Trans>
										</p>
									</CardContent>
								</Card>
							</div>

							{/* Expertise & Skills */}
							<div className="grid gap-4 md:grid-cols-2">
								<div>
									<h3 className="mb-2 font-semibold">
										<Trans>Expertise</Trans>
									</h3>
									<div className="flex flex-wrap gap-1.5">
										{(mentor.expertise ?? []).map((exp) => (
											<Badge key={exp} variant="secondary">
												{exp}
											</Badge>
										))}
									</div>
								</div>
								<div>
									<h3 className="mb-2 font-semibold">
										<Trans>Skills</Trans>
									</h3>
									<div className="flex flex-wrap gap-1.5">
										{(mentor.skills ?? []).map((skill) => (
											<Badge key={skill.name} variant="outline" className={expertiseLevelConfig[skill.level].color}>
												{skill.name}
											</Badge>
										))}
									</div>
								</div>
							</div>

							{/* Career Path */}
							<div>
								<h3 className="mb-2 font-semibold">
									<Trans>Career Path</Trans>
								</h3>
								<div className="flex flex-wrap items-center gap-2">
									{(mentor.careerPath ?? []).map((role, index) => (
										<div key={role} className="flex items-center gap-2">
											<Badge variant="outline">{role}</Badge>
											{index < (mentor.careerPath ?? []).length - 1 && (
												<ArrowRightIcon className="size-4 text-muted-foreground" />
											)}
										</div>
									))}
								</div>
							</div>

							{/* Achievements */}
							{(mentor.achievements ?? []).length > 0 && (
								<div>
									<h3 className="mb-2 font-semibold">
										<Trans>Achievements</Trans>
									</h3>
									<ul className="space-y-1 text-sm">
										{(mentor.achievements ?? []).map((achievement, index) => (
											<li key={index} className="flex items-start gap-2">
												<CheckCircleIcon className="mt-0.5 size-4 shrink-0 text-green-500" />
												<span>{achievement}</span>
											</li>
										))}
									</ul>
								</div>
							)}

							{/* Availability */}
							<div>
								<h3 className="mb-2 font-semibold">
									<Trans>Availability</Trans>
								</h3>
								<div className="grid grid-cols-7 gap-2">
									{daysOfWeek.map((day) => {
										const slots = (mentor.availability ?? []).filter((a) => a.day === day);
										return (
											<div key={day} className="text-center">
												<p className="mb-1 font-medium text-xs capitalize">{day.slice(0, 3)}</p>
												{slots.length > 0 ? (
													slots.map((slot, index) => (
														<Badge key={index} variant="secondary" className="mb-1 block text-xs">
															{slot.startTime}
														</Badge>
													))
												) : (
													<span className="text-muted-foreground text-xs">-</span>
												)}
											</div>
										);
									})}
								</div>
							</div>

							{/* Reviews */}
							{mentorReviews.length > 0 && (
								<div>
									<h3 className="mb-2 font-semibold">
										<Trans>Recent Reviews</Trans>
									</h3>
									<div className="space-y-3">
										{mentorReviews.slice(0, 3).map((review) => (
											<Card key={review.id}>
												<CardContent className="p-4">
													<div className="flex items-start gap-3">
														<Avatar size="sm">
															{review.menteeAvatar ? (
																<AvatarImage src={review.menteeAvatar} alt={review.menteeName} />
															) : null}
															<AvatarFallback>{review.menteeName.charAt(0)}</AvatarFallback>
														</Avatar>
														<div className="flex-1">
															<div className="flex items-center gap-2">
																<span className="font-medium text-sm">{review.menteeName}</span>
																<StarRating rating={review.rating} size="size-3" />
															</div>
															<p className="mt-1 text-muted-foreground text-sm">{review.comment}</p>
															<p className="mt-1 text-muted-foreground text-xs">
																{formatDate(review.createdAt, { day: "numeric", month: "short", year: "numeric" })}
															</p>
														</div>
													</div>
												</CardContent>
											</Card>
										))}
									</div>
								</div>
							)}

							{/* Pricing */}
							<div className="flex items-center justify-between rounded-lg bg-muted/50 p-4">
								<div>
									<p className="font-semibold">
										{mentor.isFree ? <Trans>Free Mentorship</Trans> : <Trans>${mentor.hourlyRate}/hour</Trans>}
									</p>
									<p className="text-muted-foreground text-sm">
										{mentor.isFree ? <Trans>This mentor offers free sessions</Trans> : <Trans>Per session rate</Trans>}
									</p>
								</div>
								{mentor.linkedinUrl && (
									<Button variant="outline" asChild>
										<a href={mentor.linkedinUrl} target="_blank" rel="noopener noreferrer">
											<LinkedinLogoIcon className="mr-2 size-4" />
											<Trans>LinkedIn</Trans>
										</a>
									</Button>
								)}
							</div>
						</div>

						<DialogFooter>
							<DialogClose asChild>
								<Button variant="outline">
									<Trans>Close</Trans>
								</Button>
							</DialogClose>
							<Button onClick={() => onRequestMentorship(mentor)} disabled={mentor.status === "on_vacation"}>
								<UserPlusIcon className="mr-2 size-4" />
								<Trans>Request Mentorship</Trans>
							</Button>
						</DialogFooter>
					</>
				)}
			</DialogContent>
		</Dialog>
	);
}

// ========================
// RequestMentorshipDialog
// ========================

interface RequestMentorshipDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	mentor: MentorData | null;
	requestMessage: string;
	onRequestMessageChange: (value: string) => void;
	requestGoals: string[];
	onAddGoal: () => void;
	onUpdateGoal: (index: number, value: string) => void;
	onRemoveGoal: (index: number) => void;
	onSubmit: () => void;
	isSubmitting: boolean;
}

export function RequestMentorshipDialog({
	open,
	onOpenChange,
	mentor,
	requestMessage,
	onRequestMessageChange,
	requestGoals,
	onAddGoal,
	onUpdateGoal,
	onRemoveGoal,
	onSubmit,
	isSubmitting,
}: RequestMentorshipDialogProps) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>
						<Trans>Request Mentorship</Trans>
					</DialogTitle>
					<DialogDescription>
						{mentor && (
							<Trans>
								Send a request to {mentor.firstName} {mentor.lastName}
							</Trans>
						)}
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-4 py-4">
					<div className="space-y-2">
						<Label htmlFor="request-message">
							<Trans>Introduction Message</Trans>
						</Label>
						<Textarea
							id="request-message"
							placeholder={t`Introduce yourself and explain why you'd like this mentor...`}
							value={requestMessage}
							onChange={(e) => onRequestMessageChange(e.target.value)}
							className="min-h-[120px]"
						/>
					</div>

					<div className="space-y-2">
						<Label>
							<Trans>Your Goals</Trans>
						</Label>
						<div className="space-y-2">
							{requestGoals.map((goal, index) => (
								<div key={index} className="flex items-center gap-2">
									<Input
										placeholder={t`e.g., Transition to management`}
										value={goal}
										onChange={(e) => onUpdateGoal(index, e.target.value)}
									/>
									{requestGoals.length > 1 && (
										<Button variant="ghost" size="icon" onClick={() => onRemoveGoal(index)}>
											<TrashIcon className="size-4" />
										</Button>
									)}
								</div>
							))}
							<Button variant="outline" size="sm" onClick={onAddGoal}>
								<PlusIcon className="mr-2 size-4" />
								<Trans>Add Goal</Trans>
							</Button>
						</div>
					</div>
				</div>

				<DialogFooter>
					<DialogClose asChild>
						<Button variant="outline">
							<Trans>Cancel</Trans>
						</Button>
					</DialogClose>
					<Button onClick={onSubmit} disabled={!requestMessage.trim() || isSubmitting}>
						<EnvelopeIcon className="mr-2 size-4" />
						<Trans>Send Request</Trans>
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

// ========================
// BookSessionDialog
// ========================

interface BookSessionDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	mentor: MentorData | null;
	bookingDate: string;
	onBookingDateChange: (value: string) => void;
	bookingTime: string;
	onBookingTimeChange: (value: string) => void;
	bookingType: SessionType;
	onBookingTypeChange: (value: SessionType) => void;
	bookingDuration: string;
	onBookingDurationChange: (value: string) => void;
	bookingTopic: string;
	onBookingTopicChange: (value: string) => void;
	onSubmit: () => void;
	isSubmitting: boolean;
}

export function BookSessionDialog({
	open,
	onOpenChange,
	mentor,
	bookingDate,
	onBookingDateChange,
	bookingTime,
	onBookingTimeChange,
	bookingType,
	onBookingTypeChange,
	bookingDuration,
	onBookingDurationChange,
	bookingTopic,
	onBookingTopicChange,
	onSubmit,
	isSubmitting,
}: BookSessionDialogProps) {
	const sessionTypeConfig = getSessionTypeConfig();

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>
						<Trans>Book a Session</Trans>
					</DialogTitle>
					<DialogDescription>
						{mentor && (
							<Trans>
								Schedule a session with {mentor.firstName} {mentor.lastName}
							</Trans>
						)}
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-4 py-4">
					<div className="grid gap-4 md:grid-cols-2">
						<div className="space-y-2">
							<Label htmlFor="booking-date">
								<Trans>Date</Trans>
							</Label>
							<Input
								id="booking-date"
								type="date"
								value={bookingDate}
								onChange={(e) => onBookingDateChange(e.target.value)}
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="booking-time">
								<Trans>Time</Trans>
							</Label>
							<Input
								id="booking-time"
								type="time"
								value={bookingTime}
								onChange={(e) => onBookingTimeChange(e.target.value)}
							/>
						</div>
					</div>

					<div className="grid gap-4 md:grid-cols-2">
						<div className="space-y-2">
							<Label htmlFor="booking-type">
								<Trans>Session Type</Trans>
							</Label>
							<Select value={bookingType} onValueChange={(v) => onBookingTypeChange(v as SessionType)}>
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									{Object.entries(sessionTypeConfig).map(([key, config]) => {
										const TypeIcon = config.icon;
										return (
											<SelectItem key={key} value={key}>
												<div className="flex items-center gap-2">
													<TypeIcon className="size-4" />
													{config.label}
												</div>
											</SelectItem>
										);
									})}
								</SelectContent>
							</Select>
						</div>
						<div className="space-y-2">
							<Label htmlFor="booking-duration">
								<Trans>Duration</Trans>
							</Label>
							<Select value={bookingDuration} onValueChange={onBookingDurationChange}>
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="30">
										<Trans>30 minutes</Trans>
									</SelectItem>
									<SelectItem value="45">
										<Trans>45 minutes</Trans>
									</SelectItem>
									<SelectItem value="60">
										<Trans>60 minutes</Trans>
									</SelectItem>
									<SelectItem value="90">
										<Trans>90 minutes</Trans>
									</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</div>

					<div className="space-y-2">
						<Label htmlFor="booking-topic">
							<Trans>Session Topic</Trans>
						</Label>
						<Input
							id="booking-topic"
							placeholder={t`What would you like to discuss?`}
							value={bookingTopic}
							onChange={(e) => onBookingTopicChange(e.target.value)}
						/>
					</div>

					{mentor && (mentor.availability ?? []).length > 0 && (
						<div className="rounded-lg bg-muted/50 p-4">
							<Label className="text-muted-foreground text-xs">
								<Trans>Mentor&apos;s Availability</Trans>
							</Label>
							<div className="mt-2 flex flex-wrap gap-2">
								{(mentor.availability ?? []).map((slot, index) => (
									<Badge key={index} variant="outline" className="text-xs">
										{slot.day.charAt(0).toUpperCase() + slot.day.slice(1)} {slot.startTime}-{slot.endTime}
									</Badge>
								))}
							</div>
						</div>
					)}
				</div>

				<DialogFooter>
					<DialogClose asChild>
						<Button variant="outline">
							<Trans>Cancel</Trans>
						</Button>
					</DialogClose>
					<Button onClick={onSubmit} disabled={!bookingDate || !bookingTime || !bookingTopic.trim() || isSubmitting}>
						<CalendarIcon className="mr-2 size-4" />
						<Trans>Book Session</Trans>
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

// ========================
// AddGoalDialog
// ========================

interface AddGoalDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	title: string;
	onTitleChange: (value: string) => void;
	description: string;
	onDescriptionChange: (value: string) => void;
	targetDate: string;
	onTargetDateChange: (value: string) => void;
	onSubmit: () => void;
	isSubmitting: boolean;
}

export function AddGoalDialog({
	open,
	onOpenChange,
	title,
	onTitleChange,
	description,
	onDescriptionChange,
	targetDate,
	onTargetDateChange,
	onSubmit,
	isSubmitting,
}: AddGoalDialogProps) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>
						<Trans>Add New Goal</Trans>
					</DialogTitle>
					<DialogDescription>
						<Trans>Set a new goal to track with your mentor</Trans>
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-4 py-4">
					<div className="space-y-2">
						<Label htmlFor="goal-title">
							<Trans>Goal Title</Trans>
						</Label>
						<Input
							id="goal-title"
							placeholder={t`e.g., Complete Leadership Training`}
							value={title}
							onChange={(e) => onTitleChange(e.target.value)}
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="goal-description">
							<Trans>Description</Trans>
						</Label>
						<Textarea
							id="goal-description"
							placeholder={t`Describe your goal in detail...`}
							value={description}
							onChange={(e) => onDescriptionChange(e.target.value)}
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="goal-target-date">
							<Trans>Target Date</Trans>
						</Label>
						<Input
							id="goal-target-date"
							type="date"
							value={targetDate}
							onChange={(e) => onTargetDateChange(e.target.value)}
						/>
					</div>
				</div>

				<DialogFooter>
					<DialogClose asChild>
						<Button variant="outline">
							<Trans>Cancel</Trans>
						</Button>
					</DialogClose>
					<Button onClick={onSubmit} disabled={!title.trim() || !targetDate || isSubmitting}>
						<PlusIcon className="mr-2 size-4" />
						<Trans>Add Goal</Trans>
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

// ========================
// SessionNotesDialog
// ========================

interface SessionNotesDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	session: SessionData | null;
	notes: string;
	onNotesChange: (value: string) => void;
	rating: number;
	onRatingChange: (value: number) => void;
	feedback: string;
	onFeedbackChange: (value: string) => void;
	onSave: () => void;
}

export function SessionNotesDialog({
	open,
	onOpenChange,
	session,
	notes,
	onNotesChange,
	rating,
	onRatingChange,
	feedback,
	onFeedbackChange,
	onSave,
}: SessionNotesDialogProps) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>
						<Trans>Session Notes</Trans>
					</DialogTitle>
					<DialogDescription>{session && <span>{session.topic}</span>}</DialogDescription>
				</DialogHeader>

				<div className="space-y-4 py-4">
					<div className="space-y-2">
						<Label htmlFor="session-notes">
							<Trans>Notes</Trans>
						</Label>
						<Textarea
							id="session-notes"
							placeholder={t`Add your notes from this session...`}
							value={notes}
							onChange={(e) => onNotesChange(e.target.value)}
							className="min-h-[150px]"
						/>
					</div>

					{session?.status === "completed" && (
						<>
							<div className="space-y-2">
								<Label>
									<Trans>Rating</Trans>
								</Label>
								<div className="flex items-center gap-1">
									{[1, 2, 3, 4, 5].map((star) => (
										<button
											key={star}
											type="button"
											onClick={() => onRatingChange(star)}
											className="rounded p-1 transition-colors hover:bg-muted"
										>
											<StarIcon
												weight={star <= rating ? "fill" : "regular"}
												className={cn("size-6", star <= rating ? "text-amber-500" : "text-muted-foreground/30")}
											/>
										</button>
									))}
								</div>
							</div>

							<div className="space-y-2">
								<Label htmlFor="session-feedback">
									<Trans>Feedback</Trans>
								</Label>
								<Textarea
									id="session-feedback"
									placeholder={t`Share your feedback about this session...`}
									value={feedback}
									onChange={(e) => onFeedbackChange(e.target.value)}
								/>
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
					<Button onClick={onSave}>
						<CheckCircleIcon className="mr-2 size-4" />
						<Trans>Save</Trans>
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

// ========================
// EditProfileDialog
// ========================

interface EditProfileDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	targetRole: string;
	onTargetRoleChange: (value: string) => void;
	skills: string;
	onSkillsChange: (value: string) => void;
	industries: string;
	onIndustriesChange: (value: string) => void;
	timeline: string;
	onTimelineChange: (value: string) => void;
	onSave: () => void;
}

export function EditProfileDialog({
	open,
	onOpenChange,
	targetRole,
	onTargetRoleChange,
	skills,
	onSkillsChange,
	industries,
	onIndustriesChange,
	timeline,
	onTimelineChange,
	onSave,
}: EditProfileDialogProps) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>
						<Trans>Edit Matching Preferences</Trans>
					</DialogTitle>
					<DialogDescription>
						<Trans>Update your career goals to get better mentor recommendations</Trans>
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-4 py-4">
					<div className="space-y-2">
						<Label htmlFor="profile-target-role">
							<Trans>Target Role</Trans>
						</Label>
						<Input
							id="profile-target-role"
							placeholder={t`e.g., Engineering Manager`}
							value={targetRole}
							onChange={(e) => onTargetRoleChange(e.target.value)}
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="profile-skills">
							<Trans>Key Skills (comma-separated)</Trans>
						</Label>
						<Input
							id="profile-skills"
							placeholder={t`e.g., Leadership, System Design, Python`}
							value={skills}
							onChange={(e) => onSkillsChange(e.target.value)}
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="profile-industries">
							<Trans>Target Industries (comma-separated)</Trans>
						</Label>
						<Input
							id="profile-industries"
							placeholder={t`e.g., Technology, FinTech`}
							value={industries}
							onChange={(e) => onIndustriesChange(e.target.value)}
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="profile-timeline">
							<Trans>Timeline</Trans>
						</Label>
						<Select value={timeline} onValueChange={onTimelineChange}>
							<SelectTrigger>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="3 months">
									<Trans>3 months</Trans>
								</SelectItem>
								<SelectItem value="6 months">
									<Trans>6 months</Trans>
								</SelectItem>
								<SelectItem value="1 year">
									<Trans>1 year</Trans>
								</SelectItem>
								<SelectItem value="2+ years">
									<Trans>2+ years</Trans>
								</SelectItem>
							</SelectContent>
						</Select>
					</div>
				</div>

				<DialogFooter>
					<DialogClose asChild>
						<Button variant="outline">
							<Trans>Cancel</Trans>
						</Button>
					</DialogClose>
					<Button onClick={onSave}>
						<CheckCircleIcon className="mr-2 size-4" />
						<Trans>Save Preferences</Trans>
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

// ========================
// ComposeMessageDialog
// ========================

interface ComposeMessageDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	recipientId: string;
	onRecipientIdChange: (value: string) => void;
	subject: string;
	onSubjectChange: (value: string) => void;
	message: string;
	onMessageChange: (value: string) => void;
	onSend: () => void;
	isSending: boolean;
	mentors: Array<{
		id: string;
		userId: string;
		firstName: string;
		lastName: string;
		title: string;
	}>;
}

export function ComposeMessageDialog({
	open,
	onOpenChange,
	recipientId,
	onRecipientIdChange,
	subject,
	onSubjectChange,
	message,
	onMessageChange,
	onSend,
	isSending,
	mentors,
}: ComposeMessageDialogProps) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>
						<Trans>New Message</Trans>
					</DialogTitle>
					<DialogDescription>
						<Trans>Send a message to a mentor or connection</Trans>
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-4 py-4">
					<div className="space-y-2">
						<Label htmlFor="compose-recipient">
							<Trans>Recipient</Trans>
						</Label>
						<Select value={recipientId} onValueChange={onRecipientIdChange}>
							<SelectTrigger>
								<SelectValue placeholder={t`Select a mentor...`} />
							</SelectTrigger>
							<SelectContent>
								{mentors.map((mentor) => (
									<SelectItem key={mentor.id} value={mentor.userId}>
										<div className="flex items-center gap-2">
											<span>
												{mentor.firstName} {mentor.lastName}
											</span>
											<span className="text-muted-foreground text-xs">({mentor.title})</span>
										</div>
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					<div className="space-y-2">
						<Label htmlFor="compose-subject">
							<Trans>Subject (Optional)</Trans>
						</Label>
						<Input
							id="compose-subject"
							placeholder={t`e.g., Question about career advice`}
							value={subject}
							onChange={(e) => onSubjectChange(e.target.value)}
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="compose-message">
							<Trans>Message</Trans>
						</Label>
						<Textarea
							id="compose-message"
							placeholder={t`Write your message here...`}
							value={message}
							onChange={(e) => onMessageChange(e.target.value)}
							className="min-h-[150px]"
						/>
					</div>
				</div>

				<DialogFooter>
					<DialogClose asChild>
						<Button variant="outline">
							<Trans>Cancel</Trans>
						</Button>
					</DialogClose>
					<Button onClick={onSend} disabled={!recipientId || !message.trim() || isSending}>
						<PaperPlaneRightIcon className="mr-2 size-4" />
						<Trans>Send Message</Trans>
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
