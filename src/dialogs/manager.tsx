import { lazy, Suspense } from "react";
import { match } from "ts-pattern";
import { Dialog } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useDialogStore } from "./store";

// Lazy-load all dialog components to reduce initial bundle size.
// These are only loaded when the user actually opens a dialog.
const LazyChangePassword = lazy(() =>
	import("./auth/change-password").then((m) => ({ default: m.ChangePasswordDialog })),
);
const LazyEnableTwoFactor = lazy(() =>
	import("./auth/enable-two-factor").then((m) => ({ default: m.EnableTwoFactorDialog })),
);
const LazyDisableTwoFactor = lazy(() =>
	import("./auth/disable-two-factor").then((m) => ({ default: m.DisableTwoFactorDialog })),
);
const LazyCreateApiKey = lazy(() => import("./api-key/create").then((m) => ({ default: m.CreateApiKeyDialog })));
const LazyCreateResume = lazy(() => import("./resume").then((m) => ({ default: m.CreateResumeDialog })));
const LazyUpdateResume = lazy(() => import("./resume").then((m) => ({ default: m.UpdateResumeDialog })));
const LazyDuplicateResume = lazy(() => import("./resume").then((m) => ({ default: m.DuplicateResumeDialog })));
const LazyImportResume = lazy(() => import("./resume/import").then((m) => ({ default: m.ImportResumeDialog })));
const LazyTemplateGallery = lazy(() =>
	import("./resume/template/gallery").then((m) => ({ default: m.TemplateGalleryDialog })),
);
const LazyCreateProfile = lazy(() =>
	import("./resume/sections/profile").then((m) => ({ default: m.CreateProfileDialog })),
);
const LazyUpdateProfile = lazy(() =>
	import("./resume/sections/profile").then((m) => ({ default: m.UpdateProfileDialog })),
);
const LazyCreateExperience = lazy(() =>
	import("./resume/sections/experience").then((m) => ({ default: m.CreateExperienceDialog })),
);
const LazyUpdateExperience = lazy(() =>
	import("./resume/sections/experience").then((m) => ({ default: m.UpdateExperienceDialog })),
);
const LazyCreateEducation = lazy(() =>
	import("./resume/sections/education").then((m) => ({ default: m.CreateEducationDialog })),
);
const LazyUpdateEducation = lazy(() =>
	import("./resume/sections/education").then((m) => ({ default: m.UpdateEducationDialog })),
);
const LazyCreateSkill = lazy(() => import("./resume/sections/skill").then((m) => ({ default: m.CreateSkillDialog })));
const LazyUpdateSkill = lazy(() => import("./resume/sections/skill").then((m) => ({ default: m.UpdateSkillDialog })));
const LazyCreateProject = lazy(() =>
	import("./resume/sections/project").then((m) => ({ default: m.CreateProjectDialog })),
);
const LazyUpdateProject = lazy(() =>
	import("./resume/sections/project").then((m) => ({ default: m.UpdateProjectDialog })),
);
const LazyCreateCertification = lazy(() =>
	import("./resume/sections/certification").then((m) => ({ default: m.CreateCertificationDialog })),
);
const LazyUpdateCertification = lazy(() =>
	import("./resume/sections/certification").then((m) => ({ default: m.UpdateCertificationDialog })),
);
const LazyCreateLanguage = lazy(() =>
	import("./resume/sections/language").then((m) => ({ default: m.CreateLanguageDialog })),
);
const LazyUpdateLanguage = lazy(() =>
	import("./resume/sections/language").then((m) => ({ default: m.UpdateLanguageDialog })),
);
const LazyCreatePublication = lazy(() =>
	import("./resume/sections/publication").then((m) => ({ default: m.CreatePublicationDialog })),
);
const LazyUpdatePublication = lazy(() =>
	import("./resume/sections/publication").then((m) => ({ default: m.UpdatePublicationDialog })),
);
const LazyCreateAward = lazy(() => import("./resume/sections/award").then((m) => ({ default: m.CreateAwardDialog })));
const LazyUpdateAward = lazy(() => import("./resume/sections/award").then((m) => ({ default: m.UpdateAwardDialog })));
const LazyCreateInterest = lazy(() =>
	import("./resume/sections/interest").then((m) => ({ default: m.CreateInterestDialog })),
);
const LazyUpdateInterest = lazy(() =>
	import("./resume/sections/interest").then((m) => ({ default: m.UpdateInterestDialog })),
);
const LazyCreateVolunteer = lazy(() =>
	import("./resume/sections/volunteer").then((m) => ({ default: m.CreateVolunteerDialog })),
);
const LazyUpdateVolunteer = lazy(() =>
	import("./resume/sections/volunteer").then((m) => ({ default: m.UpdateVolunteerDialog })),
);
const LazyCreateReference = lazy(() =>
	import("./resume/sections/reference").then((m) => ({ default: m.CreateReferenceDialog })),
);
const LazyUpdateReference = lazy(() =>
	import("./resume/sections/reference").then((m) => ({ default: m.UpdateReferenceDialog })),
);
const LazyCreateInternship = lazy(() =>
	import("./resume/sections/internship").then((m) => ({ default: m.CreateInternshipDialog })),
);
const LazyUpdateInternship = lazy(() =>
	import("./resume/sections/internship").then((m) => ({ default: m.UpdateInternshipDialog })),
);
const LazyCreateCustomSection = lazy(() =>
	import("./resume/sections/custom").then((m) => ({ default: m.CreateCustomSectionDialog })),
);
const LazyUpdateCustomSection = lazy(() =>
	import("./resume/sections/custom").then((m) => ({ default: m.UpdateCustomSectionDialog })),
);

