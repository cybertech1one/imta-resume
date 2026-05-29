import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { HeadsetIcon, MagnifyingGlassIcon, PaperPlaneTiltIcon, WarningCircleIcon } from "@phosphor-icons/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { orpc } from "@/integrations/orpc/client";
import { DashboardHeader } from "../../-components/header";
import {
	categoryLabel,
	formatDateTime,
	PRIORITY_OPTIONS,
	priorityBadgeClass,
	priorityLabel,
	STATUS_OPTIONS,
	statusBadgeClass,
	statusLabel,
	type TicketPriority,
	type TicketStatus,
} from "../../support/-components/support-config";

export const Route = createFileRoute("/dashboard/admin/support/")({
	component: AdminSupportPage,
	errorComponent: ({ error, reset }) => (
		<div className="space-y-4">
			<DashboardHeader icon={HeadsetIcon} title={t`Gestion du support`} />
			<div className="flex flex-col items-center justify-center rounded-xl border bg-background p-8">
				<WarningCircleIcon className="size-12 text-destructive" />
				<p className="mt-4 text-muted-foreground">{error.message}</p>
				<Button onClick={reset} className="mt-4">
					<Trans>Réessayer</Trans>
				</Button>
			</div>
		</div>
	),
});

const STATUS_FILTER_ALL = "all";

