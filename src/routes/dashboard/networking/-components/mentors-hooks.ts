import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useState } from "react";
import { authClient } from "@/integrations/auth/client";
import { orpc } from "@/integrations/orpc/client";
import type { MentorData, SessionData } from "./mentors-components";
import type { AvailabilitySlot, MentorStatus, SessionType, Skill } from "./mentors-types";
import { calculateMatchScore } from "./mentors-utils";

export function useMentorMatchingState() {
	const { data: session } = authClient.useSession();
	const queryClient = useQueryClient();
	const [activeTab, setActiveTab] = useState("discover");

	// Filter states
	const [searchQuery, setSearchQuery] = useState("");
	const [expertiseFilter, setExpertiseFilter] = useState<string>("all");
	const [industryFilter, setIndustryFilter] = useState<string>("all");
	const [availabilityFilter, setAvailabilityFilter] = useState<string>("all");

	// Dialog states
	const [selectedMentor, setSelectedMentor] = useState<MentorData | null>(null);
	const [showMentorDialog, setShowMentorDialog] = useState(false);
	const [showRequestDialog, setShowRequestDialog] = useState(false);
	const [showBookingDialog, setShowBookingDialog] = useState(false);
	const [showGoalDialog, setShowGoalDialog] = useState(false);
	const [showSessionNotesDialog, setShowSessionNotesDialog] = useState(false);
	const [showProfileDialog, setShowProfileDialog] = useState(false);

	// Form states
	const [requestMessage, setRequestMessage] = useState("");
	const [requestGoals, setRequestGoals] = useState<string[]>([""]);
	const [bookingDate, setBookingDate] = useState("");
	const [bookingTime, setBookingTime] = useState("");
	const [bookingType, setBookingType] = useState<SessionType>("video_call");
	const [bookingTopic, setBookingTopic] = useState("");
	const [bookingDuration, setBookingDuration] = useState("60");
	const [newGoalTitle, setNewGoalTitle] = useState("");
	const [newGoalDescription, setNewGoalDescription] = useState("");
	const [newGoalTargetDate, setNewGoalTargetDate] = useState("");
	const [selectedSession, setSelectedSession] = useState<SessionData | null>(null);
	const [sessionNotes, setSessionNotes] = useState("");
	const [sessionRating, setSessionRating] = useState(5);
	const [sessionFeedback, setSessionFeedback] = useState("");

	// Profile form states
	const [profileTargetRole, setProfileTargetRole] = useState("");
	const [profileSkills, setProfileSkills] = useState("");
	const [profileIndustries, setProfileIndustries] = useState("");
	const [profileTimeline, setProfileTimeline] = useState("6 months");

	// Messaging states
	const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
	const [showComposeDialog, setShowComposeDialog] = useState(false);
	const [composeRecipientId, setComposeRecipientId] = useState<string>("");
	const [composeSubject, setComposeSubject] = useState("");
	const [composeMessage, setComposeMessage] = useState("");
	const [replyMessage, setReplyMessage] = useState("");

	// ========================
	// QUERIES
	// ========================

	const { data: mentors = [], isLoading: isLoadingMentors } = useQuery({
		...orpc.mentors.listMentors.queryOptions({
			search: searchQuery || undefined,
			status: availabilityFilter !== "all" ? (availabilityFilter as MentorStatus) : undefined,
		}),
		enabled: !!session?.user,
	});

	const { data: requests = [] } = useQuery({
		...orpc.mentors.listRequests.queryOptions({}),
		enabled: !!session?.user,
	});
	const { data: sessions = [] } = useQuery({
		...orpc.mentors.listSessions.queryOptions({}),
		enabled: !!session?.user,
	});
	const { data: goals = [] } = useQuery({
		...orpc.mentors.listGoals.queryOptions({}),
		enabled: !!session?.user,
	});

	const { data: userGoals = { targetRole: "", skills: [], industries: [], timeline: "6 months" } } = useQuery({
		...orpc.mentors.getUserGoals.queryOptions(),
		enabled: !!session?.user,
	});

	const { data: statistics } = useQuery({
		...orpc.mentors.getStatistics.queryOptions(),
		enabled: !!session?.user,
	});

	const { data: mentorReviews = [] } = useQuery({
		...orpc.mentors.listReviews.queryOptions({ input: { mentorId: selectedMentor?.id ?? "" } }),
		enabled: !!session?.user && !!selectedMentor?.id && showMentorDialog,
	});

	const { data: conversations = [], isLoading: isLoadingConversations } = useQuery({
		...orpc.mentorMessaging.getConversations.queryOptions(),
		enabled: !!session?.user,
	});

	const { data: unreadCount = 0 } = useQuery({
		...orpc.mentorMessaging.getUnreadCount.queryOptions(),
		enabled: !!session?.user,
	});

	const { data: conversationMessages = [], isLoading: isLoadingMessages } = useQuery({
		...orpc.mentorMessaging.getConversation.queryOptions({ input: { otherUserId: selectedConversation ?? "" } }),
		enabled: !!session?.user && !!selectedConversation,
	});

	// ========================
	// MUTATIONS
	// ========================

	const { mutate: seedMentors } = useMutation(
		orpc.mentors.seedMentors.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries({ queryKey: ["mentors"] });
			},
		}),
	);

	const { mutate: createRequest, isPending: isCreatingRequest } = useMutation({
		...orpc.mentors.createRequest.mutationOptions(),
		onMutate: async (newRequest) => {
			await queryClient.cancelQueries({ queryKey: ["mentors", "listRequests"] });
			const previousRequests = queryClient.getQueryData(orpc.mentors.listRequests.key({}));
			queryClient.setQueryData(orpc.mentors.listRequests.key({}), (old: typeof requests | undefined) => {
				if (!old) return old;
				const optimisticRequest = {
					...newRequest,
					id: `temp-${Date.now()}`,
					userId: "",
					status: "pending" as const,
					respondedAt: null,
					createdAt: new Date(),
					updatedAt: new Date(),
				};
				return [...old, optimisticRequest];
			});
			setShowRequestDialog(false);
			setSelectedMentor(null);
			setRequestMessage("");
			setRequestGoals([""]);
			return { previousRequests };
		},
		onError: (_error, _newRequest, context) => {
			if (context?.previousRequests) {
				queryClient.setQueryData(orpc.mentors.listRequests.key({}), context.previousRequests);
			}
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: ["mentors", "listRequests"] });
			queryClient.invalidateQueries({ queryKey: ["mentors", "getStatistics"] });
		},
	});

	const { mutate: createSession, isPending: isCreatingSession } = useMutation({
		...orpc.mentors.createSession.mutationOptions(),
		onMutate: async (newSession) => {
			await queryClient.cancelQueries({ queryKey: ["mentors", "listSessions"] });
			const previousSessions = queryClient.getQueryData(orpc.mentors.listSessions.key({}));
			queryClient.setQueryData(orpc.mentors.listSessions.key({}), (old: typeof sessions | undefined) => {
				if (!old) return old;
				const optimisticSession = {
					...newSession,
					id: `temp-${Date.now()}`,
					odleUserId: "",
					status: "scheduled" as const,
					notes: "",
					rating: null,
					feedback: null,
					mentorAvatar: newSession.mentorAvatar || null,
					createdAt: new Date(),
					updatedAt: new Date(),
				};
				return [...old, optimisticSession];
			});
			setShowBookingDialog(false);
			setSelectedMentor(null);
			setBookingDate("");
			setBookingTime("");
			setBookingTopic("");
			return { previousSessions };
		},
		onError: (_error, _newSession, context) => {
			if (context?.previousSessions) {
				queryClient.setQueryData(orpc.mentors.listSessions.key({}), context.previousSessions);
			}
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: ["mentors", "listSessions"] });
			queryClient.invalidateQueries({ queryKey: ["mentors", "getStatistics"] });
		},
	});

	const { mutate: updateSession } = useMutation(
		orpc.mentors.updateSession.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries({ queryKey: ["mentors", "listSessions"] });
				setShowSessionNotesDialog(false);
				setSelectedSession(null);
			},
		}),
	);

	const { mutate: createGoal, isPending: isCreatingGoal } = useMutation({
		...orpc.mentors.createGoal.mutationOptions(),
		onMutate: async (newGoal) => {
			await queryClient.cancelQueries({ queryKey: ["mentors", "listGoals"] });
			const previousGoals = queryClient.getQueryData(orpc.mentors.listGoals.key({}));
			queryClient.setQueryData(orpc.mentors.listGoals.key({}), (old: typeof goals | undefined) => {
				if (!old) return old;
				const optimisticGoal = {
					...newGoal,
					id: `temp-${Date.now()}`,
					userId: "",
					status: "not_started" as const,
					progress: 0,
					milestones: [],
					createdAt: new Date(),
					updatedAt: new Date(),
				};
				return [...old, optimisticGoal];
			});
			setShowGoalDialog(false);
			setNewGoalTitle("");
			setNewGoalDescription("");
			setNewGoalTargetDate("");
			return { previousGoals };
		},
		onError: (_error, _newGoal, context) => {
			if (context?.previousGoals) {
				queryClient.setQueryData(orpc.mentors.listGoals.key({}), context.previousGoals);
			}
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: ["mentors", "listGoals"] });
			queryClient.invalidateQueries({ queryKey: ["mentors", "getStatistics"] });
		},
	});

	const { mutate: toggleMilestone } = useMutation(
		orpc.mentors.toggleMilestone.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries({ queryKey: ["mentors", "listGoals"] });
			},
		}),
	);

	const { mutate: updateUserGoals } = useMutation(
		orpc.mentors.updateUserGoals.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries({ queryKey: ["mentors", "getUserGoals"] });
				setShowProfileDialog(false);
			},
		}),
	);

	const { mutate: sendMessage, isPending: isSendingMessage } = useMutation({
		...orpc.mentorMessaging.sendMessage.mutationOptions(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["mentorMessaging"] });
			setShowComposeDialog(false);
			setComposeRecipientId("");
			setComposeSubject("");
			setComposeMessage("");
			setReplyMessage("");
		},
	});

	const { mutate: markConversationAsRead } = useMutation({
		...orpc.mentorMessaging.markConversationAsRead.mutationOptions(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["mentorMessaging"] });
		},
	});

	// ========================
	// EFFECTS
	// ========================

	useEffect(() => {
		if (!isLoadingMentors && mentors.length === 0) {
			seedMentors({});
		}
	}, [isLoadingMentors, mentors.length, seedMentors]);

	useEffect(() => {
		setProfileTargetRole(userGoals.targetRole);
		setProfileSkills(userGoals.skills.join(", "));
		setProfileIndustries(userGoals.industries.join(", "));
		setProfileTimeline(userGoals.timeline);
	}, [userGoals]);

	// ========================
	// COMPUTED VALUES
	// ========================

	const mentorsWithScores = useMemo(() => {
		return mentors.map((mentor) => ({
			...mentor,
			matchScore: calculateMatchScore(
				mentor as {
					skills?: Skill[] | null;
					industries?: string[] | null;
					careerPath?: string[] | null;
					status: MentorStatus;
					availability?: AvailabilitySlot[] | null;
				},
				userGoals,
			),
		}));
	}, [mentors, userGoals]);

	const filteredMentors = useMemo(() => {
		return mentorsWithScores
			.filter((mentor) => {
				if (expertiseFilter !== "all") {
					const expertise = mentor.expertise ?? [];
					if (!expertise.some((e) => e.toLowerCase().includes(expertiseFilter.toLowerCase()))) {
						return false;
					}
				}
				if (industryFilter !== "all") {
					const industries = mentor.industries ?? [];
					if (!industries.some((i) => i.toLowerCase().includes(industryFilter.toLowerCase()))) {
						return false;
					}
				}
				return true;
			})
			.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
	}, [mentorsWithScores, expertiseFilter, industryFilter]);

	const recommendedMentors = useMemo(() => {
		return mentorsWithScores
			.filter((m) => m.status === "available")
			.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0))
			.slice(0, 3);
	}, [mentorsWithScores]);

	const allExpertise = useMemo(() => {
		const expertise = new Set<string>();
		for (const m of mentors) {
			for (const e of m.expertise ?? []) {
				expertise.add(e);
			}
		}
		return Array.from(expertise).sort();
	}, [mentors]);

	const allIndustries = useMemo(() => {
		const industries = new Set<string>();
		for (const m of mentors) {
			for (const i of m.industries ?? []) {
				industries.add(i);
			}
		}
		return Array.from(industries).sort();
	}, [mentors]);

	const activeMentorship = useMemo(() => {
		return requests.find((r) => r.status === "accepted");
	}, [requests]);

	const upcomingSessions = useMemo(() => {
		return sessions
			.filter((s) => s.status === "scheduled" && new Date(s.scheduledAt) > new Date())
			.sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());
	}, [sessions]);

	const pastSessions = useMemo(() => {
		return sessions
			.filter((s) => s.status === "completed")
			.sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime());
	}, [sessions]);

	// ========================
	// HANDLERS
	// ========================

	const handleViewMentor = useCallback((mentor: MentorData) => {
		setSelectedMentor(mentor);
		setShowMentorDialog(true);
	}, []);

	const handleRequestMentorship = useCallback((mentor: MentorData) => {
		setSelectedMentor(mentor);
		setRequestMessage("");
		setRequestGoals([""]);
		setShowMentorDialog(false);
		setShowRequestDialog(true);
	}, []);

	const handleSubmitRequest = useCallback(() => {
		if (!selectedMentor || !requestMessage.trim()) return;

		createRequest({
			mentorId: selectedMentor.id,
			mentorName: `${selectedMentor.firstName} ${selectedMentor.lastName}`,
			message: requestMessage,
			goals: requestGoals.filter((g) => g.trim()),
		});
	}, [selectedMentor, requestMessage, requestGoals, createRequest]);

	const handleBookSession = useCallback((mentor: MentorData) => {
		setSelectedMentor(mentor);
		setBookingDate("");
		setBookingTime("");
		setBookingType("video_call");
		setBookingTopic("");
		setBookingDuration("60");
		setShowMentorDialog(false);
		setShowBookingDialog(true);
	}, []);

	const handleSubmitBooking = useCallback(() => {
		if (!selectedMentor || !bookingDate || !bookingTime || !bookingTopic.trim()) return;

		createSession({
			mentorId: selectedMentor.id,
			mentorName: `${selectedMentor.firstName} ${selectedMentor.lastName}`,
			mentorAvatar: selectedMentor.avatar ?? undefined,
			scheduledAt: new Date(`${bookingDate}T${bookingTime}:00`),
			type: bookingType,
			duration: Number.parseInt(bookingDuration, 10),
			topic: bookingTopic,
		});
	}, [selectedMentor, bookingDate, bookingTime, bookingType, bookingTopic, bookingDuration, createSession]);

	const handleAddGoal = useCallback(() => {
		if (!newGoalTitle.trim() || !newGoalTargetDate) return;

		createGoal({
			mentorshipId: activeMentorship?.mentorId ?? "",
			title: newGoalTitle,
			description: newGoalDescription,
			targetDate: newGoalTargetDate,
		});
	}, [newGoalTitle, newGoalDescription, newGoalTargetDate, activeMentorship, createGoal]);

	const handleToggleMilestone = useCallback(
		(goalId: string, milestoneId: string) => {
			toggleMilestone({ id: goalId, milestoneId });
		},
		[toggleMilestone],
	);

	const handleViewSessionNotes = useCallback((session: SessionData) => {
		setSelectedSession(session);
		setSessionNotes(session.notes);
		setSessionRating(session.rating || 5);
		setSessionFeedback(session.feedback || "");
		setShowSessionNotesDialog(true);
	}, []);

	const handleSaveSessionNotes = useCallback(() => {
		if (!selectedSession) return;

		updateSession({
			id: selectedSession.id,
			notes: sessionNotes,
			rating: sessionRating,
			feedback: sessionFeedback,
		});
	}, [selectedSession, sessionNotes, sessionRating, sessionFeedback, updateSession]);

	const handleSaveProfile = useCallback(() => {
		updateUserGoals({
			targetRole: profileTargetRole,
			skills: profileSkills
				.split(",")
				.map((s) => s.trim())
				.filter(Boolean),
			industries: profileIndustries
				.split(",")
				.map((i) => i.trim())
				.filter(Boolean),
			timeline: profileTimeline,
		});
	}, [profileTargetRole, profileSkills, profileIndustries, profileTimeline, updateUserGoals]);

	const handleAddRequestGoal = useCallback(() => {
		setRequestGoals((prev) => [...prev, ""]);
	}, []);

	const handleUpdateRequestGoal = useCallback((index: number, value: string) => {
		setRequestGoals((prev) => prev.map((g, i) => (i === index ? value : g)));
	}, []);

	const handleRemoveRequestGoal = useCallback((index: number) => {
		setRequestGoals((prev) => prev.filter((_, i) => i !== index));
	}, []);

	const handleSelectConversation = useCallback(
		(otherUserId: string) => {
			setSelectedConversation(otherUserId);
			markConversationAsRead({ otherUserId });
		},
		[markConversationAsRead],
	);

	const handleSendNewMessage = useCallback(() => {
		if (!composeRecipientId || !composeMessage.trim()) return;

		sendMessage({
			receiverId: composeRecipientId,
			subject: composeSubject || undefined,
			content: composeMessage,
		});
	}, [composeRecipientId, composeSubject, composeMessage, sendMessage]);

	const handleSendReply = useCallback(() => {
		if (!selectedConversation || !replyMessage.trim()) return;

		sendMessage({
			receiverId: selectedConversation,
			content: replyMessage,
		});
		setReplyMessage("");
	}, [selectedConversation, replyMessage, sendMessage]);

	const handleStartConversationWithMentor = useCallback((mentorUserId: string) => {
		setComposeRecipientId(mentorUserId);
		setShowComposeDialog(true);
	}, []);

	return {
		// Tab state
		activeTab,
		setActiveTab,

		// Filter states
		searchQuery,
		setSearchQuery,
		expertiseFilter,
		setExpertiseFilter,
		industryFilter,
		setIndustryFilter,
		availabilityFilter,
		setAvailabilityFilter,

		// Dialog states
		selectedMentor,
		showMentorDialog,
		setShowMentorDialog,
		showRequestDialog,
		setShowRequestDialog,
		showBookingDialog,
		setShowBookingDialog,
		showGoalDialog,
		setShowGoalDialog,
		showSessionNotesDialog,
		setShowSessionNotesDialog,
		showProfileDialog,
		setShowProfileDialog,

		// Form states
		requestMessage,
		setRequestMessage,
		requestGoals,
		bookingDate,
		setBookingDate,
		bookingTime,
		setBookingTime,
		bookingType,
		setBookingType,
		bookingTopic,
		setBookingTopic,
		bookingDuration,
		setBookingDuration,
		newGoalTitle,
		setNewGoalTitle,
		newGoalDescription,
		setNewGoalDescription,
		newGoalTargetDate,
		setNewGoalTargetDate,
		selectedSession,
		sessionNotes,
		setSessionNotes,
		sessionRating,
		setSessionRating,
		sessionFeedback,
		setSessionFeedback,

		// Profile form states
		profileTargetRole,
		setProfileTargetRole,
		profileSkills,
		setProfileSkills,
		profileIndustries,
		setProfileIndustries,
		profileTimeline,
		setProfileTimeline,

		// Messaging states
		selectedConversation,
		setSelectedConversation,
		showComposeDialog,
		setShowComposeDialog,
		composeRecipientId,
		setComposeRecipientId,
		composeSubject,
		setComposeSubject,
		composeMessage,
		setComposeMessage,
		replyMessage,
		setReplyMessage,

		// Query data
		mentors,
		isLoadingMentors,
		requests,
		goals,
		userGoals,
		statistics,
		mentorReviews,
		conversations,
		isLoadingConversations,
		unreadCount,
		conversationMessages,
		isLoadingMessages,

		// Computed values
		filteredMentors,
		recommendedMentors,
		allExpertise,
		allIndustries,
		activeMentorship,
		upcomingSessions,
		pastSessions,

		// Mutation pending states
		isCreatingRequest,
		isCreatingSession,
		isCreatingGoal,
		isSendingMessage,

		// Handlers
		handleViewMentor,
		handleRequestMentorship,
		handleSubmitRequest,
		handleBookSession,
		handleSubmitBooking,
		handleAddGoal,
		handleToggleMilestone,
		handleViewSessionNotes,
		handleSaveSessionNotes,
		handleSaveProfile,
		handleAddRequestGoal,
		handleUpdateRequestGoal,
		handleRemoveRequestGoal,
		handleSelectConversation,
		handleSendNewMessage,
		handleSendReply,
		handleStartConversationWithMentor,
	};
}
