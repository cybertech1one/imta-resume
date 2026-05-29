import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { ChatsCircleIcon, PaperPlaneTiltIcon, UserCircleIcon } from "@phosphor-icons/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { ErrorComponent } from "@/components/error-component";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { authClient } from "@/integrations/auth/client";
import { orpc } from "@/integrations/orpc/client";
import { getInitials } from "@/utils/string";
import { cn } from "@/utils/style";
import { DashboardHeader } from "../-components/header";

const searchSchema = z.object({
	conversation: z.string().optional(),
});

type SearchParams = z.infer<typeof searchSchema>;

// biome-ignore lint/suspicious/noExplicitAny: Route path not in generated route tree
export const Route = createFileRoute("/dashboard/messages/" as any)({
	component: MessagesPage,
	errorComponent: ErrorComponent,
	validateSearch: searchSchema,
});

const POLL_CONVERSATIONS_MS = 12_000;
const POLL_THREAD_MS = 10_000;

function formatTime(date: Date | string) {
	const d = new Date(date);
	return d.toLocaleString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}

type ConversationSummary = {
	conversationId: string;
	subject: string | null;
	lastMessageAt: Date;
	lastMessagePreview: string | null;
	lastMessageFromMe: boolean;
	unreadCount: number;
	otherParticipant: { userId: string; name: string; image: string | null } | null;
};

function ConversationList({
	conversations,
	isLoading,
	activeId,
	onSelect,
}: {
	conversations: ConversationSummary[];
	isLoading: boolean;
	activeId: string | undefined;
	onSelect: (id: string) => void;
}) {
	if (isLoading) {
		return (
			<div className="space-y-2 p-3">
				{Array.from({ length: 5 }).map((_, i) => (
					<div key={`conv-skel-${i}`} className="flex items-center gap-3 rounded-lg p-2">
						<Skeleton className="size-10 rounded-full" />
						<div className="flex-1 space-y-1.5">
							<Skeleton className="h-4 w-28" />
							<Skeleton className="h-3 w-40" />
						</div>
					</div>
				))}
			</div>
		);
	}

	if (conversations.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center gap-2 p-8 text-center text-muted-foreground">
				<ChatsCircleIcon className="size-10 opacity-40" />
				<p className="font-medium text-sm">
					<Trans>Aucune conversation</Trans>
				</p>
				<p className="text-xs">
					<Trans>Vos conversations apparaîtront ici.</Trans>
				</p>
			</div>
		);
	}

	return (
		<ScrollArea className="h-full">
			<ul className="divide-y">
				{conversations.map((conv) => {
					const name = conv.otherParticipant?.name ?? t`Utilisateur`;
					const isActive = conv.conversationId === activeId;
					return (
						<li key={conv.conversationId}>
							<button
								type="button"
								onClick={() => onSelect(conv.conversationId)}
								className={cn(
									"flex w-full items-start gap-3 p-3 text-left transition-colors hover:bg-muted/60",
									isActive && "bg-muted",
								)}
							>
								<Avatar className="size-10 shrink-0">
									<AvatarImage src={conv.otherParticipant?.image ?? undefined} />
									<AvatarFallback className="bg-primary/10 text-primary text-xs">{getInitials(name)}</AvatarFallback>
								</Avatar>
								<div className="min-w-0 flex-1">
									<div className="flex items-center justify-between gap-2">
										<span className="truncate font-medium text-sm">{name}</span>
										<span className="shrink-0 text-[10px] text-muted-foreground">{formatTime(conv.lastMessageAt)}</span>
									</div>
									<div className="flex items-center justify-between gap-2">
										<p className="truncate text-muted-foreground text-xs">
											{conv.lastMessageFromMe && <Trans>Vous : </Trans>}
											{conv.lastMessagePreview ?? ""}
										</p>
										{conv.unreadCount > 0 && (
											<Badge className="size-5 shrink-0 justify-center rounded-full p-0 text-[10px]">
												{conv.unreadCount > 9 ? "9+" : conv.unreadCount}
											</Badge>
										)}
									</div>
								</div>
							</button>
						</li>
					);
				})}
			</ul>
		</ScrollArea>
	);
}

