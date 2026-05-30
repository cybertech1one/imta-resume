import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import {
	BriefcaseIcon,
	BuildingsIcon,
	CalendarIcon,
	CaretLeftIcon,
	CaretRightIcon,
	ClockIcon,
	CurrencyCircleDollarIcon,
	FunnelIcon,
	MagnifyingGlassIcon,
	MapPinIcon,
	PaperPlaneTiltIcon,
} from "@phosphor-icons/react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { ErrorComponent } from "@/components/error-component";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useDebounce } from "@/hooks/use-debounce";
import { authClient } from "@/integrations/auth/client";
import { orpc } from "@/integrations/orpc/client";
import { DashboardHeader } from "../-components/header";

// biome-ignore lint/suspicious/noExplicitAny: Route path not in generated route tree
export const Route = createFileRoute("/dashboard/jobs/board" as any)({
	component: JobBoardPage,
	errorComponent: ErrorComponent,
});

type BoardJob = {
	id: string;
	title: string;
	titleFr: string | null;
	// companyName/companyLogo come from partner_profile (not joined by default)
	companyName?: string | null;
	companyLogo?: string | null;
	location: string;
	region: string | null;
	jobType: string;
	field: string | null;
	salaryMin: number | null;
	salaryMax: number | null;
	// Drizzle maps application_deadline -> applicationDeadline
	applicationDeadline?: string | null;
	description: string;
	descriptionFr: string | null;
	skills: string[] | null;
	experienceLevel: string;
	positions: number | null;
	createdAt: string;
};

const JOB_TYPE_LABELS: Record<string, string> = {
	cdi: "CDI",
	cdd: "CDD",
	stage: "Stage",
	alternance: "Alternance",
	freelance: "Freelance",
};

const FIELD_OPTIONS = [
	{ value: "all", label: "Tous les domaines" },
	{ value: "engineering", label: "Ingénierie" },
	{ value: "it", label: "Informatique / IT" },
	{ value: "finance", label: "Finance" },
	{ value: "marketing", label: "Marketing" },
	{ value: "management", label: "Management" },
	{ value: "logistics", label: "Logistique" },
	{ value: "hr", label: "Ressources humaines" },
	{ value: "sales", label: "Commercial" },
	{ value: "research", label: "R&D" },
] as const;

const LOCATION_OPTIONS = [
	{ value: "all", label: "Toutes les villes" },
	{ value: "casablanca", label: "Casablanca" },
	{ value: "rabat", label: "Rabat" },
	{ value: "tanger", label: "Tanger" },
	{ value: "marrakech", label: "Marrakech" },
	{ value: "fes", label: "Fès" },
	{ value: "agadir", label: "Agadir" },
	{ value: "meknes", label: "Meknès" },
	{ value: "oujda", label: "Oujda" },
	{ value: "kenitra", label: "Kénitra" },
] as const;

const JOB_TYPE_OPTIONS = [
	{ value: "all", label: "Tous les types" },
	{ value: "cdi", label: "CDI" },
	{ value: "cdd", label: "CDD" },
	{ value: "stage", label: "Stage" },
	{ value: "alternance", label: "Alternance" },
	{ value: "freelance", label: "Freelance" },
] as const;

const ITEMS_PER_PAGE = 12;
const MAD_FORMATTER = new Intl.NumberFormat("fr-FR", {
	maximumFractionDigits: 0,
	style: "currency",
	currency: "MAD",
});
const SHORT_DATE_FORMATTER = new Intl.DateTimeFormat("fr-FR", {
	day: "numeric",
	month: "short",
});

function formatSalary(min: number | null, max: number | null): string | null {
	if (min === null && max === null) return null;
	if (min !== null && max !== null) {
		return `${MAD_FORMATTER.format(min)} - ${MAD_FORMATTER.format(max)}`;
	}
	if (min !== null) return `${MAD_FORMATTER.format(min)} et plus`;
	if (max !== null) return `${MAD_FORMATTER.format(max)} max`;
	return null;
}

function formatDeadlineStatus(daysLeft: number | null, isExpired: boolean): string | null {
	if (daysLeft === null) return null;
	if (isExpired) return t`Expirée`;
	if (daysLeft <= 0) return t`Dernier jour`;
	if (daysLeft === 1) return t`1 jour restant`;
	return t`${daysLeft} jours restants`;
}

