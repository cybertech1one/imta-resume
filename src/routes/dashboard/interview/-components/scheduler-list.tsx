import { Trans } from "@lingui/react/macro";
import { CalendarIcon, PlusIcon } from "@phosphor-icons/react";
import { AnimatePresence, motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { TabsContent } from "@/components/ui/tabs";
import type { Interview, InterviewStatus, InterviewType } from "./scheduler-types";

// ==================== LIST VIEW ====================

interface ListViewProps {
	filteredInterviews: Interview[];
	searchQuery: string;
	statusFilter: InterviewStatus | "all";
	typeFilter: InterviewType | "all";
	onCreateInterview: () => void;
	renderInterviewCard: (interview: Interview) => React.ReactNode;
}

export function ListView({
	filteredInterviews,
	searchQuery,
	statusFilter,
	typeFilter,
	onCreateInterview,
	renderInterviewCard,
}: ListViewProps) {
	return (
		<TabsContent value="list" className="mt-0">
			<AnimatePresence mode="popLayout">
				{filteredInterviews.length > 0 ? (
					<div className="space-y-4">
						{filteredInterviews.map((interview, index) => (
							<motion.div
								key={interview.id}
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								exit={{ opacity: 0, scale: 0.95 }}
								transition={{ delay: index * 0.05 }}
							>
								{renderInterviewCard(interview)}
							</motion.div>
						))}
					</div>
				) : (
					<Card className="border-dashed">
						<CardContent className="flex flex-col items-center justify-center py-16">
							<CalendarIcon className="mb-4 size-16 text-muted-foreground/50" weight="duotone" />
							<h3 className="mb-2 font-semibold text-lg">
								<Trans>No interviews found</Trans>
							</h3>
							<p className="mb-4 text-center text-muted-foreground">
								{searchQuery || statusFilter !== "all" || typeFilter !== "all" ? (
									<Trans>Try changing your filters</Trans>
								) : (
									<Trans>Start scheduling your interviews</Trans>
								)}
							</p>
							{!searchQuery && statusFilter === "all" && typeFilter === "all" && (
								<Button onClick={onCreateInterview}>
									<PlusIcon className="mr-2 size-4" />
									<Trans>Schedule an interview</Trans>
								</Button>
							)}
						</CardContent>
					</Card>
				)}
			</AnimatePresence>
		</TabsContent>
	);
}
