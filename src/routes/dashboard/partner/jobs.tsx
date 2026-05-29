import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import {
	BriefcaseIcon,
	ClockIcon,
	MapPinIcon,
	PencilSimpleIcon,
	PlusIcon,
	ProhibitIcon,
	UsersIcon,
} from "@phosphor-icons/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { ErrorComponent } from "@/components/error-component";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { authClient } from "@/integrations/auth/client";
import { orpc } from "@/integrations/orpc/client";
import { DashboardHeader } from "../-components/header";

// biome-ignore lint/suspicious/noExplicitAny: Route path not in generated route tree
export const Route = createFileRoute("/dashboard/partner/jobs" as any)({
	component: PartnerJobsPage,
	errorComponent: ErrorComponent,
});

const jobTypeLabels: Record<string, string> = {
	cdi: "CDI",
	cdd: "CDD",
	stage: "Stage",
	alternance: "Alternance",
	freelance: "Freelance",
};

function JobStatusBadge({ status }: { status: string }) {
	const variants: Record<string, { label: string; className: string }> = {
		draft: {
			label: t`Draft`,
			className: "bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300",
		},
		pending_review: {
			label: t`Pending Review`,
			className: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
		},
		published: {
			label: t`Published`,
			className: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
		},
		expired: {
			label: t`Expired`,
			className: "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300",
		},
		closed: {
			label: t`Closed`,
			className: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
		},
		rejected: {
			label: t`Rejected`,
			className: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
		},
	};
	const variant = variants[status] ?? variants.draft;
	return <Badge className={variant.className}>{variant.label}</Badge>;
}

type PartnerJobRow = {
	id: string;
	title: string;
	titleFr: string | null;
	location: string;
	region: string | null;
	jobType: string;
	status: string;
	applicationCount: number;
	applicationDeadline: Date | null;
	createdAt: Date;
};

function JobCard({
	job,
	onEdit,
	onPublish,
	onClose,
}: {
	job: PartnerJobRow;
	onEdit: (id: string) => void;
	onPublish: (id: string) => void;
	onClose: (id: string) => void;
}) {
	const isExpired = job.applicationDeadline ? new Date(job.applicationDeadline) < new Date() : false;

	return (
		<Card className="transition-shadow hover:shadow-md">
			<CardHeader className="pb-3">
				<div className="flex items-start justify-between gap-3">
					<div className="min-w-0 flex-1">
						<CardTitle className="text-base">{job.titleFr || job.title}</CardTitle>
						{job.titleFr && job.title !== job.titleFr && (
							<CardDescription className="mt-0.5 text-xs">{job.title}</CardDescription>
						)}
					</div>
					<JobStatusBadge status={job.status} />
				</div>
			</CardHeader>
			<CardContent className="space-y-3">
				<div className="flex flex-wrap gap-2 text-muted-foreground text-sm">
					<span className="flex items-center gap-1">
						<MapPinIcon className="size-3.5" />
						{job.location}
						{job.region && `, ${job.region}`}
					</span>
					<span className="flex items-center gap-1">
						<BriefcaseIcon className="size-3.5" />
						{jobTypeLabels[job.jobType] ?? job.jobType}
					</span>
					<span className="flex items-center gap-1">
						<UsersIcon className="size-3.5" />
						{job.applicationCount} <Trans>applications</Trans>
					</span>
					{job.applicationDeadline && (
						<span className={`flex items-center gap-1 ${isExpired ? "text-red-600" : ""}`}>
							<ClockIcon className="size-3.5" />
							{isExpired ? <Trans>Expired</Trans> : null}{" "}
							{new Date(job.applicationDeadline).toLocaleDateString("fr-FR", {
								day: "numeric",
								month: "short",
								year: "numeric",
							})}
						</span>
					)}
				</div>

				<div className="flex items-center gap-2 pt-1">
					<Button variant="outline" size="sm" className="gap-1.5" onClick={() => onEdit(job.id)}>
						<PencilSimpleIcon className="size-3.5" />
						<Trans>Edit</Trans>
					</Button>
					{job.status === "draft" && (
						<Button variant="outline" size="sm" className="gap-1.5" onClick={() => onPublish(job.id)}>
							<BriefcaseIcon className="size-3.5" />
							<Trans>Publish</Trans>
						</Button>
					)}
					{job.status === "published" && (
						<Button
							variant="outline"
							size="sm"
							className="gap-1.5 text-red-600 hover:text-red-700"
							onClick={() => onClose(job.id)}
						>
							<ProhibitIcon className="size-3.5" />
							<Trans>Close</Trans>
						</Button>
					)}
				</div>
			</CardContent>
		</Card>
	);
}

function JobListSkeleton() {
	return (
		<div className="grid gap-4 md:grid-cols-2">
			{Array.from({ length: 4 }).map((_, i) => (
				<Card key={`job-skel-${i}`}>
					<CardHeader className="pb-3">
						<div className="flex items-start justify-between">
							<div className="space-y-2">
								<Skeleton className="h-5 w-48" />
								<Skeleton className="h-3 w-32" />
							</div>
							<Skeleton className="h-6 w-20" />
						</div>
					</CardHeader>
					<CardContent className="space-y-3">
						<div className="flex gap-4">
							<Skeleton className="h-4 w-24" />
							<Skeleton className="h-4 w-16" />
							<Skeleton className="h-4 w-28" />
						</div>
						<div className="flex gap-2">
							<Skeleton className="h-8 w-16" />
							<Skeleton className="h-8 w-20" />
						</div>
					</CardContent>
				</Card>
			))}
		</div>
	);
}

