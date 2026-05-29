import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import {
	CalendarIcon,
	ChatCircleDotsIcon,
	EnvelopeIcon,
	HandshakeIcon,
	LightbulbIcon,
	MagnifyingGlassIcon,
	TargetIcon,
} from "@phosphor-icons/react";
import { createFileRoute } from "@tanstack/react-router";
import { ErrorComponent } from "@/components/error-component";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DashboardHeader } from "../-components/header";
import {
	AddGoalDialog,
	BookSessionDialog,
	ComposeMessageDialog,
	EditProfileDialog,
	MentorDetailDialog,
	RequestMentorshipDialog,
	SessionNotesDialog,
} from "./-components/mentors-components";
import { useMentorMatchingState } from "./-components/mentors-hooks";
import {
	DiscoverTabContent,
	GoalsTabContent,
	MessagesTabContent,
	QuickStats,
	RecommendedTabContent,
	RequestsTabContent,
	SessionsTabContent,
} from "./-components/mentors-tabs";

// biome-ignore lint/suspicious/noExplicitAny: Route path not in generated route tree
export const Route = createFileRoute("/dashboard/networking/mentors" as any)({
	component: MentorMatchingPage,
	errorComponent: ErrorComponent,
});

function MentorMatchingPage() {
	const state = useMentorMatchingState();

	return (
		<div className="space-y-6">
			<DashboardHeader icon={HandshakeIcon} title={t`Mentor Matching`} />

			<QuickStats
				statistics={state.statistics}
				mentorsCount={state.mentors.length}
				pastSessionsCount={state.pastSessions.length}
				upcomingSessionsCount={state.upcomingSessions.length}
				activeGoalsCount={state.goals.filter((g) => g.status === "in_progress").length}
			/>

			<Tabs value={state.activeTab} onValueChange={state.setActiveTab}>
				<TabsList className="mb-4">
					<TabsTrigger value="discover">
						<MagnifyingGlassIcon className="mr-2 size-4" />
						<Trans>Discover Mentors</Trans>
					</TabsTrigger>
					<TabsTrigger value="recommended">
						<LightbulbIcon className="mr-2 size-4" />
						<Trans>Recommended</Trans>
					</TabsTrigger>
					<TabsTrigger value="sessions">
						<CalendarIcon className="mr-2 size-4" />
						<Trans>Sessions</Trans>
					</TabsTrigger>
					<TabsTrigger value="goals">
						<TargetIcon className="mr-2 size-4" />
						<Trans>Goals</Trans>
					</TabsTrigger>
					<TabsTrigger value="requests">
						<EnvelopeIcon className="mr-2 size-4" />
						<Trans>Requests</Trans>
					</TabsTrigger>
					<TabsTrigger value="messages" className="relative">
						<ChatCircleDotsIcon className="mr-2 size-4" />
						<Trans>Messages</Trans>
						{state.unreadCount > 0 && (
							<Badge variant="destructive" className="ml-2 size-5 justify-center rounded-full p-0 text-xs">
								{state.unreadCount > 9 ? "9+" : state.unreadCount}
							</Badge>
						)}
					</TabsTrigger>
				</TabsList>

				<TabsContent value="discover">
					<DiscoverTabContent
						searchQuery={state.searchQuery}
						onSearchQueryChange={state.setSearchQuery}
						expertiseFilter={state.expertiseFilter}
						onExpertiseFilterChange={state.setExpertiseFilter}
						industryFilter={state.industryFilter}
						onIndustryFilterChange={state.setIndustryFilter}
						availabilityFilter={state.availabilityFilter}
						onAvailabilityFilterChange={state.setAvailabilityFilter}
						allExpertise={state.allExpertise}
						allIndustries={state.allIndustries}
						filteredMentors={state.filteredMentors}
						onViewMentor={state.handleViewMentor}
						onRequestMentorship={state.handleRequestMentorship}
						onEditProfile={() => state.setShowProfileDialog(true)}
					/>
				</TabsContent>

				<TabsContent value="recommended">
					<RecommendedTabContent
						userGoals={state.userGoals}
						recommendedMentors={state.recommendedMentors}
						onViewMentor={state.handleViewMentor}
						onRequestMentorship={state.handleRequestMentorship}
						onEditProfile={() => state.setShowProfileDialog(true)}
					/>
				</TabsContent>

				<TabsContent value="sessions">
					<SessionsTabContent
						activeMentorship={state.activeMentorship}
						mentors={state.mentors}
						upcomingSessions={state.upcomingSessions}
						pastSessions={state.pastSessions}
						onBookSession={state.handleBookSession}
						onViewSessionNotes={state.handleViewSessionNotes}
					/>
				</TabsContent>

				<TabsContent value="goals">
					<GoalsTabContent
						goals={state.goals}
						onShowGoalDialog={() => state.setShowGoalDialog(true)}
						onToggleMilestone={state.handleToggleMilestone}
					/>
				</TabsContent>

				<TabsContent value="requests">
					<RequestsTabContent
						requests={state.requests}
						mentors={state.mentors}
						onBookSession={state.handleBookSession}
						onSetActiveTab={state.setActiveTab}
					/>
				</TabsContent>

				<TabsContent value="messages">
					<MessagesTabContent
						conversations={state.conversations}
						conversationMessages={state.conversationMessages}
						selectedConversation={state.selectedConversation}
						onSelectConversation={state.handleSelectConversation}
						onClearConversation={() => state.setSelectedConversation(null)}
						isLoadingConversations={state.isLoadingConversations}
						isLoadingMessages={state.isLoadingMessages}
						unreadCount={state.unreadCount}
						replyMessage={state.replyMessage}
						onReplyMessageChange={state.setReplyMessage}
						onSendReply={state.handleSendReply}
						isSendingMessage={state.isSendingMessage}
						onShowComposeDialog={() => state.setShowComposeDialog(true)}
						activeMentorship={state.activeMentorship}
						mentors={state.mentors}
						onStartConversationWithMentor={state.handleStartConversationWithMentor}
						onBookSession={state.handleBookSession}
					/>
				</TabsContent>
			</Tabs>

			<MentorDetailDialog
				open={state.showMentorDialog}
				onOpenChange={state.setShowMentorDialog}
				mentor={state.selectedMentor}
				mentorReviews={state.mentorReviews}
				onRequestMentorship={state.handleRequestMentorship}
			/>

			<RequestMentorshipDialog
				open={state.showRequestDialog}
				onOpenChange={state.setShowRequestDialog}
				mentor={state.selectedMentor}
				requestMessage={state.requestMessage}
				onRequestMessageChange={state.setRequestMessage}
				requestGoals={state.requestGoals}
				onAddGoal={state.handleAddRequestGoal}
				onUpdateGoal={state.handleUpdateRequestGoal}
				onRemoveGoal={state.handleRemoveRequestGoal}
				onSubmit={state.handleSubmitRequest}
				isSubmitting={state.isCreatingRequest}
			/>

			<BookSessionDialog
				open={state.showBookingDialog}
				onOpenChange={state.setShowBookingDialog}
				mentor={state.selectedMentor}
				bookingDate={state.bookingDate}
				onBookingDateChange={state.setBookingDate}
				bookingTime={state.bookingTime}
				onBookingTimeChange={state.setBookingTime}
				bookingType={state.bookingType}
				onBookingTypeChange={state.setBookingType}
				bookingDuration={state.bookingDuration}
				onBookingDurationChange={state.setBookingDuration}
				bookingTopic={state.bookingTopic}
				onBookingTopicChange={state.setBookingTopic}
				onSubmit={state.handleSubmitBooking}
				isSubmitting={state.isCreatingSession}
			/>

			<AddGoalDialog
				open={state.showGoalDialog}
				onOpenChange={state.setShowGoalDialog}
				title={state.newGoalTitle}
				onTitleChange={state.setNewGoalTitle}
				description={state.newGoalDescription}
				onDescriptionChange={state.setNewGoalDescription}
				targetDate={state.newGoalTargetDate}
				onTargetDateChange={state.setNewGoalTargetDate}
				onSubmit={state.handleAddGoal}
				isSubmitting={state.isCreatingGoal}
			/>

			<SessionNotesDialog
				open={state.showSessionNotesDialog}
				onOpenChange={state.setShowSessionNotesDialog}
				session={state.selectedSession}
				notes={state.sessionNotes}
				onNotesChange={state.setSessionNotes}
				rating={state.sessionRating}
				onRatingChange={state.setSessionRating}
				feedback={state.sessionFeedback}
				onFeedbackChange={state.setSessionFeedback}
				onSave={state.handleSaveSessionNotes}
			/>

			<EditProfileDialog
				open={state.showProfileDialog}
				onOpenChange={state.setShowProfileDialog}
				targetRole={state.profileTargetRole}
				onTargetRoleChange={state.setProfileTargetRole}
				skills={state.profileSkills}
				onSkillsChange={state.setProfileSkills}
				industries={state.profileIndustries}
				onIndustriesChange={state.setProfileIndustries}
				timeline={state.profileTimeline}
				onTimelineChange={state.setProfileTimeline}
				onSave={state.handleSaveProfile}
			/>

			<ComposeMessageDialog
				open={state.showComposeDialog}
				onOpenChange={state.setShowComposeDialog}
				recipientId={state.composeRecipientId}
				onRecipientIdChange={state.setComposeRecipientId}
				subject={state.composeSubject}
				onSubjectChange={state.setComposeSubject}
				message={state.composeMessage}
				onMessageChange={state.setComposeMessage}
				onSend={state.handleSendNewMessage}
				isSending={state.isSendingMessage}
				mentors={state.mentors}
			/>
		</div>
	);
}
