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
	// Section Heading - Engineering style: thick left border (6px), bold, left-aligned
	"[&>h6]:border-(--page-primary-color) [&>h6]:border-l-[6px] [&>h6]:pl-3",
	"[&>h6]:font-bold [&>h6]:text-sm [&>h6]:uppercase [&>h6]:tracking-wide",
	"[&>h6]:mb-3 [&>h6]:text-(--page-text-color)",
);

/**
 * Template: Safi
 * Named after the port city of Safi, Morocco
 * Engineering/maritime professional - single column, data-dense
 * Features: Horizontal primary color band header, icon badges for contact, thick left border headings
 * Tags: Engineering, Technical, Dense
 */
export const SafiTemplate = memo(function SafiTemplate({ pageIndex, pageLayout }: TemplateProps) {
	const isFirstPage = pageIndex === 0;
	const { main, sidebar, fullWidth } = pageLayout;

	return (
		<div className="template-safi page-content">
			{isFirstPage && <Header />}

			<div className={cn("px-(--page-margin-x)", !isFirstPage && "pt-(--page-margin-y)")}>
				{/* Single column: render main first, then sidebar sections below (all fullWidth) */}
				<main data-layout="main" className="group page-main space-y-(--page-gap-y) pt-(--page-gap-y)">
					{main.map((section) => {
						const Component = getSectionComponent(section, { sectionClassName });
						return <Component key={section} id={section} />;
					})}
				</main>

				{/* Even if fullWidth is false, Safi renders everything in single column */}
				{!fullWidth && sidebar.length > 0 && (
					<aside data-layout="sidebar" className="group page-sidebar space-y-(--page-gap-y) pt-(--page-gap-y)">
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

	const militaryServiceLabels: Record<string, string> = {
		"not-applicable": "Non applicable",
		completed: "Effectue",
		exempted: "Dispense",
		pending: "En attente",
		"in-service": "En cours",
	};

	return (
		<div className="page-header">
			{/* Primary color band with name and title */}
			<div className="flex items-center gap-x-(--page-gap-x) bg-(--page-primary-color) px-(--page-margin-x) py-5 text-(--page-background-color)">
				<PagePicture />

				<div className="flex-1">
					<h2 className="basics-name font-bold text-2xl uppercase tracking-wider">{basics.name}</h2>
					{basics.headline && (
						<p className="basics-headline mt-1 font-medium text-base tracking-wide opacity-90">{basics.headline}</p>
					)}

					{/* Morocco fields as compact badges in header */}
					{(basics.cin ||
						basics.dateOfBirth ||
						basics.nationality ||
						basics.maritalStatus ||
						(basics.militaryServiceStatus && basics.militaryServiceStatus !== "not-applicable")) && (
						<div className="basics-morocco mt-2.5 flex flex-wrap gap-2">
							{basics.cin && (
								<span className="basics-item-cin inline-flex items-center gap-1 rounded bg-(--page-background-color)/15 px-2 py-0.5 text-xs">
									<IdentificationCardIcon className="size-3 shrink-0" />
									CIN: {basics.cin}
								</span>
							)}
							{basics.dateOfBirth && (
								<span className="basics-item-dob inline-flex items-center gap-1 rounded bg-(--page-background-color)/15 px-2 py-0.5 text-xs">
									<CalendarIcon className="size-3 shrink-0" />
									{basics.dateOfBirth}
								</span>
							)}
							{basics.nationality && (
								<span className="basics-item-nationality inline-flex items-center gap-1 rounded bg-(--page-background-color)/15 px-2 py-0.5 text-xs">
									<FlagIcon className="size-3 shrink-0" />
									{basics.nationality}
								</span>
							)}
							{basics.maritalStatus && (
								<span className="basics-item-marital inline-flex items-center gap-1 rounded bg-(--page-background-color)/15 px-2 py-0.5 text-xs">
									<UsersIcon className="size-3 shrink-0" />
									{basics.maritalStatus}
								</span>
							)}
							{basics.militaryServiceStatus && basics.militaryServiceStatus !== "not-applicable" && (
								<span className="basics-item-military inline-flex items-center gap-1 rounded bg-(--page-background-color)/15 px-2 py-0.5 text-xs">
									<ShieldCheckIcon className="size-3 shrink-0" />
									{militaryServiceLabels[basics.militaryServiceStatus]}
								</span>
							)}
						</div>
					)}
				</div>
			</div>

			{/* Contact info row below header with icon badges */}
			<div className="flex flex-wrap items-center gap-x-1 gap-y-1 bg-(--page-primary-color)/8 px-(--page-margin-x) py-2.5">
				{basics.email && (
					<div className="basics-item-email inline-flex items-center gap-1.5 rounded-sm bg-(--page-background-color) px-2.5 py-1 text-xs shadow-sm">
						<EnvelopeIcon className="size-3.5 shrink-0 text-(--page-primary-color)" />
						<PageLink url={`mailto:${basics.email}`} label={basics.email} />
					</div>
				)}
				{basics.phone && (
					<div className="basics-item-phone inline-flex items-center gap-1.5 rounded-sm bg-(--page-background-color) px-2.5 py-1 text-xs shadow-sm">
						<PhoneIcon className="size-3.5 shrink-0 text-(--page-primary-color)" />
						<PageLink url={`tel:${basics.phone}`} label={basics.phone} />
					</div>
				)}
				{basics.location && (
					<div className="basics-item-location inline-flex items-center gap-1.5 rounded-sm bg-(--page-background-color) px-2.5 py-1 text-xs shadow-sm">
						<MapPinIcon className="size-3.5 shrink-0 text-(--page-primary-color)" />
						<span>{basics.location}</span>
					</div>
				)}
				{basics.website.url && (
					<div className="basics-item-website inline-flex items-center gap-1.5 rounded-sm bg-(--page-background-color) px-2.5 py-1 text-xs shadow-sm">
						<GlobeIcon className="size-3.5 shrink-0 text-(--page-primary-color)" />
						<PageLink {...basics.website} />
					</div>
				)}

				{/* Custom Fields */}
				{basics.customFields.map((field) => (
					<div
						key={field.id}
						className="basics-item-custom inline-flex items-center gap-1.5 rounded-sm bg-(--page-background-color) px-2.5 py-1 text-xs shadow-sm"
					>
						<PageIcon icon={field.icon} />
						{field.link ? <PageLink url={field.link} label={field.text} /> : <span>{field.text}</span>}
					</div>
				))}
			</div>
		</div>
	);
}
