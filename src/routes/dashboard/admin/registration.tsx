import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { ArrowLeftIcon, ShieldCheckIcon, WarningCircleIcon } from "@phosphor-icons/react";
import { useMutation } from "@tanstack/react-query";
import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { client, orpc } from "@/integrations/orpc/client";
import { DashboardHeader } from "../-components/header";

type RegistrationMode = "open" | "invite_only" | "closed";

type RegistrationStatus = {
	mode: RegistrationMode;
	dailyCap: number;
	signupsToday: number;
	capReached: boolean;
};

const MODE_LABELS: Record<RegistrationMode, string> = {
	open: "Ouverte — tout le monde peut s'inscrire",
	invite_only: "Sur invitation — uniquement les emails invités (partenaires)",
	closed: "Fermée — aucune inscription",
};

export const Route = createFileRoute("/dashboard/admin/registration")({
	component: RouteComponent,
	errorComponent: ({ error, reset }) => (
		<div className="space-y-4">
			<DashboardHeader icon={ShieldCheckIcon} title={t`Inscriptions & sécurité`} />
			<div className="flex flex-col items-center justify-center rounded-xl border bg-background p-8">
				<WarningCircleIcon className="size-12 text-destructive" />
				<p className="mt-4 text-muted-foreground">
					<Trans>Échec du chargement des paramètres d'inscription</Trans>
				</p>
				<p className="mt-2 text-muted-foreground text-sm">{error.message}</p>
				<Button onClick={reset} className="mt-4">
					<Trans>Réessayer</Trans>
				</Button>
			</div>
		</div>
	),
	loader: async () => {
		const status = await client.flags.registrationStatus();
		return { status };
	},
});

function RouteComponent() {
	const router = useRouter();
	const { status } = Route.useLoaderData() as { status: RegistrationStatus };

	const { mutate: setMode, isPending } = useMutation(orpc.flags.setRegistrationMode.mutationOptions());

	const handleChange = (mode: RegistrationMode) => {
		const toastId = toast.loading(t`Enregistrement...`);
		setMode(
			{ mode },
			{
				onSuccess: () => {
					toast.success(t`Mode d'inscription mis à jour`, { id: toastId });
					router.invalidate();
				},
				onError: (error) => {
					toast.error(error.message || t`Échec de l'enregistrement`, { id: toastId });
				},
			},
		);
	};

	const capPercent = status.dailyCap > 0 ? Math.min(100, Math.round((status.signupsToday / status.dailyCap) * 100)) : 0;

	return (
		<div className="space-y-4">
			<DashboardHeader icon={ShieldCheckIcon} title={t`Inscriptions & sécurité`} />

			<div className="flex items-center gap-4">
				<Link
					to="/dashboard/admin"
					className="inline-flex items-center justify-center rounded-lg border p-2 transition-colors hover:bg-muted"
				>
					<ArrowLeftIcon size={20} />
				</Link>
				<p className="text-muted-foreground text-sm">
					<Trans>Contrôlez qui peut créer un compte et surveillez la limite quotidienne.</Trans>
				</p>
			</div>

			<div className="grid gap-6 lg:grid-cols-2">
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<ShieldCheckIcon size={20} />
							<Trans>Mode d'inscription</Trans>
						</CardTitle>
						<CardDescription>
							<Trans>Choisissez la politique d'inscription. La modification est immédiate.</Trans>
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="registration-mode">
								<Trans>Mode</Trans>
							</Label>
							<Select
								value={status.mode}
								onValueChange={(v) => handleChange(v as RegistrationMode)}
								disabled={isPending}
							>
								<SelectTrigger id="registration-mode">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="open">{MODE_LABELS.open}</SelectItem>
									<SelectItem value="invite_only">{MODE_LABELS.invite_only}</SelectItem>
									<SelectItem value="closed">{MODE_LABELS.closed}</SelectItem>
								</SelectContent>
							</Select>
							<p className="text-muted-foreground text-xs">{MODE_LABELS[status.mode]}</p>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>
							<Trans>Limite quotidienne d'inscriptions</Trans>
						</CardTitle>
						<CardDescription>
							<Trans>Nombre d'inscriptions autorisées aujourd'hui (UTC).</Trans>
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-3">
						<p className="font-semibold text-2xl">
							{status.signupsToday}{" "}
							<span className="font-normal text-muted-foreground text-sm">/ {status.dailyCap}</span>
						</p>
						<Progress value={capPercent} />
						<p className="text-muted-foreground text-xs">
							{status.capReached ? (
								<Trans>Limite atteinte — les nouvelles inscriptions sont bloquées jusqu'à demain.</Trans>
							) : (
								<Trans>{capPercent}% de la limite quotidienne utilisée.</Trans>
							)}
						</p>
						<p className="text-muted-foreground text-xs">
							<Trans>La limite quotidienne se configure via la variable d'environnement DAILY_SIGNUP_CAP.</Trans>
						</p>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
