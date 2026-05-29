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

// Main area section headings - Bold with primary color left accent
const mainSectionClassName = cn(
	"[&>h6]:font-bold [&>h6]:text-sm [&>h6]:uppercase [&>h6]:tracking-wider",
	"[&>h6]:mb-3 [&>h6]:text-(--page-primary-color)",
	"[&>h6]:border-(--page-primary-color) [&>h6]:border-l-4 [&>h6]:pl-3",
);

// Sidebar section headings - White text with bottom border (used in dark sidebar)
const sidebarSectionClassName = cn(
	"[&>h6]:font-semibold [&>h6]:text-sm [&>h6]:uppercase [&>h6]:tracking-wider",
	"[&>h6]:mb-3 [&>h6]:text-(--page-background-color)",
	"[&>h6]:border-(--page-background-color)/30 [&>h6]:border-b [&>h6]:pb-1.5",

	// Section Item Header in Sidebar Layout
	"group-data-[layout=sidebar]:[&_.section-item-header>div]:flex-col",
	"group-data-[layout=sidebar]:[&_.section-item-header>div]:items-start",
);

/**
 * Template: Dakhla
 * Adventure/modern dynamic style with bold, high-contrast design
 * Two-column with LEFT sidebar (bold dark sidebar)
 * Full-width dark header banner, dark sidebar with white text
 * Main area: clean light background, bold left accent on section headings
 * Tags: Modern, Bold, Dynamic, Dark
 */
export const DakhlaTemplate = memo(function DakhlaTemplate({ pageIndex, pageLayout }: TemplateProps) {
	const isFirstPage = pageIndex === 0;
	const { main, sidebar, fullWidth } = pageLayout;

	return (
		<div className="template-dakhla page-content">
			{isFirstPage && <Header />}

			<div className="flex flex-1">
				{/* Left Sidebar - Dark background */}
				{!fullWidth && (
					<aside
						data-layout="sidebar"
						className="group page-sidebar w-(--page-sidebar-width) shrink-0 space-y-(--page-gap-y) bg-(--page-primary-color)/90 px-(--page-margin-x) py-(--page-gap-y) text-(--page-background-color)"
						style={
							{
								"--page-primary-color": "var(--page-background-color)",
							} as React.CSSProperties
						}
					>
						{/* Photo in sidebar on first page */}
						{isFirstPage && (
							<div className="flex justify-center pb-1">
								<PagePicture />
							</div>
						)}

						{/* Contact info in sidebar */}
						{isFirstPage && <SidebarContact />}

						{sidebar.map((section) => {
							const Component = getSectionComponent(section, { sectionClassName: sidebarSectionClassName });
							return <Component key={section} id={section} />;
						})}
					</aside>
				)}

				{/* Main Content - Light background */}
				<main
					data-layout="main"
					className="group page-main flex-1 space-y-(--page-gap-y) px-(--page-margin-x) py-(--page-gap-y)"
				>
					{main.map((section) => {
						const Component = getSectionComponent(section, { sectionClassName: mainSectionClassName });
						return <Component key={section} id={section} />;
					})}
				</main>
			</div>
		</div>
	);
});

function Header() {
	const basics = useResumeStore((state) => state.resume.data.basics);

	return (
		<div className="page-header bg-(--page-primary-color)/90 px-(--page-margin-x) py-(--page-margin-y) text-(--page-background-color)">
			{/* Name - Large, bold, light text */}
			<h2 className="basics-name font-extrabold text-3xl uppercase tracking-wider">{basics.name}</h2>

			{/* Headline */}
			{basics.headline && (
				<p className="basics-headline mt-1 font-light text-base tracking-wider opacity-85">{basics.headline}</p>
			)}

			{/* Accent underline */}
			<div className="mt-2 h-1 w-16 rounded-full bg-(--page-background-color)/50" />
		</div>
	);
}

