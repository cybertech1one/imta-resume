import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { ChatCircleDotsIcon, PlusIcon, SparkleIcon, UsersIcon } from "@phosphor-icons/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ErrorComponent } from "@/components/error-component";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { authClient } from "@/integrations/auth/client";
import { orpc } from "@/integrations/orpc/client";

import { DashboardHeader } from "../-components/header";
import { ChatTab, CustomMentorBuilder, MentorsTab, OnboardingWizard } from "./-components/ai-mentor-components";
import type { ConversationMessage, OnboardingState } from "./-components/ai-mentor-types";

// biome-ignore lint/suspicious/noExplicitAny: Route path not in generated route tree
export const Route = createFileRoute("/dashboard/ai-mentor" as any)({
	component: AiMentorPage,
	errorComponent: ErrorComponent,
});

function AiMentorPage() {
	const { data: session } = authClient.useSession();
	const queryClient = useQueryClient();

	const [activeTab, setActiveTab] = useState("mentors");
	const [showOnboarding, setShowOnboarding] = useState(false);
	const [onboarding, setOnboarding] = useState<OnboardingState>({
		step: 1,
		field: "",
		currentLevel: "",
		biggestChallenge: "",
		learningStyle: "",
		preferredLanguage: "fr",
	});
	const [selectedMentor, setSelectedMentor] = useState<string | null>(null);
	const [chatInput, setChatInput] = useState("");
	const [isTyping, setIsTyping] = useState(false);
	const chatEndRef = useRef<HTMLDivElement>(null);

	const { data: templates, isLoading: templatesLoading } = useQuery({
		queryKey: ["ai-mentor", "templates"],
		queryFn: () => orpc.aiMentor.templates.list.call({}),
		enabled: !!session?.user,
	});

	const { data: userMentors } = useQuery({
		queryKey: ["ai-mentor", "my-mentors"],
		queryFn: () => orpc.aiMentor.user.list.call({}),
		enabled: !!session?.user,
	});

	const { data: onboardingData } = useQuery({
		queryKey: ["ai-mentor", "onboarding"],
		queryFn: () => orpc.aiMentor.onboarding.get.call({}),
		enabled: !!session?.user,
	});

	const { data: recommendations } = useQuery({
		queryKey: ["ai-mentor", "recommendations"],
		queryFn: () => orpc.aiMentor.onboarding.getRecommendations.call({}),
		enabled: !!session?.user && !!onboardingData?.completedAt,
	});

	const { data: _conversations } = useQuery({
		queryKey: ["ai-mentor", "conversations", selectedMentor],
		queryFn: () => orpc.aiMentor.conversations.list.call({ mentorId: selectedMentor || undefined }),
		enabled: !!session?.user && !!selectedMentor,
	});

	const [currentConversation, setCurrentConversation] = useState<{
		id: string;
		messages: ConversationMessage[];
	} | null>(null);

	const updateOnboardingMutation = useMutation({
		mutationFn: (data: Partial<OnboardingState>) => orpc.aiMentor.onboarding.update.call(data),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: ["ai-mentor", "onboarding"] }),
	});

	const completeOnboardingMutation = useMutation({
		mutationFn: () => orpc.aiMentor.onboarding.complete.call({}),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["ai-mentor"] });
			setShowOnboarding(false);
		},
	});

	const selectTemplateMutation = useMutation({
		mutationFn: (templateId: string) => orpc.aiMentor.user.selectTemplate.call({ templateId }),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["ai-mentor", "my-mentors"] });
		},
	});

	const createConversationMutation = useMutation({
		mutationFn: (mentorId: string) => orpc.aiMentor.conversations.create.call({ mentorId }),
		onSuccess: (data) => {
			if (data) {
				setCurrentConversation({ id: data.id, messages: [] });
			}
		},
	});

	const sendMessageMutation = useMutation({
		mutationFn: ({ conversationId, content }: { conversationId: string; content: string }) =>
			orpc.aiMentor.conversations.sendMessage.call({ conversationId, content }),
		onSuccess: (data) => {
			if (data?.conversation) {
				setCurrentConversation({
					id: data.conversation.id,
					messages: data.conversation.messages as ConversationMessage[],
				});
			}
			setIsTyping(false);
		},
		onError: () => setIsTyping(false),
	});

	useEffect(() => {
		if (!onboardingData?.completedAt && session?.user && !templatesLoading) {
			setShowOnboarding(true);
		}
	}, [onboardingData, session, templatesLoading]);

	useEffect(() => {
		if (userMentors && userMentors.length > 0 && !selectedMentor) {
			const primary = userMentors.find((m) => m.isPrimary);
			if (primary) {
				setSelectedMentor(primary.id);
			}
		}
	}, [userMentors, selectedMentor]);

	// biome-ignore lint/correctness/useExhaustiveDependencies: Scroll to bottom when messages change
	useEffect(() => {
		chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [currentConversation?.messages]);

	const handleOnboardingNext = async () => {
		await updateOnboardingMutation.mutateAsync(onboarding);
		if (onboarding.step < 5) {
			setOnboarding((prev) => ({ ...prev, step: prev.step + 1 }));
		} else {
			await completeOnboardingMutation.mutateAsync();
		}
	};

	const handleSelectMentor = async (templateId: string) => {
		const userMentor = await selectTemplateMutation.mutateAsync(templateId);
		if (userMentor?.id) {
			setSelectedMentor(userMentor.id);
			await createConversationMutation.mutateAsync(userMentor.id);
			setActiveTab("chat");
		}
	};

	const handleStartChat = async (templateId: string) => {
		const userMentor = await selectTemplateMutation.mutateAsync(templateId);
		if (userMentor?.id) {
			setSelectedMentor(userMentor.id);
			await createConversationMutation.mutateAsync(userMentor.id);
			setActiveTab("chat");
		}
	};

	const handleSendMessage = async () => {
		if (!chatInput.trim() || !currentConversation?.id) return;

		const content = chatInput;
		setChatInput("");
		setIsTyping(true);

		setCurrentConversation((prev) => {
			if (!prev) return null;
			return {
				...prev,
				messages: [...prev.messages, { role: "user" as const, content, timestamp: new Date().toISOString() }],
			};
		});

		await sendMessageMutation.mutateAsync({
			conversationId: currentConversation.id,
			content,
		});
	};

	if (showOnboarding) {
		return <OnboardingWizard onboarding={onboarding} setOnboarding={setOnboarding} onNext={handleOnboardingNext} />;
	}

	return (
		<div className="min-h-screen">
			<DashboardHeader icon={SparkleIcon} title={t`Mentor IA Carrière`} />

			<div className="container mx-auto px-4 py-6">
				<Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
					<TabsList className="grid w-full max-w-md grid-cols-3">
						<TabsTrigger value="mentors">
							<UsersIcon className="mr-2 h-4 w-4" />
							<Trans>Mentors</Trans>
						</TabsTrigger>
						<TabsTrigger value="chat">
							<ChatCircleDotsIcon className="mr-2 h-4 w-4" />
							<Trans>Discussion</Trans>
						</TabsTrigger>
						<TabsTrigger value="custom">
							<PlusIcon className="mr-2 h-4 w-4" />
							<Trans>Créer</Trans>
						</TabsTrigger>
					</TabsList>

					<TabsContent value="mentors" className="space-y-6">
						<MentorsTab
							recommendations={recommendations}
							templates={templates}
							templatesLoading={templatesLoading}
							onSelectMentor={handleSelectMentor}
							onStartChat={handleStartChat}
						/>
					</TabsContent>

					<TabsContent value="chat" className="space-y-4">
						<ChatTab
							selectedMentor={selectedMentor}
							currentConversation={currentConversation}
							isTyping={isTyping}
							chatInput={chatInput}
							setChatInput={setChatInput}
							onSendMessage={handleSendMessage}
							onBrowseMentors={() => setActiveTab("mentors")}
							chatEndRef={chatEndRef}
						/>
					</TabsContent>

					<TabsContent value="custom" className="space-y-6">
						<CustomMentorBuilder
							onSuccess={() => {
								queryClient.invalidateQueries({ queryKey: ["ai-mentor", "my-mentors"] });
								setActiveTab("mentors");
							}}
						/>
					</TabsContent>
				</Tabs>
			</div>
		</div>
	);
}
