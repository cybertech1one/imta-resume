import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import {
	CalendarIcon,
	CurrencyCircleDollarIcon,
	FloppyDiskIcon,
	NotePencilIcon,
	PaperPlaneTiltIcon,
} from "@phosphor-icons/react";
import { useMutation } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { ErrorComponent } from "@/components/error-component";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { orpc } from "@/integrations/orpc/client";
import { DashboardHeader } from "../-components/header";

// biome-ignore lint/suspicious/noExplicitAny: Route path not in generated route tree
export const Route = createFileRoute("/dashboard/partner/post-job" as any)({
	component: PostJobPage,
	errorComponent: ErrorComponent,
});

type JobFormData = {
	title: string;
	titleFr: string;
	description: string;
	descriptionFr: string;
	location: string;
	region: string;
	jobType: string;
	experienceLevel: string;
	field: string;
	skills: string;
	salaryMin: string;
	salaryMax: string;
	benefits: string;
	deadline: string;
	startDate: string;
	positions: string;
};

const initialFormData: JobFormData = {
	title: "",
	titleFr: "",
	description: "",
	descriptionFr: "",
	location: "",
	region: "",
	jobType: "",
	experienceLevel: "",
	field: "",
	skills: "",
	salaryMin: "",
	salaryMax: "",
	benefits: "",
	deadline: "",
	startDate: "",
	positions: "1",
};

const JOB_TYPES = [
	{ value: "cdi", label: "CDI (Contrat a Duree Indeterminee)" },
	{ value: "cdd", label: "CDD (Contrat a Duree Determinee)" },
	{ value: "stage", label: "Stage" },
	{ value: "alternance", label: "Alternance" },
	{ value: "freelance", label: "Freelance" },
] as const;

const EXPERIENCE_LEVELS = [
	{ value: "junior", label: "Junior (0-2 ans)" },
	{ value: "mid", label: "Intermediaire (2-5 ans)" },
	{ value: "senior", label: "Senior (5-10 ans)" },
	{ value: "lead", label: "Lead / Expert (10+ ans)" },
	{ value: "entry", label: "Debutant / Stagiaire" },
] as const;

const FIELDS = [
	{ value: "engineering", label: "Ingenierie" },
	{ value: "it", label: "Informatique / IT" },
	{ value: "finance", label: "Finance" },
	{ value: "marketing", label: "Marketing" },
	{ value: "management", label: "Management" },
	{ value: "logistics", label: "Logistique" },
	{ value: "hr", label: "Ressources Humaines" },
	{ value: "sales", label: "Commercial" },
	{ value: "research", label: "Recherche & Developpement" },
	{ value: "other", label: "Autre" },
] as const;

const REGIONS = [
	{ value: "casablanca-settat", label: "Casablanca-Settat" },
	{ value: "rabat-sale-kenitra", label: "Rabat-Sale-Kenitra" },
	{ value: "tanger-tetouan-al-hoceima", label: "Tanger-Tetouan-Al Hoceima" },
	{ value: "marrakech-safi", label: "Marrakech-Safi" },
	{ value: "fes-meknes", label: "Fes-Meknes" },
	{ value: "souss-massa", label: "Souss-Massa" },
	{ value: "oriental", label: "Oriental" },
	{ value: "beni-mellal-khenifra", label: "Beni Mellal-Khenifra" },
	{ value: "draa-tafilalet", label: "Draa-Tafilalet" },
	{ value: "laayoune-sakia-el-hamra", label: "Laayoune-Sakia El Hamra" },
	{ value: "dakhla-oued-ed-dahab", label: "Dakhla-Oued Ed-Dahab" },
	{ value: "guelmim-oued-noun", label: "Guelmim-Oued Noun" },
	{ value: "international", label: "International" },
] as const;

