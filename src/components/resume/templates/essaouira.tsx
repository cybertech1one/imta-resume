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
	// Section Heading - Light weight, wide letter-spacing, thin bottom line
	"[&>h6]:font-light [&>h6]:text-xs [&>h6]:uppercase [&>h6]:tracking-[0.25em]",
	"[&>h6]:mb-4 [&>h6]:pb-2 [&>h6]:text-(--page-primary-color)",
	"[&>h6]:border-(--page-primary-color)/20 [&>h6]:border-b",
);

/**
 * Template: Essaouira
 * Coastal, creative, freelancer-friendly design with lots of whitespace
 * Single column, wide and airy layout (no sidebar by default)
 * Minimal header with name left, photo right, pill-shaped contact badges
 * Tags: Creative, Freelancer, Airy, Minimal
 */
export const EssaouiraTemplate = memo(function EssaouiraTemplate({ pageIndex, pageLayout }: TemplateProps) {
	const isFirstPage = pageIndex === 0;
	const { main, sidebar, fullWidth } = pageLayout;

	return (
		<div className="template-essaouira page-content space-y-(--page-gap-y) px-(--page-margin-x) pt-(--page-margin-y) print:p-0">
			{isFirstPage && <Header />}

			{/* Single column layout preferred, but supports two-column if configured */}
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
		<div className="page-header pb-(--page-gap-y)">
			{/* Top row: Name left, Photo right */}
			<div className="flex items-start justify-between gap-x-(--page-gap-x)">
				<div className="page-basics flex-1">
					{/* Name - Clean, minimal */}
					<h2 className="basics-name font-extralight text-(--page-text-color) text-3xl tracking-wider">
						{basics.name}
					</h2>

					{/* Headline - Subtle */}
					{basics.headline && (
						<p className="basics-headline mt-1 font-light text-(--page-primary-color) text-sm tracking-wide">
							{basics.headline}
						</p>
					)}
				</div>

				{/* Photo - Right aligned */}
				<PagePicture />
			</div>

			{/* Contact info as pill-shaped badges */}
			<div className="basics-items mt-4 flex flex-wrap gap-2 *:flex *:items-center *:gap-x-1.5">
				{basics.email && (
					<div className="basics-item-email rounded-full bg-(--page-primary-color)/8 px-3 py-1 text-xs">
						<EnvelopeIcon className="size-3 text-(--page-primary-color)" />
						<PageLink url={`mailto:${basics.email}`} label={basics.email} />
					</div>
				)}

				{basics.phone && (
					<div className="basics-item-phone rounded-full bg-(--page-primary-color)/8 px-3 py-1 text-xs">
						<PhoneIcon className="size-3 text-(--page-primary-color)" />
						<PageLink url={`tel:${basics.phone}`} label={basics.phone} />
					</div>
				)}

				{basics.location && (
					<div className="basics-item-location rounded-full bg-(--page-primary-color)/8 px-3 py-1 text-xs">
						<MapPinIcon className="size-3 text-(--page-primary-color)" />
						<span>{basics.location}</span>
					</div>
				)}

				{basics.website.url && (
					<div className="basics-item-website rounded-full bg-(--page-primary-color)/8 px-3 py-1 text-xs">
						<GlobeIcon className="size-3 text-(--page-primary-color)" />
						<PageLink {...basics.website} />
					</div>
				)}
			</div>

			{/* Morocco-specific fields as subtle inline text */}
			{(basics.cin ||
				basics.dateOfBirth ||
				basics.nationality ||
				basics.maritalStatus ||
				(basics.militaryServiceStatus && basics.militaryServiceStatus !== "not-applicable")) && (
				<div className="basics-morocco mt-3 flex flex-wrap gap-x-4 gap-y-1 font-light text-(--page-text-color)/60 text-xs">
					{basics.cin && (
						<div className="basics-item-cin flex items-center gap-x-1">
							<IdentificationCardIcon className="size-3 opacity-50" />
							<span>CIN: {basics.cin}</span>
						</div>
					)}

					{basics.dateOfBirth && (
						<div className="basics-item-dob flex items-center gap-x-1">
							<CalendarIcon className="size-3 opacity-50" />
							<span>Ne(e) le: {basics.dateOfBirth}</span>
						</div>
					)}

					{basics.nationality && (
						<div className="basics-item-nationality flex items-center gap-x-1">
							<FlagIcon className="size-3 opacity-50" />
							<span>{basics.nationality}</span>
						</div>
					)}

					{basics.maritalStatus && (
						<div className="basics-item-marital flex items-center gap-x-1">
							<UsersIcon className="size-3 opacity-50" />
							<span>{basics.maritalStatus}</span>
						</div>
					)}

					{basics.militaryServiceStatus && basics.militaryServiceStatus !== "not-applicable" && (
						<div className="basics-item-military flex items-center gap-x-1">
							<ShieldCheckIcon className="size-3 opacity-50" />
							<span>Service militaire: {militaryServiceLabels[basics.militaryServiceStatus]}</span>
						</div>
					)}
				</div>
			)}

			{/* Custom Fields */}
			{basics.customFields.length > 0 && (
				<div className="basics-custom mt-2 flex flex-wrap gap-2 *:flex *:items-center *:gap-x-1.5">
					{basics.customFields.map((field) => (
						<div
							key={field.id}
							className="basics-item-custom rounded-full bg-(--page-primary-color)/5 px-3 py-1 text-xs"
						>
							<PageIcon icon={field.icon} />
							{field.link ? <PageLink url={field.link} label={field.text} /> : <span>{field.text}</span>}
						</div>
					))}
				</div>
			)}

			{/* Thin separator */}
			<div className="mt-4 h-px bg-(--page-primary-color)/15" />
		</div>
	);
}