function MessageThread({ conversationId }: { conversationId: string }) {
	const { data: session } = authClient.useSession();
	const queryClient = useQueryClient();
	const myUserId = session?.user?.id;
	const [draft, setDraft] = useState("");
	const scrollEndRef = useRef<HTMLDivElement>(null);

	const {
		data: conversation,
		isLoading,
		isError,
	} = useQuery({
		...orpc.messaging.getConversation.queryOptions({ input: { conversationId } }),
		enabled: !!session?.user,
		refetchInterval: POLL_THREAD_MS,
	});

	const sendMutation = useMutation(orpc.messaging.sendMessage.mutationOptions());

	const messages = conversation?.messages ?? [];

	// biome-ignore lint/correctness/useExhaustiveDependencies: scroll on new message count
	useEffect(() => {
		scrollEndRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages.length]);

	const other = useMemo(
		() => conversation?.participants.find((p) => p.userId !== myUserId),
		[conversation?.participants, myUserId],
	);

	const handleSend = async () => {
		const body = draft.trim();
		if (body.length === 0) return;
		try {
			await sendMutation.mutateAsync({ conversationId, body });
			setDraft("");
			await queryClient.invalidateQueries({
				queryKey: orpc.messaging.getConversation.queryKey({ input: { conversationId } }),
			});
			await queryClient.invalidateQueries({ queryKey: orpc.messaging.listMyConversations.queryKey() });
			await queryClient.invalidateQueries({ queryKey: orpc.messaging.getUnreadCount.queryKey() });
		} catch {
			toast.error(t`Échec de l'envoi du message`);
		}
	};

	if (isLoading) {
		return (
			<div className="flex h-full flex-col gap-3 p-4">
				<Skeleton className="h-6 w-40" />
				<div className="flex-1 space-y-3">
					{Array.from({ length: 4 }).map((_, i) => (
						<Skeleton key={`msg-skel-${i}`} className={cn("h-12 w-2/3 rounded-lg", i % 2 === 1 && "ml-auto")} />
					))}
				</div>
			</div>
		);
	}

	if (isError) {
		return (
			<div className="flex h-full items-center justify-center p-8 text-center text-muted-foreground">
				<p className="text-sm">
					<Trans>Impossible de charger cette conversation.</Trans>
				</p>
			</div>
		);
	}

	return (
		<div className="flex h-full flex-col">
			{/* Thread header */}
			<div className="flex items-center gap-3 border-b p-3">
				<Avatar className="size-9">
					<AvatarImage src={other?.image ?? undefined} />
					<AvatarFallback className="bg-primary/10 text-primary text-xs">
						{getInitials(other?.name ?? "?")}
					</AvatarFallback>
				</Avatar>
				<div className="min-w-0">
					<p className="truncate font-medium text-sm">{other?.name ?? t`Utilisateur`}</p>
					{conversation?.subject && <p className="truncate text-muted-foreground text-xs">{conversation.subject}</p>}
				</div>
			</div>

			{/* Messages */}
			<ScrollArea className="flex-1">
				<div className="flex flex-col gap-3 p-4">
					{messages.length === 0 ? (
						<p className="py-8 text-center text-muted-foreground text-sm">
							<Trans>Aucun message pour l'instant.</Trans>
						</p>
					) : (
						messages.map((m) => {
							const mine = m.senderUserId === myUserId;
							return (
								<div key={m.id} className={cn("flex flex-col", mine ? "items-end" : "items-start")}>
									<div
										className={cn(
											"max-w-[75%] whitespace-pre-wrap break-words rounded-2xl px-3 py-2 text-sm",
											mine ? "bg-primary text-primary-foreground" : "bg-muted text-foreground",
										)}
									>
										{/* Plain text only — never rendered as HTML (XSS-safe). */}
										{m.body}
									</div>
									<span className="mt-1 text-[10px] text-muted-foreground">{formatTime(m.createdAt)}</span>
								</div>
							);
						})
					)}
					<div ref={scrollEndRef} />
				</div>
			</ScrollArea>

			{/* Composer */}
			<div className="border-t p-3">
				<div className="flex items-end gap-2">
					<Textarea
						value={draft}
						onChange={(e) => setDraft(e.target.value)}
						onKeyDown={(e) => {
							if (e.key === "Enter" && !e.shiftKey) {
								e.preventDefault();
								handleSend();
							}
						}}
						placeholder={t`Écrivez votre message...`}
						maxLength={5000}
						rows={2}
						className="min-h-[44px] resize-none"
					/>
					<Button
						type="button"
						size="icon"
						onClick={handleSend}
						disabled={sendMutation.isPending || draft.trim().length === 0}
						aria-label={t`Envoyer`}
					>
						<PaperPlaneTiltIcon className="size-4" />
					</Button>
				</div>
			</div>
		</div>
	);
}

function MessagesPage() {
	const navigate = useNavigate();
	const { data: session } = authClient.useSession();
	const { conversation: activeId } = Route.useSearch() as SearchParams;

	const { data: conversations = [], isLoading } = useQuery({
		...orpc.messaging.listMyConversations.queryOptions(),
		enabled: !!session?.user,
		refetchInterval: POLL_CONVERSATIONS_MS,
	});

	const selectConversation = (id: string) => {
		navigate({
			// biome-ignore lint/suspicious/noExplicitAny: route path not in generated tree
			to: "/dashboard/messages" as any,
			// biome-ignore lint/suspicious/noExplicitAny: search params not in generated tree
			search: { conversation: id } as any,
		});
	};

	return (
		<div className="mx-auto w-full max-w-6xl space-y-4 p-4 md:p-6">
			<DashboardHeader title={t`Messages`} icon={ChatsCircleIcon} />

			<Card className="overflow-hidden">
				<CardContent className="grid h-[70vh] grid-cols-1 p-0 md:grid-cols-[320px_1fr]">
					{/* Conversation list */}
					<div className={cn("h-full border-r", activeId && "hidden md:block")}>
						<ConversationList
							conversations={conversations as ConversationSummary[]}
							isLoading={isLoading}
							activeId={activeId}
							onSelect={selectConversation}
						/>
					</div>

					{/* Active thread */}
					<div className={cn("h-full", !activeId && "hidden md:block")}>
						{activeId ? (
							<MessageThread conversationId={activeId} />
						) : (
							<div className="flex h-full flex-col items-center justify-center gap-2 p-8 text-center text-muted-foreground">
								<UserCircleIcon className="size-12 opacity-30" />
								<p className="font-medium text-sm">
									<Trans>Sélectionnez une conversation</Trans>
								</p>
								<p className="text-xs">
									<Trans>Choisissez une conversation pour afficher les messages.</Trans>
								</p>
							</div>
						)}
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
