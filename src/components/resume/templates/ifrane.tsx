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
	// Section Heading - Academic/scholarly: italic uppercase with thin bottom rule
	"[&>h6]:uppercase [&>h6]:italic [&>h6]:tracking-wider",
	"[&>h6]:font-semibold [&>h6]:text-(--page-primary-color) [&>h6]:text-xs",
	"[&>h6]:mb-3 [&>h6]:border-(--page-primary-color)/30 [&>h6]:border-b [&>h6]:pb-1",
);

/**
 * Template: Ifrane
 * Named after the university city of Ifrane, Morocco (home of Al Akhawayn University)
 * Academic/scholarly elegant with centered header and right sidebar
 * Features: Centered scholarly header with horizontal rules, italic uppercase headings
 * Tags: Academic, Scholarly, Research
 */
export const IfraneTemplate = memo(function IfraneTemplate({ pageIndex, pageLayout }: TemplateProps) {
	const isFirstPage = pageIndex === 0;
	const { main, sidebar, fullWidth } = pageLayout;

	return (
		<div className="template-ifrane page-content space-y-(--page-gap-y) px-(--page-margin-x) pt-(--page-margin-y) print:p-0">
			{isFirstPage && <Header />}

			<div className={cn(!fullWidth && "flex gap-x-(--page-gap-x)")}>
				{/* Main Content - Left side */}
				<main data-layout="main" className={cn("group page-main space-y-(--page-gap-y)", !fullWidth && "flex-1")}>
					{main.map((section) => {
						const Component = getSectionComponent(section, { sectionClassName });
						return <Component key={section} id={section} />;
					})}
				</main>

				{/* Right Sidebar */}
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

	const militaryServiceLabels: Record<string, string> = {
		"not-applicable": "Non applicable",
		completed: "Effectue",
		exempted: "Dispense",
		pending: "En attente",
		"in-service": "En cours",
	};

	return (
		<div className="page-header text-center">
			{/* Top horizontal rule */}
			<div className="mb-3 border-(--page-primary-color)/40 border-t-2" />

			{/* Photo centered */}
			<div className="mb-3 flex justify-center">
				<PagePicture />
			</div>

			{/* Name - large serif-style (using font-weight and letter-spacing to evoke scholarly feel) */}
			<h2 className="basics-name mb-1 font-bold text-(--page-primary-color) text-3xl tracking-tight">{basics.name}</h2>

			{/* Headline - elegant subtitle */}
			{basics.headline && (
				<p className="basics-headline mb-2 font-medium text-sm italic tracking-wide opacity-75">{basics.headline}</p>
			)}

			{/* Morocco fields centered below name */}
			{(basics.cin ||
				basics.dateOfBirth ||
				basics.nationality ||
				basics.maritalStatus ||
				(basics.militaryServiceStatus && basics.militaryServiceStatus !== "not-applicable")) && (
				<div className="basics-morocco mb-2 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-(--page-text-color)/70 text-xs">
					{basics.cin && (
						<span className="basics-item-cin inline-flex items-center gap-1">
							<IdentificationCardIcon className="size-3 shrink-0" />
							CIN: {basics.cin}
						</span>
					)}
					{basics.dateOfBirth && (
						<span className="basics-item-dob inline-flex items-center gap-1">
							<CalendarIcon className="size-3 shrink-0" />
							{basics.dateOfBirth}
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
							Service mil.: {militaryServiceLabels[basics.militaryServiceStatus]}
						</span>
					)}
				</div>
			)}

			{/* Contact information row - centered */}
			<div className="basics-items mb-2 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs *:flex *:items-center *:gap-x-1">
				{basics.email && (
					<div className="basics-item-email">
						<EnvelopeIcon className="size-3 shrink-0 text-(--page-primary-color)" />
						<PageLink url={`mailto:${basics.email}`} label={basics.email} />
					</div>
				)}
				{basics.phone && (
					<div className="basics-item-phone">
						<PhoneIcon className="size-3 shrink-0 text-(--page-primary-color)" />
						<PageLink url={`tel:${basics.phone}`} label={basics.phone} />
					</div>
				)}
				{basics.location && (
					<div className="basics-item-location">
						<MapPinIcon className="size-3 shrink-0 text-(--page-primary-color)" />
						<span>{basics.location}</span>
					</div>
				)}
				{basics.website.url && (
					<div className="basics-item-website">
						<GlobeIcon className="size-3 shrink-0 text-(--page-primary-color)" />
						<PageLink {...basics.website} />
					</div>
				)}
			</div>

			{/* Custom Fields */}
			{basics.customFields.length > 0 && (
				<div className="basics-custom mb-2 flex flex-wrap items-center justify-center gap-x-3 gap-y-0.5 text-xs *:flex *:items-center *:gap-x-1">
					{basics.customFields.map((field) => (
						<div key={field.id} className="basics-item-custom">
							<PageIcon icon={field.icon} />
							{field.link ? <PageLink url={field.link} label={field.text} /> : <span>{field.text}</span>}
						</div>
					))}
				</div>
			)}

			{/* Bottom horizontal rule */}
			<div className="mt-1 border-(--page-primary-color)/40 border-b-2" />
		</div>
	);
}
