import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import {
	CalendarIcon,
	ChatCircleDotsIcon,
	CheckCircleIcon,
	ClipboardTextIcon,
	EnvelopeSimpleIcon,
	EyeIcon,
	FileTextIcon,
	FunnelIcon,
	ProhibitIcon,
	StarIcon,
	UserCircleIcon,
	XCircleIcon,
} from "@phosphor-icons/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { authClient } from "@/integrations/auth/client";
import { orpc } from "@/integrations/orpc/client";
import { DashboardHeader } from "../-components/header";

// biome-ignore lint/suspicious/noExplicitAny: Route path not in generated route tree
export const Route = createFileRoute("/dashboard/partner/applications" as any)({
	component: PartnerApplicationsPage,
	errorComponent: ErrorComponent,
});

type CandidateApplication = {
	id: string;
	jobId: string;
	userId: string;
	resumeId: string | null;
	coverLetter: string | null;
	status: string;
	notes: string | null;
	matchScore: number | null;
	reviewedAt: Date | null;
	createdAt: Date;
	updatedAt: Date;
};

type PartnerJobOption = {
	id: string;
	title: string;
};

function ApplicationStatusBadge({ status }: { status: string }) {
	const variants: Record<string, { label: string; className: string; icon: React.ElementType }> = {
		submitted: {
			label: t`Soumise`,
			className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
			icon: ClipboardTextIcon,
		},
		reviewed: {
			label: t`Consultée`,
			className: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
			icon: EyeIcon,
		},
		shortlisted: {
			label: t`Présélectionnée`,
			className: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
			icon: StarIcon,
		},
		interviewed: {
			label: t`Entretien effectué`,
			className: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
			icon: CalendarIcon,
		},
		offered: {
			label: t`Offre envoyée`,
			className: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200",
			icon: StarIcon,
		},
		rejected: {
			label: t`Refusée`,
			className: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
			icon: XCircleIcon,
		},
		hired: {
			label: t`Recrutée`,
			className: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200",
			icon: CheckCircleIcon,
		},
	};
	const variant = variants[status] ?? variants.submitted;
	const IconComp = variant.icon;
	return (
		<Badge className={`gap-1 ${variant.className}`}>
			<IconComp className="size-3" />
			{variant.label}
		</Badge>
	);
}

function MatchScoreBadge({ score }: { score: number }) {
	let colorClass = "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
	if (score >= 80) colorClass = "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
	else if (score >= 60) colorClass = "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
	else if (score >= 40) colorClass = "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";

	return (
		<Badge variant="outline" className={`font-semibold ${colorClass}`}>
			{score}% <Trans>de correspondance</Trans>
		</Badge>
	);
}

