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
	// Section Heading - Small caps with thin primary color underline, elegant
	"[&>h6]:font-semibold [&>h6]:text-xs [&>h6]:uppercase [&>h6]:tracking-[0.15em]",
	"[&>h6]:mb-3 [&>h6]:border-(--page-primary-color)/50 [&>h6]:border-b [&>h6]:pb-1",
	"[&>h6]:text-(--page-primary-color)",

	// Section Item Header in Sidebar Layout
	"group-data-[layout=sidebar]:[&_.section-item-header>div]:flex-col",
	"group-data-[layout=sidebar]:[&_.section-item-header>div]:items-start",
);

/**
 * Template: Meknes
 * Traditional elegant Moroccan style inspired by the Imperial City
 * Two-column with right sidebar, distinguished double-line borders
 * Tags: Traditional, Elegant, Classic
 */
export const MeknesTemplate = memo(function MeknesTemplate({ pageIndex, pageLayout }: TemplateProps) {
	const isFirstPage = pageIndex === 0;
	const { main, sidebar, fullWidth } = pageLayout;

	return (
		<div className="template-meknes page-content px-(--page-margin-x) pt-(--page-margin-y) print:p-0">
			{isFirstPage && <Header />}

			<div className={cn("mt-(--page-gap-y)", !fullWidth && "flex gap-x-(--page-gap-x)")}>
				{/* Main Content */}
				<main data-layout="main" className={cn("group page-main space-y-(--page-gap-y)", !fullWidth && "flex-1")}>
					{main.map((section) => {
						const Component = getSectionComponent(section, { sectionClassName });
						return <Component key={section} id={section} />;
					})}
				</main>

				{/* Right Sidebar with subtle dotted left border */}
				{!fullWidth && (
					<aside
						data-layout="sidebar"
						className="group page-sidebar w-(--page-sidebar-width) shrink-0 space-y-(--page-gap-y) border-(--page-primary-color)/30 border-l border-dotted pl-(--page-gap-x)"
					>
						{/* Photo at top of sidebar */}
						{isFirstPage && (
							<div className="flex justify-center pb-2">
								<PagePicture />
							</div>
						)}

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

	// Military service status labels (French - traditional formal)
	const militaryServiceLabels: Record<string, string> = {
		"not-applicable": "Non applicable",
		completed: "Effectue",
		exempted: "Dispense",
		pending: "En attente",
		"in-service": "En cours",
	};

	return (
		<div className="page-header pb-(--page-gap-y)">
			{/* Distinguished double-line border top */}
			<div className="mb-1 border-(--page-primary-color)/60 border-t-2" />
			<div className="mb-4 border-(--page-primary-color)/30 border-t" />

			{/* Name and Headline */}
			<div className="text-center">
				<h2 className="basics-name font-bold text-(--page-primary-color) text-2xl tracking-wider">{basics.name}</h2>
				{basics.headline && (
					<p className="basics-headline mt-1 font-medium text-sm italic tracking-wide opacity-75">{basics.headline}</p>
				)}
			</div>

			{/* Elegant thin separator */}
			<div className="mx-auto my-3 w-24 border-(--page-primary-color)/40 border-t" />

			{/* Contact Information */}
			<div className="basics-items flex flex-wrap items-center justify-center gap-x-5 gap-y-1 text-sm *:flex *:items-center *:gap-x-1.5">
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

			{/* Morocco-Specific Fields - Dedicated "Informations Personnelles" section */}
			{(basics.cin ||
				basics.dateOfBirth ||
				basics.nationality ||
				basics.maritalStatus ||
				basics.militaryServiceStatus !== "not-applicable") && (
				<div className="basics-morocco mt-4">
					<h6 className="mb-2 text-center font-semibold text-(--page-primary-color) text-xs uppercase tracking-[0.15em]">
						Informations Personnelles
					</h6>
					<div className="mx-auto max-w-md border-(--page-primary-color)/20 border-t pt-2">
						<div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-sm">
							{basics.cin && (
								<div className="basics-item-cin flex items-center gap-x-2">
									<IdentificationCardIcon className="size-3.5 shrink-0 text-(--page-primary-color)" />
									<span>
										<strong className="font-semibold">CIN:</strong> {basics.cin}
									</span>
								</div>
							)}

							{basics.dateOfBirth && (
								<div className="basics-item-dob flex items-center gap-x-2">
									<CalendarIcon className="size-3.5 shrink-0 text-(--page-primary-color)" />
									<span>
										<strong className="font-semibold">Date de naissance:</strong> {basics.dateOfBirth}
									</span>
								</div>
							)}

							{basics.nationality && (
								<div className="basics-item-nationality flex items-center gap-x-2">
									<FlagIcon className="size-3.5 shrink-0 text-(--page-primary-color)" />
									<span>
										<strong className="font-semibold">Nationalite:</strong> {basics.nationality}
									</span>
								</div>
							)}

							{basics.maritalStatus && (
								<div className="basics-item-marital flex items-center gap-x-2">
									<UsersIcon className="size-3.5 shrink-0 text-(--page-primary-color)" />
									<span>
										<strong className="font-semibold">Situation familiale:</strong> {basics.maritalStatus}
									</span>
								</div>
							)}

							{basics.militaryServiceStatus && basics.militaryServiceStatus !== "not-applicable" && (
								<div className="basics-item-military col-span-2 flex items-center gap-x-2">
									<ShieldCheckIcon className="size-3.5 shrink-0 text-(--page-primary-color)" />
									<span>
										<strong className="font-semibold">Service militaire:</strong>{" "}
										{militaryServiceLabels[basics.militaryServiceStatus]}
									</span>
								</div>
							)}
						</div>
					</div>
				</div>
			)}

			{/* Custom Fields */}
			{basics.customFields.length > 0 && (
				<div className="basics-custom mt-2 flex flex-wrap justify-center gap-x-4 gap-y-1 text-sm *:flex *:items-center *:gap-x-1.5">
					{basics.customFields.map((field) => (
						<div key={field.id} className="basics-item-custom">
							<PageIcon icon={field.icon} />
							{field.link ? <PageLink url={field.link} label={field.text} /> : <span>{field.text}</span>}
						</div>
					))}
				</div>
			)}

			{/* Distinguished double-line border bottom */}
			<div className="mt-4 border-(--page-primary-color)/30 border-b" />
			<div className="mt-1 border-(--page-primary-color)/60 border-b-2" />
		</div>
	);
}
