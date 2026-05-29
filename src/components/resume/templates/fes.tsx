import {
	CalendarIcon,
	EnvelopeIcon,
	FlagIcon,
	GlobeIcon,
	IdentificationCardIcon,
	MapPinIcon,
	PhoneIcon,
	ShieldCheckIcon,
	UsersIcon,
} from "@phosphor-icons/react";
import { memo } from "react";
import { cn } from "@/utils/style";
import { getSectionComponent } from "../shared/get-section-component";
import { PageIcon } from "../shared/page-icon";
import { PageLink } from "../shared/page-link";
import { PagePicture } from "../shared/page-picture";
import { useResumeStore } from "../store/resume";
import type { TemplateProps } from "./types";

const sectionClassName = cn(
	// Section Heading - Traditional conservative style
	"[&>h6]:font-bold [&>h6]:text-xs [&>h6]:uppercase [&>h6]:tracking-widest",
	"[&>h6]:mb-3 [&>h6]:border-(--page-primary-color) [&>h6]:border-b [&>h6]:pb-1",
);

/**
 * Template: Fes
 * Named after the historic city of Fes, Morocco
 * Traditional, conservative design ideal for government, banking, and formal sectors
 * Features: Clear hierarchy, formal layout, comprehensive personal information display
 */
export const FesTemplate = memo(function FesTemplate({ pageIndex, pageLayout }: TemplateProps) {
	const isFirstPage = pageIndex === 0;
	const { main, sidebar, fullWidth } = pageLayout;

	return (
		<div className="template-fes page-content px-(--page-margin-x) pt-(--page-margin-y) print:p-0">
			{isFirstPage && <Header />}

			<div className={cn("mt-(--page-gap-y)", !fullWidth && "flex gap-x-(--page-gap-x)")}>
				{/* Main Content */}
				<main data-layout="main" className={cn("group page-main space-y-(--page-gap-y)", !fullWidth && "flex-1")}>
					{main.map((section) => {
						const Component = getSectionComponent(section, { sectionClassName });
						return <Component key={section} id={section} />;
					})}
				</main>

				{/* Sidebar */}
				{!fullWidth && (
					<aside
						data-layout="sidebar"
						className="group page-sidebar w-(--page-sidebar-width) shrink-0 space-y-(--page-gap-y) border-(--page-primary-color)/20 border-l pl-(--page-gap-x)"
					>
						{sidebar.map((section) => {
							const Component = getSectionComponent(section, { sectionClassName });
							return <Component key={section} id={section} />;
						})}
					</aside>
				)}
			</div>
		</div>
	);
});