function SidebarContact() {
	const basics = useResumeStore((state) => state.resume.data.basics);

	// Military service status labels (French)
	const militaryServiceLabels: Record<string, string> = {
		"not-applicable": "Non applicable",
		completed: "Effectue",
		exempted: "Dispense",
		pending: "En attente",
		"in-service": "En cours",
	};

	const hasMoroccoFields =
		basics.cin ||
		basics.dateOfBirth ||
		basics.nationality ||
		basics.maritalStatus ||
		(basics.militaryServiceStatus && basics.militaryServiceStatus !== "not-applicable");

	return (
		<div className="space-y-3 border-(--page-background-color)/20 border-b pb-3">
			{/* Section Label */}
			<div className="border-(--page-background-color)/30 border-b pb-1.5 font-semibold text-(--page-background-color) text-sm uppercase tracking-wider">
				Contact
			</div>

			{/* Contact items - Icon-text pairs */}
			<div className="space-y-2 text-sm">
				{basics.email && (
					<div className="basics-item-email flex items-center gap-x-2">
						<EnvelopeIcon className="size-3.5 shrink-0 opacity-70" />
						<PageLink url={`mailto:${basics.email}`} label={basics.email} />
					</div>
				)}

				{basics.phone && (
					<div className="basics-item-phone flex items-center gap-x-2">
						<PhoneIcon className="size-3.5 shrink-0 opacity-70" />
						<PageLink url={`tel:${basics.phone}`} label={basics.phone} />
					</div>
				)}

				{basics.location && (
					<div className="basics-item-location flex items-center gap-x-2">
						<MapPinIcon className="size-3.5 shrink-0 opacity-70" />
						<span>{basics.location}</span>
					</div>
				)}

				{basics.website.url && (
					<div className="basics-item-website flex items-center gap-x-2">
						<GlobeIcon className="size-3.5 shrink-0 opacity-70" />
						<PageLink {...basics.website} />
					</div>
				)}
			</div>

			{/* Morocco fields in sidebar with icon-text pairs */}
			{hasMoroccoFields && (
				<div className="basics-morocco space-y-1.5 border-(--page-background-color)/20 border-t pt-2 text-xs">
					{basics.cin && (
						<div className="basics-item-cin flex items-center gap-x-2">
							<IdentificationCardIcon className="size-3 shrink-0 opacity-60" />
							<span>CIN: {basics.cin}</span>
						</div>
					)}

					{basics.dateOfBirth && (
						<div className="basics-item-dob flex items-center gap-x-2">
							<CalendarIcon className="size-3 shrink-0 opacity-60" />
							<span>Ne(e) le: {basics.dateOfBirth}</span>
						</div>
					)}

					{basics.nationality && (
						<div className="basics-item-nationality flex items-center gap-x-2">
							<FlagIcon className="size-3 shrink-0 opacity-60" />
							<span>{basics.nationality}</span>
						</div>
					)}

					{basics.maritalStatus && (
						<div className="basics-item-marital flex items-center gap-x-2">
							<UsersIcon className="size-3 shrink-0 opacity-60" />
							<span>{basics.maritalStatus}</span>
						</div>
					)}

					{basics.militaryServiceStatus && basics.militaryServiceStatus !== "not-applicable" && (
						<div className="basics-item-military flex items-center gap-x-2">
							<ShieldCheckIcon className="size-3 shrink-0 opacity-60" />
							<span>Service militaire: {militaryServiceLabels[basics.militaryServiceStatus]}</span>
						</div>
					)}
				</div>
			)}

			{/* Custom Fields */}
			{basics.customFields.length > 0 && (
				<div className="basics-custom space-y-1.5 border-(--page-background-color)/20 border-t pt-2 text-xs">
					{basics.customFields.map((field) => (
						<div key={field.id} className="basics-item-custom flex items-center gap-x-2">
							<PageIcon icon={field.icon} />
							{field.link ? <PageLink url={field.link} label={field.text} /> : <span>{field.text}</span>}
						</div>
					))}
				</div>
			)}
		</div>
	);
}
