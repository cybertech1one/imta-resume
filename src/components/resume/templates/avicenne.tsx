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
	// Section Heading - elegant French CV style
	"[&>h6]:border-(--page-primary-color) [&>h6]:border-b-2 [&>h6]:pb-1 [&>h6]:text-(--page-primary-color) [&>h6]:uppercase [&>h6]:tracking-wider",
);

/**
 * Template: Avicenne
 * Named after Institut Medi Technology Avicenne (IMTA)
 * Designed for the Moroccan/French job market with support for Morocco-specific fields
 */
export const AvicenneTemplate = memo(function AvicenneTemplate({ pageIndex, pageLayout }: TemplateProps) {
	const isFirstPage = pageIndex === 0;
	const { main, sidebar, fullWidth } = pageLayout;

	return (
		<div className="template-avicenne page-content space-y-(--page-gap-y) px-(--page-margin-x) pt-(--page-margin-y) print:p-0">
			{isFirstPage && <Header />}

			<div className="flex gap-x-(--page-gap-x)">
				<main data-layout="main" className="group page-main flex-1 space-y-(--page-gap-y)">
					{main.map((section) => {
						const Component = getSectionComponent(section, { sectionClassName });
						return <Component key={section} id={section} />;
					})}
				</main>

				{!fullWidth && (
					<aside
						data-layout="sidebar"
						className="group page-sidebar w-(--page-sidebar-width) shrink-0 space-y-(--page-gap-y)"
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

	// Military service status labels (French)
	const militaryServiceLabels: Record<string, string> = {
		"not-applicable": "Non applicable",
		completed: "Effectue",
		exempted: "Dispense",
		pending: "En attente",
		"in-service": "En cours",
	};

	return (
		<div className="page-header border-(--page-primary-color) border-b-2 pb-(--page-gap-y)">
			{/* IMTA Branding Header (optional) */}
			{showIMTABranding && (
				<div className="mb-2 flex items-center justify-between border-(--page-primary-color)/30 border-b pb-2 text-xs">
					<span className="font-medium uppercase tracking-wider opacity-70">Institut Medi Technology Avicenne</span>
					{imtaBranding?.promotionYear && <span className="opacity-70">Promotion {imtaBranding.promotionYear}</span>}
				</div>
			)}

			<div className="flex items-start gap-x-(--page-gap-x)">
				{/* Main Info Section */}
				<div className="page-basics flex-1 space-y-2">
					{/* Name and Headline */}
					<div className="space-y-0.5">
						<h2 className="basics-name text-(--page-primary-color)">{basics.name}</h2>
						<p className="basics-headline font-medium tracking-wide">{basics.headline}</p>
					</div>

					{/* Contact Information - Traditional French CV Style */}
					<div className="basics-items flex flex-wrap gap-x-4 gap-y-1 *:flex *:items-center *:gap-x-1.5">
						{basics.email && (
							<div className="basics-item-email">
								<EnvelopeIcon />
								<PageLink url={`mailto:${basics.email}`} label={basics.email} />
							</div>
						)}

						{basics.phone && (
							<div className="basics-item-phone">
								<PhoneIcon />
								<PageLink url={`tel:${basics.phone}`} label={basics.phone} />
							</div>
						)}

						{basics.location && (
							<div className="basics-item-location">
								<MapPinIcon />
								<span>{basics.location}</span>
							</div>
						)}

						{basics.website.url && (
							<div className="basics-item-website">
								<GlobeIcon />
								<PageLink {...basics.website} />
							</div>
						)}
					</div>

					{/* Morocco-Specific Fields (common in Moroccan CVs) */}
					{(basics.cin ||
						basics.dateOfBirth ||
						basics.nationality ||
						basics.maritalStatus ||
						basics.militaryServiceStatus !== "not-applicable") && (
						<div className="basics-morocco mt-2 flex flex-wrap gap-x-4 gap-y-1 border-(--page-primary-color)/20 border-t pt-2 text-sm *:flex *:items-center *:gap-x-1.5">
							{basics.cin && (
								<div className="basics-item-cin">
									<IdentificationCardIcon />
									<span>CIN: {basics.cin}</span>
								</div>
							)}

							{basics.dateOfBirth && (
								<div className="basics-item-dob">
									<CalendarIcon />
									<span>Ne(e) le: {basics.dateOfBirth}</span>
								</div>
							)}

							{basics.nationality && (
								<div className="basics-item-nationality">
									<FlagIcon />
									<span>{basics.nationality}</span>
								</div>
							)}

							{basics.maritalStatus && (
								<div className="basics-item-marital">
									<UsersIcon />
									<span>{basics.maritalStatus}</span>
								</div>
							)}

							{basics.militaryServiceStatus && basics.militaryServiceStatus !== "not-applicable" && (
								<div className="basics-item-military">
									<ShieldCheckIcon />
									<span>Service militaire: {militaryServiceLabels[basics.militaryServiceStatus]}</span>
								</div>
							)}
						</div>
					)}

					{/* Custom Fields */}
					{basics.customFields.length > 0 && (
						<div className="basics-custom flex flex-wrap gap-x-3 gap-y-0.5 *:flex *:items-center *:gap-x-1.5">
							{basics.customFields.map((field) => (
								<div key={field.id} className="basics-item-custom">
									<PageIcon icon={field.icon} />
									{field.link ? <PageLink url={field.link} label={field.text} /> : <span>{field.text}</span>}
								</div>
							))}
						</div>
					)}
				</div>

				{/* Photo Section */}
				<PagePicture />
			</div>
		</div>
	);
}