function AdminSupportPage() {
	const [statusFilter, setStatusFilter] = useState<string>(STATUS_FILTER_ALL);
	const [searchInput, setSearchInput] = useState("");
	const [search, setSearch] = useState("");
	const [page, setPage] = useState(1);
	const [openTicketId, setOpenTicketId] = useState<string | null>(null);

	const listQuery = useQuery(
		orpc.support.listAllTickets.queryOptions({
			input: {
				status: statusFilter === STATUS_FILTER_ALL ? undefined : (statusFilter as TicketStatus),
				search: search || undefined,
				page,
			},
		}),
	);

	const counts = listQuery.data?.counts;
	const tickets = listQuery.data?.tickets ?? [];
	const total = listQuery.data?.total ?? 0;
	const pageSize = listQuery.data?.pageSize ?? 20;
	const totalPages = Math.max(1, Math.ceil(total / pageSize));

	const handleSearch = (e: React.FormEvent) => {
		e.preventDefault();
		setPage(1);
		setSearch(searchInput.trim());
	};

	return (
		<>
			<DashboardHeader
				icon={HeadsetIcon}
				title={t`Gestion du support`}
				subtitle={t`Consultez et traitez toutes les demandes des utilisateurs.`}
			/>

			{/* Status count badges */}
			<div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
				<StatCard label={t`Total`} value={counts?.total} />
				<StatCard label={statusLabel("open")} value={counts?.open} />
				<StatCard label={statusLabel("in_progress")} value={counts?.in_progress} />
				<StatCard label={statusLabel("resolved")} value={counts?.resolved} />
				<StatCard label={statusLabel("closed")} value={counts?.closed} />
			</div>

			<Card>
				<CardContent className="space-y-4 pt-6">
					{/* Filters */}
					<div className="flex flex-col gap-3 sm:flex-row sm:items-center">
						<form onSubmit={handleSearch} className="flex flex-1 gap-2">
							<Input
								value={searchInput}
								onChange={(e) => setSearchInput(e.target.value)}
								placeholder={t`Rechercher par sujet, nom ou e-mail…`}
							/>
							<Button type="submit" variant="outline">
								<MagnifyingGlassIcon className="size-4" />
								<Trans>Rechercher</Trans>
							</Button>
						</form>
						<Select
							value={statusFilter}
							onValueChange={(v) => {
								setStatusFilter(v);
								setPage(1);
							}}
						>
							<SelectTrigger className="w-full sm:w-48">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value={STATUS_FILTER_ALL}>{t`Tous les statuts`}</SelectItem>
								{STATUS_OPTIONS.map((opt) => (
									<SelectItem key={opt.value} value={opt.value}>
										{opt.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					{/* Tickets table */}
					<div className="overflow-x-auto rounded-lg border">
						<Table className="min-w-[800px]">
							<TableHeader>
								<TableRow>
									<TableHead>
										<Trans>Sujet</Trans>
									</TableHead>
									<TableHead>
										<Trans>Utilisateur</Trans>
									</TableHead>
									<TableHead>
										<Trans>Catégorie</Trans>
									</TableHead>
									<TableHead>
										<Trans>Statut</Trans>
									</TableHead>
									<TableHead>
										<Trans>Priorité</Trans>
									</TableHead>
									<TableHead>
										<Trans>Dernière activité</Trans>
									</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{listQuery.isLoading ? (
									[0, 1, 2, 3, 4].map((i) => (
										<TableRow key={i}>
											<TableCell colSpan={6}>
												<Skeleton className="h-6 w-full" />
											</TableCell>
										</TableRow>
									))
								) : tickets.length === 0 ? (
									<TableRow>
										<TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
											<Trans>Aucune demande trouvée.</Trans>
										</TableCell>
									</TableRow>
								) : (
									tickets.map((ticket) => (
										<TableRow key={ticket.id} className="cursor-pointer" onClick={() => setOpenTicketId(ticket.id)}>
											<TableCell className="max-w-[260px] truncate font-medium">{ticket.subject}</TableCell>
											<TableCell>
												<div className="flex flex-col">
													<span className="text-sm">{ticket.userName}</span>
													<span className="text-muted-foreground text-xs">{ticket.userEmail}</span>
												</div>
											</TableCell>
											<TableCell className="text-sm">{categoryLabel(ticket.category)}</TableCell>
											<TableCell>
												<Badge variant="outline" className={statusBadgeClass(ticket.status)}>
													{statusLabel(ticket.status)}
												</Badge>
											</TableCell>
											<TableCell>
												<Badge variant="outline" className={priorityBadgeClass(ticket.priority)}>
													{priorityLabel(ticket.priority)}
												</Badge>
											</TableCell>
											<TableCell className="text-muted-foreground text-sm">
												{formatDateTime(ticket.lastMessageAt)}
											</TableCell>
										</TableRow>
									))
								)}
							</TableBody>
						</Table>
					</div>

					{/* Pagination */}
					<div className="flex items-center justify-between">
						<span className="text-muted-foreground text-sm">
							<Trans>
								Page {page} sur {totalPages}
							</Trans>
						</span>
						<div className="flex gap-2">
							<Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
								<Trans>Précédent</Trans>
							</Button>
							<Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
								<Trans>Suivant</Trans>
							</Button>
						</div>
					</div>
				</CardContent>
			</Card>

			<AdminTicketDialog ticketId={openTicketId} onClose={() => setOpenTicketId(null)} />
		</>
	);
}

function StatCard({ label, value }: { label: string; value?: number }) {
	return (
		<div className="rounded-lg border bg-background p-3">
			<div className="text-muted-foreground text-xs">{label}</div>
			<div className="font-bold text-2xl">{value ?? "—"}</div>
		</div>
	);
}

function AdminTicketDialog({ ticketId, onClose }: { ticketId: string | null; onClose: () => void }) {
	const queryClient = useQueryClient();
	const [reply, setReply] = useState("");

	const threadQuery = useQuery({
		...orpc.support.getTicket.queryOptions({ input: { ticketId: ticketId ?? "" } }),
		enabled: !!ticketId,
	});

	const invalidate = () => {
		if (ticketId) {
			queryClient.invalidateQueries({ queryKey: orpc.support.getTicket.key({ input: { ticketId } }) });
		}
		queryClient.invalidateQueries({ queryKey: orpc.support.listAllTickets.key() });
	};

	const replyMutation = useMutation({
		...orpc.support.replyToTicket.mutationOptions(),
		onSuccess: () => {
			setReply("");
			invalidate();
		},
		onError: (error) => toast.error(error.message || t`Échec de l'envoi.`),
	});

	const updateMutation = useMutation({
		...orpc.support.updateTicket.mutationOptions(),
		onSuccess: () => {
			toast.success(t`Demande mise à jour.`);
			invalidate();
		},
		onError: (error) => toast.error(error.message || t`Échec de la mise à jour.`),
	});

	const ticket = threadQuery.data?.ticket;
	const messages = threadQuery.data?.messages ?? [];

	const handleReply = (e: React.FormEvent) => {
		e.preventDefault();
		if (!ticketId || reply.trim().length < 1) return;
		replyMutation.mutate({ ticketId, body: reply.trim() });
	};

	return (
		<Dialog open={!!ticketId} onOpenChange={(open) => !open && onClose()}>
			<DialogContent className="flex max-h-[88vh] max-w-3xl flex-col">
				<DialogHeader>
					<DialogTitle className="line-clamp-2 pr-6">{ticket?.subject ?? t`Demande`}</DialogTitle>
					<DialogDescription>
						{ticket ? `${ticket.userName} · ${ticket.userEmail} · ${categoryLabel(ticket.category)}` : ""}
					</DialogDescription>
				</DialogHeader>

				{/* Admin controls: status + priority */}
				{ticket && (
					<div className="grid grid-cols-2 gap-3 rounded-lg border bg-muted/30 p-3">
						<div className="space-y-1">
							<Label className="text-xs">
								<Trans>Statut</Trans>
							</Label>
							<Select
								value={ticket.status}
								onValueChange={(v) => ticketId && updateMutation.mutate({ ticketId, status: v as TicketStatus })}
							>
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									{STATUS_OPTIONS.map((opt) => (
										<SelectItem key={opt.value} value={opt.value}>
											{opt.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
						<div className="space-y-1">
							<Label className="text-xs">
								<Trans>Priorité</Trans>
							</Label>
							<Select
								value={ticket.priority}
								onValueChange={(v) => ticketId && updateMutation.mutate({ ticketId, priority: v as TicketPriority })}
							>
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									{PRIORITY_OPTIONS.map((opt) => (
										<SelectItem key={opt.value} value={opt.value}>
											{opt.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
					</div>
				)}

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
										? "ml-auto max-w-[85%] rounded-lg rounded-tr-sm bg-primary/10 p-3"
										: "mr-auto max-w-[85%] rounded-lg rounded-tl-sm border bg-muted p-3"
								}
							>
								<div className="mb-1 font-medium text-muted-foreground text-xs">
									{m.isAdmin ? t`Équipe support` : t`Utilisateur`} · {formatDateTime(m.createdAt)}
								</div>
								{/* Plain text rendering — XSS-safe. */}
								<p className="whitespace-pre-wrap break-words text-sm">{m.body}</p>
							</div>
						))
					)}
				</div>

				<form onSubmit={handleReply} className="space-y-2">
					<Textarea
						value={reply}
						onChange={(e) => setReply(e.target.value)}
						placeholder={t`Votre réponse à l'utilisateur…`}
						rows={3}
						maxLength={5000}
					/>
					<div className="flex justify-end">
						<Button type="submit" disabled={replyMutation.isPending || reply.trim().length < 1}>
							<PaperPlaneTiltIcon className="size-4" />
							<Trans>Répondre</Trans>
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
}