function JobBoardCard({ job, onApply }: { job: BoardJob; onApply: (job: BoardJob) => void }) {
	const deadlineDate = job.applicationDeadline ? new Date(job.applicationDeadline) : null;
	const isExpired = deadlineDate ? deadlineDate < new Date() : false;
	const daysLeft = deadlineDate ? Math.ceil((deadlineDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : null;
	const deadlineStatus = formatDeadlineStatus(daysLeft, isExpired);

	const salary = formatSalary(job.salaryMin, job.salaryMax);

	return (
		<Card className="flex h-full flex-col transition-shadow hover:shadow-md">
			<CardHeader className="flex-1 pb-3">
				<div className="flex items-start gap-3">
					<div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted">
						{job.companyLogo ? (
							<img
								src={job.companyLogo}
								alt={job.companyName ?? ""}
								width={32}
								height={32}
								loading="lazy"
								className="size-8 rounded object-contain"
							/>
						) : (
							<BuildingsIcon aria-hidden="true" className="size-5 text-muted-foreground" />
						)}
					</div>
					<div className="min-w-0 flex-1">
						<CardTitle className="line-clamp-2 text-base leading-tight">{job.titleFr || job.title}</CardTitle>
						{job.companyName && (
							<CardDescription className="mt-0.5 truncate text-sm">{job.companyName}</CardDescription>
						)}
					</div>
				</div>

				<div className="mt-3 flex flex-wrap gap-1.5">
					<Badge variant="outline" className="gap-1 text-xs">
						<MapPinIcon aria-hidden="true" className="size-3" />
						{job.location}
					</Badge>
					<Badge variant="outline" className="text-xs">
						{JOB_TYPE_LABELS[job.jobType] ?? job.jobType}
					</Badge>
					{salary && (
						<Badge variant="outline" className="gap-1 text-xs">
							<CurrencyCircleDollarIcon aria-hidden="true" className="size-3" />
							{salary}
						</Badge>
					)}
				</div>

				{(job.skills?.length ?? 0) > 0 && (
					<div className="mt-2 flex flex-wrap gap-1">
						{(job.skills ?? []).slice(0, 4).map((skill) => (
							<Badge key={skill} variant="secondary" className="text-xs">
								{skill}
							</Badge>
						))}
						{(job.skills?.length ?? 0) > 4 && (
							<Badge variant="secondary" className="text-xs">
								+{(job.skills?.length ?? 0) - 4}
							</Badge>
						)}
					</div>
				)}
			</CardHeader>

			<CardContent className="pt-0">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-2 text-muted-foreground text-xs">
						{deadlineDate && (
							<span
								className={`flex items-center gap-1 ${isExpired ? "text-red-600" : daysLeft !== null && daysLeft <= 7 ? "text-yellow-600" : ""}`}
							>
								<ClockIcon aria-hidden="true" className="size-3" />
								{deadlineStatus}
							</span>
						)}
						<span className="flex items-center gap-1">
							<CalendarIcon aria-hidden="true" className="size-3" />
							{SHORT_DATE_FORMATTER.format(new Date(job.createdAt))}
						</span>
					</div>
					<Button size="sm" className="gap-1.5" disabled={isExpired} onClick={() => onApply(job)}>
						<PaperPlaneTiltIcon aria-hidden="true" className="size-3.5" />
						<Trans>Postuler</Trans>
					</Button>
				</div>
			</CardContent>
		</Card>
	);
}

function JobBoardSkeleton() {
	return (
		<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
			{Array.from({ length: 6 }).map((_, i) => (
				<Card key={`board-skel-${i}`} className="flex h-full flex-col">
					<CardHeader className="flex-1 pb-3">
						<div className="flex items-start gap-3">
							<Skeleton className="size-10 rounded-lg" />
							<div className="flex-1 space-y-2">
								<Skeleton className="h-5 w-3/4" />
								<Skeleton className="h-3 w-1/2" />
							</div>
						</div>
						<div className="mt-3 flex gap-2">
							<Skeleton className="h-5 w-20" />
							<Skeleton className="h-5 w-14" />
							<Skeleton className="h-5 w-28" />
						</div>
					</CardHeader>
					<CardContent className="pt-0">
						<div className="flex items-center justify-between">
							<Skeleton className="h-3 w-20" />
							<Skeleton className="h-8 w-20" />
						</div>
					</CardContent>
				</Card>
			))}
		</div>
	);
}

function ApplyDialog({
	job,
	open,
	onOpenChange,
}: {
	job: BoardJob | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}) {
	const [coverLetter, setCoverLetter] = useState("");
	const applyMutation = useMutation(orpc.partner.applyToJob.mutationOptions());

	const handleSubmit = async () => {
		if (!job) return;
		try {
			await applyMutation.mutateAsync({
				jobId: job.id,
				coverLetter: coverLetter.trim() || undefined,
			});
			toast.success(t`Candidature envoyée`);
			onOpenChange(false);
			setCoverLetter("");
		} catch {
			toast.error(t`Impossible d'envoyer la candidature. Réessaie dans un instant.`);
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[500px]">
				<DialogHeader>
					<DialogTitle>
						<Trans>Postuler à</Trans> {job?.titleFr || job?.title}
					</DialogTitle>
					<DialogDescription>
						{job?.companyName} &middot; {job?.location}
					</DialogDescription>
				</DialogHeader>
				<div className="space-y-4 py-2">
					<p className="text-muted-foreground text-sm">
						<Trans>
							Ton CV et les informations de ton profil seront partagés avec l'employeur. Tu peux ajouter un message de
							motivation court si tu veux personnaliser ta candidature.
						</Trans>
					</p>
					<div className="space-y-2">
						<label htmlFor="coverLetter" className="font-medium text-sm">
							<Trans>Message de motivation (facultatif)</Trans>
						</label>
						<Textarea
							id="coverLetter"
							name="coverLetter"
							autoComplete="off"
							placeholder={t`Présente rapidement ton profil, ta disponibilité ou ce qui t'intéresse dans cette offre…`}
							value={coverLetter}
							onChange={(e) => setCoverLetter(e.target.value)}
							rows={5}
						/>
					</div>
				</div>
				<div className="flex justify-end gap-3">
					<Button variant="outline" onClick={() => onOpenChange(false)}>
						<Trans>Annuler</Trans>
					</Button>
					<Button className="gap-2" onClick={handleSubmit} disabled={applyMutation.isPending}>
						<PaperPlaneTiltIcon aria-hidden="true" className="size-4" />
						{applyMutation.isPending ? <Trans>Envoi…</Trans> : <Trans>Envoyer la candidature</Trans>}
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
}

function JobBoardPage() {
	const { data: session } = authClient.useSession();
	const [searchQuery, setSearchQuery] = useState("");
	const debouncedSearch = useDebounce(searchQuery, 300);
	const [locationFilter, setLocationFilter] = useState("all");
	const [fieldFilter, setFieldFilter] = useState("all");
	const [typeFilter, setTypeFilter] = useState("all");
	const [currentPage, setCurrentPage] = useState(1);
	const [applyJob, setApplyJob] = useState<BoardJob | null>(null);

	const {
		data: jobsData,
		isLoading,
		isError,
	} = useQuery({
		...orpc.partner.listPublishedJobs.queryOptions({
			input: {
				search: debouncedSearch || undefined,
				location: locationFilter !== "all" ? locationFilter : undefined,
				field: fieldFilter !== "all" ? fieldFilter : undefined,
				jobType: typeFilter !== "all" ? typeFilter : undefined,
				page: currentPage,
				limit: ITEMS_PER_PAGE,
			},
		}),
		enabled: !!session?.user,
		staleTime: 2 * 60 * 1000,
		gcTime: 5 * 60 * 1000,
	});

	const rawData = jobsData as { jobs: BoardJob[]; total: number } | undefined;
	const jobs = rawData?.jobs ?? [];
	const totalJobs = rawData?.total ?? 0;
	const totalPages = Math.ceil(totalJobs / ITEMS_PER_PAGE);

	const handleApply = (job: BoardJob) => {
		setApplyJob(job);
	};

	return (
		<div className="mx-auto w-full max-w-6xl space-y-6 p-4 md:p-6">
			<DashboardHeader title={t`Offres disponibles`} icon={BriefcaseIcon} />

			<p className="text-muted-foreground text-sm">
				<Trans>Explore les stages et emplois publiés par les entreprises partenaires d'IMTA.</Trans>
			</p>

			{/* Search & Filters */}
			<Card>
				<CardContent className="space-y-4 pt-4">
					<div className="relative">
						<MagnifyingGlassIcon
							aria-hidden="true"
							className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
						/>
						<Input
							aria-label={t`Rechercher une offre`}
							name="jobSearch"
							autoComplete="off"
							placeholder={t`Recherche par poste, entreprise ou compétence…`}
							value={searchQuery}
							onChange={(e) => {
								setSearchQuery(e.target.value);
								setCurrentPage(1);
							}}
							className="pl-9"
						/>
					</div>

					<div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
						<FunnelIcon aria-hidden="true" className="hidden size-4 shrink-0 text-muted-foreground sm:block" />
						<Select
							value={locationFilter}
							onValueChange={(val) => {
								setLocationFilter(val);
								setCurrentPage(1);
							}}
						>
							<SelectTrigger aria-label={t`Filtrer par ville`} className="w-full sm:w-[170px]">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{LOCATION_OPTIONS.map((opt) => (
									<SelectItem key={opt.value} value={opt.value}>
										{opt.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>

						<Select
							value={fieldFilter}
							onValueChange={(val) => {
								setFieldFilter(val);
								setCurrentPage(1);
							}}
						>
							<SelectTrigger aria-label={t`Filtrer par domaine`} className="w-full sm:w-[180px]">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{FIELD_OPTIONS.map((opt) => (
									<SelectItem key={opt.value} value={opt.value}>
										{opt.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>

						<Select
							value={typeFilter}
							onValueChange={(val) => {
								setTypeFilter(val);
								setCurrentPage(1);
							}}
						>
							<SelectTrigger aria-label={t`Filtrer par type de contrat`} className="w-full sm:w-[160px]">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{JOB_TYPE_OPTIONS.map((opt) => (
									<SelectItem key={opt.value} value={opt.value}>
										{opt.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				</CardContent>
			</Card>

			{/* Results count */}
			{!isLoading && !isError && (
				<p className="text-muted-foreground text-sm">
					{totalJobs} {totalJobs === 1 ? <Trans>offre trouvée</Trans> : <Trans>offres trouvées</Trans>}
				</p>
			)}

			{/* Job grid */}
			{isLoading ? (
				<JobBoardSkeleton />
			) : isError ? (
				<Card>
					<CardContent className="py-8 text-center text-muted-foreground">
						<p className="font-medium">
							<Trans>Impossible de charger les offres</Trans>
						</p>
						<p className="mt-1 text-sm">
							<Trans>Réessaie dans quelques instants.</Trans>
						</p>
					</CardContent>
				</Card>
			) : jobs.length === 0 ? (
				<Card>
					<CardContent className="py-12 text-center">
						<BriefcaseIcon aria-hidden="true" className="mx-auto mb-3 size-10 text-muted-foreground opacity-50" />
						<p className="font-medium text-muted-foreground">
							<Trans>Aucune offre ne correspond à tes critères</Trans>
						</p>
						<p className="mt-1 text-muted-foreground text-sm">
							<Trans>Essaie d'élargir ta recherche ou de modifier les filtres.</Trans>
						</p>
					</CardContent>
				</Card>
			) : (
				<>
					<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
						{jobs.map((job) => (
							<JobBoardCard key={job.id} job={job} onApply={handleApply} />
						))}
					</div>

					{/* Pagination */}
					{totalPages > 1 && (
						<div className="flex items-center justify-center gap-2 pt-4">
							<Button
								variant="outline"
								size="sm"
								disabled={currentPage === 1}
								onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
								className="gap-1"
							>
								<CaretLeftIcon aria-hidden="true" className="size-4" />
								<Trans>Précédent</Trans>
							</Button>
							<span className="px-3 text-muted-foreground text-sm">
								{currentPage} / {totalPages}
							</span>
							<Button
								variant="outline"
								size="sm"
								disabled={currentPage === totalPages}
								onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
								className="gap-1"
							>
								<Trans>Suivant</Trans>
								<CaretRightIcon aria-hidden="true" className="size-4" />
							</Button>
						</div>
					)}
				</>
			)}

			{/* Apply dialog */}
			<ApplyDialog
				job={applyJob}
				open={applyJob !== null}
				onOpenChange={(open) => {
					if (!open) setApplyJob(null);
				}}
			/>
		</div>
	);
}
