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
	// Section Heading - Corporate modern with bold uppercase and primary color underline
	"[&>h6]:font-bold [&>h6]:text-sm [&>h6]:uppercase [&>h6]:tracking-wider",
	"[&>h6]:mb-3 [&>h6]:border-(--page-primary-color) [&>h6]:border-b-2 [&>h6]:pb-1.5",

	// Section Item Header in Sidebar Layout
	"group-data-[layout=sidebar]:[&_.section-item-header>div]:flex-col",
	"group-data-[layout=sidebar]:[&_.section-item-header>div]:items-start",
);

/**
 * Template: Casablanca
 * Modern corporate design inspired by Morocco's economic capital
 * Clean lines, professional blue tones, two-column with left sidebar
 * Tags: Corporate, Modern, Professional
 */
export const CasablancaTemplate = memo(function CasablancaTemplate({ pageIndex, pageLayout }: TemplateProps) {
	const isFirstPage = pageIndex === 0;
	const { main, sidebar, fullWidth } = pageLayout;

	return (
		<div className="template-casablanca page-content">
			{/* Full-width header band */}
			{isFirstPage && <Header />}

			<div className="flex">
				{/* Left Sidebar */}
				{!fullWidth && (
					<aside
						data-layout="sidebar"
						className="group page-sidebar w-(--page-sidebar-width) shrink-0 space-y-(--page-gap-y) bg-(--page-primary-color)/5 px-(--page-margin-x) py-(--page-gap-y)"
					>
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
		<div className="page-header bg-(--page-primary-color) px-(--page-margin-x) py-(--page-margin-y) text-(--page-background-color)">
			{/* Top Row: Name and Headline */}
			<div className="mb-3">
				<h2 className="basics-name font-bold text-3xl tracking-wide">{basics.name}</h2>
				{basics.headline && (
					<p className="basics-headline mt-1 font-light text-lg tracking-wider opacity-90">{basics.headline}</p>
				)}
			</div>

			{/* Contact and Photo Row */}
			<div className="flex items-end justify-between gap-x-(--page-gap-x)">
				<div className="flex-1 space-y-2">
					{/* Contact Information */}
					<div
						className="basics-items flex flex-wrap gap-x-4 gap-y-1 *:flex *:items-center *:gap-x-1.5"
						style={{ "--page-primary-color": "var(--page-background-color)" } as React.CSSProperties}
					>
						{basics.email && (
							<div className="basics-item-email">
								<EnvelopeIcon className="size-4" />
								<PageLink url={`mailto:${basics.email}`} label={basics.email} />
							</div>
						)}

						{basics.phone && (
							<div className="basics-item-phone">
								<PhoneIcon className="size-4" />
								<PageLink url={`tel:${basics.phone}`} label={basics.phone} />
							</div>
						)}

						{basics.location && (
							<div className="basics-item-location">
								<MapPinIcon className="size-4" />
								<span>{basics.location}</span>
							</div>
						)}

						{basics.website.url && (
							<div className="basics-item-website">
								<GlobeIcon className="size-4" />
								<PageLink {...basics.website} />
							</div>
						)}
					</div>

					{/* Morocco-Specific Fields - Grid below contact */}
					{(basics.cin ||
						basics.dateOfBirth ||
						basics.nationality ||
						basics.maritalStatus ||
						basics.militaryServiceStatus !== "not-applicable") && (
						<div className="basics-morocco grid grid-cols-2 gap-x-4 gap-y-1 border-(--page-background-color)/30 border-t pt-2 text-sm opacity-90 xl:grid-cols-3">
							{basics.cin && (
								<div className="basics-item-cin flex items-center gap-x-1.5">
									<IdentificationCardIcon className="size-3.5" />
									<span>CIN: {basics.cin}</span>
								</div>
							)}

							{basics.dateOfBirth && (
								<div className="basics-item-dob flex items-center gap-x-1.5">
									<CalendarIcon className="size-3.5" />
									<span>Ne(e) le: {basics.dateOfBirth}</span>
								</div>
							)}

							{basics.nationality && (
								<div className="basics-item-nationality flex items-center gap-x-1.5">
									<FlagIcon className="size-3.5" />
									<span>{basics.nationality}</span>
								</div>
							)}

							{basics.maritalStatus && (
								<div className="basics-item-marital flex items-center gap-x-1.5">
									<UsersIcon className="size-3.5" />
									<span>{basics.maritalStatus}</span>
								</div>
							)}

							{basics.militaryServiceStatus && basics.militaryServiceStatus !== "not-applicable" && (
								<div className="basics-item-military flex items-center gap-x-1.5">
									<ShieldCheckIcon className="size-3.5" />
									<span>Service militaire: {militaryServiceLabels[basics.militaryServiceStatus]}</span>
								</div>
							)}
						</div>
					)}

					{/* Custom Fields */}
					{basics.customFields.length > 0 && (
						<div
							className="basics-custom flex flex-wrap gap-x-3 gap-y-0.5 *:flex *:items-center *:gap-x-1.5"
							style={{ "--page-primary-color": "var(--page-background-color)" } as React.CSSProperties}
						>
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
