import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { ChatCircleDotsIcon } from "@phosphor-icons/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import { ErrorComponent } from "@/components/error-component";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { authClient } from "@/integrations/auth/client";
import { orpc } from "@/integrations/orpc/client";
import { DashboardHeader } from "../-components/header";
import {
	DraftsTab,
	MessageEditor,
	MessageTypeSelector,
	NewMessageDialog,
	RecipientSettingsCard,
	SentTab,
	StatsCards,
	TemplatesTab,
} from "./-components/messages-components";
import { MESSAGE_TYPES } from "./-components/messages-config";
import type { MessageFormality, MessageType } from "./-components/messages-types";

// biome-ignore lint/suspicious/noExplicitAny: Route path not in generated route tree
export const Route = createFileRoute("/dashboard/linkedin/messages" as any)({
	component: LinkedInMessages,
	errorComponent: ErrorComponent,
});

function LinkedInMessages() {
	const { data: session } = authClient.useSession();
	const queryClient = useQueryClient();
	const [activeTab, setActiveTab] = useState("create");
	const [showNewMessageDialog, setShowNewMessageDialog] = useState(false);

	const [messageType, setMessageType] = useState<MessageType>("connection_request");
	const [formality, setFormality] = useState<MessageFormality>("semi_formal");
	const [language, setLanguage] = useState("fr");
	const [recipientName, setRecipientName] = useState("");
	const [recipientRole, setRecipientRole] = useState("");
	const [recipientCompany, setRecipientCompany] = useState("");
	const [context, setContext] = useState("");
	const [content, setContent] = useState("");

	const { data: messages = [], isLoading: isLoadingMessages } = useQuery({
		...orpc.linkedinContent.listMessages.queryOptions(),
		enabled: !!session?.user,
		staleTime: 2 * 60 * 1000,
	});

	useQuery({
		...orpc.linkedinContent.getMessageTemplates.queryOptions(),
		enabled: !!session?.user,
		staleTime: 10 * 60 * 1000,
	});

	const createMessageMutation = useMutation({
		mutationFn: async (input: {
			messageType: MessageType;
			formality: MessageFormality;
			language: string;
			recipientName?: string;
			recipientRole?: string;
			recipientCompany?: string;
			context?: string;
			content: string;
		}) => {
			return orpc.linkedinContent.createMessage.call(input);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["linkedinContent", "listMessages"] });
			toast.success(t`Message created successfully`);
			resetForm();
			setShowNewMessageDialog(false);
		},
		onError: () => {
			toast.error(t`Error creating message`);
		},
	});

	const updateMessageMutation = useMutation({
		mutationFn: async (input: { id: string; isSent?: boolean; isFavorite?: boolean }) => {
			return orpc.linkedinContent.updateMessage.call(input);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["linkedinContent", "listMessages"] });
		},
	});

	const deleteMessageMutation = useMutation({
		mutationFn: async (id: string) => {
			return orpc.linkedinContent.deleteMessage.call({ id });
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["linkedinContent", "listMessages"] });
			toast.success(t`Message deleted`);
		},
	});

	const resetForm = useCallback(() => {
		setMessageType("connection_request");
		setFormality("semi_formal");
		setLanguage("fr");
		setRecipientName("");
		setRecipientRole("");
		setRecipientCompany("");
		setContext("");
		setContent("");
	}, []);

	const copyToClipboard = useCallback((text: string) => {
		navigator.clipboard.writeText(text);
		toast.success(t`Copied to clipboard`);
	}, []);

	const sentMessages = useMemo(() => messages.filter((m) => m.isSent), [messages]);
	const draftMessages = useMemo(() => messages.filter((m) => !m.isSent), [messages]);
	const favoriteMessages = useMemo(() => messages.filter((m) => m.isFavorite), [messages]);

	const getTypeConfig = useCallback(
		(type: MessageType) => MESSAGE_TYPES.find((t) => t.value === type) || MESSAGE_TYPES[0],
		[],
	);

	return (
		<div className="space-y-6">
			<DashboardHeader icon={ChatCircleDotsIcon} title={t`Networking Messages`} />

			<StatsCards
				totalCount={messages.length}
				sentCount={sentMessages.length}
				favoriteCount={favoriteMessages.length}
				onNewMessage={() => setShowNewMessageDialog(true)}
			/>

			<Tabs value={activeTab} onValueChange={setActiveTab}>
				<TabsList>
					<TabsTrigger value="create">
						<Trans>Create</Trans>
					</TabsTrigger>
					<TabsTrigger value="drafts">
						<Trans>Drafts</Trans> ({draftMessages.length})
					</TabsTrigger>
					<TabsTrigger value="sent">
						<Trans>Sent</Trans> ({sentMessages.length})
					</TabsTrigger>
					<TabsTrigger value="templates">
						<Trans>Templates</Trans>
					</TabsTrigger>
				</TabsList>

				<TabsContent value="create" className="space-y-6">
					<div className="grid gap-6 lg:grid-cols-2">
						<MessageTypeSelector messageType={messageType} onSelect={setMessageType} />
						<RecipientSettingsCard
							recipientName={recipientName}
							recipientRole={recipientRole}
							recipientCompany={recipientCompany}
							context={context}
							formality={formality}
							language={language}
							onRecipientNameChange={setRecipientName}
							onRecipientRoleChange={setRecipientRole}
							onRecipientCompanyChange={setRecipientCompany}
							onContextChange={setContext}
							onFormalityChange={setFormality}
							onLanguageChange={setLanguage}
						/>
					</div>
					<MessageEditor
						content={content}
						onContentChange={setContent}
						onReset={resetForm}
						onSave={() =>
							createMessageMutation.mutate({
								messageType,
								formality,
								language,
								recipientName: recipientName || undefined,
								recipientRole: recipientRole || undefined,
								recipientCompany: recipientCompany || undefined,
								context: context || undefined,
								content,
							})
						}
						isPending={createMessageMutation.isPending}
					/>
				</TabsContent>

				<TabsContent value="drafts" className="space-y-4">
					<DraftsTab
						isLoading={isLoadingMessages}
						draftMessages={draftMessages}
						getTypeConfig={getTypeConfig}
						copyToClipboard={copyToClipboard}
						updateMessageMutation={updateMessageMutation}
						deleteMessageMutation={deleteMessageMutation}
						onCreateClick={() => setActiveTab("create")}
					/>
				</TabsContent>

				<TabsContent value="sent" className="space-y-4">
					<SentTab
						isLoading={isLoadingMessages}
						sentMessages={sentMessages}
						getTypeConfig={getTypeConfig}
						copyToClipboard={copyToClipboard}
					/>
				</TabsContent>

				<TabsContent value="templates" className="space-y-4">
					<TemplatesTab
						onSelectType={(type) => {
							setMessageType(type);
							setActiveTab("create");
						}}
					/>
				</TabsContent>
			</Tabs>

			<NewMessageDialog
				open={showNewMessageDialog}
				onOpenChange={setShowNewMessageDialog}
				messageType={messageType}
				formality={formality}
				language={language}
				recipientName={recipientName}
				recipientCompany={recipientCompany}
				content={content}
				onMessageTypeChange={setMessageType}
				onFormalityChange={setFormality}
				onLanguageChange={setLanguage}
				onRecipientNameChange={setRecipientName}
				onRecipientCompanyChange={setRecipientCompany}
				onContentChange={setContent}
				onSave={() =>
					createMessageMutation.mutate({
						messageType,
						formality,
						language,
						recipientName: recipientName || undefined,
						recipientCompany: recipientCompany || undefined,
						content,
					})
				}
				isPending={createMessageMutation.isPending}
			/>
		</div>
	);
}
