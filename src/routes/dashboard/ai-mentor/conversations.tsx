import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { ArchiveIcon, ChatCircleDotsIcon, ClockIcon, PlusIcon, TrashIcon } from "@phosphor-icons/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale/fr";
import { motion } from "motion/react";
import { useState } from "react";
import { ErrorComponent } from "@/components/error-component";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { authClient } from "@/integrations/auth/client";
import { orpc } from "@/integrations/orpc/client";
import { cn } from "@/utils/style";

import { DashboardHeader } from "../-components/header";

// biome-ignore lint/suspicious/noExplicitAny: Route path not in generated route tree
export const Route = createFileRoute("/dashboard/ai-mentor/conversations" as any)({
	component: ConversationsPage,
	errorComponent: ErrorComponent,
});

interface ConversationMessage {
	role: "user" | "assistant" | "system";
	content: string;
	timestamp: string;
}

interface Conversation {
	id: string;
	mentorId: string;
	mentorName?: string;
	title: string | null;
	messages: ConversationMessage[];
	isArchived: boolean;
	createdAt: Date;
	updatedAt: Date;
}

function ConversationsPage() {
	const { data: session } = authClient.useSession();
	const queryClient = useQueryClient();
	const [deleteDialog, setDeleteDialog] = useState<string | null>(null);
	const [viewConversation, setViewConversation] = useState<Conversation | null>(null);

	const { data: conversations, isLoading } = useQuery({
		queryKey: ["ai-mentor", "conversations", "all"],
		queryFn: () => orpc.aiMentor.conversations.list.call({}),
		enabled: !!session?.user,
	});

	const archiveMutation = useMutation({
		mutationFn: (id: string) => orpc.aiMentor.conversations.archive.call({ id }),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: ["ai-mentor", "conversations"] }),
	});

	const deleteMutation = useMutation({
		mutationFn: (id: string) => orpc.aiMentor.conversations.delete.call({ id }),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["ai-mentor", "conversations"] });
			setDeleteDialog(null);
		},
	});

	const activeConversations = conversations?.filter((c) => !c.isArchived) || [];
	const archivedConversations = conversations?.filter((c) => c.isArchived) || [];

	return (
		<div className="min-h-screen">
			<DashboardHeader icon={ChatCircleDotsIcon} title={t`Historique des conversations`} />

			<div className="container mx-auto space-y-8 px-4 py-6">
				{/* Quick Actions */}
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						<Badge variant="secondary">
							{activeConversations.length} <Trans>actives</Trans>
						</Badge>
						<Badge variant="outline">
							{archivedConversations.length} <Trans>archivées</Trans>
						</Badge>
					</div>
					<Button asChild>
						<Link to="/dashboard/ai-mentor">
							<PlusIcon className="mr-2 h-4 w-4" />
							<Trans>Nouvelle conversation</Trans>
						</Link>
					</Button>
				</div>

				{/* Active Conversations */}
				<section className="space-y-4">
					<h2 className="font-semibold text-xl">
						<Trans>Conversations actives</Trans>
					</h2>

					{isLoading ? (
						<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
							{[1, 2, 3].map((i) => (
								<Card key={i}>
									<CardHeader>
										<Skeleton className="h-5 w-32" />
										<Skeleton className="h-4 w-24" />
									</CardHeader>
									<CardContent>
										<Skeleton className="h-12 w-full" />
									</CardContent>
								</Card>
							))}
						</div>
					) : activeConversations.length === 0 ? (
						<Card className="flex flex-col items-center justify-center p-8">
							<ChatCircleDotsIcon className="mb-4 h-12 w-12 text-muted-foreground/50" />
							<h3 className="font-medium text-lg">
								<Trans>Aucune conversation</Trans>
							</h3>
							<p className="mb-4 text-muted-foreground text-sm">
								<Trans>Commencez à discuter avec un mentor pour voir vos conversations ici</Trans>
							</p>
							<Button asChild>
								<Link to="/dashboard/ai-mentor">
									<Trans>Trouver un mentor</Trans>
								</Link>
							</Button>
						</Card>
					) : (
						<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
							{activeConversations.map((conv) => {
								const lastMessage = (conv.messages as ConversationMessage[])?.slice(-1)[0];
								return (
									<motion.div
										key={conv.id}
										initial={false}
										animate={{ opacity: 1, y: 0 }}
										whileHover={{ scale: 1.02 }}
										transition={{ duration: 0.2 }}
									>
										<Card
											className="cursor-pointer transition-shadow hover:shadow-lg"
											onClick={() => setViewConversation(conv as Conversation)}
										>
											<CardHeader className="pb-2">
												<div className="flex items-center justify-between">
													<CardTitle className="line-clamp-1 text-base">{conv.title || t`Conversation`}</CardTitle>
													<div className="flex gap-1">
														<Button
															variant="ghost"
															size="icon"
															className="h-7 w-7"
															onClick={(e) => {
																e.stopPropagation();
																archiveMutation.mutate(conv.id);
															}}
														>
															<ArchiveIcon className="h-4 w-4" />
														</Button>
														<Button
															variant="ghost"
															size="icon"
															className="h-7 w-7 text-destructive"
															onClick={(e) => {
																e.stopPropagation();
																setDeleteDialog(conv.id);
															}}
														>
															<TrashIcon className="h-4 w-4" />
														</Button>
													</div>
												</div>
												<CardDescription className="flex items-center gap-1">
													<ClockIcon className="h-3 w-3" />
													{formatDistanceToNow(new Date(conv.updatedAt), {
														addSuffix: true,
														locale: fr,
													})}
												</CardDescription>
											</CardHeader>
											<CardContent>
												{lastMessage && (
													<p className="line-clamp-2 text-muted-foreground text-sm">{lastMessage.content}</p>
												)}
												<Badge variant="outline" className="mt-2">
													{(conv.messages as ConversationMessage[])?.length || 0} <Trans>messages</Trans>
												</Badge>
											</CardContent>
										</Card>
									</motion.div>
								);
							})}
						</div>
					)}
				</section>

				{/* Archived Conversations */}
				{archivedConversations.length > 0 && (
					<section className="space-y-4">
						<h2 className="font-semibold text-muted-foreground text-xl">
							<Trans>Archivées</Trans>
						</h2>
						<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
							{archivedConversations.map((conv) => (
								<Card
									key={conv.id}
									className="cursor-pointer opacity-60 transition-opacity hover:opacity-100"
									onClick={() => setViewConversation(conv as Conversation)}
								>
									<CardHeader className="pb-2">
										<CardTitle className="line-clamp-1 text-base">{conv.title || t`Conversation`}</CardTitle>
										<CardDescription>
											{formatDistanceToNow(new Date(conv.updatedAt), {
												addSuffix: true,
												locale: fr,
											})}
										</CardDescription>
									</CardHeader>
									<CardContent>
										<Badge variant="secondary">
											{(conv.messages as ConversationMessage[])?.length || 0} <Trans>messages</Trans>
										</Badge>
									</CardContent>
								</Card>
							))}
						</div>
					</section>
				)}
			</div>

			{/* View Conversation Dialog */}
			<Dialog open={!!viewConversation} onOpenChange={() => setViewConversation(null)}>
				<DialogContent className="max-h-[80vh] max-w-2xl">
					<DialogHeader>
						<DialogTitle>{viewConversation?.title || t`Conversation`}</DialogTitle>
						<DialogDescription>
							{viewConversation?.createdAt &&
								formatDistanceToNow(new Date(viewConversation.createdAt), {
									addSuffix: true,
									locale: fr,
								})}
						</DialogDescription>
					</DialogHeader>
					<ScrollArea className="h-[400px] pr-4">
						<div className="space-y-4">
							{viewConversation?.messages.map((msg, idx) => (
								<div key={idx} className={cn("flex", msg.role === "user" ? "justify-end" : "justify-start")}>
									<div
										className={cn(
											"max-w-[80%] rounded-lg p-3",
											msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted",
										)}
									>
										<p className="whitespace-pre-wrap text-sm">{msg.content}</p>
										<p className="mt-1 text-xs opacity-70">
											{formatDistanceToNow(new Date(msg.timestamp), {
												addSuffix: true,
												locale: fr,
											})}
										</p>
									</div>
								</div>
							))}
						</div>
					</ScrollArea>
					<DialogFooter>
						<Button variant="outline" onClick={() => setViewConversation(null)}>
							<Trans>Fermer</Trans>
						</Button>
						<Button asChild>
							<Link to="/dashboard/ai-mentor">
								<Trans>Continuer la discussion</Trans>
							</Link>
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Delete Confirmation Dialog */}
			<Dialog open={!!deleteDialog} onOpenChange={() => setDeleteDialog(null)}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>
							<Trans>Supprimer la conversation</Trans>
						</DialogTitle>
						<DialogDescription>
							<Trans>Êtes-vous sûr de vouloir supprimer cette conversation ? Cette action est irréversible.</Trans>
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button variant="outline" onClick={() => setDeleteDialog(null)}>
							<Trans>Annuler</Trans>
						</Button>
						<Button variant="destructive" onClick={() => deleteDialog && deleteMutation.mutate(deleteDialog)}>
							<Trans>Supprimer</Trans>
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
