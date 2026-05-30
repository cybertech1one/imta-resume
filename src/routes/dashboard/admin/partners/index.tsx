import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import {
	BuildingsIcon,
	CheckIcon,
	CopyIcon,
	PauseIcon,
	PlusIcon,
	ProhibitIcon,
	WarningCircleIcon,
	XIcon,
} from "@phosphor-icons/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { orpc } from "@/integrations/orpc/client";
import { DashboardHeader } from "../../-components/header";

// biome-ignore lint/suspicious/noExplicitAny: Route path not in generated route tree yet
export const Route = createFileRoute("/dashboard/admin/partners/" as any)({
	component: AdminPartnersPage,
	errorComponent: ({ error, reset }: { error: Error; reset: () => void }) => (
		<div className="space-y-4">
			<DashboardHeader icon={BuildingsIcon} title={t`Gestion des partenaires`} />
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

const PARTNER_TYPE_OPTIONS = [
	{ value: "employer", label: t`Employeur` },
	{ value: "recruiter", label: t`Recruteur` },
	{ value: "training_center", label: t`Centre de formation` },
	{ value: "government", label: t`Gouvernement` },
	{ value: "ngo", label: t`ONG` },
] as const;

function PartnerStatusBadge({ status }: { status: string }) {
	const variants: Record<string, { label: string; className: string }> = {
		approved: { label: t`Approuvé`, className: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" },
		pending: {
			label: t`En attente`,
			className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
		},
		rejected: { label: t`Rejeté`, className: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" },
		suspended: {
			label: t`Suspendu`,
			className: "bg-neutral-200 text-neutral-800 dark:bg-neutral-700 dark:text-neutral-200",
		},
	};
	const v = variants[status] ?? variants.pending;
	return <Badge className={v.className}>{v.label}</Badge>;
}

function InviteStatusBadge({ status }: { status: string }) {
	const variants: Record<string, { label: string; className: string }> = {
		pending: { label: t`En attente`, className: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" },
		accepted: { label: t`Acceptée`, className: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" },
		revoked: { label: t`Révoquée`, className: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" },
		expired: { label: t`Expirée`, className: "bg-neutral-200 text-neutral-800 dark:bg-neutral-700" },
	};
	const v = variants[status] ?? variants.pending;
	return (
		<Badge variant="outline" className={v.className}>
			{v.label}
		</Badge>
	);
}

function copyToClipboard(text: string) {
	navigator.clipboard.writeText(text).then(
		() => toast.success(t`Lien copié dans le presse-papiers`),
		() => toast.error(t`Impossible de copier le lien`),
	);
}

function AdminPartnersPage() {
	const queryClient = useQueryClient();
	const [inviteOpen, setInviteOpen] = useState(false);
	const [inviteEmail, setInviteEmail] = useState("");
	const [inviteCompany, setInviteCompany] = useState("");
	const [inviteType, setInviteType] = useState("employer");
	const [createdLink, setCreatedLink] = useState<string | null>(null);

	// Suspend / reject reason dialog
	const [actionTarget, setActionTarget] = useState<{
		id: string;
		kind: "reject" | "suspend";
		company: string;
	} | null>(null);
	const [actionReason, setActionReason] = useState("");

	const partnersQuery = useQuery(orpc.partner.listPartners.queryOptions({ input: {} }));
	const invitesQuery = useQuery(orpc.partner.listInvites.queryOptions({ input: {} }));

	const invalidate = () => {
		queryClient.invalidateQueries({ queryKey: orpc.partner.listPartners.key() });
		queryClient.invalidateQueries({ queryKey: orpc.partner.listInvites.key() });
	};

	const inviteMutation = useMutation({
		...orpc.partner.invitePartner.mutationOptions(),
		onSuccess: (data) => {
			setCreatedLink(data.inviteLink);
			toast.success(
				data.emailSent
					? t`Invitation envoyée par email et lien généré`
					: t`Invitation créée — copiez le lien ci-dessous`,
			);
			setInviteEmail("");
			setInviteCompany("");
			invalidate();
		},
		onError: (error: Error) => toast.error(error.message),
	});

	const revokeMutation = useMutation({
		...orpc.partner.revokeInvite.mutationOptions(),
		onSuccess: () => {
			toast.success(t`Invitation révoquée`);
			invalidate();
		},
		onError: (error: Error) => toast.error(error.message),
	});

	const approveMutation = useMutation({
		...orpc.partner.approvePartner.mutationOptions(),
		onSuccess: () => {
			toast.success(t`Partenaire approuvé`);
			invalidate();
		},
		onError: (error: Error) => toast.error(error.message),
	});

	const rejectMutation = useMutation({
		...orpc.partner.rejectPartner.mutationOptions(),
		onSuccess: () => {
			toast.success(t`Partenaire rejeté`);
			setActionTarget(null);
			setActionReason("");
			invalidate();
		},
		onError: (error: Error) => toast.error(error.message),
	});

	const suspendMutation = useMutation({
		...orpc.partner.suspendPartner.mutationOptions(),
		onSuccess: () => {
			toast.success(t`Partenaire suspendu et déconnecté`);
			setActionTarget(null);
			setActionReason("");
			invalidate();
		},
		onError: (error: Error) => toast.error(error.message),
	});

	const partners = partnersQuery.data?.partners ?? [];
	const invites = invitesQuery.data ?? [];
	const pendingInvites = invites.filter((i) => i.status === "pending");

	return (
		<div className="space-y-6">
			<DashboardHeader
				icon={BuildingsIcon}
				title={t`Gestion des partenaires`}
				subtitle={t`Invitez des entreprises et gérez leurs accès partenaires`}
				rightContent={
					<Button
						onClick={() => {
							setCreatedLink(null);
							setInviteOpen(true);
						}}
						className="gap-2"
					>
						<PlusIcon className="size-4" />
						<Trans>Inviter un partenaire</Trans>
					</Button>
				}
			/>

			{/* Partners table */}
			<Card>
				<CardHeader>
					<CardTitle className="text-base">
						<Trans>Partenaires</Trans>
					</CardTitle>
				</CardHeader>
				<CardContent>
					{partnersQuery.isPending ? (
						<div className="space-y-2">
							{Array.from({ length: 3 }).map((_, i) => (
								<Skeleton key={`p-skel-${i}`} className="h-12 w-full" />
							))}
						</div>
					) : partners.length === 0 ? (
						<p className="py-8 text-center text-muted-foreground text-sm">
							<Trans>Aucun partenaire pour le moment.</Trans>
						</p>
					) : (
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>
										<Trans>Entreprise</Trans>
									</TableHead>
									<TableHead>
										<Trans>Type</Trans>
									</TableHead>
									<TableHead>
										<Trans>Statut</Trans>
									</TableHead>
									<TableHead className="text-right">
										<Trans>Actions</Trans>
									</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{partners.map((p) => (
									<TableRow key={p.id}>
										<TableCell className="font-medium">{p.companyNameFr || p.companyName}</TableCell>
										<TableCell className="text-muted-foreground">{p.partnerType}</TableCell>
										<TableCell>
											<PartnerStatusBadge status={p.status} />
										</TableCell>
										<TableCell>
											<div className="flex justify-end gap-1.5">
												{p.status === "pending" && (
													<Button
														size="sm"
														variant="outline"
														className="gap-1 text-green-700"
														disabled={approveMutation.isPending}
														onClick={() => approveMutation.mutate({ id: p.id })}
													>
														<CheckIcon className="size-3.5" />
														<Trans>Approuver</Trans>
													</Button>
												)}
												{(p.status === "pending" || p.status === "approved") && (
													<Button
														size="sm"
														variant="outline"
														className="gap-1 text-red-700"
														onClick={() =>
															setActionTarget({
																id: p.id,
																kind: "reject",
																company: p.companyNameFr || p.companyName,
															})
														}
													>
														<XIcon className="size-3.5" />
														<Trans>Rejeter</Trans>
													</Button>
												)}
												{p.status !== "suspended" && (
													<Button
														size="sm"
														variant="outline"
														className="gap-1"
														onClick={() =>
															setActionTarget({
																id: p.id,
																kind: "suspend",
																company: p.companyNameFr || p.companyName,
															})
														}
													>
														<PauseIcon className="size-3.5" />
														<Trans>Suspendre</Trans>
													</Button>
												)}
											</div>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					)}
				</CardContent>
			</Card>

			{/* Pending invitations */}
			<Card>
				<CardHeader>
					<CardTitle className="text-base">
						<Trans>Invitations en attente</Trans>
					</CardTitle>
				</CardHeader>
				<CardContent>
					{invitesQuery.isPending ? (
						<Skeleton className="h-24 w-full" />
					) : pendingInvites.length === 0 ? (
						<p className="py-6 text-center text-muted-foreground text-sm">
							<Trans>Aucune invitation en attente.</Trans>
						</p>
					) : (
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>
										<Trans>Email</Trans>
									</TableHead>
									<TableHead>
										<Trans>Entreprise</Trans>
									</TableHead>
									<TableHead>
										<Trans>Statut</Trans>
									</TableHead>
									<TableHead className="text-right">
										<Trans>Actions</Trans>
									</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{pendingInvites.map((inv) => (
									<TableRow key={inv.id}>
										<TableCell>{inv.email}</TableCell>
										<TableCell>{inv.companyNameFr || inv.companyName}</TableCell>
										<TableCell>
											<InviteStatusBadge status={inv.status} />
										</TableCell>
										<TableCell>
											<div className="flex justify-end gap-1.5">
												<Button
													size="sm"
													variant="outline"
													className="gap-1"
													onClick={() => copyToClipboard(inv.inviteLink)}
												>
													<CopyIcon className="size-3.5" />
													<Trans>Copier le lien</Trans>
												</Button>
												<Button
													size="sm"
													variant="outline"
													className="gap-1 text-red-700"
													disabled={revokeMutation.isPending}
													onClick={() => revokeMutation.mutate({ id: inv.id })}
												>
													<ProhibitIcon className="size-3.5" />
													<Trans>Révoquer</Trans>
												</Button>
											</div>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					)}
				</CardContent>
			</Card>

			{/* Invite dialog */}
			<Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>
							<Trans>Inviter un partenaire</Trans>
						</DialogTitle>
						<DialogDescription>
							<Trans>L'entreprise sera automatiquement promue partenaire lorsqu'elle s'inscrit avec cet email.</Trans>
						</DialogDescription>
					</DialogHeader>

					{createdLink ? (
						<div className="space-y-3">
							<p className="text-sm">
								<Trans>Invitation créée. Partagez ce lien avec le partenaire :</Trans>
							</p>
							<div className="flex gap-2">
								<Input readOnly value={createdLink} className="font-mono text-xs" />
								<Button type="button" variant="outline" className="gap-1" onClick={() => copyToClipboard(createdLink)}>
									<CopyIcon className="size-4" />
									<Trans>Copier</Trans>
								</Button>
							</div>
						</div>
					) : (
						<div className="space-y-4">
							<div className="space-y-2">
								<Label htmlFor="invite-email">
									<Trans>Email de l'entreprise</Trans>
								</Label>
								<Input
									id="invite-email"
									type="email"
									placeholder="contact@entreprise.ma"
									value={inviteEmail}
									onChange={(e) => setInviteEmail(e.target.value)}
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="invite-company">
									<Trans>Nom de l'entreprise</Trans>
								</Label>
								<Input
									id="invite-company"
									placeholder="OCP Group"
									value={inviteCompany}
									onChange={(e) => setInviteCompany(e.target.value)}
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="invite-type">
									<Trans>Type de partenaire</Trans>
								</Label>
								<Select value={inviteType} onValueChange={setInviteType}>
									<SelectTrigger id="invite-type">
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										{PARTNER_TYPE_OPTIONS.map((o) => (
											<SelectItem key={o.value} value={o.value}>
												{o.label}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
						</div>
					)}

					<DialogFooter>
						{createdLink ? (
							<Button onClick={() => setInviteOpen(false)}>
								<Trans>Fermer</Trans>
							</Button>
						) : (
							<Button
								disabled={inviteMutation.isPending || !inviteEmail.trim() || !inviteCompany.trim()}
								onClick={() =>
									inviteMutation.mutate({
										email: inviteEmail.trim(),
										companyName: inviteCompany.trim(),
										partnerType: inviteType as "employer" | "recruiter" | "training_center" | "government" | "ngo",
									})
								}
							>
								<Trans>Envoyer l'invitation</Trans>
							</Button>
						)}
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Reject / suspend reason dialog */}
			<Dialog open={!!actionTarget} onOpenChange={(o) => !o && setActionTarget(null)}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>
							{actionTarget?.kind === "suspend" ? (
								<Trans>Suspendre le partenaire</Trans>
							) : (
								<Trans>Rejeter le partenaire</Trans>
							)}
						</DialogTitle>
						<DialogDescription>{actionTarget?.company}</DialogDescription>
					</DialogHeader>
					<div className="space-y-2">
						<Label htmlFor="action-reason">
							<Trans>Motif</Trans>
						</Label>
						<Textarea
							id="action-reason"
							value={actionReason}
							onChange={(e) => setActionReason(e.target.value)}
							placeholder={t`Indiquez le motif…`}
						/>
					</div>
					<DialogFooter>
						<Button variant="outline" onClick={() => setActionTarget(null)}>
							<Trans>Annuler</Trans>
						</Button>
						<Button
							variant="destructive"
							disabled={!actionReason.trim() || rejectMutation.isPending || suspendMutation.isPending}
							onClick={() => {
								if (!actionTarget) return;
								if (actionTarget.kind === "suspend") {
									suspendMutation.mutate({ id: actionTarget.id, reason: actionReason.trim() });
								} else {
									rejectMutation.mutate({ id: actionTarget.id, reason: actionReason.trim() });
								}
							}}
						>
							<Trans>Confirmer</Trans>
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