function Header() {
	const basics = useResumeStore((state) => state.resume.data.basics);
	const metadata = useResumeStore((state) => state.resume.data.metadata);

	// Check for IMTA branding
	const imtaBranding = metadata.imtaBranding;
	const showIMTABranding = imtaBranding?.enabled;

	// Military service status labels (French - formal)
	const militaryServiceLabels: Record<string, string> = {
		"not-applicable": "Non applicable",
		completed: "Accompli",
		exempted: "Dispense",
		pending: "En instance",
		"in-service": "En cours d'accomplissement",
	};

	return (
		<div className="page-header border-(--page-primary-color) border-b-2 pb-(--page-gap-y)">
			{/* IMTA Branding Header (formal style) */}
			{showIMTABranding && (
				<div className="mb-3 border-(--page-primary-color)/30 border-b pb-2 text-center text-xs">
					<span className="font-semibold uppercase tracking-widest">Institut Medi Technology Avicenne</span>
					{imtaBranding?.program && (
						<span className="ml-2 text-muted-foreground">
							- Filiere{" "}
							{imtaBranding.program === "healthcare"
								? "Sante"
								: imtaBranding.program === "industrial"
									? "Industrielle"
									: imtaBranding.program === "hse"
										? "HSE"
										: "Generale"}
						</span>
					)}
					{imtaBranding?.promotionYear && (
						<span className="ml-2 text-muted-foreground">| Promotion {imtaBranding.promotionYear}</span>
					)}
				</div>
			)}

			<div className="flex items-start gap-x-(--page-gap-x)">
				{/* Photo - Left side for formal documents */}
				<PagePicture />

				{/* Main Info Section */}
				<div className="page-basics flex-1">
					{/* Name - Large and prominent */}
					<h2 className="basics-name mb-1 text-center font-bold text-2xl uppercase tracking-wide">{basics.name}</h2>

					{/* Headline */}
					{basics.headline && (
						<p className="basics-headline mb-3 text-center font-medium text-(--page-primary-color)">
							{basics.headline}
						</p>
					)}

					{/* Personal Information Grid - Formal layout */}
					<div className="grid grid-cols-2 gap-x-4 gap-y-1.5 border-(--page-primary-color)/20 border-t pt-3 text-sm">
						{/* Contact Information */}
						{basics.email && (
							<div className="basics-item-email flex items-center gap-2">
								<EnvelopeIcon className="size-4 shrink-0 opacity-70" />
								<PageLink url={`mailto:${basics.email}`} label={basics.email} />
							</div>
						)}

						{basics.phone && (
							<div className="basics-item-phone flex items-center gap-2">
								<PhoneIcon className="size-4 shrink-0 opacity-70" />
								<PageLink url={`tel:${basics.phone}`} label={basics.phone} />
							</div>
						)}

						{basics.location && (
							<div className="basics-item-location flex items-center gap-2">
								<MapPinIcon className="size-4 shrink-0 opacity-70" />
								<span>{basics.location}</span>
							</div>
						)}

						{basics.website.url && (
							<div className="basics-item-website flex items-center gap-2">
								<GlobeIcon className="size-4 shrink-0 opacity-70" />
								<PageLink {...basics.website} />
							</div>
						)}

						{/* Morocco-Specific Fields - Important for formal applications */}
						{basics.cin && (
							<div className="basics-item-cin flex items-center gap-2">
								<IdentificationCardIcon className="size-4 shrink-0 opacity-70" />
								<span>
									<strong>CIN:</strong> {basics.cin}
								</span>
							</div>
						)}

						{basics.dateOfBirth && (
							<div className="basics-item-dob flex items-center gap-2">
								<CalendarIcon className="size-4 shrink-0 opacity-70" />
								<span>
									<strong>Date de naissance:</strong> {basics.dateOfBirth}
								</span>
							</div>
						)}

						{basics.nationality && (
							<div className="basics-item-nationality flex items-center gap-2">
								<FlagIcon className="size-4 shrink-0 opacity-70" />
								<span>
									<strong>Nationalite:</strong> {basics.nationality}
								</span>
							</div>
						)}

						{basics.maritalStatus && (
							<div className="basics-item-marital flex items-center gap-2">
								<UsersIcon className="size-4 shrink-0 opacity-70" />
								<span>
									<strong>Situation familiale:</strong> {basics.maritalStatus}
								</span>
							</div>
						)}

						{basics.militaryServiceStatus && basics.militaryServiceStatus !== "not-applicable" && (
							<div className="basics-item-military col-span-2 flex items-center gap-2">
								<ShieldCheckIcon className="size-4 shrink-0 opacity-70" />
								<span>
									<strong>Service militaire:</strong> {militaryServiceLabels[basics.militaryServiceStatus]}
								</span>
							</div>
						)}
					</div>

					{/* Custom Fields */}
					{basics.customFields.length > 0 && (
						<div className="basics-custom mt-2 flex flex-wrap gap-x-4 gap-y-1 border-(--page-primary-color)/20 border-t pt-2 text-sm">
							{basics.customFields.map((field) => (
								<div key={field.id} className="basics-item-custom flex items-center gap-2">
									<PageIcon icon={field.icon} />
									{field.link ? <PageLink url={field.link} label={field.text} /> : <span>{field.text}</span>}
								</div>
							))}
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
