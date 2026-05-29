import { Trans } from "@lingui/react/macro";
import {
	CalendarIcon,
	CheckCircleIcon,
	ClockIcon,
	CopyIcon,
	DotsThreeIcon,
	PencilSimpleIcon,
	TrashIcon,
	TrophyIcon,
	XCircleIcon,
} from "@phosphor-icons/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/utils/style";
import { INTERVIEW_OUTCOMES, INTERVIEW_STATUS, INTERVIEW_TYPES } from "./scheduler-config";
import type { Interview, InterviewOutcome, InterviewStatus, InterviewType } from "./scheduler-types";
import { formatDate, formatTime, getTimeUntilInterview } from "./scheduler-utils";

// ==================== INTERVIEW CARD ====================

interface InterviewCardProps {
	interview: Interview;
	compact?: boolean;
	onOpenDetail: (interview: Interview) => void;
	onOpenEdit: (interview: Interview) => void;
	onCopyMeetingLink: (link: string) => void;
	onUpdateOutcome: (interviewId: string, outcome: InterviewOutcome) => void;
	onRequestDelete: (interview: Interview) => void;
}

export function InterviewCard({
	interview,
	compact = false,
	onOpenDetail,
	onOpenEdit,
	onCopyMeetingLink,
	onUpdateOutcome,
	onRequestDelete,
}: InterviewCardProps) {
	const interviewType = interview.type as InterviewType;
	const interviewStatus = interview.status as InterviewStatus;
	const interviewOutcome = interview.outcome as InterviewOutcome;
	const typeConfig = INTERVIEW_TYPES[interviewType] || INTERVIEW_TYPES.video;
	const TypeIcon = typeConfig.icon;
	const statusConfig = INTERVIEW_STATUS[interviewStatus] || INTERVIEW_STATUS.scheduled;
	const outcomeConfig = INTERVIEW_OUTCOMES[interviewOutcome] || INTERVIEW_OUTCOMES.pending;
	const OutcomeIcon = outcomeConfig.icon;

	return (
		<Card
			key={interview.id}
			className={cn(
				"group cursor-pointer transition-all duration-300 hover:shadow-lg",
				compact ? "p-3" : "",
				interview.status === "cancelled" && "opacity-60",
			)}
			onClick={() => onOpenDetail(interview)}
		>
			<CardContent className={cn(compact ? "p-0" : "p-4")}>
				<div className="flex items-start justify-between gap-3">
					<div className="flex-1 space-y-2">
						<div className="flex flex-wrap items-center gap-2">
							<div className={cn("flex size-8 items-center justify-center rounded-lg", typeConfig.bgColor)}>
								<TypeIcon className={cn("size-4", typeConfig.color)} weight="duotone" />
							</div>
							<div>
								<h4 className="font-semibold">{interview.company}</h4>
								<p className="text-muted-foreground text-sm">{interview.role}</p>
							</div>
						</div>

						<div className="flex flex-wrap items-center gap-3 text-muted-foreground text-sm">
							<span className="flex items-center gap-1">
								<CalendarIcon className="size-4" />
								{formatDate(interview.date, { day: "numeric", month: "short" })}
							</span>
							<span className="flex items-center gap-1">
								<ClockIcon className="size-4" />
								{formatTime(interview.startTime)} - {formatTime(interview.endTime)}
							</span>
							{interview.round > 1 && (
								<Badge variant="outline" className="text-xs">
									Tour {interview.round}
								</Badge>
							)}
						</div>

						{!compact && (
							<div className="flex flex-wrap items-center gap-2">
								<Badge className={cn(statusConfig.bgColor, statusConfig.color, "text-xs")}>{statusConfig.label}</Badge>
								{interview.status === "completed" && (
									<Badge className={cn(outcomeConfig.bgColor, outcomeConfig.color, "gap-1 text-xs")}>
										<OutcomeIcon className="size-3" />
										{outcomeConfig.label}
									</Badge>
								)}
							</div>
						)}

						{!compact && interview.status === "scheduled" && (
							<p className="font-medium text-primary text-sm">
								{getTimeUntilInterview(interview.date, interview.startTime)}
							</p>
						)}
					</div>

					<DropdownMenu>
						<DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
							<Button variant="ghost" size="icon" className="size-8 opacity-0 group-hover:opacity-100">
								<DotsThreeIcon className="size-5" />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							<DropdownMenuItem
								onClick={(e) => {
									e.stopPropagation();
									onOpenEdit(interview);
								}}
							>
								<PencilSimpleIcon className="mr-2 size-4" />
								<Trans>Edit</Trans>
							</DropdownMenuItem>
							{interview.meetingLink && (
								<DropdownMenuItem
									onClick={(e) => {
										e.stopPropagation();
										onCopyMeetingLink(interview.meetingLink || "");
									}}
								>
									<CopyIcon className="mr-2 size-4" />
									<Trans>Copy link</Trans>
								</DropdownMenuItem>
							)}
							<DropdownMenuSeparator />
							{interview.status === "completed" && (
								<>
									<DropdownMenuItem
										onClick={(e) => {
											e.stopPropagation();
											onUpdateOutcome(interview.id, "passed");
										}}
									>
										<CheckCircleIcon className="mr-2 size-4 text-green-600" />
										<Trans>Mark as passed</Trans>
									</DropdownMenuItem>
									<DropdownMenuItem
										onClick={(e) => {
											e.stopPropagation();
											onUpdateOutcome(interview.id, "failed");
										}}
									>
										<XCircleIcon className="mr-2 size-4 text-red-600" />
										<Trans>Mark as failed</Trans>
									</DropdownMenuItem>
									<DropdownMenuItem
										onClick={(e) => {
											e.stopPropagation();
											onUpdateOutcome(interview.id, "offer_received");
										}}
									>
										<TrophyIcon className="mr-2 size-4 text-purple-600" />
										<Trans>Offer received</Trans>
									</DropdownMenuItem>
									<DropdownMenuSeparator />
								</>
							)}
							<DropdownMenuItem
								className="text-destructive"
								onClick={(e) => {
									e.stopPropagation();
									onRequestDelete(interview);
								}}
							>
								<TrashIcon className="mr-2 size-4" />
								<Trans>Delete</Trans>
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</CardContent>
		</Card>
	);
}