function PostJobPage() {
	const navigate = useNavigate();
	const [formData, setFormData] = useState<JobFormData>(initialFormData);

	const createJobMutation = useMutation(orpc.partner.createJob.mutationOptions());
	const publishJobMutation = useMutation(orpc.partner.publishJob.mutationOptions());

	const updateField = useCallback(<K extends keyof JobFormData>(field: K, value: JobFormData[K]) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
	}, []);

	/** Convert a date-only string (YYYY-MM-DD) to ISO datetime (YYYY-MM-DDT00:00:00.000Z) */
	const toISODatetime = (dateStr: string | undefined): string | undefined => {
		if (!dateStr) return undefined;
		// Already an ISO datetime string
		if (dateStr.includes("T")) return dateStr;
		// Date-only from <input type="date"> — append midnight UTC
		return `${dateStr}T00:00:00.000Z`;
	};

	const buildJobPayload = () => ({
		title: formData.title || formData.titleFr,
		titleFr: formData.titleFr || undefined,
		description: formData.description || formData.descriptionFr,
		descriptionFr: formData.descriptionFr || undefined,
		location: formData.location,
		region: formData.region || undefined,
		jobType: formData.jobType,
		experienceLevel: formData.experienceLevel || "entry",
		field: formData.field || undefined,
		skills: formData.skills
			? formData.skills
					.split(",")
					.map((s) => s.trim())
					.filter(Boolean)
			: undefined,
		salaryMin: formData.salaryMin ? Number(formData.salaryMin) : undefined,
		salaryMax: formData.salaryMax ? Number(formData.salaryMax) : undefined,
		salaryCurrency: "MAD",
		benefits: formData.benefits
			? formData.benefits
					.split(",")
					.map((s) => s.trim())
					.filter(Boolean)
			: undefined,
		applicationDeadline: toISODatetime(formData.deadline),
		startDate: toISODatetime(formData.startDate),
		positions: formData.positions ? Number(formData.positions) : 1,
	});

	const handleSaveDraft = async () => {
		try {
			await createJobMutation.mutateAsync(buildJobPayload());
			toast.success(t`Draft saved`);
		} catch {
			toast.error(t`Failed to save draft`);
		}
	};

	const handleSubmitForReview = async () => {
		try {
			const result = await createJobMutation.mutateAsync(buildJobPayload());
			const jobId = (result as { id: string })?.id;
			if (jobId) {
				await publishJobMutation.mutateAsync({ id: jobId });
			}
			toast.success(t`Job submitted for review`);
			navigate({ to: "/dashboard/partner/jobs" as string });
		} catch {
			toast.error(t`Failed to submit job`);
		}
	};

	const isSaving = createJobMutation.isPending;
	const isSubmitting = createJobMutation.isPending || publishJobMutation.isPending;

	const isFormValid =
		formData.titleFr.trim() !== "" &&
		formData.descriptionFr.trim() !== "" &&
		formData.location.trim() !== "" &&
		formData.jobType !== "" &&
		formData.field !== "";

	return (
		<div className="mx-auto w-full max-w-4xl space-y-6 p-4 md:p-6">
			<DashboardHeader title={t`Post a Job`} icon={NotePencilIcon} />

			<p className="text-muted-foreground text-sm">
				<Trans>Fill in the details below to create a new job posting. Fields marked with * are required.</Trans>
			</p>

			{/* Job title */}
			<Card>
				<CardHeader>
					<CardTitle className="text-base">
						<Trans>Job Title</Trans>
					</CardTitle>
					<CardDescription>
						<Trans>Provide the job title in French and optionally in English.</Trans>
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="titleFr">
							<Trans>Title (French)</Trans> *
						</Label>
						<Input
							id="titleFr"
							placeholder={t`e.g. Ingenieur Logiciel Senior`}
							value={formData.titleFr}
							onChange={(e) => updateField("titleFr", e.target.value)}
						/>
					</div>
					<div className="space-y-2">
						<Label htmlFor="title">
							<Trans>Title (English)</Trans>
						</Label>
						<Input
							id="title"
							placeholder={t`e.g. Senior Software Engineer`}
							value={formData.title}
							onChange={(e) => updateField("title", e.target.value)}
						/>
					</div>
				</CardContent>
			</Card>

			{/* Description */}
			<Card>
				<CardHeader>
					<CardTitle className="text-base">
						<Trans>Description</Trans>
					</CardTitle>
					<CardDescription>
						<Trans>Describe the role, responsibilities, and requirements.</Trans>
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="descriptionFr">
							<Trans>Description (French)</Trans> *
						</Label>
						<Textarea
							id="descriptionFr"
							placeholder={t`Describe the position in French...`}
							value={formData.descriptionFr}
							onChange={(e) => updateField("descriptionFr", e.target.value)}
							rows={6}
						/>
					</div>
					<div className="space-y-2">
						<Label htmlFor="description">
							<Trans>Description (English)</Trans>
						</Label>
						<Textarea
							id="description"
							placeholder={t`Describe the position in English...`}
							value={formData.description}
							onChange={(e) => updateField("description", e.target.value)}
							rows={6}
						/>
					</div>
				</CardContent>
			</Card>

			{/* Location & Type */}
			<Card>
				<CardHeader>
					<CardTitle className="text-base">
						<Trans>Location & Type</Trans>
					</CardTitle>
				</CardHeader>
				<CardContent className="grid gap-4 md:grid-cols-2">
					<div className="space-y-2">
						<Label htmlFor="location">
							<Trans>City</Trans> *
						</Label>
						<Input
							id="location"
							placeholder={t`e.g. Casablanca`}
							value={formData.location}
							onChange={(e) => updateField("location", e.target.value)}
						/>
					</div>
					<div className="space-y-2">
						<Label htmlFor="region">
							<Trans>Region</Trans>
						</Label>
						<Select value={formData.region} onValueChange={(val) => updateField("region", val)}>
							<SelectTrigger id="region">
								<SelectValue placeholder={t`Select a region`} />
							</SelectTrigger>
							<SelectContent>
								{REGIONS.map((r) => (
									<SelectItem key={r.value} value={r.value}>
										{r.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
					<div className="space-y-2">
						<Label htmlFor="jobType">
							<Trans>Job Type</Trans> *
						</Label>
						<Select value={formData.jobType} onValueChange={(val) => updateField("jobType", val)}>
							<SelectTrigger id="jobType">
								<SelectValue placeholder={t`Select job type`} />
							</SelectTrigger>
							<SelectContent>
								{JOB_TYPES.map((jt) => (
									<SelectItem key={jt.value} value={jt.value}>
										{jt.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
					<div className="space-y-2">
						<Label htmlFor="experienceLevel">
							<Trans>Experience Level</Trans>
						</Label>
						<Select value={formData.experienceLevel} onValueChange={(val) => updateField("experienceLevel", val)}>
							<SelectTrigger id="experienceLevel">
								<SelectValue placeholder={t`Select level`} />
							</SelectTrigger>
							<SelectContent>
								{EXPERIENCE_LEVELS.map((el) => (
									<SelectItem key={el.value} value={el.value}>
										{el.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				</CardContent>
			</Card>

			{/* Field & Skills */}
			<Card>
				<CardHeader>
					<CardTitle className="text-base">
						<Trans>Field & Skills</Trans>
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="field">
							<Trans>Field</Trans> *
						</Label>
						<Select value={formData.field} onValueChange={(val) => updateField("field", val)}>
							<SelectTrigger id="field">
								<SelectValue placeholder={t`Select field`} />
							</SelectTrigger>
							<SelectContent>
								{FIELDS.map((f) => (
									<SelectItem key={f.value} value={f.value}>
										{f.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
					<div className="space-y-2">
						<Label htmlFor="skills">
							<Trans>Required Skills</Trans>
						</Label>
						<Input
							id="skills"
							placeholder={t`e.g. React, Node.js, PostgreSQL (comma-separated)`}
							value={formData.skills}
							onChange={(e) => updateField("skills", e.target.value)}
						/>
						<p className="text-muted-foreground text-xs">
							<Trans>Separate skills with commas</Trans>
						</p>
					</div>
				</CardContent>
			</Card>

			{/* Salary & Benefits */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2 text-base">
						<CurrencyCircleDollarIcon className="size-5" />
						<Trans>Compensation</Trans>
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid gap-4 md:grid-cols-2">
						<div className="space-y-2">
							<Label htmlFor="salaryMin">
								<Trans>Salary Min (MAD/month)</Trans>
							</Label>
							<Input
								id="salaryMin"
								type="number"
								placeholder={t`e.g. 8000`}
								value={formData.salaryMin}
								onChange={(e) => updateField("salaryMin", e.target.value)}
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="salaryMax">
								<Trans>Salary Max (MAD/month)</Trans>
							</Label>
							<Input
								id="salaryMax"
								type="number"
								placeholder={t`e.g. 15000`}
								value={formData.salaryMax}
								onChange={(e) => updateField("salaryMax", e.target.value)}
							/>
						</div>
					</div>
					<div className="space-y-2">
						<Label htmlFor="benefits">
							<Trans>Benefits</Trans>
						</Label>
						<Textarea
							id="benefits"
							placeholder={t`e.g. Assurance maladie, Transport, Restaurant d'entreprise...`}
							value={formData.benefits}
							onChange={(e) => updateField("benefits", e.target.value)}
							rows={3}
						/>
					</div>
				</CardContent>
			</Card>

			{/* Dates & Positions */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2 text-base">
						<CalendarIcon className="size-5" />
						<Trans>Timeline & Capacity</Trans>
					</CardTitle>
				</CardHeader>
				<CardContent className="grid gap-4 md:grid-cols-3">
					<div className="space-y-2">
						<Label htmlFor="deadline">
							<Trans>Application Deadline</Trans>
						</Label>
						<Input
							id="deadline"
							type="date"
							value={formData.deadline}
							onChange={(e) => updateField("deadline", e.target.value)}
						/>
					</div>
					<div className="space-y-2">
						<Label htmlFor="startDate">
							<Trans>Start Date</Trans>
						</Label>
						<Input
							id="startDate"
							type="date"
							value={formData.startDate}
							onChange={(e) => updateField("startDate", e.target.value)}
						/>
					</div>
					<div className="space-y-2">
						<Label htmlFor="positions">
							<Trans>Number of Positions</Trans>
						</Label>
						<Input
							id="positions"
							type="number"
							min="1"
							value={formData.positions}
							onChange={(e) => updateField("positions", e.target.value)}
						/>
					</div>
				</CardContent>
			</Card>

			{/* Form actions */}
			<div className="flex items-center justify-between rounded-lg border bg-card p-4">
				<div className="flex items-center gap-2">
					{!isFormValid && (
						<Badge variant="outline" className="text-yellow-700 dark:text-yellow-300">
							<Trans>Required fields missing</Trans>
						</Badge>
					)}
				</div>
				<div className="flex items-center gap-3">
					<Button variant="outline" className="gap-2" onClick={handleSaveDraft} disabled={isSaving}>
						<FloppyDiskIcon className="size-4" />
						{isSaving ? <Trans>Saving...</Trans> : <Trans>Save as Draft</Trans>}
					</Button>
					<Button className="gap-2" onClick={handleSubmitForReview} disabled={!isFormValid || isSubmitting}>
						<PaperPlaneTiltIcon className="size-4" />
						{isSubmitting ? <Trans>Submitting...</Trans> : <Trans>Submit for Review</Trans>}
					</Button>
				</div>
			</div>
		</div>
	);
}