function DialogFallback() {
	return (
		<div className="p-6">
			<Skeleton className="h-48 w-full" />
		</div>
	);
}

export function DialogManager() {
	const { open, activeDialog, onOpenChange } = useDialogStore();

	const dialogContent = match(activeDialog)
		.with({ type: "auth.change-password" }, () => <LazyChangePassword />)
		.with({ type: "auth.two-factor.enable" }, () => <LazyEnableTwoFactor />)
		.with({ type: "auth.two-factor.disable" }, () => <LazyDisableTwoFactor />)
		.with({ type: "api-key.create" }, () => <LazyCreateApiKey />)
		.with({ type: "resume.create" }, () => <LazyCreateResume />)
		.with({ type: "resume.update" }, ({ data }) => <LazyUpdateResume data={data} />)
		.with({ type: "resume.duplicate" }, ({ data }) => <LazyDuplicateResume data={data} />)
		.with({ type: "resume.import" }, () => <LazyImportResume />)
		.with({ type: "resume.template.gallery" }, () => <LazyTemplateGallery />)
		.with({ type: "resume.sections.profiles.create" }, ({ data }) => <LazyCreateProfile data={data} />)
		.with({ type: "resume.sections.profiles.update" }, ({ data }) => <LazyUpdateProfile data={data} />)
		.with({ type: "resume.sections.experience.create" }, ({ data }) => <LazyCreateExperience data={data} />)
		.with({ type: "resume.sections.experience.update" }, ({ data }) => <LazyUpdateExperience data={data} />)
		.with({ type: "resume.sections.education.create" }, ({ data }) => <LazyCreateEducation data={data} />)
		.with({ type: "resume.sections.education.update" }, ({ data }) => <LazyUpdateEducation data={data} />)
		.with({ type: "resume.sections.skills.create" }, ({ data }) => <LazyCreateSkill data={data} />)
		.with({ type: "resume.sections.skills.update" }, ({ data }) => <LazyUpdateSkill data={data} />)
		.with({ type: "resume.sections.projects.create" }, ({ data }) => <LazyCreateProject data={data} />)
		.with({ type: "resume.sections.projects.update" }, ({ data }) => <LazyUpdateProject data={data} />)
		.with({ type: "resume.sections.certifications.create" }, ({ data }) => <LazyCreateCertification data={data} />)
		.with({ type: "resume.sections.certifications.update" }, ({ data }) => <LazyUpdateCertification data={data} />)
		.with({ type: "resume.sections.languages.create" }, ({ data }) => <LazyCreateLanguage data={data} />)
		.with({ type: "resume.sections.languages.update" }, ({ data }) => <LazyUpdateLanguage data={data} />)
		.with({ type: "resume.sections.publications.create" }, ({ data }) => <LazyCreatePublication data={data} />)
		.with({ type: "resume.sections.publications.update" }, ({ data }) => <LazyUpdatePublication data={data} />)
		.with({ type: "resume.sections.awards.create" }, ({ data }) => <LazyCreateAward data={data} />)
		.with({ type: "resume.sections.awards.update" }, ({ data }) => <LazyUpdateAward data={data} />)
		.with({ type: "resume.sections.interests.create" }, ({ data }) => <LazyCreateInterest data={data} />)
		.with({ type: "resume.sections.interests.update" }, ({ data }) => <LazyUpdateInterest data={data} />)
		.with({ type: "resume.sections.volunteer.create" }, ({ data }) => <LazyCreateVolunteer data={data} />)
		.with({ type: "resume.sections.volunteer.update" }, ({ data }) => <LazyUpdateVolunteer data={data} />)
		.with({ type: "resume.sections.references.create" }, ({ data }) => <LazyCreateReference data={data} />)
		.with({ type: "resume.sections.references.update" }, ({ data }) => <LazyUpdateReference data={data} />)
		.with({ type: "resume.sections.internships.create" }, ({ data }) => <LazyCreateInternship data={data} />)
		.with({ type: "resume.sections.internships.update" }, ({ data }) => <LazyUpdateInternship data={data} />)
		.with({ type: "resume.sections.custom.create" }, ({ data }) => <LazyCreateCustomSection data={data} />)
		.with({ type: "resume.sections.custom.update" }, ({ data }) => <LazyUpdateCustomSection data={data} />)
		.otherwise(() => null);

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<Suspense fallback={<DialogFallback />}>{dialogContent}</Suspense>
		</Dialog>
	);
}
