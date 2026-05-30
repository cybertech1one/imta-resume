import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { BuildingsIcon, FloppyDiskIcon, WarningCircleIcon } from "@phosphor-icons/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ErrorComponent } from "@/components/error-component";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { authClient } from "@/integrations/auth/client";
import { orpc } from "@/integrations/orpc/client";
import { DashboardHeader } from "../-components/header";

// biome-ignore lint/suspicious/noExplicitAny: Route path not in generated route tree yet
export const Route = createFileRoute("/dashboard/partner/profile" as any)({
	component: PartnerProfilePage,
	errorComponent: ErrorComponent,
});

const PLACEHOLDER = "À compléter";

const PARTNER_TYPE_OPTIONS = [
	{ value: "employer", label: t`Employeur` },
	{ value: "recruiter", label: t`Recruteur` },
	{ value: "training_center", label: t`Centre de formation` },
	{ value: "government", label: t`Gouvernement` },
	{ value: "ngo", label: t`ONG` },
] as const;

type PartnerType = (typeof PARTNER_TYPE_OPTIONS)[number]["value"];

type FormState = {
	companyName: string;
	companyNameFr: string;
	partnerType: PartnerType;
	industry: string;
	description: string;
	headquarters: string;
	website: string;
	contactEmail: string;
	contactPhone: string;
	contactPerson: string;
};

const EMPTY_FORM: FormState = {
	companyName: "",
	companyNameFr: "",
	partnerType: "employer",
	industry: "",
	description: "",
	headquarters: "",
	website: "",
	contactEmail: "",
	contactPhone: "",
	contactPerson: "",
};

