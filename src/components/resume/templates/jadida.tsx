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
	// Section Heading - Medium weight with primary color left bar (3px)
	"[&>h6]:font-medium [&>h6]:text-sm [&>h6]:tracking-wide",
	"[&>h6]:mb-3 [&>h6]:border-(--page-primary-color) [&>h6]:border-l-3 [&>h6]:pl-2.5",

	// Section Item Header in Sidebar Layout
	"group-data-[layout=sidebar]:[&_.section-item-header>div]:flex-col",
	"group-data-[layout=sidebar]:[&_.section-item-header>div]:items-start",
);

/**
 * Template: Jadida
 * Clean modern professional - the most versatile template
 * Two-column with RIGHT sidebar, balanced proportions
 * Subtle gradient underline on name using primary color
 * Tags: Modern, Professional, Versatile, Clean
 */
export const JadidaTemplate = memo(function JadidaTemplate({ pageIndex, pageLayout }: TemplateProps) {
	const isFirstPage = pageIndex === 0;
	const { main, sidebar, fullWidth } = pageLayout;

	return (
		<div className="template-jadida page-content px-(--page-margin-x) pt-(--page-margin-y) print:p-0">
			{isFirstPage && <Header />}

			<div className={cn("mt-(--page-gap-y)", !fullWidth && "flex gap-x-(--page-gap-x)")}>
				{/* Main Content - Left side */}
				<main data-layout="main" className={cn("group page-main space-y-(--page-gap-y)", !fullWidth && "flex-1")}>
					{main.map((section) => {
						const Component = getSectionComponent(section, { sectionClassName });
						return <Component key={section} id={section} />;
					})}
				</main>

				{/* Right Sidebar - Light gray background */}
				{!fullWidth && (
					<aside
						data-layout="sidebar"
						className="group page-sidebar w-(--page-sidebar-width) shrink-0 space-y-(--page-gap-y) rounded-sm bg-[#f8f9fa] p-(--page-gap-x)"
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
			<div className="flex items-start gap-x-(--page-gap-x)">
				{/* Name and Info */}
				<div className="page-basics flex-1">
					{/* Name with gradient underline */}
					<div className="mb-3">
						<h2 className="basics-name font-semibold text-3xl tracking-tight">{basics.name}</h2>
						<div
							className="mt-1 h-0.5 w-24"
							style={{
								background: `linear-gradient(to right, var(--page-primary-color), transparent)`,
							}}
						/>
					</div>

					{/* Headline */}
					{basics.headline && (
						<p className="basics-headline mb-3 font-medium text-(--page-primary-color) text-sm tracking-wide">
							{basics.headline}
						</p>
					)}

					{/* Contact row with icons */}
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

					{/* Morocco-specific fields in a neat row with icons */}
					{(basics.cin ||
						basics.dateOfBirth ||
						basics.nationality ||
						basics.maritalStatus ||
						basics.militaryServiceStatus !== "not-applicable") && (
						<div className="basics-morocco mt-2 flex flex-wrap gap-x-4 gap-y-1 border-(--page-primary-color)/15 border-t pt-2 text-xs *:flex *:items-center *:gap-x-1.5">
							{basics.cin && (
								<div className="basics-item-cin">
									<IdentificationCardIcon className="size-3.5 text-(--page-primary-color)" />
									<span>CIN: {basics.cin}</span>
								</div>
							)}

							{basics.dateOfBirth && (
								<div className="basics-item-dob">
									<CalendarIcon className="size-3.5 text-(--page-primary-color)" />
									<span>Ne(e) le: {basics.dateOfBirth}</span>
								</div>
							)}

							{basics.nationality && (
								<div className="basics-item-nationality">
									<FlagIcon className="size-3.5 text-(--page-primary-color)" />
									<span>{basics.nationality}</span>
								</div>
							)}

							{basics.maritalStatus && (
								<div className="basics-item-marital">
									<UsersIcon className="size-3.5 text-(--page-primary-color)" />
									<span>{basics.maritalStatus}</span>
								</div>
							)}

							{basics.militaryServiceStatus && basics.militaryServiceStatus !== "not-applicable" && (
								<div className="basics-item-military">
									<ShieldCheckIcon className="size-3.5 text-(--page-primary-color)" />
									<span>Service militaire: {militaryServiceLabels[basics.militaryServiceStatus]}</span>
								</div>
							)}
						</div>
					)}

					{/* Custom Fields */}
					{basics.customFields.length > 0 && (
						<div className="basics-custom mt-2 flex flex-wrap gap-x-3 gap-y-0.5 text-sm *:flex *:items-center *:gap-x-1.5">
							{basics.customFields.map((field) => (
								<div key={field.id} className="basics-item-custom">
									<PageIcon icon={field.icon} />
									{field.link ? <PageLink url={field.link} label={field.text} /> : <span>{field.text}</span>}
								</div>
							))}
						</div>
					)}
				</div>

				{/* Photo */}
				<PagePicture />
			</div>
		</div>
	);
}
