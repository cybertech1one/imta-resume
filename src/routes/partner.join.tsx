import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { ArrowRightIcon, BuildingsIcon, CheckCircleIcon, WarningCircleIcon } from "@phosphor-icons/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { z } from "zod";
import { ErrorComponent } from "@/components/error-component";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { authClient } from "@/integrations/auth/client";
import { orpc } from "@/integrations/orpc/client";

const searchSchema = z.object({
	token: z.string().optional(),
});

// biome-ignore lint/suspicious/noExplicitAny: Route path not in generated route tree yet
export const Route = createFileRoute("/partner/join" as any)({
	component: PartnerJoinPage,
	errorComponent: ErrorComponent,
	validateSearch: searchSchema,
});

function Shell({ children }: { children: React.ReactNode }) {
	return (
		<div className="flex min-h-dvh items-center justify-center bg-gradient-to-br from-sky-500/5 via-background to-emerald-500/5 p-4">
			<div className="w-full max-w-lg">{children}</div>
		</div>
	);
}

function PartnerJoinPage() {
	const { token } = Route.useSearch() as { token?: string };
	const { data: session } = authClient.useSession();
	const navigate = useNavigate();
	const queryClient = useQueryClient();

	const inviteQuery = useQuery({
		...orpc.partner.getInvite.queryOptions({ input: { token: token ?? "" } }),
		enabled: !!token,
		retry: false,
	});

	const redeemMutation = useMutation({
		...orpc.partner.redeemInvite.mutationOptions(),
		onSuccess: async () => {
			toast.success(t`Bienvenue ! Votre compte partenaire est activé.`);
			await queryClient.invalidateQueries();
			navigate({ to: "/dashboard/partner/profile" as string });
		},
		onError: (error: Error) => toast.error(error.message),
	});

	if (!token) {
		return (
			<Shell>
				<Card>
					<CardHeader className="text-center">
						<div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-full bg-destructive/10">
							<WarningCircleIcon className="size-6 text-destructive" weight="duotone" />
						</div>
						<CardTitle>
							<Trans>Lien d'invitation invalide</Trans>
						</CardTitle>
						<CardDescription>
							<Trans>Aucun jeton d'invitation n'a été fourni dans le lien.</Trans>
						</CardDescription>
					</CardHeader>
				</Card>
			</Shell>
		);
	}

	if (inviteQuery.isPending) {
		return (
			<Shell>
				<Card>
					<CardHeader>
						<Skeleton className="mx-auto h-12 w-12 rounded-full" />
						<Skeleton className="mx-auto mt-3 h-6 w-48" />
						<Skeleton className="mx-auto mt-2 h-4 w-64" />
					</CardHeader>
					<CardContent>
						<Skeleton className="h-10 w-full" />
					</CardContent>
				</Card>
			</Shell>
		);
	}

	const invite = inviteQuery.data;

	if (!invite || !invite.valid) {
		const reason = invite && "reason" in invite ? invite.reason : "invalid";
		const messages: Record<string, string> = {
			invalid: t`Cette invitation est introuvable.`,
			expired: t`Cette invitation a expiré.`,
			revoked: t`Cette invitation a été révoquée par l'administrateur.`,
			accepted: t`Cette invitation a déjà été utilisée.`,
		};
		return (
			<Shell>
				<Card>
					<CardHeader className="text-center">
						<div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-full bg-destructive/10">
							<WarningCircleIcon className="size-6 text-destructive" weight="duotone" />
						</div>
						<CardTitle>
							<Trans>Invitation indisponible</Trans>
						</CardTitle>
						<CardDescription>{messages[reason] ?? messages.invalid}</CardDescription>
					</CardHeader>
					<CardContent className="text-center">
						<Button asChild variant="outline">
							<Link to="/auth/login">
								<Trans>Aller à la connexion</Trans>
							</Link>
						</Button>
					</CardContent>
				</Card>
			</Shell>
		);
	}

	const companyLabel = invite.companyNameFr || invite.companyName;
	const sessionEmail = session?.user?.email?.trim().toLowerCase();
	const emailMatches = sessionEmail && sessionEmail === invite.email;

	return (
		<Shell>
			<Card className="border-sky-500/30">
				<CardHeader className="text-center">
					<div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-full bg-sky-500/10">
						<BuildingsIcon className="size-6 text-sky-600" weight="duotone" />
					</div>
					<CardTitle>
						<Trans>Vous avez été invité comme partenaire</Trans>
					</CardTitle>
					<CardDescription>
						<Trans>IMTA Resume vous invite à rejoindre la plateforme en tant que partenaire pour {companyLabel}.</Trans>
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="rounded-lg border bg-muted/30 p-4 text-sm">
						<div className="flex justify-between">
							<span className="text-muted-foreground">
								<Trans>Entreprise</Trans>
							</span>
							<span className="font-medium">{companyLabel}</span>
						</div>
						<div className="mt-2 flex justify-between">
							<span className="text-muted-foreground">
								<Trans>Email invité</Trans>
							</span>
							<span className="font-medium">{invite.email}</span>
						</div>
					</div>

					{!session?.user ? (
						<>
							<p className="text-center text-muted-foreground text-sm">
								<Trans>Créez votre compte avec cet email pour activer votre accès partenaire.</Trans>
							</p>
							<Button asChild className="w-full gap-2">
								<Link to="/auth/register" search={{ email: invite.email, invite: token } as never}>
									<Trans>Créer mon compte partenaire</Trans>
									<ArrowRightIcon className="size-4" />
								</Link>
							</Button>
						</>
					) : emailMatches ? (
						<>
							<p className="text-center text-muted-foreground text-sm">
								<Trans>Vous êtes connecté avec l'email invité. Activez votre accès partenaire.</Trans>
							</p>
							<Button
								className="w-full gap-2"
								disabled={redeemMutation.isPending}
								onClick={() => redeemMutation.mutate({ token })}
							>
								<CheckCircleIcon className="size-4" weight="fill" />
								<Trans>Activer mon accès partenaire</Trans>
							</Button>
						</>
					) : (
						<p className="rounded-lg bg-amber-500/10 p-3 text-amber-700 text-sm dark:text-amber-400">
							<Trans>
								Vous êtes connecté avec un email différent ({sessionEmail}). Déconnectez-vous, puis créez ou
								connectez-vous avec {invite.email} pour accepter cette invitation.
							</Trans>
						</p>
					)}
				</CardContent>
			</Card>
		</Shell>
	);
}
