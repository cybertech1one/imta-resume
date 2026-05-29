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
	// Section Heading - Simple bold with thin bottom border (ATS-friendly)
	"[&>h6]:font-bold [&>h6]:text-(--page-primary-color) [&>h6]:text-sm",
	"[&>h6]:mb-3 [&>h6]:border-(--page-primary-color)/30 [&>h6]:border-b [&>h6]:pb-1",
);

/**
 * Template: Tangier
 * International/multilingual focus, clean ATS-friendly single-column design
 * Inspired by Tangier's cosmopolitan, international character
 * Tags: International, ATS-friendly, Clean
 */
export const TangierTemplate = memo(function TangierTemplate({ pageIndex, pageLayout }: TemplateProps) {
	const isFirstPage = pageIndex === 0;
	const { main, sidebar, fullWidth } = pageLayout;

	return (
		<div className="template-tangier page-content space-y-(--page-gap-y) px-(--page-margin-x) pt-(--page-margin-y) print:p-0">
			{isFirstPage && <Header />}

			{/* Single-column or two-column based on layout */}
			<div className={cn(!fullWidth && "flex gap-x-(--page-gap-x)")}>
				<main data-layout="main" className={cn("group page-main space-y-(--page-gap-y)", !fullWidth && "flex-1")}>
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

	// Military service status labels (French)
	const militaryServiceLabels: Record<string, string> = {
		"not-applicable": "Non applicable",
		completed: "Effectue",
		exempted: "Dispense",
		pending: "En attente",
		"in-service": "En cours",
	};

	return (
		<div className="page-header border-(--page-primary-color)/20 border-b pb-(--page-gap-y)">
			{/* Top Row: Name left, contact info right */}
			<div className="flex items-start justify-between gap-x-(--page-gap-x)">
				<div className="flex-1">
					<h2 className="basics-name font-bold text-(--page-primary-color) text-2xl">{basics.name}</h2>
					{basics.headline && <p className="basics-headline mt-0.5 font-medium opacity-80">{basics.headline}</p>}
				</div>

				{/* Contact info right-aligned */}
				<div className="basics-items flex shrink-0 flex-col items-end gap-y-0.5 text-sm *:flex *:items-center *:gap-x-1.5">
					{basics.email && (
						<div className="basics-item-email">
							<EnvelopeIcon className="size-3.5 opacity-60" />
							<PageLink url={`mailto:${basics.email}`} label={basics.email} />
						</div>
					)}

					{basics.phone && (
						<div className="basics-item-phone">
							<PhoneIcon className="size-3.5 opacity-60" />
							<PageLink url={`tel:${basics.phone}`} label={basics.phone} />
						</div>
					)}

					{basics.location && (
						<div className="basics-item-location">
							<MapPinIcon className="size-3.5 opacity-60" />
							<span>{basics.location}</span>
						</div>
					)}

					{basics.website.url && (
						<div className="basics-item-website">
							<GlobeIcon className="size-3.5 opacity-60" />
							<PageLink {...basics.website} />
						</div>
					)}
				</div>

				{/* Photo (optional, keeps ATS clean) */}
				<PagePicture />
			</div>

			{/* Morocco fields + custom fields inline */}
			{(basics.cin ||
				basics.dateOfBirth ||
				basics.nationality ||
				basics.maritalStatus ||
				basics.militaryServiceStatus !== "not-applicable" ||
				basics.customFields.length > 0) && (
				<div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 border-(--page-primary-color)/10 border-t pt-2 text-xs opacity-70">
					{basics.cin && (
						<div className="basics-item-cin flex items-center gap-x-1">
							<IdentificationCardIcon className="size-3" />
							<span>CIN: {basics.cin}</span>
						</div>
					)}

					{basics.dateOfBirth && (
						<div className="basics-item-dob flex items-center gap-x-1">
							<CalendarIcon className="size-3" />
							<span>Ne(e) le: {basics.dateOfBirth}</span>
						</div>
					)}

					{basics.nationality && (
						<div className="basics-item-nationality flex items-center gap-x-1">
							<FlagIcon className="size-3" />
							<span>{basics.nationality}</span>
						</div>
					)}

					{basics.maritalStatus && (
						<div className="basics-item-marital flex items-center gap-x-1">
							<UsersIcon className="size-3" />
							<span>{basics.maritalStatus}</span>
						</div>
					)}

					{basics.militaryServiceStatus && basics.militaryServiceStatus !== "not-applicable" && (
						<div className="basics-item-military flex items-center gap-x-1">
							<ShieldCheckIcon className="size-3" />
							<span>Service militaire: {militaryServiceLabels[basics.militaryServiceStatus]}</span>
						</div>
					)}

					{/* Custom Fields inline */}
					{basics.customFields.map((field) => (
						<div key={field.id} className="basics-item-custom flex items-center gap-x-1">
							<PageIcon icon={field.icon} />
							{field.link ? <PageLink url={field.link} label={field.text} /> : <span>{field.text}</span>}
						</div>
					))}
				</div>
			)}
		</div>
	);
}