function StatusBadge({ status }: { status: string }) {
	const variants: Record<string, { label: string; className: string }> = {
		approved: { label: t`Approuvé`, className: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" },
		pending: {
			label: t`En attente de validation`,
			className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
		},
		rejected: { label: t`Rejeté`, className: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" },
		suspended: { label: t`Suspendu`, className: "bg-neutral-200 text-neutral-800 dark:bg-neutral-700" },
	};
	const v = variants[status] ?? variants.pending;
	return <Badge className={v.className}>{v.label}</Badge>;
}

function PartnerProfilePage() {
	const { data: session, isPending: isSessionPending } = authClient.useSession();
	const isAuthenticated = !!session?.user;
	const queryClient = useQueryClient();
	const [form, setForm] = useState<FormState>(EMPTY_FORM);

	const profileQuery = useQuery({
		...orpc.partner.getMyProfile.queryOptions(),
		enabled: isAuthenticated,
		retry: false,
	});

	const hasProfile = !!profileQuery.data;
	const profile = profileQuery.data;

	// Hydrate the form once the profile loads. Placeholder values from the
	// auto-provisioned profile are cleared so the partner sees empty fields.
	useEffect(() => {
		if (!profile) return;
		const clean = (v: string | null | undefined) => (v && v !== PLACEHOLDER ? v : "");
		setForm({
			companyName: profile.companyName ?? "",
			companyNameFr: clean(profile.companyNameFr),
			partnerType: (profile.partnerType as PartnerType) ?? "employer",
			industry: clean(profile.industry),
			description: clean(profile.description),
			headquarters: clean(profile.headquarters),
			website: clean(profile.website),
			contactEmail: clean(profile.contactEmail),
			contactPhone: clean(profile.contactPhone),
			contactPerson: clean(profile.contactPerson),
		});
	}, [profile]);

	const invalidate = () => queryClient.invalidateQueries({ queryKey: orpc.partner.getMyProfile.key() });

	const createMutation = useMutation({
		...orpc.partner.createProfile.mutationOptions(),
		onSuccess: () => {
			toast.success(t`Profil créé`);
			invalidate();
		},
		onError: (error: Error) => toast.error(error.message),
	});

	const updateMutation = useMutation({
		...orpc.partner.updateProfile.mutationOptions(),
		onSuccess: () => {
			toast.success(t`Profil mis à jour`);
			invalidate();
		},
		onError: (error: Error) => toast.error(error.message),
	});

	const isSaving = createMutation.isPending || updateMutation.isPending;

	const handleSubmit = () => {
		const payload = {
			companyName: form.companyName.trim(),
			companyNameFr: form.companyNameFr.trim() || undefined,
			partnerType: form.partnerType,
			industry: form.industry.trim(),
			description: form.description.trim(),
			headquarters: form.headquarters.trim(),
			website: form.website.trim() || undefined,
			contactEmail: form.contactEmail.trim(),
			contactPhone: form.contactPhone.trim() || undefined,
			contactPerson: form.contactPerson.trim() || undefined,
		};

		if (hasProfile) {
			// updateProfile does not accept partnerType.
			const { partnerType: _omit, ...updatePayload } = payload;
			updateMutation.mutate(updatePayload);
		} else {
			createMutation.mutate(payload);
		}
	};

	const isLoading = isSessionPending || (isAuthenticated && profileQuery.isPending);

	const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
		setForm((prev) => ({ ...prev, [key]: value }));

	const requiredFilled =
		form.companyName.trim() &&
		form.industry.trim() &&
		form.description.trim() &&
		form.headquarters.trim() &&
		form.contactEmail.trim();

	return (
		<div className="mx-auto w-full max-w-3xl space-y-6 pb-8">
			<DashboardHeader
				icon={BuildingsIcon}
				title={t`Profil de l'entreprise`}
				subtitle={t`Complétez les informations de votre entreprise partenaire`}
				accentColor="#0ea5e9"
				rightContent={profile ? <StatusBadge status={profile.status} /> : undefined}
			/>

			{profileQuery.isError && profileQuery.error && (
				<Card className="border-sky-500/30 bg-sky-500/5">
					<CardContent className="flex items-center gap-3 py-4 text-sm">
						<WarningCircleIcon className="size-5 text-sky-600" weight="duotone" />
						<Trans>Vous n'avez pas encore de profil partenaire. Créez-le ci-dessous.</Trans>
					</CardContent>
				</Card>
			)}

			{isLoading ? (
				<Card>
					<CardContent className="space-y-4 py-6">
						{Array.from({ length: 5 }).map((_, i) => (
							<Skeleton key={`f-skel-${i}`} className="h-10 w-full" />
						))}
					</CardContent>
				</Card>
			) : (
				<Card>
					<CardHeader>
						<CardTitle className="text-base">
							<Trans>Informations</Trans>
						</CardTitle>
						<CardDescription>
							<Trans>Les champs marqués d'un astérisque (*) sont obligatoires.</Trans>
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="grid gap-4 sm:grid-cols-2">
							<div className="space-y-2">
								<Label htmlFor="companyName">
									<Trans>Nom de l'entreprise *</Trans>
								</Label>
								<Input id="companyName" value={form.companyName} onChange={(e) => set("companyName", e.target.value)} />
							</div>
							<div className="space-y-2">
								<Label htmlFor="companyNameFr">
									<Trans>Nom (français)</Trans>
								</Label>
								<Input
									id="companyNameFr"
									value={form.companyNameFr}
									onChange={(e) => set("companyNameFr", e.target.value)}
								/>
							</div>
						</div>

						<div className="grid gap-4 sm:grid-cols-2">
							<div className="space-y-2">
								<Label htmlFor="partnerType">
									<Trans>Type de partenaire</Trans>
								</Label>
								<Select
									value={form.partnerType}
									onValueChange={(v) => set("partnerType", v as PartnerType)}
									disabled={hasProfile}
								>
									<SelectTrigger id="partnerType">
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
							<div className="space-y-2">
								<Label htmlFor="industry">
									<Trans>Secteur d'activité *</Trans>
								</Label>
								<Input id="industry" value={form.industry} onChange={(e) => set("industry", e.target.value)} />
							</div>
						</div>

						<div className="space-y-2">
							<Label htmlFor="description">
								<Trans>Description *</Trans>
							</Label>
							<Textarea
								id="description"
								value={form.description}
								onChange={(e) => set("description", e.target.value)}
								rows={4}
							/>
						</div>

						<div className="grid gap-4 sm:grid-cols-2">
							<div className="space-y-2">
								<Label htmlFor="headquarters">
									<Trans>Siège (ville) *</Trans>
								</Label>
								<Input
									id="headquarters"
									value={form.headquarters}
									onChange={(e) => set("headquarters", e.target.value)}
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="website">
									<Trans>Site web</Trans>
								</Label>
								<Input
									id="website"
									type="url"
									placeholder="https://exemple.ma"
									value={form.website}
									onChange={(e) => set("website", e.target.value)}
								/>
							</div>
						</div>

						<div className="grid gap-4 sm:grid-cols-2">
							<div className="space-y-2">
								<Label htmlFor="contactEmail">
									<Trans>Email de contact *</Trans>
								</Label>
								<Input
									id="contactEmail"
									type="email"
									value={form.contactEmail}
									onChange={(e) => set("contactEmail", e.target.value)}
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="contactPhone">
									<Trans>Téléphone</Trans>
								</Label>
								<Input
									id="contactPhone"
									value={form.contactPhone}
									onChange={(e) => set("contactPhone", e.target.value)}
								/>
							</div>
						</div>

						<div className="space-y-2">
							<Label htmlFor="contactPerson">
								<Trans>Personne de contact</Trans>
							</Label>
							<Input
								id="contactPerson"
								value={form.contactPerson}
								onChange={(e) => set("contactPerson", e.target.value)}
							/>
						</div>

						<div className="flex justify-end pt-2">
							<Button onClick={handleSubmit} disabled={isSaving || !requiredFilled} className="gap-2">
								<FloppyDiskIcon className="size-4" />
								{hasProfile ? <Trans>Enregistrer les modifications</Trans> : <Trans>Créer le profil</Trans>}
							</Button>
						</div>
					</CardContent>
				</Card>
			)}
		</div>
	);
}