// Dialog that lets a partner start (or reuse) a direct conversation with an applicant.
function ContactApplicantDialog({
	open,
	onOpenChange,
	recipientUserId,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	recipientUserId: string;
}) {
	const navigate = useNavigate();
	const [body, setBody] = useState("");
	const startConversation = useMutation(orpc.messaging.startConversation.mutationOptions());

	const handleSend = async () => {
		const trimmed = body.trim();
		if (trimmed.length === 0) return;
		try {
			const result = await startConversation.mutateAsync({
				recipientUserId,
				body: trimmed,
			});
			toast.success(t`Message envoyé`);
			onOpenChange(false);
			setBody("");
			navigate({
				// biome-ignore lint/suspicious/noExplicitAny: route path not in generated tree
				to: "/dashboard/messages" as any,
				// biome-ignore lint/suspicious/noExplicitAny: search params not in generated tree
				search: { conversation: result.conversationId } as any,
			});
		} catch {
			toast.error(t`Échec de l'envoi du message`);
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>
						<Trans>Contacter le candidat</Trans>
					</DialogTitle>
					<DialogDescription>
						<Trans>Envoyez un message direct à ce candidat. Il pourra vous répondre dans sa messagerie.</Trans>
					</DialogDescription>
				</DialogHeader>
				<Textarea
					value={body}
					onChange={(e) => setBody(e.target.value)}
					placeholder={t`Écrivez votre message...`}
					maxLength={5000}
					rows={5}
				/>
				<DialogFooter>
					<Button variant="outline" onClick={() => onOpenChange(false)}>
						<Trans>Annuler</Trans>
					</Button>
					<Button onClick={handleSend} disabled={startConversation.isPending || body.trim().length === 0}>
						<Trans>Envoyer</Trans>
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

function ApplicationCard({
	application,
	onReview,
	onShortlist,
	onScheduleInterview,
	onReject,
	onHire,
}: {
	application: CandidateApplication;
	onReview: (id: string) => void;
	onShortlist: (id: string) => void;
	onScheduleInterview: (id: string) => void;
	onReject: (id: string) => void;
	onHire: (id: string) => void;
}) {
	const [contactOpen, setContactOpen] = useState(false);
	return (
		<Card className="transition-shadow hover:shadow-md">
			<CardHeader className="pb-3">
				<div className="flex items-start justify-between gap-3">
					<div className="flex items-center gap-3">
						<div className="flex size-10 items-center justify-center rounded-full bg-muted">
							<UserCircleIcon className="size-5 text-muted-foreground" />
						</div>
						<div>
							<CardTitle className="text-base">
								<Trans>Candidat</Trans> {application.userId.slice(0, 8)}
							</CardTitle>
							<CardDescription className="flex items-center gap-1 text-xs">
								<EnvelopeSimpleIcon className="size-3" />
								<Trans>Candidature reçue le</Trans>{" "}
								{new Date(application.createdAt).toLocaleDateString("fr-FR", {
									day: "numeric",
									month: "short",
									year: "numeric",
								})}
							</CardDescription>
						</div>
					</div>
					<ApplicationStatusBadge status={application.status} />
				</div>
			</CardHeader>
			<CardContent className="space-y-3">
				<div className="flex flex-wrap items-center gap-2 text-sm">
					{application.matchScore !== null && <MatchScoreBadge score={application.matchScore} />}
					{application.resumeId && (
						<Badge variant="outline" className="gap-1">
							<FileTextIcon className="size-3" />
							<Trans>CV joint</Trans>
						</Badge>
					)}
				</div>

				{application.coverLetter && (
					<p className="line-clamp-2 text-muted-foreground text-sm">{application.coverLetter}</p>
				)}

				<div className="flex flex-wrap items-center gap-2 border-t pt-3">
					<Button variant="outline" size="sm" className="gap-1.5" onClick={() => setContactOpen(true)}>
						<ChatCircleDotsIcon className="size-3.5" />
						<Trans>Contacter</Trans>
					</Button>

					<ContactApplicantDialog
						open={contactOpen}
						onOpenChange={setContactOpen}
						recipientUserId={application.userId}
					/>

					{application.status === "submitted" && (
						<Button variant="outline" size="sm" className="gap-1.5" onClick={() => onReview(application.id)}>
							<EyeIcon className="size-3.5" />
							<Trans>Consulter</Trans>
						</Button>
					)}

					{(application.status === "submitted" || application.status === "reviewed") && (
						<Button variant="outline" size="sm" className="gap-1.5" onClick={() => onShortlist(application.id)}>
							<StarIcon className="size-3.5" />
							<Trans>Présélectionner</Trans>
						</Button>
					)}

					{application.status === "shortlisted" && (
						<>
							<Button
								variant="outline"
								size="sm"
								className="gap-1.5"
								onClick={() => onScheduleInterview(application.id)}
							>
								<CalendarIcon className="size-3.5" />
								<Trans>Planifier un entretien</Trans>
							</Button>
							<Button variant="outline" size="sm" className="gap-1.5" onClick={() => onHire(application.id)}>
								<CheckCircleIcon className="size-3.5" />
								<Trans>Recruter</Trans>
							</Button>
						</>
					)}

					{application.status !== "rejected" && application.status !== "hired" && (
						<Button
							variant="ghost"
							size="sm"
							className="gap-1.5 text-red-600 hover:bg-red-50 hover:text-red-700"
							onClick={() => onReject(application.id)}
						>
							<ProhibitIcon className="size-3.5" />
							<Trans>Refuser</Trans>
						</Button>
					)}
				</div>
			</CardContent>
		</Card>
	);
}

function ApplicationsSkeleton() {
	return (
		<div className="space-y-4">
			{Array.from({ length: 3 }).map((_, i) => (
				<Card key={`app-skel-${i}`}>
					<CardHeader className="pb-3">
						<div className="flex items-start justify-between">
							<div className="flex items-center gap-3">
								<Skeleton className="size-10 rounded-full" />
								<div className="space-y-2">
									<Skeleton className="h-4 w-32" />
									<Skeleton className="h-3 w-48" />
								</div>
							</div>
							<Skeleton className="h-6 w-24" />
						</div>
					</CardHeader>
					<CardContent className="space-y-3">
						<div className="flex gap-2">
							<Skeleton className="h-5 w-28" />
							<Skeleton className="h-5 w-16" />
						</div>
						<Skeleton className="h-4 w-full" />
						<div className="flex gap-2 border-t pt-3">
							<Skeleton className="h-8 w-20" />
							<Skeleton className="h-8 w-20" />
							<Skeleton className="h-8 w-24" />
						</div>
					</CardContent>
				</Card>
			))}
		</div>
	);
}

function PartnerApplicationsPage() {
	const { data: session } = authClient.useSession();
	const [jobFilter, setJobFilter] = useState<string>("all");
	const [statusFilter, setStatusFilter] = useState<string>("all");

	// Fetch partner's jobs for the filter dropdown
	const { data: partnerJobs = [] } = useQuery({
		...orpc.partner.getMyJobs.queryOptions(),
		enabled: !!session?.user,
		staleTime: 5 * 60 * 1000,
	});

	const jobOptions = (partnerJobs as PartnerJobOption[]).map((j) => ({ id: j.id, title: j.title }));

	// Fetch applications for the selected job (requires a jobId)
	const selectedJobId = jobFilter !== "all" ? jobFilter : jobOptions[0]?.id;
	const {
		data: applications = [],
		isLoading,
		isError,
	} = useQuery({
		...orpc.partner.getJobApplications.queryOptions({
			input: {
				jobId: selectedJobId ?? "",
				status:
					statusFilter !== "all"
						? (statusFilter as
								| "submitted"
								| "reviewed"
								| "shortlisted"
								| "interviewed"
								| "offered"
								| "hired"
								| "rejected")
						: undefined,
			},
		}),
		enabled: !!session?.user && !!selectedJobId,
		staleTime: 1 * 60 * 1000,
		gcTime: 5 * 60 * 1000,
	});

	const allApplications = applications as CandidateApplication[];

	const statusCounts = useMemo(() => {
		const counts: Record<string, number> = { all: allApplications.length };
		for (const app of allApplications) {
			counts[app.status] = (counts[app.status] ?? 0) + 1;
		}
		return counts;
	}, [allApplications]);

	const queryClient = useQueryClient();
	const updateStatusMutation = useMutation(orpc.partner.updateApplicationStatus.mutationOptions());

	const updateStatus = async (applicationId: string, status: string) => {
		try {
			await updateStatusMutation.mutateAsync({
				applicationId,
				status: status as "submitted" | "reviewed" | "shortlisted" | "interviewed" | "offered" | "hired" | "rejected",
			});
			toast.success(t`Statut mis à jour`);
			queryClient.invalidateQueries({ queryKey: ["partner"] });
		} catch {
			toast.error(t`Impossible de mettre à jour le statut`);
		}
	};

	const handleReview = (id: string) => updateStatus(id, "reviewed");
	const handleShortlist = (id: string) => updateStatus(id, "shortlisted");
	const handleScheduleInterview = (id: string) => updateStatus(id, "interviewed");
	const handleReject = (id: string) => updateStatus(id, "rejected");
	const handleHire = (id: string) => updateStatus(id, "hired");

	return (
		<div className="mx-auto w-full max-w-6xl space-y-6 p-4 md:p-6">
			<DashboardHeader title={t`Candidatures`} icon={ClipboardTextIcon} />

			<p className="text-muted-foreground text-sm">
				<Trans>Consultez et gérez les candidatures reçues pour vos offres.</Trans>
			</p>

			{/* Filters */}
			<Card>
				<CardContent className="flex flex-wrap items-center gap-4 pt-4">
					<div className="flex items-center gap-2">
						<FunnelIcon className="size-4 text-muted-foreground" />
						<span className="font-medium text-sm">
							<Trans>Filters</Trans>
						</span>
					</div>
					<Select value={jobFilter} onValueChange={setJobFilter}>
						<SelectTrigger className="w-[200px]">
							<SelectValue placeholder={t`Toutes les offres`} />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">
								<Trans>Toutes les offres</Trans>
							</SelectItem>
							{jobOptions.map((job) => (
								<SelectItem key={job.id} value={job.id}>
									{job.title}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
					<Select value={statusFilter} onValueChange={setStatusFilter}>
						<SelectTrigger className="w-[180px]">
							<SelectValue placeholder={t`Tous les statuts`} />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">
								<Trans>Tous les statuts</Trans> ({statusCounts.all ?? 0})
							</SelectItem>
							<SelectItem value="submitted">
								<Trans>Soumises</Trans> ({statusCounts.submitted ?? 0})
							</SelectItem>
							<SelectItem value="reviewed">
								<Trans>Consultées</Trans> ({statusCounts.reviewed ?? 0})
							</SelectItem>
							<SelectItem value="shortlisted">
								<Trans>Présélectionnées</Trans> ({statusCounts.shortlisted ?? 0})
							</SelectItem>
							<SelectItem value="interviewed">
								<Trans>Entretiens effectués</Trans> ({statusCounts.interviewed ?? 0})
							</SelectItem>
							<SelectItem value="offered">
								<Trans>Offres envoyées</Trans> ({statusCounts.offered ?? 0})
							</SelectItem>
							<SelectItem value="rejected">
								<Trans>Refusées</Trans> ({statusCounts.rejected ?? 0})
							</SelectItem>
							<SelectItem value="hired">
								<Trans>Recrutées</Trans> ({statusCounts.hired ?? 0})
							</SelectItem>
						</SelectContent>
					</Select>
				</CardContent>
			</Card>

			{/* Applications list */}
			{isLoading ? (
				<ApplicationsSkeleton />
			) : isError ? (
				<Card>
					<CardContent className="py-8 text-center text-muted-foreground">
						<p className="font-medium">
							<Trans>Impossible de charger les candidatures</Trans>
						</p>
						<p className="mt-1 text-sm">
							<Trans>Veuillez réessayer plus tard ou contacter le support.</Trans>
						</p>
					</CardContent>
				</Card>
			) : allApplications.length === 0 ? (
				<Card>
					<CardContent className="py-12 text-center">
						<ClipboardTextIcon className="mx-auto mb-3 size-10 text-muted-foreground opacity-50" />
						<p className="font-medium text-muted-foreground">
							<Trans>Aucune candidature trouvée</Trans>
						</p>
						<p className="mt-1 text-muted-foreground text-sm">
							{jobFilter !== "all" || statusFilter !== "all" ? (
								<Trans>Modifiez vos filtres pour afficher plus de résultats.</Trans>
							) : (
								<Trans>Les candidatures apparaîtront ici lorsque les candidats répondront à vos offres.</Trans>
							)}
						</p>
					</CardContent>
				</Card>
			) : (
				<div className="space-y-4">
					<p className="text-muted-foreground text-sm">
						{allApplications.length}{" "}
						{allApplications.length === 1 ? <Trans>candidature</Trans> : <Trans>candidatures</Trans>}
					</p>
					{allApplications.map((app) => (
						<ApplicationCard
							key={app.id}
							application={app}
							onReview={handleReview}
							onShortlist={handleShortlist}
							onScheduleInterview={handleScheduleInterview}
							onReject={handleReject}
							onHire={handleHire}
						/>
					))}
				</div>
			)}
		</div>
	);
}
