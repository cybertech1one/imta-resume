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
	// Section Heading - Creative with left border accent (4px primary color)
	"[&>h6]:border-(--page-primary-color) [&>h6]:border-l-4 [&>h6]:pl-2.5 [&>h6]:font-bold [&>h6]:text-sm",
	"[&>h6]:mb-3 [&>h6]:text-(--page-primary-color)",

	// Section Item Header in Sidebar Layout
	"group-data-[layout=sidebar]:[&_.section-item-header>div]:flex-col",
	"group-data-[layout=sidebar]:[&_.section-item-header>div]:items-start",
);

/**
 * Template: Marrakech
 * Vibrant, warm, creative design inspired by the Red City
 * Two-column with LEFT sidebar with warm accent background
 * Tags: Creative, Vibrant, Warm
 */
export const MarrakechTemplate = memo(function MarrakechTemplate({ pageIndex, pageLayout }: TemplateProps) {
	const isFirstPage = pageIndex === 0;
	const { main, sidebar, fullWidth } = pageLayout;

	return (
		<div className="template-marrakech page-content">
			{/* Full-width header with decorative border */}
			{isFirstPage && <Header />}

			<div className="flex">
				{/* Left Sidebar with warm accent background */}
				{!fullWidth && (
					<aside
						data-layout="sidebar"
						className="group page-sidebar w-(--page-sidebar-width) shrink-0 space-y-(--page-gap-y) bg-(--page-primary-color)/10 px-(--page-margin-x) py-(--page-gap-y)"
					>
						{/* Photo in sidebar, rounded */}
						{isFirstPage && (
							<div className="flex justify-center">
								<PagePicture />
							</div>
						)}

						{sidebar.map((section) => {
							const Component = getSectionComponent(section, { sectionClassName });
							return <Component key={section} id={section} />;
						})}
					</aside>
				)}

				{/* Main Content */}
				<main
					data-layout="main"
					className="group page-main flex-1 space-y-(--page-gap-y) px-(--page-margin-x) py-(--page-gap-y)"
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
		<div className="page-header px-(--page-margin-x) pt-(--page-margin-y)">
			{/* Name with decorative bottom border */}
			<div className="border-(--page-primary-color) border-b-4 pb-2">
				<h2 className="basics-name font-extrabold text-(--page-primary-color) text-3xl tracking-tight">
					{basics.name}
				</h2>
				{basics.headline && (
					<p className="basics-headline mt-0.5 font-medium text-base tracking-wide opacity-80">{basics.headline}</p>
				)}
			</div>

			{/* Contact + Morocco fields row */}
			<div className="mt-2 flex flex-wrap items-start justify-between gap-x-(--page-gap-x)">
				{/* Contact Information */}
				<div className="basics-items flex flex-wrap gap-x-4 gap-y-1 text-sm *:flex *:items-center *:gap-x-1.5">
					{basics.email && (
						<div className="basics-item-email">
							<EnvelopeIcon className="size-4 text-(--page-primary-color)" />
							<PageLink url={`mailto:${basics.email}`} label={basics.email} />
						</div>
					)}

					{basics.phone && (
						<div className="basics-item-phone">
							<PhoneIcon className="size-4 text-(--page-primary-color)" />
							<PageLink url={`tel:${basics.phone}`} label={basics.phone} />
						</div>
					)}

					{basics.location && (
						<div className="basics-item-location">
							<MapPinIcon className="size-4 text-(--page-primary-color)" />
							<span>{basics.location}</span>
						</div>
					)}

					{basics.website.url && (
						<div className="basics-item-website">
							<GlobeIcon className="size-4 text-(--page-primary-color)" />
							<PageLink {...basics.website} />
						</div>
					)}
				</div>

				{/* Custom Fields */}
				{basics.customFields.length > 0 && (
					<div className="basics-custom flex flex-wrap gap-x-3 gap-y-0.5 text-sm *:flex *:items-center *:gap-x-1.5">
						{basics.customFields.map((field) => (
							<div key={field.id} className="basics-item-custom">
								<PageIcon icon={field.icon} />
								{field.link ? <PageLink url={field.link} label={field.text} /> : <span>{field.text}</span>}
							</div>
						))}
					</div>
				)}
			</div>

			{/* Morocco-Specific Fields - Small text below header */}
			{(basics.cin ||
				basics.dateOfBirth ||
				basics.nationality ||
				basics.maritalStatus ||
				basics.militaryServiceStatus !== "not-applicable") && (
				<div className="basics-morocco mt-1.5 flex flex-wrap gap-x-3 gap-y-0.5 text-xs opacity-70">
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
				</div>
			)}
		</div>
	);
}
