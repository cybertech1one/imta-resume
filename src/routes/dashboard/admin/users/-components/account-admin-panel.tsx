import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import {
	CheckCircleIcon,
	GearSixIcon,
	KeyIcon,
	PencilSimpleIcon,
	ProhibitIcon,
	SealCheckIcon,
	SignOutIcon,
} from "@phosphor-icons/react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { orpc } from "@/integrations/orpc/client";

type AccountAdminPanelUser = {
	id: string;
	name: string;
	email: string;
	username: string;
	emailVerified: boolean;
	imtaProgram: string | null;
	banned: boolean;
	banReason: string | null;
	banExpiresAt: Date | null;
};

type Props = {
	user: AccountAdminPanelUser;
	/** True when this user row is the currently logged-in admin (self). */
	isSelf: boolean;
};

export function AccountAdminPanel({ user, isSelf }: Props) {
	const router = useRouter();

	const [passwordOpen, setPasswordOpen] = useState(false);
	const [newPassword, setNewPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");

	const [banOpen, setBanOpen] = useState(false);
	const [banReason, setBanReason] = useState("");
	const [banExpiry, setBanExpiry] = useState("");

	const [profileOpen, setProfileOpen] = useState(false);
	const [profileName, setProfileName] = useState(user.name);
	const [profileEmail, setProfileEmail] = useState(user.email);
	const [profileUsername, setProfileUsername] = useState(user.username);
	const [profileProgram, setProfileProgram] = useState(user.imtaProgram ?? "");

	const { mutate: setPassword, isPending: settingPassword } = useMutation(
		orpc.admin.users.setPassword.mutationOptions(),
	);
	const { mutate: revokeSessions } = useMutation(orpc.admin.users.revokeSessions.mutationOptions());
	const { mutate: verifyEmail } = useMutation(orpc.admin.users.verifyEmail.mutationOptions());
	const { mutate: banUser } = useMutation(orpc.admin.users.ban.mutationOptions());
	const { mutate: unbanUser } = useMutation(orpc.admin.users.unban.mutationOptions());
	const { mutate: updateProfile, isPending: savingProfile } = useMutation(
		orpc.admin.users.updateProfile.mutationOptions(),
	);

	const sessionsQuery = useQuery(orpc.admin.users.listSessions.queryOptions({ input: { userId: user.id } }));

	const handleSetPassword = () => {
		if (newPassword.length < 12) {
			toast.error(t`Password must be at least 12 characters`);
			return;
		}
		if (newPassword !== confirmPassword) {
			toast.error(t`Passwords do not match`);
			return;
		}
		const toastId = toast.loading(t`Updating password...`);
		setPassword(
			{ userId: user.id, newPassword },
			{
				onSuccess: () => {
					toast.success(t`Password updated`, { id: toastId });
					setPasswordOpen(false);
					setNewPassword("");
					setConfirmPassword("");
				},
				onError: (error) => toast.error(error.message || t`Failed to update password`, { id: toastId }),
			},
		);
	};

	const handleVerifyEmail = () => {
		const toastId = toast.loading(t`Verifying email...`);
		verifyEmail(
			{ userId: user.id },
			{
				onSuccess: () => {
					toast.success(t`Email verified`, { id: toastId });
					router.invalidate();
				},
				onError: (error) => toast.error(error.message || t`Failed to verify email`, { id: toastId }),
			},
		);
	};

	const handleRevokeSessions = () => {
		const toastId = toast.loading(t`Revoking sessions...`);
		revokeSessions(
			{ userId: user.id },
			{
				onSuccess: (data) => {
					toast.success(t`${data.revoked} session(s) revoked`, { id: toastId });
					router.invalidate();
					sessionsQuery.refetch();
				},
				onError: (error) => toast.error(error.message || t`Failed to revoke sessions`, { id: toastId }),
			},
		);
	};

	const handleBan = () => {
		const toastId = toast.loading(t`Banning user...`);
		banUser(
			{
				userId: user.id,
				reason: banReason || undefined,
				expiresAt: banExpiry ? new Date(banExpiry) : undefined,
			},
			{
				onSuccess: () => {
					toast.success(t`User banned`, { id: toastId });
					setBanOpen(false);
					setBanReason("");
					setBanExpiry("");
					router.invalidate();
					sessionsQuery.refetch();
				},
				onError: (error) => toast.error(error.message || t`Failed to ban user`, { id: toastId }),
			},
		);
	};

	const handleUnban = () => {
		const toastId = toast.loading(t`Unbanning user...`);
		unbanUser(
			{ userId: user.id },
			{
				onSuccess: () => {
					toast.success(t`User unbanned`, { id: toastId });
					router.invalidate();
				},
				onError: (error) => toast.error(error.message || t`Failed to unban user`, { id: toastId }),
			},
		);
	};

	const handleUpdateProfile = () => {
		const toastId = toast.loading(t`Saving profile...`);
		updateProfile(
			{
				userId: user.id,
				name: profileName,
				email: profileEmail,
				username: profileUsername,
				imtaProgram: profileProgram ? profileProgram : null,
			},
			{
				onSuccess: () => {
					toast.success(t`Profile updated`, { id: toastId });
					setProfileOpen(false);
					router.invalidate();
				},
				onError: (error) => toast.error(error.message || t`Failed to update profile`, { id: toastId }),
			},
		);
	};

	return (
		<div className="rounded-xl border bg-card p-5">
			<div className="mb-4 flex items-center justify-between">
				<h3 className="flex items-center gap-2 font-semibold text-lg">
					<GearSixIcon size={20} />
					<Trans>Compte / Administration</Trans>
				</h3>
				{user.banned && (
					<Badge variant="destructive" className="gap-1">
						<ProhibitIcon size={12} /> <Trans>Banni</Trans>
					</Badge>
				)}
			</div>

			{user.banned && user.banReason && (
				<p className="mb-4 rounded-lg bg-destructive/10 p-3 text-destructive text-sm">
					<span className="font-medium">
						<Trans>Raison du bannissement</Trans>:
					</span>{" "}
					{user.banReason}
					{user.banExpiresAt && (
						<span className="block text-muted-foreground text-xs">
							<Trans>Expire le</Trans> {new Date(user.banExpiresAt).toLocaleString("fr-FR")}
						</span>
					)}
				</p>
			)}

			{/* Action buttons */}
			<div className="flex flex-wrap gap-2">
				<Button variant="outline" size="sm" onClick={() => setPasswordOpen(true)}>
					<KeyIcon size={16} className="mr-1.5" />
					<Trans>Réinitialiser le mot de passe</Trans>
				</Button>

				<Button variant="outline" size="sm" onClick={() => setProfileOpen(true)}>
					<PencilSimpleIcon size={16} className="mr-1.5" />
					<Trans>Modifier le profil</Trans>
				</Button>

				{!user.emailVerified && (
					<Button variant="outline" size="sm" onClick={handleVerifyEmail}>
						<SealCheckIcon size={16} className="mr-1.5" />
						<Trans>Vérifier l'email</Trans>
					</Button>
				)}

				<Button variant="outline" size="sm" onClick={handleRevokeSessions}>
					<SignOutIcon size={16} className="mr-1.5" />
					<Trans>Déconnecter toutes les sessions</Trans>
				</Button>

				{user.banned ? (
					<Button variant="outline" size="sm" onClick={handleUnban}>
						<CheckCircleIcon size={16} className="mr-1.5" />
						<Trans>Débannir</Trans>
					</Button>
				) : (
					<Button variant="destructive" size="sm" disabled={isSelf} onClick={() => setBanOpen(true)}>
						<ProhibitIcon size={16} className="mr-1.5" />
						<Trans>Bannir</Trans>
					</Button>
				)}
			</div>
			{isSelf && (
				<p className="mt-2 text-muted-foreground text-xs">
					<Trans>Vous ne pouvez pas bannir votre propre compte.</Trans>
				</p>
			)}

			{/* Active sessions table */}
			<div className="mt-6">
				<h4 className="mb-3 font-medium text-muted-foreground text-sm uppercase tracking-wider">
					<Trans>Sessions actives</Trans>
				</h4>
				{sessionsQuery.isLoading ? (
					<p className="text-muted-foreground text-sm">
						<Trans>Chargement...</Trans>
					</p>
				) : !sessionsQuery.data || sessionsQuery.data.length === 0 ? (
					<p className="text-muted-foreground text-sm">
						<Trans>Aucune session</Trans>
					</p>
				) : (
					<div className="overflow-x-auto rounded-lg border">
						<Table className="min-w-[600px]">
							<TableHeader>
								<TableRow>
									<TableHead>
										<Trans>Statut</Trans>
									</TableHead>
									<TableHead>
										<Trans>Adresse IP</Trans>
									</TableHead>
									<TableHead>
										<Trans>Appareil</Trans>
									</TableHead>
									<TableHead>
										<Trans>Créée le</Trans>
									</TableHead>
									<TableHead>
										<Trans>Expire le</Trans>
									</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{sessionsQuery.data.map((s) => (
									<TableRow key={s.id}>
										<TableCell>
											{s.isActive ? (
												<Badge variant="secondary" className="gap-1">
													<CheckCircleIcon size={12} /> <Trans>Active</Trans>
												</Badge>
											) : (
												<Badge variant="outline">
													<Trans>Expirée</Trans>
												</Badge>
											)}
										</TableCell>
										<TableCell className="text-sm">{s.ipAddress ?? "—"}</TableCell>
										<TableCell
											className="max-w-[220px] truncate text-muted-foreground text-xs"
											title={s.userAgent ?? ""}
										>
											{s.userAgent ?? "—"}
										</TableCell>
										<TableCell className="text-sm">{new Date(s.createdAt).toLocaleString("fr-FR")}</TableCell>
										<TableCell className="text-sm">{new Date(s.expiresAt).toLocaleString("fr-FR")}</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</div>
				)}
			</div>

			{/* Set Password Dialog */}
			<Dialog open={passwordOpen} onOpenChange={setPasswordOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>
							<Trans>Réinitialiser le mot de passe</Trans>
						</DialogTitle>
						<DialogDescription>
							<Trans>Définissez un nouveau mot de passe (12 caractères minimum) pour {user.name}.</Trans>
						</DialogDescription>
					</DialogHeader>
					<div className="space-y-3">
						<div className="space-y-1.5">
							<Label htmlFor="new-password">
								<Trans>Nouveau mot de passe</Trans>
							</Label>
							<Input
								id="new-password"
								type="password"
								value={newPassword}
								autoComplete="new-password"
								onChange={(e) => setNewPassword(e.target.value)}
							/>
						</div>
						<div className="space-y-1.5">
							<Label htmlFor="confirm-password">
								<Trans>Confirmer le mot de passe</Trans>
							</Label>
							<Input
								id="confirm-password"
								type="password"
								value={confirmPassword}
								autoComplete="new-password"
								onChange={(e) => setConfirmPassword(e.target.value)}
							/>
						</div>
					</div>
					<DialogFooter>
						<Button variant="outline" onClick={() => setPasswordOpen(false)}>
							<Trans>Annuler</Trans>
						</Button>
						<Button onClick={handleSetPassword} disabled={settingPassword}>
							<Trans>Enregistrer</Trans>
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Ban Dialog */}
			<Dialog open={banOpen} onOpenChange={setBanOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>
							<Trans>Bannir l'utilisateur</Trans>
						</DialogTitle>
						<DialogDescription>
							<Trans>Bannir {user.name} le déconnectera immédiatement et l'empêchera d'utiliser l'application.</Trans>
						</DialogDescription>
					</DialogHeader>
					<div className="space-y-3">
						<div className="space-y-1.5">
							<Label htmlFor="ban-reason">
								<Trans>Raison (optionnel)</Trans>
							</Label>
							<Textarea
								id="ban-reason"
								value={banReason}
								maxLength={500}
								onChange={(e) => setBanReason(e.target.value)}
							/>
						</div>
						<div className="space-y-1.5">
							<Label htmlFor="ban-expiry">
								<Trans>Expiration (optionnel)</Trans>
							</Label>
							<Input
								id="ban-expiry"
								type="datetime-local"
								value={banExpiry}
								onChange={(e) => setBanExpiry(e.target.value)}
							/>
							<p className="text-muted-foreground text-xs">
								<Trans>Laissez vide pour un bannissement permanent.</Trans>
							</p>
						</div>
					</div>
					<DialogFooter>
						<Button variant="outline" onClick={() => setBanOpen(false)}>
							<Trans>Annuler</Trans>
						</Button>
						<Button variant="destructive" onClick={handleBan}>
							<Trans>Bannir</Trans>
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Edit Profile Dialog */}
			<Dialog open={profileOpen} onOpenChange={setProfileOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>
							<Trans>Modifier le profil</Trans>
						</DialogTitle>
						<DialogDescription>
							<Trans>Modifiez les informations du profil de l'utilisateur.</Trans>
						</DialogDescription>
					</DialogHeader>
					<div className="space-y-3">
						<div className="space-y-1.5">
							<Label htmlFor="profile-name">
								<Trans>Nom</Trans>
							</Label>
							<Input id="profile-name" value={profileName} onChange={(e) => setProfileName(e.target.value)} />
						</div>
						<div className="space-y-1.5">
							<Label htmlFor="profile-email">
								<Trans>Email</Trans>
							</Label>
							<Input
								id="profile-email"
								type="email"
								value={profileEmail}
								onChange={(e) => setProfileEmail(e.target.value)}
							/>
						</div>
						<div className="space-y-1.5">
							<Label htmlFor="profile-username">
								<Trans>Nom d'utilisateur</Trans>
							</Label>
							<Input
								id="profile-username"
								value={profileUsername}
								onChange={(e) => setProfileUsername(e.target.value.toLowerCase())}
							/>
						</div>
						<div className="space-y-1.5">
							<Label htmlFor="profile-program">
								<Trans>Programme IMTA</Trans>
							</Label>
							<Input
								id="profile-program"
								value={profileProgram}
								placeholder="ex. infirmier_polyvalent"
								onChange={(e) => setProfileProgram(e.target.value)}
							/>
						</div>
					</div>
					<DialogFooter>
						<Button variant="outline" onClick={() => setProfileOpen(false)}>
							<Trans>Annuler</Trans>
						</Button>
						<Button onClick={handleUpdateProfile} disabled={savingProfile}>
							<Trans>Enregistrer</Trans>
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
