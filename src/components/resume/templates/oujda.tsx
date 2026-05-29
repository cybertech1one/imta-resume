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
	// Section Heading - Industrial style: white text on primary color strip
	"[&>h6]:bg-(--page-primary-color) [&>h6]:px-3 [&>h6]:py-1.5 [&>h6]:text-(--page-background-color)",
	"[&>h6]:font-bold [&>h6]:text-xs [&>h6]:uppercase [&>h6]:tracking-widest",
	"[&>h6]:mb-3",
);

const sidebarSectionClassName = cn(
	// Sidebar Section Heading - White text on slightly lighter strip
	"[&>h6]:bg-(--page-background-color)/15 [&>h6]:px-3 [&>h6]:py-1.5 [&>h6]:text-(--page-background-color)",
	"[&>h6]:font-bold [&>h6]:text-xs [&>h6]:uppercase [&>h6]:tracking-widest",
	"[&>h6]:mb-3",
);

/**
 * Template: Oujda
 * Named after the industrial city of Oujda, Morocco
 * Industrial/technical style with dark left sidebar
 * Features: Dark sidebar with photo, contact, skills; main area with timeline experience
 * Tags: Industrial, Technical, Bold
 */
export const OujdaTemplate = memo(function OujdaTemplate({ pageIndex, pageLayout }: TemplateProps) {
	const isFirstPage = pageIndex === 0;
	const { main, sidebar, fullWidth } = pageLayout;

	return (
		<div className="template-oujda page-content">
			{/* Dark sidebar background */}
			{!fullWidth && (
				<div className="page-sidebar-background absolute inset-y-0 z-0 w-(--page-sidebar-width) shrink-0 bg-(--page-primary-color) ltr:start-0 rtl:end-0" />
			)}

			{/* Top banner with name */}
			{isFirstPage && <NameBanner />}

			<div className="flex">
				{/* Left Sidebar - Dark background */}
				{!fullWidth && (
					<aside
						data-layout="sidebar"
						className="group page-sidebar z-10 flex w-(--page-sidebar-width) shrink-0 flex-col text-(--page-background-color)"
					>
						{isFirstPage && <SidebarHeader />}

						<div className="shrink-0 space-y-(--page-gap-y) overflow-x-hidden px-(--page-margin-x) pt-(--page-gap-y)">
							{sidebar.map((section) => {
								const Component = getSectionComponent(section, { sectionClassName: sidebarSectionClassName });
								return <Component key={section} id={section} />;
							})}
						</div>
					</aside>
				)}

				{/* Main Content */}
				<main
					data-layout="main"
					className={cn(
						"group page-main z-10 flex-1 space-y-(--page-gap-y) px-(--page-margin-x) pt-(--page-margin-y)",
						fullWidth && "w-full",
					)}
				>
					{main.map((section) => {
						const Component = getSectionComponent(section, { sectionClassName });
						return <Component key={section} id={section} />;
					})}
				</main>
			</div>
		</div>
	);
});

function NameBanner() {
	const basics = useResumeStore((state) => state.resume.data.basics);

	return (
		<div className="page-header relative z-10 flex items-center bg-(--page-primary-color) px-(--page-margin-x) py-4 text-(--page-background-color)">
			<div className="flex-1">
				<h2 className="basics-name font-bold text-2xl uppercase tracking-wider">{basics.name}</h2>
				{basics.headline && (
					<p className="basics-headline mt-0.5 font-medium text-sm uppercase tracking-wide opacity-85">
						{basics.headline}
					</p>
				)}
			</div>
		</div>
	);
}

function SidebarHeader() {
	const basics = useResumeStore((state) => state.resume.data.basics);

	const militaryServiceLabels: Record<string, string> = {
		"not-applicable": "Non applicable",
		completed: "Effectue",
		exempted: "Dispense",
		pending: "En attente",
		"in-service": "En cours",
	};

	return (
		<div className="space-y-4 px-(--page-margin-x) pt-(--page-margin-y)">
			{/* Photo */}
			<div className="flex justify-center">
				<PagePicture />
			</div>

			{/* Contact Details */}
			<div className="space-y-2 text-sm">
				<h6 className="bg-(--page-background-color)/15 px-3 py-1.5 font-bold text-xs uppercase tracking-widest">
					Contact
				</h6>
				<div className="basics-items flex flex-col gap-y-2 *:flex *:items-center *:gap-x-2">
					{basics.email && (
						<div className="basics-item-email">
							<EnvelopeIcon className="size-4 shrink-0 opacity-80" />
							<PageLink url={`mailto:${basics.email}`} label={basics.email} />
						</div>
					)}
					{basics.phone && (
						<div className="basics-item-phone">
							<PhoneIcon className="size-4 shrink-0 opacity-80" />
							<PageLink url={`tel:${basics.phone}`} label={basics.phone} />
						</div>
					)}
					{basics.location && (
						<div className="basics-item-location">
							<MapPinIcon className="size-4 shrink-0 opacity-80" />
							<span>{basics.location}</span>
						</div>
					)}
					{basics.website.url && (
						<div className="basics-item-website">
							<GlobeIcon className="size-4 shrink-0 opacity-80" />
							<PageLink {...basics.website} />
						</div>
					)}
				</div>
			</div>

			{/* Morocco-Specific Fields */}
			{(basics.cin ||
				basics.dateOfBirth ||
				basics.nationality ||
				basics.maritalStatus ||
				(basics.militaryServiceStatus && basics.militaryServiceStatus !== "not-applicable")) && (
				<div className="space-y-2 text-sm">
					<h6 className="bg-(--page-background-color)/15 px-3 py-1.5 font-bold text-xs uppercase tracking-widest">
						Informations personnelles
					</h6>
					<div className="flex flex-col gap-y-2 *:flex *:items-center *:gap-x-2">
						{basics.cin && (
							<div className="basics-item-cin">
								<IdentificationCardIcon className="size-4 shrink-0 opacity-80" />
								<span>CIN: {basics.cin}</span>
							</div>
						)}
						{basics.dateOfBirth && (
							<div className="basics-item-dob">
								<CalendarIcon className="size-4 shrink-0 opacity-80" />
								<span>{basics.dateOfBirth}</span>
							</div>
						)}
						{basics.nationality && (
							<div className="basics-item-nationality">
								<FlagIcon className="size-4 shrink-0 opacity-80" />
								<span>{basics.nationality}</span>
							</div>
						)}
						{basics.maritalStatus && (
							<div className="basics-item-marital">
								<UsersIcon className="size-4 shrink-0 opacity-80" />
								<span>{basics.maritalStatus}</span>
							</div>
						)}
						{basics.militaryServiceStatus && basics.militaryServiceStatus !== "not-applicable" && (
							<div className="basics-item-military">
								<ShieldCheckIcon className="size-4 shrink-0 opacity-80" />
								<span>{militaryServiceLabels[basics.militaryServiceStatus]}</span>
							</div>
						)}
					</div>
				</div>
			)}

			{/* Custom Fields */}
			{basics.customFields.length > 0 && (
				<div className="basics-custom flex flex-col gap-y-2 text-sm *:flex *:items-center *:gap-x-2">
					{basics.customFields.map((field) => (
						<div key={field.id} className="basics-item-custom">
							<PageIcon icon={field.icon} />
							{field.link ? <PageLink url={field.link} label={field.text} /> : <span>{field.text}</span>}
						</div>
					))}
				</div>
			)}
		</div>
	);
}
