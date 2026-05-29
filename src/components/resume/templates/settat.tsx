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
	// Section Heading - Simple bold with thin dashed underline, student-friendly
	"[&>h6]:font-bold [&>h6]:text-sm [&>h6]:tracking-wide",
	"[&>h6]:mb-2 [&>h6]:border-(--page-primary-color)/50 [&>h6]:border-b [&>h6]:border-dashed [&>h6]:pb-1",
);

/**
 * Template: Settat
 * Student/entry-level, clean and approachable
 * Single column (no sidebar, fullWidth always), compact spacing
 * Perfect for first-time job seekers and fresh graduates
 * Tags: Student, Entry-level, First Job, ATS-friendly
 */
export const SettatTemplate = memo(function SettatTemplate({ pageIndex, pageLayout }: TemplateProps) {
	const isFirstPage = pageIndex === 0;
	const { main, sidebar, fullWidth } = pageLayout;

	return (
		<div className="template-settat page-content space-y-(--page-gap-y) px-(--page-margin-x) pt-(--page-margin-y) print:p-0">
			{isFirstPage && <Header />}

			{/* Single column: render all sections sequentially */}
			<main data-layout="main" className="group page-main space-y-(--page-gap-y)">
				{main.map((section) => {
					const Component = getSectionComponent(section, { sectionClassName });
					return <Component key={section} id={section} />;
				})}
			</main>

			{/* Render sidebar sections below main when sidebar content exists */}
			{!fullWidth && sidebar.length > 0 && (
				<div data-layout="sidebar" className="group page-sidebar space-y-(--page-gap-y)">
					{sidebar.map((section) => {
						const Component = getSectionComponent(section, { sectionClassName });
						return <Component key={section} id={section} />;
					})}
				</div>
			)}
		</div>
	);
});

function Header() {
	const basics = useResumeStore((state) => state.resume.data.basics);

	// Military service status labels (French)
	const militaryServiceLabels: Record<string, string> = {
		"not-applicable": "Non applicable",
		completed: "Effectue",
		exempted: "Dispense",
		pending: "En attente",
		"in-service": "En cours",
	};

	return (
		<div className="page-header pb-(--page-gap-y)">
			{/* Top row: Name/headline left, photo right */}
			<div className="flex items-start justify-between gap-x-(--page-gap-x)">
				<div className="flex-1">
					<h2 className="basics-name font-bold text-(--page-primary-color) text-2xl">{basics.name}</h2>
					{basics.headline && (
						<p className="basics-headline mt-0.5 font-medium text-sm tracking-wide opacity-80">{basics.headline}</p>
					)}
				</div>

				<PagePicture />
			</div>

			{/* Contact information - compact horizontal row */}
			<div className="basics-items mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm *:flex *:items-center *:gap-x-1.5">
				{basics.email && (
					<div className="basics-item-email">
						<EnvelopeIcon className="size-3.5 text-(--page-primary-color)" />
						<PageLink url={`mailto:${basics.email}`} label={basics.email} />
					</div>
				)}

				{basics.phone && (
					<div className="basics-item-phone">
						<PhoneIcon className="size-3.5 text-(--page-primary-color)" />
						<PageLink url={`tel:${basics.phone}`} label={basics.phone} />
					</div>
				)}

				{basics.location && (
					<div className="basics-item-location">
						<MapPinIcon className="size-3.5 text-(--page-primary-color)" />
						<span>{basics.location}</span>
					</div>
				)}

				{basics.website.url && (
					<div className="basics-item-website">
						<GlobeIcon className="size-3.5 text-(--page-primary-color)" />
						<PageLink {...basics.website} />
					</div>
				)}
			</div>

			{/* Morocco-specific fields in small text below contact */}
			{(basics.cin ||
				basics.dateOfBirth ||
				basics.nationality ||
				basics.maritalStatus ||
				basics.militaryServiceStatus !== "not-applicable") && (
				<div className="basics-morocco mt-1.5 flex flex-wrap gap-x-3 gap-y-0.5 text-xs opacity-70 *:flex *:items-center *:gap-x-1">
					{basics.cin && (
						<div className="basics-item-cin">
							<IdentificationCardIcon className="size-3" />
							<span>CIN: {basics.cin}</span>
						</div>
					)}

					{basics.dateOfBirth && (
						<div className="basics-item-dob">
							<CalendarIcon className="size-3" />
							<span>Ne(e): {basics.dateOfBirth}</span>
						</div>
					)}

					{basics.nationality && (
						<div className="basics-item-nationality">
							<FlagIcon className="size-3" />
							<span>{basics.nationality}</span>
						</div>
					)}

					{basics.maritalStatus && (
						<div className="basics-item-marital">
							<UsersIcon className="size-3" />
							<span>{basics.maritalStatus}</span>
						</div>
					)}

					{basics.militaryServiceStatus && basics.militaryServiceStatus !== "not-applicable" && (
						<div className="basics-item-military">
							<ShieldCheckIcon className="size-3" />
							<span>S.M.: {militaryServiceLabels[basics.militaryServiceStatus]}</span>
						</div>
					)}
				</div>
			)}

			{/* Custom Fields */}
			{basics.customFields.length > 0 && (
				<div className="basics-custom mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-sm *:flex *:items-center *:gap-x-1.5">
					{basics.customFields.map((field) => (
						<div key={field.id} className="basics-item-custom">
							<PageIcon icon={field.icon} />
							{field.link ? <PageLink url={field.link} label={field.text} /> : <span>{field.text}</span>}
						</div>
					))}
				</div>
			)}

			{/* Simple bottom separator */}
			<div className="mt-2 border-(--page-primary-color)/30 border-b border-dashed" />
		</div>
	);
}