function PartnerJobsPage() {
	const { data: session } = authClient.useSession();
	const navigate = useNavigate();
	const [activeTab, setActiveTab] = useState<string>("all");

	const {
		data: jobs = [],
		isLoading,
		isError,
	} = useQuery({
		...orpc.partner.getMyJobs.queryOptions(),
		enabled: !!session?.user,
		staleTime: 2 * 60 * 1000,
		gcTime: 5 * 60 * 1000,
	});

	const allJobs = jobs as PartnerJobRow[];

	const filteredJobs = useMemo(() => {
		if (activeTab === "all") return allJobs;
		if (activeTab === "draft") return allJobs.filter((j) => j.status === "draft" || j.status === "pending_review");
		if (activeTab === "published") return allJobs.filter((j) => j.status === "published");
		if (activeTab === "closed")
			return allJobs.filter((j) => j.status === "closed" || j.status === "expired" || j.status === "rejected");
		return allJobs;
	}, [allJobs, activeTab]);

	const counts = useMemo(
		() => ({
			all: allJobs.length,
			draft: allJobs.filter((j) => j.status === "draft" || j.status === "pending_review").length,
			published: allJobs.filter((j) => j.status === "published").length,
			closed: allJobs.filter((j) => j.status === "closed" || j.status === "expired" || j.status === "rejected").length,
		}),
		[allJobs],
	);

	const queryClient = useQueryClient();
	const publishMutation = useMutation(orpc.partner.publishJob.mutationOptions());
	const closeMutation = useMutation(orpc.partner.closeJob.mutationOptions());

	const handleEdit = (_id: string) => {
		navigate({ to: "/dashboard/partner/post-job" as string });
	};

	const handlePublish = async (id: string) => {
		try {
			await publishMutation.mutateAsync({ id });
			toast.success(t`Job submitted for review`);
			queryClient.invalidateQueries({ queryKey: ["partner"] });
		} catch {
			toast.error(t`Failed to publish job`);
		}
	};

	const handleClose = async (id: string) => {
		try {
			await closeMutation.mutateAsync({ id });
			toast.success(t`Job closed`);
			queryClient.invalidateQueries({ queryKey: ["partner"] });
		} catch {
			toast.error(t`Failed to close job`);
		}
	};

	return (
		<div className="mx-auto w-full max-w-6xl space-y-6 p-4 md:p-6">
			<DashboardHeader title={t`Job Postings`} icon={BriefcaseIcon} />

			<div className="flex items-center justify-between">
				<p className="text-muted-foreground text-sm">
					<Trans>Manage your job postings and track applications</Trans>
				</p>
				<Button onClick={() => navigate({ to: "/dashboard/partner/post-job" as string })} className="gap-2">
					<PlusIcon className="size-4" />
					<Trans>Post New Job</Trans>
				</Button>
			</div>

			<Tabs value={activeTab} onValueChange={setActiveTab}>
				<TabsList>
					<TabsTrigger value="all">
						<Trans>All</Trans> ({counts.all})
					</TabsTrigger>
					<TabsTrigger value="draft">
						<Trans>Draft</Trans> ({counts.draft})
					</TabsTrigger>
					<TabsTrigger value="published">
						<Trans>Published</Trans> ({counts.published})
					</TabsTrigger>
					<TabsTrigger value="closed">
						<Trans>Closed</Trans> ({counts.closed})
					</TabsTrigger>
				</TabsList>

				<TabsContent value={activeTab} className="mt-4">
					{isLoading ? (
						<JobListSkeleton />
					) : isError ? (
						<Card>
							<CardContent className="py-8 text-center text-muted-foreground">
								<p className="font-medium">
									<Trans>Unable to load job postings</Trans>
								</p>
								<p className="mt-1 text-sm">
									<Trans>Please try again later or contact support.</Trans>
								</p>
							</CardContent>
						</Card>
					) : filteredJobs.length === 0 ? (
						<Card>
							<CardContent className="py-12 text-center">
								<BriefcaseIcon className="mx-auto mb-3 size-10 text-muted-foreground opacity-50" />
								<p className="font-medium text-muted-foreground">
									{activeTab === "all" ? <Trans>No job postings yet</Trans> : <Trans>No {activeTab} jobs</Trans>}
								</p>
								<p className="mt-1 text-muted-foreground text-sm">
									<Trans>Create your first job posting to start receiving applications.</Trans>
								</p>
								<Button
									className="mt-4 gap-2"
									onClick={() => navigate({ to: "/dashboard/partner/post-job" as string })}
								>
									<PlusIcon className="size-4" />
									<Trans>Post a Job</Trans>
								</Button>
							</CardContent>
						</Card>
					) : (
						<div className="grid gap-4 md:grid-cols-2">
							{filteredJobs.map((job) => (
								<JobCard key={job.id} job={job} onEdit={handleEdit} onPublish={handlePublish} onClose={handleClose} />
							))}
						</div>
					)}
				</TabsContent>
			</Tabs>
		</div>
	);
}
