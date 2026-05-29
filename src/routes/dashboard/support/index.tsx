import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { ChatCircleDotsIcon, HeadsetIcon, PaperPlaneTiltIcon, PlusIcon, XCircleIcon } from "@phosphor-icons/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { authClient } from "@/integrations/auth/client";
import { orpc } from "@/integrations/orpc/client";
import { DashboardHeader } from "../-components/header";
import {
	CATEGORY_OPTIONS,
	categoryLabel,
	formatDateTime,
	statusBadgeClass,
	statusLabel,
	type TicketCategory,
} from "./-components/support-config";

// biome-ignore lint/suspicious/noExplicitAny: Route path not in generated route tree
export const Route = createFileRoute("/dashboard/support/" as any)({
	component: SupportPage,
	errorComponent: ErrorComponent,
});

function SupportPage() {
	const { data: session } = authClient.useSession();
	const queryClient = useQueryClient();

	const [subject, setSubject] = useState("");
	const [category, setCategory] = useState<TicketCategory>("other");
	const [message, setMessage] = useState("");
	const [openTicketId, setOpenTicketId] = useState<string | null>(null);

	const ticketsQuery = useQuery({
		...orpc.support.listMyTickets.queryOptions(),
		enabled: !!session?.user,
	});

	const createMutation = useMutation({
		...orpc.support.createTicket.mutationOptions(),
		onSuccess: () => {
			toast.success(t`Votre demande a été envoyée. Notre équipe vous répondra bientôt.`);
			setSubject("");
			setCategory("other");
			setMessage("");
			queryClient.invalidateQueries({ queryKey: orpc.support.listMyTickets.key() });
		},
		onError: (error) => {
			toast.error(error.message || t`Une erreur est survenue. Veuillez réessayer.`);
		},
	});

	const handleCreate = (e: React.FormEvent) => {
		e.preventDefault();
		if (subject.trim().length < 3 || message.trim().length < 1) {
			toast.error(t`Veuillez renseigner un sujet et un message.`);
			return;
		}
		createMutation.mutate({ subject: subject.trim(), category, message: message.trim() });
	};

	const tickets = ticketsQuery.data ?? [];

	return (
		<>
			<DashboardHeader icon={HeadsetIcon} title={t`Support / Aide`} subtitle={t`Besoin d'aide ? Ouvrez une demande.`} />

			<div className="grid gap-6 lg:grid-cols-5">
				{/* New ticket form */}
				<Card className="lg:col-span-2">
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<PlusIcon className="size-5" />
							<Trans>Nouvelle demande</Trans>
						</CardTitle>
						<CardDescription>
							<Trans>Décrivez votre problème, nous vous répondrons dans les meilleurs délais.</Trans>
						</CardDescription>
					</CardHeader>
					<CardContent>
						<form onSubmit={handleCreate} className="space-y-4">
							<div className="space-y-2">
								<Label htmlFor="subject">
									<Trans>Sujet</Trans>
								</Label>
								<Input
									id="subject"
									value={subject}
									onChange={(e) => setSubject(e.target.value)}
									placeholder={t`Ex : Je n'arrive pas à télécharger mon CV`}
									maxLength={200}
									required
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor="category">
									<Trans>Catégorie</Trans>
								</Label>
								<Select value={category} onValueChange={(v) => setCategory(v as TicketCategory)}>
									<SelectTrigger id="category">
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										{CATEGORY_OPTIONS.map((opt) => (
											<SelectItem key={opt.value} value={opt.value}>
												{opt.label}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>

							<div className="space-y-2">
								<Label htmlFor="message">
									<Trans>Message</Trans>
								</Label>
								<Textarea
									id="message"
									value={message}
									onChange={(e) => setMessage(e.target.value)}
									placeholder={t`Décrivez votre demande en détail…`}
									rows={6}
									maxLength={5000}
									required
								/>
							</div>

							<Button type="submit" className="w-full" disabled={createMutation.isPending}>
								<PaperPlaneTiltIcon className="size-4" />
								<Trans>Envoyer la demande</Trans>
							</Button>
						</form>
					</CardContent>
				</Card>

				{/* My tickets list */}
				<Card className="lg:col-span-3">
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<ChatCircleDotsIcon className="size-5" />
							<Trans>Mes demandes</Trans>
						</CardTitle>
						<CardDescription>
							<Trans>Suivez l'état de vos demandes et consultez les réponses.</Trans>
						</CardDescription>
					</CardHeader>
					<CardContent>
						{ticketsQuery.isLoading ? (
							<div className="space-y-3">
								{[0, 1, 2].map((i) => (
									<Skeleton key={i} className="h-16 w-full rounded-lg" />
								))}
							</div>
						) : tickets.length === 0 ? (
							<div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-10 text-center">
								<ChatCircleDotsIcon className="size-10 text-muted-foreground" />
								<p className="mt-3 text-muted-foreground text-sm">
									<Trans>Vous n'avez aucune demande pour le moment.</Trans>
								</p>
							</div>
						) : (
							<ul className="space-y-3">
								{tickets.map((ticket) => (
									<li key={ticket.id}>
										<button
											type="button"
											onClick={() => setOpenTicketId(ticket.id)}
											className="flex w-full flex-col gap-2 rounded-lg border bg-background p-4 text-left transition-colors hover:bg-accent/50"
										>
											<div className="flex items-start justify-between gap-3">
												<span className="line-clamp-1 font-medium">{ticket.subject}</span>
												<Badge variant="outline" className={statusBadgeClass(ticket.status)}>
													{statusLabel(ticket.status)}
												</Badge>
											</div>
											<div className="flex items-center gap-2 text-muted-foreground text-xs">
												<span>{categoryLabel(ticket.category)}</span>
												<span>•</span>
												<span>{formatDateTime(ticket.lastMessageAt)}</span>
											</div>
										</button>
									</li>
								))}
							</ul>
						)}
					</CardContent>
				</Card>
			</div>

			<TicketThreadDialog ticketId={openTicketId} onClose={() => setOpenTicketId(null)} enabled={!!session?.user} />
		</>
	);
}

function TicketThreadDialog({
	ticketId,
	onClose,
	enabled,
}: {
	ticketId: string | null;
	onClose: () => void;
	enabled: boolean;
}) {
	const queryClient = useQueryClient();
	const [reply, setReply] = useState("");

	const threadQuery = useQuery({
		...orpc.support.getMyTicket.queryOptions({ input: { ticketId: ticketId ?? "" } }),
		enabled: enabled && !!ticketId,
	});

	const invalidate = () => {
		if (ticketId) {
			queryClient.invalidateQueries({ queryKey: orpc.support.getMyTicket.key({ input: { ticketId } }) });
		}
		queryClient.invalidateQueries({ queryKey: orpc.support.listMyTickets.key() });
	};

	const replyMutation = useMutation({
		...orpc.support.replyToMyTicket.mutationOptions(),
		onSuccess: () => {
			setReply("");
			invalidate();
		},
		onError: (error) => toast.error(error.message || t`Échec de l'envoi du message.`),
	});

	const closeMutation = useMutation({
		...orpc.support.closeMyTicket.mutationOptions(),
		onSuccess: () => {
			toast.success(t`Demande fermée.`);
			invalidate();
		},
		onError: (error) => toast.error(error.message || t`Échec de la fermeture.`),
	});

	const ticket = threadQuery.data?.ticket;
	const messages = threadQuery.data?.messages ?? [];
	const isClosed = ticket?.status === "closed";

	const handleReply = (e: React.FormEvent) => {
		e.preventDefault();
		if (!ticketId || reply.trim().length < 1) return;
		replyMutation.mutate({ ticketId, body: reply.trim() });
	};

	return (
		<Dialog open={!!ticketId} onOpenChange={(open) => !open && onClose()}>
			<DialogContent className="flex max-h-[85vh] max-w-2xl flex-col">
				<DialogHeader>
					<DialogTitle className="line-clamp-2 pr-6">{ticket?.subject ?? t`Demande`}</DialogTitle>
					<DialogDescription className="flex items-center gap-2">
						{ticket && (
							<Badge variant="outline" className={statusBadgeClass(ticket.status)}>
								{statusLabel(ticket.status)}
							</Badge>
						)}
						{ticket && <span>{categoryLabel(ticket.category)}</span>}
					</DialogDescription>
				</DialogHeader>

				<div className="flex-1 space-y-3 overflow-y-auto pr-1">
					{threadQuery.isLoading ? (
						<>
							<Skeleton className="h-16 w-3/4 rounded-lg" />
							<Skeleton className="ml-auto h-16 w-3/4 rounded-lg" />
						</>
					) : (
						messages.map((m) => (
							<div
								key={m.id}
								className={
									m.isAdmin
										? "mr-auto max-w-[85%] rounded-lg rounded-tl-sm border bg-muted p-3"
										: "ml-auto max-w-[85%] rounded-lg rounded-tr-sm bg-primary/10 p-3"
								}
							>
								<div className="mb-1 font-medium text-muted-foreground text-xs">
									{m.isAdmin ? t`Équipe support` : t`Vous`} · {formatDateTime(m.createdAt)}
								</div>
								{/* Plain text rendering — never dangerouslySetInnerHTML (XSS-safe). */}
								<p className="whitespace-pre-wrap break-words text-sm">{m.body}</p>
							</div>
						))
					)}
				</div>

				{isClosed ? (
					<div className="rounded-lg border border-dashed p-3 text-center text-muted-foreground text-sm">
						<Trans>Cette demande est fermée.</Trans>
					</div>
				) : (
					<form onSubmit={handleReply} className="space-y-2">
						<Textarea
							value={reply}
							onChange={(e) => setReply(e.target.value)}
							placeholder={t`Votre réponse…`}
							rows={3}
							maxLength={5000}
						/>
						<div className="flex justify-between gap-2">
							<Button
								type="button"
								variant="outline"
								onClick={() => ticketId && closeMutation.mutate({ ticketId })}
								disabled={closeMutation.isPending}
							>
								<XCircleIcon className="size-4" />
								<Trans>Fermer la demande</Trans>
							</Button>
							<Button type="submit" disabled={replyMutation.isPending || reply.trim().length < 1}>
								<PaperPlaneTiltIcon className="size-4" />
								<Trans>Envoyer</Trans>
							</Button>
						</div>
					</form>
				)}

				<DialogFooter className="sm:hidden">
					<Button variant="ghost" onClick={onClose}>
						<Trans>Fermer</Trans>
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
