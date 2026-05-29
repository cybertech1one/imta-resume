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
	// Section Heading - Artistic blue style with decorative dots
	"[&>h6]:font-semibold [&>h6]:text-sm [&>h6]:uppercase [&>h6]:tracking-widest",
	"[&>h6]:mb-3 [&>h6]:text-(--page-primary-color)",
	// Decorative dots before heading text via pseudo-element simulation
	"[&>h6]:flex [&>h6]:items-center [&>h6]:gap-x-2",
	"[&>h6]:before:inline-block [&>h6]:before:size-1.5 [&>h6]:before:rounded-full [&>h6]:before:bg-(--page-primary-color)",
	"[&>h6]:after:inline-block [&>h6]:after:size-1 [&>h6]:after:rounded-full [&>h6]:after:bg-(--page-primary-color)/40",

	// Section Item Header in Sidebar Layout
	"group-data-[layout=sidebar]:[&_.section-item-header>div]:flex-col",
	"group-data-[layout=sidebar]:[&_.section-item-header>div]:items-start",
);

/**
 * Template: Chefchaouen
 * Inspired by the blue city of Morocco - artistic, elegant, blue-toned
 * Two-column layout with right sidebar featuring blue-tinted background
 * Section headings with decorative dots, diamond ornament horizontal rules
 * Tags: Artistic, Blue, Creative
 */
export const ChefchaouenTemplate = memo(function ChefchaouenTemplate({ pageIndex, pageLayout }: TemplateProps) {
	const isFirstPage = pageIndex === 0;
	const { main, sidebar, fullWidth } = pageLayout;

	return (
		<div className="template-chefchaouen page-content">
			{isFirstPage && <Header />}

			<div className="flex">
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

				{/* Right Sidebar with blue-tinted background */}
				{!fullWidth && (
					<aside
						data-layout="sidebar"
						className="group page-sidebar w-(--page-sidebar-width) shrink-0 space-y-(--page-gap-y) bg-(--page-primary-color)/8 px-(--page-margin-x) py-(--page-gap-y)"
					>
						{/* Photo in sidebar with slight rounding */}
						{isFirstPage && (
							<div className="flex justify-center pb-2">
								<PagePicture className="rounded-lg" />
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
			{/* Name - Large, thin, artistic */}
			<div className="mb-1 text-center">
				<h2 className="basics-name font-light text-(--page-primary-color) text-3xl uppercase tracking-[0.3em]">
					{basics.name}
				</h2>
			</div>

			{/* Diamond ornament horizontal rule */}
			<div className="my-3 flex items-center gap-x-3">
				<div className="h-px flex-1 bg-(--page-primary-color)/30" />
				<div className="size-2 rotate-45 bg-(--page-primary-color)" />
				<div className="size-1.5 rotate-45 border border-(--page-primary-color)/60" />
				<div className="size-2 rotate-45 bg-(--page-primary-color)" />
				<div className="h-px flex-1 bg-(--page-primary-color)/30" />
			</div>

			{/* Headline */}
			{basics.headline && (
				<p className="basics-headline mb-3 text-center font-medium text-(--page-primary-color)/80 text-sm tracking-wider">
					{basics.headline}
				</p>
			)}

			{/* Contact Information Row */}
			<div className="basics-items mb-2 flex flex-wrap items-center justify-center gap-x-5 gap-y-1 text-sm *:flex *:items-center *:gap-x-1.5">
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

			{/* Morocco-Specific Fields with thin dividers */}
			{(basics.cin ||
				basics.dateOfBirth ||
				basics.nationality ||
				basics.maritalStatus ||
				(basics.militaryServiceStatus && basics.militaryServiceStatus !== "not-applicable")) && (
				<div className="basics-morocco flex flex-wrap items-center justify-center gap-y-1 border-(--page-primary-color)/15 border-t pt-2 text-(--page-text-color)/70 text-xs">
					{basics.cin && (
						<>
							<div className="basics-item-cin flex items-center gap-x-1.5 px-3">
								<IdentificationCardIcon className="size-3 text-(--page-primary-color)/60" />
								<span>CIN: {basics.cin}</span>
							</div>
							<span className="text-(--page-primary-color)/30">|</span>
						</>
					)}

					{basics.dateOfBirth && (
						<>
							<div className="basics-item-dob flex items-center gap-x-1.5 px-3">
								<CalendarIcon className="size-3 text-(--page-primary-color)/60" />
								<span>Ne(e) le: {basics.dateOfBirth}</span>
							</div>
							<span className="text-(--page-primary-color)/30">|</span>
						</>
					)}

					{basics.nationality && (
						<>
							<div className="basics-item-nationality flex items-center gap-x-1.5 px-3">
								<FlagIcon className="size-3 text-(--page-primary-color)/60" />
								<span>{basics.nationality}</span>
							</div>
							<span className="text-(--page-primary-color)/30">|</span>
						</>
					)}

					{basics.maritalStatus && (
						<div className="basics-item-marital flex items-center gap-x-1.5 px-3">
							<UsersIcon className="size-3 text-(--page-primary-color)/60" />
							<span>{basics.maritalStatus}</span>
						</div>
					)}

					{basics.militaryServiceStatus && basics.militaryServiceStatus !== "not-applicable" && (
						<>
							<span className="text-(--page-primary-color)/30">|</span>
							<div className="basics-item-military flex items-center gap-x-1.5 px-3">
								<ShieldCheckIcon className="size-3 text-(--page-primary-color)/60" />
								<span>Service militaire: {militaryServiceLabels[basics.militaryServiceStatus]}</span>
							</div>
						</>
					)}
				</div>
			)}

			{/* Custom Fields */}
			{basics.customFields.length > 0 && (
				<div className="basics-custom mt-1.5 flex flex-wrap items-center justify-center gap-x-4 gap-y-0.5 text-xs *:flex *:items-center *:gap-x-1.5">
					{basics.customFields.map((field) => (
						<div key={field.id} className="basics-item-custom">
							<PageIcon icon={field.icon} />
							{field.link ? <PageLink url={field.link} label={field.text} /> : <span>{field.text}</span>}
						</div>
					))}
				</div>
			)}

			{/* Bottom decorative line */}
			<div className="mt-3 h-0.5 bg-gradient-to-r from-transparent via-(--page-primary-color)/40 to-transparent" />
		</div>
	);
}
