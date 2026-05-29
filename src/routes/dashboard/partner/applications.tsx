import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import {
	CalendarIcon,
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
import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { ErrorComponent } from "@/components/error-component";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
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
			label: t`Submitted`,
			className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
			icon: ClipboardTextIcon,
		},
		reviewed: {
			label: t`Reviewed`,
			className: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
			icon: EyeIcon,
		},
		shortlisted: {
			label: t`Shortlisted`,
			className: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
			icon: StarIcon,
		},
		interviewed: {
			label: t`Interviewed`,
			className: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
			icon: CalendarIcon,
		},
		offered: {
			label: t`Offered`,
			className: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200",
			icon: StarIcon,
		},
		rejected: {
			label: t`Rejected`,
			className: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
			icon: XCircleIcon,
		},
		hired: {
			label: t`Hired`,
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
			{score}% <Trans>match</Trans>
		</Badge>
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
								<Trans>Applicant</Trans> {application.userId.slice(0, 8)}
							</CardTitle>
							<CardDescription className="flex items-center gap-1 text-xs">
								<EnvelopeSimpleIcon className="size-3" />
								<Trans>Applied</Trans>{" "}
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
							<Trans>Resume attached</Trans>
						</Badge>
					)}
				</div>

				{application.coverLetter && (
					<p className="line-clamp-2 text-muted-foreground text-sm">{application.coverLetter}</p>
				)}

				<div className="flex flex-wrap items-center gap-2 border-t pt-3">
					{application.status === "submitted" && (
						<Button variant="outline" size="sm" className="gap-1.5" onClick={() => onReview(application.id)}>
							<EyeIcon className="size-3.5" />
							<Trans>Review</Trans>
						</Button>
					)}

					{(application.status === "submitted" || application.status === "reviewed") && (
						<Button variant="outline" size="sm" className="gap-1.5" onClick={() => onShortlist(application.id)}>
							<StarIcon className="size-3.5" />
							<Trans>Shortlist</Trans>
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
								<Trans>Schedule Interview</Trans>
							</Button>
							<Button variant="outline" size="sm" className="gap-1.5" onClick={() => onHire(application.id)}>
								<CheckCircleIcon className="size-3.5" />
								<Trans>Hire</Trans>
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
							<Trans>Reject</Trans>
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
			toast.success(t`Status updated`);
			queryClient.invalidateQueries({ queryKey: ["partner"] });
		} catch {
			toast.error(t`Failed to update status`);
		}
	};

	const handleReview = (id: string) => updateStatus(id, "reviewed");
	const handleShortlist = (id: string) => updateStatus(id, "shortlisted");
	const handleScheduleInterview = (id: string) => updateStatus(id, "interviewed");
	const handleReject = (id: string) => updateStatus(id, "rejected");
	const handleHire = (id: string) => updateStatus(id, "hired");

	return (
		<div className="mx-auto w-full max-w-6xl space-y-6 p-4 md:p-6">
			<DashboardHeader title={t`Applications`} icon={ClipboardTextIcon} />

			<p className="text-muted-foreground text-sm">
				<Trans>Review and manage candidate applications for your job postings.</Trans>
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
							<SelectValue placeholder={t`All Jobs`} />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">
								<Trans>All Jobs</Trans>
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
							<SelectValue placeholder={t`All Statuses`} />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">
								<Trans>All Statuses</Trans> ({statusCounts.all ?? 0})
							</SelectItem>
							<SelectItem value="submitted">
								<Trans>Submitted</Trans> ({statusCounts.submitted ?? 0})
							</SelectItem>
							<SelectItem value="reviewed">
								<Trans>Reviewed</Trans> ({statusCounts.reviewed ?? 0})
							</SelectItem>
							<SelectItem value="shortlisted">
								<Trans>Shortlisted</Trans> ({statusCounts.shortlisted ?? 0})
							</SelectItem>
							<SelectItem value="interviewed">
								<Trans>Interviewed</Trans> ({statusCounts.interviewed ?? 0})
							</SelectItem>
							<SelectItem value="offered">
								<Trans>Offered</Trans> ({statusCounts.offered ?? 0})
							</SelectItem>
							<SelectItem value="rejected">
								<Trans>Rejected</Trans> ({statusCounts.rejected ?? 0})
							</SelectItem>
							<SelectItem value="hired">
								<Trans>Hired</Trans> ({statusCounts.hired ?? 0})
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
							<Trans>Unable to load applications</Trans>
						</p>
						<p className="mt-1 text-sm">
							<Trans>Please try again later or contact support.</Trans>
						</p>
					</CardContent>
				</Card>
			) : allApplications.length === 0 ? (
				<Card>
					<CardContent className="py-12 text-center">
						<ClipboardTextIcon className="mx-auto mb-3 size-10 text-muted-foreground opacity-50" />
						<p className="font-medium text-muted-foreground">
							<Trans>No applications found</Trans>
						</p>
						<p className="mt-1 text-muted-foreground text-sm">
							{jobFilter !== "all" || statusFilter !== "all" ? (
								<Trans>Try adjusting your filters to see more results.</Trans>
							) : (
								<Trans>Applications will appear here when candidates apply to your job postings.</Trans>
							)}
						</p>
					</CardContent>
				</Card>
			) : (
				<div className="space-y-4">
					<p className="text-muted-foreground text-sm">
						{allApplications.length}{" "}
						{allApplications.length === 1 ? <Trans>application</Trans> : <Trans>applications</Trans>}
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
