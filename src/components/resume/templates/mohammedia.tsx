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
	// Section Heading - Executive style: uppercase, wide tracking, thin double underline
	"[&>h6]:font-semibold [&>h6]:text-xs [&>h6]:uppercase [&>h6]:tracking-[0.2em]",
	"[&>h6]:mb-4 [&>h6]:text-(--page-text-color)",
	"[&>h6]:border-(--page-primary-color)/40 [&>h6]:border-b [&>h6]:border-double [&>h6]:pb-2",
);

/**
 * Template: Mohammedia
 * Named after the coastal city of Mohammedia, Morocco
 * Executive/C-suite premium feel with generous whitespace
 * Features: Full-width header, narrow left sidebar, uppercase tracking-wide headings, double underline
 * Tags: Executive, Premium, C-Suite
 */
export const MohammediaTemplate = memo(function MohammediaTemplate({ pageIndex, pageLayout }: TemplateProps) {
	const isFirstPage = pageIndex === 0;
	const { main, sidebar, fullWidth } = pageLayout;

	return (
		<div className="template-mohammedia page-content px-(--page-margin-x) pt-(--page-margin-y) print:p-0">
			{isFirstPage && <Header />}

			<div className={cn("mt-(--page-gap-y)", !fullWidth && "flex gap-x-(--page-gap-x)")}>
				{/* Left Sidebar - Narrow (~25% feel) */}
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

				{/* Main Content */}
				<main data-layout="main" className={cn("group page-main flex-1 space-y-(--page-gap-y)", fullWidth && "w-full")}>
					{main.map((section) => {
						const Component = getSectionComponent(section, { sectionClassName });
						return <Component key={section} id={section} />;
					})}
				</main>
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
			{/* Full-width header area */}
			<div className="flex items-start gap-x-(--page-gap-x)">
				<PagePicture />

				<div className="flex-1">
					{/* Name - large and bold */}
					<h2 className="basics-name font-bold text-3xl tracking-tight">{basics.name}</h2>

					{/* Primary color accent line below name */}
					<div className="mt-2 mb-3 h-[3px] w-20 bg-(--page-primary-color)" />

					{/* Headline */}
					{basics.headline && (
						<p className="basics-headline mb-3 font-medium text-(--page-primary-color) text-sm uppercase tracking-[0.15em]">
							{basics.headline}
						</p>
					)}

					{/* Contact info - subtle elegant row */}
					<div className="basics-items flex flex-wrap gap-x-5 gap-y-1.5 text-xs *:flex *:items-center *:gap-x-1.5">
						{basics.email && (
							<div className="basics-item-email">
								<EnvelopeIcon className="size-3.5 shrink-0 opacity-50" />
								<PageLink url={`mailto:${basics.email}`} label={basics.email} />
							</div>
						)}
						{basics.phone && (
							<div className="basics-item-phone">
								<PhoneIcon className="size-3.5 shrink-0 opacity-50" />
								<PageLink url={`tel:${basics.phone}`} label={basics.phone} />
							</div>
						)}
						{basics.location && (
							<div className="basics-item-location">
								<MapPinIcon className="size-3.5 shrink-0 opacity-50" />
								<span>{basics.location}</span>
							</div>
						)}
						{basics.website.url && (
							<div className="basics-item-website">
								<GlobeIcon className="size-3.5 shrink-0 opacity-50" />
								<PageLink {...basics.website} />
							</div>
						)}
					</div>
				</div>
			</div>

			{/* Morocco fields - small elegant text below header */}
			{(basics.cin ||
				basics.dateOfBirth ||
				basics.nationality ||
				basics.maritalStatus ||
				(basics.militaryServiceStatus && basics.militaryServiceStatus !== "not-applicable")) && (
				<div className="basics-morocco mt-3 flex flex-wrap gap-x-6 gap-y-1 border-(--page-primary-color)/15 border-t pt-3 text-[10px] uppercase tracking-wider opacity-60">
					{basics.cin && (
						<span className="basics-item-cin inline-flex items-center gap-1">
							<IdentificationCardIcon className="size-3 shrink-0" />
							CIN: {basics.cin}
						</span>
					)}
					{basics.dateOfBirth && (
						<span className="basics-item-dob inline-flex items-center gap-1">
							<CalendarIcon className="size-3 shrink-0" />
							Ne(e) le {basics.dateOfBirth}
						</span>
					)}
					{basics.nationality && (
						<span className="basics-item-nationality inline-flex items-center gap-1">
							<FlagIcon className="size-3 shrink-0" />
							{basics.nationality}
						</span>
					)}
					{basics.maritalStatus && (
						<span className="basics-item-marital inline-flex items-center gap-1">
							<UsersIcon className="size-3 shrink-0" />
							{basics.maritalStatus}
						</span>
					)}
					{basics.militaryServiceStatus && basics.militaryServiceStatus !== "not-applicable" && (
						<span className="basics-item-military inline-flex items-center gap-1">
							<ShieldCheckIcon className="size-3 shrink-0" />
							Service militaire: {militaryServiceLabels[basics.militaryServiceStatus]}
						</span>
					)}
				</div>
			)}

			{/* Custom Fields */}
			{basics.customFields.length > 0 && (
				<div className="basics-custom mt-2 flex flex-wrap gap-x-5 gap-y-1 text-xs opacity-70 *:flex *:items-center *:gap-x-1.5">
					{basics.customFields.map((field) => (
						<div key={field.id} className="basics-item-custom">
							<PageIcon icon={field.icon} />
							{field.link ? <PageLink url={field.link} label={field.text} /> : <span>{field.text}</span>}
						</div>
					))}
				</div>
			)}

			{/* Bottom double line */}
			<div className="mt-4 border-(--page-primary-color)/30 border-b border-double pb-[3px]" />
		</div>
	);
}
