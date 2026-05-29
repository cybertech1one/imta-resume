import { Trans } from "@lingui/react/macro";
import { ArrowLeftIcon, BellIcon, ClockIcon, PlusIcon, StarIcon } from "@phosphor-icons/react";
import { Link } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/utils/style";
import type { Interview } from "./scheduler-types";

// ==================== QUICK ACTIONS CARD ====================

interface QuickActionsCardProps {
	onCreateInterview: () => void;
	onManageAvailability: () => void;
}

export function QuickActionsCard({ onCreateInterview, onManageAvailability }: QuickActionsCardProps) {
	return (
		<Card className="lg:col-span-2">
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<PlusIcon className="size-5 text-primary" />
					<Trans>Quick actions</Trans>
				</CardTitle>
			</CardHeader>
			<CardContent className="flex flex-wrap gap-3">
				<Button className="gap-2" onClick={onCreateInterview}>
					<PlusIcon className="size-4" />
					<Trans>New interview</Trans>
				</Button>
				<Button variant="outline" className="gap-2" onClick={onManageAvailability}>
					<ClockIcon className="size-4" />
					<Trans>Manage availability</Trans>
				</Button>
				<Link to="/dashboard/interview">
					<Button variant="outline" className="gap-2">
						<ArrowLeftIcon className="size-4" />
						<Trans>Interview Hub</Trans>
					</Button>
				</Link>
			</CardContent>
		</Card>
	);
}

// ==================== PENDING REMINDERS CARD ====================

interface PendingRemindersCardProps {
	pendingReminders: Array<{
		id: string;
		type: string;
		message: string;
		interviewTitle?: string;
	}>;
}

export function PendingRemindersCard({ pendingReminders }: PendingRemindersCardProps) {
	return (
		<Card>
			<CardHeader className="pb-3">
				<CardTitle className="flex items-center gap-2 text-base">
					<BellIcon className="size-5 text-amber-500" weight="fill" />
					<Trans>Reminders</Trans>
					{pendingReminders.length > 0 && (
						<Badge variant="secondary" className="ml-auto">
							{pendingReminders.length}
						</Badge>
					)}
				</CardTitle>
			</CardHeader>
			<CardContent>
				{pendingReminders.length > 0 ? (
					<ScrollArea className="h-32">
						<div className="space-y-2">
							{pendingReminders.slice(0, 3).map((reminder) => (
								<div key={reminder.id} className="flex items-start gap-2 rounded-lg bg-muted/50 p-2 text-sm">
									<Badge
										variant="outline"
										className={cn(
											"shrink-0 text-xs",
											reminder.type === "preparation"
												? "border-blue-500/50 text-blue-600"
												: "border-green-500/50 text-green-600",
										)}
									>
										{reminder.type === "preparation" ? "Prep" : "Follow-up"}
									</Badge>
									<div className="min-w-0 flex-1">
										<p className="truncate font-medium">{reminder.message}</p>
										<p className="text-muted-foreground text-xs">{reminder.interviewTitle}</p>
									</div>
								</div>
							))}
						</div>
					</ScrollArea>
				) : (
					<p className="text-center text-muted-foreground text-sm">
						<Trans>No pending reminders</Trans>
					</p>
				)}
			</CardContent>
		</Card>
	);
}

// ==================== UPCOMING INTERVIEWS SECTION ====================

interface UpcomingInterviewsSectionProps {
	upcomingInterviews: Interview[];
	activeTab: string;
	renderInterviewCard: (interview: Interview, compact: boolean) => React.ReactNode;
}

export function UpcomingInterviewsSection({
	upcomingInterviews,
	activeTab,
	renderInterviewCard,
}: UpcomingInterviewsSectionProps) {
	if (upcomingInterviews.length === 0 || activeTab === "list") return null;

	return (
		<section className="mt-8">
			<h3 className="mb-4 flex items-center gap-2 font-semibold text-xl">
				<StarIcon className="size-5 text-amber-500" weight="fill" />
				<Trans>Upcoming interviews</Trans>
			</h3>
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
				{upcomingInterviews.map((interview) => renderInterviewCard(interview, true))}
			</div>
		</section>
	);
}
